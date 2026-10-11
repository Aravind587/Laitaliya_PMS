import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PmsDataService } from '../../../services/pms-data.service';
import { Project } from '../../../models/pms.models';

@Component({
  selector: 'app-admin-projects-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="projects-list-wrapper animate-fade-in">
      <!-- Section Header -->
      <div class="section-header">
        <div>
          <div class="step-tag">Step 4: Manage Projects &amp; Tasks</div>
          <h2>Projects Directory &amp; Governance</h2>
          <p class="section-desc">Search, filter, and inspect detailed stages &amp; task milestones for every site</p>
        </div>

        <button class="btn btn-primary" (click)="pmsService.navigateTo('create-project')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          + New Project
        </button>
      </div>

      <!-- Search & Filter Controls -->
      <div class="card filters-card">
        <div class="filter-controls-row">
          <div class="search-box">
            <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input 
              type="text" 
              [(ngModel)]="searchQuery" 
              placeholder="Search projects by name, client, or location...">
            <button *ngIf="searchQuery" class="clear-btn" (click)="searchQuery = ''">×</button>
          </div>

          <div class="filters-group">
            <div class="filter-item">
              <label>Status:</label>
              <select [(ngModel)]="statusFilter">
                <option value="ALL">All Statuses</option>
                <option value="In Progress">In Progress</option>
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>

            <div class="filter-item">
              <label>Site Manager:</label>
              <select [(ngModel)]="siteManagerFilter">
                <option value="ALL">All Managers</option>
                <option *ngFor="let u of siteManagers" [value]="u.name">{{ u.name }}</option>
              </select>
            </div>

            <div class="filter-item">
              <label>Kitchen Model:</label>
              <select [(ngModel)]="kitchenModelFilter">
                <option value="ALL">All Kitchen Models</option>
                <option value="Dry Kitchen">🍳 Dry Kitchen</option>
                <option value="Wet Kitchen">🍳 Wet Kitchen</option>
                <option value="Utility Kitchen">🍳 Utility Kitchen</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Filter Quick Tabs -->
        <div class="status-quick-pills">
          <button 
            class="filter-pill" 
            [class.active]="statusFilter === 'ALL'" 
            (click)="statusFilter = 'ALL'">
            All ({{ pmsService.projects().length }})
          </button>
          <button 
            class="filter-pill" 
            [class.active]="statusFilter === 'In Progress'" 
            (click)="statusFilter = 'In Progress'">
            In Progress ({{ pmsService.inProgressProjectsCount() }})
          </button>
          <button 
            class="filter-pill" 
            [class.active]="statusFilter === 'Pending'" 
            (click)="statusFilter = 'Pending'">
            Pending ({{ pmsService.pendingProjectsCount() }})
          </button>
          <button 
            class="filter-pill" 
            [class.active]="statusFilter === 'Completed'" 
            (click)="statusFilter = 'Completed'">
            Completed ({{ pmsService.completedProjectsCount() }})
          </button>
          <button 
            class="filter-pill pill-alert" 
            [class.active]="statusFilter === 'Overdue'" 
            (click)="statusFilter = 'Overdue'">
            Overdue ({{ pmsService.overdueProjectsCount() }})
          </button>
        </div>
      </div>

      <!-- Projects Table (Step 4 Grid) -->
      <div class="card table-card">
        <div class="table-container">
          <table class="pms-table">
            <thead>
              <tr>
                <th>Project Name</th>
                <th>Client</th>
                <th>Location</th>
                <th>Site Manager</th>
                <th>Timeline</th>
                <th>Status</th>
                <th>Progress</th>
                <th class="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let p of filteredProjects" class="clickable-row" (click)="openProject(p.id)">
                <td>
                  <div class="project-identity">
                    <span class="project-title">{{ p.name }}</span>
                    <div class="project-pills-row">
                      <span class="project-id-badge">ID: {{ p.id.toUpperCase() }}</span>
                      <span *ngIf="p.kitchenModel" class="km-badge-mini">🍳 {{ p.kitchenModel }}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <span class="client-text">{{ p.client }}</span>
                </td>
                <td>
                  <span class="location-text">📍 {{ p.location }}</span>
                </td>
                <td>
                  <div class="sm-badge">
                    <span class="sm-avatar-circle">{{ getInitials(p.siteManagerName) }}</span>
                    <span>{{ p.siteManagerName }}</span>
                  </div>
                </td>
                <td>
                  <span class="timeline-text">{{ p.startDate | slice:5:10 }} &rarr; {{ p.endDate | slice:5:10 }}</span>
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
                  <div class="action-buttons-group" (click)="$event.stopPropagation()">
                    <button class="btn btn-outline btn-sm" (click)="openProject(p.id)" title="View Stages & Tasks">
                      View Stages &amp; Tasks &rarr;
                    </button>
                  </div>
                </td>
              </tr>

              <tr *ngIf="filteredProjects.length === 0">
                <td colspan="8" class="empty-state-cell">
                  <div class="empty-state">
                    <span class="empty-icon">🔍</span>
                    <strong>No projects matched your search criteria</strong>
                    <p>Try clearing filters or search query to view all projects</p>
                    <button class="btn btn-secondary btn-sm" (click)="resetFilters()">Clear Filters</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .projects-list-wrapper {
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

    .filters-card {
      padding: 1rem 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
    }

    .filter-controls-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .search-box {
      position: relative;
      flex: 1;
      min-width: 260px;
      display: flex;
      align-items: center;
    }

    .search-icon {
      position: absolute;
      left: 0.85rem;
      color: #94a3b8;
    }

    .search-box input {
      width: 100%;
      padding: 0.55rem 2rem 0.55rem 2.4rem;
      border: 1px solid var(--border-light);
      border-radius: var(--radius-md);
      background: #f8fafc;
      font-size: 0.85rem;
      transition: all 0.2s;
    }

    .search-box input:focus {
      background: #ffffff;
      border-color: var(--color-primary-blue);
      outline: none;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    }

    .clear-btn {
      position: absolute;
      right: 0.75rem;
      font-size: 1rem;
      color: #94a3b8;
    }

    .filters-group {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .filter-item {
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }

    .filter-item label {
      font-size: 0.75rem;
      font-weight: 600;
      color: #475569;
    }

    .filter-item select {
      padding: 0.45rem 0.75rem;
      border: 1px solid var(--border-light);
      border-radius: var(--radius-md);
      background: #ffffff;
      font-size: 0.8rem;
    }

    .status-quick-pills {
      display: flex;
      gap: 0.5rem;
      overflow-x: auto;
      padding-top: 0.25rem;
    }

    .filter-pill {
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.3rem 0.75rem;
      border-radius: var(--radius-full);
      background: #f1f5f9;
      color: #475569;
      border: 1px solid transparent;
      transition: all 0.15s;
    }

    .filter-pill:hover {
      background: #e2e8f0;
    }

    .filter-pill.active {
      background: #eff6ff;
      color: #1d4ed8;
      border-color: #bfdbfe;
    }

    .filter-pill.pill-alert.active {
      background: #fef2f2;
      color: #dc2626;
      border-color: #fecaca;
    }

    .table-card {
      overflow: hidden;
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
      padding: 0.75rem 1rem;
      border-bottom: 1px solid var(--border-light);
      background: #f8fafc;
    }

    .pms-table td {
      padding: 0.9rem 1rem;
      font-size: 0.85rem;
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

    .project-identity {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
    }

    .project-pills-row {
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }

    .project-title {
      font-weight: 700;
      color: #0f172a;
    }

    .project-id-badge {
      font-size: 0.65rem;
      color: #94a3b8;
      font-family: monospace;
    }

    .km-badge-mini {
      font-size: 0.65rem;
      font-weight: 700;
      color: #c2410c;
      background: #fff7ed;
      border: 1px solid #fed7aa;
      padding: 0.05rem 0.35rem;
      border-radius: 3px;
    }

    .client-text {
      font-weight: 600;
      color: #334155;
    }

    .location-text {
      font-size: 0.78rem;
      color: #64748b;
    }

    .sm-badge {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 600;
    }

    .sm-avatar-circle {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: #e0e7ff;
      color: #3730a3;
      font-size: 0.65rem;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .timeline-text {
      font-size: 0.78rem;
      color: #64748b;
      white-space: nowrap;
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

    .action-buttons-group {
      display: flex;
      justify-content: flex-end;
    }

    .empty-state-cell {
      padding: 3rem !important;
      text-align: center;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
    }

    .empty-icon {
      font-size: 2rem;
    }

    .empty-state strong {
      font-size: 0.95rem;
      color: #0f172a;
    }

    .empty-state p {
      font-size: 0.8rem;
      color: #64748b;
    }

    .text-right {
      text-align: right;
    }
  `]
})
export class AdminProjectsListComponent {
  public pmsService = inject(PmsDataService);

  public searchQuery = '';
  public statusFilter = 'ALL';
  public siteManagerFilter = 'ALL';
  public kitchenModelFilter = 'ALL';

  public get siteManagers() {
    return this.pmsService.users().filter(u => u.role === 'Site Manager');
  }

  public get filteredProjects(): Project[] {
    return this.pmsService.projects().filter(p => {
      const matchesSearch = 
        !this.searchQuery ||
        p.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        p.client.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        p.location.toLowerCase().includes(this.searchQuery.toLowerCase());

      const matchesStatus = this.statusFilter === 'ALL' || p.status === this.statusFilter;
      const matchesSm = this.siteManagerFilter === 'ALL' || p.siteManagerName.toLowerCase().includes(this.siteManagerFilter.toLowerCase());
      const matchesKitchen = this.kitchenModelFilter === 'ALL' || p.kitchenModel === this.kitchenModelFilter;

      return matchesSearch && matchesStatus && matchesSm && matchesKitchen;
    });
  }

  public openProject(projectId: string) {
    this.pmsService.navigateTo('project-detail', projectId);
  }

  public resetFilters() {
    this.searchQuery = '';
    this.statusFilter = 'ALL';
    this.siteManagerFilter = 'ALL';
    this.kitchenModelFilter = 'ALL';
  }

  public getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
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
