import React, { useMemo, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { TaskPills } from '@/components/TaskPills';
import { MoreVertical, Plus, FolderOpen, List, Zap } from 'lucide-react';
import { ActionCard } from '@/components/ActionCard';

interface Project {
  id: string;
  name: string;
  color: string;
  area: string;
  dueDate?: Date | null;
  parentId?: string; // For nesting projects within projects
}

interface TaskItem {
  id: string;
  title: string;
  completed: boolean;
  projectId: string;
  listId?: string;
  color?: string;
  startTime?: Date;
  dueDate?: Date | null;
  duration?: number;
  priority?: 'high' | 'medium' | 'low';
  effortLevel?: 'small' | 'medium' | 'large';
  description?: string;
}

interface ListItem {
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
  projectId?: string; // Associate actions with specific projects
  // Alarm specific
  time?: string;
  enabled?: boolean;
  daysOfWeek?: string[];
  // Reminder specific
  dueDate?: Date | null;
}

interface CategoryBoardProps {
  project: Project;
  tasks: TaskItem[];
  lists: ListItem[];
  actions: Action[];
  projects?: Project[]; // For displaying child projects
  onAddList: (projectId: string, title: string) => void;
  onRenameList: (listId: string, newTitle: string) => void;
  onDeleteList: (listId: string) => void;
  onAddTask: (listId: string, title: string) => void;
  onToggleTask: (taskId: string) => void;
  onEditTask: (taskId: string, changes: Partial<TaskItem>) => void;
  onDeleteTask: (taskId: string) => void;
  onReorderWithinList: (listId: string, sourceTaskId: string, targetTaskId: string) => void;
  onMoveTaskToList: (taskId: string, toListId: string, beforeTaskId?: string) => void;
  onBack: () => void;
  onOpenCategorySelection: () => void;
  onToggleActionEnabled?: (actionId: string, enabled: boolean) => void;
  onEditAction?: (actionId: string) => void;
  onDeleteAction?: (actionId: string) => void;
  onProjectSelect?: (projectId: string) => void;
}

export const CategoryBoard: React.FC<CategoryBoardProps> = ({
  project,
  tasks,
  lists,
  actions,
  projects = [],
  onAddList,
  onRenameList,
  onDeleteList,
  onAddTask,
  onToggleTask,
  onEditTask,
  onDeleteTask,
  onReorderWithinList,
  onMoveTaskToList,
  onBack,
  onOpenCategorySelection,
  onToggleActionEnabled,
  onEditAction,
  onDeleteAction,
  onProjectSelect
}) => {
  const dragTaskIdRef = useRef<string | null>(null);
  const dragFromListIdRef = useRef<string | null>(null);

  const tasksByList = useMemo(() => {
    const map: Record<string, TaskItem[]> = {};
    lists.forEach(l => { map[l.id] = []; });
    tasks
      .filter(t => t.projectId === project.id)
      .forEach(t => {
        const lid = t.listId && map[t.listId] !== undefined ? t.listId : undefined;
        if (lid) map[lid].push(t);
      });
    return map;
  }, [tasks, lists, project.id]);

  const totalTasks = tasks.filter(t => t.projectId === project.id).length;
  const completedTasks = tasks.filter(t => t.projectId === project.id && t.completed).length;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  // Filter actions that belong to this specific project
  const projectActions = actions.filter(action => action.projectId === project.id);

  return (
    <div className="flex-1 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <button className="border px-3 py-1 rounded" onClick={onBack}>Back</button>
          <div>
            <h2 className="text-2xl font-semibold">{project.name}</h2>
            {project.dueDate && (
              <p className="text-sm text-muted-foreground mt-1">
                Due: {new Date(project.dueDate).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="w-64">
            <div className="text-sm text-muted-foreground mb-1">Progress</div>
            <Progress value={progress} />
          </div>
          <Button onClick={onOpenCategorySelection} className="bg-gradient-primary text-white">
            <Plus className="w-4 h-4 mr-2" /> Category
          </Button>
        </div>
      </div>

      {/* Unified Container for Projects, Lists, and Actions */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Categories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Child Projects */}
          {projects.filter(p => p.parentId === project.id).map(childProject => {
            const childTasks = tasks.filter(t => t.projectId === childProject.id);
            const done = childTasks.filter(t => t.completed).length;
            const pct = childTasks.length > 0 ? (done / childTasks.length) * 100 : 0;
            
            return (
              <Card
                key={childProject.id}
                className="border-border group cursor-pointer"
                onClick={() => onProjectSelect?.(childProject.id)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 rounded-lg text-white" style={{ backgroundColor: childProject.color }}>
                        <FolderOpen className="w-4 h-4" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{childProject.name}</CardTitle>
                        {childProject.dueDate && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Due: {new Date(childProject.dueDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
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

          {/* Lists with full task management */}
          {lists.filter(l => l.projectId === project.id).map(list => {
            const listTasks = tasksByList[list.id] || [];
            const done = listTasks.filter(t => t.completed).length;
            const pct = listTasks.length > 0 ? (done / listTasks.length) * 100 : 0;
            
            return (
              <Card
                key={list.id}
                className="border-border"
              >
                <CardHeader className="py-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">
                      <button onClick={() => {
                        const name = window.prompt('Rename list', list.title)?.trim();
                        if (name) onRenameList(list.id, name);
                      }} className="text-left">
                        {list.title}
                      </button>
                    </CardTitle>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost" className="h-7 w-7">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => {
                          const name = window.prompt('Rename list', list.title)?.trim();
                          if (name) onRenameList(list.id, name);
                        }}>Rename</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          if (window.confirm('Delete this list and its tasks?')) onDeleteList(list.id);
                        }}>Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent
                  className="space-y-2 min-h-[60px]"
                  onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
                  onDrop={() => {
                    if (dragTaskIdRef.current) {
                      onMoveTaskToList(dragTaskIdRef.current, list.id);
                      dragTaskIdRef.current = null;
                      dragFromListIdRef.current = null;
                    }
                  }}
                >
                  {(tasksByList[list.id] || []).length === 0 ? (
                    <p className="text-muted-foreground text-sm">No tasks yet — add one below.</p>
                   ) : (
                    (tasksByList[list.id] || []).map(task => (
                      <div
                        key={task.id}
                        className={`flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50 transition-colors group ${
                          task.completed ? 'opacity-75' : ''
                        }`}
                        draggable
                        onDragStart={(e) => {
                          dragTaskIdRef.current = task.id;
                          dragFromListIdRef.current = list.id;
                          e.dataTransfer.effectAllowed = 'move';
                        }}
                        onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
                        onDrop={() => {
                          if (!dragTaskIdRef.current) return;
                          if (dragFromListIdRef.current === list.id) {
                            onReorderWithinList(list.id, dragTaskIdRef.current, task.id);
                          } else {
                            onMoveTaskToList(dragTaskIdRef.current, list.id, task.id);
                          }
                          dragTaskIdRef.current = null;
                          dragFromListIdRef.current = null;
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={() => onToggleTask(task.id)}
                          className="w-4 h-4 rounded border-border"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <span className={`text-sm font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                              {task.title}
                            </span>
                            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground" 
                                onClick={() => {
                                  const title = window.prompt('Edit task title', task.title)?.trim();
                                  if (title) onEditTask(task.id, { title });
                                }}
                              >
                                ✏️
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive" 
                                onClick={() => {
                                  if (window.confirm('Delete this task?')) onDeleteTask(task.id);
                                }}
                              >
                                🗑️
                              </Button>
                            </div>
                          </div>
                          
                          {/* Task Pills - Compact overview of task properties */}
                          <TaskPills
                            startTime={task.startTime}
                            dueDate={task.dueDate}
                            duration={task.duration}
                            priority={task.priority}
                            effortLevel={task.effortLevel}
                            description={task.description}
                            className="mb-2"
                          />
                        </div>
                      </div>
                    ))
                  )}
                  <div className="pt-2">
                    <Input
                      placeholder="Add task..."
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const value = (e.target as HTMLInputElement).value.trim();
                          if (!value) return;
                          onAddTask(list.id, value);
                          (e.target as HTMLInputElement).value = '';
                        }
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {/* Actions */}
          {projectActions.map(action => (
            <ActionCard
              key={action.id}
              action={action}
              onToggleEnabled={onToggleActionEnabled}
              onEdit={onEditAction}
              onDelete={onDeleteAction}
            />
          ))}

          {/* Empty state if no categories */}
          {projects.filter(p => p.parentId === project.id).length === 0 &&
           lists.filter(l => l.projectId === project.id).length === 0 &&
           projectActions.length === 0 && (
            <Card className="md:col-span-2">
              <CardContent className="py-8">
                <p className="text-muted-foreground">No categories yet — add one above.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryBoard;