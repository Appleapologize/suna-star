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

    // 💡 [수정] 무한 루프 에러 방지 및 첫 화면(home.html) 로드
    const fakeEvent = { 
        preventDefault: function() {}, 
        stopPropagation: function() {} 
    };
    // 메인 홈 화면을 안전하게 로드합니다.
    loadPage(fakeEvent, 'pages/home.html');
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
    if (event) event.stopPropagation(); // 부모 메뉴 클릭 시 전파 방지
    const targetMenu = document.getElementById(targetId);
    if (targetMenu) {
        targetMenu.classList.toggle('open');
    }
}

// [기능 2] iframe 없이 외부 HTML 파일을 읽어와서 div에 집어넣는 함수
function loadPage(event, relativePath) {
    if (event) {
        if (typeof event.preventDefault === 'function') event.preventDefault();
        if (typeof event.stopPropagation === 'function') event.stopPropagation();
    }

    // 💡 [핵심 수정] 깃허브 서브디렉토리 주소 문제 완벽 해결 로직
    // 주소창의 base path(/suna-star/)를 자동으로 계산하여 절대적인 주소로 fetch 요청을 보냅니다.
    const baseUrl = window.location.pathname.endsWith('/') ? window.location.pathname : window.location.pathname + '/';
    const cleanPath = relativePath.replace(/^\.\//, ''); // 앞에 붙은 ./ 제거
    const finalUrl = window.location.origin + baseUrl + cleanPath;

    fetch(finalUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`페이지를 불러올 수 없습니다. (상태코드: ${response.status})`);
            }
            return response.text();
        })
        .then(htmlData => {
            const contentArea = document.getElementById('container');
            if (contentArea) {
                contentArea.innerHTML = htmlData; // div 공간에 내용 주입
                
                // 💡 추가 팁: 내용물을 바꾼 후 스크롤을 맨 위로 올려줍니다.
                window.scrollTo(0, 0); 
            }
        })
        .catch(error => {
            console.error("Fetch Error:", error);
            const contentArea = document.getElementById('container');
            if (contentArea) {
                contentArea.innerHTML = `<p style="color:red; padding:20px; font-weight:bold;">⚠️ 에러 발생: ${error.message}<br><span style="font-size:12px; color:#666;">요청 주소: ${finalUrl}</span></p>`;
            }
        });
}
