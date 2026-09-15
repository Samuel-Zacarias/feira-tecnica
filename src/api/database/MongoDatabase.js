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
        this.#database = config.database || 'feira-tecnica2026';

        const credentials = config.user && config.password
            ? `${config.user}:${config.password}@`
            : '';
        this.#url = `mongodb://${credentials}${host}:${port}`;
    }

    async connect() {
        if (!MongoDatabase.#client) {
            MongoDatabase.#client = new MongoClient(this.#url);
            await MongoDatabase.#client.connect();
            MongoDatabase.#db = MongoDatabase.#client.db(this.#database);
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
