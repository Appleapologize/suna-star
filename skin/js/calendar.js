// 💡 [기념일 설정 구역] 원하는 기념일을 자유롭게 추가하세요!
// 'YYYY-MM-DD': { text: '말풍선 문구', type: 'css클래스명' }
//  중요하지만 생일이 아닌 날에는 isBirthday: false,
// 생일과 생일이 아닌 날이 겹치면 생일로 표현됨.
var FIXED_ANNIVERSARIES = [
  { name: "신정", month: 1, day: 1, holiday: true, important: false },
  { name: "가아라님 생일", month: 1, day: 19 , holiday: false, important: true, isBirthday: true },
  { name: "개천절", month: 3, day: 1, holiday: true, important: false },
  { name: "레이님 생일", month: 3, day: 20 , holiday: false, important: true, isBirthday: true },
  { name: "어린이날", month: 5, day: 5, holiday: true, important: false },
  { name: "칸쿠로님 생일", month: 5, day: 15 , holiday: false, important: true, isBirthday: true },
  { name: "바키님 생일", month: 7, day: 4 , holiday: false, important: true, isBirthday: true }, 
  { name: "테마리님 생일", month: 8, day: 23 , holiday: false, important: true, isBirthday: true },
  { name: "시카마루님 생일", month: 9, day: 22 , holiday: false, important: true, isBirthday: true },
  { name: "나루토님 생일", month: 10, day: 10 , holiday: false, important: true, isBirthday: true },  
  { name: "4차 닌계대전 개전", month: 10, day: 8 , holiday: false, important: true, isBirthday: false },
  { name: "4차 닌계대전 폐전(전쟁이 끝남)", month: 10, day: 10 , holiday: false, important: true, isBirthday: false }, 
  { name: "크리스마스", month: 12, day: 25, holiday: true, important: false }
];


// 2020년 12월 25일부터 
var START_YEAR = 2020;
var START_MONTH = 12;
var START_DAY = 25;
var START_DATE = new Date(START_YEAR, START_MONTH - 1, START_DAY); 


