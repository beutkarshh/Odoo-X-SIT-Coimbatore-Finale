import { Layout } from '../../components/Layout/Layout.jsx';
import { PageHeader } from '../../components/ui/PageHeader.jsx';
import { StatusBadge } from '../../components/StatusBadge.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { getCustomerInvoices, getSubscriptionById } from '../../data/mockData.js';
import { InvoiceStatus } from '../../data/constants.js';

export default function PortalInvoices() {
  const { user } = useAuth();
  const invoices = user ? getCustomerInvoices(user.id) : [];

  const totalAmount = invoices.reduce((sum, inv) => sum + inv.total, 0);
  const paidAmount = invoices
    .filter((inv) => inv.status === InvoiceStatus.PAID)
    .reduce((sum, inv) => sum + inv.total, 0);

  return (
    <Layout type="portal">
      <PageHeader title="My Invoices" />

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="stat-card">
          <p className="stat-card-value">₹{totalAmount.toFixed(0)}</p>
          <p className="stat-card-label">Total Amount</p>
        </div>
        <div className="stat-card">
          <p className="stat-card-value text-success">₹{paidAmount.toFixed(0)}</p>
          <p className="stat-card-label">Paid</p>
        </div>
        <div className="stat-card">
          <p className="stat-card-value text-warning-foreground">₹{(totalAmount - paidAmount).toFixed(0)}</p>
          <p className="stat-card-label">Outstanding</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-md overflow-hidden">
        {invoices.length > 0 ? (
          <table className="erp-table">
            <thead>
              <tr>
                <th>Invoice Number</th>
                <th>Subscription</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Status</th>
                <th className="w-24">Action</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => {
                const subscription = getSubscriptionById(invoice.subscriptionId);
                const canPay = invoice.status === InvoiceStatus.CONFIRMED;

                return (
                  <tr key={invoice.id}>
                    <td className="font-medium text-foreground">{invoice.number}</td>
                    <td>{subscription?.number || 'N/A'}</td>
                    <td>₹{invoice.total.toFixed(0)}</td>
                    <td>{new Date(invoice.createdAt).toLocaleDateString()}</td>
                    <td>
                      <StatusBadge status={invoice.status} />
                    </td>
                    <td>
                      {canPay ? (
                        <Button size="sm" className="h-8 bg-primary hover:bg-primary/90">
                          Pay Now
                        </Button>
                      ) : invoice.status === InvoiceStatus.PAID ? (
                        <span className="text-xs text-success">Paid</span>
                      ) : (
                        <span className="text-xs text-muted-foreground">Pending</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center">
            <p className="text-muted-foreground">No invoices yet</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
