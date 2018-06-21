/*********************************************** {COPYRIGHT-TOP} ***
* IBM Confidential
* OCO Source Materials
* 5724-V51
*
* (c) Copyright IBM Corp. 2000, 2008 All Rights Reserved.
*
* The source code for this program is not published or otherwise
* divested of its trade secrets, irrespective of what has been
* deposited with the U.S. Copyright Office.
************************************************ {COPYRIGHT-END} **/


// author: didier
// revised by: potentially ... everyone.
var active_text = "";
var errorMsg = "";
var austinErrorMsg = "";
var austinErrorId = "";
var austinErrorPage = "";
var formErrorMsg = "";
var resultMsg = "";
var current_message = "[nothing]";
var MsgInd = 1;

var bCheckTextDefault = true;

var sExtraChars = " []{}(),.:;!?+*-=_";
var sValidCharsAll = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789" + sExtraChars;
var sValidCharsAllForDisplay = "a-z0-9" + sExtraChars;
var sInvalidCharsAll = "'\"<>/"
var sInvalidCharsAllForDisplay = "\"<>'/"

var showResultStringA = "<html><head><script src='/js/tools.js'></script>";
var showResultStringB = "</head><body marginwidth=0 marginheight=0 topmargin=0 leftmargin=0 rightmargin=0 bottommargin=0 scroll=no></body></html>";

var revInh = "<img border=0 src='/images/newlook/inheritance_details.gif' alt='Display the entries inheriting this data' align='absmiddle'>";
var pathsInh = "<img border=0 src='/images/newlook/item_detail_inheritance_details_popup.gif' alt='Display the inheritance paths' align='absmiddle'>";
var srcInh = "<img border=0 src='/images/newlook/item_detail_inheritance_category.gif' alt='Go to the entry that this data is inherited from' align='absmiddle'>";
var splChk = "<img border=0 src='/images/newlook/spell_check.gif' align='absmiddle'>";

// javascript for FIND-IN-PAGE

var NS4 = (document.layers);
var IE4 = (document.all);

var this_win = this;
var occurrence_counter = 0;

//browser check

var IE = (document.all);

var agt=navigator.userAgent.toLowerCase();
var appVer = navigator.appVersion.toLowerCase();
var is_minor = parseFloat(appVer);
var is_major = parseInt(is_minor);

var ieWeb  = appVer.indexOf('msie');
if (ieWeb !=-1) {
    is_minor = parseFloat(appVer.substring(ieWeb+5,appVer.indexOf(';',ieWeb)))
        is_major = parseInt(is_minor);
}

var bLoginAllowed = true;
if (is_major < 6)
{
    bLoginAllowed = false;
}

var browserName = ""
if (agt.indexOf("msie") != -1)
{
    browserName = "running on Internet Explorer " + is_minor + "";
}
else
{
    browserName = "<b>not</b> running on Internet Explorer";
}


//i18n_begin to format message in javascript

function formatMessage(msg,args)
{
  if (!msg)
    msg = "";
    
  if (!args)
    return msg;
    
  var tmp=msg;
  for(i=0; i<args.length; i++)
  {
    tmp=tmp.replace('{'+i+'}',args[i]);
  }
  return tmp; 
}
//i18n_end
//fixMock P16195/P16199/P16230/P16232/P16234/P16235/P16236/P16237/P16238/P16240_begin by qzhang 2004-12-20
function formatMessageForEnter(msg,args)
{
  return formatMessage(msg,args)+"\n";  
}
//fixMock_end
//--------------------------------------------------------------
// functions used for errors
//--------------------------------------------------------------

function doInitialStuff() {

    if (austinErrorMsg != "") {
        showAustinError(austinErrorPage, austinErrorMsg, austinErrorId);
    } else if (errorMsg != "") {
        showError(errorMsg);
    }
    if (formErrorMsg != "")
        showFormError(formErrorMsg);
    if (resultMsg != "")
        showResult(resultMsg);

    if (document.getElementById("resultContentDiv"))
    {
        hideSelect("resultContentDiv");
    }
}


function showAustinError(austinErrorPage, austinErrorMsg, austinErrorId) {
    var url = austinErrorPage + "?austin_error_msg='" + austinErrorMsg + "'&austin_error_id=" + austinErrorId;
    if (window.screen) {
        leftpos = (screen.width/2)-198;
        toppos = (screen.height/2)-150;
    }
    var w = '800';
    var h = '600';
    openTrigoPopupWin(url, 'errordisplay', h, w, toppos, leftpos);
}

function showError(txt) {
    var text = ""
        + TOOLS.TRIGO_ERROR_JS+"\n"
        + "______________________________________________________________________\n\n"
        + txt;
    
    alert(text);
}

function showFormError(txt) {
      var text = ""
        + TOOLS.TRIGO_ERROR_JS+"\n"
        + "______________________________________________________________________\n\n"
        + TOOLS.FORM_NOT_CORRECTLY_SUBMITTED_JS+"\n"
        + TOOLS.CORRECT_ERRORS_AND_RESUBMIT_JS+"\n"
        + "______________________________________________________________________\n\n"
        + txt;

    alert(text)
        }

function showResult(txt) {
    var text = ""
        + "IBM InfoSphere Master Data Management Server for Product Information Management\n"
        + "______________________________________________________________________\n\n"
        + txt;
    DisplayModalMessage2(text);
}

//--------------------------------------------------------------
// functions used to check valid strings
//--------------------------------------------------------------

// validator for invalid strings
function string_validator_text_input_ctrl(formElement, errStr, sInvalidChars)
{
    if(isBlank(formElement,true)){
        return "";
    }
    var res = checkInvalidString(formElement, "", sInvalidChars, sInvalidChars); // XXX why no bTrim, bCheckText args? cf. P11800 fix in SelectTextFieldBean.java
    if (res != "")
        return errStr;
    else
        return "";
}

// check for invalid strings
function checkInvalidString(el, elName, sInvalidChars, sInvalidCharsDisplay, bTrim, bCheckText) {
    if (sInvalidChars == null) {
        sInvalidChars = sInvalidCharsAll;
        sInvalidCharsDisplay = sInvalidCharsAllForDisplay;
    }
    var s = '';
    if (bCheckText == null)
    {
        bCheckText = bCheckTextDefault;
    }
    if (bTrim == null)
    {
        bTrim = true;
    }
    if (bCheckText)
    {
        s = checkText(el, elName, bTrim);
    }
    if (s != "")
        return s;
    if (isRegularStringEx(el.value, sInvalidChars, bCheckText))
        return "";
    
    var arr=new Array();
    arr[0]=elName;
    arr[1]=sInvalidCharsDisplay;
    return formatMessage(TOOLS.INVALID_CHARACTERS_JS,arr);

}

//check for valid string (excluding)
function isRegularStringEx(sText, sInvalidChars, bCheckText)
{
    if (bCheckText == null)
    {
        bCheckText = bCheckTextDefault;
    }
    if (bCheckText)
    {
        if (sText == null || sText == "")
            return false;
    }

    for (var j=0; j<sInvalidChars.length; j++)
    {
        if (sText.indexOf(sInvalidChars.charAt(j)) != -1)
            return false;
    }

    return true;
}


function checkRegularString(el, elName, sValidChars, sValidCharsForDisplay) {
    if (sValidChars == null) {
        sValidChars = sValidCharsAll;
        sValidCharsForDisplay = sValidCharsAllForDisplay;
    }
    var s = checkText(el, elName);
    if (s != "")
        return s;
    if (isRegularStringIn(el.value, sValidChars))
        return "";
        
    var arr=new Array();
    arr[0]=elName;
    arr[1]=sValidCharsForDisplay;
    return formatMessage(TOOLS.INVALID_CHARS_MESSAGE_JS,arr);
}



