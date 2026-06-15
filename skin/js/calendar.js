// 💡 [기념일 설정 구역] 원하는 기념일을 자유롭게 추가하세요!
// 'YYYY-MM-DD': { text: '말풍선 문구', type: 'css클래스명' }
const ANNIVERSARIES = {
  '2026-01-01': { text: '신정 (새해)', type: 'anni-star' },
  '2026-05-05': { text: '어린이날 🎉', type: 'anni-circle' },
  '2026-12-25': { text: '크리스마스 🎄', type: 'anni-star' },
};

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
      if (condition === 'month-this') {
        if (thisMonth < 9) month_text = '0' + (thisMonth + 1);
        else month_text = thisMonth + 1;
        var date_text = thisYear + '-' + month_text + '-' + dayText;
      } else if (i < firstDateIndex) {
        if (thisMonth == 0) {
          var yearText = Number(thisYear) - 1;
          month_text = 12;
        } else {
          var yearText = thisYear;
          month_text = thisMonth;
          if (month_text < 10) month_text = '0' + month_text;
        }
        var date_text = yearText + '-' + month_text + '-' + dayText;
      } else if (i >= lastDateIndex) {
        if (thisMonth == 11) {
          var yearText = Number(thisYear) + 1;
          month_text = 1;
        } else {
          var yearText = thisYear;
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
          
          // 기념일 데이터 연결
          var anniClass = '', tooltipAttr = '', mobileClickAttr = '';
          if (ANNIVERSARIES[date_text]) {
            anniClass = ' anniversary ' + ANNIVERSARIES[date_text].type;
            tooltipAttr = ` data-title="${ANNIVERSARIES[date_text].text}"`;
            mobileClickAttr = ` onclick="showMobileDesc('${ANNIVERSARIES[date_text].text}')"`;
          }
        
          // 숫자(day-num)와 기호(anni-marker)를 나누어 담은 새로운 태그 구조
          dates[i] = `<div class="month-date ${condition}${selected}${istoday}${weekendClass}${anniClass}" id="day_${date_text}"${tooltipAttr}${mobileClickAttr}>
                        <span class="day-num">${x}</span>
                        <span class="anni-marker"></span>
                      </div>`;
      }

    })
    datesHtml = `<div class="year-text">${thisYear}</div>`;
    datesHtml = datesHtml + `<div class="month-box"><div class="month-text" onclick="document.getElementsByClassName('calendar')[0].innerHTML=getList('${thisYear}-${thisMonth}-${thisDate}', false);"><</div>`;
    datesHtml = datesHtml + `<div class="month-text" style="font-weight:bold;">${thisMonth + 1}</div>`;
    datesHtml = datesHtml + `<div class="month-text" onclick="document.getElementsByClassName('calendar')[0].innerHTML=getList('${thisYear}-${thisMonth + 2}-${thisDate}', false);">></div></div>`;
    datesHtml = datesHtml + `<div class="month-date month-title">일</div><div class="month-date month-title">월</div><div class="month-date month-title">화</div><div class="month-date month-title">수</div><div class="month-date month-title">목</div><div class="month-date month-title">금</div><div class="month-date month-title">토</div>`;
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
  if (window.innerWidth < 768) {
    var mobileDesc = document.getElementById('calendar-mobile-desc');
    if (!mobileDesc) {
      mobileDesc = document.createElement('div');
      mobileDesc.id = 'calendar-mobile-desc';
      mobileDesc.className = 'calendar-mobile-desc';
      document.querySelector('.calendar').after(mobileDesc);
    }
    mobileDesc.innerText = text;
    mobileDesc.style.display = 'block';
  }
}
