import { useState, useEffect } from 'react';
import { Layout } from '../../components/Layout/Layout.jsx';
import { PageHeader } from '../../components/ui/PageHeader.jsx';
import { StatCard } from '../../components/ui/StatCard.jsx';
import { reportService } from '../../lib/services/reportService.js';
import { Package, Users, IndianRupee, FileText, Loader2 } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeSubscriptions: 0,
    monthlyRevenue: 0,
    pendingInvoices: 0
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await reportService.getDashboardStats();
      setStats(data || {
        totalProducts: 0,
        activeSubscriptions: 0,
        monthlyRevenue: 0,
        pendingInvoices: 0
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to load dashboard stats',
        variant: 'destructive'
      });
      // Keep default values on error
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (date) => {
    return new Date(date).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (loading) {
    return (
      <Layout type="admin">
        <PageHeader title="Dashboard" />
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout type="admin">
      <PageHeader title="Dashboard" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Products" value={stats.totalProducts || 0} icon={<Package size={24} />} />
        <StatCard title="Active Subscriptions" value={stats.activeSubscriptions || 0} icon={<Users size={24} />} />
        <StatCard title="Monthly Revenue" value={`₹${(stats.monthlyRevenue || 0).toFixed(0)}`} icon={<IndianRupee size={24} />} />
        <StatCard title="Pending Invoices" value={stats.pendingInvoices || 0} icon={<FileText size={24} />} />
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
              <p className="text-xs text-muted-foreground mt-1">{formatDateTime(new Date())}</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
