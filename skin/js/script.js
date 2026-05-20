let recipeData = []; 
let dict = {}; 

document.addEventListener("DOMContentLoaded", () => {
    // 1. 테마 설정 (다크모드)
    const themeToggleBtn = document.getElementById("theme-toggle-btn");
    if (themeToggleBtn) {
        const savedTheme = localStorage.getItem("theme") || "light";
        document.documentElement.setAttribute("data-theme", savedTheme);

        themeToggleBtn.addEventListener("click", () => {
            const currentTheme = document.documentElement.getAttribute("data-theme");
            const newTheme = currentTheme === "dark" ? "light" : "dark";
            
            document.documentElement.setAttribute("data-theme", newTheme);
            localStorage.setItem("theme", newTheme);
        });
    }

    // 💡 [수정] 무한 루프 에러 방지 및 첫 화면 로드
    // fakeEvent 구조를 완벽히 만들어 에러가 나지 않도록 수정했습니다.
    const fakeEvent = { 
        preventDefault: function() {}, 
        stopPropagation: function() {} 
    };
    loadPage(fakeEvent, './pages/home.html');
});

// 구글 시트 데이터 로드 함수 연동
if (typeof loadSheetData === "function") {
    window.onload = loadSheetData;
}

// 모바일 메뉴 토글 함수
function toggleMobileMenu() {
    const btn = document.getElementById('menu-toggle-btn');
    const drawer = document.getElementById('mobile-drawer');
    
    if (btn && drawer) {
        btn.classList.toggle('active');
        drawer.classList.toggle('active');
    }
}

// ================= 메뉴 관련 js =================

// [기능 1] 다중 드롭다운 메뉴를 열고 닫는 함수
function toggleMenu(event, targetId) {
    if (event) event.stopPropagation(); // 부모 메뉴까지 같이 열리고 닫히는 현상 방지
    const targetMenu = document.getElementById(targetId);
    if (targetMenu) {
        targetMenu.classList.toggle('open');
    }
}

// [기능 2] iframe 없이 외부 HTML 파일을 읽어와서 div에 집어넣는 함수
function loadPage(event, pageUrl) {
    if (event) {
        if (typeof event.preventDefault === 'function') event.preventDefault();
        if (typeof event.stopPropagation === 'function') event.stopPropagation();
    }

    fetch(pageUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('페이지를 불러올 수 없습니다.');
            }
            return response.text();
        })
        .then(htmlData => {
            const contentArea = document.getElementById('content-area');
            if (contentArea) {
                contentArea.innerHTML = htmlData; // div 공간에 내용 주입
            }
        })
        .catch(error => {
            const contentArea = document.getElementById('content-area');
            if (contentArea) {
                contentArea.innerHTML = `<p style="color:red; padding:20px;">⚠️ ${error.message}</p>`;
            }
        });
}
