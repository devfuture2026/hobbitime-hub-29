import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { format, startOfWeek, addDays, addHours, isSameHour, addWeeks, subWeeks, startOfDay, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface Task {
  id: string;
  title: string;
  projectId: string;
  startTime: Date;
  duration: number; // in hours
  color: string;
}

interface Alarm {
  id: string;
  time: string;
  enabled: boolean;
  sound: string;
  label: string;
  recurring: boolean;
}

interface CalendarItem extends Task {
  time?: string;
  isAlarm?: boolean;
}

type CalendarView = 'daily' | 'weekly' | 'monthly';

interface CalendarGridProps {
  selectedDate: Date;
  tasks: Task[];
  onTimeSlotClick: (time: Date) => void;
  onTaskDrop: (taskId: string, newTime: Date) => void;
  onDateChange: (date: Date) => void;
  currentTime?: Date;
  alarms?: Alarm[];
  showAlarms?: boolean;
}

// Helper function to format time with AM/PM
const formatTimeWithAMPM = (date: Date): string => {
  return format(date, 'h:mm a');
};

// Helper function to format time compactly for daily/weekly view
const formatTimeCompact = (date: Date): string => {
  return format(date, 'h:mm');
};

// Helper function to get end time
const getEndTime = (startTime: Date, duration: number): Date => {
  return addHours(startTime, duration);
};

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  selectedDate,
  tasks,
  onTimeSlotClick,
  onTaskDrop,
  onDateChange,
  currentTime = new Date(),
  alarms = [],
  showAlarms = false
}) => {
  const [view, setView] = useState<CalendarView>('weekly');
  
  // Ref for scroll container to optimize scroll performance
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Debounced scroll handler to prevent excessive updates during scrolling
  const handleScroll = useCallback(() => {
    // Throttle scroll events for better performance
    if (scrollContainerRef.current) {
      // Add a class for scroll optimization if needed
      scrollContainerRef.current.classList.add('scrolling');
      
      // Remove the class after scroll ends
      setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.classList.remove('scrolling');
        }
      }, 150);
    }
  }, []);

  // Memoize expensive date calculations to prevent recalculation on every render
  const { startWeek, weekDays, hours, displayDays } = useMemo(() => {
    const startWeek = startOfWeek(selectedDate, { weekStartsOn: 1 });
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startWeek, i));
    const hours = Array.from({ length: 24 }, (_, i) => i);
    
    // Get display days based on view - memoized to prevent recalculation
    let displayDays: Date[];
    switch (view) {
      case 'daily':
        displayDays = [selectedDate];
        break;
      case 'monthly':
        const monthStart = startOfMonth(selectedDate);
        const monthEnd = endOfMonth(selectedDate);
        const startWeekOfMonth = startOfWeek(monthStart, { weekStartsOn: 1 });
        const endWeekOfMonth = startOfWeek(monthEnd, { weekStartsOn: 1 });
        displayDays = eachDayOfInterval({
          start: startWeekOfMonth,
          end: addDays(endWeekOfMonth, 6)
        });
        break;
      default:
        displayDays = weekDays;
    }
    
    return { startWeek, weekDays, hours, displayDays };
  }, [selectedDate, view]);

  // Memoize navigation label to prevent recalculation
  const navigationLabel = useMemo(() => {
    switch (view) {
      case 'daily':
        return format(selectedDate, 'MMMM d, yyyy');
      case 'monthly':
        return format(selectedDate, 'MMMM yyyy');
      default:
        return `${format(startWeek, 'MMM d')} - ${format(addDays(startWeek, 6), 'MMM d, yyyy')}`;
    }
  }, [view, selectedDate, startWeek]);

  // Memoize expensive filtering functions to prevent recreation on every render
  const getTasksForTimeSlot = useCallback((day: Date, hour?: number) => {
    if (view === 'monthly') {
      // For monthly view, get all tasks for the entire day
      return tasks.filter(task => 
        isSameDay(task.startTime, day)
      );
    }
    const slotTime = addHours(new Date(day.getFullYear(), day.getMonth(), day.getDate()), hour || 0);
    return tasks.filter(task => 
      isSameHour(task.startTime, slotTime)
    );
  }, [tasks, view]);

  const getAlarmsForTimeSlot = useCallback((day: Date, hour: number) => {
    // Always show alarms on the calendar blocks, regardless of showAlarms state
    const hourString = hour.toString().padStart(2, '0') + ':00';
    return alarms.filter(alarm => 
      alarm.enabled && 
      alarm.time.startsWith(hourString.slice(0, 2)) &&
      (isSameDay(day, new Date()) || alarm.recurring)
    );
  }, [alarms]);

  const isCurrentTimeSlot = useCallback((day: Date, hour: number) => {
    const slotTime = addHours(new Date(day.getFullYear(), day.getMonth(), day.getDate()), hour);
    return isSameHour(slotTime, currentTime) && 
           day.toDateString() === currentTime.toDateString();
  }, [currentTime]);

  // Memoize drag handlers to prevent recreation
  const handleDragStart = useCallback((e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, dropTime: Date) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      onTaskDrop(taskId, dropTime);
    }
  }, [onTaskDrop]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  // Memoize navigation handlers to prevent recreation
  const handlePrevious = useCallback(() => {
    switch (view) {
      case 'daily':
        onDateChange(addDays(selectedDate, -1));
        break;
      case 'monthly':
        onDateChange(subMonths(selectedDate, 1));
        break;
      default:
        onDateChange(subWeeks(selectedDate, 1));
    }
  }, [view, selectedDate, onDateChange]);

  const handleNext = useCallback(() => {
    switch (view) {
      case 'daily':
        onDateChange(addDays(selectedDate, 1));
        break;
      case 'monthly':
        onDateChange(addMonths(selectedDate, 1));
        break;
      default:
        onDateChange(addWeeks(selectedDate, 1));
    }
  }, [view, selectedDate, onDateChange]);

  // Memoize view change handler
  const handleViewChange = useCallback((newView: CalendarView) => {
    setView(newView);
  }, []);

  // Add scroll event listener for performance optimization
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
      return () => {
        scrollContainer.removeEventListener('scroll', handleScroll);
      };
    }
  }, [handleScroll]);

  return (
    <div className="flex-1 bg-gradient-card rounded-lg shadow-medium overflow-hidden flex flex-col pl-0 calendar-grid">
      {/* Navigation Header */}
      <div className="flex items-center justify-between p-3 border-b border-border bg-card">
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handlePrevious}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-sm font-medium text-foreground">
            {navigationLabel}
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleNext}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        {/* View Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              <Eye className="w-4 w-4 mr-1" />
              View
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleViewChange('daily')}>
              Daily
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleViewChange('weekly')}>
              Weekly
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleViewChange('monthly')}>
              Monthly
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Calendar Grid - Unified layout with outer scroll */}
      <div className="flex-1 overflow-hidden">
        {view === 'monthly' ? (
          // Monthly grid view
          <div 
            ref={scrollContainerRef}
            className="h-full overflow-y-auto scrollbar-gutter-stable-both-edges"
            onScroll={handleScroll}
          >
            <div className="grid grid-cols-7 auto-rows-fr min-h-full">
              {displayDays.map((day, dayIndex) => {
                const dayTasks = getTasksForTimeSlot(day);
                const isToday = day.toDateString() === new Date().toDateString();
                const isCurrentMonth = day.getMonth() === selectedDate.getMonth();
                
                return (
                  <div
                    key={day.toISOString()}
                                         className={cn(
                       "relative border-r border-b border-border/30 last:border-r-0 min-h-[120px] p-2 cursor-pointer transition-all duration-150",
                       "hover:bg-timeSlot-hover",
                       !isCurrentMonth && "bg-muted/20 text-muted-foreground",
                       isToday && "bg-timeSlot-selected"
                     )}
                    onClick={() => onTimeSlotClick(startOfDay(day))}
                    onDrop={(e) => handleDrop(e, startOfDay(day))}
                    onDragOver={handleDragOver}
                  >
                    {/* Date number */}
                    <div className={cn(
                      "text-sm font-medium mb-2",
                      isToday ? "text-primary bg-primary/10 w-6 h-6 rounded-full flex items-center justify-center" : "text-foreground"
                    )}>
                      {format(day, 'd')}
                    </div>
                    
                    {/* Tasks and Alarms */}
                    <div className="space-y-1">
                      {/* Show alarms first */}
                      {alarms.filter(alarm => 
                        alarm.enabled && 
                        (isSameDay(day, new Date()) || alarm.recurring)
                      ).map((alarm) => (
                        <div
                          key={`alarm-${alarm.id}`}
                          className="px-2 py-1 rounded text-xs font-medium text-white shadow-sm cursor-default transition-all truncate"
                          style={{ 
                            backgroundColor: '#8B5CF6',
                            filter: 'brightness(0.95)'
                          }}
                          title={`🔔 ${alarm.label} at ${alarm.time}`}
                        >
                          🔔 {alarm.label}
                        </div>
                      ))}
                      
                      {/* Show tasks */}
                      {dayTasks.slice(0, 3).map((task) => {
                        const endTime = getEndTime(task.startTime, task.duration);
                        return (
                                                     <div
                             key={task.id}
                             draggable
                             onDragStart={(e) => handleDragStart(e, task.id)}
                             className="px-2 py-1 rounded text-xs font-medium text-white shadow-sm cursor-move hover:shadow-md transition-all truncate"
                             style={{ 
                               backgroundColor: task.color,
                               filter: 'brightness(0.95)'
                             }}
                             title={`${task.title} - ${formatTimeWithAMPM(task.startTime)} to ${formatTimeWithAMPM(endTime)} (${task.duration}h)`}
                           >
                             {task.title}
                           </div>
                        );
                      })}
                      {dayTasks.length > 3 && (
                        <div className="text-xs text-muted-foreground px-2">
                          +{dayTasks.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
                     // Daily/Weekly unified grid view
                     <div 
             ref={scrollContainerRef}
             className="h-full overflow-y-auto" 
                           style={{
                '--time-col': '60px',
                '--grid-cols': view === 'daily' ? 'var(--time-col) 1fr' : 'var(--time-col) repeat(7, 1fr)'
              } as React.CSSProperties}
             onScroll={handleScroll}
           >
            {/* Header with days - Sticky within the same scroller */}
                                       <div className="sticky top-0 z-10 bg-card border-b border-border" style={{
                display: 'grid',
                gridTemplateColumns: view === 'daily' ? '60px 1fr' : '60px repeat(7, 1fr)',
                gap: 0
              }}>
              <div className="p-3 border-r border-border bg-muted/50 flex items-center justify-center pl-0">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Time</span>
              </div>
              {displayDays.map((day, index) => {
                const isToday = day.toDateString() === new Date().toDateString();
                return (
                  <div key={day.toISOString()} className={cn(
                    "p-3 text-center bg-muted/20 flex flex-col items-center justify-center",
                    index === displayDays.length - 1 ? "" : "border-r border-border/30"
                  )}>
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      {format(day, 'EEE')}
                    </div>
                    <div className={cn(
                      "text-xl font-semibold mt-1",
                      isToday ? "text-primary bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center" : "text-foreground"
                    )}>
                      {format(day, 'd')}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Time slot grid - Same grid template as header */}
                                       <div className="min-w-full" style={{
                display: 'grid',
                gridTemplateColumns: view === 'daily' ? '60px 1fr' : '60px repeat(7, 1fr)',
                gap: 0
              }}>
              {hours.map(hour => (
                <React.Fragment key={hour}>
                                     {/* Time label column */}
                   <div className="relative border-r border-border flex items-center justify-end pr-3 bg-background pl-0" style={{ height: '60px' }}>
                     <div className="text-xs text-muted-foreground font-medium leading-none tracking-wide">
                       {hour === 0 ? '12 AM' : hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                     </div>
                   </div>

                  {/* Day slot columns */}
                  {displayDays.map((day, dayIndex) => {
                    const slotTasks = getTasksForTimeSlot(day, hour);
                    const slotAlarms = getAlarmsForTimeSlot(day, hour);
                    const isCurrentSlot = isCurrentTimeSlot(day, hour);
                    const slotTime = addHours(new Date(day.getFullYear(), day.getMonth(), day.getDate()), hour);
                    const allItems: CalendarItem[] = [
                      ...slotTasks,
                      ...slotAlarms.map(alarm => ({
                        id: `alarm-${alarm.id}`,
                        title: `🔔 ${alarm.label}`,
                        projectId: '',
                        startTime: new Date(),
                        duration: 0,
                        color: '#8B5CF6',
                        time: alarm.time,
                        isAlarm: true
                      }))
                    ];

                    return (
                      <div
                        key={`${day.toISOString()}-${hour}`}
                        className={cn(
                          "relative cursor-pointer transition-all duration-150",
                          dayIndex === displayDays.length - 1 ? "" : "border-r border-border/30",
                          "hover:bg-timeSlot-hover",
                          isCurrentSlot && "bg-timeSlot-selected"
                        )}
                                                 style={{ 
                           height: '60px',
                           outline: isCurrentSlot ? '2px solid hsl(var(--time-current))' : 'none',
                           outlineOffset: '-2px',
                           borderBottom: hour < 23 ? '1px solid hsl(var(--border) / 0.3)' : 'none'
                         }}
                        onClick={() => onTimeSlotClick(slotTime)}
                        onDrop={(e) => handleDrop(e, slotTime)}
                        onDragOver={handleDragOver}
                      >
                        {/* Current time indicator line */}
                        {isCurrentSlot && (
                          <div className="absolute left-0 right-0 top-1/2 transform -translate-y-1/2 z-20">
                            <div className="h-0.5 bg-timeSlot-current relative">
                              <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-timeSlot-current rounded-full -ml-1" />
                            </div>
                          </div>
                        )}
                        
                        {/* Tasks and Alarms with proper spacing and fit */}
                        <div className="absolute inset-0 p-1">
                          <div className="h-full flex flex-col gap-0.5">
                            {allItems.map((item, index) => (
                              <div
                                key={item.id}
                                draggable={!item.isAlarm}
                                onDragStart={(e) => !item.isAlarm && handleDragStart(e, item.id)}
                                                                 className={cn(
                                   "px-2 py-1 rounded text-xs font-medium text-white shadow-sm transition-all flex-shrink-0",
                                   item.isAlarm ? "cursor-default" : "cursor-move hover:shadow-md"
                                 )}
                                                                 style={{ 
                                   backgroundColor: item.color,
                                   borderLeft: `3px solid ${item.color}`,
                                   filter: 'brightness(0.95)',
                                   maxHeight: `${(60 - 8) / allItems.length - 2}px`,
                                   minHeight: '20px'
                                 }}
                                title={item.isAlarm ? `Alarm: ${item.title} at ${item.time}` : `${item.title} - ${formatTimeWithAMPM(item.startTime)} to ${formatTimeWithAMPM(getEndTime(item.startTime, item.duration))}`}
                              >
                                                                 <div className="truncate font-medium leading-tight">{item.title}</div>
                                 {!item.isAlarm && item.duration > 0 && (
                                   <div className="flex items-center justify-between text-xs opacity-90 leading-tight mt-0.5">
                                     <span className="truncate">{formatTimeCompact(item.startTime)}</span>
                                     <span className="truncate">{formatTimeCompact(getEndTime(item.startTime, item.duration))}</span>
                                   </div>
                                 )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};