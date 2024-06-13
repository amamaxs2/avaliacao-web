document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('pesquisa');
    form.addEventListener('submit', function (event) {
        event.preventDefault(); // Evita o comportamento padrão de submissão do formulário
        getFilter();
    });

    getFilter();
    getNewsData();
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
}

async function getNewsData() {
    try {
        if (!location.search) {
            return;
        }

        const main = document.querySelector('main');
        const header = document.querySelector('header button')
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
        header.appendChild(p);
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

            const dataPostagemArray = jsonData.items[cont].data_publicacao.split(' ');
            const dataPostagemStr = dataPostagemArray[0];

            const [dia, mes, ano] = dataPostagemStr.split('/').map(Number);
            const dataPostagem = new Date(ano, mes - 1, dia);

            const diferencaMilissegundos = dataAtual - dataPostagem;

            const umDiaEmMilissegundos = 24 * 60 * 60 * 1000;
            const diferencaDias = Math.floor(diferencaMilissegundos / umDiaEmMilissegundos);

            let publicado = '';
            if (diferencaDias === 0) {
                publicado = "hoje";
            } else if (diferencaDias === 1) {
                publicado = 'ontem';
            } else {
                publicado = diferencaDias + " dias atras";
            }

            p.textContent = publicado;
            li.appendChild(p);
            li.appendChild(button);
            document.body.appendChild(li);

            button.textContent = "Leia mais";
            button.addEventListener('click', () => {
                window.open(jsonData.items[cont].link);
            });
            li.appendChild(img);
            li.innerHTML = `
                <img src="${urlImg}"/>
                <h2>${jsonData.items[cont].titulo}</h2>
                <p>${jsonData.items[cont].introducao}</p>
                <p>#${jsonData.items[cont].editorias}</p>
                <p>Publicado ${publicado}</p>
            `;
            ul.appendChild(li);
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
