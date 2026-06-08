/* ==========================================================================
   [통합 마스터 컨트롤러] 위키 각주 시스템 및 실시간 다크모드 대응 차트 엔진
   ========================================================================== */

// 💡 [최상단 마스터 키]: 메인 로더(script.js)가 페이지를 주입하자마자 이 두 시스템을 동시 가동합니다.
window.setupMenuLinks = function() {
  initFootnoteSystem();
  initWikiChartSystem();
};

/* ------------------------------------------------------------------------
   1. 위키 각주 및 반응형 말풍선 팝업 시스템
   ------------------------------------------------------------------------ */
function initFootnoteSystem() {
  let footnoteCounter = 1;
  const footnoteLinks = document.querySelectorAll('a[href="#각주"][name="돌아가기"]');
  const footnotesContainer = document.querySelector("div.footnote");

  if (!footnoteLinks || !footnotesContainer) {
    return;
  }

  const alreadyGenerated = footnotesContainer.querySelector("p.text1");
  if (!alreadyGenerated) {
    footnoteLinks.forEach((a) => {
      const sup = a.querySelector("sup");
      const p = a.nextElementSibling;
      const content = p ? p.innerHTML.trim() : null;

      if (!sup || !p || !content) return;

      const currentNumber = footnoteCounter++;
      a.href = `#각주${currentNumber}`;
      a.name = `돌아가기${currentNumber}`;
      sup.textContent = `[${currentNumber}]`;

      const footnoteLink = p.querySelector("a[name='각주']");
      if (footnoteLink) {
        footnoteLink.href = `#돌아가기${currentNumber}`;
        footnoteLink.name = `각주${currentNumber}`;
        footnoteLink.textContent = `[${currentNumber}]`;
      }

      const newFootnote = document.createElement("p");
      newFootnote.className = "text1";
      newFootnote.id = `각주${currentNumber}`;
      newFootnote.innerHTML = `<a href="#돌아가기${currentNumber}" name="각주${currentNumber}">[${currentNumber}]</a> ${content}`;
      footnotesContainer.appendChild(newFootnote);
    });
  }

  let tooltip = document.querySelector(".tooltip");
  if (!tooltip) {
    tooltip = document.createElement("div");
    tooltip.className = "tooltip";
    document.body.appendChild(tooltip);
  }

  /* ------------------------------------------------------------------------
 [수정] 데스크톱은 Hover(마우스) / 모바일은 Click(터치) 반응형 이원화 시스템
 ------------------------------------------------------------------------ */
footnoteLinks.forEach((a) => {
 const sup = a.querySelector("sup");
 const p = a.nextElementSibling;
 const content = p ? p.textContent.replace(/^\[\d+\]\s*/, "").trim() : "";

 // 말풍선 HTML 콘텐츠를 동적으로 생성하는 내부 헬퍼 함수
 function updateTooltipContent(isMobile) {
   const currentNumber = parseInt(sup.textContent.match(/\[(\d+)\]/)[1]);
   let tooltipContent = `
     <button class="tooltip-close">X</button>
     <div class="tooltip-number">${currentNumber}</div>
     <hr class="tooltip-divider">
     <div class="tooltip-content">${content}</div>
   `;
   if (isMobile) {
     tooltipContent = `
       <div class="tooltip-number">${currentNumber}</div>
       <hr class="tooltip-divider">
       <div class="tooltip-content">${content}</div>
       <button class="tooltip-close">닫기</button>
     `;
   }
   tooltip.innerHTML = tooltipContent;
 }

 // 말풍선 위치를 실시간 측정 및 정렬하는 내부 헬퍼 함수
 function positionTooltip(isMobile) {
   tooltip.style.display = "block"; // 높이를 정확히 측정하기 위해 먼저 화면에 켭니다.
   
   if (isMobile) {
     tooltip.style.position = "fixed";
     tooltip.style.bottom = "0px";
     tooltip.style.left = "50%";
     tooltip.style.transform = "translateX(-50%)";
     tooltip.style.width = "calc(100vw - 30px)";
     tooltip.style.maxWidth = "100vw";
     tooltip.style.top = "auto";
   } else {
     // [데스크톱 위치 버그 완전 보정]
     tooltip.style.position = "absolute";
     tooltip.style.bottom = "auto";
     tooltip.style.transform = "translateX(-50%)"; // 정중앙 매칭
     tooltip.style.width = ""; 
     tooltip.style.maxWidth = "300px"; 

     // 각주 번호(sup) 요소의 화면상 실제 픽셀 좌표 측정
     const rect = sup.getBoundingClientRect();
     
     // 현재 스크롤된 거리를 정확히 더해 절대 좌표 산출
     const absoluteLeft = rect.left + (window.scrollX || window.pageXOffset);
     const absoluteTop = rect.top + (window.scrollY || window.pageYOffset);

     // 1. 가로 위치 보정
     tooltip.style.left = `${absoluteLeft + (rect.width / 2)}px`;
     
     // 2. 세로 위치 보정: 화면에 켜진 직후의 실제 높이(offsetHeight)를 읽어와 번호 위에 정확히 안착
     const tooltipHeight = tooltip.offsetHeight;
     tooltip.style.top = `${absoluteTop - tooltipHeight - 20}px`;
   }
 }


 // 📱 [모바일 영역]: 터치/클릭 이벤트 바인딩
 a.addEventListener("click", (e) => {
   const isMobile = window.matchMedia("(max-width: 1024px)").matches;
   
   // 모바일 화면일 때만 기존 클릭 차단 및 말풍선 팝업 작동
   if (isMobile) {
     e.preventDefault();
     e.stopPropagation();
     
     updateTooltipContent(true);
     positionTooltip(true);

     const closeButton = tooltip.querySelector(".tooltip-close");
     if (closeButton) {
       closeButton.addEventListener("click", (event) => {
         event.stopPropagation();
         tooltip.style.display = "none";
       });
     }
   } else {
     // 데스크톱 환경에서는 a 태그 본연의 하단 스크롤(해시 링크) 이동을 차단하지 않습니다.
     // 만약 클릭 시 아무 동작도 원치 않으시면 e.preventDefault(); 를 여기에 두셔도 됩니다.
   }
 });

 // 💻 [데스크톱 영역]: 마우스 호버(MouseEnter / MouseLeave) 이벤트 바인딩
 a.addEventListener("mouseenter", () => {
   const isMobile = window.matchMedia("(max-width: 1024px)").matches;
   if (!isMobile) {
     updateTooltipContent(false);
     positionTooltip(false);
     
     // 데스크톱 호버 모드에서는 우측 상단 'X' 버튼을 숨겨 더 깔끔하게 처리 가능
     const closeButton = tooltip.querySelector(".tooltip-close");
     if (closeButton) closeButton.style.display = "none";
   }
 });

 a.addEventListener("mouseleave", () => {
   const isMobile = window.matchMedia("(max-width: 1024px)").matches;
   if (!isMobile) {
     tooltip.style.display = "none";
   }
 });
});


  document.body.addEventListener("click", (event) => {
    const clickedElement = event.target;
    if (clickedElement.tagName === "A" && clickedElement.href.includes("#각주")) {
      const targetId = clickedElement.getAttribute("href").split("#").pop();
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: "smooth" });
      }
      event.preventDefault();
    }
  });
}

