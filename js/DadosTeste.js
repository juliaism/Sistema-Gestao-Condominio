/*
 * DadosTeste.js
 * ------------------------------------------------------------------
 * Menu lateral "Dados mockados", presente em todas as telas.
 */

function criarTabela(cabecalhos, linhas, textoVazio) {
    if (linhas.length === 0) {
        const vazio = document.createElement("p");
        vazio.className = "lista-vazia";
        vazio.textContent = textoVazio;
        return vazio;
    }

    const rolagem = document.createElement("div");
    rolagem.className = "tabela-rolagem";

    const tabela = document.createElement("table");
    tabela.className = "tabela";

    const thead = document.createElement("thead");
    const linhaCabecalho = document.createElement("tr");
    cabecalhos.forEach(texto => {
        const th = document.createElement("th");
        th.scope = "col";
        th.textContent = texto;
        linhaCabecalho.appendChild(th);
    });
    thead.appendChild(linhaCabecalho);

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
    return rolagem;
}

function criarSecao(titulo, conteudo, aberta) {
    const secao = document.createElement("details");
    secao.className = "dados-secao";
    secao.open = Boolean(aberta);

    const resumo = document.createElement("summary");
    resumo.textContent = titulo;

    secao.append(resumo, conteudo);
    return secao;
}

function criarDicas() {
    const reservaOcupada = reservasMock[0];
    const areaOcupada = buscarArea(reservaOcupada.areaId);
    const donoReserva = buscarUsuario(reservaOcupada.moradorId);

    const dicas = [
        "Portaria: entre como Porteiro, abra a aba Pessoas e digite um CPF da tabela abaixo. Para testar um CPF não cadastrado, use 111.444.777-35.",
        "Garagem: na aba Garagem, digite uma placa da tabela de veículos. Para testar uma placa não cadastrada, use XYZ9K87.",
        "Correspondências: entre como Síndica ou Porteiro e abra \"Correspondências\" no menu para ver o histórico. Filtre por apartamento (ex.: 302) ou por status; para ver a lista vazia, pesquise um apartamento inexistente (ex.: 999).",
        "Registrar correspondência: como Porteiro, abra \"Gerenciamento de Correspondências: registrar chegada\", preencha apartamento e tipo de pacote e clique em Registrar. Deixando o apartamento em branco, aparece o erro de campo obrigatório.",
        "Registrar evento: entre como Síndica, clique em \"Registrar evento\", escolha o tipo (Aviso, Manutenção, Assembleia ou Evento), preencha e salve.",
        "Reservas no calendário: as reservas de áreas comuns aparecem no calendário com a etiqueta \"Reserva\".",
        "Acesso negado: entre como Morador e clique em \"Registrar evento\" no calendário.",
        `Conflito de horário: tente reservar ${areaOcupada.nome} em ${formatarDataBR(reservaOcupada.data)}, horário ${reservaOcupada.horario} (já reservado por ${donoReserva.nome}).`
    ];

    const lista = document.createElement("ul");
    lista.className = "lista-permissoes";
    dicas.forEach(texto => {
        const item = document.createElement("li");
        item.textContent = texto;
        lista.appendChild(item);
    });
    return lista;
}

function criarBotaoRestaurar() {
    const botao = document.createElement("button");
    botao.type = "button";
    botao.className = "btn btn-secundario btn-bloco";
    botao.textContent = "Restaurar dados de exemplo";
    botao.addEventListener("click", () => {
        const confirmou = window.confirm("Apagar os eventos, reservas, requerimentos, pessoas, veículos, correspondências e registros criados durante os testes?");
        if (!confirmou) return;

        try {
            [CHAVE_EVENTOS, CHAVE_RESERVAS, CHAVE_REQUERIMENTOS, CHAVE_PESSOAS, CHAVE_VEICULOS, CHAVE_ACESSOS, CHAVE_CORRESPONDENCIAS]
                .forEach(chave => localStorage.removeItem(chave));
        } catch (erro) {
            console.warn("Não foi possível limpar os dados locais.", erro);
        }
        window.location.reload();
    });
    return botao;
}

