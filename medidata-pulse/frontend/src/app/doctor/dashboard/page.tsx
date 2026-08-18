'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RealDoctorDashboard() {
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);

  const fetchDashboard = () => {
    const token = localStorage.getItem('token'); 
    if (!token) {
      router.push('/login');
      return;
    }

    const url = searchQuery 
      ? `http://localhost:5000/api/doctors/dashboard?query=${searchQuery}`
      : 'http://localhost:5000/api/doctors/dashboard';

    fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          if (!data.data?.doctor || !data.data?.doctor.qualification) {
            router.push('/doctor/profile');
            return;
          }
          setDashboardData(data.data);
          setLoading(false);
        } else {
          setError('Data ရယူရန် အဆင်မပြေပါ။');
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('API Error:', err);
        setError('Server နှင့် ချိတ်ဆက်မရပါ။');
        setLoading(false);
      });
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(fetchDashboard, 400);
    return () => clearTimeout(delayDebounceFn);
  }, [router, searchQuery]);

  const handleUpdateStatus = async (appointmentId: string, status: 'confirmed' | 'rejected') => {
    const token = localStorage.getItem('token');
    if (!token) return;

    if (status === 'rejected' && !rejectionReason.trim()) {
      alert('ကျေးဇူးပြု၍ ငြင်းပယ်ရသည့် အကြောင်းပြချက်ကို ထည့်သွင်းပါ။');
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/appointments/${appointmentId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          status, 
          rejection_reason: status === 'rejected' ? rejectionReason : '' 
        })
      });
      const data = await res.json();
      if (data.success || res.ok) {
        alert(`ရက်ချိန်းကို '${status}' သို့ အောင်မြင်စွာ ပြောင်းလဲပြီးပါပြီ။`);
        setSelectedRequest(null);
        setRejectionReason('');
        fetchDashboard();
      } else {
        alert(data.message || 'Status ပြောင်းလဲရန် အဆင်မပြေပါ။');
      }
    } catch (err) {
      console.error('Update Status Error:', err);
      alert('Server ချိတ်ဆက်မှု အမှားရှိနေပါသည်။');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f4f7fe] text-slate-600 font-medium text-xs">
        Loading real-time dashboard data from database...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f4f7fe] text-slate-800 font-sans relative">
      
      {/* 1. Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 p-6 flex flex-col justify-between">
        <div>
          <div className="flex flex-col items-center text-center pb-6 border-b border-slate-100 mb-6">
            <div className="w-16 h-16 rounded-full bg-indigo-100 text-indigo-600 mb-3 flex items-center justify-center font-bold text-lg shadow-sm">
              MD
            </div>
            <h2 className="font-bold text-slate-900 text-sm">{dashboardData?.doctor?.name || 'Doctor'}</h2>
            <p className="text-[10px] text-slate-400 mt-0.5">{dashboardData?.doctor?.qualification || 'Medical Specialist'}</p>
          </div>

          <nav className="flex flex-col space-y-1 text-sm font-medium text-slate-600">
            <Link href="/doctor/dashboard" className="flex items-center space-x-3 px-4 py-3 rounded-xl bg-indigo-50 text-indigo-600 font-semibold transition">
              <span>📊</span>
              <span>Dashboard</span>
            </Link>
            <Link href="/doctor/dashboard/appointments" className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-slate-50 transition">
              <span>✅</span>
              <span>Confirmed Appointments</span>
            </Link>
            <Link href="/doctor/dashboard/consultations/new" className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-slate-50 transition">
              <span>✍️</span>
              <span>New Consultation</span>
            </Link>
            <Link href="/doctor/schedules" className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-slate-50 transition">
              <span>📅</span>
              <span>Schedules & Roster</span>
            </Link>
            <Link href="/doctor/profile" className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-slate-50 transition">
              <span>👤</span>
              <span>Profile</span>
            </Link>
          </nav>
        </div>

        <div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 text-sm font-medium text-rose-500 px-4 py-3 hover:bg-rose-50 rounded-xl transition cursor-pointer text-left"
          >
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* 2. Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto">
        
        <header className="flex justify-between items-center mb-8 bg-white p-4 px-6 rounded-2xl shadow-sm border border-slate-200/60 relative">
          <h1 className="text-xl font-extrabold text-slate-900">Dashboard</h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl text-xs text-slate-600 w-64 space-x-2 focus-within:border-indigo-500 transition">
              <span>🔍</span>
              <input 
                type="text" 
                placeholder="Search patient, notes..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent outline-none w-full text-slate-800 placeholder-slate-400"
              />
            </div>

            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl hover:bg-slate-100 transition relative cursor-pointer"
              >
                <span>🔔</span>
                <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full animate-pulse"></span>
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl p-4 z-50 text-xs space-y-3">
                  <div className="flex justify-between items-center border-b pb-2">
                    <h3 className="font-bold text-slate-900">Notifications</h3>
                    <span className="text-[10px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full font-semibold">New</span>
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {dashboardData?.appointmentRequests?.length > 0 ? (
                      dashboardData.appointmentRequests.map((req: any, idx: number) => (
                        <div key={idx} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                          <p className="font-bold text-slate-800">New Request: {req.name}</p>
                          <p className="text-slate-500 text-[11px]">Appointment on {req.appointment_date} at {req.appointment_time}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-400 text-center py-4">အကြောင်းကြားစာ အသစ်များ မရှိပါ။</p>
                    )}
                  </div>
                </div>
              )}
            </div>

          </div>
        </header>

        {error && (
          <div className="mb-6 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl text-xs font-medium">
            {error}
          </div>
        )}

        {/* Top Stat Cards */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Patient</p>
              <p className="text-3xl font-black text-slate-900 mt-2">{dashboardData?.stats?.totalPatients || '0'}</p>
              <p className="text-xs text-slate-400 mt-1">Active database records</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xl">👥</div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Today Patients</p>
              <p className="text-3xl font-black text-slate-900 mt-2">{dashboardData?.stats?.todayPatients || '0'}</p>
              <p className="text-xs text-slate-400 mt-1">Scheduled for today</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xl">📋</div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Today Appointments</p>
              <p className="text-3xl font-black text-slate-900 mt-2">{dashboardData?.stats?.todayAppointments || '0'}</p>
              <p className="text-xs text-slate-400 mt-1">Online & Offline sessions</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xl">⏰</div>
          </div>
        </div>

        {/* Middle Section Grid */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          
          {/* Today Appointment List */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 col-span-1">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-slate-800">Today's Appointments</h3>
              <Link href="/doctor/dashboard/appointments" className="text-xs text-indigo-600 font-semibold hover:underline">View All</Link>
            </div>
            
            {dashboardData?.todayAppointments?.length > 0 ? (
              <div className="space-y-3">
                {dashboardData.todayAppointments.map((item: any) => {
                  const patientId = item.patient_id?._id || item.patient_id || '';
                  return (
                    <div key={item.id || item._id} className="flex flex-col p-3.5 bg-slate-50 rounded-xl text-xs border border-slate-100 space-y-2">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-bold text-slate-900">{item.patient_id?.name || item.name || 'Patient'}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">{item.notes || 'No notes'} • Status: {item.status}</p>
                        </div>
                        <span className="px-2.5 py-1.5 rounded-lg font-bold text-[10px] bg-slate-200 text-slate-700">
                          {item.appointment_time}
                        </span>
                      </div>
                      
                      <Link 
                        href={`/doctor/dashboard/consultations/new?patientId=${patientId}&appointmentId=${item._id || item.id}`}
                        className="w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-1.5 rounded-lg transition text-[11px]"
                      >
                        🩺 Start Consultation & Rx
                      </Link>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                ယနေ့အတွက် ချိန်းဆိုမှုများ မရှိသေးပါ။
              </div>
            )}
          </div>

          {/* Next Patient Details */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 col-span-1">
            <h3 className="text-sm font-bold text-slate-800 mb-4">Next Patient Details</h3>
            
            {dashboardData?.nextPatient ? (
              <div className="p-4 bg-slate-50 rounded-xl text-xs space-y-2 border border-slate-100">
                <p className="font-bold text-slate-900 text-sm">{dashboardData.nextPatient.patient_id?.name || dashboardData.nextPatient.name}</p>
                <p className="text-slate-600"><span className="font-semibold">Time:</span> {dashboardData.nextPatient.appointment_time}</p>
                <p className="text-slate-600"><span className="font-semibold">Notes:</span> {dashboardData.nextPatient.notes || '-'}</p>
                <Link 
                  href={`/doctor/dashboard/consultations/new?patientId=${dashboardData.nextPatient.patient_id?._id || dashboardData.nextPatient.patient_id}&appointmentId=${dashboardData.nextPatient._id || dashboardData.nextPatient.id}`}
                  className="inline-block w-full text-center bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 rounded-lg transition mt-2"
                >
                  Start Now
                </Link>
              </div>
            ) : (
              <div className="text-center py-16 text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                လောလောဆယ် ကြည့်ရှုရန် လူနာအချက်အလက်မရှိပါ။
              </div>
            )}
          </div>

          {/* Appointment Requests */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 col-span-1 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-slate-800">Appointment Requests</h3>
              </div>
              
              {dashboardData?.appointmentRequests?.length > 0 ? (
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                  {dashboardData.appointmentRequests.map((reqItem: any) => (
                    <div key={reqItem.id || reqItem._id} className="p-3 bg-slate-50 rounded-xl text-xs border border-slate-100 space-y-2">
                      <div className="flex justify-between items-center">
                        <p className="font-bold text-slate-900">{reqItem.patient_id?.name || reqItem.name}</p>
                        <span className="text-[10px] bg-amber-100 text-amber-700 font-semibold px-2 py-0.5 rounded-full">
                          {reqItem.appointment_date ? new Date(reqItem.appointment_date).toLocaleDateString() : ''}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">Time: {reqItem.appointment_time} | Notes: {reqItem.notes || '-'}</p>
                      
                      <button 
                        onClick={() => setSelectedRequest(reqItem)}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-1.5 rounded-lg transition text-[11px] cursor-pointer"
                      >
                        Review & Respond
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  တောင်းဆိုထားသော ရက်ချိန်းအသစ်များ မရှိပါ။
                </div>
              )}
            </div>

            <div className="bg-indigo-50/60 p-4 rounded-xl border border-indigo-100 mt-4">
              <p className="text-xs font-bold text-indigo-900">Clinic Status: Active</p>
              <p className="text-[11px] text-indigo-700 mt-0.5">Database connection is live and secure.</p>
            </div>
          </div>

        </div>

      </main>

      {/* Review Request Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-2xl max-w-md w-full space-y-4 text-xs shadow-lg">
            <h3 className="text-sm font-bold text-gray-900">Appointment Request Details</h3>
            
            <div className="bg-slate-50 p-3 rounded-xl space-y-1.5 border border-slate-100">
              <p className="text-slate-900 font-bold text-sm">👤 {selectedRequest.patient_id?.name || selectedRequest.name}</p>
              <p className="text-slate-600">📅 လိုချင်သည့်ရက်: {selectedRequest.appointment_date ? new Date(selectedRequest.appointment_date).toLocaleDateString() : ''} | 🕒 အချိန်: {selectedRequest.appointment_time}</p>
              <p className="text-slate-600">🩺 ရောဂါလက္ခဏာ / မှတ်စု: {selectedRequest.notes || 'မှတ်စုမပါရှိပါ'}</p>
            </div>

            <div className="space-y-1">
              <label className="text-slate-600 font-semibold">ငြင်းပယ်မည်ဆိုလျှင် အကြောင်းပြချက်ရေးပါ (Confirm လျှင် ထည့်ရန်မလိုပါ):</label>
              <textarea
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="အကြောင်းပြချက်..."
                className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl outline-none focus:border-rose-500 resize-none text-gray-800"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => handleUpdateStatus(selectedRequest.id || selectedRequest._id, 'confirmed')}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-xl transition cursor-pointer shadow-sm text-center"
              >
                ✅ Confirm
              </button>
              <button
                onClick={() => handleUpdateStatus(selectedRequest.id || selectedRequest._id, 'rejected')}
                className="flex-1 bg-rose-500 hover:bg-rose-600 text-white font-semibold py-2.5 rounded-xl transition cursor-pointer shadow-sm text-center"
              >
                ❌ Reject
              </button>
              <button
                onClick={() => { setSelectedRequest(null); setRejectionReason(''); }}
                className="px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}