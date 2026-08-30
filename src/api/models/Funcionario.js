const Cargo = require("./Cargo");

/**
 * Representa a entidade Funcionario do sistema.
 * 
 * Objetivo:
 * - Encapsular os dados de um funcionário.
 * - Garantir integridade dos atributos via getters e setters.
 * - Associar corretamente um funcionário a um Cargo.
 */
module.exports = class Funcionario {

    // Atributos privados
    #idFuncionario;
    #cargo;
    #nomeFuncionario;
    #email;
    #senha;
    #recebeValeTransporte;

    /**
     * Getter e Setter para idFuncionario
     * @returns {number} Identificador do funcionário
     */
    get idFuncionario() {
        return this.#idFuncionario;
    }

    /**
     * Define o ID do funcionário.
     *
     * 🔹 Regra de domínio: garante que o ID seja sempre um número inteiro positivo.
     *
     * @param {number} valor - Número inteiro positivo representando o ID do funcionário.
     * @throws {Error} - Lança erro se o valor não for número, não for inteiro ou for menor/igual a zero.
     *
     * @example
     * funcionario.idFuncionario = 10; // ✅ válido
     * funcionario.idFuncionario = -5; // ❌ lança erro
     * funcionario.idFuncionario = 0;  // ❌ lança erro
     * funcionario.idFuncionario = 3.14; // ❌ lança erro
     * funcionario.idFuncionario = null; // ❌ lança erro
     */
    set idFuncionario(valor) {
        // Converte o valor para número para aceitar tanto strings numéricas quanto numbers
        const parsed = Number(valor);



        // Atribui valor válido ao atributo privado
        this.#idFuncionario = parsed;
    }

    /**
     * Getter e Setter para cargo
     * @returns {Cargo} Objeto Cargo associado
     */
    get cargo() {
        return this.#cargo;
    }

    /**
     * Define o Cargo do funcionário.
     *
     * 🔹 Regra de domínio: garante que sempre exista um Cargo válido associado.
     *
     * @param {Cargo} value - Instância válida da classe Cargo.
     * @throws {Error} - Lança erro se o valor não for uma instância de Cargo.
     *
     * @example
     * funcionario.cargo = new Cargo({ idCargo: 1, nomeCargo: "Gerente" }); // ✅ válido
     * funcionario.cargo = null;  // ❌ lança erro
     */
    set cargo(value) {
        // Verifica se é instância válida de Cargo
        if (!(value instanceof Cargo)) {
            throw new Error("cargo deve ser uma instância válida de Cargo.");
        }

        // Atribui valor ao atributo privado
        this.#cargo = value;
    }

    /**
     * Getter e Setter para nomeFuncionario
     * @returns {string} Nome do funcionário
     */
    get nomeFuncionario() {
        return this.#nomeFuncionario;
    }

    /**
     * Define o nome do funcionário.
     *
     * 🔹 Regra de domínio: garante que o nome seja sempre uma string não vazia
     * e com pelo menos 3 caracteres.
     *
     * @param {string} value - Nome do funcionário.
     * @throws {Error} - Lança erro se o valor não for string, estiver vazio ou tiver menos de 3 caracteres.
     *
     * @example
     * funcionario.nomeFuncionario = "João Silva"; // ✅ válido
     * funcionario.nomeFuncionario = "Al";        // ❌ lança erro
     * funcionario.nomeFuncionario = null;        // ❌ lança erro
     */
    set nomeFuncionario(value) {
        // Verifica se é string
        if (typeof value !== "string") {
            throw new Error("nomeFuncionario deve ser uma string.");
        }

        const nome = value.trim();

        // Verifica tamanho mínimo
        if (nome.length < 3) {
            throw new Error("nomeFuncionario deve ter pelo menos 3 caracteres.");
        }

        // Atribui valor ao atributo privado
        this.#nomeFuncionario = nome;
    }

    /**
     * Getter e Setter para email
     * @returns {string} Email do funcionário
     */
    get email() {
        return this.#email;
    }

    /**
     * Define o email do funcionário.
     *
     * 🔹 Regra de domínio: garante que o email seja válido, não vazio e no formato correto.
     *
     * @param {string} value - Email do funcionário.
     * @throws {Error} - Lança erro se o valor não for string, estiver vazio ou não corresponder ao formato de email.
     *
     * @example
     * funcionario.email = "teste@dominio.com"; // ✅ válido
     * funcionario.email = "email_invalido";    // ❌ lança erro
     */
    set email(value) {
        // Verifica se é string
        if (typeof value !== "string") {
            throw new Error("email deve ser uma string.");
        }

        const emailTrimmed = value.trim();

        // Verifica se não está vazio
        if (emailTrimmed === "") {
            throw new Error("email não pode ser vazio.");
        }

        // Valida formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailTrimmed)) {
            throw new Error("email em formato inválido.");
        }

        // Atribui valor ao atributo privado
        this.#email = emailTrimmed;
    }

    /**
     * Getter e Setter para senha
     * @returns {string} Senha do funcionário
     */
    get senha() {
        return this.#senha;
    }

    /**
     * Define a senha do funcionário.
     *
     * 🔹 Regra de domínio: garante que a senha seja sempre uma string não vazia
     * e que atenda aos critérios de segurança (mínimo 6 caracteres, 1 número, 1 maiúscula, 1 caractere especial).
     *
     * @param {string} value - Senha do funcionário.
     * @throws {Error} - Lança erro se o valor não for string, estiver vazio ou não atender aos critérios de segurança.
     *
     * @example
     * funcionario.senha = "Senha@123"; // ✅ válido
     * funcionario.senha = "123";       // ❌ lança erro (menos de 6 caracteres)
     * funcionario.senha = "abcdef";    // ❌ lança erro (sem maiúscula, número ou caractere especial)
     * funcionario.senha = null;        // ❌ lança erro
     */
    set senha(value) {
        // Verifica se é string
        if (typeof value !== "string") {
            throw new Error("senha deve ser uma string.");
        }

        const senhaTrimmed = value.trim();

        // Verifica se não está vazia
        if (senhaTrimmed === "") {
            throw new Error("senha não pode ser vazia.");
        }

        // Verifica tamanho mínimo
        if (senhaTrimmed.length < 6) {
            throw new Error("senha deve ter pelo menos 6 caracteres.");
        }

        // Verifica se contém pelo menos uma letra maiúscula
        if (!/[A-Z]/.test(senhaTrimmed)) {
            throw new Error("senha deve conter pelo menos uma letra maiúscula.");
        }

        // Verifica se contém pelo menos um número
        if (!/[0-9]/.test(senhaTrimmed)) {
            throw new Error("senha deve conter pelo menos um número.");
        }

        // Verifica se contém pelo menos um caractere especial
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(senhaTrimmed)) {
            throw new Error("senha deve conter pelo menos um caractere especial.");
        }

        // Atribui valor ao atributo privado
        this.#senha = senhaTrimmed;
    }
    /**
     * Getter e Setter para recebeValeTransporte
     * @returns {number} 0 ou 1
     */
    get recebeValeTransporte() {
        return this.#recebeValeTransporte;
    }

    /**
     * Define se o funcionário recebe vale transporte.
     *
     * 🔹 Regra de domínio: garante que o valor seja sempre 0 (não) ou 1 (sim).
     *
     * @param {number} value - 0 ou 1.
     * @throws {Error} - Lança erro se o valor não for 0 ou 1.
     *
     * @example
     * funcionario.recebeValeTransporte = 1; // ✅ válido
     * funcionario.recebeValeTransporte = 0; // ✅ válido
     * funcionario.recebeValeTransporte = null; // ❌ lança erro
     */
    set recebeValeTransporte(value) {
        // Verifica se é 0 ou 1
        if (![0, 1].includes(value)) {
            throw new Error("recebeValeTransporte deve ser 0 ou 1.");
        }

        // Atribui valor ao atributo privado
        this.#recebeValeTransporte = value;
    }
}
