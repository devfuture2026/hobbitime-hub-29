import React from 'react';
import { isToday } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Code, 
  Heart, 
  Home, 
  GraduationCap, 
  Users, 
  Gamepad2, 
  DollarSign, 
  Brain,
  Plus,
  CheckCircle2
} from 'lucide-react';

interface Task {
  id: string;
  title: string;
  projectId: string;
  startTime: Date;
  duration: number;
  color: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
}

interface Project {
  id: string;
  name: string;
  color: string;
  category: 'hobby' | 'work' | 'personal';
  area: string;
  dueDate?: Date | null;
}

interface AreasDashboardProps {
  tasks: Task[];
  projects: Project[];
  onAreaSelect: (areaName: string) => void;
}

const areas = [
  {
    name: 'Development',
    icon: Code,
    color: '#3B82F6',
    description: 'Coding, programming, and technical skills'
  },
  {
    name: 'Wellness',
    icon: Heart,
    color: '#EF4444',
    description: 'Health, fitness, and mental wellbeing'
  },
  {
    name: 'Chores',
    icon: Home,
    color: '#6B7280',
    description: 'Household tasks and maintenance'
  },
  {
    name: 'Education',
    icon: GraduationCap,
    color: '#10B981',
    description: 'Learning and skill development'
  },
  {
    name: 'Community',
    icon: Users,
    color: '#8B5CF6',
    description: 'Social connections and community involvement'
  },
  {
    name: 'Leisure',
    icon: Gamepad2,
    color: '#F59E0B',
    description: 'Entertainment and hobbies'
  },
  {
    name: 'Finance',
    icon: DollarSign,
    color: '#059669',
    description: 'Money management and investments'
  },
  {
    name: 'Mindfulness',
    icon: Brain,
    color: '#7C3AED',
    description: 'Meditation and self-reflection'
  }
];

export const AreasDashboard: React.FC<AreasDashboardProps> = ({ tasks, projects, onAreaSelect }) => {
  // Calculate stats for each area based on actual tasks mapped via project.area
  const getAreaStats = (areaName: string) => {
    const areaProjectIds = projects.filter(p => p.area === areaName).map(p => p.id);
    const areaTasks = tasks.filter(t => areaProjectIds.includes(t.projectId));
    const completedTasks = areaTasks.filter(t => t.completed);
    const activeToday = areaTasks.filter(t => isToday(t.startTime));

    return {
      totalTasks: areaTasks.length,
      completedTasks: completedTasks.length,
      activeToday: activeToday.length,
      completionRate: areaTasks.length > 0 ? (completedTasks.length / areaTasks.length) * 100 : 0
    };
  };

  return (
    <div className="flex-1 p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">Areas of Life</h1>
        <p className="text-muted-foreground">
          Organize your life into meaningful areas and track your progress across all dimensions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {areas.map((area) => {
          const Icon = area.icon;
          const stats = getAreaStats(area.name);
          
          return (
            <Card
              key={area.name}
              className="group hover:shadow-lg transition-all duration-300 border-border cursor-pointer"
              onClick={() => onAreaSelect(area.name)}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="p-2 rounded-lg text-white"
                      style={{ backgroundColor: area.color }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold">{area.name}</CardTitle>
                    </div>
                  </div>
                  {/* Removed per request: no plus button on area/project cards */}
                </div>
                <p className="text-sm text-muted-foreground mt-2">{area.description}</p>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{Math.round(stats.completionRate)}%</span>
                  </div>
                  <Progress 
                    value={stats.completionRate} 
                    className="h-2"
                    style={{
                      '--progress-color': area.color
                    } as React.CSSProperties}
                  />
                </div>
                
                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <div className="text-lg font-bold text-foreground">{stats.totalTasks}</div>
                    <div className="text-xs text-muted-foreground">Total</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold" style={{ color: area.color }}>
                      {stats.completedTasks}
                    </div>
                    <div className="text-xs text-muted-foreground">Done</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-accent">{stats.activeToday}</div>
                    <div className="text-xs text-muted-foreground">Today</div>
                  </div>
                </div>
                
                {/* Status Badge */}
                <div className="flex justify-center">
                  <Badge 
                    variant={stats.completionRate > 70 ? "default" : "secondary"}
                    className={stats.completionRate > 70 ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" : ""}
                  >
                    {stats.completionRate > 70 ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        On Track
                      </>
                    ) : (
                      'In Progress'
                    )}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {/* Summary Section */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-xl">Weekly Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-foreground">
                {areas.reduce((acc, area) => acc + getAreaStats(area.name).totalTasks, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Tasks</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">
                {areas.reduce((acc, area) => acc + getAreaStats(area.name).completedTasks, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-accent">
                {areas.reduce((acc, area) => acc + getAreaStats(area.name).activeToday, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Active Today</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">8</div>
              <div className="text-sm text-muted-foreground">Life Areas</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};