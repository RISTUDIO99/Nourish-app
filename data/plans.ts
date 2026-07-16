export type Meal = {
  day: string;
  breakfast: string;
  lunch: string;
  dinner: string;
  snack: string;
  fishSwapDinner?: string;
  fishSwapLunch?: string;
};

export type Plan = {
  id: string;
  title: string;
  shortDescription: string;
  description: string;
  principles: string[];
  nutrients: string;
  avoid: string;
  note?: string;
  hasFishSwap?: boolean;
  color: string;
  icon: string;
  meals: Meal[];
};

export const plans: Plan[] = [
  {
    id: "meat",
    title: "Grass-Fed Meat Plan",
    shortDescription: "Lean, grass-fed red meat balanced with powerful anti-inflammatory plant foods.",
    description: "Focused on grass-fed beef, lamb, and bison consumed mindfully, balanced with anti-inflammatory vegetables, healthy fats, and herbs. Grass-fed meats are significantly higher in omega-3s and CLA than conventional grain-fed options.",
    color: "#4a7c59",
    icon: "flame",
    principles: [
      "Choose grass-fed over grain-fed (higher omega-3, CLA)",
      "Limit red meat to 2–3 times per week, balanced with plant foods",
      "Emphasize anti-inflammatory sides: turmeric, leafy greens, berries",
      "Cook gently: bake, braise, or slow-cook rather than char or fry",
      "Pair red meat with vitamin C-rich foods to enhance iron absorption"
    ],
    nutrients: "Iron, Zinc, B12, Omega-3 (grass-fed), CoQ10, CLA",
    avoid: "Processed/deli meats, charred or grilled meats, sausages with nitrates, refined carbs",
    meals: [
      { day: "Monday", breakfast: "Turmeric golden oats with walnuts and blueberries", lunch: "Grass-fed beef and kale salad with lemon-tahini dressing", dinner: "Bison meatballs with zucchini noodles and marinara", snack: "Celery with almond butter and green tea" },
      { day: "Tuesday", breakfast: "Ginger-berry smoothie with flaxseed and almond milk", lunch: "Leftover bison bowl with roasted sweet potato", dinner: "Grass-fed sirloin stir-fry with bok choy and ginger-sesame sauce", snack: "Walnuts and tart cherry juice" },
      { day: "Wednesday", breakfast: "Avocado toast on sourdough with hemp seeds and sliced tomato", lunch: "Lamb and chickpea soup with turmeric and spinach", dinner: "Sheet pan grass-fed beef with broccoli, garlic, and olive oil", snack: "Apple slices with cashew butter" },
      { day: "Thursday", breakfast: "Overnight oats with chia seeds, cinnamon, and raspberries", lunch: "Ground bison lettuce wraps with avocado and cucumber", dinner: "Pan-seared lamb chops with roasted asparagus and lemon quinoa", snack: "Handful of mixed nuts (walnuts, almonds, pecans)" },
      { day: "Friday", breakfast: "Scrambled eggs with sautéed spinach and turmeric", lunch: "Grass-fed beef and red lentil stew with ginger", dinner: "Lamb and vegetable curry over brown rice with cilantro", snack: "Ginger lemon tea and fresh blueberries" },
      { day: "Saturday", breakfast: "Berry açaí bowl with hemp seeds, granola, and banana", lunch: "Leftover lamb curry with naan and cucumber raita", dinner: "Grass-fed beef burger (lettuce wrap) with roasted Brussels sprouts", snack: "Hummus with cucumber and carrot sticks" },
      { day: "Sunday", breakfast: "Warm quinoa porridge with pecans, cinnamon, and banana", lunch: "Steak salad with arugula, cherry tomatoes, and walnuts", dinner: "Slow-cooked grass-fed beef stew with root vegetables and rosemary", snack: "Golden turmeric milk and pumpkin seeds" }
    ]
  },
  {
    id: "chicken",
    title: "Chicken & Poultry Plan",
    shortDescription: "Lean poultry and healing bone broth as the foundation of clean, nourishing eating.",
    description: "Centered on chicken, turkey, and other free-range poultry as lean, lower-inflammatory protein sources. Chicken bone broth, rich in collagen, glycine, and gelatin, is especially beneficial for gut and joint health.",
    color: "#b5813a",
    icon: "leaf",
    principles: [
      "Choose free-range or organic poultry when possible",
      "Bone broth is excellent for health: rich in collagen, glycine, and gelatin",
      "Pair with omega-3 rich plant foods (walnuts, flax, chia) to compensate",
      "Cook gently: bake, poach, or slow-cook. Avoid deep frying.",
      "Include turkey regularly — high in selenium, a powerful antioxidant"
    ],
    nutrients: "Lean protein, B vitamins, Selenium (turkey), Collagen (bone broth), Zinc, Tryptophan",
    avoid: "Fried chicken, processed nuggets, deli turkey with nitrates, chicken skin in excess",
    meals: [
      { day: "Monday", breakfast: "Warm bone broth with ginger to start, then oatmeal with blueberries", lunch: "Chicken and avocado salad with lemon-herb dressing", dinner: "Turmeric-roasted chicken thighs with roasted cauliflower and quinoa", snack: "Tart cherry juice and walnuts" },
      { day: "Tuesday", breakfast: "Smoothie: spinach, ginger, banana, almond milk, flaxseed", lunch: "Turkey and vegetable soup with bone broth base and turmeric", dinner: "Poached chicken with bok choy and sesame-ginger dressing", snack: "Celery sticks with almond butter" },
      { day: "Wednesday", breakfast: "Overnight chia pudding with mango and coconut flakes", lunch: "Grilled chicken salad with arugula, beets, and citrus vinaigrette", dinner: "Chicken stir-fry with broccoli, snap peas, and turmeric-ginger sauce", snack: "Apple with walnut butter and green tea" },
      { day: "Thursday", breakfast: "Soft scrambled eggs with sautéed spinach and garlic", lunch: "Ground turkey lettuce cups with avocado and cucumber", dinner: "Roasted whole chicken with sweet potato and asparagus", snack: "Pumpkin seeds and dried tart cherries" },
      { day: "Friday", breakfast: "Warm golden milk latte + avocado toast with hemp seeds", lunch: "Turkey, white bean, and kale soup", dinner: "Chicken thighs slow-cooked with tomatoes, olives, and herbs", snack: "Green tea and mixed berries" },
      { day: "Saturday", breakfast: "Açaí bowl with hemp seeds, granola, and strawberries", lunch: "Leftover chicken with roasted vegetable and grain bowl", dinner: "Turkey meatballs with zucchini noodles and olive oil tomato sauce", snack: "Hummus with sliced vegetables" },
      { day: "Sunday", breakfast: "Mushroom and spinach omelet with turmeric", lunch: "Chicken bone broth ramen with soft-boiled egg and bok choy", dinner: "Whole roasted turkey breast with roasted root vegetables", snack: "Ginger lemon tea and raw almonds" }
    ]
  },
  {
    id: "fish",
    title: "Fish & Seafood Plan",
    shortDescription: "Omega-3-rich fish — the most powerful anti-inflammatory protein. Includes no-fish swap options.",
    description: "Centers on fatty fish rich in EPA/DHA omega-3s. Each day includes a no-fish swap for days when you prefer not to eat fish. Mediterranean-style eating at its finest.",
    color: "#2e6b8a",
    icon: "water",
    principles: [
      "Aim for fatty fish 3–4 times per week (salmon, sardines, mackerel, herring)",
      "EPA/DHA directly inhibit inflammatory pathways",
      "Wild-caught fish preferred over farm-raised for better omega-3 ratios",
      "Mediterranean-style: olive oil, vegetables, whole grains alongside fish",
      "On no-fish days, increase walnuts, chia, and flaxseed"
    ],
    nutrients: "EPA/DHA Omega-3, Vitamin D, Iodine, Selenium, Vitamin B12, Astaxanthin",
    avoid: "Fried fish, commercially breaded fish sticks, high-mercury fish (swordfish, king mackerel)",
    note: "No-fish swap options are shown for each day. On swap days, consider an algae-based omega-3 supplement.",
    hasFishSwap: true,
    meals: [
      {
        day: "Monday",
        breakfast: "Smoked salmon on sourdough with avocado, capers, and dill",
        lunch: "Tuna nicoise salad with olives, eggs, and green beans",
        dinner: "Wild salmon fillet with roasted asparagus and lemon-dill quinoa",
        snack: "Walnuts and fresh blueberries",
        fishSwapDinner: "Turmeric chicken thighs with roasted asparagus and lemon-dill quinoa",
        fishSwapLunch: "Chickpea and kale salad with tahini-lemon dressing"
      },
      {
        day: "Tuesday",
        breakfast: "Turmeric oats with flaxseed, raspberries, and walnuts",
        lunch: "Sardine and white bean salad with arugula and lemon",
        dinner: "Mackerel with roasted sweet potato and broccolini",
        snack: "Tart cherry juice and pumpkin seeds",
        fishSwapDinner: "Chicken and vegetable stir-fry with walnut-ginger sauce",
        fishSwapLunch: "Lentil and vegetable soup with turmeric and ginger"
      },
      {
        day: "Wednesday",
        breakfast: "Greek yogurt with honey, walnuts, and pomegranate seeds",
        lunch: "Salmon poke bowl with brown rice, edamame, and cucumber",
        dinner: "Baked cod with tomatoes, capers, olives, and herbs",
        snack: "Apple with almond butter and green tea",
        fishSwapDinner: "Slow-cooked chicken with white beans and Mediterranean herbs",
        fishSwapLunch: "Black bean and roasted vegetable bowl with avocado"
      },
      {
        day: "Thursday",
        breakfast: "Chia pudding with mango, coconut flakes, and hemp seeds",
        lunch: "Herring on rye crackers with cucumber, avocado, and dill",
        dinner: "Seared tuna steak with roasted zucchini and olive tapenade",
        snack: "Pumpkin seeds and ginger tea",
        fishSwapDinner: "Tempeh stir-fry with bok choy, sesame-ginger, and brown rice",
        fishSwapLunch: "Walnut and beet salad with arugula and goat cheese"
      },
      {
        day: "Friday",
        breakfast: "Smoked salmon scrambled eggs with spinach and capers",
        lunch: "Tuna and avocado lettuce wraps with lime",
        dinner: "Pan-seared salmon with roasted cauliflower and turmeric sauce",
        snack: "Mixed nuts and dried tart cherries",
        fishSwapDinner: "Baked chicken with roasted cauliflower and lemon-herb quinoa",
        fishSwapLunch: "Turkey and lentil soup with rosemary"
      },
      {
        day: "Saturday",
        breakfast: "Açaí bowl with hemp seeds, strawberries, and chia",
        lunch: "Shrimp and avocado salad with citrus vinaigrette",
        dinner: "Whole roasted fish with roasted vegetables and lemon-garlic olive oil",
        snack: "Hummus with carrot sticks and cucumber",
        fishSwapDinner: "Turkey and vegetable curry with brown rice",
        fishSwapLunch: "Chickpea salad sandwich on sourdough with avocado"
      },
      {
        day: "Sunday",
        breakfast: "Smoked salmon and avocado toast with everything seasoning",
        lunch: "Sardine pasta with olive oil, garlic, lemon, and parsley",
        dinner: "Baked halibut with roasted root vegetables and rosemary",
        snack: "Walnuts and dark chocolate (85%+)",
        fishSwapDinner: "Roasted chicken with root vegetables and walnut pesto",
        fishSwapLunch: "White bean and kale soup with lemon and olive oil"
      }
    ]
  },
  {
    id: "ra",
    title: "RA & Chronic Illness Plan",
    shortDescription: "Clinically-aligned meals specifically designed to reduce inflammation in rheumatoid arthritis and chronic illness.",
    description: "A research-backed meal plan targeting the specific inflammatory pathways involved in RA, lupus, and chronic inflammatory conditions. Every meal is chosen for maximum anti-inflammatory impact — including omega-3s, curcumin, antioxidants, and gut-supporting foods.",
    color: "#7a4a8a",
    icon: "medkit",
    principles: [
      "Prioritize EPA/DHA omega-3s daily (salmon, sardines, algae oil supplement)",
      "Turmeric + black pepper at every meal — curcumin is a natural COX-2 inhibitor",
      "Avoid nightshades if sensitivity suspected (tomatoes, peppers, eggplant)",
      "Bone broth daily supports gut integrity and collagen production",
      "Include tart cherry juice — directly reduces uric acid and CRP",
      "Fermented foods (kefir, kimchi) support the gut-immune axis"
    ],
    nutrients: "EPA/DHA Omega-3, Curcumin, Vitamin D, Selenium, Magnesium, Collagen, Quercetin",
    avoid: "Processed foods, refined sugar, vegetable oils (corn, soy, sunflower), gluten if sensitive, alcohol, charred meats",
    note: "This plan is designed as a therapeutic eating framework. Always coordinate dietary changes with your rheumatologist.",
    meals: [
      { day: "Monday", breakfast: "Warm bone broth with ginger + turmeric oats with walnuts and blueberries", lunch: "Wild salmon and arugula salad with lemon-olive oil dressing and hemp seeds", dinner: "Slow-cooked turmeric chicken with broccolini, sweet potato, and black pepper", snack: "Tart cherry juice (8 oz) and Brazil nuts (2–3)" },
      { day: "Tuesday", breakfast: "Anti-inflammatory smoothie: spinach, ginger, turmeric, blueberries, flaxseed, almond milk", lunch: "Sardine and white bean salad with kale, lemon, and extra virgin olive oil", dinner: "Baked salmon with roasted asparagus, cauliflower mash, and ginger-miso glaze", snack: "Celery with walnut butter and green tea (EGCG)" },
      { day: "Wednesday", breakfast: "Chia pudding with pomegranate, walnuts, and Ceylon cinnamon", lunch: "Bone broth-based lentil soup with turmeric, spinach, and roasted garlic", dinner: "Grass-fed lamb with roasted beets, arugula, and walnut-rosemary dressing", snack: "Kefir (6 oz) with a handful of mixed berries" },
      { day: "Thursday", breakfast: "Golden milk oatmeal: rolled oats, turmeric, ginger, black pepper, walnuts, blueberries", lunch: "Wild tuna with avocado, cucumber, seaweed, and sesame on brown rice", dinner: "Slow-cooked chicken thighs with mushrooms, bok choy, and ginger-sesame broth", snack: "Pumpkin seeds (zinc) and pomegranate juice (4 oz)" },
      { day: "Friday", breakfast: "Soft-scrambled pastured eggs with sautéed spinach, garlic, and turmeric", lunch: "Mackerel on rye with avocado, capers, red onion, and dill", dinner: "Anti-inflammatory Buddha bowl: salmon, quinoa, kale, roasted sweet potato, tahini", snack: "Tart cherry juice and dark chocolate (85%+, 1 oz)" },
      { day: "Saturday", breakfast: "Açaí bowl with hemp seeds, chia, banana, and ground flaxseed", lunch: "Turkey and white bean soup with kale, rosemary, and bone broth base", dinner: "Whole roasted salmon with roasted root vegetables and lemon-herb olive oil drizzle", snack: "Chamomile tea (anti-inflammatory) and raw almonds" },
      { day: "Sunday", breakfast: "Mushroom and spinach frittata with turmeric, rosemary, and fresh herbs", lunch: "Shrimp and avocado salad with citrus vinaigrette and watercress", dinner: "Slow-cooked grass-fed beef bone broth stew with sweet potato, beets, and rosemary", snack: "Golden turmeric milk with black pepper and ginger" }
    ]
  }
];

