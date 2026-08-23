import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { MobileStickyCTA } from '../components/MobileStickyCTA';
import { WhatsAppButton } from '../components/WhatsAppButton';
import { AnnouncementBar } from '../components/AnnouncementBar';

export function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <AnnouncementBar />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <MobileStickyCTA />
      <WhatsAppButton />
    </div>
  );
}
