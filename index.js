const pagina = 1;

function abreTelaDeFiltro() {

    document.querySelector('#filtroDialog').showModal()
}

function getFilter() {
    var form = document.getElementById('filtroForm');
    var tipo = document.getElementById('tipo');
    var qtde = document.getElementById('quantidade');
    var dtIni = document.getElementById('dtIni');
    var dtFim = document.getElementById('dtFim');

    const url = new URL(window.location);
    url.searchParams.set("qtd", qtde.value);
    url.searchParams.set("tipo", tipo.value);
    url.searchParams.set("de", dtIni.value);
    url.searchParams.set("ate", dtFim.value);
    window.history.pushState({}, "", url);

    getNewsData()
}

async function getNewsData() {
    try {
        if (!location.search) {
            return;
        }

        const main = document.querySelector('main')
        const ul = document.createElement('ul')
        const urlSearchParams = new URLSearchParams(location.search);
        const qtd = urlSearchParams.get("qtd");
        const tipo = urlSearchParams.get("tipo");
        const de = urlSearchParams.get("de");
        const ate = urlSearchParams.get("ate");
        const page = urlSearchParams.get("page");

        url = `https://servicodados.ibge.gov.br/api/v3/noticias/?qtd=${qtd}`

        if (tipo) {
            url += `&tipo=${tipo}`;
        }
        if (de) {
            url += `&de=${de}`;
        }
        if (ate) {
            url += `&ate=${ate}`;
        }

        if (page) {
            url += `&page=${page}`
        }

        main.innerHTML = ''

        const data = await fetch(url)
        const jsonData = await data.json()

        console.log(jsonData)
        for (let cont = 0; cont < qtd; cont++) {

            const urlImg = `https://agenciadenoticias.ibge.gov.br/` + JSON.parse(jsonData.items[cont].imagens).image_intro;
            const img = document.createElement('img')
            img.src = urlImg
            img.alt = `Imagem da noticia de ${jsonData.items[cont].titulo}`

            const li = document.createElement('li')
            const button = document.createElement('button')
            button.textContent = "Leia mais"
            button.addEventListener('click', () => {
                window.open(jsonData.items[cont].link)
            })
            li.appendChild(img)
            li.innerHTML = `
                <img src="${urlImg}"/>
                <h2>${jsonData.items[cont].titulo}</h2>
                <p>${jsonData.items[cont].introducao}</p>
                <p>#${jsonData.items[cont].editorias}</p>
                `
            ul.appendChild(li)
        }

        main.appendChild(ul)
        createPagination()
    } catch (error) {
        console.error(error)
    }
}

function createPagination() {
    const urlSearchParams = new URLSearchParams(location.search);
    const main = document.querySelector('main')
    const ul = document.createElement('ul')
    const pagina = parseInt(urlSearchParams.get("page"));
    
    let inicio = pagina - 5;
    if (inicio < 1) {
        inicio = 1;
    } 
    
    for (let cont = inicio; cont < pagina+6; cont++) {
        console.log(pagina)
        const li = document.createElement('li')
        const button = document.createElement('button')

        if ( pagina == cont ) {
            button.className = "tela-presente"
        }

        button.textContent = `${cont}`
        button.addEventListener('click', () => {
            const url = new URL(window.location);
            url.searchParams.set("page", cont);
            window.history.pushState({}, "", url);
            getNewsData()
        })
        li.appendChild(button)
        ul.appendChild(li)
    }
    main.appendChild(ul)
}

function fechaTelaDeFiltro() {
    document.querySelector('#filtroDialog').close()
}

document.addEventListener('DOMContentLoaded', function () {
    getNewsData()
    
})