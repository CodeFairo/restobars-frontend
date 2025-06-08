export interface ResponseAcceso{
     isSuccess:boolean,
     accessToken:string,
     refreshToken:string,
     rol:string,
}

export interface ResponseVerificaEmail{
     email:string,
     rol:string,
}