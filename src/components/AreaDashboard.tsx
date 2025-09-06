import React, { useMemo, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, MoreVertical, Code, Heart, Home, GraduationCap, Users, Gamepad2, DollarSign, Brain, Plus, FolderOpen, List, Zap } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ActionCard } from '@/components/ActionCard';

import { TaskPills } from '@/components/TaskPills';

interface Task {
  id: string;
  title: string;
  projectId: string;
  startTime: Date;
  duration: number;
  color: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  listId?: string; // Added for lists
  dueDate?: Date | null;
  effortLevel?: 'small' | 'medium' | 'large';
  description?: string;
}

interface Project {
  id: string;
  name: string;
  color: string;
  category: 'hobby' | 'work' | 'personal';
  area: string;
  dueDate?: Date | null;
  parentId?: string; // For nesting projects within projects
}

interface Action {
  id: string;
  title: string;
  description?: string;
  type: 'alarm' | 'reminder';
  area: string;
  projectId?: string; // Associate actions with specific projects
  // Alarm specific
  time?: string;
  enabled?: boolean;
  daysOfWeek?: string[];
  // Reminder specific
  dueDate?: Date | null;
}

interface ListItem {
  id: string;
  title: string;
  projectId: string;
}

interface AreaDashboardProps {
  areaName: string;
  tasks: Task[];
  projects: Project[];
  actions?: Action[]; // Add actions prop
  lists?: ListItem[]; // Add lists prop
  onBack: () => void;
  onAddCategory: (areaName: string, parentProjectId?: string) => void;
  onCategorySelect: (projectId: string) => void;
  onQuickAddTask: (projectId: string) => void;
  onReorderCategories: (areaName: string, sourceId: string, targetId: string) => void;
  onRenameCategory: (projectId: string, newName: string) => void;
  onDeleteCategory: (projectId: string) => void;
  onToggleActionEnabled?: (actionId: string, enabled: boolean) => void;
  onEditAction?: (actionId: string) => void;
  onDeleteAction?: (actionId: string) => void;
  onRenameList?: (listId: string, newTitle: string) => void;
  onDeleteList?: (listId: string) => void;
  onAddTask?: (listId: string, title: string) => void;
  onToggleTask?: (taskId: string) => void;
  onEditTask?: (taskId: string, changes: Partial<Task>) => void;
  onDeleteTask?: (taskId: string) => void;
  onCreateTask?: (task: any) => void; // Add this for TaskModal
}

