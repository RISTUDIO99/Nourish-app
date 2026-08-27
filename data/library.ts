import type { ImageSourcePropType } from "react-native";

type TranslatedLibraryCopy = Partial<Pick<LibraryItem, "title" | "summary" | "description" | "instructions">>;

export type Ingredient = {
  amount: string;
  unit: string;
  name: string;
  category?: string;
};

export type LibraryAssignment = {
  version: 1;
  recipeId: string;
  servings: number;
  note?: string;
  assignedAt: string;
};

export type LibraryItem = {
  id: string;
  title: string;
  summary: string;
  description: string;
  image: ImageSourcePropType;
  mealTypes: string[]; // e.g., 'Breakfast', 'Lunch', 'Dinner', 'Snack', 'Drink'
  cuisine?: string;
  region?: string;
  collectionIds: string[];
  servings: number;
  prepMinutes: number;
  cookMinutes: number;
  estimatedNutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  ingredients: Ingredient[];
  instructions: string[];
  tags: string[]; // e.g., 'Gluten-Free', 'Vegan', 'Anti-Inflammatory'
  allergens?: string[];
  substitutions: { original: string; replacement: string }[];
  wellnessNote?: string;
  alcoholFlag?: boolean;
  alcoholFreeAlternative?: string;
  alcoholHiddenImage?: ImageSourcePropType;
  translations?: Record<string, TranslatedLibraryCopy>;
};

export type Collection = {
  id: string;
  title: string;
  subtitle: string;
  kind: "cuisine" | "lifestyle" | "meal-type" | "featured";
  image?: ImageSourcePropType;
  itemIds: string[];
};

const images = {
  beyaynetu: require("../assets/images/library/ethiopian-beyaynetu.jpg"),
  shiro: require("../assets/images/library/shiro-bowl.jpg"),
  misir: require("../assets/images/library/misir-wot.jpg"),
  salmonQuinoa: require("../assets/images/library/salmon-quinoa.jpg"),
  berryOats: require("../assets/images/library/berry-oats.jpg"),
  avocadoEggs: require("../assets/images/library/avocado-eggs.jpg"),
  mangoSmoothie: require("../assets/images/library/mango-smoothie.jpg"),
  infusedWater: require("../assets/images/library/infused-water.jpg"),
  hibiscusMocktail: require("../assets/images/library/hibiscus-mocktail.jpg"),
  roastedVegBowl: require("../assets/images/library/roasted-veg-bowl.jpg"),
  jerkChicken: require("../assets/images/library/jerk-chicken.jpg"),
  salmonWinePairing: require("../assets/images/library/salmon-wine-pairing.jpg"),
  salmonFoodOnly: require("../assets/images/library/salmon-food-only.jpg"),
  lentilSoup: require("../assets/images/library/lentil-soup.jpg"),
  dateCacaoBites: require("../assets/images/library/date-cacao-bites.jpg"),
};

