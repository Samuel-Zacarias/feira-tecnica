const { ObjectId } = require("mongodb");
const ErrorResponse = require("../utils/ErrorResponse");
const logger = require("../utils/Logger");

module.exports = class ProjetoMiddleware {
    validateBody = (request, response, next) => {
        const method = "ProjetoMiddleware.validateBody";

        try {
            const projeto = request.body.projeto;

            if (!projeto || typeof projeto !== "object") {
                throw new Error(
                    "O campo 'projeto' é obrigatório."
                );
            }

            const tema = projeto.tema || projeto.titulo;

            if (
                typeof tema !== "string" ||
                tema.trim().length < 3
            ) {
                throw new Error(
                    "O tema deve ter pelo menos 3 caracteres."
                );
            }

            const normalizarCurso = valor =>
              String(valor)
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                 .trim()
                 .toUpperCase();

                const cursosPermitidos = [
                    "ADMINISTRACAO",
                    "ANALISES CLINICAS",
                    "ELETRONICA",
                    "INFORMATICA",
                    "PUBLICIDADE",
                    "QUIMICA"
                 ];

            if (
                typeof projeto.curso !== "string" ||
                 !cursosPermitidos.includes(normalizarCurso(projeto.curso))
                ) {
                     throw new Error(
                    "O curso informado é inválido."
                    );
                }

            const representante =
                this.#getRepresentante(projeto);

            this.#validateParticipante(
                representante,
                "representante",
                true
            );

            const integrantes =
                projeto.integrantes ||
                projeto.grupo ||
                [];

            if (!Array.isArray(integrantes)) {
                throw new Error(
                    "integrantes deve ser um array."
                );
            }

            if (integrantes.length < 1) {
                throw new Error(
                    "O projeto deve possuir pelo menos 2 estudantes."
                );
            }

            if (integrantes.length > 9) {
                throw new Error(
                    "São permitidos no máximo 10 estudantes, incluindo o representante."
                );
            }

            integrantes.forEach((integrante, index) => {
                this.#validateParticipante(
                    this.#normalizarParticipante(integrante),
                    `integrante ${index + 2}`,
                    false
                );
            });

            const participantes = [
                representante,
                ...integrantes.map(item =>
                    this.#normalizarParticipante(item)
                )
            ];

            const matriculas = participantes.map(
                item => item.matricula.trim()
            );

            if (
                new Set(matriculas).size !== matriculas.length
            ) {
                throw new Error(
                    "Existe matrícula repetida no projeto."
                );
            }

            const equipamento =
                this.#getEquipamento(projeto);

            const equipamentosPermitidos = [
                "EQUIPE TRAZ SEU COMPUTADOR",
                "COMPUTADOR DA ESCOLA"
            ];

            if (
                !equipamentosPermitidos.includes(equipamento)
            ) {
                throw new Error(
                    "O equipamento informado é inválido."
                );
            }

            logger.debug(
                `✅ ${method} - Dados válidos`
            );

            next();
        } catch (error) {
            next(
                new ErrorResponse(
                    400,
                    "Erro na validação de dados",
                    {
                        message: error.message
                    }
                )
            );
        }
    };

    validateIdParam = (request, response, next) => {
        const idProjeto = request.params.idProjeto;

        if (
            !idProjeto ||
            !ObjectId.isValid(idProjeto)
        ) {
            return next(
                new ErrorResponse(
                    400,
                    "ID de projeto inválido",
                    {
                        message:
                            "O idProjeto deve ser um ObjectId válido."
                    }
                )
            );
        }

        next();
    };

    #getRepresentante(projeto) {
        if (projeto.representante) {
            return this.#normalizarParticipante(
                projeto.representante
            );
        }

        if (projeto.lider) {
            return this.#normalizarParticipante(
                projeto.lider
            );
        }

        return {
            nome: projeto.nomeCapitao,
            matricula: projeto.matriculaCapitao,
            turma:
                projeto.turmaCapitao ||
                projeto.turma_capitao,
            email: projeto.emailCapitao
        };
    }

    #normalizarParticipante(participante) {
        const encontrarCampo = prefixo => {
            const chave = Object.keys(
                participante || {}
            ).find(item =>
                item.startsWith(prefixo)
            );

            return chave
                ? participante[chave]
                : undefined;
        };

        return {
            nome:
                participante?.nome ||
                encontrarCampo("nomeAluno") ||
                encontrarCampo("nomeProfessor"),

            matricula:
                participante?.matricula ||
                encontrarCampo("matriculaAluno") ||
                encontrarCampo("matriculaProfessor"),

            turma:
                participante?.turma ||
                encontrarCampo("turmaAluno") ||
                encontrarCampo("turmaProfessor"),

            email: participante?.email
        };
    }

    #validateParticipante(
        participante,
        descricao,
        emailObrigatorio
    ) {
        if (
            typeof participante.nome !== "string" ||
            participante.nome.trim().length < 3
        ) {
            throw new Error(
                `O nome do ${descricao} é inválido.`
            );
        }

        if (
            typeof participante.matricula !== "string" ||
            participante.matricula.trim() === ""
        ) {
            throw new Error(
                `A matrícula do ${descricao} é obrigatória.`
            );
        }

        if (
            typeof participante.turma !== "string" ||
            participante.turma.trim() === ""
        ) {
            throw new Error(
                `A turma do ${descricao} é obrigatória.`
            );
        }

        if (emailObrigatorio) {
            const formatoEmail =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (
                typeof participante.email !== "string" ||
                !formatoEmail.test(
                    participante.email.trim()
                )
            ) {
                throw new Error(
                    `O e-mail do ${descricao} é inválido.`
                );
            }
        }
    }

    #getEquipamento(projeto) {
        // Removido o console.log que causava o erro de escopo
        if (
            typeof projeto.equipamento === "string"
        ) {
            return projeto.equipamento
                .trim()
                .toUpperCase();
        }

        if (
            projeto.precisaComputador !== undefined
        ) {
            return [true, "true"].includes(
                projeto.precisaComputador
            )
                ? "COMPUTADOR DA ESCOLA"
                : "EQUIPE TRAZ SEU COMPUTADOR";
        }

        return "";
    }
};