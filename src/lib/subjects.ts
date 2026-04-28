export const SUBJECT_META: Record<
  string,
  {
    emoji: string;
    paleColor: string;
    darkColor: string;
    accentColor: string;
  }
> = {
  physics: {
    emoji: "⚛️",
    paleColor: "#E1F5EE",
    darkColor: "#085041",
    accentColor: "#0D6E6E",
  },
  chemistry: {
    emoji: "🧪",
    paleColor: "#EEEDFE",
    darkColor: "#3C3489",
    accentColor: "#534AB7",
  },
  biology: {
    emoji: "🌿",
    paleColor: "#EAF3DE",
    darkColor: "#27500A",
    accentColor: "#3B6D11",
  },
  maths: {
    emoji: "📐",
    paleColor: "#FEF3DC",
    darkColor: "#633806",
    accentColor: "#854F0B",
  },
  social: {
    emoji: "🌍",
    paleColor: "#FAEEDA",
    darkColor: "#633806",
    accentColor: "#854F0B",
  },
  english: {
    emoji: "📖",
    paleColor: "#E6F1FB",
    darkColor: "#0C447C",
    accentColor: "#185FA5",
  },
};

export function getSubjectMeta(slug: string) {
  const key = slug.replace(/-\d+$/, "").toLowerCase();
  return (
    SUBJECT_META[key] ?? {
      emoji: "📚",
      paleColor: "#F1EFE8",
      darkColor: "#444441",
      accentColor: "#5F5E5A",
    }
  );
}
