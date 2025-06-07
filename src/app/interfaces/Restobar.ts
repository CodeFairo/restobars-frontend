export interface Restobar {
     id: string,
     userId: string,
     name: string,
     description: string,
     direccion: string,
     latitud: string,
     longitud: string,
     logoUrl:string,
     estaActivo:Boolean
}

export interface ResponseRestobar { restobar: Restobar[]; }