document.addEventListener('DOMContentLoaded', () => {
    const horarioBody = document.getElementById('horario-body');
    const classTimeSelect = document.getElementById('class-time');
    const addClassBtn = document.getElementById('add-class-btn');
    const modalOverlay = document.getElementById('modal-overlay');
    const cancelBtn = document.getElementById('cancel-btn');
    const classForm = document.getElementById('class-form');
    const resetBtn = document.getElementById('reset-horario-btn');

    let classes = JSON.parse(localStorage.getItem('academica-horario')) || [];

    const hours = [
        "06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00",
        "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00"
    ];

    // Populate Time Select
    hours.forEach((hour, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = hour;
        classTimeSelect.appendChild(option);
    });

    const renderTable = () => {
        horarioBody.innerHTML = '';
        hours.forEach((hour, timeIndex) => {
            const tr = document.createElement('tr');
            
            // Time cell
            const tdTime = document.createElement('td');
            tdTime.className = 'time-cell';
            tdTime.textContent = hour;
            tr.appendChild(tdTime);

            // Day cells
            for (let dayIndex = 1; dayIndex <= 6; dayIndex++) {
                const td = document.createElement('td');
                td.dataset.day = dayIndex;
                td.dataset.time = timeIndex;

                const classAtThisTime = classes.find(c => c.day == dayIndex && c.time == timeIndex);
                if (classAtThisTime) {
                    const classDiv = document.createElement('div');
                    classDiv.className = 'class-entry';
                    classDiv.innerHTML = `
                        <div>
                            <h4>${classAtThisTime.name}</h4>
                            <p>${classAtThisTime.room}</p>
                        </div>
                        <span class="delete-class" data-id="${classAtThisTime.id}">&times;</span>
                    `;
                    classDiv.querySelector('.delete-class').addEventListener('click', (e) => {
                        e.stopPropagation();
                        deleteClass(classAtThisTime.id);
                    });
                    td.appendChild(classDiv);
                }

                tr.appendChild(td);
            }
            horarioBody.appendChild(tr);
        });
    };

    const saveClasses = () => {
        localStorage.setItem('academica-horario', JSON.stringify(classes));
        renderTable();
    };

    const deleteClass = (id) => {
        classes = classes.filter(c => c.id !== id);
        saveClasses();
    };

    addClassBtn.addEventListener('click', () => {
        modalOverlay.classList.add('active');
    });

    cancelBtn.addEventListener('click', () => {
        modalOverlay.classList.remove('active');
        classForm.reset();
    });

    classForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newClass = {
            id: Date.now(),
            name: document.getElementById('class-name').value,
            day: document.getElementById('class-day').value,
            time: document.getElementById('class-time').value,
            room: document.getElementById('class-room').value
        };
        classes.push(newClass);
        saveClasses();
        modalOverlay.classList.remove('active');
        classForm.reset();
    });

    resetBtn.addEventListener('click', () => {
        if (confirm('¿Estás seguro de que quieres borrar todo el horario?')) {
            classes = [];
            saveClasses();
        }
    });

    renderTable();
});
