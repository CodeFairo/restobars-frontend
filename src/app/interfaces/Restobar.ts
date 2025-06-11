export interface Restobar {
     id: string,
     userId: string,
     name: string,
     description: string,
     direccion: string,
     latitud: string,
     longitud: string,
     logoUrl:string,
     estaActivo:Boolean,
     urlMenu:string,
     urlLogo:string,
     horarioAtencion:string,

}

export interface ResponseRestobar { restobar: Restobar[]; }