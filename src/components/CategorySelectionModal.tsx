import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FolderOpen, List, Zap } from 'lucide-react';

interface CategorySelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProject: () => void;
  onSelectList: () => void;
  onSelectAction: () => void;
  context?: {
    type: 'area' | 'project';
    name: string;
    id?: string;
  };
}

export const CategorySelectionModal: React.FC<CategorySelectionModalProps> = ({
  isOpen,
  onClose,
  onSelectProject,
  onSelectList,
  onSelectAction,
  context
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-gradient-card border-primary/20">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {context ? `Add New Category to ${context.name}` : 'Add New Category'}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {context 
              ? `Choose what type of category you'd like to create in ${context.type === 'area' ? 'area' : 'project'} "${context.name}"`
              : 'Choose what type of category you\'d like to create'
            }
          </p>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <Card 
            className="cursor-pointer hover:shadow-medium transition-all duration-300 border-primary/20 hover:border-primary/40"
            onClick={onSelectProject}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FolderOpen className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">Project</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    A collection of related tasks and lists
                  </p>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-medium transition-all duration-300 border-primary/20 hover:border-primary/40"
            onClick={onSelectList}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <List className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <CardTitle className="text-base">List</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    A simple list of tasks or items
                  </p>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-medium transition-all duration-300 border-primary/20 hover:border-primary/40"
            onClick={onSelectAction}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-warning/10 rounded-lg">
                  <Zap className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <CardTitle className="text-base">Action</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Single actions like alarms or reminders
                  </p>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};