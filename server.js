// Bug Hunt - Activity Provider para a Inven!RA
// Semana 1: resposta aos cinco pedidos com URL fixo, com dados de exemplo.

const http = require('http');
const { paginaConfiguracao, parametros } = require('./src/configuracao');
const { listaAnaliticas, analiticasDaAtividade } = require('./src/analiticas');
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

function paginaInicial(base) {
  const registo = {
    name: 'Bug Hunt',
    config_url: `${base}/config`,
    json_params_url: `${base}/json-params`,
    user_url: `${base}/deploy`,
    analytics_url: `${base}/analytics`,
    analytics_list_url: `${base}/analytics-list`
  };
  return `<!DOCTYPE html>
<html lang="pt">
<head><meta charset="utf-8"><title>Bug Hunt - Activity Provider</title>
<style>body{font-family:Arial,sans-serif;max-width:760px;margin:24px}code,pre{background:#f3f3f3;padding:2px 4px}pre{padding:10px;overflow:auto}</style>
</head>
<body>
<h1>Bug Hunt - Activity Provider</h1>
<p>Activity Provider para a Inven!RA. Nesta fase responde aos cinco pedidos com URL fixo, usando dados de exemplo.</p>
<ul>
  <li>GET <a href="/config">/config</a> - página de configuração da atividade</li>
  <li>GET <a href="/json-params">/json-params</a> - parâmetros da página de configuração</li>
  <li>GET <a href="/deploy?activityID=teste123">/deploy?activityID=teste123</a> - deploy de uma instância</li>
  <li>POST /analytics - analíticas de uma instância (corpo: <code>{"activityID": "teste123"}</code>)</li>
  <li>GET <a href="/analytics-list">/analytics-list</a> - lista de analíticas disponíveis</li>
</ul>
<h2>Ficheiro de registo</h2>
<pre>${JSON.stringify(registo, null, 2)}</pre>
</body>
</html>`;
}

function paginaRelatorios(activityID, stdID) {
  return `<!DOCTYPE html>
<html lang="pt"><head><meta charset="utf-8"><title>Relatórios submetidos</title></head>
<body style="font-family:Arial,sans-serif;margin:24px">
<h2>Relatórios submetidos</h2>
<p>Atividade: ${escapar(activityID)} | Aluno: ${escapar(stdID)}</p>
<p>Dados de exemplo. A listagem real dos relatórios fica disponível quando o serviço "Provide activity" for implementado.</p>
</body></html>`;
}

function escapar(texto) {
  return String(texto || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

const servidor = http.createServer(async (req, res) => {
  const url = new URL(req.url, urlBase(req));
  const base = urlBase(req);

  if (req.method === 'OPTIONS') return enviar(res, 204, 'text/plain', '');

  try {
    if (req.method === 'GET' && url.pathname === '/') {
      return enviar(res, 200, 'text/html', paginaInicial(base));
    }

    if (req.method === 'GET' && url.pathname === '/config') {
      return enviar(res, 200, 'text/html', paginaConfiguracao());
    }

    if (req.method === 'GET' && url.pathname === '/json-params') {
      return enviarJSON(res, 200, parametros);
    }

    if (req.method === 'GET' && url.pathname === '/deploy') {
      const activityID = url.searchParams.get('activityID');
      if (!activityID) return enviarJSON(res, 400, { erro: 'Falta o parâmetro activityID' });
      registarInstancia(activityID);
      return enviar(res, 200, 'text/plain', `${base}/atividade?activityID=${encodeURIComponent(activityID)}`);
    }

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

    if (req.method === 'GET' && url.pathname === '/analytics-list') {
      return enviarJSON(res, 200, listaAnaliticas);
    }

    if (req.method === 'GET' && url.pathname === '/relatorios') {
      return enviar(res, 200, 'text/html', paginaRelatorios(url.searchParams.get('activityID'), url.searchParams.get('stdID')));
    }

    if (url.pathname === '/atividade') {
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
