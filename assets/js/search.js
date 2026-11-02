/* 站内搜索：读取 /tuijianjichang/search.json，在弹窗里搜索页面标题、小标题和正文 */
(function () {
    var INDEX_URL = '/tuijianjichang/search.json?v=20261102-1';
    var MAX_RESULTS = 12;
    var index = null;
    var loading = null;
    var dialog, input, list, status;

    function escapeHtml(s) {
        return s.replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }

    function clean(s) {
        return s
            .replace(/\{\{[^}]*\}\}|\{%[^%]*%\}/g, '')
            .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
            .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
            .replace(/[*_`>|#]+/g, ' ')
            .replace(/-{3,}/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    // 和 kramdown 自动生成锚点的规则一致：去掉标点和表情，转小写，空格换成连字符
    function kramdownId(text) {
        return text.toLowerCase().replace(/[^\p{L}\p{N}\p{M}\s-]/gu, '').replace(/\s/g, '-');
    }

    // 把一页拆成「页首（含 H1）+ 每个 h2/h3 小节」，搜索时可以直接跳到对应位置
    function sectionsFromHtml(html) {
        var doc = new DOMParser().parseFromString('<div>' + html + '</div>', 'text/html');
        doc.querySelectorAll('script, style').forEach(function (el) { el.remove(); });
        var sections = [{ heading: '', id: '', text: '' }];
        var walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
        var node;
        while ((node = walker.nextNode())) {
            if (node.nodeType === 1 && /^H[23]$/.test(node.tagName)) {
                sections.push({ heading: node.textContent.trim(), id: node.id || '', text: '' });
            } else if (node.nodeType === 3 && !node.parentElement.closest('h1, h2, h3')) {
                sections[sections.length - 1].text += node.textContent + ' ';
            }
        }
        return sections;
    }

    function sectionsFromMarkdown(md) {
        md = md.replace(/<style[\s\S]*?<\/style>|<script[\s\S]*?<\/script>/gi, '').replace(/<[^>]+>/g, ' ');
        var sections = [{ heading: '', id: '', text: '' }];
        md.split('\n').forEach(function (line) {
            var m = line.match(/^#{2,3}\s+(.+)$/);
            if (m) {
                sections.push({ heading: clean(m[1]), id: kramdownId(m[1].replace(/\{\{[^}]*\}\}/g, '')), text: '' });
            } else {
                sections[sections.length - 1].text += line + ' ';
            }
        });
        return sections;
    }

    function prepare(pages) {
        return pages.map(function (p) {
            var raw = p.content || '';
            var isHtml = /<(p|h[1-6]|div|ul|table)[\s>]/i.test(raw) && !/^\s*#{1,3}\s/m.test(raw);
            var sections = (isHtml ? sectionsFromHtml(raw) : sectionsFromMarkdown(raw)).map(function (s) {
                return { heading: clean(s.heading), id: s.id, text: clean(s.text) };
            });
            return {
                title: p.title,
                url: p.url,
                description: p.description || '',
                sections: sections,
                lower: {
                    title: p.title.toLowerCase(),
                    description: (p.description || '').toLowerCase()
                }
            };
        });
    }

    function load() {
        if (index) return Promise.resolve(index);
        if (!loading) {
            loading = fetch(INDEX_URL)
                .then(function (r) {
                    if (!r.ok) throw new Error(r.status);
                    return r.json();
                })
                .then(function (pages) {
                    index = prepare(pages);
                    return index;
                })
                .catch(function (err) {
                    loading = null;
                    throw err;
                });
        }
        return loading;
    }

    function snippet(text, terms) {
        var lower = text.toLowerCase();
        var at = -1;
        terms.some(function (t) { at = lower.indexOf(t); return at >= 0; });
        var start = Math.max(0, at - 30);
        var piece = (start > 0 ? '…' : '') + text.slice(start, start + 110) + (start + 110 < text.length ? '…' : '');
        return highlight(piece, terms);
    }

    function highlight(text, terms) {
        var html = escapeHtml(text);
        terms.forEach(function (t) {
            var safe = escapeHtml(t).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            html = html.replace(new RegExp(safe, 'gi'), function (m) { return '<mark>' + m + '</mark>'; });
        });
        return html;
    }

    function search(query) {
        var terms = query.toLowerCase().split(/\s+/).filter(Boolean);
        if (!terms.length) return [];
        var results = [];
        index.forEach(function (page) {
            page.sections.forEach(function (s, i) {
                var heading = s.heading.toLowerCase();
                var text = s.text.toLowerCase();
                var pageText = i === 0 ? page.lower.title + ' ' + page.lower.description : '';
                var all = pageText + ' ' + heading + ' ' + text;
                if (!terms.every(function (t) { return all.indexOf(t) >= 0; })) return;
                var score = 0;
                terms.forEach(function (t) {
                    if (pageText.indexOf(t) >= 0) score += 12;
                    if (heading.indexOf(t) >= 0) score += heading === t ? 20 : 10;
                    if (text.indexOf(t) >= 0) score += 1;
                });
                results.push({ page: page, section: s, top: i === 0, score: score });
            });
        });
        results.sort(function (a, b) { return b.score - a.score; });
        // 同一页最多显示 3 条，避免一页刷满结果
        var perPage = {};
        return results.filter(function (r) {
            perPage[r.page.url] = (perPage[r.page.url] || 0) + 1;
            return perPage[r.page.url] <= 3;
        }).slice(0, MAX_RESULTS).map(function (r) {
            var s = r.section;
            var url = r.page.url + (s.id ? '#' + encodeURIComponent(s.id) : '');
            // 没有锚点的小标题（例如首页卡片标题）跳不过去，就显示页面标题
            var byHeading = !r.top && s.heading && s.id;
            var title = byHeading ? s.heading : r.page.title;
            var where = byHeading ? r.page.title : '';
            var body = r.top && r.page.description ? r.page.description : s.text;
            return { url: url, title: title, where: where, body: body, terms: terms };
        });
    }

    function render() {
        var q = input.value.trim();
        if (!q) {
            list.innerHTML = '';
            status.textContent = '输入品牌名、教程或关键词，例如：飞V、优惠码、IPLC、Clash';
            return;
        }
        if (!index) {
            status.textContent = '正在载入搜索资料…';
            load().then(render, function () {
                status.textContent = '搜索资料载入失败，请稍后再试。';
            });
            return;
        }
        var results = search(q);
        status.textContent = results.length ? '找到 ' + results.length + ' 条结果' : '没有找到「' + q + '」相关的内容，换个关键词试试。';
        list.innerHTML = results.map(function (r) {
            return '<li><a href="' + escapeHtml(r.url) + '">' +
                '<span class="site-search-title">' + highlight(r.title, r.terms) + '</span>' +
                (r.where ? '<span class="site-search-where">' + escapeHtml(r.where) + '</span>' : '') +
                '<span class="site-search-body">' + snippet(r.body, r.terms) + '</span>' +
                '</a></li>';
        }).join('');
    }

    function build() {
        dialog = document.createElement('div');
        dialog.className = 'site-search';
        dialog.hidden = true;
        dialog.innerHTML =
            '<div class="site-search-backdrop" data-search-close></div>' +
            '<div class="site-search-panel" role="dialog" aria-modal="true" aria-label="站内搜索">' +
            '<form class="site-search-form" role="search">' +
            '<label class="site-search-label" for="site-search-input">站内搜索</label>' +
            '<input id="site-search-input" type="search" placeholder="搜索教程、品牌或指南..." autocomplete="off" enterkeyhint="search">' +
            '<button type="button" class="site-search-close" data-search-close aria-label="关闭搜索">✕</button>' +
            '</form>' +
            '<p class="site-search-status" aria-live="polite"></p>' +
            '<ul class="site-search-results"></ul>' +
            '</div>';
        document.body.appendChild(dialog);
        input = dialog.querySelector('input');
        list = dialog.querySelector('.site-search-results');
        status = dialog.querySelector('.site-search-status');

        var timer;
        input.addEventListener('input', function () {
            clearTimeout(timer);
            timer = setTimeout(render, 120);
        });
        dialog.querySelector('form').addEventListener('submit', function (e) {
            e.preventDefault();
            var first = list.querySelector('a');
            if (first) first.click();
        });
        dialog.addEventListener('click', function (e) {
            if (e.target.closest('[data-search-close]')) close();
            else if (e.target.closest('.site-search-results a')) close();
        });
    }

    var lastFocus = null;
    function open(query) {
        if (!dialog) build();
        lastFocus = document.activeElement;
        dialog.hidden = false;
        document.documentElement.classList.add('site-search-open');
        var menu = document.getElementById('mobile-menu');
        if (menu) menu.classList.remove('open');
        if (typeof query === 'string') input.value = query;
        render();
        input.focus();
        input.select();
        load().catch(function () {});
    }

    function close() {
        if (!dialog || dialog.hidden) return;
        dialog.hidden = true;
        document.documentElement.classList.remove('site-search-open');
        if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    document.addEventListener('click', function (e) {
        var trigger = e.target.closest('[data-search-open]');
        if (trigger) {
            e.preventDefault();
            open();
        }
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') close();
        var typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName) || document.activeElement.isContentEditable;
        if ((e.key === '/' && !typing) || (e.key.toLowerCase() === 'k' && (e.ctrlKey || e.metaKey))) {
            e.preventDefault();
            open();
        }
    });

    // 首页 hero 里的搜索框：按「搜索」或回车时打开弹窗并带入关键词
    document.querySelectorAll('.search-box').forEach(function (box) {
        var field = box.querySelector('input');
        var button = box.querySelector('button');
        if (!field) return;
        var go = function (e) {
            if (e) e.preventDefault();
            open(field.value.trim());
        };
        if (button) button.addEventListener('click', go);
        field.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') go(e);
        });
    });
})();
