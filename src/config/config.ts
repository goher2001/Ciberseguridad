//Configuraciones para conexion con BBDD
export default {
    DB: {
        URI: process.env.MONGODB_URI || 'mongodb://localhost/cyber',
        USER: process.env.MONGODB_USER,
        PASSWORD: process.env.MONGODB_PASSWORD
    }
}