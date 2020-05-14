
/*	jQuickEdit
	This is a **proof-of-concept** of a system that allows form fields to be automatically updated through AJAX requests when a change or enter keypress is triggered.
	
	To use this give an item a class of jQuickEdit. Its ID, name, and value will be posted to a page in the same directory called jQuickEdit.cfm.

	In order to make this compatible with jEditable, I'll need to name it submit a post variable with the same name as the field.
	How do I do this?

	I don't think there's anything all that special about this, but I might systematize this so I can use this in the future.

	This currently depends on toastr to provide status messages
*/

$('.jQuickEdit').keyup(function(event) {
    if (event.keyCode === 13) {
        $(this).trigger('change');
    }
});


function toTitleCase(str) {
    return str.replace(
        /\w\S*/g,
        function(txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        }
    );
}

$('.jQuickEdit').on('change', function(){
	//Get the goods
	var el = $(this)[0];
	var name = $(this).attr('name');
	var value = $(this).val();
	var label = $(this).attr('data-label');
	var id = $(this).attr('id'); // Strip out the number in the destination script if necessary

	var params = {};
	params[name] = value;
	params["id"] = id;
	params["value"] = value;

	// Do some basic validation
	if ($(this).hasClass('integer')) {
		if (Number.isInteger(parseInt(value)) == false) {
			$(this).addClass('valError');
			toastr.error('Invalid integer.')
			return;
		} else {
			$(this).removeClass('valError');
		}
	}

	if ($(this).hasClass('decimal')) {
		if (isDecimalValid(el) == false) {
			$(this).addClass('valError');
			toastr.error('Invalid decimal number.')
			return;
		} else {
			$(this).removeClass('valError');
		}
	}	

	$.post('quickedit.cfm', params).done(function(data){
		if (typeof label === "undefined") label = toTitleCase(name);
		toastr.success(label+' updated.');
		//Probably don't need to do anything. Maybe a toast with the output?
	})


});