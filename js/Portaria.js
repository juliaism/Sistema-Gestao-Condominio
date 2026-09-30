/*
 * Portaria.js
 * ------------------------------------------------------------------
 * Tela do porteiro (portaria.html). Dois controles:
 *
 *   1. Pessoas: o porteiro digita o CPF; se a pessoa estiver cadastrada,
 *      aparece "Apto a entrar" com as informações dela.
 *   2. Garagem: mesma ideia, mas pela placa do veículo. Só entram
 *      veículos de moradores, visitantes e funcionários cadastrados.
 *
 * Em ambos é possível cadastrar uma nova pessoa / um novo veículo.
 * Cada consulta fica registrada em "Últimos registros".
 *
 * Só o perfil "porteiro" usa esta tela. Depende de DadosMock.js e Comum.js.
 */

// Garante que há alguém logado (senão redireciona para o login).
const usuarioLogado = exigirLogin();

// Quantos registros aparecem nas listas (o histórico guarda até LIMITE_HISTORICO).
const LIMITE_REGISTROS = 8;
const LIMITE_HISTORICO = 50;

// Referências gerais.
const conteudoPortaria = document.getElementById("conteudo-portaria");
const mensagemAcesso = document.getElementById("mensagem-acesso");
const abas = {
    pessoas: { botao: document.getElementById("aba-pessoas"), painel: document.getElementById("painel-pessoas") },
    garagem: { botao: document.getElementById("aba-garagem"), painel: document.getElementById("painel-garagem") }
};

// Pessoas
const formCpf = document.getElementById("form-cpf");
const campoCpfConsulta = document.getElementById("cpf-consulta");
const resultadoPessoa = document.getElementById("resultado-pessoa");
const formNovaPessoa = document.getElementById("form-nova-pessoa");
const campoPessoaNome = document.getElementById("pessoa-nome");
const campoPessoaCpf = document.getElementById("pessoa-cpf");
const campoPessoaTipo = document.getElementById("pessoa-tipo");
const campoPessoaDetalhe = document.getElementById("pessoa-detalhe");
const mensagemNovaPessoa = document.getElementById("mensagem-nova-pessoa");
const registrosPessoas = document.getElementById("registros-pessoas");

// Garagem
const formPlaca = document.getElementById("form-placa");
const campoPlacaConsulta = document.getElementById("placa-consulta");
const resultadoVeiculo = document.getElementById("resultado-veiculo");
const formNovoVeiculo = document.getElementById("form-novo-veiculo");
const campoVeiculoPlaca = document.getElementById("veiculo-placa");
const campoVeiculoTipo = document.getElementById("veiculo-tipo");
const campoVeiculoModelo = document.getElementById("veiculo-modelo");
const campoVeiculoCor = document.getElementById("veiculo-cor");
const campoVeiculoProprietario = document.getElementById("veiculo-proprietario");
const campoVeiculoDetalhe = document.getElementById("veiculo-detalhe");
const mensagemNovoVeiculo = document.getElementById("mensagem-novo-veiculo");
const registrosVeiculos = document.getElementById("registros-veiculos");

// ---------- Máscaras dos campos ----------

/**
 * Formata enquanto digita: "12345678909" -> "123.456.789-09".
 */
function mascararCpf(valor) {
    const n = limparCpf(valor).slice(0, 11);
    return n
        .replace(/^(\d{3})(\d)/, "$1.$2")
        .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
        .replace(/\.(\d{3})(\d)/, ".$1-$2");
}

function ativarMascaraCpf(campo) {
    campo.addEventListener("input", () => { campo.value = mascararCpf(campo.value); });
}

/**
 * Placa em maiúsculas e sem hífen, com no máximo 7 caracteres.
 */
function ativarMascaraPlaca(campo) {
    campo.addEventListener("input", () => { campo.value = normalizarPlaca(campo.value).slice(0, 7); });
}

// ---------- Componentes de tela ----------

/**
 * Mostra o resultado de uma consulta.
 * - situacao: "ok" (liberado), "negado" (não cadastrado) ou "erro" (dado inválido)
 * - titulo:   texto grande do resultado
 * - linhas:   lista de pares [rótulo, valor] com as informações da pessoa/veículo
 */
function mostrarResultado(caixa, situacao, titulo, linhas, texto) {
    caixa.className = `resultado resultado-${situacao}`;
    caixa.innerHTML = "";

    const tituloEl = document.createElement("p");
    tituloEl.className = "resultado-titulo";
    tituloEl.textContent = titulo;
    caixa.appendChild(tituloEl);

    if (texto) {
        const textoEl = document.createElement("p");
        textoEl.className = "resultado-texto";
        textoEl.textContent = texto;
        caixa.appendChild(textoEl);
    }

    if (linhas && linhas.length) {
        const lista = document.createElement("dl");
        lista.className = "dados-perfil";
        linhas.forEach(([rotulo, valor]) => {
            const dt = document.createElement("dt");
            dt.textContent = rotulo;
            const dd = document.createElement("dd");
            dd.textContent = valor || "-";
            lista.append(dt, dd);
        });
        caixa.appendChild(lista);
    }
}

