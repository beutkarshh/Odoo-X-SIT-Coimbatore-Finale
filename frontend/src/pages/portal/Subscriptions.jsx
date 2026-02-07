import { Layout } from '../../components/Layout/Layout.jsx';
import { PageHeader } from '../../components/ui/PageHeader.jsx';
import { StatusBadge } from '../../components/StatusBadge.jsx';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { getCustomerSubscriptions, getPlanById } from '../../data/mockData.js';
import { SubscriptionStatus } from '../../data/constants.js';

export default function PortalSubscriptions() {
  const { user } = useAuth();
  const subscriptions = user ? getCustomerSubscriptions(user.id) : [];

  return (
    <Layout type="portal">
      <PageHeader title="My Subscriptions" />

      {subscriptions.length > 0 ? (
        <div className="space-y-4">
          {subscriptions.map((subscription) => {
            const plan = getPlanById(subscription.planId);
            return (
              <div key={subscription.id} className="bg-card border border-border rounded-md p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">{subscription.number}</p>
                    <h3 className="text-lg font-semibold text-foreground">{plan?.name || 'Unknown Plan'}</h3>
                  </div>
                  <StatusBadge status={subscription.status} />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border">
                  <div>
                    <p className="text-xs text-muted-foreground">Price</p>
                    <p className="text-sm font-medium text-foreground">
                      ₹{plan?.price.toFixed(0) || '0'} / {plan?.billingPeriod || 'month'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Start Date</p>
                    <p className="text-sm font-medium text-foreground">
                      {new Date(subscription.startDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">End Date</p>
                    <p className="text-sm font-medium text-foreground">
                      {new Date(subscription.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Status</p>
                    <p className="text-sm font-medium text-foreground capitalize">
                      {subscription.status.toLowerCase()}
                    </p>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-muted/50 rounded-md">
                  <p className="text-xs text-muted-foreground">
                    {subscription.status === SubscriptionStatus.ACTIVE &&
                      'Your subscription is active and will renew automatically.'}
                    {subscription.status === SubscriptionStatus.CONFIRMED &&
                      'Your subscription has been confirmed and will be activated soon.'}
                    {subscription.status === SubscriptionStatus.QUOTATION &&
                      'A quotation has been sent. Please review and confirm to proceed.'}
                    {subscription.status === SubscriptionStatus.DRAFT &&
                      'This subscription is being prepared. You will be notified when ready.'}
                    {subscription.status === SubscriptionStatus.CLOSED && 'This subscription has ended.'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-md p-12 text-center">
          <p className="text-muted-foreground">You don't have any subscriptions yet.</p>
        </div>
      )}

      <div className="mt-8 p-4 bg-muted/50 rounded-md">
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
