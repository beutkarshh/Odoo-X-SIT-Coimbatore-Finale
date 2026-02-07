import { useState } from 'react';
import { Layout } from '../../components/Layout/Layout.jsx';
import { PageHeader } from '../../components/ui/PageHeader.jsx';
import { StatusBadge } from '../../components/StatusBadge.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { getInvoicesWithDetails } from '../../data/mockData.js';
import { InvoiceStatus, INVOICE_TRANSITIONS } from '../../data/constants.js';
import { ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/DropdownMenu.jsx';

export default function InternalInvoices() {
  const [invoices, setInvoices] = useState(getInvoicesWithDetails());

  const getNextActions = (status) => {
    return INVOICE_TRANSITIONS[status] || [];
  };

  const handleStatusChange = (invoiceId, newStatus) => {
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === invoiceId ? { ...inv, status: newStatus } : inv))
    );
  };

  const getActionLabel = (status) => {
    const labels = {
      [InvoiceStatus.DRAFT]: 'Move to Draft',
      [InvoiceStatus.CONFIRMED]: 'Confirm Invoice',
      [InvoiceStatus.PAID]: 'Mark as Paid',
    };
    return labels[status];
  };

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
              <th>Created Date</th>
              <th>Status</th>
              <th className="w-32">Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => {
              const nextActions = getNextActions(invoice.status);

              return (
                <tr key={invoice.id}>
                  <td className="font-medium text-foreground">{invoice.number}</td>
                  <td>{invoice.user?.name}</td>
                  <td>{invoice.subscription?.number}</td>
                  <td>₹{invoice.total.toFixed(0)}</td>
                  <td>{new Date(invoice.createdAt).toLocaleDateString()}</td>
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
            })}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
