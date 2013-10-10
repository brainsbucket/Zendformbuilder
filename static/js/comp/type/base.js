/*

Copyright (c) 2011, alexandre delattre
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

 * Redistributions of source code must retain the above copyright notice,
   this list of conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright
   notice, this list of conditions and the following disclaimer in the
   documentation and/or other materials provided with the distribution.
 * Neither the name of grafyweb.com nor the names of its contributors may
   be used to endorse or promote products derived from this software
   without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
POSSIBILITY OF SUCH DAMAGE.

 */

pimcore.registerNS("Formbuilder.comp.type.base");
Formbuilder.comp.type.base = Class.create({

    type: "base",
    rulable: false,
    apiUrl:"http://framework.zend.com/apidoc/core/_Form_Element_{name}.html#\Zend_Form_Element_{name}",
    apiPrefix:"",

    initialize: function (treeNode, initData, parent) {

        

        this.treeNode = treeNode;        
        this.initData(initData);
    },
    
    getApiUrl: function(){
        var name = this.getType();
        var firstLetter = name.substr(0, 1);
        name =  firstLetter.toUpperCase() + name.substr(1);
        name = this.apiPrefix + name;
        var url = str_replace("{name}", name, this.apiUrl);
        return url;
        

    },
    
    viewApi: function(){
         var wind = new Formbuilder.apiwindow(this.getApiUrl());
         wind.showWindow();
    },

    getTypeName: function () {
        return t("base");
    },

    getIconClass: function () {
        return "Formbuilder_icon_base";
    },
    
    initData: function (d) {
        this.valid = true;

        

        this.datax = {
            name: t("layout"),
            fieldtype: this.getType()
        };
        

        if(d){
            try{
                this.datax = d;
                if(!this.datax.translate){
                    this.datax.translate = new Array();
                }
            }
            catch(e){
                    
            }
        }
    },

    getType: function () {
        return this.type;
    },

    getLayout: function () {

        this.layout = new Ext.Panel({
            title: t("Field type ") + this.getTypeName(),
            closable:false,
            autoScroll:true,
            items: [this.getForm()]

        });

        this.layout2 = new Ext.Panel({
            title: t("Translate : ") + this.getTypeName(),
            closable:false,            
            autoScroll:true,
            listeners: {
                activate: function(tab){
                    this.applyData();
                    this.layout2.removeAll();
                    this.layout2.add(this.getTranslatForm());
                    this.layout2.doLayout();
                }.bind(this)
            },
            items: [this.getTranslatForm()]

        });

        this.tab = new Ext.TabPanel({
            tabPosition: "top",
            region:'center',
            deferredRender:true,
            enableTabScroll:true,
            border: false,
            items: [this.layout,this.layout2],
            activeTab: 0
        });




        this.layout.on("render", this.layoutRendered.bind(this));

        return this.tab;
    },

    onAfterPopulate: function(){
        
        return true;
    },

    layoutRendered: function () {

        
        
        var form = this.form.getForm();
        //This is for the SuperField bug
        form.items.each(function(item,index,length){
            var name = item.getName();
            
            if(!(item instanceof Ext.form.DisplayField) && !(item instanceof Ext.ux.form.SuperField)){

                
                if(item.ownerCt.layout != "hbox"){
                    item.setValue(this.datax[name]);
                }
            }
        },this
        );

        

        this.onAfterPopulate();

        for (var i = 0; i < form.items.items.length; i++) {
            if (form.items.items[i].name == "name") {
                form.items.items[i].on("keyup", this.updateName.bind(this));
                break;
            }
        }


    },

    updateName: function () {

        var form = this.form.getForm();        
        
        
        for (var i = 0; i < form.items.items.length; i++) {
            if (form.items.items[i].name == "name") {
                this.treeNode.setText(form.items.items[i].getValue());
                break;
            }
        }
        
        
           
    },

    getData: function () {
        return this.datax;
    },

    isValid: function(){
        return this.valid;
    },

    applyData: function () {

        this.valid = this.form.getForm().isValid();
        

        if(this.valid == true){
            this.treeNode.getUI().removeClass("tree_node_error");
        }else{
            this.treeNode.getUI().addClass("tree_node_error");
        }

        var data = {};

        this.form.getForm().items.each(function(item,index,length){
            var name = item.getName();
            var bug = name.indexOf("[]");
            if(!(item instanceof Ext.form.DisplayField) && bug==-1){
                
                if(item.ownerCt.layout != "hbox"){
                    data[name]=item.getValue();
                }
            }
        },this
        );

        data.translate = {};

        this.transForm.getForm().items.each(function(item,index,length){
            var name = item.getName();
            var bug = name.indexOf("[]");
            if(!(item instanceof Ext.form.DisplayField) && bug==-1){

                if(item.ownerCt.layout != "hbox"){
                    data.translate[name]=item.getValue();
                }
            }
        },this
        );

        //var data = this.form.getForm().getFieldValues();
        data.fieldtype = this.getType();
        
        this.datax = data;
            

        this.datax.fieldtype = this.getType();
    },

    getForm: function(){
        
        var html = new Ext.data.ArrayStore({
            fields: ["value","label"],
            data : [["class","class"],["id","id"],["style","style"],["maxlegth","maxlength"],["disabled","disabled"],["readonly","readonly"],["size","size"],["title","title"],["onchange","onchange"],["onclick","onclick"],["ondbclick","ondbclick"],["onfocus","onfocus"],["onkeydown","onkeydown"],["onkeypress","onkeypress"],["onkeyup","onkeyup"],["onmousedown","onmousedown"],["onmousemove","onmousemove"],["onmouseout","onmouseout"],["onmouseover","onmouseover"],["onmouseup","onmouseup"],["onselect","onselect"]]
        });

        
        this.form = new Ext.FormPanel({
            bodyStyle:'padding:5px 5px 0',
            labelWidth: 150,
            defaultType: 'textfield',
            items: [ this.getHookForm() ,{
                xtype:'fieldset',
                title: t('base settings'),
                collapsible: true,
                autoHeight:true,
                defaultType: 'textfield',
                items:[{
                    xtype:"button",
                    text: t("View API"),
                    iconCls: "pimcore_icon_api",
                    handler: this.viewApi.bind(this),
                    style:{marginBottom : "5px"}
                },
                {
                    xtype: "textfield",
                    fieldLabel: t("name"),
                    name: "name",
                    allowBlank:false,
                    anchor: "100%",
                    enableKeyEvents: true
                },
                {
                    id:"fieldlabel",
                    xtype: "textfield",
                    name: "label",
                    fieldLabel: t("label"),
                    anchor: "100%"
                },
                {
                    id:"fielddescription",
                    xtype: "textfield",
                    name: "description",
                    fieldLabel: t("description"),
                    anchor: "100%"
                },

                {
                    id:"fieldallowempty",
                    xtype: "checkbox",
                    name: "allowEmpty",
                    fieldLabel: t("allowEmpty"),
                    checked:true
                },
                {
                    id:"fieldrequired",
                    xtype: "checkbox",
                    name: "required",
                    fieldLabel: t("required"),
                    checked:false
                },
                {
                    id:"fieldvalue",
                    xtype: "textfield",
                    name: "value",
                    fieldLabel: t("value"),
                    anchor: "100%"
                },
                new Ext.ux.form.SuperField({
                    id:"attrib",
                    allowEdit: true,
                    name: "attrib",
                    stripeRows:false,
                    values:this.datax.attrib,
                    items: [
                    {
                        xtype: "combo",
                        name: "key",
                        fieldLabel: t("attribute name"),
                        queryDelay: 0,
                        displayField:"label",
                        valueField: "value",
                        mode: 'local',
                        store: html,
                        editable: true,
                        triggerAction: 'all',
                        anchor:"100%",
                        value:"",
                        summaryDisplay:true,
                        allowBlank:false
                    },

                    {
                        xtype: "textfield",
                        name: "value",
                        fieldLabel: t("attribute value"),
                        anchor: "100%",
                        summaryDisplay:true,
                        allowBlank:false
                    }
                    ]
                })



                ]


            }]
        });
        return this.form;
    },

    getHookForm: function(){
      var fs = new Ext.form.FieldSet({
            title: t("Hook"),
            collapsible: true,
            collapsed:true,
            defaultType: 'textfield',
            items:[{
                    xtype: "textfield",
                    name: "custom_class",
                    fieldLabel: t("custom class"),
                    anchor: "100%"
                },
                {
                    xtype: "textfield",
                    name: "custom_action",
                    fieldLabel: t("static action"),
                    anchor: "100%"
                }
            ]});
        return fs;
    },

    getLanguages: function(){


        var languages = pimcore.globalmanager.get("Formbuilder.languages");

        var values = new Array();

        for (var i=0;i<languages.length;i++){
            values.push([languages[i],languages[i]]);
        };

        var store = new Ext.data.ArrayStore({
            fields: ["key","label"],
            data : values
        });

        this.localeStore = store;
        return this.localeStore;
            
    },
    
    getTranslatForm: function(){
        
        
        

        this.getLanguages();


        
        this.transForm = new Ext.FormPanel({
            bodyStyle:'padding:5px 5px 0',
            labelWidth: 150,
            defaultType: 'textfield',            
            items: [{
                xtype:'fieldset',
                title: t('label translation'),
                collapsible: false,
                autoHeight:true,
                defaultType: 'textfield',
                items:[{
                    xtype: "textfield",
                    name: "originallabel",
                    fieldLabel: t("original label"),
                    anchor: "100%",
                    value:this.datax.label,
                    disabled:true
                },
                new Ext.ux.form.SuperField({
                    allowEdit: true,
                    name: "label",
                    stripeRows:true,
                    values:this.datax.translate.label,
                    fieldLabel: t("Label traduction"),
                    items: [
                    {
                        xtype: "combo",
                        name: "locale",
                        fieldLabel: t("Locale"),
                        queryDelay: 0,
                        displayField:"label",
                        valueField: "key",
                        mode: 'local',
                        store: this.localeStore,
                        editable: false,
                        triggerAction: 'all',
                        anchor:"100%",
                        summaryDisplay:true,
                        allowBlank:false
                    },{
                        xtype: "textfield",
                        name: "value",
                        fieldLabel: t("value"),
                        anchor: "100%",
                        summaryDisplay:true,
                        allowBlank:false
                    }
                    ]
                })
                ]
            },
            {
                xtype:'fieldset',
                title: t('description translation'),
                collapsible: false,
                autoHeight:true,
                defaultType: 'textfield',
                items:[{
                    xtype: "textfield",
                    name: "originaldescription",
                    fieldLabel: t("original description"),
                    anchor: "100%",
                    value:this.datax.description,
                    disabled:true
                },
                new Ext.ux.form.SuperField({
                    allowEdit: true,
                    name: "description",
                    stripeRows:true,
                    values:this.datax.translate.description,
                    items: [
                    {
                        xtype: "combo",
                        name: "locale",
                        fieldLabel: t("Locale"),
                        queryDelay: 0,
                        displayField:"label",
                        valueField: "key",
                        mode: 'local',
                        store: this.localeStore,
                        editable: false,
                        triggerAction: 'all',
                        anchor:"100%",
                        summaryDisplay:true,
                        allowBlank:false
                    },{
                        xtype: "textfield",
                        name: "value",
                        fieldLabel: t("value"),
                        anchor: "100%",
                        summaryDisplay:true,
                        allowBlank:false
                    }
                    ]
                })
                ]
            }







            ]

        });
        
        return this.transForm;
    },
    
    checkPath: function(path,field){
        Ext.Ajax.request({
            url: "/plugin/Zendformbuilder/Settings/checkpath",
            method: "post",
            params: {
                path:path
            },
            success: this.pathChecked.bind(field)
        });
    },
    
    pathChecked: function(response){
        var ret = Ext.decode(response.responseText);

        if(ret.success == true){
            this.clearInvalid();
        }else{
            this.markInvalid(t("thePath doesn't exist"));
            
        }
         

    }

    

});