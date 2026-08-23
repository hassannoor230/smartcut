import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import api from '../../lib/api';
import { Calendar, CheckCircle, MessageSquare, Scissors } from 'lucide-react';

export default function AdminDashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => {
      const { data } = await api.get('/admin/dashboard');
      return data.data as {
        pendingAppointments: number;
        confirmedAppointments: number;
        newEnquiries: number;
        activeServices: number;
      };
    },
  });

  const cards = [
    { label: 'Pending Appointments', value: data?.pendingAppointments ?? 0, icon: Calendar, color: 'text-amber-600' },
    { label: 'Confirmed Appointments', value: data?.confirmedAppointments ?? 0, icon: CheckCircle, color: 'text-green-600' },
    { label: 'New Enquiries', value: data?.newEnquiries ?? 0, icon: MessageSquare, color: 'text-blue-600' },
    { label: 'Active Services', value: data?.activeServices ?? 0, icon: Scissors, color: 'text-accent' },
  ];

  return (
    <>
      <Helmet>
        <title>Dashboard | Smartcut Admin</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      {isLoading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((c) => (
            <div key={c.label} className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-500">{c.label}</span>
                <c.icon size={20} className={c.color} />
              </div>
              <div className="text-3xl font-bold text-dark-text">{c.value}</div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
