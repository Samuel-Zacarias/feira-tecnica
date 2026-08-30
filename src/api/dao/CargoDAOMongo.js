// src/api/dao/CargoDAOMongo.js
const { ObjectId } = require('mongodb');
const logger = require('../utils/Logger');

module.exports = class CargoDAOMongo {
    #database;

    constructor(databaseInstance) {
        logger.info('⬆️ CargoDAOMongo.constructor()');
        this.#database = databaseInstance;
    }

    async create(objCargoModel) {
        const method = 'CargoDAOMongo.create';
        logger.debug(`🟢 ${method} - Iniciando criação de cargo`, {
            nomeCargo: objCargoModel.nomeCargo,
        });

        try {
            const collection = await this.#database.getCollection('cargos');
            const doc = {
                nomeCargo: objCargoModel.nomeCargo,
            };
            const result = await collection.insertOne(doc);

            if (!result.insertedId) {
                logger.error(`❌ ${method} - Falha ao inserir cargo`, {
                    nomeCargo: objCargoModel.nomeCargo,
                });
                throw new Error('Falha ao inserir cargo');
            }

            const insertedId = result.insertedId.toString();
            logger.info(`✅ ${method} - Cargo criado com sucesso`, {
                idCargo: insertedId,
                nomeCargo: objCargoModel.nomeCargo,
            });
            return insertedId;
        } catch (error) {
            logger.error(`❌ ${method} - Erro ao criar cargo`, {
                nomeCargo: objCargoModel.nomeCargo,
                error: error.message,
                stack: error.stack,
            });
            throw error;
        }
    }

    async delete(objCargoModel) {
        const method = 'CargoDAOMongo.delete';
        logger.debug(`🟢 ${method} - Iniciando exclusão de cargo`, {
            idCargo: objCargoModel.idCargo,
        });

        try {
            const collection = await this.#database.getCollection('cargos');
            const filter = { _id: new ObjectId(objCargoModel.idCargo) };
            const result = await collection.deleteOne(filter);

            const deleted = result.deletedCount > 0;
            if (deleted) {
                logger.info(`✅ ${method} - Cargo excluído com sucesso`, {
                    idCargo: objCargoModel.idCargo,
                });
            } else {
                logger.warn(`⚠️ ${method} - Cargo não encontrado para exclusão`, {
                    idCargo: objCargoModel.idCargo,
                });
            }
            return deleted;
        } catch (error) {
            logger.error(`❌ ${method} - Erro ao excluir cargo ${objCargoModel.idCargo}`, {
                idCargo: objCargoModel.idCargo,
                error: error.message,
                stack: error.stack,
            });
            throw error;
        }
    }

    async update(objCargoModel) {
        const method = 'CargoDAOMongo.update';
        logger.debug(`🟢 ${method} - Iniciando atualização de cargo`, {
            idCargo: objCargoModel.idCargo,
            novoNome: objCargoModel.nomeCargo,
        });

        try {
            const collection = await this.#database.getCollection('cargos');
            const filter = { _id: new ObjectId(objCargoModel.idCargo) };
            const update = { $set: { nomeCargo: objCargoModel.nomeCargo } };
            const result = await collection.updateOne(filter, update);

            const updated = result.modifiedCount > 0;
            if (updated) {
                logger.info(`✅ ${method} - Cargo atualizado com sucesso`, {
                    idCargo: objCargoModel.idCargo,
                    novoNome: objCargoModel.nomeCargo,
                });
            } else {
                logger.warn(`⚠️ ${method} - Cargo não encontrado para atualização`, {
                    idCargo: objCargoModel.idCargo,
                });
            }
            return updated;
        } catch (error) {
            logger.error(`❌ ${method} - Erro ao atualizar cargo ${objCargoModel.idCargo}`, {
                idCargo: objCargoModel.idCargo,
                error: error.message,
                stack: error.stack,
            });
            throw error;
        }
    }

    async findAll() {
        const method = 'CargoDAOMongo.findAll';
        logger.debug(`🟢 ${method} - Buscando todos os cargos`);

        try {
            const collection = await this.#database.getCollection('cargos');
            const docs = await collection.find().toArray();

            const cargos = docs.map(doc => ({
                idCargo: doc._id.toString(),
                nomeCargo: doc.nomeCargo,
            }));

            logger.info(`✅ ${method} - ${cargos.length} cargos encontrados`);
            return cargos;
        } catch (error) {
            logger.error(`❌ ${method} - Erro ao buscar todos os cargos`, {
                error: error.message,
                stack: error.stack,
            });
            throw error;
        }
    }

    async findById(idCargo) {
        const method = 'CargoDAOMongo.findById';
        logger.debug(`🟢 ${method} - Buscando cargo por ID`, { idCargo });

        try {
            const collection = await this.#database.getCollection('cargos');
            const filter = { _id: new ObjectId(idCargo) };
            const doc = await collection.findOne(filter);

            if (!doc) {
                logger.warn(`⚠️ ${method} - Cargo não encontrado`, { idCargo });
                return null;
            }

            const cargo = {
                idCargo: doc._id.toString(),
                nomeCargo: doc.nomeCargo,
            };

            logger.info(`✅ ${method} - Cargo encontrado`, { idCargo });
            return cargo;
        } catch (error) {
            logger.error(`❌ ${method} - Erro ao buscar cargo ${idCargo}`, {
                idCargo,
                error: error.message,
                stack: error.stack,
            });
            throw error;
        }
    }

    async findByField(field, value) {
        const method = 'CargoDAOMongo.findByField';
        logger.debug(`🟢 ${method} - Buscando cargos por campo`, { field, value });

        try {
            const allowedFields = ['idCargo', 'nomeCargo'];
            if (!allowedFields.includes(field)) {
                logger.error(`❌ ${method} - Campo inválido para busca`, { field });
                throw new Error(`Campo inválido para busca: ${field}`);
            }

            const collection = await this.#database.getCollection('cargos');
            let filter;
            if (field === 'idCargo') {
                filter = { _id: new ObjectId(value) };
            } else {
                filter = { [field]: value };
            }

            const docs = await collection.find(filter).toArray();
            const cargos = docs.map(doc => ({
                idCargo: doc._id.toString(),
                nomeCargo: doc.nomeCargo,
            }));

            logger.info(`✅ ${method} - ${cargos.length} cargos encontrados para ${field}=${value}`);
            return cargos;
        } catch (error) {
            logger.error(`❌ ${method} - Erro ao buscar cargos por campo ${field}=${value}`, {
                field,
                value,
                error: error.message,
                stack: error.stack,
            });
            throw error;
        }
    }
};