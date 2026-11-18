# Bug Hunt

Activity Provider para a plataforma Inven!RA, desenvolvido no âmbito da UC Arquitetura e Padrões de Software (MEIW, UAb/UTAD).

Na atividade Bug Hunt, o aluno explora uma página-alvo com bugs plantados e submete um relatório por cada bug encontrado. Nesta fase o serviço responde aos cinco pedidos da Inven!RA com URL fixo, usando dados de exemplo.

## Serviços

| Pedido | Método | Caminho |
|---|---|---|
| Página de configuração (config_url) | GET | `/config` |
| Parâmetros de configuração (json_params_url) | GET | `/json-params` |
| Deploy da atividade (user_url) | GET | `/deploy?activityID=<id>` |
| Analíticas da atividade (analytics_url) | POST | `/analytics` com `{"activityID": "<id>"}` |
| Lista de analíticas (analytics_list_url) | GET | `/analytics-list` |

O serviço "Provide activity" ainda não está implementado.

## Executar localmente

Requer Node.js 18 ou superior. Não tem dependências externas.

```
npm start
```

O servidor fica disponível em `http://localhost:3000`.

## Estrutura

- `server.js` - receção dos pedidos e encaminhamento para cada serviço
- `src/configuracao.js` - página de configuração e lista de parâmetros
- `src/analiticas.js` - lista de analíticas e dados de exemplo
- `src/instancias.js` - registo das instâncias criadas no deploy

Autora: Mariana Siqueira
