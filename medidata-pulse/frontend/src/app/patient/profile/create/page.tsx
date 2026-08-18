'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreatePatientProfile() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'Male',
    phone: '',
    address: '',
    blood: '',
    height: '',
    weight: '',
    allergies: '' // 👈 မတည့်သောဆေးဝါးများ ထည့်သွင်းရန်
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const token = localStorage.getItem('token');

    try {
      // ဆေးမတည့်မှုများကို comma (,) ဖြင့်ခွဲ၍ Array ပုံစံသို့ စနစ်တကျ ပြောင်းလဲခြင်း
      const processedAllergies = formData.allergies
        ? formData.allergies.split(',').map(item => item.trim()).filter(Boolean)
        : [];

      const formattedData = {
        name: formData.name,
        age: formData.age ? Number(formData.age) : 0,
        gender: formData.gender,
        phone: formData.phone,
        address: formData.address,
        blood: formData.blood,
        height: formData.height,
        weight: formData.weight,
        allergies: processedAllergies
      };

      const res = await fetch('http://localhost:5000/api/patients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formattedData)
      });

      const data = await res.json();

      if (res.ok && data.success) {
        router.push('/patient/dashboard');
      } else {
        throw new Error(data.message || 'Failed to create profile');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Server ချိတ်ဆက်မှု အဆင်မပြေပါ။');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fcf8f7] p-6 text-gray-800">
      <div className="max-w-xl w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-black text-rose-500 mb-1">Create Patient Profile</h1>
        <p className="text-xs text-gray-500 mb-6">ကျေးဇူးပြု၍ သင်၏ ကိုယ်ရေးအချက်အလက်များနှင့် ဆေးမတည့်မှုများကို မှန်ကန်စွာ ဖြည့်သွင်းပါ။</p>

        {error && (
          <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-xl text-xs font-medium border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Full Name</label>
              <input 
                type="text" 
                name="name" 
                required 
                value={formData.name} 
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl outline-none focus:border-rose-500"
                placeholder="Enter your name"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Age</label>
              <input 
                type="number" 
                name="age" 
                required 
                value={formData.age} 
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl outline-none focus:border-rose-500"
                placeholder="Enter age"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Gender</label>
              <select 
                name="gender" 
                value={formData.gender} 
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl outline-none focus:border-rose-500 bg-white cursor-pointer"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Phone Number</label>
              <input 
                type="text" 
                name="phone" 
                value={formData.phone} 
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl outline-none focus:border-rose-500"
                placeholder="09XXXXXXXXX"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
             <label className="block text-xs font-semibold text-gray-700 mb-1">Blood Group</label>
              <select
                name="blood"
                required
                value={formData.blood}      
                onChange={handleChange} 
                className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl outline-none focus:border-rose-500 bg-white cursor-pointer"
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
                value={formData.height} 
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl outline-none focus:border-rose-500"
                placeholder="e.g. 170cm"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Weight</label>
              <input 
                type="text" 
                name="weight" 
                value={formData.weight} 
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl outline-none focus:border-rose-500"
                placeholder="e.g. 60kg"
              />
            </div>
          </div>

          {/* 🌟 ဆေးမတည့်မှုများ (Allergies) ဖြည့်သွင်းရန် Input Field */}
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Drug Allergies (Comma separated)</label>
            <input 
              type="text" 
              name="allergies" 
              value={formData.allergies} 
              onChange={handleChange}
              className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl outline-none focus:border-rose-500"
              placeholder="e.g. Penicillin, Aspirin (မရှိလျှင် ကွက်လပ်ထားနိုင်သည်)"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Address</label>
            <input 
              type="text" 
              name="address" 
              value={formData.address} 
              onChange={handleChange}
              className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl outline-none focus:border-rose-500"
              placeholder="Enter your address"
            />
          </div>

          <button 
            type="submit" 
            disabled={submitting}
            className="w-full bg-rose-500 text-white font-semibold py-3 rounded-xl shadow hover:bg-rose-600 transition mt-4 text-sm cursor-pointer disabled:opacity-50"
          >
            {submitting ? 'Saving Profile...' : 'Save and Continue to Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
}