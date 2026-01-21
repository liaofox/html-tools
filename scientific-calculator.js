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
        if (!this.display) this.display = document.getElementById('display');
        if (!this.modeIndicator) this.modeIndicator = document.getElementById('mode-indicator');
        if (!this.mathInput) {
            this.mathInput = document.getElementById('math-input');
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
            // 移除数字处理，防止重复
        }
    }

    handleGlobalKeyDown(e) {
        // 只处理全局Enter键
        if (e.key === 'Enter' && document.activeElement !== this.mathInput) {
            e.preventDefault();
            this.calculate();
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
        // 更精确的变量检测：先识别标识符，排除函数名和常数后判断是否存在变量（如 x, y）
        if (!expr) return false;

        const mathConstants = new Set(['e', 'pi', 'π']);
        const mathFunctions = new Set(['sin','cos','tan','cot','sec','csc','asin','acos','atan','acot',
                                       'sqrt','log','ln','exp','abs','floor','ceil','round','random']);

        // 提取所有连续字母标识符（函数名、常数、变量）
        const identifiers = expr.match(/\b[a-zA-Z\u03C0]+\b/g) || [];

        for (const id of identifiers) {
            const lower = id.toLowerCase();
            if (mathConstants.has(lower)) continue;      // 忽略常数
            if (mathFunctions.has(lower)) continue;      // 忽略函数名
            // 单字母标识符视作变量（如 x, y）；多字母未在函数/常数中也视为变量
            if (lower.length === 1) return true;
            // 也将其他非函数非常数标识符当作变量
            return true;
        }

        // 进一步检查函数内参数是否包含变量（例如 sin(x)）
        const functionArgs = expr.match(/[a-zA-Z]+\(([^)]*)\)/g) || [];
        for (const fn of functionArgs) {
            const content = fn.replace(/^[a-zA-Z]+\(([^)]*)\)$/, '$1');
            const argIds = content.match(/\b[a-zA-Z\u03C0]+\b/g) || [];
            for (const a of argIds) {
                const la = a.toLowerCase();
                if (mathConstants.has(la)) continue;
                if (mathFunctions.has(la)) continue;
                if (la.length === 1) return true;
                return true;
            }
        }

        return false;
    }

    validateExpression(expr) {
        if (!expr) return;
        
        // 允许 π 字符（unicode \u03C0）
        const mathExprPattern = /^[\d+\-*/().^a-zA-Z\u03C0\s]+$/;
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
        
        // 检查函数调用格式（增加 cot/sec/csc/acot/random）
        if (expr.match(/[a-zA-Z]+\d*\(/)) {
            const validFunctions = ['sin','cos','tan','cot','sec','csc','asin','acos','atan','acot',
                                    'sqrt','log','ln','exp','abs','floor','ceil','round','random'];
            const functions = expr.match(/[a-zA-Z]+\(/g) || [];
            for (const fn of functions) {
                const funcName = fn.replace('(', '').toLowerCase();
                if (!validFunctions.includes(funcName)) {
                    throw new Error(`无效函数: ${funcName}`);
                }
            }
        }
    }

    convertToRadians(expr) {
        // 将角度转换为弧度（三角函数）
        let processed = expr
            .replace(/sin\(([^)]+)\)/g, 'Math.sin($1 * Math.PI / 180)')
            .replace(/cos\(([^)]+)\)/g, 'Math.cos($1 * Math.PI / 180)')
            .replace(/tan\(([^)]+)\)/g, 'Math.tan($1 * Math.PI / 180)');
        
        // 反三角函数：将弧度结果转换为角度
        processed = processed
            .replace(/asin\(([^)]+)\)/g, 'Math.asin($1) * 180 / Math.PI')
            .replace(/acos\(([^)]+)\)/g, 'Math.acos($1) * 180 / Math.PI')
            .replace(/atan\(([^)]+)\)/g, 'Math.atan($1) * 180 / Math.PI');
        
        return processed;
    }

    // 生成用于 eval 的表达式（处理常数、幂、三角/反三角、cot/sec/csc/acot）
    buildEvalExpr(expr) {
        let s = expr;
        s = s.replace(/π/g, 'Math.PI').replace(/\bpi\b/g, 'Math.PI').replace(/e(?![a-zA-Z])/g, 'Math.E').replace(/\^/g, '**');

        // 根据角度模式处理正/反三角、cot/sec/csc/acot
        if (this.angleMode === 'degrees') {
            // 反三角：输出角度
            s = s.replace(/asin\(([^)]+)\)/g, '(Math.asin($1) * 180 / Math.PI)')
                 .replace(/acos\(([^)]+)\)/g, '(Math.acos($1) * 180 / Math.PI)')
                 .replace(/atan\(([^)]+)\)/g, '(Math.atan($1) * 180 / Math.PI)')
                 .replace(/acot\(([^)]+)\)/g, '(Math.atan(1/($1)) * 180 / Math.PI)');

            // 正三角：参数从度转弧度
            s = s.replace(/sin\(([^)]+)\)/g, 'Math.sin(($1) * Math.PI / 180)')
                 .replace(/cos\(([^)]+)\)/g, 'Math.cos(($1) * Math.PI / 180)')
                 .replace(/tan\(([^)]+)\)/g, 'Math.tan(($1) * Math.PI / 180)')
                 .replace(/cot\(([^)]+)\)/g, '(1/Math.tan(($1) * Math.PI / 180))')
                 .replace(/sec\(([^)]+)\)/g, '(1/Math.cos(($1) * Math.PI / 180))')
                 .replace(/csc\(([^)]+)\)/g, '(1/Math.sin(($1) * Math.PI / 180))');
        } else {
            // radians: 直接映射到 Math
            s = s.replace(/asin\(([^)]+)\)/g, 'Math.asin($1)')
                 .replace(/acos\(([^)]+)\)/g, 'Math.acos($1)')
                 .replace(/atan\(([^)]+)\)/g, 'Math.atan($1)')
                 .replace(/acot\(([^)]+)\)/g, 'Math.atan(1/($1))');

            s = s.replace(/sin\(([^)]+)\)/g, 'Math.sin($1)')
                 .replace(/cos\(([^)]+)\)/g, 'Math.cos($1)')
                 .replace(/tan\(([^)]+)\)/g, 'Math.tan($1)')
                 .replace(/cot\(([^)]+)\)/g, '(1/Math.tan($1))')
                 .replace(/sec\(([^)]+)\)/g, '(1/Math.cos($1))')
                 .replace(/csc\(([^)]+)\)/g, '(1/Math.sin($1))');
        }

        // 对数与其他函数
        s = s.replace(/\blog\(/g, 'Math.log10(')
             .replace(/\bln\(/g, 'Math.log(')
             .replace(/\bsqrt\(/g, 'Math.sqrt(')
             .replace(/\bexp\(/g, 'Math.exp(')
             .replace(/\babs\(/g, 'Math.abs(')
             .replace(/\brandom\(/g, 'Math.random(');

        return s;
    }

    // 为 math.js 构建表达式（支持 deg 单位与反三角转度）
    buildMathJsExpr(expr) {
        let s = expr;
        s = s.replace(/π/g, 'pi').replace(/\bpi\b/g, 'pi').replace(/e(?![a-zA-Z])/g, 'e');

        // 对数
        s = s.replace(/\blog\(/g, 'log10(').replace(/\bln\(/g, 'log(');

        if (this.angleMode === 'degrees') {
            s = s.replace(/asin\(([^)]+)\)/g, '(asin($1) * 180 / pi)')
                 .replace(/acos\(([^)]+)\)/g, '(acos($1) * 180 / pi)')
                 .replace(/atan\(([^)]+)\)/g, '(atan($1) * 180 / pi)')
                 .replace(/acot\(([^)]+)\)/g, '(atan(1/($1)) * 180 / pi)');

            s = s.replace(/sin\(([^)]+)\)/g, 'sin($1 deg)')
                 .replace(/cos\(([^)]+)\)/g, 'cos($1 deg)')
                 .replace(/tan\(([^)]+)\)/g, 'tan($1 deg)')
                 .replace(/cot\(([^)]+)\)/g, '(1/tan($1 deg))')
                 .replace(/sec\(([^)]+)\)/g, '(1/cos($1 deg))')
                 .replace(/csc\(([^)]+)\)/g, '(1/sin($1 deg))');
        } else {
            s = s.replace(/asin\(([^)]+)\)/g, 'asin($1)')
                 .replace(/acos\(([^)]+)\)/g, 'acos($1)')
                 .replace(/atan\(([^)]+)\)/g, 'atan($1)')
                 .replace(/acot\(([^)]+)\)/g, 'atan(1/($1))');

            s = s.replace(/sin\(([^)]+)\)/g, 'sin($1)')
                 .replace(/cos\(([^)]+)\)/g, 'cos($1)')
                 .replace(/tan\(([^)]+)\)/g, 'tan($1)')
                 .replace(/cot\(([^)]+)\)/g, '(1/tan($1))')
                 .replace(/sec\(([^)]+)\)/g, '(1/cos($1))')
                 .replace(/csc\(([^)]+)\)/g, '(1/sin($1))');
        }

        return s;
    }

    evaluateExpression(expr) {
        if (!expr.trim()) return 0;

        try {
            // 优先使用 math.js（更稳定和高精度）
            if (this.math) {
                try {
                    const mathExpr = this.buildMathJsExpr(expr);
                    return this.math.evaluate(mathExpr);
                } catch (mathError) {
                    console.warn('Math.js计算失败，回退eval:', mathError);
                }
            }

            // eval 回退路径（浏览器原生）
            const safeExpr = this.buildEvalExpr(expr);
            // eslint-disable-next-line no-eval
            const result = eval(safeExpr);
            return typeof result === 'number' ? result : undefined;
        } catch (error) {
            throw new Error('无效的数学表达式');
        }
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
        
        // 处理非常接近0的数值
        if (Math.abs(num) < 1e-10) return '0';
        
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
        // 检查是否与上一条记录相同（连续重复）
        const isConsecutiveDuplicate = this.history.length > 0 && 
            this.history[0].expr === expr && 
            this.history[0].result === result;
        
        if (!isConsecutiveDuplicate) {
            this.history.unshift({ 
                expr, 
                result, 
                timestamp: new Date().toLocaleTimeString('zh-CN', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                })
            });
            
            // 限制历史记录最多100条
            if (this.history.length > 100) {
                this.history = this.history.slice(0, 100);
            }
            
            this.renderHistory();
        }
    }

    renderHistory() {
        const list = this.historyList;
        list.innerHTML = this.history.length ? 
            this.history.map(item => `
                <li class="history-item" onclick="calculator.useHistory('${item.expr.replace(/'/g, "\\'")}')">
                    <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px; font-family: 'Courier New', monospace;">
                        <span style="flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                            ${item.expr} = ${item.result}
                        </span>
                        <span style="color: #999; font-size: 10px; margin-left: 8px;">
                            ${item.timestamp}
                        </span>
                    </div>
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
        
        // 更新左侧指示器
        if (this.modeIndicator) {
            this.modeIndicator.textContent = this.angleMode === 'degrees' ? 'deg' : 'rad';
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
	if (calculator) {
		calculator.addToInput(value);
		return;
	}
	// 回退：直接修改输入框
	try {
		const input = document.getElementById('math-input');
		if (!input) return;
		const start = input.selectionStart ?? input.value.length;
		const end = input.selectionEnd ?? start;
		input.value = input.value.substring(0, start) + value + input.value.substring(end);
		input.setSelectionRange(start + value.length, start + value.length);
		input.focus();
		// 简单触发输入显示（尝试用基本替换显示结果）
		simpleHandleInput();
	} catch (e) {
		console.error('addToInput 回退失败', e);
	}
}
function calculate() { 
	if (calculator) { calculator.calculate(); return; }
	// 回退：简单计算（支持 π、pi、^、log、ln）
	try {
		const input = document.getElementById('math-input');
		const display = document.getElementById('display');
		if (!input || !display) return;
		const expr = (input.value || '').trim();
		if (!expr) return;
		const s = simpleBuildEval(expr);
		// eslint-disable-next-line no-eval
		const result = eval(s);
		display.textContent = (typeof result === 'number' ? (Math.abs(result) < 1e-10 ? '0' : (Math.round(result * 1e12)/1e12).toString()) : '错误');
	} catch (e) {
		console.error('回退计算失败', e);
		const display = document.getElementById('display');
		if (display) display.textContent = '错误';
	}
}
function clearAll() { 
	if (calculator) { calculator.clearAll(); return; }
	const input = document.getElementById('math-input');
	const display = document.getElementById('display');
	if (input) input.value = '';
	if (display) display.textContent = '0';
}
function backspace() { 
	if (calculator) { calculator.backspace(); return; }
	const input = document.getElementById('math-input');
	if (!input) return;
	const start = input.selectionStart ?? input.value.length;
	const end = input.selectionEnd ?? start;
	if (start === end && start > 0) {
		input.value = input.value.substring(0, start - 1) + input.value.substring(end);
		input.setSelectionRange(start - 1, start - 1);
	} else {
		input.value = input.value.substring(0, start) + input.value.substring(end);
		input.setSelectionRange(start, start);
	}
	simpleHandleInput();
}
function plotFunction() { 
	if (calculator) { calculator.plotFunction(); return; }
	// 回退：尝试打开绘图页面（基本传参）
	const input = document.getElementById('math-input');
	if (!input || !input.value.trim()) return alert('请输入函数表达式以绘图');
	const encodedExpr = encodeURIComponent(input.value.trim());
	window.open(`graph-viewer.html?function=${encodedExpr}&angleMode=degrees`, '_blank', 'width=1000,height=700');
}
function clearHistory() { 
	if (calculator) { calculator.clearHistory(); return; }
	const list = document.getElementById('history-list');
	if (list) list.innerHTML = '<li class="empty-history">暂无计算历史</li>';
}
function toggleAngleMode() { 
	if (calculator) { calculator.toggleAngleMode(); return; }
	// 回退：切换 mode 指示
	const el = document.getElementById('mode-indicator');
	if (!el) return;
	el.textContent = (el.textContent === 'deg') ? 'rad' : 'deg';
}
function handleKeyDown(event) {
	if (calculator) { calculator.handleKeyDown(event); return; }
	// 回退：仅处理 Enter => 计算
	if (event.key === 'Enter') {
		event.preventDefault();
		calculate();
	}
}
function handleEnter(event) {
	if (event.key === 'Enter') {
		event.preventDefault();
		calculate();
	}
}

// 简单回退方法：构建基本 eval 表达式（用于没有 calculator 时的临时计算，功能较弱但能应急）
function simpleBuildEval(expr) {
	let s = expr;
	s = s.replace(/π/g, 'Math.PI').replace(/\bpi\b/gi, 'Math.PI').replace(/\^/g, '**');
	s = s.replace(/\blog\(/gi, 'Math.log10(').replace(/\bln\(/gi, 'Math.log(');
	// 三角函数（默认为度模式时，参数以度输入转换为弧度；无法区分当前角度模式时假设deg）
	const modeEl = document.getElementById('mode-indicator');
	const mode = modeEl ? (modeEl.textContent === 'rad' ? 'radians' : 'degrees') : 'degrees';
	if (mode === 'degrees') {
		s = s.replace(/sin\(([^)]+)\)/gi, 'Math.sin(($1) * Math.PI / 180)')
			 .replace(/cos\(([^)]+)\)/gi, 'Math.cos(($1) * Math.PI / 180)')
			 .replace(/tan\(([^)]+)\)/gi, 'Math.tan(($1) * Math.PI / 180)')
			 .replace(/asin\(([^)]+)\)/gi, '(Math.asin($1) * 180 / Math.PI)')
			 .replace(/acos\(([^)]+)\)/gi, '(Math.acos($1) * 180 / Math.PI)')
			 .replace(/atan\(([^)]+)\)/gi, '(Math.atan($1) * 180 / Math.PI)');
	} else {
		s = s.replace(/sin\(([^)]+)\)/gi, 'Math.sin($1)')
			 .replace(/cos\(([^)]+)\)/gi, 'Math.cos($1)')
			 .replace(/tan\(([^)]+)\)/gi, 'Math.tan($1)')
			 .replace(/asin\(([^)]+)\)/gi, 'Math.asin($1)')
			 .replace(/acos\(([^)]+)\)/gi, 'Math.acos($1)')
			 .replace(/atan\(([^)]+)\)/gi, 'Math.atan($1)');
	}
	// 其他
	s = s.replace(/\bexp\(/gi, 'Math.exp(').replace(/\bsqrt\(/gi, 'Math.sqrt(').replace(/\babs\(/gi, 'Math.abs(');
	return s;
}

// 简单输入处理：当没有 calculator 时，输入变化做基础显示
function simpleHandleInput() {
	const input = document.getElementById('math-input');
	const display = document.getElementById('display');
	if (!input || !display) return;
	const expr = input.value.trim();
	if (!expr) { display.textContent = '0'; return; }
	try {
		const s = simpleBuildEval(expr);
		// eslint-disable-next-line no-eval
		const result = eval(s);
		if (typeof result === 'number') {
			display.textContent = (Math.abs(result) < 1e-10) ? '0' : (Math.round(result * 1e12) / 1e12).toString();
		} else {
			display.textContent = '错误';
		}
	} catch (e) {
		display.textContent = '错误';
	}
}

// 初始化计算器
let calculator;
document.addEventListener('DOMContentLoaded', () => {
	try {
		calculator = new ScientificCalculator();
	} catch (initError) {
		console.error('ScientificCalculator 初始化失败：', initError);
		// 尝试回退：仍然让页面按钮可用（见下方全局函数回退）
		calculator = null;
	}
});