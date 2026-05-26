import { useState, useEffect } from "react";
import rehearsalLogo from "./assets/rehearsalroom-logo.png";
import AdminDashboard from "./components/AdminDashboard";
import LandingPage from "./pages/LandingPage";
import WaitlistPage from "./pages/WaitlistPage";
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5281";

export default function App() {
  const [showAuth, setShowAuth] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);

  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem("rehearsalRoomUser");
    if (!savedUser) return null;
    const parsed = JSON.parse(savedUser);
    // If the saved session is from before multi-tenancy (no organizationId), clear it
    if (!parsed.organizationId) {
      localStorage.removeItem("rehearsalRoomUser");
      localStorage.removeItem("rehearsalRoomToken");
      return null;
    }
    return parsed;
  });

  const [token, setToken] = useState(() => {
    // Only keep the token if the user session is still valid
    const savedUser = localStorage.getItem("rehearsalRoomUser");
    if (!savedUser) return null;
    const parsed = JSON.parse(savedUser);
    if (!parsed.organizationId) return null;
    return localStorage.getItem("rehearsalRoomToken");
  });

  const [authMode, setAuthMode] = useState("login");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [googlePendingUser, setGooglePendingUser] = useState(null); // { googleId, email, fullName }

  const [authForm, setAuthForm] = useState({
    fullName: "",
    email: "",
    password: "",
    directorCode: "",
    orgName: "",
    inviteCode: "",
  });
  const isLoggedIn = currentUser && token;

  const handleAuthSubmit = async (event) => {
    event.preventDefault();
    setAuthError("");
    setAuthLoading(true);

    const endpoint = authMode === "login" ? "login" : "register";

    const payload =
      authMode === "login"
        ? {
            email: authForm.email,
            password: authForm.password,
          }
        : {
            fullName: authForm.fullName,
            email: authForm.email,
            password: authForm.password,
            directorCode: authForm.directorCode,
            orgName: authForm.orgName,
            inviteCode: authForm.inviteCode,
          };

    try {
      const response = await fetch(`${API_BASE}/api/Auth/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      // Backend sometimes returns plain text errors, sometimes JSON
      const text = await response.text();
      let data = null;
      try { data = JSON.parse(text); } catch { data = text; }

      if (!response.ok) {
        // 403 = email not verified
        if (response.status === 403) {
          setAuthError("Please verify your email before logging in. Check your inbox for the verification link.");
        } else {
          setAuthError(
            typeof data === "string"
              ? data
              : data?.message || "Authentication failed."
          );
        }
        return;
      }

      // Registration returns requiresVerification flag — show check-email screen
      if (data.requiresVerification) {
        setPendingVerificationEmail(data.email);
        return;
      }

      const userToken = data.token || data.Token || "";

      const user = {
        id: data.id,
        fullName: data.fullName,
        email: data.email,
        role: data.role,
        organizationId: data.organizationId,
        orgName: data.orgName,
        inviteCode: data.inviteCode,
      };

      localStorage.setItem("rehearsalRoomToken", userToken);
      localStorage.setItem("rehearsalRoomUser", JSON.stringify(user));

      setToken(userToken);
      setCurrentUser(user);
      setShowDashboard(true);
    } catch (error) {
      console.error(error);
      setAuthError("Could not connect to the authentication server.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleLogin = async (credential) => {
    try {
      const res = await fetch(`${API_BASE}/api/Auth/google-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential }),
      });
      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch { data = { message: text }; }

      if (!res.ok) {
        setAuthError(data.message || "Google sign-in failed.");
        return;
      }

      // New user — needs invite code
      if (data.requiresInviteCode) {
        // Store the original JWT credential so we can re-send it with the invite code
        setGooglePendingUser({ credential, email: data.email, fullName: data.fullName });
        setShowAuth(false);
        return;
      }

      // Existing user — log them in
      const userToken = data.token || "";
      const user = {
        id: data.id, fullName: data.fullName, email: data.email,
        role: data.role, organizationId: data.organizationId,
        orgName: data.orgName, inviteCode: data.inviteCode,
      };
      localStorage.setItem("rehearsalRoomToken", userToken);
      localStorage.setItem("rehearsalRoomUser", JSON.stringify(user));
      setToken(userToken);
      setCurrentUser(user);
      setShowAuth(false);
      setShowDashboard(true);
    } catch {
      setAuthError("Could not connect to the server.");
    }
  };

  const logout = () => {
    localStorage.removeItem("rehearsalRoomToken");
    localStorage.removeItem("rehearsalRoomUser");
    setToken(null);
    setCurrentUser(null);
    setAuthMode("login");
    setShowAuth(false);
    setShowDashboard(false);
  };

  // Show waitlist page at /waitlist
  if (window.location.pathname === "/waitlist") {
    return <WaitlistPage />;
  }

  // Show privacy policy at /privacy
  if (window.location.pathname === "/privacy") {
    return <PrivacyPage />;
  }

  // Show terms of service at /terms
  if (window.location.pathname === "/terms") {
    return <TermsPage />;
  }

  // Show email verification at /verify-email
  if (window.location.pathname === "/verify-email") {
    return <VerifyEmailPage />;
  }

  // Show password reset at /reset-password
  if (window.location.pathname === "/reset-password") {
    return <ResetPasswordPage />;
  }

  // Always show the dashboard if the user explicitly navigated there
  if (isLoggedIn && showDashboard) {
    return (
      <div className="min-h-screen bg-slate-950">
        <AdminDashboard currentUser={currentUser} token={token} onLogout={logout} />
      </div>
    );
  }

  // Check-your-email screen after registration
  if (pendingVerificationEmail) {
    return <CheckEmailScreen email={pendingVerificationEmail} onBack={() => { setPendingVerificationEmail(null); setShowAuth(false); }} apiBase={API_BASE} />;
  }

  // Forgot password screen
  if (showForgotPassword) {
    return <ForgotPasswordScreen onBack={() => setShowForgotPassword(false)} apiBase={API_BASE} />;
  }

  // Google sign-in — new user needs to enter invite code
  if (googlePendingUser) {
    return (
      <GoogleInviteScreen
        googleUser={googlePendingUser}
        apiBase={API_BASE}
        onSuccess={(data) => {
          const userToken = data.token || "";
          const user = {
            id: data.id, fullName: data.fullName, email: data.email,
            role: data.role, organizationId: data.organizationId,
            orgName: data.orgName, inviteCode: data.inviteCode,
          };
          localStorage.setItem("rehearsalRoomToken", userToken);
          localStorage.setItem("rehearsalRoomUser", JSON.stringify(user));
          setToken(userToken);
          setCurrentUser(user);
          setGooglePendingUser(null);
          setShowDashboard(true);
        }}
        onBack={() => setGooglePendingUser(null)}
      />
    );
  }

  // Auth screen (login / register)
  if (!isLoggedIn && showAuth) {
    return (
      <AuthScreen
        authMode={authMode}
        setAuthMode={setAuthMode}
        authForm={authForm}
        setAuthForm={setAuthForm}
        authError={authError}
        authLoading={authLoading}
        handleAuthSubmit={handleAuthSubmit}
        onBack={() => setShowAuth(false)}
        onForgotPassword={() => setShowForgotPassword(true)}
        onGoogleLogin={handleGoogleLogin}
      />
    );
  }

  // Landing page — shown to everyone at the root URL
  // Logged-in users see a "Go to Dashboard" button instead of Login/Register
  return (
    <>
      <LandingPage
        isLoggedIn={isLoggedIn}
        onGetStarted={() => { setAuthMode("register"); setShowAuth(true); }}
        onLogin={() => { setAuthMode("login"); setShowAuth(true); }}
        onGoToDashboard={() => setShowDashboard(true)}
      />
      <Analytics />
      <SpeedInsights />
    </>
  );
}


