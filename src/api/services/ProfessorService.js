const Professor = require("../models/Professor");
const MeuTokenJWT = require("../http/MeuTokenJWT");
const ErrorResponse = require("../utils/ErrorResponse");
const logger = require("../utils/Logger");

module.exports = class ProfessorService {
    #professorDAO;

    constructor(professorDAODependency) {
        logger.info(
            "⬆️ ProfessorService.constructor()"
        );

        this.#professorDAO =
            professorDAODependency;
    }

    createProfessor = async (
        jsonProfessor
    ) => {
        const professor = this.#criarModelo(
            jsonProfessor,
            true
        );

        const existentes =
            await this.#professorDAO.findByField(
                "email",
                professor.email
            );

        if (existentes.length > 0) {
            throw new ErrorResponse(
                400,
                "E-mail já cadastrado",
                {
                    message:
                        `O e-mail ${professor.email} já está em uso.`
                }
            );
        }

        professor.id =
            await this.#professorDAO.create(
                professor
            );

        return professor.toJSON();
    };

    loginProfessor = async (
        jsonProfessor
    ) => {
        if (!jsonProfessor) {
            throw new ErrorResponse(
                400,
                "Dados de login obrigatórios"
            );
        }

        const professorLogin =
            new Professor();

        professorLogin.email =
            jsonProfessor.email;

        professorLogin.senha =
            jsonProfessor.senha;

        const encontrado =
            await this.#professorDAO.login(
                professorLogin.email,
                professorLogin.senha
            );

        if (!encontrado) {
            throw new ErrorResponse(
                401,
                "E-mail ou senha inválidos",
                {
                    message:
                        "Não foi possível realizar o login."
                }
            );
        }

        const jwt = new MeuTokenJWT();

        const token = jwt.gerarToken({
            email: encontrado.email,
            role: encontrado.role,
            name: encontrado.nome,

            // Será ajustado depois para idProfessor.
            idFuncionario: encontrado.id
        });

        return {
            professor: encontrado,
            token
        };
    };

    findAll = async () => {
        return await this.#professorDAO.findAll();
    };

    findById = async (idProfessor) => {
        const professor =
            await this.#professorDAO.findById(
                idProfessor
            );

        if (!professor) {
            throw new ErrorResponse(
                404,
                "Professor não encontrado",
                {
                    message:
                        `Não existe professor com id ${idProfessor}.`
                }
            );
        }

        return professor;
    };

    updateProfessor = async (
        idProfessor,
        requestBody
    ) => {
        const jsonProfessor =
            requestBody.professor ||
            requestBody.Professor ||
            requestBody;

        const atual =
            await this.findById(idProfessor);

        const professor =
            this.#criarModelo(
                {
                    nome:
                        jsonProfessor.nome ??
                        atual.nome,

                    email:
                        jsonProfessor.email ??
                        atual.email,

                    senha:
                        jsonProfessor.senha,

                    role:
                        jsonProfessor.role ??
                        atual.role
                },
                false
            );

        professor.id = idProfessor;

        const mesmoEmail =
            await this.#professorDAO.findByField(
                "email",
                professor.email
            );

        const duplicado =
            mesmoEmail.some(
                item =>
                    item.id !== idProfessor
            );

        if (duplicado) {
            throw new ErrorResponse(
                400,
                "E-mail já cadastrado",
                {
                    message:
                        `O e-mail ${professor.email} já está em uso.`
                }
            );
        }

        const atualizado =
            await this.#professorDAO.update(
                professor
            );

        return atualizado
            ? await this.#professorDAO.findById(
                idProfessor
            )
            : null;
    };

    deleteProfessor = async (
        idProfessor
    ) => {
        const professor = new Professor();
        professor.id = idProfessor;

        return await this.#professorDAO.delete(
            professor
        );
    };

    #criarModelo(
        jsonProfessor,
        senhaObrigatoria
    ) {
        if (
            !jsonProfessor ||
            typeof jsonProfessor !== "object"
        ) {
            throw new ErrorResponse(
                400,
                "Dados do professor obrigatórios"
            );
        }

        const professor = new Professor();

        professor.nome =
            jsonProfessor.nome;

        professor.email =
            jsonProfessor.email;

        professor.role =
            jsonProfessor.role ||
            "AVALIADOR";

        if (
            senhaObrigatoria ||
            jsonProfessor.senha
        ) {
            professor.senha =
                jsonProfessor.senha;
        }

        return professor;
    }
};