//check for valid string (including)
function isRegularStringIn(sText, sValidChars) {
    if (sText == null || sText == "")
        return false;

    for (var i=0; i<sText.length; i++) {
        var c = sText.charAt(i);
        var bValidChar = false;
        for (var j=0; j<sValidChars.length; j++) {
            if (c == sValidChars.charAt(j)) {
                bValidChar = true;
                break;
            }
        }
        if (!bValidChar)
            return false;
    }
    return true;
}


//--------------------------------------------------------------
// functions used to check forms
//--------------------------------------------------------------

function getForm(formname)
{
    var allforms = document.forms;
    if (allforms != null)
    {
        for (i=0; i < allforms.length; i++)
        {
            if (allforms[i].name == formname)
            {
                return allforms[i];
            }
        }
    }
    return null;
}

function getFormField(formname, fieldname)
{
    var frm = getForm(formname);
    if (frm != null)
    {
        var allements = frm.elements;
        if (allements != null)
        {
            for (x=0;x < allements.length;x++)
            {
                if (allements[x].name == fieldname)
                {
                    return allements[x];
                }
            }
        }
    }
    return null;
}

// returns true if the string is blank.
// if bTrim is true - we make sure that the string is not all spaces
function isBlank(el, bTrim) {
    var v = el.value;
    if (v == null || v == "")
        return true;

    if ( bTrim && trimSpaces(v) == "" )
        return true;

    return false;
}

function checkBoundaries(v, min, max) {
    if ((min != null) && (v < min))
        return false;
    if ((max != null) && (v > max))
        return false;
    return true;
}

function getIntOrFloatErrorTxt(elName, min, max, type) {
    var error = "- '" + elName + "' must be " + type
        if (min != null && max != null)
            error += " greater than " + min + " and less than " + max;
        else if (min != null)
            error += " greater than " + min;
        else if (max != null)
            error += " less than " + max;
    return error + ".\n";
}


// checks whether a date field is valid
// also set the hidden date value
function checkDate(f, dateName, defaultDate, realName) {
    return checkNonEmptyDate(f, dateName, defaultDate, realName, true);
}

function checkNonEmptyDate(f, dateName, defaultDate, realName, allowEmpty) {
    if (allowEmpty) {
        return "";
    }
    else if (f.elements[dateName].value == "")
        return "- '" + realName + "' must be set.\n";
    return "";
}


function checkFloatMaybeEmpty(el, elName, min, maxx) {
    if(isBlank(el)) {
        return "";
    }
    return checkFloat(el, elName, min, maxx);
}

function checkIntegerMaybeEmpty(el, elName, min, maxx) {
    if(isBlank(el)) {
        return "";
    }
    return checkInt(el, elName, min, maxx);
}



function textNotEmptyValidator(inputCtrl, fieldName) {
    if (isBlank(inputCtrl.value)) {
        return "- '" + fieldName + "' is empty.\n";
    } else {
        return '';
    }
}


function currencyInputValidator(inputCtrl, fieldName) {
    return  checkFloatMaybeEmpty(inputCtrl.value, fieldName);

}

function selectNoNoneValidator(inputCtrl, noneString, fieldName) {
    var err = checkRequiredEnum(inputCtrl.value, noneString, fieldName);
    return err;
}




function range_key_validator_number(start, end, msg) {
        var res = "";
        res += required_validator_text_input_ctrl(start, msg);
        res += required_validator_text_input_ctrl(end, msg);
        res += type_validator_number(start, msg);
        res += type_validator_number(end, msg);

        if(res != "") {
           return msg;
        }

        var startValue = parseFloat(start.value);
        var endValue = parseFloat(end.value);

        if(startValue > endValue) {
           return msg;
        } else {
           return "";
        }
}

function range_key_validator_string(start, end, msg) {
        var res = "";
        res += required_validator_text_input_ctrl(start, msg);
        res += required_validator_text_input_ctrl(end, msg);
        if(res != "") {
           return msg;
        }

        var startValue = start.value;
        var endValue = end.value;

        if(startValue > endValue) {
           return msg;
        }
        return "";
}


function required_checkbox_validator(boxes, errMsg) {
   var atLeastOneChecked = false;

   if(boxes == null) {
        return "";
   }

   if (boxes.checked) atLeastOneChecked = true;

   for(i = 0; i < boxes.length; i++) {
        var box = boxes[i];
        atLeastOneChecked = atLeastOneChecked || box.checked;
   }

   if(!atLeastOneChecked) {
      return errMsg;
   } else {
      return "";
   }
}


function onBlurValidator(fct, inputCtrl) {
    var error = fct();
    if(error != '') {
        inputCtrl.focus();
        showFormError(error);
    }
}


// checks whether a text field contains a float.
// if min and/or max are set, checks that the float is valid
// el could be either a text or textarea element.
function checkFloat(el, elName, min, max) {

    if (!isBlank(el)) {
        var v = el.value;
        if(trimSpaces(v) == "") {
            return getIntOrFloatErrorTxt(elName, min, max, "a number");
        }

        
    // i18n_begin by Allis Sep 23, 2004
    // need to disable float check function to allow group2 and group3 language to input valid number
        //for(i = 0; i < el.value.length; i++) {
            //var c = el.value.charAt(i);

          // i18n_comment_out by Allis
          //  if(c != '0' && c != '1' && c != '2' && c != '3' && c != '4'
            //   && c != '5' && c != '6' && c != '7'  && c != '8' && c != '9' && c != '.' && c != ',' && c != '-' && c != '+' && c != ' ' && c != 'e' && c != 'E') {
            // i18n_end   
            // i18n_begin by Allis Aug 25, 2004
            // add '(' and ')' to support globalization number...
            //if(c != '0' && c != '1' && c != '2' && c != '3' && c != '4'
              // && c != '5' && c != '6' && c != '7'  && c != '8' && c != '9' && c != '.' && c != ',' && c != '-' && c != '+' && c != ' ' && c != 'e' && c != 'E' && c != '(' && c != ')') {
                //return getIntOrFloatErrorTxt(elName, min, max, "a number");
            //}
        //}
        // i18n_comment_out by Allis
        //var f = parseFloat(v);

        //if (!isNaN(f) && checkBoundaries(f, min, max))
        // disable parseFloat and boundary check for different locale value
        // i18n_end        
            return "";
    }
    return getIntOrFloatErrorTxt(elName, min, max, "a number");
}




// checks whether a text field contains an integer.
// if min and/or max are set, checks that the integer is valid
// el could be either a text or textarea element.
function checkInt(el, elName, min, max) {
    if (!isBlank(el)) {
        var v = el.value;
        if (v.indexOf(".") == -1) {
            //var i = parseInt(v);
            // parseInt is rude (read a reference for more info), so doing a length check as well
            //if (!isNaN(i) && checkBoundaries(i, min, max) && (v.length == (""+i).length))
                return "";
        }
    }
    return getIntOrFloatErrorTxt(elName, min, max, "an integer");
}

// checks whether a text field is empty.
// el could be either a text or textarea element
function checkText(el, elName, bTrim) {
    if (!isBlank(el, bTrim))
        return "";

    var args=new Array();
    args[0]=elName;
    return formatMessageForEnter(TOOLS.FOLLOWING_IS_EMPTY_JS,args);
}

function checkRequiredEnum(value, nonevalue, name) {
    if( value != nonevalue) {
        return "";
    }  else {
        return "- '" + name + "' must be set.\n";
    }
}




// like previous fct but checks the length as well
function checkTextAndLength(el, elName, maxLength) {
    if (!isBlank(el)) {
        return "";
    }
    else if(el.value.length > maxLength) {
        return "- '" + elName + "' is too long. It can be at most " + maxLength +" characters.\n";
    }
    return "- '" + elName + "' is empty.\n";
}

