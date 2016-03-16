/* global moment */


// This function parses individual rules returned from the backend into
//  human-readable strings.

export default function ruleToString(rule) {
  var ruleString = "",
      timeString = "",
      a = rule.agenda;

  var daysofwk = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      everyday = daysofwk,
      weekdays = daysofwk.slice(0,5),
      weekends = daysofwk.slice(-2);

  // don't mention the rule if we are outside of the proper season
  if (rule.season_start) {
    var now = moment(),
        startMonth = parseInt(rule.season_start.split("-")[0]),
        startDay   = parseInt(rule.season_start.split("-")[1]),
        endMonth   = parseInt(rule.season_end.split("-")[0]),
        endDay     = parseInt(rule.season_end.split("-")[1]);

    if (startMonth < endMonth && !(now.month() >= startMonth && now.month() <= endMonth)) {
      return; // season start comes 1st in calendar year, current month is not within season
    } else if (startMonth > endMonth && (now.month() < startMonth && now.month() > endMonth)) {
      return; // season start comes 2nd in calendar year, current month is not within season
    } else if (now.month() === startMonth && now.day() < startDay) {
      return; // current month is in start month and current day is before start day
    } else if (now.month() === endMonth && now.day() > endDay) {
      return; // current month is in end month and current day is after end day
    }
    // otherwise, keep going
  }

  // display the restriction type
  var authVehicles = ["police", "fire", "emergency", "diplomat"];
  if (rule.time_max_parking && rule.restrict_types.indexOf("paid") >= 0) {
    ruleString += ("Paid parking, " + rule.time_max_parking + " minutes max ($" + rule.paid_hourly_rate.toFixed(2) + "/hr)");
    if (rule.restrict_types.indexOf("permit") >= 0 && rule.permit_no === "commercial") {
      ruleString += "<br><em>(requires commercial permit)</em>";
    }
  } else if (rule.time_max_parking) {
    ruleString += rule.time_max_parking + " minutes max parking";
    if (rule.restrict_types.indexOf("permit") >= 0) {
      ruleString += "<br><em>(unless permit #" + rule.permit_no + ")</em>";
    }
  } else if (rule.restrict_types.indexOf("permit") >= 0) {
    if (rule.permit_no && isNaN(rule.permit_no)) {
      ruleString += rule.permit_no.charAt(0).toUpperCase()+rule.permit_no.slice(1)+" permits only";
    } else if (rule.permit_no) {
      ruleString += "Permit parking - #"+rule.permit_no+" only";
    } else {
      ruleString += "Permit parking only";
    }
  } else if (rule.restrict_types.indexOf("cleaning") >= 0) {
    ruleString += "Street cleaning - No parking";
  } else if (rule.restrict_types.indexOf("sweeping") >= 0) {
    ruleString += "Street sweeping - No parking";
  } else if (rule.restrict_types.indexOf("dropoff") >= 0) {
    ruleString += "Dropoffs only";
  } else if (rule.restrict_types.indexOf("paid") >= 0) {
    ruleString += ("Paid parking ($" + rule.paid_hourly_rate.toFixed(2) + "/hr)");
  } else if (rule.restrict_types.indexOf("bus") >= 0) {
    ruleString += "Bus stop - No parking";
  } else if (rule.restrict_types.indexOf("taxi") >= 0) {
    ruleString += "Taxi stand - No parking";
  } else if (authVehicles.some(function(x) {return rule.restrict_types.indexOf(x) >= 0;})) {
    ruleString += "Authorized vehicles only";
  } else {
    ruleString += "No parking";
  }

  // first, convert each set of times in the agenda from floats to 24-hr time strings;
  //  then, key a list of days each timespan is applicable for to said timespan
  var rules = {};
  [a["1"], a["2"], a["3"], a["4"], a["5"], a["6"], a["7"]].forEach(function(restriction, i) {
    restriction.forEach(function(t) {
      var times = t.map(function(x) {
        var strTime = String(x).split(".");
        return ("0"+strTime[0]).slice(-2) + ":" + (strTime[1] === "5" ? "30" : "00");
      });
      var strTimes = times.join(" - ");
      if (rules[strTimes]) {
        rules[strTimes].push(daysofwk[i]);
      } else {
        rules[strTimes] = [daysofwk[i]];
      }
    });
  });

  // this is where the magic happens
  Object.keys(rules).forEach(function(tspan, idx) {
    // if we have multiple time rules for one day (or set of days), join them with a br
    if (idx >= 1) {
      timeString += "<br />";
    }
    // if the timespan is valid for every day of the week...
    if (rules[tspan].length === everyday.length && everyday.every(function(i,x) {return i === rules[tspan][x];})) {
      if (tspan === "00:00 - 24:00") {
        timeString += "At all times";
        tspan = "";
      } else {
        timeString += "Every day ";
      }
    // if the timespan is valid for monday through friday...
    } else if (rules[tspan].length === weekdays.length && weekdays.every(function(i,x) {return i === rules[tspan][x];})) {
      timeString += "Weekdays ";
    // if the timespan is valid for saturday and sunday...
    } else if (rules[tspan].length === weekends.length && weekends.every(function(i,x) {return i === rules[tspan][x];})) {
      timeString += "Weekends ";
    // otherwise comma-separate and print the days the timespan is applicable for
    } else {
      timeString += rules[tspan].join(", ") + " ";
    }

    // if the rule is applicable 24 hours...
    if (tspan === "00:00 - 24:00") {
      timeString += "all day";
    // otherwise print our lovely timespan string
    } else if (tspan) {
      var startTime = tspan.split(" - ")[0],
          endTime   = tspan.split(" - ")[1];
      timeString += moment().hour(startTime.split(":")[0]).minute(startTime.split(":")[1]).format("LT");
      timeString += " to ";
      timeString += moment().hour(endTime.split(":")[0]).minute(endTime.split(":")[1]).format("LT");
    }
  });

  // if it is a seasonal rule (for a simple season), say so
  if (rule.periods && rule.periods.length === 1) {
    var start = moment(rule.periods[0][0], "MM-DD"),
        end   = moment(rule.periods[0][1], "MM-DD");
    timeString += ("<br /><em>Valid " + start.format("MMM Do") + " to " + end.format("MMM Do") + "</em>");
  }

  return [ruleString, timeString];
}
