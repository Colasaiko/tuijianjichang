/* 手机上把表格改成一行一张卡片：给每格加上表头文字，空白的「-」格在手机上隐藏 */
(function () {
    document.querySelectorAll('.ap-page table').forEach(function (table) {
        var labels = Array.prototype.map.call(table.querySelectorAll('thead th'), function (th) {
            return th.textContent.trim();
        });
        if (!labels.length) return;
        table.querySelectorAll('tbody tr').forEach(function (tr) {
            Array.prototype.forEach.call(tr.children, function (td, i) {
                td.setAttribute('data-label', labels[i] || '');
                if (/^[-—–]?$/.test(td.textContent.trim())) td.classList.add('is-empty');
            });
        });
        table.classList.add('ap-stack');
    });
})();
