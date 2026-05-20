// 쿼리스트링을 주소창에 추가하는 함수
function addQueryString(fileName) {
    const url = new URL(window.location);
    url.searchParams.set('pageName', fileName); // 파일 이름만 쿼리스트링에 추가
    window.history.pushState({}, '', url);
}

// 메뉴 클릭 시 iframe과 쿼리스트링 변경
function handleMenuClick(event) {
    event.preventDefault();
    const fileName = event.currentTarget.getAttribute('href').split('/').pop(); // 파일명만 가져오기
    const iframe = document.querySelector('iframe[name="frame"]');
    iframe.src = `./pages/${fileName}`; // iframe에 경로 추가하여 페이지 로드
    addQueryString(fileName); // 주소창에 파일명만 추가
}

// 모든 메뉴에 이벤트 리스너를 추가하는 함수
function setupMenuLinks() {
    const menuLinks = document.querySelectorAll('.navmenu a'); // 메뉴의 모든 링크 선택
    menuLinks.forEach(link => {
        link.addEventListener('click', handleMenuClick); // 각 링크에 이벤트 리스너 추가
    });
}

// 페이지 로드 시 쿼리스트링 확인 후 해당 페이지 로드
document.addEventListener('DOMContentLoaded', function() {
    const params = new URLSearchParams(window.location.search);
    const pageName = params.get('pageName') || 'home.html'; // 기본값
    const iframe = document.querySelector('iframe[name="frame"]');
    iframe.src = `./pages/${pageName}`; // iframe에 경로를 추가하여 파일 로드

    setupMenuLinks(); // 메뉴 링크에 이벤트 리스너 설정
});