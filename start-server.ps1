# 启动Web开发服务器
$port = 8000
$hostAddress = "http://localhost:$port"

Write-Host "=========================================="
Write-Host "  工具集合站 - 开发服务器"
Write-Host "=========================================="
Write-Host ""
Write-Host "正在启动服务器..."
Write-Host "访问地址: $hostAddress"
Write-Host ""
Write-Host "按 Ctrl+C 停止服务器"
Write-Host "=========================================="
Write-Host ""

# 检查端口是否被占用
$portInUse = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
if ($portInUse) {
    Write-Host "警告: 端口 $port 已被占用，尝试使用其他端口..." -ForegroundColor Yellow
    $port = 8080
    $hostAddress = "http://localhost:$port"
    Write-Host "新访问地址: $hostAddress" -ForegroundColor Green
}

# 使用Python启动HTTP服务器
$pythonCmd = "python"
if (-not (Get-Command $pythonCmd -ErrorAction SilentlyContinue)) {
    $pythonCmd = "python3"
}

try {
    & $pythonCmd -m http.server $port --directory .
    Start-Sleep -Seconds 1
    Write-Host ""
    Write-Host "✓ 服务器已启动!" -ForegroundColor Green
    Write-Host "请在浏览器中访问: $hostAddress" -ForegroundColor Cyan
} catch {
    Write-Host "错误: 无法启动Python服务器" -ForegroundColor Red
    Write-Host "请确保已安装Python" -ForegroundColor Yellow
}