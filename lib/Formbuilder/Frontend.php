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

class Formbuilder_Frontend {

    private $languages = null;

    private function getLanguages() {
        if ($this->languages == null) {
            $languages = Pimcore_Tool::getValidLanguages();
            $this->languages = $languages;
        }
        return $this->languages;
    }

    /**
     *
     * @param string $name
     * @param string $locale 
     * return Zend_Form
     */
    private function getStaticForm($id, $locale) {
        if (file_exists(PIMCORE_PLUGINS_PATH . "/Zendformbuilder/data/form/form_" . $id . ".ini")) {
            $config = new Zend_Config_Ini(PIMCORE_PLUGINS_PATH . "/Zendformbuilder/data/form/form_" . $id . ".ini", 'config');


            $trans = $this->translateForm($id, $locale);

            Zend_Form::setDefaultTranslator($trans);

            $form = new Zend_Form($config->form);
            $form->setDisableTranslator(true);
            if ($locale != null && $locale != "") {

                $form->setTranslator($trans);
            }


            return $form;
        } else {
            return false;
        }
    }

    private function getDynamicForm($id, $locale) {

        if (file_exists(PIMCORE_PLUGINS_PATH . "/Zendformbuilder/data/main_" . $id . ".json")) {
            $config = new Zend_Config_Json(PIMCORE_PLUGINS_PATH . "/Zendformbuilder/data/main_" . $id . ".json");

            $datas = $config->toArray();

            $builder = new Formbuilder_Builder();
            $builder->setDatas($datas);
            $builder->setLocale($locale);
            $array = $builder->buildDynamicForm();

            $trans = $this->translateForm($id, $locale);

            Zend_Form::setDefaultTranslator($trans);

            $form = new Zend_Form($array);
            $form->setDisableTranslator(true);
            if ($locale != null && $locale != "") {

                $form->setTranslator($trans);
            }




            return $form;
        } else {
            return false;
        }
    }

    public function getTwitterForm($name, $locale = null,$horizontal=true) {
        $this->getLanguages();

        $table = new Formbuilder_Formbuilder();
        $id = $table->getIdByName($name);


        if (is_numeric($id) == true) {

            if (file_exists(PIMCORE_PLUGINS_PATH . "/Zendformbuilder/data/form/form_" . $id . ".ini")) {
                $config = new Zend_Config_Ini(PIMCORE_PLUGINS_PATH . "/Zendformbuilder/data/form/form_" . $id . ".ini", 'config');


                $trans = $this->translateForm($id, $locale);

                Zend_Form::setDefaultTranslator($trans);

                if($horizontal==true){
                    $form = new Twitter_Bootstrap_Form_Horizontal($config->form);
                }else{
                    $form = new Twitter_Bootstrap_Form_Vertical($config->form);
                }
                
                $form->setDisableTranslator(true);
                if ($locale != null && $locale != "") {

                    $form->setTranslator($trans);
                }


                return $form;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    /**
     * If $dynamic equal true, the form form is completly rebuild. It is useful if you need to interact to the form with hooks.
     *  
     * @param string $name
     * @param string $locale
     * @param boolean $dynamic
     * @return Zend_Form
     */
    public function getForm($name, $locale=null, $dynamic=false) {
        $this->getLanguages();

        $table = new Formbuilder_Formbuilder();
        $id = $table->getIdByName($name);


        if (is_numeric($id) == true) {

            if ($dynamic == false) {
                $form = $this->getStaticForm($id, $locale);
            } else {
                $form = $this->getDynamicForm($id, $locale);
            }
            //correctly set recaptcha to https if request is over https
            if(Zend_Controller_Front::getInstance()->getRequest()->isSecure()){
                /**@var Zend_Form $form */
                $elements = $form->getElements();
                foreach($elements as $element){
                    if(get_class($element) == 'Zend_Form_Element_Captcha' ){
                        /**@var  Zend_Form_Element_Captcha $element */
                        $cap = $element->getCaptcha();
                        $cap->getService()->setParams(array('ssl'=>true));
                    }
                }
            }

            return $form;
        } else {
            return false;
        }
    }

    private function translateForm( $id, $locale) {/* @var $form Zend_Form */

        $trans = new Zend_Translate_Adapter_Csv(array("delimiter" => ",", "disableNotices" => true));




        $file = PIMCORE_PLUGINS_PATH . "/Zendformbuilder/data/lang/form_" . $id . "_" . $locale . ".csv";
        if (file_exists($file)) {
            $trans->addTranslation(
                    array(
                        'content' => $file,
                        'locale' => $locale
            ));
        }


        $file = PIMCORE_PLUGINS_PATH . "/Zendformbuilder/data/lang/errors/" . $locale . "/Zend_Validate.php";
        if (file_exists($file)) {
            $arrTrans = new Zend_Translate_Adapter_Array(array("disableNotices" => true));
            $arrTrans->addTranslation(array("content" => $file, "locale" => $locale));
            $trans->addTranslation($arrTrans);
        }



        return $trans;
    }

}

?>
