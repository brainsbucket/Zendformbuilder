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
class Formbuilder_Plugin extends Pimcore_API_Plugin_Abstract implements Pimcore_API_Plugin_Interface {


    public static function install() {
        
        Pimcore_API_Plugin_Abstract::getDb()->query("CREATE TABLE IF NOT EXISTS `plugin_formbuilder` (
		`id` INT NOT NULL AUTO_INCREMENT,
                `name` varchar(255) DEFAULT NULL ,
		`date` INT NULL ,
			  PRIMARY KEY  (`id`),                          
                        UNIQUE KEY `name` (`name`)
			) ENGINE=MyISAM DEFAULT CHARSET=utf8;");

        if (self::isInstalled()) {
            $statusMessage = "<img src='http://www.grafyweb.com/formbuilder/install' /></br>Fourmbuilder Plugin successfully installed. <br/>Please reload pimcore";
        } else {
            $statusMessage = "Fourmbuilder Plugin could not be installed";
        }
        return $statusMessage;
    }

    public static function needsReloadAfterInstall() {
        return false;
    }


    public static function uninstall() {
        
        Pimcore_API_Plugin_Abstract::getDb()->query("DROP TABLE `plugin_formbuilder`");

        $rep = PIMCORE_PLUGINS_PATH . "/Zendformbuilder/data/";
        if (is_dir($rep)) {
            $dir = opendir($rep);
            while ($f = readdir($dir)) {
                if(substr($f,0,4)=="main"){
                if (file_exists($rep . $f)) {
                    unlink($rep . $f);
                }
                }
            }
        }

        $rep = PIMCORE_PLUGINS_PATH . "/Zendformbuilder/data/form/";
        if (is_dir($rep)) {
            $dir = opendir($rep);
            while ($f = readdir($dir)) {
                if(substr($f,0,4)=="form"){
                if (file_exists($rep . $f)) {
                    unlink($rep . $f);
                }
                }
            }
        }

        $rep = PIMCORE_PLUGINS_PATH . "/Zendformbuilder/data/lang/";
        if (is_dir($rep)) {
            $dir = opendir($rep);
            while ($f = readdir($dir)) {
                if(substr($f,0,4)=="form"){
                if (file_exists($rep . $f)) {
                    unlink($rep . $f);
                }
                }
            }
        }

        if (!self::isInstalled()) {
            $statusMessage = "<img src='http://www.grafyweb.com/formbuilder/uninstall' />Fourmbuilder Plugin successfully uninstalled.";
        } else {
            $statusMessage = "Fourmbuilder Plugin could not be uninstalled";
        }
        return $statusMessage;
    }

    public static function isInstalled() {
        $result = null;
        try {
            
            $result = Pimcore_API_Plugin_Abstract::getDb()->query("SELECT * FROM `plugin_formbuilder`") or die ("La table n'existe pas");
        } catch (Zend_Db_Statement_Exception $e) {

        }
        return!empty($result);
    }

    public function preDispatch() {

    }




    /**
     *
     * @param string $language
     * @return string path to the translation file relative to plugin direcory
     */
    public static function getTranslationFile($language) {
        if(file_exists(PIMCORE_PLUGINS_PATH . "/Zendformbuilder/texts/" . $language . ".csv")){
            return "/Zendformbuilder/texts/" . $language . ".csv";
        }
        return "/Zendformbuilder/texts/en.csv";
        
    }

}