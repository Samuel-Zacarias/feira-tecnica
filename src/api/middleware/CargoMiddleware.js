// src/api/middleware/CargoMiddleware.js
const ErrorResponse = require("../utils/ErrorResponse");
const Cargo = require("../models/Cargo");
const logger = require("../utils/Logger");

/**
 * Middleware para validação de requisições relacionadas à entidade Cargo.
 * 
 * Objetivo:
 * - Garantir que os dados obrigatórios estejam presentes antes de chamar
 *   os métodos do Controller ou Service.
 * - Lançar erros padronizados usando ErrorResponse quando a validação falhar.
 */
module.exports = class CargoMiddleware {

    /**
     * Valida o corpo da requisição (request.body) para operações de Cargo.
     * 
     * Verifica:
     * - Se o objeto 'cargo' existe
     * - Se o campo obrigatório 'nomeCargo' está presente e não é vazio
     * 
     * @param {Request} request - Objeto de requisição do Express
     * @param {Response} response - Objeto de resposta do Express
     * @param {Function} next - Função next() para passar para o próximo middleware
     * 
     * Lança ErrorResponse com código HTTP 400 em caso de validação falha.
     */
    validateBody = (request, response, next) => {
        const method = 'CargoMiddleware.validateBody';
        logger.debug(`🔷 ${method} - Iniciando validação do corpo`, {
            url: request.originalUrl,
            method: request.method,
            body: request.body,
        });

        const body = request.body;

        // Validação: campo 'cargo' existe?
        if (!body.cargo) {
            logger.warn(`⚠️ ${method} - Validação falhou: campo 'cargo' ausente`, {
                url: request.originalUrl,
                body: request.body,
            });
            throw new ErrorResponse(400, "Erro na validação de dados", {
                message: "O campo 'cargo' é obrigatório!",
            });
        }

        const cargo = body.cargo;

        // Validação: campo 'nomeCargo' existe e não está vazio?
        if (!cargo.nomeCargo || cargo.nomeCargo.trim() === "") {
            logger.warn(`⚠️ ${method} - Validação falhou: campo 'nomeCargo' vazio ou ausente`, {
                url: request.originalUrl,
                cargo: cargo,
            });
            throw new ErrorResponse(400, "Erro na validação de dados", {
                message: "O campo 'nomeCargo' é obrigatório!",
            });
        }

        logger.debug(`✅ ${method} - Validação do corpo concluída com sucesso`, {
            nomeCargo: cargo.nomeCargo,
        });

        next(); // Passa para o próximo middleware ou controller
    }

    /**
     * Valida o parâmetro de rota 'idCargo' em requisições que necessitam de identificação do cargo.
     * 
     * Verifica:
     * - Se o parâmetro 'idCargo' foi passado na URL
     * 
     * @param {Request} request - Objeto de requisição do Express
     * @param {Response} response - Objeto de resposta do Express
     * @param {Function} next - Função next() para passar para o próximo middleware
     * 
     * Lança ErrorResponse com código HTTP 400 caso 'idCargo' não seja fornecido.
     */
    validateIdParam = (request, response, next) => {
        const method = 'CargoMiddleware.validateIdParam';
        const { idCargo } = request.params;

        logger.debug(`🔷 ${method} - Validando parâmetro ID`, {
            url: request.originalUrl,
            method: request.method,
            params: request.params,
        });

        if (!idCargo) {
            logger.warn(`⚠️ ${method} - Validação falhou: 'idCargo' ausente na URL`, {
                url: request.originalUrl,
                params: request.params,
            });
            throw new ErrorResponse(400, "Erro na validação de dados", {
                message: "O parâmetro 'idCargo' é obrigatório!",
            });
        }

        logger.debug(`✅ ${method} - ID válido: ${idCargo}`, { idCargo });

        next(); // Passa para o próximo middleware ou controller
    }
}