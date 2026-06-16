const KEYWORD_ICONS = [
  [["dosa"], "🫓"],
  [["poha"], "🍚"],
  [["rajma", "chawal", "khichdi", "biryani"], "🍛"],
  [["pulao"], "🍚"],
  [["mutton", "chicken"], "🍖"],
  [["fish"], "🐟"],
  [["egg"], "🥚"],
  [["paneer", "tikka"], "🧀"],
  [["aloo", "gobi", "vegetable", "sabzi"], "🥦"],
  [["samosa", "cutlet"], "🥟"],
  [["chaat", "sprouts"], "🥗"],
  [["gulab jamun"], "🍡"],
  [["custard", "payasam", "kheer", "halwa"], "🍮"],
  [["dal"], "🥣"],
  [["roti", "naan", "chapati", "pulka"], "🫓"],
  [["curd", "dahi", "yogurt"], "🥛"],
  [["rice"], "🍚"],
];

const CATEGORY_FALLBACK = {
  breakfast: "🍳",
  lunch: "🍛",
  snacks: "🍿",
  dinner: "🍽️",
  dessert: "🍰",
  staple: "🍚",
};

export function getFoodIcon(item) {
  const name = (item?.name || "").toLowerCase();
  for (const [keywords, icon] of KEYWORD_ICONS) {
    if (keywords.some((k) => name.includes(k))) return icon;
  }
  return CATEGORY_FALLBACK[item?.category] || "🍽️";
}
