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
pimcore.registerNS("Formbuilder.comp.elem");
Formbuilder.comp.elem = Class.create({


    initialize: function (data, parentPanel) {
        this.parentPanel = parentPanel;
        this.data = data;

        this.copyData = null;

        this.addLayout();
        this.initLayoutFields();
    },

    addLayout: function () {

        this.editpanel = new Ext.Panel({
            region: "center",
            layout:"fit",
            autoScroll: true
        });

        this.tree = new Ext.tree.TreePanel({
            xtype: "treepanel",
            region: "center",
            enableDD: true,
            useArrows:true,
            autoScroll: true,
            root: {
                id: "0",
                root: true,
                text: t("base"),
                reference: this,
                iconCls:"Formbuilder_icon_root",
                leaf: true,
                isTarget: true,
                listeners: this.getTreeNodeListeners()
            }
        });
        
        this.tree.on("nodedragover", this.onTreeNodeOver.bind(this));

        this.panel = new Ext.Panel({
            border: false,
            layout: "border",
            title: this.data.name + " ( ID: " + this.data.id + ")",
            items: [
            {
                region: "west",
                layout: "border",
                width: 200,
                split: true,
                items: [this.tree]
            },
            this.editpanel
            ],
            buttons: [{
                text: t("import"),
                iconCls: "pimcore_icon_import",
                handler: this.showImportPanel.bind(this)
            },
            {
                text: t("export"),
                iconCls: "pimcore_icon_export",
                handler: this.getExportFile.bind(this)
            },
            {
                text: t("save"),
                iconCls: "pimcore_icon_save",
                handler: this.save.bind(this)
            }
            ]
        });


        this.parentPanel.getEditPanel().add(this.panel);

        this.editpanel.add(this.getRootPanel());
        this.setCurrentNode("root");

        pimcore.layout.refresh();
    },


    initLayoutFields: function () {

        if (this.data.mainDefinitions) {
            if (this.data.mainDefinitions.childs) {
                if(this.data.mainDefinitions.childs.length != null){
                    for (var i = 0; i < this.data.mainDefinitions.childs.length; i++) {
                        this.tree.getRootNode().appendChild(this.recursiveAddNode(this.data.mainDefinitions.childs[i], this.tree.getRootNode()));
                    }
                }else{
                    this.tree.getRootNode().appendChild(this.recursiveAddNode(this.data.mainDefinitions.childs, this.tree.getRootNode()));
                }
                this.tree.getRootNode().expand();
            }
        }
    },

    recursiveAddNode: function (con, scope) {

        var fn = null;
        var newNode = null;
        
        fn = this.addElemChild.bind(scope, con.fieldtype, con);
        newNode = fn();

        if (con.childs) {
            if(con.childs.length != null){
                for (var i = 0; i < con.childs.length; i++) {
                    this.recursiveAddNode(con.childs[i], newNode);
                }
            }else{
                this.recursiveAddNode(con.childs, newNode);
            }
        }
        

        return newNode;
    },


    getTreeNodeListeners: function () {

        var listeners = {
            "click" : this.onTreeNodeClick,
            "contextmenu": this.onTreeNodeContextmenu,
            "beforemove": this.onTreeNodeBeforeMove
        };
        return listeners;
    },
    
    onTreeNodeOver: function (event) {
        var parent = ""
        if (event.point != "append"){
            parent = event.target.parentNode.attributes.iconCls;
        }else{
            parent = event.target.attributes.iconCls;
        }

        
        switch (parent){
            
            case "Formbuilder_icon_validator" :
                if(event.point != "append" && (event.dropNode.attributes.iconCls != "Formbuilder_icon_validator" || event.dropNode.attributes.iconCls != "Formbuilder_icon_filter")){
                    return true;
                }else{
                    return false;
                }
                break;
            case "Formbuilder_icon_filter" :
                if(event.point != "append" && (event.dropNode.attributes.iconCls != "Formbuilder_icon_validator" || event.dropNode.attributes.iconCls != "Formbuilder_icon_filter")){
                    return true;
                }else{
                    return false;
                }
                break;
            case "Formbuilder_icon_displayGroup":
                if(event.dropNode.attributes.iconCls != "Formbuilder_icon_validator" && event.dropNode.attributes.iconCls != "Formbuilder_icon_filter" && event.dropNode.attributes.iconCls != "Formbuilder_icon_displayGroup"){
                    return true;
                }else{
                    return false;
                }
                break;
            case "Formbuilder_icon_root" :
                if(event.dropNode.attributes.iconCls != "Formbuilder_icon_validator" && event.dropNode.attributes.iconCls != "Formbuilder_icon_filter"){
                    return true;
                }else{
                    return false;
                }
                break;
            default://field
                if(event.dropNode.attributes.iconCls != "Formbuilder_icon_validator" || event.dropNode.attributes.iconCls != "Formbuilder_icon_filter"){
                    return true;
                }else{
                    return false;
                }
                break;
            
                    
        }
    },
    

    
    onTreeNodeBeforeMove : function (tree, element, oldParent, newParent, index){
        
        switch (newParent.attributes.iconCls){
            
            case "Formbuilder_icon_validator" :
                return false;
                break;
            case "Formbuilder_icon_filter" :
                return false;
                break;
            case "Formbuilder_icon_displayGroup":
                if(element.attributes.iconCls != "Formbuilder_icon_validator" && element.attributes.iconCls != "Formbuilder_icon_filter" && element.attributes.iconCls != "Formbuilder_icon_displayGroup"){
                    return true;
                }else{
                    return false;
                }
                break;
            case "Formbuilder_icon_root" :
                if(element.attributes.iconCls != "Formbuilder_icon_validator" && element.attributes.iconCls != "Formbuilder_icon_filter"){
                    return true;
                }else{
                    return false;
                }
                break;
            default://field
                if(element.attributes.iconCls != "Formbuilder_icon_validator" || element.attributes.iconCls != "Formbuilder_icon_filter"){
                    return true;
                }else{
                    return false;
                }
                break;
                    
        }
        
        
        
        return false;
    },



    onTreeNodeClick: function () {

        this.attributes.reference.saveCurrentNode();
        this.attributes.reference.editpanel.removeAll();

        if (this.attributes.object) {

            if (this.attributes.object.datax.locked) {
                return;
            }

            this.attributes.reference.editpanel.add(this.attributes.object.getLayout());
            this.attributes.reference.setCurrentNode(this.attributes.object);
        }

        if (this.attributes.root) {
            this.attributes.reference.editpanel.add(this.attributes.reference.getRootPanel());
            this.attributes.reference.setCurrentNode("root");
        }

        this.attributes.reference.editpanel.doLayout();
    },

    onTreeNodeContextmenu: function () {
        this.select();

        var menu = new Ext.menu.Menu();
        var childsAllowed = true;

        
        if(childsAllowed) {

            var parentType = "root";
            
            if (this.attributes.object) {
                parentType = this.attributes.object.type;
            }
            
            // specify which childs a layout can have
            // the child-type "data" is a placehoder for all data components 
            var allowedTypes = {                
                root: ["button","captcha","checkbox","file","hash","hidden","image","multiCheckbox","multiselect","password","radio","reset","select","submit","text","textarea"],
                displayGroup: ["button","captcha","checkbox","file","hash","hidden","image","multiCheckbox","multiselect","password","radio","reset","select","submit","text","textarea"]
            };

            var allowedFilters = {
                button: ["alnum","alpha","baseName","boolean","callback","digits","dir","htmlEntities","int","pregReplace","stringToLower","stringToUpper","stringTrim","stripTags"],
                captcha: ["alnum","alpha","baseName","boolean","callback","digits","dir","htmlEntities","int","pregReplace","stringToLower","stringToUpper","stringTrim","stripTags"],
                checkbox: ["alnum","alpha","baseName","boolean","callback","digits","dir","htmlEntities","int","pregReplace","stringToLower","stringToUpper","stringTrim","stripTags"],
                file: ["alnum","alpha","baseName","boolean","callback","digits","dir","htmlEntities","int","pregReplace","stringToLower","stringToUpper","stringTrim","stripTags"],
                hash: ["alnum","alpha","baseName","boolean","callback","digits","dir","htmlEntities","int","pregReplace","stringToLower","stringToUpper","stringTrim","stripTags"],
                hidden: ["alnum","alpha","baseName","boolean","callback","digits","dir","htmlEntities","int","pregReplace","stringToLower","stringToUpper","stringTrim","stripTags"],
                image: ["alnum","alpha","baseName","boolean","callback","digits","dir","htmlEntities","int","pregReplace","stringToLower","stringToUpper","stringTrim","stripTags"],
                multiCheckbox: ["alnum","alpha","baseName","boolean","callback","digits","dir","htmlEntities","int","pregReplace","stringToLower","stringToUpper","stringTrim","stripTags"],
                multiselect: ["alnum","alpha","baseName","boolean","callback","digits","dir","htmlEntities","int","pregReplace","stringToLower","stringToUpper","stringTrim","stripTags"],
                password: ["alnum","alpha","baseName","boolean","callback","digits","dir","htmlEntities","int","pregReplace","stringToLower","stringToUpper","stringTrim","stripTags"],
                radio: ["alnum","alpha","baseName","boolean","callback","digits","dir","htmlEntities","int","pregReplace","stringToLower","stringToUpper","stringTrim","stripTags"],
                reset: ["alnum","alpha","baseName","boolean","callback","digits","dir","htmlEntities","int","pregReplace","stringToLower","stringToUpper","stringTrim","stripTags"],
                select: ["alnum","alpha","baseName","boolean","callback","digits","dir","htmlEntities","int","pregReplace","stringToLower","stringToUpper","stringTrim","stripTags"],
                submit: ["alnum","alpha","baseName","boolean","callback","digits","dir","htmlEntities","int","pregReplace","stringToLower","stringToUpper","stringTrim","stripTags"],
                text: ["alnum","alpha","baseName","boolean","callback","digits","dir","htmlEntities","int","pregReplace","stringToLower","stringToUpper","stringTrim","stripTags"],
                textarea: ["alnum","alpha","baseName","boolean","callback","digits","dir","htmlEntities","int","pregReplace","stringToLower","stringToUpper","stringTrim","stripTags"]
            };

            var allowedValidators = { 
                button: ["alnum","alpha","between","callback","creditCard","date","digits","emailAddress","float","greaterThan","hex","hostname","iban","identical","inArray","int","ip","isbn","lessThan","postCode","regex","stringLength"],
                captcha: ["alnum","alpha","between","callback","creditCard","date","digits","emailAddress","float","greaterThan","hex","hostname","iban","identical","inArray","int","ip","isbn","lessThan","postCode","regex","stringLength"],
                checkbox: ["alnum","alpha","between","callback","creditCard","date","digits","emailAddress","float","greaterThan","hex","hostname","iban","identical","inArray","int","ip","isbn","lessThan","postCode","regex","stringLength"],
                file: ["extension","callback"],
                hash: ["alnum","alpha","between","callback","creditCard","date","digits","emailAddress","float","greaterThan","hex","hostname","iban","identical","inArray","int","ip","isbn","lessThan","postCode","regex","stringLength"],
                hidden: ["alnum","alpha","between","callback","creditCard","date","digits","emailAddress","float","greaterThan","hex","hostname","iban","identical","inArray","int","ip","isbn","lessThan","postCode","regex","stringLength"],
                image: ["alnum","alpha","between","callback","creditCard","date","digits","emailAddress","float","greaterThan","hex","hostname","iban","identical","inArray","int","ip","isbn","lessThan","postCode","regex","stringLength"],
                multiCheckbox: ["alnum","alpha","between","callback","creditCard","date","digits","emailAddress","float","greaterThan","hex","hostname","iban","identical","inArray","int","ip","isbn","lessThan","postCode","regex","stringLength"],
                multiselect: ["alnum","alpha","between","callback","creditCard","date","digits","emailAddress","float","greaterThan","hex","hostname","iban","identical","inArray","int","ip","isbn","lessThan","postCode","regex","stringLength"],
                password: ["alnum","alpha","between","callback","creditCard","date","digits","emailAddress","float","greaterThan","hex","hostname","iban","identical","inArray","int","ip","isbn","lessThan","postCode","regex","stringLength"],
                radio: ["alnum","alpha","between","callback","creditCard","date","digits","emailAddress","float","greaterThan","hex","hostname","iban","identical","inArray","int","ip","isbn","lessThan","postCode","regex","stringLength"],
                reset: ["alnum","alpha","between","callback","creditCard","date","digits","emailAddress","float","greaterThan","hex","hostname","iban","identical","inArray","int","ip","isbn","lessThan","postCode","regex","stringLength"],
                select: ["alnum","alpha","between","callback","creditCard","date","digits","emailAddress","float","greaterThan","hex","hostname","iban","identical","inArray","int","ip","isbn","lessThan","postCode","regex","stringLength"],
                submit: ["alnum","alpha","between","callback","creditCard","date","digits","emailAddress","float","greaterThan","hex","hostname","iban","identical","inArray","int","ip","isbn","lessThan","postCode","regex","stringLength"],
                text: ["alnum","alpha","between","callback","creditCard","date","digits","emailAddress","float","greaterThan","hex","hostname","iban","identical","inArray","int","ip","isbn","lessThan","postCode","regex","stringLength"],
                textarea: ["alnum","alpha","between","callback","creditCard","date","digits","emailAddress","float","greaterThan","hex","hostname","iban","identical","inArray","int","ip","isbn","lessThan","postCode","regex","stringLength"]
            };

            
            var layoutElem = [];
            var layouts = Object.keys(Formbuilder.comp.type);

            for (var i = 0; i < layouts.length; i++) {
                if (layouts[i] != "layout") {
                    if (in_array(layouts[i], allowedTypes[parentType])) {
                        layoutElem.push({
                            text: Formbuilder.comp.type[layouts[i]].prototype.getTypeName(),
                            iconCls: Formbuilder.comp.type[layouts[i]].prototype.getIconClass(),
                            handler: this.attributes.reference.addElemChild.bind(this, layouts[i])
                        });
                    }

                }
            }

            if (parentType == "root") {
                menu.add(new Ext.menu.Item({
                    text: t('Add displayGroup'),
                    iconCls: "Formbuilder_icon_displayGroup_add",
                    handler: this.attributes.reference.addElemChild.bind(this, "displayGroup")
                }));
            }

            if (layoutElem.length > 0) {
                menu.add(new Ext.menu.Item({
                    text: t('Add elem item'),
                    iconCls: "Formbuilder_icon_item_add",
                    hideOnClick: false,
                    menu: layoutElem
                }));
            }

            var filterElem = [];
            var filters = Object.keys(Formbuilder.comp.filter);

            for (var i = 0; i < filters.length; i++) {
                if (filters[i] != "layout") {
                    if (in_array(filters[i], allowedFilters[parentType])) {
                        filterElem.push({
                            text: Formbuilder.comp.filter[filters[i]].prototype.getTypeName(),
                            iconCls: Formbuilder.comp.filter[filters[i]].prototype.getIconClass(),
                            handler: this.attributes.reference.addElemChild.bind(this, filters[i],null,"filter")
                        });
                    }

                }
            }

            if (filterElem.length > 0) {
                menu.add(new Ext.menu.Item({
                    text: t('Add elem filter'),
                    iconCls: "Formbuilder_icon_filter_add",
                    hideOnClick: false,
                    menu: filterElem
                }));
            }

            var validatorElem = [];
            var validators = Object.keys(Formbuilder.comp.validator);

            for (var i = 0; i < validators.length; i++) {
                if (validators[i] != "layout") {
                    if (in_array(validators[i], allowedValidators[parentType])) {
                        validatorElem.push({
                            text: Formbuilder.comp.validator[validators[i]].prototype.getTypeName(),
                            iconCls: Formbuilder.comp.validator[validators[i]].prototype.getIconClass(),
                            handler: this.attributes.reference.addElemChild.bind(this, validators[i],null,"validator")
                        });
                    }

                }
            }

            if (validatorElem.length > 0) {
                menu.add(new Ext.menu.Item({
                    text: t('Add elem validator'),
                    iconCls: "Formbuilder_icon_validator_add",
                    hideOnClick: false,
                    menu: validatorElem
                }));
            }


                     

            
            
        }

        var deleteAllowed = true;

        if (this.attributes.object) {
            if (this.attributes.object.datax.locked) {
                deleteAllowed = false;
            }
        }

        if (this.id != 0) {
            menu.add(new Ext.menu.Item({
                text: t('copy'),
                iconCls: "pimcore_icon_copy",
                handler: this.attributes.reference.copyChild.bind(this)
            }));
        }

        var showPaste = false;

        if (this.attributes.reference.copyData != null) {
            var copyType = this.attributes.reference.copyData.fieldtype;
            if(this.id == 0){
                if(copyType=="displayGroup"){
                    showPaste = true;
                }
                if(in_array(copyType, allowedTypes[parentType])){
                    showPaste=true;
                }
            }else{
                if( ! (this.attributes.object.datax.isFilter || this.attributes.object.datax.isValidator)){
                    if(in_array(copyType, allowedTypes[parentType])){
                        showPaste=true;
                    }
                    if(in_array(copyType, allowedFilters[parentType])){
                        showPaste=true;
                    }
                    if(in_array(copyType, allowedValidators[parentType])){
                        showPaste=true;
                    }
                    
                }
            }

        }
        if(showPaste == true){
            menu.add(new Ext.menu.Item({
                text: t('paste'),
                iconCls: "pimcore_icon_paste",
                handler: this.attributes.reference.pasteChild.bind(this)
            }));
        }

        if (this.id != 0 && deleteAllowed) {
            menu.add(new Ext.menu.Item({
                text: t('delete'),
                iconCls: "pimcore_icon_delete",
                handler: this.attributes.reference.removeChild.bind(this)
            }));
        }

        menu.show(this.ui.getAnchor());
    },

    setCurrentNode: function (cn) {
        this.currentNode = cn;
    },

    saveCurrentNode: function () {
        if (this.currentNode) {
            if (this.currentNode != "root") {
                this.currentNode.applyData();
            }
            else {
                // save root node data
                var items = this.rootPanel.findBy(function() {
                    return true;
                });

                for (var i = 0; i < items.length; i++) {
                    if (typeof items[i].getValue == "function") {
                        this.data[items[i].name] = items[i].getValue();
                    }
                }

                var rootNode = this.tree.getRootNode();

                var valide = this.rootPanel.getForm().isValid();
                if(valide == false){
                    this.isValid = false;
                    rootNode.getUI().addClass("tree_node_error");

                }else{
                    this.isValid = true;
                    rootNode.getUI().removeClass("tree_node_error");
                }

            }
        }
    },

    getRootPanel: function () {
        
        var methodStore = new Ext.data.ArrayStore({
            fields: ["value","label"],
            data : [["post","POST"],["get","GET"]]
        });
        
        var html = new Ext.data.ArrayStore({
            fields: ["value","label"],
            data : [["class","class"],["id","id"],["title","title"],["onclick","onclick"],["ondbclick","ondbclick"],["onkeydown","onkeydown"],["onkeypress","onkeypress"],["onkeyup","onkeyup"],["onmousedown","onmousedown"],["onmousemove","onmousemove"],["onmouseout","onmouseout"],["onmouseover","onmouseover"],["onmouseup","onmouseup"],["onselect","onselect"],["onreset","onreset"],["onsubmit","onsubmit"]]
        });
        
        var encStore = new Ext.data.ArrayStore({
            fields: ["value","label"],
            data : [["text/plain","text/plain"],["application/x-www-form-urlencoded","application/x-www-form-urlencoded"],["multipart/form-data","multipart/form-data"]]
        });



        this.rootPanel = new Ext.form.FormPanel({
            title: t("Form configuration"),
            bodyStyle: "padding:5px 5px 0",
            layout: "pimcoreform",
            items: [
            {
                xtype: "textfield",
                fieldLabel: t("name"),
                name: "name",
                width: 300,
                value: this.data.name
            },
            {
                xtype: "textfield",
                name: "action",
                value:this.data.action,
                fieldLabel: t("Action"),
                width: 300,
                allowBlank:false
            },
            {
                xtype: "combo",
                name: "method",
                fieldLabel: t("Method"),
                queryDelay: 0,
                displayField:"label",
                valueField: "value",
                mode: 'local',
                store: methodStore,
                editable: true,
                triggerAction: 'all',
                width: 300,
                value:this.data.method,
                allowBlank:false
            },
            {
                xtype: "combo",
                name: "enctype",
                fieldLabel: t("Enctype"),
                queryDelay: 0,
                displayField:"label",
                valueField: "value",
                mode: 'local',
                store: encStore,
                editable: false,
                triggerAction: 'all',
                anchor:"100%",
                value: this.data.enctype,
                allowBlank:false
            },
            new Ext.ux.form.SuperField({
                id:"attrib",
                allowEdit: true,
                name: "attrib",
                stripeRows:false,
                values:this.data.attrib,
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
        });

        return this.rootPanel;
    },

    addElemChild: function (type, initData, stype) {

        var nodeLabel = t(type);
        var filter = false;
        var validator = false;

        if (initData) {
            if (initData.name && initData.isFilter!=true && initData.isValidator != true) {
                nodeLabel = initData.name;
            }
            if(initData.isFilter==true){
                filter = true;
                nodeLabel = t(initData.name);
            }
            if(initData.isValidator==true){
                validator = true;
                nodeLabel = t(initData.name);
            }

        }

        if(stype=="filter" ){
            filter = true;
        }

        if(stype=="validator"){
            validator = true;
        }

        var newNode = null;

        if(filter == false && validator == false){

            newNode = new Ext.tree.TreeNode({
                type: "layout",
                reference: this.attributes.reference,
                draggable: true,
                iconCls: "Formbuilder_icon_" + type,
                text: nodeLabel,
                listeners: this.attributes.reference.getTreeNodeListeners()
            });
            

            newNode.attributes.object = new Formbuilder.comp.type[type](newNode, initData,this);
        }else{
            if(filter == true){
                newNode = new Ext.tree.TreeNode({
                    type: "layout",
                    reference: this.attributes.reference,
                    draggable: true,
                    iconCls: "Formbuilder_icon_filter",
                    text: nodeLabel,
                    listeners: this.attributes.reference.getTreeNodeListeners()
                });
                newNode.attributes.object = new Formbuilder.comp.filter[type](newNode, initData,this);
            }
            if(validator == true){
                newNode = new Ext.tree.TreeNode({
                    type: "layout",
                    reference: this.attributes.reference,
                    draggable: true,
                    iconCls: "Formbuilder_icon_validator",
                    text: nodeLabel,
                    listeners: this.attributes.reference.getTreeNodeListeners()
                });
                newNode.attributes.object = new Formbuilder.comp.validator[type](newNode, initData,this);
            }

        }
        this.appendChild(newNode);

        this.renderIndent();
        this.expand();

        return newNode;
    },

    copyChild: function () {
        if (this.id != 0) {
            this.attributes.reference.names = [];
            this.attributes.reference.saveCurrentNode();
            this.attributes.reference.getData();
            this.attributes.reference.copyData = this.attributes.object.datax;

        }
    },

    pasteChild: function () {
        

        this.attributes.reference.recursiveAddNode(this.attributes.reference.copyData,this);

        
    },



    removeChild: function () {
        if (this.id != 0) {
            if (this.attributes.reference.currentNode == this.attributes.object) {
                this.currentNode = null;
                var f = this.attributes.reference.onTreeNodeClick.bind(this.attributes.reference.tree.getRootNode());
                f();
            }
            this.remove();
        }
    },

    getNodeData: function (node) {

        var data = {};
        

        if (node.attributes.object) {
            if (typeof node.attributes.object.getData == "function") {
                data = node.attributes.object.getData();
                var valid = node.attributes.object.isValid();
                
                if(!(data.isFilter || data.isValidator) && in_array(data.name, this.names)){
                    node.getUI().addClass("tree_node_error");
                    pimcore.helpers.showNotification(t("error"), t("some_fields_names_are_in_double"), "error");

                    this.getDataSuccess = false;
                    return false;
                }else{
                    this.names.push(data.name);
                }

                if (valid == true) {
                    
                    node.getUI().removeClass("tree_node_error");
                }
                else {
                    node.getUI().addClass("tree_node_error");
                    pimcore.helpers.showNotification(t("error"), t("some_fields_cannot_be_saved"), "error");

                    this.getDataSuccess = false;
                    return false;
                }
            }
        }

        
        if (node.childNodes.length > 0) {
            data.childs = [];
            for (var i = 0; i < node.childNodes.length; i++) {
                data.childs.push(this.getNodeData(node.childNodes[i]));
            }
        }else{
            if (data.childs){
                delete data.childs;
            }
        }

        return data;
    },

    getData: function () {

        this.getDataSuccess = true;
        
        var rootNode = this.tree.getRootNode();
        

        if(this.isValid == false){
            rootNode.getUI().addClass("tree_node_error");
            
            pimcore.helpers.showNotification(t("error"), t("some_fields_cannot_be_saved"), "error");

            this.getDataSuccess = false;
            return false;
        }else{
            rootNode.getUI().removeClass("tree_node_error");
        }

        
        var nodeData = this.getNodeData(rootNode);

        return nodeData;
    },

    showImportPanel: function(){
        var importPanel = new Formbuilder.comp.importer(this);
        importPanel.showPanel();
    },

    importation: function(data){
        this.parentPanel.getEditPanel().removeAll();
        this.data = array_merge(this.data,data);

        this.addLayout();
        this.initLayoutFields();
    },
    
    getExportFile: function(){
        location.href = "/plugin/Zendformbuilder/Settings/getexportfile?id=" + this.data.id + "&name=" + this.data.name; 
    },

    save: function () {

        this.names = [];
        this.saveCurrentNode();

        var m = Ext.encode(this.getData());
        var n = Ext.encode(this.data);

        if (this.getDataSuccess) {
            Ext.Ajax.request({
                url: "/plugin/Zendformbuilder/Settings/save",
                method: "post",
                params: {
                    configuration: m,
                    values: n,
                    id: this.data.id
                },
                success: this.saveOnComplete.bind(this)
            });
        }
    },

    saveOnComplete: function () {
        this.parentPanel.tree.getRootNode().reload();
        pimcore.globalmanager.get("object_types_store").reload();


        pimcore.helpers.showNotification(t("success"), t("Formbuilder_saved_successfully"), "success");
    }
});