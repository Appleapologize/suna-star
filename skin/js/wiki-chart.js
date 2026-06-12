// 전역 변수 중복 선언 차단 및 로드 즉시 실행을 위한 즉시 실행 함수(IIFE)
function initWikiChartSystem() {
  const table = document.getElementById("parameters");
  const chartDataContainer = document.getElementById("chart-data");
  if (!table || !chartDataContainer) return;

  chartDataContainer.innerHTML = ""; // 이전 잔상 대청소


  // (1) 항목 이름 자동 추출 (인술, 체술...)
  const headerCells = Array.from(table.querySelectorAll("tr:first-child th")).slice(1);
  if (headerCells.length > 0 && headerCells[headerCells.length - 1].textContent.includes("총합")) {
    headerCells.pop();
  }
  const labelValues = headerCells.map(cell => cell.textContent.replace(/\n|\s/g, "")).join(",");
  
  // <div class="labels"> 태그 자동 생성 및 주입
  const labelsDiv = document.createElement("div");
  labelsDiv.className = "labels";
  labelsDiv.setAttribute("data-values", labelValues);
  chartDataContainer.appendChild(labelsDiv);


  // (2) 세대별 숫자 자동 추출
  const dataRows = Array.from(table.querySelectorAll("tr[data-age]"));
  dataRows.forEach(row => {
    const label = row.getAttribute("data-age");
    const allCells = Array.from(row.querySelectorAll("td"));
    
    // [추가된 안전장치 1] 아직 채워지지 않은 빈 데이터 칸은 자동으로 "0"을 채워넣어 시스템 마비 방지
    let valuesArray = allCells.map(cell => {
      const text = cell.textContent.replace(/\n|\s/g, "").trim();
      return text === "" ? "0" : text;
    });

    // [추가된 안전장치 2] 칸 개수가 항목 개수보다 많으면 자동으로 '총합' 점수를 잘라내어 차트 매칭 일치
    if (valuesArray.length > headerCells.length) {
      valuesArray = valuesArray.slice(0, headerCells.length);
    }

    const values = valuesArray.join(",");

    // <div class="dataset"> 태그 자동 생성 및 주입
    const datasetDiv = document.createElement("div");
    datasetDiv.className = "dataset";
    datasetDiv.setAttribute("data-label", label);
    datasetDiv.setAttribute("data-values", values);
    chartDataContainer.appendChild(datasetDiv);
  });
  
  // 1. 데이터 읽기
  const chartDataElement = document.getElementById("chart-data"); 
  if (!chartDataElement) return; // 차트 데이터가 없으면 즉시 실행 중단

  const datasets = Array.from(chartDataElement.getElementsByClassName("dataset")); 
  const labelsElement = chartDataElement.querySelector(".labels"); 

  if (!labelsElement || datasets.length === 0) return;

  // 어떤 색상이든 브라우저 엔진을 거쳐 순수한 RGB 숫자로 바꿔주는 헬퍼 함수
  function convertToRgbString(colorValue) {
    if (!colorValue) return null;
    if (/^\d+\s*,\s*\d+\s*,\s*\d+$/.test(colorValue.trim())) return colorValue.trim();
    
    const tempElem = document.createElement("div");
    tempElem.style.color = colorValue;
    document.body.appendChild(tempElem);
    const computedColor = window.getComputedStyle(tempElem).color;
    document.body.removeChild(tempElem);
    
    const match = computedColor.match(/rgb\s*a?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
    return match ? `${match[1]}, ${match[2]}, ${match[3]}` : null;
  }

  // ★ CSS에서 차트 관련 디자인 변수들을 통합 수집하는 함수
  function getChartDesignSettings() {
    const computedStyle = window.getComputedStyle(document.documentElement);
    return {
      textColor: computedStyle.getPropertyValue('--chart-text-color').trim() || '#000000',
      gridColor: computedStyle.getPropertyValue('--chart-grid-color').trim() || 'rgba(0, 0, 0, 0.1)',
      bgOpacity: computedStyle.getPropertyValue('--chart-bg-opacity').trim() || "0.2",
      borderOpacity: computedStyle.getPropertyValue('--chart-border-opacity').trim() || "1",
      fontSizeDesktop: computedStyle.getPropertyValue('--chart-font-size').trim() || '10px',
      fontSizeMobile: computedStyle.getPropertyValue('--mobile-chart-font-size').trim() || '16px',

       tooltipBg: computedStyle.getPropertyValue('--chart-tooltip-bg').trim() || 'rgba(0, 0, 0, 0.8)',
       tooltipPadding: parseInt(computedStyle.getPropertyValue('--chart-tooltip-padding'), 10) || 10,
       tooltipXAlign: computedStyle.getPropertyValue('--chart-tooltip-x-align').trim() || 'center',
       tooltipYAlign: computedStyle.getPropertyValue('--chart-tooltip-y-align').trim() || 'center',
       tooltipTitleColor: computedStyle.getPropertyValue('--chart-tooltip-title-color').trim() || '#000',
       tooltipBodyColor: computedStyle.getPropertyValue('--chart-tooltip-body-color').trim() || '#000',
       tooltipBorderColor: computedStyle.getPropertyValue('--chart-tooltip-border-color').trim() || 'transparent',
       tooltipBorderWidth: parseInt(computedStyle.getPropertyValue('--chart-tooltip-border-width'), 10) || 1      
    };
  }

  let settings = getChartDesignSettings();
  const rootStyles = window.getComputedStyle(document.documentElement);

  // 폰트 크기 계산 구역
  const desktopFontSize = parseInt(settings.fontSizeDesktop, 10) || 10;
  const mobileFontSize = parseInt(settings.fontSizeMobile, 10) || 16;
  const isMobile = window.matchMedia('(max-width: 1023px)').matches;
  const currentWidth = window.innerWidth || document.documentElement.clientWidth;
  const finalIsMobile = isMobile || (currentWidth > 0 && currentWidth < 1024);
  let chartFontSize = finalIsMobile ? mobileFontSize : desktopFontSize; 

  Chart.defaults.font.size = chartFontSize; 

  // 3. 데이터셋 추출 (CSS 변수 기반 그래프 색상 및 투명도 반영)
  const data = {
    labels: labelsElement.getAttribute("data-values").split(","), 
    datasets: datasets.map((dataset, index) => {
      const defaultColors = ["255, 99, 132", "54, 162, 235", "153, 102, 255"];
      const rawColor = rootStyles.getPropertyValue(`--chart-color-${index}`).trim();
      const rgbColor = convertToRgbString(rawColor) || (defaultColors[index] || "128, 128, 128");
      // CSS에서 점 모양과 크기 변수를 실시간으로 읽어옵니다.
      const cssPointStyle = rootStyles.getPropertyValue('--chart-point-style').trim() || 'circle';
      const cssPointSize = parseInt(rootStyles.getPropertyValue('--chart-point-size'), 10) || 4;  
       // 문자열 데이터를 숫자 배열로 변환
      const parsedData = dataset.getAttribute("data-values").split(",").map(Number); 
      // 모든 값이 0이거나 비어있는지 검사합니다.
      const isAllZeroOrEmpty = parsedData.every(val => val === 0 || isNaN(val));

      // '열린 괄호(' 기호를 기준으로 data-label의 글자를 쪼갭니다.
      const rawLabel = dataset.getAttribute("data-label") || "";
      const splitLabel = rawLabel.includes("(") 
        ? [rawLabel.split("(")[0].trim(), "(" + rawLabel.split("(")[1]] 
        : rawLabel;
      
      return {
        label: splitLabel, 
        data: parsedData, 
        backgroundColor: `rgba(${rgbColor}, ${settings.bgOpacity})`,
        borderColor: `rgba(${rgbColor}, ${settings.borderOpacity})`,
        pointBackgroundColor:`rgba(${rgbColor}, ${settings.borderOpacity})`,
        borderWidth: 2, 
        hidden: isAllZeroOrEmpty,
        pointStyle: cssPointStyle, // 별 모양 등으로 변경
        radius: cssPointSize,      // 평소 점 크기
        hoverRadius: cssPointSize + 2 // 마우스 올렸을 때 점 크기
      };
    }),
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
          color: settings.textColor, 
          boxWidth: 12,
          padding: 10,
          font: { size: chartFontSize },
          usePointStyle: true, //나중에 범례 모양을 기본으로 바꾸고 싶다면 false로 바꾸면 됨. 참고로 기본은 내부가 불투명한 사각형
        },
      },
    tooltip: {
          backgroundColor: settings.tooltipBg,      
          padding: settings.tooltipPadding,          
          titleFont: { size: chartFontSize },
          bodyFont: { size: chartFontSize },
 
         // 커서 위치는 그대로 따라다니되, 말풍선 위치만 CSS 변수 값으로 매핑합니다!
          xAlign: settings.tooltipXAlign,
          yAlign: settings.tooltipYAlign,
          titleColor: settings.tooltipTitleColor,
          bodyColor: settings.tooltipBodyColor,
          borderColor: settings.tooltipBorderColor,
          borderWidth: settings.tooltipBorderWidth      
    },
    }
  };

  // 5. Radar Chart 옵션
  const radarOptions = {
    ...commonOptions, 
    maintainAspectRatio: true, 
    scales: {
      r: {
        beginAtZero: true, 
        suggestedMax: 5, 
        ticks: { 
          color: settings.textColor, 
          backdropColor: 'transparent', 
          showLabelBackdrop: false,
          font: { size: chartFontSize - 4 }
        },
        grid: { color: settings.gridColor }, 
        angleLines: { color: settings.gridColor }, 
        pointLabels: {
          color: settings.textColor, 
          font: { 
            size: chartFontSize,
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
          color: settings.textColor,
          font: { size: chartFontSize } 
        }, 
        grid: { color: settings.gridColor }, 
      },
      y: {
        beginAtZero: true, 
        ticks: { 
          color: settings.textColor,
          font: { size: chartFontSize }
        }, 
        grid: { color: settings.gridColor }, 
      },
    },
  };

  // 7. 차트 생성 실행 함수화 (재사용을 위해 함수로 묶음)
  const radarCanvas = document.getElementById("radarChart");
  const barCanvas = document.getElementById("barChart");

  function renderCharts() {
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

  // 첫 실행
  renderCharts();

  // 브라우저 창 크기가 바뀔 때 글자 크기 실시간 리사이징 대응
  window.addEventListener('resize', function() {
    const currentIsMobile = window.innerWidth < 1024;
    const nextFontSize = currentIsMobile ? mobileFontSize : desktopFontSize;

    if (Chart.defaults.font.size !== nextFontSize) {
      Chart.defaults.font.size = nextFontSize;
      radarOptions.scales.r.pointLabels.font.size = nextFontSize;
      if(barOptions.scales.x.ticks.font) barOptions.scales.x.ticks.font.size = nextFontSize;
      if(barOptions.scales.y.ticks.font) barOptions.scales.y.ticks.font.size = nextFontSize;
      
      renderCharts();
    }
  });

  // ★ [핵심 추가] 다크모드 버튼 실시간 변경 스캔 감지기 활성화
  const observer = new MutationObserver(() => {
    // 다크모드로 바뀌면 CSS 변수 값을 새로 가져옵니다.
    const updated = getChartDesignSettings();
    const currentRootStyles = window.getComputedStyle(document.documentElement);

    // 1. 공통 옵션 변수 업데이트
    commonOptions.plugins.legend.labels.color = updated.textColor;
      //말풍선 변수 업데이트
    commonOptions.plugins.tooltip.backgroundColor = updated.tooltipBg;
    commonOptions.plugins.tooltip.titleColor = updated.tooltipTitleColor;
    commonOptions.plugins.tooltip.bodyColor = updated.tooltipBodyColor; 
    commonOptions.plugins.tooltip.borderColor = updated.tooltipBorderColor;    
    
    // 2. 레이더 차트 옵션 업데이트
    radarOptions.scales.r.ticks.color = updated.textColor;
    radarOptions.scales.r.grid.color = updated.gridColor;
    radarOptions.scales.r.angleLines.color = updated.gridColor;
    radarOptions.scales.r.pointLabels.color = updated.textColor;

    // 3. 바 차트 옵션 업데이트
    barOptions.scales.x.ticks.color = updated.textColor;
    barOptions.scales.x.grid.color = updated.gridColor;
    barOptions.scales.y.ticks.color = updated.textColor;
    barOptions.scales.y.grid.color = updated.gridColor;

    // 4. 그래프 본체 색상 및 투명도 실시간 업데이트
    data.datasets.forEach((dataset, index) => {
      const defaultColors = ["255, 99, 132", "54, 162, 235", "153, 102, 255"];
      const rawColor = currentRootStyles.getPropertyValue(`--chart-color-${index}`).trim();
      const rgbColor = convertToRgbString(rawColor) || (defaultColors[index] || "128, 128, 128");
      
      dataset.backgroundColor = `rgba(${rgbColor}, ${updated.bgOpacity})`;
      dataset.borderColor = `rgba(${rgbColor}, ${updated.borderOpacity})`;
    });

    // 5. 변경된 스타일 주입 후 리렌더링
    renderCharts();
  });

  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

}

// ★ [수정 완료] 메인 마스터 컨트롤러(script.js)가 호출할 수 있는 전역 연결 고리
window.setupWikiChart = function() {
  initWikiChartSystem();
};

// 새로고침 시점에 이미 다크모드가 선언되어 있다면 즉시 가동
if (document.documentElement.getAttribute("data-theme")) {
  initWikiChartSystem();
}

