/* 이름 누르면 밑에 내용 나오는 js */
document.addEventListener("DOMContentLoaded", function() {
    initTimelineEvents();
});

// 외부 로더(script.js)와의 실행 타이밍 꼬임으로 인한 ReferenceError 방지용 전역 안전장치
window.setupMenuLinks = function() {
    initTimelineEvents();
};

function initTimelineEvents() {
    // 1. HTML에 이미 작성되어 있는 h1.timeline-who 요소를 추적하여 가져옵니다.
    const timelineHeadings = document.querySelectorAll("h1.timeline-who");
    
    // 만약 동적 딜레이로 인해 요소를 아직 그리지 못했다면 0.05초 뒤에 재호출하여 안전하게 추적합니다.
    if (timelineHeadings.length === 0) {
        setTimeout(initTimelineEvents, 50);
        return;
    }

    timelineHeadings.forEach(function(h1) {
        // 2. [요청 반영] h1.classList.add 강제 제거 완료!
        // HTML 마크업 속성과 완벽하게 동기화되도록 onclick 핸들러만 깔끔하게 세팅합니다.
        h1.setAttribute("onclick", "toggleVisibility(this)");
    });
}

// 3. HTML의 onclick="toggleVisibility(this)" 명령을 받아 실제로 p 태그를 온오프하는 핵심 함수
function toggleVisibility(element) {
    // h1과 p 태그 사이에 줄바꿈 엔터(공백)나 주석이 끼어있어도 아래로 내려가며 진짜 p 태그만 정확히 찾아냅니다.
    var p = element.nextElementSibling;
    while (p && p.tagName !== "P") {
        p = p.nextElementSibling;
    }
    
    // 4. 포착된 순정 p 태그의 display 속성을 직접 온오프 토글합니다.
    if (p) {
        if (p.style.display === "none" || p.style.display === "") {
            p.style.display = "block";
        } else {
            p.style.display = "none";
        }
    }
}

// 혹시 모를 브라우저 실행 타이밍을 이중으로 가드하기 위한 즉시 발동 조치
if (document.readyState !== "loading") {
    initTimelineEvents();
}
