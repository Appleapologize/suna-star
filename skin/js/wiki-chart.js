document.addEventListener("DOMContentLoaded", function () {
  // 1. 데이터 읽기
  const chartDataElement = document.getElementById("chart-data"); //
  const datasets = Array.from(chartDataElement.getElementsByClassName("dataset")); //
  const labelsElement = chartDataElement.querySelector(".labels"); //

  // 2. 내 CSS에 정의된 글자색(--text-color)을 실시간으로 긁어옵니다
  const computedStyle = getComputedStyle(document.documentElement);
  const cssTextColor = computedStyle.getPropertyValue('--text-color').trim() || '#000000'; //
  
  // 눈금선 색상은 글자색을 가져와서 10%의 연한 투명도로 자동 계산합니다
  const cssGridColor = `color-mix(in srgb, ${cssTextColor} 10%, transparent)`; 

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
          color: cssTextColor, // 내 CSS 글자색 적용
        },
      },
    },
  };

  // 5. Radar Chart 옵션 (원형 차트 전용)
  const radarOptions = {
    ...commonOptions, //
    maintainAspectRatio: true, // 💡 동그라미 모양 찌그러짐 방지를 위해 비율 유지 켬
    layout: {
      padding: { // 💡 차트 내부 유령 여백을 0으로 꽉 조여서 원형 차트 알맹이를 최대로 키움
        top: 0,
        bottom: 0,
        left: 0,
        right: 0
      }
    },
    scales: {
      r: {
        beginAtZero: true, //
        suggestedMax: 5, //
        ticks: { color: cssTextColor }, //
        grid: { color: cssGridColor }, //
        angleLines: { color: cssGridColor }, //
        pointLabels: {
          color: cssTextColor, //
          font: { 
            size: 12,        /* 글자 크기를 살짝 조절 */
            weight: 'bold'   /* 모서리 글씨를 선명하게 */
          }, 
          padding: -8
        }
      },
    },
  };

  // 6. Bar Chart 옵션 (막대 차트 전용)
  const barOptions = {
    ...commonOptions, //
    
    // ⭐ [이게 빠져있었습니다!] 막대 차트는 부모 박스 가로/세로에 맞춰 유연하게 꽉 차도록 세팅합니다.
    maintainAspectRatio: false, 
    
    scales: {
      x: {
        ticks: { color: cssTextColor }, //
        grid: { color: cssGridColor }, //
      },
      y: {
        beginAtZero: true, //
        ticks: { color: cssTextColor }, //
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
