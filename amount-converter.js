// 人民币金额转大写工具 - 全新逻辑
class AmountConverter {
    constructor() {
        this.amountInput = document.getElementById('amount-input');
        this.chineseOutput = document.getElementById('chinese-output');
        this.historyList = document.getElementById('history-list');
        this.history = [];
        this.lastRecordedAmount = ''; // 上一次记录到历史的金额
        
        this.init();
    }

    init() {
        // 页面加载时清空历史记录
        localStorage.removeItem('amountHistory');
        this.renderHistory();
        
        this.setupEventListeners();
        this.amountInput.focus();
        
        // 页面卸载时清空历史记录
        window.addEventListener('beforeunload', () => {
            localStorage.removeItem('amountHistory');
        });
    }

    // 金额转大写核心函数
    convertAmountToChinese(amount) {
        if (!amount || amount.trim() === '') return '';
        
        const cleanedAmount = amount.replace(/[^\d.]/g, '');
        
        if ((cleanedAmount.match(/\./g) || []).length > 1) {
            return '错误：金额格式不正确';
        }
        
        let [integerPart, decimalPart = ''] = cleanedAmount.split('.');
        
        if (integerPart === '') integerPart = '0';
        
        try {
            const integerNum = BigInt(integerPart);
            if (integerNum >= 1000000000000n) {
                return '错误：金额超出范围（最大支持万亿）';
            }
        } catch (e) {
            return '错误：金额过大无法处理';
        }

        const chineseNumbers = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];
        const chineseUnits = ['', '拾', '佰', '仟'];
        const chineseBigUnits = ['', '万', '亿', '兆'];

        const convertInteger = (numStr) => {
            if (numStr === '0') return '零';
            
            let result = '';
            const len = numStr.length;
            
            for (let i = 0; i < len; i += 4) {
                const start = Math.max(0, len - i - 4);
                const end = len - i;
                const group = numStr.slice(start, end);
                
                let groupResult = '';
                for (let j = 0; j < group.length; j++) {
                    const digit = parseInt(group[j]);
                    const position = group.length - j - 1;
                    
                    if (digit !== 0) {
                        groupResult += chineseNumbers[digit] + chineseUnits[position];
                    } else if (j > 0 && group[j-1] !== '0' && !groupResult.endsWith('零')) {
                        groupResult += '零';
                    }
                }
                
                if (groupResult.endsWith('零')) {
                    groupResult = groupResult.slice(0, -1);
                }
                
                if (groupResult) {
                    result = groupResult + chineseBigUnits[i/4] + result;
                }
            }
            
            return result || '零';
        };

        const convertDecimal = (decimalStr) => {
            if (!decimalStr) return '';
            
            let result = '';
            const limitedDecimal = decimalStr.slice(0, 2);
            
            if (limitedDecimal[0] && limitedDecimal[0] !== '0') {
                result += chineseNumbers[parseInt(limitedDecimal[0])] + '角';
            }
            
            if (limitedDecimal[1] && limitedDecimal[1] !== '0') {
                result += chineseNumbers[parseInt(limitedDecimal[1])] + '分';
            }
            
            return result;
        };

        let chineseInteger = convertInteger(integerPart);
        let chineseDecimal = convertDecimal(decimalPart);

        if (chineseInteger === '零' && chineseDecimal) {
            return chineseDecimal;
        }

        let result = chineseInteger + '元';
        
        if (chineseDecimal) {
            result += chineseDecimal;
        } else {
            result += '整';
        }

