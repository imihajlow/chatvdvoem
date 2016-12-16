// ==UserScript==
// @name         New Userscript
// @namespace    https://chatvdvoem.ru/
// @version      0.1
// @description  Fool people in chat
// @author       Ivan Mikhailov
// @match        https://chatvdvoem.ru/
// @grant        none
// ==/UserScript==


function sendMsg(msg) {
    var timeout = msg.length * 100;
    $("#text").val(msg);
    setTimeout(function() {
        $("#text_send").click();
    }, timeout);
}

function init(onMessage, onDisconnect) {
        $("body").on("DOMSubtreeModified", "#messages>ol", function() {
        var last = $("#messages>ol").children().last();
        if (last.hasClass("disconnected")) {
            console.log("disconnected");
            onDisconnect();
        } else if (last.hasClass("messageFrom")) {
            var msg = last.find(".message").text();
            console.log("got message:", msg);
            onMessage(msg);
        }
    });
}

function onDisconnect() {
}

function onMessage(msg) {
}

(function() {
    'use strict';
    init(onMessage, onDisconnect);
})();