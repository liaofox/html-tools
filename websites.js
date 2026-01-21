// 常用网站维护脚本 - 改进图标获取功能
document.addEventListener('DOMContentLoaded', function() {
    const websitesData = [
        {
            category: '开发平台',
            sites: [
                { name: '工作区 - Visual Studio Code', url: 'https://vscode.dev/?vscode-lang=zh-cn' },
                { name: '我的仓库', url: 'https://github.com/liaofox?tab=repositories' },
                { name: 'Microsoft 合作伙伴中心 - 主页', url: 'https://partner.microsoft.com/zh-cn/dashboard/home' },
                { name: 'Freepik | All-in-One AI Creative Suite', url: 'https://www.freepik.com/' },
                { name: '工具集合 - 东风电驱动开发工具箱', url: 'https://m19901105k.github.io/' },
                { name: '一元机场', url: 'https://cloud.xn--4gq62f52gdss.asia/#/dashboard' }
            ]
        },
        {
            category: '媒体娱乐',
            sites: [
                { name: 'Z2S 极空间', url: 'https://www.zconnect.cn/home/' },
                { name: 'ＰＴ之友俱乐部 :: 种子', url: 'https://pterclub.net/torrents.php' },
                { name: 'BTSCHOOL :: 种子 比特校园PT小乐园', url: 'https://pt.btschool.club/torrents.php' },
                { name: 'HAIDAN :: 种子 海胆之家', url: 'https://www.haidan.video/torrents.php' },
                { name: '织梦 :: 种子', url: 'https://zmpt.cc/torrents.php' }
            ]
        },
        {
            category: '工具软件',
            sites: [
                { name: '原版软件', url: 'https://next.itellyou.cn/Original/Index' },
                { name: 'Ventoy', url: 'https://www.ventoy.net/cn/' },
                { name: 'FastStone Capture注册码', url: 'https://blog.csdn.net/testManger/article/details/142490927' },
                { name: 'Microsoft Activation Scripts (MAS)', url: 'https://massgrave.dev/#download--how-to-use-it' },
                { name: 'Mocreak - 一键安装 Office', url: 'https://www.mocreak.com/' },
                { name: 'Office Tool Plus | 一键部署 Office', url: 'https://otp.landian.vip/zh-cn/' },
                { name: 'Quicker软件 - 您的指尖工具箱', url: 'https://getquicker.net/' },
                { name: 'AnyTXT Searcher', url: 'https://anytxt.net/download/' },
                { name: 'voidtools', url: 'http://www.voidtools.com/' },
                { name: '小恐龙公文排版助手 for Word/WPS', url: 'https://gw.xkonglong.com/#/' },
                { name: 'WinRAR／7-Zip', url: 'https://423down.lanzouo.com/b105455' },
                { name: 'EasyTier - 简单安全的异地组网方案', url: 'https://easytier.rs/' },
                { name: 'Clash Meta for Android', url: 'https://clashmetaforandroid.com/' },
                { name: 'clash-verge-rev', url: 'https://github.com/clash-verge-rev/clash-verge-rev/releases' },
                { name: '梁Sir贴吧云签到', url: 'https://tieba.5sir.cn/' },
                { name: 'cangquyun.com', url: 'https://www.cangquyun.com/content?menuId=1984568704674959360' },
                { name: 'ZeroTier Central', url: 'https://my.zerotier.com/' },
                { name: '谷谷GGGIS地图下载器', url: 'http://gggis.com/' },
                { name: '一键AI绘画 - 专业AI绘画生成软件', url: 'https://www.xunjieshipin.com/aihuihuapc' },
                { name: '我的坚果云', url: 'https://www.jianguoyun.com/#/' },
                { name: '出去走走', url: 'http://8.140.250.130/bushu/' },
                { name: 'PhET 互动教学仿真程序', url: 'https://oef.org.cn/PhET/' },
                { name: '5ilr绿软-靠谱软件下载网', url: 'https://www.5ilr.com/' },
                { name: 'Windows - 软件个锤子', url: 'https://www.rjgcz.com/windows' },
                { name: '纸由我 PaperMe - 自定义打印纸生成器', url: 'https://paperme.toolooz.com/' },
                { name: 'Umi-OCR 发行版', url: 'https://github.com/hiroi-sora/Umi-OCR/releases' },
                { name: 'GIGABYTE Z690I AORUS ULTRA LITE', url: 'https://www.gigabyte.cn/Motherboard/Z690I-AORUS-ULTRA-LITE-rev-10/support#support-dl' },
                { name: 'QuickLook', url: 'https://github.com/QL-Win/QuickLook/releases' },
                { name: 'FastStone - Download', url: 'https://www.faststone.org/download.htm' }
            ]
        }
    ];

    const grid = document.getElementById('websites-grid');
    grid.innerHTML = '';

    websitesData.forEach((categoryData, index) => {
        if (index > 0) {
            const separator = document.createElement('div');
            separator.className = 'separator-thin';
            grid.appendChild(separator);
        }

        categoryData.sites.forEach(site => {
            const item = document.createElement('a');
            item.className = 'website-item';
            item.href = site.url;
            item.target = '_blank';
            item.rel = 'noopener noreferrer';
            item.title = site.name;

            const domain = new URL(site.url).hostname;
            // 国内优先的favicon获取策略
            const faviconUrls = [
                // 1. 直接从网站获取favicon（最快最可靠）
                `https://${domain}/favicon.ico`,
                // 2. 国内CDN服务
                `https://api.byi.pw/favicon/?url=${encodeURIComponent(site.url)}`,
                `https://favicon.cccyun.cc/${encodeURIComponent(domain)}`,
                // 3. 国际通用服务作为后备
                `https://www.google.com/s2/favicons?sz=64&domain=${encodeURIComponent(domain)}`
            ];

            // 创建一个图片预加载和回退机制
            const img = document.createElement('img');
            img.className = 'site-icon';
            img.alt = site.name;
            // 设置加载错误的回退图标和默认图标
            const defaultIcon = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iMTIiIGZpbGw9IiM0YTkwZTIiIGZpbGwtb3BhY2l0eT0iMC4xIi8+Cjx0ZXh0IHg9IjMyIiB5PSIzOCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1zaXplPSIyNCIgZm9udC13ZWlnaHQ9IjYwMCIgZmlsbD0iIzRhOTBlMiI+8J+OqzwvdGV4dD4KPC9zdmc+';
            
            // 智能加载favicon
            let currentIndex = 0;
            const tryLoadFavicon = () => {
                if (currentIndex < faviconUrls.length) {
                    img.src = faviconUrls[currentIndex];
                    currentIndex++;
                } else {
                    img.src = defaultIcon;
                }
            };

            img.onerror = tryLoadFavicon;
            img.onload = function() {
                // 验证是否是有效的favicon（过滤小尺寸图标）
                if (this.naturalWidth <= 16 || this.naturalHeight <= 16) {
                    this.onerror();
                }
            };

            // 开始加载第一个favicon
            tryLoadFavicon();

            const nameSpan = document.createElement('span');
            nameSpan.className = 'site-name';
            nameSpan.textContent = site.name;

            item.appendChild(img);
            item.appendChild(nameSpan);
            grid.appendChild(item);
        });
    });
});