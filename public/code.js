/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
function readBody(xhr) {
    var data;
    if (!xhr.responseType || xhr.responseType === "text") {
        data = xhr.responseText;
    } else if (xhr.responseType === "document") {
        data = xhr.responseXML;
    } else {
        data = xhr.response;
    }
    return data;
}

function sendGet(action, callback)
{
    var xml;
    if (window.XMLHttpRequest)
    {// code for IE7+, Firefox, Chrome, Opera, Safari
        xml = new XMLHttpRequest();
    } else
    {// code for IE6, IE5
        xml = new ActiveXObject("Microsoft.XMLHTTP");
    }
    var json;
//                alert(xml.readyState);
    xml.onreadystatechange = function () {
        if (xml.readyState === 4) {
            if (xml.status === 200) {
//                            alert("Status: " + xml.statusText + "\n" + "Response:" + xml.responseText);
                if (xml.responseText !== undefined) {
//                                alert(xml.responseText);
                    callback(xml.responseText);
                }
            } else {
                alert(" An error has occurred: " + xml.status + "\n"
                        + "Status : " + xml.statusText + "\n"
                        + "Ready State : " + xml.readyState + "\n"
                        + "Method : " + xml.METHODS);
            }
        }
    };
    xml.open("GET", 'http://swd391.herokuapp.com/' + action, true);
    xml.send(null);
}
function sendPost() {
    var name = document.getElementById("txtName").value;
    var age = document.getElementById("txtAge").value;
    var formData = {
        "Persons": [
            {
                "name": name,
                "age": age
            }
        ]
    };
    var xml = new XMLHttpRequest();
    xml.open('POST', 'http://swd391.herokuapp.com/id', true);
    xml.setRequestHeader('Content-type', 'application/json; charset=UTF-8');
    xml.onreadystatechange = function () {
        Console.log("Changes");
        if (xml.readyState === 4) {
            if (xml.status === 200) {
                alert("Status: " + xml.statusText + "\n" + "Response:" + xml.responseText);
            } else {
                alert(" An error has occurred: " + xml.status + "\n"
                        + "Status : " + xml.statusText + "\n"
                        + "Ready State : " + xml.readyState + "\n"
                        + "Method : " + xml.METHODS);
            }
        }
    };
    xml.send(null);
    xml.send(JSON.stringify(formData));
}
