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

pimcore.registerNS("Formbuilder.comp.type.captcha");
Formbuilder.comp.type.captcha = Class.create(Formbuilder.comp.type.base,{

    type: "captcha",


    getTypeName: function () {
        return t("captcha");
    },

    getIconClass: function () {
        return "Formbuilder_icon_captcha";
    },

    onAfterPopulate: function(){

        var wordFS = Ext.getCmp('wordFS');
        var imageFS = Ext.getCmp('imageFS');
        var reCaptchaFS = Ext.getCmp('reCaptchaFS');
        var combo = Ext.getCmp('captchaCombo');

        switch(combo.getValue()){
            case "dumb" :
                wordFS.show();
                imageFS.hide();
                reCaptchaFS.hide();
                break;
            case "figlet" :
                wordFS.show();
                imageFS.hide();
                reCaptchaFS.hide();
                break;
            case "image" :
                wordFS.show();
                imageFS.show();
                reCaptchaFS.hide();
                break;
            case "reCaptcha" :
                wordFS.hide();
                imageFS.hide();
                reCaptchaFS.show();
                break;
            default:
                wordFS.hide();
                imageFS.hide();
                reCaptchaFS.hide();
                break;
        }
        
        var imgDir = Ext.getCmp("imgDir");
        if(imageFS.hidden == false){
            this.checkPath(imgDir.getValue(),imgDir);
        }
        
    },

    addCaptchaFS: function(form){
        


        var word = new Ext.form.FieldSet({
            id:"wordFS",
            title: t("captcha word options"),
            collapsible: true,
            defaultType: 'textfield',
            items:[
            {
                xtype: "numberfield",
                name: "captchaOptions.wordLen",
                fieldLabel: t("wordLen"),
                allowDecimals:false,
                anchor: "100%"
            },
            {
                xtype: "numberfield",
                name: "captchaOptions.timeout",
                fieldLabel: t("timeout"),
                allowDecimals:false,
                anchor: "100%"
            },
            {
                xtype: "checkbox",
                name: "captchaOptions.useNumbers",
                fieldLabel: t("useNumbers"),
                checked:false
            }
            ]
        });

        form.add(word);

        var image = new Ext.form.FieldSet({
            id:"imageFS",
            title: t("image options"),
            collapsible: true,
            defaultType: 'textfield',
            items:[
            {
                xtype: "numberfield",    
                name: "captchaOptions.expiration",
                fieldLabel: t("expiration"),
                allowDecimals:false,
                anchor: "100%"
            },
            {
                xtype: "textfield",
                name: "captchaOptions.font",
                fieldLabel: t("font"),
                anchor: "100%"
            },
            {
                xtype: "numberfield",    
                name: "captchaOptions.fontSize",
                fieldLabel: t("font Size"),
                allowDecimals:false,
                anchor: "100%"
            },
            {
                xtype: "numberfield",    
                name: "captchaOptions.height",
                fieldLabel: t("height"),
                allowDecimals:false,
                anchor: "100%"
            },
            {
                xtype: "numberfield",    
                name: "captchaOptions.width",
                fieldLabel: t("width"),
                allowDecimals:false,
                anchor: "100%"
            },
            {
                id:"imgDir",
                xtype: "textfield",
                name: "captchaOptions.imgDir",
                fieldLabel: t("image directory"),
                anchor: "100%",
                listeners:{
                    scope:this,
                    'change': function(field,newValue,oldValue,Object){
                        var ctr = Ext.getCmp("imageFS");
                        if(ctr.hidden == false){
                            this.checkPath(newValue,field);
                        }
                    }
                }
            },
            {
                xtype: "textfield",
                name: "captchaOptions.imgUrl",
                fieldLabel: t("Image Url"),
                anchor: "100%"
            },
            {
                xtype: "textfield",
                name: "captchaOptions.suffix",
                fieldLabel: t("image suffix"),
                anchor: "100%"
            },
            {
                xtype: "numberfield",    
                name: "captchaOptions.dotNoiseLevel",
                fieldLabel: t("dot noise level"),
                allowDecimals:false,
                anchor: "100%"
            },
            {
                xtype: "numberfield",    
                name: "captchaOptions.lineNoiseLevel",
                fieldLabel: t("Line noise level"),
                allowDecimals:false,
                anchor: "100%"
            }
            ]
        });
        form.add(image);

        var reCaptcha = new Ext.form.FieldSet({
            id:"reCaptchaFS",
            title: t("reCaptcha options"),
            collapsible: true,
            defaultType: 'textfield',
            items:[{
                xtype: "textfield",
                name: "captchaOptions.privKey",
                fieldLabel: t("Private key"),
                anchor: "100%"
            },
            {
                xtype: "textfield",
                name: "captchaOptions.pubKey",
                fieldLabel: t("Public key"),
                anchor: "100%"
            }
            ]
        });
        form.add(reCaptcha);

    },

    getForm: function($super){
        $super();

        var captchaStore = new Ext.data.ArrayStore({
            fields: ["value","label"],
            data : [["dumb","Dumb"],["figlet","Figlet"],["image","Image"],["reCaptcha","ReCaptcha"]]
        });


        var thisNode = new Ext.form.FieldSet({
            title: t("This node"),
            collapsible: true,
            defaultType: 'textfield',
            items:[{
                id:"captchaCombo",
                xtype: "combo",
                name: "captcha",
                fieldLabel: t("captcha type"),
                queryDelay: 0,
                displayField:"label",
                valueField: "value",
                mode: 'local',
                store: captchaStore,
                editable: false,
                triggerAction: 'all',
                anchor:"100%",
                value:"word",
                allowBlank:false,
                listeners:{
                    scope:this,
                    'select': function(combo,record,index){
                        var wordFS = Ext.getCmp('wordFS');
                        var imageFS = Ext.getCmp('imageFS');
                        var reCaptchaFS = Ext.getCmp('reCaptchaFS');

                        switch(record.data.value){
                            case "dumb" :
                                wordFS.show();
                                imageFS.hide();
                                reCaptchaFS.hide();
                                break;
                            case "figlet" :
                                wordFS.show();
                                imageFS.hide();
                                reCaptchaFS.hide();
                                break;
                            case "image" :
                                wordFS.show();
                                imageFS.show();
                                reCaptchaFS.hide();
                                break;
                            case "reCaptcha" :
                                wordFS.hide();
                                imageFS.hide();
                                reCaptchaFS.show();
                                break;
                            default:
                                wordFS.hide();
                                imageFS.hide();
                                reCaptchaFS.hide();
                                break;
                        }

                    }
                }
            }

            ]
        });



        this.form.add(thisNode);
        this.addCaptchaFS(this.form);
        
        return this.form;
    }

});