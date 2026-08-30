// api/models/Aluno.js

/**
 * Representa a entidade Aluno do sistema.
 * 
 * Objetivo:
 * - Encapsular os dados de um aluno.
 * - Garantir integridade dos atributos via getters e setters.
 */
module.exports = class Aluno {
    // Atributos privados
    #id;
    #matricula;
    #nome;
    #nascimento;
    #cpf;
    #curso;
    #turma;

    constructor() {
        console.log("⬆️  Aluno.constructor()");
    }

    /**
     * Getter para id
     * @returns {string} Identificador único do aluno
     */
    get id() {
        return this.#id;
    }

    /**
     * Define o ID do aluno.
     *
     * 🔹 Regra de domínio: deve ser uma string não vazia.
     *
     * @param {string} value - ID do aluno.
     * @throws {Error} - Se o valor for vazio.
     */
    set id(value) {
        if (!value) {
            throw new Error("id é obrigatório.");
        }
        this.#id = value.toString();
    }

    /**
     * Getter para matricula
     * @returns {string} Número de matrícula do aluno
     */
    get matricula() {
        return this.#matricula;
    }

    /**
     * Define a matrícula do aluno.
     *
     * 🔹 Regra de domínio: deve ser uma string não vazia.
     *
     * @param {string} value - Número de matrícula.
     * @throws {Error} - Se não for string ou estiver vazia.
     */
    set matricula(value) {
        if (!value || typeof value !== 'string' || value.trim() === '') {
            throw new Error("matricula é obrigatória e deve ser uma string não vazia.");
        }
        this.#matricula = value.trim();
    }

    /**
     * Getter para nome
     * @returns {string} Nome do aluno
     */
    get nome() {
        return this.#nome;
    }

    /**
     * Define o nome do aluno.
     *
     * 🔹 Regra de domínio: deve ser uma string com pelo menos 3 caracteres.
     *
     * @param {string} value - Nome do aluno.
     * @throws {Error} - Se não for string ou tiver menos de 3 caracteres.
     */
    set nome(value) {
        if (typeof value !== 'string' || value.trim().length < 3) {
            throw new Error("nome deve ser uma string com pelo menos 3 caracteres.");
        }
        this.#nome = value.trim();
    }

    /**
     * Getter para nascimento
     * @returns {Date} Data de nascimento do aluno
     */
    get nascimento() {
        return this.#nascimento;
    }

    /**
     * Define a data de nascimento do aluno.
     *
     * 🔹 Regra de domínio: deve ser uma data válida (não futura).
     *
     * @param {string|Date} value - Data de nascimento (string ISO ou objeto Date).
     * @throws {Error} - Se a data for inválida ou futura.
     */
    set nascimento(value) {
        let date;
        if (value instanceof Date) {
            date = value;
        } else if (typeof value === 'string') {
            date = new Date(value);
            if (isNaN(date.getTime())) {
                throw new Error("nascimento deve ser uma data válida (formato ISO ou Date).");
            }
        } else {
            throw new Error("nascimento deve ser uma data válida (string ISO ou Date).");
        }
        // Verifica se a data é futura
        if (date > new Date()) {
            throw new Error("nascimento não pode ser uma data futura.");
        }
        this.#nascimento = date;
    }

    /**
     * Getter para cpf
     * @returns {string} CPF do aluno (apenas números)
     */
    get cpf() {
        return this.#cpf;
    }

    /**
     * Define o CPF do aluno.
     *
     * 🔹 Regra de domínio: deve conter 11 dígitos e ser válido (algoritmo de validação).
     *
     * @param {string} value - CPF (pode conter formatação, será limpo).
     * @throws {Error} - Se o CPF for inválido.
     */
    set cpf(value) {
        if (typeof value !== 'string') {
            throw new Error("cpf deve ser uma string.");
        }
        const cpfLimpo = value.replace(/\D/g, '');
        if (cpfLimpo.length !== 11) {
            throw new Error("cpf deve conter 11 dígitos.");
        }
        if (!this.#validarCPF(cpfLimpo)) {
            throw new Error("cpf inválido.");
        }
        this.#cpf = cpfLimpo;
    }

    /**
     * Getter para curso
     * @returns {string} Nome do curso
     */
    get curso() {
        return this.#curso;
    }

    /**
     * Define o curso do aluno.
     *
     * 🔹 Regra de domínio: deve ser uma string com pelo menos 2 caracteres.
     *
     * @param {string} value - Nome do curso.
     * @throws {Error} - Se não for string ou tiver menos de 2 caracteres.
     */
    set curso(value) {
        if (typeof value !== 'string' || value.trim().length < 2) {
            throw new Error("curso deve ser uma string com pelo menos 2 caracteres.");
        }
        this.#curso = value.trim();
    }

    /**
     * Getter para turma
     * @returns {string} Identificador da turma
     */
    get turma() {
        return this.#turma;
    }

    /**
     * Define a turma do aluno.
     *
     * 🔹 Regra de domínio: deve ser uma string não vazia.
     *
     * @param {string} value - Identificador da turma.
     * @throws {Error} - Se não for string ou estiver vazia.
     */
    set turma(value) {
        if (typeof value !== 'string' || value.trim() === '') {
            throw new Error("turma deve ser uma string não vazia.");
        }
        this.#turma = value.trim();
    }

    /**
     * Validação de CPF (algoritmo dos dígitos verificadores).
     * @param {string} cpf - CPF com 11 dígitos.
     * @returns {boolean} true se válido, false caso contrário.
     */
    #validarCPF(cpf) {
        if (cpf.length !== 11) return false;
        // Elimina CPFs com todos os dígitos iguais
        if (/^(\d)\1{10}$/.test(cpf)) return false;
        // Validação do primeiro dígito verificador
        let soma = 0;
        for (let i = 0; i < 9; i++) {
            soma += parseInt(cpf.charAt(i)) * (10 - i);
        }
        let resto = 11 - (soma % 11);
        let digitoVerificador = resto >= 10 ? 0 : resto;
        if (parseInt(cpf.charAt(9)) !== digitoVerificador) return false;
        // Validação do segundo dígito verificador
        soma = 0;
        for (let i = 0; i < 10; i++) {
            soma += parseInt(cpf.charAt(i)) * (11 - i);
        }
        resto = 11 - (soma % 11);
        digitoVerificador = resto >= 10 ? 0 : resto;
        if (parseInt(cpf.charAt(10)) !== digitoVerificador) return false;
        return true;
    }
};