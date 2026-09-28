const limpar = valor => String(valor ?? '').trim().replace(/\s+/g, ' ');
const comparar = valor => limpar(valor).toLocaleUpperCase('pt-BR');
const emailValido = valor => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor);

// Cria os acessos que faltam para os projetos já armazenados no MongoDB.
// Repetir a operação não duplica contas, vínculos nem redefine senhas pessoais.
module.exports = async function sincronizarAlunosProjetos(database, options = {}) {
    const hashPassword = options.hashPassword || (senha => require('bcrypt').hash(senha, 12));
    const alunos = await database.getCollection('alunos');
    const projetos = await database.getCollection('projetos');
    const registros = await projetos.find({}).toArray();
    const ocorrencias = new Map();
    const donosEmail = new Map();
    const hashes = new Map();
    const relatorio = {
        projetos: registros.length,
        contasCriadas: 0,
        contasExistentes: 0,
        vinculosCriados: 0,
        pendencias: [],
    };

    for (const projeto of registros) {
        for (const pessoa of [projeto.representante, ...(projeto.integrantes || [])]) {
            if (!pessoa) continue;
            const nome = limpar(pessoa.nome);
            const matricula = limpar(pessoa.matricula);
            const turma = comparar(pessoa.turma);
            const email = limpar(pessoa.email).toLowerCase();
            if (nome.length < 3 || !/^\d{3,15}$/.test(matricula) || !turma) {
                relatorio.pendencias.push({ tipo: 'dados_invalidos', projeto: String(projeto._id), nome, matricula });
                continue;
            }
            const item = { projeto, nome, matricula, turma, email: emailValido(email) ? email : '' };
            ocorrencias.set(matricula, [...(ocorrencias.get(matricula) || []), item]);
            if (item.email) donosEmail.set(item.email, new Set([...(donosEmail.get(item.email) || []), matricula]));
        }
    }

    for (const [matricula, itens] of ocorrencias) {
        const identidades = new Set(itens.map(item => `${comparar(item.nome)}|${item.turma}`));
        if (identidades.size !== 1) {
            relatorio.pendencias.push({ tipo: 'matricula_repetida', matricula, projetos: itens.map(item => String(item.projeto._id)) });
            continue;
        }
        const { projeto, nome, turma, email } = itens[0];
        let aluno = await alunos.findOne({ matricula });
        if (aluno) {
            if (comparar(aluno.nome) !== comparar(nome) || comparar(aluno.turma) !== turma) {
                relatorio.pendencias.push({ tipo: 'conta_divergente', matricula, projeto: String(projeto._id) });
                continue;
            }
            relatorio.contasExistentes++;
        } else {
            const emailLivre = email && donosEmail.get(email).size === 1 && !(await alunos.findOne({ email }));
            if (email && !emailLivre) {
                relatorio.pendencias.push({ tipo: 'email_repetido_ou_em_uso', matricula, projeto: String(projeto._id) });
            }
            if (!hashes.has(turma)) hashes.set(turma, await hashPassword(turma));
            const novo = {
                nome, matricula, turma, curso: limpar(projeto.curso),
                senha: hashes.get(turma), senhaVersao: 'turma-2026-v1',
                role: 'ALUNO', origemCadastro: 'projetos-servidor-2026', dataCadastro: new Date(),
                ...(emailLivre ? { email } : {}),
            };
            try {
                const resultado = await alunos.updateOne({ matricula }, { $setOnInsert: novo }, { upsert: true });
                aluno = await alunos.findOne({ matricula });
                if (!aluno || comparar(aluno.nome) !== comparar(nome) || comparar(aluno.turma) !== turma) {
                    relatorio.pendencias.push({ tipo: 'conta_divergente', matricula, projeto: String(projeto._id) });
                    continue;
                }
                if (resultado.upsertedCount) relatorio.contasCriadas++;
                else relatorio.contasExistentes++;
            } catch (erro) {
                if (erro.code !== 11000) throw erro;
                aluno = await alunos.findOne({ matricula });
                if (!aluno) {
                    relatorio.pendencias.push({ tipo: 'conflito_no_banco', matricula, projeto: String(projeto._id) });
                    continue;
                }
                if (comparar(aluno.nome) !== comparar(nome) || comparar(aluno.turma) !== turma) {
                    relatorio.pendencias.push({ tipo: 'conta_divergente', matricula, projeto: String(projeto._id) });
                    continue;
                }
                relatorio.contasExistentes++;
            }
        }
        const alunoId = String(aluno._id);
        for (const item of itens) {
            if (!(item.projeto.alunosAutorizados || []).includes(alunoId)) {
                const resultado = await projetos.updateOne({ _id: item.projeto._id }, { $addToSet: { alunosAutorizados: alunoId } });
                if (resultado.modifiedCount) relatorio.vinculosCriados++;
            }
        }
    }
    return relatorio;
};
