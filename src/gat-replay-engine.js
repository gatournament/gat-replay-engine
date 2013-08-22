if (!String.prototype.trim) {
  String.prototype.trim=function(){ return this.replace(/^\s+|\s+$/g, ""); };
  String.prototype.ltrim=function(){ return this.replace(/^\s+/,""); };
  String.prototype.rtrim=function(){ return this.replace(/\s+$/,""); };
  String.prototype.fulltrim=function(){ return this.replace(/(?:(?:^|\n)\s+|\s+(?:$|\n))/g,"").replace(/\s+/g," "); };
}


var GATReplay = fabric.util.createClass(fabric.Group, {
  initialize: function(options) {
    options || (options = { });
    this.callSuper("initialize", options.panels || [], options);
    this.commands = options.commands || [];
    this._timeBetweenCommands = 1000; // in ms
    this._currentCommand = 0;
    this._execution = null;
  },

  nextCommand: function() {
    if (this.commands != undefined && this.commands != null && this.commands != "" && this._currentCommand < this.commands.length) {
      var command = this.commands[this._currentCommand];
      return this.parseCommand(command);
    } else {
      return null;
    }
  },

  parseCommand: function(command) {
    // console.debug(command);
    command = command.trim().replace(/\s/g, "");
    command = command.replace(")", "");
    tokens = command.split("\(");
    var cmd = tokens[0];
    var args = [];
    if (tokens[1] != undefined) {
        args = tokens[1].split(",");
    }
    return { name: cmd, args: args };
  },

  play: function() {
    if (this._execution != null) return;
    var that = this;
    function processCommand() {
        var command = that.nextCommand();
        if (command != null) {
          that._applyCommand(command);
          that._currentCommand += 1;
          that._execution = setTimeout(processCommand, that._timeBetweenCommands);
        } else {
          that.pause();
          that._end();
          that.stop();
        }
    }
    this._execution = setTimeout(processCommand, this._timeBetweenCommands);
  },

  pause: function() {
    if (this._execution != null) {
      clearTimeout(this._execution);
      this._execution = null;
    }
  },

  stop: function() {
    this.pause();
    this._currentCommand = 0;
  },

  increaseSpeed: function() {
    this._timeBetweenCommands = Math.min(this._timeBetweenCommands - 100, 100);
  },

  decreaseSpeed: function() {
    this._timeBetweenCommands = Math.max(this._timeBetweenCommands + 100, 3000);
  },

  start: function() {
  },

  _applyCommand: function(command) {
    console.debug(command.name);
    console.debug(command.args);
  },

  _end: function() {
  },

  addGameMessage: function(msg) {
    var options = {
      fontFamily: "Comic Sans",
      fontSize: 50,
      fontWeight: "bold",
      fill: "#fff",
      stroke: '#000',
      strokeWidth: 2,
      opacity: 0,
      textShadow: 'rgba(0,0,0,0.3) 5px 5px 5px',
    }
    this.addTempMessage(msg, options);
  },

  addPlayerMessage: function(msg, left, top) {
    var options = {
      left: left,
      top: top,
      fontFamily: "Comic Sans",
      fontSize: 20,
      fontStyle: "italic",
      fill: "#000",
      textShadow: 'rgba(0,0,0,0.3) 1px 1px 1px',
      padding: 10,
    };
    var backgroundOptions = {
      left: left,
      top: top,
      width: 200,
      height: 40,
      fill: "#fff",
      backgroundColor: "#fff",
      rx: 10,
      ry: 10,
      stroke: '#bbb',
      strokeWidth: 1,
    };
    this.addTempMessage(msg, options, backgroundOptions);
  },

  addTempMessage: function(msg, options, backgroundOptions) {
    options || (options = { });
    backgroundOptions || (backgroundOptions = { });
    var text = new fabric.Text(msg, options);
    var background = new fabric.Rect(backgroundOptions);
    var group = new fabric.Group([background, text]);
    this.add(group);
    canvas.renderAll();
    var that = this;
    var time = this._timeBetweenCommands - 100;
    group.animate("opacity", 1, {
      duration: time/2,
      onChange: canvas.renderAll.bind(canvas),
      onComplete: function() {
        group.animate("opacity", 0, {
          duration: time/2,
          onChange: canvas.renderAll.bind(canvas),
          onComplete: function() {
            that.remove(group);
            canvas.renderAll();
          },
        });
      },
    });
  },
});


