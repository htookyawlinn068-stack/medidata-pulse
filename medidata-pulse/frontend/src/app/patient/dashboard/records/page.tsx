'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function PatientRecords() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('http://localhost:5000/api/health-records', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setRecords(data.data || []);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching health records:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="flex min-h-screen bg-[#fcf8f7] text-gray-800">
      {/* Sidebar */}
      <aside className="flex w-64 flex-col border-r border-gray-200 bg-white p-6">
        <div className="mb-10 text-2xl font-black text-rose-500">Medidata Pulse</div>
        <nav className="flex flex-col space-y-2 text-gray-600 font-medium text-sm">
          <Link href="/patient/dashboard" className="rounded-xl px-4 py-3 hover:bg-gray-50 hover:text-rose-500 transition">
            🏠 Dashboard
          </Link>
          <Link href="/patient/dashboard/appointments" className="rounded-xl px-4 py-3 hover:bg-gray-50 hover:text-rose-500 transition">
            📅 Appointments
          </Link>
          {/* Health Records ကို Active ဖြစ်စေရန် ပြင်ဆင်ထားသည် */}
          <Link href="/patient/dashboard/records" className="rounded-xl bg-rose-50 px-4 py-3 text-rose-600 shadow-sm font-semibold">
            📁 Health Records
          </Link>
          <Link href="/patient/dashboard/consultations" className="rounded-xl px-4 py-3 hover:bg-gray-50 hover:text-rose-500 transition">
            🩺 Consultations
          </Link>
          <Link href="/patient/dashboard/prescriptions" className="rounded-xl px-4 py-3 hover:bg-gray-50 hover:text-rose-500 transition">
            💊 Prescriptions
          </Link>
          <Link href="/patient/dashboard/notifications" className="rounded-xl px-4 py-3 hover:bg-gray-50 hover:text-rose-500 transition">
            🔔 Notifications
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">Health Records</h1>
          <p className="text-sm text-gray-500">View your medical history, diagnosis, and prescriptions.</p>
        </header>

        {loading ? (
          <div className="text-rose-500 font-medium text-sm">Loading health records...</div>
        ) : records.length > 0 ? (
          <div className="space-y-4">
            {records.map((record: any) => (
              <div key={record._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{record.diagnosis}</h3>
                    <p className="text-xs text-rose-500 font-semibold">{new Date(record.record_date || record.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className="px-4 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold">
                    Record ID: {record._id?.slice(-6)}
                  </span>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl text-xs text-gray-700 space-y-1">
                  <p><span className="font-bold">Symptoms:</span> {record.symptoms || 'None reported'}</p>
                  <p className="mt-2"><span className="font-bold">Prescription:</span> {record.prescription || 'No medication assigned'}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-10 rounded-2xl text-center text-xs text-gray-400 border border-gray-100 shadow-sm">
            သိမ်းဆည်းထားသော ကျန်းမာရေး မှတ်တမ်းများ မရှိသေးပါ။
          </div>
        )}
      </main>
    </div>
  );
}