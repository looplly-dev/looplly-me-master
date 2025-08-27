import React from "react";
import useEmblaCarousel from "embla-carousel-react";
import { motion } from "framer-motion";

type Item = { 
  id: string; 
  title: string; 
  icon?: React.ReactNode; 
  color?: string;
  earned?: boolean;
  rarity?: string;
  tier?: string;
  description?: string;
};

export default function CarouselBadges({ 
  items, 
  onItemClick 
}: { 
  items: Item[]; 
  onItemClick?: (item: Item) => void;
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

  const getTierGradient = (tier: string, id: string) => {
    // Use badge ID to deterministically choose one of 3 colors per tier
    const colorIndex = id.length % 3;
    
    switch (tier) {
      case 'Diamond':
        const diamondGradients = [
          'var(--diamond-african-star)',
          'var(--diamond-kohinoor)', 
          'var(--diamond-namib-crystal)'
        ];
        return diamondGradients[colorIndex];
      case 'Platinum':
        const platinumGradients = [
          'var(--platinum-victoria-falls)',
          'var(--platinum-taj-mahal)',
          'var(--platinum-kilimanjaro-peak)'
        ];
        return platinumGradients[colorIndex];
      case 'Gold':
        const goldGradients = [
          'var(--gold-sahara-crown)',
          'var(--gold-lions-mane)',
          'var(--gold-rajasthani-gold)'
        ];
        return goldGradients[colorIndex];
      case 'Silver':
        const silverGradients = [
          'var(--silver-serengeti-storm)',
          'var(--silver-zambezi-mist)',
          'var(--silver-monsoon-silver)'
        ];
        return silverGradients[colorIndex];
      case 'Bronze':
        const bronzeGradients = [
          'var(--bronze-savanna-sunset)',
          'var(--bronze-turmeric-fire)',
          'var(--bronze-cinnamon-spice)'
        ];
        return bronzeGradients[colorIndex];
      default:
        return 'var(--gradient-legendary)';
    }
  };

  return (
    <div className="w-full">
      <div className="relative">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-4">
            {items.map((item, i) => {
              const active = i === selected;
              const gradient = item.tier ? getTierGradient(item.tier, item.id) : item.color;
              
              return (
                <motion.button
                  key={item.id}
                  onClick={() => {
                    scrollTo(i);
                    onItemClick?.(item);
                  }}
                  aria-current={active}
                  className="basis-3/5 sm:basis-1/3 shrink-0"
                  initial={false}
                  animate={{
                    scale: active ? 1 : 0.9,
                    filter: active ? "blur(0px)" : "blur(1px)",
                  }}
                  transition={{ type: "spring", stiffness: 260, damping: 24 }}
                >
                  <div
                    className="rounded-2xl p-4 h-40 flex flex-col justify-between shadow-lg relative overflow-hidden"
                    style={{ 
                      background: gradient ?? "linear-gradient(180deg, hsl(var(--muted)), hsl(var(--muted)/0.8))",
                      opacity: !item.earned ? 0.6 : 1
                    }}
                  >
                    <div className="text-3xl flex items-center justify-center">
                      {item.icon}
                    </div>
                    <div className="text-left">
                      <p className="text-sm opacity-70 text-white/80">
                        {item.tier || 'Badge'} {item.rarity && `• ${item.rarity}`}
                      </p>
                      <p className="text-lg font-semibold text-white drop-shadow-lg">
                        {item.title}
                      </p>
                      {item.description && (
                        <p className="text-xs opacity-60 text-white/70 mt-1 line-clamp-2">
                          {item.description}
                        </p>
                      )}
                    </div>
                    
                    {/* Earned indicator */}
                    {item.earned && (
                      <div className="absolute top-2 right-2 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white shadow-md flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    )}
                  </div>
                </motion.button>
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