// only length is checked: string can be empty
function checkLength(el, elName, maxLength) {

    if(el.value.length > maxLength) {
        return "- '" + elName + "' is too long. It can be at most " + maxLength +" characters.\n";
    }
    return "";
}


function escapeForJS(txt, useDosCRLF)
{
    txt = replaceAll(txt, "\\", "\\\\");

    if (useDosCRLF)
    {
        txt = replaceAll(txt, "\r", "");
        txt = replaceAll(txt, "\n", "\\r\\n");
    }
    else
    {
        txt = replaceAll(txt, "\r", "");
    }

    txt = replaceAll(txt, "\n", "\\n");
    txt = replaceAll(txt, "'", "\\'");
    txt = replaceAll(txt, "\"", "\\\"");
    return txt;
}


// equivalent of $PA/jspTools/UtilBean.escapeForHtml
// Replace browser reserved characters with corresponding character entities.
// Replace runs of space following a space with corresponding runs of
// "&nbsp;" so that runs of spaces are correctly rendered by browers.
function escapeForHtml(sText)
{
    if (sText == null)
        return "";

    var sBuf = [];

    var imax = sText.length;
    for (var i=0; i<imax; i++) {
        var c = sText.charAt(i);
        if (c == '&')
            sBuf.push("&amp;");
        else if (c == '<')
            sBuf.push("&lt;");
        else if (c == '>')
            sBuf.push("&gt;");
        else if (c == '"')
            sBuf.push("&quot;");
        else if (c == "'")
            sBuf.push("&#39;");
        else {
            sBuf.push(c);
            if (c == ' ') {
                for (var j = i + 1; j < imax && sText.charAt(j) == c; j++) {
                    sBuf.push("&nbsp;");
                    i = j;
                }
            }
        }
    }
    return sBuf.join("");
}

// Same as escapeForHtml but doesn't preserve runs of spaces
// For use other than in strings for display by the browser
function escapeForHtmlNoPreserve(sText)
{
    if (sText == null)
        return "";

    var sBuf = [];

    var imax = sText.length;
    for (var i=0; i<imax; i++) {
        var c = sText.charAt(i);
        if (c == '&')
            sBuf.push("&amp;");
        else if (c == '<')
            sBuf.push("&lt;");
        else if (c == '>')
            sBuf.push("&gt;");
        else if (c == '"')
            sBuf.push("&quot;");
        else if (c == "'")
            sBuf.push("&#39;");
        else
            sBuf.push(c);
    }
    return sBuf.join("");
}


function escapeForXml(sText)
{
	if (sText == null)
		return "";
		
	var sBuf = [];
	
	var imax = sText.length;
	for (var i=0; i<imax; i++) {
		var c = sText.charAt(i);
		if (c == '&')
			sBuf.push("&amp;");
		else if (c == '<')
			sBuf.push("&lt;");
		else if (c == '>')
			sBuf.push("&gt;");
		else
			sBuf.push(c);
	}
	return sBuf.join("");
}


//--------------------------------------------------------------
// other util functions
//--------------------------------------------------------------

//change the state of all the checkboxes
function set_all_checkboxes(checkboxes, state) {
    if (checkboxes)
    {
        var length = getLength(checkboxes);
        for (var i = 0; i < length; i++)
        {
            var obj = getObject(checkboxes,length, i);
            if(!obj.disabled) {
                obj.checked = state;
            }
        }
        return true;
    }
    else
    {
        return false;
    }
}


function checkAtLeastOneCheckBoxIsCheckedOrPopError(checkboxes, err) {
    if(!isAtLeastOneCheckBoxChecked(checkboxes)) {
        showFormError(err);
        return false;
    } else {
        return true;
    }
}

function isAtLeastOneCheckBoxChecked(checkboxes) {
    if (checkboxes)
    {
      var length = getLength(checkboxes);
      for (var i = 0; i < length; i++) {
          if(getObject(checkboxes, length, i).checked == true) {
              return true;
          }
      }
    }
    return false;
}



function check_all_checkboxes_state(all_checkbox, checkboxes) {
    var state = true;
    var length = getLength(checkboxes);
    for (var i = 0; i < length; i++) {
        if (!getObject(checkboxes, length, i).checked) {
            state = false;
            break;
        }
    }
    getObject(all_checkbox, null, null).checked = state;
}

//get selected radio button
function get_selected_radio(radios) {
    var length = getLength(radios);
    for (var i = 0; i < length; i++) {
        var radio = getObject(radios, length, i);
        if (radio.checked)
            return radio;
    }
    return null;
}

// PURPOSE: to return the object indexed from an array of same-named
//          objects.  (should eliminate need to always check whether
//          form elements have a length of "null" or not before attempting
//          to do loops through elements)
// need to be passed a length parameter in addition to the object itself,
// because the complete idiots who designed JavaScript defined:
//     selectName.length
// to return the same thing as:
//     selectName.options.length
// (rather than the former returning the number of objects in the array
//  of select elements by the name 'selectName' it returns the number of
//  options in the drop-down box)
function getObject(objectElement, length, index) {

    if (length == null || length == 1) {
        return objectElement;
    } else {
        return objectElement[index];
    }

}


// PURPOSE: to return the number of same-named objects.
//
// WARNING! Will NOT work with select objects (drop-downs)
//          as the designers of the language did something
//          incredibly stupid...  (see getObject())
function getLength(objectElement) {

    var length = objectElement.length;

    if (length == null) {
        return 1;
    } else {
        return length;
    }
}

function showEl(element) {
    var s = "value:\n";
    for (o in element) {
        s = s + o + ": -" + element[o] + "-\n";
    }
    alert(s);
}

function setBlank(el, def) {
    if (isBlank(el)) {
        el.value = def;
    }
}

// String.split() is only available in JavaScript 1.1
function Split(sz,szSep)
{
    var iBeg=0, iEnd, i=0, a=new Array(), bDone=false;

    while(!bDone)
    {
        iEnd = sz.indexOf(szSep, iBeg);
        if (-1 == iEnd)
        {
            bDone = true;
            iEnd = sz.length;
        }
        a[i++] = sz.substring(iBeg,iEnd);
        iBeg = iEnd + szSep.length;
    }

    return a;
}

function anyOptionsSelected(list)
{
    if (list.selectedIndex >= 0)
    {
        return true;
    }

    for (i=0; i < list.length; i++)
    {
        if (list.options[i].selected)
        {
            return true;
        }
    }
    return false;
}

function flatten(list, delim)
{
    var flattened_list = delim;
    for (i=0; i < list.length; i++)
    {
        if (null != list.options[i])
        {
            flattened_list = flattened_list + list.options[i].value + delim;
        }
    }
    return flattened_list;
}

function valueInSelectList(list, value)
{
    for (i=0; i < list.length; i++)
    {
        if (value == list.options[i].value)
        {
            return true;
        }
    }
    return false;
}

function valueSelected(list, value)
{
    for (i=0; i < list.length; i++)
    {
        if (list.options[i].selected && value == list.options[i].value)
        {
            return true;
        }
    }
    return false;
}

function getSelectedValue(list) {
    return list.options[list.selectedIndex];
}

function gotoFirstNonHiddenElement(formObj)
{
    var myElements = formObj.elements;
    for (var i=0; i < myElements.length; i++)
    {
        var candidate = myElements[i];
        var sCandidateType = candidate.type.toLowerCase();

        if ((sCandidateType != "hidden") && (candidate.disabled == false))
        {
            candidate.focus();
            break;
        }
    }
}

//-----------------------------------------------------
// Functions for dealing with Arrays in javascript
//-----------------------------------------------------


function existsInArray(m_array, m_value) {
    var existsAlready = false;
    if (m_array == null)
        return existsAlready;

    for (var i = 0; i<m_array.length; ++i)
    {
        if (m_array[i] == m_value)
        {
            existsAlready = true;
            break;
        }
    }

    return existsAlready;
}


