  document.addEventListener("DOMContentLoaded", function () {
    // 데이터 읽기
    const chartDataElement = document.getElementById("chart-data");
    const datasets = Array.from(chartDataElement.getElementsByClassName("dataset"));
    const labelsElement = chartDataElement.querySelector(".labels");

    // 데이터셋 추출
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

    // 다크 모드 감지 함수
    function isDarkMode() {
      return document.documentElement.classList.contains("theme--dark");
    }

    // 다크 모드 색상 설정
    function getChartColors() {
      if (isDarkMode()) {
        return {
          textColor: "white",
          gridColor: "rgba(255, 255, 255, 1)",
        };
      } else {
        return {
          textColor: "black",
          gridColor: "rgba(0, 0, 0, 1)",
        };
      }
    }

    // 옵션 설정
    const commonOptions = {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 2000,
        easing: "easeInOutBounce",
      },
      plugins: {
        legend: {
          position: "top",
          labels: {
            color: getChartColors().textColor,
          },
        },
      },
    };

    // Radar Chart 옵션
    const radarOptions = {
      ...commonOptions,
      scales: {
        r: {
          beginAtZero: true,
          suggestedMax: 5,
          ticks: {
            color: getChartColors().textColor,
          },
          grid: {
            color: getChartColors().gridColor,
          },
        },
      },
    };

    // Bar Chart 옵션
    const barOptions = {
      ...commonOptions,
      scales: {
        x: {
          ticks: {
            color: getChartColors().textColor,
          },
          grid: {
            color: getChartColors().gridColor,
          },
        },
        y: {
          beginAtZero: true,
          ticks: {
            color: getChartColors().textColor,
          },
          grid: {
            color: getChartColors().gridColor,
          },
        },
      },
    };

    // 차트 생성 - Radar Chart
    const radarCtx = document.getElementById("radarChart").getContext("2d");
    const radarChart = new Chart(radarCtx, {
      type: "radar",
      data: data,
      options: radarOptions,
    });

    // 차트 생성 - Bar Chart
    const barCtx = document.getElementById("barChart").getContext("2d");
    const barChart = new Chart(barCtx, {
      type: "bar",
      data: data,
      options: barOptions,
    });

    // 다크 모드 감지 및 업데이트
    const observer = new MutationObserver(() => {
      const colors = getChartColors();

      // Radar Chart 업데이트
      radarChart.options.scales.r.ticks.color = colors.textColor;
      radarChart.options.scales.r.grid.color = colors.gridColor;
      radarChart.options.plugins.legend.labels.color = colors.textColor;
      radarChart.update();

      // Bar Chart 업데이트
      barChart.options.scales.x.ticks.color = colors.textColor;
      barChart.options.scales.x.grid.color = colors.gridColor;
      barChart.options.scales.y.ticks.color = colors.textColor;
      barChart.options.scales.y.grid.color = colors.gridColor;
      barChart.options.plugins.legend.labels.color = colors.textColor;
      barChart.update();
    });

    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  });