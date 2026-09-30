# Sistema de Gestão Condominial

Aplicação web para apoiar a administração de um condomínio e a comunicação com os moradores. O sistema reúne em um só lugar o **calendário condominial**, o **registro de eventos** pela administração e a **reserva de áreas comuns** pelos moradores.

> Projeto acadêmico da disciplina de Engenharia de Software. Não há backend: todos os dados são **mockados** em JavaScript e as alterações feitas durante o uso ficam salvas no `localStorage` do navegador.

---

## Funcionalidades

| Módulo | Descrição | Perfil |
| --- | --- | --- |
| **Autenticação** | Login por escolha de perfil e usuário (ou e-mail e senha), com controle de sessão por perfil. | Todos |
| **Página inicial** | Saudação, atalhos, próximos eventos, reservas e permissões do perfil logado. | Todos |
| **Dados para teste** | Tabelas com os dados mockados e botão para restaurar os dados de exemplo. | Todos |
| **Calendário condominial** | Navegação entre meses, destaque dos dias com eventos e listagem dos eventos do dia selecionado. | Todos |
| **Registro de eventos** | Cadastro de eventos (título, data, horário e local) que passam a aparecer no calendário para todos os moradores. | Síndica (administrador) |
| **Reserva de áreas comuns** | Consulta de horários disponíveis por área e data, confirmação de reserva e bloqueio de conflitos de horário. | Moradores |

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
│   ├── calendario.html               # Calendário (versão inicial do módulo)
│   ├── calendario-condominial.html   # Calendário + registro de eventos pela síndica
│   └── reservas.html                 # Reserva de áreas comuns
│
├── css/                              # Folhas de estilo
│   ├── Calendario.css                # Estilos do calendário
│   └── Sistema.css                   # Estilos compartilhados (cabeçalho, formulários, mensagens)
│
└── js/                               # Scripts
    ├── Calendario.js                 # Lógica do calendário e eventos de exemplo
    ├── DadosMock.js                  # Perfis, usuários, áreas comuns e reservas de exemplo
    ├── Comum.js                      # Sessão, armazenamento, cabeçalho e utilitários
    ├── Login.js                      # Escolha de perfil/usuário e autenticação
    ├── Inicio.js                     # Página inicial: eventos, reservas e perfil
    ├── DadosTeste.js                 # Tabelas com os dados mockados para a equipe testar
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
4. Escolha o perfil (**Síndica** ou **Morador**) e clique no usuário para entrar.
5. Os dados mockados (usuários com e-mail e senha, áreas, reservas e eventos) e um roteiro de teste ficam na seção **Dados para teste**, na tela de login e no fim da página inicial.

### Restaurar os dados de exemplo

Os eventos e as reservas criados durante o uso ficam no `localStorage` do navegador. Para voltar ao estado inicial, clique em **Restaurar dados de exemplo** na seção *Dados para teste*.

---

## Equipe

- Júlia Labad Jatene
- Pedro Andrade Gonçalves de Souza
- João Paulo Oliveira Rodrigues
- Luan Piedade de Oliveira
- Lucas Sousa Jatene
