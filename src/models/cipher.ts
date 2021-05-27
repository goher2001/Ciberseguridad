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

