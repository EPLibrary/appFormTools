/****************************************************************************
EPL FormTools v1.1
==================

Allows you to use some simple classes on input elements inside of a form with
a class of .formTools or .appForm to provide validation of required elements
and confirm valid format for
* email addresses
* phone numbers
* postal codes
* library cards
* dates
* time
and more.
Shows relevant errors.

This is used by FormBuilder forms.

Documentation:
--------------

Use forms from the apps formDesign template here
https://apps.epl.ca/web/design/#pattern54

Alternatively, use elements within a parent container (like a <form> having class "formTools"

- Form element (or its parent) has a class of "appForm"
- Input elements are within label or .formItem

Available classes:
required - Require that an input has a value (or is checked).
datepicker - Adds a datepicker interface and confirms input is valid date in YYYY-Mmm-D format. Checks leap year.
email - Confirms valid email address.
phone - Confirms valid 10 digit phone number and homogenizes format to XXX-XXX-XXXX, stripping any leading 1.
eplcard - Confirms that number is a valid EPL card number starting with 21221. Doesn't look up card.
postal - Confirms that number is a valid postal code.
integer - Only allows integer input.
decimal - Confirms valid decimal.


Provided errors will be shown for required elements. These must be created after the input element with the format.
Give the error message the id of your input element, followed by "Error".
For radio buttons, give the error an id of the *name* of the radio group followed by "Error".
<div class="error hidden" id="idError">Message</div>

If you need to build additional validation into your form, you should disable automatic validation on submit
then run formToolsValidate() after your own validation.

**To disable automatic validation, add the "noAutoValidation" class to your form element.**

Datepicker options:
use data-minDate and data-maxDate attributes to specify min a max dates for a datepicker field.
You may specify an integer number of days from the current day, (0 is today), a date in the format used by the
datepicker (YYYY-Mmm-DD), or a relative date (eg +1y-1w+1d for plus one year minus one week, plus 1 day). 

****************************************************************************/

// General functions anyone can use
// Note: This is not used, I may delete this
function isLeapYear(year) {
    year = parseInt(year);
    // If a year is multiple of 4 or 400, but not 100, it is a leap year
    if (year % 400 === 0) return true;
    if (year % 100 === 0) return false;
    return !(year % 4);
}


// returns a time given a string with something resembling a time
function parseTime(str) {
    let meridiem, hour, minute, second;

    // If str is 1 or 2 characters and is only numbers, make that the hour
    if (str.length <= 2 && /^\d+$/.test(str)) {
        hour = parseInt(str);
        minute = second = 0;
    }

    // Catch any seconds that might be present and remove them
    const s = str.match(/\d{1,2}\:\d\d\:(\d\d)s?([a|p]m?)?/i);

    if (s!=null && typeof s === 'object' && s[1] != null && typeof s[1] === 'string') {
        second = parseInt(s[1]);
        // Remove the seconds from str
        str = str.replace(/(\d{1,2}\:\d\d)\:(\d\d)\s?([a|p]m?)?/i, '$1$3');
    }

    // First attempt: assume time is in HH:mm format with optional meridiem
    var timeParts = str.match(/(\d{1,2})\:(\d\d)\s?([a|p])?/i);

    if (timeParts!=null && typeof timeParts === 'object') {
        if (typeof timeParts[1] === 'string' && timeParts[1]!=null) {
            if (parseInt(timeParts[1]) <= 24) {
                hour = parseInt(timeParts[1]);
            }

            if (timeParts[2] != null && typeof timeParts[2] === 'string' && parseInt(timeParts[2]) < 60) {
                minute = parseInt(timeParts[2]);
            }

            if (timeParts[3] != null && typeof timeParts[3] === 'string') {
                meridiem = timeParts[3];
            }
        }

        // If we got hour and minute, remove time from the string before we tokenize it
        if (typeof hour !== 'undefined' && typeof minute !== 'undefined') {
            str = str.replace(/\d{1,2}\:\d\d\s?([a|p]m?)?/i, '').trim();
        }

    }//end if timeParts

    // Now we can check for a lazy, hour only time with meridiem if we didn't get hours before.
    if (typeof hour === 'undefined') {
        const parts = str.match(/(\d{1,2})\s?([aApP])/i);

        if (parts!=null && typeof parts === 'object' && parts[1] != null && typeof parts[1] === 'string') {
            hour = parseInt(parts[1]);

            if (typeof parts[2] === 'string') {
                meridiem = parts[2];
            }

            minute = second = 0;

            // Remove the minuteless time
            str = str.replace(/\d{1,2}\s?([a|p]m?)/i, '');
        }
    }
    
    // Set meridiem (and reset it if it makes no sense)
    if (typeof meridiem === 'undefined') {
        if (hour > 12 && hour < 24) {
            meridiem = 'P';
        } else {
            if (hour >= 12 && hour < 24) meridiem = 'P';
            else meridiem = 'A';
        }    
    }

    // Standardize meridiem
    meridiem = meridiem.slice(0,1).toUpperCase();
    if (meridiem === 'P') meridiem = 'PM';
    else if (meridiem === 'A') meridiem = 'AM';

    // Convert midnight in 12h time to 00
    if ((meridiem === 'AM' && hour === 12) || hour === 24) hour = 0;

    // Convert 12 hour time to 24 hour time
    if (meridiem === 'PM' && hour < 12 && hour > 0) {
        hour = hour+12;
    }
    
    if (typeof second === 'undefined') second = 0;
    // if (typeof minute === 'undefined') minute = 0;

    return {meridiem, hour, minute, second};
}

