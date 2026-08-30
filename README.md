# API REST - Sistema de Gestão RH

Sistema de gerenciamento de funcionários e cargos com autenticação JWT.

## 👨‍💻 Autor

**Helio Esperidião**

[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/helioesperidiao/api_js_funcionario_cargo)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/helioesperidiao/)
[![Website](https://img.shields.io/badge/website-000000?style=for-the-badge&logo=About.me&logoColor=white)](http://helioesperidiao.com/)


## 🛠️ Tecnologias

- Node.js
- Express.js 
- MySQL
- JWT para autenticação
- bcrypt para criptografia
- Bootstrap 5 para interface

## 🚀 Instalação

1. Clone o repositório
2. Instale as dependências:

```bash
npm install
```

3. Configure o banco MySQL em `api/database/MysqlDatabase.js`:

```js
{
    host: "localhost",
    user: "root", 
    password: "",
    database: "gestao_rh",
    port: 3306
}
```

4. Execute o script SQL em `docs/Banco.sql`

5. Inicie o servidor:

```bash
npm start
```

## 🔑 Autenticação

Todas as rotas (exceto login) exigem token JWT no header:

```
Authorization: Bearer <token>
```

## 📡 Endpoints

### Autenticação

#### POST /api/v1/funcionarios/login
Login do funcionário

```json
{
  "funcionario": {
    "email": "exemplo@email.com",
    "senha": "Senha@123"
  }
}
```

### Funcionários

#### POST /api/v1/funcionarios
Criar novo funcionário

```json
{
  "funcionario": {
    "nomeFuncionario": "João Silva",
    "email": "joao@email.com", 
    "senha": "Senha@123",
    "recebeValeTransporte": 1,
    "cargo": {
      "idCargo": 1
    }
  }
}
```

#### PUT /api/v1/funcionarios/:idFuncionario
Atualizar funcionário existente

```json
{
  "funcionario": {
    "nomeFuncionario": "João Silva Atualizado",
    "email": "joao@email.com",
    "senha": "NovaSenha@123",
    "recebeValeTransporte": 0,
    "cargo": {
      "idCargo": 2
    }
  }
}
```

#### GET /api/v1/funcionarios
Listar todos os funcionários

#### GET /api/v1/funcionarios/:idFuncionario
Buscar funcionário por ID

#### DELETE /api/v1/funcionarios/:idFuncionario
Remover funcionário

### Cargos

#### POST /api/v1/cargos
Criar novo cargo

```json
{
  "cargo": {
    "nomeCargo": "Desenvolvedor"
  }
}
```

#### PUT /api/v1/cargos/:idCargo
Atualizar cargo existente

```json
{
  "cargo": {
    "nomeCargo": "Desenvolvedor Senior"
  }
}
```

#### GET /api/v1/cargos
Listar todos os cargos

#### GET /api/v1/cargos/:idCargo  
Buscar cargo por ID

#### DELETE /api/v1/cargos/:idCargo
Remover cargo

## 🔒 Validações

### Funcionário

- Nome: mínimo 3 caracteres
- Email: formato válido (exemplo@dominio.com)
- Senha: mínimo 6 caracteres, 1 número, 1 maiúscula, 1 caractere especial
- Vale transporte: 0 ou 1
- Cargo: ID válido e existente

### Cargo

- Nome: mínimo 3 caracteres, máximo 64
- Nome único no sistema

## 📁 Estrutura do Projeto

```
├── api/
│   ├── controllers/    # Controladores da API
│   ├── dao/           # Camada de acesso ao banco
│   ├── database/      # Configuração do MySQL
│   ├── http/          # Implementação JWT
│   ├── middleware/    # Middlewares de validação
│   ├── models/        # Modelos de dados
│   ├── routes/        # Rotas da API
│   ├── services/      # Regras de negócio
│   ├── system/        # Logs do sistema
│   └── utils/         # Utilitários
├── docs/             # Documentação
├── static/           # Frontend
└── Server.js        # Configuração do servidor
```

## 🖥️ Interface Web

Acesse http://localhost:8080/Login.html

Credenciais padrão:
- Email: helioesperidiao@gmail.com
- Senha: @Helio123456

## 📄 Licença

Este projeto está sob a licença GPL. Veja o arquivo LICENSE para mais detalhes.