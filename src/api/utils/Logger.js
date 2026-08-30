// src/api/utils/Logger.js
const winston = require('winston');
const path = require('path');

// Define o formato dos logs
const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json() // Saída em JSON para facilitar análise
);

// Cria o logger
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: logFormat,
    transports: [
        // Logs de erro em arquivo separado
        new winston.transports.File({
            filename: path.join(__dirname, '../system/error.log'),
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),
        // Todos os logs em arquivo único
        new winston.transports.File({
            filename: path.join(__dirname, '../system/combined.log'),
            maxsize: 5242880,
            maxFiles: 5,
        }),
    ],
});

// Se não estiver em produção, também exibe no console com cores
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
        ),
        level: 'debug',
    }));
}

module.exports = logger;