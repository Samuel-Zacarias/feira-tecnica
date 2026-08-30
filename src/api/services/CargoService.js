// src/api/services/CargoService.js
const CargoDAO = require("../dao/CargoDAOMongo");
const Cargo = require("../models/Cargo");
const ErrorResponse = require("../utils/ErrorResponse");
const logger = require("../utils/Logger");

/**
 * Classe responsável pela camada de serviço para a entidade Cargo.
 * 
 * Observações sobre injeção de dependência:
 * - O CargoService **recebe uma instância de CargoDAO via construtor**.
 * - Isso segue o padrão de injeção de dependência, tornando o serviço desacoplado
 *   do DAO concreto, facilitando testes unitários e substituição por mocks.
 */
module.exports = class CargoService {
    #cargoDAO;

    /**
     * Construtor da classe CargoService
     * @param {CargoDAO} cargoDAODependency - Instância de CargoDAO
     */
    constructor(cargoDAODependency) {
        logger.info('⬆️ CargoService.constructor()');
        this.#cargoDAO = cargoDAODependency; // injeção de dependência
        logger.debug('🔍 Dependência injetada no CargoService', {
            hasCargoDAO: !!this.#cargoDAO,
        });
    }

    /**
     * Cria um novo cargo
     * @param {Object} cargoJson - Dados do cargo { nomeCargo }
     * @returns {Promise<number>} - ID do novo cargo criado
     * 
     * Validações:
     * - nomeCargo não pode estar vazio
     * - Não pode existir outro cargo com mesmo nome
     */
    createCargo = async (cargoJson) => {
        const method = 'CargoService.createCargo';
        logger.debug(`🟣 ${method} - Iniciando criação de cargo`, {
            nomeCargo: cargoJson.nomeCargo,
        });

        try {
            const cargo = new Cargo();
            // Valida regra de domínio
            cargo.nomeCargo = cargoJson.nomeCargo;

            // Valida regra de negócio: verifica se cargo já existe
            const resultado = await this.#cargoDAO.findByField("nomeCargo", cargo.nomeCargo);

            if (resultado.length > 0) {
                logger.warn(`⚠️ ${method} - Tentativa de criar cargo duplicado`, {
                    nomeCargo: cargo.nomeCargo,
                });
                throw new ErrorResponse(
                    400,
                    "Cargo já existe",
                    { message: `O cargo ${cargo.nomeCargo} já existe` }
                );
            }

            const novoId = await this.#cargoDAO.create(cargo);
            logger.info(`✅ ${method} - Cargo criado com sucesso`, {
                idCargo: novoId,
                nomeCargo: cargo.nomeCargo,
            });
            return novoId;
        } catch (error) {
            logger.error(`❌ ${method} - Erro ao criar cargo`, {
                nomeCargo: cargoJson?.nomeCargo,
                error: error.message,
                stack: error.stack,
            });
            throw error;
        }
    }

    /**
     * Retorna todos os cargos
     */
    findAll = async () => {
        const method = 'CargoService.findAll';
        logger.debug(`🟣 ${method} - Buscando todos os cargos`);

        try {
            const cargos = await this.#cargoDAO.findAll();
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

    /**
     * Retorna um cargo por ID
     * @param {number} idCargo
     */
    findById = async (idCargo) => {
        const method = 'CargoService.findById';
        logger.debug(`🟣 ${method} - Buscando cargo por ID`, { idCargo });

        try {
            const cargo = new Cargo();
            // Passa pela validação de regra de domínio
            cargo.idCargo = idCargo;

            const resultado = await this.#cargoDAO.findById(cargo.idCargo);
            if (!resultado) {
                logger.warn(`⚠️ ${method} - Cargo não encontrado`, { idCargo });
                return null;
            }
            logger.info(`✅ ${method} - Cargo encontrado`, { idCargo });
            return resultado;
        } catch (error) {
            logger.error(`❌ ${method} - Erro ao buscar cargo ${idCargo}`, {
                idCargo,
                error: error.message,
                stack: error.stack,
            });
            throw error;
        }
    }

    /**
     * Atualiza um cargo existente.
     *
     * 🔹 Regra de domínio: o idCargo deve ser um número inteiro positivo.
     *
     * @param {number} idCargo - Identificador do cargo a ser atualizado.
     * @param {Object} nomeCargo - Objeto contendo os dados do cargo.
     * @param {string} nomeCargo.nomeCargo - Nome do cargo (deve ser string não vazia).
     *
     * @returns {Promise<Cargo>} - Objeto Cargo atualizado.
     * @throws {Error} - Se idCargo for inválido ou nomeCargo não atender às regras de domínio.
     *
     * @example
     * const cargoAtualizado = await cargoService.updateCargo(3, { nomeCargo: "Gerente" });
     */
    updateCargo = async (idCargo, nomeCargo) => {
        const method = 'CargoService.updateCargo';
        logger.debug(`🟣 ${method} - Atualizando cargo`, { idCargo, nomeCargo });

        try {
            const cargo = new Cargo();

            // Validação de regras de domínio
            cargo.idCargo = idCargo;
            cargo.nomeCargo = nomeCargo;

            const atualizado = await this.#cargoDAO.update(cargo);
            if (atualizado) {
                logger.info(`✅ ${method} - Cargo ${idCargo} atualizado com sucesso`, { nomeCargo });
            } else {
                logger.warn(`⚠️ ${method} - Cargo ${idCargo} não encontrado para atualização`);
            }
            return atualizado;
        } catch (error) {
            logger.error(`❌ ${method} - Erro ao atualizar cargo ${idCargo}`, {
                idCargo,
                nomeCargo,
                error: error.message,
                stack: error.stack,
            });
            throw error;
        }
    }

    /**
     * Deleta um cargo por ID
     * @param {number} idCargo
     */
    deleteCargo = async (idCargo) => {
        const method = 'CargoService.deleteCargo';
        logger.debug(`🟣 ${method} - Deletando cargo`, { idCargo });

        try {
            const cargo = new Cargo();
            cargo.idCargo = idCargo; // validação de regra de domínio

            // Passa como parâmetro objeto que será excluído
            const excluido = await this.#cargoDAO.delete(cargo);
            if (excluido) {
                logger.info(`✅ ${method} - Cargo ${idCargo} excluído com sucesso`);
            } else {
                logger.warn(`⚠️ ${method} - Cargo ${idCargo} não encontrado para exclusão`);
            }
            return excluido;
        } catch (error) {
            logger.error(`❌ ${method} - Erro ao excluir cargo ${idCargo}`, {
                idCargo,
                error: error.message,
                stack: error.stack,
            });
            throw error;
        }
    }
};