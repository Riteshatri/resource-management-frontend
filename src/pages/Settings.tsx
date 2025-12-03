import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  UserCircle2, 
  Plus,
  Pencil,
  Trash2,
  Save,
  Server,
  Globe,
  Link2,
  Database,
  HardDrive,
  Network,
  Key,
  Box,
  FolderOpen,
  Cloud,
  Shield,
  Zap,
  Activity,
  Cpu,
  Boxes,
  Container,
  Folder,
  Lock
} from 'lucide-react';
import { api } from '@/lib/api';

interface Resource {
  id: number;
  icon: string;
  title: string;
  resource_name: string;
  description: string;
  status: string;
  region: string;
  created_at: string;
}

const iconOptions = [
  { value: 'server', label: 'Virtual Machine', Icon: Server },
  { value: 'globe', label: 'Website / App', Icon: Globe },
  { value: 'link', label: 'Subdomain / Link', Icon: Link2 },
  { value: 'database', label: 'SQL Database', Icon: Database },
  { value: 'hard_drive', label: 'Storage Account', Icon: HardDrive },
  { value: 'network', label: 'Virtual Network', Icon: Network },
  { value: 'key', label: 'Key Vault', Icon: Key },
  { value: 'box', label: 'Container', Icon: Box },
  { value: 'folder_open', label: 'Resource Group', Icon: FolderOpen },
  { value: 'cloud', label: 'Cloud Service', Icon: Cloud },
  { value: 'shield', label: 'Firewall / Security', Icon: Shield },
  { value: 'zap', label: 'Load Balancer', Icon: Zap },
  { value: 'activity', label: 'Front Door / CDN', Icon: Activity },
  { value: 'cpu', label: 'Function App', Icon: Cpu },
  { value: 'boxes', label: 'App Service', Icon: Boxes },
  { value: 'container', label: 'Container Registry', Icon: Container },
  { value: 'folder', label: 'Backup / Archive', Icon: Folder },
  { value: 'lock', label: 'Private Endpoint', Icon: Lock },
];

