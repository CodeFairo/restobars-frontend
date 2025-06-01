export interface Producto {
     id: string,
     nombre: string,
     descripcion: string,
     precio: number,
     categoriaId: string
     cantidadInventario: number
}

export interface ResponseProducto { productos: Producto[]; }