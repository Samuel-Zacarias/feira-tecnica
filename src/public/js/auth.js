(function () {
    const STORAGE_KEYS = ["tokenJWT", "userData", "perfilUsuario"];
    const token = localStorage.getItem("tokenJWT");
    const userData = parseJson(localStorage.getItem("userData"));
    const professor = userData?.data?.professor || null;
    const aluno = userData?.data?.aluno || null;
    const usuario = professor || aluno;

    if (!token || !usuario) {
        limparSessaoLocal();
        window.location.replace("login.html");
        return;
    }

    window.SESSAO = {
        token,
        usuario,
        professor,
        aluno,
        role: usuario.role || (aluno ? "ALUNO" : "AVALIADOR"),
    };

    window.sair = async function sair() {
        try {
            await fetch("/api/v1/sessao/logout", { method: "POST" });
        } catch (_) {
            // A sessão local ainda precisa ser encerrada mesmo sem resposta do servidor.
        }
        limparSessaoLocal();
        window.location.replace("login.html");
    };

    window.api = async function api(url, options = {}) {
        const headers = {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("tokenJWT") || token}`,
            ...(options.headers || {}),
        };

        const response = await fetch(url, { ...options, headers });
        const refreshedToken = response.headers.get("authorization");
        if (refreshedToken) {
            localStorage.setItem(
                "tokenJWT",
                refreshedToken.replace(/^Bearer\s+/i, "")
            );
        }

        const data = await response.json().catch(() => null);
        if (response.status === 401) {
            alert("Sua sessão expirou. Entre novamente.");
            await window.sair();
            throw new Error("Não autorizado");
        }

        if (!response.ok || data?.success === false) {
            throw new Error(
                data?.error?.message ||
                data?.error?.details?.message ||
                data?.message ||
                `Erro HTTP ${response.status}`
            );
        }

        return data;
    };

    window.mostrarAlerta = function mostrarAlerta(element, type, text) {
        if (!element) return;
        element.className = `alert show ${type}`;
        element.textContent = text;
    };

    window.limparAlerta = function limparAlerta(element) {
        if (!element) return;
        element.className = "alert";
        element.textContent = "";
    };

    window.escapeHtml = function escapeHtml(value) {
        return String(value ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    };

    window.normalizarTexto = function normalizarTexto(value) {
        return String(value || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase();
    };

    document.addEventListener("DOMContentLoaded", () => {
        document.querySelectorAll("[data-professor], [data-usuario]").forEach(element => {
            element.textContent = usuario.nome || usuario.email || "Usuário";
        });

        document.querySelectorAll("[data-sair]").forEach(element => {
            element.addEventListener("click", window.sair);
        });

        adicionarNavegacaoMobile();
    });

    function parseJson(value) {
        try {
            return value ? JSON.parse(value) : null;
        } catch (_) {
            return null;
        }
    }

    function limparSessaoLocal() {
        STORAGE_KEYS.forEach(key => localStorage.removeItem(key));
    }

    function adicionarNavegacaoMobile() {
        if (document.querySelector(".mobile-nav")) return;

        const items = window.SESSAO.role === "ALUNO"
            ? [
                ["aluno.html", "◇", "Projeto"],
                ["cracha-aluno.html", "▣", "Crachá"],
                ["aluno.html#qrcode", "⌗", "QR Code"],
                ["ranking.html", "★", "Ranking"],
            ]
            : [
                ["dashboard.html", "⌂", "Painel"],
                ["projetos-consulta.html", "◇", "Projetos"],
                ["avaliacoes-cadastro.html", "★", "Avaliar"],
                ["ranking.html", "↗", "Ranking"],
            ];

        const currentPage = location.pathname.split("/").pop() || "dashboard.html";
        const nav = document.createElement("nav");
        nav.className = "mobile-nav";
        nav.setAttribute("aria-label", "Navegação rápida");
        nav.style.gridTemplateColumns = `repeat(${items.length}, 1fr)`;
        nav.innerHTML = items.map(([href, icon, label]) => {
            const page = href.split("#")[0];
            const active = page === currentPage ? "active" : "";
            return `<a class="${active}" href="${href}"><strong>${icon}</strong><span>${label}</span></a>`;
        }).join("");
        document.body.appendChild(nav);
    }
})();