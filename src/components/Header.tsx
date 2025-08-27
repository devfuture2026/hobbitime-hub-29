import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Bell, Settings, Search, Clock, ChevronDown } from 'lucide-react';
import { format, addMonths, subMonths } from 'date-fns';

type ViewMode = 'calendar' | 'areas' | 'area-detail' | 'category-detail';

interface HeaderProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  onGoToToday: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenSettings: () => void;
  viewMode: 'calendar' | 'areas' | 'area-detail' | 'category-detail';
  onViewModeChange: (mode: 'calendar' | 'areas' | 'area-detail' | 'category-detail') => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedDate,
  onDateChange,
  onGoToToday,
  searchQuery,
  onSearchChange,
  onOpenSettings,
  viewMode,
  onViewModeChange
}) => {
  const [isViewDropdownOpen, setIsViewDropdownOpen] = useState(false);
  
  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (isViewDropdownOpen && !target.closest('.view-dropdown')) {
        setIsViewDropdownOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isViewDropdownOpen]);
  const currentMonth = format(selectedDate, 'MMMM yyyy');
  
  const generateMonthOptions = () => {
    const options = [];
    for (let i = -6; i <= 6; i++) {
      const monthDate = addMonths(new Date(), i);
      const value = format(monthDate, 'yyyy-MM');
      const label = format(monthDate, 'MMMM yyyy');
      options.push({ value, label });
    }
    return options;
  };

  const handleMonthChange = (value: string) => {
    const [year, month] = value.split('-');
    const newDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    onDateChange(newDate);
  };

  return (
    <header className="bg-card border-b border-border shadow-soft sticky top-0">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Logo */}
          <button
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => onViewModeChange('calendar')}
            aria-label="Go to Calendar View"
          >
            <div className="p-2 bg-gradient-primary rounded-lg">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-xl font-semibold text-foreground">Productive Calendar</h1>
              <p className="text-sm text-muted-foreground">Track your hobbies and projects</p>
            </div>
          </button>

          {/* Center - Calendar Controls (only visible in calendar mode) */}
          {viewMode === 'calendar' && (
            <div className="flex items-center space-x-3">
              <Select value={format(selectedDate, 'yyyy-MM')} onValueChange={handleMonthChange}>
                <SelectTrigger className="w-40 border-primary/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {generateMonthOptions().map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button
                variant="outline"
                size="sm"
                onClick={onGoToToday}
                className="border-primary/20 hover:bg-primary/10"
              >
                <Clock className="w-4 h-4 mr-2" />
                Today
              </Button>
            </div>
          )}

          {/* Right side - View Selector, Search and Controls */}
          <div className="flex items-center space-x-3">
            {/* View Mode Selector */}
            <div className="relative view-dropdown">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsViewDropdownOpen(!isViewDropdownOpen)}
                className="border-primary/20 hover:bg-primary/10"
              >
                {viewMode === 'calendar' ? 'Calendar View' : 'Area View'}
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
              
              {isViewDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-md shadow-lg z-50">
                  <div className="py-1">
                    <button
                      className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                      onClick={() => {
                        onViewModeChange('calendar');
                        setIsViewDropdownOpen(false);
                      }}
                    >
                      Calendar View
                    </button>
                    <button
                      className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                      onClick={() => {
                        onViewModeChange('areas');
                        setIsViewDropdownOpen(false);
                      }}
                    >
                      Area View
                    </button>
                    
                  </div>
                </div>
              )}
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search projects, tasks, events..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 w-64 border-primary/20 focus:ring-primary"
              />
            </div>
            
            
            <Button 
              variant="outline" 
              size="sm" 
              className="border-primary/20"
              onClick={onOpenSettings}
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};