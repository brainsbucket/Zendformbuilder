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

pimcore.registerNS("Formbuilder.comp.importer");

Formbuilder.comp.importer = Class.create({

   initialize: function (parentPanel) {
       this.parentPanel = parentPanel;
       this.importId = uniqid();

    },
    


    showPanel: function(){
        if(typeof success != "function") {
            var success = function () {  };
        }

        if(typeof failure != "function") {
            var failure = function () {};
        }

        var url =   '/plugin/Zendformbuilder/Settings/import?id=' + this.importId + '&pimcore_admin_sid=' + pimcore.settings.sessionId;

        var uploadWindowCompatible = new Ext.Window({
            autoHeight: true,
            title: t('Select Import'),
            closeAction: 'close',
            width:400,
            modal: true
        });
        var fbClass = this;
        var uploadForm = new Ext.form.FormPanel({
            layout: "pimcoreform",
            fileUpload: true,
            width: 400,
            bodyStyle: 'padding: 10px;',
            items: [{
                xtype: 'fileuploadfield',
                emptyText: t("select_a_file"),
                fieldLabel: t("Import File"),
                width: 230,
                name: 'Filedata',
                buttonText: "",
                buttonCfg: {
                    iconCls: 'pimcore_icon_upload_single'

                },
                listeners: {
                    fileselected: function () {
                        uploadForm.getForm().submit({
                            url: url,
                            waitMsg: t("please_wait"),
                            success: function (el, res) {

                                fbClass.getImport();
                                uploadWindowCompatible.close();
                            },
                            failure: function (el, res) {

                                failure(res);
                                uploadWindowCompatible.close();
                            }
                        });
                    }
                }
            }]
        });

        uploadWindowCompatible.add(uploadForm);
        uploadWindowCompatible.show();
        uploadWindowCompatible.setWidth(401);
        uploadWindowCompatible.doLayout();



    },
    getImport: function () {

        Ext.Ajax.request({
            url: "/plugin/Zendformbuilder/Settings/getimport",
            params: {
                id: this.importId,
                method: "post"
            },
            success: this.getImportComplete.bind(this)
        });
    },

    getImportComplete: function (response) {



         var data = Ext.decode(response.responseText);

        this.parentPanel.importation(data);
        pimcore.layout.refresh();


    }

    });