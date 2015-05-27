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

pimcore.registerNS("Formbuilder.comp.type.select");
Formbuilder.comp.type.select = Class.create(Formbuilder.comp.type.base,{

    type: "select",


    getTypeName: function () {
        return t("select");
    },

    getIconClass: function () {
        return "Formbuilder_icon_select";
    },

    getForm: function($super){
        $super();



        var thisNode = new Ext.form.FieldSet({
            title: t("This node"),
            collapsible: true,
            defaultType: 'textfield',
            items:[{
                    xtype: "textfield",
                    name: "separator",
                    fieldLabel: t("separator"),
                    anchor: "100%"
                },
                {
                xtype: "checkbox",
                name: "registerInArrayValidator",
                fieldLabel: t("registerInArrayValidator"),
                checked:false
            },
            new Ext.ux.form.SuperField({
                allowEdit: true,
                name: "multiOptions",
                stripeRows:true,
                values:this.datax.multiOptions,
                items: [
                {
                    xtype: "textfield",
                    name: "key",
                    fieldLabel: t("Option"),
                    anchor: "100%",
                    summaryDisplay:true,
                    allowBlank:false
                },
                {
                    xtype: "textfield",
                    name: "value",
                    fieldLabel: t("Value"),
                    anchor: "100%",
                    summaryDisplay:true,
                    allowBlank:false
                }
                ]
            })

            ]
        });



        this.form.add(thisNode);

        return this.form;
    },
    getTranslatForm:function($super){
        $super();
        if(this.datax.multiOptions){
            var values = new Array();
            
            for (var i=0;i<this.datax.multiOptions.length;i++){
                values.push([this.datax.multiOptions[i]["value"],this.datax.multiOptions[i]["value"]]);
            };
        
            var storeMulti = new Ext.data.ArrayStore({
                fields: ["key","label"],
                data : values
            });
        }
        
        var trans = new Ext.form.FieldSet({
            title: t("multiOptions translation"),
            collapsible: true,
            defaultType: 'textfield',
            items:[new Ext.ux.form.SuperField({
                allowEdit: true,
                name: "multiOptions",
                stripeRows:false,
                values:this.datax.translate.multiOptions,
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
                    xtype: "combo",
                    name: "multiOptions",
                    fieldLabel: t("multiOptions"),
                    queryDelay: 0,
                    displayField:"label",
                    valueField: "key",
                    mode: 'local',
                    store: storeMulti,
                    editable: false,
                    triggerAction: 'all',
                    anchor:"100%",
                    summaryDisplay:true,
                    allowBlank:false
                },

                {
                    xtype: "textfield",
                    name: "value",
                    fieldLabel: t("value"),
                    anchor: "100%",
                    summaryDisplay:true
                }
                ]
            })

            ]
        });
        
        
        
        this.transForm.add(trans);
        
        return this.transForm;
        
    }

});