const Server = require("./Server");
const logger = require("./src/api/utils/Logger");

async function iniciar() {
    try {
        const server = new Server(3000);
        await server.init();
        server.run();
    } catch (error) {
        logger.error("Falha ao iniciar a aplicação", {
            error: error.message,
            stack: error.stack,
            code: error.code,
        });
        process.exit(1);
    }
}

process.on("unhandledRejection", reason => {
    logger.error("Promessa rejeitada sem tratamento", {
        reason: reason?.message || reason,
        stack: reason?.stack,
    });
});

process.on("uncaughtException", error => {
    logger.error("Exceção não capturada", {
        error: error.message,
        stack: error.stack,
    });
    process.exit(1);
});

for (const signal of ["SIGINT", "SIGTERM"]) {
    process.on(signal, () => {
        logger.info(`Encerrando aplicação (${signal})`);
        process.exit(0);
    });
}

iniciar();