function montarDadosMockados(corpo) {
    corpo.innerHTML = "";

    const idsReservasExemplo = reservasMock.map(reserva => reserva.id);

    const linhasUsuarios = usuariosMock.map(usuario => {
        const perfil = buscarPerfil(usuario);
        return [
            usuario.nome,
            perfil ? perfil.nome : usuario.cargo,
            formatarCpf(usuario.cpf),
            usuario.email,
            usuario.senha
        ];
    });

    const linhasPessoas = carregarPessoas().map(pessoa => [
        pessoa.nome,
        formatarCpf(pessoa.cpf),
        TIPOS_ACESSO[pessoa.tipo] || pessoa.tipo,
        pessoa.detalhe || "-",
        pessoa.origem
    ]);

    const linhasVeiculos = carregarVeiculos().map(veiculo => [
        formatarPlaca(veiculo.placa),
        veiculo.cor ? `${veiculo.modelo} (${veiculo.cor})` : veiculo.modelo,
        TIPOS_ACESSO[veiculo.tipo] || veiculo.tipo,
        veiculo.proprietario,
        veiculo.origem
    ]);

    const linhasCorrespondencias = carregarCorrespondencias().map(item => [
        item.apartamento ? `Apto ${item.apartamento}` : "-",
        item.destinatario,
        nomeTipoCorrespondencia(item.tipo),
        formatarDataHoraBR(item.data, item.hora),
        nomeStatusCorrespondencia(item.status),
        item.status === "entregue" ? (item.retiradoPor || "Não informado") : "-",
        item.origem
    ]);

    const linhasAreas = areasComunsMock.map(area => [
        area.nome,
        `${area.capacidade} pessoas`,
        area.horarios.join(", ")
    ]);

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
                idsReservasExemplo.includes(reserva.id) ? "Exemplo" : "Criada"
            ];
        });

    const linhasEventos = carregarTodosEventos().map(evento => [
        formatarDataBR(evento.data),
        nomeTipoEvento(evento.tipo),
        evento.titulo,
        evento.horario,
        evento.local
    ]);

    const linhasRequerimentos = carregarRequerimentos().map(req => {
        const tipoObj = tiposRequerimentoMock.find(t => t.id === req.tipo);
        const morador = buscarUsuario(req.moradorId);
        return [
            tipoObj ? tipoObj.nome : req.tipo,
            req.descricao,
            morador ? morador.nome : req.moradorId,
            formatarDataBR(req.data),
            req.status
        ];
    });

    corpo.append(
        criarSecao("Como testar", criarDicas(), true),
        criarSecao("Usuários", criarTabela(["Nome", "Perfil", "CPF", "E-mail", "Senha"], linhasUsuarios, "Nenhum usuário."), true),
        criarSecao("Pessoas permitidas", criarTabela(["Nome", "CPF", "Tipo", "Destino", "Origem"], linhasPessoas, "Nenhuma pessoa."), false),
        criarSecao("Veículos permitidos", criarTabela(["Placa", "Veículo", "Tipo", "Proprietário", "Origem"], linhasVeiculos, "Nenhum veículo."), false),
        criarSecao("Correspondências", criarTabela(["Apartamento", "Destinatário", "Tipo", "Recebido em", "Status", "Retirado por", "Origem"], linhasCorrespondencias, "Nenhuma correspondência."), false),
        criarSecao("Áreas comuns", criarTabela(["Área", "Capacidade", "Horários"], linhasAreas, "Nenhuma área."), false),
        criarSecao("Reservas", criarTabela(["Área", "Data", "Horário", "Morador", "Origem"], linhasReservas, "Nenhuma reserva."), false),
        criarSecao("Eventos do calendário", criarTabela(["Data", "Tipo", "Título", "Horário", "Local"], linhasEventos, "Nenhum evento."), false),
        criarSecao("Requerimentos", criarTabela(["Tipo", "Descrição", "Morador", "Data", "Estado"], linhasRequerimentos, "Nenum requerimento."), false),
        criarBotaoRestaurar()
    );
}

function criarMenuDados() {
    const menu = document.createElement("aside");
    menu.className = "dados-lateral";
    menu.id = "dados-lateral";
    menu.setAttribute("aria-label", "Dados mockados");

    const alca = document.createElement("button");
    alca.type = "button";
    alca.className = "dados-alca";
    alca.setAttribute("aria-expanded", "false");
    alca.setAttribute("aria-controls", "dados-lateral-corpo");

    const seta = document.createElement("span");
    seta.className = "dados-alca-seta";
    seta.textContent = "‹";
    const rotulo = document.createElement("span");
    rotulo.textContent = "Dados mockados";
    alca.append(seta, rotulo);

    const conteudo = document.createElement("div");
    conteudo.className = "dados-lateral-conteudo";
    conteudo.id = "dados-lateral-corpo";

    const titulo = document.createElement("h2");
    titulo.className = "dados-lateral-titulo";
    titulo.textContent = "Dados mockados";
    const texto = document.createElement("p");
    texto.className = "painel-texto";
    texto.textContent = "Dados salvos neste navegador. O que for criado nos testes aparece aqui.";
    const corpo = document.createElement("div");

    conteudo.append(titulo, texto, corpo);
    menu.append(alca, conteudo);
    document.body.appendChild(menu);

    function aberto() {
        return menu.classList.contains("aberto");
    }

    function alternar(abrir) {
        menu.classList.toggle("aberto", abrir);
        alca.setAttribute("aria-expanded", String(abrir));
        seta.textContent = abrir ? "›" : "‹";
        rotulo.textContent = abrir ? "Fechar" : "Dados mockados";
        if (abrir) montarDadosMockados(corpo);
    }

    alca.addEventListener("click", () => alternar(!aberto()));
    document.addEventListener("keydown", (evento) => {
        if (evento.key === "Escape" && aberto()) alternar(false);
    });
    window.addEventListener("dados-atualizados", () => {
        if (aberto()) montarDadosMockados(corpo);
    });
}

criarMenuDados();