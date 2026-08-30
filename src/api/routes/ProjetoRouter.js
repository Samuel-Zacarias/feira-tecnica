const express = require('express');
const logger = require('../utils/Logger');

module.exports = class ProjetoRouter {
    #router;
    #jwtMiddleware;
    #projetoMiddleware;
    #projetoController;

    constructor(jwtMiddlewareDependency, projetoMiddlewareDependency, projetoControllerDependency) {
        logger.info('⬆️ ProjetoRouter.constructor()');
        this.#router = express.Router();
        this.#jwtMiddleware = jwtMiddlewareDependency;
        this.#projetoMiddleware = projetoMiddlewareDependency;
        this.#projetoController = projetoControllerDependency;
    }

    createRoutes = () => {
        const method = 'ProjetoRouter.createRoutes';
        logger.info(`⬆️ ${method} - Configurando rotas de Projeto`);

        // Pública: alunos cadastram o grupo.
        this.#router.post('/',
            this.#projetoMiddleware.validateBody,
            this.#projetoController.store
        );

        // Pública: página aberta pelo QR Code, sem dados pessoais sensíveis.
        this.#router.get('/publico/:idProjeto',
            this.#projetoMiddleware.validateIdParam,
            this.#projetoController.showPublic
        );

        // Protegidas: administração por professores/administradores.
        this.#router.get('/',
            this.#jwtMiddleware.validateToken,
            this.#projetoController.index
        );
        this.#router.get('/:idProjeto',
            this.#jwtMiddleware.validateToken,
            this.#projetoMiddleware.validateIdParam,
            this.#projetoController.show
        );
        this.#router.put('/:idProjeto',
            this.#jwtMiddleware.validateToken,
            this.#projetoMiddleware.validateIdParam,
            this.#projetoMiddleware.validateBody,
            this.#projetoController.update
        );
        this.#router.delete('/:idProjeto',
            this.#jwtMiddleware.validateToken,
            this.#projetoMiddleware.validateIdParam,
            this.#projetoController.destroy
        );

        logger.info(`✅ ${method} - Rotas de Projeto configuradas`, {
            basePath: '/api/v1/projetos',
            publicRoutes: ['POST /', 'GET /publico/:idProjeto'],
            protectedRoutes: ['GET /', 'GET /:idProjeto', 'PUT /:idProjeto', 'DELETE /:idProjeto'],
            totalRoutes: 6,
        });
        return this.#router;
    };
};
