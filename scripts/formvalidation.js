/* Requires jQuery */
/* Written by Andre Wernsmann 2013 */
/* Version 0.1 */

var FormValidation = new function(){

	var helpers = new function(){

		this.create_class = function(definition, base){

			var base = base || function(){};	
			var Klass = definition.init || base.init || function(){};
			Klass.prototype = new base();

			for(var key in definition){
				Klass.prototype[key] = definition[key];
			}	
			
			Klass.prototype.constructor = Klass;

			return Klass
		};

	}();

	this.Validation = new function(){

		this.ValidationError = helpers.create_class({
			init: function(message){
				this.message = message;
			}
		});

		this.Validator = helpers.create_class({	
			validate: function(value){
				return;
			}
		});

		this.RequiredValidator = helpers.create_class({
			validate: function(value){
				if(!value){
					throw new FormValidation.Validation.ValidationError('This field is required')
				}
			}
		}, this.Validator);

		this.MaxLengthValidator = helpers.create_class({
			init: function(max_length){
				this.max_length = max_length;
			},
			validate: function(value){
				var str = value.toString();
				if(str.length > this.max_length){
					throw new FormValidation.Validation.ValidationError("Your input may not be longer than " + this.max_length.toString() + " chararcter");
				}
			}
		}, this.Validator);

		this.MinLengthValidator = helpers.create_class({
			init: function(min_length){
				this.min_length = min_length;
			},
			validate: function(value){
				var str = value.toString();
				if(str.length < this.min_length){
					throw new FormValidation.Validation.ValidationError("You must enter at least " + this.min_length.toString() + " characters");
				}
			}
		}, this.Validator);

		this.MinValueValidator = helpers.create_class({
			init: function(min_value){
				this.min_value = min_value;
			},
			validate: function(value){
				if(value < this.min_value){
					throw new FormValidation.Validation.ValidationError("You must enter at length a value of " + this.min_value.toString())
				}
			}
		}, this.Validator);

		this.MaxValueValidator = helpers.create_class({

			init: function(max_value){
				this.max_value = max_value;
			},

			validate: function(value){
				if(value > this.max_value){
					throw new FormValidation.Validation.ValidationError("This value may not exceed " + this.max_value.toString())
				}
			}

		}, this.Validator);

	}();

	this.Forms = new function(){

		this.State = new function(){

			this.FieldCleaningState = helpers.create_class({

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

			this.Widget = helpers.create_class({

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

			this.CheckboxWidget = helpers.create_class({
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

			this.TextFieldWidget = helpers.create_class({
				init: function(attrs){
					FormValidation.Forms.Widgets.Widget.call(this, attrs);
				}
			}, this.Widget);

		}();

		this.Fields = new function(){

			this.Field = helpers.create_class({

				init: function(options){
					var defaults = {
						label: null
					};
					options = $.extend(defaults, options);					
					this.label = options.label;					
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

			this.IntegerField = helpers.create_class({	

				init: function(options){

					FormValidation.Forms.Fields.Field.call(this, options);

					var defaults = {
						max: null,
						min: null,
						initial: '',
						required: true,
						widget: new FormValidation.Forms.Widgets.TextFieldWidget()
					}		

					this.validators = [];												
					options = $.extend(defaults, options);					
					this.widget = options.widget;
					if(options.required){
						this.validators.push(new FormValidation.Validation.RequiredValidator());
					}
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
						throw new FormValidation.Validation.ValidationError("You must enter an integer value");
					}
				}

			}, this.Field);


			this.TextField = helpers.create_class({	

				init: function(options){

					FormValidation.Forms.Fields.Field.call(this, options);

					var defaults = {
						max_length: null,
						min_length: null,
						initial: '',
						required: true,
						widget: new FormValidation.Forms.Widgets.TextFieldWidget()
					}

					this.validators = [];		

					options = $.extend(defaults, options);
					this.widget = options.widget;
					if(options.required){
						this.validators.push(new FormValidation.Validation.RequiredValidator());
					}
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

			this.BooleanField = helpers.create_class({	

				init: function(options){

					FormValidation.Forms.Fields.Field.call(this, options);

					var defaults = {						
						required: true,
						widget: new FormValidation.Forms.Widgets.CheckboxWidget()
					}

					this.validators = [];		

					options = $.extend(defaults, options);
					this.widget = options.widget;
					if(options.required){
						this.validators.push(new FormValidation.Validation.RequiredValidator());
					}					
				}
				
			}, this.Field);

		}();

		this.FormWidget = helpers.create_class({

			build: function(form, widgets){
				form.empty();
				var table = $("<table>");
				form.append(table);
				for(var name in widgets){
					var widget = widgets[name];

					if(widget.error){
						var error_row = $("<tr>");
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

		this.Form = helpers.create_class({

			init: function(options){

				var defaults = {
					fields: {},
					initial: {},
					on_submit: null,
					widget: new FormValidation.Forms.FormWidget()
				}

				var self = this;

				options = $.extend(defaults, options);
				this._fields = options.fields;
				this._widget = options.widget;
				this._on_submit = options.on_submit;

				this.element = $("<form></form>").submit(function(event){
					var all_clean = self.submit();
					return all_clean;
				});

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

			submit: function(){
				
				if(this.is_clean()){
					if(this._on_submit){
						this._on_submit(this._cleaned_values());
						return false;
					}
					return true;
				} else {
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
					return false;
				}				
			}

		});

	}();

}();