var Card = fabric.util.createClass(fabric.Group, {
  SPADES: "♠", // "&#9824;"
  HEARTS: "♥", // "&#9829;"
  DIAMONDS: "♦", // "&#9830;"
  CLUBS: "♣", // "&#9827;"
  SUITS: { 1: "♠", 2: "♥", 3: "♦", 4: "♣" },
  AS: 1,
  J: 11,
  Q: 12,
  K: 13,
  SYMBOLS: { 1: "AS", 11: "J", 12: "Q", 13: "K"},

  initialize: function(options) {
    options || (options = { });
    var suit = options.suit.toString();
    var textColor = "#000";
    if (suit in this.SUITS) {
      if (parseInt(suit) == 2 || parseInt(suit) == 2) {
        textColor = "#f00";
      }
      suit = this.SUITS[suit];
    }
    var symbol = options.symbol.toString();
    if (symbol in this.SYMBOLS) {
      symbol = this.SYMBOLS[symbol];
    }
    var cardFont = "Comic Sans";
    var external = new fabric.Rect({ width: 80, height: 120, rx: 10, ry: 10, fill: "#fff", stroke: '#bbb', strokeWidth: 1 });
    var internal = new fabric.Rect({ width: 50, height: 90, rx: 10, ry: 10, fill: "#ccc" });
    internal.setGradient('fill', {
      x1: 0,
      y1: 0,
      x2: 0,
      y2: internal.height,
      colorStops: {
        0: '#ddd',
        1: '#eee'
      }
    });

    var topSuit = new fabric.Text(suit, { fill: textColor, top: -42, left: -32, fontSize: 10, fontWeight: "bold", fontFamily: cardFont });
    var bottomSuit = new fabric.Text(suit, { fill: textColor, top: 42, left: 32, angle: 180, fontSize: 10, fontWeight: "bold", fontFamily: cardFont });
    var topValue = new fabric.Text(symbol, { fill: textColor, top: -52, left: -32, fontSize: 10, fontWeight: "bold", fontFamily: cardFont });
    var bottomValue = new fabric.Text(symbol, { fill: textColor, top: 52, left: 32, angle: 180, fontSize: 10, fontWeight: "bold", fontFamily: cardFont });

    this.callSuper("initialize", [external, internal, topSuit, topValue, bottomSuit, bottomValue], options);
  },
});


var Deck = fabric.util.createClass(fabric.Group, {
  initialize: function(options) {
    options || (options = { });
    this.callSuper("initialize", [], options);
    this.cardOffset = options.cardOffset || 18;
    var cards = options.cards || [];
    for (var i in cards) {
      var card = cards[i];
      this.addCard(card);
    }
  },

  getCards: function() {
    return this.getObjects();
  },

  addCard: function(card) {
    var i = this.size();
    card.set("left", (i * this.get("cardOffset")));
    card.set("angle", (i * 2));
    this.add(card);
  },

  removeCard: function(card) {
    this.remove(card);
    return card;
  },

  moveCard: function(card, deck, parent) {
    this.removeCard(card);
    parent.add(card);
    card.set("top", this.getTop());
    card.animate("angle", 360, {
      duration: 500,
    });
    card.animate("top", deck.getTop(), {
      duration: 500,
      onChange: canvas.renderAll.bind(canvas),
      onComplete: function() {
        parent.remove(card);
        deck.addCard(card);
        canvas.renderAll();
      }
    });
  },
});
