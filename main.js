///////////////////////////////////////////////
//////////// GLOBAL VARIABLES /////////////////
var backgroundCirles = [50, 100, 150];
var maxRadius = 150;
var minRadius = 50;
var nCircles = 3;
var nodeBG = "#000000";
var nodeColor = "#ffffff";
var arrowColor = "#000000";
var circlesColor = "#000000";
var nodes = [];
var levels = [];
var maxSelects;
var minSelects;
var nodeSize = 20;
var selectedNode = null;
var dragNode = null;
var editNode = null;
var mostSelectedNode = null;
var mouseX;
var mouseY;
//////////// GLOBAL VARIABLES /////////////////
///////////////////////////////////////////////

function startGame() {
    myGameArea.start();
}

var myGameArea = {
    canvas: document.createElement("canvas"),
    start: function () {
        this.canvas.onmousemove = function (e) { handleMouseMove(e); };
        this.canvas.addEventListener('click', function(e) { onCanvasClick(e)}, false);
        this.canvas.onmousedown = function (e) { handleMouseDown(e); };
        this.canvas.onmouseup = function (e) { handleMouseUp(e); };
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        this.frameNo = 0;
        this.interval = setInterval(updateGameArea, 20);
    },
    clear: function () {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

function reOffset() {
    var BB = myGameArea.canvas.getBoundingClientRect();
    offsetX = BB.left;
    offsetY = BB.top;
}
function reSize() {
    myGameArea.canvas.width = window.innerWidth;
    myGameArea.canvas.height = window.innerHeight;
}
var offsetX, offsetY;
reOffset();
window.onscroll = function (e) { reSize(); reOffset(); }
window.onresize = function (e) { reSize(); reOffset(); }

function updateGameArea() {
    myGameArea.clear();
    myGameArea.frameNo += 1;
    if (myGameArea.frameNo == 1 || everyinterval(150)) {

    }
    
    for (var i = 0; i < nCircles; i++){
        DrawCircle(minRadius + ((i) * (maxRadius-minRadius) / (nCircles-1)));
    }

    UpdateSelects();
    UpdateLevels();

    if (dragNode != null) MoveNode(dragNode);

    DrawNodes();
    DrawArrows();
}

function everyinterval(n) {
    if ((myGameArea.frameNo / n) % 1 == 0) { return true; }
    return false;
}

function AddRegister() {
    let id = document.getElementById("rId").value;
    var node = FindNode(id);
    if (node == null) {
        node = new Node(id, 0, 0);
        nodes.push(node);
    }
    let selects = document.getElementById("rSelect").value.replace(/\s/g, '');
    if (selects.length > 0) {
        selects = selects.split(",");
        for (var i = 0; i < selects.length; i++) {
            let sNode = FindNode(selects[i]);
            if (sNode == null) {
                sNode = new Node(selects[i], 1, 0);
                nodes.push(sNode);
            }
            else sNode.selects++;
        }
        node.selectsTo = selects;
    }
}

function DrawCircle(radius) {
    let ctx = myGameArea.canvas.getContext("2d");
    let centerX = myGameArea.canvas.width / 2;
    let centerY = myGameArea.canvas.height / 2;
    ctx.strokeStyle = circlesColor;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.stroke();
}

function UpdateLevels() {
    for (var i = 0; i < levels.length; i++) levels[i].nodes = [];
    maxSelects = 0;
    minSelects = Infinity;
    for (var i = 0; i < nodes.length; i++) {
        let level = FindLevel(nodes[i].selects);
        if (level == null) {
            level = new Level(nodes[i].selects);
            levels.push(level);
        }
        level.nodes.push(nodes[i]);
        nodes[i].level = level;
        if (nodes[i].selects > maxSelects) maxSelects = nodes[i].selects;
        if (nodes[i].selects < minSelects) minSelects = nodes[i].selects;
    }
}

function UpdateSelects() {
    for (var i = 0; i < nodes.length; i++) nodes[i].selects = 0;
    for (var i = 0; i < nodes.length; i++) {
        let n = nodes[i];
        for (var j = 0; j < n.selectsTo.length; j++) {
            let s = FindNode(n.selectsTo[j]);
            if (s == null) {
                s = new Node(n.selectsTo[j]);
                nodes.push(s);
            }
            s.selects++;
        }
    }
}

function DrawNodes() {
    for (var i = 0; i < levels.length; i++) levels[i].nPos = 0;
    mostSelectedNode = null;
    for (var i = 0; i < nodes.length; i++) {
        let n = nodes[i];
        n.radius = maxRadius - (n.selects * (maxRadius - minRadius) / maxSelects);
        if (n.selects == maxSelects && n.level.nodes.length == 1) {
            n.radius = 0;
            mostSelectedNode = n;
        } 
        n.angle = n.level.nPos * 360 / n.level.nodes.length;
        n.level.nPos++
        DrawNode(n);
    }
}

function DrawNode(node) {
    let ctx = myGameArea.canvas.getContext("2d");
    let centerX = myGameArea.canvas.width / 2;
    let centerY = myGameArea.canvas.height / 2;
    let angle = node.forcedAngle != null ? node.forcedAngle : node.angle;
    node.posX = Math.cos(angle * Math.PI / 180) * node.radius + centerX;
    node.posY = Math.sin(angle * Math.PI / 180) * node.radius + centerY;
    ctx.fillStyle = nodeBG;
    ctx.fillRect(node.posX - nodeSize / 2, node.posY - nodeSize / 2, nodeSize, nodeSize);
    ctx.font = "15px Arial";
    ctx.fillStyle = nodeColor;
    ctx.textAlign = "center";
    ctx.fillText(node.id, node.posX, node.posY + 5);
}

function MoveNode(node) {
    let centerX = myGameArea.canvas.width / 2;
    let centerY = myGameArea.canvas.height / 2;
    let dx = mouseX - centerX;
    let dy = mouseY - centerY;
    let mag = Math.sqrt(dx * dx + dy * dy);
    dx = node.radius * dx/mag;
    dy = node.radius * dy/mag;
    node.forcedAngle = (dy < 0 ? -1 : 1) * Math.acos(dx/node.radius) / (Math.PI/180);
}

function DrawArrows() {
    let ctx = myGameArea.canvas.getContext("2d");
    for (var i = 0; i < nodes.length; i++) {
        let n = nodes[i];
        for (var j = 0; j < n.selectsTo.length; j++) {
            let s = FindNode(n.selectsTo[j]);
            let dx = s.posX - n.posX;
            let dy = s.posY - n.posY;
            let dmag = Math.sqrt(dx * dx + dy * dy);
            dx = dx / dmag;
            dy = dy / dmag;
            let u = nodeSize * 0.6;
            if (s != null) drawArrow(ctx, n.posX + dx * u, n.posY + dy * u, s.posX - dx * u, s.posY - dy * u, 2, "#000000");
        }
    }
}

function FindNode(id) {
    for (var i = 0; i < nodes.length; i++) {
        if (nodes[i].id == id) return nodes[i];
    }
    return null;
}

function UpdateNode() {
    if (editNode != null) {
        let angle = document.getElementById("nodeAngle").value;
        angle = Number(angle);
        if (editNode.angle != angle) editNode.forcedAngle = angle;
        let selects = document.getElementById("nodeSelects").value.replace(/\s/g, '');
        if (selects.length > 0) {
            editNode.selectsTo = selects.split(",");
            for (var i = 0; i < editNode.selectsTo.length; i++) {
                let sNode = FindNode(editNode.selectsTo[i]);
                if (sNode == null) {
                    sNode = new Node(editNode.selectsTo[i], 1, 0);
                    nodes.push(sNode);
                }
            }
        }
    }
}

function ResetNode() {
    if (editNode != null) {
        document.getElementById("nodeAngle").value = editNode.angle;
        editNode.forcedAngle = null;
    }
}

function UpdateChart() {
    maxRadius = Number(document.getElementById("maxRadius").value);
    minRadius = Number(document.getElementById("minRadius").value);
    nCircles = Number(document.getElementById("nCircles").value);
    nodeSize = Number(document.getElementById("nodeSize").value);
    nodeBG = document.getElementById("nodeBG").value;
    nodeColor = document.getElementById("nodeColor").value;
    arrowColor = document.getElementById("arrowColor").value;
    circlesColor = document.getElementById("circlesColor").value;
}

function ResetChart() {
    maxRadius = 150;
    minRadius = 50;
    nCircles = 3;
    document.getElementById("maxRadius").value = 150;
    document.getElementById("minRadius").value = 50;
    document.getElementById("nCircles").value = 3;
}

function FindLevel(count) {
    for (var i = 0; i < levels.length; i++) {
        if (levels[i].count == count) return levels[i];
    }
    return null;
}

function drawArrow(ctx, fromx, fromy, tox, toy, arrowWidth, color) {
    //variables to be used when creating the arrow
    var headlen = 10;
    var angle = Math.atan2(toy - fromy, tox - fromx);

    ctx.save();
    ctx.strokeStyle = arrowColor;

    //starting path of the arrow from the start square to the end square
    //and drawing the stroke
    ctx.beginPath();
    ctx.moveTo(fromx, fromy);
    ctx.lineTo(tox, toy);
    ctx.lineWidth = arrowWidth;
    ctx.stroke();

    //starting a new path from the head of the arrow to one of the sides of
    //the point
    ctx.beginPath();
    ctx.moveTo(tox, toy);
    ctx.lineTo(tox - headlen * Math.cos(angle - Math.PI / 7),
        toy - headlen * Math.sin(angle - Math.PI / 7));

    //path from the side point of the arrow, to the other side point
    ctx.lineTo(tox - headlen * Math.cos(angle + Math.PI / 7),
        toy - headlen * Math.sin(angle + Math.PI / 7));

    //path from the side point back to the tip of the arrow, and then
    //again to the opposite side point
    ctx.lineTo(tox, toy);
    ctx.lineTo(tox - headlen * Math.cos(angle - Math.PI / 7),
        toy - headlen * Math.sin(angle - Math.PI / 7));

    //draws the paths created above
    ctx.stroke();
    ctx.restore();
}

function handleMouseMove(e) {
    // tell the browser we're handling this event
    e.preventDefault();
    e.stopPropagation();

    mouseX = parseInt(e.clientX - offsetX);
    mouseY = parseInt(e.clientY - offsetY);

    if (dragNode == null) {
        var isPointer = false;
        for (var i = 0; i < nodes.length; i++) {
            let n = nodes[i];
            if (mouseX > n.posX - nodeSize/2 && mouseX < n.posX + nodeSize/2 && mouseY > n.posY - nodeSize/2 && mouseY < n.posY + nodeSize/2) {
                isPointer = true;
                selectedNode = n;
                break;
            }
        }
        if (isPointer) myGameArea.canvas.style.cursor = "pointer";
        else {
            myGameArea.canvas.style.cursor = "default";
            selectedNode = null;
        }
    }
}

function handleMouseDown() {
    if (selectedNode != null && selectedNode != mostSelectedNode) {
        dragNode = selectedNode;
        myGameArea.canvas.style.cursor = "move";
    }
}

function handleMouseUp() {
    dragNode = null;
    myGameArea.canvas.style.cursor = "default";
}

function onCanvasClick(e) {
    if (selectedNode != null) {
        document.getElementById("nodeOptions").innerHTML = "Opciones del nodo " + selectedNode.id + ":";
        document.getElementById("nodeAngle").value = selectedNode.forcedAngle != null ? selectedNode.forcedAngle : selectedNode.angle
        let nSelects = "";
        for (var i = 0; i < selectedNode.selectsTo.length; i++) nSelects += selectedNode.selectsTo[i] + ",";
        nSelects = nSelects.substring(0, nSelects.length - 1);
        document.getElementById("nodeSelects").value = nSelects;
        editNode = selectedNode;
    }
}

function ToggleHideReveal() {
    var menu = document.getElementById("menu_content");
    if (menu.style.display == "none") {
        menu.style.display = "flex";
        document.getElementById("menuHideButton").innerHTML = "<i class='bi bi-chevron-compact-down'></i>";
        document.getElementById("menuHideButton").classList.add("btnHide");
        document.getElementById("menuHideButton").classList.remove("btnHideCollapsed");
    }
    else {
        menu.style.display = "none";
        document.getElementById("menuHideButton").innerHTML = "<i class='bi bi-chevron-compact-up'></i>";
        document.getElementById("menuHideButton").classList.remove("btnHide");
        document.getElementById("menuHideButton").classList.add("btnHideCollapsed");
    }
}