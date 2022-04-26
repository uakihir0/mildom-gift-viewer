# 技術メモ

Mildom の WebSocket の通信は、通信によって別々の暗号化がかけられています。
チャットサーバーは xxtea によるバイナリの暗号化と、そのバイナリの前に、
恐らくバージョン番号と、バイナリの長さを記述しているプレフィックスをつけています。

xxtea は、共通鍵暗号になっており、暗号化・復号化共に、同じ鍵によって行われます。
鍵は JavaScript 内に決め打ちで記述されており、その値を使うことで確認することができます。
この鍵については、今後変更される可能性がありそうです。が、恐らく変更されないと踏んでいます。

xxtea については以下のライブラリを用いて実装しています。

- [xxtea](https://github.com/xxtea/xxtea-html5)

また、先人の参考になるコードは以下に記載します。

- [MultiCommentViewer](https://github.com/CommentViewerCollection/MultiCommentViewer/commit/3b76512c7efc7e7c7dcbc06bf928ee1aa77a1097)