// If there are any timePickers in the form, this sets those appropriately
function setTimePickers(id, hour, minute, meridiem) {
    document.getElementById(id+'Meridiem').value = meridiem;

    if (hour > 12) {
        if (document.querySelectorAll(`#${id}Hour option[value="${hour}"]`).length) {
            document.getElementById(id+'Hour').value = hour;
        } else {
            document.getElementById(id+'Hour').value = hour-12;
        }
    } else {
        if (document.querySelectorAll(`#${id}Hour option[value="${hour}"]`).length > 0) {
            document.getElementById(id+'Hour').value = hour;
        } else {				// Try with a zero padded version
            document.getElementById(id+'Hour').value = pad(hour,2);
        }
    }

    document.getElementById(id+'Minute').value = minute;

    const changeEvent = new Event('change');
    document.getElementById(id+'Meridiem').dispatchEvent(changeEvent);
    document.getElementById(id+'Hour').dispatchEvent(changeEvent);
    document.getElementById(id+'Minute').dispatchEvent(changeEvent);
}


/**
 * Accepts a string that is some kind of date and outputs it as the specified format String.
 * Takes an optional ID that can be used to manipulate associated time-picker fields.
 * 
 * Takes date parts delimited by slashes, spaces, or commas and converts them into discrete tokens
 * and guesses what each token must be: eg: token1-token2-token3
 * 
 *  if (parseInt(token)) > 31) year = token
 *  (isNaN(token)) month = token
 *  if (parseInt(token)) > 12) day = token
 *  if (!token3) year = now().toYear
 *  if (token < 31) token === (day || month)
 *      if (token.length == 1) token === day
 *      if unsure about any, we assume YY-MM-DD
 *      if (token 1 === month) token 2 === day
 *
*/
function dateSanitize(str, formatStr = 'YYYY-MMM-DD', id) {
    let invalidMsg = 'Invalid Date';

    // You can customize these relative date words to add languages
    const todayWords = ['today', 'now', 'hoy', 'ahora', 'jour', 'maitenant'];
    const tomorrowWords = ['tomorrow', 'manana', 'mañana', 'demain'];
    const yesterdayWords = ['yesterday', 'ayer', 'hier'];

    // Note: in JS months are zero-based - Jan is 0, Dec is 11
    // Set today's date (at midnight) for reference
    const date = new Date();
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);

    let year, month0, day, meridiem, hour, minute, second;

    str = str.trim().toLowerCase();

    // If the input string matches one of the date words, we set the date appropriately
    if ( yesterdayWords.some(word => str.includes(word)) ) {
        date.setDate(date.getDate() - 1);
    } else if ( tomorrowWords.some(word => str.includes(word)) ) {
        date.setDate(date.getDate() + 1);
    }

    if ( [...todayWords, ...tomorrowWords, ...yesterdayWords].some(word => str.includes(word)) ) {
        return date;
    } else if (str.length < 5) {
        return invalidMsg;
    }
    
    // If there's a time run parseTime and remove the time from the string
    const timeRE = new RegExp(/\d{1,2}\:\d\d(?:\:\d\ds?)?\s?(?:[a|p]m?)?/ig);
    if (timeRE.test(str)) {
        ({meridiem, hour, minute, second} = parseTime(str));
        str = str.replace(timeRE, '').trim();
    }

    // tokenMeanings helps guess the date format when there's ambiguity.
    const tokenMeanings = [null,null,null];

    // Handle a undelimited 6 or 8-digit number and treat it as YYYYMMDD
    if (str.length === 8) str = str.replace(/(\d\d\d\d)(\d\d)(\d\d)/, '$1-$2-$3');
    if (str.length === 6) str = str.replace(/(\d\d)(\d\d)(\d\d)/, '$1-$2-$3');

    // If there are only two tokens, we must be missing a year, so prepend the current year to the beginning
    // of the tokens array
    if (str.split(/[^\dA-Za-zé]+/).length < 3) {
        year = date.getFullYear();
        str = year+' '+str;
        tokenMeanings[0] = 'y';
    }

    // Split up tokens by any non-alpha or non-numeric characters (spaces, slashes, dots, etc.)
    const tokens = str.split(/[^\dA-Za-zé]+/);

    // Check for fields whose meanings must be obvious because they can't be anything else
    tokens.forEach((token, i) => {
        if (tokenMeanings[i] === null) {
            const tokenInt = parseInt(token);

            // If a field is alphabetical, use it to set the month
            if (/^[a-zA-Zé]/.test(token)) {
                month0 = monthToInt(token);
                if (month0 !== null) tokenMeanings[i] = 'm';
            }
            // Numbers over 999 are surely a year
            else if (typeof year === 'undefined' && tokenInt >= 1000) {
                year = tokenInt;
                tokenMeanings[i] = 'y'; 
            }
            // Numbers over 31 are probably a year, so convert it to a 4-digit year
            else if (typeof year === 'undefined' && tokenInt > 31) {
                year = yearToFull(token);
                tokenMeanings[i] = 'y';
            }
            // If we have a year and a remaining token is 13-31, it's likely a day
            else if (typeof year === 'number' && typeof day === 'undefined'
                && tokenInt > 12 && tokenInt <= 31) {
                day = tokenInt;
                tokenMeanings[i] = 'd';
            }
        }
    });

    // If we what one token is, we can guess others by assuming a common format

    // First token is year. Assume YYYY/M/D
    if (tokenMeanings[0] === 'y' && tokenMeanings[1] === null && tokenMeanings[2] === null) {
        month0 = parseInt(tokens[1]) - 1;
        tokenMeanings[1] = 'm';

        day = parseInt(tokens[2]);
        tokenMeanings[2] = 'd';            
    }

    // Last token is year. Assume MM/DD/YYYY
    if (tokenMeanings[2] === 'y' && tokenMeanings[0] === null && tokenMeanings[1] === null) {
        month0 = parseInt(tokens[0]) - 1;
        tokenMeanings[0] = 'm';

        day = parseInt(tokens[1]);
        tokenMeanings[1] = 'd';
    }

    // First token is month. Assume MM/DD/YY
    if (tokenMeanings[0] === 'm' && tokenMeanings[1] === null && tokenMeanings[2] === null) {
        day = parseInt(tokens[1]);
        tokenMeanings[1] = 'd';

        year = yearToFull(tokens[2]);
        tokenMeanings[2] = 'y';
    }

    // If there are remaining unknown tokens, set them appropriately
    // get the position of any nulls in tokenMeanings
    while (tokenMeanings.indexOf(null) != -1) {
        const missingIndex = tokenMeanings.indexOf(null);
        // Assume remaining tokens are integers
        const token = parseInt(tokens[missingIndex]);

        if (tokenMeanings.indexOf('y') === -1) {
            year = yearToFull(token);
            tokenMeanings[missingIndex] = 'y'
        }
        else if (tokenMeanings.indexOf('m') === -1 && token <= 12) {
            month0 = token - 1;
            tokenMeanings[missingIndex] = 'm'
        }
        else if (tokenMeanings.indexOf('d') === -1 && token <= 31) {
            day = token;
            tokenMeanings[missingIndex] = 'd';
        }
    }

    if (typeof month0 === 'undefined' || typeof day === 'undefined') {
        return invalidMsg;
    }

    if (typeof hour === 'undefined') hour = 0;
    if (typeof minute === 'undefined') minute = 0;
    if (typeof second === 'undefined') second = 0;

    // First set to the 12 hour time, then set to the 24 hour time, in case it only goes to 12.
    // These will probably be removed
    //if (id !== null && typeof hour !== 'undefined') setTimePickers(id, hour, minute, meridiem);

    // Just return normal Date object. I'll offload formatting to something else.
    return new Date(year, month0, day, hour, minute, second);

} //end dateSanitize()



