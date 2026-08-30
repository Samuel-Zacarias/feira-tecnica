// src/api/utils/ErrorResponse.js
const logger = require("./Logger");

/**
 * Classe personalizada de erro para a aplicação.
 * 
 * Estende a classe nativa Error do JavaScript para incluir:
 * - Código HTTP (httpCode)
 * - Informações adicionais sobre o erro (error)
 * 
 * Pode ser utilizada em middlewares ou serviços para padronizar respostas de erro.
 */
module.exports = class ErrorResponse extends Error {
    // Atributos privados
    #httpCode; // Código HTTP a ser retornado
    #error;    // Detalhes adicionais do erro em JSON ou string
    #name;

    /**
     * Construtor da classe ErrorResponse
     * @param {number} httpCode - Código de status HTTP (ex: 400, 404, 500)
     * @param {string} message - Mensagem de erro descritiva
     * @param {any} error - Objeto adicional com detalhes do erro (opcional)
     */
    constructor(httpCode, message, error = null) {
        super(message); // Chama o construtor da classe Error
        this.#name = "ErrorResponse";
        this.#httpCode = httpCode; // Código HTTP
        this.#error = error;       // Informações adicionais

        // Captura o stack trace para melhor depuração
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }

        // Registra o erro no logger (apenas para erros com código >= 400)
        if (httpCode >= 400) {
            const method = 'ErrorResponse.constructor';
            logger.error(`❌ ${method} - Erro lançado com código ${httpCode}`, {
                httpCode,
                message: this.message,
                error: this.#error,
                stack: this.stack,
                name: this.#name,
            });
        } else {
            // Para códigos menores que 400 (não são erros), apenas log de debug
            const method = 'ErrorResponse.constructor';
            logger.debug(`🔍 ${method} - Erro com código não crítico`, {
                httpCode,
                message: this.message,
                error: this.#error,
            });
        }
    }

    /**
     * Retorna o código HTTP associado ao erro.
     * @returns {number} Código HTTP
     */
    get httpCode() {
        return this.#httpCode;
    }

    /**
     * Retorna informações adicionais sobre o erro.
     * @returns {any} Objeto JSON ou string com detalhes do erro
     */
    get error() {
        return this.#error;
    }

    /**
     * Retorna o nome do erro.
     * @returns {string} Nome do erro
     */
    get name() {
        return this.#name;
    }

    /**
     * Método estático para criar uma instância e já lançar o erro.
     * Útil para simplificar o código em middlewares ou serviços.
     * 
     * @param {number} httpCode - Código HTTP
     * @param {string} message - Mensagem de erro
     * @param {any} error - Detalhes adicionais (opcional)
     * @throws {ErrorResponse} - Lança a instância criada
     * 
     * @example
     * ErrorResponse.throw(400, "Campo obrigatório", { field: "nome" });
     */
    static throw(httpCode, message, error = null) {
        const err = new ErrorResponse(httpCode, message, error);
        // Log adicional antes de lançar
        logger.warn(`⚠️ ErrorResponse.throw - Lançando erro ${httpCode}`, {
            httpCode,
            message,
            error,
            stack: err.stack,
        });
        throw err;
    }

    /**
     * Método estático para criar uma instância sem lançar.
     * Útil para quando você quer retornar o erro em vez de lançá-lo.
     * 
     * @param {number} httpCode - Código HTTP
     * @param {string} message - Mensagem de erro
     * @param {any} error - Detalhes adicionais (opcional)
     * @returns {ErrorResponse} Instância de ErrorResponse
     * 
     * @example
     * const err = ErrorResponse.create(404, "Recurso não encontrado");
     * return err;
     */
    static create(httpCode, message, error = null) {
        const err = new ErrorResponse(httpCode, message, error);
        logger.debug(`🔍 ErrorResponse.create - Erro criado ${httpCode}`, {
            httpCode,
            message,
            error,
        });
        return err;
    }

    /**
     * Converte o erro para um objeto JSON.
     * Útil para respostas de API.
     * 
     * @returns {Object} Objeto com httpCode, message e error
     */
    toJSON() {
        return {
            success: false,
            httpCode: this.#httpCode,
            message: this.message,
            error: this.#error,
        };
    }

    /**
     * Converte o erro para uma string legível.
     * 
     * @returns {string} String formatada do erro
     */
    toString() {
        return `ErrorResponse [${this.#httpCode}]: ${this.message} - ${JSON.stringify(this.#error)}`;
    }
};