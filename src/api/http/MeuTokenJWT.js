const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const SECRET = process.env.JWT_SECRET || "x9S4q0v+V0IjvHkG20uAxaHx1ijj+q1HWjHKv+ohxp/oK+77qyXkVj/l4QYHHTF3";
const ALGORITHM = "HS256";
const TOKEN_DURATION_SECONDS = 60 * 24 * 60 * 60;

module.exports = class MeuTokenJWT {
    #payload = null;

    gerarToken = claims => {
        const now = Math.floor(Date.now() / 1000);
        const payload = {
            iss: "http://localhost",
            aud: "http://localhost",
            sub: "acesso_sistema",
            iat: now,
            exp: now + TOKEN_DURATION_SECONDS,
            nbf: now,
            jti: crypto.randomBytes(16).toString("hex"),
            email: claims.email,
            role: claims.role,
            name: claims.name,
            idFuncionario: claims.idFuncionario,
            matricula: claims.matricula || null,
            turma: claims.turma || null,
            curso: claims.curso || null,
        };

        return jwt.sign(payload, SECRET, {
            algorithm: ALGORITHM,
            header: { alg: ALGORITHM, typ: "JWT" },
        });
    };

    validarToken = tokenValue => {
        if (typeof tokenValue !== "string" || !tokenValue.trim()) {
            this.#payload = null;
            return false;
        }

        const token = tokenValue.replace(/^Bearer\s+/i, "").trim();
        try {
            this.#payload = jwt.verify(token, SECRET, {
                algorithms: [ALGORITHM],
            });
            return true;
        } catch (_) {
            this.#payload = null;
            return false;
        }
    };

    get payload() {
        return this.#payload;
    }
};
