import { useState, useEffect } from 'react';
import { Layout } from '../../components/Layout/Layout.jsx';
import { PageHeader } from '../../components/ui/PageHeader.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Label } from '../../components/ui/Label.jsx';
import { userService } from '../../lib/services/userService.js';
import { useToast } from '../../hooks/use-toast';
import { Plus, Shield, AlertCircle, Loader2, RefreshCw, Users as UsersIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../components/Modal.jsx';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/Select.jsx';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'INTERNAL',
    isActive: true,
  });
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getAll();
      if (response.success && Array.isArray(response.data)) {
        setUsers(response.data);
      } else {
        setUsers([]);
      }
    } catch (error) {
      setUsers([]);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load users',
      });
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'INTERNAL',
      isActive: true,
    });
    setPasswordError('');
    setIsModalOpen(true);
  };

  const validatePassword = (password) => {
    // Min 8 chars, 1 upper, 1 lower, 1 number, 1 special
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+=\-[\]{}|\\:;"'<>,.\/]).{8,}$/;
    if (!regex.test(password)) {
      return 'Password must be at least 8 characters with uppercase, lowercase, number, and special character';
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    // Validate password strength
    const pwdError = validatePassword(formData.password);
    if (pwdError) {
      setPasswordError(pwdError);
      return;
    }

    setSubmitting(true);
    setPasswordError('');

    try {
      const userData = {
        name: formData.name,
        email: formData.email.toLowerCase(),
        password: formData.password,
        role: formData.role,
        isActive: formData.isActive,
      };

      const response = await userService.create(userData);
      
      if (response.success) {
        toast({
          title: 'Success',
          description: `${formData.role} user created successfully`,
        });
        setIsModalOpen(false);
        loadUsers();
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: response.message || 'Failed to create user',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create user',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-500/10 text-red-500';
      case 'INTERNAL':
        return 'bg-blue-500/10 text-blue-500';
      case 'PORTAL':
        return 'bg-green-500/10 text-green-500';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const userStats = {
    total: users.length,
    admin: users.filter(u => u.role === 'ADMIN').length,
    internal: users.filter(u => u.role === 'INTERNAL').length,
    portal: users.filter(u => u.role === 'PORTAL').length,
    active: users.filter(u => u.isActive).length,
  };

  return (
    <Layout type="admin">
      <PageHeader
        title="User Management"
        action={
          <div className="flex gap-2">
            <Button 
              onClick={loadUsers} 
              variant="outline"
              disabled={loading}
              className="gap-2"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Refresh
            </Button>
            <Button onClick={openCreateModal} className="bg-primary hover:bg-primary/90">
              <Plus size={16} className="mr-2" />
              Create User
            </Button>
          </div>
        }
      />

      {/* User Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-sm text-muted-foreground mb-1">Total Users</div>
          <div className="text-2xl font-bold text-foreground">{userStats.total}</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-sm text-muted-foreground mb-1">Admin</div>
          <div className="text-2xl font-bold text-red-500">{userStats.admin}</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-sm text-muted-foreground mb-1">Internal</div>
          <div className="text-2xl font-bold text-blue-500">{userStats.internal}</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-sm text-muted-foreground mb-1">Portal</div>
          <div className="text-2xl font-bold text-green-500">{userStats.portal}</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-sm text-muted-foreground mb-1">Active</div>
          <div className="text-2xl font-bold text-primary">{userStats.active}</div>
        </div>
      </div>

      <div className="mb-4 p-4 bg-muted/50 rounded-md flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-primary mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">Admin Privileges Required</p>
          <p className="text-xs text-muted-foreground mt-1">
            Only administrators can create INTERNAL users. ADMIN users cannot be created through this interface.
            Portal users are created through public signup.
          </p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-md overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <UsersIcon size={48} className="mb-4 opacity-50" />
            <p className="text-lg font-medium">No users found</p>
            <p className="text-sm">Create your first user to get started</p>
          </div>
        ) : (
          <table className="erp-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Created Date</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="font-medium text-foreground">{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                      {user.role === 'ADMIN' && <Shield size={12} />}
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${
                        user.isActive
                          ? 'bg-success/10 text-success'
                          : 'bg-destructive/10 text-destructive'
                      }`}
                    >
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>{formatDate(user.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div>
              <Label htmlFor="name" className="form-label">
                Full Name
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                className="form-input"
                required
              />
            </div>

            <div>
              <Label htmlFor="email" className="form-label">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                className="form-input"
                required
              />
            </div>

            <div>
              <Label htmlFor="role" className="form-label">
                User Role
              </Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, role: value }))}
              >
                <SelectTrigger className="form-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INTERNAL">Internal User (Staff)</SelectItem>
                  <SelectItem value="PORTAL">Portal User (Customer)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                ADMIN users cannot be created through this interface
              </p>
            </div>

            <div>
              <Label htmlFor="password" className="form-label">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                className="form-input"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Min 8 chars, uppercase, lowercase, number, special character
              </p>
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="form-label">
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))
                }
                className="form-input"
                required
              />
            </div>

            {passwordError && (
              <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md">
                {passwordError}
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
                className="h-4 w-4"
              />
              <Label htmlFor="isActive" className="text-sm cursor-pointer">
                Active User
              </Label>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create User'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
