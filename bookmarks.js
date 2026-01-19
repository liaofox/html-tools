// 网站收藏夹功能 - 从CSV文件读取

document.addEventListener('DOMContentLoaded', function() {
    // 收藏夹元素
    const bookmarksGrid = document.getElementById('bookmarks-grid');
    const emptyBookmarks = document.getElementById('empty-bookmarks');
    const bookmarksLoading = document.getElementById('bookmarks-loading');
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    // 分类文件夹映射
    const folderNames = {
        'all': '全部',
        '开发': '开发工具',
        '搜索': '搜索引擎',
        '媒体': '媒体娱乐',
        '工具': '实用工具',
        '学习': '学习资源'
    };
    
    let bookmarks = [];
    let currentFolder = 'all';
    
    // 从CSV文件加载书签
    async function loadBookmarksFromCSV() {
        try {
            bookmarksLoading.style.display = 'block';
            emptyBookmarks.style.display = 'none';
            bookmarksGrid.innerHTML = '';
            
            // 尝试从bookmarks.csv文件加载
            const response = await fetch('bookmarks.csv');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const text = await response.text();
            bookmarks = parseBookmarksCSV(text);
            
            // 渲染收藏夹
            renderBookmarks();
            
            bookmarksLoading.style.display = 'none';
            
            if (bookmarks.length === 0) {
                emptyBookmarks.style.display = 'block';
            }
            
        } catch (error) {
            console.error('加载书签失败:', error);
            bookmarksLoading.style.display = 'none';
            emptyBookmarks.style.display = 'block';
            emptyBookmarks.querySelector('p').textContent = '无法加载网站列表，请检查网络连接或文件路径';
            
            // 加载默认书签作为后备
            loadDefaultBookmarks();
        }
    }
    
    // 解析CSV文件
    function parseBookmarksCSV(text) {
        const lines = text.split('\n');
        const bookmarks = [];
        
        // 解析CSV头部
        const headers = lines[0]?.split(',').map(h => h.trim()) || [];
        
        // 检查必要的列
        const nameIndex = headers.indexOf('名称');
        const urlIndex = headers.indexOf('网址');
        const iconIndex = headers.indexOf('图标');
        const folderIndex = headers.indexOf('分类');
        
        if (nameIndex === -1 || urlIndex === -1) {
            console.error('CSV文件格式不正确，缺少必要列');
            return [];
        }
        
        // 解析数据行
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            // 简单的CSV解析（不处理引号和转义）
            const cells = line.split(',');
            if (cells.length < 2) continue;
            
            const name = cells[nameIndex]?.trim() || '';
            const url = cells[urlIndex]?.trim() || '';
            const icon = iconIndex !== -1 ? cells[iconIndex]?.trim() || 'fas fa-globe' : 'fas fa-globe';
            const folder = folderIndex !== -1 ? cells[folderIndex]?.trim() || '其他' : '其他';
            const description = headers.includes('描述') && cells[headers.indexOf('描述')] ? cells[headers.indexOf('描述')].trim() : '';
            
            // 验证URL
            try {
                // 如果URL没有协议，添加https://
                let fullUrl = url;
                if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
                    fullUrl = 'https://' + url;
                }
                
                new URL(fullUrl);
                
                bookmarks.push({
                    id: Date.now() + i,
                    name,
                    url: fullUrl,
                    icon,
                    folder,
                    description
                });
            } catch (e) {
                console.warn(`无效的URL: ${url}`, e);
            }
        }
        
        return bookmarks;
    }
    
    // 加载默认书签（后备方案）
    function loadDefaultBookmarks() {
        bookmarks = [
            {
                id: 1,
                name: 'GitHub',
                url: 'https://github.com',
                icon: 'fab fa-github',
                folder: '开发',
                description: '代码托管平台'
            },
            {
                id: 2,
                name: 'Google',
                url: 'https://google.com',
                icon: 'fab fa-google',
                folder: '搜索',
                description: '搜索引擎'
            },
            {
                id: 3,
                name: 'Stack Overflow',
                url: 'https://stackoverflow.com',
                icon: 'fab fa-stack-overflow',
                folder: '开发',
                description: '编程问答社区'
            },
            {
                id: 4,
                name: 'YouTube',
                url: 'https://youtube.com',
                icon: 'fab fa-youtube',
                folder: '媒体',
                description: '视频分享平台'
            },
            {
                id: 5,
                name: 'MDN Web Docs',
                url: 'https://developer.mozilla.org',
                icon: 'fab fa-mdn',
                folder: '开发',
                description: 'Web技术文档'
            },
            {
                id: 6,
                name: 'Bing',
                url: 'https://bing.com',
                icon: 'fab fa-microsoft',
                folder: '搜索',
                description: '微软搜索引擎'
            },
            {
                id: 7,
                name: '知乎',
                url: 'https://zhihu.com',
                icon: 'fab fa-zhihu',
                folder: '媒体',
                description: '知识分享社区'
            },
            {
                id: 8,
                name: 'Bilibili',
                url: 'https://bilibili.com',
                icon: 'fas fa-play-circle',
                folder: '媒体',
                description: '弹幕视频网站'
            }
        ];
        
        renderBookmarks();
        emptyBookmarks.style.display = 'none';
    }
    
    // 渲染收藏夹
    function renderBookmarks() {
        bookmarksGrid.innerHTML = '';
        
        // 根据当前文件夹过滤书签
        let filteredBookmarks = bookmarks;
        if (currentFolder !== 'all') {
            filteredBookmarks = bookmarks.filter(bookmark => bookmark.folder === currentFolder);
        }
        
        if (filteredBookmarks.length === 0) {
            emptyBookmarks.style.display = 'block';
            return;
        }
        
        emptyBookmarks.style.display = 'none';
        
        // 渲染所有书签
        filteredBookmarks.forEach(bookmark => {
            const bookmarkElement = createBookmarkElement(bookmark);
            bookmarksGrid.appendChild(bookmarkElement);
        });
    }
    
    // 创建书签元素
    function createBookmarkElement(bookmark) {
        const a = document.createElement('a');
        a.className = 'bookmark-item';
        a.href = bookmark.url;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.setAttribute('data-id', bookmark.id);
        a.title = bookmark.description || bookmark.name; // 鼠标悬停时显示描述
        
        a.innerHTML = `
            <div class="bookmark-icon">
                <i class="${bookmark.icon || 'fas fa-globe'}"></i>
            </div>
            <div class="bookmark-content">
                <h4>${bookmark.name}</h4>
                <div class="bookmark-folder">${folderNames[bookmark.folder] || bookmark.folder}</div>
                <div class="bookmark-url">${bookmark.url}</div>
            </div>
        `;
        
        return a;
    }
    
    // 文件夹过滤
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const folder = this.getAttribute('data-folder');
            
            // 更新活动过滤器
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // 更新当前文件夹
            currentFolder = folder;
            
            // 重新渲染收藏夹
            renderBookmarks();
        });
    });
    
    // 初始加载
    loadBookmarksFromCSV();
});