'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function PatientConsultationsPage() {
  const [consultations, setConsultations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('http://localhost:5000/api/consultations', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setConsultations(data.data || []);
        } else {
          setError(data.message || 'ဆွေးနွေးမှု မှတ်တမ်းများကို ရယူ၍မရပါ။');
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Fetch Error:', err);
        setError('ဆာဗာချိတ်ဆက်မှု အမှားအယွင်းရှိနေပါသည်။');
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
          <Link href="/patient/dashboard/records" className="rounded-xl px-4 py-3 hover:bg-gray-50 hover:text-rose-500 transition">
            📁 Health Records
          </Link>
          <Link href="/patient/dashboard/consultations" className="rounded-xl bg-rose-50 px-4 py-3 text-rose-600 shadow-sm font-semibold">
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
          <h1 className="text-3xl font-extrabold text-gray-900">My Consultations</h1>
          <p className="text-sm text-gray-500">ဆရာဝန်များနှင့် ပြသဆွေးနွေးခဲ့သော မှတ်တမ်းအချက်အလက်များနှင့် ရောဂါရှာဖွေချက်များ</p>
        </header>

        {loading ? (
          <div className="text-rose-500 font-medium text-xs">မှတ်တမ်းများကို ရှာဖွေနေပါသည်...</div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-xs">{error}</div>
        ) : consultations.length > 0 ? (
          <div className="space-y-4">
            {consultations.map((item: any, idx: number) => (
              <div key={item._id || idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] px-3 py-1 rounded-full font-bold uppercase ${
                      item.status === 'Completed' ? 'bg-green-100 text-green-700' :
                      item.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                      {item.status || 'Completed'}
                    </span>
                    <span className="text-xs text-gray-400">
                      📅 ရက်စွဲ: {new Date(item.date || item.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="font-bold text-gray-900 text-base">
                    👨‍⚕️ ဆရာဝန်: Dr. {item.doctor?.username || item.doctorName || 'General Practitioner'} 
                    {item.doctor?.specialization && (
                      <span className="text-xs font-normal text-rose-500 ml-1.5">({item.doctor.specialization})</span>
                    )}
                  </h3>

                  <div className="bg-gray-50 p-3 rounded-xl space-y-1 border border-gray-100">
                    <p className="text-xs text-gray-900 font-semibold">
                      🔍 ရောဂါရှာဖွေချက် (Diagnosis): <span className="font-normal text-gray-700">{item.diagnosis || 'မရှိပါ။'}</span>
                    </p>
                    {item.notes && (
                      <p className="text-xs text-gray-700">
                        📝 ဆရာဝန်မှတ်ချက် (Notes): <span className="font-normal text-gray-600">{item.notes}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-10 rounded-2xl text-center text-xs text-gray-400 border border-gray-100 shadow-sm">
            လောလောဆယ် ဆွေးနွေးမှု မှတ်တမ်းများ မရှိသေးပါ။
          </div>
        )}
      </main>
    </div>
  );
}