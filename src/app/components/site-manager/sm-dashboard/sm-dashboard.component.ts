import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PmsDataService } from '../../../services/pms-data.service';

@Component({
  selector: 'app-sm-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="sm-dashboard-wrapper animate-fade-in">
      <!-- Section Header -->
      <div class="section-header">
        <div>
          <div class="step-tag">Step 2: Site Manager Dashboard</div>
          <h2>Field Operations Dashboard</h2>
          <p class="section-desc">Welcome back, {{ pmsService.loggedInUser().name }} &bull; Track your assigned interior sites and today's execution schedule</p>
        </div>

        <div class="header-actions">
          <button class="btn btn-outline" (click)="pmsService.navigateTo('daily-tasks')">
            Daily Tasks ({{ pmsService.siteManagerTasks().length }})
          </button>
          <button class="btn btn-primary" (click)="pmsService.navigateTo('projects')">
            View Assigned Projects &rarr;
          </button>
        </div>
      </div>

      <!-- Overview Counters (Matching SM Step 2: Assigned: 3, Today: 5, Overdue: 1, Completed: 2) -->
      <div class="stats-row">
        <div class="stat-card blue" (click)="pmsService.navigateTo('projects')">
          <div class="stat-top">
            <span class="stat-label">Assigned Projects</span>
            <div class="stat-icon blue">🏠</div>
          </div>
          <div class="stat-val blue-text">{{ pmsService.siteManagerProjectsCount() }}</div>
          <div class="stat-footer">Direct site supervision</div>
        </div>

        <div class="stat-card amber" (click)="pmsService.navigateTo('daily-tasks')">
          <div class="stat-top">
            <span class="stat-label">Today's Tasks</span>
            <div class="stat-icon amber">📋</div>
          </div>
          <div class="stat-val amber-text">{{ pmsService.todayTasks().length }}</div>
          <div class="stat-footer">On site inspection queue</div>
        </div>

        <div class="stat-card red" (click)="pmsService.navigateTo('daily-tasks')">
          <div class="stat-top">
            <span class="stat-label">Overdue Tasks</span>
            <div class="stat-icon red">⚠️</div>
          </div>
          <div class="stat-val red-text">{{ pmsService.overdueTasks().length }}</div>
          <div class="stat-footer alert-subtext">Requires immediate update</div>
        </div>

        <div class="stat-card green" (click)="pmsService.navigateTo('daily-tasks')">
          <div class="stat-top">
            <span class="stat-label">Completed</span>
            <div class="stat-icon green">✅</div>
          </div>
          <div class="stat-val green-text">{{ completedTasksCount }}</div>
          <div class="stat-footer">Milestones signed off</div>
        </div>
      </div>

      <!-- Critical Alert Banner if Overdue -->
      <div *ngIf="pmsService.overdueTasks().length > 0" class="alert-banner-card card">
        <div class="alert-banner-left">
          <div class="bell-circle">🔔</div>
          <div>
            <strong>{{ pmsService.overdueTasks().length }} Site Task{{ pmsService.overdueTasks().length > 1 ? 's' : '' }} Overdue &amp; Awaiting Update</strong>
            <p>{{ pmsService.overdueTasks()[0].projectName }} &ndash; {{ pmsService.overdueTasks()[0].name }} is pending supervisor remark. Click to log current site status.</p>
          </div>
        </div>
        <button class="btn btn-danger btn-sm" (click)="pmsService.navigateTo('daily-tasks')">
          Take Action &rarr;
        </button>
      </div>

      <!-- Assigned Projects Grid / List (Step 2 Recent Projects) -->
      <div class="dashboard-grid">
        <div class="dashboard-main-col">
          <div class="card content-card">
            <div class="card-header-bar">
              <div>
                <h3>My Assigned Sites</h3>
                <p class="sub-caption">Click any site to inspect stages and update task statuses</p>
              </div>
              <button class="btn btn-outline btn-sm" (click)="pmsService.navigateTo('projects')">
                All My Projects &rarr;
              </button>
            </div>

            <div class="projects-card-grid">
              <div 
                *ngFor="let p of pmsService.siteManagerProjects()" 
                class="project-tile card"
                (click)="openProject(p.id)">
                <div class="tile-header">
                  <span class="tile-title">{{ p.name }}</span>
                  <div class="tile-header-pills">
                    <span *ngIf="p.kitchenModel" class="km-pill-mini">🍳 {{ p.kitchenModel }}</span>
                    <span class="status-pill" [ngClass]="getProjectStatusClass(p.status)">
                      <span class="status-dot"></span>
                      {{ p.status }}
                    </span>
                  </div>
                </div>
                <div class="tile-meta">
                  <span>Client: <strong>{{ p.client }}</strong></span>
                  <span>Location: 📍 {{ p.location }}</span>
                </div>
                <div class="tile-progress">
                  <div class="tile-progress-info">
                    <span class="phase-lifecycle-text">9-Phase Lifecycle</span>
                    <span class="progress-num">{{ p.progressPercent }}%</span>
                  </div>
                  <div class="progress-wrap">
                    <div class="progress-bar-bg">
                      <div class="progress-bar-fill" [style.width.%]="p.progressPercent"></div>
                    </div>
                  </div>
                </div>
                <div class="tile-footer">
                  <button class="btn btn-primary btn-sm btn-tile" (click)="$event.stopPropagation(); openProject(p.id)">
                    Open Stages &amp; Tasks &rarr;
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Side: Today's High Priority Tasks -->
        <div class="dashboard-side-col">
          <div class="card content-card">
            <div class="card-header-bar">
              <div>
                <h3>Today's Task Queue</h3>
                <p class="sub-caption">Immediate deliverables</p>
              </div>
            </div>

            <div class="sm-quick-tasks-list">
              <div *ngFor="let t of displayQueueTasks" class="sm-task-chip" (click)="openProject(t.projectId)">
                <div class="chip-top">
                  <span class="chip-task-name">{{ t.name }}</span>
                  <span class="status-pill" [ngClass]="getStatusClass(t.status)">
                    <span class="status-dot"></span>
                    {{ t.status }}
                  </span>
                </div>
                <div class="chip-mid-tags" *ngIf="t.subStep || t.kitchenModel">
                  <span *ngIf="t.subStep" class="substep-mini">Step: {{ t.subStep }}</span>
                  <span *ngIf="t.kitchenModel" class="km-mini">🍳 {{ t.kitchenModel }}</span>
                </div>
                <div class="chip-bottom">
                  <span>{{ t.projectName }}</span>
                  <small>Due: {{ t.dueDate }}</small>
                </div>
              </div>
            </div>

            <div class="side-card-footer">
              <button class="btn btn-outline btn-sm btn-full" (click)="pmsService.navigateTo('daily-tasks')">
                View All Daily Tasks &rarr;
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .sm-dashboard-wrapper {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
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
      color: #059669;
      background: #ecfdf5;
      border: 1px solid #a7f3d0;
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

    .header-actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .stats-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
      gap: 1rem;
    }

    .stat-card {
      background: #ffffff;
      border: 1px solid var(--border-light);
      border-radius: var(--radius-lg);
      padding: 1.15rem;
      box-shadow: var(--shadow-xs);
      cursor: pointer;
      transition: all 0.2s;
    }

    .stat-card:hover {
      box-shadow: var(--shadow-md);
      transform: translateY(-2px);
      border-color: #cbd5e1;
    }

    .stat-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.5rem;
    }

    .stat-label {
      font-size: 0.8rem;
      font-weight: 600;
      color: #64748b;
    }

    .stat-icon {
      font-size: 1.15rem;
    }

    .stat-val {
      font-family: var(--font-heading);
      font-size: 2rem;
      font-weight: 800;
      line-height: 1.1;
    }

    .blue-text { color: #2563eb; }
    .amber-text { color: #d97706; }
    .red-text { color: #dc2626; }
    .green-text { color: #16a34a; }

    .stat-footer {
      font-size: 0.72rem;
      color: #94a3b8;
      margin-top: 0.4rem;
    }

    .alert-subtext {
      color: #dc2626;
      font-weight: 600;
    }

    .alert-banner-card {
      background: #fff5f5;
      border: 1px solid #fecaca;
      padding: 0.9rem 1.25rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .alert-banner-left {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .bell-circle { font-size: 1.25rem; }

    .alert-banner-left strong {
      color: #991b1b;
      font-size: 0.85rem;
      display: block;
    }

    .alert-banner-left p {
      font-size: 0.75rem;
      color: #b91c1c;
      margin: 0;
    }

    .dashboard-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 1.5rem;
    }

    .content-card {
      padding: 1.25rem;
    }

    .card-header-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1rem;
    }

    .card-header-bar h3 {
      font-size: 1.05rem;
      font-weight: 700;
    }

    .sub-caption {
      font-size: 0.75rem;
      color: #64748b;
    }

    .projects-card-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 1rem;
    }

    .project-tile {
      padding: 1.15rem;
      border: 1px solid var(--border-light);
      cursor: pointer;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      transition: all 0.2s;
    }

    .project-tile:hover {
      border-color: #3b82f6;
      box-shadow: var(--shadow-md);
      transform: translateY(-2px);
    }

    .tile-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 0.5rem;
    }

    .tile-header-pills {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      flex-wrap: wrap;
    }

    .km-pill-mini {
      display: inline-flex;
      align-items: center;
      font-size: 0.65rem;
      font-weight: 700;
      color: #92400e;
      background: #fef3c7;
      border: 1px solid #fde68a;
      padding: 0.1rem 0.4rem;
      border-radius: var(--radius-full);
      white-space: nowrap;
    }

    .tile-title {
      font-weight: 800;
      font-size: 0.95rem;
      color: #0f172a;
    }

    .tile-meta {
      font-size: 0.78rem;
      color: #64748b;
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
    }

    .tile-progress {
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
    }

    .tile-progress-info {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 0.72rem;
    }

    .phase-lifecycle-text {
      color: #64748b;
      font-weight: 600;
    }

    .progress-wrap {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .progress-bar-bg {
      flex: 1;
      height: 6px;
      background: #e2e8f0;
      border-radius: 3px;
      overflow: hidden;
    }

    .progress-bar-fill {
      height: 100%;
      background: #059669;
      border-radius: 3px;
    }

    .progress-num {
      font-size: 0.72rem;
      font-weight: 700;
      color: #475569;
    }

    .btn-tile {
      width: 100%;
    }

    .sm-quick-tasks-list {
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
    }

    .sm-task-chip {
      padding: 0.65rem 0.75rem;
      background: #f8fafc;
      border: 1px solid var(--border-light);
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: all 0.15s;
    }

    .sm-task-chip:hover {
      background: #ffffff;
      border-color: #3b82f6;
    }

    .chip-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
      margin-bottom: 0.25rem;
    }

    .chip-task-name {
      font-weight: 700;
      font-size: 0.825rem;
      color: #0f172a;
    }

    .chip-mid-tags {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      margin-bottom: 0.3rem;
      flex-wrap: wrap;
    }

    .substep-mini {
      font-size: 0.65rem;
      font-weight: 700;
      color: #1d4ed8;
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      padding: 0.05rem 0.35rem;
      border-radius: 3px;
    }

    .km-mini {
      font-size: 0.65rem;
      font-weight: 700;
      color: #c2410c;
      background: #fff7ed;
      border: 1px solid #fed7aa;
      padding: 0.05rem 0.35rem;
      border-radius: 3px;
    }

    .chip-bottom {
      display: flex;
      justify-content: space-between;
      font-size: 0.72rem;
      color: #64748b;
    }

    .side-card-footer {
      margin-top: 1rem;
    }

    .btn-full {
      width: 100%;
    }

    @media (max-width: 992px) {
      .dashboard-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class SmDashboardComponent {
  public pmsService = inject(PmsDataService);

  public get completedTasksCount(): number {
    return this.pmsService.siteManagerTasks().filter(t => t.status === 'Completed').length;
  }

  public get displayQueueTasks() {
    const today = this.pmsService.todayTasks();
    return today.length > 0 ? today.slice(0, 4) : this.pmsService.siteManagerTasks().slice(0, 4);
  }

  public openProject(id: string) {
    this.pmsService.navigateTo('project-detail', id);
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

  public getProjectStatusClass(status: string): string {
    switch (status) {
      case 'In Progress': return 'status-in-progress';
      case 'Completed': return 'status-completed';
      case 'Pending': return 'status-pending';
      case 'Overdue': return 'status-not-started';
      default: return 'status-in-progress';
    }
  }
}
