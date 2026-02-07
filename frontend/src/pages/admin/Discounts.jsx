import { useState, useEffect } from 'react';
import { Layout } from '../../components/Layout/Layout.jsx';
import { PageHeader } from '../../components/ui/PageHeader.jsx';
import { discountService } from '../../lib/services/discountService.js';
import { Percent, Search, Loader2, Plus, Edit2, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { useToast } from '../../hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../components/Modal.jsx';

export default function Discounts() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'PERCENTAGE',
    value: '',
    startDate: '',
    endDate: '',
    isActive: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const result = await discountService.getAll();
      if (result.success && Array.isArray(result.data)) {
        setDiscounts(result.data);
      } else {
        setDiscounts([]);
      }
    } catch (error) {
      setDiscounts([]);
      toast({
        title: 'Error',
        description: 'Failed to load discounts',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout type="admin">
        <PageHeader title="Discounts" />
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  // Get unique discount types
  const discountTypes = ['All', ...new Set((discounts || []).map(d => d.type).filter(Boolean))];

  // Filter discounts based on search and type
  const filteredDiscounts = (discounts || []).filter(discount => {
    const matchesSearch = discount.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'All' || discount.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const openAddModal = () => {
    setEditingDiscount(null);
    const today = new Date().toISOString().split('T')[0];
    const nextYear = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    setFormData({
      name: '',
      type: 'PERCENTAGE',
      value: '',
      startDate: today,
      endDate: nextYear,
      isActive: true
    });
    setShowModal(true);
  };

  const openEditModal = (discount) => {
    setEditingDiscount(discount);
    setFormData({
      name: discount.name,
      type: discount.type,
      value: discount.value,
      startDate: discount.startDate?.split('T')[0] || '',
      endDate: discount.endDate?.split('T')[0] || '',
      isActive: discount.isActive
    });
    setShowModal(true);
  };

  const handleDelete = async (discountId) => {
    if (!confirm('Are you sure you want to delete this discount?')) return;

    try {
      const result = await discountService.delete(discountId);
      if (result.success) {
        toast({
          title: 'Success',
          description: 'Discount deleted successfully'
        });
        loadData();
      } else {
        throw new Error(result.error || 'Failed to delete discount');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const discountData = {
        name: formData.name,
        type: formData.type,
        value: parseFloat(formData.value),
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        isActive: formData.isActive
      };

      let result;
      if (editingDiscount) {
        result = await discountService.update(editingDiscount.id, discountData);
      } else {
        result = await discountService.create(discountData);
      }

      if (result.success) {
        toast({
          title: 'Success',
          description: `Discount ${editingDiscount ? 'updated' : 'created'} successfully`
        });
        setShowModal(false);
        loadData();
      } else {
        throw new Error(result.error || 'Failed to save discount');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  return (
    <Layout type="admin">
      <PageHeader title="Discounts" />

      {/* Search and Filter Section */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            type="text"
            placeholder="Search discounts by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Button onClick={openAddModal} className="whitespace-nowrap">
          <Plus size={18} className="mr-2" />
          Add Discount
        </Button>
        
        <div className="flex gap-2 flex-wrap">
          {discountTypes.map(type => (
            <Button
              key={type}
              variant={typeFilter === type ? "default" : "outline"}
              onClick={() => setTypeFilter(type)}
              size="sm"
              className={typeFilter === type ? "bg-primary text-white" : ""}
            >
              {type}
            </Button>
          ))}
        </div>
      </div>

      {/* Discounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDiscounts.map(discount => (
          <div
            key={discount.id}
            className="bg-card border border-border rounded-lg p-6 hover:shadow-lg hover:border-primary/50 transition-all group relative"
          >
            {/* Action Buttons */}
            <div className="absolute top-4 right-4 flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => openEditModal(discount)}
                className="h-8 w-8 p-0"
              >
                <Edit2 size={16} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(discount.id)}
                className="h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground"
              >
                <Trash2 size={16} />
              </Button>
            </div>

            {/* Discount Icon */}
            <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
              <Percent size={32} className="text-primary" />
            </div>

            {/* Discount Info */}
            <div className="mb-4 pr-16">
              <h3 className="text-xl font-bold text-foreground mb-2">{discount.name}</h3>
              <div className="flex gap-2">
                <span className="inline-block px-3 py-1 bg-muted rounded-full text-xs font-medium text-muted-foreground">
                  {discount.type}
                </span>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                  discount.isActive 
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  {discount.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            {/* Discount Value */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Value</span>
                <span className="text-2xl font-bold text-primary">
                  {discount.type === 'PERCENTAGE' ? `${discount.value}%` : `₹${discount.value}`}
                </span>
              </div>
            </div>

            {/* Date Range */}
            <div className="pt-4 border-t border-border">
              <span className="text-xs text-muted-foreground">
                Valid: {new Date(discount.startDate).toLocaleDateString()} - {new Date(discount.endDate).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* No Results */}
      {filteredDiscounts.length === 0 && (
        <div className="text-center py-12">
          <Percent size={48} className="mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Discounts Found</h3>
          <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
        </div>
      )}

      {/* Add/Edit Discount Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingDiscount ? 'Edit Discount' : 'Add New Discount'}</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Discount Name *
              </label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="e.g., Summer Sale 20%"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Discount Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                required
              >
                <option value="PERCENTAGE">PERCENTAGE</option>
                <option value="FIXED">FIXED</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Value {formData.type === 'PERCENTAGE' ? '(%)' : '(₹)'} *
              </label>
              <Input
                type="number"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                required
                min="0"
                step={formData.type === 'PERCENTAGE' ? '1' : '0.01'}
                max={formData.type === 'PERCENTAGE' ? '100' : undefined}
                placeholder={formData.type === 'PERCENTAGE' ? 'e.g., 20' : 'e.g., 100'}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Start Date *
                </label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  End Date *
                </label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 rounded border-input"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-foreground">
                Active
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingDiscount ? 'Update' : 'Create'} Discount
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