export default function Settings() {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const queryClient = useQueryClient();

  // Creator Info Form State
  const [creatorName, setCreatorName] = useState('');
  const [creatorTagline, setCreatorTagline] = useState('');

  // Resource Modal State
  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [resourceForm, setResourceForm] = useState({
    icon: 'server',
    title: '',
    resource_name: '',
    description: '',
    status: 'Running',
    region: 'East US',
    created_at: new Date().toISOString().slice(0, 16)
  });


  // Fetch user data
  useEffect(() => {
    if (user) {
      setCreatorName((user as any).display_name || '');
      setCreatorTagline((user as any).tagline || '');
    }
  }, [user]);

  // Fetch resources
  const { data: resources = [], isLoading: resourcesLoading } = useQuery<Resource[]>({
    queryKey: ['resources'],
    queryFn: async (): Promise<Resource[]> => {
      const response = await api.getResources();
      return (Array.isArray(response) ? response : []) as Resource[];
    },
  });


  // Update Creator Info
  const updateCreatorInfo = useMutation({
    mutationFn: async () => {
      return await api.updateUserProfile({
        display_name: creatorName,
        tagline: creatorTagline
      });
    },
    onSuccess: async () => {
      // Refresh AuthContext user profile
      await refreshProfile();
      toast.success('Creator information updated successfully!');
    },
    onError: () => {
      toast.error('Failed to update creator information');
    },
  });

  // Create Resource
  const createResource = useMutation({
    mutationFn: async (data: typeof resourceForm) => {
      return await api.createResource(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      toast.success('Resource created successfully!');
      closeResourceModal();
    },
    onError: () => {
      // Silently fail - don't show error toast
    },
  });

  // Update Resource
  const updateResource = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: typeof resourceForm }) => {
      return await api.updateResource(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      toast.success('Resource updated successfully!');
      closeResourceModal();
    },
    onError: () => {
      // Silently fail - don't show error toast
    },
  });

  // Delete Resource
  const deleteResource = useMutation({
    mutationFn: async (id: number) => {
      return await api.deleteResource(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      toast.success('Resource deleted successfully!');
    },
    onError: () => {
      // Silently fail - don't show error toast
    },
  });


  const handleSaveCreatorInfo = () => {
    updateCreatorInfo.mutate();
  };

  const openAddResourceModal = () => {
    setEditingResource(null);
    setResourceForm({
      icon: 'server',
      title: '',
      resource_name: '',
      description: '',
      status: 'Running',
      region: 'East US',
      created_at: new Date().toISOString().slice(0, 16)
    });
    setIsResourceModalOpen(true);
  };

  const openEditResourceModal = (resource: Resource) => {
    setEditingResource(resource);
    setResourceForm({
      icon: resource.icon,
      title: resource.title,
      resource_name: resource.resource_name,
      description: resource.description,
      status: resource.status,
      region: resource.region,
      created_at: new Date(resource.created_at).toISOString().slice(0, 16)
    });
    setIsResourceModalOpen(true);
  };

  const closeResourceModal = () => {
    setIsResourceModalOpen(false);
    setEditingResource(null);
    setResourceForm({
      icon: 'server',
      title: '',
      resource_name: '',
      description: '',
      status: 'Running',
      region: 'East US',
      created_at: new Date().toISOString().slice(0, 16)
    });
  };

  const handleSaveResource = () => {
    if (editingResource) {
      updateResource.mutate({ id: editingResource.id, data: resourceForm });
    } else {
      createResource.mutate(resourceForm);
    }
  };

  const handleDeleteResource = (id: number) => {
    if (confirm('Are you sure you want to delete this resource?')) {
      deleteResource.mutate(id);
    }
  };


  const getIconComponent = (iconName: string) => {
    const icon = iconOptions.find(opt => opt.value === iconName);
    return icon ? icon.Icon : Server;
  };

  return (
    <Layout>
      <div className="p-6 max-w-6xl mx-auto">
        <div className="mb-8 flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground mt-1">
              Edit your dashboard resources and information
            </p>
          </div>
        </div>

        {/* Creator Information Section */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-primary/10">
                <UserCircle2 className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Creator Information</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="creator-name">Your Name</Label>
              <Input
                id="creator-name"
                value={creatorName}
                onChange={(e) => setCreatorName(e.target.value)}
                placeholder="Your Name Here"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="creator-tagline">Tagline</Label>
              <Textarea
                id="creator-tagline"
                value={creatorTagline}
                onChange={(e) => setCreatorTagline(e.target.value)}
                placeholder="Built with passion using modern cloud technologies"
                className="mt-2"
                rows={4}
              />
            </div>
            <Button
              onClick={handleSaveCreatorInfo}
              disabled={updateCreatorInfo.isPending}
              className="w-full"
            >
              <Save className="mr-2 h-4 w-4" />
              Save Creator Info
            </Button>
          </CardContent>
        </Card>

        {/* Edit Resources Section - Admin Only */}
        {user?.role === 'admin' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Edit Resources</h2>
            <Button onClick={openAddResourceModal}>
              <Plus className="mr-2 h-4 w-4" />
              Add Resource
            </Button>
          </div>

          {resourcesLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
              <p className="mt-4 text-muted-foreground">Loading resources...</p>
            </div>
          ) : resources.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No resources yet. Add your first resource to get started!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {resources.map((resource) => {
                const IconComponent = getIconComponent(resource.icon);
                return (
                  <Card key={resource.id}>
                    <CardContent className="py-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <IconComponent className="h-5 w-5 text-primary" />
                            <h3 className="text-sm font-medium text-muted-foreground">
                              {resource.title}
                            </h3>
                          </div>
                          <h4 className="text-xl font-bold text-primary mb-1">
                            {resource.resource_name}
                          </h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            {resource.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                              <div className={`w-2 h-2 rounded-full ${
                                resource.status?.toLowerCase().includes('run') ? 'bg-green-500' :
                                resource.status?.toLowerCase().includes('stop') ? 'bg-red-500' :
                                'bg-yellow-500'
                              }`} />
                              <span className={
                                resource.status?.toLowerCase().includes('run') ? 'text-green-600' :
                                resource.status?.toLowerCase().includes('stop') ? 'text-red-600' :
                                'text-yellow-600'
                              }>{resource.status}</span>
                            </div>
                            <span>• {resource.region}</span>
                            <span>• Created {new Date(resource.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditResourceModal(resource)}
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="ml-2">Edit</span>
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => handleDeleteResource(resource.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
        )}


        {/* Resource Edit Modal */}
        <Dialog open={isResourceModalOpen} onOpenChange={setIsResourceModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingResource ? 'Edit Resource' : 'Add Resource'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="resource-icon">Icon</Label>
                <Select
                  value={resourceForm.icon}
                  onValueChange={(value) => setResourceForm({ ...resourceForm, icon: value })}
                >
                  <SelectTrigger id="resource-icon" className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {iconOptions.map((option) => {
                      const Icon = option.Icon;
                      return (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            <span>{option.label}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="resource-title">Resource Title</Label>
                <Input
                  id="resource-title"
                  value={resourceForm.title}
                  onChange={(e) => setResourceForm({ ...resourceForm, title: e.target.value })}
                  placeholder="Virtual Machine"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="resource-name">Resource Name/Value</Label>
                <Input
                  id="resource-name"
                  value={resourceForm.resource_name}
                  onChange={(e) => setResourceForm({ ...resourceForm, resource_name: e.target.value })}
                  placeholder="VM-Server-01"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="resource-description">Description</Label>
                <Textarea
                  id="resource-description"
                  value={resourceForm.description}
                  onChange={(e) => setResourceForm({ ...resourceForm, description: e.target.value })}
                  placeholder="Your primary virtual machine instance"
                  className="mt-2"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="resource-status">Status</Label>
                  <Select
                    value={resourceForm.status}
                    onValueChange={(value) => setResourceForm({ ...resourceForm, status: value })}
                  >
                    <SelectTrigger id="resource-status" className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Running">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                          <span>Running</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Stopped">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-red-500" />
                          <span>Stopped</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Pending">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-yellow-500" />
                          <span>Pending</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="resource-region">Region</Label>
                  <Input
                    id="resource-region"
                    value={resourceForm.region}
                    onChange={(e) => setResourceForm({ ...resourceForm, region: e.target.value })}
                    placeholder="East US"
                    className="mt-2"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="resource-created-at">Created Date</Label>
                <Input
                  id="resource-created-at"
                  type="datetime-local"
                  value={resourceForm.created_at}
                  onChange={(e) => setResourceForm({ ...resourceForm, created_at: e.target.value })}
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">Set when this resource was created</p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleSaveResource}
                  disabled={createResource.isPending || updateResource.isPending}
                  className="flex-1"
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save
                </Button>
                <Button
                  variant="outline"
                  onClick={closeResourceModal}
                  className="flex-1"
                >
                  Cancel
                </Button>
                {editingResource && (
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => {
                      handleDeleteResource(editingResource.id);
                      closeResourceModal();
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
