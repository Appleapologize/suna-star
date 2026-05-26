/* 위키 각주 시스템 및 반응형 말풍선 팝업 제어 스크립트 */

// 💡 [💥 최상단 마스터 키 연결]: 메인 로더(script.js)가 페이지를 주입하자마자 이 연동 스위치를 강제로 원격 호출하여 404를 차단합니다.
window.setupMenuLinks = function() {
  initFootnoteSystem();
};

function initFootnoteSystem() {
  let footnoteCounter = 1;
  const footnoteLinks = document.querySelectorAll('a[href="#각주"][name="돌아가기"]');
  const footnotesContainer = document.querySelector("div.footnote");

  if (!footnoteLinks || !footnotesContainer) {
    console.error("필요한 요소가 없습니다. <a> 태그 또는 <div class='footnote'>가 있는지 확인하세요.");
    return;
  }

  // ⭕ [원본 능력 100% 보존] 하단 각주 목록 자동 생성 및 번호 주입 가드
  // 동적 fetch 환경에서 위키 방을 나갔다 들어올 때 주석이 무한 복사되어 생성되는 것을 물리적으로 방어합니다.
  const alreadyGenerated = footnotesContainer.querySelector("p.text1");
  if (!alreadyGenerated) {
    footnoteLinks.forEach((a) => {
      const sup = a.querySelector("sup");
      const p = a.nextElementSibling;
      const content = p ? p.innerHTML.trim() : null;

      if (!sup || !p || !content) {
        console.warn("올바르지 않은 구조:", a);
        return;
      }

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

  // ⭕ [원본 능력 100% 보존] 본문에 말풍선(tooltip)이 없으면 자동 생성, 있으면 재사용
  let tooltip = document.querySelector(".tooltip");
  if (!tooltip) {
    tooltip = document.createElement("div");
    tooltip.className = "tooltip";
    document.body.appendChild(tooltip);
  }

  // ⭕ [원본 능력 100% 보존] 말풍선 클릭 토글 및 위치 제어 구간
  footnoteLinks.forEach((a) => {
    const sup = a.querySelector("sup");
    const p = a.nextElementSibling;
    const content = p ? p.textContent.replace(/^\[\d+\]\s*/, "").trim() : "";

    // 기존의 안정적인 마우스 이벤트 클릭 가드를 정식 바인딩하고 이벤트를 확실하게 보호합니다.
    a.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation(); // 선 레이어 등 다른 요소가 클릭을 뺏어가지 못하게 차단

      const currentNumber = parseInt(sup.textContent.match(/\[(\d+)\]/)[1]);
      const isMobile = window.matchMedia("(max-width: 1024px)").matches;

      let tooltipContent;

      // ⭕ [원본 능력 100% 보존] 데스크톱 구조 먼저 정의
      tooltipContent = `
        <button class="tooltip-close">X</button> <!-- 데스크톱: 맨 위 버튼 -->
        <div class="tooltip-number">${currentNumber}</div>
        <hr class="tooltip-divider">
        <div class="tooltip-content">${content}</div>
      `;

      // ⭕ [원본 능력 100% 보존] 모바일 조건에 따라 완전히 새롭게 재정의
      if (isMobile) {
        tooltipContent = `
          <div class="tooltip-number">${currentNumber}</div>
          <hr class="tooltip-divider">
          <div class="tooltip-content">${content}</div>
          <button class="tooltip-close">닫기</button> <!-- 모바일: 맨 아래 버튼 -->
        `;
      }

      tooltip.innerHTML = tooltipContent;

      // 💥 [버그 수정 1순위]: display: block 전원을 먼저 무조건 켜야만 
      // 브라우저 컴퓨터가 오차 없이 말풍선의 실제 물리적 세로 높이(offsetHeight)를 읽어옵니다!
      tooltip.style.display = "block";

      // 스타일 및 위치 설정
      if (isMobile) {
        tooltip.style.position = "fixed";
        tooltip.style.bottom = "0px";
        tooltip.style.left = "48vw";
        tooltip.style.transform = "translateX(-51%)";
        tooltip.style.width = "calc(100vw - 30px)";
        tooltip.style.maxWidth = "100vw";
        tooltip.style.top = "auto"; // 데스크톱 absolute 잔상 제거
      } else {
        // 💻 데스크톱 버전 고정 연산구역
        // 💥 [버그 수정 2순위]: 모바일 버전으로 한번 작아지고 고정되었던 바닥 잔상 속성들을 깨끗하게 리셋 초기화 시켜줍니다.
        tooltip.style.position = "absolute";
        tooltip.style.bottom = "auto";
        tooltip.style.transform = ""; 
        tooltip.style.width = "";      
        tooltip.style.maxWidth = "";

        const rect = sup.getBoundingClientRect();
        // 원본의 정밀 주석 번호 옆 안착 좌표 연산을 정상 복구 가동합니다.
        tooltip.style.left = `${rect.left + window.pageXOffset + rect.width - 12}px`;
        tooltip.style.top = `${rect.top + window.pageYOffset - tooltip.offsetHeight - 15}px`;
      }

      // ⭕ [원본 능력 100% 보존] 닫기 버튼 이벤트 핸들러 등록 (모바일/데스크톱 공통)
      const closeButton = tooltip.querySelector(".tooltip-close");
      if (closeButton) {
        closeButton.addEventListener("click", (event) => {
          event.stopPropagation();
          tooltip.style.display = "none"; // 닫기 버튼 클릭 시 말풍선 숨기기
        });
      }
    });
  });

  // ⭕ [원본 능력 100% 보존] 하단 리스트 클릭 시 부드럽게 스크롤로 가주는 기능
  document.body.addEventListener("click", (event) => {
    const clickedElement = event.target;

    if (clickedElement.tagName === "A") {
      if (clickedElement.href.includes("#각주")) {
        const targetId = clickedElement.getAttribute("href").split("#").pop();
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: "smooth" }); // 원본의 부드러운 스크롤 복구
        }
        event.preventDefault();
      }
    }
  });
}

// 💡 안전 이중 가드: 메인 로더 없이 단독 가동되거나 F5 생 새로고침을 할 때도 무력화되지 않도록 가이드 설정
if (document.readyState !== "loading") {
  initFootnoteSystem();
} else {
  document.addEventListener("DOMContentLoaded", initFootnoteSystem);
}
