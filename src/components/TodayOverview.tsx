import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, Calendar, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { format, isToday, isAfter } from 'date-fns';

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
  dueDate?: Date | null;
}

interface TodayOverviewProps {
  tasks: Task[];
  projects: Project[];
}

export const TodayOverview: React.FC<TodayOverviewProps> = ({ tasks, projects }) => {
  // Today's tasks calculations
  const todayTasks = useMemo(() => tasks.filter(task => isToday(task.startTime)), [tasks]);
  const completedTasks = useMemo(() => todayTasks.filter(task => task.completed), [todayTasks]);
  const completionRate = todayTasks.length > 0 ? (completedTasks.length / todayTasks.length) * 100 : 0;

  // Upcoming tasks (next 5 non-completed tasks for today)
  const upcomingTasks = useMemo(() => {
    return todayTasks
      .filter(task => !task.completed && isAfter(task.startTime, new Date()))
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
      .slice(0, 5);
  }, [todayTasks]);

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
    }
  };

  const getCategoryIcon = (category: Project['category']) => {
    switch (category) {
      case 'hobby': return <Target className="w-4 h-4" />;
      case 'work': return <Calendar className="w-4 h-4" />;
      case 'personal': return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="w-80 bg-card border-r border-border p-4 flex flex-col h-full space-y-4">
      {/* Today's Progress */}
      <Card className="bg-gradient-card border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-primary flex items-center">
            <Target className="w-5 h-5 mr-2" />
            Today's Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center mb-4">
            <div className="relative w-20 h-20">
              {/* Progress Ring */}
              <svg className="transform -rotate-90 w-20 h-20">
                <circle
                  cx="40"
                  cy="40"
                  r="32"
                  stroke="hsl(var(--muted))"
                  strokeWidth="6"
                  fill="transparent"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="32"
                  stroke="hsl(var(--primary))"
                  strokeWidth="6"
                  fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 32}`}
                  strokeDashoffset={`${2 * Math.PI * 32 * (1 - completionRate / 100)}`}
                  className="transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold text-primary">{Math.round(completionRate)}%</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-foreground">{todayTasks.length}</div>
              <div className="text-xs text-muted-foreground">Total Tasks</div>
            </div>
            <div>
              <div className="text-lg font-bold text-accent">{completedTasks.length}</div>
              <div className="text-xs text-muted-foreground">Completed</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Events */}
      <Card className="bg-gradient-card border-primary/20 flex-1">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-primary flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Upcoming Events
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {upcomingTasks.length === 0 ? (
            <div className="text-center py-6">
              <CheckCircle2 className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No upcoming tasks for today!</p>
            </div>
          ) : (
            upcomingTasks.map(task => {
              const project = projects.find(p => p.id === task.projectId);
              return (
                <div key={task.id} className="p-3 bg-card border border-border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: task.color }}
                      />
                      <h4 className="font-medium text-sm text-foreground truncate">
                        {task.title}
                      </h4>
                    </div>
                    <Badge className={getPriorityColor(task.priority)}>
                      {task.priority}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{format(task.startTime, 'h:mm a')}</span>
                      <span>({task.duration}h)</span>
                    </div>
                    
                    {project && (
                      <div className="flex items-center space-x-1">
                        {getCategoryIcon(project.category)}
                        <span className="truncate max-w-20">{project.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
};