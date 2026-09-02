const QRCode = require("qrcode");
const logger = require("./Logger");

/**
 * Utilitário para geração de QR Codes.
 *
 * Gera o QR Code localmente (sem depender de nenhuma API externa),
 * retornando uma Data URL base64 (PNG) pronta pra ser usada
 * direto em um <img src="..."> no front-end.
 */
module.exports = class QrCodeGenerator {
    static gerar = async (url) => {
        const method = "QrCodeGenerator.gerar";

        try {
            if (!url || typeof url !== "string") {
                throw new Error("URL é obrigatória para gerar o QR Code.");
            }

            const qrCodeBase64 = await QRCode.toDataURL(url, {
                errorCorrectionLevel: "M",
                margin: 2,
                width: 300
            });

            logger.debug(`✅ ${method} - QR Code gerado com sucesso`, { url });

            return qrCodeBase64;
        } catch (error) {
            logger.error(`❌ ${method} - Erro ao gerar QR Code`, {
                url,
                error: error.message,
                stack: error.stack
            });

            throw error;
        }
    };
};