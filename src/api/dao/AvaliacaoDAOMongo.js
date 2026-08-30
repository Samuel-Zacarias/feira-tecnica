const { ObjectId } = require('mongodb');
const logger = require('../utils/Logger');

module.exports = class AvaliacaoDAOMongo {
    #database;

    constructor(databaseInstance) {
        logger.info('⬆️ AvaliacaoDAOMongo.constructor()');
        this.#database = databaseInstance;
    }

    async create(objAvaliacaoModel) {
        const method = 'AvaliacaoDAOMongo.create';
        const projetoId = this.#getProjetoId(objAvaliacaoModel);
        logger.debug(`🟢 ${method} - Iniciando criação de avaliação`, {
            projetoId,
            avaliador: objAvaliacaoModel.avaliador,
        });

        try {
            const collection = await this.#database.getCollection('avaliacoes');
            const doc = this.#modelToDocument(objAvaliacaoModel);
            const result = await collection.insertOne(doc);

            if (!result.insertedId) {
                throw new Error('Falha ao inserir avaliação');
            }

            const insertedId = result.insertedId.toString();
            logger.info(`✅ ${method} - Avaliação criada com sucesso`, {
                idAvaliacao: insertedId,
                projetoId,
            });
            return insertedId;
        } catch (error) {
            logger.error(`❌ ${method} - Erro ao criar avaliação`, {
                projetoId,
                error: error.message,
                stack: error.stack,
            });
            throw error;
        }
    }

    async delete(objAvaliacaoModel) {
        const method = 'AvaliacaoDAOMongo.delete';
        logger.debug(`🟢 ${method} - Iniciando exclusão de avaliação`, {
            idAvaliacao: objAvaliacaoModel.id,
        });

        try {
            const collection = await this.#database.getCollection('avaliacoes');
            const result = await collection.deleteOne({ _id: new ObjectId(objAvaliacaoModel.id) });
            const deleted = result.deletedCount > 0;

            if (deleted) {
                logger.info(`✅ ${method} - Avaliação excluída com sucesso`, {
                    idAvaliacao: objAvaliacaoModel.id,
                });
            } else {
                logger.warn(`⚠️ ${method} - Avaliação não encontrada para exclusão`, {
                    idAvaliacao: objAvaliacaoModel.id,
                });
            }
            return deleted;
        } catch (error) {
            logger.error(`❌ ${method} - Erro ao excluir avaliação`, {
                idAvaliacao: objAvaliacaoModel?.id,
                error: error.message,
                stack: error.stack,
            });
            throw error;
        }
    }

    async update(objAvaliacaoModel) {
        const method = 'AvaliacaoDAOMongo.update';
        logger.debug(`🟢 ${method} - Iniciando atualização de avaliação`, {
            idAvaliacao: objAvaliacaoModel.id,
        });

        try {
            const collection = await this.#database.getCollection('avaliacoes');
            const filter = { _id: new ObjectId(objAvaliacaoModel.id) };
            const update = {
                $set: {
                    ...this.#modelToDocument(objAvaliacaoModel),
                    dataAtualizacao: new Date(),
                },
            };
            const result = await collection.updateOne(filter, update);
            const updated = result.modifiedCount > 0;

            if (updated) {
                logger.info(`✅ ${method} - Avaliação atualizada com sucesso`, {
                    idAvaliacao: objAvaliacaoModel.id,
                });
            } else {
                logger.warn(`⚠️ ${method} - Avaliação não encontrada ou sem alterações`, {
                    idAvaliacao: objAvaliacaoModel.id,
                });
            }
            return updated;
        } catch (error) {
            logger.error(`❌ ${method} - Erro ao atualizar avaliação`, {
                idAvaliacao: objAvaliacaoModel?.id,
                error: error.message,
                stack: error.stack,
            });
            throw error;
        }
    }

    async findAll() {
        const method = 'AvaliacaoDAOMongo.findAll';
        logger.debug(`🟢 ${method} - Buscando todas as avaliações`);

        try {
            const collection = await this.#database.getCollection('avaliacoes');
            const docs = await collection.aggregate(this.#lookupProjetoPipeline()).toArray();
            const avaliacoes = docs.map(doc => this.#documentToObject(doc));

            logger.info(`✅ ${method} - ${avaliacoes.length} avaliações encontradas`);
            return avaliacoes;
        } catch (error) {
            logger.error(`❌ ${method} - Erro ao buscar todas as avaliações`, {
                error: error.message,
                stack: error.stack,
            });
            throw error;
        }
    }

    async findById(idAvaliacao) {
        const method = 'AvaliacaoDAOMongo.findById';
        logger.debug(`🟢 ${method} - Buscando avaliação por ID`, { idAvaliacao });

        try {
            const collection = await this.#database.getCollection('avaliacoes');
            const pipeline = [
                { $match: { _id: new ObjectId(idAvaliacao) } },
                ...this.#lookupProjetoPipeline(),
            ];
            const [doc] = await collection.aggregate(pipeline).toArray();

            if (!doc) {
                logger.warn(`⚠️ ${method} - Avaliação não encontrada`, { idAvaliacao });
                return null;
            }

            logger.info(`✅ ${method} - Avaliação encontrada`, { idAvaliacao });
            return this.#documentToObject(doc);
        } catch (error) {
            logger.error(`❌ ${method} - Erro ao buscar avaliação`, {
                idAvaliacao,
                error: error.message,
                stack: error.stack,
            });
            throw error;
        }
    }

    async findByField(field, value) {
        const method = 'AvaliacaoDAOMongo.findByField';
        logger.debug(`🟢 ${method} - Buscando avaliações por campo`, { field, value });

        try {
            const allowedFields = ['id', 'projetoId', 'avaliador', 'status'];
            if (!allowedFields.includes(field)) {
                throw new Error(`Campo inválido para busca: ${field}`);
            }

            let filter;
            if (field === 'id') filter = { _id: new ObjectId(value) };
            else if (field === 'projetoId') filter = { projetoId: new ObjectId(value) };
            else filter = { [field]: value };

            const collection = await this.#database.getCollection('avaliacoes');
            const pipeline = [{ $match: filter }, ...this.#lookupProjetoPipeline()];
            const docs = await collection.aggregate(pipeline).toArray();
            const avaliacoes = docs.map(doc => this.#documentToObject(doc));

            logger.info(`✅ ${method} - ${avaliacoes.length} avaliações encontradas para ${field}=${value}`);
            return avaliacoes;
        } catch (error) {
            logger.error(`❌ ${method} - Erro ao buscar avaliações por campo`, {
                field,
                value,
                error: error.message,
                stack: error.stack,
            });
            throw error;
        }
    }

    #getProjetoId(objAvaliacaoModel) {
        return typeof objAvaliacaoModel.projeto === 'string'
            ? objAvaliacaoModel.projeto
            : objAvaliacaoModel.projeto.id;
    }

    #modelToDocument(objAvaliacaoModel) {
        return {
            projetoId: new ObjectId(this.#getProjetoId(objAvaliacaoModel)),
            avaliador: objAvaliacaoModel.avaliador,
            data: objAvaliacaoModel.data,
            criatividade: objAvaliacaoModel.criatividade,
            relevancia: objAvaliacaoModel.relevancia,
            viabilidade: objAvaliacaoModel.viabilidade,
            apresentacao: objAvaliacaoModel.apresentacao,
            conhecimentoTecnico: objAvaliacaoModel.conhecimentoTecnico,
            funcionalidade: objAvaliacaoModel.funcionalidade,
            sustentabilidade: objAvaliacaoModel.sustentabilidade,
            trabalhoEquipe: objAvaliacaoModel.trabalhoEquipe,
            originalidade: objAvaliacaoModel.originalidade,
            potencialMercado: objAvaliacaoModel.potencialMercado,
            comentarios: objAvaliacaoModel.comentarios,
            notaFinal: objAvaliacaoModel.notaFinal,
            status: objAvaliacaoModel.status,
        };
    }

    #lookupProjetoPipeline() {
        return [
            {
                $lookup: {
                    from: 'projetos',
                    localField: 'projetoId',
                    foreignField: '_id',
                    as: 'projeto',
                },
            },
            { $unwind: { path: '$projeto', preserveNullAndEmptyArrays: true } },
            { $sort: { data: -1 } },
        ];
    }

    #documentToObject(doc) {
        return {
            id: doc._id.toString(),
            projeto: doc.projeto ? {
                id: doc.projeto._id.toString(),
                titulo: doc.projeto.titulo,
                descricao: doc.projeto.descricao,
            } : null,
            avaliador: doc.avaliador,
            data: doc.data,
            criatividade: doc.criatividade,
            relevancia: doc.relevancia,
            viabilidade: doc.viabilidade,
            apresentacao: doc.apresentacao,
            conhecimentoTecnico: doc.conhecimentoTecnico,
            funcionalidade: doc.funcionalidade,
            sustentabilidade: doc.sustentabilidade,
            trabalhoEquipe: doc.trabalhoEquipe,
            originalidade: doc.originalidade,
            potencialMercado: doc.potencialMercado,
            comentarios: doc.comentarios || [],
            notaFinal: doc.notaFinal,
            status: doc.status,
            dataAtualizacao: doc.dataAtualizacao,
        };
    }
};