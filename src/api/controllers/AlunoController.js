const logger = require('../utils/Logger');

module.exports = class AlunoController {
    #alunoService;

    constructor(alunoServiceDependency) {
        logger.info('⬆️ AlunoController.constructor()');
        this.#alunoService = alunoServiceDependency;
    }

    store = async (request, response, next) => {
        const method = 'AlunoController.store';
        try {
            const aluno = await this.#alunoService.createAluno(request.body.aluno);
            response.status(201).json({
                success: true,
                message: 'Aluno cadastrado com sucesso',
                data: { aluno },
            });
        } catch (error) {
            logger.error(`❌ ${method} - Erro ao cadastrar aluno`, { error: error.message });
            next(error);
        }
    };

    index = async (request, response, next) => {
        const method = 'AlunoController.index';
        try {
            const alunos = await this.#alunoService.findAll();
            response.status(200).json({
                success: true,
                message: 'Busca realizada com sucesso',
                data: { alunos },
            });
        } catch (error) {
            logger.error(`❌ ${method} - Erro ao listar alunos`, { error: error.message });
            next(error);
        }
    };

    show = async (request, response, next) => {
        const method = 'AlunoController.show';
        try {
            const aluno = await this.#alunoService.findById(request.params.idAluno);
            response.status(200).json({
                success: true,
                message: 'Aluno encontrado com sucesso',
                data: { aluno },
            });
        } catch (error) {
            logger.error(`❌ ${method} - Erro ao buscar aluno`, { error: error.message });
            next(error);
        }
    };

    update = async (request, response, next) => {
        const method = 'AlunoController.update';
        try {
            const atualizado = await this.#alunoService.updateAluno(
                request.params.idAluno,
                request.body
            );
            response.status(200).json({
                success: true,
                message: atualizado ? 'Aluno atualizado com sucesso' : 'Aluno não alterado',
                data: { atualizado },
            });
        } catch (error) {
            logger.error(`❌ ${method} - Erro ao atualizar aluno`, { error: error.message });
            next(error);
        }
    };

    destroy = async (request, response, next) => {
        const method = 'AlunoController.destroy';
        try {
            const excluido = await this.#alunoService.deleteAluno(request.params.idAluno);
            if (!excluido) {
                return response.status(404).json({
                    success: false,
                    message: 'Aluno não encontrado',
                    error: { message: 'Não foi possível excluir o aluno' },
                });
            }
            response.status(200).json({
                success: true,
                message: 'Aluno excluído com sucesso',
                data: null,
            });
        } catch (error) {
            logger.error(`❌ ${method} - Erro ao excluir aluno`, { error: error.message });
            next(error);
        }
    };
};
