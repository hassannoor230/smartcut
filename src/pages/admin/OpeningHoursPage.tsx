import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import api from '../../lib/api';
import type { OpeningHours, DayHours } from '../../types';

const DAYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const;

type DayKey = (typeof DAYS)[number];

export default function AdminOpeningHoursPage() {
  const queryClient = useQueryClient();
  const [saved, setSaved] = useState(false);

  const { data: hours, isLoading } = useQuery({
    queryKey: ['admin-opening-hours'],
    queryFn: async () => {
      const { data } = await api.get('/admin/opening-hours');
      return data.data as OpeningHours;
    },
  });

  const { register, handleSubmit, reset, watch, setValue } = useForm<OpeningHours>();

  useEffect(() => {
    if (hours) reset(hours);
  }, [hours, reset]);

  const mutation = useMutation({
    mutationFn: async (form: OpeningHours) => {
      await api.patch('/admin/opening-hours', form);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-opening-hours'] });
      queryClient.invalidateQueries({ queryKey: ['opening-hours'] });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  if (isLoading) return <p className="text-gray-500">Loading...</p>;

  return (
    <>
      <Helmet>
        <title>Opening Hours | Smartcut Admin</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <h1 className="text-2xl font-bold mb-6">Opening Hours</h1>

      <form
        onSubmit={handleSubmit((data) => mutation.mutate(data))}
        className="bg-white rounded-lg border p-6 space-y-4 max-w-2xl"
      >
        <div>
          <label className="block text-sm text-gray-600 mb-1">Note</label>
          <input
            {...register('note')}
            className="w-full border rounded px-3 py-2 text-sm"
            placeholder="[CONFIRM OPENING HOURS]"
          />
          <p className="text-xs text-gray-400 mt-1">Shown when hours are not yet confirmed.</p>
        </div>

        {DAYS.map((day) => {
          const isOpen = watch(`${day}.isOpen` as const);
          return (
            <div key={day} className="border rounded p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium capitalize">{day}</span>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    {...register(`${day}.isOpen` as const)}
                    onChange={(e) => setValue(`${day}.isOpen` as const, e.target.checked)}
                  />
                  Open
                </label>
              </div>
              {isOpen && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Open time</label>
                    <input
                      type="time"
                      {...register(`${day}.openTime` as const)}
                      className="w-full border rounded px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Close time</label>
                    <input
                      type="time"
                      {...register(`${day}.closeTime` as const)}
                      className="w-full border rounded px-3 py-2 text-sm"
                    />
                  </div>
                  <label className="flex items-center gap-2 text-sm col-span-2">
                    <input type="checkbox" {...register(`${day}.is24Hours` as const)} />
                    24 hours
                  </label>
                </div>
              )}
            </div>
          );
        })}

        {saved && <p className="text-green-600 text-sm">Opening hours updated.</p>}
        {mutation.isError && <p className="text-red-500 text-sm">Failed to save. Please try again.</p>}

        <button
          type="submit"
          disabled={mutation.isPending}
          className="bg-accent text-primary font-semibold px-6 py-2.5 rounded text-sm hover:bg-accent-hover disabled:opacity-50"
        >
          {mutation.isPending ? 'Saving...' : 'Save opening hours'}
        </button>
      </form>
    </>
  );
}
