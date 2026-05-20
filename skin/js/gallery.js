document.addEventListener('DOMContentLoaded', () => {
  // 모든 슬라이더 요소를 가져옴
  const sliders = document.querySelectorAll('.slider');

  sliders.forEach(slider => {
    const slides = slider.querySelector('.slides');
    const images = slider.querySelectorAll('.gallery-img');
    const nextButton = slider.querySelector('.next');
    const prevButton = slider.querySelector('.prev');


    // 슬라이더 기능 활성화
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

    // Next 버튼 클릭 시
    nextButton.addEventListener('click', () => {
      clearInterval(autoSlideInterval); // 자동 슬라이드 일시 중지
      showSlide(index + 1);             // 다음 슬라이드 표시
      autoSlideInterval = setInterval(() => showSlide(index + 1), 3000); // 자동 슬라이드 다시 시작
    });

    // Prev 버튼 클릭 시
    prevButton.addEventListener('click', () => {
      clearInterval(autoSlideInterval); // 자동 슬라이드 일시 중지
      showSlide(index - 1);             // 이전 슬라이드 표시
      autoSlideInterval = setInterval(() => showSlide(index + 1), 3000); // 자동 슬라이드 다시 시작
    });

    // 자동으로 이미지 넘어가게 (마지막에 처음 슬라이드로 돌아감)
    let autoSlideInterval = setInterval(() => showSlide(index + 1), 3000);
  });
});