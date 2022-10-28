class Node {
    constructor(id, selects, fails) {
      this.id = id;
      this.selects = selects;
      this.fails = fails;
      this.selectsTo = [];
      this.failsTo = [];
      this.angle = 0
      this.forcedAngle = null;
      this.radius = 0;
      this.level = null;
      this.posX = 0;
      this.posY = 0;
    }
  }