const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

function GoogleButton({ onLogin }) {
  useEffect(() => {
    if (!window.google || !GOOGLE_CLIENT_ID) return;
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (response) => onLogin(response.credential),
    });
    window.google.accounts.id.renderButton(
      document.getElementById("google-signin-btn"),
      { theme: "filled_black", size: "large", width: 340, text: "continue_with" }
    );
  }, [onLogin]);

  return <div id="google-signin-btn" className="flex justify-center mt-1" />;
}

function AuthScreen({
  authMode,
  setAuthMode,
  authForm,
  setAuthForm,
  authError,
  authLoading,
  handleAuthSubmit,
  onBack,
  onForgotPassword,
  onGoogleLogin,
}) {
  const [showDirectorCode, setShowDirectorCode] = useState(false);
  const isLogin = authMode === "login";
  const isDirector = showDirectorCode && authForm.directorCode.trim().length > 0;

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950 px-5 text-white">
      <section className="grid w-full max-w-6xl gap-6 lg:grid-cols-[1fr_0.85fr] lg:items-center">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-7 shadow-2xl backdrop-blur">
          <button
            type="button"
            onClick={onBack}
            className="mb-6 rounded-xl bg-white/10 px-4 py-2 text-sm font-bold text-slate-200 hover:bg-white/15"
          >
            ← Back to Home
          </button>

          <div className="flex items-center gap-4">
            <img
              src={rehearsalLogo}
              alt="Rehearsal Room Logo"
              className="h-16 w-16 rounded-2xl object-cover shadow-lg shadow-amber-900/30"
            />

            <div>
              <p className="text-sm font-black uppercase tracking-[0.35em] text-amber-300">
                Rehearsal Room
              </p>
              <h1 className="mt-2 text-4xl font-black">
                Worship team management made simple.
              </h1>
            </div>
          </div>

          <p className="mt-6 max-w-2xl text-lg text-slate-300">
            Manage your song library, rehearsals, setlists, attendance, members,
            and role-based access from one modern dashboard.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <FeatureCard title="Songs" text="Organize keys, notes, videos, and setlists." />
            <FeatureCard title="Rehearsals" text="Plan dates, locations, songs, and notes." />
            <FeatureCard title="Attendance" text="Track confirmations with live status." />
          </div>
        </div>

        <form
          onSubmit={handleAuthSubmit}
          className="rounded-3xl border border-white/10 bg-slate-950/80 p-6 shadow-2xl backdrop-blur"
        >
          <p className="text-xs font-black uppercase tracking-[0.3em] text-amber-300">
            {isLogin ? "Secure Login" : "Create Account"}
          </p>

          <h2 className="mt-3 text-3xl font-black">
            {isLogin ? "Welcome Back" : "Register User"}
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            {isLogin
              ? "Sign in with your Rehearsal Room account."
              : "Create an account to join or start a worship team."}
          </p>

          {authError && (
            <div className="mt-5 rounded-2xl bg-red-500/20 px-4 py-3 text-sm font-bold text-red-200">
              {authError}
            </div>
          )}

          <div className="mt-6 space-y-4">
            {!isLogin && (
              <AuthInput
                label="Full Name"
                value={authForm.fullName}
                onChange={(value) =>
                  setAuthForm((prev) => ({ ...prev, fullName: value }))
                }
                placeholder="Your full name"
              />
            )}

            <AuthInput
              label="Email"
              type="email"
              value={authForm.email}
              onChange={(value) =>
                setAuthForm((prev) => ({ ...prev, email: value }))
              }
              placeholder="you@church.com"
            />

            <AuthInput
              label="Password"
              type="password"
              value={authForm.password}
              onChange={(value) =>
                setAuthForm((prev) => ({ ...prev, password: value }))
              }
              placeholder="Password123!"
            />

            {isLogin && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={onForgotPassword}
                  className="text-sm font-bold text-slate-500 hover:text-amber-400 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {!isLogin && (
              <>
                {/* Director toggle */}
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowDirectorCode((v) => !v);
                      // Clear both codes when toggling
                      setAuthForm((prev) => ({ ...prev, directorCode: "", orgName: "", inviteCode: "" }));
                    }}
                    className="text-sm font-bold text-slate-400 hover:text-amber-300 transition-colors"
                  >
                    {showDirectorCode ? "▼" : "▶"} I'm a Music Director
                  </button>

                  {showDirectorCode ? (
                    <div className="mt-3 space-y-3">
                      <AuthInput
                        label="Director Code"
                        value={authForm.directorCode}
                        onChange={(value) =>
                          setAuthForm((prev) => ({ ...prev, directorCode: value }))
                        }
                        placeholder="Enter your director code"
                      />
                      <AuthInput
                        label="Church / Organization Name"
                        value={authForm.orgName}
                        onChange={(value) =>
                          setAuthForm((prev) => ({ ...prev, orgName: value }))
                        }
                        placeholder="e.g. Grace Community Church"
                      />
                      <p className="text-xs text-slate-500">
                        This creates a private workspace for your team. You'll receive an invite code to share with members.
                      </p>
                    </div>
                  ) : (
                    /* Team member — needs invite code */
                    <div className="mt-3">
                      <AuthInput
                        label="Team Invite Code"
                        value={authForm.inviteCode}
                        onChange={(value) =>
                          setAuthForm((prev) => ({ ...prev, inviteCode: value.toUpperCase() }))
                        }
                        placeholder="e.g. ABCD1234"
                      />
                      <p className="mt-2 text-xs text-slate-500">
                        Get this code from your Music Director to join your team's workspace.
                      </p>
                      <div className="mt-3 rounded-xl border border-amber-400/20 bg-amber-400/5 px-4 py-3">
                        <p className="text-xs font-bold text-amber-300">Director not set up yet?</p>
                        <p className="text-xs text-slate-400 mt-1">
                          Your Music Director needs to register first. Ask them to{" "}
                          <a href="/waitlist" className="text-amber-400 hover:underline font-bold">join the waitlist</a>
                          {" "}— once approved, they'll get a code to set up your team.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className="w-full rounded-2xl bg-amber-400 px-5 py-3 font-black text-slate-950 transition-all hover:scale-[1.02] disabled:opacity-60"
            >
              {authLoading ? "Please wait..." : isLogin ? "Login" : "Register"}
            </button>

            {/* Google Sign-In — for team members only */}
            {(isLogin || !isDirector) && (
              <>
                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-white/10" />
                  <span className="text-xs text-slate-500 font-bold">or</span>
                  <div className="h-px flex-1 bg-white/10" />
                </div>
                <GoogleButton onLogin={onGoogleLogin} />
                {!isLogin && (
                  <p className="text-center text-xs text-slate-500">
                    Google sign-in is for team members joining an existing org.
                  </p>
                )}
              </>
            )}

            <button
              type="button"
              onClick={() => {
                setAuthMode(isLogin ? "register" : "login");
              }}
              className="w-full rounded-2xl bg-white/10 px-5 py-3 font-bold text-slate-200 hover:bg-white/15"
            >
              {isLogin
                ? "Need an account? Register"
                : "Already have an account? Login"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

function AuthInput({ label, value, onChange, placeholder, type = "text" }) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (show ? "text" : "password") : type;

  return (
    <label>
      <span className="text-sm font-bold text-slate-200">{label}</span>
      <div className="relative mt-2">
        <input
          type={inputType}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 pr-12 text-white outline-none placeholder:text-slate-500 focus:border-amber-400"
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-300 transition-colors"
            tabIndex={-1}
            aria-label={show ? "Hide password" : "Show password"}
          >
            {show ? (
              // Eye-off icon
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            ) : (
              // Eye icon
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            )}
          </button>
        )}
      </div>
    </label>
  );
}

