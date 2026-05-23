import { useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard,
  Music,
  Lightbulb,
  CalendarDays,
  ClipboardCheck,
  Users,
  Settings,
  Bell,
  Search,
  PlayCircle,
  CheckCircle,
  XCircle,
  Menu,
  X,
  Plus,
  Megaphone,
  Clock,
  Pencil,
  Trash2,
  Save,
  SlidersHorizontal,
  MapPin,
  ListMusic,
} from "lucide-react";

const API_BASE = "http://localhost:5281";

const emptySongForm = {
  title: "",
  artist: "",
  key: "",
  tempo: "",
  category: "Worship",
  youtubeLink: "",
  notes: "",
};

const emptyRehearsalForm = {
  title: "",
  eventDate: "",
  eventTime: "19:00",
  location: "Main Sanctuary",
  notes: "",
  songIds: [],
};

export default function AdminDashboard({ currentUser, token, onLogout }) {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [currentRole, setCurrentRole] = useState("Admin");
const userRole = currentUser?.role;

const isAdmin = userRole === "Admin";
const isMusician = userRole === "Musician";
const isChoirMember = userRole === "Choir Member";
 const canManageSongs = isAdmin;
const canManageMembers = isAdmin;
const canManageRehearsals = isAdmin;
const canPostAnnouncements = isAdmin;

const canViewSongs =
  isAdmin || isMusician || isChoirMember;

const canUpdateOwnAttendance =
  isAdmin || isMusician || isChoirMember;
  const [songs, setSongs] = useState([]);
  const [songSuggestions, setSongSuggestions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [keyFilter, setKeyFilter] = useState("All");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showSongForm, setShowSongForm] = useState(false);
  const [editingSongId, setEditingSongId] = useState(null);
  const [songForm, setSongForm] = useState(emptySongForm);
  const [formError, setFormError] = useState("");
const [members, setMembers] = useState([]);
  const [rehearsals, setRehearsals] = useState([]);
  const [showRehearsalForm, setShowRehearsalForm] = useState(false);
  const [editingRehearsalId, setEditingRehearsalId] = useState(null);
  const [rehearsalForm, setRehearsalForm] = useState(emptyRehearsalForm);
  const [rehearsalError, setRehearsalError] = useState("");

  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [attendanceLoaded, setAttendanceLoaded] = useState(false);

  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);

const [announcementForm, setAnnouncementForm] = useState({
  title: "",
  message: "",
  audience: "Everyone",
});

const [announcements, setAnnouncements] = useState([]);
const [showInviteMemberForm, setShowInviteMemberForm] = useState(false);

const [inviteMemberForm, setInviteMemberForm] = useState({
  fullName: "",
  email: "",
  role: "Choir Member",
});

const [invitedMembers, setInvitedMembers] = useState([]);

const loadMembers = async () => {
  try {
    const response = await fetch("http://localhost:5281/api/Members");

    if (!response.ok) {
      throw new Error("Failed to load members.");
    }

    const data = await response.json();
    setMembers(data);
  } catch (error) {
    console.error("Failed to load members", error);
  }
};

const authHeaders = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
};

const loadRehearsals = async () => {
  try {
    const response = await fetch("http://localhost:5281/api/RehearsalEvents");

    if (!response.ok) {
      throw new Error("Failed to load rehearsals.");
    }

    const data = await response.json();

    setRehearsals(data);
  } catch (error) {
    console.error("Failed to load rehearsals", error);
  }
};








