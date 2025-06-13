import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { DashboardRestobarResponse } from '../../interfaces/DashboardRestobar';
import { DashboardService } from '../../services/dashboard.service';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule,
            MatInputModule, MatSelectModule,
            MatCardModule, MatButtonModule,
            MatIconModule, MatDividerModule
            ],
  templateUrl: './restobar-dashboard.component.html',
  styleUrl: './restobar-dashboard.component.css'
})
export class RestobarDashboardComponent {

  dashboardData?: DashboardRestobarResponse;
  dashboardService = inject(DashboardService);

  ngOnInit(): void {
    this.dashboardService.getDashboardData().subscribe({
      next: (data) => {
        this.dashboardData = data;
        //console.log(data);
      },
      error: (err) => {
        console.error('Error al obtener el dashboard', err);
      }
    });
  }

}
