// 网站收藏夹功能

document.addEventListener('DOMContentLoaded', function() {
    // 收藏夹元素
    const addBookmarkBtn = document.getElementById('add-bookmark');
    const importBookmarksBtn = document.getElementById('import-bookmarks');
    const exportBookmarksBtn = document.getElementById('export-bookmarks');
    const selectAllBtn = document.getElementById('select-all');
    const deleteSelectedBtn = document.getElementById('delete-selected');
    const addBookmarkModal = document.getElementById('add-bookmark-modal');
    const importModal = document.getElementById('import-modal');
    const saveBookmarkBtn = document.getElementById('save-bookmark');
    const bookmarkForm = document.getElementById('bookmark-form');
    const bookmarksGrid = document.getElementById('bookmarks-grid');
    const emptyBookmarks = document.getElementById('empty-bookmarks');
    const confirmImportBtn = document.getElementById('confirm-import');
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    // 分类文件夹映射
    const folderNames = {
        'all': '全部',
        'dev': '开发',
        'search': '搜索',
        'media': '媒体',
        'tools': '工具',
        'other': '其他'
    };
    
    // 分类文件夹图标
    const folderIcons = {
        'dev': 'fas fa-code',
        'search': 'fas fa-search',
        'media': 'fas fa-play-circle',
        'tools': 'fas fa-tools',
        'other': 'fas fa-folder'
    };
    
    // 加载收藏夹
    let bookmarks = JSON.parse(localStorage.getItem('toolboxBookmarks')) || [
        {
            id: 1,
            name: 'GitHub',
            url: 'https://github.com',
            folder: 'dev',
            icon: 'fab fa-github'
        },
        {
            id: 2,
            name: 'Google',
            url: 'https://google.com',
            folder: 'search',
            icon: 'fab fa-google'
        },
        {
            id: 3,
            name: 'Stack Overflow',
            url: 'https://stackoverflow.com',
            folder: 'dev',
            icon: 'fab fa-stack-overflow'
        },
        {
            id: 4,
            name: 'MDN Web Docs',
            url: 'https://developer.mozilla.org',
            folder: 'dev',
            icon: 'fab fa-mdn'
        },
        {
            id: 5,
            name: 'YouTube',
            url: 'https://youtube.com',
            folder: 'media',
            icon: 'fab fa-youtube'
        },
        {
            id: 6,
            name: 'Bing',
            url: 'https://bing.com',
            folder: 'search',
            icon: 'fab fa-microsoft'
        },
        {
            id: 7,
            name: '知乎',
            url: 'https://zhihu.com',
            folder: 'media',
            icon: 'fab fa-zhihu'
        },
        {
            id: 8,
            name: 'V2EX',
            url: 'https://v2ex.com',
            folder: 'dev',
            icon: 'fas fa-comments'
        }
    ];
    
    let currentFolder = 'all';
    let selectedBookmarks = new Set(); // 存储选中的书签ID
    
    // 渲染收藏夹
    function renderBookmarks() {
        bookmarksGrid.innerHTML = '';
        selectedBookmarks.clear();
        updateDeleteButton();
        
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
        
        filteredBookmarks.forEach(bookmark => {
            const bookmarkElement = createBookmarkElement(bookmark);
            bookmarksGrid.appendChild(bookmarkElement);
        });
        
        // 保存到localStorage
        localStorage.setItem('toolboxBookmarks', JSON.stringify(bookmarks));
    }
    
    // 创建书签元素
    function createBookmarkElement(bookmark) {
        const div = document.createElement('div');
        div.className = 'bookmark-item';
        div.setAttribute('data-id', bookmark.id);
        
        div.innerHTML = `
            <input type="checkbox" class="bookmark-checkbox" data-id="${bookmark.id}">
            <div class="bookmark-icon">
                <i class="${bookmark.icon || 'fas fa-globe'}"></i>
            </div>
            <div class="bookmark-content">
                <h4>${bookmark.name}</h4>
                <div class="bookmark-folder">${folderNames[bookmark.folder] || '其他'}</div>
                <a href="${bookmark.url}" target="_blank" class="bookmark-url">${bookmark.url}</a>
            </div>
        `;
        
        // 添加事件监听器
        const checkbox = div.querySelector('.bookmark-checkbox');
        const link = div.querySelector('.bookmark-url');
        
        checkbox.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleBookmarkSelection(bookmark.id);
        });
        
        div.addEventListener('click', (e) => {
            if (e.target !== checkbox && !e.target.closest('a')) {
                checkbox.checked = !checkbox.checked;
                toggleBookmarkSelection(bookmark.id);
            }
        });
        
        link.addEventListener('click', (e) => {
            e.stopPropagation();
            // 链接已通过target="_blank"打开，无需额外处理
        });
        
        return div;
    }
    
    // 切换书签选择状态
    function toggleBookmarkSelection(id) {
        if (selectedBookmarks.has(id)) {
            selectedBookmarks.delete(id);
        } else {
            selectedBookmarks.add(id);
        }
        
        // 更新UI
        const bookmarkItem = document.querySelector(`.bookmark-item[data-id="${id}"]`);
        if (bookmarkItem) {
            bookmarkItem.classList.toggle('selected', selectedBookmarks.has(id));
        }
        
        updateDeleteButton();
        updateSelectAllButton();
    }
    
    // 更新删除按钮状态
    function updateDeleteButton() {
        const hasSelected = selectedBookmarks.size > 0;
        deleteSelectedBtn.disabled = !hasSelected;
        
        if (hasSelected) {
            deleteSelectedBtn.innerHTML = `<i class="fas fa-trash-alt"></i> 删除选中(${selectedBookmarks.size})`;
        } else {
            deleteSelectedBtn.innerHTML = `<i class="fas fa-trash-alt"></i> 删除选中`;
        }
    }
    
    // 更新全选按钮状态
    function updateSelectAllButton() {
        const filteredBookmarks = currentFolder === 'all' 
            ? bookmarks 
            : bookmarks.filter(b => b.folder === currentFolder);
        
        const allSelected = filteredBookmarks.length > 0 && 
                           filteredBookmarks.every(b => selectedBookmarks.has(b.id));
        
        const selectAllIcon = selectAllBtn.querySelector('i');
        if (allSelected) {
            selectAllBtn.innerHTML = `<i class="far fa-check-square"></i> 全选`;
        } else {
            selectAllBtn.innerHTML = `<i class="far fa-square"></i> 全选`;
        }
    }
    
    // 添加书签
    addBookmarkBtn.addEventListener('click', () => {
        // 重置表单
        bookmarkForm.reset();
        document.getElementById('bookmark-folder').value = 'dev';
        document.getElementById('bookmark-icon').value = 'fas fa-globe';
        
        // 显示模态框
        addBookmarkModal.classList.add('active');
    });
    
    // 保存书签
    saveBookmarkBtn.addEventListener('click', () => {
        const name = document.getElementById('bookmark-name').value.trim();
        const url = document.getElementById('bookmark-url').value.trim();
        const folder = document.getElementById('bookmark-folder').value;
        const icon = document.getElementById('bookmark-icon').value;
        
        if (!name || !url) {
            showNotification('请填写网站名称和地址', 'warning');
            return;
        }
        
        // 验证URL格式
        try {
            new URL(url);
        } catch {
            showNotification('请输入有效的URL地址', 'error');
            return;
        }
        
        const newBookmark = {
            id: Date.now(),
            name,
            url,
            folder,
            icon
        };
        
        bookmarks.unshift(newBookmark);
        renderBookmarks();
        
        // 关闭模态框
        addBookmarkModal.classList.remove('active');
        showNotification('网站已添加到收藏夹', 'success');
    });
    
    // 导入收藏夹
    importBookmarksBtn.addEventListener('click', () => {
        importModal.classList.add('active');
        updateImportPreview([]);
    });
    
    // 处理HTML文件导入
    document.getElementById('html-import').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(event) {
            const htmlContent = event.target.result;
            const importedBookmarks = parseBookmarksHTML(htmlContent);
            updateImportPreview(importedBookmarks);
        };
        reader.readAsText(file);
    });
    
    // 处理JSON文件导入
    document.getElementById('json-import').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(event) {
            try {
                const importedBookmarks = JSON.parse(event.target.result);
                updateImportPreview(importedBookmarks);
            } catch (error) {
                showNotification('JSON文件格式错误', 'error');
            }
        };
        reader.readAsText(file);
    });
    
    // 解析HTML书签文件
    function parseBookmarksHTML(html) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const links = doc.querySelectorAll('a');
        const importedBookmarks = [];
        
        links.forEach((link, index) => {
            const name = link.textContent.trim();
            const url = link.getAttribute('href');
            
            if (name && url && url.startsWith('http')) {
                // 尝试根据URL判断分类
                let folder = 'other';
                if (url.includes('github.com') || url.includes('stackoverflow.com')) {
                    folder = 'dev';
                } else if (url.includes('google.com') || url.includes('bing.com')) {
                    folder = 'search';
                } else if (url.includes('youtube.com') || url.includes('bilibili.com')) {
                    folder = 'media';
                }
                
                importedBookmarks.push({
                    id: Date.now() + index,
                    name,
                    url,
                    folder,
                    icon: 'fas fa-globe'
                });
            }
        });
        
        return importedBookmarks;
    }
    
    // 更新导入预览
    function updateImportPreview(bookmarks) {
        const previewList = document.getElementById('preview-list');
        const previewCount = document.getElementById('preview-count');
        
        previewList.innerHTML = '';
        previewCount.textContent = bookmarks.length;
        
        if (bookmarks.length === 0) {
            confirmImportBtn.disabled = true;
            return;
        }
        
        confirmImportBtn.disabled = false;
        
        bookmarks.forEach(bookmark => {
            const div = document.createElement('div');
            div.className = 'preview-item';
            div.innerHTML = `
                <input type="checkbox" checked data-id="${bookmark.id}">
                <div class="preview-item-content">
                    <h5>${bookmark.name}</h5>
                    <p>${bookmark.url}</p>
                </div>
            `;
            previewList.appendChild(div);
        });
        
        // 存储预览数据
        previewList.dataset.previewData = JSON.stringify(bookmarks);
    }
    
    // 确认导入
    confirmImportBtn.addEventListener('click', () => {
        const previewList = document.getElementById('preview-list');
        const checkboxes = previewList.querySelectorAll('input[type="checkbox"]:checked');
        const previewData = JSON.parse(previewList.dataset.previewData || '[]');
        
        const importedBookmarks = [];
        checkboxes.forEach(checkbox => {
            const id = parseInt(checkbox.getAttribute('data-id'));
            const bookmark = previewData.find(b => b.id === id);
            if (bookmark) {
                importedBookmarks.push(bookmark);
            }
        });
        
        // 添加到现有书签
        bookmarks = [...importedBookmarks, ...bookmarks];
        renderBookmarks();
        
        // 关闭模态框
        importModal.classList.remove('active');
        showNotification(`成功导入 ${importedBookmarks.length} 个网站`, 'success');
        
        // 清理文件输入
        document.getElementById('html-import').value = '';
        document.getElementById('json-import').value = '';
    });
    
    // 导出收藏夹
    exportBookmarksBtn.addEventListener('click', () => {
        if (bookmarks.length === 0) {
            showNotification('收藏夹为空，无需导出', 'info');
            return;
        }
        
        const dataStr = JSON.stringify(bookmarks, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `toolbox-bookmarks-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showNotification(`已导出 ${bookmarks.length} 个书签`, 'success');
    });
    
    // 全选/取消全选
    selectAllBtn.addEventListener('click', function() {
        const filteredBookmarks = currentFolder === 'all' 
            ? bookmarks 
            : bookmarks.filter(b => b.folder === currentFolder);
        
        const allCurrentlySelected = filteredBookmarks.every(b => selectedBookmarks.has(b.id));
        
        if (allCurrentlySelected) {
            // 取消全选
            filteredBookmarks.forEach(bookmark => {
                selectedBookmarks.delete(bookmark.id);
                const bookmarkItem = document.querySelector(`.bookmark-item[data-id="${bookmark.id}"]`);
                if (bookmarkItem) {
                    bookmarkItem.classList.remove('selected');
                    const checkbox = bookmarkItem.querySelector('.bookmark-checkbox');
                    if (checkbox) checkbox.checked = false;
                }
            });
        } else {
            // 全选
            filteredBookmarks.forEach(bookmark => {
                selectedBookmarks.add(bookmark.id);
                const bookmarkItem = document.querySelector(`.bookmark-item[data-id="${bookmark.id}"]`);
                if (bookmarkItem) {
                    bookmarkItem.classList.add('selected');
                    const checkbox = bookmarkItem.querySelector('.bookmark-checkbox');
                    if (checkbox) checkbox.checked = true;
                }
            });
        }
        
        updateDeleteButton();
        updateSelectAllButton();
    });
    
    // 删除选中书签
    deleteSelectedBtn.addEventListener('click', function() {
        if (selectedBookmarks.size === 0) return;
        
        if (confirm(`确定要删除选中的 ${selectedBookmarks.size} 个网站吗？`)) {
            // 过滤掉选中的书签
            bookmarks = bookmarks.filter(bookmark => !selectedBookmarks.has(bookmark.id));
            selectedBookmarks.clear();
            renderBookmarks();
            showNotification(`已删除 ${selectedBookmarks.size} 个网站`, 'success');
        }
    });
    
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
    
    // 初始渲染
    renderBookmarks();
});