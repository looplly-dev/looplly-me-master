import { Badge as BadgeType } from '@/hooks/useBadgeService';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Eye, Power, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { BadgePreview } from './BadgePreview';
import { useBadgeService } from '@/hooks/useBadgeService';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface BadgeCardProps {
  badge: BadgeType;
  onUpdate: () => void;
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

export function BadgeCard({ badge, onUpdate }: BadgeCardProps) {
  const { toast } = useToast();
  const { deleteBadge } = useBadgeService();
  const [isToggling, setIsToggling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showToggleConfirm, setShowToggleConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleToggleStatus = async () => {
    setIsToggling(true);
    try {
      const { error } = await supabase
        .from('badge_catalog')
        .update({ is_active: !badge.is_active })
        .eq('id', badge.id);

      if (error) throw error;

      toast({
        title: badge.is_active ? 'Badge Deactivated' : 'Badge Activated',
        description: badge.is_active
          ? 'Badge is now hidden from users'
          : 'Badge is now visible to users',
      });

      onUpdate();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update badge status',
        variant: 'destructive',
      });
    } finally {
      setIsToggling(false);
      setShowToggleConfirm(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteBadge(badge.id, badge.icon_url || undefined);

      toast({
        title: 'Badge Deleted',
        description: `${badge.name} has been permanently removed`,
      });

      onUpdate();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete badge',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const initiateToggle = () => {
    if (badge.is_active) {
      setShowToggleConfirm(true);
    } else {
      handleToggleStatus();
    }
  };

  return (
    <>
      <Card className="overflow-hidden">
        <CardContent className="p-6 space-y-4">
          {/* Status Indicator */}
          <div className="flex items-center justify-between">
            {badge.is_active ? (
              <Badge variant="default" className="gap-1 bg-green-500">
                <div className="w-2 h-2 rounded-full bg-white" />
                Active
              </Badge>
            ) : (
              <Badge variant="secondary" className="gap-1">
                <div className="w-2 h-2 rounded-full bg-gray-400" />
                Inactive
              </Badge>
            )}
            <span className="text-xs text-muted-foreground">
              {new Date(badge.created_at).toLocaleDateString()}
            </span>
          </div>

          {/* Badge Image */}
          <div className="flex justify-center">
            {badge.icon_url ? (
              <img
                src={badge.icon_url}
                alt={badge.name}
                className="w-32 h-32 object-contain"
              />
            ) : (
              <div className="w-32 h-32 bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
                No Image
              </div>
            )}
          </div>

          {/* Badge Info */}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">{badge.name}</h3>
            <div className="flex flex-wrap gap-2 text-sm">
              <span>
                {TIER_EMOJI[badge.tier || 'bronze']} {badge.tier}
              </span>
              {badge.category && (
                <span>• {CATEGORY_EMOJI[badge.category.toLowerCase()]} {badge.category}</span>
              )}
            </div>
            {badge.rep_points !== undefined && (
              <p className="text-sm text-muted-foreground">
                {badge.rep_points} REP • {badge.rarity || 'Common'}
              </p>
            )}
            {badge.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {badge.description}
              </p>
            )}
          </div>
        </CardContent>

        <CardFooter className="bg-muted/50 p-4 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPreview(true)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.dispatchEvent(new CustomEvent('edit-badge', { detail: badge }))}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button
            variant={badge.is_active ? 'destructive' : 'default'}
            size="sm"
            className="flex-1"
            onClick={initiateToggle}
            disabled={isToggling}
          >
            <Power className="h-4 w-4 mr-2" />
            {badge.is_active ? 'Deactivate' : 'Activate'}
          </Button>
        </CardFooter>
      </Card>

      <BadgePreview
        badge={badge}
        open={showPreview}
        onOpenChange={setShowPreview}
      />

      <AlertDialog open={showToggleConfirm} onOpenChange={setShowToggleConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate Badge?</AlertDialogTitle>
            <AlertDialogDescription>
              This will hide the badge from user dashboards. Users who have already earned this badge will keep it, but no new users can earn it while inactive.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleToggleStatus}>
              Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Badge Permanently?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{badge.name}</strong> from the catalog. 
              Users who have earned this badge will lose it. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
