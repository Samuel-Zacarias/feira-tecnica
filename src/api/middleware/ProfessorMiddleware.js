const { ObjectId } = require("mongodb");
const ErrorResponse = require(
    "../utils/ErrorResponse"
);

module.exports = class ProfessorMiddleware {
    validateLoginBody = (
        request,
        response,
        next
    ) => {
        try {
            const professor =
                this.#getProfessor(request);

            if (!professor) {
                throw new Error(
                    "O campo 'professor' é obrigatório."
                );
            }

            this.#validarEmail(
                professor.email
            );

            if (
                typeof professor.senha !==
                    "string" ||
                professor.senha === ""
            ) {
                throw new Error(
                    "A senha é obrigatória."
                );
            }

            next();
        } catch (error) {
            next(
                this.#erroValidacao(
                    error.message
                )
            );
        }
    };

    validateCreateBody = (
        request,
        response,
        next
    ) => {
        try {
            const professor =
                this.#getProfessor(request);

            if (!professor) {
                throw new Error(
                    "O campo 'professor' é obrigatório."
                );
            }

            this.#validarNome(
                professor.nome
            );

            this.#validarEmail(
                professor.email
            );

            this.#validarSenha(
                professor.senha
            );

            this.#validarRole(
                professor.role ||
                "AVALIADOR"
            );

            next();
        } catch (error) {
            next(
                this.#erroValidacao(
                    error.message
                )
            );
        }
    };

    validateUpdateBody = (
        request,
        response,
        next
    ) => {
        try {
            const professor =
                this.#getProfessor(request);

            if (!professor) {
                throw new Error(
                    "O campo 'professor' é obrigatório."
                );
            }

            if (
                professor.nome !== undefined
            ) {
                this.#validarNome(
                    professor.nome
                );
            }

            if (
                professor.email !== undefined
            ) {
                this.#validarEmail(
                    professor.email
                );
            }

            if (
                professor.senha !== undefined &&
                professor.senha !== ""
            ) {
                this.#validarSenha(
                    professor.senha
                );
            }

            if (
                professor.role !== undefined
            ) {
                this.#validarRole(
                    professor.role
                );
            }

            next();
        } catch (error) {
            next(
                this.#erroValidacao(
                    error.message
                )
            );
        }
    };

    validateIdParam = (
        request,
        response,
        next
    ) => {
        const idProfessor =
            request.params.idProfessor;

        if (
            !idProfessor ||
            !ObjectId.isValid(idProfessor)
        ) {
            return next(
                new ErrorResponse(
                    400,
                    "ID de professor inválido",
                    {
                        message:
                            "O idProfessor deve ser um ObjectId válido."
                    }
                )
            );
        }

        next();
    };

    #getProfessor(request) {
        return (
            request.body.professor ||
            request.body.Professor
        );
    }

    #validarNome(nome) {
        if (
            typeof nome !== "string" ||
            nome.trim().length < 3
        ) {
            throw new Error(
                "O nome deve ter pelo menos 3 caracteres."
            );
        }
    }

    #validarEmail(email) {
        const formatoEmail =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (
            typeof email !== "string" ||
            !formatoEmail.test(email.trim())
        ) {
            throw new Error(
                "O e-mail informado é inválido."
            );
        }
    }

    #validarSenha(senha) {
        if (
            typeof senha !== "string" ||
            senha.length < 8
        ) {
            throw new Error(
                "A senha deve ter pelo menos 8 caracteres."
            );
        }

        if (!/[A-Z]/.test(senha)) {
            throw new Error(
                "A senha deve possuir uma letra maiúscula."
            );
        }

        if (!/[a-z]/.test(senha)) {
            throw new Error(
                "A senha deve possuir uma letra minúscula."
            );
        }

        if (!/[0-9]/.test(senha)) {
            throw new Error(
                "A senha deve possuir um número."
            );
        }

        if (
            !/[!@#$%^&*(),.?":{}|<>]/.test(
                senha
            )
        ) {
            throw new Error(
                "A senha deve possuir um caractere especial."
            );
        }
    }

    #validarRole(role) {
        const permitidos = [
            "ADMINISTRADOR",
            "AVALIADOR"
        ];

        if (
            typeof role !== "string" ||
            !permitidos.includes(
                role.trim().toUpperCase()
            )
        ) {
            throw new Error(
                `A função deve ser: ${permitidos.join(" ou ")}.`
            );
        }
    }

    #erroValidacao(message) {
        return new ErrorResponse(
            400,
            "Erro na validação de dados",
            {
                message
            }
        );
    }
};