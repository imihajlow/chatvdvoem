// ==UserScript==
// @name         New Userscript
// @namespace    https://chatvdvoem.ru/
// @version      0.1
// @description  Fool people in chat
// @author       Ivan Mikhailov
// @match        https://chatvdvoem.ru/
// @require      http://fusejs.io/assets/js/fuse.min.js
// @grant        none
// ==/UserScript==

var recordingEnabled = false;
var reconnectEnabled = true;
var botEnabled = true;


var sendingMessage = false;
var messageTimer = null;

function sendMsg(msg) {
    sendingMessage = true;
    var timeout = msg.length * 50 + 500;
    $("#text").val(msg);
    messageTimer = setTimeout(function() {
        $("#text_send").click();
        sendingMessage = false;
        messageTimer = null;
    }, timeout);
}

function startChat() {
    $("#chat_start").click();
}

function disconnect() {
    $('.disconnectBnt').click();
}

function restart() {
    if (messageTimer) {
        clearTimeout(messageTimer);
        messageTimer = null;
    }
    disconnect();
    //setTimeout(startChat, 200);
}

function isConnected() {
    return !$("#text_send").prop("disabled");
}

var disconnectCallbackFired = false;

function waitConnection(callback) {
    function waiter() {
        if (isConnected()) {
            disconnectCallbackFired = false;
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
            if (!disconnectCallbackFired) {
                onDisconnect();
            }
            disconnectCallbackFired = true;
        } else if (last.hasClass("messageFrom")) {
            var msg = last.find(".message").text();
            console.log("got message:", msg);
            waitSilence();
            onMessage(msg);
        } else if (last.hasClass("messageTo")) {
            var msg = last.find(".message").text();
            console.log("sent message:", msg);
            onOutgoingMessage(msg);
        }
    });
    waitConnection(onConnect);
}

var conversation = [];

function onConnect() {
    conversation = [];
}

function onDisconnect() {
    if (recordingEnabled) {
        if (conversation.length > 10) { // Save only meaningful conversations
            var chatsJson = localStorage.getItem("chats");
            if (chatsJson === null) {
                chatsJson = '[]';
            }
            var chats = JSON.parse(chatsJson);
            chats[chats.length] = conversation;
            try {
                localStorage.setItem("chats", JSON.stringify(chats));
            } catch (e) {
                alert("Unable to save in localStorage");
            }
        }
    }
    if (reconnectEnabled) {
        startChat();
        waitConnection(onConnect);
    }
}

function onMessage(msg) {
    if (recordingEnabled) {
        conversation[conversation.length] = { "t": "i", "m": msg };
    }
    if (botEnabled) {
        reply = getReply(msg);
        if (reply !== null) {
            sendMsg(reply);
        }
    }
}

function onOutgoingMessage(msg) {
    if (recordingEnabled) {
        conversation[conversation.length] = { "t": "o", "m": msg };
    }
}

function onSilence() {
    if (recordingEnabled) {
        conversation[conversation.length] = { "t": "s" };
    }
}

var fuse;

function initBot() {
    var options = {
      shouldSort: true,
      tokenize: true,
      findAllMatches: true,
      threshold: 0.6,
      location: 0,
      distance: 100,
      maxPatternLength: 32,
      minMatchCharLength: 1,
      keys: ["i"]
    };
    fuse = new Fuse(db, options);
}

function getReply(input) {
    if (!fuse) {
        initBot();
    }
    result = fuse.search(input);
    console.log("getReply", input, result);
    if (result.length > 0) {
        var items = result[0].o;
        if (items.length > 0) {
            return items[Math.floor(Math.random()*items.length)];
        }
    }
    return null;
}

(function() {
    'use strict';
    init(onMessage, onDisconnect);
})();

var db = [];