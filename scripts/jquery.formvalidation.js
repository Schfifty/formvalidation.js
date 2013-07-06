/* Requires jQuery, formvalidation.js */
/* Written by Andre Wernsmann 2013 */
/* Version 0.1 */

(function($){

  $.fn.validform = function(options){

  	if(typeof(options) == "object"){  		
		new FormValidation.Forms.Form({
			fields: options.fields,
			initial: options.initial,
			on_submit: options.on_submit,
			widget: options.widget,
			element: $(this)
		});
  	}  		
	else {		
		var validation = $(this).data("validation");
		if(validation != undefined){			
			if(options == "update"){
				validation.update()
			}
		}
		else {
			throw "Form Validation not initialized";
		}		
	}

	return $(this);

  };

})(jQuery);