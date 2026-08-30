const { ObjectId } = require('mongodb');
const logger = require('../utils/Logger');

module.exports = class ProjetoDAOMongo {
    #database;

    constructor(databaseInstance) {
        logger.info('⬆️ ProjetoDAOMongo.constructor()');
        this.#database = databaseInstance;
    }

    async create(objProjetoModel) {
        const method = 'ProjetoDAOMongo.create';
        logger.debug(`🟢 ${method} - Iniciando criação de projeto`, {
            titulo: objProjetoModel.titulo,
        });

        try {
            const collection = await this.#database.getCollection('projetos');
            const alunoIds = objProjetoModel.alunos.map(aluno => new ObjectId(aluno.id));
            const doc = {
                titulo: objProjetoModel.titulo,
                descricao: objProjetoModel.descricao,
                liderId: alunoIds[0],
                alunoIds,
                dataCadastro: new Date(),
            };
            const result = await collection.insertOne(doc);

            if (!result.insertedId) {
                throw new Error('Falha ao inserir projeto');
            }

            const insertedId = result.insertedId.toString();
            logger.info(`✅ ${method} - Projeto criado com sucesso`, {
                idProjeto: insertedId,
                titulo: objProjetoModel.titulo,
            });
            return insertedId;
        } catch (error) {
            logger.error(`❌ ${method} - Erro ao criar projeto`, {
                titulo: objProjetoModel?.titulo,
                error: error.message,
                stack: error.stack,
            });
            throw error;
        }
    }

    async delete(objProjetoModel) {
        const method = 'ProjetoDAOMongo.delete';
        logger.debug(`🟢 ${method} - Iniciando exclusão de projeto`, {
            idProjeto: objProjetoModel.id,
        });

        try {
            const collection = await this.#database.getCollection('projetos');
            const result = await collection.deleteOne({ _id: new ObjectId(objProjetoModel.id) });
            const deleted = result.deletedCount > 0;

            if (deleted) {
                logger.info(`✅ ${method} - Projeto excluído com sucesso`, {
                    idProjeto: objProjetoModel.id,
                });
            } else {
                logger.warn(`⚠️ ${method} - Projeto não encontrado para exclusão`, {
                    idProjeto: objProjetoModel.id,
                });
            }
            return deleted;
        } catch (error) {
            logger.error(`❌ ${method} - Erro ao excluir projeto`, {
                idProjeto: objProjetoModel?.id,
                error: error.message,
                stack: error.stack,
            });
            throw error;
        }
    }

    async update(objProjetoModel) {
        const method = 'ProjetoDAOMongo.update';
        logger.debug(`🟢 ${method} - Iniciando atualização de projeto`, {
            idProjeto: objProjetoModel.id,
            titulo: objProjetoModel.titulo,
        });

        try {
            const collection = await this.#database.getCollection('projetos');
            const alunoIds = objProjetoModel.alunos.map(aluno => new ObjectId(aluno.id));
            const filter = { _id: new ObjectId(objProjetoModel.id) };
            const update = {
                $set: {
                    titulo: objProjetoModel.titulo,
                    descricao: objProjetoModel.descricao,
                    liderId: alunoIds[0],
                    alunoIds,
                    dataAtualizacao: new Date(),
                },
            };
            const result = await collection.updateOne(filter, update);
            const updated = result.modifiedCount > 0;

            if (updated) {
                logger.info(`✅ ${method} - Projeto atualizado com sucesso`, {
                    idProjeto: objProjetoModel.id,
                });
            } else {
                logger.warn(`⚠️ ${method} - Projeto não encontrado ou sem alterações`, {
                    idProjeto: objProjetoModel.id,
                });
            }
            return updated;
        } catch (error) {
            logger.error(`❌ ${method} - Erro ao atualizar projeto`, {
                idProjeto: objProjetoModel?.id,
                error: error.message,
                stack: error.stack,
            });
            throw error;
        }
    }

    async findAll() {
        const method = 'ProjetoDAOMongo.findAll';
        logger.debug(`🟢 ${method} - Buscando todos os projetos`);

        try {
            const collection = await this.#database.getCollection('projetos');
            const docs = await collection.aggregate(this.#lookupAlunosPipeline()).toArray();
            const projetos = docs.map(doc => this.#documentToObject(doc));

            logger.info(`✅ ${method} - ${projetos.length} projetos encontrados`);
            return projetos;
        } catch (error) {
            logger.error(`❌ ${method} - Erro ao buscar todos os projetos`, {
                error: error.message,
                stack: error.stack,
            });
            throw error;
        }
    }

    async findById(idProjeto) {
        const method = 'ProjetoDAOMongo.findById';
        logger.debug(`🟢 ${method} - Buscando projeto por ID`, { idProjeto });

        try {
            const collection = await this.#database.getCollection('projetos');
            const pipeline = [
                { $match: { _id: new ObjectId(idProjeto) } },
                ...this.#lookupAlunosPipeline(),
            ];
            const [doc] = await collection.aggregate(pipeline).toArray();

            if (!doc) {
                logger.warn(`⚠️ ${method} - Projeto não encontrado`, { idProjeto });
                return null;
            }

            logger.info(`✅ ${method} - Projeto encontrado`, { idProjeto });
            return this.#documentToObject(doc);
        } catch (error) {
            logger.error(`❌ ${method} - Erro ao buscar projeto`, {
                idProjeto,
                error: error.message,
                stack: error.stack,
            });
            throw error;
        }
    }

    async findByField(field, value) {
        const method = 'ProjetoDAOMongo.findByField';
        logger.debug(`🟢 ${method} - Buscando projetos por campo`, { field, value });

        try {
            const allowedFields = ['id', 'titulo', 'liderId', 'alunoId'];
            if (!allowedFields.includes(field)) {
                throw new Error(`Campo inválido para busca: ${field}`);
            }

            let filter;
            if (field === 'id') filter = { _id: new ObjectId(value) };
            else if (field === 'liderId') filter = { liderId: new ObjectId(value) };
            else if (field === 'alunoId') filter = { alunoIds: new ObjectId(value) };
            else filter = { [field]: value };

            const collection = await this.#database.getCollection('projetos');
            const pipeline = [{ $match: filter }, ...this.#lookupAlunosPipeline()];
            const docs = await collection.aggregate(pipeline).toArray();
            const projetos = docs.map(doc => this.#documentToObject(doc));

            logger.info(`✅ ${method} - ${projetos.length} projetos encontrados para ${field}=${value}`);
            return projetos;
        } catch (error) {
            logger.error(`❌ ${method} - Erro ao buscar projetos por campo`, {
                field,
                value,
                error: error.message,
                stack: error.stack,
            });
            throw error;
        }
    }

    #lookupAlunosPipeline() {
        return [
            {
                $lookup: {
                    from: 'alunos',
                    localField: 'alunoIds',
                    foreignField: '_id',
                    as: 'alunos',
                },
            },
            {
                $lookup: {
                    from: 'alunos',
                    localField: 'liderId',
                    foreignField: '_id',
                    as: 'lider',
                },
            },
            { $unwind: { path: '$lider', preserveNullAndEmptyArrays: true } },
            { $sort: { dataCadastro: -1 } },
        ];
    }

    #documentToObject(doc) {
        const formatarAluno = aluno => aluno ? {
            id: aluno._id.toString(),
            matricula: aluno.matricula,
            nome: aluno.nome,
            nascimento: aluno.nascimento,
            cpf: aluno.cpf,
            curso: aluno.curso,
            turma: aluno.turma,
        } : null;

        return {
            id: doc._id.toString(),
            titulo: doc.titulo,
            descricao: doc.descricao,
            lider: formatarAluno(doc.lider),
            alunos: (doc.alunos || []).map(formatarAluno),
            dataCadastro: doc.dataCadastro,
            dataAtualizacao: doc.dataAtualizacao,
        };
    }
};
