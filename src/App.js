import { useState, useEffect, useRef, useCallback } from "react";

/*
═══════════════════════════════════════════════════
  কুইজ মাস্টার — Gamified Single-Question Quiz
  • Each question has its own theme + reward title
  • Students get a shareable link to ONE question
  • Admin is password-protected with analytics
  • Dynamic theme shifts per question category
═══════════════════════════════════════════════════
*/

// ── Theme Presets ──
const THEMES = {
  accounting: {
    name: "হিসাববিজ্ঞান",
    bg: "linear-gradient(140deg, #0b1628 0%, #122040 40%, #0d1a30 100%)",
    card: "linear-gradient(135deg, #132244, #1a2d55)",
    accent: "#4fc3f7",
    accentGlow: "rgba(79,195,247,0.3)",
    correct: "#00e5a0",
    wrong: "#ff5c6c",
    badge: "#0d47a1",
    icon: "📒",
    pattern: "radial-gradient(circle at 20% 80%, rgba(79,195,247,0.05) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(0,229,160,0.04) 0%, transparent 50%)",
  },
  finance: {
    name: "ফিন্যান্স ও ব্যাংকিং",
    bg: "linear-gradient(140deg, #1a0e2e 0%, #2d1854 40%, #1a0e2e 100%)",
    card: "linear-gradient(135deg, #2a1848, #3b2264)",
    accent: "#ce93d8",
    accentGlow: "rgba(206,147,216,0.3)",
    correct: "#69f0ae",
    wrong: "#ff7043",
    badge: "#6a1b9a",
    icon: "🏦",
    pattern: "radial-gradient(circle at 70% 70%, rgba(206,147,216,0.06) 0%, transparent 50%), radial-gradient(circle at 30% 30%, rgba(105,240,174,0.04) 0%, transparent 50%)",
  },
  management: {
    name: "ব্যবসায় সংগঠন ও ব্যবস্থাপনা",
    bg: "linear-gradient(140deg, #1b2e1b 0%, #1e3a1e 40%, #142814 100%)",
    card: "linear-gradient(135deg, #1e3a22, #2a4e30)",
    accent: "#aed581",
    accentGlow: "rgba(174,213,129,0.3)",
    correct: "#76ff03",
    wrong: "#ff5252",
    badge: "#2e7d32",
    icon: "🏢",
    pattern: "radial-gradient(circle at 50% 90%, rgba(174,213,129,0.05) 0%, transparent 50%), radial-gradient(circle at 80% 10%, rgba(118,255,3,0.03) 0%, transparent 50%)",
  },
  marketing: {
    name: "উৎপাদন ব্যবস্থাপনা ও বিপণন",
    bg: "linear-gradient(140deg, #2e1a0a 0%, #3d2515 40%, #2a1608 100%)",
    card: "linear-gradient(135deg, #3a2010, #4e2e1a)",
    accent: "#ffb74d",
    accentGlow: "rgba(255,183,77,0.3)",
    correct: "#00e676",
    wrong: "#ef5350",
    badge: "#e65100",
    icon: "📦",
    pattern: "radial-gradient(circle at 60% 80%, rgba(255,183,77,0.06) 0%, transparent 50%), radial-gradient(circle at 20% 20%, rgba(0,230,118,0.03) 0%, transparent 50%)",
  },
  general: {
    name: "সাধারণ",
    bg: "linear-gradient(140deg, #0f0f23 0%, #1a1a3e 40%, #0f0f23 100%)",
    card: "linear-gradient(135deg, #181840, #222260)",
    accent: "#7c8cf8",
    accentGlow: "rgba(124,140,248,0.3)",
    correct: "#00e676",
    wrong: "#ff5252",
    badge: "#283593",
    icon: "📝",
    pattern: "radial-gradient(circle at 40% 60%, rgba(124,140,248,0.05) 0%, transparent 50%)",
  },
};

const SUBJECT_THEME_MAP = {
  "হিসাববিজ্ঞান": "accounting",
  "ফিন্যান্স ও ব্যাংকিং": "finance",
  "ব্যবসায় সংগঠন ও ব্যবস্থাপনা": "management",
  "উৎপাদন ব্যবস্থাপনা ও বিপণন": "marketing",
};

const getTheme = (subject) => THEMES[SUBJECT_THEME_MAP[subject]] || THEMES.general;

// ── Seed Data ──
const SEED_SUBJECTS = ["হিসাববিজ্ঞান", "ব্যবসায় সংগঠন ও ব্যবস্থাপনা", "ফিন্যান্স ও ব্যাংকিং", "উৎপাদন ব্যবস্থাপনা ও বিপণন"];

