const form = document.getElementById('buscarQr');
const result = document.getElementById('resultadoQr');
const alertBox = document.getElementById('alerta');
const printButton = document.getElementById('imprimirQr');
const admin = SESSAO.role === 'ADMINISTRADOR';
form.hidden = !admin;
document.getElementById('qrDescricao').textContent = admin
    ? 'Encontre o projeto pela matrícula e prepare a identificação do estande.'
    : 'O QR Code já aponta para a página do seu projeto. Baixe a imagem ou imprima a placa.';

async function carregarQr() {
    limparAlerta(alertBox);
    result.hidden = true;
    printButton.disabled = true;
    const button = form.querySelector('button');
    button.disabled = true;
    try {
        const endpoint = admin
            ? `/api/v1/projetos/buscar-matricula?matricula=${encodeURIComponent(form.elements.matricula.value.trim())}`
            : '/api/v1/projetos/meu/qrcode';
        const { data } = await api(endpoint);
        document.querySelectorAll('[data-qr-tema]').forEach(el => el.textContent = data.tema);
        const images = [...document.querySelectorAll('[data-qr-imagem]')];
        await Promise.all(images.map(img => new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = () => reject(new Error('Não foi possível carregar a imagem do QR Code.'));
            img.src = data.qrCode;
        })));
        document.getElementById('baixarImagem').href = data.qrCode;
        document.getElementById('abrirProjeto').href = data.urlPublica;
        document.getElementById('enderecoQr').textContent = data.urlPublica;
        result.hidden = false;
        printButton.disabled = false;
    } catch (error) {
        mostrarAlerta(alertBox, 'error', error.message);
    } finally {
        button.disabled = false;
    }
}
form.addEventListener('submit', event => { event.preventDefault(); carregarQr(); });
printButton.addEventListener('click', () => window.print());
if (!admin && SESSAO.role === 'ALUNO') carregarQr();
