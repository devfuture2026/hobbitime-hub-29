import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Clock, Bell, MoreVertical, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface Action {
  id: string;
  title: string;
  description?: string;
  type: 'alarm' | 'reminder';
  area: string;
  // Alarm specific
  time?: string;
  enabled?: boolean;
  daysOfWeek?: string[];
  // Reminder specific
  dueDate?: Date | null;
}

interface ActionCardProps {
  action: Action;
  onToggleEnabled?: (actionId: string, enabled: boolean) => void;
  onEdit?: (actionId: string) => void;
  onDelete?: (actionId: string) => void;
}

export const ActionCard: React.FC<ActionCardProps> = ({
  action,
  onToggleEnabled,
  onEdit,
  onDelete
}) => {
  const formatDaysOfWeek = (days: string[]) => {
    const dayMap = {
      monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', thursday: 'Thu',
      friday: 'Fri', saturday: 'Sat', sunday: 'Sun'
    };
    return days.map(d => dayMap[d as keyof typeof dayMap]).join(', ');
  };

  return (
    <Card className="w-80 h-32 border-border group cursor-pointer bg-gradient-card">
      <CardHeader className="p-3 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`p-1.5 rounded-lg ${
              action.type === 'alarm' 
                ? 'bg-primary/10 text-primary' 
                : 'bg-accent/10 text-accent'
            }`}>
              {action.type === 'alarm' ? (
                <Clock className="w-3.5 h-3.5" />
              ) : (
                <Bell className="w-3.5 h-3.5" />
              )}
            </div>
            <Badge variant="outline" className="text-xs">
              {action.type}
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            {onToggleEnabled && (
              <Switch
                checked={action.enabled || false}
                onCheckedChange={(enabled) => onToggleEnabled(action.id, enabled)}
              />
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost" className="h-6 w-6 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground">
                  <MoreVertical className="w-3.5 h-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(action.id)}>
                    Edit
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem 
                    onClick={() => onDelete(action.id)}
                    className="text-destructive"
                  >
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-3 pt-0 pb-1.5">
        <div className="space-y-1">
          <div>
            <CardTitle className="text-sm font-semibold">{action.title}</CardTitle>
            {action.description && (
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                {action.description}
              </p>
            )}
          </div>

          {action.type === 'alarm' ? (
            <div className="space-y-0.5">
              {action.time && (
                <div className="flex items-center space-x-2 text-xs">
                  <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="font-mono text-sm">{action.time}</span>
                </div>
              )}
              {action.daysOfWeek && action.daysOfWeek.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {action.daysOfWeek.map(day => (
                    <Badge key={day} variant="secondary" className="text-xs">
                      {day.slice(0, 3)}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-0.5">
              {action.dueDate && (
                <div className="flex items-center space-x-2 text-xs">
                  <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>{format(action.dueDate, 'MMM d, yyyy')}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};