function indexInArray(m_array, m_value) {
    var indexInArray = -1;
    if (m_array == null)
        return indexInArray;

    for (var i = 0; i<m_array.length; ++i)
    {
        if (m_array[i] == m_value)
        {
            indexInArray = i;
            break;
        }
    }

    return indexInArray;
}


// requires first. Assumes second to be '|' if null.
function flattenArray(m_array, m_delim) {
    if (m_delim == null)
        m_delim = '|';

    if (m_array == null)
        return "";


    var m_returnDelimString = "";
    for (var i = 0; i < m_array.length; ++i) {
        if (m_returnDelimString == "")
            m_returnDelimString = m_array[i];
        else
            m_returnDelimString += m_delim + m_array[i];
    }
    return m_returnDelimString;
}




//-----------------------------------------------------
// Functions for dealing with delimited strings in javascript
//-----------------------------------------------------

// requires first two. Assumes third to be '|' if null.
function existsInDelimited(m_delimString, m_value, m_delim) {
    if (m_delim == null)
        m_delim = '|';

    var existsAlready = false;
    if (m_delimString == null)
        return existsAlready;

    var m_array = new Array();
    m_array = m_delimString.split(m_delim);
    return existsInArray(m_array, m_value);
}


//adds to a delimited string, does not create duplicates
// requires first two. Assumes third to be '|' if null.
function addToDelimited(m_delimString, m_value, m_delim) {
    if (m_delim == null)
        m_delim = '|';

    if (m_value == null)
        return m_delimString;

    if ((m_delimString == null) || (m_delimString == ""))
        return m_value;

    if (!existsInDelimited(m_delimString, m_value))
        if (m_delimString == "")
            m_delimString = m_value;
        else
            m_delimString += m_delim + m_value;
    return m_delimString;
}


//assumes no duplicates
// requires first two. Assumes third to be '|' if null.
function deleteFromDelimited(m_delimString, m_value, m_delim) {
    if (m_delim == null)
        m_delim = '|';

    if (m_value == null)
        return m_delimString;

    if ((m_delimString == null) || (m_delimString == ""))
        return "";

    var m_array = new Array();
    m_array = m_delimString.split(m_delim);
    var m_indexInArray = indexInArray(m_array, m_value);
    if (m_indexInArray > -1)
    {
        m_array = m_array.slice(0, m_indexInArray).concat(m_array.slice(m_indexInArray+1));
        return (flattenArray(m_array, m_delim));
    } else {
        return m_delimString;
    }
}


//-----------------------------------------------------------
// Functions for dealing with a name --> values in javascript
//-----------------------------------------------------------


function m_prv_jsHMPut(name, value) {
    var m_indexInArray = indexInArray(this.names, name);
    if (m_indexInArray > -1) {
        this.values[m_indexInArray] = value;
    } else {
        this.names[this.names.length] = name;
        this.values[this.values.length] = value;
    }
}

function m_prv_jsHMGet(name) {
    var m_indexInArray = indexInArray(this.names, name);
    if (m_indexInArray > -1) {
        return this.values[m_indexInArray];
    } else {
        return null;
    }
}

function m_prv_jsHMRemove(name) {
    var m_indexInArray = indexInArray(this.names, name);
    if (m_indexInArray > -1) {
        this.names = this.names.slice(0, m_indexInArray).concat(this.names.slice(m_indexInArray+1));
        this.values = this.values.slice(0, m_indexInArray).concat(this.values.slice(m_indexInArray+1));
    }
}

function m_prv_jsHMFlatten() {
    var returnArray = new Array();
    for (var i = 0; i < this.names.length; ++i) {
        returnArray[i] = this.names[i] + this.innerDelim + this.values[i];
    }
    return flattenArray(returnArray, this.outerDelim);
}


function m_prv_jsHMUnFlatten(szString) {
    if (szString == null)
        return;
    var m_array = new Array();
    m_array = szString.split(this.outerDelim);
    for (var i = 0; i < m_array.length; ++i) {
        var m_innerArray = new Array();
        m_innerArray = m_array[i].split(this.innerDelim);
        if (m_innerArray.length > 1) {
            this.put(m_innerArray[0], flattenArray(m_innerArray.slice(1), this.innerDelim));
        }
    }
}


//as a string a$b$c$d|e$f$g$h|i$j$k is map of a-->b$c$d e-->f$g$h i-->j$k
function jsHashMap(outerdelimiter, innerdelimiter) {
    this.put = m_prv_jsHMPut;              //put(name, value);
    this.get = m_prv_jsHMGet;              //get(name); returns String (or whatever you put) or null
    this.remove = m_prv_jsHMRemove;        //remove(name);
    this.flatten = m_prv_jsHMFlatten;      //flatten(); returns String
    this.unFlatten = m_prv_jsHMUnFlatten;  //unFlatten(string_value);

    this.names = new Array();
    this.values = new Array();
    this.outerDelim = (outerdelimiter == null ? '|' : outerdelimiter);
    this.innerDelim = (innerdelimiter == null ? '$' : innerdelimiter);
}




function required_validator_select_input_ctrl(formElement, errStr) {
    if(formElement.value == " -NONE- ")
            return errStr;
    return "";
}


function required_validator_data_drop_down_ctrl(formElement, errStr) {
    if(formElement.value == " -NONE- ")
            return errStr;
    return "";
}

function required_validator_text_input_ctrl(formElement, errStr) {
    if(isBlank(formElement,true)) {
            return errStr;
    }
    return "";
}


function required_validator_date_input_ctrl(formElement, errStr) {
    if(isBlank(formElement,true)) {
            return errStr;
    }

    return "";
}


function required_validator_ctrl_group(formElement, errStr) {
    if(!isAtLeastOneCheckBoxChecked(formElement)) {
        return errStr;
    }

    return "";
}



function required_validator_attr_input_ctrl(formElement, errStr) {
   return  required_validator_text_input_ctrl(formElement, errStr);
}


function required_validator_relationship_ctrl(formElement, errStr) {
    var sCtgElementName = formElement.form.name + "." + formElement.name + "_ctg";
    var sPKElementName = formElement.form.name + "." + formElement.name + "_primary_key";
    if (isBlank(eval(sCtgElementName)) || isBlank(eval(sPKElementName))) {
        return errStr;
    }
    return "";
}


function trimLeadingZerosInNumber(numStr) {
        var i;
        for(i = 0; i < numStr.length; i++) {
         if(numStr.charAt(i) != '0') {
            if(numStr.charAt(i) == '.') {
                   numStr = '0' +  numStr.substring(i, numStr.length);
                   break;
            }

            numStr = numStr.substring(i, numStr.length);

            break;
         }
       }

       if(i == numStr.length) {
             numStr = '0';
        }

       return numStr;
}




function trimZerosFromDecimalExpansion(number) {
        var numStr = number;

        if(numStr.length == 0) {
             return numStr;
        }


        var i;
        for(i = 0; i < numStr.length; i++) {
         if(numStr.charAt(i) != '0') {
            if(numStr.charAt(i) == '.') {
                if(i == 0) {
                   numStr = '0' + numStr;
                   break;
                }
            }

            numStr = numStr.substring(i, numStr.length);

            break;
         }
       }

       if(numStr.length == 0) {
             return '0';
        }





        if(numStr.indexOf('.') == -1)
             return numStr;

        // trim trailing zeros in decimal expansion
        for(i  = numStr.length -1; i >=0; i--) {
            if(numStr.charAt(i) != '0') {
                break;
            }
        }

        if(i > 0) {
            if(numStr.charAt(i) == '.') {
                return numStr.substring(0, i);
            } else {
                return numStr.substring(0, i+1);
            }
        } else {
            return numStr;
        }
}




function type_validator_number(formElement, errStr) {
    if (checkFloatMaybeEmpty(formElement, '') != '') {
        return errStr;
    }
    return "";
}

