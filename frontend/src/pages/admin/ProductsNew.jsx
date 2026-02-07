import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../../components/Layout/Layout.jsx';
import { PageHeader } from '../../components/ui/PageHeader.jsx';
import { productService } from '../../lib/services/productService.js';
import { planService } from '../../lib/services/planService.js';
import { Package, Search, ArrowRight, Loader2, Plus, Edit2, Trash2, X } from 'lucide-react';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { useToast } from '../../hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../components/Modal.jsx';

export default function ProductsNew() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [products, setProducts] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'SERVICE',
    salesPrice: '',
    costPrice: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [productsResult, plansResult] = await Promise.all([
        productService.getAll(),
        planService.getAll()
      ]);

      if (productsResult.success && Array.isArray(productsResult.data)) {
        setProducts(productsResult.data);
      } else {
        setProducts([]);
      }
      
      if (plansResult.success && Array.isArray(plansResult.data)) {
        setPlans(plansResult.data);
      } else {
        setPlans([]);
      }
    } catch (error) {
      setProducts([]);
      setPlans([]);
      toast({
        title: 'Error',
        description: 'Failed to load products',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout type="admin">
        <PageHeader title="Products" />
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  // Get unique product types
  const productTypes = ['All', ...new Set((products || []).map(p => p.type).filter(Boolean))];

  // Filter products based on search and type
  const filteredProducts = (products || []).filter(product => {
    const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.type?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'All' || product.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleProductClick = (productId) => {
    navigate(`/admin/products/${productId}/plans`);
  };

  const getPlanCount = (productId) => {
    return plans.filter(p => p.productId === productId).length;
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      type: 'SERVICE',
      salesPrice: '',
      costPrice: ''
    });
    setShowModal(true);
  };

  const openEditModal = (e, product) => {
    e.stopPropagation();
    setEditingProduct(product);
    setFormData({
      name: product.name,
      type: product.type,
      salesPrice: product.salesPrice,
      costPrice: product.costPrice
    });
    setShowModal(true);
  };

  const handleDelete = async (e, productId) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const result = await productService.delete(productId);
      if (result.success) {
        toast({
          title: 'Success',
          description: 'Product deleted successfully'
        });
        loadData();
      } else {
        throw new Error(result.error || 'Failed to delete product');
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
      const productData = {
        name: formData.name,
        type: formData.type,
        salesPrice: parseFloat(formData.salesPrice),
        costPrice: parseFloat(formData.costPrice)
      };

      let result;
      if (editingProduct) {
        result = await productService.update(editingProduct.id, productData);
      } else {
        result = await productService.create(productData);
      }

      if (result.success) {
        toast({
          title: 'Success',
          description: `Product ${editingProduct ? 'updated' : 'created'} successfully`
        });
        setShowModal(false);
        loadData();
      } else {
        throw new Error(result.error || 'Failed to save product');
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
      <PageHeader title="Products" />

      {/* Search and Filter Section */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            type="text"
            placeholder="Search products by name or type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Button onClick={openAddModal} className="whitespace-nowrap">
          <Plus size={18} className="mr-2" />
          Add Product
        </Button>
        
        <div className="flex gap-2 flex-wrap">
          {productTypes.map(type => (
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

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map(product => {
          const plansCount = getPlanCount(product.id);
          
          return (
            <div
              key={product.id}
              className="bg-card border border-border rounded-lg p-6 hover:shadow-lg hover:border-primary/50 transition-all group relative"
            >
              {/* Action Buttons */}
              <div className="absolute top-4 right-4 flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => openEditModal(e, product)}
                  className="h-8 w-8 p-0"
                >
                  <Edit2 size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => handleDelete(e, product.id)}
                  className="h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground"
                >
                  <Trash2 size={16} />
                </Button>
              </div>

              <div
                onClick={() => handleProductClick(product.id)}
                className="cursor-pointer"
              >
                {/* Product Icon */}
                <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Package size={32} className="text-primary" />
                </div>

                {/* Product Info */}
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-foreground mb-2 pr-16">{product.name}</h3>
                  {product.type && (
                    <span className="inline-block px-3 py-1 bg-muted rounded-full text-xs font-medium text-muted-foreground">
                      {product.type}
                    </span>
                  )}
                </div>

                {/* Pricing */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Sale Price</span>
                    <span className="text-lg font-semibold text-foreground">₹{Number(product.salesPrice || 0).toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Cost Price</span>
                    <span className="text-sm font-medium text-muted-foreground">₹{Number(product.costPrice || 0).toFixed(0)}</span>
                  </div>
                </div>

                {/* Plans Count */}
                <div className="pt-4 border-t border-border flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {plansCount} {plansCount === 1 ? 'Plan' : 'Plans'} Available
                  </span>
                  <ArrowRight size={18} className="text-primary group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* No Results */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <Package size={48} className="mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Products Found</h3>
          <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
        </div>
      )}

      {/* Add/Edit Product Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Product Name *
              </label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="e.g., Netflix Premium"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Product Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                required
              >
                <option value="SERVICE">SERVICE</option>
                <option value="SAAS">SAAS</option>
                <option value="LICENSE">LICENSE</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Sale Price (₹) *
              </label>
              <Input
                type="number"
                value={formData.salesPrice}
                onChange={(e) => setFormData({ ...formData, salesPrice: e.target.value })}
                required
                min="0"
                step="0.01"
                placeholder="e.g., 999"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Cost Price (₹) *
              </label>
              <Input
                type="number"
                value={formData.costPrice}
                onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                required
                min="0"
                step="0.01"
                placeholder="e.g., 699"
              />
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
                {editingProduct ? 'Update' : 'Create'} Product
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
