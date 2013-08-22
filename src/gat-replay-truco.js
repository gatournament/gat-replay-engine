var Truco = fabric.util.createClass(GATReplay, {
  initialize: function(options) {
    var card1 = new Card({ suit: 1, symbol: 1 });
    var card2 = new Card({ suit: 2, symbol: 11 });
    var card3 = new Card({ suit: 3, symbol: 12 });
    var card4 = new Card({ suit: 4, symbol: 13 });
    var card5 = new Card({ suit: 1, symbol: 5 });
    var card6 = new Card({ suit: 2, symbol: 6 });
    var card7 = new Card({ suit: 2, symbol: 8 });

    var card_height = 120;
    var offset = 20;
    this.player1 = new Deck({ top: 0, cards: [card1, card2, card3] });
    this.player2 = new Deck({ top: 2*(card_height+offset), cards: [card4, card5, card6] });
    this.table = new Deck({ width: 200, height: 200, top: 1*(card_height+offset), backgroundColor: "#ddd", cards: [card7] });
    this.centerCard = new Card({ top: 1*(card_height+offset), left: -200, suit: 2, symbol: 6 });
    options.panels = [this.player1, this.player2, this.table, this.centerCard];
    this.callSuper('initialize', options);
  },

  start: function() {
  },

  _applyCommand: function(command) {
    this.callSuper('_applyCommand', command);
    switch(command.name) {
        case "Upcard":
            var tokens = command.args[0].split("-");
            var suit = tokens[0];
            var symbol = tokens[1];
            this._upcard('player1', suit, symbol);
            break;
        case "Truco":
            this.addPlayerMessage("Truco!", this.player1.left, this.player1.top);
            break;
        case "AcceptTruco":
            this.addPlayerMessage("Truco accepted!", this.player1.left, this.player1.top);
            break;
        case "RejectTruco":
            this.addPlayerMessage("I do not accept the Truco!", this.player1.left, this.player1.top);
            break;
    }
  },

  _upcard: function(player, suit, symbol) {
    var card = this.player1.getCards()[0];
    this.player1.moveCard(card, this.table, this);
  },

  _end: function() {
  },
});