function type_validator_currency(formElement, errStr) {
    if (checkFloatMaybeEmpty(formElement, '') != '') {
        return errStr;
    }
    return "";
}

function type_validator_integer(formElement, errStr) {
    if (checkIntegerMaybeEmpty(formElement, '') != '') {
        return errStr;
    }
    return "";
}


function type_validator_default(formElement, errStr) {
        return "";
}


function pattern_validator(formElement, pattern, errStr) {

        var re = new RegExp(pattern);
        val = formElement.value;
        if ((val != null) && (val != "") && (re.test(val) != true)) {
            return errStr;
        }
        return "";
}


function SelectInputCtrl_selectAllOptions(ctrl) {
  var options = ctrl.options;
  for(i = 0; i < options.length; i++) {
  options[i].selected = true;
  }
}


function SelectInputCtrl_clearAllOptions(ctrl) {
  var options = ctrl.options;
  for(i = 0; i < options.length; i++) {
  options[i].selected = false;
  }
}


function getActiveText(e)
{
    // Sets text MSIE or Netscape active text based on browser, puts
    // text in form (active text is the text selected in the page if
    // you want to set it up to listen to selections using the mouse,
    // do this at the top of the page
    //      document.onmouseup = getActiveText();
    //      if (!document.all) document.captureEvents(Event.MOUSEUP);

    active_text = (document.all) ? document.selection.createRange().text : document.getSelection();
    return true;
}

// function to find occurrence of str in page using Edit/Find in Page
// from the user's browser
function findInPage(str, formField, pastString, caseSensitive)
{
    if (null == caseSensitive)
        caseSensitive = false;

    // uses variables set up at the top - NS4, IE4, this_win
    var txt, i, found;
    if (str == "")
        return false;
    if (NS4)
    {
        if (!this_win.find(str, caseSensitive, false))
            while(this_win.find(str, false, true))
                occurrence_counter++;
        else
            occurrence_counter++;
        if (occurrence_counter == 0) 
            {
              var args=new Array();
              args[0]=str;
              alert(formatMessage(TOOLS.NOT_FOUND_IN_PAGE_JS,args));  
            }
    }
    if (IE4)
    {
        if (null != formField)
        {
            txt = formField.createTextRange();
        }
        else
        {
            txt = this_win.document.body.createTextRange();
            if (null != pastString)
            {
                txt.findText(pastString);
                txt.moveStart("character", 1);
                txt.moveEnd("textedit");
            }
        }

        // alert(txt.htmlText);

        for (i = 0; i <= occurrence_counter && (found = txt.findText(str)) != false; i++)
        {
            txt.moveStart("character", 1);
            txt.moveEnd("textedit");
        }
        if (found)
        {
            txt.moveStart("character", -1);
            txt.findText(str);
            txt.select();
            txt.scrollIntoView();
            occurrence_counter++;
        }
        else
        {
            if (occurrence_counter > 0)
            {
                occurrence_counter = 0;
                findInPage(str);
            }
            else
            {
                    var args=new Array();
                    args[0]=str;
                    alert(formatMessage(TOOLS.NOT_FOUND_IN_PAGE_JS,args));  
              }
        }
    }
    return false;
}

function highlightInPage(formField, nBeginOffset, nEndOffset)
{
    if (IE4)
    {
        txt = (null == formField
               ? this_win.document.body.createTextRange()
               : formField.createTextRange());

        if (nBeginOffset < 0)
            nBeginOffset = nEndOffset;

        if (nEndOffset < 0)
            nEndOffset = nBeginOffset;

        if (nBeginOffset >= 0 && nEndOffset >= 0)
        {
            txt.moveStart("character", nBeginOffset);
            txt.moveEnd("character", nEndOffset - nBeginOffset);
            txt.select();
        }
    }
}

/////////////
//
// For XML
//
////////////

function escapeForXML(sText)
{
    if (sText == null)
        return "";

    var sOut = "";

    for (var i=0; i<sText.length; i++)
    {
        var c = sText.charAt(i);
        if (c == '"')
            sOut += "&quot;";
        else if (c == '&')
        {
              var chunk = sText.substring(i, i+5);

              if( chunk == "&amp;")
                  sOut += "&";
              else
                  sOut += "&amp;";
        }
        else if (c == '<')
        {
                  sOut += "&lt;";
        }
        else if (c == '>')
        {
                     sOut += "&gt;";
        }
        else if (c == '\'')
        {
                  sOut += "&apos;";
        }
        else
            sOut += c;
    }
    return sOut;
}

function changeDropDownValues(srcDropDown, dstDropDown, dstArray)
{
    var dstList = dstArray[srcDropDown.options[srcDropDown.selectedIndex].value];
//    alert("srcDropDown.selectedIndex = " + srcDropDown.selectedIndex);
//    alert("srcDropDown.options[srcDropDown.selectedIndex].value = " + srcDropDown.options[srcDropDown.selectedIndex].value);
//    alert("dstList = " + dstList);

    clearList(dstDropDown);
//    addElement(dstDropDown, '', 0);
    if(dstList)
    {
        var dstOptions = dstList.split(',');
        for (var i = 0; i < dstOptions.length; i++)
        {
            if (dstOptions[i])
            {
                var dstOption = dstOptions[i].split('#');
                addElement(dstDropDown, dstOption[0], dstOption[1]);
            }
        }
        dstDropDown.disabled = false;
    }
    else
    {
        dstDropDown.disabled = true;
    }

    dstDropDown.selectedIndex = 0;
}

function clearList(list)
{
    var i = 0;
    var o = list.options;

    for (i = o.length; i >= 0; --i)
        o[i] = null;
    list.disabled = true;
}


function addElement(list, text_in, value_in)
{
    var o = list.options;
    var nIdx;
    if (o.length < 0) //IE for Mac 4.5 sets length to -1 if list is empty
        nIdx = 0;
    else
        nIdx = o.length;

    o[nIdx] = new Option(text_in, value_in);
    list.disabled = false;
}

// replace only replaces the first occurence
function replaceAll(src,sFind,sReplace)
{
    if ((src) && (src!=""))
    {
        var cnt = src.indexOf(sFind,0);
        while (cnt>-1)
        {
            src = src.substring(0,cnt) + sReplace + src.substring(cnt+sFind.length);
            cnt = src.indexOf(sFind, cnt + sReplace.length);
        }
    }

    return src;
}

//taken from BackLink.java
function encodeForBackLink(txt)
{
    txt = txt.replace("\\", "\\\\");
    txt = txt.replace("$", "\\$");
    txt = txt.replace("|", "\\|");
    txt = txt.replace("'", "\\'");
    txt = txt.replace("\"", "&quot;");
    return txt;
}

////////////////////////////////////////////////
//  functions for image swapping in ProfLook  //
////////////////////////////////////////////////
//
//function ImgRestore(elt)
//{
//  elt.src = elt.oldsrc;
//}
//
//function ImgPress(elt)
//{
//  elt.src = elt.Downicon;
//}
//
//
//function ImgSwap(elt)
//{
//  elt.src = elt.Overicon;
//}
//
//function preLoad()
//{
//  var d=document;
//  if(d.images)
//    {
//        if(!d.array) d.array=new Array();
//        var i,j=d.array.length,a=preLoad.arguments;
//           for(i=0;
//               i<a.length; i++)
//               if (a[i].indexOf("#")!=0)
//               {
//                   d.array[j]=new Image;
//                   d.array[j++].src=a[i];
//               }
//   }
//}

////////////////////////////////////////////////
function escapeWithEntities(str)
{
    var newStr = "";
    for (i = 0; i < str.length; i++)
    {
        ch = str.charCodeAt(i);
        if (ch > 127)
           newStr += "&#" + ch + ";";
        else
           newStr += str.charAt(i);
    }

    return newStr;
}

