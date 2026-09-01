const logger = require("../utils/Logger");

module.exports = class ProjetoController {
    #projetoService;

    constructor(projetoServiceDependency) {
        logger.info("⬆️ ProjetoController.constructor()");
        this.#projetoService = projetoServiceDependency;
    }

    store = async (request, response, next) => {
        try {
            const projeto =
                await this.#projetoService.createProjeto(
                    request.body.projeto
                );

            response.status(201).json({
                success: true,
                message: "Projeto cadastrado com sucesso",
                data: { projeto }
            });
        } catch (error) {
            logger.error(
                "❌ ProjetoController.store",
                {
                    error: error.message
                }
            );

            next(error);
        }
    };

    index = async (request, response, next) => {
        try {
            const projetos =
                await this.#projetoService.findAll();

            response.status(200).json({
                success: true,
                message:
                    "Projetos encontrados com sucesso",
                data: { projetos }
            });
        } catch (error) {
            next(error);
        }
    };

    show = async (request, response, next) => {
        try {
            const projeto =
                await this.#projetoService.findById(
                    request.params.idProjeto
                );

            response.status(200).json({
                success: true,
                message:
                    "Projeto encontrado com sucesso",
                data: { projeto }
            });
        } catch (error) {
            next(error);
        }
    };

    showPublic = async (
        request,
        response,
        next
    ) => {
        try {
            const projeto =
                await this.#projetoService.findById(
                    request.params.idProjeto
                );

            // Remove matrícula e e-mail da resposta pública.
            const projetoPublico = {
                id: projeto.id,
                tema: projeto.tema,
                curso: projeto.curso,

                representante: {
                    nome: projeto.representante.nome,
                    turma: projeto.representante.turma
                },

                integrantes:
                    projeto.integrantes.map(
                        integrante => ({
                            nome: integrante.nome,
                            turma: integrante.turma
                        })
                    ),

                equipamento: projeto.equipamento,
                outrosRecursos:
                    projeto.outrosRecursos,
                observacoes:
                    projeto.observacoes
            };

            response.status(200).json({
                success: true,
                message:
                    "Projeto encontrado com sucesso",
                data: {
                    projeto: projetoPublico
                }
            });
        } catch (error) {
            next(error);
        }
    };

    update = async (
        request,
        response,
        next
    ) => {
        try {
            const projeto =
                await this.#projetoService.updateProjeto(
                    request.params.idProjeto,
                    request.body
                );

            response.status(200).json({
                success: true,
                message:
                    "Projeto atualizado com sucesso",
                data: { projeto }
            });
        } catch (error) {
            next(error);
        }
    };

    destroy = async (
        request,
        response,
        next
    ) => {
        try {
            const excluido =
                await this.#projetoService.deleteProjeto(
                    request.params.idProjeto
                );

            if (!excluido) {
                return response.status(404).json({
                    success: false,
                    message:
                        "Projeto não encontrado"
                });
            }

            response.status(200).json({
                success: true,
                message:
                    "Projeto excluído com sucesso",
                data: null
            });
        } catch (error) {
            next(error);
        }
    };
};