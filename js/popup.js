// MIT License
// Copyright (c) 2017 Clement Quaresma
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

var todayDate = getTodayDate();
var office365 = "https://login.microsoftonline.com/common/oauth2/authorize?response_type=code&client_id=e05d4149-1624-4627-a5ba-7472a39e43ab&redirect_uri=https%3A%2F%2Fintra.epitech.eu%2Fauth%2Foffice365&state=%2F";
var firstDate, lastDate, registeredEvents;
var exportFrom, exportTo;
var mode = 0;

$(document).ready(function() {
    $(".dropdown-toggle").dropdown();
    
    $("#weeklyDatePicker").datetimepicker({
        format: 'DD-MM-YYYY',
        locale: 'fr'
    });
    
    $("#exportFrom").datetimepicker({
        format: 'DD-MM-YYYY',
        locale: 'fr'
    });
    
    $("#exportTo").datetimepicker({
        format: 'DD-MM-YYYY',
        locale: 'fr'
    });
    
    $('#exportFrom').on('dp.change', function(e) {
        var value = $("#exportFrom").val();
        exportFrom = moment(value, "DD-MM-YYYY").format("DD-MM-YYYY");
        $("#exportFrom").val(exportFrom);
    });
    
    $('#exportTo').on('dp.change', function(e) {
        var value = $("#exportTo").val();
        exportTo = moment(value, "DD-MM-YYYY").format("DD-MM-YYYY");
        $("#exportTo").val(exportTo);
    });
    
    $('#weeklyDatePicker').on('dp.change', function(e) {
        var value = $("#weeklyDatePicker").val();
        firstDate = moment(value, "DD-MM-YYYY").day(1).format("DD-MM-YYYY");
        lastDate = moment(value, "DD-MM-YYYY").day(7).format("DD-MM-YYYY");
        $("#weeklyDatePicker").val(firstDate + " - " + lastDate);
        $("#planning").empty();
        $("#info").empty();
        getPlanning(moment(firstDate, "DD-MM-YYYY").format("YYYY-MM-DD"), moment(lastDate, "DD-MM-YYYY").format("YYYY-MM-DD"), displayPlanning);
        $("#planningFilter").text("Semaine du :");
    });

    $('#planningFilter').click(function() {
        $(this).toggleClass('toggle');
        $(".input-group").toggleClass('toggle');
        $("#planning").empty();
        $("#info").empty();
        if (mode) {
            mode = 0;
            $("#weeklyDatePicker").val("");
            $("#planningFilter").text("Aujourd'hui");
            firstDate = null;
            lastDate = null;
            getPlanning(todayDate, todayDate, displayPlanning);
        } else {
            mode = 1;
            $("#weeklyDatePicker").val("");
            $("#planningFilter").text("Cette semaine");
            getCurrentWeek();
            getPlanning(moment(firstDate, "DD-MM-YYYY").format("YYYY-MM-DD"), moment(lastDate, "DD-MM-YYYY").format("YYYY-MM-DD"), displayPlanning);
        }
    });

    $("#exportButton").click(function() {
      downloadPlanning();
    });
});

function getTodayDate() {
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1; //January is 0!
    var yyyy = today.getFullYear();

    if (dd < 10) {
        dd = '0' + dd;
    }

    if (mm < 10) {
        mm = '0' + mm;
    }

    today = yyyy + '-' + mm + '-' + dd;
    return today;
}

function getCurrentWeek() {
    firstDate = moment(todayDate, "YYYY-MM-DD").day(1).format("DD-MM-YYYY");
    lastDate = moment(todayDate, "YYYY-MM-DD").day(7).format("DD-MM-YYYY");
}

function getRegisteredEvents(result) {
    var results = [];

    for (var i = 0; i < result.length; i++) {

        var obj = result[i];

        for (var key in obj) {
            var value = obj[key];
            if (key == "event_registered" && value !== false) {
                results.push(obj);
            }
        }
    }
    results.sort(function(a, b) {
        return new Date(a.start) - new Date(b.start);
    });
    return results;
}

function getLink(data) {
    return ('<a target=_blank" href="https://intra.epitech.eu/module/' +
        data.scolaryear + '/' + data.codemodule + '/' + data.codeinstance +
        '/' + data.codeacti + '">' + data.acti_title + '</a>');
}

