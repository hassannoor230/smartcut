import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Star, MapPin, Phone, Scissors, Shield, Clock } from 'lucide-react';
import { useBusiness, useServices, useGallery, useFaqs } from '../hooks/useBusiness';
import { formatPrice } from '../lib/utils';

export default function HomePage() {
  const { data: business } = useBusiness();
  const { data: services } = useServices();
  const { data: gallery } = useGallery();
  const { data: faqs } = useFaqs();

  const phone = business?.phone || '+92 321 1115925';
  const rating = business?.googleRating ?? 4.7;
  const reviewCount = business?.googleReviewCount ?? 493;
  const featuredServices = services?.filter((s) => s.featured).slice(0, 4) || [];
  const featuredGallery = gallery?.filter((g) => g.featured).slice(0, 6) || gallery?.slice(0, 6) || [];

  return (
    <>
      <Helmet>
        <title>Smartcut – Rahwali Gujranwala | Men&apos;s Hair & Grooming</title>
        <meta
          name="description"
          content="Modern men's haircuts and grooming at Smartcut Rahwali, GT Road opposite DC Colony Gate, Gujranwala. Book your appointment today."
        />
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BeautySalon',
            name: business?.businessName || 'Smartcut – Rahwali Gujranwala',
            telephone: phone,
            address: {
              '@type': 'PostalAddress',
              streetAddress: 'Rahwali, GT Road, opposite DC Colony Gate',
              addressLocality: 'Gujranwala',
              addressCountry: 'PK',
            },
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: rating,
              reviewCount: reviewCount,
            },
          })}
        </script>
      </Helmet>

      {/* Hero */}
      <section className="relative min-h-[85vh] flex items-center section-padding overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary via-primary to-secondary opacity-90" />
        <div className="container-narrow relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <p className="text-accent font-medium tracking-widest text-sm uppercase mb-4">
              Men&apos;s Hair & Grooming · Rahwali
            </p>
            <h1 className="font-heading text-hero-mobile md:text-hero-desktop text-light-text leading-none mb-6">
              YOUR STYLE.<br />
              YOUR SMARTCUT.
            </h1>
            <p className="text-light-muted text-lg max-w-xl mb-8 leading-relaxed">
              Modern men&apos;s haircuts and grooming at Smartcut Rahwali, conveniently located on GT
              Road opposite DC Colony Gate.
            </p>
            <div className="flex flex-wrap gap-4 mb-10">
              <Link to="/book-appointment" className="btn-primary">
                BOOK APPOINTMENT
              </Link>
              <a href={`tel:${phone.replace(/\s/g, '')}`} className="btn-secondary">
                <Phone size={18} />
                CALL SMARTCUT
              </a>
            </div>
            <div className="flex flex-wrap items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Star className="text-accent fill-accent" size={18} />
                <span className="font-semibold">{rating}★</span>
                <span className="text-light-muted">Google Rating</span>
              </div>
              <div className="text-light-muted">
                <span className="text-light-text font-semibold">{reviewCount}</span> Google Reviews
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust */}
      <section className="bg-secondary border-y border-surface py-10">
        <div className="container-narrow px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="font-heading text-3xl text-accent">{rating}★</div>
            <div className="text-xs text-light-muted mt-1 uppercase tracking-wider">Google Rating</div>
          </div>
          <div>
            <div className="font-heading text-3xl text-light-text">{reviewCount}</div>
            <div className="text-xs text-light-muted mt-1 uppercase tracking-wider">Google Reviews</div>
          </div>
          <div>
            <div className="font-heading text-3xl text-light-text">RAHWALI</div>
            <div className="text-xs text-light-muted mt-1 uppercase tracking-wider">Gujranwala</div>
          </div>
          <div>
            <div className="font-heading text-3xl text-light-text">MEN&apos;S</div>
            <div className="text-xs text-light-muted mt-1 uppercase tracking-wider">Hair & Grooming</div>
          </div>
        </div>
      </section>

      {/* Featured Services */}
      <section className="section-padding">
        <div className="container-narrow">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-accent text-sm tracking-widest uppercase mb-2">Services</p>
              <h2 className="font-heading text-section text-light-text">FEATURED SERVICES</h2>
            </div>
            <Link to="/services" className="hidden md:inline text-sm text-accent hover:underline">
              View all →
            </Link>
          </div>
          {featuredServices.length === 0 ? (
            <p className="text-light-muted">Service information is being updated.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredServices.map((s) => (
                <div
                  key={s._id}
                  className="bg-surface border border-surface hover:border-accent/40 transition-colors p-6 rounded-sm"
                >
                  <Scissors className="text-accent mb-4" size={24} />
                  <h3 className="font-heading text-xl tracking-wider text-light-text mb-2">{s.name}</h3>
                  <p className="text-sm text-light-muted mb-4 line-clamp-2">{s.description}</p>
                  <div className="text-accent font-medium text-sm">{formatPrice(s.price)}</div>
                </div>
              ))}
            </div>
          )}
          <div className="mt-8 md:hidden">
            <Link to="/services" className="btn-secondary w-full justify-center">
              View all services
            </Link>
          </div>
        </div>
      </section>

      {/* Why Smartcut */}
      <section className="section-padding bg-secondary">
        <div className="container-narrow">
          <p className="text-accent text-sm tracking-widest uppercase mb-2">Why us</p>
          <h2 className="font-heading text-section text-light-text mb-10">WHY SMARTCUT</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Scissors, title: 'Modern Cuts', text: 'Contemporary styles tailored for the modern man.' },
              { icon: Shield, title: 'Premium Care', text: 'Professional grooming in a clean, focused studio.' },
              { icon: MapPin, title: 'Convenient Location', text: 'Easy to find on GT Road, opposite DC Colony Gate.' },
            ].map((item) => (
              <div key={item.title} className="text-center md:text-left">
                <item.icon className="text-accent mx-auto md:mx-0 mb-4" size={28} />
                <h3 className="font-heading text-xl tracking-wider mb-2">{item.title}</h3>
                <p className="text-light-muted text-sm leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About teaser */}
      <section className="section-padding">
        <div className="container-narrow max-w-3xl">
          <p className="text-accent text-sm tracking-widest uppercase mb-2">About</p>
          <h2 className="font-heading text-section text-light-text mb-6">ABOUT SMARTCUT</h2>
          <p className="text-light-muted leading-relaxed mb-6">
            {business?.aboutText ||
              "Smartcut is a modern men's hair and grooming studio located in Rahwali, Gujranwala on GT Road opposite DC Colony Gate. We are dedicated to providing high-quality haircuts, shaves, and grooming services in a comfortable and welcoming environment. Our team of skilled barbers is passionate about their craft and committed to delivering exceptional service to every client. We believe that a great haircut is not just about style, but also about confidence and self-expression. That's why we take the time to listen to our clients' needs and preferences, and work with them to create a look that suits their personality and lifestyle. At Smartcut, we are more than just a barbershop - we are a community of like-minded individuals who share a love for grooming and self-care. We invite you to come and experience the Smartcut difference for yourself."}
          </p>
          <Link to="/about" className="text-accent hover:underline text-sm font-medium">
            Learn more →
          </Link>
        </div>
      </section>

      {/* Gallery teaser */}
      <section className="section-padding bg-secondary">
        <div className="container-narrow">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-accent text-sm tracking-widest uppercase mb-2">Gallery</p>
              <h2 className="font-heading text-section text-light-text">OUR WORK</h2>
            </div>
            <Link to="/gallery" className="hidden md:inline text-sm text-accent hover:underline">
              View gallery →
            </Link>
          </div>
          {featuredGallery.length === 0 ? (
            <p className="text-light-muted">Gallery coming soon.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {featuredGallery.map((g) => (
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

      {/* Reviews CTA */}
      <section className="section-padding text-center">
        <div className="container-narrow">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Star className="text-accent fill-accent" size={28} />
            <span className="font-heading text-4xl text-light-text">{rating}★</span>
          </div>
          <p className="text-light-muted mb-2">{reviewCount} Google Reviews</p>
          <a
            href="https://www.google.com/maps/search/?api=1&query=Smartcut+Rahwali+Gujranwala"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary mt-4 inline-flex"
          >
            READ REVIEWS ON GOOGLE
          </a>
        </div>
      </section>

      {/* Location */}
      <section className="section-padding bg-secondary">
        <div className="container-narrow">
          <p className="text-accent text-sm tracking-widest uppercase mb-2">Location</p>
          <h2 className="font-heading text-section text-light-text mb-6">FIND US</h2>
          <p className="text-light-muted mb-6 max-w-xl">
            {business?.address || 'Rahwali, GT Road, opposite DC Colony Gate, Gujranwala, Pakistan'}
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              href={business?.googleMapsUrl || 'https://www.google.com/maps/search/?api=1&query=Smartcut+Rahwali+Gujranwala'}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              <MapPin size={18} />
              GET DIRECTIONS
            </a>
            <a href={`tel:${phone.replace(/\s/g, '')}`} className="btn-secondary">
              <Phone size={18} />
              CALL SMARTCUT
            </a>
          </div>
        </div>
      </section>

      {/* FAQ teaser */}
      {faqs && faqs.length > 0 && (
        <section className="section-padding">
          <div className="container-narrow max-w-3xl">
            <p className="text-accent text-sm tracking-widest uppercase mb-2">FAQ</p>
            <h2 className="font-heading text-section text-light-text mb-8">FREQUENTLY ASKED</h2>
            <div className="space-y-4">
              {faqs.slice(0, 3).map((f) => (
                <details key={f._id} className="bg-surface border border-surface rounded-sm group">
                  <summary className="px-5 py-4 cursor-pointer font-medium text-light-text list-none flex justify-between items-center">
                    {f.question}
                    <span className="text-accent group-open:rotate-45 transition-transform">+</span>
                  </summary>
                  <div className="px-5 pb-4 text-sm text-light-muted leading-relaxed">{f.answer}</div>
                </details>
              ))}
            </div>
            <Link to="/faq" className="inline-block mt-6 text-accent hover:underline text-sm">
              View all FAQs →
            </Link>
          </div>
        </section>
      )}

      {/* Final CTA */}
      <section className="section-padding bg-accent text-primary text-center">
        <div className="container-narrow">
          <h2 className="font-heading text-4xl md:text-5xl tracking-wider mb-4">
            READY FOR YOUR SMARTCUT?
          </h2>
          <p className="mb-8 max-w-md mx-auto opacity-90">
            Request an appointment or call us directly. We&apos;ll confirm availability.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/book-appointment"
              className="inline-flex items-center justify-center gap-2 bg-primary text-light-text font-semibold px-6 py-3 rounded-sm hover:bg-secondary transition-colors"
            >
              BOOK APPOINTMENT
            </Link>
            <a
              href={`tel:${phone.replace(/\s/g, '')}`}
              className="inline-flex items-center justify-center gap-2 border-2 border-primary text-primary font-semibold px-6 py-3 rounded-sm hover:bg-primary hover:text-light-text transition-colors"
            >
              <Phone size={18} />
              CALL NOW
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
