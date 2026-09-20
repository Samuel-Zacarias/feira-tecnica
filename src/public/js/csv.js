(function (root) {
    function parseCSV(text) {
        text = String(text).replace(/^\uFEFF/, '');
        const header = text.split(/\r?\n/, 1)[0];
        const separator = header.includes(';') ? ';' : ',';
        const rows = [];
        let row = [], field = '', quoted = false;
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            if (char === '"') {
                if (quoted && text[i + 1] === '"') { field += '"'; i++; }
                else quoted = !quoted;
            } else if (char === separator && !quoted) {
                row.push(field.trim()); field = '';
            } else if ((char === '\n' || char === '\r') && !quoted) {
                if (char === '\r' && text[i + 1] === '\n') i++;
                row.push(field.trim()); field = '';
                if (row.some(Boolean)) rows.push(row);
                row = [];
            } else field += char;
        }
        if (quoted) throw new Error('Há um campo com aspas abertas na planilha. Exporte o CSV novamente.');
        row.push(field.trim());
        if (row.some(Boolean)) rows.push(row);
        if (rows.length < 2) throw new Error('A planilha está vazia ou não contém projetos.');
        const columns = rows.shift().map(value => value.toLowerCase());
        const required = ['tema','curso','representante_nome','representante_matricula','representante_email','representante_turma'];
        const missing = required.filter(name => !columns.includes(name));
        if (missing.length) throw new Error(`Colunas ausentes: ${missing.join(', ')}. Use o modelo disponível nesta página.`);
        return rows.map((values, index) => {
            if (values.length !== columns.length) throw new Error(`Registro ${index + 1}: quantidade de colunas diferente do cabeçalho.`);
            return Object.fromEntries(columns.map((name, i) => [name, values[i] || '']));
        });
    }
    if (typeof module !== 'undefined' && module.exports) module.exports = { parseCSV };
    else root.FeiraCSV = { parseCSV };
})(typeof window !== 'undefined' ? window : globalThis);
