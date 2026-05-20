document.addEventListener("DOMContentLoaded", function () {
  let footnoteCounter = 1;

  const footnoteLinks = document.querySelectorAll('a[href="#각주"][name="돌아가기"]');
  const footnotesContainer = document.querySelector("div.footnote");

  if (!footnoteLinks || !footnotesContainer) {
    console.error("필요한 요소가 없습니다. <a> 태그 또는 <div class='footnote'>가 있는지 확인하세요.");
    return;
  }

  // 각주 생성 함수
  const createFootnote = (currentNumber, content) => {
    const newFootnote = document.createElement("p");
    newFootnote.className = "text1";
    newFootnote.id = `각주${currentNumber}`;
    newFootnote.innerHTML = `<a href="#돌아가기${currentNumber}" name="각주${currentNumber}">[${currentNumber}]</a> ${content}`;
    footnotesContainer.appendChild(newFootnote);
  };

  footnoteLinks.forEach((a) => {
    const sup = a.querySelector("sup");
    const p = a.nextElementSibling;
    const content = p?.innerHTML.trim();

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

    // 각주 생성
    createFootnote(currentNumber, content);
  });

  // 말풍선 생성
  const tooltip = document.createElement("div");
  tooltip.className = "tooltip";
  document.body.appendChild(tooltip);

  const showTooltip = (sup, content) => {
    const currentNumber = parseInt(sup.textContent.match(/\[(\d+)\]/)[1]);
    tooltip.innerHTML = `
      <div class="tooltip-number">${currentNumber}</div>
      <hr class="tooltip-divider">
      <div class="tooltip-content">${content}</div>
    `;
    const rect = sup.getBoundingClientRect();
    tooltip.style.left = `${rect.left + window.pageXOffset + rect.width / 2 - tooltip.offsetWidth / 2}px`;
    tooltip.style.top = `${rect.top + window.pageYOffset - tooltip.offsetHeight - 10}px`;
    tooltip.style.display = "block";
  };

  const hideTooltip = () => {
    tooltip.style.display = "none";
  };

  footnoteLinks.forEach((a) => {
    const sup = a.querySelector("sup");
    const p = a.nextElementSibling;
    const content = p?.textContent.replace(/^\[\d+\]\s*/, "").trim();

    if (sup && content) {
      a.addEventListener("mouseenter", () => showTooltip(sup, content));
      a.addEventListener("mouseleave", hideTooltip);
    }
  });

  // 각주 클릭 이벤트 처리
  document.body.addEventListener("click", (event) => {
    const clickedElement = event.target;
    if (clickedElement.tagName === "A" && clickedElement.href.includes("#각주")) {
      const targetId = clickedElement.getAttribute("href").replace("#", "");
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        targetElement.scrollIntoView();
        event.preventDefault();
      }
    }
  });
});