function toggleDiv(divHandle, toggleHandle, autoStr, visibleStr)
{
  if(divHandle.style.overflow=='visible')
  {
      divHandle.style.overflow='auto';
      toggleHandle.innerHTML=autoStr;
  }
  else
  {
      divHandle.style.overflow='visible';
      toggleHandle.innerHTML=visibleStr;;
  }
}

function syncDivs(div1Id, div2Id)
{
    getElement(div1Id).scrollLeft = getElement(div2Id).scrollLeft;
    getElement(div1Id).scrollTop  = getElement(div2Id).scrollTop;
}



/**
 * Manages popups.  Many cases/behaviours.  Makes sure the popup win is opened by the correct fella.
 *
 * Args:
 * url
 * features (opt)
 */
function openTrigoWin(url, height, width, top, left, features, sTitle)
{
    if (features == null|| features == "")
        features = "resizable=yes,scrollbars=yes";
    return window.open(url, "_blank", features + ",height=" + height + ",width=" + width + ",top=" + top + ",left=" + left, true);
}

function openTrigoPopupWinWithArgs(url, height, width, top, left, winArgs)
{
    openTrigoPopupWin(url, height, width, top, left, null, null, false, null, true, winArgs, false);
}

function openTrigoPopupWin(url, height, width, top, left, features, onloadFocus, bHelp, sTitle, modal, winArgs, direct)
{
  url = (url == null ? "" : url);
  if (features == null|| features == "")
      features = "help:No; scroll: No; resizable: Yes; status: No; center: Yes;";
  
  if (url.indexOf('VPP/PCN') != -1) {
  	height = null;
  	width = null;
  	top = null;
  	left = null;
  	
  }
  
  if (height == null|| height == "")
      height = 600;
  if (width == null|| width == "")
      width = 800;

  if (height != null && height != "")
      features += "dialogHeight: " + height + "px;";
  if (width != null && width != "")
      features += "dialogWidth: " + width + "px;";
  if (top != null && top != "")
      features += "dialogTop: " + top + "px;";
  if (left != null && left != "")
      features += "dialogLeft: " + left + "px;";

  if (winArgs == null)
      winArgs = new Array();

  winArgs['opener'] = window;
  winArgs['url'] = url;

  if(onloadFocus != null)
  {
    winArgs['onloadFocus'] = onloadFocus;
  }

  if(bHelp != null)
  {
    winArgs['bHelp'] = bHelp;
  }

  if (sTitle != null)
  {
      winArgs['sTitle'] = sTitle;
  }

 var new_win;

 // why do we go through this page anyway ??? Let me know <PatricePominville>.
 if (!direct)
 {
   url = "/utils/popup.jsp";
 }

 if(modal)
 {
     new_win = window.showModalDialog(url, winArgs, features);
 }
 else
 {
     new_win = window.showModelessDialog(url, winArgs, features);
 }

  return new_win;
}

function openTrigoPopupWithData(features, data)
{
  features = (features == null ? "" : features);

  new_win = window.showModelessDialog('/blank.html', window, features);
  new_win.document.write("<html> <body > " + data + "</body> </html>");
  return new_win;
}


//*************************************************
// * clickable buttons
//*************************************************

function renderJSButton(str, alt, js, height, classbase, classover, classdown)
{
    var str = str;
    var alt = alt;
    var js = js;
    var height = height;
    var classbase = classbase;
    var classover = classover;
    var classdown = classdown;
    var button_string = ""
        + "\n" + "<table border=0 cellspacing=0 cellpadding=0><tr>"
        + "\n" + "<a hidefocus='true' STYLE='text-decoration:none' " + js + "><td valign='top'><map title='" + alt + "'>"
        + "\n" + "<div class='" + classbase + "' onMouseOver=\"this.className='" + classover + "'\""
        +                        " onMouseOut=\"this.className='" + classbase + "'\""
        +                        " onMouseDown=\"this.className='" + classdown + "'\""
        +                        " onMouseUp=\"this.className='" + classover + "'\" " + js + ">"
        + "\n" + "<img src='/images/newlook/spacer.gif' width='1' height='" + height + "' border='0' align='absmiddle'>"
        + "" + str + "</div>"
        + "\n" + "</map></td></a>"
        + "\n" + "</tr></table>"
        + "";
    return document.writeln(button_string);
}

function buttonMouseOver(unique_in,unique_out)
{
    document.getElementById(unique_in).style.backgroundColor="e4e4e4";
    document.getElementById(unique_in).style.borderLeftColor="f4f4f4";
    document.getElementById(unique_in).style.borderTopColor="f4f4f4";
    document.getElementById(unique_in).style.borderRightColor="141414";
    document.getElementById(unique_in).style.borderBottomColor="141414";
    document.getElementById(unique_in).style.borderWidth="1px";
    document.getElementById(unique_out).style.paddingLeft="0";
    document.getElementById(unique_out).style.paddingTop="0";
    document.getElementById(unique_out).style.paddingRight="2";
    document.getElementById(unique_out).style.paddingBottom="2";
}

function buttonMouseDown(unique_in,unique_out)
{
    document.getElementById(unique_in).style.backgroundColor="b4b4b4";
    document.getElementById(unique_in).style.borderLeftColor="242424";
    document.getElementById(unique_in).style.borderTopColor="242424";
    document.getElementById(unique_in).style.borderRightColor="f4f4f4";
    document.getElementById(unique_in).style.borderBottomColor="f4f4f4";
    document.getElementById(unique_in).style.borderWidth="1px";
    document.getElementById(unique_out).style.paddingLeft="2";
    document.getElementById(unique_out).style.paddingTop="2";
    document.getElementById(unique_out).style.paddingRight="0";
    document.getElementById(unique_out).style.paddingBottom="0";
}

function buttonMouseOut(unique_in,unique_out)
{
    document.getElementById(unique_in).style.backgroundColor="d4d4d4";
    document.getElementById(unique_in).style.borderLeftColor="747474";
    document.getElementById(unique_in).style.borderTopColor="747474";
    document.getElementById(unique_in).style.borderRightColor="747474";
    document.getElementById(unique_in).style.borderBottomColor="747474";
    document.getElementById(unique_in).style.color="040404";
    document.getElementById(unique_in).style.borderWidth="1px";
    document.getElementById(unique_out).style.paddingLeft="1";
    document.getElementById(unique_out).style.paddingTop="1";
    document.getElementById(unique_out).style.paddingRight="1";
    document.getElementById(unique_out).style.paddingBottom="1";
}

function buttonClick(unique_in,unique_out)

{
    document.getElementById(unique_in).style.backgroundColor="c4c4c4";
    document.getElementById(unique_in).style.borderLeftColor="848484";
    document.getElementById(unique_in).style.borderTopColor="848484";
    document.getElementById(unique_in).style.borderRightColor="848484";
    document.getElementById(unique_in).style.borderBottomColor="848484";
    document.getElementById(unique_in).style.color="949494";
    document.getElementById(unique_in).style.borderWidth="1px";
    document.getElementById(unique_out).style.paddingLeft="1";
    document.getElementById(unique_out).style.paddingTop="1";
    document.getElementById(unique_out).style.paddingRight="1";
    document.getElementById(unique_out).style.paddingBottom="1";
}

// returns first frame found having name 'frameName' by
// doing a depth first search from top of frame hierarchy,
// null if not found
function getFrame(frameName)
{
   var f = null;
   var w = window;
   while(w && f == null)
   {
     f = _getFrame(frameName, w);
     w = w.opener;
   }

   return f;
}

function _getFrame(frameName, firstWindow)
{
    var parent = firstWindow.parent;
    while(parent != parent.parent)
    {
        //        alert(parent.name);
        firstWindow = parent;
        parent = parent.parent;
    }

    var f = findFrame(firstWindow, frameName);
    // alert('found: ' + f);
    return f;
}


