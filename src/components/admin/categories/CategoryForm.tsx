import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Category } from '@/hooks/useCategoryManagement';
import { useDecayConfig } from '@/hooks/useDecayConfig';

interface CategoryFormProps {
  category: Category | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (category: Omit<Category, 'id' | 'question_count'> | { id: string; updates: Partial<Category> }) => void;
  canEditLevel: boolean;
}

export const CategoryForm = ({ category, isOpen, onClose, onSave, canEditLevel }: CategoryFormProps) => {
  const { configs } = useDecayConfig();
  const [formData, setFormData] = useState({
    name: '',
    display_name: '',
    description: '',
    icon: '',
    level: 2,
    display_order: 0,
    default_decay_config_key: '',
    is_active: true
  });

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        display_name: category.display_name,
        description: category.description || '',
        icon: category.icon || '',
        level: category.level,
        display_order: category.display_order,
        default_decay_config_key: category.default_decay_config_key || '',
        is_active: category.is_active
      });
    } else {
      setFormData({
        name: '',
        display_name: '',
        description: '',
        icon: '',
        level: 2,
        display_order: 0,
        default_decay_config_key: '',
        is_active: true
      });
    }
  }, [category, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (category) {
      onSave({ id: category.id, updates: formData });
    } else {
      onSave(formData);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {category ? 'Edit Category' : 'Create New Category'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="display_name">Display Name *</Label>
              <Input
                id="display_name"
                value={formData.display_name}
                onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                placeholder="Demographics"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Internal Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="demographics"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what this category contains..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="icon">Icon (emoji)</Label>
              <Input
                id="icon"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                placeholder="👤"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="level">Level *</Label>
              <Select
                value={formData.level.toString()}
                onValueChange={(val) => setFormData({ ...formData, level: parseInt(val) })}
                disabled={!canEditLevel && category?.level === 1}
              >
                <SelectTrigger id="level">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Level 1</SelectItem>
                  <SelectItem value="2">Level 2</SelectItem>
                  <SelectItem value="3">Level 3</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="display_order">Display Order *</Label>
              <Input
                id="display_order"
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                min={0}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="decay_config">Default Decay Config</Label>
            <Select
              value={formData.default_decay_config_key}
              onValueChange={(val) => setFormData({ ...formData, default_decay_config_key: val })}
            >
              <SelectTrigger id="decay_config">
                <SelectValue placeholder="Select decay config..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {configs?.map((config) => (
                  <SelectItem key={config.id} value={config.config_key}>
                    {config.config_key} ({config.interval_days} days)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
            <Label htmlFor="is_active">Active</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {category ? 'Update' : 'Create'} Category
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
