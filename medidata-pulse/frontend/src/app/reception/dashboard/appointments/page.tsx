'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ReceptionistAppointments() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // ယနေ့အတွက် ရက်ချိန်းစာရင်းများ (သို့မဟုတ် အားလုံး) ကို ဆွဲထုတ်ရန်
  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem('token');
      // ယနေ့ရက်စွဲအလိုက် သို့မဟုတ် အားလုံးကို ဆွဲထုတ်ရန် API endpoint
      const res = await fetch('http://localhost:5000/api/appointments', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        // အချိန်အလိုက် (Appointment Time) စီစဥ်ပေးခြင်း
        const sortedData = (data.data || []).sort((a: any, b: any) => 
          a.appointment_time.localeCompare(b.appointment_time)
        );
        setAppointments(sortedData);
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
        fetchAppointments();
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

  return (
    <div className="flex min-h-screen bg-[#fcf8f7] text-gray-800">
      {/* Sidebar */}
      <aside className="flex w-64 flex-col border-r border-gray-200 bg-white p-6">
        <div className="mb-10 text-2xl font-black text-rose-500">Medidata Pulse</div>
        <nav className="flex flex-col space-y-2 text-gray-600 font-medium text-sm">
          <Link href="/receptionist/dashboard" className="rounded-xl px-4 py-3 hover:bg-gray-50 hover:text-rose-500 transition">
            🏠 Dashboard
          </Link>
          <Link href="/receptionist/dashboard/appointments" className="rounded-xl bg-rose-50 px-4 py-3 text-rose-600 shadow-sm font-semibold">
            📅 Appointments & Queue
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Receptionist - Patient Queue</h1>
            <p className="text-sm text-gray-500">Manage patient check-ins by appointment time and track consultation progress.</p>
          </div>
        </header>

        {loading ? (
          <div className="text-rose-500 font-medium text-sm">Loading queue...</div>
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
                      app.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                      app.status === 'scheduled' ? 'bg-purple-100 text-purple-700' :
                      app.status === 'completed' ? 'bg-green-100 text-green-700' :
                      app.status === 'cancelled' ? 'bg-gray-200 text-gray-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {app.status === 'pending' ? '⏳ Pending (စောင့်ဆိုင်းဆဲ)' :
                       app.status === 'confirmed' ? '✅ Confirmed (အတည်ပြုပြီး)' :
                       app.status === 'scheduled' ? '🏥 Scheduled / Checked-in (ဆေးခန်းရောက်ရှိ)' :
                       app.status === 'completed' ? '🏁 Completed (ပြီးဆုံးပြီ)' : app.status}
                    </span>
                    <span className="text-xs text-gray-400">ရက်ချိန်းအချိန်: <strong className="text-gray-700">{app.appointment_time}</strong></span>
                  </div>

                  <h3 className="font-bold text-gray-900 text-base">👤 လူနာအမည်: {app.patient_name || app.patient_id?.name || 'Unknown'}</h3>
                  <p className="text-xs text-gray-600">🩺 ဆရာဝန်: <span className="font-semibold text-gray-800">{app.doctor_name || 'General Doctor'}</span> | 📞 ဖုန်း: {app.patient_phone || 'N/A'}</p>
                  <p className="text-xs text-rose-600 font-medium">📝 ရောဂါလက္ခဏာ / မှတ်စု: {app.notes || 'မှတ်စုမပါရှိပါ'}</p>

                  {/* အကယ်၍ Completed ဖြစ်သွားပါက Diagnosis နှင့် Prescription ပြရန် */}
                  {app.status === 'completed' && (
                    <div className="bg-green-50 border border-green-100 p-3 rounded-xl text-xs text-green-800 mt-2 space-y-1">
                      <p><strong>🩺 ရောဂါစစ်ဆေးတွေ့ရှိချက် (Diagnosis):</strong> {app.diagnosis || 'မရှိပါ'}</p>
                      <p><strong>💊 ပေးခဲ့သောဆေးစာ (Prescription):</strong> {app.prescription || 'မရှိပါ'}</p>
                    </div>
                  )}
                </div>

                {/* Confirmed ဖြစ်နေသော လူနာဆေးခန်းရောက်လာပါက Check-in (Scheduled) လုပ်ရန် ခလုတ်ပြမည် */}
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
                  <span className="text-xs text-purple-600 font-bold bg-purple-50 px-3 py-1.5 rounded-xl border border-purple-100">
                    ဆရာဝန်ပြသရန် စောင့်ဆိုင်းနေသည်...
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-10 rounded-2xl text-center text-xs text-gray-400 border border-gray-100 shadow-sm">
            ယနေ့အတွက် ချိန်းဆိုထားသော လူနာစာရင်းများ မရှိသေးပါ။
          </div>
        )}
      </main>
    </div>
  );
}