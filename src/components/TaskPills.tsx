import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar, Target, Zap, FileText } from 'lucide-react';
import { format } from 'date-fns';

interface TaskPillsProps {
  startTime?: Date;
  dueDate?: Date | null;
  duration?: number;
  priority?: 'high' | 'medium' | 'low';
  effortLevel?: 'small' | 'medium' | 'large';
  description?: string;
  className?: string;
}

export const TaskPills: React.FC<TaskPillsProps> = ({
  startTime,
  dueDate,
  duration,
  priority,
  effortLevel,
  description,
  className
}) => {
  const priorityColors = {
    high: 'bg-destructive/20 text-destructive',
    medium: 'bg-warning/20 text-warning',
    low: 'bg-success/20 text-success'
  };

  const effortColors = {
    small: 'bg-success/20 text-success',
    medium: 'bg-warning/20 text-warning',
    large: 'bg-destructive/20 text-destructive'
  };

  const pills = [];

  if (startTime) {
    pills.push(
      <Badge 
        key="start-time" 
        variant="secondary" 
        className="flex items-center space-x-1 text-xs"
      >
        <Clock className="w-3 h-3" />
        <span>{format(startTime, 'HH:mm')}</span>
      </Badge>
    );
  }

  if (dueDate) {
    pills.push(
      <Badge 
        key="due-date" 
        variant="secondary" 
        className="flex items-center space-x-1 text-xs"
      >
        <Calendar className="w-3 h-3" />
        <span>{format(dueDate, 'MMM d')}</span>
      </Badge>
    );
  }

  if (duration) {
    pills.push(
      <Badge 
        key="duration" 
        variant="secondary" 
        className="flex items-center space-x-1 text-xs"
      >
        <Clock className="w-3 h-3" />
        <span>{duration === 0.5 ? '30m' : `${duration}h`}</span>
      </Badge>
    );
  }

  if (priority) {
    pills.push(
      <Badge 
        key="priority" 
        className={`flex items-center space-x-1 text-xs ${priorityColors[priority]}`}
      >
        <Target className="w-3 h-3" />
        <span>{priority}</span>
      </Badge>
    );
  }

  if (effortLevel) {
    pills.push(
      <Badge 
        key="effort" 
        className={`flex items-center space-x-1 text-xs ${effortColors[effortLevel]}`}
      >
        <Zap className="w-3 h-3" />
        <span>{effortLevel}</span>
      </Badge>
    );
  }

  if (description) {
    const truncatedDesc = description.length > 30 
      ? `${description.substring(0, 30)}...` 
      : description;
    
    pills.push(
      <Badge 
        key="description" 
        variant="outline" 
        className="flex items-center space-x-1 text-xs max-w-[200px]"
        title={description}
      >
        <FileText className="w-3 h-3" />
        <span className="truncate">{truncatedDesc}</span>
      </Badge>
    );
  }

  if (pills.length === 0) return null;

  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {pills}
    </div>
  );
};