// TODO: Make a format function



/* timeSanitize is based on dateSanitize, but only includes the time formatting code, ignoring any date parts.
Additionally, the meridiem is optional so that a single one or two digit number is just interpreted as an hour.
*/
function timeSanitize(str, formatStr, id) {
    var invalidMsg = "Invalid Time";

    // Splits up all numeric or alpha components into an array with no delimiters of any kind
    var hour = "";
    var minute = "";
    var second = "";
    var meridiem = "";
    var originalStr = str;

    // Remove spaces from beginning and end
    str = str.trim();

    // This is ridiculous, but I could convert strings to numbers...
    // Handle a few specific strings. Even include spanish for Victor
    if (str.toLowerCase() == "ahora" || str.toLowerCase() == "ahorita" || str.toLowerCase() == "now") str = moment().format("h:mm AA");
    else if (str.toLowerCase() == "noon" || str.toLowerCase() == "mediodía" || str.toLowerCase() == "mediodia") str = "12:00 PM";
    else if (str.toLowerCase() == "midnight" || str.toLowerCase() == "medianoche") str = "12:00 AM";	

    // Require that the string starts with a numeral
    var digitRe = /^\d+.*/;
    if (digitRe.test(str) == false) {
        //console.log('Failed digitRe test');
        return invalidMsg;
    }



    // Look for meridiem in time ([a|p]m?)
    mer = str.match(/.*([a|p]m?)/i);
    if (mer!=null && typeof mer === "object" && mer[1] != null && typeof mer[1] === "string") {
        meridiem = mer[1];
    }

    // Catch any seconds that might be present and remove them from str
    var s = str.match(/\d{1,2}\:?\d\d\:?(\d\d)s?([a|p]m?)?/i);

    if (s!=null && typeof s === "object" && s[1] != null && typeof s[1] === "string") {
        second = s[1];
        // console.log("second: "+second);
        // Remove the seconds from str
        str = str.replace(/(\d{1,2}\:?\d\d)\:?(\d\d)\s?([a|p]m?)?/i, "$1$3");
    }

    // Handle 3-4 digit number without any delimiter and treat as 24h time.
    var time = str.match(/(\d{3,4})h?\s*([a|p]m?)?/i);
    if (time!=null && typeof time === "object" && time[1] != null && typeof time[1] === "string") {
        //last two digits of time[1] are minutes;
        potentialMinutes = time[1].replace(/.*(\d\d)$/, "$1");
        if (parseInt(potentialMinutes) < 60) minute = potentialMinutes;
        // Now remove the final two characters and what's left should be an hour
        var potentialHour = time[1].replace(/(.*)\d\d$/, "$1");
        if (parseInt(potentialHour) < 24) hour = potentialHour;
    }

    // assume time is in HH:mm format with optional meridiem
    var timeParts = str.match(/(\d{1,2})\:(\d\d)\s?([a|p])?/i);

    if (timeParts!=null && typeof timeParts === "object") {
        if (typeof timeParts[1] === "string" && timeParts[1]!=null) {
            if (parseInt(timeParts[1]) < 24)	hour = timeParts[1];
            if (timeParts[2] != null && typeof timeParts[2] === "string" && parseInt(timeParts[2]) < 60) {
                minute = timeParts[2];
            }

            if (timeParts[3] != null && typeof timeParts[3] === "string") {
                meridiem = timeParts[3];
            }
        }

        // If we got hour and minute, remove time from the string before we tokenize it
        if (hour.length && minute.length) {
            str = str.replace(/\d{1,2}\:\d\d\s?([a|p]m?)?/i, "").trim();
        }

    }//end if timeParts

    // Now we can check for a lazy, hour only time with OPTIONAL meridiem if we didn't get hours before.
    if (hour.length == 0) {
        var h = str.match(/(\d{1,2})\s?([a|p])?/i);

        if (h!=null && typeof h === "object" && h[1] != null && typeof h[1] === "string") {
            hour = h[1];

            if (typeof h[2] === "string" && h[2] != null) {
                meridiem = h[2];
            }

            // Remove the minuteless time
            str = str.replace(/\d{1,2}\s?([a|p]m?)/i, "");
        }
    }

    // Standardize meridiem
    meridiem = meridiem.substr(0,1).toUpperCase();
    if (meridiem == "P") {
        meridiem = "PM";
    } else if (meridiem == "A") {
        meridiem = "AM"
    }

    // Convert midnight in 12h time to 00
    if (meridiem == "AM" && parseInt(hour) == 12) {
        hour = "00";
    }

    // Convert 12 hour time to 24 hour time
    if (meridiem == "PM" && parseInt(hour) < 12 && parseInt(hour) > 0) {
        hour = parseInt(hour)+12;
        hour = hour.toString();
    }

    if (meridiem.length == 0) {
        if (parseInt(hour) > 11) {
            meridiem == "PM";
        } else {
            meridiem == "AM";
        }
    }

    if (minute.length == 0) minute = "00";
    if (second.length == 0) second = "00";

    if (hour.length) {
        formattedDate = hour+":"+minute+":"+second;
        m = moment(formattedDate, "H:m:s");
    }

    if (typeof formattedDate === "undefined" || formattedDate.length < 4) return invalidMsg;

    // BONUS Feature:
    // If there are hour and minute pickers with that start with the id of this field, we can set those if there are times here

    // First set to the 12 hour time, then set to the 24 hour time, in case it only goes to 12.
    if (id != null && hour.length) {
        // console.log('year: '+year+'  month: '+month+'  day: '+day+"  hour: "+hour+"  minute: "+minute);
        // check if this value exists. If not, subtract 12 and try again

        $('#'+id+'Meridiem').val(meridiem);

        if (parseInt(hour) > 12) {
            if ($("#"+id+"Hour option[value='"+hour+"']").length > 0) {
                $('#'+id+'Hour').val(hour);
            } else {
                $('#'+id+'Hour').val(parseInt(hour-12));
            }
        } else {
            if ($("#"+id+"Hour option[value='"+parseInt(hour)+"']").length > 0) {
                $('#'+id+'Hour').val(parseInt(hour));
            } else {
                // Try with a zero padded version
                $('#'+id+'Hour').val(pad(hour,2));
            }
        }

        $('#'+id+'Minute').val(minute);

        $('#'+id+'Meridiem').trigger('change');
        $('#'+id+'Hour').trigger('change');
        $('#'+id+'Minute').trigger('change');

    }

    return m.format(formatStr);;
} //end timeSanitize()


