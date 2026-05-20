
    // 우클릭 금지 스크립트를 iframe 내부에 삽입하는 함수
    function applyContextMenuBlock(iframeDocument) {
        const script = iframeDocument.createElement('script');
        script.textContent = `
            document.addEventListener('contextmenu', function(e) {
                e.preventDefault();
            });
        `;
        iframeDocument.head.appendChild(script);
    }

    // iframe에 새로운 문서가 로드될 때마다 실행
    function disableContextMenu() {
        const iframe = document.querySelector('iframe[name="frame"]');

        iframe.onload = function() {
            // iframe 안의 현재 문서에 접근
            const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;

            // 우클릭 금지 스크립트 삽입
            applyContextMenuBlock(iframeDocument);

            // a 태그를 클릭하여 iframe이 새 문서를 로드할 때마다 onload 이벤트 재실행
            const links = iframeDocument.querySelectorAll('a');
            links.forEach(link => {
                link.addEventListener('click', function() {
                    iframe.onload = function() {
                        // 새 문서가 로드되면 다시 우클릭 금지 스크립트를 적용
                        const newIframeDocument = iframe.contentDocument || iframe.contentWindow.document;
                        applyContextMenuBlock(newIframeDocument);
                    };
                });
            });
        };
    }

    document.addEventListener('DOMContentLoaded', disableContextMenu);
