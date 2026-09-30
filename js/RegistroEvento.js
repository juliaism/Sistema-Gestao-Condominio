/*
 * RegistroEvento.js
 * ------------------------------------------------------------------
 * Registro de eventos do condomínio pela síndica (calendario-condominial.html).
 *
 * - Apenas usuários com perfil "admin" podem abrir o formulário e salvar.
 * - Usuários comuns recebem a mensagem de acesso negado.
 * - O evento salvo aparece no calendário para todos os usuários.
 *
 * Este arquivo reaproveita o calendário de Calendario.js SEM alterá-lo,
 * usando as variáveis e funções globais que ele já declara:
 *   mockEventos    -> objeto com os eventos exibidos, agrupados por data
 *   currentDate    -> mês que o calendário está mostrando
 *   selectedDate   -> dia clicado no calendário (AAAA-MM-DD)
 *   renderCalendar -> redesenha os dias do mês
 *   renderEventos  -> mostra a lista de eventos de um dia
 *
 * Por isso, deve ser carregado DEPOIS de Calendario.js.
 */

// Mensagem exibida quando um usuário sem permissão tenta registrar eventos.
const MSG_ACESSO_NEGADO = "Acesso negado: apenas administradores podem registrar eventos";

// Garante que há alguém logado (senão redireciona para o login).
const usuarioLogado = exigirLogin();

// Referências aos elementos da tela.
const btnNovoEvento = document.getElementById("btn-novo-evento");
const btnCancelarEvento = document.getElementById("btn-cancelar-evento");
const formEvento = document.getElementById("form-evento");
const campoTitulo = document.getElementById("evento-titulo");
const campoData = document.getElementById("evento-data");
const campoInicio = document.getElementById("evento-inicio");
const campoFim = document.getElementById("evento-fim");
const campoLocal = document.getElementById("evento-local");
const mensagemEvento = document.getElementById("mensagem-evento");

/**
 * Coloca um evento dentro de mockEventos, no formato que o Calendario.js
 * espera: { id, titulo, horario: "HH:MM - HH:MM", local }.
 * Depois disso, o dia passa a aparecer marcado no calendário.
 */
function adicionarEventoAoCalendario(evento) {
    // Cria a lista daquele dia se ainda não existir.
    if (!mockEventos[evento.data]) {
        mockEventos[evento.data] = [];
    }

    // Calendario.js exibe os eventos via innerHTML, então o texto digitado
    // é escapado aqui para ser mostrado como texto e não como código.
    mockEventos[evento.data].push({
        id: evento.id,
        titulo: escaparHtml(evento.titulo),
        horario: `${evento.inicio} - ${evento.fim}`,
        local: escaparHtml(evento.local)
    });
}

/**
 * Ao abrir a página, carrega os eventos que a síndica já registrou
 * (salvos no localStorage) e redesenha o calendário com eles.
 */
function carregarEventosRegistrados() {
    lerArmazenamento(CHAVE_EVENTOS, []).forEach(adicionarEventoAoCalendario);
    renderCalendar();
}

/**
 * Botão "Registrar evento".
 * - Usuário comum: exibe a mensagem de acesso negado e não abre nada.
 * - Síndica: mostra o formulário (já com a data do dia clicado, se houver).
 */
function abrirFormulario() {
    esconderMensagem(mensagemEvento);

    if (!ehAdministrador(usuarioLogado)) {
        mostrarMensagem(mensagemEvento, "erro", MSG_ACESSO_NEGADO);
        return;
    }

    formEvento.reset();
    campoData.min = dataDeHoje(); // o seletor de data não oferece dias passados

    // Se a síndica clicou em um dia futuro no calendário, já preenche a data.
    if (selectedDate && selectedDate >= dataDeHoje()) {
        campoData.value = selectedDate;
    }

    formEvento.classList.remove("hidden");
    btnNovoEvento.classList.add("hidden");
    campoTitulo.focus();
}

/**
 * Limpa e esconde o formulário, mostrando de novo o botão "Registrar evento".
 */
function fecharFormulario() {
    formEvento.reset();
    formEvento.classList.add("hidden");
    btnNovoEvento.classList.remove("hidden");
}

/**
 * Confere se os campos do evento estão corretos.
 * Devolve o texto do erro encontrado, ou null se estiver tudo certo.
 * Os horários "HH:MM" podem ser comparados como texto ("09:00" < "10:00").
 */
function validarEvento(evento) {
    if (!evento.titulo) return "Informe o título do evento.";
    if (!evento.data) return "Informe a data do evento.";
    if (evento.data < dataDeHoje()) return "Não é possível registrar eventos em datas passadas.";
    if (!evento.inicio || !evento.fim) return "Informe o horário de início e de término.";
    if (evento.fim <= evento.inicio) return "O horário de término deve ser depois do horário de início.";
    return null;
}

/**
 * Envio do formulário ("Salvar"):
 * 1. confere novamente a permissão do usuário;
 * 2. monta e valida o evento;
 * 3. salva no localStorage e adiciona ao calendário;
 * 4. leva o calendário até o dia do evento e mostra a confirmação.
 */
function salvarEvento(e) {
    e.preventDefault(); // impede o recarregamento padrão da página
    esconderMensagem(mensagemEvento);

    // Verificação repetida no salvamento: mesmo que alguém force a exibição
    // do formulário (ex.: pelo DevTools), um usuário comum não consegue salvar.
    if (!ehAdministrador(usuarioLogado)) {
        fecharFormulario();
        mostrarMensagem(mensagemEvento, "erro", MSG_ACESSO_NEGADO);
        return;
    }

    // Monta o evento com os valores digitados.
    const evento = {
        id: `evt-${Date.now()}`,  // id único baseado no horário atual
        titulo: campoTitulo.value.trim(),
        data: campoData.value,
        inicio: campoInicio.value,
        fim: campoFim.value,
        local: campoLocal.value.trim() || "Área comum do condomínio",  // valor padrão se vazio
        criadoPor: usuarioLogado.id
    };

    const erro = validarEvento(evento);
    if (erro) {
        mostrarMensagem(mensagemEvento, "erro", erro);
        return;
    }

    // Salva junto com os eventos já registrados, para que fique
    // visível a todos os usuários que abrirem o calendário.
    const eventosSalvos = lerArmazenamento(CHAVE_EVENTOS, []);
    eventosSalvos.push(evento);
    salvarArmazenamento(CHAVE_EVENTOS, eventosSalvos);

    adicionarEventoAoCalendario(evento);

    // Leva o calendário até o mês do evento e já mostra os eventos do dia.
    const [ano, mes] = evento.data.split("-").map(Number);
    currentDate.setFullYear(ano, mes - 1, 1);  // no Date, os meses vão de 0 a 11
    selectedDate = evento.data;
    renderCalendar();
    renderEventos(evento.data, false);

    fecharFormulario();
    mostrarMensagem(
        mensagemEvento,
        "sucesso",
        `Evento "${evento.titulo}" registrado com sucesso para ${formatarDataBR(evento.data)}.`
    );
}

// Inicialização da página (somente se houver usuário logado).
if (usuarioLogado) {
    renderizarTopo("calendario");
    carregarEventosRegistrados();

    btnNovoEvento.addEventListener("click", abrirFormulario);
    btnCancelarEvento.addEventListener("click", fecharFormulario);
    formEvento.addEventListener("submit", salvarEvento);

    // Atalho "Registrar evento" da página inicial (link com #novo-evento):
    // já abre o formulário ao carregar a página.
    if (window.location.hash === "#novo-evento") {
        abrirFormulario();
    }
}
