// 金额转换器功能

document.addEventListener('DOMContentLoaded', function() {
    // 金额转大写功能
    const amountInput = document.getElementById('amount-input');
    const chineseOutput = document.getElementById('chinese-output');
    const clearAmountBtn = document.getElementById('clear-amount');
    const copyResultBtn = document.getElementById('copy-result');
    const clearHistoryBtn = document.getElementById('clear-history');
    const historyList = document.getElementById('history-list');
    const historyCount = document.getElementById('history-count');
    const inputStatus = document.getElementById('input-status');
    const outputStatus = document.getElementById('output-status');
    const charCount = document.getElementById('char-count');
    
    // 存储转换历史 - 使用sessionStorage，仅在本次浏览器会话中保存
    let conversionHistory = JSON.parse(sessionStorage.getItem('conversionHistory')) || [];
    let currentInputValue = '';
    let lastRecordedValue = '';
    let hasCurrentInput = false; // 标记是否有未完成的输入
    
    // 初始化显示历史记录
    updateHistoryDisplay();
    
    // 金额转大写函数
    function convertAmountToChinese(amount) {
        // 检查输入是否合法
        if (!amount || amount.trim() === '') {
            return '';
        }
        
        // 清理输入，只保留数字和小数点
        const cleanedAmount = amount.replace(/[^\d.]/g, '');
        
        // 检查是否包含多个小数点
        if ((cleanedAmount.match(/\./g) || []).length > 1) {
            return '错误：金额格式不正确';
        }
        
        // 分离整数和小数部分
        let [integerPart, decimalPart = ''] = cleanedAmount.split('.');
        
        // 处理整数部分
        if (integerPart === '') {
            integerPart = '0';
        }
        
        // 检查数值范围
        const integerNum = parseInt(integerPart);
        if (integerNum >= 1000000000000) {
            return '错误：金额超出范围（最大支持万亿）';
        }
        
        // 中文数字字符
        const chineseNumbers = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];
        const chineseUnits = ['', '拾', '佰', '仟'];
        const chineseBigUnits = ['', '万', '亿', '兆'];
        
        // 转换整数部分
        function convertInteger(numStr) {
            if (numStr === '0') return '零';
            
            let result = '';
            const len = numStr.length;
            
            // 分组处理（每4位一组）
            const groupCount = Math.ceil(len / 4);
            for (let i = 0; i < groupCount; i++) {
                const start = Math.max(0, len - (i + 1) * 4);
                const end = len - i * 4;
                const group = numStr.slice(start, end);
                
                let groupResult = '';
                for (let j = 0; j < group.length; j++) {
                    const digit = parseInt(group[j]);
                    const position = group.length - j - 1;
                    
                    if (digit !== 0) {
                        groupResult += chineseNumbers[digit] + chineseUnits[position];
                    } else if (j > 0 && group[j-1] !== '0' && groupResult.slice(-1) !== '零') {
                        groupResult += '零';
                    }
                }
                
                // 去除末尾的零
                if (groupResult.endsWith('零')) {
                    groupResult = groupResult.slice(0, -1);
                }
                
                if (groupResult !== '') {
                    result = groupResult + chineseBigUnits[i] + result;
                }
            }
            
            return result || '零';
        }
        
        // 转换小数部分
        function convertDecimal(decimalStr) {
            if (!decimalStr) return '';
            
            // 只取前两位（角和分）
            const limitedDecimal = decimalStr.slice(0, 2);
            let result = '';
            
            // 角
            if (limitedDecimal.length >= 1) {
                const jiao = parseInt(limitedDecimal[0]);
                if (jiao !== 0) {
                    result += chineseNumbers[jiao] + '角';
                } else if (limitedDecimal.length > 1 && parseInt(limitedDecimal[1]) !== 0) {
                    result += '零';
                }
            }
            
            // 分
            if (limitedDecimal.length >= 2) {
                const fen = parseInt(limitedDecimal[1]);
                if (fen !== 0) {
                    result += chineseNumbers[fen] + '分';
                }
            }
            
            return result;
        }
        
        // 生成最终结果
        let chineseInteger = convertInteger(integerPart);
        let chineseDecimal = convertDecimal(decimalPart);
        
        // 处理整数部分为零的情况
        if (chineseInteger === '零' && chineseDecimal) {
            return chineseDecimal;
        }
        
        // 组合结果
        let result = chineseInteger + '元';
        
        if (chineseDecimal) {
            result += chineseDecimal;
        } else {
            result += '整';
        }
        
        // 处理连续零的情况
        result = result.replace(/零零零/g, '零');
        result = result.replace(/零零/g, '零');
        result = result.replace(/零元/g, '元');
        result = result.replace(/零角/g, '');
        result = result.replace(/零分/g, '');
        
        return result;
    }
    
    // 检查是否需要记录
    function shouldRecordConversion(originalAmount, chineseAmount) {
        // 如果输入为空，不记录
        if (!originalAmount || originalAmount.trim() === '') {
            return false;
        }
        
        // 如果是错误转换，不记录
        if (chineseAmount.startsWith('错误')) {
            return false;
        }
        
        // 如果与最近一次记录相同，不重复记录
        if (conversionHistory.length > 0) {
            const lastRecord = conversionHistory[0];
            if (lastRecord.original === originalAmount && lastRecord.chinese === chineseAmount) {
                return false;
            }
        }
        
        return true;
    }
    
    // 实时转换金额
    amountInput.addEventListener('input', function() {
        const amount = amountInput.value;
        currentInputValue = amount;
        
        // 更新字符计数
        charCount.textContent = `${amount.length} 位`;
        
        if (amount.trim() === '') {
            chineseOutput.value = '';
            inputStatus.textContent = '等待输入...';
            outputStatus.textContent = '结果将实时显示';
            outputStatus.style.color = '';
            
            // 输入框清空，重置标记
            hasCurrentInput = false;
            return;
        }
        
        // 检查是否为有效数字
        const isValidNumber = /^-?\d*\.?\d*$/.test(amount);
        
        if (!isValidNumber) {
            chineseOutput.value = '错误：请输入有效的数字金额';
            inputStatus.textContent = '输入无效';
            inputStatus.style.color = 'var(--danger-color)';
            outputStatus.textContent = '无法转换';
            outputStatus.style.color = 'var(--danger-color)';
            return;
        }
        
        // 转换金额
        const chineseAmount = convertAmountToChinese(amount);
        chineseOutput.value = chineseAmount;
        
        // 更新状态
        if (chineseAmount.startsWith('错误')) {
            inputStatus.textContent = '输入有效';
            inputStatus.style.color = 'var(--danger-color)';
            outputStatus.textContent = '转换失败';
            outputStatus.style.color = 'var(--danger-color)';
        } else {
            inputStatus.textContent = '输入有效';
            inputStatus.style.color = 'var(--success-color)';
            outputStatus.textContent = '转换成功';
            outputStatus.style.color = 'var(--success-color)';
            
            // 记录历史（仅在有效输入时）
            if (shouldRecordConversion(amount, chineseAmount)) {
                // 检查是否应该记录新条目
                if (!hasCurrentInput || lastRecordedValue === '') {
                    // 新输入，创建新记录
                    recordConversionHistory(amount, chineseAmount);
                    hasCurrentInput = true;
                    lastRecordedValue = amount;
                } else if (hasCurrentInput && amount !== lastRecordedValue) {
                    // 更新现有记录
                    updateLastConversionHistory(amount, chineseAmount);
                    lastRecordedValue = amount;
                }
            }
        }
    });
    
    // 记录转换历史
    function recordConversionHistory(originalAmount, chineseAmount) {
        const record = {
            id: Date.now(),
            original: originalAmount,
            chinese: chineseAmount,
            time: new Date().toLocaleTimeString('zh-CN', { 
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            })
        };
        
        // 添加到历史记录开头
        conversionHistory.unshift(record);
        
        // 限制历史记录数量
        if (conversionHistory.length > 10) {
            conversionHistory = conversionHistory.slice(0, 10);
        }
        
        // 保存到sessionStorage
        sessionStorage.setItem('conversionHistory', JSON.stringify(conversionHistory));
        
        // 更新显示
        updateHistoryDisplay();
    }
    
    // 更新最后一条转换历史
    function updateLastConversionHistory(originalAmount, chineseAmount) {
        if (conversionHistory.length === 0) return;
        
        // 更新最近一条记录
        conversionHistory[0].original = originalAmount;
        conversionHistory[0].chinese = chineseAmount;
        conversionHistory[0].time = new Date().toLocaleTimeString('zh-CN', { 
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        
        // 保存到sessionStorage
        sessionStorage.setItem('conversionHistory', JSON.stringify(conversionHistory));
        
        // 更新显示
        updateHistoryDisplay();
    }
    
    // 更新历史记录显示
    function updateHistoryDisplay() {
        historyList.innerHTML = '';
        
        if (conversionHistory.length === 0) {
            historyList.innerHTML = `
                <div class="history-empty">
                    <i class="far fa-clock"></i>
                    <p>暂无转换记录</p>
                    <p class="small-text">输入金额后，历史记录将显示在这里</p>
                </div>
            `;
            historyCount.textContent = '0';
            return;
        }
        
        conversionHistory.forEach(record => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.innerHTML = `
                <div class="history-numbers">
                    <div class="history-amount">¥ ${record.original}</div>
                    <div class="history-chinese">${record.chinese}</div>
                </div>
                <div class="history-time">${record.time}</div>
            `;
            historyList.appendChild(historyItem);
        });
        
        historyCount.textContent = conversionHistory.length;
    }
    
    // 清空金额输入
    clearAmountBtn.addEventListener('click', function() {
        amountInput.value = '';
        chineseOutput.value = '';
        currentInputValue = '';
        inputStatus.textContent = '等待输入...';
        outputStatus.textContent = '结果将实时显示';
        inputStatus.style.color = '';
        outputStatus.style.color = '';
        charCount.textContent = '0 位';
        amountInput.focus();
        
        // 重置输入标记
        hasCurrentInput = false;
        lastRecordedValue = '';
    });
    
    // 复制结果
    copyResultBtn.addEventListener('click', function() {
        if (!chineseOutput.value || chineseOutput.value.startsWith('错误')) {
            showNotification('没有可复制的内容', 'warning');
            return;
        }
        
        navigator.clipboard.writeText(chineseOutput.value)
            .then(() => {
                showNotification('已复制到剪贴板', 'success');
            })
            .catch(err => {
                console.error('复制失败: ', err);
                showNotification('复制失败，请手动选择复制', 'error');
            });
    });
    
    // 清空历史记录
    clearHistoryBtn.addEventListener('click', function() {
        if (conversionHistory.length === 0) {
            showNotification('没有历史记录可清除', 'info');
            return;
        }
        
        if (confirm('确定要清空所有转换历史记录吗？')) {
            conversionHistory = [];
            sessionStorage.removeItem('conversionHistory');
            updateHistoryDisplay();
            showNotification('历史记录已清空', 'success');
        }
    });
    
    // 初始焦点
    amountInput.focus();
});