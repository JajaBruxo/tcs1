# Documentação da Etapa 04 — Interatividade com JavaScript

## 1. Descrição das Funcionalidades Interativas

### Funcionalidade 1: Gestor de Presets com Validação Estrita de Formulário

- **Descrição:** Permite criar perfis de sessão musical especificando o nome do kit, andamento em BPM e género musical.
- **Funcionamento:** O formulário interceta a submissão via `e.preventDefault()`, valida individualmente se o nome possui 3 ou mais carateres, se o BPM está compreendido entre 40 e 240, e se uma categoria foi selecionada. Se os dados forem válidos, cria um objeto e adiciona-o ao array `presetsList`; caso contrário, assinala os campos incorretos e apresenta mensagens de erro[cite: 4].
- **Ficheiros Envolvidos:** `src/client/index.html`, `src/client/style.css`, `src/client/js/audio.js`[cite: 4].
- **Conceitos de Programação:** Tratamento de eventos (`submit`), validação lógica com condicionais, manipulação do DOM e classes dinâmicas (`.input-invalid`)[cite: 4].

### Funcionalidade 2: Listagem Dinâmica e Filtragem de Dados em Memória

- **Descrição:** Renderiza a lista de presets guardados e disponibiliza botões de filtro rápido por estilo musical[cite: 4].
- **Funcionamento:** O estado é gerido através de um array de objetos[cite: 4]. A função `renderPresets()` aplica o método `.filter()` sobre o array consoante a categoria ativa e utiliza `.forEach()` para criar dinamicamente os elementos HTML com botões de remoção (`.btn-delete-preset`) associados ao ID único de cada item[cite: 4].
- **Ficheiros Envolvidos:** `src/client/index.html`, `src/client/js/audio.js`[cite: 4].
- **Conceitos de Programação:** Estruturas de dados (arrays de objetos), métodos de iteração (`.filter()`, `.forEach()`) e manipulação direta de nós do DOM (`createElement`, `appendChild`)[cite: 4].

### Funcionalidade 3: Mesa de Mistura com Controlo Individual de Efeitos e MIDI Learn

- **Descrição:** Controlo de áudio independente para cada um dos 4 canais de pads (frequência de corte Lowpass, ressonância Q e ganho), com suporte para aprendizagem dinâmica de notas MIDI do controlador físico[cite: 4].
- **Funcionamento:** Cada pad alimenta nós de áudio dedicados (`BiquadFilterNode` e `GainNode`) instanciados pela Web Audio API com valores guardados no objeto `padEffects`. A interface escuta o evento `input` dos faders e atualiza os parâmetros em tempo real. O sistema Web MIDI capta as mensagens de entrada e permite remapear dinamicamente as notas atribuídas através do botão "Aprender"[cite: 4].
- **Ficheiros Envolvidos:** `src/client/index.html`, `src/client/style.css`, `src/client/js/audio.js`[cite: 4].
- **Conceitos de Programação:** Web Audio API, Web MIDI API, manipulação de objetos e tratamento de eventos em lote (`querySelectorAll`)[cite: 4].

---

## 2. Validações e Tratamento de Situações Inválidas

1. **Validação do Nome do Preset:** Impede strings vazias ou nomes com menos de 3 carateres, exibindo texto de correção específico[cite: 4].
2. **Validação de Intervalo de BPM:** Rejeita valores não numéricos, nulos ou fora da margem de operação musical permitida (40 a 240 BPM)[cite: 4].
3. **Seleção de Categoria Obrigatória:** Garante que o seletor não seja enviado com o estado nulo/padrão[cite: 4].
4. **Ficheiro de Áudio Inválido:** Verifica se o ficheiro inserido no pad pertence ao tipo MIME `audio/*`. Caso o utilizador tente anexar imagens, textos ou executáveis, a entrada é descartada e um aviso visual (`#file-error-banner`) é exibido[cite: 4].
5. **Amostra de Áudio Corrompida:** Trata exceções assíncronas no callback de erro da função `decodeAudioData`[cite: 4].
6. **Prevenção de Disparo Acidental:** Os atalhos de teclado (teclas 1 a 4) são automaticamente ignorados quando o foco está sobre campos de formulário (`<input>` ou `<select>`), evitando disparos indevidos durante a escrita[cite: 4].

