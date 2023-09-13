const WIDTH = 450;
const HEIGHT = 800;
const ITEM_PROBABILITY = 10;
const NOISE = 5;
const SUB_NOISE = 1;

let soundBallHit, imgItem0, imgItem1, imgItem2, imgItem3, imgItem4, imgItem5;

function setup() {
    soundFormats('mp3');
    soundBallHit = [ loadSound('./assets/sound/hit1.mp3')];
    createCanvas(WIDTH, HEIGHT);
    frameRate(60);
    imgItem0 = loadImage('assets/img/item/0.png');
    imgItem1 = loadImage('assets/img/item/1.png');
    imgItem2 = loadImage('assets/img/item/2.png');
    imgItem3 = loadImage('assets/img/item/3.png');
    imgItem4 = loadImage('assets/img/item/4.png');
    imgItem5 = loadImage('assets/img/item/5.png');
    noStroke();

    drawingContext.shadowOffsetX = 0;
    drawingContext.shadowOffsetY = 0;
    drawingContext.shadowBlur = 30;
    drawingContext.shadowColor = "#ffffff";
}

/* game */
let scene = 0; /* 0: start, 1: main */
let ball = [];
let items = [];
let map, player;
let filerBall = [];
let filerItems = [];


/* function */
function checkMousePosition(minX, maxX, minY, maxY) {
    if (minX <= mouseX && mouseX <= maxX && minY <= mouseY && mouseY <= maxY) {
        return true
    } else {
        return false
    }
}

function startSetUp() {
    map = new MapMain();
    player = new PlayerMain(200, 720, 40);
    map.createMapData();
    ball = [];
    // const _pushBall = new BallMain(WIDTH / 2, 700, 0, -1);
    const _pushBall = new BallMain(WIDTH / 2, 700, Math.floor(Math.random() * 9) - 4, -3);
    ball.push(_pushBall);
    scene = 1;
}

function mapSliceLengthwise(map, edge_size) {
    /* 縦 */
    let border = Math.floor(Math.random() * (map[0].length - edge_size - edge_size)) + edge_size;
    let resultMap = [];

    let leftArea = [];
    let rightArea = [];
    map.map((item) => {
        var blockA = [];
        var blockB = [];
        item.map((block, w) => {
            if (w > border) {
                blockA.push(block)
            } else {
                blockB.push(block)
            }
        })
        leftArea.push(blockA);
        rightArea.push(blockB);
    })

    resultMap.push(leftArea);
    resultMap.push(rightArea);

    return resultMap;
}

function joinLengthwiseArray(mapA, mapB) {
    /* 横 join */
    return mapA.concat(mapB);
}

function mapSliceHorizontal(map, edge_size) {
    /* 横 */
    const _border = Math.floor(Math.random() * (map.length - edge_size - edge_size)) + edge_size;
    let resultMap = [];

    const topArea = map.slice(0, _border);
    const bottomArea = map.slice(_border, map.length);

    resultMap.push(topArea);
    resultMap.push(bottomArea);

    return resultMap;
}

function joinHorizontalArray(mapR, mapL) {
    /* 横 join */
    let resultMap = [];
    for (let i = 0; i < mapR.length; i++) {
        let pushTmpArrayRightArea = []
        for (let l = 0; l < mapR[0].length; l++) {
            pushTmpArrayRightArea.push(mapR[i][l])
        }
        for (let k = 0; k < mapL[0].length; k++) {
            pushTmpArrayRightArea.push(mapL[i][k])
        }
        resultMap.push(pushTmpArrayRightArea);
    }
    return resultMap;
}

