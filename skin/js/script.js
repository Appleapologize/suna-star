let recipeData = []; 
let dict = {}; 

// 쿼리스트링을 주소창에 추가하는 함수
function addQueryString(fileName) {
    const url = new URL(window.location);
    url.searchParams.set('pageName', fileName); // 파일 이름만 쿼리스트링에 추가
    window.history.pushState({ pageName: fileName }, '', url); // state에 pageName 저장
}

// [핵심] 사이트가 켜지자마자 가장 먼저 실행되는 구간
document.addEventListener("DOMContentLoaded", () => {
    // 🔒 마우스 우클릭(컨텍스트 메뉴)만 차단
    document.addEventListener('contextmenu', (event) => {
        event.preventDefault();
    });

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

    // 2. 주소창의 쿼리스트링 파라미터 확인 후 해당 페이지 로드 (없으면 기본값 home.html)
    const params = new URLSearchParams(window.location.search);
    const pageName = params.get('pageName') || 'home.html';
    
    // 초기 로드 시 쿼리스트링 정보를 가지고 loadPage 호출 (addHistory 파라미터는 false로 설정하여 기록 중복 방지)
    loadPage(null, `pages/${pageName}`, false);

    // 3. 브라우저 뒤로가기 / 앞으로가기 할 때 .container 내용도 함께 연동
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

// ================= 메뉴 관련 js =================

// [기능 1] 다중 드롭다운 메뉴를 열고 닫는 함수
function toggleMenu(event, targetId) {
    if (event) event.stopPropagation(); 
    const targetMenu = document.getElementById(targetId);
    if (targetMenu) {
        targetMenu.classList.toggle('open');
    }
}

// [기능 2] 외부 HTML 파일을 읽어와서 특정 div에 집어넣는 함수 (쿼리스트링 연동 규격 추가)
function loadPage(event, relativePath, addHistory = true) {
    if (event) {
        if (typeof event.preventDefault === 'function') event.preventDefault();
        if (typeof event.stopPropagation === 'function') event.stopPropagation();
    }

    // 파일 이름 추출 (예: 'pages/home.html' -> 'home.html')
    const fileName = relativePath.split('/').pop();

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
            const contentArea = document.querySelector('.container');
            if (contentArea) {
                contentArea.innerHTML = htmlData; // container 공간에 html 내용 주입
                window.scrollTo(0, 0); 

                // 사용자가 메뉴를 '직접 클릭'해서 페이지를 바꾼 경우에만 주소창 역사(History)에 기록 추가
                if (addHistory) {
                    addQueryString(fileName);
                }
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
