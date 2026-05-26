import { useState } from "react";
import logo from "../assets/rehearsalroom-logo.png";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5281";

export default function ResetPasswordPage() {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password.length < 8) {
      setStatus("error");
      setMessage("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setStatus("error");
      setMessage("Passwords do not match.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch(`${API_BASE}/api/Auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch { data = { message: text }; }

      if (res.ok) {
        setStatus("success");
        setMessage(data.message || "Password reset successfully!");
      } else {
        setStatus("error");
        setMessage(data.message || data || "Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setMessage("Could not connect to the server. Please try again.");
    }
  };

  if (!token) {
    return (
      <ErrorScreen message="No reset token found. Please use the link from your email." />
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950 px-4 text-white">
      <div className="w-full max-w-md">
        <a href="/" className="mb-8 flex items-center justify-center gap-2">
          <img src={logo} alt="Rehearsal Room" className="h-10 w-10 rounded-2xl object-cover" />
          <span className="text-sm font-black uppercase tracking-[0.3em] text-amber-300">
            Rehearsal Room
          </span>
        </a>

        <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-7 shadow-2xl backdrop-blur">
          {status === "success" ? (
            <div className="text-center">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-400/10">
                <svg className="h-7 w-7 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-2xl font-black text-emerald-300">Password Reset!</h1>
              <p className="mt-3 text-slate-400">{message}</p>
              <a
                href="/"
                className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-amber-400 px-6 py-3 font-black text-slate-950 transition hover:bg-amber-300"
              >
                Go to Login →
              </a>
            </div>
          ) : (
            <>
              <p className="text-xs font-black uppercase tracking-[0.3em] text-amber-300">
                Password Reset
              </p>
              <h1 className="mt-3 text-3xl font-black">Choose a new password</h1>
              <p className="mt-2 text-sm text-slate-400">
                Enter a strong password to secure your Rehearsal Room account.
              </p>

              {status === "error" && (
                <div className="mt-5 rounded-2xl bg-red-500/20 px-4 py-3 text-sm font-bold text-red-200">
                  {message}
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <PasswordInput
                  label="New Password"
                  value={password}
                  onChange={setPassword}
                  show={showPassword}
                  onToggle={() => setShowPassword((v) => !v)}
                  placeholder="At least 8 characters"
                />
                <PasswordInput
                  label="Confirm Password"
                  value={confirm}
                  onChange={setConfirm}
                  show={showPassword}
                  onToggle={() => setShowPassword((v) => !v)}
                  placeholder="Repeat your password"
                />

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full rounded-2xl bg-amber-400 px-5 py-3 font-black text-slate-950 transition hover:scale-[1.02] disabled:opacity-60"
                >
                  {status === "loading" ? "Resetting…" : "Reset Password"}
                </button>

                <a
                  href="/"
                  className="block w-full rounded-2xl bg-white/10 px-5 py-3 text-center font-bold text-slate-200 transition hover:bg-white/15"
                >
                  ← Back to Home
                </a>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function PasswordInput({ label, value, onChange, show, onToggle, placeholder }) {
  return (
    <label>
      <span className="text-sm font-bold text-slate-200">{label}</span>
      <div className="relative mt-2">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required
          className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 pr-12 text-white outline-none placeholder:text-slate-500 focus:border-amber-400"
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-300 transition-colors"
          tabIndex={-1}
        >
          {show ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
              <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
              <line x1="1" y1="1" x2="23" y2="23"/>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          )}
        </button>
      </div>
    </label>
  );
}

function ErrorScreen({ message }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
      <div className="w-full max-w-md text-center rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-red-400/10">
          <svg className="h-7 w-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 className="text-2xl font-black text-red-300">Invalid Link</h1>
        <p className="mt-3 text-slate-400">{message}</p>
        <a href="/" className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-white/10 px-6 py-3 font-bold text-slate-200 hover:bg-white/15 transition">
          ← Back to Home
        </a>
      </div>
    </div>
  );
}
