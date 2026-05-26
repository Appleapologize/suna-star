/* 위키 각주 시스템 및 반응형 말풍선 팝업 제어 스크립트 */

// 💡 [💥 진짜 해결책 1]: 메인 시스템(script.js)이 페이지를 주입하자마자 이 함수를 강제 수색하여 실행하도록 전역에 연결합니다.
window.setupMenuLinks = function() {
  initFootnoteSystem();
};

function initFootnoteSystem() {
  let footnoteCounter = 1;
  
  // 💡 [💥 진짜 해결책 2]: 속성 매칭 오류를 차단하기 위해 href가 '#각주'로 시작하는 모든 링크를 유연하고 확실하게 잡아냅니다.
  const footnoteLinks = document.querySelectorAll('a[href^="#각주"]');
  const footnotesContainer = document.querySelector("div.footnote");

  if (!footnoteLinks.length || !footnotesContainer) {
    console.warn("각주 대상 <a> 태그 또는 하단 div.footnote 상자를 찾을 수 없습니다.");
    return;
  }

  // 중복 생성 방지 가드 (이미 화면 하단에 각주 목록 p 태그들이 만들어졌다면 생성을 건너뜁니다)
  const alreadyGenerated = footnotesContainer.querySelector("p.text1");
  if (!alreadyGenerated) {
    footnoteLinks.forEach((a) => {
      const sup = a.querySelector("sup");
      const p = a.nextElementSibling;
      const content = p ? p.innerHTML.trim() : null;

      if (!sup || !p || !content) return;

      const currentNumber = footnoteCounter++;
      
      // HTML 마크업과 연동되도록 href와 고유 주소 아이디를 동적으로 순서대로 갈아끼웁니다.
      a.setAttribute("href", `#fn-${currentNumber}`);
      a.setAttribute("name", `ref-${currentNumber}`);
      a.setAttribute("id", `ref-id-${currentNumber}`);
      sup.textContent = `[${currentNumber}]`;

      const footnoteLink = p.querySelector("a[name='각주']");
      if (footnoteLink) {
        footnoteLink.setAttribute("href", `#ref-${currentNumber}`);
        footnoteLink.setAttribute("name", `fn-link-${currentNumber}`);
        footnoteLink.textContent = `[${currentNumber}]`;
      }

      // 3. 비어있던 하단 <div class="footnote"> 내부에 순서대로 리스트를 빌드하여 자동 주입합니다.
      const newFootnote = document.createElement("p");
      newFootnote.className = "text1";
      newFootnote.id = `fn-${currentNumber}`;
      newFootnote.innerHTML = `<a href="#ref-id-${currentNumber}" style="text-decoration:none; font-weight:bold;">[${currentNumber}]</a> ${content}`;
      footnotesContainer.appendChild(newFootnote);
    });
  }

  // 화면에 띄워줄 투명 말풍선(tooltip)이 본문에 존재하지 않는다면 즉시 생성합니다.
  let tooltip = document.querySelector(".tooltip");
  if (!tooltip) {
    tooltip = document.createElement("div");
    tooltip.className = "tooltip";
    document.body.appendChild(tooltip);
  }

  // 4. 주석 번호를 마우스로 클릭했을 때 기기별 최적의 위치에 팝업을 열어주는 제어장치
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

      // 데스크톱과 모바일 화면의 닫기 버튼 위상 배치 분기 처리
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

      // 💥 [너비 계측 오류 수정]: display: block을 무조건 먼저 선언해야 브라우저가 오차 없이 실제 말풍선 크기를 잽니다!
      tooltip.style.display = "block";

      if (isMobile) {
        // 모바일 버전: 화면 밑바닥에 딱 달라붙는 바(Bar) 연출 고정
        tooltip.style.position = "fixed";
        tooltip.style.bottom = "0px";
        tooltip.style.left = "50vw";
        tooltip.style.transform = "translateX(-50%)";
        tooltip.style.width = "calc(100vw - 30px)";
        tooltip.style.maxWidth = "100vw";
        tooltip.style.top = "auto";
      } else {
        // 데스크톱 버전: 주석 번호 우측 상단 머리 위에 깔끔하게 꼬리 달고 안착
        const rect = sup.getBoundingClientRect();
        tooltip.style.position = "absolute";
        tooltip.style.transform = "translate(-52%, -105%)"; // 제공해주신 CSS 말풍선 꼬리 좌표 규칙 정밀 계승
        tooltip.style.left = `${rect.left + window.pageXOffset + rect.width / 2}px`;
        tooltip.style.top = `${rect.top + window.pageYOffset - 10}px`;
      }

      // 말풍선 내부의 닫기 버튼 기능 작동 처리
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

// 5. 안전 가드: 페이지가 새로고침(F5) 되거나 최초 진입할 때도 독립 구동되도록 가동합니다.
if (document.readyState !== "loading") {
  initFootnoteSystem();
} else {
  document.addEventListener("DOMContentLoaded", initFootnoteSystem);
}

// 각주 번호 링크 클릭 시 부드럽게 스크롤로 가주는 기능
document.body.addEventListener("click", (event) => {
  const clickedElement = event.target;
  if (clickedElement.tagName === "A" && clickedElement.getAttribute("href")?.includes("#fn-")) {
    const targetId = clickedElement.getAttribute("href").split("#").pop();
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth" });
      event.preventDefault();
    }
  }
});
