# Feira Técnica 2026 · Colégios Univap

Sistema da Feira Técnica da Unidade Centro: vitrine pública de projetos, área dos alunos, avaliação de professores, avaliação de visitantes, ranking, crachás e QR Codes. O front-end e o back-end ficam nesta pasta.

## Organização

- `src/api/`: regras de negócio, rotas, acesso ao MongoDB e carga inicial dos projetos.
- `src/public/`: páginas ativas, estilos, scripts e imagens exibidos pelo site.
- `tests/`: testes das regras de acesso, importação, avaliação e rankings.
- `tools/`: verificação do front-end, preparação de dados, prévia e manutenção.
- `nginx/conf/`: exemplo de proxy para publicar o sistema em `/feira/`.
- `IMPLANTACAO-ESCOLA.md`: passos para instalar e conferir o sistema no servidor da escola.
- `Server.js` e `index.js`: configuração e inicialização do servidor.
- `data/`: dados privados gerados na instalação; não faz parte do ZIP de entrega.

Os arquivos de interface antigos sem ligação com as telas atuais foram retirados. `visual-system.css` carrega os módulos de estilo que ainda são usados; por isso esses módulos devem permanecer juntos.

## Começar

1. Instale o Node.js e inicie o MongoDB local.
2. Nesta pasta, execute `npm ci`.
3. Execute `npm start` e abra `http://localhost:3000/index.html`.

No primeiro início, o sistema cria automaticamente apenas um administrador com senha forte individual. Abra `data/acessos-iniciais.json` para ver seu e-mail e senha gerada. Esse arquivo é privado e não deve ser publicado. O administrador entra pelo e-mail; cada professor entra com o ID numérico informado pela escola na planilha. Na primeira inicialização desta versão, avaliadores antigos sem ID informado recebem provisoriamente um ID numérico derivado da conta anterior. O administrador pode substituí-lo pelo ID oficial em **Editar professor**. A senha inicial `univap` é aplicada uma vez; reiniciar o servidor não altera a senha novamente.

Ao entrar com `univap`, o professor vê **Segurança da conta · Trocar senha** aberto no painel. Ele informa a senha atual e uma nova senha pessoal forte (8 ou mais caracteres, com maiúscula, minúscula, número e símbolo). A antiga deixa de funcionar, e a senha pessoal é preservada nos reinícios. A opção também fica disponível depois pelo botão **Trocar senha** no painel. Somente a própria conta autenticada pode usar `PUT /api/v1/professores/me/senha`.

Se quiser definir você mesmo a senha do primeiro administrador, configure antes de iniciar:

```powershell
$env:BOOTSTRAP_ADMIN_EMAIL='professor@escola.com'
$env:BOOTSTRAP_ADMIN_PASSWORD='uma-senha-longa-e-unica'
```

A aplicação usa `MONGODB_URI` e `MONGODB_DATABASE` quando definidos; caso contrário, usa `mongodb://localhost:27017` e o banco `feira-tecnica2026`. O arquivo [LEIA-CADASTRO.md](LEIA-CADASTRO.md) traz a configuração completa.

## Publicar em `/feira/`

As páginas, arquivos estáticos e APIs funcionam sob o prefixo `/feira/` (padrão). Por exemplo: `https://escola.example/feira/receberExcel.html` e `https://escola.example/feira/api/v1/projetos`. O endereço sem prefixo continua disponível para desenvolvimento local. Se o servidor usar outro prefixo, defina `APP_BASE_PATH` antes de iniciar, por exemplo `$env:APP_BASE_PATH='/minha-feira'`; use uma string vazia para publicar só na raiz.

Para QR Codes acessíveis pelos celulares, configure o endereço público **com o prefixo**, por exemplo `$env:PUBLIC_BASE_URL='https://escola.example/feira'`. Na prévia local iniciada com `npm start`, se houver exatamente um IP privado ativo na rede, o servidor usa automaticamente esse IP no QR mesmo que o navegador esteja em `localhost`. O telefone precisa estar na mesma rede e ter acesso à porta 3000. A prévia com contas de teste continua restrita ao próprio computador e não usa esse atalho. Na escola, defina `PUBLIC_BASE_URL` com o domínio HTTPS real. O proxy pode encaminhar `/feira/...` ao Node preservando ou removendo o prefixo; o navegador sempre usa URLs relativas à pasta da página. Reinicie o Node após mudar essas variáveis.