---

## 3. Matriz de Evidências

| Requisito                             | Funcionalidade relacionada                                                        | Arquivo(s)                          | Evidência                                                                                                           |
| :------------------------------------ | :-------------------------------------------------------------------------------- | :---------------------------------- | :------------------------------------------------------------------------------------------------------------------ |
| **Manipulação do DOM**                | Renderização da lista de presets, alternância de abas e feedback dos pads         | `src/client/js/audio.js`            | Função `renderPresets()` com `document.createElement`, `appendChild` e alternância de classes `.active`.            |
| **Tratamento de eventos**             | Submissão de presets, ajuste de faders de áudio, cliques e atalhos de teclado     | `src/client/js/audio.js`            | Event listeners para `'submit'`, `'click'`, `'input'`, `'change'` e `'keydown'`.                                    |
| **Validação de formulários**          | Formulário de criação de novos presets                                            | `src/client/js/audio.js`            | Verificação de `name.length >= 3`, intervalo numérico do BPM e obrigatoriedade da categoria.                        |
| **Alteração dinâmica da interface**   | Mensagens de validação em erro, atualização de valores em Hz/% e banners de aviso | `src/client/index.html`, `audio.js` | Injeção de mensagens em `.error-msg`, remoção/adição da classe `.input-invalid` e atualização de `.strip-val`.      |
| **Uso de funções**                    | Motor de som, rotinas de filtragem e procedimentos de MIDI Learn                  | `src/client/js/audio.js`            | Funções declaradas: `triggerPad()`, `renderPresets()`, `deletePreset()`, `setupMIDI()`, `showFileError()`.          |
| **Uso de arrays**                     | Base de dados de presets e listagem de entradas MIDI                              | `src/client/js/audio.js`            | Estrutura de dados `presetsList = [...]` e conversão de entradas via `Array.from(midiAccess.inputs.values())`.      |
| **Métodos de iteração**               | Filtragem de categorias, listagem na interface e percurso de elementos            | `src/client/js/audio.js`            | Uso de `presetsList.filter(...)` e métodos `.forEach(...)` em coleções de elementos DOM                             |
| **Tratamento de situações inválidas** | Upload de ficheiros não suportados e dados incorretos no formulário               | `src/client/js/audio.js`            | Verificação condicional de `file.type.startsWith('audio/')` e rejeição visual de entradas nulas ou fora dos limites |

---

## 4. Instruções de Execução e Teste

1. Executar a aplicação num servidor local (ex: extensão **Live Server** no VS Code a partir de `src/client/index.html`)
2. **Teste de Validação de Formulário:**
   - Aceder à aba **Presets & Sessão**
   - Clicar no botão "Guardar Preset" sem preencher os campos e verificar os alertas em vermelho
   - Inserir um BPM superior a 240 e confirmar o bloqueio de envio
3. **Teste de Adição e Filtros:**
   - Preencher os dados corretamente e submeter o formulário
   - Verificar a criação imediata do cartão na lista à direita
   - Utilizar os botões da barra "Filtrar" para alternar entre categorias
4. **Teste de Ficheiro Inválido:**
   - Na aba **Pads**, tentar carregar um ficheiro de texto (`.txt`) ou imagem num dos pads
   - Verificar a exibição do aviso superior em vermelho informando a restrição de formato
5. **Teste da Mesa de Mistura e MIDI:**
   - Na aba **Efeitos & EQ**, alterar o corte (Cutoff) de um canal e disparar o pad correspondente na aba principal para atestar a modificação sonora
   - Na aba **Configuração MIDI**, acionar uma tecla no controlador físico e acompanhar o registo em tempo real no monitor de sinal
