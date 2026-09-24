const { ObjectId } = require('mongodb');
const bcrypt = require('bcrypt');

module.exports = class AlunoDAOMongo {
    #database;

    constructor(databaseInstance) {
        this.#database = databaseInstance;
    }

    async create(aluno) {
        const collection = await this.#database.getCollection('alunos');
        const result = await collection.insertOne({
            nome: aluno.nome,
            email: aluno.email,
            senha: await bcrypt.hash(aluno.senha, 12),
            matricula: aluno.matricula,
            turma: aluno.turma,
            curso: aluno.curso,
            role: 'ALUNO',
            dataCadastro: new Date(),
        });
        return result.insertedId.toString();
    }

    async login(identificacao, senha) {
        const collection = await this.#database.getCollection('alunos');
        const identificacaoOriginal = String(identificacao || '').trim();
        const documento = await collection.findOne({
            $or: [
                { email: identificacaoOriginal.toLowerCase() },
                { matricula: identificacaoOriginal },
            ],
        });

        if (!documento || typeof senha !== 'string' || typeof documento.senha !== 'string' || !await bcrypt.compare(senha, documento.senha)) return null;
        return this.#documentToObject(documento);
    }

    async findAll() {
        const collection = await this.#database.getCollection('alunos');
        const docs = await collection
            .find({}, { projection: { senha: 0 } })
            .sort({ nome: 1 })
            .toArray();
        return docs.map(doc => this.#documentToObject(doc));
    }

    async findById(id) {
        if (!ObjectId.isValid(id)) return null;
        const collection = await this.#database.getCollection('alunos');
        const doc = await collection.findOne(
            { _id: new ObjectId(id) },
            { projection: { senha: 0 } }
        );
        return doc ? this.#documentToObject(doc) : null;
    }

    async findByEmailOrMatricula(email, matricula) {
        const filtros = [];
        if (email) filtros.push({ email: String(email).trim().toLowerCase() });
        if (matricula) filtros.push({ matricula: String(matricula).trim() });
        if (!filtros.length) return null;

        const collection = await this.#database.getCollection('alunos');
        const doc = await collection.findOne(
            { $or: filtros },
            { projection: { senha: 0 } }
        );
        return doc ? this.#documentToObject(doc) : null;
    }

    #documentToObject(doc) {
        return {
            id: doc._id.toString(),
            nome: doc.nome,
            email: doc.email,
            matricula: doc.matricula,
            turma: doc.turma,
            curso: doc.curso,
            role: 'ALUNO',
            dataCadastro: doc.dataCadastro,
        };
    }
};
