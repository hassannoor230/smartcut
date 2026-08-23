import { useBusiness } from '../hooks/useBusiness';

export function AnnouncementBar() {
  const { data: business } = useBusiness();

  if (!business?.announcementEnabled || !business.announcementText) return null;

  return (
    <div className="bg-accent text-primary text-center text-sm font-medium py-2 px-4">
      {business.announcementText}
    </div>
  );
}
