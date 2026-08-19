# Trabalho de Conclusão de Curso (TCC) — Desenvolvimento de Sistemas

**Repositórios do Projeto**

- **Backend API:** https://github.com/kauan-math/TCC-back-end
- **Frontend Web:** https://github.com/kauan-math/FrontEnd

## Índice

- [1. Documentação Geral do Projeto](#1-documentação-geral-do-projeto)
  - [Introdução](#introdução)
  - [Tecnologias Utilizadas](#tecnologias-utilizadas)
  - [Arquitetura do Sistema](#arquitetura-do-sistema)
- [Como Executar o Projeto](#como-executar-o-projeto)
- [2. Documentação do Backend](#2-documentação-do-backend)
- [3. Banco de Dados](#3-banco-de-dados)
- [4. Documentação do Frontend Web](#4-documentação-do-frontend-web)
- [5. Documentação do Aplicativo Mobile](#5-documentação-do-aplicativo-mobile)
- [6. Documentação do Sistema IoT](#6-documentação-do-sistema-iot)
- [7. Entregáveis do Projeto](#7-entregáveis-do-projeto)
- [8. Critérios de Avaliação Atendidos](#8-critérios-de-avaliação-atendidos)

---

# 1. Documentação Geral do Projeto

## Introdução

### Nome do Projeto

**GymFlow** — Plataforma Web & API RESTful para Gestão Completa de Academias, Estúdios e Centros Esportivos.

### Problema que Resolve

A gestão operacional de academias e centros esportivos enfrenta gargalos frequentes que impactam a rentabilidade e a experiência do aluno:

- **Inadimplência e Descontrole de Mensalidades:** Falta de rastreabilidade do vencimento de assinaturas e cadastros.
- **Fichas de Treino Descentralizadas:** Dificuldade dos instrutores em criar, atualizar e disponibilizar rotinas de exercícios de forma dinâmica.
- **Falta de Monitoramento de Frequência:** Ausência de registro centralizado sobre presenças diárias e picos de utilização do espaço.
- **Gestão Operacional Fragmentada:** Dificuldade na administração de colaboradores, turnos, permissões administrativas e cargos.
- **Gestão Financeira Desconectada:** Falta de consolidação entre receitas (mensalidades) e despesas operacionais (água, luz, internet, manutenção de equipamentos).
  O **GymFlow** resolve estes problemas ao centralizar as operações administrativas, financeiras e pedagógicas em um ecossistema digital integrado, de alta performance e fácil utilização.

### Objetivo

Desenvolver uma solução tecnológica robusta, escalável e desacoplada composta por um **Backend (API RESTful)** e uma **Interface Web (Frontend)** moderna, permitindo:

1. Gestão completa de cadastros (alunos, professores, funcionários, fichas de treino, receitas e despesas);
2. Autenticação segura e controle de acesso baseado em cargos e privilégios (Administrador, Funcionário, Aluno);
3. Fluxo de solicitação e contratação de planos com checkout interativo em múltiplas etapas;
4. Painel analítico para tomada de decisão financeira e acompanhamento da frequência de alunos em tempo real.

### Público-alvo

- **Proprietários e Gestores de Academias:** Visão estratégica, relatórios consolidados e controle financeiro.
- **Administradores e Recepcionistas:** Operação diária, cadastro de alunos, controle de presenças e matrículas.
- **Personal Trainers e Instrutores:** Elaboração, modificação e acompanhamento de fichas de treino.
- **Alunos / Clientes da Academia:** Consulta de planos, treinos atribuídos e histórico de acessos.

---

## Tecnologias Utilizadas

### Backend API

- **Ambiente de Execução:** Node.js (v18+)
- **Linguagem:** TypeScript
- **Framework Web:** Express 5
- **ORM & Banco de Dados:** Prisma ORM 7 + `@prisma/adapter-better-sqlite3`
- **Autenticação & Segurança:** JSON Web Token (`jsonwebtoken`), Hash de Senhas (`bcrypt`)
- **Documentação & Utilitários:** Swagger UI Express (`swagger-ui-express`), `dotenv`, `cors`

### Frontend Web

- **Core:** HTML5, CSS3, JavaScript (ESNext), TypeScript
- **Framework Web:** Next.js 16 (App Router, Turbopack)
- **Biblioteca de Interface:** React 19
- **Estilização:** Tailwind CSS v4, Lucide React (Ícones)
- **Consumo de API:** Axios
- **Visualização de Dados:** Recharts (Gráficos analíticos)
- **Mapeamento:** Leaflet / React-Leaflet

### Banco de Dados

- **SGBD:** SQLite 3 (Armazenamento leve e de alta performance via file-system com suporte relacional via Prisma ORM)

### Ferramentas & Versionamento

- **Versionamento:** Git & GitHub
- **Gerenciador de Pacotes:** npm
- **IDE / Ambiente de Desenvolvimento:** Visual Studio Code / Antigravity Agentic IDE

---

## Arquitetura do Sistema

### Comunicação Entre Sistemas

O GymFlow adota a arquitetura **Cliente-Servidor (API RESTful)** totalmente desacoplada. O Frontend Web construído em Next.js 16 comunica-se de maneira assíncrona com o Backend em Express 5 enviando e recebendo payloads no formato JSON através do protocolo HTTP/HTTPS.

### Fluxo de Dados

1. **Interação do Usuário:** O usuário realiza ações na interface reativa do Next.js.
2. **Requisição HTTP (Axios):** O Frontend dispara requisições para a API REST contendo tokens de autenticação no cabeçalho HTTP (`Authorization: Bearer <token>`).
3. **Validação & Middlewares:** O servidor Express intercepta a requisição, valida a sessão via middleware JWT e verifica as permissões.
4. **Regra de Negócio & Persistência:** Os Controllers executam a lógica de negócio e utilizam a camada de abstração do Prisma ORM para realizar operações CRUD no SQLite.
5. **Resposta HTTP:** A API retorna uma resposta JSON com o código HTTP adequado (ex: 200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 500 Internal Error).

### Estrutura do Projeto

```text
GymFlow/
├── TCC-back-end/                 # Repositório Backend (API RESTful)
│   ├── prisma/
│   │   ├── dev.db               # Banco de dados SQLite
│   │   └── schema.prisma        # Modelagem de tabelas e relacionamentos Prisma
│   ├── src/
│   │   ├── controllers/         # Regras de negócio e manipuladores de rotas
│   │   ├── middlewares/         # Middleware de verificação JWT e autorização
│   │   ├── app.ts               # Configuração do Express, CORS e Swagger
│   │   ├── routes.ts            # Mapeamento central de rotas REST
│   │   └── index.ts             # Inicialização do servidor HTTP
│   ├── package.json
│   └── tsconfig.json
│
└── FrontEnd/                    # Repositório Frontend Web (Next.js 16)
    ├── app/                     # Páginas e rotas da aplicação (App Router)
    │   ├── page.tsx             # Landing Page do produto
    │   ├── login/               # Autenticação de usuários
    │   ├── register/            # Cadastro de usuários
    │   ├── esqueci-senha/       # Recuperação de acesso
    │   ├── solicitar-plano/     # Checkout de assinaturas (3 etapas)
    │   └── academia/            # Painel Administrativo / Dashboard
    ├── components/              # Componentes de interface reutilizáveis
    ├── interfaces/              # Definições de tipos TypeScript
    ├── src/services/            # Configuração do cliente Axios para API
    ├── package.json
    └── tsconfig.json

```

## Como Executar o Projeto

### Pré-requisitos

Node.js: Versão 18.0.0 ou superior instalada.
npm: Gerenciador de pacotes (integrado ao Node.js).
Git: Para clonagem dos repositórios.

### Executando o Backend (`TCC-back-end`)

**Clonar o repositório:**

```bash
git clone https://github.com/kauan-math/TCC-back-end.git
cd TCC-back-end
```

**Instalar as dependências:**

```bash
npm install
```

Configurar as Variáveis de Ambiente: Crie um arquivo .env na raiz do diretório TCC-back-end:

```env
PORT=3000
DATABASE_URL="file:./dev.db"
JWT_SECRET="gymflow_secret_key_tcc_2026"
```

Gerar o Prisma Client e aplicar as tabelas no banco de dados:

```bash
npx prisma db push
```

(Opcional) Popular o banco de dados com dados iniciais (Seed):

```bash
npm run seed
```

Iniciar o servidor em modo de desenvolvimento:

```bash
npm run dev
```

O Backend estará em execução no endereço: http://localhost:3000

### Executando o Frontend Web (`FrontEnd`)

**Clonar o repositório:**

```bash
git clone https://github.com/kauan-math/FrontEnd.git
cd FrontEnd
```

**Instalar as dependências:**

```bash
npm install
```

Configurar as Variáveis de Ambiente: Crie um arquivo .env.local na raiz do diretório FrontEnd:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

Iniciar a aplicação Next.js:

```bash
npm run dev
```

O Frontend estará acessível no navegador através de: http://localhost:3000 (ou http://localhost:3001 caso a porta 3000 esteja ocupada pela API).

## 2. Documentação do Backend

### Arquitetura

O backend utiliza a arquitetura MVC (Model-View-Controller) adaptada para serviços API RESTful, garantindo o desacoplamento de responsabilidades:

- **Routes (`src/routes.ts`):** Definição centralizada dos endpoints da aplicação e associação com controladores e middlewares.
- **Middlewares (`src/middlewares/`):** Camada de interceptação encarregada da validação dos tokens de sessão JWT (`authentication.ts`).
- **Controllers (`src/controllers/`):** Processamento das requisições HTTP, validação de payload e execução das regras de negócio.
- **Model / Data Access Layer (`prisma/schema.prisma`):** Abstração relacional fortemente tipada promovida pelo Prisma ORM.

### API

**Tabela de rotas**

| Método   | Rota                 | Descrição                                     | Autenticação |
| -------- | -------------------- | --------------------------------------------- | ------------ |
| `POST`   | `/login`             | Realiza autenticação e gera token JWT         | Não          |
| `POST`   | `/solicitar-plano`   | Registra solicitação de plano/assinatura      | Não          |
| `GET`    | `/alunos`            | Lista todos os alunos cadastrados             | Sim          |
| `POST`   | `/alunos`            | Cadastra um novo aluno                        | Sim          |
| `GET`    | `/alunos/:id`        | Retorna os detalhes de um aluno               | Sim          |
| `PUT`    | `/alunos/:id`        | Atualiza os dados de um aluno                 | Sim          |
| `DELETE` | `/alunos/:id`        | Remove um aluno do sistema                    | Sim          |
| `GET`    | `/treinos`           | Lista todas as fichas de treino               | Sim          |
| `POST`   | `/treinos`           | Cadastra um novo treino para um aluno         | Sim          |
| `GET`    | `/treinos/:id`       | Retorna os dados de um treino por ID          | Sim          |
| `PUT`    | `/treinos/:id`       | Atualiza um treino existente                  | Sim          |
| `DELETE` | `/treinos/:id`       | Deleta uma ficha de treino                    | Sim          |
| `GET`    | `/funcionarios`      | Lista todos os funcionários e administradores | Sim (ADM)    |
| `POST`   | `/funcionarios`      | Cadastra um novo funcionário                  | Sim (ADM)    |
| `GET`    | `/funcionarios/:id`  | Exibe detalhes de um funcionário              | Sim (ADM)    |
| `PUT`    | `/funcionarios/:id`  | Edita dados de um funcionário                 | Sim (ADM)    |
| `DELETE` | `/funcionarios/:id`  | Remove um funcionário                         | Sim (ADM)    |
| `GET`    | `/receitas`          | Lista todos os pagamentos/receitas            | Sim          |
| `POST`   | `/receitas`          | Registra entrada de pagamento de aluno        | Sim          |
| `GET`    | `/receitas/:id`      | Consulta receita por ID                       | Sim          |
| `PUT`    | `/receitas/:id`      | Edita dados de uma receita                    | Sim          |
| `DELETE` | `/receitas/:id`      | Exclui registro de receita                    | Sim          |
| `GET`    | `/despesas`          | Lista despesas operacionais                   | Sim          |
| `GET`    | `/despesas/summary`  | Traz resumo consolidado do financeiro         | Sim          |
| `POST`   | `/despesas`          | Lança nova despesa operacional                | Sim          |
| `PUT`    | `/despesas/:id`      | Atualiza despesa operacional                  | Sim          |
| `DELETE` | `/despesas/:id`      | Exclui despesa registrada                     | Sim          |
| `POST`   | `/presencas`         | Registra a presença de um aluno no dia        | Sim          |
| `GET`    | `/presencas/hoje`    | Relatório de presenças registradas no dia     | Sim          |
| `POST`   | `/matricular/:id`    | Efetiva matrícula de um aluno                 | Sim          |
| `DELETE` | `/desmatricular/:id` | Cancela matrícula de um aluno                 | Sim          |

### Detalhamento e Exemplos de Requisição

#### 1. Autenticação (`POST /login`)

**Parâmetros: Nenhum.**
**Body JSON:**

```json
{
  "email": "admin@gymflow.com",
  "senha": "123456"
}
```

**Respostas:**
**200 OK: Autenticação realizada com sucesso.**

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "nome": "Carlos Silva",
    "email": "admin@gymflow.com",
    "cargo": "Gerente",
    "adm": true
  }
}
```

**401 Unauthorized: Credenciais inválidas.**

```json
{
  "error": "E-mail ou senha incorretos."
}
```

#### 2. Cadastro de Aluno (`POST /alunos`)

**Headers: Authorization: Bearer <TOKEN>**
**Body JSON:**

```json
{
  "nome": "Lucas Mendes",
  "email": "lucas@email.com",
  "cpf": "123.456.789-00",
  "plano": "Professional",
  "idade": 25,
  "dataNascimento": "1999-05-12T00:00:00.000Z"
}
```

**Respostas:**
**201 Created: Aluno cadastrado.**
**400 Bad Request: Dados obrigatórios ausentes ou CPF já existente.**

#### 3. Cadastro de Treino (`POST /treinos`)

**Headers: Authorization: Bearer <TOKEN>**
**Body JSON:**

```json
{
  "nome": "Treino A - Hipertrofia Peitoral",
  "descricao": "Supino reto 4x10, Supino inclinado 3x12, Crossover 4x12",
  "dificuldade": "Intermediario",
  "duracao": 50,
  "tipoTreino": "Musculacao",
  "alunoId": 1
}
```

**Respostas:**
**201 Created: Treino criado e vinculado ao aluno.**

### Autenticação & Controle de Acesso

Token JWT (JSON Web Token): A aplicação adota o padrão stateless de autenticação. Após a validação das credenciais no endpoint /login, o servidor gera um token assinado contendo o ID e perfil do usuário.
Cabeçalho de Requisição: As rotas protegidas exigem o envio do token no cabeçalho HTTP:
http

Authorization: Bearer <seu_token_jwt>
Criptografia de Senha: As senhas dos usuários e funcionários são armazenadas de forma segura utilizando o algoritmo bcrypt com salting de 10 rodadas.
Controle de Acesso Baseado em Perfis (RBAC):
Administrador (adm: true): Acesso irrestrito a todas as rotas da API, incluindo o gerenciamento da equipe de funcionários e consolidação financeira.
Funcionário (adm: false): Permissão para cadastro de alunos, lançamento de presenças e gestão de treinos.

## 3. Banco de Dados

O banco de dados relacional foi desenvolvido utilizando SQLite3 e abstraído pelo Prisma ORM 7, garantindo integridade referencial, migrações automatizadas e consultas tipadas.

### Relacionamentos entre Entidades

Funcionarios -> alunos: Relacionamento de 1 para N (Um funcionário pode cadastrar/gerenciar múltiplos alunos).
alunos -> treino: Relacionamento de 1 para N (Um aluno possui várias fichas de treino vinculadas ao seu perfil).
alunos -> presenca: Relacionamento de 1 para N (Um aluno registra múltiplos acessos e presenças ao longo do tempo).
receita: Tabela independente para controle do fluxo de caixa de entradas (pagamentos e mensalidades).
despesa: Tabela independente para controle do fluxo de caixa de saídas (contas operacionais e manutenção).

### Tabelas e Estruturas de Dados

### Tabelas e Estruturas de Dados

#### 1. `alunos`

Armazena o cadastro dos alunos matriculados na academia.

| Campo            | Tipo     | Restrições                    | Descrição                                            |
| ---------------- | -------- | ----------------------------- | ---------------------------------------------------- |
| `id`             | Int      | Primary Key, Auto Increment   | Identificador único do aluno                         |
| `nome`           | String   | Not Null                      | Nome completo do aluno                               |
| `email`          | String   | Unique, Not Null              | Endereço de e-mail                                   |
| `cpf`            | String   | Unique, Not Null              | Cadastro de Pessoa Física                            |
| `senha`          | String   | Optional                      | Senha de acesso ao portal do aluno                   |
| `plano`          | String   | Not Null                      | Plano contratado (Starter, Professional, Enterprise) |
| `idade`          | Int      | Optional                      | Idade do aluno                                       |
| `dataNascimento` | DateTime | Optional                      | Data de nascimento                                   |
| `ultimoAcesso`   | DateTime | Optional                      | Data/hora da última presença registrada              |
| `funcionarioId`  | Int      | Foreign Key → Funcionarios.id | Funcionário responsável pelo cadastro                |
| `createdAt`      | DateTime | Default: now()                | Data de criação do registro                          |
| `updatedAt`      | DateTime | UpdatedAt                     | Data da última alteração                             |

#### 2. `Funcionarios`

Armazena a equipe operacional e os gestores administradores.

| Campo       | Tipo     | Restrições                  | Descrição                                         |
| ----------- | -------- | --------------------------- | ------------------------------------------------- |
| `id`        | Int      | Primary Key, Auto Increment | Identificador do colaborador                      |
| `nome`      | String   | Not Null                    | Nome completo                                     |
| `adm`       | Boolean  | Default: false              | Define se possui privilégios de Administrador     |
| `email`     | String   | Unique, Not Null            | E-mail corporativo / login                        |
| `senha`     | String   | Not Null                    | Hash de senha Bcrypt                              |
| `cpf`       | String   | Unique, Not Null            | Documento CPF                                     |
| `clt`       | String   | Not Null                    | Número do registro de trabalho                    |
| `turno`     | String   | Not Null                    | Turno de trabalho (Manhã, Tarde, Noite)           |
| `cargo`     | String   | Not Null                    | Cargo ocupado (Gerente, Recepcionista, Instrutor) |
| `createdAt` | DateTime | Default: now()              | Data de admissão/cadastro                         |
| `updatedAt` | DateTime | UpdatedAt                   | Data de atualização                               |

#### 3. `treino`

Armazena as fichas de exercícios associadas aos alunos.

| Campo         | Tipo     | Restrições                  | Descrição                                  |
| ------------- | -------- | --------------------------- | ------------------------------------------ |
| `id`          | Int      | Primary Key, Auto Increment | Identificador do treino                    |
| `nome`        | String   | Not Null                    | Título do treino (ex: "Treino A - Peito")  |
| `descricao`   | String   | Not Null                    | Lista de exercícios e séries               |
| `dificuldade` | String   | Not Null                    | Nível (Iniciante, Intermediário, Avançado) |
| `duracao`     | Int      | Not Null                    | Duração estimada em minutos                |
| `tipoTreino`  | String   | Not Null                    | Categoria (Musculação, Funcional, Cardio)  |
| `alunoId`     | Int      | Foreign Key → alunos.id     | Vínculo com o aluno                        |
| `createdAt`   | DateTime | Default: now()              | Data de criação da ficha                   |

#### 4. `receita`

Mapeia as entradas financeiras (mensalidades e vendas de planos).

| Campo            | Tipo     | Restrições                  | Descrição                               |
| ---------------- | -------- | --------------------------- | --------------------------------------- |
| `id`             | Int      | Primary Key, Auto Increment | Identificador da receita                |
| `pagamento`      | String   | Not Null                    | Descrição da transação                  |
| `dataPagamento`  | DateTime | Not Null                    | Data de efetivação                      |
| `valorPagamento` | String   | Not Null                    | Valor monetário recebido                |
| `status`         | String   | Not Null                    | Situação (Pago, Pendente, Cancelado)    |
| `formaPagamento` | String   | Not Null                    | Método (Pix, Cartão de Crédito, Boleto) |

#### 5. `despesa`

Mapeia os custos operacionais do estabelecimento.

| Campo            | Tipo     | Restrições                  | Descrição                                   |
| ---------------- | -------- | --------------------------- | ------------------------------------------- |
| `id`             | Int      | Primary Key, Auto Increment | Identificador da despesa                    |
| `descricao`      | String   | Not Null                    | Descrição do custo (ex: "Conta de Energia") |
| `valor`          | Float    | Not Null                    | Valor monetário da conta                    |
| `categoria`      | String   | Not Null                    | LUZ, AGUA, INTERNET, MANUTENCAO, OUTROS     |
| `dataVencimento` | DateTime | Not Null                    | Data limite para pagamento                  |
| `dataPagamento`  | DateTime | Optional                    | Data em que foi quitada                     |
| `status`         | String   | Not Null                    | PAGO, PENDENTE                              |

#### 6. `presenca`

Registra a frequência de acesso dos alunos ao espaço físico.

| Campo      | Tipo     | Restrições                  | Descrição                         |
| ---------- | -------- | --------------------------- | --------------------------------- |
| `id`       | Int      | Primary Key, Auto Increment | Identificador do registro         |
| `alunoId`  | Int      | Foreign Key → alunos.id     | Aluno que efetuou o acesso        |
| `dataHora` | DateTime | Default: now()              | Carimbo de data e hora da entrada |

## 4. Documentação do Frontend Web

### Telas da Aplicação

#### 1. Landing Page (`/`)

**Objetivo:** Apresentação comercial do ecossistema GymFlow para novos clientes e academias.
**Funcionalidades:**
Hero Banner promocional com botão de chamada para ação (CTA);
Seção de benefícios operacionais e tecnológicos da plataforma;
Apresentação de funcionalidades da solução;
Tabela dinâmica de preços e planos (Starter, Professional, Enterprise);
Formulário de contato e localização via mapa interativo Leaflet.

#### 2. Tela de Login (`/login`)

**Objetivo:** Ponto de entrada único para autenticação de gestores, recepcionistas e alunos.
**Funcionalidades:**
Formulário de autenticação com validação de formato de e-mail e senha;
Integração assíncrona com o endpoint POST /login;
Armazenamento seguro do Token JWT no localStorage do navegador;
Redirecionamento automático para o Painel Administrativo (/academia).

#### 3. Tela de Cadastro (`/register`)

**Objetivo:** Permitir a criação inicial de conta para novos usuários e gestores.
**Funcionalidades:**
Validação de formulário (nome, e-mail, senha, CPF e telefone);
Tratamento de mensagens de erro amigáveis enviadas pela API;
Botão de redirecionamento rápido para a tela de login.

#### 4. Recuperação de Senha (`/esqueci-senha`)

**Objetivo:** Fluxo de autoatendimento para recuperação de senhas esquecidas.
**Funcionalidades:**
Inserção de e-mail cadastrado;
Disparo de instruções para redefinição de credencial.

#### 5. Checkout / Solicitação de Planos (`/solicitar-plano`)

**Objetivo:** Processo intuitivo de contratação de assinaturas em 3 etapas consecutivas.
**Funcionalidades:**
Etapa 1 (Dados & Plano): Seleção da periodicidade (Mensal ou Anual com 20% de desconto), escolha do plano e preenchimento dos dados da academia (Nome, Responsável, E-mail, CPF/CNPJ, Telefone).
Etapa 2 (Pagamento): Escolha da forma de pagamento:
Cartão de Crédito: Cartão interativo com animação de virada 3D e validação em tempo real;
Pix: Geração simulada de QR Code e Timer de expiração de 15 minutos;
Boleto Bancário: Emissão de código digitável com botão de cópia rápida.
Etapa 3 (Confirmação): Exibição do recibo digital com resumo do pedido e botão de acesso direto ao dashboard.
**Navegação:** Botão "Voltar" fixo no topo permitindo retorno à Landing Page a qualquer momento.

#### 6. Painel Administrativo / Dashboard (`/academia`)

**Objetivo:** Central de gerenciamento da academia com visualização em abas.
**Funcionalidades:**
Módulo Alunos: Tabela com busca, ordenação, cadastro, edição e exclusão de alunos;
Módulo Treinos: Interface para personal trainers criarem e atribuírem treinos por aluno;
Módulo Funcionários: (Exclusivo ADM) Controle da equipe, atribuição de cargos, turnos de trabalho e controle de permissões;
Módulo Financeiro: Painel analítico de controle de caixa com gráficos Recharts exibindo o balanço entre Receitas e Despesas por categoria (Água, Luz, Internet, Manutenção);
Módulo Presenças: Histórico de entradas em tempo real e listagem de acessos do dia.

### Fluxo de Navegação do Usuário

**Acesso Inicial:** O usuário entra na Landing Page (/).
**Contratação de Plano:** A partir da Landing Page, clica em "Selecionar Plano" e é direcionado para a tela de Checkout (/solicitar-plano). Após a conclusão do pagamento, é direcionado ao Dashboard (/academia).
**Autenticação Direta:** A partir da Landing Page, o usuário clica em "Entrar" e é levado à tela de Login (/login).
**Caso não possua cadastro,** clica em "Cadastre-se" para ir à tela de Cadastro (/register).
**Caso tenha esquecido a senha,** clica em "Esqueceu a senha?" para ir à tela de Recuperação (/esqueci-senha).
**Ao autenticar com sucesso no Login,** é direcionado ao Dashboard (/academia).

## 5. Documentação do Aplicativo Mobile

O escopo atual do projeto entrega Backend API RESTful (Categoria 1), Frontend Web em Next.js 16 (Categoria 2.A) e Banco de Dados Relacional Prisma/SQLite (Categoria 2.D), cumprindo integralmente a exigência de desenvolver o Backend acompanhado de no mínimo 2 categorias adicionais.

### Preparação Arquitetural para Aplicativo Mobile Futuro

A API RESTful desenvolvida em Node.js/Express possui arquitetura genérica e desacoplada, pronta para integração nativa com um Aplicativo Mobile (React Native ou Flutter) sem a necessidade de alterações no servidor:

Autenticação: O fluxo JWT utilizado pelas rotas de /login permite a persistência de sessão em dispositivos móveis via AsyncStorage ou SecureStore.
Rotas de Consulta para o Aluno:
GET /treinos: Permite ao aluno consultar sua ficha de treinos no celular dentro da academia;
GET /presencas/hoje: Permite ao aluno acompanhar seu histórico semanal de acessos;
POST /solicitar-plano: Permite a renovação ou upgrade de plano direto do dispositivo móvel.

## 6. Documentação do Sistema IoT

A arquitetura da API backend foi projetada com endpoints desacoplados preparados para integração com hardware e dispositivos de Internet das Coisas (IoT).

### Preparação Arquitetural para Dispositivos IoT (Catracas Inteligentes)

O endpoint POST /presencas foi modelado especificamente para receber chamadas diretas de microcontroladores (ex: ESP32 ou Arduino com módulo Ethernet/Wi-Fi) acoplados a leitores RFID/Biométricos em catracas físicas:

#### Fluxo de Comunicação IoT

Acesso do Aluno: O aluno aproxima seu cartão RFID ou biometria no leitor da catraca física.
Envio da Leitura: O microcontrolador ESP32 captura a identificação e envia uma requisição POST /presencas com o payload {"alunoId": 10} e o cabeçalho Authorization: Bearer <IoT_Token>.
Processamento: A API valida o token, grava a entrada no banco de dados SQLite e atualiza o carimbo de ultimoAcesso.
Resposta e Liberação: A API retorna HTTP 201 Created. O microcontrolador recebe a confirmação e aciona o relé que destrava a catraca física para a passagem do aluno.
Hardware Recomendado: Microcontrolador ESP32 + Leitor RFID MFRC522 + Relé de acionamento de solenoide.
Payload IoT: Envio de requisição leve via protocolo HTTP REST JSON para a rota /presencas.

## 7. Entregáveis do Projeto

Conforme exigido pelas diretrizes do TCC, o grupo disponibiliza os seguintes entregáveis funcionais:

- **Código-fonte do Backend:** Repositório completo Node.js/TypeScript (`TCC-back-end`).
- **Código-fonte do Frontend Web:** Repositório completo Next.js 16/React 19 (`FrontEnd`).
- **Documentação Técnica Completa:** Especificação contida no arquivo `README.md`.
- **Scripts e Estrutura de Banco de Dados:** Modelagem declarativa `schema.prisma` e script de povoamento inicial `seed.ts`.
- **Demonstração Funcional:** Código pré-configurado e pronto para execução e testes em ambiente local.

## 8. Critérios de Avaliação Atendidos

- **Desenvolvimento Técnico:** Código totalmente estruturado em TypeScript, arquitetura desacoplada Cliente-Servidor via API RESTful, segurança com JWT e Bcrypt, ORM relacional Prisma 7 e interface reativa estilizada com Tailwind CSS v4.
- **Organização do Repositório:** Separação clara de responsabilidades no backend (`routes`, `controllers`, `middlewares`) e componentes modulares e páginas bem delimitadas no frontend (`app/`, `components/`, `services/`).
- **Documentação:** README explicativo abordando a contextualização do problema, arquitetura do sistema, fluxos de dados e navegação em texto, detalhamento completo das rotas da API, dicionário de dados do banco e guia passo a passo para deploy local.
