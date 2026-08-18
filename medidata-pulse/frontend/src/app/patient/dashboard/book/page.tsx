'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

function BookingContent() {
  const searchParams = useSearchParams();
  const preSelectedDoctorId = searchParams.get('doctorId');

  const [doctors, setDoctors] = useState<any[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    fetch('http://localhost:5000/api/doctors', { headers })
      .then(res => res.json())
      .then(data => {
        const docList = data.data || data.doctors || [];
        setDoctors(docList);

        if (preSelectedDoctorId) {
          const found = docList.find((d: any) => (d._id || d.id) === preSelectedDoctorId);
          if (found) {
            setSelectedDoctor(found);
          }
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching doctors:', err);
        setLoading(false);
      });
  }, [preSelectedDoctorId]);

  const handleDoctorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const docId = e.target.value;
    const found = doctors.find(d => (d._id || d.id) === docId);
    setSelectedDoctor(found || null);
    setStartDate(null);
    setTime('');
  };

  const getParsedAvailableDays = () => {
    const rawDays = selectedDoctor?.available_days || selectedDoctor?.onDutyDays;
    if (!rawDays) return ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

    let dayList: string[] = [];
    if (Array.isArray(rawDays)) {
      rawDays.forEach(item => {
        if (typeof item === 'string') {
          item.split(',').forEach(d => dayList.push(d.trim()));
        }
      });
    }

    const dayMapping: { [key: string]: string } = {
      'Mon': 'Monday', 'Tue': 'Tuesday', 'Wed': 'Wednesday', 'Thu': 'Thursday',
      'Fri': 'Friday', 'Sat': 'Saturday', 'Sun': 'Sunday',
      'Monday': 'Monday', 'Tuesday': 'Tuesday', 'Wednesday': 'Wednesday',
      'Thursday': 'Thursday', 'Friday': 'Friday', 'Saturday': 'Saturday', 'Sunday': 'Sunday'
    };

    return dayList.map(d => dayMapping[d] || d);
  };

  const allowedDays = getParsedAvailableDays();

  const isWeekdayAllowed = (date: Date) => {
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    return allowedDays.includes(dayName);
  };

  const generateTimeSlots = (timeRange: string) => {
    if (!timeRange || !timeRange.includes('-')) return ['09:00', '10:00', '11:00', '14:00', '15:00'];
    
    const [start, end] = timeRange.split('-').map(t => t.trim());
    const [startHour, startMinute] = start.split(':').map(Number);
    const [endHour, endMinute] = end.split(':').map(Number);

    const slots = [];
    let currentHour = startHour;
    let currentMinute = startMinute || 0;

    while (currentHour < endHour || (currentHour === endHour && currentMinute < endMinute)) {
      const formattedHour = String(currentHour).padStart(2, '0');
      const formattedMinute = String(currentMinute).padStart(2, '0');
      slots.push(`${formattedHour}:${formattedMinute}`);

      currentMinute += 30;
      if (currentMinute >= 60) {
        currentMinute = 0;
        currentHour += 1;
      }
    }
    return slots;
  };

  const doctorTimeRange = selectedDoctor?.available_time || "09:00 - 16:00";
  const timeSlots = generateTimeSlots(doctorTimeRange);

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctor || !startDate || !time) {
      alert('ကျေးဇူးပြု၍ ဆရာဝန်၊ ရက်စွဲနှင့် အချိန်ကို အပြည့်အစုံ ရွေးချယ်ပါ။');
      return;
    }

    let patientId = '';
    try {
      patientId = localStorage.getItem('patientId') || localStorage.getItem('userId') || '';
      if (!patientId) {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const userObj = JSON.parse(userStr);
          patientId = userObj._id || userObj.id || userObj.patientId || '';
        }
      }
    } catch (e) {
      console.error('Error reading localStorage', e);
    }

    setSubmitting(true);
    const token = localStorage.getItem('token');
    const formattedDate = startDate.toISOString().split('T')[0];

    try {
      const res = await fetch('http://localhost:5000/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          doctorId: selectedDoctor._id || selectedDoctor.id,
          patientId: patientId,
          date: formattedDate,
          time,
          notes
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        alert('ရက်ချိန်း တောင်းဆိုမှု အောင်မြင်ပါသည်။');
        window.location.href = '/patient/dashboard/appointments';
      } else {
        throw new Error(data.message || 'Booking failed');
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'ရက်ချိန်းယူရာတွင် အမှားအယွင်းရှိနေပါသည်။');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center text-rose-500 text-xs">Loading booking info...</div>;
  }

  return (
    <div className="flex min-h-screen bg-[#fcf8f7] text-gray-800 p-8 justify-center items-center">
      <div className="max-w-xl w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100 relative">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-extrabold text-gray-900">Book Appointment</h1>
          <Link href="/patient/dashboard" className="text-xs font-semibold text-rose-500 hover:underline">
            ← Dashboard သို့ ပြန်ရန်
          </Link>
        </div>

        <form onSubmit={handleBookingSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Selected Doctor</label>
            {preSelectedDoctorId && selectedDoctor ? (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">👨‍⚕️ {selectedDoctor.name || selectedDoctor.username || 'Doctor'}</h3>
                  <p className="text-rose-600 font-medium">{selectedDoctor.specialization || 'General Practitioner'}</p>
                  <p className="text-gray-500 mt-1 text-[11px]">
                    📅 On-duty Days: <span className="font-semibold text-gray-700">{allowedDays.join(', ')}</span>
                  </p>
                  <p className="text-gray-500 mt-0.5 text-[11px]">
                    🕒 Available Time: <span className="font-semibold text-gray-700">{doctorTimeRange}</span>
                  </p>
                </div>
                <Link href="/patient/dashboard" className="text-gray-400 hover:text-rose-600 text-xs font-bold">
                  Change
                </Link>
              </div>
            ) : (
              <select
                value={selectedDoctor?._id || selectedDoctor?.id || ''}
                onChange={handleDoctorChange}
                required
                className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl outline-none focus:border-rose-500 bg-white"
              >
                <option value="">-- ဆရာဝန် ရွေးချယ်ပါ --</option>
                {doctors.map((doc: any) => (
                  <option key={doc._id || doc.id} value={doc._id || doc.id}>
                    {doc.name || doc.username || 'Doctor'} ({doc.specialization || 'General Practitioner'})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Appointment Date (On-duty Days Only)</label>
            <DatePicker
              selected={startDate}
              onChange={(date: Date | null) => setStartDate(date)}
              filterDate={isWeekdayAllowed}
              minDate={new Date()}
              placeholderText="တာဝန်ကျရက်ကို ရွေးချယ်ပါ..."
              className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl outline-none focus:border-rose-500"
              dateFormat="yyyy-MM-dd"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Appointment Time (Available Slots)</label>
            <select
              value={time}
              onChange={e => setTime(e.target.value)}
              required
              className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl outline-none focus:border-rose-500 bg-white"
            >
              <option value="">-- အချိန် ရွေးချယ်ပါ --</option>
              {timeSlots.map((slot: string) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Notes (Optional)</label>
            <textarea
              rows={3}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="ရောဂါ လက္ခဏာ သို့မဟုတ် မှတ်စုရေးရန်..."
              className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl outline-none focus:border-rose-500 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-rose-500 text-white font-semibold py-3 rounded-xl shadow hover:bg-rose-600 transition cursor-pointer disabled:opacity-50"
          >
            {submitting ? 'Confirming...' : 'Confirm Appointment'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function PatientBookAppointmentPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center text-rose-500 text-xs">Loading...</div>}>
      <BookingContent />
    </Suspense>
  );
}