function downloadPlanning() {
    if (!$("#exportFrom").val() || !$("#exportTo").val()) {
      alert('nope');
    } else {
      var planning = "BEGIN:VCALENDAR\r\n" +
      "VERSION:2.0\r\n" +
      "PRODID:-//quaresc/epitechplanning//NONSGML v1.0//EN\r\n";
      
      getPlanning(moment(exportFrom, "DD-MM-YYYY").format("YYYY-MM-DD"), moment(exportTo, "DD-MM-YYYY").format("YYYY-MM-DD"), createICAL);
}

function createICAL() {
      $.each(registeredEvents, function(i, item) {
        
      console.log(registeredEvents[i].acti_title);
          var event =
              "BEGIN:VEVENT\r\n" +
              "UID:" + moment(registeredEvents[i].start).format("YYYYMMDD") + "T" +
              moment(registeredEvents[i].start).format("HHmmss") + "\r\n" +
              "DTSTAMP:" + moment(registeredEvents[i].start).format("YYYYMMDD") + "T" +
              moment(registeredEvents[i].start).format("HHmmss") + "\r\n" +
              "DTSTART:" + moment(registeredEvents[i].start).format("YYYYMMDD") + "T" +
              moment(registeredEvents[i].start).format("HHmmss") + "\r\n" +
              "DTEND:" + moment(registeredEvents[i].end).format("YYYYMMDD") + "T" +
              moment(registeredEvents[i].end).format("HHmmss") + "\r\n" +
              "SUMMARY:" + registeredEvents[i].acti_title + "\r\n" +
              "LOCATION:" + registeredEvents[i].room.code.substring(registeredEvents[i].room.code.lastIndexOf("/") + 1) + "\r\n" +
              "END:VEVENT\r\n";
  
          planning += event;
      });
  
      planning += "END:VCALENDAR\r\n";
      
      
      var planningData = new Blob([planning], {
          type: 'text/calendar;charset=utf-8;'
      });
      
      var link = document.createElement('a');
  
      link.href = window.URL.createObjectURL(planningData);
      link.setAttribute('download', 'planning-' + exportFrom + '-' + exportTo);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
}

function displayPlanning() {
    if (registeredEvents.length === 0) {
        $('<h2>').text((!firstDate ? "Rien aujourd'hui !" : "Rien cette semaine !")).appendTo('#info');
    } else {
        $(function() {
            var currentDay;

            $.each(registeredEvents, function(i, item) {
                var start = new Date(registeredEvents[i].start);
                if (start.getDay() !== currentDay) {
                    currentDay = start.getDay();
                    var options = {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                    };
                    $('<tr data-toggle="collapse" data-target=".day' + start.getDay() + '">').append(
                        $('<td class="bg-primary" colspan="4">').text(start.toLocaleDateString("fr-FR", options))
                    ).appendTo('#planning');
                }

                var end = new Date(registeredEvents[i].end);

                $('<tr class="collapse in day' + start.getDay() + ' event' + i + '">').append(
                    $('<td class="title">').append(getLink(registeredEvents[i])),
                    $('<td class="start">').text(start.getHours() + "h" + (start.getMinutes() < 10 ? '0' : '') + start.getMinutes()),
                    $('<td class="end">').text(end.getHours() + "h" + (end.getMinutes() < 10 ? '0' : '') + end.getMinutes()),
                    $('<td class="room">').text(registeredEvents[i].room.code.substring(registeredEvents[i].room.code.lastIndexOf("/") + 1))
                ).appendTo('#planning');

                if (registeredEvents[i].event_registered == "present") {
                    $(".event" + i).addClass("bg-success");
                }
            });

        });
    }
}

function getPlanning(start, end, callback) {
    console.log(start + end);
    var url = 'https://intra.epitech.eu/planning/load?format=json&start=' +
    start + '&end=' + end;

    var req = new XMLHttpRequest();
    req.open('GET', url, true);

    req.onload = function() {
        if (this.readyState === XMLHttpRequest.DONE) {
            if (this.status === 200) {
                var json = req.responseText;
                var result = JSON.parse(json);
                registeredEvents = getRegisteredEvents(result);
                callback();
            }
            if (this.status === 401) {
                $('<h2>').text("Connectez vous !").appendTo('#planning');
                $('#planning').prepend('<a target="_blank" href="' + office365 +
                '"><img id="office" class="img-fluid" src="images/office365.png"/></a>');
            }
        }
    };
    req.send();
}

document.addEventListener('DOMContentLoaded', function() {
    getPlanning(todayDate, todayDate, displayPlanning);
});