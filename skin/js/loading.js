function loadLoading() {
    const LoadingContainer = document.querySelector('.loading-ing');
    fetch('../loading.html')
      .then(response => response.text())
      .then(data => {
        LoadingContainer.innerHTML = data;
      })
      .catch(error => console.error('Error', error));
  }

  // 페이지 로드 시 로딩화면이 추가되도록 설정
  document.addEventListener('DOMContentLoaded', loadLoading);

  // 모든 리소스가 로드된 300ms 후에 로딩 창을 제거
  window.onload = function() {
    setTimeout(function(){
      document.querySelector('.loading-ing').style.display = 'none';
    }, 300);
  };