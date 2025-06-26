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
import { CategoriaMenuService } from '../../services/categoriaMenu.service';
import { MatListModule } from '@angular/material/list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ItemMenuService } from '../../services/itemMenu.service';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';

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
    MatIconModule,
    MatButtonModule,
    MatCheckboxModule
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
  esMenu = false;

  menu: MenuCategoria[] = [];

  constructor(
    private restobarService: RestobarService,
    private categoriaMenuService: CategoriaMenuService,
    private itemMenuService: ItemMenuService,
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

    // Cargar categorías activas
    this.categoriaMenuService.obtenerCategoriasPorEstado(true).subscribe({
      next: (data) => {
        this.categorias = data;

        // Luego cargar menú si existe
        this.itemMenuService.obtenerMenuPorRestaurante(this.selectedRestobarId!).subscribe({
          next: (resp) => {
            if (resp?.menuJson) {
              try {
                this.menu = JSON.parse(resp.menuJson);
              } catch (err) {
                console.error('Error al parsear el menú JSON:', err);
                this.menu = [];
              }
            } else {
              this.menu = [];
            }

            this.loading = false;
          },
          error: (err) => {
            console.warn('No se encontró menú para este restaurante', err);
            this.menu = [];
            this.loading = false;
          }
        });
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
      esMenu: this.esMenu
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
    this.esMenu = item.esMenu ?? false;

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
    this.esMenu = false;
    this.editando = false;
    this.itemEditIndex = null;
    this.categoriaEditandoId = null;
  }

  guardarMenu(): void {
    if (!this.selectedRestobarId || this.menu.length === 0) {
      this.alert.warning('Selecciona un restaurante y agrega al menos un ítem al menú.');
      return;
    }

    const json = JSON.stringify(this.menu);

    this.itemMenuService.guardarMenu(this.selectedRestobarId, json).subscribe({
      next: () => {
        this.alert.success('El menú fue guardado correctamente.');
      },
      error: (error) => {
        console.error('Error al guardar el menú:', error);
        this.alert.error('Hubo un error al guardar el menú. Intenta nuevamente.');
      }
    });
  }

  get menuEsMenu(): MenuCategoria[] {
  return this.menu
    .map(grupo => ({
      ...grupo,
      items: grupo.items.filter(item => item.esMenu)
    }))
    .filter(grupo => grupo.items.length > 0);
}

get menuPlatosCarta(): MenuCategoria[] {
  return this.menu
    .map(grupo => ({
      ...grupo,
      items: grupo.items.filter(item => !item.esMenu)
    }))
    .filter(grupo => grupo.items.length > 0);
}

}
