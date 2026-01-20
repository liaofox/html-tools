// 常用网站维护脚本 - 根据分类添加分隔线
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
            const faviconUrl = `https://icons.duckduckgo.com/ip3/${domain}.ico`;

            item.innerHTML = `
                <img class="site-icon" src="${faviconUrl}" alt="${site.name}" 
                     onerror="this.onerror=null; this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22 color=%22%234a90e2%22>🔗</text></svg>'">
                <span class="site-name">${site.name}</span>
            `;
            grid.appendChild(item);
        });
    });
});