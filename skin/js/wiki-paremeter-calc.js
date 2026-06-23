    function calculateTableRowSums() {
        const rows = document.querySelectorAll('#parameters tbody tr');

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
                // [안전장치 추가] 컴퓨터 오차를 제거하고 숫자로 다시 변환하여 
                // 소수점 아래 한 자리(15.5)든 두 자리(15.75)든 있는 그대로 깔끔하게 표현합니다.
                cells[cells.length - 1].textContent = Number(rowTotal.toFixed(2));
            }
        });
    }

    document.addEventListener('DOMContentLoaded', calculateTableRowSums);
