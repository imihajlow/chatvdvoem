// ==UserScript==
// @name         New Userscript
// @namespace    https://chatvdvoem.ru/
// @version      0.1
// @description  Fool people in chat
// @author       Ivan Mikhailov
// @match        https://chatvdvoem.ru/
// @grant        none
// ==/UserScript==

var sendingMessage = false;

function sendMsg(msg) {
    sendingMessage = true;
    var timeout = msg.length * 50 + 500;
    $("#text").val(msg);
    setTimeout(function() {
        $("#text_send").click();
        sendingMessage = false;
    }, timeout);
}

function startChat() {
    $("#chat_start").click();
}

function disconnect() {
    $('.disconnectBnt').click();
}

function restart() {
    disconnect();
    setTimeout(startChat, 200);
}

function isConnected() {
    return !$("#text_send").prop("disabled");
}

function waitConnection(callback) {
    function waiter() {
        if (isConnected()) {
            waitSilence();
            callback();
        } else {
            setTimeout(waiter, 200);
        }
    }
    waiter();
}

var silenceTimeout = 15000;
var silenceTimer = null;

function waitSilence() {
    if (silenceTimer) {
        clearTimeout(silenceTimer);
    }
    console.log("waitSilence");
    silenceTimer = setTimeout(function() {
        console.log("too silent");
        if (isConnected()) {
            onSilence();
            waitSilence();
        } else {
            silenceTimer = null;
        }
    }, silenceTimeout);
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
            waitSilence();
            onMessage(msg);
        }
    });
    waitConnection(onConnect);
}

var botState = "start";

function onConnect() {
}

function onDisconnect() {
    startChat();
    waitConnection(onConnect);
}

function onMessage(msg) {
}

function onSilence() {
    sendMsg("че молчишь, мудила?");
}

(function() {
    'use strict';
    init(onMessage, onDisconnect);
})();