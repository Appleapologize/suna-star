/* 이름 누르면 밑에 내용 나오는 js */
document.addEventListener("DOMContentLoaded", function() {
    const timelineHeadings = document.querySelectorAll("h1.timeline-who");
    timelineHeadings.forEach(function(h1) {
        h1.classList.add("timeline-who");

        // onclick 이벤트 핸들러 추가
        h1.setAttribute("onclick", "toggleVisibility(this)");
    });
});

function toggleVisibility(element) {
    var p = element.nextElementSibling;
    
    // 💡 [수정 완료]: CSS의 !important 숨김 자물쇠를 풀기 위해 active 클래스를 넣었다 뺐다 토글합니다!
    if (p && p.tagName === "P") {
        p.classList.toggle("active");
    }
}
