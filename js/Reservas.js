/*
 * Reservas.js
 * ------------------------------------------------------------------
 * Reserva de áreas comuns pelos moradores (reservas.html).
 *
 * Fluxo:
 *   1. o morador escolhe a área e a data;
 *   2. a tela mostra os horários da área como "Disponível" ou "Ocupado";
 *   3. ao confirmar, o sistema verifica se o horário está livre:
 *        - livre   -> salva a reserva e mostra a confirmação;
 *        - ocupado -> bloqueia e mostra a mensagem de conflito de horário.
 *
 * Depende de DadosMock.js e Comum.js.
 */

// Garante que há alguém logado (senão redireciona para o login).
const usuarioLogado = exigirLogin();

// O porteiro não faz reservas: volta para a página inicial.
if (ehPorteiro(usuarioLogado)) {
    window.location.replace(caminho("index.html"));
}

// Referências aos elementos da tela.
const formReserva = document.getElementById("form-reserva");
const campoArea = document.getElementById("area-reserva");
const campoData = document.getElementById("data-reserva");
const infoArea = document.getElementById("info-area");
const listaHorarios = document.getElementById("lista-horarios");
const mensagemReserva = document.getElementById("mensagem-reserva");
const listaMinhasReservas = document.getElementById("minhas-reservas");

// Horário escolhido pelo morador (ex.: "14:00 - 18:00"), ou null se nenhum.
let horarioSelecionado = null;

/**
 * Procura uma reserva para a mesma área, data e horário.
 * Se encontrar, o horário está ocupado (é usado para o conflito).
 */
function buscarReserva(areaId, data, horario) {
    return carregarReservas().find(reserva =>
        reserva.areaId === areaId && reserva.data === data && reserva.horario === horario
    ) || null;
}

/**
 * Preenche o <select> de áreas com as áreas comuns mockadas.
 */
function preencherAreas() {
    areasComunsMock.forEach(area => {
        const opcao = document.createElement("option");
        opcao.value = area.id;
        opcao.textContent = area.nome;
        campoArea.appendChild(opcao);
    });
}

/**
 * Marca o horário clicado como selecionado e desmarca os demais.
 */
function selecionarHorario(horario, botao) {
    horarioSelecionado = horario;
    listaHorarios.querySelectorAll(".horario").forEach(item => {
        item.classList.remove("selecionado");
        item.setAttribute("aria-pressed", "false");
    });
    botao.classList.add("selecionado");
    botao.setAttribute("aria-pressed", "true");  // acessibilidade: botão "ativado"
}

/**
 * Desenha os botões de horário da área e data escolhidas.
 * Horários já reservados aparecem como "Ocupado", mas continuam clicáveis:
 * assim, ao tentar confirmar, o sistema exibe a mensagem de conflito.
 * É chamada sempre que a área ou a data mudam.
 */
function renderizarHorarios() {
    listaHorarios.innerHTML = "";
    horarioSelecionado = null;  // trocar área/data desfaz a seleção anterior

    const area = buscarArea(campoArea.value);
    const data = campoData.value;

    // Mostra a capacidade da área escolhida.
    infoArea.textContent = area ? `Capacidade: até ${area.capacidade} pessoas.` : "";

    // Sem área ou data, não há horários para mostrar ainda.
    if (!area || !data) {
        const aviso = document.createElement("p");
        aviso.className = "lista-vazia";
        aviso.textContent = "Selecione uma área e uma data para ver os horários.";
        listaHorarios.appendChild(aviso);
        return;
    }

    // Cria um botão para cada faixa de horário da área.
    area.horarios.forEach(horario => {
        const ocupado = Boolean(buscarReserva(area.id, data, horario));

        const botao = document.createElement("button");
        botao.type = "button";
        botao.className = ocupado ? "horario ocupado" : "horario";
        botao.setAttribute("aria-pressed", "false");

        const hora = document.createElement("span");
        hora.className = "horario-hora";
        hora.textContent = horario;

        const status = document.createElement("span");
        status.className = "horario-status";
        status.textContent = ocupado ? "Ocupado" : "Disponível";

        botao.append(hora, status);
        botao.addEventListener("click", () => selecionarHorario(horario, botao));
        listaHorarios.appendChild(botao);
    });
}

