// 网站收藏夹功能 - 从TXT文件读取

document.addEventListener('DOMContentLoaded', function() {
    // 收藏夹元素
    const bookmarksGrid = document.getElementById('bookmarks-grid');
    const emptyBookmarks = document.getElementById('empty-bookmarks');
    const bookmarksLoading = document.getElementById('bookmarks-loading');
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    // 分类文件夹映射
    const folderNames = {
        'all': '全部',
        'dev': '开发工具',
        'search': '搜索引擎',
        'media': '媒体娱乐',
        'tools': '实用工具',
        'other': '其他'
    };
    
    let bookmarks = [];
    let currentFolder = 'all';
    
    // 从TXT文件加载书签
    async function loadBookmarksFromTxt() {
        try {
            bookmarksLoading.style.display = 'block';
            emptyBookmarks.style.display = 'none';
            bookmarksGrid.innerHTML = '';
            
            // 尝试从bookmarks.txt文件加载
            const response = await fetch('bookmarks.txt');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const text = await response.text();
            bookmarks = parseBookmarksTxt(text);
            
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
    
    // 解析TXT文件
    function parseBookmarksTxt(text) {
        const lines = text.split('\n');
        const bookmarks = [];
        let currentCategory = '';
        
        lines.forEach((line, index) => {
            line = line.trim();
            
            // 跳过空行和注释
            if (!line || line.startsWith('#')) {
                return;
            }
            
            // 检查是否为分类标题
            if (line.startsWith('[') && line.endsWith(']')) {
                currentCategory = line.slice(1, -1);
                return;
            }
            
            // 解析书签行
            const parts = line.split('|');
            if (parts.length >= 2) {
                const name = parts[0].trim();
                const url = parts[1].trim();
                const icon = parts[2] ? parts[2].trim() : 'fas fa-globe';
                const folder = parts[3] ? parts[3].trim() : 'other';
                
                // 验证URL
                try {
                    new URL(url);
                    
                    bookmarks.push({
                        id: Date.now() + index,
                        name,
                        url,
                        icon,
                        folder,
                        category: currentCategory
                    });
                } catch (e) {
                    console.warn(`无效的URL: ${url}`, e);
                }
            }
        });
        
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
                folder: 'dev',
                category: '开发工具'
            },
            {
                id: 2,
                name: 'Google',
                url: 'https://google.com',
                icon: 'fab fa-google',
                folder: 'search',
                category: '搜索引擎'
            },
            {
                id: 3,
                name: 'Stack Overflow',
                url: 'https://stackoverflow.com',
                icon: 'fab fa-stack-overflow',
                folder: 'dev',
                category: '开发工具'
            },
            {
                id: 4,
                name: 'YouTube',
                url: 'https://youtube.com',
                icon: 'fab fa-youtube',
                folder: 'media',
                category: '媒体娱乐'
            },
            {
                id: 5,
                name: 'MDN Web Docs',
                url: 'https://developer.mozilla.org',
                icon: 'fab fa-mdn',
                folder: 'dev',
                category: '开发工具'
            },
            {
                id: 6,
                name: 'Bing',
                url: 'https://bing.com',
                icon: 'fab fa-microsoft',
                folder: 'search',
                category: '搜索引擎'
            },
            {
                id: 7,
                name: '知乎',
                url: 'https://zhihu.com',
                icon: 'fab fa-zhihu',
                folder: 'media',
                category: '媒体娱乐'
            },
            {
                id: 8,
                name: 'Bilibili',
                url: 'https://bilibili.com',
                icon: 'fas fa-play-circle',
                folder: 'media',
                category: '媒体娱乐'
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
        
        // 按分类分组
        const bookmarksByCategory = {};
        filteredBookmarks.forEach(bookmark => {
            const category = bookmark.category || '未分类';
            if (!bookmarksByCategory[category]) {
                bookmarksByCategory[category] = [];
            }
            bookmarksByCategory[category].push(bookmark);
        });
        
        // 渲染每个分类
        Object.keys(bookmarksByCategory).forEach(category => {
            const categoryBookmarks = bookmarksByCategory[category];
            
            // 如果有多个分类且不是"全部"视图，显示分类标题
            if (Object.keys(bookmarksByCategory).length > 1 && currentFolder === 'all') {
                const categoryHeader = document.createElement('div');
                categoryHeader.className = 'category-header';
                categoryHeader.style.gridColumn = 'span 2';
                categoryHeader.style.fontSize = '0.85rem';
                categoryHeader.style.fontWeight = '600';
                categoryHeader.style.color = 'var(--primary-color)';
                categoryHeader.style.marginTop = '10px';
                categoryHeader.style.marginBottom = '5px';
                categoryHeader.style.paddingBottom = '3px';
                categoryHeader.style.borderBottom = '1px solid var(--light-gray)';
                categoryHeader.textContent = category;
                bookmarksGrid.appendChild(categoryHeader);
            }
            
            // 渲染该分类下的所有书签
            categoryBookmarks.forEach(bookmark => {
                const bookmarkElement = createBookmarkElement(bookmark);
                bookmarksGrid.appendChild(bookmarkElement);
            });
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
        
        a.innerHTML = `
            <div class="bookmark-icon">
                <i class="${bookmark.icon || 'fas fa-globe'}"></i>
            </div>
            <div class="bookmark-content">
                <h4>${bookmark.name}</h4>
                <div class="bookmark-folder">${folderNames[bookmark.folder] || '其他'}</div>
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
    loadBookmarksFromTxt();
});