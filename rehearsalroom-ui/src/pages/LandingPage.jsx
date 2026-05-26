import { motion } from "framer-motion";
import logo from "../assets/rehearsalroom-logo.png";
import songLibraryImg from "../assets/song-library.png";
import {
  Music,
  CalendarDays,
  Users,
  ClipboardCheck,
  Lightbulb,
  ShieldCheck,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay },
  }),
};

export default function LandingPage({ onGetStarted, onLogin, onGoToDashboard, isLoggedIn }) {
  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* ── Nav ──────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-slate-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <img src={logo} alt="Rehearsal Room" className="h-8 w-8 rounded-xl object-cover sm:h-9 sm:w-9" />
            <span className="hidden text-sm font-black uppercase tracking-[0.3em] text-amber-300 sm:block">
              Rehearsal Room
            </span>
            <span className="text-sm font-black uppercase tracking-[0.2em] text-amber-300 sm:hidden">
              RR
            </span>
          </div>

          <div className="hidden items-center gap-8 text-sm font-medium text-slate-400 md:flex">
            <a href="#features" className="transition hover:text-white">Features</a>
            <a href="#how-it-works" className="transition hover:text-white">How It Works</a>
            <a href="#screenshot" className="transition hover:text-white">Preview</a>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {isLoggedIn ? (
              <button
                onClick={onGoToDashboard}
                className="rounded-xl bg-amber-400 px-3 py-2 text-sm font-bold text-slate-950 transition hover:bg-amber-300 sm:px-4"
              >
                Go to Dashboard →
              </button>
            ) : (
              <>
                <button
                  onClick={onLogin}
                  className="rounded-xl px-3 py-2 text-sm font-bold text-slate-600 transition hover:text-slate-400 sm:px-4"
                >
                  Login
                </button>
                <a
                  href="/waitlist"
                  className="rounded-xl bg-amber-400 px-3 py-2 text-sm font-bold text-slate-950 transition hover:bg-amber-300 sm:px-4"
                >
                  Join Waitlist
                </a>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-4 pt-14 pb-10 text-center sm:px-6 sm:pt-20 md:pt-24 md:pb-16">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
          <span className="inline-block rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.25em] text-amber-300 sm:tracking-[0.3em]">
            Built for worship teams
          </span>
        </motion.div>

        <motion.h1
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={0.1}
          className="mx-auto mt-5 max-w-4xl text-4xl font-black leading-tight tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
        >
          Run rehearsals with{" "}
          <span className="text-amber-400">clarity</span> and{" "}
          <span className="text-amber-400">confidence.</span>
        </motion.h1>

        <motion.p
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={0.2}
          className="mx-auto mt-5 max-w-2xl text-base text-slate-400 sm:text-lg"
        >
          Rehearsal Room is the all-in-one platform for music ministries — manage
          songs, rehearsals, setlists, attendance, and your whole team from one
          clean dashboard.
        </motion.p>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={0.3}
          className="mt-7 flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
        >
          <a
            href="/waitlist"
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-400 px-7 py-3.5 font-black text-slate-950 shadow-xl shadow-amber-400/20 transition hover:bg-amber-300 sm:w-auto"
          >
            Join the Waitlist
            <ArrowRight size={18} />
          </a>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={0.4}
          className="mt-5 flex flex-wrap items-center justify-center gap-4 text-sm text-slate-500"
        >
          {["Free to join", "Be the first to know", "Built for worship teams"].map((t) => (
            <span key={t} className="flex items-center gap-1.5">
              <CheckCircle size={14} className="text-amber-400" />
              {t}
            </span>
          ))}
        </motion.div>
      </section>

      {/* ── Hero UI mockup ────────────────────────────────────────────────── */}
      <motion.section
        id="screenshot"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 sm:pb-24"
      >
        <div className="overflow-hidden rounded-2xl border border-white/10 shadow-2xl shadow-black/60 sm:rounded-3xl">
          <div className="flex items-center gap-2 border-b border-white/10 bg-slate-900 px-4 py-2.5 sm:px-5 sm:py-3">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500/70 sm:h-3 sm:w-3" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70 sm:h-3 sm:w-3" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/70 sm:h-3 sm:w-3" />
            <span className="ml-2 text-[10px] text-slate-500 sm:ml-3 sm:text-xs">rehearsalroom.app — Dashboard</span>
          </div>
          <div className="flex bg-slate-950">
            {/* Sidebar — hidden on mobile, visible sm+ */}
            <div className="hidden w-44 shrink-0 border-r border-white/5 p-4 sm:block">
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-amber-300">Rehearsal Room</p>
              <div className="mt-5 space-y-1.5">
                {["Dashboard", "Song Library", "Rehearsals", "Attendance", "Members"].map((item, i) => (
                  <div key={item} className={`rounded-xl px-3 py-2 text-xs font-bold ${i === 0 ? "bg-amber-400 text-slate-950" : "text-slate-400"}`}>
                    {item}
                  </div>
                ))}
              </div>
            </div>
            {/* Main content */}
            <div className="flex-1 p-4 sm:p-5">
              <p className="text-[9px] font-bold uppercase tracking-widest text-amber-300 sm:text-[10px]">Admin Dashboard</p>
              <h3 className="mt-1 text-base font-black text-white sm:text-lg">Dashboard</h3>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:mt-4 sm:gap-3 md:grid-cols-4">
                {[["12", "Songs"], ["4", "Rehearsals"], ["8", "Suggestions"], ["3", "Pending"]].map(([val, label]) => (
                  <div key={label} className="rounded-xl border border-white/10 bg-white/5 p-2.5 sm:rounded-2xl sm:p-3">
                    <p className="text-xl font-black text-white sm:text-2xl">{val}</p>
                    <p className="mt-0.5 text-[10px] text-slate-400 sm:mt-1 sm:text-xs">{label}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 grid gap-2 sm:mt-4 sm:grid-cols-2 sm:gap-3">
                <div className="rounded-xl border border-white/10 bg-white/5 p-3 sm:rounded-2xl sm:p-4">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-amber-300 sm:text-xs">Upcoming Rehearsal</p>
                  <p className="mt-1.5 text-sm font-black text-white sm:mt-2 sm:font-black">Sunday Morning Worship</p>
                  <p className="mt-0.5 text-[10px] text-slate-400 sm:text-xs">Main Sanctuary · 7:00 PM</p>
                  <div className="mt-2 space-y-1 sm:mt-3 sm:space-y-1.5">
                    {["Goodness of God", "Way Maker", "Firm Foundation"].map((s) => (
                      <div key={s} className="rounded-lg bg-slate-900 px-2.5 py-1.5 text-[10px] font-bold text-slate-200 sm:rounded-xl sm:px-3 sm:py-2 sm:text-xs">{s}</div>
                    ))}
                  </div>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-3 sm:rounded-2xl sm:p-4">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-amber-300 sm:text-xs">Team Attendance</p>
                  <div className="mt-2 grid grid-cols-3 gap-1.5 sm:mt-3 sm:gap-2">
                    <div className="rounded-lg bg-emerald-500/10 p-1.5 text-center sm:rounded-xl sm:p-2">
                      <p className="text-lg font-black text-emerald-300 sm:text-xl">5</p>
                      <p className="text-[9px] text-emerald-200 sm:text-[10px]">Confirmed</p>
                    </div>
                    <div className="rounded-lg bg-amber-400/10 p-1.5 text-center sm:rounded-xl sm:p-2">
                      <p className="text-lg font-black text-amber-300 sm:text-xl">2</p>
                      <p className="text-[9px] text-amber-200 sm:text-[10px]">Pending</p>
                    </div>
                    <div className="rounded-lg bg-red-500/10 p-1.5 text-center sm:rounded-xl sm:p-2">
                      <p className="text-lg font-black text-red-300 sm:text-xl">1</p>
                      <p className="text-[9px] text-red-200 sm:text-[10px]">Declined</p>
                    </div>
                  </div>
                  <div className="mt-2 h-1.5 rounded-full bg-slate-800 sm:mt-3 sm:h-2">
                    <div className="h-full w-[62%] rounded-full bg-emerald-400" />
                  </div>
                  <p className="mt-1.5 text-[10px] text-slate-400 sm:mt-2 sm:text-xs">62% of the team has confirmed.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ── Social proof strip ────────────────────────────────────────────── */}
      <section className="border-y border-white/5 bg-white/[0.02] py-8 sm:py-10">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-6 px-6 sm:flex sm:flex-wrap sm:items-center sm:justify-center sm:gap-10">
          {[
            ["Song Library", "Organize your full catalog"],
            ["Rehearsal Plans", "Build setlists in minutes"],
            ["Team Attendance", "Know who's showing up"],
            ["Role Permissions", "Admin & member access"],
          ].map(([title, sub]) => (
            <div key={title} className="text-center">
              <p className="text-base font-black text-amber-300 sm:text-lg">{title}</p>
              <p className="mt-1 text-xs text-slate-500 sm:text-sm">{sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section id="features" className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-20 md:py-24">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-300">Everything you need</p>
          <h2 className="mt-3 text-3xl font-black sm:text-4xl md:text-5xl">One platform. Every role.</h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-slate-400 sm:text-base">
            From the choir director to the newest member — Rehearsal Room gives everyone the right tools for their role.
          </p>
        </motion.div>

        <div className="mt-10 grid gap-4 sm:mt-14 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: Music, title: "Song Library", desc: "Store every song with keys, tempo, categories, YouTube links, and performance notes. Filter and search in seconds.", color: "text-amber-400", bg: "bg-amber-400/10" },
            { icon: CalendarDays, title: "Rehearsal Planning", desc: "Create rehearsals, pick songs from your live library, set dates, times, and locations — all in one place.", color: "text-blue-400", bg: "bg-blue-400/10" },
            { icon: ClipboardCheck, title: "Attendance Tracking", desc: "See who's confirmed, pending, or declined for each rehearsal. Live status that saves to the database.", color: "text-emerald-400", bg: "bg-emerald-400/10" },
            { icon: Users, title: "Team Management", desc: "Invite members, assign roles, and manage your worship team from a clean member directory.", color: "text-purple-400", bg: "bg-purple-400/10" },
            { icon: Lightbulb, title: "Song Suggestions", desc: "Members suggest songs for review. Admins approve, reject, or add them straight to the library.", color: "text-pink-400", bg: "bg-pink-400/10" },
            { icon: ShieldCheck, title: "Role Permissions", desc: "Admin, Musician, and Choir Member roles — each with the right access and nothing more.", color: "text-amber-400", bg: "bg-amber-400/10" },
          ].map(({ icon: Icon, title, desc, color, bg }, i) => (
            <motion.div
              key={title}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={i * 0.07}
              className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-xl transition-all hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.08] sm:rounded-3xl sm:p-6"
            >
              <div className={`inline-flex rounded-xl p-2.5 sm:rounded-2xl sm:p-3 ${bg}`}>
                <Icon size={22} className={color} />
              </div>
              <h3 className="mt-4 text-lg font-black sm:mt-5 sm:text-xl">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Song Library screenshot ───────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 sm:pb-24">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="grid gap-8 sm:gap-10 lg:grid-cols-2 lg:items-center"
        >
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-300">Song Library</p>
            <h2 className="mt-3 text-3xl font-black leading-tight sm:text-4xl md:text-5xl">
              Your entire catalog, always organized.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-400 sm:mt-5 sm:text-base">
              Add songs with keys, tempo, category, and YouTube links. Search and
              filter instantly. Build setlists directly from your library when
              planning a rehearsal.
            </p>
            <ul className="mt-5 space-y-2.5 sm:mt-6 sm:space-y-3">
              {[
                "Search by title, artist, key, or category",
                "YouTube links for every song",
                "Filter by key or genre",
                "Add songs straight from member suggestions",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-slate-300">
                  <CheckCircle size={15} className="mt-0.5 shrink-0 text-amber-400" />
                  {item}
                </li>
              ))}
            </ul>
            <button
              onClick={onGetStarted}
              className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-400 px-6 py-3.5 font-black text-slate-950 transition hover:bg-amber-300 sm:w-auto sm:mt-8"
            >
              Try it free <ArrowRight size={16} />
            </button>
          </div>

          <div className="overflow-hidden rounded-2xl border border-white/10 shadow-2xl shadow-black/50 sm:rounded-3xl">
            <div className="flex items-center gap-2 border-b border-white/10 bg-slate-900 px-4 py-2.5 sm:px-5 sm:py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
              <span className="ml-2 text-xs text-slate-500">Song Library</span>
            </div>
            <img src={songLibraryImg} alt="Song Library" className="w-full object-cover" />
          </div>
        </motion.div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section id="how-it-works" className="border-t border-white/5 bg-white/[0.02] py-12 sm:py-20 md:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-300">Simple setup</p>
            <h2 className="mt-3 text-3xl font-black sm:text-4xl md:text-5xl">Up and running in minutes.</h2>
          </motion.div>

          <div className="mt-10 grid gap-8 sm:mt-14 md:grid-cols-3">
            {[
              { step: "01", title: "Create your account", desc: "Register as an Admin and set up your worship team profile in under a minute." },
              { step: "02", title: "Build your song library", desc: "Add songs with keys, YouTube links, and notes. Your team can suggest new songs too." },
              { step: "03", title: "Plan rehearsals", desc: "Create a rehearsal, pick your setlist from the library, and track attendance live." },
            ].map(({ step, title, desc }, i) => (
              <motion.div
                key={step}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i * 0.1}
              >
                <p className="text-5xl font-black text-amber-400/20 sm:text-6xl">{step}</p>
                <h3 className="mt-2 text-lg font-black sm:mt-3 sm:text-xl">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400 sm:mt-3">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Waitlist Banner ──────────────────────────────────────────────── */}
      <section className="mx-auto max-w-4xl px-4 pb-8 sm:px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="rounded-2xl border border-white/10 bg-white/5 p-6 flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-amber-400 mb-1">Want early access?</p>
            <p className="font-bold text-white">Join the waitlist and be first to know when we launch new features.</p>
          </div>
          <a
            href="/waitlist"
            className="shrink-0 inline-flex items-center gap-2 rounded-2xl bg-amber-400 px-6 py-3 font-black text-slate-950 hover:bg-amber-300 transition-colors"
          >
            Join Waitlist <ArrowRight size={16} />
          </a>
        </motion.div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 sm:py-24">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="rounded-2xl border border-amber-400/20 bg-gradient-to-br from-amber-400/10 to-slate-900 p-8 shadow-2xl sm:rounded-3xl sm:p-12"
        >
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-300">Ready to get organized?</p>
          <h2 className="mt-4 text-3xl font-black sm:text-4xl md:text-5xl">
            Your worship team deserves better tools.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm text-slate-400 sm:text-base">
            Join worship leaders already using Rehearsal Room to run smoother,
            more prepared rehearsals every week.
          </p>
          <a
            href="/waitlist"
            className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-400 px-8 py-4 text-base font-black text-slate-950 shadow-xl shadow-amber-400/20 transition hover:bg-amber-300 sm:mt-8 sm:w-auto sm:text-lg"
          >
            Join the Waitlist
            <ArrowRight size={20} />
          </a>
        </motion.div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-8 sm:py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 sm:flex-row sm:gap-4">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Rehearsal Room" className="h-8 w-8 rounded-xl object-cover" />
            <span className="text-sm font-black uppercase tracking-[0.3em] text-amber-300">Rehearsal Room</span>
          </div>
          <p className="text-sm text-slate-600">
            © {new Date().getFullYear()} Rehearsal Room. Built for worship teams.
          </p>
        </div>
      </footer>

    </div>
  );
}
