import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { CalendarGrid } from '@/components/CalendarGrid';
import { TodayOverview } from '@/components/TodayOverview';
import { AreasDashboard } from '@/components/AreasDashboard';
import { AreaDashboard } from '@/components/AreaDashboard';
import { CategoryBoard } from '@/components/CategoryBoard';
import { ProjectDetail } from '@/components/ProjectDetail';
import { AlarmPanel } from '@/components/AlarmPanel';
import { TaskModal } from '@/components/TaskModal';
import { ProjectModal } from '@/components/ProjectModal';
import { ProjectTasksModal } from '@/components/ProjectTasksModal';
import { CategorySelectionModal } from '@/components/CategorySelectionModal';
import { ActionModal } from '@/components/ActionModal';
import { Header } from '@/components/Header';
import { SettingsModal } from '@/components/SettingsModal';
import { addDays, startOfToday } from 'date-fns';

type ViewMode = 'calendar' | 'areas' | 'area-detail' | 'category-detail' | 'project-detail';

type Task = {
  id: string;
  title: string;
  projectId: string;
  startTime: Date;
  duration: number;
  color: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  listId?: string;
  dueDate?: Date | null;
  area?: string;
  category?: string;
  effortLevel?: 'small' | 'medium' | 'large';
  isRecurring?: boolean;
  recurringPattern?: 'daily' | 'weekly' | 'monthly';
  description?: string;
};

type Action = {
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
};

type Project = {
  id: string;
  name: string;
  color: string;
  tasksCount: number;
  completedTasks: number;
  category: 'hobby' | 'work' | 'personal';
  area: string;
  dueDate?: Date | null;
  parentId?: string; // For nesting projects within projects
};

