// api/models/Avaliacao.js
const Projeto = require("./Projeto");

/**
 * Representa a entidade Avaliacao de um projeto.
 * 
 * Cada critério é um atributo específico, facilitando consultas e validações.
 * 
 * Critérios sugeridos:
 * - criatividade (0-10)
 * - relevancia (0-10)
 * - viabilidade (0-10)
 * - apresentacao (0-10)
 * - conhecimentoTecnico (0-10)
 * - funcionalidade (0-10)
 * - sustentabilidade (0-10)
 * - trabalhoEquipe (0-10)
 * - originalidade (0-10)
 * - potencialMercado (0-10)
 */
module.exports = class Avaliacao {
    #id;
    #projeto;        // referência ao Projeto (objeto ou ID)
    #avaliador;      // nome ou ID do avaliador
    #data;
    #criatividade;
    #relevancia;
    #viabilidade;
    #apresentacao;
    #conhecimentoTecnico;
    #funcionalidade;
    #sustentabilidade;
    #trabalhoEquipe;
    #originalidade;
    #potencialMercado;
    #comentarios;    // array de objetos { texto, data, avaliador }
    #notaFinal;      // calculada automaticamente
    #status;         // "Em análise", "Aprovado", "Reprovado", "Classificado"

    constructor() {
        console.log("⬆️  Avaliacao.constructor()");
        this.#comentarios = [];
        this.#data = new Date();
        this.#status = "Em análise";
    }

    // Getters e Setters

    get id() {
        return this.#id;
    }
    set id(value) {
        if (!value) throw new Error("id é obrigatório.");
        this.#id = value.toString();
    }

    get projeto() {
        return this.#projeto;
    }
    set projeto(value) {
        if (!(value instanceof Projeto) && typeof value !== 'string') {
            throw new Error("projeto deve ser uma instância de Projeto ou um ID");
        }
        this.#projeto = value;
    }

    get avaliador() {
        return this.#avaliador;
    }
    set avaliador(value) {
        if (typeof value !== 'string' || value.trim() === '') {
            throw new Error("avaliador deve ser uma string não vazia.");
        }
        this.#avaliador = value.trim();
    }

    get data() {
        return this.#data;
    }
    // data é definida apenas no construtor

    // Critérios individuais (todos com validação 0-10)

    get criatividade() { return this.#criatividade; }
    set criatividade(value) {
        this.#validarNota(value, 'criatividade');
        this.#criatividade = value;
        this.#calcularNotaFinal();
    }

    get relevancia() { return this.#relevancia; }
    set relevancia(value) {
        this.#validarNota(value, 'relevancia');
        this.#relevancia = value;
        this.#calcularNotaFinal();
    }

    get viabilidade() { return this.#viabilidade; }
    set viabilidade(value) {
        this.#validarNota(value, 'viabilidade');
        this.#viabilidade = value;
        this.#calcularNotaFinal();
    }

    get apresentacao() { return this.#apresentacao; }
    set apresentacao(value) {
        this.#validarNota(value, 'apresentacao');
        this.#apresentacao = value;
        this.#calcularNotaFinal();
    }

    get conhecimentoTecnico() { return this.#conhecimentoTecnico; }
    set conhecimentoTecnico(value) {
        this.#validarNota(value, 'conhecimentoTecnico');
        this.#conhecimentoTecnico = value;
        this.#calcularNotaFinal();
    }

    get funcionalidade() { return this.#funcionalidade; }
    set funcionalidade(value) {
        this.#validarNota(value, 'funcionalidade');
        this.#funcionalidade = value;
        this.#calcularNotaFinal();
    }

    get sustentabilidade() { return this.#sustentabilidade; }
    set sustentabilidade(value) {
        this.#validarNota(value, 'sustentabilidade');
        this.#sustentabilidade = value;
        this.#calcularNotaFinal();
    }

    get trabalhoEquipe() { return this.#trabalhoEquipe; }
    set trabalhoEquipe(value) {
        this.#validarNota(value, 'trabalhoEquipe');
        this.#trabalhoEquipe = value;
        this.#calcularNotaFinal();
    }

    get originalidade() { return this.#originalidade; }
    set originalidade(value) {
        this.#validarNota(value, 'originalidade');
        this.#originalidade = value;
        this.#calcularNotaFinal();
    }

    get potencialMercado() { return this.#potencialMercado; }
    set potencialMercado(value) {
        this.#validarNota(value, 'potencialMercado');
        this.#potencialMercado = value;
        this.#calcularNotaFinal();
    }

    // Comentários

    get comentarios() {
        return this.#comentarios;
    }

    addComentario(texto) {
        if (typeof texto !== 'string' || texto.trim() === '') {
            throw new Error("Comentário deve ser uma string não vazia");
        }
        this.#comentarios.push({
            texto: texto.trim(),
            data: new Date(),
            avaliador: this.#avaliador
        });
    }

    // Nota Final (calculada automaticamente)

    get notaFinal() {
        return this.#notaFinal;
    }

    #calcularNotaFinal() {
        const notas = [
            this.#criatividade,
            this.#relevancia,
            this.#viabilidade,
            this.#apresentacao,
            this.#conhecimentoTecnico,
            this.#funcionalidade,
            this.#sustentabilidade,
            this.#trabalhoEquipe,
            this.#originalidade,
            this.#potencialMercado
        ].filter(n => n !== undefined && n !== null);

        if (notas.length === 0) {
            this.#notaFinal = null;
            return;
        }
        this.#notaFinal = notas.reduce((a, b) => a + b, 0) / notas.length;
    }

    // Status

    get status() {
        return this.#status;
    }
    set status(value) {
        const permitidos = ['Em análise', 'Aprovado', 'Reprovado', 'Classificado'];
        if (!permitidos.includes(value)) {
            throw new Error(`status deve ser um dos: ${permitidos.join(', ')}`);
        }
        this.#status = value;
    }

    // Método auxiliar de validação
    #validarNota(value, nomeCampo) {
        if (typeof value !== 'number' || isNaN(value) || value < 0 || value > 10) {
            throw new Error(`${nomeCampo} deve ser um número entre 0 e 10.`);
        }
    }

    // Para conversão em JSON (útil para respostas da API)
    toJSON() {
        return {
            id: this.#id,
            projeto: this.#projeto,
            avaliador: this.#avaliador,
            data: this.#data,
            criatividade: this.#criatividade,
            relevancia: this.#relevancia,
            viabilidade: this.#viabilidade,
            apresentacao: this.#apresentacao,
            conhecimentoTecnico: this.#conhecimentoTecnico,
            funcionalidade: this.#funcionalidade,
            sustentabilidade: this.#sustentabilidade,
            trabalhoEquipe: this.#trabalhoEquipe,
            originalidade: this.#originalidade,
            potencialMercado: this.#potencialMercado,
            comentarios: this.#comentarios,
            notaFinal: this.#notaFinal,
            status: this.#status
        };
    }
};