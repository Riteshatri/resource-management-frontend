import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  ArrowLeft, 
  Server, 
  Globe, 
  Link2, 
  Database, 
  HardDrive, 
  Network,
  Key,
  Box,
  FolderOpen,
  MapPin,
  Calendar,
  Activity,
  Cloud,
  Shield,
  Zap,
  Cpu,
  Boxes,
  Container,
  Folder,
  Lock,
  Plus,
  Check
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

interface Template {
  id: number;
  title: string;
  resource_name: string;
  description: string;
  icon: string;
  status: string;
  region: string;
}

// Icon mapping
const iconMap: Record<string, any> = {
  server: Server,
  globe: Globe,
  link: Link2,
  database: Database,
  hard_drive: HardDrive,
  network: Network,
  key: Key,
  box: Box,
  folder_open: FolderOpen,
  cloud: Cloud,
  shield: Shield,
  zap: Zap,
  activity: Activity,
  cpu: Cpu,
  boxes: Boxes,
  container: Container,
  folder: Folder,
  lock: Lock,
};

export default function Resources() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [selectedTemplates, setSelectedTemplates] = useState<Set<number>>(new Set());
  const [isImporting, setIsImporting] = useState(false);

  // Fetch current user
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const response = await api.getProfile();
      return response;
    },
  });

  // Fetch resources from API
  const { data: resources = [], isLoading } = useQuery<Resource[]>({
    queryKey: ['resources'],
    queryFn: async (): Promise<Resource[]> => {
      const response = await api.getResources();
      return (Array.isArray(response) ? response : []) as Resource[];
    },
  });

  const isAdmin = currentUser?.role === 'admin';

  // Fetch templates
  const { data: templates = [] } = useQuery<Template[]>({
    queryKey: ['templates'],
    queryFn: async (): Promise<Template[]> => {
      const response = await api.getTemplates();
      return (Array.isArray(response) ? response : []) as Template[];
    },
    enabled: showTemplateSelector,
  });

  const handleResourceClick = (resource: Resource) => {
    setSelectedResource(resource);
    setIsModalOpen(true);
  };

  const handleTemplateToggle = (templateId: number) => {
    const newSelected = new Set(selectedTemplates);
    if (newSelected.has(templateId)) {
      newSelected.delete(templateId);
    } else {
      newSelected.add(templateId);
    }
    setSelectedTemplates(newSelected);
  };

  const handleImportSelected = async () => {
    try {
      setIsImporting(true);
      const templateIds = Array.from(selectedTemplates);
      await api.importTemplates(templateIds);
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      setShowTemplateSelector(false);
      setSelectedTemplates(new Set());
    } catch (error) {
      console.error('Failed to import templates:', error);
    } finally {
      setIsImporting(false);
    }
  };

  const getStatusColor = (status: string) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower.includes('run')) return 'bg-green-500';
    if (statusLower.includes('stop')) return 'bg-red-500';
    if (statusLower.includes('pend')) return 'bg-yellow-500';
    return 'bg-gray-500';
  };

  const getIconComponent = (iconName: string) => {
    return iconMap[iconName] || Server;
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="p-6 max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
              <p className="mt-4 text-muted-foreground">Loading resources...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        <div className="mb-6 sm:mb-8 flex items-center gap-3 sm:gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Your Resources</h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              Manage and monitor your infrastructure
            </p>
          </div>
        </div>

        {resources.length === 0 ? (
          <div className="space-y-6">
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground mb-6">
                  No resources found. {isAdmin && 'Select Azure templates below to get started.'}
                </p>
                {isAdmin && (
                  <Button 
                    onClick={() => setShowTemplateSelector(true)} 
                    className="bg-blue-600 hover:bg-blue-700 gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Template Resources
                  </Button>
                )}
              </CardContent>
            </Card>

            {showTemplateSelector && (
              <Card className="border-blue-200 dark:border-blue-900 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20">
                <CardHeader>
                  <CardTitle className="text-lg">Available Azure Services</CardTitle>
                  <CardDescription>
                    Click to select templates you want to add ({selectedTemplates.size} selected)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {templates.map((template) => {
                      const IconComponent = getIconComponent(template.icon);
                      const isSelected = selectedTemplates.has(template.id);
                      
                      return (
                        <div
                          key={template.id}
                          onClick={() => handleTemplateToggle(template.id)}
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                            isSelected
                              ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-500'
                              : 'border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600 bg-white dark:bg-slate-900/50'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg mt-1 ${
                              isSelected 
                                ? 'bg-blue-600' 
                                : 'bg-gray-100 dark:bg-gray-800'
                            }`}>
                              <IconComponent className={`h-5 w-5 ${
                                isSelected 
                                  ? 'text-white' 
                                  : 'text-gray-600 dark:text-gray-400'
                              }`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-sm text-foreground truncate">
                                {template.title}
                              </h3>
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                {template.description}
                              </p>
                            </div>
                            {isSelected && (
                              <Check className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex gap-3 pt-4 border-t">
                    <Button
                      onClick={handleImportSelected}
                      disabled={selectedTemplates.size === 0 || isImporting}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      {isImporting ? 'Adding...' : `Add ${selectedTemplates.size} Template(s)`}
                    </Button>
                    <Button
                      onClick={() => {
                        setShowTemplateSelector(false);
                        setSelectedTemplates(new Set());
                      }}
                      variant="outline"
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <>
            {isAdmin && (
              <div className="mb-6 flex gap-3">
                <Button 
                  onClick={() => setShowTemplateSelector(!showTemplateSelector)} 
                  className="bg-blue-600 hover:bg-blue-700 gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add More Templates
                </Button>
              </div>
            )}

            {showTemplateSelector && (
              <Card className="mb-6 border-blue-200 dark:border-blue-900 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20">
                <CardHeader>
                  <CardTitle className="text-lg">Available Azure Services</CardTitle>
                  <CardDescription>
                    Click to select templates you want to add ({selectedTemplates.size} selected)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {templates.map((template) => {
                      const IconComponent = getIconComponent(template.icon);
                      const isSelected = selectedTemplates.has(template.id);
                      
                      return (
                        <div
                          key={template.id}
                          onClick={() => handleTemplateToggle(template.id)}
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                            isSelected
                              ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-500'
                              : 'border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600 bg-white dark:bg-slate-900/50'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg mt-1 ${
                              isSelected 
                                ? 'bg-blue-600' 
                                : 'bg-gray-100 dark:bg-gray-800'
                            }`}>
                              <IconComponent className={`h-5 w-5 ${
                                isSelected 
                                  ? 'text-white' 
                                  : 'text-gray-600 dark:text-gray-400'
                              }`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-sm text-foreground truncate">
                                {template.title}
                              </h3>
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                {template.description}
                              </p>
                            </div>
                            {isSelected && (
                              <Check className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex gap-3 pt-4 border-t">
                    <Button
                      onClick={handleImportSelected}
                      disabled={selectedTemplates.size === 0 || isImporting}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      {isImporting ? 'Adding...' : `Add ${selectedTemplates.size} Template(s)`}
                    </Button>
                    <Button
                      onClick={() => {
                        setShowTemplateSelector(false);
                        setSelectedTemplates(new Set());
                      }}
                      variant="outline"
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {resources.map((resource) => {
                const IconComponent = getIconComponent(resource.icon);
                return (
                  <Card
                    key={resource.id}
                    className="cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-100 dark:border-blue-900/50"
                    onClick={() => handleResourceClick(resource)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 shadow-lg">
                          <IconComponent className="h-5 w-5 text-white" strokeWidth={2.5} />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                            {resource.title}
                          </CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-2 truncate">
                        {resource.resource_name}
                      </h3>
                      <CardDescription className="mb-4 line-clamp-2 text-sm">
                        {resource.description}
                      </CardDescription>
                      <p className="text-xs text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1">
                        Click to view details 
                        <span className="text-base">→</span>
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </>
        )}

        {/* Resource Detail Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-2xl w-[calc(100%-1.5rem)] sm:w-auto sm:max-h-[90vh] sm:overflow-y-auto bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 border-0 shadow-2xl p-4 sm:p-6">
            {selectedResource && (
              <>
                <DialogHeader className="border-b pb-1.5 sm:pb-3 space-y-1">
                  <DialogTitle className="text-xl font-bold text-green-600 dark:text-green-400">
                    {selectedResource.title}
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-1.5 sm:space-y-3 py-1.5 sm:py-3">
                  <div className="p-2 sm:p-3 rounded-lg bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Resource Name
                    </label>
                    <p className="text-sm sm:text-base font-bold mt-1 text-foreground break-words">
                      {selectedResource.resource_name}
                    </p>
                  </div>

                  <div className="p-2 sm:p-3 rounded-lg bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Description
                    </label>
                    <p className="text-xs sm:text-sm mt-1 text-foreground">
                      {selectedResource.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 p-2 sm:p-3 rounded-lg bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(selectedResource.status)}`} />
                    <span className="text-green-600 dark:text-green-400 font-semibold text-xs sm:text-sm">
                      {selectedResource.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                    <div className="p-2 sm:p-3 rounded-lg bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900">
                        <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-semibold">Region</p>
                        <p className="font-semibold text-xs sm:text-sm text-foreground">{selectedResource.region || 'East US'}</p>
                      </div>
                    </div>
                    <div className="p-2 sm:p-3 rounded-lg bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-900">
                        <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-semibold">Created</p>
                        <p className="font-semibold text-xs sm:text-sm text-foreground">
                          {selectedResource.created_at ? new Date(selectedResource.created_at).toLocaleDateString() : new Date().toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-1.5 sm:pt-3">
                    <div className="flex items-center gap-2 mb-1.5 sm:mb-3">
                      <div className="p-1.5 rounded-lg bg-green-100 dark:bg-green-900">
                        <Activity className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 dark:text-green-400" />
                      </div>
                      <h3 className="text-sm sm:text-base font-bold">Performance Metrics</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                      <div className="text-center p-2 sm:p-3 rounded-lg bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950 dark:to-emerald-900 shadow-md">
                        <p className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">99.9%</p>
                        <p className="text-xs text-muted-foreground mt-1 font-semibold">Uptime</p>
                      </div>
                      <div className="text-center p-2 sm:p-3 rounded-lg bg-gradient-to-br from-blue-50 to-cyan-100 dark:from-blue-950 dark:to-cyan-900 shadow-md">
                        <p className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">45ms</p>
                        <p className="text-xs text-muted-foreground mt-1 font-semibold">Latency</p>
                      </div>
                      <div className="text-center p-2 sm:p-3 rounded-lg bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-950 dark:to-pink-900 shadow-md">
                        <p className="text-xl sm:text-2xl font-bold text-purple-600 dark:text-purple-400">4.8/5</p>
                        <p className="text-xs text-muted-foreground mt-1 font-semibold">Health</p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
