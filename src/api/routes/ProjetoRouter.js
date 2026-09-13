const express = require("express");
const logger = require("../utils/Logger");

module.exports = class ProjetoRouter {
    #router;
    #jwtMiddleware;
    #projetoMiddleware;
    #projetoController;

    constructor(
        jwtMiddlewareDependency,
        projetoMiddlewareDependency,
        projetoControllerDependency
    ) {
        logger.info("⬆️ ProjetoRouter.constructor()");

        this.#router = express.Router();

        this.#jwtMiddleware =
            jwtMiddlewareDependency;

        this.#projetoMiddleware =
            projetoMiddlewareDependency;

        this.#projetoController =
            projetoControllerDependency;
    }

    createRoutes = () => {
        const method =
            "ProjetoRouter.createRoutes";

        /*
         * Rota pública:
         * será aberta quando o visitante escanear
         * o QR Code.
         */
        this.#router.get(
            "/publico/:idProjeto",
            this.#projetoMiddleware.validateIdParam,
            this.#projetoController.showPublic
        );

        

        this.#router.get(
            "/buscar-aluno",
            this.#projetoController.buscarPorNomeAluno
        );

        this.#router.get(
            "/buscar-matricula",
            this.#projetoController.buscarPorMatricula
        );


        // Cadastrar projeto.
        this.#router.post(
            "/",
            //this.#jwtMiddleware.validateToken,
            this.#projetoMiddleware.validateBody,
            this.#projetoController.store
        );

        // Listar todos os projetos.
        this.#router.get(
            "/",
            this.#jwtMiddleware.validateToken,
            this.#projetoController.index
        );

        // Buscar projeto pelo ID.
        this.#router.get(
            "/:idProjeto",
            this.#jwtMiddleware.validateToken,
            this.#projetoMiddleware.validateIdParam,
            this.#projetoController.show
        );

        // Atualizar projeto.
        this.#router.put(
            "/:idProjeto",
            this.#jwtMiddleware.validateToken,
            this.#projetoMiddleware.validateIdParam,
            this.#projetoMiddleware.validateBody,
            this.#projetoController.update
        );

        // Excluir projeto.
        this.#router.delete(
            "/:idProjeto",
            this.#jwtMiddleware.validateToken,
            this.#projetoMiddleware.validateIdParam,
            this.#projetoController.destroy
        );

        logger.info(
            `✅ ${method} - Rotas configuradas`,
            {
                basePath:
                    "/api/v1/projetos",

                publicRoutes: [
                    "GET /publico/:idProjeto",
                    "GET /buscar-aluno"
                ],

                protectedRoutes: [
                    "POST /",
                    "GET /",
                    "GET /:idProjeto",
                    "PUT /:idProjeto",
                    "DELETE /:idProjeto"
                ]
            }
        );

        return this.#router;
    };
};