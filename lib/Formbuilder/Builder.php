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

class Formbuilder_Builder {

    public $datas = null;
    public $config = null;
    public $id = null;
    private $translate = null;
    private $translateValidator = null;
    public $translations = null;
    public $languages = null;
    public $locale = null;

    public function setLocale($locale) {

        $this->locale = $locale;
    }

    public function setDatas($datas) {

        if (!is_array($datas)) {
            return false;
        }
        $this->datas = $datas;
        return $this;
    }

    public function getDatas() {

        return $this->datas;
    }

    public function getLanguages() {
        if ($this->languages == null) {
            $languages = Pimcore_Tool::getValidLanguages();
            $this->languages = $languages;
        }
        return $this->languages;
    }

    public function saveConfig() {

        if (!is_dir(PIMCORE_PLUGINS_PATH . "/Zendformbuilder/data/form/")) {
            mkdir(PIMCORE_PLUGINS_PATH . "/Zendformbuilder/data/form/");
        }

        if (file_exists(PIMCORE_PLUGINS_PATH . "/Zendformbuilder/data/form/form_" . $this->id . ".ini")) {
            unlink(PIMCORE_PLUGINS_PATH . "/Zendformbuilder/data/form/form_" . $this->id . ".ini");
        }


        $config = new Zend_Config($this->config, true);
        $writer = new Zend_Config_Writer_Ini(array(
                    "config" => $config,
                    "filename" => PIMCORE_PLUGINS_PATH . "/Zendformbuilder/data/form/form_" . $this->id . ".ini"
                ));
        $writer->write();
    }

    private function createForm() {
        $this->translate = array();
        $this->translateValidator = array();

        if (!is_array($this->datas)) {
            return false;
        }

        $this->config = array();


        $this->config["config"]["form"] = array();
        $this->config["config"]["form"]["action"] = $this->datas["action"];
        $this->config["config"]["form"]["method"] = $this->datas["method"];
        $this->config["config"]["form"]["enctype"] = $this->datas["enctype"];
        $multi = $this->buildMultiData($this->datas["attrib"]);

        if (count($multi) > 0) {
            $this->config["config"]["form"] = array_merge($this->config["config"]["form"], $multi);
        }


        $this->config["config"]["form"]["elements"] = array();
        $position = 0;
        foreach ($this->datas["mainDefinitions"]["childs"] as $data) {

            if ($data["fieldtype"] == "displayGroup") {

                if (!is_array($this->config["config"]["form"]["displayGroups"])) {
                    $this->config["config"]["form"]["displayGroups"] = array();
                }
                $ret = $this->buildFieldSet($data, $position);
                $this->config["config"]["form"]["displayGroups"] = array_merge($this->config["config"]["form"]["displayGroups"], $ret);
            } else {

                $ret = $this->buildField($data);
                $this->config["config"]["form"]["elements"] = array_merge($this->config["config"]["form"]["elements"], $ret);
            }
            $position++;
        }
    }

    private function correctArray($datas) {
        $ret = array();

        foreach ($datas as $k => $v) {

            if (preg_match("#\.#", $k)) {
                $temp = $preg_split("#\.#", $k);
                if (!array_key_exists($temp[0], $ret)) {
                    $ret[$temp[0]] = array();
                }
                $ret[$temp[0]][$temp[1]] = $v;
            } else {
                if (is_array($v)) {
                    $ret[$k] = $this->correctArray($v);
                } else {
                    $ret[$k] = $v;
                }
            }
        }
        return $ret;
    }

    public function buildDynamicForm() {
        $this->createForm();
        $this->config = $this->correctArray($this->config);
        return $this->config["config"]["form"];
    }

    public function buildForm($id) {
        $this->getLanguages();
        $this->id = $id;

        $this->createForm();

        $this->saveConfig();

        $this->buildTranslate();

        return true;
    }

    private function buildTranslate() {

        $this->translations = array();

        foreach ($this->languages as $lang) {
            $this->translations[$lang] = array();
        }



        foreach ($this->translate as $nkey => $elem) {

            foreach ($elem as $key => $value) {
                if (substr($key, 0, 8) == "original") {
                    $n = strlen($key);
                    $name = substr($key, 8, $n - 8);
                    $name = $name;

                    $this->addTranslate($value, $this->translate[$nkey][$name]);
                }
                if ($key == "multiOptions") {
                    $this->addTranslateMulti($value);
                }
            }
        }

        foreach ($this->translateValidator as $elem) {

            $this->translations[$elem["locale"]][$elem["key"]] = $elem["value"];
        }


        $this->saveTranslations();
    }

