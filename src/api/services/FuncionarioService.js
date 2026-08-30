// src/api/services/FuncionarioService.js
const CargoDAO = require("../dao/CargoDAOMongo");
const FuncionarioDAO = require("../dao/FuncionarioDAOMongo");
const Cargo = require("../models/Cargo");
const Funcionario = require("../models/Funcionario");
const MeuTokenJWT = require("../http/MeuTokenJWT");
const ErrorResponse = require("../utils/ErrorResponse");
const logger = require("../utils/Logger");

/**
 * Classe responsável pela camada de serviço para a entidade Funcionario.
 * 
 * Observações sobre injeção de dependência:
 * - O FuncionarioService recebe uma instância de FuncionarioDAO via construtor.
 * - Isso desacopla o serviço da implementação concreta do DAO.
 * - Facilita testes unitários e uso de mocks.
 */
module.exports = class FuncionarioService {
    #funcionarioDAO;
    #cargoDAO;

    /**
     * Construtor da classe FuncionarioService
     * @param {FuncionarioDAO} funcionarioDAODependency - Instância de FuncionarioDAO
     * @param {CargoDAO} cargoDAODependency - Instância de CargoDAO
     */
    constructor(funcionarioDAODependency, cargoDAODependency) {
        logger.info('⬆️ FuncionarioService.constructor()');
        this.#funcionarioDAO = funcionarioDAODependency;
        this.#cargoDAO = cargoDAODependency;
        logger.debug('🔍 Dependências injetadas no FuncionarioService', {
            hasFuncionarioDAO: !!this.#funcionarioDAO,
            hasCargoDAO: !!this.#cargoDAO,
        });
    }

    /**
     * Cria um novo funcionário.
     *
     * @param {Object} jsonFuncionario - Objeto contendo dados do funcionário
     * @param {Object} jsonFuncionario.funcionario - Dados do funcionário
     * @param {string} requestBody.funcionario.nomeFuncionario - Nome do funcionário
     * @param {string} requestBody.funcionario.email - Email do funcionário
     * @param {string} requestBody.funcionario.senha - Senha do funcionário
     * @param {boolean} requestBody.funcionario.recebeValeTransporte - Se recebe vale transporte
     * @param {Object} requestBody.funcionario.cargo - Objeto cargo
     * @param {number} requestBody.funcionario.cargo.idCargo - ID do cargo
     *
     * @returns {Promise<Funcionario>} - Objeto Funcionario criado com ID atribuído
     * @throws {ErrorResponse} - Em caso de validação de dados inválidos ou email já existente
     *
     * @example
     * const funcionario = await funcionarioService.createFuncionario({ funcionario: {...} });
     */
    createFuncionario = async (jsonFuncionario) => {
        const method = 'FuncionarioService.createFuncionario';
        logger.debug(`🟣 ${method} - Iniciando criação de funcionário`, {
            email: jsonFuncionario.email,
            nomeFuncionario: jsonFuncionario.nomeFuncionario,
        });

        try {
            // Criar o cargo que será utilizado pelo funcionário
            const objetoCargo = new Cargo();
            objetoCargo.idCargo = jsonFuncionario.cargo.idCargo; // regra de domínio

            // Criação da instância Funcionario
            const objFuncionario = new Funcionario();

            // Aplica regra de domínio (chama os setters da classe Funcionario)
            objFuncionario.nomeFuncionario = jsonFuncionario.nomeFuncionario;
            objFuncionario.email = jsonFuncionario.email;
            objFuncionario.senha = jsonFuncionario.senha;
            objFuncionario.recebeValeTransporte = jsonFuncionario.recebeValeTransporte;
            objFuncionario.cargo = objetoCargo;

            // Regra de negócio: verificar se cargo fornecido existe antes de cadastrar
            const cargoExiste = await this.#cargoDAO.findByField("idCargo", objFuncionario.cargo.idCargo);
            if (cargoExiste.length === 0) {
                logger.warn(`⚠️ ${method} - Tentativa de cadastro com cargo inexistente`, {
                    idCargo: objFuncionario.cargo.idCargo,
                    email: objFuncionario.email,
                });
                throw new ErrorResponse(
                    400,
                    "O cargo informado não existe",
                    { message: `O cargo informado não existe` }
                );
            }

            // Regra de negócio: verificação de email duplicado
            const emailExiste = await this.#funcionarioDAO.findByField("email", objFuncionario.email);
            if (emailExiste.length > 0) {
                logger.warn(`⚠️ ${method} - Tentativa de cadastro com email já existente`, {
                    email: objFuncionario.email,
                });
                throw new ErrorResponse(
                    400,
                    "Já existe um Funcionário com o email fornecido",
                    { message: `O email ${objFuncionario.email} já está cadastrado` }
                );
            }

            // Persistência e atribuição de ID
            objFuncionario.idFuncionario = await this.#funcionarioDAO.create(objFuncionario);

            logger.info(`✅ ${method} - Funcionário criado com sucesso`, {
                idFuncionario: objFuncionario.idFuncionario,
                email: objFuncionario.email,
                nomeFuncionario: objFuncionario.nomeFuncionario,
            });

            return objFuncionario;
        } catch (error) {
            logger.error(`❌ ${method} - Erro ao criar funcionário`, {
                email: jsonFuncionario?.email,
                error: error.message,
                stack: error.stack,
            });
            throw error;
        }
    };

    /**
     * Realiza o login de um funcionário.
     *
     * 🔹 Regra de aplicação: valida as credenciais do usuário e retorna um token JWT.
     *
     * @param {Object} jsonFuncionario - Objeto contendo os dados de login.
     * @param {Object} jsonFuncionario.funcionario - Dados do funcionário para login.
     * @param {string} requestBody.funcionario.email - Email do funcionário.
     * @param {string} requestBody.funcionario.senha - Senha do funcionário.
     *
     * @returns {Promise<Object>} - Retorna um objeto contendo:
     *                              { user: { idFuncionario, name, email, role }, token }
     *
     * @throws {ErrorResponse} - Lança erro 401 se usuário ou senha forem inválidos,
     *                            ou erro 500 em caso de falha interna.
     *
     * @example
     * const resultado = await funcionarioService.loginFuncionario({
     *   funcionario: { email: "teste@dominio.com", senha: "123456" }
     * });
     * console.log(resultado.user, resultado.token);
     */
    loginFuncionario = async (jsonFuncionario) => {
        const method = 'FuncionarioService.loginFuncionario';
        logger.debug(`🟣 ${method} - Tentativa de login`, {
            email: jsonFuncionario.email,
        });

        try {
            const objetoFuncionario = new Funcionario();
            objetoFuncionario.email = jsonFuncionario.email;
            objetoFuncionario.senha = jsonFuncionario.senha;

            // Consulta no DAO
            const encontrado = await this.#funcionarioDAO.login(objetoFuncionario);

            if (!encontrado) {
                logger.warn(`⚠️ ${method} - Falha no login: credenciais inválidas`, {
                    email: jsonFuncionario.email,
                });
                throw new ErrorResponse(401, "Usuário ou senha inválidos", {
                    message: "Não foi possível realizar autenticação",
                });
            }

            // Geração de token JWT
            const jwt = new MeuTokenJWT();
            const user = {
                funcionario: {
                    email: encontrado.email,
                    role: encontrado.cargo?.nomeCargo || null,
                    name: encontrado.nomeFuncionario || null,
                    idFuncionario: encontrado.idFuncionario,
                },
            };

            const token = jwt.gerarToken(user.funcionario);

            logger.info(`✅ ${method} - Login bem-sucedido`, {
                idFuncionario: encontrado.idFuncionario,
                email: encontrado.email,
            });

            return { user, token };
        } catch (error) {
            logger.error(`❌ ${method} - Erro durante login`, {
                email: jsonFuncionario?.email,
                error: error.message,
                stack: error.stack,
            });
            throw error;
        }
    };

    /**
     * Retorna todos os funcionários
     * @returns {Promise<Funcionario[]>} - Lista de funcionários
     */
    findAll = async () => {
        const method = 'FuncionarioService.findAll';
        logger.debug(`🟣 ${method} - Buscando todos os funcionários`);

        try {
            const funcionarios = await this.#funcionarioDAO.findAll();
            logger.info(`✅ ${method} - ${funcionarios.length} funcionários encontrados`);
            return funcionarios;
        } catch (error) {
            logger.error(`❌ ${method} - Erro ao buscar todos os funcionários`, {
                error: error.message,
                stack: error.stack,
            });
            throw error;
        }
    };

    /**
     * Retorna um funcionário pelo ID
     * @param {number} idFuncionario - ID do funcionário
     * @returns {Promise<Funcionario>} - Objeto Funcionario encontrado
     * @throws {ErrorResponse} - Em caso de ID inválido ou funcionário não encontrado
     */
    findById = async (idFuncionario) => {
        const method = 'FuncionarioService.findById';
        logger.debug(`🟣 ${method} - Buscando funcionário por ID`, { idFuncionario });

        try {
            const objFuncionario = new Funcionario();
            objFuncionario.idFuncionario = idFuncionario;

            const funcionario = await this.#funcionarioDAO.findById(objFuncionario.idFuncionario);

            if (!funcionario) {
                logger.warn(`⚠️ ${method} - Funcionário não encontrado`, { idFuncionario });
                throw new ErrorResponse(404, "Funcionário não encontrado", {
                    message: `Não existe funcionário com id ${idFuncionario}`,
                });
            }

            logger.info(`✅ ${method} - Funcionário encontrado`, { idFuncionario });
            return funcionario;
        } catch (error) {
            logger.error(`❌ ${method} - Erro ao buscar funcionário ${idFuncionario}`, {
                idFuncionario,
                error: error.message,
                stack: error.stack,
            });
            throw error;
        }
    };

    /**
     * Atualiza um funcionário
     * @param {number} idFuncionario - ID do funcionário
     * @param {Object} requestBody - Dados atualizados do funcionário
     * @returns {Promise<Funcionario>} - Objeto Funcionario atualizado
     * @throws {ErrorResponse} - Em caso de dados inválidos
     */
    updateFuncionario = async (idFuncionario, requestBody) => {
        const method = 'FuncionarioService.updateFuncionario';
        const jsonFuncionario = requestBody.funcionario;
        logger.debug(`🟣 ${method} - Atualizando funcionário`, {
            idFuncionario,
            email: jsonFuncionario?.email,
            nomeFuncionario: jsonFuncionario?.nomeFuncionario,
        });

        try {
            const objCargo = new Cargo();
            objCargo.idCargo = jsonFuncionario.cargo.idCargo;

            // Validação das regras de domínio
            const objFuncionario = new Funcionario();
            objFuncionario.idFuncionario = idFuncionario;
            objFuncionario.nomeFuncionario = jsonFuncionario.nomeFuncionario;
            objFuncionario.email = jsonFuncionario.email;
            objFuncionario.senha = jsonFuncionario.senha;
            objFuncionario.recebeValeTransporte = jsonFuncionario.recebeValeTransporte;
            objFuncionario.cargo = objCargo;

            // Envia um objeto válido de funcionário para atualizar
            const atualizado = await this.#funcionarioDAO.update(objFuncionario);

            if (atualizado) {
                logger.info(`✅ ${method} - Funcionário ${idFuncionario} atualizado com sucesso`, {
                    email: jsonFuncionario.email,
                });
            } else {
                logger.warn(`⚠️ ${method} - Funcionário ${idFuncionario} não encontrado para atualização`);
            }

            return atualizado;
        } catch (error) {
            logger.error(`❌ ${method} - Erro ao atualizar funcionário ${idFuncionario}`, {
                idFuncionario,
                error: error.message,
                stack: error.stack,
            });
            throw error;
        }
    };

    /**
     * Exclui um funcionário
     * @param {number} idFuncionario - ID do funcionário
     * @returns {Promise<boolean>} - True se excluído com sucesso
     * @throws {ErrorResponse} - Em caso de ID inválido
     */
    deleteFuncionario = async (idFuncionario) => {
        const method = 'FuncionarioService.deleteFuncionario';
        logger.debug(`🟣 ${method} - Excluindo funcionário`, { idFuncionario });

        try {
            const funcionario = new Funcionario();
            funcionario.idFuncionario = idFuncionario;

            const excluido = await this.#funcionarioDAO.delete(funcionario);

            if (excluido) {
                logger.info(`✅ ${method} - Funcionário ${idFuncionario} excluído com sucesso`);
            } else {
                logger.warn(`⚠️ ${method} - Funcionário ${idFuncionario} não encontrado para exclusão`);
            }

            return excluido;
        } catch (error) {
            logger.error(`❌ ${method} - Erro ao excluir funcionário ${idFuncionario}`, {
                idFuncionario,
                error: error.message,
                stack: error.stack,
            });
            throw error;
        }
    };
};