import { Helmet } from 'react-helmet-async';
import { useBusiness } from '../hooks/useBusiness';
import { Link } from 'react-router-dom';

export default function AboutPage() {
  const { data: business } = useBusiness();

  return (
    <>
      <Helmet>
        <title>About | Smartcut Rahwali Gujranwala</title>
      </Helmet>
      <section className="section-padding">
        <div className="container-narrow max-w-3xl">
          <p className="text-accent text-sm tracking-widest uppercase mb-2">Our story</p>
          <h1 className="font-heading text-section text-light-text mb-8">ABOUT SMARTCUT</h1>
          <div className="text-light-muted leading-relaxed space-y-4">
            <p>
              {business?.aboutText ||
                "Smartcut is a modern men's hair and grooming studio located in Rahwali, Gujranwala on GT Road opposite DC Colony Gate. We are dedicated to providing high-quality haircuts, shaves, and grooming services in a comfortable and welcoming environment. Our team of skilled barbers is passionate about their craft and committed to delivering exceptional service to every client. We believe that a great haircut is not just about style, but also about confidence and self-expression. That's why we take the time to listen to our clients' needs and preferences, and work with them to create a look that suits their personality and lifestyle. At Smartcut, we are more than just a barbershop - we are a community of like-minded individuals who share a love for grooming and self-care. We invite you to come and experience the Smartcut difference for yourself."}
            </p>
          </div>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link to="/book-appointment" className="btn-primary">BOOK APPOINTMENT</Link>
            <Link to="/services" className="btn-secondary">VIEW SERVICES</Link>
          </div>
        </div>
      </section>
    </>
  );
}
