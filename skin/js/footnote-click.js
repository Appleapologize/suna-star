/* 위키 각주 시스템 및 말풍선 팝업 제어 스크립트 */

// 메인 로더(script.js)가 페이지를 화면에 꽂은 직후 이 함수를 강제로 원격 호출합니다.
window.setupMenuLinks = function() {
  initFootnoteSystem();
};

function initFootnoteSystem() {
  let footnoteCounter = 1;
  
  // 1. [초정밀 매칭 고정] href 속성이 정확히 "#각주"로 시작하는 링크들을 싹 긁어모읍니다.
  const footnoteLinks = document.querySelectorAll('a[href^="#각주"]');
  const footnotesContainer = document.querySelector("div.footnote");

  if (!footnoteLinks.length || !footnotesContainer) {
    console.warn("각주 요소 또는 하단 .footnote 컨테이너 상자를 찾을 수 없습니다.");
    return;
  }

  // 2. [💥 진짜 해결책 - 중복 생성 차단 검증] 
  // 위키 페이지를 들락날락할 때 각주가 무한대로 중복 복사되어 생성되는 것을 물리적으로 원천 차단합니다.
  const alreadyGenerated = footnotesContainer.querySelector("p.text1");
  if (!alreadyGenerated) {
    footnoteLinks.forEach((a) => {
      const sup = a.querySelector("sup");
      const p = a.nextElementSibling;
      const content = p ? p.innerHTML.trim() : null;

      if (!sup || !p || !content) return;

      const currentNumber = footnoteCounter++;
      
      // 진짜 주석 번호와 꼬리표 링크를 매칭하여 강제로 글자를 갈아끼웁니다.
      a.setAttribute("href", `#fn-${currentNumber}`);
      a.setAttribute("name", `ref-${currentNumber}`);
      a.setAttribute("id", `ref-id-${currentNumber}`);
      sup.textContent = `[${currentNumber}]`;

      // 3. 하단 각주 컨테이너 박스 내부에 순서대로 리스트를 빌드하여 주입합니다.
      const newFootnote = document.createElement("p");
      newFootnote.className = "text1";
      newFootnote.id = `fn-${currentNumber}`;
      newFootnote.innerHTML = `<a href="#ref-${currentNumber}" style="text-decoration:none; font-weight:bold;">[${currentNumber}]</a> ${content}`;
      footnotesContainer.appendChild(newFootnote);
    });
  }

  // 4. 화면을 채워줄 투명 말풍선(tooltip)이 본문에 존재하는지 수색하고 없으면 즉시 생성합니다.
  let tooltip = document.querySelector(".tooltip");
  if (!tooltip) {
    tooltip = document.createElement("div");
    tooltip.className = "tooltip";
    document.body.appendChild(tooltip);
  }

  // 5. 마우스 클릭 시 말풍선을 켜고 좌표를 칼같이 정렬해주는 핵심 클릭 컨트롤러
  footnoteLinks.forEach((a) => {
    const sup = a.querySelector("sup");
    const p = a.nextElementSibling;
    const content = p ? p.textContent.replace(/^\[\d+\]\s*/, "").trim() : "";

    a.onclick = function(e) {
      e.preventDefault();
      e.stopPropagation();

      const match = sup.textContent.match(/\[(\d+)\]/);
      if (!match) return;
      const currentNumber = parseInt(match[1]);
      const isMobile = window.matchMedia("(max-width: 767px)").matches;

      // 데스크톱 / 모바일 기기별 팝업 레이아웃 텍스트 분기 처리
      if (isMobile) {
        tooltip.innerHTML = `
          <div class="tooltip-number">${currentNumber}</div>
          <hr class="tooltip-divider">
          <div class="tooltip-content">${content}</div>
          <button class="tooltip-close">닫기</button>
        `;
      } else {
        tooltip.innerHTML = `
          <button class="tooltip-close">X</button>
          <div class="tooltip-number">${currentNumber}</div>
          <hr class="tooltip-divider">
          <div class="tooltip-content">${content}</div>
        `;
      }

      // 💥 [위치 연산 수정]: display: block을 먼저 켜야만 컴퓨터가 오차 없이 말풍선의 실제 가로세로 높이를 잽니다.
      tooltip.style.display = "block";

      if (isMobile) {
        tooltip.style.position = "fixed";
        tooltip.style.bottom = "0px";
        tooltip.style.left = "50vw";
        tooltip.style.transform = "translateX(-50%)";
        tooltip.style.width = "calc(100vw - 30px)";
        tooltip.style.maxWidth = "100vw";
        tooltip.style.top = "auto";
      } else {
        const rect = sup.getBoundingClientRect();
        tooltip.style.position = "absolute";
        tooltip.style.transform = "none";
        // 주석 번호 바로 우측 상단 근처에 이쁘게 안착하도록 계산
        tooltip.style.left = `${rect.left + window.pageXOffset + rect.width + 5}px`;
        tooltip.style.top = `${rect.top + window.pageYOffset - tooltip.offsetHeight / 2}px`;
      }

      // 말풍선 내부 닫기 버튼 온클릭 회로 연결
      const closeButton = tooltip.querySelector(".tooltip-close");
      if (closeButton) {
        closeButton.onclick = function(event) {
          event.stopPropagation();
          tooltip.style.display = "none";
        };
      }
    };
  });
}

// 6. 페이지를 완전 생 새로고침(F5)했을 때도 먹통 현상이 생기지 않도록 방어 조치 가동
if (document.readyState !== "loading") {
  initFootnoteSystem();
} else {
  document.addEventListener("DOMContentLoaded", initFootnoteSystem);
}
