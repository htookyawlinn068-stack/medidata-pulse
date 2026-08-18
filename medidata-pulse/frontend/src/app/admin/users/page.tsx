'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ManageUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search နဲ့ Filter အတွက် State များ
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');

  const fetchUsers = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:5000/api/admin/users', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setUsers(data.data);
      }
    } catch (err) {
      setError('Server နှင့် ချိတ်ဆက်မရပါ သို့မဟုတ် ဒေတာ မရှိသေးပါ။');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // User ကို ဖျက်ရန် Function
  const handleDeleteUser = async (id: string) => {
    if (!confirm('ဤအသုံးပြုသူကို ဖျက်ရန် သေချာပါသလား?')) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5000/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setUsers(users.filter(u => u._id !== id));
      } else {
        alert(data.message || 'Failed to delete user');
      }
    } catch (err) {
      alert('Error deleting user');
    }
  };

  // Search နဲ့ Role အလိုက် စစ်ထုတ်ခြင်း (Filtering)
  const filteredUsers = users.filter((u) => {
    const matchesSearch = u.username?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          u.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === 'all' || u.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-100 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-950 border-r border-slate-800 p-6 flex flex-col justify-between">
        <div>
          <h2 className="text-xl font-black text-rose-500 mb-8">System Admin</h2>
          <nav className="space-y-2 text-sm font-medium text-slate-400">
            <Link href="/admin/dashboard" className="block px-4 py-3 rounded-xl hover:bg-slate-800">Overview</Link>
            <Link href="/admin/users" className="block px-4 py-3 rounded-xl bg-slate-800 text-white font-semibold">Manage Users</Link>
            <Link href="/admin/appointments" className="block px-4 py-3 rounded-xl hover:bg-slate-800">Appointments</Link>
          </nav>
        </div>
        <Link href="/login" className="text-sm font-medium text-rose-400 px-4 py-3 hover:bg-slate-800 rounded-xl">Logout</Link>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-8 flex justify-between items-center bg-slate-950 p-4 rounded-2xl border border-slate-800">
          <h1 className="text-xl font-bold">Manage Users & Staff</h1>
          <div className="flex gap-2">
            <Link href="/admin/doctors/add" className="bg-rose-600 text-white px-3 py-2 rounded-xl text-xs font-semibold hover:bg-rose-700 transition">
              + Add Doctor
            </Link>
            <Link href="/admin/receptionists/add" className="bg-indigo-600 text-white px-3 py-2 rounded-xl text-xs font-semibold hover:bg-indigo-700 transition">
              + Add Receptionist
            </Link>
          </div>
        </header>

        {error && <div className="mb-6 bg-amber-950/50 border border-amber-800 text-amber-400 p-4 rounded-xl text-xs">{error}</div>}

        <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6">
          {/* Search Bar နဲ့ Role Filter Tabs */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
            <input 
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full md:w-72 bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl text-xs outline-none focus:border-rose-500 text-white"
            />

            <div className="flex flex-wrap gap-2 text-xs">
              {['all', 'admin', 'doctor', 'receptionist', 'patient'].map((role) => (
                <button
                  key={role}
                  onClick={() => setSelectedRole(role)}
                  className={`px-3 py-1.5 rounded-lg font-semibold capitalize transition ${
                    selectedRole === role ? 'bg-rose-600 text-white' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          <h2 className="text-sm font-bold text-slate-200 mb-4">System Accounts ({filteredUsers.length})</h2>

          {loading ? (
            <div className="text-center py-8 text-xs text-slate-500">Loading users from database...</div>
          ) : filteredUsers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="pb-3 font-semibold">Name</th>
                    <th className="pb-3 font-semibold">Email</th>
                    <th className="pb-3 font-semibold">Role</th>
                    <th className="pb-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredUsers.map((u: any) => (
                    <tr key={u._id} className="hover:bg-slate-900/50">
                      <td className="py-3 text-slate-300 font-medium">{u.username || 'N/A'}</td>
                      <td className="py-3 text-slate-300">{u.email}</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                          u.role === 'admin' ? 'bg-purple-950 text-purple-400 border border-purple-800' :
                          u.role === 'doctor' ? 'bg-indigo-950 text-indigo-400 border border-indigo-800' :
                          u.role === 'receptionist' ? 'bg-blue-950 text-blue-400 border border-blue-800' :
                          'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <button 
                          onClick={() => handleDeleteUser(u._id)}
                          className="bg-red-950/40 border border-red-900 text-red-400 px-2.5 py-1 rounded-lg hover:bg-red-900 hover:text-white transition"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
              ရှာဖွေတွေ့ရှိသော အသုံးပြုသူ မရှိပါ။
            </div>
          )}
        </div>
      </main>
    </div>
  );
}