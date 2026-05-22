let recipeData = []; 
let dict = {}; 
let player; // YouTube 플레이어 객체 전역 변수 선언
let currentIndex = 0; // 현재 곡 인덱스 추적

// 1. 유튜브 API 스크립트 표준 주입
let tag = document.createElement('script');
tag.src = "https://youtube.com";
let firstScriptTag = document.getElementsByTagName('script');
if (firstScriptTag && firstScriptTag.parentNode) {
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}

// 쿼리스트링을 주소창에 추가하는 함수
function addQueryString(fileName) {
    const url = new URL(window.location);
    url.searchParams.set('pageName', fileName); 
    window.history.pushState({ pageName: fileName }, '', url); 
}

// [핵심] 사이트가 처음 부팅되자마자 실행되는 통합 구간
document.addEventListener("DOMContentLoaded", () => {
    // 🔒 마우스 우클릭 차단
    document.addEventListener('contextmenu', (event) => {
        event.preventDefault();
    });

    // 테마 설정 (다크모드 토글)
    const themeToggleBtn = document.getElementById("theme-toggle-btn");
    if (themeToggleBtn) {
        const savedTheme = localStorage.getItem("theme") || "light";
        document.documentElement.setAttribute("data-theme", savedTheme);

        themeToggleBtn.addEventListener("click", () => {
            const currentTheme = document.documentElement.getAttribute("data-theme");
            const newTheme = currentTheme === "dark" ? "light" : "dark";
            
            document.documentElement.setAttribute("data-theme", newTheme);
            localStorage.setItem("theme", newTheme);
        });
    }

    // text-logo SVG 클릭 시 홈 화면 연결
    const textLogoSvg = document.querySelector('.text-logo');
    if (textLogoSvg) {
        textLogoSvg.style.cursor = 'pointer'; 
        textLogoSvg.addEventListener('click', (event) => {
            loadPage(event, 'pages/home.html'); 
        });
    }

    // 주소창의 쿼리스트링 파라미터 확인 후 초기 페이지 로드
    const params = new URLSearchParams(window.location.search);
    const pageName = params.get('pageName') || 'home.html';
    loadPage(null, `pages/${pageName}`, false);

    // 브라우저 뒤로가기 / 앞으로가기 처리
    window.addEventListener('popstate', function(event) {
        if (event.state && event.state.pageName) {
            loadPage(null, `pages/${event.state.pageName}`, false);
        } else {
            const currentParams = new URLSearchParams(window.location.search);
            const currentPage = currentParams.get('pageName') || 'home.html';
            loadPage(null, `pages/${currentPage}`, false);
        }
    });

    // 💡 [자동 재생 정책 대응] 브라우저가 음악을 차단하므로, 사용자가 화면 어디든 첫 클릭을 하는 순간 음소거를 해제하고 재생을 시도합니다.
    document.body.addEventListener('click', function initialPlay() {
        if (player && typeof player.playVideo === 'function') {
            player.unMute(); // 음소거 해제
            player.playVideo(); // 재생 시도
            // 한 번만 실행되도록 이벤트를 스스로 제거합니다.
            document.body.removeEventListener('click', initialPlay);
        }
    }, { once: true });
});

// 모바일 메뉴 토글 함수
function toggleMobileMenu() {
    const btn = document.getElementById('menu-toggle-btn');
    const drawer = document.getElementById('mobile-drawer');
    if (btn && drawer) {
        btn.classList.toggle('active');
        drawer.classList.toggle('active');
    }
}

// 다중 드롭다운 메뉴 제어
function toggleMenu(event, targetId) {
    if (event) event.stopPropagation(); 
    const targetMenu = document.getElementById(targetId);
    if (targetMenu) {
        targetMenu.classList.toggle('open');
    }
}