    private function saveTranslations() {

        if (!is_dir(PIMCORE_PLUGINS_PATH . "/Zendformbuilder/data/lang/")) {
            mkdir(PIMCORE_PLUGINS_PATH . "/Zendformbuilder/data/lang/");
        }

        foreach ($this->languages as $lang) {


            if (file_exists(PIMCORE_PLUGINS_PATH . "/Zendformbuilder/data/lang/form_" . $this->id . "_" . $lang . ".csv")) {
                unlink(PIMCORE_PLUGINS_PATH . "/Zendformbuilder/data/lang/form_" . $this->id . "_" . $lang . ".csv");
            }

            touch(PIMCORE_PLUGINS_PATH . "/Zendformbuilder/data/lang/form_" . $this->id . "_" . $lang . ".csv");


            $text = "";
            foreach ($this->translations[$lang] as $key => $value) {
                $text .= "\"" . $key . "\",\"" . $value . "\"\n";
            }
            file_put_contents(PIMCORE_PLUGINS_PATH . "/Zendformbuilder/data/lang/form_" . $this->id . "_" . $lang . ".csv", $text, FILE_TEXT);
        }
    }

    private function addTranslateMulti($array) {
        foreach ($array as $elem) {
            $this->translations[$elem["locale"]][$elem["multiOptions"]] = $elem["value"];
        }
    }

    private function addTranslate($original, $array) {
        foreach ($array as $elem) {

            $this->translations[$elem["locale"]][$original] = $elem["value"];
        }
    }

    private function buildFieldSet($datas, $order) {

        $config = array();
        $config[$datas["name"]] = array();


        $this->translate[$datas["name"]] = $datas["translate"];
        unset($datas["translate"]);

        $options = array();
        $elements = array();

        foreach ($datas as $key => $data) {
            $dataType = gettype($data);

            switch ($dataType) {
                case "array":
                    if ($key == "childs") {
                        foreach ($data as $elem) {


                            $ret = $this->buildField($elem);
                            $this->config["config"]["form"]["elements"] = array_merge($this->config["config"]["form"]["elements"], $ret);

                            $elements[$elem["name"]] = $elem["name"];
                        }
                    } else {
                        $multi = $this->buildMultiData($data);
                        if (count($multi) > 0) {
                            if ($key == "attrib") {
                                $options = array_merge($options, $multi);
                            } else {
                                $options[$key] = $multi;
                            }
                        }
                    }
                    break;
                default :
                    if ($key != "name" && $key != "fieldtype") {
                        if ($data != "") {
                            $options[$key] = $data;
                        } elseif ($dataType == "boolean") {
                            $options[$key] = (bool) $data;
                        }
                    }
                    break;
            }
        }
        $options["order"] = $order;

        if (count($options) > 0) {
            $config[$datas["name"]]["options"] = $options;
        }
        if (count($elements) > 0) {
            $config[$datas["name"]]["elements"] = $elements;
        }

        return $config;
    }

    private function buildField($datas) {
        $config = array();
        $config[$datas["name"]] = array();
        $config[$datas["name"]]["type"] = $datas["fieldtype"];

        $this->translate[$datas["name"]] = $datas["translate"];
        unset($datas["translate"]);

        $cClass = $datas["custom_class"];
        $cAction = $datas["custom_action"];
        unset($datas["custom_class"]);
        unset($datas["custom_action"]);

        $options = array();


        foreach ($datas as $key => $data) {
            $dataType = gettype($data);

            switch ($dataType) {
                case "array":
                    if ($key == "childs") {
                        $FilVal = $this->buildFilterValidator($data);
                        $options = array_merge($options, $FilVal);
                    } else {
                        $multi = $this->buildMultiData($data);
                        if (count($multi) > 0) {
                            if ($key == "attrib") {
                                $options = array_merge($options, $multi);
                            } else {
                                $options[$key] = $multi;
                            }
                        }
                    }
                    break;
                default :
                    if ($key != "name" && $key != "fieldtype") {
                        if ($data != "") {
                            $multipl = preg_split("#,#", $data);
                            if (count($multipl) > 1) {
                                $options[$key] = array();
                                foreach ($multipl as $val) {
                                    array_push($options[$key], $val);
                                }
                            } else {
                                $options[$key] = $data;
                            }
                        } elseif ($dataType == "boolean") {
                            $options[$key] = (bool) $data;
                        }
                    }
                    break;
            }
        }

        if (count($options) > 0) {
            $config[$datas["name"]]["options"] = $options;
        }
        
        $config[$datas["name"]]["options"]["disableTranslator"] = false;

        $config = $this->fireHook($cClass, $cAction, $config);
        

        return $config;
    }

