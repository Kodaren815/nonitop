import Link from 'next/link';
import Image from 'next/image';
import { getAllProducts } from '@/lib/db/products';
import ProductCard from '@/components/ProductCard';

// Force dynamic rendering to always fetch fresh data from database
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function HomePage() {
  // Get all products from database
  const products = await getAllProducts();

  return (
    <div>
      {/* Hero Section with Background Image */}
      <section className="relative min-h-[90vh] md:min-h-screen flex items-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero-image.jpeg"
            alt="Nonito produkter"
            fill
            sizes="100vw"
            className="object-cover"
            priority
            quality={100}
          />
        </div>

        {/* Content */}
        <div className="section-container relative z-10 py-20 md:py-32">
          <div className="max-w-2xl">
            {/* Badge */}
            <div className="inline-block mb-6 px-6 py-2 bg-white/90 backdrop-blur-sm rounded-full text-pink-600 text-sm font-medium animate-fade-in shadow-lg">
              ✨ Handgjort med kärlek i Sverige
            </div>
            
            {/* Heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-serif text-white mb-6 leading-tight animate-slide-up drop-shadow-2xl">
              En värld av söta och praktiska saker för{' '}
              <span className="text-pink-300 inline-block hover:scale-105 transition-transform duration-300">
                dig och mini
              </span>
            </h1>
            
            {/* Description */}
            <p className="text-lg md:text-xl lg:text-2xl text-white/95 mb-8 leading-relaxed drop-shadow-lg animate-slide-up" style={{ animationDelay: '100ms' }}>
              Små handgjorda favoriter - till dig och mini. Designade med kärlek
              i Sverige.
            </p>
            
            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 animate-slide-up" style={{ animationDelay: '200ms' }}>
              <Link href="/produkter" className="inline-flex items-center justify-center px-8 py-4 bg-pink-500 text-white rounded-full font-semibold text-lg hover:bg-pink-600 hover:scale-105 transition-all duration-300 shadow-xl group">
                Se alla produkter
                <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </Link>
              <Link href="/om-oss" className="inline-flex items-center justify-center px-8 py-4 bg-white/90 backdrop-blur-sm text-charcoal rounded-full font-semibold text-lg hover:bg-white hover:scale-105 transition-all duration-300 shadow-xl">
                Läs mer om oss
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Product Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="section-container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-pink-100 group">
              <Image
                src="/images/products/miniskotvaska.jpeg"
                alt="Miniskötväska"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                priority
                quality={90}
              />
              <div className="absolute top-4 left-4 bg-pink-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                ⭐ Bästsäljare
              </div>
            </div>
            <div className="space-y-6">
              <div className="inline-block">
                <span className="text-pink-500 font-medium text-sm uppercase tracking-wider">
                  Perfekt för nya föräldrar
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-serif text-charcoal">
                Miniskötväska
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                Designad av en mamma, för alla små stunder med din mini. Lätt,
                smidig och alltid redo när du är det.
              </p>
              <div className="bg-pink-50 rounded-xl p-4 space-y-2">
                <p className="text-gray-700">✓ Rymmer 3-4 blöjor och ombyte</p>
                <p className="text-gray-700">✓ Smidig öppning för våtservetter</p>
                <p className="text-gray-700">✓ Bekvämt handtag för transport</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-3xl font-bold text-pink-500">500 kr</span>
                <span className="text-gray-400 text-sm">ca 28 x 17 cm</span>
              </div>
              <Link
                href="/produkter/miniskotvaska"
                className="btn-primary inline-block group"
              >
                Designa din egen
                <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-offwhite to-pink-50">
        <div className="section-container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif text-charcoal mb-4">
              Hur det fungerar
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Så enkelt skapar du din perfekta handgjorda favorit
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center group">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-pink-400 to-pink-500 rounded-full flex items-center justify-center text-white text-2xl font-bold transform group-hover:scale-110 transition-transform duration-300">
                1
              </div>
              <h3 className="text-xl font-semibold text-charcoal mb-3">
                Välj produkt
              </h3>
              <p className="text-gray-600">
                Bläddra bland våra handgjorda produkter och hitta din favorit
              </p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-pink-400 to-pink-500 rounded-full flex items-center justify-center text-white text-2xl font-bold transform group-hover:scale-110 transition-transform duration-300">
                2
              </div>
              <h3 className="text-xl font-semibold text-charcoal mb-3">
                Välj tyg
              </h3>
              <p className="text-gray-600">
                Designa din egen genom att välja ditt favorittyg för ytter- och innersida
              </p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-pink-400 to-pink-500 rounded-full flex items-center justify-center text-white text-2xl font-bold transform group-hover:scale-110 transition-transform duration-300">
                3
              </div>
              <h3 className="text-xl font-semibold text-charcoal mb-3">
                Vi syr din beställning
              </h3>
              <p className="text-gray-600">
                Vi syr din unika produkt för hand och skickar den direkt till dig
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="section-container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif text-charcoal mb-4">
              Våra produkter
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Designa din egen mini pouch eller necessär. Perfekt som
              nappbehållare, eller för dina egna små favoriter. Välj tyg och
              insida för att göra den helt din!
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.slice(0, 8).map((product, index) => (
              <div
                key={product.id}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/produkter" className="btn-secondary group">
              Se alla produkter
              <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">
                →
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-pink-50 to-offwhite">
        <div className="section-container">
          <div className="grid sm:grid-cols-3 gap-8 text-center">
            <div className="space-y-4 group">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-pink-100 to-pink-200 rounded-full flex items-center justify-center text-3xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                ✂️
              </div>
              <h3 className="font-semibold text-charcoal text-lg">Handgjort</h3>
              <p className="text-gray-600">
                Varje produkt sys för hand med kärlek och omsorg.
              </p>
            </div>
            <div className="space-y-4 group">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-pink-100 to-pink-200 rounded-full flex items-center justify-center text-3xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                🇸🇪
              </div>
              <h3 className="font-semibold text-charcoal text-lg">
                Svensk design
              </h3>
              <p className="text-gray-600">
                Designade i Sverige med skandinavisk estetik.
              </p>
            </div>
            <div className="space-y-4 group">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-pink-100 to-pink-200 rounded-full flex items-center justify-center text-3xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                💕
              </div>
              <h3 className="font-semibold text-charcoal text-lg">
                Perfekt present
              </h3>
              <p className="text-gray-600">
                Perfekt som babyshower-present eller till dig själv.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 bg-gradient-to-r from-pink-400 to-pink-500 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
        
        <div className="section-container text-center text-white relative z-10">
          <div className="max-w-3xl mx-auto">
            <div className="inline-block mb-6 text-5xl animate-bounce">
              🧸
            </div>
            <h2 className="text-3xl md:text-5xl font-serif mb-6">
              Designa din egen favorit
            </h2>
            <p className="text-pink-100 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
              Välj tyg och insida för att göra produkten helt din egen. Matcha med
              andra produkter för ett komplett Nonito-set! 
            </p>
            <Link
              href="/produkter"
              className="inline-block bg-white text-pink-500 px-10 py-4 rounded-full font-semibold text-lg hover:bg-pink-50 hover:scale-105 transition-all duration-300 shadow-lg"
            >
              Börja designa →
            </Link>
            <p className="mt-8 text-pink-100 text-sm">
              ✓ Handgjort i Sverige  ✓ Fri frakt över 500 kr  ✓ Snabb leverans
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
