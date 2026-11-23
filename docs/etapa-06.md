# Documentação da Etapa 06 — API REST da Aplicação

## 1. Visão Geral e Tecnologias

A API REST do **WebSampler Studio** foi desenvolvida em **Node.js** com **Express**, disponibilizando o recurso principal `presets` através de comunicação HTTP em formato JSON.

## 2. Instruções para Execução

1. Certifique-se de ter o **Node.js** instalado no computador.
2. Abra o terminal na pasta raiz do projeto e instale as dependências:
   ```bash
   npm install
   ```
3. Inicie o servidor da aplicação:
   ```bash
   npm start
   ```
4. O servidor e a interface web ficarão disponíveis em `http://localhost:3000` e a API responderá na rota base `http://localhost:3000/api/presets`.

## 3. Documentação dos Endpoints

| Método | Rota               | Descrição                                | Códigos HTTP  |
| :----- | :----------------- | :--------------------------------------- | :------------ |
| GET    | `/api/presets`     | Lista todos os presets registados        | 200           |
| GET    | `/api/presets/:id` | Consulta um preset individual pelo ID    | 200, 404      |
| POST   | `/api/presets`     | Cria um novo preset após validação       | 201, 400      |
| PUT    | `/api/presets/:id` | Atualiza os dados de um preset existente | 200, 400, 404 |
| DELETE | `/api/presets/:id` | Remove um preset pelo ID                 | 200, 404      |

## 4. Exemplos de Requisições e Respostas

### 4.1. Consulta Geral (`GET /api/presets`)

**Exemplo de Requisição (curl):**

```bash
curl -X GET http://localhost:3000/api/presets
```

**Exemplo de Resposta (HTTP 200 OK):**

```json
{
  "status": "success",
  "count": 2,
  "data": [
    { "id": 1, "name": "BoomBap Essentials", "bpm": 90, "category": "Hip-Hop" },
    {
      "id": 2,
      "name": "Synthwave 80s Kit",
      "bpm": 126,
      "category": "Eletrónica"
    }
  ]
}
```

### 4.2. Consulta Individual (`GET /api/presets/:id`)

**Exemplo de Requisição (curl):**

```bash
curl -X GET http://localhost:3000/api/presets/1
```

**Exemplo de Resposta de Sucesso (HTTP 200 OK):**

```json
{
  "status": "success",
  "data": {
    "id": 1,
    "name": "BoomBap Essentials",
    "bpm": 90,
    "category": "Hip-Hop"
  }
}
```

**Exemplo de Resposta de Erro (HTTP 404 Not Found):**

```json
{
  "status": "error",
  "code": 404,
  "message": "Preset não encontrado para o ID informado."
}
```

### 4.3. Criação de Recurso (`POST /api/presets`)

**Exemplo de Requisição (curl):**

```bash
curl -X POST http://localhost:3000/api/presets \
  -H "Content-Type: application/json" \
  -d '{"name": "Drum & Bass Jungle", "bpm": 174, "category": "Eletrónica"}'
```

**Exemplo de Resposta de Sucesso (HTTP 201 Created):**

```json
{
  "status": "success",
  "message": "Preset criado com sucesso.",
  "data": {
    "id": 5,
    "name": "Drum & Bass Jungle",
    "bpm": 174,
    "category": "Eletrónica"
  }
}
```

**Exemplo de Resposta com Erro de Validação (HTTP 400 Bad Request):**

```json
{
  "status": "error",
  "code": 400,
  "message": "Dados de entrada inválidos.",
  "errors": [
    "O campo \"name\" é obrigatório e deve ter pelo menos 3 caracteres.",
    "O campo \"bpm\" deve ser um número válido entre 40 e 240."
  ]
}
```

### 4.4. Alteração de Recurso (`PUT /api/presets/:id`)

**Exemplo de Requisição (curl):**

```bash
curl -X PUT http://localhost:3000/api/presets/1 \
  -H "Content-Type: application/json" \
  -d '{"name": "BoomBap Classic 95", "bpm": 95, "category": "Hip-Hop"}'
```

**Exemplo de Resposta (HTTP 200 OK):**

```json
{
  "status": "success",
  "message": "Preset atualizado com sucesso.",
  "data": {
    "id": 1,
    "name": "BoomBap Classic 95",
    "bpm": 95,
    "category": "Hip-Hop"
  }
}
```

### 4.5. Exclusão de Recurso (`DELETE /api/presets/:id`)

**Exemplo de Requisição (curl):**

```bash
curl -X DELETE http://localhost:3000/api/presets/2
```

**Exemplo de Resposta (HTTP 200 OK):**

```json
{
  "status": "success",
  "message": "Preset excluído com sucesso.",
  "data": {
    "id": 2,
    "name": "Synthwave 80s Kit",
    "bpm": 126,
    "category": "Eletrónica"
  }
}
```
