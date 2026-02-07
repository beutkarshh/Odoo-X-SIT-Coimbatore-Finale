import { useState, useEffect } from 'react';
import { Layout } from '../../components/Layout/Layout.jsx';
import { PageHeader } from '../../components/ui/PageHeader.jsx';
import { StatCard } from '../../components/ui/StatCard.jsx';
import { reportService } from '../../lib/services/reportService.js';
import { Users, FileText, IndianRupee, Loader2 } from 'lucide-react';

export default function InternalDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await reportService.getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to load dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  if (loading) {
    return (
      <Layout type="internal">
        <PageHeader title="Dashboard" />
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout type="internal">
      <PageHeader title="Dashboard" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Active Subscriptions" value={stats?.activeSubscriptions || 0} icon={<Users size={24} />} />
        <StatCard title="Pending Invoices" value={stats?.pendingInvoices || 0} icon={<FileText size={24} />} />
        <StatCard title="Monthly Revenue" value={`₹${Number(stats?.monthlyRevenue || 0).toFixed(0)}`} icon={<IndianRupee size={24} />} />
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
