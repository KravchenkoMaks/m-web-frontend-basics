const getAge = (birthday) => {
    const birthDate = new Date(birthday);
    const now = new Date();

    let years = now.getFullYear() - birthDate.getFullYear();
    let months = now.getMonth() - birthDate.getMonth();
    let days = now.getDate() - birthDate.getDate();
    let hours = now.getHours() - birthDate.getHours();
    let minutes = now.getMinutes() - birthDate.getMinutes();
    let seconds = now.getSeconds() - birthDate.getSeconds();

    if (seconds < 0) {
        seconds += 60;
        minutes--;
    }
    if (minutes < 0) {
        minutes += 60;
        hours--;
    }
    if (hours < 0) {
        hours += 24;
        days--;
    }
    if (days < 0) {
        const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        days += prevMonth.getDate();
        months--;
    }
    if (months < 0) {
        months += 12;
        years--;
    }

    if (years > 0) return `${years} р`;
    if (months > 0) return `${months} м`;
    if (days > 0) return `${days} д`;
    if (hours > 0) return `${hours} г`;
    if (minutes > 0) return `${minutes} хв`;
    if (seconds > 0) return `${seconds} с`;

    return "0 с";
}
const getColorLabel = (color) =>
    `<div style="display:inline-block;width:16px;height:16px;border:1px solid #000;background-color:${color};"></div> ${color}`;

const addHeaderColumn = (name, parent) => {
    const th = document.createElement('th');
    th.innerText = name;
    th.style.textAlign = "center";
    parent.appendChild(th);
}

const addRowData = (tr, ...items) => {
    const td = document.createElement('td');
    td.style.textAlign = "center";
    items.forEach(item => {
        if (item instanceof HTMLElement) {
            td.appendChild(item);
            td.classList.add('action');
        } else {
            td.innerText = item;
        }
    });
    tr.appendChild(td);
}

// ---------- Кнопки ----------
const createAddButton = (config) => {
    const tableBox = document.querySelector(config.parent);
    if (!tableBox) return;

    let existingBtn = tableBox.querySelector(".add-btn");
    if (existingBtn) return;

    const btn = document.createElement('button');
    btn.innerText = 'Додати';
    btn.classList.add("add-btn");
    btn.style.marginBottom = "10px";
    btn.onclick = () => addInlineRow(config);
    tableBox.prepend(btn);
}

const createDeleteBtn = (itemId, cfg) => {
    const btn = document.createElement('button');
    btn.innerText = 'Видалити';
    btn.dataset.id = itemId;
    btn.classList = 'delete-btn';
    btn.onclick = () => deleteItem(itemId, cfg);
    return btn;
}

const createEditBtn = (tr, cfg, item) => {
    const btn = document.createElement('button');
    btn.innerText = 'Редагувати';
    btn.classList = 'update-btn';
    btn.onclick = () => enableRowEdit(tr, cfg, item);
    return btn;
}

// ---------- Дії ----------
const deleteItem = async (itemId, cfg) => {
    try {
        const resp = await fetch(`${cfg.apiUrl}/${itemId}`, {method: "DELETE"});
        if (!resp.ok) throw new Error(`Помилка видалення: ${resp.status}`);
        DataTable(cfg);
    } catch (err) {
        console.error("Delete error:", err);
    }
}