//Returns number of days in month (months are zero based, 0=Jan, 1=Feb)
function getDaysInMonth(year, month) {
    return 32 - ( new Date( year, month, 32 ) ).getDate();
}

// This is the code from jQueryUI that takes strings or dates and determines a relative date
// Used in minDate and maxDate in datepickers
function determineDate(date, defaultDate ) {

    //First test that this is an actual date string. If so, return a date object matching it.
    var cleanDate = dateSanitize(date);
    if (cleanDate!="Invalid Date")
        return new Date(cleanDate);


    var offsetNumeric = function( offset ) {
        var date = new Date();
        date.setDate( date.getDate() + offset );
        return date;
    }


    //I could run the string through datesanitize, right?
    var	offsetString = function( offset ) {
        var date = new Date(),
            year = date.getFullYear(),
            month = date.getMonth(),
            day = date.getDate(),
            pattern = /([+\-]?[0-9]+)\s*(d|D|w|W|m|M|y|Y)?/g,
            matches = pattern.exec( offset );

        while ( matches ) {
            switch ( matches[ 2 ] || "d" ) {
                case "d" : case "D" :
                    day += parseInt( matches[ 1 ], 10 ); break;
                case "w" : case "W" :
                    day += parseInt( matches[ 1 ], 10 ) * 7; break;
                case "m" : case "M" :
                    month += parseInt( matches[ 1 ], 10 );
                    day = Math.min( day, getDaysInMonth( year, month ) );
                    break;
                case "y": case "Y" :
                    year += parseInt( matches[ 1 ], 10 );
                    day = Math.min( day, getDaysInMonth( year, month ) );
                    break;
            }
            matches = pattern.exec( offset );
        }
        return new Date( year, month, day );
    }

    var newDate = ( date == null || date === "" ? defaultDate : ( typeof date === "string" ? offsetString( date ) :
            ( typeof date === "number" ? ( isNaN( date ) ? defaultDate : offsetNumeric( date ) ) : new Date( date.getTime() ) ) ) );

    newDate = ( newDate && newDate.toString() === "Invalid Date" ? defaultDate : newDate );
    if ( newDate ) {
        newDate.setHours( 0 );
        newDate.setMinutes( 0 );
        newDate.setSeconds( 0 );
        newDate.setMilliseconds( 0 );
    }
    //Removed DSTadjust, probably not too necessary
    return newDate;
}

