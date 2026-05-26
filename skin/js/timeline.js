<!-- 이름 누르면 밑에 내용 나오는 js (순정 CSS 규격 연동형) -->
<script>
document.addEventListener("DOMContentLoaded", function() {
    const timelineHeadings = document.querySelectorAll("h1.timeline-who");
    timelineHeadings.forEach(function(h1) {
        h1.classList.add("timeline-who");
        // 원래 제공해주신 온클릭 핸들러 등록 구조를 그대로 적용합니다.
        h1.setAttribute("onclick", "toggleVisibility(this)");
    });
});

function toggleVisibility(element) {
    // 클릭한 h1 바로 다음에 있는 진짜 p 태그를 타겟팅합니다.
    var p = element.nextElementSibling;
    
    if (p && p.tagName === "P") {
        // 💡 핵심: !important 차단벽을 뚫기 위해 CSS 하단에 이미 선언해두신 active 클래스를 넣어줍니다.
        p.classList.toggle("active");
    }

    // [데스크톱 좌우 높이 실시간 동기화 구간]
    var article = element.closest(".timeline-article");
    if (article) {
        var leftBox = article.querySelector(".content-left");
        var rightBox = article.querySelector(".content-right");

        // 데스크톱 해상도(700px 초과) 조건에서만 작동하도록 제한합니다.
        if (leftBox && rightBox && window.innerWidth > 700) {
            // 높이를 다시 정확히 계산하기 위해 일시적으로 값을 초기화합니다.
            leftBox.style.height = "auto";
            rightBox.style.height = "auto";

            // 좌우 진영 내부의 알맹이 내용물 전체를 포함한 실제 물리적 높이(scrollHeight)를 측정합니다.
            var leftTrueHeight = leftBox.scrollHeight;
            var rightTrueHeight = rightBox.scrollHeight;

            // 두 박스의 진짜 내부 세로 길이 중 가장 긴 최대 픽셀 값을 추출합니다.
            var maxHeight = Math.max(leftTrueHeight, rightTrueHeight);

            // 한쪽 박스가 길어지거나 줄어들어도 양쪽 공간의 세로 높이가 완벽히 1:1 대칭을 이루도록 고정합니다.
            leftBox.style.setProperty("height", maxHeight + "px", "important");
            rightBox.style.setProperty("height", maxHeight + "px", "important");
        } else {
            // 모바일 화면(700px 이하)에서는 높이 고정을 풀고 본연의 흐름대로 복구시킵니다.
            if (leftBox) leftBox.style.setProperty("height", "auto", "important");
            if (rightBox) rightBox.style.setProperty("height", "auto", "important");
        }
    }
}
</script>
