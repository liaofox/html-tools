// 科学计算器 - 完整专业版
class ScientificCalculator {
    constructor() {
        this.display = document.getElementById('display');
        this.mathInput = document.getElementById('math-input');
        this.historyList = document.getElementById('history-list');
        this.graphCanvas = document.getElementById('graph-canvas');
        this.angleMode = 'radians';
        this.history = [];
        this.graph = null;
        this.functions = {
            'sin': Math.sin, 'cos': Math.cos, 'tan': Math.tan,
            'asin': Math.asin, 'acos': Math.acos, 'atan': Math.atan,
            'sqrt': Math.sqrt, 'log': Math.log10, 'ln': Math.log,
            'exp': Math.exp, 'abs': Math.abs, 'floor': Math.floor,
            'ceil': Math.ceil, 'round': Math.round, 'random': Math.random,
            'pow': Math.pow, 'min': Math.min, 'max': Math.max
        };
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderHistory();
        this.initGraph();
        this.mathInput.focus();
    }

    initGraph() {
        const ctx = this.graphCanvas.getContext('2d');
        this.graph = new Chart(ctx, {
            type: 'scatter',
            data: { datasets: [{
                label: 'f(x)', data: [], borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                borderWidth: 2, pointRadius: 0, showLine: true, fill: false
            }]},
            options: {
                responsive: true, maintainAspectRatio: false,
                scales: {
                    x: { type: 'linear', position: 'center', title: { display: true, text: 'x' } },
                    y: { title: { display: true, text: 'y' } }
                },
                plugins: { legend: { display: false }, tooltip: { enabled: false } }
            }
        });
    }

    setupEventListeners() {
        this.mathInput.addEventListener('keydown', (e) => this.handleKeyDown(e));
        this.mathInput.addEventListener('input', () => this.handleInput());
        window.addEventListener('resize', () => this.resizeGraph());
    }

    handleKeyDown(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            this.calculate();
        } else if (e.key === 'Delete' || e.key === 'Backspace') {
            e.preventDefault();
            this.deleteChar();
        }
    }

    handleInput() {
        try {
            const expr = this.mathInput.value.trim();
            if (expr) {
                const result = this.evaluateExpression(expr);
                this.display.textContent = result !== undefined ? this.formatResult(result) : '0';
            } else {
                this.display.textContent = '0';
            }
            this.mathInput.classList.remove('error');
        } catch (error) {
            this.display.textContent = '错误';
            this.mathInput.classList.add('error');
        }
    }

    evaluateExpression(expr) {
        if (!expr) return 0;
        
        // 转换角度模式
        let processed = this.convertAngleMode(expr);
        
        // 替换函数调用
        processed = processed.replace(/([a-zA-Z]+)\(/g, (match, fn) => {
            return this.functions[fn] ? `Math.${fn}(` : match;
        });

        // 替换常数
        processed = processed
            .replace(/π/g, 'Math.PI')
            .replace(/e(?![a-zA-Z])/g, 'Math.E')
            .replace(/\^/g, '**');

        try {
            const result = eval(processed);
            return typeof result === 'number' && isFinite(result) ? result : undefined;
        } catch (error) {
            throw new Error('无效表达式');
        }
    }

    convertAngleMode(expr) {
        if (this.angleMode === 'degrees') {
            return expr
                .replace(/sin\(/g, 'this.degToRad(Math.sin(')
                .replace(/cos\(/g, 'this.degToRad(Math.cos(')
                .replace(/tan\(/g, 'this.degToRad(Math.tan(')
                .replace(/asin\(/g, 'this.radToDeg(Math.asin(')
                .replace(/acos\(/g, 'this.radToDeg(Math.acos(')
                .replace(/atan\(/g, 'this.radToDeg(Math.atan(');
        }
        return expr;
    }

    degToRad(x) { return x * Math.PI / 180; }
    radToDeg(x) { return x * 180 / Math.PI; }

    plotFunction() {
        const expr = this.mathInput.value.trim();
        if (!expr) return alert('请输入函数表达式！');

        const vars = expr.match(/[a-zA-Z]/g);
        if (!vars) return alert('表达式需要包含变量（如x）！');

        const mainVar = vars[0];
        const xValues = [], yValues = [];
        
        for (let x = -10; x <= 10; x += 0.1) {
            try {
                let funcExpr = expr.replace(new RegExp(mainVar, 'gi'), x);
                const y = this.evaluateExpression(funcExpr);
                if (y !== undefined && isFinite(y)) {
                    xValues.push(x);
                    yValues.push(y);
                }
            } catch (e) {
                continue;
            }
        }

        if (xValues.length > 0) {
            this.updateGraph(xValues, yValues, expr);
        } else {
            alert('无法绘制函数图像！');
        }
    }

    updateGraph(xValues, yValues, expr) {
        const data = xValues.map((x, i) => ({x, y: yValues[i]}));
        this.graph.data.datasets[0].data = data;
        this.graph.data.datasets[0].label = expr;
        
        const yMin = Math.min(...yValues);
        const yMax = Math.max(...yValues);
        const yRange = Math.max(Math.abs(yMin), Math.abs(yMax)) * 1.3;
        
        this.graph.options.scales.y.min = -yRange;
        this.graph.options.scales.y.max = yRange;
        this.graph.update();
    }

    formatResult(num) {
        if (Math.abs(num) < 1e-12) return '0';
        if (Math.abs(num) > 1e10 || Math.abs(num) < 1e-10) return num.toExponential(6);
        return Math.round(num * 1e10) / 1e10;
    }

    calculate() {
        const expr = this.mathInput.value.trim();
        if (!expr) return;

        try {
            const result = this.evaluateExpression(expr);
            if (result !== undefined) {
                const formatted = this.formatResult(result);
                this.display.textContent = formatted;
                this.addToHistory(expr, formatted);
            }
        } catch (error) {
            this.display.textContent = '错误';
        }
    }

    addToHistory(expr, result) {
        this.history.unshift({ expr, result });
        if (this.history.length > 10) this.history = this.history.slice(0, 10);
        this.renderHistory();
    }

    renderHistory() {
        const list = this.historyList;
        list.innerHTML = this.history.length ? 
            this.history.map(item => `<li class="history-item">${item.expr} = <span class="history-result">${item.result}</span></li>`).join('') : 
            '<li class="empty-history">暂无计算历史</li>';
    }

    deleteChar() {
        const input = this.mathInput;
        const start = input.selectionStart;
        input.value = input.value.substring(0, start - 1) + input.value.substring(start);
        input.setSelectionRange(start - 1, start - 1);
        this.handleInput();
    }

    clearAll() {
        this.mathInput.value = '';
        this.display.textContent = '0';
        this.mathInput.focus();
        this.clearGraph();
    }

    clearGraph() {
        if (this.graph) {
            this.graph.data.datasets[0].data = [];
            this.graph.update();
        }
    }

    addToInput(value) { 
        this.mathInput.value += value; 
        this.handleInput(); 
        this.mathInput.focus();
    }
}

// 全局函数
function addToInput(value) { calculator.addToInput(value); }
function calculate() { calculator.calculate(); }
function clearAll() { calculator.clearAll(); }
function plotFunction() { calculator.plotFunction(); }
function clearHistory() { calculator.clearHistory(); }

let calculator;
document.addEventListener('DOMContentLoaded', () => { calculator = new ScientificCalculator(); });