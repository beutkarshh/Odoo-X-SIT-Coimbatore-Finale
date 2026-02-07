import { useState } from 'react';
import { Layout } from '../../components/Layout/Layout.jsx';
import { PageHeader } from '../../components/ui/PageHeader.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Label } from '../../components/ui/Label.jsx';
import { mockProducts } from '../../data/mockData.js';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../components/Modal.jsx';

export default function AdminProducts() {
  const [products, setProducts] = useState(mockProducts);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    salePrice: '',
    costPrice: '',
  });

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({ name: '', type: '', salePrice: '', costPrice: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      type: product.type,
      salePrice: product.salePrice.toString(),
      costPrice: product.costPrice.toString(),
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editingProduct) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editingProduct.id
            ? {
                ...p,
                name: formData.name,
                type: formData.type,
                salePrice: parseFloat(formData.salePrice),
                costPrice: parseFloat(formData.costPrice),
              }
            : p
        )
      );
    } else {
      const newProduct = {
        id: Math.max(...products.map((p) => p.id)) + 1,
        name: formData.name,
        type: formData.type,
        salePrice: parseFloat(formData.salePrice),
        costPrice: parseFloat(formData.costPrice),
      };
      setProducts((prev) => [...prev, newProduct]);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this product?')) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
    }
  };

  return (
    <Layout type="admin">
      <PageHeader
        title="Products"
        action={
          <Button onClick={openCreateModal} className="bg-primary hover:bg-primary/90">
            <Plus size={16} className="mr-2" />
            Add Product
          </Button>
        }
      />

      <div className="bg-card border border-border rounded-md overflow-hidden">
        <table className="erp-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Sale Price</th>
              <th>Cost Price</th>
              <th>Margin</th>
              <th className="w-24">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const margin = (((product.salePrice - product.costPrice) / product.salePrice) * 100).toFixed(1);
              return (
                <tr key={product.id}>
                  <td className="font-medium text-foreground">{product.name}</td>
                  <td>{product.type}</td>
                  <td>₹{product.salePrice.toFixed(0)}</td>
                  <td>₹{product.costPrice.toFixed(0)}</td>
                  <td className="text-success">{margin}%</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(product)}
                        className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
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
            <DialogTitle>{editingProduct ? 'Edit Product' : 'Create Product'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div>
              <Label htmlFor="name" className="form-label">
                Product Name
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                className="form-input"
                required
              />
            </div>
            <div>
              <Label htmlFor="type" className="form-label">
                Type
              </Label>
              <Input
                id="type"
                value={formData.type}
                onChange={(e) => setFormData((prev) => ({ ...prev, type: e.target.value }))}
                placeholder="e.g., Service, Feature, Support"
                className="form-input"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="salePrice" className="form-label">
                  Sale Price (₹)
                </Label>
                <Input
                  id="salePrice"
                  type="number"
                  step="1"
                  value={formData.salePrice}
                  onChange={(e) => setFormData((prev) => ({ ...prev, salePrice: e.target.value }))}
                  className="form-input"
                  required
                />
              </div>
              <div>
                <Label htmlFor="costPrice" className="form-label">
                  Cost Price (₹)
                </Label>
                <Input
                  id="costPrice"
                  type="number"
                  step="1"
                  value={formData.costPrice}
                  onChange={(e) => setFormData((prev) => ({ ...prev, costPrice: e.target.value }))}
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
                {editingProduct ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
