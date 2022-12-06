export class User {
    name: string
    password: string
    pubKey: bigint
    creditos: number

    constructor( name: string,password: string, pubKey: bigint,creditos: number){

        this.name=name;
        this.password=password;
        this.pubKey=pubKey;
        this.creditos=creditos;

    }
}

