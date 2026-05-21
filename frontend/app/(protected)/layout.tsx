import Nav from '@/components/layout/Nav';
import Footer from '@/components/layout/Footer';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      <main>{children}</main>
      <Footer />
    </>
  );
}
