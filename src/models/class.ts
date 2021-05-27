import mongoose, { Schema, Document} from 'mongoose';

var classSchema = new Schema({
    name: {
        type: String,
    },
    students: [{
        type: String
    }]
});

export interface Class {
    name: string
    fecha: Date
    identidades: Array<string>
}

export default mongoose.model<Class>('Clase', classSchema,'clases');