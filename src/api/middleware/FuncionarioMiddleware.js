// src/api/middleware/FuncionarioMiddleware.js
const ErrorResponse = require("../utils/ErrorResponse");
const logger = require("../utils/Logger");

/**
 * Middleware para validação de requisições relacionadas à entidade Funcionario.
 * 
 * Objetivo:
 * - Garantir que os dados obrigatórios estejam presentes antes de chamar
 *   os métodos do Controller ou Service.
 * - Lançar erros padronizados usando ErrorResponse quando a validação falhar.
 */
module.exports = class FuncionarioMiddleware {

    /**
     * Valida o corpo da requisição para criação de um novo funcionário.
     * 
     * Verifica:
     * - Se o objeto 'funcionario' existe
     * - Campos obrigatórios: nomeFuncionario, email, senha, recebeValeTransporte
     * - Tipo e valor de recebeValeTransporte (0 ou 1)
     * - Objeto 'cargo' presente e válido
     * - idCargo é um inteiro positivo
     * 
     * @param {Request} request - Objeto de requisição do Express
     * @param {Response} response - Objeto de resposta do Express
     * @param {Function} next - Função next() para passar para o próximo middleware
     * 
     * Lança ErrorResponse com código HTTP 400 em caso de validação falha.
     */
    validateCreateBody = (request, response, next) => {
        const method = 'FuncionarioMiddleware.validateCreateBody';
        logger.debug(`🔷 ${method} - Iniciando validação de criação de funcionário`, {
            url: request.originalUrl,
            method: request.method,
            body: request.body,
        });

        const body = request.body;

        // Validação: campo 'funcionario' existe?
        if (!body.funcionario) {
            logger.warn(`⚠️ ${method} - Validação falhou: campo 'funcionario' ausente`, {
                url: request.originalUrl,
                body: request.body,
            });
            throw new ErrorResponse(400, "Erro na validação de dados", {
                message: "O campo 'funcionario' é obrigatório!",
            });
        }

        const funcionario = body.funcionario;

        // Validação: campos obrigatórios
        const camposObrigatorios = ["nomeFuncionario", "email", "senha", "recebeValeTransporte"];
        for (const campo of camposObrigatorios) {
            if (funcionario[campo] === undefined || funcionario[campo] === null || funcionario[campo] === "") {
                logger.warn(`⚠️ ${method} - Validação falhou: campo '${campo}' ausente ou vazio`, {
                    url: request.originalUrl,
                    campo,
                    funcionario,
                });
                throw new ErrorResponse(400, "Erro na validação de dados", {
                    message: `O campo '${campo}' é obrigatório!`,
                });
            }
        }

        // Validação: recebeValeTransporte deve ser 0 ou 1
        if (![0, 1].includes(funcionario.recebeValeTransporte)) {
            logger.warn(`⚠️ ${method} - Validação falhou: 'recebeValeTransporte' inválido`, {
                url: request.originalUrl,
                recebeValeTransporte: funcionario.recebeValeTransporte,
            });
            throw new ErrorResponse(400, "Erro na validação de dados", {
                message: "O campo 'recebeValeTransporte' deve ser 0 ou 1",
            });
        }

        // Validação: cargo deve ser objeto
        if (!funcionario.cargo || typeof funcionario.cargo !== "object") {
            logger.warn(`⚠️ ${method} - Validação falhou: 'cargo' ausente ou não é objeto`, {
                url: request.originalUrl,
                cargo: funcionario.cargo,
            });
            throw new ErrorResponse(400, "Erro na validação de dados", {
                message: "O campo 'cargo' é obrigatório e deve ser um objeto",
            });
        }

        // Validação: idCargo deve ser número inteiro positivo
    

        logger.debug(`✅ ${method} - Validação de criação concluída com sucesso`, {
            email: funcionario.email,
            nomeFuncionario: funcionario.nomeFuncionario,
        });

        next();
    };

    /**
     * Valida o corpo da requisição para login de um funcionário.
     * 
     * Verifica:
     * - Se o objeto 'funcionario' existe
     * - Campos obrigatórios: email, senha
     * - Formato básico de email
     * 
     * @param {Request} request - Objeto de requisição do Express
     * @param {Response} response - Objeto de resposta do Express
     * @param {Function} next - Função next() para passar para o próximo middleware
     * 
     * Lança ErrorResponse com código HTTP 400 em caso de validação falha.
     */
    validateLoginBody = (request, response, next) => {
        const method = 'FuncionarioMiddleware.validateLoginBody';
        const { email } = request.body.funcionario || {};
        logger.debug(`🔷 ${method} - Iniciando validação de login`, {
            url: request.originalUrl,
            method: request.method,
            email,
        });

        const body = request.body;

        if (!body.funcionario) {
            logger.warn(`⚠️ ${method} - Validação falhou: campo 'funcionario' ausente`, {
                url: request.originalUrl,
                body: request.body,
            });
            throw new ErrorResponse(400, "Erro na validação de dados", {
                message: "O campo 'funcionario' é obrigatório!",
            });
        }

        const funcionario = body.funcionario;

        const camposObrigatorios = ["email", "senha"];
        for (const campo of camposObrigatorios) {
            if (!funcionario[campo] || funcionario[campo].toString().trim() === "") {
                logger.warn(`⚠️ ${method} - Validação falhou: campo '${campo}' ausente ou vazio`, {
                    url: request.originalUrl,
                    campo,
                    email,
                });
                throw new ErrorResponse(400, "Erro na validação de dados", {
                    message: `O campo '${campo}' é obrigatório!`,
                });
            }
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(funcionario.email)) {
            logger.warn(`⚠️ ${method} - Validação falhou: formato de email inválido`, {
                url: request.originalUrl,
                email: funcionario.email,
            });
            throw new ErrorResponse(400, "Erro na validação de dados", {
                message: "O campo 'email' não é um e-mail válido",
            });
        }

        logger.debug(`✅ ${method} - Validação de login concluída com sucesso`, { email });

        next();
    };

    /**
     * Valida o parâmetro de rota 'idFuncionario' em requisições que necessitam de identificação do funcionário.
     * 
     * Verifica:
     * - Se o parâmetro 'idFuncionario' foi passado na URL
     * 
     * @param {Request} request - Objeto de requisição do Express
     * @param {Response} response - Objeto de resposta do Express
     * @param {Function} next - Função next() para passar para o próximo middleware
     * 
     * Lança ErrorResponse com código HTTP 400 caso 'idFuncionario' não seja fornecido.
     */
    validateIdParam = (request, response, next) => {
        const method = 'FuncionarioMiddleware.validateIdParam';
        const { idFuncionario } = request.params;

        logger.debug(`🔷 ${method} - Validando parâmetro ID`, {
            url: request.originalUrl,
            method: request.method,
            params: request.params,
        });

        if (!idFuncionario) {
            logger.warn(`⚠️ ${method} - Validação falhou: 'idFuncionario' ausente na URL`, {
                url: request.originalUrl,
                params: request.params,
            });
            throw new ErrorResponse(400, "Erro na validação de dados", {
                message: "O parâmetro 'idFuncionario' é obrigatório!",
            });
        }

        logger.debug(`✅ ${method} - ID válido: ${idFuncionario}`, { idFuncionario });

        next();
    };
};