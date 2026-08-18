'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function PatientAppointments() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // လူနာ၏ ရက်ချိန်းစာရင်းများကို ဆွဲထုတ်ရန်
  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/appointments', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setAppointments(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  // လူနာမှ ရက်ချိန်းကို ဖျက်သိမ်းခြင်း (Cancel)
  const handleCancelAppointment = async (appointmentId: string) => {
    if (!confirm('ဤရက်ချိန်းကို ဖျက်သိမ်းရန် သေချာပါသလား?')) return;

    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/appointments/${appointmentId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'cancelled' })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        alert('ရက်ချိန်းကို အောင်မြင်စွာ ဖျက်သိမ်းပြီးပါပြီ။');
        fetchAppointments();
      } else {
        throw new Error(data.message || 'Cancellation failed');
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'အမှားအယွင်း ရှိနေပါသည်။');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#fcf8f7] text-gray-800">
      {/* Sidebar */}
      <aside className="flex w-64 flex-col border-r border-gray-200 bg-white p-6">
        <div className="mb-10 text-2xl font-black text-rose-500">Medidata Pulse</div>
        <nav className="flex flex-col space-y-2 text-gray-600 font-medium text-sm">
          <Link href="/patient/dashboard" className="rounded-xl px-4 py-3 hover:bg-gray-50 hover:text-rose-500 transition">
            🏠 Dashboard
          </Link>
          <Link href="/patient/dashboard/appointments" className="rounded-xl bg-rose-50 px-4 py-3 text-rose-600 shadow-sm font-semibold">
            📅 Appointments
          </Link>
          <Link href="/patient/dashboard/records" className="rounded-xl px-4 py-3 hover:bg-gray-50 hover:text-rose-500 transition">
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
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">My Appointments</h1>
            <p className="text-sm text-gray-500">View and manage all your scheduled medical consultations and statuses.</p>
          </div>
          <Link 
            href="/patient/dashboard/book"
            className="bg-rose-500 hover:bg-rose-600 text-white px-5 py-2.5 rounded-xl font-semibold text-xs shadow transition cursor-pointer"
          >
            + Book New Appointment
          </Link>
        </header>

        {loading ? (
          <div className="text-rose-500 font-medium text-sm">Loading appointments...</div>
        ) : appointments.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {appointments.map((app: any) => (
              <div 
                key={app._id || app.id} 
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Status Badge */}
                    <span className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-full ${
                      app.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      app.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                      app.status === 'rejected' ? 'bg-rose-100 text-rose-700' :
                      app.status === 'cancelled' ? 'bg-gray-200 text-gray-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {app.status === 'pending' ? '⏳ Pending (စောင့်ဆိုင်းဆဲ)' :
                       app.status === 'confirmed' ? '✅ Confirmed (အတည်ပြုပြီး)' :
                       app.status === 'rejected' ? '❌ Rejected (ငြင်းပယ်သည်)' :
                       app.status === 'cancelled' ? '🚫 Cancelled (ဖျက်သိမ်းပြီး)' : app.status}
                    </span>
                    <span className="text-xs text-gray-400">တင်ခဲ့ချိန်: {new Date(app.createdAt).toLocaleDateString()}</span>
                  </div>

                  <h3 className="font-bold text-gray-900 text-base">🩺 ဆရာဝန်: {app.doctor_name || 'General Doctor'}</h3>
                  <p className="text-xs text-gray-600">📅 လိုချင်သည့်ရက်: <span className="font-semibold text-gray-800">{new Date(app.appointment_date).toISOString().split('T')[0]}</span> | 🕒 အချိန်: <span className="font-semibold text-gray-800">{app.appointment_time}</span></p>
                  <p className="text-xs text-rose-600 font-medium">📝 ရောဂါလက္ခဏာ / မှတ်စု: {app.notes || 'မှတ်စုမပါရှိပါ'}</p>

                  {/* ဆရာဝန်မှ ငြင်းပယ်ပါက အကြောင်းပြချက်ပြရန် */}
                  {app.status === 'rejected' && app.rejection_reason && (
                    <div className="bg-rose-50 border border-rose-100 p-3 rounded-xl text-xs text-rose-700 mt-2">
                      <p className="font-bold">⚠️ ငြင်းပယ်ရသည့် အကြောင်းပြချက်:</p>
                      <p>{app.rejection_reason}</p>
                    </div>
                  )}
                </div>

                {/* ဖျက်သိမ်းရန် ခလုတ် (Pending သို့မဟုတ် Confirmed ဖြစ်နေမှသာ ပြမည်) */}
                {(app.status === 'pending' || app.status === 'confirmed') && (
                  <button
                    onClick={() => handleCancelAppointment(app._id || app.id)}
                    disabled={actionLoading}
                    className="bg-gray-100 hover:bg-rose-50 text-rose-600 font-semibold px-4 py-2 rounded-xl text-xs transition border border-gray-200 cursor-pointer shadow-sm"
                  >
                    🚫 Cancel Appointment
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-10 rounded-2xl text-center text-xs text-gray-400 border border-gray-100 shadow-sm">
            လောလောဆယ် ချိန်းဆိုထားသော ရက်ချိန်းများ မရှိသေးပါ။
          </div>
        )}
      </main>
    </div>
  );
}