function getList(date = '', day = true, form = 'month') {
  if (date == '') date = new Date();
  else {
    var dates = date.split('-');
    date = new Date(dates[0], dates[1] - 1, dates[2]);
  }
  //date 년,월
  var thisYear = date.getFullYear();
  var thisMonth = date.getMonth();
  var thisDate = date.getDate();
  //저번달 마지막날, 이번달 마지막날
  var thisPrevLast = new Date(thisYear, thisMonth, 0);
  var thisLast = new Date(thisYear, thisMonth + 1, 0);
  var thisPrevLastDate = thisPrevLast.getDate();
  var thisPrevLastDay = thisPrevLast.getDay();
  var thisLastDate = thisLast.getDate();
  var thisLastDay = thisLast.getDay();

  if (form == 'month') {

    var prevMonthDates = [];
    var thisMonthDates = [...Array(thisLastDate + 1).keys()].slice(1);
    var nextMonthDates = [];

    if (thisPrevLastDay !== 6) {
      for (let i = 0; i < thisPrevLastDay + 1; i++) {
        prevMonthDates.unshift(thisPrevLastDate - i);
      }
    }

    for (let i = 1; i < 7 - thisLastDay; i++) {
      nextMonthDates.push(i);
    }

    var dates = prevMonthDates.concat(thisMonthDates, nextMonthDates);

    var firstDateIndex = dates.indexOf(1); //이번달 처음
    var lastDateIndex = dates.lastIndexOf(thisLastDate); //이번달 끝

    var today = new Date();


    dates.forEach((x, i) => {
      var condition = i >= firstDateIndex && i < lastDateIndex + 1 ? 'month-this' : 'month-other';
      if (x < 10) dayText = '0' + x; else dayText = x;
      var month_text = '';
      var yearText = thisYear; // 기본적으로 올해 연도를 베이스로 잡습니다.

      if (condition === 'month-this') {
        if (thisMonth < 9) month_text = '0' + (thisMonth + 1);
        else month_text = thisMonth + 1;
        var date_text = thisYear + '-' + month_text + '-' + dayText;
      } else if (i < firstDateIndex) {
        if (thisMonth == 0) {
          yearText = Number(thisYear) - 1;
          month_text = 12;
        } else {
          yearText = thisYear;
          month_text = thisMonth;
          if (month_text < 10) month_text = '0' + month_text;
        }
        var date_text = yearText + '-' + month_text + '-' + dayText;
      } else if (i >= lastDateIndex) {
        if (thisMonth == 11) {
          yearText = Number(thisYear) + 1;
          month_text = '01'; // 1이 아니라 '01'로 맞춰서 문자열 포맷을 유지합니다.
        } else {
          yearText = thisYear;
          month_text = thisMonth + 2;
          if (month_text < 10) month_text = '0' + month_text;
        }
        var date_text = yearText + '-' + month_text + '-' + dayText;
      }

      var selected = thisDate == x && condition == 'month-this' && day == true ? ' selected' : '';
      var istoday = today.getFullYear() == thisYear && today.getMonth() == thisMonth && today.getDate() == x && condition == 'month-this' ? ' today' : '';
      if (form == 'month') {
        // 주말 계산 (토요일, 일요일 클래스)
        var weekendClass = (i % 7 === 0) ? ' sunday' : (i % 7 === 6 ? ' saturday' : '');
  
        // 현재 처리 중인 칸의 정확한 숫자 날짜 객체 생성
        var currentCellDate = new Date(yearText, Number(month_text) - 1, x);
        var nameList = [];
        var isHoliday = false;
        var isImportant = false;
        var isDdayEvent = false;

        // [A] 매년 반복 기념일 검사
        var isBirthdayEvent = false; // 생일인지 판단

        FIXED_ANNIVERSARIES.forEach(anni => {
          if (anni.month === Number(month_text) && anni.day === x) {
            nameList.push(anni.name);
            if (anni.holiday) isHoliday = true;
            if (anni.important) isImportant = true;
            if (anni.isBirthday) isBirthdayEvent = true; // 생일일 때만 true가 됨
          }
  });

  // [B] 디데이 100일 단위 기념일 검사 (시/분/초 초기화)
  currentCellDate.setHours(0,0,0,0);
  START_DATE.setHours(0,0,0,0);

  var timeDiff = currentCellDate.getTime() - START_DATE.getTime();
  var daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24)); // 소수점 버림 처리
  
  if (daysDiff > 0 && daysDiff % 100 === 0) {
    nameList.push(`${daysDiff}일째 되는 날 💕`);
    isDdayEvent = true;
  }


  // 클래스명 정의 (우선순위별로 마커 종류 분기 가능)
  // 클래스명 초기화
  var anniClass = '';
  var tooltipAttr = '';
  var mobileClickAttr = '';
  
  if (nameList.length > 0) {
    var anniTypeClasses = ''; 

    // [규칙 1] 공휴일인 경우: 노란 원 없이 오직 글자만 빨갛게 제어합니다.
    if (isHoliday) {
      anniTypeClasses += ' anni-holiday';
    } 
    // [규칙 2] 공휴일이 아닌 일반 기념일인 경우
    else {
      // 💡 질문자님 설계대로 딱 생일(isBirthdayEvent)이 true 일 때만 '별모양'을 줍니다!
      if (isImportant && isBirthdayEvent) {
        anniTypeClasses += ' anni-Bday';
      } 
      // 중요(important) 설정이지만 생일이 아닐 때(전쟁 폐전일 등)는 무조건 '노란 원'만 줍니다!
      else if (isImportant && !isBirthdayEvent) {
        anniTypeClasses += ' anni-circle';
      }

      // 만약 100일 단위 디데이 주기가 겹쳤다면 뒤에 하트 클래스도 함께 묻혀줍니다.
      if (isDdayEvent) {
        anniTypeClasses += ' anni-Dday';
      }
    }

    // 최종 결합 (기존 띄어쓰기 문법 완벽 유지)
    anniClass = ' anniversary' + anniTypeClasses;
    
    var combinedTextForMobile = nameList.join('<br/>'); 
    var cleanNameList = nameList.map(function(item) {
        return item.replace(/<br\s*\/?>/gi, '\n');
    });
    // 치환된 순수 데이터들을 다시 줄바꿈(\n) 기호로 결합합니다.
    var combinedTextForDesktop = cleanNameList.join('\n'); 
    // 혹시 모를 연속 줄바꿈 공백 부피 조절
    combinedTextForDesktop = combinedTextForDesktop.replace(/\n+/g, '\n').trim();
    
    /*var combinedText = nameList.join(','); 으로 바꿀거면 
    tooltipAttr = ` data-title="${combinedText}"`;
    mobileClickAttr = ` onclick="showMobileDesc('${combinedText}')"`;*/

    tooltipAttr = ` data-title="${combinedTextForDesktop}"`;
    mobileClickAttr = ` onclick="showMobileDesc('${combinedTextForMobile}')"`;
  }

  // ⭕ [복구] 기념일이 있든 없든 모든 날짜가 안전하게 달력 칸으로 그려지도록 정상 위치에 배치 완료!
  dates[i] = `<div class="month-date ${condition}${selected}${istoday}${weekendClass}${anniClass}" id="day_${date_text}"${tooltipAttr}${mobileClickAttr}>
                <span class="day-num">${x}</span>
                <span class="marker-container">
                  <span class="marker-Bday"></span>
                  <span class="marker-Dday"></span>
                  <span class="marker-circle"></span>
                </span>
              </div>`;
}


    })
    datesHtml = 
      `<div class="year-text">${thisYear}</div>`;
    datesHtml = datesHtml + 
      `<div class="month-box">
        <div class="month-text month-arrow month-prev" onclick="updateAllCalendars('${thisYear}-${thisMonth}-${thisDate}');">
          <
        </div>`;
    datesHtml = datesHtml + 
      `<div class="month-text" style="font-weight:bold;">
        ${thisMonth + 1}
      </div>`;
    datesHtml = datesHtml +
      `<div class="month-text month-arrow month-next" onclick=
        "updateAllCalendars('${thisYear}-${thisMonth + 2}-${thisDate}');">
          >
        </div>
        </div>`;
    datesHtml = datesHtml + 
      `<div class="month-date week">
        <div class="month-date month-title">일</div>
        <div class="month-date month-title">월</div>
        <div class="month-date month-title">화</div>
        <div class="month-date month-title">수</div>
        <div class="month-date month-title">목</div>
        <div class="month-date month-title">금</div>
        <div class="month-date month-title">토</div>
      </div>`;
    datesHtml = datesHtml + dates.join('');

  }

  return datesHtml;
}

