const AvaliacaoDAO = require('../dao/AvaliacaoDAOMongo');
const ProjetoDAO = require('../dao/ProjetoDAOMongo');
const Avaliacao = require('../models/Avaliacao');
const ErrorResponse = require('../utils/ErrorResponse');
const logger = require('../utils/Logger');

module.exports = class AvaliacaoService {
    #avaliacaoDAO;
    #projetoDAO;

    /**
     * @param {AvaliacaoDAO} avaliacaoDAODependency - Instância de AvaliacaoDAOMongo
     * @param {ProjetoDAO} projetoDAODependency - Instância de ProjetoDAOMongo
     */
    constructor(avaliacaoDAODependency, projetoDAODependency) {
        logger.info('⬆️ AvaliacaoService.constructor()');
        this.#avaliacaoDAO = avaliacaoDAODependency;
        this.#projetoDAO = projetoDAODependency;
        logger.debug('🔍 Dependências injetadas no AvaliacaoService', {
            hasAvaliacaoDAO: !!this.#avaliacaoDAO,
            hasProjetoDAO: !!this.#projetoDAO,
        });
    }

    createAvaliacao = async (jsonAvaliacao) => {
        const method = 'AvaliacaoService.createAvaliacao';
        const projetoId = this.#getProjetoId(jsonAvaliacao);
        logger.debug(`🟣 ${method} - Iniciando criação de avaliação`, {
            projetoId,
            avaliador: jsonAvaliacao?.avaliador,
        });

        try {
            const projetoExiste = await this.#projetoDAO.findById(projetoId);
            if (!projetoExiste) {
                throw new ErrorResponse(400, 'Projeto não encontrado', {
                    message: `Não existe projeto com id ${projetoId}`,
                });
            }

            const avaliacoesDoProjeto = await this.#avaliacaoDAO.findByField('projetoId', projetoId);
            const duplicada = avaliacoesDoProjeto.some(
                item => item.avaliador === jsonAvaliacao.avaliador?.trim()
            );
            if (duplicada) {
                throw new ErrorResponse(400, 'Avaliação duplicada', {
                    message: 'Este avaliador já avaliou o projeto',
                });
            }

            const avaliacao = this.#createModel(jsonAvaliacao, projetoId);
            avaliacao.id = await this.#avaliacaoDAO.create(avaliacao);

            logger.info(`✅ ${method} - Avaliação criada com sucesso`, {
                idAvaliacao: avaliacao.id,
                projetoId,
            });
            return await this.#avaliacaoDAO.findById(avaliacao.id);
        } catch (error) {
            logger.error(`❌ ${method} - Erro ao criar avaliação`, {
                projetoId,
                error: error.message,
                stack: error.stack,
            });
            throw error;
        }
    };

    findAll = async () => {
        const method = 'AvaliacaoService.findAll';
        logger.debug(`🟣 ${method} - Buscando todas as avaliações`);

        try {
            return await this.#avaliacaoDAO.findAll();
        } catch (error) {
            logger.error(`❌ ${method} - Erro ao buscar avaliações`, {
                error: error.message,
                stack: error.stack,
            });
            throw error;
        }
    };

    findById = async (idAvaliacao) => {
        const method = 'AvaliacaoService.findById';
        logger.debug(`🟣 ${method} - Buscando avaliação por ID`, { idAvaliacao });

        try {
            const avaliacao = await this.#avaliacaoDAO.findById(idAvaliacao);
            if (!avaliacao) {
                throw new ErrorResponse(404, 'Avaliação não encontrada', {
                    message: `Não existe avaliação com id ${idAvaliacao}`,
                });
            }
            return avaliacao;
        } catch (error) {
            logger.error(`❌ ${method} - Erro ao buscar avaliação`, {
                idAvaliacao,
                error: error.message,
                stack: error.stack,
            });
            throw error;
        }
    };

    findByProjeto = async (idProjeto) => {
        const method = 'AvaliacaoService.findByProjeto';
        logger.debug(`🟣 ${method} - Buscando avaliações do projeto`, { idProjeto });

        try {
            return await this.#avaliacaoDAO.findByField('projetoId', idProjeto);
        } catch (error) {
            logger.error(`❌ ${method} - Erro ao buscar avaliações do projeto`, {
                idProjeto,
                error: error.message,
                stack: error.stack,
            });
            throw error;
        }
    };

    updateAvaliacao = async (idAvaliacao, requestBody) => {
        const method = 'AvaliacaoService.updateAvaliacao';
        const jsonAvaliacao = requestBody.avaliacao || requestBody;
        const projetoId = this.#getProjetoId(jsonAvaliacao);
        logger.debug(`🟣 ${method} - Atualizando avaliação`, { idAvaliacao });

        try {
            const avaliacao = this.#createModel(jsonAvaliacao, projetoId);
            avaliacao.id = idAvaliacao;
            return await this.#avaliacaoDAO.update(avaliacao);
        } catch (error) {
            logger.error(`❌ ${method} - Erro ao atualizar avaliação`, {
                idAvaliacao,
                error: error.message,
                stack: error.stack,
            });
            throw error;
        }
    };

    deleteAvaliacao = async (idAvaliacao) => {
        const method = 'AvaliacaoService.deleteAvaliacao';
        logger.debug(`🟣 ${method} - Excluindo avaliação`, { idAvaliacao });

        try {
            const avaliacao = new Avaliacao();
            avaliacao.id = idAvaliacao;
            return await this.#avaliacaoDAO.delete(avaliacao);
        } catch (error) {
            logger.error(`❌ ${method} - Erro ao excluir avaliação`, {
                idAvaliacao,
                error: error.message,
                stack: error.stack,
            });
            throw error;
        }
    };

    #getProjetoId(jsonAvaliacao) {
        return jsonAvaliacao.projetoId || jsonAvaliacao.projeto?.id || jsonAvaliacao.projeto;
    }

    #createModel(jsonAvaliacao, projetoId) {
        const avaliacao = new Avaliacao();
        avaliacao.projeto = projetoId;
        avaliacao.avaliador = jsonAvaliacao.avaliador;
        avaliacao.criatividade = Number(jsonAvaliacao.criatividade);
        avaliacao.relevancia = Number(jsonAvaliacao.relevancia);
        avaliacao.viabilidade = Number(jsonAvaliacao.viabilidade);
        avaliacao.apresentacao = Number(jsonAvaliacao.apresentacao);
        avaliacao.conhecimentoTecnico = Number(jsonAvaliacao.conhecimentoTecnico);
        avaliacao.funcionalidade = Number(jsonAvaliacao.funcionalidade);
        avaliacao.sustentabilidade = Number(jsonAvaliacao.sustentabilidade);
        avaliacao.trabalhoEquipe = Number(jsonAvaliacao.trabalhoEquipe);
        avaliacao.originalidade = Number(jsonAvaliacao.originalidade);
        avaliacao.potencialMercado = Number(jsonAvaliacao.potencialMercado);

        for (const comentario of jsonAvaliacao.comentarios || []) {
            avaliacao.addComentario(typeof comentario === 'string' ? comentario : comentario.texto);
        }
        if (jsonAvaliacao.status) avaliacao.status = jsonAvaliacao.status;
        return avaliacao;
    }
};
