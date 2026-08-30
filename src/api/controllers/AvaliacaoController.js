const logger = require('../utils/Logger');

module.exports = class AvaliacaoController {
    #avaliacaoService;

    constructor(avaliacaoServiceDependency) {
        logger.info('⬆️ AvaliacaoController.constructor()');
        this.#avaliacaoService = avaliacaoServiceDependency;
    }

    store = async (request, response, next) => {
        const method = 'AvaliacaoController.store';
        try {
            const avaliacao = await this.#avaliacaoService.createAvaliacao(request.body.avaliacao);
            response.status(201).json({
                success: true,
                message: 'Avaliação cadastrada com sucesso',
                data: { avaliacao },
            });
        } catch (error) {
            logger.error(`❌ ${method} - Erro ao cadastrar avaliação`, { error: error.message });
            next(error);
        }
    };

    index = async (request, response, next) => {
        const method = 'AvaliacaoController.index';
        try {
            const avaliacoes = await this.#avaliacaoService.findAll();
            response.status(200).json({
                success: true,
                message: 'Busca realizada com sucesso',
                data: { avaliacoes },
            });
        } catch (error) {
            logger.error(`❌ ${method} - Erro ao listar avaliações`, { error: error.message });
            next(error);
        }
    };

    indexByProjeto = async (request, response, next) => {
        const method = 'AvaliacaoController.indexByProjeto';
        try {
            const avaliacoes = await this.#avaliacaoService.findByProjeto(request.params.idProjeto);
            response.status(200).json({
                success: true,
                message: 'Avaliações do projeto encontradas',
                data: { avaliacoes },
            });
        } catch (error) {
            logger.error(`❌ ${method} - Erro ao buscar avaliações do projeto`, { error: error.message });
            next(error);
        }
    };

    show = async (request, response, next) => {
        const method = 'AvaliacaoController.show';
        try {
            const avaliacao = await this.#avaliacaoService.findById(request.params.idAvaliacao);
            response.status(200).json({
                success: true,
                message: 'Avaliação encontrada com sucesso',
                data: { avaliacao },
            });
        } catch (error) {
            logger.error(`❌ ${method} - Erro ao buscar avaliação`, { error: error.message });
            next(error);
        }
    };

    update = async (request, response, next) => {
        const method = 'AvaliacaoController.update';
        try {
            const atualizada = await this.#avaliacaoService.updateAvaliacao(
                request.params.idAvaliacao,
                request.body
            );
            response.status(200).json({
                success: true,
                message: atualizada ? 'Avaliação atualizada com sucesso' : 'Avaliação não alterada',
                data: { atualizada },
            });
        } catch (error) {
            logger.error(`❌ ${method} - Erro ao atualizar avaliação`, { error: error.message });
            next(error);
        }
    };

    destroy = async (request, response, next) => {
        const method = 'AvaliacaoController.destroy';
        try {
            const excluida = await this.#avaliacaoService.deleteAvaliacao(request.params.idAvaliacao);
            if (!excluida) {
                return response.status(404).json({
                    success: false,
                    message: 'Avaliação não encontrada',
                    error: { message: 'Não foi possível excluir a avaliação' },
                });
            }
            response.status(200).json({
                success: true,
                message: 'Avaliação excluída com sucesso',
                data: null,
            });
        } catch (error) {
            logger.error(`❌ ${method} - Erro ao excluir avaliação`, { error: error.message });
            next(error);
        }
    };
};
