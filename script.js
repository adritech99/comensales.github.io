let comensales = JSON.parse(localStorage.getItem('comensales')) || [];
let platos = JSON.parse(localStorage.getItem('platos')) || [];
let editandoPlatoId = null; // Variable para saber si estamos editando

function guardarDatos() {
    localStorage.setItem('comensales', JSON.stringify(comensales));
    localStorage.setItem('platos', JSON.stringify(platos));
}

function agregarComensal() {
    const inputNombre = document.getElementById('nombreComensal');
    const nombre = inputNombre.value.trim();
    if (nombre) {
        comensales.push({ nombre: nombre, platosAsignados: [] });
        inputNombre.value = '';
        guardarDatos();
        renderizarTodo();
    }
}

// NUEVA FUNCIÓN: CARGAR DATOS EN EL FORMULARIO PARA EDITAR
function prepararEdicion(id) {
    const plato = platos.find(p => p.id === id);
    if (plato) {
        document.getElementById('nombrePlato').value = plato.nombre;
        document.getElementById('precioPlato').value = plato.precio;
        document.getElementById('cantidadPlato').value = plato.cantidad;
        
        editandoPlatoId = id;
        // Cambiamos el texto del botón para que el usuario sepa que está editando
        const btn = document.querySelector("button[onclick='agregarPlato()']");
        btn.textContent = "Actualizar Plato";
        btn.style.background = "#ffc107"; // Color naranja para distinguir
        btn.style.color = "#000";
    }
}

function agregarPlato() {
    const nombre = document.getElementById('nombrePlato').value.trim();
    const precio = parseFloat(document.getElementById('precioPlato').value);
    const cantidad = parseInt(document.getElementById('cantidadPlato').value);
    
    if (nombre && precio > 0 && cantidad > 0) {
        if (editandoPlatoId !== null) {
            // MODO EDICIÓN: Buscamos el plato y actualizamos sus valores
            const index = platos.findIndex(p => p.id === editandoPlatoId);
            platos[index].nombre = nombre;
            platos[index].precio = precio;
            platos[index].cantidad = cantidad;
            
            // Resetear estado de edición
            editandoPlatoId = null;
            const btn = document.querySelector("button[onclick='agregarPlato()']");
            btn.textContent = "Añadir Plato";
            btn.style.background = "#28a745";
            btn.style.color = "#fff";
        } else {
            // MODO CREACIÓN
            platos.push({ id: Date.now(), nombre, precio, cantidad });
        }
        
        // Limpiar campos
        document.getElementById('nombrePlato').value = '';
        document.getElementById('precioPlato').value = '';
        document.getElementById('cantidadPlato').value = '1';
        
        guardarDatos();
        renderizarTodo();
    }
}

function renderizarTodo() {
    // Comensales
    document.getElementById('listaComensales').innerHTML = comensales.map((c, i) => `
        <div style="background:#007bff; color:white; padding:5px 12px; border-radius:20px; display:inline-block; margin:5px;">
            ${c.nombre} <span style="cursor:pointer; margin-left:10px;" onclick="eliminarComensal(${i})">×</span>
        </div>
    `).join('');

    // Tabla de Platos (AHORA CON BOTÓN EDITAR)
    const tablaB = document.getElementById('tablaPlatosBody');
    tablaB.innerHTML = platos.map((p, i) => `
        <tr>
            <td>${p.nombre}</td>
            <td>${p.precio.toFixed(2)}€</td>
            <td>${p.cantidad}</td>
            <td>${(p.precio * p.cantidad).toFixed(2)}€</td>
            <td>
                <button onclick="prepararEdicion(${p.id})" style="background:#ffc107; color:black; padding:4px 8px; margin-right:5px;">Editar</button>
                <button class="btn-danger" style="padding:4px 8px;" onclick="eliminarPlato(${i})">Eliminar</button>
            </td>
        </tr>
    `).join('');

    // Distribución (Checkboxes)
    const dist = document.getElementById('distribucion');
    dist.innerHTML = platos.map(p => `
        <div style="margin-bottom:15px; border:1px solid #ddd; padding:10px; border-radius:8px;">
            <strong>${p.nombre}</strong><br>
            ${comensales.map((c, i) => `
                <label style="margin-right:15px;">
                    <input type="checkbox" ${c.platosAsignados.includes(p.id) ? 'checked' : ''} 
                    onchange="toggleAsignacion(${i}, ${p.id})"> ${c.nombre}
                </label>
            `).join('')}
        </div>
    `).join('');

    actualizarResumenFinal();
}

// (Las funciones toggleAsignacion, actualizarResumenFinal, eliminarComensal, eliminarPlato y limpiarTodo se mantienen igual que en el código anterior)

function toggleAsignacion(comensalIndex, platoId) {
    const idx = comensales[comensalIndex].platosAsignados.indexOf(platoId);
    if (idx > -1) comensales[comensalIndex].platosAsignados.splice(idx, 1);
    else comensales[comensalIndex].platosAsignados.push(platoId);
    guardarDatos();
    renderizarTodo();
}

function actualizarResumenFinal() {
    const contenedor = document.getElementById('totalesFinales');
    let html = "<h3>Resumen de Gastos:</h3>";
    comensales.forEach(comensal => {
        let total = 0;
        let items = [];
        platos.forEach(p => {
            const num = comensales.filter(c => c.platosAsignados.includes(p.id)).length;
            if (comensal.platosAsignados.includes(p.id)) {
                const parte = (p.precio * p.cantidad) / num;
                total += parte;
                items.push(`${p.nombre} (${parte.toFixed(2)}€)`);
            }
        });
        html += `<div class="comensal-card"><strong>${comensal.nombre}</strong>: <span class="total-badge">${total.toFixed(2)}€</span><br><small>${items.join(' + ')}</small></div>`;
    });
    contenedor.innerHTML = html;
}

function eliminarComensal(index) {
    comensales.splice(index, 1);
    guardarDatos();
    renderizarTodo();
}

function eliminarPlato(index) {
    platos.splice(index, 1);
    guardarDatos();
    renderizarTodo();
}

function limpiarTodo() {
    if (confirm("¿Borrar todo?")) {
        localStorage.clear(); comensales = []; platos = []; renderizarTodo();
    }
}

window.onload = renderizarTodo;