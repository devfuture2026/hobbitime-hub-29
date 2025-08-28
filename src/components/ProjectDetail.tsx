import React, { useMemo, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, MoreVertical, Plus } from 'lucide-react';
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
  listId?: string;
}

interface Project {
  id: string;
  name: string;
  color: string;
  category: 'hobby' | 'work' | 'personal';
  area: string;
  dueDate?: Date | null;
  parentId?: string;
}

interface List {
  id: string;
  title: string;
  projectId: string;
}

interface Action {
  id: string;
  title: string;
  description?: string;
  type: 'alarm' | 'reminder';
  area: string;
  time?: string;
  enabled?: boolean;
  daysOfWeek?: string[];
  dueDate?: Date | null;
}

interface ProjectDetailProps {
  project: Project;
  tasks: Task[];
  projects: Project[];
  lists: List[];
  actions: Action[];
  onBack: () => void;
  onAddCategory: () => void;
  onProjectSelect: (projectId: string) => void;
  onListSelect: (listId: string) => void;
  onActionToggle: (actionId: string, enabled: boolean) => void;
  onActionEdit: (actionId: string) => void;
  onActionDelete: (actionId: string) => void;
  onProjectRename: (projectId: string, newName: string) => void;
  onProjectDelete: (projectId: string) => void;
  onListRename: (listId: string, newTitle: string) => void;
  onListDelete: (listId: string) => void;
}

export const ProjectDetail: React.FC<ProjectDetailProps> = ({
  project,
  tasks,
  projects,
  lists,
  actions,
  onBack,
  onAddCategory,
  onProjectSelect,
  onListSelect,
  onActionToggle,
  onActionEdit,
  onActionDelete,
  onProjectRename,
  onProjectDelete,
  onListRename,
  onListDelete
}) => {
  // Get child projects (projects that have this project as parent)
  const childProjects = useMemo(() => 
    projects.filter(p => p.parentId === project.id), 
    [projects, project.id]
  );

  // Get lists that belong to this project
  const projectLists = useMemo(() => 
    lists.filter(l => l.projectId === project.id), 
    [lists, project.id]
  );

  // Get actions that belong to this project's area
  const projectActions = useMemo(() => 
    actions.filter(a => a.area === project.area), 
    [actions, project.area]
  );

  // Calculate progress for this project
  const projectTasks = tasks.filter(t => t.projectId === project.id);
  const totalTasks = projectTasks.length;
  const completedTasks = projectTasks.filter(t => t.completed).length;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

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
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: project.color }} />
            <div>
              <h1 className="text-2xl font-bold text-foreground">{project.name}</h1>
              <p className="text-muted-foreground text-sm">{project.area} • {project.category}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="w-64">
            <div className="text-sm text-muted-foreground mb-1">Progress</div>
            <Progress value={progress} />
          </div>
          <Button onClick={onAddCategory} className="bg-gradient-primary text-white">
            <Plus className="w-4 h-4 mr-2" />
            Category
          </Button>
        </div>
      </div>

      {/* Child Projects Section */}
      {childProjects.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {childProjects.map(childProject => {
              const childTasks = tasks.filter(t => t.projectId === childProject.id);
              const done = childTasks.filter(t => t.completed).length;
              const pct = childTasks.length > 0 ? (done / childTasks.length) * 100 : 0;
              
              return (
                <Card
                  key={childProject.id}
                  className="border-border group cursor-pointer"
                  draggable
                  onDragStart={(e) => { draggedIdRef.current = childProject.id; e.dataTransfer.effectAllowed = 'move'; }}
                  onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
                  onDrop={() => { if (draggedIdRef.current && draggedIdRef.current !== childProject.id) {
                    // Handle reordering if needed
                    draggedIdRef.current = null;
                  }}}
                  onClick={() => onProjectSelect(childProject.id)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: childProject.color }} />
                        <div>
                          <CardTitle className="text-base">{childProject.name}</CardTitle>
                          {childProject.dueDate && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Due: {new Date(childProject.dueDate).toLocaleDateString()}
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
                              const name = window.prompt('Rename project', childProject.name)?.trim();
                              if (name) onProjectRename(childProject.id, name);
                            }}>Rename</DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm('Delete this project and its tasks?')) onProjectDelete(childProject.id);
                            }}>Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{done}/{childTasks.length} completed</span>
                        <span>{Math.round(pct)}%</span>
                      </div>
                      <Progress value={pct} className="h-1.5" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Lists Section */}
      {projectLists.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Lists</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projectLists.map(list => {
              const listTasks = tasks.filter(t => t.listId === list.id);
              const done = listTasks.filter(t => t.completed).length;
              const pct = listTasks.length > 0 ? (done / listTasks.length) * 100 : 0;
              
              return (
                <Card
                  key={list.id}
                  className="border-border group cursor-pointer"
                  onClick={() => onListSelect(list.id)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{list.title}</CardTitle>
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
                              const title = window.prompt('Rename list', list.title)?.trim();
                              if (title) onListRename(list.id, title);
                            }}>Rename</DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm('Delete this list and its tasks?')) onListDelete(list.id);
                            }}>Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{done}/{listTasks.length} completed</span>
                        <span>{Math.round(pct)}%</span>
                      </div>
                      <Progress value={pct} className="h-1.5" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Actions Section */}
      {projectActions.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projectActions.map(action => (
              <Card key={action.id} className="border-border">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{action.title}</CardTitle>
                    <div className="flex items-center space-x-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon" variant="ghost" className="h-7 w-7">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onActionEdit(action.id)}>Edit</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onActionDelete(action.id)}>Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {action.description && (
                    <p className="text-sm text-muted-foreground mb-2">{action.description}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground capitalize">{action.type}</span>
                    <Button
                      size="sm"
                      variant={action.enabled ? "default" : "outline"}
                      onClick={() => onActionToggle(action.id, !action.enabled)}
                    >
                      {action.enabled ? 'Enabled' : 'Disabled'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {childProjects.length === 0 && projectLists.length === 0 && projectActions.length === 0 && (
        <Card className="md:col-span-2">
          <CardContent className="py-8">
            <p className="text-muted-foreground">No categories yet — add one above.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
