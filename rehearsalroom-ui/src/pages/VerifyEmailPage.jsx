import { useEffect, useState } from "react";
import logo from "../assets/rehearsalroom-logo.png";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5281";

export default function VerifyEmailPage() {
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [message, setMessage] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!token) {
      setStatus("error");
      setMessage("No verification token found in the link. Please check your email and try again.");
      return;
    }

    fetch(`${API_BASE}/api/Auth/verify-email?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        const text = await res.text();
        let data;
        try { data = JSON.parse(text); } catch { data = { message: text }; }

        if (res.ok) {
          setStatus("success");
          setMessage(data.message || "Email verified! You can now log in.");
        } else {
          setStatus("error");
          setMessage(data.message || data || "Verification failed. The link may have already been used.");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Could not connect to the server. Please try again.");
      });
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
      <div className="w-full max-w-md text-center">
        <a href="/" className="inline-flex items-center gap-2 mb-8">
          <img src={logo} alt="Rehearsal Room" className="h-10 w-10 rounded-2xl object-cover" />
          <span className="text-sm font-black uppercase tracking-[0.3em] text-amber-300">
            Rehearsal Room
          </span>
        </a>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur">
          {status === "loading" && (
            <>
              <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-amber-400" />
              <h1 className="text-2xl font-black">Verifying your email…</h1>
              <p className="mt-2 text-slate-400">Just a moment.</p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-400/10">
                <svg className="h-7 w-7 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-2xl font-black text-emerald-300">Email Verified!</h1>
              <p className="mt-3 text-slate-400">{message}</p>
              <a
                href="/"
                className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-amber-400 px-6 py-3 font-black text-slate-950 transition hover:bg-amber-300"
              >
                Go to Login →
              </a>
            </>
          )}

          {status === "error" && (
            <>
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-red-400/10">
                <svg className="h-7 w-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="text-2xl font-black text-red-300">Verification Failed</h1>
              <p className="mt-3 text-slate-400">{message}</p>
              <a
                href="/"
                className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-white/10 px-6 py-3 font-bold text-slate-200 transition hover:bg-white/15"
              >
                ← Back to Home
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
