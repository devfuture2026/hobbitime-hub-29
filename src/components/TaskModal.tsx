import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, Clock, Tag, Repeat } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface Project {
  id: string;
  name: string;
  color: string;
  category: 'hobby' | 'work' | 'personal';
  area: string;
  dueDate?: Date | null;
}

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTask: (task: any) => void;
  selectedTime?: Date;
  projects: Project[];
  preselectedProjectId?: string;
  areaFilter?: string;
  prefilledTitle?: string;
  listId?: string;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onCreateTask,
  selectedTime,
  projects,
  preselectedProjectId,
  areaFilter,
  prefilledTitle,
  listId
}) => {
  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    projectId: '',
    duration: 1,
    priority: 'medium',
    dueDate: null as Date | null,
    effortLevel: 'medium' as 'small' | 'medium' | 'large',
    isRecurring: false,
    recurringPattern: 'daily' as 'daily' | 'weekly' | 'monthly'
  });

  const [customTime, setCustomTime] = useState(
    selectedTime ? format(selectedTime, 'HH:mm') : '09:00'
  );

  // Update projectId when preselectedProjectId changes
  useEffect(() => {
    if (preselectedProjectId) {
      setTaskData(prev => ({ ...prev, projectId: preselectedProjectId }));
    }
  }, [preselectedProjectId]);

  // Update title when prefilledTitle changes
  useEffect(() => {
    if (prefilledTitle) {
      setTaskData(prev => ({ ...prev, title: prefilledTitle }));
    }
  }, [prefilledTitle]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setTaskData(prev => ({
        ...prev,
        title: prefilledTitle || '',
        projectId: preselectedProjectId || ''
      }));
      setCustomTime(selectedTime ? format(selectedTime, 'HH:mm') : '09:00');
    } else {
      // Reset form when modal closes
      setTaskData({
        title: '',
        description: '',
        projectId: '',
        duration: 1,
        priority: 'medium' as const,
        dueDate: null,
        effortLevel: 'medium' as const,
        isRecurring: false,
        recurringPattern: 'daily' as const
      });
      setCustomTime('09:00');
    }
  }, [isOpen, prefilledTitle, preselectedProjectId, selectedTime]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskData.title || !taskData.projectId) return;

    const selectedProject = projects.find(p => p.id === taskData.projectId);
    
    // If no selectedTime is provided, use current time
    const baseTime = selectedTime || new Date();
    
    // Parse custom time and create new date with selected date + custom time
    const [hours, minutes] = customTime.split(':').map(Number);
    const finalStartTime = new Date(baseTime);
    finalStartTime.setHours(hours, minutes, 0, 0);
    
    const task = {
      id: Date.now().toString(),
      title: taskData.title,
      description: taskData.description,
      projectId: taskData.projectId,
      area: selectedProject?.area,
      category: selectedProject?.name,
      startTime: finalStartTime,
      duration: taskData.duration,
      priority: taskData.priority,
      color: selectedProject?.color || '#3B82F6',
      completed: false,
      dueDate: taskData.dueDate,
      effortLevel: taskData.effortLevel,
      isRecurring: taskData.isRecurring,
      recurringPattern: taskData.recurringPattern,
      listId: listId
    };

    onCreateTask(task);
    onClose();
    setTaskData({
      title: '',
      description: '',
      projectId: '',
      duration: 1,
      priority: 'medium' as const,
      dueDate: null,
      effortLevel: 'medium' as const,
      isRecurring: false,
      recurringPattern: 'daily' as const
    });
    setCustomTime('09:00');
  };

  const priorities = [
    { value: 'low' as const, label: 'Low', color: 'bg-accent/20' },
    { value: 'medium' as const, label: 'Medium', color: 'bg-warning/20' },
    { value: 'high' as const, label: 'High', color: 'bg-destructive/20' }
  ];

  const effortLevels = [
    { value: 'small' as const, label: 'Small', color: 'bg-green-500', bgColor: 'bg-green-100 text-green-800' },
    { value: 'medium' as const, label: 'Medium', color: 'bg-yellow-500', bgColor: 'bg-yellow-100 text-yellow-800' },
    { value: 'large' as const, label: 'Large', color: 'bg-red-500', bgColor: 'bg-red-100 text-red-800' }
  ];

  const recurringPatterns = [
    { value: 'daily' as const, label: 'Daily' },
    { value: 'weekly' as const, label: 'Weekly' },
    { value: 'monthly' as const, label: 'Monthly' }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-gradient-card border-primary/20">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-xl">
            <CalendarIcon className="w-5 h-5 text-primary" />
            <span>Create New Task</span>
          </DialogTitle>
          {selectedTime ? (
            <p className="text-sm text-muted-foreground">
              {format(selectedTime, 'EEEE, MMMM d, yyyy • HH:mm')}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              {format(new Date(), 'EEEE, MMMM d, yyyy')} • {customTime}
            </p>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="task-title" className="text-sm font-medium">Task Title</Label>
            <Input
              id="task-title"
              value={taskData.title}
              onChange={(e) => setTaskData({ ...taskData, title: e.target.value })}
              placeholder="What needs to be done?"
              className="border-primary/20 focus:ring-primary"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-description" className="text-sm font-medium">Description</Label>
            <Textarea
              id="task-description"
              value={taskData.description}
              onChange={(e) => setTaskData({ ...taskData, description: e.target.value })}
              placeholder="Add details about this task..."
              className="border-primary/20 focus:ring-primary min-h-[80px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="project-select" className="text-sm font-medium">Project</Label>
              <Select
                value={taskData.projectId}
                onValueChange={(value) => setTaskData({ ...taskData, projectId: value })}
                required
              >
                <SelectTrigger className="border-primary/20">
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {(areaFilter ? projects.filter(p => p.area === areaFilter) : projects).map(project => (
                    <SelectItem key={project.id} value={project.id}>
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: project.color }}
                        />
                        <span>{project.name}</span>
                        <span className="text-xs text-muted-foreground capitalize">
                          ({project.category})
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration" className="text-sm font-medium flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>Duration (hours)</span>
              </Label>
              <Select
                value={taskData.duration.toString()}
                onValueChange={(value) => setTaskData({ ...taskData, duration: parseInt(value) })}
              >
                <SelectTrigger className="border-primary/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[0.5, 1, 1.5, 2, 3, 4, 6, 8].map(duration => (
                    <SelectItem key={duration} value={duration.toString()}>
                      {duration === 0.5 ? '30 min' : `${duration} hour${duration > 1 ? 's' : ''}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-time" className="text-sm font-medium flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>Start Time</span>
              </Label>
              <Input
                id="start-time"
                type="time"
                value={customTime}
                onChange={(e) => setCustomTime(e.target.value)}
                className="border-primary/20 focus:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Due Date (Optional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal border-primary/20",
                      !taskData.dueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {taskData.dueDate ? format(taskData.dueDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={taskData.dueDate}
                    onSelect={(date) => setTaskData({ ...taskData, dueDate: date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center space-x-1">
              <Tag className="w-4 h-4" />
              <span>Priority</span>
            </Label>
            <div className="flex space-x-2">
              {priorities.map(priority => (
                <Button
                  key={priority.value}
                  type="button"
                  variant={taskData.priority === priority.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTaskData({ ...taskData, priority: priority.value })}
                  className={taskData.priority === priority.value ? "bg-primary" : ""}
                >
                  <div className={`w-2 h-2 rounded-full mr-2 ${priority.color}`} />
                  {priority.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Effort Level</Label>
            <div className="flex space-x-2">
              {effortLevels.map(level => (
                <Button
                  key={level.value}
                  type="button"
                  variant={taskData.effortLevel === level.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTaskData({ ...taskData, effortLevel: level.value })}
                  className={taskData.effortLevel === level.value ? level.bgColor : ""}
                >
                  <div className={`w-2 h-2 rounded-full mr-2 ${level.color}`} />
                  {level.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center space-x-1">
              <Repeat className="w-4 h-4" />
              <span>Recurring</span>
            </Label>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="recurring"
                  checked={taskData.isRecurring}
                  onChange={(e) => setTaskData({ ...taskData, isRecurring: e.target.checked })}
                  className="w-4 h-4 rounded border-border"
                />
                <Label htmlFor="recurring" className="text-sm">Make this task recurring</Label>
              </div>
              {taskData.isRecurring && (
                <Select
                  value={taskData.recurringPattern}
                  onValueChange={(value: 'daily' | 'weekly' | 'monthly') => 
                    setTaskData({ ...taskData, recurringPattern: value })
                  }
                >
                  <SelectTrigger className="w-32 border-primary/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {recurringPatterns.map(pattern => (
                      <SelectItem key={pattern.value} value={pattern.value}>
                        {pattern.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              type="submit"
              className="flex-1 bg-gradient-primary text-white hover:shadow-glow transition-all duration-300"
            >
              Create Task
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-primary/20"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};