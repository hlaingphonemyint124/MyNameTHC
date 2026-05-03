export type Category = "Indica" | "Sativa" | "Hybrid" | "Accessories";

export type Effect = "Relaxing" | "Energizing" | "Creative" | "Focused" | "Uplifting" | "Sleepy";

export interface Product {
  id: string;
  name: string;
  category: Category;
  image?: string;
  image_url?: string;
  description: string;
  thc: number;
  cbd: number;
  effects: Effect[];
  aroma: string[];
  flavor: string[];
  price?: number;
  is_new?: boolean;
  is_popular?: boolean;
}

export const products: Product[] = [
  {
    id: "1",
    name: "Purple Kush",
    category: "Indica",
    image: "indica",
    description: "A classic indica strain known for its deeply relaxing effects and earthy, sweet aroma. Perfect for evening use.",
    thc: 22,
    cbd: 0.5,
    effects: ["Relaxing", "Sleepy"],
    aroma: ["Earthy", "Sweet", "Pine"],
    flavor: ["Grape", "Berry", "Earth"],
  },
  {
    id: "2",
    name: "Northern Lights",
    category: "Indica",
    image: "indica",
    description: "One of the most famous indica strains, offering full-body relaxation and a dreamy euphoria.",
    thc: 18,
    cbd: 0.3,
    effects: ["Relaxing", "Sleepy"],
    aroma: ["Sweet", "Spicy", "Pine"],
    flavor: ["Sweet", "Earthy"],
  },
  {
    id: "3",
    name: "Green Crack",
    category: "Sativa",
    image: "sativa",
    description: "An energizing sativa that provides mental clarity and focus. Great for daytime use and creative activities.",
    thc: 24,
    cbd: 0.2,
    effects: ["Energizing", "Focused", "Creative"],
    aroma: ["Citrus", "Mango", "Tropical"],
    flavor: ["Citrus", "Mango", "Sweet"],
  },
  {
    id: "4",
    name: "Sour Diesel",
    category: "Sativa",
    image: "sativa",
    description: "A fast-acting sativa known for its energizing effects and diesel-like aroma. Perfect for fighting stress.",
    thc: 26,
    cbd: 0.2,
    effects: ["Energizing", "Uplifting", "Creative"],
    aroma: ["Diesel", "Pungent", "Citrus"],
    flavor: ["Diesel", "Lemon", "Herbal"],
  },
  {
    id: "5",
    name: "Blue Dream",
    category: "Hybrid",
    image: "hybrid",
    description: "A balanced hybrid combining full-body relaxation with gentle cerebral invigoration. Ideal for any time of day.",
    thc: 20,
    cbd: 0.4,
    effects: ["Relaxing", "Uplifting", "Creative"],
    aroma: ["Berry", "Sweet", "Herbal"],
    flavor: ["Blueberry", "Sweet", "Vanilla"],
  },
  {
    id: "6",
    name: "Girl Scout Cookies",
    category: "Hybrid",
    image: "hybrid",
    description: "A popular hybrid with a sweet and earthy aroma. Delivers euphoria and relaxation in equal measure.",
    thc: 28,
    cbd: 0.2,
    effects: ["Relaxing", "Uplifting", "Creative"],
    aroma: ["Sweet", "Earthy", "Mint"],
    flavor: ["Sweet", "Mint", "Cherry"],
  },
  {
    id: "7",
    name: "OG Kush",
    category: "Hybrid",
    image: "hybrid",
    description: "A legendary strain with complex aromas and a unique terpene profile. Balanced effects for mind and body.",
    thc: 23,
    cbd: 0.3,
    effects: ["Relaxing", "Uplifting"],
    aroma: ["Earthy", "Pine", "Woody"],
    flavor: ["Earthy", "Pine", "Citrus"],
  },
  {
    id: "8",
    name: "Granddaddy Purple",
    category: "Indica",
    image: "indica",
    description: "A potent indica with beautiful purple buds. Known for deep physical relaxation and mental euphoria.",
    thc: 21,
    cbd: 0.4,
    effects: ["Relaxing", "Sleepy"],
    aroma: ["Grape", "Berry", "Sweet"],
    flavor: ["Grape", "Berry"],
  },
];
