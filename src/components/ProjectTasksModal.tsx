import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Folder, Clock, Calendar, Edit, Trash2, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface Task {
  id: string;
  title: string;
  description?: string;
  projectId: string;
  startTime: Date;
  duration: number;
  color: string;
  priority: string;
  completed: boolean;
}

interface Project {
  id: string;
  name: string;
  color: string;
  category: 'hobby' | 'work' | 'personal';
  dueDate?: Date | null;
}

interface ProjectTasksModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  tasks: Task[];
  onTaskUpdate: (tasks: Task[]) => void;
}

export const ProjectTasksModal: React.FC<ProjectTasksModalProps> = ({
  isOpen,
  onClose,
  project,
  tasks,
  onTaskUpdate
}) => {
  if (!project) return null;

  const projectTasks = tasks.filter(task => task.projectId === project.id);
  const completedTasks = projectTasks.filter(task => task.completed);
  const pendingTasks = projectTasks.filter(task => !task.completed);
  
  const toggleTaskCompletion = (taskId: string) => {
    const updatedTasks = tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    onTaskUpdate(updatedTasks);
  };

  const deleteTask = (taskId: string) => {
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    onTaskUpdate(updatedTasks);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-destructive/20 text-destructive';
      case 'medium': return 'bg-warning/20 text-warning';
      case 'low': return 'bg-accent/20 text-accent';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const TaskCard = ({ task }: { task: Task }) => (
    <Card className={cn(
      "transition-all duration-200 hover:shadow-medium",
      task.completed ? "opacity-60 bg-muted/30" : "bg-card"
    )}>
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <Checkbox
            checked={task.completed}
            onCheckedChange={() => toggleTaskCompletion(task.id)}
            className="mt-1"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h4 className={cn(
                "font-medium truncate",
                task.completed ? "line-through text-muted-foreground" : "text-foreground"
              )}>
                {task.title}
              </h4>
              <div className="flex items-center space-x-1 ml-2">
                <Badge className={getPriorityColor(task.priority)} variant="secondary">
                  {task.priority}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteTask(task.id)}
                  className="text-destructive hover:text-destructive-foreground hover:bg-destructive/10 h-6 w-6 p-0"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
            
            {task.description && (
              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                {task.description}
              </p>
            )}
            
            <div className="flex items-center text-xs text-muted-foreground space-x-4">
              <div className="flex items-center space-x-1">
                <Calendar className="w-3 h-3" />
                <span>{format(task.startTime, 'MMM d, yyyy')}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>{format(task.startTime, 'HH:mm')}</span>
              </div>
              <div className="flex items-center space-x-1">
                <span>
                  {task.duration === 0.5 ? '30 min' : `${task.duration}h`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] bg-gradient-card border-primary/20">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-xl">
            <div 
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: project.color }}
            />
            <span>{project.name} Tasks</span>
            <Badge variant="secondary" className="ml-2">
              {projectTasks.length} tasks
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Progress Summary */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{projectTasks.length}</div>
              <div className="text-xs text-muted-foreground">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success">{completedTasks.length}</div>
              <div className="text-xs text-muted-foreground">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{pendingTasks.length}</div>
              <div className="text-xs text-muted-foreground">Pending</div>
            </div>
          </div>

          {/* Tasks List */}
          <div className="max-h-[400px] overflow-y-auto space-y-3">
            {pendingTasks.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-foreground mb-2 flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>Pending Tasks ({pendingTasks.length})</span>
                </h3>
                <div className="space-y-2">
                  {pendingTasks.map(task => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              </div>
            )}

            {completedTasks.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-foreground mb-2 flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Completed Tasks ({completedTasks.length})</span>
                </h3>
                <div className="space-y-2">
                  {completedTasks.map(task => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              </div>
            )}

            {projectTasks.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Folder className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No tasks in this project yet</p>
                <p className="text-sm">Click on a time slot to create your first task</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};