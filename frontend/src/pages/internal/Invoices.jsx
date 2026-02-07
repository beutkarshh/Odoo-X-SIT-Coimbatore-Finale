import { useState, useEffect } from 'react';
import { Layout } from '../../components/Layout/Layout.jsx';
import { PageHeader } from '../../components/ui/PageHeader.jsx';
import { StatusBadge } from '../../components/StatusBadge.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { invoiceService } from '../../lib/services/invoiceService.js';
import { InvoiceStatus, INVOICE_TRANSITIONS } from '../../data/constants.js';
import { ChevronDown, Loader2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/DropdownMenu.jsx';

export default function InternalInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      const result = await invoiceService.getAll();
      if (result.success && Array.isArray(result.data)) {
        setInvoices(result.data);
      }
    } catch (error) {
      console.error('Failed to load invoices:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const getNextActions = (status) => {
    return INVOICE_TRANSITIONS[status] || [];
  };

  const handleStatusChange = async (invoiceId, newStatus) => {
    try {
      const result = await invoiceService.updateStatus(invoiceId, newStatus);
      if (result.success) {
        setInvoices((prev) =>
          prev.map((inv) => (inv.id === invoiceId ? { ...inv, status: newStatus } : inv))
        );
      }
    } catch (error) {
      console.error('Failed to update invoice status:', error);
    }
  };

  const getActionLabel = (status) => {
    const labels = {
      [InvoiceStatus.DRAFT]: 'Move to Draft',
      [InvoiceStatus.CONFIRMED]: 'Confirm Invoice',
      [InvoiceStatus.PAID]: 'Mark as Paid',
    };
    return labels[status];
  };

  if (loading) {
    return (
      <Layout type="internal">
        <PageHeader title="Invoices" />
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout type="internal">
      <PageHeader title="Invoices" />

      <div className="bg-card border border-border rounded-md overflow-hidden">
        <table className="erp-table">
          <thead>
            <tr>
              <th>Invoice Number</th>
              <th>Customer</th>
              <th>Subscription</th>
              <th>Amount</th>
              <th>Created Date & Time</th>
              <th>Paid At</th>
              <th>Status</th>
              <th className="w-32">Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-8 text-muted-foreground">
                  No invoices found
                </td>
              </tr>
            ) : (
              invoices.map((invoice) => {
                const nextActions = getNextActions(invoice.status);

                return (
                  <tr key={invoice.id}>
                    <td className="font-medium text-foreground">{invoice.invoiceNo}</td>
                    <td>
                      <div>
                        <p className="font-medium">{invoice.subscription?.customer?.name || 'N/A'}</p>
                        <p className="text-xs text-muted-foreground">{invoice.subscription?.customer?.email}</p>
                      </div>
                    </td>
                    <td>{invoice.subscription?.subscriptionNo || 'N/A'}</td>
                    <td>₹{Number(invoice.total || 0).toFixed(0)}</td>
                    <td className="text-sm">{formatDateTime(invoice.createdAt)}</td>
                    <td className="text-sm">
                      {invoice.paidAt ? (
                        <span className="text-green-600">{formatDateTime(invoice.paidAt)}</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td>
                      <StatusBadge status={invoice.status} />
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
                                onClick={() => handleStatusChange(invoice.id, action)}
                              >
                                {getActionLabel(action)}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : (
                        <span className="text-xs text-muted-foreground">Completed</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
