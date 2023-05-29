<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
</head>
<body>
  <h1>POC-AUTH</h1>

  <p>Este é um projeto de prova de conceito que demonstra a autenticação com JWT usando o NestJS.</p>
  
  <p>Para obter este repositório, rode este comando:</p>
  
  ```bash
  git clone https://github.com/camilabarpp/poc-auth.git
  ```
  *********************************************************************************************************************************************************************

  # Configuração

  <p>Antes de executar o projeto, é necessário configurar algumas variáveis de ambiente. Certifique-se de ter o Node.js e o Docker instalados em seu sistema.</p>

  ```bash
  npm i

  docker compose up --build
  ```

  ``` bash
  npm run start
  ```
  *********************************************************************************************************************************************************************
  
  # Endpoints
  
  ## Fazer login e obter um token

  - **Método**: POST
  - **URL**: http://localhost:3000/api/auth/signIn

  **Corpo da requisição (JSON):**
  ```json
  {
      "email": "admin@mail.com",
      "password": "admin"
  }
  ```
  
  *********************************************************************************************************************************************************************
  
  ## Criar um admin

  - **Método**: POST
  - **URL**: http://localhost:3000/api/signUp/admin/
  - **Autorização**: Bearer Token
  - **Token**: `<token>`

  **Corpo da requisição (JSON):**
  ```json
  {
      "name": "Camila Barpp",
      "email": "milabarpp@mail.com",
      "password": "Senha.123",
      "passwordConfirmation": "Senha.123"
  }
  ```
  ### Observação:
  A senha deve seguir o seguinte formato:
  - Pelo menos 1 dígito (0-9)
  - Pelo menos 1 letra minúscula (a-z)
  - Pelo menos 1 letra maiúscula (A-Z)
  - Pelo menos 1 caractere especial (-_.!@#$%^&*)
  
  *********************************************************************************************************************************************************************

  ## Criar um user

  - **Método**: POST
  - **URL**: http://localhost:3000/api/signUp/user/

  **Corpo da requisição (JSON):**
  ```json
  {
      "name": "Camila Barpp",
      "email": "milabarpp@mail.com",
      "password": "Senha.123",
      "passwordConfirmation": "Senha.123"
  }
  ```
  ### Observação:
  A senha deve seguir o seguinte formato:
  - Pelo menos 1 dígito (0-9)
  - Pelo menos 1 letra minúscula (a-z)
  - Pelo menos 1 letra maiúscula (A-Z)
  - Pelo menos 1 caractere especial (-_.!@#$%^&*)
  
  *********************************************************************************************************************************************************************
  
  ## Alterar senha do usuário

  - **Método**: PATCH
  - **URL**: http://localhost:3000/api/auth/{id}/change-password
  - **Autorização**: Bearer Token
  - **Token**: `<token>`

  **Corpo da requisição (JSON):**
  ```json
  {
      "password": "Teste@123",
      "passwordConfirmation": "Teste@123"
  }
  ```
  *********************************************************************************************************************************************************************

  ## Atualizar um user/admin

  - **Método**: PATCH
  - **URL**: http://localhost:3000/api/signUp/{id}

  - **Autorização**: Bearer Token
  - **Token**: `<token>`

  **Corpo da requisição (JSON):**
  ```json
  {
      "name": "Camila Barpp"
  }
  ```
  *********************************************************************************************************************************************************************

  ## Alterar senha do usuario com o token de recuperação

  - **Método**: PATCH
  - **URL**: http://localhost:3000/api/auth/reset-password/{id}

  - **Autorização**: Bearer Token
  - **Token**: `<token>`

  **Corpo da requisição (JSON):**
  ```json
  {
      "password": "Teste@123",
      "passwordConfirmation": "Teste@123"
  }
  ```
  *********************************************************************************************************************************************************************

  ## Enviar email de recuperação de senha

  - **Método**: POST
  - **URL**: http://localhost:3000/api/send-mail/send-recover-email

  - **Autorização**: Bearer Token
  - **Token**: `<token>`

  **Corpo da requisição (JSON):**
  ```json
  {
      "email": "milabarpp@mail.com"
  }
  ```
  *********************************************************************************************************************************************************************

  ## Listar todos usuarios

  - **Método**: GET
  - **URL**: http://localhost:3000/api/signUp/

  *********************************************************************************************************************************************************************
  
  ## Obter os dados do usuario pelo token

  - **Método**: GET
  - **URL**: http://localhost:3000/api/auth/me

  - **Autorização**: Bearer Token
  - **Token**: `<token>`

  *********************************************************************************************************************************************************************
    
  ## Obter usuário pelo id

  - **Método**: GET
  - **URL**: http://localhost:3000/api/signUp/{id}

  *********************************************************************************************************************************************************************
      
  ## Obter usuario por criterios

  - **Método**: GET
  - **URL**: http://localhost:3000/api/signUp?name=Cam

  *********************************************************************************************************************************************************************
    
  ## Deletar um usuário

  - **Método**: DELETE
  - **URL**: http://localhost:3000/api/signUp/{id}

  *********************************************************************************************************************************************************************
  
  # Funcionalidades

  <ul>
    <li>Autenticação com JWT</li>
    <li>Envio de e-mail ao cadastrar um usuário</li>
    <li>Redefinição de senha</li>
    <li>Alteração de senha</li>
  </ul>

  <h2>Estrutura do Projeto</h2>

  <p>O projeto segue a estrutura padrão do NestJS e possui os seguintes diretórios principais:</p>

  <ul>
    <li><code>src/app/user</code>: Contém o módulo e os controladores relacionados às operações com pessoas.</li>
    <li><code>src/auth</code>: Contém o módulo e os controladores relacionados à autenticação.</li>
    <li><code>src/configs</code>: Contém as configurações do mailer e winston.</li>
    <li><code>src/exceptions</code>: Contém o filtro de exceptions.</li>
    <li><code>src/helpers</code>: Contém o regex e mensagem de erro de senha.</li>
  </ul>

  <h2>Tecnologias Utilizadas</h2>

  <ul>
    <li>NestJS: Framework para construção de aplicativos Node.js escaláveis e eficientes.</li>
    <li>TypeORM: ORM (Object-Relational Mapping) para trabalhar com bancos de dados relacionais.</li>
    <li>JWT (JSON Web Tokens): Mecanismo de autenticação baseado em tokens.</li>
    <li>Docker: Plataforma de contêineres que facilita a criação e o gerenciamento de ambientes isolados.</li>
    <li>Winston: Biblioteca para registro de logs em Node.js.</li>
    <li>Class Validator: Biblioteca para validação de dados em classes e objetos.</li>
    <li>MySQL: Banco de dados relacional utilizado no projeto.</li>
  </ul>

  <h2>Contribuição</h2>

  <p>Contribuições são bem-vindas! Se você quiser contribuir para o projeto, sinta-se à vontade para abrir uma issue ou enviar um pull request.</p>
</body>
</html>

