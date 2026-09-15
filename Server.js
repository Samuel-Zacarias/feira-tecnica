const cors = require("cors");
const express = require("express");
const path = require("path");

const MongoDatabase = require("./src/api/database/MongoDatabase");
const seedDatabase = require("./src/api/database/SeedDatabase");
const MeuTokenJWT = require("./src/api/http/MeuTokenJWT");
const { SESSION_COOKIE_NAME, clearSessionCookie } = require("./src/api/http/SessionCookie");
const JwtMiddleware = require("./src/api/middleware/JwtMiddleware");
const ProfessorMiddleware = require("./src/api/middleware/ProfessorMiddleware");
const ProjetoMiddleware = require("./src/api/middleware/ProjetoMiddleware");
const AvaliacaoMiddleware = require("./src/api/middleware/AvaliacaoMiddleware");
const AlunoMiddleware = require("./src/api/middleware/AlunoMiddleware");
const ProfessorDAOMongo = require("./src/api/dao/ProfessorDAOMongo");
const ProjetoDAOMongo = require("./src/api/dao/ProjetoDAOMongo");
const AvaliacaoDAOMongo = require("./src/api/dao/AvaliacaoDAOMongo");
const AlunoDAOMongo = require("./src/api/dao/AlunoDAOMongo");
const ProfessorService = require("./src/api/services/ProfessorService");
const ProjetoService = require("./src/api/services/ProjetoService");
const AvaliacaoService = require("./src/api/services/AvaliacaoService");
const AlunoService = require("./src/api/services/AlunoService");
const ProfessorController = require("./src/api/controllers/ProfessorController");
const ProjetoController = require("./src/api/controllers/ProjetoController");
const AvaliacaoController = require("./src/api/controllers/AvaliacaoController");
const AlunoController = require("./src/api/controllers/AlunoController");
const ProfessorRouter = require("./src/api/routes/ProfessorRouter");
const ProjetoRouter = require("./src/api/routes/ProjetoRouter");
const AvaliacaoRouter = require("./src/api/routes/AvaliacaoRouter");
const AlunoRouter = require("./src/api/routes/AlunoRouter");
const ErrorResponse = require("./src/api/utils/ErrorResponse");
const logger = require("./src/api/utils/Logger");

const PAGINAS_PROTEGIDAS = new Map([
    ["/aluno.html", ["ALUNO"]],
    ["/cracha-aluno.html", ["ALUNO"]],
    ["/dashboard.html", ["ADMINISTRADOR", "AVALIADOR"]],
    ["/projetos-consulta.html", ["ADMINISTRADOR", "AVALIADOR"]],
    ["/projetos-editar.html", ["ADMINISTRADOR"]],
    ["/avaliacoes-cadastro.html", ["ADMINISTRADOR", "AVALIADOR"]],
    ["/avaliacoes-consulta.html", ["ADMINISTRADOR", "AVALIADOR"]],
    ["/avaliacoes-editar.html", ["ADMINISTRADOR", "AVALIADOR"]],
    ["/professores-cadastro.html", ["ADMINISTRADOR"]],
    ["/professores-consulta.html", ["ADMINISTRADOR"]],
    ["/professores-editar.html", ["ADMINISTRADOR"]],
    ["/alunos-cadastro.html", ["ADMINISTRADOR"]],
    ["/alunos-consulta.html", ["ADMINISTRADOR"]],
    ["/receberExcel.html", ["ADMINISTRADOR"]],
]);

function lerCookies(request) {
    return Object.fromEntries(
        String(request.headers.cookie || "")
            .split(";")
            .map(parte => parte.trim())
            .filter(Boolean)
            .map(parte => {
                const separador = parte.indexOf("=");
                if (separador === -1) return [parte, ""];
                return [
                    parte.slice(0, separador),
                    decodeURIComponent(parte.slice(separador + 1)),
                ];
            })
    );
}

function obterSessao(request) {
    const token = lerCookies(request)[SESSION_COOKIE_NAME];
    if (!token) return null;

    const jwt = new MeuTokenJWT();
    return jwt.validarToken(token) ? jwt.payload : null;
}

