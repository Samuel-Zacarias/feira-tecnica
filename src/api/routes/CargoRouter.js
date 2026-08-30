// src/api/routes/CargoRouter.js
const express = require("express");
const JwtMiddleware = require("../middleware/JwtMiddleware");
const CargoMiddleware = require("../middleware/CargoMiddleware");
const CargoController = require("../controllers/CargoController");
const logger = require("../utils/Logger");

/**
 * Classe responsável por configurar as rotas da entidade Cargo.
 * 
 * Observações sobre injeção de dependência:
 * - O roteador não cria suas próprias instâncias de middlewares ou controladores.
 * - Ele recebe instâncias externas de JwtMiddleware, CargoMiddleware e CargoControle via construtor.
 * - Isso permite flexibilidade: 
 *      - Testes unitários podem injetar mocks ou stubs;
 *      - É possível trocar implementações sem alterar o roteador;
 *      - Segue o princípio de inversão de dependência (SOLID).
 */
module.exports = class CargoRoteador {
    // Atributos privados
    #router;
    #cargoMiddleware;
    #cargoControl;
    #jwtMiddleware;

    /**
     * Construtor da classe CargoRoteador
     * 
     * Injeção de dependência:
     * @param {JwtMiddleware} jwtMiddlewareDependency - Middleware JWT externo injetado
     * @param {CargoMiddleware} cargoMiddlewareDependency - Middleware de validação de Cargo injetado
     * @param {CargoController} cargoControllerDependency - Controlador de Cargo injetado
     */
    constructor(routerDependency, jwtMiddlewareDependency, cargoMiddlewareDependency, cargoControllerDependency) {
        logger.info('⬆️ CargoRoteador.constructor()');
        
        // Armazenando as instâncias injetadas
        this.#router = routerDependency;
        this.#jwtMiddleware = jwtMiddlewareDependency;
        this.#cargoMiddleware = cargoMiddlewareDependency;
        this.#cargoControl = cargoControllerDependency;

        logger.debug('🔍 Dependências injetadas no CargoRoteador', {
            hasJwtMiddleware: !!this.#jwtMiddleware,
            hasCargoMiddleware: !!this.#cargoMiddleware,
            hasCargoControl: !!this.#cargoControl,
        });
    }

    /**
     * Configura as rotas da API REST para a entidade Cargo.
     * 
     * Rotas configuradas:
     * POST "/"           -> Criar um novo Cargo (validação JWT + body)
     * GET "/"            -> Listar todos os Cargos (validação JWT)
     * GET "/:idCargo"    -> Buscar Cargo por ID (validação JWT + id param)
     * PUT "/:idCargo"    -> Atualizar Cargo por ID (validação JWT + id param + body)
     * DELETE "/:idCargo" -> Deletar Cargo por ID (validação JWT + id param)
     * 
     * Todas as dependências (JWT, middleware de validação, controlador) são fornecidas externamente,
     * permitindo maior flexibilidade e testabilidade do código.
     * 
     * @returns {express.Router} Router configurado com todas as rotas de Cargo
     */
    createRoutes = () => {
        const method = 'CargoRoteador.createRoutes';
        logger.info(`⬆️ ${method} - Configurando rotas da entidade Cargo`);

        // Rota: POST / - Criar cargo
        this.#router.post("/",
            this.#jwtMiddleware.validateToken,
            this.#cargoMiddleware.validateBody,
            this.#cargoControl.store
        );
        logger.debug(`✅ ${method} - Rota POST / registrada`);

        // Rota: GET / - Listar todos os cargos
        this.#router.get("/",
            this.#jwtMiddleware.validateToken,
            this.#cargoControl.index
        );
        logger.debug(`✅ ${method} - Rota GET / registrada`);

        // Rota: GET /:idCargo - Buscar cargo por ID
        this.#router.get("/:idCargo",
            this.#jwtMiddleware.validateToken,
            this.#cargoMiddleware.validateIdParam,
            this.#cargoControl.show
        );
        logger.debug(`✅ ${method} - Rota GET /:idCargo registrada`);

        // Rota: PUT /:idCargo - Atualizar cargo
        this.#router.put("/:idCargo",
            this.#jwtMiddleware.validateToken,
            this.#cargoMiddleware.validateIdParam,
            this.#cargoMiddleware.validateBody,
            this.#cargoControl.update
        );
        logger.debug(`✅ ${method} - Rota PUT /:idCargo registrada`);

        // Rota: DELETE /:idCargo - Deletar cargo
        this.#router.delete("/:idCargo",
            this.#jwtMiddleware.validateToken,
            this.#cargoMiddleware.validateIdParam,
            this.#cargoControl.destroy
        );
        logger.debug(`✅ ${method} - Rota DELETE /:idCargo registrada`);

        logger.info(`✅ ${method} - Todas as rotas de Cargo configuradas com sucesso`, {
            totalRoutes: 5,
            basePath: '/api/v1/cargos',
        });

        return this.#router;
    }
};