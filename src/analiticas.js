// Analíticas (analytics_list_url e analytics_url).
// Nesta fase os valores são dados de exemplo; a recolha real chega com o serviço "Provide activity".

const listaAnaliticas = {
  qualAnalytics: [
    { name: 'Relatórios submetidos', type: 'URL' },
    { name: 'Bugs não encontrados', type: 'text/plain' }
  ],
  quantAnalytics: [
    { name: 'Concluiu a atividade', type: 'boolean' },
    { name: 'Bugs encontrados', type: 'integer' },
    { name: 'Percentagem de bugs encontrados', type: 'integer' },
    { name: 'Falsos positivos', type: 'integer' },
    { name: 'Relatórios completos', type: 'integer' },
    { name: 'Tempo até ao primeiro bug (min)', type: 'integer' }
  ]
};

const alunosExemplo = [
  { stdID: '1001', concluiu: true, encontrados: 6, total: 8, falsos: 1, completos: 5, primeiro: 4, emFalta: 'calculo: arredondamento do IVA; interface: botão sem estado desativado' },
  { stdID: '1002', concluiu: false, encontrados: 3, total: 8, falsos: 2, completos: 2, primeiro: 9, emFalta: 'validacao: código postal; mensagens: erro genérico no pagamento; calculo: portes; calculo: desconto; interface: foco do teclado' }
];

function analiticasDaAtividade(activityID, urlBase) {
  return alunosExemplo.map(a => ({
    inveniraStdID: a.stdID,
    quantAnalytics: [
      { name: 'Concluiu a atividade', value: a.concluiu },
      { name: 'Bugs encontrados', value: a.encontrados },
      { name: 'Percentagem de bugs encontrados', value: Math.round((a.encontrados / a.total) * 100) },
      { name: 'Falsos positivos', value: a.falsos },
      { name: 'Relatórios completos', value: a.completos },
      { name: 'Tempo até ao primeiro bug (min)', value: a.primeiro }
    ],
    qualAnalytics: [
      { 'Relatórios submetidos': `${urlBase}/relatorios?activityID=${encodeURIComponent(activityID)}&stdID=${a.stdID}` },
      { 'Bugs não encontrados': a.emFalta }
    ]
  }));
}

module.exports = { listaAnaliticas, analiticasDaAtividade, alunosExemplo };
