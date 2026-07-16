export type WellnessProduct = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  price: string;
  url: string;
  badge?: string;
  category: "device" | "supplement" | "book" | "other";
  version: string;
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
  },
];
