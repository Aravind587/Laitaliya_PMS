import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PmsDataService } from '../../../services/pms-data.service';
import { Project } from '../../../models/pms.models';

@Component({
  selector: 'app-sm-assigned-projects',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="sm-projects-wrapper animate-fade-in">
      <!-- Section Header -->
      <div class="section-header">
        <div>
          <div class="step-tag">Step 3: View Assigned Projects</div>
          <h2>My Assigned Interior Projects</h2>
          <p class="section-desc">Projects assigned to {{ pmsService.loggedInUser().name }} &bull; Open any site to inspect stages and update daily work</p>
        </div>

        <button class="btn btn-secondary btn-sm" (click)="pmsService.navigateTo('dashboard')">
          &larr; Back to Dashboard
        </button>
      </div>

      <!-- Search Bar -->
      <div class="card search-card">
        <div class="search-box">
          <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input 
            type="text" 
            [(ngModel)]="searchQuery" 
            placeholder="Search projects by client name, building, or location...">
          <button *ngIf="searchQuery" class="clear-btn" (click)="searchQuery = ''">×</button>
        </div>
      </div>

      <!-- Projects Grid (Matching Step 3 in diagram) -->
      <div class="projects-grid">
        <div 
          *ngFor="let p of filteredProjects" 
          class="project-detail-card card"
          (click)="openProject(p.id)">
          <div class="card-top-row">
            <div>
              <h3 class="proj-name">{{ p.name }}</h3>
              <p class="proj-client">Client: <strong>{{ p.client }}</strong></p>
            </div>
            <div class="proj-top-pills">
              <span *ngIf="p.kitchenModel" class="km-pill-mini">🍳 {{ p.kitchenModel }}</span>
              <span class="status-pill" [ngClass]="getProjectStatusClass(p.status)">
                <span class="status-dot"></span>
                {{ p.status }}
              </span>
            </div>
          </div>

          <p class="proj-desc">{{ p.description }}</p>

          <div class="proj-details-row">
            <div class="meta-item">
              <span class="label">Location</span>
              <span>📍 {{ p.location }}</span>
            </div>
            <div class="meta-item">
              <span class="label">Timeline</span>
              <span>{{ p.startDate | slice:5:10 }} &rarr; {{ p.endDate | slice:5:10 }}</span>
            </div>
            <div class="meta-item">
              <span class="label">Budget</span>
              <span>{{ p.budget }}</span>
            </div>
          </div>

          <!-- Progress Bar -->
          <div class="progress-section">
            <div class="progress-label-bar">
              <span>9-Phase Lifecycle Progress</span>
              <strong>{{ p.progressPercent }}%</strong>
            </div>
            <div class="progress-bar-bg">
              <div class="progress-bar-fill" [style.width.%]="p.progressPercent"></div>
            </div>
          </div>

          <div class="card-footer-action">
            <button class="btn btn-primary btn-block" (click)="$event.stopPropagation(); openProject(p.id)">
              Open Project to See 9 Phases &amp; Tasks &rarr;
            </button>
          </div>
        </div>

        <div *ngIf="filteredProjects.length === 0" class="empty-state-full card">
          <p>No assigned projects match your search.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .sm-projects-wrapper {
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

    .search-card {
      padding: 0.75rem 1rem;
    }

    .search-box {
      position: relative;
      display: flex;
      align-items: center;
    }

    .search-icon {
      position: absolute;
      left: 0.75rem;
      color: #94a3b8;
    }

    .search-box input {
      width: 100%;
      padding: 0.55rem 2rem 0.55rem 2.25rem;
      border: 1px solid var(--border-light);
      border-radius: var(--radius-md);
      font-size: 0.875rem;
      background: #f8fafc;
    }

    .clear-btn {
      position: absolute;
      right: 0.75rem;
      color: #94a3b8;
      font-size: 1rem;
    }

    .projects-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 1.25rem;
    }

    .project-detail-card {
      padding: 1.25rem;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
      transition: all 0.2s;
    }

    .project-detail-card:hover {
      border-color: #3b82f6;
      box-shadow: var(--shadow-md);
      transform: translateY(-2px);
    }

    .card-top-row {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 0.75rem;
    }

    .proj-top-pills {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      flex-wrap: wrap;
    }

    .km-pill-mini {
      display: inline-flex;
      align-items: center;
      font-size: 0.68rem;
      font-weight: 700;
      color: #92400e;
      background: #fef3c7;
      border: 1px solid #fde68a;
      padding: 0.15rem 0.45rem;
      border-radius: var(--radius-full);
      white-space: nowrap;
    }

    .proj-name {
      font-size: 1.1rem;
      font-weight: 800;
      color: #0f172a;
    }

    .proj-client {
      font-size: 0.8rem;
      color: #64748b;
    }

    .proj-desc {
      font-size: 0.8rem;
      color: #475569;
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .proj-details-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.5rem;
      padding: 0.65rem 0.75rem;
      background: #f8fafc;
      border-radius: var(--radius-md);
      border: 1px solid var(--border-light);
    }

    .meta-item {
      display: flex;
      flex-direction: column;
      font-size: 0.75rem;
    }

    .meta-item .label {
      font-size: 0.68rem;
      color: #94a3b8;
      text-transform: uppercase;
      font-weight: 700;
    }

    .meta-item span:not(.label) {
      font-weight: 600;
      color: #334155;
    }

    .progress-section {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    .progress-label-bar {
      display: flex;
      justify-content: space-between;
      font-size: 0.75rem;
      color: #64748b;
    }

    .progress-bar-bg {
      height: 7px;
      background: #e2e8f0;
      border-radius: 4px;
      overflow: hidden;
    }

    .progress-bar-fill {
      height: 100%;
      background: #059669;
      border-radius: 4px;
    }

    .btn-block {
      width: 100%;
    }

    .empty-state-full {
      padding: 3rem;
      text-align: center;
      grid-column: 1 / -1;
      color: #64748b;
    }
  `]
})
export class SmAssignedProjectsComponent {
  public pmsService = inject(PmsDataService);
  public searchQuery = '';

  public get filteredProjects(): Project[] {
    const list = this.pmsService.siteManagerProjects();
    if (!this.searchQuery) return list;
    const q = this.searchQuery.toLowerCase();
    return list.filter(p => p.name.toLowerCase().includes(q) || p.client.toLowerCase().includes(q) || p.location.toLowerCase().includes(q));
  }

  public openProject(id: string) {
    this.pmsService.navigateTo('project-detail', id);
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
