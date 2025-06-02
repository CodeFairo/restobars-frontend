import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatCardModule } from '@angular/material/card'
import { MatTableModule } from '@angular/material/table'
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';


import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { ProductoService } from '../../services/producto.service';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Producto } from '../../interfaces/Producto';
import { ReporteService } from '../../services/reporte.service';
import { RestobarService } from '../../services/restobar.service';
import { Restobar } from '../../interfaces/Restobar';
import { DialogRegistrarRestauranteComponent } from '../dialog-registrar-restaurante/dialog-registrar-restaurante.component';
import { UploadMenuDialogComponent } from '../upload-menu-dialog/upload-menu-dialog.component';

@Component({
     selector: 'app-inicio',
     standalone: true,
     imports: [CommonModule, MatFormFieldModule, 
          MatInputModule, MatSelectModule, 
          MatCardModule, MatTableModule, 
          MatButtonModule, MatDialogModule, 
          ReactiveFormsModule, MatPaginatorModule,
          MatSortModule
     ],
     templateUrl: './inicio.component.html',
     styleUrls: ['./inicio.component.css'],
})

export class InicioComponent implements OnInit {
     public isAdminLoggedIn = false;
     private productoServicio = inject(ProductoService);
     
     private reporteServicio = inject(ReporteService);
     private fb = inject(FormBuilder);
     public listaProducto: Producto[] = [];     
     public displayedColumns: string[] = ['name', 'description','actions'];

     private restobarService = inject(RestobarService);
     public listaRestaurante: Restobar[] = [];

     public productoForm: FormGroup;
     public productoFormActualizar: FormGroup;

     ngOnInit(): void {
          this.listaRestaurante = [];          
     }

     constructor(private dialog: MatDialog) {
          this.productoForm = this.fb.group({
               nombre: [''],
               descripcion: [''],
               precio: [''],
               categoriaId: [''],
               cantidadInventario: ['']
          });

           this.productoFormActualizar = this.fb.group({
               id1: [''],
               nombre1: [''],
               descripcion1: [''],
               precio1: [''],
               categoriaId1: [''],
               cantidadInventario1: ['']
          });

          //this.listarProductos();
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
                    // Volver a cargar la lista de restaurantes si es necesario
                    this.listarRestaurantes();
               }
          });
     }

     abrirDialogoCargarMenu(restobarId: number) {
          this.dialog.open(UploadMenuDialogComponent, {
               data: { restobarId }
          });
     }    

     listarProductos() {
          this.productoServicio.lista().subscribe({
               next: (data) => {
                    this.listaProducto = data.items;
               },
               error: (err) => {
                    console.log(err.message);
               }
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

     crearProducto() {
          const nuevoProducto: Producto = this.productoForm.value;
          this.productoServicio.crearProducto(nuevoProducto).subscribe({
               next: () => {
                    this.listarProductos();
                    this.productoForm.reset();
               },
               error: (err) => {
                    alert(err.message);
               }
          });
     }

     modificarProducto() {
          const modificarProducto = this.productoFormActualizar.value;
          const nuevoProducto: Producto = {
               id: modificarProducto.id1,
               nombre: modificarProducto.nombre1,
               descripcion: modificarProducto.descripcion1,
               precio: modificarProducto.precio1,
               categoriaId: modificarProducto.categoriaId1,
               cantidadInventario: modificarProducto.cantidadInventario1
          };
          this.productoServicio.modificarProducto(nuevoProducto).subscribe({
               next: () => {
                    this.listarProductos();
                    this.productoFormActualizar.reset();
               },
               error: (err) => {
                    alert(err.message);
               }
          });
     }

     cargarEnPantallaUnProducto(product: Producto) {
          this.productoFormActualizar.patchValue({
               id1: product.id,
               nombre1: product.nombre,
               descripcion1: product.descripcion,
               precio1: product.precio,
               categoriaId1: product.categoriaId,
               cantidadInventario1: product.cantidadInventario
          });
     }

     eliminarProducto(product: Producto) {
          this.productoServicio.eliminarProducto(product).subscribe({
               next: () => {
                    this.listarProductos();
               },
               error: (err) => {
                    this.listarProductos();
                    alert(err.message);
               }
          });
     }
}
