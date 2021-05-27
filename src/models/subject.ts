import mongoose, { Schema, Document} from 'mongoose';

var subjectSchema = new Schema({
    name: {
        type: String,
    },
    students: [{
        type: String
    }]
});

export interface Subject {
    name: string
    students: Array<string>
}

export default mongoose.model<Subject>('Materia', subjectSchema,'materias');