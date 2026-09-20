# Feira Técnica 2026 · UNIVAP

Projeto unificado a partir de **feira-tecnica-interface-refinada-avaliador(1)** (base principal) e **feira-tecnica-main (2)(1)**. A estrutura Express → Router → Middleware → Controller → Service → DAO → MongoDB foi preservada.

## Executar no seu computador

1. Extraia este ZIP em uma nova pasta. Abra no VS Code a pasta que contém `package.json` e `Server.js`.
2. Deixe o serviço MongoDB em execução. O Compass é apenas a interface de consulta e não precisa ficar aberto.
3. No terminal dessa pasta, execute um comando por vez:

```powershell
npm install
npm start
```

4. Deixe esse terminal aberto. No navegador, acesse:

```text
http://localhost:3000/login.html
```

A vitrine fica em `http://localhost:3000/index.html`. Não abra os HTMLs diretamente com `file://` ou Live Server: a autenticação e as APIs são servidas pelo Node.

O banco continua sendo `feira-tecnica2026`, em `localhost:27017`. Nenhuma migração ou exclusão do banco é necessária. Os dados que já estavam no seu MongoDB continuam sendo usados.

Se aparecer `EADDRINUSE`, pare a outra instância do projeto com Ctrl+C no terminal em que ela está rodando. Depois inicie esta versão.

## Acessos locais de demonstração

São os mesmos criados pelo seed da base principal, caso ainda não existam:

| Perfil selecionado na tela | Identificação | Senha inicial |
| --- | --- | --- |
| Professor — administrador | admin@feira.com | Admin@2026 |
| Professor — avaliador | avaliador@feira.com | Avaliador@2026 |
| Aluno | aluno@feira.com ou 20260001 | Aluno@2026 |

Se essas contas já existem com outras senhas, o seed não sobrescreve as senhas. Visitantes acessam a vitrine sem login, conforme o comportamento da base principal. Cadastro de visitantes e votação por e-mail não foram acrescentados nesta entrega.

## O que foi unificado

| Área | Resultado |
| --- | --- |
| Identidade visual | Azul institucional, branco, vermelho em detalhes; tipografia, formulários e navegação compartilhados |
| Login | Tela com seleção de perfil e apresentação da feira; mantém os endpoints e a sessão existentes |
| Vitrine e projeto público | Apresentação editorial, filtros por curso, busca, galeria, equipe e localização |
| Ranking | Classificação geral e por curso, atualização periódica da base principal |
| Avaliador | Fila de projetos, notas por critério, avaliações individuais e revisão preservadas |
| Administração | Cadastros, edição de projetos, localização do estande, acessos e importação |
| Aluno | Apenas apresentação, etapa, fotos, tecnologias e links editáveis |
| Crachá | Participante escolhido da equipe oficial, foto e função; nome preenchido automaticamente; impressão de até dois crachás por A4 |
| QR Code e estande | Busca por matrícula do segundo projeto incorporada para administradores; QR do próprio projeto para alunos; download e placa A4 dobrável |
| Importação | CSV com vírgula ou ponto e vírgula, acentos, aspas e quebras de linha; validação de cabeçalhos |

O tema, curso, equipe, matrículas, turmas, e-mails, equipamentos, necessidades, observações e localização são dados oficiais. Não são pedidos novamente ao aluno. A equipe e o tema continuam visíveis como referência. Correções oficiais ficam com a administração.

A importação cadastra projetos usando o modelo `src/public/modelo-planilha-feira.csv`. Ela não cria automaticamente todas as contas de alunos: os acessos continuam sendo administrados em **Acessos dos alunos → Criar acesso**, como na base original. CSV não é a mesma coisa que XLSX; exporte a planilha como CSV antes de enviar.

## QR no celular e impressão

Em **QR Code e estande**, o administrador pesquisa a matrícula; o aluno recebe seu próprio projeto automaticamente. A placa imprime as duas faces de uma folha A4 para dobrar ao meio. O QR abre a página pública do projeto, não uma votação.

`localhost` aponta para o próprio aparelho. Para testar com um celular, computador e celular precisam estar na mesma rede, e o sistema deve ser aberto pelo endereço de rede do computador (por exemplo, `http://192.168.0.10:3000`). Gere o QR a partir desse endereço. O exemplo de IP deve ser substituído pelo IP real do seu computador.

Na impressão dos crachás e da placa, selecione A4, escala de 100%, sem cabeçalhos e rodapés; habilite gráficos de plano de fundo para manter as cores.

## Alterações no backend

Foram necessárias alterações pequenas e explícitas:

- `ProjetoService.js`: incorpora a geração de QR por matrícula do segundo projeto e retira `tema` e `localizacao` dos campos editáveis por aluno. A verificação de propriedade do projeto foi mantida.
- `ProjetoController.js` e `ProjetoRouter.js`: incorporam `GET /api/v1/projetos/buscar-matricula`, restrito a administrador, do segundo projeto.
- `Server.js`: protege `qrcodes.html` para administrador e aluno.

Models, DAOs, banco, autenticação, seed e regras de notas permanecem os da base principal. A página de edição administrativa permite corrigir a localização que o aluno já não edita.

As antigas URLs `prisma.html` e `QrCode.html` encaminham para a tela unificada. As demonstrações de cargos/funcionários, HTML de teste de PDF, nginx, dumps e dependências empacotadas não foram trazidos ao projeto final. As funções úteis de impressão foram incorporadas aos fluxos ativos.

## Organização do front-end

- `src/public/css/feira.css`: identidade e componentes compartilhados, vitrine e responsividade.
- `css/login.css`, `css/student.css`, `css/evaluator.css`, `css/qr-print.css`: estilos específicos e impressão.
- `js/navigation.js`: menu consistente por perfil.
- `js/auth.js`: sessão e cliente das APIs, preservado da base principal.
- `js/csv.js`: leitura do CSV.
- `js/qrcodes.js`: consulta e impressão do QR.

O projeto não depende de fontes, ícones ou bibliotecas visuais carregadas de CDN.

## Verificação

```powershell
npm test
```

Os **9 testes automatizados passaram**. Cobrem preservação de dados oficiais, edição administrativa, bloqueio de edição de outra equipe, QR por matrícula, permissões da rota e leitura do CSV. Os testes usam DAO em memória e autenticação simulada; não alteram o MongoDB.

Também foram conferidos sintaxe JavaScript, IDs de elementos, destinos locais e referências de arquivos. Não foi possível executar o navegador de teste neste ambiente; a conferência visual, a impressão física e o fluxo completo conectado ao MongoDB real ainda precisam ser feitos no localhost.

Roteiro de conferência: entrar em cada perfil; abrir projeto; salvar apresentação pelo aluno; imprimir crachá e placa; importar um CSV de teste; avaliar e revisar um projeto; consultar ranking; repetir a navegação em uma janela estreita. Use dados de teste para não alterar notas reais.
