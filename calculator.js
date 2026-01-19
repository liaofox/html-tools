// 科学计算器功能

document.addEventListener('DOMContentLoaded', function() {
    // 计算器元素
    const calcInput = document.getElementById('calc-input');
    const calcExpression = document.getElementById('calc-expression');
    const calcButtons = document.querySelectorAll('.calc-btn');
    const modeToggleBtn = document.querySelector('[data-action="toggle-mode"]');
    const modeIcon = document.getElementById('mode-icon');
    const calcHistoryList = document.getElementById('calc-history-list');
    const calcHistoryCount = document.getElementById('calc-history-count');
    
    // 计算器状态
    let calcExpressionValue = '';
    let calcInputValue = '0';
    let shouldResetInput = false;
    let lastOperation = '';
    let calculatorMode = 'light'; // 'light' 或 'dark'
    let lastResult = '';
    let isNewCalculation = true;
    
    // 计算历史 - 使用sessionStorage
    let calcHistory = JSON.parse(sessionStorage.getItem('calcHistory')) || [];
    
    // 初始化计算器
    function initCalculator() {
        calcInput.textContent = calcInputValue;
        calcExpression.textContent = calcExpressionValue;
        
        // 绑定计算器按钮事件
        calcButtons.forEach(button => {
            button.addEventListener('click', handleCalculatorButton);
        });
        
        // 初始计算历史显示
        updateCalcHistoryDisplay();
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
            isNewCalculation = false;
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
        lastResult = '';
        isNewCalculation = true;
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
        
        // 记录操作
        addToHistory(`${value}%`, calcInputValue);
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
        if (lastOperation && !shouldResetInput && !isNewCalculation) {
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
        isNewCalculation = false;
    }
    
    // 计算
    function calculate() {
        if (!lastOperation || shouldResetInput || isNewCalculation) return;
        
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
        
        const expression = `${prev} ${getOperatorSymbol(lastOperation)} ${current}`;
        calcExpressionValue = `${expression} =`;
        
        if (typeof result === 'number' && !isNaN(result)) {
            // 处理浮点数精度问题
            if (!Number.isInteger(result)) {
                result = parseFloat(result.toFixed(10));
            }
            calcInputValue = result.toString();
            lastResult = result.toString();
            
            // 记录计算历史
            addToHistory(expression, result.toString());
        } else {
            calcInputValue = result;
        }
        
        lastOperation = '';
        shouldResetInput = true;
        isNewCalculation = true;
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
        let funcName = '';
        
        switch (func) {
            case 'sin':
                result = Math.sin(value * Math.PI / 180); // 角度制
                funcName = 'sin';
                break;
            case 'cos':
                result = Math.cos(value * Math.PI / 180);
                funcName = 'cos';
                break;
            case 'tan':
                result = Math.tan(value * Math.PI / 180);
                funcName = 'tan';
                break;
            case 'log':
                result = value > 0 ? Math.log10(value) : '错误：无效输入';
                funcName = 'log';
                break;
            case 'ln':
                result = value > 0 ? Math.log(value) : '错误：无效输入';
                funcName = 'ln';
                break;
            case 'sqrt':
                result = value >= 0 ? Math.sqrt(value) : '错误：无效输入';
                funcName = '√';
                break;
            case 'power':
                calcExpressionValue = `${calcInputValue}^`;
                shouldResetInput = true;
                lastOperation = 'power';
                isNewCalculation = false;
                return;
        }
        
        const expression = `${funcName}(${value})`;
        calcExpressionValue = expression;
        
        if (typeof result === 'number' && !isNaN(result)) {
            // 处理浮点数精度问题
            if (!Number.isInteger(result)) {
                result = parseFloat(result.toFixed(10));
            }
            calcInputValue = result.toString();
            lastResult = result.toString();
            
            // 记录计算历史
            if (!result.toString().includes('错误')) {
                addToHistory(expression, result.toString());
            }
        } else {
            calcInputValue = result;
        }
        
        shouldResetInput = true;
        isNewCalculation = true;
    }
    
    // 输入π
    function inputPi() {
        if (calcInputValue === '0' || shouldResetInput) {
            calcInputValue = Math.PI.toString().slice(0, 10);
            shouldResetInput = false;
            isNewCalculation = false;
        } else {
            calcInputValue += Math.PI.toString().slice(0, 10);
        }
    }
    
    // 输入e
    function inputE() {
        if (calcInputValue === '0' || shouldResetInput) {
            calcInputValue = Math.E.toString().slice(0, 10);
            shouldResetInput = false;
            isNewCalculation = false;
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
    
    // 添加计算历史
    function addToHistory(expression, result) {
        const historyItem = {
            id: Date.now(),
            expression: expression,
            result: result,
            time: new Date().toLocaleTimeString('zh-CN', { 
                hour12: false,
                hour: '2-digit',
                minute: '2-digit'
            })
        };
        
        // 添加到历史记录开头
        calcHistory.unshift(historyItem);
        
        // 限制历史记录数量
        if (calcHistory.length > 20) {
            calcHistory = calcHistory.slice(0, 20);
        }
        
        // 保存到sessionStorage
        sessionStorage.setItem('calcHistory', JSON.stringify(calcHistory));
        
        // 更新显示
        updateCalcHistoryDisplay();
    }
    
    // 更新计算历史显示
    function updateCalcHistoryDisplay() {
        calcHistoryList.innerHTML = '';
        
        if (calcHistory.length === 0) {
            calcHistoryList.innerHTML = `
                <div class="history-empty">
                    <i class="far fa-clock"></i>
                    <p>暂无计算历史</p>
                    <p class="small-text">计算操作将记录在这里</p>
                </div>
            `;
            calcHistoryCount.textContent = '0';
            return;
        }
        
        calcHistory.forEach(item => {
            const historyItem = document.createElement('div');
            historyItem.className = 'calc-history-item';
            historyItem.innerHTML = `
                <div class="calc-history-expression">${item.expression} =</div>
                <div class="calc-history-result">${item.result}</div>
            `;
            calcHistoryList.appendChild(historyItem);
        });
        
        calcHistoryCount.textContent = calcHistory.length;
    }
    
    // 键盘支持
    document.addEventListener('keydown', function(e) {
        const key = e.key;
        
        // 数字键
        if (key >= '0' && key <= '9') {
            inputNumber(key);
            updateCalculatorDisplay();
            e.preventDefault();
        }
        
        // 运算符
        else if (key === '+') {
            setOperation('add');
            updateCalculatorDisplay();
            e.preventDefault();
        }
        else if (key === '-') {
            setOperation('subtract');
            updateCalculatorDisplay();
            e.preventDefault();
        }
        else if (key === '*' || key === 'x') {
            setOperation('multiply');
            updateCalculatorDisplay();
            e.preventDefault();
        }
        else if (key === '/') {
            setOperation('divide');
            updateCalculatorDisplay();
            e.preventDefault();
        }
        
        // 小数点
        else if (key === '.') {
            inputDecimal();
            updateCalculatorDisplay();
            e.preventDefault();
        }
        
        // 等于/回车
        else if (key === '=' || key === 'Enter') {
            calculate();
            updateCalculatorDisplay();
            e.preventDefault();
        }
        
        // 清除/ESC
        else if (key === 'Escape' || key === 'Delete') {
            clearCalculator();
            updateCalculatorDisplay();
            e.preventDefault();
        }
        
        // 退格
        else if (key === 'Backspace') {
            backspace();
            updateCalculatorDisplay();
            e.preventDefault();
        }
    });
    
    // 初始化计算器
    initCalculator();
});