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

    // 💡 이름 누르면 밑에 내용 나오는 js (데스크톱 좌우 개별 차단 보강)
    document.addEventListener("click", function(event) {
        const targetWho = event.target.closest(".timeline-who");
        if (targetWho) {
            // 구조 변경: 무조건 클릭한 .timeline-who 바로 다음에 인접한 p 태그를 먼저 수색합니다.
            let pContent = targetWho.nextElementSibling;
            
            // 만약 h1과 p 사이에 다른 무언가(시간 태그 등)가 들어가 있다면, 
            // 부모 안에서 p를 찾되 큰 묶음이 아닌 '가장 인접한 개별 자식 영역' 내에서만 찾도록 우회합니다.
            if (!pContent || pContent.tagName !== "P") {
                const parentBlock = targetWho.parentElement;
                if (parentBlock) {
                    pContent = parentBlock.querySelector("p");
                }
            }
            
            // 최종 매칭된 하나의 p 태그만 정확하게 액티브 처리
            if (pContent) {
                pContent.classList.toggle("active");
            }
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
    const pageKey = fileName.split('.')[0];         

    // GitHub Pages 경로 버그 방지 고정 주소
    const finalUrl = window.location.origin + '/suna-star/pages/' + fileName;

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
                // [💥 대청소 구간] 기존 동적 태그 제거
                document.querySelectorAll('link[id^="dynamic-css-"]').forEach(el => el.remove());
                document.querySelectorAll('script[id^="dynamic-js-"]').forEach(el => el.remove());
                
                if (window.galleryInterval) {
                    clearInterval(window.galleryInterval);
                    window.galleryInterval = null;
                }

                // 2. 새로운 HTML 화면에 바인딩
                contentArea.innerHTML = htmlData; 
                window.scrollTo(0, 0); 

                // 3. 동적 CSS 로드 (삼중 방어막: timeline 및 timelineall 대응)
                const cssId = `dynamic-css-${pageKey}`;
                const link = document.createElement('link');
                link.id = cssId; 
                link.rel = 'stylesheet';
                link.href = window.location.origin + `/suna-star/skin/css/${pageKey}.css`; 
                
                link.onerror = () => {
                    link.onerror = () => link.remove(); 
                    link.href = window.location.origin + `/suna-star/skin/css/timelineall.css`;
                }; 
                document.head.appendChild(link);

                // 4. 동적 JS 로드 및 실행 타이밍 제어
                const jsId = `dynamic-js-${pageKey}`;
                const script = document.createElement('script');
                script.id = jsId;
                script.src = window.location.origin + `/suna-star/skin/js/${pageKey}.js`; 
                script.onerror = () => script.remove(); 
                
                script.onload = () => {
                    executePageInit(pageKey);
                };
                document.body.appendChild(script);

                if (addHistory) { 
                    addQueryString(fileName); 
                }
            }
        })
        .catch(error => {
            console.error("Fetch Error:", error);
            const contentArea = document.querySelector('#container');
            if (contentArea) {
                contentArea.innerHTML = `<p style="color:red; padding:20px; font-weight:bold;">⚠️ 에러 발생: ${error.message}</p>`;
            }
        });
}

// 파일별 초기화 함수를 매핑해서 실행해주는 헬퍼 함수
function executePageInit(pageKey) {
    if (pageKey === 'gallery' && typeof initGallery === 'function') {
        initGallery();
    }
    if (pageKey === 'timeline' && typeof setupMenuLinks === 'function') {
        setupMenuLinks();
    }
}
