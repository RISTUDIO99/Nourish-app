export type TemplateCategory = "checklist" | "bundle" | "protocol" | "journal" | "planner";

export type ChecklistStep = {
  id: string;
  section: string;
  task: string;
  duration?: string;
};

export type GroceryBundle = {
  id: string;
  name: string;
  budget: string;
  description: string;
  items: { category: string; items: string[] }[];
};

export type ResetDay = {
  day: number;
  title: string;
  focus: string;
  meals: { type: string; meal: string }[];
  supplements: string[];
  tips: string[];
};

export type TemplateItem = {
  id: string;
  title: string;
  subtitle: string;
  category: TemplateCategory;
  badge?: string;
  color: string;
  description: string;
};

export const TEMPLATE_ITEMS: TemplateItem[] = [
  {
    id: "meal-prep",
    title: "Weekly Meal Prep Checklist",
    subtitle: "Sunday prep guide",
    category: "checklist",
    badge: "Popular",
    color: "#3d6b52",
    description: "A step-by-step Sunday prep system to set your whole week up for anti-inflammatory success.",
  },
  {
    id: "grocery-bundles",
    title: "Grocery Bundles",
    subtitle: "Pre-built shopping lists",
    category: "bundle",
    color: "#b5813a",
    description: "Three ready-to-use grocery bundles — Budget, Standard, and Family — built around anti-inflammatory foods.",
  },
  {
    id: "reset-protocol",
    title: "3-Day Inflammation Reset",
    subtitle: "Flare relief protocol",
    category: "protocol",
    badge: "Healing",
    color: "#2e6b8a",
    description: "A structured 3-day protocol to reduce inflammation quickly during a flare or after a difficult week.",
  },
  {
    id: "wellness-journal",
    title: "Daily Wellness Journal",
    subtitle: "Track & understand your body",
    category: "journal",
    color: "#7a4a8a",
    description: "Log your mood, energy, pain levels, and meals daily to uncover patterns between food and how you feel.",
  },
  {
    id: "meal-planner",
    title: "7-Day Meal Planner",
    subtitle: "Build your own plan",
    category: "planner",
    color: "#4a6b8a",
    description: "A blank, fillable 7-day planner to design your own anti-inflammatory meal week from scratch.",
  },
];

export const MEAL_PREP_STEPS: ChecklistStep[] = [
  // Proteins
  { id: "p1", section: "Proteins", task: "Season and roast grass-fed beef or bison (batch cook)", duration: "25 min" },
  { id: "p2", section: "Proteins", task: "Poach or bake wild salmon fillets", duration: "20 min" },
  { id: "p3", section: "Proteins", task: "Hard boil 6–8 eggs for the week", duration: "15 min" },
  { id: "p4", section: "Proteins", task: "Cook and shred organic chicken thighs", duration: "30 min" },
  // Vegetables
  { id: "v1", section: "Vegetables", task: "Roast 2 sheet pans of seasonal vegetables (sweet potato, broccoli, zucchini)", duration: "35 min" },
  { id: "v2", section: "Vegetables", task: "Wash and chop raw vegetables for snacking (celery, carrots, cucumber)", duration: "15 min" },
  { id: "v3", section: "Vegetables", task: "Wash and dry leafy greens — store in a damp towel in the fridge", duration: "10 min" },
  { id: "v4", section: "Vegetables", task: "Slice and freeze any ripe bananas or berries for smoothies", duration: "10 min" },
  // Grains & Starches
  { id: "g1", section: "Grains & Starches", task: "Cook a large batch of brown rice or quinoa", duration: "30 min" },
  { id: "g2", section: "Grains & Starches", task: "Bake or boil 3–4 sweet potatoes", duration: "40 min" },
  // Sauces & Dressings
  { id: "s1", section: "Sauces & Dressings", task: "Blend anti-inflammatory salad dressing (olive oil, lemon, garlic, turmeric)", duration: "5 min" },
  { id: "s2", section: "Sauces & Dressings", task: "Prepare a batch of bone broth or warm turmeric broth", duration: "15 min" },
  // Storage
  { id: "st1", section: "Storage & Setup", task: "Portion proteins into glass containers for 3–4 days", duration: "10 min" },
  { id: "st2", section: "Storage & Setup", task: "Label all containers with day/meal", duration: "5 min" },
  { id: "st3", section: "Storage & Setup", task: "Fill water bottles for the week — add lemon and ginger", duration: "5 min" },
  { id: "st4", section: "Storage & Setup", task: "Set out supplements for the coming week", duration: "5 min" },
];

