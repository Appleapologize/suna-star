// 전역 변수 중복 선언 차단 및 로드 즉시 실행을 위한 즉시 실행 함수(IIFE)
(function () {

  // 1. 데이터 읽기
  const chartDataElement = document.getElementById("chart-data"); 
  if (!chartDataElement) return; // 차트 데이터가 없으면 즉시 실행 중단

  const datasets = Array.from(chartDataElement.getElementsByClassName("dataset")); 
  const labelsElement = chartDataElement.querySelector(".labels"); 

  // 2. 내 CSS에 정의된 글자색(--text-color)을 실시간으로 긁어옵니다
  const computedStyle = getComputedStyle(document.documentElement);
  const cssTextColor = computedStyle.getPropertyValue('--text-color').trim() || '#000000'; 
  
  // 눈금선 색상은 글자색을 가져와서 10%의 연한 투명도로 자동 계산합니다
  const cssGridColor = `color-mix(in srgb, ${cssTextColor} 10%, transparent)`; 

  /* 💡 [수정] 모바일 화면(1024px 미만)인지 CSS 미디어쿼리 기준으로 정확히 체크 */
  const isMobile = window.matchMedia('(max-width: 1023px)').matches;
  
  // 브라우저 줌 상태나 비동기 로드 버그를 방지하기 위해 가로폭 한 번 더 검증
  const currentWidth = window.innerWidth || document.documentElement.clientWidth;
  const finalIsMobile = isMobile || (currentWidth > 0 && currentWidth < 1024);

  // 최종 화면 크기에 따른 폰트 사이즈 부여 /*모바일 : 데스크탑 폰트 사이즈 선언*/
  const chartFontSize = finalIsMobile ? 20 : 16; 

  // 전역 기본 폰트 크기 지정
  Chart.defaults.font.size = chartFontSize; 

  // 3. 데이터셋 추출
  const data = {
    labels: labelsElement.getAttribute("data-values").split(","), 
    datasets: datasets.map((dataset, index) => ({ 
      label: dataset.getAttribute("data-label"), 
      data: dataset.getAttribute("data-values").split(",").map(Number), 
      backgroundColor: `rgba(${index === 0 ? "255, 99, 132" : index === 1 ? "54, 162, 235" : "153, 102, 255"}, 0.2)`, 
      borderColor: `rgba(${index === 0 ? "255, 99, 132" : index === 1 ? "54, 162, 235" : "153, 102, 255"}, 1)`, 
      borderWidth: 2, 
    })),
  };

  // 4. 차트 공통 옵션 설정
  const commonOptions = {
    responsive: true, 
    animation: {
      duration: 2000, 
      easing: "easeInOutBounce", 
    },
    plugins: {
      legend: {
        position: "top", 
        labels: {
          color: cssTextColor, 
          boxWidth: 12,        /* 범례 아이콘 크기 */
          padding: 10,          /* 범례 아래 여백 */
          font: { size: chartFontSize } 
        },
      },
    },
  };

  // 5. Radar Chart 옵션
  const radarOptions = {
    ...commonOptions, 
    maintainAspectRatio: true, 
    layout: {
      padding: 0 
    },
    scales: {
      r: {
        beginAtZero: true, 
        suggestedMax: 5, 
        ticks: { 
          color: cssTextColor, 
          backdropColor: 'transparent', 
          showLabelBackdrop: false,
          font: { size: chartFontSize - 4 } /* 축 내부 숫자 크기 */
        },
        grid: { color: cssGridColor }, 
        angleLines: { color: cssGridColor }, 
        pointLabels: {
          color: cssTextColor, 
          font: { 
            size: chartFontSize, /* 👈 외곽 카테고리 글씨 크기 반영 */
            weight: 'bold'
          },
          padding: 3 
        }
      },
    },
  };

  // 6. Bar Chart 옵션
  const barOptions = {
    ...commonOptions, 
    maintainAspectRatio: false, 
    scales: {
      x: {
        ticks: { 
          color: cssTextColor,
          font: { size: chartFontSize } 
        }, 
        grid: { color: cssGridColor }, 
      },
      y: {
        beginAtZero: true, 
        ticks: { 
          color: cssTextColor,
          font: { size: chartFontSize }
        }, 
        grid: { color: cssGridColor }, 
      },
    },
  };

  // 7. 차트 생성 실행 구간
  const radarCanvas = document.getElementById("radarChart");
  if (radarCanvas) {
    const oldRadar = Chart.getChart(radarCanvas);
    if (oldRadar) oldRadar.destroy(); // 기존 잔상 제거
    new Chart(radarCanvas.getContext("2d"), { type: "radar", data: data, options: radarOptions });
  }

  const barCanvas = document.getElementById("barChart");
  if (barCanvas) {
    const oldBar = Chart.getChart(barCanvas);
    if (oldBar) oldBar.destroy(); // 기존 잔상 제거
    new Chart(barCanvas.getContext("2d"), { type: "bar", data: data, options: barOptions });
  }

  // 브라우저 창 크기가 바뀔 때 글자 크기 실시간 리사이징 대응
  window.addEventListener('resize', function() {
    const currentIsMobile = window.innerWidth < 1024;
    const nextFontSize = currentIsMobile ? 26 : 20;
    
    if (Chart.defaults.font.size !== nextFontSize) {
      Chart.defaults.font.size = nextFontSize;
      radarOptions.scales.r.pointLabels.font.size = nextFontSize;
      if(barOptions.scales.x.ticks.font) barOptions.scales.x.ticks.font.size = nextFontSize;
      if(barOptions.scales.y.ticks.font) barOptions.scales.y.ticks.font.size = nextFontSize;
      
      // 리사이즈 시 새롭게 캔버스 갱신
      if (radarCanvas) {
        const oldRadar = Chart.getChart(radarCanvas);
        if (oldRadar) oldRadar.destroy();
        new Chart(radarCanvas.getContext("2d"), { type: "radar", data: data, options: radarOptions });
      }
      if (barCanvas) {
        const oldBar = Chart.getChart(barCanvas);
        if (oldBar) oldBar.destroy();
        new Chart(barCanvas.getContext("2d"), { type: "bar", data: data, options: barOptions });
      }
    }
  });

})(); // 즉시 실행 함수 종료
