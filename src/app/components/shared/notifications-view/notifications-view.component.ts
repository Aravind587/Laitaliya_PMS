import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PmsDataService } from '../../../services/pms-data.service';
import { NotificationItem } from '../../../models/pms.models';

@Component({
  selector: 'app-notifications-view',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notifications-wrapper animate-fade-in">
      <!-- Section Header -->
      <div class="section-header">
        <div>
          <div class="step-tag">Step 6: Notifications &amp; Alerts</div>
          <h2>Operational Activity Stream</h2>
          <p class="section-desc">Real-time alerts, daily supervisor reminders, and milestone state changes</p>
        </div>

        <div class="header-actions">
          <button class="btn btn-outline btn-sm" (click)="pmsService.markAllNotificationsAsRead()">
            Mark All as Read
          </button>
          <button class="btn btn-secondary btn-sm" (click)="pmsService.navigateTo('dashboard')">
            &larr; Back to Dashboard
          </button>
        </div>
      </div>

      <!-- Filter Controls: All | Unread -->
      <div class="card notifs-container">
        <div class="notifs-header">
          <div class="filter-pills">
            <button 
              class="pill-btn" 
              [class.active]="filter === 'all'" 
              (click)="filter = 'all'">
              All ({{ pmsService.notifications().length }})
            </button>
            <button 
              class="pill-btn" 
              [class.active]="filter === 'unread'" 
              (click)="filter = 'unread'">
              Unread ({{ pmsService.unreadNotificationCount() }})
            </button>
          </div>
        </div>

        <!-- Notification List -->
        <div class="notif-items-list">
          <div 
            *ngFor="let n of filteredNotifications" 
            class="notif-row"
            [class.unread]="!n.read"
            (click)="handleClick(n)">
            <div class="notif-icon-box" [ngClass]="n.type">
              <span *ngIf="n.type === 'overdue'">⚠️</span>
              <span *ngIf="n.type === 'no_update'">⏳</span>
              <span *ngIf="n.type === 'status_updated'">✅</span>
              <span *ngIf="n.type === 'info'">ℹ️</span>
            </div>

            <div class="notif-content">
              <div class="notif-top">
                <span class="notif-title">{{ n.title }}</span>
                <span class="notif-time">{{ n.timeAgo }}</span>
              </div>
              <p class="notif-subtitle">{{ n.subtitle }}</p>
            </div>

            <div class="notif-action-col">
              <span *ngIf="!n.read" class="unread-dot"></span>
              <button class="btn btn-outline btn-sm" (click)="$event.stopPropagation(); handleClick(n)">
                View &rarr;
              </button>
            </div>
          </div>

          <div *ngIf="filteredNotifications.length === 0" class="empty-notifs">
            <span>🔕</span>
            <strong>No notifications here</strong>
            <p>You're all caught up with your interior project tasks!</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .notifications-wrapper {
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
      gap: 0.6rem;
    }

    .notifs-container {
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .notifs-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid var(--border-light);
      padding-bottom: 0.75rem;
    }

    .filter-pills {
      display: flex;
      gap: 0.5rem;
    }

    .pill-btn {
      font-size: 0.78rem;
      font-weight: 700;
      padding: 0.35rem 0.85rem;
      border-radius: var(--radius-full);
      background: #f1f5f9;
      color: #64748b;
      transition: all 0.15s;
    }

    .pill-btn.active {
      background: #eff6ff;
      color: #1d4ed8;
      border: 1px solid #bfdbfe;
    }

    .notif-items-list {
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
    }

    .notif-row {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.85rem 1rem;
      border: 1px solid var(--border-light);
      border-radius: var(--radius-md);
      background: #ffffff;
      cursor: pointer;
      transition: all 0.15s;
    }

    .notif-row:hover {
      background: #f8fafc;
      border-color: #cbd5e1;
    }

    .notif-row.unread {
      background: #f0f7ff;
      border-color: #bfdbfe;
    }

    .notif-icon-box {
      width: 38px;
      height: 38px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
      flex-shrink: 0;
    }
    .notif-icon-box.overdue { background: #fee2e2; }
    .notif-icon-box.no_update { background: #fef3c7; }
    .notif-icon-box.status_updated { background: #dcfce7; }
    .notif-icon-box.info { background: #dbeafe; }

    .notif-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
    }

    .notif-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .notif-title {
      font-weight: 700;
      font-size: 0.875rem;
      color: #0f172a;
    }

    .notif-time {
      font-size: 0.72rem;
      color: #94a3b8;
    }

    .notif-subtitle {
      font-size: 0.8rem;
      color: #475569;
      margin: 0;
    }

    .notif-action-col {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .unread-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #2563eb;
    }

    .empty-notifs {
      padding: 3rem;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      color: #64748b;
    }

    .empty-notifs span { font-size: 2rem; }
  `]
})
export class NotificationsViewComponent {
  public pmsService = inject(PmsDataService);
  public filter: 'all' | 'unread' = 'all';

  public get filteredNotifications(): NotificationItem[] {
    const list = this.pmsService.notifications();
    if (this.filter === 'unread') return list.filter(n => !n.read);
    return list;
  }

  public handleClick(n: NotificationItem) {
    this.pmsService.markNotificationAsRead(n.id);
    if (n.projectId) {
      this.pmsService.navigateTo('project-detail', n.projectId);
    } else {
      this.pmsService.navigateTo('daily-tasks');
    }
  }
}
