const Professor = require("../models/Professor");
const MeuTokenJWT = require("../http/MeuTokenJWT");
const ErrorResponse = require("../utils/ErrorResponse");

module.exports = class ProfessorService {
    #professorDAO;

    constructor(professorDAO) {
        this.#professorDAO = professorDAO;
    }

    createProfessor = async data => {
        const professor = this.#criarModelo(data, true);
        const existentes = await this.#professorDAO.findByField("email", professor.email);
        if (existentes.length) {
            throw new ErrorResponse(400, "E-mail já cadastrado", {
                message: `O e-mail ${professor.email} já está em uso.`,
            });
        }

        professor.id = await this.#professorDAO.create(professor);
        return professor.toJSON();
    };

    loginProfessor = async data => {
        if (!data) throw new ErrorResponse(400, "Dados de login obrigatórios");

        let professorLogin;
        try {
            professorLogin = new Professor();
            professorLogin.email = data.email;
            professorLogin.senha = data.senha;
        } catch (error) {
            throw new ErrorResponse(400, "Dados de login inválidos", { message: error.message });
        }

        const encontrado = await this.#professorDAO.login(
            professorLogin.email,
            professorLogin.senha
        );
        if (!encontrado) {
            throw new ErrorResponse(401, "E-mail ou senha inválidos", {
                message: "Não foi possível realizar o login.",
            });
        }

        const token = new MeuTokenJWT().gerarToken({
            email: encontrado.email,
            role: encontrado.role,
            name: encontrado.nome,
            idFuncionario: encontrado.id,
        });

        return { professor: encontrado, token };
    };

    findAll = async () => this.#professorDAO.findAll();

    findById = async idProfessor => {
        const professor = await this.#professorDAO.findById(idProfessor);
        if (!professor) {
            throw new ErrorResponse(404, "Professor não encontrado", {
                message: `Não existe professor com id ${idProfessor}.`,
            });
        }
        return professor;
    };

    updateProfessor = async (idProfessor, requestBody) => {
        const data = requestBody.professor || requestBody.Professor || requestBody;
        const atual = await this.findById(idProfessor);
        const professor = this.#criarModelo({
            nome: data.nome ?? atual.nome,
            email: data.email ?? atual.email,
            senha: data.senha,
            role: data.role ?? atual.role,
        }, false);
        professor.id = idProfessor;

        const mesmoEmail = await this.#professorDAO.findByField("email", professor.email);
        if (mesmoEmail.some(item => item.id !== idProfessor)) {
            throw new ErrorResponse(400, "E-mail já cadastrado", {
                message: `O e-mail ${professor.email} já está em uso.`,
            });
        }

        const atualizado = await this.#professorDAO.update(professor);
        return atualizado ? this.#professorDAO.findById(idProfessor) : null;
    };

    deleteProfessor = async idProfessor => {
        const professor = new Professor();
        professor.id = idProfessor;
        return this.#professorDAO.delete(professor);
    };

    #criarModelo(data, senhaObrigatoria) {
        if (!data || typeof data !== "object") {
            throw new ErrorResponse(400, "Dados do professor obrigatórios");
        }

        try {
            const professor = new Professor();
            professor.nome = data.nome;
            professor.email = data.email;
            professor.role = data.role || "AVALIADOR";
            if (senhaObrigatoria || data.senha) professor.senha = data.senha;
            return professor;
        } catch (error) {
            throw new ErrorResponse(400, "Dados do professor inválidos", {
                message: error.message,
            });
        }
    }
};