    private function fireHook($class, $method, $config) {

        if ($class != null && $class != "" && $method != null && $method != "") {

            // $type = mb_strtolower($type);
            if (class_exists($class)) {
                if (method_exists($class, $method)) {
                    $refl = new ReflectionMethod($class, $method);

                    if ($refl->isStatic() && $refl->isPublic()) {

                        $ret = $class::$method($config, $this->locale);
                        if (is_array($ret)) {
                            $config = $ret;
                        }
                    } elseif (!$refl->isStatic() && $refl->isPublic()) {
                        $obj = new $class();
                        $ret = $obj->$method($config, $this->locale);
                        if (is_array($ret)) {
                            $config = $ret;
                        }
                    }
                }
            }
        }
        return $config;
    }

    private function buildMultiData($datas) {

        $arr = array();

        foreach ($datas as $data) {
            if (is_string($data)) {
                array_push($arr, $data);
            } else {
                $arr[$data["key"]] = $data["value"];
            }
        }

        return $arr;
    }

    private function buildFilterValidator($datas) {
        $iFilter = array();
        $iValidator = array();

        $FilVal = array();
        $filters = array();
        $validators = array();


        foreach ($datas as $data) {

            if ($data["isFilter"] == true) {
                if (array_key_exists($data["fieldtype"], $iFilter)) {
                    $iFilter[$data["fieldtype"]]++;
                } else {
                    $iFilter[$data["fieldtype"]] = 0;
                }
                $filter = $this->buildFilter($data, $iFilter[$data["fieldtype"]]);
                $filters = array_merge($filters, $filter);
            }

            if ($data["isValidator"] == true) {
                if (array_key_exists($data["fieldtype"], $iValidator)) {
                    $iValidator[$data["fieldtype"]]++;
                } else {
                    $iValidator[$data["fieldtype"]] = 0;
                }
                $validator = $this->buildValidator($data, $iValidator[$data["fieldtype"]]);
                $validators = array_merge($validators, $validator);
            }
        }
        if (count($filters) > 0) {
            $FilVal["filters"] = $filters;
        }
        if (count($validators) > 0) {
            $FilVal["validators"] = $validators;
        }


        return $FilVal;
    }

    private function buildFilter($datas, $index) {

        $filter = array();
        $filter[$datas["fieldtype"] . $index] = array();
        $filter[$datas["fieldtype"] . $index]["filter"] = $datas["fieldtype"];
        $cClass = $datas["custom_class"];
        $cAction = $datas["custom_action"];
        unset($datas["custom_class"]);
        unset($datas["custom_action"]);

        $options = array();

        foreach ($datas as $key => $data) {
            $dataType = gettype($data);

            switch ($dataType) {
                case "array":

                    $multi = $this->buildMultiData($data);
                    if (count($multi) > 0) {
                        $options[$key] = $multi;
                    }

                    break;
                default :
                    if ($key != "name" && $key != "fieldtype" && $key != "isFilter") {
                        if ($data != "") {
                            $options[$key] = $data;
                        } elseif ($dataType == "boolean") {
                            $options[$key] = (bool) $data;
                        }
                    }
                    break;
            }
        }
        if (count($options) > 0) {
            $filter[$datas["fieldtype"] . $index]["options"] = $options;
        }

        $filter = $this->fireHook($cClass, $cAction, $filter);

        return $filter;
    }

    private function addValidatorTranslate($datas, $index) {
        if (is_array($data["messages"])) {
            foreach ($datas["messages"] as $key) {

                if ($datas["messages." . $key] != "") {

                    foreach ($datas["translate"][$key] as $trans) {
                        array_push($this->translateValidator, array(
                            "locale" => $trans["locale"],
                            "value" => $trans["value"],
                            "key" => $datas["messages." . $key]
                        ));
                    }
                }
            }
        }
    }

    private function buildValidator($datas, $index) {
        $validator = array();
        $validator[$datas["fieldtype"] . $index] = array();
        $validator[$datas["fieldtype"] . $index]["validator"] = $datas["fieldtype"];

        $this->addValidatorTranslate($datas, $index);
        unset($datas["messages"]);
        unset($datas["translate"]);

        $cClass = $datas["custom_class"];
        $cAction = $datas["custom_action"];
        unset($datas["custom_class"]);
        unset($datas["custom_action"]);

        $options = array();

        foreach ($datas as $key => $data) {
            $dataType = gettype($data);

            switch ($dataType) {
                case "array":

                    $multi = $this->buildMultiData($data);
                    if (count($multi) > 0) {
                        $options[$key] = $multi;
                    }

                    break;
                default :
                    if ($key != "name" && $key != "fieldtype" && $key != "isValidator") {
                        if ($data != "") {
                            $options[$key] = $data;
                        } elseif ($dataType == "boolean") {
                            $options[$key] = (bool) $data;
                        }
                    }
                    break;
            }
        }
        if (count($options) > 0) {
            $validator[$datas["fieldtype"] . $index]["options"] = $options;
        }

        $validator = $this->fireHook($cClass, $cAction, $validator);

        return $validator;
    }

}

?>
