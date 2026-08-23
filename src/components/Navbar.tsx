import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X, Phone } from 'lucide-react';
import { useBusiness } from '../hooks/useBusiness';
import { cn } from '../lib/utils';

const links = [
  { to: '/', label: 'Home' },
  { to: '/services', label: 'Services' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/about', label: 'About' },
  { to: '/reviews', label: 'Reviews' },
  { to: '/faq', label: 'FAQ' },
  { to: '/contact', label: 'Contact' },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { data: business } = useBusiness();
  const phone = business?.phone || '+92 321 1115925';

  return (
    <header className="sticky top-0 z-50 bg-primary/95 backdrop-blur border-b border-surface">
      <div className="container-narrow flex items-center justify-between h-16 md:h-20 px-4">
        <Link to="/" className="font-heading text-2xl md:text-3xl tracking-widest text-light-text">
          SMARTCUT
        </Link>

        <nav className="hidden lg:flex items-center gap-8">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                cn(
                  'text-sm font-medium tracking-wide uppercase transition-colors',
                  isActive ? 'text-accent' : 'text-light-muted hover:text-light-text'
                )
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-4">
          <a href={`tel:${phone.replace(/\s/g, '')}`} className="btn-ghost text-sm">
            <Phone size={16} />
            CALL
          </a>
          <Link to="/book-appointment" className="btn-primary text-sm py-2.5 px-5">
            BOOK APPOINTMENT
          </Link>
        </div>

        <button className="lg:hidden p-2" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t border-surface bg-primary px-4 py-6 space-y-4">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                cn(
                  'block text-base font-medium uppercase tracking-wide',
                  isActive ? 'text-accent' : 'text-light-muted'
                )
              }
            >
              {l.label}
            </NavLink>
          ))}
          <div className="pt-4 flex flex-col gap-3">
            <a href={`tel:${phone.replace(/\s/g, '')}`} className="btn-secondary w-full justify-center">
              <Phone size={16} /> CALL SMARTCUT
            </a>
            <Link
              to="/book-appointment"
              onClick={() => setOpen(false)}
              className="btn-primary w-full justify-center"
            >
              BOOK APPOINTMENT
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
