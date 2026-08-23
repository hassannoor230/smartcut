import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../lib/api';
import { useBusiness } from '../hooks/useBusiness';
import { Phone, MapPin } from 'lucide-react';

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  phone: z.string().min(10, 'Valid phone required'),
  email: z.string().email().optional().or(z.literal('')),
  service: z.string().optional(),
  message: z.string().min(5, 'Message is required'),
});

type FormData = z.infer<typeof schema>;

export default function ContactPage() {
  const { data: business } = useBusiness();
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setStatus('loading');
    try {
      await api.post('/contact', data);
      setStatus('success');
      reset();
    } catch {
      setStatus('error');
    }
  };

  const phone = business?.phone || '+92 321 1115925';

  return (
    <>
      <Helmet>
        <title>Contact | Smartcut Rahwali Gujranwala</title>
      </Helmet>
      <section className="section-padding">
        <div className="container-narrow">
          <p className="text-accent text-sm tracking-widest uppercase mb-2">Get in touch</p>
          <h1 className="font-heading text-section text-light-text mb-10">CONTACT</h1>
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <p className="text-light-muted mb-6 leading-relaxed">
                Have a question? Send us a message or call directly.
              </p>
              <div className="space-y-4 text-sm">
                <a href={`tel:${phone.replace(/\s/g, '')}`} className="flex items-center gap-3 text-accent">
                  <Phone size={18} /> {phone}
                </a>
                <div className="flex items-start gap-3 text-light-muted">
                  <MapPin size={18} className="mt-0.5 shrink-0" />
                  {business?.address || 'Rahwali, GT Road, opposite DC Colony Gate, Gujranwala, Pakistan'}
                </div>
              </div>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm text-light-muted mb-1">Name *</label>
                <input
                  {...register('name')}
                  className="w-full bg-surface border border-surface rounded-sm px-4 py-3 text-light-text focus:border-accent outline-none"
                  placeholder="Your name"
                />
                {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className="block text-sm text-light-muted mb-1">Phone *</label>
                <input
                  {...register('phone')}
                  className="w-full bg-surface border border-surface rounded-sm px-4 py-3 text-light-text focus:border-accent outline-none"
                  placeholder="+92 3XX XXXXXXX"
                />
                {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone.message}</p>}
              </div>
              <div>
                <label className="block text-sm text-light-muted mb-1">Email</label>
                <input
                  {...register('email')}
                  type="email"
                  className="w-full bg-surface border border-surface rounded-sm px-4 py-3 text-light-text focus:border-accent outline-none"
                  placeholder="Optional"
                />
              </div>
              <div>
                <label className="block text-sm text-light-muted mb-1">Message *</label>
                <textarea
                  {...register('message')}
                  rows={4}
                  className="w-full bg-surface border border-surface rounded-sm px-4 py-3 text-light-text focus:border-accent outline-none resize-none"
                  placeholder="Your message"
                />
                {errors.message && <p className="text-red-400 text-xs mt-1">{errors.message.message}</p>}
              </div>
              {status === 'success' && (
                <p className="text-green-400 text-sm">Message sent successfully. We will get back to you soon.</p>
              )}
              {status === 'error' && (
                <p className="text-red-400 text-sm">Something went wrong. Please try again.</p>
              )}
              <button type="submit" disabled={status === 'loading'} className="btn-primary w-full justify-center">
                {status === 'loading' ? 'Sending...' : 'SEND MESSAGE'}
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
