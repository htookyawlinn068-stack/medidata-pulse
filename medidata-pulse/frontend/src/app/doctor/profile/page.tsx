'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function DoctorProfilePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    qualification: '',
    specialization: '',
    phone: '',
    available_days: [] as string[],
    start_time: '09:00',
    end_time: '17:00'
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await fetch('http://localhost:5000/api/doctors/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();

        if (res.ok && data.success) {
          const docData = data.doctor || data.data || {};

          const daysArray = docData.available_days 
            ? docData.available_days.split(', ').map((d: string) => d.trim()) 
            : [];

          let sTime = '09:00';
          let eTime = '17:00';
          if (docData.available_time) {
            const parts = docData.available_time.split(' - ');
            if (parts.length === 2) {
              sTime = parts[0];
              eTime = parts[1];
            }
          }

          setFormData({
            name: docData.name || '',
            email: docData.email || '',
            qualification: docData.qualification || '',
            specialization: docData.specialization || '',
            phone: docData.phone || '',
            available_days: daysArray,
            start_time: sTime,
            end_time: eTime
          });
        } else {
          setError(data.message || 'Profile အချက်အလက် ရယူ၍ မရပါ။');
        }
      } catch (err: any) {
        setError('Server ချိတ်ဆက်မှု အဆင်မပြေပါ။ Backend Server (`npm start`) ပွင့်နေခြင်း ရှိမရှိ စစ်ဆေးပါ။');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDayToggle = (day: string) => {
    const currentDays = [...formData.available_days];
    if (currentDays.includes(day)) {
      const filtered = currentDays.filter(d => d !== day);
      setFormData({ ...formData, available_days: filtered });
    } else {
      setFormData({ ...formData, available_days: [...currentDays, day] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMsg(null);

    const token = localStorage.getItem('token');
    
    const payload = {
      ...formData,
      available_days: formData.available_days.join(', '),
      available_time: `${formData.start_time} - ${formData.end_time}`
    };

    try {
      const res = await fetch('http://localhost:5000/api/doctors/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccessMsg('Profile အချက်အလက်များ အောင်မြင်စွာ ပြင်ဆင်ပြီးပါပြီ။');
        
        setTimeout(() => {
          router.push('/doctor/dashboard');
        }, 1000);

      } else {
        throw new Error(data.message || 'Profile ပြင်ဆင်ခြင်း မအောင်မြင်ပါ။');
      }
    } catch (err: any) {
      setError(err.message || 'Server ချိတ်ဆက်မှု အဆင်မပြေပါ။');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center">
        <p className="text-sm text-slate-400">Loading Profile...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-100 p-8 items-center justify-center font-sans">
      <div className="max-w-2xl w-full bg-slate-950 p-8 rounded-2xl border border-slate-800">
        <h1 className="text-xl font-bold text-white mb-1">Doctor Profile Settings</h1>
        <p className="text-xs text-slate-400 mb-6">သင့်၏ ပုံမှန် အလုပ်ချိန်နှင့် အပတ်စဉ်ပြသနိုင်မည့် ရက်များကို သတ်မှတ်ပါ။</p>

        {error && <div className="mb-4 bg-red-950/50 border border-red-800 text-red-400 p-3 rounded-xl text-xs">{error}</div>}
        {successMsg && <div className="mb-4 bg-emerald-950/50 border border-emerald-800 text-emerald-400 p-3 rounded-xl text-xs">{successMsg}</div>}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Name</label>
              {/* Name ကို ဖတ်ရှုနိုင်သော်လည်း ပြင်ဆင်၍မရအောင် readOnly လုပ်ထားပါသည် */}
              <input 
                type="text" 
                readOnly 
                value={formData.name} 
                className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl text-slate-300 outline-none cursor-not-allowed select-none" 
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Email</label>
              {/* Email ကို ဖတ်ရှုနိုင်သော်လည်း ပြင်ဆင်၍မရအောင် readOnly လုပ်ထားပါသည် */}
              <input 
                type="email" 
                readOnly 
                value={formData.email} 
                className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl text-slate-300 outline-none cursor-not-allowed select-none" 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Qualification</label>
              <select name="qualification" required value={formData.qualification} onChange={handleChange} className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl outline-none focus:border-rose-500 text-white">
                <option value="">Select Qualification</option>
                <option value="MBBS">MBBS</option>
                <option value="MBBS, M.Med.Sc">MBBS, M.Med.Sc (Clinical)</option>
                <option value="MBBS, Dr.Med.Sc">MBBS, Dr.Med.Sc</option>
                <option value="MBBS, MRCP (UK)">MBBS, MRCP (UK)</option>
                <option value="MBBS, FRCS">MBBS, FRCS</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Specialization</label>
              <select name="specialization" required value={formData.specialization} onChange={handleChange} className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl outline-none focus:border-rose-500 text-white">
                <option value="">Select Specialization</option>
                <option value="General Physician">General Physician (အထွေထွေရောဂါကု)</option>
                <option value="Cardiologist">Cardiologist (နှလုံးအထူးကု)</option>
                <option value="Neurologist">Neurologist (ဦးနှောက်နှင့် အာရုံကြောအထူးကု)</option>
                <option value="Pediatrician">Pediatrician (ကလေးရောဂါအထူးကု)</option>
                <option value="Orthopedic">Orthopedic (အရိုးအထူးကု)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Phone Number</label>
            <input type="text" name="phone" required value={formData.phone} onChange={handleChange} className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl outline-none focus:border-rose-500 text-white" placeholder="09XXXXXXXXX" />
          </div>

          {/* Available Days Checkboxes */}
          <div>
            <label className="block font-semibold text-slate-300 mb-2">Available Days (ပုံမှန်ပြသသည့်ရက်များ)</label>
            <div className="grid grid-cols-4 gap-2">
              {DAYS_OF_WEEK.map((day) => (
                <label key={day} className={`flex items-center space-x-2 p-2.5 rounded-xl border cursor-pointer transition ${formData.available_days.includes(day) ? 'bg-rose-950/40 border-rose-600 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
                  <input 
                    type="checkbox" 
                    checked={formData.available_days.includes(day)}
                    onChange={() => handleDayToggle(day)}
                    className="accent-rose-600 rounded"
                  />
                  <span>{day}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Available Time Pickers */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Start Time</label>
              <input 
                type="time" 
                name="start_time" 
                required 
                value={formData.start_time} 
                onChange={handleChange} 
                className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl outline-none focus:border-rose-500 text-white" 
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">End Time</label>
              <input 
                type="time" 
                name="end_time" 
                required 
                value={formData.end_time} 
                onChange={handleChange} 
                className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl outline-none focus:border-rose-500 text-white" 
              />
            </div>
          </div>

          <button type="submit" disabled={saving} className="w-full bg-rose-600 text-white font-semibold py-3 rounded-xl shadow hover:bg-rose-700 transition mt-4 text-sm cursor-pointer disabled:opacity-50">
            {saving ? 'Saving Profile...' : 'Save Profile Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}