/**
 * Lista as reservas futuras do morador logado, em ordem de data e horário.
 */
function renderizarMinhasReservas() {
    listaMinhasReservas.innerHTML = "";

    const hoje = dataDeHoje();
    const minhas = carregarReservas()
        .filter(reserva => reserva.moradorId === usuarioLogado.id && reserva.data >= hoje)
        .sort((a, b) => (a.data + a.horario).localeCompare(b.data + b.horario));

    if (minhas.length === 0) {
        const vazio = document.createElement("li");
        vazio.className = "lista-vazia";
        vazio.textContent = "Você não possui reservas futuras.";
        listaMinhasReservas.appendChild(vazio);
        return;
    }

    minhas.forEach(reserva => {
        const area = buscarArea(reserva.areaId);

        const item = document.createElement("li");
        item.className = "reserva-item";

        const nome = document.createElement("p");
        nome.className = "reserva-area";
        nome.textContent = area ? area.nome : reserva.areaId;

        const detalhe = document.createElement("p");
        detalhe.className = "reserva-detalhe";
        detalhe.textContent = `${formatarDataBR(reserva.data)} | ${reserva.horario}`;

        item.append(nome, detalhe);
        listaMinhasReservas.appendChild(item);
    });
}

/**
 * Confere se o morador preencheu tudo corretamente.
 * Devolve o texto do erro encontrado, ou null se estiver tudo certo.
 */
function validarReserva(area, data) {
    if (!area) return "Selecione a área comum.";
    if (!data) return "Selecione a data da reserva.";
    if (data < dataDeHoje()) return "Não é possível reservar datas passadas.";
    if (!horarioSelecionado) return "Selecione um horário.";
    return null;
}

/**
 * Envio do formulário ("Confirmar reserva"):
 * 1. valida os campos;
 * 2. verifica conflito de horário;
 * 3. salva a reserva e atualiza a tela.
 */
function confirmarReserva(e) {
    e.preventDefault(); // impede o recarregamento padrão da página
    esconderMensagem(mensagemReserva);

    const area = buscarArea(campoArea.value);
    const data = campoData.value;

    const erro = validarReserva(area, data);
    if (erro) {
        mostrarMensagem(mensagemReserva, "erro", erro);
        return;
    }

    // Se já existe reserva para a mesma área, data e horário, há conflito.
    // A mensagem muda caso a reserva existente seja do próprio morador.
    const conflito = buscarReserva(area.id, data, horarioSelecionado);
    if (conflito) {
        const texto = conflito.moradorId === usuarioLogado.id
            ? `Você já possui uma reserva para ${area.nome} em ${formatarDataBR(data)} no horário ${horarioSelecionado}.`
            : `Conflito de horário: ${area.nome} já está reservado(a) em ${formatarDataBR(data)} no horário ${horarioSelecionado} por outro morador. Escolha outro horário.`;
        mostrarMensagem(mensagemReserva, "erro", texto);
        return;
    }

    // Horário livre: cria a reserva.
    const novaReserva = {
        id: `res-${Date.now()}`,  // id único baseado no horário atual
        areaId: area.id,
        data: data,
        horario: horarioSelecionado,
        moradorId: usuarioLogado.id
    };

    // Salva junto com as reservas já feitas durante o uso.
    const reservasSalvas = lerArmazenamento(CHAVE_RESERVAS, []);
    reservasSalvas.push(novaReserva);
    salvarArmazenamento(CHAVE_RESERVAS, reservasSalvas);

    mostrarMensagem(
        mensagemReserva,
        "sucesso",
        `Reserva confirmada! ${area.nome} em ${formatarDataBR(data)}, horário ${novaReserva.horario}.`
    );

    // Atualiza a tela: o horário passa a "Ocupado" e a reserva entra na lista.
    renderizarHorarios();
    renderizarMinhasReservas();
}

// Inicialização da página (somente se houver usuário logado).
if (usuarioLogado) {
    renderizarTopo("reservas");
    preencherAreas();
    campoData.min = dataDeHoje();  // o seletor de data não oferece dias passados
    renderizarHorarios();
    renderizarMinhasReservas();

    campoArea.addEventListener("change", renderizarHorarios);
    campoData.addEventListener("change", renderizarHorarios);
    formReserva.addEventListener("submit", confirmarReserva);
}
