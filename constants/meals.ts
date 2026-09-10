export type MealCategory = 'plan' | 'smoothie' | 'drink';

export type MealIngredient = {
  id: string;
  name: string;
  amount: number;
  unit: string;
  calories: number;
  protein: number;
  fiber: number;
};

export type MealNutrition = {
  calories: number;
  protein: number;
  fiber: number;
  carbs: number;
};

export type Meal = {
  id: string;
  category: MealCategory;
  title: string;
  description: string;
  image: string;
  prepTime: string;
  servings: number;
  nutrition: MealNutrition;
  ingredients: MealIngredient[];
  instructions: string[];
};

export const categoryLabels: Record<MealCategory, string> = {
  plan: 'Meal plans',
  smoothie: 'Smoothies',
  drink: 'Healthy drinks',
};

export const meals: Meal[] = [
  {
    id: 'golden-salmon-bowl',
    category: 'plan',
    title: 'Golden salmon bowl',
    description: 'A colourful, omega-3 rich dinner for calmer evenings.',
    image:
      'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=85',
    prepTime: '30 min',
    servings: 2,
    nutrition: { calories: 540, protein: 34, fiber: 9, carbs: 48 },
    ingredients: [
      { id: 'salmon', name: 'Salmon fillet', amount: 2, unit: 'pieces', calories: 280, protein: 28, fiber: 0 },
      { id: 'quinoa', name: 'Cooked quinoa', amount: 1, unit: 'cup', calories: 220, protein: 8, fiber: 5 },
      { id: 'broccoli', name: 'Broccoli florets', amount: 2, unit: 'cups', calories: 55, protein: 4, fiber: 5 },
      { id: 'turmeric', name: 'Ground turmeric', amount: 1, unit: 'tsp', calories: 8, protein: 0, fiber: 1 },
      { id: 'lemon', name: 'Lemon', amount: 1, unit: 'whole', calories: 17, protein: 1, fiber: 2 },
    ],
    instructions: [
      'Heat the oven to 200°C / 400°F and line a tray with parchment.',
      'Rub salmon with turmeric, lemon zest, olive oil, and a pinch of salt.',
      'Roast for 12–15 minutes, adding broccoli to the tray for the final 8 minutes.',
      'Serve over warm quinoa with lemon juice and a drizzle of olive oil.',
    ],
  },
  {
    id: 'comforting-lentil-soup',
    category: 'plan',
    title: 'Comforting lentil soup',
    description: 'A warming, fibre-rich bowl for low-energy or flare days.',
    image:
      'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=1200&q=85',
    prepTime: '40 min',
    servings: 4,
    nutrition: { calories: 390, protein: 19, fiber: 17, carbs: 58 },
    ingredients: [
      { id: 'lentils', name: 'Green lentils', amount: 1.5, unit: 'cups', calories: 270, protein: 18, fiber: 15 },
      { id: 'carrot', name: 'Carrots', amount: 2, unit: 'medium', calories: 50, protein: 1, fiber: 4 },
      { id: 'spinach', name: 'Baby spinach', amount: 2, unit: 'cups', calories: 14, protein: 2, fiber: 2 },
      { id: 'stock', name: 'Low-sodium vegetable stock', amount: 4, unit: 'cups', calories: 40, protein: 2, fiber: 1 },
      { id: 'ginger', name: 'Fresh ginger', amount: 1, unit: 'tbsp', calories: 5, protein: 0, fiber: 0 },
    ],
    instructions: [
      'Rinse the lentils and add them to a large pot with the stock.',
      'Add chopped carrots, ginger, cumin, and black pepper. Simmer for 25 minutes.',
      'Stir through the spinach and cook until just wilted.',
      'Taste, season gently, and serve with lemon or a spoonful of plain yoghurt.',
    ],
  },
  {
    id: 'lemon-herb-traybake',
    category: 'plan',
    title: 'Lemon herb traybake',
    description: 'An easy-prep dinner with tender chicken and roasted roots.',
    image:
      'https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=1200&q=85',
    prepTime: '35 min',
    servings: 3,
    nutrition: { calories: 470, protein: 36, fiber: 8, carbs: 42 },
    ingredients: [
      { id: 'chicken', name: 'Chicken breast', amount: 3, unit: 'pieces', calories: 240, protein: 36, fiber: 0 },
      { id: 'sweet-potato', name: 'Sweet potato', amount: 2, unit: 'medium', calories: 180, protein: 4, fiber: 8 },
      { id: 'courgette', name: 'Courgette', amount: 2, unit: 'medium', calories: 65, protein: 5, fiber: 4 },
      { id: 'herbs', name: 'Fresh herbs', amount: 2, unit: 'tbsp', calories: 4, protein: 0, fiber: 1 },
      { id: 'lemon-juice', name: 'Lemon juice', amount: 2, unit: 'tbsp', calories: 8, protein: 0, fiber: 0 },
    ],
    instructions: [
      'Heat the oven to 210°C / 410°F and cut the sweet potato into wedges.',
      'Toss the vegetables with olive oil, herbs, lemon juice, and black pepper.',
      'Nestle the chicken into the tray and roast for 25–30 minutes.',
      'Rest the chicken for 5 minutes before slicing and serving.',
    ],
  },
  {
    id: 'ginger-chicken-rice-bowl',
    category: 'plan',
    title: 'Ginger chicken rice bowl',
    description: 'A balanced bowl with tender chicken, greens, and a bright ginger dressing.',
    image:
      'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1200&q=85',
    prepTime: '30 min',
    servings: 2,
    nutrition: { calories: 520, protein: 38, fiber: 7, carbs: 56 },
    ingredients: [
      { id: 'chicken-thigh', name: 'Boneless chicken thighs', amount: 2, unit: 'pieces', calories: 300, protein: 36, fiber: 0 },
      { id: 'brown-rice', name: 'Cooked brown rice', amount: 1.5, unit: 'cups', calories: 325, protein: 7, fiber: 5 },
      { id: 'pak-choi', name: 'Pak choi', amount: 2, unit: 'heads', calories: 25, protein: 3, fiber: 2 },
      { id: 'ginger', name: 'Fresh ginger', amount: 1, unit: 'tbsp', calories: 5, protein: 0, fiber: 0 },
      { id: 'sesame-oil', name: 'Toasted sesame oil', amount: 2, unit: 'tsp', calories: 80, protein: 0, fiber: 0 },
      { id: 'lime', name: 'Lime', amount: 1, unit: 'whole', calories: 20, protein: 1, fiber: 1 },
    ],
    instructions: [
      'Cook the chicken in a covered skillet over medium heat until golden and cooked through.',
      'Steam or sauté the pak choi until tender but still bright.',
      'Whisk grated ginger, lime juice, sesame oil, and a splash of warm water.',
      'Slice the chicken and serve over brown rice with the greens and ginger dressing.',
    ],
  },
  {
    id: 'gentle-chickpea-curry',
    category: 'plan',
    title: 'Gentle chickpea curry',
    description: 'Creamy chickpeas, spinach, and warming spices in an easy one-pan meal.',
    image:
      'https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?auto=format&fit=crop&w=1200&q=85',
    prepTime: '25 min',
    servings: 4,
    nutrition: { calories: 430, protein: 17, fiber: 14, carbs: 55 },
    ingredients: [
      { id: 'chickpeas', name: 'Chickpeas', amount: 2, unit: 'cans', calories: 520, protein: 28, fiber: 24 },
      { id: 'coconut-milk', name: 'Light coconut milk', amount: 1, unit: 'can', calories: 280, protein: 3, fiber: 0 },
      { id: 'spinach', name: 'Baby spinach', amount: 3, unit: 'cups', calories: 21, protein: 3, fiber: 2 },
      { id: 'tomatoes', name: 'Chopped tomatoes', amount: 1, unit: 'can', calories: 90, protein: 4, fiber: 5 },
      { id: 'turmeric', name: 'Ground turmeric', amount: 1, unit: 'tsp', calories: 8, protein: 0, fiber: 1 },
      { id: 'brown-rice', name: 'Cooked brown rice', amount: 2, unit: 'cups', calories: 430, protein: 10, fiber: 7 },
    ],
    instructions: [
      'Warm a little olive oil in a deep skillet and bloom turmeric, cumin, and mild curry powder for 30 seconds.',
      'Add tomatoes, coconut milk, and rinsed chickpeas, then simmer gently for 15 minutes.',
      'Fold in the spinach and cook just until wilted.',
      'Serve with warm brown rice and a squeeze of lime if desired.',
    ],
  },
  {
    id: 'mediterranean-quinoa-plate',
    category: 'plan',
    title: 'Mediterranean quinoa plate',
    description: 'A colourful make-ahead plate with quinoa, roasted vegetables, and lemon tahini.',
    image:
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=85',
    prepTime: '35 min',
    servings: 3,
    nutrition: { calories: 465, protein: 16, fiber: 12, carbs: 52 },
    ingredients: [
      { id: 'quinoa', name: 'Cooked quinoa', amount: 2, unit: 'cups', calories: 440, protein: 16, fiber: 10 },
      { id: 'chickpeas', name: 'Chickpeas', amount: 1, unit: 'can', calories: 260, protein: 14, fiber: 12 },
      { id: 'red-pepper', name: 'Red bell pepper', amount: 2, unit: 'whole', calories: 75, protein: 3, fiber: 5 },
      { id: 'courgette', name: 'Courgette', amount: 2, unit: 'medium', calories: 65, protein: 5, fiber: 4 },
      { id: 'tahini', name: 'Tahini', amount: 3, unit: 'tbsp', calories: 270, protein: 8, fiber: 4 },
      { id: 'lemon', name: 'Lemon', amount: 1, unit: 'whole', calories: 17, protein: 1, fiber: 2 },
    ],
    instructions: [
      'Heat the oven to 210°C / 410°F and roast sliced peppers and courgettes for 20–25 minutes.',
      'Rinse the chickpeas and season them with oregano and black pepper.',
      'Whisk tahini with lemon juice and enough warm water to make a pourable dressing.',
      'Divide quinoa, vegetables, and chickpeas between plates and finish with lemon tahini.',
    ],
  },
  {
    id: 'white-bean-herb-stew',
    category: 'plan',
    title: 'White bean herb stew',
    description: 'Soft white beans and vegetables in a soothing, freezer-friendly broth.',
    image:
      'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=1200&q=85',
    prepTime: '35 min',
    servings: 4,
    nutrition: { calories: 355, protein: 18, fiber: 15, carbs: 52 },
    ingredients: [
      { id: 'white-beans', name: 'Cannellini beans', amount: 2, unit: 'cans', calories: 500, protein: 32, fiber: 24 },
      { id: 'carrot', name: 'Carrots', amount: 3, unit: 'medium', calories: 75, protein: 2, fiber: 6 },
      { id: 'celery', name: 'Celery stalks', amount: 3, unit: 'stalks', calories: 20, protein: 1, fiber: 2 },
      { id: 'kale', name: 'Chopped kale', amount: 3, unit: 'cups', calories: 100, protein: 7, fiber: 6 },
      { id: 'stock', name: 'Low-sodium vegetable stock', amount: 4, unit: 'cups', calories: 40, protein: 2, fiber: 1 },
      { id: 'herbs', name: 'Fresh rosemary and parsley', amount: 2, unit: 'tbsp', calories: 5, protein: 0, fiber: 1 },
    ],
    instructions: [
      'Soften chopped carrots and celery in olive oil over medium-low heat.',
      'Add drained beans, stock, rosemary, and black pepper, then simmer for 20 minutes.',
      'Mash a small spoonful of beans against the side of the pot to thicken the broth.',
      'Stir in kale until tender and finish with parsley and lemon juice.',
    ],
  },
  {
    id: 'turkey-sweet-potato-skillet',
    category: 'plan',
    title: 'Turkey sweet potato skillet',
    description: 'A protein-rich one-pan dinner with sweet potato, greens, and gentle spices.',
    image:
      'https://images.unsplash.com/photo-1539136788836-5699e78bfc75?auto=format&fit=crop&w=1200&q=85',
    prepTime: '30 min',
    servings: 4,
    nutrition: { calories: 425, protein: 34, fiber: 9, carbs: 38 },
    ingredients: [
      { id: 'turkey', name: 'Lean ground turkey', amount: 500, unit: 'g', calories: 750, protein: 105, fiber: 0 },
      { id: 'sweet-potato', name: 'Sweet potato', amount: 2, unit: 'medium', calories: 180, protein: 4, fiber: 8 },
      { id: 'red-pepper', name: 'Red bell pepper', amount: 1, unit: 'whole', calories: 37, protein: 1, fiber: 2 },
      { id: 'spinach', name: 'Baby spinach', amount: 3, unit: 'cups', calories: 21, protein: 3, fiber: 2 },
      { id: 'avocado', name: 'Avocado', amount: 1, unit: 'whole', calories: 240, protein: 3, fiber: 10 },
      { id: 'smoked-paprika', name: 'Smoked paprika', amount: 1, unit: 'tsp', calories: 6, protein: 0, fiber: 1 },
    ],
    instructions: [
      'Dice the sweet potato into small cubes and cook in a covered skillet with a splash of water for 8 minutes.',
      'Add the turkey and paprika, breaking the meat into small pieces as it browns.',
      'Stir in sliced pepper and cook until the turkey is done and the vegetables are tender.',
      'Fold in spinach and serve with sliced avocado.',
    ],
  },
  {
    id: 'sesame-tofu-vegetable-bowl',
    category: 'plan',
    title: 'Sesame tofu vegetable bowl',
    description: 'Crisp-edged tofu and colourful vegetables with a simple sesame-lime finish.',
    image:
      'https://images.unsplash.com/photo-1565299507177-b0ac66763828?auto=format&fit=crop&w=1200&q=85',
    prepTime: '30 min',
    servings: 2,
    nutrition: { calories: 495, protein: 24, fiber: 10, carbs: 48 },
    ingredients: [
      { id: 'tofu', name: 'Extra-firm tofu', amount: 400, unit: 'g', calories: 360, protein: 40, fiber: 4 },
      { id: 'brown-rice', name: 'Cooked brown rice', amount: 1.5, unit: 'cups', calories: 325, protein: 7, fiber: 5 },
      { id: 'broccoli', name: 'Broccoli florets', amount: 2, unit: 'cups', calories: 55, protein: 4, fiber: 5 },
      { id: 'red-cabbage', name: 'Shredded red cabbage', amount: 1, unit: 'cup', calories: 28, protein: 1, fiber: 2 },
      { id: 'sesame-oil', name: 'Toasted sesame oil', amount: 2, unit: 'tsp', calories: 80, protein: 0, fiber: 0 },
      { id: 'lime', name: 'Lime', amount: 1, unit: 'whole', calories: 20, protein: 1, fiber: 1 },
    ],
    instructions: [
      'Press the tofu dry, cut into cubes, and cook in a non-stick skillet until golden on several sides.',
      'Steam the broccoli and briefly sauté the cabbage so it stays colourful.',
      'Whisk sesame oil, lime juice, grated ginger, and a splash of water.',
      'Build the bowls with rice, vegetables, and tofu, then spoon over the dressing.',
    ],
  },
  {
    id: 'walnut-pesto-wholegrain-pasta',
    category: 'plan',
    title: 'Walnut pesto wholegrain pasta',
    description: 'A comforting whole-grain pasta with greens, walnuts, and a fresh herb sauce.',
    image:
      'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=1200&q=85',
    prepTime: '25 min',
    servings: 4,
    nutrition: { calories: 490, protein: 19, fiber: 11, carbs: 61 },
    ingredients: [
      { id: 'wholegrain-pasta', name: 'Whole-grain pasta', amount: 340, unit: 'g', calories: 1180, protein: 44, fiber: 24 },
      { id: 'walnuts', name: 'Walnuts', amount: 0.5, unit: 'cup', calories: 390, protein: 9, fiber: 4 },
      { id: 'basil', name: 'Fresh basil', amount: 2, unit: 'cups', calories: 12, protein: 2, fiber: 2 },
      { id: 'spinach', name: 'Baby spinach', amount: 3, unit: 'cups', calories: 21, protein: 3, fiber: 2 },
      { id: 'peas', name: 'Frozen peas', amount: 1, unit: 'cup', calories: 120, protein: 8, fiber: 7 },
      { id: 'lemon', name: 'Lemon', amount: 1, unit: 'whole', calories: 17, protein: 1, fiber: 2 },
    ],
    instructions: [
      'Cook the pasta until just tender, adding the peas for the final 2 minutes.',
      'Blend basil, walnuts, lemon juice, olive oil, and a few spoonfuls of pasta water.',
      'Drain the pasta and peas, reserving a little more cooking water.',
      'Toss with the walnut pesto and spinach, loosening with pasta water until glossy.',
    ],
  },
  {
    id: 'berry-chia-smoothie',
    category: 'smoothie',
    title: 'Berry chia smoothie',
    description: 'Bright berries, creamy yoghurt, and fibre for a steady start.',
    image:
      'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=1200&q=85',
    prepTime: '5 min',
    servings: 1,
    nutrition: { calories: 310, protein: 17, fiber: 10, carbs: 42 },
    ingredients: [
      { id: 'berries', name: 'Frozen mixed berries', amount: 1, unit: 'cup', calories: 80, protein: 1, fiber: 7 },
      { id: 'yoghurt', name: 'Plain Greek yoghurt', amount: 0.75, unit: 'cup', calories: 110, protein: 15, fiber: 0 },
      { id: 'chia', name: 'Chia seeds', amount: 1, unit: 'tbsp', calories: 60, protein: 2, fiber: 5 },
      { id: 'oat-milk', name: 'Unsweetened oat milk', amount: 0.5, unit: 'cup', calories: 60, protein: 2, fiber: 1 },
    ],
    instructions: [
      'Add the oat milk to a blender first, followed by yoghurt, berries, and chia.',
      'Blend until silky smooth, adding a splash more milk if needed.',
      'Let stand for 2 minutes so the chia can gently thicken the smoothie.',
      'Pour into a glass and enjoy right away.',
    ],
  },
  {
    id: 'green-ginger-smoothie',
    category: 'smoothie',
    title: 'Green ginger smoothie',
    description: 'A fresh, mineral-rich blend with a gentle ginger lift.',
    image:
      'https://images.unsplash.com/photo-1610970881699-44a5587cabec?auto=format&fit=crop&w=1200&q=85',
    prepTime: '7 min',
    servings: 1,
    nutrition: { calories: 250, protein: 8, fiber: 8, carbs: 39 },
    ingredients: [
      { id: 'spinach-smoothie', name: 'Baby spinach', amount: 2, unit: 'cups', calories: 14, protein: 2, fiber: 2 },
      { id: 'banana', name: 'Ripe banana', amount: 1, unit: 'small', calories: 90, protein: 1, fiber: 3 },
      { id: 'kiwi', name: 'Kiwi', amount: 1, unit: 'whole', calories: 45, protein: 1, fiber: 2 },
      { id: 'ginger-smoothie', name: 'Fresh ginger', amount: 1, unit: 'tsp', calories: 2, protein: 0, fiber: 0 },
      { id: 'coconut-water', name: 'Coconut water', amount: 1, unit: 'cup', calories: 45, protein: 2, fiber: 1 },
    ],
    instructions: [
      'Wash the spinach and peel the kiwi and banana.',
      'Blend coconut water, ginger, fruit, and spinach until completely smooth.',
      'Taste and add a squeeze of lime if you enjoy extra brightness.',
      'Serve chilled, or blend with a few ice cubes for a thicker texture.',
    ],
  },
  {
    id: 'mango-turmeric-smoothie',
    category: 'smoothie',
    title: 'Mango turmeric smoothie',
    description: 'Golden mango balanced with turmeric, lime, and creamy kefir.',
    image:
      'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=1200&q=85',
    prepTime: '5 min',
    servings: 1,
    nutrition: { calories: 285, protein: 12, fiber: 6, carbs: 46 },
    ingredients: [
      { id: 'mango', name: 'Frozen mango', amount: 1, unit: 'cup', calories: 100, protein: 1, fiber: 3 },
      { id: 'kefir', name: 'Plain kefir', amount: 0.75, unit: 'cup', calories: 100, protein: 10, fiber: 0 },
      { id: 'turmeric-smoothie', name: 'Ground turmeric', amount: 0.5, unit: 'tsp', calories: 4, protein: 0, fiber: 1 },
      { id: 'lime', name: 'Lime juice', amount: 1, unit: 'tbsp', calories: 4, protein: 0, fiber: 0 },
    ],
    instructions: [
      'Add kefir, mango, turmeric, lime, and a pinch of black pepper to a blender.',
      'Blend until smooth and creamy.',
      'Add a little water if the texture is too thick.',
      'Pour into a chilled glass and serve immediately.',
    ],
  },
  {
    id: 'peach-oat-smoothie',
    category: 'smoothie',
    title: 'Peach oat smoothie',
    description: 'Creamy peach, oats, and yoghurt for a soft, steady-energy breakfast.',
    image:
      'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?auto=format&fit=crop&w=1200&q=85',
    prepTime: '6 min',
    servings: 1,
    nutrition: { calories: 340, protein: 18, fiber: 8, carbs: 50 },
    ingredients: [
      { id: 'peaches', name: 'Frozen peach slices', amount: 1, unit: 'cup', calories: 65, protein: 1, fiber: 3 },
      { id: 'yoghurt', name: 'Plain Greek yoghurt', amount: 0.75, unit: 'cup', calories: 110, protein: 15, fiber: 0 },
      { id: 'rolled-oats', name: 'Rolled oats', amount: 0.25, unit: 'cup', calories: 75, protein: 3, fiber: 2 },
      { id: 'flaxseed', name: 'Ground flaxseed', amount: 1, unit: 'tbsp', calories: 55, protein: 2, fiber: 3 },
      { id: 'oat-milk', name: 'Unsweetened oat milk', amount: 0.5, unit: 'cup', calories: 60, protein: 2, fiber: 1 },
    ],
    instructions: [
      'Add oat milk, yoghurt, peaches, oats, and flaxseed to a blender.',
      'Blend until smooth and creamy.',
      'Let the smoothie rest for 1 minute so the oats can soften.',
      'Add a splash more milk if needed, then serve immediately.',
    ],
  },
  {
    id: 'pineapple-flax-smoothie',
    category: 'smoothie',
    title: 'Pineapple flax smoothie',
    description: 'A sunny pineapple blend with ginger, flax, and creamy banana.',
    image:
      'https://images.unsplash.com/photo-1577805947697-89e18249d767?auto=format&fit=crop&w=1200&q=85',
    prepTime: '5 min',
    servings: 1,
    nutrition: { calories: 295, protein: 6, fiber: 9, carbs: 52 },
    ingredients: [
      { id: 'pineapple', name: 'Frozen pineapple', amount: 1, unit: 'cup', calories: 82, protein: 1, fiber: 2 },
      { id: 'banana', name: 'Ripe banana', amount: 1, unit: 'small', calories: 90, protein: 1, fiber: 3 },
      { id: 'flaxseed', name: 'Ground flaxseed', amount: 1, unit: 'tbsp', calories: 55, protein: 2, fiber: 3 },
      { id: 'ginger-smoothie', name: 'Fresh ginger', amount: 1, unit: 'tsp', calories: 2, protein: 0, fiber: 0 },
      { id: 'coconut-water', name: 'Coconut water', amount: 1, unit: 'cup', calories: 45, protein: 2, fiber: 1 },
    ],
    instructions: [
      'Add coconut water to the blender, followed by pineapple, banana, flaxseed, and ginger.',
      'Blend until completely smooth.',
      'Taste and add a squeeze of lime for extra brightness if desired.',
      'Serve cold, with a few ice cubes blended in on warmer days.',
    ],
  },
  {
    id: 'cucumber-mint-tonic',
    category: 'drink',
    title: 'Cucumber mint tonic',
    description: 'A cooling, hydrating pour for warm afternoons or tired days.',
    image:
      'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=1200&q=85',
    prepTime: '8 min',
    servings: 2,
    nutrition: { calories: 42, protein: 1, fiber: 2, carbs: 10 },
    ingredients: [
      { id: 'cucumber', name: 'Cucumber', amount: 1, unit: 'medium', calories: 30, protein: 1, fiber: 1 },
      { id: 'mint', name: 'Fresh mint', amount: 0.25, unit: 'cup', calories: 4, protein: 0, fiber: 1 },
      { id: 'lime-drink', name: 'Lime', amount: 1, unit: 'whole', calories: 20, protein: 1, fiber: 1 },
      { id: 'sparkling-water', name: 'Sparkling water', amount: 2, unit: 'cups', calories: 0, protein: 0, fiber: 0 },
    ],
    instructions: [
      'Blend cucumber, mint, and the juice of half the lime with a splash of water.',
      'Strain into two glasses over ice, or keep the fibre in for a fuller drink.',
      'Top with sparkling water and garnish with mint.',
      'Finish with fresh lime slices and sip slowly.',
    ],
  },
  {
    id: 'golden-oat-latte',
    category: 'drink',
    title: 'Golden oat latte',
    description: 'A softly spiced, caffeine-free ritual with a little warmth.',
    image:
      'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1200&q=85',
    prepTime: '10 min',
    servings: 1,
    nutrition: { calories: 165, protein: 5, fiber: 3, carbs: 24 },
    ingredients: [
      { id: 'oat-latte', name: 'Unsweetened oat milk', amount: 1.25, unit: 'cups', calories: 120, protein: 4, fiber: 2 },
      { id: 'turmeric-latte', name: 'Ground turmeric', amount: 0.5, unit: 'tsp', calories: 4, protein: 0, fiber: 1 },
      { id: 'cinnamon', name: 'Ground cinnamon', amount: 0.25, unit: 'tsp', calories: 2, protein: 0, fiber: 0 },
      { id: 'maple', name: 'Maple syrup', amount: 1, unit: 'tsp', calories: 17, protein: 0, fiber: 0 },
    ],
    instructions: [
      'Warm the oat milk in a small saucepan over medium-low heat.',
      'Whisk in turmeric, cinnamon, black pepper, and maple syrup.',
      'Keep warming until steaming, but do not let the milk boil.',
      'Froth if you like, pour into a mug, and enjoy warm.',
    ],
  },
  {
    id: 'cherry-kefir-cooler',
    category: 'drink',
    title: 'Cherry kefir cooler',
    description: 'Tart cherries and cultured kefir for a refreshing gut-friendly sip.',
    image:
      'https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&w=1200&q=85',
    prepTime: '5 min',
    servings: 1,
    nutrition: { calories: 140, protein: 8, fiber: 4, carbs: 22 },
    ingredients: [
      { id: 'cherries', name: 'Pitted cherries', amount: 0.75, unit: 'cup', calories: 75, protein: 1, fiber: 3 },
      { id: 'kefir-cooler', name: 'Plain kefir', amount: 0.75, unit: 'cup', calories: 100, protein: 7, fiber: 0 },
      { id: 'lime-cooler', name: 'Lime juice', amount: 1, unit: 'tsp', calories: 2, protein: 0, fiber: 0 },
    ],
    instructions: [
      'Blend the cherries, kefir, and lime juice until smooth.',
      'Strain for a lighter drink, or keep the cherry fibre in.',
      'Pour over ice and add a splash of chilled water if desired.',
      'Garnish with a fresh cherry and drink immediately.',
    ],
  },
];

export function getMealById(id: string | string[] | undefined) {
  const mealId = Array.isArray(id) ? id[0] : id;
  return meals.find((meal) => meal.id === mealId);
}
