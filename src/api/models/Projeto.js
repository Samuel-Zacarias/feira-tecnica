const Aluno = require("./Aluno");

module.exports = class Projeto {
    #id;
    #titulo;
    #descricao;
    #alunos;

    constructor() {
        console.log("⬆️  Projeto.constructor()");
        this.#alunos = []; // inicializa array vazio
    }

    get id() { return this.#id; }
    set id(value) {
        if (!value) throw new Error("id é obrigatório.");
        this.#id = value.toString();
    }

    get titulo() { return this.#titulo; }
    set titulo(value) {
        if (typeof value !== 'string' || value.trim().length < 3) {
            throw new Error("titulo deve ser uma string com pelo menos 3 caracteres.");
        }
        this.#titulo = value.trim();
    }

    get descricao() { return this.#descricao; }
    set descricao(value) {
        if (value === undefined || value === null) {
            this.#descricao = null;
            return;
        }
        if (typeof value !== 'string') {
            throw new Error("descricao deve ser uma string ou null.");
        }
        this.#descricao = value.trim() || null; // permite vazio, mas guarda null
    }

    get alunos() { return this.#alunos; }
    set alunos(value) {
        if (!Array.isArray(value)) {
            throw new Error("alunos deve ser um array.");
        }
        if (value.length > 10) {
            throw new Error("alunos não pode ter mais de 10 integrantes.");
        }
        // Verifica se todos os elementos são instâncias de Aluno
        for (const item of value) {
            if (!(item instanceof Aluno)) {
                throw new Error("Cada elemento de alunos deve ser uma instância de Aluno.");
            }
        }
        this.#alunos = value.slice(); // faz cópia para evitar mutação externa
    }

    // Método para adicionar um aluno (opcional, facilita)
    addAluno(aluno) {
        if (!(aluno instanceof Aluno)) {
            throw new Error("aluno deve ser uma instância de Aluno.");
        }
        if (this.#alunos.length >= 10) {
            throw new Error("Limite máximo de 10 alunos atingido.");
        }
        this.#alunos.push(aluno);
    }

    // Método para remover um aluno (opcional)
    removeAluno(aluno) {
        const index = this.#alunos.indexOf(aluno);
        if (index === -1) {
            throw new Error("Aluno não encontrado no projeto.");
        }
        this.#alunos.splice(index, 1);
    }
};