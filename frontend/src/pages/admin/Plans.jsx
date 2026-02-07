import { useState } from 'react';
import { Layout } from '../../components/Layout/Layout.jsx';
import { PageHeader } from '../../components/ui/PageHeader.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Label } from '../../components/ui/Label.jsx';
import { mockPlans } from '../../data/mockData.js';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { cn } from '../../lib/utils.js';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../components/Modal.jsx';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/Select.jsx';

export default function AdminPlans() {
  const [plans, setPlans] = useState(mockPlans);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    billingPeriod: 'Monthly',
    minQty: '1',
    startDate: '',
    endDate: '',
  });

  const isPlanExpired = (endDate) => new Date(endDate) < new Date();

  const openCreateModal = () => {
    setEditingPlan(null);
    setFormData({
      name: '',
      price: '',
      billingPeriod: 'Monthly',
      minQty: '1',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });
    setIsModalOpen(true);
  };

  const openEditModal = (plan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      price: plan.price.toString(),
      billingPeriod: plan.billingPeriod,
      minQty: plan.minQty.toString(),
      startDate: new Date(plan.startDate).toISOString().split('T')[0],
      endDate: new Date(plan.endDate).toISOString().split('T')[0],
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editingPlan) {
      setPlans((prev) =>
        prev.map((p) =>
          p.id === editingPlan.id
            ? {
                ...p,
                name: formData.name,
                price: parseFloat(formData.price),
                billingPeriod: formData.billingPeriod,
                minQty: parseInt(formData.minQty),
                startDate: new Date(formData.startDate),
                endDate: new Date(formData.endDate),
              }
            : p
        )
      );
    } else {
      const newPlan = {
        id: Math.max(...plans.map((p) => p.id)) + 1,
        name: formData.name,
        price: parseFloat(formData.price),
        billingPeriod: formData.billingPeriod,
        minQty: parseInt(formData.minQty),
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
      };
      setPlans((prev) => [...prev, newPlan]);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this plan?')) {
      setPlans((prev) => prev.filter((p) => p.id !== id));
    }
  };

  return (
    <Layout type="admin">
      <PageHeader
        title="Plans"
        action={
          <Button onClick={openCreateModal} className="bg-primary hover:bg-primary/90">
            <Plus size={16} className="mr-2" />
            Add Plan
          </Button>
        }
      />

      <div className="bg-card border border-border rounded-md overflow-hidden">
        <table className="erp-table">
          <thead>
            <tr>
              <th>Plan Name</th>
              <th>Price</th>
              <th>Billing Period</th>
              <th>Min Qty</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Status</th>
              <th className="w-24">Actions</th>
            </tr>
          </thead>
          <tbody>
            {plans.map((plan) => {
              const expired = isPlanExpired(plan.endDate);
              return (
                <tr key={plan.id} className={cn(expired && 'opacity-50')}>
                  <td className="font-medium text-foreground">{plan.name}</td>
                  <td>₹{plan.price.toFixed(0)}</td>
                  <td>{plan.billingPeriod}</td>
                  <td>{plan.minQty}</td>
                  <td>{new Date(plan.startDate).toLocaleDateString()}</td>
                  <td>{new Date(plan.endDate).toLocaleDateString()}</td>
                  <td>
                    <span
                      className={cn(
                        'inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium',
                        expired ? 'bg-destructive/10 text-destructive' : 'bg-success/10 text-success'
                      )}
                    >
                      {expired ? 'Expired' : 'Active'}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(plan)}
                        className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded"
                        disabled={expired}
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(plan.id)}
                        className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingPlan ? 'Edit Plan' : 'Create Plan'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div>
              <Label htmlFor="name" className="form-label">
                Plan Name
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                className="form-input"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price" className="form-label">
                  Price (₹)
                </Label>
                <Input
                  id="price"
                  type="number"
                  step="1"
                  value={formData.price}
                  onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                  className="form-input"
                  required
                />
              </div>
              <div>
                <Label htmlFor="billingPeriod" className="form-label">
                  Billing Period
                </Label>
                <Select
                  value={formData.billingPeriod}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, billingPeriod: value }))}
                >
                  <SelectTrigger className="form-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Monthly">Monthly</SelectItem>
                    <SelectItem value="Quarterly">Quarterly</SelectItem>
                    <SelectItem value="Yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="minQty" className="form-label">
                Minimum Quantity
              </Label>
              <Input
                id="minQty"
                type="number"
                min="1"
                value={formData.minQty}
                onChange={(e) => setFormData((prev) => ({ ...prev, minQty: e.target.value }))}
                className="form-input"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate" className="form-label">
                  Start Date
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, startDate: e.target.value }))}
                  className="form-input"
                  required
                />
              </div>
              <div>
                <Label htmlFor="endDate" className="form-label">
                  End Date
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, endDate: e.target.value }))}
                  className="form-input"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90">
                {editingPlan ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
