document.addEventListener("DOMContentLoaded", function () {
  // 1. 데이터 읽기
  const chartDataElement = document.getElementById("chart-data"); //
  if (!chartDataElement) return; // 차트 데이터가 없으면 실행 중단 (안전장치)

  const datasets = Array.from(chartDataElement.getElementsByClassName("dataset")); //
  const labelsElement = chartDataElement.querySelector(".labels"); //

  // 2. 내 CSS에 정의된 글자색(--text-color)을 실시간으로 긁어옵니다
  const computedStyle = getComputedStyle(document.documentElement);
  const cssTextColor = computedStyle.getPropertyValue('--text-color').trim() || '#000000'; //
  
  // 눈금선 색상은 글자색을 가져와서 10%의 연한 투명도로 자동 계산합니다
  const cssGridColor = `color-mix(in srgb, ${cssTextColor} 10%, transparent)`; 

  /*모바일 : 데스크탑 폰트 사이즈 선언*/
  const isMobile = window.innerWidth < 1024;
  const chartFontSize = isMobile ? 260 : 200; 

  Chart.defaults.font.size = chartFontSize; 

  // 3. 데이터셋 추출
  const data = {
    labels: labelsElement.getAttribute("data-values").split(","), //
    datasets: datasets.map((dataset, index) => ({ //
      label: dataset.getAttribute("data-label"), //
      data: dataset.getAttribute("data-values").split(",").map(Number), //
      backgroundColor: `rgba(${index === 0 ? "255, 99, 132" : index === 1 ? "54, 162, 235" : "153, 102, 255"}, 0.2)`, //
      borderColor: `rgba(${index === 0 ? "255, 99, 132" : index === 1 ? "54, 162, 235" : "153, 102, 255"}, 1)`, //
      borderWidth: 2, //
    })),
  };

  // 4. 차트 공통 옵션 설정
  const commonOptions = {
    responsive: true, //
    animation: {
      duration: 2000, //
      easing: "easeInOutBounce", //
    },
    plugins: {
      legend: {
        position: "top", //
        labels: {
          color: cssTextColor, //
          boxWidth: 12,        /* 범례 아이콘 크기를 줄여 차트 공간 확보 */
          padding: 10,          /* 범례 아래 여백 줄이기 */
          font: { size: chartFontSize } /*(모바일 폰트 사이즈, PC 폰트 사이즈)*/
        },
      },
    },
  };

  // 5. Radar Chart 옵션 (원형 차트 내부 여백 극강 조절판)
  const radarOptions = {
    ...commonOptions, //
    maintainAspectRatio: true, // 💡 완벽한 동그라미 비율 유지 (찌그러짐 방지)
    layout: {
      padding: 0 // 💡 도화지 자체 패딩 완전 초기화
    },
    scales: {
      r: {
        beginAtZero: true, //
        suggestedMax: 5, //
        ticks: { 
          color: cssTextColor, //
          backdropColor: 'transparent', /* 숫자 뒤 하얀 배경 제거 */
          showLabelBackdrop: false
        },
        grid: { color: cssGridColor }, //
        angleLines: { color: cssGridColor }, //
        pointLabels: {
          color: cssTextColor, //
          font: { 
            size: chartFontSize, 
            weight: 'bold'
          },
          // 💡 에러 없는 안전한 최소 여백(0) 설정으로 차트 크기 최대화
          padding: 3 
        }
      },
    },
  };

  // 6. Bar Chart 옵션 (막대 차트 유연화)
  const barOptions = {
    ...commonOptions, //
    maintainAspectRatio: false, // 💡 박스 크기에 맞게 꽉 차게 조절
    scales: {
      x: {
        ticks: { 
          color: cssTextColor,
         font: { size: chartFontSize } // ⭐ 막대차트 X축도 적용하려면 추가
      }, //
        grid: { color: cssGridColor }, //
      },
      y: {
        beginAtZero: true, //
        ticks: { 
          color: cssTextColor,
          font: { size: chartFontSize }
        }, //
        grid: { color: cssGridColor }, //
      },
    },
  };

  // 7. 차트 생성 - Radar Chart
  const radarCtx = document.getElementById("radarChart").getContext("2d"); //
  new Chart(radarCtx, { //
    type: "radar", //
    data: data, //
    options: radarOptions, //
  });

  // 8. 차트 생성 - Bar Chart
  const barCtx = document.getElementById("barChart").getContext("2d"); //
  new Chart(barCtx, { //
    type: "bar", //
    data: data, //
    options: barOptions, //
  });
});
