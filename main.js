// 头部滚动动画 - 参考5ilr.com风格
// 下滑时隐藏，上滑时显示，带延迟效果

document.addEventListener('DOMContentLoaded', function() {
    const header = document.querySelector('header');
    let lastScrollTop = 0;
    let ticking = false;
    let hideTimeout = null;
    
    // 滚动阈值，超过此值才触发隐藏
    const SCROLL_THRESHOLD = 10;
    // 延迟时间（毫秒）
    const HIDE_DELAY = 100;
    
    function updateHeaderVisibility() {
        const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // 向下滚动且超过阈值
        if (currentScrollTop > lastScrollTop + SCROLL_THRESHOLD && currentScrollTop > 60) {
            // 延迟隐藏
            hideTimeout = setTimeout(function() {
                header.classList.add('scroll-hide');
            }, HIDE_DELAY);
        } 
        // 向上滚动
        else if (currentScrollTop < lastScrollTop - SCROLL_THRESHOLD) {
            // 立即显示
            if (hideTimeout) {
                clearTimeout(hideTimeout);
                hideTimeout = null;
            }
            header.classList.remove('scroll-hide');
        }
        
        lastScrollTop = currentScrollTop <= 0 ? 0 : currentScrollTop;
        ticking = false;
    }
    
    // 使用requestAnimationFrame优化性能
    window.addEventListener('scroll', function() {
        if (!ticking) {
            requestAnimationFrame(function() {
                updateHeaderVisibility();
            });
            ticking = true;
        }
    }, { passive: true });
    
    // 鼠标移动时显示头部
    var mouseHideTimeout = null;
    document.addEventListener('mousemove', function() {
        if (header.classList.contains('scroll-hide')) {
            header.classList.remove('scroll-hide');
            
            // 移动后延迟隐藏
            if (mouseHideTimeout) {
                clearTimeout(mouseHideTimeout);
            }
            mouseHideTimeout = setTimeout(function() {
                var currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
                if (currentScrollTop > 60) {
                    header.classList.add('scroll-hide');
                }
            }, 2000);
        }
    }, { passive: true });
});