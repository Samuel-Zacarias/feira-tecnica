const { ObjectId } = require("mongodb");
const logger = require("../utils/Logger");

module.exports = class ProjetoDAOMongo {
    #database;

    constructor(databaseInstance) {
        logger.info("⬆️ ProjetoDAOMongo.constructor()");
        this.#database = databaseInstance;
    }

    async create(objProjetoModel) {
        const method = "ProjetoDAOMongo.create";

        try {
            const collection = await this.#database.getCollection("projetos");

            const documento = this.#modelToDocument(objProjetoModel);
            const resultado = await collection.insertOne(documento);

            if (!resultado.insertedId) {
                throw new Error("Falha ao inserir projeto.");
            }

            const idProjeto = resultado.insertedId.toString();

            logger.info(`✅ ${method} - Projeto criado`, {
                idProjeto
            });

            return idProjeto;
        } catch (error) {
            logger.error(`❌ ${method} - Erro ao criar projeto`, {
                error: error.message,
                stack: error.stack
            });

            throw error;
        }
    }

    async update(objProjetoModel) {
        const method = "ProjetoDAOMongo.update";

        try {
            const collection = await this.#database.getCollection("projetos");

            const filtro = {
                _id: new ObjectId(objProjetoModel.id)
            };

            const documento = this.#modelToDocument(objProjetoModel);

            // Não altera a data original do cadastro.
            delete documento.dataCadastro;

            documento.dataAtualizacao = new Date();

            const resultado = await collection.updateOne(filtro, {
                $set: documento
            });

            return resultado.matchedCount > 0;
        } catch (error) {
            logger.error(`❌ ${method} - Erro ao atualizar projeto`, {
                idProjeto: objProjetoModel?.id,
                error: error.message,
                stack: error.stack
            });

            throw error;
        }
    }

    async delete(objProjetoModel) {
        const method = "ProjetoDAOMongo.delete";

        try {
            const collection = await this.#database.getCollection("projetos");

            const resultado = await collection.deleteOne({
                _id: new ObjectId(objProjetoModel.id)
            });

            return resultado.deletedCount > 0;
        } catch (error) {
            logger.error(`❌ ${method} - Erro ao excluir projeto`, {
                idProjeto: objProjetoModel?.id,
                error: error.message,
                stack: error.stack
            });

            throw error;
        }
    }

    async findAll() {
        const method = "ProjetoDAOMongo.findAll";

        try {
            const collection = await this.#database.getCollection("projetos");

            const documentos = await collection
                .find()
                .sort({ dataCadastro: -1 })
                .toArray();

            return documentos.map(documento =>
                this.#documentToObject(documento)
            );
        } catch (error) {
            logger.error(`❌ ${method} - Erro ao listar projetos`, {
                error: error.message,
                stack: error.stack
            });

            throw error;
        }
    }

    async findById(idProjeto) {
        const method = "ProjetoDAOMongo.findById";

        try {
            const collection = await this.#database.getCollection("projetos");

            const documento = await collection.findOne({
                _id: new ObjectId(idProjeto)
            });

            if (!documento) {
                return null;
            }

            return this.#documentToObject(documento);
        } catch (error) {
            logger.error(`❌ ${method} - Erro ao buscar projeto`, {
                idProjeto,
                error: error.message,
                stack: error.stack
            });

            throw error;
        }
    }

    /**
     * Salva o QR Code (base64) e a URL pública gerados para o projeto.
     * Chamado logo após a criação do projeto, quando o id já existe.
     */
    async salvarQrCode(idProjeto, qrCodeBase64, urlPublica) {
        const method = "ProjetoDAOMongo.salvarQrCode";

        try {
            const collection = await this.#database.getCollection("projetos");

            const resultado = await collection.updateOne(
                { _id: new ObjectId(idProjeto) },
                { $set: { qrCode: qrCodeBase64, urlPublica } }
            );

            return resultado.matchedCount > 0;
        } catch (error) {
            logger.error(`❌ ${method} - Erro ao salvar QR Code`, {
                idProjeto,
                error: error.message,
                stack: error.stack
            });

            throw error;
        }
    }

    async findByField(field, value) {
        const method = "ProjetoDAOMongo.findByField";

        const camposPermitidos = [
            "id",
            "tema",
            "curso",
            "equipamento",
            "representante.matricula"
        ];

        if (!camposPermitidos.includes(field)) {
            throw new Error(`Campo inválido para busca: ${field}`);
        }

        try {
            const collection = await this.#database.getCollection("projetos");

            const filtro = field === "id"
                ? { _id: new ObjectId(value) }
                : { [field]: value };

            const documentos = await collection.find(filtro).toArray();

            return documentos.map(documento =>
                this.#documentToObject(documento)
            );
        } catch (error) {
            logger.error(`❌ ${method} - Erro ao buscar projetos`, {
                field,
                value,
                error: error.message,
                stack: error.stack
            });

            throw error;
        }
    }

    async findByMatricula(matricula) {
        const method = "ProjetoDAOMongo.findByMatricula";

        try {
            const collection = await this.#database.getCollection("projetos");

            const documentos = await collection.find({
                $or: [
                    { "representante.matricula": matricula },
                    { "integrantes.matricula": matricula }
                ]
            }).toArray();

            return documentos.map(documento =>
                this.#documentToObject(documento)
            );
        } catch (error) {
            logger.error(`❌ ${method} - Erro ao buscar matrícula`, {
                matricula,
                error: error.message,
                stack: error.stack
            });

            throw error;
        }
    }

    #modelToDocument(projeto) {
        return {
            tema: projeto.tema,
            curso: projeto.curso,
            representante: projeto.representante,
            integrantes: projeto.integrantes,
            equipamento: projeto.equipamento,
            outrosRecursos: projeto.outrosRecursos,
            observacoes: projeto.observacoes,
            dataCadastro: projeto.dataCadastro || new Date()
        };
    }

    #documentToObject(documento) {
        return {
            id: documento._id.toString(),
            tema: documento.tema,
            curso: documento.curso,
            representante: documento.representante,
            integrantes: documento.integrantes || [],
            equipamento: documento.equipamento,
            outrosRecursos: documento.outrosRecursos || null,
            observacoes: documento.observacoes || null,
            dataCadastro: documento.dataCadastro,
            dataAtualizacao: documento.dataAtualizacao || null,
            qrCode: documento.qrCode || null,
            urlPublica: documento.urlPublica || null
        };
    }
};