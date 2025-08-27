import React from "react";
import useEmblaCarousel from "embla-carousel-react";
import { motion, AnimatePresence } from "framer-motion";
import { CollectibleBadge } from "./collectible-badge";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

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
  
  // Get tier gradient for dynamic background
  const getActiveTierGradient = () => {
    const activeBadge = items[selected];
    if (!activeBadge) return "from-background to-background";
    
    switch (activeBadge.tier?.toLowerCase()) {
      case 'legendary': return "from-gradient-legendary-start to-gradient-legendary-end";
      case 'epic': return "from-gradient-epic-start to-gradient-epic-end";
      case 'rare': return "from-gradient-rare-start to-gradient-rare-end";
      case 'uncommon': return "from-gradient-uncommon-start to-gradient-uncommon-end";
      default: return "from-gradient-common-start to-gradient-common-end";
    }
  };

  return (
    <div className="w-full relative">
      {/* Dynamic Background Glow */}
      <motion.div 
        className={`absolute inset-0 bg-gradient-to-r ${getActiveTierGradient()} opacity-10 blur-3xl rounded-3xl`}
        animate={{
          opacity: [0.05, 0.15, 0.05],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      {/* Floating Particles for Legendary/Epic */}
      <AnimatePresence>
        {items[selected]?.tier === 'Legendary' && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-gradient-legendary-start rounded-full"
                initial={{ 
                  x: Math.random() * 300, 
                  y: Math.random() * 200,
                  opacity: 0 
                }}
                animate={{
                  y: [null, -50],
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0]
                }}
                transition={{
                  duration: 3,
                  delay: i * 0.5,
                  repeat: Infinity,
                  ease: "easeOut"
                }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      <div className="relative">
        {/* Progress Bar */}
        <div className="mb-2 h-1 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
            animate={{
              width: `${((selected + 1) / items.length) * 100}%`
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        </div>
        
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-8 py-6 px-4">
            {items.map((item, i) => {
              const active = i === selected;
              const distance = Math.abs(i - selected);
              
              return (
                <motion.div
                  key={item.id}
                  onClick={() => {
                    scrollTo(i);
                    onItemClick?.(item);
                  }}
                  aria-current={active}
                  className="basis-[140px] shrink-0 flex justify-center cursor-pointer relative"
                  initial={false}
                  animate={{
                    scale: active ? 1.4 : Math.max(0.7, 1 - distance * 0.1),
                    filter: active ? "blur(0px)" : `blur(${Math.min(3, distance)}px)`,
                    rotateY: active ? 0 : (i < selected ? -15 : i > selected ? 15 : 0),
                    x: active ? 0 : (i < selected ? 20 : i > selected ? -20 : 0),
                  }}
                  whileHover={{
                    scale: active ? 1.5 : 1.1,
                    rotateZ: active ? 5 : 0,
                  }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 400, 
                    damping: 25,
                    delay: Math.abs(i - selected) * 0.05
                  }}
                >
                  {/* Glow Effect for Active Badge */}
                  {active && (
                    <motion.div
                      className="absolute inset-0 rounded-full bg-primary/20 blur-xl"
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.6, 0.3],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  )}
                  
                  {/* Sparkle Effect for Rare+ Badges */}
                  {(item.tier === 'Rare' || item.tier === 'Epic' || item.tier === 'Legendary') && active && (
                    <motion.div
                      className="absolute -top-2 -right-2 text-accent"
                      animate={{
                        rotate: [0, 180, 360],
                        scale: [0.8, 1.2, 0.8],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                    >
                      <Sparkles size={16} />
                    </motion.div>
                  )}
                  
                  <CollectibleBadge
                    badge={{
                      ...item,
                      name: item.title,
                      repPoints: item.repPoints || 0
                    }}
                    size="lg"
                    onClick={() => onItemClick?.(item)}
                  />
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Electric Navigation Buttons */}
        <motion.button
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-primary to-accent p-3 rounded-full shadow-neon border border-primary/50 backdrop-blur-sm"
          onClick={() => embla?.scrollPrev()}
          aria-label="Previous"
          whileHover={{ 
            scale: 1.1, 
            boxShadow: "0 0 25px hsl(var(--primary))" 
          }}
          whileTap={{ scale: 0.95 }}
          animate={{
            boxShadow: [
              "0 0 10px hsl(var(--primary) / 0.5)",
              "0 0 20px hsl(var(--primary) / 0.8)",
              "0 0 10px hsl(var(--primary) / 0.5)"
            ]
          }}
          transition={{
            boxShadow: { duration: 2, repeat: Infinity }
          }}
        >
          <ChevronLeft className="w-5 h-5 text-primary-foreground" />
        </motion.button>
        
        <motion.button
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-accent to-primary p-3 rounded-full shadow-neon border border-accent/50 backdrop-blur-sm"
          onClick={() => embla?.scrollNext()}
          aria-label="Next"
          whileHover={{ 
            scale: 1.1, 
            boxShadow: "0 0 25px hsl(var(--accent))" 
          }}
          whileTap={{ scale: 0.95 }}
          animate={{
            boxShadow: [
              "0 0 10px hsl(var(--accent) / 0.5)",
              "0 0 20px hsl(var(--accent) / 0.8)",
              "0 0 10px hsl(var(--accent) / 0.5)"
            ]
          }}
          transition={{
            boxShadow: { duration: 2, repeat: Infinity, delay: 1 }
          }}
        >
          <ChevronRight className="w-5 h-5 text-accent-foreground" />
        </motion.button>
      </div>

      {/* Animated Dots with Pulse */}
      <div className="mt-6 flex justify-center gap-3">
        {items.map((_, i) => (
          <motion.button
            key={i}
            className={`relative h-3 w-3 rounded-full transition-all duration-300 ${
              i === selected 
                ? "bg-gradient-to-r from-primary to-accent" 
                : "bg-muted-foreground/40"
            }`}
            onClick={() => scrollTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            whileHover={{ scale: 1.3 }}
            whileTap={{ scale: 0.9 }}
            animate={i === selected ? {
              boxShadow: [
                "0 0 0 0 hsl(var(--primary) / 0.4)",
                "0 0 0 8px hsl(var(--primary) / 0)",
              ]
            } : {}}
            transition={{
              boxShadow: { duration: 1, repeat: Infinity }
            }}
          >
            {i === selected && (
              <motion.div
                className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-accent"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.8, 0.4, 0.8]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}