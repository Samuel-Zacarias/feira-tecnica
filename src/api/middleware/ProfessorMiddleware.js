const { ObjectId } = require('mongodb');
const ErrorResponse = require('../utils/ErrorResponse');
const logger = require('../utils/Logger');

module.exports = class ProfessorMiddleware {
    validateBody = (request, response, next) => {
        const method = 'ProfessorMiddleware.validateBody';
        logger.debug(`🔷 ${method} - Validando corpo da requisição`);

        const Professor = request.body.Professor;
        if (!Professor) {
            throw new ErrorResponse(400, 'Erro na validação de dados', {
                message: "O campo 'Professor' é obrigatório",
            });
        }
        if (!Professor.nome || typeof Professor.nome !== 'string' || Professor.nome.trim().length < 3) {
            throw new ErrorResponse(400, 'Erro na validação de dados', {
                message: "O campo 'nome' deve ter pelo menos 3 caracteres",
            });
        }
        if (!Professor.matricula || typeof Professor.matricula !== 'string') {
            throw new ErrorResponse(400, 'Erro na validação de dados', {
                message: "O campo 'matricula' é obrigatório",
            });
        }
        if (!Professor.turma || typeof Professor.turma !== 'string') {
            throw new ErrorResponse(400, 'Erro na validação de dados', {
                message: "O campo 'turma' é obrigatório",
            });
        }
        next();
    };

    validateIdParam = (request, response, next) => {
        const idProfessor = request.params.idProfessor;
        if (!idProfessor || !ObjectId.isValid(idProfessor)) {
            throw new ErrorResponse(400, 'ID de Professor inválido', {
                message: "O parâmetro 'idProfessor' deve ser um ObjectId válido",
            });
        }
        next();
    };
};