function esconderResultado(caixa) {
    caixa.className = "resultado hidden";
    caixa.innerHTML = "";
}

// ---------- Registro de passagens ----------

/**
 * Guarda uma consulta no histórico da portaria (mais recentes primeiro).
 */
function registrarAcesso(tipo, identificador, nome, liberado) {
    const historico = lerArmazenamento(CHAVE_ACESSOS, []);
    historico.unshift({
        id: `ac-${Date.now()}`,
        tipo,                        // "pessoa" ou "veiculo"
        identificador,               // CPF ou placa
        nome: nome || "Não cadastrado",
        liberado,
        quando: new Date().toISOString(),
        porteiroId: usuarioLogado.id
    });
    salvarArmazenamento(CHAVE_ACESSOS, historico.slice(0, LIMITE_HISTORICO));
    renderizarRegistros();
}

/**
 * Desenha as duas listas de "Últimos registros".
 */
function renderizarRegistros() {
    const historico = lerArmazenamento(CHAVE_ACESSOS, []);
    desenharRegistros(registrosPessoas, historico.filter(r => r.tipo === "pessoa"), formatarCpf);
    desenharRegistros(registrosVeiculos, historico.filter(r => r.tipo === "veiculo"), formatarPlaca);
}

function desenharRegistros(lista, registros, formatarId) {
    lista.innerHTML = "";

    if (registros.length === 0) {
        const vazio = document.createElement("li");
        vazio.className = "lista-vazia";
        vazio.textContent = "Nenhuma consulta ainda.";
        lista.appendChild(vazio);
        return;
    }

    registros.slice(0, LIMITE_REGISTROS).forEach(registro => {
        const item = document.createElement("li");
        item.className = "registro";

        const info = document.createElement("div");
        const nome = document.createElement("p");
        nome.className = "registro-nome";
        nome.textContent = registro.nome;
        const detalhe = document.createElement("p");
        detalhe.className = "registro-detalhe";
        const quando = new Date(registro.quando).toLocaleString("pt-BR", {
            day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit"
        });
        detalhe.textContent = `${formatarId(registro.identificador)} | ${quando}`;
        info.append(nome, detalhe);

        const tag = document.createElement("span");
        tag.className = registro.liberado ? "tag tag-ok" : "tag tag-negado";
        tag.textContent = registro.liberado ? "Liberado" : "Negado";

        item.append(info, tag);
        lista.appendChild(item);
    });
}

// ---------- Pessoas (CPF) ----------

/**
 * Procura uma pessoa permitida pelo CPF (somente números).
 */
function buscarPessoaPorCpf(cpf) {
    const numero = limparCpf(cpf);
    return carregarPessoas().find(pessoa => limparCpf(pessoa.cpf) === numero) || null;
}

function verificarPessoa(evento) {
    evento.preventDefault();

    const cpf = limparCpf(campoCpfConsulta.value);
    if (!validarCpf(cpf)) {
        mostrarResultado(resultadoPessoa, "erro", "CPF inválido", [], "Confira os números digitados e tente de novo.");
        return;
    }

    const pessoa = buscarPessoaPorCpf(cpf);
    if (!pessoa) {
        mostrarResultado(resultadoPessoa, "negado", "Acesso não permitido", [
            ["CPF", formatarCpf(cpf)]
        ], "Este CPF não está na lista de pessoas permitidas.");
        registrarAcesso("pessoa", cpf, null, false);
        return;
    }

    mostrarResultado(resultadoPessoa, "ok", "Apto a entrar", [
        ["Nome", pessoa.nome],
        ["CPF", formatarCpf(pessoa.cpf)],
        ["Tipo", TIPOS_ACESSO[pessoa.tipo] || pessoa.tipo],
        ["Destino", pessoa.detalhe]
    ]);
    registrarAcesso("pessoa", cpf, pessoa.nome, true);
}

function adicionarPessoa(evento) {
    evento.preventDefault();
    esconderMensagem(mensagemNovaPessoa);

    const nome = campoPessoaNome.value.trim();
    const cpf = limparCpf(campoPessoaCpf.value);

    if (!nome) return mostrarMensagem(mensagemNovaPessoa, "erro", "Informe o nome da pessoa.");
    if (!validarCpf(cpf)) return mostrarMensagem(mensagemNovaPessoa, "erro", "CPF inválido.");

    const existente = buscarPessoaPorCpf(cpf);
    if (existente) {
        return mostrarMensagem(mensagemNovaPessoa, "erro", `Este CPF já está cadastrado para ${existente.nome}.`);
    }

    const pessoa = {
        id: `pes-${Date.now()}`,
        nome,
        cpf,
        tipo: campoPessoaTipo.value,
        detalhe: campoPessoaDetalhe.value.trim(),
        criadoPor: usuarioLogado.id
    };
    const salvas = lerArmazenamento(CHAVE_PESSOAS, []);
    salvas.push(pessoa);
    salvarArmazenamento(CHAVE_PESSOAS, salvas);

    formNovaPessoa.reset();
    mostrarMensagem(mensagemNovaPessoa, "sucesso", `${nome} foi adicionado(a) às pessoas permitidas.`);
}

