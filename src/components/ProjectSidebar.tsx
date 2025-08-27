import React, { useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Plus, Calendar, Clock, Target } from 'lucide-react';
import { format, isToday, isAfter } from 'date-fns';
import { cn } from '@/lib/utils';

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
  tasksCount: number;
  completedTasks: number;
  category: 'hobby' | 'work' | 'personal';
  dueDate?: Date | null;
}

interface ProjectSidebarProps {
  projects: Project[];
  tasks: Task[];
  onCreateProject: () => void;
  onProjectSelect: (projectId: string) => void;
  onQuickAddTask: (projectId: string) => void;
  selectedProjectId?: string;
}

export const ProjectSidebar: React.FC<ProjectSidebarProps> = ({
  projects,
  tasks,
  onCreateProject,
  onProjectSelect,
  onQuickAddTask,
  selectedProjectId
}) => {
  // Today's Progress calculations
  const todayTasks = tasks.filter(task => isToday(task.startTime));
  const completedTasks = todayTasks.filter(task => task.completed);
  const completionRate = todayTasks.length > 0 ? (completedTasks.length / todayTasks.length) * 100 : 0;

  // Memoize category icon function to prevent recreation on every render
  const getCategoryIcon = useCallback((category: Project['category']) => {
    switch (category) {
      case 'hobby': return <Target className="w-4 h-4" />;
      case 'work': return <Calendar className="w-4 h-4" />;
      case 'personal': return <Clock className="w-4 h-4" />;
    }
  }, []);

  // Memoize category color function to prevent recreation on every render
  const getCategoryColor = useCallback((category: Project['category']) => {
    switch (category) {
      case 'hobby': return 'bg-accent/20 text-accent-foreground';
      case 'work': return 'bg-primary/20 text-primary-foreground';
      case 'personal': return 'bg-success/20 text-success';
    }
  }, []);

  // Memoize project click handler to prevent recreation
  const handleProjectClick = useCallback((projectId: string) => {
    onProjectSelect(projectId);
  }, [onProjectSelect]);

  // Memoize quick add task handler to prevent recreation
  const handleQuickAddTask = useCallback((e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    onQuickAddTask(projectId);
  }, [onQuickAddTask]);

  return (
    <div className="w-72 bg-gradient-subtle border-r border-border p-4 flex flex-col h-full">
      {/* Today's Progress - Fixed at top */}
      <Card className="bg-gradient-card border-primary/20 mb-4">
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

      {/* Projects Section - Scrollable */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Projects Header */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-foreground">Projects</h2>
          <Button 
            onClick={onCreateProject}
            size="sm"
            className="bg-gradient-primary text-white hover:shadow-glow transition-all duration-300"
          >
            <Plus className="w-4 h-4 mr-1" />
            New
          </Button>
        </div>

        {/* Scrollable Project List */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-3 pb-4">
          {projects.map(project => {
            // Memoize progress calculation for each project to prevent recalculation
            const progress = useMemo(() => {
              return project.tasksCount > 0 
                ? (project.completedTasks / project.tasksCount) * 100 
                : 0;
            }, [project.tasksCount, project.completedTasks]);

            return (
              <Card
                key={project.id}
                className={cn(
                  "cursor-pointer transition-all duration-300 hover:shadow-medium border group relative overflow-hidden",
                  selectedProjectId === project.id 
                    ? "border-primary/50 shadow-glow bg-gradient-to-r from-primary/5 to-primary/10" 
                    : "hover:border-primary/20"
                )}
                onClick={() => handleProjectClick(project.id)}
              >
                {/* Glow effect for selected project */}
                {selectedProjectId === project.id && (
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/20 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                )}
                
                <div className="relative z-10">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                        <div 
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: project.color }}
                        />
                        <CardTitle className="text-sm font-medium truncate">
                          {project.name}
                        </CardTitle>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Badge 
                          variant="secondary" 
                          className={cn("text-xs", getCategoryColor(project.category))}
                        >
                          {getCategoryIcon(project.category)}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{project.completedTasks}/{project.tasksCount} tasks</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <Progress 
                        value={progress} 
                        className="h-1.5 bg-secondary/50"
                      />
                    </div>
                  </CardContent>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Quick Stats - Fixed at bottom */}
      <Card className="bg-gradient-card border-primary/20 mt-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-primary">Quick Stats</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 gap-3 text-center">
            <div>
              <div className="text-xl font-bold text-foreground">
                {projects.reduce((acc, p) => acc + p.tasksCount, 0)}
              </div>
              <div className="text-xs text-muted-foreground">Total Tasks</div>
            </div>
            <div>
              <div className="text-xl font-bold text-foreground">
                {projects.reduce((acc, p) => acc + p.completedTasks, 0)}
              </div>
              <div className="text-xs text-muted-foreground">Completed</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};