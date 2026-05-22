let recipeData = []; 
let dict = {}; 
let player; // YouTube 플레이어 객체 전역 변수
let currentIndex = 0; // 현재 곡 인덱스 추적

// 쿼리스트링을 주소창에 추가하는 함수
function addQueryString(fileName) {
    const url = new URL(window.location);
    url.searchParams.set('pageName', fileName);
    window.history.pushState({ pageName: fileName }, '', url);
}

// [핵심] 사이트가 켜지자마자 가장 먼저 실행되는 구간
document.addEventListener("DOMContentLoaded", () => {
    // 🔒 마우스 우클릭 차단
    document.addEventListener('contextmenu', (event) => {
        event.preventDefault();
    });

    // 1. 테마 설정 (다크모드)
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

    // 2. 주소창의 쿼리스트링 파라미터 확인 후 해당 페이지 로드
    const params = new URLSearchParams(window.location.search);
    const pageName = params.get('pageName') || 'home.html';
    loadPage(null, `pages/${pageName}`, false);

    // 3. 브라우저 뒤로가기 / 앞으로가기 할 때 내용 연동
    window.addEventListener('popstate', function(event) {
        if (event.state && event.state.pageName) {
            loadPage(null, `pages/${event.state.pageName}`, false);
        } else {
            const currentParams = new URLSearchParams(window.location.search);
            const currentPage = currentParams.get('pageName') || 'home.html';
            loadPage(null, `pages/${currentPage}`, false);
        }
    });
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

// ================= 메뉴 관련 js =================

// [기능 1] 다중 드롭다운 메뉴를 열고 닫는 함수
function toggleMenu(event, targetId) {
    if (event) event.stopPropagation(); 
    const targetMenu = document.getElementById(targetId);
    if (targetMenu) {
        targetMenu.classList.toggle('open');
    }
}

// [기능 2] 외부 HTML 파일을 읽어와서 특정 div에 집어넣는 함수
function loadPage(event, relativePath, addHistory = true) {
    if (event) {
        if (typeof event.preventDefault === 'function') event.preventDefault();
        if (typeof event.stopPropagation === 'function') event.stopPropagation();
    }

    const fileName = relativePath.split('/').pop();
    const baseUrl = window.location.pathname.endsWith('/') ? window.location.pathname : window.location.pathname + '/';
    const cleanPath = relativePath.replace(/^\.\//, ''); 
    const finalUrl = window.location.origin + baseUrl + cleanPath;

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

// ================= 유튜브 BGM 관련 js =================

// YouTube API 스크립트 강제 주입
let tag = document.createElement('script');
tag.src = "https://youtube.com";
let firstScriptTag = document.getElementsByTagName('script')[0];
if (firstScriptTag && firstScriptTag.parentNode) {
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}

// YouTube Iframe API가 준비되면 호출되는 함수
function onYouTubeIframeAPIReady() {
    let playlistId = 'PLrWUB4lPqAdRnSyYg7aTXG5On7jbuUqoO'; // 재생목록 ID
    
    // 💡 안전장치: HTML에 <div id="bgm"> 또는 <iframe id="bgm">이 실제로 존재할 때만 생성합니다.
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
    event.target.stopVideo(); // 시작할 때 자동 재생을 원하시면 playVideo()로 변경 가능합니다.
}

function onPlayerStateChange(event) {
    if (event.data == YT.PlayerState.PLAYING) {
        updateVideoTitle(); 
    }
}

// 재생 중인 동영상 제목을 업데이트하는 함수
function updateVideoTitle() {
    let marqueeText = document.getElementById('marqueeText');
    if (!marqueeText) return; // 요소가 없으면 중단

    let titleElement = document.querySelector(`#bgmTitles span[data-video-index="${currentIndex}"]`);
    let title = titleElement ? titleElement.getAttribute('data-title') : null;

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

// 다음 곡, 이전 곡, 재생/멈춤 제어 함수
function bgm(action) {
    let status = document.getElementById('bgmStatus');
    let marqueeText = document.getElementById('marqueeText');

    if (action == 'play') {
        if (player && typeof player.playVideo === 'function') {
            player.playVideo(); 
            if (status) status.setAttribute("value", "play");
            updateVideoTitle();
        }
    } else if (action == 'stop') {
        if (player && typeof player.stopVideo === 'function') {
            player.stopVideo(); 
            if (status) status.setAttribute("value", "stop");
            if (marqueeText) marqueeText.innerText = "음악 정지"; 
        }
    } else if (action == 'next') {
        if (player && typeof player.nextVideo === 'function' && typeof player.getPlaylist === 'function') {
            player.nextVideo(); 
            let playlist = player.getPlaylist();
            if (playlist) {
                currentIndex = (currentIndex + 1) % playlist.length;
            }
            updateVideoTitle();
            if (status) status.setAttribute("value", "next");
        }
    } else if (action == 'prev') {
        if (player && typeof player.previousVideo === 'function' && typeof player.getPlaylist === 'function') {
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
