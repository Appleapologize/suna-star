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

const fileName = relativePath.split('/').pop(); // 예: guest.html
const pageKey = fileName.split('.')[0];         // 예: guest

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
                // [💥 대청소 구간] 새로운 페이지를 그리기 전 기존에 들어있던 동적 CSS와 JS 태그를 완전히 제거합니다.
                // 다른 페이지로 이동했을 때 BGM이 제자리로 돌아오지 않는 현상을 해결합니다.
                document.querySelectorAll('link[id^="dynamic-css-"]').forEach(el => el.remove());
                document.querySelectorAll('script[id^="dynamic-js-"]').forEach(el => el.remove());
                
                // 만약 갤러리 자동 슬라이드가 켜져있었다면 타이머 폭주 방지를 위해 클리어
                if (window.galleryInterval) {
                    clearInterval(window.galleryInterval);
                    window.galleryInterval = null;
                }

                // 2. 새로운 HTML 화면에 바인딩
contentArea.innerHTML = htmlData; 
window.scrollTo(0, 0); 

                // 2. 동적 CSS 로드
                // 3. 동적 CSS 로드
const cssId = `dynamic-css-${pageKey}`;
                if (!document.getElementById(cssId)) {
                    const link = document.createElement('link');
                    link.id = cssId; 
                    link.rel = 'stylesheet';
                    link.href = `/suna-star/skin/css/${pageKey}.css`; 
                    link.onerror = () => link.remove(); 
                    document.head.appendChild(link);
                }

                // 3. 동적 JS 로드 및 실행 타이밍 제어
                const link = document.createElement('link');
                link.id = cssId; 
                link.rel = 'stylesheet';
                link.href = `/suna-star/skin/css/${pageKey}.css`; 
                link.onerror = () => link.remove(); 
                document.head.appendChild(link);

                // 4. 동적 JS 로드 및 실행 타이밍 제어
const jsId = `dynamic-js-${pageKey}`;
                let script = document.getElementById(jsId);
                const script = document.createElement('script');
                script.id = jsId;
                script.src = `/suna-star/skin/js/${pageKey}.js`; 
                script.onerror = () => script.remove(); 

                if (!script) {
                    script = document.createElement('script');
                    script.id = jsId;
                    script.src = `/suna-star/skin/js/${pageKey}.js`; 
                    script.onerror = () => script.remove(); 
                    
                    // 파일이 완전히 로드된 후 초기화 함수 실행
                    script.onload = () => {
                        executePageInit(pageKey);
                    };
                    document.body.appendChild(script);
                } else {
                    // 이미 불러와져 있던 스크립트라면 바로 초기화 함수만 재실행
                // 파일 다운로드가 완벽히 끝나서 브라우저가 읽었을 때 실행 보장
                script.onload = () => {
executePageInit(pageKey);
                }
                };
                document.body.appendChild(script);

if (addHistory) { 
addQueryString(fileName); 
}
}

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
}
