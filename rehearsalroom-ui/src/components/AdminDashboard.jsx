import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const [songSuggestions, setSongSuggestions] = useState([]);

  const loadSongSuggestions = async () => {
    const response = await fetch("http://localhost:5281/api/SongSuggestions");
    const data = await response.json();
    setSongSuggestions(data);
  };

  useEffect(() => {
    loadSongSuggestions();
  }, []);

  const approveSuggestion = async (id) => {
    await fetch(`http://localhost:5281/api/SongSuggestions/${id}/approve`, {
      method: "PUT",
    });
    loadSongSuggestions();
  };

  const rejectSuggestion = async (id) => {
    await fetch(`http://localhost:5281/api/SongSuggestions/${id}/reject`, {
      method: "PUT",
    });
    loadSongSuggestions();
  };

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-8 text-white">
      <section className="mx-auto max-w-6xl">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-300">
          Rehearsal Room Admin
        </p>

        <h1 className="mt-4 text-4xl font-bold">Choir Director Dashboard</h1>

        <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl">
          <h2 className="text-2xl font-bold">Song Suggestions</h2>

          <p className="mt-3 text-slate-300">
            Loaded suggestions: {songSuggestions.length}
          </p>

          <div className="mt-6 space-y-5">
            {songSuggestions.map((song) => (
              <div key={song.id} className="rounded-2xl bg-slate-900 p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold">{song.title}</h3>
                    <p className="mt-1 text-sm text-slate-400">
                      Artist: {song.artist}
                    </p>
                    <p className="mt-1 text-sm text-slate-400">
                      Suggested by {song.suggestedBy}
                    </p>
                    <p className="mt-4 text-slate-300">“{song.reason}”</p>
                  </div>

                  <span className="rounded-full bg-amber-400/20 px-3 py-1 text-xs font-bold text-amber-300">
                    {song.status}
                  </span>
                </div>

                {song.status === "Pending" && (
                  <div className="mt-5 flex gap-3">
                    <button
                      onClick={() => approveSuggestion(song.id)}
                      className="rounded-xl bg-emerald-500 px-4 py-2 font-bold text-slate-950"
                    >
                      Approve
                    </button>

                    <button
                      onClick={() => rejectSuggestion(song.id)}
                      className="rounded-xl bg-red-500 px-4 py-2 font-bold text-white"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}