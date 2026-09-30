/*
 * DadosTeste.js
 * ------------------------------------------------------------------
 * Mostra na página, em tabelas, todos os dados mockados do sistema,
 * para que a equipe saiba com quais dados testar:
 *   - dicas de teste;
 *   - usuários (com e-mail e senha);
 *   - áreas comuns e seus horários;
 *   - reservas já existentes (úteis para testar conflito de horário);
 *   - eventos do calendário.
 * Também oferece um botão para restaurar os dados de exemplo
 * (apaga o que foi criado durante os testes).
 *
 * É usado em pages/login.html e em index.html, dentro do elemento
 * <div id="dados-teste">. Depende de DadosMock.js e Comum.js; os
 * eventos de exemplo aparecem quando Calendario.js também é carregado.
 */

// Onde as tabelas serão desenhadas.
const containerDadosTeste = document.getElementById("dados-teste");

/**
 * Cria um subtítulo seguido de uma tabela.
 * - titulo:     texto do subtítulo
 * - cabecalhos: nomes das colunas
 * - linhas:     lista de linhas; cada linha é uma lista de textos
 * - textoVazio: mensagem exibida quando não há linhas
 * A tabela fica dentro de uma <div> com rolagem horizontal,
 * para não quebrar o layout em telas pequenas.
 */
function criarTabela(titulo, cabecalhos, linhas, textoVazio) {
    const bloco = document.createDocumentFragment();

    const subtitulo = document.createElement("h3");
    subtitulo.className = "subtitulo";
    subtitulo.textContent = titulo;
    bloco.appendChild(subtitulo);

    if (linhas.length === 0) {
        const vazio = document.createElement("p");
        vazio.className = "lista-vazia";
        vazio.textContent = textoVazio;
        bloco.appendChild(vazio);
        return bloco;
    }

    const rolagem = document.createElement("div");
    rolagem.className = "tabela-rolagem";

    const tabela = document.createElement("table");
    tabela.className = "tabela";

    // Linha de cabeçalho
    const thead = document.createElement("thead");
    const linhaCabecalho = document.createElement("tr");
    cabecalhos.forEach(texto => {
        const th = document.createElement("th");
        th.scope = "col";
        th.textContent = texto;
        linhaCabecalho.appendChild(th);
    });
    thead.appendChild(linhaCabecalho);

    // Linhas de dados
    const tbody = document.createElement("tbody");
    linhas.forEach(linha => {
        const tr = document.createElement("tr");
        linha.forEach(texto => {
            const td = document.createElement("td");
            td.textContent = texto;
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });

    tabela.append(thead, tbody);
    rolagem.appendChild(tabela);
    bloco.appendChild(rolagem);
    return bloco;
}

/**
 * Lista de dicas com o passo a passo para testar cada funcionalidade.
 * A dica de conflito usa a primeira reserva mockada, para sempre
 * apontar um horário que realmente está ocupado.
 */
function criarDicas() {
    const reservaOcupada = reservasMock[0];
    const areaOcupada = buscarArea(reservaOcupada.areaId);
    const donoReserva = buscarUsuario(reservaOcupada.moradorId);

    const dicas = [
        "Registrar evento: entre como Síndica, clique em \"Registrar evento\", preencha e salve. O dia fica marcado no calendário.",
        "Acesso negado: entre como Morador e clique em \"Registrar evento\" no calendário.",
        "Reserva confirmada: em Reservas, escolha uma área, uma data futura e um horário \"Disponível\".",
        `Conflito de horário: tente reservar ${areaOcupada.nome} em ${formatarDataBR(reservaOcupada.data)}, horário ${reservaOcupada.horario} (já reservado por ${donoReserva.nome}).`
    ];

    const bloco = document.createDocumentFragment();

    const subtitulo = document.createElement("h3");
    subtitulo.className = "subtitulo";
    subtitulo.textContent = "Como testar";
    bloco.appendChild(subtitulo);

    const lista = document.createElement("ul");
    lista.className = "lista-permissoes";
    dicas.forEach(texto => {
        const item = document.createElement("li");
        item.textContent = texto;
        lista.appendChild(item);
    });
    bloco.appendChild(lista);

    return bloco;
}

/**
 * Botão que apaga os eventos e reservas criados durante os testes
 * (localStorage) e recarrega a página com apenas os dados de exemplo.
 */
function criarBotaoRestaurar() {
    const acoes = document.createElement("div");
    acoes.className = "dados-teste-acoes";

    const botao = document.createElement("button");
    botao.type = "button";
    botao.className = "btn btn-secundario";
    botao.textContent = "Restaurar dados de exemplo";
    botao.addEventListener("click", () => {
        const confirmou = window.confirm("Apagar os eventos e reservas criados durante os testes?");
        if (!confirmou) return;

        try {
            localStorage.removeItem(CHAVE_EVENTOS);
            localStorage.removeItem(CHAVE_RESERVAS);
        } catch (erro) {
            console.warn("Não foi possível limpar os dados locais.", erro);
        }
        window.location.reload();
    });

    acoes.appendChild(botao);
    return acoes;
}

/**
 * Monta todas as seções de dados de teste.
 */
function renderizarDadosTeste() {
    if (!containerDadosTeste) return;
    containerDadosTeste.innerHTML = "";

    // Ids das reservas de exemplo, para diferenciar das criadas nos testes
    const idsExemplo = reservasMock.map(reserva => reserva.id);

    // Usuários: nome, perfil, apartamento, e-mail e senha
    const linhasUsuarios = usuariosMock.map(usuario => {
        const perfil = buscarPerfil(usuario);
        return [
            usuario.nome,
            perfil ? perfil.nome : usuario.cargo,
            usuario.apartamento || "-",
            usuario.email,
            usuario.senha
        ];
    });

    // Áreas comuns: nome, capacidade e horários disponíveis para reserva
    const linhasAreas = areasComunsMock.map(area => [
        area.nome,
        `${area.capacidade} pessoas`,
        area.horarios.join(", ")
    ]);

    // Reservas existentes (exemplo + criadas nos testes), por data
    const linhasReservas = carregarReservas()
        .sort((a, b) => (a.data + a.horario).localeCompare(b.data + b.horario))
        .map(reserva => {
            const area = buscarArea(reserva.areaId);
            const morador = buscarUsuario(reserva.moradorId);
            return [
                area ? area.nome : reserva.areaId,
                formatarDataBR(reserva.data),
                reserva.horario,
                morador ? morador.nome : reserva.moradorId,
                idsExemplo.includes(reserva.id) ? "Exemplo" : "Criada no teste"
            ];
        });

    // Eventos do calendário (exemplo + registrados pela síndica)
    const linhasEventos = carregarTodosEventos().map(evento => [
        formatarDataBR(evento.data),
        evento.titulo,
        evento.horario,
        evento.local
    ]);

    containerDadosTeste.append(
        criarDicas(),
        criarTabela("Usuários", ["Nome", "Perfil", "Apto", "E-mail", "Senha"], linhasUsuarios, "Nenhum usuário."),
        criarTabela("Áreas comuns", ["Área", "Capacidade", "Horários"], linhasAreas, "Nenhuma área."),
        criarTabela("Reservas existentes", ["Área", "Data", "Horário", "Morador", "Origem"], linhasReservas, "Nenhuma reserva."),
        criarTabela("Eventos do calendário", ["Data", "Título", "Horário", "Local"], linhasEventos, "Nenhum evento."),
        criarBotaoRestaurar()
    );
}

renderizarDadosTeste();
