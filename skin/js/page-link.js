// 쿼리스트링을 주소창에 추가하는 함수
function addQueryString(fileName) {
    const url = new URL(window.location);
    url.searchParams.set('pageName', fileName); // 파일 이름만 쿼리스트링에 추가
    window.history.pushState({ pageName: fileName }, '', url); // state에 pageName 저장
}

// 외부 HTML 파일을 fetch로 읽어와서 .container에 집어넣는 핵심 함수
async function loadContentPage(fileName) {
    const container = document.querySelector('.container');
    if (!container) return;

    try {
        // ./pages/home.html 등 파일의 실제 HTML 내용을 비동기로 호출
        const response = await fetch(`./pages/${fileName}`);
        
        if (!response.ok) {
            throw new Error('페이지를 불러오는 데 실패했습니다.');
        }

        const htmlContent = await response.text();
        container.innerHTML = htmlContent; // .container 내부에 HTML 주입
    } catch (error) {
        console.error(error);
        container.innerHTML = `<div class="error-msg">페이지를 로드할 수 없습니다.</div>`;
    }
}

// 메뉴 클릭 시 동적 콘텐츠 로드 및 쿼리스트링 변경
function handleMenuClick(event) {
    event.preventDefault();
    
    // 클릭된 요소에서 가장 가까운 a 태그를 찾아 안전하게 href 추출
    const link = event.target.closest('a');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href) return;

    const fileName = href.split('/').pop(); // 파일명만 가져오기
    
    loadContentPage(fileName); // .container에 html 내용 로드
    addQueryString(fileName);  // 주소창에 파일명만 추가
}

// 모든 메뉴에 이벤트 리스너를 추가하는 함수
function setupMenuLinks() {
    const menuLinks = document.querySelectorAll('.navmenu a'); // 메뉴의 모든 링크 선택
    menuLinks.forEach(link => {
        link.addEventListener('click', handleMenuClick); // 각 링크에 이벤트 리스너 추가
    });
}

// 페이지 최초 로드 시 및 브라우저 뒤로가기/앞으로가기 처리
document.addEventListener('DOMContentLoaded', function() {
    // 1. 초기 로드 시 쿼리스트링 확인 후 해당 페이지 로드
    const params = new URLSearchParams(window.location.search);
    const pageName = params.get('pageName') || 'home.html'; // 기본값
    loadContentPage(pageName);

    // 2. 메뉴 이벤트 리스너 설정
    setupMenuLinks(); 
    
    // 3. 브라우저 뒤로가기 / 앞으로가기 할 때 .container 내용도 함께 연동
    window.addEventListener('popstate', function(event) {
        if (event.state && event.state.pageName) {
            loadContentPage(event.state.pageName);
        } else {
            // state가 없는 초기 상태라면 URL에서 직접 파라미터를 읽어옴
            const currentParams = new URLSearchParams(window.location.search);
            const currentPage = currentParams.get('pageName') || 'home.html';
            loadContentPage(currentPage);
        }
    });
});
