class Level {
    constructor(count) {
      this.count = count;
      this.nodes = [];
    }

    findNode() {
        for (var i = 0; i < this.nodes.length; i++) {
            if (this.nodes[i].id == id) return this.nodes[i];
        }
        return null;
    }
  }