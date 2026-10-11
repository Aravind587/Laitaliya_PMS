import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PmsDataService } from '../../../services/pms-data.service';
import { Project, KitchenModel } from '../../../models/pms.models';

@Component({
  selector: 'app-admin-create-project',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="create-project-wrapper animate-fade-in">
      <div class="section-header">
        <div>
          <div class="step-tag">Step 3: Create New Project</div>
          <h2>Initiate Interior Project Contract</h2>
          <p class="section-desc">Define scope, assign dedicated site manager, and configure initial milestone timeline</p>
        </div>
        <button class="btn btn-secondary" (click)="pmsService.navigateTo('projects')">
          &larr; Back to Projects
        </button>
      </div>

      <div class="form-layout-grid">
        <!-- Form Column -->
        <div class="card form-card">
          <div class="card-title-bar">
            <h3>Project Details Form</h3>
            <span class="required-note">* Mandatory fields</span>
          </div>

          <form (submit)="onSubmit($event)">
            <div class="form-group">
              <label>Project Name *</label>
              <input 
                type="text" 
                [(ngModel)]="name" 
                name="name" 
                placeholder="e.g. Living Room Interiors, Penthouse 402" 
                required>
            </div>

            <div class="form-row-2">
              <div class="form-group">
                <label>Client Name *</label>
                <input 
                  type="text" 
                  [(ngModel)]="client" 
                  name="client" 
                  placeholder="e.g. ABC Constructions / Dr. Rao" 
                  required>
              </div>

              <div class="form-group">
                <label>Location *</label>
                <input 
                  type="text" 
                  [(ngModel)]="location" 
                  name="location" 
                  placeholder="e.g. Rajahmundry, Visakhapatnam" 
                  required>
              </div>
            </div>

            <div class="form-row-2">
              <div class="form-group">
                <label>Start Date</label>
                <input 
                  type="date" 
                  [(ngModel)]="startDate" 
                  name="startDate">
              </div>

              <div class="form-group">
                <label>End Date (Target Delivery)</label>
                <input 
                  type="date" 
                  [(ngModel)]="endDate" 
                  name="endDate">
              </div>
            </div>

            <div class="form-group">
              <label>Assign Site Manager *</label>
              <select [(ngModel)]="siteManagerId" name="siteManagerId" required>
                <option value="" disabled selected>Select Site Manager</option>
                <option *ngFor="let u of siteManagers" [value]="u.id">
                  {{ u.name }} ({{ u.role }}) - {{ u.assignedProjectsCount }} active projects
                </option>
              </select>
            </div>

            <div class="form-row-2">
              <div class="form-group">
                <label>Estimated Budget</label>
                <input 
                  type="text" 
                  [(ngModel)]="budget" 
                  name="budget" 
                  placeholder="e.g. ₹ 25,00,000">
              </div>

              <div class="form-group">
                <label>Design Package</label>
                <select [(ngModel)]="packageType" name="packageType">
                  <option value="Luxury Turnkey">Luxury Turnkey Interior</option>
                  <option value="Modular Woodwork">Modular Woodwork &amp; Kitchen</option>
                  <option value="Renovation">Commercial Workspace Fitout</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label>Kitchen Workflow Model * (Phase 8 Specification)</label>
              <select [(ngModel)]="kitchenModel" name="kitchenModel" required>
                <option value="Dry Kitchen">Dry Kitchen (Island &amp; Breakfast Counter)</option>
                <option value="Wet Kitchen">Wet Kitchen (Heavy Cooking &amp; Deep Sink)</option>
                <option value="Utility Kitchen">Utility Kitchen (Washing Area, Pantry &amp; Tall Cabinets)</option>
              </select>
            </div>

            <div class="form-group">
              <label>Project Scope &amp; Special Client Remarks</label>
              <textarea 
                rows="3" 
                [(ngModel)]="description" 
                name="description" 
                placeholder="e.g. Custom fluted panelling, imported tile sourcing, automated lighting fixtures..."></textarea>
            </div>

            <div class="form-footer">
              <button type="button" class="btn btn-secondary" (click)="resetForm()">
                Reset
              </button>
              <button type="submit" class="btn btn-primary">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Create Project
              </button>
            </div>
          </form>
        </div>

        <!-- Right Side: Flow Visualization / Success Feedback -->
        <div class="side-info-col">
          <!-- Success Notification Card (Shown after creation - matching image) -->
          <div *ngIf="lastCreatedProject" class="success-feedback-card animate-fade-in card">
            <div class="success-icon-circle">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <h4>Project Created Successfully!</h4>
            <p class="success-caption">
              Assigned Site Manager &rarr; <strong>{{ lastCreatedProject.siteManagerName }}</strong><br>
              Kitchen Model: <strong>{{ lastCreatedProject.kitchenModel || 'Dry Kitchen' }}</strong><br>
              Project is successfully added to system with all 9 sequential execution phases and sub-step tasks.
            </p>

            <div class="success-actions">
              <button class="btn btn-primary btn-sm" (click)="viewProjectStages(lastCreatedProject.id)">
                View 9 Stages &amp; Tasks &rarr;
              </button>
              <button class="btn btn-outline btn-sm" (click)="pmsService.navigateTo('projects')">
                Manage Projects
              </button>
            </div>
          </div>

          <!-- Step 3 Info Card -->
          <div class="card info-box">
            <h4>What happens next?</h4>
            <ul class="info-list">
              <li>
                <div class="info-bullet">1</div>
                <div>
                  <strong>Automatic 9-Phase Lifecycle Template</strong>
                  <p>Sales, Design, Production, False Ceiling, Civil, Manual Finishing, Modular Assembly, Kitchen Workflow (Dry/Wet/Utility), and Finishing Flow tasks are automatically provisioned.</p>
                </div>
              </li>
              <li>
                <div class="info-bullet">2</div>
                <div>
                  <strong>Site Manager Notification</strong>
                  <p>The assigned supervisor receives real-time portal access to track daily milestones.</p>
                </div>
              </li>
              <li>
                <div class="info-bullet">3</div>
                <div>
                  <strong>Client Milestone Tracker</strong>
                  <p>Live progress percentage syncs as each task moves from Work In Progress to Completed.</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .create-project-wrapper {
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

    .form-layout-grid {
      display: grid;
      grid-template-columns: 1.7fr 1fr;
      gap: 1.5rem;
    }

    .form-card {
      padding: 1.5rem;
    }

    .card-title-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.25rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid var(--border-light);
    }

    .card-title-bar h3 {
      font-size: 1.1rem;
      font-weight: 700;
    }

    .required-note {
      font-size: 0.75rem;
      color: #94a3b8;
    }

    .form-group {
      margin-bottom: 1.1rem;
    }

    .form-row-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .form-group label {
      display: block;
      font-size: 0.8125rem;
      font-weight: 600;
      color: #334155;
      margin-bottom: 0.35rem;
    }

    .form-group input, .form-group select, .form-group textarea {
      width: 100%;
      padding: 0.65rem 0.85rem;
      border: 1px solid var(--border-light);
      border-radius: var(--radius-md);
      background: #f8fafc;
      font-size: 0.875rem;
      transition: all 0.2s;
    }

    .form-group input:focus, .form-group select:focus, .form-group textarea:focus {
      background: #ffffff;
      border-color: var(--color-primary-blue);
      outline: none;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    }

    .form-footer {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 0.75rem;
      margin-top: 1.25rem;
      padding-top: 1rem;
      border-top: 1px solid var(--border-light);
    }

    .side-info-col {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .success-feedback-card {
      background: #f0fdf4;
      border: 1.5px solid #86efac;
      padding: 1.5rem;
      text-align: center;
      border-radius: var(--radius-lg);
    }

    .success-icon-circle {
      width: 52px;
      height: 52px;
      border-radius: 50%;
      background: #22c55e;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 0.75rem;
      box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
    }

    .success-feedback-card h4 {
      font-size: 1.1rem;
      font-weight: 800;
      color: #15803d;
      margin-bottom: 0.35rem;
    }

    .success-caption {
      font-size: 0.8rem;
      color: #166534;
      line-height: 1.4;
      margin-bottom: 1.25rem;
    }

    .success-actions {
      display: flex;
      justify-content: center;
      gap: 0.6rem;
    }

    .info-box {
      padding: 1.25rem;
    }

    .info-box h4 {
      font-size: 0.95rem;
      font-weight: 700;
      margin-bottom: 1rem;
    }

    .info-list {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .info-list li {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
    }

    .info-bullet {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: #eff6ff;
      color: #2563eb;
      font-weight: 800;
      font-size: 0.75rem;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .info-list strong {
      font-size: 0.825rem;
      color: #0f172a;
      display: block;
    }

    .info-list p {
      font-size: 0.75rem;
      color: #64748b;
      margin: 0.15rem 0 0;
      line-height: 1.35;
    }

    @media (max-width: 900px) {
      .form-layout-grid {
        grid-template-columns: 1fr;
      }
      .form-row-2 {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AdminCreateProjectComponent {
  public pmsService = inject(PmsDataService);

  public name = '';
  public client = '';
  public location = 'Rajahmundry';
  public startDate = '2026-10-01';
  public endDate = '2026-11-30';
  public siteManagerId = 'u1';
  public budget = '₹ 22,00,000';
  public packageType = 'Luxury Turnkey';
  public kitchenModel: KitchenModel = 'Dry Kitchen';
  public description = '';

  public lastCreatedProject: Project | null = null;

  public get siteManagers() {
    return this.pmsService.users().filter(u => u.role === 'Site Manager');
  }

  public onSubmit(e: Event) {
    e.preventDefault();
    if (!this.name || !this.client || !this.location || !this.siteManagerId) return;

    const created = this.pmsService.createProject({
      name: this.name,
      client: this.client,
      location: this.location,
      startDate: this.startDate,
      endDate: this.endDate,
      siteManagerId: this.siteManagerId,
      budget: this.budget,
      kitchenModel: this.kitchenModel,
      description: this.description
    });

    this.lastCreatedProject = created;
  }

  public resetForm() {
    this.name = '';
    this.client = '';
    this.location = '';
    this.description = '';
    this.lastCreatedProject = null;
  }

  public viewProjectStages(id: string) {
    this.pmsService.navigateTo('project-detail', id);
  }
}
