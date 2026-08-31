const Professor = require("./Professor");

module.exports = class Projeto {
    #id;
    #titulo;
    #descricao;
    #Professores;

    constructor() {
        console.log("⬆️  Projeto.constructor()");
        this.#Professores = []; // inicializa array vazio
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

    get Professores() { return this.#Professores; }
    set Professores(value) {
        if (!Array.isArray(value)) {
            throw new Error("Professores deve ser um array.");
        }
        if (value.length > 10) {
            throw new Error("Professores não pode ter mais de 10 integrantes.");
        }
        // Verifica se todos os elementos são instâncias de Professor               
        for (const item of value) {
            if (!(item instanceof Professor)) {
                throw new Error("Cada elemento de Professores deve ser uma instância de Professor.");
            }
        }
        this.#Professores = value.slice(); // faz cópia para evitar mutação externa
    }

    // Método para adicionar um professor (opcional, facilita)
    addProfessor(professor) {
        if (!(professor instanceof Professor)) {
            throw new Error("professor deve ser uma instância de Professor.");
        }
        if (this.#Professores.length >= 10) {
            throw new Error("Limite máximo de 10 professores atingido.");
        }
        this.#Professores.push(professor);
    }

    // Método para remover um professor (opcional)
    removeProfessor(professor) {
        const index = this.#Professores.indexOf(professor);
        if (index === -1) {
            throw new Error("Professor não encontrado no projeto.");
        }
        this.#Professores.splice(index, 1);
    }
};