const bcrypt = require('bcrypt');

module.exports = async function seedDatabase(database) {
    const professores = await database.getCollection('professores');
    await professores.createIndex({ email: 1 }, { unique: true });

    await criarProfessorSeNecessario(professores, {
        nome: 'Administrador da Feira',
        email: 'admin@feira.com',
        senha: 'Admin@2026',
        role: 'ADMINISTRADOR',
    });
    await criarProfessorSeNecessario(professores, {
        nome: 'Professor Avaliador',
        email: 'avaliador@feira.com',
        senha: 'Avaliador@2026',
        role: 'AVALIADOR',
    });

    const alunos = await database.getCollection('alunos');
    // Integrantes sem e-mail usam matrícula, sem endereços fictícios.
    const indexes = await alunos.listIndexes().toArray().catch(error => {
        if(error.code === 26) return [];
        throw error;
    });
    const emailIndex = indexes.find(index => index.name === 'email_1');
    if(emailIndex && !emailIndex.partialFilterExpression) await alunos.dropIndex('email_1');
    await alunos.createIndex({ email: 1 }, { unique: true, partialFilterExpression: { email: { $type: 'string' } } });
    await alunos.createIndex({ matricula: 1 }, { unique: true });
    if(await require('./ImportarCadastros').carregarCadastros(database)) return;
    const alunoDemo = await criarAlunoDemoSeNecessario(alunos);

    const projetos = await database.getCollection('projetos');
    if ((await projetos.countDocuments()) === 0 && alunoDemo) {
        await projetos.insertOne(criarProjetoDemo(alunoDemo));
    }
};

async function criarProfessorSeNecessario(collection, dados) {
    if (await collection.findOne({ email: dados.email })) return;
    await collection.insertOne({
        nome: dados.nome,
        email: dados.email,
        senha: await bcrypt.hash(dados.senha, 12),
        role: dados.role,
        dataCadastro: new Date(),
    });
}

async function criarAlunoDemoSeNecessario(collection) {
    let aluno = await collection.findOne({ email: 'aluno@feira.com' });
    if (aluno) return aluno;

    const resultado = await collection.insertOne({
        nome: 'Aluno Demonstração',
        email: 'aluno@feira.com',
        senha: await bcrypt.hash('Aluno@2026', 12),
        matricula: '20260001',
        turma: '2INFO',
        curso: 'INFORMÁTICA',
        role: 'ALUNO',
        dataCadastro: new Date(),
    });
    return collection.findOne({ _id: resultado.insertedId });
}

function criarProjetoDemo(aluno) {
    return {
        tema: 'Conecta Escola',
        curso: 'INFORMÁTICA',
        representante: {
            nome: aluno.nome,
            matricula: aluno.matricula,
            turma: aluno.turma,
            email: aluno.email,
        },
        integrantes: [],
        equipamento: 'EQUIPE TRAZ SEU COMPUTADOR',
        outrosRecursos: null,
        observacoes: null,
        alunoId: aluno._id.toString(),
        descricao: 'Uma plataforma para aproximar alunos, projetos e visitantes durante a Feira Técnica.',
        objetivo: 'Tornar a descoberta dos projetos mais simples, organizada e acessível.',
        problema: 'Visitantes frequentemente têm dificuldade para encontrar projetos, entender as propostas e localizar os estandes.',
        solucao: 'Uma experiência web com catálogo, QR Code, páginas públicas e informações organizadas de cada equipe.',
        diferencial: 'Cada projeto ganha uma página própria e pode ser atualizado pelos alunos responsáveis.',
        tecnologias: ['HTML', 'CSS', 'JavaScript', 'Node.js', 'MongoDB'],
        imagens: [],
        links: { github: '', video: '', site: '' },
        localizacao: 'Bloco Técnico · Stand 01',
        statusProjeto: 'EM DESENVOLVIMENTO',
        dataCadastro: new Date(),
    };
}
