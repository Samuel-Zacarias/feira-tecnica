const ProfessorDAO = require('../dao/ProfessorDAOMongo');
const Professor = require('../models/Professor');
const ErrorResponse = require('../utils/ErrorResponse');
const logger = require('../utils/Logger');

module.exports = class ProfessorService {
    #ProfessorDAO;

    /**
     * @param {ProfessorDAO} ProfessorDAODependency - Instância de ProfessorDAOMongo
     */
    constructor(ProfessorDAODependency) {
        logger.info('⬆️ ProfessorService.constructor()');
        this.#ProfessorDAO = ProfessorDAODependency;
        logger.debug('🔍 Dependência injetada no ProfessorService', {
            hasProfessorDAO: !!this.#ProfessorDAO,
        });
    }

    createProfessor = async (jsonProfessor) => {
        const method = 'ProfessorService.createProfessor';
        logger.debug(`🟣 ${method} - Iniciando criação de Professor`, {
            matricula: jsonProfessor?.matricula,
            nome: jsonProfessor?.nome,
        });

        try {
            const Professor = this.#createModel(jsonProfessor);
            const matriculaExiste = await this.#ProfessorDAO.findByField('matricula', Professor.matricula);

            if (matriculaExiste.length > 0) {
                throw new ErrorResponse(400, 'Professor já cadastrado', {
                    message: `A matrícula ${Professor.matricula} já está cadastrada`,
                });
            }

            Professor.id = await this.#ProfessorDAO.create(Professor);
            logger.info(`✅ ${method} - Professor criado com sucesso`, {
                idProfessor: Professor.id,
                matricula: Professor.matricula,
            });
            return this.#modelToObject(Professor);
        } catch (error) {
            logger.error(`❌ ${method} - Erro ao criar Professor`, {
                matricula: jsonProfessor?.matricula,
                error: error.message,
                stack: error.stack,
            });
            throw error;
        }
    };

    findAll = async () => {
        const method = 'ProfessorService.findAll';
        logger.debug(`🟣 ${method} - Buscando todos os Professors`);

        try {
            return await this.#ProfessorDAO.findAll();
        } catch (error) {
            logger.error(`❌ ${method} - Erro ao buscar Professors`, {
                error: error.message,
                stack: error.stack,
            });
            throw error;
        }
    };

    findById = async (idProfessor) => {
        const method = 'ProfessorService.findById';
        logger.debug(`🟣 ${method} - Buscando Professor por ID`, { idProfessor });

        try {
            const Professor = await this.#ProfessorDAO.findById(idProfessor);
            if (!Professor) {
                throw new ErrorResponse(404, 'Professor não encontrado', {
                    message: `Não existe Professor com id ${idProfessor}`,
                });
            }
            return Professor;
        } catch (error) {
            logger.error(`❌ ${method} - Erro ao buscar Professor`, {
                idProfessor,
                error: error.message,
                stack: error.stack,
            });
            throw error;
        }
    };

    updateProfessor = async (idProfessor, requestBody) => {
        const method = 'ProfessorService.updateProfessor';
        const jsonProfessor = requestBody.Professor || requestBody;
        logger.debug(`🟣 ${method} - Atualizando Professor`, { idProfessor });

        try {
            const Professor = this.#createModel(jsonProfessor);
            Professor.id = idProfessor;

            const matriculasIguais = await this.#ProfessorDAO.findByField('matricula', Professor.matricula);
            const duplicado = matriculasIguais.some(item => item.id !== Professor.id);
            if (duplicado) {
                throw new ErrorResponse(400, 'Matrícula já cadastrada', {
                    message: `A matrícula ${Professor.matricula} pertence a outro Professor`,
                });
            }

            return await this.#ProfessorDAO.update(Professor);
        } catch (error) {
            logger.error(`❌ ${method} - Erro ao atualizar Professor`, {
                idProfessor,
                error: error.message,
                stack: error.stack,
            });
            throw error;
        }
    };

    deleteProfessor = async (idProfessor) => {
        const method = 'ProfessorService.deleteProfessor';
        logger.debug(`🟣 ${method} - Excluindo Professor`, { idProfessor });

        try {
            const Professor = new Professor();
            Professor.id = idProfessor;
            return await this.#ProfessorDAO.delete(Professor);
        } catch (error) {
            logger.error(`❌ ${method} - Erro ao excluir Professor`, {
                idProfessor,
                error: error.message,
                stack: error.stack,
            });
            throw error;
        }
    };

    #createModel(jsonProfessor) {
        const Professor = new Professor();
        Professor.matricula = jsonProfessor.matricula;
        Professor.nome = jsonProfessor.nome;
        Professor.turma = jsonProfessor.turma;

        if (jsonProfessor.email !== undefined && jsonProfessor.email !== null && jsonProfessor.email !== '') {
            const email = jsonProfessor.email.trim().toLowerCase();
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) throw new Error('email está em formato inválido.');
            Professor.email = email;
        }
        if (jsonProfessor.nascimento !== undefined && jsonProfessor.nascimento !== null && jsonProfessor.nascimento !== '') {
            Professor.nascimento = jsonProfessor.nascimento;
        }
        if (jsonProfessor.cpf !== undefined && jsonProfessor.cpf !== null && jsonProfessor.cpf !== '') {
            Professor.cpf = jsonProfessor.cpf;
        }
        if (jsonProfessor.curso !== undefined && jsonProfessor.curso !== null && jsonProfessor.curso !== '') {
            Professor.curso = jsonProfessor.curso;
        }
        return Professor;
    }

    #modelToObject(Professor) {
        return {
            id: Professor.id,
            matricula: Professor.matricula,
            nome: Professor.nome,
            email: Professor.email,
            nascimento: Professor.nascimento,
            cpf: Professor.cpf,
            curso: Professor.curso,
            turma: Professor.turma,
        };
    }
};
