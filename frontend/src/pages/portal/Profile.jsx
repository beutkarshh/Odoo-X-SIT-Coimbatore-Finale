import { useState, useRef, useEffect } from 'react';
import { Layout } from '../../components/Layout/Layout.jsx';
import { PageHeader } from '../../components/ui/PageHeader.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Label } from '../../components/ui/Label.jsx';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { ProfileSkeleton } from '../../components/LoadingSkeleton.jsx';
import {
  User,
  Camera,
  MapPin,
  Bell,
  Shield,
  Trash2,
  History,
  X,
  Check,
  Edit2,
  Building,
  Phone,
  Mail,
  Save,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../components/Modal.jsx';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../components/ui/tabs.tsx';
import { Switch } from '../../components/ui/switch.tsx';

export default function PortalProfile() {
  const { user, logout } = useAuth();
  const fileInputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('account');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [isImageCropOpen, setIsImageCropOpen] = useState(false);
  const [tempImage, setTempImage] = useState(null);

  // Form data
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    company: user?.company || '',
    phone: user?.phone || '',
  });

  // Addresses
  const [addresses, setAddresses] = useState({
    billing: {
      name: user?.name || '',
      street: '123 Main Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      country: 'India',
      phone: '+91 9876543210',
    },
    shipping: {
      name: user?.name || '',
      street: '123 Main Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      country: 'India',
      phone: '+91 9876543210',
      sameAsBilling: true,
    },
  });

  // Notifications
  const [notifications, setNotifications] = useState({
    email: {
      invoices: true,
      subscriptions: true,
      promotions: false,
      security: true,
    },
    push: {
      invoices: false,
      subscriptions: true,
      promotions: false,
      security: true,
    },
  });

  // Activity log
  const [activityLog] = useState([
    { id: 1, action: 'Logged in', device: 'Chrome on Windows', ip: '192.168.1.1', time: new Date() },
    { id: 2, action: 'Updated profile', device: 'Chrome on Windows', ip: '192.168.1.1', time: new Date(Date.now() - 86400000) },
    { id: 3, action: 'Subscribed to Pro Plan', device: 'Mobile Safari', ip: '192.168.1.2', time: new Date(Date.now() - 172800000) },
    { id: 4, action: 'Payment successful', device: 'Chrome on Windows', ip: '192.168.1.1', time: new Date(Date.now() - 259200000) },
    { id: 5, action: 'Password changed', device: 'Chrome on Windows', ip: '192.168.1.1', time: new Date(Date.now() - 604800000) },
  ]);

  // Editing states
  const [editingAddress, setEditingAddress] = useState(null);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsEditing(false);
    // Save to localStorage or API
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempImage(reader.result);
        setIsImageCropOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropConfirm = () => {
    setProfileImage(tempImage);
    setIsImageCropOpen(false);
    setTempImage(null);
  };

  const handleAddressChange = (type, field, value) => {
    setAddresses(prev => ({
      ...prev,
      [type]: { ...prev[type], [field]: value }
    }));
  };

  const handleNotificationChange = (category, type, value) => {
    setNotifications(prev => ({
      ...prev,
      [category]: { ...prev[category], [type]: value }
    }));
  };

  const handleDeleteAccount = () => {
    if (deleteConfirmText === 'DELETE') {
      logout();
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <Layout type="portal">
        <PageHeader title="My Profile" />
        <div className="max-w-4xl">
          <ProfileSkeleton />
        </div>
      </Layout>
    );
  }

  return (
    <Layout type="portal">
      <PageHeader title="My Profile" />

      <div className="max-w-4xl">
        {/* Profile Header */}
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Profile Picture */}
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center overflow-hidden border-4 border-background shadow-lg">
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-muted-foreground" />
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-colors"
              >
                <Camera className="w-4 h-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-foreground">{user?.name}</h2>
              <p className="text-muted-foreground flex items-center gap-2 mt-1">
                <Mail className="w-4 h-4" />
                {user?.email}
              </p>
              {user?.company && (
                <p className="text-muted-foreground flex items-center gap-2 mt-1">
                  <Building className="w-4 h-4" />
                  {user.company}
                </p>
              )}
              <div className="mt-3">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary capitalize">
                  {user?.role || 'Customer'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full">
            <TabsTrigger value="account" className="gap-2">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Account</span>
            </TabsTrigger>
            <TabsTrigger value="addresses" className="gap-2">
              <MapPin className="w-4 h-4" />
              <span className="hidden sm:inline">Addresses</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
          </TabsList>

          {/* Account Tab */}
          <TabsContent value="account" className="space-y-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-foreground">Account Information</h3>
                {!isEditing && (
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                )}
              </div>

              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="+91 9876543210"
                      className="mt-1"
                    />
                  </div>
                </div>

                {isEditing && (
                  <div className="flex gap-3 mt-6">
                    <Button type="submit">
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false);
                        setFormData({
                          name: user?.name || '',
                          email: user?.email || '',
                          company: user?.company || '',
                          phone: user?.phone || '',
                        });
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </form>
            </div>
          </TabsContent>

          {/* Addresses Tab */}
          <TabsContent value="addresses" className="space-y-6">
            {/* Billing Address */}
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Billing Address</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingAddress(editingAddress === 'billing' ? null : 'billing')}
                >
                  {editingAddress === 'billing' ? <X className="w-4 h-4 mr-2" /> : <Edit2 className="w-4 h-4 mr-2" />}
                  {editingAddress === 'billing' ? 'Cancel' : 'Edit'}
                </Button>
              </div>

              {editingAddress === 'billing' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Name</Label>
                    <Input
                      value={addresses.billing.name}
                      onChange={(e) => handleAddressChange('billing', 'name', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input
                      value={addresses.billing.phone}
                      onChange={(e) => handleAddressChange('billing', 'phone', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Street Address</Label>
                    <Input
                      value={addresses.billing.street}
                      onChange={(e) => handleAddressChange('billing', 'street', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>City</Label>
                    <Input
                      value={addresses.billing.city}
                      onChange={(e) => handleAddressChange('billing', 'city', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>State</Label>
                    <Input
                      value={addresses.billing.state}
                      onChange={(e) => handleAddressChange('billing', 'state', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Pincode</Label>
                    <Input
                      value={addresses.billing.pincode}
                      onChange={(e) => handleAddressChange('billing', 'pincode', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Country</Label>
                    <Input
                      value={addresses.billing.country}
                      onChange={(e) => handleAddressChange('billing', 'country', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Button onClick={() => setEditingAddress(null)}>
                      <Check className="w-4 h-4 mr-2" />
                      Save Address
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-foreground space-y-1">
                  <p className="font-medium">{addresses.billing.name}</p>
                  <p>{addresses.billing.street}</p>
                  <p>{addresses.billing.city}, {addresses.billing.state} {addresses.billing.pincode}</p>
                  <p>{addresses.billing.country}</p>
                  <p className="text-muted-foreground">{addresses.billing.phone}</p>
                </div>
              )}
            </div>

            {/* Shipping Address */}
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Shipping Address</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingAddress(editingAddress === 'shipping' ? null : 'shipping')}
                >
                  {editingAddress === 'shipping' ? <X className="w-4 h-4 mr-2" /> : <Edit2 className="w-4 h-4 mr-2" />}
                  {editingAddress === 'shipping' ? 'Cancel' : 'Edit'}
                </Button>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <Switch
                  checked={addresses.shipping.sameAsBilling}
                  onCheckedChange={(checked) => handleAddressChange('shipping', 'sameAsBilling', checked)}
                />
                <Label className="text-sm">Same as billing address</Label>
              </div>

              {!addresses.shipping.sameAsBilling && (
                editingAddress === 'shipping' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Name</Label>
                      <Input
                        value={addresses.shipping.name}
                        onChange={(e) => handleAddressChange('shipping', 'name', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <Input
                        value={addresses.shipping.phone}
                        onChange={(e) => handleAddressChange('shipping', 'phone', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label>Street Address</Label>
                      <Input
                        value={addresses.shipping.street}
                        onChange={(e) => handleAddressChange('shipping', 'street', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>City</Label>
                      <Input
                        value={addresses.shipping.city}
                        onChange={(e) => handleAddressChange('shipping', 'city', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>State</Label>
                      <Input
                        value={addresses.shipping.state}
                        onChange={(e) => handleAddressChange('shipping', 'state', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Pincode</Label>
                      <Input
                        value={addresses.shipping.pincode}
                        onChange={(e) => handleAddressChange('shipping', 'pincode', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Country</Label>
                      <Input
                        value={addresses.shipping.country}
                        onChange={(e) => handleAddressChange('shipping', 'country', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Button onClick={() => setEditingAddress(null)}>
                        <Check className="w-4 h-4 mr-2" />
                        Save Address
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-foreground space-y-1">
                    <p className="font-medium">{addresses.shipping.name}</p>
                    <p>{addresses.shipping.street}</p>
                    <p>{addresses.shipping.city}, {addresses.shipping.state} {addresses.shipping.pincode}</p>
                    <p>{addresses.shipping.country}</p>
                    <p className="text-muted-foreground">{addresses.shipping.phone}</p>
                  </div>
                )
              )}
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-6">Email Notifications</h3>
              <div className="space-y-4">
                {[
                  { key: 'invoices', label: 'Invoice & Billing', desc: 'Receive emails for new invoices and payment confirmations' },
                  { key: 'subscriptions', label: 'Subscription Updates', desc: 'Get notified about subscription changes and renewals' },
                  { key: 'promotions', label: 'Promotions & Offers', desc: 'Receive special offers and promotional emails' },
                  { key: 'security', label: 'Security Alerts', desc: 'Important notifications about your account security' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between py-2">
                    <div>
                      <p className="font-medium text-foreground">{item.label}</p>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                    <Switch
                      checked={notifications.email[item.key]}
                      onCheckedChange={(checked) => handleNotificationChange('email', item.key, checked)}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-6">Push Notifications</h3>
              <div className="space-y-4">
                {[
                  { key: 'invoices', label: 'Invoice & Billing', desc: 'Push notifications for payment updates' },
                  { key: 'subscriptions', label: 'Subscription Updates', desc: 'Push notifications for subscription changes' },
                  { key: 'promotions', label: 'Promotions & Offers', desc: 'Push notifications for special offers' },
                  { key: 'security', label: 'Security Alerts', desc: 'Push notifications for security events' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between py-2">
                    <div>
                      <p className="font-medium text-foreground">{item.label}</p>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                    <Switch
                      checked={notifications.push[item.key]}
                      onCheckedChange={(checked) => handleNotificationChange('push', item.key, checked)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            {/* Password Section */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Password</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Last changed: Never
              </p>
              <Button variant="outline">Change Password</Button>
            </div>

            {/* Activity Log */}
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <History className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">Activity Log</h3>
              </div>
              <div className="space-y-4">
                {activityLog.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-4 py-3 border-b border-border last:border-0">
                    <div className="w-2 h-2 mt-2 rounded-full bg-primary" />
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{activity.action}</p>
                      <p className="text-sm text-muted-foreground">
                        {activity.device} • {activity.ip}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(activity.time)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-card border border-destructive/30 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-2">
                <Trash2 className="w-5 h-5 text-destructive" />
                <h3 className="text-lg font-semibold text-destructive">Danger Zone</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <Button variant="destructive" onClick={() => setIsDeleteModalOpen(true)}>
                Delete Account
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Image Crop Modal */}
      <Dialog open={isImageCropOpen} onOpenChange={setIsImageCropOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Crop Profile Picture</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            {tempImage && (
              <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-border">
                <img src={tempImage} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
            <p className="text-sm text-muted-foreground text-center">
              Your profile picture will be cropped to a circle
            </p>
            <div className="flex gap-3">
              <Button onClick={handleCropConfirm}>
                <Check className="w-4 h-4 mr-2" />
                Apply
              </Button>
              <Button variant="outline" onClick={() => setIsImageCropOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Account Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive">Delete Account</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">
              This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
            </p>
            <p className="text-sm text-foreground mb-2">
              Please type <span className="font-bold">DELETE</span> to confirm:
            </p>
            <Input
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="Type DELETE"
              className="mb-4"
            />
            <div className="flex gap-3">
              <Button
                variant="destructive"
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== 'DELETE'}
              >
                Delete Account
              </Button>
              <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
