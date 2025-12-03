// src/pages/Dashboard.tsx
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { api } from '@/lib/api';
import { Activity, Server, Clock, AlertCircle, Network, HardDrive } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch actual resources count
  const { data: resources } = useQuery({
    queryKey: ['resources'],
    queryFn: async () => await api.getResources(),
  });

  // Use actual resource count, rest are mock stats for now
  const stats = {
    activeResources: Array.isArray(resources) ? resources.length : 0,
    cpuUsage: 45,
    uptime: '99.9%',
    alerts: 2,
  };

  // Provide defaults for display
  const metrics = [
    {
      title: 'Active Resources',
      value: stats.activeResources ?? 12,
      icon: Server,
      color: 'text-blue-500',
    },
    {
      title: 'CPU Usage',
      value: `${stats.cpuUsage ?? 45}%`,
      numericValue: Number(stats.cpuUsage ?? 45),
      icon: Activity,
      color: 'text-green-500',
    },
    {
      title: 'Uptime',
      value: stats.uptime ?? '99.9%',
      icon: Clock,
      color: 'text-purple-500',
    },
    {
      title: 'Alerts',
      value: stats.alerts ?? 2,
      icon: AlertCircle,
      color: 'text-orange-500',
    },
  ];

  const displayName = (user as any)?.display_name || (user as any)?.displayName || 'User';

  return (
    <Layout>
      <div className="w-full h-full space-y-4 sm:space-y-6 px-2 sm:px-4 lg:px-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">Welcome, {displayName}!</h2>
          <p className="text-sm sm:text-base text-muted-foreground">Monitor your Azure resources and services</p>
        </div>

        {/* Metrics Grid */}
        <div className="grid gap-4 sm:gap-6 w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            const isActiveResources = metric.title === 'Active Resources';
            
            const gradientMap: Record<string, string> = {
              'Active Resources': 'from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900',
              'CPU Usage': 'from-green-50 to-green-100 dark:from-green-950 dark:to-green-900',
              'Uptime': 'from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900',
              'Alerts': 'from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900',
            };
            
            const iconBgMap: Record<string, string> = {
              'Active Resources': 'bg-blue-100 dark:bg-blue-900',
              'CPU Usage': 'bg-green-100 dark:bg-green-900',
              'Uptime': 'bg-purple-100 dark:bg-purple-900',
              'Alerts': 'bg-orange-100 dark:bg-orange-900',
            };
            
            return (
              <Card 
                key={metric.title}
                className={`bg-gradient-to-br ${gradientMap[metric.title]} border-0 shadow-md hover:shadow-xl transition-all duration-300 ${isActiveResources ? 'cursor-pointer hover:scale-105' : 'hover:scale-[1.02]'}`}
                onClick={isActiveResources ? () => navigate('/resources') : undefined}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-semibold text-muted-foreground">{metric.title}</CardTitle>
                  <div className={`p-2.5 rounded-xl ${iconBgMap[metric.title]} shadow-sm`}>
                    <Icon className={`w-5 h-5 ${metric.color}`} strokeWidth={2.5} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold tracking-tight">{metric.value}</div>
                  {isActiveResources && (
                    <p className="text-xs text-muted-foreground mt-2 font-medium">Click to view all →</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Resource Usage */}
        <Card className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Resource Usage</CardTitle>
            <CardDescription className="text-base">Current resource utilization</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 rounded-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                    <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-sm font-semibold">CPU</span>
                </div>
                <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{metrics[1].value}</span>
              </div>
              <Progress value={Math.min(100, Math.max(0, metrics[1].numericValue ?? 45))} className="h-2" />
            </div>

            <div className="p-4 rounded-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900">
                    <Server className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <span className="text-sm font-semibold">Memory</span>
                </div>
                <span className="text-lg font-bold text-purple-600 dark:text-purple-400">68%</span>
              </div>
              <Progress value={68} className="h-2" />
            </div>

            <div className="p-4 rounded-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900">
                    <HardDrive className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-sm font-semibold">Storage</span>
                </div>
                <span className="text-lg font-bold text-green-600 dark:text-green-400">52%</span>
              </div>
              <Progress value={52} className="h-2" />
            </div>

            <div className="p-4 rounded-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900">
                    <Network className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  </div>
                  <span className="text-sm font-semibold">Network</span>
                </div>
                <span className="text-lg font-bold text-orange-600 dark:text-orange-400">34%</span>
              </div>
              <Progress value={34} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
