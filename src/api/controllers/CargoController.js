// src/api/controllers/CargoController.js
const logger = require('../utils/Logger');

module.exports = class CargoControl {
    #cargoService;

    constructor(cargoServiceDependency) {
        logger.info('⬆️ CargoControl.constructor()');
        this.#cargoService = cargoServiceDependency;
    }

    store = async (request, response, next) => {
        const method = 'CargoControl.store';
        logger.info(`🔵 ${method} - Iniciando`, {
            body: request.body,
            url: request.originalUrl,
            method: request.method,
        });

        try {
            const cargoBodyRequest = request.body.cargo;
            const novoId = await this.#cargoService.createCargo(cargoBodyRequest);

            const objResposta = {
                success: true,
                message: 'Cadastro realizado com sucesso',
                data: {
                    cargos: [{
                        idCargo: novoId,
                        nomeCargo: cargoBodyRequest.nomeCargo,
                    }],
                },
            };

            logger.info(`✅ ${method} - Cargo criado com sucesso`, { id: novoId });
            response.status(201).send(objResposta);
        } catch (error) {
            logger.error(`❌ ${method} - Erro ao criar cargo`, {
                error: error.message,
                stack: error.stack,
                body: request.body,
            });
            next(error);
        }
    };

    index = async (request, response, next) => {
        const method = 'CargoControl.index';
        logger.info(`🔵 ${method} - Listando todos os cargos`, {
            url: request.originalUrl,
            method: request.method,
        });

        try {
            const arrayCargos = await this.#cargoService.findAll();

            logger.info(`✅ ${method} - ${arrayCargos.length} cargos encontrados`);
            response.status(200).send({
                success: true,
                message: 'Busca realizada com sucesso',
                data: { cargos: arrayCargos },
            });
        } catch (error) {
            logger.error(`❌ ${method} - Erro ao listar cargos`, {
                error: error.message,
                stack: error.stack,
            });
            next(error);
        }
    };

    show = async (request, response, next) => {
        const method = 'CargoControl.show';
        const { idCargo } = request.params;
        logger.info(`🔵 ${method} - Buscando cargo por ID`, {
            idCargo,
            url: request.originalUrl,
        });

        try {
            const cargo = await this.#cargoService.findById(idCargo);

            const objResposta = {
                success: true,
                message: 'Executado com sucesso',
                data: { cargos: cargo },
            };

            logger.info(`✅ ${method} - Cargo encontrado`, { idCargo });
            response.status(200).send(objResposta);
        } catch (error) {
            logger.error(`❌ ${method} - Erro ao buscar cargo ${idCargo}`, {
                error: error.message,
                stack: error.stack,
            });
            next(error);
        }
    };

    update = async (request, response, next) => {
        const method = 'CargoControl.update';
        const { idCargo } = request.params;
        const { nomeCargo } = request.body.cargo;
        logger.info(`🔵 ${method} - Atualizando cargo`, {
            idCargo,
            nomeCargo,
            url: request.originalUrl,
        });

        try {
            const atualizou = await this.#cargoService.updateCargo(idCargo, nomeCargo);

            if (atualizou) {
                logger.info(`✅ ${method} - Cargo ${idCargo} atualizado com sucesso`);
                return response.status(200).send({
                    success: true,
                    message: 'Atualizado com sucesso',
                    data: {
                        cargos: [{ idCargo, nomeCargo }],
                    },
                });
            } else {
                logger.warn(`⚠️ ${method} - Cargo ${idCargo} não encontrado para atualização`);
                return response.status(404).send({
                    success: false,
                    message: 'Cargo não encontrado para atualização',
                    data: {
                        cargos: [{ idCargo, nomeCargo }],
                    },
                });
            }
        } catch (error) {
            logger.error(`❌ ${method} - Erro ao atualizar cargo ${idCargo}`, {
                error: error.message,
                stack: error.stack,
            });
            next(error);
        }
    };

    destroy = async (request, response, next) => {
        const method = 'CargoControl.destroy';
        const { idCargo } = request.params;
        logger.info(`🔵 ${method} - Excluindo cargo`, {
            idCargo,
            url: request.originalUrl,
        });

        try {
            const excluiu = await this.#cargoService.deleteCargo(idCargo);

            if (excluiu) {
                logger.info(`✅ ${method} - Cargo ${idCargo} excluído com sucesso`);
                return response.status(204).send({
                    success: true,
                    message: 'Excluído com sucesso',
                    data: {
                        cargos: [{ idCargo }],
                    },
                });
            } else {
                logger.warn(`⚠️ ${method} - Cargo ${idCargo} não encontrado para exclusão`);
                return response.status(404).send({
                    success: false,
                    message: 'Cargo não encontrado para exclusão',
                    data: {
                        cargos: [{ idCargo }],
                    },
                });
            }
        } catch (error) {
            logger.error(`❌ ${method} - Erro ao excluir cargo ${idCargo}`, {
                error: error.message,
                stack: error.stack,
            });
            next(error);
        }
    };
};