import { Helmet } from 'react-helmet-async';
import { useGallery } from '../hooks/useBusiness';
import { RefreshCw } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

export default function GalleryPage() {
  const { data: gallery, isPending, isError, error, refetch } = useGallery();
  const queryClient = useQueryClient();

  const handleRetry = () => {
    queryClient.invalidateQueries({ queryKey: ['gallery'] });
    refetch();
  };

  return (
    <>
      <Helmet>
        <title>Gallery | Smartcut Rahwali Gujranwala</title>
      </Helmet>
      <section className="section-padding">
        <div className="container-narrow">
          <p className="text-accent text-sm tracking-widest uppercase mb-2">Our work</p>
          <h1 className="font-heading text-section text-light-text mb-10">GALLERY</h1>
          {isPending && <p className="text-light-muted">Loading...</p>}
          {isError && (
            <div className="text-center py-10">
              <p className="text-red-400 mb-4">
                {error instanceof Error ? error.message : "We're having trouble loading this information right now."}
              </p>
              <button
                onClick={handleRetry}
                className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-primary rounded-sm hover:bg-accent-hover transition-colors"
              >
                <RefreshCw size={16} /> Try again
              </button>
            </div>
          )}
          {!isPending && !isError && (!gallery || gallery.length === 0) && (
            <p className="text-light-muted">Gallery coming soon.</p>
          )}
          {!isPending && !isError && gallery && gallery.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {gallery.map((g) => (
                <div key={g._id} className="aspect-square bg-surface overflow-hidden rounded-sm">
                  <img
                    src={g.thumbnailUrl || g.imageUrl}
                    alt={g.altText || g.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