## Acessos e dados

- O CSV atualizado está incorporado em `src/api/database/projetos-feira-2026.json`: são 312 projetos carregados automaticamente ao iniciar o servidor. A importação usa uma chave por registro para não duplicar projetos; apresentações editadas pelas equipes são preservadas. O registro 311 do CSV veio sem título e precisa ser conferido pelo administrador.
- O servidor cria automaticamente contas para os participantes do CSV incorporado que tenham matrícula e turma inequívocas e liga cada conta ao projeto correto. Uma simulação com o catálogo completo criou 1.229 acessos e separou 49 pendências. Confira `data/pendencias-importacao.json` após o primeiro início. O arquivo privado `data/cadastro-feira-2026.json`, se existir, é importado primeiro; senhas já trocadas e apresentações editadas são preservadas.
- O aluno entra por matrícula ou por e-mail confirmado. A senha inicial é a turma em letras maiúsculas, por exemplo `2J`. Na área do aluno, em **Segurança da conta**, ele pode trocá-la por uma senha pessoal forte.
- Não há contas administrativas com senha pública de demonstração. A senha do administrador inicial é gerada individualmente e salva em `data/acessos-iniciais.json`.
- Administradores podem cadastrar professores em `professores-novo.html`, pelo botão **Cadastrar professor** na lista. Para avaliadores, informe o ID oficial usando somente números e o nome; o e-mail é opcional. O servidor define `univap` como senha inicial. Para administradores, são exigidos e-mail e senha forte próprios. O servidor exige sessão de administrador nessa página e na API de cadastro.
- Para cadastrar vários professores, use **Importar planilha de professores** na lista. Baixe `modelo-professores.csv` e preencha `ID;Nome`, um professor por linha; o ID aceita apenas dígitos. Formate a coluna ID como texto no Excel para preservar zeros à esquerda e exporte como CSV UTF-8. As colunas `Email`, `Funcao` e `Senha` são opcionais para avaliadores; a função padrão é AVALIADOR. A página permite baixar `resultado-importacao-professores.csv` com sucessos e erros por ID. Guarde esse resultado em local privado. Para ADMINISTRADOR, e-mail e senha forte são obrigatórios. IDs e e-mails já cadastrados aparecem como falha sem alterar a conta existente.

### Professor e administrador de teste (somente local)

Com o MongoDB configurado, execute `npm run start:teste-acessos` e abra `http://localhost:3000/login.html`. Pare antes qualquer servidor que já esteja usando a porta 3000. O comando `npm start` não habilita as contas de teste.

- Professor — ID numérico: `900000000001`; senha: `univap`.
- Administrador — e-mail: `admin-teste@feira.local`; senha: `Univap@2026!`.

As duas contas de teste só aceitam login com `ENABLE_TEST_PROFESSOR=true` fora de produção. O comando acima ativa essa opção apenas para o processo local. Em `NODE_ENV=production`, a aplicação recusa a ativação. As senhas fixas de teste são restauradas ao iniciar esse modo. O e-mail `professor-teste@feira.local` identifica a conta do professor, mas ele entra pelo ID. O administrador inicial real continua com senha individual gerada no primeiro início.

- Há pendências de matrícula e e-mail na planilha original. Consulte [LEIA-CADASTRO.md](LEIA-CADASTRO.md) e `data/pendencias.json` antes de distribuir acessos.
- O arquivo privado de acessos é entregue separadamente, fora deste projeto. Não publique a pasta `data` nem o arquivo de acessos.

## Fluxos

O visitante consulta os projetos e pode dar uma avaliação pública de 1 a 5 estrelas. A avaliação de professores é separada e alimenta o ranking da banca. O aluno edita a apresentação do próprio projeto e gera o QR Code que abre a página pública correspondente. O administrador cuida dos dados oficiais e dos acessos.

