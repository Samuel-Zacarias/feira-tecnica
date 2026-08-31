const express = require('express');
const logger = require('../utils/Logger');

module.exports = class ProfessorRouter {
    #router;
    #jwtMiddleware;
    #ProfessorMiddleware;
    #ProfessorController;

    constructor(jwtMiddlewareDependency, ProfessorMiddlewareDependency, ProfessorControllerDependency) {
        logger.info('⬆️ ProfessorRouter.constructor()');
        this.#router = express.Router();
        this.#jwtMiddleware = jwtMiddlewareDependency;
        this.#ProfessorMiddleware = ProfessorMiddlewareDependency;
        this.#ProfessorController = ProfessorControllerDependency;
    }

    createRoutes = () => {
        const method = 'ProfessorRouter.createRoutes';
        logger.info(`⬆️ ${method} - Configurando rotas de Professor`);

        this.#router.post('/',
            this.#jwtMiddleware.validateToken,
            this.#ProfessorMiddleware.validateBody,
            this.#ProfessorController.store
        );
        this.#router.get('/',
            this.#jwtMiddleware.validateToken,
            this.#ProfessorController.index
        );
        this.#router.get('/:idProfessor',
            this.#jwtMiddleware.validateToken,
            this.#ProfessorMiddleware.validateIdParam,
            this.#ProfessorController.show
        );
        this.#router.put('/:idProfessor',
            this.#jwtMiddleware.validateToken,
            this.#ProfessorMiddleware.validateIdParam,
            this.#ProfessorMiddleware.validateBody,
            this.#ProfessorController.update
        );
        this.#router.delete('/:idProfessor',
            this.#jwtMiddleware.validateToken,
            this.#ProfessorMiddleware.validateIdParam,
            this.#ProfessorController.destroy
        );

        logger.info(`✅ ${method} - Rotas de Professor configuradas`, {
            basePath: '/api/v1/Professors',
            totalRoutes: 5,
        });
        return this.#router;
    };
};
