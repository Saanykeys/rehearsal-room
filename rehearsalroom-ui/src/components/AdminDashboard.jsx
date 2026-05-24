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
  LogOut,
  User,
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

const emptyAnnouncementForm = {
  title: "",
  message: "",
  audience: "Everyone",
};

const emptyInviteForm = {
  fullName: "",
  email: "",
  role: "Choir Member",
};

export default function AdminDashboard({ currentUser, token, onLogout }) {
  // currentRole drives ALL permission checks — synced from currentUser on mount
  const [currentRole, setCurrentRole] = useState(currentUser?.role || "Admin");
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Permissions — always derived from currentRole so the dev switcher works correctly
  const isAdmin = currentRole === "Admin";
  const isMusician = currentRole === "Musician";
  const isChoirMember = currentRole === "Choir Member";

  // Auth headers used for every API call
  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  // ── Songs ────────────────────────────────────────────────────────────────
  const [songs, setSongs] = useState([]);
  const [songSuggestions, setSongSuggestions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [keyFilter, setKeyFilter] = useState("All");
  const [showSongForm, setShowSongForm] = useState(false);
  const [editingSongId, setEditingSongId] = useState(null);
  const [songForm, setSongForm] = useState(emptySongForm);
  const [formError, setFormError] = useState("");

  // ── Rehearsals ───────────────────────────────────────────────────────────
  const [rehearsals, setRehearsals] = useState([]);
  const [showRehearsalForm, setShowRehearsalForm] = useState(false);
  const [editingRehearsalId, setEditingRehearsalId] = useState(null);
  const [rehearsalForm, setRehearsalForm] = useState(emptyRehearsalForm);
  const [rehearsalError, setRehearsalError] = useState("");

  // ── Attendance ───────────────────────────────────────────────────────────
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [attendanceLoaded, setAttendanceLoaded] = useState(false);

  // ── Members ──────────────────────────────────────────────────────────────
  const [members, setMembers] = useState([]);
  const [showInviteMemberForm, setShowInviteMemberForm] = useState(false);
  const [inviteMemberForm, setInviteMemberForm] = useState(emptyInviteForm);

  // ── Suggestions form ─────────────────────────────────────────────────────
  const [showSuggestionForm, setShowSuggestionForm] = useState(false);
  const [suggestionForm, setSuggestionForm] = useState({ title: "", artist: "", youtubeLink: "", reason: "" });
  const [suggestionFilter, setSuggestionFilter] = useState("All");
  const [suggestionError, setSuggestionError] = useState("");

  // ── Members search ───────────────────────────────────────────────────────
  const [memberSearch, setMemberSearch] = useState("");
  const [memberRoleFilter, setMemberRoleFilter] = useState("All");

  // ── Announcements ────────────────────────────────────────────────────────
  const [announcements, setAnnouncements] = useState([]);
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [announcementForm, setAnnouncementForm] = useState(emptyAnnouncementForm);

  // ── Settings ─────────────────────────────────────────────────────────────
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordMsg, setPasswordMsg] = useState("");

  // ── Data loaders ─────────────────────────────────────────────────────────
  const loadSongs = async () => {
    try {
      const res = await fetch(`${API_BASE}/Songs`, { headers: authHeaders });
      const data = await res.json();
      setSongs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load songs", err);
    }
  };

  const loadSongSuggestions = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/SongSuggestions`, { headers: authHeaders });
      const data = await res.json();
      setSongSuggestions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load suggestions", err);
    }
  };

  const loadRehearsals = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/RehearsalEvents`, { headers: authHeaders });
      const data = await res.json();
      setRehearsals(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load rehearsals", err);
    }
  };

  const loadMembers = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/Members`, { headers: authHeaders });
      const data = await res.json();
      setMembers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load members", err);
    }
  };

  const loadAttendanceRecords = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/AttendanceRecords`, { headers: authHeaders });
      const data = await res.json();
      setAttendanceRecords(Array.isArray(data) ? data : []);
      setAttendanceLoaded(true);
    } catch (err) {
      console.error("Failed to load attendance", err);
      setAttendanceLoaded(true);
    }
  };

  useEffect(() => {
    loadSongs();
    loadSongSuggestions();
    loadRehearsals();
    loadMembers();
    loadAttendanceRecords();
  }, []);

  // ── Songs CRUD ────────────────────────────────────────────────────────────
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

  const saveSong = async (e) => {
    e.preventDefault();
    if (!songForm.title.trim()) {
      setFormError("Song title is required.");
      return;
    }
    const method = editingSongId ? "PUT" : "POST";
    const url = editingSongId
      ? `${API_BASE}/Songs/${editingSongId}`
      : `${API_BASE}/Songs`;
    const res = await fetch(url, {
      method,
      headers: authHeaders,
      body: JSON.stringify(songForm),
    });
    if (!res.ok) {
      setFormError("Song could not be saved. Check your backend terminal.");
      return;
    }
    await loadSongs();
    closeSongForm();
  };

  const deleteSong = async (song) => {
    if (!window.confirm(`Delete "${song.title}" from the library?`)) return;
    const res = await fetch(`${API_BASE}/Songs/${song.id}`, {
      method: "DELETE",
      headers: authHeaders,
    });
    if (!res.ok) {
      alert("Song could not be deleted.");
      return;
    }
    await loadSongs();
  };

  // ── Suggestions CRUD ─────────────────────────────────────────────────────
  const submitSuggestion = async (e) => {
    e.preventDefault();
    if (!suggestionForm.title.trim()) {
      setSuggestionError("Song title is required.");
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/SongSuggestions`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          title: suggestionForm.title,
          artist: suggestionForm.artist,
          youTubeLink: suggestionForm.youtubeLink,
          reason: suggestionForm.reason,
          suggestedBy: currentUser?.fullName || "Unknown",
        }),
      });
      if (!res.ok) throw new Error();
      setSuggestionForm({ title: "", artist: "", youtubeLink: "", reason: "" });
      setSuggestionError("");
      setShowSuggestionForm(false);
      loadSongSuggestions();
    } catch {
      setSuggestionError("Could not submit suggestion. Try again.");
    }
  };

  const approveSuggestion = async (id) => {
    await fetch(`${API_BASE}/api/SongSuggestions/${id}/approve`, {
      method: "PUT",
      headers: authHeaders,
    });
    loadSongSuggestions();
  };

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
    alert(`"${song.title}" added to Song Library!`);
  };

  // ── Rehearsals CRUD ───────────────────────────────────────────────────────
  const openAddRehearsalForm = () => {
    setEditingRehearsalId(null);
    setRehearsalForm({
      ...emptyRehearsalForm,
      eventDate: getTodayDate(),
      songIds: songs.slice(0, 3).map((s) => s.id),
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
    setRehearsalForm((prev) => ({
      ...prev,
      songIds: prev.songIds.includes(songId)
        ? prev.songIds.filter((id) => id !== songId)
        : [...prev.songIds, songId],
    }));
  };

  const saveRehearsal = async (e) => {
    e.preventDefault();
    if (!rehearsalForm.title.trim()) {
      setRehearsalError("Rehearsal title is required.");
      return;
    }
    if (!rehearsalForm.eventDate) {
      setRehearsalError("Rehearsal date is required.");
      return;
    }
    try {
      const url = editingRehearsalId
        ? `${API_BASE}/api/RehearsalEvents/${editingRehearsalId}`
        : `${API_BASE}/api/RehearsalEvents`;
      const res = await fetch(url, {
        method: editingRehearsalId ? "PUT" : "POST",
        headers: authHeaders,
        body: JSON.stringify({
          title: rehearsalForm.title,
          eventDate: rehearsalForm.eventDate,
          eventTime: rehearsalForm.eventTime,
          location: rehearsalForm.location,
          notes: rehearsalForm.notes,
          songIds: rehearsalForm.songIds,
        }),
      });
      if (!res.ok) throw new Error("Failed to save rehearsal.");
      const saved = await res.json();
      if (editingRehearsalId) {
        setRehearsals((prev) => prev.map((r) => (r.id === editingRehearsalId ? saved : r)));
      } else {
        setRehearsals((prev) => [...prev, saved]);
      }
      closeRehearsalForm();
    } catch (err) {
      console.error(err);
      setRehearsalError("Could not save rehearsal.");
    }
  };

  const deleteRehearsal = async (rehearsal) => {
    if (!window.confirm(`Delete rehearsal "${rehearsal.title}"?`)) return;
    try {
      const res = await fetch(`${API_BASE}/api/RehearsalEvents/${rehearsal.id}`, {
        method: "DELETE",
        headers: authHeaders,
      });
      if (!res.ok) throw new Error();
      setRehearsals((prev) => prev.filter((r) => r.id !== rehearsal.id));
    } catch {
      alert("Could not delete rehearsal.");
    }
  };

  // ── Attendance ────────────────────────────────────────────────────────────
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
      const created = await Promise.all(
        defaultTeam.map(async (member) => {
          const res = await fetch(`${API_BASE}/api/AttendanceRecords`, {
            method: "POST",
            headers: authHeaders,
            body: JSON.stringify({ rehearsalEventId, ...member }),
          });
          return res.json();
        })
      );
      setAttendanceRecords((prev) => [...prev, ...created]);
    } catch (err) {
      console.error("Failed to seed attendance", err);
    }
  };

  const updateAttendanceStatus = async (recordId, status) => {
    try {
      const res = await fetch(`${API_BASE}/api/AttendanceRecords/${recordId}/status`, {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify(status),
      });
      if (!res.ok) {
        alert("Attendance could not be updated.");
        return;
      }
      const updated = await res.json();
      setAttendanceRecords((prev) =>
        prev.map((r) => (r.id === updated.id ? updated : r))
      );
    } catch (err) {
      console.error("Failed to update attendance", err);
    }
  };

  const getAttendanceByRehearsal = (rehearsalEventId) =>
    attendanceRecords.filter((r) => r.rehearsalEventId === rehearsalEventId);

  // ── Members CRUD ──────────────────────────────────────────────────────────
  const handleInviteMember = async () => {
    if (!inviteMemberForm.fullName.trim() || !inviteMemberForm.email.trim()) {
      alert("Please complete all fields.");
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/Members`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify(inviteMemberForm),
      });
      if (!res.ok) throw new Error();
      const saved = await res.json();
      setMembers((prev) => [...prev, saved]);
      setInviteMemberForm(emptyInviteForm);
      setShowInviteMemberForm(false);
    } catch {
      alert("Could not save member.");
    }
  };

  const updateMemberRole = async (memberId, newRole) => {
    try {
      const memberToUpdate = members.find((m) => m.id === memberId);
      const res = await fetch(`${API_BASE}/api/Members/${memberId}`, {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify({ ...memberToUpdate, role: newRole }),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setMembers((prev) => prev.map((m) => (m.id === memberId ? updated : m)));
    } catch {
      alert("Could not update member role.");
    }
  };

  const deleteMember = async (memberId) => {
    if (!window.confirm("Delete this member?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/Members/${memberId}`, {
        method: "DELETE",
        headers: authHeaders,
      });
      if (!res.ok) throw new Error();
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
    } catch {
      alert("Could not delete member.");
    }
  };

  // ── Announcements ─────────────────────────────────────────────────────────
  const postAnnouncement = () => {
    if (!announcementForm.title.trim()) return;
    setAnnouncements((prev) => [
      { id: Date.now(), ...announcementForm },
      ...prev,
    ]);
    setAnnouncementForm(emptyAnnouncementForm);
    setShowAnnouncementForm(false);
  };

  // ── Derived values ────────────────────────────────────────────────────────
  const categories = useMemo(() => {
    const vals = [...new Set(songs.map((s) => s.category).filter(Boolean))].sort();
    return ["All", ...vals];
  }, [songs]);

  const keys = useMemo(() => {
    const vals = [...new Set(songs.map((s) => s.key).filter(Boolean))].sort();
    return ["All", ...vals];
  }, [songs]);

  const filteredSongs = songs.filter((song) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      song.title?.toLowerCase().includes(q) ||
      song.artist?.toLowerCase().includes(q) ||
      song.category?.toLowerCase().includes(q) ||
      song.key?.toLowerCase().includes(q);
    const matchesCategory = categoryFilter === "All" || song.category === categoryFilter;
    const matchesKey = keyFilter === "All" || song.key === keyFilter;
    return matchesSearch && matchesCategory && matchesKey;
  });

  const pendingSuggestions = songSuggestions.filter((s) => s.status === "Pending");
  const recentSongs = songs.slice(-3).reverse();
  const upcomingRehearsal = rehearsals[0] ?? null;

  // Seed attendance for upcoming rehearsal if none exist yet
  useEffect(() => {
    if (!attendanceLoaded || !upcomingRehearsal) return;
    if (getAttendanceByRehearsal(upcomingRehearsal.id).length === 0) {
      seedAttendanceRecords(upcomingRehearsal.id);
    }
  }, [attendanceLoaded, upcomingRehearsal?.id]);

  const upcomingSongs =
    upcomingRehearsal?.songIds?.length > 0
      ? songs.filter((s) => upcomingRehearsal.songIds.includes(s.id))
      : [];

  const upcomingAttendance = upcomingRehearsal
    ? getAttendanceByRehearsal(upcomingRehearsal.id)
    : [];

  const confirmedCount = upcomingAttendance.filter((r) => r.status === "Confirmed").length;
  const pendingCount = upcomingAttendance.filter((r) => r.status === "Pending").length;
  const declinedCount = upcomingAttendance.filter((r) => r.status === "Declined").length;
  const confirmedPercentage = Math.round(
    (confirmedCount / (upcomingAttendance.length || 1)) * 100
  );

  // ── Nav ───────────────────────────────────────────────────────────────────
  const navItems = [
    { name: "Dashboard", icon: LayoutDashboard, roles: ["Admin", "Musician", "Choir Member"] },
    { name: "Song Library", icon: Music, roles: ["Admin", "Musician", "Choir Member"] },
    { name: "Suggestions", icon: Lightbulb, roles: ["Admin", "Musician", "Choir Member"] },
    { name: "Rehearsals", icon: CalendarDays, roles: ["Admin", "Musician", "Choir Member"] },
    { name: "Attendance", icon: ClipboardCheck, roles: ["Admin", "Musician", "Choir Member"] },
    { name: "Members", icon: Users, roles: ["Admin"] },
    { name: "Settings", icon: Settings, roles: ["Admin", "Musician", "Choir Member"] },
  ];

  const visibleNavItems = navItems.filter((item) => item.roles.includes(currentRole));

  const switchRole = (role) => {
    setCurrentRole(role);
    const allowed = navItems.find((n) => n.name === activeTab)?.roles ?? [];
    if (!allowed.includes(role)) setActiveTab("Dashboard");
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Mobile menu toggle */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="fixed left-4 top-4 z-50 rounded-xl bg-amber-400 p-3 text-slate-950 lg:hidden"
      >
        <Menu size={22} />
      </button>

      <div className="flex min-h-screen flex-col lg:flex-row">
        {/* ── Sidebar ──────────────────────────────────────────────────── */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-white/10 bg-slate-950 p-5 transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
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

          {/* Sidebar logout */}
          <button
            onClick={onLogout}
            className="mt-10 flex w-full items-center gap-3 rounded-2xl bg-red-500/10 px-4 py-3 font-bold text-red-300 transition-all hover:bg-red-500/20"
          >
            <LogOut size={20} />
            Logout
          </button>
        </aside>

        {/* ── Main content ─────────────────────────────────────────────── */}
        <section className="flex-1 p-4 pt-20 pb-24 lg:p-8 lg:pb-8">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-300">
                {currentRole} View
              </p>
              <h1 className="mt-2 text-2xl font-black md:text-3xl">{activeTab}</h1>
            </div>

            <div className="flex items-center gap-3">
              {/* Dev role switcher */}
              <div className="hidden items-center gap-2 sm:flex">
                {["Admin", "Musician", "Choir Member"].map((role) => (
                  <button
                    key={role}
                    onClick={() => switchRole(role)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-black transition-all ${
                      currentRole === role
                        ? "bg-amber-400 text-slate-950"
                        : "bg-white/10 text-slate-300 hover:bg-white/15"
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>

              {/* Notification bell */}
              <div className="relative rounded-3xl border border-white/10 bg-white/5 p-3">
                <Bell size={20} className="text-amber-300" />
                {pendingSuggestions.length > 0 && (
                  <span className="absolute -right-2 -top-2 rounded-full bg-red-500 px-2 text-xs font-bold">
                    {pendingSuggestions.length}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* ── Dashboard Tab ──────────────────────────────────────────── */}
          {activeTab === "Dashboard" && (
            <div className="mt-8 space-y-8">
              {/* Announcement form */}
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
                      onChange={(v) => setAnnouncementForm((p) => ({ ...p, title: v }))}
                      placeholder="Choir rehearsal moved to 7:30 PM"
                    />
                    <label>
                      <span className="text-sm font-bold text-slate-200">Message</span>
                      <textarea
                        value={announcementForm.message}
                        onChange={(e) =>
                          setAnnouncementForm((p) => ({ ...p, message: e.target.value }))
                        }
                        placeholder="Type announcement..."
                        className="mt-2 min-h-28 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-amber-400"
                      />
                    </label>
                    <label>
                      <span className="text-sm font-bold text-slate-200">Audience</span>
                      <select
                        value={announcementForm.audience}
                        onChange={(e) =>
                          setAnnouncementForm((p) => ({ ...p, audience: e.target.value }))
                        }
                        className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none"
                      >
                        <option>Everyone</option>
                        <option>Musicians</option>
                        <option>Choir Members</option>
                        <option>Admins Only</option>
                      </select>
                    </label>
                    <button
                      onClick={postAnnouncement}
                      className="rounded-2xl bg-amber-400 px-5 py-3 font-black text-black"
                    >
                      Post Announcement
                    </button>
                  </div>
                </div>
              )}

              {/* Invite Member form (dashboard shortcut) */}
              {showInviteMemberForm && (
                <InviteMemberForm
                  form={inviteMemberForm}
                  setForm={setInviteMemberForm}
                  onSave={handleInviteMember}
                  onClose={() => setShowInviteMemberForm(false)}
                />
              )}

              {/* Welcome banner */}
              <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-amber-400/10 p-5 shadow-2xl">
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-300">
                  Welcome Back
                </p>
                <h2 className="mt-3 text-3xl font-black">
                  {isAdmin
                    ? "Choir Director Command Center 🎵"
                    : isMusician
                    ? "Musician Dashboard 🎸"
                    : "Choir Member Dashboard 🎶"}
                </h2>
                <p className="mt-3 max-w-2xl text-slate-300">
                  {isAdmin
                    ? "Manage rehearsals, song approvals, attendance, and team preparation from one place."
                    : "View rehearsals, setlists, songs, and attendance from here."}
                </p>
                {isAdmin && (
                  <div className="mt-6 flex flex-wrap gap-3">
                    <QuickButton
                      icon={Plus}
                      label="Add Song"
                      onClick={() => {
                        setActiveTab("Song Library");
                        openAddSongForm();
                      }}
                    />
                    <QuickButton
                      icon={CalendarDays}
                      label="Create Rehearsal"
                      onClick={() => {
                        setActiveTab("Rehearsals");
                        openAddRehearsalForm();
                      }}
                    />
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
                  </div>
                )}
              </div>

              {/* Stat cards */}
              <div className="grid gap-5 md:grid-cols-4">
                <StatCard title="Songs in Library" value={songs.length} />
                <StatCard title="Rehearsals" value={rehearsals.length} />
                <StatCard title="Song Suggestions" value={songSuggestions.length} />
                <StatCard title="Pending Review" value={pendingSuggestions.length} />
              </div>

              {/* Main dashboard cards */}
              <div className="grid gap-6 xl:grid-cols-2">
                <DashboardCard title="Upcoming Rehearsal">
                  {upcomingRehearsal ? (
                    <>
                      <p className="text-xs font-bold uppercase tracking-[0.25em] text-amber-300">
                        {formatRehearsalDate(upcomingRehearsal.eventDate)} •{" "}
                        {formatTime(upcomingRehearsal.eventTime)}
                      </p>
                      <h3 className="mt-2 text-2xl font-black">{upcomingRehearsal.title}</h3>
                      <p className="mt-1 text-sm text-slate-400">{upcomingRehearsal.location}</p>
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
                      className="h-3 rounded-full bg-emerald-400 transition-all"
                      style={{ width: `${confirmedPercentage}%` }}
                    />
                  </div>
                  <p className="mt-3 text-sm text-slate-400">
                    {confirmedPercentage}% of the team has confirmed.
                  </p>
                </DashboardCard>

                <DashboardCard title="Recent Song Activity">
                  <div className="space-y-3">
                    {recentSongs.length > 0 ? (
                      recentSongs.map((song) => (
                        <div
                          key={song.id}
                          className="flex items-center justify-between rounded-2xl bg-slate-900 px-4 py-3"
                        >
                          <span className="font-bold">{song.title}</span>
                          <span className="text-xs text-slate-400">Added recently</span>
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
                        <div key={song.id} className="rounded-2xl bg-slate-900 px-4 py-3">
                          <p className="font-bold">{song.title}</p>
                          <p className="text-sm text-slate-400">
                            Suggested by {song.suggestedBy}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-400">No pending suggestions right now.</p>
                    )}
                  </div>
                </DashboardCard>

                {/* Announcements */}
                {announcements.length > 0 && (
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl xl:col-span-2">
                    <p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-300">
                      Team Updates
                    </p>
                    <h3 className="mt-2 text-2xl font-black">Announcements</h3>
                    <div className="mt-6 space-y-4">
                      {announcements.map((a) => (
                        <div
                          key={a.id}
                          className="rounded-2xl border border-white/10 bg-slate-950/60 p-5"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h4 className="text-lg font-black">{a.title}</h4>
                              <p className="mt-2 text-sm text-slate-300">{a.message}</p>
                            </div>
                            <span className="rounded-full bg-amber-400/20 px-3 py-1 text-xs font-bold text-amber-300">
                              {a.audience}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Song Library Tab ────────────────────────────────────────── */}
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
                    <SongInput label="Title" value={songForm.title} onChange={(v) => setSongForm((p) => ({ ...p, title: v }))} placeholder="Firm Foundation" />
                    <SongInput label="Artist" value={songForm.artist} onChange={(v) => setSongForm((p) => ({ ...p, artist: v }))} placeholder="Cody Carnes" />
                    <SongInput label="Key" value={songForm.key} onChange={(v) => setSongForm((p) => ({ ...p, key: v }))} placeholder="C" />
                    <SongInput label="Tempo" value={songForm.tempo} onChange={(v) => setSongForm((p) => ({ ...p, tempo: v }))} placeholder="72 BPM" />
                    <SongInput label="Category" value={songForm.category} onChange={(v) => setSongForm((p) => ({ ...p, category: v }))} placeholder="Worship" />
                    <SongInput label="YouTube Link" value={songForm.youtubeLink} onChange={(v) => setSongForm((p) => ({ ...p, youtubeLink: v }))} placeholder="https://youtube.com/..." />
                    <label className="lg:col-span-2">
                      <span className="text-sm font-bold text-slate-200">Notes</span>
                      <textarea
                        value={songForm.notes}
                        onChange={(e) => setSongForm((p) => ({ ...p, notes: e.target.value }))}
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
                    No songs found. {isAdmin ? "Add a song or" : "Try to"} adjust your filters.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Suggestions Tab ─────────────────────────────────────────── */}
          {activeTab === "Suggestions" && (() => {
            const filteredSuggestions = suggestionFilter === "All"
              ? songSuggestions
              : songSuggestions.filter((s) => s.status === suggestionFilter);

            const counts = {
              All: songSuggestions.length,
              Pending: songSuggestions.filter((s) => s.status === "Pending").length,
              Approved: songSuggestions.filter((s) => s.status === "Approved").length,
              Rejected: songSuggestions.filter((s) => s.status === "Rejected").length,
            };

            return (
              <div className="mt-8 space-y-6">
                {/* Header */}
                <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-slate-900 p-5 shadow-xl">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-300">
                        Song Requests
                      </p>
                      <h2 className="mt-2 text-3xl font-black">Song Suggestions</h2>
                      <p className="mt-2 text-sm text-slate-300">
                        {isAdmin
                          ? "Review, approve, or reject suggestions from the team."
                          : "Suggest a song for the worship leader to review."}
                      </p>
                    </div>
                    <button
                      onClick={() => setShowSuggestionForm((v) => !v)}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-400 px-5 py-3 font-black text-slate-950 transition-all hover:scale-[1.03]"
                    >
                      <Plus size={18} />
                      Suggest a Song
                    </button>
                  </div>

                  {/* Status filter tabs */}
                  <div className="mt-5 flex flex-wrap gap-2">
                    {["All", "Pending", "Approved", "Rejected"].map((status) => (
                      <button
                        key={status}
                        onClick={() => setSuggestionFilter(status)}
                        className={`rounded-2xl px-4 py-2 text-xs font-black transition-all ${
                          suggestionFilter === status
                            ? status === "Approved"
                              ? "bg-emerald-500 text-white"
                              : status === "Rejected"
                              ? "bg-red-500 text-white"
                              : status === "Pending"
                              ? "bg-amber-400 text-slate-950"
                              : "bg-white text-slate-950"
                            : "bg-white/10 text-slate-300 hover:bg-white/15"
                        }`}
                      >
                        {status} <span className="ml-1 opacity-70">({counts[status]})</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit form */}
                {showSuggestionForm && (
                  <div className="rounded-3xl border border-amber-400/30 bg-amber-400/10 p-5 shadow-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-2xl font-black">Suggest a Song</h3>
                        <p className="mt-1 text-sm text-amber-100/80">
                          Your suggestion goes to the worship leader for review.
                        </p>
                      </div>
                      <button
                        onClick={() => { setShowSuggestionForm(false); setSuggestionError(""); }}
                        className="rounded-xl bg-slate-950 p-2 text-slate-300 hover:text-white"
                      >
                        <X size={20} />
                      </button>
                    </div>

                    {suggestionError && (
                      <p className="mt-4 rounded-2xl bg-red-500/20 px-4 py-3 text-sm font-bold text-red-200">
                        {suggestionError}
                      </p>
                    )}

                    <form onSubmit={submitSuggestion} className="mt-5 grid gap-4 lg:grid-cols-2">
                      <SongInput
                        label="Song Title *"
                        value={suggestionForm.title}
                        onChange={(v) => setSuggestionForm((p) => ({ ...p, title: v }))}
                        placeholder="Goodness of God"
                      />
                      <SongInput
                        label="Artist"
                        value={suggestionForm.artist}
                        onChange={(v) => setSuggestionForm((p) => ({ ...p, artist: v }))}
                        placeholder="Bethel Music"
                      />
                      <SongInput
                        label="YouTube Link"
                        value={suggestionForm.youtubeLink}
                        onChange={(v) => setSuggestionForm((p) => ({ ...p, youtubeLink: v }))}
                        placeholder="https://youtube.com/..."
                      />
                      <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950 px-4 py-3">
                        <span className="text-sm text-slate-400">Suggested by:</span>
                        <span className="font-black text-amber-300">{currentUser?.fullName}</span>
                      </div>
                      <label className="lg:col-span-2">
                        <span className="text-sm font-bold text-slate-200">Why this song?</span>
                        <textarea
                          value={suggestionForm.reason}
                          onChange={(e) => setSuggestionForm((p) => ({ ...p, reason: e.target.value }))}
                          placeholder="This song would be perfect for worship because..."
                          className="mt-2 min-h-24 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-amber-400"
                        />
                      </label>
                      <div className="lg:col-span-2 flex gap-3">
                        <button
                          type="submit"
                          className="inline-flex items-center gap-2 rounded-2xl bg-amber-400 px-5 py-3 font-black text-slate-950 transition-all hover:scale-[1.02]"
                        >
                          <Save size={18} />
                          Submit Suggestion
                        </button>
                        <button
                          type="button"
                          onClick={() => { setShowSuggestionForm(false); setSuggestionError(""); }}
                          className="rounded-2xl bg-white/10 px-5 py-3 font-bold text-slate-200 hover:bg-white/15"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Suggestion cards */}
                <div className="space-y-4">
                  {filteredSuggestions.length > 0 ? (
                    filteredSuggestions.map((song) => (
                      <div
                        key={song.id}
                        className="rounded-3xl border border-white/10 bg-slate-900 p-5 transition-all hover:-translate-y-1 hover:bg-slate-800"
                      >
                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-3">
                              <h3 className="text-2xl font-black">{song.title}</h3>
                              <StatusBadge status={song.status} />
                            </div>
                            {song.artist && (
                              <p className="mt-2 text-sm text-slate-400">by {song.artist}</p>
                            )}
                            <p className="mt-1 text-sm text-slate-500">
                              Suggested by <span className="font-bold text-slate-300">{song.suggestedBy}</span>
                              {song.createdDate && (
                                <span> · {new Date(song.createdDate).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</span>
                              )}
                            </p>
                            {song.reason && (
                              <p className="mt-4 rounded-2xl bg-slate-950 p-4 text-sm italic text-slate-300">
                                "{song.reason}"
                              </p>
                            )}
                          </div>
                          {song.youTubeLink && (
                            <a
                              href={song.youTubeLink}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-amber-400 px-4 py-2 font-bold text-slate-950"
                            >
                              <PlayCircle size={18} />
                              Watch
                            </a>
                          )}
                        </div>

                        {/* Admin actions */}
                        {isAdmin && song.status === "Pending" && (
                          <div className="mt-6 flex flex-wrap gap-3">
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

                        {isAdmin && song.status === "Approved" && (
                          <div className="mt-6">
                            <button
                              onClick={() => addToSongLibrary(song)}
                              className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-4 py-2 font-bold text-slate-950"
                            >
                              <Music size={18} />
                              Add to Song Library
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center">
                      <Lightbulb size={40} className="mx-auto text-slate-600" />
                      <p className="mt-4 font-bold text-slate-300">
                        {suggestionFilter === "All"
                          ? "No suggestions yet. Be the first to suggest a song!"
                          : `No ${suggestionFilter.toLowerCase()} suggestions.`}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* ── Rehearsals Tab ──────────────────────────────────────────── */}
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
                    <SongInput label="Rehearsal Title" value={rehearsalForm.title} onChange={(v) => setRehearsalForm((p) => ({ ...p, title: v }))} placeholder="Thursday Night Rehearsal" />
                    <SongInput label="Location" value={rehearsalForm.location} onChange={(v) => setRehearsalForm((p) => ({ ...p, location: v }))} placeholder="Main Sanctuary" />
                    <label>
                      <span className="text-sm font-bold text-slate-200">Date</span>
                      <input
                        type="date"
                        value={rehearsalForm.eventDate}
                        onChange={(e) => setRehearsalForm((p) => ({ ...p, eventDate: e.target.value }))}
                        className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-amber-400"
                      />
                    </label>
                    <label>
                      <span className="text-sm font-bold text-slate-200">Time</span>
                      <input
                        type="time"
                        value={rehearsalForm.eventTime}
                        onChange={(e) => setRehearsalForm((p) => ({ ...p, eventTime: e.target.value }))}
                        className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-amber-400"
                      />
                    </label>
                    <label className="lg:col-span-2">
                      <span className="text-sm font-bold text-slate-200">Notes</span>
                      <textarea
                        value={rehearsalForm.notes}
                        onChange={(e) => setRehearsalForm((p) => ({ ...p, notes: e.target.value }))}
                        placeholder="Transitions, singers needed, rehearsal focus, etc."
                        className="mt-2 min-h-24 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-amber-400"
                      />
                    </label>
                    <div className="lg:col-span-2">
                      <div className="flex items-center gap-2">
                        <ListMusic size={18} className="text-amber-300" />
                        <span className="text-sm font-bold text-slate-200">Choose Setlist Songs</span>
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
                        ? songs.filter((s) => rehearsal.songIds.includes(s.id))
                        : [];
                    return (
                      <div
                        key={rehearsal.id}
                        className="rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-xl transition-all hover:-translate-y-1 hover:bg-slate-800"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-300">
                              {formatRehearsalDate(rehearsal.eventDate)} •{" "}
                              {formatTime(rehearsal.eventTime)}
                            </p>
                            <h3 className="mt-2 text-2xl font-black">{rehearsal.title}</h3>
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
                            rehearsalSongs.map((song, i) => (
                              <div
                                key={song.id}
                                className="flex items-center justify-between rounded-2xl bg-slate-950 px-4 py-3"
                              >
                                <div>
                                  <p className="font-bold">
                                    {i + 1}. {song.title}
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
                        {isAdmin && (
                          <div className="mt-6 flex flex-wrap gap-3">
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
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-slate-300 xl:col-span-2">
                    No rehearsals yet.{" "}
                    {isAdmin ? "Create your first rehearsal and choose songs from the library." : "Check back soon."}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Attendance Tab ──────────────────────────────────────────── */}
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
                      Confirmations save to your database and stay after refresh.
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
                  <p className="text-4xl font-black text-emerald-300">{confirmedCount}</p>
                  <p className="mt-2 text-emerald-100">Confirmed</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-amber-400/10 p-5">
                  <p className="text-4xl font-black text-amber-300">{pendingCount}</p>
                  <p className="mt-2 text-amber-100">Pending</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-red-500/10 p-5">
                  <p className="text-4xl font-black text-red-300">{declinedCount}</p>
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
                        ? `${upcomingRehearsal.location} • ${formatTime(upcomingRehearsal.eventTime)}`
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
                        <div key={song.id} className="rounded-2xl bg-white/5 px-4 py-3">
                          <p className="font-bold">{song.title}</p>
                          <p className="mt-1 text-xs text-slate-400">Key {song.key || "N/A"}</p>
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
                          <h4 className="text-lg font-black">{member.memberName}</h4>
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
                            onClick={() => updateAttendanceStatus(member.id, "Confirmed")}
                            className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-bold text-slate-950"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => updateAttendanceStatus(member.id, "Pending")}
                            className="rounded-xl bg-amber-400 px-4 py-2 text-sm font-bold text-slate-950"
                          >
                            Pending
                          </button>
                          <button
                            onClick={() => updateAttendanceStatus(member.id, "Declined")}
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

          {/* ── Members Tab ─────────────────────────────────────────────── */}
          {activeTab === "Members" && (() => {
            const filteredMembers = members.filter((m) => {
              const q = memberSearch.toLowerCase();
              const matchesSearch =
                m.fullName?.toLowerCase().includes(q) ||
                m.email?.toLowerCase().includes(q);
              const matchesRole = memberRoleFilter === "All" || m.role === memberRoleFilter;
              return matchesSearch && matchesRole;
            });
            const adminCount = members.filter((m) => m.role === "Admin").length;
            const musicianCount = members.filter((m) => m.role === "Musician").length;
            const choirCount = members.filter((m) => m.role === "Choir Member").length;

            return (
              <div className="mt-8 space-y-6">
                {/* Header */}
                <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-slate-900 p-5 shadow-xl">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-300">
                        Team Management
                      </p>
                      <h2 className="mt-2 text-3xl font-black">Members</h2>
                      <p className="mt-2 text-sm text-slate-300">
                        {members.length} total — {adminCount} Admin · {musicianCount} Musician · {choirCount} Choir Member
                      </p>
                    </div>
                    {isAdmin && (
                      <button
                        onClick={() => setShowInviteMemberForm(true)}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-400 px-5 py-3 font-black text-slate-950 transition-all hover:scale-[1.03]"
                      >
                        <Plus size={18} />
                        Invite Member
                      </button>
                    )}
                  </div>

                  {/* Search + role filter */}
                  <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                    <div className="flex flex-1 items-center gap-3 rounded-2xl bg-slate-950 px-4 py-3">
                      <Search size={18} className="text-slate-400" />
                      <input
                        value={memberSearch}
                        onChange={(e) => setMemberSearch(e.target.value)}
                        placeholder="Search by name or email..."
                        className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                      />
                    </div>
                    <div className="flex gap-2">
                      {["All", "Admin", "Musician", "Choir Member"].map((role) => (
                        <button
                          key={role}
                          onClick={() => setMemberRoleFilter(role)}
                          className={`rounded-2xl px-4 py-2 text-xs font-black transition-all ${
                            memberRoleFilter === role
                              ? rolePillActive(role)
                              : "bg-white/10 text-slate-300 hover:bg-white/15"
                          }`}
                        >
                          {role}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Invite form */}
                {showInviteMemberForm && (
                  <InviteMemberForm
                    form={inviteMemberForm}
                    setForm={setInviteMemberForm}
                    onSave={handleInviteMember}
                    onClose={() => setShowInviteMemberForm(false)}
                  />
                )}

                {/* Member cards */}
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {filteredMembers.length > 0 ? (
                    filteredMembers.map((member) => (
                      <div
                        key={member.id}
                        className="rounded-3xl border border-white/10 bg-slate-900 p-5 shadow-xl transition-all hover:-translate-y-1 hover:bg-slate-800"
                      >
                        {/* Avatar + name row */}
                        <div className="flex items-center gap-4">
                          <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-lg font-black ${roleAvatarBg(member.role)}`}>
                            {getInitials(member.fullName)}
                          </div>
                          <div className="min-w-0">
                            <h3 className="truncate text-lg font-black text-white">
                              {member.fullName}
                            </h3>
                            <p className="truncate text-sm text-slate-400">{member.email}</p>
                          </div>
                        </div>

                        {/* Role badge */}
                        <div className="mt-4">
                          <span className={`rounded-full px-3 py-1 text-xs font-bold ${roleBadgeStyle(member.role)}`}>
                            {member.role}
                          </span>
                        </div>

                        {/* Admin controls */}
                        {isAdmin && (
                          <div className="mt-5 space-y-3">
                            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                              Change Role
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {["Admin", "Musician", "Choir Member"].map((role) => (
                                <button
                                  key={role}
                                  onClick={() => {
                                    if (role !== member.role) updateMemberRole(member.id, role);
                                  }}
                                  className={`rounded-xl px-3 py-1.5 text-xs font-black transition-all ${
                                    member.role === role
                                      ? rolePillActive(role)
                                      : "bg-white/10 text-slate-300 hover:bg-white/15"
                                  }`}
                                >
                                  {role}
                                </button>
                              ))}
                            </div>
                            <button
                              onClick={() => deleteMember(member.id)}
                              className="mt-1 inline-flex items-center gap-2 rounded-xl bg-red-500/10 px-4 py-2 text-sm font-bold text-red-300 transition hover:bg-red-500/20"
                            >
                              <Trash2 size={15} />
                              Remove Member
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center md:col-span-2 xl:col-span-3">
                      <Users size={40} className="mx-auto text-slate-600" />
                      <p className="mt-4 font-bold text-slate-300">
                        {members.length === 0
                          ? "No members yet. Invite your worship team to get started."
                          : "No members match your search."}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* ── Settings Tab ────────────────────────────────────────────── */}
          {activeTab === "Settings" && (
            <div className="mt-8 space-y-6">
              {/* Account info */}
              <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-slate-900 p-6 shadow-xl">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-400 text-slate-950">
                    <User size={32} />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-300">
                      Your Account
                    </p>
                    <h2 className="mt-1 text-2xl font-black">
                      {currentUser?.fullName || "User"}
                    </h2>
                    <p className="mt-1 text-sm text-slate-400">{currentUser?.email}</p>
                  </div>
                </div>
                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Role</p>
                    <p className="mt-2 font-black text-amber-300">{currentUser?.role}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Email</p>
                    <p className="mt-2 font-black text-white truncate">{currentUser?.email}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Status</p>
                    <p className="mt-2 font-black text-emerald-300">Active</p>
                  </div>
                </div>
              </div>

              {/* Change password */}
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl">
                <h3 className="text-2xl font-black">Change Password</h3>
                <p className="mt-2 text-sm text-slate-400">
                  Update your login password below.
                </p>
                {passwordMsg && (
                  <p className="mt-4 rounded-2xl bg-emerald-500/20 px-4 py-3 text-sm font-bold text-emerald-200">
                    {passwordMsg}
                  </p>
                )}
                <div className="mt-6 grid gap-4 max-w-md">
                  <label>
                    <span className="text-sm font-bold text-slate-200">Current Password</span>
                    <input
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) =>
                        setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))
                      }
                      placeholder="••••••••"
                      className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-amber-400"
                    />
                  </label>
                  <label>
                    <span className="text-sm font-bold text-slate-200">New Password</span>
                    <input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) =>
                        setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))
                      }
                      placeholder="••••••••"
                      className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-amber-400"
                    />
                  </label>
                  <label>
                    <span className="text-sm font-bold text-slate-200">Confirm New Password</span>
                    <input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) =>
                        setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))
                      }
                      placeholder="••••••••"
                      className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-amber-400"
                    />
                  </label>
                  <button
                    onClick={() => {
                      if (!passwordForm.newPassword) return;
                      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
                        setPasswordMsg("Passwords do not match.");
                        return;
                      }
                      // TODO: wire up to PUT /api/Auth/change-password when endpoint is ready
                      setPasswordMsg("Password change saved! (Backend endpoint coming soon.)");
                      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
                    }}
                    className="rounded-2xl bg-amber-400 px-5 py-3 font-black text-slate-950 transition-all hover:scale-[1.02]"
                  >
                    Update Password
                  </button>
                </div>
              </div>

              {/* App info */}
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl">
                <h3 className="text-2xl font-black">App Info</h3>
                <div className="mt-6 grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">API Base</p>
                    <p className="mt-2 font-mono text-sm text-amber-300">{API_BASE}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Version</p>
                    <p className="mt-2 font-black text-white">Rehearsal Room v1.0</p>
                  </div>
                </div>
              </div>

              {/* Danger zone */}
              <div className="rounded-3xl border border-red-500/30 bg-red-500/5 p-6 shadow-xl">
                <h3 className="text-2xl font-black text-red-300">Sign Out</h3>
                <p className="mt-2 text-sm text-slate-400">
                  You'll be returned to the login screen.
                </p>
                <button
                  onClick={onLogout}
                  className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-red-500/20 px-5 py-3 font-black text-red-200 transition-all hover:bg-red-500/30"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

// ── Reusable sub-components ───────────────────────────────────────────────────

function InviteMemberForm({ form, setForm, onSave, onClose }) {
  return (
    <div className="rounded-3xl border border-blue-400/30 bg-blue-400/10 p-5 shadow-xl">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-black">Invite Member</h3>
          <p className="mt-1 text-sm text-blue-100/80">Invite a new worship team member.</p>
        </div>
        <button
          onClick={onClose}
          className="rounded-xl bg-slate-950 p-2 text-slate-300 hover:text-white"
        >
          <X size={20} />
        </button>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <SongInput
          label="Full Name"
          value={form.fullName}
          onChange={(v) => setForm((p) => ({ ...p, fullName: v }))}
          placeholder="John Smith"
        />
        <SongInput
          label="Email"
          value={form.email}
          onChange={(v) => setForm((p) => ({ ...p, email: v }))}
          placeholder="john@example.com"
        />
        <label className="md:col-span-2">
          <span className="text-sm font-bold text-slate-200">Role</span>
          <select
            value={form.role}
            onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
            className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-400"
          >
            <option value="Choir Member">Choir Member</option>
            <option value="Musician">Musician</option>
            <option value="Admin">Admin</option>
          </select>
        </label>
      </div>
      <button
        onClick={onSave}
        className="mt-6 rounded-2xl bg-blue-400 px-5 py-3 font-black text-slate-950"
      >
        Send Invite
      </button>
    </div>
  );
}

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

function StatusBadge({ status }) {
  const styles =
    status === "Approved"
      ? "bg-emerald-500/20 text-emerald-300"
      : status === "Rejected"
      ? "bg-red-500/20 text-red-300"
      : "bg-amber-400/20 text-amber-300";
  return (
    <span className={`rounded-full px-4 py-2 text-xs font-bold ${styles}`}>{status}</span>
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

function getInitials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join("");
}

function roleAvatarBg(role) {
  if (role === "Admin") return "bg-amber-400 text-slate-950";
  if (role === "Musician") return "bg-blue-500 text-white";
  return "bg-purple-500 text-white";
}

function roleBadgeStyle(role) {
  if (role === "Admin") return "bg-amber-400/20 text-amber-300";
  if (role === "Musician") return "bg-blue-500/20 text-blue-300";
  return "bg-purple-500/20 text-purple-300";
}

function rolePillActive(role) {
  if (role === "Admin") return "bg-amber-400 text-slate-950";
  if (role === "Musician") return "bg-blue-500 text-white";
  if (role === "Choir Member") return "bg-purple-500 text-white";
  return "bg-white/20 text-white";
}

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
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
  return date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}
