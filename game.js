const PLAYAREA_HEIGHT = 600 - 150;
const PLAYAREA_WIDTH = 800;
var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'phaser-example', { preload: preload, create: create, update: update });

function preload() {

    game.load.image('bullet', 'assets/arrow.png');
    game.load.image('scoreboard', 'assets/scoreboard.png');
    game.load.spritesheet('ballons', 'assets/baloon.png');
    game.load.image('arch1', 'assets/arch1.png');
    game.load.image('gameOver', 'assets/gameOver.png');
    game.load.image('level2', 'assets/level2.png');
    game.load.image('gamecomplete', 'assets/gamecomplete.png');

    game.load.spritesheet('archer', 'assets/archer.png', 105, 138, 5);
    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;
    game.scale.refresh();

}

var archer;
var bullets;
var ballons;
var walk;

var bulletTime = 0;
var bullet;

var score = 0;
var bowCount = 10;
var ballonCount = 10;
var level = 1;
var scoreText;
var gameOverBoard;
var levelBoard;
var gameCompleteBoard;
var timer;

function create() {

    var tempAnim = game.add.sprite(-300, 200, 'archer');

    walk = tempAnim.animations.add('walk');

    walk.enableUpdate = true;
    walk.onUpdate.add(pauseOnReady, this);

    tempAnim.animations.play('walk', 5, false);

    game.stage.backgroundColor = '#339b36';

    // game.world.centerX, game.world.centerY

    archer = game.add.sprite(30, 100, 'arch1');

    game.canvas.addEventListener('mousedown', requestLock);
    game.canvas.addEventListener('mouseup', mouseUp);

    game.input.addMoveCallback(move, this);

    //  This will check Group vs. Group collision (bullets vs. ballons!)

    ballons = game.add.group();
    ballons.enableBody = true;
    ballons.physicsBodyType = Phaser.Physics.ARCADE;

    for (var i = 0; i < 10; i++)
    {
        // var c = ballons.create(game.world.randomX, Math.random() * 500, 'ballons', game.rnd.integerInRange(0, 36));
        var c = ballons.create(350 + (i*40), 400, 'ballons', game.rnd.integerInRange(0, 36));
        c.name = 'veg' + i;
        c.checkWorldBounds = true;
        c.events.onOutOfBounds.add(resetBallon, this);
    }

    game.add.image(75,10,'scoreboard');
    scoreText = game.add.text(120, 30, 'score: 0', { fontSize: '32px', fill: '#000' });
    refreshScoreboard();

    bullets = game.add.group();
    bullets.enableBody = true;
    bullets.physicsBodyType = Phaser.Physics.ARCADE;

    for (var i = 0; i < 20; i++)
    {
        var b = bullets.create(0, 0, 'bullet');
        b.name = 'bullet' + i;
        b.exists = false;
        b.visible = false;
        b.checkWorldBounds = true;
        b.events.onOutOfBounds.add(resetBullet, this);
    }

    gameOverBoard = game.add.sprite(230, 250, 'gameOver');
    gameOverBoard.visible = false;
    levelBoard = game.add.sprite(230, 250, 'level2');
    levelBoard.visible = false;
    gameCompleteBoard = game.add.sprite(230, 250, 'gamecomplete');
    gameCompleteBoard.visible = false;
    

    // archer = game.add.sprite(10, 300, 'archer');
    // game.physics.enable(archer, Phaser.Physics.ARCADE);

    // game.input.keyboard.addKeyCapture([ Phaser.Keyboard.SPACEBAR ]);

}

function pauseOnReady(anim, frame) {

    if(frame.index=3) archer.animations.stop(null, true);

}

function requestLock() {
    game.input.mouse.requestPointerLock();
    archer.loadTexture('archer', 0);
    archer.animations.add('walk');
    archer.animations.play('walk', 30, false);
}

function mouseUp() {
    fireBullet();
    archer.loadTexture('arch1', 0);
}

function move(pointer, x, y, click) {

    //  If the cursor is locked to the game, and the callback was not fired from a 'click' event
    //  (such as a mouse click or touch down) - as then it might contain incorrect movement values
    if (game.input.mouse.locked && !click)
    {
        archer.y += game.input.mouse.event.movementY;
        if(archer.y<100) archer.y = 100;
        if(archer.y>(PLAYAREA_HEIGHT)) archer.y = PLAYAREA_HEIGHT;
    }

}

function update() {

    //  As we don't need to exchange any velocities or motion we can the 'overlap' check instead of 'collide'
    game.physics.arcade.overlap(bullets, ballons, collisionHandler, null, this);

    //Move ballons
    ballons.forEach(element => {
        element.body.velocity.y = -200;
    });

}

function fireBullet () {
    
    if(bowCount <= 0)
    {
        endGame(false);
    }
    else if (game.time.now > bulletTime)
    {
        bullet = bullets.getFirstExists(false);

        if (bullet)
        {
            bowCount--;refreshScoreboard();
            bullet.reset(archer.x + 50, archer.y + 50);
            bullet.body.velocity.x = +300;
            bulletTime = game.time.now + 150;
        }
    }

}

//  Called if the bullet goes out of the screen
function resetBullet (bullet) {

    bullet.kill();

}

function resetBallon (ballon) {

    ballon.reset(ballon.body.x, game.height);

}

//  Called if the bullet hits one of the veg sprites
function collisionHandler (bullet, veg) {

    // bullet.kill();
    if(bullet.y < (veg.y+25))
    {
        veg.kill();
        score += 10;
        refreshScoreboard();
        if(--ballonCount <= 0) {
            levelBoard.visible = true;
            game.time.events.add(Phaser.Timer.SECOND * 4, nextLevel, this);
        }
    }

}

function refreshScoreboard()
{
    scoreText.text = 'Level: '+level+' - Score: ' + score + ' - Bow: '+bowCount;
}

function endGame(complete)
{
    game.paused = true;
    if(complete)
        gameCompleteBoard.visible = true;
    else
        gameOverBoard.visible = true;
}

function nextLevel()
{
    if(level == 1) 
    {
        startLevel2();
    }
    else if(level == 2) 
    {
        endGame(true);
    }
}

function startLevel2()
{
    level = 2;
    levelBoard.visible = false;
    ballonCount = 10;
    bowCount = 10;
    refreshScoreboard();

    for (var i = 0; i < 10; i++)
    {
        ballon = ballons.getFirstExists(false);
        if (ballon)
        {
            ballon.reset(300 + (i*40), Math.random() * 500);
            ballon.body.velocity.y = 100 + (Math.random() * 500);
        }
    }

}
