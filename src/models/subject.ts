import mongoose, { Schema, Document} from 'mongoose';

var subjectSchema = new Schema({
    name: {
        type: String,
    },
    date: {
        type: String
    },
    certs: [{
        type: String
    }]
});

export interface Subject {
    name: string
    date: string
    certs: Array<string>
}

export default mongoose.model<Subject>('Materia', subjectSchema,'materias');