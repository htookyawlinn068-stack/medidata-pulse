'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function PatientPrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('http://localhost:5000/api/prescriptions', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setPrescriptions(data.data || []);
        } else {
          setError(data.message || 'ဆေးညွှန်းအချက်အလက်များကို ရယူ၍မရပါ။');
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
    <div className="flex min-h-screen bg-[#fcf8f7] text-gray-800 font-sans">
      {/* Sidebar */}
      <aside className="flex w-64 flex-col border-r border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-10 text-2xl font-black text-rose-500 tracking-wide">Medidata Pulse</div>
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
          <Link href="/patient/dashboard/consultations" className="rounded-xl px-4 py-3 hover:bg-gray-50 hover:text-rose-500 transition">
            🩺 Consultations
          </Link>
          <Link href="/patient/dashboard/prescriptions" className="rounded-xl bg-rose-50 px-4 py-3 text-rose-600 shadow-sm font-semibold">
            💊 Prescriptions
          </Link>
          <Link href="/patient/dashboard/notifications" className="rounded-xl px-4 py-3 hover:bg-gray-50 hover:text-rose-500 transition">
            🔔 Notifications
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto max-w-5xl">
        <header className="mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">My Prescriptions</h1>
            <p className="text-xs text-gray-500 mt-1">ဆရာဝန်ကြီးများ ညွှန်ကြားထားသော ဆေးဝါးများနှင့် ကုသမှုမှတ်တမ်းစာရင်းများ</p>
          </div>
          <span className="text-xs font-bold bg-rose-50 text-rose-600 px-3.5 py-1.5 rounded-full shadow-sm">
            Total: {prescriptions.length}
          </span>
        </header>

        {loading ? (
          <div className="flex justify-center items-center py-20 text-rose-500 font-medium text-xs">
            ဆေးညွှန်းအချက်အလက်များကို ရှာဖွေနေပါသည်...
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-xs font-medium border border-red-100">
            {error}
          </div>
        ) : prescriptions.length > 0 ? (
          <div className="space-y-4">
            {prescriptions.map((item: any, idx: number) => (
              <div key={item._id || idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4 hover:shadow-md transition">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 border-b border-gray-100 pb-4">
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                      <span>👨‍⚕️ Dr. {item.doctor?.name || item.doctor?.username || item.doctorName || 'Specialist'}</span>
                      {item.doctor?.specialization && (
                        <span className="text-[11px] font-medium text-rose-500 bg-rose-50 px-2 py-0.5 rounded-md">
                          {item.doctor.specialization}
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">
                      📅 ရက်စွဲ: {new Date(item.date || item.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-[10px] bg-purple-50 text-purple-600 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                    Prescription Read-Only
                  </span>
                </div>

                <div className="bg-gray-50/70 p-4 rounded-xl space-y-3 border border-gray-100/80 text-xs">
                  <div>
                    <p className="font-bold text-gray-800 mb-1 flex items-center gap-1.5">
                      <span>💊</span> သောက်သုံးရန်ဆေးဝါးများ (Medicines):
                    </p>
                    <p className="text-gray-700 whitespace-pre-line font-medium pl-5">
                      {item.medicines || 'ဆေးအချက်အလက် မဖော်ပြထားပါ။'}
                    </p>
                  </div>

                  {item.description && (
                    <div className="border-t border-gray-200/60 pt-3 mt-2">
                      <p className="font-bold text-gray-800 mb-1 flex items-center gap-1.5">
                        <span>📝</span> ဆရာဝန်ညွှန်ကြားချက်များနှင့် အကြံပြုချက်များ (Instructions):
                      </p>
                      <p className="text-gray-600 whitespace-pre-line pl-5 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-12 rounded-2xl text-center text-xs text-gray-400 border border-gray-100 shadow-sm space-y-2">
            <p className="text-base">💊</p>
            <p>လောလောဆယ် ပြသထားသော ဆေးညွှန်းအသစ်များ မရှိသေးပါ။</p>
          </div>
        )}
      </main>
    </div>
  );
}