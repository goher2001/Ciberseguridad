export interface AES {
    cipher: string
    iv: string
    authTag: string
}

export interface ServerAlert {
    type: string
    cipher: string
    iv: string
    key?: string
}

export interface NonRepudiation {
    cipher: string
    TimeStamp: string
    firma?: string
}