// Converts a two-digit year to a four digit year using the specified threshold of where we stop caring about the 1900s
function yearToFull(year, threshold = 60) {
    year = parseInt(year);
    if (year < threshold) return year += 2000;
    else if (year < 100) return year += 1900;
    return year;
}

// Converts an integer or combination of letters into a full month name. Use true for second paramter to get 3 letter month.
function monthToString(str, short, oneBased = false, toInt = false) {
    // Normalize to zero-baesd months
    if (oneBased && !isNaN(parseInt(str))) str = parseInt(str) - 1;

    let month;
    const months = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',        
    ];

    if (isNaN(parseInt(str))) {
        // Fe and Se to prevent confusing with Friday and Saturday/Sunday
        if (/^(ja|en).*/i.test(str)) month = 0;
        if (/^(fe|fé).*/i.test(str)) month = 1;
        if (/^mar.*/i.test(str)) month = 2;
        if (/^(ap|ab|av).*/i.test(str)) month = 3;
        if (/^(may|mai).*/i.test(str)) month = 4;
        if (/^(jun|juin).*/i.test(str)) month = 5;
        if (/^(jul|juil).*/i.test(str)) month = 6;
        if (/^(au|ag|ao).*/i.test(str)) month = 7;
        if (/^se.*/i.test(str)) month = 8;
        if (/^o.*/i.test(str)) month = 9;
        if (/^n.*/i.test(str)) month = 10;
        if (/^d.*/i.test(str)) month = 11;
    } else {
        month = parseInt(str);
    }

    if (month < 12) {
        if (toInt) return oneBased ? month + 1 : month;
        return short ? months[month].slice(0,3) : months[month];
    }

    // By default, return null if no matches were found
    return null;
}

// Converts a month string to an int
function monthToInt(str, oneBased = false) {
    return monthToString(str, false, oneBased, true);
}


// Zero pad number
function pad(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}