export const GROCERY_BUNDLES: GroceryBundle[] = [
  {
    id: "budget",
    name: "Budget Bundle",
    budget: "~$55–65/week",
    description: "Anti-inflammatory eating on a budget. Every item earns its spot.",
    items: [
      { category: "Proteins", items: ["1 lb ground turkey", "1 can wild salmon", "1 dozen eggs", "1 lb chicken thighs (bone-in)", "1 can sardines in olive oil"] },
      { category: "Vegetables", items: ["1 bag frozen spinach", "1 bag frozen broccoli", "3 sweet potatoes", "1 head cabbage", "2 zucchinis", "1 bag carrots"] },
      { category: "Fruits", items: ["1 bag frozen blueberries", "3 bananas", "2 apples", "1 lemon"] },
      { category: "Grains & Starches", items: ["Brown rice (bulk)", "Rolled oats", "Lentils (dried)"] },
      { category: "Pantry", items: ["Olive oil (extra virgin)", "Turmeric powder", "Garlic (whole)", "Apple cider vinegar", "Canned diced tomatoes"] },
    ],
  },
  {
    id: "standard",
    name: "Standard Bundle",
    budget: "~$90–110/week",
    description: "The full Nourish experience — quality, variety, and healing nutrition all week.",
    items: [
      { category: "Proteins", items: ["Grass-fed ground beef (1 lb)", "Wild salmon fillets (2)", "Organic chicken thighs (4)", "1 dozen pasture eggs", "Bone broth (32 oz)"] },
      { category: "Vegetables", items: ["Kale (bunch)", "Spinach (bag)", "Broccoli florets", "Brussels sprouts", "Sweet potatoes (4)", "Beets (3)", "Cucumber", "Bell peppers (assorted)"] },
      { category: "Fruits", items: ["Blueberries (fresh or frozen)", "Pomegranate seeds", "Avocados (3)", "Lemon (bag)", "Cherries or tart cherry juice"] },
      { category: "Grains & Starches", items: ["Quinoa", "Brown rice", "Cassava tortillas"] },
      { category: "Pantry", items: ["Extra virgin olive oil", "Coconut aminos", "Turmeric + black pepper", "Ginger (fresh)", "Raw almonds", "Flaxseeds"] },
    ],
  },
  {
    id: "family",
    name: "Family Bundle",
    budget: "~$130–160/week",
    description: "Healing meals for the whole family — generous portions, crowd-pleasing anti-inflammatory recipes.",
    items: [
      { category: "Proteins", items: ["Grass-fed ground beef (2 lbs)", "Whole organic chicken", "Wild salmon (4 fillets)", "2 dozen eggs", "Organic chicken sausage"] },
      { category: "Vegetables", items: ["Kale (2 bunches)", "Large bag spinach", "Broccoli (2 heads)", "Cauliflower (1 head)", "Sweet potatoes (6)", "Zucchini (4)", "Cherry tomatoes", "Cabbage (1 head)", "Beets (bunch)"] },
      { category: "Fruits", items: ["Blueberries (2 bags)", "Avocados (5)", "Apples (bag)", "Lemons (bag)", "Bananas (bunch)", "Pomegranate"] },
      { category: "Grains & Starches", items: ["Brown rice (large bag)", "Quinoa", "Oats (large container)", "Cassava flour tortillas"] },
      { category: "Pantry", items: ["Olive oil (large)", "Coconut oil", "Bone broth (2 cartons)", "Turmeric", "Ginger (fresh + powder)", "Garlic (2 heads)", "Raw nuts (mixed)", "Chia seeds", "Hemp seeds"] },
    ],
  },
];

