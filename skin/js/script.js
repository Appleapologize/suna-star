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
    const baseUrl = window.location.pathname.endsWith('/') ? window.location.pathname : window.location.pathname + '/';
    const finalUrl = window.location.origin + baseUrl + 'pages/' + fileName;

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
contentArea.innerHTML = htmlData; 
window.scrollTo(0, 0); 

                // ───────────────────────────────────────────────
                // [추가된 구간] 동적 CSS 로드 시스템
                // ───────────────────────────────────────────────
                // 이미 해당 페이지의 CSS가 생성되어 있는지 ID로 확인 후 없으면 생성
                // 1. [이전 페이지 청소] 기존에 추가되었던 동적 CSS 및 JS 제거
                document.querySelectorAll('link[id^="dynamic-css-"]').forEach(el => el.remove());
                document.querySelectorAll('script[id^="dynamic-js-"]').forEach(el => el.remove());

                // 2. [동적 CSS 로드]
const cssId = `dynamic-css-${pageKey}`;
if (!document.getElementById(cssId)) {
                    // 메인 index.html이 실행되는 루트 위치 기준 경로 설정
const link = document.createElement('link');
link.id = cssId;
link.rel = 'stylesheet';
                    link.href = `./skin/css/${pageKey}.css`; 
                    
                    // 파일이 실제로 존재하는지 체크 후 로드 에러 시 자동 소멸 (예: home.css가 없을 때 에러 방지)
                    link.href = `/suna-star/skin/css/${pageKey}.css`; 
link.onerror = () => link.remove(); 
                    
document.head.appendChild(link);
}
                // ───────────────────────────────────────────────

                // 3. [핵심: 동적 JS 로드] HTML이 완전히 들어간 뒤 스크립트 실행 구조 빌드
                const jsId = `dynamic-js-${pageKey}`;
                if (!document.getElementById(jsId)) {
                    const script = document.createElement('script');
                    script.id = jsId;
                    
                    // 폴더 구조가 skin/js/guest.js 규칙이라고 가정했을 때의 경로 설정
                    script.src = `/suna-star/skin/js/${pageKey}.js`; 
                    
                    // 파일이 없으면 콘솔 에러 방지를 위해 태그 자동 제거
                    script.onerror = () => script.remove(); 
                    
                    document.body.appendChild(script);
                }

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
