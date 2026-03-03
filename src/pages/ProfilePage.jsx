import { useEffect, useRef, useState } from "react";

export default function ProfilePage({
  profile,
  onUpdateProfile = () => {},
  onGoHome = () => {},
  onLogout = () => {},
}) {
  const [name, setName] = useState(profile?.name ?? "");
  const [username, setUsername] = useState(profile?.username ?? "");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [photo, setPhoto] = useState(profile?.photo ?? "");
  const fileRef = useRef(null);

  useEffect(() => {
    setName(profile?.name ?? "");
    setUsername(profile?.username ?? "");
    setBio(profile?.bio ?? "");
    setPhoto(profile?.photo ?? "");
  }, [profile]);

  function pickPhoto() {
    fileRef.current?.click();
  }

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || "");
      setPhoto(dataUrl);
      onUpdateProfile({
        ...(profile || {}),
        name: name.trim(),
        username: (username || "").trim(),
        bio,
        photo: dataUrl,
      });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  function save() {
    const cleanName = name.trim();
    const cleanUser = (username || "").trim();
    if (!cleanName || !cleanUser) return;

    onUpdateProfile({
      ...(profile || {}),
      name: cleanName,
      username: cleanUser,
      bio,
      photo,
    });
  }

  return (
    <div className="page profilePage">
      <div className="pageHead">
        <div>
          <h2>Profile</h2>
          <p className="muted">
            Update your profile. Click <b>Save</b> to apply changes.
          </p>
        </div>

        <button className="button ghost" type="button" onClick={onGoHome}>
          ← Back to Home
        </button>
      </div>

      <div className="panel profilePanel">
        <div className="profileGrid">
          <div className="profileAvatarCol">
            <button
              type="button"
              className="profileAvatarBtn"
              onClick={pickPhoto}
              aria-label="Change profile photo"
              title="Click to change photo"
            >
              {photo ? (
                <img className="profileAvatarImg" src={photo} alt="Profile" />
              ) : (
                <div className="profileAvatarFallback" />
              )}
              <div className="profileAvatarOverlay">Change</div>
            </button>

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleFile}
              style={{ display: "none" }}
            />

            <p className="muted" style={{ marginTop: 8, fontSize: 13 }}>
              Click the image to upload a new one.
            </p>
          </div>

          <div className="profileFields">
            <div className="profileRow">
              <label className="controlLabel">Name</label>
              <input
                className="select"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                autoComplete="name"
              />
            </div>

            <div className="profileRow">
              <label className="controlLabel">Username</label>
              <input
                className="select"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username"
                autoComplete="username"
              />
            </div>

            <div className="profileRow">
              <label className="controlLabel">Bio</label>
              <textarea
                className="textarea"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Write a short bio…"
                rows={5}
              />
            </div>

            <div className="profileActions">
              <button className="button" type="button" onClick={save}>
                Save
              </button>
              <button className="button ghost" type="button" onClick={onLogout}>
                Log out
              </button>

              <span className="muted" style={{ marginLeft: 8 }}>
                Signed in as{" "}
                <b style={{ color: "rgba(255,255,255,0.85)" }}>
                  @{profile?.username}
                </b>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}