const loadSongs = async () => {
    try {
      const response = await fetch(`${API_BASE}/Songs`, {
  headers: authHeaders,
});
      const data = await response.json();
      setSongs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load songs", error);
    }
  };

  const loadSongSuggestions = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/SongSuggestions`, {
  headers: authHeaders,
});
      const data = await response.json();
      setSongSuggestions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load song suggestions", error);
    }
  };

  const loadAttendanceRecords = async () => {
    try {
     const response = await fetch(`${API_BASE}/api/AttendanceRecords`, {
  headers: authHeaders,
});
      const data = await response.json();
      setAttendanceRecords(Array.isArray(data) ? data : []);
      setAttendanceLoaded(true);
    } catch (error) {
      console.error("Failed to load attendance records", error);
      setAttendanceLoaded(true);
    }
  };


  const handleInviteMember = async () => {
  if (!inviteMemberForm.fullName || !inviteMemberForm.email) {
    alert("Please complete all fields.");
    return;
  }

  try {
    const response = await fetch("http://localhost:5281/api/Members", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(inviteMemberForm),
    });

    if (!response.ok) {
      throw new Error("Failed to save member.");
    }

    const savedMember = await response.json();
















setMembers((prev) => [...prev, savedMember]);
setInviteMemberForm({
  fullName: "",
  email: "",
  role: "Musician",
});

setShowInviteMemberForm(false);
} catch (error) {
  console.error(error);
  alert("Could not save member.");
}
};

const deleteMember = async (memberId) => {
  const confirmDelete = window.confirm("Delete this member?");

  if (!confirmDelete) return;

  try {
    const response = await fetch(`http://localhost:5281/api/Members/${memberId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete member.");
    }

    setMembers((prev) => prev.filter((member) => member.id !== memberId));
  } catch (error) {
    console.error(error);
    alert("Could not delete member.");
  }
};
const updateMemberRole = async (memberId, newRole) => {
  try {
    const memberToUpdate = members.find((m) => m.id === memberId);

    const response = await fetch(`http://localhost:5281/api/Members/${memberId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...memberToUpdate,
        role: newRole,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to update role.");
    }

    const updatedMember = await response.json();

    setMembers((prev) =>
      prev.map((member) =>
        member.id === memberId ? updatedMember : member
      )
    );
  } catch (error) {
    console.error(error);
    alert("Could not update member role.");
  }
};











  useEffect(() => {
    loadSongs();
    loadSongSuggestions();
    loadAttendanceRecords();
    loadMembers();
    loadRehearsals();
  }, []);


const rejectSuggestion = async (id) => {
  await fetch(`${API_BASE}/api/SongSuggestions/${id}/reject`, {
    method: "PUT",
    headers: authHeaders,
  });

  loadSongSuggestions();
};

const addToSongLibrary = async (song) => {
  await fetch(`${API_BASE}/api/SongSuggestions/${song.id}/add-to-library`, {
    method: "POST",
    headers: authHeaders,
  });

  await loadSongs();
  alert(`${song.title} added to Song Library`);
};
  const openAddSongForm = () => {
    setEditingSongId(null);
    setSongForm(emptySongForm);
    setFormError("");
    setShowSongForm(true);
  };

  const openEditSongForm = (song) => {
    setEditingSongId(song.id);
    setSongForm({
      title: song.title || "",
      artist: song.artist || "",
      key: song.key || "",
      tempo: song.tempo || "",
      category: song.category || "Worship",
      youtubeLink: song.youtubeLink || "",
      notes: song.notes || "",
    });
    setFormError("");
    setShowSongForm(true);
  };

  const closeSongForm = () => {
    setShowSongForm(false);
    setEditingSongId(null);
    setSongForm(emptySongForm);
    setFormError("");
  };

  const saveSong = async (event) => {
    event.preventDefault();

    if (!songForm.title.trim()) {
      setFormError("Song title is required.");
      return;
    }

    const method = editingSongId ? "PUT" : "POST";
    const url = editingSongId
      ? `${API_BASE}/Songs/${editingSongId}`
      : `${API_BASE}/Songs`;

   const response = await fetch(url, {
  method,
  headers: authHeaders,
  body: JSON.stringify(songForm),
});

    if (!response.ok) {
      setFormError("Song could not be saved. Check your backend terminal.");
      return;
    }

    await loadSongs();
    closeSongForm();
  };

  
const deleteSong = async (song) => {
  const confirmed = window.confirm(
    `Delete ${song.title} from the library?`
  );

  if (!confirmed) return;
  
   const response = await fetch(`${API_BASE}/Songs/${song.id}`, {
  method: "DELETE",
  headers: authHeaders,
});

    if (!response.ok) {
      alert("Song could not be deleted. Check your backend terminal.");
      return;
    }

    await loadSongs();
  };
const deleteRehearsal = async (rehearsal) => {
  const confirmDelete = window.confirm(
    `Delete rehearsal "${rehearsal.title}"?`
  );

  if (!confirmDelete) return;

  try {
    const response = await fetch(
     `${API_BASE}/api/RehearsalEvents/${rehearsal.id}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to delete rehearsal");
    }

    setRehearsals((prev) =>
      prev.filter((item) => item.id !== rehearsal.id)
    );
  } catch (error) {
    console.error(error);
    alert("Could not delete rehearsal.");
  }
};
  const openAddRehearsalForm = () => {
    setEditingRehearsalId(null);
    setRehearsalForm({
      ...emptyRehearsalForm,
      eventDate: getTodayDate(),
      songIds: songs.slice(0, 3).map((song) => song.id),
    });
    setRehearsalError("");
    setShowRehearsalForm(true);
  };

  const openEditRehearsalForm = (rehearsal) => {
    setEditingRehearsalId(rehearsal.id);
    setRehearsalForm({
      title: rehearsal.title || "",
      eventDate: rehearsal.eventDate || "",
      eventTime: rehearsal.eventTime || "19:00",
      location: rehearsal.location || "Main Sanctuary",
      notes: rehearsal.notes || "",
      songIds: rehearsal.songIds || [],
    });
    setRehearsalError("");
    setShowRehearsalForm(true);
  };

  const closeRehearsalForm = () => {
    setShowRehearsalForm(false);
    setEditingRehearsalId(null);
    setRehearsalForm(emptyRehearsalForm);
    setRehearsalError("");
  };

  const toggleRehearsalSong = (songId) => {
    setRehearsalForm((prev) => {
      const alreadySelected = prev.songIds.includes(songId);

      return {
        ...prev,
        songIds: alreadySelected
          ? prev.songIds.filter((id) => id !== songId)
          : [...prev.songIds, songId],
      };
    });
  };

  const saveRehearsal = async (event) => {
  event.preventDefault();

  if (!rehearsalForm.title.trim()) {
    setRehearsalError("Rehearsal title is required.");
    return;
  }

  if (!rehearsalForm.eventDate) {
    setRehearsalError("Rehearsal date is required.");
    return;
  }

  try {
   const response = await fetch(
  editingRehearsalId
    ? `${API_BASE}/api/RehearsalEvents/${editingRehearsalId}`
    : `${API_BASE}/api/RehearsalEvents`,
  {
    method: editingRehearsalId ? "PUT" : "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
  title: rehearsalForm.title,
  eventDate: rehearsalForm.eventDate,
  time: rehearsalForm.time,
  location: rehearsalForm.location,
  notes: rehearsalForm.notes,
}),
  }
);

    if (!response.ok) {
      throw new Error("Failed to save rehearsal.");
    }

    const savedRehearsal = await response.json();

    if (editingRehearsalId) {
  setRehearsals((prev) =>
    prev.map((item) =>
      item.id === editingRehearsalId ? savedRehearsal : item
    )
  );
} else {
  setRehearsals((prev) => [...prev, savedRehearsal]);
}

    setRehearsalForm(emptyRehearsalForm);
    setShowRehearsalForm(false);
    setRehearsalError("");
  } catch (error) {
    console.error(error);
    setRehearsalError("Could not save rehearsal.");
  }
};
  const seedAttendanceRecords = async (rehearsalEventId) => {
    const defaultTeam = [
      { memberName: "Marcus Johnson", role: "Keyboard", status: "Confirmed" },
      { memberName: "Tiana Brooks", role: "Lead Vocal", status: "Pending" },
      { memberName: "James Carter", role: "Drums", status: "Declined" },
      { memberName: "Ashley Green", role: "Background Vocal", status: "Confirmed" },
      { memberName: "Brian Miller", role: "Bass", status: "Pending" },
      { memberName: "Denise Carter", role: "Choir Lead", status: "Confirmed" },
    ];

    try {
      const createdRecords = await Promise.all(
        defaultTeam.map(async (member) => {
          const response = await fetch(`${API_BASE}/api/AttendanceRecords`, {
            method: "POST",
           headers: authHeaders,
            body: JSON.stringify({
              rehearsalEventId,
              memberName: member.memberName,
              role: member.role,
              status: member.status,
            }),
          });

          return response.json();
        })
      );

      setAttendanceRecords((prev) => [...prev, ...createdRecords]);
    } catch (error) {
      console.error("Failed to seed attendance records", error);
    }
  };

  const updateAttendanceStatus = async (recordId, status) => {
    try {
      const response = await fetch(
        `${API_BASE}/api/AttendanceRecords/${recordId}/status`,
        {
          method: "PUT",
          headers: authHeaders,
          body: JSON.stringify(status),
        }
      );

      if (!response.ok) {
        alert("Attendance could not be updated. Check your backend terminal.");
        return;
      }

      const updatedRecord = await response.json();

      setAttendanceRecords((prev) =>
        prev.map((record) =>
          record.id === updatedRecord.id ? updatedRecord : record
        )
      );
    } catch (error) {
      console.error("Failed to update attendance", error);
      alert("Attendance could not be updated. Check your backend terminal.");
    }
  };

  const getAttendanceByRehearsal = (rehearsalEventId) => {
    return attendanceRecords.filter(
      (record) => record.rehearsalEventId === rehearsalEventId
    );
  };

  const categories = useMemo(() => {
    const values = songs
      .map((song) => song.category)
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));

    return ["All", ...new Set(values)];
  }, [songs]);

  const keys = useMemo(() => {
    const values = songs
      .map((song) => song.key)
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));

    return ["All", ...new Set(values)];
  }, [songs]);

  const filteredSongs = songs.filter((song) => {
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      song.title?.toLowerCase().includes(search) ||
      song.artist?.toLowerCase().includes(search) ||
      song.category?.toLowerCase().includes(search) ||
      song.key?.toLowerCase().includes(search);

    const matchesCategory =
      categoryFilter === "All" || song.category === categoryFilter;

    const matchesKey = keyFilter === "All" || song.key === keyFilter;

    return matchesSearch && matchesCategory && matchesKey;
  });

  const pendingSuggestions = songSuggestions.filter(
    (s) => s.status === "Pending"
  );

  const recentSongs = songs.slice(-3).reverse();
  const upcomingRehearsal = rehearsals[0];
