'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ManageAppointments() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:5000/api/admin/appointments', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setAppointments(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch appointments', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-100 font-sans">
      <aside className="w-64 bg-slate-950 border-r border-slate-800 p-6 flex flex-col justify-between">
        <div>
          <h2 className="text-xl font-black text-rose-500 mb-8">System Admin</h2>
          <nav className="space-y-2 text-sm font-medium text-slate-400">
            <Link href="/admin/dashboard" className="block px-4 py-3 rounded-xl hover:bg-slate-800">Overview</Link>
            <Link href="/admin/users" className="block px-4 py-3 rounded-xl hover:bg-slate-800">Manage Users</Link>
            <Link href="/admin/appointments" className="block px-4 py-3 rounded-xl bg-slate-800 text-white font-semibold">Appointments</Link>
          </nav>
        </div>
        <Link href="/login" className="text-sm font-medium text-rose-400 px-4 py-3 hover:bg-slate-800 rounded-xl">Logout</Link>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-8 flex justify-between items-center bg-slate-950 p-4 rounded-2xl border border-slate-800">
          <h1 className="text-xl font-bold">Appointment Management</h1>
        </header>

        <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase bg-slate-900/50">
                <th className="p-4">Patient Name</th>
                <th className="p-4">Doctor</th>
                <th className="p-4">Date & Time</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-sm">
              {loading ? (
                <tr><td colSpan={4} className="p-6 text-center text-slate-500">Loading appointments...</td></tr>
              ) : appointments.length === 0 ? (
                <tr><td colSpan={4} className="p-6 text-center text-slate-500">No appointments found.</td></tr>
              ) : (
                appointments.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-900/40">
                    <td className="p-4 font-semibold text-white">{item.patient?.username || 'N/A'}</td>
                    <td className="p-4 text-slate-300">{item.doctor?.username || 'N/A'}</td>
                    <td className="p-4 text-slate-400">{new Date(item.appointmentDate).toLocaleString()}</td>
                    <td className="p-4">
                      <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {item.status || 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}