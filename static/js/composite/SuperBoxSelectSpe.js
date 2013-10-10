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

Ext.namespace('Ext.ux.form');

Ext.ux.form.SuperBoxSelectSpe = Ext.extend(Ext.ux.form.SuperBoxSelect, {

//    initComponent: function($super) {
//        $super();
//    },

    getValue : function() {
        var ret = [];
        this.items.each(function(item){
            ret.push(item.value);
        });
        return ret;
    },
    /**
     * Sets the value of the SuperBoxSelect component.
     * @methodOf Ext.ux.form.SuperBoxSelect
     * @name setValue
     * @param {String|Array} value An array of item values, or a String value containing a delimited list of item values. (The list should be delimited with the {@link #Ext.ux.form.SuperBoxSelect-valueDelimiter)
     */
    setValue : function(value){
        if(!this.rendered){
            this.value = value.join(this.valueDelimiter);
            return;
        }
        this.removeAllItems().resetStore();
        this.remoteLookup = [];
        this.addValue(value);

    }
    


});
Ext.reg('superboxselectspe', Ext.ux.form.SuperBoxSelectSpe);