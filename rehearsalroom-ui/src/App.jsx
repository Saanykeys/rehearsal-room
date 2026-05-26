import { useState } from "react";
import rehearsalLogo from "./assets/rehearsalroom-logo.png";
import AdminDashboard from "./components/AdminDashboard";
import LandingPage from "./pages/LandingPage";
import WaitlistPage from "./pages/WaitlistPage";
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";
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
        setAuthError(
          typeof data === "string"
            ? data
            : data?.message || "Authentication failed."
        );
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
        inviteCode: data.inviteCode, // Only populated for Music Directors
      };

      localStorage.setItem("rehearsalRoomToken", userToken);
      localStorage.setItem("rehearsalRoomUser", JSON.stringify(user));

      setToken(userToken);
      setCurrentUser(user);
      setShowDashboard(true); // go straight to dashboard after login/register
    } catch (error) {
      console.error(error);
      setAuthError("Could not connect to the authentication server.");
    } finally {
      setAuthLoading(false);
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

  // Always show the dashboard if the user explicitly navigated there
  if (isLoggedIn && showDashboard) {
    return (
      <div className="min-h-screen bg-slate-950">
        <AdminDashboard currentUser={currentUser} token={token} onLogout={logout} />
      </div>
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


function AuthScreen({
  authMode,
  setAuthMode,
  authForm,
  setAuthForm,
  authError,
  authLoading,
  handleAuthSubmit,
  onBack,
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

function FeatureCard({ title, text }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="font-black text-amber-300">{title}</p>
      <p className="mt-2 text-sm text-slate-400">{text}</p>
    </div>
  );
}
