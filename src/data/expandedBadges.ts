// Extended badge categories for Pokémon-style collection system
export const expandedBadgeCategories = {
  socialConnector: [
    { 
      id: 'first_referral', 
      name: 'Network Pioneer', 
      description: 'Invited your first friend to join the earning journey', 
      tier: 'Bronze', 
      repPoints: 15, 
      earned: true,
      rarity: 'Common',
      icon: 'Users',
      shape: 'circle' as const,
      category: 'Social',
      earnedAt: '2024-01-08'
    },
    { 
      id: 'social_butterfly', 
      name: 'Connection Catalyst', 
      description: 'Successfully referred 5 active members to the community', 
      tier: 'Silver', 
      repPoints: 50, 
      earned: false,
      rarity: 'Rare',
      icon: 'Users',
      shape: 'hexagon' as const,
      category: 'Social',
      requirement: 5
    },
    { 
      id: 'influence_master', 
      name: 'Community Leader', 
      description: 'Built a network of 10+ active referrals - true leadership', 
      tier: 'Gold', 
      repPoints: 100, 
      earned: false,
      rarity: 'Epic',
      icon: 'Crown',
      shape: 'star' as const,
      category: 'Social',
      requirement: 10
    },
    { 
      id: 'viral_marketer', 
      name: 'Viral Champion', 
      description: 'Created a viral network of 25+ successful referrals', 
      tier: 'Platinum', 
      repPoints: 250, 
      earned: false,
      rarity: 'Epic',
      icon: 'Sparkles',
      shape: 'diamond' as const,
      category: 'Social',
      requirement: 25
    },
    { 
      id: 'network_god', 
      name: 'Network Deity', 
      description: 'Legendary achievement: 50+ active referrals', 
      tier: 'Diamond', 
      repPoints: 500, 
      earned: false,
      rarity: 'Legendary',
      icon: 'Crown',
      shape: 'star' as const,
      category: 'Social',
      requirement: 50
    }
  ],
  
  speedDemon: [
    { 
      id: 'quick_start', 
      name: 'Lightning Rookie', 
      description: 'Completed your first survey in record time', 
      tier: 'Bronze', 
      repPoints: 10, 
      earned: true,
      rarity: 'Common',
      icon: 'Zap',
      shape: 'circle' as const,
      category: 'Speed',
      earnedAt: '2024-01-05'
    },
    { 
      id: 'speed_streak', 
      name: 'Velocity Master', 
      description: 'Completed 10 surveys under optimal time with perfect quality', 
      tier: 'Silver', 
      repPoints: 40, 
      earned: true,
      rarity: 'Rare',
      icon: 'Zap',
      shape: 'diamond' as const,
      category: 'Speed',
      requirement: 10,
      earnedAt: '2024-01-12'
    },
    { 
      id: 'time_lord', 
      name: 'Efficiency Sage', 
      description: 'Mastered the perfect balance: fast completion + high quality', 
      tier: 'Gold', 
      repPoints: 75, 
      earned: false,
      rarity: 'Epic',
      icon: 'Target',
      shape: 'hexagon' as const,
      category: 'Speed',
      requirement: 25
    },
    { 
      id: 'instant_expert', 
      name: 'Quantum Processor', 
      description: 'Achieved superhuman survey completion speeds (50+ optimal surveys)', 
      tier: 'Platinum', 
      repPoints: 150, 
      earned: false,
      rarity: 'Epic',
      icon: 'Sparkles',
      shape: 'star' as const,
      category: 'Speed',
      requirement: 50
    },
    { 
      id: 'flash_legend', 
      name: 'Speed Force Avatar', 
      description: 'Transcended time itself: 100+ lightning-fast perfect surveys', 
      tier: 'Diamond', 
      repPoints: 300, 
      earned: false,
      rarity: 'Legendary',
      icon: 'Crown',
      shape: 'diamond' as const,
      category: 'Speed',
      requirement: 100
    }
  ],
  
  perfectionist: [
    { 
      id: 'first_perfect', 
      name: 'Quality Seeker', 
      description: 'Achieved your first perfect 100% quality score', 
      tier: 'Bronze', 
      repPoints: 20, 
      earned: true,
      rarity: 'Common',
      icon: 'Star',
      shape: 'circle' as const,
      category: 'Perfection',
      earnedAt: '2024-01-06'
    },
    { 
      id: 'consistency_king', 
      name: 'Precision Elite', 
      description: 'Maintained 95%+ quality across 25 consecutive surveys', 
      tier: 'Silver', 
      repPoints: 60, 
      earned: true,
      rarity: 'Rare',
      icon: 'Target',
      shape: 'hexagon' as const,
      category: 'Perfection',
      requirement: 25,
      earnedAt: '2024-01-14'
    },
    { 
      id: 'flawless_master', 
      name: 'Perfection Incarnate', 
      description: 'Achieved the impossible: 50 perfect surveys in a row', 
      tier: 'Gold', 
      repPoints: 120, 
      earned: false,
      rarity: 'Epic',
      icon: 'Diamond',
      shape: 'star' as const,
      category: 'Perfection',
      requirement: 50
    },
    { 
      id: 'quality_deity', 
      name: 'Excellence Transcendent', 
      description: 'Godlike achievement: 100 consecutive perfect surveys', 
      tier: 'Platinum', 
      repPoints: 250, 
      earned: false,
      rarity: 'Epic',
      icon: 'Crown',
      shape: 'diamond' as const,
      category: 'Perfection',
      requirement: 100
    },
    { 
      id: 'perfection_myth', 
      name: 'Mythical Perfectionist', 
      description: 'Legendary status: 200+ perfect surveys - you are the standard', 
      tier: 'Diamond', 
      repPoints: 500, 
      earned: false,
      rarity: 'Legendary',
      icon: 'Sparkles',
      shape: 'star' as const,
      category: 'Perfection',
      requirement: 200
    }
  ],
  
  explorer: [
    { 
      id: 'category_curious', 
      name: 'Survey Scout', 
      description: 'Explored your first 3 different survey categories', 
      tier: 'Bronze', 
      repPoints: 15, 
      earned: true,
      rarity: 'Common',
      icon: 'MapPin',
      shape: 'circle' as const,
      category: 'Exploration',
      requirement: 3,
      earnedAt: '2024-01-07'
    },
    { 
      id: 'diversity_champion', 
      name: 'Category Conqueror', 
      description: 'Mastered 10+ different survey categories - true versatility', 
      tier: 'Silver', 
      repPoints: 45, 
      earned: false,
      rarity: 'Rare',
      icon: 'Award',
      shape: 'hexagon' as const,
      category: 'Exploration',
      requirement: 10
    },
    { 
      id: 'universal_solver', 
      name: 'Research Renaissance', 
      description: 'Conquered every available survey category - ultimate explorer', 
      tier: 'Gold', 
      repPoints: 90, 
      earned: false,
      rarity: 'Epic',
      icon: 'Trophy',
      shape: 'star' as const,
      category: 'Exploration',
      requirement: 15
    },
    { 
      id: 'global_navigator', 
      name: 'Worldwide Wanderer', 
      description: 'Completed surveys in multiple countries/regions', 
      tier: 'Platinum', 
      repPoints: 180, 
      earned: false,
      rarity: 'Epic',
      icon: 'MapPin',
      shape: 'diamond' as const,
      category: 'Exploration',
      requirement: 5
    },
    { 
      id: 'dimension_walker', 
      name: 'Omni-Explorer', 
      description: 'Transcended boundaries: surveys across all platforms and formats', 
      tier: 'Diamond', 
      repPoints: 350, 
      earned: false,
      rarity: 'Legendary',
      icon: 'Sparkles',
      shape: 'star' as const,
      category: 'Exploration',
      requirement: 25
    }
  ]
};