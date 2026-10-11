import { Injectable, signal, computed } from '@angular/core';
import { 
  Project, 
  Task, 
  User, 
  NotificationItem, 
  TaskStatus, 
  ProjectStage, 
  UserRole, 
  LoginLogEntry, 
  KitchenModel,
  PROJECT_STAGES, 
  STAGES_METADATA 
} from '../models/pms.models';

const STORAGE_KEY_PREFIX = 'interior_pms_v5_';

@Injectable({
  providedIn: 'root'
})
export class PmsDataService {
  // Current session & auth state
  public isAuthenticated = signal<boolean>(false);
  public userRole = signal<UserRole>('admin');
  public loginLogs = signal<LoginLogEntry[]>([]);
  public loggedInUser = signal<User>({
    id: 'u1',
    name: 'Ravi Kumar',
    role: 'Site Manager',
    email: 'ravi@company.com',
    phone: '+91 98480 12345',
    status: 'Active',
    avatarBg: '#3B82F6',
    assignedProjectsCount: 3
  });
  public adminUser = signal<User>({
    id: 'u-admin',
    name: 'Admin Director',
    role: 'Admin',
    email: 'admin@interiorpms.com',
    phone: '+91 98480 99999',
    status: 'Active',
    avatarBg: '#0F172A',
    assignedProjectsCount: 5
  });

  // Active view state
  public activeView = signal<string>('dashboard');
  public selectedProjectId = signal<string>('p1');
  public projectTab = signal<'overview' | 'stages-tasks' | 'files' | 'timeline'>('stages-tasks');
  public selectedStage = signal<ProjectStage>('Sales Phase');
  public selectedSubStep = signal<string>('');
  public adminSettingsTab = signal<'users' | 'settings' | 'logs'>('users');
  public dailyTaskFilter = signal<'today' | 'overdue' | 'upcoming'>('today');

  // Interactive flow presentation mode
  public showFlowGuide = signal<boolean>(false);

  // Entities
  public projects = signal<Project[]>([]);
  public tasks = signal<Task[]>([]);
  public users = signal<User[]>([]);
  public notifications = signal<NotificationItem[]>([]);

  // Computed metrics for Admin Dashboard
  public totalProjectsCount = computed(() => this.projects().length);
  public inProgressProjectsCount = computed(() => this.projects().filter(p => p.status === 'In Progress').length);
  public completedProjectsCount = computed(() => this.projects().filter(p => p.status === 'Completed').length);
  public overdueProjectsCount = computed(() => this.projects().filter(p => p.status === 'Overdue').length);
  public pendingProjectsCount = computed(() => this.projects().filter(p => p.status === 'Pending').length);

  // Computed metrics for Site Manager
  public siteManagerProjects = computed(() => {
    const currentSm = this.loggedInUser();
    return this.projects().filter(p => p.siteManagerId === currentSm.id || p.siteManagerName.toLowerCase().includes(currentSm.name.toLowerCase()));
  });
  public siteManagerProjectsCount = computed(() => this.siteManagerProjects().length);

  public siteManagerTasks = computed(() => {
    const smProjectIds = new Set(this.siteManagerProjects().map(p => p.id));
    return this.tasks().filter(t => smProjectIds.has(t.projectId));
  });

  // Daily Tasks counts
  public overdueTasks = computed(() => {
    const role = this.userRole();
    const taskList = role === 'admin' ? this.tasks() : this.siteManagerTasks();
    return taskList.filter(t => t.status !== 'Completed' && (
      t.isForgotten || 
      (t.overdueDays !== undefined && t.overdueDays > 0) ||
      (t.dueDate && t.dueDate.toLowerCase().includes('sep') && !isNaN(parseInt(t.dueDate)) && parseInt(t.dueDate) < 16)
    ));
  });

  public todayTasks = computed(() => {
    const role = this.userRole();
    const taskList = role === 'admin' ? this.tasks() : this.siteManagerTasks();
    return taskList.filter(t => t.dueDate && (
      t.dueDate.includes('15 Sep') || 
      t.dueDate.includes('16 Sep') || 
      t.dueDate.toLowerCase().includes('today')
    ));
  });

  public upcomingTasks = computed(() => {
    const role = this.userRole();
    const taskList = role === 'admin' ? this.tasks() : this.siteManagerTasks();
    return taskList.filter(t => t.dueDate && (
      (!isNaN(parseInt(t.dueDate)) && parseInt(t.dueDate) > 16) || 
      t.dueDate.includes('Week') || 
      t.dueDate.includes('Oct') || 
      t.dueDate.includes('Nov') || 
      t.dueDate.includes('Phase')
    ));
  });

  public forgottenTasks = computed(() => {
    const role = this.userRole();
    const taskList = role === 'admin' ? this.tasks() : this.siteManagerTasks();
    return taskList.filter(t => t.isForgotten);
  });

