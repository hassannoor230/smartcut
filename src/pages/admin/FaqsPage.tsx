import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../../lib/api';
import type { FAQ } from '../../types';
import { Modal } from '../../components/ui/Modal';
import { Plus, Pencil, Trash2 } from 'lucide-react';

const formSchema = z.object({
  question: z.string().min(5, 'Question required'),
  answer: z.string().min(5, 'Answer required'),
  active: z.boolean().optional(),
  sortOrder: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function AdminFaqsPage() {
  const [editing, setEditing] = useState<FAQ | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: faqs, isLoading } = useQuery({
    queryKey: ['admin-faqs'],
    queryFn: async () => {
      const { data } = await api.get('/admin/faqs');
      return data.data as FAQ[];
    },
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const openCreate = () => {
    setEditing(null);
    setCreating(true);
    reset({ question: '', answer: '', active: true, sortOrder: '0' });
  };

  const openEdit = (f: FAQ) => {
    setCreating(false);
    setEditing(f);
    reset({
      question: f.question,
      answer: f.answer,
      active: f.active,
      sortOrder: String(f.sortOrder ?? 0),
    });
  };

  const closeForm = () => {
    setCreating(false);
    setEditing(null);
  };

  const saveMutation = useMutation({
    mutationFn: async (form: FormData) => {
      const payload = {
        question: form.question,
        answer: form.answer,
        active: form.active ?? true,
        sortOrder: form.sortOrder ? Number(form.sortOrder) : 0,
      };
      if (editing) {
        await api.patch(`/admin/faqs/${editing._id}`, payload);
      } else {
        await api.post('/admin/faqs', payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-faqs'] });
      queryClient.invalidateQueries({ queryKey: ['faqs'] });
      closeForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/admin/faqs/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-faqs'] });
      queryClient.invalidateQueries({ queryKey: ['faqs'] });
      setDeleteId(null);
    },
  });

  return (
    <>
      <Helmet>
        <title>FAQs | Smartcut Admin</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">FAQs</h1>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 bg-accent text-primary font-semibold px-4 py-2 rounded text-sm hover:bg-accent-hover"
        >
          <Plus size={16} /> Add FAQ
        </button>
      </div>

      {isLoading ? (
        <p className="text-gray-500">Loading...</p>
      ) : !faqs?.length ? (
        <p className="text-gray-500">No FAQs yet.</p>
      ) : (
        <div className="space-y-3">
          {faqs.map((f) => (
            <div key={f._id} className="bg-white rounded-lg border p-4 flex gap-3">
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">{f.question}</div>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{f.answer}</p>
                <div className="text-xs text-gray-400 mt-1">
                  Order: {f.sortOrder} · {f.active ? 'Active' : 'Inactive'}
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => openEdit(f)} className="inline-flex items-center justify-center w-8 h-8 rounded bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 hover:text-accent transition-colors">
                  <Pencil size={16} />
                </button>
                <button onClick={() => setDeleteId(f._id)} className="inline-flex items-center justify-center w-8 h-8 rounded bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={creating || !!editing} onClose={closeForm} title={editing ? 'Edit FAQ' : 'Add FAQ'}>
        <form onSubmit={handleSubmit((d) => saveMutation.mutate(d))} className="space-y-3">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Question *</label>
            <input {...register('question')} className="w-full border rounded px-3 py-2 text-sm" />
            {errors.question && <p className="text-red-500 text-xs mt-1">{errors.question.message}</p>}
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Answer *</label>
            <textarea {...register('answer')} rows={4} className="w-full border rounded px-3 py-2 text-sm" />
            {errors.answer && <p className="text-red-500 text-xs mt-1">{errors.answer.message}</p>}
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Sort order</label>
            <input {...register('sortOrder')} type="number" className="w-full border rounded px-3 py-2 text-sm" />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...register('active')} /> Active
          </label>
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
        <p className="text-sm text-gray-600 mb-4">Are you sure you want to delete this FAQ?</p>
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
