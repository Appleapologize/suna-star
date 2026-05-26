/* 이름 누르면 밑에 내용 나오는 js (순정 CSS 규칙 연동형 최종본) */
document.addEventListener("DOMContentLoaded", function() {
    // 1. 페이지 내의 모든 h1.timeline-who 요소를 추적합니다.
    const timelineHeadings = document.querySelectorAll("h1.timeline-who");
    
    timelineHeadings.forEach(function(h1) {
        h1.classList.add("timeline-who");

        // 2. 기존 HTML에 적힌 onclick 속성을 무력화하고 자바스크립트 전용 고속 이벤트를 직접 매핑합니다.
        h1.removeAttribute("onclick");
        h1.onclick = function(event) {
            // 다른 투명 레이어나 가림막 요소가 마우스 클릭을 가로채는 현상을 방어합니다.
            event.stopPropagation();

            // 3. 내 h1 바로 다음에 인접해 숨어있는 진짜 전용 p 태그를 정밀 수색합니다.
            var p = this.nextElementSibling;
            while (p && p.tagName !== "P") {
                p = p.nextElementSibling;
            }

            if (p) {
                // 💡 [핵심]: CSS 파일에 적혀있는 !important 차단벽을 정면으로 뚫기 위해 
                // 이미 하단에 선언해두신 강제 노출 스위치인 .active 클래스만 깔끔하게 넣었다 뺐다 토글합니다!
                p.classList.toggle("active");
            }
        };
    });
});
