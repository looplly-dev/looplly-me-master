import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useCategoryManagement, Category } from '@/hooks/useCategoryManagement';
import { useRole } from '@/hooks/useRole';
import { CategoryCard } from './CategoryCard';
import { CategoryForm } from './CategoryForm';
import { Skeleton } from '@/components/ui/skeleton';

export const CategoryManagement = () => {
  const { categories, isLoading, createCategory, updateCategory } = useCategoryManagement();
  const { isSuperAdmin } = useRole();
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const groupedCategories = categories?.reduce((acc, cat) => {
    if (!acc[cat.level]) acc[cat.level] = [];
    acc[cat.level].push(cat);
    return acc;
  }, {} as Record<number, Category[]>);

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setSelectedCategory(null);
    setIsFormOpen(true);
  };

  const handleSave = (data: any) => {
    if ('id' in data) {
      updateCategory.mutate({ id: data.id, updates: data.updates });
    } else {
      createCategory.mutate(data);
    }
    setIsFormOpen(false);
  };

  const isSuperAdminUser = isSuperAdmin();

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((level) => (
          <div key={level} className="space-y-3">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Profile Categories</h2>
          <p className="text-muted-foreground">
            Organize and manage profile question categories
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      {!isSuperAdminUser && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You can view and edit Level 2 & 3 categories. Only Super Admins can modify Level 1 categories.
          </AlertDescription>
        </Alert>
      )}

      {[1, 2, 3].map((level) => {
        const levelCategories = groupedCategories?.[level] || [];
        if (levelCategories.length === 0) return null;

        return (
          <div key={level} className="space-y-3">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-semibold">Level {level}</h3>
              <span className="text-sm text-muted-foreground">
                ({levelCategories.length} {levelCategories.length === 1 ? 'category' : 'categories'})
              </span>
            </div>

            <div className="space-y-2">
              {levelCategories.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  onEdit={handleEdit}
                  canEdit={level === 1 ? isSuperAdminUser : true}
                />
              ))}
            </div>
          </div>
        );
      })}

      <CategoryForm
        category={selectedCategory}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSave}
        canEditLevel={isSuperAdminUser}
      />
    </div>
  );
};