// Input validation for date fields. Allows almost any kind of arbitrary date format, but it is encouraged to use one that:
//	- Uses 4-digit years
//  - Has the year first
//  - Uses textual months
function isDateValid(el) {
    var elid = $(el).attr('id');
    $('#ftDateError'+elid).remove();
    var val = $(el).val();

    if (val.length == 0) return false;

    valClean = dateSanitize(val, 'YYYY-MMM-DD', elid);

    if (/^Invalid/i.test(valClean)) {
        $(el).after('<div id="ftDateError'+elid+'" class="error ftError ftDateError">Invalid date.</div>');
        return false;
    } else {
        $(el).val(valClean);

        // m is used to check certain constraints
        var m = moment(dateSanitize(val));
        //Now check that date is in allowed range
        if ($(el).attr('data-minDate')) {
            var minDate = determineDate($(el).attr('data-minDate'));
            var minDateFormatted = moment(minDate).format('YYYY-MMM-DD');
            if (m.isBefore(minDate)) {
                $(el).after('<div id="ftDateError'+elid+'" class="error ftError ftDateError">Date must be on or after '+minDateFormatted+'.</div>');
                return false;
            }
        }

        if ($(el).attr('data-maxDate')) {
            var maxDate = determineDate($(el).attr('data-maxDate'));
            var maxDateFormatted = moment(maxDate).format('YYYY-MMM-DD');
            if (m.isAfter(maxDate)) {
                $(el).after('<div id="ftDateError'+elid+'" class="error ftError ftDateError">Date must be on or before '+maxDateFormatted+'.</div>');
                return false;
            }
        }

        if (typeof $(el).attr('data-noWeekends') !== "undefined" && $(el).attr('data-noWeekends') != "false") {
            if(m.isoWeekday() == 6 || m.isoWeekday() == 0) {
                $(el).after('<div id="ftDateError'+elid+'" class="error ftError ftDateError">Date must be a weekday.</div>');
            }
        }


        // $(el).trigger('change');
        return true;
    }
}

function isTimeValid(el) {
    var elid = $(el).attr('id');
    $('#ftTimeError'+elid).remove();
    var val = $(el).val();

    if (val.length == 0) return false;

    valClean = timeSanitize(val, 'h:mm A', elid);

    if (/^Invalid/i.test(valClean)) {
        $(el).after('<div id="ftTimeError'+elid+'" class="error ftError ftTimeError">Invalid time.</div>');
        return false;
    } else {
        $(el).val(valClean);
        // $(el).trigger('change');
        return true;
    }	
}

function isCardValid(el) {
    var elid = $(el).attr('id');
    $('#ftCardError'+elid).remove();
    $(el).val($(el).val().replace(/^(\d{5})\s*(\d{5})\s*(\d{4})(.*)/, "$1 $2 $3$4"));
    var cardRegex=new RegExp(/^21221 \d{5} \d{4}/);
    if ( cardRegex.test($(el).val()) == false ) {
        $(el).after('<div id="ftCardError'+elid+'" class="error ftError ftCardError">Invalid EPL card number.</div>');
        return false;
    } else return true;	
}

function showError(el) {
    var errorEl = $(el).attr('id')+"Error";
    //Errors for radio groups are a bit different, based on name
    if ($(el).prop('type') == "radio") {
        errorEl = $(el).attr('name')+"Error";
    }
    if ($('#'+errorEl).length) {
        $('#'+errorEl).show();
    }

    if ($('#bigError').length == 0) {
        $('[type="submit"').parent().after('<label>\
                <div class="noticeBox hidden" id="bigError">\
                    There is a problem with your submission.\
                </div>\
            </label>');
        $('#bigError').show();
    } else {
        $('#bigError').show();
    }
} // End showError()

// Input validation for email fields
function isEmailValid(el) {
    var elid = $(el).attr('id');
    // trim string to remove any spaces
    $(el).val($(el).val().trim());
    $('#ftEmailError'+elid).remove();
    var emailRegex=new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
    if ( emailRegex.test($(el).val()) == false ) {
        $(el).after('<div id="ftEmailError'+elid+'" class="error ftError ftEmailError">Invalid email address.</div>');
        return false;	
    } else return true;
}

// Checks that the phone number is valid and sanitizes it
function isPhoneValid(el) {
    var elid = $(el).attr('id');
    $('#ftPhoneError'+elid).remove();
    //if there's a leading character that isn't 2-9 or 0 remove it until there is
    var number = $(el).val();
    // first character regex, strip anything that isn't part of the area code
    number = number.replace(/^[^2-90]+/g, '');
    // now the first number should be for the area code
    number = number.replace(/(\d\d\d).*?(\d\d\d).*?(\d\d\d\d)(.*)/, '$1-$2-$3$4');
    $(el).val(number);
    var phoneRE = new RegExp(/^\d\d\d-\d\d\d-\d\d\d\d$/);
    if (phoneRE.test($(el).val()) == false) {
        $(el).after('<div id="ftPhoneError'+elid+'" class="error ftError ftPhoneError">Invalid phone number.</div>');
        return false;	
    } else return true;
}

