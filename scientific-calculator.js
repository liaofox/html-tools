// 科学计算器 - 完整专业版 (使用math.js库)
class ScientificCalculator {
    constructor() {
        this.display = document.getElementById('display');
        this.mathInput = document.getElementById('math-input');
        this.historyList = document.getElementById('history-list');
        this.graphCanvas = document.getElementById('graph-canvas');
        this.angleMode = 'degrees'; // 'degrees' 或 'radians'
        this.history = [];
        this.math = null;
        this.lastResult = 0;
        this.isResultDisplayed = false;
        
        this.initializeCalculator();
    }

    async initializeCalculator() {
        this.setupCalculatorLayout();
        this.setupEventListeners();
        await this.loadMathJs();
        this.renderHistory();
        this.mathInput.focus();
        this.updateAngleModeButton();
    }

    setupCalculatorLayout() {
        // 确保所有必要的DOM元素都存在
        if (!this.display) this.display = document.createElement('div');
        if (!this.mathInput) {
            this.mathInput = document.createElement('input');
            this.mathInput.type = 'text';
            this.mathInput.id = 'math-input';
            this.mathInput.placeholder = '输入数学表达式...';
            document.querySelector('.input-history-container').appendChild(this.mathInput);
        }
    }

    async loadMathJs() {
        // 如果math.js已经加载，直接使用
        if (window.math) {
            this.math = window.math;
            return;
        }

        // 创建并加载math.js脚本
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/mathjs/12.4.0/math.min.js';
            script.onload = () => {
                this.math = window.math;
                // 配置math.js使用高精度计算
                math.config({
                    number: 'number',
                    precision: 14
                });
                resolve();
            };
            script.onerror = () => {
                console.warn('Math.js加载失败，使用内置计算功能');
                this.math = null;
                resolve();
            };
            document.head.appendChild(script);
        });
    }

    setupEventListeners() {
        // 输入框事件监听
        this.mathInput.addEventListener('input', () => this.handleInput());
        this.mathInput.addEventListener('keydown', (e) => this.handleKeyDown(e));
        
        // 全局键盘事件监听
        document.addEventListener('keydown', (e) => this.handleGlobalKeyDown(e));
        
        // 窗口调整事件
        window.addEventListener('resize', () => this.handleResize());
    }

    handleKeyDown(e) {
        switch (e.key) {
            case 'Enter':
                e.preventDefault();
                this.calculate();
                break;
            case 'Escape':
                e.preventDefault();
                this.clearAll();
                break;
            case 'Backspace':
                // 允许默认的退格行为
                break;
            default:
                // 处理其他按键
                if (e.key.match(/[0-9+\-*/.^()]/)) {
                    e.preventDefault();
                    this.addToInput(e.key);
                }
        }
    }

    handleGlobalKeyDown(e) {
        // 只在输入框未聚焦时处理全局键盘事件
        if (document.activeElement !== this.mathInput) {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.calculate();
            } else if (e.key.match(/[0-9+\-*/.^()a-zA-Z]/)) {
                e.preventDefault();
                
                // 使用标志位防止重复输入
                if (this.keyProcessing) return;
                this.keyProcessing = true;
                
                // 先聚焦到输入框
                this.mathInput.focus();
                
                // 直接添加到输入框
                const input = this.mathInput;
                const start = input.selectionStart;
                const end = input.selectionEnd;
                
                input.value = input.value.substring(0, start) + e.key + input.value.substring(end);
                input.setSelectionRange(start + e.key.length, start + e.key.length);
                
                // 触发输入事件更新显示
                this.handleInput();
                
                // 50ms后重置标志位
                setTimeout(() => {
                    this.keyProcessing = false;
                }, 50);
            }
        }
    }
    handleInput() {
        const expr = this.mathInput.value.trim();
        if (!expr) {
            this.display.textContent = '0';
            this.mathInput.classList.remove('error');
            this.mathInput.classList.remove('valid');
            return;
        }

        try {
            // 验证表达式语法
            this.validateExpression(expr);
            
            // 检查表达式类型 - 更精确的变量检测
            const hasRealVariables = this.hasRealVariables(expr);
            if (!hasRealVariables) {
                // 普通计算式 - 显示计算结果
                const result = this.evaluateExpression(expr);
                this.display.textContent = result !== undefined ? this.formatResult(result) : '0';
            } else {
                // 包含变量的函数表达式 - 显示"函数表达式"
                this.display.textContent = '函数表达式';
            }
            
            // 设置绿色边框 - 有效表达式
            this.mathInput.classList.remove('error');
            this.mathInput.classList.add('valid');
        } catch (error) {
            // 设置红色边框 - 无效表达式
            this.display.textContent = '错误';
            this.mathInput.classList.remove('valid');
            this.mathInput.classList.add('error');
        }
    }

    hasRealVariables(expr) {
        // 更精确的变量检测：排除数学常数和函数名
        const variables = expr.match(/[a-zA-Z]/g) || [];
        if (variables.length === 0) return false;
        
        // 排除已知的数学常数和函数名
        const mathConstants = ['e', 'pi', 'π'];
        const mathFunctions = ['sin', 'cos', 'tan', 'asin', 'acos', 'atan', 
                              'sqrt', 'log', 'ln', 'exp', 'abs', 'floor', 'ceil', 'round'];
        
        // 检查表达式是否为函数调用（包含括号）
        const functionCalls = expr.match(/[a-zA-Z]+\(/g) || [];
        const allFunctionsValid = functionCalls.every(funcCall => {
            const funcName = funcCall.replace('(', '');
            return mathFunctions.includes(funcName);
        });
        
        // 如果有函数调用，检查是否都是有效的数学函数
        if (functionCalls.length > 0 && allFunctionsValid) {
            // 检查函数参数中是否包含真正的变量
            const functionArgs = expr.match(/[a-zA-Z]+\(([^)]+)\)/g) || [];
            for (const arg of functionArgs) {
                const content = arg.replace(/[a-zA-Z]+\(([^)]+)\)/, '$1');
                const argVariables = content.match(/[a-zA-Z]/g) || [];
                for (const variable of argVariables) {
                    if (variable.length === 1 && !mathConstants.includes(variable.toLowerCase())) {
                        return true; // 函数参数中包含真正的变量
                    }
                }
            }
            return false; // 所有函数参数都是常数或数字
        }
        
        // 检查是否为真正的变量（不是常数或函数名的一部分）
        for (const variable of variables) {
            // 如果是单字母且不是常数
            if (variable.length === 1 && !mathConstants.includes(variable.toLowerCase())) {
                return true;
            }
        }
        
        return false;
    }

    validateExpression(expr) {
        if (!expr) return;
        
        // 检查基本数学表达式语法
        const mathExprPattern = /^[\d+\-*/().^a-zA-Z\s]+$/;
        if (!mathExprPattern.test(expr)) {
            throw new Error('包含无效字符');
        }
        
        // 检查括号匹配
        const stack = [];
        for (const char of expr) {
            if (char === '(') stack.push(char);
            else if (char === ')') {
                if (stack.length === 0) throw new Error('括号不匹配');
                stack.pop();
            }
        }
        if (stack.length > 0) throw new Error('括号不匹配');
        
        // 检查连续运算符
        if (expr.match(/[+\-*/^]{2,}/)) throw new Error('连续运算符');
        
        // 检查函数调用格式
        if (expr.match(/[a-zA-Z]+\d*\(/)) {
            const validFunctions = ['sin', 'cos', 'tan', 'asin', 'acos', 'atan', 
                                  'sqrt', 'log', 'ln', 'exp', 'abs', 'floor', 'ceil', 'round'];
            const functions = expr.match(/[a-zA-Z]+\(/g) || [];
            for (const fn of functions) {
                const funcName = fn.replace('(', '');
                if (!validFunctions.includes(funcName)) {
                    throw new Error(`无效函数: ${funcName}`);
                }
            }
        }
    }

    evaluateExpression(expr) {
        if (!expr.trim()) return 0;

        try {
            let processedExpr = expr;
            
            // 处理角度模式转换
            if (this.angleMode === 'degrees') {
                processedExpr = this.convertToRadians(processedExpr);
            }

            // 替换特殊常数和函数
            processedExpr = processedExpr
                .replace(/π/g, 'pi')
                .replace(/pi/g, '3.141592653589793')
                .replace(/e(?![a-zA-Z])/g, '2.718281828459045')
                .replace(/\^/g, '**')
                .replace(/sin\(/g, 'Math.sin(')
                .replace(/cos\(/g, 'Math.cos(')
                .replace(/tan\(/g, 'Math.tan(')
                .replace(/asin\(/g, 'Math.asin(')
                .replace(/acos\(/g, 'Math.acos(')
                .replace(/atan\(/g, 'Math.atan(')
                .replace(/sqrt\(/g, 'Math.sqrt(')
                .replace(/log\(/g, 'Math.log10(')
                .replace(/ln\(/g, 'Math.log(')
                .replace(/exp\(/g, 'Math.exp(')
                .replace(/abs\(/g, 'Math.abs(');

            // 使用math.js进行精确计算（如果可用）
            if (this.math) {
                try {
                    return this.math.evaluate(processedExpr);
                } catch (mathError) {
                    // 如果math.js失败，回退到eval
                    console.warn('Math.js计算失败，使用内置计算:', mathError);
                }
            }

            // 安全地使用eval计算
            const result = eval(processedExpr);
            return typeof result === 'number' ? result : undefined;

        } catch (error) {
            throw new Error('无效的数学表达式');
        }
    }

    convertToRadians(expr) {
        // 将角度转换为弧度
        // sin(20) -> Math.sin(20 * Math.PI / 180)
        return expr.replace(/sin\(([^)]+)\)/g, 'Math.sin($1 * Math.PI / 180)')
                 .replace(/cos\(([^)]+)\)/g, 'Math.cos($1 * Math.PI / 180)')
                 .replace(/tan\(([^)]+)\)/g, 'Math.tan($1 * Math.PI / 180)');
    }

    calculate() {
        const expr = this.mathInput.value.trim();
        if (!expr) return;

        try {
            const result = this.evaluateExpression(expr);
            if (result !== undefined && !isNaN(result)) {
                const formattedResult = this.formatResult(result);
                this.display.textContent = formattedResult;
                this.addToHistory(expr, formattedResult);
                this.lastResult = result;
                this.isResultDisplayed = true;
                this.mathInput.classList.remove('error');
                
                // 在结果前添加角度模式状态
                const modeText = this.angleMode === 'degrees' ? 'deg ' : 'rad ';
                if (this.display.textContent !== '0' && !this.display.textContent.startsWith(modeText)) {
                    this.display.textContent = modeText + this.display.textContent;
                }
            } else {
                throw new Error('计算结果无效');
            }
        } catch (error) {
            this.display.textContent = '错误';
            this.mathInput.classList.add('error');
        }
    }

    formatResult(num) {
        if (num === undefined || isNaN(num)) return '错误';
        
        // 处理极大或极小的数字使用科学计数法
        if (Math.abs(num) > 1e10 || (Math.abs(num) < 1e-10 && num !== 0)) {
            return num.toExponential(8).replace(/(\.\d*?[1-9])0+e/, '$1e');
        }
        
        // 格式化常规数字
        const rounded = Math.round(num * 1e12) / 1e12;
        return rounded.toString();
    }

    addToInput(value) {
        const input = this.mathInput;
        const start = input.selectionStart;
        const end = input.selectionEnd;
        
        // 如果显示的是结果，清空输入框
        if (this.isResultDisplayed && value.match(/[0-9]/)) {
            input.value = '';
            this.isResultDisplayed = false;
        }
        
        input.value = input.value.substring(0, start) + value + input.value.substring(end);
        input.setSelectionRange(start + value.length, start + value.length);
        input.focus();
        this.handleInput();
    }

    clearAll() {
        this.mathInput.value = '';
        this.display.textContent = '0';
        this.mathInput.focus();
        this.mathInput.classList.remove('error');
        this.isResultDisplayed = false;
    }

    backspace() {
        const input = this.mathInput;
        const start = input.selectionStart;
        const end = input.selectionEnd;
        
        if (start === end && start > 0) {
            input.value = input.value.substring(0, start - 1) + input.value.substring(end);
            input.setSelectionRange(start - 1, start - 1);
        } else {
            input.value = input.value.substring(0, start) + input.value.substring(end);
            input.setSelectionRange(start, start);
        }
        this.handleInput();
    }

    addToHistory(expr, result) {
        this.history.unshift({ expr, result, timestamp: new Date().toLocaleTimeString() });
        if (this.history.length > 10) this.history.pop();
        this.renderHistory();
    }

    renderHistory() {
        const list = this.historyList;
        list.innerHTML = this.history.length ? 
            this.history.map(item => `
                <li class="history-item" onclick="calculator.useHistory('${item.expr.replace(/'/g, "\\'")}')">
                    <div class="history-expr">${item.expr}</div>
                    <div class="history-result">= ${item.result}</div>
                    <div class="history-time">${item.timestamp}</div>
                </li>
            `).join('') : 
            '<li class="empty-history">暂无计算历史</li>';
    }

    useHistory(expr) {
        this.mathInput.value = expr;
        this.mathInput.focus();
        this.handleInput();
    }

    clearHistory() {
        this.history = [];
        this.renderHistory();
    }

    toggleAngleMode() {
        this.angleMode = this.angleMode === 'degrees' ? 'radians' : 'degrees';
        this.updateAngleModeButton();
        
        // 重新计算当前表达式
        if (this.mathInput.value.trim()) {
            this.handleInput();
        }
    }

    updateAngleModeButton() {
        const btn = document.getElementById('angle-mode');
        if (btn) {
            btn.textContent = this.angleMode === 'degrees' ? 'deg' : 'rad';
        }
        
        // 在显示框最左侧显示角度模式状态
        const displayText = this.display.textContent;
        if (displayText !== '0' && displayText !== '错误' && displayText !== '函数表达式') {
            const modeText = this.angleMode === 'degrees' ? 'deg ' : 'rad ';
            if (!displayText.startsWith('deg ') && !displayText.startsWith('rad ')) {
                this.display.textContent = modeText + displayText;
            } else if (displayText.startsWith('deg ') && this.angleMode === 'radians') {
                this.display.textContent = 'rad ' + displayText.substring(4);
            } else if (displayText.startsWith('rad ') && this.angleMode === 'degrees') {
                this.display.textContent = 'deg ' + displayText.substring(4);
            }
        }
    }

    handleResize() {
        // 处理窗口大小变化
        this.adjustFontSize();
    }

    adjustFontSize() {
        // 根据显示内容调整字体大小
        const display = this.display;
        const maxWidth = display.clientWidth;
        let fontSize = 32;
        
        display.style.fontSize = fontSize + 'px';
        
        while (display.scrollWidth > maxWidth && fontSize > 16) {
            fontSize--;
            display.style.fontSize = fontSize + 'px';
        }
    }

    // 特殊函数处理
    calculateSquareRoot() {
        this.addToInput('sqrt(');
    }

    calculatePower() {
        this.addToInput('^');
    }

    calculatePi() {
        this.addToInput('π');
    }

    calculateE() {
        this.addToInput('e');
    }

    // 绘图功能
    plotFunction() {
        const expr = this.mathInput.value.trim();
        if (!expr) {
            this.showError('请输入函数表达式！');
            return;
        }

        // 检查表达式是否包含变量
        const vars = expr.match(/[a-zA-Z]/g);
        if (!vars) {
            this.showError('表达式需要包含变量（如x）！');
            return;
        }

        // 在新窗口中打开绘图页面
        const encodedExpr = encodeURIComponent(expr);
        const angleModeParam = encodeURIComponent(this.angleMode);
        window.open(`graph-viewer.html?function=${encodedExpr}&angleMode=${angleModeParam}`, '_blank', 'width=1000,height=700');
    }
}

// 全局函数（用于HTML按钮调用）
function addToInput(value) { 
    if (calculator) calculator.addToInput(value); 
}
function calculate() { 
    if (calculator) calculator.calculate(); 
}
function clearAll() { 
    if (calculator) calculator.clearAll(); 
}
function backspace() { 
    if (calculator) calculator.backspace(); 
}
function plotFunction() { 
    if (calculator) calculator.plotFunction(); 
}
function clearHistory() { 
    if (calculator) calculator.clearHistory(); 
}
function toggleAngleMode() { 
    if (calculator) calculator.toggleAngleMode(); 
}
function handleKeyDown(event) {
    if (calculator) calculator.handleKeyDown(event);
}
function handleEnter(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        calculate();
    }
}

// 初始化计算器
let calculator;
document.addEventListener('DOMContentLoaded', () => {
    calculator = new ScientificCalculator();
});