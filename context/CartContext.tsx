'use client';

import React, { createContext, useContext, useReducer, useEffect, useState, ReactNode, useMemo } from 'react';
import { CartItem, CartItemWithProduct, Product, Fabric } from '@/types';

interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: { productId: string; selectedFabric: string; selectedLining?: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: string; selectedFabric: string; selectedLining?: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'TOGGLE_CART' }
  | { type: 'SET_CART_OPEN'; payload: boolean }
  | { type: 'LOAD_CART'; payload: CartItem[] };

interface CartContextType {
  items: CartItem[];
  itemsWithProducts: CartItemWithProduct[];
  isOpen: boolean;
  totalItems: number;
  totalPrice: number;
  isLoading: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, selectedFabric: string, selectedLining?: string) => void;
  updateQuantity: (productId: string, selectedFabric: string, selectedLining: string | undefined, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  setCartOpen: (isOpen: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingIndex = state.items.findIndex(
        (item) =>
          item.productId === action.payload.productId &&
          item.selectedFabric === action.payload.selectedFabric &&
          item.selectedLining === action.payload.selectedLining
      );

      if (existingIndex > -1) {
        const newItems = [...state.items];
        newItems[existingIndex] = {
          ...newItems[existingIndex],
          quantity: newItems[existingIndex].quantity + action.payload.quantity,
        };
        return { ...state, items: newItems };
      }

      return { ...state, items: [...state.items, action.payload] };
    }

    case 'REMOVE_ITEM': {
      return {
        ...state,
        items: state.items.filter(
          (item) =>
            !(
              item.productId === action.payload.productId &&
              item.selectedFabric === action.payload.selectedFabric &&
              item.selectedLining === action.payload.selectedLining
            )
        ),
      };
    }

    case 'UPDATE_QUANTITY': {
      if (action.payload.quantity <= 0) {
        return {
          ...state,
          items: state.items.filter(
            (item) =>
              !(
                item.productId === action.payload.productId &&
                item.selectedFabric === action.payload.selectedFabric &&
                item.selectedLining === action.payload.selectedLining
              )
          ),
        };
      }

      return {
        ...state,
        items: state.items.map((item) =>
          item.productId === action.payload.productId &&
          item.selectedFabric === action.payload.selectedFabric &&
          item.selectedLining === action.payload.selectedLining
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };
    }

    case 'CLEAR_CART':
      return { ...state, items: [] };

    case 'TOGGLE_CART':
      return { ...state, isOpen: !state.isOpen };

    case 'SET_CART_OPEN':
      return { ...state, isOpen: action.payload };

    case 'LOAD_CART':
      return { ...state, items: action.payload };

    default:
      return state;
  }
}

