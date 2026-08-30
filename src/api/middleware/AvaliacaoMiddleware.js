const { ObjectId } = require('mongodb');
const ErrorResponse = require('../utils/ErrorResponse');
const logger = require('../utils/Logger');

module.exports = class AvaliacaoMiddleware {
    validateBody = (request, response, next) => {
        const method = 'AvaliacaoMiddleware.validateBody';
        logger.debug(`🔷 ${method} - Validando corpo da requisição`);

        const avaliacao = request.body.avaliacao;
        if (!avaliacao) {
            throw new ErrorResponse(400, 'Erro na validação de dados', {
                message: "O campo 'avaliacao' é obrigatório",
            });
        }
        const projetoId = avaliacao.projetoId || avaliacao.projeto?.id || avaliacao.projeto;
        if (!projetoId || !ObjectId.isValid(projetoId)) {
            throw new ErrorResponse(400, 'Projeto inválido', {
                message: 'A avaliação deve possuir um projetoId válido',
            });
        }
        if (!avaliacao.avaliador || typeof avaliacao.avaliador !== 'string') {
            throw new ErrorResponse(400, 'Avaliador inválido', {
                message: 'O nome ou ID do avaliador é obrigatório',
            });
        }

        const criterios = [
            'criatividade', 'relevancia', 'viabilidade', 'apresentacao',
            'conhecimentoTecnico', 'funcionalidade', 'sustentabilidade',
            'trabalhoEquipe', 'originalidade', 'potencialMercado',
        ];
        for (const criterio of criterios) {
            const valorOriginal = avaliacao[criterio];
            const valor = Number(valorOriginal);
            if (valorOriginal === undefined || valorOriginal === null || valorOriginal === '' ||
                Number.isNaN(valor) || valor < 0 || valor > 10) {
                throw new ErrorResponse(400, 'Nota inválida', {
                    message: `${criterio} deve ser um número entre 0 e 10`,
                });
            }
        }
        if (avaliacao.comentarios !== undefined && !Array.isArray(avaliacao.comentarios)) {
            throw new ErrorResponse(400, 'Comentários inválidos', {
                message: 'comentarios deve ser um array',
            });
        }
        const statusPermitidos = ['Em análise', 'Aprovado', 'Reprovado', 'Classificado'];
        if (avaliacao.status && !statusPermitidos.includes(avaliacao.status)) {
            throw new ErrorResponse(400, 'Status inválido', {
                message: `status deve ser um dos: ${statusPermitidos.join(', ')}`,
            });
        }
        next();
    };

    validateIdParam = (request, response, next) => {
        const idAvaliacao = request.params.idAvaliacao;
        if (!idAvaliacao || !ObjectId.isValid(idAvaliacao)) {
            throw new ErrorResponse(400, 'ID de avaliação inválido', {
                message: "O parâmetro 'idAvaliacao' deve ser um ObjectId válido",
            });
        }
        next();
    };

    validateProjetoIdParam = (request, response, next) => {
        const idProjeto = request.params.idProjeto;
        if (!idProjeto || !ObjectId.isValid(idProjeto)) {
            throw new ErrorResponse(400, 'ID de projeto inválido', {
                message: "O parâmetro 'idProjeto' deve ser um ObjectId válido",
            });
        }
        next();
    };
};
