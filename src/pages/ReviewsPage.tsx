import { Helmet } from 'react-helmet-async';
import { Star } from 'lucide-react';
import { useBusiness, useReviews } from '../hooks/useBusiness';

export default function ReviewsPage() {
  const { data: business } = useBusiness();
  const { data: reviews, isLoading } = useReviews();
  const rating = business?.googleRating ?? 4.7;
  const count = business?.googleReviewCount ?? 493;

  return (
    <>
      <Helmet>
        <title>Reviews | Smartcut Rahwali Gujranwala</title>
      </Helmet>
      <section className="section-padding">
        <div className="container-narrow">
          <p className="text-accent text-sm tracking-widest uppercase mb-2">What clients say</p>
          <h1 className="font-heading text-section text-light-text mb-4">REVIEWS</h1>
          <div className="flex items-center gap-3 mb-10">
            <Star className="text-accent fill-accent" size={24} />
            <span className="font-heading text-3xl">{rating}★</span>
            <span className="text-light-muted">{count} Google Reviews</span>
          </div>
          <a
            href="https://www.google.com/maps/search/?api=1&query=Smartcut+Rahwali+Gujranwala"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary mb-12 inline-flex"
          >
            READ REVIEWS ON GOOGLE
          </a>
          {isLoading && <p className="text-light-muted">Loading...</p>}
          {!isLoading && (!reviews || reviews.length === 0) && (
            <p className="text-light-muted">Customer reviews will appear here once authorized content is added.</p>
          )}
          <div className="grid md:grid-cols-2 gap-6">
            {reviews?.map((r) => (
              <div key={r._id} className="bg-surface p-6 rounded-sm border border-surface">
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: r.rating }).map((_, i) => (
                    <Star key={i} size={14} className="text-accent fill-accent" />
                  ))}
                </div>
                <p className="text-light-muted text-sm leading-relaxed mb-4">&ldquo;{r.text}&rdquo;</p>
                <div className="text-sm font-medium text-light-text">{r.author}</div>
                <div className="text-xs text-light-muted">{r.source}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
