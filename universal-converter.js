// 全能转换器 - 修复版
class UniversalConverter {
    constructor() {
        this.exchangeRates = {};
        this.currencies = ['USD', 'EUR', 'GBP', 'JPY', 'KRW'];
        this.lengthUnits = ['cm', 'm', 'mm', 'km', 'inch'];
        this.volumeUnits = ['mL', 'L', 'm3', 'gal'];
        this.weightUnits = ['g', 'kg', 'mg', 'lb', 'oz'];
        this.amountHistory = [];
        this.init();
    }

    async init() {
        this.renderUnitLists();
        this.setupEventListeners();
        await this.fetchExchangeRates();
        this.updateRateStatus();
    }

    async fetchExchangeRates() {
        try {
            const response = await fetch('https://api.exchangerate.host/latest?base=CNY');
            if (response.ok) {
                const data = await response.json();
                this.exchangeRates = data.rates;
                this.rateStatus = 'success';
            } else {
                throw new Error('API响应无效');
            }
        } catch (error) {
            this.exchangeRates = { CNY: 1, USD: 0.14, EUR: 0.13, GBP: 0.11, JPY: 20.0, KRW: 180.0 };
            this.rateStatus = 'error';
        }
    }

    renderUnitLists() {
        // 货币 - 使用中文显示
        const currencyNames = { USD: '美元', EUR: '欧元', GBP: '英镑', JPY: '日元', KRW: '韩元' };
        const currencyContainer = document.getElementById('currency-results');
        currencyContainer.innerHTML = this.currencies.map(c => `
            <div class="result-item" id="currency-${c}">
                <span class="result-unit">${currencyNames[c]}</span>
                <span class="result-value">0</span>
            </div>
        `).join('');

        // 长度
        const lengthNames = { cm: '厘米', m: '米', mm: '毫米', km: '千米', inch: '英寸' };
        document.getElementById('length-results').innerHTML = this.lengthUnits.map(u => `
            <div class="result-item" id="length-${u}">
                <span class="result-unit">${lengthNames[u]}</span>
                <span class="result-value">0</span>
            </div>
        `).join('');

        // 体积
        const volumeNames = { mL: '毫升', L: '升', m3: '立方米', gal: '加仑' };
        document.getElementById('volume-results').innerHTML = this.volumeUnits.map(u => `
            <div class="result-item" id="volume-${u}">
                <span class="result-unit">${volumeNames[u]}</span>
                <span class="result-value">0</span>
            </div>
        `).join('');

        // 质量
        const weightNames = { g: '克', kg: '千克', mg: '毫克', lb: '磅', oz: '盎司' };
        document.getElementById('weight-results').innerHTML = this.weightUnits.map(u => `
            <div class="result-item" id="weight-${u}">
                <span class="result-unit">${weightNames[u]}</span>
                <span class="result-value">0</span>
            </div>
        `).join('');
    }

    updateRateStatus() {
        const statusElement = document.getElementById('currency-status');
        if (this.rateStatus === 'success') {
            statusElement.textContent = '✅ 实时汇率';
            statusElement.className = 'rate-status';
        } else {
            statusElement.textContent = '⚠️ 默认汇率';
            statusElement.className = 'rate-status error';
        }
    }

    setupEventListeners() {
        document.getElementById('main-input').addEventListener('input', () => this.handleInput());
        document.getElementById('currency-to').addEventListener('change', () => this.convertCurrency());
        document.getElementById('length-to').addEventListener('change', () => this.convertLength());
        document.getElementById('volume-to').addEventListener('change', () => this.convertVolume());
        document.getElementById('weight-to').addEventListener('change', () => this.convertWeight());
    }

    handleInput() {
        const value = document.getElementById('main-input').value.trim();
        if (value === '') {
            this.clearAllResults();
            return;
        }

        const numValue = parseFloat(value);
        if (isNaN(numValue)) {
            document.getElementById('amount-result').querySelector('.result-value').textContent = '无效金额';
            return;
        }

        // 金额转大写
        const amountResult = this.convertAmountToChinese(value);
        document.getElementById('amount-result').querySelector('.result-value').textContent = amountResult;

        // 其他转换
        this.convertAll(numValue);
    }

    convertAll(value) {
        this.convertCurrency(value);
        this.convertLength(value);
        this.convertVolume(value);
        this.convertWeight(value);
    }

    convertCurrency(value) {
        const toCurrency = document.getElementById('currency-to').value;
        const rate = this.exchangeRates[toCurrency] || 1;
        const result = value * rate;
        const currencyNames = { USD: '美元', EUR: '欧元', GBP: '英镑', JPY: '日元', KRW: '韩元' };
        document.getElementById(`currency-${toCurrency}`).querySelector('.result-value').textContent = result.toFixed(4);
        document.getElementById(`currency-${toCurrency}`).querySelector('.result-unit').textContent = currencyNames[toCurrency];
    }

    convertLength(value) {
        const toUnit = document.getElementById('length-to').value;
        const result = this.fromMeters(value, toUnit);
        document.getElementById(`length-${toUnit}`).querySelector('.result-value').textContent = result.toFixed(4);
    }

    convertVolume(value) {
        const toUnit = document.getElementById('volume-to').value;
        const result = this.fromLiters(value, toUnit);
        document.getElementById(`volume-${toUnit}`).querySelector('.result-value').textContent = result.toFixed(4);
    }

    convertWeight(value) {
        const toUnit = document.getElementById('weight-to').value;
        const result = this.fromKilograms(value, toUnit);
        document.getElementById(`weight-${toUnit}`).querySelector('.result-value').textContent = result.toFixed(4);
    }

    convertAmountToChinese(amount) {
        if (!amount) return '';
        
        // 移除非数字字符，只保留数字和小数点
        const cleaned = amount.replace(/[^\d.]/g, '');
        if (!cleaned) return '';
        
        const [integerPart, decimalPart = ''] = cleaned.split('.');
        
        const numbers = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];
        const units = ['', '拾', '佰', '仟'];
        const bigUnits = ['', '万', '亿'];
        
        // 处理整数部分
        let result = '';
        let integerStr = integerPart.padStart(12, '0'); // 补齐到12位
        
        for (let i = 0; i < 4; i++) {
            const group = integerStr.substr(i * 3, 3);
            let groupResult = '';
            
            for (let j = 0; j < 3; j++) {
                const digit = parseInt(group[j]);
                if (digit !== 0) {
                    groupResult += numbers[digit] + units[2 - j];
                }
            }
            
            if (groupResult) {
                result += groupResult + bigUnits[3 - i];
            }
        }
        
        result = result.replace(/零+/g, '零').replace(/零$/, '');
        result = result || '零';
        result += '元';
        
        // 处理小数部分
        if (decimalPart) {
            if (decimalPart[0] !== '0') result += numbers[parseInt(decimalPart[0])] + '角';
            if (decimalPart[1] && decimalPart[1] !== '0') result += numbers[parseInt(decimalPart[1])] + '分';
        } else {
            result += '整';
        }
        
        return result.replace(/^零+/, '').replace(/零元/, '零').replace(/零$/, '');
    }

    clearAllResults() {
        document.getElementById('amount-result').querySelector('.result-value').textContent = '请输入金额';
        document.querySelectorAll('.result-value').forEach(el => el.textContent = '0');
    }
}

let converter;
document.addEventListener('DOMContentLoaded', () => { converter = new UniversalConverter(); });

function handleInput() { converter.handleInput(); }