작성시 ![참고용](https://gist.github.com/ihoneymon/652be052a0727ad59601)

# 기본적으로 들어가야 하는 스타일과 스크립트
```html
<link rel="stylesheet" href="/suna-star/skin/css/style.css">
<link rel="stylesheet" href="/suna-star/skin/css/wiki.css">

<script type="text/javascript" defer src="/suna-star/skin/js/footnote-click.js"></script>
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script> 
<script src="/suna-star/skin/js/wiki-chart.js"></script>
```


# 전체 틀
```html
<div id="wiki">
  <div class="module">
    이 안에 밑에 이어지는 코드를 상황에 맞게 넣으면 된다.

    <!--각주 자동으로 들어가는 곳-->
    <div class="footnote">  
    </div>
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
                <!--0.큰 타이틀-->
                <a href="#목차2">2.
                </a> 카테고리 명<br />
                <!--0.0 타이틀-->
                  <a class="index" href="#목차5-0">5.0.
                  </a> 카테고리 명<br />
                <!--0.0.0 타이틀-->
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
                <figure class="flag-img">
                  <img src="국기 이미지 주소">
        <!--이미지 주소 정보 
            /suna-star/data/kr.jpg = 대한민국
            /suna-star/data/JP.gif = 일본
            /suna-star/data/US.gif = 미국
            /suna-star/data/VN.gif = 베트남
          -->
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


## 접고피는 카테고리 별로 넣기

#  0.큰 타이틀
```html

<!--    <details open> = 열려있는게 기본,
        <details> = 닫혀 있는게 기본    -->

    <details open>
      <summary class="text1">
        <h2 class="one-title">
          <span>
            <ion-icon name="chevron-down-outline"></ion-icon>
          </span> 
          <b>
          <a href="#목차" name="목차(타이틀 번호(숫자로만 띄어쓰기 없이 적을 것))">
            타이틀 번호(숫자로만 적을 것).
          </a> 
            타이틀
          </b>
        </h2>
      </summary>
<!--이 밑에서 부터 내용을 넣으면 된다.-->
</details>
```

#  0.0 타이틀
```html
      <details>
        <summary class="text1">
          <h2 class="two-title">
          <span>
            <ion-icon name="chevron-down-outline"></ion-icon>
          </span>
          <b>
            <a href="#목차" name="목차(타이틀 번호1)-(타이틀 번호2)">(타이틀 번호1).(타이틀 번호2)</a> 
            타이틀
          </b>
          </h2>
        </summary>
<!--이 밑에서 부터 내용을 넣으면 된다.-->
</details>
```

#  0.0.0 타이틀
```html
          <details open>
              <summary class="text1">
                <h2 class="three-title">
                  <span>
                    <ion-icon name="chevron-down-outline"></ion-icon>
                  </span> 
                  <b>
                    <a href="#목차" name="목차(타이틀 번호1)-(타이틀 번호2)-(타이틀 번호3)">
                      (타이틀 번호1).(타이틀 번호2).(타이틀 번호3)
                    </a>
                    타이틀
                  </b>
                </h2>
              </summary>
<!--이 밑에서 부터 내용을 넣으면 된다.-->
</details>
```

## 스포일러 주의설명 칸
```html
<table id="spoiler-coution">
      <tbody>
        <tr>
          <td>
            <span>
              이 문서에
            </span>
            <a href="https://namu.wiki/w/%EC%8A%A4%ED%8F%AC%EC%9D%BC%EB%9F%AC" rel="noopener">
              스포일러
            </a>
            <span>
              가 포함되어 있습니다.
            </span>
            <br />
            <br />
            이 문서가 설명하는 작품이나 인물 등에 대한 줄거리, 결말, 반전 요소 등을 직&middot;간접적으로 포함하고 있습니다.
          </td>
        </tr>
      </tbody>
    </table>
```

## 스포일러 더보기
```html
      <details class="spoiler">
          <summary>
            <h4>스포일러 더보기</h4>     
          </summary> 
         내용
</details>
```

## 각주 넣는 법
```html
<!--각주 번호는 js로 자동으로 붙으니 신경쓰지 말기.-->
             <span>
                각주 외부의 내용 혹은 단어
                <a href="#각주" name="돌아가기">
                  <sup></sup>
                </a>
                <p class="text1">
                  <a href="#돌아가기" name="각주"></a>
                    여기에 각주 내용
                </p>
              </span>
```

## 임무 횟수 표
```html
   <table id="mission">
      <tbody>
        <tr>
          <th class="mission-table-title" colspan='6'>
            <span>임무표</span><br>
          </th>
        </tr>
        <tr>
          <th>랭크 / <br class="re-br"> 횟수(회)</th>
          <th>D랭크</th>
          <th>C랭크</th>
          <th>B랭크</th>
          <th>A랭크</th>
          <th>S랭크</th>
        </tr>
        <tr>
          <th>1부</th>
          <td>(불명)</td>
          <td>9</td>
          <td>1</td>
          <td>1</td>
          <td>0</td>
        </tr>
        <tr>
          <th>2부</th>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
        </tr>
      </tbody>
```

## 패러미터
```html
<!--표 안에 숫자를 넣으면 자동으로 데이터 설정 안에 값이 들어가게 js로 작업 해둠.-->
<table id="parameters">
        <tbody>
          <tr>
            <th></th>
            <th>인술</th>
            <th>체술</th>
            <th>환술</th>
            <th>현명함</th>
            <th>힘</th>
            <th>속도</th>
            <th>스테<br class="re-br">미나</th>
            <th>인<br class="re-br">맺기</th>
            <th>총합</th>
          </tr>
          <tr data-age="1부 (12~13세)">
            <th>
              12~
              <br class="re-br">
              13세
            </th>
            <td class="mission">
              2.5
            </td>
            <td>1</td>
            <td>2</td>
            <td>3</td>
            <td>1</td>
            <td>2</td>
            <td>1</td>
            <td>3</td>
            <td>15.5</td>
          </tr>
          <tr data-age="2부 (16~17세)">
            <th>16~
              <br class="re-br">
              17세
            </th>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
           <tr data-age="The Last (19세)">
            <th>19세</th>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
           <tr data-age="보루토 (32세)">
            <th></th>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
          </tr>          
        </tbody>
      </table>
      <div class="chart-container">
        <div class="chart-box">
          <canvas id="radarChart"></canvas>
        </div>
        <div class="chart-box">
          <canvas id="barChart"></canvas>
        </div>
      </div>
      
      <!-- 데이터 설정 -->
      <div id="chart-data" style="display: none;">
      </div>  
<!--이 js들은 차트 만드는데 필요하므로 꼭 필요함.-->
      <script src="https://cdn.jsdelivr.net/npm/chart.js"></script> 
      <script src="/suna-star/skin/js/wiki-chart.js"></script>
```

## 인간 관계, 술법 설명 관련
```html
  <ul class="mark-on-ul">
        <li>
          <b>관계성을 설명할 상대 캐릭터 이름
              혹은
              술법명
          </b>
          관계성 혹은 술법에 대한 설명
        </li>
        <li>
          <b>관계성을 설명할 상대 캐릭터 이름2
              혹은
              술법명2
          </b>
          관계성 혹은 술법에 대한 설명2
        </li>
</ul>
```
## 기본적인 사각형 칸(숫자로 번호 매김)
```html
              <ol class="ol-number">
                <li>
                </li>
                <li>
                </li>
              </ol>

```

## 대사 발췌 란

### 간단한 내용(한 명이 말한 내용)
```html
        <table class="text-one-line">
        <tbody>
          <tr style="height: auto;">
            <td>
              내용
            </td>
          </tr>
        </tbody>
        </table>
```

### 어디서 발췌했는지 나오는 곳
```html
      <table class="text-two-line">
        <tbody>
          <tr style="height: auto;">
            <td>
              내용
              <hr>
              <a id="text-blue" href="#">여기서 나온 대사 中 </a>
            </td>
          </tr>
        </tbody>
      </table>
```

### 대화(말이 길어 보기 힘들면 사용, 보통은 바로 위의 것을 사용함.
```html
      <table class="text-one-line">
        <tbody>
          <tr style="height: auto;">
            <td>
              <div class="dialogue">
                <div class="character-name">캐릭터명:</div>
                <div class="character-line">대사</div>
              </div>
              <div class="dialogue">
                <div class="character-name">캐릭터명:</div>
                <div class="character-line">대사</div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
```
