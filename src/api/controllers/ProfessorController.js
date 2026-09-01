const logger = require("../utils/Logger");

module.exports = class ProfessorController {
    #professorService;

    constructor(professorServiceDependency) {
        logger.info(
            "⬆️ ProfessorController.constructor()"
        );

        this.#professorService =
            professorServiceDependency;
    }

    login = async (
        request,
        response,
        next
    ) => {
        try {
            const dados =
                request.body.professor ||
                request.body.Professor;

            const resultado =
                await this.#professorService
                    .loginProfessor(dados);

            response.status(200).json({
                success: true,
                message:
                    "Login realizado com sucesso",
                data: resultado
            });
        } catch (error) {
            next(error);
        }
    };

    store = async (
        request,
        response,
        next
    ) => {
        try {
            const dados =
                request.body.professor ||
                request.body.Professor;

            const professor =
                await this.#professorService
                    .createProfessor(dados);

            response.status(201).json({
                success: true,
                message:
                    "Professor cadastrado com sucesso",
                data: { professor }
            });
        } catch (error) {
            next(error);
        }
    };

    index = async (
        request,
        response,
        next
    ) => {
        try {
            const professores =
                await this.#professorService
                    .findAll();

            response.status(200).json({
                success: true,
                message:
                    "Professores encontrados com sucesso",
                data: { professores }
            });
        } catch (error) {
            next(error);
        }
    };

    show = async (
        request,
        response,
        next
    ) => {
        try {
            const professor =
                await this.#professorService.findById(
                    request.params.idProfessor
                );

            response.status(200).json({
                success: true,
                message:
                    "Professor encontrado com sucesso",
                data: { professor }
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
            const professor =
                await this.#professorService
                    .updateProfessor(
                        request.params.idProfessor,
                        request.body
                    );

            response.status(200).json({
                success: true,
                message:
                    "Professor atualizado com sucesso",
                data: { professor }
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
                await this.#professorService
                    .deleteProfessor(
                        request.params.idProfessor
                    );

            if (!excluido) {
                return response
                    .status(404)
                    .json({
                        success: false,
                        message:
                            "Professor não encontrado"
                    });
            }

            response.status(200).json({
                success: true,
                message:
                    "Professor excluído com sucesso",
                data: null
            });
        } catch (error) {
            next(error);
        }
    };
};