    // URL에서 테마 정보 읽기
    const urlParams = new URLSearchParams(window.location.search);
    const theme = urlParams.get('theme');
    if (theme === 'dark') {
        document.documentElement.classList.add('theme--dark');
    }

    // 부모 페이지에서 메시지 수신
    window.addEventListener('message', (event) => {
        if (event.data && event.data.theme) {
            const isDarkMode = event.data.theme === 'dark';
            document.documentElement.classList.toggle('theme--dark', isDarkMode);

            // 자식 iframe 새로고침
            location.reload();
        }
    });
