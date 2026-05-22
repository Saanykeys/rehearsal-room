import { useState } from "react";

export default function MemberDashboard() {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [showSuggestForm, setShowSuggestForm] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      message: "Pastor Elaine confirmed attendance.",
      time: "5 min ago",
      unread: true,
    },
    {
      id: 2,
      message: "Holy Forever was approved for discussion.",
      time: "20 min ago",
      unread: true,
    },
    {
      id: 3,
      message: "New rehearsal notes were added.",
      time: "1 hr ago",
      unread: false,
    },
  ]);

  const [suggestions, setSuggestions] = useState([
    {
      title: "Holy Forever",
      artist: "",
      youtubeLink: "",
      reason: "This would be powerful for Easter service.",
      suggestedBy: "Sarah",
      status: "Approved",
      likes: 12,
      dislikes: 2,
      comments: [
        {
          author: "Denise",
          text: "The choir could come in strong on the bridge.",
        },
      ],
    },
  ]);

  const [newSuggestion, setNewSuggestion] = useState({
    title: "",
    artist: "",
    youtubeLink: "",
    reason: "",
  });

  const [commentInputs, setCommentInputs] = useState({});

  const tabs = [
    { name: "Dashboard", icon: "🏠" },
    { name: "Next Rehearsal", icon: "🎵" },
    { name: "Song Suggestions", icon: "💡" },
    { name: "Team", icon: "👥" },
    { name: "Tasks", icon: "✅" },
    { name: "Attendance", icon: "📋" },
  ];

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markNotificationsRead = () => {
    setNotifications(
      notifications.map((notification) => ({
        ...notification,
        unread: false,
      }))
    );
  };

  const handleSuggestionChange = (e) => {
    setNewSuggestion({
      ...newSuggestion,
      [e.target.name]: e.target.value,
    });
  };

  const submitSuggestion = () => {
    if (!newSuggestion.title.trim()) return;

    setSuggestions([
      {
        ...newSuggestion,
        suggestedBy: "You",
        status: "Pending",
        likes: 0,
        dislikes: 0,
        comments: [],
      },
      ...suggestions,
    ]);

    setNotifications([
      {
        id: Date.now(),
        message: `Your song suggestion "${newSuggestion.title}" was submitted for approval.`,
        time: "Just now",
        unread: true,
      },
      ...notifications,
    ]);

    setNewSuggestion({
      title: "",
      artist: "",
      youtubeLink: "",
      reason: "",
    });

    setShowSuggestForm(false);
  };

  const voteOnSuggestion = (index, voteType) => {
    setSuggestions((currentSuggestions) =>
      currentSuggestions.map((song, songIndex) => {
        if (songIndex !== index) return song;
        if (song.status !== "Approved") return song;

        if (voteType === "like") return { ...song, likes: song.likes + 1 };
        if (voteType === "dislike")
          return { ...song, dislikes: song.dislikes + 1 };

        return song;
      })
    );
  };

  const handleCommentChange = (index, value) => {
    setCommentInputs({
      ...commentInputs,
      [index]: value,
    });
  };

  const postComment = (index) => {
    const commentText = commentInputs[index];
    if (!commentText || !commentText.trim()) return;

    setSuggestions((currentSuggestions) =>
      currentSuggestions.map((song, songIndex) => {
        if (songIndex !== index) return song;
        if (song.status !== "Approved") return song;

        return {
          ...song,
          comments: [...song.comments, { author: "You", text: commentText }],
        };
      })
    );

    setNotifications([
      {
        id: Date.now(),
        message: `You commented on "${suggestions[index].title}".`,
        time: "Just now",
        unread: true,
      },
      ...notifications,
    ]);

    setCommentInputs({
      ...commentInputs,
      [index]: "",
    });
  };

  const RehearsalCard = () => (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-amber-300">
            Upcoming Rehearsal
          </p>
          <h2 className="mt-2 text-2xl font-bold">Thursday • 7:00 PM</h2>
          <p className="mt-1 text-sm text-slate-400">Main Sanctuary</p>
        </div>

        <button className="rounded-xl bg-amber-400 px-4 py-2 text-sm font-bold text-slate-950">
          Confirm Attendance
        </button>
      </div>

      <div className="mt-5 grid gap-3">
        {["Gratitude", "Holy Forever", "Way Maker"].map((song) => (
          <div key={song} className="rounded-2xl bg-slate-900 px-4 py-3">
            {song}
          </div>
        ))}
      </div>

      <p className="mt-5 rounded-2xl bg-amber-400/10 p-4 text-sm text-amber-200">
        Notes: Please review transitions before rehearsal.
      </p>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <button className="rounded-2xl bg-amber-400 px-4 py-3 text-sm font-bold text-slate-950">
          Listen To Audio
        </button>

        <button className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-bold">
          Watch YouTube
        </button>

        <button className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-bold">
          View Details
        </button>
      </div>
    </div>
  );

  const SuggestionsFeed = () => (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Song Suggestions</h2>
          <p className="mt-1 text-sm text-slate-300">
            Recommend songs and join the discussion after admin approval.
          </p>
        </div>

        <button
          onClick={() => setShowSuggestForm(!showSuggestForm)}
          className="rounded-2xl bg-amber-400 px-4 py-3 text-sm font-bold text-slate-950"
        >
          + Suggest Song
        </button>
      </div>

      {showSuggestForm && (
        <div className="mt-5 rounded-2xl border border-white/10 bg-slate-900 p-5">
          <h3 className="text-lg font-bold">Suggest a Song</h3>

          <div className="mt-4 grid gap-3">
            <input
              type="text"
              name="title"
              value={newSuggestion.title}
              onChange={handleSuggestionChange}
              placeholder="Song title"
              className="rounded-2xl bg-slate-950 px-4 py-3 text-sm text-white outline-none"
            />

            <input
              type="text"
              name="artist"
              value={newSuggestion.artist}
              onChange={handleSuggestionChange}
              placeholder="Artist"
              className="rounded-2xl bg-slate-950 px-4 py-3 text-sm text-white outline-none"
            />

            <input
              type="text"
              name="youtubeLink"
              value={newSuggestion.youtubeLink}
              onChange={handleSuggestionChange}
              placeholder="YouTube link"
              className="rounded-2xl bg-slate-950 px-4 py-3 text-sm text-white outline-none"
            />

            <textarea
              name="reason"
              value={newSuggestion.reason}
              onChange={handleSuggestionChange}
              placeholder="Why are you suggesting this song?"
              className="min-h-24 rounded-2xl bg-slate-950 px-4 py-3 text-sm text-white outline-none"
            />

            <button
              onClick={submitSuggestion}
              className="rounded-2xl bg-amber-400 px-4 py-3 text-sm font-bold text-slate-950"
            >
              Submit Suggestion
            </button>
          </div>
        </div>
      )}

      {songSuggestions.map((song, index) => (
        <div key={index} className="mt-5 rounded-2xl bg-slate-900 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-lg font-bold">{song.title}</p>
              <p className="mt-1 text-xs text-slate-400">
                Suggested by {song.suggestedBy}
              </p>
            </div>

            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${
                song.status === "Approved"
                  ? "bg-emerald-500/20 text-emerald-300"
                  : "bg-amber-400/20 text-amber-300"
              }`}
            >
              {song.status}
            </span>
          </div>

          {song.reason && (
            <p className="mt-4 text-sm text-slate-300">“{song.reason}”</p>
          )}

          {song.status === "Pending" && (
            <p className="mt-4 rounded-2xl bg-amber-400/10 p-3 text-sm text-amber-200">
              Waiting for admin approval. Voting and comments will unlock once
              approved.
            </p>
          )}

         {song.status === "Approved" && song.comments && (
            <>
              <div className="mt-4 flex gap-5 text-sm text-slate-300">
                <button
                  onClick={() => voteOnSuggestion(index, "like")}
                  className="hover:text-amber-300"
                >
                  👍 {song.likes}
                </button>

                <button
                  onClick={() => voteOnSuggestion(index, "dislike")}
                  className="hover:text-amber-300"
                >
                  👎 {song.dislikes}
                </button>

                <span>💬 {song.comments.length} comments</span>
              </div>

              {song.comments.length > 0 && (
                <div className="mt-4 border-t border-white/10 pt-4">
                  {song.comments.map((comment, commentIndex) => (
                    <p
                      key={commentIndex}
                      className="mb-2 text-sm text-slate-300"
                    >
                      <span className="font-bold text-white">
                        {comment.author}:
                      </span>{" "}
                      {comment.text}
                    </p>
                  ))}
                </div>
              )}

              <div className="mt-4 flex gap-3">
                <input
                  type="text"
                  value={commentInputs[index] || ""}
                  onChange={(e) => handleCommentChange(index, e.target.value)}
                  placeholder="Write a comment..."
                  className="flex-1 rounded-2xl bg-slate-950 px-4 py-3 text-sm text-white outline-none"
                />

                <button
                  onClick={() => postComment(index)}
                  className="rounded-2xl bg-amber-400 px-4 py-3 text-sm font-bold text-slate-950"
                >
                  Post
                </button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );

  const DashboardHome = () => (
    <div className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-amber-400/10 p-6 shadow-xl">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-amber-300">
          Welcome Back
        </p>
        <h2 className="mt-2 text-3xl font-bold">Marcus Webb 🎵</h2>
        <p className="mt-2 text-slate-300">
          Rehearsal is in 3 days. Let’s make Sunday incredible.
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            onClick={() => setActiveTab("Next Rehearsal")}
            className="rounded-2xl bg-amber-400 px-4 py-3 text-sm font-bold text-slate-950"
          >
            View Rehearsal Details
          </button>

          <button
            onClick={() => setActiveTab("Song Suggestions")}
            className="rounded-2xl border border-amber-300/40 px-4 py-3 text-sm font-bold text-amber-200"
          >
            Suggest a Song
          </button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <RehearsalCard />

        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl">
          <h2 className="text-2xl font-bold">Team Status</h2>

          <div className="mt-5 space-y-3">
            {["Marcus Webb", "Pastor Elaine", "Deja Morris", "Tyrone Banks"].map(
              (member, index) => (
                <div
                  key={member}
                  className="flex items-center justify-between rounded-2xl bg-slate-900 px-4 py-3"
                >
                  <span>{member}</span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      index < 2
                        ? "bg-emerald-500/20 text-emerald-300"
                        : "bg-amber-400/20 text-amber-300"
                    }`}
                  >
                    {index < 2 ? "Confirmed" : "Pending"}
                  </span>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const TeamTab = () => (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl">
      <h2 className="text-2xl font-bold">Team</h2>
      <div className="mt-5 space-y-3">
        {["Marcus Webb", "Pastor Elaine", "Deja Morris", "Tyrone Banks"].map(
          (member) => (
            <div
              key={member}
              className="rounded-2xl bg-slate-900 px-4 py-3 text-slate-200"
            >
              {member}
            </div>
          )
        )}
      </div>
    </div>
  );

  const TasksTab = () => (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl">
      <h2 className="text-2xl font-bold">Tasks</h2>
      <div className="mt-5 space-y-3">
        {[
          "Practice Holy Forever bridge",
          "Confirm attendance by Wednesday",
          "Review YouTube reference links",
        ].map((task) => (
          <div
            key={task}
            className="flex items-center justify-between rounded-2xl bg-slate-900 px-4 py-3"
          >
            <span>{task}</span>
            <span className="rounded-full bg-amber-400/20 px-3 py-1 text-xs font-bold text-amber-300">
              Pending
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  const AttendanceTab = () => (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl">
      <h2 className="text-2xl font-bold">Attendance</h2>
      <p className="mt-2 text-slate-300">
        Your status for Thursday rehearsal is pending.
      </p>

      <button className="mt-5 rounded-2xl bg-amber-400 px-4 py-3 text-sm font-bold text-slate-950">
        Confirm Attendance
      </button>
    </div>
  );

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="flex min-h-screen">
        <aside className="w-64 shrink-0 border-r border-white/10 bg-black/30 p-5">
          <h1 className="text-sm font-black tracking-[0.2em] text-amber-300">
            REHEARSAL ROOM
          </h1>

          <div className="mt-8 space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.name}
                onClick={() => setActiveTab(tab.name)}
                className={`w-full rounded-xl px-3 py-2.5 text-left text-sm font-bold transition-all ${
                  activeTab === tab.name
                    ? "bg-amber-400 text-slate-950"
                    : "bg-white/5 text-slate-300 hover:bg-white/10"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span>{tab.icon}</span>
                  <span>{tab.name}</span>
                </div>
              </button>
            ))}
          </div>
        </aside>

        <section className="flex-1 px-6 py-6">
          <div className="mx-auto max-w-6xl">
            <div className="relative flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-300">
                  Rehearsal Room
                </p>

                <h1 className="mt-2 text-3xl font-bold">{activeTab}</h1>
              </div>

              <div className="relative">
                <button
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    markNotificationsRead();
                  }}
                  className="relative rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xl hover:bg-white/10"
                >
                  🔔

                  {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 z-50 mt-3 w-80 rounded-3xl border border-white/10 bg-slate-900 p-4 shadow-2xl">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="font-bold">Notifications</h3>
                      <span className="text-xs text-slate-400">
                        {notifications.length} total
                      </span>
                    </div>

                    <div className="space-y-3">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className="rounded-2xl bg-slate-950 p-3"
                        >
                          <p className="text-sm text-slate-200">
                            {notification.message}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {notification.time}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6">
              {activeTab === "Dashboard" && <DashboardHome />}
              {activeTab === "Next Rehearsal" && <RehearsalCard />}
              {activeTab === "Song Suggestions" && <SuggestionsFeed />}
              {activeTab === "Team" && <TeamTab />}
              {activeTab === "Tasks" && <TasksTab />}
              {activeTab === "Attendance" && <AttendanceTab />}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}