export interface Restobar {
     id: string,
     userId: string,
     name: string,
     description: string,
     logoUrl:string
}

export interface ResponseRestobar { restobar: Restobar[]; }