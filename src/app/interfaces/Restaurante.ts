export interface Restaurante {
     id: string,
     userId: string,
     name: string,
     description: string,
     logoUrl:string
}

export interface ResponseRestaurante { restaurante: Restaurante[]; }