export const AreaDashboard: React.FC<AreaDashboardProps> = ({ 
  areaName, 
  tasks, 
  projects, 
  actions = [], // Default to empty array
  lists = [], // Default to empty array
  onBack, 
  onAddCategory, 
  onCategorySelect, 
  onQuickAddTask, 
  onReorderCategories, 
  onRenameCategory, 
  onDeleteCategory,
  onToggleActionEnabled,
  onEditAction,
  onDeleteAction,
  onRenameList,
  onDeleteList,
  onAddTask,
  onToggleTask,
  onEditTask,
  onDeleteTask,
  onCreateTask
}) => {

  
  // State for project navigation
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [breadcrumbPath, setBreadcrumbPath] = useState<Project[]>([]);



  // Navigation handlers
  const handleProjectClick = useCallback((projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setCurrentProjectId(projectId);
      setBreadcrumbPath(prev => [...prev, project]);
    }
  }, [projects]);

  const handleBackToParent = useCallback(() => {
    if (breadcrumbPath.length > 0) {
      const newPath = breadcrumbPath.slice(0, -1);
      setBreadcrumbPath(newPath);
      setCurrentProjectId(newPath.length > 0 ? newPath[newPath.length - 1].id : null);
    }
  }, [breadcrumbPath]);

  const handleBackToArea = useCallback(() => {
    setCurrentProjectId(null);
    setBreadcrumbPath([]);
  }, []);

  // Filter projects based on current context
  const currentProjects = useMemo(() => {
    if (currentProjectId) {
      // Show child projects of the current project
      return projects.filter(p => p.parentId === currentProjectId);
    } else {
      // Show top-level projects in the area
      return projects.filter(p => p.area === areaName && !p.parentId);
    }
  }, [projects, areaName, currentProjectId]);

  const areaProjectIds = useMemo(() => new Set(currentProjects.map(p => p.id)), [currentProjects]);
  
  // Filter lists and tasks that belong to this area
  const { areaLists, areaTasks } = useMemo(() => {
    let filteredLists;
    
    if (currentProjectId) {
      // When inside a project, show lists that belong to that specific project
      filteredLists = lists.filter(l => l.projectId === currentProjectId);
    } else {
      // When at area level, show lists that belong to the area (no specific project)
      const areaProjectId = `area-${areaName.toLowerCase()}`;
      filteredLists = lists.filter(l => l.projectId === areaProjectId);
    }
    
    // Tasks that belong to area projects
    const projectTasks = tasks.filter(t => t.projectId && areaProjectIds.has(t.projectId));
    
    // Tasks that belong to area lists (even if they don't have a projectId yet)
    const listTasks = tasks.filter(t => t.listId && filteredLists.some(list => list.id === t.listId));
    
    // Combine and remove duplicates
    const allTasks = [...projectTasks, ...listTasks];
    const uniqueTasks = allTasks.filter((task, index, self) => 
      index === self.findIndex(t => t.id === task.id)
    );
    
    console.log('AreaDashboard - Current project ID:', currentProjectId); // Debug log
    console.log('AreaDashboard - All tasks:', tasks); // Debug log
    console.log('AreaDashboard - Area projects:', currentProjects); // Debug log
    console.log('AreaDashboard - Filtered lists:', filteredLists); // Debug log
    console.log('AreaDashboard - Project tasks:', projectTasks); // Debug log
    console.log('AreaDashboard - List tasks:', listTasks); // Debug log
    console.log('AreaDashboard - Final area tasks:', uniqueTasks); // Debug log
    
    return {
      areaLists: filteredLists,
      areaTasks: uniqueTasks
    };
  }, [tasks, areaProjectIds, lists, areaName, currentProjectId]);
  
  // Filter actions based on context:
  // - If we're in a project (currentProjectId is set), only show project-specific actions
  // - If we're at area level, show area-level actions (no projectId)
  const areaActions = useMemo(() => {
    console.log('AreaDashboard - All actions:', actions);
    console.log('AreaDashboard - Area name:', areaName);
    console.log('AreaDashboard - Current project ID:', currentProjectId);
    
    if (currentProjectId) {
      // We're inside a project - only show actions specific to this project
      const filtered = actions.filter(a => a.projectId === currentProjectId);
      console.log('AreaDashboard - Project-specific actions:', filtered);
      return filtered;
    } else {
      // We're at area level - only show area-level actions (no projectId)
      const filtered = actions.filter(a => a.area === areaName && !a.projectId);
      console.log('AreaDashboard - Area-level actions:', filtered);
      return filtered;
    }
  }, [actions, areaName, currentProjectId]);

  const completedTasks = areaTasks.filter(t => t.completed).length;
  const progress = areaTasks.length > 0 ? (completedTasks / areaTasks.length) * 100 : 0;

  const getAreaIcon = useCallback((name: string) => {
    const map: Record<string, React.ElementType> = {
      'Development': Code,
      'Wellness': Heart,
      'Chores': Home,
      'Education': GraduationCap,
      'Community': Users,
      'Leisure': Gamepad2,
      'Finance': DollarSign,
      'Mindfulness': Brain
    };
    return map[name] ?? Code;
  }, []);

  const getAreaColor = useCallback((name: string) => {
    const map: Record<string, string> = {
      'Development': '#3B82F6',
      'Wellness': '#EF4444',
      'Chores': '#6B7280',
      'Education': '#10B981',
      'Community': '#8B5CF6',
      'Leisure': '#F59E0B',
      'Finance': '#059669',
      'Mindfulness': '#7C3AED'
    };
    return map[name] ?? '#3B82F6';
  }, []);

  const draggedIdRef = useRef<string | null>(null);

  const getAreaDescription = useCallback((name: string) => {
    const descriptions: Record<string, string> = {
      'Development': 'This is your Development area.',
      'Wellness': 'This is your Wellness area.',
      'Education': 'This is your Education area.',
      'Chores': 'This is your Chores area.',
      'Community': 'This is your Community area.',
      'Leisure': 'This is your Leisure area.',
      'Finance': 'This is your Finance area.',
      'Mindfulness': 'This is your Mindfulness area.'
    };
    return descriptions[name] ?? `This is your ${name} area.`;
  }, []);

  return (
    <div className="flex-1 p-6 max-w-full overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" onClick={onBack} className="border border-border">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center space-x-2">
            {(() => {
              const Icon = getAreaIcon(areaName);
              const color = getAreaColor(areaName);
              return (
                <span className="p-2 rounded-md text-white" style={{ backgroundColor: color }}>
                  <Icon className="w-5 h-5" />
                </span>
              );
            })()}
                         <div>
               <h1 className="text-2xl font-bold text-foreground">
                 {currentProjectId ? 
                   projects.find(p => p.id === currentProjectId)?.name || areaName : 
                   areaName
                 }
               </h1>
               <p className="text-muted-foreground text-sm">
                 {currentProjectId ? 
                   `This is your ${projects.find(p => p.id === currentProjectId)?.name} project.` :
                   getAreaDescription(areaName)
                 }
               </p>
               {/* Breadcrumb navigation - Always visible */}
               <div className="flex items-center space-x-2 mt-1">
                 <span className="text-xs text-muted-foreground">Path:</span>
                 <button
                   onClick={() => {
                     setCurrentProjectId(null);
                     setBreadcrumbPath([]);
                   }}
                   className="text-xs text-primary hover:underline"
                 >
                   {areaName}
                 </button>
                 {breadcrumbPath.length > 0 && (
                   <>
                     <span className="text-xs text-muted-foreground">/</span>
                     {breadcrumbPath.map((project, index) => (
                       <React.Fragment key={project.id}>
                         <button
                           onClick={() => {
                             const newPath = breadcrumbPath.slice(0, index + 1);
                             setBreadcrumbPath(newPath);
                             setCurrentProjectId(project.id);
                           }}
                           className="text-xs text-primary hover:underline"
                         >
                           {project.name}
                         </button>
                         {index < breadcrumbPath.length - 1 && (
                           <span className="text-xs text-muted-foreground">/</span>
                         )}
                       </React.Fragment>
                     ))}
                   </>
                 )}
               </div>
             </div>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="w-64">
            <div className="text-sm text-muted-foreground mb-1">Progress</div>
            <Progress value={progress} />
          </div>
                     <Button onClick={() => onAddCategory(areaName, currentProjectId || undefined)} className="bg-gradient-primary text-white">
             <Plus className="w-4 h-4 mr-2" />
             Category
           </Button>
        </div>
      </div>

      {/* Unified Container for Projects, Lists, and Actions */}
      <div className="mb-8">
                 <h2 className="text-lg font-semibold mb-4">
           {currentProjectId ? 'Sub-Categories' : 'Categories'}
         </h2>
        <div className="flex flex-wrap gap-4 max-w-full items-start">
                     {/* Projects */}
           {currentProjects.map(project => {
            const projectTasks = areaTasks.filter(t => t.projectId === project.id);
            const done = projectTasks.filter(t => t.completed).length;
            const pct = projectTasks.length > 0 ? (done / projectTasks.length) * 100 : 0;
            return (
                             <Card
                 key={project.id}
                 className="border-border group cursor-pointer w-96 h-32 flex flex-col"
                 draggable
                 onDragStart={(e) => { draggedIdRef.current = project.id; e.dataTransfer.effectAllowed = 'move'; }}
                 onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
                 onDrop={() => { if (draggedIdRef.current && draggedIdRef.current !== project.id) onReorderCategories(areaName, draggedIdRef.current, project.id); draggedIdRef.current = null; }}
                 onClick={() => handleProjectClick(project.id)}
               >
                <CardHeader className="pb-2 flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 rounded-lg text-white" style={{ backgroundColor: project.color }}>
                        <FolderOpen className="w-4 h-4" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{project.name}</CardTitle>
                        {project.dueDate && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Due: {new Date(project.dueDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon" variant="ghost" className="h-7 w-7 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            const name = window.prompt('Rename project', project.name)?.trim();
                            if (name) onRenameCategory(project.id, name);
                          }}>Rename</DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm('Delete this project and its tasks?')) onDeleteCategory(project.id);
                          }}>Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 flex-1 flex flex-col justify-end">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{done}/{projectTasks.length} completed</span>
                      <span>{Math.round(pct)}%</span>
                    </div>
                    <Progress value={pct} className="h-1.5" />
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {/* Lists */}
          {areaLists.map(list => {
            const listTasks = areaTasks.filter(t => t.listId === list.id);
            console.log(`List ${list.title} (${list.id}) - tasks:`, listTasks); // Debug log
            
            const done = listTasks.filter(t => t.completed).length;
            const pct = listTasks.length > 0 ? (done / listTasks.length) * 100 : 0;
            
            return (
                            <Card
                key={list.id}
                className={`border-border group w-80 flex flex-col ${listTasks.length === 0 ? 'min-h-[96px]' : ''}`}
              >
                <CardHeader className="py-3 flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">{list.title}</CardTitle>
                    </div>
                    {onRenameList && onDeleteList && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon" variant="ghost" className="h-7 w-7 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => {
                            const name = window.prompt('Rename list', list.title)?.trim();
                            if (name) onRenameList(list.id, name);
                          }}>Rename</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            if (window.confirm('Delete this list?')) onDeleteList(list.id);
                          }}>Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </CardHeader>
                <CardContent
                  className={`space-y-2 p-3 pt-0 ${listTasks.length > 0 ? 'flex-1 flex flex-col' : ''}`}
                >
                  <div className={`space-y-2 ${listTasks.length > 0 ? 'flex-1 flex flex-col' : ''}`}>
                    <div className={`${listTasks.length > 0 ? 'flex-1 overflow-y-auto space-y-2 max-h-64' : ''}`}>
                       {listTasks.length === 0 ? (
                        <p className="text-muted-foreground text-sm">No tasks yet — add one below.</p>
                       ) : (
                        listTasks.map(task => (
                          <div key={task.id} className="group p-3 rounded-md bg-accent/5 hover:bg-accent/10 transition-colors min-h-[80px]">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2 flex-1 min-w-0">
                                <input
                                  type="checkbox"
                                  checked={task.completed}
                                  onChange={() => {
                                    if (onToggleTask) {
                                      onToggleTask(task.id);
                                    }
                                  }}
                                  className="rounded border-border flex-shrink-0"
                                />
                                <span className={`text-sm font-medium truncate ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                                  {task.title}
                                </span>
                              </div>
                              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const title = window.prompt('Edit task', task.title)?.trim();
                                    if (title && onEditTask) {
                                      onEditTask(task.id, { title });
                                    }
                                  }}
                                >
                                  ✏️
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (window.confirm('Delete this task?') && onDeleteTask) {
                                      onDeleteTask(task.id);
                                    }
                                  }}
                                >
                                  🗑️
                                </Button>
                              </div>
                            </div>
                            
                            <TaskPills
                              startTime={task.startTime}
                              dueDate={task.dueDate}
                              duration={task.duration}
                              priority={task.priority}
                              effortLevel={task.effortLevel}
                              description={task.description}
                              className="mt-2"
                            />
                          </div>
                        ))
                      )}
                    </div>
                    <div className="pt-2 flex-shrink-0">
                      <input
                        type="text"
                        placeholder="Add task..."
                        className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const input = e.target as HTMLInputElement;
                            const title = input.value.trim();
                            if (title) {
                              if (onAddTask) {
                                onAddTask(list.id, title);
                              }
                              input.value = '';
                            }
                          }
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {/* Actions */}
          {areaActions.map(action => (
            <ActionCard
              key={action.id}
              action={action}
              onToggleEnabled={onToggleActionEnabled}
              onEdit={onEditAction}
              onDelete={onDeleteAction}
            />
          ))}

                     {/* Empty state if no categories */}
           {currentProjects.length === 0 && areaLists.length === 0 && areaActions.length === 0 && (
            <div className="w-full text-center py-8">
              <p className="text-muted-foreground">No categories yet — add one above.</p>
            </div>
          )}
        </div>
      </div>


    </div>
  );
};

// ... existing code ...