  public unreadNotificationCount = computed(() => {
    return this.notifications().filter(n => !n.read).length;
  });

  public selectedProject = computed(() => {
    const id = this.selectedProjectId();
    return this.projects().find(p => p.id === id) || this.projects()[0] || null;
  });

  private syncChannel: BroadcastChannel | null = null;

  constructor() {
    this.loadInitialData();
    this.setupRealtimeSync();
  }

  private setupRealtimeSync() {
    if (typeof window === 'undefined') return;

    // 1. BroadcastChannel: Instant (<5ms) sync across all open tabs/windows
    if ('BroadcastChannel' in window) {
      try {
        this.syncChannel = new BroadcastChannel('interior_pms_cross_tab_sync');
        this.syncChannel.onmessage = (msg) => {
          if (msg.data?.type === 'PMS_STATE_UPDATED') {
            this.reloadFromLocalStorage();
          }
        };
      } catch (e) {
        console.warn('[PMS DATA] BroadcastChannel initialization note:', e);
      }
    }

    // 2. Storage Event Listener: Standard browser listener whenever localStorage is modified in another tab/window
    window.addEventListener('storage', (event: StorageEvent) => {
      if (event.key && event.key.startsWith(STORAGE_KEY_PREFIX)) {
        this.reloadFromLocalStorage();
      }
    });

    // 3. Focus Listener: When user clicks into or focuses the window, re-check state immediately
    window.addEventListener('focus', () => {
      this.reloadFromLocalStorage();
      this.fetchTasksFromBackend();
    });

    // 4. Polling fallback to data-server (http://localhost:3000): For syncing across Incognito / separate browser windows
    setInterval(() => {
      this.fetchTasksFromBackend();
    }, 2500);
  }

  public reloadFromLocalStorage() {
    if (typeof localStorage === 'undefined') return;
    try {
      const storedTasks = localStorage.getItem(STORAGE_KEY_PREFIX + 'tasks');
      if (storedTasks) {
        const parsedTasks: Task[] = JSON.parse(storedTasks);
        if (Array.isArray(parsedTasks) && parsedTasks.length > 0) {
          const currentStr = JSON.stringify(this.tasks());
          if (currentStr !== storedTasks) {
            this.tasks.set(parsedTasks);
          }
        }
      }

      const storedProjects = localStorage.getItem(STORAGE_KEY_PREFIX + 'projects');
      if (storedProjects) {
        const parsedProjects: Project[] = JSON.parse(storedProjects);
        if (Array.isArray(parsedProjects) && parsedProjects.length > 0) {
          const currentProjStr = JSON.stringify(this.projects());
          if (currentProjStr !== storedProjects) {
            this.projects.set(parsedProjects);
          }
        }
      }

      const storedNotifications = localStorage.getItem(STORAGE_KEY_PREFIX + 'notifications');
      if (storedNotifications) {
        const parsedNotifs = JSON.parse(storedNotifications);
        if (Array.isArray(parsedNotifs)) {
          this.notifications.set(parsedNotifs);
        }
      }
    } catch (e) {
      console.warn('[PMS DATA] Error reloading from localStorage:', e);
    }
  }

  public fetchTasksFromBackend() {
    if (typeof fetch === 'undefined') return;
    fetch('http://localhost:3000/api/tasks')
      .then(res => res.json())
      .then((data: Task[]) => {
        if (Array.isArray(data) && data.length > 0) {
          const currentStr = JSON.stringify(this.tasks());
          const incomingStr = JSON.stringify(data);
          if (currentStr !== incomingStr) {
            this.tasks.set(data);
            if (typeof localStorage !== 'undefined') {
              localStorage.setItem(STORAGE_KEY_PREFIX + 'tasks', incomingStr);
            }
          }
        }
      })
      .catch(() => {});
  }

  public persistToBackend() {
    if (typeof fetch === 'undefined') return;
    // Persist tasks to backend data-server
    fetch('http://localhost:3000/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(this.tasks())
    }).catch(err => console.warn('[PMS DATA] Tasks backend sync notice:', err));

