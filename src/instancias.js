// Registo das instâncias criadas no deploy (user_url).
// Por agora "fica em memória", posteriormente passa para a base de dados.

const instancias = new Map();

function registarInstancia(activityID) {
  if (!instancias.has(activityID)) {
    instancias.set(activityID, { activityID, criadaEm: new Date().toISOString(), resultados: [] });
  }
  return instancias.get(activityID);
}

function obterInstancia(activityID) {
  return instancias.get(activityID);
}

module.exports = { registarInstancia, obterInstancia };
