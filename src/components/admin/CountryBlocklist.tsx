import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Plus, Trash2, Edit, Globe, Check, ChevronsUpDown } from 'lucide-react';
import { countries } from '@/data/countries';
import { format } from 'date-fns';
import { auditActions } from '@/utils/auditLogger';
import { cn } from '@/lib/utils';
import type { Country } from '@/types/auth';

interface BlockedCountry {
  id: string;
  country_code: string;
  country_name: string;
  dial_code: string;
  reason: string;
  blocked_at: string;
  created_at: string;
}

export function CountryBlocklist() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { authState } = useAuth();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isUnblockDialogOpen, setIsUnblockDialogOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<BlockedCountry | null>(null);
  const [selectedNewCountry, setSelectedNewCountry] = useState<Country | null>(null);
  const [open, setOpen] = useState(false);
  const [newReason, setNewReason] = useState('');
  const [editReason, setEditReason] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch blocked countries
  const { data: blockedCountries, isLoading } = useQuery({
    queryKey: ['country-blocklist'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('country_blocklist')
        .select('*')
        .order('country_name');
      
      if (error) throw error;
      return data as BlockedCountry[];
    },
  });

  // Add country mutation
  const addCountryMutation = useMutation({
    mutationFn: async () => {
      if (!selectedNewCountry) throw new Error('Country not selected');

      const { error } = await supabase
        .from('country_blocklist')
        .insert({
          country_code: selectedNewCountry.code,
          dial_code: selectedNewCountry.dialCode,
          country_name: selectedNewCountry.name,
          reason: newReason,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      // Log the action
      if (authState.user?.id && selectedNewCountry) {
        auditActions.countryBlock(
          authState.user.id, 
          selectedNewCountry.code, 
          selectedNewCountry.name, 
          newReason
        );
      }

      toast({
        title: 'Country blocked',
        description: 'New registrations from this country will be blocked.',
      });
      queryClient.invalidateQueries({ queryKey: ['country-blocklist'] });
      setIsAddDialogOpen(false);
      setSelectedNewCountry(null);
      setNewReason('');
      setOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Update reason mutation
  const updateReasonMutation = useMutation({
    mutationFn: async () => {
      if (!selectedCountry) throw new Error('No country selected');

      const { error } = await supabase
        .from('country_blocklist')
        .update({ reason: editReason })
        .eq('id', selectedCountry.id);

      if (error) throw error;
    },
    onSuccess: () => {
      // Log the action
      if (authState.user?.id && selectedCountry) {
        auditActions.countryReasonUpdate(
          authState.user.id,
          selectedCountry.country_code,
          selectedCountry.country_name,
          selectedCountry.reason,
          editReason
        );
      }

      toast({
        title: 'Reason updated',
        description: 'The blocking reason has been updated.',
      });
      queryClient.invalidateQueries({ queryKey: ['country-blocklist'] });
      setIsEditDialogOpen(false);
      setSelectedCountry(null);
      setEditReason('');
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Unblock country mutation
  const unblockCountryMutation = useMutation({
    mutationFn: async () => {
      if (!selectedCountry) throw new Error('No country selected');

      const { error } = await supabase
        .from('country_blocklist')
        .delete()
        .eq('id', selectedCountry.id);

      if (error) throw error;
    },
    onSuccess: () => {
      // Log the action
      if (authState.user?.id && selectedCountry) {
        auditActions.countryUnblock(
          authState.user.id,
          selectedCountry.country_code,
          selectedCountry.country_name
        );
      }

      toast({
        title: 'Country unblocked',
        description: 'Registrations from this country are now allowed.',
      });
      queryClient.invalidateQueries({ queryKey: ['country-blocklist'] });
      setIsUnblockDialogOpen(false);
      setSelectedCountry(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleAddCountry = () => {
    if (!selectedNewCountry || !newReason.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please select a country and provide a reason.',
        variant: 'destructive',
      });
      return;
    }
    addCountryMutation.mutate();
  };

  const handleEditClick = (country: BlockedCountry) => {
    setSelectedCountry(country);
    setEditReason(country.reason);
    setIsEditDialogOpen(true);
  };

  const handleUnblockClick = (country: BlockedCountry) => {
    setSelectedCountry(country);
    setIsUnblockDialogOpen(true);
  };

  // Get available countries (not already blocked)
  const blockedCodes = new Set(blockedCountries?.map((c) => c.country_code) || []);
  const availableCountries = countries.filter((c) => !blockedCodes.has(c.code));

  // Filter blocked countries by search term
  const filteredCountries = blockedCountries?.filter((c) =>
    c.country_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.dial_code.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      {/* Search and Add */}
      <div className="flex justify-between items-center gap-4">
        <Input
          placeholder="Search by country name or dial code..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Block Country
        </Button>
      </div>

      {/* Blocked Countries Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Blocked Countries ({filteredCountries?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : filteredCountries && filteredCountries.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Country</TableHead>
                  <TableHead>ISO</TableHead>
                  <TableHead>Dial Code</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Blocked Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCountries.map((country) => (
                  <TableRow key={country.id}>
                    <TableCell className="font-medium">{country.country_name}</TableCell>
                    <TableCell>
                      <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                        {country.country_code}
                      </span>
                    </TableCell>
                    <TableCell>{country.dial_code}</TableCell>
                    <TableCell className="max-w-md">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {country.reason}
                      </p>
                    </TableCell>
                    <TableCell>
                      {format(new Date(country.blocked_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditClick(country)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleUnblockClick(country)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              No blocked countries found. Click "Block Country" to add restrictions.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Add Country Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Block Country</DialogTitle>
            <DialogDescription>
              Prevent new registrations from a specific country. Existing users will not be affected.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Country</Label>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                  >
                    {selectedNewCountry
                      ? `${selectedNewCountry.flag} ${selectedNewCountry.name} (${selectedNewCountry.dialCode})`
                      : "Search countries..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search by name, code, or dial..." />
                    <CommandList>
                      <CommandEmpty>No countries found.</CommandEmpty>
                      <CommandGroup>
                        {availableCountries.map((country) => (
                          <CommandItem
                            key={country.code}
                            value={`${country.name} ${country.dialCode} ${country.code}`}
                            onSelect={() => {
                              setSelectedNewCountry(country);
                              setOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedNewCountry?.code === country.code ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {country.flag} {country.name} ({country.dialCode})
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>Reason *</Label>
              <Textarea
                placeholder="e.g., Data localization laws require onshore storage"
                value={newReason}
                onChange={(e) => setNewReason(e.target.value)}
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                This reason will be logged for audit purposes.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddCountry}
              disabled={addCountryMutation.isPending}
            >
              {addCountryMutation.isPending ? 'Blocking...' : 'Block Country'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Reason Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Blocking Reason</DialogTitle>
            <DialogDescription>
              Update the reason for blocking {selectedCountry?.country_name}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Reason *</Label>
            <Textarea
              value={editReason}
              onChange={(e) => setEditReason(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => updateReasonMutation.mutate()}
              disabled={updateReasonMutation.isPending}
            >
              {updateReasonMutation.isPending ? 'Updating...' : 'Update Reason'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unblock Confirmation Dialog */}
      <AlertDialog open={isUnblockDialogOpen} onOpenChange={setIsUnblockDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unblock {selectedCountry?.country_name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will allow new registrations from {selectedCountry?.country_name}. Are you sure you want to proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => unblockCountryMutation.mutate()}
              disabled={unblockCountryMutation.isPending}
            >
              {unblockCountryMutation.isPending ? 'Unblocking...' : 'Unblock Country'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
