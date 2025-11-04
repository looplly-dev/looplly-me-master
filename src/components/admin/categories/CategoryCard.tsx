import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, GripVertical, Users } from 'lucide-react';
import { Category } from '@/hooks/useCategoryManagement';

interface CategoryCardProps {
  category: Category;
  onEdit: (category: Category) => void;
  canEdit: boolean;
  isDragging?: boolean;
}

export const CategoryCard = ({ category, onEdit, canEdit, isDragging }: CategoryCardProps) => {
  return (
    <Card className={`p-4 transition-all ${isDragging ? 'opacity-50' : ''}`}>
      <div className="flex items-start gap-4">
        {canEdit && (
          <div className="cursor-grab active:cursor-grabbing pt-1">
            <GripVertical className="h-5 w-5 text-muted-foreground" />
          </div>
        )}
        
        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              {category.icon && (
                <span className="text-2xl">{category.icon}</span>
              )}
              <div>
                <h4 className="font-semibold">{category.display_name}</h4>
                <p className="text-sm text-muted-foreground">{category.name}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {!category.is_active && (
                <Badge variant="outline">Inactive</Badge>
              )}
              <Badge variant="secondary">
                Level {category.level}
              </Badge>
              {canEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(category)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {category.description && (
            <p className="text-sm text-muted-foreground">{category.description}</p>
          )}

          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                {category.question_count || 0} questions
              </span>
            </div>
            
            {category.default_decay_config_key && (
              <Badge variant="outline" className="text-xs">
                Decay: {category.default_decay_config_key}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
