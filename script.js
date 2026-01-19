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
    
    // 存储转换历史
    let conversionHistory = JSON.parse(localStorage.getItem('conversionHistory')) || [];
    let currentInputValue = '';
    
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
            if (chineseAmount && !chineseAmount.startsWith('错误')) {
                recordConversionHistory(amount, chineseAmount);
            }
        }
    });
    
    // 记录转换历史
    function recordConversionHistory(originalAmount, chineseAmount) {
        // 检查是否与最近一次记录相同
        if (conversionHistory.length > 0) {
            const lastRecord = conversionHistory[0];
            if (lastRecord.original === originalAmount && lastRecord.chinese === chineseAmount) {
                return; // 相同输入，不重复记录
            }
        }
        
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
        
        // 保存到localStorage
        localStorage.setItem('conversionHistory', JSON.stringify(conversionHistory));
        
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
            localStorage.removeItem('conversionHistory');
            updateHistoryDisplay();
            showNotification('历史记录已清空', 'success');
        }
    });
    
    // 工具标签切换
    const tabBtns = document.querySelectorAll('.tab-btn');
    const toolContents = document.querySelectorAll('.tool-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // 更新活动标签
            tabBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // 显示对应内容
            toolContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === tabId) {
                    content.classList.add('active');
                }
            });
            
            // 如果是计算器标签，重新计算高度
            if (tabId === 'calculator') {
                setTimeout(() => {
                    adjustCalculatorHeight();
                }, 10);
            }
        });
    });
    
    // 科学计算器功能
    const calcInput = document.getElementById('calc-input');
    const calcExpression = document.getElementById('calc-expression');
    const calcButtons = document.querySelectorAll('.calc-btn');
    const modeToggleBtn = document.querySelector('[data-action="toggle-mode"]');
    const modeIcon = document.getElementById('mode-icon');
    
    let calcExpressionValue = '';
    let calcInputValue = '0';
    let shouldResetInput = false;
    let lastOperation = '';
    let calculatorMode = 'light'; // 'light' 或 'dark'
    
    // 初始化计算器
    function initCalculator() {
        calcInput.textContent = calcInputValue;
        calcExpression.textContent = calcExpressionValue;
        
        // 绑定计算器按钮事件
        calcButtons.forEach(button => {
            button.addEventListener('click', handleCalculatorButton);
        });
        
        // 初始调整高度
        adjustCalculatorHeight();
    }
    
    // 处理计算器按钮点击
    function handleCalculatorButton(e) {
        const action = e.currentTarget.getAttribute('data-action');
        const number = e.currentTarget.getAttribute('data-number');
        
        if (number !== null) {
            inputNumber(number);
        } else if (action) {
            handleAction(action);
        }
        
        updateCalculatorDisplay();
    }
    
    // 输入数字
    function inputNumber(num) {
        if (calcInputValue === '0' || shouldResetInput) {
            calcInputValue = num;
            shouldResetInput = false;
        } else {
            calcInputValue += num;
        }
    }
    
    // 处理操作
    function handleAction(action) {
        switch (action) {
            case 'clear':
                clearCalculator();
                break;
            case 'backspace':
                backspace();
                break;
            case 'percent':
                percent();
                break;
            case 'decimal':
                inputDecimal();
                break;
            case 'equals':
                calculate();
                break;
            case 'add':
            case 'subtract':
            case 'multiply':
            case 'divide':
                setOperation(action);
                break;
            case 'sin':
            case 'cos':
            case 'tan':
            case 'log':
            case 'ln':
            case 'sqrt':
            case 'power':
                scientificFunction(action);
                break;
            case 'pi':
                inputPi();
                break;
            case 'e':
                inputE();
                break;
            case 'toggle-mode':
                toggleCalculatorMode();
                break;
        }
    }
    
    // 清除计算器
    function clearCalculator() {
        calcInputValue = '0';
        calcExpressionValue = '';
        lastOperation = '';
        shouldResetInput = false;
    }
    
    // 退格
    function backspace() {
        if (calcInputValue.length > 1) {
            calcInputValue = calcInputValue.slice(0, -1);
        } else {
            calcInputValue = '0';
        }
    }
    
    // 百分比
    function percent() {
        const value = parseFloat(calcInputValue);
        calcInputValue = (value / 100).toString();
    }
    
    // 输入小数点
    function inputDecimal() {
        if (shouldResetInput) {
            calcInputValue = '0.';
            shouldResetInput = false;
        } else if (!calcInputValue.includes('.')) {
            calcInputValue += '.';
        }
    }
    
    // 设置运算
    function setOperation(op) {
        if (lastOperation && !shouldResetInput) {
            calculate();
        }
        
        const operatorMap = {
            'add': '+',
            'subtract': '-',
            'multiply': '×',
            'divide': '÷'
        };
        
        lastOperation = op;
        calcExpressionValue = `${calcInputValue} ${operatorMap[op]}`;
        shouldResetInput = true;
    }
    
    // 计算
    function calculate() {
        if (!lastOperation || shouldResetInput) return;
        
        const prev = parseFloat(calcExpressionValue.split(' ')[0]);
        const current = parseFloat(calcInputValue);
        let result;
        
        switch (lastOperation) {
            case 'add':
                result = prev + current;
                break;
            case 'subtract':
                result = prev - current;
                break;
            case 'multiply':
                result = prev * current;
                break;
            case 'divide':
                result = current !== 0 ? prev / current : '错误：除零错误';
                break;
            default:
                return;
        }
        
        calcExpressionValue = `${prev} ${getOperatorSymbol(lastOperation)} ${current} =`;
        calcInputValue = result.toString();
        lastOperation = '';
        shouldResetInput = true;
    }
    
    // 获取运算符符号
    function getOperatorSymbol(op) {
        const symbols = {
            'add': '+',
            'subtract': '-',
            'multiply': '×',
            'divide': '÷'
        };
        return symbols[op] || op;
    }
    
    // 科学函数
    function scientificFunction(func) {
        const value = parseFloat(calcInputValue);
        let result;
        
        switch (func) {
            case 'sin':
                result = Math.sin(value * Math.PI / 180); // 角度制
                break;
            case 'cos':
                result = Math.cos(value * Math.PI / 180);
                break;
            case 'tan':
                result = Math.tan(value * Math.PI / 180);
                break;
            case 'log':
                result = value > 0 ? Math.log10(value) : '错误：无效输入';
                break;
            case 'ln':
                result = value > 0 ? Math.log(value) : '错误：无效输入';
                break;
            case 'sqrt':
                result = value >= 0 ? Math.sqrt(value) : '错误：无效输入';
                break;
            case 'power':
                calcExpressionValue = `${calcInputValue}^`;
                shouldResetInput = true;
                lastOperation = 'power';
                return;
        }
        
        calcExpressionValue = `${func}(${value})`;
        calcInputValue = typeof result === 'number' ? 
            (Math.abs(result) < 1e-10 ? '0' : result.toString()) : 
            result;
        shouldResetInput = true;
    }
    
    // 输入π
    function inputPi() {
        if (calcInputValue === '0' || shouldResetInput) {
            calcInputValue = Math.PI.toString().slice(0, 10);
            shouldResetInput = false;
        } else {
            calcInputValue += Math.PI.toString().slice(0, 10);
        }
    }
    
    // 输入e
    function inputE() {
        if (calcInputValue === '0' || shouldResetInput) {
            calcInputValue = Math.E.toString().slice(0, 10);
            shouldResetInput = false;
        } else {
            calcInputValue += Math.E.toString().slice(0, 10);
        }
    }
    
    // 切换计算器模式
    function toggleCalculatorMode() {
        const display = document.querySelector('.calculator-display');
        
        if (calculatorMode === 'light') {
            calculatorMode = 'dark';
            display.style.backgroundColor = '#1a1a2e';
            display.style.color = 'white';
            modeIcon.className = 'fas fa-moon';
            modeIcon.title = '切换到亮色模式';
        } else {
            calculatorMode = 'light';
            display.style.backgroundColor = '#f8f9fa';
            display.style.color = '#212529';
            modeIcon.className = 'fas fa-sun';
            modeIcon.title = '切换到暗色模式';
        }
    }
    
    // 更新计算器显示
    function updateCalculatorDisplay() {
        // 限制显示长度
        if (calcInputValue.length > 12) {
            calcInput.textContent = parseFloat(calcInputValue).toExponential(6);
        } else {
            calcInput.textContent = calcInputValue;
        }
        
        calcExpression.textContent = calcExpressionValue;
    }
    
    // 调整计算器高度
    function adjustCalculatorHeight() {
        const calculatorButtons = document.querySelector('.calculator-buttons');
        const calculatorDisplay = document.querySelector('.calculator-display');
        
        if (calculatorButtons && calculatorDisplay) {
            const buttonsHeight = calculatorButtons.offsetHeight;
            calculatorDisplay.style.minHeight = `${buttonsHeight}px`;
        }
    }
    
    // 初始化计算器
    initCalculator();
    
    // 网站收藏夹功能
    const addBookmarkBtn = document.getElementById('add-bookmark');
    const importBookmarksBtn = document.getElementById('import-bookmarks');
    const exportBookmarksBtn = document.getElementById('export-bookmarks');
    const addBookmarkModal = document.getElementById('add-bookmark-modal');
    const importModal = document.getElementById('import-modal');
    const modalCloseBtns = document.querySelectorAll('.modal-close');
    const saveBookmarkBtn = document.getElementById('save-bookmark');
    const bookmarkForm = document.getElementById('bookmark-form');
    const bookmarksList = document.getElementById('bookmarks-list');
    const emptyBookmarks = document.getElementById('empty-bookmarks');
    const confirmImportBtn = document.getElementById('confirm-import');
    
    // 加载收藏夹
    let bookmarks = JSON.parse(localStorage.getItem('toolboxBookmarks')) || [
        {
            id: 1,
            name: 'GitHub',
            url: 'https://github.com',
            description: '代码托管平台',
            icon: 'fab fa-github'
        },
        {
            id: 2,
            name: 'Google',
            url: 'https://google.com',
            description: '搜索引擎',
            icon: 'fab fa-google'
        },
        {
            id: 3,
            name: 'Stack Overflow',
            url: 'https://stackoverflow.com',
            description: '编程问答社区',
            icon: 'fab fa-stack-overflow'
        },
        {
            id: 4,
            name: 'MDN Web Docs',
            url: 'https://developer.mozilla.org',
            description: 'Web技术文档',
            icon: 'fab fa-mdn'
        },
        {
            id: 5,
            name: 'YouTube',
            url: 'https://youtube.com',
            description: '视频分享平台',
            icon: 'fab fa-youtube'
        }
    ];
    
    // 渲染收藏夹
    function renderBookmarks() {
        bookmarksList.innerHTML = '';
        
        if (bookmarks.length === 0) {
            emptyBookmarks.style.display = 'block';
            return;
        }
        
        emptyBookmarks.style.display = 'none';
        
        bookmarks.forEach(bookmark => {
            const bookmarkElement = createBookmarkElement(bookmark);
            bookmarksList.appendChild(bookmarkElement);
        });
        
        // 保存到localStorage
        localStorage.setItem('toolboxBookmarks', JSON.stringify(bookmarks));
    }
    
    // 创建书签元素
    function createBookmarkElement(bookmark) {
        const div = document.createElement('div');
        div.className = 'bookmark-item';
        div.setAttribute('data-id', bookmark.id);
        
        div.innerHTML = `
            <div class="bookmark-icon">
                <i class="${bookmark.icon || 'fas fa-globe'}"></i>
            </div>
            <div class="bookmark-content">
                <h4>${bookmark.name}</h4>
                <p>${bookmark.description || ''}</p>
                <a href="${bookmark.url}" target="_blank">${bookmark.url}</a>
            </div>
            <div class="bookmark-actions">
                <button class="bookmark-btn" title="编辑">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="bookmark-btn delete" title="删除">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        // 添加事件监听器
        const editBtn = div.querySelector('.bookmark-btn:not(.delete)');
        const deleteBtn = div.querySelector('.bookmark-btn.delete');
        const link = div.querySelector('a');
        
        editBtn.addEventListener('click', () => editBookmark(bookmark.id));
        deleteBtn.addEventListener('click', () => deleteBookmark(bookmark.id));
        link.addEventListener('click', (e) => {
            e.stopPropagation();
            // 链接已通过target="_blank"打开，无需额外处理
        });
        
        return div;
    }
    
    // 添加书签
    addBookmarkBtn.addEventListener('click', () => {
        // 重置表单
        bookmarkForm.reset();
        document.getElementById('bookmark-icon').value = 'fas fa-globe';
        
        // 显示模态框
        addBookmarkModal.classList.add('active');
    });
    
    // 保存书签
    saveBookmarkBtn.addEventListener('click', () => {
        const name = document.getElementById('bookmark-name').value.trim();
        const url = document.getElementById('bookmark-url').value.trim();
        const description = document.getElementById('bookmark-description').value.trim();
        const icon = document.getElementById('bookmark-icon').value;
        
        if (!name || !url) {
            showNotification('请填写网站名称和地址', 'warning');
            return;
        }
        
        // 验证URL格式
        try {
            new URL(url);
        } catch {
            showNotification('请输入有效的URL地址', 'error');
            return;
        }
        
        const newBookmark = {
            id: Date.now(),
            name,
            url,
            description,
            icon
        };
        
        bookmarks.unshift(newBookmark);
        renderBookmarks();
        
        // 关闭模态框
        addBookmarkModal.classList.remove('active');
        showNotification('网站已添加到收藏夹', 'success');
    });
    
    // 编辑书签
    function editBookmark(id) {
        const bookmark = bookmarks.find(b => b.id === id);
        if (!bookmark) return;
        
        // 填充表单
        document.getElementById('bookmark-name').value = bookmark.name;
        document.getElementById('bookmark-url').value = bookmark.url;
        document.getElementById('bookmark-description').value = bookmark.description || '';
        document.getElementById('bookmark-icon').value = bookmark.icon || 'fas fa-globe';
        
        // 显示模态框
        addBookmarkModal.classList.add('active');
        
        // 更新保存按钮行为
        const oldHandler = saveBookmarkBtn.onclick;
        saveBookmarkBtn.onclick = function() {
            const name = document.getElementById('bookmark-name').value.trim();
            const url = document.getElementById('bookmark-url').value.trim();
            const description = document.getElementById('bookmark-description').value.trim();
            const icon = document.getElementById('bookmark-icon').value;
            
            if (!name || !url) {
                showNotification('请填写网站名称和地址', 'warning');
                return;
            }
            
            // 验证URL格式
            try {
                new URL(url);
            } catch {
                showNotification('请输入有效的URL地址', 'error');
                return;
            }
            
            // 更新书签
            bookmark.name = name;
            bookmark.url = url;
            bookmark.description = description;
            bookmark.icon = icon;
            
            renderBookmarks();
            
            // 关闭模态框
            addBookmarkModal.classList.remove('active');
            showNotification('网站信息已更新', 'success');
            
            // 恢复原始处理程序
            saveBookmarkBtn.onclick = oldHandler;
        };
    }
    
    // 删除书签
    function deleteBookmark(id) {
        if (confirm('确定要从收藏夹中删除这个网站吗？')) {
            bookmarks = bookmarks.filter(b => b.id !== id);
            renderBookmarks();
            showNotification('网站已从收藏夹删除', 'success');
        }
    }
    
    // 导入收藏夹
    importBookmarksBtn.addEventListener('click', () => {
        importModal.classList.add('active');
        updateImportPreview([]);
    });
    
    // 处理HTML文件导入
    document.getElementById('html-import').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(event) {
            const htmlContent = event.target.result;
            const importedBookmarks = parseBookmarksHTML(htmlContent);
            updateImportPreview(importedBookmarks);
        };
        reader.readAsText(file);
    });
    
    // 处理JSON文件导入
    document.getElementById('json-import').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(event) {
            try {
                const importedBookmarks = JSON.parse(event.target.result);
                updateImportPreview(importedBookmarks);
            } catch (error) {
                showNotification('JSON文件格式错误', 'error');
            }
        };
        reader.readAsText(file);
    });
    
    // 处理手动输入
    document.getElementById('manual-import').addEventListener('input', function() {
        const text = this.value.trim();
        if (!text) {
            updateImportPreview([]);
            return;
        }
        
        const lines = text.split('\n');
        const importedBookmarks = [];
        
        lines.forEach((line, index) => {
            line = line.trim();
            if (!line) return;
            
            const parts = line.split('|');
            if (parts.length >= 2) {
                importedBookmarks.push({
                    id: Date.now() + index,
                    name: parts[0].trim(),
                    url: parts[1].trim(),
                    description: parts[2] ? parts[2].trim() : '',
                    icon: 'fas fa-globe'
                });
            }
        });
        
        updateImportPreview(importedBookmarks);
    });
    
    // 解析HTML书签文件
    function parseBookmarksHTML(html) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const links = doc.querySelectorAll('a');
        const bookmarks = [];
        
        links.forEach((link, index) => {
            const name = link.textContent.trim();
            const url = link.getAttribute('href');
            
            if (name && url && url.startsWith('http')) {
                bookmarks.push({
                    id: Date.now() + index,
                    name,
                    url,
                    description: '',
                    icon: 'fas fa-globe'
                });
            }
        });
        
        return bookmarks;
    }
    
    // 更新导入预览
    function updateImportPreview(bookmarks) {
        const previewList = document.getElementById('preview-list');
        const previewCount = document.getElementById('preview-count');
        
        previewList.innerHTML = '';
        previewCount.textContent = bookmarks.length;
        
        if (bookmarks.length === 0) {
            confirmImportBtn.disabled = true;
            return;
        }
        
        confirmImportBtn.disabled = false;
        
        bookmarks.forEach(bookmark => {
            const div = document.createElement('div');
            div.className = 'preview-item';
            div.innerHTML = `
                <input type="checkbox" checked data-id="${bookmark.id}">
                <div class="preview-item-content">
                    <h5>${bookmark.name}</h5>
                    <p>${bookmark.url}</p>
                </div>
            `;
            previewList.appendChild(div);
        });
        
        // 存储预览数据
        previewList.dataset.previewData = JSON.stringify(bookmarks);
    }
    
    // 确认导入
    confirmImportBtn.addEventListener('click', () => {
        const previewList = document.getElementById('preview-list');
        const checkboxes = previewList.querySelectorAll('input[type="checkbox"]:checked');
        const previewData = JSON.parse(previewList.dataset.previewData || '[]');
        
        const importedBookmarks = [];
        checkboxes.forEach(checkbox => {
            const id = parseInt(checkbox.getAttribute('data-id'));
            const bookmark = previewData.find(b => b.id === id);
            if (bookmark) {
                importedBookmarks.push(bookmark);
            }
        });
        
        // 添加到现有书签
        bookmarks = [...importedBookmarks, ...bookmarks];
        renderBookmarks();
        
        // 关闭模态框
        importModal.classList.remove('active');
        showNotification(`成功导入 ${importedBookmarks.length} 个网站`, 'success');
        
        // 清理文件输入
        document.getElementById('html-import').value = '';
        document.getElementById('json-import').value = '';
        document.getElementById('manual-import').value = '';
    });
    
    // 导出收藏夹
    exportBookmarksBtn.addEventListener('click', () => {
        if (bookmarks.length === 0) {
            showNotification('收藏夹为空，无需导出', 'info');
            return;
        }
        
        const dataStr = JSON.stringify(bookmarks, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `toolbox-bookmarks-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showNotification(`已导出 ${bookmarks.length} 个书签`, 'success');
    });
    
    // 关闭模态框
    modalCloseBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                modal.classList.remove('active');
            }
        });
    });
    
    // 点击模态框外部关闭
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.classList.remove('active');
        }
    });
    
    // 渲染初始收藏夹
    renderBookmarks();
    
    // 通知函数
    function showNotification(message, type = 'info') {
        // 移除现有通知
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // 创建通知
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        // 添加到页面
        document.body.appendChild(notification);
        
        // 显示通知
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // 自动隐藏
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 3000);
    }
    
    // 添加通知样式
    const notificationStyle = document.createElement('style');
    notificationStyle.textContent = `
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 10px;
            z-index: 10000;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
            transform: translateX(100%);
            opacity: 0;
            transition: transform 0.3s ease, opacity 0.3s ease;
            max-width: 350px;
        }
        
        .notification.show {
            transform: translateX(0);
            opacity: 1;
        }
        
        .notification-success {
            background-color: #2ecc71;
        }
        
        .notification-error {
            background-color: #e74c3c;
        }
        
        .notification-warning {
            background-color: #f39c12;
        }
        
        .notification-info {
            background-color: #3498db;
        }
    `;
    document.head.appendChild(notificationStyle);
    
    // 页脚链接
    document.getElementById('report-issue').addEventListener('click', function(e) {
        e.preventDefault();
        showNotification('反馈功能即将上线', 'info');
    });
    
    document.getElementById('view-source').addEventListener('click', function(e) {
        e.preventDefault();
        window.open('https://github.com', '_blank');
    });
    
    // 窗口大小变化时调整计算器高度
    window.addEventListener('resize', adjustCalculatorHeight);
    
    // 初始调整
    setTimeout(adjustCalculatorHeight, 100);
});