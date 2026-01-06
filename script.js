let comensales = JSON.parse(localStorage.getItem('comensales')) || [];
let platos = JSON.parse(localStorage.getItem('platos')) || [];
let editandoPlatoId = null;

function guardarDatos() {
    localStorage.setItem('comensales', JSON.stringify(comensales));
    localStorage.setItem('platos', JSON.stringify(platos));
}

function agregarComensal() {
    const input = document.getElementById('nombreComensal');
    const nombre = input.value.trim();
    if (nombre) {
        comensales.push({ nombre: nombre, platosAsignados: [] });
        input.value = '';
        guardarDatos();
        renderizarTodo();
    }
}

function agregarPlato() {
    const nombre = document.getElementById('nombrePlato').value.trim();
    const precio = parseFloat(document.getElementById('precioPlato').value);
    const cantidad = parseInt(document.getElementById('cantidadPlato').value);

    if (nombre && precio > 0) {
        if (editandoPlatoId !== null) {
            const index = platos.findIndex(p => p.id === editandoPlatoId);
            platos[index] = { ...platos[index], nombre, precio, cantidad };
            editandoPlatoId = null;
        } else {
            platos.push({ id: Date.now(), nombre, precio, cantidad });
        }
        document.getElementById('nombrePlato').value = '';
        document.getElementById('precioPlato').value = '';
        document.getElementById('cantidadPlato').value = '1';
        guardarDatos();
        renderizarTodo();
    }
}

function prepararEdicion(id) {
    const plato = platos.find(p => p.id === id);
    document.getElementById('nombrePlato').value = plato.nombre;
    document.getElementById('precioPlato').value = plato.precio;
    document.getElementById('cantidadPlato').value = plato.cantidad;
    editandoPlatoId = id;
    window.scrollTo({top: 0, behavior: 'smooth'});
}

function seleccionarTodos(platoId) {
    comensales.forEach(c => {
        if (!c.platosAsignados.includes(platoId)) c.platosAsignados.push(platoId);
    });
    guardarDatos();
    renderizarTodo();
}

function desmarcarTodos(platoId) {
    comensales.forEach(c => {
        c.platosAsignados = c.platosAsignados.filter(id => id !== platoId);
    });
    guardarDatos();
    renderizarTodo();
}

function toggleAsignacion(comensalIdx, platoId) {
    const pos = comensales[comensalIdx].platosAsignados.indexOf(platoId);
    if (pos > -1) comensales[comensalIdx].platosAsignados.splice(pos, 1);
    else comensales[comensalIdx].platosAsignados.push(platoId);
    guardarDatos();
    renderizarTodo();
}

function renderizarTodo() {
    // Chips
    document.getElementById('listaComensales').innerHTML = comensales.map((c, i) => `
        <div class="comensal-chip" style="background:#008080; color:white; padding:8px; border-radius:20px; display:inline-block; margin:5px;">
            ${c.nombre.charAt(0).toUpperCase() + c.nombre.slice(1).toLowerCase()} <span onclick="eliminarComensal(${i})" style="cursor:pointer; margin-left:8px;">×</span>
        </div>
    `).join('');

    // Tabla
    document.getElementById('tablaPlatosBody').innerHTML = platos.map((p, i) => `
        <tr>
            <td>${p.nombre}</td>
            <td>${p.precio.toFixed(2)}€</td>
            <td>${p.cantidad}</td>
            <td>${(p.precio * p.cantidad).toFixed(2)}€</td>
            <td>
                <button onclick="prepararEdicion(${p.id})" style="background:#ffc107; padding:4px;">Edit</button>
                <button onclick="eliminarPlato(${i})" style="background:#ff5555; padding:4px;">X</button>
            </td>
        </tr>
    `).join('');

    // Distribución
    document.getElementById('distribucion').innerHTML = platos.map(p => `
        <div class="distribucion-item">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <strong style="color:white; text-transform:capitalize;">${p.nombre}</strong>
                <div>
                    <button onclick="seleccionarTodos(${p.id})" style="background:#28a745; padding:4px 8px; font-size:10px;">TODOS</button>
                    <button onclick="desmarcarTodos(${p.id})" style="background:#666; padding:4px 8px; font-size:10px;">NADIE</button>
                </div>
            </div>
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:5px; margin-top:10px;">
                ${comensales.map((c, i) => `
                    <label style="font-size:13px;"><input type="checkbox" ${c.platosAsignados.includes(p.id)?'checked':''} onchange="toggleAsignacion(${i},${p.id})"> ${c.nombre.charAt(0).toUpperCase() + c.nombre.slice(1).toLowerCase()}</label>
                `).join('')}
            </div>
        </div>
    `).join('');

    actualizarResumenFinal();
}

function actualizarResumenFinal() {
    const contenedor = document.getElementById('totalesFinales');
    let totalCuenta = platos.reduce((acc, p) => acc + (p.precio * p.cantidad), 0);

    let resumen = comensales.map(c => {
        let total = 0;
        let detalles = [];
        platos.forEach(p => {
            const num = comensales.filter(com => com.platosAsignados.includes(p.id)).length;
            if (c.platosAsignados.includes(p.id) && num > 0) {
                let parte = (p.precio * p.cantidad) / num;
                total += parte;
                detalles.push(`${p.nombre} (${parte.toFixed(2)}€)`);
            }
        });
        return { 
            nombre: c.nombre.charAt(0).toUpperCase() + c.nombre.slice(1).toLowerCase(), 
            total: total, 
            detalles: detalles 
        };
    });

    // --- LÓGICA DE ORDENAMIENTO ACTUALIZADA ---
    resumen.sort((a, b) => {
        // Primero por gasto (Mayor a Menor)
        if (b.total !== a.total) {
            return b.total - a.total;
        }
        // Si hay empate, por nombre (Orden Alfabético A-Z)
        return a.nombre.localeCompare(b.nombre);
    });

    let html = "<h3>Resumen de Gastos:</h3>";
    resumen.forEach(item => {
        html += `
            <div class="comensal-card">
                <span class="total-badge">${item.total.toFixed(2)}€</span>
                <strong>${item.nombre}</strong>
                <p style="font-size:12px; color:#aaa; margin-top:5px; border-top:1px dashed #555;">${item.detalles.join(' + ') || 'Nada'}</p>
            </div>`;
    });

    html += `
        <div style="background:#008080; padding:15px; border-radius:10px; text-align:center; margin-top:20px; border: 2px solid #00f2ff;">
            <div style="font-size:14px;">TOTAL CUENTA</div>
            <div style="font-size:28px; font-weight:bold;">${totalCuenta.toFixed(2)}€</div>
        </div>`;
    
    contenedor.innerHTML = html;
}

function descargarImagenResumen() {
    const area = document.getElementById('areaCaptura');
    html2canvas(area, { backgroundColor: '#272822', scale: 2 }).then(canvas => {
        const link = document.createElement('a');
        link.download = `Cuenta-${new Date().toLocaleDateString()}.png`;
        link.href = canvas.toDataURL();
        link.click();
    });
}

function eliminarComensal(i) { comensales.splice(i, 1); guardarDatos(); renderizarTodo(); }
function eliminarPlato(i) { platos.splice(i, 1); guardarDatos(); renderizarTodo(); }
function limpiarTodo() { if(confirm("¿Borrar todo?")) { localStorage.clear(); location.reload(); } }

window.onload = renderizarTodo;