import { Phone, MapPin } from 'lucide-react';
import { useBusiness } from '../hooks/useBusiness';

export function MobileStickyCTA() {
  const { data: business } = useBusiness();
  const phone = business?.phone || '+92 321 1115925';
  const mapsUrl = business?.googleMapsUrl || 'https://www.google.com/maps/search/?api=1&query=Smartcut+Rahwali+Gujranwala';

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-primary/95 backdrop-blur border-t border-surface flex">
      <a
        href={`tel:${phone.replace(/\s/g, '')}`}
        className="flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-semibold text-accent"
      >
        <Phone size={18} />
        CALL
      </a>
      <div className="w-px bg-surface" />
      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-semibold text-light-text"
      >
        <MapPin size={18} />
        DIRECTIONS
      </a>
    </div>
  );
}
