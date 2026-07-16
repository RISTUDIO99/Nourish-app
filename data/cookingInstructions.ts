export type CookingSteps = string[];

const instructions: Record<string, CookingSteps> = {

  // ─── GRASS-FED MEAT PLAN ───────────────────────────────────────────────────

  "meat-0-breakfast": [
    "Bring 1 cup rolled oats with 2 cups water or almond milk to a boil over medium heat.",
    "Stir in ½ tsp turmeric, ¼ tsp cinnamon, and a pinch of black pepper. Reduce heat and simmer 5 min, stirring often.",
    "Pour into a bowl and top with a small handful of walnuts and fresh or frozen blueberries.",
    "Drizzle with a little raw honey or maple syrup if desired. Serve warm.",
  ],
  "meat-0-lunch": [
    "Cook 4 oz thin-sliced grass-fed beef or ground beef in a hot skillet with olive oil for 3–4 min. Season with salt and pepper.",
    "Massage 2 cups roughly chopped kale with a pinch of salt for 1 min until slightly softened.",
    "Whisk 2 tbsp tahini, juice of 1 lemon, 1 minced garlic clove, and 2 tbsp water into a smooth dressing.",
    "Combine kale and beef in a bowl, drizzle with dressing, and top with cherry tomatoes or sliced avocado.",
  ],
  "meat-0-dinner": [
    "Mix 1 lb ground bison with 2 minced garlic cloves, 2 tbsp fresh parsley, salt, and pepper. Roll into golf-ball-sized balls.",
    "Bake meatballs on a lined baking sheet at 400°F (200°C) for 18–20 min until cooked through.",
    "Spiralize 2 zucchinis or peel into ribbons using a vegetable peeler. Sauté in olive oil for 2 min — don't overcook.",
    "Warm marinara in a pan. Plate zucchini noodles, top with meatballs and sauce, and finish with fresh basil.",
  ],
  "meat-0-snack": [
    "Cut 2–3 celery stalks into sticks.",
    "Serve alongside 2 tbsp natural almond butter for dipping.",
    "Brew 1 cup green tea using water at 175°F (not boiling) for 2–3 min to preserve antioxidants.",
    "Let tea cool slightly before drinking. Enjoy alongside the celery and almond butter.",
  ],

  "meat-1-breakfast": [
    "Add 1 cup frozen mixed berries, 1 cup unsweetened almond milk, and 1 tsp freshly grated ginger to a blender.",
    "Add 1 tbsp ground flaxseed and a small handful of ice.",
    "Blend on high for 30–45 seconds until completely smooth.",
    "Pour into a glass and drink immediately for the best nutrient content.",
  ],
  "meat-1-lunch": [
    "Cube 1 medium sweet potato, toss with olive oil, salt, cumin, and black pepper. Roast at 400°F for 25 min, flipping halfway.",
    "Gently reheat leftover bison meatballs in a small pan with a splash of water or bone broth.",
    "Layer roasted sweet potato, bison, and a handful of leafy greens in a wide bowl.",
    "Drizzle with tahini or extra virgin olive oil. Season with black pepper and a squeeze of lemon.",
  ],
  "meat-1-dinner": [
    "Whisk 2 tbsp low-sodium tamari, 1 tbsp sesame oil, 1 tsp fresh grated ginger, and 1 minced garlic clove for sauce.",
    "Slice sirloin thinly against the grain. Sear in a very hot pan with avocado oil for 2–3 min until just cooked.",
    "Add halved bok choy to the pan and stir-fry 2–3 min until slightly wilted but still crisp.",
    "Pour sauce over everything, toss to coat, and serve over a bed of cooked brown rice.",
  ],
  "meat-1-snack": [
    "Measure 1 oz (about 14 walnut halves) of raw walnuts.",
    "Pour 8 oz unsweetened tart cherry juice into a glass.",
    "No cooking needed — enjoy together as a powerful anti-inflammatory combo.",
    "Best consumed mid-afternoon. Walnuts provide omega-3 ALA; cherry juice reduces uric acid and CRP.",
  ],

  "meat-2-breakfast": [
    "Toast a thick slice of good-quality sourdough bread until golden.",
    "Halve a ripe avocado, scoop out and mash slightly with a fork. Season with salt and a squeeze of lemon.",
    "Spread avocado generously on toast. Sprinkle with hemp seeds and layer thin slices of tomato on top.",
    "Finish with a crack of black pepper and optional red pepper flakes. Serve open-faced.",
  ],
  "meat-2-lunch": [
    "Sauté diced onion and garlic in olive oil over medium heat for 3 min. Add 1 can chickpeas (drained).",
    "Add 1 tsp turmeric, cumin, and 4 cups bone broth or water. Bring to a boil, then simmer 10 min.",
    "Stir in 2 cups chopped spinach and 4 oz diced lamb (cooked or pre-cooked). Cook 3 more min.",
    "Season with salt, pepper, and a squeeze of lemon. Serve with sourdough or on its own.",
  ],
  "meat-2-dinner": [
    "Preheat oven to 425°F. Chop broccoli into florets and spread on a baking sheet with garlic cloves.",
    "Drizzle generously with olive oil, salt, and pepper. Roast 20–22 min until edges are crispy.",
    "Season grass-fed ground beef patties or strips with salt, pepper, and garlic powder.",
    "Cook beef in a hot skillet 4–5 min per side. Serve over the roasted broccoli drizzled with olive oil.",
  ],
  "meat-2-snack": [
    "Slice 1 medium apple into wedges. Remove the core.",
    "Serve with 2 tbsp cashew butter on the side for dipping.",
    "No cooking required — apple provides fiber and antioxidants; cashew butter adds magnesium and zinc.",
    "A great pre-dinner snack to keep blood sugar stable.",
  ],

  "meat-3-breakfast": [
    "The night before: combine ½ cup oats, 1 tbsp chia seeds, ½ cup almond milk, and a pinch of cinnamon. Mix and refrigerate overnight.",
    "In the morning, stir well and add a splash more almond milk if too thick.",
    "Top with fresh or thawed raspberries and a few blueberries.",
    "Sprinkle with additional cinnamon and a drizzle of honey if desired. Eat cold or warm briefly in the microwave.",
  ],
  "meat-3-lunch": [
    "Cook 4 oz ground bison in a pan over medium heat with garlic, cumin, and salt. Let cool slightly.",
    "Separate large butter or romaine lettuce leaves to use as wraps.",
    "Mash half an avocado with lime juice and salt. Slice cucumber into thin rounds.",
    "Fill lettuce cups with bison, avocado mash, and cucumber. Add a dash of hot sauce or cilantro if desired.",
  ],
  "meat-3-dinner": [
    "Season lamb chops with rosemary, garlic, salt, and pepper. Let rest 15 min at room temperature.",
    "Snap off woody asparagus ends. Toss with olive oil, salt, and pepper. Roast at 400°F for 12 min.",
    "Cook quinoa in 2:1 water ratio, bring to boil then simmer 15 min. Fluff with a fork and add lemon zest.",
    "Sear lamb chops in a hot cast iron pan 3–4 min per side for medium. Rest 5 min before serving.",
  ],
  "meat-3-snack": [
    "Mix 1 oz each of walnuts, almonds, and pecans in a small bowl.",
    "No cooking needed — these provide a powerful combination of omega-3, vitamin E, and antioxidants.",
    "Best eaten between meals rather than right before or after to maximize satiety and blood sugar stability.",
    "Store remaining nuts in an airtight jar. Pre-portion daily amounts to avoid overeating.",
  ],

  "meat-4-breakfast": [
    "Crack 2–3 eggs into a bowl and whisk with a pinch of salt and ½ tsp turmeric.",
    "Sauté a large handful of spinach in olive oil with 1 minced garlic clove over medium heat for 2 min.",
    "Pour eggs over the spinach and scramble gently with a spatula until just set — don't overcook.",
    "Serve immediately. The turmeric gives the eggs a beautiful golden color and anti-inflammatory boost.",
  ],
  "meat-4-lunch": [
    "Sauté onion, garlic, and 1 tsp each ginger and turmeric in olive oil over medium heat for 3 min.",
    "Add 4 oz grass-fed ground beef and cook through, breaking it up. Add ½ cup red lentils and 3 cups water.",
    "Bring to a boil, then simmer 20 min until lentils are soft and stew has thickened.",
    "Season with salt, pepper, and a squeeze of lemon. Top with fresh cilantro or parsley.",
  ],
  "meat-4-dinner": [
    "Make a curry base: sauté onion, garlic, and ginger in coconut oil for 3 min. Add 2 tbsp curry powder and turmeric.",
    "Add diced lamb (12 oz) and brown for 4–5 min. Pour in 1 can coconut milk and ½ cup water.",
    "Simmer covered for 25 min until lamb is tender. Add spinach in the last 3 min.",
    "Serve over brown rice. Top with fresh cilantro and a dollop of plain yogurt if tolerated.",
  ],
  "meat-4-snack": [
    "Brew a strong cup of fresh ginger tea: steep 5 thin slices of fresh ginger in boiling water for 5 min.",
    "Add a squeeze of lemon and a small drizzle of raw honey.",
    "Rinse a handful of fresh blueberries and serve alongside.",
    "Sip the tea slowly — the gingerols are most active when it's warm.",
  ],

  "meat-5-breakfast": [
    "Blend an açaí packet (thawed) with a splash of almond milk until smooth as a base.",
    "Pour into a bowl — it should be thick enough that a spoon stands up.",
    "Top with hemp seeds, a small handful of granola, sliced banana, and any berries you have.",
    "Eat immediately before it melts. Add a drizzle of almond butter for extra anti-inflammatory fat.",
  ],
  "meat-5-lunch": [
    "Gently reheat the leftover lamb curry with a splash of water or broth to loosen it.",
    "Warm a piece of naan bread in a dry skillet or directly over a gas flame for 30 seconds per side.",
    "Mix diced cucumber, plain yogurt, a pinch of cumin, and fresh mint for a quick raita.",
    "Plate curry alongside warm naan and raita. Sprinkle fresh cilantro on top.",
  ],
  "meat-5-dinner": [
    "Season a grass-fed beef patty generously with salt, pepper, and garlic powder. Cook in a hot skillet 4–5 min per side.",
    "Trim and halve Brussels sprouts. Toss with olive oil, salt, and balsamic vinegar. Roast at 425°F for 22 min until caramelized.",
    "Let the burger rest 3 min. Skip the bun — serve in large lettuce wraps (butter lettuce works great).",
    "Add sliced avocado, tomato, and mustard to the lettuce wrap. Serve with Brussels sprouts on the side.",
  ],
  "meat-5-snack": [
    "Drain and rinse a can of chickpeas or use store-bought hummus.",
    "Cut cucumber and carrot into sticks. Arrange on a small plate with the hummus.",
    "No cooking needed — serve as-is. Chickpeas provide plant protein and fiber to support gut health.",
    "Pair with water or a cup of herbal tea for an anti-inflammatory afternoon snack.",
  ],

  "meat-6-breakfast": [
    "Cook ½ cup quinoa in 1 cup water: bring to boil, cover, simmer 15 min. Fluff and let cool slightly.",
    "Stir in a pinch of cinnamon, a splash of almond milk, and a drizzle of maple syrup to make it porridge-like.",
    "Fold in roughly chopped pecans and sliced banana while still warm.",
    "Serve in a bowl. Quinoa is a complete protein, making this a powerful anti-inflammatory breakfast.",
  ],
  "meat-6-lunch": [
    "Sear a thin grass-fed steak (flank or skirt) in a hot pan with olive oil, 2–3 min per side for medium-rare. Rest 5 min, then slice thinly.",
    "Toss arugula with extra virgin olive oil, lemon juice, salt, and pepper.",
    "Halve cherry tomatoes and roughly chop walnuts.",
    "Layer arugula with steak slices, cherry tomatoes, and walnuts. Top with shaved Parmesan if desired.",
  ],
  "meat-6-dinner": [
    "In a Dutch oven or slow cooker, brown 1 lb grass-fed beef chunks in olive oil with onion and garlic.",
    "Add diced carrots, parsnip, sweet potato, 2 cups bone broth, and a sprig of fresh rosemary.",
    "Cover and cook on low heat for 2.5–3 hours (or slow cooker on low 6–8 hours) until beef is tender.",
    "Taste and adjust seasoning. Serve in deep bowls with sourdough bread for dipping into the broth.",
  ],
  "meat-6-snack": [
    "Warm 1 cup unsweetened almond or oat milk over medium-low heat — don't boil.",
    "Whisk in ½ tsp turmeric, ¼ tsp ginger, a pinch of black pepper (crucial for curcumin absorption), and a little honey.",
    "Pour into a mug — this is your golden turmeric milk.",
    "Enjoy alongside a small handful of pumpkin seeds for zinc and magnesium.",
  ],

  // ─── CHICKEN & POULTRY PLAN ───────────────────────────────────────────────

  "chicken-0-breakfast": [
    "Warm 2 cups good-quality bone broth in a small pot. Add 1 tsp freshly grated ginger and heat gently 3 min.",
    "While broth warms, cook oatmeal: 1 cup oats with 2 cups almond milk, simmered 5 min.",
    "Drink the ginger broth first as a gut-warming starter — it stimulates digestion beautifully.",
    "Top oatmeal with fresh or frozen blueberries and a drizzle of honey. Sprinkle hemp seeds for protein.",
  ],
  "chicken-0-lunch": [
    "Season a chicken breast with lemon zest, garlic, olive oil, salt, and pepper. Grill or pan-cook 5–6 min per side until cooked through.",
    "Let chicken rest 5 min, then slice thinly.",
    "Halve a ripe avocado and mash one half with lemon juice and salt. Slice the other half.",
    "Layer mixed greens with chicken slices and avocado. Dress with lemon juice, olive oil, fresh herbs, and black pepper.",
  ],
  "chicken-0-dinner": [
    "Make a turmeric marinade: mix olive oil, 1 tsp turmeric, 1 tsp garlic powder, cumin, salt, and pepper.",
    "Coat chicken thighs in the marinade. Roast at 425°F for 35–40 min, skin-up, until internal temp hits 165°F.",
    "Meanwhile, cut cauliflower into florets and roast on a separate pan with olive oil and salt at 425°F for 25 min.",
    "Cook quinoa per package instructions. Plate with cauliflower and chicken thighs. Spoon the pan juices over everything.",
  ],
  "chicken-0-snack": [
    "Pour 8 oz unsweetened tart cherry juice into a glass — this one's a powerhouse for inflammation.",
    "Measure out 1 oz of raw walnuts (about 14 halves).",
    "No preparation needed — just serve together.",
    "The anthocyanins in tart cherry juice and the ALA omega-3 in walnuts work synergistically to reduce CRP levels.",
  ],

  "chicken-1-breakfast": [
    "Add 1 cup almond milk, 1 cup fresh spinach, 1 inch fresh ginger, ½ banana, and 1 tbsp flaxseed to a blender.",
    "Blend on high 45 seconds until completely smooth and bright green.",
    "Taste — if too tart, add a few drops of honey. If too thick, add a splash more milk.",
    "Pour into a glass and drink immediately — smoothies lose nutrients quickly after blending.",
  ],
  "chicken-1-lunch": [
    "Bring 4 cups bone broth to a gentle simmer. Add diced carrot, celery, and 1 tsp turmeric.",
    "Add 1 cup diced cooked turkey or chicken. Simmer 10 min.",
    "Add diced sweet potato and cook another 8–10 min until soft.",
    "Season with salt, pepper, and fresh ginger. Ladle into bowls and top with fresh herbs.",
  ],
  "chicken-1-dinner": [
    "Make a ginger-sesame dressing: whisk 2 tbsp sesame oil, 1 tbsp rice vinegar, 1 tsp ginger, 1 tsp tamari.",
    "Bring a pot of water to a boil. Poach 2 chicken breasts over medium-low heat for 15 min until just cooked.",
    "Slice chicken across the grain. Arrange bok choy (halved lengthwise and lightly steamed) alongside.",
    "Drizzle everything with the ginger-sesame dressing. Sprinkle sesame seeds on top to serve.",
  ],
  "chicken-1-snack": [
    "Wash and cut 3–4 celery stalks into sticks.",
    "Spoon 2 tbsp natural almond butter into a small dish.",
    "No cooking needed — serve as-is.",
    "Celery provides anti-inflammatory luteolin and quercetin; almond butter delivers vitamin E and magnesium.",
  ],

  "chicken-2-breakfast": [
    "The night before: stir together ½ cup chia seeds with 1.5 cups coconut milk. Refrigerate overnight.",
    "In the morning the pudding should be thick — stir well and add a splash of milk if too dense.",
    "Cube fresh mango or thaw frozen mango. Layer over the pudding.",
    "Top with toasted coconut flakes and a squeeze of lime. This is a complete, satisfying breakfast.",
  ],
  "chicken-2-lunch": [
    "Brush chicken breast with olive oil, salt, and black pepper. Grill or cook in a grill pan 5–6 min per side.",
    "Slice cooked beets (from a vacuum-sealed pack or roasted fresh) and arrange on a plate of arugula.",
    "Slice rested chicken and layer over the beet-arugula base.",
    "Make citrus vinaigrette: orange juice, olive oil, Dijon mustard, salt. Drizzle over the salad and serve.",
  ],
  "chicken-2-dinner": [
    "Make turmeric-ginger sauce: mix 2 tbsp tamari, 1 tsp each turmeric and ginger, 1 tsp honey, and 1 minced garlic clove.",
    "Slice 2 chicken breasts thin. Cook in a wok or large pan with avocado oil over high heat for 4 min.",
    "Add broccoli florets and snap peas to the pan. Stir-fry 3–4 min until crisp-tender.",
    "Pour sauce over everything and toss. Serve immediately over cooked brown rice.",
  ],
  "chicken-2-snack": [
    "Core and slice 1 medium apple into thin wedges.",
    "Serve with 2 tbsp walnut butter or almond butter for dipping.",
    "Brew a cup of green tea with water at 175°F for 3 min.",
    "A perfect afternoon combo — apple fiber, healthy fat from walnut butter, and EGCG from green tea.",
  ],

  "chicken-3-breakfast": [
    "Crack 3 eggs into a bowl and whisk with a pinch of salt.",
    "In a non-stick pan, sauté 2 minced garlic cloves and a large handful of spinach in olive oil for 1–2 min.",
    "Reduce heat to low, add eggs, and scramble slowly with a spatula until soft and just set.",
    "Plate immediately — don't overcook. Top with a crack of black pepper and fresh herbs.",
  ],
  "chicken-3-lunch": [
    "Cook 4 oz ground turkey in a pan over medium heat with garlic, cumin, lime juice, salt, and pepper. Break up as it cooks.",
    "Halve an avocado, remove pit, and slice. Slice cucumber into rounds.",
    "Wash and dry large butter lettuce leaves to use as cups.",
    "Fill lettuce cups with seasoned turkey, avocado slices, and cucumber. Add a drizzle of lime juice and hot sauce.",
  ],
  "chicken-3-dinner": [
    "Pat a whole chicken dry and rub inside and out with olive oil, garlic, lemon zest, rosemary, salt, and pepper.",
    "Cube sweet potatoes and asparagus; toss with olive oil and salt. Arrange around the chicken in a roasting pan.",
    "Roast at 425°F for 1 hour–1 hr 15 min until the thigh reaches 165°F internally. Let rest 10 min before carving.",
    "Spoon pan juices over everything before serving — this is a full one-pan Sunday-style dinner.",
  ],
  "chicken-3-snack": [
    "Measure out 2 tbsp raw pumpkin seeds and 2 tbsp dried tart cherries.",
    "Mix together in a small bowl — no preparation needed.",
    "The pumpkin seeds deliver zinc and magnesium; the tart cherries provide anthocyanins to reduce joint pain.",
    "Pair with water or herbal tea to help flush inflammatory compounds.",
  ],

  "chicken-4-breakfast": [
    "Warm 1 cup unsweetened almond or oat milk in a small saucepan. Whisk in ½ tsp turmeric, a pinch of ginger, and black pepper.",
    "Pour into a mug with a little honey — this is your golden milk latte.",
    "Toast sourdough until golden. Mash half an avocado with salt, lemon, and hemp seeds.",
    "Serve the latte alongside the avocado toast. A powerful anti-inflammatory breakfast combination.",
  ],
  "chicken-4-lunch": [
    "Bring 4 cups bone broth to a simmer. Add 1 can white beans (drained) and 2 cups chopped kale.",
    "Add diced cooked turkey (or raw turkey mince cooked for 5 min in the broth).",
    "Stir in fresh thyme, salt, and black pepper. Simmer 10 min.",
    "Ladle into bowls and finish with a drizzle of olive oil and squeeze of lemon.",
  ],
  "chicken-4-dinner": [
    "Season 4–6 bone-in chicken thighs with salt, pepper, and smoked paprika.",
    "Sear skin-side down in olive oil in an oven-safe pan over medium-high heat for 5 min until golden.",
    "Add 1 can crushed tomatoes, 1 cup olives, fresh thyme, and rosemary to the pan.",
    "Transfer to oven and roast at 375°F for 30 min until chicken is cooked through and sauce is thickened.",
  ],
  "chicken-4-snack": [
    "Brew a cup of green tea with water just below boiling — steep 3 min.",
    "Rinse a handful of mixed berries (blueberries, raspberries, strawberries).",
    "No cooking needed — enjoy together.",
    "Green tea EGCG and berry anthocyanins are a synergistic anti-inflammatory pairing.",
  ],

  "chicken-5-breakfast": [
    "Blend an açaí packet with a small splash of almond milk until smooth. Pour into a bowl — keep it thick.",
    "Top with hemp seeds, a small handful of granola, halved strawberries, and a few sliced almonds.",
    "Drizzle with a little honey or peanut butter on top if desired.",
    "Eat immediately before the bowl melts. A nutrient-dense start to the day.",
  ],
  "chicken-5-lunch": [
    "Use leftover roasted chicken from previous meals. Shred or slice the meat.",
    "Roast any vegetables you have (sweet potato, broccoli, zucchini) at 400°F with olive oil for 20 min.",
    "Cook a grain (quinoa, brown rice, or farro) according to package directions.",
    "Assemble in a bowl: grain base, roasted vegetables, and chicken. Drizzle with tahini-lemon dressing or olive oil.",
  ],
  "chicken-5-dinner": [
    "Combine 1 lb ground turkey with egg, garlic, parsley, salt, and pepper. Roll into balls.",
    "Bake at 400°F for 18 min until cooked through.",
    "Spiralize or peel 2–3 zucchinis into noodles. Sauté briefly in olive oil for 2 min — barely cook them.",
    "Warm a simple tomato sauce with olive oil and garlic. Plate noodles, top with meatballs and sauce, and fresh basil.",
  ],
  "chicken-5-snack": [
    "Scoop 3 tbsp hummus into a small bowl.",
    "Cut cucumber, bell pepper strips, and carrot into dipping sticks.",
    "No cooking needed — arrange around the hummus and serve.",
    "Chickpeas in hummus provide plant protein and prebiotic fiber that feeds anti-inflammatory gut bacteria.",
  ],

  "chicken-6-breakfast": [
    "Sauté 1 cup sliced mushrooms in olive oil over medium-high heat for 5 min until golden. Set aside.",
    "Whisk 3 eggs with a pinch of turmeric, salt, and pepper.",
    "Add 1 cup fresh spinach to the pan; wilt for 1 min. Pour eggs over and cook without stirring until edges are set.",
    "Fold the omelet in half. Slide onto a plate with the mushrooms. Top with fresh herbs.",
  ],
  "chicken-6-lunch": [
    "Bring 4 cups quality chicken bone broth to a simmer. Add a splash of soy sauce or tamari.",
    "Add ramen noodles (or rice noodles) and cook per package. Add halved bok choy in the last 2 min.",
    "Soft boil 1 egg: simmer in water 7 min, then transfer to ice water for 2 min. Peel and halve.",
    "Ladle broth and noodles into a deep bowl. Top with bok choy, the soft egg, and sesame seeds.",
  ],
  "chicken-6-dinner": [
    "Pat a whole turkey breast dry and rub with olive oil, rosemary, garlic, salt, and pepper.",
    "Cube root vegetables (parsnips, carrots, sweet potato) and toss with olive oil and thyme. Arrange in a roasting pan.",
    "Place turkey breast on top of vegetables. Roast at 375°F for 1 hr 20 min until internal temp reaches 165°F.",
    "Rest 10 min before slicing. Serve with pan-roasted vegetables and a simple pan sauce made from the drippings.",
  ],
  "chicken-6-snack": [
    "Steep 1 tsp fresh grated ginger and a slice of lemon in boiling water for 5 min.",
    "Strain into a mug and sweeten with a small drizzle of raw honey.",
    "Measure 1 oz raw almonds to serve alongside.",
    "Drink the tea warm — gingerols are most bioactive fresh and hot. The almonds provide vitamin E and magnesium.",
  ],

  // ─── FISH & SEAFOOD PLAN ──────────────────────────────────────────────────

  "fish-0-breakfast": [
    "Toast a thick slice of good sourdough until golden and firm.",
    "Halve a ripe avocado and scoop flesh onto the toast. Mash gently and season with salt and lemon.",
    "Layer 2–3 slices of good quality smoked salmon on top. Add a few capers and fresh dill.",
    "Finish with a crack of black pepper and a squeeze of lemon. A beautiful, omega-3-rich breakfast.",
  ],
  "fish-0-lunch": [
    "Hard boil 2 eggs: cover in cold water, bring to boil, then remove from heat and rest 10 min. Peel and halve.",
    "Arrange salad greens on a plate. Add halved cherry tomatoes, blanched green beans, and sliced cucumber.",
    "Drain 1 can good-quality tuna in olive oil. Break into chunks over the salad. Add Niçoise olives.",
    "Dress with Dijon vinaigrette: olive oil, red wine vinegar, Dijon mustard, salt, and pepper.",
  ],
  "fish-0-dinner": [
    "Season a wild salmon fillet with salt, pepper, lemon zest, and dill. Drizzle with olive oil.",
    "Cook quinoa in 2:1 water, simmer 15 min, fluff, and stir in lemon juice and fresh dill.",
    "Snap off woody asparagus ends. Toss with olive oil and salt. Roast at 400°F for 12 min.",
    "Pan-sear salmon skin-side up in a hot oven-safe pan for 3 min, flip, then finish in the oven at 400°F for 5 min. Serve over quinoa with asparagus.",
  ],
  "fish-0-snack": [
    "Measure 1 oz raw walnuts (about 14 halves).",
    "Rinse a large handful of fresh blueberries.",
    "No preparation needed — eat together as a snack.",
    "Walnuts' ALA omega-3 and blueberries' anthocyanins form a powerful anti-inflammatory pairing.",
  ],

  "fish-1-breakfast": [
    "Bring 1 cup oats and 2 cups water to a boil. Stir in ½ tsp turmeric and reduce to a simmer for 5 min.",
    "Add 1 tbsp ground flaxseed and stir. The flaxseed thickens the oats and adds omega-3.",
    "Pour into a bowl. Top with fresh or thawed raspberries and a small handful of raw walnuts.",
    "Drizzle with a little honey and a pinch of black pepper (activates turmeric curcumin).",
  ],
  "fish-1-lunch": [
    "Drain 1 tin of sardines packed in olive oil. Reserve the oil for dressing.",
    "Drain and rinse 1 can white beans. Toss with the reserved sardine oil, lemon juice, salt, and pepper.",
    "Plate arugula as a base. Top with the white bean mixture and arrange sardines over the top.",
    "Squeeze fresh lemon generously and add optional capers. Sardines are one of the most anti-inflammatory foods available.",
  ],
  "fish-1-dinner": [
    "Pat mackerel fillets dry and season with salt, pepper, and lemon zest.",
    "Cube sweet potato, toss with olive oil and cumin, and roast at 400°F for 25 min.",
    "Trim broccolini and blanch in boiling salted water for 3 min. Drain and dress with olive oil.",
    "Pan-sear mackerel skin-side down in a hot pan with avocado oil for 3–4 min, flip and cook 1 more min. Serve immediately.",
  ],
  "fish-1-snack": [
    "Pour 8 oz unsweetened tart cherry juice into a glass.",
    "Measure 2 tbsp raw pumpkin seeds.",
    "No prep needed — enjoy together.",
    "Pumpkin seeds are one of the best dietary sources of zinc, essential for immune function and joint health.",
  ],

  "fish-2-breakfast": [
    "Scoop 1 cup full-fat Greek yogurt (plain) into a bowl.",
    "Drizzle with 1–2 tsp raw honey for sweetness.",
    "Top with 1 oz crushed walnuts and a generous handful of pomegranate seeds (or use thawed pomegranate arils).",
    "Eat immediately. This breakfast delivers probiotics, omega-3, and powerful antioxidants in one bowl.",
  ],
  "fish-2-lunch": [
    "Cook 1 cup brown rice according to package directions (about 35 min). Fluff and let cool.",
    "Dice a wild-caught salmon fillet (sashimi-grade) or use cooked salmon. Season with tamari and sesame oil.",
    "Slice cucumber, shred carrots, and prep edamame (thawed from frozen is fine).",
    "Build the poke bowl: rice base, then salmon, cucumber, edamame, and avocado slices. Drizzle with tamari and sesame oil.",
  ],
  "fish-2-dinner": [
    "Place cod fillets in a baking dish. Season with salt, pepper, and a drizzle of olive oil.",
    "Top with halved cherry tomatoes, capers, sliced Kalamata olives, fresh thyme, and garlic slices.",
    "Bake at 400°F for 18–22 min until the cod flakes easily with a fork.",
    "Serve directly from the dish. The tomato-caper-olive sauce is packed with Mediterranean anti-inflammatory compounds.",
  ],
  "fish-2-snack": [
    "Slice 1 apple into thin wedges.",
    "Serve with 2 tbsp almond butter for dipping.",
    "Brew 1 cup green tea at 175°F for 2–3 min.",
    "Apple polyphenols, almond vitamin E, and green tea EGCG — a triple anti-inflammatory snack combination.",
  ],

  "fish-3-breakfast": [
    "The night before: whisk 3 tbsp chia seeds into 1 cup coconut milk. Stir well and refrigerate overnight.",
    "In the morning, stir the thick pudding. Top with diced fresh mango or thawed mango chunks.",
    "Sprinkle with toasted coconut flakes and 1 tbsp hemp seeds.",
    "The chia seeds provide ALA omega-3 and fiber; coconut and mango make this breakfast feel indulgent.",
  ],
  "fish-3-lunch": [
    "Open 1 tin of herring in olive oil. Drain and arrange on rye crispbreads or crackers.",
    "Slice cucumber into thin rounds and arrange on top of the herring.",
    "Slice half an avocado and layer alongside. Add fresh dill generously.",
    "Finish with a squeeze of lemon and black pepper. Herring is exceptionally rich in EPA and DHA omega-3.",
  ],
  "fish-3-dinner": [
    "Season a sashimi-grade tuna steak with salt, pepper, and a drizzle of sesame oil.",
    "Slice zucchini and toss with olive oil, salt, and pepper. Roast at 400°F for 15 min.",
    "Sear tuna in a very hot dry pan — just 90 seconds per side for a rare center. The key is a screaming hot pan.",
    "Slice tuna and serve over roasted zucchini with olive tapenade. Rest 2 min before slicing.",
  ],
  "fish-3-snack": [
    "Measure 2 tbsp raw pumpkin seeds into a small bowl.",
    "Brew a cup of fresh ginger tea: steep 4–5 slices of fresh ginger in boiling water for 5 min.",
    "Add a squeeze of lemon and honey to the tea.",
    "Sip slowly — ginger is one of the most well-studied anti-inflammatory herbs and helps with joint stiffness.",
  ],

  "fish-4-breakfast": [
    "Whisk 2–3 eggs with a pinch of salt. If you have capers, pat them dry on a paper towel.",
    "Sauté a large handful of spinach in olive oil with 1 garlic clove for 1–2 min. Set aside.",
    "In the same pan, scramble eggs over medium-low heat until softly set.",
    "Fold in spinach, a few slices of smoked salmon, and optional capers. Season with black pepper and dill.",
  ],
  "fish-4-lunch": [
    "Drain 1 can tuna in olive oil. Mix with diced avocado, a squeeze of lime, salt, and cumin. Mash lightly.",
    "Wash and dry large romaine or butter lettuce leaves to use as wraps.",
    "Slice cucumber for crunch and add thin-sliced red onion if desired.",
    "Fill lettuce cups with tuna-avocado mixture and cucumber. Serve immediately with extra lime on the side.",
  ],
  "fish-4-dinner": [
    "Season a salmon fillet generously with salt, pepper, and turmeric.",
    "Make turmeric sauce: blend or whisk yogurt, turmeric, garlic, lemon juice, and a little olive oil.",
    "Cut cauliflower into florets, toss with olive oil and cumin, and roast at 425°F for 25 min until golden.",
    "Pan-sear salmon in olive oil 4 min per side over medium-high heat. Plate with cauliflower and drizzle the turmeric sauce over everything.",
  ],
  "fish-4-snack": [
    "Measure 1 oz each of almonds and walnuts. Add a small handful of dried tart cherries.",
    "Mix together in a small bowl — no preparation needed.",
    "This combo delivers omega-3, vitamin E, magnesium, and anthocyanins in one convenient snack.",
    "Pre-portion into a small container if taking it on the go.",
  ],

  "fish-5-breakfast": [
    "Blend a thawed açaí packet with a splash of almond milk until smooth and thick. Pour into a bowl.",
    "Top generously with hemp seeds, chia seeds, sliced strawberries, and a few fresh mint leaves.",
    "Sprinkle granola for crunch if desired.",
    "Eat immediately — açaí is rich in anthocyanins and healthy fats, but degrades quickly.",
  ],
  "fish-5-lunch": [
    "Peel and devein 8 oz shrimp. Pat dry and season with salt, pepper, and lime zest.",
    "Sauté shrimp in a hot pan with avocado oil for 2 min per side until pink and cooked. Don't overcook.",
    "Make citrus vinaigrette: combine orange juice, lime juice, olive oil, Dijon mustard, and honey.",
    "Toss mixed greens and sliced avocado with the vinaigrette. Top with warm shrimp and serve.",
  ],
  "fish-5-dinner": [
    "Score the sides of a whole cleaned fish (sea bass, snapper, or branzino). Season inside and out with salt, pepper, lemon slices, and garlic.",
    "Chop zucchini, tomatoes, and fennel into chunks. Toss with olive oil and spread in a roasting pan.",
    "Place fish on top of vegetables. Roast at 400°F for 25–30 min depending on size — 10 min per inch of thickness.",
    "The fish is done when it flakes easily at the thickest part. Drizzle with lemon-garlic olive oil before serving.",
  ],
  "fish-5-snack": [
    "Scoop 3 tbsp good-quality hummus into a bowl.",
    "Peel and cut 1 carrot into sticks. Slice ½ cucumber into rounds.",
    "Arrange around the hummus — no cooking needed.",
    "Hummus provides plant protein, iron, and folate. Carrot beta-carotene is an important anti-inflammatory antioxidant.",
  ],

  "fish-6-breakfast": [
    "Toast sourdough until golden and firm. Rub the surface with a cut garlic clove while hot.",
    "Slice half an avocado and fan out over the toast. Season with salt.",
    "Lay 2–3 slices smoked salmon over the avocado. Sprinkle generously with 'everything' seasoning (or sesame seeds, poppy seeds, onion flakes).",
    "Add a squeeze of lemon and optional cream cheese under the salmon for richness.",
  ],
  "fish-6-lunch": [
    "Cook 8 oz pasta (preferably whole grain or legume pasta) according to package directions. Reserve ½ cup pasta water.",
    "In a large pan, warm olive oil with 4 minced garlic cloves over medium heat until fragrant — don't brown.",
    "Add drained sardines and break them apart into the oil. Add pasta water and a squeeze of lemon.",
    "Toss hot pasta through the sardine-garlic oil. Add fresh parsley and a crack of black pepper. Top with lemon zest.",
  ],
  "fish-6-dinner": [
    "Pat halibut fillets dry. Season with fresh rosemary, salt, pepper, and olive oil. Let rest 10 min at room temperature.",
    "Cube parsnips, carrots, and sweet potato. Toss with olive oil, rosemary, and salt. Roast at 425°F for 30 min.",
    "When vegetables are almost done, sear halibut in a hot pan with butter or olive oil — 4 min per side.",
    "The fish is done when it's opaque and flakes gently. Serve over the root vegetables with extra lemon.",
  ],
  "fish-6-snack": [
    "Measure 1 oz raw walnuts.",
    "Break off 1–2 squares of dark chocolate (85% or higher cocoa content).",
    "No cooking needed — enjoy together.",
    "Dark chocolate (85%+) contains flavanols that reduce inflammation; walnuts provide ALA omega-3. A genuinely therapeutic treat.",
  ],

  // ─── RA & CHRONIC ILLNESS PLAN ────────────────────────────────────────────

  "ra-0-breakfast": [
    "Warm 1 cup bone broth gently in a small pot. Grate in 1 tsp fresh ginger and stir. Drink this first as a warming gut-primer.",
    "Bring 1 cup oats with 2 cups water to a boil. Add ½ tsp turmeric, a pinch of black pepper (essential for curcumin absorption), and cinnamon.",
    "Simmer 5 min, stirring. Pour into a bowl and top with crushed walnuts and fresh blueberries.",
    "Drizzle with a little raw honey. The black pepper increases curcumin bioavailability by up to 2000%.",
  ],
  "ra-0-lunch": [
    "If using raw salmon: season a small fillet with salt and olive oil, sear in a hot pan 3 min per side. Let cool and flake.",
    "Toss 2 cups arugula with lemon juice, extra virgin olive oil, salt, and black pepper.",
    "Arrange flaked salmon over arugula. Sprinkle with 2 tbsp hemp seeds.",
    "Finish with a drizzle of your best olive oil. Hemp seeds provide a perfect 3:1 omega-6 to omega-3 ratio.",
  ],
  "ra-0-dinner": [
    "Make a turmeric marinade: olive oil, 1 tsp turmeric, 1 tsp black pepper, cumin, garlic, salt. Coat chicken thighs generously.",
    "Roast marinated chicken at 425°F for 35–40 min until internal temp reaches 165°F and skin is golden.",
    "Steam broccolini for 4 min. Cube and roast sweet potato at 425°F with olive oil for 25 min.",
    "Plate chicken alongside broccolini and sweet potato. Spoon pan juices over everything. A therapeutically-dense meal.",
  ],
  "ra-0-snack": [
    "Pour 8 oz tart cherry juice — drink this daily, especially in the evening. Reduces uric acid and inflammatory CRP.",
    "Add 2–3 Brazil nuts to a small dish. That's all you need for your entire daily selenium requirement.",
    "No preparation needed.",
    "Selenium is a critical antioxidant mineral. Research links low selenium to increased inflammatory markers in RA.",
  ],

  "ra-1-breakfast": [
    "Add 1 cup almond milk, 1 cup frozen blueberries, 1 large handful of spinach, and 1 inch fresh ginger to a blender.",
    "Add 1 tbsp ground flaxseed, ½ tsp turmeric, and a pinch of black pepper.",
    "Blend on high 45–60 seconds until completely smooth and deep purple-green.",
    "Drink immediately — this is one of the most concentrated anti-inflammatory breakfasts possible.",
  ],
  "ra-1-lunch": [
    "Drain 1 tin sardines in olive oil. Reserve the oil — it's therapeutic quality omega-3-rich oil.",
    "Drain and rinse 1 can white beans. Toss with the sardine oil, lemon juice, and salt.",
    "Massage 2 cups kale with a pinch of salt for 1–2 min until softened.",
    "Layer kale, white bean mixture, and sardines in a bowl. Drizzle with extra olive oil and lemon. Add capers for depth.",
  ],
  "ra-1-dinner": [
    "Make ginger-miso glaze: whisk 1 tbsp white miso, 1 tbsp tamari, 1 tsp grated ginger, 1 tsp rice vinegar, and 1 tsp honey.",
    "Coat salmon fillets in the glaze. Bake at 400°F for 14–16 min until cooked through and slightly caramelized.",
    "Steam asparagus for 4 min — keep it crisp. Make cauliflower mash: steam and blend cauliflower with olive oil, garlic, and salt.",
    "Plate salmon alongside mash and asparagus. Spoon extra glaze over the fish. A deeply therapeutic, delicious dinner.",
  ],
  "ra-1-snack": [
    "Wash and cut 3 celery stalks into sticks.",
    "Measure 2 tbsp walnut butter into a small bowl.",
    "Brew 1 cup green tea at 175°F for 3 min. Green tea EGCG is one of the most studied anti-inflammatory compounds.",
    "Eat celery and walnut butter together while sipping tea. A genuinely therapeutic afternoon break.",
  ],

  "ra-2-breakfast": [
    "The night before: whisk 3 tbsp chia seeds into 1 cup unsweetened almond milk. Add Ceylon cinnamon. Refrigerate overnight.",
    "In the morning, stir pudding well. It should be thick and gel-like.",
    "Top with pomegranate seeds (or arils from a container), crushed walnuts, and a drizzle of honey.",
    "Eat cold. Pomegranate punicalagins are among the most potent antioxidants known in food science.",
  ],
  "ra-2-lunch": [
    "Sauté 4 minced garlic cloves in olive oil over medium heat until fragrant (not browned). Add 1 tsp turmeric and cumin.",
    "Add ½ cup red lentils and 4 cups bone broth. Bring to a boil, then simmer 20 min until lentils are soft.",
    "Stir in 2 cups chopped spinach and cook 2 more min. Season with salt, pepper, and lemon juice.",
    "Serve in a deep bowl drizzled with good olive oil. This soup is among the most anti-inflammatory lunches you can eat.",
  ],
  "ra-2-dinner": [
    "Season lamb cutlets with rosemary, garlic, salt, and black pepper.",
    "Roast whole beets at 400°F for 45 min. Once cool, peel and slice into wedges. (Or use pre-cooked vacuum-packed beets.)",
    "Sear lamb in a hot pan with olive oil — 3 min per side for medium. Rest 5 min before slicing.",
    "Make walnut-rosemary dressing: blend walnuts, olive oil, fresh rosemary, lemon, salt. Serve with arugula and beet slices topped with lamb and dressing.",
  ],
  "ra-2-snack": [
    "Pour 6 oz plain kefir into a glass or bowl.",
    "Top with a generous handful of mixed berries (blueberries, raspberries, or pomegranate seeds).",
    "No preparation needed — drink or eat with a spoon.",
    "Kefir probiotics support the gut-immune axis. People with RA often have gut microbiome imbalances; probiotic foods directly help.",
  ],

  "ra-3-breakfast": [
    "Cook 1 cup rolled oats in 2 cups water or almond milk over medium heat, stirring occasionally.",
    "Stir in ½ tsp turmeric, ¼ tsp ginger, a pinch of black pepper, and cinnamon when oats are almost done.",
    "Pour into a bowl. Top with crushed walnuts and a handful of fresh or thawed blueberries.",
    "Drizzle with raw honey. This is your daily curcumin dose — the golden milk version in breakfast form.",
  ],
  "ra-3-lunch": [
    "Cook 1 cup brown rice per package directions (or use a microwave pouch). Fluff and let cool.",
    "Open 1 tin wild tuna in olive oil. Drain. Slice cucumber and shred a small sheet of dried nori (seaweed).",
    "Halve and pit an avocado. Slice into thin pieces.",
    "Build the bowl: rice, tuna, cucumber, avocado, nori, and sesame seeds. Dress with tamari and a few drops of sesame oil.",
  ],
  "ra-3-dinner": [
    "Season 6 bone-in chicken thighs with ginger, garlic, salt, and turmeric.",
    "Sear thighs skin-side down in a large pan for 5 min until deeply golden. Flip briefly.",
    "Add sliced shiitake mushrooms, halved bok choy, and 2 cups ginger-sesame broth (tamari + ginger + sesame oil + water).",
    "Cover and simmer 20 min until chicken is cooked through and bok choy is tender. Serve directly from the pan.",
  ],
  "ra-3-snack": [
    "Measure 2 tbsp raw pumpkin seeds into a small dish.",
    "Pour 4 oz pure pomegranate juice (100%, no added sugar) into a glass.",
    "No preparation needed.",
    "Pumpkin seeds deliver zinc (critical for immune regulation in RA); pomegranate juice reduces CRP inflammatory markers.",
  ],

  "ra-4-breakfast": [
    "In a non-stick pan, sauté 2 garlic cloves and a large handful of spinach in olive oil for 2 min. Season with turmeric.",
    "Whisk 3 pastured eggs with salt and a pinch of turmeric.",
    "Add eggs to the pan with spinach. Scramble slowly over low heat — remove when still slightly wet.",
    "Serve immediately. Pastured eggs have 3–6× more vitamin D than conventional eggs, crucial for immune regulation in RA.",
  ],
  "ra-4-lunch": [
    "Open and drain 1 tin mackerel in olive oil. Arrange on rye crackers or toasted rye bread.",
    "Slice half an avocado and a few thin rings of red onion.",
    "Pat capers dry and chop fresh dill.",
    "Layer mackerel with avocado, capers, red onion, and dill. Finish with lemon juice and black pepper.",
  ],
  "ra-4-dinner": [
    "Cook ½ cup quinoa per package. Roast a cubed sweet potato at 400°F with olive oil for 25 min.",
    "Rub a salmon fillet with olive oil, turmeric, garlic, and lemon zest. Bake at 400°F for 14 min.",
    "Massage kale with olive oil and lemon until softened. Make tahini dressing: tahini, lemon, garlic, water.",
    "Build the Buddha bowl: quinoa base, salmon, kale, sweet potato. Drizzle tahini generously. This single meal contains 5+ anti-inflammatory compounds.",
  ],
  "ra-4-snack": [
    "Pour 8 oz tart cherry juice — your daily CRP-reducing serving.",
    "Break off 1 square (about 10g) of dark chocolate, 85% or higher.",
    "No preparation needed — enjoy together.",
    "Dark chocolate flavanols reduce TNF-alpha. Tart cherry anthocyanins inhibit COX-1 and COX-2. A genuinely medicinal snack.",
  ],

  "ra-5-breakfast": [
    "Blend 1 thawed açaí packet with a splash of almond milk until smooth and thick. Pour into a bowl.",
    "Top with 2 tbsp hemp seeds, 1 tbsp ground chia seeds, sliced banana, and a few blueberries.",
    "Drizzle with almond butter or tahini for additional anti-inflammatory fats.",
    "Eat immediately. Hemp seeds provide a complete amino acid profile and an ideal omega-6/omega-3 ratio.",
  ],
  "ra-5-lunch": [
    "Bring 4 cups bone broth to a gentle simmer. Add 1 can white beans, 2 cups chopped kale, and fresh rosemary.",
    "Add diced cooked turkey or chicken and simmer 8–10 min.",
    "Season with salt, black pepper, and lemon juice. The bone broth provides collagen and glycine for joint support.",
    "Ladle into a deep bowl and drizzle with olive oil. Serve with a slice of sourdough for dipping.",
  ],
  "ra-5-dinner": [
    "Season a whole side of salmon with olive oil, salt, pepper, dill, and lemon slices.",
    "Cube root vegetables (sweet potato, parsnips, carrots) and toss with olive oil, rosemary, and thyme. Roast at 400°F for 30 min.",
    "When vegetables are almost done, add the salmon to the oven. Bake 14–16 min until it flakes easily.",
    "Drizzle everything with a lemon-herb olive oil (olive oil blended with lemon zest and fresh herbs). A complete one-pan RA meal.",
  ],
  "ra-5-snack": [
    "Brew 1 cup chamomile tea — steep a quality bag or loose chamomile for 5 min.",
    "Measure 1 oz raw almonds (about 23 almonds).",
    "No additional preparation needed.",
    "Chamomile apigenin blocks COX-2 (the same target as ibuprofen). Almonds provide vitamin E and magnesium, both often deficient in RA patients.",
  ],

  "ra-6-breakfast": [
    "Preheat oven to 375°F. Whisk 4 eggs with a pinch of turmeric, salt, rosemary, and black pepper.",
    "Sauté sliced mushrooms and fresh spinach in an oven-safe pan with olive oil for 3 min.",
    "Pour egg mixture over the vegetables. Cook on stovetop 2 min until edges set.",
    "Transfer to oven for 8–10 min until the frittata is puffed and set. Slice and serve with fresh herbs.",
  ],
  "ra-6-lunch": [
    "Peel and devein 8 oz raw shrimp. Season with salt, lime zest, and a pinch of turmeric.",
    "Sauté in a hot pan with olive oil for 2 min per side until pink. Don't overcook — shrimp cook fast.",
    "Make citrus vinaigrette: orange juice, lime juice, olive oil, honey, salt.",
    "Serve shrimp over watercress or arugula and sliced avocado. Drizzle with vinaigrette and add fresh cilantro.",
  ],
  "ra-6-dinner": [
    "In a large pot, brown 1 lb grass-fed beef chunks with onion and garlic in olive oil over medium-high heat.",
    "Add diced sweet potato, beets (peeled and cubed), 3 cups bone broth, and fresh rosemary. Stir well.",
    "Bring to a boil, then cover and simmer 2–2.5 hours until beef is completely tender and vegetables are soft.",
    "Adjust seasoning. This bone broth stew is the most collagen-dense and anti-inflammatory dinner in the entire program.",
  ],
  "ra-6-snack": [
    "Warm 1 cup unsweetened almond or oat milk over medium-low heat.",
    "Whisk in ½ tsp turmeric, ¼ tsp ground ginger, a pinch of black pepper, and raw honey to taste.",
    "Pour into a mug. This is your golden turmeric milk — your most powerful daily anti-inflammatory drink.",
    "Sip slowly before bed. The combination of curcumin + ginger + black pepper is among the most studied anti-inflammatory combinations in nutritional science.",
  ],
};

export function getCookingSteps(planId: string, dayIndex: number, mealType: string): CookingSteps | null {
  const key = `${planId}-${dayIndex}-${mealType}`;
  return instructions[key] ?? null;
}