const SEED_QUESTIONS = [
  {
    id: "q1", subject: "হিসাববিজ্ঞান", board: "ময়মনসিংহ বোর্ড ২০২৫",
    questionBn: "'NSF' এর পূর্ণরূপ কী?",
    options: ["Not Sufficient Fund", "Not Suitable Fund", "Not So Fund", "Not Significant Fund"],
    correctIndex: 0,
    explanation: "NSF এর পূর্ণরূপ হলো Not Sufficient Fund, যার অর্থ অপর্যাপ্ত তহবিল।",
    rewardTitle: "ব্যাংকিং বিশেষজ্ঞ 🏦",
  },
  {
    id: "q2", subject: "হিসাববিজ্ঞান", board: "ঢাকা বোর্ড ২০২৫",
    questionBn: "দুতরফা দাখিলা পদ্ধতির জনক কে?",
    options: ["লুকা প্যাসিওলি", "অ্যাডাম স্মিথ", "জন মিল", "ডেভিড রিকার্ডো"],
    correctIndex: 0,
    explanation: "লুকা প্যাসিওলি ১৪৯৪ সালে তাঁর বইতে দুতরফা দাখিলা পদ্ধতির বিস্তারিত আলোচনা করেন।",
    rewardTitle: "হিসাবশাস্ত্র পণ্ডিত 📜",
  },
  {
    id: "q3", subject: "হিসাববিজ্ঞান", board: "চট্টগ্রাম বোর্ড ২০২৫",
    questionBn: "নগদান বই কোন ধরনের হিসাবের বই?",
    options: ["সহকারী বই", "প্রধান বই", "প্রধান ও সহকারী উভয়ই", "কোনটিই নয়"],
    correctIndex: 2,
    explanation: "নগদান বই একই সাথে প্রধান বই ও সহকারী বই হিসেবে কাজ করে।",
    rewardTitle: "নগদ হিসাবের রাজা 👑",
  },
  {
    id: "q4", subject: "ফিন্যান্স ও ব্যাংকিং", board: "রাজশাহী বোর্ড ২০২৫",
    questionBn: "বাংলাদেশের কেন্দ্রীয় ব্যাংকের নাম কী?",
    options: ["সোনালী ব্যাংক", "বাংলাদেশ ব্যাংক", "জনতা ব্যাংক", "অগ্রণী ব্যাংক"],
    correctIndex: 1,
    explanation: "বাংলাদেশ ব্যাংক হলো বাংলাদেশের কেন্দ্রীয় ব্যাংক যা ১৯৭২ সালে প্রতিষ্ঠিত হয়।",
    rewardTitle: "কেন্দ্রীয় ব্যাংক মাস্টার 🏛️",
  },
  {
    id: "q5", subject: "ব্যবসায় সংগঠন ও ব্যবস্থাপনা", board: "সিলেট বোর্ড ২০২৫",
    questionBn: "ব্যবস্থাপনার প্রথম কাজ কোনটি?",
    options: ["সংগঠন", "পরিকল্পনা", "নির্দেশনা", "নিয়ন্ত্রণ"],
    correctIndex: 1,
    explanation: "পরিকল্পনা হলো ব্যবস্থাপনার প্রথম ও প্রধান কাজ।",
    rewardTitle: "পরিকল্পনা গুরু 🎯",
  },
];

// ── Particle Burst ──
function ParticleBurst({ x, y, color, onDone }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const particles = Array.from({ length: 30 }, () => ({
      x: 0, y: 0,
      vx: (Math.random() - 0.5) * 14,
      vy: (Math.random() - 0.5) * 14 - 2,
      life: 1,
      size: Math.random() * 5 + 2,
      color: [color, "#FFD700", "#fff", color][Math.floor(Math.random() * 4)],
    }));
    let frame;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      particles.forEach((p) => {
        p.x += p.vx; p.y += p.vy; p.vy += 0.35; p.life -= 0.02;
        if (p.life > 0) {
          alive = true;
          ctx.globalAlpha = p.life;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x + canvas.width / 2, p.y + canvas.height / 2, p.size * p.life, 0, Math.PI * 2);
          ctx.fill();
        }
      });
      if (alive) frame = requestAnimationFrame(animate);
      else onDone?.();
    };
    animate();
    return () => cancelAnimationFrame(frame);
  }, []);
  return (
    <canvas ref={canvasRef} width={240} height={240}
      style={{ position: "fixed", left: x - 120, top: y - 120, pointerEvents: "none", zIndex: 9999 }} />
  );
}

// ── Confetti ──
function Confetti({ active }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext("2d");
    const colors = ["#FFD700", "#FF6B6B", "#4FC3F7", "#69F0AE", "#FF8A65", "#CE93D8", "#AED581"];
    const pieces = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * -canvas.height,
      w: Math.random() * 10 + 4,
      h: Math.random() * 6 + 3,
      vx: (Math.random() - 0.5) * 3,
      vy: Math.random() * 4 + 2,
      rot: Math.random() * 360,
      rotV: (Math.random() - 0.5) * 10,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: 1,
    }));
    let frame;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      pieces.forEach((p) => {
        p.x += p.vx; p.y += p.vy; p.rot += p.rotV; p.life -= 0.004;
        if (p.life > 0 && p.y < canvas.height + 50) {
          alive = true;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rot * Math.PI) / 180);
          ctx.globalAlpha = Math.min(p.life, 1);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
          ctx.restore();
        }
      });
      if (alive) frame = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(frame);
  }, [active]);
  if (!active) return null;
  return <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 9998 }} />;
}

const patternOverlay = (theme) => ({ background: theme.pattern, pointerEvents: "none", zIndex: 1 });

