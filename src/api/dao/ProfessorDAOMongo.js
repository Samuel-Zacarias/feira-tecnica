const bcrypt = require("bcrypt");
const { ObjectId } = require("mongodb");

module.exports = class ProfessorDAOMongo {
    #database;

    constructor(databaseInstance) {
        this.#database = databaseInstance;
    }

    async create(professor) {
        const collection = await this.#database.getCollection("professores");
        const result = await collection.insertOne({
            nome: professor.nome,
            email: professor.email,
            senha: await bcrypt.hash(professor.senha, 12),
            role: professor.role,
            dataCadastro: new Date(),
        });
        if (!result.insertedId) throw new Error("Falha ao inserir professor.");
        return result.insertedId.toString();
    }

    async update(professor) {
        const collection = await this.#database.getCollection("professores");
        const fields = {
            nome: professor.nome,
            email: professor.email,
            role: professor.role,
            dataAtualizacao: new Date(),
        };
        if (professor.senha) fields.senha = await bcrypt.hash(professor.senha, 12);

        const result = await collection.updateOne(
            { _id: new ObjectId(professor.id) },
            { $set: fields }
        );
        return result.matchedCount > 0;
    }

    async delete(professor) {
        const collection = await this.#database.getCollection("professores");
        const result = await collection.deleteOne({ _id: new ObjectId(professor.id) });
        return result.deletedCount > 0;
    }

    async findAll() {
        const collection = await this.#database.getCollection("professores");
        const documents = await collection
            .find({}, { projection: { senha: 0 } })
            .sort({ nome: 1 })
            .toArray();
        return documents.map(document => this.#documentToObject(document));
    }

    async findById(idProfessor) {
        if (!ObjectId.isValid(idProfessor)) return null;
        const collection = await this.#database.getCollection("professores");
        const document = await collection.findOne(
            { _id: new ObjectId(idProfessor) },
            { projection: { senha: 0 } }
        );
        return document ? this.#documentToObject(document) : null;
    }

    async findByField(field, value) {
        const allowed = ["id", "nome", "email", "role"];
        if (!allowed.includes(field)) throw new Error(`Campo inválido para busca: ${field}`);
        if (field === "id" && !ObjectId.isValid(value)) return [];

        const collection = await this.#database.getCollection("professores");
        const filter = field === "id" ? { _id: new ObjectId(value) } : { [field]: value };
        const documents = await collection
            .find(filter, { projection: { senha: 0 } })
            .toArray();
        return documents.map(document => this.#documentToObject(document));
    }

    async login(email, senha) {
        const collection = await this.#database.getCollection("professores");
        const document = await collection.findOne({ email });
        if (!document || !(await bcrypt.compare(senha, document.senha))) return null;
        return this.#documentToObject(document);
    }

    #documentToObject(document) {
        return {
            id: document._id.toString(),
            nome: document.nome,
            email: document.email,
            role: document.role,
            dataCadastro: document.dataCadastro,
            dataAtualizacao: document.dataAtualizacao || null,
        };
    }
};
