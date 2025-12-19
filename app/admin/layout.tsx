// Force all admin pages to be dynamic (no static generation)
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Admin pages have their own layout without the main site header/footer
  return <>{children}</>;
}
