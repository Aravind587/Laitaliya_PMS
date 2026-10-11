import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TASK_STATUS_CONFIG, TaskStatus } from '../../models/pms.models';

@Component({
  selector: 'app-status-legend',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer class="legend-container">
      <div class="legend-bar">
        <span class="legend-label">Workflow Status Key:</span>
        <div class="statuses-row">
          <div class="status-item" *ngFor="let key of statusKeys">
            <span class="status-pill" [ngClass]="getStatusClass(key)">
              <span class="status-dot"></span>
              {{ key }}
            </span>
            <span class="status-desc">{{ statusConfig[key].desc }}</span>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .legend-container {
      margin-top: 2rem;
      padding-top: 1rem;
      border-top: 1px solid var(--border-light);
    }

    .legend-bar {
      background: #ffffff;
      border: 1px solid var(--border-light);
      border-radius: var(--radius-md);
      padding: 0.75rem 1.25rem;
      display: flex;
      align-items: center;
      gap: 1.5rem;
      box-shadow: var(--shadow-xs);
      flex-wrap: wrap;
    }

    .legend-label {
      font-size: 0.75rem;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      white-space: nowrap;
    }

    .statuses-row {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      flex-wrap: wrap;
      flex: 1;
    }

    .status-item {
      display: flex;
      align-items: center;
      gap: 0.45rem;
    }

    .status-desc {
      font-size: 0.72rem;
      color: #64748b;
    }

    @media (max-width: 768px) {
      .legend-bar {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.75rem;
      }
    }
  `]
})
export class StatusLegendComponent {
  public statusConfig = TASK_STATUS_CONFIG;
  public statusKeys: TaskStatus[] = [
    'Not Yet Started',
    'Work In Progress',
    'Completed',
    'Pending',
    'Rechecking'
  ];

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
