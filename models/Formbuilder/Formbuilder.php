<?php
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
class Formbuilder_Formbuilder {

    private $table;

    public function init() {
        $pimDb = Pimcore_Resource_Mysql::get();
        $rev = Pimcore_Version::$revision;
        if($rev>1350){
            Zend_Db_Table::setDefaultAdapter($pimDb->getResource());
        }else{
            Zend_Db_Table::setDefaultAdapter($pimDb);
        }
        
        

        $this->table = new Formbuilder_DbTable_Formbuilder();
    }

    public function create($name) {
        $this->init();
        $name = addslashes($name);
        $id = $this->table->insert(array("name" => $name, "date" => time()));

        return $id;
    }

    public function delete($id) {
        $this->init();
        if (is_int($id)) {
            $ret = $this->table->delete("id=" . $id);
            if ($ret > 0) {
                return true;
            } else {
                return false;
            }
        }
        return false;
    }

    public function read() {
        $this->init();
        $rows = $this->table->fetchAll();

        return $rows;
    }

    public function rename($id, $name) {
        $this->init();
        if (is_int($id)) {
            $name = addslashes($name);
            $data = array("name" => $name);
            $this->table->update($data, "id=" . $id);
            return true;
        }
        return false;
    }

    public function getName($id) {
        $this->init();
        if (is_int($id)) {
            $row = $this->table->fetchRow("id=" . $id);
            return $row->name;
        }
        return false;
    }

    public function getIdByName($name) {
        $this->init();
        $name = addslashes($name);
        $row = $this->table->fetchRow("name = '" . $name . "'");
        return $row->id;
    }

}