export type FoodCategory = {
  name: string;
  description: string;
  items: { name: string; benefit: string }[];
};

export const foodReference: { section: string; intro: string; categories: FoodCategory[] }[] = [
  {
    section: "Healthy Oils",
    intro: "The right fats are anti-inflammatory medicine. Use these oils generously, especially extra virgin olive oil.",
    categories: [
      {
        name: "Best Oils",
        description: "Choose cold-pressed, unrefined oils for maximum benefit.",
        items: [
          { name: "Extra virgin olive oil", benefit: "Contains oleocanthal which inhibits COX-1 and COX-2, the same pathways targeted by NSAIDs. Use for cooking under 375°F and dressings." },
          { name: "Avocado oil", benefit: "High smoke point (500°F), rich in oleic acid and vitamin E. Best for higher-heat cooking." },
          { name: "Flaxseed oil (unrefined)", benefit: "Highest plant-based ALA omega-3 content. Never heat it. Use cold in smoothies and dressings." },
          { name: "Walnut oil", benefit: "Rich in ALA omega-3 and polyphenols. Use cold over salads or drizzled on cooked dishes." },
          { name: "Hemp seed oil", benefit: "Ideal 3:1 omega-6 to omega-3 ratio. Use cold, excellent in smoothies and dressings." },
          { name: "Sesame oil (toasted)", benefit: "Rich in sesamin, a lignan with anti-inflammatory properties. Use in small amounts in cooking." }
        ]
      }
    ]
  },
  {
    section: "Nuts & Seeds",
    intro: "A small daily handful of nuts and seeds supports whole-body health and delivers essential fatty acids and minerals.",
    categories: [
      {
        name: "Best Nuts",
        description: "Nuts provide healthy fats, vitamin E, magnesium, and anti-inflammatory polyphenols.",
        items: [
          { name: "Walnuts", benefit: "Highest omega-3 (ALA) content of all nuts. Eat 1 oz (14 halves) daily." },
          { name: "Almonds", benefit: "High in vitamin E, magnesium, and fiber. Helps reduce CRP levels." },
          { name: "Brazil nuts", benefit: "2–3 nuts provide the daily selenium requirement. Selenium is a potent antioxidant." },
          { name: "Pecans", benefit: "Rich in oleic acid and zinc. One of the highest antioxidant nuts." },
          { name: "Cashews", benefit: "Rich in magnesium and zinc. Good for nerve function and immune support." },
          { name: "Macadamia nuts", benefit: "High in palmitoleic acid, a monounsaturated fat that supports healthy cell membranes." }
        ]
      },
      {
        name: "Best Seeds",
        description: "Seeds are concentrated sources of omega-3s, minerals, and lignans.",
        items: [
          { name: "Ground flaxseed", benefit: "Richest plant source of ALA omega-3 and lignans. Must be ground for absorption. 1–2 tablespoons daily." },
          { name: "Chia seeds", benefit: "Excellent omega-3 source, high fiber, calcium, and magnesium." },
          { name: "Hemp seeds (hulled)", benefit: "Complete protein with a perfect omega-6 to omega-3 ratio." },
          { name: "Pumpkin seeds", benefit: "High in zinc (crucial for immune function) and magnesium." },
          { name: "Sunflower seeds", benefit: "Rich in vitamin E and selenium. Choose raw or dry-roasted." },
          { name: "Sesame seeds / tahini", benefit: "High in sesamin, calcium, and copper. Tahini is an easy daily addition." }
        ]
      }
    ]
  },
  {
    section: "Teas & Beverages",
    intro: "These drinks are loaded with anti-inflammatory compounds with strong research support.",
    categories: [
      {
        name: "Anti-Inflammatory Teas",
        description: "Teas contain powerful polyphenols, catechins, and flavonoids.",
        items: [
          { name: "Green tea", benefit: "EGCG inhibits TNF-alpha and IL-1beta. Drink 2–3 cups daily." },
          { name: "Ginger tea", benefit: "Gingerols inhibit COX and LOX inflammatory pathways. Helps with pain." },
          { name: "Turmeric / golden milk tea", benefit: "Curcumin blocks NF-kB, the master switch of inflammation." },
          { name: "Rosehip tea", benefit: "Exceptionally high in vitamin C and GOPO. Clinical trials show reduction in joint stiffness." },
          { name: "Chamomile tea", benefit: "Apigenin blocks COX-2. Anti-inflammatory and calming." },
          { name: "Rooibos tea", benefit: "Caffeine-free and rich in aspalathin, an anti-inflammatory flavonoid." }
        ]
      },
      {
        name: "Functional Beverages",
        description: "Drinks that actively support wellness.",
        items: [
          { name: "Tart cherry juice (unsweetened)", benefit: "Anthocyanins reduce uric acid and CRP. 8–12 oz daily reduces inflammatory markers." },
          { name: "Pomegranate juice (100%)", benefit: "Punicalagins are among the most potent antioxidants known. Reduces CRP." },
          { name: "Bone broth", benefit: "Rich in collagen, gelatin, glycine, and glucosamine. Supports cartilage and gut health." },
          { name: "Golden milk latte", benefit: "Delivers curcumin + gingerol together. Black pepper increases curcumin absorption by 2000%." },
          { name: "Berry smoothies with flaxseed", benefit: "Anthocyanins + ALA omega-3 in one drink." },
          { name: "Filtered water with lemon", benefit: "Hydration is critical for joint lubrication. Lemon adds vitamin C." }
        ]
      }
    ]
  },
  {
    section: "Power Spices",
    intro: "Spices are the most potent anti-inflammatory foods per gram. Use them generously every day — they are not just flavoring.",
    categories: [
      {
        name: "Core Daily Spices",
        description: "These spices have the strongest clinical evidence for reducing inflammation.",
        items: [
          { name: "Turmeric + black pepper", benefit: "Curcumin is the world's most studied anti-inflammatory compound. Black pepper increases absorption by 2000%." },
          { name: "Fresh ginger", benefit: "Gingerols are COX and LOX inhibitors. Comparable to NSAIDs in some pain studies." },
          { name: "Garlic", benefit: "Allicin and organosulfur compounds inhibit pro-inflammatory cytokines." },
          { name: "Cinnamon (Ceylon)", benefit: "Cinnamaldehyde inhibits inflammatory arachidonic acid and stabilizes blood sugar." },
          { name: "Rosemary", benefit: "Rosmarinic acid and carnosol are powerful anti-inflammatory compounds." },
          { name: "Oregano", benefit: "Highest antioxidant content of most common herbs. Rich in beta-caryophyllene." }
        ]
      }
    ]
  },
  {
    section: "Best Proteins",
    intro: "The right protein sources provide building blocks for tissue repair while minimizing inflammatory triggers.",
    categories: [
      {
        name: "Top Protein Sources",
        description: "Protein quality and source matters as much as quantity.",
        items: [
          { name: "Wild-caught fatty fish (salmon, sardines, mackerel)", benefit: "Richest dietary source of EPA and DHA, which directly inhibit inflammatory pathways." },
          { name: "Grass-fed beef and lamb", benefit: "Contains 2–5 times more omega-3 than grain-fed. Also higher in CLA." },
          { name: "Free-range chicken and turkey", benefit: "Lean, lower inflammatory load. Turkey provides excellent selenium." },
          { name: "Eggs (pastured)", benefit: "Pastured eggs have higher omega-3 and vitamin D." },
          { name: "Legumes (lentils, chickpeas, black beans)", benefit: "High fiber feeds anti-inflammatory gut bacteria. Rich in folate and magnesium." },
          { name: "Greek yogurt / kefir (plain, full-fat)", benefit: "Probiotics support gut microbiome and may help reduce systemic inflammation." }
        ]
      }
    ]
  },
  {
    section: "Vegetables & Fruits",
    intro: "Colorful plants are your most important food group. Their antioxidants, fiber, and phytochemicals directly fight inflammation.",
    categories: [
      {
        name: "Best Vegetables",
        description: "Aim for 7–9 servings of colorful vegetables daily.",
        items: [
          { name: "Leafy greens (spinach, kale, arugula)", benefit: "Rich in vitamin K, folate, magnesium, and lutein. Reduce CRP." },
          { name: "Broccoli and cruciferous vegetables", benefit: "Sulforaphane blocks NF-kB (master inflammation switch)." },
          { name: "Beets", benefit: "Betalains are powerful anti-inflammatory pigments." },
          { name: "Sweet potatoes", benefit: "Beta-carotene, potassium, and B6. Anti-inflammatory and excellent for gut health." },
          { name: "Mushrooms (shiitake, maitake)", benefit: "Beta-glucans modulate immune function. Rich in ergothioneine." },
          { name: "Asparagus", benefit: "Rich in folate, vitamins K, C, and glutathione, the body's master antioxidant." }
        ]
      },
      {
        name: "Best Fruits",
        description: "Berries, cherries, and citrus are particularly powerful.",
        items: [
          { name: "Blueberries", benefit: "Anthocyanins are among the most studied anti-inflammatory compounds." },
          { name: "Tart cherries", benefit: "Reduce uric acid, CRP, and joint pain. Melatonin content also improves sleep." },
          { name: "Strawberries and raspberries", benefit: "High in vitamin C, fisetin, and ellagic acid." },
          { name: "Pomegranate", benefit: "Punicalagins are exceptional antioxidants. Reduces joint tenderness in studies." },
          { name: "Avocado", benefit: "Rich in oleic acid, vitamin E, and glutathione." },
          { name: "Citrus (oranges, lemon)", benefit: "High vitamin C supports collagen synthesis. Hesperidin in oranges reduces inflammation." }
        ]
      }
    ]
  }
];

