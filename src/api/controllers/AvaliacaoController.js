const ErrorResponse = require('../utils/ErrorResponse');
const asyncHandler = require('../utils/AsyncHandler');

module.exports = class AvaliacaoController {
    #avaliacaoService;

    constructor(avaliacaoService) {
        this.#avaliacaoService = avaliacaoService;
    }

    rankingPublico = asyncHandler(async (request, response) => {
        const ranking = await this.#avaliacaoService.rankingPublico();
        response.status(200).json({
            success: true,
            message: 'Ranking provisório atualizado',
            data: { ranking, atualizadoEm: new Date().toISOString() },
        });
    });

    store = asyncHandler(async (request, response) => {
        const avaliacao = await this.#avaliacaoService.createAvaliacao({
            ...request.body.avaliacao,
            avaliador: request.usuario.nome,
        });
        response.status(201).json({
            success: true,
            message: 'Avaliação cadastrada com sucesso',
            data: { avaliacao },
        });
    });

    index = asyncHandler(async (request, response) => {
        const avaliacoes = this.#filtrarDoUsuario(
            request,
            await this.#avaliacaoService.findAll()
        );
        response.status(200).json({
            success: true,
            message: 'Busca realizada com sucesso',
            data: { avaliacoes },
        });
    });

    indexByProjeto = asyncHandler(async (request, response) => {
        const avaliacoes = this.#filtrarDoUsuario(
            request,
            await this.#avaliacaoService.findByProjeto(request.params.idProjeto)
        );
        response.status(200).json({
            success: true,
            message: 'Avaliações do projeto encontradas',
            data: { avaliacoes },
        });
    });

    show = asyncHandler(async (request, response) => {
        const avaliacao = await this.#avaliacaoService.findById(request.params.idAvaliacao);
        this.#validarAcesso(request, avaliacao, 'acessar');
        response.status(200).json({
            success: true,
            message: 'Avaliação encontrada com sucesso',
            data: { avaliacao },
        });
    });

    update = asyncHandler(async (request, response) => {
        const atual = await this.#avaliacaoService.findById(request.params.idAvaliacao);
        this.#validarAcesso(request, atual, 'editar');

        const corpo = request.body.avaliacao;
        const avaliador = request.usuario.role === 'ADMINISTRADOR'
            ? (corpo.avaliador || atual.avaliador)
            : request.usuario.nome;

        const atualizada = await this.#avaliacaoService.updateAvaliacao(
            request.params.idAvaliacao,
            { avaliacao: { ...corpo, avaliador } }
        );
        response.status(200).json({
            success: true,
            message: atualizada ? 'Avaliação atualizada com sucesso' : 'Avaliação não alterada',
            data: { atualizada },
        });
    });

    destroy = asyncHandler(async (request, response) => {
        const excluida = await this.#avaliacaoService.deleteAvaliacao(request.params.idAvaliacao);
        if (!excluida) {
            return response.status(404).json({
                success: false,
                message: 'Avaliação não encontrada',
            });
        }
        response.status(200).json({
            success: true,
            message: 'Avaliação excluída com sucesso',
            data: null,
        });
    });

    #filtrarDoUsuario(request, avaliacoes) {
        if (request.usuario.role === 'ADMINISTRADOR') return avaliacoes;
        return avaliacoes.filter(avaliacao => avaliacao.avaliador === request.usuario.nome);
    }

    #validarAcesso(request, avaliacao, acao) {
        const permitido = request.usuario.role === 'ADMINISTRADOR' ||
            avaliacao.avaliador === request.usuario.nome;
        if (!permitido) {
            throw new ErrorResponse(403, `Você não pode ${acao} a avaliação de outro professor`);
        }
    }
};
