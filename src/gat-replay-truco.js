var Truco = fabric.util.createClass(GATReplay, {
  type: "truco",

  initialize: function(options) {
    var card_height = 120; // TODO create Card class variable
    var offset = 20;
    var p1 = new Deck({ top: 0 });
    var p2 = new Deck({ top: 2 * (card_height + offset)});
    this.table = new Deck({ width: 200, height: 200, top: (card_height + offset), backgroundColor: "#ddd" });
    this.centerCard = new Deck({ top: 1*(card_height+offset), left: -200});
    options.panels = [p1, p2, this.table, this.centerCard];
    this.callSuper('initialize', options);
    this.players = {"p1": p1 , "p2": p2 };
  },

  _applyCustomCommand: function(command) {
    var player = this.players[command.player];
    switch(command.name) {
        case "upcard":
            var card = command.args.card;
            this._upcard(player, card.suit, card.symbol);
            break;
        case "truco":
            this._addPlayerMessage("Truco!", player.left, player.top);
            break;
        case "accept":
            this._addPlayerMessage("Truco accepted!", player.left, player.top);
            break;
        case "reject":
            this._addPlayerMessage("I do not accept the Truco!", player.left, player.top);
            break;
    }
  },

  _startRound: function(command) {
    this.callSuper('_startRound', command);
    var player1 = this.players["p1"];
    var player2 = this.players["p2"];
    player1.addCards(command.args.p1);
    player2.addCards(command.args.p2);
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
