// 언제든 호출할 수 있도록 함수로 만듭니다.
function loadFriendBanner() {
    fetch('pages/friend-banner.html')
        .then(response => response.text())
        .then(data => {
            const containers = document.querySelectorAll('.banner-module.module.friend-banner');
            containers.forEach(container => {
                container.innerHTML = data;
            });
        })
        .catch(error => console.error('배너 로드 실패:', error));
}

// 처음 메인 페이지가 켜졌을 때도 한 번 실행
document.addEventListener("DOMContentLoaded", loadFriendBanner);