/* ------------------------------------------------------------------------
   2. 위키 데이터 기반 차트 시스템 (다크모드 데이터 속성 연동형)
   ------------------------------------------------------------------------ */
function initWikiChartSystem() {
  const chartDataElement = document.getElementById("chart-data");
  if (!chartDataElement) return;

  const datasets = Array.from(chartDataElement.getElementsByClassName("dataset"));
  const labelsElement = chartDataElement.querySelector(".labels");

  if (!labelsElement || datasets.length === 0) return;

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

  // 실시간 html[data-theme="dark"] 속성 체크
  function isDarkMode() {
    return document.documentElement.getAttribute("data-theme") === "dark";
  }

  function getChartColors() {
    if (isDarkMode()) {
      return {
        textColor: "#ffffff",
        gridColor: "rgba(255, 255, 255, 0.15)",
      };
    } else {
      return {
        textColor: "#000000",
        gridColor: "rgba(0, 0, 0, 0.1)",
      };
    }
  }

  let colors = getChartColors();

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
          color: colors.textColor,
        },
      },
    },
  };

  const radarOptions = {
    ...commonOptions,
    scales: {
      r: {
        beginAtZero: true,
        suggestedMax: 5,
        ticks: {
          color: colors.textColor,
          backdropColor: 'transparent'
        },
        grid: {
          color: colors.gridColor,
        },
        angleLines: {
          color: colors.gridColor
        },
        pointLabels: {
          color: colors.textColor
        }
      },
    },
  };

  const barOptions = {
    ...commonOptions,
    scales: {
      x: {
        ticks: {
          color: colors.textColor,
        },
        grid: {
          color: colors.gridColor,
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: colors.textColor,
        },
        grid: {
          color: colors.gridColor,
        },
      },
    },
  };

  // 이전 페이지 잔상 대청소
  if (window.activeRadarChart) window.activeRadarChart.destroy();
  if (window.activeBarChart) window.activeBarChart.destroy();

  const radarCtx = document.getElementById("radarChart")?.getContext("2d");
  if (radarCtx) {
    window.activeRadarChart = new Chart(radarCtx, {
      type: "radar",
      data: data,
      options: radarOptions,
    });
  }

  const barCtx = document.getElementById("barChart")?.getContext("2d");
  if (barCtx) {
    window.activeBarChart = new Chart(barCtx, {
      type: "bar",
      data: data,
      options: barOptions,
    });
  }

  // 다크모드 버튼 실시간 변경 스캔 감지기 활성화
  const observer = new MutationObserver(() => {
    const updatedColors = getChartColors();

    if (window.activeRadarChart) {
      window.activeRadarChart.options.scales.r.ticks.color = updatedColors.textColor;
      window.activeRadarChart.options.scales.r.grid.color = updatedColors.gridColor;
      window.activeRadarChart.options.scales.r.angleLines.color = updatedColors.gridColor;
      window.activeRadarChart.options.scales.r.pointLabels.color = updatedColors.textColor;
      window.activeRadarChart.options.plugins.legend.labels.color = updatedColors.textColor;
      window.activeRadarChart.update('none');
    }

    if (window.activeBarChart) {
      window.activeBarChart.options.scales.x.ticks.color = updatedColors.textColor;
      window.activeBarChart.options.scales.x.grid.color = updatedColors.gridColor;
      window.activeBarChart.options.scales.y.ticks.color = updatedColors.textColor;
      window.activeBarChart.options.scales.y.grid.color = updatedColors.gridColor;
      window.activeBarChart.options.plugins.legend.labels.color = updatedColors.textColor;
      window.activeBarChart.update('none');
    }
  });

  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
}

// 생 새로고침(F5) 가드 조건문 실행
if (document.documentElement.getAttribute("data-theme")) {
  initFootnoteSystem();
  initWikiChartSystem();
}
