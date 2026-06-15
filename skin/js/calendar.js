
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
        dates[i] = `<div class="month-date ${condition}${selected}${istoday}" id="day_${date_text}">${x}</div>`;
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