function isDecimalValid(el) {
    var elid = $(el).attr('id');
    $('#ftDecimalError'+elid).remove();
    var decimalRegex = new RegExp(/^\-?\d*\.?\d*$/);
    if (decimalRegex.test($(el).val()) == false) {
        $(el).after('<div id="ftDecimalError'+elid+'" class="error ftError ftDecimalError">Invalid decimal number.</div>');
        return false;
    } else return true;
}

function isPostalValid(el) {
    var elid = $(el).attr('id');
    $('#ftPostalError'+elid).remove();	
    var postalRegex=new RegExp(/^[abceghjklmnprstvxyABCEGHJKLMNPRSTVXY][0-9][abceghjklmnprstvwxyzABCEGHJKLMNPRSTVWXYZ] ?[0-9][abceghjklmnprstvwxyzABCEGHJKLMNPRSTVWXYZ][0-9]$/);
    // homogenize postal code format
    // uppercase letters
    $(el).val($(el).val().toUpperCase().replace(/(.{3})\s*(.*)/, "$1 $2").trim());
    if ( !postalRegex.test($(el).val())) {
        $(el).after('<div id="ftPostalError'+elid+'" class="error ftError ftPostalError">Invalid postal code.</div>');
        return false;
    } else return true;
}


/* The main validation function for everything FormTools does. This is called by a form submission */
function formToolsValidate(debug) {
    // Necessary to fix bug in IE11
    if (typeof debug === "undefined") debug=false;
    var valid = true;

    // Hide any existing errors
    $('.formTools .error, .appForm .error').hide();
    $('.ftError').remove();
    $('#bigError').hide();

    // Check that any required fields have a value. :input catches textarea, select, etc
    $('.formTools :input.required, .appForm :input.required').each(function(i){
        // Handle checkbox
        if ($(this).prop('type') == "checkbox") {
            if ($(this).prop('checked') == false ) {
                valid = false;
                if (debug) console.log('invalid: '+$(this).attr('id'));
                showError(this);
            }
        }
        // Handle radio buttons
        if ($(this).prop('type') == "radio") {
            var radioGroup = $(this).attr('name');
            if ($('input[name="'+radioGroup+'"]').is(":checked") == false) {
                valid = false;
                if (debug) console.log('invalid: '+$(this).attr('id'));
                showError(this);
            }
        }
        // Handle other kinds of fields
        else if ($(this).val().length == 0) {
            valid = false;
            if (debug) console.log('invalid: '+$(this).attr('id'));
            showError(this);
        }
    });

    //Validate format for various types
    $('.formTools .decimal, .appForm .decimal').each(function(i){
        if ($(this).val().length > 0 && isDecimalValid(this) == false) {
            valid = false;
            if (debug) console.log('invalid: '+$(this).attr('id'));
        }
    });

    $('.formTools .phone, .appForm .phone, .formTools .telephone, .appForm telephone').each(function(i){
        if ($(this).val().length > 0 && isPhoneValid(this) == false) {
            valid = false;
            if (debug) console.log('invalid: '+$(this).attr('id'));
        }
    });

    $('.formTools .email, .appForm .email').each(function(i){
        if ($(this).val().length > 0 && isEmailValid(this) == false) {
            valid = false;
            if (debug) console.log('invalid: '+$(this).attr('id'));
        }
    });
    $('.formTools .postal, .appForm .postal').each(function(i){
        if ($(this).val().length > 0 && isPostalValid(this) == false) {
            valid = false;
            if (debug) console.log('invalid: '+$(this).attr('id'));
        }
    });
    $('.formTools .datepicker, .appForm .datepicker').each(function(i){
        if ($(this).val().length > 0 && isDateValid(this) == false) {
            valid = false;
            if (debug) console.log('invalid: '+$(this).attr('id'));
        }
    });
    $('.formTools .time, .appForm .time').each(function(i){
        if ($(this).val().length > 0 && isTimeValid(this) == false) {
            valid = false;
            if (debug) console.log('invalid: '+$(this).attr('id'));
        }
    });	
    $('.formTools .eplcard, .appForm .eplcard').each(function(i){
        if ($(this).val().length > 0 && isCardValid(this) == false) {
            valid = false;
            if (debug) console.log('invalid: '+$(this).attr('id'));
        }
    });


    return valid;	
}//end formToolsValidate()

