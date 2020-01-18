/**
 * Mildom のイベント情報取得クライアント
 * (WebSocket 通信にてリアルタイムに取得)
 */

// WebSocket object
let web_socket = null;
let web_socket_url = null;

// Connet User ID
let user_id = null;

// Event Lists
let events_list = new Array();

// Event Listenner
let event_listener = null;

// Default Mildom WebSocket endpoints
const MILDOM_WS_URL = "wss://jp-room1.mildom.com/?roomId=";

/**
 * Mildom の WebSocket サーバーに接続
 * 特定のユーザーの配信のイベントを取得する
 */
function startConnectToMildom(id) {

    // Initialize WebSocket
    if (web_socket == null) {
        web_socket_url = (MILDOM_WS_URL + id);
        user_id = id
        open();
    }
}

/**
 * イベントの取得を開始する
 * イベントが存在した場合のコールバック関数を設定
 */
function startToLissten(listener) {
    event_listener = listener;
    setTimeout(
        function () {
            sendComment()
        }, 100);
}


function open() {
    web_socket = new WebSocket(web_socket_url);

    // Setting EventHandler
    web_socket.onopen = onOpen;
    web_socket.onmessage = onMessage;
    web_socket.onclose = onClose;
    web_socket.onerror = onError;
}

function sendComment() {
    if (0 < events_list.length) {
        setTimeout(
            function () {
                json = events_list[0];
                events_list.shift();
                if (event_listener) {
                    event_listener(json, sendComment);
                }
            }, 0);
    } else {
        setTimeout(sendComment, 50);
    }
}

// OnOpen 
function onOpen(event) {

    // Cmd EnterRoom
    var initialize = {
        "cmd": "enterRoom",
        "roomId": user_id,
        "userName": "guest",
        "guestId": "pc",
        "reConnect": 1
    }

    web_socket.send(JSON.stringify(initialize));
}

// OnMessage
function onMessage(event) {
    if (event && event.data) {
        let json = $.parseJSON(event.data);
        events_list.push(json);
    }
}

// OnError
function onError(event) {
}

// OnError
function onClose(event) {
    web_socket = null;
    setTimeout(open(), 100);
}