function findFrame(w, name)
{
    for(var i = 0; i < w.frames.length; i++)
    {
        //        alert('@ ' + w.frames[i].name);
        if(w.frames[i].name == name)
        {
            return w.frames[i];
        }
        else
        {
            var f = findFrame(w.frames[i], name);
            if(f != null)
            {
                return f;
            }
        }
    }

    return null;
}



function flattenAttribs(attribs)
{
    // attribs is an associative array of attribute names and values
    // we are building a delimited list of name-value pairs

    if ( null == attribs )
        return null;

    var str = "";

    bFirst = true;

    for ( var x in attribs )
    {
        if (!bFirst)
            str = str + "\|\|";

        str = str + encodeAttribs(x + "") + "::" + encodeAttribs(attribs[x] + "");
        bFirst = false;
    }

    return str;
}


function unflattenAttribs(flat_attribs)
{
    // flat_attribs is a delimited list of name-value pairs
    // we are building an associative array of attribute names and values

    var attribs = new Array();

    if ( null != flat_attribs )
    {
        var arrayOfNameValuePairs = flat_attribs.split("||");
        for ( i = 0; i < arrayOfNameValuePairs.length; i++ )
        {
            var nameValuePair = arrayOfNameValuePairs[i];
            if ( null != nameValuePair )
            {
                var nameAndValue = nameValuePair.split("::");
                if ( nameAndValue.length == 2 )
                {
                    var name = decodeAttribs(nameAndValue[0]);
                    var value = decodeAttribs(nameAndValue[1]);
                    attribs[name] = value;
                }
            }
        }
    }

    return attribs;
}


function encodeAttribs(sTxt)
{
    if (sTxt == null || sTxt.length == 0)
        return "";
    var sRes = null;
    sRes = sTxt.replace(/\\/g, "\\\\");
    sRes = sRes.replace(/\|/g, "\\|");
    sRes = sRes.replace(/:/g, "\\:");
    return sRes;
}

function decodeAttribs(sTxt)
{
    if (sTxt == null || sTxt.length == 0)
        return "";
    var sRes = null;
    sRes = sTxt.replace(/\\:/g, ":");
    sRes = sRes.replace("\\|", "|");
    sRes = sRes.replace(/\\\\/g, "\\");
    return sRes;
}

function rightTrimSpaces(value)
{
   var temp = value;
   var obj = /(\s*)$/;
   if (obj.test(temp))
   {
      temp = temp.replace(obj, '');
   }
   return temp;
}

function leftTrimSpaces(value)
{
   var temp = value;
   var obj = /^(\s*)/;
   if (obj.test(temp))
   {
      temp = temp.replace(obj, '');
   }
   return temp;
}

function trimSpaces(value)
{
   return leftTrimSpaces(rightTrimSpaces(value));
}



// escapes a string to html entities and url encodes them, so that unicode chars can be get/posted
function urlEncode (str) { var encodedStr = ""; for (var i = 0; i < str.length; i++) { encodedStr +=  "%26%23" + str.charCodeAt(i) + "%3B" ;} return encodedStr;}

// get a new string formatted as a series of unicode escapes of argument string
// ie 'abc' => '\u0061\u0062\u0063'
function unicodeEscapeFormatString(str)
{
    if(str)
    {
        var formatted = "";
        var len = str.length;
        for(var i = 0; i < len; i++)
        {
            formatted += toUnicodeEscape(str.charCodeAt(i));
        }
        return formatted;
    }
    else
    {
        return str;
    }
}

// get unicode escape string for an integer in range [0, 2^16[
// (if not in range return "\u0000)"
// ie 97 -> "\u0061";

