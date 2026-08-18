'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:5000/api/notifications', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setNotifications(data.data || []);
      } else {
        setError(data.message || 'အသိပေးချက်များကို ရယူ၍မရပါ။');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('ဆာဗာချိတ်ဆက်မှု အမှားအယွင်းရှိနေပါသည်။');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5000/api/notifications/${id}/read`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        // State ထဲတွင် အဆိုပါ Notification ကို Read ပြီးသားအဖြစ် ပြောင်းလဲမည်
        setNotifications(notifications.map(item => 
          item._id === id ? { ...item, is_read: true } : item
        ));
      }
    }
    catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#fcf8f7] text-gray-800">
      {/* Main Content */}
      <main className="flex-1 p-8 max-w-4xl mx-auto">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Notifications</h1>
            <p className="text-sm text-gray-500">သင်၏ အရေးကြီးသော အသိပေးချက်များနှင့် မက်ဆေ့ချ်များ</p>
          </div>
          <Link href="/patient/dashboard" className="text-xs font-bold text-rose-500 hover:underline">
            ← Dashboard သို့ ပြန်ရန်
          </Link>
        </header>

        {loading ? (
          <div className="text-rose-500 font-medium text-xs">အသိပေးချက်များကို ရှာဖွေနေပါသည်...</div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-xs">{error}</div>
        ) : notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications.map((item: any) => (
              <div 
                key={item._id} 
                className={`p-5 rounded-2xl shadow-sm border transition flex justify-between items-center ${
                  item.is_read ? 'bg-white border-gray-100 opacity-75' : 'bg-rose-50/40 border-rose-100 font-medium'
                }`}
              >
                <div>
                  <p className="text-xs text-gray-800">{item.message || item.content || 'အသိပေးချက် အသစ်ရှိပါသည်။'}</p>
                  <span className="text-[10px] text-gray-400 mt-1 block">
                    {new Date(item.createdAt).toLocaleString()}
                  </span>
                </div>

                {!item.is_read && (
                  <button
                    onClick={() => handleMarkAsRead(item._id)}
                    className="px-3 py-1.5 bg-rose-500 text-white rounded-xl text-[10px] font-bold hover:bg-rose-600 shadow-sm"
                  >
                    Mark as Read
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-10 rounded-2xl text-center text-xs text-gray-400 border border-gray-100 shadow-sm">
            လောလောဆယ် အသိပေးချက်များ မရှိသေးပါ။
          </div>
        )}
      </main>
    </div>
  );
}