import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PmsDataService } from '../../../services/pms-data.service';
import { Project, PROJECT_STAGES, STAGES_METADATA, ProjectStage } from '../../../models/pms.models';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-wrapper animate-fade-in">
      <!-- Top Title Bar -->
      <div class="section-header">
        <div>
          <div class="step-tag">Step 2: Admin Dashboard</div>
          <h2>Executive Overview &amp; Control</h2>
          <p class="section-desc">Track real-time progress across all interior design &amp; site execution projects</p>
        </div>

        <div class="header-actions">
          <button class="btn btn-outline" (click)="pmsService.navigateTo('daily-tasks')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            Daily Tasks &amp; Alerts ({{ pmsService.overdueTasks().length }})
          </button>
          <button class="btn btn-primary" (click)="pmsService.navigateTo('create-project')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            + Create New Project
          </button>
        </div>
      </div>

      <!-- Key Stat Cards (Matching diagram: Total: 12, In Progress: 8, Completed: 3, Overdue: 2) -->
      <div class="stats-row">
        <div class="stat-card" (click)="pmsService.navigateTo('projects')">
          <div class="stat-top">
            <span class="stat-label">Total Projects</span>
            <div class="stat-icon slate">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
              </svg>
            </div>
          </div>
          <div class="stat-val">{{ pmsService.totalProjectsCount() }}</div>
          <div class="stat-footer">Active portfolio scope</div>
        </div>

        <div class="stat-card blue" (click)="pmsService.navigateTo('projects')">
          <div class="stat-top">
            <span class="stat-label">In Progress</span>
            <div class="stat-icon blue">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
          </div>
          <div class="stat-val blue-text">{{ pmsService.inProgressProjectsCount() }}</div>
          <div class="stat-footer">On site / drafting</div>
        </div>

        <div class="stat-card green" (click)="pmsService.navigateTo('projects')">
          <div class="stat-top">
            <span class="stat-label">Completed</span>
            <div class="stat-icon green">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
          </div>
          <div class="stat-val green-text">{{ pmsService.completedProjectsCount() }}</div>
          <div class="stat-footer">Handed over to client</div>
        </div>

        <div class="stat-card red" (click)="pmsService.navigateTo('daily-tasks')">
          <div class="stat-top">
            <span class="stat-label">Overdue</span>
            <div class="stat-icon red">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
          </div>
          <div class="stat-val red-text">{{ pmsService.overdueProjectsCount() }}</div>
          <div class="stat-footer alert-subtext">Needs urgent supervisor ping</div>
        </div>
      </div>

      <!-- Quick Alert Banner if forgotten tasks exist -->
      <div *ngIf="pmsService.forgottenTasks().length > 0" class="alert-banner-card card">
        <div class="alert-banner-left">
          <div class="bell-circle">🔔</div>
          <div>
            <strong>{{ pmsService.forgottenTasks().length }} Forgotten Tasks Require Attention</strong>
            <p>Tasks have exceeded due dates or have had no supervisor updates for over 48 hours.</p>
          </div>
        </div>
        <button class="btn btn-danger btn-sm" (click)="pmsService.navigateTo('daily-tasks')">
          Inspect Forgotten Tasks &rarr;
        </button>
      </div>

      <!-- Main Dashboard Grid -->
      <div class="dashboard-grid">
        <!-- Recent Projects Section -->
        <div class="dashboard-main-col">
          <div class="card content-card">
            <div class="card-header-bar">
              <div>
                <h3>Recent Projects</h3>
                <p class="sub-caption">Quick view of ongoing interior contracts</p>
              </div>
              <button class="btn btn-outline btn-sm" (click)="pmsService.navigateTo('projects')">
                View All Projects &rarr;
              </button>
            </div>

            <div class="table-container">
              <table class="pms-table">
                <thead>
                  <tr>
                    <th>Project Name</th>
                    <th>Client</th>
                    <th>Site Manager</th>
                    <th>Status</th>
                    <th>Progress</th>
                    <th class="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let p of pmsService.projects().slice(0, 4)" class="clickable-row" (click)="viewProject(p.id)">
                    <td>
                      <div class="project-cell">
                        <div class="project-name-row">
                          <span class="project-name-text">{{ p.name }}</span>
                          <span *ngIf="p.kitchenModel" class="km-pill-mini">🍳 {{ p.kitchenModel }}</span>
                        </div>
                        <span class="project-loc">{{ p.location }}</span>
                      </div>
                    </td>
                    <td>{{ p.client }}</td>
                    <td>
                      <div class="sm-cell">
                        <span class="sm-dot"></span>
                        {{ p.siteManagerName }}
                      </div>
                    </td>
                    <td>
                      <span class="status-pill" [ngClass]="getProjectStatusClass(p.status)">
                        <span class="status-dot"></span>
                        {{ p.status }}
                      </span>
                    </td>
                    <td>
                      <div class="progress-wrap">
                        <div class="progress-bar-bg">
                          <div class="progress-bar-fill" [style.width.%]="p.progressPercent"></div>
                        </div>
                        <span class="progress-num">{{ p.progressPercent }}%</span>
                      </div>
                    </td>
                    <td class="text-right">
                      <button class="table-view-btn" (click)="$event.stopPropagation(); viewProject(p.id)">
                        View Details &rarr;
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Right Side: Stages Pipeline & Quick Actions -->
        <div class="dashboard-side-col">
          <!-- 9-Phase Execution Pipeline Card -->
          <div class="card content-card">
            <div class="card-header-bar">
              <div>
                <h3>9-Phase Execution Pipeline</h3>
                <p class="sub-caption">Standard Interior Company workflow</p>
              </div>
              <button class="btn btn-outline btn-sm" (click)="pmsService.showFlowGuide.set(true)">
                Flowchart &rarr;
              </button>
            </div>

            <div class="stages-pipeline-list">
              <div 
                *ngFor="let stage of allStages; let idx = index" 
                class="stage-pipeline-item" 
                (click)="filterByStage(stage)">
                <div class="stage-pill-box">
                  <span class="stage-number">0{{ idx + 1 }}</span>
                  <div class="stage-info">
                    <span class="stage-title">{{ stage }}</span>
                    <small>{{ stagesMetadata[stage].flowSummary }}</small>
                  </div>
                </div>
                <span class="stage-task-count">{{ getStageCount(stage) }} Tasks</span>
              </div>
            </div>
          </div>

          <!-- Quick Action Shortcuts -->
          <div class="card content-card quick-actions-card">
            <h3>Quick Actions</h3>
            <div class="quick-btn-grid">
              <button class="quick-btn" (click)="pmsService.navigateTo('create-project')">
                <span class="quick-btn-icon">➕</span>
                <span>New Project</span>
              </button>
              <button class="quick-btn" (click)="pmsService.navigateTo('daily-tasks')">
                <span class="quick-btn-icon">📋</span>
                <span>Daily Tasks</span>
              </button>
              <button class="quick-btn" (click)="pmsService.navigateTo('users-settings')">
                <span class="quick-btn-icon">👥</span>
                <span>Site Managers</span>
              </button>
              <button class="quick-btn" (click)="pmsService.showFlowGuide.set(true)">
                <span class="quick-btn-icon">🗺️</span>
                <span>Flow Diagram</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-wrapper {
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

    .stat-card.blue:hover { border-color: #3b82f6; }
    .stat-card.green:hover { border-color: #10b981; }
    .stat-card.red:hover { border-color: #ef4444; }

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
      width: 32px;
      height: 32px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .stat-icon.slate { background: #f1f5f9; color: #475569; }
    .stat-icon.blue { background: #eff6ff; color: #2563eb; }
    .stat-icon.green { background: #f0fdf4; color: #16a34a; }
    .stat-icon.red { background: #fef2f2; color: #ef4444; }

    .stat-val {
      font-family: var(--font-heading);
      font-size: 2rem;
      font-weight: 800;
      line-height: 1.1;
      color: #0f172a;
    }

    .blue-text { color: #2563eb; }
    .green-text { color: #16a34a; }
    .red-text { color: #dc2626; }

    .stat-footer {
      font-size: 0.72rem;
      color: #94a3b8;
      margin-top: 0.4rem;
    }

    .alert-subtext {
      color: #ef4444;
      font-weight: 600;
    }

    .alert-banner-card {
      background: #fef2f2;
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

    .bell-circle {
      font-size: 1.2rem;
    }

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

    .table-container {
      overflow-x: auto;
    }

    .pms-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }

    .pms-table th {
      font-size: 0.72rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #64748b;
      padding: 0.6rem 0.75rem;
      border-bottom: 1px solid var(--border-light);
      background: #f8fafc;
    }

    .pms-table td {
      padding: 0.85rem 0.75rem;
      font-size: 0.825rem;
      border-bottom: 1px solid var(--border-light);
      vertical-align: middle;
    }

    .clickable-row {
      cursor: pointer;
      transition: background 0.15s;
    }
    .clickable-row:hover {
      background: #f8fafc;
    }

    .project-cell {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
    }

    .project-name-row {
      display: flex;
      align-items: center;
      gap: 0.4rem;
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
      padding: 0.05rem 0.35rem;
      border-radius: var(--radius-full);
      white-space: nowrap;
    }

    .project-name-text {
      font-weight: 700;
      color: #0f172a;
    }

    .project-loc {
      font-size: 0.7rem;
      color: #64748b;
    }

    .sm-cell {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-weight: 500;
    }

    .sm-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #2563eb;
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
      min-width: 60px;
    }

    .progress-bar-fill {
      height: 100%;
      background: #2563eb;
      border-radius: 3px;
    }

    .progress-num {
      font-size: 0.72rem;
      font-weight: 700;
      color: #475569;
    }

    .table-view-btn {
      font-size: 0.75rem;
      font-weight: 600;
      color: #2563eb;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
    }
    .table-view-btn:hover {
      background: #eff6ff;
    }

    .stages-pipeline-list {
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
    }

    .stage-pipeline-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.6rem 0.75rem;
      border: 1px solid var(--border-light);
      border-radius: var(--radius-md);
      background: #f8fafc;
      cursor: pointer;
      transition: all 0.15s;
    }

    .stage-pipeline-item:hover {
      border-color: #3b82f6;
      background: #ffffff;
      box-shadow: var(--shadow-xs);
    }

    .stage-pill-box {
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }

    .stage-number {
      font-size: 0.7rem;
      font-weight: 800;
      color: #2563eb;
      background: #dbeafe;
      padding: 0.2rem 0.4rem;
      border-radius: 4px;
    }

    .stage-info {
      display: flex;
      flex-direction: column;
    }

    .stage-title {
      font-size: 0.8125rem;
      font-weight: 700;
      color: #0f172a;
    }

    .stage-info small {
      font-size: 0.68rem;
      color: #64748b;
    }

    .stage-task-count {
      font-size: 0.72rem;
      font-weight: 700;
      color: #475569;
      background: #e2e8f0;
      padding: 0.2rem 0.5rem;
      border-radius: 9999px;
    }

    .quick-actions-card {
      margin-top: 1rem;
    }

    .quick-actions-card h3 {
      font-size: 0.925rem;
      font-weight: 700;
      margin-bottom: 0.75rem;
    }

    .quick-btn-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.6rem;
    }

    .quick-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.35rem;
      padding: 0.75rem 0.5rem;
      background: #f8fafc;
      border: 1px solid var(--border-light);
      border-radius: var(--radius-md);
      font-size: 0.75rem;
      font-weight: 600;
      color: #334155;
      transition: all 0.15s;
    }

    .quick-btn:hover {
      background: #eff6ff;
      border-color: #bfdbfe;
      color: #1d4ed8;
      transform: translateY(-1px);
    }

    .quick-btn-icon {
      font-size: 1.25rem;
    }

    .text-right {
      text-align: right;
    }

    @media (max-width: 992px) {
      .dashboard-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AdminDashboardComponent {
  public pmsService = inject(PmsDataService);

  public allStages = PROJECT_STAGES;
  public stagesMetadata = STAGES_METADATA;

  public viewProject(projectId: string) {
    this.pmsService.navigateTo('project-detail', projectId);
  }

  public filterByStage(stage: ProjectStage) {
    this.pmsService.selectedStage.set(stage);
    const targetId = this.pmsService.selectedProjectId() || (this.pmsService.projects().length > 0 ? this.pmsService.projects()[0].id : 'p1');
    this.pmsService.navigateTo('project-detail', targetId);
  }

  public getStageCount(stage: string): number {
    return this.pmsService.tasks().filter(t => t.stage === stage).length;
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
