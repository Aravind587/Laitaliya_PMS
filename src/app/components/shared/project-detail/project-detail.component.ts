import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PmsDataService } from '../../../services/pms-data.service';
import { 
  Project, 
  Task, 
  ProjectStage, 
  TaskStatus, 
  TASK_STATUS_CONFIG, 
  PROJECT_STAGES, 
  STAGES_METADATA,
  KitchenModel,
  StageStepDetail 
} from '../../../models/pms.models';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="project-detail-wrapper animate-fade-in" *ngIf="currentProject; else noProject">
      <!-- Top Breadcrumb & Step Info -->
      <div class="top-nav-bar">
        <button class="btn btn-secondary btn-sm" (click)="pmsService.navigateTo('projects')">
          &larr; Back to Projects
        </button>
        <div class="step-indicator">
          <span class="step-badge-mini">{{ pmsService.userRole() === 'admin' ? 'Admin Step 5' : 'Site Manager Step 4' }}</span>
          <span>9-Phase Interior Project Execution Lifecycle</span>
        </div>
      </div>

      <!-- Project Header Card -->
      <div class="card project-header-card">
        <div class="project-header-main">
          <div class="project-title-area">
            <div class="title-with-status">
              <h2>{{ currentProject.name }}</h2>
              <span class="status-pill" [ngClass]="getProjectStatusClass(currentProject.status)">
                <span class="status-dot"></span>
                {{ currentProject.status }}
              </span>
              <span *ngIf="currentProject.kitchenModel" class="kitchen-header-pill">
                🍳 {{ currentProject.kitchenModel }}
              </span>
            </div>
            <p class="project-submeta">
              <span>Client: <strong>{{ currentProject.client }}</strong></span>
              <span class="meta-dot">&bull;</span>
              <span>Location: <strong>{{ currentProject.location }}</strong></span>
              <span class="meta-dot">&bull;</span>
              <span>Site Manager: <strong>{{ currentProject.siteManagerName }}</strong></span>
              <span class="meta-dot">&bull;</span>
              <span>Budget: <strong>{{ currentProject.budget }}</strong></span>
            </p>
          </div>

          <div class="header-right-stats">
            <div class="project-progress-ring-box">
              <div class="ring-circle">
                <span class="ring-percent">{{ currentProject.progressPercent }}%</span>
                <span class="ring-label">Complete</span>
              </div>
            </div>
            <button class="btn btn-outline btn-sm auto-all-btn" (click)="populateAllProjectPhases()" title="Provision standard sub-step tasks across all 9 execution phases for this project">
              ⚡ Auto-Generate All 9 Phases
            </button>
            <button *ngIf="pmsService.userRole() === 'admin'" class="btn btn-primary btn-sm" (click)="showAddTaskModal = true">
              + Add Task
            </button>
          </div>
        </div>

        <!-- Navigation Tabs: Stages & Tasks, Overview, Files, Timeline -->
        <div class="project-tabs-nav">
          <button 
            class="tab-btn" 
            [class.active]="activeTab === 'stages-tasks'" 
            (click)="activeTab = 'stages-tasks'">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 20h9"/>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
            9 Stages &amp; Tasks
          </button>
          <button 
            class="tab-btn" 
            [class.active]="activeTab === 'overview'" 
            (click)="activeTab = 'overview'">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="16" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
            Overview
          </button>
          <button 
            class="tab-btn" 
            [class.active]="activeTab === 'files'" 
            (click)="activeTab = 'files'">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
            Files ({{ currentProject.filesCount || 8 }})
          </button>
          <button 
            class="tab-btn" 
            [class.active]="activeTab === 'timeline'" 
            (click)="activeTab = 'timeline'">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            9-Phase Timeline &amp; Gantt
          </button>
        </div>
      </div>

      <!-- TAB 1: STAGES & TASKS (Core view of Step 5) -->
      <div *ngIf="activeTab === 'stages-tasks'" class="stages-tasks-container">
        <!-- All 9 Phases Completed Project Celebration Banner -->
        <div *ngIf="isProjectFullyCompleted()" class="project-fully-completed-banner animate-fade-in card">
          <div class="pfc-left">
            <span class="pfc-trophy">🏆</span>
            <div>
              <strong>Turnkey Project Handover Complete! (All 9 Execution Phases 100% Finished)</strong>
              <p>All architectural, manufacturing, civil, modular, and kitchen deliverables have been verified and signed off for {{ currentProject.name }}.</p>
            </div>
          </div>
          <button class="btn btn-primary btn-sm pfc-btn" (click)="activeTab = 'timeline'">
            View 9-Phase Audit Gantt &rarr;
          </button>
        </div>

        <!-- 9-Stage Stepper Navigation Bar -->
        <div class="stages-stepper-bar card">
          <div class="stepper-track">
            <div 
              *ngFor="let stage of allStages; let i = index" 
              class="stepper-item"
              [class.active]="currentStage === stage"
              (click)="selectStage(stage)">
              <div class="step-circle">
                <span *ngIf="isStageCompleted(stage)">✓</span>
                <span *ngIf="!isStageCompleted(stage)">0{{ i + 1 }}</span>
              </div>
              <div class="step-meta">
                <span class="step-title">{{ getStageShortName(stage) }}</span>
                <span class="step-subcount">{{ getStageTasks(stage).length }} tasks</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Stage Tasks Content -->
        <div class="stage-content-card card">
          <!-- Stage Header -->
          <div class="stage-content-header">
            <div>
              <div class="phase-badge-pill">
                Phase 0{{ getCurrentPhaseNumber(currentStage) }} of 09
              </div>
              <h3>{{ currentStage }}</h3>
              <p class="stage-caption">{{ getStageDescription(currentStage) }}</p>
            </div>

            <div class="stage-header-actions">
              <div class="phase-nav-arrows">
                <button 
                  class="btn btn-secondary btn-sm nav-arrow-btn" 
                  [disabled]="!hasPrevPhase()" 
                  (click)="goToPrevPhase()" 
                  title="Navigate to previous execution phase">
                  &larr; Prev Phase
                </button>
                <button 
                  class="btn btn-secondary btn-sm nav-arrow-btn" 
                  [disabled]="!hasNextPhase()" 
                  (click)="goToNextPhase()" 
                  title="Navigate to next execution phase">
                  Next Phase &rarr;
                </button>
              </div>

              <button 
                class="btn btn-outline btn-sm auto-gen-btn" 
                (click)="autoPopulatePhaseTasks()" 
                title="Automatically generate standard sub-step tasks from the official lifecycle flowchart">
                + Auto-Generate Phase Tasks
              </button>
              <button 
                *ngIf="!isStageCompleted(currentStage) && getStageTasks(currentStage).length > 0" 
                class="btn btn-success btn-sm signoff-btn" 
                (click)="completeCurrentPhase()" 
                title="Mark all sub-step milestone tasks in this phase as Completed">
                ✓ Sign-off Phase
              </button>
              <button class="btn btn-primary btn-sm" (click)="openAddTaskForStage(currentStage)">
                + Add Task to Phase
              </button>
            </div>
          </div>

          <!-- Phase Completion & Advancement Banner -->
          <div *ngIf="isStageCompleted(currentStage)" class="phase-completion-banner animate-fade-in">
            <div class="completion-banner-left">
              <span class="completion-badge-icon">✓</span>
              <div>
                <strong>Phase 0{{ getCurrentPhaseNumber(currentStage) }} ({{ currentStage }}) is 100% Completed!</strong>
                <p>All {{ getStageTasks(currentStage).length }} sub-step milestone tasks have been successfully executed and completed.</p>
              </div>
            </div>
            <button *ngIf="hasNextPhase()" class="btn btn-primary btn-sm advance-phase-action" (click)="goToNextPhase()">
              Advance to Phase 0{{ getCurrentPhaseNumber(getNextPhaseName()!) }}: {{ getNextPhaseName() }} &rarr;
            </button>
          </div>

          <!-- Phase 8: Kitchen Models Selector (Dry / Wet / Utility) -->
          <div *ngIf="currentStage === 'Kitchen Workflow'" class="kitchen-models-panel">
            <div class="km-info-row">
              <div class="km-title-group">
                <span class="km-icon">🍳</span>
                <div>
                  <strong>Kitchen Workflow Models</strong>
                  <p>Select the active kitchen layout model for this project or switch to view model tasks:</p>
                </div>
              </div>
              <div class="km-tabs">
                <button 
                  *ngFor="let km of kitchenModelOptions" 
                  class="km-tab-btn"
                  [class.active]="selectedKitchenModel === km"
                  (click)="setKitchenModel(km)">
                  {{ km }}
                  <span class="km-badge">({{ getKitchenModelTaskCount(km) }})</span>
                </button>
                <button class="btn btn-sm btn-seed-km" (click)="seedKitchenModelTasks(selectedKitchenModel)" title="Seed all 10 standard installation steps for this kitchen model">
                  + Seed 10-Step {{ selectedKitchenModel }} Tasks
                </button>
              </div>
            </div>
          </div>

          <!-- Sub-Step Execution Flow Sequence Strip -->
          <div class="substep-flow-strip">
            <div class="substep-strip-header">
              <div class="flow-label-wrap">
                <span class="flow-seq-tag">Phase Execution Sequence</span>
                <span class="flow-summary-code">{{ getStageFlowSummary(currentStage) }}</span>
              </div>
              <button 
                *ngIf="selectedSubStepFilter" 
                class="clear-filter-btn" 
                (click)="selectedSubStepFilter = ''">
                ✕ Show All Tasks ({{ getStageTasks(currentStage).length }})
              </button>
            </div>

            <div class="substep-chain-scroll">
              <button 
                class="substep-pill-btn" 
                [class.active]="selectedSubStepFilter === ''" 
                (click)="selectedSubStepFilter = ''">
                All ({{ getStageTasks(currentStage).length }})
              </button>

              <ng-container *ngFor="let step of currentSubSteps; let sIdx = index">
                <span class="substep-chain-arrow">&rarr;</span>
                <button 
                  class="substep-pill-btn"
                  [class.active]="selectedSubStepFilter === step"
                  (click)="selectSubStepFilter(step)">
                  <span class="substep-idx">{{ sIdx + 1 }}</span>
                  <span class="substep-name">{{ step }}</span>
                  <span class="substep-qty">({{ getSubStepTaskCount(step) }})</span>
                </button>
              </ng-container>
            </div>
          </div>

          <!-- SOP & Operational Standards Section -->
          <div class="sop-explorer-section">
            <div class="sop-toggle-bar">
              <button 
                class="btn btn-outline btn-sm sop-toggle-btn" 
                [class.active]="showSopGuide"
                (click)="showSopGuide = !showSopGuide">
                📋 {{ showSopGuide ? 'Hide Official SOP & Operational Standards' : 'View Stage SOP, Summary Table & Operational Breakdown' }}
              </button>
              <span class="sop-hint-text">
                {{ currentStageSteps.length }} standardized sub-step gates defined for {{ currentStage }}
              </span>
            </div>

            <!-- Collapsible SOP & Stage Standards Card -->
            <div *ngIf="showSopGuide" class="sop-card card animate-fade-in">
              <!-- ASCII Workflow Strip if available -->
              <div *ngIf="currentStageAscii" class="sop-ascii-box">
                <div class="sop-ascii-header">
                  <strong>Sequential Architectural Workflow:</strong>
                </div>
                <pre class="sop-ascii-code">{{ currentStageAscii }}</pre>
              </div>

              <!-- Stage Summary Table -->
              <div class="sop-table-wrap">
                <div class="sop-section-header">
                  <h4>Stage Summary Table</h4>
                  <span class="sop-badge">Official Standard Operating Procedure</span>
                </div>
                <div class="table-responsive">
                  <table class="pms-table sop-summary-table">
                    <thead>
                      <tr>
                        <th style="width: 60px;">Stage</th>
                        <th>Step Name</th>
                        <th>Primary Trade / Team</th>
                        <th>Core Objective</th>
                        <th>Key Deliverables / Outputs</th>
                        <th class="text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let step of currentStageSteps; let idx = index" [class.highlighted]="selectedSubStepFilter === step.name">
                        <td><span class="sop-step-num">0{{ step.stepNumber }}</span></td>
                        <td>
                          <strong>{{ step.name }}</strong>
                          <div *ngIf="step.shortName !== step.name" class="sop-short-name">{{ step.shortName }}</div>
                        </td>
                        <td>
                          <span class="trade-pill">{{ step.tradeOrTeam }}</span>
                        </td>
                        <td class="sop-obj-cell">{{ step.objective }}</td>
                        <td class="sop-deliv-cell">
                          <span class="deliv-text">{{ step.deliverables }}</span>
                        </td>
                        <td class="text-right">
                          <button class="btn btn-secondary btn-xs" (click)="selectSubStepFilter(step.name)" title="Filter tasks for this step">
                            Filter
                          </button>
                          <button class="btn btn-primary btn-xs" style="margin-left: 0.35rem;" (click)="createTaskForSubStep(step.name)" title="Add task for this step">
                            + Task
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Stage-by-Stage Operational Breakdown -->
              <div class="sop-breakdown-wrap">
                <div class="sop-section-header">
                  <h4>Stage-by-Stage Operational Breakdown</h4>
                  <span class="sop-submeta">Execution parameters, action checklists, and exit quality gates</span>
                </div>

                <div class="sop-steps-grid">
                  <div *ngFor="let step of currentStageSteps" class="sop-step-card card">
                    <div class="sop-card-header">
                      <div class="sop-card-title">
                        <span class="sop-circle">0{{ step.stepNumber }}</span>
                        <h5>{{ step.name }}</h5>
                      </div>
                      <span class="trade-tag">{{ step.tradeOrTeam }}</span>
                    </div>

                    <!-- Sales specific Action & Goal if available -->
                    <div *ngIf="step.action" class="sop-field-row action-callout">
                      <strong class="field-label blue">⚡ Action:</strong>
                      <p class="field-val">{{ step.action }}</p>
                    </div>
                    <div *ngIf="step.goal" class="sop-field-row goal-callout">
                      <strong class="field-label green">🎯 Goal:</strong>
                      <p class="field-val">{{ step.goal }}</p>
                    </div>

                    <!-- Focus -->
                    <div *ngIf="step.focus" class="sop-field-row focus-callout">
                      <strong class="field-label">🔍 Focus:</strong>
                      <p class="field-val">{{ step.focus }}</p>
                    </div>

                    <!-- Key Actions List -->
                    <div *ngIf="step.keyActions && step.keyActions.length > 0" class="sop-actions-list-box">
                      <strong class="field-label">📋 Key Actions Checklist:</strong>
                      <ul class="sop-checklist">
                        <li *ngFor="let act of step.keyActions">
                          <span class="check-bullet">✔</span> {{ act }}
                        </li>
                      </ul>
                    </div>

                    <!-- Exit Gate -->
                    <div *ngIf="step.exitGate" class="sop-exit-gate-box">
                      <span class="exit-gate-label">🚪 Exit Gate:</span>
                      <span class="exit-gate-text">{{ step.exitGate }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Filter Counter Status -->
          <div class="tasks-filter-info">
            <span *ngIf="!selectedSubStepFilter">
              Showing all <strong>{{ filteredStageTasks.length }}</strong> tasks in {{ currentStage }}
            </span>
            <span *ngIf="selectedSubStepFilter">
              Filtered by Sub-Step: <strong>{{ selectedSubStepFilter }}</strong> ({{ filteredStageTasks.length }} tasks)
            </span>
          </div>

          <!-- Tasks Table -->
          <div class="table-container">
            <table class="pms-table">
              <thead>
                <tr>
                  <th>Task Name &amp; Sub-Step</th>
                  <th>Status</th>
                  <th>Due Date</th>
                  <th>Remarks / Site Notes</th>
                  <th class="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let t of filteredStageTasks" class="task-row">
                  <td>
                    <div class="task-name-cell">
                      <span class="task-name-title">{{ t.name }}</span>
                      <div class="task-badges-row">
                        <span *ngIf="t.subStep" class="substep-tag">
                          Step: {{ t.subStep }}
                        </span>
                        <span *ngIf="t.kitchenModel" class="kitchen-tag">
                          🍳 {{ t.kitchenModel }}
                        </span>
                        <span *ngIf="t.isForgotten" class="forgotten-badge">
                          ⚠️ Needs Attention (Overdue)
                        </span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span class="status-pill" [ngClass]="getStatusClass(t.status)">
                      <span class="status-dot"></span>
                      {{ t.status }}
                    </span>
                  </td>
                  <td>
                    <span class="due-date-pill">
                      📅 {{ t.dueDate }}
                    </span>
                  </td>
                  <td>
                    <div class="remarks-cell">
                      <span>{{ t.remarks || 'No notes added yet' }}</span>
                      <small *ngIf="t.lastUpdated" class="last-up-text">Updated: {{ t.lastUpdated }}</small>
                    </div>
                  </td>
                  <td class="text-right">
                    <div class="task-action-btns">
                      <button class="btn btn-primary btn-sm update-status-btn" (click)="openStatusModal(t)">
                        Update Status
                      </button>
                      <button class="btn-icon-danger" (click)="deleteTask(t)" title="Delete task">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>

                <tr *ngIf="filteredStageTasks.length === 0">
                  <td colspan="5" class="empty-stage-cell">
                    <p>No tasks currently scheduled for <strong>{{ currentStage }}</strong>{{ selectedSubStepFilter ? ' in step ' + selectedSubStepFilter : '' }}.</p>
                    <div class="empty-actions">
                      <button *ngIf="selectedSubStepFilter" class="btn btn-primary btn-sm" (click)="createTaskForSubStep(selectedSubStepFilter)">
                        + Create Task for {{ selectedSubStepFilter }}
                      </button>
                      <button class="btn btn-primary btn-sm" (click)="autoPopulatePhaseTasks()">
                        + Auto-Generate Standard Tasks
                      </button>
                      <button class="btn btn-outline btn-sm" (click)="openAddTaskForStage(currentStage)">
                        + Create Custom Task
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- TAB 2: OVERVIEW -->
      <div *ngIf="activeTab === 'overview'" class="tab-pane-card card animate-fade-in">
        <h3>Project Specification &amp; Deliverables</h3>
        <p class="lead-desc">{{ currentProject.description }}</p>

        <div class="overview-grid">
          <div class="info-metric-box">
            <span class="metric-label">Client Contact</span>
            <strong>{{ currentProject.client }}</strong>
            <small>contracts&#64;client.com | +91 94400 55555</small>
          </div>
          <div class="info-metric-box">
            <span class="metric-label">Target Completion</span>
            <strong>{{ currentProject.endDate }}</strong>
            <small>Started on: {{ currentProject.startDate }}</small>
          </div>
          <div class="info-metric-box">
            <span class="metric-label">Assigned Site Supervisor</span>
            <strong>{{ currentProject.siteManagerName }}</strong>
            <small>Daily shift supervisor (Site check at 08:30 AM)</small>
          </div>
          <div class="info-metric-box">
            <span class="metric-label">Kitchen Workflow Model</span>
            <strong>{{ currentProject.kitchenModel || 'Dry Kitchen' }}</strong>
            <small>Bottom Cabinets ➔ Stone ➔ Countertop/Backsplash</small>
          </div>
          <div class="info-metric-box">
            <span class="metric-label">Execution Lifecycle</span>
            <strong>9-Phase Standard</strong>
            <small>From Sales to Finishing Flow</small>
          </div>
          <div class="info-metric-box">
            <span class="metric-label">Contract Scope</span>
            <strong>Turnkey Interior Fitout</strong>
            <small>Italian flooring, false ceiling, modular cabinetry</small>
          </div>
        </div>
      </div>

      <!-- TAB 3: FILES -->
      <div *ngIf="activeTab === 'files'" class="tab-pane-card card animate-fade-in">
        <div class="files-header">
          <div>
            <h3>Project Blueprints &amp; Site Photos</h3>
            <p class="sub-caption">Access working drawings, 3D renderings, and BoQ spreadsheets</p>
          </div>
          <button class="btn btn-outline btn-sm" (click)="triggerUploadSim()">+ Upload File / Photo</button>
        </div>

        <div class="files-grid">
          <div class="file-card" *ngFor="let file of mockFiles">
            <div class="file-icon-box" [ngClass]="file.type">{{ file.type.toUpperCase() }}</div>
            <div class="file-meta">
              <span class="file-name">{{ file.name }}</span>
              <span class="file-size">{{ file.size }} &bull; Uploaded {{ file.uploadedAt }}</span>
            </div>
            <button class="btn btn-outline btn-sm" (click)="downloadSim(file.name)">View</button>
          </div>
        </div>
      </div>

      <!-- TAB 4: 9-PHASE TIMELINE -->
      <div *ngIf="activeTab === 'timeline'" class="tab-pane-card card animate-fade-in">
        <h3>9-Phase Milestone Timeline &amp; Gantt Schedule</h3>
        <p class="sub-caption">Sequential lifecycle mapping from Sales Phase to Finishing Flow</p>

        <div class="gantt-flow">
          <div *ngFor="let stage of allStages; let idx = index" class="gantt-row">
            <div class="gantt-label">
              <div class="gantt-title-line">
                <span class="gantt-phase-badge">Phase 0{{ idx + 1 }}</span>
                <strong>{{ stage }}</strong>
              </div>
              <small>{{ getStageTasks(stage).length }} tasks &bull; {{ getStageFlowSummary(stage) }}</small>
            </div>
            <div class="gantt-bar-wrap">
              <div 
                class="gantt-bar" 
                [style.width.%]="getStageProgress(stage)"
                [ngClass]="getStageProgress(stage) === 100 ? 'bar-complete' : 'bar-active'">
                {{ getStageProgress(stage) }}% Done
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- UPDATE TASK STATUS MODAL (Allows updating with all 5 status options) -->
      <div *ngIf="showStatusModal && selectedTask" class="modal-overlay" (click)="closeStatusModal()">
        <div class="modal-dialog" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div>
              <h3>Update Task Status</h3>
              <p class="modal-sub">{{ selectedTask.name }} ({{ selectedTask.stage }}{{ selectedTask.subStep ? ' &bull; ' + selectedTask.subStep : '' }})</p>
            </div>
            <button class="close-btn" (click)="closeStatusModal()">×</button>
          </div>

          <div class="modal-body">
            <div class="form-group">
              <label>Select Current Status (5 Options):</label>
              <div class="status-options-grid">
                <div 
                  *ngFor="let opt of statusOptions"
                  class="status-choice-card"
                  [class.selected]="modalStatus === opt"
                  (click)="modalStatus = opt">
                  <span class="status-pill" [ngClass]="getStatusClass(opt)">
                    <span class="status-dot"></span>
                    {{ opt }}
                  </span>
                  <small class="choice-desc">{{ statusConfig[opt].desc }}</small>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label>Site Manager Remarks / Inspection Comments:</label>
              <textarea 
                rows="3" 
                [(ngModel)]="modalRemarks" 
                placeholder="e.g. Work is progressing on track; marble lot verified on site."></textarea>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="closeStatusModal()">Cancel</button>
            <button class="btn btn-primary" (click)="saveTaskStatus()">Save Status Update</button>
          </div>
        </div>
      </div>

      <!-- ADD TASK MODAL (9-Phase & Sub-Step aware) -->
      <div *ngIf="showAddTaskModal" class="modal-overlay" (click)="showAddTaskModal = false">
        <div class="modal-dialog" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Add New Task to {{ currentProject.name }}</h3>
            <button class="close-btn" (click)="showAddTaskModal = false">×</button>
          </div>

          <div class="modal-body">
            <div class="form-group">
              <label>Task Name *</label>
              <input type="text" [(ngModel)]="newTaskName" placeholder="e.g. Laser Survey &amp; 3D Modeling Signoff">
            </div>

            <div class="form-row-2">
              <div class="form-group">
                <label>Phase *</label>
                <select [(ngModel)]="newTaskStage" (ngModelChange)="onNewTaskStageChange($event)">
                  <option *ngFor="let s of allStages; let i = index" [value]="s">
                    0{{ i + 1 }}. {{ s }}
                  </option>
                </select>
              </div>

              <div class="form-group">
                <label>Sub-Step *</label>
                <select [(ngModel)]="newTaskSubStep">
                  <option value="">General (No sub-step)</option>
                  <option *ngFor="let step of getStageSubSteps(newTaskStage)" [value]="step">
                    {{ step }}
                  </option>
                </select>
              </div>
            </div>

            <div *ngIf="newTaskStage === 'Kitchen Workflow'" class="form-group">
              <label>Kitchen Model</label>
              <select [(ngModel)]="newTaskKitchenModel">
                <option *ngFor="let km of kitchenModelOptions" [value]="km">{{ km }}</option>
              </select>
            </div>

            <div class="form-row-2">
              <div class="form-group">
                <label>Initial Status</label>
                <select [(ngModel)]="newTaskStatus">
                  <option *ngFor="let s of statusOptions" [value]="s">{{ s }}</option>
                </select>
              </div>

              <div class="form-group">
                <label>Due Date *</label>
                <input type="text" [(ngModel)]="newTaskDueDate" placeholder="e.g. 24 Sep">
              </div>
            </div>

            <div class="form-group">
              <label>Task Scope / Remarks</label>
              <textarea rows="2" [(ngModel)]="newTaskRemarks" placeholder="Optional notes for site supervisor"></textarea>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="showAddTaskModal = false">Cancel</button>
            <button class="btn btn-primary" (click)="saveNewTask()">Create Task</button>
          </div>
        </div>
      </div>
    </div>

    <ng-template #noProject>
      <div class="empty-detail-card card">
        <h3>No project selected</h3>
        <button class="btn btn-primary" (click)="pmsService.navigateTo('projects')">Go to Projects</button>
      </div>
    </ng-template>
  `,
  styles: [`
    .project-detail-wrapper {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .top-nav-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .step-indicator {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.8125rem;
      color: #64748b;
      font-weight: 600;
    }

    .step-badge-mini {
      background: #eff6ff;
      color: #1d4ed8;
      border: 1px solid #bfdbfe;
      padding: 0.2rem 0.5rem;
      border-radius: var(--radius-full);
      font-size: 0.7rem;
      font-weight: 800;
      text-transform: uppercase;
    }

    .project-header-card {
      padding: 1.5rem 1.5rem 0.5rem;
    }

    .project-header-main {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 1.5rem;
      flex-wrap: wrap;
      margin-bottom: 1.25rem;
    }

    .title-with-status {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.35rem;
      flex-wrap: wrap;
    }

    .title-with-status h2 {
      font-size: 1.5rem;
      font-weight: 800;
      color: #0f172a;
    }

    .kitchen-header-pill {
      font-size: 0.75rem;
      font-weight: 700;
      background: #fff7ed;
      color: #c2410c;
      border: 1px solid #fed7aa;
      padding: 0.25rem 0.65rem;
      border-radius: var(--radius-full);
    }

    .project-submeta {
      font-size: 0.825rem;
      color: #475569;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .meta-dot {
      color: #cbd5e1;
    }

    .header-right-stats {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .project-progress-ring-box {
      display: flex;
      align-items: center;
    }

    .ring-circle {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: #eff6ff;
      border: 3px solid #3b82f6;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    .ring-percent {
      font-size: 0.875rem;
      font-weight: 800;
      color: #1d4ed8;
      line-height: 1;
    }

    .ring-label {
      font-size: 0.55rem;
      color: #64748b;
      font-weight: 700;
      text-transform: uppercase;
    }

    .project-tabs-nav {
      display: flex;
      gap: 0.5rem;
      border-top: 1px solid var(--border-light);
      padding-top: 0.75rem;
      overflow-x: auto;
    }

    .tab-btn {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      padding: 0.6rem 1rem;
      font-size: 0.8125rem;
      font-weight: 600;
      color: #64748b;
      border-radius: var(--radius-md);
      transition: all 0.15s;
      white-space: nowrap;
    }

    .tab-btn:hover {
      background: #f1f5f9;
      color: #0f172a;
    }

    .tab-btn.active {
      background: #eff6ff;
      color: #1d4ed8;
      font-weight: 700;
    }

    .stages-tasks-container {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .stages-stepper-bar {
      padding: 0.75rem 1rem;
      background: #ffffff;
      overflow-x: auto;
    }

    .stepper-track {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      min-width: 1050px;
    }

    .stepper-item {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 0.65rem;
      border-radius: var(--radius-md);
      background: #f8fafc;
      border: 1px solid var(--border-light);
      cursor: pointer;
      transition: all 0.15s;
    }

    .stepper-item:hover {
      background: #f1f5f9;
    }

    .stepper-item.active {
      background: #1e3a8a;
      border-color: #1e3a8a;
    }
    .stepper-item.active .step-title {
      color: #ffffff;
    }
    .stepper-item.active .step-subcount {
      color: #93c5fd;
    }
    .stepper-item.active .step-circle {
      background: #3b82f6;
      color: #ffffff;
    }

    .step-circle {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: #e2e8f0;
      color: #475569;
      font-size: 0.65rem;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .step-meta {
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .step-title {
      font-size: 0.75rem;
      font-weight: 700;
      color: #0f172a;
      line-height: 1.2;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }

    .step-subcount {
      font-size: 0.65rem;
      color: #64748b;
    }

    .stage-content-card {
      padding: 1.25rem;
    }

    .stage-content-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 1rem;
      margin-bottom: 1rem;
      padding-bottom: 0.85rem;
      border-bottom: 1px solid var(--border-light);
      flex-wrap: wrap;
    }

    .phase-badge-pill {
      font-size: 0.68rem;
      font-weight: 800;
      color: #1e3a8a;
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      padding: 0.15rem 0.5rem;
      border-radius: var(--radius-full);
      display: inline-block;
      margin-bottom: 0.35rem;
      text-transform: uppercase;
    }

    .stage-content-header h3 {
      font-size: 1.2rem;
      font-weight: 800;
      color: #0f172a;
    }

    .stage-caption {
      font-size: 0.8rem;
      color: #64748b;
      margin-top: 0.2rem;
      max-width: 700px;
      line-height: 1.4;
    }

    .stage-header-actions {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      flex-wrap: wrap;
    }

    .auto-gen-btn {
      background: #ffffff;
      border-color: #cbd5e1;
      color: #0f172a;
    }

    .auto-gen-btn:hover {
      background: #f8fafc;
      border-color: #94a3b8;
    }

    .phase-nav-arrows {
      display: flex;
      gap: 0.35rem;
    }

    .nav-arrow-btn {
      font-size: 0.72rem;
      padding: 0.35rem 0.6rem;
      font-weight: 700;
    }

    .nav-arrow-btn:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }

    .phase-completion-banner {
      background: #f0fdf4;
      border: 1px solid #86efac;
      border-radius: var(--radius-md);
      padding: 0.85rem 1.25rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      margin-bottom: 1rem;
      flex-wrap: wrap;
    }

    .completion-banner-left {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .completion-badge-icon {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #16a34a;
      color: #ffffff;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1rem;
      flex-shrink: 0;
    }

    .completion-banner-left strong {
      color: #166534;
      font-size: 0.875rem;
      display: block;
    }

    .completion-banner-left p {
      color: #15803d;
      font-size: 0.75rem;
      margin: 0;
    }

    .advance-phase-action {
      background: #16a34a;
      border-color: #15803d;
      font-weight: 700;
    }

    .signoff-btn {
      background: #059669;
      border-color: #047857;
      color: #ffffff;
      font-weight: 700;
    }

    .signoff-btn:hover {
      background: #047857;
    }

    .project-fully-completed-banner {
      background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
      border: 2px solid #34d399;
      border-radius: var(--radius-lg);
      padding: 1.15rem 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1.25rem;
      margin-bottom: 1.25rem;
      flex-wrap: wrap;
      box-shadow: 0 4px 12px rgba(5, 150, 105, 0.08);
    }

    .pfc-left {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .pfc-trophy {
      font-size: 2rem;
      flex-shrink: 0;
    }

    .pfc-left strong {
      color: #065f46;
      font-size: 1rem;
      display: block;
      margin-bottom: 0.2rem;
    }

    .pfc-left p {
      color: #047857;
      font-size: 0.8rem;
      margin: 0;
    }

    .pfc-btn {
      background: #059669;
      border-color: #047857;
      font-weight: 700;
      white-space: nowrap;
    }

    .btn-seed-km {
      background: #d97706;
      border: 1px solid #b45309;
      color: #ffffff;
      font-weight: 700;
      font-size: 0.72rem;
      padding: 0.35rem 0.65rem;
      border-radius: var(--radius-md);
      cursor: pointer;
    }

    .btn-seed-km:hover {
      background: #b45309;
    }

    .auto-all-btn {
      font-weight: 700;
      font-size: 0.75rem;
      border-color: #3b82f6;
      color: #1d4ed8;
      background: #eff6ff;
    }

    .auto-all-btn:hover {
      background: #dbeafe;
    }

    /* Kitchen Models Bar */
    .kitchen-models-panel {
      background: #fffbeb;
      border: 1px solid #fde68a;
      border-radius: var(--radius-md);
      padding: 0.85rem 1rem;
      margin-bottom: 1rem;
    }

    .km-info-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .km-title-group {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .km-icon {
      font-size: 1.5rem;
    }

    .km-title-group strong {
      font-size: 0.875rem;
      color: #92400e;
      display: block;
    }

    .km-title-group p {
      font-size: 0.75rem;
      color: #b45309;
      margin: 0;
    }

    .km-tabs {
      display: flex;
      gap: 0.5rem;
    }

    .km-tab-btn {
      background: #ffffff;
      border: 1px solid #fcd34d;
      color: #78350f;
      padding: 0.4rem 0.85rem;
      border-radius: var(--radius-md);
      font-size: 0.75rem;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.4rem;
      transition: all 0.15s;
    }

    .km-tab-btn:hover {
      background: #fef3c7;
    }

    .km-tab-btn.active {
      background: #d97706;
      border-color: #b45309;
      color: #ffffff;
    }

    .km-tab-btn.active .km-badge {
      background: rgba(255, 255, 255, 0.25);
      color: #ffffff;
    }

    .km-badge {
      font-size: 0.65rem;
      background: #fef3c7;
      color: #92400e;
      padding: 0.1rem 0.35rem;
      border-radius: var(--radius-full);
    }

    /* Sub-Step Flow Strip */
    .substep-flow-strip {
      background: #f8fafc;
      border: 1px solid var(--border-light);
      border-radius: var(--radius-md);
      padding: 0.85rem 1rem;
      margin-bottom: 0.75rem;
    }

    .substep-strip-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      margin-bottom: 0.65rem;
      flex-wrap: wrap;
    }

    .flow-label-wrap {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      flex-wrap: wrap;
    }

    .flow-seq-tag {
      font-size: 0.68rem;
      font-weight: 800;
      text-transform: uppercase;
      color: #475569;
      background: #e2e8f0;
      padding: 0.15rem 0.45rem;
      border-radius: 3px;
    }

    .flow-summary-code {
      font-size: 0.75rem;
      color: #1e3a8a;
      font-family: inherit;
      font-weight: 700;
    }

    .clear-filter-btn {
      font-size: 0.72rem;
      color: #dc2626;
      background: #fee2e2;
      border: 1px solid #fca5a5;
      padding: 0.2rem 0.5rem;
      border-radius: var(--radius-full);
      font-weight: 700;
      cursor: pointer;
    }

    .substep-chain-scroll {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      overflow-x: auto;
      padding-bottom: 0.25rem;
    }

    .substep-chain-arrow {
      color: #94a3b8;
      font-size: 0.75rem;
      font-weight: 700;
    }

    .substep-pill-btn {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      padding: 0.35rem 0.65rem;
      border-radius: var(--radius-md);
      font-size: 0.75rem;
      font-weight: 600;
      color: #334155;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.15s;
    }

    .substep-pill-btn:hover {
      background: #f1f5f9;
      border-color: #94a3b8;
    }

    .substep-pill-btn.active {
      background: #1e3a8a;
      border-color: #1e3a8a;
      color: #ffffff;
    }

    .substep-pill-btn.active .substep-idx {
      background: #3b82f6;
      color: #ffffff;
    }

    .substep-pill-btn.active .substep-qty {
      color: #93c5fd;
    }

    .substep-idx {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: #e2e8f0;
      color: #475569;
      font-size: 0.62rem;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .substep-qty {
      font-size: 0.65rem;
      color: #64748b;
    }

    .tasks-filter-info {
      font-size: 0.75rem;
      color: #64748b;
      margin-bottom: 0.65rem;
    }

    .task-name-cell {
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
    }

    .task-name-title {
      font-weight: 700;
      color: #0f172a;
    }

    .task-badges-row {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      flex-wrap: wrap;
    }

    .substep-tag {
      font-size: 0.68rem;
      background: #eff6ff;
      color: #1d4ed8;
      border: 1px solid #bfdbfe;
      padding: 0.1rem 0.4rem;
      border-radius: 3px;
      font-weight: 700;
    }

    .kitchen-tag {
      font-size: 0.68rem;
      background: #fff7ed;
      color: #c2410c;
      border: 1px solid #fed7aa;
      padding: 0.1rem 0.4rem;
      border-radius: 3px;
      font-weight: 700;
    }

    .forgotten-badge {
      font-size: 0.65rem;
      background: #fef2f2;
      color: #b91c1c;
      padding: 0.1rem 0.4rem;
      border-radius: 3px;
      font-weight: 700;
    }

    .due-date-pill {
      font-size: 0.8rem;
      font-weight: 600;
      color: #475569;
      white-space: nowrap;
    }

    .remarks-cell {
      display: flex;
      flex-direction: column;
      font-size: 0.78rem;
      color: #475569;
      max-width: 320px;
    }

    .last-up-text {
      font-size: 0.68rem;
      color: #94a3b8;
    }

    .update-status-btn {
      font-size: 0.75rem;
      padding: 0.35rem 0.75rem;
    }

    .task-action-btns {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 0.4rem;
    }

    .btn-icon-danger {
      background: transparent;
      border: 1px solid #fecaca;
      color: #ef4444;
      padding: 0.3rem 0.45rem;
      border-radius: var(--radius-sm);
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s;
    }

    .btn-icon-danger:hover {
      background: #fee2e2;
      border-color: #f87171;
    }

    .empty-stage-cell {
      text-align: center;
      padding: 2.5rem !important;
      color: #64748b;
    }

    .empty-actions {
      display: flex;
      gap: 0.75rem;
      justify-content: center;
      margin-top: 1rem;
    }

    .tab-pane-card {
      padding: 1.5rem;
    }

    .lead-desc {
      font-size: 0.95rem;
      color: #475569;
      margin: 0.5rem 0 1.5rem;
      line-height: 1.6;
    }

    .overview-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1rem;
    }

    .info-metric-box {
      padding: 1rem;
      background: #f8fafc;
      border: 1px solid var(--border-light);
      border-radius: var(--radius-md);
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .metric-label {
      font-size: 0.72rem;
      text-transform: uppercase;
      color: #64748b;
      font-weight: 700;
    }

    .files-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.25rem;
    }

    .files-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 1rem;
    }

    .file-card {
      padding: 0.85rem;
      border: 1px solid var(--border-light);
      border-radius: var(--radius-md);
      background: #f8fafc;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
    }

    .file-icon-box {
      width: 40px;
      height: 40px;
      border-radius: var(--radius-md);
      background: #e2e8f0;
      color: #334155;
      font-size: 0.65rem;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .file-icon-box.cad { background: #eff6ff; color: #1d4ed8; }
    .file-icon-box.render { background: #fdf2f8; color: #be185d; }
    .file-icon-box.pdf { background: #fef2f2; color: #dc2626; }
    .file-icon-box.photo { background: #f0fdf4; color: #16a34a; }

    .file-meta {
      display: flex;
      flex-direction: column;
      flex: 1;
      overflow: hidden;
    }

    .file-name {
      font-size: 0.8125rem;
      font-weight: 700;
      color: #0f172a;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }

    .file-size {
      font-size: 0.72rem;
      color: #64748b;
    }

    /* Gantt flow styles */
    .gantt-flow {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-top: 1rem;
    }

    .gantt-row {
      display: flex;
      align-items: center;
      gap: 1.25rem;
    }

    .gantt-label {
      width: 280px;
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
      flex-shrink: 0;
    }

    .gantt-title-line {
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }

    .gantt-phase-badge {
      font-size: 0.65rem;
      font-weight: 800;
      background: #eff6ff;
      color: #1d4ed8;
      padding: 0.1rem 0.35rem;
      border-radius: 3px;
    }

    .gantt-label strong {
      font-size: 0.825rem;
      color: #0f172a;
    }

    .gantt-label small {
      font-size: 0.7rem;
      color: #64748b;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .gantt-bar-wrap {
      flex: 1;
      height: 24px;
      background: #f1f5f9;
      border-radius: var(--radius-full);
      overflow: hidden;
      position: relative;
    }

    .gantt-bar {
      height: 100%;
      border-radius: var(--radius-full);
      font-size: 0.7rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding-right: 0.65rem;
      transition: width 0.3s ease;
      min-width: 45px;
    }

    .gantt-bar.bar-active {
      background: #3b82f6;
      color: #ffffff;
    }

    .gantt-bar.bar-complete {
      background: #10b981;
      color: #ffffff;
    }

    /* Modal styles */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.45);
      backdrop-filter: blur(2px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 1rem;
    }

    .modal-dialog {
      background: #ffffff;
      border-radius: var(--radius-lg);
      max-width: 540px;
      width: 100%;
      box-shadow: var(--shadow-xl);
      overflow: hidden;
    }

    .modal-header {
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid var(--border-light);
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
    }

    .modal-header h3 {
      font-size: 1.15rem;
      font-weight: 800;
      color: #0f172a;
    }

    .modal-sub {
      font-size: 0.78rem;
      color: #64748b;
    }

    .modal-body {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      max-height: 75vh;
      overflow-y: auto;
    }

    .modal-footer {
      padding: 1rem 1.5rem;
      border-top: 1px solid var(--border-light);
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      background: #f8fafc;
    }

    .status-options-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 0.6rem;
      margin-top: 0.5rem;
    }

    .status-choice-card {
      border: 1px solid var(--border-light);
      padding: 0.65rem;
      border-radius: var(--radius-md);
      cursor: pointer;
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      transition: all 0.15s;
    }

    .status-choice-card:hover {
      background: #f8fafc;
    }

    .status-choice-card.selected {
      border-color: #1e3a8a;
      background: #eff6ff;
    }

    .choice-desc {
      font-size: 0.7rem;
      color: #64748b;
    }

    .close-btn {
      font-size: 1.25rem;
      color: #94a3b8;
    }

    .empty-detail-card {
      padding: 3rem;
      text-align: center;
    }

    .text-right {
      text-align: right;
    }

    /* SOP Explorer Section Styles */
    .sop-explorer-section {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      margin-top: 0.25rem;
    }

    .sop-toggle-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 0.5rem;
      background: #f8fafc;
      padding: 0.5rem 0.85rem;
      border-radius: var(--radius-sm);
      border: 1px dashed #cbd5e1;
    }

    .sop-toggle-btn {
      font-size: 0.775rem;
      font-weight: 700;
      color: #1e3a8a;
      border-color: #bfdbfe;
      background: #ffffff;
    }

    .sop-toggle-btn:hover, .sop-toggle-btn.active {
      background: #eff6ff;
      border-color: #3b82f6;
      color: #1d4ed8;
    }

    .sop-hint-text {
      font-size: 0.75rem;
      color: #64748b;
      font-weight: 600;
    }

    .sop-card {
      background: #ffffff;
      border: 1px solid #bfdbfe;
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.05);
    }

    .sop-ascii-box {
      background: #0f172a;
      color: #38bdf8;
      padding: 0.85rem 1.15rem;
      border-radius: var(--radius-sm);
      border: 1px solid #334155;
    }

    .sop-ascii-header {
      font-size: 0.75rem;
      color: #94a3b8;
      margin-bottom: 0.35rem;
    }

    .sop-ascii-code {
      font-family: 'Consolas', 'Courier New', monospace;
      font-size: 0.75rem;
      line-height: 1.4;
      margin: 0;
      overflow-x: auto;
    }

    .sop-section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.75rem;
    }

    .sop-section-header h4 {
      font-size: 0.95rem;
      font-weight: 800;
      color: #0f172a;
      margin: 0;
    }

    .sop-badge {
      font-size: 0.68rem;
      font-weight: 700;
      background: #eff6ff;
      color: #1d4ed8;
      padding: 0.15rem 0.45rem;
      border-radius: 999px;
    }

    .sop-submeta {
      font-size: 0.72rem;
      color: #64748b;
    }

    .sop-summary-table th {
      font-size: 0.75rem;
      background: #f1f5f9;
    }

    .sop-step-num {
      font-weight: 800;
      color: #2563eb;
      background: #eff6ff;
      padding: 0.15rem 0.4rem;
      border-radius: 4px;
      font-size: 0.75rem;
    }

    .sop-short-name {
      font-size: 0.68rem;
      color: #64748b;
    }

    .trade-pill {
      font-size: 0.72rem;
      font-weight: 700;
      background: #f1f5f9;
      color: #334155;
      padding: 0.15rem 0.45rem;
      border-radius: 4px;
      border: 1px solid #e2e8f0;
      white-space: nowrap;
    }

    .sop-obj-cell {
      font-size: 0.775rem;
      color: #334155;
      max-width: 250px;
      line-height: 1.35;
    }

    .sop-deliv-cell {
      max-width: 260px;
    }

    .deliv-text {
      font-size: 0.75rem;
      color: #047857;
      background: #ecfdf5;
      padding: 0.2rem 0.45rem;
      border-radius: 4px;
      border: 1px solid #a7f3d0;
      display: inline-block;
      line-height: 1.3;
    }

    .highlighted {
      background: #eff6ff !important;
    }

    .sop-steps-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 0.85rem;
    }

    .sop-step-card {
      padding: 0.85rem 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.55rem;
      border: 1px solid var(--border-light);
      background: #ffffff;
      border-radius: var(--radius-sm);
    }

    .sop-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 0.5rem;
      padding-bottom: 0.45rem;
      border-bottom: 1px solid var(--border-light);
    }

    .sop-card-title {
      display: flex;
      align-items: center;
      gap: 0.45rem;
    }

    .sop-circle {
      width: 22px;
      height: 22px;
      background: #1e3a8a;
      color: white;
      border-radius: 50%;
      font-size: 0.68rem;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .sop-card-title h5 {
      font-size: 0.85rem;
      font-weight: 800;
      color: #0f172a;
      margin: 0;
    }

    .trade-tag {
      font-size: 0.68rem;
      font-weight: 700;
      color: #1d4ed8;
      background: #eff6ff;
      padding: 0.1rem 0.4rem;
      border-radius: 4px;
      white-space: nowrap;
    }

    .sop-field-row {
      display: flex;
      flex-direction: column;
      gap: 0.1rem;
    }

    .field-label {
      font-size: 0.7rem;
      font-weight: 800;
      color: #475569;
    }

    .field-val {
      font-size: 0.775rem;
      color: #334155;
      margin: 0;
      line-height: 1.35;
    }

    .action-callout {
      background: #eff6ff;
      padding: 0.35rem 0.5rem;
      border-radius: 4px;
      border-left: 2px solid #2563eb;
    }
    .action-callout .field-label { color: #1d4ed8; }

    .goal-callout {
      background: #f0fdf4;
      padding: 0.35rem 0.5rem;
      border-radius: 4px;
      border-left: 2px solid #16a34a;
    }
    .goal-callout .field-label { color: #15803d; }

    .focus-callout {
      background: #f8fafc;
      padding: 0.35rem 0.5rem;
      border-radius: 4px;
      border-left: 2px solid #64748b;
    }

    .sop-actions-list-box {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .sop-checklist {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .sop-checklist li {
      font-size: 0.75rem;
      color: #475569;
      display: flex;
      align-items: flex-start;
      gap: 0.35rem;
      line-height: 1.35;
    }

    .check-bullet {
      color: #16a34a;
      font-weight: 800;
      font-size: 0.7rem;
      flex-shrink: 0;
    }

    .sop-exit-gate-box {
      display: flex;
      align-items: flex-start;
      gap: 0.35rem;
      background: #fefce8;
      padding: 0.4rem 0.55rem;
      border-radius: 4px;
      border: 1px solid #fef08a;
      font-size: 0.725rem;
      margin-top: auto;
    }

    .exit-gate-label {
      font-weight: 800;
      color: #a16207;
      flex-shrink: 0;
    }

    .exit-gate-text {
      color: #713f12;
      font-weight: 600;
      line-height: 1.3;
    }
  `]
})
export class ProjectDetailComponent implements OnInit {
  public pmsService = inject(PmsDataService);

  public allStages = PROJECT_STAGES;
  public stagesMetadata = STAGES_METADATA;
  public statusConfig = TASK_STATUS_CONFIG;
  public statusOptions: TaskStatus[] = [
    'Not Yet Started',
    'Work In Progress',
    'Completed',
    'Pending',
    'Rechecking'
  ];

  public kitchenModelOptions: KitchenModel[] = ['Dry Kitchen', 'Wet Kitchen', 'Utility Kitchen'];

  public activeTab: 'overview' | 'stages-tasks' | 'files' | 'timeline' = 'stages-tasks';
  public currentStage: ProjectStage = 'Sales Phase';
  public selectedSubStepFilter = '';
  public selectedKitchenModel: KitchenModel = 'Dry Kitchen';
  public showSopGuide = false;

  public ngOnInit(): void {
    if (this.pmsService.selectedStage()) {
      this.currentStage = this.pmsService.selectedStage();
    }
    if (this.pmsService.selectedSubStep()) {
      this.selectedSubStepFilter = this.pmsService.selectedSubStep();
    }
  }

  public get currentStageSteps(): StageStepDetail[] {
    return this.stagesMetadata[this.currentStage]?.steps || [];
  }

  public get currentStageAscii(): string {
    return this.stagesMetadata[this.currentStage]?.asciiFlowDiagram || '';
  }

  // Status update modal state
  public showStatusModal = false;
  public selectedTask: Task | null = null;
  public modalStatus: TaskStatus = 'Work In Progress';
  public modalRemarks = '';

  // Add Task modal state
  public showAddTaskModal = false;
  public newTaskName = '';
  public newTaskStage: ProjectStage = 'Sales Phase';
  public newTaskSubStep = 'Lead Capture & Initial Contact';
  public newTaskKitchenModel: KitchenModel = 'Dry Kitchen';
  public newTaskDueDate = '24 Sep';
  public newTaskStatus: TaskStatus = 'Not Yet Started';
  public newTaskRemarks = '';

  public mockFiles = [
    { name: 'Floor_Plan_Layout_v3.dwg', type: 'cad', size: '14.2 MB', uploadedAt: '10 Sep' },
    { name: 'Living_Room_3D_Render_Final.png', type: 'render', size: '8.4 MB', uploadedAt: '12 Sep' },
    { name: 'False_Ceiling_Acoustic_Details.pdf', type: 'pdf', size: '2.1 MB', uploadedAt: '14 Sep' },
    { name: 'Site_Inspection_Progress_Photo1.jpg', type: 'photo', size: '4.6 MB', uploadedAt: 'Yesterday' }
  ];

  public get currentProject(): Project | null {
    const proj = this.pmsService.selectedProject();
    if (proj && proj.kitchenModel && this.selectedKitchenModel !== proj.kitchenModel) {
      this.selectedKitchenModel = proj.kitchenModel;
    }
    return proj;
  }

  public get filteredStageTasks(): Task[] {
    const proj = this.currentProject;
    if (!proj) return [];

    let list = this.pmsService.tasks().filter(t => t.projectId === proj.id && t.stage === this.currentStage);

    if (this.selectedSubStepFilter) {
      list = list.filter(t => t.subStep === this.selectedSubStepFilter);
    }

    if (this.currentStage === 'Kitchen Workflow' && this.selectedKitchenModel) {
      list = list.filter(t => !t.kitchenModel || t.kitchenModel === this.selectedKitchenModel);
    }

    return list;
  }

  public get currentSubSteps(): string[] {
    return this.stagesMetadata[this.currentStage]?.subSteps || [];
  }

  public selectStage(stage: ProjectStage) {
    this.currentStage = stage;
    this.pmsService.selectedStage.set(stage);
    this.selectedSubStepFilter = '';
    this.pmsService.selectedSubStep.set('');
  }

  public selectSubStepFilter(step: string) {
    this.selectedSubStepFilter = this.selectedSubStepFilter === step ? '' : step;
  }

  public deleteTask(task: Task) {
    if (confirm(`Are you sure you want to delete task "${task.name}"?`)) {
      this.pmsService.deleteTask(task.id);
    }
  }

  public getStageTasks(stage: ProjectStage): Task[] {
    const proj = this.currentProject;
    if (!proj) return [];
    return this.pmsService.tasks().filter(t => t.projectId === proj.id && t.stage === stage);
  }

  public getSubStepTaskCount(step: string): number {
    const proj = this.currentProject;
    if (!proj) return 0;
    return this.pmsService.tasks().filter(t => 
      t.projectId === proj.id && 
      t.stage === this.currentStage && 
      t.subStep === step
    ).length;
  }

  public getKitchenModelTaskCount(model: KitchenModel): number {
    const proj = this.currentProject;
    if (!proj) return 0;
    return this.pmsService.tasks().filter(t => 
      t.projectId === proj.id && 
      t.stage === 'Kitchen Workflow' && 
      t.kitchenModel === model
    ).length;
  }

  public isStageCompleted(stage: ProjectStage): boolean {
    const tasks = this.getStageTasks(stage);
    return tasks.length > 0 && tasks.every(t => t.status === 'Completed');
  }

  public getStageProgress(stage: ProjectStage): number {
    const tasks = this.getStageTasks(stage);
    if (tasks.length === 0) return 0;
    const done = tasks.filter(t => t.status === 'Completed').length;
    return Math.round((done / tasks.length) * 100);
  }

  public getCurrentPhaseNumber(stage: ProjectStage): number {
    return this.stagesMetadata[stage]?.phaseNumber || 1;
  }

  public getStageShortName(stage: ProjectStage): string {
    return this.stagesMetadata[stage]?.shortName || stage;
  }

  public getStageDescription(stage: ProjectStage): string {
    return this.stagesMetadata[stage]?.description || 'Milestone phase for interior execution.';
  }

  public getStageFlowSummary(stage: ProjectStage): string {
    return this.stagesMetadata[stage]?.flowSummary || '';
  }

  public getStageSubSteps(stage: ProjectStage): string[] {
    return this.stagesMetadata[stage]?.subSteps || [];
  }

  public setKitchenModel(model: KitchenModel) {
    this.selectedKitchenModel = model;
    if (this.currentProject) {
      this.pmsService.updateProjectKitchenModel(this.currentProject.id, model);
    }
  }

  public autoPopulatePhaseTasks() {
    if (!this.currentProject) return;
    this.pmsService.populateDefaultPhaseTasks(this.currentProject.id, this.currentStage);
  }

  public populateAllProjectPhases() {
    if (!this.currentProject) return;
    this.pmsService.populateAllPhasesForProject(this.currentProject.id);
  }

  public seedKitchenModelTasks(km: KitchenModel) {
    if (!this.currentProject) return;
    this.pmsService.populateDefaultPhaseTasks(this.currentProject.id, 'Kitchen Workflow', km);
  }

  public hasNextPhase(): boolean {
    return this.pmsService.getNextPhase(this.currentStage) !== null;
  }

  public hasPrevPhase(): boolean {
    return this.pmsService.getPrevPhase(this.currentStage) !== null;
  }

  public getNextPhaseName(): ProjectStage | null {
    return this.pmsService.getNextPhase(this.currentStage);
  }

  public getPrevPhaseName(): ProjectStage | null {
    return this.pmsService.getPrevPhase(this.currentStage);
  }

  public goToNextPhase() {
    const next = this.getNextPhaseName();
    if (next) {
      this.selectStage(next);
    }
  }

  public goToPrevPhase() {
    const prev = this.getPrevPhaseName();
    if (prev) {
      this.selectStage(prev);
    }
  }

  public completeCurrentPhase() {
    if (!this.currentProject) return;
    const tasks = this.getStageTasks(this.currentStage);
    tasks.forEach(t => {
      if (t.status !== 'Completed') {
        this.pmsService.updateTaskStatus(t.id, 'Completed', 'Phase milestone signed off & approved on site.');
      }
    });
  }

  public isProjectFullyCompleted(): boolean {
    if (!this.currentProject) return false;
    const allProjTasks = this.pmsService.tasks().filter(t => t.projectId === this.currentProject?.id);
    return allProjTasks.length > 0 && allProjTasks.every(t => t.status === 'Completed');
  }

  public createTaskForSubStep(step: string) {
    this.newTaskStage = this.currentStage;
    this.newTaskSubStep = step;
    this.newTaskName = `${step} Site Execution`;
    this.showAddTaskModal = true;
  }

  public openStatusModal(task: Task) {
    this.selectedTask = task;
    this.modalStatus = task.status;
    this.modalRemarks = task.remarks || '';
    this.showStatusModal = true;
  }

  public closeStatusModal() {
    this.showStatusModal = false;
    this.selectedTask = null;
  }

  public saveTaskStatus() {
    if (!this.selectedTask) return;
    this.pmsService.updateTaskStatus(this.selectedTask.id, this.modalStatus, this.modalRemarks);
    this.closeStatusModal();
  }

  public openAddTaskForStage(stage: ProjectStage) {
    this.newTaskStage = stage;
    const steps = this.getStageSubSteps(stage);
    this.newTaskSubStep = steps.length > 0 ? steps[0] : '';
    this.showAddTaskModal = true;
  }

  public onNewTaskStageChange(stage: ProjectStage) {
    const steps = this.getStageSubSteps(stage);
    this.newTaskSubStep = steps.length > 0 ? steps[0] : '';
  }

  public saveNewTask() {
    if (!this.currentProject || !this.newTaskName) return;

    this.pmsService.addTask({
      projectId: this.currentProject.id,
      stage: this.newTaskStage,
      subStep: this.newTaskSubStep || undefined,
      kitchenModel: this.newTaskStage === 'Kitchen Workflow' ? this.newTaskKitchenModel : undefined,
      name: this.newTaskName,
      dueDate: this.newTaskDueDate,
      status: this.newTaskStatus,
      remarks: this.newTaskRemarks
    });

    this.showAddTaskModal = false;
    this.newTaskName = '';
    this.newTaskRemarks = '';
  }

  public triggerUploadSim() {
    alert('Site supervisor file upload: Blueprint CAD / Site inspection photo attached.');
  }

  public downloadSim(name: string) {
    alert(`Opening file: ${name}`);
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
