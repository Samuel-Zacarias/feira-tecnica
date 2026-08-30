// src/api/controllers/FuncionarioController.js
const logger = require('../utils/Logger');

/**
 * Classe responsável por controlar os endpoints da API REST para a entidade Funcionario.
 * 
 * Implementa métodos de CRUD e autenticação, utilizando injeção de dependência
 * para receber a instância de FuncionarioService, desacoplando a lógica de negócio
 * da camada de controle.
 */
module.exports = class FuncionarioControl {
    #funcionarioService;

    /**
     * Construtor da classe FuncionarioControl
     * @param {FuncionarioService} funcionarioServiceDependency - Instância do FuncionarioService
     * 
     * A injeção de dependência permite:
     * - Testes unitários fáceis com mocks;
     * - Troca de implementação do serviço sem alterar o controlador;
     * - Maior desacoplamento entre camadas.
     */
    constructor(funcionarioServiceDependency) {
        logger.info('⬆️ FuncionarioControl.constructor()');
        this.#funcionarioService = funcionarioServiceDependency;
    }

    /**
     * Autentica um funcionário pelo email e senha.
     * @param {Object} request - Objeto da requisição Express.js contendo email e senha.
     * @param {Object} response - Objeto da resposta Express.js.
     * @param {Function} next - Middleware de tratamento de erros.
     * 
     * Retorna JSON com os dados do funcionário autenticado ou encaminha o erro.
     */
    login = async (request, response, next) => {
        const method = 'FuncionarioControl.login';
        const { email } = request.body.funcionario || {};
        logger.info(`🔵 ${method} - Tentativa de login`, {
            email,
            url: request.originalUrl,
            method: request.method,
            ip: request.ip,
        });

        try {
            const jsonFuncionario = request.body.funcionario;
            const resultado = await this.#funcionarioService.loginFuncionario(jsonFuncionario);

            logger.info(`✅ ${method} - Login bem-sucedido`, {
                email,
                idFuncionario: resultado?.user?.funcionario?.idFuncionario,
            });

            response.status(200).json({
                success: true,
                message: 'Login efetuado com sucesso!',
                data: resultado,
            });
        } catch (error) {
            logger.error(`❌ ${method} - Falha no login`, {
                email,
                error: error.message,
                stack: error.stack,
            });
            next(error);
        }
    };

    /**
     * Cria um novo funcionário.
     * @param {Object} request - Objeto da requisição Express.js com os dados do funcionário.
     * @param {Object} response - Objeto da resposta Express.js.
     * @param {Function} next - Middleware de tratamento de erros.
     * 
     * Retorna JSON com o ID do funcionário criado e mensagem de sucesso.
     */
    store = async (request, response, next) => {
        const method = 'FuncionarioControl.store';
        const { email, nomeFuncionario } = request.body.funcionario || {};
        logger.info(`🔵 ${method} - Criando novo funcionário`, {
            email,
            nomeFuncionario,
            url: request.originalUrl,
            method: request.method,
            ip: request.ip,
        });

        try {
            const jsonFuncionario = request.body.funcionario;
            const resultado = await this.#funcionarioService.createFuncionario(jsonFuncionario);

            logger.info(`✅ ${method} - Funcionário criado com sucesso`, {
                idFuncionario: resultado?.idFuncionario,
                email: resultado?.email,
            });

            response.status(200).json({
                success: true,
                message: 'Cadastro realizado com sucesso',
                data: { funcionario: resultado },
            });
        } catch (error) {
            logger.error(`❌ ${method} - Erro ao criar funcionário`, {
                email,
                error: error.message,
                stack: error.stack,
                body: request.body,
            });
            next(error);
        }
    };

    /**
     * Lista todos os funcionários cadastrados.
     * @param {Object} request - Objeto da requisição Express.js.
     * @param {Object} response - Objeto da resposta Express.js.
     * @param {Function} next - Middleware de tratamento de erros.
     * 
     * Retorna JSON com array de funcionários.
     */
    index = async (request, response, next) => {
        const method = 'FuncionarioControl.index';
        logger.info(`🔵 ${method} - Listando todos os funcionários`, {
            url: request.originalUrl,
            method: request.method,
        });

        try {
            const listaFuncionarios = await this.#funcionarioService.findAll();

            logger.info(`✅ ${method} - ${listaFuncionarios?.length || 0} funcionários encontrados`);

            response.status(200).json({
                success: true,
                message: 'Executado com sucesso',
                data: { funcionarios: listaFuncionarios },
            });
        } catch (error) {
            logger.error(`❌ ${method} - Erro ao listar funcionários`, {
                error: error.message,
                stack: error.stack,
            });
            next(error);
        }
    };

    /**
     * Busca um funcionário pelo ID.
     * @param {Object} request - Objeto da requisição Express.js.
     * @param {Object} response - Objeto da resposta Express.js.
     * @param {Function} next - Middleware de tratamento de erros.
     * 
     * Retorna JSON com os dados do funcionário encontrado.
     */
    show = async (request, response, next) => {
        const method = 'FuncionarioControl.show';
        const { idFuncionario } = request.params;
        logger.info(`🔵 ${method} - Buscando funcionário por ID`, {
            idFuncionario,
            url: request.originalUrl,
            method: request.method,
        });

        try {
            const funcionario = await this.#funcionarioService.findById(idFuncionario);

            logger.info(`✅ ${method} - Funcionário encontrado`, { idFuncionario });

            response.status(200).json({
                success: true,
                message: 'Executado com sucesso',
                data: funcionario,
            });
        } catch (error) {
            logger.error(`❌ ${method} - Erro ao buscar funcionário ${idFuncionario}`, {
                idFuncionario,
                error: error.message,
                stack: error.stack,
            });
            next(error);
        }
    };

    /**
     * Atualiza os dados de um funcionário existente.
     * @param {Object} request - Objeto da requisição Express.js com os dados atualizados.
     * @param {Object} response - Objeto da resposta Express.js.
     * @param {Function} next - Middleware de tratamento de erros.
     * 
     * Retorna JSON com os dados atualizados do funcionário ou encaminha o erro.
     */
    update = async (request, response, next) => {
        const method = 'FuncionarioControl.update';
        const { idFuncionario } = request.params;
        const { nomeFuncionario, email } = request.body.funcionario || {};
        logger.info(`🔵 ${method} - Atualizando funcionário`, {
            idFuncionario,
            nomeFuncionario,
            email,
            url: request.originalUrl,
            method: request.method,
            ip: request.ip,
        });

        try {
            const funcionarioAtualizado = await this.#funcionarioService.updateFuncionario(idFuncionario, request.body);

            logger.info(`✅ ${method} - Funcionário ${idFuncionario} atualizado com sucesso`);

            response.status(200).json({
                success: true,
                message: 'Atualizado com sucesso',
                data: {
                    funcionario: {
                        idFuncionario: parseInt(request.params.idFuncionario, 10),
                        nomeFuncionario: request.body.funcionario.nomeFuncionario,
                    },
                },
            });
        } catch (error) {
            logger.error(`❌ ${method} - Erro ao atualizar funcionário ${idFuncionario}`, {
                idFuncionario,
                error: error.message,
                stack: error.stack,
                body: request.body,
            });
            next(error);
        }
    };

    /**
     * Remove um funcionário pelo ID.
     * @param {Object} request - Objeto da requisição Express.js.
     * @param {Object} response - Objeto da resposta Express.js.
     * @param {Function} next - Middleware de tratamento de erros.
     * 
     * Retorna status 204 se excluído com sucesso ou 404 se o funcionário não existir.
     */
    destroy = async (request, response, next) => {
        const method = 'FuncionarioControl.destroy';
        const { idFuncionario } = request.params;
        logger.info(`🔵 ${method} - Excluindo funcionário`, {
            idFuncionario,
            url: request.originalUrl,
            method: request.method,
            ip: request.ip,
        });

        try {
            const excluiu = await this.#funcionarioService.deleteFuncionario(idFuncionario);

            if (!excluiu) {
                logger.warn(`⚠️ ${method} - Funcionário ${idFuncionario} não encontrado para exclusão`);
                return response.status(404).json({
                    success: false,
                    message: 'Funcionário não encontrado',
                    error: { message: `Não existe funcionário com id ${idFuncionario}` },
                });
            }

            logger.info(`✅ ${method} - Funcionário ${idFuncionario} excluído com sucesso`);
            response.status(204).json({
                success: true,
                message: 'Excluído com sucesso',
            });
        } catch (error) {
            logger.error(`❌ ${method} - Erro ao excluir funcionário ${idFuncionario}`, {
                idFuncionario,
                error: error.message,
                stack: error.stack,
            });
            next(error);
        }
    };
};