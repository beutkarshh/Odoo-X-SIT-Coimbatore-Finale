import { Layout } from '../../components/Layout/Layout.jsx';
import { PageHeader } from '../../components/ui/PageHeader.jsx';
import { StatCard } from '../../components/ui/StatCard.jsx';
import { getDashboardStats } from '../../data/mockData.js';
import { Users, FileText, IndianRupee } from 'lucide-react';

export default function InternalDashboard() {
  const stats = getDashboardStats();

  return (
    <Layout type="internal">
      <PageHeader title="Dashboard" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Active Subscriptions" value={stats.activeSubscriptions} icon={<Users size={24} />} />
        <StatCard title="Pending Invoices" value={stats.pendingInvoices} icon={<FileText size={24} />} />
        <StatCard title="Monthly Revenue" value={`₹${stats.monthlyRevenue.toFixed(0)}`} icon={<IndianRupee size={24} />} />
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
        <div className="bg-card border border-border rounded-md p-6">
          <p className="text-sm text-muted-foreground mb-4">
            As an internal user, you can manage subscriptions and invoices.
            Product and plan management is restricted to administrators.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-muted/50 rounded-md">
              <p className="text-sm font-medium text-foreground">Subscriptions</p>
              <p className="text-xs text-muted-foreground mt-1">Process subscription state changes</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-md">
              <p className="text-sm font-medium text-foreground">Invoices</p>
              <p className="text-xs text-muted-foreground mt-1">Manage invoice confirmations and payments</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
