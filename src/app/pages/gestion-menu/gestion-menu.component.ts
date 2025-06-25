import { Component } from '@angular/core';
import { MenuCategoria, MenuItem } from '../../interfaces/GestionMenu';
import { NgFor, NgIf } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { Restobar } from '../../interfaces/Restobar';
import { RestobarService } from '../../services/restobar.service';
import { MatDialog } from '@angular/material/dialog';
import { AlertService } from '../../services/alert.service';
import { GestionMenuService } from '../../services/gestionmenu.service';
import { MatListModule } from '@angular/material/list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-gestion-menu',
  standalone: true,
  imports: [
    NgFor, NgIf,
    MatSelectModule,
    FormsModule,
    MatCardModule,
    MatListModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatIconModule
  ],
  templateUrl: './gestion-menu.component.html',
  styleUrl: './gestion-menu.component.css'
})
export class GestionMenuComponent {

  selectedRestobarId: number | null = null;
  restobares: Restobar[] = [];
  loading = false;
  categorias: any[] = []; // Llenar desde API
  selectedCategoria: any;
  nombreItem = '';
  descripcionItem = '';
  precioItem: number = 0;
  editando = false;
  itemEditIndex: number | null = null;
  categoriaEditandoId: number | null = null;

  menu: MenuCategoria[] = [];

  constructor(
    private restobarService: RestobarService,
    private menuService: GestionMenuService,
    private dialog: MatDialog,
    private alert: AlertService,
  ) { }

  ngOnInit(): void {
    this.restobarService.listaRestobarsPorUsuario().subscribe({
      next: (data) => this.restobares = data,
      error: (err) => console.error('Error cargando restaurantes del usuario', err)
    });
  }


  onRestobarSelected(): void {
    if (!this.selectedRestobarId) return;

    this.loading = true;
    this.menuService.obtenerCategoriasPorEstado(true).subscribe({
      next: (data) => {
        this.categorias = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando categorías', err);
        this.loading = false;
      }
    });
  }



  agregarItem(): void {
    if (!this.selectedCategoria || !this.nombreItem || this.precioItem <= 0) return;

    const nuevoItem: MenuItem = {
      nombre: this.nombreItem,
      descripcion: this.descripcionItem,
      precio: this.precioItem,
    };

    const categoria = this.menu.find(c => c.categoriaId === this.selectedCategoria.id);

    if (this.editando && this.categoriaEditandoId === this.selectedCategoria.id) {
      // Actualizar ítem existente
      categoria!.items[this.itemEditIndex!] = nuevoItem;
    } else {
      if (categoria) {
        categoria.items.push(nuevoItem);
      } else {
        this.menu.push({
          categoriaId: this.selectedCategoria.id,
          categoriaNombre: this.selectedCategoria.nombre,
          items: [nuevoItem],
        });
      }
    }

    this.limpiarFormulario();
  }

  editarItem(categoria: MenuCategoria, item: MenuItem, index: number): void {
    this.nombreItem = item.nombre;
    this.descripcionItem = item.descripcion;
    this.precioItem = item.precio;

    // Buscar el objeto original desde this.categorias (para que coincida por referencia con el mat-select)
    const categoriaOriginal = this.categorias.find(c => c.id === categoria.categoriaId);
    this.selectedCategoria = categoriaOriginal;

    this.editando = true;
    this.itemEditIndex = index;
    this.categoriaEditandoId = categoria.categoriaId;
  }

  eliminarItem(categoria: MenuCategoria, index: number): void {
    categoria.items.splice(index, 1);

    // Si la categoría queda sin ítems, la eliminamos del menú
    if (categoria.items.length === 0) {
      this.menu = this.menu.filter(c => c.categoriaId !== categoria.categoriaId);
    }
  }

  limpiarFormulario(): void {
    this.nombreItem = '';
    this.descripcionItem = '';
    this.precioItem = 0;
    this.editando = false;
    this.itemEditIndex = null;
    this.categoriaEditandoId = null;
  }

  guardarMenu() {
    const json = JSON.stringify(this.menu);
    console.log('Menú generado:', json);
    // Llama a tu servicio para guardar el JSON en el backend
  }

}
