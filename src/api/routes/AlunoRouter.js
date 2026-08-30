const express = require('express');
const logger = require('../utils/Logger');

module.exports = class AlunoRouter {
    #router;
    #jwtMiddleware;
    #alunoMiddleware;
    #alunoController;

    constructor(jwtMiddlewareDependency, alunoMiddlewareDependency, alunoControllerDependency) {
        logger.info('⬆️ AlunoRouter.constructor()');
        this.#router = express.Router();
        this.#jwtMiddleware = jwtMiddlewareDependency;
        this.#alunoMiddleware = alunoMiddlewareDependency;
        this.#alunoController = alunoControllerDependency;
    }

    createRoutes = () => {
        const method = 'AlunoRouter.createRoutes';
        logger.info(`⬆️ ${method} - Configurando rotas de Aluno`);

        this.#router.post('/',
            this.#jwtMiddleware.validateToken,
            this.#alunoMiddleware.validateBody,
            this.#alunoController.store
        );
        this.#router.get('/',
            this.#jwtMiddleware.validateToken,
            this.#alunoController.index
        );
        this.#router.get('/:idAluno',
            this.#jwtMiddleware.validateToken,
            this.#alunoMiddleware.validateIdParam,
            this.#alunoController.show
        );
        this.#router.put('/:idAluno',
            this.#jwtMiddleware.validateToken,
            this.#alunoMiddleware.validateIdParam,
            this.#alunoMiddleware.validateBody,
            this.#alunoController.update
        );
        this.#router.delete('/:idAluno',
            this.#jwtMiddleware.validateToken,
            this.#alunoMiddleware.validateIdParam,
            this.#alunoController.destroy
        );

        logger.info(`✅ ${method} - Rotas de Aluno configuradas`, {
            basePath: '/api/v1/alunos',
            totalRoutes: 5,
        });
        return this.#router;
    };
};
