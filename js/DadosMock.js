/*
 * DadosMock.js
 * ------------------------------------------------------------------
 * Dados "falsos" (mockados) usados pelo sistema, já que o projeto não
 * possui backend nem banco de dados. Estes valores são o estado inicial
 * da aplicação; o que o usuário cria durante o uso (novos eventos e
 * reservas) é salvo separadamente no localStorage (ver Comum.js).
 *
 * Este arquivo deve ser carregado ANTES de Comum.js e das demais telas,
 * pois elas usam as constantes declaradas aqui.
 */

/*
 * Perfis de acesso do sistema, exibidos na tela de login e na página inicial.
 * - id:         valor usado no campo "perfil" dos usuários
 * - nome:       nome do perfil mostrado na tela
 * - resumo:     frase curta abaixo do nome
 * - permissoes: o que o perfil pode fazer no sistema
 */
const perfisMock = [
    {
        id: "admin",
        nome: "Síndica",
        resumo: "Administração do condomínio",
        permissoes: [
            "Registrar eventos no calendário condominial",
            "Ver todas as reservas de áreas comuns",
            "Reservar áreas comuns"
        ]
    },
    {
        id: "morador",
        nome: "Morador",
        resumo: "Residente do condomínio",
        permissoes: [
            "Ver os eventos do calendário condominial",
            "Reservar áreas comuns",
            "Acompanhar as próprias reservas"
        ]
    }
];

/*
 * Usuários cadastrados no condomínio.
 * - id:          identificador único do usuário (usado na sessão e nas reservas)
 * - nome:        nome exibido no cabeçalho
 * - email/senha: credenciais usadas no login (texto puro, só para demonstração)
 * - perfil:      "admin" = administrador (pode registrar eventos)
 *                "morador" = usuário comum
 * - cargo:       rótulo exibido ao lado do nome (ex.: "Síndica")
 * - apartamento: número do apartamento (null para a administração)
 */
const usuariosMock = [
    { id: "u1", nome: "Fernanda Lima", email: "sindica@condominio.com", senha: "123456", perfil: "admin", cargo: "Síndica", apartamento: null },
    { id: "u2", nome: "Carlos Mendes", email: "carlos@condominio.com", senha: "123456", perfil: "morador", cargo: "Morador", apartamento: "302" },
    { id: "u3", nome: "João Pereira", email: "joao@condominio.com", senha: "123456", perfil: "morador", cargo: "Morador", apartamento: "1401" }
];

/*
 * Áreas comuns que podem ser reservadas pelos moradores.
 * - id:         identificador da área (usado nas reservas)
 * - nome:       nome exibido na tela
 * - capacidade: número máximo de pessoas (informativo)
 * - horarios:   faixas de horário que podem ser reservadas em cada dia
 */
const areasComunsMock = [
    {
        id: "salao",
        nome: "Salão de Festas",
        capacidade: 80,
        horarios: ["10:00 - 14:00", "14:00 - 18:00", "18:00 - 23:00"]
    },
    {
        id: "churrasqueira",
        nome: "Churrasqueira",
        capacidade: 30,
        horarios: ["11:00 - 15:00", "15:00 - 19:00", "19:00 - 23:00"]
    },
    {
        id: "piscina",
        nome: "Piscina",
        capacidade: 20,
        horarios: ["08:00 - 10:00", "10:00 - 12:00", "14:00 - 16:00", "16:00 - 18:00"]
    },
    {
        id: "quadra",
        nome: "Quadra Poliesportiva",
        capacidade: 16,
        horarios: ["08:00 - 10:00", "10:00 - 12:00", "14:00 - 16:00", "16:00 - 18:00", "18:00 - 20:00", "20:00 - 22:00"]
    }
];

/*
 * Reservas que já existem no sistema (feitas por outros moradores).
 * Servem para mostrar horários "Ocupados" e testar o conflito de horário.
 * - areaId:    qual área foi reservada (ver areasComunsMock)
 * - data:      dia da reserva no formato AAAA-MM-DD
 * - horario:   uma das faixas de horário da área
 * - moradorId: quem fez a reserva (ver usuariosMock)
 */
const reservasMock = [
    { id: "r1", areaId: "salao", data: "2026-10-15", horario: "14:00 - 18:00", moradorId: "u3" },
    { id: "r2", areaId: "churrasqueira", data: "2026-10-10", horario: "11:00 - 15:00", moradorId: "u3" },
    { id: "r3", areaId: "piscina", data: "2026-10-03", horario: "10:00 - 12:00", moradorId: "u2" },
    { id: "r4", areaId: "quadra", data: "2026-10-03", horario: "18:00 - 20:00", moradorId: "u3" }
];