export const libraryItems: LibraryItem[] = [
  {
    id: "eth-beyaynetu",
    title: "Ethiopian Beyaynetu",
    summary: "A vibrant, colorful platter of vegan stews and vegetables.",
    description: "Beyaynetu means 'a bit of everything'. This Ethiopian fasting-style vegan platter is served on injera with fiber-rich legumes, warm spices, and colorful vegetables.",
    image: images.beyaynetu,
    mealTypes: ["Lunch", "Dinner"],
    cuisine: "Ethiopian",
    region: "East Africa",
    collectionIds: ["ethiopian-heritage", "anti-inflammatory", "plant-based"],
    servings: 2,
    prepMinutes: 30,
    cookMinutes: 45,
    estimatedNutrition: { calories: 520, protein: 22, carbs: 85, fat: 12 },
    ingredients: [
      { amount: "2", unit: "pieces", name: "Injera (teff flatbread)", category: "Grains" },
      { amount: "1", unit: "cup", name: "Misir Wot (red lentil stew)", category: "Legumes" },
      { amount: "1", unit: "cup", name: "Kik Alicha (yellow split pea stew)", category: "Legumes" },
      { amount: "1", unit: "cup", name: "Gomen (collard greens)", category: "Vegetables" },
      { amount: "1/2", unit: "cup", name: "Atakilt Wot (cabbage and potatoes)", category: "Vegetables" },
    ],
    instructions: [
      "Prepare or warm the individual stews (Misir Wot, Kik Alicha, Gomen, Atakilt Wot).",
      "Lay out a large piece of injera on a flat platter.",
      "Spoon small mounds of each stew arranged in a circle around the injera.",
      "Serve with extra rolls of injera for scooping."
    ],
    tags: ["Vegan", "Dairy-Free", "High-Fiber", "Anti-Inflammatory"],
    substitutions: [{ original: "Injera", replacement: "Gluten-free teff injera or brown rice" }],
    wellnessNote: "Teff, the grain used for injera, is naturally gluten-free and highly rich in iron and calcium."
  },
  {
    id: "eth-shiro",
    title: "Silky Shiro Bowl",
    summary: "A smooth, spiced chickpea flour stew.",
    description: "Shiro is the ultimate Ethiopian comfort food. Made from seasoned chickpea or broad bean flour, it simmers into a creamy, savory dip that is incredibly rich in protein and soothing to the gut when prepared with minimal oil.",
    image: images.shiro,
    mealTypes: ["Lunch", "Dinner"],
    cuisine: "Ethiopian",
    region: "East Africa",
    collectionIds: ["ethiopian-heritage", "comfort-food"],
    servings: 2,
    prepMinutes: 10,
    cookMinutes: 20,
    estimatedNutrition: { calories: 310, protein: 18, carbs: 42, fat: 10 },
    ingredients: [
      { amount: "1/2", unit: "cup", name: "Shiro powder (spiced chickpea flour)", category: "Pantry" },
      { amount: "1", unit: "tbsp", name: "Olive oil or Niter Kibbeh (spiced butter)", category: "Oils" },
      { amount: "1", unit: "small", name: "Red onion, finely minced", category: "Produce" },
      { amount: "1", unit: "clove", name: "Garlic, minced", category: "Produce" },
      { amount: "2", unit: "cups", name: "Water", category: "Liquid" },
      { amount: "1", unit: "tbsp", name: "Tomato paste", category: "Pantry" }
    ],
    instructions: [
      "Sauté the minced onion in a dry pan until it softens. Add oil and garlic.",
      "Stir in tomato paste and cook for 2 minutes.",
      "Gradually whisk in the water and bring to a simmer.",
      "Slowly add the shiro powder while whisking continuously to prevent lumps.",
      "Simmer on low heat for 15 minutes until it thickens to a creamy consistency.",
      "Serve hot with injera or a side salad."
    ],
    tags: ["Vegetarian", "High-Protein", "Gut-Friendly"],
    substitutions: [{ original: "Niter Kibbeh", replacement: "Olive oil for a vegan option" }],
    wellnessNote: "Chickpea flour gives shiro its creamy texture and contributes plant protein and fiber."
  },
  {
    id: "eth-misir",
    title: "Spicy Misir Wot",
    summary: "Berbere-spiced red lentil stew.",
    description: "A staple in East African cuisine, Misir Wot brings together quick-cooking red lentils and the complex, fiery warmth of berbere spice. It's a nutrient-dense, fiber-packed powerhouse.",
    image: images.misir,
    mealTypes: ["Lunch", "Dinner"],
    cuisine: "Ethiopian",
    region: "East Africa",
    collectionIds: ["ethiopian-heritage", "plant-based"],
    servings: 4,
    prepMinutes: 15,
    cookMinutes: 40,
    estimatedNutrition: { calories: 280, protein: 15, carbs: 45, fat: 6 },
    ingredients: [
      { amount: "1", unit: "cup", name: "Red lentils, rinsed", category: "Legumes" },
      { amount: "1", unit: "large", name: "Red onion, finely diced", category: "Produce" },
      { amount: "2", unit: "tbsp", name: "Berbere spice blend", category: "Spices" },
      { amount: "3", unit: "cloves", name: "Garlic, minced", category: "Produce" },
      { amount: "1", unit: "tbsp", name: "Ginger, minced", category: "Produce" },
      { amount: "2", unit: "tbsp", name: "Olive oil", category: "Oils" },
      { amount: "3", unit: "cups", name: "Vegetable broth or water", category: "Liquid" }
    ],
    instructions: [
      "In a pot, dry-roast the onions until moisture evaporates. Add olive oil.",
      "Stir in garlic, ginger, and berbere spice. Cook for 2-3 minutes until fragrant.",
      "Add a splash of water to prevent burning, then stir in the rinsed lentils.",
      "Pour in the broth, bring to a boil, then reduce heat to low.",
      "Cover and simmer for 30-40 minutes until lentils are very soft and the stew is thick.",
      "Adjust salt to taste and serve."
    ],
    tags: ["Vegan", "Gluten-Free", "High-Fiber", "Anti-Inflammatory"],
    substitutions: [{ original: "Berbere", replacement: "A mix of paprika, cayenne, cumin, and coriander if unavailable" }],
    wellnessNote: "Berbere commonly combines chilies with warming spices such as ginger, garlic, fenugreek, and cardamom."
  },
  {
    id: "med-salmon",
    title: "Mediterranean Salmon & Quinoa",
    summary: "Omega-3 rich salmon with herbed quinoa and asparagus.",
    description: "Wild-caught salmon is paired with quinoa and roasted asparagus, finished with a bright lemon-dill dressing.",
    image: images.salmonQuinoa,
    mealTypes: ["Dinner"],
    cuisine: "Mediterranean",
    region: "Southern Europe",
    collectionIds: ["anti-inflammatory", "quick-easy", "mediterranean"],
    servings: 2,
    prepMinutes: 10,
    cookMinutes: 20,
    estimatedNutrition: { calories: 480, protein: 38, carbs: 32, fat: 22 },
    ingredients: [
      { amount: "2", unit: "fillets", name: "Wild-caught salmon", category: "Seafood" },
      { amount: "1/2", unit: "cup", name: "Quinoa, rinsed", category: "Grains" },
      { amount: "1", unit: "bunch", name: "Asparagus, trimmed", category: "Produce" },
      { amount: "1", unit: "tbsp", name: "Olive oil", category: "Oils" },
      { amount: "1", unit: "half", name: "Lemon, juiced", category: "Produce" },
      { amount: "1", unit: "tbsp", name: "Fresh dill, chopped", category: "Herbs" }
    ],
    instructions: [
      "Cook quinoa according to package instructions.",
      "Preheat oven to 400°F (200°C). Place salmon and asparagus on a baking sheet.",
      "Drizzle with olive oil, salt, and pepper. Bake for 12-15 minutes.",
      "Mix cooked quinoa with lemon juice and fresh dill.",
      "Serve the salmon over the herbed quinoa alongside the roasted asparagus."
    ],
    tags: ["Pescatarian", "High-Protein", "Omega-3", "Gluten-Free"],
    substitutions: [{ original: "Salmon", replacement: "Arctic char or trout for different omega-3 sources" }],
    wellnessNote: "Salmon is a source of omega-3 fats, while quinoa adds fiber and plant protein."
  },
  {
    id: "brk-oats",
    title: "Antioxidant Berry Oats",
    summary: "Warm oatmeal topped with berries and chia seeds.",
    description: "Start the day with a fiber-rich bowl of oats, berries, chia seeds, walnuts, and a touch of maple.",
    image: images.berryOats,
    mealTypes: ["Breakfast"],
    collectionIds: ["quick-easy", "anti-inflammatory", "morning-rituals"],
    servings: 1,
    prepMinutes: 5,
    cookMinutes: 10,
    estimatedNutrition: { calories: 320, protein: 10, carbs: 54, fat: 8 },
    ingredients: [
      { amount: "1/2", unit: "cup", name: "Rolled oats", category: "Grains" },
      { amount: "1", unit: "cup", name: "Almond milk or water", category: "Liquid" },
      { amount: "1/2", unit: "cup", name: "Mixed berries (fresh or frozen)", category: "Produce" },
      { amount: "1", unit: "tbsp", name: "Chia seeds", category: "Pantry" },
      { amount: "1", unit: "tsp", name: "Ceylon cinnamon", category: "Spices" }
    ],
    instructions: [
      "Combine oats, milk, and cinnamon in a small saucepan.",
      "Bring to a gentle boil, then simmer for 5-7 minutes, stirring occasionally.",
      "Stir in the chia seeds and let sit for 2 minutes to thicken.",
      "Top with mixed berries before serving."
    ],
    tags: ["Vegan", "High-Fiber", "Quick"],
    substitutions: [{ original: "Almond milk", replacement: "Oat milk or soy milk" }],
    wellnessNote: "Cinnamon and berries add natural aroma, color, and sweetness to the oat base."
  },
  {
    id: "brk-avocado",
    title: "Avocado & Soft-Boiled Eggs",
    summary: "Toasted sourdough with smashed avocado and eggs.",
    description: "A simple, balanced classic. Creamy avocado pairs with eggs and crisp sourdough for an easy breakfast.",
    image: images.avocadoEggs,
    mealTypes: ["Breakfast", "Lunch"],
    collectionIds: ["quick-easy", "mediterranean", "morning-rituals"],
    servings: 1,
    prepMinutes: 5,
    cookMinutes: 6,
    estimatedNutrition: { calories: 410, protein: 18, carbs: 30, fat: 24 },
    ingredients: [
      { amount: "1", unit: "slice", name: "Sourdough bread", category: "Bakery" },
      { amount: "1/2", unit: "medium", name: "Avocado", category: "Produce" },
      { amount: "2", unit: "large", name: "Pastured eggs", category: "Dairy/Eggs" },
      { amount: "1", unit: "pinch", name: "Red pepper flakes", category: "Spices" },
      { amount: "1", unit: "tsp", name: "Hemp seeds", category: "Pantry" }
    ],
    instructions: [
      "Bring a small pot of water to a boil. Gently lower the eggs in and boil for exactly 6 minutes.",
      "Transfer eggs to an ice bath, peel, and halve.",
      "Toast the sourdough slice.",
      "Mash the avocado directly onto the toast with a fork.",
      "Top with the soft-boiled eggs, red pepper flakes, hemp seeds, and a pinch of sea salt."
    ],
    tags: ["Vegetarian", "High-Protein", "Healthy Fats"],
    substitutions: [{ original: "Sourdough", replacement: "Gluten-free bread if needed" }],
    wellnessNote: "Pastured eggs are significantly higher in Vitamin D and Omega-3s than conventional eggs."
  },
  {
    id: "bev-mango",
    title: "Golden Mango Smoothie",
    summary: "A bright tropical smoothie with ginger and turmeric.",
    description: "A sunny blend of mango, ginger, turmeric, banana, and oat milk for an easy breakfast or afternoon refreshment.",
    image: images.mangoSmoothie,
    mealTypes: ["Smoothie", "Snack", "Breakfast"],
    collectionIds: ["quick-easy", "anti-inflammatory", "morning-rituals"],
    servings: 1,
    prepMinutes: 5,
    cookMinutes: 0,
    estimatedNutrition: { calories: 240, protein: 4, carbs: 45, fat: 5 },
    ingredients: [
      { amount: "1", unit: "cup", name: "Frozen mango chunks", category: "Produce" },
      { amount: "1/2", unit: "inch", name: "Fresh ginger, peeled", category: "Produce" },
      { amount: "1/2", unit: "tsp", name: "Turmeric powder", category: "Spices" },
      { amount: "1", unit: "pinch", name: "Black pepper", category: "Spices" },
      { amount: "1", unit: "cup", name: "Coconut water or milk", category: "Liquid" },
      { amount: "1", unit: "tbsp", name: "Flaxseeds", category: "Pantry" }
    ],
    instructions: [
      "Add all ingredients to a high-speed blender.",
      "Blend on high for 60 seconds until completely smooth.",
      "Pour into a glass and enjoy immediately."
    ],
    tags: ["Vegan", "Gluten-Free", "Raw", "Anti-Inflammatory"],
    substitutions: [{ original: "Mango", replacement: "Pineapple or peaches" }],
    wellnessNote: "A small pinch of black pepper complements turmeric's warm, earthy flavor."
  },
  {
    id: "bev-water",
    title: "Cucumber Mint Infusion",
    summary: "Hydrating, alkaline water infusion.",
    description: "Cucumber, mint, lemon, and berries turn everyday water into a colorful, spa-inspired drink.",
    image: images.infusedWater,
    mealTypes: ["Drink"],
    collectionIds: ["wellness-rituals", "quick-easy"],
    servings: 4,
    prepMinutes: 5,
    cookMinutes: 0,
    estimatedNutrition: { calories: 5, protein: 0, carbs: 1, fat: 0 },
    ingredients: [
      { amount: "1/2", unit: "medium", name: "Cucumber, thinly sliced", category: "Produce" },
      { amount: "1", unit: "handful", name: "Fresh mint leaves", category: "Herbs" },
      { amount: "4", unit: "cups", name: "Filtered water", category: "Liquid" },
      { amount: "1/2", unit: "medium", name: "Lemon, sliced (optional)", category: "Produce" }
    ],
    instructions: [
      "Place cucumber slices, mint leaves, and lemon (if using) in a large pitcher.",
      "Pour filtered water over the ingredients.",
      "Refrigerate for at least 1 hour before serving to let the flavors infuse.",
      "Serve over ice."
    ],
    tags: ["Vegan", "Hydration", "Zero-Sugar"],
    substitutions: [{ original: "Mint", replacement: "Basil or rosemary" }],
    wellnessNote: "Infused water can make regular hydration feel more inviting without added sweeteners."
  },
  {
    id: "bev-hibiscus",
    title: "Hibiscus Sunset Mocktail",
    summary: "A tart, ruby-red antioxidant beverage.",
    description: "Tart hibiscus tea, citrus, mint, and sparkling water make an easy alcohol-free drink for celebrations or weeknights.",
    image: images.hibiscusMocktail,
    mealTypes: ["Drink", "Snack"],
    collectionIds: ["wellness-rituals", "alcohol-free"],
    servings: 1,
    prepMinutes: 5,
    cookMinutes: 5,
    estimatedNutrition: { calories: 35, protein: 0, carbs: 8, fat: 0 },
    ingredients: [
      { amount: "1/2", unit: "cup", name: "Strong brewed hibiscus tea, chilled", category: "Pantry" },
      { amount: "1/2", unit: "cup", name: "Sparkling water", category: "Liquid" },
      { amount: "1", unit: "tsp", name: "Raw honey or maple syrup", category: "Pantry" },
      { amount: "1", unit: "slice", name: "Orange or lime", category: "Produce" },
      { amount: "1", unit: "sprig", name: "Rosemary (garnish)", category: "Herbs" }
    ],
    instructions: [
      "In a glass filled with ice, stir together the chilled hibiscus tea and honey.",
      "Top with sparkling water.",
      "Garnish with a citrus slice and a sprig of fresh rosemary."
    ],
    tags: ["Vegan", "Alcohol-Free", "High-Antioxidant"],
    substitutions: [{ original: "Sparkling water", replacement: "Kombucha for added probiotics" }],
    wellnessNote: "Hibiscus brings a naturally tart flavor and vivid ruby color without alcohol."
  },
  {
    id: "lun-veg-bowl",
    title: "Roasted Roots & Chickpea Bowl",
    summary: "A deeply nourishing, fiber-rich lunch bowl.",
    description: "An earthy, grounding bowl featuring roasted sweet potatoes, Brussels sprouts, and spiced chickpeas, all tied together with a creamy tahini dressing.",
    image: images.roastedVegBowl,
    mealTypes: ["Lunch", "Dinner"],
    collectionIds: ["plant-based", "anti-inflammatory"],
    servings: 2,
    prepMinutes: 15,
    cookMinutes: 30,
    estimatedNutrition: { calories: 460, protein: 14, carbs: 58, fat: 22 },
    ingredients: [
      { amount: "1", unit: "medium", name: "Sweet potato, cubed", category: "Produce" },
      { amount: "1", unit: "cup", name: "Brussels sprouts, halved", category: "Produce" },
      { amount: "1", unit: "cup", name: "Cooked chickpeas", category: "Legumes" },
      { amount: "2", unit: "tbsp", name: "Olive oil", category: "Oils" },
      { amount: "2", unit: "tbsp", name: "Tahini", category: "Pantry" },
      { amount: "1", unit: "tbsp", name: "Lemon juice", category: "Produce" }
    ],
    instructions: [
      "Preheat oven to 400°F (200°C).",
      "Toss sweet potatoes, Brussels sprouts, and chickpeas in olive oil, salt, and pepper.",
      "Spread on a baking sheet and roast for 25-30 minutes until tender and golden.",
      "In a small bowl, whisk tahini, lemon juice, a pinch of salt, and a splash of warm water until smooth.",
      "Transfer roasted vegetables to bowls and drizzle generously with tahini dressing."
    ],
    tags: ["Vegan", "Gluten-Free", "High-Fiber"],
    substitutions: [{ original: "Brussels sprouts", replacement: "Broccoli florets or cauliflower" }],
    wellnessNote: "Tahini adds a creamy sesame flavor, while roasted vegetables bring color and texture."
  },
  {
    id: "din-jerk",
    title: "Caribbean Jerk Chicken",
    summary: "Vibrant, spicy chicken with mango salsa.",
    description: "A celebration of Caribbean flavors. The jerk marinade is packed with allspice, thyme, and warming spices. Paired with a cooling, enzyme-rich mango salsa, it’s a balanced and deeply flavorful meal.",
    image: images.jerkChicken,
    mealTypes: ["Dinner", "Lunch"],
    cuisine: "Caribbean",
    region: "Caribbean",
    collectionIds: ["featured", "high-protein"],
    servings: 4,
    prepMinutes: 20,
    cookMinutes: 35,
    estimatedNutrition: { calories: 420, protein: 42, carbs: 28, fat: 16 },
    ingredients: [
      { amount: "4", unit: "pieces", name: "Chicken thighs, bone-in", category: "Meat" },
      { amount: "2", unit: "tbsp", name: "Jerk seasoning paste", category: "Pantry" },
      { amount: "1", unit: "tbsp", name: "Olive oil", category: "Oils" },
      { amount: "1", unit: "cup", name: "Mango, diced", category: "Produce" },
      { amount: "1/4", unit: "cup", name: "Red onion, minced", category: "Produce" },
      { amount: "1", unit: "handful", name: "Cilantro, chopped", category: "Herbs" }
    ],
    instructions: [
      "Rub chicken thighs with olive oil and jerk seasoning. Marinate for at least 30 minutes (or overnight).",
      "Preheat oven to 375°F (190°C). Bake chicken for 35-40 minutes until cooked through and skin is crisp.",
      "While chicken cooks, combine diced mango, red onion, and cilantro in a bowl to make the salsa.",
      "Serve the jerk chicken hot, topped with the fresh mango salsa."
    ],
    tags: ["High-Protein", "Gluten-Free"],
    substitutions: [{ original: "Chicken thighs", replacement: "Firm tofu or cauliflower steaks for a vegan option" }],
    wellnessNote: "Allspice and thyme give jerk seasoning its aromatic warmth and distinctive Caribbean flavor."
  },
  {
    id: "din-wine",
    title: "Herb-Crusted Salmon",
    summary: "An elegant herb-forward dinner with roasted vegetables.",
    description: "Herb-crusted salmon with roasted vegetables makes an elegant dinner. A light Pinot Noir is offered only as an optional pairing, alongside a tart cherry spritzer.",
    image: images.salmonWinePairing,
    alcoholHiddenImage: images.salmonFoodOnly,
    mealTypes: ["Dinner", "Wine Pairing"],
    cuisine: "Mediterranean",
    collectionIds: ["featured", "mediterranean"],
    servings: 2,
    prepMinutes: 15,
    cookMinutes: 15,
    estimatedNutrition: { calories: 550, protein: 35, carbs: 12, fat: 26 },
    alcoholFlag: true,
    alcoholFreeAlternative: "Sparkling cranberry or pomegranate juice spritzer.",
    ingredients: [
      { amount: "2", unit: "fillets", name: "Salmon", category: "Seafood" },
      { amount: "2", unit: "tbsp", name: "Fresh parsley, minced", category: "Herbs" },
      { amount: "1", unit: "tbsp", name: "Dijon mustard", category: "Pantry" },
      { amount: "1", unit: "tbsp", name: "Olive oil", category: "Oils" }
    ],
    instructions: [
      "Preheat oven to 400°F (200°C).",
      "Brush salmon fillets with Dijon mustard, then press the minced parsley onto the top.",
      "Drizzle with olive oil and bake for 12-15 minutes.",
      "Serve alongside roasted asparagus or a green salad.",
      "If desired, serve the optional pairing separately, or choose the tart cherry spritzer."
    ],
    tags: ["Pescatarian", "High-Protein", "Mindful Indulgence"],
    substitutions: [{ original: "Pinot Noir", replacement: "A tart cherry juice spritzer for zero alcohol" }],
    wellnessNote: "The complete dish is the focus; the wine pairing is optional and is not presented as a health recommendation."
  },
  {
    id: "lun-lentil",
    title: "Rustic Lentil & Herb Soup",
    summary: "A comforting, deeply savory bowl of wellness.",
    description: "A cornerstone of anti-inflammatory diets across the globe. This soup relies on a humble base of lentils, slow-cooked with root vegetables, thyme, and a splash of lemon to brighten the earthy flavors.",
    image: images.lentilSoup,
    mealTypes: ["Lunch", "Dinner"],
    cuisine: "Mediterranean",
    collectionIds: ["anti-inflammatory", "comfort-food", "plant-based"],
    servings: 4,
    prepMinutes: 15,
    cookMinutes: 45,
    estimatedNutrition: { calories: 310, protein: 18, carbs: 52, fat: 4 },
    ingredients: [
      { amount: "1.5", unit: "cups", name: "Brown or green lentils", category: "Legumes" },
      { amount: "1", unit: "medium", name: "Onion, chopped", category: "Produce" },
      { amount: "2", unit: "medium", name: "Carrots, diced", category: "Produce" },
      { amount: "2", unit: "stalks", name: "Celery, diced", category: "Produce" },
      { amount: "4", unit: "cups", name: "Vegetable broth", category: "Liquid" },
      { amount: "1", unit: "tbsp", name: "Fresh thyme", category: "Herbs" },
      { amount: "1", unit: "half", name: "Lemon, juiced", category: "Produce" }
    ],
    instructions: [
      "In a large pot, sauté the onion, carrots, and celery in a splash of olive oil until softened (about 8 minutes).",
      "Add the thyme and stir for 1 minute.",
      "Add the rinsed lentils and vegetable broth. Bring to a boil.",
      "Reduce heat, cover, and simmer for 35-40 minutes until lentils are tender.",
      "Stir in the fresh lemon juice right before serving. Season with salt and pepper."
    ],
    tags: ["Vegan", "High-Fiber", "Comfort Food"],
    substitutions: [{ original: "Fresh thyme", replacement: "Dried thyme or oregano" }],
    wellnessNote: "Lentils contribute fiber, plant protein, and folate to this satisfying bowl."
  },
  {
    id: "snk-cacao",
    title: "Date & Cacao Energy Bites",
    summary: "Sweet, fudgy treats with no refined sugar.",
    description: "When the afternoon slump hits, these bites deliver sustained energy. Dates provide natural sweetness and fiber, while raw cacao offers a massive dose of magnesium and antioxidants.",
    image: images.dateCacaoBites,
    mealTypes: ["Snack", "Treat"],
    collectionIds: ["quick-easy", "plant-based"],
    servings: 6,
    prepMinutes: 10,
    cookMinutes: 0,
    estimatedNutrition: { calories: 180, protein: 4, carbs: 24, fat: 9 },
    ingredients: [
      { amount: "1", unit: "cup", name: "Medjool dates, pitted", category: "Produce" },
      { amount: "1", unit: "cup", name: "Walnuts or almonds", category: "Pantry" },
      { amount: "1/4", unit: "cup", name: "Raw cacao powder", category: "Pantry" },
      { amount: "1", unit: "tbsp", name: "Chia seeds", category: "Pantry" },
      { amount: "1", unit: "pinch", name: "Sea salt", category: "Spices" },
      { amount: "2", unit: "tbsp", name: "Desiccated coconut (for rolling)", category: "Pantry" }
    ],
    instructions: [
      "Place walnuts in a food processor and pulse until crumbly.",
      "Add the pitted dates, cacao powder, chia seeds, and salt.",
      "Process until the mixture clumps together to form a sticky dough.",
      "Roll the dough into bite-sized balls using your hands.",
      "Roll each ball in desiccated coconut to coat. Store in the fridge."
    ],
    tags: ["Vegan", "Raw", "No Refined Sugar"],
    substitutions: [{ original: "Walnuts", replacement: "Pecans, or sunflower seeds for a nut-free option" }],
    wellnessNote: "Raw cacao is one of the highest plant-based sources of magnesium, which helps relax muscles and ease tension."
  },
  {
    id: "eth-kinche",
    title: "Savory Kinche",
    summary: "Warm, spiced cracked wheat porridge.",
    description: "Often served for breakfast in Ethiopia, Kinche is similar to bulgur or oatmeal but savory. Spiced with a touch of flavored butter or oil, it is deeply warming and comforting.",
    image: images.beyaynetu, // reusing image
    mealTypes: ["Breakfast"],
    cuisine: "Ethiopian",
    region: "East Africa",
    collectionIds: ["ethiopian-heritage", "comfort-food"],
    servings: 2,
    prepMinutes: 5,
    cookMinutes: 20,
    estimatedNutrition: { calories: 280, protein: 8, carbs: 45, fat: 8 },
    ingredients: [
      { amount: "1", unit: "cup", name: "Cracked wheat (bulgur)", category: "Grains" },
      { amount: "2", unit: "cups", name: "Water", category: "Liquid" },
      { amount: "1", unit: "tbsp", name: "Niter Kibbeh (spiced butter) or Olive Oil", category: "Oils" },
      { amount: "1", unit: "pinch", name: "Salt", category: "Spices" }
    ],
    instructions: [
      "Bring water and salt to a boil in a medium pot.",
      "Stir in the cracked wheat, reduce heat to low, and cover.",
      "Simmer for 15-20 minutes until all water is absorbed.",
      "Stir in the spiced butter or olive oil just before serving."
    ],
    tags: ["Vegetarian", "High-Fiber"],
    substitutions: [{ original: "Cracked wheat", replacement: "Quinoa or millet for a gluten-free option" }],
    wellnessNote: "Cracked wheat adds a hearty texture and whole-grain flavor."
  },
  {
    id: "lun-salad",
    title: "Mediterranean Chopped Salad",
    summary: "Crisp vegetables, olives, and feta.",
    description: "A bright, crunchy salad that comes together in minutes. Perfect for a quick lunch packed with phytonutrients and healthy fats.",
    image: images.roastedVegBowl, // reuse image
    mealTypes: ["Lunch"],
    cuisine: "Mediterranean",
    collectionIds: ["quick-easy", "mediterranean"],
    servings: 2,
    prepMinutes: 10,
    cookMinutes: 0,
    estimatedNutrition: { calories: 340, protein: 8, carbs: 15, fat: 28 },
    ingredients: [
      { amount: "2", unit: "cups", name: "Cucumbers, diced", category: "Produce" },
      { amount: "1", unit: "cup", name: "Cherry tomatoes, halved", category: "Produce" },
      { amount: "1/4", unit: "cup", name: "Kalamata olives", category: "Pantry" },
      { amount: "1/4", unit: "cup", name: "Feta cheese, crumbled", category: "Dairy/Eggs" },
      { amount: "2", unit: "tbsp", name: "Olive oil", category: "Oils" },
      { amount: "1", unit: "tbsp", name: "Red wine vinegar", category: "Pantry" }
    ],
    instructions: [
      "Combine cucumbers, tomatoes, olives, and feta in a large bowl.",
      "Whisk together olive oil, vinegar, salt, and oregano.",
      "Toss the salad with the dressing and serve immediately."
    ],
    tags: ["Vegetarian", "Gluten-Free", "Low-Carb"],
    substitutions: [{ original: "Feta", replacement: "Almonds or walnuts for a dairy-free crunch" }],
    wellnessNote: "Extra virgin olive oil adds richness and carries the salad's lemon, herb, and spice flavors."
  },
  {
    id: "snk-hummus",
    title: "Golden Turmeric Hummus",
    summary: "Creamy hummus with turmeric and black pepper.",
    description: "A colorful twist on classic hummus, with turmeric, black pepper, tahini, lemon, and olive oil.",
    image: images.shiro, // reuse image
    mealTypes: ["Snack"],
    collectionIds: ["quick-easy", "anti-inflammatory", "plant-based"],
    servings: 4,
    prepMinutes: 10,
    cookMinutes: 0,
    estimatedNutrition: { calories: 210, protein: 6, carbs: 18, fat: 14 },
    ingredients: [
      { amount: "1", unit: "can", name: "Chickpeas, rinsed", category: "Legumes" },
      { amount: "1/4", unit: "cup", name: "Tahini", category: "Pantry" },
      { amount: "2", unit: "tbsp", name: "Olive oil", category: "Oils" },
      { amount: "1", unit: "tbsp", name: "Lemon juice", category: "Produce" },
      { amount: "1", unit: "tsp", name: "Turmeric powder", category: "Spices" },
      { amount: "1", unit: "pinch", name: "Black pepper", category: "Spices" }
    ],
    instructions: [
      "Combine all ingredients in a food processor.",
      "Blend until completely smooth. Add a splash of ice water if the hummus is too thick.",
      "Serve with carrot sticks, cucumbers, or warm pita."
    ],
    tags: ["Vegan", "Gluten-Free"],
    substitutions: [{ original: "Chickpeas", replacement: "White beans for a creamier texture" }],
    wellnessNote: "Tahini and olive oil give the dip a smooth texture that balances turmeric's earthy flavor."
  },
  {
    id: "din-curry",
    title: "Coconut Spinach Curry",
    summary: "A warming, vibrant green curry.",
    description: "A fast, nutrient-dense dinner that feels like a hug in a bowl. Spinach provides iron and folate, while coconut milk offers a creamy, satisfying base.",
    image: images.misir, // reuse image
    mealTypes: ["Dinner"],
    cuisine: "Asian-Inspired",
    collectionIds: ["comfort-food", "plant-based"],
    servings: 3,
    prepMinutes: 10,
    cookMinutes: 20,
    estimatedNutrition: { calories: 380, protein: 12, carbs: 28, fat: 26 },
    ingredients: [
      { amount: "1", unit: "can", name: "Full-fat coconut milk", category: "Pantry" },
      { amount: "2", unit: "cups", name: "Fresh spinach", category: "Produce" },
      { amount: "1", unit: "block", name: "Firm tofu, cubed", category: "Pantry" },
      { amount: "2", unit: "tbsp", name: "Green curry paste", category: "Pantry" },
      { amount: "1", unit: "tbsp", name: "Coconut oil", category: "Oils" }
    ],
    instructions: [
      "Heat coconut oil in a pan and sauté the green curry paste until fragrant (about 2 mins).",
      "Stir in the coconut milk and bring to a gentle simmer.",
      "Add cubed tofu and simmer for 10 minutes.",
      "Stir in the spinach until just wilted. Serve over brown rice or quinoa."
    ],
    tags: ["Vegan", "Gluten-Free", "Comfort Food"],
    substitutions: [{ original: "Tofu", replacement: "Chicken or shrimp" }],
    wellnessNote: "Coconut milk contains medium-chain triglycerides (MCTs) which are easily absorbed and used for energy."
  },
  {
    id: "bev-ginger",
    title: "Ginger & Lemon Soother",
    summary: "A hot, potent digestive tea.",
    description: "A simple ginger and lemon tea for cold mornings, quiet evenings, or whenever you want a warming drink.",
    image: images.infusedWater, // reuse image
    mealTypes: ["Drink"],
    collectionIds: ["wellness-rituals", "quick-easy"],
    servings: 2,
    prepMinutes: 5,
    cookMinutes: 10,
    estimatedNutrition: { calories: 15, protein: 0, carbs: 4, fat: 0 },
    ingredients: [
      { amount: "2", unit: "inches", name: "Fresh ginger, sliced", category: "Produce" },
      { amount: "1", unit: "half", name: "Lemon", category: "Produce" },
      { amount: "3", unit: "cups", name: "Water", category: "Liquid" },
      { amount: "1", unit: "tsp", name: "Raw honey (optional)", category: "Pantry" }
    ],
    instructions: [
      "Place ginger slices and water in a small pot.",
      "Bring to a simmer and let it steep for 10 minutes.",
      "Pour into mugs through a strainer. Squeeze fresh lemon juice into each.",
      "Stir in honey if desired."
    ],
    tags: ["Vegan", "Caffeine-Free", "Digestive"],
    substitutions: [{ original: "Honey", replacement: "Maple syrup or omit entirely" }],
    wellnessNote: "Fresh ginger provides a naturally warming, peppery flavor."
  },
  {
    id: "brk-chia",
    title: "Vanilla Chia Pudding",
    summary: "A creamy, make-ahead breakfast.",
    description: "Chia seeds absorb liquid to create a satisfying, pudding-like texture while delivering a massive dose of soluble fiber and omega-3s. Perfect for busy mornings.",
    image: images.berryOats, // reuse image
    mealTypes: ["Breakfast", "Snack"],
    collectionIds: ["quick-easy", "morning-rituals", "plant-based"],
    servings: 2,
    prepMinutes: 5,
    cookMinutes: 0,
    estimatedNutrition: { calories: 250, protein: 8, carbs: 22, fat: 15 },
    ingredients: [
      { amount: "1/4", unit: "cup", name: "Chia seeds", category: "Pantry" },
      { amount: "1", unit: "cup", name: "Almond or oat milk", category: "Liquid" },
      { amount: "1", unit: "tsp", name: "Vanilla extract", category: "Pantry" },
      { amount: "1", unit: "tbsp", name: "Maple syrup", category: "Pantry" }
    ],
    instructions: [
      "In a jar or bowl, whisk together the chia seeds, milk, vanilla, and maple syrup.",
      "Let sit for 5 minutes, then whisk vigorously again to prevent clumps.",
      "Cover and refrigerate for at least 2 hours, or overnight.",
      "Serve topped with fresh fruit or nuts."
    ],
    tags: ["Vegan", "Gluten-Free", "High-Fiber", "Make-Ahead"],
    substitutions: [{ original: "Almond milk", replacement: "Coconut milk for a richer pudding" }],
    wellnessNote: "Chia seeds form a naturally thick pudding texture after resting in liquid."
  },
  {
    id: "din-stuffed",
    title: "Quinoa-Stuffed Bell Peppers",
    summary: "Colorful roasted peppers packed with herbed quinoa.",
    description: "A beautiful, self-contained meal. Bell peppers are loaded with vitamin C, which pairs perfectly with the plant-based protein of quinoa and the healthy fats of pine nuts.",
    image: images.roastedVegBowl, // reuse image
    mealTypes: ["Dinner"],
    cuisine: "Mediterranean",
    collectionIds: ["plant-based", "comfort-food"],
    servings: 4,
    prepMinutes: 15,
    cookMinutes: 40,
    estimatedNutrition: { calories: 320, protein: 10, carbs: 45, fat: 12 },
    ingredients: [
      { amount: "4", unit: "large", name: "Bell peppers (any color)", category: "Produce" },
      { amount: "1", unit: "cup", name: "Cooked quinoa", category: "Grains" },
      { amount: "1/2", unit: "cup", name: "Cherry tomatoes, diced", category: "Produce" },
      { amount: "1/4", unit: "cup", name: "Pine nuts, toasted", category: "Pantry" },
      { amount: "2", unit: "tbsp", name: "Fresh basil, chopped", category: "Herbs" }
    ],
    instructions: [
      "Preheat oven to 375°F (190°C). Cut the tops off the peppers and remove seeds.",
      "In a bowl, mix cooked quinoa, tomatoes, pine nuts, and basil. Season with salt and olive oil.",
      "Stuff each pepper with the quinoa mixture.",
      "Place in a baking dish, cover with foil, and bake for 30 minutes.",
      "Remove foil and bake for another 10 minutes until peppers are tender."
    ],
    tags: ["Vegan", "Gluten-Free", "High-Fiber"],
    substitutions: [{ original: "Pine nuts", replacement: "Chopped walnuts or sunflower seeds" }],
    wellnessNote: "One bell pepper contains more than 100% of your daily vitamin C requirement, crucial for collagen synthesis."
  },
  {
    id: "lun-wrap",
    title: "Collard Green Hummus Wraps",
    summary: "A fresh, low-carb lunch wrap.",
    description: "Using collard greens as a wrap is a fantastic way to boost your leafy green intake. These are crunchy, hydrating, and perfectly portable.",
    image: images.avocadoEggs, // reuse image
    mealTypes: ["Lunch"],
    collectionIds: ["quick-easy", "plant-based"],
    servings: 2,
    prepMinutes: 10,
    cookMinutes: 0,
    estimatedNutrition: { calories: 280, protein: 12, carbs: 30, fat: 14 },
    ingredients: [
      { amount: "4", unit: "large", name: "Collard green leaves", category: "Produce" },
      { amount: "1/2", unit: "cup", name: "Hummus", category: "Pantry" },
      { amount: "1", unit: "cup", name: "Shredded carrots", category: "Produce" },
      { amount: "1", unit: "cup", name: "Cucumber sticks", category: "Produce" },
      { amount: "1/2", unit: "cup", name: "Sprouts or microgreens", category: "Produce" }
    ],
    instructions: [
      "Wash the collard leaves and trim the thick stem so it lies flat.",
      "Spread a generous layer of hummus down the center of each leaf.",
      "Layer carrots, cucumber, and sprouts over the hummus.",
      "Fold the sides in and roll tightly like a burrito. Cut in half to serve."
    ],
    tags: ["Vegan", "Low-Carb", "Raw"],
    substitutions: [{ original: "Collard greens", replacement: "Large romaine or butter lettuce leaves" }],
    wellnessNote: "Collard greens add color, texture, fiber, and leafy greens to the plate."
  },
  {
    id: "bev-matcha",
    title: "Ceremonial Matcha Latte",
    summary: "Sustained energy and focused calm.",
    description: "Matcha, oat milk, and a touch of maple make a smooth, earthy drink for a calm morning ritual.",
    image: images.mangoSmoothie, // reuse image
    mealTypes: ["Drink", "Breakfast"],
    collectionIds: ["morning-rituals", "wellness-rituals"],
    servings: 1,
    prepMinutes: 5,
    cookMinutes: 5,
    estimatedNutrition: { calories: 90, protein: 2, carbs: 8, fat: 5 },
    ingredients: [
      { amount: "1", unit: "tsp", name: "Ceremonial grade matcha powder", category: "Pantry" },
      { amount: "1/4", unit: "cup", name: "Hot water (not boiling)", category: "Liquid" },
      { amount: "3/4", unit: "cup", name: "Oat or almond milk", category: "Liquid" },
      { amount: "1", unit: "tsp", name: "Maple syrup (optional)", category: "Pantry" }
    ],
    instructions: [
      "Sift the matcha powder into a mug to remove any clumps.",
      "Add the hot water and whisk vigorously (preferably with a bamboo whisk) until frothy.",
      "Warm the milk in a small saucepan and froth if desired.",
      "Pour the warm milk over the matcha and sweeten to taste."
    ],
    tags: ["Vegan", "High-Antioxidant"],
    substitutions: [{ original: "Oat milk", replacement: "Macadamia or coconut milk" }],
    wellnessNote: "Matcha's earthy flavor pairs well with creamy oat or almond milk."
  },
  {
    id: "snk-apple",
    title: "Almond Butter Apple Rings",
    summary: "A crunchy, satisfying 2-minute snack.",
    description: "Crisp apple rings, almond butter, seeds, and cinnamon make a quick snack with contrasting textures.",
    image: images.dateCacaoBites, // reuse image
    mealTypes: ["Snack"],
    collectionIds: ["quick-easy", "plant-based"],
    servings: 1,
    prepMinutes: 2,
    cookMinutes: 0,
    estimatedNutrition: { calories: 250, protein: 7, carbs: 28, fat: 14 },
    ingredients: [
      { amount: "1", unit: "medium", name: "Apple (crisp variety)", category: "Produce" },
      { amount: "2", unit: "tbsp", name: "Almond butter", category: "Pantry" },
      { amount: "1", unit: "tsp", name: "Hemp seeds or chia seeds", category: "Pantry" },
      { amount: "1", unit: "pinch", name: "Cinnamon", category: "Spices" }
    ],
    instructions: [
      "Core the apple and slice it horizontally into thick rings.",
      "Spread almond butter on each apple ring.",
      "Sprinkle with hemp seeds and cinnamon.",
      "Eat immediately."
    ],
    tags: ["Vegan", "Raw", "Quick"],
    substitutions: [{ original: "Almond butter", replacement: "Sunflower seed butter for a nut-free option" }],
    wellnessNote: "Apples contribute fiber and a crisp contrast to creamy almond butter."
  }
];

