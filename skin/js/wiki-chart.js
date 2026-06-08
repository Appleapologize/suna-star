// 💥 DOMContentLoaded 감싸개를 과감히 제거하여 로드 즉시 실행되도록 만듭니다!

// 1. 데이터 읽기
const chartDataElement = document.getElementById("chart-data"); 
if (chartDataElement) { // 안전장치 역할을 블록 전체 감싸기로 변경

  const datasets = Array.from(chartDataElement.getElementsByClassName("dataset")); 
  const labelsElement = chartDataElement.querySelector(".labels"); 

  // 2. 내 CSS에 정의된 글자색(--text-color)을 실시간으로 긁어옵니다
  const computedStyle = getComputedStyle(document.documentElement);
  const cssTextColor = computedStyle.getPropertyValue('--text-color').trim() || '#000000'; 
  
  // 눈금선 색상은 글자색을 가져와서 10%의 연한 투명도로 자동 계산합니다
  const cssGridColor = `color-mix(in srgb, ${cssTextColor} 10%, transparent)`; 

  /* 모바일 : 데스크탑 폰트 사이즈 선언 (기존 설정 유지) */
  const isMobile = window.innerWidth < 1024;
  const chartFontSize = isMobile ? 26 : 20; 

  // 전역 기본 폰트 크기 강제 지정
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
          font: { size: chartFontSize - 4 } /* 축 내부 숫자 크기 조절 */
        },
        grid: { color: cssGridColor }, 
        angleLines: { color: cssGridColor }, 
        pointLabels: {
          color: cssTextColor, 
          font: { 
            size: chartFontSize, /* 👈 바깥쪽 글씨 크기 반영 */
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

  // 7. 차트 생성 함수화 (창 크기 조절 시 대응을 위함)
  let radarChartInstance = null;
  let barChartInstance = null;

  function createCharts() {
    const radarCanvas = document.getElementById("radarChart");
    if (radarCanvas) {
      if (radarChartInstance) radarChartInstance.destroy();
      const oldRadar = Chart.getChart(radarCanvas);
      if (oldRadar) oldRadar.destroy();
      radarChartInstance = new Chart(radarCanvas.getContext("2d"), { type: "radar", data: data, options: radarOptions });
    }

    const barCanvas = document.getElementById("barChart");
    if (barCanvas) {
      if (barChartInstance) barChartInstance.destroy();
      const oldBar = Chart.getChart(barCanvas);
      if (oldBar) oldBar.destroy();
      barChartInstance = new Chart(barCanvas.getContext("2d"), { type: "bar", data: data, options: barOptions });
    }
  }

  // 💡 즉시 차트 그리기 실행
  createCharts();

  // 브라우저 창 크기가 바뀔 때 글자 크기 리사이징 대응
  window.addEventListener('resize', function() {
    const currentIsMobile = window.innerWidth < 1024;
    const nextFontSize = currentIsMobile ? 26 : 20;
    
    // 크기가 변했을 때만 다시 그리기
    if (Chart.defaults.font.size !== nextFontSize) {
      Chart.defaults.font.size = nextFontSize;
      radarOptions.scales.r.pointLabels.font.size = nextFontSize;
      if(barOptions.scales.x.ticks.font) barOptions.scales.x.ticks.font.size = nextFontSize;
      if(barOptions.scales.y.ticks.font) barOptions.scales.y.ticks.font.size = nextFontSize;
      createCharts();
    }
  });

} // 👈 if (chartDataElement) 블록의 마감입니다.
