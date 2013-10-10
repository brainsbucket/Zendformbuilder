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

pimcore.registerNS("Formbuilder.settings");
Formbuilder.settings = Class.create({

    initialize: function () {

        this.getTabPanel();


    },

   
   
    getTabPanel: function () {

        if (!this.panel) {
            this.panel = new Ext.Panel({
                id: "Formbuilder_settings",
                title: t("Formbuilder_settings"),
                border: false,
                iconCls:"Formbuilder_icon_fbuilder",
                layout: "border",
                closable:true,
                items: [this.getMainTree(), this.getEditPanel()],
                bbar:["<span>Developed by : <a href='http://www.grafyweb.com' target='_blank'><img style='vertical-align:top;' src='/plugins/Zendformbuilder/static/img/grafyweb16.png' /></a></span>"]
            });

            var tabPanel = Ext.getCmp("pimcore_panel_tabs");
            tabPanel.add(this.panel);
            tabPanel.activate("Formbuilder_settings");


            this.panel.on("destroy", function () {
                pimcore.globalmanager.remove("Formbuilder");
                
            }.bind(this));

            pimcore.layout.refresh();
        }

        return this.panel;
    },

    getMainTree: function () {
        if (!this.tree) {
            this.tree = new Ext.tree.TreePanel({
                id: "Formbuilder_panel_settings_tree",
                region: "west",
                useArrows:true,
                autoScroll:true,
                animate:true,
                containerScroll: true,
                border: true,
                width: 200,
                split: true,
                root: {
                    nodeType: 'async',
                    id: '0'
                },
                loader: new Ext.tree.TreeLoader({
                    dataUrl: '/plugin/Zendformbuilder/settings/get-tree',
                    requestMethod: "GET",
                    baseAttrs: {
                        listeners: this.getTreeNodeListeners(),
                        reference: this,
                        allowDrop: false,
                        allowChildren: false,
                        isTarget: false,
                        iconCls: "Formbuilder_icon_root",
                        leaf: true
                    }
                }),
                rootVisible: false,
                tbar: {
                    items: [
                    {
                        text: t("add_form"),
                        iconCls: "Formbuilder_icon_root_add",
                        handler: this.addMain.bind(this)
                    }
                    ]
                }
            });

            this.tree.on("render", function () {
                this.getRootNode().expand();
            });
        }

        return this.tree;
    },

    getEditPanel: function () {
        if (!this.editPanel) {
            this.editPanel = new Ext.Panel({
                region: "center",
                layout: "fit"
            });
        }

        return this.editPanel;
    },

    getTreeNodeListeners: function () {
        var treeNodeListeners = {
            'click' : this.onTreeNodeClick,
            "contextmenu": this.onTreeNodeContextmenu
        };

        return treeNodeListeners;
    },

    onTreeNodeClick: function () {
        if (this.id > 0) {
            Ext.Ajax.request({
                url: "/plugin/Zendformbuilder/Settings/get",
                params: {
                    id: this.id
                },
                success: this.attributes.reference.addMainPanel.bind(this.attributes.reference)
            });
        }
    },

    addMainPanel: function (response) {

        var data = Ext.decode(response.responseText);

        if (this.elemPanel) {
            this.getEditPanel().removeAll();
            delete this.elemPanel;
        }

        this.elemPanel = new Formbuilder.comp.elem(data, this);
        pimcore.layout.refresh();
    },

    onTreeNodeContextmenu: function () {
        this.select();

        var menu = new Ext.menu.Menu();
        menu.add(new Ext.menu.Item({
            text: t('delete'),
            iconCls: "pimcore_icon_delete",
            handler: this.attributes.reference.deleteMain.bind(this)
        }));

        menu.show(this.ui.getAnchor());
    },

    addMain: function () {
        Ext.MessageBox.prompt(t('add_elem'), t('enter_the_name_of_the_new_elem'), this.addMainComplete.bind(this), null, null, "");
    },

    addMainComplete: function (button, value, object) {

        var regresult = value.match(/[a-zA-Z]+/);
        var forbiddennames = ["abstract","class","data","folder","list","permissions","resource","concrete","interface"];

        if (button == "ok" && value.length > 2 && regresult == value && !in_array(value, forbiddennames)) {
            Ext.Ajax.request({
                url: "/plugin/Zendformbuilder/Settings/add",
                params: {
                    name: value
                },
                success: function () {
                    this.tree.getRootNode().reload();

                    
                }.bind(this)
            });
        }
        else if (button == "cancel") {
            return;
        }
        else {
            Ext.Msg.alert(t('add_elem'), t('problem_creating_new_elem'));
        }
    },

    deleteMain: function () {
        Ext.Ajax.request({
            url: "/plugin/Zendformbuilder/Settings/delete",
            params: {
                id: this.id
            }
        });

        this.attributes.reference.getEditPanel().removeAll();
        this.remove();

    // refresh the object tree
    //pimcore.globalmanager.get("layout_object_tree").tree.getRootNode().reload();

    // update object type store
    //pimcore.globalmanager.get("object_types_store").reload();
    },

    activate: function () {
        Ext.getCmp("pimcore_panel_tabs").activate("Formbuilder_settings");
    }

});