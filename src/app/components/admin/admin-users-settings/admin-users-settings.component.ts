import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PmsDataService } from '../../../services/pms-data.service';
import { User, TASK_STATUS_CONFIG, PROJECT_STAGES, STAGES_METADATA, ProjectStage } from '../../../models/pms.models';

@Component({
  selector: 'app-admin-users-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="users-settings-wrapper animate-fade-in">
      <!-- Section Header -->
      <div class="section-header">
        <div>
          <div class="step-tag">Step 8: Manage Users &amp; Settings</div>
          <h2>Team Management &amp; System Configuration</h2>
          <p class="section-desc">Manage site managers, configure stages &amp; status definitions, and set notification triggers</p>
        </div>

        <button class="btn btn-primary" (click)="showAddUserModal = true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          + Add User
        </button>
      </div>

      <!-- Navigation Tabs: Users | Settings -->
      <div class="card tabs-bar-card">
        <div class="tab-buttons">
          <button 
            class="tab-btn" 
            [class.active]="activeTab === 'users'" 
            (click)="activeTab = 'users'">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            Site Managers &amp; Staff ({{ pmsService.users().length }})
          </button>
          <button 
            class="tab-btn" 
            [class.active]="activeTab === 'settings'" 
            (click)="activeTab = 'settings'">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
            System Settings (Stages, Status, Notifications)
          </button>
          <button 
            class="tab-btn" 
            [class.active]="activeTab === 'logs'" 
            (click)="activeTab = 'logs'; reloadLogs()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <polyline points="9 12 12 15 16 10"/>
            </svg>
            Login Audit Logs (data/logins.json) ({{ pmsService.loginLogs().length }})
          </button>
        </div>
      </div>

      <!-- TAB 1: USERS SECTION -->
      <div *ngIf="activeTab === 'users'" class="card table-card animate-fade-in">
        <div class="card-inner-header">
          <div>
            <h3>Active System Users</h3>
            <p class="sub-caption">Manage field site managers, designers, and project supervisors</p>
          </div>
        </div>

        <div class="table-container">
          <table class="pms-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Active Projects</th>
                <th>Status</th>
                <th class="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let u of pmsService.users()">
                <td>
                  <div class="user-id-cell">
                    <span class="user-avatar-circle" [style.background-color]="u.avatarBg || '#2563eb'">
                      {{ u.name.slice(0, 2).toUpperCase() }}
                    </span>
                    <div class="user-name-meta">
                      <span class="name-text">{{ u.name }}</span>
                      <small class="user-id-text">ID: {{ u.id }}</small>
                    </div>
                  </div>
                </td>
                <td>
                  <span class="role-badge" [ngClass]="getRoleClass(u.role)">
                    {{ u.role }}
                  </span>
                </td>
                <td>{{ u.email }}</td>
                <td>{{ u.phone }}</td>
                <td>
                  <span class="assigned-count">{{ u.assignedProjectsCount }} Projects</span>
                </td>
                <td>
                  <span class="status-pill status-completed">
                    <span class="status-dot"></span>
                    {{ u.status }}
                  </span>
                </td>
                <td class="text-right">
                  <button class="btn btn-outline btn-sm" (click)="loginAsUser(u)">
                    Switch to this User
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- TAB 2: SETTINGS SECTION (Matching diagram: Project Stages, Task Status Options, Notifications, Company Profile) -->
      <div *ngIf="activeTab === 'settings'" class="settings-grid animate-fade-in">
        <!-- Project Stages Card -->
        <div class="card settings-box">
          <div class="box-header">
            <h3>Project Stages Configuration</h3>
            <span class="badge-mini">9 Execution Phases</span>
          </div>
          <p class="box-desc">Standard interior company workflow lifecycle:</p>

          <div class="stages-config-list">
            <div *ngFor="let s of stages; let i = index" class="stage-item-row">
              <span class="stage-idx">0{{ i + 1 }}</span>
              <div class="stage-info">
                <strong>{{ s }}</strong>
                <small>{{ getStageDescription(s) }}</small>
              </div>
              <span class="stage-status-tag">Default</span>
            </div>
          </div>
        </div>

        <!-- Task Status Options Card (5 options) -->
        <div class="card settings-box">
          <div class="box-header">
            <h3>Task Status Options</h3>
            <span class="badge-mini">5 Status Choices</span>
          </div>
          <p class="box-desc">Official 5 status choices used across Admin and Site Manager:</p>

          <div class="status-config-list">
            <div *ngFor="let key of statusKeys" class="status-item-row">
              <span class="status-pill" [ngClass]="getStatusClass(key)">
                <span class="status-dot"></span>
                {{ key }}
              </span>
              <span class="status-desc-text">{{ statusConfig[key].desc }}</span>
            </div>
          </div>
        </div>

        <!-- Notifications Card -->
        <div class="card settings-box">
          <div class="box-header">
            <h3>Notification Preferences</h3>
            <span class="badge-mini">Real-Time Alerts</span>
          </div>
          <p class="box-desc">Configure automatic warning rules for site delays:</p>

          <div class="pref-toggles-list">
            <label class="toggle-item">
              <input type="checkbox" checked>
              <div>
                <strong>Overdue Task Alerts</strong>
                <small>Send immediate notification when task exceeds scheduled delivery date.</small>
              </div>
            </label>
            <label class="toggle-item">
              <input type="checkbox" checked>
              <div>
                <strong>Forgotten Task Reminders (48 Hours)</strong>
                <small>Alert administrator if no supervisor check-in is logged for 2 days.</small>
              </div>
            </label>
            <label class="toggle-item">
              <input type="checkbox" checked>
              <div>
                <strong>Daily Morning Digest (08:00 AM)</strong>
                <small>Email summary of today's pending site inspections.</small>
              </div>
            </label>
          </div>
        </div>

        <!-- Company Profile Card -->
        <div class="card settings-box">
          <div class="box-header">
            <h3>Company Profile</h3>
            <span class="badge-mini">Brand Identity</span>
          </div>
          <p class="box-desc">Organization details for client contracts &amp; report headers:</p>

          <div class="company-form">
            <div class="form-group-sm">
              <label>Company Name</label>
              <input type="text" value="Interior Company / Laitaliya Interiors PMS" readonly>
            </div>
            <div class="form-group-sm">
              <label>Headquarters</label>
              <input type="text" value="Rajahmundry &bull; Visakhapatnam &bull; Hyderabad" readonly>
            </div>
            <div class="form-group-sm">
              <label>Client Support Email</label>
              <input type="text" value="operations&#64;interiorpms.com" readonly>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 3: LOGIN AUDIT LOGS (DATA/LOGINS.JSON) -->
      <div *ngIf="activeTab === 'logs'" class="logs-section-wrapper animate-fade-in">
        <!-- Storage Banner Card -->
        <div class="card storage-info-card">
          <div class="storage-info-left">
            <div class="storage-icon">📂</div>
            <div>
              <h3>Session Logins File Persistence</h3>
              <p class="storage-sub">All login events for Directors and Site Managers are stored directly in your project data folder:</p>
              <div class="file-path-badge">
                <span class="path-label">File:</span>
                <code>data/logins.json</code>
                <span class="sync-status-pill">● Disk Synced (Node Server :3000)</span>
              </div>
            </div>
          </div>
          <div class="storage-actions">
            <button class="btn btn-outline btn-sm" (click)="reloadLogs()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
              </svg>
              Reload from File
            </button>
            <button class="btn btn-primary btn-sm" (click)="exportLogsJson()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Export JSON
            </button>
          </div>
        </div>

        <!-- Metric Stat Cards -->
        <div class="logs-stats-grid">
          <div class="stat-card-mini">
            <span class="stat-mini-label">Total Logins Recorded</span>
            <span class="stat-mini-val">{{ pmsService.loginLogs().length }}</span>
            <small class="stat-mini-hint">Stored in data/logins.json</small>
          </div>
          <div class="stat-card-mini">
            <span class="stat-mini-label">Admin Director Sessions</span>
            <span class="stat-mini-val val-blue">{{ getAdminLogCount() }}</span>
            <small class="stat-mini-hint">Executive access logs</small>
          </div>
          <div class="stat-card-mini">
            <span class="stat-mini-label">Site Manager Sessions</span>
            <span class="stat-mini-val val-purple">{{ getSmLogCount() }}</span>
            <small class="stat-mini-hint">Field supervisor access</small>
          </div>
          <div class="stat-card-mini">
            <span class="stat-mini-label">Data Storage Mode</span>
            <span class="stat-mini-val status-val-active">ACTIVE</span>
            <small class="stat-mini-hint">Direct File System Write</small>
          </div>
        </div>

        <!-- Filter Bar -->
        <div class="card filter-bar-card">
          <div class="filter-controls">
            <span class="filter-label">Filter Logins:</span>
            <button class="filter-chip" [class.active]="logFilter === 'all'" (click)="logFilter = 'all'">
              All ({{ pmsService.loginLogs().length }})
            </button>
            <button class="filter-chip" [class.active]="logFilter === 'admin'" (click)="logFilter = 'admin'">
              Admin Sessions ({{ getAdminLogCount() }})
            </button>
            <button class="filter-chip" [class.active]="logFilter === 'site-manager'" (click)="logFilter = 'site-manager'">
              Site Managers ({{ getSmLogCount() }})
            </button>
          </div>
          <span class="log-count-indicator">Showing {{ filteredLogs.length }} records</span>
        </div>

        <!-- Table of Logins -->
        <div class="card table-card">
          <div class="table-container">
            <table class="pms-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>User &amp; Email</th>
                  <th>Role</th>
                  <th>Password</th>
                  <th>Login Portal / Method</th>
                  <th>Client Device</th>
                  <th>Status</th>
                  <th>Log ID</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let log of filteredLogs">
                  <td>
                    <div class="time-meta">
                      <strong>{{ log.formattedDate || log.timestamp }}</strong>
                      <small class="iso-time">{{ log.timestamp }}</small>
                    </div>
                  </td>
                  <td>
                    <div class="user-meta-col">
                      <strong class="user-log-name">{{ log.userName }}</strong>
                      <small class="user-log-email">{{ log.email }}</small>
                    </div>
                  </td>
                  <td>
                    <span class="role-badge" [ngClass]="log.role === 'admin' ? 'admin' : 'sm'">
                      {{ log.role === 'admin' ? 'Director / Admin' : 'Site Manager' }}
                    </span>
                  </td>
                  <td>
                    <code class="password-code">{{ log.password || 'password123' }}</code>
                  </td>
                  <td>
                    <span class="portal-method-badge">{{ log.loginMethod }}</span>
                  </td>
                  <td>
                    <span class="device-badge">{{ log.device || 'Desktop Browser' }}</span>
                  </td>
                  <td>
                    <span class="status-pill status-completed">
                      <span class="status-dot"></span>
                      {{ log.status }}
                    </span>
                  </td>
                  <td>
                    <code class="log-id-code">{{ log.id }}</code>
                  </td>
                </tr>
                <tr *ngIf="filteredLogs.length === 0">
                  <td colspan="8" class="text-center empty-logs-msg">
                    No login records match this filter. Logins will be appended to <code>data/logins.json</code> automatically upon signing in.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Add User Modal -->
      <div *ngIf="showAddUserModal" class="modal-overlay" (click)="showAddUserModal = false">
        <div class="modal-dialog" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Add New System User</h3>
            <button class="close-btn" (click)="showAddUserModal = false">×</button>
          </div>

          <div class="modal-body">
            <div class="form-group">
              <label>Full Name *</label>
              <input type="text" [(ngModel)]="newUserName" placeholder="e.g. Ramesh Varma">
            </div>

            <div class="form-group">
              <label>Role *</label>
              <select [(ngModel)]="newUserRole">
                <option value="Site Manager">Site Manager</option>
                <option value="Interior Designer">Interior Designer</option>
                <option value="Admin">Admin</option>
              </select>
            </div>

            <div class="form-group">
              <label>Email Address *</label>
              <input type="email" [(ngModel)]="newUserEmail" placeholder="e.g. ramesh@company.com">
            </div>

            <div class="form-group">
              <label>Phone Number *</label>
              <input type="tel" [(ngModel)]="newUserPhone" placeholder="e.g. +91 98480 88888">
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="showAddUserModal = false">Cancel</button>
            <button class="btn btn-primary" (click)="saveNewUser()">Save User</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .users-settings-wrapper {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .section-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .step-tag {
      display: inline-block;
      font-size: 0.72rem;
      font-weight: 800;
      color: #2563eb;
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      padding: 0.2rem 0.55rem;
      border-radius: var(--radius-full);
      margin-bottom: 0.35rem;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .section-header h2 {
      font-size: 1.5rem;
      font-weight: 800;
      color: #0f172a;
    }

    .section-desc {
      font-size: 0.85rem;
      color: #64748b;
    }

    .tabs-bar-card {
      padding: 0.5rem;
    }

    .tab-buttons {
      display: flex;
      gap: 0.5rem;
    }

    .tab-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.55rem 1.1rem;
      font-size: 0.825rem;
      font-weight: 700;
      color: #64748b;
      border-radius: var(--radius-md);
      transition: all 0.15s;
    }

    .tab-btn:hover {
      background: #f1f5f9;
      color: #0f172a;
    }

    .tab-btn.active {
      background: #eff6ff;
      color: #1d4ed8;
    }

    .card-inner-header {
      padding: 1.25rem;
      border-bottom: 1px solid var(--border-light);
    }

    .card-inner-header h3 {
      font-size: 1.05rem;
      font-weight: 700;
    }

    .sub-caption {
      font-size: 0.75rem;
      color: #64748b;
    }

    .user-id-cell {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .user-avatar-circle {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      color: white;
      font-size: 0.72rem;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .user-name-meta {
      display: flex;
      flex-direction: column;
    }

    .name-text {
      font-weight: 700;
      color: #0f172a;
    }

    .user-id-text {
      font-size: 0.65rem;
      color: #94a3b8;
    }

    .role-badge {
      font-size: 0.72rem;
      font-weight: 700;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      display: inline-block;
    }
    .role-badge.sm { background: #dbeafe; color: #1e40af; }
    .role-badge.admin { background: #f1f5f9; color: #0f172a; }
    .role-badge.designer { background: #fce7f3; color: #9d174d; }

    .assigned-count {
      font-size: 0.78rem;
      font-weight: 600;
      color: #475569;
    }

    .settings-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 1.25rem;
    }

    .settings-box {
      padding: 1.25rem;
    }

    .box-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.35rem;
    }

    .box-header h3 {
      font-size: 1rem;
      font-weight: 800;
    }

    .badge-mini {
      font-size: 0.68rem;
      font-weight: 700;
      background: #eff6ff;
      color: #2563eb;
      padding: 0.15rem 0.45rem;
      border-radius: 4px;
    }

    .box-desc {
      font-size: 0.75rem;
      color: #64748b;
      margin-bottom: 1rem;
    }

    .stages-config-list, .status-config-list {
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
    }

    .stage-item-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.5rem 0.75rem;
      background: #f8fafc;
      border: 1px solid var(--border-light);
      border-radius: var(--radius-md);
    }

    .stage-idx {
      font-size: 0.75rem;
      font-weight: 800;
      color: #2563eb;
      width: 24px;
    }

    .stage-info {
      flex: 1;
      display: flex;
      flex-direction: column;
    }
    .stage-info strong { font-size: 0.8rem; color: #0f172a; }
    .stage-info small { font-size: 0.68rem; color: #64748b; }

    .stage-status-tag {
      font-size: 0.65rem;
      font-weight: 700;
      color: #059669;
      background: #ecfdf5;
      padding: 0.15rem 0.35rem;
      border-radius: 3px;
    }

    .status-item-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      padding: 0.45rem 0.6rem;
      background: #f8fafc;
      border-radius: var(--radius-md);
      border: 1px solid var(--border-light);
    }

    .status-desc-text {
      font-size: 0.72rem;
      color: #64748b;
      text-align: right;
    }

    .pref-toggles-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .toggle-item {
      display: flex;
      align-items: flex-start;
      gap: 0.6rem;
      font-size: 0.78rem;
      cursor: pointer;
    }

    .toggle-item input {
      margin-top: 3px;
    }

    .toggle-item strong {
      display: block;
      color: #0f172a;
    }

    .toggle-item small {
      color: #64748b;
      line-height: 1.3;
    }

    .company-form {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .form-group-sm label {
      display: block;
      font-size: 0.72rem;
      font-weight: 700;
      color: #475569;
      margin-bottom: 0.2rem;
    }

    .form-group-sm input {
      width: 100%;
      padding: 0.45rem 0.65rem;
      background: #f8fafc;
      border: 1px solid var(--border-light);
      border-radius: var(--radius-md);
      font-size: 0.8rem;
    }

    .text-right {
      text-align: right;
    }

    /* LOGIN AUDIT LOG STYLES */
    .logs-section-wrapper {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .storage-info-card {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1.5rem;
      flex-wrap: wrap;
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      border: 1px solid #cbd5e1;
    }

    .storage-info-left {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
    }

    .storage-icon {
      font-size: 2rem;
      background: #ffffff;
      width: 50px;
      height: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      border: 1px solid #e2e8f0;
      flex-shrink: 0;
    }

    .storage-sub {
      font-size: 0.82rem;
      color: #64748b;
      margin-top: 0.2rem;
      margin-bottom: 0.5rem;
    }

    .file-path-badge {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .path-label {
      font-size: 0.72rem;
      font-weight: 700;
      color: #475569;
      text-transform: uppercase;
    }

    .file-path-badge code {
      background: #1e293b;
      color: #38bdf8;
      padding: 0.25rem 0.6rem;
      border-radius: var(--radius-sm);
      font-size: 0.78rem;
      font-family: monospace;
      font-weight: 600;
    }

    .sync-status-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      background: #ecfdf5;
      color: #059669;
      border: 1px solid #a7f3d0;
      padding: 0.2rem 0.55rem;
      border-radius: var(--radius-full);
      font-size: 0.72rem;
      font-weight: 700;
    }

    .storage-actions {
      display: flex;
      gap: 0.75rem;
      align-items: center;
    }

    .logs-stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .stat-card-mini {
      background: #ffffff;
      border-radius: var(--radius-lg);
      padding: 1.1rem 1.25rem;
      border: 1px solid var(--border-light);
      box-shadow: var(--shadow-sm);
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .stat-mini-label {
      font-size: 0.75rem;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    .stat-mini-val {
      font-size: 1.75rem;
      font-weight: 800;
      color: #0f172a;
    }

    .stat-mini-val.val-blue {
      color: #2563eb;
    }

    .stat-mini-val.val-purple {
      color: #7c3aed;
    }

    .status-val-active {
      color: #059669;
      font-size: 1.4rem;
    }

    .stat-mini-hint {
      font-size: 0.72rem;
      color: #94a3b8;
    }

    .filter-bar-card {
      padding: 0.75rem 1.25rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .filter-controls {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .filter-label {
      font-size: 0.78rem;
      font-weight: 700;
      color: #475569;
      margin-right: 0.25rem;
    }

    .filter-chip {
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      border-radius: var(--radius-full);
      padding: 0.3rem 0.75rem;
      font-size: 0.75rem;
      font-weight: 600;
      color: #334155;
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .filter-chip:hover {
      background: #e2e8f0;
      color: #0f172a;
    }

    .filter-chip.active {
      background: #2563eb;
      color: #ffffff;
      border-color: #2563eb;
    }

    .log-count-indicator {
      font-size: 0.75rem;
      color: #64748b;
      font-weight: 500;
    }

    .time-meta {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
    }

    .time-meta strong {
      font-size: 0.8rem;
      color: #0f172a;
    }

    .iso-time {
      font-size: 0.7rem;
      color: #94a3b8;
      font-family: monospace;
    }

    .user-meta-col {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
    }

    .user-log-name {
      font-size: 0.85rem;
      color: #0f172a;
      font-weight: 700;
    }

    .user-log-email {
      font-size: 0.72rem;
      color: #64748b;
    }

    .portal-method-badge {
      display: inline-block;
      font-size: 0.72rem;
      font-weight: 600;
      color: #475569;
      background: #f8fafc;
      padding: 0.2rem 0.5rem;
      border-radius: var(--radius-sm);
      border: 1px solid #e2e8f0;
    }

    .device-badge {
      font-size: 0.75rem;
      color: #64748b;
    }

    .log-id-code {
      font-size: 0.72rem;
      font-family: monospace;
      color: #64748b;
      background: #f1f5f9;
      padding: 0.15rem 0.4rem;
      border-radius: var(--radius-sm);
      border: 1px solid #e2e8f0;
    }

    .password-code {
      font-size: 0.74rem;
      font-family: monospace;
      font-weight: 600;
      color: #0284c7;
      background: #f0f9ff;
      border: 1px solid #bae6fd;
      padding: 0.15rem 0.45rem;
      border-radius: var(--radius-sm);
    }

    .empty-logs-msg {
      padding: 2.5rem 1rem;
      color: #64748b;
      font-size: 0.85rem;
    }
  `]
})
export class AdminUsersSettingsComponent {
  public pmsService = inject(PmsDataService);

  public get activeTab(): 'users' | 'settings' | 'logs' {
    return this.pmsService.adminSettingsTab();
  }
  public set activeTab(tab: 'users' | 'settings' | 'logs') {
    this.pmsService.adminSettingsTab.set(tab);
  }
  public logFilter: 'all' | 'admin' | 'site-manager' = 'all';

  public stages = PROJECT_STAGES;
  public statusConfig = TASK_STATUS_CONFIG;
  public statusKeys = Object.keys(TASK_STATUS_CONFIG) as (keyof typeof TASK_STATUS_CONFIG)[];

  public showAddUserModal = false;
  public newUserName = '';
  public newUserRole: 'Site Manager' | 'Admin' | 'Interior Designer' = 'Site Manager';
  public newUserEmail = '';
  public newUserPhone = '+91 98480 11111';

  public get filteredLogs() {
    const logs = this.pmsService.loginLogs();
    if (this.logFilter === 'admin') {
      return logs.filter(l => l.role === 'admin');
    }
    if (this.logFilter === 'site-manager') {
      return logs.filter(l => l.role === 'site-manager');
    }
    return logs;
  }

  public getAdminLogCount(): number {
    return this.pmsService.loginLogs().filter(l => l.role === 'admin').length;
  }

  public getSmLogCount(): number {
    return this.pmsService.loginLogs().filter(l => l.role === 'site-manager').length;
  }

  public reloadLogs() {
    this.pmsService.loadLoginsFromDisk();
  }

  public exportLogsJson() {
    if (typeof document === 'undefined') return;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(this.pmsService.loginLogs(), null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'logins.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  public saveNewUser() {
    if (!this.newUserName || !this.newUserEmail) return;

    this.pmsService.addUser({
      name: this.newUserName,
      role: this.newUserRole,
      email: this.newUserEmail,
      phone: this.newUserPhone
    });

    this.showAddUserModal = false;
    this.newUserName = '';
    this.newUserEmail = '';
  }

  public loginAsUser(user: User) {
    this.pmsService.setLoggedInUser(user);
    this.pmsService.navigateTo('dashboard');
  }

  public getRoleClass(role: string): string {
    switch (role) {
      case 'Site Manager': return 'sm';
      case 'Admin': return 'admin';
      case 'Interior Designer': return 'designer';
      default: return 'sm';
    }
  }

  public getStatusClass(status: any): string {
    switch (status) {
      case 'Not Yet Started': return 'status-not-started';
      case 'Work In Progress': return 'status-in-progress';
      case 'Completed': return 'status-completed';
      case 'Pending': return 'status-pending';
      case 'Rechecking': return 'status-rechecking';
      default: return 'status-in-progress';
    }
  }

  public getStageDescription(stage: string): string {
    const meta = this.stagesMetadata[stage as ProjectStage];
    return meta ? meta.flowSummary : 'Sequential Phase';
  }

  public stagesMetadata = STAGES_METADATA;
}
