// 网站收藏夹功能 - 从CSV文件读取，自动获取favicon

document.addEventListener('DOMContentLoaded', function() {
    // 收藏夹容器
    const bookmarksContainer = document.getElementById('bookmarks-container');
    const emptyBookmarks = document.getElementById('empty-bookmarks');
    const bookmarksLoading = document.getElementById('bookmarks-loading');
    
    // 分类顺序和显示名称
    const categoryOrder = ['软件', '工具', '开发', '娱乐'];
    const categoryNames = {
        '软件': '软件',
        '工具': '工具',
        '开发': '开发',
        '娱乐': '娱乐'
    };
    
    let bookmarks = [];
    
    // 从CSV文件加载书签
    async function loadBookmarksFromCSV() {
        try {
            bookmarksLoading.style.display = 'block';
            emptyBookmarks.style.display = 'none';
            bookmarksContainer.innerHTML = '';
            
            // 尝试从bookmarks.csv文件加载
            const response = await fetch('bookmarks.csv');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const text = await response.text();
            bookmarks = parseBookmarksCSV(text);
            
            // 渲染收藏夹
            await renderBookmarksByCategory();
            
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
        } finally {
            // 调整左右两侧高度
            if (window.adjustHeights) {
                setTimeout(window.adjustHeights, 100);
            }
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
        const categoryIndex = headers.indexOf('类别');
        
        if (nameIndex === -1 || urlIndex === -1 || categoryIndex === -1) {
            console.error('CSV文件格式不正确，缺少必要列');
            return [];
        }
        
        // 解析数据行
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            // 简单的CSV解析（不处理引号和转义）
            const cells = line.split(',').map(cell => cell.trim());
            if (cells.length < 3) continue;
            
            const name = cells[nameIndex] || '';
            const url = cells[urlIndex] || '';
            const category = cells[categoryIndex] || '其他';
            
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
                    category
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
                category: '开发'
            },
            {
                id: 2,
                name: 'VS Code',
                url: 'https://code.visualstudio.com',
                category: '软件'
            },
            {
                id: 3,
                name: 'Google',
                url: 'https://google.com',
                category: '工具'
            },
            {
                id: 4,
                name: 'YouTube',
                url: 'https://youtube.com',
                category: '娱乐'
            }
        ];
        
        renderBookmarksByCategory();
        emptyBookmarks.style.display = 'none';
        
        // 调整左右两侧高度
        if (window.adjustHeights) {
            setTimeout(window.adjustHeights, 100);
        }
    }
    
    // 获取网站的favicon
    function getFaviconUrl(url) {
        try {
            const urlObj = new URL(url);
            const domain = urlObj.hostname;
            
            // 使用DuckDuckGo的favicon服务
            return `https://icons.duckduckgo.com/ip3/${domain}.ico`;
        } catch (e) {
            console.error('获取favicon URL失败:', e);
            // 返回一个默认的favicon
            return 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🔗</text></svg>';
        }
    }
    
    // 按分类渲染收藏夹
    async function renderBookmarksByCategory() {
        bookmarksContainer.innerHTML = '';
        
        if (bookmarks.length === 0) {
            emptyBookmarks.style.display = 'block';
            return;
        }
        
        emptyBookmarks.style.display = 'none';
        
        // 按分类分组
        const bookmarksByCategory = {};
        bookmarks.forEach(bookmark => {
            const category = bookmark.category;
            if (!bookmarksByCategory[category]) {
                bookmarksByCategory[category] = [];
            }
            bookmarksByCategory[category].push(bookmark);
        });
        
        // 按照指定的分类顺序渲染
        for (const category of categoryOrder) {
            const categoryBookmarks = bookmarksByCategory[category];
            if (!categoryBookmarks || categoryBookmarks.length === 0) {
                continue;
            }
            
            // 创建分类板块
            const categorySection = document.createElement('div');
            categorySection.className = 'category-section';
            
            const categoryTitle = document.createElement('h3');
            categoryTitle.className = 'category-title';
            categoryTitle.textContent = categoryNames[category] || category;
            categorySection.appendChild(categoryTitle);
            
            const categoryGrid = document.createElement('div');
            categoryGrid.className = 'category-grid';
            
            // 渲染该分类下的所有书签
            for (const bookmark of categoryBookmarks) {
                const bookmarkElement = await createBookmarkElement(bookmark);
                categoryGrid.appendChild(bookmarkElement);
            }
            
            categorySection.appendChild(categoryGrid);
            bookmarksContainer.appendChild(categorySection);
        }
    }
    
    // 创建书签元素
    async function createBookmarkElement(bookmark) {
        const a = document.createElement('a');
        a.className = 'bookmark-item';
        a.href = bookmark.url;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.setAttribute('data-id', bookmark.id);
        a.title = bookmark.name;
        
        // 获取favicon URL
        const faviconUrl = getFaviconUrl(bookmark.url);
        
        a.innerHTML = `
            <div class="bookmark-icon">
                <img src="${faviconUrl}" alt="${bookmark.name}" onerror="this.onerror=null; this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🔗</text></svg>';">
            </div>
            <div class="bookmark-name">${bookmark.name}</div>
        `;
        
        // 预加载favicon，避免显示问题
        const img = a.querySelector('img');
        if (img) {
            await new Promise((resolve) => {
                img.onload = resolve;
                img.onerror = resolve;
            });
        }
        
        return a;
    }
    
    // 初始加载
    loadBookmarksFromCSV();
});