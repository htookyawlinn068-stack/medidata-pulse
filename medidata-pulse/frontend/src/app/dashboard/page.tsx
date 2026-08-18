"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function DashboardContent() {
  const searchParams = useSearchParams();
  const role = searchParams.get("role") || "patient";

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Welcome, {role.toUpperCase()}</h1>
      <p className="text-slate-500">You are currently logged in as {role}.</p>
      {/* ဒီနေရာမှာ role ပေါ်မူတည်ပြီး တစ်ခြား component တွေ ခွဲထုတ်ပြလို့ရပါတယ် */}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardContent />
    </Suspense>
  );
}