const { MongoClient } = require('mongodb');

const URI = 'mongodb://localhost:27017';
const NOME_BANCO = 'feira-tecnica2026';

(async () => {
  const client = new MongoClient(URI);
  try {
    await client.connect();
    const db = client.db(NOME_BANCO);
    const resultado = await db.collection('projetos').deleteMany({});
    console.log(`${resultado.deletedCount} projetos removidos.`);
  } catch (erro) {
    console.error('Erro ao limpar:', erro.message);
  } finally {
    await client.close();
  }
})();