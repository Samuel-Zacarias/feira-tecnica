const Projeto = require("../models/Projeto");
const ErrorResponse = require("../utils/ErrorResponse");
const logger = require("../utils/Logger");
const QrCodeGenerator = require("../utils/QrCodeGenerator");

module.exports = class ProjetoService {
    #projetoDAO;

    constructor(projetoDAODependency) {
        logger.info("⬆️ ProjetoService.constructor()");
        this.#projetoDAO = projetoDAODependency;
    }

    createProjeto = async (jsonProjeto) => {
        const method = "ProjetoService.createProjeto";

        try {
            const projeto = this.#criarModelo(jsonProjeto);

            await this.#validarParticipacaoUnica(projeto);

            projeto.id = await this.#projetoDAO.create(projeto);

            // Gera o QR Code apontando para a página pública do projeto.
            const urlPublica = `${process.env.BASE_URL}/projeto.html?id=${projeto.id}`;
            const qrCodeBase64 = await QrCodeGenerator.gerar(urlPublica);

            await this.#projetoDAO.salvarQrCode(projeto.id, qrCodeBase64, urlPublica);

            logger.info(`✅ ${method} - Projeto criado`, {
                idProjeto: projeto.id,
                tema: projeto.tema
            });

            return await this.#projetoDAO.findById(projeto.id);
        } catch (error) {
            logger.error(`❌ ${method} - Erro ao criar projeto`, {
                error: error.message,
                stack: error.stack
            });

            throw error;
        }
    };

    findAll = async () => {
        return await this.#projetoDAO.findAll();
    };

  
    buscarPorNomeAluno = async (nome) => {
        const nomeBuscado = (nome || "").trim();

        if (nomeBuscado.length < 3) {
            throw new ErrorResponse(400, "Nome inválido", {
            message: "Informe pelo menos 3 caracteres para buscar o aluno."
        });
    }

        const projetosEncontrados =
            await this.#projetoDAO.findByNomeAluno(nomeBuscado);

        const normalizar = valor =>
            String(valor || "")
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .trim()
                .toLowerCase();

        const nomeBuscadoNormalizado = normalizar(nomeBuscado);

        const resultados = projetosEncontrados.map(projeto => {
            const participantes = [
                projeto.representante,
                ...projeto.integrantes
            ];

            const participanteEncontrado = participantes.find(
                participante =>
                    normalizar(participante.nome).includes(
                        nomeBuscadoNormalizado
                    )
            );

            return {
                projetoId: projeto.id,
                tema: projeto.tema,
                curso: projeto.curso,
                nomeEncontrado:
                    participanteEncontrado?.nome || null,
                    turma: participanteEncontrado?.turma || null
            };
        });

        return {
            encontrado: resultados.length > 0,
            projetos: resultados
        };
    };

    buscarPorMatricula = async (matricula) => {
        const matriculaBuscada = (matricula || "").trim();
    
        if (!matriculaBuscada) {
            throw new ErrorResponse(400, "Matricula invalida", {
                message: "Informe uma matricula."
            });
        }
    
        const projetosEncontrados =
            await this.#projetoDAO.findByMatricula(
                matriculaBuscada
            );
    
        return {
            encontrado: projetosEncontrados.length > 0,
            projetos: projetosEncontrados.map(projeto => ({
                projetoId: projeto.id,
                tema: projeto.tema,
                curso: projeto.curso
            }))
        };
    };

    findById = async (idProjeto) => {
        const projeto = await this.#projetoDAO.findById(idProjeto);

        if (!projeto) {
            throw new ErrorResponse(404, "Projeto não encontrado", {
                message: `Não existe projeto com id ${idProjeto}`
            });
        }

        return projeto;
    };

    updateProjeto = async (idProjeto, requestBody) => {
        const jsonProjeto = requestBody.projeto || requestBody;

        const projetoExistente = await this.#projetoDAO.findById(idProjeto);

        if (!projetoExistente) {
            throw new ErrorResponse(404, "Projeto não encontrado", {
                message: `Não existe projeto com id ${idProjeto}`
            });
        }

        const projeto = this.#criarModelo(jsonProjeto);
        projeto.id = idProjeto;

        await this.#validarParticipacaoUnica(projeto, idProjeto);

        const atualizado = await this.#projetoDAO.update(projeto);

        if (!atualizado) {
            throw new ErrorResponse(404, "Projeto não encontrado", {
                message: "Não foi possível atualizar o projeto"
            });
        }

        return await this.#projetoDAO.findById(idProjeto);
    };

    deleteProjeto = async (idProjeto) => {
        const projeto = new Projeto();
        projeto.id = idProjeto;

        return await this.#projetoDAO.delete(projeto);
    };

    #criarModelo(jsonProjeto) {
        if (!jsonProjeto || typeof jsonProjeto !== "object") {
            throw new ErrorResponse(400, "Dados inválidos", {
                message: "Os dados do projeto são obrigatórios"
            });
        }

        const dados = this.#normalizarJson(jsonProjeto);
        const projeto = new Projeto();

        projeto.tema = dados.tema;
        projeto.curso = dados.curso;
        projeto.representante = dados.representante;
        projeto.integrantes = dados.integrantes;
        projeto.equipamento = dados.equipamento;
        projeto.outrosRecursos = dados.outrosRecursos;
        projeto.observacoes = dados.observacoes;

        projeto.validarMatriculasUnicas();

        return projeto;
    }

    #normalizarJson(jsonProjeto) {
        const representante =
            jsonProjeto.representante ||
            jsonProjeto.lider ||
            {
                nome: jsonProjeto.nomeCapitao,
                matricula: jsonProjeto.matriculaCapitao,
                turma:
                    jsonProjeto.turmaCapitao ||
                    jsonProjeto.turma_capitao,
                email: jsonProjeto.emailCapitao
            };

        const integrantes =
            jsonProjeto.integrantes ||
            jsonProjeto.grupo ||
            [];

        let equipamento = jsonProjeto.equipamento;

        // Compatibilidade temporária com o formato antigo.
        if (
            !equipamento &&
            jsonProjeto.precisaComputador !== undefined
        ) {
            equipamento = [true, "true"].includes(
                jsonProjeto.precisaComputador
            )
                ? "COMPUTADOR DA ESCOLA"
                : "EQUIPE TRAZ SEU COMPUTADOR";
        }

        return {
            tema: jsonProjeto.tema || jsonProjeto.titulo,
            curso: jsonProjeto.curso,
            representante,
            integrantes,
            equipamento,

            outrosRecursos:
                jsonProjeto.outrosRecursos ??
                jsonProjeto.o_que_mais_precisa ??
                null,

            observacoes:
                jsonProjeto.observacoes ??
                jsonProjeto.obs ??
                null
        };
    }

    async #validarParticipacaoUnica(
        projeto,
        idProjetoAtual = null
    ) {
        const participantes = [
            projeto.representante,
            ...projeto.integrantes
        ];

        for (const participante of participantes) {
            const projetosEncontrados =
                await this.#projetoDAO.findByMatricula(
                    participante.matricula
                );

            const outroProjeto = projetosEncontrados.find(
                projetoEncontrado =>
                    projetoEncontrado.id !== idProjetoAtual
            );

            if (outroProjeto) {
                throw new ErrorResponse(
                    400,
                    "Estudante já cadastrado",
                    {
                        message:
                            `${participante.nome} já participa do projeto ` +
                            `“${outroProjeto.tema}”`
                    }
                );
            }
        }
    }
};