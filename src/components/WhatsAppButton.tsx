import { MessageCircle } from 'lucide-react';
import { useBusiness } from '../hooks/useBusiness';

export function WhatsAppButton() {
  const { data: business } = useBusiness();

  if (!business?.whatsappEnabled || !business?.whatsapp) {
    return null;
  }

  const phone = business.whatsapp.replace(/\D/g, '');
  const message = encodeURIComponent('Hello! I\'m interested in your services.');
  const href = `https://wa.me/${phone}?text=${message}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-20 lg:bottom-6 right-4 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-green-500 text-white shadow-lg hover:bg-green-600 hover:scale-110 transition-transform duration-200"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle size={28} fill="white" />
    </a>
  );
}