function makeMapBorder(target) {
    const resultMapArray = mapSliceLengthwise(target, 10);

    let leftArea = resultMapArray[0];
    let rightArea = resultMapArray[1];

    const randomBorderLine = 0;

    if (randomBorderLine == 0) {
        /* # slice block */

        /* - left 横 */
        const resultLeftMap = mapSliceHorizontal(leftArea, 5);
        let leftTop = resultLeftMap[0];
        let leftBottom = resultLeftMap[1];

        /* - right 縦 */
        const resultRightMap = mapSliceLengthwise(rightArea, 5);
        let rightLeft = resultRightMap[0];
        let rightRight = resultRightMap[1];


        /* # generate block */
        const generateBlock = (targetArea) => {
            let newArea = targetArea.map((array, h) => {
                var proximity_to_centerY = 1 / (2 * ((Math.abs((h + 1) - ((targetArea.length + 1) / 2))) / ((targetArea.length + 1) / 2)) + 1);
                let _returnArray;
                if (h != 0 && h != targetArea.length - 1) {
                    _returnArray = array.map((_, w) => {
                        if (w != 0 && w != array.length - 1) {
                            var proximity_to_centerX = 1 / (2 * ((Math.abs((w + 1) - ((array.length + 1) / 2))) / ((array.length + 1) / 2)) + 1);
                            const blockValue = Math.floor(proximity_to_centerX * proximity_to_centerY * 4 * ((Math.random() * (1.2 + 1 - 0.82)) + 0.82))
                            if (blockValue > 4) {
                                return 4;
                            } else {
                                return blockValue;
                            }
                        } else {
                            return 0;
                        }
                    })
                } else {
                    _returnArray = array.map(() => {
                        return 0;
                    })
                }
                return _returnArray;
            })
            return newArea;
        }

        /* - leftTop */
        const resultLeftTopMApArray = mapSliceLengthwise(leftTop, 5);
        let newLeftTop = joinHorizontalArray(generateBlock(resultLeftTopMApArray[0]), generateBlock(resultLeftTopMApArray[1]));
        /* - leftBottom */
        const resultLeftBottomMApArray = mapSliceHorizontal(leftBottom, 5);
        let newLeftBottom = joinLengthwiseArray(generateBlock(resultLeftBottomMApArray[0]), generateBlock(resultLeftBottomMApArray[1]));
        /* - rightLeft */
        const resultRightLeftMApArray = mapSliceHorizontal(rightLeft, 5);
        let newRightLeft = joinLengthwiseArray(generateBlock(resultRightLeftMApArray[0]), generateBlock(resultRightLeftMApArray[1]));
        /* - rightRight */
        const resultRightRightMApArray = mapSliceLengthwise(rightRight, 5);
        let newRightRight = joinHorizontalArray(generateBlock(resultRightRightMApArray[0]), generateBlock(resultRightRightMApArray[1]));


        /* # union all */
        let allAreaArray = joinHorizontalArray(joinLengthwiseArray(newLeftTop, newLeftBottom), joinHorizontalArray(newRightLeft, newRightRight));

        /* # return all */
        return allAreaArray;
    }
}

const playHitSound = () => {
    const random_number = Math.floor(Math.random() * (soundBallHit.length));
    
    soundBallHit[random_number].play();
}


