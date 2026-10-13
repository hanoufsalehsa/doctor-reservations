"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, CalendarDays, Check, Clock3, HeartPulse, LockKeyhole, MapPin, ShieldCheck, Sparkles, UserRound } from "lucide-react";

type Step = 1 | 2 | 3;
type Patient = { name: string; email: string; phone: string };
type Booking = { id: number; name: string; email: string; phone: string; date: string; time: string };

const times = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30"];

function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function dayLabel(date: Date) {
  return new Intl.DateTimeFormat("en", { weekday: "short", day: "numeric" }).format(date);
}

function longDate(value: string) {
  return new Intl.DateTimeFormat("en", { weekday: "long", month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T12:00:00Z`));
}

export default function Home() {
  const [step, setStep] = useState<Step>(1);
  const [patient, setPatient] = useState<Patient>({ name: "", email: "", phone: "" });
  const [days, setDays] = useState<{ key: string; label: string }[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [bookedTimes, setBookedTimes] = useState<string[]>([]);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const upcoming: { key: string; label: string }[] = [];
    for (let offset = 1; upcoming.length < 8 && offset < 18; offset++) {
      const date = new Date();
      date.setHours(12, 0, 0, 0);
      date.setDate(date.getDate() + offset);
      if (date.getDay() !== 0 && date.getDay() !== 6) upcoming.push({ key: dateKey(date), label: dayLabel(date) });
    }
    setDays(upcoming);
    setSelectedDate(upcoming[0]?.key ?? "");
  }, []);

  useEffect(() => {
    if (!selectedDate) return;
    let active = true;
    fetch(`/api/availability?date=${encodeURIComponent(selectedDate)}`)
      .then((response) => response.json())
      .then((data: { booked?: string[] }) => { if (active) setBookedTimes(data.booked ?? []); })
      .catch(() => { if (active) setError("We couldn’t load the available times. Please try again."); });
    return () => { active = false; };
  }, [selectedDate]);

  const availableCount = useMemo(() => times.length - bookedTimes.length, [bookedTimes]);
  const updatePatient = (field: keyof Patient, value: string) => setPatient((current) => ({ ...current, [field]: value }));

  async function confirmBooking() {
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...patient, date: selectedDate, time: selectedTime }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "We couldn’t save your reservation.");
      setBooking(result.reservation);
      setStep(3);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Please try again.");
      if (cause instanceof Error && cause.message.includes("no longer available")) {
        setBookedTimes((current) => [...current, selectedTime]);
        setSelectedTime("");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f8f4] text-[#18302c]">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
        <a href="#top" className="flex items-center gap-3" aria-label="Dr. Your Name home">
          <span className="grid size-11 place-items-center rounded-[15px] bg-[#dcece4] text-[#1d6b58]"><HeartPulse size={21} strokeWidth={1.8} /></span>
          <span><span className="block text-[15px] font-semibold tracking-[-0.03em]">Dr. Your Name</span><span className="block text-[11px] tracking-wide text-[#75827d]">CLINIC APPOINTMENTS</span></span>
        </a>
        <a href="#booking" className="rounded-full border border-[#d7e1db] bg-white px-4 py-2.5 text-sm font-medium text-[#2d5e50] transition hover:border-[#90b8a8]">Book a visit <span aria-hidden="true">↗</span></a>
      </header>

      <section id="top" className="mx-auto grid max-w-6xl gap-10 px-5 pb-12 pt-5 sm:px-8 md:grid-cols-[1fr_0.86fr] md:items-center md:gap-14 md:pb-20 md:pt-14 lg:px-10">
        <div className="max-w-[580px]">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#d9e7de] bg-white px-3 py-1.5 text-xs font-medium text-[#397361]"><span className="size-1.5 rounded-full bg-[#6ba88f]" /> A calmer way to book care</div>
          <h1 className="max-w-[560px] text-[42px] font-medium leading-[1.08] tracking-[-0.055em] sm:text-[54px]">Your health deserves <span className="font-serif italic text-[#43806b]">unhurried</span> care.</h1>
          <p className="mt-5 max-w-[470px] text-[16px] leading-7 text-[#6e7e77]">Choose a time that works for you. Booking takes just a moment, and your visit details will be right here when you need them.</p>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-[13px] text-[#687b73]"><span className="flex items-center gap-2"><ShieldCheck size={16} className="text-[#4f8a75]" /> Private by design</span><span className="flex items-center gap-2"><Clock3 size={16} className="text-[#4f8a75]" /> 30-minute visits</span></div>
        </div>
        <div className="relative mx-auto w-full max-w-[470px]">
          <div className="absolute -right-3 -top-4 h-28 w-28 rounded-full bg-[#e4eee7] blur-2xl" />
          <div className="relative overflow-hidden rounded-[28px] bg-[#d9e9df] p-6 sm:p-8">
            <div className="absolute -right-12 -top-14 size-60 rounded-full border border-white/40" /><div className="absolute -right-2 -top-4 size-40 rounded-full border border-white/40" />
            <div className="relative flex min-h-[290px] flex-col justify-between sm:min-h-[315px]">
              <div className="flex items-center justify-between"><span className="rounded-full bg-white/70 px-3 py-1.5 text-[11px] font-medium text-[#497864]">YOUR CARE, YOUR TIME</span><Sparkles size={19} className="text-[#64947e]" /></div>
              <div className="max-w-[310px]"><p className="font-serif text-[50px] leading-none tracking-[-0.05em] text-[#22463a] sm:text-[56px]">A little more<br />room to breathe.</p><p className="mt-4 max-w-[260px] text-sm leading-6 text-[#5c7869]">Simple scheduling for thoughtful, personal care.</p></div>
              <div className="flex items-center gap-3 border-t border-[#bfd5c7] pt-4"><span className="grid size-10 place-items-center rounded-full bg-[#b8d4c2] text-[#356a56]"><UserRound size={17} /></span><span><span className="block text-sm font-medium text-[#2a5143]">Dr. Your Name</span><span className="block text-xs text-[#688575]">Your specialist</span></span><span className="ml-auto flex items-center gap-1.5 text-xs text-[#557866]"><MapPin size={13} /> Clinic visit</span></div>
            </div>
          </div>
          <div className="absolute -bottom-5 -left-3 flex items-center gap-3 rounded-2xl border border-[#e4e9e4] bg-white px-4 py-3 shadow-[0_12px_35px_rgba(27,61,48,0.09)] sm:-left-7"><span className="grid size-9 place-items-center rounded-xl bg-[#edf5ef] text-[#4f8a75]"><CalendarDays size={17} /></span><span><span className="block text-xs font-semibold">A time that fits your day</span><span className="block text-[11px] text-[#819087]">Book in a few simple steps</span></span></div>
        </div>
      </section>

      <section id="booking" className="mx-auto max-w-6xl scroll-mt-6 px-5 pb-14 pt-10 sm:px-8 md:pb-20 lg:px-10">
        <div className="mb-6 flex items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#638677]">MAKE IT YOURS</p><h2 className="mt-2 text-2xl font-medium tracking-[-0.04em] sm:text-[30px]">Reserve your appointment</h2></div><span className="hidden items-center gap-1.5 pb-1 text-xs text-[#7a8982] sm:flex"><LockKeyhole size={13} /> Your details stay private</span></div>
        <div className="grid overflow-hidden rounded-[26px] border border-[#e3e9e3] bg-white shadow-[0_14px_50px_rgba(23,54,41,0.045)] md:grid-cols-[250px_1fr] lg:grid-cols-[280px_1fr]">
          <aside className="border-b border-[#e9eee9] bg-[#fbfcfa] p-5 sm:p-7 md:border-b-0 md:border-r"><p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-[#8b9991]">YOUR BOOKING</p><div className="mt-6 space-y-5">
            {([1, 2] as const).map((item) => <div key={item} className="flex gap-3"><span className={`mt-0.5 grid size-7 shrink-0 place-items-center rounded-full text-xs font-semibold ${step === item ? "bg-[#2f725e] text-white" : step > item ? "bg-[#dcece4] text-[#34715d]" : "bg-[#edf0ec] text-[#9aa69e]"}`}>{step > item ? <Check size={14} /> : `0${item}`}</span><span><span className={`block text-sm font-medium ${step === item ? "text-[#254d3d]" : "text-[#748078]"}`}>{item === 1 ? "Your details" : "Choose a time"}</span><span className="mt-0.5 block text-xs text-[#929c96]">{item === 1 ? "A few details to get started" : "Find a time that suits you"}</span></span></div>)}
            {step === 3 && <div className="flex gap-3"><span className="mt-0.5 grid size-7 place-items-center rounded-full bg-[#dcece4] text-[#34715d]"><Check size={14} /></span><span><span className="block text-sm font-medium text-[#254d3d]">Confirmed</span><span className="mt-0.5 block text-xs text-[#929c96]">Your visit is reserved</span></span></div>}
          </div><div className="mt-8 rounded-2xl bg-[#f0f5f0] p-4"><div className="flex items-center gap-2 text-xs font-semibold text-[#396b56]"><ShieldCheck size={15} /> A private booking</div><p className="mt-2 text-xs leading-5 text-[#79877f]">We only ask for the details needed to arrange your visit. Please don’t include medical information here.</p></div></aside>

          <div className="min-h-[420px] p-5 sm:p-8 lg:p-10">
            {step === 1 && <div className="mx-auto max-w-[560px]"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#739080]">STEP 1 OF 2</p><h3 className="mt-2 text-[23px] font-medium tracking-[-0.035em]">Let’s get to know you</h3><p className="mt-1 text-sm text-[#7f8d85]">Share your contact details so the clinic can prepare for your visit.</p><div className="mt-7 grid gap-4 sm:grid-cols-2"><label className="field-wrap sm:col-span-2">Full name<input autoComplete="name" value={patient.name} onChange={(e) => updatePatient("name", e.target.value)} placeholder="e.g. Noor Al-Salem" required /></label><label className="field-wrap">Email address<input type="email" autoComplete="email" value={patient.email} onChange={(e) => updatePatient("email", e.target.value)} placeholder="you@example.com" required /></label><label className="field-wrap">Phone number<input type="tel" autoComplete="tel" value={patient.phone} onChange={(e) => updatePatient("phone", e.target.value)} placeholder="+966 5X XXX XXXX" required /></label></div><p className="mt-4 text-xs leading-5 text-[#98a19b]">No password needed. Your details are saved with your reservation.</p><div className="mt-7 flex justify-end"><button className="primary-button" onClick={() => { setError(""); setStep(2); }} disabled={!patient.name.trim() || !/^\S+@\S+\.\S+$/.test(patient.email) || patient.phone.trim().length < 7}>Continue <ArrowRight size={16} /></button></div></div>}

            {step === 2 && <div className="mx-auto max-w-[610px]"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#739080]">STEP 2 OF 2</p><h3 className="mt-2 text-[23px] font-medium tracking-[-0.035em]">Choose a time</h3><p className="mt-1 text-sm text-[#7f8d85]">Select a weekday and a 30-minute appointment slot.</p><div className="mt-6"><div className="mb-3 flex items-center justify-between"><span className="text-sm font-medium">Upcoming weekdays</span><span className="text-xs text-[#91a097]">Times shown in Riyadh time</span></div><div className="flex gap-2 overflow-x-auto pb-2">{days.map((day) => <button key={day.key} onClick={() => { setSelectedDate(day.key); setSelectedTime(""); setError(""); }} className={`min-w-[72px] rounded-2xl border px-3 py-3 text-center transition ${selectedDate === day.key ? "border-[#34765f] bg-[#eaf3ed] text-[#2e6b56]" : "border-[#e8ece8] bg-white text-[#77847c] hover:border-[#bfd4c6]"}`}><span className="block text-[11px] font-medium uppercase">{day.label.slice(0, 3)}</span><span className="mt-1 block text-[18px] font-semibold">{day.label.match(/\d+/)?.[0]}</span></button>)}</div></div><div className="mt-5"><div className="mb-3 flex items-center justify-between"><span className="text-sm font-medium">{selectedDate ? longDate(selectedDate) : "Available times"}</span><span className="text-xs text-[#91a097]">{Math.max(availableCount, 0)} slots left</span></div><div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">{times.map((time) => { const unavailable = bookedTimes.includes(time); return <button key={time} disabled={unavailable} onClick={() => { setSelectedTime(time); setError(""); }} className={`rounded-xl border px-3 py-3 text-sm font-medium transition ${unavailable ? "cursor-not-allowed border-[#f0f1ee] bg-[#f8f9f7] text-[#c0c7c1] line-through" : selectedTime === time ? "border-[#34765f] bg-[#eaf3ed] text-[#2e6b56]" : "border-[#e5eae5] bg-white text-[#63756b] hover:border-[#a8c7b5]"}`}>{time}</button>; })}</div></div>{error && <p role="alert" className="mt-4 rounded-xl bg-[#fff5f1] px-3 py-2.5 text-sm text-[#a64d36]">{error}</p>}<div className="mt-7 flex flex-col-reverse gap-3 border-t border-[#edf0ec] pt-5 sm:flex-row sm:items-center sm:justify-between"><button className="secondary-button" onClick={() => { setError(""); setStep(1); }}><ArrowLeft size={15} /> Back to details</button><button className="primary-button" onClick={confirmBooking} disabled={!selectedTime || loading}>{loading ? "Reserving…" : "Confirm appointment"} <ArrowRight size={16} /></button></div></div>}

            {step === 3 && booking && <div className="mx-auto flex max-w-[510px] flex-col items-center py-5 text-center"><span className="grid size-[62px] place-items-center rounded-full bg-[#e3f1e8] text-[#34765f]"><Check size={29} strokeWidth={2} /></span><p className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-[#69917e]">YOU’RE ALL SET</p><h3 className="mt-2 text-[28px] font-medium tracking-[-0.04em]">Your appointment is reserved.</h3><p className="mt-2 text-sm leading-6 text-[#7d8a82]">We look forward to seeing you, {booking.name.split(" ")[0]}.</p><div className="mt-7 w-full rounded-2xl border border-[#e5ece6] bg-[#fafcf9] p-5 text-left"><div className="flex items-start gap-3"><span className="grid size-10 place-items-center rounded-xl bg-[#e5f0e8] text-[#4b826d]"><CalendarDays size={18} /></span><span><span className="block text-sm font-semibold">{longDate(booking.date)}</span><span className="mt-1 block text-sm text-[#74847a]">{booking.time} · 30 minutes</span></span></div><div className="mt-4 border-t border-[#e8eee8] pt-4 text-xs leading-5 text-[#829087]">A confirmation is shown here for your records. Keep this page open or save the appointment details.</div></div><p className="mt-5 text-xs text-[#a0aaa3]">Questions? Contact the clinic directly to make changes.</p><button className="secondary-button mt-5" onClick={() => { setStep(1); setBooking(null); setSelectedTime(""); setPatient({ name: "", email: "", phone: "" }); }}>Book another visit <ArrowRight size={15} /></button></div>}
          </div>
        </div>
      </section>
      <footer className="border-t border-[#e7ece6] bg-[#f4f6f2]"><div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-6 text-xs text-[#8b978f] sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10"><span>© {new Date().getFullYear()} Dr. Your Name · All rights reserved</span><span>Appointments are subject to clinic confirmation.</span></div></footer>
    </main>
  );
}
