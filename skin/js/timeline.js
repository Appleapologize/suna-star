/* 이름 누르면 밑에 내용 나오는 js */
document.addEventListener("DOMContentLoaded", function() {
    // 1. 페이지 내의 모든 h1.timeline-who 요소를 안전하게 스캔합니다.
    const timelineHeadings = document.querySelectorAll("h1.timeline-who");
    
    timelineHeadings.forEach(function(h1) {
        h1.classList.add("timeline-who");

        // 2. [핵심 수정] HTML 속성 대신 브라우저 메모리에 onclick 동작을 직접 강하게 바인딩합니다.
        // 이렇게 하면 함수 위치가 꼬여서 실행되지 않던 현상이 완벽하게 차단됩니다.
        h1.onclick = function(event) {
            // 다른 가림막 레이어가 마우스 클릭을 방해하지 못하게 보호합니다.
            event.stopPropagation();

            // 3. 내 h1 바로 뒤에 인접해 숨어있는 진짜 전용 p 태그를 정밀하게 찾아갑니다.
            var p = this.nextElementSibling;
            while (p && p.tagName !== "P") {
                p = p.nextElementSibling;
            }

            // 4. CSS에서 !important를 빼셨기 때문에, 드디어 이 인라인 display 제어 명령이 화면에 먹히기 시작합니다!
            if (p) {
                if (p.style.display === "none" || p.style.display === "") {
                    p.style.display = "block";
                } else {
                    p.style.display = "none";
                }
            }
        };
    });
});
