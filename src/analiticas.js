// Nesta fase os dados são de exemplo: um catálogo de bugs plantados por página-alvo e os
// relatórios submetidos por três alunos. As analíticas são calculadas a partir desses relatórios.

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

// Bugs "semeados" em cada página-alvo
const catalogoBugs = {
  'loja-checkout': [
    { id: 'LC1', tipo: 'validacao', descricao: 'O código postal aceita letras' },
    { id: 'LC2', tipo: 'calculo', descricao: 'O IVA é arredondado para baixo no total' },
    { id: 'LC3', tipo: 'calculo', descricao: 'Os portes são cobrados duas vezes acima de 50 €' },
    { id: 'LC4', tipo: 'mensagens', descricao: 'Pagamento recusado mostra só "Ocorreu um erro"' },
    { id: 'LC5', tipo: 'interface', descricao: 'O botão "Pagar" não fica desativado durante o envio' }
  ],
  'formulario-inscricao': [
    { id: 'FI1', tipo: 'validacao', descricao: 'Um email sem @ é aceite' },
    { id: 'FI2', tipo: 'validacao', descricao: 'A data de nascimento pode ser no futuro' },
    { id: 'FI3', tipo: 'mensagens', descricao: 'O erro da password aparece por baixo do campo do email' },
    { id: 'FI4', tipo: 'interface', descricao: 'A tecla Tab salta o campo do telefone' }
  ],
  'simulador-credito': [
    { id: 'SC1', tipo: 'calculo', descricao: 'A prestação ignora a TAEG' },
    { id: 'SC2', tipo: 'calculo', descricao: 'Um prazo de 0 meses dá erro de divisão' },
    { id: 'SC3', tipo: 'validacao', descricao: 'Um montante negativo é aceite' },
    { id: 'SC4', tipo: 'mensagens', descricao: 'Não há aviso quando o montante passa o limite' }
  ]
};

// Relatórios de exemplo: bug = id do bug encontrado, ou null quando é um falso positivo
const alunosExemplo = [
  {
    stdID: '1001',
    paginaAlvo: 'loja-checkout',
    concluiu: true,
    relatorios: [
      { minuto: 4, bug: 'LC1', completo: true, texto: 'Escrevi "ABCD-123" no código postal e a encomenda avançou.' },
      { minuto: 9, bug: 'LC2', completo: true, texto: 'Com 3 artigos de 9,99 € o total com IVA fica 1 cêntimo abaixo do esperado.' },
      { minuto: 15, bug: 'LC4', completo: false, texto: 'Erro estranho ao pagar.' },
      { minuto: 18, bug: null, completo: true, texto: 'O campo do cupão é demasiado pequeno.' }
    ]
  },
  {
    stdID: '1002',
    paginaAlvo: 'formulario-inscricao',
    concluiu: false,
    relatorios: [
      { minuto: 6, bug: 'FI1', completo: true, texto: 'Inscrevi-me com "maria.gmail.com" e o formulário aceitou.' },
      { minuto: 12, bug: null, completo: false, texto: 'A página é lenta.' },
      { minuto: 14, bug: null, completo: true, texto: 'O logótipo está desalinhado em ecrãs pequenos.' }
    ]
  },
  {
    stdID: '1003',
    paginaAlvo: 'simulador-credito',
    concluiu: true,
    relatorios: [
      { minuto: 3, bug: 'SC3', completo: true, texto: 'Montante de -5000 € gera uma prestação negativa.' },
      { minuto: 7, bug: 'SC2', completo: true, texto: 'Com prazo 0 aparece "NaN" na prestação.' },
      { minuto: 11, bug: 'SC1', completo: true, texto: 'A prestação é igual com TAEG de 5% e de 15%.' },
      { minuto: 20, bug: 'SC4', completo: false, texto: 'Montantes muito altos passam.' }
    ]
  }
];

function calcularAnaliticas(aluno) {
  const bugsDaPagina = catalogoBugs[aluno.paginaAlvo];
  const validos = aluno.relatorios.filter(r => r.bug !== null);
  const encontrados = new Set(validos.map(r => r.bug));
  const naoEncontrados = bugsDaPagina.filter(b => !encontrados.has(b.id));

  return {
    concluiu: aluno.concluiu,
    bugsEncontrados: encontrados.size,
    percentagem: Math.round((encontrados.size / bugsDaPagina.length) * 100),
    falsosPositivos: aluno.relatorios.length - validos.length,
    relatoriosCompletos: aluno.relatorios.filter(r => r.completo).length,
    primeiroBug: validos.length ? Math.min(...validos.map(r => r.minuto)) : 0,
    naoEncontrados: naoEncontrados.map(b => `${b.tipo}: ${b.descricao}`).join('; ') || 'nenhum'
  };
}

function analiticasDaAtividade(activityID, urlBase) {
  return alunosExemplo.map(aluno => {
    const a = calcularAnaliticas(aluno);
    return {
      inveniraStdID: aluno.stdID,
      quantAnalytics: [
        { name: 'Concluiu a atividade', value: a.concluiu },
        { name: 'Bugs encontrados', value: a.bugsEncontrados },
        { name: 'Percentagem de bugs encontrados', value: a.percentagem },
        { name: 'Falsos positivos', value: a.falsosPositivos },
        { name: 'Relatórios completos', value: a.relatoriosCompletos },
        { name: 'Tempo até ao primeiro bug (min)', value: a.primeiroBug }
      ],
      qualAnalytics: [
        { 'Relatórios submetidos': `${urlBase}/relatorios?activityID=${encodeURIComponent(activityID)}&stdID=${aluno.stdID}` },
        { 'Bugs não encontrados': a.naoEncontrados }
      ]
    };
  });
}

// Usado pela página /relatorios (analítica qualitativa)
function relatoriosDoAluno(stdID) {
  const aluno = alunosExemplo.find(a => a.stdID === stdID);
  if (!aluno) return null;
  const bugsDaPagina = catalogoBugs[aluno.paginaAlvo];
  return {
    paginaAlvo: aluno.paginaAlvo,
    relatorios: aluno.relatorios.map(r => {
      const bug = bugsDaPagina.find(b => b.id === r.bug);
      return { ...r, resultado: bug ? `${bug.tipo}: ${bug.descricao}` : 'falso positivo' };
    })
  };
}

module.exports = { listaAnaliticas, analiticasDaAtividade, relatoriosDoAluno, catalogoBugs, alunosExemplo };
