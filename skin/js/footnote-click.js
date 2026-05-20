document.addEventListener("DOMContentLoaded", function () {
  let footnoteCounter = 1;
  const footnoteLinks = document.querySelectorAll('a[href="#각주"][name="돌아가기"]');
  const footnotesContainer = document.querySelector("div.footnote");

  if (!footnoteLinks || !footnotesContainer) {
    console.error("필요한 요소가 없습니다. <a> 태그 또는 <div class='footnote'>가 있는지 확인하세요.");
    return;
  }

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

  const tooltip = document.createElement("div");
  tooltip.className = "tooltip";
  document.body.appendChild(tooltip);

  footnoteLinks.forEach((a) => {
    const sup = a.querySelector("sup");
    const p = a.nextElementSibling;
    const content = p ? p.textContent.replace(/^\[\d+\]\s*/, "").trim() : "";

    a.addEventListener("click", (e) => {
      e.preventDefault();

      const currentNumber = parseInt(sup.textContent.match(/\[(\d+)\]/)[1]);
      const isMobile = window.matchMedia("(max-width: 767px)").matches;

      let tooltipContent;

      // 데스크톱 구조 먼저 정의
      tooltipContent = `
        <button class="tooltip-close">X</button> <!-- 데스크톱: 맨 위 버튼 -->
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
          <button class="tooltip-close">닫기</button> <!-- 모바일: 맨 아래 버튼 -->
        `;
      }

      tooltip.innerHTML = tooltipContent;

      // 스타일 및 위치 설정
      if (isMobile) {
        tooltip.style.position = "fixed";
        tooltip.style.bottom = "0px";
        tooltip.style.left = "48vw";
        tooltip.style.transform = "translateX(-51%)";
        tooltip.style.width = "calc(100vw - 30px)";
        tooltip.style.maxWidth = "100vw";
      } else {
        const rect = sup.getBoundingClientRect();
        tooltip.style.left = `${rect.left + window.pageXOffset + rect.width - 12}px`;
        tooltip.style.top = `${rect.top + window.pageYOffset - tooltip.offsetHeight - 15}px`;
      }

      tooltip.style.display = "block";

      // 닫기 버튼 이벤트 핸들러 등록 (모바일/데스크톱 공통)
      const closeButton = tooltip.querySelector(".tooltip-close");
      closeButton.addEventListener("click", () => {
        tooltip.style.display = "none"; // 닫기 버튼 클릭 시 말풍선 숨기기
      });
    });
  });

  document.body.addEventListener("click", (event) => {
    const clickedElement = event.target;

    if (clickedElement.tagName === "A") {
      if (clickedElement.href.includes("#각주")) {
        const targetId = clickedElement.getAttribute("href").replace("#", "");
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          targetElement.scrollIntoView();
        }
        event.preventDefault();
      }
    }
  });
});