module.exports = class Server {
    #porta;
    #app;
    #database;
    #jwtMiddleware;
    #projetoDAO;

    constructor(porta = 3000) {
        this.#porta = porta;
    }

    init = async () => {
        this.#app = express();
        this.#jwtMiddleware = new JwtMiddleware();

        this.#app.use(express.json({ limit: "6mb" }));
        this.#app.use(cors({ origin: true, credentials: true }));
        this.#configurarLogRequisicoes();
        this.#configurarSessaoWeb();
        this.#servirArquivosPublicos();

        this.#database = new MongoDatabase({
            host: "localhost",
            port: 27017,
            database: "feira-tecnica2026",
            user: "",
            password: "",
        });

        await this.#database.connect();
        await seedDatabase(this.#database);

        this.#configurarProfessor();
        this.#configurarAluno();
        this.#configurarProjeto();
        this.#configurarAvaliacao();
        this.#configurarErros();
    };

    #configurarLogRequisicoes() {
        this.#app.use((request, response, next) => {
            logger.debug(`${request.method} ${request.originalUrl}`, {
                ip: request.ip,
                userAgent: request.headers["user-agent"],
            });
            next();
        });
    }

    #configurarSessaoWeb() {
        this.#app.get("/", (request, response) => {
            response.redirect(302, "/login.html");
        });

        this.#app.post("/api/v1/sessao/logout", (request, response) => {
            clearSessionCookie(response);
            response.json({ success: true });
        });

        this.#app.use((request, response, next) => {
            if (request.method !== "GET") return next();

            const rolesPermitidas = PAGINAS_PROTEGIDAS.get(request.path);
            if (!rolesPermitidas) return next();

            const sessao = obterSessao(request);
            if (!sessao) {
                const destino = encodeURIComponent(request.originalUrl);
                return response.redirect(302, `/login.html?next=${destino}`);
            }

            if (!rolesPermitidas.includes(sessao.role)) {
                const destino = sessao.role === "ALUNO" ? "/aluno.html" : "/dashboard.html";
                return response.redirect(302, destino);
            }

            next();
        });
    }

    #servirArquivosPublicos() {
        const publicPath = path.join(process.cwd(), "src/public");
        this.#app.use(express.static(publicPath));
    }

    #configurarProfessor() {
        const middleware = new ProfessorMiddleware();
        const dao = new ProfessorDAOMongo(this.#database);
        const service = new ProfessorService(dao);
        const controller = new ProfessorController(service);
        const router = new ProfessorRouter(this.#jwtMiddleware, middleware, controller);

        this.#app.use("/api/v1/professores", router.createRoutes());
    }

    #configurarAluno() {
        const middleware = new AlunoMiddleware();
        const dao = new AlunoDAOMongo(this.#database);
        const service = new AlunoService(dao);
        const controller = new AlunoController(service);
        const router = new AlunoRouter(this.#jwtMiddleware, middleware, controller);

        this.#app.use("/api/v1/alunos", router.createRoutes());
    }

    #configurarProjeto() {
        const middleware = new ProjetoMiddleware();
        this.#projetoDAO = new ProjetoDAOMongo(this.#database);
        const service = new ProjetoService(this.#projetoDAO);
        const controller = new ProjetoController(service);
        const router = new ProjetoRouter(this.#jwtMiddleware, middleware, controller);

        this.#app.use("/api/v1/projetos", router.createRoutes());
    }

    #configurarAvaliacao() {
        const middleware = new AvaliacaoMiddleware();
        const dao = new AvaliacaoDAOMongo(this.#database);
        const service = new AvaliacaoService(dao, this.#projetoDAO);
        const controller = new AvaliacaoController(service);
        const router = new AvaliacaoRouter(this.#jwtMiddleware, middleware, controller);

        this.#app.use("/api/v1/avaliacoes", router.createRoutes());
    }

    #configurarErros() {
        this.#app.use((error, request, response, next) => {
            if (error instanceof ErrorResponse) {
                logger.warn(error.message, {
                    httpCode: error.httpCode,
                    error: error.error,
                    url: request.originalUrl,
                    method: request.method,
                });

                return response.status(error.httpCode).json({
                    success: false,
                    message: error.message,
                    error: error.error,
                });
            }

            logger.error("Erro interno não tratado", {
                error: error.message,
                stack: error.stack,
                code: error.code,
                url: request.originalUrl,
                method: request.method,
            });

            response.status(500).json({
                success: false,
                message: "Ocorreu um erro interno no servidor",
                error: { message: error.message || "Erro interno", code: error.code },
            });
        });
    }


    run = () => {
        this.#app.listen(this.#porta, () => {
            logger.info(`Servidor rodando em http://localhost:${this.#porta}/login.html`);
        });
    };
};
