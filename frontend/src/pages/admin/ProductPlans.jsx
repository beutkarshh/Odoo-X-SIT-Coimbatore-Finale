import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../../components/Layout/Layout.jsx';
import { PageHeader } from '../../components/ui/PageHeader.jsx';
import { productService } from '../../lib/services/productService.js';
import { planService } from '../../lib/services/planService.js';
import { subscriptionService } from '../../lib/services/subscriptionService.js';
import { ArrowLeft, Search, Calendar, Users, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { useToast } from '../../hooks/use-toast';

export default function ProductPlans() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [billingFilter, setBillingFilter] = useState('All');
  const [product, setProduct] = useState(null);
  const [plans, setPlans] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [productId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load product
      const productResult = await productService.getById(productId);
      if (!productResult.success) {
        toast({
          title: 'Error',
          description: 'Product not found',
          variant: 'destructive'
        });
        return;
      }
      setProduct(productResult.data);

      // Load plans for this product
      const plansResult = await planService.getAll();
      if (plansResult.success && Array.isArray(plansResult.data)) {
        const productPlans = plansResult.data.filter(p => p.productId === parseInt(productId));
        setPlans(productPlans);
      } else {
        setPlans([]);
      }

      // Load all subscriptions to count subscribers per plan
      const subsResult = await subscriptionService.getAll();
      if (subsResult.success && Array.isArray(subsResult.data)) {
        setSubscriptions(subsResult.data);
      } else {
        setSubscriptions([]);
      }
    } catch (error) {
      setPlans([]);
      setSubscriptions([]);
      toast({
        title: 'Error',
        description: 'Failed to load data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!product) {
    return (
      <Layout type="admin">
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold text-foreground mb-2">Product Not Found</h3>
          <Button onClick={() => navigate('/admin/products')} variant="outline">
            <ArrowLeft size={18} className="mr-2" />
            Back to Products
          </Button>
        </div>
      </Layout>
    );
  }

  // Get unique billing periods
  const billingPeriods = ['All', ...new Set(plans.map(p => p.billingPeriod))];

  // Filter plans
  const filteredPlans = plans.filter(plan => {
    const matchesSearch = plan.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBilling = billingFilter === 'All' || plan.billingPeriod === billingFilter;
    return matchesSearch && matchesBilling;
  });

  const handlePlanClick = (planId) => {
    navigate(`/admin/products/${productId}/plans/${planId}/subscribers`);
  };

  // Get subscriber count for a plan
  const getSubscriberCount = (planId) => {
    return subscriptions.filter(sub => sub.planId === planId).length;
  };

  return (
    <Layout type="admin">
      {/* Header with Back Button */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/admin/products')}
          className="mb-4 -ml-2"
        >
          <ArrowLeft size={18} className="mr-2" />
          Back to Products
        </Button>
        <PageHeader title={`${product.name} - Plans`} />
        <p className="text-muted-foreground mt-2">
          View and manage subscription plans for {product.name}
        </p>
      </div>

      {/* Search and Filter Section */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            type="text"
            placeholder="Search plans by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2 flex-wrap">
          {billingPeriods.map(period => (
            <Button
              key={period}
              variant={billingFilter === period ? "default" : "outline"}
              onClick={() => setBillingFilter(period)}
              size="sm"
              className={billingFilter === period ? "bg-primary text-white" : ""}
            >
              {period}
            </Button>
          ))}
        </div>
      </div>

      {/* Plans List */}
      <div className="space-y-4">
        {filteredPlans.map(plan => {
          const subscriptionsCount = getSubscriberCount(plan.id);
          
          return (
            <div
              key={plan.id}
              onClick={() => handlePlanClick(plan.id)}
              className="bg-card border border-border rounded-lg p-6 hover:shadow-lg hover:border-primary/50 transition-all cursor-pointer group"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                {/* Plan Info */}
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-foreground mb-2">{plan.name}</h3>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} />
                      <span>{plan.billingPeriod}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users size={16} />
                      <span>Min Qty: {plan.minQty}</span>
                    </div>
                  </div>
                </div>

                {/* Pricing */}
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="text-3xl font-bold text-primary">₹{plan.price?.toFixed(0) || '0'}</div>
                    <div className="text-sm text-muted-foreground">per {plan.billingPeriod?.toLowerCase() || 'period'}</div>
                  </div>

                  {/* Subscribers Count */}
                  <div className="bg-muted rounded-lg px-4 py-3 text-center min-w-[100px]">
                    <div className="text-2xl font-bold text-foreground">{subscriptionsCount}</div>
                    <div className="text-xs text-muted-foreground">Subscribers</div>
                  </div>

                  {/* Arrow */}
                  <ArrowRight size={24} className="text-primary group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Date Range */}
              <div className="mt-4 pt-4 border-t border-border">
                <span className="text-xs text-muted-foreground">
                  Valid from {new Date(plan.startDate).toLocaleDateString()} to {new Date(plan.endDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* No Results */}
      {filteredPlans.length === 0 && (
        <div className="text-center py-12 bg-card border border-border rounded-lg">
          <Calendar size={48} className="mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Plans Found</h3>
          <p className="text-muted-foreground mb-4">
            {plans.length === 0 
              ? 'No plans have been created for this product yet.' 
              : 'Try adjusting your search or filter criteria'}
          </p>
        </div>
      )}
    </Layout>
  );
}
