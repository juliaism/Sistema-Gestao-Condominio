# Sistema de Gestão Condominial

Aplicação web para apoiar a administração de um condomínio e a comunicação com os moradores. O sistema reúne em um só lugar o **calendário condominial**, o **registro de eventos** pela administração e a **reserva de áreas comuns** pelos moradores.

> Projeto acadêmico da disciplina de Engenharia de Software. Não há backend: todos os dados são **mockados** em JavaScript e as alterações feitas durante o uso ficam salvas no `localStorage` do navegador.

---

## Funcionalidades

| Módulo | Descrição | Perfil |
| --- | --- | --- |
| **Autenticação** | Login por escolha de perfil e usuário (ou e-mail e senha), com controle de sessão por perfil. | Todos |
| **Página inicial** | Saudação, atalhos, próximos eventos, reservas e permissões do perfil logado. | Todos |
| **Dados mockados** | Menu lateral recolhido na direita (`‹ Dados mockados`) com os dados salvos e botão para restaurar os dados de exemplo. | Todos |
| **Calendário condominial** | Navegação entre meses, destaque dos dias com eventos e reservas, e listagem do dia selecionado com etiqueta do tipo (Aviso, Manutenção, Assembleia, Evento ou Reserva). | Todos |
| **Registro de eventos e avisos** | Cadastro de avisos, manutenções, assembleias e eventos (título, tipo, data, horário e local), visíveis no calendário para todos. | Somente síndica |
| **Reserva de áreas comuns** | Consulta de horários disponíveis por área e data, confirmação de reserva e bloqueio de conflitos de horário. | Moradores e síndica |
| **Portaria: controle de pessoas** | O porteiro informa o CPF; se estiver cadastrado, aparece "Apto a entrar" com as informações da pessoa (morador, visitante ou funcionário). Permite adicionar nova pessoa permitida. | Porteiro |
| **Portaria: garagem** | Mesma ideia, pela placa do veículo (padrão antigo ou Mercosul). Só entram veículos de moradores, visitantes e funcionários cadastrados. Permite adicionar novo veículo permitido. | Porteiro |

---

## Tecnologias utilizadas

- **HTML5**: estrutura das páginas
- **CSS3**: estilização e layout responsivo
- **JavaScript (ES6+)**: regras de negócio, manipulação do DOM e dados mockados
- **Web Storage** (`localStorage` / `sessionStorage`): persistência local dos dados e da sessão

---

## Estrutura do projeto

```
Trabalho-eng-software/
├── index.html                        # Página inicial (ponto de entrada; pede login se necessário)
├── README.md
│
├── pages/                            # Telas do sistema
│   ├── login.html                    # Tela de login com escolha de perfil e dados de teste
│   ├── calendario-condominial.html   # Calendário condominial + registro de eventos pela síndica
│   ├── reservas.html                 # Reserva de áreas comuns
│   └── portaria.html                 # Controle de pessoas (CPF) e garagem (placa) pelo porteiro
│
├── css/                              # Folhas de estilo
│   ├── Calendario.css                # Estilos do calendário
│   └── Sistema.css                   # Estilos compartilhados (cabeçalho, formulários, mensagens)
│
└── js/                               # Scripts
    ├── Calendario.js                 # Lógica do calendário
    ├── DadosMock.js                  # Perfis, usuários (com CPF), pessoas e veículos permitidos, áreas, reservas e eventos de exemplo
    ├── Comum.js                      # Sessão, armazenamento, cabeçalho e utilitários
    ├── Login.js                      # Escolha de perfil/usuário e autenticação
    ├── Inicio.js                     # Página inicial: eventos, reservas e perfil
    ├── DadosTeste.js                 # Menu lateral "Dados mockados" (presente em todas as telas)
    ├── Portaria.js                   # Consulta por CPF/placa, cadastro de pessoas e veículos, registros
    ├── RegistroEvento.js             # Cadastro de eventos e controle de acesso
    └── Reservas.js                   # Horários disponíveis, reservas e conflitos
```

---

## Como executar

1. Clone o repositório:
   ```bash
   git clone <url-do-repositorio>
   ```
2. Abra a pasta do projeto no VS Code.
3. Abra o arquivo `index.html` com a extensão **Live Server** (botão direito no arquivo > *Open with Live Server*) ou diretamente no navegador. Se ninguém estiver logado, o sistema abre a tela de login.
4. Escolha o perfil (**Síndica**, **Morador** ou **Porteiro**) e clique no usuário para entrar.
5. Os dados mockados (usuários com CPF, e-mail e senha, pessoas e veículos permitidos, áreas, reservas e eventos) e um roteiro de teste ficam no menu **Dados mockados**, na borda direita de todas as telas. Clique em `‹ Dados mockados` para abrir e em `› Fechar` (ou `Esc`) para recolher.

### Restaurar os dados de exemplo

Eventos, reservas, pessoas, veículos e registros da portaria criados durante o uso ficam no `localStorage` do navegador. Para voltar ao estado inicial, clique em **Restaurar dados de exemplo** no menu *Dados mockados*.

---

## Portaria (porteiro)

Login de teste: `porteiro@condominio.com` / `123456`.

- **Pessoas:** digite um CPF (ex.: `123.456.789-09`). Cadastrado: mostra *Apto a entrar* com nome, CPF, tipo e destino. Não cadastrado (ex.: `111.444.777-35`): *Acesso não permitido*. CPF inválido: aviso de erro.
- **Garagem:** digite uma placa (ex.: `ABC1D23` ou `JKL-9876`). Não cadastrada (ex.: `XYZ9K87`): *Acesso não permitido*.
- **Adicionar:** em cada aba há um bloco *Adicionar pessoa/veículo permitido*. O CPF e a placa são validados e não podem se repetir.
- Cada consulta fica em **Últimos registros** (Liberado / Negado).
- Apenas o perfil *Porteiro* acessa a portaria; os demais recebem "Acesso negado".

---

## Equipe

- Júlia Labad Jatene
- Pedro Andrade Gonçalves de Souza
- João Paulo Oliveira Rodrigues
- Luan Piedade de Oliveira
- Lucas Sousa Jatene
