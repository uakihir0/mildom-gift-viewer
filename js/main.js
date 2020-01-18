$(function () {

    // 対象者の Mildom ID
    const mildom_id = 10000000;

    // 画像を表示する DIV を取得
    const image_box = $('#image_box');
    
    // ギフト情報
    var gift_map = {}

    /** 
     * ギフト情報の取得
     * (Mildom の API を直接コールする)
     */
    function getGiftInfo() {
        $.ajax({
          type: "get",
          url: "https://cloudac.mildom.com/nonolive/gappserv/gift/find",
        })
        .then(function (result) {
            for (gift in result.body.models) {
                let model = result.body.models[gift];
                gift_map[model.gift_id] = {
                    "price": model.price,
                    "name": model.name,
                    "url": model.pic }
            }
        }, function () {});
    }


    // イベントリスナー
    function eventListenner(json, complete_function) {
        console.log(json);

        // ギフトが送信された場合のみ対応
        if (json.cmd == "onGift") {
            createImage(json.giftId, json.count, complete_function);
        }

        complete_function()
    }

    // Img タグの生成
    function createImage(gift_id, count, complete_function) {

        // 対応可能なギフトである場合
        if (gift_map[gift_id]) {         
            for (var i=0; i<count; i++){
               const image = $("<img/>").addClass("stamp");
                image.bind('load', function () {
                    showImage(image, complete_function); });
                image.attr("src", gift_map[gift_id].url);    
            }
        }
    }

    // Img タグのアニメーション開始
    function showImage(element, complete_function) {

        // 先に追加してサイズを把握
        element.css("left",+200+"%");
        element.appendTo(image_box);
        var elm_width = element.outerWidth(true);
        var elm_height = element.outerHeight(true);

        // 表示させている幅を取得
        const ib_width = image_box.outerWidth(true);
        const ib_height = image_box.outerHeight(true);

        var movey = (ib_height + elm_height);
        var originx = (ib_width - elm_width) * Math.random();
        var originy = (-elm_height);

        // 改めて設定
        element.css("left",originx+"px");
        element.css("top",originy+"px");
        
        // 新規コメントを左に移動
        element.velocity({
            translateY: movey+"px"
        },{
            duration: 2000,
            easing: "ease-in",
            delay: 2000 * Math.random(),
            complete: function(e) { 
                element.remove();
            }
        });        
    }

    getGiftInfo();
    startToLissten(eventListenner);
    startConnectToMildom(mildom_id);
});