function GoogleInviteScreen({ googleUser, apiBase, onSuccess, onBack }) {
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${apiBase}/api/Auth/google-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: googleUser.credential, inviteCode: inviteCode.trim().toUpperCase() }),
      });
      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch { data = { message: text }; }

      if (res.ok && !data.requiresInviteCode) {
        onSuccess(data);
      } else {
        setError(data.message || "Invalid invite code. Check with your Music Director.");
      }
    } catch {
      setError("Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950 px-5 text-white">
      <div className="w-full max-w-md">
        <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-7 shadow-2xl backdrop-blur">
          <button onClick={onBack} className="mb-6 rounded-xl bg-white/10 px-4 py-2 text-sm font-bold text-slate-200 hover:bg-white/15 transition-colors">
            ← Back
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-400/10">
              <svg className="h-5 w-5 text-emerald-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <div>
              <p className="font-black text-white">Signed in as {googleUser.fullName}</p>
              <p className="text-xs text-slate-400">{googleUser.email}</p>
            </div>
          </div>

          <p className="text-xs font-black uppercase tracking-[0.3em] text-amber-300">One more step</p>
          <h2 className="mt-2 text-2xl font-black">Enter your team invite code</h2>
          <p className="mt-2 text-sm text-slate-400">
            Ask your Music Director for your team's invite code to join their workspace.
          </p>

          {error && (
            <div className="mt-4 rounded-2xl bg-red-500/20 px-4 py-3 text-sm font-bold text-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <label>
              <span className="text-sm font-bold text-slate-200">Team Invite Code</span>
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                placeholder="e.g. ABCD1234"
                required
                className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-amber-400 font-mono tracking-widest"
              />
            </label>
            <div className="rounded-xl border border-amber-400/20 bg-amber-400/5 px-4 py-3">
              <p className="text-xs font-bold text-amber-300">Director not set up yet?</p>
              <p className="text-xs text-slate-400 mt-1">
                Ask them to <a href="/waitlist" className="text-amber-400 hover:underline font-bold">join the waitlist</a> — once approved they'll set up your team.
              </p>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-amber-400 px-5 py-3 font-black text-slate-950 transition hover:scale-[1.02] disabled:opacity-60"
            >
              {loading ? "Joining…" : "Join Team →"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

function ForgotPasswordScreen({ onBack, apiBase }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | sent | error
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");

    try {
      const res = await fetch(`${apiBase}/api/Auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch { data = { message: text }; }

      if (res.ok) {
        setStatus("sent");
        setMessage(data.message || "Check your email for a reset link.");
      } else {
        setStatus("error");
        setMessage(data.message || "Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setMessage("Could not connect to the server. Please try again.");
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950 px-5 text-white">
      <div className="w-full max-w-md">
        <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-7 shadow-2xl backdrop-blur">
          <button
            type="button"
            onClick={onBack}
            className="mb-6 rounded-xl bg-white/10 px-4 py-2 text-sm font-bold text-slate-200 hover:bg-white/15 transition-colors"
          >
            ← Back to Login
          </button>

          {status === "sent" ? (
            <div className="text-center py-4">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-amber-400/10">
                <svg className="h-7 w-7 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-black">Check your email</h2>
              <p className="mt-3 text-slate-400">{message}</p>
              <p className="mt-2 text-sm text-slate-500">The link expires in 1 hour.</p>
              <button
                onClick={onBack}
                className="mt-6 w-full rounded-2xl bg-white/10 px-5 py-3 font-bold text-slate-200 hover:bg-white/15 transition-colors"
              >
                ← Back to Login
              </button>
            </div>
          ) : (
            <>
              <p className="text-xs font-black uppercase tracking-[0.3em] text-amber-300">Account Recovery</p>
              <h2 className="mt-3 text-3xl font-black">Forgot password?</h2>
              <p className="mt-2 text-sm text-slate-400">
                Enter your email and we'll send you a link to reset your password.
              </p>

              {status === "error" && (
                <div className="mt-5 rounded-2xl bg-red-500/20 px-4 py-3 text-sm font-bold text-red-200">
                  {message}
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <label>
                  <span className="text-sm font-bold text-slate-200">Email address</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@church.com"
                    required
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-amber-400"
                  />
                </label>
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full rounded-2xl bg-amber-400 px-5 py-3 font-black text-slate-950 transition hover:scale-[1.02] disabled:opacity-60"
                >
                  {status === "loading" ? "Sending…" : "Send Reset Link"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

function CheckEmailScreen({ email, onBack, apiBase }) {
  const [resent, setResent] = useState(false);
  const [resending, setResending] = useState(false);

  const handleResend = async () => {
    setResending(true);
    try {
      await fetch(`${apiBase}/api/Auth/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setResent(true);
    } catch {
      // silent
    } finally {
      setResending(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950 px-5 text-white">
      <div className="w-full max-w-md text-center">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-amber-400/10">
            <svg className="h-8 w-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>

          <p className="text-xs font-black uppercase tracking-[0.3em] text-amber-300">Almost there</p>
          <h1 className="mt-3 text-3xl font-black">Check your email</h1>
          <p className="mt-3 text-slate-400">
            We sent a verification link to{" "}
            <span className="font-bold text-white">{email}</span>.
            Click the link in that email to activate your account.
          </p>

          <div className="mt-6 rounded-2xl bg-white/5 border border-white/10 px-5 py-4 text-sm text-slate-400">
            <p>Didn't get it? Check your spam folder, or</p>
            {resent ? (
              <p className="mt-2 font-bold text-emerald-300">✓ New link sent!</p>
            ) : (
              <button
                onClick={handleResend}
                disabled={resending}
                className="mt-2 font-bold text-amber-400 hover:text-amber-300 transition-colors disabled:opacity-50"
              >
                {resending ? "Sending…" : "resend the verification email"}
              </button>
            )}
          </div>

          <button
            onClick={onBack}
            className="mt-5 w-full rounded-2xl bg-white/10 px-5 py-3 font-bold text-slate-200 hover:bg-white/15 transition-colors"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </main>
  );
}

function FeatureCard({ title, text }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="font-black text-amber-300">{title}</p>
      <p className="mt-2 text-sm text-slate-400">{text}</p>
    </div>
  );
}
