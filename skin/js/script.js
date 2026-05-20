let recipeData = []; 
let dict = {}; 

// [핵심] 사이트가 켜지자마자 가장 먼저 실행되는 구간
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

    // 💡 처음 로드되었을 때 .container 안에 home.html이 보이도록 강제 호출
    const fakeEvent = { 
        preventDefault: function() {}, 
        stopPropagation: function() {} 
    };
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
    if (event) event.stopPropagation(); 
    const targetMenu = document.getElementById(targetId);
    if (targetMenu) {
        targetMenu.classList.toggle('open');
    }
}

// [기능 2] iframe 없이 외부 HTML 파일을 읽어와서 특정 div에 집어넣는 함수
function loadPage(event, relativePath) {
    if (event) {
        if (typeof event.preventDefault === 'function') event.preventDefault();
        if (typeof event.stopPropagation === 'function') event.stopPropagation();
    }

    // 깃허브 배포 서버의 하위 경로(/suna-star/)를 자동으로 계산하여 절대적인 주소로 변환합니다.
    const baseUrl = window.location.pathname.endsWith('/') ? window.location.pathname : window.location.pathname + '/';
    const cleanPath = relativePath.replace(/^\.\//, ''); 
    const finalUrl = window.location.origin + baseUrl + cleanPath;

    fetch(finalUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`페이지를 불러올 수 없습니다. (상태코드: ${response.status})`);
            }
            return response.text();
        })
        .then(htmlData => {
            // 💡 [핵심 수정] id대신 질문자님의 class="container" 요소를 정확히 찾아내서 주입합니다.
            const contentArea = document.querySelector('.container');
            if (contentArea) {
                contentArea.innerHTML = htmlData; // container 공간에 home.html 내용 주입
                window.scrollTo(0, 0); 
            }
        })
        .catch(error => {
            console.error("Fetch Error:", error);
            const contentArea = document.querySelector('.container');
            if (contentArea) {
                contentArea.innerHTML = `<p style="color:red; padding:20px; font-weight:bold;">⚠️ 에러 발생: ${error.message}<br><span style="font-size:12px; color:#666;">요청 주소: ${finalUrl}</span></p>`;
            }
        });
}