        return result.replace(/零+/g, '零')
                   .replace(/零元/g, '元')
                   .replace(/零角/g, '')
                   .replace(/零分/g, '');
    }

    // 判断是否为有效数值
    isValidNumber(amount) {
        if (!amount || amount.trim() === '') return false;
        
        const cleaned = amount.replace(/[^\d.]/g, '');
        
        if (!cleaned) return false;
        
        // 不能是空的或全是0
        const numericPart = cleaned.split('.')[0];
        if (numericPart === '' && cleaned.includes('.')) return false;
        
        // 不能有多个小数点
        if ((cleaned.match(/\./g) || []).length > 1) return false;
        
        // 不能全是0
        if (/^0+$/.test(numericPart) && !cleaned.includes('.')) return false;
        
        return true;
    }

    // 渲染历史记录
    renderHistory() {
        if (this.history.length === 0) {
            this.historyList.innerHTML = '<li class="empty-history">暂无历史记录</li>';
            return;
        }

        this.historyList.innerHTML = this.history.map(item => `
            <li>
                <span class="history-amount">${item.amount}</span>
                <span class="history-result">${item.result}</span>
                <span class="history-time">${item.time}</span>
            </li>
        `).join('');
    }

    // 添加历史记录
    addToHistory(amount, result) {
        if (!amount || !result || result.startsWith('错误')) return;
        
        // 检查是否与上一次记录的金额相同
        if (this.lastRecordedAmount === amount) return;
        
        const now = new Date();
        const timeStr = now.toLocaleTimeString();
        
        this.history.unshift({
            amount,
            result,
            time: timeStr
        });
        
        if (this.history.length > 10) {
            this.history = this.history.slice(0, 10);
        }
        
        this.lastRecordedAmount = amount;
        this.renderHistory();
    }

    // 设置事件监听器
    setupEventListeners() {
        // 键盘按下时限制输入
        this.amountInput.addEventListener('keydown', (e) => {
            this.restrictInput(e);
        });

        // 粘贴时清理非数字
        this.amountInput.addEventListener('paste', (e) => {
            this.handlePaste(e);
        });

        // 输入时实时处理
        this.amountInput.addEventListener('input', (e) => {
            this.handleInput(e.target.value);
        });

        // 失焦时记录历史
        this.amountInput.addEventListener('blur', () => {
            this.handleBlur();
        });

        // 聚焦时清空上一次记录
        this.amountInput.addEventListener('focus', () => {
            this.lastRecordedAmount = '';
        });
    }

    // 输入限制
    restrictInput(e) {
        const currentValue = this.amountInput.value;
        const selectionStart = this.amountInput.selectionStart;
        const selectionEnd = this.amountInput.selectionEnd;
        
        const isControlKey = [
            'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter', 'Home', 'End', 'Escape'
        ].includes(e.key);
        
        if (isControlKey) return;
        if (e.ctrlKey || e.metaKey) return;
        
        if (e.key === '.') {
            if (currentValue.includes('.')) {
                e.preventDefault();
            }
            return;
        }
        
        if (/^[0-9]$/.test(e.key)) return;
        
        e.preventDefault();
    }

    // 粘贴处理
    handlePaste(e) {
        e.preventDefault();
        const pasteData = e.clipboardData.getData('text');
        const cleaned = pasteData.replace(/[^\d.]/g, '');
        
        const start = this.amountInput.selectionStart;
        const end = this.amountInput.selectionEnd;
        this.amountInput.value = this.amountInput.value.substring(0, start) + 
                                cleaned + 
                                this.amountInput.value.substring(end);
        
        this.handleInput(this.amountInput.value);
    }

    // 处理输入
    handleInput(amount) {
        if (amount === '') {
            this.chineseOutput.value = '';
            this.amountInput.classList.remove('error');
            return;
        }

        const result = this.convertAmountToChinese(amount);
        this.chineseOutput.value = result;

        // 判断是否为有效数值
        if (this.isValidNumber(amount)) {
            this.amountInput.classList.remove('error');
        } else {
            this.amountInput.classList.add('error');
        }
    }

    // 失焦时处理
    handleBlur() {
        const amount = this.amountInput.value;
        
        if (amount && this.isValidNumber(amount)) {
            const result = this.chineseOutput.value;
            if (result && !result.startsWith('错误')) {
                this.addToHistory(amount, result);
            }
        }
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    new AmountConverter();
});