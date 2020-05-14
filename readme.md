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

Dependencies
------------
- [jQuery](https://jquery.com/)
- [jQueryUI](https://jqueryui.com/)
- [moment.js](https://momentjs.com/)

Documentation
-------------

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