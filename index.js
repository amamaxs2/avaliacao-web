document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('pesquisa');
    form.addEventListener('submit', function (event) {
        event.preventDefault(); // Evita o comportamento padrão de submissão do formulário
        getFilter();
    });

    getFilter();
});

function getFilter() {
    var form = document.getElementById('filtroForm');
    var tipo = document.getElementById('tipo');
    var qtde = document.getElementById('quantidade');
    var dtIni = document.getElementById('dtIni');
    var dtFim = document.getElementById('dtFim');
    var busca = document.getElementById('busca');

    const url = new URL(window.location);
    url.searchParams.set("qtd", qtde.value);
    url.searchParams.set("tipo", tipo.value);
    url.searchParams.set("de", dtIni.value);
    url.searchParams.set("ate", dtFim.value);
    url.searchParams.set("busca", busca.value);
    window.history.pushState({}, "", url);

    getNewsData();
    fechaTelaDeFiltro();
}

async function getNewsData() {
    try {
        if (!location.search) {
            return;
        }

        const main = document.querySelector('main');
        const header = document.querySelector('#qtdeFiltro')
        const ul = document.createElement('ul');
        const urlSearchParams = new URLSearchParams(location.search);
        const qtd = urlSearchParams.get("qtd");
        const tipo = urlSearchParams.get("tipo");
        const de = urlSearchParams.get("de");
        const ate = urlSearchParams.get("ate");
        const busca = urlSearchParams.get("busca");
        const page = urlSearchParams.get("page");
        let qtdeFiltro = 1;

        let url = `https://servicodados.ibge.gov.br/api/v3/noticias/?qtd=${qtd}`;

        if (tipo) {
            url += `&tipo=${tipo}`;
            qtdeFiltro++;
        }
        if (de) {
            url += `&de=${de}`;
            qtdeFiltro++;
        }
        if (ate) {
            url += `&ate=${ate}`;
            qtdeFiltro++;
        }
        if (busca) {
            url += `&busca=${busca}`;
        }
        if (page) {
            url += `&page=${page}`;
        }

        const existingPs = header.querySelectorAll('.num-filtro');
        existingPs.forEach(p => p.remove());

        const p = document.createElement('p');
        p.textContent = qtdeFiltro;
        p.className = "num-filtro";
        header.append(p);
        main.innerHTML = '';

        const data = await fetch(url);
        const jsonData = await data.json();

        for (let cont = 0; cont < qtd; cont++) {
            const urlImg = `https://agenciadenoticias.ibge.gov.br/` + JSON.parse(jsonData.items[cont].imagens).image_intro;
            const img = document.createElement('img');
            img.src = urlImg;
            img.alt = `Imagem da noticia de ${jsonData.items[cont].titulo}`;

            const li = document.createElement('li');
            const button = document.createElement('button');
            const p = document.createElement('p');

            let dataAtual = new Date();

            const dataPostagemArray = jsonData.items[cont].data_publicacao.split('T');
            const dataPostagemStr = dataPostagemArray[0];

            const dataPostagem = new Date(dataPostagemStr);

            const diferencaMilissegundos = dataAtual - dataPostagem;

            const umDiaEmMilissegundos = 24 * 60 * 60 * 1000;
            const diferencaDias = Math.floor(diferencaMilissegundos / umDiaEmMilissegundos);

            let publicado = '';
            if (diferencaDias === 0) {
                publicado = "hoje";
            } else if (diferencaDias === 1) {
                publicado = 'ontem';
            } else {
                publicado = "há " + diferencaDias + " dias";
            }

            p.textContent = publicado;
            li.appendChild(p);
            li.appendChild(button);
            document.body.appendChild(li);

            button.textContent = "Leia mais";
            button.addEventListener('click', () => {
                window.open(jsonData.items[cont].link);
            });
            li.className = "parent"
            li.appendChild(img);
            li.innerHTML = `
                <img class="div1" src="${urlImg}"/>
                <h2 class="div2">${jsonData.items[cont].titulo}</h2>
                <p class="div3">${jsonData.items[cont].introducao}</p>
                `;
            ul.appendChild(li);
            const div = document.createElement("div")
            div.className = "div4"
            const p1 = document.createElement("p")
            p1.textContent = `#${jsonData.items[cont].editorias}`
            const p2 = document.createElement("p")
            p2.textContent = `Publicado ${publicado}`
            const bt = document.createElement('button')
            bt.textContent = "Leia mais"
            bt.addEventListener("click", () => {
                window.open(jsonData.items[cont].link)
            })
            div.appendChild(p1)
            div.appendChild(p2)
            div.appendChild(bt)
            li.appendChild(div)
        }

        main.appendChild(ul);
        createPagination();
    } catch (error) {
        console.error(error);
    }
}

function createPagination() {
    const urlSearchParams = new URLSearchParams(location.search);
    const main = document.querySelector('main');
    const ul = document.createElement('ul');
    const pagina = parseInt(urlSearchParams.get("page")) || 1;

    let x = 11;

    if (pagina > 6) {
        x += pagina - 6;
    }

    for (let cont = x - 10; cont < x; cont++) {
        const li = document.createElement('li');
        ul.className = "pagination-btn"
        const button = document.createElement('button');

        if (pagina == cont) {
            button.className = "tela-presente";
        }

        button.textContent = `${cont}`;
        button.addEventListener('click', () => {
            const url = new URL(window.location);
            url.searchParams.set("page", cont);
            window.history.pushState({}, "", url);
            getNewsData();
        });
        li.appendChild(button);
        ul.appendChild(li);
    }
    main.appendChild(ul);
}

function abreTelaDeFiltro() {
    document.querySelector('#filtroDialog').showModal();
}

function fechaTelaDeFiltro() {
    document.querySelector('#filtroDialog').close();
}
