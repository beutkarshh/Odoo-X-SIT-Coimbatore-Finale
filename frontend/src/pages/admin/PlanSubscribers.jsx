import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../../components/Layout/Layout.jsx';
import { PageHeader } from '../../components/ui/PageHeader.jsx';
import { planService } from '../../lib/services/planService.js';
import { subscriptionService } from '../../lib/services/subscriptionService.js';
import { ArrowLeft, Search, User, Mail, Calendar, Activity, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { StatusBadge } from '../../components/StatusBadge.jsx';
import { SubscriptionStatus } from '../../data/constants.js';
import { useToast } from '../../hooks/use-toast';

export default function PlanSubscribers() {
  const { productId, planId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [plan, setPlan] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [planId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load plan
      const planResult = await planService.getById(planId);
      if (!planResult.success) {
        toast({
          title: 'Error',
          description: 'Plan not found',
          variant: 'destructive'
        });
        return;
      }
      setPlan(planResult.data);

      // Load subscriptions
      const subsResult = await subscriptionService.getAll();
      if (subsResult.success && Array.isArray(subsResult.data)) {
        const planSubscriptions = subsResult.data.filter(s => s.planId === parseInt(planId));
        setSubscriptions(planSubscriptions);
      } else {
        setSubscriptions([]);
      }
    } catch (error) {
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

  if (loading) {
    return (
      <Layout type="admin">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!plan) {
    return (
      <Layout type="admin">
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold text-foreground mb-2">Plan Not Found</h3>
          <Button onClick={() => navigate(`/admin/products/${productId}/plans`)} variant="outline">
            <ArrowLeft size={18} className="mr-2" />
            Back to Plans
          </Button>
        </div>
      </Layout>
    );
  }

  // Get unique statuses
  const statuses = ['All', ...Object.values(SubscriptionStatus)];

  // Filter subscriptions
  const filteredSubscriptions = subscriptions.filter(subscription => {
    const matchesSearch = subscription.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         subscription.customer?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         subscription.subscriptionNo?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || subscription.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <Layout type="admin">
      {/* Header with Back Button */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(`/admin/products/${productId}/plans`)}
          className="mb-4 -ml-2"
        >
          <ArrowLeft size={18} className="mr-2" />
          Back to Plans
        </Button>
        <PageHeader title={`${plan.name} - Subscribers`} />
        <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
          <span>₹{Number(plan.price || 0).toFixed(0)} / {plan.billingPeriod}</span>
          <span>•</span>
          <span>{subscriptions.length} Total Subscribers</span>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            type="text"
            placeholder="Search by name, email, or subscription number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2 flex-wrap">
          {statuses.map(status => (
            <Button
              key={status}
              variant={statusFilter === status ? "default" : "outline"}
              onClick={() => setStatusFilter(status)}
              size="sm"
              className={statusFilter === status ? "bg-primary text-white" : ""}
            >
              {status}
            </Button>
          ))}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-sm text-muted-foreground mb-1">Active</div>
          <div className="text-2xl font-bold text-success">
            {subscriptions.filter(s => s.status === SubscriptionStatus.ACTIVE).length}
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-sm text-muted-foreground mb-1">Confirmed</div>
          <div className="text-2xl font-bold text-warning">
            {subscriptions.filter(s => s.status === SubscriptionStatus.CONFIRMED).length}
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-sm text-muted-foreground mb-1">Quotation</div>
          <div className="text-2xl font-bold text-info">
            {subscriptions.filter(s => s.status === SubscriptionStatus.QUOTATION).length}
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-sm text-muted-foreground mb-1">Other</div>
          <div className="text-2xl font-bold text-muted-foreground">
            {subscriptions.filter(s => 
              ![SubscriptionStatus.ACTIVE, SubscriptionStatus.CONFIRMED, SubscriptionStatus.QUOTATION].includes(s.status)
            ).length}
          </div>
        </div>
      </div>

      {/* Subscribers List */}
      <div className="space-y-3">
        {filteredSubscriptions.map(subscription => (
          <div
            key={subscription.id}
            className="bg-card border border-border rounded-lg p-5 hover:shadow-md hover:border-primary/30 transition-all"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* User Info */}
              <div className="flex items-start gap-4 flex-1">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <User size={24} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-foreground mb-1">{subscription.customer?.name || 'Unknown User'}</h4>
                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Mail size={14} />
                      <span className="truncate">{subscription.customer?.email || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Activity size={14} />
                      <span>{subscription.subscriptionNo}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Subscription Details */}
              <div className="flex flex-wrap items-center gap-4">
                {/* Dates */}
                <div className="text-sm">
                  <div className="text-muted-foreground">Start Date</div>
                  <div className="font-medium text-foreground">
                    {new Date(subscription.startDate).toLocaleDateString()}
                  </div>
                </div>
                {subscription.expirationDate && (
                  <div className="text-sm">
                    <div className="text-muted-foreground">Expiration</div>
                    <div className="font-medium text-foreground">
                      {new Date(subscription.expirationDate).toLocaleDateString()}
                    </div>
                  </div>
                )}

                {/* Status */}
                <div>
                  <StatusBadge status={subscription.status} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* No Results */}
      {filteredSubscriptions.length === 0 && (
        <div className="text-center py-12 bg-card border border-border rounded-lg">
          <User size={48} className="mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Subscribers Found</h3>
          <p className="text-muted-foreground">
            {subscriptions.length === 0 
              ? 'No one has subscribed to this plan yet.' 
              : 'Try adjusting your search or filter criteria'}
          </p>
        </div>
      )}
    </Layout>
  );
}
