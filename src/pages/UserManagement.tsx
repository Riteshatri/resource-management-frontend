import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Shield, AlertCircle, Users, User, ArrowLeft, Trash2, Lock } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface UserType {
  id: string;
  email: string;
  display_name: string | null;
  role: 'admin' | 'user';
  is_protected: boolean;
  created_at: string;
}

const roleIcons = {
  admin: Shield,
  user: User,
};

const roleColors = {
  admin: 'text-blue-600',
  user: 'text-gray-600',
};

export default function UserManagement() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [selectedUserForReset, setSelectedUserForReset] = useState<any | null>(null);
  const [resetPasswordValue, setResetPasswordValue] = useState('');

  const currentRole = (currentUser as any)?.role;
  const isAdmin = currentRole === 'admin';

  // Fetch all users
  const { data: users = [], isLoading } = useQuery<UserType[]>({
    queryKey: ['all-users'],
    queryFn: async () => {
      return await api.getAllUsers();
    },
    enabled: isAdmin,
  });

  // Update user role mutation
  const updateRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      return await api.updateUserRole(userId, role);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-users'] });
      toast({ title: 'Success', description: 'User role updated successfully!' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error?.response?.data?.detail || 'Failed to update user role', variant: 'destructive' });
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      return await api.deleteUser(userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-users'] });
      toast({ title: 'Success', description: 'User deleted successfully!' });
      setDeleteUserId(null);
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error?.response?.data?.detail || 'Failed to delete user', variant: 'destructive' });
      setDeleteUserId(null);
    },
  });

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: async ({ userId, password }: { userId: string; password: string }) => {
      return await api.resetUserPassword(userId, password);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-users'] });
      toast({ title: 'Success', description: 'Password reset successfully!' });
      setIsResetPasswordModalOpen(false);
      setSelectedUserForReset(null);
      setResetPasswordValue('');
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to reset password', variant: 'destructive' });
    },
  });

  const handleRoleChange = (userId: string, newRole: string) => {
    updateRole.mutate({ userId, role: newRole });
  };

  const handleDeleteConfirm = () => {
    if (deleteUserId) {
      deleteUserMutation.mutate(deleteUserId);
    }
  };

  const handleResetPassword = () => {
    if (!resetPasswordValue || resetPasswordValue.length < 6) {
      toast({ title: 'Error', description: 'Password must be at least 6 characters', variant: 'destructive' });
      return;
    }
    if (selectedUserForReset) {
      resetPasswordMutation.mutate({ userId: selectedUserForReset.id, password: resetPasswordValue });
    }
  };

  const canManageUser = (targetUser: UserType) => {
    // Cannot manage protected users
    if (targetUser.is_protected) return false;
    // Admin can manage non-protected users
    return currentRole === 'admin';
  };

  if (!isAdmin) {
    return (
      <Layout>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium">Access Denied</p>
              <p className="text-sm text-muted-foreground">
                You need admin privileges to access this page
              </p>
            </div>
          </CardContent>
        </Card>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-primary" />
              <div>
                <CardTitle className="text-3xl">User Management</CardTitle>
                <CardDescription>
                  Manage user roles and permissions
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
                <p className="mt-4 text-muted-foreground">Loading users...</p>
              </div>
            ) : users.length === 0 ? (
              <p className="text-center py-12 text-muted-foreground">No users found</p>
            ) : (
              <div className="space-y-4">
                {users.map((user) => {
                  const RoleIcon = roleIcons[user.role];
                  const canManage = canManageUser(user);
                  
                  return (
                    <Card key={user.id}>
                      <CardContent className="py-4">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <RoleIcon className={`h-5 w-5 flex-shrink-0 ${roleColors[user.role]}`} />
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-lg flex items-center gap-2 break-words">
                                  {user.display_name || user.email}
                                  {user.is_protected && (
                                    <div title="Protected User" className="flex-shrink-0">
                                      <Lock className="h-4 w-4 text-yellow-600" />
                                    </div>
                                  )}
                                </h3>
                                <p className="text-sm text-muted-foreground break-all">{user.email}</p>
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Member since {new Date(user.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          
                          <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
                            <div className="w-full sm:w-48">
                              <Select
                                value={user.role}
                                onValueChange={(value) => handleRoleChange(user.id, value)}
                                disabled={!canManage || updateRole.isPending}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="admin">
                                    <div className="flex items-center gap-2">
                                      <Shield className="h-4 w-4 text-blue-600" />
                                      <span>Admin</span>
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="user">
                                    <div className="flex items-center gap-2">
                                      <User className="h-4 w-4 text-gray-600" />
                                      <span>User</span>
                                    </div>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            {user.is_protected ? (
                              <div className="flex items-center gap-2 text-xs text-yellow-700 italic">
                                <Lock className="h-4 w-4 flex-shrink-0" />
                                <span>Protected</span>
                              </div>
                            ) : (
                              <div className="flex gap-2 flex-col sm:flex-row">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedUserForReset(user);
                                    setResetPasswordValue('');
                                    setIsResetPasswordModalOpen(true);
                                  }}
                                  disabled={resetPasswordMutation.isPending}
                                  className="w-full sm:w-auto"
                                >
                                  <Lock className="h-4 w-4 mr-2" />
                                  Reset Password
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => setDeleteUserId(user.id)}
                                  disabled={deleteUserMutation.isPending}
                                  className="w-full sm:w-auto"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteUserId} onOpenChange={() => setDeleteUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
              All user data including resources will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset Password Modal */}
      <Dialog open={isResetPasswordModalOpen} onOpenChange={setIsResetPasswordModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
          </DialogHeader>
          {selectedUserForReset && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Resetting password for: <span className="font-semibold">{selectedUserForReset.email}</span>
                </p>
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={resetPasswordValue}
                  onChange={(e) => setResetPasswordValue(e.target.value)}
                  placeholder="Enter new password (min 6 chars)"
                  className="mt-2"
                />
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={handleResetPassword}
                  disabled={resetPasswordMutation.isPending}
                  className="flex-1"
                >
                  Reset Password
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsResetPasswordModalOpen(false);
                    setSelectedUserForReset(null);
                    setResetPasswordValue('');
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