Há dois rankings públicos: `ranking.html` usa somente avaliações finalizadas dos professores; `ranking-visitantes.html` usa somente as notas de 1 a 5 dos visitantes. Ambos ordenam pela média real, depois pelo número de avaliações e pelo título do projeto. A média é arredondada apenas para exibição. Filtrar por curso mantém a posição geral da equipe. O ranking dos visitantes permanece visível fora da janela de votação.

A votação começa configurada para **2 de outubro de 2026**, das **7h às 12h** e das **17h às 22h30**, no horário de São Paulo. O administrador pode alterar a data, os períodos e o uso de códigos em `configuracoes-votacao.html`, pelo menu interno. O servidor bloqueia envios fora dos horários; a página do projeto atualiza o estado automaticamente. O modo padrão permite uma nota por projeto neste navegador, com limite de envios por IP. Para uma votação com controle individual, gere os códigos no painel, guarde o CSV baixado e ative “Exigir código”. Um código identifica a mesma pessoa mesmo após limpar os cookies. O modo de identificação não pode ser trocado depois que houver votos.

No celular, a página pública usa menu acessível, capa fotográfica ajustada à tela e filtros que podem ser percorridos com o dedo. A vitrine permite buscar, filtrar por curso e ordenar os títulos de A–Z ou Z–A. Ela mostra 24 projetos por vez; **Mostrar mais projetos** revela os próximos na ordem escolhida. As áreas internas e a página do projeto têm controles e espaçamentos adaptados para toque.

Para abrir o QR Code no celular, o endereço do site precisa ser acessível pelo telefone. Na rede local, abra `http://IP-DO-COMPUTADOR:3000/feira/` no celular para conferir a conexão antes de imprimir o QR. Se houver mais de um IP de rede, configure `PUBLIC_BASE_URL` explicitamente. `localhost` no QR Code não funciona em outro aparelho.

## Segurança e implantação

O servidor gera uma chave de sessão em `data/.jwt-secret` se `JWT_SECRET` não for configurada. Preserve essa chave entre reinícios e use uma mesma `JWT_SECRET` longa em instalações com múltiplos servidores. Sessões expiram em 12 horas, o login tem limite de tentativas e as APIs não aceitam origens externas por padrão. Com HTTPS, configure `NODE_ENV=production` para marcar o cookie como seguro. Se houver um proxy confiável à frente do Node, configure `TRUST_PROXY_HOPS=1` (ou o número real de saltos) para identificar corretamente o IP e o protocolo.

Os códigos de visitante usam `data/.visitor-secret`; preserve também esse arquivo entre reinícios. Em múltiplos servidores, configure a mesma `VISITOR_TICKET_SECRET` longa em todos eles.

Avaliações de professores são vinculadas ao ID da conta e há uma regra de unicidade no MongoDB para impedir duas avaliações do mesmo professor no mesmo projeto. Na primeira inicialização desta versão, avaliações antigas vinculadas apenas pelo nome são migradas quando há um único professor correspondente. Casos ambíguos ficam disponíveis somente para a administração e devem ser conferidos.

Faça uma cópia do MongoDB antes da feira e após o encerramento. Com as ferramentas oficiais do MongoDB instaladas, execute `powershell -File tools/backup-mongo.ps1`; o arquivo será criado em `backups/`, pasta que fica fora do ZIP de entrega. Teste a restauração em um banco separado antes de depender dela.

A senha inicial baseada na turma é previsível. A senha compartilhada `univap` para professores também é fácil de adivinhar. Antes de publicar o sistema na internet, substitua essas senhas iniciais por credenciais individuais ou autenticação institucional; o limite de tentativas de login não resolve esse risco por completo.

## Verificação

```powershell
npm test
node tools/check-frontend.cjs
```

Os testes usam um banco simulado. É necessário testar a conexão com o MongoDB e os fluxos completos no ambiente onde o sistema será usado.

O ZIP de entrega contém uma única pasta do projeto, sem `node_modules`, dados privados ou cópias antigas. Instale as dependências com `npm ci`. As variáveis opcionais estão exemplificadas em `.env.example`; o Node não carrega esse arquivo automaticamente, configure-as no ambiente antes de iniciar.

Para gerar novamente o pacote limpo, execute `pwsh -File tools/package-project.ps1`.
