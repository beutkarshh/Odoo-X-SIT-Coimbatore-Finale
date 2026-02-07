import { useState, useEffect } from 'react';
import { Layout } from '../../components/Layout/Layout.jsx';
import { PageHeader } from '../../components/ui/PageHeader.jsx';
import { StatusBadge } from '../../components/StatusBadge.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { getSubscriptionsWithDetails, getPendingInternalRequests, approveInternalRequest, rejectInternalRequest } from '../../data/mockData.js';
import { SubscriptionStatus, SUBSCRIPTION_TRANSITIONS, InternalRequestStatus } from '../../data/constants.js';
import { ChevronDown, UserPlus, Check, X, Clock } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/DropdownMenu.jsx';

export default function AdminSubscriptions() {
  const [subscriptions, setSubscriptions] = useState(getSubscriptionsWithDetails());
  const [pendingRequests, setPendingRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('subscriptions');

  useEffect(() => {
    // Load pending requests
    const requests = getPendingInternalRequests().filter(r => r.status === InternalRequestStatus.PENDING);
    setPendingRequests(requests);
  }, []);

  const getNextActions = (status) => {
    return SUBSCRIPTION_TRANSITIONS[status] || [];
  };

  const handleStatusChange = (subscriptionId, newStatus) => {
    setSubscriptions((prev) =>
      prev.map((sub) => (sub.id === subscriptionId ? { ...sub, status: newStatus } : sub))
    );
  };

  const handleApproveRequest = (requestId) => {
    if (approveInternalRequest(requestId)) {
      setPendingRequests(prev => prev.filter(r => r.id !== requestId));
    }
  };

  const handleRejectRequest = (requestId) => {
    if (rejectInternalRequest(requestId)) {
      setPendingRequests(prev => prev.filter(r => r.id !== requestId));
    }
  };

  const getActionLabel = (status) => {
    const labels = {
      [SubscriptionStatus.DRAFT]: 'Move to Draft',
      [SubscriptionStatus.QUOTATION]: 'Send Quotation',
      [SubscriptionStatus.CONFIRMED]: 'Confirm',
      [SubscriptionStatus.ACTIVE]: 'Activate',
      [SubscriptionStatus.CLOSED]: 'Close',
    };
    return labels[status];
  };

  return (
    <Layout type="admin">
      <PageHeader title="Subscriptions" />

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('subscriptions')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'subscriptions'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          Subscriptions
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'requests'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          <UserPlus size={16} />
          Pending Requests
          {pendingRequests.length > 0 && (
            <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
              activeTab === 'requests' ? 'bg-primary-foreground text-primary' : 'bg-destructive text-destructive-foreground'
            }`}>
              {pendingRequests.length}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'subscriptions' ? (
        <>
          <div className="bg-card border border-border rounded-md overflow-hidden">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Number</th>
                  <th>Customer</th>
                  <th>Plan</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Status</th>
                  <th className="w-32">Actions</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((subscription) => {
                  const nextActions = getNextActions(subscription.status);

                  return (
                    <tr key={subscription.id}>
                      <td className="font-medium text-foreground">{subscription.number}</td>
                      <td>{subscription.user?.name}</td>
                      <td>{subscription.plan?.name}</td>
                      <td>{new Date(subscription.startDate).toLocaleDateString()}</td>
                      <td>{new Date(subscription.endDate).toLocaleDateString()}</td>
                      <td>
                        <StatusBadge status={subscription.status} />
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
                                  onClick={() => handleStatusChange(subscription.id, action)}
                                >
                                  {getActionLabel(action)}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ) : (
                          <span className="text-xs text-muted-foreground">No actions</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-6 p-4 bg-muted/50 rounded-md">
            <h3 className="text-sm font-medium text-foreground mb-3">Subscription Lifecycle</h3>
            <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
              <StatusBadge status={SubscriptionStatus.DRAFT} />
              <span>→</span>
              <StatusBadge status={SubscriptionStatus.QUOTATION} />
              <span>→</span>
              <StatusBadge status={SubscriptionStatus.CONFIRMED} />
              <span>→</span>
              <StatusBadge status={SubscriptionStatus.ACTIVE} />
              <span>→</span>
              <StatusBadge status={SubscriptionStatus.CLOSED} />
            </div>
          </div>
        </>
      ) : (
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-md p-4">
            <div className="flex items-center gap-2 mb-4">
              <Clock size={20} className="text-warning" />
              <h3 className="text-lg font-semibold text-foreground">Pending Internal User Requests</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Review and approve or reject internal staff registration requests.
            </p>
          </div>

          {pendingRequests.length > 0 ? (
            <div className="bg-card border border-border rounded-md overflow-hidden">
              <table className="erp-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Requested On</th>
                    <th>Status</th>
                    <th className="w-40">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingRequests.map((request) => (
                    <tr key={request.id}>
                      <td className="font-medium text-foreground">{request.name}</td>
                      <td>{request.email}</td>
                      <td>
                        <div>
                          <p className="text-sm">{new Date(request.createdAt).toLocaleDateString()}</p>
                          <p className="text-xs text-muted-foreground">{new Date(request.createdAt).toLocaleTimeString()}</p>
                        </div>
                      </td>
                      <td>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-warning/10 text-warning border border-warning/20">
                          Pending
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            className="h-8 bg-success hover:bg-success/90"
                            onClick={() => handleApproveRequest(request.id)}
                          >
                            <Check size={14} className="mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="h-8"
                            onClick={() => handleRejectRequest(request.id)}
                          >
                            <X size={14} className="mr-1" />
                            Reject
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-md p-12 text-center">
              <UserPlus size={48} className="mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-foreground mb-2">No Pending Requests</p>
              <p className="text-sm text-muted-foreground">
                There are no internal user registration requests waiting for approval.
              </p>
            </div>
          )}
        </div>
      )}
    </Layout>
  );
}
