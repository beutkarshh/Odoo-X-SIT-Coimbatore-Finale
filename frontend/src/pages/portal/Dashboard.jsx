import { useState, useEffect } from 'react';
import { Layout } from '../../components/Layout/Layout.jsx';
import { PageHeader } from '../../components/ui/PageHeader.jsx';
import { StatCard } from '../../components/ui/StatCard.jsx';
import { StatusBadge } from '../../components/StatusBadge.jsx';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { subscriptionService } from '../../lib/services/subscriptionService.js';
import { invoiceService } from '../../lib/services/invoiceService.js';
import { SubscriptionStatus, InvoiceStatus } from '../../data/constants.js';
import { CreditCard, FileText, Calendar, Clock, Loader2 } from 'lucide-react';

export default function PortalDashboard() {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [subsResult, invResult] = await Promise.all([
          subscriptionService.getAll(),
          invoiceService.getAll(),
        ]);
        if (subsResult.success && Array.isArray(subsResult.data)) {
          setSubscriptions(subsResult.data);
        }
        if (invResult.success && Array.isArray(invResult.data)) {
          setInvoices(invResult.data);
        }
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const activeSubscription = subscriptions.find((s) => s.status === SubscriptionStatus.ACTIVE);
  const activePlan = activeSubscription?.plan || null;
  const outstandingInvoices = invoices.filter((i) => i.status !== InvoiceStatus.PAID);
  const outstandingAmount = outstandingInvoices.reduce((sum, i) => sum + Number(i.total || 0), 0);

  const nextBillingDate = activeSubscription
    ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : 'N/A';

  const formatDateTime = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (loading) {
    return (
      <Layout type="portal">
        <PageHeader title={`Welcome, ${user?.name || 'Customer'}`} />
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

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
                  ₹{Number(activePlan.price || 0).toFixed(0)} / {activePlan.billingPeriod || 'Monthly'}
                </p>
              </div>
              <StatusBadge status={activeSubscription.status} />
            </div>
            <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Start Date & Time</p>
                <p className="text-sm font-medium text-foreground">
                  {formatDateTime(activeSubscription.startDate)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">End Date</p>
                <p className="text-sm font-medium text-foreground">
                  {formatDate(activeSubscription.expirationDate)}
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
                  <th>Date & Time</th>
                  <th>Paid At</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {invoices.slice(0, 5).map((invoice) => (
                  <tr key={invoice.id}>
                    <td className="font-medium text-foreground">{invoice.invoiceNo}</td>
                    <td>₹{Number(invoice.total || 0).toFixed(0)}</td>
                    <td className="text-sm">{formatDateTime(invoice.createdAt)}</td>
                    <td className="text-sm">
                      {invoice.paidAt ? (
                        <span className="text-green-600 flex items-center gap-1">
                          <Clock size={14} />
                          {formatTime(invoice.paidAt)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
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
