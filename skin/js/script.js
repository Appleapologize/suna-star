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

/* 타임라인에서 이름 누르면 밑에 내용 나오는 js  */
    document.addEventListener("click", function(event) {
        const targetWho = event.target.closest(".timeline-who");
        if (targetWho) {
            const parentArticle = targetWho.closest(".timeline-article");
            if (parentArticle) {
                const pContent = parentArticle.querySelector("p");
                if (pContent) {
                    pContent.classList.toggle("active");
                }
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

    const fileName = relativePath.split('/').pop(); // 예: timeline.html
    let pageKey = fileName.split('.')[0];         // 예: timeline

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

                // ★ [경로 교정] 만약 파일명이 timeline이면 실제 파일 서칭 키워드를 교정
                let cssFileKey = pageKey;
                let jsFileKey = pageKey;
                if (pageKey === "timeline") {
                    cssFileKey = "timelineall"; // 실제 서버에 설정된 css 파일명 매칭
                }

                // 3. 동적 CSS 로드 (경로 에러 완벽 차단용 절대경로 처리)
                const cssId = `dynamic-css-${pageKey}`;
                const link = document.createElement('link');
                link.id = cssId; 
                link.rel = 'stylesheet';
                link.href = window.location.origin + `/suna-star/skin/css/${cssFileKey}.css`; 
                link.onerror = () => link.remove(); 
                document.head.appendChild(link);

                // 4. 동적 JS 로드 및 실행 타이밍 제어
                const jsId = `dynamic-js-${pageKey}`;
                const script = document.createElement('script');
                script.id = jsId;
                script.src = window.location.origin + `/suna-star/skin/js/${jsFileKey}.js`; 
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
    // timeline 관련 초기화 함수가 있다면 이곳에 연동
    if (pageKey === 'timeline' && typeof setupMenuLinks === 'function') {
        setupMenuLinks();
    }
}
