(function() {
    function calculateTableRowSums() {
        const table = document.getElementById("parameters");
        if (!table) return;

        const rows = table.querySelectorAll('tbody tr');

        rows.forEach((row, index) => {
            if (index === 0) return;

            const cells = row.querySelectorAll('td');
            if (cells.length < 2) return;

            let rowTotal = 0;
            for (let i = 0; i < cells.length - 1; i++) {
                const val = parseFloat(cells[i].textContent.trim()) || 0;
                rowTotal += val;
            }

            if (rowTotal === 0) {
                cells[cells.length - 1].textContent = '-';
            } else {
                cells[cells.length - 1].textContent = Number(rowTotal.toFixed(2));
            }
        });

        // 📌 [핵심] 테이블 계산이 완벽히 끝난 순간, 차트 시스템(setupWikiChart)이 존재한다면 강제로 실행시킵니다.
        if (typeof window.setupWikiChart === 'function') {
            window.setupWikiChart();
        }
    }

    // 문서 로드가 완료되면 계산을 시작합니다.
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', calculateTableRowSums);
    } else {
        calculateTableRowSums();
    }
})();
