import { useState, useEffect } from 'react';
import { Layout } from '../../components/Layout/Layout.jsx';
import { PageHeader } from '../../components/ui/PageHeader.jsx';
import { StatCard } from '../../components/ui/StatCard.jsx';
import { reportService } from '../../lib/services/reportService.js';
import { Package, Users, IndianRupee, FileText, Loader2 } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar
} from 'recharts';

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeSubscriptions: 0,
    monthlyRevenue: 0,
    pendingInvoices: 0
  });
  const [chartData, setChartData] = useState({
    revenueTrend: [],
    subscriptionDistribution: [],
    topProducts: []
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, charts] = await Promise.all([
        reportService.getDashboardStats(),
        reportService.getChartData()
      ]);
      setStats(statsData || {
        totalProducts: 0,
        activeSubscriptions: 0,
        monthlyRevenue: 0,
        pendingInvoices: 0
      });
      setChartData(charts || {
        revenueTrend: [],
        subscriptionDistribution: [],
        topProducts: []
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to load dashboard data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => `₹${value.toLocaleString('en-IN')}`;

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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Products" value={stats.totalProducts || 0} icon={<Package size={24} />} />
        <StatCard title="Active Subscriptions" value={stats.activeSubscriptions || 0} icon={<Users size={24} />} />
        <StatCard title="Total Revenue" value={`₹${(stats.monthlyRevenue || 0).toLocaleString('en-IN')}`} icon={<IndianRupee size={24} />} />
        <StatCard title="Pending Invoices" value={stats.pendingInvoices || 0} icon={<FileText size={24} />} />
      </div>

      {/* Charts Section */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend Chart */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Revenue Trend (Last 6 Months)</h3>
          {chartData.revenueTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={chartData.revenueTrend}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} tickFormatter={(value) => `₹${value/1000}k`} />
                <Tooltip 
                  formatter={(value) => [formatCurrency(value), 'Revenue']}
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                  labelStyle={{ color: '#f3f4f6' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#22c55e" fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-muted-foreground">
              No revenue data available
            </div>
          )}
        </div>

        {/* Subscription Distribution Chart */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Subscription Status Distribution</h3>
          {chartData.subscriptionDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={chartData.subscriptionDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {chartData.subscriptionDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name) => [value, name]}
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-muted-foreground">
              No subscription data available
            </div>
          )}
        </div>

        {/* Top Products by Revenue Chart */}
        <div className="bg-card border border-border rounded-lg p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-foreground mb-4">Top Products by Revenue</h3>
          {chartData.topProducts.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData.topProducts} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" tick={{ fill: '#9ca3af', fontSize: 12 }} tickFormatter={(value) => `₹${value/1000}k`} />
                <YAxis dataKey="name" type="category" tick={{ fill: '#9ca3af', fontSize: 12 }} width={120} />
                <Tooltip 
                  formatter={(value) => [formatCurrency(value), 'Revenue']}
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                  labelStyle={{ color: '#f3f4f6' }}
                />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-muted-foreground">
              No product revenue data available
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
