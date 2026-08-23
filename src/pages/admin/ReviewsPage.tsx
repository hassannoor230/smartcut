import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../../lib/api';
import type { Review } from '../../types';
import { Modal } from '../../components/ui/Modal';
import { Plus, Pencil, Trash2, Star } from 'lucide-react';

const formSchema = z.object({
  author: z.string().min(1, 'Author required'),
  rating: z.string().min(1),
  text: z.string().min(1, 'Review text required'),
  date: z.string().optional(),
  source: z.string().optional(),
  verified: z.boolean().optional(),
  featured: z.boolean().optional(),
  active: z.boolean().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function AdminReviewsPage() {
  const [editing, setEditing] = useState<Review | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: reviews, isLoading } = useQuery({
    queryKey: ['admin-reviews'],
    queryFn: async () => {
      const { data } = await api.get('/admin/reviews');
      return data.data as Review[];
    },
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const openCreate = () => {
    setEditing(null);
    setCreating(true);
    reset({
      author: '',
      rating: '5',
      text: '',
      date: new Date().toISOString().slice(0, 10),
      source: 'Google',
      verified: true,
      featured: false,
      active: true,
    });
  };

  const openEdit = (r: Review) => {
    setCreating(false);
    setEditing(r);
    reset({
      author: r.author,
      rating: String(r.rating),
      text: r.text,
      date: r.date ? new Date(r.date).toISOString().slice(0, 10) : '',
      source: r.source || 'Google',
      verified: r.verified,
      featured: r.featured,
      active: r.active,
    });
  };

  const closeForm = () => {
    setCreating(false);
    setEditing(null);
  };

  const saveMutation = useMutation({
    mutationFn: async (form: FormData) => {
      const payload = {
        author: form.author,
        rating: Number(form.rating),
        text: form.text,
        date: form.date || undefined,
        source: form.source || 'Google',
        verified: form.verified ?? false,
        featured: form.featured ?? false,
        active: form.active ?? true,
      };
      if (editing) {
        await api.patch(`/admin/reviews/${editing._id}`, payload);
      } else {
        await api.post('/admin/reviews', payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      closeForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/admin/reviews/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      setDeleteId(null);
    },
  });

  return (
    <>
      <Helmet>
        <title>Reviews | Smartcut Admin</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Reviews</h1>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 bg-accent text-primary font-semibold px-4 py-2 rounded text-sm hover:bg-accent-hover"
        >
          <Plus size={16} /> Add Review
        </button>
      </div>

      <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm p-3 rounded mb-6">
        Only publish reviews that are genuine and authorized. Do not invent testimonials.
      </div>

      {isLoading ? (
        <p className="text-gray-500">Loading...</p>
      ) : !reviews?.length ? (
        <p className="text-gray-500">No reviews added yet. Add authorized review content only.</p>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r._id} className="bg-white rounded-lg border p-4 flex flex-col sm:flex-row sm:items-start gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">{r.author}</span>
                  <span className="flex gap-0.5">
                    {Array.from({ length: r.rating }).map((_, i) => (
                      <Star key={i} size={12} className="text-accent fill-accent" />
                    ))}
                  </span>
                  {!r.active && <span className="text-xs text-red-600">Inactive</span>}
                  {r.featured && <span className="text-xs text-accent">Featured</span>}
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">{r.text}</p>
                <div className="text-xs text-gray-400 mt-1">
                  {r.source} · {r.date ? new Date(r.date).toLocaleDateString() : ''}
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => openEdit(r)} className="inline-flex items-center justify-center w-8 h-8 rounded bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 hover:text-accent transition-colors">
                  <Pencil size={16} />
                </button>
                <button onClick={() => setDeleteId(r._id)} className="inline-flex items-center justify-center w-8 h-8 rounded bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={creating || !!editing} onClose={closeForm} title={editing ? 'Edit Review' : 'Add Review'}>
        <form onSubmit={handleSubmit((d) => saveMutation.mutate(d))} className="space-y-3">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Customer name *</label>
            <input {...register('author')} className="w-full border rounded px-3 py-2 text-sm" />
            {errors.author && <p className="text-red-500 text-xs mt-1">{errors.author.message}</p>}
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Rating *</label>
            <select {...register('rating')} className="w-full border rounded px-3 py-2 text-sm">
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>{n} stars</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Review text *</label>
            <textarea {...register('text')} rows={4} className="w-full border rounded px-3 py-2 text-sm" />
            {errors.text && <p className="text-red-500 text-xs mt-1">{errors.text.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Date</label>
              <input type="date" {...register('date')} className="w-full border rounded px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Source</label>
              <input {...register('source')} className="w-full border rounded px-3 py-2 text-sm" placeholder="Google" />
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...register('verified')} /> Verified
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...register('featured')} /> Featured
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...register('active')} /> Active
            </label>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={closeForm} className="px-4 py-2 text-sm border rounded hover:bg-gray-50">Cancel</button>
            <button
              type="submit"
              disabled={saveMutation.isPending}
              className="px-4 py-2 text-sm bg-accent text-primary font-semibold rounded hover:bg-accent-hover disabled:opacity-50"
            >
              {saveMutation.isPending ? 'Saving...' : editing ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Confirm Delete">
        <p className="text-sm text-gray-600 mb-4">Are you sure you want to delete this review?</p>
        <div className="flex justify-end gap-2">
          <button onClick={() => setDeleteId(null)} className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button
            onClick={() => deleteId && deleteMutation.mutate(deleteId)}
            disabled={deleteMutation.isPending}
            className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </Modal>
    </>
  );
}
