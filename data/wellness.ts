export type WellnessProduct = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  price: string;
  url: string;
  badge?: string;
  category: "device" | "supplement" | "book" | "other";
  categoryLabel?: string;
  version: string;
  discountCode?: string;
  discountNote?: string;
  urlHint?: string;
  videoUrl?: string;
  heroImage?: number;
};

export const wellnessProducts: WellnessProduct[] = [
  {
    id: "theraroad",
    name: "RI Studio Recovery Device",
    tagline: "Deep recovery for your body, wherever you go.",
    description:
      "A professional-grade recovery device designed to relieve muscle tension, improve circulation, and accelerate healing. Whether you're managing chronic pain, recovering from inflammation, or simply unwinding after a long day, targeted percussive therapy helps your body release tightness, reduce soreness, and return to a state of balance. A powerful complement to anti-inflammatory eating.",
    price: "Shop Now",
    url: "https://theonedevice.com/theraroad",
    badge: "RI Studio Pick",
    category: "device",
    version: "1.0",
    urlHint: "theonedevice.com/theraroad",
  },
  {
    id: "sensate",
    name: "Sensate",
    tagline: "Calm your nervous system. Quiet the stress response.",
    description:
      "Sensate is a clinically-studied device that uses infrasonic resonance to calm your nervous system in as little as 20 minutes. In a peer-reviewed pilot study, a single session reduced heart rate by 7%, increased frontal theta brain activity (relaxation) by 26%, and decreased beta activity (worry) by 27% — with participants reporting significantly less anxiety and sadness afterward.\n\nStress and chronic inflammation are deeply connected. Elevated cortisol keeps your immune system on high alert, driving the same inflammatory cycles that anti-inflammatory eating works to reverse. Sensate directly activates the parasympathetic response — the rest-and-repair state your body needs to heal. Paired with your Nourish meal plan, it addresses the stress side of the inflammation equation that food alone cannot always reach.",
    price: "Shop Now",
    url: "https://getsensate.com/NOURISH",
    badge: "RI Studio Partner",
    category: "device",
    categoryLabel: "Stress Relief Device",
    version: "1.1",
    discountCode: "NOURISH",
    discountNote: "Use code NOURISH at checkout for 10% off",
    urlHint: "getsensate.com",
    videoUrl: "https://www.youtube.com/embed/Daa5Iq7nIGw?si=jC1x8RDNfYsvceeq&sca_ref=11897452.BtNe3h1NmG",
    heroImage: require("../assets/images/sensate-lifestyle.jpeg"),
  },
];
