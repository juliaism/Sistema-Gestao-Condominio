/*
 * Inicio.js
 * ------------------------------------------------------------------
 * Página inicial (index.html, na raiz do projeto), exibida logo após o login.
 * Mostra, de acordo com o perfil do usuário:
 *   - saudação, data de hoje e atalhos (a síndica tem "Registrar evento";
 *     o porteiro tem "Abrir portaria");
 *   - próximos eventos do condomínio;
 *   - reservas (morador: as próprias; síndica e porteiro: todas as do condomínio);
 *   - dados do usuário e permissões do perfil.
 *
 * Depende de DadosMock.js e Comum.js.
 */

// Quantidade máxima de itens exibidos em cada lista.
const LIMITE_ITENS = 5;

// Abreviações dos meses para o selo de data (ex.: "OUT").
const MESES_CURTOS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

// Garante que há alguém logado (senão redireciona para o login).
const usuarioLogado = exigirLogin();

// Referências aos elementos da tela.
const saudacao = document.getElementById("saudacao");
const dataHoje = document.getElementById("data-hoje");
const acoesRapidas = document.getElementById("acoes-rapidas");
const listaProximosEventos = document.getElementById("proximos-eventos");
const tituloReservas = document.getElementById("titulo-reservas");
const listaReservasInicio = document.getElementById("lista-reservas-inicio");
const dadosPerfil = document.getElementById("dados-perfil");
const listaPermissoes = document.getElementById("permissoes");
const linkNovaReserva = document.getElementById("link-nova-reserva");

/**
 * Síndica e porteiro veem as reservas de todos; o morador, só as dele.
 */
function veTodasReservas(usuario) {
    return ehAdministrador(usuario) || ehPorteiro(usuario);
}

/**
 * Devolve os eventos do condomínio de hoje em diante
 * (carregarTodosEventos() em Comum.js já junta e ordena todos).
 */
function carregarProximosEventos() {
    const hoje = dataDeHoje();
    return carregarTodosEventos().filter(evento => evento.data >= hoje);
}

/**
 * Devolve as reservas futuras que o usuário deve ver:
 * síndica e porteiro veem todas; o morador vê apenas as dele.
 */
function carregarReservasVisiveis() {
    const hoje = dataDeHoje();
    return carregarReservas()
        .filter(reserva => reserva.data >= hoje)
        .filter(reserva => veTodasReservas(usuarioLogado) || reserva.moradorId === usuarioLogado.id)
        .sort((a, b) => (a.data + a.horario).localeCompare(b.data + b.horario));
}

/**
 * Cria o selo de data com o dia e o mês abreviado (ex.: "15 / OUT").
 */
function criarSeloData(dataString) {
    const [, mes, dia] = dataString.split("-");

    const selo = document.createElement("span");
    selo.className = "data-badge";

    const seloDia = document.createElement("span");
    seloDia.className = "data-badge-dia";
    seloDia.textContent = Number(dia);

    const seloMes = document.createElement("span");
    seloMes.className = "data-badge-mes";
    seloMes.textContent = MESES_CURTOS[Number(mes) - 1];

    selo.append(seloDia, seloMes);
    return selo;
}

/**
 * Cria um item de lista com selo de data, título e linha de detalhe.
 * Usado tanto para eventos quanto para reservas.
 */
function criarItemLista(dataString, titulo, detalhe) {
    const item = document.createElement("li");
    item.className = "evento-item";

    const info = document.createElement("div");
    info.className = "evento-info";

    const nome = document.createElement("p");
    nome.className = "evento-nome";
    nome.textContent = titulo;

    const texto = document.createElement("p");
    texto.className = "evento-detalhe";
    texto.textContent = detalhe;

    info.append(nome, texto);
    item.append(criarSeloData(dataString), info);
    return item;
}

/**
 * Coloca na lista um aviso em itálico (ex.: quando não há itens).
 */
function mostrarListaVazia(lista, texto) {
    const vazio = document.createElement("li");
    vazio.className = "lista-vazia";
    vazio.textContent = texto;
    lista.appendChild(vazio);
}

/**
 * Saudação conforme a hora do dia e a data de hoje por extenso.
 */
function renderizarBoasVindas() {
    const hora = new Date().getHours();
    const periodo = hora < 12 ? "Bom dia" : hora < 18 ? "Boa tarde" : "Boa noite";
    const primeiroNome = usuarioLogado.nome.split(" ")[0];
    saudacao.textContent = `${periodo}, ${primeiroNome}!`;

    // Ex.: "quarta-feira, 30 de setembro de 2026" -> primeira letra maiúscula
    const dataExtenso = new Date().toLocaleDateString("pt-BR", {
        weekday: "long", day: "numeric", month: "long", year: "numeric"
    });
    dataHoje.textContent = dataExtenso.charAt(0).toUpperCase() + dataExtenso.slice(1);
}

