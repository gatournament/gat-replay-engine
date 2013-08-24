if (!String.prototype.trim) {
  String.prototype.trim=function(){ return this.replace(/^\s+|\s+$/g, ""); };
  String.prototype.ltrim=function(){ return this.replace(/^\s+/,""); };
  String.prototype.rtrim=function(){ return this.replace(/\s+$/,""); };
  String.prototype.fulltrim=function(){ return this.replace(/(?:(?:^|\n)\s+|\s+(?:$|\n))/g,"").replace(/\s+/g," "); };
}


var GATReplay = fabric.util.createClass(fabric.Group, {
  type: "Replay",

  initialize: function(players, commands, options) {
    options || (options = { width: canvas.width, height: canvas.height });
    this.callSuper("initialize", [], options);
    players = players || [];
    this.commands = commands || [];
    this.players = {}
    for (var i in players) {
      var component = this._playerComponent(players[i]);
      this.players[players[i]] = component;
      this.addWithUpdate(component);
    }
    this._timeBetweenCommands = 1000; // in ms
    this._currentCommand = 0;
    this._execution = null;
  },

  _playerComponent: function(player) {
    var p = Object.keys(this.players).length;
    var textOptions = {
      fontFamily: "Comic Sans",
      fontSize: 20,
      fontStyle: "italic",
      fill: "#fff",
      textShadow: 'rgba(0,0,0,0.3) 1px 1px 1px',
      padding: 10,
    };
    var playerName = new fabric.Text(player, textOptions);
    var left = 0;
    var top = 0;
    switch(p) {
      case 0:
        left = -200;
        var playerArea = new fabric.Group([], { top: -200 });
        break;
      case 1:
        left = -200;
        var playerArea = new fabric.Group([], { top: 200 });
        break;
      case 2:
        top = -200;
        var playerArea = new fabric.Group([], { left: -200 });
        break;
      case 3:
        top = -200;
        var playerArea = new fabric.Group([], { left: 200 });
        break;
      default:
        var playerArea = new fabric.Group([], { });
        break;
    }
    playerName.left = left;
    playerName.top = top;
    playerArea.add(playerName);
    return playerArea;
  },

  _nextCommand: function() {
    if (this.commands != undefined && this.commands != null && this._currentCommand < this.commands.length) {
      return this.commands[this._currentCommand];
    } else {
      return null;
    }
  },

  play: function() {
    if (this._execution != null) return;
    var that = this;
    function processCommand() {
        var command = that._nextCommand();
        if (command != null) {
          that._applyCommand(command);
          that._currentCommand += 1;
          that._execution = setTimeout(processCommand, that._timeBetweenCommands);
        } else {
          that.pause();
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
    this._timeBetweenCommands = Math.max(this._timeBetweenCommands - 100, 100);
  },

  decreaseSpeed: function() {
    this._timeBetweenCommands = Math.min(this._timeBetweenCommands + 100, 3000);
  },

  _applyCommand: function(command) {
    // console.debug(command);
    args = "";
    if (command.args)
      args = JSON.stringify(command.args);
    var player = "";
    if (command.player) {
      player = command.player + ": ";
    }
    console.debug(player + command.name + "(" + args + ")");
    switch(command.name) {
      case "StartGame":
        this._startGame(command);
        break;
      case "StartRound":
        this._startRound(command);
        break;
      case "EndRound":
        this._endRound(command);
        break;
      case "EndGame":
        this._endGame(command);
        break;
      default:
        if (this.type === "Replay") {
          var player = this.players[command.player];
          if (player) {
            this._addPlayerMessage(command.name, player.left, player.top);
          }
        }
        this._applyCustomCommand(command);
        break;
    }
  },

  _applyCustomCommand: function(command) {
  },

  _startGame: function(command) {
    this._addGameMessage(this.type);
  },

  _startRound: function(command) {
    this._addGameMessage('new round');
  },

  _endRound: function(command) {
  },

  _endGame: function(command) {
    var winner = command.winner || '';
    var loser = command.loser || '';
    this._addGameMessage("Winner: " + winner + " Loser: " + loser);
  },

  _addGameMessage: function(msg) {
    var options = {
      fontFamily: "Comic Sans",
      fontSize: 50,
      fontWeight: "bold",
      fill: "#fff",
      stroke: '#fff',
      strokeWidth: 2,
      opacity: 0,
      textShadow: 'rgba(0,0,0,0.3) 5px 5px 5px',
    }
    this._addTempMessage(msg, options);
  },

  _addPlayerMessage: function(msg, left, top) {
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
      width: 250,
      height: 40,
      fill: "#fff",
      backgroundColor: "#fff",
      rx: 10,
      ry: 10,
      stroke: '#bbb',
      strokeWidth: 1,
    };
    this._addTempMessage(msg, options, backgroundOptions);
  },

  _addTempMessage: function(msg, options, backgroundOptions) {
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
    this.suit = suit;
    this.symbol = symbol;
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
  type: "Deck",

  initialize: function(options) {
    options || (options = { });
    this.callSuper("initialize", [], options);
    if (options.text) {
      var textOptions = {
        left: -100,
        fontFamily: "Comic Sans",
        fontSize: 20,
        fontStyle: "italic",
        fill: "#fff",
        textShadow: 'rgba(0,0,0,0.3) 1px 1px 1px',
        padding: 10,
      };
      this.add(new fabric.Text(options.text, textOptions));
    }
    this.cardOffset = options.cardOffset || 18;
    var cards = options.cards || [];
    for (var i in cards) {
      var card = cards[i];
      this.addCard(card);
    }
  },

  getNextOffset: function() {
    return this.size() * this.get("cardOffset");
  },

  getCards: function() {
    return this.getObjects();
  },

  getCard: function(suit, symbol) {
    var cards = this.getCards();
    for (var i in cards) {
      var card = cards[i];
      if (card.suit == suit && card.symbol == symbol) {
        return card;
      }
    }
    return null;
  },

  addCards: function(cards) {
    for (var i in cards) {
      var card = cards[i];
      this.addCard(new Card({suit: card.suit, symbol: card.symbol}));
    }
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

  removeAll: function() {
    var cards = this.getCards();
    for (var i = cards.length - 1; i >= 0; i--) {
      if (cards[i].type != "text") {
        this.removeCard(cards[i]);
      }
    }
    canvas.renderAll();
  },

  moveCard: function(card, deck) {
    var parent = this.group;
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