const Index = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isProjectTasksModalOpen, setIsProjectTasksModalOpen] = useState(false);
  const [isCategorySelectionModalOpen, setIsCategorySelectionModalOpen] = useState(false);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string>();
  const [quickAddProjectId, setQuickAddProjectId] = useState<string>();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedProjectDetailId, setSelectedProjectDetailId] = useState<string | null>(null);
  const [lists, setLists] = useState<Array<{ id: string; title: string; projectId: string }>>([
    {
      id: 'list-1',
      title: 'New List',
      projectId: 'area-development'
    }
  ]);
  const [actions, setActions] = useState<Action[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'active' | 'completed' | 'overdue'>('all');
  const [quickAddTaskData, setQuickAddTaskData] = useState<{ title: string; listId: string } | null>(null);
  const [categorySelectionContext, setCategorySelectionContext] = useState<{ type: 'area' | 'project'; name: string; id?: string } | null>(null);
  const draggedTaskIdRef = useRef<string | null>(null);
  const [darkMode, setDarkMode] = useState(() => {
    // Check localStorage first, then system preference
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) {
      return JSON.parse(saved);
    }
    // Fall back to system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [timezone, setTimezone] = useState('America/New_York');

  // Apply dark mode class to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    // Save to localStorage
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  // Sample data - Updated wellness projects with routines
  const [projects, setProjects] = useState<Project[]>([
    {
      id: '1',
      name: 'Learning Spanish',
      color: '#10B981',
      tasksCount: 12,
      completedTasks: 8,
      category: 'hobby' as const,
      area: 'Education',
      dueDate: null
    },
    {
      id: '2',
      name: 'Morning Routine',
      color: '#F59E0B',
      tasksCount: 5,
      completedTasks: 3,
      category: 'personal' as const,
      area: 'Wellness',
      dueDate: null
    },
    {
      id: '3',
      name: 'Afternoon Routine',
      color: '#EF4444',
      tasksCount: 4,
      completedTasks: 2,
      category: 'personal' as const,
      area: 'Wellness',
      dueDate: null
    },
    {
      id: '4',
      name: 'Nightly Routine',
      color: '#8B5CF6',
      tasksCount: 6,
      completedTasks: 4,
      category: 'personal' as const,
      area: 'Wellness',
      dueDate: null
    },
    {
      id: '5',
      name: 'MindTrack: Otto',
      color: '#3B82F6',
      tasksCount: 8,
      completedTasks: 3,
      category: 'work' as const,
      area: 'Development',
      dueDate: null
    }
  ]);


 const [tasks, setTasks] = useState<Task[]>([

  /* This is a place holder for the tasks.
    {
      id: '1',
      title: 'Spanish Vocabulary',
      projectId: '1',
      startTime: new Date(new Date().setHours(9, 0, 0, 0)),
      duration: 1,
      color: '#10B981',
      priority: 'medium',
      completed: false
    },
    {
      id: '2',
      title: 'Morning Workout',
      projectId: '2',
      startTime: new Date(new Date().setHours(7, 0, 0, 0)),
      duration: 1,
      color: '#F59E0B',
      priority: 'high',
      completed: false
    }
    */
  ]);

  const [alarms, setAlarms] = useState([
    {
      id: '1',
      time: '06:30',
      enabled: true,
      sound: 'birds',
      label: 'Morning Wake-up',
      recurring: true
    }
  ]);

  // Memoize event handlers to prevent recreation on every render
  const handleTimeSlotClick = useCallback((time: Date) => {
    setSelectedTime(time);
    setIsTaskModalOpen(true);
  }, []);

  const handleCreateTask = useCallback((task: any) => {
    console.log('Creating task:', task); // Debug log
    
    // Ensure the task has all required fields
    const newTask = {
      id: Date.now().toString(),
      title: task.title || 'Untitled Task',
      projectId: task.projectId || '',
      startTime: task.startTime || new Date(),
      duration: task.duration || 30,
      color: task.color || '#3B82F6',
      priority: task.priority || 'medium',
      completed: false,
      listId: task.listId,
      dueDate: task.dueDate || null,
      area: task.area || '',
      category: task.category || '',
      effortLevel: task.effortLevel || 'medium',
      isRecurring: task.isRecurring || false,
      recurringPattern: task.recurringPattern,
      description: task.description || ''
    };

    console.log('New task object:', newTask); // Debug log

    setTasks(prevTasks => {
      const updatedTasks = [...prevTasks, newTask];
      console.log('Updated tasks array:', updatedTasks); // Debug log
      return updatedTasks;
    });
    
    // Update project task counts only if the task has a projectId
    if (task.projectId) {
      setProjects(prevProjects => prevProjects.map(project => 
        project.id === task.projectId 
          ? { ...project, tasksCount: project.tasksCount + 1 }
          : project
      ));
    }
  }, []);

  const handleTaskUpdate = useCallback((updatedTasks: any[]) => {
    setTasks(updatedTasks);
    updateProjectCounts(updatedTasks);
  }, []);

  // Update project counts based on actual tasks - memoized to prevent recreation
  const updateProjectCounts = useCallback((currentTasks: any[]) => {
    setProjects(prevProjects => prevProjects.map(project => {
      const projectTasks = currentTasks.filter(task => task.projectId === project.id);
      const completedTasks = projectTasks.filter(task => task.completed);
      return {
        ...project,
        tasksCount: projectTasks.length,
        completedTasks: completedTasks.length
      };
    }));
  }, []);

  // Update project counts when tasks change
  useEffect(() => {
    updateProjectCounts(tasks);
  }, [tasks, updateProjectCounts]);

  const handleCreateProject = useCallback((projectData: any) => {
    const newProject = {
      id: Date.now().toString(),
      ...projectData,
      tasksCount: 0,
      completedTasks: 0,
      parentId: categorySelectionContext?.type === 'project' ? categorySelectionContext.id : undefined
    };
    setProjects(prevProjects => [...prevProjects, newProject]);
  }, [categorySelectionContext]);

  // Fix: Create handler to open category selection modal
  const handleOpenCategorySelection = useCallback((context?: { type: 'area' | 'project'; name: string; id?: string }) => {
    setIsCategorySelectionModalOpen(true);
    // Store context for the modal
    if (context) {
      // We'll need to store this context in state
      setCategorySelectionContext(context);
    }
  }, []);

  const handleCategorySelectionClose = useCallback(() => {
    setIsCategorySelectionModalOpen(false);
    setCategorySelectionContext(null);
  }, []);

  const handleSelectProject = useCallback(() => {
    setIsCategorySelectionModalOpen(false);
    setIsProjectModalOpen(true);
    // The ProjectModal will use the context to set the locked area and parent project
  }, []);

  const handleSelectList = useCallback(() => {
    // Create a new list for the current context
    const context = categorySelectionContext;
    if (context?.type === 'project' && context.id) {
      const listTitle = window.prompt('Enter list title:', 'New List')?.trim();
      if (listTitle) {
        setLists(prev => [...prev, { 
          id: Date.now().toString(), 
          title: listTitle, 
          projectId: context.id 
        }]);
      }
    } else if (context?.type === 'area') {
      // For area context, create a list directly in the area (no project needed)
      const listTitle = window.prompt('Enter list title:', 'New List')?.trim();
      if (listTitle) {
        // Create a temporary project ID for the area to associate lists with
        const areaProjectId = `area-${context.name.toLowerCase()}`;
        setLists(prev => [...prev, { 
          id: Date.now().toString(), 
          title: listTitle, 
          projectId: areaProjectId 
        }]);
      }
    }
    setIsCategorySelectionModalOpen(false);
    setCategorySelectionContext(null);
  }, [categorySelectionContext]);

  const handleSelectAction = useCallback(() => {
    setIsCategorySelectionModalOpen(false);
    setIsActionModalOpen(true);
    // The ActionModal will use the context to set the locked area
  }, []);

  const handleCreateAction = useCallback((actionData: Action) => {
    setActions(prevActions => [...prevActions, actionData]);
  }, []);

  const handleActionModalClose = useCallback(() => {
    setIsActionModalOpen(false);
    setCategorySelectionContext(null);
  }, []);

  const handleProjectSelect = useCallback((projectId: string) => {
    setSelectedProjectId(projectId);
    setIsProjectTasksModalOpen(true);
  }, []);

  const handleQuickAddTask = useCallback((projectId: string) => {
    setQuickAddProjectId(projectId);
    setSelectedTime(new Date());
    setIsTaskModalOpen(true);
  }, []);

  const handleAreaSelect = useCallback((areaName: string) => {
    setSelectedArea(areaName);
    setViewMode('area-detail');
  }, []);

  const handleBackToAreas = useCallback(() => {
    setSelectedArea(null);
    setViewMode('areas');
  }, []);

  const handleCategorySelect = useCallback((projectId: string) => {
    setSelectedCategoryId(projectId);
    setViewMode('category-detail');
  }, []);

  const handleBackToArea = useCallback(() => {
    setSelectedCategoryId(null);
    setViewMode('area-detail');
  }, []);

  const handleProjectDetailSelect = useCallback((projectId: string) => {
    setSelectedProjectDetailId(projectId);
    setViewMode('project-detail');
  }, []);

  const handleBackToProject = useCallback(() => {
    setSelectedProjectDetailId(null);
    setViewMode('category-detail');
  }, []);

  const handleReorderTasks = useCallback((projectId: string, sourceId: string, targetId: string) => {
    setTasks(prev => {
      const list = prev.filter(t => t.projectId === projectId);
      const others = prev.filter(t => t.projectId !== projectId);
      const sourceIdx = list.findIndex(t => t.id === sourceId);
      const targetIdx = list.findIndex(t => t.id === targetId);
      if (sourceIdx === -1 || targetIdx === -1) return prev;
      const [moved] = list.splice(sourceIdx, 1);
      list.splice(targetIdx, 0, moved);
      return [...others, ...list];
    });
  }, []);

  const handleGoToToday = useCallback(() => {
    setSelectedDate(startOfToday());
  }, []);

  const handleTaskDrop = useCallback((taskId: string, newTime: Date) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId 
          ? { ...task, startTime: newTime }
          : task
      )
    );
  }, []);


  const handleOpenSettings = useCallback(() => {
    setIsSettingsOpen(true);
  }, []);

  const handleCloseTaskModal = useCallback(() => {
    setIsTaskModalOpen(false);
    setSelectedTime(null);
    setQuickAddProjectId(undefined);
    setQuickAddTaskData(null);
  }, []);

  const handleCloseProjectModal = useCallback(() => {
    setIsProjectModalOpen(false);
    setCategorySelectionContext(null);
  }, []);

  const handleCloseProjectTasksModal = useCallback(() => {
    setIsProjectTasksModalOpen(false);
    setSelectedProjectId(undefined);
  }, []);

  const handleCloseSettings = useCallback(() => {
    setIsSettingsOpen(false);
  }, []);

  // Memoize search change handler
  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  // Memoize date change handler
  const handleDateChange = useCallback((date: Date) => {
    setSelectedDate(date);
  }, []);

  // Memoize alarm update handler
  const handleAlarmUpdate = useCallback((updatedAlarms: any[]) => {
    setAlarms(updatedAlarms);
  }, []);

  // View mode change handler
  const handleViewModeChange = useCallback((mode: ViewMode) => {
    setViewMode(mode);
    if (mode !== 'area-detail' && mode !== 'category-detail' && mode !== 'project-detail') {
      setSelectedArea(null);
      setSelectedCategoryId(null);
      setSelectedProjectDetailId(null);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-subtle dark:bg-gradient-subtle">
      {/* Enhanced Header */}
      <Header
        selectedDate={selectedDate}
        onDateChange={handleDateChange}
        onGoToToday={handleGoToToday}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onOpenSettings={handleOpenSettings}
        viewMode={viewMode as any}
        onViewModeChange={handleViewModeChange as any}
      />

      {/* Main Content */}
      <div className="max-w-none mx-auto py-6 px-4">
        <div className="flex gap-4 h-[calc(100vh-140px)]">
          {/* Left Sidebar - Today's Overview (only in calendar mode) */}
          {viewMode === 'calendar' && (
            <TodayOverview
              tasks={tasks}
              projects={projects}
            />
          )}

          {/* Main Content Area */}
          {viewMode === 'calendar' ? (
            <div className="flex-1 flex flex-col pl-0">
              {/* Calendar Grid */}
              <CalendarGrid
                selectedDate={selectedDate}
                tasks={tasks}
                onTimeSlotClick={handleTimeSlotClick}
                onTaskDrop={handleTaskDrop}
                onDateChange={handleDateChange}
                currentTime={new Date()}
                alarms={alarms}
                showAlarms={true}
              />
            </div>
          ) : viewMode === 'areas' ? (
            <AreasDashboard
              tasks={tasks}
              projects={projects}
              onAreaSelect={handleAreaSelect}
            />
          ) : viewMode === 'area-detail' ? (
            selectedArea && (
              <AreaDashboard
                areaName={selectedArea}
                tasks={tasks}
                projects={projects}
                actions={actions}
                lists={lists}
                onBack={handleBackToAreas}
                onAddCategory={(areaName) => handleOpenCategorySelection({ type: 'area', name: areaName })}
                onCategorySelect={handleCategorySelect}
                onQuickAddTask={(projectId) => {
                  setQuickAddProjectId(projectId);
                  setSelectedTime(new Date());
                  setIsTaskModalOpen(true);
                }}
                onReorderCategories={(areaName, sourceId, targetId) => {
                  setProjects(prev => {
                    const cur = [...prev];
                    const sourceIdx = cur.findIndex(p => p.id === sourceId);
                    const targetIdx = cur.findIndex(p => p.id === targetId);
                    if (sourceIdx === -1 || targetIdx === -1) return prev;
                    const [moved] = cur.splice(sourceIdx, 1);
                    cur.splice(targetIdx, 0, moved);
                    return cur;
                  });
                }}
                onRenameCategory={(projectId, newName) => {
                  setProjects(prev => prev.map(p => p.id === projectId ? { ...p, name: newName } : p));
                }}
                onDeleteCategory={(projectId) => {
                  setProjects(prev => prev.filter(p => p.id !== projectId));
                  setTasks(prev => prev.filter(t => t.projectId !== projectId));
                }}
                onToggleActionEnabled={(actionId, enabled) => {
                  setActions(prev => prev.map(a => a.id === actionId ? { ...a, enabled } : a));
                }}
                onEditAction={(actionId) => {
                  // For now, just log - could implement edit functionality later
                  console.log('Edit action:', actionId);
                }}
                onDeleteAction={(actionId) => {
                  setActions(prev => prev.filter(a => a.id !== actionId));
                }}
                onRenameList={(listId, newTitle) => setLists(prev => prev.map(l => l.id === listId ? { ...l, title: newTitle } : l))}
                onDeleteList={(listId) => setLists(prev => prev.filter(l => l.id !== listId))}
                onAddTask={(listId, title) => {
                  // Create a new task for the list
                  const newTask = {
                    id: Date.now().toString(),
                    title,
                    projectId: '', // This will be set when the task is moved to a project
                    listId,
                    startTime: new Date(),
                    duration: 30,
                    color: '#3B82F6',
                    priority: 'medium' as 'high' | 'medium' | 'low',
                    completed: false
                  };
                  setTasks(prev => [...prev, newTask]);
                }}
                onToggleTask={(taskId) => setTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t))}
                onEditTask={(taskId, changes) => setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...changes } : t))}
                onDeleteTask={(taskId) => setTasks(prev => prev.filter(t => t.id !== taskId))}
                onCreateTask={handleCreateTask}

              />
            )
          ) : viewMode === 'category-detail' ? (
            selectedCategoryId && (
              <CategoryBoard
                project={projects.find(p => p.id === selectedCategoryId)!}
                tasks={tasks}
                projects={projects}
                lists={lists}
                actions={actions}
                onBack={handleBackToArea}
                onAddList={(projectId, title) => setLists(prev => [...prev, { id: Date.now().toString(), title, projectId }])}
                onRenameList={(listId, newTitle) => setLists(prev => prev.map(l => l.id === listId ? { ...l, title: newTitle } : l))}
                onDeleteList={(listId) => {
                  setLists(prev => prev.filter(l => l.id !== listId));
                  setTasks(prev => prev.map(t => t.listId === listId ? { ...t, listId: undefined } : t));
                }}
                onAddTask={(listId, title) => {
                  // Instead of directly creating a task, open the TaskModal with prefilled title
                  setQuickAddProjectId(selectedCategoryId!);
                  setSelectedTime(new Date());
                  setIsTaskModalOpen(true);
                  // Store the title and listId for when the modal opens
                  setQuickAddTaskData({ title, listId });
                }}
                onToggleTask={(taskId) => setTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t))}
                onEditTask={(taskId, changes) => setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...changes } : t))}
                onDeleteTask={(taskId) => setTasks(prev => prev.filter(t => t.id !== taskId))}
                onReorderWithinList={(listId, sourceId, targetId) => {
                  setTasks(prev => {
                    const list = prev.filter(t => t.listId === listId);
                    const others = prev.filter(t => t.listId !== listId);
                    const sIdx = list.findIndex(t => t.id === sourceId);
                    const tIdx = list.findIndex(t => t.id === targetId);
                    if (sIdx === -1 || tIdx === -1) return prev;
                    const [moved] = list.splice(sIdx, 1);
                    list.splice(tIdx, 0, moved);
                    return [...others, ...list];
                  });
                }}
                onMoveTaskToList={(taskId, toListId, beforeTaskId) => {
                  setTasks(prev => {
                    const updated = prev.map(t => t.id === taskId ? { ...t, listId: toListId } : t);
                    if (!beforeTaskId) return updated;
                    const list = updated.filter(t => t.listId === toListId);
                    const others = updated.filter(t => t.listId !== toListId);
                    const movingIdx = list.findIndex(t => t.id === taskId);
                    const beforeIdx = list.findIndex(t => t.id === beforeTaskId);
                    if (movingIdx === -1 || beforeIdx === -1) return updated;
                    const [moved] = list.splice(movingIdx, 1);
                    list.splice(beforeIdx, 0, moved);
                    return [...others, ...list];
                  });
                }}
                onOpenCategorySelection={() => {
                  const project = projects.find(p => p.id === selectedCategoryId);
                  if (project) {
                    handleOpenCategorySelection({ type: 'project', name: project.name, id: project.id });
                  }
                }}
                onToggleActionEnabled={(actionId, enabled) => {
                  setActions(prev => prev.map(a => a.id === actionId ? { ...a, enabled } : a));
                }}
                onEditAction={(actionId) => {
                  // For now, just log - could implement edit functionality later
                  console.log('Edit action:', actionId);
                }}
                onDeleteAction={(actionId) => {
                  setActions(prev => prev.filter(a => a.id !== actionId));
                }}
                onProjectSelect={handleProjectDetailSelect}
              />
            )
          ) : viewMode === 'project-detail' ? (
            selectedProjectDetailId && (
              <ProjectDetail
                project={projects.find(p => p.id === selectedProjectDetailId)!}
                tasks={tasks}
                projects={projects}
                lists={lists}
                actions={actions}
                onBack={handleBackToProject}
                onAddCategory={() => {
                  const project = projects.find(p => p.id === selectedProjectDetailId);
                  if (project) {
                    handleOpenCategorySelection({ type: 'project', name: project.name, id: project.id });
                  }
                }}
                onProjectSelect={handleProjectDetailSelect}
                onListSelect={(listId) => {
                  // For now, just log - could implement list detail view later
                  console.log('List selected:', listId);
                }}
                onActionToggle={(actionId, enabled) => {
                  setActions(prev => prev.map(a => a.id === actionId ? { ...a, enabled } : a));
                }}
                onActionEdit={(actionId) => {
                  console.log('Edit action:', actionId);
                }}
                onActionDelete={(actionId) => {
                  setActions(prev => prev.filter(a => a.id !== actionId));
                }}
                onProjectRename={(projectId, newName) => {
                  setProjects(prev => prev.map(p => p.id === projectId ? { ...p, name: newName } : p));
                }}
                onProjectDelete={(projectId) => {
                  setProjects(prev => prev.filter(p => p.id !== projectId));
                  setTasks(prev => prev.filter(t => t.projectId !== projectId));
                }}
                onListRename={(listId, newTitle) => setLists(prev => prev.map(l => l.id === listId ? { ...l, title: newTitle } : l))}
                onListDelete={(listId) => {
                  setLists(prev => prev.filter(l => l.id !== listId));
                  setTasks(prev => prev.map(t => t.listId === listId ? { ...t, listId: undefined } : t));
                }}
              />
            )
          ) : null}

          {/* Alarm Panel (Always visible in calendar mode) */}
          {viewMode === 'calendar' && (
            <div className="w-80">
              <AlarmPanel
                alarms={alarms}
                onAlarmUpdate={handleAlarmUpdate}
              />
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {isTaskModalOpen && (
        <TaskModal
          isOpen={isTaskModalOpen}
          onClose={handleCloseTaskModal}
          onCreateTask={handleCreateTask}
          selectedTime={selectedTime}
          projects={projects}
          preselectedProjectId={quickAddProjectId}
          areaFilter={viewMode === 'area-detail' ? selectedArea ?? undefined : undefined}
          prefilledTitle={quickAddTaskData?.title}
          listId={quickAddTaskData?.listId}
        />
      )}

      {isCategorySelectionModalOpen && (
        <CategorySelectionModal
          isOpen={isCategorySelectionModalOpen}
          onClose={handleCategorySelectionClose}
          onSelectProject={handleSelectProject}
          onSelectList={handleSelectList}
          onSelectAction={handleSelectAction}
          context={categorySelectionContext}
        />
      )}

      {isProjectModalOpen && (
        <ProjectModal
          isOpen={isProjectModalOpen}
          onClose={handleCloseProjectModal}
          onCreateProject={handleCreateProject}
          lockedArea={categorySelectionContext?.type === 'area' ? categorySelectionContext.name : selectedArea || undefined}
        />
      )}

             {isActionModalOpen && (
         <ActionModal
           isOpen={isActionModalOpen}
           onClose={handleActionModalClose}
           onCreateAction={handleCreateAction}
           lockedArea={categorySelectionContext?.type === 'area' ? categorySelectionContext.name : 
                      categorySelectionContext?.type === 'project' ? projects.find(p => p.id === categorySelectionContext.id)?.area :
                      selectedCategoryId ? projects.find(p => p.id === selectedCategoryId)?.area : 
                      selectedArea || undefined}
           lockedProjectId={categorySelectionContext?.type === 'project' ? categorySelectionContext.id : 
                           selectedCategoryId || undefined}
         />
       )}

      {isProjectTasksModalOpen && selectedProjectId && (
        <ProjectTasksModal
          isOpen={isProjectTasksModalOpen}
          onClose={handleCloseProjectTasksModal}
          project={projects.find(p => p.id === selectedProjectId)!}
          tasks={tasks.filter(t => t.projectId === selectedProjectId)}
          onTaskUpdate={handleTaskUpdate}
        />
      )}

      {isSettingsOpen && (
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={handleCloseSettings}
          darkMode={darkMode}
          onDarkModeToggle={setDarkMode}
          timezone={timezone}
          onTimezoneChange={setTimezone}
        />
      )}
    </div>
  );
};

export default Index;

