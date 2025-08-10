# Banco Digital - CDC Bank

Este projeto é uma solução para o teste técnico da **CDC Sociedade de Crédito Direto S.A**, implementando uma aplicação completa de banco digital com autenticação segura, CRUD de clientes e operações de transações financeiras entre contas.

---

## 🚀 Tecnologias Utilizadas

**Back-end**
- Java 21
- Spring Boot
- Spring Security
- JWT (armazenado em cookies HttpOnly)
- Docker e Docker Compose

**Front-end**
- React com TypeScript
- Tailwind CSS
- ShadCN UI

---

## 📦 Configuração e Execução

### 1️⃣ Back-end

1. **Abrir o Docker Desktop**
   - Certifique-se de que o Docker Desktop está em execução.

2. **Build e inicialização dos containers**
   ```bash
   \backEnd\bancoDigital> setup-all.bat
   ```
   Esse script irá:
   - Fazer o build do projeto
   - Inicializar os containers necessários
   - Rodar a aplicação Spring Boot

---

### 2️⃣ Front-end

1. Acesse a pasta do front-end:
   ```bash
   \frontEnd\bancoDigital>
   ```

2. Instale as dependências (caso seja a primeira execução):
   ```bash
   npm install
   ```

3. Rode o projeto:
   ```bash
   npm run dev
   ```

---

## 🔐 Autenticação

- O sistema possui autenticação **completa**.
- Apenas **usuários logados** podem acessar rotas protegidas no back-end.
- O front-end também restringe URLs para usuários não autenticados.
- Utiliza **Spring Security** e **JWT**, com token armazenado em **cookies HttpOnly**.

---

## 📋 Funcionalidades Implementadas

✅ Login com email e senha  
✅ CRUD de clientes:
- Adição de cliente
- Atualização de dados
- Exclusão de clientes
- Listagem de clientes com pesquisa por CPF/CNPJ ou Nome

✅ Painel do cliente:
- Visualização de dados
- Consulta de saldo total
- Listagem de transações

✅ Transações:
- Transferência de saldo entre clientes do mesmo parceiro
- Validação de saldo antes da transferência

💡 **Todas as funcionalidades do enunciado foram implementadas.**

---

## 📄 Enunciado Original do Desafio
O documento do teste técnico está disponível em [`Teste Técnico FULL-STACK.docx`](./Teste%20Técnico%20FULL-STACK.docx).

---

## 👨‍💻 Autor
Desenvolvido por **Pedro Franco**
