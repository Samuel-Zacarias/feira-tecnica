const { ObjectId } = require("mongodb");
const bcrypt = require("bcrypt");
const logger = require("../utils/Logger");

module.exports = class ProfessorDAOMongo {
    #database;

    constructor(databaseInstance) {
        logger.info(
            "⬆️ ProfessorDAOMongo.constructor()"
        );

        this.#database = databaseInstance;
    }

    async create(professor) {
        const method =
            "ProfessorDAOMongo.create";

        try {
            const collection =
                await this.#database.getCollection(
                    "professores"
                );

            // Impede dois professores com o mesmo e-mail.
            await collection.createIndex(
                { email: 1 },
                { unique: true }
            );

            // A senha nunca é salva como texto normal.
            const senhaHash = await bcrypt.hash(
                professor.senha,
                12
            );

            const resultado =
                await collection.insertOne({
                    nome: professor.nome,
                    email: professor.email,
                    senha: senhaHash,
                    role: professor.role,
                    dataCadastro: new Date()
                });

            if (!resultado.insertedId) {
                throw new Error(
                    "Falha ao inserir professor."
                );
            }

            return resultado.insertedId.toString();
        } catch (error) {
            logger.error(
                `❌ ${method} - Erro ao criar professor`,
                {
                    email: professor?.email,
                    error: error.message,
                    stack: error.stack
                }
            );

            throw error;
        }
    }

    async update(professor) {
        const method =
            "ProfessorDAOMongo.update";

        try {
            const collection =
                await this.#database.getCollection(
                    "professores"
                );

            const campos = {
                nome: professor.nome,
                email: professor.email,
                role: professor.role,
                dataAtualizacao: new Date()
            };

            // Só altera a senha quando uma nova for enviada.
            if (professor.senha) {
                campos.senha = await bcrypt.hash(
                    professor.senha,
                    12
                );
            }

            const resultado =
                await collection.updateOne(
                    {
                        _id: new ObjectId(
                            professor.id
                        )
                    },
                    {
                        $set: campos
                    }
                );

            return resultado.matchedCount > 0;
        } catch (error) {
            logger.error(
                `❌ ${method} - Erro ao atualizar professor`,
                {
                    idProfessor: professor?.id,
                    error: error.message,
                    stack: error.stack
                }
            );

            throw error;
        }
    }

    async delete(professor) {
        const collection =
            await this.#database.getCollection(
                "professores"
            );

        const resultado =
            await collection.deleteOne({
                _id: new ObjectId(professor.id)
            });

        return resultado.deletedCount > 0;
    }

    async findAll() {
        const collection =
            await this.#database.getCollection(
                "professores"
            );

        const documentos = await collection
            .find(
                {},
                {
                    projection: {
                        senha: 0
                    }
                }
            )
            .sort({ nome: 1 })
            .toArray();

        return documentos.map(documento =>
            this.#documentToObject(documento)
        );
    }

    async findById(idProfessor) {
        const collection =
            await this.#database.getCollection(
                "professores"
            );

        const documento =
            await collection.findOne(
                {
                    _id: new ObjectId(idProfessor)
                },
                {
                    projection: {
                        senha: 0
                    }
                }
            );

        return documento
            ? this.#documentToObject(documento)
            : null;
    }

    async findByField(field, value) {
        const camposPermitidos = [
            "id",
            "nome",
            "email",
            "role"
        ];

        if (!camposPermitidos.includes(field)) {
            throw new Error(
                `Campo inválido para busca: ${field}`
            );
        }

        const collection =
            await this.#database.getCollection(
                "professores"
            );

        const filtro =
            field === "id"
                ? {
                    _id: new ObjectId(value)
                }
                : {
                    [field]: value
                };

        const documentos = await collection
            .find(
                filtro,
                {
                    projection: {
                        senha: 0
                    }
                }
            )
            .toArray();

        return documentos.map(documento =>
            this.#documentToObject(documento)
        );
    }

    async login(email, senha) {
        const collection =
            await this.#database.getCollection(
                "professores"
            );

        const documento =
            await collection.findOne({
                email
            });

        if (!documento) {
            return null;
        }

        const senhaValida =
            await bcrypt.compare(
                senha,
                documento.senha
            );

        if (!senhaValida) {
            return null;
        }

        return this.#documentToObject(documento);
    }

    #documentToObject(documento) {
        return {
            id: documento._id.toString(),
            nome: documento.nome,
            email: documento.email,
            role: documento.role,
            dataCadastro:
                documento.dataCadastro,
            dataAtualizacao:
                documento.dataAtualizacao || null
        };
    }
};