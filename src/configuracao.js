// Página de configuração e lista de parâmetros (config_url e json_params_url).
// A página não guarda nada: a Inven!RA lê os campos com nome quando o professor guarda a atividade.

const paginasAlvo = [
  { id: 'loja-checkout', nome: 'Loja online: checkout' },
  { id: 'formulario-inscricao', nome: 'Formulário de inscrição' },
  { id: 'simulador-credito', nome: 'Simulador de crédito' }
];

const tiposBug = [
  { id: 'validacao', nome: 'Validação de campos' },
  { id: 'calculo', nome: 'Cálculo' },
  { id: 'mensagens', nome: 'Mensagens de erro' },
  { id: 'interface', nome: 'Interface' }
];

const parametros = [
  { name: 'modo_atribuicao', type: 'text/plain' },
  { name: 'pagina_alvo', type: 'text/plain' },
  { name: 'bugs_ativos', type: 'text/plain' },
  { name: 'instrucoes', type: 'text/plain' },
  { name: 'tempo_limite_min', type: 'integer' },
  { name: 'feedback_imediato', type: 'boolean' }
];

function paginaConfiguracao() {
  const opcoesPaginas = paginasAlvo
    .map(p => `<option value="${p.id}">${p.nome}</option>`)
    .join('');

  const caixasBugs = tiposBug
    .map(t => `<label><input type="checkbox" class="bh-tipo" value="${t.id}" checked> ${t.nome}</label><br>`)
    .join('');

  return `<!DOCTYPE html>
<html lang="pt">
<head>
<meta charset="utf-8">
<title>Bug Hunt - configuração</title>
<style>
  body { font-family: Arial, sans-serif; max-width: 640px; margin: 20px; }
  label.titulo { display: block; font-weight: bold; margin-top: 14px; }
  select, input[type=number], textarea { width: 100%; padding: 4px; }
</style>
</head>
<body>
<h2>Bug Hunt</h2>

<label class="titulo" for="modo_atribuicao">Modo de atribuição da página-alvo</label>
<select id="modo_atribuicao" name="modo_atribuicao">
  <option value="fixa">Fixa (a mesma página para todos os alunos)</option>
  <option value="sorteada">Sorteada (uma página aleatória por aluno)</option>
</select>

<label class="titulo" for="pagina_alvo">Página-alvo (no modo fixo)</label>
<select id="pagina_alvo" name="pagina_alvo">${opcoesPaginas}</select>

<span class="titulo" style="display:block;font-weight:bold;margin-top:14px;">Tipos de bug ativos</span>
${caixasBugs}
<input type="hidden" id="bugs_ativos" name="bugs_ativos" value="${tiposBug.map(t => t.id).join(',')}">

<label class="titulo" for="instrucoes">Instruções para o aluno</label>
<textarea id="instrucoes" name="instrucoes" rows="4">Explore a página e registe cada bug que encontrar, indicando os passos para o reproduzir.</textarea>

<label class="titulo" for="tempo_limite_min">Tempo limite (minutos)</label>
<input type="number" id="tempo_limite_min" name="tempo_limite_min" min="5" max="180" value="30">

<label class="titulo" for="feedback_imediato">Feedback imediato</label>
<select id="feedback_imediato" name="feedback_imediato">
  <option value="true">Sim, o aluno sabe logo se o relatório é válido</option>
  <option value="false">Não, só no fim da atividade</option>
</select>

<script>
  // junta as caixas selecionadas no campo bugs_ativos
  document.querySelectorAll('.bh-tipo').forEach(function (caixa) {
    caixa.addEventListener('change', function () {
      var ativos = Array.from(document.querySelectorAll('.bh-tipo:checked')).map(function (c) { return c.value; });
      document.getElementById('bugs_ativos').value = ativos.join(',');
    });
  });
</script>
</body>
</html>`;
}

module.exports = { paginaConfiguracao, parametros, paginasAlvo, tiposBug };
