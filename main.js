// 主JavaScript文件 - 处理通用功能

document.addEventListener('DOMContentLoaded', function() {
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
        });
    });
    
    // 页脚链接
    document.getElementById('report-issue').addEventListener('click', function(e) {
        e.preventDefault();
        showNotification('反馈功能即将上线', 'info');
    });
    
    // 通知函数
    window.showNotification = function(message, type = 'info') {
        // 移除现有通知
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // 创建通知
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        
        notification.innerHTML = `
            <i class="fas fa-${icons[type] || 'info-circle'}"></i>
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
    };
    
    // 添加通知样式
    const notificationStyle = document.createElement('style');
    notificationStyle.textContent = `
        .notification {
            position: fixed;
            top: 15px;
            right: 15px;
            padding: 10px 14px;
            border-radius: 6px;
            color: white;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 8px;
            z-index: 10000;
            box-shadow: 0 3px 10px rgba(0, 0, 0, 0.15);
            transform: translateX(100%);
            opacity: 0;
            transition: transform 0.3s ease, opacity 0.3s ease;
            max-width: 280px;
            font-size: 0.85rem;
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
});