export const RESET_PROTOCOL: ResetDay[] = [
  {
    day: 1,
    title: "Detox & Hydrate",
    focus: "Flush and calm. Today is about removing irritants, flooding your body with anti-inflammatory fluids, and letting your gut rest.",
    meals: [
      { type: "Morning", meal: "Warm lemon water + turmeric ginger tea on waking. No food for 1 hour." },
      { type: "Breakfast", meal: "Green smoothie: spinach, frozen blueberries, banana, chia seeds, coconut water." },
      { type: "Lunch", meal: "Bone broth soup: broth, shredded chicken, kale, ginger, garlic, turmeric." },
      { type: "Snack", meal: "Celery sticks with almond butter. Tart cherry juice (4 oz)." },
      { type: "Dinner", meal: "Baked salmon with steamed broccoli and sweet potato. Drizzle with olive oil and lemon." },
      { type: "Evening", meal: "Chamomile or tulsi tea. No food after 7pm." },
    ],
    supplements: ["Magnesium glycinate 400mg before bed", "Fish oil 2,000mg with dinner", "Probiotics on waking"],
    tips: ["Drink 80–100oz of water today", "Avoid all gluten, dairy, sugar, and alcohol", "Aim for 7–9 hours of sleep tonight"],
  },
  {
    day: 2,
    title: "Nourish & Rebuild",
    focus: "Feed the healing. Today we layer in more whole foods, antioxidants, and gut-supporting nutrition to accelerate recovery.",
    meals: [
      { type: "Morning", meal: "Warm lemon water on waking. Wait 30 minutes before eating." },
      { type: "Breakfast", meal: "2 poached eggs over sautéed spinach with avocado. Side of fermented sauerkraut." },
      { type: "Lunch", meal: "Large anti-inflammatory salad: kale, roasted beets, walnuts, pomegranate seeds, olive oil & lemon dressing." },
      { type: "Snack", meal: "Handful of mixed berries with a few walnuts. Turmeric golden milk (oat or almond milk)." },
      { type: "Dinner", meal: "Grass-fed ground beef stir-fry: broccoli, bok choy, coconut aminos, ginger, garlic. Serve over brown rice." },
      { type: "Evening", meal: "Warm bone broth with a pinch of sea salt and turmeric." },
    ],
    supplements: ["Vitamin D3 + K2 with breakfast", "Curcumin supplement with dinner", "Magnesium glycinate before bed"],
    tips: ["Add a 20-minute gentle walk after lunch", "Practice deep breathing — 5 minutes morning and evening", "Continue avoiding inflammatory foods"],
  },
  {
    day: 3,
    title: "Stabilize & Sustain",
    focus: "Lock it in. Today we reinforce the progress made and prepare your body to carry these habits beyond the reset.",
    meals: [
      { type: "Morning", meal: "Warm lemon water. Herbal tea of your choice." },
      { type: "Breakfast", meal: "Overnight oats: rolled oats, chia seeds, blueberries, almond butter, cinnamon. Prepared the night before." },
      { type: "Lunch", meal: "Wild salmon bowl: salmon over quinoa with cucumber, avocado, olive oil, and lemon." },
      { type: "Snack", meal: "Apple slices with almond butter. Sparkling water with lemon." },
      { type: "Dinner", meal: "Herb-roasted chicken thighs with roasted sweet potato and a side of wilted kale with garlic." },
      { type: "Evening", meal: "Tart cherry juice (4 oz). Magnesium tea or supplement. Gratitude journaling — write 3 things your body did well today." },
    ],
    supplements: ["Continue full supplement stack from Day 2", "Consider adding collagen peptides to morning drink", "Probiotics on waking"],
    tips: ["You've completed the reset — notice how you feel vs Day 1", "Plan your first full week of Nourish eating", "Schedule your next reset for 30 days out if needed"],
  },
];