/* class */
class BallMain {
    constructor(positionX, positionY, directionX, directionY) {
        this.ballX = positionX;
        this.ballY = positionY;
        this.accelerationX = directionX;
        this.accelerationY = directionY;
    }
    update(player, map, sequence) {
        /* wall */
        if (WIDTH <= this.ballX + 4 || this.ballX - 4 <= 0) {
            playHitSound();
            this.accelerationX = this.accelerationX * (-1);
        }
        if (this.ballY - 4 <= 0) {
            playHitSound();
            this.accelerationY = this.accelerationY * (-1);
        }
        if (HEIGHT < this.ballY + 4) {
            filerBall.push(sequence);
        }
        /* player x */
        var _playerX = player.displayX();
        var _playerY = player.displayY();
        var _playerS = player.displaySize();
        if (_playerX <= this.ballX + 4 && this.ballX - 4 <= _playerX + _playerS && ((_playerY <= this.ballY + 4 && this.ballY + 4 <= _playerY + 6) || (this.ballY - 4 <= _playerY + 6 && this.ballY - 6 >= _playerY + 6))) {
            playHitSound();

            let differenceX = this.ballX - _playerX;

            let _x = (2 * (differenceX - (_playerS / 2)) / _playerS) * 100;

            if (this.accelerationX < 0) {
                _x = _x * (-1);
            }

            this.accelerationX = this.accelerationX * (((_x ** 3) / 1000000) + 1);
            this.accelerationY = ((-1) * this.accelerationY) * (((_x ** 2) / 20000) + 0.8);
        }
        /* block */
        if (map.checkX(this.ballX, this.ballY)) {
            const probability_getting_item = Math.floor(Math.random() * ITEM_PROBABILITY);
            if (probability_getting_item == 0) {
                let _pushItemClass = new ItemMain(this.ballX, this.ballY);
                items.push(_pushItemClass);
            }
            playHitSound();
            this.accelerationX = this.accelerationX * (-1);
        }
        if (map.checkY(this.ballX, this.ballY)) {
            const probability_getting_item = Math.floor(Math.random() * ITEM_PROBABILITY);
            if (probability_getting_item == 0) {
                let _pushItemClass = new ItemMain(this.ballX, this.ballY);
                items.push(_pushItemClass);
            }
            playHitSound();
            this.accelerationY = this.accelerationY * (-1);
        }
        this.ballX += this.accelerationX;
        this.ballY += this.accelerationY;
    }
    draw() {
        fill(150);
        circle(this.ballX, this.ballY, 8);
    }
    returnDetail() {
        return [this.ballX, this.ballY, this.accelerationX, this.accelerationY];
    }
}

