import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

export default function NotFoundPage() {
  return (
    <>
      <Helmet>
        <title>Page Not Found | Smartcut</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <section className="section-padding min-h-[60vh] flex items-center justify-center text-center">
        <div>
          <h1 className="font-heading text-6xl text-accent mb-4">404</h1>
          <p className="text-light-muted mb-8">This page does not exist.</p>
          <Link to="/" className="btn-primary">
            BACK TO HOME
          </Link>
        </div>
      </section>
    </>
  );
}