const addInlineRow = (config) => {
    const table = document.querySelector(config.parent + " table");
    if (!table) return;
    const tbody = table.querySelector("tbody");

    const oldRow = tbody.querySelector(".inline-add-row");
    if (oldRow) oldRow.remove();

    const tr = document.createElement("tr");
    tr.classList.add("inline-add-row");
    addRowData(tr, "-");

    config.columns.forEach(col => {
        const td = document.createElement("td");
        if (!col.input) {
            td.innerText = "";
        } else {
            const inputs = Array.isArray(col.input) ? col.input : [col.input];
            inputs.forEach(inputCfg => {
                let input;
                if (inputCfg.type === "select") {
                    input = document.createElement("select");
                    inputCfg.options.forEach(opt => {
                        const option = document.createElement("option");
                        option.value = opt;
                        option.innerText = opt;
                        input.appendChild(option);
                    });
                } else {
                    input = document.createElement("input");
                    input.type = inputCfg.type || "text";
                }

                input.name = inputCfg.name || (typeof col.value === "string" ? col.value : col.title);
                if (inputCfg.required !== false) input.dataset.required = "true";
                td.appendChild(input);

                input.addEventListener("keypress", e => {
                    if (e.key === "Enter") {
                        e.preventDefault();
                        saveInlineRow(tr, config);
                    }
                });
            });
        }
        tr.appendChild(td);
    });

    const saveBtn = document.createElement("button");
    saveBtn.innerText = "Зберегти";
    saveBtn.onclick = () => saveInlineRow(tr, config);

    const cancelBtn = document.createElement("button");
    cancelBtn.innerText = "Відмінити";
    cancelBtn.onclick = () => tr.remove();

    addRowData(tr, saveBtn, cancelBtn);

    tbody.prepend(tr);
}

function saveInlineRow(tr, config) {
    const inputs = tr.querySelectorAll("input, select");
    let valid = true;
    const data = {};

    inputs.forEach(inp => {
        let value = (inp.value || "").trim();
        if (inp.dataset.required === "true" && !value) {
            inp.classList.add("error");
            valid = false;
            return;
        } else {
            inp.classList.remove("error");
        }

        if (inp.type === "number" && value !== "") value = Number(value);
        if (inp.type === "date" && value !== "") value = new Date(value).toISOString();
        data[inp.name] = value;
    });

    if (!valid) {
        alert("Будь ласка, заповніть усі обов'язкові поля!");
        return;
    }

    fetch(config.apiUrl, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(data)
    })
        .then(res => {
            if (!res.ok) throw new Error("Помилка збереження");
            return res.json();
        })
        .then(() => {
            tr.remove();
            DataTable(config);
        })
        .catch(err => alert("Помилка збереження: " + err));
}

// ---------- Редагування ----------
const enableRowEdit = (tr, config, item) => {
    tr.classList.add("editing");
    const tds = tr.querySelectorAll("td");

    config.columns.forEach((col, i) => {
        if (!col.input) return;
        const td = tds[i + 1]; // +1 через Id стовпець
        td.innerHTML = "";

        const inputs = Array.isArray(col.input) ? col.input : [col.input];
        inputs.forEach(inputCfg => {
            let input;
            if (inputCfg.type === "select") {
                input = document.createElement("select");
                inputCfg.options.forEach(opt => {
                    const option = document.createElement("option");
                    option.value = opt;
                    option.innerText = opt;
                    if (item[inputCfg.name] === opt) option.selected = true;
                    input.appendChild(option);
                });
            } else {
                input = document.createElement("input");
                input.type = inputCfg.type || "text";
                input.name = inputCfg.name || col.value;
                input.value = item[input.name] || "";
            }
            if (inputCfg.required !== false) input.dataset.required = "true";
            td.appendChild(input);
        });
    });

    const actionsTd = tds[tds.length - 1];
    actionsTd.innerHTML = "";
    const saveBtn = document.createElement("button");
    saveBtn.textContent = "Зберегти";
    saveBtn.onclick = () => tryUpdate(tr, config, item);

    const cancelBtn = document.createElement("button");
    cancelBtn.textContent = "Скасувати";
    cancelBtn.onclick = () => {
        tr.innerHTML = "";
        renderRow(tr, config, item);
    };

    actionsTd.append(saveBtn, cancelBtn);
}

function tryUpdate(tr, config, item) {
    const inputs = tr.querySelectorAll("input, select");
    let valid = true;
    const newData = {...item};

    inputs.forEach(inp => {
        let value = (inp.value || "").trim();
        if (inp.dataset.required === "true" && !value) {
            inp.classList.add("error");
            valid = false;
            return;
        } else {
            inp.classList.remove("error");
        }

        if (inp.type === "number" && value !== "") value = Number(value);
        if (inp.type === "date" && value !== "") value = new Date(value).toISOString();
        newData[inp.name] = value;
    });

    if (!valid) {
        alert("Заповніть усі обов'язкові поля!");
        return;
    }

    fetch(`${config.apiUrl}/${item.id}`, {
        method: "PUT",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(newData)
    })
        .then(r => r.json())
        .then(updated => {
            tr.innerHTML = "";
            DataTable(config);
        })
        .catch(err => console.error("Update error:", err));
}

