import { Metadata } from 'next';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Om Nonito',
  description:
    'Nonito skapar handgjorda, söta och praktiska saker för dig och mini. Designade med kärlek i Sverige.',
};

export default function AboutPage() {
  return (
    <div className="py-12 md:py-16 animate-fade-in">
      <div className="section-container">
        {/* Hero */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="text-3xl md:text-4xl font-serif text-charcoal mb-6">
            Om Nonito
          </h1>
          <p className="text-xl text-gray-600">
            Små handgjorda favoriter - till dig och mini 🧸
          </p>
        </div>

        {/* Story Section */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-pink-100">
            <Image
              src="/images/products/miniskotvaska.jpeg"
              alt="Nonito produkter"
              fill
              className="object-cover"
            />
          </div>
          <div className="space-y-6">
            <h2 className="text-2xl font-serif text-charcoal">Vår historia</h2>
            <p className="text-gray-600">
              Nonito började som en dröm om att skapa något vackert och praktiskt
              för föräldrar och barn. Som mamma vet jag hur viktigt det är med
              smarta lösningar som gör vardagen lite enklare.
            </p>
            <p className="text-gray-600">
              Varje produkt designas med omsorg och sys för hand. Jag vill att
              du ska känna att du har något speciellt - något som är gjort just
              för dig och din lilla.
            </p>
            <p className="text-gray-600">
              Tack för att du väljer Nonito. Det betyder allt för mig! 💕
            </p>
          </div>
        </div>

        {/* Values Section */}
        <div className="bg-white rounded-2xl p-8 md:p-12 mb-16">
          <h2 className="text-2xl font-serif text-charcoal text-center mb-10">
            Det vi tror på
          </h2>
          <div className="grid sm:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                ✂️
              </div>
              <h3 className="font-semibold text-charcoal mb-2">Handgjort</h3>
              <p className="text-gray-600 text-sm">
                Varje produkt sys för hand med kärlek och precision. Det tar tid,
                men resultatet är värt det.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                🌿
              </div>
              <h3 className="font-semibold text-charcoal mb-2">Kvalitet</h3>
              <p className="text-gray-600 text-sm">
                Vi använder vackra bomullstyger och material som håller. Dina
                favoriter ska kunna följa med länge.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                💕
              </div>
              <h3 className="font-semibold text-charcoal mb-2">Med kärlek</h3>
              <p className="text-gray-600 text-sm">
                Allt vi gör, gör vi med kärlek. För dig, din mini och alla små
                stunder som betyder mest.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-serif text-charcoal mb-4">
            Har du frågor?
          </h2>
          <p className="text-gray-600 mb-6">
            Tveka inte att höra av dig! Jag svarar gärna på frågor om produkter,
            beställningar eller om du vill ha hjälp att välja tyg.
          </p>
          <a
            href="mailto:hej@nonito.se"
            className="btn-primary inline-block"
          >
            Kontakta oss
          </a>
        </div>
      </div>
    </div>
  );
}
