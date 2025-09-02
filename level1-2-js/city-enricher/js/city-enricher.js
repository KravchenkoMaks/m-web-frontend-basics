const csv = `48.30,32.16,Кропивницький,200000,
44.38,34.33,Алушта,31440,
49.46,30.17,Біла Церква,200131,
49.54,28.49,Бердичів,87575,#некоммент

#
46.49,36.58,#Бердянськ,121692,
49.15,28.41,Вінниця,356665,
#45.40,34.29,Джанкой,43343,
    
# в цьому файлі три рядки-коментаря :)
48.28,34.47,Камянське,#255841,
48.31,#35.08,#Дніпро,#1065008,
48.03,37.47,Донецьк,1016194,
47.53,35.23,Запоріжжя,815256,
45.11,33.28,Євпаторія,105915,
48.56,24.53,Івано-Франківськ,218359,
48.43,26.45,Камянець-Подільський,99610,
#45.20,36.38,Керч,157007,
50.27,30.30,Київ,2611327,
49.07,33.35,Кременчук,234073,
47.54,33.33,Кривий ріг,668980,
48.36,39.22,Луганськ,463097,
50.49,25.26,Луцьк,208816,
49.53,24.16,Львів,732818,
47.07,37.40,Маріуполь,492176,
46.53,35.25,Мелітополь,160657,
46.58,32.12,Миколаїв,514136,
48.26,22.45,Мукачеве,82346,
47.37,34.30,Нікополь,136280,
46.29,30.44,Одеса,1029049,
49.37,34.37,Полтава,317998,
50.39,26.26,Рівне,248813,
49.33,23.23,Самбір,36556,
44.29,33.43,Севастополь,342 451,
48.40,22.30,Ужгород,117317,
50.05,30.03,Фастів,51976,
45.02,35.31,Феодосія,74669,
50.02,36.14,Харків,1470902,
46.40,32.42,Херсон,328360,
49.26,27.06,Хмельницький,253994,
48.11,23.40,Хуст,29080,
49.27,32.03,Черкаси,295414,
51.29,31.22,Чернігів,304994,
48.16,26.07,Чернівці,240621,
`
function createCityEnricher(csvData) {
  const cities = csvData
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length != 0 && !l.startsWith('#'))
    .map(line =>
      line
        .split(',')
        .slice(0, 4)
        .map(el => el.trim().replaceAll(/#/g, ''))
        .join(),
    )
    .map(el => el.split(','))
    .map((str, idx) => ({ x: str[0], y: str[1], name: str[2], population: str[3] }))
    .sort((c1, c2) => c2.population - c1.population)
    .slice(0, 10)
    .reduce((acc, city, idx) => ({ ...acc, [city.name]: { population: Number(city.population), rating: idx + 1 } }), {})

  let peopleWordForm = n => {
    const mod10 = n % 10
    const mod100 = n % 100
    if (mod10 === 1 && mod100 !== 11) return 'людина'
    if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)) return 'людини'
    return 'людей'
  }

  return text =>
    Object.entries(cities).reduce((enriched, [cityName, data]) => {
      const regex = new RegExp(`${cityName}`, 'g')
      return enriched.replace(
        regex,
        `${cityName} (${data.rating} місце в ТОП-10 найбільших міст України, населення ${
          data.population
        } ${peopleWordForm(data.population)})`,
      )
    }, text)
}

const enrichText = createCityEnricher(csv)

document.getElementById('btn').addEventListener('click', () => {
  const input = document.getElementById('input')
  document.getElementById('result').innerHTML = enrichText(input.value.trim())
  input.value=''
})


