var Truco = fabric.util.createClass(GATReplay, {
  type: "Truco",

  initialize: function(players, commands, options) {
    this.callSuper('initialize', players, commands, options);
    this.table = new Deck({ width: 200, height: 200, fill: "#ddd" });
    this.centerCard = new Deck({ left: -180 });
    this.add(this.table);
    this.add(this.centerCard);
  },

  _playerComponent: function(player) {
    var p = Object.keys(this.players).length;
    switch(p) {
      case 0:
        return new Deck({ top: -175, text: player });
      case 1:
        return new Deck({ top: 175, text: player });
      case 2:
        return new Deck({ left: -400, text: player });
      case 3:
        return new Deck({ left: 220, text: player });
      default:
        return new Deck({ });
    }
  },

  _applyCustomCommand: function(command) {
    var player = this.players[command.player];
    switch(command.name) {
        case "Upcard":
            var card = command.args.card;
            this._upcard(player, card.suit, card.symbol);
            break;
        case "Truco":
            this._addPlayerMessage("Truco!", player.left, player.top);
            break;
        case "Accept":
            this._addPlayerMessage("Truco accepted!", player.left, player.top);
            break;
        case "Reject":
            this._addPlayerMessage("I do not accept the Truco!", player.left, player.top);
            break;
    }
  },

  _startRound: function(command) {
    this.callSuper('_startRound', command);
    players = this.getPlayers();
    for (var i in players) {
      var player = players[i];
      this.players[player].addCards(command.args[player]);
    }
    this.centerCard.addCards([command.args.center_card]);
  },

  _endRound: function(command) {
    for (var i in this.players) {
        this.players[i].removeAll();
    }
    this.centerCard.removeAll();
    this.table.removeAll();
  },

  _upcard: function(player, suit, symbol) {
    var card = player.getCard(suit, symbol);
    player.moveCard(card, this.table);
  },

});
