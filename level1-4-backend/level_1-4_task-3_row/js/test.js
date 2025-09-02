function DataTable(config, data) {
    const tableBox = document.querySelector(config.parent);
    tableBox.innerHTML = "";

    const table = document.createElement("table");
    table.classList.add("datatable");

    // ----- THEAD -----
    const thead = document.createElement("thead");
    const headRow = document.createElement("tr");

    config.columns.forEach(col => {
        const th = document.createElement("th");
        th.textContent = col.title;
        headRow.appendChild(th);
    });

    // додаємо колонку "Дії"
    const actionsTh = document.createElement("th");
    actionsTh.textContent = "Дії";
    headRow.appendChild(actionsTh);

    thead.appendChild(headRow);
    table.appendChild(thead);

    // ----- TBODY -----
    const tbody = document.createElement("tbody");
    data.forEach(row => renderRow(tbody, config, row));
    table.appendChild(tbody);

    tableBox.appendChild(table);
}

function renderRow(tbodyOrTr, config, rowData) {
    const tr = document.createElement("tr");

    config.columns.forEach(col => {
        const td = document.createElement("td");
        td.innerHTML = typeof col.value === "function" ? col.value(rowData) : rowData[col.value];
        tr.appendChild(td);
    });

    // колонка дій
    const actionsTd = document.createElement("td");

    const editBtn = document.createElement("button");
    editBtn.textContent = "✏️";
    editBtn.addEventListener("click", () => enableRowEdit(tr, config, rowData));

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "🗑️";
    deleteBtn.addEventListener("click", () => tryDelete(tr, config, rowData));

    actionsTd.append(editBtn, deleteBtn);
    tr.appendChild(actionsTd);

    if (tbodyOrTr.tagName === "TBODY") {
        tbodyOrTr.appendChild(tr);
    } else {
        tbodyOrTr.replaceWith(tr);
    }
}

function enableRowEdit(tr, config, rowData) {
    tr.classList.add("editing");

    const tds = tr.querySelectorAll("td");
    config.columns.forEach((col, i) => {
        if (!col.input) return;
        const td = tds[i];
        td.innerHTML = "";

        const input = document.createElement("input");
        input.type = col.input.type || "text";
        input.name = col.input.name || col.value;
        input.value = rowData[input.name] || rowData[col.value] || "";
        td.appendChild(input);
    });

    // дії при редагуванні
    const actionsTd = tds[tds.length - 1];
    actionsTd.innerHTML = "";

    const saveBtn = document.createElement("button");
    saveBtn.textContent = "💾";
    saveBtn.addEventListener("click", () => tryUpdate(tr, config, rowData));

    const cancelBtn = document.createElement("button");
    cancelBtn.textContent = "❌";
    cancelBtn.addEventListener("click", () => renderRow(tr, config, rowData));

    actionsTd.append(saveBtn, cancelBtn);
}

function tryUpdate(tr, config, rowData) {
    const inputs = tr.querySelectorAll("input");
    const newData = { ...rowData };

    inputs.forEach(inp => {
        let value = inp.value.trim();
        if (inp.type === "number") value = Number(value);
        newData[inp.name] = value;
    });

    fetch(`${config.apiUrl}/${rowData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newData)
    })
        .then(r => r.json())
        .then(updated => {
            renderRow(tr, config, updated);
        })
        .catch(err => console.error("Update error:", err));
}

function tryDelete(tr, config, rowData) {
    if (!confirm("Видалити цей рядок?")) return;

    fetch(`${config.apiUrl}/${rowData.id}`, { method: "DELETE" })
        .then(r => {
            if (r.ok) tr.remove();
            else console.error("Delete failed");
        })
        .catch(err => console.error("Delete error:", err));
}
