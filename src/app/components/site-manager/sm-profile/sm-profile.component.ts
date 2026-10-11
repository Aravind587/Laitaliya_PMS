import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PmsDataService } from '../../../services/pms-data.service';

@Component({
  selector: 'app-sm-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="profile-wrapper animate-fade-in">
      <!-- Section Header -->
      <div class="section-header">
        <div>
          <div class="step-tag">Step 7: Profile &amp; Settings</div>
          <h2>Site Manager Profile &amp; Preferences</h2>
          <p class="section-desc">Manage field supervisor credentials, configure mobile push alerts, and view site SOPs</p>
        </div>

        <button class="btn btn-secondary btn-sm" (click)="pmsService.navigateTo('dashboard')">
          &larr; Back to Dashboard
        </button>
      </div>

      <div class="profile-layout-grid">
        <!-- Profile Card matching Step 7 in diagram -->
        <div class="card profile-card">
          <div class="profile-header">
            <div class="avatar-large" [style.background-color]="pmsService.loggedInUser().avatarBg || '#2563eb'">
              {{ pmsService.loggedInUser().name.slice(0, 2).toUpperCase() }}
            </div>
            <h3 class="profile-name">{{ pmsService.loggedInUser().name }}</h3>
            <span class="profile-role-pill">{{ pmsService.loggedInUser().role }}</span>
            <p class="profile-email">{{ pmsService.loggedInUser().email }}</p>
            <p class="profile-phone">{{ pmsService.loggedInUser().phone }}</p>
          </div>

          <!-- Quick Navigation Links (Matching diagram Step 7) -->
          <div class="profile-nav-list">
            <div class="profile-nav-item" (click)="showPasswordModal = true">
              <div class="nav-left">
                <span class="nav-icon">🔑</span>
                <span>Change Password</span>
              </div>
              <span class="nav-arrow">&rsaquo;</span>
            </div>

            <div class="profile-nav-item" (click)="activeSubSection = 'notifications'">
              <div class="nav-left">
                <span class="nav-icon">🔔</span>
                <span>Notification Settings</span>
              </div>
              <span class="nav-arrow">&rsaquo;</span>
            </div>

            <div class="profile-nav-item" (click)="activeSubSection = 'help'">
              <div class="nav-left">
                <span class="nav-icon">📘</span>
                <span>Help &amp; Support (Site Manager SOP)</span>
              </div>
              <span class="nav-arrow">&rsaquo;</span>
            </div>

            <div class="profile-nav-item logout-item" (click)="logout()">
              <div class="nav-left">
                <span class="nav-icon">🚪</span>
                <span>Logout</span>
              </div>
              <span class="nav-arrow">&rsaquo;</span>
            </div>
          </div>
        </div>

        <!-- Right Side: Settings & SOP Content -->
        <div class="detail-column">
          <!-- Notification Preferences -->
          <div *ngIf="activeSubSection === 'notifications'" class="card content-box animate-fade-in">
            <div class="box-title-row">
              <h3>Notification Preferences</h3>
              <span class="badge-mini">Field Alerts</span>
            </div>
            <p class="box-sub">Configure how you receive critical site delay and milestone notifications:</p>

            <div class="settings-toggles">
              <label class="toggle-row">
                <input type="checkbox" [(ngModel)]="pushAlerts">
                <div>
                  <strong>Mobile Push Alerts</strong>
                  <small>Receive push notification whenever admin assigns a new task or updates milestone timeline.</small>
                </div>
              </label>

              <label class="toggle-row">
                <input type="checkbox" [(ngModel)]="overdueAlerts">
                <div>
                  <strong>Overdue Task Reminders</strong>
                  <small>Alert 2 hours prior to scheduled deadline and at 09:00 AM daily if task remains incomplete.</small>
                </div>
              </label>

              <label class="toggle-row">
                <input type="checkbox" [(ngModel)]="emailDigest">
                <div>
                  <strong>Morning Site Inspection Digest</strong>
                  <small>Daily email summary of today's 5 tasks across all assigned sites.</small>
                </div>
              </label>
            </div>

            <button class="btn btn-primary btn-sm save-pref-btn" (click)="savePreferences()">
              Save Preferences
            </button>
          </div>

          <!-- Help & Support SOP -->
          <div *ngIf="activeSubSection === 'help'" class="card content-box animate-fade-in">
            <div class="box-title-row">
              <h3>Site Manager SOP &amp; Execution Guidelines</h3>
              <span class="badge-mini">Field Protocol</span>
            </div>
            <p class="box-sub">Standard operating procedure for interior site management:</p>

            <div class="sop-steps-list">
              <div class="sop-step">
                <div class="sop-num">1</div>
                <div>
                  <strong>Daily Morning Site Inspection (08:30 AM &ndash; 09:30 AM)</strong>
                  <p>Walk the site with subcontractors. Verify civil hacking alignment, electrical conduit paths, and material stock on site.</p>
                </div>
              </div>

              <div class="sop-step">
                <div class="sop-num">2</div>
                <div>
                  <strong>Real-Time Status Logging (The 5 States)</strong>
                  <p>Keep task statuses accurate: Mark "Work In Progress" when actively executing, "Pending" when awaiting client approval or stone shipment, and "Rechecking" after paint swatch review.</p>
                </div>
              </div>

              <div class="sop-step">
                <div class="sop-num">3</div>
                <div>
                  <strong>Forgotten Task Prevention</strong>
                  <p>Log a brief remark every 48 hours for active tasks to avoid triggering automated "Forgotten Task" director alerts.</p>
                </div>
              </div>

              <div class="sop-step">
                <div class="sop-num">4</div>
                <div>
                  <strong>Quality Checklist &amp; Final Handover</strong>
                  <p>Verify snagging points, surface finish, door alignment, and deep cleaning prior to client key handover.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Password Change Modal -->
      <div *ngIf="showPasswordModal" class="modal-overlay" (click)="showPasswordModal = false">
        <div class="modal-dialog" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Change Site Manager Password</h3>
            <button class="close-btn" (click)="showPasswordModal = false">×</button>
          </div>

          <div class="modal-body">
            <div class="form-group">
              <label>Current Password</label>
              <input type="password" placeholder="••••••••••••">
            </div>
            <div class="form-group">
              <label>New Password</label>
              <input type="password" placeholder="Enter new password">
            </div>
            <div class="form-group">
              <label>Confirm New Password</label>
              <input type="password" placeholder="Confirm new password">
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="showPasswordModal = false">Cancel</button>
            <button class="btn btn-primary" (click)="updatePassword()">Update Password</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .profile-wrapper {
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

    .profile-layout-grid {
      display: grid;
      grid-template-columns: 1.2fr 1.8fr;
      gap: 1.5rem;
    }

    .profile-card {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .profile-header {
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.35rem;
      padding-bottom: 1.25rem;
      border-bottom: 1px solid var(--border-light);
    }

    .avatar-large {
      width: 68px;
      height: 68px;
      border-radius: 50%;
      color: white;
      font-size: 1.5rem;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
      margin-bottom: 0.5rem;
    }

    .profile-name {
      font-size: 1.25rem;
      font-weight: 800;
      color: #0f172a;
    }

    .profile-role-pill {
      font-size: 0.72rem;
      font-weight: 700;
      background: #eff6ff;
      color: #1d4ed8;
      padding: 0.2rem 0.6rem;
      border-radius: var(--radius-full);
      border: 1px solid #bfdbfe;
    }

    .profile-email, .profile-phone {
      font-size: 0.8rem;
      color: #64748b;
      margin: 0;
    }

    .profile-nav-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .profile-nav-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.75rem 1rem;
      background: #f8fafc;
      border: 1px solid var(--border-light);
      border-radius: var(--radius-md);
      cursor: pointer;
      font-size: 0.85rem;
      font-weight: 600;
      color: #334155;
      transition: all 0.15s;
    }

    .profile-nav-item:hover {
      background: #eff6ff;
      border-color: #bfdbfe;
      color: #1d4ed8;
    }

    .nav-left {
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }

    .nav-icon {
      font-size: 1.1rem;
    }

    .nav-arrow {
      font-size: 1.25rem;
      color: #94a3b8;
    }

    .logout-item {
      color: #dc2626;
      background: #fef2f2;
      border-color: #fee2e2;
    }
    .logout-item:hover {
      background: #fee2e2;
      border-color: #fca5a5;
      color: #b91c1c;
    }

    .content-box {
      padding: 1.5rem;
    }

    .box-title-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.35rem;
    }

    .box-title-row h3 {
      font-size: 1.1rem;
      font-weight: 800;
    }

    .badge-mini {
      font-size: 0.7rem;
      background: #eff6ff;
      color: #2563eb;
      font-weight: 700;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
    }

    .box-sub {
      font-size: 0.8rem;
      color: #64748b;
      margin-bottom: 1.25rem;
    }

    .settings-toggles {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .toggle-row {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 0.75rem;
      background: #f8fafc;
      border: 1px solid var(--border-light);
      border-radius: var(--radius-md);
      cursor: pointer;
    }

    .toggle-row input {
      margin-top: 3px;
    }

    .toggle-row strong {
      display: block;
      font-size: 0.85rem;
      color: #0f172a;
    }

    .toggle-row small {
      font-size: 0.75rem;
      color: #64748b;
      line-height: 1.35;
    }

    .save-pref-btn {
      margin-top: 1.25rem;
    }

    .sop-steps-list {
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
    }

    .sop-step {
      display: flex;
      align-items: flex-start;
      gap: 0.85rem;
      padding: 0.85rem;
      background: #f8fafc;
      border: 1px solid var(--border-light);
      border-radius: var(--radius-md);
    }

    .sop-num {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: #059669;
      color: white;
      font-weight: 800;
      font-size: 0.8rem;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .sop-step strong {
      display: block;
      font-size: 0.85rem;
      color: #0f172a;
      margin-bottom: 0.15rem;
    }

    .sop-step p {
      font-size: 0.78rem;
      color: #64748b;
      margin: 0;
      line-height: 1.4;
    }

    @media (max-width: 900px) {
      .profile-layout-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class SmProfileComponent {
  public pmsService = inject(PmsDataService);

  public activeSubSection: 'notifications' | 'help' = 'notifications';
  public showPasswordModal = false;

  public pushAlerts = true;
  public overdueAlerts = true;
  public emailDigest = true;

  public savePreferences() {
    alert('Settings Saved: Field notification preferences updated.');
  }

  public updatePassword() {
    alert('Password updated successfully for ' + this.pmsService.loggedInUser().name);
    this.showPasswordModal = false;
  }

  public logout() {
    this.pmsService.logout();
  }
}
