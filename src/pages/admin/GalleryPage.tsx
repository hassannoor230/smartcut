import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../../lib/api';
import type { GalleryItem } from '../../types';
import { Modal } from '../../components/ui/Modal';
import { Plus, Pencil, Trash2 } from 'lucide-react';

const formSchema = z.object({
  title: z.string().min(1, 'Title required'),
  imageUrl: z.string().min(1, 'Image URL required'),
  thumbnailUrl: z.string().optional(),
  category: z.string().optional(),
  altText: z.string().optional(),
  featured: z.boolean().optional(),
  active: z.boolean().optional(),
  sortOrder: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function AdminGalleryPage() {
  const [editing, setEditing] = useState<GalleryItem | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: items, isLoading } = useQuery({
    queryKey: ['admin-gallery'],
    queryFn: async () => {
      const { data } = await api.get('/admin/gallery');
      return data.data as GalleryItem[];
    },
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const openCreate = () => {
    setEditing(null);
    setCreating(true);
    reset({
      title: '',
      imageUrl: '',
      thumbnailUrl: '',
      category: 'general',
      altText: '',
      featured: false,
      active: true,
      sortOrder: '0',
    });
  };

  const openEdit = (item: GalleryItem) => {
    setCreating(false);
    setEditing(item);
    reset({
      title: item.title,
      imageUrl: item.imageUrl,
      thumbnailUrl: item.thumbnailUrl || '',
      category: item.category || 'general',
      altText: item.altText || '',
      featured: item.featured,
      active: item.active,
      sortOrder: String(item.sortOrder ?? 0),
    });
  };

  const closeForm = () => {
    setCreating(false);
    setEditing(null);
  };

  const saveMutation = useMutation({
    mutationFn: async (form: FormData) => {
      const payload = {
        title: form.title,
        imageUrl: form.imageUrl,
        thumbnailUrl: form.thumbnailUrl || undefined,
        category: form.category || 'general',
        altText: form.altText || '',
        featured: form.featured ?? false,
        active: form.active ?? true,
        sortOrder: form.sortOrder ? Number(form.sortOrder) : 0,
      };
      if (editing) {
        await api.patch(`/admin/gallery/${editing._id}`, payload);
      } else {
        await api.post('/admin/gallery', payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-gallery'] });
      queryClient.invalidateQueries({ queryKey: ['gallery'] });
      closeForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/admin/gallery/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-gallery'] });
      queryClient.invalidateQueries({ queryKey: ['gallery'] });
      setDeleteId(null);
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, field, value }: { id: string; field: string; value: boolean }) => {
      await api.patch(`/admin/gallery/${id}`, { [field]: value });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-gallery'] });
      queryClient.invalidateQueries({ queryKey: ['gallery'] });
    },
  });

  return (
    <>
      <Helmet>
        <title>Gallery | Smartcut Admin</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Gallery</h1>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 bg-accent text-primary font-semibold px-4 py-2 rounded text-sm hover:bg-accent-hover"
        >
          <Plus size={16} /> Add Image
        </button>
      </div>

      {isLoading ? (
        <p className="text-gray-500">Loading...</p>
      ) : !items?.length ? (
        <p className="text-gray-500">No gallery items yet. Add authorized images only.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <div key={item._id} className="bg-white rounded-lg border overflow-hidden">
              <div className="aspect-square bg-gray-100">
                <img
                  src={item.thumbnailUrl || item.imageUrl}
                  alt={item.altText || item.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-3">
                <div className="font-medium text-sm truncate">{item.title}</div>
                <div className="text-xs text-gray-500 mt-1">{item.category}</div>
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() =>
                      toggleMutation.mutate({ id: item._id, field: 'featured', value: !item.featured })
                    }
                    className={`text-xs px-2 py-0.5 rounded ${item.featured ? 'bg-accent/20 text-accent' : 'bg-gray-100 text-gray-500'}`}
                  >
                    {item.featured ? 'Featured' : 'Feature'}
                  </button>
                  <button
                    onClick={() =>
                      toggleMutation.mutate({ id: item._id, field: 'active', value: !item.active })
                    }
                    className={`text-xs px-2 py-0.5 rounded ${item.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-700'}`}
                  >
                    {item.active ? 'Active' : 'Off'}
                  </button>
                </div>
                <div className="flex gap-2 mt-2">
                  <button onClick={() => openEdit(item)} className="inline-flex items-center justify-center w-8 h-8 rounded bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 hover:text-accent transition-colors">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => setDeleteId(item._id)} className="inline-flex items-center justify-center w-8 h-8 rounded bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={creating || !!editing} onClose={closeForm} title={editing ? 'Edit Image' : 'Add Image'}>
        <form onSubmit={handleSubmit((d) => saveMutation.mutate(d))} className="space-y-3">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Title *</label>
            <input {...register('title')} className="w-full border rounded px-3 py-2 text-sm" />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Image URL *</label>
            <input {...register('imageUrl')} className="w-full border rounded px-3 py-2 text-sm" placeholder="https://..." />
            {errors.imageUrl && <p className="text-red-500 text-xs mt-1">{errors.imageUrl.message}</p>}
            <p className="text-xs text-gray-400 mt-1">Use Cloudinary or authorized CDN URLs. Do not scrape copyrighted images.</p>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Thumbnail URL</label>
            <input {...register('thumbnailUrl')} className="w-full border rounded px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Category</label>
            <input {...register('category')} className="w-full border rounded px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Alt text</label>
            <input {...register('altText')} className="w-full border rounded px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Sort order</label>
            <input {...register('sortOrder')} type="number" className="w-full border rounded px-3 py-2 text-sm" />
          </div>
          <div className="flex gap-4">
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
        <p className="text-sm text-gray-600 mb-4">Are you sure you want to delete this gallery item?</p>
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
