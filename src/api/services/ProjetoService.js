const Projeto = require("../models/Projeto");
const ErrorResponse = require("../utils/ErrorResponse");
const QrCodeGenerator = require("../utils/QrCodeGenerator");

const CAMPOS_EDITAVEIS_ALUNO = [
    "tema",
    "statusProjeto",
    "localizacao",
    "descricao",
    "objetivo",
    "problema",
    "solucao",
    "diferencial",
    "tecnologias",
    "imagens",
    "links",
];

module.exports = class ProjetoService {
    #dao;

    constructor(dao) {
        this.#dao = dao;
    }

    createProjeto = async jsonProjeto => {
        const projeto = this.#criarModelo(jsonProjeto);
        await this.#validarParticipacaoUnica(projeto);
        projeto.id = await this.#dao.create(projeto);
        return this.#dao.findById(projeto.id);
    };

    findAll = async () => this.#dao.findAll();

    findMeuProjeto = async usuario => {
        if (!usuario?.idAluno) {
            throw new ErrorResponse(401, "Aluno não autenticado");
        }
        return this.#dao.findByAlunoId(usuario.idAluno, usuario.matricula);
    };

    gerarQrCodeMeuProjeto = async (usuario, baseUrl) => {
        const projeto = await this.findMeuProjeto(usuario);
        if (!projeto) {
            throw new ErrorResponse(
                404,
                "Seu projeto ainda não foi importado pela organização"
            );
        }

        const origem = String(baseUrl || "http://localhost:3000").replace(/\/$/, "");
        const urlPublica = `${origem}/projeto.html?id=${projeto.id}`;
        const qrCode = await QrCodeGenerator.gerar(urlPublica);

        return {
            projetoId: projeto.id,
            tema: projeto.tema,
            urlPublica,
            qrCode,
        };
    };

    findById = async id => {
        const projeto = await this.#dao.findById(id);
        if (!projeto) throw new ErrorResponse(404, "Projeto não encontrado");
        return projeto;
    };

    updateProjeto = async (id, requestBody, usuario = null) => {
        const atual = await this.findById(id);
        const recebidoOriginal = requestBody.projeto || requestBody;

        if (usuario?.role === "ALUNO" && !this.#pertenceAoAluno(atual, usuario)) {
            throw new ErrorResponse(403, "Você só pode editar o seu próprio projeto");
        }

        const recebido = usuario?.role === "ALUNO"
            ? this.#filtrarCamposAluno(recebidoOriginal)
            : recebidoOriginal;

        const mesclado = this.#mesclarAtualizacao(atual, recebido, usuario);
        const projeto = this.#criarModelo(mesclado);
        projeto.id = id;

        await this.#validarParticipacaoUnica(projeto, id);
        await this.#dao.update(projeto);
        return this.#dao.findById(id);
    };

    deleteProjeto = async id => {
        const projeto = new Projeto();
        projeto.id = id;
        return this.#dao.delete(projeto);
    };

    #pertenceAoAluno(projeto, usuario) {
        if (projeto.alunoId === usuario.idAluno) return true;
        if (projeto.representante?.matricula === usuario.matricula) return true;
        return (projeto.integrantes || []).some(
            integrante => integrante.matricula === usuario.matricula
        );
    }

    #filtrarCamposAluno(dados) {
        return Object.fromEntries(
            CAMPOS_EDITAVEIS_ALUNO
                .filter(campo => Object.prototype.hasOwnProperty.call(dados, campo))
                .map(campo => [campo, dados[campo]])
        );
    }

    #mesclarAtualizacao(atual, recebido, usuario) {
        const aluno = usuario?.role === "ALUNO";
        return {
            ...atual,
            ...recebido,
            representante: aluno
                ? atual.representante
                : (recebido.representante || atual.representante),
            integrantes: aluno
                ? atual.integrantes
                : (recebido.integrantes || atual.integrantes),
            curso: aluno ? atual.curso : (recebido.curso || atual.curso),
            equipamento: aluno
                ? atual.equipamento
                : (recebido.equipamento || atual.equipamento),
            outrosRecursos: aluno
                ? atual.outrosRecursos
                : (recebido.outrosRecursos ?? atual.outrosRecursos),
            observacoes: aluno
                ? atual.observacoes
                : (recebido.observacoes ?? atual.observacoes),
            alunoId: atual.alunoId || (aluno ? usuario.idAluno : recebido.alunoId),
        };
    }

    #criarModelo(dados) {
        if (!dados || typeof dados !== "object") {
            throw new ErrorResponse(400, "Dados do projeto obrigatórios");
        }

        const projeto = new Projeto();
        projeto.tema = dados.tema || dados.titulo;
        projeto.curso = dados.curso;
        projeto.representante = dados.representante || dados.lider || {
            nome: dados.nomeCapitao,
            matricula: dados.matriculaCapitao,
            turma: dados.turmaCapitao || dados.turma_capitao,
            email: dados.emailCapitao,
        };
        projeto.integrantes = dados.integrantes || dados.grupo || [];

        let equipamento = dados.equipamento;
        if (!equipamento && dados.precisaComputador !== undefined) {
            equipamento = [true, "true"].includes(dados.precisaComputador)
                ? "COMPUTADOR DA ESCOLA"
                : "EQUIPE TRAZ SEU COMPUTADOR";
        }

        projeto.equipamento = equipamento || "EQUIPE TRAZ SEU COMPUTADOR";
        projeto.outrosRecursos = dados.outrosRecursos ?? dados.o_que_mais_precisa ?? null;
        projeto.observacoes = dados.observacoes ?? dados.obs ?? null;
        projeto.alunoId = dados.alunoId || null;
        projeto.descricao = dados.descricao || null;
        projeto.objetivo = dados.objetivo || null;
        projeto.problema = dados.problema || null;
        projeto.solucao = dados.solucao || null;
        projeto.diferencial = dados.diferencial || null;
        projeto.tecnologias = dados.tecnologias || [];
        projeto.imagens = dados.imagens || [];
        projeto.links = dados.links || {};
        projeto.localizacao = dados.localizacao || null;
        projeto.statusProjeto = dados.statusProjeto || "PLANEJAMENTO";
        projeto.validarMatriculasUnicas();

        return projeto;
    }

    async #validarParticipacaoUnica(projeto, idAtual = null) {
        for (const participante of [projeto.representante, ...projeto.integrantes]) {
            const encontrados = await this.#dao.findByMatricula(participante.matricula);
            const outroProjeto = encontrados.find(item => item.id !== idAtual);

            if (outroProjeto) {
                throw new ErrorResponse(400, "Estudante já participa de outro projeto", {
                    message: `${participante.nome} já está no projeto “${outroProjeto.tema}”.`,
                });
            }
        }
    }
};
