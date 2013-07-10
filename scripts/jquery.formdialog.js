/* Requires jQuery, jQuery UI, fromvalifation.js, jquery.formvalidation.js (See http://github.com/Schfifty/formvalidation.js) */
/* Written by Andre Wernsmann 2013 */
/* Version 1.0 */

$(function(){

	$.widget("ui.formdialog",  {

		options: $.extend({
			'form': {
				fields: {},
				initial: {},
				widget: undefined,			
				appendTo: null
			},
			'submit_text': 'Submit',
			'cancel_text': 'Cancel',
			'on_submit': function(){}
		}, $.ui.dialog.prototype.options),
		
		_create: function() {		
			var self = this;			
			self.form_element = $("<form></form>");
			self.form_element.validform({
				fields: this.options.form.fields,
				initial: this.options.form.initial,				
				widget: this.options.form.widget,
				on_submit: function(data){
					self.options.on_submit(data);					
					self.element.dialog("close");
				}
			});		
			if(this.options.form.appendTo != null){
				$(this.options.form.appendTo, this.element).append(this.form_element);
			}
			else {
				self.element.append(this.form_element);	
			}			
			this.element.dialog($.extend({autoOpen: false}, this.options));			
			this.element.one("dialogclose", function(){
				self.element.formdialog("destroy");
			});
			var buttons = {};
			buttons[this.options.submit_text] = function(){
				self.form_element.submit();
			};
			buttons[this.options.cancel_text] = function(){
				self.element.dialog("close");
			}
			this.element.dialog("option", "buttons", buttons);
			this.element.dialog("open");
		},

		_destroy: function(){			
			this.form_element.remove();			
		}

	});

});