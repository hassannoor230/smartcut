import { Helmet } from 'react-helmet-async';
import { useFaqs } from '../hooks/useBusiness';

export default function FaqPage() {
  const { data: faqs, isLoading } = useFaqs();

  return (
    <>
      <Helmet>
        <title>FAQ | Smartcut Rahwali Gujranwala</title>
      </Helmet>
      <section className="section-padding">
        <div className="container-narrow max-w-3xl">
          <p className="text-accent text-sm tracking-widest uppercase mb-2">Help</p>
          <h1 className="font-heading text-section text-light-text mb-10">FREQUENTLY ASKED QUESTIONS</h1>
          {isLoading && <p className="text-light-muted">Loading...</p>}
          <div className="space-y-3">
            {faqs?.map((f) => (
              <details key={f._id} className="bg-surface border border-surface rounded-sm group">
                <summary className="px-5 py-4 cursor-pointer font-medium list-none flex justify-between items-center">
                  {f.question}
                  <span className="text-accent group-open:rotate-45 transition-transform text-xl">+</span>
                </summary>
                <div className="px-5 pb-4 text-sm text-light-muted leading-relaxed">{f.answer}</div>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
