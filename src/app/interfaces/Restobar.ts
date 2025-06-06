export interface Restobar {
     id: string,
     userId: string,
     name: string,
     description: string,
     logoUrl:string
     estaActivo:Boolean
}

export interface ResponseRestobar { restobar: Restobar[]; }