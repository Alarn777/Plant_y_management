export default class WS {
  static init() {
    if (!this.ws || this.ws.readyState === WebSocket.CLOSED) {
      this.ws = new WebSocket(
        JSON.parse(process.env.REACT_APP_API_LINKS).apigatewayWebSocket
      );
      this.ws.onopen = function(e) {
        console.log("Socket is connected");
      };

      // let m = JSON.stringify({
      //   message:
      //     'FROM_CLIENT;e0221623-fb88-4fbd-b524-6f0092463c93;VIDEO_STREAM_ON',
      //   action: 'message',
      // });
      // try {
      //   this.ws.send(m);
      //   console.log('sent stream on message ', m);
      // } catch (e) {
      //   console.log(e);
      // }
      // console.log(this.ws);
    }

    this.ws.onerror = function(e) {
      console.log("ERROR");
    };

    this.ws.onclose = function(e) {
      console.log(
        "Socket is closed. Reconnect will be attempted in 1 second.",
        e.reason
      );
      setTimeout(function() {
        this.ws = this.ws = new WebSocket(
          JSON.parse(process.env.REACT_APP_API_LINKS).apigatewayWebSocket
        );
      }, 1000);
    };
  }

  static onMessage(handler) {
    this.ws.addEventListener("message", handler);
  }

  static closeSocket() {
    this.ws.close();
  }

  static onClose(handler) {
    console.log("socket closed");
  }
  static sendMessage(message) {
    let m = JSON.stringify({
      message: message,
      action: "message"
    });

    try {
      this.ws.send(m);
    } catch (e) {
      console.log(e);
    }
  }
}
