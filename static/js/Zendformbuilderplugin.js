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

pimcore.registerNS("pimcore.plugin.Formbuilder");

pimcore.plugin.Formbuilder = Class.create(pimcore.plugin.admin, {


    getClassName: function () {
        return "pimcore.plugin.Formbuilder";
    },

    initialize: function() {
        pimcore.plugin.broker.registerPlugin(this);

        //debugger;
    },


    uninstall: function() {
    
    },

    pimcoreReady: function (params,broker){

        var user = pimcore.globalmanager.get("user");
        
        if(user.admin == true){

            var toolbar = Ext.getCmp("pimcore_panel_toolbar");

            var action = new Ext.Action({
                id:"Formbuilder_setting_button",
                text: t('formBuilder settings'),
                iconCls:"Formbuilder_icon_fbuilder",
                handler: function(){
                    var gestion = new Formbuilder.settings;
                }
            });

            if(toolbar){//old version
                toolbar.items.items[1].menu.add(action);
            }else{//new version
                layoutToolbar.extrasMenu.add(action);
            }
        }
        this.getLanguages();
    },

    getLanguages: function(){
        Ext.Ajax.request({
            url: '/admin/settings/get-available-languages',
            scope:this,
            success: function (response) {
                var resp = Ext.util.JSON.decode(response.responseText);
                pimcore.globalmanager.add("Formbuilder.languages",resp);
            }
        });
    }



});

new pimcore.plugin.Formbuilder();
