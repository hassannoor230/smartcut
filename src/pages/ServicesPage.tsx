import { Helmet } from 'react-helmet-async';
import { useServices } from '../hooks/useBusiness';
import { formatPrice } from '../lib/utils';
import { Scissors } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ServicesPage() {
  const { data: services, isLoading, isError } = useServices();

  return (
    <>
      <Helmet>
        <title>Services | Smartcut Rahwali Gujranwala</title>
        <meta name="description" content="Men's haircuts, styling, beard grooming and complete grooming at Smartcut Rahwali." />
      </Helmet>
      <section className="section-padding">
        <div className="container-narrow">
          <p className="text-accent text-sm tracking-widest uppercase mb-2">What we offer</p>
          <h1 className="font-heading text-section text-light-text mb-10">SERVICES</h1>
          {isLoading && <p className="text-light-muted">Loading services...</p>}
          {isError && <p className="text-red-400">We're having trouble loading this information right now.</p>}
          {!isLoading && !isError && (!services || services.length === 0) && (
            <p className="text-light-muted">Service information is being updated.</p>
          )}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services?.map((s) => (
              <div key={s._id} className="bg-surface border border-surface p-6 rounded-sm">
                <Scissors className="text-accent mb-4" size={24} />
                <h2 className="font-heading text-xl tracking-wider mb-2">{s.name}</h2>
                <p className="text-sm text-light-muted mb-4">{s.description}</p>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-accent font-medium">{formatPrice(s.price)}</span>
                  {s.duration && <span className="text-light-muted">{s.duration} min</span>}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link to="/book-appointment" className="btn-primary">BOOK APPOINTMENT</Link>
          </div>
        </div>
      </section>
    </>
  );
}
