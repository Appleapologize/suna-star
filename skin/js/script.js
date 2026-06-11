let recipeData = []; 
let dict = {}; 

// 쿼리스트링을 주소창에 추가하는 함수
function addQueryString(fileName) {
  const url = new URL(window.location);
  url.searchParams.set('pageName', fileName); 
  window.history.pushState({ pageName: fileName }, '', url); 
}

// ★ [새로 추가된 엔진] GitHub API를 이용해 pages 폴더 안의 모든 하위 폴더명을 자동으로 알아내는 함수
async function fetchAutoSubFolders() {
  // 기본 안전장치 폴더 목록
  let folders = ['', 'wiki/', 'sns/', 'gallery/'];
  try {
    // 깃허브 API를 이용해 suna-star 리포지토리의 pages 폴더 내부 실시간 스캔
    const response = await fetch('https://github.com');
    if (response.ok) {
      const items = await response.json();
      // 가져온 목록 중 '폴더(dir)'인 것들만 골라내어 이름 뒤에 '/'를 붙여 배열로 만듭니다.
      const apiFolders = items
        .filter(item => item.type === 'dir')
        .map(item => item.name + '/');
      
      // 기본 루트('')와 자동 탐색된 폴더들을 합쳐 최종 목록 완성
      folders = ['', ...apiFolders];
    }
  } catch (error) {
    console.warn("GitHub API 로드 실패 (기본 안전장치 목록 사용):", error);
  }
  return folders;
}

// [핵심] 사이트가 처음 부팅되자마자 실행되는 통합 구간
document.addEventListener("DOMContentLoaded", () => {
  // 마우스 우클릭 차단
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

  // text-logo SVG 클릭 시 홈 화면 연결
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

 // 만약 쿼리스트링에 파일명만 있다면 pages/를 붙이고, 이미 포함되어 있다면 그대로 사용합니다.
  const initialPath = pageName.startsWith('pages/') ? pageName : 'pages/' + pageName;
  
  loadPage(null, pageName, false);

  // 브라우저 뒤로가기 / 앞으로가기 처리
  window.addEventListener('popstate', function(event) {
    if (event.state && event.state.pageName) {
      loadPage(null, event.state.pageName, false);
    } else {
      const currentParams = new URLSearchParams(window.location.search);
      const currentPage = currentParams.get('pageName') || 'home.html';
      loadPage(null, currentPage, false);
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
// ★ 비동기 폴더 탐색을 위해 앞에 async 키워드를 추가했습니다.
async function loadPage(event, relativePath, addHistory = true) {
  if (event) {
    if (typeof event.preventDefault === 'function') event.preventDefault();
    if (typeof event.stopPropagation === 'function') event.stopPropagation();
  }

  // 1. 입력받은 주소에서 무조건 순수한 '파일명'만 가공 추출합니다.
  const fileName = relativePath.split('/').pop(); 

  // ★ 2. [완전 자동화] 깃허브 서버에게 직접 물어봐서 현재 존재하는 하위 폴더들을 실시간으로 알아옵니다!
  const subFolders = await fetchAutoSubFolders(); 
  
  let finalUrl = '';
  
  if (relativePath.startsWith('http') || relativePath.startsWith('/')) {
    finalUrl = relativePath;
  } else {
    let matchedFolder = '';
    
    // 메뉴 링크 주소 자체에 이미 폴더 힌트가 들어있는지 검사합니다.
    for (const folder of subFolders) {
      if (folder !== '' && relativePath.includes(folder)) {
        matchedFolder = folder;
        break;
      }
    }
    
    // 최종 파일 배달용 GitHub Pages 절대 경로 완성
    finalUrl = window.location.origin + '/suna-star/pages/' + matchedFolder + fileName;
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
        // 기존에 추가되었던 동적 CSS 및 JS 완전 제거
        document.querySelectorAll('.dynamic-blog-css, .dynamic-blog-js').forEach(el => el.remove());
        
        if (window.galleryInterval) {
          clearInterval(window.galleryInterval);
          window.galleryInterval = null;
        }
        
        // 가상 HTML 객체로 파싱
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlData, 'text/html');
        
        // 순수 본문 내용 주입
        contentArea.innerHTML = doc.body.innerHTML; 
        window.scrollTo(0, 0); 
        
        // [CSS 동적 로드]
        const cssLinks = doc.querySelectorAll('link[rel="stylesheet"]');
        cssLinks.forEach(link => {
          const newLink = document.createElement('link');
          newLink.className = 'dynamic-blog-css';
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

        // [JS 동적 로드]
        const scripts = doc.querySelectorAll('script');
        let scriptChain = Promise.resolve();
        scripts.forEach(script => {
          scriptChain = scriptChain.then(() => {
            return new Promise((resolve) => {
              const newScript = document.createElement('script');
              newScript.className = 'dynamic-blog-js';
              let src = script.getAttribute('src');
              if (src) {
                if (!src.startsWith('/') && !src.startsWith('http')) {
                  if (src.includes('skin/js/')) {
                    const jsFileName = src.split('/').pop();
                    newScript.src = window.location.origin + '/suna-star/skin/js/' + jsFileName;
                  } else {
                    newScript.src = window.location.origin + '/suna-star/skin/js/' + src;
                  }
                } else {
                  newScript.src = src;
                }
                newScript.onload = () => resolve();
                newScript.onerror = () => { newScript.remove(); resolve(); };
              } else {
                newScript.textContent = script.textContent;
                resolve(); 
              }
              document.body.appendChild(newScript);
            });
          });
        });

        // 모든 스크립트 구동 완료 후 초기화 헬퍼 함수 실행
        scriptChain.then(() => {
          const pageKey = fileName.split('.'); 
          executePageInit(pageKey);
        });

        // 주소창 기록 처리
        if (addHistory) { 
          addQueryString(fileName); 
        }
      }
    })
    .catch(error => {
      console.error("Fetch Error:", error);
      const contentArea = document.querySelector('#container');
      if (contentArea) {
        contentArea.innerHTML = `<p style="color:red; padding:20px; font-weight:bold;"> 에러 발생: ${error.message}</p>`;
      }
    });
}

// 파일별 초기화 함수를 매핑해서 실행해주는 헬퍼 함수
function executePageInit(pageKey) {
  if (pageKey === 'gallery' && typeof initGallery === 'function') {
    initGallery();
  }
  if (typeof setupMenuLinks === 'function') {
    setupMenuLinks();
  }
}
