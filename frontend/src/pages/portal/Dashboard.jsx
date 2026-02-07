import { Layout } from '../../components/Layout/Layout.jsx';
import { PageHeader } from '../../components/ui/PageHeader.jsx';
import { StatCard } from '../../components/ui/StatCard.jsx';
import { StatusBadge } from '../../components/StatusBadge.jsx';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { getCustomerSubscriptions, getCustomerInvoices, getPlanById } from '../../data/mockData.js';
import { SubscriptionStatus, InvoiceStatus } from '../../data/constants.js';
import { CreditCard, FileText, Calendar } from 'lucide-react';

export default function PortalDashboard() {
  const { user } = useAuth();

  const subscriptions = user ? getCustomerSubscriptions(user.id) : [];
  const invoices = user ? getCustomerInvoices(user.id) : [];

  const activeSubscription = subscriptions.find((s) => s.status === SubscriptionStatus.ACTIVE);
  const activePlan = activeSubscription ? getPlanById(activeSubscription.planId) : null;
  const outstandingInvoices = invoices.filter((i) => i.status !== InvoiceStatus.PAID);
  const outstandingAmount = outstandingInvoices.reduce((sum, i) => sum + i.total, 0);

  const nextBillingDate = activeSubscription
    ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()
    : 'N/A';

  return (
    <Layout type="portal">
      <PageHeader title={`Welcome, ${user?.name || 'Customer'}`} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard title="Active Plan" value={activePlan?.name || 'No Active Plan'} icon={<CreditCard size={24} />} />
        <StatCard title="Next Billing Date" value={nextBillingDate} icon={<Calendar size={24} />} />
        <StatCard title="Outstanding Amount" value={`₹${outstandingAmount.toFixed(0)}`} icon={<FileText size={24} />} />
      </div>

      {activeSubscription && activePlan && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-4">Current Subscription</h2>
          <div className="bg-card border border-border rounded-md p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold text-foreground">{activePlan.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  ₹{activePlan.price.toFixed(0)} / {activePlan.billingPeriod}
                </p>
              </div>
              <StatusBadge status={activeSubscription.status} />
            </div>
            <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Start Date</p>
                <p className="text-sm font-medium text-foreground">
                  {new Date(activeSubscription.startDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">End Date</p>
                <p className="text-sm font-medium text-foreground">
                  {new Date(activeSubscription.endDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Recent Invoices</h2>
        <div className="bg-card border border-border rounded-md overflow-hidden">
          {invoices.length > 0 ? (
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {invoices.slice(0, 5).map((invoice) => (
                  <tr key={invoice.id}>
                    <td className="font-medium text-foreground">{invoice.number}</td>
                    <td>₹{invoice.total.toFixed(0)}</td>
                    <td>{new Date(invoice.createdAt).toLocaleDateString()}</td>
                    <td>
                      <StatusBadge status={invoice.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-6 text-center text-sm text-muted-foreground">No invoices yet</div>
          )}
        </div>
      </div>
    </Layout>
  );
}
