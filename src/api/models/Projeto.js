module.exports = class Projeto {
    #id;
    #tema;
    #curso;
    #representante;
    #integrantes;
    #equipamento;
    #outrosRecursos;
    #observacoes;
    #dataCadastro;

    constructor() {
        console.log("⬆️ Projeto.constructor()");

        this.#integrantes = [];
        this.#outrosRecursos = null;
        this.#observacoes = null;
        this.#dataCadastro = new Date();
    }

    get id() {
        return this.#id;
    }

    set id(value) {
        if (!value) {
            throw new Error("id é obrigatório.");
        }

        this.#id = value.toString();
    }

    get tema() {
        return this.#tema;
    }

    set tema(value) {
        if (typeof value !== "string" || value.trim().length < 3) {
            throw new Error(
                "tema deve ser uma string com pelo menos 3 caracteres."
            );
        }

        this.#tema = value.trim();
    }

    // Mantém compatibilidade com o nome antigo "titulo".
    get titulo() {
        return this.#tema;
    }

    set titulo(value) {
        this.tema = value;
    }

    get curso() {
        return this.#curso;
    }

    set curso(value) {
        if (typeof value !== "string") {
            throw new Error("curso deve ser uma string.");
        }

        const normalizarCurso = valor =>
            String(valor)
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .trim()
                .toUpperCase();

        const cursosPermitidos = [
            "ADMINISTRACAO",
            "ANALISES CLINICAS",
            "ELETRONICA",
            "INFORMATICA",
            "PUBLICIDADE",
            "QUIMICA"
        ];

        const cursoNormalizado = normalizarCurso(value);

        if (!cursosPermitidos.includes(cursoNormalizado)) {
            throw new Error(
                "curso deve ser um dos seguintes: ADMINISTRAÇÃO, ANÁLISES CLÍNICAS, ELETRÔNICA, INFORMÁTICA, PUBLICIDADE, QUÍMICA"
            );
        }

        const cursoFormatado = {
            ADMINISTRACAO: "ADMINISTRAÇÃO",
            "ANALISES CLINICAS": "ANÁLISES CLÍNICAS",
            ELETRONICA: "ELETRÔNICA",
            INFORMATICA: "INFORMÁTICA",
            PUBLICIDADE: "PUBLICIDADE",
            QUIMICA: "QUÍMICA"
        };

        this.#curso = cursoFormatado[cursoNormalizado];
    }

    get representante() {
        return this.#representante;
    }

    set representante(value) {
        this.#representante = this.#validarParticipante(
            value,
            true,
            "representante"
        );
    }

    get integrantes() {
        return this.#integrantes;
    }

    set integrantes(value) {
        if (!Array.isArray(value)) {
            throw new Error("integrantes deve ser um array.");
        }

        // O representante mais 9 integrantes totalizam 10 estudantes.
        if (value.length > 9) {
            throw new Error(
                "O projeto pode ter no máximo 10 estudantes, incluindo o representante."
            );
        }

        this.#integrantes = value.map((integrante, index) =>
            this.#validarParticipante(
                integrante,
                false,
                `integrante ${index + 2}`
            )
        );

        this.validarMatriculasUnicas();
    }

    get equipamento() {
        return this.#equipamento;
    }

    set equipamento(value) {
        const equipamentosPermitidos = [
            "EQUIPE TRAZ SEU COMPUTADOR",
            "COMPUTADOR DA ESCOLA"
        ];

        if (typeof value !== "string") {
            throw new Error("equipamento deve ser uma string.");
        }

        const equipamento = value.trim().toUpperCase();

        if (!equipamentosPermitidos.includes(equipamento)) {
            throw new Error(
                `equipamento deve ser: ${equipamentosPermitidos.join(" ou ")}`
            );
        }

        this.#equipamento = equipamento;
    }

    get outrosRecursos() {
        return this.#outrosRecursos;
    }

    set outrosRecursos(value) {
        if (value === undefined || value === null || value === "") {
            this.#outrosRecursos = null;
            return;
        }

        if (typeof value !== "string") {
            throw new Error("outrosRecursos deve ser uma string.");
        }

        this.#outrosRecursos = value.trim() || null;
    }

    get observacoes() {
        return this.#observacoes;
    }

    set observacoes(value) {
        if (value === undefined || value === null || value === "") {
            this.#observacoes = null;
            return;
        }

        if (typeof value !== "string") {
            throw new Error("observacoes deve ser uma string.");
        }

        this.#observacoes = value.trim() || null;
    }

    get dataCadastro() {
        return this.#dataCadastro;
    }

    validarMatriculasUnicas() {
        if (!this.#representante) {
            return;
        }

        const matriculas = [
            this.#representante.matricula,
            ...this.#integrantes.map(integrante => integrante.matricula)
        ];

        if (new Set(matriculas).size !== matriculas.length) {
            throw new Error(
                "O mesmo estudante não pode aparecer mais de uma vez no projeto."
            );
        }
    }

    #validarParticipante(value, emailObrigatorio, descricao) {
        if (!value || typeof value !== "object" || Array.isArray(value)) {
            throw new Error(`${descricao} deve ser um objeto.`);
        }

        if (
            typeof value.nome !== "string" ||
            value.nome.trim().length < 3
        ) {
            throw new Error(
                `O nome do ${descricao} deve ter pelo menos 3 caracteres.`
            );
        }

        if (
            typeof value.matricula !== "string" ||
            value.matricula.trim() === ""
        ) {
            throw new Error(
                `A matrícula do ${descricao} é obrigatória.`
            );
        }

        if (
            typeof value.turma !== "string" ||
            value.turma.trim() === ""
        ) {
            throw new Error(
                `A turma do ${descricao} é obrigatória.`
            );
        }

        let email = null;

        if (value.email !== undefined && value.email !== null && value.email !== "") {
            email = value.email.trim().toLowerCase();

            const formatoEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!formatoEmail.test(email)) {
                throw new Error(
                    `O e-mail do ${descricao} está em formato inválido.`
                );
            }
        }

        if (emailObrigatorio && !email) {
            throw new Error(
                `O e-mail do ${descricao} é obrigatório.`
            );
        }

        return {
            nome: value.nome.trim(),
            matricula: value.matricula.trim(),
            turma: value.turma.trim().toUpperCase(),
            email
        };
    }

    toJSON() {
        return {
            id: this.#id,
            tema: this.#tema,
            curso: this.#curso,
            representante: this.#representante,
            integrantes: this.#integrantes,
            equipamento: this.#equipamento,
            outrosRecursos: this.#outrosRecursos,
            observacoes: this.#observacoes,
            dataCadastro: this.#dataCadastro
        };
    }
};