// ── Admin Login ──
function AdminLogin({ onLogin, onBack }) {
  const [pass, setPass] = useState("");
  const [error, setError] = useState(false);
  const ADMIN_PASS = "admin123";

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "linear-gradient(160deg, #0a0a16 0%, #12122e 50%, #0a0a16 100%)",
      fontFamily: "'Noto Sans Bengali', 'DM Sans', sans-serif", padding: 20,
    }}>
      <div style={{
        background: "linear-gradient(135deg, #141430, #1c1c44)", borderRadius: 24,
        padding: "40px 32px", maxWidth: 380, width: "100%",
        border: "1.5px solid #2a2a55", boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
        textAlign: "center",
      }}>
        <div style={{
          width: 72, height: 72, margin: "0 auto 20px", borderRadius: 20,
          background: "linear-gradient(135deg, #e53935, #c62828)",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32,
          boxShadow: "0 8px 24px rgba(229,57,53,0.3)",
        }}>🔐</div>
        <h2 style={{ color: "#e0e0f0", fontSize: 20, fontWeight: 800, margin: "0 0 6px" }}>অ্যাডমিন লগইন</h2>
        <p style={{ color: "#6666aa", fontSize: 13, margin: "0 0 24px" }}>পাসওয়ার্ড: admin123</p>
        <input type="password" value={pass} onChange={(e) => { setPass(e.target.value); setError(false); }}
          placeholder="পাসওয়ার্ড..."
          onKeyDown={(e) => { if (e.key === "Enter") { if (pass === ADMIN_PASS) onLogin(); else setError(true); } }}
          style={{
            width: "100%", padding: "14px 16px", borderRadius: 14,
            border: `1.5px solid ${error ? "#ff5252" : "#2a2a55"}`, background: "#0e0e24",
            color: "#e0e0f0", fontSize: 15, outline: "none", boxSizing: "border-box",
            marginBottom: 10,
          }} />
        {error && <p style={{ color: "#ff5252", fontSize: 12, margin: "0 0 10px" }}>ভুল পাসওয়ার্ড</p>}
        <button onClick={() => { if (pass === ADMIN_PASS) onLogin(); else setError(true); }}
          style={{
            width: "100%", padding: "14px", borderRadius: 14, border: "none",
            background: "linear-gradient(135deg, #e53935, #c62828)", color: "#fff",
            fontSize: 15, fontWeight: 800, cursor: "pointer", marginBottom: 12,
          }}>প্রবেশ করুন</button>
        <button onClick={onBack} style={{
          width: "100%", padding: "12px", borderRadius: 14,
          border: "1px solid #2a2a55", background: "transparent",
          color: "#6666aa", fontSize: 13, fontWeight: 600, cursor: "pointer",
        }}>← ফিরে যান</button>
      </div>
    </div>
  );
}

