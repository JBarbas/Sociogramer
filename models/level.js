class Level {
    constructor(count) {
      this.count = count;
      this.levelNodes = [];
    }

    findNode() {
        for (var i = 0; i < this.levelNodes.length; i++) {
            if (this.levelNodes[i].id == id) return this.levelNodes[i];
        }
        return null;
    }
  }