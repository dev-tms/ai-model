export const LANGUAGE_LABELS = {
  gu: "Gujarati",
  hi: "Hindi",
  en: "English",
};

export const LANGUAGE_DOT = {
  gu: "bg-amber-500",
  hi: "bg-rose-500",
  en: "bg-sky-500",
};

export const LANGUAGE_ACCENT = {
  gu: "border-l-amber-400",
  hi: "border-l-rose-400",
  en: "border-l-sky-400",
};

const AVATAR_PALETTE = [
  "bg-indigo-100 text-indigo-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-sky-100 text-sky-700",
  "bg-violet-100 text-violet-700",
];

export const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  try {
    return new Intl.DateTimeFormat("en-GB", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch {
    return "—";
  }
};

export const languageLabel = (language) => {
  if (!language) return "Unknown";
  return LANGUAGE_LABELS[language] ?? String(language).toUpperCase();
};

export const avatarColorFor = (name) => {
  const first = String(name || "?").charCodeAt(0) || 0;
  return AVATAR_PALETTE[first % AVATAR_PALETTE.length];
};

export const initialsFor = (name = "") =>
  String(name)
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "?";

export const getCustomerName = (item) =>
  item?.customer?.name || "Unknown visitor";

export const getLeadScore = (item) => {
  if (!item?.customer) return "New";
  const turns = Number(item.turn_count) || 0;
  if (turns >= 10) return "Hot";
  if (turns >= 5) return "Warm";
  return "Light";
};

export const getLeadScoreFromTurns = (turns, hasCustomer) => {
  if (!hasCustomer) return "New";
  const count = Number(turns) || 0;
  if (count >= 10) return "Hot";
  if (count >= 5) return "Warm";
  return "Light";
};

export const getLeadScoreClass = (score) => {
  if (score === "Hot") return "bg-rose-50 text-rose-700 ring-rose-200";
  if (score === "Warm") return "bg-amber-50 text-amber-700 ring-amber-200";
  if (score === "Light") return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  return "bg-slate-100 text-slate-600 ring-slate-200";
};

export const searchableText = (value) =>
  String(value ?? "")
    .toLowerCase()
    .trim();

export const conversationDetailPath = (sessionId, projectId = "praangan") =>
  `/customers/${projectId}/conversation/${sessionId}`;
