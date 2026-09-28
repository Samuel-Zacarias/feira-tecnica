const test = require('node:test');
const assert = require('node:assert/strict');
const sincronizar = require('../src/api/database/SincronizarAlunosProjetos');

test('cadastra alunos dos projetos existentes e preserva senhas em novas execuções', async () => {
    const projetos = [
        {
            _id: 'projeto-1', curso: 'INFORMÁTICA', alunosAutorizados: [],
            representante: { nome: 'Ana Silva', matricula: '1001', turma: '2J', email: 'ana@example.test' },
            integrantes: [
                { nome: 'Beto Lima', matricula: '1002', turma: '2J' },
                { nome: 'Clara Dias', matricula: '1003', turma: '2J' },
            ],
        },
        {
            _id: 'projeto-2', curso: 'QUÍMICA', alunosAutorizados: [],
            representante: { nome: 'Dora Costa', matricula: '1004', turma: '3Q', email: 'ana@example.test' },
            integrantes: [{ nome: 'Clara Dias', matricula: '1003', turma: '2J' }],
        },
    ];
    const alunos = [{ _id: 'aluno-ana', nome: 'Ana Silva', matricula: '1001', turma: '2J', email: 'ana@example.test', senha: 'senha-pessoal' }];
    const db = { getCollection: async nome => nome === 'alunos' ? {
        findOne: async query => alunos.find(aluno => Object.entries(query).every(([campo, valor]) => aluno[campo] === valor)) || null,
        updateOne: async (query, update) => {
            const existente = alunos.find(aluno => aluno.matricula === query.matricula);
            if (existente) return { upsertedCount: 0 };
            alunos.push({ _id: `aluno-${alunos.length}`, ...update.$setOnInsert });
            return { upsertedCount: 1 };
        },
    } : {
        find: () => ({ toArray: async () => projetos }),
        updateOne: async (query, update) => {
            const projeto = projetos.find(item => item._id === query._id);
            const alunoId = update.$addToSet.alunosAutorizados;
            if (projeto.alunosAutorizados.includes(alunoId)) return { modifiedCount: 0 };
            projeto.alunosAutorizados.push(alunoId);
            return { modifiedCount: 1 };
        },
    } };
    const options = { hashPassword: async turma => `hash:${turma}` };

    const primeira = await sincronizar(db, options);
    assert.equal(primeira.contasCriadas, 2);
    assert.equal(primeira.contasExistentes, 1);
    assert.equal(primeira.vinculosCriados, 3);
    assert(primeira.pendencias.some(item => item.tipo === 'matricula_repetida' && item.matricula === '1003'));
    assert.equal(alunos.find(item => item.matricula === '1004').email, undefined);
    assert.equal(alunos[0].senha, 'senha-pessoal');

    const segunda = await sincronizar(db, options);
    assert.equal(segunda.contasCriadas, 0);
    assert.equal(segunda.vinculosCriados, 0);
    assert.equal(alunos[0].senha, 'senha-pessoal');
});
