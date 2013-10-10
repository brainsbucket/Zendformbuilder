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

        var uploadPanel = new Ext.ux.SwfUploadPanel({
            border: false,
            upload_url: '/plugin/Zendformbuilder/Settings/import/?pimcore_admin_sid=' + pimcore.settings.sessionId,
            debug: false,
            flash_url: "/pimcore/static/js/lib/ext-plugins/SwfUploadPanel/swfupload.swf",
            single_select: false,
            post_params: { id: this.importId },
            file_queue_limit: 1,
            single_file_select: true,
            file_types: "*.json",
            confirm_delete: false,
            remove_completed: true,
            listeners: {
                "fileUploadComplete": function (upload, file) {
                    this.getImport();
                }.bind(this)
            }
        });

        this.uploadWin = new Ext.Window({
            modal: true,
            width: 400,
            height: 140,
            layout: "fit",
            title: t("import"),
            items: [uploadPanel]
        });

        this.uploadWin.show();

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

        this.uploadWin.close();

         var data = Ext.decode(response.responseText);

        this.parentPanel.importation(data);
        pimcore.layout.refresh();


    }

    });