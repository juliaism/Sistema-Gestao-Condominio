const usuarioLogado = exigirLogin();

const abas = {
    itens: {
        botao: document.getElementById("aba-itens"),
        painel: document.getElementById("painel-itens")
    },
    registro: {
        botao: document.getElementById("aba-registro"),
        painel: document.getElementById("painel-registro")
    }
};

const itemList = document.getElementById("item-list");
const itemForm = document.getElementById("item-form");
const itemName = document.getElementById("item-name");
const itemPic = document.getElementById("item-pic");
const itemDescription = document.getElementById("item-description");
const mensagemFormulario = document.getElementById("mensagem-formulario");

function abrirAba(nome) {
    Object.entries(abas).forEach(([chave, aba]) => {
        const ativa = chave === nome;
        aba.botao.setAttribute("aria-selected", String(ativa));
        aba.painel.classList.toggle("hidden", !ativa);
    });
}

function checkItem(item) {
    if (!item.name) return "Informe o item encontrado.";
    if (!item.pic) return "Insira o link da foto do item encontrado.";
    try {
        const url = new URL(item.pic);
        if (url.protocol !== "http:" && url.protocol !== "https:") {
            return "O link da foto deve começar com http:// ou https://.";
        }
    } catch (erro) {
        return "Informe um link válido para a foto do item encontrado.";
    }
    if (!item.description) return "Informe onde e quando o item foi encontrado.";
    return null;
}

function itemCard(item) {
    const card = document.createElement("article");
    card.className = "painel item-encontrado";

    const nome = document.createElement("h2");
    nome.className = "painel-nome";
    nome.textContent = item.name;

    const imagem = document.createElement("img");
    imagem.src = item.pic;
    imagem.alt = `Foto do item encontrado: ${item.name}`;
    imagem.loading = "lazy";
    imagem.className = "item-encontrado-foto";

    const descricao = document.createElement("p");
    descricao.className = "painel-texto";
    descricao.textContent = item.description;

    card.append(nome, imagem, descricao);
    return card;
}

function renderizarItens() {
    const itens = lerArmazenamento(CHAVE_ACHADOS, []);
    itemList.replaceChildren();

    if (!Array.isArray(itens) || itens.length === 0) {
        itemList.classList.add("lista-itens-vazia");
        itemList.textContent = "Nenhum item encontrado";
        return;
    }

    itemList.classList.remove("lista-itens-vazia");
    itens.slice().reverse().forEach(item => {
        itemList.appendChild(itemCard(item));
    });
}

function saveItem(evento) {
    evento.preventDefault();
    esconderMensagem(mensagemFormulario);

    const item = {
        id: `ach-${Date.now()}`,
        name: itemName.value.trim(),
        pic: itemPic.value.trim(),
        description: itemDescription.value.trim(),
        criadoPor: usuarioLogado.id
    };

    const erro = checkItem(item);
    if (erro) {
        mostrarMensagem(mensagemFormulario, "erro", erro);
        return;
    }

    const itens = lerArmazenamento(CHAVE_ACHADOS, []);
    if (!Array.isArray(itens)) {
        mostrarMensagem(mensagemFormulario, "erro", "Não foi possível carregar os itens registrados.");
        return;
    }

    itens.push(item);
    salvarArmazenamento(CHAVE_ACHADOS, itens);

    const itensSalvos = lerArmazenamento(CHAVE_ACHADOS, []);
    if (!Array.isArray(itensSalvos) || !itensSalvos.some(registro => registro.id === item.id)) {
        mostrarMensagem(mensagemFormulario, "erro", "Não foi possível salvar o item encontrado.");
        return;
    }

    itemForm.reset();
    renderizarItens();
    abrirAba("itens");
}

if (usuarioLogado) {
    renderizarTopo("achados-perdidos");
    abas.itens.botao.addEventListener("click", () => abrirAba("itens"));
    abas.registro.botao.addEventListener("click", () => abrirAba("registro"));
    itemForm.addEventListener("submit", saveItem);
    window.addEventListener("dados-atualizados", renderizarItens);
    renderizarItens();
}
