import { Helmet } from 'react-helmet-async';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, X } from 'lucide-react';
import api from '../../lib/api';
import type { Appointment, Pagination } from '../../types';
import { useState } from 'react';

export default function AdminAppointmentsPage() {
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-appointments', status, search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (status) params.set('status', status);
      if (search) params.set('search', search);
      const { data } = await api.get(`/admin/appointments?${params}`);
      return data.data as { items: Appointment[]; pagination: Pagination };
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await api.patch(`/admin/appointments/${id}`, { status });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-appointments'] }),
  });

  const statusColors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-800',
    confirmed: 'bg-green-100 text-green-800',
    completed: 'bg-blue-100 text-blue-800',
    cancelled: 'bg-gray-100 text-gray-800',
    rejected: 'bg-red-100 text-red-800',
  };

  return (
    <>
      <Helmet>
        <title>Appointments | Smartcut Admin</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <h1 className="text-2xl font-bold mb-6">Appointments</h1>
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name or phone..."
          className="border border-gray-300 rounded px-3 py-2 text-sm"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>
      {isLoading ? (
        <p className="text-gray-500">Loading...</p>
      ) : !data?.items?.length ? (
        <p className="text-gray-500">No appointment requests yet.</p>
      ) : (
        <div className="bg-white rounded-lg border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-3">Customer</th>
                <th className="text-left p-3">Phone</th>
                <th className="text-left p-3">Service</th>
                <th className="text-left p-3">Date</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((a) => (
                <tr key={a._id} className="border-b last:border-0">
                  <td className="p-3 font-medium">{a.customerName}</td>
                  <td className="p-3">{a.phone}</td>
                  <td className="p-3">{a.serviceName || '—'}</td>
                  <td className="p-3">{new Date(a.preferredDate).toLocaleDateString()}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[a.status] || ''}`}>
                      {a.status}
                    </span>
                  </td>
                  <td className="p-3">
                    {a.status === 'pending' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateMutation.mutate({ id: a._id, status: 'confirmed' })}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-green-50 text-green-700 border border-green-200 rounded hover:bg-green-100 transition-colors"
                        >
                          <Check size={14} />
                          Confirm
                        </button>
                        <button
                          onClick={() => updateMutation.mutate({ id: a._id, status: 'rejected' })}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-red-50 text-red-700 border border-red-200 rounded hover:bg-red-100 transition-colors"
                        >
                          <X size={14} />
                          Reject
                        </button>
                      </div>
                    )}
                    {a.status === 'confirmed' && (
                      <button
                        onClick={() => updateMutation.mutate({ id: a._id, status: 'completed' })}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 rounded hover:bg-blue-100 transition-colors"
                      >
                        <Check size={14} />
                        Complete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
