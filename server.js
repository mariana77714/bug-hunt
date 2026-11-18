// Bug Hunt - Activity Provider para a Inven!RA
// Semana 1: resposta aos cinco pedidos com URL fixo, com dados de exemplo.

const http = require('http');
const fs = require('fs');
const path = require('path');
const { paginaConfiguracao, parametros } = require('./src/configuracao');
const { listaAnaliticas, analiticasDaAtividade, relatoriosDoAluno } = require('./src/analiticas');
const { registarInstancia } = require('./src/instancias');

const PORTA = process.env.PORT || 3000;

function urlBase(req) {
  const protocolo = req.headers['x-forwarded-proto'] || 'http';
  return `${protocolo}://${req.headers.host}`;
}

function enviar(res, estado, tipo, corpo) {
  res.writeHead(estado, {
    'Content-Type': `${tipo}; charset=utf-8`,
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(corpo);
}

function enviarJSON(res, estado, dados) {
  enviar(res, estado, 'application/json', JSON.stringify(dados, null, 2));
}

function lerPagina(nome) {
  return fs.readFileSync(path.join(__dirname, 'views', nome), 'utf8');
}

function lerCorpo(req) {
  return new Promise((resolve, reject) => {
    let corpo = '';
    req.on('data', parte => {
      corpo += parte;
      if (corpo.length > 1e6) req.destroy();
    });
    req.on('end', () => resolve(corpo));
    req.on('error', reject);
  });
}

function paginaRelatorios(activityID, stdID) {
  const dados = relatoriosDoAluno(stdID);
  const linhas = dados
    ? dados.relatorios.map(r => `<tr><td>${r.minuto}</td><td>${escapar(r.texto)}</td><td>${r.completo ? 'sim' : 'não'}</td><td>${escapar(r.resultado)}</td></tr>`).join('')
    : '<tr><td colspan="4">Sem relatórios para este aluno.</td></tr>';
  return `<!DOCTYPE html>
<html lang="pt"><head><meta charset="utf-8"><title>Relatórios submetidos</title>
<style>
  body { font-family: Arial, sans-serif; max-width: 860px; margin: 24px auto; padding: 0 16px; color: #1f2933; }
  table { border-collapse: collapse; width: 100%; }
  th, td { border: 1px solid #dde3e8; padding: 8px; text-align: left; vertical-align: top; font-size: 14px; }
  th { background: #f4f6f8; }
</style></head>
<body>
<h2>Relatórios submetidos</h2>
<p>Atividade: ${escapar(activityID)} | Aluno: ${escapar(stdID)}${dados ? ' | Página-alvo: ' + escapar(dados.paginaAlvo) : ''}</p>
<table>
<tr><th>Minuto</th><th>Relatório do aluno</th><th>Completo</th><th>Resultado</th></tr>
${linhas}
</table>
<p>Dados de exemplo, até o serviço "Provide activity" estar implementado.</p>
</body></html>`;
}

function escapar(texto) {
  return String(texto || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

const servidor = http.createServer(async (req, res) => {
  const base = urlBase(req);
  const url = new URL(req.url, base);

  if (req.method === 'OPTIONS') return enviar(res, 204, 'text/plain', '');

  try {
    if (req.method === 'GET' && url.pathname === '/') {
      return enviar(res, 200, 'text/html', lerPagina('index.html').replaceAll('{{base}}', base));
    }

    // config_url
    if (req.method === 'GET' && url.pathname === '/config') {
      return enviar(res, 200, 'text/html', paginaConfiguracao());
    }

    // json_params_url
    if (req.method === 'GET' && url.pathname === '/json-params') {
      return enviarJSON(res, 200, parametros);
    }

    // user_url (deploy)
    if (req.method === 'GET' && url.pathname === '/deploy') {
      const activityID = url.searchParams.get('activityID');
      if (!activityID) return enviarJSON(res, 400, { erro: 'Falta o parâmetro activityID' });
      registarInstancia(activityID);
      return enviar(res, 200, 'text/plain', `${base}/atividade?activityID=${encodeURIComponent(activityID)}`);
    }

    // analytics_url: no navegador (GET) mostra a página de teste
    if (req.method === 'GET' && url.pathname === '/analytics') {
      return enviar(res, 200, 'text/html', lerPagina('analytics.html'));
    }

    // analytics_url: pedido da Inven!RA (POST)
    if (req.method === 'POST' && url.pathname === '/analytics') {
      let pedido;
      try {
        pedido = JSON.parse((await lerCorpo(req)) || '{}');
      } catch {
        return enviarJSON(res, 400, { erro: 'O corpo do pedido não é JSON válido' });
      }
      if (!pedido.activityID) return enviarJSON(res, 400, { erro: 'Falta o campo activityID' });
      return enviarJSON(res, 200, analiticasDaAtividade(pedido.activityID, base));
    }

    // analytics_list_url
    if (req.method === 'GET' && url.pathname === '/analytics-list') {
      return enviarJSON(res, 200, listaAnaliticas);
    }

    if (req.method === 'GET' && url.pathname === '/relatorios') {
      return enviar(res, 200, 'text/html', paginaRelatorios(url.searchParams.get('activityID'), url.searchParams.get('stdID')));
    }

    if (req.method === 'GET' && url.pathname === '/atividade') {
      return enviar(res, 200, 'text/html', '<!DOCTYPE html><html lang="pt"><head><meta charset="utf-8"><title>Bug Hunt</title></head><body style="font-family:Arial,sans-serif;margin:24px"><h2>Bug Hunt</h2><p>A atividade ainda não está disponível nesta fase do projeto.</p></body></html>');
    }

    return enviarJSON(res, 404, { erro: 'Recurso não encontrado' });
  } catch (erro) {
    console.error(erro);
    return enviarJSON(res, 500, { erro: 'Erro interno' });
  }
});

servidor.listen(PORTA, () => {
  console.log(`Bug Hunt a correr na porta ${PORTA}`);
});