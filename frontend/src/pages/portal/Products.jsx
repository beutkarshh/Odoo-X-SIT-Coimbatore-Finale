import { Layout } from '../../components/Layout/Layout.jsx';
import { PageHeader } from '../../components/ui/PageHeader.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { mockPlans, mockProducts } from '../../data/mockData.js';
import { cn } from '../../lib/utils.js';
import { Check } from 'lucide-react';

export default function PortalProducts() {
  const activePlans = mockPlans.filter((p) => new Date(p.endDate) > new Date());

  return (
    <Layout type="portal">
      <PageHeader title="Products & Plans" />

      <div className="mb-10">
        <h2 className="text-lg font-semibold text-foreground mb-4">Available Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {activePlans.map((plan, index) => {
            const isPopular = index === 1;
            return (
              <div
                key={plan.id}
                className={cn(
                  'bg-card border rounded-lg p-6 relative',
                  isPopular ? 'border-primary shadow-md' : 'border-border'
                )}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold text-foreground">{plan.name}</h3>
                  <div className="mt-4">
                    <span className="text-3xl font-bold text-foreground">₹{plan.price.toFixed(0)}</span>
                    <span className="text-sm text-muted-foreground">/{plan.billingPeriod.toLowerCase()}</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center text-sm text-muted-foreground">
                    <Check size={16} className="mr-2 text-success" />
                    Min. {plan.minQty} seat{plan.minQty > 1 ? 's' : ''}
                  </li>
                  <li className="flex items-center text-sm text-muted-foreground">
                    <Check size={16} className="mr-2 text-success" />
                    {plan.billingPeriod} billing
                  </li>
                  <li className="flex items-center text-sm text-muted-foreground">
                    <Check size={16} className="mr-2 text-success" />
                    Full support included
                  </li>
                </ul>
                <Button
                  className={cn(
                    'w-full',
                    isPopular
                      ? 'bg-primary hover:bg-primary/90'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  )}
                >
                  Select Plan
                </Button>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Add-on Products</h2>
        <div className="bg-card border border-border rounded-md overflow-hidden">
          <table className="erp-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Type</th>
                <th>Price</th>
                <th className="w-32">Action</th>
              </tr>
            </thead>
            <tbody>
              {mockProducts.map((product) => (
                <tr key={product.id}>
                  <td className="font-medium text-foreground">{product.name}</td>
                  <td>{product.type}</td>
                  <td>₹{product.salePrice.toFixed(0)}</td>
                  <td>
                    <Button variant="outline" size="sm" className="h-8">
                      Add
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
