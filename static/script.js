document.getElementById('setupInputs').addEventListener('click', setupInputs);
document.getElementById('calculate').addEventListener('click', calculate);

function setupInputs() {
    const numOrigen = parseInt(document.getElementById('numOrigen').value);
    const numDestino = parseInt(document.getElementById('numDestino').value);

    if (!numOrigen || !numDestino) {
        alert('Por favor ingresa números válidos para los nodos.');
        return;
    }

    const inputTables = document.getElementById('inputTables');
    inputTables.innerHTML = '';

    // Crear tabla de costos con ofertas y demandas
    const costTable = document.createElement('table');
    costTable.innerHTML = `
        <thead>
            <tr>
                <th>Origen/Destino</th>
                ${Array.from({ length: numDestino }, (_, j) => `<th>Destino ${j + 1}</th>`).join('')}
                <th>Oferta</th>
            </tr>
        </thead>
        <tbody>
            ${Array.from({ length: numOrigen }, (_, i) => `
                <tr>
                    <td>Origen ${i + 1}</td>
                    ${Array.from({ length: numDestino }, () => `<td><input type="number" min="0"></td>`).join('')}
                    <td><input type="number" min="0" class="offer"></td>
                </tr>`).join('')}
            <tr>
                <th>Demanda</th>
                ${Array.from({ length: numDestino }, () => `<td><input type="number" min="0" class="demand"></td>`).join('')}
                <td></td>
            </tr>
        </tbody>`;
    inputTables.appendChild(costTable);

    // Mostrar inputs dinámicos
    document.getElementById('dynamicInputs').style.display = 'block';
}

function calculate() {
    const objective = document.getElementById('objective').value;
    const offers = Array.from(document.querySelectorAll('.offer')).map(input => parseInt(input.value));
    const demands = Array.from(document.querySelectorAll('.demand')).map(input => parseInt(input.value));
    const costs = Array.from(document.querySelectorAll('tbody tr'))
        .slice(0, offers.length)
        .map(row => Array.from(row.querySelectorAll('td input'))
            .slice(0, demands.length)
            .map(input => parseInt(input.value))
        );

    if (offers.includes(NaN) || demands.includes(NaN) || costs.some(row => row.includes(NaN))) {
        alert('Por favor complete todos los campos correctamente.');
        return;
    }

    fetch('/solve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ objective, offers, demands, costs })
    })
    .then(response => response.json())
    .then(data => displayResults(data.totalCost, data.allocation))
    .catch(error => console.error('Error:', error));
}

function displayResults(totalCost, allocation) {
    const results = document.getElementById('results');
    const output = document.getElementById('output');
    results.style.display = 'block';

    let tableHTML = '<table><thead><tr><th>Origen/Destino</th>';
    allocation[0].forEach((_, j) => tableHTML += `<th>Destino ${j + 1}</th>`);
    tableHTML += '</tr></thead><tbody>';
    allocation.forEach((row, i) => {
        tableHTML += `<tr><td>Origen ${i + 1}</td>`;
        row.forEach(value => tableHTML += `<td>${value}</td>`);
        tableHTML += '</tr>';
    });
    tableHTML += '</tbody></table>';
    output.innerHTML = `<p>Costo total: ${totalCost}</p>${tableHTML}`;
}
