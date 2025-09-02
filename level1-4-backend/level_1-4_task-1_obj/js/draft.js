async function getData(url) {
    try {
        const response = await fetch(url);
        const data = await response.json();
        const users = data.data;

        console.log(users);

    }catch(err) {
        console.log("Помилка:",err);
    }
}

getData('https://mock-api.shpp.me/mkravchenko/users')

fetch('https://mock-api.shpp.me/mkravchenko/users')
    .then(res => res.json())
    .then(res => Object.entries(res.data))
    .then(keys => console.log(keys))
    .catch(err => console.error("Помилка:", err));

const getUser = async (url) =>
    await fetch(url).then(res => res.json());

getUser('https://mock-api.shpp.me/mkravchenko/users')
    .then(res => Object.keys(res.data))
    .then(keys => console.log(keys))
    .catch(err => console.error("Помилка:", err));

fetch('https://mock-api.shpp.me/mkravchenko/users')
    .then(res => res.json())
    .then(res => res.data)
    // .then(entity => console.log(JSON.stringify(entity, null, 2)))
    .then(entity => console.table(entity))
    .catch(err => console.error("Помилка:", err));