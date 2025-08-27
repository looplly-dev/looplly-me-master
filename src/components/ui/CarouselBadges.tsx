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
  isSpacer?: boolean; // For spacer items
};

export default function CarouselBadges({ 
  items, 
  onItemClick 
}: { 
  items: BadgeItem[]; 
  onItemClick?: (item: BadgeItem) => void;
}) {
  // Add spacers for perfect centering
  const spacerItem: BadgeItem = {
    id: 'spacer',
    title: '',
    icon: '',
    tier: '',
    rarity: '',
    earned: false,
    description: '',
    isSpacer: true
  };
  
  const itemsWithSpacers = [spacerItem, spacerItem, ...items, spacerItem, spacerItem];
  const [emblaRef, embla] = useEmblaCarousel({ loop: false, align: "center", dragFree: false, skipSnaps: false });
  const [selected, setSelected] = React.useState(2); // Start at first real badge

  React.useEffect(() => {
    if (!embla) return;
    const onSelect = () => setSelected(embla.selectedScrollSnap());
    embla.on("select", onSelect);
    onSelect();
  }, [embla]);

  const scrollTo = (i: number) => embla?.scrollTo(i);
  
  // Smart navigation that skips spacers
  const scrollToPrevious = () => {
    const currentReal = selected - 2; // Convert to real badge index
    if (currentReal > 0) {
      scrollTo(currentReal - 1 + 2); // Convert back to spacer index
    }
  };
  
  const scrollToNext = () => {
    const currentReal = selected - 2; // Convert to real badge index
    if (currentReal < items.length - 1) {
      scrollTo(currentReal + 1 + 2); // Convert back to spacer index
    }
  };
  
  // Get electric tier colors - NO BLENDING!
  const getActiveTierColor = () => {
    const realIndex = selected - 2;
    const activeBadge = items[realIndex];
    if (!activeBadge) return "tier-bronze";
    
    switch (activeBadge.tier?.toLowerCase()) {
      case 'legendary': return "tier-legendary";
      case 'diamond': return "tier-diamond";
      case 'platinum': return "tier-platinum";
      case 'gold': return "tier-gold";
      case 'silver': return "tier-silver";
      default: return "tier-bronze";
    }
  };
  
  const getActiveTierGlow = () => {
    const realIndex = selected - 2;
    const activeBadge = items[realIndex];
    if (!activeBadge) return "tier-bronze-glow";
    
    switch (activeBadge.tier?.toLowerCase()) {
      case 'legendary': return "tier-legendary-glow";
      case 'diamond': return "tier-diamond-glow";
      case 'platinum': return "tier-platinum-glow";
      case 'gold': return "tier-gold-glow";
      case 'silver': return "tier-silver-glow";
      default: return "tier-bronze-glow";
    }
  };

  return (
    <div className="w-full relative">
      {/* ELECTRIC Background Glow - Pure Colors Only */}
      <motion.div 
        className="absolute inset-0 rounded-3xl opacity-20 blur-3xl"
        style={{
          backgroundColor: `hsl(var(--${getActiveTierColor()}))`,
        }}
        animate={{
          opacity: [0.1, 0.3, 0.1],
          scale: [1, 1.1, 1],
          boxShadow: [
            `0 0 50px hsl(var(--${getActiveTierGlow()}) / 0.3)`,
            `0 0 100px hsl(var(--${getActiveTierGlow()}) / 0.6)`,
            `0 0 50px hsl(var(--${getActiveTierGlow()}) / 0.3)`
          ]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      {/* ELECTRIC Particles for Legendary */}
      <AnimatePresence>
        {items[selected - 2]?.tier === 'Legendary' && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  backgroundColor: `hsl(var(--tier-legendary))`,
                  boxShadow: `0 0 10px hsl(var(--tier-legendary))`
                }}
                initial={{ 
                  x: Math.random() * 300, 
                  y: Math.random() * 200,
                  opacity: 0 
                }}
                animate={{
                  y: [null, -80],
                  x: [null, Math.random() * 100 - 50],
                  opacity: [0, 1, 0],
                  scale: [0, 1.5, 0]
                }}
                transition={{
                  duration: 4,
                  delay: i * 0.3,
                  repeat: Infinity,
                  ease: "easeOut"
                }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      <div className="relative">
        {/* RAINBOW Progress Bar */}
        <div className="mb-4 h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{
              background: `linear-gradient(90deg, 
                hsl(var(--tier-bronze)), 
                hsl(var(--tier-silver)), 
                hsl(var(--tier-gold)), 
                hsl(var(--tier-platinum)), 
                hsl(var(--tier-diamond)), 
                hsl(var(--tier-legendary)))`
            }}
            animate={{
              width: `${((selected - 1) / items.length) * 100}%`,
              boxShadow: [
                `0 0 10px hsl(var(--${getActiveTierColor()}) / 0.5)`,
                `0 0 20px hsl(var(--${getActiveTierColor()}) / 0.8)`,
                `0 0 10px hsl(var(--${getActiveTierColor()}) / 0.5)`
              ]
            }}
            transition={{ 
              width: { type: "spring", stiffness: 300, damping: 30 },
              boxShadow: { duration: 2, repeat: Infinity }
            }}
          />
        </div>
        
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-8 py-6 px-4">
            {itemsWithSpacers.map((item, i) => {
              const active = i === selected;
              const distance = Math.abs(i - selected);
              
              // Hide spacers completely
              if (item.isSpacer) {
                return <div key={`spacer-${i}`} className="basis-[140px] shrink-0" />;
              }
              
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

        {/* ELECTRIC Navigation Buttons */}
        <motion.button
          className="absolute left-2 top-1/2 -translate-y-1/2 p-3 rounded-full backdrop-blur-sm border-2"
          style={{
            backgroundColor: `hsl(var(--${getActiveTierColor()}) / 0.2)`,
            borderColor: `hsl(var(--${getActiveTierColor()}))`,
            boxShadow: `var(--neon-${getActiveTierColor().replace('tier-', '')})`
          }}
          onClick={scrollToPrevious}
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
          className="absolute right-2 top-1/2 -translate-y-1/2 p-3 rounded-full backdrop-blur-sm border-2"
          style={{
            backgroundColor: `hsl(var(--${getActiveTierColor()}) / 0.2)`,
            borderColor: `hsl(var(--${getActiveTierColor()}))`,
            boxShadow: `var(--neon-${getActiveTierColor().replace('tier-', '')})`
          }}
          onClick={scrollToNext}
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

      {/* ELECTRIC Dots with Pulse */}
      <div className="mt-6 flex justify-center gap-4">
        {items.map((_, i) => {
          const dotSelected = i === selected - 2; // Adjust for spacers
          return (
            <motion.button
              key={i}
              className="relative h-4 w-4 rounded-full transition-all duration-300"
              style={{
                backgroundColor: dotSelected 
                  ? `hsl(var(--${getActiveTierColor()}))` 
                  : "hsl(var(--muted-foreground) / 0.4)"
              }}
              onClick={() => scrollTo(i + 2)} // Adjust for spacers
              aria-label={`Go to slide ${i + 1}`}
              whileHover={{ scale: 1.4 }}
              whileTap={{ scale: 0.8 }}
              animate={dotSelected ? {
                boxShadow: [
                  `0 0 0 0 hsl(var(--${getActiveTierColor()}) / 0.6)`,
                  `0 0 0 12px hsl(var(--${getActiveTierColor()}) / 0)`,
                ]
              } : {}}
              transition={{
                boxShadow: { duration: 1.2, repeat: Infinity }
              }}
            >
              {dotSelected && (
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{
                    backgroundColor: `hsl(var(--${getActiveTierGlow()}))`
                  }}
                  animate={{
                    scale: [1, 1.8, 1],
                    opacity: [0.9, 0.3, 0.9]
                  }}
                  transition={{
                    duration: 1.8,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}