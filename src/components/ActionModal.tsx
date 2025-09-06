import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { Calendar as CalendarIcon, Clock, Bell } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface ActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateAction: (action: any) => void;
  lockedArea?: string;
  lockedProjectId?: string;
}

export const ActionModal: React.FC<ActionModalProps> = ({
  isOpen,
  onClose,
  onCreateAction,
  lockedArea,
  lockedProjectId
}) => {
  const [actionData, setActionData] = useState({
    title: '',
    description: '',
    type: 'reminder' as 'alarm' | 'reminder',
    area: lockedArea || '',
    // Alarm specific
    time: '09:00',
    enabled: true,
    daysOfWeek: [] as string[],
    // Reminder specific
    dueDate: null as Date | null
  });

  const areas = [
    'Development', 'Wellness', 'Education', 'Chores', 
    'Community', 'Leisure', 'Finance', 'Mindfulness'
  ];

  const daysOfWeek = [
    { value: 'monday', label: 'Mon' },
    { value: 'tuesday', label: 'Tue' },
    { value: 'wednesday', label: 'Wed' },
    { value: 'thursday', label: 'Thu' },
    { value: 'friday', label: 'Fri' },
    { value: 'saturday', label: 'Sat' },
    { value: 'sunday', label: 'Sun' }
  ];

  useEffect(() => {
    if (isOpen) {
      console.log('ActionModal - useEffect triggered, lockedArea:', lockedArea);
      // Ensure the area is always set to the locked area to prevent cross-over
      const enforcedArea = lockedArea || 'Development'; // Default fallback
      setActionData({
        title: '',
        description: '',
        type: 'reminder',
        area: enforcedArea,
        time: '09:00',
        enabled: true,
        daysOfWeek: [],
        dueDate: null
      });
    }
  }, [isOpen, lockedArea]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('ActionModal - handleSubmit called');
    console.log('ActionModal - actionData:', actionData);
    console.log('ActionModal - lockedArea:', lockedArea);
    
    if (!actionData.title || !actionData.area) {
      console.log('ActionModal - Validation failed: title or area is missing');
      console.log('ActionModal - title:', actionData.title);
      console.log('ActionModal - area:', actionData.area);
      return;
    }

    const action = {
      id: Date.now().toString(),
      title: actionData.title,
      description: actionData.description,
      type: actionData.type,
      area: actionData.area,
      projectId: lockedProjectId,
      ...(actionData.type === 'alarm' ? {
        time: actionData.time,
        enabled: actionData.enabled,
        daysOfWeek: actionData.daysOfWeek,
      } : {
        dueDate: actionData.dueDate,
      })
    };

    console.log('ActionModal - Submitting action:', action);
    onCreateAction(action);
    onClose();
  };

  const toggleDayOfWeek = (day: string) => {
    setActionData(prev => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.includes(day)
        ? prev.daysOfWeek.filter(d => d !== day)
        : [...prev.daysOfWeek, day]
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-gradient-card border-primary/20">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-xl">
            {actionData.type === 'alarm' ? (
              <Clock className="w-5 h-5 text-primary" />
            ) : (
              <Bell className="w-5 h-5 text-accent" />
            )}
            <span>Create New Action</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Action Type</Label>
            <div className="flex space-x-2">
              <Button
                type="button"
                variant={actionData.type === 'alarm' ? "default" : "outline"}
                size="sm"
                onClick={() => setActionData({ ...actionData, type: 'alarm' })}
                className="flex-1"
              >
                <Clock className="w-4 h-4 mr-2" />
                Alarm
              </Button>
              <Button
                type="button"
                variant={actionData.type === 'reminder' ? "default" : "outline"}
                size="sm"
                onClick={() => setActionData({ ...actionData, type: 'reminder' })}
                className="flex-1"
              >
                <Bell className="w-4 h-4 mr-2" />
                Reminder
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="action-title" className="text-sm font-medium">Title</Label>
            <Input
              id="action-title"
              value={actionData.title}
              onChange={(e) => setActionData({ ...actionData, title: e.target.value })}
              placeholder={`${actionData.type === 'alarm' ? 'Morning Wake-up' : 'Buy groceries'}`}
              className="border-primary/20 focus:ring-primary"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="action-description" className="text-sm font-medium">Description</Label>
            <Textarea
              id="action-description"
              value={actionData.description}
              onChange={(e) => setActionData({ ...actionData, description: e.target.value })}
              placeholder="Add details..."
              className="border-primary/20 focus:ring-primary min-h-[80px]"
            />
          </div>

                    <div className="space-y-2">
            <Label className="text-sm font-medium">Area</Label>
            <div className="text-sm text-muted-foreground mb-2">
              Action will be created in: <span className="font-medium text-foreground">{actionData.area}</span>
            </div>
            <Select
              value={actionData.area}
              onValueChange={(value) => setActionData({ ...actionData, area: value })}
              disabled={true} // Always disabled to prevent cross-over
              required
            >
              <SelectTrigger className="border-primary/20">
                <SelectValue placeholder="Select area" />
              </SelectTrigger>
              <SelectContent>
                {areas.map(area => (
                  <SelectItem key={area} value={area}>
                    {area}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {actionData.type === 'alarm' ? (
            <>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Time</Label>
                <Input
                  type="time"
                  value={actionData.time}
                  onChange={(e) => setActionData({ ...actionData, time: e.target.value })}
                  className="border-primary/20 focus:ring-primary"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Days of Week</Label>
                <div className="flex flex-wrap gap-2">
                  {daysOfWeek.map(day => (
                    <Button
                      key={day.value}
                      type="button"
                      variant={actionData.daysOfWeek.includes(day.value) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleDayOfWeek(day.value)}
                      className="w-12 h-8"
                    >
                      {day.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={actionData.enabled}
                    onCheckedChange={(enabled) => setActionData({ ...actionData, enabled })}
                  />
                  <Label className="text-sm font-medium">Enabled</Label>
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Due Date (Optional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal border-primary/20",
                      !actionData.dueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {actionData.dueDate ? format(actionData.dueDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={actionData.dueDate}
                    onSelect={(date) => setActionData({ ...actionData, dueDate: date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <Button
              type="submit"
              className="flex-1 bg-gradient-primary text-white hover:shadow-glow transition-all duration-300"
            >
              Create Action
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