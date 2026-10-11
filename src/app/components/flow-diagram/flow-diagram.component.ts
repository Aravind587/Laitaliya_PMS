import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PmsDataService } from '../../services/pms-data.service';
import { PROJECT_STAGES, STAGES_METADATA, ProjectStage, StageStepDetail, StageMetadata } from '../../models/pms.models';

type FlowTab = 
  | 'execution-lifecycle'
  | 'sales-flow'
  | 'design-flow'
  | 'ceiling-flow'
  | 'civil-flow'
  | 'manual-flow'
  | 'production-flow'
  | 'modular-flow'
  | 'kitchen-flow'
  | 'finishing-flow'
  | 'role-perspectives';

@Component({
  selector: 'app-flow-diagram',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flow-container animate-fade-in">
      <!-- Header Banner -->
      <div class="flow-header">
        <div class="header-main">
          <div class="header-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <div>
            <h1>Interior Turnkey Operations – Standard Operating Procedures (SOP)</h1>
            <p class="header-subtitle">Official 7-Flow Specification &amp; Turnkey Lifecycle Architecture</p>
          </div>
        </div>
        <div class="header-tags">
          <div class="flow-pills">
            <span>Sales (6)</span> &rarr; <span>Design (7)</span> &rarr; <span>Ceiling (10)</span> &rarr; <span>Civil (5)</span> &rarr; <span>Manual (5)</span> &rarr; <span>Production (9)</span> &rarr; <span>Modular (7)</span> &rarr; <span>Kitchen (10)</span> &rarr; <span>Finishing (7)</span>
          </div>
          <div class="sub-values">
            <span>Standardized SOP</span> | <span>Deliverables &amp; Exit Gates</span> | <span>Dry/Wet/Utility Kitchens</span>
          </div>
        </div>
      </div>

      <!-- Navigation Switcher Toolbar -->
      <div class="flow-toolbar">
        <div class="flow-nav-tabs">
          <button 
            class="nav-tab-chip" 
            [class.active]="activeTab === 'execution-lifecycle'" 
            (click)="activeTab = 'execution-lifecycle'">
            ⭐ 9-Phase Master Pipeline
          </button>
          <button 
            class="nav-tab-chip" 
            [class.active]="activeTab === 'sales-flow'" 
            (click)="activeTab = 'sales-flow'">
            💼 Sales Flow (6 Steps)
          </button>
          <button 
            class="nav-tab-chip" 
            [class.active]="activeTab === 'design-flow'" 
            (click)="activeTab = 'design-flow'">
            📐 Design Flow (7 Phases)
          </button>
          <button 
            class="nav-tab-chip" 
            [class.active]="activeTab === 'ceiling-flow'" 
            (click)="activeTab = 'ceiling-flow'">
            🏗️ False Ceiling Flow (10 Stages)
          </button>
          <button 
            class="nav-tab-chip" 
            [class.active]="activeTab === 'civil-flow'" 
            (click)="activeTab = 'civil-flow'">
            🧱 Civil Work Flow (5 Stages)
          </button>
          <button 
            class="nav-tab-chip" 
            [class.active]="activeTab === 'manual-flow'" 
            (click)="activeTab = 'manual-flow'">
            🪚 Manual Work Flow (5 Stages)
          </button>
          <button 
            class="nav-tab-chip" 
            [class.active]="activeTab === 'production-flow'" 
            (click)="activeTab = 'production-flow'">
            🏭 Production Flow (9 Stages)
          </button>
          <button 
            class="nav-tab-chip" 
            [class.active]="activeTab === 'modular-flow'" 
            (click)="activeTab = 'modular-flow'">
            📦 Modular Flow (7 Stages)
          </button>
          <button 
            class="nav-tab-chip" 
            [class.active]="activeTab === 'kitchen-flow'" 
            (click)="activeTab = 'kitchen-flow'">
            🍳 Kitchen Models (10 Steps)
          </button>
          <button 
            class="nav-tab-chip" 
            [class.active]="activeTab === 'finishing-flow'" 
            (click)="activeTab = 'finishing-flow'">
            ✨ Finishing Flow (7 Steps)
          </button>
          <button 
            class="nav-tab-chip" 
            [class.active]="activeTab === 'role-perspectives'" 
            (click)="activeTab = 'role-perspectives'">
            👥 Role Perspectives
          </button>
        </div>

        <button class="btn btn-primary btn-sm back-live-btn" (click)="pmsService.showFlowGuide.set(false)">
          Return to Live App
        </button>
      </div>

      <!-- ======================================================== -->
      <!-- TAB 1: 9-PHASE MASTER PROJECT EXECUTION LIFECYCLE        -->
      <!-- ======================================================== -->
      <div *ngIf="activeTab === 'execution-lifecycle'" class="lifecycle-view animate-fade-in">
        <div class="lifecycle-intro-card card">
          <div class="intro-left">
            <span class="intro-badge">Complete Standard Operating Procedure (SOP)</span>
            <h2>Interior Turnkey Execution Flow (9 Phases)</h2>
            <p>
              Every interior project is executed through this sequential pipeline. 
              Click any phase card to jump into that phase directly inside the live project!
            </p>
          </div>
          <button class="btn btn-outline btn-sm" (click)="showAsciiModal = !showAsciiModal">
            {{ showAsciiModal ? 'Hide Text Diagram' : 'View Text Diagram' }}
          </button>
        </div>

        <!-- ASCII / Text View -->
        <div *ngIf="showAsciiModal" class="ascii-diagram-card card animate-fade-in">
          <div class="ascii-card-header">
            <strong>Original Execution Tree:</strong>
            <button class="copy-hint-btn" (click)="copyDiagramText(asciiMasterDiagram)">Copy Flow Text</button>
          </div>
          <pre class="ascii-code-block">{{ asciiMasterDiagram }}</pre>
        </div>

        <!-- Vertical Flow Tree -->
        <div class="flowchart-tree">
          <ng-container *ngFor="let stage of allStages; let i = index; let isLast = last">
            <div 
              class="phase-flow-card card" 
              [class.highlight-kitchen]="stage === 'Kitchen Workflow'"
              (click)="openPhaseInProject(stage)">
              
              <div class="phase-card-top">
                <div class="phase-id-col">
                  <div class="phase-idx-circle">0{{ i + 1 }}</div>
                  <span class="phase-icon-emoji">{{ stagesMetadata[stage].icon }}</span>
                </div>

                <div class="phase-heading-col">
                  <div class="phase-title-row">
                    <h3>{{ i + 1 }}. {{ stagesMetadata[stage].name }}</h3>
                    <span *ngIf="stage === 'Kitchen Workflow'" class="kitchen-models-tag">
                      3 Models: Dry / Wet / Utility
                    </span>
                    <span class="phase-steps-count-badge">
                      {{ stagesMetadata[stage].steps.length }} Steps
                    </span>
                  </div>
                  <p class="phase-desc-text">{{ stagesMetadata[stage].description }}</p>
                </div>

                <div class="phase-action-col">
                  <button class="btn btn-primary btn-sm open-phase-btn" (click)="$event.stopPropagation(); openPhaseInProject(stage)">
                    Open Phase in Project &rarr;
                  </button>
                </div>
              </div>

              <!-- Sub-Steps Horizontal Sequence Pills -->
              <div class="substeps-flow-box">
                <div class="substeps-box-label">
                  <strong>Sequential Sub-Steps:</strong>
                </div>
                <div class="substep-chain-scroll">
                  <ng-container *ngFor="let step of stagesMetadata[stage].steps; let sIdx = index; let isSubLast = last">
                    <div class="substep-chip-item">
                      <span class="chip-step-idx">{{ step.stepNumber }}</span>
                      <span class="chip-step-name">{{ step.name }}</span>
                    </div>
                    <span *ngIf="!isSubLast" class="chain-chevron">➔</span>
                  </ng-container>
                </div>
              </div>
            </div>

            <!-- Connector Line -->
            <div *ngIf="!isLast" class="tree-connector">
              <div class="connector-line"></div>
              <div class="connector-arrow">▼</div>
            </div>
          </ng-container>
        </div>
      </div>

      <!-- ======================================================== -->
      <!-- TAB 2: SALES FLOW (6 Steps)                             -->
      <!-- ======================================================== -->
      <div *ngIf="activeTab === 'sales-flow'" class="flow-detail-view animate-fade-in">
        <ng-container *ngTemplateOutlet="flowSectionTemplate; context: { stageName: 'Sales Phase' }"></ng-container>
      </div>

      <!-- ======================================================== -->
      <!-- TAB 3: DESIGN FLOW (7 Phases)                            -->
      <!-- ======================================================== -->
      <div *ngIf="activeTab === 'design-flow'" class="flow-detail-view animate-fade-in">
        <ng-container *ngTemplateOutlet="flowSectionTemplate; context: { stageName: 'Design Phase' }"></ng-container>
      </div>

      <!-- ======================================================== -->
      <!-- TAB 4: PRODUCTION FLOW (9 Stages)                        -->
      <!-- ======================================================== -->
      <div *ngIf="activeTab === 'production-flow'" class="flow-detail-view animate-fade-in">
        <ng-container *ngTemplateOutlet="flowSectionTemplate; context: { stageName: 'Production Phase' }"></ng-container>
      </div>

      <!-- ======================================================== -->
      <!-- TAB 5: FALSE CEILING FLOW (10 Stages)                    -->
      <!-- ======================================================== -->
      <div *ngIf="activeTab === 'ceiling-flow'" class="flow-detail-view animate-fade-in">
        <ng-container *ngTemplateOutlet="flowSectionTemplate; context: { stageName: 'False Ceiling Phase' }"></ng-container>
      </div>

      <!-- ======================================================== -->
      <!-- TAB 6: CIVIL WORK FLOW (5 Stages)                        -->
      <!-- ======================================================== -->
      <div *ngIf="activeTab === 'civil-flow'" class="flow-detail-view animate-fade-in">
        <ng-container *ngTemplateOutlet="flowSectionTemplate; context: { stageName: 'Civil Works Phase' }"></ng-container>
      </div>

      <!-- ======================================================== -->
      <!-- TAB 7: MANUAL WORK FLOW (5 Stages)                       -->
      <!-- ======================================================== -->
      <div *ngIf="activeTab === 'manual-flow'" class="flow-detail-view animate-fade-in">
        <ng-container *ngTemplateOutlet="flowSectionTemplate; context: { stageName: 'Site Manual Finishing Phase' }"></ng-container>
      </div>

      <!-- ======================================================== -->
      <!-- TAB 8: MODULAR FLOW (7 Stages)                           -->
      <!-- ======================================================== -->
      <div *ngIf="activeTab === 'modular-flow'" class="flow-detail-view animate-fade-in">
        <ng-container *ngTemplateOutlet="flowSectionTemplate; context: { stageName: 'Modular Assembly Phase' }"></ng-container>
      </div>

      <!-- ======================================================== -->
      <!-- TAB 9: KITCHEN WORKFLOW (10 Steps)                       -->
      <!-- ======================================================== -->
      <div *ngIf="activeTab === 'kitchen-flow'" class="flow-detail-view animate-fade-in">
        <ng-container *ngTemplateOutlet="flowSectionTemplate; context: { stageName: 'Kitchen Workflow' }"></ng-container>
      </div>

      <!-- ======================================================== -->
      <!-- TAB 10: FINISHING FLOW (7 Steps)                         -->
      <!-- ======================================================== -->
      <div *ngIf="activeTab === 'finishing-flow'" class="flow-detail-view animate-fade-in">
        <ng-container *ngTemplateOutlet="flowSectionTemplate; context: { stageName: 'Finishing Flow' }"></ng-container>
      </div>

      <!-- ======================================================== -->
      <!-- TAB 11: ROLE PERSPECTIVES (Admin & Site Manager)         -->
      <!-- ======================================================== -->
      <div *ngIf="activeTab === 'role-perspectives'" class="role-perspectives-view animate-fade-in">
        <!-- ADMIN PERSPECTIVE -->
        <section class="perspective-section admin-section">
          <div class="perspective-heading admin-heading">
            <div class="icon-circle">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div class="heading-text">
              <h2>ADMIN PERSPECTIVE</h2>
              <p>Full executive control – Manage projects, users, tasks, and company-wide progress</p>
            </div>
          </div>

          <div class="steps-flow-row">
            <!-- Step 1: Login -->
            <div class="step-card" (click)="goToStep('admin', 'login')">
              <div class="step-badge">1</div>
              <div class="step-title">Login</div>
              <ul class="step-bullets">
                <li>Admin credentials authentication</li>
                <li>Role authorization &amp; audit log</li>
              </ul>
              <button class="step-action-btn">Open Login &rarr;</button>
            </div>
            <div class="flow-arrow">&rarr;</div>

            <!-- Step 2: Dashboard -->
            <div class="step-card" (click)="goToStep('admin', 'dashboard')">
              <div class="step-badge">2</div>
              <div class="step-title">Dashboard</div>
              <ul class="step-bullets">
                <li>Real-time project counters (Total, WIP, Overdue)</li>
                <li>Live progress bars &amp; pipeline status</li>
              </ul>
              <button class="step-action-btn">Open Dashboard &rarr;</button>
            </div>
            <div class="flow-arrow">&rarr;</div>

            <!-- Step 3: Create Project -->
            <div class="step-card" (click)="goToStep('admin', 'create-project')">
              <div class="step-badge">3</div>
              <div class="step-title">Create Project</div>
              <ul class="step-bullets">
                <li>Client, budget &amp; location specifications</li>
                <li>Assign Site Manager &amp; Kitchen model</li>
              </ul>
              <button class="step-action-btn">Open New Project &rarr;</button>
            </div>
            <div class="flow-arrow">&rarr;</div>

            <!-- Step 4: Manage Projects -->
            <div class="step-card" (click)="goToStep('admin', 'projects')">
              <div class="step-badge">4</div>
              <div class="step-title">Manage Projects</div>
              <ul class="step-bullets">
                <li>Search &amp; status filter tabs</li>
                <li>Access active project workspaces</li>
              </ul>
              <button class="step-action-btn">Manage Projects &rarr;</button>
            </div>
            <div class="flow-arrow">&rarr;</div>

            <!-- Step 5: View Stages / Tasks -->
            <div class="step-card" (click)="goToStep('admin', 'project-detail')">
              <div class="step-badge">5</div>
              <div class="step-title">Stages &amp; Tasks</div>
              <ul class="step-bullets">
                <li>Full 7-flow stage stepper with SOP table</li>
                <li>Update task status &amp; remarks</li>
              </ul>
              <button class="step-action-btn">View Workspace &rarr;</button>
            </div>
            <div class="flow-arrow">&rarr;</div>

            <!-- Step 6: Daily Tasks & Alerts -->
            <div class="step-card" (click)="goToStep('admin', 'daily-tasks')">
              <div class="step-badge">6</div>
              <div class="step-title">Daily Tasks &amp; Alerts</div>
              <ul class="step-bullets">
                <li>Overdue, Today &amp; Upcoming counters</li>
                <li>Ping supervisor or reschedule overdue</li>
              </ul>
              <button class="step-action-btn">View Daily Tasks &rarr;</button>
            </div>
            <div class="flow-arrow">&rarr;</div>

            <!-- Step 7: Users & Settings -->
            <div class="step-card" (click)="goToStep('admin', 'settings')">
              <div class="step-badge">7</div>
              <div class="step-title">Users &amp; Settings</div>
              <ul class="step-bullets">
                <li>Manage team members &amp; roles</li>
                <li>Inspect logins audit log</li>
              </ul>
              <button class="step-action-btn">Manage Settings &rarr;</button>
            </div>
          </div>
        </section>

        <!-- SITE MANAGER PERSPECTIVE -->
        <section class="perspective-section sm-section">
          <div class="perspective-heading sm-heading">
            <div class="icon-circle sm-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div class="heading-text">
              <h2>SITE MANAGER PERSPECTIVE</h2>
              <p>Field operations – Inspect sites, execute SOP tasks, and update daily status</p>
            </div>
          </div>

          <div class="steps-flow-row">
            <!-- Step 1: Login -->
            <div class="step-card" (click)="goToStep('site-manager', 'login')">
              <div class="step-badge sm-badge">1</div>
              <div class="step-title">Login</div>
              <ul class="step-bullets">
                <li>Site Manager field credentials</li>
                <li>Session logging &amp; site access</li>
              </ul>
              <button class="step-action-btn sm-btn">Supervisor Login &rarr;</button>
            </div>
            <div class="flow-arrow">&rarr;</div>

            <!-- Step 2: Dashboard -->
            <div class="step-card" (click)="goToStep('site-manager', 'dashboard')">
              <div class="step-badge sm-badge">2</div>
              <div class="step-title">My Dashboard</div>
              <ul class="step-bullets">
                <li>Assigned projects overview</li>
                <li>Today's site tasks &amp; pending milestones</li>
              </ul>
              <button class="step-action-btn sm-btn">Supervisor Dash &rarr;</button>
            </div>
            <div class="flow-arrow">&rarr;</div>

            <!-- Step 3: Assigned Projects -->
            <div class="step-card" (click)="goToStep('site-manager', 'projects')">
              <div class="step-badge sm-badge">3</div>
              <div class="step-title">Assigned Projects</div>
              <ul class="step-bullets">
                <li>Card grid with client &amp; location</li>
                <li>Click to inspect live site tasks</li>
              </ul>
              <button class="step-action-btn sm-btn">My Sites &rarr;</button>
            </div>
            <div class="flow-arrow">&rarr;</div>

            <!-- Step 4: Project Tasks -->
            <div class="step-card" (click)="goToStep('site-manager', 'project-detail')">
              <div class="step-badge sm-badge">4</div>
              <div class="step-title">Site Tasks &amp; SOP</div>
              <ul class="step-bullets">
                <li>Execute standardized phase gates</li>
                <li>Record site remarks &amp; status</li>
              </ul>
              <button class="step-action-btn sm-btn">Execute Tasks &rarr;</button>
            </div>
            <div class="flow-arrow">&rarr;</div>

            <!-- Step 5: Daily Tasks -->
            <div class="step-card" (click)="goToStep('site-manager', 'daily-tasks')">
              <div class="step-badge sm-badge">5</div>
              <div class="step-title">Daily Tasks</div>
              <ul class="step-bullets">
                <li>Today, Overdue &amp; Upcoming checklist</li>
                <li>Direct status updates on site</li>
              </ul>
              <button class="step-action-btn sm-btn">Daily Checklist &rarr;</button>
            </div>
            <div class="flow-arrow">&rarr;</div>

            <!-- Step 6: Notifications -->
            <div class="step-card" (click)="goToStep('site-manager', 'notifications')">
              <div class="step-badge sm-badge">6</div>
              <div class="step-title">Notifications</div>
              <ul class="step-bullets">
                <li>Overdue alerts &amp; client updates</li>
                <li>Milestone sign-off notifications</li>
              </ul>
              <button class="step-action-btn sm-btn">View Alerts &rarr;</button>
            </div>
            <div class="flow-arrow">&rarr;</div>

            <!-- Step 7: Profile & SOP -->
            <div class="step-card" (click)="goToStep('site-manager', 'profile')">
              <div class="step-badge sm-badge">7</div>
              <div class="step-title">Profile &amp; SOP</div>
              <ul class="step-bullets">
                <li>Supervisor profile &amp; contacts</li>
                <li>Official Field Execution SOP</li>
              </ul>
              <button class="step-action-btn sm-btn">View Profile &rarr;</button>
            </div>
          </div>
        </section>
      </div>

      <!-- ======================================================== -->
      <!-- REUSABLE FLOW SECTION TEMPLATE                           -->
      <!-- ======================================================== -->
      <ng-template #flowSectionTemplate let-stageName="stageName">
        <div class="flow-stage-section" *ngIf="getStageMeta(stageName) as meta">
          <!-- Flow Hero Card -->
          <div class="flow-hero-card card">
            <div class="hero-left">
              <div class="hero-icon-box">
                <span>{{ meta.icon }}</span>
              </div>
              <div>
                <span class="hero-subtag">Official Interior SOP</span>
                <h2>{{ meta.name }}</h2>
                <p class="hero-desc">{{ meta.description }}</p>
                <div class="hero-meta-strip">
                  <span class="meta-tag">Phase 0{{ meta.phaseNumber }}</span>
                  <span class="meta-tag blue">{{ meta.steps.length }} Standardized Steps</span>
                  <span class="meta-tag green">{{ meta.flowSummary }}</span>
                </div>
              </div>
            </div>

            <div class="hero-right">
              <button class="btn btn-primary btn-sm hero-open-btn" (click)="openPhaseInProject(stageName)">
                Open Phase in Active Project &rarr;
              </button>
            </div>
          </div>

          <!-- ASCII Flow Diagram Box -->
          <div *ngIf="meta.asciiFlowDiagram" class="flow-ascii-card card">
            <div class="ascii-card-header">
              <div class="ascii-title">
                <span class="terminal-dots">● ● ●</span>
                <strong>Architectural Workflow Diagram:</strong>
              </div>
              <button class="copy-hint-btn" (click)="copyDiagramText(meta.asciiFlowDiagram!)">
                Copy Diagram
              </button>
            </div>
            <pre class="ascii-code-block">{{ meta.asciiFlowDiagram }}</pre>
          </div>

          <!-- 1. Stage Summary Table -->
          <div class="flow-table-card card">
            <div class="section-title-bar">
              <div class="title-left">
                <span class="table-index-badge">1</span>
                <h3>Step-by-Step {{ meta.name }} Summary Table</h3>
              </div>
              <span class="sop-std-pill">Standard Deliverables Specification</span>
            </div>

            <div class="table-responsive">
              <table class="pms-table sop-data-table">
                <thead>
                  <tr>
                    <th style="width: 70px;">Step #</th>
                    <th>Stage / Step Name</th>
                    <th>Primary Trade / Responsibility</th>
                    <th>Core Objective</th>
                    <th>Key Deliverables / Outputs</th>
                    <th class="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let s of meta.steps">
                    <td>
                      <span class="step-num-pill">0{{ s.stepNumber }}</span>
                    </td>
                    <td>
                      <strong class="step-main-title">{{ s.name }}</strong>
                      <div *ngIf="s.shortName && s.shortName !== s.name" class="step-short-sub">
                        {{ s.shortName }}
                      </div>
                    </td>
                    <td>
                      <span class="trade-chip">{{ s.tradeOrTeam }}</span>
                    </td>
                    <td class="objective-cell">
                      {{ s.objective }}
                    </td>
                    <td class="deliverables-cell">
                      <span class="deliv-text-box">{{ s.deliverables }}</span>
                    </td>
                    <td class="text-right">
                      <button class="btn btn-secondary btn-xs open-sub-btn" (click)="openPhaseInProject(stageName, s.name)">
                        View Tasks &rarr;
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- 2. Stage-by-Stage Operational Breakdown -->
          <div class="operational-breakdown-card card">
            <div class="section-title-bar">
              <div class="title-left">
                <span class="table-index-badge">2</span>
                <h3>Stage-by-Stage Operational Breakdown</h3>
              </div>
              <span class="sop-std-pill blue">Execution Focus &amp; Exit Quality Gates</span>
            </div>

            <div class="op-steps-grid">
              <div *ngFor="let s of meta.steps" class="op-step-box card">
                <div class="op-box-top">
                  <div class="op-box-title">
                    <span class="op-num-circle">0{{ s.stepNumber }}</span>
                    <h4>{{ s.name }}</h4>
                  </div>
                  <span class="op-trade-badge">{{ s.tradeOrTeam }}</span>
                </div>

                <!-- Sales Action & Goal if available -->
                <div *ngIf="s.action" class="op-callout-row action-row">
                  <strong class="callout-label">⚡ Action:</strong>
                  <p class="callout-text">{{ s.action }}</p>
                </div>
                <div *ngIf="s.goal" class="op-callout-row goal-row">
                  <strong class="callout-label">🎯 Goal:</strong>
                  <p class="callout-text">{{ s.goal }}</p>
                </div>

                <!-- Operational Focus -->
                <div *ngIf="s.focus" class="op-callout-row focus-row">
                  <strong class="callout-label">🔍 Focus:</strong>
                  <p class="callout-text">{{ s.focus }}</p>
                </div>

                <!-- Key Actions Checklist -->
                <div *ngIf="s.keyActions && s.keyActions.length > 0" class="op-checklist-area">
                  <strong class="checklist-header">Key Actions:</strong>
                  <ul class="op-actions-list">
                    <li *ngFor="let a of s.keyActions">
                      <span class="check-bullet">✔</span>
                      <span>{{ a }}</span>
                    </li>
                  </ul>
                </div>

                <!-- Exit Gate -->
                <div *ngIf="s.exitGate" class="op-exit-gate-strip">
                  <span class="exit-label">🚪 Exit Gate:</span>
                  <span class="exit-val">{{ s.exitGate }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ng-template>

    </div>
  `,
  styles: [`
    .flow-container {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      padding-bottom: 3rem;
    }

    .flow-header {
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      color: #ffffff;
      padding: 1.5rem 1.75rem;
      border-radius: var(--radius-lg);
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
      border: 1px solid #334155;
    }

    .header-main {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .header-icon {
      width: 48px;
      height: 48px;
      border-radius: var(--radius-md);
      background: #2563eb;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }

    .header-main h1 {
      font-size: 1.35rem;
      font-weight: 800;
      margin: 0;
      color: #ffffff;
    }

    .header-subtitle {
      font-size: 0.85rem;
      color: #94a3b8;
      margin: 0.2rem 0 0 0;
    }

    .header-tags {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.35rem;
    }

    .flow-pills {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.72rem;
      font-weight: 700;
      background: #1e293b;
      padding: 0.35rem 0.65rem;
      border-radius: 999px;
      border: 1px solid #3b82f6;
      color: #60a5fa;
    }

    .sub-values {
      font-size: 0.72rem;
      color: #94a3b8;
    }

    .flow-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.75rem;
      background: #ffffff;
      padding: 0.65rem 1rem;
      border-radius: var(--radius-md);
      border: 1px solid var(--border-light);
    }

    .flow-nav-tabs {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      flex-wrap: wrap;
    }

    .nav-tab-chip {
      padding: 0.45rem 0.85rem;
      border-radius: 999px;
      font-size: 0.775rem;
      font-weight: 700;
      background: #f1f5f9;
      color: #475569;
      border: 1px solid #e2e8f0;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .nav-tab-chip:hover {
      background: #e2e8f0;
      color: #0f172a;
    }

    .nav-tab-chip.active {
      background: #1e3a8a;
      color: #ffffff;
      border-color: #1e3a8a;
      box-shadow: 0 2px 4px rgba(30, 58, 138, 0.2);
    }

    /* Lifecycle Tree View */
    .lifecycle-intro-card {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.25rem;
      padding: 1.25rem 1.5rem;
    }

    .intro-badge {
      display: inline-block;
      font-size: 0.7rem;
      font-weight: 800;
      text-transform: uppercase;
      background: #eff6ff;
      color: #1d4ed8;
      padding: 0.2rem 0.55rem;
      border-radius: 999px;
      margin-bottom: 0.35rem;
    }

    .intro-left h2 {
      font-size: 1.25rem;
      font-weight: 800;
      color: #0f172a;
      margin: 0;
    }

    .intro-left p {
      font-size: 0.825rem;
      color: #64748b;
      margin: 0.25rem 0 0 0;
    }

    .ascii-diagram-card {
      margin-bottom: 1.25rem;
      padding: 1rem 1.25rem;
      background: #0f172a;
      color: #f8fafc;
      border: 1px solid #334155;
    }

    .ascii-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
      font-size: 0.8rem;
    }

    .copy-hint-btn {
      background: #1e293b;
      color: #94a3b8;
      border: 1px solid #475569;
      padding: 0.25rem 0.55rem;
      border-radius: 4px;
      font-size: 0.7rem;
      font-weight: 700;
      cursor: pointer;
    }

    .copy-hint-btn:hover {
      background: #334155;
      color: #ffffff;
    }

    .ascii-code-block {
      font-family: 'Consolas', 'Courier New', monospace;
      font-size: 0.775rem;
      line-height: 1.45;
      color: #38bdf8;
      overflow-x: auto;
      margin: 0;
      padding: 0.5rem 0;
    }

    /* Flow Tree Cards */
    .flowchart-tree {
      display: flex;
      flex-direction: column;
      align-items: stretch;
    }

    .phase-flow-card {
      padding: 1.25rem 1.5rem;
      cursor: pointer;
      transition: all 0.15s ease;
      border-left: 4px solid #2563eb;
    }

    .phase-flow-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      border-color: #1d4ed8;
    }

    .phase-flow-card.highlight-kitchen {
      border-left-color: #f59e0b;
      background: #fffdf5;
    }

    .phase-card-top {
      display: flex;
      align-items: flex-start;
      gap: 1.25rem;
      margin-bottom: 1rem;
    }

    .phase-id-col {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.25rem;
    }

    .phase-idx-circle {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: #eff6ff;
      color: #1d4ed8;
      font-size: 0.9rem;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid #bfdbfe;
    }

    .phase-icon-emoji {
      font-size: 1.15rem;
    }

    .phase-heading-col {
      flex: 1;
    }

    .phase-title-row {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      flex-wrap: wrap;
    }

    .phase-title-row h3 {
      font-size: 1.1rem;
      font-weight: 800;
      color: #0f172a;
      margin: 0;
    }

    .kitchen-models-tag {
      font-size: 0.7rem;
      font-weight: 700;
      background: #fef3c7;
      color: #92400e;
      padding: 0.15rem 0.5rem;
      border-radius: 999px;
      border: 1px solid #fde68a;
    }

    .phase-steps-count-badge {
      font-size: 0.7rem;
      font-weight: 700;
      background: #f1f5f9;
      color: #475569;
      padding: 0.15rem 0.5rem;
      border-radius: 999px;
    }

    .phase-desc-text {
      font-size: 0.825rem;
      color: #64748b;
      margin: 0.35rem 0 0 0;
      line-height: 1.4;
    }

    .substeps-flow-box {
      background: #f8fafc;
      padding: 0.75rem 1rem;
      border-radius: var(--radius-md);
      border: 1px solid var(--border-light);
    }

    .substeps-box-label {
      font-size: 0.725rem;
      color: #475569;
      margin-bottom: 0.4rem;
    }

    .substep-chain-scroll {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      overflow-x: auto;
      padding-bottom: 0.25rem;
    }

    .substep-chip-item {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      background: #ffffff;
      padding: 0.3rem 0.6rem;
      border-radius: var(--radius-sm);
      border: 1px solid #cbd5e1;
      white-space: nowrap;
      font-size: 0.75rem;
    }

    .chip-step-idx {
      font-weight: 800;
      color: #2563eb;
      font-size: 0.7rem;
    }

    .chip-step-name {
      font-weight: 600;
      color: #1e293b;
    }

    .chain-chevron {
      color: #94a3b8;
      font-size: 0.75rem;
    }

    .tree-connector {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin: 0.35rem 0;
    }

    .connector-line {
      width: 2px;
      height: 20px;
      background: #94a3b8;
    }

    .connector-arrow {
      color: #2563eb;
      font-size: 0.85rem;
      line-height: 0.9;
    }

    /* FLOW DETAIL VIEW & HERO CARDS */
    .flow-stage-section {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .flow-hero-card {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      background: #ffffff;
      border-left: 5px solid #2563eb;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .hero-left {
      display: flex;
      align-items: flex-start;
      gap: 1.25rem;
      max-width: 800px;
    }

    .hero-icon-box {
      width: 52px;
      height: 52px;
      background: #eff6ff;
      border: 2px solid #bfdbfe;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.75rem;
      flex-shrink: 0;
    }

    .hero-subtag {
      font-size: 0.7rem;
      font-weight: 800;
      text-transform: uppercase;
      background: #eff6ff;
      color: #1d4ed8;
      padding: 0.15rem 0.5rem;
      border-radius: 999px;
      display: inline-block;
      margin-bottom: 0.25rem;
    }

    .hero-left h2 {
      font-size: 1.35rem;
      font-weight: 800;
      color: #0f172a;
      margin: 0;
    }

    .hero-desc {
      font-size: 0.85rem;
      color: #475569;
      margin: 0.35rem 0 0.65rem 0;
      line-height: 1.45;
    }

    .hero-meta-strip {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .meta-tag {
      font-size: 0.725rem;
      font-weight: 700;
      padding: 0.2rem 0.5rem;
      background: #f1f5f9;
      color: #475569;
      border-radius: var(--radius-sm);
    }

    .meta-tag.blue { background: #eff6ff; color: #1d4ed8; }
    .meta-tag.green { background: #f0fdf4; color: #15803d; }

    .hero-open-btn {
      padding: 0.55rem 1rem;
      font-weight: 700;
    }

    /* ASCII CARD */
    .flow-ascii-card {
      background: #0f172a;
      border: 1px solid #334155;
      padding: 1rem 1.25rem;
      color: #f8fafc;
    }

    .ascii-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .terminal-dots {
      color: #ef4444;
      font-size: 0.7rem;
      letter-spacing: 2px;
    }

    /* SECTION TITLE BAR */
    .section-title-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.25rem;
      border-bottom: 1px solid var(--border-light);
      background: #f8fafc;
    }

    .title-left {
      display: flex;
      align-items: center;
      gap: 0.65rem;
    }

    .table-index-badge {
      width: 24px;
      height: 24px;
      background: #1e3a8a;
      color: white;
      border-radius: 50%;
      font-size: 0.75rem;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .section-title-bar h3 {
      font-size: 1.05rem;
      font-weight: 800;
      color: #0f172a;
      margin: 0;
    }

    .sop-std-pill {
      font-size: 0.7rem;
      font-weight: 700;
      padding: 0.2rem 0.55rem;
      background: #f1f5f9;
      color: #475569;
      border-radius: 999px;
      border: 1px solid #cbd5e1;
    }

    .sop-std-pill.blue {
      background: #eff6ff;
      color: #1d4ed8;
      border-color: #bfdbfe;
    }

    /* DATA TABLE */
    .table-responsive {
      overflow-x: auto;
    }

    .sop-data-table {
      margin: 0;
    }

    .step-num-pill {
      font-weight: 800;
      color: #1d4ed8;
      background: #eff6ff;
      padding: 0.2rem 0.45rem;
      border-radius: 4px;
      font-size: 0.775rem;
    }

    .step-main-title {
      font-size: 0.85rem;
      color: #0f172a;
    }

    .step-short-sub {
      font-size: 0.7rem;
      color: #64748b;
    }

    .trade-chip {
      display: inline-block;
      font-size: 0.725rem;
      font-weight: 700;
      background: #f1f5f9;
      color: #334155;
      padding: 0.25rem 0.55rem;
      border-radius: 4px;
      border: 1px solid #e2e8f0;
      white-space: nowrap;
    }

    .objective-cell {
      font-size: 0.825rem;
      color: #334155;
      line-height: 1.4;
      max-width: 280px;
    }

    .deliverables-cell {
      max-width: 300px;
    }

    .deliv-text-box {
      display: inline-block;
      font-size: 0.8rem;
      color: #047857;
      background: #ecfdf5;
      padding: 0.3rem 0.55rem;
      border-radius: 4px;
      border: 1px solid #a7f3d0;
      line-height: 1.35;
    }

    .open-sub-btn {
      white-space: nowrap;
      font-size: 0.72rem;
      padding: 0.25rem 0.5rem;
    }

    /* OPERATIONAL BREAKDOWN GRID */
    .op-steps-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
      gap: 1rem;
      padding: 1.25rem;
    }

    .op-step-box {
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
      padding: 1rem 1.15rem;
      background: #ffffff;
      border: 1px solid var(--border-light);
      border-radius: var(--radius-md);
      transition: all 0.15s ease;
    }

    .op-step-box:hover {
      border-color: #3b82f6;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
    }

    .op-box-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 0.5rem;
      border-bottom: 1px solid var(--border-light);
      padding-bottom: 0.65rem;
    }

    .op-box-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .op-num-circle {
      width: 26px;
      height: 26px;
      background: #1e3a8a;
      color: white;
      border-radius: 50%;
      font-size: 0.72rem;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .op-box-title h4 {
      font-size: 0.95rem;
      font-weight: 800;
      color: #0f172a;
      margin: 0;
    }

    .op-trade-badge {
      font-size: 0.7rem;
      font-weight: 700;
      background: #eff6ff;
      color: #1d4ed8;
      padding: 0.15rem 0.45rem;
      border-radius: 4px;
      white-space: nowrap;
    }

    .op-callout-row {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
    }

    .callout-label {
      font-size: 0.725rem;
      font-weight: 800;
      color: #475569;
    }

    .callout-text {
      font-size: 0.8rem;
      color: #334155;
      margin: 0;
      line-height: 1.35;
    }

    .action-row {
      background: #eff6ff;
      padding: 0.45rem 0.65rem;
      border-radius: 4px;
      border-left: 3px solid #2563eb;
    }
    .action-row .callout-label { color: #1d4ed8; }

    .goal-row {
      background: #f0fdf4;
      padding: 0.45rem 0.65rem;
      border-radius: 4px;
      border-left: 3px solid #16a34a;
    }
    .goal-row .callout-label { color: #15803d; }

    .focus-row {
      background: #f8fafc;
      padding: 0.45rem 0.65rem;
      border-radius: 4px;
      border-left: 3px solid #64748b;
    }

    .op-checklist-area {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    .checklist-header {
      font-size: 0.725rem;
      font-weight: 800;
      color: #334155;
    }

    .op-actions-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    .op-actions-list li {
      font-size: 0.775rem;
      color: #475569;
      display: flex;
      align-items: flex-start;
      gap: 0.4rem;
      line-height: 1.35;
    }

    .check-bullet {
      color: #16a34a;
      font-weight: 800;
      font-size: 0.75rem;
      flex-shrink: 0;
    }

    .op-exit-gate-strip {
      display: flex;
      align-items: flex-start;
      gap: 0.35rem;
      background: #fefce8;
      padding: 0.45rem 0.65rem;
      border-radius: 4px;
      border: 1px solid #fef08a;
      font-size: 0.75rem;
      margin-top: auto;
    }

    .exit-label {
      font-weight: 800;
      color: #a16207;
      flex-shrink: 0;
    }

    .exit-val {
      color: #713f12;
      font-weight: 600;
      line-height: 1.3;
    }

    /* ROLE PERSPECTIVES */
    .perspective-section {
      background: #ffffff;
      border: 1px solid var(--border-light);
      border-radius: var(--radius-lg);
      padding: 1.5rem;
      margin-bottom: 1.5rem;
    }

    .perspective-heading {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.25rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid var(--border-light);
    }

    .icon-circle {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: #eff6ff;
      color: #1d4ed8;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .icon-circle.sm-icon {
      background: #ecfdf5;
      color: #047857;
    }

    .heading-text h2 {
      font-size: 1.15rem;
      font-weight: 800;
      color: #0f172a;
      margin: 0;
    }

    .heading-text p {
      font-size: 0.825rem;
      color: #64748b;
      margin: 0;
    }

    .steps-flow-row {
      display: flex;
      align-items: stretch;
      gap: 0.75rem;
      overflow-x: auto;
      padding-bottom: 0.5rem;
    }

    .step-card {
      min-width: 175px;
      max-width: 200px;
      background: #f8fafc;
      border: 1px solid var(--border-light);
      border-radius: var(--radius-md);
      padding: 0.85rem;
      display: flex;
      flex-direction: column;
      cursor: pointer;
      transition: all 0.15s;
    }

    .step-card:hover {
      background: #ffffff;
      border-color: #3b82f6;
    }

    .step-badge {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: #1e3a8a;
      color: white;
      font-size: 0.7rem;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 0.4rem;
    }

    .step-badge.sm-badge {
      background: #047857;
    }

    .step-title {
      font-size: 0.85rem;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 0.4rem;
    }

    .step-bullets {
      list-style: disc;
      padding-left: 1rem;
      margin: 0 0 0.75rem 0;
      flex: 1;
    }

    .step-bullets li {
      font-size: 0.7rem;
      color: #475569;
      line-height: 1.35;
      margin-bottom: 0.2rem;
    }

    .step-action-btn {
      width: 100%;
      padding: 0.35rem 0.5rem;
      font-size: 0.7rem;
      font-weight: 700;
      background: #eff6ff;
      color: #1d4ed8;
      border: 1px solid #bfdbfe;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.15s;
    }

    .step-action-btn:hover {
      background: #2563eb;
      color: white;
    }

    .step-action-btn.sm-btn {
      background: #ecfdf5;
      color: #047857;
      border-color: #a7f3d0;
    }

    .step-action-btn.sm-btn:hover {
      background: #059669;
      color: white;
    }

    .flow-arrow {
      display: flex;
      align-items: center;
      color: #94a3b8;
      font-size: 1.1rem;
    }

    .text-right { text-align: right; }
  `]
})
export class FlowDiagramComponent {
  public pmsService = inject(PmsDataService);

  public activeTab: FlowTab = 'execution-lifecycle';
  public showAsciiModal = false;

  public allStages = PROJECT_STAGES;
  public stagesMetadata: Record<string, StageMetadata> = STAGES_METADATA;

  public getStageMeta(stageName: string): StageMetadata {
    return this.stagesMetadata[stageName] || this.stagesMetadata['Sales Phase'];
  }

  public asciiMasterDiagram = `1. Sales Phase (Lead Capture ➔ Demo ➔ Scope Alignment ➔ Rough Quote ➔ Token ➔ Handover)
       │
       ▼
 2. Design Phase (Site Measurements ➔ Initial 3D ➔ Selections ➔ Final 3D ➔ Site Validation ➔ 2D Drawings ➔ KT)
       │
       ▼
 3. False Ceiling Phase (Protection ➔ Framing ➔ Insulation ➔ Wiring ➔ AC Piping ➔ Woodwork ➔ Board Fixing ➔ Painting ➔ Electrical ➔ Cleaning)
       │
       ▼
 4. Civil Works Phase (Demolition ➔ Reconstruction ➔ Punning ➔ Plumbing ➔ Electrical)
       │
       ▼
 5. Site Manual Finishing Phase (Woodwork ➔ Stone & Marble ➔ Polish/PU ➔ Wall Painting ➔ Final Cleaning)
       │
       ▼
 6. Production Phase (Forward to Factory ➔ Cutlist ➔ R1 Review ➔ R2 Recheck ➔ Approval ➔ BOM ➔ Stock Check ➔ Procurement ➔ Production Start)
       │
       ▼
 7. Modular Assembly Phase (Carcase ➔ Drawers ➔ Lighting ➔ Accessories ➔ Shutters ➔ Skirting ➔ L1/L2 QC)
       │
       ▼
 8. Kitchen Workflow: Dry / Wet / Utility Models (Bottom Cabinets ➔ Stone ➔ Backsplash ➔ Sink/Hob ➔ Rest of Cabinets ➔ Profile Lights ➔ Accessories ➔ Shutters ➔ Skirting ➔ Cleaning)
       │
       ▼
 9. Finishing Flow (Wall Papers ➔ Texture Painting ➔ Curtains ➔ Loose Furniture ➔ Appliances ➔ Sanitization ➔ Snag Inspection)`;

  public goToStep(role: 'admin' | 'site-manager', view: string, projectId?: string) {
    this.pmsService.setRole(role);
    this.pmsService.navigateTo(view, projectId);
  }

  public openPhaseInProject(stage: ProjectStage, subStepFilter?: string) {
    const projects = this.pmsService.projects();
    const targetProj = this.pmsService.selectedProject() || (projects.length > 0 ? projects[0] : null);
    if (targetProj) {
      this.pmsService.selectedStage.set(stage);
      this.pmsService.selectedSubStep.set(subStepFilter || '');
      this.pmsService.navigateTo('project-detail', targetProj.id);
    }
  }

  public copyDiagramText(text: string) {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      alert('Execution flow copied to clipboard!');
    } else {
      alert(text);
    }
  }
}
