let recipeData = []; 
let dict = {}; 

const subFolders = ['wiki/',];

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

    async function findCorrectPath(pName) {
        if (pName.startsWith('pages/')) return pName;
        
        // 1. 먼저 pages/ 바로 밑에 파일이 있는지 찔러봅니다. (예: pages/home.html)
        let rootCheck = await fetch(window.location.origin + '/suna-star/pages/' + pName, { method: 'HEAD' });
        if (rootCheck.ok) return `pages/${pName}`;
        
        // 2. 없으면 우리가 위에서 나열한 subFolders 목록을 하나씩 돌면서 파일이 있는지 찾습니다.
        for (const folder of subFolders) {
            let subCheck = await fetch(window.location.origin + '/suna-star/pages/' + folder + pName, { method: 'HEAD' });
            if (subCheck.ok) {
                return `pages/${folder}${pName}`; // 파일을 찾으면 해당 폴더 주소를 합쳐서 반환!
            }
        }
        // 3. 다 뒤져도 없으면 기본값 반환
        return `pages/${pName}`;
    }
    
    // 주소창의 쿼리스트링 파라미터 확인 후 초기 페이지 로드
    const params = new URLSearchParams(window.location.search);
    const pageName = params.get('pageName') || 'home.html';
    
    // 자동 추적 함수를 실행하여 정확한 하위 폴더 경로를 받아온 뒤 로드합니다.
    findCorrectPath(pageName).then(finalPath => {
        loadPage(null, finalPath, false);
    });


    // 브라우저 뒤로가기 / 앞으로가기 처리
    window.addEventListener('popstate', function(event) {
        const pName = (event.state && event.state.pageName) ? event.state.pageName : (new URLSearchParams(window.location.search).get('pageName') || 'home.html');
        findCorrectPath(pName).then(finalPath => {
            loadPage(null, finalPath, false);
        });
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
  // 상위 마크업으로 이벤트가 중첩 전파되는 버블링 차단
  // 인라인 링크에 걸려있는 본래의 기능(loadPage를 통한 페이지 이동)은 정상 실행
  if (event) {
    event.stopPropagation(); 
  }
  
  const targetMenu = document.getElementById(targetId);
  if (!targetMenu) return;

  // 이미 'open' 클래스가 붙어 열려있는 상태라면 제거하여 닫습니다.
  if (targetMenu.classList.contains('open')) {
    targetMenu.classList.remove('open');
  } else {
    // (선택사항) Exhibit을 열 때 Profile 등 같은 계층의 다른 열려있던 메뉴를 깔끔하게 먼저 접어줍니다.
    const parentWrapper = targetMenu.closest('ul');
    if (parentWrapper) {
      const siblingMenus = parentWrapper.querySelectorAll('.sub.open, .ssub.open');
      siblingMenus.forEach(menu => {
        if (menu !== targetMenu) menu.classList.remove('open');
      });
    }
    // 클래스를 추가하여 정상적으로 하위 메뉴를 전개합니다.
    targetMenu.classList.add('open');
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
    let pageQueryName = cleanPath.startsWith('pages/') ? cleanPath.substring(6) : cleanPath;

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
                    addQueryString(pageQueryName);
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

/* ==========================================================================
   💻 [클릭 모드 전용 편의성 기능] 메뉴 바깥 영역 클릭 시 활성화된 드롭다운 전체 자동 닫기
   ========================================================================== */
document.addEventListener('click', (event) => {
  const menuContainer = document.getElementById('menu');
  
  // 클릭한 마우스 대상 지점이 좌측 #menu 영역 외부일 경우, 열려있는 모든 sub와 ssub 창을 초기화(닫기)합니다.
  if (menuContainer && !menuContainer.contains(event.target)) {
    const openActiveMenus = menuContainer.querySelectorAll('.sub.open, .ssub.open');
    openActiveMenus.forEach(menu => {
      menu.classList.remove('open');
    });
  }
});


// 방명록 js
function executePageInit(pageKey) {
    if (pageKey === 'gallery' && typeof initGallery === 'function') {
        initGallery();
    }
    
    // guest 페이지 진입 시 새 모듈을 안전하게 호출합니다.
    if (pageKey === 'guest') {
        import(window.location.origin + '/suna-star/skin/js/guestbook.js')
            .catch(err => console.error("방명록 스크립트 로드 실패:", err));
    }

    if (typeof setupMenuLinks === 'function') {
        setupMenuLinks();
    }
}

