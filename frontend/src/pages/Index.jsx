import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button.jsx';
import { Users, CreditCard, FileText, Shield, ArrowRight, Package } from 'lucide-react';

function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-card border border-border rounded-md p-6">
      <div className="w-10 h-10 bg-primary/10 rounded-md flex items-center justify-center text-primary mb-4">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}



export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="SubsManager" className="w-10 h-10" />
            <span className="text-xl font-semibold text-foreground">SubsManager</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="outline">Login</Button>
            </Link>
            <Link to="/signup">
              <Button className="bg-primary hover:bg-primary/90">Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
            Enterprise Subscription
            <span className="block mt-2 text-primary">Management System</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            A complete ERP-style solution for managing products, plans, subscriptions,
            and invoices. Built with role-based access control for admins, internal staff,
            and customers.
          </p>
          <div className="flex items-center justify-center">
            <Link to="/signup">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                Get Started
                <ArrowRight size={18} className="ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 px-6 bg-muted/30">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-2xl font-semibold text-foreground text-center mb-12">
            Complete Subscription Lifecycle Management
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Package size={24} />}
              title="Product & Plan Management"
              description="Create and manage products with pricing, define flexible subscription plans with billing periods."
            />
            <FeatureCard
              icon={<Users size={24} />}
              title="Subscription Workflow"
              description="Full lifecycle from Draft → Quotation → Confirmed → Active → Closed with state validation."
            />
            <FeatureCard
              icon={<CreditCard size={24} />}
              title="Invoice Management"
              description="Automated invoicing with status tracking: Draft, Confirmed, and Paid states."
            />
            <FeatureCard
              icon={<Shield size={24} />}
              title="Role-Based Access"
              description="Three distinct user roles: Admin (full control), Internal (operations), Customer (self-service)."
            />
            <FeatureCard
              icon={<FileText size={24} />}
              title="Customer Portal"
              description="Self-service portal for customers to view subscriptions, invoices, and manage their profile."
            />
            <FeatureCard
              icon={<ArrowRight size={24} />}
              title="State Transitions"
              description="Enforced business rules prevent invalid state changes, ensuring data integrity."
            />
          </div>
        </div>
      </section>

      <section className="py-16 px-6">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-2xl font-semibold text-foreground text-center mb-8">
            Get Started
          </h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div className="bg-card border border-border rounded-md p-6 text-center">
              <h3 className="text-lg font-semibold text-foreground mb-2">New User?</h3>
              <p className="text-sm text-muted-foreground mb-4">Create an account to start managing your subscriptions or join as internal staff.</p>
              <Link to="/signup">
                <Button className="w-full bg-primary hover:bg-primary/90">
                  Create Account
                </Button>
              </Link>
            </div>
            <div className="bg-card border border-border rounded-md p-6 text-center">
              <h3 className="text-lg font-semibold text-foreground mb-2">Existing User?</h3>
              <p className="text-sm text-muted-foreground mb-4">Sign in to access your dashboard - works for all user types.</p>
              <Link to="/login">
                <Button className="w-full" variant="outline">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-8 px-6">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>SubsManager — Enterprise Subscription Management System</p>
          <p className="mt-1">Built with React and Tailwind CSS</p>
        </div>
      </footer>
    </div>
  );
}
