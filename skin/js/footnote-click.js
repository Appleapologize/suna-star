/* ==========================================================================
   [통합 마스터 컨트롤러] 위키 각주 시스템 및 실시간 다크모드 대응 차트 엔진
   ========================================================================== */

// 💡 [최상단 마스터 키]: 메인 로더(script.js)가 페이지를 주입하자마자 이 두 시스템을 동시 가동합니다.
window.setupMenuLinks = function() {
  initFootnoteSystem();
};

/* ------------------------------------------------------------------------
   1. 위키 각주 및 반응형 말풍선 팝업 시스템
   ------------------------------------------------------------------------ */
function initFootnoteSystem() {
  let footnoteCounter = 1;
   const wikiContainer = document.querySelector('#wiki');
      if (!wikiContainer) return; // 페이지에 #wiki 영역이 없으면 스크립트 중단

   const footnoteLinks = wikiContainer.querySelectorAll('a[href="#각주"][name="돌아가기"]');
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
   const cleanContent = content.replace(/\[\d+\]\s*/g, "").trim();
   let tooltipContent = `
     <button class="tooltip-close">X</button>
     <div class="tooltip-number">${currentNumber}</div>
     <hr class="tooltip-divider">
     <div class="tooltip-content">${cleanContent}</div>
   `;
   if (isMobile) {
     tooltipContent = `
       <div class="tooltip-number">${currentNumber}</div>
       <hr class="tooltip-divider">
       <div class="tooltip-content">${cleanContent}</div>
       <button class="tooltip-close">닫기</button>
     `;
   }
   tooltip.innerHTML = tooltipContent;
 }

 // 말풍선 위치를 실시간 측정 및 정렬하는 내부 헬퍼 함수
 function positionTooltip(isMobile) {
   tooltip.style.display = "block"; // 높이를 정확히 측정하기 위해 먼저 화면에 켭니다.
   
   if (isMobile) {
      
     } else {
     // [데스크톱 위치 버그 완전 보정]
     tooltip.style.bottom = " ";
     tooltip.style.transform = " "; // "translateX(-50%)" 정중앙 매칭

     // 각주 번호(sup) 요소의 화면상 실제 픽셀 좌표 측정
     const rect = sup.getBoundingClientRect();
     const absoluteLeft = rect.left + (window.scrollX || window.pageXOffset);
     const absoluteTop = rect.top + (window.scrollY || window.pageYOffset);
     const anchorCenter = absoluteLeft + (rect.width / 2); // 각주 번호의 정중앙 X좌표

     // 화면 너비 및 안전 여백 변수 정의 (★ 빼놓으셨던 필수 변수 추가)
     const viewportWidth = window.innerWidth;
     const tooltipWidth = tooltip.offsetWidth; // 말풍선의 실제 가로 너비

     // [데스크톱 전용] CSS 변수 두 개를 가져와서 더하기
     const rootStyles = window.getComputedStyle(document.documentElement);
     const containerPadding = parseFloat(rootStyles.getPropertyValue('--container-padding')) || 15;
     const paddingInBody = parseFloat(rootStyles.getPropertyValue('--padding-in-body')) || 0;

     // 데스크톱 최종 안전 여백 생성
     const padding = containerPadding + paddingInBody;
      
     // 말풍선 기본 왼쪽 위치 계산
     let tooltipLeft = anchorCenter - (tooltipWidth / 2);      

       // [화면 이탈 방지 처리] 말풍선이 화면 왼쪽이나 오른쪽을 뚫고 나가면 화면 안으로 강제 고정
      if (tooltipLeft < padding) {
       tooltipLeft = padding; 
     } else if (tooltipLeft + tooltipWidth > viewportWidth - padding) {
       tooltipLeft = viewportWidth - padding - tooltipWidth; 
     }
      // 계산된 최종 가로 위치 설정
     tooltip.style.left = `${tooltipLeft}px`;

     // 말풍선 꼬리(화살표) 위치 보정 (CSS 변수 활용)
     const arrowLeft = anchorCenter - tooltipLeft;
     tooltip.style.setProperty('--arrow-left', `${arrowLeft}px`);
     
     // 세로 위치 보정: 화면에 켜진 직후의 실제 높이를 읽어와 번호 위에 정확히 안착
     const tooltipHeight = tooltip.offsetHeight;
     tooltip.style.top = `${absoluteTop - tooltipHeight - 22}px`;
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

 // 💻 [데스크톱 영역]: 마우스 호버(MouseEnter / MouseLeave) 이벤트 바인딩 "mouseenter"를 "click"으로 바꾸면 클릭이 된다.
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

