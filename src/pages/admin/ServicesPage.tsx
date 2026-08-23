import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../../lib/api';
import type { Service } from '../../types';
import { Modal } from '../../components/ui/Modal';
import { formatPrice } from '../../lib/utils';
import { Plus, Pencil, Trash2 } from 'lucide-react';

const serviceFormSchema = z.object({
  name: z.string().min(2, 'Name required'),
  description: z.string().optional(),
  price: z.string().optional(),
  duration: z.string().optional(),
  category: z.string().min(1, 'Category required'),
  image: z.string().optional(),
  featured: z.boolean().optional(),
  active: z.boolean().optional(),
  sortOrder: z.string().optional(),
});

type ServiceForm = z.infer<typeof serviceFormSchema>;

export default function AdminServicesPage() {
  const [editing, setEditing] = useState<Service | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: services, isLoading } = useQuery({
    queryKey: ['admin-services'],
    queryFn: async () => {
      const { data } = await api.get('/admin/services');
      return data.data as Service[];
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ServiceForm>({ resolver: zodResolver(serviceFormSchema) });

  const openCreate = () => {
    setEditing(null);
    setCreating(true);
    reset({
      name: '',
      description: '',
      price: '',
      duration: '',
      category: 'Haircut',
      image: '',
      featured: false,
      active: true,
      sortOrder: '0',
    });
  };

  const openEdit = (s: Service) => {
    setCreating(false);
    setEditing(s);
    reset({
      name: s.name,
      description: s.description || '',
      price: s.price != null ? String(s.price) : '',
      duration: s.duration != null ? String(s.duration) : '',
      category: s.category,
      image: s.image || '',
      featured: s.featured,
      active: s.active,
      sortOrder: String(s.sortOrder ?? 0),
    });
  };

  const closeForm = () => {
    setCreating(false);
    setEditing(null);
  };

  const saveMutation = useMutation({
    mutationFn: async (form: ServiceForm) => {
      const payload = {
        name: form.name,
        description: form.description || '',
        price: form.price ? Number(form.price) : null,
        duration: form.duration ? Number(form.duration) : null,
        category: form.category,
        image: form.image || undefined,
        featured: form.featured ?? false,
        active: form.active ?? true,
        sortOrder: form.sortOrder ? Number(form.sortOrder) : 0,
      };
      if (editing) {
        await api.patch(`/admin/services/${editing._id}`, payload);
      } else {
        await api.post('/admin/services', payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] });
      queryClient.invalidateQueries({ queryKey: ['services'] });
      closeForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/services/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] });
      queryClient.invalidateQueries({ queryKey: ['services'] });
      setDeleteId(null);
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, field, value }: { id: string; field: string; value: boolean }) => {
      await api.patch(`/admin/services/${id}`, { [field]: value });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] });
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });

  return (
    <>
      <Helmet>
        <title>Services | Smartcut Admin</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Services</h1>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 bg-accent text-primary font-semibold px-4 py-2 rounded text-sm hover:bg-accent-hover"
        >
          <Plus size={16} /> Add Service
        </button>
      </div>

      {isLoading ? (
        <p className="text-gray-500">Loading...</p>
      ) : !services?.length ? (
        <p className="text-gray-500">No services yet. Add your first service.</p>
      ) : (
        <div className="bg-white rounded-lg border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-3">Name</th>
                <th className="text-left p-3">Category</th>
                <th className="text-left p-3">Price</th>
                <th className="text-left p-3">Featured</th>
                <th className="text-left p-3">Active</th>
                <th className="text-left p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {services.map((s) => (
                <tr key={s._id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="p-3">
                    <div className="font-medium">{s.name}</div>
                    {s.isPlaceholder && (
                      <span className="text-xs text-amber-600">Placeholder</span>
                    )}
                  </td>
                  <td className="p-3">{s.category}</td>
                  <td className="p-3">{formatPrice(s.price)}</td>
                  <td className="p-3">
                    <button
                      onClick={() =>
                        toggleMutation.mutate({ id: s._id, field: 'featured', value: !s.featured })
                      }
                      className={`text-xs px-2 py-0.5 rounded ${s.featured ? 'bg-accent/20 text-accent' : 'bg-gray-100 text-gray-500'}`}
                    >
                      {s.featured ? 'Yes' : 'No'}
                    </button>
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() =>
                        toggleMutation.mutate({ id: s._id, field: 'active', value: !s.active })
                      }
                      className={`text-xs px-2 py-0.5 rounded ${s.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-700'}`}
                    >
                      {s.active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(s)} className="inline-flex items-center justify-center w-8 h-8 rounded bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 hover:text-accent transition-colors">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => setDeleteId(s._id)} className="inline-flex items-center justify-center w-8 h-8 rounded bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={creating || !!editing}
        onClose={closeForm}
        title={editing ? 'Edit Service' : 'Add Service'}
      >
        <form
          onSubmit={handleSubmit((data) => saveMutation.mutate(data))}
          className="space-y-3"
        >
          <div>
            <label className="block text-sm text-gray-600 mb-1">Name *</label>
            <input {...register('name')} className="w-full border rounded px-3 py-2 text-sm" />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Description</label>
            <textarea {...register('description')} rows={3} className="w-full border rounded px-3 py-2 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Price (leave empty = on enquiry)</label>
              <input {...register('price')} type="number" className="w-full border rounded px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Duration (min)</label>
              <input {...register('duration')} type="number" className="w-full border rounded px-3 py-2 text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Category *</label>
            <input {...register('category')} className="w-full border rounded px-3 py-2 text-sm" placeholder="Haircut, Beard Grooming..." />
            {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Image URL</label>
            <input {...register('image')} className="w-full border rounded px-3 py-2 text-sm" placeholder="https://..." />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Sort order</label>
            <input {...register('sortOrder')} type="number" className="w-full border rounded px-3 py-2 text-sm" />
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...register('featured')} />
              Featured
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...register('active')} />
              Active
            </label>
          </div>
          {saveMutation.isError && (
            <p className="text-red-500 text-sm">Failed to save. Please try again.</p>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={closeForm} className="px-4 py-2 text-sm border rounded hover:bg-gray-50">
              Cancel
            </button>
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
        <p className="text-sm text-gray-600 mb-4">Are you sure you want to delete this service?</p>
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