/**
 * Atalhos para as ações principais. "Registrar evento" aparece só para
 * a síndica e abre o formulário direto no calendário (#novo-evento).
 */
function renderizarAcoesRapidas() {
    const acoes = [];

    if (ehAdministrador(usuarioLogado)) {
        acoes.push({ texto: "Registrar evento", destino: caminho("pages/calendario-condominial.html#novo-evento"), principal: true });
    }
    if (ehPorteiro(usuarioLogado)) {
        acoes.push({ texto: "Abrir portaria", destino: caminho("pages/portaria.html"), principal: true });
    } else {
        acoes.push({ texto: "Reservar área comum", destino: caminho("pages/reservas.html"), principal: !ehAdministrador(usuarioLogado) });
    }
    acoes.push({ texto: "Ver calendário", destino: caminho("pages/calendario-condominial.html"), principal: false });

    acoesRapidas.innerHTML = "";
    acoes.forEach(acao => {
        const link = document.createElement("a");
        link.href = acao.destino;
        link.className = acao.principal ? "btn btn-primario" : "btn btn-secundario";
        link.textContent = acao.texto;
        acoesRapidas.appendChild(link);
    });
}

/**
 * Lista os próximos eventos do condomínio (até LIMITE_ITENS).
 */
function renderizarProximosEventos() {
    listaProximosEventos.innerHTML = "";
    const eventos = carregarProximosEventos();

    if (eventos.length === 0) {
        mostrarListaVazia(listaProximosEventos, "Nenhum evento agendado.");
        return;
    }

    eventos.slice(0, LIMITE_ITENS).forEach(evento => {
        const detalhe = `${evento.horario} | ${evento.local}`;
        listaProximosEventos.appendChild(criarItemLista(evento.data, evento.titulo, detalhe));
    });
}

/**
 * Lista as reservas. Para a síndica, o título muda para
 * "Reservas do condomínio" e cada item mostra quem reservou.
 */
function renderizarReservas() {
    listaReservasInicio.innerHTML = "";
    const admin = veTodasReservas(usuarioLogado);
    tituloReservas.textContent = admin ? "Reservas do condomínio" : "Minhas reservas";

    // O porteiro só consulta as reservas; quem reserva é síndica ou morador.
    if (ehPorteiro(usuarioLogado)) linkNovaReserva.classList.add("hidden");

    const reservas = carregarReservasVisiveis();
    if (reservas.length === 0) {
        mostrarListaVazia(listaReservasInicio, admin ? "Nenhuma reserva agendada." : "Você não possui reservas futuras.");
        return;
    }

    reservas.slice(0, LIMITE_ITENS).forEach(reserva => {
        const area = buscarArea(reserva.areaId);
        const morador = buscarUsuario(reserva.moradorId);

        let detalhe = reserva.horario;
        if (admin && morador) {
            detalhe += ` | ${morador.nome}` + (morador.apartamento ? ` (Apto ${morador.apartamento})` : "");
        }

        listaReservasInicio.appendChild(
            criarItemLista(reserva.data, area ? area.nome : reserva.areaId, detalhe)
        );
    });
}

/**
 * Mostra os dados do usuário (nome, cargo, apartamento, e-mail)
 * e a lista de permissões do perfil.
 */
function renderizarPerfil() {
    const perfil = buscarPerfil(usuarioLogado);

    // Pares "rótulo: valor" exibidos em uma lista de definição (<dl>)
    const dados = [
        ["Nome", usuarioLogado.nome],
        ["Perfil", perfil ? `${perfil.nome} (${perfil.resumo})` : usuarioLogado.cargo],
        ["Apartamento", usuarioLogado.apartamento || "Não se aplica"],
        ["E-mail", usuarioLogado.email]
    ];

    dadosPerfil.innerHTML = "";
    dados.forEach(([rotulo, valor]) => {
        const termo = document.createElement("dt");
        termo.textContent = rotulo;
        const descricao = document.createElement("dd");
        descricao.textContent = valor;
        dadosPerfil.append(termo, descricao);
    });

    listaPermissoes.innerHTML = "";
    (perfil ? perfil.permissoes : []).forEach(texto => {
        const item = document.createElement("li");
        item.textContent = texto;
        listaPermissoes.appendChild(item);
    });
}

// Inicialização da página (somente se houver usuário logado).
if (usuarioLogado) {
    renderizarTopo("inicio");
    renderizarBoasVindas();
    renderizarAcoesRapidas();
    renderizarProximosEventos();
    renderizarReservas();
    renderizarPerfil();
}
