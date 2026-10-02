let currentDate = new Date(2026, 9, 1); 
let selectedDate = null;


const monthTitle = document.getElementById("month-title");
const calendarDays = document.getElementById("calendar-days");
const prevMonthBtn = document.getElementById("prev-month");
const nextMonthBtn = document.getElementById("next-month");
const listContainer = document.getElementById("list-container");
const calendarDescription = document.getElementById("calendar-description");
const eventsList = document.getElementById("events-list");

const meses = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

function formatDateString(year, month, day) {
    const mm = String(month + 1).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    return `${year}-${mm}-${dd}`;
}

function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    if (monthTitle) monthTitle.innerText = `${meses[month]} ${year}`;
    if (!calendarDays) return;
    calendarDays.innerHTML = "";

    const firstDayIndex = new Date(year, month, 1).getDay();
    const lastDay = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDayIndex; i++) {
        const emptyDiv = document.createElement("div");
        emptyDiv.classList.add("day", "empty");
        calendarDays.appendChild(emptyDiv);
    }

    for (let day = 1; day <= lastDay; day++) {
        const daySquare = document.createElement("div");
        daySquare.classList.add("day");
        daySquare.innerText = day;
        
        const dateString = formatDateString(year, month, day);
        
        const loopDate = new Date(year, month, day);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const isPastDate = loopDate < today;

        if (isPastDate) {
        daySquare.classList.add('past');
        }

        if (mockEventos[dateString]) {
            daySquare.classList.add("marked");
        }

        if (selectedDate === dateString) {
            daySquare.classList.add("selected");
        }

        daySquare.addEventListener("click", () => {
            if (isPastDate) return;
            
            selectedDate = dateString;
            renderCalendar();

            const loopDate = new Date(year, month, day);

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const isPastDate = loopDate < today;

            renderEventos(dateString, isPastDate);
        });

        calendarDays.appendChild(daySquare);
    }
}


function renderEventos(dateString, isPastDate = false) {
    if (listContainer) listContainer.classList.remove("hidden");
    
    const [year, month, day] = dateString.split("-");
    
    if (calendarDescription) calendarDescription.innerText = `Eventos em ${day}/${month}/${year}:`;

    if (eventsList) {
        eventsList.innerHTML = "";
        const eventosDoDia = mockEventos[dateString] || [];

        if (eventosDoDia.length > 0) {
            eventosDoDia.forEach(item => {
                const card = document.createElement("div");
                if (isPastDate) {
                    card.classList.add('readonly');
                }

                card.classList.add("card");

                const etiqueta = item.tipo && typeof nomeTipoEvento === "function"
                    ? `<span class="event-tag event-tag-${item.tipo}">${nomeTipoEvento(item.tipo)}</span>`
                    : "";

                card.innerHTML = `
                 ${etiqueta}
                 <p class="event-title">${item.titulo}</p> 
                 <p class="event-time">Horário: ${item.horario}</p> 
                 <p class="event-place">Local: ${item.local}</p> 
                 ${isPastDate ? '<span class="status-locked">Visualização apenas (Dia Encerrado)</span>' : ''}
                 `; 
                eventsList.appendChild(card);
            });
        } else {
            eventsList.innerHTML = `<p class="no-event">Nenhum evento neste dia.</p>`;
        }
    }
}

if (prevMonthBtn) {
    prevMonthBtn.addEventListener("click", () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        console.log("Mês trocado:", currentDate);
        renderCalendar();
});
}

if (nextMonthBtn) {
    nextMonthBtn.addEventListener("click", () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        console.log("Mês trocado:", currentDate);
        renderCalendar();
});
}

renderCalendar();

