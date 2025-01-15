import Header from '@/components/Header';
import NavBar from '@/components/NavBar';

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header />
      <section className='flex flex-row w-screen h-full overflow-hidden bg-gray-200'>
        <NavBar />
        {children}
      </section>
    </>
  );
}

