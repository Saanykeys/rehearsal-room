import { useState } from "react";
import { Music, CheckCircle, ArrowRight, Users, CalendarDays, Bell, Lightbulb } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5281";

const features = [
  { icon: CalendarDays, label: "Rehearsal scheduling" },
  { icon: Music, label: "Song library & setlists" },
  { icon: Bell, label: "Instant announcements" },
  { icon: Lightbulb, label: "Song suggestions" },
  { icon: Users, label: "Attendance tracking" },
];

export default function WaitlistPage() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    churchName: "",
    role: "Team Member",
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/Waitlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          fullName: form.fullName,
          churchName: form.churchName,
          role: form.role,
        }),
      });

      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch { data = text; }

      if (!res.ok) {
        setError(typeof data === "string" ? data : data?.message || "Something went wrong.");
        return;
      }

      setSubmitted(true);
    } catch {
      setError("Could not connect. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-5 border-b border-white/10">
        <p className="text-sm font-black uppercase tracking-[0.35em] text-amber-300">Rehearsal Room</p>
        <a
          href="/"
          className="text-sm font-bold text-slate-400 hover:text-white transition-colors"
        >
          ← Back to home
        </a>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left — copy */}
          <div>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-amber-400 mb-4">
              Coming soon
            </p>
            <h1 className="text-4xl lg:text-5xl font-black leading-tight mb-6">
              The app your<br />
              <span className="text-amber-400">worship team</span><br />
              has been waiting for.
            </h1>
            <p className="text-slate-400 text-lg mb-10 leading-relaxed">
              Rehearsal Room brings your whole team together — scheduling, songs, attendance, and announcements all in one place. Join the waitlist and be the first to know when we launch.
            </p>

            <div className="space-y-3">
              {features.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="rounded-xl bg-amber-400/10 p-2">
                    <Icon size={16} className="text-amber-400" />
                  </div>
                  <span className="text-slate-300 font-medium">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — form */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
            {submitted ? (
              <div className="text-center py-8">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
                  <CheckCircle size={32} className="text-green-400" />
                </div>
                <h2 className="text-2xl font-black mb-3">You're on the list!</h2>
                <p className="text-slate-400 mb-6">
                  We'll send you an email when Rehearsal Room is ready for your team. Check your inbox for a confirmation.
                </p>
                <a
                  href="/"
                  className="inline-flex items-center gap-2 rounded-2xl bg-amber-400 px-6 py-3 font-black text-slate-950 hover:bg-amber-300 transition-colors"
                >
                  Back to home <ArrowRight size={16} />
                </a>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-black mb-2">Join the waitlist</h2>
                <p className="text-slate-400 text-sm mb-8">
                  Get early access and be the first to set up your team.
                </p>

                {error && (
                  <div className="mb-6 rounded-2xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm font-semibold text-red-400">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-400">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={form.fullName}
                      onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                      placeholder="Rahsaan Hall"
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 focus:border-amber-400/50 focus:outline-none focus:ring-1 focus:ring-amber-400/30"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-400">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="you@church.org"
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 focus:border-amber-400/50 focus:outline-none focus:ring-1 focus:ring-amber-400/30"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-400">
                      Church / Organization
                    </label>
                    <input
                      type="text"
                      required
                      value={form.churchName}
                      onChange={(e) => setForm({ ...form, churchName: e.target.value })}
                      placeholder="Grace Community Church"
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 focus:border-amber-400/50 focus:outline-none focus:ring-1 focus:ring-amber-400/30"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-400">
                      I am a...
                    </label>
                    <select
                      value={form.role}
                      onChange={(e) => setForm({ ...form, role: e.target.value })}
                      className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white focus:border-amber-400/50 focus:outline-none focus:ring-1 focus:ring-amber-400/30"
                    >
                      <option value="Music Director">Music Director</option>
                      <option value="Team Member">Team Member / Musician</option>
                      <option value="Worship Pastor">Worship Pastor</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-2 w-full rounded-2xl bg-amber-400 px-6 py-4 font-black text-slate-950 transition-all hover:bg-amber-300 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? "Joining..." : <>Join the waitlist <ArrowRight size={18} /></>}
                  </button>
                </form>

                <p className="mt-4 text-center text-xs text-slate-500">
                  No spam. Just updates when we launch. 🎵
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