const CART_STORAGE_KEY = 'nonito-cart';
const PRODUCTS_CACHE_KEY = 'nonito-products-cache';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface ProductsCache {
  products: Product[];
  fabrics: { outer: Fabric[]; inner: Fabric[] };
  timestamp: number;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    isOpen: false,
  });
  
  // Products and fabrics state (fetched from Stripe via API)
  const [products, setProducts] = useState<Product[]>([]);
  const [fabrics, setFabrics] = useState<{ outer: Fabric[]; inner: Fabric[] }>({ outer: [], inner: [] });
  const [isLoading, setIsLoading] = useState(true);

  // Fetch products from API on mount
  useEffect(() => {
    async function fetchProducts() {
      try {
        // Check localStorage cache first
        const cached = localStorage.getItem(PRODUCTS_CACHE_KEY);
        if (cached) {
          const parsedCache: ProductsCache = JSON.parse(cached);
          const isValid = Date.now() - parsedCache.timestamp < CACHE_TTL;
          if (isValid && parsedCache.products.length > 0) {
            setProducts(parsedCache.products);
            setFabrics(parsedCache.fabrics);
            setIsLoading(false);
            // Still fetch fresh data in background
            fetchFromAPI(false);
            return;
          }
        }
        
        await fetchFromAPI(true);
      } catch (error) {
        console.error('Failed to fetch products:', error);
        setIsLoading(false);
      }
    }

    async function fetchFromAPI(showLoading: boolean) {
      if (showLoading) setIsLoading(true);
      try {
        const response = await fetch('/api/products');
        if (!response.ok) throw new Error('Failed to fetch products');
        
        const data = await response.json();
        if (data.success) {
          setProducts(data.products);
          setFabrics(data.fabrics);
          
          // Cache in localStorage
          const cache: ProductsCache = {
            products: data.products,
            fabrics: data.fabrics,
            timestamp: Date.now(),
          };
          localStorage.setItem(PRODUCTS_CACHE_KEY, JSON.stringify(cache));
        }
      } catch (error) {
        console.error('Error fetching products from API:', error);
      } finally {
        if (showLoading) setIsLoading(false);
      }
    }

    fetchProducts();
  }, []);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (savedCart) {
      try {
        const items = JSON.parse(savedCart);
        // Validate that items is an array with proper structure
        if (Array.isArray(items)) {
          const validItems = items.filter((item): item is CartItem => 
            item &&
            typeof item === 'object' &&
            typeof item.productId === 'string' &&
            typeof item.selectedFabric === 'string' &&
            typeof item.quantity === 'number' &&
            item.quantity > 0
          );
          dispatch({ type: 'LOAD_CART', payload: validItems });
        }
      } catch (e) {
        console.error('Failed to load cart from storage:', e);
        // Clear corrupted cart data
        localStorage.removeItem(CART_STORAGE_KEY);
      }
    }
  }, []);

  // Clean up invalid cart items once products are loaded
  useEffect(() => {
    if (!isLoading && products.length > 0 && state.items.length > 0) {
      // Filter out items that reference non-existent products or fabrics
      const validItems = state.items.filter(item => {
        const product = products.find(p => p.id === item.productId || p.slug === item.productId);
        const fabric = [...fabrics.outer, ...fabrics.inner].find(f => f.id === item.selectedFabric);
        return product && fabric;
      });
      
      // If some items were invalid, update the cart
      if (validItems.length !== state.items.length) {
        console.log(`Cleaned up ${state.items.length - validItems.length} invalid cart items`);
        dispatch({ type: 'LOAD_CART', payload: validItems });
      }
    }
  }, [isLoading, products, fabrics, state.items]);

  // Save cart to localStorage when items change
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.items));
  }, [state.items]);

  // Helper functions using fetched data
  const getProductById = (id: string): Product | undefined => {
    return products.find(p => p.id === id || p.slug === id);
  };

  const getFabricById = (id: string): Fabric | undefined => {
    return [...fabrics.outer, ...fabrics.inner].find(f => f.id === id);
  };

  // Memoize items with products to avoid recalculating on every render
  const itemsWithProducts: CartItemWithProduct[] = useMemo(() => {
    return state.items
      .map((item: CartItem) => {
        const product = getProductById(item.productId);
        const fabricDetails = getFabricById(item.selectedFabric);
        const liningDetails = item.selectedLining ? getFabricById(item.selectedLining) : undefined;

        if (!product || !fabricDetails) return null;

        return {
          ...item,
          product,
          fabricDetails,
          liningDetails,
        } as CartItemWithProduct;
      })
      .filter((item): item is CartItemWithProduct => item !== null);
  }, [state.items, products, fabrics]);

  // Calculate total items from itemsWithProducts to ensure consistency
  // This prevents showing incorrect count when products haven't loaded or items are invalid
  const totalItems = itemsWithProducts.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = itemsWithProducts.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const addItem = (item: CartItem) => dispatch({ type: 'ADD_ITEM', payload: item });
  const removeItem = (productId: string, selectedFabric: string, selectedLining?: string) =>
    dispatch({ type: 'REMOVE_ITEM', payload: { productId, selectedFabric, selectedLining } });
  const updateQuantity = (productId: string, selectedFabric: string, selectedLining: string | undefined, quantity: number) =>
    dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, selectedFabric, selectedLining, quantity } });
  const clearCart = () => dispatch({ type: 'CLEAR_CART' });
  const toggleCart = () => dispatch({ type: 'TOGGLE_CART' });
  const setCartOpen = (isOpen: boolean) => dispatch({ type: 'SET_CART_OPEN', payload: isOpen });

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        itemsWithProducts,
        isOpen: state.isOpen,
        totalItems,
        totalPrice,
        isLoading,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        toggleCart,
        setCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
