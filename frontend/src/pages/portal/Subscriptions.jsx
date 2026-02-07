import { useState, useEffect, useCallback } from 'react';
import { Layout } from '../../components/Layout/Layout.jsx';
import { PageHeader } from '../../components/ui/PageHeader.jsx';
import { StatusBadge } from '../../components/StatusBadge.jsx';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { subscriptionService } from '../../lib/services/subscriptionService.js';
import { SubscriptionStatus } from '../../data/constants.js';
import { Calendar, Package, CreditCard, Clock } from 'lucide-react';
import { SearchFilter } from '../../components/SearchFilter.jsx';
import { StatsCardSkeleton, CardSkeleton, GridSkeleton } from '../../components/LoadingSkeleton.jsx';
import { NoSubscriptions } from '../../components/EmptyState.jsx';
import { useNavigate } from 'react-router-dom';

export default function PortalSubscriptions() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [subscriptions, setSubscriptions] = useState([]);
  const [filteredSubscriptions, setFilteredSubscriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    try {
      const result = await subscriptionService.getAll();
      if (result.success && Array.isArray(result.data)) {
        setSubscriptions(result.data);
        setFilteredSubscriptions(result.data);
      }
    } catch (error) {
      console.error('Failed to load subscriptions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Enrich subscriptions with plan and product data for filtering
  const enrichedSubscriptions = subscriptions.map(sub => {
    const plan = sub.plan;
    // Get product from subscription lines if available
    const product = sub.lines?.[0]?.product || null;
    return {
      ...sub,
      planName: plan?.name || 'Unknown',
      productName: product?.name || 'Unknown',
      productType: product?.type || 'Unknown',
      price: Number(plan?.price || 0),
    };
  });

  // Filter config
  const filterConfig = [
    {
      key: 'status',
      label: 'Status',
      options: [
        { value: SubscriptionStatus.ACTIVE, label: 'Active' },
        { value: SubscriptionStatus.CONFIRMED, label: 'Confirmed' },
        { value: SubscriptionStatus.QUOTATION, label: 'Quotation' },
        { value: SubscriptionStatus.DRAFT, label: 'Draft' },
        { value: SubscriptionStatus.CLOSED, label: 'Closed' },
      ],
    },
    {
      key: 'productType',
      label: 'Product Type',
      options: [
        { value: 'SERVICE', label: 'Service' },
        { value: 'SAAS', label: 'SaaS' },
        { value: 'LICENSE', label: 'License' },
      ],
    },
  ];

  const handleFilterChange = useCallback((filtered) => {
    setFilteredSubscriptions(filtered);
  }, []);

  const activeCount = subscriptions.filter(s => s.status === SubscriptionStatus.ACTIVE).length;
  const totalValue = subscriptions.reduce((sum, s) => {
    return sum + Number(s.plan?.price || 0);
  }, 0);

  return (
    <Layout type="portal">
      <PageHeader title="My Subscriptions" />

      {/* Stats Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <StatsCardSkeleton />
          <StatsCardSkeleton />
          <StatsCardSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Package className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="stat-card-value">{subscriptions.length}</p>
                <p className="stat-card-label">Total Subscriptions</p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Clock className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="stat-card-value text-green-500">{activeCount}</p>
                <p className="stat-card-label">Active</p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <CreditCard className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="stat-card-value text-blue-500">₹{totalValue.toLocaleString('en-IN')}</p>
                <p className="stat-card-label">Monthly Value</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      {subscriptions.length > 0 && (
        <div className="mb-6">
          <SearchFilter
            data={enrichedSubscriptions}
            searchFields={['number', 'planName', 'productName']}
            filterConfig={filterConfig}
            onFilterChange={handleFilterChange}
            placeholder="Search by subscription ID, plan or product..."
          />
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : subscriptions.length === 0 ? (
        <NoSubscriptions onBrowse={() => navigate('/portal/products')} />
      ) : filteredSubscriptions.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <p className="text-muted-foreground">No subscriptions match your filters.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSubscriptions.map((subscription) => {
            const plan = subscription.plan;
            const product = subscription.lines?.[0]?.product || null;
            return (
              <div key={subscription.id} className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm text-muted-foreground">{subscription.subscriptionNo}</span>
                      <StatusBadge status={subscription.status} />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">{plan?.name || 'Unknown Plan'}</h3>
                    {product && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Product: {product.name} ({product.type})
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">
                      ₹{Number(plan?.price || 0).toLocaleString('en-IN')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      per {(plan?.billingPeriod || 'month').toLowerCase()}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Start Date</p>
                      <p className="text-sm font-medium text-foreground">
                        {subscription.startDate ? new Date(subscription.startDate).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        }) : 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">End Date</p>
                      <p className="text-sm font-medium text-foreground">
                        {subscription.expirationDate ? new Date(subscription.expirationDate).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        }) : 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Billing Period</p>
                    <p className="text-sm font-medium text-foreground">{plan?.billingPeriod || 'Monthly'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Min. Quantity</p>
                    <p className="text-sm font-medium text-foreground">{plan?.minQty || 1} seat(s)</p>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-muted/50 rounded-md">
                  <p className="text-xs text-muted-foreground">
                    {subscription.status === SubscriptionStatus.ACTIVE &&
                      '✅ Your subscription is active and will renew automatically.'}
                    {subscription.status === SubscriptionStatus.CONFIRMED &&
                      '📋 Your subscription has been confirmed and will be activated soon.'}
                    {subscription.status === SubscriptionStatus.QUOTATION &&
                      '📝 A quotation has been sent. Please review and confirm to proceed.'}
                    {subscription.status === SubscriptionStatus.DRAFT &&
                      '⏳ This subscription is being prepared. You will be notified when ready.'}
                    {subscription.status === SubscriptionStatus.CLOSED && '🔒 This subscription has ended.'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-8 p-4 bg-muted/50 rounded-lg">
        <h3 className="text-sm font-medium text-foreground mb-3">Subscription Status Guide</h3>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <StatusBadge status={SubscriptionStatus.DRAFT} />
            <span className="text-xs text-muted-foreground">Preparing</span>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={SubscriptionStatus.QUOTATION} />
            <span className="text-xs text-muted-foreground">Review needed</span>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={SubscriptionStatus.CONFIRMED} />
            <span className="text-xs text-muted-foreground">Ready to activate</span>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={SubscriptionStatus.ACTIVE} />
            <span className="text-xs text-muted-foreground">Currently active</span>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={SubscriptionStatus.CLOSED} />
            <span className="text-xs text-muted-foreground">Ended</span>
          </div>
        </div>
      </div>
    </Layout>
  );
}
