const { ObjectId } = require('mongodb');
const logger = require('../utils/Logger');

module.exports = class AlunoDAOMongo {
    #database;

    constructor(databaseInstance) {
        logger.info('⬆️ AlunoDAOMongo.constructor()');
        this.#database = databaseInstance;
    }

    async create(objAlunoModel) {
        const method = 'AlunoDAOMongo.create';
        logger.debug(`🟢 ${method} - Iniciando criação de aluno`, {
            matricula: objAlunoModel.matricula,
            nome: objAlunoModel.nome,
        });

        try {
            const collection = await this.#database.getCollection('alunos');
            const doc = this.#modelToDocument(objAlunoModel);
            const result = await collection.insertOne(doc);

            if (!result.insertedId) {
                throw new Error('Falha ao inserir aluno');
            }

            const insertedId = result.insertedId.toString();
            logger.info(`✅ ${method} - Aluno criado com sucesso`, {
                idAluno: insertedId,
                matricula: objAlunoModel.matricula,
            });
            return insertedId;
        } catch (error) {
            logger.error(`❌ ${method} - Erro ao criar aluno`, {
                matricula: objAlunoModel?.matricula,
                error: error.message,
                stack: error.stack,
            });
            throw error;
        }
    }

    async delete(objAlunoModel) {
        const method = 'AlunoDAOMongo.delete';
        logger.debug(`🟢 ${method} - Iniciando exclusão de aluno`, {
            idAluno: objAlunoModel.id,
        });

        try {
            const collection = await this.#database.getCollection('alunos');
            const filter = { _id: new ObjectId(objAlunoModel.id) };
            const result = await collection.deleteOne(filter);
            const deleted = result.deletedCount > 0;

            if (deleted) {
                logger.info(`✅ ${method} - Aluno excluído com sucesso`, {
                    idAluno: objAlunoModel.id,
                });
            } else {
                logger.warn(`⚠️ ${method} - Aluno não encontrado para exclusão`, {
                    idAluno: objAlunoModel.id,
                });
            }
            return deleted;
        } catch (error) {
            logger.error(`❌ ${method} - Erro ao excluir aluno`, {
                idAluno: objAlunoModel?.id,
                error: error.message,
                stack: error.stack,
            });
            throw error;
        }
    }

    async update(objAlunoModel) {
        const method = 'AlunoDAOMongo.update';
        logger.debug(`🟢 ${method} - Iniciando atualização de aluno`, {
            idAluno: objAlunoModel.id,
            matricula: objAlunoModel.matricula,
        });

        try {
            const collection = await this.#database.getCollection('alunos');
            const filter = { _id: new ObjectId(objAlunoModel.id) };
            const update = { $set: this.#modelToDocument(objAlunoModel) };
            const result = await collection.updateOne(filter, update);
            const updated = result.modifiedCount > 0;

            if (updated) {
                logger.info(`✅ ${method} - Aluno atualizado com sucesso`, {
                    idAluno: objAlunoModel.id,
                });
            } else {
                logger.warn(`⚠️ ${method} - Aluno não encontrado ou sem alterações`, {
                    idAluno: objAlunoModel.id,
                });
            }
            return updated;
        } catch (error) {
            logger.error(`❌ ${method} - Erro ao atualizar aluno`, {
                idAluno: objAlunoModel?.id,
                error: error.message,
                stack: error.stack,
            });
            throw error;
        }
    }

    async findAll() {
        const method = 'AlunoDAOMongo.findAll';
        logger.debug(`🟢 ${method} - Buscando todos os alunos`);

        try {
            const collection = await this.#database.getCollection('alunos');
            const docs = await collection.find().sort({ nome: 1 }).toArray();
            const alunos = docs.map(doc => this.#documentToObject(doc));

            logger.info(`✅ ${method} - ${alunos.length} alunos encontrados`);
            return alunos;
        } catch (error) {
            logger.error(`❌ ${method} - Erro ao buscar todos os alunos`, {
                error: error.message,
                stack: error.stack,
            });
            throw error;
        }
    }

    async findById(idAluno) {
        const method = 'AlunoDAOMongo.findById';
        logger.debug(`🟢 ${method} - Buscando aluno por ID`, { idAluno });

        try {
            const collection = await this.#database.getCollection('alunos');
            const doc = await collection.findOne({ _id: new ObjectId(idAluno) });

            if (!doc) {
                logger.warn(`⚠️ ${method} - Aluno não encontrado`, { idAluno });
                return null;
            }

            logger.info(`✅ ${method} - Aluno encontrado`, { idAluno });
            return this.#documentToObject(doc);
        } catch (error) {
            logger.error(`❌ ${method} - Erro ao buscar aluno`, {
                idAluno,
                error: error.message,
                stack: error.stack,
            });
            throw error;
        }
    }

    async findByField(field, value) {
        const method = 'AlunoDAOMongo.findByField';
        logger.debug(`🟢 ${method} - Buscando alunos por campo`, { field, value });

        try {
            const allowedFields = ['id', 'matricula', 'nome', 'cpf', 'curso', 'turma'];
            if (!allowedFields.includes(field)) {
                throw new Error(`Campo inválido para busca: ${field}`);
            }

            const collection = await this.#database.getCollection('alunos');
            const filter = field === 'id'
                ? { _id: new ObjectId(value) }
                : { [field]: value };
            const docs = await collection.find(filter).toArray();
            const alunos = docs.map(doc => this.#documentToObject(doc));

            logger.info(`✅ ${method} - ${alunos.length} alunos encontrados para ${field}=${value}`);
            return alunos;
        } catch (error) {
            logger.error(`❌ ${method} - Erro ao buscar alunos por campo`, {
                field,
                value,
                error: error.message,
                stack: error.stack,
            });
            throw error;
        }
    }

    #modelToDocument(objAlunoModel) {
        const doc = {
            matricula: objAlunoModel.matricula,
            nome: objAlunoModel.nome,
            turma: objAlunoModel.turma,
        };

        if (objAlunoModel.nascimento !== undefined) doc.nascimento = objAlunoModel.nascimento;
        if (objAlunoModel.cpf !== undefined) doc.cpf = objAlunoModel.cpf;
        if (objAlunoModel.curso !== undefined) doc.curso = objAlunoModel.curso;
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