// ── Admin Panel ──
function AdminPanel({ questions, setQuestions, subjects, setSubjects, analytics, onBack }) {
  const [newQ, setNewQ] = useState({ subject: subjects[0] || "", board: "", questionBn: "", options: ["", "", "", ""], correctIndex: 0, explanation: "", rewardTitle: "" });
  const [newSubject, setNewSubject] = useState("");
  const [tab, setTab] = useState("questions");
  const [editId, setEditId] = useState(null);
  const [toast, setToast] = useState("");
  const [copiedId, setCopiedId] = useState(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2500); };

  const handleSave = () => {
    if (!newQ.questionBn.trim() || newQ.options.some((o) => !o.trim())) { showToast("⚠️ সব ফিল্ড পূরণ করুন"); return; }
    if (editId) {
      setQuestions((prev) => prev.map((q) => (q.id === editId ? { ...newQ, id: editId } : q)));
      setEditId(null); showToast("✅ আপডেট হয়েছে");
    } else {
      setQuestions((prev) => [...prev, { ...newQ, id: "q" + Date.now() }]);
      showToast("✅ যোগ হয়েছে");
    }
    setNewQ({ subject: subjects[0] || "", board: "", questionBn: "", options: ["", "", "", ""], correctIndex: 0, explanation: "", rewardTitle: "" });
  };

  const copyLink = (qId) => {
    const link = `${window.location.origin}${window.location.pathname}?q=${qId}`;
    navigator.clipboard?.writeText(link).then(() => { setCopiedId(qId); setTimeout(() => setCopiedId(null), 2000); }).catch(() => { setCopiedId(qId); setTimeout(() => setCopiedId(null), 2000); });
  };

  const getStats = (qId) => analytics[qId] || { total: 0, correct: 0, wrong: 0 };

  const S = {
    input: { width: "100%", padding: "12px 14px", borderRadius: 12, border: "1.5px solid #2a2a4a", background: "#0c0c20", color: "#d0d0f0", fontSize: 14, fontFamily: "'Noto Sans Bengali', sans-serif", outline: "none", boxSizing: "border-box" },
    label: { fontSize: 11, fontWeight: 700, color: "#7777bb", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 5, display: "block" },
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #08081a 0%, #101030 50%, #08081a 100%)", color: "#d0d0f0", fontFamily: "'Noto Sans Bengali', 'DM Sans', sans-serif" }}>
      {toast && <div style={{ position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)", zIndex: 999, background: "#1a1a3e", color: "#e0e0ff", padding: "12px 28px", borderRadius: 14, border: "1px solid #3333aa", fontSize: 14, fontWeight: 600, boxShadow: "0 8px 32px rgba(0,0,0,0.6)", animation: "slideDown 0.3s ease" }}>{toast}</div>}

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "20px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <button onClick={onBack} style={{ background: "none", border: "1px solid #2a2a55", color: "#7777bb", borderRadius: 12, padding: "8px 16px", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>← বের হন</button>
          <h1 style={{ fontSize: 20, fontWeight: 900, color: "#e53935", margin: 0 }}>🔐 অ্যাডমিন প্যানেল</h1>
          <div style={{ width: 80 }} />
        </div>

        <div style={{ display: "flex", gap: 6, marginBottom: 24, overflowX: "auto" }}>
          {[["questions", "➕ প্রশ্ন"], ["subjects", "📚 বিষয়"], ["manage", "📋 ম্যানেজ"], ["analytics", "📊 রিপোর্ট"]].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)} style={{
              flex: 1, padding: "11px 8px", borderRadius: 12, cursor: "pointer", fontSize: 12, fontWeight: 700,
              border: tab === key ? "2px solid #e53935" : "1.5px solid #1e1e40",
              background: tab === key ? "linear-gradient(135deg, #2a1018, #3a1828)" : "#0c0c20",
              color: tab === key ? "#ff8a80" : "#555588", whiteSpace: "nowrap",
            }}>{label}</button>
          ))}
        </div>

        {tab === "questions" && (
          <div style={{ background: "#0c0c22", borderRadius: 18, padding: 24, border: "1px solid #1a1a38" }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: "#ff8a80", marginTop: 0, marginBottom: 20 }}>{editId ? "✏️ সম্পাদনা" : "➕ নতুন প্রশ্ন"}</h2>
            <div style={{ display: "flex", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 180 }}>
                <label style={S.label}>বিষয়</label>
                <select value={newQ.subject} onChange={(e) => setNewQ({ ...newQ, subject: e.target.value })} style={{ ...S.input, cursor: "pointer" }}>
                  {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div style={{ flex: 1, minWidth: 180 }}>
                <label style={S.label}>বোর্ড</label>
                <input value={newQ.board} onChange={(e) => setNewQ({ ...newQ, board: e.target.value })} placeholder="ঢাকা বোর্ড ২০২৫" style={S.input} />
              </div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={S.label}>প্রশ্ন (বাংলায়)</label>
              <textarea value={newQ.questionBn} onChange={(e) => setNewQ({ ...newQ, questionBn: e.target.value })} rows={2} placeholder="প্রশ্ন লিখুন..." style={{ ...S.input, resize: "vertical" }} />
            </div>
            <label style={S.label}>অপশন (সঠিক উত্তরে ক্লিক)</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
              {newQ.options.map((opt, i) => (
                <div key={i} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <button onClick={() => setNewQ({ ...newQ, correctIndex: i })} style={{ width: 30, height: 30, borderRadius: "50%", border: `2px solid ${newQ.correctIndex === i ? "#00e676" : "#2a2a55"}`, background: newQ.correctIndex === i ? "rgba(0,230,118,0.12)" : "transparent", color: newQ.correctIndex === i ? "#00e676" : "#555588", cursor: "pointer", fontSize: 12, fontWeight: 900, flexShrink: 0 }}>{String.fromCharCode(65 + i)}</button>
                  <input value={opt} onChange={(e) => { const o = [...newQ.options]; o[i] = e.target.value; setNewQ({ ...newQ, options: o }); }} placeholder={`অপশন ${String.fromCharCode(65 + i)}`} style={S.input} />
                </div>
              ))}
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={S.label}>🏆 পুরস্কার শিরোনাম (সঠিক উত্তরে)</label>
              <input value={newQ.rewardTitle} onChange={(e) => setNewQ({ ...newQ, rewardTitle: e.target.value })} placeholder="ব্যাংকিং বিশেষজ্ঞ 🏦" style={S.input} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={S.label}>ব্যাখ্যা</label>
              <textarea value={newQ.explanation} onChange={(e) => setNewQ({ ...newQ, explanation: e.target.value })} rows={2} placeholder="ব্যাখ্যা..." style={{ ...S.input, resize: "vertical" }} />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={handleSave} style={{ flex: 1, padding: 14, borderRadius: 14, border: "none", background: "linear-gradient(135deg, #e53935, #c62828)", color: "#fff", fontSize: 15, fontWeight: 800, cursor: "pointer" }}>{editId ? "💾 আপডেট" : "✅ সংরক্ষণ"}</button>
              {editId && <button onClick={() => { setEditId(null); setNewQ({ subject: subjects[0] || "", board: "", questionBn: "", options: ["", "", "", ""], correctIndex: 0, explanation: "", rewardTitle: "" }); }} style={{ padding: "14px 20px", borderRadius: 14, border: "1px solid #333", background: "transparent", color: "#888", cursor: "pointer" }}>বাতিল</button>}
            </div>
          </div>
        )}

        {tab === "subjects" && (
          <div style={{ background: "#0c0c22", borderRadius: 18, padding: 24, border: "1px solid #1a1a38" }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: "#ff8a80", marginTop: 0 }}>📚 বিষয়</h2>
            <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
              <input value={newSubject} onChange={(e) => setNewSubject(e.target.value)} placeholder="নতুন বিষয়..." style={{ ...S.input, flex: 1 }} />
              <button onClick={() => { if (newSubject.trim() && !subjects.includes(newSubject.trim())) { setSubjects((p) => [...p, newSubject.trim()]); setNewSubject(""); showToast("✅ যোগ হয়েছে"); } }} style={{ padding: "12px 24px", borderRadius: 14, border: "none", background: "linear-gradient(135deg, #e53935, #c62828)", color: "#fff", fontWeight: 700, cursor: "pointer" }}>যোগ</button>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {subjects.map((s) => (
                <div key={s} style={{ background: "#141430", border: "1px solid #222250", borderRadius: 10, padding: "8px 14px", fontSize: 13, color: "#aab", display: "flex", alignItems: "center", gap: 10 }}>
                  {getTheme(s).icon} {s}
                  <span onClick={() => { setSubjects((p) => p.filter((x) => x !== s)); showToast("🗑 মুছে ফেলা হয়েছে"); }} style={{ cursor: "pointer", color: "#ff5252", fontSize: 16, fontWeight: 900 }}>×</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "manage" && (
          <div style={{ background: "#0c0c22", borderRadius: 18, padding: 24, border: "1px solid #1a1a38" }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: "#ff8a80", marginTop: 0 }}>📋 সকল প্রশ্ন ({questions.length})</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {questions.map((q) => {
                const theme = getTheme(q.subject);
                const stats = getStats(q.id);
                return (
                  <div key={q.id} style={{ background: "#0e0e28", borderRadius: 14, padding: 16, border: `1px solid ${theme.badge}44` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                      <span style={{ width: 34, height: 34, borderRadius: 10, background: theme.badge, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{theme.icon}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "#ccd", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{q.questionBn}</div>
                        <div style={{ fontSize: 11, color: "#555588" }}>{q.subject} • {q.board} {q.rewardTitle && `• 🏆 ${q.rewardTitle}`}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 12, fontSize: 11, color: "#666699", marginBottom: 8, paddingLeft: 46 }}>
                      <span>👥 {stats.total}</span>
                      <span style={{ color: "#69f0ae" }}>✓ {stats.correct}</span>
                      <span style={{ color: "#ff5252" }}>✗ {stats.wrong}</span>
                    </div>
                    <div style={{ display: "flex", gap: 6, paddingLeft: 46, flexWrap: "wrap" }}>
                      <button onClick={() => copyLink(q.id)} style={{ padding: "5px 12px", borderRadius: 8, border: "1px solid #2a2a55", background: copiedId === q.id ? "rgba(0,230,118,0.1)" : "transparent", color: copiedId === q.id ? "#69f0ae" : "#7777bb", cursor: "pointer", fontSize: 11, fontWeight: 700 }}>{copiedId === q.id ? "✓ কপি হয়েছে" : "🔗 লিংক কপি"}</button>
                      <button onClick={() => { setNewQ({ ...q }); setEditId(q.id); setTab("questions"); }} style={{ padding: "5px 12px", borderRadius: 8, border: "1px solid #2a2a55", background: "transparent", color: "#7777bb", cursor: "pointer", fontSize: 11, fontWeight: 700 }}>✏️ সম্পাদনা</button>
                      <button onClick={() => { setQuestions((p) => p.filter((x) => x.id !== q.id)); showToast("🗑 মুছে ফেলা হয়েছে"); }} style={{ padding: "5px 12px", borderRadius: 8, border: "1px solid #331a22", background: "transparent", color: "#ff5252", cursor: "pointer", fontSize: 11, fontWeight: 700 }}>🗑 মুছুন</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab === "analytics" && (
          <div style={{ background: "#0c0c22", borderRadius: 18, padding: 24, border: "1px solid #1a1a38" }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: "#ff8a80", marginTop: 0 }}>📊 পরিসংখ্যান</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 24 }}>
              {[
                ["মোট উত্তর", Object.values(analytics).reduce((a, b) => a + b.total, 0), "#4fc3f7", "👥"],
                ["সঠিক", Object.values(analytics).reduce((a, b) => a + b.correct, 0), "#69f0ae", "✓"],
                ["ভুল", Object.values(analytics).reduce((a, b) => a + b.wrong, 0), "#ff5252", "✗"],
              ].map(([label, val, color, icon]) => (
                <div key={label} style={{ background: "#0e0e28", borderRadius: 14, padding: "16px 12px", border: "1px solid #1a1a38", textAlign: "center" }}>
                  <div style={{ fontSize: 22, marginBottom: 4 }}>{icon}</div>
                  <div style={{ fontSize: 24, fontWeight: 900, color }}>{val}</div>
                  <div style={{ fontSize: 11, color: "#555588", fontWeight: 600 }}>{label}</div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {questions.map((q) => {
                const stats = getStats(q.id);
                const pct = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
                const theme = getTheme(q.subject);
                return (
                  <div key={q.id} style={{ background: "#0e0e28", borderRadius: 14, padding: 16, border: "1px solid #1a1a38" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                      <span style={{ fontSize: 18 }}>{theme.icon}</span>
                      <div style={{ flex: 1, fontSize: 13, fontWeight: 600, color: "#bbc" }}>{q.questionBn}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                      <div style={{ flex: 1, height: 10, borderRadius: 5, background: "#1a1a38", overflow: "hidden", display: "flex" }}>
                        {stats.total > 0 && (<><div style={{ width: `${pct}%`, height: "100%", background: "linear-gradient(90deg, #00c853, #69f0ae)", transition: "width 0.6s" }} /><div style={{ width: `${100 - pct}%`, height: "100%", background: "linear-gradient(90deg, #ff5252, #ff8a80)" }} /></>)}
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 800, color: pct >= 50 ? "#69f0ae" : "#ff5252", minWidth: 36, textAlign: "right" }}>{pct}%</span>
                    </div>
                    <div style={{ display: "flex", gap: 16, fontSize: 12, color: "#666699" }}>
                      <span>👥 মোট: {stats.total}</span>
                      <span style={{ color: "#69f0ae" }}>✓ সঠিক: {stats.correct}</span>
                      <span style={{ color: "#ff5252" }}>✗ ভুল: {stats.wrong}</span>
                      <span style={{ color: "#4fc3f7" }}>📊 সঠিকতা: {pct}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Single Question Quiz View ──
function QuizView({ question, onRecord, onHome }) {
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [showTitle, setShowTitle] = useState(false);
  const [particles, setParticles] = useState([]);
  const [timeLeft, setTimeLeft] = useState(25);
  const [timerActive, setTimerActive] = useState(true);
  const [answered, setAnswered] = useState(false);
  const timerRef = useRef(null);

  const theme = getTheme(question.subject);
  const optionLabels = ["ক", "খ", "গ", "ঘ"];

  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      timerRef.current = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    } else if (timerActive && timeLeft === 0 && !answered) {
      handleAnswer(-1);
    }
    return () => clearTimeout(timerRef.current);
  }, [timerActive, timeLeft, answered]);

  const handleAnswer = (idx) => {
    if (answered) return;
    clearTimeout(timerRef.current);
    setTimerActive(false);
    setSelected(idx);
    setShowResult(true);
    setAnswered(true);
    const isCorrect = idx === question.correctIndex;
    onRecord(isCorrect);
    if (isCorrect) {
      setTimeout(() => setShowTitle(true), 1400);
    }
  };

  const timerPct = (timeLeft / 25) * 100;
  const timerColor = timeLeft > 15 ? theme.correct : timeLeft > 7 ? "#FFD700" : theme.wrong;
  const isCorrect = selected === question.correctIndex;

  // ── Title Reward ──
  if (showTitle && isCorrect) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: theme.bg, fontFamily: "'Noto Sans Bengali', 'DM Sans', sans-serif", position: "relative", overflow: "hidden" }}>
        <Confetti active={true} />
        <div style={{ ...patternOverlay(theme), position: "absolute", inset: 0 }} />
        <div style={{ textAlign: "center", padding: "32px 24px", maxWidth: 420, width: "100%", position: "relative", zIndex: 10, animation: "titleReveal 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)" }}>
          <div style={{ width: 110, height: 110, margin: "0 auto 24px", borderRadius: "50%", background: `linear-gradient(135deg, ${theme.accent}, ${theme.correct})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 52, boxShadow: `0 0 50px ${theme.accentGlow}, 0 0 100px ${theme.accentGlow}`, animation: "pulseGlow 2s ease-in-out infinite" }}>🏆</div>
          <h2 style={{ color: theme.correct, fontSize: 13, fontWeight: 700, margin: "0 0 8px", letterSpacing: 3, textTransform: "uppercase" }}>আপনি অর্জন করেছেন</h2>
          <h1 style={{ fontSize: 28, fontWeight: 900, margin: "0 0 12px", color: "#fff", textShadow: `0 0 30px ${theme.accentGlow}`, lineHeight: 1.4 }}>{question.rewardTitle || "কুইজ চ্যাম্পিয়ন ⭐"}</h1>
          <div style={{ display: "inline-block", background: `${theme.correct}18`, border: `1px solid ${theme.correct}44`, borderRadius: 10, padding: "6px 18px", fontSize: 13, color: theme.correct, fontWeight: 700, marginBottom: 24 }}>✓ সঠিক উত্তর: {question.options[question.correctIndex]}</div>

          <div style={{ background: theme.card, borderRadius: 16, padding: "16px 20px", border: `1px solid ${theme.accent}33`, marginBottom: 24, textAlign: "left" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: theme.accent, marginBottom: 6, letterSpacing: 1 }}>💡 ব্যাখ্যা</div>
            <div style={{ fontSize: 13, lineHeight: 1.8, color: "#bbb" }}>{question.explanation}</div>
          </div>

          <button onClick={onHome} style={{ padding: "14px 40px", borderRadius: 16, border: "none", background: `linear-gradient(135deg, ${theme.accent}, ${theme.badge})`, color: "#fff", fontSize: 15, fontWeight: 800, cursor: "pointer", boxShadow: `0 4px 24px ${theme.accentGlow}` }}>🏠 হোমে ফিরুন</button>
        </div>
      </div>
    );
  }

  // ── Wrong / Timeout ──
  if (showResult && !isCorrect && answered) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: theme.bg, fontFamily: "'Noto Sans Bengali', 'DM Sans', sans-serif", position: "relative" }}>
        <div style={{ ...patternOverlay(theme), position: "absolute", inset: 0 }} />
        <div style={{ textAlign: "center", padding: "32px 24px", maxWidth: 420, width: "100%", position: "relative", zIndex: 10, animation: "fadeSlideUp 0.5s ease" }}>
          <div style={{ width: 90, height: 90, margin: "0 auto 24px", borderRadius: "50%", background: `${theme.wrong}15`, border: `3px solid ${theme.wrong}55`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 42 }}>{selected === -1 ? "⏱" : "😔"}</div>
          <h2 style={{ color: theme.wrong, fontSize: 22, fontWeight: 900, margin: "0 0 8px" }}>{selected === -1 ? "সময় শেষ!" : "ভুল উত্তর!"}</h2>
          <p style={{ color: "#777", fontSize: 14, margin: "0 0 4px" }}>সঠিক উত্তর:</p>
          <p style={{ color: theme.correct, fontSize: 18, fontWeight: 800, margin: "0 0 12px" }}>{question.options[question.correctIndex]}</p>
          <p style={{ color: "#666", fontSize: 13, margin: "0 0 20px" }}>আপনি পেতে পারতেন: <strong style={{ color: theme.accent }}>{question.rewardTitle || "কুইজ চ্যাম্পিয়ন ⭐"}</strong></p>

          <div style={{ background: theme.card, borderRadius: 16, padding: "16px 20px", border: `1px solid ${theme.accent}22`, marginBottom: 24, textAlign: "left" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: theme.accent, marginBottom: 6, letterSpacing: 1 }}>💡 ব্যাখ্যা</div>
            <div style={{ fontSize: 13, lineHeight: 1.8, color: "#bbb" }}>{question.explanation}</div>
          </div>

          <button onClick={onHome} style={{ padding: "14px 40px", borderRadius: 16, border: `1px solid ${theme.accent}33`, background: theme.card, color: "#aaa", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>🏠 হোমে ফিরুন</button>
        </div>
      </div>
    );
  }

  // ── Active Question ──
  return (
    <div style={{ minHeight: "100vh", background: theme.bg, color: "#e0e0f0", fontFamily: "'Noto Sans Bengali', 'DM Sans', sans-serif", position: "relative", overflow: "hidden" }}>
      <div style={{ ...patternOverlay(theme), position: "absolute", inset: 0 }} />
      {particles.map((p) => <ParticleBurst key={p.id} {...p} color={theme.correct} onDone={() => setParticles((pp) => pp.filter((x) => x.id !== p.id))} />)}

      <div style={{ maxWidth: 480, margin: "0 auto", padding: "20px 16px", position: "relative", zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <button onClick={onHome} style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: 18, padding: 4 }}>←</button>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: `${theme.badge}55`, borderRadius: 10, padding: "6px 14px" }}>
            <span style={{ fontSize: 16 }}>{theme.icon}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: theme.accent }}>{question.subject}</span>
          </div>
          <div style={{ width: 30 }} />
        </div>

        {/* Timer */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
          <div style={{ position: "relative", width: 68, height: 68 }}>
            <svg width={68} height={68} style={{ transform: "rotate(-90deg)" }}>
              <circle cx={34} cy={34} r={29} fill="none" stroke={`${theme.badge}66`} strokeWidth={5} />
              <circle cx={34} cy={34} r={29} fill="none" stroke={timerColor} strokeWidth={5} strokeLinecap="round"
                strokeDasharray={182.2} strokeDashoffset={182.2 - (timerPct / 100) * 182.2}
                style={{ transition: "stroke-dashoffset 1s linear, stroke 0.3s" }} />
            </svg>
            <span style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", fontSize: 22, fontWeight: 900, color: timerColor, fontFamily: "'DM Sans', monospace" }}>{timeLeft}</span>
          </div>
        </div>

        {question.board && (
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 14 }}>
            <span style={{ background: `${theme.badge}33`, borderRadius: 8, padding: "4px 12px", fontSize: 11, color: theme.accent, fontWeight: 600, border: `1px solid ${theme.badge}55` }}>{question.board}</span>
          </div>
        )}

        <div style={{ background: theme.card, borderRadius: 22, padding: "28px 22px", marginBottom: 20, border: `1.5px solid ${theme.accent}22`, boxShadow: `0 12px 40px rgba(0,0,0,0.4)` }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0, lineHeight: 1.7, color: "#f0f0ff" }}>{question.questionBn}</h2>
        </div>

        {question.rewardTitle && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 16, padding: "8px 16px", background: `${theme.accent}08`, borderRadius: 12, border: `1px dashed ${theme.accent}33` }}>
            <span style={{ fontSize: 14 }}>🏆</span>
            <span style={{ fontSize: 12, color: theme.accent, fontWeight: 600 }}>সঠিক উত্তরে পাবেন: {question.rewardTitle}</span>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {question.options.map((opt, i) => {
            let bg = theme.card;
            let border = `${theme.accent}22`;
            let labelBg = `${theme.badge}66`;
            let labelColor = theme.accent;
            return (
              <button key={i}
                onClick={(e) => {
                  if (answered) return;
                  handleAnswer(i);
                  if (i === question.correctIndex) setParticles((p) => [...p, { id: Date.now(), x: e.clientX, y: e.clientY }]);
                }}
                style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 18px", background: bg, border: `1.5px solid ${border}`, borderRadius: 16, cursor: answered ? "default" : "pointer", transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)", color: "#e0e0f0", boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }}
                onMouseEnter={(e) => { if (!answered) { e.currentTarget.style.borderColor = theme.accent; e.currentTarget.style.transform = "translateX(4px)"; } }}
                onMouseLeave={(e) => { if (!answered) { e.currentTarget.style.borderColor = `${theme.accent}22`; e.currentTarget.style.transform = "none"; } }}
              >
                <span style={{ width: 38, height: 38, borderRadius: 12, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 900, background: labelBg, color: labelColor, border: `1.5px solid ${labelColor}44` }}>{optionLabels[i]}</span>
                <span style={{ fontSize: 15, fontWeight: 600, textAlign: "left", flex: 1 }}>{opt}</span>
              </button>
            );
          })}
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;600;700;800;900&family=DM+Sans:wght@400;500;600;700;800;900&display=swap');
        @keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px)} 40%{transform:translateX(8px)} 60%{transform:translateX(-4px)} 80%{transform:translateX(4px)} }
        @keyframes fadeSlideUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideDown { from{opacity:0;transform:translate(-50%,-20px)} to{opacity:1;transform:translate(-50%,0)} }
        @keyframes titleReveal { from{opacity:0;transform:scale(0.8) translateY(20px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes pulseGlow { 0%,100%{transform:scale(1)} 50%{transform:scale(1.05)} }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { margin: 0; }
      `}</style>
    </div>
  );
}

// ── Home Screen ──
function HomeScreen({ questions, subjects, onSelectQuestion, onAdmin }) {
  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #0a0a16 0%, #101028 50%, #0a0a16 100%)", fontFamily: "'Noto Sans Bengali', 'DM Sans', sans-serif", color: "#d0d0f0" }}>
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "28px 16px" }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ width: 80, height: 80, margin: "0 auto 16px", borderRadius: 24, background: "linear-gradient(135deg, #e53935, #ff8a65)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 38, boxShadow: "0 8px 32px rgba(229,57,53,0.3)" }}>🧠</div>
          <h1 style={{ fontSize: 30, fontWeight: 900, margin: "0 0 8px", background: "linear-gradient(135deg, #ff8a65, #e53935, #ff5252)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>কুইজ মাস্টার</h1>
          <p style={{ color: "#555580", fontSize: 14, margin: 0 }}>প্রশ্নের উত্তর দিন, টাইটেল জিতুন!</p>
        </div>

        {subjects.map((subj) => {
          const qs = questions.filter((q) => q.subject === subj);
          if (qs.length === 0) return null;
          const theme = getTheme(subj);
          return (
            <div key={subj} style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 18 }}>{theme.icon}</span>
                <h2 style={{ fontSize: 15, fontWeight: 800, color: theme.accent, margin: 0 }}>{subj}</h2>
                <span style={{ fontSize: 11, color: "#555580", marginLeft: "auto" }}>{qs.length}টি</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {qs.map((q) => (
                  <button key={q.id} onClick={() => onSelectQuestion(q.id)}
                    style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", background: theme.card, border: `1px solid ${theme.accent}18`, borderRadius: 14, cursor: "pointer", color: "#d0d0f0", transition: "all 0.25s", textAlign: "left", width: "100%" }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${theme.accent}55`; e.currentTarget.style.transform = "translateY(-2px)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = `${theme.accent}18`; e.currentTarget.style.transform = "none"; }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4, lineHeight: 1.5 }}>{q.questionBn}</div>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {q.board && <span style={{ fontSize: 10, color: "#666690", background: `${theme.badge}33`, padding: "2px 8px", borderRadius: 6 }}>{q.board}</span>}
                        {q.rewardTitle && <span style={{ fontSize: 10, color: theme.accent, background: `${theme.accent}11`, padding: "2px 8px", borderRadius: 6 }}>🏆 {q.rewardTitle}</span>}
                      </div>
                    </div>
                    <span style={{ color: `${theme.accent}88`, fontSize: 18, flexShrink: 0 }}>→</span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}

        <button onClick={onAdmin} style={{ width: "100%", marginTop: 12, padding: 13, borderRadius: 14, border: "1.5px dashed #2a2a44", background: "transparent", color: "#444466", cursor: "pointer", fontSize: 13, fontWeight: 700 }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#e53935"; e.currentTarget.style.color = "#e53935"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#2a2a44"; e.currentTarget.style.color = "#444466"; }}
        >🔐 অ্যাডমিন প্যানেল</button>
      </div>
    </div>
  );
}

// ── Main App ──
export default function App() {
  const [view, setView] = useState("home");
  const [questions, setQuestions] = useState(SEED_QUESTIONS);
  const [subjects, setSubjects] = useState(SEED_SUBJECTS);
  const [activeQuestionId, setActiveQuestionId] = useState(null);
  const [analytics, setAnalytics] = useState(() => {
    const a = {};
    SEED_QUESTIONS.forEach((q) => {
      const total = Math.floor(Math.random() * 30) + 5;
      const correct = Math.floor(total * (0.3 + Math.random() * 0.5));
      a[q.id] = { total, correct, wrong: total - correct };
    });
    return a;
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const qId = params.get("q");
    if (qId && questions.find((q) => q.id === qId)) {
      setActiveQuestionId(qId);
      setView("quiz");
    }
  }, []);

  const recordAnswer = useCallback((qId, isCorrect) => {
    setAnalytics((prev) => {
      const old = prev[qId] || { total: 0, correct: 0, wrong: 0 };
      return { ...prev, [qId]: { total: old.total + 1, correct: old.correct + (isCorrect ? 1 : 0), wrong: old.wrong + (isCorrect ? 0 : 1) } };
    });
  }, []);

  const goHome = () => { setView("home"); setActiveQuestionId(null); };

  if (view === "admin-login") return <AdminLogin onLogin={() => setView("admin")} onBack={goHome} />;
  if (view === "admin") return <AdminPanel questions={questions} setQuestions={setQuestions} subjects={subjects} setSubjects={setSubjects} analytics={analytics} onBack={goHome} />;

  if (view === "quiz" && activeQuestionId) {
    const q = questions.find((x) => x.id === activeQuestionId);
    if (!q) { goHome(); return null; }
    return <QuizView question={q} onRecord={(ok) => recordAnswer(q.id, ok)} onHome={goHome} />;
  }

  return <HomeScreen questions={questions} subjects={subjects} onSelectQuestion={(qId) => { setActiveQuestionId(qId); setView("quiz"); }} onAdmin={() => setView("admin-login")} />;
}