class MapMain {
    constructor() {
        this.mapData = [];
        /* 1ブロック: 10 * 10(ピクセル), map: 45 * 60(個) */
    }
    draw() {
        this.mapData.map((array, h) => {
            array.map((block, w) => {
                if (block == 1) {
                    fill(color(255, 255, 255, 50));
                    rect(w * 10 + 2, h * 10 + 2, 6, 6);
                } else if (block == 2) {
                    fill(color(255, 255, 255, 62.5));
                    rect(w * 10 + 2, h * 10 + 2, 6, 6);
                } else if (block == 3) {
                    fill(color(255, 255, 255, 75));
                    rect(w * 10 + 2, h * 10 + 2, 6, 6);
                } else if (block == 4) {
                    fill(color(255, 255, 255, 100));
                    rect(w * 10 + 2, h * 10 + 2, 6, 6);
                }
            })
        })
    }
    checkX(x, y) {
        if (0 < Math.floor((y - 6) / 10) && Math.floor((y - 6) / 10) <= this.mapData.length - 2) {
            let rightMapBlock = this.mapData[Math.floor(y / 10)][Math.floor((x + 4) / 10)]
            let leftMapBlock = this.mapData[Math.floor(y / 10)][Math.floor((x - 4) / 10)]
            if (rightMapBlock == 1 || rightMapBlock == 2 || rightMapBlock == 3 || rightMapBlock == 4) {
                this.mapData[Math.floor(y / 10)][Math.floor((x + 4) / 10)] -= 1;
                return true;
            } else if (leftMapBlock == 1 || leftMapBlock == 2 || leftMapBlock == 3 || leftMapBlock == 4) {
                this.mapData[Math.floor(y / 10)][Math.floor((x - 4) / 10)] -= 1;
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }
    checkY(x, y) {
        if (0 < Math.floor((y - 6) / 10) && Math.floor((y - 6) / 10) <= this.mapData.length - 2) {
            if (this.mapData[Math.floor((y + 4) / 10)][Math.floor(x / 10)] == 1) {
                this.mapData[Math.floor((y + 4) / 10)][Math.floor(x / 10)] -= 1;
                return true;
            } else if (this.mapData[Math.floor((y - 4) / 10)][Math.floor(x / 10)] == 1) {
                this.mapData[Math.floor((y - 4) / 10)][Math.floor(x / 10)] -= 1;
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }
    createMapData() {
        let newData = [...Array(60)].map((_a, i) => {
            let _tmp = [...Array(45)].map((_b, l) => { 
                // const data = Math.floor(noise(l * NOISE) * i) * SUB_NOISE;
                return 0;
            });
            return _tmp;
        })

        /* min: 0 + 10, max: 30 - 10 */
        const firstBorderA = Math.floor(Math.random() * (20 - 10)) + 10;
        /* 30 */
        const firstBorderB = 30;
        /* min: 30 + 10, max: 60 - 10 */
        const firstBorderC = Math.floor(Math.random() * (50 - 40)) + 40;

        let areaA = makeMapBorder(newData.slice(0, firstBorderA));
        let areaB = makeMapBorder(newData.slice(firstBorderA + 1, firstBorderB));
        let areaC = makeMapBorder(newData.slice(firstBorderB + 1, firstBorderC - 1));
        let areaD = makeMapBorder(newData.slice(firstBorderC, 60));


        this.mapData = areaA.concat(areaB).concat(areaC).concat(areaD);
        // this.mapData = newData;
    }
    displayRemaining() {
        let result = 0;
        this.mapData.map((array) => {
            let _value = 0;
            array.map((block) => {
                if (block != 0) {
                    _value += 1;
                }
            })
            result += _value;
        })
        return result;
    }
}

class PlayerMain {
    constructor(x, y, size) {
        this.playerX = x;
        this.playerY = y;
        this.playerSize = size;
    }
    update(scene) {
        fill(33);
        rect(this.playerX, this.playerY, this.playerSize, 6);
        if (scene == 1) {
            this.playerX = mouseX - this.playerSize / 2;
        }
    }
    displayX() {
        return this.playerX;
    }
    displayY() {
        return this.playerY;
    }
    displaySize() {
        return this.playerSize;
    }
    ifYouCallThisFunctionTheSizeOfThePlayerWillChange(value) {
        this.playerSize = this.playerSize * value
    }
}

class ItemMain {
    constructor(x, y) {
        this.type = Math.floor(Math.random() * 6);
        this.itemX = x;
        this.itemY = y;
        this.speed = Math.floor(Math.random() * 5) + 6;
    }
    /* 半径 10px */
    update(player, ball, sequence) {
        if (player.displayY() < this.itemY + 10 && this.itemY - 10 < player.displayY() + 10 && player.displayX() < this.itemX + 10 && this.itemX - 10 < player.displayX() + player.displaySize()) {
            if (this.type == 0) {
                for (let i = 0; i < 3; i++) {
                    const _add_ball = new BallMain(player.displayX() + (player.displaySize() / 2), 710, (4 * i) - 4, -3);
                    ball.push(_add_ball)
                }
            } else if (this.type == 1) {
                for (let i = 0; i < 5; i++) {
                    const _add_ball = new BallMain(player.displayX() + (player.displaySize() / 2), 710, (2 * i) - 4, -3);
                    ball.push(_add_ball)
                }
            } else if (this.type == 2) {
                for (let i = 0; i < 7; i++) {
                    const _add_ball = new BallMain(player.displayX() + (player.displaySize() / 2), 710, Math.floor(Math.random() * 9) - 4, -3);
                    ball.push(_add_ball)
                }
            } else if (this.type == 3) {
                ball.map((item) => {
                    const ball_item_data = item.returnDetail();
                    let add_ball = new BallMain(ball_item_data[0], ball_item_data[1], ball_item_data[2] * -1, ball_item_data[3]);
                    ball.push(add_ball);
                });
            } else if (this.type == 4) {
                player.ifYouCallThisFunctionTheSizeOfThePlayerWillChange(1.5);
            } else if (this.type == 5) {
                player.ifYouCallThisFunctionTheSizeOfThePlayerWillChange(0.5);
            }
            filerItems.push(sequence);
        }
        if (this.itemY - 10 > HEIGHT) {
            filerItems.push(sequence);
        }
        if (this.type == 0) {
            image(imgItem0, this.itemX - 10, this.itemY, 20, 20);
        } else if (this.type == 1) {
            image(imgItem1, this.itemX - 10, this.itemY, 20, 20);
        } else if (this.type == 2) {
            image(imgItem2, this.itemX - 10, this.itemY, 20, 20);
        } else if (this.type == 3) {
            image(imgItem3, this.itemX - 10, this.itemY, 20, 20);
        } else if (this.type == 4) {
            image(imgItem4, this.itemX - 10, this.itemY, 20, 20);
        } else if (this.type == 5) {
            image(imgItem5, this.itemX - 10, this.itemY, 20, 20);
        }
        this.itemY = this.itemY + this.speed;
    }
}


/* scene */
function startScene() {
    fill(255)
    textSize(40);
    textAlign(CENTER);
    text('Home', WIDTH / 2, 150);

    fill(color(106, 154, 158, 100));
    rect(125, 600, 200, 80);

    fill(200)
    textSize(24);
    textAlign(CENTER);
    text('Play', WIDTH / 2, 650);
}

function mainScene() {
    filerBall = [];
    filerItems = [];
    player.update(scene);
    map.draw();


    ball.map((item, i) => {
        item.update(player, map, i);
        item.draw();
    });

    items.map((item, i) => {
        item.update(player, ball, i);
    })

    if (filerBall.length != 0) {
        ball = ball.filter((_, number) => (!filerBall.includes(number)));
    }
    if (filerItems.length != 0) {
        items = items.filter((_, number) => (!filerItems.includes(number)));
    }

    if (ball.length == 0 && items == 0) {
        scene = 2;
    } else if (map.displayRemaining() == 0) {
        scene = 3;
    }
}

function gameOverScene() {
    fill(255)
    textSize(40);
    textAlign(CENTER);
    text('Game Oveeeeeeeeer', WIDTH / 2, 150);

    fill(230);
    textSize(24);
    textAlign(CENTER);
    text('残り : ' + map.displayRemaining(), WIDTH / 2, 230);

    fill(color(106, 154, 158, 100));
    rect(125, 480, 200, 80);

    fill(200);
    textSize(24);
    textAlign(CENTER);
    text('Play Again', WIDTH / 2, 530);

    fill(color(106, 154, 158, 100));
    rect(125, 600, 200, 80);

    fill(200);
    textSize(24);
    textAlign(CENTER);
    text('Home', WIDTH / 2, 650);
}

function gamaFinishScene() {
    fill(255);
    textSize(40);
    textAlign(CENTER);
    text('Game Cleeaaaar', WIDTH / 2, 150);

    fill(color(106, 154, 158, 100));
    rect(125, 480, 200, 80);

    fill(200);
    textSize(24);
    textAlign(CENTER);
    text('Play Again', WIDTH / 2, 530);

    fill(color(106, 154, 158, 100));
    rect(125, 600, 200, 80);

    fill(200);
    textSize(24);
    textAlign(CENTER);
    text('Home', WIDTH / 2, 650);
}


/* mouse */
function mousePressed() {
    if (checkMousePosition(125, 325, 600, 680) && scene == 0) {
        startSetUp();
    }
    /* 2, 3 */
    if (checkMousePosition(125, 325, 600, 680) && (scene == 2 || scene == 3)) {
        scene = 0;
    } else if (checkMousePosition(125, 325, 480, 560) && (scene == 2 || scene == 3)) {
        startSetUp();
    }
}


/* draw */
function draw() {
    clear();
    background(color(255, 255, 255, 4));

    if (scene == 0) {
        startScene();
    } else if (scene == 1) {
        mainScene();
    } else if (scene == 2) {
        mainScene();
        gameOverScene();
    } else if (scene == 3) {
        mainScene();
        gamaFinishScene();
    }
}