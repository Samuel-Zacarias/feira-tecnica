const logger = require('../utils/Logger');

module.exports = class ProjetoController {
    #projetoService;

    constructor(projetoServiceDependency) {
        logger.info('⬆️ ProjetoController.constructor()');
        this.#projetoService = projetoServiceDependency;
    }

    store = async (request, response, next) => {
        const method = 'ProjetoController.store';
        try {
            const projeto = await this.#projetoService.createProjeto(request.body.projeto);
            response.status(201).json({
                success: true,
                message: 'Projeto cadastrado com sucesso',
                data: { projeto },
            });
        } catch (error) {
            logger.error(`❌ ${method} - Erro ao cadastrar projeto`, { error: error.message });
            next(error);
        }
    };

    index = async (request, response, next) => {
        const method = 'ProjetoController.index';
        try {
            const projetos = await this.#projetoService.findAll();
            response.status(200).json({
                success: true,
                message: 'Busca realizada com sucesso',
                data: { projetos },
            });
        } catch (error) {
            logger.error(`❌ ${method} - Erro ao listar projetos`, { error: error.message });
            next(error);
        }
    };

    show = async (request, response, next) => {
        const method = 'ProjetoController.show';
        try {
            const projeto = await this.#projetoService.findById(request.params.idProjeto);
            response.status(200).json({
                success: true,
                message: 'Projeto encontrado com sucesso',
                data: { projeto },
            });
        } catch (error) {
            logger.error(`❌ ${method} - Erro ao buscar projeto`, { error: error.message });
            next(error);
        }
    };

    showPublic = async (request, response, next) => {
        const method = 'ProjetoController.showPublic';
        try {
            const projeto = await this.#projetoService.findById(request.params.idProjeto);
            const formatarProfessor = Professor => Professor ? {
                nome: Professor.nome,
                turma: Professor.turma,
                curso: Professor.curso,
            } : null;
            const projetoPublico = {
                id: projeto.id,
                titulo: projeto.titulo,
                descricao: projeto.descricao,
                lider: formatarProfessor(projeto.lider),
                Professors: (projeto.Professors || []).map(formatarProfessor),
                precisaComputador: projeto.precisaComputador,
                observacoes: projeto.observacoes,
                outrosRecursos: projeto.outrosRecursos,
            };
            response.status(200).json({
                success: true,
                message: 'Projeto encontrado com sucesso',
                data: { projeto: projetoPublico },
            });
        } catch (error) {
            logger.error(`❌ ${method} - Erro ao buscar projeto público`, { error: error.message });
            next(error);
        }
    };

    update = async (request, response, next) => {
        const method = 'ProjetoController.update';
        try {
            const atualizado = await this.#projetoService.updateProjeto(
                request.params.idProjeto,
                request.body
            );
            response.status(200).json({
                success: true,
                message: atualizado ? 'Projeto atualizado com sucesso' : 'Projeto não alterado',
                data: { atualizado },
            });
        } catch (error) {
            logger.error(`❌ ${method} - Erro ao atualizar projeto`, { error: error.message });
            next(error);
        }
    };

    destroy = async (request, response, next) => {
        const method = 'ProjetoController.destroy';
        try {
            const excluido = await this.#projetoService.deleteProjeto(request.params.idProjeto);
            if (!excluido) {
                return response.status(404).json({
                    success: false,
                    message: 'Projeto não encontrado',
                    error: { message: 'Não foi possível excluir o projeto' },
                });
            }
            response.status(200).json({
                success: true,
                message: 'Projeto excluído com sucesso',
                data: null,
            });
        } catch (error) {
            logger.error(`❌ ${method} - Erro ao excluir projeto`, { error: error.message });
            next(error);
        }
    };
};
