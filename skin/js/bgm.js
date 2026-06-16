let player; // YouTube 플레이어 객체 전역 변수 선언
let currentIndex = 0; // 현재 곡 인덱스 추적

// 1. 유튜브 API 스크립트 강제 주입
let tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
let firstScriptTag = document.getElementsByTagName('script')[0];
if (firstScriptTag && firstScriptTag.parentNode) {
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}

// YouTube Iframe API가 준비되면 호출되는 함수
function onYouTubeIframeAPIReady() {
    let playlistId = 'PLrWUB4lPqAdRnSyYg7aTXG5On7jbuUqoO'; // 재생목록 ID
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

// 플레이어가 준비되면 호출되는 함수
function onPlayerReady(event) {
    event.target.mute(); // 브라우저 차단 정책을 피하기 위해 우선 음소거로 재생을 시작해 둡니다.
    event.target.playVideo(); 
}

// 플레이어 상태가 변할 때 호출되는 함수
function onPlayerStateChange(event) {
    if (event.data == YT.PlayerState.PLAYING) {
         let status = document.getElementById('bgmStatus');
        if (status) status.setAttribute("value", "play");
        
        updateVideoTitle(); 
    }
}

// 현재 재생 중인 동영상의 제목을 업데이트하는 함수
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

// 다음 곡, 이전 곡, 재생/멈춤 기능을 처리하는 함수
function bgm(action) {
    let status = document.getElementById('bgmStatus');
    let marqueeText = document.getElementById('marqueeText');

    if (action == 'play') {
        if (player && player.playVideo) {
            player.unMute(); // 💡 재생 버튼을 클릭하는 순간 음소거가 완벽히 풀리며 음악이 나옵니다.
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

// 브라우저의 강제 음소거 정책을 우회하기 위해 사용자가 첫 화면을 클릭하면 소리를 켜줍니다.
document.addEventListener("DOMContentLoaded", () => {
    document.body.addEventListener('click', function initialPlay() {
        if (player && typeof player.playVideo === 'function') {
            player.unMute();
            player.playVideo();
            document.body.removeEventListener('click', initialPlay);
        }
    }, { once: true });
});
