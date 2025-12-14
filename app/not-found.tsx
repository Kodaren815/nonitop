import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="py-16 md:py-24">
      <div className="section-container max-w-2xl text-center">
        <div className="text-8xl mb-6">🧸</div>
        <h1 className="text-4xl font-serif text-charcoal mb-4">
          Sidan kunde inte hittas
        </h1>
        <p className="text-gray-600 mb-8">
          Oj! Den här sidan verkar ha försvunnit. Men oroa dig inte, du kan
          hitta massor av söta saker på vår startsida.
        </p>
        <Link href="/" className="btn-primary">
          Till startsidan
        </Link>
      </div>
    </div>
  );
}
