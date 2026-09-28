const Server = require("./Server");
const logger = require("./src/api/utils/Logger");

console.log("MONGODB_URI definida?", !!process.env.MONGODB_URI);
async function iniciar() {
    try {
        const port = Number(process.env.PORT || 3000);
        if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT deve ser uma porta válida.');
        const server = new Server(port);
        await server.init();
        server.run();
    } catch (error) {
        console.error("ERRO AO INICIAR:", error); // <- adicionado
        logger.error("Falha ao iniciar a aplicação", {
            error: error.message,
            stack: error.stack,
            code: error.code,
        });
        process.exit(1);
    }
}

process.on("unhandledRejection", reason => {
    console.error("PROMESSA REJEITADA:", reason); // <- adicionado
    logger.error("Promessa rejeitada sem tratamento", {
        reason: reason?.message || reason,
        stack: reason?.stack,
    });
});

process.on("uncaughtException", error => {
    console.error("EXCEÇÃO NÃO CAPTURADA:", error); // <- adicionado
    logger.error("Exceção não capturada", {
        // <- MANTENHA AQUI o restante original do seu arquivo
        // (o print cortou daqui para baixo)
        error: error.message,
        stack: error.stack,
    });
});

iniciar(); // <- mantenha a chamada final como estava no seu arquivo