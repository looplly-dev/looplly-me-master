import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AgentFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  categoryFilter: string;
  onCategoryChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
}

const categories = [
  'All Categories',
  'Security',
  'Communication',
  'Finance',
  'Analytics',
  'Revenue',
  'Growth',
  'Engagement',
  'Intelligence',
];

const statuses = ['All Statuses', 'active', 'inactive', 'testing'];

const sortOptions = [
  { value: 'name', label: 'Name' },
  { value: 'category', label: 'Category' },
  { value: 'status', label: 'Status' },
  { value: 'executions', label: 'Executions' },
];

export function AgentFilters({
  searchQuery,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  statusFilter,
  onStatusChange,
  sortBy,
  onSortChange,
}: AgentFiltersProps) {
  return (
    <div className="flex flex-wrap gap-4 mb-6">
      <div className="flex-1 min-w-[250px]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search agents by name or purpose..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Select value={categoryFilter} onValueChange={onCategoryChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          {categories.map((cat) => (
            <SelectItem key={cat} value={cat}>
              {cat}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={statusFilter} onValueChange={onStatusChange}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          {statuses.map((status) => (
            <SelectItem key={status} value={status}>
              {status}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={sortBy} onValueChange={onSortChange}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          {sortOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
