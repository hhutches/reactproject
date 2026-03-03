import { useEffect, useMemo, useState } from "react";

export default function Login({
  initialProfile,
  onSubmit = null,  // old prop
  onLogin = null,   // new prop (App likely uses this)
}) {
  const [ready, setReady] = useState(false);
  const [name, setName] = useState(initialProfile?.name ?? "");
  const [username, setUsername] = useState(initialProfile?.username ?? "");
  const [photo, setPhoto] = useState(initialProfile?.photo ?? ""); // URL or dataURL

  const words = useMemo(() => ["Welcome", "to", "Letterboxd", "Lite"], []);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 1200);
    return () => clearTimeout(t);
  }, []);

  // ✅ Works whether App passes onLogin or onSubmit
  const submitFn =
    typeof onLogin === "function"
      ? onLogin
      : typeof onSubmit === "function"
      ? onSubmit
      : () => {};

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto(String(reader.result || ""));
    reader.readAsDataURL(file);
  }

  function handleSubmit(e) {
    e.preventDefault();
    const cleanName = name.trim();
    const cleanUser = username.trim();

    if (!cleanName || !cleanUser) return;

    submitFn({
      name: cleanName,
      username: cleanUser,
      photo: photo.trim(),
    });
  }

  return (
    <div className="loginPage">
      <div className="loginCard">
        <div className="loginHero">
          <div className="loginLogoDot" aria-hidden="true" />
          <div className="loginTitle">
            {words.map((w, i) => (
              <span
                key={w}
                className="bounceWord"
                style={{ animationDelay: `${i * 120}ms` }}
              >
                {w}
              </span>
            ))}
          </div>
          <div className="loginSub muted">No password — just set up your profile.</div>
        </div>

        <form className={`loginForm ${ready ? "show" : ""}`} onSubmit={handleSubmit}>
          <div className="loginRow">
            <label className="loginLabel">Name</label>
            <input
              className="loginInput"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Henry"
              autoComplete="name"
            />
          </div>

          <div className="loginRow">
            <label className="loginLabel">Username</label>
            <input
              className="loginInput"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="hhutches"
              autoComplete="username"
            />
          </div>

          <div className="loginRow">
            <label className="loginLabel">Profile photo</label>

            <div className="loginPhotoRow">
              <div className="loginAvatar">
                {photo ? (
                  <img className="loginAvatarImg" src={photo} alt="avatar" />
                ) : (
                  <div className="loginAvatarFallback" />
                )}
              </div>

              <div className="loginPhotoInputs">
                <input
                  className="loginInput"
                  value={photo}
                  onChange={(e) => setPhoto(e.target.value)}
                  placeholder="Paste image URL (optional)…"
                />
                <div className="loginFileRow">
                  <input type="file" accept="image/*" onChange={handleFile} />
                  <span className="muted" style={{ fontSize: 12 }}>
                    or upload
                  </span>
                </div>
              </div>
            </div>
          </div>

          <button
            className="loginBtn"
            type="submit"
            disabled={!name.trim() || !username.trim()}
          >
            Enter
          </button>
        </form>
      </div>
    </div>
  );
}