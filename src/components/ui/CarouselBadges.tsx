import React from "react";
import useEmblaCarousel from "embla-carousel-react";
import { motion } from "framer-motion";
import { CollectibleBadge } from "./collectible-badge";

type BadgeItem = {
  id: string;
  title: string; // Using title instead of name to match RepTab data
  icon: string;
  tier: string;
  rarity: string;
  earned: boolean;
  description: string;
  color?: string;
  requirement?: number;
  shape?: 'circle' | 'hexagon' | 'shield' | 'star' | 'diamond';
  category?: string;
  requirements?: string[];
  points?: number;
  progress?: number;
  target?: number;
  earnedAt?: string;
  repPoints?: number; // Optional since not always provided
};

export default function CarouselBadges({ 
  items, 
  onItemClick 
}: { 
  items: BadgeItem[]; 
  onItemClick?: (item: BadgeItem) => void;
}) {
  const [emblaRef, embla] = useEmblaCarousel({ loop: false, align: "center", dragFree: false, skipSnaps: false });
  const [selected, setSelected] = React.useState(0);

  React.useEffect(() => {
    if (!embla) return;
    const onSelect = () => setSelected(embla.selectedScrollSnap());
    embla.on("select", onSelect);
    onSelect();
  }, [embla]);

  const scrollTo = (i: number) => embla?.scrollTo(i);

  return (
    <div className="w-full">
      <div className="relative">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-4 py-4">
            {items.map((item, i) => {
              const active = i === selected;
              
              return (
                <motion.div
                  key={item.id}
                  onClick={() => {
                    scrollTo(i);
                    onItemClick?.(item);
                  }}
                  aria-current={active}
                  className="basis-[80px] shrink-0 flex justify-center cursor-pointer"
                  initial={false}
                  animate={{
                    scale: active ? 1.1 : 0.9,
                    filter: active ? "blur(0px)" : "blur(1px)",
                  }}
                  transition={{ type: "spring", stiffness: 260, damping: 24 }}
                >
                  <CollectibleBadge
                    badge={{
                      ...item,
                      name: item.title, // Map title to name for CollectibleBadge
                      repPoints: item.repPoints || 0 // Provide default repPoints
                    }}
                    size="lg"
                    onClick={() => onItemClick?.(item)}
                  />
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Arrows */}
        <button
          className="absolute left-1 top-1/2 -translate-y-1/2 bg-background/90 backdrop-blur rounded-full p-2 shadow-lg border border-border"
          onClick={() => embla?.scrollPrev()}
          aria-label="Previous"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          className="absolute right-1 top-1/2 -translate-y-1/2 bg-background/90 backdrop-blur rounded-full p-2 shadow-lg border border-border"
          onClick={() => embla?.scrollNext()}
          aria-label="Next"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Dots */}
      <div className="mt-3 flex justify-center gap-2">
        {items.map((_, i) => (
          <button
            key={i}
            className={`h-2 w-2 rounded-full transition-colors ${
              i === selected ? "bg-foreground" : "bg-foreground/30"
            }`}
            onClick={() => scrollTo(i)}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}