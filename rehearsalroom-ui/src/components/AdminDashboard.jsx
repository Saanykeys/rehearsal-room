import { useEffect, useMemo, useRef, useState } from "react";
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
  MessageSquare,
  Send,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5281";

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
  password: "",
  role: "Team Member",
  directorCode: "",
};

export default function AdminDashboard({ currentUser, token, onLogout }) {
  // currentRole drives ALL permission checks — synced from currentUser on mount
  const [currentRole, setCurrentRole] = useState(currentUser?.role || "Team Member");
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Permissions — always derived from currentRole so the dev switcher works correctly
  const isAdmin = currentRole === "Music Director";
  const isMusician = currentRole === "Team Member";
  const isChoirMember = false;

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

  // ── Announcements ────────────────────────────────────────────────────────
  const [announcements, setAnnouncements] = useState([]);
  const [waitlistEntries, setWaitlistEntries] = useState([]);
  const [announcementForm, setAnnouncementFormState] = useState({ title: "", body: "" });
  const [announcementLoading, setAnnouncementLoading] = useState(false);
  const [announcementMsg, setAnnouncementMsg] = useState("");

  // ── Attendance ───────────────────────────────────────────────────────────
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [attendanceLoaded, setAttendanceLoaded] = useState(false);
  const [attendanceRehearsalId, setAttendanceRehearsalId] = useState(null);

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

  // ── Settings ─────────────────────────────────────────────────────────────
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordMsg, setPasswordMsg] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [nameValue, setNameValue] = useState(currentUser?.fullName || "");
  const [nameMsg, setNameMsg] = useState("");
  const [nameError, setNameError] = useState("");
  const [nameLoading, setNameLoading] = useState(false);

  // ── Notifications ─────────────────────────────────────────────────────────
  const [showNotifications, setShowNotifications] = useState(false);
  const [dismissedNotifIds, setDismissedNotifIds] = useState([]);
  const notifRef = useRef(null);

  // ── Data loaders ─────────────────────────────────────────────────────────
  const loadSongs = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/Songs`, { headers: authHeaders });
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

  const loadAnnouncements = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/Announcements`, { headers: authHeaders });
      const data = await res.json();
      setAnnouncements(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load announcements", err);
    }
  };

  const postAnnouncement = async () => {
    if (!announcementForm.title.trim()) {
      setAnnouncementMsg("Please enter a title.");
      return;
    }
    setAnnouncementLoading(true);
    setAnnouncementMsg("");
    try {
      const res = await fetch(`${API_BASE}/api/Announcements`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify(announcementForm),
      });
      if (!res.ok) {
        setAnnouncementMsg("Failed to post announcement.");
        return;
      }
      const created = await res.json();
      setAnnouncements((prev) => [created, ...prev]);
      setAnnouncementFormState({ title: "", body: "" });
      setAnnouncementMsg("Announcement posted!");
    } catch {
      setAnnouncementMsg("Could not reach the server.");
    } finally {
      setAnnouncementLoading(false);
    }
  };

  const deleteAnnouncement = async (id) => {
    try {
      await fetch(`${API_BASE}/api/Announcements/${id}`, {
        method: "DELETE",
        headers: authHeaders,
      });
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error("Failed to delete announcement", err);
    }
  };

  const loadWaitlist = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/Waitlist`, { headers: authHeaders });
      if (res.ok) setWaitlistEntries(await res.json());
    } catch { /* silent */ }
  };

  useEffect(() => {
    loadSongs();
    loadSongSuggestions();
    loadRehearsals();
    loadMembers();
    loadAttendanceRecords();
    loadAnnouncements();
    if (isAdmin) loadWaitlist();

    // Poll every 30 seconds so team members see new announcements,
    // rehearsals, and song library changes without refreshing the page
    const poll = setInterval(() => {
      loadAnnouncements();
      loadRehearsals();
      loadSongs();
      loadSongSuggestions();
    }, 30000);

    return () => clearInterval(poll);
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
      ? `${API_BASE}/api/Songs/${editingSongId}`
      : `${API_BASE}/api/Songs`;
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
    const res = await fetch(`${API_BASE}/api/Songs/${song.id}`, {
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

  const approveSuggestion = async (id, title) => {
    const approveRes = await fetch(`${API_BASE}/api/SongSuggestions/${id}/approve`, {
      method: "PUT",
      headers: authHeaders,
    });
    if (approveRes.ok) {
      // Automatically add to song library in the same action
      await fetch(`${API_BASE}/api/SongSuggestions/${id}/add-to-library`, {
        method: "POST",
        headers: authHeaders,
      });
      await loadSongs();
    }
    loadSongSuggestions();
  };

  const rejectSuggestion = async (id) => {
    await fetch(`${API_BASE}/api/SongSuggestions/${id}/reject`, {
      method: "PUT",
      headers: authHeaders,
    });
    loadSongSuggestions();
  };

  // ── Rehearsals CRUD ───────────────────────────────────────────────────────
  const getTodayDate = () => new Date().toISOString().split("T")[0];

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
      eventDate: rehearsal.eventDate ? rehearsal.eventDate.split("T")[0] : "",
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
      if (!res.ok) {
        const errText = await res.text();
        let errMsg = "Could not save rehearsal.";
        try { errMsg = JSON.parse(errText)?.message || JSON.parse(errText)?.title || errText || errMsg; } catch { errMsg = errText || errMsg; }
        setRehearsalError(errMsg);
        return;
      }
      const saved = await res.json();
      if (editingRehearsalId) {
        setRehearsals((prev) => prev.map((r) => (r.id === editingRehearsalId ? saved : r)));
      } else {
        setRehearsals((prev) => [...prev, saved]);
        // Reload attendance so the auto-seeded records show up immediately
        await loadAttendanceRecords();
      }
      closeRehearsalForm();
    } catch (err) {
      console.error(err);
      setRehearsalError("Network error — check that the API server is running.");
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
    const teamToSeed = members.length > 0
      ? members.map((m) => ({
          memberName: m.fullName || m.email?.split("@")[0] || "Member",
          role: m.role || "Member",
          status: "Pending",
        }))
      : [
          { memberName: "Team Member", role: "Member", status: "Pending" },
        ];
    try {
      const created = await Promise.all(
        teamToSeed.map(async (member) => {
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
    const { fullName, email, password, role } = inviteMemberForm;
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      alert("Please fill in name, email, and password.");
      return;
    }
    if (password.length < 8) {
      alert("Password must be at least 8 characters.");
      return;
    }
    try {
      // Register the new user via the Auth endpoint.
      // Team members join using the director's org invite code (auto-populated).
      // Passing directorCode lets the director also add another director if needed.
      const payload = {
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        directorCode: inviteMemberForm.directorCode ?? "",
        // Always include the org invite code so the new member joins the right org
        inviteCode: currentUser?.inviteCode ?? "",
        orgName: "",
      };
      const res = await fetch(`${API_BASE}/api/Auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const text = await res.text();
      let data = null;
      try { data = JSON.parse(text); } catch { data = text; }
      if (!res.ok) {
        alert(typeof data === "string" ? data : data?.message || "Could not add member.");
        return;
      }
      // Reload members so the new user shows up
      await loadMembers();
      setInviteMemberForm(emptyInviteForm);
      setShowInviteMemberForm(false);
    } catch {
      alert("Could not save member. Check backend is running.");
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

  // postAnnouncement is defined above with the loadAnnouncements function

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

  const rolePillActive = (role) => {
    if (role === "Music Director") return "bg-amber-400 text-slate-950";
    return "bg-indigo-500 text-white";
  };

  const roleAvatarBg = (role) => {
    if (role === "Music Director") return "bg-amber-400/20 text-amber-300";
    return "bg-indigo-500/20 text-indigo-300";
  };

  const roleBadgeStyle = (role) => {
    if (role === "Music Director") return "bg-amber-400/20 text-amber-300 border border-amber-400/30";
    return "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30";
  };

  const getInitials = (name = "") =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  const recentSongs = songs.slice(-3).reverse();
  const upcomingRehearsal = rehearsals[0] ?? null;

  // Seed attendance for upcoming rehearsal if none exist yet
  useEffect(() => {
    if (!attendanceLoaded || !upcomingRehearsal) return;
    if (getAttendanceByRehearsal(upcomingRehearsal.id).length === 0) {
      seedAttendanceRecords(upcomingRehearsal.id);
    }
  }, [attendanceLoaded, upcomingRehearsal?.id]);

  // Seed attendance when switching to a rehearsal with no records
  useEffect(() => {
    if (!attendanceRehearsalId || !attendanceLoaded) return;
    if (getAttendanceByRehearsal(attendanceRehearsalId).length === 0) {
      seedAttendanceRecords(attendanceRehearsalId);
    }
  }, [attendanceRehearsalId]);

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

  // ── Attendance tab derived values ─────────────────────────────────────────
  const selectedAttendanceId = attendanceRehearsalId ?? upcomingRehearsal?.id ?? null;
  const selectedAttendanceRehearsal = rehearsals.find((r) => r.id === selectedAttendanceId) ?? upcomingRehearsal;
  const selectedAttendance = selectedAttendanceId ? getAttendanceByRehearsal(selectedAttendanceId) : [];
  const myRecord = selectedAttendance.find(
    (r) => r.memberName === (currentUser?.fullName || currentUser?.email?.split("@")[0])
  );
  const selConfirmed = selectedAttendance.filter((r) => r.status === "Confirmed").length;
  const selPending = selectedAttendance.filter((r) => r.status === "Pending").length;
  const selDeclined = selectedAttendance.filter((r) => r.status === "Declined").length;

  // ── Notifications data ────────────────────────────────────────────────────
  const notifications = useMemo(() => {
    const items = [];

    // Announcements always come first — live from the database
    announcements.forEach((a) => {
      items.push({
        id: `announcement-${a.id}`,
        type: "announcement",
        color: "text-emerald-300",
        icon: Bell,
        title: a.title,
        body: a.body,
        createdBy: a.createdBy,
        tab: null,
      });
    });

    pendingSuggestions.forEach((s) => {
      items.push({
        id: `suggestion-${s.id}`,
        type: "suggestion",
        color: "text-amber-300",
        icon: Lightbulb,
        title: `New suggestion: "${s.title}"`,
        body: `Suggested by ${s.suggestedBy}`,
        tab: "Suggestions",
      });
    });

    if (upcomingRehearsal) {
      items.push({
        id: `rehearsal-${upcomingRehearsal.id}`,
        type: "rehearsal",
        color: "text-blue-300",
        icon: CalendarDays,
        title: `Upcoming: ${upcomingRehearsal.title}`,
        body: `${formatRehearsalDate(upcomingRehearsal.eventDate)} · ${formatTime(upcomingRehearsal.eventTime)}`,
        tab: "Rehearsals",
      });
    }

    members.slice(-3).reverse().forEach((m) => {
      items.push({
        id: `member-${m.id}`,
        type: "member",
        color: "text-purple-300",
        icon: Users,
        title: `${m.fullName} is on the team`,
        body: m.role,
        tab: "Members",
      });
    });

    return items.filter((n) => !dismissedNotifIds.includes(n.id));
  }, [pendingSuggestions, upcomingRehearsal, members, dismissedNotifIds]);

  // ── Browser push notifications ────────────────────────────────────────────
  useEffect(() => {
    if (!token) return;
    registerPushSubscription(token);
  }, [token]);

  // Close notification panel on outside click
  useEffect(() => {
    if (!showNotifications) return;
    const handleClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showNotifications]);

  // ── Nav ───────────────────────────────────────────────────────────────────
  const navItems = [
    { name: "Dashboard", icon: LayoutDashboard, roles: ["Music Director", "Team Member"] },
    { name: "Song Library", icon: Music, roles: ["Music Director", "Team Member"] },
    { name: "Suggestions", icon: Lightbulb, roles: ["Music Director", "Team Member"] },
    { name: "Rehearsals", icon: CalendarDays, roles: ["Music Director", "Team Member"] },
    { name: "Attendance", icon: ClipboardCheck, roles: ["Music Director", "Team Member"] },
    { name: "Members", icon: Users, roles: ["Music Director"] },
    { name: "Waitlist", icon: ClipboardCheck, roles: ["Music Director"] },
    { name: "Settings", icon: Settings, roles: ["Music Director", "Team Member"] },
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

      {/* Sidebar backdrop overlay on mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex min-h-screen flex-col lg:flex-row">
        {/* ── Sidebar ──────────────────────────────────────────────────── */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-white/10 bg-slate-950 transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:w-52 lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Top: logo + nav (scrollable if needed) */}
          <div className="flex-1 overflow-y-auto p-5 lg:p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-black uppercase tracking-[0.35em] text-amber-300 lg:text-xs">
                Rehearsal Room
              </p>
              <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
                <X />
              </button>
            </div>

            <nav className="mt-10 space-y-2 lg:mt-6">
              {visibleNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.name}
                    onClick={() => {
                      setActiveTab(item.name);
                      setSidebarOpen(false);
                    }}
                    className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left font-bold transition-all hover:scale-[1.02] lg:gap-2 lg:rounded-xl lg:px-3 lg:py-2 lg:text-sm ${
                      activeTab === item.name
                        ? "bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/20"
                        : "bg-white/5 text-slate-200 hover:bg-white/10"
                    }`}
                  >
                    <Icon size={18} />
                    {item.name}
                  </button>
                );
              })}
            </nav>

            {/* Role switcher in sidebar (mobile) — directors only */}
            {currentUser?.role === "Music Director" && (
              <div className="mt-8 lg:hidden">
                <p className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-500">View As</p>
                <div className="space-y-2">
                  {["Music Director", "Team Member"].map((role) => (
                    <button
                      key={role}
                      onClick={() => { switchRole(role); setSidebarOpen(false); }}
                      className={`w-full rounded-xl px-4 py-2 text-left text-sm font-bold transition-all ${
                        currentRole === role
                          ? "bg-amber-400 text-slate-950"
                          : "bg-white/5 text-slate-400 hover:bg-white/10"
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bottom: logout — always visible, never pushed off screen */}
          <div className="border-t border-white/10 p-5 lg:p-4">
            <button
              onClick={onLogout}
              className="flex w-full items-center gap-3 rounded-2xl bg-red-500/10 px-4 py-3 font-bold text-red-300 transition-all hover:bg-red-500/20 lg:gap-2 lg:rounded-xl lg:px-3 lg:py-2 lg:text-sm"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </aside>

        {/* ── Main content ─────────────────────────────────────────────── */}
        <section className="flex-1 p-4 pt-20 pb-24 lg:p-6 lg:pb-6">
          <div className="mx-auto max-w-5xl">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-300">
                {isAdmin ? "Music Director View" : "Team Member View"}
              </p>
              <h1 className="mt-1 text-2xl font-black lg:text-2xl">{activeTab}</h1>
            </div>

            <div className="flex items-center gap-3">
              {/* Role switcher — only directors can preview team member view */}
              {currentUser?.role === "Music Director" && (
                <div className="hidden items-center gap-2 sm:flex">
                  {["Music Director", "Team Member"].map((role) => (
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
              )}

              {/* Notification bell */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setShowNotifications((v) => !v)}
                  className={`relative rounded-3xl border p-3 transition-all ${
                    showNotifications
                      ? "border-amber-400/50 bg-amber-400/10"
                      : "border-white/10 bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <Bell size={20} className="text-amber-300" />
                  {notifications.length > 0 && (
                    <span className="absolute -right-2 -top-2 rounded-full bg-red-500 px-2 text-xs font-bold">
                      {notifications.length}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 top-14 z-50 w-[calc(100vw-2rem)] max-w-80 rounded-3xl border border-white/10 bg-slate-900 shadow-2xl sm:w-80">
                    {/* Panel header */}
                    <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                      <div>
                        <p className="font-black">Notifications</p>
                        <p className="text-xs text-slate-400">{notifications.length} unread</p>
                      </div>
                      {notifications.length > 0 && (
                        <button
                          onClick={() =>
                            setDismissedNotifIds((prev) => [
                              ...prev,
                              ...notifications.map((n) => n.id),
                            ])
                          }
                          className="text-xs font-bold text-slate-400 hover:text-white"
                        >
                          Clear all
                        </button>
                      )}
                    </div>

                    {/* Items */}
                    {notifications.length === 0 ? (
                      <div className="px-5 py-10 text-center">
                        <Bell size={28} className="mx-auto mb-3 text-slate-600" />
                        <p className="text-sm font-bold text-slate-400">You're all caught up!</p>
                      </div>
                    ) : (
                      <div className="max-h-96 overflow-y-auto divide-y divide-white/5">
                        {notifications.map((notif) => {
                          const Icon = notif.icon;
                          return (
                            <div
                              key={notif.id}
                              className="flex items-start gap-3 px-5 py-4 hover:bg-white/5 transition-all"
                            >
                              <div className={`mt-0.5 shrink-0 ${notif.color}`}>
                                <Icon size={18} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold leading-snug">{notif.title}</p>
                                <p className="mt-0.5 text-xs text-slate-400">{notif.body}</p>
                                <button
                                  onClick={() => {
                                    setActiveTab(notif.tab);
                                    setShowNotifications(false);
                                  }}
                                  className="mt-2 text-xs font-black text-amber-300 hover:text-amber-200"
                                >
                                  View →
                                </button>
                              </div>
                              <button
                                onClick={() =>
                                  setDismissedNotifIds((prev) => [...prev, notif.id])
                                }
                                className="shrink-0 text-slate-600 hover:text-slate-300 transition-all"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Dashboard Tab ──────────────────────────────────────────── */}
          {activeTab === "Dashboard" && (
            <div className="mt-8 space-y-8">

              {/* Invite Member form (dashboard shortcut) */}
              {showInviteMemberForm && (
                <InviteMemberForm
                  inviteCode={currentUser?.inviteCode}
                  orgName={currentUser?.orgName}
                  token={token}
                  onClose={() => setShowInviteMemberForm(false)}
                />
              )}

              {/* Welcome banner */}
              <div className="rounded-2xl border border-amber-400/20 bg-gradient-to-br from-amber-950/60 via-slate-900 to-amber-900/30 p-5 shadow-2xl lg:p-4">
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-300">
                  Welcome Back
                </p>
                <h2 className="mt-2 text-2xl font-black lg:text-xl">
                  {isAdmin
                    ? "Music Director Command Center 🎵"
                    : "Team Member Dashboard 🎶"}
                </h2>
                <p className="mt-2 max-w-2xl text-sm text-slate-300">
                  {isAdmin
                    ? "Manage rehearsals, song approvals, attendance, and team preparation from one place."
                    : "View rehearsals, setlists, songs, and attendance from here."}
                </p>
                {isAdmin && (
                  <div className="mt-4 flex flex-wrap gap-2">
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
                      onClick={() => {
                        const el = document.getElementById("announcement-form");
                        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Stat cards */}
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:gap-4">
                <StatCard title="Songs in Library" value={songs.length} />
                <StatCard title="Rehearsals" value={rehearsals.length} />
                <StatCard title="Song Suggestions" value={songSuggestions.length} />
                <StatCard title="Pending Review" value={pendingSuggestions.length} />
              </div>

              {/* Announcements */}
              <div className="space-y-4">
                {isAdmin && (
                  <div id="announcement-form" className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl">
                    <h3 className="text-xl font-black">Post Announcement</h3>
                    <p className="mt-1 text-sm text-slate-400">Visible to all team members in their notification bell.</p>
                    {announcementMsg && (
                      <p className={`mt-3 rounded-2xl px-4 py-3 text-sm font-bold ${
                        announcementMsg.includes("posted") ? "bg-emerald-500/20 text-emerald-200" : "bg-red-500/20 text-red-200"
                      }`}>{announcementMsg}</p>
                    )}
                    <div className="mt-4 space-y-3">
                      <input
                        value={announcementForm.title}
                        onChange={(e) => setAnnouncementFormState((p) => ({ ...p, title: e.target.value }))}
                        placeholder="Announcement title..."
                        className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-amber-400"
                      />
                      <textarea
                        value={announcementForm.body}
                        onChange={(e) => setAnnouncementFormState((p) => ({ ...p, body: e.target.value }))}
                        placeholder="Details (optional)..."
                        rows={3}
                        className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-amber-400 resize-none"
                      />
                      <button
                        onClick={postAnnouncement}
                        disabled={announcementLoading}
                        className="rounded-2xl bg-amber-400 px-6 py-3 font-black text-slate-950 transition-all hover:scale-[1.02] disabled:opacity-60"
                      >
                        {announcementLoading ? "Posting…" : "Post Announcement"}
                      </button>
                    </div>
                  </div>
                )}

                {announcements.length > 0 && (
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl">
                    <h3 className="text-xl font-black">Announcements</h3>
                    <div className="mt-4 space-y-3">
                      {announcements.map((a) => (
                        <div key={a.id} className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-black text-emerald-300">{a.title}</p>
                              {a.body && <p className="mt-1 text-sm text-slate-300">{a.body}</p>}
                              <p className="mt-2 text-xs text-slate-500">
                                Posted by {a.createdBy} · {new Date(a.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                              </p>
                            </div>
                            {isAdmin && (
                              <button
                                onClick={() => deleteAnnouncement(a.id)}
                                className="rounded-xl bg-red-500/20 px-3 py-1 text-xs font-bold text-red-300 hover:bg-red-500/30"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
                        <span className="font-black text-amber-300">{currentUser?.fullName || currentUser?.email?.split("@")[0] || "You"}</span>
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
                              onClick={() => approveSuggestion(song.id, song.title)}
                              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 font-bold text-slate-950"
                            >
                              <CheckCircle size={18} />
                              Approve &amp; Add to Library
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

                        {/* Discussion thread */}
                        <RehearsalDiscussion
                          rehearsalId={rehearsal.id}
                          token={token}
                          currentUser={currentUser}
                        />
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

              {/* Header */}
              <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-slate-900 p-5 shadow-xl">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-300">
                      Live Team Tracking
                    </p>
                    <h2 className="mt-2 text-3xl font-black">Attendance</h2>
                    <p className="mt-2 text-sm text-slate-300">
                      RSVP for rehearsals — confirmations save instantly.
                    </p>
                  </div>
                  <button
                    onClick={loadAttendanceRecords}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white/10 px-5 py-3 font-black text-slate-200 transition-all hover:scale-[1.03] hover:bg-white/15"
                  >
                    <Clock size={18} />
                    Refresh
                  </button>
                </div>
              </div>

              {/* Rehearsal picker */}
              {rehearsals.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {rehearsals
                    .slice()
                    .sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate))
                    .map((r) => {
                      const isSelected = r.id === selectedAttendanceId;
                      const isPast = new Date(r.eventDate) < new Date();
                      return (
                        <button
                          key={r.id}
                          onClick={() => setAttendanceRehearsalId(r.id)}
                          className={`rounded-2xl border px-4 py-2 text-sm font-bold transition-all hover:scale-[1.02] ${
                            isSelected
                              ? "border-amber-400 bg-amber-400 text-slate-950"
                              : isPast
                              ? "border-white/10 bg-white/5 text-slate-500"
                              : "border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
                          }`}
                        >
                          {r.title}
                          <span className="ml-2 text-xs font-normal opacity-70">
                            {formatRehearsalDate(r.eventDate)}
                          </span>
                        </button>
                      );
                    })}
                </div>
              ) : (
                <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center">
                  <CalendarDays size={40} className="mx-auto text-slate-600" />
                  <p className="mt-4 font-bold text-slate-300">No rehearsals yet. Create one in the Rehearsals tab first.</p>
                </div>
              )}

              {selectedAttendanceRehearsal && (
                <>
                  {/* Stats row */}
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-5">
                      <p className="text-4xl font-black text-emerald-300">{selConfirmed}</p>
                      <p className="mt-2 text-sm font-bold text-emerald-100">Confirmed</p>
                    </div>
                    <div className="rounded-3xl border border-amber-400/20 bg-amber-400/10 p-5">
                      <p className="text-4xl font-black text-amber-300">{selPending}</p>
                      <p className="mt-2 text-sm font-bold text-amber-100">Pending</p>
                    </div>
                    <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-5">
                      <p className="text-4xl font-black text-red-300">{selDeclined}</p>
                      <p className="mt-2 text-sm font-bold text-red-100">Declined</p>
                    </div>
                  </div>

                  {/* Personal RSVP card */}
                  {myRecord ? (
                    <div className={`rounded-3xl border-2 p-6 shadow-xl ${
                      myRecord.status === "Confirmed"
                        ? "border-emerald-500/40 bg-emerald-500/10"
                        : myRecord.status === "Declined"
                        ? "border-red-500/40 bg-red-500/10"
                        : "border-amber-400/40 bg-amber-400/10"
                    }`}>
                      <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Your RSVP</p>
                      <h3 className="mt-2 text-2xl font-black">
                        {selectedAttendanceRehearsal.title}
                      </h3>
                      <p className="mt-1 text-sm text-slate-400">
                        {formatRehearsalDate(selectedAttendanceRehearsal.eventDate)} · {formatTime(selectedAttendanceRehearsal.eventTime)}
                        {selectedAttendanceRehearsal.location && ` · ${selectedAttendanceRehearsal.location}`}
                      </p>
                      <div className="mt-5 flex flex-wrap gap-3">
                        <button
                          onClick={() => updateAttendanceStatus(myRecord.id, "Confirmed")}
                          className={`flex items-center gap-2 rounded-2xl px-6 py-3 font-black transition-all hover:scale-[1.02] ${
                            myRecord.status === "Confirmed"
                              ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/30"
                              : "bg-white/10 text-slate-200 hover:bg-emerald-500/20 hover:text-emerald-200"
                          }`}
                        >
                          <CheckCircle size={18} />
                          I'll be there
                        </button>
                        <button
                          onClick={() => updateAttendanceStatus(myRecord.id, "Declined")}
                          className={`flex items-center gap-2 rounded-2xl px-6 py-3 font-black transition-all hover:scale-[1.02] ${
                            myRecord.status === "Declined"
                              ? "bg-red-500 text-white shadow-lg shadow-red-500/30"
                              : "bg-white/10 text-slate-200 hover:bg-red-500/20 hover:text-red-200"
                          }`}
                        >
                          <XCircle size={18} />
                          Can't make it
                        </button>
                      </div>
                      <p className="mt-4 text-xs text-slate-500">
                        Current status: <span className={`font-bold ${
                          myRecord.status === "Confirmed" ? "text-emerald-300"
                          : myRecord.status === "Declined" ? "text-red-300"
                          : "text-amber-300"
                        }`}>{myRecord.status}</span>
                      </p>
                    </div>
                  ) : selectedAttendance.length > 0 ? (
                    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                      <p className="text-sm text-slate-400">
                        No RSVP record found for your account on this rehearsal. Ask your Admin to refresh the attendance list.
                      </p>
                    </div>
                  ) : null}

                  {/* Team list */}
                  <div className="rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-xl">
                    <h3 className="text-xl font-black">Team Status</h3>
                    <p className="mt-1 text-sm text-slate-400">{selectedAttendanceRehearsal.title}</p>

                    <div className="mt-5 space-y-3">
                      {selectedAttendance.length > 0 ? (
                        selectedAttendance.map((record) => {
                          const isMe = record.memberName === (currentUser?.fullName || currentUser?.email?.split("@")[0]);
                          return (
                            <div
                              key={record.id}
                              className={`flex flex-col gap-3 rounded-2xl p-4 md:flex-row md:items-center md:justify-between ${
                                isMe ? "border border-amber-400/30 bg-amber-400/5" : "bg-slate-950"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-sm font-black">
                                  {record.memberName?.[0]?.toUpperCase() ?? "?"}
                                </div>
                                <div>
                                  <p className="font-black">
                                    {record.memberName}
                                    {isMe && <span className="ml-2 text-xs font-bold text-amber-300">(you)</span>}
                                  </p>
                                  <p className="text-xs text-slate-400">{record.role}</p>
                                </div>
                              </div>

                              <div className="flex flex-wrap items-center gap-2">
                                <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                                  record.status === "Confirmed" ? "bg-emerald-500/20 text-emerald-300"
                                  : record.status === "Declined" ? "bg-red-500/20 text-red-300"
                                  : "bg-amber-400/20 text-amber-300"
                                }`}>
                                  {record.status}
                                </span>
                                {/* Admins can override anyone's status */}
                                {isAdmin && (
                                  <>
                                    <button
                                      onClick={() => updateAttendanceStatus(record.id, "Confirmed")}
                                      className="rounded-xl bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300 hover:bg-emerald-500/40"
                                    >
                                      ✓
                                    </button>
                                    <button
                                      onClick={() => updateAttendanceStatus(record.id, "Pending")}
                                      className="rounded-xl bg-amber-400/20 px-3 py-1 text-xs font-bold text-amber-300 hover:bg-amber-400/40"
                                    >
                                      ?
                                    </button>
                                    <button
                                      onClick={() => updateAttendanceStatus(record.id, "Declined")}
                                      className="rounded-xl bg-red-500/20 px-3 py-1 text-xs font-bold text-red-300 hover:bg-red-500/40"
                                    >
                                      ✕
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <p className="rounded-2xl bg-slate-950 p-4 text-sm text-slate-400">
                          Loading team attendance…
                        </p>
                      )}
                    </div>

                    {isAdmin && selectedAttendance.length === 0 && (
                      <button
                        onClick={() => seedAttendanceRecords(selectedAttendanceId)}
                        className="mt-5 rounded-2xl bg-amber-400 px-5 py-3 font-black text-slate-950 transition-all hover:scale-[1.02]"
                      >
                        Generate Attendance Records
                      </button>
                    )}
                  </div>
                </>
              )}
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
                      {["All", "Music Director", "Team Member"].map((role) => (
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
                    inviteCode={currentUser?.inviteCode}
                    orgName={currentUser?.orgName}
                    token={token}
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
                              {["Music Director", "Team Member"].map((role) => (
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

          {/* ── Waitlist Tab ─────────────────────────────────────────────── */}
          {activeTab === "Waitlist" && (
            <WaitlistPanel
              entries={waitlistEntries}
              onRefresh={loadWaitlist}
              token={token}
              currentUser={currentUser}
              onEntriesChange={setWaitlistEntries}
            />
          )}

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
                      {currentUser?.fullName || currentUser?.email?.split("@")[0] || "User"}
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

              {/* Update name */}
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl">
                <h3 className="text-2xl font-black">Update Name</h3>
                <p className="mt-2 text-sm text-slate-400">
                  Change the name shown across your dashboard.
                </p>
                {nameMsg && (
                  <p className="mt-4 rounded-2xl bg-emerald-500/20 px-4 py-3 text-sm font-bold text-emerald-200">
                    {nameMsg}
                  </p>
                )}
                {nameError && (
                  <p className="mt-4 rounded-2xl bg-red-500/20 px-4 py-3 text-sm font-bold text-red-200">
                    {nameError}
                  </p>
                )}
                <div className="mt-6 flex max-w-md gap-3">
                  <input
                    value={nameValue}
                    onChange={(e) => setNameValue(e.target.value)}
                    placeholder="Your full name"
                    className="flex-1 rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-amber-400"
                  />
                  <button
                    disabled={nameLoading}
                    onClick={async () => {
                      setNameMsg("");
                      setNameError("");
                      if (!nameValue.trim()) {
                        setNameError("Name cannot be empty.");
                        return;
                      }
                      setNameLoading(true);
                      try {
                        const res = await fetch(`${API_BASE}/api/Auth/update-name`, {
                          method: "PUT",
                          headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                          },
                          body: JSON.stringify({ fullName: nameValue.trim() }),
                        });
                        const data = await res.json();
                        if (!res.ok) {
                          setNameError(data.message || data || "Failed to update name.");
                        } else {
                          setNameMsg("Name updated successfully!");
                          const updatedUser = { ...currentUser, fullName: nameValue.trim() };
                          localStorage.setItem("rehearsalRoomUser", JSON.stringify(updatedUser));
                          // Reload page to sync name everywhere
                          window.location.reload();
                        }
                      } catch {
                        setNameError("Could not reach the server.");
                      } finally {
                        setNameLoading(false);
                      }
                    }}
                    className="rounded-2xl bg-amber-400 px-5 py-3 font-black text-slate-950 transition-all hover:scale-[1.02] disabled:opacity-60"
                  >
                    {nameLoading ? "Saving…" : "Save"}
                  </button>
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
                {passwordError && (
                  <p className="mt-4 rounded-2xl bg-red-500/20 px-4 py-3 text-sm font-bold text-red-200">
                    {passwordError}
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
                    disabled={passwordLoading}
                    onClick={async () => {
                      setPasswordMsg("");
                      setPasswordError("");
                      if (!passwordForm.currentPassword || !passwordForm.newPassword) {
                        setPasswordError("Please fill in all fields.");
                        return;
                      }
                      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
                        setPasswordError("New passwords do not match.");
                        return;
                      }
                      if (passwordForm.newPassword.length < 8) {
                        setPasswordError("New password must be at least 8 characters.");
                        return;
                      }
                      setPasswordLoading(true);
                      try {
                        const res = await fetch(`${API_BASE}/api/Auth/change-password`, {
                          method: "PUT",
                          headers: authHeaders,
                          body: JSON.stringify({
                            currentPassword: passwordForm.currentPassword,
                            newPassword: passwordForm.newPassword,
                          }),
                        });
                        const data = await res.json();
                        if (!res.ok) {
                          setPasswordError(
                            typeof data === "string" ? data : data.message || "Could not update password."
                          );
                        } else {
                          setPasswordMsg("Password updated successfully!");
                          setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
                        }
                      } catch {
                        setPasswordError("Could not reach the server. Is the backend running?");
                      } finally {
                        setPasswordLoading(false);
                      }
                    }}
                    className="rounded-2xl bg-amber-400 px-5 py-3 font-black text-slate-950 transition-all hover:scale-[1.02] disabled:opacity-60"
                  >
                    {passwordLoading ? "Updating…" : "Update Password"}
                  </button>
                </div>
              </div>

              {/* Organization — invite code for directors */}
              {currentUser?.role === "Music Director" && currentUser?.inviteCode && (
                <div className="rounded-3xl border border-amber-400/20 bg-amber-950/20 p-6 shadow-xl">
                  <h3 className="text-2xl font-black">Your Organization</h3>
                  <p className="mt-2 text-sm text-slate-400">
                    Share this invite code with your worship team members so they can register and join your workspace.
                  </p>
                  <div className="mt-6 space-y-4">
                    <OrgNameEditor currentUser={currentUser} token={token} onUpdated={(newName) => {
                      const updated = { ...currentUser, orgName: newName };
                      localStorage.setItem("rehearsalRoomUser", JSON.stringify(updated));
                      window.location.reload();
                    }} />
                    <div className="rounded-2xl border border-amber-400/30 bg-slate-950 px-4 py-4">
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Team Invite Code</p>
                      <p className="mt-2 font-mono text-xl font-black tracking-[0.2em] text-amber-300">
                        {currentUser?.inviteCode}
                      </p>
                    </div>
                  </div>

                  {/* Invite link */}
                  <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950 p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-2">Invite Link</p>
                    <p className="text-xs text-slate-500 mb-3">
                      Share this link with your team — the invite code is already filled in for them. They just create a name, email, and password.
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="flex-1 truncate rounded-xl bg-slate-800 px-3 py-2.5 font-mono text-xs text-amber-300">
                        {`${window.location.origin}/?invite=${currentUser?.inviteCode}`}
                      </p>
                      <CopyInviteLinkButton code={currentUser?.inviteCode} />
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-slate-500">
                    Only share with people you trust — anyone with this link can join <strong className="text-slate-300">{currentUser?.orgName}</strong>.
                  </p>
                </div>
              )}


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
          </div>{/* end max-w-5xl */}
        </section>
      </div>

      {/* ── Mobile bottom navigation bar ─────────────────────────────── */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-white/10 bg-slate-950/95 backdrop-blur lg:hidden">
        <div className="flex items-center justify-around px-1 py-2">
          {visibleNavItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.name;
            return (
              <button
                key={item.name}
                onClick={() => setActiveTab(item.name)}
                className={`flex flex-col items-center gap-1 rounded-xl px-3 py-2 transition-all ${
                  isActive ? "text-amber-400" : "text-slate-500"
                }`}
              >
                <Icon size={22} />
                <span className="text-[10px] font-bold leading-none">
                  {item.name.split(" ")[0]}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </main>
  );
}

// ── Push notification registration ───────────────────────────────────────────────
async function registerPushSubscription(token) {
  try {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

    const reg = await navigator.serviceWorker.register('/sw.js');

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return;

    const keyRes = await fetch(`${API_BASE}/api/Push/vapid-public-key`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!keyRes.ok) return;
    const { publicKey } = await keyRes.json();

    const subscription = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });

    const { endpoint, keys } = subscription.toJSON();

    await fetch(`${API_BASE}/api/Push/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ endpoint, p256dh: keys.p256dh, auth: keys.auth }),
    });
  } catch (err) {
    console.warn('[Push] Registration failed:', err);
  }
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

// ── OrgNameEditor ─────────────────────────────────────────────────────────────

function OrgNameEditor({ currentUser, token, onUpdated }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(currentUser?.orgName || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (!value.trim()) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/Auth/update-org-name`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ orgName: value.trim() }),
      });
      if (res.ok) {
        setEditing(false);
        onUpdated(value.trim());
      } else {
        const t = await res.text();
        setError(t || "Could not save.");
      }
    } catch {
      setError("Network error.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-4">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Organization Name</p>
      {editing ? (
        <div className="mt-2 space-y-2">
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            maxLength={80}
            className="w-full rounded-xl border border-white/10 bg-slate-800 px-3 py-2 text-white outline-none focus:border-amber-400"
            autoFocus
          />
          {error && <p className="text-xs text-red-400">{error}</p>}
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving || !value.trim()}
              className="rounded-xl bg-amber-400 px-4 py-1.5 text-xs font-black text-slate-950 disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save"}
            </button>
            <button
              onClick={() => { setEditing(false); setValue(currentUser?.orgName || ""); setError(""); }}
              className="rounded-xl bg-white/10 px-4 py-1.5 text-xs font-bold text-slate-300 hover:bg-white/15"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-2 flex items-center justify-between gap-3">
          <p className="font-black text-white">{currentUser?.orgName || "—"}</p>
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1.5 text-xs font-bold text-slate-300 hover:bg-white/15 transition-colors"
          >
            <Pencil size={12} /> Edit
          </button>
        </div>
      )}
    </div>
  );
}

// ── CopyInviteLinkButton ──────────────────────────────────────────────────────

function CopyInviteLinkButton({ code }) {
  const [copied, setCopied] = useState(false);
  const link = `${window.location.origin}/?invite=${code}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <button
      onClick={handleCopy}
      className={`flex-shrink-0 rounded-xl px-4 py-2.5 text-xs font-black transition-all ${
        copied
          ? "bg-emerald-400/20 text-emerald-300"
          : "bg-amber-400/20 text-amber-300 hover:bg-amber-400/30"
      }`}
    >
      {copied ? "✓ Copied!" : "Copy Link"}
    </button>
  );
}

// ── RehearsalDiscussion ───────────────────────────────────────────────────────

function RehearsalDiscussion({ rehearsalId, token, currentUser }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);
  const bottomRef = useRef(null);
  const pollRef = useRef(null);

  const authHeaders = { Authorization: `Bearer ${token}` };

  const loadMessages = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/RehearsalMessages/${rehearsalId}`, {
        headers: authHeaders,
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch {
      // silent
    }
  };

  // Load messages when panel opens, poll every 15s while open
  useEffect(() => {
    if (!open) {
      clearInterval(pollRef.current);
      return;
    }
    setLoading(true);
    loadMessages().finally(() => setLoading(false));
    pollRef.current = setInterval(loadMessages, 15000);
    return () => clearInterval(pollRef.current);
  }, [open, rehearsalId]);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (open) {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  }, [messages, open]);

  const handlePost = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setPosting(true);
    try {
      const res = await fetch(`${API_BASE}/api/RehearsalMessages/${rehearsalId}`, {
        method: "POST",
        headers: { ...authHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({ body: text.trim() }),
      });
      if (res.ok) {
        const newMsg = await res.json();
        setMessages((prev) => [...prev, newMsg]);
        setText("");
      }
    } catch {
      // silent
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/RehearsalMessages/${id}`, {
        method: "DELETE",
        headers: authHeaders,
      });
      if (res.ok || res.status === 204) {
        setMessages((prev) => prev.filter((m) => m.id !== id));
      }
    } catch {
      // silent
    }
  };

  const formatMsgTime = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleString([], {
      month: "short", day: "numeric",
      hour: "numeric", minute: "2-digit",
    });
  };

  const isDirector = currentUser?.role === "Music Director";

  return (
    <div className="mt-5 border-t border-white/10 pt-5">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-2xl bg-slate-800/60 px-4 py-3 text-sm font-bold text-slate-300 hover:bg-slate-800 transition-colors"
      >
        <span className="flex items-center gap-2">
          <MessageSquare size={16} className="text-amber-400" />
          Team Discussion
          {messages.length > 0 && !open && (
            <span className="rounded-full bg-amber-400/20 px-2 py-0.5 text-xs font-black text-amber-300">
              {messages.length}
            </span>
          )}
        </span>
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {open && (
        <div className="mt-3 rounded-2xl border border-white/10 bg-slate-950 overflow-hidden">
          {/* Message feed */}
          <div className="max-h-72 overflow-y-auto p-4 space-y-3">
            {loading && messages.length === 0 && (
              <p className="text-center text-xs text-slate-500 py-4">Loading discussion…</p>
            )}
            {!loading && messages.length === 0 && (
              <div className="text-center py-6">
                <MessageSquare size={28} className="mx-auto text-slate-700 mb-2" />
                <p className="text-sm text-slate-500">No messages yet.</p>
                <p className="text-xs text-slate-600 mt-1">Be the first to say something!</p>
              </div>
            )}
            {messages.map((msg) => {
              const isOwn = msg.isOwn || msg.authorId === currentUser?.id;
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 group ${isOwn ? "flex-row-reverse" : ""}`}
                >
                  {/* Avatar */}
                  <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-xs font-black ${
                    isOwn ? "bg-amber-400 text-slate-950" : "bg-slate-700 text-slate-300"
                  }`}>
                    {(msg.authorName || "?")[0].toUpperCase()}
                  </div>

                  {/* Bubble */}
                  <div className={`max-w-[75%] ${isOwn ? "items-end" : "items-start"} flex flex-col`}>
                    <div className={`flex items-center gap-2 mb-1 ${isOwn ? "flex-row-reverse" : ""}`}>
                      <span className="text-xs font-bold text-slate-400">
                        {isOwn ? "You" : msg.authorName}
                      </span>
                      <span className="text-[10px] text-slate-600">{formatMsgTime(msg.createdAt)}</span>
                    </div>
                    <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      isOwn
                        ? "bg-amber-400 text-slate-950 font-medium rounded-tr-sm"
                        : "bg-slate-800 text-slate-200 rounded-tl-sm"
                    }`}>
                      {msg.body}
                    </div>
                    {/* Delete button (own messages, or director) */}
                    {(isOwn || isDirector) && (
                      <button
                        onClick={() => handleDelete(msg.id)}
                        className="mt-1 text-[10px] text-slate-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handlePost}
            className="flex items-center gap-2 border-t border-white/10 p-3"
          >
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Say something to the team…"
              maxLength={500}
              className="flex-1 rounded-xl bg-slate-800 border border-white/10 px-4 py-2.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-amber-400"
            />
            <button
              type="submit"
              disabled={posting || !text.trim()}
              className="flex-shrink-0 flex items-center gap-1.5 rounded-xl bg-amber-400 px-4 py-2.5 text-sm font-black text-slate-950 transition hover:scale-[1.03] disabled:opacity-50"
            >
              <Send size={14} />
              {posting ? "…" : "Send"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

// ── WaitlistPanel ─────────────────────────────────────────────────────────────

const ADMIN_EMAIL = "rahsaanhall.swe@gmail.com";

function WaitlistPanel({ entries, onRefresh, token, currentUser, onEntriesChange }) {
  const [approvingId, setApprovingId] = useState(null);
  const [approveResult, setApproveResult] = useState({}); // id -> { success, message }
  const isSuperAdmin = currentUser?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  const handleApprove = async (entry) => {
    setApprovingId(entry.id);
    try {
      const res = await fetch(`${API_BASE}/api/Waitlist/${entry.id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch { data = { message: text }; }

      if (res.ok) {
        setApproveResult((prev) => ({ ...prev, [entry.id]: { success: true, message: `Code sent to ${entry.email}` } }));
        // Update local state to reflect approval
        onEntriesChange((prev) =>
          prev.map((e) => e.id === entry.id ? { ...e, isApproved: true, inviteCodeUsed: false } : e)
        );
      } else {
        setApproveResult((prev) => ({ ...prev, [entry.id]: { success: false, message: data.message || "Failed to approve." } }));
      }
    } catch {
      setApproveResult((prev) => ({ ...prev, [entry.id]: { success: false, message: "Network error." } }));
    } finally {
      setApprovingId(null);
    }
  };

  return (
    <div className="mt-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black">Waitlist</h2>
          <p className="text-sm text-slate-400 mt-1">{entries.length} {entries.length === 1 ? "person" : "people"} signed up</p>
        </div>
        <button onClick={onRefresh} className="rounded-2xl bg-white/10 px-4 py-2 text-sm font-bold hover:bg-white/15 transition-all">
          Refresh
        </button>
      </div>

      {!isSuperAdmin && (
        <div className="rounded-3xl border border-amber-400/20 bg-amber-400/5 p-6 text-center">
          <p className="font-bold text-amber-300">Admin access only</p>
          <p className="text-sm text-slate-400 mt-1">Waitlist management is restricted to the super admin.</p>
        </div>
      )}

      {isSuperAdmin && entries.length === 0 && (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-12 text-center">
          <p className="text-slate-400 font-medium">No signups yet.</p>
          <p className="text-amber-400 font-bold mt-2 text-sm">/waitlist</p>
        </div>
      )}

      {isSuperAdmin && entries.length > 0 && (
        <div className="space-y-3">
          {entries.map((entry) => {
            const result = approveResult[entry.id];
            const isApproving = approvingId === entry.id;
            const alreadyApproved = entry.isApproved && !entry.inviteCodeUsed;
            const codeUsed = entry.isApproved && entry.inviteCodeUsed;

            return (
              <div key={entry.id} className="rounded-2xl border border-white/10 bg-white/5 p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-black text-white">{entry.fullName}</p>
                    <span className={`text-xs font-black px-2 py-0.5 rounded-lg ${
                      entry.role === "Music Director" ? "bg-amber-400/20 text-amber-300" : "bg-blue-400/20 text-blue-300"
                    }`}>{entry.role}</span>
                    {codeUsed && (
                      <span className="text-xs font-black px-2 py-0.5 rounded-lg bg-emerald-400/20 text-emerald-300">Registered</span>
                    )}
                    {alreadyApproved && (
                      <span className="text-xs font-black px-2 py-0.5 rounded-lg bg-blue-400/20 text-blue-300">Code Sent</span>
                    )}
                  </div>
                  <p className="text-sm text-slate-400 mt-0.5">{entry.email}</p>
                  <p className="text-sm text-slate-500">{entry.churchName}</p>
                  {result && (
                    <p className={`text-xs font-bold mt-1 ${result.success ? "text-emerald-400" : "text-red-400"}`}>
                      {result.success ? "✓" : "✗"} {result.message}
                    </p>
                  )}
                </div>
                <div className="shrink-0">
                  {codeUsed ? (
                    <span className="text-xs text-slate-500 font-bold">✓ Done</span>
                  ) : (
                    <button
                      onClick={() => handleApprove(entry)}
                      disabled={isApproving}
                      className="rounded-xl bg-amber-400 px-4 py-2 text-sm font-black text-slate-950 hover:bg-amber-300 transition-all disabled:opacity-50"
                    >
                      {isApproving ? "Sending…" : alreadyApproved ? "Resend Code" : "Approve →"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="rounded-2xl border border-amber-400/20 bg-amber-400/5 p-4">
        <p className="text-sm font-bold text-amber-300">How approval works</p>
        <p className="text-sm text-slate-400 mt-1">Click <strong className="text-white">Approve</strong> to generate a unique, single-use director code and email it directly to that person. The code expires in 7 days. Once they register, it's marked as used automatically.</p>
      </div>
    </div>
  );
}

// ── Reusable sub-components ───────────────────────────────────────────────────────


// ── Helper components ────────────────────────────────────────────────────────

function formatRehearsalDate(value) {
  if (!value) return "Date not set";
  const dateOnly = typeof value === "string" ? value.split("T")[0] : value;
  const date = new Date(dateOnly + "T12:00:00");
  if (isNaN(date.getTime())) return "Date not set";
  return date.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });
}

function formatTime(value) {
  if (!value) return "Time not set";
  const timePart = value.includes("T") ? value.split("T")[1] : value;
  const parts = timePart.split(":");
  if (parts.length < 2) return "Time not set";
  const date = new Date();
  date.setHours(Number(parts[0]));
  date.setMinutes(Number(parts[1]));
  if (isNaN(date.getTime())) return "Time not set";
  return date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

function StatCard({ title, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-xl lg:p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{title}</p>
      <p className="mt-2 text-3xl font-black text-white lg:text-2xl">{value ?? 0}</p>
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-center">
      <p className="text-2xl font-black text-white">{value ?? 0}</p>
      <p className="mt-1 text-xs font-bold uppercase tracking-wide text-slate-400">{label}</p>
    </div>
  );
}

function QuickButton({ icon: Icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-slate-200 transition-all hover:bg-white/10 hover:scale-[1.02]"
    >
      <Icon size={15} />
      {label}
    </button>
  );
}

function SongInput({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <label>
      <span className="text-sm font-bold text-slate-200">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-amber-400"
      />
    </label>
  );
}

function FilterSelect({ value, onChange, children }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-2 text-sm text-white outline-none focus:border-amber-400"
    >
      {children}
    </select>
  );
}

function SongPill({ label }) {
  return (
    <span className="rounded-full border border-white/10 bg-slate-900 px-3 py-1 text-xs font-bold text-slate-300">
      {label}
    </span>
  );
}

function StatusBadge({ status }) {
  const styles = {
    Pending:  "bg-amber-500/20 text-amber-200",
    Approved: "bg-emerald-500/20 text-emerald-200",
    Rejected: "bg-red-500/20 text-red-300",
  };
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-black ${styles[status] ?? "bg-slate-700 text-slate-300"}`}>
      {status ?? "Unknown"}
    </span>
  );
}

function DashboardCard({ title, children }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl">
      <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">{title}</h3>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function InviteMemberForm({ inviteCode, orgName, token, onClose }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const [errorMsg, setErrorMsg] = useState("");

  const inviteLink = `${window.location.origin}/?invite=${inviteCode}`;
  const inp = "mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-amber-400";

  const handleSend = async () => {
    if (!email.trim()) return;
    setStatus("sending");
    setErrorMsg("");
    try {
      const res = await fetch(`${API_BASE}/api/Auth/send-invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ email: email.trim(), name: name.trim(), inviteLink, orgName }),
      });
      if (res.ok) {
        setStatus("sent");
      } else {
        const t = await res.text();
        setErrorMsg(t || "Could not send invite.");
        setStatus("error");
      }
    } catch {
      setErrorMsg("Network error. Try again.");
      setStatus("error");
    }
  };

  if (status === "sent") {
    return (
      <div className="rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-xl text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-400/10">
          <svg className="h-7 w-7 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-black">Invite Sent!</h3>
        <p className="mt-2 text-sm text-slate-400">
          We emailed <span className="font-bold text-white">{email}</span> with a link to join {orgName}.
          They just click it and set up their account.
        </p>
        <button onClick={onClose} className="mt-5 rounded-2xl bg-white/10 px-6 py-3 font-bold text-slate-200 hover:bg-white/15">
          Done
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-xl">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-black">Invite Member</h3>
        <button onClick={onClose} className="rounded-xl bg-white/10 px-3 py-1 text-sm font-bold text-slate-300 hover:bg-white/20">
          Cancel
        </button>
      </div>
      <p className="mt-2 text-sm text-slate-400">
        We'll email them a personal invite link. They click it and create their own account — no password from you needed.
      </p>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <label>
          <span className="text-sm font-bold text-slate-300">Their Name <span className="text-slate-500 font-normal">(optional)</span></span>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Smith" className={inp} />
        </label>
        <label>
          <span className="text-sm font-bold text-slate-300">Their Email</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@email.com" className={inp} />
        </label>
      </div>

      {/* Or copy link manually */}
      <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950 p-3">
        <p className="text-xs text-slate-500 mb-2">Or share the link yourself:</p>
        <div className="flex items-center gap-2">
          <p className="flex-1 truncate font-mono text-xs text-amber-300">{inviteLink}</p>
          <CopyInviteLinkButton code={inviteCode} />
        </div>
      </div>

      {status === "error" && (
        <p className="mt-3 text-sm text-red-400">{errorMsg}</p>
      )}

      <button
        onClick={handleSend}
        disabled={status === "sending" || !email.trim()}
        className="mt-5 rounded-2xl bg-amber-400 px-6 py-3 font-black text-slate-950 transition-all hover:scale-[1.02] disabled:opacity-50"
      >
        {status === "sending" ? "Sending…" : "Send Invite Email"}
      </button>
    </div>
  );
}
