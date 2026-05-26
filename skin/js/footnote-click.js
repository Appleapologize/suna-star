/* 위키 각주 시스템 및 반응형 말풍선 팝업 제어 스크립트 (최종 완결본) */

// 메인 로더(script.js)가 위키 페이지를 주입하는 순간 이 전역 연동 함수를 자동 실행합니다.
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

  // 하단 각주 목록 자동 생성 구간 (중복 생성 방지 가드)
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

  // 본문에 말풍선(tooltip)이 존재하지 않는다면 즉시 자동 생성
  let tooltip = document.querySelector(".tooltip");
  if (!tooltip) {
    tooltip = document.createElement("div");
    tooltip.className = "tooltip";
    document.body.appendChild(tooltip);
  }

  // 말풍선 클릭 토글 및 위치 정렬 구간
  footnoteLinks.forEach((a, index) => {
    const sup = a.querySelector("sup");
    const p = a.nextElementSibling;
    const content = p ? p.textContent.replace(/^\[\d+\]\s*/, "").trim() : "";

    a.onclick = function(e) {
      e.preventDefault();
      e.stopPropagation();

      // 숫자가 NaN으로 뜨는 오류 완벽 방어 처리
      let currentNumber = index + 1;
      if (sup && sup.textContent) {
        const textNum = sup.textContent.replace(/[^0-9]/g, "");
        if (textNum) {
          currentNumber = parseInt(textNum, 10);
        }
      }

      // CSS 파일 내 미디어 쿼리(767px) 조건과 완벽하게 일치하도록 화면 해상도 측정
      const currentWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
      const isMobile = currentWidth <= 767;

      let tooltipContent;

      if (isMobile) {
        // 📱 모바일: 스크린샷 형태 그대로 하단 고정 바 구조 연출
        tooltipContent = `
          <div class="tooltip-number">${currentNumber}</div>
          <hr class="tooltip-divider">
          <div class="tooltip-content">${content}</div>
          <button class="tooltip-close">닫기</button>
        `;
      } else {
        // 💻 데스크톱: 우측 상단 X 버튼 방식 카드 연출
        tooltipContent = `
          <button class="tooltip-close">X</button>
          <div class="tooltip-number">${currentNumber}</div>
          <hr class="tooltip-divider">
          <div class="tooltip-content">${content}</div>
        `;
      }

      tooltip.innerHTML = tooltipContent;

      // 💥 display: block을 먼저 켜야 브라우저가 오차 없이 말풍선의 실제 높이(offsetHeight)를 잽니다.
      tooltip.style.display = "block";

      if (isMobile) {
        // 모바일 스타일 고정 주입
        tooltip.style.position = "fixed";
        tooltip.style.bottom = "0px";
        tooltip.style.left = "50vw";
        tooltip.style.transform = "translateX(-50%)";
        tooltip.style.width = "calc(100vw - 30px)";
        tooltip.style.maxWidth = "100vw";
        tooltip.style.top = "auto";
      } else {
        // 💻 데스크톱 스타일: 제공해주신 CSS 규칙과 100% 매칭
        // CSS 169번째 줄의 transform: translate(-52%, -105%) 규칙이 완벽하게 발동하도록 유도합니다.
        const rect = sup.getBoundingClientRect();
        tooltip.style.position = "absolute";
        tooltip.style.bottom = "auto";
        tooltip.style.transform = ""; // 빈 값으로 비워두어 CSS 파일 내의 원래 transform 효과를 순정 적용
        tooltip.style.width = "";      // 모바일 고정너비 해제하여 CSS max-width: 201px이 먹히도록 초기화
        tooltip.style.maxWidth = "";
        
        // 주석 번호(sup) 글자의 가로축 정중앙을 기준으로 absolute 오차를 자동 계산합니다.
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

// 안전 이중 가드
if (document.readyState !== "loading") {
  initFootnoteSystem();
} else {
  document.addEventListener("DOMContentLoaded", initFootnoteSystem);
}

// 하단 리스트 클릭 시 부드러운 스크롤 이동
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
