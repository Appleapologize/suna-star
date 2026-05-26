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

    // 💡 이름 누르면 밑에 내용 나오는 js (데스크톱 투명 가림막 먹통 현상 완벽 방어형)
    document.addEventListener("click", function(event) {
        // 1. 마우스가 클릭한 지점의 정확한 좌표(X, Y)를 추출합니다.
        const x = event.clientX;
        const y = event.clientY;
        
        // 2. 해당 좌표 레이어 상에 겹쳐 있는 모든 웹 요소를 배열로 싹 다 긁어옵니다. (투명 가림막 무력화)
        const elementsAtPoint = document.elementsFromPoint(x, y);
        
        let targetWho = null;
        
        // 3. 겹쳐진 요소들 중에서 .timeline-who 클래스를 가진 진짜 목표물이 있는지 수색합니다.
        for (let el of elementsAtPoint) {
            if (el.closest(".timeline-who")) {
                targetWho = el.closest(".timeline-who");
                break;
            }
        }
        
        // 4. 목표 이름표를 찾았다면 주변 구조에 상관없이 내용(<p>)을 찾아 펼쳐줍니다.
        if (targetWho) {
            let pContent = null;

            // [1순위 수색] 바로 인접한 형제 태그 중 <p>를 추적
            let nextEl = targetWho.nextElementSibling;
            while (nextEl) {
                if (nextEl.tagName === "P") {
                    pContent = nextEl;
                    break;
                }
                nextEl = nextEl.nextElementSibling;
            }

            // [2순위 수색] 직계 부모 박스 틀 내부에서 <p>를 탐색
            if (!pContent) {
                const immediateParent = targetWho.parentElement;
                if (immediateParent) {
                    pContent = immediateParent.querySelector("p");
                }
            }

            // [3순위 수색] 타임라인 행 박스(.timeline-article) 구역을 통째로 털어서 <p> 타겟팅
            if (!pContent) {
                const mainArticle = targetWho.closest(".timeline-article");
                if (mainArticle) {
                    pContent = mainArticle.querySelector("p");
                }
            }

            // 최종 매칭 완료된 p 태그의 클래스를 부드럽게 토글 온오프
            if (pContent) {
                pContent.classList.toggle("active");
            }
        }
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
    const pageKey = fileName.split('.')[0]; // 대괄호 문법 제거하고 첫 인덱스 문자열 추출 연산 보정         

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
