import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PmsDataService } from '../../services/pms-data.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <aside class="sidebar-wrapper">
      <div class="sidebar-section-title">
        {{ pmsService.userRole() === 'admin' ? 'ADMIN MENU' : 'SITE MANAGER MENU' }}
      </div>

      <!-- ADMIN MENU ITEMS (Matching Diagram Step 2 Sidebar) -->
      <nav *ngIf="pmsService.userRole() === 'admin'" class="nav-menu">
        <button 
          class="nav-item" 
          [class.active]="pmsService.activeView() === 'dashboard'" 
          (click)="pmsService.navigateTo('dashboard')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect width="7" height="9" x="3" y="3" rx="1"/>
            <rect width="7" height="5" x="14" y="3" rx="1"/>
            <rect width="7" height="9" x="14" y="12" rx="1"/>
            <rect width="7" height="5" x="3" y="16" rx="1"/>
          </svg>
          <span>Dashboard</span>
        </button>

        <button 
          class="nav-item" 
          [class.active]="pmsService.activeView() === 'projects' || pmsService.activeView() === 'project-detail'" 
          (click)="pmsService.navigateTo('projects')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/>
          </svg>
          <span>Projects</span>
          <span class="count-badge">{{ pmsService.projects().length }}</span>
        </button>

        <button 
          class="nav-item" 
          [class.active]="pmsService.activeView() === 'create-project'" 
          (click)="pmsService.navigateTo('create-project')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="16"/>
            <line x1="8" y1="12" x2="16" y2="12"/>
          </svg>
          <span>+ New Project</span>
        </button>

        <button 
          class="nav-item" 
          [class.active]="pmsService.activeView() === 'users-settings' && pmsService.adminSettingsTab() === 'users'" 
          (click)="pmsService.adminSettingsTab.set('users'); pmsService.navigateTo('users-settings')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          <span>Users</span>
          <span class="count-badge">{{ pmsService.users().length }}</span>
        </button>

        <button 
          class="nav-item" 
          [class.active]="pmsService.activeView() === 'daily-tasks'" 
          (click)="pmsService.navigateTo('daily-tasks')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="m9 11 3 3L22 4"/>
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
          </svg>
          <span>Daily Tasks &amp; Alerts</span>
          <span *ngIf="pmsService.overdueTasks().length > 0" class="alert-count-badge">
            {{ pmsService.overdueTasks().length }}
          </span>
        </button>

        <button 
          class="nav-item" 
          [class.active]="pmsService.activeView() === 'notifications'" 
          (click)="pmsService.navigateTo('notifications')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
          </svg>
          <span>Reports &amp; Logs</span>
        </button>

        <button 
          class="nav-item" 
          [class.active]="pmsService.activeView() === 'users-settings' && (pmsService.adminSettingsTab() === 'settings' || pmsService.adminSettingsTab() === 'logs')" 
          (click)="pmsService.adminSettingsTab.set('settings'); pmsService.navigateTo('users-settings')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
          <span>Settings</span>
        </button>
      </nav>

      <!-- SITE MANAGER MENU ITEMS (Matching Diagram Site Manager Step 2 Sidebar) -->
      <nav *ngIf="pmsService.userRole() === 'site-manager'" class="nav-menu">
        <button 
          class="nav-item" 
          [class.active]="pmsService.activeView() === 'dashboard'" 
          (click)="pmsService.navigateTo('dashboard')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect width="7" height="9" x="3" y="3" rx="1"/>
            <rect width="7" height="5" x="14" y="3" rx="1"/>
            <rect width="7" height="9" x="14" y="12" rx="1"/>
            <rect width="7" height="5" x="3" y="16" rx="1"/>
          </svg>
          <span>Dashboard</span>
        </button>

        <button 
          class="nav-item" 
          [class.active]="pmsService.activeView() === 'projects' || pmsService.activeView() === 'project-detail'" 
          (click)="pmsService.navigateTo('projects')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/>
          </svg>
          <span>My Projects</span>
          <span class="count-badge">{{ pmsService.siteManagerProjectsCount() }}</span>
        </button>

        <button 
          class="nav-item" 
          [class.active]="pmsService.activeView() === 'daily-tasks'" 
          (click)="pmsService.navigateTo('daily-tasks')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="m9 11 3 3L22 4"/>
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
          </svg>
          <span>Daily Tasks</span>
          <span class="count-badge">{{ pmsService.todayTasks().length }}</span>
        </button>

        <button 
          class="nav-item" 
          [class.active]="pmsService.activeView() === 'notifications'" 
          (click)="pmsService.navigateTo('notifications')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
          </svg>
          <span>Notifications</span>
          <span *ngIf="pmsService.unreadNotificationCount() > 0" class="alert-count-badge">
            {{ pmsService.unreadNotificationCount() }}
          </span>
        </button>

        <button 
          class="nav-item" 
          [class.active]="pmsService.activeView() === 'profile'" 
          (click)="pmsService.navigateTo('profile')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          <span>Profile</span>
        </button>
      </nav>

      <!-- Bottom Quick Flow Guide Trigger -->
      <div class="sidebar-bottom-guide">
        <button class="flow-trigger-box" (click)="pmsService.showFlowGuide.set(true)">
          <div class="flow-trigger-icon">🗺️</div>
          <div class="flow-trigger-text">
            <strong>Flow Roadmap</strong>
            <small>Inspect All 8 Steps</small>
          </div>
        </button>

        <button class="sidebar-logout-btn" (click)="pmsService.logout()">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          <span>Sign Out / Switch</span>
        </button>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar-wrapper {
      width: 240px;
      min-height: calc(100vh - 80px);
      background: #ffffff;
      border-right: 1px solid var(--border-light);
      padding: 1.25rem 0.85rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      flex-shrink: 0;
    }

    .sidebar-section-title {
      font-size: 0.68rem;
      font-weight: 800;
      color: #94a3b8;
      letter-spacing: 0.08em;
      padding: 0 0.5rem;
    }

    .nav-menu {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      flex: 1;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.6rem 0.75rem;
      font-size: 0.85rem;
      font-weight: 600;
      color: #475569;
      border-radius: var(--radius-md);
      transition: all 0.15s;
      position: relative;
    }

    .nav-item:hover {
      background: #f8fafc;
      color: #0f172a;
    }

    .nav-item.active {
      background: #eff6ff;
      color: #1d4ed8;
      font-weight: 700;
    }

    .count-badge {
      margin-left: auto;
      font-size: 0.7rem;
      font-weight: 700;
      color: #64748b;
      background: #f1f5f9;
      padding: 0.15rem 0.45rem;
      border-radius: 9999px;
    }

    .alert-count-badge {
      margin-left: auto;
      font-size: 0.7rem;
      font-weight: 800;
      color: #ffffff;
      background: #ef4444;
      padding: 0.15rem 0.5rem;
      border-radius: 9999px;
    }

    .sidebar-bottom-guide {
      margin-top: auto;
      padding-top: 1rem;
      border-top: 1px solid var(--border-light);
    }

    .flow-trigger-box {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem;
      background: linear-gradient(135deg, #f0fdf4, #eff6ff);
      border: 1px solid #bfdbfe;
      border-radius: var(--radius-md);
      text-align: left;
      cursor: pointer;
      transition: all 0.2s;
    }

    .flow-trigger-box:hover {
      border-color: #2563eb;
      transform: translateY(-1px);
      box-shadow: 0 2px 6px rgba(37, 99, 235, 0.15);
    }

    .flow-trigger-icon {
      font-size: 1.25rem;
    }

    .flow-trigger-text {
      display: flex;
      flex-direction: column;
    }

    .flow-trigger-text strong {
      font-size: 0.8rem;
      color: #0f172a;
    }

    .flow-trigger-text small {
      font-size: 0.68rem;
      color: #2563eb;
      font-weight: 600;
    }

    .sidebar-logout-btn {
      width: 100%;
      margin-top: 0.6rem;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.55rem;
      background: #fef2f2;
      border: 1px solid #fee2e2;
      border-radius: var(--radius-md);
      color: #dc2626;
      font-size: 0.78rem;
      font-weight: 600;
      transition: all 0.15s;
    }

    .sidebar-logout-btn:hover {
      background: #fee2e2;
      border-color: #fca5a5;
      color: #b91c1c;
    }

    @media (max-width: 768px) {
      .sidebar-wrapper {
        display: none;
      }
    }
  `]
})
export class SidebarComponent {
  public pmsService = inject(PmsDataService);
}
