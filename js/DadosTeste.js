/*
 * DadosTeste.js
 * ------------------------------------------------------------------
 * Menu lateral "Dados mockados", presente em todas as telas.
 * Fica fechado na borda direita da tela, como um botão "‹ Dados mockados".
 * Ao clicar, abre um painel com os dados salvos no sistema:
 *   - como testar;
 *   - usuários (com CPF, e-mail e senha);
 *   - pessoas permitidas (CPF) e veículos permitidos (placa);
 *   - áreas comuns, reservas e eventos do calendário.
 * Também tem um botão para restaurar os dados de exemplo
 * (apaga o que foi criado durante os testes).
 *
 * O painel é criado por este script (não precisa de HTML na página) e se
 * atualiza sozinho quando algo é salvo (evento "dados-atualizados",
 * disparado por salvarArmazenamento em Comum.js).
 *
 * Depende de DadosMock.js e Comum.js.
 */

/**
 * Cria uma tabela com cabeçalho. Devolve um parágrafo quando não há linhas.
 * - cabecalhos: nomes das colunas
 * - linhas:     lista de linhas; cada linha é uma lista de textos
 * A tabela fica numa <div> com rolagem horizontal, para telas pequenas.
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

/**
 * Cria uma seção recolhível (<details>) com título e conteúdo.
 */
function criarSecao(titulo, conteudo, aberta) {
    const secao = document.createElement("details");
    secao.className = "dados-secao";
    secao.open = Boolean(aberta);

    const resumo = document.createElement("summary");
    resumo.textContent = titulo;

    secao.append(resumo, conteudo);
    return secao;
}

/**
 * Lista de dicas com o passo a passo para testar cada funcionalidade.
 */
function criarDicas() {
    const reservaOcupada = reservasMock[0];
    const areaOcupada = buscarArea(reservaOcupada.areaId);
    const donoReserva = buscarUsuario(reservaOcupada.moradorId);

    const dicas = [
        "Portaria: entre como Porteiro, abra a aba Pessoas e digite um CPF da tabela abaixo. Para testar um CPF não cadastrado, use 111.444.777-35.",
        "Garagem: na aba Garagem, digite uma placa da tabela de veículos. Para testar uma placa não cadastrada, use XYZ9K87.",
        "Registrar evento: entre como Síndica, clique em \"Registrar evento\", preencha e salve.",
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

/**
 * Botão que apaga tudo o que foi criado durante os testes (localStorage)
 * e recarrega a página com apenas os dados de exemplo.
 */
function criarBotaoRestaurar() {
    const botao = document.createElement("button");
    botao.type = "button";
    botao.className = "btn btn-secundario btn-bloco";
    botao.textContent = "Restaurar dados de exemplo";
    botao.addEventListener("click", () => {
        const confirmou = window.confirm("Apagar os eventos, reservas, pessoas, veículos e registros criados durante os testes?");
        if (!confirmou) return;

        try {
            [CHAVE_EVENTOS, CHAVE_RESERVAS, CHAVE_PESSOAS, CHAVE_VEICULOS, CHAVE_ACESSOS]
                .forEach(chave => localStorage.removeItem(chave));
        } catch (erro) {
            console.warn("Não foi possível limpar os dados locais.", erro);
        }
        window.location.reload();
    });
    return botao;
}

/**
 * Monta o conteúdo do painel com os dados atuais.
 */
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
        evento.titulo,
        evento.horario,
        evento.local
    ]);

    corpo.append(
        criarSecao("Como testar", criarDicas(), true),
        criarSecao("Usuários", criarTabela(["Nome", "Perfil", "CPF", "E-mail", "Senha"], linhasUsuarios, "Nenhum usuário."), true),
        criarSecao("Pessoas permitidas", criarTabela(["Nome", "CPF", "Tipo", "Destino", "Origem"], linhasPessoas, "Nenhuma pessoa."), false),
        criarSecao("Veículos permitidos", criarTabela(["Placa", "Veículo", "Tipo", "Proprietário", "Origem"], linhasVeiculos, "Nenhum veículo."), false),
        criarSecao("Áreas comuns", criarTabela(["Área", "Capacidade", "Horários"], linhasAreas, "Nenhuma área."), false),
        criarSecao("Reservas", criarTabela(["Área", "Data", "Horário", "Morador", "Origem"], linhasReservas, "Nenhuma reserva."), false),
        criarSecao("Eventos do calendário", criarTabela(["Data", "Título", "Horário", "Local"], linhasEventos, "Nenhum evento."), false),
        criarBotaoRestaurar()
    );
}

/**
 * Cria o menu lateral, fechado, e liga o botão que abre e fecha.
 */
function criarMenuDados() {
    const menu = document.createElement("aside");
    menu.className = "dados-lateral";
    menu.id = "dados-lateral";
    menu.setAttribute("aria-label", "Dados mockados");

    // Botão que fica na borda da tela: "‹ Dados mockados" (fechado) / "› Fechar" (aberto)
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
    // Atualiza as tabelas quando algo é salvo com o menu aberto.
    window.addEventListener("dados-atualizados", () => {
        if (aberto()) montarDadosMockados(corpo);
    });
}

criarMenuDados();
