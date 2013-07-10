/* Requires jQuery */
/* Written by Andre Wernsmann 2013 */
/* Version 0.1 */

var FormValidation = new function(){	

	var Helpers = new function(){

		this.create_class = function(definition, base){

			var base = base || function(){};	
			var Klass = definition.init || function(){};
			Klass.prototype = new base();

			for(var key in definition){
				Klass.prototype[key] = definition[key];
			}	
			
			Klass.prototype.constructor = Klass;

			return Klass
		};

	}();

	this.Locale = new function(){
		
		this.lang = {};		

		this.get_localized_text = function(text){
			return this.lang[this.current][text];
		};

		this.set_lang = function(lang){
			this.current = lang;
		};

		this._add_locale = function(data){
			this.lang[data.lang] = data.translation;
		};

		this.add_locale = function(url){
			$.getJSON(url, function(data){
				this._add_locale(data);
			});	
		};		
		
		this._add_locale({
			'lang': 'en',
			'translation': {
				'This field is required': 'This field is required',
				'Your input may not be longer than %max_length% characters': "Your input may not be longer than %max_length% characters",
				'You must enter at least %min_length% characters': 'You must enter at least %min_length% characters',
				'You must enter at least a value of %min_value%': 'You must enter at least a value of %min_value%',
				'This value may not exceed %max_value%': 'This value may not exceed %max_value%',				
				'You must enter an integer value': 'You must enter an integer value'
			}
		});

		this._add_locale({
			'lang': 'de',
			'translation': {
				'This field is required': 'Dieses Feld ist zwingend erforderlich',
				'Your input may not be longer than %max_length% characters': "Sie d&uuml;rfen nicht mehr als %max_length% Zeichen eingeben",
				'You must enter at least %min_length% characters': 'Sie m&uuml;ssen mindestens %min_length% Zeichen eingeben',
				'You must enter at least a value of %min_value%': 'Sie m&uuml;ssen mindestens %min_value% eingeben',
				'This value may not exceed %max_value%': 'Sie d&uuml;rfen maximal %max_value% eingeben',				
				'You must enter an integer value': 'Sie m&uuml;ssen eine Ganzzahl eingeben'
			}
		});

		this.current = 'en';

	}();	

	this.Validation = new function(){

		this.ValidationError = Helpers.create_class({
			init: function(message){
				this.message = message;
			}
		});

		this.Validator = Helpers.create_class({	
			validate: function(value){
				return;
			}
		});

		this.RequiredValidator = Helpers.create_class({
			validate: function(value){
				if(!value){
					throw new FormValidation.Validation.ValidationError(FormValidation.Locale.get_localized_text('This field is required'))
				}
			}
		}, this.Validator);

		this.MaxLengthValidator = Helpers.create_class({
			init: function(max_length){
				this.max_length = max_length;
			},
			validate: function(value){
				var str = value.toString();
				if(str.length > this.max_length){
					throw new FormValidation.Validation.ValidationError(
						FormValidation.Locale.get_localized_text("Your input may not be longer than %max_length% characters").replace("%max_length%", this.max_length.toString())
					);
				}
			}
		}, this.Validator);

		this.MinLengthValidator = Helpers.create_class({
			init: function(min_length){
				this.min_length = min_length;
			},
			validate: function(value){
				var str = value.toString();
				if(str.length < this.min_length){
					throw new FormValidation.Validation.ValidationError(
						FormValidation.Locale.get_localized_text("You must enter at least %min_length% characters").replace("%min_length%", this.min_length.toString())
					);
				}
			}
		}, this.Validator);

		this.MinValueValidator = Helpers.create_class({
			init: function(min_value){
				this.min_value = min_value;
			},
			validate: function(value){
				if(value < this.min_value){
					throw new FormValidation.Validation.ValidationError(
						FormValidation.Locale.get_localized_text("You must enter at least a value of %min_value%").replace("%min_value%", this.min_value.toString())
					);
				}
			}
		}, this.Validator);

		this.MaxValueValidator = Helpers.create_class({

			init: function(max_value){
				this.max_value = max_value;
			},

			validate: function(value){
				if(value > this.max_value){
					throw new FormValidation.Validation.ValidationError(
						FormValidation.Locale.get_localized_text("This value may not exceed %max_value%").replace("%max_value%", this.max_value.toString())
					);
				}
			}

		}, this.Validator);

	}();
1
	this.Forms = new function(){

		this.State = new function(){

			this.FieldCleaningState = Helpers.create_class({

				init: function(value, error){
					this.value = value;
					this.error = error;
				},

				is_clean: function(){
					return this.error == undefined;
				}

			});

		}();

		this.Widgets = new function(){

			this.Widget = Helpers.create_class({

				init: function(attrs){					
					this.attrs = attrs || {};
				},
				
				initialize: function(value, name){
					this.element = this.render();
					this.element.attr("name", name);
					this.set_value(value);
					for(var attr in this.attrs){
						this.element.attr(attr, this.attrs[attr]);
					}
				},

				render: function(){
					return $('<input type="text">');
				},

				set_value: function(value){
					if(value){
						this.element.val(value);
					}
				},

				get_value: function(){
					return this.element.val();
				}

			});

			this.SelectWidget = Helpers.create_class({

				init: function(attrs){					
					FormValidation.Forms.Widgets.Widget.call(this, attrs);
				},

				render: function(){
					var select = $("<select></select>");
					for(var value in this.choices){
						var display = this.choices[value];
						var option = $("<option></option>").attr("value", value).html(display);
						select.append(option);
					}
					return select;
				},

				set_choices: function(choices){
					this.choices = choices;
				},

				set_value: function(value){
					this.element.val(value);
				},

				get_value: function(){
					return this.element.val();
				}

			}, this.Widget);

			this.CheckboxWidget = Helpers.create_class({
				init: function(attrs){
					FormValidation.Forms.Widgets.Widget.call(this, attrs);				
				},

				render: function(){
					return $('<input type="checkbox">')
				},

				set_value: function(value){
					if(value != null){
						if(value){
							this.element.attr("checked", true);
						}
						else {
							this.element.attr("checked", false);
						}
					}
				},

				get_value: function(){
					return this.element.is(":checked");
				}


			}, this.Widget);

			this.TextFieldWidget = Helpers.create_class({
				init: function(attrs){
					FormValidation.Forms.Widgets.Widget.call(this, attrs);
				}
			}, this.Widget);

		}();

		this.Fields = new function(){

			this.Field = Helpers.create_class({

				base_init: function(options){					
					var defaults = {
						label: null,
						required: true
					};
					this.validators = [];
					options = $.extend(defaults, options);					
					this.label = options.label;
					this.required = options.required;
					if(options.required){												 
						this.validators.push(new FormValidation.Validation.RequiredValidator());					
					}
				},

				try_cast_value: function(value){
					return value;
				},

				clean: function(){		

					var value = this.widget.get_value();

					try {
						value = this.try_cast_value(value);
						for(var v_idx = 0; v_idx < this.validators.length; v_idx++){
							validator = this.validators[v_idx];
							validator.validate(value);			
						}
						return new FormValidation.Forms.State.FieldCleaningState(value);
					}
					catch(e){
						if(e instanceof FormValidation.Validation.ValidationError){
							return new FormValidation.Forms.State.FieldCleaningState(value, e.message);
						}
						else {
							throw e;
						}
					}
				},

				render: function(name, value){
					return this.widget._render(name, value);
				}

			});

			this.IntegerField = Helpers.create_class({	

				init: function(options){

					this.base_init(options);

					var defaults = {
						max: null,
						min: null,												
						widget: new FormValidation.Forms.Widgets.TextFieldWidget()
					}		
														
					options = $.extend(defaults, options);					
					this.widget = options.widget;					
					if(options.max != null){
						this.validators.push(new FormValidation.Validation.MaxValueValidator(options.max));
					}
					if(options.min != null){
						this.validators.push(new FormValidation.Validation.MinValueValidator(options.min));	
					}
				},

				try_cast_value: function(value){		
					int_value = parseInt(value);
					if(!isNaN(int_value) && int_value == parseFloat(value)){
						return int_value
					}else {
						throw new FormValidation.Validation.ValidationError(
							FormValidation.Locale.get_localized_text("You must enter an integer value")
						);
					}
				}

			}, this.Field);

			this.SelectField = Helpers.create_class({

				init: function(choices, options){

					this.base_init(options);

					var defaults = {												
						required: true,
						widget: new FormValidation.Forms.Widgets.SelectWidget()
					}
					
					options = $.extend(defaults, options);
					this.widget = options.widget;
					this.widget.set_choices(choices);

				}				

			}, this.Field);

			this.TextField = Helpers.create_class({	

				init: function(options){

					this.base_init(options);

					var defaults = {
						max_length: null,
						min_length: null,						
						required: true,
						widget: new FormValidation.Forms.Widgets.TextFieldWidget()
					}

					options = $.extend(defaults, options);
					this.widget = options.widget;					
					if(options.max_length != null){
						this.validators.push(new FormValidation.Validation.MaxLengthValidator(options.max_length));
					}
					if(options.min_length != null){
						this.validators.push(new FormValidation.Validation.MinLengthValidator(options.min_length));	
					}
				},

				try_cast_value: function(value){		
					return value.toString()
				}

			}, this.Field);

			this.BooleanField = Helpers.create_class({	

				init: function(options){

					this.base_init(options);

					var defaults = {						
						required: true,
						widget: new FormValidation.Forms.Widgets.CheckboxWidget()
					}

					options = $.extend(defaults, options);
					this.widget = options.widget;					
				}
				
			}, this.Field);

		}();

		this.FormWidget = Helpers.create_class({

			build: function(form, widgets){
				form.empty();
				var table = $("<table>");
				form.append(table);
				for(var name in widgets){
					var widget = widgets[name];

					if(widget.error){
						var error_row = $("<tr class='error'>");
						var empty_cell = $("<td></td>");
						var error_cell = $("<td></td>").html(widget.error);
						error_row.append(empty_cell);
						error_row.append(error_cell);						
						table.append(error_row);	
					}
					var row = $("<tr>");
					var label_cell = $("<td></td>").html(widget.label);
					var field_cell = $("<td></td>");
					row.append(label_cell);
					row.append(field_cell);
					field_cell.append(widget.element);
					table.append(row);
				}				
			}

		});

		this.Form = Helpers.create_class({

			init: function(options){

				var defaults = {
					fields: {},
					initial: {},
					on_submit: null,
					widget: new FormValidation.Forms.FormWidget(),
					element: null
				}

				var self = this;

				options = $.extend(defaults, options);
				this._fields = options.fields;
				this._widget = options.widget;
				this._on_submit = options.on_submit;

				this.element = options.element == null ? $("<form></form>") : options.element;

				this.is_validated = false;

				this.element.submit(function(event){
					var all_clean = self.submit();
					return all_clean;
				});

				this.element.data("validation", this);

				this.refresh(options.initial, {})

			},

			refresh: function(values, errors){
				var widgets = {};
				for(var name in this._fields){
					var field = this._fields[name];
					value = name in values ? values[name] : null;
					field.widget.initialize(value, name)
					var error = name in errors ? errors[name] : null;
					widgets[name] = {
						label: field.label || name.substring(0,1).toUpperCase() + name.substring(1),
						element: field.widget.element,
						error: error
					}
				}
				this._widget.build(this.element, widgets);
			},

			_clean_fields: function(){
				var field_states = {};
				for(var name in this._fields){
					var field = this._fields[name];
					 field_states[name] = field.clean();
				}
				return field_states;
			},

			_cleaned_values: function(){
				var field_values = {};
				for(var name in this._fields){
					var field = this._fields[name];
					 field_values[name] = field.clean()['value'];
				}
				return field_values;	
			},

			is_clean: function(){
				var cleaned = this._clean_fields();
				var all_clean = true;
				for(var name in cleaned){
					var cleaned_state = cleaned[name];
					if(!cleaned_state.is_clean()){
						all_clean = false;
						break;
					}
				}
				return all_clean;
			},

			update: function(){	
				if(this.is_validated){
					var cleaned = this._clean_fields();
					var values = {}
					var errors = {};
					for(var name in cleaned){
						values[name] = cleaned[name].value;
						if(cleaned[name].error){
							errors[name] = cleaned[name].error;
						}
					}
					this.refresh(values, errors);				
				}
			},

			submit: function(){
				
				this.is_validated = true;

				if(this.is_clean()){
					if(this._on_submit){
						this._on_submit(this._cleaned_values());
						return false;
					}
					return true;
				} else {
					this.update();					
					return false;
				}				
			}

		});

	}();

}();