const upcomingSongs =
  upcomingRehearsal?.songIds?.length > 0
    ? songs.filter((song) => upcomingRehearsal.songIds.includes(song.id))
    : [];
  const upcomingAttendance = upcomingRehearsal
    ? getAttendanceByRehearsal(upcomingRehearsal.id)
    : [];
  const confirmedCount = upcomingAttendance.filter(
    (record) => record.status === "Confirmed"
  ).length;
  const pendingCount = upcomingAttendance.filter(
    (record) => record.status === "Pending"
  ).length;
  const declinedCount = upcomingAttendance.filter(
    (record) => record.status === "Declined"
  ).length;
  const totalAttendance = upcomingAttendance.length || 1;
  const confirmedPercentage = Math.round((confirmedCount / totalAttendance) * 100);

  useEffect(() => {
    if (!attendanceLoaded || !upcomingRehearsal) return;

    const recordsForRehearsal = getAttendanceByRehearsal(upcomingRehearsal.id);

    if (recordsForRehearsal.length === 0) {
      seedAttendanceRecords(upcomingRehearsal.id);
    }
  }, [attendanceLoaded, upcomingRehearsal?.id]);

  const navItems = [
    { name: "Dashboard", icon: LayoutDashboard, roles: ["Admin", "Musician", "Choir Member"] },
    { name: "Song Library", icon: Music, roles: ["Admin", "Musician", "Choir Member"] },
    { name: "Suggestions", icon: Lightbulb, roles: ["Admin", "Musician"] },
    { name: "Rehearsals", icon: CalendarDays, roles: ["Admin", "Musician", "Choir Member"] },
    { name: "Attendance", icon: ClipboardCheck, roles: ["Admin", "Musician", "Choir Member"] },
    { name: "Members", icon: Users, roles: ["Admin"] },
    { name: "Settings", icon: Settings, roles: ["Admin"] },
  ];

  const visibleNavItems = navItems.filter((item) =>
    item.roles.includes(currentRole)
  );

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <button
        onClick={() => setSidebarOpen(true)}
        className="fixed left-4 top-4 z-50 rounded-xl bg-amber-400 p-3 text-slate-950 lg:hidden"
      >
        <Menu size={22} />
      </button>

     <div className="flex min-h-screen flex-col lg:flex-row">
       <aside
  className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-white/10 bg-slate-950 p-5 transition-transform duration-300 lg:sticky lg:top-0 lg:translate-x-0 ${
    sidebarOpen ? "translate-x-0" : "-translate-x-full"
  }`}
>
          <div className="flex items-center justify-between">
            <p className="text-sm font-black uppercase tracking-[0.35em] text-amber-300">
              Rehearsal Room
            </p>

            <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
              <X />
            </button>
          </div>

          <nav className="mt-10 space-y-3">
            {visibleNavItems.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.name}
                  onClick={() => {
                    setActiveTab(item.name);
                    setSidebarOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left font-bold transition-all hover:scale-[1.02] ${
                    activeTab === item.name
                      ? "bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/20"
                      : "bg-white/5 text-slate-200 hover:bg-white/10"
                  }`}
                >
                  <Icon size={20} />
                  {item.name}
                </button>
              );
            })}
          </nav>
        </aside>

        <section className="flex-1 p-4 pt-20 pb-24 lg:p-8 lg:pb-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-300">
                Admin Dashboard
              </p>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h1 className="mt-3 text-2xl font-black md:text-3xl">{activeTab}</h1>
                  <p className="mt-2 text-sm text-slate-400">
                    Logged in as {currentRole}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {["Admin", "Musician", "Choir Member"].map((role) => (
                    <button
                      key={role}
                      onClick={() => {
                        setCurrentRole(role);

                        if (
                          role !== "Admin" &&
                          ["Members", "Settings"].includes(activeTab)
                        ) {
                          setActiveTab("Dashboard");
                        }

                        if (role === "Choir Member" && activeTab === "Suggestions") {
                          setActiveTab("Dashboard");
                        }
                      }}
                      className={`rounded-2xl px-4 py-2 text-sm font-black transition-all ${
                        currentRole === role
                          ? "bg-amber-400 text-slate-950"
                          : "bg-white/10 text-slate-300 hover:bg-white/15"
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="relative rounded-3xl border border-white/10 bg-white/5 p-4">
              <Bell className="text-amber-300" />
              {pendingSuggestions.length > 0 && (
                <span className="absolute -right-2 -top-2 rounded-full bg-red-500 px-2 text-xs font-bold">
                  {pendingSuggestions.length}
                </span>
              )}
            </div>
          </div>

          {activeTab === "Dashboard" && (
            <div className="mt-8 space-y-8">
              {showAnnouncementForm && (
  <div className="rounded-3xl border border-amber-400/30 bg-amber-400/10 p-5 shadow-xl">
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-2xl font-black">Post Announcement</h3>
        <p className="mt-1 text-sm text-amber-100/80">
          Send an update to the worship team.
        </p>
      </div>

      <button
        onClick={() => setShowAnnouncementForm(false)}
        className="rounded-xl bg-slate-950 p-2 text-slate-300 hover:text-white"
      >
        <X size={20} />
      </button>
    </div>

    <div className="mt-5 grid gap-4">
      <SongInput
        label="Announcement Title"
        value={announcementForm.title}
        onChange={(value) =>
          setAnnouncementForm((prev) => ({
            ...prev,
            title: value,
          }))
        }
        placeholder="Choir rehearsal moved to 7:30 PM"
      />

      <label>
        <span className="text-sm font-bold text-slate-200">Message</span>

        <textarea
          value={announcementForm.message}
          onChange={(e) =>
            setAnnouncementForm((prev) => ({
              ...prev,
              message: e.target.value,
            }))
          }
          placeholder="Type announcement..."
          className="mt-2 min-h-28 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-amber-400"
        />
      </label>

     {canPostAnnouncements && (
  <button
    onClick={() => {
      setShowAnnouncementForm(false);
    }}
    className="rounded-2xl bg-amber-400 px-5 py-3 font-black text-black"
  >
    Post Announcement
  </button>
)}
    </div>
  </div>
)}

{showInviteMemberForm && (
  <div className="rounded-3xl border border-blue-400/30 bg-blue-400/10 p-5 shadow-xl">
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-2xl font-black">Invite Member</h3>

        <p className="mt-1 text-sm text-blue-100/80">
          Invite a new worship team member.
        </p>
      </div>

      <button
        onClick={() => setShowInviteMemberForm(false)}
        className="rounded-xl bg-slate-950 p-2 text-slate-300 hover:text-white"
      >
        <X size={20} />
      </button>
    </div>

    <div className="mt-5 grid gap-4 md:grid-cols-2">
      <SongInput
        label="Full Name"
        value={inviteMemberForm.fullName}
        onChange={(value) =>
          setInviteMemberForm((prev) => ({
            ...prev,
            fullName: value,
          }))
        }
        placeholder="John Smith"
      />
      <SongInput
  label="Email"
  value={inviteMemberForm.email}
  onChange={(value) =>
    setInviteMemberForm((prev) => ({
      ...prev,
      email: value,
    }))
  }
  placeholder="john@example.com"
/>

<div>
  <label className="mb-2 block text-sm font-bold text-white">
    Role
  </label>

  <select
    value={inviteMemberForm.role}
    onChange={(e) =>
      setInviteMemberForm((prev) => ({
        ...prev,
        role: e.target.value,
      }))
    }
    className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none"
  >
    <option value="Musician">Musician</option>
    <option value="Choir Member">Choir Member</option>
    <option value="Admin">Admin</option>
  </select>
</div>


<div className="mt-5 grid gap-4 md:grid-cols-2">
  <SongInput
    label="Full Name"
    value={inviteMemberForm.fullName}
    onChange={(value) =>
      setInviteMemberForm((prev) => ({
        ...prev,
        fullName: value,
      }))
    }
    placeholder="John Smith"
  />

  <SongInput
    label="Email"
    value={inviteMemberForm.email}
    onChange={(value) =>
      setInviteMemberForm((prev) => ({
        ...prev,
        email: value,
      }))
    }
    placeholder="john@example.com"
  />

  <div>
    <label className="mb-2 block text-sm font-bold text-white">
      Role
    </label>

    <select
      value={inviteMemberForm.role}
      onChange={(e) =>
        setInviteMemberForm((prev) => ({
          ...prev,
          role: e.target.value,
        }))
      }
      className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none"
    >
      <option value="Musician">Musician</option>
      <option value="Choir Member">Choir Member</option>
      <option value="Admin">Admin</option>
    </select>
  </div>
</div>

<button
  onClick={handleInviteMember}
  className="mt-6 rounded-2xl bg-yellow-400 px-6 py-3 font-bold text-black transition hover:scale-105"
>
  Send Invite
</button>






      <SongInput
        label="Email"
        value={inviteMemberForm.email}
        onChange={(value) =>
          setInviteMemberForm((prev) => ({
            ...prev,
            email: value,
          }))
        }
        placeholder="member@email.com"
      />

      <label className="md:col-span-2">
        <span className="text-sm font-bold text-slate-200">
          Role
        </span>

        <select
          value={inviteMemberForm.role}
          onChange={(e) =>
            setInviteMemberForm((prev) => ({
              ...prev,
              role: e.target.value,
            }))
          }
          className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-400"
        >
          <option>Choir Member</option>
          <option>Musician</option>
          <option>Admin</option>
        </select>
      </label>

      <button
        onClick={() => {
          if (!inviteMemberForm.fullName.trim()) return;

          setInvitedMembers((prev) => [
            {
              id: Date.now(),
              ...inviteMemberForm,
            },
            ...prev,
          ]);

          setInviteMemberForm({
            fullName: "",
            email: "",
            role: "Choir Member",
          });

          setShowInviteMemberForm(false);
        }}
        className="md:col-span-2 rounded-2xl bg-blue-400 px-5 py-3 font-black text-slate-950"
      >
        Send Invitation
      </button>
    </div>
  </div>
)}


              <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-amber-400/10 p-5 shadow-2xl">
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-300">
                  Welcome Back
                </p>
                <h2 className="mt-3 text-3xl font-black">
                  Choir Director Command Center 🎵
                </h2>
                <p className="mt-3 max-w-2xl text-slate-300">
                  Manage rehearsals, song approvals, attendance, and team
                  preparation from one place.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  {isAdmin && (
                    <>
                     {canManageSongs && (
  <QuickButton
    icon={Plus}
    label="Add Song"
    onClick={() => {
      setActiveTab("Song Library");
      openAddSongForm();
    }}
  />
)}
                    {canManageRehearsals && (
  <QuickButton
    icon={CalendarDays}
    label="Create Rehearsal"
    onClick={() => {
      setActiveTab("Rehearsals");
      openAddRehearsalForm();
    }}
  />
)}
                     <QuickButton
  icon={Users}
  label="Invite Member"
  onClick={() => setShowInviteMemberForm(true)}
/>
                    <QuickButton
  icon={Megaphone}
  label="Post Announcement"
  onClick={() => setShowAnnouncementForm(true)}
/>
                    </>
                  )}

                  {!isAdmin && (
                    <p className="rounded-2xl bg-white/10 px-4 py-2.5 text-sm font-bold text-slate-300">
                      View rehearsals, setlists, songs, and attendance from here.
                    </p>
                  )}
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-4">
                <StatCard title="Songs in Library" value={songs.length} />
                <StatCard title="Rehearsals" value={rehearsals.length} />
                <StatCard
                  title="Song Suggestions"
                  value={songSuggestions.length}
                />
                <StatCard
                  title="Pending Review"
                  value={pendingSuggestions.length}
                />
              </div>

              <div className="grid gap-6 xl:grid-cols-2">
                <DashboardCard title="Upcoming Rehearsal">
                  {upcomingRehearsal ? (
                    <>
                      <p className="text-xs font-bold uppercase tracking-[0.25em] text-amber-300">
                        {formatRehearsalDate(upcomingRehearsal.eventDate)} • {formatTime(upcomingRehearsal.eventTime)}
                      </p>
                      <h3 className="mt-2 text-2xl font-black">
                        {upcomingRehearsal.title}
                      </h3>
                      <p className="mt-1 text-sm text-slate-400">
                        {upcomingRehearsal.location}
                      </p>

                      <div className="mt-5 space-y-3">
                        {upcomingSongs.map((song) => (
                          <div
                            key={song.id}
                            className="rounded-2xl bg-slate-900 px-4 py-3 font-bold"
                          >
                            {song.title}
                          </div>
                        ))}
                      </div>

                      {upcomingRehearsal.notes && (
                        <p className="mt-5 rounded-2xl bg-amber-400/10 p-4 text-sm text-amber-200">
                          Notes: {upcomingRehearsal.notes}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-slate-400">No rehearsal scheduled yet.</p>
                  )}
                </DashboardCard>

                <DashboardCard title="Team Attendance">
                  <div className="grid gap-4 md:grid-cols-3">
                    <MiniStat label="Confirmed" value={confirmedCount} />
                    <MiniStat label="Pending" value={pendingCount} />
                    <MiniStat label="Declined" value={declinedCount} />
                  </div>

                  <div className="mt-5 h-3 rounded-full bg-slate-800">
                    <div
                      className="h-3 rounded-full bg-emerald-400"
                      style={{ width: `${confirmedPercentage}%` }}
                    />
                  </div>

                  <p className="mt-3 text-sm text-slate-400">
                    {confirmedPercentage}% of the team has confirmed.
                  </p>
                </DashboardCard>
{announcements.length > 0 && (
  <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-300">
          Team Updates
        </p>

        <h3 className="mt-2 text-2xl font-black">
          Announcements
        </h3>
      </div>
    </div>

    <div className="mt-6 space-y-4">
      {announcements.map((announcement) => (
        <div
          key={announcement.id}
          className="rounded-2xl border border-white/10 bg-slate-950/60 p-5"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h4 className="text-lg font-black text-white">
                {announcement.title}
              </h4>

              <p className="mt-2 text-sm text-slate-300">
                {announcement.message}
              </p>
            </div>

            <span className="rounded-full bg-amber-400/20 px-3 py-1 text-xs font-bold text-amber-300">
              {announcement.audience}
            </span>
          </div>
        </div>
      ))}
    </div>
  </div>
)}

{invitedMembers.length > 0 && (
  <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-blue-300">
          Team Management
        </p>

        <h3 className="mt-2 text-2xl font-black">
          Invited Members
        </h3>
      </div>
    </div>

    <div className="mt-6 space-y-4">
      {invitedMembers.map((member) => (
        <div
          key={member.id}
          className="rounded-2xl border border-white/10 bg-slate-950/60 p-5"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h4 className="text-lg font-black text-white">
                {member.fullName}
              </h4>

              <p className="mt-2 text-sm text-slate-300">
                {member.email}
              </p>
              {isAdmin && (
  <select
    value={member.role}
    onChange={(e) => updateMemberRole(member.id, e.target.value)}
    className="mt-4 rounded-xl border border-white/10 bg-slate-800 px-3 py-2 text-sm text-white"
  >
    <option value="Admin">Admin</option>
    <option value="Musician">Musician</option>
    <option value="Choir Member">Choir Member</option>
  </select>
)}
            </div>

            <span className="rounded-full bg-blue-400/20 px-3 py-1 text-xs font-bold text-blue-300">
              {member.role}
            </span>
          </div>
        </div>
      ))}
    </div>
  </div>
)}









                <DashboardCard title="Recent Song Activity">
                  <div className="space-y-3">
                    {recentSongs.length > 0 ? (
                      recentSongs.map((song) => (
                        <div
                          key={song.id}
                          className="flex items-center justify-between rounded-2xl bg-slate-900 px-4 py-3"
                        >
                          <span className="font-bold">{song.title}</span>
                          <span className="text-xs text-slate-400">
                            Added recently
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-400">No recent songs yet.</p>
                    )}
                  </div>
                </DashboardCard>

                <DashboardCard title="Pending Suggestions">
                  <div className="space-y-3">
                    {pendingSuggestions.length > 0 ? (
                      pendingSuggestions.map((song) => (
                        <div
                          key={song.id}
                          className="rounded-2xl bg-slate-900 px-4 py-3"
                        >
                          <p className="font-bold">{song.title}</p>
                          <p className="text-sm text-slate-400">
                            Suggested by {song.suggestedBy}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-400">
                        No pending suggestions right now.
                      </p>
                    )}
                  </div>
                </DashboardCard>

                <DashboardCard title="Notification Center">
                  <div className="space-y-3">
                    <Notification text="New song suggestion workflow is active." />
                    <Notification text="Song Library management is ready." />
                    <Notification text="Rehearsals can now pull from real songs." />
                  </div>
                </DashboardCard>
              </div>
            </div>
          )}

          {activeTab === "Song Library" && (
            <div className="mt-8 space-y-6">
              <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-slate-900 p-5 shadow-xl">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-300">
                      Real Management
                    </p>
                    <h2 className="mt-2 text-3xl font-black">Song Library</h2>
                    <p className="mt-2 text-sm text-slate-300">
                      Add, edit, delete, search, filter, and open rehearsal links.
                    </p>
                  </div>

                  {isAdmin && (
                    <button
                      onClick={openAddSongForm}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-400 px-5 py-3 font-black text-slate-950 transition-all hover:scale-[1.03]"
                    >
                      <Plus size={18} />
                      Add Song
                    </button>
                  )}
                </div>

                <div className="mt-6 grid gap-3 lg:grid-cols-[1.5fr_1fr_1fr]">
                  <div className="flex items-center gap-3 rounded-2xl bg-slate-950 px-4 py-3">
                    <Search size={18} className="text-slate-400" />
                    <input
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search by title, artist, key, or category..."
                      className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                    />
                  </div>

                  <FilterSelect
                    icon={SlidersHorizontal}
                    value={categoryFilter}
                    onChange={setCategoryFilter}
                    options={categories}
                    label="Category"
                  />

                  <FilterSelect
                    icon={Music}
                    value={keyFilter}
                    onChange={setKeyFilter}
                    options={keys}
                    label="Key"
                  />
                </div>
              </div>

              {showSongForm && (
                <div className="rounded-3xl border border-amber-400/30 bg-amber-400/10 p-5 shadow-xl">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-2xl font-black">
                        {editingSongId ? "Edit Song" : "Add New Song"}
                      </h3>
                      <p className="mt-1 text-sm text-amber-100/80">
                        Fill in the details for the worship team.
                      </p>
                    </div>

                    <button
                      onClick={closeSongForm}
                      className="rounded-xl bg-slate-950 p-2 text-slate-300 hover:text-white"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  {formError && (
                    <p className="mt-4 rounded-2xl bg-red-500/20 px-4 py-3 text-sm font-bold text-red-200">
                      {formError}
                    </p>
                  )}

                  <form onSubmit={saveSong} className="mt-5 grid gap-4 lg:grid-cols-2">
                    <SongInput
                      label="Title"
                      value={songForm.title}
                      onChange={(value) =>
                        setSongForm((prev) => ({ ...prev, title: value }))
                      }
                      placeholder="Firm Foundation"
                    />

                    <SongInput
                      label="Artist"
                      value={songForm.artist}
                      onChange={(value) =>
                        setSongForm((prev) => ({ ...prev, artist: value }))
                      }
                      placeholder="Cody Carnes"
                    />

                    <SongInput
                      label="Key"
                      value={songForm.key}
                      onChange={(value) =>
                        setSongForm((prev) => ({ ...prev, key: value }))
                      }
                      placeholder="C"
                    />

                    <SongInput
                      label="Tempo"
                      value={songForm.tempo}
                      onChange={(value) =>
                        setSongForm((prev) => ({ ...prev, tempo: value }))
                      }
                      placeholder="72 BPM"
                    />

                    <SongInput
                      label="Category"
                      value={songForm.category}
                      onChange={(value) =>
                        setSongForm((prev) => ({ ...prev, category: value }))
                      }
                      placeholder="Worship"
                    />

                    <SongInput
                      label="YouTube Link"
                      value={songForm.youtubeLink}
                      onChange={(value) =>
                        setSongForm((prev) => ({ ...prev, youtubeLink: value }))
                      }
                      placeholder="https://youtube.com/..."
                    />

                    <label className="lg:col-span-2">
                      <span className="text-sm font-bold text-slate-200">Notes</span>
                      <textarea
                        value={songForm.notes}
                        onChange={(e) =>
                          setSongForm((prev) => ({
                            ...prev,
                            notes: e.target.value,
                          }))
                        }
                        placeholder="Transitions, arrangement notes, who leads, etc."
                        className="mt-2 min-h-28 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-amber-400"
                      />
                    </label>

                    <div className="lg:col-span-2 flex flex-col gap-3 sm:flex-row">
                      <button
                        type="submit"
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-400 px-5 py-3 font-black text-slate-950 transition-all hover:scale-[1.02]"
                      >
                        <Save size={18} />
                        {editingSongId ? "Save Changes" : "Save Song"}
                      </button>

                      <button
                        type="button"
                        onClick={closeSongForm}
                        className="rounded-2xl bg-white/10 px-5 py-3 font-bold text-slate-200 hover:bg-white/15"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filteredSongs.length > 0 ? (
                  filteredSongs.map((song) => (
                    <div
                      key={song.id}
                      className="rounded-3xl border border-white/10 bg-slate-900 p-5 shadow-xl transition-all hover:-translate-y-1 hover:bg-slate-800"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-xl font-black">{song.title}</h3>
                          <p className="mt-1 text-sm text-slate-400">
                            {song.artist || "Artist not set"}
                          </p>
                        </div>

                        <span className="rounded-full bg-amber-400/20 px-3 py-1 text-xs font-bold text-amber-300">
                          {song.category || "No category"}
                        </span>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <SongPill label={`Key: ${song.key || "Not set"}`} />
                        <SongPill label={`Tempo: ${song.tempo || "Not set"}`} />
                      </div>

                      {song.notes && (
                        <p className="mt-4 rounded-2xl bg-slate-950 p-4 text-sm text-slate-300">
                          {song.notes}
                        </p>
                      )}

                      <div className="mt-5 flex flex-wrap gap-3">
                        {song.youtubeLink && (
                          <a
                            href={song.youtubeLink}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-4 py-2 font-bold text-slate-950"
                          >
                            <PlayCircle size={18} />
                            Watch
                          </a>
                        )}

                        {isAdmin && (
                          <>
                            <button
                              onClick={() => openEditSongForm(song)}
                              className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 font-bold text-slate-200 hover:bg-white/15"
                            >
                              <Pencil size={17} />
                              Edit
                            </button>

                            <button
                              onClick={() => deleteSong(song)}
                              className="inline-flex items-center gap-2 rounded-xl bg-red-500/20 px-4 py-2 font-bold text-red-200 hover:bg-red-500/30"
                            >
                              <Trash2 size={17} />
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-slate-300 md:col-span-2 xl:col-span-3">
                    No songs found. Add a song or adjust your filters.
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "Suggestions" && !isChoirMember && (
            <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl">
              <h2 className="text-2xl font-bold">Song Suggestions</h2>

              <div className="mt-6 space-y-5">
                {songSuggestions.map((song) => (
                  <div
                    key={song.id}
                    className="rounded-3xl border border-white/10 bg-slate-900 p-5 transition-all hover:-translate-y-1 hover:bg-slate-800"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <h3 className="text-2xl font-bold">{song.title}</h3>
                        <p className="mt-2 text-sm text-slate-400">
                          Artist: {song.artist || "Unknown"}
                        </p>
                        <p className="text-sm text-slate-400">
                          Suggested by {song.suggestedBy}
                        </p>
                        <p className="mt-4 text-slate-300">“{song.reason}”</p>
                      </div>

                      <StatusBadge status={song.status} />
                    </div>

                   {song.status === "Pending" && isAdmin && (
                      <div className="mt-6 flex gap-3">
                        <button
                          onClick={() => approveSuggestion(song.id)}
                          className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 font-bold text-slate-950"
                        >
                          <CheckCircle size={18} />
                          Approve
                        </button>

                        <button
                          onClick={() => rejectSuggestion(song.id)}
                          className="inline-flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2 font-bold text-white"
                        >
                          <XCircle size={18} />
                          Reject
                        </button>
                      </div>
                    )}

                    {song.status === "Approved" && isAdmin && (
                      <button
                        onClick={() => addToSongLibrary(song)}
                        className="mt-6 rounded-xl bg-amber-400 px-4 py-2 font-bold text-slate-950"
                      >
                        Add to Song Library
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "Rehearsals" && (
            <div className="mt-8 space-y-6">
              <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-slate-900 p-5 shadow-xl">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-300">
                      Worship Planning
                    </p>
                    <h2 className="mt-2 text-3xl font-black">Rehearsals</h2>
                    <p className="mt-2 text-sm text-slate-300">
                      Create rehearsals and build setlists from your real Song Library.
                    </p>
                  </div>

                  {isAdmin && (
                    <button
                      onClick={openAddRehearsalForm}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-400 px-5 py-3 font-black text-slate-950 transition-all hover:scale-[1.03]"
                    >
                      <Plus size={18} />
                      Create Rehearsal
                    </button>
                  )}
                </div>
              </div>

              {showRehearsalForm && (
                <div className="rounded-3xl border border-amber-400/30 bg-amber-400/10 p-5 shadow-xl">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-2xl font-black">
                        {editingRehearsalId ? "Edit Rehearsal" : "Create Rehearsal"}
                      </h3>
                      <p className="mt-1 text-sm text-amber-100/80">
                        Pick songs from the live Song Library to create a setlist.
                      </p>
                    </div>

                    <button
                      onClick={closeRehearsalForm}
                      className="rounded-xl bg-slate-950 p-2 text-slate-300 hover:text-white"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  {rehearsalError && (
                    <p className="mt-4 rounded-2xl bg-red-500/20 px-4 py-3 text-sm font-bold text-red-200">
                      {rehearsalError}
                    </p>
                  )}

                  <form onSubmit={saveRehearsal} className="mt-5 grid gap-4 lg:grid-cols-2">
                    <SongInput
                      label="Rehearsal Title"
                      value={rehearsalForm.title}
                      onChange={(value) =>
                        setRehearsalForm((prev) => ({ ...prev, title: value }))
                      }
                      placeholder="Thursday Night Rehearsal"
                    />

                    <SongInput
                      label="Location"
                      value={rehearsalForm.location}
                      onChange={(value) =>
                        setRehearsalForm((prev) => ({ ...prev, location: value }))
                      }
                      placeholder="Main Sanctuary"
                    />

                    <label>
                      <span className="text-sm font-bold text-slate-200">Date</span>
                      <input
                        type="date"
                        value={rehearsalForm.eventDate}
                        onChange={(e) =>
                          setRehearsalForm((prev) => ({
                            ...prev,
                            eventDate: e.target.value,
                          }))
                        }
                        className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-amber-400"
                      />
                    </label>

                    <label>
                      <span className="text-sm font-bold text-slate-200">Time</span>
                      <input
                        type="time"
                        value={rehearsalForm.eventTime}
                        onChange={(e) =>
                          setRehearsalForm((prev) => ({
                            ...prev,
                            eventTime: e.target.value,
                          }))
                        }
                        className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-amber-400"
                      />
                    </label>

                    <label className="lg:col-span-2">
                      <span className="text-sm font-bold text-slate-200">Notes</span>
                      <textarea
                        value={rehearsalForm.notes}
                        onChange={(e) =>
                          setRehearsalForm((prev) => ({
                            ...prev,
                            notes: e.target.value,
                          }))
                        }
                        placeholder="Transitions, singers needed, rehearsal focus, etc."
                        className="mt-2 min-h-24 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-amber-400"
                      />
                    </label>

                    <div className="lg:col-span-2">
                      <div className="flex items-center gap-2">
                        <ListMusic size={18} className="text-amber-300" />
                        <span className="text-sm font-bold text-slate-200">
                          Choose Setlist Songs
                        </span>
                      </div>

                      <div className="mt-3 grid max-h-80 gap-3 overflow-y-auto rounded-3xl border border-white/10 bg-slate-950 p-4 md:grid-cols-2 xl:grid-cols-3">
                        {songs.length > 0 ? (
                          songs.map((song) => {
                            const selected = rehearsalForm.songIds.includes(song.id);

                            return (
                              <button
                                key={song.id}
                                type="button"
                                onClick={() => toggleRehearsalSong(song.id)}
                                className={`rounded-2xl border px-4 py-3 text-left transition-all ${
                                  selected
                                    ? "border-amber-400 bg-amber-400 text-slate-950"
                                    : "border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
                                }`}
                              >
                                <p className="font-black">{song.title}</p>
                                <p className="mt-1 text-xs opacity-80">
                                  {song.artist || "Artist not set"} • Key {song.key || "N/A"}
                                </p>
                              </button>
                            );
                          })
                        ) : (
                          <p className="text-slate-400 md:col-span-2 xl:col-span-3">
                            Add songs to the Song Library first.
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="lg:col-span-2 flex flex-col gap-3 sm:flex-row">
                      <button
                        type="submit"
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-400 px-5 py-3 font-black text-slate-950 transition-all hover:scale-[1.02]"
                      >
                        <Save size={18} />
                        {editingRehearsalId ? "Save Changes" : "Save Rehearsal"}
                      </button>

                      <button
                        type="button"
                        onClick={closeRehearsalForm}
                        className="rounded-2xl bg-white/10 px-5 py-3 font-bold text-slate-200 hover:bg-white/15"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="grid gap-5 xl:grid-cols-2">
                {rehearsals.length > 0 ? (
                  rehearsals.map((rehearsal) => {
                   const rehearsalSongs =
  rehearsal?.songIds?.length > 0
    ? songs.filter((song) => rehearsal.songIds.includes(song.id))
    : [];

                    return (
                      <div
                        key={rehearsal.id}
                        className="rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-xl transition-all hover:-translate-y-1 hover:bg-slate-800"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-300">
                              {formatRehearsalDate(rehearsal.eventDate)} • {formatTime(rehearsal.eventTime)}
                            </p>

                            <h3 className="mt-2 text-2xl font-black">
                              {rehearsal.title}
                            </h3>

                            <p className="mt-2 flex items-center gap-2 text-sm text-slate-400">
                              <MapPin size={16} />
                              {rehearsal.location || "Location not set"}
                            </p>
                          </div>

                          <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300">
                            Upcoming
                          </span>
                        </div>

                        <div className="mt-6 space-y-3">
                          {rehearsalSongs.length > 0 ? (
                            rehearsalSongs.map((song, index) => (
                              <div
                                key={song.id}
                                className="flex items-center justify-between rounded-2xl bg-slate-950 px-4 py-3"
                              >
                                <div>
                                  <p className="font-bold">
                                    {index + 1}. {song.title}
                                  </p>
                                  <p className="mt-1 text-xs text-slate-500">
                                    {song.artist || "Artist not set"} • Key {song.key || "N/A"}
                                  </p>
                                </div>

                                {song.youtubeLink && (
                                  <a
                                    href={song.youtubeLink}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="rounded-xl bg-amber-400 px-3 py-2 text-xs font-black text-slate-950"
                                  >
                                    Watch
                                  </a>
                                )}
                              </div>
                            ))
                          ) : (
                            <p className="rounded-2xl bg-slate-950 px-4 py-3 text-slate-400">
                              No songs attached yet.
                            </p>
                          )}
                        </div>

                        {rehearsal.notes && (
                          <div className="mt-6 rounded-2xl bg-amber-400/10 p-4 text-sm text-amber-200">
                            Notes: {rehearsal.notes}
                          </div>
                        )}

                        <div className="mt-6 flex flex-wrap gap-3">
                          {isAdmin && (
                            <>
                              <button
                                onClick={() => openEditRehearsalForm(rehearsal)}
                                className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 font-bold text-slate-200 hover:bg-white/15"
                              >
                                <Pencil size={17} />
                                Edit
                              </button>

                              <button
                                onClick={() => deleteRehearsal(rehearsal)}
                                className="inline-flex items-center gap-2 rounded-xl bg-red-500/20 px-4 py-2 font-bold text-red-200 hover:bg-red-500/30"
                              >
                                <Trash2 size={17} />
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-slate-300 xl:col-span-2">
                    No rehearsals yet. Create your first rehearsal and choose songs from the library.
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "Attendance" && (
            <div className="mt-8 space-y-6">
              <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-slate-900 p-5 shadow-xl">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-300">
                      Live Team Tracking
                    </p>
                    <h2 className="mt-2 text-3xl font-black">Attendance</h2>
                    <p className="mt-2 text-sm text-slate-300">
                      Confirmations now save to your database and stay after refresh.
                    </p>
                  </div>

                  <button
                    onClick={loadAttendanceRecords}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white/10 px-5 py-3 font-black text-slate-200 transition-all hover:scale-[1.03] hover:bg-white/15"
                  >
                    <Clock size={18} />
                    Refresh Status
                  </button>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-3">
                <div className="rounded-3xl border border-white/10 bg-emerald-500/10 p-5">
                  <p className="text-4xl font-black text-emerald-300">
                    {confirmedCount}
                  </p>
                  <p className="mt-2 text-emerald-100">Confirmed</p>
                </div>

                <div className="rounded-3xl border border-white/10 bg-amber-400/10 p-5">
                  <p className="text-4xl font-black text-amber-300">
                    {pendingCount}
                  </p>
                  <p className="mt-2 text-amber-100">Pending</p>
                </div>

                <div className="rounded-3xl border border-white/10 bg-red-500/10 p-5">
                  <p className="text-4xl font-black text-red-300">
                    {declinedCount}
                  </p>
                  <p className="mt-2 text-red-100">Declined</p>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-xl">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="text-2xl font-black">
                      {upcomingRehearsal?.title || "Upcoming Rehearsal Team"}
                    </h3>
                    <p className="mt-1 text-sm text-slate-400">
                      {upcomingRehearsal
                        ? `${upcomingRehearsal.location} • ${formatTime(
                            upcomingRehearsal.eventTime
                          )}`
                        : "Create a rehearsal first"}
                    </p>
                  </div>

                  <span className="rounded-full bg-emerald-500/20 px-4 py-2 text-xs font-bold text-emerald-300">
                    Database Live
                  </span>
                </div>

                {upcomingSongs.length > 0 && (
                  <div className="mt-6 rounded-3xl border border-white/10 bg-slate-950 p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <ListMusic size={18} className="text-amber-300" />
                      <p className="font-black">Upcoming Setlist</p>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                      {upcomingSongs.map((song) => (
                        <div
                          key={song.id}
                          className="rounded-2xl bg-white/5 px-4 py-3"
                        >
                          <p className="font-bold">{song.title}</p>
                          <p className="mt-1 text-xs text-slate-400">
                            Key {song.key || "N/A"}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-6 space-y-4">
                  {upcomingAttendance.length > 0 ? (
                    upcomingAttendance.map((member) => (
                      <div
                        key={member.id}
                        className="flex flex-col gap-4 rounded-2xl bg-slate-950 p-4 md:flex-row md:items-center md:justify-between"
                      >
                        <div>
                          <h4 className="text-lg font-black">
                            {member.memberName}
                          </h4>
                          <p className="text-sm text-slate-400">{member.role}</p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                          <span
                            className={`rounded-full px-4 py-2 text-xs font-bold ${
                              member.status === "Confirmed"
                                ? "bg-emerald-500/20 text-emerald-300"
                                : member.status === "Declined"
                                ? "bg-red-500/20 text-red-300"
                                : "bg-amber-400/20 text-amber-300"
                            }`}
                          >
                            {member.status}
                          </span>

                          <button
                            onClick={() =>
                              updateAttendanceStatus(member.id, "Confirmed")
                            }
                            className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-bold text-slate-950"
                          >
                            Confirm
                          </button>

                          <button
                            onClick={() =>
                              updateAttendanceStatus(member.id, "Pending")
                            }
                            className="rounded-xl bg-amber-400 px-4 py-2 text-sm font-bold text-slate-950"
                          >
                            Pending
                          </button>

                          <button
                            onClick={() =>
                              updateAttendanceStatus(member.id, "Declined")
                            }
                            className="rounded-xl bg-red-500 px-4 py-2 text-sm font-bold text-white"
                          >
                            Decline
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="rounded-2xl bg-slate-950 p-4 text-slate-400">
                      Loading attendance records...
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
         {activeTab === "Members" && (
  <section className="space-y-6">
    <div>
      <h2 className="text-4xl font-black text-white">
        Members
      </h2>

      <p className="mt-2 text-slate-300">
        Manage your worship team members.
      </p>
      
{canManageMembers && (
  <button
    onClick={() => setShowInviteMemberForm(true)}
    className="mt-5 rounded-2xl bg-yellow-400 px-6 py-3 font-bold text-black transition hover:scale-105"
  >
    + Invite Member
  </button>
)}
    </div>

    {showInviteMemberForm && (
  <div className="rounded-3xl border border-blue-400/30 bg-blue-400/10 p-5 shadow-xl">
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-2xl font-black">Invite Member</h3>

        <p className="mt-1 text-sm text-blue-100/80">
          Invite a new worship team member.
        </p>
      </div>

      <button
        onClick={() => setShowInviteMemberForm(false)}
        className="rounded-xl bg-slate-950 p-2 text-slate-300 hover:text-white"
      >
        <X size={20} />
      </button>
    </div>

    <div className="mt-5 grid gap-4 md:grid-cols-2">
      <SongInput
        label="Full Name"
        value={inviteMemberForm.fullName}
        onChange={(value) =>
          setInviteMemberForm((prev) => ({
            ...prev,
            fullName: value,
          }))
        }
        placeholder="John Smith"
      />

      <SongInput
        label="Email"
        value={inviteMemberForm.email}
        onChange={(value) =>
          setInviteMemberForm((prev) => ({
            ...prev,
            email: value,
          }))
        }
        placeholder="john@example.com"
      />

      <div>
        <label className="mb-2 block text-sm font-bold text-white">
          Role
        </label>

        <select
          value={inviteMemberForm.role}
          onChange={(e) =>
            setInviteMemberForm((prev) => ({
              ...prev,
              role: e.target.value,
            }))
          }
          className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none"
        >
          <option value="Musician">Musician</option>
          <option value="Choir Member">Choir Member</option>
          <option value="Admin">Admin</option>
        </select>
      </div>
    </div>

    <button
      onClick={handleInviteMember}
      className="mt-6 rounded-2xl bg-yellow-400 px-6 py-3 font-bold text-black transition hover:scale-105"
    >
      Send Invite
    </button>
  </div>
)}

    <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {members.map((member) => (
        <div
          key={member.id}
          className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl backdrop-blur"
        >
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-black text-white">
                {member.fullName}
              </h3>

              <p className="mt-1 text-sm text-slate-300">
                {member.email}
              </p>
              {isAdmin && (
  <button
    onClick={() => deleteMember(member.id)}
    className="mt-4 rounded-xl bg-red-500/20 px-4 py-2 text-sm font-bold text-red-200 transition hover:bg-red-500/30"
  >
    Delete Member
  </button>
)}
            </div>

            <span className="rounded-full bg-yellow-400/20 px-3 py-1 text-xs font-bold text-yellow-300">
              {member.role}
            </span>
          </div>
        </div>
      ))}
    </div>
  </section>
)}
          {activeTab === "Settings" && <PlaceholderPanel title="Settings" />}
        </section>
      </div>
    </main>
  );


function StatCard({ title, value }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl transition-all hover:-translate-y-1 hover:bg-white/10">
      <h2 className="text-3xl font-black text-white">{value}</h2>
      <p className="mt-2 text-slate-300">{title}</p>
    </div>
  );
}

function DashboardCard({ title, children }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl">
      <h2 className="text-2xl font-bold">{title}</h2>
      <div className="mt-5">{children}</div>
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-900 p-4">
      <p className="text-2xl font-black">{value}</p>
      <p className="text-sm text-slate-400">{label}</p>
    </div>
  );
}

function QuickButton({ icon: Icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-2xl bg-amber-400 px-4 py-2.5 font-bold text-slate-950 transition-all hover:scale-[1.03]"
    >
      <Icon size={18} />
      {label}
    </button>
  );
}

function Notification({ text }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-slate-900 px-4 py-2.5">
      <Clock size={16} className="text-amber-300" />
      <p className="text-sm text-slate-300">{text}</p>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles =
    status === "Approved"
      ? "bg-emerald-500/20 text-emerald-300"
      : status === "Rejected"
      ? "bg-red-500/20 text-red-300"
      : "bg-amber-400/20 text-amber-300";

  return (
    <span className={`rounded-full px-4 py-2 text-xs font-bold ${styles}`}>
      {status}
    </span>
  );
}

function SongInput({ label, value, onChange, placeholder }) {
  return (
    <label>
      <span className="text-sm font-bold text-slate-200">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-amber-400"
      />
    </label>
  );
}

function SongPill({ label }) {
  return (
    <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-slate-300">
      {label}
    </span>
  );
}

function FilterSelect({ icon: Icon, value, onChange, options, label }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-slate-950 px-4 py-3">
      <Icon size={18} className="text-slate-400" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent text-sm font-bold text-white outline-none"
      >
        {options.map((option) => (
          <option key={option} value={option} className="bg-slate-950">
            {label}: {option}
          </option>
        ))}
      </select>
    </div>
  );
}

function PlaceholderPanel({ title }) {
  return (
    <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl">
      <h2 className="text-2xl font-bold">{title}</h2>
      <p className="mt-3 text-slate-300">
        This section is ready for the next feature build.
      </p>
    </div>
  );
}

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

function getNextThursdayDate() {
  const date = new Date();
  const day = date.getDay();
  const daysUntilThursday = (4 - day + 7) % 7 || 7;
  date.setDate(date.getDate() + daysUntilThursday);
  return date.toISOString().slice(0, 10);
}

function formatRehearsalDate(value) {
  if (!value) return "Date not set";

  const date = new Date(`${value}T12:00:00`);

  return date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

function formatTime(value) {
  if (!value) return "Time not set";

  const [hours, minutes] = value.split(":");
  const date = new Date();
  date.setHours(Number(hours));
  date.setMinutes(Number(minutes));

  return date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
};
}
