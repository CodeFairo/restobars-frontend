import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { ReactiveFormsModule } from '@angular/forms';
import { ReporteService } from '../../services/reporte.service';
import { RestobarService } from '../../services/restobar.service';
import { Restobar } from '../../interfaces/Restobar';
import { DialogRegistrarRestauranteComponent } from '../dialog-registrar-restaurante/dialog-registrar-restaurante.component';
import { AlertService } from '../../services/alert.service';

import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Subscription } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
     selector: 'app-inicio',
     standalone: true,
     imports: [
          CommonModule, MatFormFieldModule,
          MatInputModule, MatSelectModule,
          MatCardModule, MatTableModule,
          MatButtonModule,MatIconModule,
          ReactiveFormsModule, MatPaginatorModule,
          MatSortModule,MatTooltipModule
,     ],
     templateUrl: './gestion-restobars.component.html',
     styleUrls: ['./gestion-restobars.component.css'],
})
export class InicioComponent implements OnInit, OnDestroy {
     public isAdminLoggedIn = false;

     private reporteServicio = inject(ReporteService);
     private restobarService = inject(RestobarService);
     private breakpointObserver = inject(BreakpointObserver);
     private dialog = inject(MatDialog);
     private alert = inject(AlertService);

     public listaRestaurante: Restobar[] = [];

     public displayedColumns: string[] = ['name', 'description', 'actions'];
     private breakpointSub!: Subscription;

     ngOnInit(): void {
          this.listarRestaurantes();

          this.breakpointSub = this.breakpointObserver.observe([
               Breakpoints.XSmall,
               Breakpoints.Small
          ]).subscribe(result => {
               if (result.matches) {
                    this.displayedColumns = ['name', 'actions']; // Oculta description en pantallas pequeñas
               } else {
                    this.displayedColumns = ['name', 'description', 'actions']; // Muestra todas en pantallas más grandes
               }
          });
     }

     ngOnDestroy(): void {
          this.breakpointSub.unsubscribe();
     }

     listarRestaurantes(){
          this.restobarService.lista().subscribe({
               next: (data) => {
                    this.listaRestaurante = data;
               },
               error: (err) => {
                    console.log(err.message);
               }
          });
     }

     registrarRestaurante() {
          const dialogRef = this.dialog.open(DialogRegistrarRestauranteComponent, {
               width: '90vw',
               maxWidth: '50vw'
          });

          dialogRef.afterClosed().subscribe(result => {
               if (result) {
                    this.listarRestaurantes();
               }
          });
     }

     gestionarRestaurante(restobar: Restobar) {
           if (!restobar.estaActivo) {
               this.alert.warning('Alerta!','El restaurante está inactivo.');
               return;
          }
          const dialogRef = this.dialog.open(DialogRegistrarRestauranteComponent, {
               width: '90vw',
               maxWidth: '50vw',
               data: restobar
          });

          dialogRef.afterClosed().subscribe(result => {
               if (result) {
                    this.listarRestaurantes();
               }
          });
     }

     /*inactivar(id: number) {
          this.alert.confirm('¿Eliminar restaurante?', 'Esta acción no se puede deshacer').then(result => {
               if (!result.isConfirmed) return;

               this.alert.loading('Eliminando restaurante...' + id);
               this.restobarService.eliminar(id).subscribe({
                    next: () => {
                         this.alert.close();
                         this.alert.success('Restaurante eliminado');
                         this.listarRestaurantes();
                    },
                    error: (err) => {
                         this.alert.close();
                         console.error('Error al eliminar restaurante', err);
                         this.alert.error('Error al eliminar', 'No se pudo eliminar el restaurante');
                    }
               });
          });
     }*/

     inactivarActivar(element: any) {
          const nuevoEstado = !element.estaActivo;
          const accion = nuevoEstado ? 'activar' : 'inactivar';

          this.alert.confirm(
               `¿Deseas ${accion} este restaurante?`,
               `El restaurante será ${nuevoEstado ? 'activado' : 'inactivado'}`
          ).then(result => {
               if (!result.isConfirmed) return;

               this.alert.loading(`${nuevoEstado ? 'Activando' : 'Inactivando'} restaurante...`);

               this.restobarService.cambiarEstado(element.id, nuevoEstado).subscribe({
                    next: () => {
                         this.alert.close();
                         this.alert.success(
                              `Restaurante ${nuevoEstado ? 'activado' : 'inactivado'} correctamente`
                         );
                         this.listarRestaurantes();
                    },
                    error: (err) => {
                         this.alert.close();
                         console.error('Error al cambiar estado del restaurante:', err);
                         this.alert.error('Error', 'No se pudo cambiar el estado del restaurante');
                    }
               });
          });
     }

     generarReporte() {
          this.reporteServicio.generarReporte().subscribe({
               next: (data: Blob) => {
                    const blob = new Blob([data], { type: 'application/pdf' });
                    const url = window.URL.createObjectURL(blob);

                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'reporte_inventario_bajo.pdf';
                    a.click();

                    window.URL.revokeObjectURL(url);
               },
               error: (err) => {
                    console.error('Error al generar el reporte:', err);
               }
          });
     }
}
