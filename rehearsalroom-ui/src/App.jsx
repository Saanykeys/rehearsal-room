import { useState } from "react";
import rehearsalLogo from "./assets/rehearsalroom-logo.png";
import AdminDashboard from "./components/AdminDashboard";
import LandingPage from "./pages/LandingPage";

const API_BASE = import.meta.env.VITE_API_BASE;

export default function App() {
  const [showAuth, setShowAuth] = useState(false);

  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem("rehearsalRoomUser");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem("rehearsalRoomToken");
  });

  const [authMode, setAuthMode] = useState("login");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const [authForm, setAuthForm] = useState({
    fullName: "",
    email: "admin@rehearsalroom.com",
    password: "Password123!",
    role: "Admin",
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
            role: authForm.role,
          };

    try {
      const response = await fetch(`${API_BASE}/api/Auth/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setAuthError(
          typeof data === "string"
            ? data
            : data.message || "Authentication failed."
        );
        return;
      }

      const userToken = data.token || data.Token || "";

      const user = {
        id: data.id,
        fullName: data.fullName,
        email: data.email,
        role: data.role,
      };

      localStorage.setItem("rehearsalRoomToken", userToken);
      localStorage.setItem("rehearsalRoomUser", JSON.stringify(user));

      setToken(userToken);
      setCurrentUser(user);
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
  };

  if (!isLoggedIn && !showAuth) {
    return (
      <LandingPage
        onGetStarted={() => { setAuthMode("register"); setShowAuth(true); }}
        onLogin={() => { setAuthMode("login"); setShowAuth(true); }}
      />
    );
  }

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
const getSongsForRehearsal = (rehearsal) => {
  if (!rehearsal?.songIds || rehearsal.songIds.length === 0) {
    return [];
  }

  return songs.filter((song) => rehearsal.songIds.includes(song.id));
};
  return (
    <div className="min-h-screen bg-slate-950">
      <div className="fixed right-5 top-5 z-[60] flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white shadow-xl backdrop-blur">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-black">{currentUser.fullName}</p>
          <p className="text-xs text-slate-400">{currentUser.role}</p>
        </div>

        <button
          onClick={logout}
          className="rounded-xl bg-red-500/20 px-4 py-2 text-sm font-black text-red-200 hover:bg-red-500/30"
        >
          Logout
        </button>
      </div>

      <AdminDashboard currentUser={currentUser} token={token} onLogout={logout} />
    </div>
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
  const isLogin = authMode === "login";

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
              : "Create an account with a role."}
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
                placeholder="Rahsaan Hall"
              />
            )}

            <AuthInput
              label="Email"
              type="email"
              value={authForm.email}
              onChange={(value) =>
                setAuthForm((prev) => ({ ...prev, email: value }))
              }
              placeholder="admin@rehearsalroom.com"
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
              <label>
                <span className="text-sm font-bold text-slate-200">Role</span>
                <select
                  value={authForm.role}
                  onChange={(event) =>
                    setAuthForm((prev) => ({
                      ...prev,
                      role: event.target.value,
                    }))
                  }
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-amber-400"
                >
                  <option>Admin</option>
                  <option>Musician</option>
                  <option>Choir Member</option>
                </select>
              </label>
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
  return (
    <label>
      <span className="text-sm font-bold text-slate-200">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-amber-400"
      />
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