// 모든 달력을 동시에 새로고침해 주는 함수
function updateAllCalendars(dateStr) {
  var html = getList(dateStr, false);
  var calendars = document.getElementsByClassName('calendar');
  for (var i = 0; i < calendars.length; i++) {
    calendars[i].innerHTML = html;
  }
  var mobileDesc = document.getElementById('calendar-mobile-desc');
  if (mobileDesc) mobileDesc.style.display = 'none';
}

// 모바일 전용 하단 설명창을 띄워주는 함수
function showMobileDesc(text) {
  if (window.innerWidth < 1025) {
    var mobileDesc = document.getElementById('calendar-mobile-desc');
    if (!mobileDesc) {
      mobileDesc = document.createElement('div');
      mobileDesc.id = 'calendar-mobile-desc';
      mobileDesc.className = 'calendar-mobile-desc';
      document.querySelector('.calendar').after(mobileDesc);
    }
       // 기념일 종류에 따른 추가 클래스 초기화
   var typeClass = '';
   
   // 텍스트 문구 안에 '생일'이나 '일째 되는 날'이 들어있는지 체크하여 분기합니다.
   if (text.includes('생일')) {
     typeClass = ' desc-Bday'; // 생일일 때 붙는 디자인 클래스
   } else if (text.includes('일째 되는 날')) {
     typeClass = ' desc-Dday'; // 100일 단위 디데이일 때 붙는 디자인 클래스
   }
   
   // 기존 클래스를 유지하면서 분기된 typeClass를 함께 입혀줍니다.
   mobileDesc.className = 'calendar-mobile-desc' + typeClass;
    mobileDesc.innerHTML = `
    <div class="desc-text">${text}</div>
    <div class="desc-close-btn" onclick="document.getElementById('calendar-mobile-desc').style.display='none';">설명 닫기</div>
    `;
    mobileDesc.style.display = 'block';
  }

}
