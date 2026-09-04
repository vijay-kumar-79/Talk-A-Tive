import grpAvatar from "../assets/grpAvatar.png";

// Avatars are stored as base64-encoded SVG; groups use a static image
export const avatarSrc = (img) =>
  img ? `data:image/svg+xml;base64,${img}` : grpAvatar;

export const formatTime = (ts) =>
  new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

export const formatDay = (ts) => {
  const d = new Date(ts);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return "Today";
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString([], {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
};

// Stable per-user color for group message sender names (WhatsApp style)
export const senderColor = (name) => {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360;
  return `hsl(${h}, 55%, 65%)`;
};