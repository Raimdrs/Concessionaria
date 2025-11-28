# 🚗 Gestão de Concessionária (MERN Stack)

Sistema completo para gestão de estoque, vendas e performance financeira de concessionárias de veículos. Desenvolvido com a stack MERN (MongoDB, Express, React, Node.js).

## 📋 Funcionalidades

- **Gestão de Estoque:** CRUD completo (Criar, Ler, Atualizar, Deletar) de veículos.
- **Multi-lojas:** Gerenciamento de múltiplas filiais/concessionárias.
- **Financeiro Inteligente:** Cálculo automático de Markup (ROI) e Lucro Líquido.
- **Dashboard:** Gráficos interativos (Chart.js) para análise de distribuição e valores.
- **Detalhes do Veículo:** Suporte a fotos (Base64), quilometragem, condição (Novo/Usado) e chassis.
- **Relatórios:** Exportação de dados para Excel (.csv).

## 🚀 Tecnologias Utilizadas

### Frontend (concessionaria-app)
- **React.js** (Vite)
- **Axios** (Comunicação com API)
- **Chart.js** (Gráficos)
- **React Icons** (Ícones)
- **CSS3** (Estilização responsiva)

### Backend (backend)
- **Node.js**
- **Express** (Servidor API REST)
- **MongoDB** (Banco de dados NoSQL)
- **Mongoose** (Modelagem de dados)
- **Nodemon** (Hot reload)

---

## 📦 Pré-requisitos

Antes de começar, você precisa ter instalado em sua máquina:
1. [Node.js](https://nodejs.org/en/) (v14 ou superior)
2. [MongoDB Community Server](https://www.mongodb.com/try/download/community) (Rodando localmente)

---

## 🔧 Como Rodar o Projeto

Este projeto é dividido em duas partes: **Backend** (Servidor) e **Frontend** (Interface). Você precisará de dois terminais abertos.

### Passo 1: Configurar e Rodar o Backend

Abra o primeiro terminal na raiz do projeto:

```bash
# Entre na pasta do backend
cd backend

# Instale as dependências
npm install

# Inicie o servidor
npm start

O servidor rodará em: http://localhost:5000 (Certifique-se de que o MongoDB está rodando no seu computador).
```

### Passo 2: Configurar e Rodar o Frontend

Abra um segundo terminal na raiz do projeto:

```bash
# Entre na pasta do frontend
cd concessionaria-app

# Instale as dependências
npm install

# Inicie a aplicação React
npm run dev

Acesse a aplicação no navegador em: http://localhost:5173
```


### 🔌 API Endpoints

| Método | Rota | Descrição |
| :--- | :--- | :--- |
| `GET` | `/api/veiculos` | Lista todos os veículos (Estoque e Vendidos) |
| `POST` | `/api/veiculos` | Cadastra um novo veículo no sistema |
| `PUT` | `/api/veiculos/:id` | Atualiza dados de um veículo ou registra venda |
| `DELETE` | `/api/veiculos/:id` | Remove um veículo permanentemente |
| `GET` | `/api/concessionarias` | Lista todas as concessionárias cadastradas |
| `POST` | `/api/concessionarias` | Cria uma nova concessionária |
| `DELETE` | `/api/concessionarias/:id` | Remove uma concessionária existente |