// 외부 HTML을 불러와서 .container에 주입하는 함수
function loadPage(event, relativePath, addHistory = true) {
    if (event) {
        if (typeof event.preventDefault === 'function') event.preventDefault();
        if (typeof event.stopPropagation === 'function') event.stopPropagation();
    }

    const fileName = relativePath.split('/').pop();
    const baseUrl = window.location.pathname.endsWith('/') ? window.location.pathname : window.location.pathname + '/';
    const finalUrl = window.location.origin + baseUrl + 'pages/' + fileName;

    fetch(finalUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`페이지를 불러올 수 없습니다. (상태코드: ${response.status})`);
            }
            return response.text();
        })
        .then(htmlData => {
            const contentArea = document.querySelector('.container');
            if (contentArea) {
                contentArea.innerHTML = htmlData; 
                window.scrollTo(0, 0); 

                if (addHistory) {
                    addQueryString(fileName);
                }
            }
        })
        .catch(error => {
            console.error("Fetch Error:", error);
            const contentArea = document.querySelector('.container');
            if (contentArea) {
                contentArea.innerHTML = `<p style="color:red; padding:20px; font-weight:bold;">⚠️ 에러 발생: ${error.message}<br><span style="font-size:12px; color:#666;">요청 주소: ${finalUrl}</span></p>`;
            }
        });
}

// ================= 🎵 유튜브 BGM 제어 엔진 (보내주신 본래 양식 100% 최적화) =================

function onYouTubeIframeAPIReady() {
    let playlistId = 'PLrWUB4lPqAdRnSyYg7aTXG5On7jbuUqoO'; 
    if (document.getElementById('bgm')) {
        player = new YT.Player('bgm', {
            playerVars: {
                listType: 'playlist',
                list: playlistId,
                autoplay: 1,
                loop: 1,
                disablekb: 1,
                playsinline: 1,
                rel: 0
            },
            events: {
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange 
            }
        });
    }
}

function onPlayerReady(event) {
    // 💡 첫 진입 시 브라우저 정책 우회를 위해 음소거 후 바로 재생 대기 상태로 만듭니다.
    event.target.mute();
    event.target.playVideo();
}

function onPlayerStateChange(event) {
    if (event.data == YT.PlayerState.PLAYING) {
        updateVideoTitle(); 
    }
}

function updateVideoTitle() {
    let titleElement = document.querySelector(`#bgmTitles span[data-video-index="${currentIndex}"]`);
    let title = titleElement ? titleElement.getAttribute('data-title') : null;
    let marqueeText = document.getElementById('marqueeText');

    if (!marqueeText) return;

    if (title) {
        marqueeText.innerText = title;
    } else {
        if (player && typeof player.getVideoData === 'function') {
            let videoData = player.getVideoData(); 
            if (videoData && videoData.title) {
                marqueeText.innerText = videoData.title; 
            }
        }
    }
}

function bgm(action) {
    let status = document.getElementById('bgmStatus');
    let marqueeText = document.getElementById('marqueeText');

    if (action == 'play') {
        if (player && player.playVideo) {
            player.unMute(); // 💡 수동 재생 클릭 시 음소거를 확실히 풀어줍니다.
            player.playVideo(); 
            if (status) status.setAttribute("value", "play");
            updateVideoTitle(); 
        }
    } else if (action == 'stop') {
        if (player && player.stopVideo) {
            player.stopVideo(); 
            if (status) status.setAttribute("value", "stop");
            if (marqueeText) marqueeText.innerText = "음악 정지"; 
        }
    } else if (action == 'next') {
        if (player && player.nextVideo && typeof player.getPlaylist === 'function') {
            player.nextVideo(); 
            let playlist = player.getPlaylist();
            if (playlist) {
                currentIndex = (currentIndex + 1) % playlist.length; 
            }
            updateVideoTitle(); 
            if (status) status.setAttribute("value", "next");
        }
    } else if (action == 'prev') {
        if (player && player.previousVideo && typeof player.getPlaylist === 'function') {
            player.previousVideo(); 
            let playlist = player.getPlaylist();
            if (playlist) {
                currentIndex = (currentIndex - 1 + playlist.length) % playlist.length; 
            }
            updateVideoTitle(); 
            if (status) status.setAttribute("value", "prev");
        }
    }
}
