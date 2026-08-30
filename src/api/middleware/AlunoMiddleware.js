const { ObjectId } = require('mongodb');
const ErrorResponse = require('../utils/ErrorResponse');
const logger = require('../utils/Logger');

module.exports = class AlunoMiddleware {
    validateBody = (request, response, next) => {
        const method = 'AlunoMiddleware.validateBody';
        logger.debug(`🔷 ${method} - Validando corpo da requisição`);

        const aluno = request.body.aluno;
        if (!aluno) {
            throw new ErrorResponse(400, 'Erro na validação de dados', {
                message: "O campo 'aluno' é obrigatório",
            });
        }
        if (!aluno.nome || typeof aluno.nome !== 'string' || aluno.nome.trim().length < 3) {
            throw new ErrorResponse(400, 'Erro na validação de dados', {
                message: "O campo 'nome' deve ter pelo menos 3 caracteres",
            });
        }
        if (!aluno.matricula || typeof aluno.matricula !== 'string') {
            throw new ErrorResponse(400, 'Erro na validação de dados', {
                message: "O campo 'matricula' é obrigatório",
            });
        }
        if (!aluno.turma || typeof aluno.turma !== 'string') {
            throw new ErrorResponse(400, 'Erro na validação de dados', {
                message: "O campo 'turma' é obrigatório",
            });
        }
        next();
    };

    validateIdParam = (request, response, next) => {
        const idAluno = request.params.idAluno;
        if (!idAluno || !ObjectId.isValid(idAluno)) {
            throw new ErrorResponse(400, 'ID de aluno inválido', {
                message: "O parâmetro 'idAluno' deve ser um ObjectId válido",
            });
        }
        next();
    };
};
