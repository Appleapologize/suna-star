let recipeData = []; 
let dict = {}; 

// 쿼리스트링을 주소창에 추가하는 함수
function addQueryString(fileName) {
    const url = new URL(window.location);
    url.searchParams.set('pageName', fileName); 
    window.history.pushState({ pageName: fileName }, '', url); 
}

// [핵심] 사이트가 처음 부팅되자마자 실행되는 통합 구간
document.addEventListener("DOMContentLoaded", () => {
    // 🔒 마우스 우클릭 차단
    document.addEventListener('contextmenu', (event) => {
        event.preventDefault();
    });

    // 테마 설정 (다크모드 토글)
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

    // 💡 text-logo SVG 클릭 시 홈 화면 연결
    const textLogoSvg = document.querySelector('.text-logo');
    if (textLogoSvg) {
        textLogoSvg.style.cursor = 'pointer'; 
        textLogoSvg.addEventListener('click', (event) => {
            loadPage(event, 'pages/home.html'); 
        });
    }

    // 주소창의 쿼리스트링 파라미터 확인 후 초기 페이지 로드
    const params = new URLSearchParams(window.location.search);
    const pageName = params.get('pageName') || 'home.html';
    loadPage(null, `pages/${pageName}`, false);

    // 브라우저 뒤로가기 / 앞으로가기 처리
    window.addEventListener('popstate', function(event) {
        if (event.state && event.state.pageName) {
            loadPage(null, `pages/${event.state.pageName}`, false);
        } else {
            const currentParams = new URLSearchParams(window.location.search);
            const currentPage = currentParams.get('pageName') || 'home.html';
            loadPage(null, `pages/${currentPage}`, false);
        }
    });
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

// 다중 드롭다운 메뉴 제어
function toggleMenu(event, targetId) {
    if (event) event.stopPropagation(); 
    const targetMenu = document.getElementById(targetId);
    if (targetMenu) {
        targetMenu.classList.toggle('open');
    }
}

// 외부 HTML을 불러와서 .container에 주입하는 함수
function loadPage(event, relativePath, addHistory = true) {
    if (event) {
        if (typeof event.preventDefault === 'function') event.preventDefault();
        if (typeof event.stopPropagation === 'function') event.stopPropagation();
    }

    const fileName = relativePath.split('/').pop();
    const baseUrl = window.location.pathname.endsWith('/') ? window.location.pathname : window.location.pathname + '/';
    const finalUrl = window.location.origin + baseUrl + 'pages/' + fileName;

    fetch(finalUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`페이지를 불러올 수 없습니다. (상태코드: ${response.status})`);
            }
            return response.text();
        })
        .then(htmlData => {
            const contentArea = document.querySelector('#container');
            if (contentArea) {
                contentArea.innerHTML = htmlData; 
                window.scrollTo(0, 0); 

                if (addHistory) {
                    addQueryString(fileName);
                }
            }
        })
        .catch(error => {
            console.error("Fetch Error:", error);
            const contentArea = document.querySelector('#container');
            if (contentArea) {
                contentArea.innerHTML = `<p style="color:red; padding:20px; font-weight:bold;">⚠️ 에러 발생: ${error.message}<br><span style="font-size:12px; color:#666;">요청 주소: ${finalUrl}</span></p>`;
            }
        });
}
