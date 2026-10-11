import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PmsDataService } from '../../services/pms-data.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="navbar-wrapper">
      <div class="navbar-main">
        <div class="navbar-left">
          <!-- Brand Logo & Motto -->
          <div class="brand-logo" (click)="pmsService.navigateTo('dashboard')">
            <div class="logo-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <div class="brand-text">
              <span class="brand-title brand-font">Interior PMS</span>
              <span class="brand-subtitle">Task Management &amp; Execution</span>
            </div>
          </div>

          <!-- Active Perspective Badge -->
          <div class="perspective-badge" [ngClass]="pmsService.userRole() === 'admin' ? 'admin-mode' : 'sm-mode'">
            <div class="perspective-dot"></div>
            <span>{{ pmsService.userRole() === 'admin' ? 'ADMIN PERSPECTIVE' : 'SITE MANAGER PERSPECTIVE' }}</span>
          </div>
        </div>

        <div class="navbar-center">
          <!-- Design & Flow Diagram Button -->
          <button 
            class="flow-guide-btn" 
            (click)="pmsService.showFlowGuide.set(!pmsService.showFlowGuide())" 
            [class.active]="pmsService.showFlowGuide()"
            title="Inspect 8-step visual roadmap from specification diagram">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="12 2 2 7 12 12 22 7 12 2"/>
              <polyline points="2 17 12 22 22 17"/>
              <polyline points="2 12 12 17 22 12"/>
            </svg>
            <span>Design &amp; Flow Diagram</span>
            <span class="guide-tag">Interactive</span>
          </button>
        </div>

        <div class="navbar-right">
          <!-- Perspective Quick Switcher -->
          <div class="role-switcher" *ngIf="pmsService.isAuthenticated()">
            <button 
              class="role-btn" 
              [class.active]="pmsService.userRole() === 'admin'" 
              (click)="pmsService.setRole('admin'); pmsService.navigateTo('dashboard')"
              title="Full control - Manage projects, users, tasks, and overall progress">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              <span>Admin</span>
            </button>
            <button 
              class="role-btn" 
              [class.active]="pmsService.userRole() === 'site-manager'" 
              (click)="pmsService.setRole('site-manager'); pmsService.navigateTo('dashboard')"
              title="Track assigned projects, update tasks, and manage daily work">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <span>Site Manager ({{ pmsService.loggedInUser().name.split(' ')[0] }})</span>
            </button>
          </div>

          <!-- Notification Bell -->
          <button 
            *ngIf="pmsService.isAuthenticated()" 
            class="nav-icon-btn" 
            (click)="pmsService.navigateTo('notifications')" 
            title="Activity Notifications">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
            </svg>
            <span *ngIf="pmsService.unreadNotificationCount() > 0" class="notif-badge">
              {{ pmsService.unreadNotificationCount() }}
            </span>
          </button>

          <!-- User Profile Chip -->
          <div 
            *ngIf="pmsService.isAuthenticated()" 
            class="user-chip" 
            (click)="pmsService.navigateTo(pmsService.userRole() === 'admin' ? 'users-settings' : 'profile')">
            <div class="avatar" [style.background-color]="pmsService.userRole() === 'admin' ? '#0F172A' : (pmsService.loggedInUser().avatarBg || '#2563EB')">
              {{ pmsService.userRole() === 'admin' ? 'AD' : pmsService.loggedInUser().name.slice(0, 2).toUpperCase() }}
            </div>
            <div class="user-meta">
              <span class="user-name">{{ pmsService.userRole() === 'admin' ? 'Admin Director' : pmsService.loggedInUser().name }}</span>
              <span class="user-role">{{ pmsService.userRole() === 'admin' ? 'Super Admin' : 'Site Manager' }}</span>
            </div>
          </div>

          <!-- Logout Button (When Authenticated) -->
          <button 
            *ngIf="pmsService.isAuthenticated()" 
            class="logout-btn" 
            (click)="pmsService.logout()"
            title="Exit session and return to Login screen">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            <span>Logout</span>
          </button>

          <!-- Login Button (When Not Authenticated) -->
          <button 
            *ngIf="!pmsService.isAuthenticated()" 
            class="btn btn-primary btn-sm" 
            (click)="pmsService.navigateTo('login')">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
              <polyline points="10 17 15 12 10 7"/>
              <line x1="15" y1="12" x2="3" y2="12"/>
            </svg>
            <span>Login Portal</span>
          </button>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .navbar-wrapper {
      background: #ffffff;
      border-bottom: 1px solid var(--border-light);
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: 0 1px 3px rgba(15, 23, 42, 0.05);
    }

    .navbar-main {
      padding: 0.75rem 2rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1.5rem;
    }

    .navbar-left {
      display: flex;
      align-items: center;
      gap: 1.25rem;
    }

    .brand-logo {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      cursor: pointer;
      transition: transform 0.15s ease;
    }

    .brand-logo:hover {
      transform: translateY(-1px);
    }

    .logo-icon {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #1d4ed8, #2563eb);
      color: white;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
    }

    .brand-text {
      display: flex;
      flex-direction: column;
    }

    .brand-title {
      font-size: 1.15rem;
      font-weight: 800;
      color: #0f172a;
      line-height: 1.1;
      letter-spacing: -0.01em;
    }

    .brand-subtitle {
      font-size: 0.72rem;
      color: #64748b;
      font-weight: 500;
    }

    .perspective-badge {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      padding: 0.35rem 0.75rem;
      border-radius: var(--radius-full);
      font-size: 0.68rem;
      font-weight: 800;
      letter-spacing: 0.04em;
    }

    .perspective-badge.admin-mode {
      background: #eff6ff;
      color: #1d4ed8;
      border: 1px solid #bfdbfe;
    }
    .perspective-badge.admin-mode .perspective-dot {
      background: #2563eb;
      box-shadow: 0 0 6px rgba(37, 99, 235, 0.6);
    }

    .perspective-badge.sm-mode {
      background: #ecfdf5;
      color: #047857;
      border: 1px solid #a7f3d0;
    }
    .perspective-badge.sm-mode .perspective-dot {
      background: #10b981;
      box-shadow: 0 0 6px rgba(16, 185, 129, 0.6);
    }

    .perspective-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
    }

    .flow-guide-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: var(--radius-md);
      color: #334155;
      font-size: 0.8125rem;
      font-weight: 700;
      transition: all 0.2s;
    }

    .flow-guide-btn:hover, .flow-guide-btn.active {
      background: #eff6ff;
      border-color: #3b82f6;
      color: #1d4ed8;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
      transform: translateY(-1px);
    }

    .guide-tag {
      font-size: 0.62rem;
      background: #dbeafe;
      color: #1e40af;
      padding: 0.15rem 0.45rem;
      border-radius: 4px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    .navbar-right {
      display: flex;
      align-items: center;
      gap: 0.85rem;
    }

    .role-switcher {
      display: flex;
      background: #f1f5f9;
      padding: 3px;
      border-radius: var(--radius-md);
      border: 1px solid var(--border-light);
    }

    .role-btn {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.4rem 0.75rem;
      font-size: 0.78rem;
      font-weight: 600;
      color: #64748b;
      border-radius: var(--radius-sm);
      transition: all 0.15s ease;
    }

    .role-btn.active {
      background: #ffffff;
      color: #0f172a;
      box-shadow: 0 2px 4px rgba(0,0,0,0.06);
    }

    .nav-icon-btn {
      position: relative;
      width: 38px;
      height: 38px;
      border-radius: var(--radius-md);
      border: 1px solid var(--border-light);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #475569;
      background: #ffffff;
      transition: all 0.15s;
    }

    .nav-icon-btn:hover {
      background: #f8fafc;
      color: #0f172a;
      border-color: #cbd5e1;
    }

    .notif-badge {
      position: absolute;
      top: -4px;
      right: -4px;
      background: #ef4444;
      color: white;
      font-size: 0.65rem;
      font-weight: 800;
      width: 17px;
      height: 17px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid white;
    }

    .user-chip {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      padding: 0.35rem 0.65rem;
      border-radius: var(--radius-md);
      cursor: pointer;
      border: 1px solid var(--border-light);
      background: #ffffff;
      transition: all 0.15s;
    }

    .user-chip:hover {
      background: #f8fafc;
      border-color: #cbd5e1;
      transform: translateY(-1px);
    }

    .avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      color: white;
      font-size: 0.72rem;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .user-meta {
      display: flex;
      flex-direction: column;
      text-align: left;
    }

    .user-name {
      font-size: 0.8rem;
      font-weight: 700;
      color: #0f172a;
      line-height: 1.15;
    }

    .user-role {
      font-size: 0.68rem;
      color: #64748b;
    }

    .logout-btn {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.45rem 0.8rem;
      font-size: 0.78rem;
      font-weight: 600;
      color: #dc2626;
      background: #fef2f2;
      border: 1px solid #fee2e2;
      border-radius: var(--radius-md);
      transition: all 0.15s;
    }

    .logout-btn:hover {
      background: #fee2e2;
      border-color: #fca5a5;
      color: #b91c1c;
    }

    @media (max-width: 900px) {
      .top-announcement { display: none; }
      .brand-subtitle { display: none; }
      .flow-guide-btn span:first-of-type { display: none; }
      .perspective-badge { display: none; }
      .user-meta { display: none; }
    }
  `]
})
export class NavbarComponent {
  public pmsService = inject(PmsDataService);
}
