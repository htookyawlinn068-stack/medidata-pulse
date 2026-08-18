'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ReceptionDashboard() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({
    total_today: 0,
    pending_today: 0,
    confirmed_today: 0,
    scheduled_today: 0,
    completed_today: 0,
    cancelled_today: 0
  });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ဒေတာများ ဆွဲထုတ်ရန် (Appointments & Summary)
  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      // ၁။ ရက်ချိန်းစာရင်းများ ဆွဲထုတ်ခြင်း
      const resApp = await fetch('http://localhost:5000/api/appointments', { headers });
      const dataApp = await resApp.json();

      // ၂။ စာရင်းချုပ် (Summary) ဆွဲထုတ်ခြင်း
      const resSum = await fetch('http://localhost:5000/api/appointments/summary', { headers });
      const dataSum = await resSum.json();

      if (dataApp.success) {
        // ရက်ချိန်းအချိန် (appointment_time) အလိုက် အစဉ်လိုက် စီပေးခြင်း
        const sortedAppointments = (dataApp.data || []).sort((a: any, b: any) => 
          (a.appointment_time || '').localeCompare(b.appointment_time || '')
        );
        setAppointments(sortedAppointments);
      }

      if (dataSum.success) {
        setSummary(dataSum.data);
      }
    } catch (err) {
      console.error('Error fetching reception data:', err);
      setError('Server နှင့် ချိတ်ဆက်ရာတွင် အမှားအယွင်း ရှိနေပါသည်။');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // လူနာ ဆေးခန်းရောက်လာပါက Check-in လုပ်ရန် (Status ကို 'scheduled' သို့ပြောင်းခြင်း)
  const handleCheckIn = async (appointmentId: string) => {
    if (!confirm('ဤလူနာ ဆေးခန်းသို့ ရောက်ရှိလာပြီ (Check-in) ဖြစ်ကြောင်း အတည်ပြုပါသလား?')) return;

    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/appointments/${appointmentId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'scheduled' })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        alert('လူနာ Check-in လုပ်ခြင်း အောင်မြင်ပါသည်။ (Status: Scheduled)');
        fetchData(); // Data များကို ပုံမှန် refresh လုပ်ရန်
      } else {
        throw new Error(data.message || 'Check-in failed');
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'အမှားအယွင်း ရှိနေပါသည်။');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-slate-50 text-slate-600">Loading Reception Dashboard...</div>;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 p-6 flex flex-col justify-between">
        <div>
          <h2 className="text-xl font-black text-indigo-600 mb-8">Reception Desk</h2>
          <nav className="space-y-2 text-sm font-medium">
            <Link href="/reception/dashboard" className="block px-4 py-3 rounded-xl bg-indigo-50 text-indigo-600 font-semibold">
              🏠 Dashboard & Queue
            </Link>
            <Link href="/reception/patients/register" className="block px-4 py-3 rounded-xl hover:bg-slate-50 text-slate-600">
              👤 Register Patient
            </Link>
          </nav>
        </div>
        <Link href="/login" className="text-sm font-medium text-rose-500 px-4 py-3 hover:bg-rose-50 rounded-xl">
          🚪 Logout
        </Link>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-8 flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Reception Portal & Queue</h1>
            <p className="text-xs text-slate-500 mt-1">Manage today's patient check-ins and appointment queues smoothly.</p>
          </div>
        </header>

        {error && <div className="mb-6 bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl text-xs">{error}</div>}

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-[11px] text-slate-400 font-bold uppercase">Today Total</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{summary.total_today || 0}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-[11px] text-blue-500 font-bold uppercase">Confirmed</p>
            <p className="text-2xl font-black text-blue-600 mt-1">{summary.confirmed_today || 0}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-[11px] text-purple-500 font-bold uppercase">Checked-in (Scheduled)</p>
            <p className="text-2xl font-black text-purple-600 mt-1">{summary.scheduled_today || 0}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-[11px] text-green-500 font-bold uppercase">Completed</p>
            <p className="text-2xl font-black text-green-600 mt-1">{summary.completed_today || 0}</p>
          </div>
        </div>

        {/* Appointment Queue Section */}
        <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 mb-4">📅 Today's Patient Queue (အချိန်အလိုက် တန်းစီဇယား)</h2>
          
          {appointments.length > 0 ? (
            <div className="space-y-4">
              {appointments.map((app: any) => (
                <div 
                  key={app._id || app.id} 
                  className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full ${
                        app.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        app.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                        app.status === 'scheduled' ? 'bg-purple-100 text-purple-700' :
                        app.status === 'completed' ? 'bg-green-100 text-green-700' :
                        app.status === 'cancelled' ? 'bg-gray-200 text-gray-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {app.status === 'pending' ? '⏳ Pending' :
                         app.status === 'confirmed' ? '✅ Confirmed' :
                         app.status === 'scheduled' ? '🏥 Checked-in (ဆရာဝန်စောင့်ဆိုင်းဆဲ)' :
                         app.status === 'completed' ? '🏁 Completed' : app.status}
                      </span>
                      <span className="text-xs text-slate-500 font-semibold">🕒 အချိန်: {app.appointment_time}</span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-sm">👤 လူနာအမည်: {app.patient_name || 'Unknown Patient'}</h3>
                    <p className="text-xs text-slate-600">🩺 ဆရာဝန်: <span className="font-semibold">{app.doctor_name || 'General Doctor'}</span> | 📞 ဖုန်း: {app.patient_phone || 'N/A'}</p>
                    <p className="text-xs text-rose-600">📝 မှတ်စု/ရောဂါလက္ခဏာ: {app.notes || 'မရှိပါ'}</p>

                    {/* ဆရာဝန်စစ်ဆေးမှု ပြီးဆုံးပါက Diagnosis နဲ့ Prescription ပြသရန် */}
                    {app.status === 'completed' && (
                      <div className="bg-green-50 border border-green-200 p-3 rounded-lg text-xs text-green-900 mt-2 space-y-1">
                        <p><strong>🩺 Diagnosis:</strong> {app.diagnosis || 'မရှိပါ'}</p>
                        <p><strong>💊 Prescription:</strong> {app.prescription || 'မရှိပါ'}</p>
                      </div>
                    )}
                  </div>

                  {/* Confirmed ဖြစ်နေလျှင် Check-In ခလုတ်ပြမည် */}
                  {app.status === 'confirmed' && (
                    <button
                      onClick={() => handleCheckIn(app._id || app.id)}
                      disabled={actionLoading}
                      className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2 rounded-xl text-xs transition cursor-pointer shadow-sm"
                    >
                      🏥 Check-In (ဆေးခန်းရောက်ပြီ)
                    </button>
                  )}

                  {app.status === 'scheduled' && (
                    <span className="text-xs text-purple-700 font-bold bg-purple-50 px-3 py-2 rounded-xl border border-purple-200">
                      ဆရာဝန်ပြသရန် စောင့်ဆိုင်းနေသည်...
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-xs text-slate-400 border border-dashed rounded-xl">
              လောလောဆယ် ချိန်းဆိုထားသော ရက်ချိန်းစာရင်းများ မရှိသေးပါ။
            </div>
          )}
        </section>
      </main>
    </div>
  );
}