import { Link } from 'react-router-dom';
import { useBusiness } from '../hooks/useBusiness';

export function Footer() {
  const { data: business } = useBusiness();
  const year = new Date().getFullYear();
  const phone = business?.phone || '+92 321 1115925';
  const address = business?.address || 'Rahwali, GT Road, opposite DC Colony Gate, Gujranwala, Pakistan';

  return (
    <footer className="bg-secondary border-t border-surface">
      <div className="container-narrow section-padding !py-12">
        <div className="grid md:grid-cols-3 gap-10">
          <div>
            <div className="font-heading text-3xl tracking-widest text-accent mb-4">SMARTCUT</div>
            <p className="text-light-muted text-sm leading-relaxed">
              Modern men&apos;s hair & grooming<br />
              Rahwali — Gujranwala
            </p>
          </div>
          <div>
            <h4 className="font-heading text-lg tracking-wider text-light-text mb-4">NAVIGATE</h4>
            <ul className="space-y-2 text-sm text-light-muted">
              <li><Link to="/" className="hover:text-accent">Home</Link></li>
              <li><Link to="/services" className="hover:text-accent">Services</Link></li>
              <li><Link to="/gallery" className="hover:text-accent">Gallery</Link></li>
              <li><Link to="/reviews" className="hover:text-accent">Reviews</Link></li>
              <li><Link to="/about" className="hover:text-accent">About</Link></li>
              <li><Link to="/faq" className="hover:text-accent">FAQ</Link></li>
              <li><Link to="/contact" className="hover:text-accent">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-heading text-lg tracking-wider text-light-text mb-4">CONTACT</h4>
            <p className="text-sm text-light-muted leading-relaxed mb-3">{address}</p>
            <a href={`tel:${phone.replace(/\s/g, '')}`} className="text-accent font-medium hover:underline">
              {phone}
            </a>
            <div className="mt-6">
              <Link to="/book-appointment" className="btn-primary text-sm">
                BOOK APPOINTMENT
              </Link>
            </div>
          </div>
        </div>
        <div className="mt-12 pt-6 border-t border-surface text-center text-xs text-light-muted">
          © {year} Smartcut – Rahwali Gujranwala. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
