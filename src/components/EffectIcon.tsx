import {
  Moon, Zap, Lightbulb, Focus, TrendingUp, Cloud,
  Smile, Leaf, Wind, Flame, Star, Sparkles, Heart, Coffee, Waves
} from "lucide-react";
import { LucideIcon } from "lucide-react";

interface EffectIconProps {
  effect: string; // accepts any string from DB — no strict union type
}

// Broad keyword → icon map. Checked via toLowerCase().includes()
const EFFECT_RULES: Array<{ keywords: string[]; Icon: LucideIcon }> = [
  { keywords: ["relax", "calm"],              Icon: Moon       },
  { keywords: ["sleep", "sleepy", "sedati"],  Icon: Cloud      },
  { keywords: ["energet", "energiz"],         Icon: Zap        },
  { keywords: ["creat"],                      Icon: Lightbulb  },
  { keywords: ["focus", "focused"],           Icon: Focus      },
  { keywords: ["uplift", "uplifting"],        Icon: TrendingUp },
  { keywords: ["happy", "happiness"],         Icon: Smile      },
  { keywords: ["euphori"],                    Icon: Star       },
  { keywords: ["hunger", "hungry", "munch"],  Icon: Coffee     },
  { keywords: ["pain", "relief"],             Icon: Heart      },
  { keywords: ["giggly", "laugh"],            Icon: Sparkles   },
  { keywords: ["talkati", "social"],          Icon: Waves      },
  { keywords: ["aroused"],                    Icon: Flame      },
  { keywords: ["tingly"],                     Icon: Wind       },
];

const getIcon = (effect: string): LucideIcon => {
  const lower = effect.toLowerCase();
  for (const rule of EFFECT_RULES) {
    if (rule.keywords.some(kw => lower.includes(kw))) return rule.Icon;
  }
  return Leaf; // safe fallback — never undefined
};

export const EffectIcon = ({ effect }: EffectIconProps) => {
  const Icon = getIcon(effect);
  return <Icon className="h-3.5 w-3.5 shrink-0 text-accent" />;
};
