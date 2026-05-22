//././skin/js/gallery.js 내부 수정
function initGallery() {
    console.log("갤러리 스크립트 실행됨");
    
    // 기존에 만드셨던 슬라이드 제어 변수 및 쿼리셀렉터들이 이 중괄호 안으로 들어와야 합니다!
    const slider = document.querySelector('.slider');
    const slides = document.querySelectorAll('.slide');
    
    // 만약 자동 슬라이드(Interval) 기능이 있다면 전역에 저장
    window.galleryInterval = setInterval(() => {
         // 슬라이드 작동 로직...
    }, 3000);
}
