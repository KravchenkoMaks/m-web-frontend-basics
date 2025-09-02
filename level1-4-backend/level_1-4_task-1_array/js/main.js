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
    `<div style="
      display:inline-block;
      width:16px;
      height:16px;
      border:1px solid #000;
      background-color:${color};
    "></div> ${color}`;

const addHeaderColumn = (name, parent) => {
    const th = document.createElement('th');
    th.innerText = name;
    parent.appendChild(th);
}

const addRowData = (value, parent) => {
    const td = document.createElement('td');
    td.innerText = value;
    parent.appendChild(td);
}

function renderTable(config, data) {
    const tableBox = document.querySelector(config.parent);
    if (!tableBox) return;
    tableBox.innerHTML = "";

    const table = document.createElement("table");
    table.classList.add('datatable');

    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');

    addHeaderColumn('Id', headerRow);
    config.columns.forEach((col) => {
        const th = document.createElement('th');
        th.innerText = col.title;
        headerRow.appendChild(th);
    })
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody')

    data.forEach(entity => {
        const tr = document.createElement('tr');
        addRowData(entity.id, tr);

        config.columns.forEach((col) => {
            const td = document.createElement('td');
            if (typeof col.value === "function") {
                td.innerHTML = col.value(entity);
            } else {
                td.innerText = entity[col.value];
            }
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    })

    table.appendChild(tbody);
    tableBox.appendChild(table);
}

function convertToArray(obj) {
    return Object.entries(obj).map(([key, value]) => ({
        id: Number(key),
        ...value
    }));
}

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
        {title: 'Ім’я', value: 'name'},
        {title: 'Прізвище', value: 'surname'},
        {title: 'Вік', value: (user) => getAge(user.birthday)},
        {title: 'Фото', value: (user) => `<img src="${user.avatar}" alt="${user.name} ${user.surname}"/>`}
    ],
    apiUrl: "https://mock-api.shpp.me/mkravchenko/users"
};

DataTable(config1);


const config2 = {
    parent: '#productsTable',
    columns: [
        {title: 'Назва', value: 'title'},
        {title: 'Ціна', value: (product) => `${product.price} ${product.currency}`},
        {title: 'Колір', value: (product) => getColorLabel(product.color)},
    ],
    apiUrl: "https://mock-api.shpp.me/mkravchenko/products"
};

DataTable(config2);



