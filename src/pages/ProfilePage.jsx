import { useEffect, useState } from "react";

const KEY = "lb_profile_v1";

function loadProfile() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw
      ? JSON.parse(raw)
      : { displayName: "", username: "", bio: "", photoDataUrl: "" };
  } catch {
    return { displayName: "", username: "", bio: "", photoDataUrl: "" };
  }
}

export default function ProfilePage() {
  const [profile, setProfile] = useState(loadProfile);
  const [savedMsg, setSavedMsg] = useState("");

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(profile));
  }, [profile]);

  function onPhotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setProfile((p) => ({ ...p, photoDataUrl: String(reader.result || "") }));
    };
    reader.readAsDataURL(file);
  }

  function saveNow() {
    localStorage.setItem(KEY, JSON.stringify(profile));
    setSavedMsg("Saved!");
    setTimeout(() => setSavedMsg(""), 1200);
  }

  return (
    <div className="page">
      <h2>Profile</h2>
      <p className="muted">Edit your profile settings (stored locally for now).</p>

      <div className="panel">
        <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 16, alignItems: "start" }}>
          <div>
            {profile.photoDataUrl ? (
              <img
                src={profile.photoDataUrl}
                alt="Profile"
                style={{ width: 120, height: 120, borderRadius: 16, objectFit: "cover", border: "1px solid var(--border)" }}
              />
            ) : (
              <div
                style={{ width: 120, height: 120, borderRadius: 16, background: "#0b0f13", border: "1px solid var(--border)" }}
                aria-label="No profile photo"
              />
            )}

            <div style={{ marginTop: 10 }}>
              <input type="file" accept="image/*" onChange={onPhotoChange} />
            </div>
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            <label className="muted">
              Display name
              <input
                className="searchInput"
                value={profile.displayName}
                onChange={(e) => setProfile((p) => ({ ...p, displayName: e.target.value }))}
                placeholder="Henry Hutcheson"
              />
            </label>

            <label className="muted">
              Username
              <input
                className="searchInput"
                value={profile.username}
                onChange={(e) => setProfile((p) => ({ ...p, username: e.target.value }))}
                placeholder="@hhutches"
              />
            </label>

            <label className="muted">
              Bio
              <textarea
                className="textarea"
                value={profile.bio}
                onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
                placeholder="Movie lover. Favorites: …"
                rows={4}
              />
            </label>

            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <button className="button" onClick={saveNow}>Save profile</button>
              {savedMsg ? <span className="muted">{savedMsg}</span> : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}