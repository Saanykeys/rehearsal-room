import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import rehearsalLogo from "./assets/rehearsalroom-logo.png";

const API_BASE = "http://localhost:5281";

function App() {
  const [songs, setSongs] = useState([]);
  const [choirMembers, setChoirMembers] = useState([]);
  const [rehearsalEvents, setRehearsalEvents] = useState([]);
  const [rehearsalSongs, setRehearsalSongs] = useState({});
const [selectedSongByEvent, setSelectedSongByEvent] = useState({});
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(null);
const [rehearsalMode, setRehearsalMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("title");

  const [showAddMember, setShowAddMember] = useState(false);
  const [newMemberName, setNewMemberName] = useState("");

  const [showAddEvent, setShowAddEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    eventDate: "",
    notes: "",
  });

  const [showAddSong, setShowAddSong] = useState(false);
  const [newSong, setNewSong] = useState({
    title: "",
    key: "",
    format: "",
    youTubeLink: "",
  });

  const [editingSong, setEditingSong] = useState(null);
  const [editSongForm, setEditSongForm] = useState({
    title: "",
    key: "",
    format: "",
    youTubeLink: "",
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem("rehearsalRoomUser");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [showRegisterPage, setShowRegisterPage] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("register") === "true";
  });

  const inviteLink = `${window.location.origin}?register=true`;

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });

  const [loginError, setLoginError] = useState("");

  const [registerForm, setRegisterForm] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const [registerError, setRegisterError] = useState("");
  const [registerSuccess, setRegisterSuccess] = useState("");

  const isAdmin = currentUser?.role === "Admin";

  const canUpdateMemberAttendance = (member) => {
    if (isAdmin) return true;
    return member.userId === currentUser?.id;
  };

  const filteredSongs = songs
    .filter((song) => {
      const search = searchTerm.toLowerCase();

      return (
        song.title?.toLowerCase().includes(search) ||
        song.key?.toLowerCase().includes(search) ||
        song.format?.toLowerCase().includes(search)
      );
    })
    .sort((a, b) => {
      const aValue = a[sortBy]?.toLowerCase() || "";
      const bValue = b[sortBy]?.toLowerCase() || "";

      return aValue.localeCompare(bValue);
    });

  const selectedEventAttendance = choirMembers.map((member) => {
    const record = attendanceRecords.find(
      (r) =>
        r.choirMemberId === member.id &&
        r.rehearsalEventId === selectedEventId
    );

    return {
      member,
      attending: record?.attending,
    };
  });

  const totalMembers = choirMembers.length;

  const attendingCount = selectedEventAttendance.filter(
    (item) => item.attending === true
  ).length;

  const notAttendingCount = selectedEventAttendance.filter(
    (item) => item.attending === false
  ).length;

  const noResponseCount = selectedEventAttendance.filter(
    (item) => item.attending === undefined
  ).length;

  const attendancePercentage =
    totalMembers === 0
      ? 0
      : Math.round((attendingCount / totalMembers) * 100);

  useEffect(() => {
    if (!currentUser) return;

    fetch(`${API_BASE}/songs`)
      .then((res) => res.json())
      .then((data) => setSongs(data))
      .catch((err) => console.error(err));

    fetch(`${API_BASE}/choirmembers`)
      .then((res) => res.json())
      .then((data) => setChoirMembers(data))
      .catch((err) => console.error(err));
fetch(`${API_BASE}/api/RehearsalEvents`)
  .then((res) => res.json())
  .then((data) => {
    setRehearsalEvents(data);

    data.forEach((event) => {
      fetchRehearsalSongs(event.id);
    });
  })
  .catch((err) => console.error(err));

    fetch(`${API_BASE}/api/AttendanceRecords`)
      .then((res) => res.json())
      .then((data) => setAttendanceRecords(data))
      .catch((err) => console.error(err));
  }, [currentUser]);

  const login = async (e) => {
    e.preventDefault();
    setLoginError("");

    try {
      const response = await fetch(`${API_BASE}/api/Auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginForm),
      });

      if (!response.ok) {
        setLoginError("Invalid email or password.");
        return;
      }

      const data = await response.json();

      localStorage.setItem("rehearsalRoomUser", JSON.stringify(data));
      setCurrentUser(data);
      setShowRegisterPage(false);
      window.history.replaceState({}, "", window.location.origin);
    } catch (error) {
      console.error(error);
      setLoginError("Something went wrong. Please try again.");
    }
  };

  const registerMember = async (e) => {
    e.preventDefault();
    setRegisterError("");
    setRegisterSuccess("");

    if (
      registerForm.fullName.trim() === "" ||
      registerForm.email.trim() === "" ||
      registerForm.password.trim() === ""
    ) {
      setRegisterError("Please fill out all fields.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/Auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: registerForm.fullName,
          email: registerForm.email,
          password: registerForm.password,
          role: "ChoirMember",
        }),
      });

      if (!response.ok) {
        setRegisterError("Could not create account. Email may already exist.");
        return;
      }

      setRegisterSuccess("Account created successfully. You can now log in.");
      setRegisterForm({
        fullName: "",
        email: "",
        password: "",
      });
    } catch (error) {
      console.error(error);
      setRegisterError("Something went wrong creating your account.");
    }
  };

  const logout = () => {
    localStorage.removeItem("rehearsalRoomUser");
    setCurrentUser(null);
    setSongs([]);
    setChoirMembers([]);
    setRehearsalEvents([]);
    setAttendanceRecords([]);
    setSearchTerm("");
    setSortBy("title");
    setSelectedEventId(null);
  };

  const copyInviteLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      alert("Invite link copied.");
    } catch {
      alert(inviteLink);
    }
  };

  const addSong = (e) => {
    e.preventDefault();

    if (
      newSong.title.trim() === "" ||
      newSong.key.trim() === "" ||
      newSong.format.trim() === ""
    ) {
      return;
    }

    fetch(`${API_BASE}/songs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newSong),
    })
      .then((res) => res.json())
      .then((createdSong) => {
        setSongs([...songs, createdSong]);

        setNewSong({
          title: "",
          key: "",
          format: "",
          youTubeLink: "",
        });

        setShowAddSong(false);
      })
      .catch((err) => console.error(err));
  };

  const startEditSong = (song) => {
    setEditingSong(song);

    setEditSongForm({
      title: song.title,
      key: song.key,
      format: song.format,
      youTubeLink: song.youTubeLink || "",
    });
  };

  const cancelEditSong = () => {
    setEditingSong(null);

    setEditSongForm({
      title: "",
      key: "",
      format: "",
      youTubeLink: "",
    });
  };

  const updateSong = (e) => {
    e.preventDefault();

    fetch(`${API_BASE}/songs/${editingSong.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(editSongForm),
    })
      .then((res) => res.json())
      .then((updatedSong) => {
        setSongs((prevSongs) =>
          prevSongs.map((song) =>
            song.id === updatedSong.id ? updatedSong : song
          )
        );

        cancelEditSong();
      })
      .catch((err) => console.error(err));
  };

  const deleteSong = (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this song?"
    );

    if (!confirmed) return;

    fetch(`${API_BASE}/songs/${id}`, {
      method: "DELETE",
    })
      .then(() => {
        setSongs((prevSongs) => prevSongs.filter((song) => song.id !== id));
      })
      .catch((err) => console.error(err));
  };

  const addRehearsalEvent = (e) => {
    e.preventDefault();

    if (newEvent.title.trim() === "" || newEvent.eventDate.trim() === "") {
      return;
    }

    fetch(`${API_BASE}/api/RehearsalEvents`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newEvent),
    })
      .then((res) => res.json())
      .then((createdEvent) => {
        setRehearsalEvents((prev) => [...prev, createdEvent]);

        setNewEvent({
          title: "",
          eventDate: "",
          notes: "",
        });

        setShowAddEvent(false);
      })
      .catch((err) => console.error(err));
  };

  const deleteEvent = (id) => {
    const confirmed = window.confirm("Delete this rehearsal event?");

    if (!confirmed) return;

    fetch(`${API_BASE}/api/RehearsalEvents/${id}`, {
      method: "DELETE",
    })
      .then(() => {
        setRehearsalEvents((prev) =>
          prev.filter((event) => event.id !== id)
        );
      })
      .catch((err) => console.error(err));
  };

  const addMember = (e) => {
    e.preventDefault();

    if (newMemberName.trim() === "") return;

    fetch(`${API_BASE}/choirmembers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: newMemberName,
        attending: false,
      }),
    })
      .then((res) => res.json())
      .then((newMember) => {
        setChoirMembers([...choirMembers, newMember]);
        setNewMemberName("");
        setShowAddMember(false);
      })
      .catch((err) => console.error(err));
  };

  const updateAttendance = (member, status) => {
    if (!selectedEventId) {
      alert("Please select a rehearsal event first.");
      return;
    }

    if (!canUpdateMemberAttendance(member)) {
      alert("You can only update your own attendance.");
      return;
    }

    fetch(`${API_BASE}/api/AttendanceRecords`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        choirMemberId: member.id,
        rehearsalEventId: selectedEventId,
        attending: status,
      }),
    })
      .then((res) => res.json())
      .then((savedRecord) => {
        setAttendanceRecords((prev) => {
          const existing = prev.find(
            (record) =>
              record.choirMemberId === savedRecord.choirMemberId &&
              record.rehearsalEventId === savedRecord.rehearsalEventId
          );

          if (existing) {
            return prev.map((record) =>
              record.id === savedRecord.id ? savedRecord : record
            );
          }

          return [...prev, savedRecord];
        });
      })
      .catch((err) => console.error(err));
  };

  const getAttendanceStatus = (memberId) => {
    if (!selectedEventId) return null;

    const record = attendanceRecords.find(
      (r) =>
        r.choirMemberId === memberId &&
        r.rehearsalEventId === selectedEventId
    );

    return record?.attending ?? null;
  };

  const deleteMember = (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this choir member?"
    );

    if (!confirmed) return;

    fetch(`${API_BASE}/choirmembers/${id}`, {
      method: "DELETE",
    })
      .then(() => {
        setChoirMembers((prevMembers) =>
          prevMembers.filter((member) => member.id !== id)
        );
      })
      .catch((err) => console.error(err));
  };


