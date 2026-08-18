'use client';
import { useState, useEffect } from 'react';

interface Schedule {
  id: number;
  duty_date: string;
  start_time: string;
  end_time: string;
  status: string;
}

export default function DoctorSchedulePage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    duty_date: '',
    start_time: '09:00',
    end_time: '17:00',
    status: 'Available'
  });
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchSchedules = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:5000/api/doctors/schedules', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSchedules(data.schedules);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    const token = localStorage.getItem('token');

    try {
      const res = await fetch('http://localhost:5000/api/doctors/schedules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setSuccessMsg(data.message);
        fetchSchedules(); // refresh list
      } else {
        setError(data.message || 'မအောင်မြင်ပါ။');
      }
    } catch (err) {
      setError('Server ချိတ်ဆက်မှု အဆင်မပြေပါ။');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('ဤ Duty ချိန်ဇယားကို ဖျက်ရန် သေချာပါသလား?')) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5000/api/doctors/schedules/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchSchedules();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-100 p-8 justify-center font-sans">
      <div className="max-w-4xl w-full space-y-6">
        <div>
          <h1 className="text-xl font-bold text-white">Duty Schedule & Roster Management</h1>
          <p className="text-xs text-slate-400">ရက်အလိုက် သီးသန့် Duty ချိန်ဇယားများ နှင့် အလှည့်ကျ အပြောင်းအလဲများကို စီမံပါ။</p>
        </div>

        {error && <div className="bg-red-950/50 border border-red-800 text-red-400 p-3 rounded-xl text-xs">{error}</div>}
        {successMsg && <div className="bg-emerald-950/50 border border-emerald-800 text-emerald-400 p-3 rounded-xl text-xs">{successMsg}</div>}

        {/* Add/Update Form */}
        <form onSubmit={handleSubmit} className="bg-slate-950 p-6 rounded-2xl border border-slate-800 grid grid-cols-1 md:grid-cols-4 gap-4 text-xs items-end">
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Duty Date (ရက်စွဲ)</label>
            <input 
              type="date" 
              required 
              value={form.duty_date} 
              onChange={e => setForm({ ...form, duty_date: e.target.value })}
              className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl text-white outline-none focus:border-rose-500" 
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Start Time</label>
            <input 
              type="time" 
              required 
              value={form.start_time} 
              onChange={e => setForm({ ...form, start_time: e.target.value })}
              className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl text-white outline-none focus:border-rose-500" 
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-300 mb-1">End Time</label>
            <input 
              type="time" 
              required 
              value={form.end_time} 
              onChange={e => setForm({ ...form, end_time: e.target.value })}
              className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl text-white outline-none focus:border-rose-500" 
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Status</label>
            <select 
              value={form.status} 
              onChange={e => setForm({ ...form, status: e.target.value })}
              className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl text-white outline-none focus:border-rose-500"
            >
              <option value="Available">Available (Duty ရှိ)</option>
              <option value="On Leave">On Leave (ခွင့်)</option>
            </select>
          </div>
          <div className="md:col-span-4">
            <button type="submit" className="w-full bg-rose-600 text-white font-semibold py-3 rounded-xl hover:bg-rose-700 transition cursor-pointer">
              Save / Update Schedule
            </button>
          </div>
        </form>

        {/* Existing Schedules Table */}
        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800">
          <h2 className="text-sm font-bold text-white mb-4">Your Scheduled Duties</h2>
          {loading ? (
            <p className="text-xs text-slate-400">Loading schedules...</p>
          ) : schedules.length === 0 ? (
            <p className="text-xs text-slate-400">သတ်မှတ်ထားသော Duty ချိန်ဇယားများ မရှိသေးပါ။</p>
          ) : (
            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="p-3">Date</th>
                    <th className="p-3">Time</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {schedules.map(sch => (
                    <tr key={sch.id} className="border-b border-slate-900 hover:bg-slate-900/40">
                      <td className="p-3">{new Date(sch.duty_date).toLocaleDateString()}</td>
                      <td className="p-3">{sch.start_time} - {sch.end_time}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-semibold ${sch.status === 'Available' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-amber-950 text-amber-400 border border-amber-800'}`}>
                          {sch.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button onClick={() => handleDelete(sch.id)} className="text-red-400 hover:text-red-300 font-medium">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}