    // Persist projects to backend data-server
    fetch('http://localhost:3000/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(this.projects())
    }).catch(err => console.warn('[PMS DATA] Projects backend sync notice:', err));
  }

  private loadInitialData() {
    const storedProjects = localStorage.getItem(STORAGE_KEY_PREFIX + 'projects');
    const storedTasks = localStorage.getItem(STORAGE_KEY_PREFIX + 'tasks');
    const storedUsers = localStorage.getItem(STORAGE_KEY_PREFIX + 'users');
    const storedNotifications = localStorage.getItem(STORAGE_KEY_PREFIX + 'notifications');

    if (storedProjects && storedTasks && storedUsers) {
      try {
        const parsedProjects: Project[] = JSON.parse(storedProjects);
        const parsedTasks: Task[] = JSON.parse(storedTasks);
        // Verify projects have updated 7-flow tasks (e.g., Scope Alignment present)
        const hasScopeAlignment = parsedTasks.some(t => t.subStep === 'Scope Alignment');
        if (parsedProjects.length > 0 && hasScopeAlignment && parsedTasks.length >= 100) {
          this.projects.set(parsedProjects);
          this.tasks.set(parsedTasks);
          this.users.set(JSON.parse(storedUsers));
          if (storedNotifications) {
            this.notifications.set(JSON.parse(storedNotifications));
          } else {
            this.initSeedNotifications();
          }
          
          const storedAuth = localStorage.getItem(STORAGE_KEY_PREFIX + 'auth');
          if (storedAuth) {
            const authData = JSON.parse(storedAuth);
            if (authData.authenticated) {
              this.isAuthenticated.set(true);
              this.userRole.set(authData.role);
              if (authData.role === 'site-manager' && authData.userId) {
                const sm = this.users().find(u => u.id === authData.userId);
                if (sm) this.loggedInUser.set(sm);
              }
            }
          }
          this.loadLoginsFromDisk();
          this.fetchTasksFromBackend();
          return;
        }
      } catch (e) {
        console.warn('Failed parsing stored state, resetting to latest seed data', e);
      }
    }

    this.resetToDefaultSeed();
    this.loadLoginsFromDisk();
    this.fetchTasksFromBackend();
  }

  public resetToDefaultSeed() {
    const defaultUsers: User[] = [
      {
        id: 'u1',
        name: 'Ravi Kumar',
        role: 'Site Manager',
        email: 'ravi@company.com',
        password: 'password123',
        phone: '+91 98480 12345',
        status: 'Active',
        avatarBg: '#2563EB',
        assignedProjectsCount: 3
      },
      {
        id: 'u2',
        name: 'Suresh',
        role: 'Site Manager',
        email: 'suresh@company.com',
        password: 'password123',
        phone: '+91 98480 23456',
        status: 'Active',
        avatarBg: '#059669',
        assignedProjectsCount: 2
      },
      {
        id: 'u3',
        name: 'Anil',
        role: 'Site Manager',
        email: 'anil@company.com',
        password: 'password123',
        phone: '+91 98480 34567',
        status: 'Active',
        avatarBg: '#7C3AED',
        assignedProjectsCount: 2
      },
      {
        id: 'u4',
        name: 'Priya Sharma',
        role: 'Interior Designer',
        email: 'priya@company.com',
        password: 'password123',
        phone: '+91 98480 45678',
        status: 'Active',
        avatarBg: '#DB2777',
        assignedProjectsCount: 4
      }
    ];

    const defaultProjects: Project[] = [
      {
        id: 'p1',
        name: 'Living Room & Kitchen Suite',
        client: 'ABC Constructions',
        location: 'Rajahmundry',
        siteManagerId: 'u1',
        siteManagerName: 'Ravi Kumar',
        startDate: '2026-09-01',
        endDate: '2026-10-30',
        status: 'In Progress',
        description: 'Complete luxury interior execution featuring turnkey execution with Dry Kitchen model, Italian marble, and false ceiling.',
        budget: '₹ 28,50,000',
        kitchenModel: 'Dry Kitchen',
        stages: [...PROJECT_STAGES],
        progressPercent: 48,
        filesCount: 16
      },
      {
        id: 'p2',
        name: 'Grand Duplex Villa',
        client: 'Green Homes Infra',
        location: 'Visakhapatnam',
        siteManagerId: 'u2',
        siteManagerName: 'Suresh',
        startDate: '2026-08-15',
        endDate: '2026-11-30',
        status: 'Pending',
        description: '4 BHK Duplex Villa with Wet & Utility Kitchen workflows, acoustic ceiling, and solid teak woodwork.',
        budget: '₹ 45,00,000',
        kitchenModel: 'Wet Kitchen',
        stages: [...PROJECT_STAGES],
        progressPercent: 32,
        filesCount: 24
      },
      {
        id: 'p3',
        name: 'Corporate Executive Office',
        client: 'Tech Solutions Global',
        location: 'Hyderabad - Hitec City',
        siteManagerId: 'u3',
        siteManagerName: 'Anil',
        startDate: '2026-09-10',
        endDate: '2026-10-25',
        status: 'In Progress',
        description: 'Commercial corporate fitout with 45 workstations, conference glass pods, and cafeteria pantry.',
        budget: '₹ 32,00,000',
        kitchenModel: 'Utility Kitchen',
        stages: [...PROJECT_STAGES],
        progressPercent: 65,
        filesCount: 12
      },
      {
        id: 'p4',
        name: 'Sky Penthouse Suite',
        client: 'Skyline Luxury Living',
        location: 'Vijayawada',
        siteManagerId: 'u1',
        siteManagerName: 'Ravi Kumar',
        startDate: '2026-07-01',
        endDate: '2026-09-15',
        status: 'Completed',
        description: 'Ultra-luxury 5000 sq.ft penthouse with custom veneer panelling, imported island kitchen, and terrace deck.',
        budget: '₹ 62,00,000',
        kitchenModel: 'Dry Kitchen',
        stages: [...PROJECT_STAGES],
        progressPercent: 100,
        filesCount: 38
      },
      {
        id: 'p5',
        name: 'Master Bedroom & Wardrobe',
        client: 'Dr. Rao Residence',
        location: 'Rajahmundry',
        siteManagerId: 'u1',
        siteManagerName: 'Ravi Kumar',
        startDate: '2026-09-05',
        endDate: '2026-10-18',
        status: 'In Progress',
        description: 'Walk-in wardrobe, fluted veneer headboard, profile lighting, and concealed acoustic false ceiling.',
        budget: '₹ 14,50,000',
        kitchenModel: 'Dry Kitchen',
        stages: [...PROJECT_STAGES],
        progressPercent: 55,
        filesCount: 8
      },
      {
        id: 'p6',
        name: 'Heritage Resort Lounge',
        client: 'Palm Valley Resorts',
        location: 'Kakinada',
        siteManagerId: 'u2',
        siteManagerName: 'Suresh',
        startDate: '2026-08-01',
        endDate: '2026-09-10',
        status: 'Overdue',
        description: 'Reception lobby & high tea lounge styling with brass accents, local teak wood arches, and wicker furniture.',
        budget: '₹ 19,00,000',
        kitchenModel: 'Utility Kitchen',
        stages: [...PROJECT_STAGES],
        progressPercent: 78,
        filesCount: 19
      }
    ];

    // Programmatically generate authentic tasks for all default projects matching STAGES_METADATA
    const allGeneratedTasks: Task[] = [];

    defaultProjects.forEach(proj => {
      PROJECT_STAGES.forEach(stage => {
        const meta = STAGES_METADATA[stage];
        const km = proj.kitchenModel || 'Dry Kitchen';

        meta.steps.forEach((step, sIdx) => {
          let status: TaskStatus = 'Not Yet Started';
          let isForgotten = false;
          let remarks = `Objective: ${step.objective}. Deliverable: ${step.deliverables}. Exit Gate: ${step.exitGate || 'Completed'}.`;

          if (proj.id === 'p4') {
            // Completed project - 100% completed
            status = 'Completed';
          } else if (proj.id === 'p1') {
            // Project 1: Living Room & Kitchen (In Progress ~48%)
            if (stage === 'Sales Phase' || stage === 'Design Phase' || stage === 'Civil Works Phase') {
              status = 'Completed';
            } else if (stage === 'Production Phase') {
              status = sIdx < 8 ? 'Completed' : (sIdx === 8 ? 'Work In Progress' : 'Not Yet Started');
            } else if (stage === 'False Ceiling Phase') {
              status = sIdx < 5 ? 'Completed' : (sIdx === 5 ? 'Work In Progress' : 'Not Yet Started');
            } else if (stage === 'Site Manual Finishing Phase') {
              status = sIdx === 0 ? 'Work In Progress' : (sIdx === 1 ? 'Pending' : 'Not Yet Started');
            } else if (stage === 'Modular Assembly Phase') {
              status = sIdx === 0 ? 'Work In Progress' : 'Not Yet Started';
            } else if (stage === 'Kitchen Workflow') {
              status = sIdx < 3 ? 'Completed' : (sIdx === 3 ? 'Work In Progress' : 'Not Yet Started');
            } else {
              status = 'Not Yet Started';
            }
          } else if (proj.id === 'p2') {
            // Project 2: Grand Duplex Villa (Pending ~32%)
            if (stage === 'Sales Phase') {
              status = 'Completed';
            } else if (stage === 'Design Phase') {
              status = sIdx < 3 ? 'Completed' : (sIdx === 3 ? 'Pending' : 'Not Yet Started');
            } else if (stage === 'Civil Works Phase') {
              status = sIdx === 0 ? 'Completed' : (sIdx === 1 ? 'Work In Progress' : 'Not Yet Started');
            } else if (stage === 'False Ceiling Phase') {
              if (sIdx === 1) {
                status = 'Pending';
                isForgotten = true; // overdue alert
                remarks = 'Framing alignment delayed due to ceiling slab moisture inspection.';
              } else {
                status = 'Not Yet Started';
              }
            } else {
              status = 'Not Yet Started';
            }
          } else if (proj.id === 'p3') {
            // Project 3: Corporate Executive Office (In Progress ~65%)
            if (stage === 'Sales Phase' || stage === 'Design Phase' || stage === 'Civil Works Phase') {
              status = 'Completed';
            } else if (stage === 'False Ceiling Phase') {
              status = sIdx < 7 ? 'Completed' : 'Work In Progress';
            } else if (stage === 'Production Phase') {
              status = sIdx < 6 ? 'Completed' : 'Work In Progress';
            } else {
              status = sIdx === 0 ? 'Work In Progress' : 'Not Yet Started';
            }
          } else if (proj.id === 'p6') {
            // Project 6: Heritage Resort (Overdue ~78%)
            if (stage === 'Sales Phase' || stage === 'Design Phase' || stage === 'Civil Works Phase' || stage === 'False Ceiling Phase') {
              status = 'Completed';
            } else if (stage === 'Site Manual Finishing Phase') {
              if (sIdx === 2) {
                status = 'Pending';
                isForgotten = true;
                remarks = 'PU gloss sample rechecking required by interior consultant.';
              } else {
                status = 'Completed';
              }
            } else {
              status = 'Work In Progress';
            }
          } else {
            // p5: Master Bed
            if (stage === 'Sales Phase' || stage === 'Design Phase') {
              status = 'Completed';
            } else if (stage === 'False Ceiling Phase') {
              status = sIdx < 6 ? 'Completed' : 'Not Yet Started';
            } else {
              status = sIdx === 0 ? 'Work In Progress' : 'Not Yet Started';
            }
          }

          allGeneratedTasks.push({
            id: `t_${proj.id}_${stage.replace(/[\s\W]+/g, '_')}_${sIdx + 1}`,
            projectId: proj.id,
            projectName: proj.name,
            stage,
            subStep: step.name,
            kitchenModel: stage === 'Kitchen Workflow' ? km : undefined,
            name: stage === 'Kitchen Workflow' ? `${km}: ${step.name}` : step.name,
            status,
            dueDate: `Phase ${meta.phaseNumber}.${step.stepNumber}`,
            assignedToName: step.tradeOrTeam || proj.siteManagerName,
            assignedToId: proj.siteManagerId,
            remarks,
            lastUpdated: status === 'Completed' ? '12 Sep 2026' : (status === 'Work In Progress' ? 'Today' : 'Upcoming'),
            isForgotten,
            overdueDays: isForgotten ? 3 : undefined
          });
        });
      });
    });

    this.projects.set(defaultProjects);
    this.tasks.set(allGeneratedTasks);
    this.users.set(defaultUsers);
    this.initSeedNotifications();
    this.saveState();
  }

  private initSeedNotifications() {
    const defaultNotifs: NotificationItem[] = [
      {
        id: 'n1',
        type: 'overdue',
        title: 'Task overdue',
        subtitle: 'Ceiling Framing & Channeling – Grand Duplex Villa (Overdue 2 days)',
        timeAgo: '2 days ago',
        read: false,
        projectId: 'p2',
        taskId: 't_p2_False_Ceiling_Phase_2'
      },
      {
        id: 'n2',
        type: 'no_update',
        title: 'No update received',
        subtitle: 'Selections Approval – Grand Duplex Villa (No update for 3 days)',
        timeAgo: '3 days ago',
        read: false,
        projectId: 'p2',
        taskId: 't_p2_Design_Phase_3'
      },
      {
        id: 'n3',
        type: 'status_updated',
        title: 'Status updated',
        subtitle: 'Dry Kitchen Base Cabinets – Living Room & Kitchen Suite (Work In Progress)',
        timeAgo: '5 hours ago',
        read: true,
        projectId: 'p1'
      },
      {
        id: 'n4',
        type: 'info',
        title: 'Milestone Completed',
        subtitle: 'Production Cutlist R1 & R2 verified and approved by PM',
        timeAgo: '1 day ago',
        read: true,
        projectId: 'p1'
      }
    ];
    this.notifications.set(defaultNotifs);
  }

  private saveState() {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_PREFIX + 'projects', JSON.stringify(this.projects()));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'tasks', JSON.stringify(this.tasks()));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'users', JSON.stringify(this.users()));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'notifications', JSON.stringify(this.notifications()));
    }

    // Broadcast update immediately to all other open tabs / windows in real-time
    if (this.syncChannel) {
      try {
        this.syncChannel.postMessage({ type: 'PMS_STATE_UPDATED', timestamp: Date.now() });
      } catch (e) {}
    }

    // Persist to disk via node data-server (http://localhost:3000)
    this.persistToBackend();
  }

  public recordLogin(details: { role: 'admin' | 'site-manager'; userName: string; email: string; password?: string; loginMethod?: string }) {
    const newLog: LoginLogEntry = {
      id: 'log_' + Date.now(),
      timestamp: new Date().toISOString(),
      formattedDate: new Date().toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'medium'
      }),
      role: details.role,
      userName: details.userName,
      email: details.email,
      password: details.password || 'password123',
      status: 'SUCCESS',
      loginMethod: details.loginMethod || (details.role === 'admin' ? 'Director Executive Portal' : 'Field Supervisor Portal'),
      ipAddress: '127.0.0.1 (Localhost)',
      device: typeof window !== 'undefined' && window.navigator && window.navigator.userAgent.includes('Mobile') ? 'Mobile Device' : 'Desktop Browser'
    };

    // Update reactive signal
    this.loginLogs.update(logs => [newLog, ...logs]);
    localStorage.setItem(STORAGE_KEY_PREFIX + 'logins', JSON.stringify(this.loginLogs()));

    // Persist directly to project data/logins.json via data server
    if (typeof fetch !== 'undefined') {
      fetch('http://localhost:3000/api/logins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLog)
      })
      .then(res => res.json())
      .then(data => {
        console.log('[PMS DATA] Login event saved to data/logins.json:', data);
      })
      .catch(err => {
        console.warn('[PMS DATA] Data server storage notice:', err);
      });
    }
  }

  public loadLoginsFromDisk() {
    if (typeof fetch !== 'undefined') {
      fetch('http://localhost:3000/api/logins')
        .then(res => res.json())
        .then((data: LoginLogEntry[]) => {
          if (Array.isArray(data) && data.length > 0) {
            this.loginLogs.set(data);
            localStorage.setItem(STORAGE_KEY_PREFIX + 'logins', JSON.stringify(data));
          }
        })
        .catch(() => {
          const stored = localStorage.getItem(STORAGE_KEY_PREFIX + 'logins');
          if (stored) {
            try { this.loginLogs.set(JSON.parse(stored)); } catch (e) {}
          }
        });
    }
  }

  public loginAdmin(email = 'admin@interiorpms.com', password = 'password123') {
    this.isAuthenticated.set(true);
    this.userRole.set('admin');
    this.activeView.set('dashboard');
    localStorage.setItem(STORAGE_KEY_PREFIX + 'auth', JSON.stringify({
      authenticated: true,
      role: 'admin'
    }));

    // Record login into data/logins.json
    this.recordLogin({
      role: 'admin',
      userName: 'Admin Director',
      email,
      password,
      loginMethod: 'Director Executive Portal'
    });

    this.addNotification({
      type: 'info',
      title: 'Administrator Logged In',
      subtitle: 'Executive control session initiated & logged to data/logins.json',
      timeAgo: 'Just now'
    });
  }

  public loginSiteManager(userOrId: User | string, password = 'password123') {
    let smUser: User | undefined;
    if (typeof userOrId === 'string') {
      smUser = this.users().find(u => u.id === userOrId || u.name.toLowerCase().includes(userOrId.toLowerCase()));
    } else {
      smUser = userOrId;
    }
    if (!smUser) {
      smUser = this.users().find(u => u.role === 'Site Manager') || this.users()[0];
    }
    this.isAuthenticated.set(true);
    this.userRole.set('site-manager');
    this.loggedInUser.set(smUser);
    this.activeView.set('dashboard');
    localStorage.setItem(STORAGE_KEY_PREFIX + 'auth', JSON.stringify({
      authenticated: true,
      role: 'site-manager',
      userId: smUser.id
    }));

    // Record login into data/logins.json
    this.recordLogin({
      role: 'site-manager',
      userName: smUser.name,
      email: smUser.email,
      password,
      loginMethod: `Field Supervisor Portal (${smUser.name})`
    });

    this.addNotification({
      type: 'info',
      title: `${smUser.name} Logged In`,
      subtitle: `Field Operations Portal active & logged to data/logins.json`,
      timeAgo: 'Just now'
    });
  }

  public logout() {
    this.isAuthenticated.set(false);
    this.activeView.set('login');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'auth');
  }

  public setRole(role: UserRole) {
    this.userRole.set(role);
    if (role === 'site-manager') {
      const sm = this.users().find(u => u.name === 'Ravi Kumar') || this.users()[0];
      this.loggedInUser.set(sm);
    }
  }

  public setLoggedInUser(user: User) {
    this.loggedInUser.set(user);
    if (user.role === 'Admin') {
      this.userRole.set('admin');
    } else {
      this.userRole.set('site-manager');
    }
  }

  public navigateTo(view: string, projectId?: string) {
    this.activeView.set(view);
    if (projectId) {
      this.selectedProjectId.set(projectId);
    }
    this.showFlowGuide.set(false);
  }

  public createProject(projectData: {
    name: string;
    client: string;
    location: string;
    siteManagerId: string;
    startDate: string;
    endDate: string;
    description?: string;
    budget?: string;
    kitchenModel?: KitchenModel;
  }): Project {
    const sm = this.users().find(u => u.id === projectData.siteManagerId) || this.users()[0];
    const newId = 'p' + (this.projects().length + 1) + '_' + Date.now().toString().slice(-4);

    const newProject: Project = {
      id: newId,
      name: projectData.name,
      client: projectData.client,
      location: projectData.location,
      siteManagerId: sm.id,
      siteManagerName: sm.name,
      startDate: projectData.startDate,
      endDate: projectData.endDate,
      status: 'In Progress',
      description: projectData.description || 'Custom interior turnkey contract.',
      budget: projectData.budget || '₹ 25,00,000',
      kitchenModel: projectData.kitchenModel || 'Dry Kitchen',
      stages: [...PROJECT_STAGES],
      progressPercent: 0,
      filesCount: 3
    };

    this.projects.update(list => [newProject, ...list]);
    this.populateAllPhasesForProject(newId);

    this.users.update(users => users.map(u => u.id === sm.id ? { ...u, assignedProjectsCount: u.assignedProjectsCount + 1 } : u));

    this.addNotification({
      type: 'info',
      title: 'New Turnkey Project Initiated',
      subtitle: `${newProject.name} assigned to ${sm.name} with complete execution flows`,
      timeAgo: 'Just now',
      projectId: newId
    });

    this.saveState();
    return newProject;
  }

  public populateDefaultPhaseTasks(projectId: string, stage: ProjectStage, overrideKitchenModel?: KitchenModel): void {
    const meta = STAGES_METADATA[stage];
    if (!meta) return;

    const project = this.projects().find(p => p.id === projectId);
    const projectName = project ? project.name : 'Interior Project';
    const assignedSm = project ? project.siteManagerName : 'Site Manager';
    const assignedSmId = project ? project.siteManagerId : 'u1';
    const km = overrideKitchenModel || project?.kitchenModel || 'Dry Kitchen';

    const newTasks: Task[] = meta.steps.map((step, idx) => ({
      id: `t_${projectId}_${stage.replace(/[\s\W]+/g, '_')}_${step.stepNumber}_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      projectId,
      projectName,
      stage,
      subStep: step.name,
      kitchenModel: stage === 'Kitchen Workflow' ? km : undefined,
      name: stage === 'Kitchen Workflow' ? `${km}: ${step.name}` : step.name,
      status: (idx === 0 ? 'Work In Progress' : 'Not Yet Started') as TaskStatus,
      dueDate: `Phase ${meta.phaseNumber}.${step.stepNumber}`,
      assignedToName: step.tradeOrTeam || assignedSm,
      assignedToId: assignedSmId,
      remarks: `Objective: ${step.objective}. Deliverable: ${step.deliverables}. Exit Gate: ${step.exitGate || 'Completed'}.`
    }));

    this.tasks.update(list => [...newTasks, ...list]);
    this.recalculateProjectProgress(projectId);
    this.saveState();
  }

  public populateAllPhasesForProject(projectId: string): void {
    PROJECT_STAGES.forEach(stage => {
      const existing = this.tasks().filter(t => t.projectId === projectId && t.stage === stage);
      if (existing.length === 0) {
        this.populateDefaultPhaseTasks(projectId, stage);
      }
    });
  }

  public getNextPhase(stage: ProjectStage): ProjectStage | null {
    const idx = PROJECT_STAGES.indexOf(stage);
    if (idx >= 0 && idx < PROJECT_STAGES.length - 1) {
      return PROJECT_STAGES[idx + 1];
    }
    return null;
  }

  public getPrevPhase(stage: ProjectStage): ProjectStage | null {
    const idx = PROJECT_STAGES.indexOf(stage);
    if (idx > 0) {
      return PROJECT_STAGES[idx - 1];
    }
    return null;
  }

  public updateProjectKitchenModel(projectId: string, model: KitchenModel): void {
    this.projects.update(projects =>
      projects.map(p => p.id === projectId ? { ...p, kitchenModel: model } : p)
    );
    this.saveState();
  }

  public updateTaskStatus(taskId: string, newStatus: TaskStatus, remarks?: string): void {
    const now = new Date();
    const dateFormatted = `${now.getDate()} ${now.toLocaleString('default', { month: 'short' })}`;

    this.tasks.update(tasks =>
      tasks.map(t => {
        if (t.id === taskId) {
          const updatedRemarks = remarks !== undefined ? remarks : t.remarks;
          return {
            ...t,
            status: newStatus,
            remarks: updatedRemarks,
            lastUpdated: dateFormatted,
            isForgotten: false,
            overdueDays: undefined,
            noUpdateDays: undefined
          };
        }
        return t;
      })
    );

    const updatedTask = this.tasks().find(t => t.id === taskId);
    if (updatedTask) {
      this.recalculateProjectProgress(updatedTask.projectId);

      this.addNotification({
        type: 'status_updated',
        title: 'Status updated',
        subtitle: `${updatedTask.name} – ${updatedTask.projectName} (${newStatus})`,
        timeAgo: 'Just now',
        projectId: updatedTask.projectId,
        taskId: updatedTask.id
      });
    }

    this.saveState();
  }

  public addTask(taskData: {
    projectId: string;
    stage: ProjectStage;
    name: string;
    dueDate: string;
    status: TaskStatus;
    remarks?: string;
    subStep?: string;
    kitchenModel?: KitchenModel;
  }): Task {
    const project = this.projects().find(p => p.id === taskData.projectId);
    const projectName = project ? project.name : 'Interior Project';
    const assignedSm = project ? project.siteManagerName : 'Site Manager';

    const newTask: Task = {
      id: 't_' + Date.now(),
      projectId: taskData.projectId,
      projectName,
      stage: taskData.stage,
      subStep: taskData.subStep,
      kitchenModel: taskData.kitchenModel,
      name: taskData.name,
      status: taskData.status,
      dueDate: taskData.dueDate,
      assignedToName: assignedSm,
      remarks: taskData.remarks || '',
      lastUpdated: 'Today'
    };

    this.tasks.update(list => [newTask, ...list]);
    this.recalculateProjectProgress(taskData.projectId);
    this.saveState();
    return newTask;
  }

  public deleteTask(taskId: string): void {
    const taskToDelete = this.tasks().find(t => t.id === taskId);
    if (!taskToDelete) return;

    this.tasks.update(tasks => tasks.filter(t => t.id !== taskId));
    this.recalculateProjectProgress(taskToDelete.projectId);
    this.saveState();
  }

  public addUser(userData: {
    name: string;
    role: 'Site Manager' | 'Admin' | 'Interior Designer';
    email: string;
    phone: string;
  }): User {
    const colors = ['#2563EB', '#059669', '#7C3AED', '#D97706', '#DB2777', '#0284C7'];
    const randomBg = colors[Math.floor(Math.random() * colors.length)];

    const newUser: User = {
      id: 'u_' + Date.now(),
      name: userData.name,
      role: userData.role,
      email: userData.email,
      phone: userData.phone,
      status: 'Active',
      avatarBg: randomBg,
      assignedProjectsCount: 0
    };

    this.users.update(list => [...list, newUser]);
    this.saveState();
    return newUser;
  }

  public resolveForgottenTask(taskId: string, actionType: 'ping' | 'mark-in-progress' | 'reschedule') {
    const now = new Date();
    const dateFormatted = `${now.getDate()} ${now.toLocaleString('default', { month: 'short' })}`;

    this.tasks.update(tasks =>
      tasks.map(t => {
        if (t.id === taskId) {
          if (actionType === 'mark-in-progress') {
            return { 
              ...t, 
              status: 'Work In Progress' as TaskStatus, 
              isForgotten: false, 
              overdueDays: undefined, 
              noUpdateDays: undefined, 
              lastUpdated: dateFormatted, 
              remarks: 'Site manager resumed task on site today.' 
            };
          } else if (actionType === 'reschedule') {
            return { 
              ...t, 
              isForgotten: false, 
              overdueDays: undefined, 
              noUpdateDays: undefined, 
              dueDate: '25 Sep', 
              lastUpdated: dateFormatted, 
              remarks: 'Due date extended post site supervisor alignment.' 
            };
          } else {
            return { 
              ...t, 
              isForgotten: false, 
              overdueDays: undefined, 
              noUpdateDays: undefined, 
              lastUpdated: dateFormatted, 
              remarks: 'Notification sent to site supervisor.' 
            };
          }
        }
        return t;
      })
    );

    const task = this.tasks().find(t => t.id === taskId);
    if (task) {
      this.recalculateProjectProgress(task.projectId);
    }
    this.saveState();
  }

  private recalculateProjectProgress(projectId: string) {
    const projectTasks = this.tasks().filter(t => t.projectId === projectId);
    if (projectTasks.length === 0) return;

    const completed = projectTasks.filter(t => t.status === 'Completed').length;
    const progress = Math.round((completed / projectTasks.length) * 100);

    this.projects.update(projects =>
      projects.map(p => {
        if (p.id === projectId) {
          let updatedStatus = p.status;
          if (progress === 100) updatedStatus = 'Completed';
          else if (progress > 0 && updatedStatus === 'Pending') updatedStatus = 'In Progress';
          return {
            ...p,
            progressPercent: progress,
            status: updatedStatus
          };
        }
        return p;
      })
    );
  }

  public addNotification(item: Omit<NotificationItem, 'id' | 'read'>) {
    const newNotif: NotificationItem = {
      id: 'n_' + Date.now(),
      read: false,
      ...item
    };
    this.notifications.update(list => [newNotif, ...list]);
  }

  public markNotificationAsRead(id: string) {
    this.notifications.update(list => list.map(n => n.id === id ? { ...n, read: true } : n));
    this.saveState();
  }

  public markAllNotificationsAsRead() {
    this.notifications.update(list => list.map(n => ({ ...n, read: true })));
    this.saveState();
  }
}