// This function can be used to refresh form validation listeners if content is reloaded via AJAX
function applyValidation() {

    // Can use inputmask to restrict to valid date format
    $(".datepicker:not([readonly])").each(function(){
         var dateFormat = $(this).attr('data-dateFormat');
         // Options for jQueryUI datepicker
         var dpOptions = new Object;

         // Allow changing year and month with dropdowns
         dpOptions.changeYear = true;
         dpOptions.changeMonth = true;

         // Default date format, four-digit year, three letter month, day number with leading zero
         // Note: Changing date format isn't yet supported as I have to also change the
         // datesanitize function and placeholder text to match.
         if (typeof dateFormat === "undefined") dateFormat="yy-M-dd";
         dpOptions.dateFormat = dateFormat;

         if (typeof $(this).attr('data-minDate') !== "undefined") {
             dpOptions.minDate = $(this).attr('data-minDate');
         }
         if (typeof $(this).attr('data-maxDate') !== "undefined") {
             dpOptions.maxDate = $(this).attr('data-maxDate');
         }

         // Check if the data-noWeekends atttribute is set
         if (typeof $(this).attr('data-noWeekends') !== "undefined"
             && $(this).attr('data-noWeekends') != "false") {
             dpOptions.beforeShowDay=$.datepicker.noWeekends;
         }

         $(this).datepicker(dpOptions);
    });

    $(".datepicker").attr("placeholder", "YYYY-Mmm-D");

    // Input filtering for library card
    $('.formTools, .appForm').on("input", ".eplcard", function() {
        //Removes non-numeric characters from input
        if (this.value.search(/[^\d ]/) != -1)
            this.value=this.value.replace(/[^\d ]/, "");
    });


    $('.formTools, .appForm').on("change", ".eplcard", function() {
        isCardValid(this);
    });

    $('.formTools, .appForm').on("input", ".eplcard", function() {
        var elid = $(this).attr('id');
        if ($('#ftCardError'+elid).length) isCardValid(this);
    });



    $('.formTools, .appForm').on("change", ".datepicker", function() {
        isDateValid(this);
    });

    $('.formTools, .appForm').on("input", ".datepicker", function() {
        var elid = $(this).attr('id');
        if ($('#ftDateError'+elid).length)
            isDateValid(this);
    });


    $('.formTools, .appForm').on("change", ".time", function() {
        isTimeValid(this);
    });


    // Input filtering for integer fields
    $('.formTools, .appForm').on("input", ".integer", function() {
        //Removes non-numeric characters from input
        if (this.value.search(/[^\d]/) != -1)
            this.value=this.value.replace(/[^\d]/, "");
    });

    // Input filtering for bit (one character 0 or 1)
    $('.formTools, .appForm').on("input", ".bit", function() {
        //Removes non-numeric characters from input
        this.value=this.value.replace(/^.*(0|1)$/, '$1');
        if (this.value!="0" && this.value!="1" && this.value!="") {
            this.value="";
        }
    });

    // Input filtering for decimal fields
    $('.formTools, .appForm').on("input", ".decimal", function() {
        //Removes non-numeric characters from input
        // This is mostly to handle copy-pasted values
        if (this.value.search(/[^\-\d\.]/) != -1) {
            this.value=this.value.replace(/[^\-\d\.]/g, "");
        }

        //Remove any periods after the first one
        if (this.value.search(/.*\..*\./) != -1);
            this.value=this.value.replace(/(.*\..*)(\.)/, "$1");	
    });


    $('.formTools, .appForm').on("change", ".email", function() {
        isEmailValid(this);
    });

    $('.formTools, .appForm').on("input", ".email", function() {
        var elid = $(this).attr('id');
        if ($('#ftEmailError'+elid).length) isEmailValid(this);
    });

    // Input filtering for phone fields
    $('.formTools, .appForm').on("input", ".phone,.telephone", function() {
        //Removes non-numeric characters from input
        if (this.value.search(/[^\d\.\-\(\)+ ]/) != -1)
            this.value=this.value.replace(/[^\d\.\-\(\)+ ]/, "");
    });


    $('.formTools, .appForm').on("change", ".phone,.telephone", function() {
        isPhoneValid(this);
    });

    $('.formTools, .appForm').on("input", ".phone,.telephone", function() {
        var elid = $(this).attr('id');
        if ($('#ftPhoneError'+elid).length) isPhoneValid(this);
    });


    $('.formTools, .appForm').on("change", ".decimal", function() {
        isDecimalValid(this);
    });

    $('.formTools, .appForm').on("input", ".decimal", function() {
        var elid = $(this).attr('id');
        if ($('#ftDecimalError'+elid).length) isDecimalValid(this);
    });


    $('.formTools, .appForm').on("change", ".postal", function() {
        isPostalValid(this);
    });

    $('.formTools, .appForm').on("input", ".postal", function() {
        var elid = $(this).attr('id');
        if ($('#ftPostalError'+elid).length) isPostalValid(this);
    });


    // Validate entire submission when the submit button is clicked
    //   unless the NoAutoValidation class is set.
    $('.formTools:not(.noAutoValidation), .appForm:not(.noAutoValidation)').on('submit', function(){
        return formToolsValidate();
    });//end on submit

}//end applyValidation();


if (typeof document != 'undefined') document.addEventListener('DOMContentReady', function() {
    applyValidation();
});