// ---------- Garagem (placa) ----------

function buscarVeiculoPorPlaca(placa) {
    const normalizada = normalizarPlaca(placa);
    return carregarVeiculos().find(veiculo => normalizarPlaca(veiculo.placa) === normalizada) || null;
}

function verificarVeiculo(evento) {
    evento.preventDefault();

    const placa = normalizarPlaca(campoPlacaConsulta.value);
    if (!validarPlaca(placa)) {
        mostrarResultado(resultadoVeiculo, "erro", "Placa inválida", [], "Use o padrão ABC-1234 ou ABC1D23.");
        return;
    }

    const veiculo = buscarVeiculoPorPlaca(placa);
    if (!veiculo) {
        mostrarResultado(resultadoVeiculo, "negado", "Acesso não permitido", [
            ["Placa", formatarPlaca(placa)]
        ], "Este veículo não está liberado para a garagem.");
        registrarAcesso("veiculo", placa, null, false);
        return;
    }

    mostrarResultado(resultadoVeiculo, "ok", "Veículo liberado", [
        ["Placa", formatarPlaca(veiculo.placa)],
        ["Veículo", veiculo.cor ? `${veiculo.modelo} (${veiculo.cor})` : veiculo.modelo],
        ["Proprietário", veiculo.proprietario],
        ["Tipo", TIPOS_ACESSO[veiculo.tipo] || veiculo.tipo],
        ["Destino", veiculo.detalhe]
    ]);
    registrarAcesso("veiculo", placa, `${veiculo.modelo} - ${veiculo.proprietario}`, true);
}

function adicionarVeiculo(evento) {
    evento.preventDefault();
    esconderMensagem(mensagemNovoVeiculo);

    const placa = normalizarPlaca(campoVeiculoPlaca.value);
    const modelo = campoVeiculoModelo.value.trim();
    const proprietario = campoVeiculoProprietario.value.trim();

    if (!validarPlaca(placa)) return mostrarMensagem(mensagemNovoVeiculo, "erro", "Placa inválida. Use o padrão ABC-1234 ou ABC1D23.");
    if (!modelo) return mostrarMensagem(mensagemNovoVeiculo, "erro", "Informe o modelo do veículo.");
    if (!proprietario) return mostrarMensagem(mensagemNovoVeiculo, "erro", "Informe o proprietário do veículo.");

    const existente = buscarVeiculoPorPlaca(placa);
    if (existente) {
        return mostrarMensagem(mensagemNovoVeiculo, "erro", `A placa ${formatarPlaca(placa)} já está cadastrada (${existente.proprietario}).`);
    }

    const veiculo = {
        id: `vei-${Date.now()}`,
        placa,
        modelo,
        cor: campoVeiculoCor.value.trim(),
        tipo: campoVeiculoTipo.value,
        proprietario,
        detalhe: campoVeiculoDetalhe.value.trim(),
        criadoPor: usuarioLogado.id
    };
    const salvos = lerArmazenamento(CHAVE_VEICULOS, []);
    salvos.push(veiculo);
    salvarArmazenamento(CHAVE_VEICULOS, salvos);

    formNovoVeiculo.reset();
    mostrarMensagem(mensagemNovoVeiculo, "sucesso", `Veículo ${formatarPlaca(placa)} adicionado à garagem.`);
}

// ---------- Abas ----------

function abrirAba(nome) {
    Object.entries(abas).forEach(([chave, aba]) => {
        const ativa = chave === nome;
        aba.botao.setAttribute("aria-selected", String(ativa));
        aba.painel.classList.toggle("hidden", !ativa);
    });
}

// ---------- Inicialização ----------

if (usuarioLogado) {
    renderizarTopo("portaria");

    if (!ehPorteiro(usuarioLogado)) {
        // Quem não é porteiro vê só a mensagem de acesso negado.
        conteudoPortaria.classList.add("hidden");
        mostrarMensagem(mensagemAcesso, "erro", "Acesso negado: apenas o porteiro pode usar a portaria.");
    } else {
        ativarMascaraCpf(campoCpfConsulta);
        ativarMascaraCpf(campoPessoaCpf);
        ativarMascaraPlaca(campoPlacaConsulta);
        ativarMascaraPlaca(campoVeiculoPlaca);

        abas.pessoas.botao.addEventListener("click", () => abrirAba("pessoas"));
        abas.garagem.botao.addEventListener("click", () => abrirAba("garagem"));

        formCpf.addEventListener("submit", verificarPessoa);
        formNovaPessoa.addEventListener("submit", adicionarPessoa);
        formPlaca.addEventListener("submit", verificarVeiculo);
        formNovoVeiculo.addEventListener("submit", adicionarVeiculo);

        // Limpa o resultado antigo quando o porteiro começa uma nova consulta.
        campoCpfConsulta.addEventListener("input", () => esconderResultado(resultadoPessoa));
        campoPlacaConsulta.addEventListener("input", () => esconderResultado(resultadoVeiculo));

        renderizarRegistros();
    }
}
