import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, Trash2 } from 'lucide-react';
import api from '../../lib/api';
import type { ContactEnquiry, Pagination } from '../../types';
import { Modal } from '../../components/ui/Modal';

export default function AdminEnquiriesPage() {
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<ContactEnquiry | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-enquiries', status, search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (status) params.set('status', status);
      if (search) params.set('search', search);
      const { data } = await api.get(`/admin/enquiries?${params}`);
      return data.data as { items: ContactEnquiry[]; pagination: Pagination };
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await api.patch(`/admin/enquiries/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-enquiries'] });
      setSelected(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/enquiries/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-enquiries'] });
      setDeleteId(null);
    },
  });

  const statusColors: Record<string, string> = {
    new: 'bg-blue-100 text-blue-800',
    read: 'bg-gray-100 text-gray-800',
    replied: 'bg-green-100 text-green-800',
    archived: 'bg-amber-100 text-amber-800',
  };

  return (
    <>
      <Helmet>
        <title>Enquiries | Smartcut Admin</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <h1 className="text-2xl font-bold mb-6">Enquiries</h1>

      <div className="flex flex-wrap gap-3 mb-6">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, phone, email..."
          className="border border-gray-300 rounded px-3 py-2 text-sm min-w-[200px]"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          <option value="new">New</option>
          <option value="read">Read</option>
          <option value="replied">Replied</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {isLoading ? (
        <p className="text-gray-500">Loading...</p>
      ) : !data?.items?.length ? (
        <p className="text-gray-500">No enquiries yet.</p>
      ) : (
        <div className="bg-white rounded-lg border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-3">Name</th>
                <th className="text-left p-3">Phone</th>
                <th className="text-left p-3">Email</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Date</th>
                <th className="text-left p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((e) => (
                <tr key={e._id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="p-3 font-medium">{e.name}</td>
                  <td className="p-3">{e.phone}</td>
                  <td className="p-3">{e.email || '—'}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[e.status] || ''}`}>
                      {e.status}
                    </span>
                  </td>
                  <td className="p-3">{new Date(e.createdAt).toLocaleDateString()}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <button onClick={() => setSelected(e)} className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200 rounded hover:bg-gray-100 transition-colors">
                        View
                      </button>
                      {e.status === 'new' && (
                        <button
                          onClick={() => updateMutation.mutate({ id: e._id, status: 'read' })}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200 rounded hover:bg-gray-100 transition-colors"
                        >
                          Mark read
                        </button>
                      )}
                      {(e.status === 'new' || e.status === 'read') && (
                        <button
                          onClick={() => updateMutation.mutate({ id: e._id, status: 'replied' })}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-green-50 text-green-700 border border-green-200 rounded hover:bg-green-100 transition-colors"
                        >
                          <Check size={14} />
                          Mark replied
                        </button>
                      )}
                      <button onClick={() => setDeleteId(e._id)} className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-red-50 text-red-700 border border-red-200 rounded hover:bg-red-100 transition-colors">
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={!!selected} onClose={() => setSelected(null)} title="Enquiry Details">
        {selected && (
          <div className="space-y-3 text-sm">
            <p><span className="text-gray-500">Name:</span> {selected.name}</p>
            <p><span className="text-gray-500">Phone:</span> {selected.phone}</p>
            <p><span className="text-gray-500">Email:</span> {selected.email || '—'}</p>
            <p><span className="text-gray-500">Service:</span> {selected.service || '—'}</p>
            <p><span className="text-gray-500">Status:</span> {selected.status}</p>
            <p><span className="text-gray-500">Date:</span> {new Date(selected.createdAt).toLocaleString()}</p>
            <div>
              <span className="text-gray-500">Message:</span>
              <p className="mt-1 p-3 bg-gray-50 rounded whitespace-pre-wrap">{selected.message}</p>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              {selected.status === 'new' && (
                <button
                  onClick={() => updateMutation.mutate({ id: selected._id, status: 'read' })}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200 rounded hover:bg-gray-100 transition-colors"
                >
                  Mark read
                </button>
              )}
              {(selected.status === 'new' || selected.status === 'read') && (
                <button
                  onClick={() => updateMutation.mutate({ id: selected._id, status: 'replied' })}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-green-50 text-green-700 border border-green-200 rounded hover:bg-green-100 transition-colors"
                >
                  <Check size={14} />
                  Mark replied
                </button>
              )}
              <button
                onClick={() => updateMutation.mutate({ id: selected._id, status: 'archived' })}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 rounded hover:bg-amber-100 transition-colors"
              >
                Archive
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Confirm Delete">
        <p className="text-sm text-gray-600 mb-4">Are you sure you want to delete this enquiry? This cannot be undone.</p>
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
