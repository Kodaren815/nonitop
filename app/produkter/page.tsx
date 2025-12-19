import { Metadata } from 'next';
import { getAllProducts } from '@/lib/db/products';
import ProductCard from '@/components/ProductCard';

export const metadata: Metadata = {
  title: 'Alla produkter',
  description:
    'Utforska våra handgjorda produkter - miniskötväska, mini pouch, necessär och puffkorg. Välj ditt favorit tyg!',
};

export default async function ProductsPage() {
  // Get all products from database
  const products = await getAllProducts();

  return (
    <div className="py-12 md:py-16 animate-fade-in">
      <div className="section-container">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-serif text-charcoal mb-4">
            Alla produkter
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Små handgjorda favoriter - till dig och mini. Välj tyg och insida
            för att göra produkten helt din egen!
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Info Section */}
        <div className="mt-16 bg-pink-50 rounded-2xl p-8 md:p-12">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-serif text-charcoal mb-4">
              Handgjort med kärlek
            </h2>
            <p className="text-gray-600">
              Alla våra produkter sys för hand och mindre avvikelser i storlek
              kan förekomma. Det är det som gör varje produkt unik! Om du har
              frågor eller vill beställa något speciellt, tveka inte att höra av
              dig.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
