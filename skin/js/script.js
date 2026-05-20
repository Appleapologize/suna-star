let recipeData = []; 
let dict = {}; 

document.addEventListener("DOMContentLoaded", () => {
    const themeToggleBtn = document.getElementById("theme-toggle-btn");
    if (!themeToggleBtn) return;

    const savedTheme = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);

    themeToggleBtn.addEventListener("click", () => {
        const currentTheme = document.documentElement.getAttribute("data-theme");
        const newTheme = currentTheme === "dark" ? "light" : "dark";
        
        document.documentElement.setAttribute("data-theme", newTheme);
        localStorage.setItem("theme", newTheme);
    });
});

window.onload = loadSheetData;

function toggleMobileMenu() {
    const btn = document.getElementById('menu-toggle-btn');
    const drawer = document.getElementById('mobile-drawer');
    
    if (btn && drawer) {
        btn.classList.toggle('active');
        drawer.classList.toggle('active');
    }
}

// ================= 메뉴 관련 js =================

// 메뉴 다중 드롭다운 메뉴 열고 닫는 함수
function toggleMenu(event, targetId) {
    event.stopPropagation(); // 부모 메뉴까지 같이 닫히는 버그 방지
    const targetMenu = document.getElementById(targetId);
    if (targetMenu) {
        targetMenu.classList.toggle('open');
    }
}

// 2. 최종 외부 HTML 파일을 우측 공간에 불러오는 함수
function loadContent(pageUrl) {
    fetch(pageUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('페이지를 불러오는 데 실패했습니다.');
            }
            return response.text();
        })
        .then(htmlData => {
            const contentArea = document.getElementById('content-area');
            if (contentArea) {
                contentArea.innerHTML = htmlData;
            }
        })
        .catch(error => {
            const contentArea = document.getElementById('content-area');
            if (contentArea) {
                contentArea.innerHTML = `<p style="color:red;">${error.message}</p>`;
            }
        });
}
