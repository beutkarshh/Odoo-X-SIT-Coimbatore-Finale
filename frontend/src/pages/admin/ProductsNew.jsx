import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../../components/Layout/Layout.jsx';
import { PageHeader } from '../../components/ui/PageHeader.jsx';
import { mockProducts, getPlansByProductId } from '../../data/mockData.js';
import { Package, Search, ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/button.tsx';
import { Input } from '../../components/ui/input.tsx';

export default function ProductsNew() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');

  // Get unique product types
  const productTypes = ['All', ...new Set(mockProducts.map(p => p.type))];

  // Filter products based on search and type
  const filteredProducts = mockProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'All' || product.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleProductClick = (productId) => {
    navigate(`/admin/products/${productId}/plans`);
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
          const plansCount = getPlansByProductId(product.id).length;
          
          return (
            <div
              key={product.id}
              onClick={() => handleProductClick(product.id)}
              className="bg-card border border-border rounded-lg p-6 hover:shadow-lg hover:border-primary/50 transition-all cursor-pointer group"
            >
              {/* Product Icon */}
              <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Package size={32} className="text-primary" />
              </div>

              {/* Product Info */}
              <div className="mb-4">
                <h3 className="text-xl font-bold text-foreground mb-2">{product.name}</h3>
                <span className="inline-block px-3 py-1 bg-muted rounded-full text-xs font-medium text-muted-foreground">
                  {product.type}
                </span>
              </div>

              {/* Pricing */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Sale Price</span>
                  <span className="text-lg font-semibold text-foreground">₹{product.salePrice.toFixed(0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Cost Price</span>
                  <span className="text-sm font-medium text-muted-foreground">₹{product.costPrice.toFixed(0)}</span>
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
    </Layout>
  );
}
