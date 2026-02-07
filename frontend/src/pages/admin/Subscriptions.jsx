import { useState, useEffect } from 'react';
import { Layout } from '../../components/Layout/Layout.jsx';
import { PageHeader } from '../../components/ui/PageHeader.jsx';
import { StatusBadge } from '../../components/StatusBadge.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { subscriptionService } from '../../lib/services/subscriptionService.js';
import { SubscriptionStatus, SUBSCRIPTION_TRANSITIONS } from '../../data/constants.js';
import { ChevronDown, Loader2 } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/DropdownMenu.jsx';

export default function AdminSubscriptions() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    try {
      setLoading(true);
      const result = await subscriptionService.getAll();
      if (result.success && Array.isArray(result.data)) {
        setSubscriptions(result.data);
      } else {
        setSubscriptions([]);
        toast({
          title: 'Error',
          description: result.message || 'Failed to load subscriptions',
          variant: 'destructive'
        });
      }
    } catch (error) {
      setSubscriptions([]);
      toast({
        title: 'Error',
        description: 'Failed to load subscriptions',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getNextActions = (status) => {
    return SUBSCRIPTION_TRANSITIONS[status] || [];
  };

  const handleStatusChange = async (subscriptionId, newStatus) => {
    try {
      const result = await subscriptionService.updateStatus(subscriptionId, newStatus);
      if (result.success) {
        setSubscriptions((prev) =>
          prev.map((sub) => (sub.id === subscriptionId ? { ...sub, status: newStatus } : sub))
        );
        toast({
          title: 'Success',
          description: 'Subscription status updated',
        });
      } else {
        toast({
          title: 'Error',
          description: result.message || 'Failed to update status',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update subscription status',
        variant: 'destructive'
      });
    }
  };

  const getActionLabel = (status) => {
    const labels = {
      [SubscriptionStatus.DRAFT]: 'Move to Draft',
      [SubscriptionStatus.QUOTATION]: 'Send Quotation',
      [SubscriptionStatus.CONFIRMED]: 'Confirm',
      [SubscriptionStatus.ACTIVE]: 'Activate',
      [SubscriptionStatus.CLOSED]: 'Close',
    };
    return labels[status];
  };

  if (loading) {
    return (
      <Layout type="admin">
        <PageHeader title="Subscriptions" />
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout type="admin">
      <PageHeader title="Subscriptions" />

      <div className="bg-card border border-border rounded-md overflow-hidden">
        <table className="erp-table">
          <thead>
            <tr>
              <th>Number</th>
              <th>Customer</th>
              <th>Plan</th>
              <th>Start Date</th>
              <th>Expiration Date</th>
              <th>Status</th>
              <th className="w-32">Actions</th>
            </tr>
          </thead>
          <tbody>
            {subscriptions.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-8 text-muted-foreground">
                  No subscriptions found
                </td>
              </tr>
            ) : (
              subscriptions.map((subscription) => {
                const nextActions = getNextActions(subscription.status);

                return (
                  <tr key={subscription.id}>
                    <td className="font-medium text-foreground">{subscription.subscriptionNo}</td>
                    <td>{subscription.customer?.name || 'N/A'}</td>
                    <td>{subscription.plan?.name || 'N/A'}</td>
                    <td>{new Date(subscription.startDate).toLocaleDateString()}</td>
                    <td>{subscription.expirationDate ? new Date(subscription.expirationDate).toLocaleDateString() : 'N/A'}</td>
                    <td>
                      <StatusBadge status={subscription.status} />
                    </td>
                    <td>
                      {nextActions.length > 0 ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8">
                              Actions
                              <ChevronDown size={14} className="ml-1" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {nextActions.map((action) => (
                              <DropdownMenuItem
                                key={action}
                                onClick={() => handleStatusChange(subscription.id, action)}
                              >
                                {getActionLabel(action)}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : (
                        <span className="text-xs text-muted-foreground">No actions</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 p-4 bg-muted/50 rounded-md">
        <h3 className="text-sm font-medium text-foreground mb-3">Subscription Lifecycle</h3>
        <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
          <StatusBadge status={SubscriptionStatus.DRAFT} />
          <span>→</span>
          <StatusBadge status={SubscriptionStatus.QUOTATION} />
          <span>→</span>
          <StatusBadge status={SubscriptionStatus.CONFIRMED} />
          <span>→</span>
          <StatusBadge status={SubscriptionStatus.ACTIVE} />
          <span>→</span>
          <StatusBadge status={SubscriptionStatus.CLOSED} />
        </div>
      </div>
    </Layout>
  );
}
