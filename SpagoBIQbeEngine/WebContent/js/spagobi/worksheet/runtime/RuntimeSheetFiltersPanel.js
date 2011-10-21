/**
 * SpagoBI - The Business Intelligence Free Platform
 *
 * Copyright (C) 2004 - 2008 Engineering Ingegneria Informatica S.p.A.
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2.1 of the License, or (at your option) any later version.
 * 
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.

 * You should have received a copy of the GNU Lesser General Public
 * License along with this library; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
 * 
 **/
 
/**
 * Object name
 * 
 * [description]
 * 
 * 
 * Public Properties
 * 
 * [list]
 * 
 * 
 * Public Methods
 * 
 * [list]
 * 
 * 
 * Public Events
 * 
 * [list]
 * 
 * Authors
 *  - Davide Zerbetto (davide.zerbetto@eng.it)
 */

Ext.ns("Sbi.worksheet");

Sbi.worksheet.RuntimeSheetFiltersPanel = function(openFilters, config) {
	
	var defaultSettings = {
		// set default values here
		header: false
        , border: false
        , frame: true
        , autoScroll: true
		, autoWidth: true
		, autoHeight: true
        , layout: 'column'
    	, layoutConfig: {
	        columns: openFilters.length
	    }
		, valueDelimiter: '--!;;;;!--'
		, style:'padding: 10px'
	};
	if (Sbi.settings && Sbi.settings.formviewer && Sbi.settings.formviewer.staticOpenFiltersPanel) {
		defaultSettings = Ext.apply(defaultSettings, Sbi.settings.formviewer.staticOpenFiltersPanel);
	}
	
	var c = Ext.apply(defaultSettings, config || {});
	
	var params = {LIGHT_NAVIGATOR_DISABLED: 'TRUE'};
	this.services = new Array();
	this.services['getFilterValuesService'] = Sbi.config.serviceRegistry.getServiceUrl({
		serviceName: 'GET_FILTER_VALUES_FOR_WORKSHEET_ACTION'
		, baseParams: params
	});
	
	this.baseConfig = c;
	
	
	if(!this.hidden){
		this.init(openFilters);
	}
	Ext.apply(c, {
  		items: this.fields
	});
	
	// constructor
    Sbi.worksheet.RuntimeSheetFiltersPanel.superclass.constructor.call(this, c);
    
    this.addEvents('apply');
};

