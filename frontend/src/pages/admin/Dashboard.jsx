import { Layout } from '../../components/Layout/Layout.jsx';
import { PageHeader } from '../../components/ui/PageHeader.jsx';
import { StatCard } from '../../components/ui/StatCard.jsx';
import { getDashboardStats } from '../../data/mockData.js';
import { Package, Users, IndianRupee, FileText } from 'lucide-react';

export default function AdminDashboard() {
  const stats = getDashboardStats();

  return (
    <Layout type="admin">
      <PageHeader title="Dashboard" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Products" value={stats.totalProducts} icon={<Package size={24} />} />
        <StatCard title="Active Subscriptions" value={stats.activeSubscriptions} icon={<Users size={24} />} />
        <StatCard title="Monthly Revenue" value={`₹${stats.monthlyRevenue.toFixed(0)}`} icon={<IndianRupee size={24} />} />
        <StatCard title="Pending Invoices" value={stats.pendingInvoices} icon={<FileText size={24} />} />
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-foreground mb-4">Quick Overview</h2>
        <div className="bg-card border border-border rounded-md p-6">
          <p className="text-sm text-muted-foreground">
            Welcome to the Subscription Management System. Use the sidebar to navigate
            between Products, Plans, Subscriptions, and Invoices.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="p-4 bg-muted/50 rounded-md">
              <p className="text-sm font-medium text-foreground">System Status</p>
              <p className="text-xs text-muted-foreground mt-1">All systems operational</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-md">
              <p className="text-sm font-medium text-foreground">Last Updated</p>
              <p className="text-xs text-muted-foreground mt-1">{new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
