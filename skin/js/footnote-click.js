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

  footnoteLinks.forEach((a) => {
    const sup = a.querySelector("sup");
    const p = a.nextElementSibling;
    const content = p ? p.textContent.replace(/^\[\d+\]\s*/, "").trim() : "";

    a.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      const currentNumber = parseInt(sup.textContent.match(/\[(\d+)\]/)[1]);
      const isMobile = window.matchMedia("(max-width: 1024px)").matches;

      let tooltipContent;
      tooltipContent = `
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
      tooltip.style.display = "block";

      if (isMobile) {
        tooltip.style.position = "fixed";
        tooltip.style.bottom = "0px";
        tooltip.style.left = "48vw";
        tooltip.style.transform = "translateX(-51%)";
        tooltip.style.width = "calc(100vw - 30px)";
        tooltip.style.maxWidth = "100vw";
        tooltip.style.top = "auto";
      } else {
        tooltip.style.position = "absolute";
        tooltip.style.bottom = "auto";
        tooltip.style.transform = ""; 
        tooltip.style.width = "";      
        tooltip.style.maxWidth = "";

        const rect = sup.getBoundingClientRect();
        tooltip.style.left = `${rect.left + window.pageXOffset + rect.width - 12}px`;
        tooltip.style.top = `${rect.top + window.pageYOffset - tooltip.offsetHeight - 15}px`;
      }

      const closeButton = tooltip.querySelector(".tooltip-close");
      if (closeButton) {
        closeButton.addEventListener("click", (event) => {
          event.stopPropagation();
          tooltip.style.display = "none";
        });
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
