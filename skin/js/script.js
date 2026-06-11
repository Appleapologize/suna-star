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
        // 🔒 2. [추가] 개발자 도구 단축키 차단 (F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U)
    /*document.addEventListener('keydown', (event) => {
        if (
            event.key === 'F12' || 
            (event.ctrlKey && event.shiftKey && (event.key === 'I' || event.key === 'J' || event.key === 'i' || event.key === 'j')) || 
            (event.ctrlKey && (event.key === 'U' || event.key === 'u'))
        ) {
            event.preventDefault();
            return false;
        }
    });*/

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

// 외부 HTML을 불러와서 #container에 주입하는 함수
function loadPage(event, relativePath, addHistory = true) {
    if (event) {
        if (typeof event.preventDefault === 'function') event.preventDefault();
        if (typeof event.stopPropagation === 'function') event.stopPropagation();
    }

 // 앞의 './'가 붙어있다면 제거해서 깔끔한 경로로 만듭니다.
 let cleanPath = relativePath;
 if (cleanPath.startsWith('./')) {
   cleanPath = cleanPath.substring(2); // './pages/wiki/...' -> 'pages/wiki/...'
 }
    if (cleanPath.startsWith('pages/')) {
        cleanPath = cleanPath.substring(6);
    }    

let finalUrl = '';
    if (cleanPath.startsWith('http') || cleanPath.startsWith('/')) {
        finalUrl = cleanPath;
    } else {
        finalUrl = window.location.origin + '/suna-star/pages/' + cleanPath;
    }

    // 4. 초기화 함수 처리를 위한 순수 파일명 추출
    const fileName = cleanPath.split('/').pop(); 

    // 5. [# 자국 강제 제거] 브라우저 이동을 방해하지 않고 주소창 맨 뒤의 #만 투명하게 지워버립니다.
 if (window.location.hash === '#' || window.location.href.endsWith('#')) {
     // replaceState의 첫 번째 인자를 null로 주어 브라우저 데이터 충돌을 원천 차단합니다.
     const cleanURL = window.location.href.split('#')[0];
     window.history.replaceState(null, '', cleanURL);
 }



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
                // 1. [💥 진짜 대청소 구간] 기존에 추가되었던 동적 CSS 및 JS 완전 제거
                document.querySelectorAll('.dynamic-blog-css, .dynamic-blog-js').forEach(el => el.remove());
                
                if (window.galleryInterval) {
                    clearInterval(window.galleryInterval);
                    window.galleryInterval = null;
                }

                // 2. DOM Parser를 사용해 문자열 데이터를 가상 HTML 객체로 파싱
                const parser = new DOMParser();
                const doc = parser.parseFromString(htmlData, 'text/html');

                // 3. 순수 본문 내용만 타겟 영역에 주입
                contentArea.innerHTML = doc.body.innerHTML; 
                window.scrollTo(0, 0); 

                // 4. [🎨 CSS 동적 로드] fetch한 HTML 내에 수록된 모든 <link rel="stylesheet"> 추출
                const cssLinks = doc.querySelectorAll('link[rel="stylesheet"]');
                cssLinks.forEach(link => {
                    const newLink = document.createElement('link');
                    newLink.className = 'dynamic-blog-css'; // 대청소용 식별 클래스
                    newLink.rel = 'stylesheet';
                    
                    let href = link.getAttribute('href');
                    if (!href.startsWith('/') && !href.startsWith('http')) {
                        newLink.href = window.location.origin + '/suna-star/skin/css/' + href;
                    } else {
                        newLink.href = href;
                    }

                    newLink.onerror = () => newLink.remove();
                    document.head.appendChild(newLink);
                });

                // 5. [⚙️ JS 동적 로드] fetch한 HTML 내에 수록된 모든 <script> 추출 및 순차 실행
                const scripts = doc.querySelectorAll('script');
                let scriptChain = Promise.resolve();

                scripts.forEach(script => {
                    scriptChain = scriptChain.then(() => {
                        return new Promise((resolve) => {
                            const newScript = document.createElement('script');
                            newScript.className = 'dynamic-blog-js'; // 대청소용 식별 클래스
                            
                            let src = script.getAttribute('src');
                            if (src) {
                                if (!src.startsWith('/') && !src.startsWith('http')) {
                                    // ⭐ [버그 수정] src에 이미 skin/js/가 포함되어 있다면 중복 방지 처리
                                    if (src.includes('skin/js/')) {
                                        // 중복되는 부분을 제외한 순수 파일명만 추출하거나 올바른 경로로 재조합
                                        const fileName = src.split('/').pop();
                                        newScript.src = window.location.origin + '/suna-star/skin/js/' + fileName;
                                    } else {
                                        newScript.src = window.location.origin + '/suna-star/skin/js/' + src;
                                    }
                                } else {
                                    newScript.src = src;
                                }
                                newScript.onload = () => resolve();
                                newScript.onerror = () => {
                                    newScript.remove();
                                    resolve(); 
                                };
                            } else {
                                newScript.textContent = script.textContent;
                                resolve(); 
                            }
                            document.body.appendChild(newScript);
                        });
                    });
                });

                // 6. 모든 스크립트 구동 완료 후 초기화 헬퍼 함수 실행 (버그 수정 완료)
                scriptChain.then(() => {
                    const pageKey = fileName.split('.')[0]; 
                    executePageInit(pageKey);
                });

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
    // 페이지 주소 이름에 관계없이 setupMenuLinks 함수가 로드되었다면 무조건 자동 실행!
    if (typeof setupMenuLinks === 'function') {
        setupMenuLinks();
    }
}
