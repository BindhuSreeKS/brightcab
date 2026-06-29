import React, { useState } from 'react';
import { Shield, ShieldCheck, ShieldAlert, Plus, Search, Filter, Edit2, Trash2, Check, X } from 'lucide-react';
import { Card, CardHeader, CardContent, Button, Input, Badge } from '../../components/ui';

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
  status: 'active' | 'inactive';
}

const CATEGORIES = ['Drivers', 'Customers', 'Rides', 'Payments', 'Promotions', 'Settings', 'Admins'];

const PERMISSIONS: Permission[] = [
  { id: 'view_drivers', name: 'View Drivers', description: 'Can view driver list and details', category: 'Drivers' },
  { id: 'edit_drivers', name: 'Edit Drivers', description: 'Can edit driver information', category: 'Drivers' },
  { id: 'approve_drivers', name: 'Approve Drivers', description: 'Can approve or reject driver documents', category: 'Drivers' },
  { id: 'view_rides', name: 'View Rides', description: 'Can view ride history and live tracking', category: 'Rides' },
  { id: 'cancel_rides', name: 'Cancel Rides', description: 'Can cancel active rides', category: 'Rides' },
  { id: 'manage_payments', name: 'Manage Payments', description: 'Can process refunds and view transactions', category: 'Payments' },
  { id: 'manage_promos', name: 'Manage Promotions', description: 'Can create and edit promo codes', category: 'Promotions' },
];

const INITIAL_ROLES: Role[] = [
  { id: '1', name: 'Fleet Manager', description: 'Manages drivers and vehicle assignments', permissions: ['view_drivers', 'edit_drivers', 'approve_drivers'], userCount: 12, status: 'active' },
  { id: '2', name: 'Support Agent', description: 'Handles customer queries and ride issues', permissions: ['view_rides', 'cancel_rides'], userCount: 45, status: 'active' },
  { id: '3', name: 'Finance Admin', description: 'Handles payments and settlements', permissions: ['manage_payments'], userCount: 5, status: 'active' },
];

export default function RolePermissionSystem() {
  const [roles, setRoles] = useState<Role[]>(INITIAL_ROLES);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRole, setNewRole] = useState({ name: '', description: '' });

  const togglePermission = (permissionId: string) => {
    if (!selectedRole) return;
    const newPermissions = selectedRole.permissions.includes(permissionId)
      ? selectedRole.permissions.filter(id => id !== permissionId)
      : [...selectedRole.permissions, permissionId];
    
    const updatedRole = { ...selectedRole, permissions: newPermissions };
    setSelectedRole(updatedRole);
    setRoles(roles.map(r => r.id === selectedRole.id ? updatedRole : r));
  };

  const handleCreateRole = (e: React.FormEvent) => {
    e.preventDefault();
    const role: Role = {
      id: Date.now().toString(),
      name: newRole.name,
      description: newRole.description,
      permissions: [],
      userCount: 0,
      status: 'active'
    };
    setRoles([...roles, role]);
    setShowCreateModal(false);
    setNewRole({ name: '', description: '' });
    setSelectedRole(role);
  };

  const handleDeleteRole = () => {
    if (!selectedRole) return;
    if (confirm('Are you sure you want to delete this role?')) {
      setRoles(roles.filter(r => r.id !== selectedRole.id));
      setSelectedRole(null);
    }
  };

  const handleSaveChanges = () => {
    alert('Permissions saved successfully!');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Roles & Permissions</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage role-based access control for the platform</p>
        </div>
        <Button className="flex items-center gap-2" onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4" />
          Create New Role
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Roles List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input className="pl-10" placeholder="Search roles..." />
          </div>
          
          {roles.map(role => (
            <div key={role.id}>
              <Card 
                className={`cursor-pointer transition-all ${selectedRole?.id === role.id ? 'ring-2 ring-indigo-500 border-indigo-500' : 'hover:border-slate-300'}`}
                onClick={() => setSelectedRole(role)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Shield className={`w-4 h-4 ${role.status === 'active' ? 'text-indigo-600' : 'text-slate-400'}`} />
                      <span className="font-semibold text-slate-900 dark:text-white">{role.name}</span>
                    </div>
                    <Badge variant={role.status === 'active' ? 'success' : 'secondary'}>{role.status}</Badge>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">{role.description}</p>
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>{role.userCount} Users assigned</span>
                    <span>{role.permissions.length} Permissions</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Permission Matrix */}
        <div className="lg:col-span-2">
          {selectedRole ? (
            <Card className="h-full">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Permissions for {selectedRole.name}</h2>
                  <p className="text-sm text-slate-500">Configure access levels for this role</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50" onClick={handleDeleteRole}>
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </Button>
                  <Button size="sm" className="flex items-center gap-2" onClick={handleSaveChanges}>
                    <Check className="w-4 h-4" />
                    Save Changes
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {CATEGORIES.map(category => {
                    const categoryPermissions = PERMISSIONS.filter(p => p.category === category);
                    if (categoryPermissions.length === 0) return null;

                    return (
                      <div key={category}>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                          <div className="w-1 h-4 bg-indigo-500 rounded-full" />
                          {category}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {categoryPermissions.map(permission => (
                            <div 
                              key={permission.id}
                              className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                              onClick={() => togglePermission(permission.id)}
                            >
                              <div className={`mt-1 h-5 w-5 rounded border flex items-center justify-center transition-colors ${selectedRole.permissions.includes(permission.id) ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300'}`}>
                                {selectedRole.permissions.includes(permission.id) && <Check className="w-3 h-3" />}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-slate-900 dark:text-white">{permission.name}</p>
                                <p className="text-xs text-slate-500">{permission.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center p-12 text-center">
              <div className="max-w-sm">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Select a Role</h3>
                <p className="text-slate-500">Choose a role from the list on the left to view and manage its specific permissions.</p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Create Role Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-white dark:bg-slate-900 border-none shadow-2xl">
            <CardHeader className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Create New Role</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowCreateModal(false)}>
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleCreateRole} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Role Name</label>
                  <input
                    required
                    value={newRole.name}
                    onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                    placeholder="e.g., Regional Manager"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Description</label>
                  <textarea
                    required
                    value={newRole.description}
                    onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                    placeholder="Describe the role's responsibilities..."
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-indigo-500 min-h-[100px]"
                  />
                </div>
                <div className="pt-4 flex gap-3">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1">
                    Create Role
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
