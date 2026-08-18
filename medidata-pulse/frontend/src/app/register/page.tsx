'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Public မှ Sign-up လုပ်ပါက Patient အဖြစ်သာ အလိုအလျောက် မှတ်ပုံတင်မည်ဖြစ်၍ role ပို့ရန် မလိုတော့ပါ
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // အကောင့်အသစ် ဖွင့်ပြီးပါက Login Page သို့ ပို့ဆောင်မည်
        router.push('/login');
      } else {
        throw new Error(data.message || 'Registration failed');
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

        {/* ညာဘက်ခြမ်း (Register Form Section) */}
        <div className="flex w-1/2 flex-col justify-center bg-[#f7d4b5] p-10">
          <div className="mb-6">
            <h2 className="text-3xl font-extrabold text-gray-900">Create Account</h2>
            <p className="text-xs text-gray-600 mt-1">လူနာအကောင့်အသစ် ဖန်တီး၍ စတင်လိုက်ပါ။</p>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-xl text-xs font-medium border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full rounded-full border border-gray-400 bg-transparent px-4 py-2.5 text-gray-800 focus:border-green-800 focus:outline-none"
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">E-Mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-full border border-gray-400 bg-transparent px-4 py-2.5 text-gray-800 focus:border-green-800 focus:outline-none"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-full border border-gray-400 bg-transparent px-4 py-2.5 text-gray-800 focus:border-green-800 focus:outline-none"
                placeholder="Enter password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-4 w-full rounded-full bg-[#1b4332] py-3 font-bold text-white transition duration-200 hover:bg-[#2d6a4f] cursor-pointer disabled:opacity-50 text-sm"
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>

          <div className="mt-4 text-center text-xs text-gray-700">
            Already have an account?{' '}
            <Link href="/login" className="font-bold text-blue-700 hover:underline">
              Log In
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}