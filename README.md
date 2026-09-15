# Sistema da Feira Técnica

Aplicação web para organizar projetos, equipes, avaliações e a experiência pública da Feira Técnica. O backend usa Node.js, Express e MongoDB; o frontend é servido pela própria aplicação.

## Executar

```powershell
npm install
npm start
```

Depois abra:

```text
http://localhost:3000
```

O MongoDB precisa estar disponível em `localhost:27017`. O banco padrão é `feira-tecnica2026`.

## Perfis

| Perfil | Função principal |
|---|---|
| Administrador | Importa dados oficiais, gerencia professores/alunos/projetos e acompanha avaliações |
| Avaliador | Consulta projetos e registra avaliações |
| Aluno | Atualiza somente a apresentação pública do próprio projeto, acessa crachá e QR Code |
| Visitante | Consulta a vitrine e o ranking público sem acessar dados internos |

### Contas locais de demonstração

| Perfil | Identificação | Senha |
|---|---|---|
| Administrador | `admin@feira.com` | `Admin@2026` |
| Avaliador | `avaliador@feira.com` | `Avaliador@2026` |
| Aluno | `aluno@feira.com` ou `20260001` | `Aluno@2026` |

As contas são criadas automaticamente quando ainda não existem no banco local.

## Fluxo de dados

Os dados oficiais dos estudantes e das equipes são importados pela organização. O aluno não altera nome, matrícula, turma, curso, integrantes ou necessidades da equipe; ele edita apenas os campos de apresentação permitidos pelo backend.

O arquivo `src/public/modelo-planilha-feira.csv` contém um modelo de importação.

## Estrutura

```text
src/
├── api/
│   ├── controllers/   # entrada e saída HTTP
│   ├── dao/           # acesso ao MongoDB
│   ├── database/      # conexão com o banco
│   ├── http/          # JWT
│   ├── middleware/    # autenticação e validação
│   ├── models/        # regras das entidades
│   ├── routes/        # rotas da API
│   ├── services/      # regras de negócio
│   └── utils/         # logger, erros e QR Code
└── public/
    ├── css/
    ├── imagens/
    ├── js/
    └── *.html
```

## Páginas principais

```text
/login.html          entrada de aluno/professor e acesso do visitante
/index.html          vitrine pública
/ranking.html        ranking público
/aluno.html          área do aluno
/cracha-aluno.html   crachá do aluno
/dashboard.html      painel interno
```

## Desenvolvimento

Para reiniciar automaticamente ao salvar arquivos:

```powershell
npm run dev
```

Não coloque `node_modules` no ZIP ou no Git. As dependências são restauradas com `npm install`.
