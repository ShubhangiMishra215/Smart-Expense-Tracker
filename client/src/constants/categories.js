export const CATEGORIES = [
  { name: "Food", color: "#9587FF" },
  { name: "Transport", color: "#7FD3CF" },
  { name: "Groceries", color: "#8FD694" },
  { name: "Leisure", color: "#F0C77E" },
  { name: "Electronics", color: "#7FB2F0" },
  { name: "Utilities", color: "#F5A26B" },
  { name: "Clothing", color: "#E39BD0" },
  { name: "Health", color: "#F2807F" },
  { name: "Others", color: "#A9A8C0" },
];

export const CATEGORY_NAMES = CATEGORIES.map((c) => c.name);

export const getCategoryColor = (name) =>
  CATEGORIES.find((c) => c.name === name)?.color ?? "#A9A8C0";