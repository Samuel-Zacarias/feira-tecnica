const express = require("express");

module.exports = class ProfessorRouter {
    #router = express.Router();
    #jwt;
    #middleware;
    #controller;

    constructor(jwt, middleware, controller) {
        this.#jwt = jwt;
        this.#middleware = middleware;
        this.#controller = controller;
    }

    createRoutes = () => {
        this.#router.post("/login", this.#middleware.validateBody, this.#controller.login);

        const somenteAdmin = [
            this.#jwt.validateToken,
            this.#jwt.permitirRoles("ADMINISTRADOR"),
        ];

        this.#router.post("/", ...somenteAdmin, this.#middleware.validateBody, this.#controller.store);
        this.#router.get("/", ...somenteAdmin, this.#controller.index);
        this.#router.get("/:idProfessor", ...somenteAdmin, this.#middleware.validateIdParam, this.#controller.show);
        this.#router.put("/:idProfessor", ...somenteAdmin, this.#middleware.validateIdParam, this.#middleware.validateBody, this.#controller.update);
        this.#router.delete("/:idProfessor", ...somenteAdmin, this.#middleware.validateIdParam, this.#controller.destroy);

        return this.#router;
    };
};
