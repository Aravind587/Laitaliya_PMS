import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PmsDataService } from '../../../services/pms-data.service';
import { Task, TaskStatus, TASK_STATUS_CONFIG } from '../../../models/pms.models';

@Component({
  selector: 'app-daily-tasks',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="daily-tasks-wrapper animate-fade-in">
      <!-- Section Header -->
      <div class="section-header">
        <div>
          <div class="step-tag">
            {{ pmsService.userRole() === 'admin' ? 'Step 6: Admin Daily Tasks & Alerts' : 'Step 5: Site Manager Daily Tasks' }}
          </div>
          <h2>Today's Operations &amp; Task Alerts</h2>
          <p class="section-desc">Monitor daily task queue, track forgotten site milestones, and resolve overdue activities</p>
        </div>

        <div class="header-actions">
          <button class="btn btn-secondary btn-sm" (click)="pmsService.navigateTo('dashboard')">
            &larr; Back to Dashboard
          </button>
        </div>
      </div>

      <!-- Today's Overview Counters (Matching diagram: Overdue 3, Today 5, Upcoming 4) -->
      <div class="counters-grid">
        <div 
          class="overview-counter-card overdue-box" 
          [class.active]="activeTab === 'overdue'"
          (click)="activeTab = 'overdue'">
          <div class="counter-header">
            <span class="counter-label">Overdue</span>
            <div class="counter-badge red">Urgent</div>
          </div>
          <div class="counter-number red-text">{{ pmsService.overdueTasks().length }}</div>
          <div class="counter-sub">Exceeded milestone dates</div>
        </div>

        <div 
          class="overview-counter-card today-box" 
          [class.active]="activeTab === 'today'"
          (click)="activeTab = 'today'">
          <div class="counter-header">
            <span class="counter-label">Today's Tasks</span>
            <div class="counter-badge amber">Active</div>
          </div>
          <div class="counter-number amber-text">{{ pmsService.todayTasks().length }}</div>
          <div class="counter-sub">Scheduled for 15-16 Sep</div>
        </div>

        <div 
          class="overview-counter-card upcoming-box" 
          [class.active]="activeTab === 'upcoming'"
          (click)="activeTab = 'upcoming'">
          <div class="counter-header">
            <span class="counter-label">Upcoming</span>
            <div class="counter-badge blue">Next 7 Days</div>
          </div>
          <div class="counter-number blue-text">{{ pmsService.upcomingTasks().length }}</div>
          <div class="counter-sub">Next scheduled deliverables</div>
        </div>
      </div>

      <!-- Forgotten Tasks / Alerts Card (Matching diagram highlight) -->
      <div *ngIf="pmsService.forgottenTasks().length > 0" class="forgotten-alerts-card card">
        <div class="alerts-card-header">
          <div class="alerts-header-left">
            <div class="pulse-icon">🔔</div>
            <div>
              <h3>Forgotten Tasks / Critical Alerts</h3>
              <p class="alerts-sub">
                <strong>{{ pmsService.forgottenTasks().length }} tasks need attention</strong> &bull; Stalled site tasks or missing daily supervisor updates
              </p>
            </div>
          </div>
          <span class="badge-urgent">Action Required</span>
        </div>

        <div class="forgotten-tasks-list">
          <div *ngFor="let ft of pmsService.forgottenTasks()" class="forgotten-task-row">
            <div class="ft-left">
              <span class="alert-indicator-dot"></span>
              <div class="ft-meta">
                <span class="ft-task-name">{{ ft.name }}</span>
                <span class="ft-proj-sub">Project: <strong>{{ ft.projectName }}</strong> &bull; Stage: {{ ft.stage }}</span>
                <div class="ft-warning-text">
                  <span *ngIf="ft.overdueDays">Overdue by {{ ft.overdueDays }} days without progress log</span>
                  <span *ngIf="ft.noUpdateDays">No update received from supervisor for {{ ft.noUpdateDays }} days</span>
                </div>
              </div>
            </div>

            <div class="ft-actions">
              <button class="btn btn-outline btn-sm" (click)="resolveTask(ft.id, 'ping')">
                Ping Site Manager
              </button>
              <button class="btn btn-success btn-sm" (click)="resolveTask(ft.id, 'mark-in-progress')">
                Mark In Progress
              </button>
              <button class="btn btn-secondary btn-sm" (click)="resolveTask(ft.id, 'reschedule')">
                Reschedule
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Tasks Section with Filter Tabs: Today | Overdue | Upcoming -->
      <div class="card tasks-list-card">
        <div class="tasks-card-header">
          <div class="tabs-switcher">
            <button 
              class="tab-pill" 
              [class.active]="activeTab === 'today'" 
              (click)="activeTab = 'today'">
              Today ({{ pmsService.todayTasks().length }})
            </button>
            <button 
              class="tab-pill" 
              [class.active]="activeTab === 'overdue'" 
              (click)="activeTab = 'overdue'">
              Overdue ({{ pmsService.overdueTasks().length }})
            </button>
            <button 
              class="tab-pill" 
              [class.active]="activeTab === 'upcoming'" 
              (click)="activeTab = 'upcoming'">
              Upcoming ({{ pmsService.upcomingTasks().length }})
            </button>
          </div>

          <div class="tasks-legend-hint">
            <span>Click <strong>Update Status</strong> to set any of the 5 statuses</span>
          </div>
        </div>

        <!-- Task Table matching Step 5 Site Manager & Step 6 Admin -->
        <div class="table-container">
          <table class="pms-table">
            <thead>
              <tr>
                <th>Task</th>
                <th>Project</th>
                <th>Status</th>
                <th>Due Date</th>
                <th>Site Manager / Remarks</th>
                <th class="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let t of currentTabTasks" class="task-table-row">
                <td>
                  <div class="task-title-cell">
                    <span class="task-cell-name">{{ t.name }}</span>
                    <div class="task-cell-tags">
                      <span class="stage-tag-sub">{{ t.stage }}</span>
                      <span *ngIf="t.subStep" class="substep-tag-sub">Step: {{ t.subStep }}</span>
                      <span *ngIf="t.kitchenModel" class="km-tag-sub">🍳 {{ t.kitchenModel }}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="proj-cell">
                    <span class="proj-title">{{ t.projectName }}</span>
                  </div>
                </td>
                <td>
                  <span class="status-pill" [ngClass]="getStatusClass(t.status)">
                    <span class="status-dot"></span>
                    {{ t.status }}
                  </span>
                </td>
                <td>
                  <span class="due-cell" [class.due-alert]="activeTab === 'overdue'">
                    📅 {{ t.dueDate }}
                  </span>
                </td>
                <td>
                  <div class="remarks-box">
                    <span>{{ t.remarks || 'No notes' }}</span>
                    <small *ngIf="t.assignedToName">Supervisor: {{ t.assignedToName }}</small>
                  </div>
                </td>
                <td class="text-right">
                  <button class="btn btn-primary btn-sm" (click)="openQuickUpdate(t)">
                    Update Status
                  </button>
                </td>
              </tr>

              <tr *ngIf="currentTabTasks.length === 0">
                <td colspan="6" class="empty-tasks-cell">
                  <div class="empty-pane">
                    <span>🎉</span>
                    <strong>No tasks in this category!</strong>
                    <p>All items for this timeframe have been resolved or completed.</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Quick Update Modal -->
      <div *ngIf="showModal && selectedTask" class="modal-overlay" (click)="showModal = false">
        <div class="modal-dialog" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div>
              <h3>Update Task Status</h3>
              <p class="modal-subtitle">{{ selectedTask.name }} &bull; {{ selectedTask.projectName }}</p>
            </div>
            <button class="close-btn" (click)="showModal = false">×</button>
          </div>

          <div class="modal-body">
            <div class="form-group">
              <label>Set Task Status (5 Options):</label>
              <div class="status-modal-grid">
                <div 
                  *ngFor="let s of statusOptions"
                  class="status-choice-card"
                  [class.selected]="modalStatus === s"
                  (click)="modalStatus = s">
                  <span class="status-pill" [ngClass]="getStatusClass(s)">
                    <span class="status-dot"></span>
                    {{ s }}
                  </span>
                  <small>{{ statusConfig[s].desc }}</small>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label>Site Progress Notes / Supervisor Remarks:</label>
              <textarea 
                rows="3" 
                [(ngModel)]="modalRemarks" 
                placeholder="Describe current status, material arrival, or inspection results..."></textarea>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="showModal = false">Cancel</button>
            <button class="btn btn-primary" (click)="saveQuickUpdate()">Save Update</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .daily-tasks-wrapper {
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

    .counters-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1rem;
    }

    .overview-counter-card {
      background: #ffffff;
      border: 1px solid var(--border-light);
      border-radius: var(--radius-lg);
      padding: 1.25rem;
      box-shadow: var(--shadow-xs);
      cursor: pointer;
      transition: all 0.2s;
    }

    .overview-counter-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }

    .overview-counter-card.active {
      border-color: #3b82f6;
      background: #f8fafc;
      box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
    }

    .counter-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.5rem;
    }

    .counter-label {
      font-size: 0.825rem;
      font-weight: 700;
      color: #475569;
    }

    .counter-badge {
      font-size: 0.65rem;
      font-weight: 800;
      padding: 0.15rem 0.45rem;
      border-radius: 4px;
      text-transform: uppercase;
    }
    .counter-badge.red { background: #fee2e2; color: #dc2626; }
    .counter-badge.amber { background: #fef3c7; color: #d97706; }
    .counter-badge.blue { background: #dbeafe; color: #2563eb; }

    .counter-number {
      font-family: var(--font-heading);
      font-size: 2.25rem;
      font-weight: 800;
      line-height: 1.1;
    }

    .red-text { color: #dc2626; }
    .amber-text { color: #d97706; }
    .blue-text { color: #2563eb; }

    .counter-sub {
      font-size: 0.72rem;
      color: #94a3b8;
      margin-top: 0.35rem;
    }

    .forgotten-alerts-card {
      background: #fff5f5;
      border: 1.5px solid #fecaca;
      padding: 1.25rem;
      border-radius: var(--radius-lg);
    }

    .alerts-card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid #fee2e2;
    }

    .alerts-header-left {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .pulse-icon {
      font-size: 1.5rem;
    }

    .alerts-card-header h3 {
      font-size: 1.05rem;
      font-weight: 800;
      color: #991b1b;
      line-height: 1.2;
    }

    .alerts-sub {
      font-size: 0.78rem;
      color: #b91c1c;
      margin: 0;
    }

    .badge-urgent {
      background: #dc2626;
      color: white;
      font-size: 0.7rem;
      font-weight: 800;
      padding: 0.25rem 0.6rem;
      border-radius: var(--radius-full);
      text-transform: uppercase;
    }

    .forgotten-tasks-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .forgotten-task-row {
      background: #ffffff;
      border: 1px solid #fecaca;
      border-radius: var(--radius-md);
      padding: 0.85rem 1rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .ft-left {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
    }

    .alert-indicator-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #dc2626;
      margin-top: 5px;
      flex-shrink: 0;
    }

    .ft-meta {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
    }

    .ft-task-name {
      font-weight: 800;
      font-size: 0.9rem;
      color: #0f172a;
    }

    .ft-proj-sub {
      font-size: 0.75rem;
      color: #475569;
    }

    .ft-warning-text {
      font-size: 0.75rem;
      font-weight: 700;
      color: #dc2626;
    }

    .ft-actions {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .tasks-list-card {
      padding: 1.25rem;
    }

    .tasks-card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1rem;
      flex-wrap: wrap;
      gap: 0.75rem;
    }

    .tabs-switcher {
      display: flex;
      gap: 0.4rem;
      background: #f1f5f9;
      padding: 3px;
      border-radius: var(--radius-md);
    }

    .tab-pill {
      font-size: 0.78rem;
      font-weight: 700;
      padding: 0.45rem 0.85rem;
      border-radius: var(--radius-sm);
      color: #64748b;
      transition: all 0.15s;
    }

    .tab-pill.active {
      background: #ffffff;
      color: #0f172a;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
    }

    .tasks-legend-hint {
      font-size: 0.75rem;
      color: #64748b;
    }

    .task-title-cell {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
    }

    .task-cell-name {
      font-weight: 700;
      color: #0f172a;
    }

    .task-cell-tags {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      flex-wrap: wrap;
    }

    .stage-tag-sub {
      font-size: 0.68rem;
      color: #64748b;
      background: #f1f5f9;
      padding: 0.1rem 0.35rem;
      border-radius: 3px;
      width: fit-content;
    }

    .substep-tag-sub {
      font-size: 0.68rem;
      color: #1d4ed8;
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      padding: 0.1rem 0.35rem;
      border-radius: 3px;
      font-weight: 700;
    }

    .km-tag-sub {
      font-size: 0.68rem;
      color: #c2410c;
      background: #fff7ed;
      border: 1px solid #fed7aa;
      padding: 0.1rem 0.35rem;
      border-radius: 3px;
      font-weight: 700;
    }

    .proj-cell {
      display: flex;
      flex-direction: column;
    }

    .proj-title {
      font-weight: 600;
      color: #334155;
    }

    .due-cell {
      font-size: 0.8rem;
      font-weight: 600;
      color: #475569;
      white-space: nowrap;
    }

    .due-cell.due-alert {
      color: #dc2626;
      font-weight: 700;
    }

    .remarks-box {
      font-size: 0.78rem;
      color: #475569;
      display: flex;
      flex-direction: column;
    }

    .remarks-box small {
      font-size: 0.68rem;
      color: #94a3b8;
    }

    .empty-tasks-cell {
      text-align: center;
      padding: 3rem !important;
    }

    .empty-pane {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.35rem;
    }

    .empty-pane span { font-size: 2rem; }
    .empty-pane strong { font-size: 0.95rem; color: #0f172a; }
    .empty-pane p { font-size: 0.78rem; color: #64748b; }

    /* Modal */
    .status-modal-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 0.5rem;
      margin-top: 0.5rem;
    }

    .status-choice-card {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.6rem 0.85rem;
      border: 1px solid var(--border-light);
      border-radius: var(--radius-md);
      cursor: pointer;
      background: #f8fafc;
      transition: all 0.15s;
    }

    .status-choice-card.selected {
      border-color: #2563eb;
      background: #eff6ff;
    }

    .modal-subtitle {
      font-size: 0.78rem;
      color: #64748b;
    }

    .close-btn {
      font-size: 1.25rem;
      color: #94a3b8;
    }

    .text-right {
      text-align: right;
    }
  `]
})
export class DailyTasksComponent {
  public pmsService = inject(PmsDataService);

  public activeTab: 'today' | 'overdue' | 'upcoming' = 'today';
  public statusConfig = TASK_STATUS_CONFIG;
  public statusOptions: TaskStatus[] = [
    'Not Yet Started',
    'Work In Progress',
    'Completed',
    'Pending',
    'Rechecking'
  ];

  public showModal = false;
  public selectedTask: Task | null = null;
  public modalStatus: TaskStatus = 'Work In Progress';
  public modalRemarks = '';

  public get currentTabTasks(): Task[] {
    switch (this.activeTab) {
      case 'today': return this.pmsService.todayTasks();
      case 'overdue': return this.pmsService.overdueTasks();
      case 'upcoming': return this.pmsService.upcomingTasks();
    }
  }

  public resolveTask(taskId: string, action: 'ping' | 'mark-in-progress' | 'reschedule') {
    this.pmsService.resolveForgottenTask(taskId, action);
    if (action === 'ping') {
      alert('Supervisor notified: Ping dispatched to site manager regarding delayed milestone.');
    } else if (action === 'mark-in-progress') {
      alert('Task resumed: Status set to "Work In Progress" and removed from alerts.');
    } else {
      alert('Rescheduled: Milestone due date updated on project schedule.');
    }
  }

  public openQuickUpdate(task: Task) {
    this.selectedTask = task;
    this.modalStatus = task.status;
    this.modalRemarks = task.remarks || '';
    this.showModal = true;
  }

  public saveQuickUpdate() {
    if (!this.selectedTask) return;
    this.pmsService.updateTaskStatus(this.selectedTask.id, this.modalStatus, this.modalRemarks);
    this.showModal = false;
    this.selectedTask = null;
  }

  public getStatusClass(status: TaskStatus): string {
    switch (status) {
      case 'Not Yet Started': return 'status-not-started';
      case 'Work In Progress': return 'status-in-progress';
      case 'Completed': return 'status-completed';
      case 'Pending': return 'status-pending';
      case 'Rechecking': return 'status-rechecking';
    }
  }
}
