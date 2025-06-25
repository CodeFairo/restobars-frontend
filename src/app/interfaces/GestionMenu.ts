export interface MenuItem {
  nombre: string;
  descripcion: string;
  precio: number;
}

export interface MenuCategoria {
  categoriaId: number;
  categoriaNombre: string;
  items: MenuItem[];
}
