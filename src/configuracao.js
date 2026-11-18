// O HTML da página está em views/config.html.

const fs = require('fs');
const path = require('path');

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
  return fs.readFileSync(path.join(__dirname, '..', 'views', 'config.html'), 'utf8');
}

module.exports = { paginaConfiguracao, parametros, paginasAlvo, tiposBug };