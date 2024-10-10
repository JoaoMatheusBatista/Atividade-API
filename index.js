const apiKey = '495d6c64b3bf29345e770b13c8bb5d73';
const baseUrl = 'https://data.fixer.io/api/latest?access_key=' + apiKey;
const MATRICULA = '427125';
const logApiUrl = 'https://www.piway.com.br/unoesc/api/logs/' + MATRICULA;
const fetchLogsUrl = 'https://www.piway.com.br/unoesc/api/logs/' + MATRICULA;
const deleteLogUrl = 'https://www.piway.com.br/unoesc/api/excluir/log';

async function getExchangeRates() {
    try {
        const response = await fetch(baseUrl);
        if (!response.ok) {
            throw new Error('Erro ao buscar taxas de câmbio');
        }
        const data = await response.json();
        return data.rates;
    } catch (error) {
        console.error(error);
    }
}

async function logRequest(message) {
    try {
        const response = await fetch(logApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message }),
        });
        if (!response.ok) {
            throw new Error('Erro ao registrar log');
        }
    } catch (error) {
        console.error('Erro no registro de log:', error);
    }
}

async function convertCurrency(amount, fromCurrency, toCurrency) {
    const rates = await getExchangeRates();
    if (!rates || !rates[fromCurrency] || !rates[toCurrency]) {
        console.error('Moeda não encontrada.');
        return null;
    }

    const amountInBaseCurrency = amount / rates[fromCurrency];
    const convertedAmount = amountInBaseCurrency * rates[toCurrency];
    await logRequest(`Conversão: ${amount} ${fromCurrency} para ${convertedAmount.toFixed(2)} ${toCurrency}`);
    return convertedAmount;
}

document.getElementById('convertBtn').addEventListener('click', async () => {
    const amount = parseFloat(document.getElementById('amount').value);
    const fromCurrency = document.getElementById('fromCurrency').value;
    const toCurrency = document.getElementById('toCurrency').value;

    if (isNaN(amount) || amount <= 0) {
        alert('Por favor, insira um valor válido.');
        return;
    }

    const result = await convertCurrency(amount, fromCurrency, toCurrency);
    if (result !== null) {
        document.getElementById('result').innerText = `${amount} ${fromCurrency} é igual a ${result.toFixed(2)} ${toCurrency}`;
    } else {
        document.getElementById('result').innerText = 'Erro na conversão.';
    }
});

async function listAvailableCurrencies() {
    const rates = await getExchangeRates();
    const currencyListElement = document.getElementById('currencyList');
    currencyListElement.innerHTML = ''; // Limpar conteúdo anterior

    if (!rates) {
        currencyListElement.innerHTML = '<div class="alert alert-danger">Não foi possível obter as taxas de câmbio.</div>';
        return;
    }

    await logRequest('Listagem de moedas disponíveis solicitada.');

    Object.keys(rates).forEach(currency => {
        const rateBlock = document.createElement('div');
        rateBlock.className = 'col-md-3 mb-3'; // Coluna de 3 colunas
        rateBlock.innerHTML = `
            <div class="card text-center">
                <div class="card-body">
                    <h5 class="card-title">${currency}</h5>
                    <p class="card-text">Taxa: ${rates[currency]}</p>
                </div>
            </div>
        `;
        currencyListElement.appendChild(rateBlock);
    });
}

document.getElementById('listCurrenciesBtn').addEventListener('click', async () => {
    await listAvailableCurrencies();
});

async function viewLogs() {
    try {
        const response = await fetch(fetchLogsUrl);
        if (!response.ok) {
            throw new Error('Erro ao buscar logs');
        }
        const logs = await response.json();
        const logListElement = document.getElementById('logList');
        logListElement.innerHTML = ''; // Limpar conteúdo anterior

        if (logs.length === 0) {
            logListElement.innerHTML = '<div class="alert alert-info">Nenhum log encontrado.</div>';
            return;
        }

        logs.forEach(log => {
            const logItem = document.createElement('div');
            logItem.className = 'alert alert-secondary';
            logItem.innerHTML = `
                idLog: ${log.idlog} <br>Horário: ${log.log} <br>API: ${log.api} <br>Método: ${log.metodo} <br>Resultado: ${log.resultado}
                <button class="btn btn-danger mt-2" onclick="deleteLog(${log.idlog})">Excluir</button>
            `;
            logListElement.appendChild(logItem);
        });
    } catch (error) {
        console.error('Erro ao visualizar logs:', error);
        document.getElementById('logList').innerHTML = '<div class="alert alert-danger">Erro ao buscar logs.</div>';
    }
}

async function deleteLog(idLog) {
    try {
        console.log(idLog);
        const response = await fetch(`${proxyUrl}/${deleteLogUrl}/${idLog}/aluno/${MATRICULA}`, {
            method: 'DELETE',
            
        });

        if (!response.ok) {
            throw new Error('Erro ao excluir o log');
        }

        const result = await response.json();
        if (result.message === "1 log foi excluído") {
            alert("Log excluído com sucesso");
            await viewLogs(); // Atualiza a lista de logs após exclusão
        } else {
            alert("Nenhum log foi excluído");
        }
    } catch (error) {
        console.error('Erro ao excluir o log:', error);
        alert("Erro ao excluir o log");
    }
}

document.getElementById('viewLogsBtn').addEventListener('click', async () => {
    await viewLogs();
});