Ext.extend(Sbi.worksheet.RuntimeSheetFiltersPanel, Ext.form.FormPanel, {
    
	services: null
	, fields: null
	, combos: null
	   
	// private methods
	   
	, init: function(openFilters) {
		
		this.fields = [];
		this.combos = new Array();
		var fieldsCounter = 0;
		for(var i = 0; i < openFilters.length; i++) {
			var field = this.createField( openFilters[i] );
			this.combos.push( field );
			var aPanel = new Ext.Panel({
					style: 'margin: 3px;  border: 1px solid #D0D0D0; padding: 3px; float: left;',
					title: '',
					width: 210,
					items:[ 
					        {
					        	xtype: 'component', 
					        	html: openFilters[i].text, 
					        	cls:'x-form-check-group-label'
					        }, 
					        field  
			       ]
			});
			
			if(openFilters[i].allowBlank!=undefined && openFilters[i].allowBlank!=null && !openFilters[i].allowBlank){
				aPanel.style = aPanel.style+" font-weight:bold;"
			}
			
			this.fields.push(aPanel);
		}
		var applyPanel = this.createApplyPanel();
		this.fields.push(applyPanel);
	}

	, createApplyPanel : function () {
		var button = new Ext.Button({
   		    template: new Ext.Template(
  		         '<div class="smallBtn">',
  		             '<div class="filter-icon-' + this.baseConfig.position + '"></div>',
  		             '<div class="btnText"></div>',
  		         '</div>')
  		    , buttonSelector: '.filter-icon-' + this.baseConfig.position
  		  	, iconCls: 'filter-icon-' + this.baseConfig.position
  		    , text: '&nbsp;&nbsp;&nbsp;&nbsp;'
  		    , handler: this.filterButtonHandler
  		    , scope: this
      	});
		var aPanel = new Ext.Panel({
			style: 'margin: 3px; padding: 3px; float: left;',
			title: '',
			items:[button]
		});
		return aPanel;
	}

	, filterButtonHandler : function() {
		var formState = this.getFormState();
		var errors = this.buildErrorString();
		if(errors.length>0){
			Sbi.exception.ExceptionHandler.showErrorMessage(errors, LN('sbi.worksheet.runtimeSheetFiltersPanel.errorwindow.title'));
		}else{
			this.fireEvent('apply', this, formState);
		}
		
	}
	
	, createField: function( openFilter ) {
		
		var field;
		
		var baseConfig = {
	       fieldLabel: openFilter.text
		   , name : openFilter.id
		   , width: this.baseConfig.fieldWidth
		   , allowBlank: true
		   , valueDelimiter: this.baseConfig.valueDelimiter
		};
		
		var store = this.createStore(openFilter);
		
		var maxSelectionNumber = 20;
		if (openFilter.maxSelectedNumber !== undefined && openFilter.maxSelectedNumber !== null) {
			maxSelectionNumber = openFilter.maxSelectedNumber;
		}
		if (openFilter.allowBlank !== undefined && openFilter.allowBlank !== null) {
			baseConfig.allowBlank = openFilter.allowBlank;
		}
		
		/*
		 * var tpl = new Ext.XTemplate( '<tpl for=".">' + '<tpl
		 * if="this.isDate(values[\'column-1\'])">' + '<div
		 * class="x-combo-list-item">{[values["column-1"]]}</div>' + '</tpl>' + '<tpl
		 * if="false == true">' + '<div class="x-combo-list-item">{column-1}</div>' + '</tpl>' + '</tpl>', {
		 * isDate: function(value){ alert(typeof value == 'date'); return typeof
		 * value == 'date'; } });
		 */
		
		field = new Ext.ux.form.SuperBoxSelect(Ext.apply(baseConfig, {
			// displayFieldTpl: tpl
			editable: true			
		    , forceSelection: false
		    , store: store
		    , mode: 'remote'
		    , displayField: 'column_2'
		    , displayFieldTpl: '<tpl for="."><div ext:qtip="{column_2}">{column_2}</div></tpl>' // tooltip for items selected
		    , valueField: 'column_1'
		    , emptyText: ''
		    , typeAhead: false
		    , triggerAction: 'all'
		    , selectOnFocus: true
		    , autoLoad: false
		    , maxSelection: maxSelectionNumber
		    , width: 200
		    , maxHeight: 250
		    , displayDateFormat: Sbi.locale.formats.date.dateFormat
		    , tpl: '<tpl for="."><div ext:qtip="{column_2}" class="x-combo-list-item">{column_2}&nbsp;</div></tpl>' // tooltip for available selections
		}));
		
		return field;
	}


	, createStore: function(openFilter) {
		var store = null;
//		if (openFilter.values != '[]') {
//			// case of fixed values
//			var data = [];
//			var temp = Ext.decode(openFilter.values);
//			for (var i = 0; i < temp.length; i++) {
//				data[i] = [temp[i]];
//			}
//			store = new Ext.data.ArrayStore({
//			    fields : ['column_1']
//				, data : data
//			});
//		} else {
			// we must load the values from server
			store = new Ext.data.JsonStore({
				url: this.services['getFilterValuesService']
			});
			var baseParams = {
					'fieldName': openFilter.field
					, 'sheetName' : this.baseConfig.sheetName
			};
			store.baseParams = baseParams;
			store.on('loadexception', function(store, options, response, e) {
				Sbi.exception.ExceptionHandler.handleFailure(response, options);
			});
//		}
		
		return store;
		
	}	

	// public methods
	
	, getFormState: function() {
		var state = {};
		for (var i = 0; i < this.combos.length; i++) {
			var aCombo = this.combos[i];
			// state[aCombo.name] = aCombo.getValuesList(); // it does not work
			// in Ext 3.2.1
			var concatenatedValues = aCombo.getValue();
			
			if (concatenatedValues == '') {
				state[aCombo.name] = [];
			} else {
				state[aCombo.name] = concatenatedValues.split(aCombo.valueDelimiter);
			}
		}
		return state;
	}
	
	, validate: function() {
		var errors = {};
		errors.mandatory = new Array();
		errors.toomuch = new Array();
		for (var i = 0; i < this.combos.length; i++) {
			var aCombo = this.combos[i];
			var comboValuesLength =aCombo.items.length;
			if(comboValuesLength==0 && !aCombo.allowBlank){
				errors.mandatory.push(aCombo.fieldLabel);
			}
			if(comboValuesLength>aCombo.maxSelection){
				errors.toomuch.push(aCombo.fieldLabel + '  (' + LN('sbi.worksheet.runtimeSheetFiltersPanel.errorwindow.text.maxselection') + ' ' + aCombo.maxSelection+')');
			}
		}
		return errors;
	}
	
	, buildErrorString: function(){
		var errors = this.validate();
		var mandatory = errors.mandatory;
		var toomuch = errors.toomuch;
		var errorString= '';
		if(mandatory.length>0){
			errorString = errorString +LN('sbi.worksheet.runtimeSheetFiltersPanel.errorwindow.text.mandatory')+'<br>';
		}
		for(var i=0; i<mandatory.length; i++){
			errorString = errorString+ '&nbsp;&nbsp;&nbsp;'+mandatory[i]+'<br>';
		}
		if(toomuch.length>0){
			errorString = errorString +LN('sbi.worksheet.runtimeSheetFiltersPanel.errorwindow.text.toomuch')+'<br>';
		}
		for(var i=0; i<toomuch.length; i++){
			errorString = errorString+'&nbsp;&nbsp;&nbsp;'+toomuch[i]+'<br>';
		}
		return errorString;
	}
  	
	, setFormState: function(staticOpenFilters) {
		for(var j in staticOpenFilters){
			for (var i = 0; i < this.combos.length; i++) {
				var aCombo = this.combos[i];
				if(aCombo.name==j){
					aCombo.setValue(staticOpenFilters[j]);
					break;
				}
			}	
		}
	}
	
});