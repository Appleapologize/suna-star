작성시 ![참고용](https://gist.github.com/ihoneymon/652be052a0727ad59601)

# 기본적으로 들어가야 하는 스타일과 스크립트
```html
<link rel="stylesheet" href="/suna-star/skin/css/style.css">
<link rel="stylesheet" href="/suna-star/skin/css/wiki.css">

<script type="text/javascript" defer src="/suna-star/skin/js/footnote-click.js"></script>
```


# 전체 틀
```html
<div id="wiki">
  <div class="module">
    이 안에 밑에 이어지는 코드를 상황에 맞게 넣으면 된다.
  </div>
</div>
```

## 위키 가장 위(분류표)
```html
<h3 class="classification">분류 :
  <a href="#">
    나루토 / <!--여기에 캐릭터 이름은 넣으면 된다.-->
  </a>
</h3>
<br><br>
```

## 위키 목차와 프로필 표
항상 같이 묶어둬야 데스크톱에서는 좌우로 나열 된다.
```html
<div id="profile-top">
  <div id="profile-index">
      <!--목차-->
        <table class="index" border="1">
          <tbody>
            <tr>
              <a name="목차"></a>
              <td class="index"><span class="index-title">목차</span><br />
                <a href="#목차1" name="#index">1.
                </a> 개요<br />
                <a href="#목차2">2.
                </a> 카테고리 명<br />
                  <a class="index" href="#목차5-0">5.0.
                  </a> 카테고리 명<br />
                    <a class="iindex" href="#목차5-2-1">5.2.1.
                    </a> 카테고리 명<br />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!--프로필-->
      <div>
      <table class="profile">
        <tbody>
        <tr class="profile-name">
          <td colspan='3'>
            <span>
              <!--캐릭터 한글 이름명-->
            </span>
            <br>
            <span class="ruby">
              <!--캐릭터 일본어 이름명-->
              <rt>
                <!--이 사이에는 발음인 후리가나 사용-->
              </rt> 
              ｜ <!--캐릭터 영어 이름명-->
            </span>
          </td>
        </tr>
          <tr>
            <td class="profil-img" colspan='3'>
              <figure class="profile-img">
                <img class="profile" 
                  src="여기에 이미지 주소 넣기 임시 주소는 https://placehold.co/799x1730/jpg 로 넣기" 
                  width="400" 
                  height="866"
                  data-origin-width="799" 
                  data-origin-height="1730" 
                  data-filename="IMG_4304.png" 
                  data-mce-src="여기에 이미지 주소 넣기" 
                  data-is-animation="false">
              </figure>
            </td>
          </tr>
          <tr>
            <th class="table-title" style="border-top:none">
              <span>내용</span>
            </th>
            <td colspan='2' colspan='2'>
              <span>내용<br>(이름으로 친다면 여기에 일본어)</span>
            </td>
          </tr>
          <tr class="profile-2">
            <th class="voice">
              <span>성우</span>
            </th>
            <td id="country">
              <span>
                <figure>
                  <img src="국기 이미지 주소">
                </figure>
              </span>
            </td>
            <td>
              <span>
                <!--국기에 맞는 성우명-->
              </span>
            </td>
          </tr>
       </tbody>
      </table>
</div>
```


