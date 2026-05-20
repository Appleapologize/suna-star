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

    // 2. 페이지가 처음 켜졌을 때 메인 화면(home.html)을 자동으로 띄워주는 설정
    const fakeEvent = { preventDefault: () => {}, stopPropagation: () => {} };
    loadPage(fakeEvent, './pages/home.html');
});

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
    event.stopPropagation(); // 부모 메뉴까지 같이 열리고 닫히는 현상 방지
    const targetMenu = document.getElementById(targetId);
    if (targetMenu) {
        targetMenu.classList.toggle('open');
    }
}

// [기능 2] iframe 없이 외부 HTML 파일을 읽어와서 div에 집어넣는 함수
function loadPage(event, pageUrl) {
    event.preventDefault(); // 클릭 시 브라우저가 새 페이지로 이동하는 것을 강제로 막음
    event.stopPropagation(); // 이벤트 전파 방지

    fetch(pageUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('페이지를 불러올 수 없습니다.');
            }
            return response.text(); // 파일 내용을 텍스트 형식으로 변환
        })
        .then(htmlData => {
            const contentArea = document.getElementById('container');
            if (contentArea) {
                contentArea.innerHTML = htmlData; // div 공간에 내용 주입
            }
        })
        .catch(error => {
            const contentArea = document.getElementById('container');
            if (contentArea) {
                contentArea.innerHTML = `<p style="color:red; padding:20px;">⚠️ ${error.message}</p>`;
            }
        });
}
