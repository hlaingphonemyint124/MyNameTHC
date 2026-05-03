import { Button } from "@/components/ui/button";
import { Category } from "@/data/products";
import { Leaf, Sun, Blend, Package } from "lucide-react";

interface CategoryFilterProps {
  selectedCategory: Category | "All";
  onCategoryChange: (category: Category | "All") => void;
}

const categories: { value: Category | "All"; label: string; icon: React.ReactNode }[] = [
  { value: "All", label: "All", icon: null },
  { value: "Indica", label: "Indica", icon: <Leaf className="h-4 w-4" /> },
  { value: "Sativa", label: "Sativa", icon: <Sun className="h-4 w-4" /> },
  { value: "Hybrid", label: "Hybrid", icon: <Blend className="h-4 w-4" /> },
  { value: "Accessories", label: "Accessories", icon: <Package className="h-4 w-4" /> },
];

export const CategoryFilter = ({ selectedCategory, onCategoryChange }: CategoryFilterProps) => {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {categories.map((category) => (
        <Button
          key={category.value}
          variant={selectedCategory === category.value ? "premium" : "outline"}
          size="sm"
          onClick={() => onCategoryChange(category.value)}
          className="rounded-pill px-4 h-9 text-xs font-medium uppercase tracking-wider hairline"
        >
          {category.icon}
          {category.label}
        </Button>
      ))}
    </div>
  );
};
