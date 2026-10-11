import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PmsDataService } from '../../services/pms-data.service';
import { User } from '../../models/pms.models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="simple-login-wrap">
      <!-- Clean, focused centered authentication card -->
      <div class="login-card animate-fade-in">
        <!-- Brand Header -->
        <div class="brand-header">
          <div class="brand-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <h2>Interior PMS</h2>
          <p class="brand-subtitle">Laitaliya Project Management System</p>
        </div>

        <!-- Role Toggle: Simple Segmented Control -->
        <div class="role-segmented-control">
          <button 
            type="button"
            class="segment-btn" 
            [class.active]="selectedRole === 'admin'"
            (click)="switchRoleMode('admin')">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <span>Director / Admin</span>
          </button>

          <button 
            type="button"
            class="segment-btn" 
            [class.active]="selectedRole === 'site-manager'"
            (click)="switchRoleMode('site-manager')">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            <span>Site Manager</span>
          </button>
        </div>

        <!-- Login Form -->
        <form (submit)="onLoginSubmit($event)" class="simple-form">
          <!-- Site Manager Selector (Only in Site Manager mode) -->
          <div *ngIf="selectedRole === 'site-manager'" class="form-group">
            <label class="input-label">Select Site Supervisor</label>
            <select 
              class="simple-input simple-select"
              [(ngModel)]="selectedSmId" 
              name="smSelector"
              (ngModelChange)="onSmSelectChange($event)">
              <option *ngFor="let u of siteManagers" [value]="u.id">
                {{ u.name }} ({{ u.assignedProjectsCount }} Projects)
              </option>
            </select>
          </div>

          <!-- Email Field -->
          <div class="form-group">
            <label class="input-label">Email Address</label>
            <input 
              type="email" 
              [(ngModel)]="email" 
              name="email" 
              required 
              class="simple-input"
              placeholder="e.g. user@company.com">
          </div>

          <!-- Password Field -->
          <div class="form-group">
            <div class="label-row">
              <label class="input-label">Password</label>
              <a href="javascript:void(0)" (click)="showForgot = !showForgot" class="forgot-link">Forgot?</a>
            </div>
            <input 
              type="password" 
              [(ngModel)]="password" 
              name="password" 
              required 
              class="simple-input"
              placeholder="••••••••••••">
          </div>

          <!-- Forgot Password helper text -->
          <div *ngIf="showForgot" class="helper-callout">
            Demo passwords are pre-filled. You can also use the 1-click shortcuts below.
          </div>

          <!-- Primary Submit Button -->
          <button type="submit" class="submit-btn">
            Sign In as {{ selectedRole === 'admin' ? 'Administrator' : getSelectedSmName() }}
          </button>
        </form>

        <!-- Quick 1-Click Demo Buttons -->
        <div class="quick-demo-section">
          <div class="quick-demo-header">
            <span>Quick Demo Sign In:</span>
          </div>
          <div class="quick-demo-chips">
            <button type="button" class="chip-btn" (click)="quickDemoLogin('admin')">
              👑 Admin Director
            </button>
            <button type="button" class="chip-btn" (click)="quickDemoLogin('ravi')">
              👷 Ravi Kumar (Site Manager)
            </button>
          </div>
        </div>

        <!-- Footer Meta & Links -->
        <div class="card-footer">
          <div class="storage-tag">
            <span class="dot">●</span> Stored in <code>data/logins.json</code>
          </div>
          <button type="button" class="link-btn" (click)="pmsService.showFlowGuide.set(true)">
            View Flow Roadmap &rarr;
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .simple-login-wrap {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #f8fafc;
      padding: 2rem 1rem;
      font-family: var(--font-body);
    }

    .login-card {
      width: 100%;
      max-width: 420px;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 2.25rem 2rem;
      box-shadow: 0 4px 20px -2px rgba(15, 23, 42, 0.05), 0 2px 6px -1px rgba(15, 23, 42, 0.02);
    }

    .brand-header {
      text-align: center;
      margin-bottom: 1.5rem;
    }

    .brand-icon {
      width: 44px;
      height: 44px;
      background: #eff6ff;
      color: #2563eb;
      border: 1px solid #dbeafe;
      border-radius: 12px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 0.75rem;
    }

    .brand-header h2 {
      font-size: 1.35rem;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.02em;
      margin-bottom: 0.25rem;
    }

    .brand-subtitle {
      font-size: 0.8rem;
      color: #64748b;
    }

    /* Segmented Control */
    .role-segmented-control {
      display: flex;
      background: #f1f5f9;
      border-radius: 10px;
      padding: 4px;
      margin-bottom: 1.5rem;
      border: 1px solid #e2e8f0;
    }

    .segment-btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.45rem;
      padding: 0.55rem 0.5rem;
      border-radius: 7px;
      font-size: 0.82rem;
      font-weight: 600;
      color: #64748b;
      background: transparent;
      border: none;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .segment-btn:hover {
      color: #0f172a;
    }

    .segment-btn.active {
      background: #ffffff;
      color: #0f172a;
      box-shadow: 0 1px 3px rgba(15, 23, 42, 0.08);
      font-weight: 700;
    }

    /* Form */
    .simple-form {
      display: flex;
      flex-direction: column;
      gap: 1.1rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    .input-label {
      font-size: 0.8rem;
      font-weight: 600;
      color: #334155;
    }

    .label-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .forgot-link {
      font-size: 0.75rem;
      color: #2563eb;
      text-decoration: none;
    }

    .forgot-link:hover {
      text-decoration: underline;
    }

    .simple-input {
      width: 100%;
      padding: 0.65rem 0.85rem;
      font-size: 0.875rem;
      color: #0f172a;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      outline: none;
      transition: border-color 0.15s, box-shadow 0.15s;
    }

    .simple-input:focus {
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
    }

    .simple-select {
      cursor: pointer;
      background-color: #ffffff;
    }

    .helper-callout {
      padding: 0.5rem 0.75rem;
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: 6px;
      font-size: 0.75rem;
      color: #1e40af;
    }

    .submit-btn {
      width: 100%;
      padding: 0.75rem;
      background: #2563eb;
      color: #ffffff;
      border: none;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      margin-top: 0.25rem;
      transition: background-color 0.15s ease;
    }

    .submit-btn:hover {
      background: #1d4ed8;
    }

    /* Quick Demo Section */
    .quick-demo-section {
      margin-top: 1.5rem;
      padding-top: 1.25rem;
      border-top: 1px solid #f1f5f9;
    }

    .quick-demo-header {
      font-size: 0.72rem;
      font-weight: 600;
      color: #64748b;
      margin-bottom: 0.5rem;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .quick-demo-chips {
      display: flex;
      gap: 0.5rem;
    }

    .chip-btn {
      flex: 1;
      padding: 0.5rem 0.65rem;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      font-size: 0.78rem;
      font-weight: 600;
      color: #334155;
      cursor: pointer;
      text-align: center;
      transition: all 0.15s ease;
    }

    .chip-btn:hover {
      background: #f1f5f9;
      border-color: #cbd5e1;
      color: #0f172a;
    }

    /* Footer */
    .card-footer {
      margin-top: 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
      font-size: 0.75rem;
    }

    .storage-tag {
      color: #64748b;
      display: flex;
      align-items: center;
      gap: 0.35rem;
    }

    .storage-tag .dot {
      color: #10b981;
      font-size: 0.7rem;
    }

    .storage-tag code {
      font-family: monospace;
      color: #334155;
      font-weight: 600;
    }

    .link-btn {
      color: #2563eb;
      background: transparent;
      border: none;
      font-size: 0.75rem;
      font-weight: 600;
      cursor: pointer;
      padding: 0;
    }

    .link-btn:hover {
      text-decoration: underline;
    }
  `]
})
export class LoginComponent {
  public pmsService = inject(PmsDataService);

  public selectedRole: 'admin' | 'site-manager' = 'admin';
  public email = 'admin@interiorpms.com';
  public password = 'password123';
  public selectedSmId = 'u1';
  public showForgot = false;

  public get siteManagers(): User[] {
    return this.pmsService.users().filter(u => u.role === 'Site Manager');
  }

  public switchRoleMode(role: 'admin' | 'site-manager') {
    this.selectedRole = role;
    if (role === 'admin') {
      this.email = 'admin@interiorpms.com';
      this.password = 'password123';
    } else {
      const sm = this.siteManagers.find(u => u.id === this.selectedSmId) || this.siteManagers[0];
      if (sm) {
        this.email = sm.email;
        this.password = 'password123';
      }
    }
  }

  public onSmSelectChange(smId: string) {
    this.selectedSmId = smId;
    const sm = this.siteManagers.find(u => u.id === smId);
    if (sm) {
      this.email = sm.email;
      this.password = 'password123';
    }
  }

  public selectSiteManager(user: User) {
    this.onSmSelectChange(user.id);
  }

  public getSelectedSmName(): string {
    const sm = this.siteManagers.find(u => u.id === this.selectedSmId);
    return sm ? sm.name : 'Site Manager';
  }

  public onLoginSubmit(event: Event) {
    event.preventDefault();
    if (this.selectedRole === 'admin') {
      this.pmsService.loginAdmin(this.email, this.password);
    } else {
      this.pmsService.loginSiteManager(this.selectedSmId, this.password);
    }
  }

  public quickDemoLogin(type: 'admin' | 'ravi') {
    if (type === 'admin') {
      this.pmsService.loginAdmin('admin@interiorpms.com', 'password123');
    } else {
      this.pmsService.loginSiteManager('u1', 'password123');
    }
  }
}
