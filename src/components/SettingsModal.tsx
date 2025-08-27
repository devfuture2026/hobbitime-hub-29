import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Moon, Sun, Globe } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
  onDarkModeToggle: (enabled: boolean) => void;
  timezone: string;
  onTimezoneChange: (timezone: string) => void;
}

const TIMEZONES = [
  { value: 'UTC', label: 'UTC (UTC+0)' },
  { value: 'America/New_York', label: 'Eastern Time (UTC-5/-4)' },
  { value: 'America/Chicago', label: 'Central Time (UTC-6/-5)' },
  { value: 'America/Denver', label: 'Mountain Time (UTC-7/-6)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (UTC-8/-7)' },
  { value: 'Europe/London', label: 'London (UTC+0/+1)' },
  { value: 'Europe/Paris', label: 'Paris (UTC+1/+2)' },
  { value: 'Europe/Berlin', label: 'Berlin (UTC+1/+2)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (UTC+9)' },
  { value: 'Asia/Shanghai', label: 'Shanghai (UTC+8)' },
  { value: 'Asia/Dubai', label: 'Dubai (UTC+4)' },
  { value: 'Australia/Sydney', label: 'Sydney (UTC+10/+11)' },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  darkMode,
  onDarkModeToggle,
  timezone,
  onTimezoneChange
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Dark Theme Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {darkMode ? (
                <Moon className="w-5 h-5 text-muted-foreground" />
              ) : (
                <Sun className="w-5 h-5 text-muted-foreground" />
              )}
              <div>
                <Label htmlFor="dark-mode" className="text-sm font-medium">
                  Dark Theme
                </Label>
                <p className="text-xs text-muted-foreground">
                  Switch between light and dark mode
                </p>
              </div>
            </div>
            <Switch
              id="dark-mode"
              checked={darkMode}
              onCheckedChange={onDarkModeToggle}
            />
          </div>

          {/* Time Zone Selector */}
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Globe className="w-5 h-5 text-muted-foreground" />
              <div>
                <Label htmlFor="timezone" className="text-sm font-medium">
                  Time Zone
                </Label>
                <p className="text-xs text-muted-foreground">
                  Display timezone for all events
                </p>
              </div>
            </div>
            <Select value={timezone} onValueChange={onTimezoneChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {TIMEZONES.map(tz => (
                  <SelectItem key={tz.value} value={tz.value}>
                    {tz.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};