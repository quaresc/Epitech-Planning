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
var firstDate;
var lastDate;
var registeredEvents;

$(document).ready(function() {

    $("#weeklyDatePicker").datetimepicker({
        format: 'DD-MM-YYYY',
        locale: 'fr'
    });
    
    $('#weeklyDatePicker').on('dp.change', function(e) {
        var value = $("#weeklyDatePicker").val();
        firstDate = moment(value, "DD-MM-YYYY").day(1).format("DD-MM-YYYY");
        lastDate = moment(value, "DD-MM-YYYY").day(7).format("DD-MM-YYYY");
        $("#weeklyDatePicker").val(firstDate + " - " + lastDate);
        $("#planning").empty();
        $("#info").empty();
        getTodayPlanning();
    });
    
    $('#planningFilter').click(function() {
	$(this).toggleClass('toggle');
	$(".input-group").toggleClass('toggle');
	if ($("#planningFilter").html() == "Cette semaine") {
            $("#planningFilter").html("Aujourd'hui");
            firstDate = null;
            lastDate = null;
	} else {
            $("#planningFilter").html("Cette semaine");
            firstDate = moment(todayDate, "YYYY-MM-DD").day(1).format("DD-MM-YYYY");
            lastDate = moment(todayDate, "YYYY-MM-DD").day(7).format("DD-MM-YYYY");
	}
	$("#planning").empty();
	$("#info").empty();
	getTodayPlanning();
    });
    
    $("#download").click(function(){
	if (registeredEvents.length > 0) {
            downloadPlanning();
	}
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

function getRegisteredEvents(result) {
    var results = [];

    for (var i = 0; i < result.length; i++) {

        var obj = result[i];

        for (var key in obj) {
            var value = obj[key];

            if (key == "event_registered" && (value == "registered" || value == "present")) {
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
  'use strict';
  
  var ical = require(["js/ical-generator/"]),
      cal = ical({
        domain: 'intra.epitech.eu',
        prodId: '//clement.quaresma//Epitech-Planning//FR',
        name: 'Epitech-Planning'  
      });
  
  $.each(registeredEvents, function(i, item) {
    var eventBegin = new Date(registeredEvents[i].start),
        eventEnding = new Date(registeredEvents[i].end),
        event = cal.createEvent({
          start: eventBegin,
          end: eventEnding,
          summary: registeredEvents[i].acti_title,
          description: registeredEvents[i].acti_title,
          url: getLink(registeredEvents[i])
        });
  });
  window.open("data:text/calendar;charset=utf8," + escape(cal.toString()));
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
                    var options = {weekday: "long", year: "numeric", month: "long", day: "numeric"};
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

function getTodayPlanning() {
    var url;
    if (!firstDate && !lastDate) {
        url = 'https://intra.epitech.eu/planning/load?format=json&start=' +
            todayDate + '&end=' + todayDate;
    } else {
        url = 'https://intra.epitech.eu/planning/load?format=json&start=' +
            moment(firstDate, "DD-MM-YYYY").format("YYYY-MM-DD") + '&end=' + moment(lastDate, "DD-MM-YYYY").format("YYYY-MM-DD");
    }

    console.log(url);
    var req = new XMLHttpRequest();
    req.open('GET', url, true);

    req.onload = function() {
        if (this.readyState === XMLHttpRequest.DONE) {
            if (this.status === 200) {
                var json = req.responseText;
                var result = JSON.parse(json);
                registeredEvents = getRegisteredEvents(result);
                
                /* Local storage for caching
                 ***************************
                 * localStorage.setItem('save', JSON.stringify(registeredEvents));
                 */
                console.log("Saving planning...");
                displayPlanning();
            }
            if (this.status === 401) {
                $('<h2>').text("Connectez vous !").appendTo('#planning');
                $('#planning').prepend('<a target="_blank" href="' + office365 + '"><img id="office" class="img-fluid" src="images/office365.png"/></a>');
            }
        }
    };
    req.send();
}

document.addEventListener('DOMContentLoaded', function() {
  /* Local storage for caching
   ***************************
   *  var save = localStorage.getItem('save');
   * console.log(save);
   * if (save !== null) {
   *    console.log("Retrieving saved planning...");
   *     save = JSON.parse(save);
   *    displayPlanning(save);
   * } else {
   *    console.log("New planning");
   *     getTodayPlanning();
   *}
   */
    getTodayPlanning();
});
