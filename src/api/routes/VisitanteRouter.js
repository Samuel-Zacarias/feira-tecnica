const express = require('express');
const { ObjectId } = require('mongodb');
const { randomUUID, createHash } = require('node:crypto');

// Collection exclusiva: nunca participa das notas ou do ranking da banca.
module.exports = async function visitorRatings(database) {
  const votes = await database.getCollection('avaliacoesVisitantes');
  const projects = await database.getCollection('projetos');
  await votes.createIndex({ projetoId: 1, visitante: 1 }, { unique: true });
  const router = express.Router();
  router.use((req, res, next) => {
    res.set('Cache-Control', 'no-store');
    if (req.headers['sec-fetch-site'] === 'cross-site' || (req.headers.origin && req.headers.origin !== `${req.protocol}://${req.get('host')}`)) {
      return res.status(403).json({ success: false, message: 'Abra a avaliação pelo site da feira.' });
    }
    next();
  });
  router.use('/:id', async (req, res, next) => {
    try {
      if (!/^[a-f\d]{24}$/i.test(req.params.id)) return res.status(400).json({ success: false, message: 'Projeto inválido.' });
      if (!await projects.findOne({ _id: new ObjectId(req.params.id) })) return res.status(404).json({ success: false, message: 'Projeto não encontrado.' });
      req.projectKey = req.params.id.toLowerCase();
      const cookie = String(req.headers.cookie || '').split(';').map(x => x.trim()).find(x => x.startsWith('feira_visitante='))?.slice(16);
      const valid = /^[a-f\d]{8}-(?:[a-f\d]{4}-){3}[a-f\d]{12}$/i.test(cookie || '');
      if (!valid && req.method !== 'GET') return res.status(400).json({ success: false, message: 'Recarregue a página e permita cookies para avaliar.' });
      const identity = valid ? cookie : randomUUID();
      if (!valid) res.cookie('feira_visitante', identity, { httpOnly: true, sameSite: 'strict', secure: req.secure, maxAge: 1000 * 60 * 60 * 24 * 180, path: '/' });
      req.visitorKey = createHash('sha256').update(identity).digest('hex');
      next();
    } catch (error) { next(error); }
  });
  async function summary(req) {
    const [stats, own] = await Promise.all([
      votes.aggregate([{ $match: { projetoId: req.projectKey } }, { $group: { _id: null, total: { $sum: 1 }, media: { $avg: '$nota' } } }]).toArray(),
      votes.findOne({ projetoId: req.projectKey, visitante: req.visitorKey })
    ]);
    return { total: stats[0]?.total || 0, media: stats[0]?.media ?? null, minhaNota: own?.nota ?? null };
  }
  router.get('/:id', async (req, res, next) => {
    try { res.json({ success: true, data: await summary(req) }); } catch (error) { next(error); }
  });
  router.put('/:id', async (req, res, next) => {
    try {
      const nota = req.body?.nota;
      if (!Number.isInteger(nota) || nota < 1 || nota > 5) return res.status(400).json({ success: false, message: 'Escolha uma nota inteira de 1 a 5.' });
      const filter = { projetoId: req.projectKey, visitante: req.visitorKey };
      const update = { $set: { nota, atualizadoEm: new Date() } };
      try { await votes.updateOne(filter, update, { upsert: true }); }
      catch (error) { if (error.code !== 11000) throw error; await votes.updateOne(filter, update); }
      res.json({ success: true, data: await summary(req) });
    } catch (error) { next(error); }
  });
  return router;
};