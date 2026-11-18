const http = require('http');
const fs = require('fs');
const path = require('path');
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