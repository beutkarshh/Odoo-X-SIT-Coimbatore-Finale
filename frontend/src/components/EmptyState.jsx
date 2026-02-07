import { cn } from '../lib/utils';
import { 
  Package, 
  FileText, 
  CreditCard, 
  Users, 
  Search, 
  FolderOpen,
  Inbox,
  ShoppingCart,
  Bell,
  Settings
} from 'lucide-react';
import { Button } from './ui/Button';

const illustrations = {
  products: Package,
  invoices: FileText,
  subscriptions: Users,
  payments: CreditCard,
  search: Search,
  folder: FolderOpen,
  inbox: Inbox,
  cart: ShoppingCart,
  notifications: Bell,
  settings: Settings,
};

export function EmptyState({
  icon = 'inbox',
  title = 'No data found',
  description = 'There are no items to display at this time.',
  action,
  actionLabel = 'Get Started',
  onAction,
  className,
}) {
  const Icon = typeof icon === 'string' ? illustrations[icon] || Inbox : icon;

  return (
    <div className={cn(
      'flex flex-col items-center justify-center py-16 px-4 text-center',
      className
    )}>
      {/* Illustration Container */}
      <div className="relative mb-6">
        {/* Background circles for depth */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-32 w-32 rounded-full bg-primary/5 animate-pulse" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-24 w-24 rounded-full bg-primary/10" />
        </div>
        {/* Icon */}
        <div className="relative flex items-center justify-center h-20 w-20 rounded-full bg-primary/15 text-primary">
          <Icon className="h-10 w-10" />
        </div>
      </div>

      {/* Content */}
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {title}
      </h3>
      <p className="text-muted-foreground max-w-sm mb-6">
        {description}
      </p>

      {/* Action Button */}
      {(action || onAction) && (
        <Button onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

// Preset Empty States
export function NoProductsFound({ onBrowse }) {
  return (
    <EmptyState
      icon="products"
      title="No Products Found"
      description="We couldn't find any products matching your search criteria. Try adjusting your filters."
      actionLabel="Clear Filters"
      onAction={onBrowse}
    />
  );
}

export function NoSubscriptions({ onBrowse }) {
  return (
    <EmptyState
      icon="subscriptions"
      title="No Active Subscriptions"
      description="You don't have any subscriptions yet. Browse our products to get started."
      actionLabel="Browse Products"
      onAction={onBrowse}
    />
  );
}

export function NoInvoices() {
  return (
    <EmptyState
      icon="invoices"
      title="No Invoices Yet"
      description="Your invoices will appear here once you make a purchase."
    />
  );
}

export function NoSearchResults({ onClear }) {
  return (
    <EmptyState
      icon="search"
      title="No Results Found"
      description="We couldn't find anything matching your search. Try different keywords or filters."
      actionLabel="Clear Search"
      onAction={onClear}
    />
  );
}

export function NoNotifications() {
  return (
    <EmptyState
      icon="notifications"
      title="All Caught Up!"
      description="You have no new notifications at this time."
    />
  );
}

export function EmptyCart({ onBrowse }) {
  return (
    <EmptyState
      icon="cart"
      title="Your Cart is Empty"
      description="Looks like you haven't added any items yet. Start shopping to fill it up!"
      actionLabel="Browse Products"
      onAction={onBrowse}
    />
  );
}

export default EmptyState;
