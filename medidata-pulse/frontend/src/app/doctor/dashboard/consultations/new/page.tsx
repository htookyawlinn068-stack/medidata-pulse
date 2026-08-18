'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function ConsultationFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [formData, setFormData] = useState({
    patientId: '',
    appointmentId: '',
    diagnosis: '',
    notes: '',
    medicines: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const pId = searchParams.get('patientId');
    const aId = searchParams.get('appointmentId');
    if (pId || aId) {
      setFormData((prev) => ({
        ...prev,
        patientId: pId || '',
        appointmentId: aId || ''
      }));
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage({ type: '', text: '' });

    const token = localStorage.getItem('token');

    try {
      const consultationRes = await fetch('http://localhost:5000/api/consultations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          patientId: formData.patientId,
          appointmentId: formData.appointmentId,
          diagnosis: formData.diagnosis,
          notes: formData.notes
        })
      });

      const consultationData = await consultationRes.json();

      if (!consultationData.success) {
        throw new Error(consultationData.message || 'Consultation သိမ်းဆည်း၍ မရပါ။');
      }

      const consultationId = consultationData.data._id;

      if (formData.medicines.trim()) {
        const prescriptionRes = await fetch('http://localhost:5000/api/prescriptions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            patientId: formData.patientId,
            consultationId: consultationId,
            medicines: formData.medicines,
            description: formData.description
          })
        });

        const prescriptionData = await prescriptionRes.json();
        if (!prescriptionData.success) {
          throw new Error(prescriptionData.message || 'ဆေးညွှန်း သိမ်းဆည်း၍ မရပါ။');
        }
      }

      if (formData.appointmentId) {
        await fetch(`http://localhost:5000/api/appointments/${formData.appointmentId}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ status: 'completed' })
        });
      }

      setStatusMessage({ type: 'success', text: 'ဆွေးနွေးမှု မှတ်တမ်းနှင့် ဆေးညွှန်းကို အောင်မြင်စွာ သိမ်းဆည်းပြီးပါပြီ။' });
      
      setTimeout(() => {
        router.push('/doctor/dashboard');
      }, 1500);

    } catch (err: any) {
      console.error('Error:', err);
      setStatusMessage({ type: 'error', text: err.message || 'ဆာဗာချိတ်ဆက်မှု အမှားအယွင်းရှိနေပါသည်။' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#fcf8f7] text-gray-800">
      <aside className="flex w-64 flex-col border-r border-gray-200 bg-white p-6">
        <div className="mb-10 text-2xl font-black text-rose-500">Medidata Pulse</div>
        <nav className="flex flex-col space-y-2 text-gray-600 font-medium text-sm">
          <Link href="/doctor/dashboard" className="rounded-xl px-4 py-3 hover:bg-gray-50 hover:text-rose-500 transition">
            🏠 Dashboard
          </Link>
          <Link href="/doctor/dashboard/consultations/new" className="rounded-xl bg-rose-50 px-4 py-3 text-rose-600 shadow-sm font-semibold">
            ✍️ New Consultation & Rx
          </Link>
        </nav>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto max-w-4xl">
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">Patient Consultation & Prescription Form</h1>
          <p className="text-sm text-gray-500">လူနာ၏ ရောဂါစစ်ဆေးချက်မှတ်တမ်းနှင့် ဆေးညွှန်းများကို ဤနေရာတွင် ဖြည့်သွင်းပါ</p>
        </header>

        {statusMessage.text && (
          <div className={`p-4 mb-6 rounded-2xl text-xs font-semibold ${
            statusMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'
          }`}>
            {statusMessage.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">လူနာ၏ ID (Patient ID)</label>
            <input
              type="text"
              name="patientId"
              required
              value={formData.patientId}
              onChange={handleChange}
              placeholder="ဥပမာ - 65f... (Patient MongoDB ObjectId)"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-rose-500 text-xs text-gray-800 bg-gray-50/50"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">🔍 ရောဂါရှာဖွေချက် (Diagnosis)</label>
            <input
              type="text"
              name="diagnosis"
              required
              value={formData.diagnosis}
              onChange={handleChange}
              placeholder="ဥပမာ - Acute Bronchitis / Hypertension"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-rose-500 text-xs text-gray-800 bg-gray-50/50"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">📝 ဆရာဝန်မှတ်ချက် / ရောဂါလက္ခဏာ (Notes)</label>
            <textarea
              name="notes"
              rows={3}
              value={formData.notes}
              onChange={handleChange}
              placeholder="လူနာ၏ ကိုယ်ပူချိန်၊ သွေးပေါင်ချိန်နှင့် အသေးစိတ် စမ်းသပ်တွေ့ရှိချက်များ..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-rose-500 text-xs text-gray-800 bg-gray-50/50"
            />
          </div>

          <hr className="border-gray-100 my-4" />

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">💊 သောက်သုံးရန် ဆေးဝါးများ (Medicines)</label>
            <textarea
              name="medicines"
              rows={3}
              value={formData.medicines}
              onChange={handleChange}
              placeholder="1. Paracetamol 500mg - 1 a day (After food)&#10;2. Amoxicillin 250mg - 3 times a day"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-rose-500 text-xs text-gray-800 bg-gray-50/50"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">📋 ဆေးသောက်ရန် ညွှန်ကြားချက်များနှင့် အစားအစာ ရှောင်ရန်/စားရန် (Description / Instructions)</label>
            <textarea
              name="description"
              rows={2}
              value={formData.description}
              onChange={handleChange}
              placeholder="ရေများများသောက်ပါ၊ အစပ်ရှောင်ပါ၊ အဆီအဆိမ့်ရှောင်ရန်၊ ၃ ရက်နေရင် ပြန်ပြပါ။"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-rose-500 text-xs text-gray-800 bg-gray-50/50"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold text-xs shadow-md shadow-rose-500/20 transition disabled:bg-rose-300 cursor-pointer"
          >
            {loading ? 'သိမ်းဆည်းနေပါသည်...' : '💾 မှတ်တမ်းနှင့် ဆေးညွှန်း သိမ်းဆည်းမည်'}
          </button>
        </form>
      </main>
    </div>
  );
}

export default function CreateConsultationPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center text-xs text-slate-500">Loading form...</div>}>
      <ConsultationFormContent />
    </Suspense>
  );
}