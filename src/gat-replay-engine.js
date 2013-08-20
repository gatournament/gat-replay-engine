var GATReplay = fabric.util.createClass(fabric.Object, {
  initialize: function(options) {
    this.callSuper('initialize', options);
    this.commands = null;
    this._timeBetweenCommands = 1000; // in ms
    this._currentCommand = 0;
    this._execution = null;
  },

  nextCommand: function() {
    if (this.commands != null && this._currentCommand < this.commands.length) {
      return this.commands[this._currentCommand];
    } else {
      return null;
    }
  },

  play: function() {
    if (this._execution != null) return;
    this._execution = setInterval(function() {
      var command = this.nextCommand();
      if (command != null) {
        this.applyCommand(command);
        this._currentCommand += 1;
      } else {
        this.pause();
        this.end();
        this.stop();
      }
    }, this._timeBetweenCommands);
  },

  pause: function() {
    if (this._execution != null) {
      clearInterval(this._execution);
      this._execution = null;
    }
  },

  stop: function() {
    if (this._execution != null) {
      clearInterval(this._execution);
      this._execution = null;
    }
    this._currentCommand = 0;
  },

  increaseVelocity: function() {
    this._timeBetweenCommands = Math.min(this._timeBetweenCommands - 100, 100);
  },

  decreaseVelocity: function() {
    this._timeBetweenCommands = Math.max(this._timeBetweenCommands + 100, 5000);
  },

  start: function() {
  },

  _applyCommand: function(command) {
  },

  _end: function() {
  },
});