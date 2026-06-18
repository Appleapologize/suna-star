document.addEventListener("DOMContentLoaded", function() {
        // 새로 정하신 파일명인 friend_banner.html을 로드합니다.
        fetch('./suna-star/pages/friend_banner.html')
            .then(response => response.text())
            .then(data => {
                const containers = document.querySelectorAll('.banner-module.module.friend_banner');
                containers.forEach(container => {
                    container.innerHTML = data;
                });
            })
            .catch(error => console.error('배너 로드 실패:', error));
    });
