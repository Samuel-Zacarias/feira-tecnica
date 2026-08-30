const ProjetoDAO = require('../dao/ProjetoDAOMongo');
const AlunoDAO = require('../dao/AlunoDAOMongo');
const Projeto = require('../models/Projeto');
const Aluno = require('../models/Aluno');
const ErrorResponse = require('../utils/ErrorResponse');
const logger = require('../utils/Logger');

module.exports = class ProjetoService {
    #projetoDAO;
    #alunoDAO;

    /**
     * @param {ProjetoDAO} projetoDAODependency - Instância de ProjetoDAOMongo
     * @param {AlunoDAO} alunoDAODependency - Instância de AlunoDAOMongo
     */
    constructor(projetoDAODependency, alunoDAODependency) {
        logger.info('⬆️ ProjetoService.constructor()');
        this.#projetoDAO = projetoDAODependency;
        this.#alunoDAO = alunoDAODependency;
        logger.debug('🔍 Dependências injetadas no ProjetoService', {
            hasProjetoDAO: !!this.#projetoDAO,
            hasAlunoDAO: !!this.#alunoDAO,
        });
    }

    createProjeto = async (jsonProjeto) => {
        const method = 'ProjetoService.createProjeto';
        logger.debug(`🟣 ${method} - Iniciando criação de projeto`, {
            titulo: jsonProjeto?.titulo,
        });

        try {
            const projeto = new Projeto();
            projeto.titulo = jsonProjeto.titulo;
            projeto.descricao = jsonProjeto.descricao;
            this.#setDadosComplementares(projeto, jsonProjeto);

            const tituloExiste = await this.#projetoDAO.findByField('titulo', projeto.titulo);
            if (tituloExiste.length > 0) {
                throw new ErrorResponse(400, 'Projeto já cadastrado', {
                    message: `Já existe um projeto com o título ${projeto.titulo}`,
                });
            }

            const { lider, integrantes } = this.#normalizarGrupo(jsonProjeto);
            const grupoJson = [lider, ...integrantes];
            this.#validarMatriculasUnicas(grupoJson);

            if (grupoJson.length > 10) {
                throw new ErrorResponse(400, 'Limite de integrantes excedido', {
                    message: 'O projeto pode ter no máximo 10 alunos, incluindo o líder',
                });
            }

            const alunos = [];
            for (const jsonAluno of grupoJson) {
                alunos.push(await this.#findOrCreateAluno(jsonAluno));
            }

            projeto.alunos = alunos;
            projeto.id = await this.#projetoDAO.create(projeto);

            logger.info(`✅ ${method} - Projeto criado com sucesso`, {
                idProjeto: projeto.id,
                titulo: projeto.titulo,
            });
            return await this.#projetoDAO.findById(projeto.id);
        } catch (error) {
            logger.error(`❌ ${method} - Erro ao criar projeto`, {
                titulo: jsonProjeto?.titulo,
                error: error.message,
                stack: error.stack,
            });
            throw error;
        }
    };

    findAll = async () => {
        const method = 'ProjetoService.findAll';
        logger.debug(`🟣 ${method} - Buscando todos os projetos`);

        try {
            return await this.#projetoDAO.findAll();
        } catch (error) {
            logger.error(`❌ ${method} - Erro ao buscar projetos`, {
                error: error.message,
                stack: error.stack,
            });
            throw error;
        }
    };

    findById = async (idProjeto) => {
        const method = 'ProjetoService.findById';
        logger.debug(`🟣 ${method} - Buscando projeto por ID`, { idProjeto });

        try {
            const projeto = await this.#projetoDAO.findById(idProjeto);
            if (!projeto) {
                throw new ErrorResponse(404, 'Projeto não encontrado', {
                    message: `Não existe projeto com id ${idProjeto}`,
                });
            }
            return projeto;
        } catch (error) {
            logger.error(`❌ ${method} - Erro ao buscar projeto`, {
                idProjeto,
                error: error.message,
                stack: error.stack,
            });
            throw error;
        }
    };

    updateProjeto = async (idProjeto, requestBody) => {
        const method = 'ProjetoService.updateProjeto';
        const jsonProjeto = requestBody.projeto || requestBody;
        logger.debug(`🟣 ${method} - Atualizando projeto`, { idProjeto });

        try {
            const projeto = new Projeto();
            projeto.id = idProjeto;
            projeto.titulo = jsonProjeto.titulo;
            projeto.descricao = jsonProjeto.descricao;
            this.#setDadosComplementares(projeto, jsonProjeto);

            const { lider, integrantes } = this.#normalizarGrupo(jsonProjeto);
            const grupoJson = [lider, ...integrantes];
            this.#validarMatriculasUnicas(grupoJson);

            if (grupoJson.length > 10) {
                throw new ErrorResponse(400, 'Limite de integrantes excedido', {
                    message: 'O projeto pode ter no máximo 10 alunos, incluindo o líder',
                });
            }

            const alunos = [];
            for (const jsonAluno of grupoJson) {
                alunos.push(await this.#findOrCreateAluno(jsonAluno));
            }
            projeto.alunos = alunos;
            return await this.#projetoDAO.update(projeto);
        } catch (error) {
            logger.error(`❌ ${method} - Erro ao atualizar projeto`, {
                idProjeto,
                error: error.message,
                stack: error.stack,
            });
            throw error;
        }
    };

    deleteProjeto = async (idProjeto) => {
        const method = 'ProjetoService.deleteProjeto';
        logger.debug(`🟣 ${method} - Excluindo projeto`, { idProjeto });

        try {
            const projeto = new Projeto();
            projeto.id = idProjeto;
            return await this.#projetoDAO.delete(projeto);
        } catch (error) {
            logger.error(`❌ ${method} - Erro ao excluir projeto`, {
                idProjeto,
                error: error.message,
                stack: error.stack,
            });
            throw error;
        }
    };

    #normalizarGrupo(jsonProjeto) {
        const liderOriginal = jsonProjeto.lider || {
            nome: jsonProjeto.nomeCapitao,
            matricula: jsonProjeto.matriculaCapitao,
            email: jsonProjeto.emailCapitao,
            turma: jsonProjeto.turmaCapitao || jsonProjeto.turma_capitao,
        };
        const lider = this.#normalizarAluno(liderOriginal);
        const integrantesOriginais = jsonProjeto.integrantes || jsonProjeto.grupo || jsonProjeto.alunos || [];
        const integrantes = integrantesOriginais.map(item => this.#normalizarAluno(item));
        return { lider, integrantes };
    }

    #normalizarAluno(jsonAluno) {
        const encontrar = prefixo => {
            const chave = Object.keys(jsonAluno || {}).find(item => item.startsWith(prefixo));
            return chave ? jsonAluno[chave] : undefined;
        };

        return {
            nome: jsonAluno?.nome || encontrar('nomeAluno'),
            matricula: jsonAluno?.matricula || encontrar('matriculaAluno'),
            email: jsonAluno?.email,
            turma: jsonAluno?.turma || encontrar('turmaAluno'),
            curso: jsonAluno?.curso,
        };
    }

    #validarMatriculasUnicas(grupoJson) {
        const matriculas = grupoJson.map(aluno => aluno.matricula?.trim());
        if (matriculas.some(matricula => !matricula)) {
            throw new ErrorResponse(400, 'Erro na validação de dados', {
                message: 'Todos os alunos devem possuir matrícula',
            });
        }
        if (new Set(matriculas).size !== matriculas.length) {
            throw new ErrorResponse(400, 'Matrícula repetida', {
                message: 'O mesmo aluno não pode aparecer duas vezes no projeto',
            });
        }
    }

    #setDadosComplementares(projeto, jsonProjeto) {
        let precisaComputador = jsonProjeto.precisaComputador ?? false;
        if (precisaComputador === 'true') precisaComputador = true;
        if (precisaComputador === 'false') precisaComputador = false;
        if (typeof precisaComputador !== 'boolean') {
            throw new ErrorResponse(400, 'Erro na validação de dados', {
                message: 'precisaComputador deve ser true ou false',
            });
        }

        const observacoes = jsonProjeto.observacoes ?? jsonProjeto.obs ?? null;
        const outrosRecursos = jsonProjeto.outrosRecursos ?? jsonProjeto.o_que_mais_precisa ?? null;
        if (observacoes !== null && typeof observacoes !== 'string') {
            throw new ErrorResponse(400, 'Erro na validação de dados', {
                message: 'observacoes deve ser uma string',
            });
        }
        if (outrosRecursos !== null && typeof outrosRecursos !== 'string') {
            throw new ErrorResponse(400, 'Erro na validação de dados', {
                message: 'outrosRecursos deve ser uma string',
            });
        }

        projeto.precisaComputador = precisaComputador;
        projeto.observacoes = observacoes?.trim() || null;
        projeto.outrosRecursos = outrosRecursos?.trim() || null;
    }

    async #findOrCreateAluno(jsonAluno) {
        const aluno = new Aluno();
        aluno.matricula = jsonAluno.matricula;
        aluno.nome = jsonAluno.nome;
        aluno.turma = jsonAluno.turma;
        if (jsonAluno.curso) aluno.curso = jsonAluno.curso;

        if (jsonAluno.email) {
            const email = jsonAluno.email.trim().toLowerCase();
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) throw new Error('email do líder está em formato inválido.');
            aluno.email = email;
        }

        const encontrados = await this.#alunoDAO.findByField('matricula', aluno.matricula);
        if (encontrados.length > 0) {
            aluno.id = encontrados[0].id;
            await this.#alunoDAO.update(aluno);
            return aluno;
        }

        aluno.id = await this.#alunoDAO.create(aluno);
        return aluno;
    }
};
