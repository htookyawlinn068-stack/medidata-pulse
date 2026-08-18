'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

// 🌟 Emergency AI Chatbot Component
function EmergencyChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'မင်္ဂလာပါခင်ဗျာ။ ကျွန်တော်က MediData-Pulse ရဲ့ အရေးပေါ်ရှေ့ဦးသူနာပြု AI လက်ထောက်ပါ။ ဘယ်လို ကျန်းမာရေး အခက်အခဲများ ရှိနေပါသလဲ?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    const updatedMessages = [...messages, { sender: 'user', text: userMessage }];
    
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      const data = await res.json();

      if (res.ok && data.reply) {
        setMessages(prev => [...prev, { sender: 'bot', text: data.reply }]);
      } else {
        setMessages(prev => [...prev, { sender: 'bot', text: 'AI မဆွဲနိုင်ပါ။ .env.local ထဲက GEMINI_API_KEY ကို ပြန်စစ်ပေးပါ။' }]);
      }
    } catch (error) {
      console.error('Chat Error:', error);
      setMessages(prev => [...prev, { sender: 'bot', text: 'Server ချိတ်ဆက်ရာတွင် အမှားအယွင်းရှိနေပါသည်။' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center space-x-2 bg-rose-500 hover:bg-rose-600 text-white px-5 py-3 rounded-full shadow-lg transition text-xs font-bold cursor-pointer"
        >
          <span>🤖</span>
          <span>Emergency AI Assistant</span>
        </button>
      ) : (
        <div className="w-80 h-96 bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden">
          {/* Chat Header */}
          <div className="bg-rose-500 p-4 text-white flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <span>🤖</span>
              <span className="text-xs font-bold">Emergency Triage AI</span>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200 text-sm font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-3 overflow-y-auto space-y-3 bg-gray-50 text-xs">
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] p-3 rounded-2xl ${
                  msg.sender === 'user' 
                    ? 'bg-rose-500 text-white rounded-br-none' 
                    : 'bg-white text-gray-800 border border-gray-100 shadow-sm rounded-bl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-400 p-3 rounded-2xl border border-gray-100 text-[10px]">
                  AI စဉ်းစားနေပါသည်။ ခဏစောင့်ပါ...
                </div>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100 flex space-x-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="ရောဂါလက္ခဏာများကို ရိုက်ထည့်ပါ..."
              className="flex-1 bg-gray-50 border border-gray-200 px-3 py-2 rounded-xl text-xs outline-none focus:border-rose-500"
            />
            <button 
              type="submit"
              disabled={loading}
              className="bg-rose-500 text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-rose-600 transition cursor-pointer disabled:bg-gray-300"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default function PatientDashboard() {
  const [patientData, setPatientData] = useState<any>(null);
  const [doctors, setDoctors] = useState<any[]>([]); 
  const [healthRecords, setHealthRecords] = useState<any[]>([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit Profile Modal States
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    age: '',
    gender: 'Male',
    phone: '',
    address: '',
    blood: '',
    height: '',
    weight: '',
    allergies: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchDashboardData = () => {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    Promise.all([
      fetch('http://localhost:5000/api/patients/dashboard', { headers }).then(res => res.json()),
      fetch('http://localhost:5000/api/doctors', { headers }).then(res => res.json()),
      fetch('http://localhost:5000/api/health-records', { headers }).then(res => res.json()).catch(() => ({ success: false, data: [] }))
    ])
      .then(([dashRes, docRes, recordRes]) => {
        if (dashRes.success) {
          setPatientData(dashRes.data);
          const p = dashRes.data.profile;
          setEditForm({
            name: p.name || '',
            age: p.age || '',
            gender: p.gender || 'Male',
            phone: p.phone || '',
            address: p.address || '',
            blood: p.blood || '',
            height: p.height || '',
            weight: p.weight || '',
            allergies: p.allergies ? p.allergies.join(', ') : ''
          });
        }
        if (docRes.success) {
          setDoctors(docRes.data || docRes.doctors || []);
        }
        if (recordRes.success) {
          setHealthRecords(recordRes.data || []);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('API Error:', err);
        setError('Server နှင့် ချိတ်ဆက်မရပါ သို့မဟုတ် အကောင့်အချက်အလက် မရှိသေးပါ။');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const token = localStorage.getItem('token');

    try {
      const processedAllergies = editForm.allergies
        ? editForm.allergies.split(',').map((item: string) => item.trim()).filter(Boolean)
        : [];

      const formattedData = {
        name: editForm.name,
        age: editForm.age ? Number(editForm.age) : 0,
        gender: editForm.gender,
        phone: editForm.phone,
        address: editForm.address,
        blood: editForm.blood,
        height: editForm.height,
        weight: editForm.weight,
        allergies: processedAllergies
      };

      const patientId = patientData?.profile?.id || patientData?.profile?._id;

      const res = await fetch(`http://localhost:5000/api/patients/${patientId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formattedData)
      });

      const data = await res.json();

      if (res.ok && data.success) {
        alert('Profile updated successfully!');
        setIsEditing(false);
        fetchDashboardData();
      } else {
        throw new Error(data.message || 'Failed to update profile');
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Server ချိတ်ဆက်မှု အဆင်မပြေပါ။');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#fcf8f7] text-rose-500 font-medium">
        Loading patient dashboard from database...
      </div>
    );
  }

  if (!patientData || !patientData.profile) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-[#fcf8f7] text-gray-800 p-6">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Welcome to Medidata Pulse</h2>
          <p className="text-xs text-gray-500 mb-6">
            ကျေးဇူးပြု၍ သင်၏ ကိုယ်ရေးအချက်အလက်များနှင့် ကိုယ်ပိုင်ပရိုဖိုင်ကို ဦးစွာ ဖြည့်သွင်းပါ။
          </p>
          <Link
            href="/patient/profile/create"
            className="inline-block w-full bg-rose-500 text-white font-semibold py-3 rounded-xl shadow hover:bg-rose-600 transition text-sm"
          >
            Create Patient Profile
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#fcf8f7] text-gray-800 relative">
      
      {/* 1. Sidebar */}
      <aside className="flex w-64 flex-col border-r border-gray-200 bg-white p-6">
        <div className="mb-10 text-2xl font-black text-rose-500">Medidata Pulse</div>
        <nav className="flex flex-col space-y-2 text-gray-600 font-medium text-sm">
          <Link href="/patient/dashboard" className="rounded-xl bg-rose-50 px-4 py-3 text-rose-600 shadow-sm font-semibold">
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
          <Link href="/patient/dashboard/prescriptions" className="rounded-xl px-4 py-3 hover:bg-gray-50 hover:text-rose-500 transition">
            💊 Prescriptions
          </Link>
          <Link href="/login" className="mt-auto rounded-xl px-4 py-3 text-red-500 hover:bg-red-50 transition">
            🚪 Logout
          </Link>
        </nav>
      </aside>

      {/* 2. Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Welcome, {patientData.profile.name}!</h1>
            <p className="text-sm text-gray-500">Manage your health records and appointments securely.</p>
          </div>
          <div className="flex items-center space-x-4">
              <Link href="/patient/dashboard/notifications" className="p-2 bg-white rounded-full shadow-sm border border-gray-100 hover:bg-gray-50 transition cursor-pointer flex items-center justify-center">
              🔔
              </Link>
            <div className="flex items-center space-x-2 rounded-full bg-white px-4 py-1.5 shadow-sm">
              <span className="font-bold text-gray-700">{patientData.profile.name}</span>
              <span className="text-xs text-rose-500 font-semibold">Patient</span>
            </div>
          </div>
        </header>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="rounded-2xl bg-rose-50/60 p-5 shadow-sm border border-rose-100">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-gray-700 text-sm">Consultations</span>
              <span>🩺</span>
            </div>
            <p className="text-lg font-bold text-gray-900 mt-2">{patientData.totalConsultations} All Time</p>
          </div>

          <div className="rounded-2xl bg-purple-50/60 p-5 shadow-sm border border-purple-100">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-gray-700 text-sm">Prescriptions</span>
              <span>📜</span>
            </div>
            <p className="text-lg font-bold text-gray-900 mt-2">{patientData.availablePrescriptions} Available</p>
          </div>

          <div className="rounded-2xl bg-pink-50/60 p-5 shadow-sm border border-pink-100 flex flex-col justify-between">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-700 text-sm">Book Appointment</span>
              <span>➕</span>
            </div>
            <Link 
              href="/patient/dashboard/book"
              className="mt-4 block text-center rounded-xl bg-rose-500 py-2 text-white font-medium text-xs shadow hover:bg-rose-600 transition"
            >
              Book New Session
            </Link>
          </div>
        </div>

        {/* Doctor List Box */}
        <section className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Available Doctors</h2>
            <Link href="/patient/dashboard/book" className="text-xs font-semibold text-rose-500 hover:underline">
              View All →
            </Link>
          </div>
          {doctors.length > 0 ? (
            <div className="grid grid-cols-3 gap-4">
              {doctors.slice(0, 3).map((doc: any) => (
                <div key={doc._id || doc.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
                  <div>
                    <div className="h-10 w-10 rounded-full bg-rose-100 flex items-center justify-center font-bold text-rose-600 mb-3">
                      👨‍⚕️
                    </div>
                    <h3 className="font-bold text-gray-900 text-sm">{doc.username || doc.name}</h3>
                    <p className="text-xs text-rose-500 font-medium">{doc.specialization || 'General Practitioner'}</p>
                  </div>
                  <Link 
                    href={`/patient/dashboard/book?doctorId=${doc._id || doc.id}`}
                    className="mt-4 block text-center bg-gray-50 hover:bg-rose-50 hover:text-rose-600 text-gray-700 font-semibold text-xs py-2 rounded-xl transition"
                  >
                    Book Appointment
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-6 rounded-2xl text-center text-xs text-gray-400 border border-gray-100">
              လောလောဆယ် ဆရာဝန်စာရင်း မရှိသေးပါ။
            </div>
          )}
        </section>

        {/* Health Records Section */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Health Records & History</h2>
          {healthRecords.length > 0 ? (
            <div className="space-y-3">
              {healthRecords.map((record: any) => (
                <div key={record._id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">Diagnosis: {record.diagnosis}</h3>
                    <p className="text-xs text-gray-500 mt-1">Symptoms: {record.symptoms || 'N/A'} • Date: {new Date(record.record_date).toLocaleDateString()}</p>
                  </div>
                  <span className="px-3 py-1 bg-rose-50 text-rose-600 rounded-full text-xs font-semibold">
                    Record
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-6 rounded-2xl text-center text-xs text-gray-400 border border-gray-100">
              သိမ်းဆည်းထားသော ကျန်းမာရေး မှတ်တမ်းများ မရှိသေးပါ။
            </div>
          )}
        </section>

        {/* Upcoming Appointments */}
        <section className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Upcoming Appointments</h2>
            <Link href="/patient/dashboard/appointments" className="text-xs font-semibold text-rose-500 hover:underline">
              View All →
            </Link>
          </div>
          {patientData.upcomingAppointments?.length > 0 ? (
            <div className="space-y-4">
              {patientData.upcomingAppointments.map((item: any) => (
                <div key={item.id} className="flex items-center justify-between rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">{item.title}</h3>
                    <p className="text-xs text-gray-500 mt-1">👨‍⚕️ {item.doctor} • 🕒 {item.date}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-8 rounded-2xl text-center text-xs text-gray-400 border border-gray-100">
              လောလောဆယ် ရက်ချိန်းအသစ်များ မရှိသေးပါ။
            </div>
          )}
        </section>
      </main>

      {/* 3. Right Sidebar */}
      <aside className="w-80 border-l border-gray-200 bg-white p-6 flex flex-col space-y-6 overflow-y-auto">
        <div className="flex flex-col items-center pb-6 border-b border-gray-100">
          <div className="h-20 w-20 rounded-full bg-rose-200 flex items-center justify-center text-2xl font-bold text-rose-700 mb-3">
            {patientData.profile.name.charAt(0)}
          </div>
          <h2 className="text-lg font-bold text-gray-900">{patientData.profile.name}</h2>
          <p className="text-xs text-gray-500">{patientData.profile.age} Years Old • {patientData.profile.gender}</p>

          <div className="grid grid-cols-3 gap-3 w-full mt-6 text-center">
            <div className="rounded-xl bg-gray-50 p-2">
              <p className="text-[10px] text-gray-400">Blood</p>
              <p className="font-bold text-xs text-gray-800">{patientData.profile.blood || '-'}</p>
            </div>
            <div className="rounded-xl bg-gray-50 p-2">
              <p className="text-[10px] text-gray-400">Height</p>
              <p className="font-bold text-xs text-gray-800">{patientData.profile.height || '-'}</p>
            </div>
            <div className="rounded-xl bg-gray-50 p-2">
              <p className="text-[10px] text-gray-400">Weight</p>
              <p className="font-bold text-xs text-gray-800">{patientData.profile.weight || '-'}</p>
            </div>
          </div>

          {/* Drug Allergies */}
          <div className="w-full mt-6 bg-red-50 p-4 rounded-2xl border border-red-100 text-left">
            <h4 className="text-xs font-bold text-red-600 mb-1">⚠️ Drug Allergies</h4>
            <p className="text-xs text-gray-600">
              {patientData.profile.allergies && patientData.profile.allergies.length > 0 
                ? patientData.profile.allergies.join(', ') 
                : 'မတည့်သော ဆေးဝါးများ မရှိပါ။'}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsEditing(true)}
          className="w-full bg-rose-500 text-white font-semibold py-2.5 rounded-xl text-xs hover:bg-rose-600 transition cursor-pointer shadow-sm"
        >
          Edit Profile
        </button>
      </aside>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white max-w-lg w-full p-6 rounded-2xl shadow-xl border border-gray-100 max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-rose-500">Edit Patient Profile</h2>
              <button 
                onClick={() => setIsEditing(false)}
                className="text-gray-400 hover:text-gray-600 font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-3">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Full Name</label>
                <input 
                  type="text" 
                  name="name" 
                  required 
                  value={editForm.name} 
                  onChange={handleEditChange}
                  className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-xl outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Age</label>
                  <input 
                    type="number" 
                    name="age" 
                    required 
                    value={editForm.age} 
                    onChange={handleEditChange}
                    className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-xl outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Gender</label>
                  <select 
                    name="gender" 
                    value={editForm.gender} 
                    onChange={handleEditChange}
                    className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-xl outline-none focus:border-rose-500 bg-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Blood Group</label>
                  <select
                    name="blood"
                    value={editForm.blood}
                    onChange={handleEditChange}
                    className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-xl outline-none focus:border-rose-500 bg-white"
                  >
                    <option value="">-- Select --</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Height</label>
                  <input 
                    type="text" 
                    name="height" 
                    value={editForm.height} 
                    onChange={handleEditChange}
                    className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-xl outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Weight</label>
                  <input 
                    type="text" 
                    name="weight" 
                    value={editForm.weight} 
                    onChange={handleEditChange}
                    className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-xl outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Drug Allergies (Comma separated)</label>
                <input 
                  type="text" 
                  name="allergies" 
                  value={editForm.allergies} 
                  onChange={handleEditChange}
                  className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-xl outline-none focus:border-rose-500"
                  placeholder="e.g. Penicillin, Aspirin"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Phone Number</label>
                <input 
                  type="text" 
                  name="phone" 
                  value={editForm.phone} 
                  onChange={handleEditChange}
                  className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-xl outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Address</label>
                <input 
                  type="text" 
                  name="address" 
                  value={editForm.address} 
                  onChange={handleEditChange}
                  className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-xl outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="w-1/2 bg-gray-100 text-gray-600 font-semibold py-2.5 rounded-xl hover:bg-gray-200 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-1/2 bg-rose-500 text-white font-semibold py-2.5 rounded-xl hover:bg-rose-600 transition disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Emergency AI Chatbot Floating Widget */}
      <EmergencyChatbot />

    </div>
  );
}