const express = require("express");
const logger = require("../utils/Logger");

module.exports = class ProfessorRouter {
    #router;
    #jwtMiddleware;
    #professorMiddleware;
    #professorController;

    constructor(
        jwtMiddlewareDependency,
        professorMiddlewareDependency,
        professorControllerDependency
    ) {
        logger.info(
            "⬆️ ProfessorRouter.constructor()"
        );

        this.#router = express.Router();

        this.#jwtMiddleware =
            jwtMiddlewareDependency;

        this.#professorMiddleware =
            professorMiddlewareDependency;

        this.#professorController =
            professorControllerDependency;
    }

    createRoutes = () => {
        const method =
            "ProfessorRouter.createRoutes";

        /*
         * Rota pública de login.
         * Não precisa de token.
         */
        this.#router.post(
            "/login",
            this.#professorMiddleware
                .validateLoginBody,
            this.#professorController.login
        );

        /*
         * Rotas protegidas.
         */

        // Cadastrar professor.
        this.#router.post(
            "/",
            this.#jwtMiddleware.validateToken,
            this.#professorMiddleware
                .validateCreateBody,
            this.#professorController.store
        );

        // Listar professores.
        this.#router.get(
            "/",
            this.#jwtMiddleware.validateToken,
            this.#professorController.index
        );

        // Buscar professor pelo ID.
        this.#router.get(
            "/:idProfessor",
            this.#jwtMiddleware.validateToken,
            this.#professorMiddleware
                .validateIdParam,
            this.#professorController.show
        );

        // Atualizar professor.
        this.#router.put(
            "/:idProfessor",
            this.#jwtMiddleware.validateToken,
            this.#professorMiddleware
                .validateIdParam,
            this.#professorMiddleware
                .validateUpdateBody,
            this.#professorController.update
        );

        // Excluir professor.
        this.#router.delete(
            "/:idProfessor",
            this.#jwtMiddleware.validateToken,
            this.#professorMiddleware
                .validateIdParam,
            this.#professorController.destroy
        );

        logger.info(
            `✅ ${method} - Rotas configuradas`,
            {
                basePath:
                    "/api/v1/professores",

                publicRoutes: [
                    "POST /login"
                ],

                protectedRoutes: [
                    "POST /",
                    "GET /",
                    "GET /:idProfessor",
                    "PUT /:idProfessor",
                    "DELETE /:idProfessor"
                ]
            }
        );

        return this.#router;
    };
};