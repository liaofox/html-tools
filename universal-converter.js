// 全能转换器 - 修复版
class UniversalConverter {
    constructor() {
        this.exchangeRates = {};
        this.defaultRates = {
            CNY: 1,
            USD: 0.139,
            EUR: 0.128,
            GBP: 0.110,
            JPY: 20.5,
            KRW: 182.0
        };
        this.currencies = ['USD', 'EUR', 'GBP', 'JPY', 'KRW'];
        this.lengthUnits = ['cm', 'm', 'mm', 'km', 'inch'];
        this.volumeUnits = ['mL', 'L', 'm3', 'gal'];
        this.weightUnits = ['g', 'kg', 'mg', 'lb', 'oz'];
        this.amountHistory = [];
        this.lastInputValue = ''; // 初始化为空
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
            // 使用更可靠的汇率API
            const response = await fetch('https://open.er-api.com/v6/latest/CNY');
            if (response.ok) {
                const data = await response.json();
                if (data.result === 'success') {
                    this.exchangeRates = data.rates;
                    this.rateStatus = 'success';
                    this.defaultRates = {...data.rates}; // 存储为默认汇率
                    return;
                }
            }
            throw new Error('API响应无效');
        } catch (error) {
            // 使用合理的默认汇率作为备用
            this.defaultRates = {
                CNY: 1,
                USD: 0.139,    // 1 CNY = 0.139 USD
                EUR: 0.128,    // 1 CNY = 0.128 EUR
                GBP: 0.110,    // 1 CNY = 0.110 GBP
                JPY: 20.5,     // 1 CNY = 20.5 JPY
                KRW: 182.0     // 1 CNY = 182.0 KRW
            };
            this.exchangeRates = {...this.defaultRates};
            this.rateStatus = 'error';
        }
    }

    renderUnitLists() {
        // 货币 - 使用中文显示，包含人民币
        const currencyNames = { CNY: '人民币', USD: '美元', EUR: '欧元', GBP: '英镑', JPY: '日元', KRW: '韩元' };
        const allCurrencies = ['CNY', ...this.currencies];
        const currencyContainer = document.getElementById('currency-results');
        currencyContainer.innerHTML = allCurrencies.map(c => `
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
            statusElement.className = 'rate-status success';
            statusElement.style.background = '#e8f5e8';
            statusElement.style.color = '#27ae60';
        } else {
            statusElement.textContent = '⚠️ 默认汇率';
            statusElement.className = 'rate-status error';
            statusElement.style.background = '#ffe6e6';
            statusElement.style.color = '#e74c3c';
        }
    }

    setupEventListeners() {
        const mainInput = document.getElementById('main-input');
        mainInput.addEventListener('input', () => this.handleInput());
        mainInput.addEventListener('blur', () => {
            const inputStr = document.getElementById('main-input').value.trim();
            if (inputStr === '') return;
            
            // 检查是否为有效数字
            const isValidNumber = /^-?\d+(\.\d+)?$/.test(inputStr);
            if (!isValidNumber) return;
            
            const numValue = parseFloat(inputStr);
            if (isNaN(numValue)) return;
            
            // 金额转大写
            const amountResult = this.convertAmountToChinese(inputStr);
            
            // 当光标移出输入框时，将当前输入作为一次历史记录保存
            this.addToHistory(inputStr, amountResult);
            this.lastInputValue = inputStr;
        });
        
        document.getElementById('currency-to').addEventListener('change', () => this.handleInput());
        document.getElementById('length-to').addEventListener('change', () => this.handleInput());
        document.getElementById('volume-to').addEventListener('change', () => this.handleInput());
        document.getElementById('weight-to').addEventListener('change', () => this.handleInput());
    }

    handleInput() {
        const inputStr = document.getElementById('main-input').value.trim();
        const inputElement = document.getElementById('main-input');
        
        // 清除之前的错误样式
        inputElement.style.borderColor = '#e8e8e8';
        
        if (inputStr === '') {
            this.clearAllResults();
            // 完全清除输入时才记录历史
            if (this.lastInputValue !== '') {
                this.lastInputValue = '';
            }
            return;
        }

        // 检查是否为有效数字
        const isValidNumber = /^-?\d+(\.\d+)?$/.test(inputStr);
        if (!isValidNumber) {
            document.getElementById('amount-result').querySelector('.result-value').textContent = '输入格式错误';
            inputElement.style.borderColor = '#ff6b6b';
            this.clearAllResults();
            return;
        }

        // 更严格的数值解析
        const numValue = parseFloat(inputStr);
        if (isNaN(numValue)) {
            document.getElementById('amount-result').querySelector('.result-value').textContent = '无效输入';
            inputElement.style.borderColor = '#ff6b6b';
            this.clearAllResults();
            return;
        }

        // 金额转大写
        const amountResult = this.convertAmountToChinese(inputStr);
        document.getElementById('amount-result').querySelector('.result-value').textContent = amountResult;

        // 强制更新所有转换
        this.convertAll(numValue);
        
        // 更新当前输入值但不记录历史
        this.lastInputValue = inputStr;
    }

    convertAll(value) {
        if (isNaN(value)) return;
        this.convertCurrency(value);
        this.convertLength(value);
        this.convertVolume(value);
        this.convertWeight(value);
    }
    convertCurrency(value) {
        if (isNaN(value)) {
            this.currencies.forEach(currency => {
                const el = document.getElementById(`currency-${currency}`);
                if (el) el.querySelector('.result-value').textContent = '0';
            });
            return;
        }
        
        // 确保汇率存在，优先使用实时汇率，失败时使用默认汇率
        if (!this.exchangeRates || Object.keys(this.exchangeRates).length === 0) {
            this.exchangeRates = {...this.defaultRates};
        }
        
        const toCurrency = document.getElementById('currency-to').value;
        const currencyNames = {
            CNY: '人民币',
            USD: '美元',
            EUR: '欧元',
            GBP: '英镑',
            JPY: '日元',
            KRW: '韩元'
        };
        
        // 添加CNY到货币列表
        const allCurrencies = ['CNY', ...this.currencies];
        
        // 计算所有货币的转换结果
        allCurrencies.forEach(currency => {
            // 公式: (输入值 / 目标货币汇率) * 当前货币汇率
            const result = (value / this.exchangeRates[toCurrency]) * this.exchangeRates[currency];
            
            const element = document.getElementById(`currency-${currency}`);
            if (element) {
                element.querySelector('.result-value').textContent = result.toFixed(4);
                element.querySelector('.result-unit').textContent = currencyNames[currency];
            }
        });
    }

    convertLength(value) {
        if (isNaN(value)) {
            this.lengthUnits.forEach(unit => {
                const el = document.getElementById(`length-${unit}`);
                if (el) el.querySelector('.result-value').textContent = '0';
            });
            return;
        }
        
        const fromUnit = document.getElementById('length-to').value;
        const unitFactors = {
            cm: 0.01,      // 1厘米 = 0.01米
            m: 1,          // 1米 = 1米
            mm: 0.001,     // 1毫米 = 0.001米
            km: 1000,      // 1千米 = 1000米
            inch: 0.0254   // 1英寸 = 0.0254米
        };
        
        // 确保输入是有效数字
        const numericValue = parseFloat(value);
        if (isNaN(numericValue)) return;
        
        // 转换为基准单位(米)
        const valueInMeters = numericValue * unitFactors[fromUnit];
        
        // 转换为所有单位
        this.lengthUnits.forEach(unit => {
            const result = valueInMeters / unitFactors[unit];
            const el = document.getElementById(`length-${unit}`);
            if (el) {
                const displayValue = isNaN(result) ? '0' : result.toFixed(4);
                el.querySelector('.result-value').textContent = displayValue;
            }
        });
    }

    convertVolume(value) {
        if (isNaN(value)) {
            this.volumeUnits.forEach(unit => {
                const el = document.getElementById(`volume-${unit}`);
                if (el) el.querySelector('.result-value').textContent = '0';
            });
            return;
        }
        
        const fromUnit = document.getElementById('volume-to').value;
        const unitFactors = {
            mL: 0.001,     // 1毫升 = 0.001升
            L: 1,          // 1升 = 1升
            m3: 1000,      // 1立方米 = 1000升
            gal: 3.78541   // 1加仑 = 3.78541升
        };
        
        // 转换为基准单位(升)
        const valueInLiters = value * unitFactors[fromUnit];
        
        // 转换为所有单位
        this.volumeUnits.forEach(unit => {
            const result = valueInLiters / unitFactors[unit];
            const el = document.getElementById(`volume-${unit}`);
            if (el) el.querySelector('.result-value').textContent = result.toFixed(4);
        });
    }

    convertWeight(value) {
        if (isNaN(value)) {
            this.weightUnits.forEach(unit => {
                const el = document.getElementById(`weight-${unit}`);
                if (el) el.querySelector('.result-value').textContent = '0';
            });
            return;
        }
        
        const fromUnit = document.getElementById('weight-to').value;
        const unitFactors = {
            g: 0.001,      // 1克 = 0.001千克
            kg: 1,         // 1千克 = 1千克
            mg: 0.000001,  // 1毫克 = 0.000001千克
            lb: 0.453592,  // 1磅 = 0.453592千克
            oz: 0.0283495  // 1盎司 = 0.0283495千克
        };
        
        // 转换为基准单位(千克)
        const valueInKilograms = value * unitFactors[fromUnit];
        
        // 转换为所有单位
        this.weightUnits.forEach(unit => {
            const result = valueInKilograms / unitFactors[unit];
            const el = document.getElementById(`weight-${unit}`);
            if (el) el.querySelector('.result-value').textContent = result.toFixed(4);
        });
    }

    convertAmountToChinese(amount) {
        if (!amount) return '';
        
        // 移除非数字字符，只保留数字和小数点
        const cleaned = amount.replace(/[^\d.-]/g, '');
        if (!cleaned) return '';
        
        const [integerPart, decimalPart = ''] = cleaned.split('.');
        const decimalDigits = decimalPart.padEnd(2, '0').substr(0, 2);
        
        const cnNums = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];
        const cnIntRadice = ['', '拾', '佰', '仟'];
        const cnIntUnits = ['', '万', '亿', '兆'];
        const cnDecUnits = ['角', '分'];
        const cnInteger = '整';
        const cnIntLast = '元';
        
        // 处理整数部分
        let integerStr = integerPart.replace(/^0+/, '') || '0';
        let chineseStr = '';
        let zeroCount = 0;
        
        for (let i = 0; i < integerStr.length; i++) {
            const n = integerStr.substr(i, 1);
            const p = integerStr.length - i - 1;
            const q = Math.floor(p / 4);
            const m = p % 4;
            
            if (n === '0') {
                zeroCount++;
            } else {
                if (zeroCount > 0) {
                    chineseStr += cnNums[0];
                }
                zeroCount = 0;
                chineseStr += cnNums[parseInt(n)] + cnIntRadice[m];
            }
            
            if (m === 0 && zeroCount < 4) {
                chineseStr += cnIntUnits[q];
            }
        }
        
        chineseStr += cnIntLast;
        
        // 处理小数部分
        if (decimalDigits !== '00') {
            const decInt = parseInt(decimalDigits, 10);
            const jiao = Math.floor(decInt / 10);
            const fen = decInt % 10;
            
            if (jiao > 0) {
                chineseStr += cnNums[jiao] + cnDecUnits[0];
            }
            if (fen > 0) {
                chineseStr += cnNums[fen] + cnDecUnits[1];
            }
        } else {
            chineseStr += cnInteger;
        }
        
        // 处理特殊情况
        if (chineseStr.startsWith('壹拾')) {
            chineseStr = chineseStr.substring(1);
        }
        
        return chineseStr;
    }

    clearAllResults() {
        document.getElementById('amount-result').querySelector('.result-value').textContent = '请输入金额';
        document.querySelectorAll('.result-value').forEach(el => el.textContent = '0');
    }

    addToHistory(inputStr, chineseResult) {
        // 检查是否已存在相同的记录
        const isDuplicate = this.amountHistory.some(item => 
            item.input === inputStr && item.result === chineseResult
        );
        
        if (!isDuplicate) {
            // 添加新记录到顶部
            const newItem = {
                input: inputStr,
                result: chineseResult,
                timestamp: new Date().toLocaleTimeString('zh-CN')
            };
            this.amountHistory.unshift(newItem);
            
            // 限制历史记录数量为5条
            if (this.amountHistory.length > 5) {
                this.amountHistory.pop();
            }
            
            // 渲染历史记录到金额模块
            this.renderHistory();
        }
    }

    renderHistory() {
        const historyContainer = document.getElementById('amount-result');
        
        // 清空历史显示区域
        let historyElement = historyContainer.querySelector('.history-display');
        if (!historyElement) {
            historyElement = document.createElement('div');
            historyElement.className = 'history-display';
            historyContainer.appendChild(historyElement);
        }
        
        if (this.amountHistory.length === 0) {
            historyElement.innerHTML = '';
            return;
        }
        
        // 显示所有5条历史记录，左对齐，最新记录在上
        const historyHtml = this.amountHistory.map(item => `
            <div style="font-size: 12px; color: #666; margin-bottom: 3px; text-align: left; line-height: 1.3;">
                ${item.input} → ${item.result}
            </div>
        `).join('');
        
        historyElement.innerHTML = historyHtml;
    }

    clearHistory() {
        this.amountHistory = [];
        this.renderHistory();
    }
}

let converter;
// 确保DOM完全加载后初始化
document.addEventListener('DOMContentLoaded', () => { 
    converter = new UniversalConverter(); 
    // 初始化后强制更新一次显示
    document.getElementById('main-input').dispatchEvent(new Event('input'));
});

function handleInput() { converter.handleInput(); }

function restoreFromHistory(index) {
    if (converter && converter.amountHistory[index]) {
        const item = converter.amountHistory[index];
        document.getElementById('main-input').value = item.input;
        handleInput();
    }
}

function clearHistory() {
    if (converter) {
        converter.clearHistory();
    }
}