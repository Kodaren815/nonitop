import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Integritetspolicy',
  description: 'Integritetspolicy för Nonito - läs om hur vi hanterar dina personuppgifter.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="py-12 md:py-16 animate-fade-in">
      <div className="section-container max-w-3xl">
        <h1 className="text-3xl md:text-4xl font-serif text-charcoal mb-8">
          Integritetspolicy
        </h1>

        <div className="prose prose-gray max-w-none">
          <p className="text-gray-600 mb-6">
            Senast uppdaterad: December 2024
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-charcoal mb-4">
              1. Vilka uppgifter samlar vi in?
            </h2>
            <p className="text-gray-600 mb-4">
              När du handlar hos Nonito samlar vi in följande uppgifter:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Namn och kontaktuppgifter (e-post, adress, telefonnummer)</li>
              <li>Leveransadress</li>
              <li>Betalningsinformation (hanteras säkert av Stripe)</li>
              <li>Orderhistorik och produktval</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-charcoal mb-4">
              2. Hur använder vi dina uppgifter?
            </h2>
            <p className="text-gray-600 mb-4">
              Vi använder dina uppgifter för att:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Behandla och leverera din beställning</li>
              <li>Skicka orderbekräftelse och leveransinformation</li>
              <li>Hantera returer och reklamationer</li>
              <li>Förbättra vår service och produkter</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-charcoal mb-4">
              3. Betalningssäkerhet
            </h2>
            <p className="text-gray-600">
              Alla betalningar hanteras säkert av Stripe, en av världens ledande
              betaltjänstleverantörer. Vi lagrar aldrig dina kortuppgifter på våra
              servrar.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-charcoal mb-4">
              4. Dina rättigheter
            </h2>
            <p className="text-gray-600 mb-4">
              Enligt GDPR har du rätt att:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Få tillgång till dina personuppgifter</li>
              <li>Rätta felaktiga uppgifter</li>
              <li>Radera dina uppgifter</li>
              <li>Invända mot behandling av dina uppgifter</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-charcoal mb-4">
              5. Kontakt
            </h2>
            <p className="text-gray-600">
              Har du frågor om vår integritetspolicy eller vill utöva dina
              rättigheter? Kontakta oss på{' '}
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