const fetchRehearsalSongs = (rehearsalEventId) => {
  fetch(`${API_BASE}/api/RehearsalSongs/${rehearsalEventId}`)
    .then((res) => res.json())
    .then((data) => {
      setRehearsalSongs((prev) => ({
        ...prev,
        [rehearsalEventId]: data,
      }));
    })
    .catch((err) => console.error(err));
};

const assignSongToRehearsal = (rehearsalEventId) => {
  const songId = selectedSongByEvent[rehearsalEventId];

  if (!songId) return;

  fetch(`${API_BASE}/api/RehearsalSongs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      rehearsalEventId,
      songId: Number(songId),
    }),
  })
    .then((res) => res.json())
    .then(() => {
      fetchRehearsalSongs(rehearsalEventId);

      setSelectedSongByEvent((prev) => ({
        ...prev,
        [rehearsalEventId]: "",
      }));
    })
    .catch((err) => console.error(err));
};






  if (showRegisterPage && !currentUser) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950 px-6 text-white">
        <form
          onSubmit={registerMember}
          className="w-full max-w-md rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur"
        >
          <div className="flex items-center gap-4">
  <img
    src={rehearsalLogo}
    alt="Rehearsal Room Logo"
    className="h-16 w-16 rounded-2xl object-cover shadow-lg shadow-amber-900/30"
  />

  <div>
    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-300">
      Rehearsal Room
    </p>

    <h1 className="mt-1 text-3xl font-bold">Song Library</h1>
  </div>
</div>

          <p className="mt-3 text-slate-300">
            Register as a choir member to access songs and attendance.
          </p>

          {registerError && (
            <div className="mt-5 rounded-2xl bg-red-500/20 p-4 text-red-200">
              {registerError}
            </div>
          )}

          {registerSuccess && (
            <div className="mt-5 rounded-2xl bg-green-500/20 p-4 text-green-200">
              {registerSuccess}
            </div>
          )}

          <div className="mt-6 space-y-4">
            <input
              type="text"
              placeholder="Full name"
              value={registerForm.fullName}
              onChange={(e) =>
                setRegisterForm({
                  ...registerForm,
                  fullName: e.target.value,
                })
              }
              className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-5 py-4 text-white outline-none placeholder:text-slate-500 focus:border-amber-300"
            />

            <input
              type="email"
              placeholder="Email"
              value={registerForm.email}
              onChange={(e) =>
                setRegisterForm({
                  ...registerForm,
                  email: e.target.value,
                })
              }
              className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-5 py-4 text-white outline-none placeholder:text-slate-500 focus:border-amber-300"
            />

            <input
              type="password"
              placeholder="Password"
              value={registerForm.password}
              onChange={(e) =>
                setRegisterForm({
                  ...registerForm,
                  password: e.target.value,
                })
              }
              className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-5 py-4 text-white outline-none placeholder:text-slate-500 focus:border-amber-300"
            />

            <button
              type="submit"
              className="w-full rounded-2xl bg-amber-400 px-5 py-4 font-semibold text-slate-950 hover:bg-amber-300"
            >
              Create Choir Member Account
            </button>

            <button
              type="button"
              onClick={() => {
                setShowRegisterPage(false);
                window.history.replaceState({}, "", window.location.origin);
              }}
              className="w-full rounded-2xl border border-white/10 px-5 py-4 font-semibold text-slate-200 hover:bg-white/10"
            >
              Back to Login
            </button>
          </div>
        </form>
      </main>
    );
  }

  if (!currentUser) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950 px-6 text-white">
        <form
          onSubmit={login}
          className="w-full max-w-md rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-300">
            Rehearsal Room
          </p>

          <h1 className="mt-4 text-4xl font-bold">Login</h1>

          <p className="mt-3 text-slate-300">
            Sign in to view songs and rehearsal attendance.
          </p>

          {loginError && (
            <div className="mt-5 rounded-2xl bg-red-500/20 p-4 text-red-200">
              {loginError}
            </div>
          )}

          <div className="mt-6 space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={loginForm.email}
              onChange={(e) =>
                setLoginForm({
                  ...loginForm,
                  email: e.target.value,
                })
              }
              className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-5 py-4 text-white outline-none placeholder:text-slate-500 focus:border-amber-300"
            />

            <input
              type="password"
              placeholder="Password"
              value={loginForm.password}
              onChange={(e) =>
                setLoginForm({
                  ...loginForm,
                  password: e.target.value,
                })
              }
              className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-5 py-4 text-white outline-none placeholder:text-slate-500 focus:border-amber-300"
            />

            <button
              type="submit"
              className="w-full rounded-2xl bg-amber-400 px-5 py-4 font-semibold text-slate-950 hover:bg-amber-300"
            >
              Login
            </button>
          </div>
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950 text-white">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-8">
        <nav className="flex items-center justify-between gap-4">
         <div className="flex items-center gap-4">
  <img
    src={rehearsalLogo}
    alt="Rehearsal Room Logo"
    className="h-16 w-16 rounded-2xl object-cover shadow-lg shadow-amber-900/30"
  />

  <div>
    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-300">
      Rehearsal Room
    </p>

    <h1 className="mt-1 text-3xl font-bold">Song Library</h1>
  </div>
</div>

<div className="flex flex-wrap items-center justify-end gap-3">
  <span className="rounded-full border border-white/10 bg-slate-950/70 px-4 py-3 text-sm font-semibold text-white">
    {currentUser.role}
  </span>

            {isAdmin && (
              <button
                onClick={copyInviteLink}
                className="rounded-full border border-amber-300/40 bg-amber-300/10 px-6 py-3 font-semibold text-amber-100 hover:bg-amber-300 hover:text-slate-950"
              >
                Copy Invite Link
              </button>
            )}

<button
  onClick={() => setRehearsalMode(!rehearsalMode)}
  className="rounded-full border border-amber-300/40 bg-amber-300/10 px-5 py-3 font-semibold text-amber-100 hover:bg-amber-300 hover:text-slate-950"
>
  {rehearsalMode ? "Exit Rehearsal Mode" : "Rehearsal Mode"}
</button>



            <button
              onClick={logout}
              className="rounded-full border border-white/10 px-5 py-3 font-semibold text-slate-200 hover:bg-white/10"
            >
              Logout
            </button>

            {isAdmin && (
              <button
                onClick={() => setShowAddSong(true)}
                className="rounded-full bg-amber-400 px-6 py-3 font-semibold text-slate-950 shadow-lg shadow-amber-900/30 transition hover:bg-amber-300"
              >
                Add Song
              </button>
            )}
          </div>
        </nav>

        {isAdmin && (
          <div className="mt-6 rounded-3xl border border-amber-300/20 bg-amber-300/10 p-5">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-semibold text-amber-100">
                  Choir Member Invite Link
                </p>

                <p className="mt-2 break-all text-sm text-slate-300">
                  {inviteLink}
                </p>

                <p className="mt-3 text-sm text-slate-400">
                  Members can scan this QR code or use the link to create their
                  choir member account.
                </p>
              </div>

              <div className="rounded-2xl bg-white p-4">
                <QRCodeSVG value={inviteLink} size={140} />
              </div>
            </div>
          </div>
        )}

        <div className="mt-12 rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-300">
            Welcome Back, {currentUser.fullName}
          </p>

          <h2 className="mt-4 text-5xl font-bold leading-tight">
            Find the right song for rehearsal, fast.
          </h2>

          <div className="mt-8 flex flex-col gap-4 md:flex-row">
            <input
              type="text"
              placeholder="Search by song title, key, or format..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-5 py-4 text-white outline-none placeholder:text-slate-500 focus:border-amber-300"
            />

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-2xl border border-white/10 bg-slate-950/60 px-5 py-4 text-white outline-none focus:border-amber-300 md:w-64"
            >
              <option value="title">Sort by Title</option>
              <option value="key">Sort by Key</option>
              <option value="format">Sort by Format</option>
            </select>
          </div>
        </div>

        {showAddSong && isAdmin && (
          <form
            onSubmit={addSong}
            className="mt-8 rounded-3xl border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur"
          >
            <h2 className="text-2xl font-bold">Add New Song</h2>

            <div className="mt-5 grid gap-4 md:grid-cols-4">
              <input
                type="text"
                placeholder="Song title"
                value={newSong.title}
                onChange={(e) =>
                  setNewSong({
                    ...newSong,
                    title: e.target.value,
                  })
                }
                className="rounded-2xl border border-white/10 bg-slate-950/70 px-5 py-3 text-white outline-none"
              />

              <input
                type="text"
                placeholder="Key"
                value={newSong.key}
                onChange={(e) =>
                  setNewSong({
                    ...newSong,
                    key: e.target.value,
                  })
                }
                className="rounded-2xl border border-white/10 bg-slate-950/70 px-5 py-3 text-white outline-none"
              />

              <input
                type="text"
                placeholder="Format"
                value={newSong.format}
                onChange={(e) =>
                  setNewSong({
                    ...newSong,
                    format: e.target.value,
                  })
                }
                className="rounded-2xl border border-white/10 bg-slate-950/70 px-5 py-3 text-white outline-none"
              />

              <input
                type="text"
                placeholder="YouTube Link"
                value={newSong.youTubeLink}
                onChange={(e) =>
                  setNewSong({
                    ...newSong,
                    youTubeLink: e.target.value,
                  })
                }
                className="rounded-2xl border border-white/10 bg-slate-950/70 px-5 py-3 text-white outline-none"
              />
            </div>

            <div className="mt-5 flex gap-3">
              <button
                type="submit"
                className="rounded-2xl bg-amber-400 px-5 py-3 font-semibold text-slate-950 hover:bg-amber-300"
              >
                Save Song
              </button>

              <button
                type="button"
                onClick={() => setShowAddSong(false)}
                className="rounded-2xl border border-white/10 px-5 py-3 font-semibold text-slate-300 hover:bg-white/10"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {editingSong && isAdmin && (
          <form
            onSubmit={updateSong}
            className="mt-8 rounded-3xl border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur"
          >
            <h2 className="text-2xl font-bold">Edit Song</h2>

            <div className="mt-5 grid gap-4 md:grid-cols-4">
              <input
                type="text"
                placeholder="Song title"
                value={editSongForm.title}
                onChange={(e) =>
                  setEditSongForm({
                    ...editSongForm,
                    title: e.target.value,
                  })
                }
                className="rounded-2xl border border-white/10 bg-slate-950/70 px-5 py-3 text-white outline-none"
              />

              <input
                type="text"
                placeholder="Key"
                value={editSongForm.key}
                onChange={(e) =>
                  setEditSongForm({
                    ...editSongForm,
                    key: e.target.value,
                  })
                }
                className="rounded-2xl border border-white/10 bg-slate-950/70 px-5 py-3 text-white outline-none"
              />

              <input
                type="text"
                placeholder="Format"
                value={editSongForm.format}
                onChange={(e) =>
                  setEditSongForm({
                    ...editSongForm,
                    format: e.target.value,
                  })
                }
                className="rounded-2xl border border-white/10 bg-slate-950/70 px-5 py-3 text-white outline-none"
              />

              <input
                type="text"
                placeholder="YouTube Link"
                value={editSongForm.youTubeLink}
                onChange={(e) =>
                  setEditSongForm({
                    ...editSongForm,
                    youTubeLink: e.target.value,
                  })
                }
                className="rounded-2xl border border-white/10 bg-slate-950/70 px-5 py-3 text-white outline-none"
              />
            </div>

            <div className="mt-5 flex gap-3">
              <button
                type="submit"
                className="rounded-2xl bg-amber-400 px-5 py-3 font-semibold text-slate-950 hover:bg-amber-300"
              >
                Save Changes
              </button>

              <button
                type="button"
                onClick={cancelEditSong}
                className="rounded-2xl border border-white/10 px-5 py-3 font-semibold text-slate-300 hover:bg-white/10"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <section className="mt-10 rounded-3xl border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-300">
                Rehearsal Events
              </p>

              <h2 className="mt-2 text-3xl font-bold">Upcoming Rehearsals</h2>
            </div>

            {isAdmin && (
              <button
                onClick={() => setShowAddEvent(true)}
                className="rounded-full bg-amber-400 px-5 py-3 font-semibold text-slate-950 hover:bg-amber-300"
              >
                Add Event
              </button>
            )}
          </div>

          {showAddEvent && (
            <form
              onSubmit={addRehearsalEvent}
              className="mt-6 rounded-3xl border border-white/10 bg-slate-950/40 p-5"
            >
              <div className="grid gap-4 md:grid-cols-3">
                <input
                  type="text"
                  placeholder="Event title"
                  value={newEvent.title}
                  onChange={(e) =>
                    setNewEvent({
                      ...newEvent,
                      title: e.target.value,
                    })
                  }
                  className="rounded-2xl border border-white/10 bg-slate-950/70 px-5 py-3 text-white outline-none"
                />

                <input
                  type="datetime-local"
                  value={newEvent.eventDate}
                  onChange={(e) =>
                    setNewEvent({
                      ...newEvent,
                      eventDate: e.target.value,
                    })
                  }
                  className="rounded-2xl border border-white/10 bg-slate-950/70 px-5 py-3 text-white outline-none"
                />

                <input
                  type="text"
                  placeholder="Notes"
                  value={newEvent.notes}
                  onChange={(e) =>
                    setNewEvent({
                      ...newEvent,
                      notes: e.target.value,
                    })
                  }
                  className="rounded-2xl border border-white/10 bg-slate-950/70 px-5 py-3 text-white outline-none"
                />
              </div>

              <div className="mt-5 flex gap-3">
                <button
                  type="submit"
                  className="rounded-2xl bg-amber-400 px-5 py-3 font-semibold text-slate-950 hover:bg-amber-300"
                >
                  Save Event
                </button>

                <button
                  type="button"
                  onClick={() => setShowAddEvent(false)}
                  className="rounded-2xl border border-white/10 px-5 py-3 font-semibold text-slate-300 hover:bg-white/10"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 grid gap-4">
            {rehearsalEvents.length > 0 ? (
              rehearsalEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/40 p-5"
                >
                  <div>
                    <h3 className="text-2xl font-semibold">{event.title}</h3>

                    <p className="mt-2 text-slate-300">
                      {new Date(event.eventDate).toLocaleString()}
                    </p>

                    {event.notes && (
                      <p className="mt-1 text-sm text-slate-400">
                        {event.notes}
                      </p>
                    )}
                  </div>
{isAdmin && (
  <div className="mt-4 flex gap-3">
    <select
      value={selectedSongByEvent[event.id] || ""}
      onChange={(e) =>
        setSelectedSongByEvent((prev) => ({
          ...prev,
          [event.id]: e.target.value,
        }))
      }
      className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none"
    >
      <option value="">Select song</option>

      {songs.map((song) => (
        <option key={song.id} value={song.id}>
          {song.title}
        </option>
      ))}
    </select>

    <button
      onClick={() => assignSongToRehearsal(event.id)}
      className="rounded-2xl bg-amber-400 px-5 py-3 font-semibold text-slate-950 hover:bg-amber-300"
    >
      Add Song
    </button>
  </div>
)}


<div className="mt-4">
  <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">
    Setlist
  </p>

  <div className="flex flex-wrap gap-2">
    {(rehearsalSongs[event.id] || []).map((item) => (
      <span
        key={item.id}
        className="rounded-full border border-white/10 bg-slate-950/60 px-4 py-2 text-sm text-white"
      >
        {item.song?.title}
      </span>
    ))}
  </div>
</div>










                  {isAdmin && (
                    <button
                      onClick={() => deleteEvent(event.id)}
                      className="rounded-2xl bg-red-900/40 px-5 py-3 font-semibold text-red-200 hover:bg-red-600 hover:text-white"
                    >
                      Delete
                    </button>
                  )}
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-5 text-slate-400">
                No rehearsal events yet.
              </div>
            )}
          </div>
        </section>

        <section
  className={`mt-10 grid gap-5 ${
    rehearsalMode ? "md:grid-cols-1" : ""
  }`}
>
          {filteredSongs.length > 0 ? (
            filteredSongs.map((song) => (
              <div
                key={song.id}
                className={`rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur ${
  rehearsalMode
    ? "flex flex-col items-start gap-4"
    : "flex items-center justify-between"
}`}
              >
                <div>
                  <h3 className="text-2xl font-semibold">{song.title}</h3>

                  <p className="mt-2 text-slate-300">
                    Key: {song.key} | {song.format}
                  </p>

                  {song.youTubeLink && (
                    <a
                      href={song.youTubeLink}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex items-center gap-2 rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500"
                    >
                      <span>▶</span>
                      Watch on YouTube
                    </a>
                  )}
                </div>

                {isAdmin && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEditSong(song)}
                      className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-semibold text-slate-200 hover:bg-white/10"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => deleteSong(song.id)}
                      className="rounded-2xl bg-red-900/40 px-5 py-3 font-semibold text-red-200 hover:bg-red-600 hover:text-white"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-center text-slate-300">
              No songs found.
            </div>
          )}
        </section>

        <section className="mt-12 rounded-3xl border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-300">
                Rehearsal Attendance
              </p>

              <h2 className="mt-2 text-3xl font-bold">
                Will you be at rehearsal?
              </h2>

              <select
                value={selectedEventId || ""}
                onChange={(e) => setSelectedEventId(Number(e.target.value))}
                className="mt-4 rounded-2xl border border-white/10 bg-slate-950/70 px-5 py-3 text-white outline-none"
              >
                <option value="">Select rehearsal event</option>

                {rehearsalEvents.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.title}
                  </option>
                ))}
              </select>
            </div>

            {isAdmin && (
              <button
                onClick={() => setShowAddMember(true)}
                className="rounded-full bg-amber-400 px-5 py-2 font-semibold text-slate-950 hover:bg-amber-300"
              >
                Add Member
              </button>
            )}
          </div>

          {selectedEventId && (
            <div className="mb-6 grid gap-4 md:grid-cols-5">
              <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-5">
                <p className="text-sm text-slate-400">Total Members</p>
                <p className="mt-2 text-3xl font-bold">{totalMembers}</p>
              </div>

              <div className="rounded-2xl border border-green-400/20 bg-green-500/10 p-5">
                <p className="text-sm text-green-200">Attending</p>
                <p className="mt-2 text-3xl font-bold text-green-300">
                  {attendingCount}
                </p>
              </div>

              <div className="rounded-2xl border border-red-400/20 bg-red-500/10 p-5">
                <p className="text-sm text-red-200">Not Attending</p>
                <p className="mt-2 text-3xl font-bold text-red-300">
                  {notAttendingCount}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-5">
                <p className="text-sm text-slate-400">No Response</p>
                <p className="mt-2 text-3xl font-bold">{noResponseCount}</p>
              </div>

              <div className="rounded-2xl border border-amber-300/30 bg-amber-300/10 p-5">
                <p className="text-sm text-amber-200">Attendance</p>
                <p className="mt-2 text-3xl font-bold text-amber-300">
                  {attendancePercentage}%
                </p>
              </div>
            </div>
          )}

          {!isAdmin && (
            <p className="mb-5 rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-sm text-slate-300">
              You can only update attendance for your own name.
            </p>
          )}

          {showAddMember && isAdmin && (
            <form onSubmit={addMember} className="mb-6 flex gap-3">
              <input
                type="text"
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                placeholder="Enter name..."
                className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-5 py-3 text-white outline-none"
              />

              <button className="rounded-2xl bg-amber-400 px-5 py-3 font-semibold text-slate-950">
                Save
              </button>
            </form>
          )}

          <div className="grid gap-4">
            {choirMembers.map((member) => {
              const canEditThisMember = canUpdateMemberAttendance(member);

              return (
                <div
                  key={member.id}
                  className={`flex items-center justify-between rounded-2xl border p-5 ${
                    canEditThisMember
                      ? "border-amber-300/30 bg-slate-950/50"
                      : "border-white/10 bg-slate-950/30 opacity-60"
                  }`}
                >
                  <div>
                    <h3 className="text-xl font-semibold">{member.name}</h3>

                    <p className="text-sm text-slate-400">
                      {getAttendanceStatus(member.id) === true
                        ? "Attending"
                        : getAttendanceStatus(member.id) === false
                        ? "Not attending"
                        : "No response yet"}
                    </p>

                    {!isAdmin && canEditThisMember && (
                      <p className="mt-1 text-xs font-semibold text-amber-300">
                        This is your attendance.
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {canEditThisMember ? (
                      <>
                        <button
                          onClick={() => updateAttendance(member, true)}
                          className="rounded-full bg-green-500/20 px-4 py-2 text-sm font-semibold text-green-300 hover:bg-green-500 hover:text-white"
                        >
                          Yes
                        </button>

                        <button
                          onClick={() => updateAttendance(member, false)}
                          className="rounded-full bg-red-500/20 px-4 py-2 text-sm font-semibold text-red-300 hover:bg-red-500 hover:text-white"
                        >
                          No
                        </button>
                      </>
                    ) : (
                      <span className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-400">
                        View Only
                      </span>
                    )}

                    {isAdmin && (
                      <button
                        onClick={() => deleteMember(member.id)}
                        className="rounded-full bg-red-900/40 px-4 py-2 text-sm font-semibold text-red-200 hover:bg-red-600 hover:text-white"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </section>
    </main>
    );
}
export default App;