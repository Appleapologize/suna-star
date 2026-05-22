// 메인 스크립트(loadPage)에서 호출할 초기화 함수
function initGallery() {
  console.log("🎨 갤러리 슬라이드 시스템 초기화 시작");

  // 모든 슬라이더 요소를 가져옴
  const sliders = document.querySelectorAll('.slider');

  // 이전 탭에서 돌고 있던 타이머 배열 생성 (메모리 누수 방지용)
  if (!window.activeGalleryIntervals) {
    window.activeGalleryIntervals = [];
  } else {
    // 이미 돌아가던 타이머가 있다면 전부 파괴
    window.activeGalleryIntervals.forEach(timer => clearInterval(timer));
    window.activeGalleryIntervals = [];
  }

  sliders.forEach((slider, sliderIdx) => {
    const slides = slider.querySelector('.slides');
    const images = slider.querySelectorAll('.gallery-img');
    const nextButton = slider.querySelector('.next');
    const prevButton = slider.querySelector('.prev');

    // 예외 처리: 슬라이드 구성 요소가 불완전하면 실행 건너뜀
    if (!slides || !nextButton || !prevButton || images.length === 0) return;

    let index = 0;

    function showSlide(n) {
      // 슬라이드 인덱스 범위 제어
      if (n >= images.length) index = 0;      // 마지막 슬라이드 이후 다시 첫 번째 슬라이드로
      else if (n < 0) index = images.length - 1; // 첫 번째 슬라이드 이전에 마지막 슬라이드로
      else index = n;

      // 슬라이드 위치 설정
      const offset = -index * 100;
      slides.style.transform = `translateX(${offset}%)`;
    }

    // 자동으로 이미지 넘어가게 설정 (3초마다)
    let autoSlideInterval = setInterval(() => showSlide(index + 1), 3000);
    window.activeGalleryIntervals.push(autoSlideInterval); // 전역 배열에 담아 추적 관리

    // Next 버튼 클릭 시
    nextButton.onclick = () => {
      clearInterval(autoSlideInterval); // 자동 슬라이드 일시 중지
      showSlide(index + 1);             // 다음 슬라이드 표시
      autoSlideInterval = setInterval(() => showSlide(index + 1), 3000); // 자동 슬라이드 다시 시작
      window.activeGalleryIntervals[sliderIdx] = autoSlideInterval;
    };

    // Prev 버튼 클릭 시
    prevButton.onclick = () => {
      clearInterval(autoSlideInterval); // 자동 슬라이드 일시 중지
      showSlide(index - 1);             // 이전 슬라이드 표시
      autoSlideInterval = setInterval(() => showSlide(index + 1), 3000); // 자동 슬라이드 다시 시작
      window.activeGalleryIntervals[sliderIdx] = autoSlideInterval;
    };
  });
}
