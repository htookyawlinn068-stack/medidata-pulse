'use client';
import { useState, useEffect } from 'react';

export default function DoctorAppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  
  // Status အလိုက် Filter လုပ်ရန် Tab State ('all' | 'pending' | 'confirmed' | 'rejected')
  const [activeTab, setActiveTab] = useState('all');

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/appointments', {
        headers: { 'Authorization': `Bearer ${token}` }
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

  const handleUpdateStatus = async (appointmentId: string, newStatus: string) => {
    if (newStatus === 'rejected' && !rejectionReason.trim()) {
      alert('ကျေးဇူးပြု၍ ငြင်းပယ်ရသည့် အကြောင်းပြချက်ကို ထည့်သွင်းပါ။');
      return;
    }

    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/appointments/${appointmentId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: newStatus,
          rejection_reason: newStatus === 'rejected' ? rejectionReason : ''
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        alert(`ရက်ချိန်းကို '${newStatus}' သို့ အောင်မြင်စွာ ပြောင်းလဲပြီးပါပြီ။`);
        setSelectedApp(null);
        setRejectionReason('');
        fetchAppointments();
      } else {
        throw new Error(data.message || 'Status update failed');
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'အမှားအယွင်း ရှိနေပါသည်။');
    } finally {
      setActionLoading(false);
    }
  };

  const formatTimestamp = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Tab အလိုက် Data စစ်ထုတ်ခြင်း
  const filteredAppointments = appointments.filter((app: any) => {
    if (activeTab === 'all') return true;
    return app.status === activeTab;
  });

  if (loading) {
    return <div className="flex h-screen items-center justify-center text-indigo-600 text-xs font-medium">Loading appointments...</div>;
  }

  return (
    <div className="min-h-screen bg-[#f4f7fe] text-gray-800 p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6 bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">🩺 Doctor Appointments Management</h1>
            <p className="text-xs text-slate-400 mt-1">လူနာများ၏ ရက်ချိန်းတောင်းဆိုမှုများနှင့် အတည်ပြုပြီးစာရင်းများ</p>
          </div>
          <a href="/doctor/dashboard" className="text-xs font-semibold text-indigo-600 hover:underline">
            ← Dashboard သို့ ပြန်ရန်
          </a>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {[
            { id: 'all', label: 'All Appointments', count: appointments.length },
            { id: 'pending', label: 'Pending Requests', count: appointments.filter(a => a.status === 'pending').length },
            { id: 'confirmed', label: 'Confirmed', count: appointments.filter(a => a.status === 'confirmed').length },
            { id: 'rejected', label: 'Rejected', count: appointments.filter(a => a.status === 'rejected').length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-2 shadow-sm ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/60'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                activeTab === tab.id ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Appointments List Grid */}
        {filteredAppointments.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl shadow-sm text-center text-slate-400 text-xs border border-slate-200/60">
            ဒီစာရင်းတွင် ရက်ချိန်းများ မရှိသေးပါ။
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAppointments.map((app: any) => {
              const isPending = app.status === 'pending';
              const patientData = app.patient_id || {}; // 🌟 Backend populated field name ကို ချိတ်ဆက်ပေးထားသည်

              return (
                <div 
                  key={app._id || app.id} 
                  className={`bg-white p-6 rounded-2xl shadow-sm transition-all border ${
                    isPending ? 'border-amber-300 ring-2 ring-amber-50' : 'border-slate-200/60'
                  } flex flex-col justify-between`}
                >
                  <div>
                    {/* Top Status & Timestamp */}
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        {isPending && (
                          <span className="bg-amber-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full animate-pulse shadow-sm">
                            ● NEW
                          </span>
                        )}
                        <span className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-full ${
                          app.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                          app.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' :
                          app.status === 'rejected' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {app.status}
                        </span>
                      </div>

                      <div className="text-right text-[11px] text-slate-400">
                        <p>📥 တင်ခဲ့ချိန်: <span className="font-semibold text-slate-600">{formatTimestamp(app.createdAt)}</span></p>
                      </div>
                    </div>

                    {/* Appointment Date & Time Box */}
                    <div className="bg-indigo-50/50 p-3 rounded-xl mb-3 flex justify-between items-center text-xs border border-indigo-100/60">
                      <p className="text-indigo-900 font-bold">📅 ရက်စွဲ: {app.appointment_date ? new Date(app.appointment_date).toISOString().split('T')[0] : 'N/A'}</p>
                      <p className="text-indigo-900 font-bold">🕒 အချိန်: {app.appointment_time || 'N/A'}</p>
                    </div>

                    {/* Patient Details */}
                    <div className="bg-slate-50 p-4 rounded-xl mb-3 text-xs space-y-1.5 border border-slate-100">
                      <p className="font-bold text-slate-900 text-sm">👤 {patientData.name || patientData.username || app.patient_name || 'N/A'}</p>
                      <p className="text-slate-600">📞 Phone: {patientData.phone || app.patient_phone || 'N/A'}</p>
                      <p className="text-slate-600">🧬 Gender: {patientData.gender || app.patient_gender || 'N/A'} | Age: {patientData.age || app.patient_age || 'N/A'}</p>
                      
                      {/* Allergies info */}
                      {(patientData.allergies || app.allergies) && (
                        <p className="text-rose-600 font-semibold bg-rose-50 p-2 rounded-lg border border-rose-100 mt-1">
                          ⚠️ ဓာတ်မတည့်မှု (Allergies): {patientData.allergies || app.allergies}
                        </p>
                      )}

                      <p className="text-slate-700 font-medium mt-1">🩺 ရောဂါလက္ခဏာ / မှတ်စု: {app.notes || 'မှတ်စုမပါရှိပါ'}</p>
                      
                      {/* Rejected Reason (If rejected) */}
                      {app.status === 'rejected' && app.rejection_reason && (
                        <p className="text-rose-600 bg-rose-50 p-2 rounded-lg mt-1 font-medium">
                          ❌ ငြင်းပယ်ရသည့်အကြောင်းရင်း: {app.rejection_reason}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Accept / Reject Buttons (Pending ဖြစ်မှသာ ပေါ်မည်) */}
                  {isPending && (
                    <div className="flex gap-2 pt-3 border-t border-slate-100">
                      <button
                        onClick={() => handleUpdateStatus(app._id || app.id, 'confirmed')}
                        disabled={actionLoading}
                        className="flex-1 bg-emerald-600 text-white font-semibold py-2.5 rounded-xl text-xs hover:bg-emerald-700 transition cursor-pointer shadow-sm text-center"
                      >
                        ✅ Confirm
                      </button>
                      <button
                        onClick={() => setSelectedApp(app)}
                        disabled={actionLoading}
                        className="flex-1 bg-rose-500 text-white font-semibold py-2.5 rounded-xl text-xs hover:bg-rose-600 transition cursor-pointer shadow-sm text-center"
                      >
                        ❌ Reject
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Reject Modal */}
        {selectedApp && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
            <div className="bg-white p-6 rounded-2xl max-w-md w-full space-y-4 text-xs shadow-lg">
              <h3 className="text-sm font-bold text-slate-900">ရက်ချိန်း ငြင်းပယ်ရသည့် အကြောင်းပြချက်</h3>
              <p className="text-slate-500">လူနာ: <span className="font-bold text-slate-800">{selectedApp.patient_id?.name || selectedApp.patient_id?.username || selectedApp.patient_name}</span></p>
              
              <textarea
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="အကြောင်းပြချက် ရေးပါ..."
                className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:border-rose-500 resize-none text-slate-800"
              />

              <div className="flex gap-2">
                <button
                  onClick={() => handleUpdateStatus(selectedApp._id || selectedApp.id, 'rejected')}
                  disabled={actionLoading}
                  className="flex-1 bg-rose-500 text-white font-semibold py-2.5 rounded-xl hover:bg-rose-600 transition cursor-pointer shadow-sm text-center"
                >
                  Confirm Reject
                </button>
                <button
                  onClick={() => { setSelectedApp(null); setRejectionReason(''); }}
                  className="flex-1 bg-slate-100 text-slate-700 font-semibold py-2.5 rounded-xl hover:bg-slate-200 transition cursor-pointer text-center"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}