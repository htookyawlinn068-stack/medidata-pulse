'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AddDoctorPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const token = localStorage.getItem('token');

    try {
      const res = await fetch('http://localhost:5000/api/admin/doctors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok && data.success) {
        router.push('/admin/dashboard');
      } else {
        throw new Error(data.message || 'Failed to add doctor');
      }
    } catch (err: any) {
      setError(err.message || 'Server ချိတ်ဆက်မှု အဆင်မပြေပါ။');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-100 p-8 items-center justify-center font-sans">
      <div className="max-w-md w-full bg-slate-950 p-8 rounded-2xl border border-slate-800">
        <h1 className="text-xl font-bold text-white mb-1">Add New Doctor Account</h1>
        <p className="text-xs text-slate-400 mb-6">ဆရာဝန်အတွက် အကောင့်အသစ် ဖန်တီးပေးပါ။ (ပရိုဖိုင်အချက်အလက်များကို ဆရာဝန်ကိုယ်တိုင် ဝင်ရောက်ဖြည့်စွက်ပါမည်)</p>

        {error && <div className="mb-4 bg-red-950/50 border border-red-800 text-red-400 p-3 rounded-xl text-xs">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Doctor Name</label>
            <input 
              type="text" 
              name="name" 
              required 
              value={formData.name} 
              onChange={handleChange}
              className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl outline-none focus:border-rose-500 text-white"
              placeholder="Dr. John Doe"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Email</label>
            <input 
              type="email" 
              name="email" 
              required 
              value={formData.email} 
              onChange={handleChange}
              className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl outline-none focus:border-rose-500 text-white"
              placeholder="doctor@example.com"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Temporary Password</label>
            <input 
              type="password" 
              name="password" 
              required 
              value={formData.password} 
              onChange={handleChange}
              className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl outline-none focus:border-rose-500 text-white"
              placeholder="********"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-rose-600 text-white font-semibold py-3 rounded-xl shadow hover:bg-rose-700 transition mt-4 text-sm cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Creating Doctor Account...' : 'Create Doctor Account'}
          </button>
        </form>
      </div>
    </div>
  );
}