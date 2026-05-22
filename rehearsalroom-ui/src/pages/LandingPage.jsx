import songLibraryImage from "../assets/song-library.png";
import { motion } from "framer-motion";

export default function LandingPage() {
  return (
    
     
      <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">

    <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-400 font-bold text-slate-950">
          RR
        </div>

        <span className="text-lg font-semibold tracking-wide text-white">
          Rehearsal Room
        </span>
      </div>

      <div className="hidden items-center gap-8 text-sm font-medium text-slate-300 md:flex">
        <a href="#features" className="hover:text-white">
          Features
        </a>

        <a href="#how-it-works" className="hover:text-white">
          How It Works
        </a>

        <a href="#pricing" className="hover:text-white">
          Pricing
        </a>
      </div>

      <div className="flex items-center gap-3">
        <button className="hidden rounded-xl px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white md:block">
          Login
        </button>

        <button className="rounded-xl bg-amber-400 px-4 py-2 text-sm font-bold text-slate-950 hover:bg-amber-300">
          Sign Up
        </button>
      </div>
    </nav>
      <section className="mx-auto max-w-6xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-amber-300">
          Rehearsal Room
        </p>

        <h1 className="mx-auto mt-6 max-w-5xl text-5xl font-semibold leading-tight tracking-tight text-white md:text-7xl">
          Organize your worship team in one place.
        </h1>

        <p className="mx-auto mt-6 max-w-3xl text-lg text-slate-300">
          Manage songs, rehearsals, setlists, attendance, YouTube references,
          and rehearsal audio in one modern platform built for music ministries.
        </p>

        <motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.7, delay: 0.3 }}
  className="mt-8 flex justify-center gap-4"
>
          <button className="rounded-2xl bg-amber-400 px-6 py-3 font-bold text-slate-950">
            Start Free
          </button>

          <button className="rounded-2xl border border-white/10 px-6 py-3 font-bold text-slate-200">
            Watch Demo
          </button>
       </motion.div>
        









      </section>

      <section className="mx-auto mt-16 grid max-w-6xl gap-6 md:grid-cols-3">
        {[
          ["🎵", "Song Library", "Manage songs with keys, formats, YouTube links, and rehearsal audio."],
          ["📅", "Rehearsal Scheduling", "Create rehearsals, organize setlists, and prepare your team."],
          ["🎧", "Audio Playback", "Upload iPhone rehearsal recordings so members can practice anywhere."],
          ["✅", "Attendance Tracking", "Track who is attending rehearsal and keep leaders informed."],
          ["📱", "Mobile Friendly", "Designed for desktop and mobile so teams can access it on the go."],
          ["🔐", "Role Management", "Admins manage content while members view songs and mark attendance."],
        ].map(([icon, title, text]) => (
   <motion.div
  key={title}
  initial={{ opacity: 0, y: 40 }}
  whileInView={{
    opacity: 1,
    y: title === "Rehearsal Scheduling" ? 30 : 0,
  }}
  viewport={{ once: true, amount: 0.2 }}
  transition={{ duration: 0.6 }}
  className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur transition-all duration-300 hover:-translate-y-3 hover:border-amber-300/40 hover:bg-white/10"
>
            
          
            <div className="text-5xl">{icon}</div>

            <h3 className="mt-5 text-2xl font-bold">
              {title}
            </h3>

            <p className="mt-3 text-slate-300">
              {text}
            </p>

            <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
  <img
    src={songLibraryImage}
    alt="Song Library Preview"
    className="h-40 w-full object-cover object-top"
  />
</div>
         </motion.div>
        ))}
      </section>
    </main>
  );
}