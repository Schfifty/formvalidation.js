/* Requires jQuery, formvalidation.js */
/* Written by Andre Wernsmann 2013 */
/* Version 0.1 */

(function($){

  $.fn.validform = function(options){

  	var defaults = {
		fields: {},
		initial: {},
		on_submit: null,
		widget: new FormValidation.Forms.FormWidget(),
		element: null
	};

  	options = $.extend(defaults, options);

  	return this.each(function(){

  		new FormValidation.Forms.Form({
  			fields: options.fields,
			initial: options.initial,
			on_submit: options.on_submit,
			widget: options.widget,
			element: $(this)
  		});

  	});
  };

})(jQuery);