export const collections: Collection[] = [
  {
    id: "ethiopian-heritage",
    title: "Ethiopian Heritage",
    subtitle: "Warm spices and plant-rich traditions from East Africa.",
    kind: "cuisine",
    image: images.beyaynetu,
    itemIds: ["eth-beyaynetu", "eth-shiro", "eth-misir", "eth-kinche"]
  },
  {
    id: "anti-inflammatory",
    title: "Anti-Inflammatory",
    subtitle: "Colorful plants, whole foods, herbs, and omega-3-rich ingredients.",
    kind: "lifestyle",
    image: images.salmonQuinoa,
    itemIds: ["eth-beyaynetu", "med-salmon", "brk-oats", "bev-mango", "lun-veg-bowl", "lun-lentil", "snk-hummus"]
  },
  {
    id: "quick-easy",
    title: "Quick & Easy",
    subtitle: "Nourishing meals ready in 20 minutes or less.",
    kind: "featured",
    image: images.avocadoEggs,
    itemIds: ["brk-oats", "brk-avocado", "bev-mango", "bev-water", "lun-salad", "snk-hummus", "brk-chia", "lun-wrap", "snk-apple"]
  },
  {
    id: "mediterranean",
    title: "Mediterranean Inspired",
    subtitle: "Olive oil, fresh herbs, and omega-3s.",
    kind: "cuisine",
    image: images.roastedVegBowl,
    itemIds: ["med-salmon", "din-wine", "lun-lentil", "lun-salad", "din-stuffed"]
  },
  {
    id: "wellness-rituals",
    title: "Wellness Rituals",
    subtitle: "Drinks and tonics to support daily hydration and calm.",
    kind: "meal-type",
    image: images.infusedWater,
    itemIds: ["bev-water", "bev-hibiscus", "bev-ginger", "bev-matcha"]
  },
  {
    id: "plant-based",
    title: "Plant-Based Power",
    subtitle: "Vibrant, fiber-rich vegan and vegetarian meals.",
    kind: "lifestyle",
    image: images.misir,
    itemIds: ["eth-beyaynetu", "eth-misir", "lun-veg-bowl", "lun-lentil", "snk-cacao", "snk-hummus", "din-curry", "din-stuffed", "lun-wrap", "snk-apple"]
  }
];

export const allMealTypes = ["Breakfast", "Lunch", "Dinner", "Snack", "Treat", "Smoothie", "Drink", "Wine Pairing"];
