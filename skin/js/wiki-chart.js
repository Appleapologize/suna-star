document.addEventListener("DOMContentLoaded", function () {
  // 1. 데이터 읽기
  const chartDataElement = document.getElementById("chart-data"); //
  const datasets = Array.from(chartDataElement.getElementsByClassName("dataset")); //
  const labelsElement = chartDataElement.querySelector(".labels"); //

  // 2. 💡 [핵심] 내 CSS에 정의된 글자색(--text-color)을 실시간으로 긁어옵니다
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

  // 4. 차트 공통 옵션 (글자색에 내 CSS 변수값 주입)
  const commonOptions = {
    responsive: true, //
    maintainAspectRatio: false, // 💡 가로폭 넓어져도 세로가 무식하게 안 늘어나게 고정
    animation: {
      duration: 2000, //
      easing: "easeInOutBounce", //
    },
    plugins: {
      legend: {
        position: "top", //
        labels: {
          color: cssTextColor, // 💡 내 CSS 글자색 적용!
        },
      },
    },
  };

  // 5. Radar Chart 옵션
  const radarOptions = {
    ...commonOptions, //
    scales: {
      r: {
        beginAtZero: true, //
        suggestedMax: 5, //
        ticks: {
          color: cssTextColor, // 💡 내 CSS 글자색 적용!
        },
        grid: {
          color: cssGridColor, // 💡 내 CSS 기반 연한 눈금선 적용!
        },
        angleLines: {
          color: cssGridColor, // 방사형 중심선 색상
        },
        pointLabels: {
          color: cssTextColor, // 외각 능력치 텍스트 색상
        }
      },
    },
  };

  // 6. Bar Chart 옵션
  const barOptions = {
    ...commonOptions, //
    scales: {
      x: {
        ticks: {
          color: cssTextColor, // 💡 내 CSS 글자색 적용!
        },
        grid: {
          color: cssGridColor,
        },
      },
      y: {
        beginAtZero: true, //
        ticks: {
          color: cssTextColor, //
        },
        grid: {
          color: cssGridColor, //
        },
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
