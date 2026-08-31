const { ObjectId } = require('mongodb');
const ErrorResponse = require('../utils/ErrorResponse');
const logger = require('../utils/Logger');

module.exports = class ProjetoMiddleware {
    validateBody = (request, response, next) => {
        const method = 'ProjetoMiddleware.validateBody';
        logger.debug(`🔷 ${method} - Validando corpo da requisição`);

        const projeto = request.body.projeto;
        if (!projeto) {
            throw new ErrorResponse(400, 'Erro na validação de dados', {
                message: "O campo 'projeto' é obrigatório",
            });
        }
        if (!projeto.titulo || typeof projeto.titulo !== 'string' || projeto.titulo.trim().length < 3) {
            throw new ErrorResponse(400, 'Erro na validação de dados', {
                message: "O campo 'titulo' deve ter pelo menos 3 caracteres",
            });
        }
        if (projeto.descricao !== undefined && projeto.descricao !== null && typeof projeto.descricao !== 'string') {
            throw new ErrorResponse(400, 'Erro na validação de dados', {
                message: "O campo 'descricao' deve ser uma string",
            });
        }

        const lider = this.#getLider(projeto);
        this.#validateProfessor(lider, 'líder');
        if (!lider.email || typeof lider.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lider.email)) {
            throw new ErrorResponse(400, 'Erro na validação de dados', {
                message: 'O e-mail do líder é obrigatório e deve ser válido',
            });
        }

        const integrantes = this.#getIntegrantes(projeto);
        if (!Array.isArray(integrantes)) {
            throw new ErrorResponse(400, 'Erro na validação de dados', {
                message: 'integrantes/grupo deve ser um array',
            });
        }
        if (integrantes.length > 9) {
            throw new ErrorResponse(400, 'Limite de integrantes excedido', {
                message: 'São permitidos no máximo 10 Professors, incluindo o líder',
            });
        }
        integrantes.forEach((Professor, index) => this.#validateProfessor(
            this.#normalizarProfessor(Professor),
            `integrante ${index + 1}`
        ));

        const matriculas = [lider, ...integrantes.map(item => this.#normalizarProfessor(item))]
            .map(Professor => Professor.matricula.trim());
        if (new Set(matriculas).size !== matriculas.length) {
            throw new ErrorResponse(400, 'Matrícula repetida', {
                message: 'O mesmo Professor não pode aparecer duas vezes no grupo',
            });
        }

        if (projeto.precisaComputador !== undefined &&
            ![true, false, 'true', 'false'].includes(projeto.precisaComputador)) {
            throw new ErrorResponse(400, 'Erro na validação de dados', {
                message: 'precisaComputador deve ser true ou false',
            });
        }
        next();
    };

    validateIdParam = (request, response, next) => {
        const idProjeto = request.params.idProjeto;
        if (!idProjeto || !ObjectId.isValid(idProjeto)) {
            throw new ErrorResponse(400, 'ID de projeto inválido', {
                message: "O parâmetro 'idProjeto' deve ser um ObjectId válido",
            });
        }
        next();
    };

    #getLider(projeto) {
        if (projeto.lider) return this.#normalizarProfessor(projeto.lider);
        if (projeto.nomeCapitao || projeto.matriculaCapitao) {
            return {
                nome: projeto.nomeCapitao,
                matricula: projeto.matriculaCapitao,
                email: projeto.emailCapitao,
                turma: projeto.turmaCapitao || projeto.turma_capitao,
            };
        }
        if (Array.isArray(projeto.Professors) && projeto.Professors.length > 0) {
            return {
                ...this.#normalizarProfessor(projeto.Professors[0]),
                email: projeto.Professors[0].email || projeto.emailCapitao,
            };
        }
        return {};
    }

    #getIntegrantes(projeto) {
        if (projeto.integrantes) return projeto.integrantes;
        if (projeto.grupo) return projeto.grupo;
        if (Array.isArray(projeto.Professors)) return projeto.Professors.slice(1);
        return [];
    }

    #normalizarProfessor(Professor) {
        const encontrar = prefixo => {
            const chave = Object.keys(Professor || {}).find(item => item.startsWith(prefixo));
            return chave ? Professor[chave] : undefined;
        };
        return {
            nome: Professor?.nome || encontrar('nomeProfessor'),
            matricula: Professor?.matricula || encontrar('matriculaProfessor'),
            email: Professor?.email,
            turma: Professor?.turma || encontrar('turmaProfessor'),
        };
    }

    #validateProfessor(Professor, descricao) {
        if (!Professor.nome || typeof Professor.nome !== 'string' || Professor.nome.trim().length < 3) {
            throw new ErrorResponse(400, 'Erro na validação de dados', {
                message: `O nome do ${descricao} deve ter pelo menos 3 caracteres`,
            });
        }
        if (!Professor.matricula || typeof Professor.matricula !== 'string') {
            throw new ErrorResponse(400, 'Erro na validação de dados', {
                message: `A matrícula do ${descricao} é obrigatória`,
            });
        }
        if (!Professor.turma || typeof Professor.turma !== 'string') {
            throw new ErrorResponse(400, 'Erro na validação de dados', {
                message: `A turma do ${descricao} é obrigatória`,
            });
        }
    }
};
