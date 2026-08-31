const logger = require('../utils/Logger');

module.exports = class ProfessorController {
    #ProfessorService;

    constructor(ProfessorServiceDependency) {
        logger.info('⬆️ ProfessorController.constructor()');
        this.#ProfessorService = ProfessorServiceDependency;
    }

    store = async (request, response, next) => {
        const method = 'ProfessorController.store';
        try {
            const Professor = await this.#ProfessorService.createProfessor(request.body.Professor);
            response.status(201).json({
                success: true,
                message: 'Professor cadastrado com sucesso',
                data: { Professor },
            });
        } catch (error) {
            logger.error(`❌ ${method} - Erro ao cadastrar Professor`, { error: error.message });
            next(error);
        }
    };

    index = async (request, response, next) => {
        const method = 'ProfessorController.index';
        try {
            const Professors = await this.#ProfessorService.findAll();
            response.status(200).json({
                success: true,
                message: 'Busca realizada com sucesso',
                data: { Professors },
            });
        } catch (error) {
            logger.error(`❌ ${method} - Erro ao listar Professors`, { error: error.message });
            next(error);
        }
    };

    show = async (request, response, next) => {
        const method = 'ProfessorController.show';
        try {
            const Professor = await this.#ProfessorService.findById(request.params.idProfessor);
            response.status(200).json({
                success: true,
                message: 'Professor encontrado com sucesso',
                data: { Professor },
            });
        } catch (error) {
            logger.error(`❌ ${method} - Erro ao buscar Professor`, { error: error.message });
            next(error);
        }
    };

    update = async (request, response, next) => {
        const method = 'ProfessorController.update';
        try {
            const atualizado = await this.#ProfessorService.updateProfessor(
                request.params.idProfessor,
                request.body
            );
            response.status(200).json({
                success: true,
                message: atualizado ? 'Professor atualizado com sucesso' : 'Professor não alterado',
                data: { atualizado },
            });
        } catch (error) {
            logger.error(`❌ ${method} - Erro ao atualizar Professor`, { error: error.message });
            next(error);
        }
    };

    destroy = async (request, response, next) => {
        const method = 'ProfessorController.destroy';
        try {
            const excluido = await this.#ProfessorService.deleteProfessor(request.params.idProfessor);
            if (!excluido) {
                return response.status(404).json({
                    success: false,
                    message: 'Professor não encontrado',
                    error: { message: 'Não foi possível excluir o Professor' },
                });
            }
            response.status(200).json({
                success: true,
                message: 'Professor excluído com sucesso',
                data: null,
            });
        } catch (error) {
            logger.error(`❌ ${method} - Erro ao excluir Professor`, { error: error.message });
            next(error);
        }
    };
};
