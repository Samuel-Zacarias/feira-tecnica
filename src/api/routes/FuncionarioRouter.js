// src/api/routes/FuncionarioRouter.js
const express = require("express");
const CargoMiddleware = require("../middleware/CargoMiddleware");
const FuncionarioMiddleware = require("../middleware/FuncionarioMiddleware");
const FuncionarioController = require("../controllers/FuncionarioController");
const JwtMiddleware = require("../middleware/JwtMiddleware");
const logger = require("../utils/Logger");

/**
 * Classe responsável por configurar as rotas da entidade Funcionario.
 * 
 * Observações sobre injeção de dependência:
 * - O roteador não cria suas próprias instâncias de middlewares ou controladores.
 * - Ele recebe instâncias externas de JwtMiddleware, FuncionarioMiddleware e FuncionarioControle via construtor.
 * - Isso permite:
 *      - Testes unitários com mocks ou stubs;
 *      - Troca de implementações sem alterar o roteador;
 *      - Segue o princípio de inversão de dependência (SOLID).
 */
module.exports = class FuncionarioRoteador {
    // Atributos privados
    #router;
    #FuncionarioController;
    #funcionarioMiddleware;
    #jwtMiddleware;

    /**
     * Construtor da classe FuncionarioRoteador
     * 
     * Injeção de dependência:
     * @param {JwtMiddleware} jwtMiddleware - Middleware JWT externo injetado
     * @param {FuncionarioMiddleware} funcionarioMiddleware - Middleware de validação de Funcionario injetado
     * @param {FuncionarioController} FuncionarioController - Controlador de Funcionario injetado
     */
    constructor(jwtMiddleware, funcionarioMiddleware, FuncionarioController) {
        logger.info('⬆️ FuncionarioRoteador.constructor()');
        this.#router = express.Router();

        // Armazenando as instâncias injetadas
        this.#jwtMiddleware = jwtMiddleware;
        this.#funcionarioMiddleware = funcionarioMiddleware;
        this.#FuncionarioController = FuncionarioController;

        logger.debug('🔍 Dependências injetadas no FuncionarioRoteador', {
            hasJwtMiddleware: !!this.#jwtMiddleware,
            hasFuncionarioMiddleware: !!this.#funcionarioMiddleware,
            hasFuncionarioController: !!this.#FuncionarioController,
        });
    }

    /**
     * Configura as rotas da API REST para a entidade Funcionario.
     * 
     * Rotas configuradas:
     * POST "/login"                    -> Efetuar login do funcionário
     * POST "/"                          -> Criar um novo Funcionario (validação JWT + body)
     * PUT "/:idFuncionario"             -> Atualizar Funcionario por ID (validação JWT + id param + body)
     * DELETE "/:idFuncionario"          -> Deletar Funcionario por ID (validação JWT + id param)
     * GET "/"                           -> Listar todos os Funcionarios (validação JWT)
     * GET "/:idFuncionario"             -> Buscar Funcionario por ID (validação JWT + id param)
     * 
     * Todas as dependências (JWT, middleware de validação, controlador) são fornecidas externamente,
     * permitindo maior flexibilidade e testabilidade do código.
     * 
     * @returns {express.Router} Router configurado com todas as rotas de Funcionario
     */
    createRoutes = () => {
        const method = 'FuncionarioRoteador.createRoutes';
        logger.info(`⬆️ ${method} - Configurando rotas da entidade Funcionario`);

        // ROTA: POST[/funcionarios/login] - Login (NÃO requer autenticação JWT)
        this.#router.post("/login",
            this.#funcionarioMiddleware.validateLoginBody,
            this.#FuncionarioController.login
        );
        logger.debug(`✅ ${method} - Rota POST /login registrada (pública)`);

        // ROTA: POST[/funcionarios] - Criar funcionário
        this.#router.post("/",
            this.#jwtMiddleware.validateToken,
            this.#funcionarioMiddleware.validateCreateBody,
            this.#FuncionarioController.store
        );
        logger.debug(`✅ ${method} - Rota POST / registrada (protegida)`);

        // ROTA: PUT[/funcionarios/:idFuncionario] - Atualizar funcionário
        this.#router.put("/:idFuncionario",
            this.#jwtMiddleware.validateToken,
            this.#funcionarioMiddleware.validateIdParam,
            this.#funcionarioMiddleware.validateCreateBody,
            this.#FuncionarioController.update
        );
        logger.debug(`✅ ${method} - Rota PUT /:idFuncionario registrada (protegida)`);

        // ROTA: DELETE[/funcionarios/:idFuncionario] - Deletar funcionário
        this.#router.delete("/:idFuncionario",
            this.#jwtMiddleware.validateToken,
            this.#funcionarioMiddleware.validateIdParam,
            this.#FuncionarioController.destroy
        );
        logger.debug(`✅ ${method} - Rota DELETE /:idFuncionario registrada (protegida)`);

        // ROTA: GET[/funcionarios] - Listar todos os funcionários
        this.#router.get("/",
            this.#jwtMiddleware.validateToken,
            this.#FuncionarioController.index
        );
        logger.debug(`✅ ${method} - Rota GET / registrada (protegida)`);

        // ROTA: GET[/funcionarios/:idFuncionario] - Buscar funcionário por ID
        this.#router.get("/:idFuncionario",
            this.#jwtMiddleware.validateToken,
            this.#funcionarioMiddleware.validateIdParam,
            this.#FuncionarioController.show
        );
        logger.debug(`✅ ${method} - Rota GET /:idFuncionario registrada (protegida)`);

        logger.info(`✅ ${method} - Todas as rotas de Funcionario configuradas com sucesso`, {
            totalRoutes: 6,
            basePath: '/api/v1/funcionarios',
            publicRoutes: ['POST /login'],
            protectedRoutes: ['POST /', 'PUT /:idFuncionario', 'DELETE /:idFuncionario', 'GET /', 'GET /:idFuncionario'],
        });

        return this.#router;
    }
};