function toUnicodeEscape(val)
{
    if(val <= 0 || val > 65536)
    {
        return "\u0000";
    }

    var lkp = ['0', '1', '2', '3', '4', '5', '6', '7',
             '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];

    var chars = ['0', '0', '0', '0'];
    var formatted = "\\u";

    for(var i = 3; val > 0 && i >=0; i--)
    {
        chars[i] = lkp[(val % 16)];
        val = val>>4;
    }

    for(var i = 0; i < 4; i++)
    {
        formatted += chars[i];
    }

    return formatted;
}

//show result divs

function hideResultDiv()
{
  if (document.getElementById("resultDiv"))
  {
    document.getElementById("resultDiv").style.visibility = "hidden";
  }
  hideResultContentDiv();
}

function hideResultContentDiv()
{
  if (document.getElementById("resultContentDiv"))
  {
    document.getElementById("resultContentDiv").style.visibility = "hidden";
  }
  showSelect();
}

//hide/show only the selects which a certain div goes over

  function showSelect()
  {
    var obj;

    for(var i = 0; i < document.all.tags("select").length; i++)
    {
      obj = document.all.tags("select")[i];
      //alert(obj.id);
      if(!obj || !obj.offsetParent)
        continue;
      obj.style.visibility = 'visible';
    }
  }

  function hideSelect(divObj)
  {
    var obj;
    var currentEle;
    var top = 0;
        var height = 0;
    var left = 0;
        var width = 0;
    var menuHeight;
    var timeout;
        var activeMenu = document.getElementById(divObj);

        if (document.getElementById("contentDiv"))
        {
            for(var i = 0; i < document.getElementById("contentDiv").getElementsByTagName("select").length; i++)
            {
                obj = document.getElementById("contentDiv").getElementsByTagName("select")[i];
                currentEle = obj;

                height = obj.offsetHeight;
                width = obj.offsetWidth;

                while(currentEle.id.toLowerCase() != 'contentdiv')
                {
                    top += currentEle.offsetTop;
                    left += currentEle.offsetLeft;
                    currentEle = currentEle.offsetParent;
                }

                menuHeight = (activeMenu.offsetTop + activeMenu.offsetHeight);
                menuWidth = ((document.body.clientWidth + activeMenu.offsetLeft) + activeMenu.offsetWidth);

                if(((top+height) > activeMenu.offsetTop) && (top < menuHeight))
                {
                    //alert((left+width) + "," + (document.body.clientWidth + activeMenu.offsetLeft) + "," + left + "," + menuWidth);
                    if(((left+width) > (document.body.clientWidth + activeMenu.offsetLeft)) && (left < menuWidth))
                    {
                        //alert((top+height) + "," + activeMenu.offsetTop  + "," + top + "," + menuHeight);
                        //alert("booyah!");
                        obj.style.visibility = 'hidden';
                    }
                }

                top = 0;
                left = 0;
            }
        }
  }


//catstuff toggle function

function catstuffToggle(theimg, thediv)
{
  var imgID = theimg.id;
  var divID = thediv;
  if (imgID == "minimize")
  {
    theimg.src = "/images/hpdemo/tab_view_catstuff_maximize.gif";
    theimg.id = "maximize";
        theimg.alt = "Show Category Information";
    document.getElementById(divID).style.display = "none";
  }
  else if (imgID == "maximize")
  {
    theimg.src = "/images/hpdemo/tab_view_catstuff_minimize.gif";
    theimg.id = "minimize";
        theimg.alt = "Hide Category Information";
    document.getElementById(divID).style.display = "";
  }
}


function flattenAttribs(attribs)
{
    // attribs is an associative array of attribute names and values
    // we are building a delimited list of name-value pairs

    if ( null == attribs )
        return null;

    var str = "";

    bFirst = true;

    for ( var x in attribs )
    {
        if (!bFirst)
            str = str + "\|\|";

        str = str + encodeAttribs(x + "") + "::" + encodeAttribs(attribs[x] + "");
        bFirst = false;
    }

    return str;
}


function unflattenAttribs(flat_attribs)
{
    // flat_attribs is a delimited list of name-value pairs
    // we are building an associative array of attribute names and values

    var attribs = new Array();

    if ( null != flat_attribs )
    {
        var arrayOfNameValuePairs = flat_attribs.split("||");
        for ( i = 0; i < arrayOfNameValuePairs.length; i++ )
        {
            var nameValuePair = arrayOfNameValuePairs[i];
            if ( null != nameValuePair )
            {
                var nameAndValue = nameValuePair.split("::");
                if ( nameAndValue.length == 2 )
                {
                    var name = decodeAttribs(nameAndValue[0]);
                    var value = decodeAttribs(nameAndValue[1]);
                    attribs[name] = value;
                }
            }
        }
    }

    return attribs;
}


function encodeAttribs(sTxt)
{
    if (sTxt == null || sTxt.length == 0)
        return "";
    var sRes = null;
    sRes = sTxt.replace(/\\/g, "\\\\");
    sRes = sRes.replace(/\|/g, "\\|");
    sRes = sRes.replace(/:/g, "\\:");
    return sRes;
}

function decodeAttribs(sTxt)
{
    if (sTxt == null || sTxt.length == 0)
        return "";
    var sRes = null;
    sRes = sTxt.replace(/\\:/g, ":");
    sRes = sRes.replace("\\|", "|");
    sRes = sRes.replace(/\\\\/g, "\\");
    return sRes;
}

function rightTrimSpaces(value)
{
   var temp = value;
   var obj = /(\s*)$/;
   if (obj.test(temp))
   {
      temp = temp.replace(obj, '');
   }
   return temp;
}

function leftTrimSpaces(value)
{
   var temp = value;
   var obj = /^(\s*)/;
   if (obj.test(temp))
   {
      temp = temp.replace(obj, '');
   }
   return temp;
}

function trimSpaces(value)
{
   return leftTrimSpaces(rightTrimSpaces(value));
}

//functions for the 3rd level of POPUP menus in the new navigation scheme
//
//function showMenu(p,e){
//     e.style.visibility="visible";
//     e.style.top= (getPosLayer(p, "Top"))+(p.style.pixelHeight); // window.event.y+"px";
//     e.style.left= getPosLayer(p, "Left");
//}
//
//function isOverMenu(e){
//     var x = event.x;
//     var y = event.y;
//    var b = (x >= (e.style.pixelLeft) && y >= (e.style.pixelTop) && (x - (e.style.pixelLeft) < (e.style.pixelWidth)) && (y - (e.style.pixelTop) <  (e.style.pixelHeight)));
//     return b;
//}
//
//function hideMenu(e){
//     if (!isOverMenu(e))
//     {
//          e.style.visibility="hidden";
//     }
//     else{
//     }
//}
//
//function getPosLayer(e, szWhich) {
//     var iPos= e["offset" + szWhich]
//          while (e.offsetParent!=null)
//              {
//                   e = e.offsetParent
 //                   iPos += e["offset" + szWhich]
//              }
//     return iPos
//}
//
// end 3rd level popup menu functions

function showCopyPasteContextMenu()
{
    var menuItems = [new MenuItem("Copy", function() { document.execCommand("Copy", false, null);}),
                     new MenuItem("Paste", function() { document.execCommand("Paste", false, null);}),
                     new MenuItem("Select All", function() { document.execCommand("SelectAll", false, null);})];

    showMenu(menuItems);
}

function startsWith(value, prefix)
{
    var len = prefix.length;
    return value.substr(0,len) == prefix;
}

function showHideAnyDiv(elt, bShow, clickedelt)
{
  var theDivObj = document.getElementById(elt);
  if (bShow)
  {
    theDivObj.style.display = "block";
  }
  else if (!bShow)
  {
    theDivObj.style.display = "none";
  }
}

function showHideParagraphDiv(elt, bShow, clickedelt)
{
  var theDivObj = document.getElementById(elt);
  clickedelt.onclick = null;
  if (bShow)
  {
    theDivObj.style.display = "";
    clickedelt.parentElement.innerHTML = "<IMG id='"+elt+"_img' style='cursor:hand;' height='16' src='/images/newlook/leftnav_minimize.png' width='16' border='0' onClick='showHideParagraphDiv(\"" + elt + "\", false, this);'>";
  }
  else if (!bShow)
  {
    theDivObj.style.display = "none";
    clickedelt.parentElement.innerHTML = "<IMG id='"+elt+"_img' style='cursor:hand;' height='16' src='/images/newlook/leftnav_maximize.png' width='16' border='0' onClick='showHideParagraphDiv(\"" + elt + "\", true, this);'>";
  }
}

function toggleNextTableRow(elt, label, showLabel, hideLabel, howmany)
{
  var theTable;
  var theRows;
  var theDisplay;
  theTable = elt.parentElement;
  while (theTable.tagName != "TABLE")
  {
    theTable = theTable.parentElement;
  }
  theRows = theTable.rows;
  theDisplay = theRows[elt.parentElement.rowIndex+1].style.display;
  if (theDisplay == "none")
  {
        for (var i = 1; i <= howmany; i++)
        {
            if (theRows[elt.parentElement.rowIndex+i])
            {
                theRows[elt.parentElement.rowIndex+i].style.display = "";
            }
        }
        elt.innerHTML = "<font face='webdings'>5</font>&nbsp;"+ hideLabel;
  }
  else
  {
        for (var i = 1; i <= howmany; i++)
        {
            if (theRows[elt.parentElement.rowIndex+i])
            {
                theRows[elt.parentElement.rowIndex+i].style.display = "none";
            }
        }
        elt.innerHTML = "<font face='webdings'>5</font>&nbsp;"+ showLabel;
  }
}

function showScriptOpsLoadingRow(val, valsVal)
{
    document.getElementById('script_ops_msg_row').style.display='';
}

function showScriptOpsDetailsRow(val, valsVal)
{
    if (val == valsVal)
    {
        document.getElementById('script_ops_prototype_row').style.display='';
    }
    else if (val != valsVal)
    {
        document.getElementById('script_ops_prototype_row').style.display='none';
    }
    document.getElementById('script_ops_msg_row').style.display='none';
}

// reset the main window lastPostTime
function setLastPostTime()
{
    top.lastPostTime = (new Date()).valueOf();
}


function getLastPostTime()
{
    return top.lastPostTime;
}



function spellCheck(elements)
{
    if (typeof(isFormBlocked) != "undefined" && isFormBlocked())
            return;
        
    var originalCursor = document.body.style.cursor;
    document.body.style.cursor = "wait";
    var val = true;
    if (elements.length > 1)
    {
      var args = new Object();
      args.ctxCtrl = elements;
      val = window.showModalDialog("/spell/all_spell_checker.jsp", args,
                                     "status:no;dialogLeft=20px;dialogTop=20px;dialogWidth:490px;dialogHeight:340px");
    } 
    else if ((elements.length == 1) && (elements[0].value != ""))
    {
      var args = new Object();
      args.ctxCtrl = elements[0];
      val = window.showModalDialog("/spell/spell_checker.jsp", args,
                                       "status:no;dialogLeft=20px;dialogTop=20px;dialogWidth:490px;dialogHeight:340px");
    }
    if (elements.length > 0)
      elements[(elements.length - 1)].focus();

      // val will be false if the user clicks on 'Cancel' in the spell check dialog
    if(val)
    {
        alert(TOOLS.SPELL_CHECK_COMPLETE_JS);
    }

    document.body.style.cursor = originalCursor;
}

function spellCheckAllwithForm(form)
{
    var elements = form.elements;
    var length = elements.length;
    var spellCheckElements = new Array();
    for (var i=0;i < length;i++)
    {
      if (elements(i).t == "s" && elements(i).value != "" && elements(i).parentNode.currentStyle.display != "none")
      {
        spellCheckElements.push(elements(i));
      }
    }
    spellCheck(spellCheckElements);
}

function spellCheckAll()
{
    spellCheckAllwithForm(getForm());
}
