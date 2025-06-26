export interface MenuItem {
  nombre: string;
  descripcion: string;
  precio: number;
  esMenu?: boolean;
}

export interface MenuCategoria {
  categoriaId: number;
  categoriaNombre: string;
  items: MenuItem[];
}
