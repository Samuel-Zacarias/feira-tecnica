const AlunoDAO = require('../dao/AlunoDAOMongo');
const Aluno = require('../models/Aluno');
const ErrorResponse = require('../utils/ErrorResponse');
const logger = require('../utils/Logger');

module.exports = class AlunoService {
    #alunoDAO;

    /**
     * @param {AlunoDAO} alunoDAODependency - Instância de AlunoDAOMongo
     */
    constructor(alunoDAODependency) {
        logger.info('⬆️ AlunoService.constructor()');
        this.#alunoDAO = alunoDAODependency;
        logger.debug('🔍 Dependência injetada no AlunoService', {
            hasAlunoDAO: !!this.#alunoDAO,
        });
    }

    createAluno = async (jsonAluno) => {
        const method = 'AlunoService.createAluno';
        logger.debug(`🟣 ${method} - Iniciando criação de aluno`, {
            matricula: jsonAluno?.matricula,
            nome: jsonAluno?.nome,
        });

        try {
            const aluno = this.#createModel(jsonAluno);
            const matriculaExiste = await this.#alunoDAO.findByField('matricula', aluno.matricula);

            if (matriculaExiste.length > 0) {
                throw new ErrorResponse(400, 'Aluno já cadastrado', {
                    message: `A matrícula ${aluno.matricula} já está cadastrada`,
                });
            }

            aluno.id = await this.#alunoDAO.create(aluno);
            logger.info(`✅ ${method} - Aluno criado com sucesso`, {
                idAluno: aluno.id,
                matricula: aluno.matricula,
            });
            return this.#modelToObject(aluno);
        } catch (error) {
            logger.error(`❌ ${method} - Erro ao criar aluno`, {
                matricula: jsonAluno?.matricula,
                error: error.message,
                stack: error.stack,
            });
            throw error;
        }
    };

    findAll = async () => {
        const method = 'AlunoService.findAll';
        logger.debug(`🟣 ${method} - Buscando todos os alunos`);

        try {
            return await this.#alunoDAO.findAll();
        } catch (error) {
            logger.error(`❌ ${method} - Erro ao buscar alunos`, {
                error: error.message,
                stack: error.stack,
            });
            throw error;
        }
    };

    findById = async (idAluno) => {
        const method = 'AlunoService.findById';
        logger.debug(`🟣 ${method} - Buscando aluno por ID`, { idAluno });

        try {
            const aluno = await this.#alunoDAO.findById(idAluno);
            if (!aluno) {
                throw new ErrorResponse(404, 'Aluno não encontrado', {
                    message: `Não existe aluno com id ${idAluno}`,
                });
            }
            return aluno;
        } catch (error) {
            logger.error(`❌ ${method} - Erro ao buscar aluno`, {
                idAluno,
                error: error.message,
                stack: error.stack,
            });
            throw error;
        }
    };

    updateAluno = async (idAluno, requestBody) => {
        const method = 'AlunoService.updateAluno';
        const jsonAluno = requestBody.aluno || requestBody;
        logger.debug(`🟣 ${method} - Atualizando aluno`, { idAluno });

        try {
            const aluno = this.#createModel(jsonAluno);
            aluno.id = idAluno;

            const matriculasIguais = await this.#alunoDAO.findByField('matricula', aluno.matricula);
            const duplicado = matriculasIguais.some(item => item.id !== aluno.id);
            if (duplicado) {
                throw new ErrorResponse(400, 'Matrícula já cadastrada', {
                    message: `A matrícula ${aluno.matricula} pertence a outro aluno`,
                });
            }

            return await this.#alunoDAO.update(aluno);
        } catch (error) {
            logger.error(`❌ ${method} - Erro ao atualizar aluno`, {
                idAluno,
                error: error.message,
                stack: error.stack,
            });
            throw error;
        }
    };

    deleteAluno = async (idAluno) => {
        const method = 'AlunoService.deleteAluno';
        logger.debug(`🟣 ${method} - Excluindo aluno`, { idAluno });

        try {
            const aluno = new Aluno();
            aluno.id = idAluno;
            return await this.#alunoDAO.delete(aluno);
        } catch (error) {
            logger.error(`❌ ${method} - Erro ao excluir aluno`, {
                idAluno,
                error: error.message,
                stack: error.stack,
            });
            throw error;
        }
    };

    #createModel(jsonAluno) {
        const aluno = new Aluno();
        aluno.matricula = jsonAluno.matricula;
        aluno.nome = jsonAluno.nome;
        aluno.turma = jsonAluno.turma;

        if (jsonAluno.email !== undefined && jsonAluno.email !== null && jsonAluno.email !== '') {
            const email = jsonAluno.email.trim().toLowerCase();
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) throw new Error('email está em formato inválido.');
            aluno.email = email;
        }
        if (jsonAluno.nascimento !== undefined && jsonAluno.nascimento !== null && jsonAluno.nascimento !== '') {
            aluno.nascimento = jsonAluno.nascimento;
        }
        if (jsonAluno.cpf !== undefined && jsonAluno.cpf !== null && jsonAluno.cpf !== '') {
            aluno.cpf = jsonAluno.cpf;
        }
        if (jsonAluno.curso !== undefined && jsonAluno.curso !== null && jsonAluno.curso !== '') {
            aluno.curso = jsonAluno.curso;
        }
        return aluno;
    }

    #modelToObject(aluno) {
        return {
            id: aluno.id,
            matricula: aluno.matricula,
            nome: aluno.nome,
            email: aluno.email,
            nascimento: aluno.nascimento,
            cpf: aluno.cpf,
            curso: aluno.curso,
            turma: aluno.turma,
        };
    }
};
