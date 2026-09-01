module.exports = class Professor {
    #id;
    #nome;
    #email;
    #senha;
    #role;

    constructor() {
        console.log("⬆️ Professor.constructor()");
        this.#role = "AVALIADOR";
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

    get nome() {
        return this.#nome;
    }

    set nome(value) {
        if (
            typeof value !== "string" ||
            value.trim().length < 3
        ) {
            throw new Error(
                "nome deve ter pelo menos 3 caracteres."
            );
        }

        this.#nome = value.trim();
    }

    get email() {
        return this.#email;
    }

    set email(value) {
        if (typeof value !== "string") {
            throw new Error(
                "email deve ser uma string."
            );
        }

        const email =
            value.trim().toLowerCase();

        const formatoEmail =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!formatoEmail.test(email)) {
            throw new Error(
                "email em formato inválido."
            );
        }

        this.#email = email;
    }

    get senha() {
        return this.#senha;
    }

    set senha(value) {
        if (
            typeof value !== "string" ||
            value.length < 8
        ) {
            throw new Error(
                "senha deve ter pelo menos 8 caracteres."
            );
        }

        if (!/[A-Z]/.test(value)) {
            throw new Error(
                "senha deve possuir uma letra maiúscula."
            );
        }

        if (!/[a-z]/.test(value)) {
            throw new Error(
                "senha deve possuir uma letra minúscula."
            );
        }

        if (!/[0-9]/.test(value)) {
            throw new Error(
                "senha deve possuir um número."
            );
        }

        if (
            !/[!@#$%^&*(),.?":{}|<>]/.test(value)
        ) {
            throw new Error(
                "senha deve possuir um caractere especial."
            );
        }

        this.#senha = value;
    }

    get role() {
        return this.#role;
    }

    set role(value) {
        const permitidos = [
            "ADMINISTRADOR",
            "AVALIADOR"
        ];

        if (typeof value !== "string") {
            throw new Error(
                "role deve ser uma string."
            );
        }

        const role =
            value.trim().toUpperCase();

        if (!permitidos.includes(role)) {
            throw new Error(
                `role deve ser: ${permitidos.join(" ou ")}.`
            );
        }

        this.#role = role;
    }

    // A senha nunca será devolvida nas respostas JSON.
    toJSON() {
        return {
            id: this.#id,
            nome: this.#nome,
            email: this.#email,
            role: this.#role
        };
    }
};