// ---------- Рендер рядка ----------
const renderRow = (tbodyOrTr, config, item) => {
    const isRow = tbodyOrTr.tagName === "TR";
    const tr = isRow ? tbodyOrTr : document.createElement("tr");

    tr.innerHTML = "";

    addRowData(tr, item.id);
    config.columns.forEach(col => {
        const td = document.createElement("td");
        if (typeof col.value === "function") td.innerHTML = col.value(item);
        else td.innerText = item[col.value];
        tr.appendChild(td);
    });

    addRowData(tr, createEditBtn(tr, config, item), createDeleteBtn(item.id, config));

    if (!isRow) tbodyOrTr.appendChild(tr);
}

// ---------- Рендер таблиці ----------
const renderTable = (config, data) => {
    const tableBox = document.querySelector(config.parent);
    if (!tableBox) {
        return;
    }

    let existingBtn = tableBox.querySelector(".add-btn");


    const oldTable = tableBox.querySelector("table");
    if (oldTable) {
        oldTable.remove();
    }

    const table = document.createElement("table");
    table.classList.add('datatable');
    table.id = config.parent.replace("#", "") + "Tbl";

    // ----- THEAD -----
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    addHeaderColumn('Id', headerRow);
    config.columns.forEach((col) => {
        addHeaderColumn(col.title, headerRow);
    })
    addHeaderColumn('Дії', headerRow);
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // ----- TBODY -----
    const tbody = document.createElement('tbody')
    data.forEach(item => renderRow(tbody, config, item));
    table.appendChild(tbody);
    tableBox.appendChild(table);

    if (!existingBtn) {
        createAddButton(config);
    }
}

const convertToArray = (obj) =>
    Object.entries(obj).map(([key, value]) => ({
        id: Number(key),
        ...value
    }));


const DataTable = (config) => {
    if (config.data) {
        renderTable(config, config.data);
    } else if (config.apiUrl) {
        fetch(config.apiUrl)
            .then(res => res.json())
            .then(json => convertToArray(json.data))
            .then(arr => renderTable(config, arr))
            .catch(err => console.error("Error loading data:", err));
    }
}

const config1 = {
    parent: '#usersTable',
    columns: [
        {
            title: 'Ім’я',
            value: 'name',
            input: {type: 'text'}
        },
        {
            title: 'Прізвище',
            value: 'surname',
            input: {type: 'text'}
        },
        {
            title: 'Вік',
            value: (user) => getAge(user.birthday),
            input: {type: 'date', name: 'birthday', label: 'Дата народження'}
        },
        {
            title: 'Фото',
            value: (user) => `<img src="${user.avatar}" alt="${user.name} ${user.surname}"/>`,
            input: {type: 'url', name: 'avatar', label: 'URL фото'}
        }
    ],
    apiUrl: "https://mock-api.shpp.me/mkravchenko/users"
};

DataTable(config1);


const config2 = {
    parent: '#productsTable',
    columns: [
        {
            title: 'Назва',
            value: 'title',
            input: {type: 'text'}
        },
        {
            title: 'Ціна',
            value: (product) => `${product.price} ${product.currency}`,
            input: [
                {type: 'number', name: 'price', label: 'Ціна'},
                {type: 'select', name: 'currency', label: 'Валюта', options: ['$', '€', '₴'], required: false}
            ]
        },
        {
            title: 'Колір',
            value: (product) => getColorLabel(product.color), // функцію getColorLabel вам потрібно створити
            input: {type: 'color', name: 'color'}
        },
    ],
    apiUrl: "https://mock-api.shpp.me/mkravchenko/products"
};

DataTable(config2);

