const { MongoClient } = require('mongodb');
const logger = require('../utils/Logger');

module.exports = class MongoDatabase {
    static #client;
    static #db;

    #database;
    #url;

    constructor(config = {}) {
        const host = config.host || 'localhost';
        const port = config.port || 27017;
        this.#database = process.env.MONGODB_DATABASE || config.database || 'feira-tecnica2026';

        const credentials = config.user && config.password
            ? `${config.user}:${config.password}@`
            : '';
        this.#url = process.env.MONGODB_URI || `mongodb://${credentials}${host}:${port}`;
    }

    async connect() {
        if (!MongoDatabase.#client) {
            const client = new MongoClient(this.#url, {serverSelectionTimeoutMS:5000});
            try { await client.connect(); }
            catch(error) { await client.close(); throw new Error('Não foi possível conectar ao MongoDB. Inicie o banco ou configure MONGODB_URI.', {cause:error}); }
            const minIndexSpace = process.env.MONGODB_INDEX_MIN_AVAILABLE_DISK_SPACE_MB;
            if (minIndexSpace !== undefined) {
                const megabytes = Number(minIndexSpace);
                if (!Number.isInteger(megabytes) || megabytes < 50 || megabytes > 500) {
                    await client.close();
                    throw new Error('MONGODB_INDEX_MIN_AVAILABLE_DISK_SPACE_MB deve ser um inteiro entre 50 e 500.');
                }
                try {
                    await client.db('admin').command({ setParameter: 1, indexBuildMinAvailableDiskSpaceMB: megabytes });
                } catch (error) {
                    await client.close();
                    throw new Error('Não foi possível configurar a reserva de espaço para índices do MongoDB.', { cause: error });
                }
                logger.info(`Reserva mínima para índices do MongoDB: ${megabytes} MB`);
            }
            MongoDatabase.#client = client;
            MongoDatabase.#db = client.db(this.#database);
            logger.info(`MongoDB conectado: ${this.#database}`);
        }
        return MongoDatabase.#db;
    }

    async getCollection(name) {
        const db = await this.connect();
        return db.collection(name);
    }

    async close() {
        if (!MongoDatabase.#client) return;
        await MongoDatabase.#client.close();
        MongoDatabase.#client = null;
        MongoDatabase.#db = null;
        logger.info('Conexão com MongoDB encerrada');
    }
};
