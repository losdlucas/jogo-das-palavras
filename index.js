const setupContainer = document.getElementById('setup-container');
const gameContainer = document.getElementById('game-container');
const wordDisplay = document.getElementById('word-display');
const gameMessage = document.getElementById('game-message');
const errorCount = document.getElementById('error-count');
const resetBtn = document.getElementById('reset-btn');

const audioAcerto = document.getElementById('audio-acerto');
const audioErro = document.getElementById('audio-erro');

const URL_API = 'https://api-palavras-8ptt.onrender.com/'

const historyBox = document.getElementById('history');
let letrasTentadas = [];
let palavraCorreta = '';

function efeitoFundo(tipo) {
    document.body.classList.remove('acerto', 'erro');
    document.body.classList.add(tipo);

    setTimeout(() => {
        document.body.classList.remove(tipo);
    }, 500);
}

async function iniciarJogo(event) {
    if (event.key === 'Enter') {
        const nickname = document.getElementById('nickname-input').value

        if (!nickname) {
            alert('Preencha o nickname');
            return
        }

        const response = await fetch(`${URL_API}/iniciar`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nickname })
        });

        const data = await response.json();

        if (data.erro) {
            alert(data.erro);
            return
        }

        setupContainer.classList.add('hidden');
        gameContainer.classList.remove('hidden');
        document.getElementById('player-display').innerText = data.mensagem

        buscarPalavra()
    }
}

async function buscarPalavra() {
    const response = await fetch(`${URL_API}/status`, {
        credentials: 'include',
        method: 'GET'
    })

    const data = await response.json();

    const hint = document.getElementById('hint');
    hint.innerText = `Dica: ${data.dica}`;

    wordDisplay.innerHTML = ''

    for (let i = 0; i < data.qtde_caracteres; i++) {
        const span = document.createElement('span');
        span.className = 'letter-slot'
        span.id = `slot-${i}`
        wordDisplay.appendChild(span);
    }
}

async function tentarLetra(event) {
    if (event.key === 'Enter') {
        const input = document.getElementById('letter-input')
        const caractere = input.value.toUpperCase()
        input.value = ''
        input.focus()

        if (!caractere) return

        const response = await fetch(`${URL_API}/tentativa`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ caractere })
        })

        const data = await response.json()

        // HISTÓRICO DE TENTATIVAS
        const item = document.createElement('div');
        item.classList.add('history-item');

        if (data.posicoes && data.posicoes.length > 0) {
            item.classList.add('acerto');
            item.innerText = `✔ Letra "${caractere}" — Acerto`;
        } else {
            item.classList.add('erro');
            item.innerText = `✖ Letra "${caractere}" — Erro`;
        }

        historyBox.prepend(item);

        if (data.posicoes.length > 0) {
            audioAcerto.play();
            efeitoFundo('acerto');

            data.posicoes.forEach(pos => {
                const slot = document.getElementById(`slot-${pos}`)
                slot.innerText = caractere
                slot.classList.add('reveal')
                setTimeout(() => slot.classList.remove('reveal'), 300)
            })
        } else {
            audioErro.play();
            efeitoFundo('erro');
        }

        errorCount.innerText = data.erros_atuais
        gameMessage.innerText = data.mensagem

       if (data.status_jogo !== 'Jogando') {
        resetBtn.classList.remove('hidden');
    
        // 👉 AQUI salva a palavra correta vinda da API
        if (data.palavra) {
            palavraCorreta = data.palavra;
        }
    
        if (data.status_jogo === 'Derrota') {
            gameMessage.style.color = '#ff4d4d';
            gameMessage.innerText = `${data.mensagem} | A palavra era: ${palavraCorreta}`;
        } else {
            gameMessage.style.color = '#00ff88';
            gameMessage.innerText = data.mensagem;
        }
}
        }
    }
}

function reiniciarJogo() {
    location.reload();
}
