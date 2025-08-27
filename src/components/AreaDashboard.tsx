import React, { useMemo, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, MoreVertical, Code, Heart, Home, GraduationCap, Users, Gamepad2, DollarSign, Brain, Plus } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

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

interface AreaDashboardProps {
  areaName: string;
  tasks: Task[];
  projects: Project[];
  onBack: () => void;
  onAddCategory: (areaName: string) => void;
  onCategorySelect: (projectId: string) => void;
  onQuickAddTask: (projectId: string) => void;
  onReorderCategories: (areaName: string, sourceId: string, targetId: string) => void;
  onRenameCategory: (projectId: string, newName: string) => void;
  onDeleteCategory: (projectId: string) => void;
}

export const AreaDashboard: React.FC<AreaDashboardProps> = ({ areaName, tasks, projects, onBack, onAddCategory, onCategorySelect, onQuickAddTask, onReorderCategories, onRenameCategory, onDeleteCategory }) => {
  const areaProjects = useMemo(() => projects.filter(p => p.area === areaName), [projects, areaName]);
  const areaProjectIds = useMemo(() => new Set(areaProjects.map(p => p.id)), [areaProjects]);
  const areaTasks = useMemo(() => tasks.filter(t => areaProjectIds.has(t.projectId)), [tasks, areaProjectIds]);

  const completedTasks = areaTasks.filter(t => t.completed).length;
  const progress = areaTasks.length > 0 ? (completedTasks / areaTasks.length) * 100 : 0;

  const getAreaIcon = useCallback((name: string) => {
    const map: Record<string, React.ElementType> = {
      'Development': Code,
      'Wellness': Heart,
      'Chores': Home,
      'Education': GraduationCap,
      'Community': Users,
      'Leisure': Gamepad2,
      'Finance': DollarSign,
      'Mindfulness': Brain
    };
    return map[name] ?? Code;
  }, []);

  const getAreaColor = useCallback((name: string) => {
    const map: Record<string, string> = {
      'Development': '#3B82F6',
      'Wellness': '#EF4444',
      'Chores': '#6B7280',
      'Education': '#10B981',
      'Community': '#8B5CF6',
      'Leisure': '#F59E0B',
      'Finance': '#059669',
      'Mindfulness': '#7C3AED'
    };
    return map[name] ?? '#3B82F6';
  }, []);

  const draggedIdRef = useRef<string | null>(null);

  return (
    <div className="flex-1 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" onClick={onBack} className="border border-border">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center space-x-2">
            {(() => {
              const Icon = getAreaIcon(areaName);
              const color = getAreaColor(areaName);
              return (
                <span className="p-2 rounded-md text-white" style={{ backgroundColor: color }}>
                  <Icon className="w-5 h-5" />
                </span>
              );
            })()}
            <h1 className="text-3xl font-bold text-foreground">{areaName}</h1>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="w-64">
            <div className="text-sm text-muted-foreground mb-1">Progress</div>
            <Progress value={progress} />
          </div>
          <Button onClick={() => onAddCategory(areaName)} className="bg-gradient-primary text-white">Add Project</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {areaProjects.length === 0 ? (
          <Card className="md:col-span-2">
            <CardContent className="py-8">
              <p className="text-muted-foreground">No projects yet — add one above.</p>
            </CardContent>
          </Card>
        ) : (
          areaProjects.map(project => {
            const projectTasks = areaTasks.filter(t => t.projectId === project.id);
            const done = projectTasks.filter(t => t.completed).length;
            const pct = projectTasks.length > 0 ? (done / projectTasks.length) * 100 : 0;
            return (
              <Card
                key={project.id}
                className="border-border group cursor-pointer"
                draggable
                onDragStart={(e) => { draggedIdRef.current = project.id; e.dataTransfer.effectAllowed = 'move'; }}
                onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
                onDrop={() => { if (draggedIdRef.current && draggedIdRef.current !== project.id) onReorderCategories(areaName, draggedIdRef.current, project.id); draggedIdRef.current = null; }}
                onClick={() => onCategorySelect(project.id)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: project.color }} />
                      <div>
                        <CardTitle className="text-base">{project.name}</CardTitle>
                        {project.dueDate && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Due: {new Date(project.dueDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon" variant="ghost" className="h-7 w-7 opacity-0 group-hover:opacity-100">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            const name = window.prompt('Rename project', project.name)?.trim();
                            if (name) onRenameCategory(project.id, name);
                          }}>Rename</DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm('Delete this project and its tasks?')) onDeleteCategory(project.id);
                          }}>Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{done}/{projectTasks.length} completed</span>
                      <span>{Math.round(pct)}%</span>
                    </div>
                    <Progress value={pct} className="h-1.5" />
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AreaDashboard;

