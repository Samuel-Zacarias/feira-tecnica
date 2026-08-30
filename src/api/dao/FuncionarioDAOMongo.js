// src/api/dao/FuncionarioDAOMongo.js
const { ObjectId } = require('mongodb');
const bcrypt = require('bcrypt');
const logger = require('../utils/Logger');

module.exports = class FuncionarioDAOMongo {
    #database;

    constructor(databaseInstance) {
        logger.info('⬆️ FuncionarioDAOMongo.constructor()');
        this.#database = databaseInstance;
    }

    async create(objFuncionarioModel) {
        const method = 'FuncionarioDAOMongo.create';
        logger.debug(`🟢 ${method} - Iniciando criação de funcionário`, {
            email: objFuncionarioModel.email,
            nomeFuncionario: objFuncionarioModel.nomeFuncionario,
        });

        try {
            // Criptografa a senha
            objFuncionarioModel.senha = await bcrypt.hash(objFuncionarioModel.senha, 12);

            const collection = await this.#database.getCollection('funcionarios');
            const doc = {
                nomeFuncionario: objFuncionarioModel.nomeFuncionario,
                email: objFuncionarioModel.email,
                senha: objFuncionarioModel.senha,
                recebeValeTransporte: objFuncionarioModel.recebeValeTransporte,
                cargoId: new ObjectId(objFuncionarioModel.cargo.idCargo),
            };
            const result = await collection.insertOne(doc);

            if (!result.insertedId) {
                logger.error(`❌ ${method} - Falha ao inserir funcionário`, {
                    email: objFuncionarioModel.email,
                });
                throw new Error('Falha ao inserir funcionário');
            }

            const insertedId = result.insertedId.toString();
            logger.info(`✅ ${method} - Funcionário criado com sucesso`, {
                idFuncionario: insertedId,
                email: objFuncionarioModel.email,
            });
            return insertedId;
        } catch (error) {
            logger.error(`❌ ${method} - Erro ao criar funcionário`, {
                email: objFuncionarioModel?.email,
                error: error.message,
                stack: error.stack,
            });
            throw error;
        }
    }

    async delete(objFuncionarioModel) {
        const method = 'FuncionarioDAOMongo.delete';
        logger.debug(`🟢 ${method} - Iniciando exclusão de funcionário`, {
            idFuncionario: objFuncionarioModel.idFuncionario,
        });

        try {
            const collection = await this.#database.getCollection('funcionarios');
            const filter = { _id: new ObjectId(objFuncionarioModel.idFuncionario) };
            const result = await collection.deleteOne(filter);

            const deleted = result.deletedCount > 0;
            if (deleted) {
                logger.info(`✅ ${method} - Funcionário excluído com sucesso`, {
                    idFuncionario: objFuncionarioModel.idFuncionario,
                });
            } else {
                logger.warn(`⚠️ ${method} - Funcionário não encontrado para exclusão`, {
                    idFuncionario: objFuncionarioModel.idFuncionario,
                });
            }
            return deleted;
        } catch (error) {
            logger.error(`❌ ${method} - Erro ao excluir funcionário ${objFuncionarioModel.idFuncionario}`, {
                idFuncionario: objFuncionarioModel.idFuncionario,
                error: error.message,
                stack: error.stack,
            });
            throw error;
        }
    }

    async update(objFuncionarioModel) {
        const method = 'FuncionarioDAOMongo.update';
        logger.debug(`🟢 ${method} - Iniciando atualização de funcionário`, {
            idFuncionario: objFuncionarioModel.idFuncionario,
            email: objFuncionarioModel.email,
        });

        try {
            const collection = await this.#database.getCollection('funcionarios');
            const filter = { _id: new ObjectId(objFuncionarioModel.idFuncionario) };
            const updateDoc = {
                $set: {
                    nomeFuncionario: objFuncionarioModel.nomeFuncionario,
                    email: objFuncionarioModel.email,
                    recebeValeTransporte: objFuncionarioModel.recebeValeTransporte,
                    cargoId: new ObjectId(objFuncionarioModel.cargo.idCargo),
                },
            };

            if (objFuncionarioModel.senha) {
                const senhaHash = await bcrypt.hash(objFuncionarioModel.senha, 12);
                updateDoc.$set.senha = senhaHash;
                logger.debug(`${method} - Senha atualizada para o funcionário`, {
                    idFuncionario: objFuncionarioModel.idFuncionario,
                });
            }

            const result = await collection.updateOne(filter, updateDoc);

            const updated = result.modifiedCount > 0;
            if (updated) {
                logger.info(`✅ ${method} - Funcionário atualizado com sucesso`, {
                    idFuncionario: objFuncionarioModel.idFuncionario,
                    email: objFuncionarioModel.email,
                });
            } else {
                logger.warn(`⚠️ ${method} - Funcionário não encontrado para atualização`, {
                    idFuncionario: objFuncionarioModel.idFuncionario,
                });
            }
            return updated;
        } catch (error) {
            logger.error(`❌ ${method} - Erro ao atualizar funcionário ${objFuncionarioModel.idFuncionario}`, {
                idFuncionario: objFuncionarioModel.idFuncionario,
                error: error.message,
                stack: error.stack,
            });
            throw error;
        }
    }

    async findAll() {
        const method = 'FuncionarioDAOMongo.findAll';
        logger.debug(`🟢 ${method} - Buscando todos os funcionários`);

        try {
            const collection = await this.#database.getCollection('funcionarios');
            const pipeline = [
                {
                    $lookup: {
                        from: 'cargos',
                        localField: 'cargoId',
                        foreignField: '_id',
                        as: 'cargo',
                    },
                },
                { $unwind: { path: '$cargo', preserveNullAndEmptyArrays: true } },
            ];
            const docs = await collection.aggregate(pipeline).toArray();

            const funcionarios = docs.map(doc => ({
                idFuncionario: doc._id.toString(),
                nomeFuncionario: doc.nomeFuncionario,
                email: doc.email,
                recebeValeTransporte: doc.recebeValeTransporte,
                cargo: doc.cargo ? {
                    idCargo: doc.cargo._id.toString(),
                    nomeCargo: doc.cargo.nomeCargo,
                } : null,
            }));

            logger.info(`✅ ${method} - ${funcionarios.length} funcionários encontrados`);
            return funcionarios;
        } catch (error) {
            logger.error(`❌ ${method} - Erro ao buscar todos os funcionários`, {
                error: error.message,
                stack: error.stack,
            });
            throw error;
        }
    }

    async findById(idFuncionario) {
        const method = 'FuncionarioDAOMongo.findById';
        logger.debug(`🟢 ${method} - Buscando funcionário por ID`, { idFuncionario });

        try {
            const collection = await this.#database.getCollection('funcionarios');
            const pipeline = [
                { $match: { _id: new ObjectId(idFuncionario) } },
                {
                    $lookup: {
                        from: 'cargos',
                        localField: 'cargoId',
                        foreignField: '_id',
                        as: 'cargo',
                    },
                },
                { $unwind: { path: '$cargo', preserveNullAndEmptyArrays: true } },
            ];
            const [doc] = await collection.aggregate(pipeline).toArray();

            if (!doc) {
                logger.warn(`⚠️ ${method} - Funcionário não encontrado`, { idFuncionario });
                return null;
            }

            const funcionario = {
                idFuncionario: doc._id.toString(),
                nomeFuncionario: doc.nomeFuncionario,
                email: doc.email,
                recebeValeTransporte: doc.recebeValeTransporte,
                cargo: doc.cargo ? {
                    idCargo: doc.cargo._id.toString(),
                    nomeCargo: doc.cargo.nomeCargo,
                } : null,
            };

            logger.info(`✅ ${method} - Funcionário encontrado`, { idFuncionario });
            return funcionario;
        } catch (error) {
            logger.error(`❌ ${method} - Erro ao buscar funcionário ${idFuncionario}`, {
                idFuncionario,
                error: error.message,
                stack: error.stack,
            });
            throw error;
        }
    }

    async findByField(field, value) {
        const method = 'FuncionarioDAOMongo.findByField';
        logger.debug(`🟢 ${method} - Buscando funcionários por campo`, { field, value });

        try {
            const allowedFields = ['idFuncionario', 'nomeFuncionario', 'email', 'recebeValeTransporte', 'cargoId'];
            if (!allowedFields.includes(field)) {
                logger.error(`❌ ${method} - Campo inválido para busca`, { field });
                throw new Error('Campo inválido para busca');
            }

            const collection = await this.#database.getCollection('funcionarios');
            let filter;
            if (field === 'idFuncionario') {
                filter = { _id: new ObjectId(value) };
            } else if (field === 'cargoId') {
                filter = { cargoId: new ObjectId(value) };
            } else {
                filter = { [field]: value };
            }

            const docs = await collection.find(filter).toArray();
            const funcionarios = docs.map(doc => ({
                idFuncionario: doc._id.toString(),
                nomeFuncionario: doc.nomeFuncionario,
                email: doc.email,
                recebeValeTransporte: doc.recebeValeTransporte,
                cargoId: doc.cargoId ? doc.cargoId.toString() : null,
            }));

            logger.info(`✅ ${method} - ${funcionarios.length} funcionários encontrados para ${field}=${value}`);
            return funcionarios;
        } catch (error) {
            logger.error(`❌ ${method} - Erro ao buscar funcionários por campo ${field}=${value}`, {
                field,
                value,
                error: error.message,
                stack: error.stack,
            });
            throw error;
        }
    }

    async login(objFuncionarioModel) {
        const method = 'FuncionarioDAOMongo.login';
        logger.info(`🔵 ${method} - Tentativa de login para ${objFuncionarioModel.email}`);

        try {
            const collection = await this.#database.getCollection('funcionarios');
            const pipeline = [
                { $match: { email: objFuncionarioModel.email } },
                {
                    $lookup: {
                        from: 'cargos',
                        localField: 'cargoId',
                        foreignField: '_id',
                        as: 'cargo',
                    },
                },
                { $unwind: { path: '$cargo', preserveNullAndEmptyArrays: true } },
            ];
            const [funcionarioDB] = await collection.aggregate(pipeline).toArray();

            if (!funcionarioDB) {
                logger.warn(`⚠️ ${method} - Funcionário não encontrado`, {
                    email: objFuncionarioModel.email,
                });
                return null;
            }

            const senhaValida = await bcrypt.compare(objFuncionarioModel.senha, funcionarioDB.senha);
            if (!senhaValida) {
                logger.warn(`⚠️ ${method} - Senha inválida para ${objFuncionarioModel.email}`);
                return null;
            }

            // Monta objeto Funcionario com os dados (usando as classes models)
            const Funcionario = require('../models/Funcionario');
            const Cargo = require('../models/Cargo');

            const objCargo = new Cargo();
            if (funcionarioDB.cargo) {
                objCargo.idCargo = funcionarioDB.cargo._id.toString();
                objCargo.nomeCargo = funcionarioDB.cargo.nomeCargo;
            }

            const funcionario = new Funcionario();
            funcionario.idFuncionario = funcionarioDB._id.toString();
            funcionario.nomeFuncionario = funcionarioDB.nomeFuncionario;
            funcionario.email = funcionarioDB.email;
            funcionario.recebeValeTransporte = funcionarioDB.recebeValeTransporte;
            funcionario.cargo = objCargo;

            logger.info(`✅ ${method} - Login bem-sucedido para ${objFuncionarioModel.email}`, {
                idFuncionario: funcionario.idFuncionario,
            });
            return funcionario;
        } catch (error) {
            logger.error(`❌ ${method} - Erro no login para ${objFuncionarioModel.email}`, {
                email: objFuncionarioModel?.email,
                error: error.message,
                stack: error.stack,
            });
            throw error;
        }
    }
};