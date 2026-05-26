/* 위키 각주 시스템 및 반응형 말풍선 팝업 제어 스크립트 (최종형) */

// 💡 메인 로더(script.js)가 페이지를 주입하자마자 이 연동 스위치를 강제로 원격 호출하여 404를 차단합니다.
window.setupMenuLinks = function() {
  initFootnoteSystem();
};

function initFootnoteSystem() {
  let footnoteCounter = 1;
  const footnoteLinks = document.querySelectorAll('a[href="#각주"][name="돌아가기"]');
  const footnotesContainer = document.querySelector("div.footnote");

  if (!footnoteLinks.length || !footnotesContainer) {
    return;
  }

  // 중복 생성 방지 가드 (이미 화면 하단에 각주 리스트 p 태그들이 만들어졌다면 생성을 건너뜁니다)
  const alreadyGenerated = footnotesContainer.querySelector("p.text1");
  if (!alreadyGenerated) {
    footnoteLinks.forEach((a) => {
      const sup = a.querySelector("sup");
      const p = a.nextElementSibling;
      const content = p ? p.innerHTML.trim() : null;

      if (!sup || !p || !content) return;

      const currentNumber = footnoteCounter++;
      
      // 비동기 환경에서도 확실하게 href와 일련번호 글자를 갈아끼웁니다.
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

  // 본문에 말풍선(tooltip)이 존재하지 않는다면 즉시 생성하고 있으면 재사용합니다.
  let tooltip = document.querySelector(".tooltip");
  if (!tooltip) {
    tooltip = document.createElement("div");
    tooltip.className = "tooltip";
    document.body.appendChild(tooltip);
  }

  // 말풍선 팝업 바인딩 구간
  footnoteLinks.forEach((a) => {
    const sup = a.querySelector("sup");
    const p = a.nextElementSibling;
    const content = p ? p.textContent.replace(/^\[\d+\]\s*/, "").trim() : "";

    // 직접 대입 방식으로 브라우저 메모리에 온클릭 회로를 연결합니다.
    a.onclick = function(e) {
      e.preventDefault();
      e.stopPropagation();

      const match = sup.textContent.match(/\[(\d+)\]/);
      if (!match) return;
      const currentNumber = parseInt(match);
      const isMobile = window.matchMedia("(max-width: 767px)").matches;

      let tooltipContent;

      // 데스크톱 구조 정의
      tooltipContent = `
        <button class="tooltip-close">X</button>
        <div class="tooltip-number">${currentNumber}</div>
        <hr class="tooltip-divider">
        <div class="tooltip-content">${content}</div>
      `;

      // 모바일 조건에 따라 덮어쓰기
      if (isMobile) {
        tooltipContent = `
          <div class="tooltip-number">${currentNumber}</div>
          <hr class="tooltip-divider">
          <div class="tooltip-content">${content}</div>
          <button class="tooltip-close">닫기</button>
        `;
      }

      tooltip.innerHTML = tooltipContent;

      // display: block을 먼저 켜야만 컴퓨터가 오차 없이 말풍선의 실제 렌더링 너비를 정확히 잽니다.
      tooltip.style.display = "block";

      // 스타일 및 위치 설정
      if (isMobile) {
        tooltip.style.position = "fixed";
        tooltip.style.bottom = "0px";
        tooltip.style.left = "48vw";
        tooltip.style.transform = "translateX(-51%)";
        tooltip.style.width = "calc(100vw - 30px)";
        tooltip.style.maxWidth = "100vw";
        tooltip.style.top = "auto";
      } else {
        const rect = sup.getBoundingClientRect();
        tooltip.style.position = "absolute";
        tooltip.style.transform = "translate(-52%, -105%)";
        tooltip.style.left = `${rect.left + window.pageXOffset + rect.width / 2}px`;
        tooltip.style.top = `${rect.top + window.pageYOffset - 10}px`;
      }

      // 닫기 버튼 작동 회로 연결
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

// 안전 이중 가드: 완전 생 새로고침(F5)을 했을 때도 루프가 돌 수 있도록 처리합니다.
if (document.readyState !== "loading") {
  initFootnoteSystem();
} else {
  document.addEventListener("DOMContentLoaded", initFootnoteSystem);
}

// 각주 번호 링크 클릭 시 부드럽게 스크롤로 가주는 기능
document.body.addEventListener("click", (event) => {
  const clickedElement = event.target;
  if (clickedElement.tagName === "A" && clickedElement.getAttribute("href")?.includes("#각주")) {
    const targetId = clickedElement.getAttribute("href").split("#").pop();
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth" });
      event.preventDefault();
    }
  }
});
