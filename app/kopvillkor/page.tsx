import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Köpvillkor',
  description: 'Köpvillkor för Nonito - läs om leverans, betalning och ångerrätt.',
};

export default function TermsPage() {
  return (
    <div className="py-12 md:py-16 animate-fade-in">
      <div className="section-container max-w-3xl">
        <h1 className="text-3xl md:text-4xl font-serif text-charcoal mb-8">
          Köpvillkor
        </h1>

        <div className="prose prose-gray max-w-none">
          <p className="text-gray-600 mb-6">
            Senast uppdaterad: December 2024
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-charcoal mb-4">
              1. Priser och betalning
            </h2>
            <p className="text-gray-600 mb-4">
              Alla priser på webbplatsen anges i svenska kronor (SEK) inklusive
              moms. Betalning sker säkert via Stripe med kort eller Klarna.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-charcoal mb-4">
              2. Leverans
            </h2>
            <p className="text-gray-600 mb-4">
              Vi levererar till Sverige, Norge, Danmark och Finland.
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Leveranstid: 3-7 arbetsdagar</li>
              <li>Fraktkostnad: 49 kr (fri frakt vid köp över 500 kr)</li>
              <li>Alla produkter är handgjorda och kan ta några extra dagar</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-charcoal mb-4">
              3. Handgjorda produkter
            </h2>
            <p className="text-gray-600">
              Alla våra produkter sys för hand. Mindre avvikelser i storlek och
              utseende kan förekomma och är en del av det handgjorda hantverket.
              Varje produkt är unik!
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-charcoal mb-4">
              4. Ångerrätt
            </h2>
            <p className="text-gray-600 mb-4">
              Enligt distansavtalslagen har du 14 dagars ångerrätt. För att
              utnyttja ångerrätten måste varan vara oanvänd och i originalskick.
            </p>
            <p className="text-gray-600">
              Obs! Specialbeställda produkter med personlig design omfattas inte
              av ångerrätten.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-charcoal mb-4">
              5. Reklamation
            </h2>
            <p className="text-gray-600">
              Om du upptäcker ett fel på din produkt, kontakta oss inom rimlig
              tid. Vi åtgärdar felet genom att reparera, ersätta eller
              återbetala enligt konsumentköplagen.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-charcoal mb-4">
              6. Kontakt
            </h2>
            <p className="text-gray-600">
              Har du frågor om våra köpvillkor? Kontakta oss på{' '}
              <a href="mailto:hej@nonito.se" className="text-pink-500 hover:underline">
                hej@nonito.se
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
