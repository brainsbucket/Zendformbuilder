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

pimcore.registerNS("Formbuilder.comp.type.displayGroup");
Formbuilder.comp.type.displayGroup = Class.create(Formbuilder.comp.type.base,{

    type: "displayGroup",


    getTypeName: function () {
        return t("displayGroup");
    },

    getIconClass: function () {
        return "Formbuilder_icon_displayGroup";
    },


    getForm: function(){
        var html = new Ext.data.ArrayStore({
            fields: ["value","label"],
            data : [["class","class"],["id","id"],["maxlegth","maxlength"],["disabled","disabled"],["readonly","readonly"],["size","size"],["title","title"],["onchange","onchange"],["onclick","onclick"],["ondbclick","ondbclick"],["onfocus","onfocus"],["onkeydown","onkeydown"],["onkeypress","onkeypress"],["onkeyup","onkeyup"],["onmousedown","onmousedown"],["onmousemove","onmousemove"],["onmouseout","onmouseout"],["onmouseover","onmouseover"],["onmouseup","onmouseup"],["onselect","onselect"]]
        });


        this.form = new Ext.FormPanel({
            bodyStyle:'padding:5px 5px 0',
            labelWidth: 150,
            defaultType: 'textfield',
            items: [ {
                    xtype:'fieldset',
                    title: t('base settings'),
                    collapsible: true,
                    autoHeight:true,
                    defaultType: 'textfield',
                    items:[{
                            xtype: "textfield",
                            fieldLabel: t("name"),
                            name: "name",
                            allowBlank:false,
                            anchor: "100%",
                            enableKeyEvents: true
                        },
                        {
                            xtype: "textfield",
                            name: "label",
                            fieldLabel: t("label"),
                            anchor: "100%"
                        },
                        {
                            xtype: "textfield",
                            name: "description",
                            fieldLabel: t("description"),
                            anchor: "100%"
                        },{
                            xtype: "textfield",
                            name: "legend",
                            fieldLabel: t("legend"),
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

    getTranslatForm: function($super){
        $super();



        var trans = new Ext.form.FieldSet({
            title: t("multiOptions translation"),
            collapsible: true,
            defaultType: 'textfield',
            items:[
                {
                    xtype: "textfield",
                    name: "originallegend",
                    fieldLabel: t("original legand"),
                    anchor: "100%",
                    value:this.datax.legend,
                    disabled:true
                },
                new Ext.ux.form.SuperField({
                    allowEdit: true,
                    name: "legend",
                    stripeRows:true,
                    values:this.datax.translate.legend,
                    fieldLabel: t("legend traduction"),
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
        });

        this.transForm.add(trans);

        return this.transForm;
}

});
