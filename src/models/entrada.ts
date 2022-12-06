export class entrada {
    nombre: string
    precio: string
    cipherMessage: number
    nombreComprador: string;

    constructor(  nombre: string,precio: string, cipherMessage: number, nombreComprador: string){

        this.nombre= nombre;
        this.precio=precio;
        this.cipherMessage=cipherMessage;
        this.nombreComprador=nombreComprador;
        
    }
}

