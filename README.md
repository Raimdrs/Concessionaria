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

Para rodar este projeto, você só precisa de uma ferramenta instalada:

* **[Docker Desktop](https://www.docker.com/products/docker-desktop/)** (O Docker Compose já vem junto).

> **Nota:** Não é necessário instalar Node.js ou MongoDB localmente, pois o Docker cuidará de baixar e configurar as versões corretas automaticamente.

## 🔧 Como Rodar o Projeto

Este projeto utiliza **Docker Compose** para subir o Banco de Dados, o Backend e o Frontend simultaneamente com um único comando.
### Passo 1: Clonar e Configurar

- Clone o repositório e entre na pasta:

```bash
git clone https://github.com/Raimdrs/Concessionaria.git
cd Concessionaria
```

### Passo 2: Rodar com Docker

- Na raiz do projeto (onde está o arquivo docker-compose.yml), execute:

```Bash
docker-compose up --build
```

### Passo 3: Acessar a Aplicação

- Aguarde até ver a mensagem ✅ MongoDB Conectado com Sucesso! no terminal. Depois, acesse:

> Frontend (Aplicação): http://localhost:5173

> Backend (API): http://localhost:5001/api/veiculos


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
