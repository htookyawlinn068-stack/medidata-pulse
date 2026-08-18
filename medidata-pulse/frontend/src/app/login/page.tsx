'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Token နှင့် Role ကို LocalStorage တွင် သိမ်းဆည်းမည်
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.user.role);

        // Role အလိုက် သက်ဆိုင်ရာ Dashboard သို့ အလိုအလျောက် ပို့ဆောင်ခြင်း
        switch (data.user.role) {
          case 'patient':
            // 🌟 လူနာအတွက် Profile ဖြည့်ပြီးသား ဟုတ်မဟုတ် စစ်ဆေးခြင်း
            if (data.user.is_profile_completed === false || data.user.hasProfile === false) {
              router.push('/patient/profile/create'); // ပထမအကြိမ်ဆိုလျှင် Profile Form သို့ ပို့မည်
            } else {
              router.push('/patient/dashboard'); // ဖြည့်ပြီးသားဆိုလျှင် Dashboard သို့ ပို့မည်
            }
            break;
          case 'doctor':
            // ဆရာဝန်အတွက် Profile ဖြည့်ပြီးသား ဟုတ်မဟုတ် စစ်ဆေးခြင်း
            if (data.user.is_profile_completed === false) {
              router.push('/doctor/profile'); // ပထမအကြိမ်ဆိုလျှင် Profile Form သို့ ပို့မည်
            } else {
              router.push('/doctor/dashboard'); // ဖြည့်ပြီးသားဆိုလျှင် Dashboard သို့ ပို့မည်
            }
            break;
          case 'admin':
            router.push('/admin/dashboard');
            break;
          case 'reception':
            router.push('/reception/dashboard');
            break;
          default:
            router.push('/');
        }
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (err: any) {
      setError(err.message || 'Server နှင့် ချိတ်ဆက်၍ မရပါ။');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4 font-sans">
      <div className="flex w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        
        {/* ဘယ်ဘက်ခြမ်း (Logo & Branding Section) */}
        <div className="flex w-1/2 flex-col items-center justify-center bg-[#fceade] p-8 text-center">
          <h2 className="mb-4 text-xl font-bold text-gray-800">Clinic Patient's Dashboard</h2>
          
          <div className="my-6 flex flex-col items-center">
            <div className="flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-tr from-purple-500 via-pink-500 to-orange-400 shadow-inner">
              <span className="text-3xl font-extrabold text-white">HP</span>
            </div>
            <h1 className="mt-4 text-2xl font-black tracking-wider text-gray-900">HEALTHY</h1>
            <p className="text-xs font-semibold tracking-widest text-gray-600">PEOPLE</p>
          </div>
        </div>

        {/* ညာဘက်ခြမ်း (Login Form Section) */}
        <div className="flex w-1/2 flex-col justify-center bg-[#f7d4b5] p-10">
          <div className="mb-8">
            <h2 className="text-4xl font-extrabold text-gray-900">Welcome</h2>
            <h2 className="text-4xl font-extrabold text-gray-900">Back</h2>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-xl text-xs font-medium border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">E-Mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 w-full rounded-full border border-gray-400 bg-transparent px-4 py-2.5 text-gray-800 focus:border-green-800 focus:outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 w-full rounded-full border border-gray-400 bg-transparent px-4 py-2.5 text-gray-800 focus:border-green-800 focus:outline-none text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-4 w-full rounded-full bg-[#1b4332] py-3 font-bold text-white transition duration-200 hover:bg-[#2d6a4f] cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-700">
            If You Didn't Have Account?{' '}
            <Link href="/register" className="font-bold text-blue-700 hover:underline">
              Sign-Up
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}