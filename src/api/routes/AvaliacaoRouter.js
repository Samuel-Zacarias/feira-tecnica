const express = require('express');
const logger = require('../utils/Logger');

module.exports = class AvaliacaoRouter {
    #router;
    #jwtMiddleware;
    #avaliacaoMiddleware;
    #avaliacaoController;

    constructor(jwtMiddlewareDependency, avaliacaoMiddlewareDependency, avaliacaoControllerDependency) {
        logger.info('⬆️ AvaliacaoRouter.constructor()');
        this.#router = express.Router();
        this.#jwtMiddleware = jwtMiddlewareDependency;
        this.#avaliacaoMiddleware = avaliacaoMiddlewareDependency;
        this.#avaliacaoController = avaliacaoControllerDependency;
    }

    createRoutes = () => {
        const method = 'AvaliacaoRouter.createRoutes';
        logger.info(`⬆️ ${method} - Configurando rotas de Avaliação`);

        this.#router.post('/',
            this.#jwtMiddleware.validateToken,
            this.#avaliacaoMiddleware.validateBody,
            this.#avaliacaoController.store
        );
        this.#router.get('/',
            this.#jwtMiddleware.validateToken,
            this.#avaliacaoController.index
        );
        this.#router.get('/projeto/:idProjeto',
            this.#jwtMiddleware.validateToken,
            this.#avaliacaoMiddleware.validateProjetoIdParam,
            this.#avaliacaoController.indexByProjeto
        );
        this.#router.get('/:idAvaliacao',
            this.#jwtMiddleware.validateToken,
            this.#avaliacaoMiddleware.validateIdParam,
            this.#avaliacaoController.show
        );
        this.#router.put('/:idAvaliacao',
            this.#jwtMiddleware.validateToken,
            this.#avaliacaoMiddleware.validateIdParam,
            this.#avaliacaoMiddleware.validateBody,
            this.#avaliacaoController.update
        );
        this.#router.delete('/:idAvaliacao',
            this.#jwtMiddleware.validateToken,
            this.#avaliacaoMiddleware.validateIdParam,
            this.#avaliacaoController.destroy
        );

        logger.info(`✅ ${method} - Rotas de Avaliação configuradas`, {
            basePath: '/api/v1/avaliacoes',
            totalRoutes: 6,
        });
        return this.#router;
    };
};