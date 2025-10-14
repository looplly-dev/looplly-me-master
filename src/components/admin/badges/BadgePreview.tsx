import { Badge as BadgeType } from '@/hooks/useBadgeService';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, RefreshCw, X, Loader2 } from 'lucide-react';

interface BadgePreviewProps {
  badge: BadgeType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isPreview?: boolean;
  onApprove?: () => void;
  onRegenerate?: () => void;
  isApproving?: boolean;
  isRegenerating?: boolean;
}

const TIER_EMOJI: Record<string, string> = {
  bronze: '🥉',
  silver: '🥈',
  gold: '🥇',
  platinum: '💎',
  diamond: '💠',
  elite: '👑',
};

const CATEGORY_EMOJI: Record<string, string> = {
  social: '👥',
  speed: '⚡',
  perfection: '✨',
  exploration: '🔍',
};

export function BadgePreview({
  badge,
  open,
  onOpenChange,
  isPreview = false,
  onApprove,
  onRegenerate,
  isApproving = false,
  isRegenerating = false,
}: BadgePreviewProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isPreview ? 'Badge Preview' : badge.name}
          </DialogTitle>
          {isPreview && (
            <DialogDescription>
              Review your badge before saving it to the catalog
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Badge Image */}
          <div className="flex justify-center">
            {badge.icon_url ? (
              <img
                src={badge.icon_url}
                alt={badge.name}
                className="w-64 h-64 object-contain"
              />
            ) : (
              <div className="w-64 h-64 bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
                No Image
              </div>
            )}
          </div>

          {/* Badge Details */}
          <div className="space-y-4 text-center">
            <div>
              <h3 className="text-2xl font-bold">{badge.name}</h3>
              <div className="flex items-center justify-center gap-2 mt-2">
                <span className="text-lg">
                  {TIER_EMOJI[badge.tier || 'bronze']} {badge.tier}
                </span>
                {badge.category && (
                  <>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-lg">
                      {CATEGORY_EMOJI[badge.category.toLowerCase()]} {badge.category}
                    </span>
                  </>
                )}
              </div>
            </div>

            {badge.rep_points !== undefined && (
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Badge variant="secondary">{badge.rep_points} REP</Badge>
                <span>•</span>
                <Badge variant="secondary">{badge.rarity || 'Common'}</Badge>
              </div>
            )}

            {badge.description && (
              <p className="text-muted-foreground">
                {badge.description}
              </p>
            )}

            {badge.requirement && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium">Requirement:</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {badge.requirement}
                </p>
              </div>
            )}

            {!isPreview && (
              <div className="flex items-center justify-center gap-2">
                {badge.is_active ? (
                  <Badge variant="default" className="gap-1 bg-green-500">
                    <div className="w-2 h-2 rounded-full bg-card" />
                    Active
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="gap-1">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                    Inactive
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>

        {isPreview && (
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isApproving || isRegenerating}
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            {onRegenerate && (
              <Button
                variant="secondary"
                onClick={onRegenerate}
                disabled={isApproving || isRegenerating}
              >
                {isRegenerating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                Regenerate
              </Button>
            )}
            {onApprove && (
              <Button onClick={onApprove} disabled={isApproving || isRegenerating}>
                {isApproving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Check className="mr-2 h-4 w-4" />
                )}
                Approve & Save
              </Button>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
