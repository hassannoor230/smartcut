import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import api from '../../lib/api';
import type { BusinessSettings } from '../../types';

export default function AdminBusinessPage() {
  const queryClient = useQueryClient();
  const [saved, setSaved] = useState(false);

  const { data: settings, isLoading } = useQuery({
    queryKey: ['admin-business'],
    queryFn: async () => {
      const { data } = await api.get('/admin/business');
      return data.data as BusinessSettings;
    },
  });

  const { register, handleSubmit, reset, formState: { isDirty } } = useForm<BusinessSettings>({
    defaultValues: {
      businessName: '',
      category: '',
      phone: '',
      whatsapp: '',
      email: '',
      address: '',
      city: '',
      country: '',
      googleRating: 0,
      googleReviewCount: 0,
      googleMapsUrl: '',
      googleMapsEmbedUrl: '',
      websiteUrl: '',
      logoUrl: '',
      faviconUrl: '',
      aboutText: '',
      announcementText: '',
      announcementEnabled: false,
      whatsappEnabled: false,
      bookingEnabled: false,
      instagramUrl: '',
      facebookUrl: '',
    },
  });

  useEffect(() => {
    if (settings) reset(settings, { keepDirty: true });
  }, [settings, reset]);

  const mutation = useMutation({
    mutationFn: async (form: BusinessSettings) => {
      await api.patch('/admin/business', form);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-business'] });
      queryClient.invalidateQueries({ queryKey: ['business'] });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  if (isLoading) return <p className="text-gray-500">Loading...</p>;

  return (
    <>
      <Helmet>
        <title>Business Info | Smartcut Admin</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <h1 className="text-2xl font-bold mb-6">Business Information</h1>

      <form
        onSubmit={handleSubmit((data) => mutation.mutate(data))}
        className="bg-white rounded-lg border p-6 space-y-4 max-w-2xl"
      >
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Business name</label>
            <input {...register('businessName')} className="w-full border rounded px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Category</label>
            <input {...register('category')} className="w-full border rounded px-3 py-2 text-sm" />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Phone</label>
            <input {...register('phone')} className="w-full border rounded px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">WhatsApp</label>
            <input {...register('whatsapp')} className="w-full border rounded px-3 py-2 text-sm" placeholder="[ADD OFFICIAL WHATSAPP]" />
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Email</label>
          <input {...register('email')} type="email" className="w-full border rounded px-3 py-2 text-sm" />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Address</label>
          <textarea {...register('address')} rows={2} className="w-full border rounded px-3 py-2 text-sm" />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">City</label>
            <input {...register('city')} className="w-full border rounded px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Country</label>
            <input {...register('country')} className="w-full border rounded px-3 py-2 text-sm" />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Google Rating</label>
            <input {...register('googleRating', { valueAsNumber: true })} type="number" step="0.1" min="0" max="5" className="w-full border rounded px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Google Review Count</label>
            <input {...register('googleReviewCount', { valueAsNumber: true })} type="number" min="0" className="w-full border rounded px-3 py-2 text-sm" />
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Google Maps URL</label>
          <input {...register('googleMapsUrl')} className="w-full border rounded px-3 py-2 text-sm" placeholder="https://maps.google.com/..." />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Google Maps Embed URL</label>
          <input {...register('googleMapsEmbedUrl')} className="w-full border rounded px-3 py-2 text-sm" />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">About text</label>
          <textarea {...register('aboutText')} rows={4} className="w-full border rounded px-3 py-2 text-sm" placeholder="[ADD VERIFIED BUSINESS STORY]" />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Announcement text</label>
          <input {...register('announcementText')} className="w-full border rounded px-3 py-2 text-sm" />
        </div>

        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...register('announcementEnabled')} /> Announcement enabled
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...register('whatsappEnabled')} /> WhatsApp enabled
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...register('bookingEnabled')} /> Booking enabled
          </label>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Instagram URL</label>
            <input {...register('instagramUrl')} className="w-full border rounded px-3 py-2 text-sm" placeholder="[ADD OFFICIAL INSTAGRAM]" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Facebook URL</label>
            <input {...register('facebookUrl')} className="w-full border rounded px-3 py-2 text-sm" />
          </div>
        </div>

        {saved && <p className="text-green-600 text-sm">Business settings updated.</p>}
        {mutation.isError && <p className="text-red-500 text-sm">Failed to save. Please try again.</p>}

        <button
          type="submit"
          disabled={mutation.isPending}
          className="bg-accent text-primary font-semibold px-6 py-2.5 rounded text-sm hover:bg-accent-hover disabled:opacity-50"
        >
          {mutation.isPending ? 'Saving...' : 'Save changes'}
        </button>
      </form>
    </>
  );
}
