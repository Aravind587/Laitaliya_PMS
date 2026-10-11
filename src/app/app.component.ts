import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PmsDataService } from './services/pms-data.service';
import { NavbarComponent } from './components/navbar/navbar.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { StatusLegendComponent } from './components/status-legend/status-legend.component';
import { FlowDiagramComponent } from './components/flow-diagram/flow-diagram.component';
import { LoginComponent } from './components/login/login.component';
import { AdminDashboardComponent } from './components/admin/admin-dashboard/admin-dashboard.component';
import { AdminCreateProjectComponent } from './components/admin/admin-create-project/admin-create-project.component';
import { AdminProjectsListComponent } from './components/admin/admin-projects-list/admin-projects-list.component';
import { AdminUsersSettingsComponent } from './components/admin/admin-users-settings/admin-users-settings.component';
import { ProjectDetailComponent } from './components/shared/project-detail/project-detail.component';
import { DailyTasksComponent } from './components/shared/daily-tasks/daily-tasks.component';
import { NotificationsViewComponent } from './components/shared/notifications-view/notifications-view.component';
import { SmDashboardComponent } from './components/site-manager/sm-dashboard/sm-dashboard.component';
import { SmAssignedProjectsComponent } from './components/site-manager/sm-assigned-projects/sm-assigned-projects.component';
import { SmProfileComponent } from './components/site-manager/sm-profile/sm-profile.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    NavbarComponent,
    SidebarComponent,
    StatusLegendComponent,
    FlowDiagramComponent,
    LoginComponent,
    AdminDashboardComponent,
    AdminCreateProjectComponent,
    AdminProjectsListComponent,
    AdminUsersSettingsComponent,
    ProjectDetailComponent,
    DailyTasksComponent,
    NotificationsViewComponent,
    SmDashboardComponent,
    SmAssignedProjectsComponent,
    SmProfileComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  public pmsService = inject(PmsDataService);
}
