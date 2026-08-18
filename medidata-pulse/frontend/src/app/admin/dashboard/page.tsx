'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [adminData, setAdminData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('http://localhost:5000/api/admin/dashboard', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setAdminData(data.data);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-slate-900 text-white">Loading Admin Control Panel...</div>;
  }

  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-100 font-sans">
      <aside className="w-64 bg-slate-950 border-r border-slate-800 p-6 flex flex-col justify-between">
        <div>
          <h2 className="text-xl font-black text-rose-500 mb-8">System Admin</h2>
          <nav className="space-y-2 text-sm font-medium text-slate-400">
            <Link href="/admin/dashboard" className="block px-4 py-3 rounded-xl bg-slate-800 text-white font-semibold">Overview</Link>
            <Link href="/admin/users" className="block px-4 py-3 rounded-xl hover:bg-slate-800">Manage Users</Link>
            <Link href="/admin/appointments" className="block px-4 py-3 rounded-xl hover:bg-slate-800">Appointments</Link>
          </nav>
        </div>
        <Link href="/login" className="text-sm font-medium text-rose-400 px-4 py-3 hover:bg-slate-800 rounded-xl">Logout</Link>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-8 flex justify-between items-center bg-slate-950 p-4 rounded-2xl border border-slate-800">
          <h1 className="text-xl font-bold">Admin Control Center Overview</h1>
        </header>

        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800">
            <p className="text-xs text-slate-400 font-semibold uppercase">Total Users</p>
            <p className="text-3xl font-black text-white mt-2">{adminData?.totalUsers || 0}</p>
          </div>
          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800">
            <p className="text-xs text-slate-400 font-semibold uppercase">Total Doctors</p>
            <p className="text-3xl font-black text-white mt-2">{adminData?.totalDoctors || 0}</p>
          </div>
          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800">
            <p className="text-xs text-slate-400 font-semibold uppercase">Total Receptionists</p>
            <p className="text-3xl font-black text-white mt-2">{adminData?.totalReceptionists || 0}</p>
          </div>
          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800">
            <p className="text-xs text-slate-400 font-semibold uppercase">Total Patients</p>
            <p className="text-3xl font-black text-white mt-2">{adminData?.totalPatients || 0}</p>
          </div>
        </div>
      </main>
    </div>
  );
}


  