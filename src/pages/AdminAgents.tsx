import { useState } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AdminLayout from '@/components/admin/AdminLayout';
import { AgentGrid } from '@/components/admin/agents/AgentGrid';
import { AgentsDashboard } from '@/components/admin/agents/AgentsDashboard';
import { AgentFilters } from '@/components/admin/agents/AgentFilters';

function AdminAgentsContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [sortBy, setSortBy] = useState('category');

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">AI Agents</h1>
        <p className="text-muted-foreground">
          Monitor and manage automated intelligence agents powering the Looplly ecosystem.
        </p>
      </div>

      <AgentsDashboard />

      <AgentFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      <AgentGrid
        searchQuery={searchQuery}
        categoryFilter={categoryFilter}
        statusFilter={statusFilter}
        sortBy={sortBy}
      />
    </div>
  );
}

export default function AdminAgents() {
  return (
    <ProtectedRoute requiredRole="admin">
      <AdminLayout>
        <AdminAgentsContent />
      </AdminLayout>
    </ProtectedRoute>
  );
}
