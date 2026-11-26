# Documentação da Etapa 07 — Persistência e CRUD com Base de Dados

## 1. Justificação da Escolha da Base de Dados

Para o **WebSampler Studio**, foi escolhida uma **Base de Dados Relacional (SQLite)** através do motor nativo `node:sqlite`. A escolha justifica-se pelos seguintes fatores:

1. **Integridade Referencial e Estrutura Tabular:** Os dados do domínio musical possuem um esquema bem definido e relacionamentos claros entre categorias musicais e presets de áudio, beneficiando de chaves estrangeiras (`FOREIGN KEY`) e restrições de domínio (`CHECK` e `NOT NULL`).
2. **Persistência Real em Ficheiro:** Todos os registos são gravados diretamente no disco no ficheiro `src/server/database/websampler.db`, garantindo que as alterações persistem entre reinicializações da aplicação.
3. **Desacoplamento Arquitetural:** A utilização do padrão _Repository_ (`presetsRepository.js`) isola as consultas SQL dos controladores HTTP (`presetsController.js`), permitindo evoluir ou trocar o SGBD sem alterar as rotas da API.

---

## 2. Modelo da Base de Dados (Esquema Relacional)

```sql
CREATE TABLE categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL
);

CREATE TABLE presets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  bpm INTEGER NOT NULL CHECK (bpm >= 40 AND bpm <= 240),
  category_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
);
```

---

## 3. Descrição das Entidades

### Entidade 1: `categories` (Categorias / Géneros Musicais)

Representa os estilos musicais disponíveis para classificar os kits de áudio do estúdio:

- **`id`** (`INTEGER`, PK, Auto-incremento): Identificador único da categoria.
- **`name`** (`TEXT`, Único, Obrigatório): Nome do estilo musical (ex: `Hip-Hop`, `Eletrónica`, `Rock`, `Experimental`).
- **`description`** (`TEXT`, Obrigatório): Descrição técnica das características sonoras da categoria.

### Entidade 2: `presets` (Presets de Sessão do Sampler)

Representa as configurações de sessão e andamento guardadas pelos utilizadores:

- **`id`** (`INTEGER`, PK, Auto-incremento): Identificador único do preset.
- **`name`** (`TEXT`, Obrigatório): Nome atribuído ao preset (mínimo de 3 caracteres).
- **`bpm`** (`INTEGER`, Obrigatório): Andamento musical em batidas por minuto (validado entre 40 e 240 BPM tanto na aplicação como por `CHECK` na base de dados).
- **`category_id`** (`INTEGER`, FK, Obrigatório): Chave estrangeira que referencia a entidade `categories(id)`.
- **`created_at`** (`DATETIME`): Data e hora de criação do registo.

---

## 4. Descrição dos Relacionamentos

- **Relacionamento Um-para-Muitos (`1:N`) entre `categories` e `presets`:**
  - Uma **Categoria** (`categories`) pode estar associada a vários **Presets** (`presets`).
  - Cada **Preset** (`presets`) pertence obrigatoriamente a uma única **Categoria** através da chave estrangeira `category_id REFERENCES categories(id) ON DELETE RESTRICT`.
  - Nas consultas da API, as duas tabelas são unidas através de `INNER JOIN` para devolver o nome da categoria juntamente com o `category_id`.

---

## 5. Instruções para Criação e Execução da Base de Dados

A base de dados é criada e povoada automaticamente (_auto-migrations_ e _seed_) no arranque do servidor:

1. No terminal, na raiz do projeto, inicie o servidor:
   ```bash
   npm start
   ```
2. Ao iniciar, o módulo `src/server/database/connection.js` cria automaticamente o ficheiro `src/server/database/websampler.db`, executa as instruções `CREATE TABLE IF NOT EXISTS` para as tabelas `categories` e `presets`, e insere os registos iniciais caso a base de dados esteja vazia.
3. Para comprovar a persistência: crie ou edite um preset em `http://localhost:3000`, encerre o servidor no terminal com `Ctrl + C` e execute `npm start` novamente. Os dados permanecem gravados.

---

## 6. Exemplos de Operações CRUD

### 6.1. Criação (CREATE - `POST /api/presets`)

- **Query SQL executada pelo Repositório:**
  ```sql
  INSERT INTO presets (name, bpm, category_id) VALUES ('Acid Techno 303', 135, 2);
  ```
- **Requisição HTTP:**
  ```bash
  curl -X POST http://localhost:3000/api/presets \
    -H "Content-Type: application/json" \
    -d '{"name": "Acid Techno 303", "bpm": 135, "category": "Eletrónica"}'
  ```

### 6.2. Consulta Geral e Individual com JOIN (READ - `GET /api/presets` e `GET /api/presets/:id`)

- **Query SQL executada pelo Repositório:**
  ```sql
  SELECT p.id, p.name, p.bpm, p.category_id, c.name AS category, p.created_at
  FROM presets p
  INNER JOIN categories c ON p.category_id = c.id
  ORDER BY p.id DESC;
  ```
- **Requisição HTTP:**
  ```bash
  curl -X GET http://localhost:3000/api/presets
  curl -X GET http://localhost:3000/api/presets/1
  ```

### 6.3. Atualização (UPDATE - `PUT /api/presets/:id`)

- **Query SQL executada pelo Repositório:**
  ```sql
  UPDATE presets SET name = 'BoomBap Master 92', bpm = 92, category_id = 1 WHERE id = 1;
  ```
- **Requisição HTTP:**
  ```bash
  curl -X PUT http://localhost:3000/api/presets/1 \
    -H "Content-Type: application/json" \
    -d '{"name": "BoomBap Master 92", "bpm": 92, "category": "Hip-Hop"}'
  ```

### 6.4. Exclusão (DELETE - `DELETE /api/presets/:id`)

- **Query SQL executada pelo Repositório:**
  ```sql
  DELETE FROM presets WHERE id = 2;
  ```
- **Requisição HTTP:**
  ```bash
  curl -X DELETE http://localhost:3000/api/presets/2
  ```
