const { ObjectId } = require('mongodb');
const logger = require('../utils/Logger');

module.exports = class ProfessorDAOMongo {
    #database;

    constructor(databaseInstance) {
        logger.info('⬆️ ProfessorDAOMongo.constructor()');
        this.#database = databaseInstance;
    }

    async create(objProfessorModel) {
        const method = 'ProfessorDAOMongo.create';
        logger.debug(`🟢 ${method} - Iniciando criação de Professor`, {
            matricula: objProfessorModel.matricula,
            nome: objProfessorModel.nome,
        });

        try {
            const collection = await this.#database.getCollection('Professors');
            const doc = this.#modelToDocument(objProfessorModel);
            const result = await collection.insertOne(doc);

            if (!result.insertedId) {
                throw new Error('Falha ao inserir Professor');
            }

            const insertedId = result.insertedId.toString();
            logger.info(`✅ ${method} - Professor criado com sucesso`, {
                idProfessor: insertedId,
                matricula: objProfessorModel.matricula,
            });
            return insertedId;
        } catch (error) {
            logger.error(`❌ ${method} - Erro ao criar Professor`, {
                matricula: objProfessorModel?.matricula,
                error: error.message,
                stack: error.stack,
            });
            throw error;
        }
    }

    async delete(objProfessorModel) {
        const method = 'ProfessorDAOMongo.delete';
        logger.debug(`🟢 ${method} - Iniciando exclusão de Professor`, {
            idProfessor: objProfessorModel.id,
        });

        try {
            const collection = await this.#database.getCollection('Professors');
            const filter = { _id: new ObjectId(objProfessorModel.id) };
            const result = await collection.deleteOne(filter);
            const deleted = result.deletedCount > 0;

            if (deleted) {
                logger.info(`✅ ${method} - Professor excluído com sucesso`, {
                    idProfessor: objProfessorModel.id,
                });
            } else {
                logger.warn(`⚠️ ${method} - Professor não encontrado para exclusão`, {
                    idProfessor: objProfessorModel.id,
                });
            }
            return deleted;
        } catch (error) {
            logger.error(`❌ ${method} - Erro ao excluir Professor`, {
                idProfessor: objProfessorModel?.id,
                error: error.message,
                stack: error.stack,
            });
            throw error;
        }
    }

    async update(objProfessorModel) {
        const method = 'ProfessorDAOMongo.update';
        logger.debug(`🟢 ${method} - Iniciando atualização de Professor`, {
            idProfessor: objProfessorModel.id,
            matricula: objProfessorModel.matricula,
        });

        try {
            const collection = await this.#database.getCollection('Professors');
            const filter = { _id: new ObjectId(objProfessorModel.id) };
            const update = { $set: this.#modelToDocument(objProfessorModel) };
            const result = await collection.updateOne(filter, update);
            const updated = result.modifiedCount > 0;

            if (updated) {
                logger.info(`✅ ${method} - Professor atualizado com sucesso`, {
                    idProfessor: objProfessorModel.id,
                });
            } else {
                logger.warn(`⚠️ ${method} - Professor não encontrado ou sem alterações`, {
                    idProfessor: objProfessorModel.id,
                });
            }
            return updated;
        } catch (error) {
            logger.error(`❌ ${method} - Erro ao atualizar Professor`, {
                idProfessor: objProfessorModel?.id,
                error: error.message,
                stack: error.stack,
            });
            throw error;
        }
    }

    async findAll() {
        const method = 'ProfessorDAOMongo.findAll';
        logger.debug(`🟢 ${method} - Buscando todos os Professors`);

        try {
            const collection = await this.#database.getCollection('Professors');
            const docs = await collection.find().sort({ nome: 1 }).toArray();
            const Professors = docs.map(doc => this.#documentToObject(doc));

            logger.info(`✅ ${method} - ${Professors.length} Professors encontrados`);
            return Professors;
        } catch (error) {
            logger.error(`❌ ${method} - Erro ao buscar todos os Professors`, {
                error: error.message,
                stack: error.stack,
            });
            throw error;
        }
    }

    async findById(idProfessor) {
        const method = 'ProfessorDAOMongo.findById';
        logger.debug(`🟢 ${method} - Buscando Professor por ID`, { idProfessor });

        try {
            const collection = await this.#database.getCollection('Professors');
            const doc = await collection.findOne({ _id: new ObjectId(idProfessor) });

            if (!doc) {
                logger.warn(`⚠️ ${method} - Professor não encontrado`, { idProfessor });
                return null;
            }

            logger.info(`✅ ${method} - Professor encontrado`, { idProfessor });
            return this.#documentToObject(doc);
        } catch (error) {
            logger.error(`❌ ${method} - Erro ao buscar Professor`, {
                idProfessor,
                error: error.message,
                stack: error.stack,
            });
            throw error;
        }
    }

    async findByField(field, value) {
        const method = 'ProfessorDAOMongo.findByField';
        logger.debug(`🟢 ${method} - Buscando Professors por campo`, { field, value });

        try {
            const allowedFields = ['id', 'matricula', 'nome', 'cpf', 'curso', 'turma'];
            if (!allowedFields.includes(field)) {
                throw new Error(`Campo inválido para busca: ${field}`);
            }

            const collection = await this.#database.getCollection('Professors');
            const filter = field === 'id'
                ? { _id: new ObjectId(value) }
                : { [field]: value };
            const docs = await collection.find(filter).toArray();
            const Professors = docs.map(doc => this.#documentToObject(doc));

            logger.info(`✅ ${method} - ${Professors.length} Professors encontrados para ${field}=${value}`);
            return Professors;
        } catch (error) {
            logger.error(`❌ ${method} - Erro ao buscar Professors por campo`, {
                field,
                value,
                error: error.message,
                stack: error.stack,
            });
            throw error;
        }
    }

    #modelToDocument(objProfessorModel) {
        const doc = {
            matricula: objProfessorModel.matricula,
            nome: objProfessorModel.nome,
            turma: objProfessorModel.turma,
        };

        if (objProfessorModel.nascimento !== undefined) doc.nascimento = objProfessorModel.nascimento;
        if (objProfessorModel.cpf !== undefined) doc.cpf = objProfessorModel.cpf;
        if (objProfessorModel.curso !== undefined) doc.curso = objProfessorModel.curso;
        return doc;
    }

    #documentToObject(doc) {
        return {
            id: doc._id.toString(),
            matricula: doc.matricula,
            nome: doc.nome,
            nascimento: doc.nascimento,
            cpf: doc.cpf,
            curso: doc.curso,
            turma: doc.turma,
        };
    }
};
