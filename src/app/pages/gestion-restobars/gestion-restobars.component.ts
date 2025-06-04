import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatCardModule } from '@angular/material/card'
import { MatTableModule } from '@angular/material/table'
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


@Component({
     selector: 'app-inicio',
     standalone: true,
     imports: [CommonModule, MatFormFieldModule, 
          MatInputModule, MatSelectModule, 
          MatCardModule, MatTableModule, 
          MatButtonModule, 
          ReactiveFormsModule, MatPaginatorModule,
          MatSortModule
     ],
     templateUrl: './gestion-restobars.component.html',
     styleUrls: ['./gestion-restobars.component.css'],
})

export class InicioComponent implements OnInit {
     public isAdminLoggedIn = false;
     
     private reporteServicio = inject(ReporteService);
     public displayedColumns: string[] = ['name', 'description','actions'];

     private restobarService = inject(RestobarService);
     public listaRestaurante: Restobar[] = [];


     ngOnInit(): void {
          this.listaRestaurante = [];          
     }

     constructor(
          private dialog: MatDialog,
          private alert: AlertService,
     ) {       
          this.listarRestaurantes();
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
               width: '400px'
          });

          dialogRef.afterClosed().subscribe(result => {
               if (result) {
                    this.listarRestaurantes();
               }
          });
     }

     actualizarRestaurante(restobar: Restobar) {
          const dialogRef = this.dialog.open(DialogRegistrarRestauranteComponent, {
               width: '400px',
               data: restobar // Le pasamos el objeto
          });

          dialogRef.afterClosed().subscribe(result => {
               if (result) {
                    this.listarRestaurantes();
               }
          });
     }

     inactivar(id: number) {
          this.alert.confirm('¿Eliminar restaurante?', 'Esta acción no se puede deshacer').then(result => {
               if (!result.isConfirmed) return;

               this.alert.loading('Eliminando restaurante...'+id);
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
     }

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