export type ShoppingItem = { item: string; why: string };
export type ShoppingList = { category: string; items: ShoppingItem[] };

export const shoppingList: ShoppingList[] = [
  {
    category: "Pantry Staples",
    items: [
      { item: "Extra virgin olive oil (cold-pressed)", why: "Daily cooking oil and dressing base" },
      { item: "Avocado oil", why: "High-heat cooking" },
      { item: "Flaxseeds (whole, for grinding)", why: "Daily omega-3 boost" },
      { item: "Chia seeds", why: "Omega-3, fiber, puddings, smoothies" },
      { item: "Hemp seeds (hulled)", why: "Complete protein, easy daily addition" },
      { item: "Walnuts, almonds, Brazil nuts, pecans", why: "Daily snack and recipe ingredient" },
      { item: "Turmeric powder", why: "Use daily — an essential spice" },
      { item: "Ground ginger and fresh ginger root", why: "Daily cooking and tea" },
      { item: "Ceylon cinnamon", why: "Anti-inflammatory, blood sugar balance" },
      { item: "Black pepper (freshly ground)", why: "Activates turmeric curcumin. Always use together." },
      { item: "Garlic (fresh)", why: "Use freely in all savory cooking" },
      { item: "Green tea bags", why: "2–3 cups daily" },
      { item: "Tart cherry juice (100%, no added sugar)", why: "Daily 8 oz serving" },
      { item: "Bone broth (low-sodium)", why: "Soups, cooking liquid, morning warm drink" }
    ]
  },
  {
    category: "Grains & Legumes",
    items: [
      { item: "Brown rice", why: "Fiber-rich whole grain, lower glycemic" },
      { item: "Quinoa", why: "Complete protein, high magnesium" },
      { item: "Rolled oats (gluten-free if needed)", why: "Anti-inflammatory breakfast base" },
      { item: "Red lentils and green lentils", why: "Quick-cooking plant protein" },
      { item: "Chickpeas (canned and dried)", why: "Versatile plant protein" },
      { item: "Black beans and white beans", why: "Fiber, folate, anti-inflammatory" },
      { item: "Sourdough bread", why: "Fermented for lower gluten load, better tolerated" }
    ]
  },
  {
    category: "Produce (weekly)",
    items: [
      { item: "Spinach, kale, arugula", why: "Leafy green base; buy multiple varieties" },
      { item: "Broccoli, cauliflower, Brussels sprouts", why: "Cruciferous sulforaphane sources" },
      { item: "Sweet potatoes and beets", why: "Anti-inflammatory root vegetables" },
      { item: "Avocados (2–3)", why: "Healthy fat, daily use" },
      { item: "Blueberries, raspberries, strawberries (fresh or frozen)", why: "Daily antioxidant serving" },
      { item: "Tart cherries (fresh or frozen)", why: "Anti-inflammatory, joint support" },
      { item: "Lemons and oranges", why: "Vitamin C, dressing, flavor" },
      { item: "Fresh ginger root", why: "Teas and cooking" },
      { item: "Shiitake or cremini mushrooms", why: "Immune-modulating beta-glucans" }
    ]
  }
];
