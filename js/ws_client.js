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

// Mildom xxtea Encryption Key
const PASSWORD = "32l*!i1^l56e%$xnm1j9i@#$cr&";

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
    web_socket.binaryType = 'arraybuffer';

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
    let user_name = getRandomUserName()
    let guest_id = getRandomGuestId()

    let time = new Date().toISOString();    
    let user_agent = window.navigator.userAgent;
    
    // Cmd EnterRoom
    let initialize = {
        "userId": 0,
        "level": 1,
        "userName": user_name,
        "guestId": guest_id,
        "nonopara": "fr=web`sfr=pc`devi=undefined`la=ja`gid=" + guest_id + 
        "`na=Japan`loc=Japan|Tokyo`clu=aws_japan`wh=3360*2100`rtm="+ time + 
        "`ua=" + user_agent + "`aid=" + user_id + "`live_type=2`live_subtype=2`isHomePage=false",
        "roomId": user_id,
        "cmd":"enterRoom",
        "reConnect":1,
        "nobleLevel":0,
        "avatarDecortaion":0,
        "enterroomEffect":0,
        "nobleClose":0,
        "nobleSeatClose":0,
        "reqId":1
    }

    let enced = xxtea.encrypt(
        xxtea.toBytes(JSON.stringify(initialize)), 
        xxtea.toBytes(PASSWORD)
    );

    web_socket.send(getPrefixedArrayBuffer(enced));
}

function getPrefixedArrayBuffer(data){
    let len = data.length;
    let buffer = new ArrayBuffer(8 + len);
    let view = new DataView(buffer);

    view.setUint16(0, 4);
    view.setUint8(2, 1);
    view.setUint8(3, 1);
    view.setUint32(4, len);

    for(i=0; i < len; i += 1){
        view.setUint8(8 + i, data[i]);
    }
    return buffer
}

function getRandomUserName(){
    var list = "0123456789";
    return "guest" + randomString(list, 6);
}

function getRandomGuestId(){
    var list = "abcdef0123456789";
    return "pc-gp-" 
    + randomString(list, 8)
    + "-" + randomString(list, 4)
    + "-" + randomString(list, 4)
    + "-" + randomString(list, 4)
    + "-" + randomString(list, 12);
}

function randomString(list, length){
    return Array.from(Array(length))
        .map(() => list[Math.floor(Math.random()*list.length)]).join('')
}

// OnMessage
function onMessage(event) {
    if (event && event.data) {

        let sliced = event.data.slice(8);
        let deced = xxtea.decrypt(
            new Uint8Array(sliced), 
            xxtea.toBytes(PASSWORD)
        );

        let str = xxtea.toString(deced);
        let json = $.parseJSON(str);
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
