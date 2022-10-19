// Declare global variables
let myImage, myImage2, bg;
let music, gnam, poor;
let analyzer;
let colorChoice1, colorChoice2;
let shrek;
let candies = []; // array of Candy objects
let gingies = []; // array of Gingy objects
let score = 0; // score starts at 0

// preload() runs once; it's used to handle loading of external files
function preload() {
  myImage = loadImage("./assets/shrek.png");
  myImage2 = loadImage("./assets/gingy.png");
  bg = loadImage("./assets/space.jpeg");

  soundFormats("mp3");
  music = loadSound("./assets/funny_song");
  gnam = loadSound("./assets/pou_eating");
  poor = loadSound("./assets/game_over");
}

// setup() waits until preload() is done; it runs once too
function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);
  imageMode(CENTER);
  backgroundMusic();

  // The analyzer allows to perform analysis on a sound file
  analyzer = new p5.Amplitude();
  analyzer.setInput(music);

  // Inizialize variable
  shrek = new Shrek(); // instantiate Shrek class

  for (let i = 0; i < 10; i++) {
    candies.push(new Candy()); // instantiate Candy class; append 10 candies into the array "candies"
  }

  // Define the list of colors for candies
  const colors = [
    "Aqua",
    "Magenta",
    "PaleGreen",
    "Orchid",
    "Orange",
    "Red",
    "Yellow",
    "White",
  ];

  // Randomly chose one of them for each variable each time
  colorChoice1 = random(colors);
  colorChoice2 = random(colors);
}

// draw() loops forever, until stopped
function draw() {
  backgroundImage(); // Calling the function
  textFont("Silkscreen"); // Font and style of text are the same for all writings
  textStyle("Regular");

  // Declare and initialize variable
  let time = `${round(millis() / 1000)}`; // millis() / 1000 returns the number of seconds since starting the sketch, round() approzimates up

  if (score < 10) {
    textSize(20);
    fill("Yellow");
    textAlign(LEFT);
    // The strings "Time: " and "Score: " are concatenated to the time and score variable respectively
    text("Time: " + time, width / 10, height / 10);
    text("Score: " + score, width / 10, height / 7);

    fill("LightBlue");
    textAlign(RIGHT);
    text("ᐃ move", width / 1.1, height / 1.16);
    text("ᐊ ᐅ rotate", width / 1.1, height / 1.1);
  }

  fill("#66ff66");
  textSize(35);
  textAlign(CENTER);

  // Initial temporary writings
  if ((time > 1) & (time < 4)) {
    text("Eat the Candies", width / 2, height / 2);
  } else if ((time > 3) & (time < 6)) {
    text("Not Gingies!", width / 2, height / 2);
  }

  // Writings of moral support
  if (score == 8) {
    fill("Pink");
    text("Come On Baby!", width / 2, height / 2);
  } else if (score == 9) {
    fill("Magenta");
    text("1 left!", width / 2, height / 2);
  }

  for (let i = 0; i < candies.length; i++) {
    // Calling the functions
    candies[i].display();
    candies[i].move();
    candies[i].edges();

    // If Shrek eats a candy...
    if (shrek.eats(candies[i])) {
      candies.splice(i, 1); // remove the candy from the array
      gingies.push(new Gingy()); // add a Gingy to the list
      shrek.size = shrek.size * 1.06; // increase the size of Shrek
      score += 1; // increase the score by one
      gnam.play(); // start the eating sound effect
      break; // get out of the loop
    }
  }

  for (let j = 0; j < gingies.length; j++) {
    // Calling the functions
    gingies[j].display();
    gingies[j].move();
    gingies[j].edges();

    // If Shrek eats a Gingy...
    if (shrek.eats(gingies[j])) {
      background("Black"); // game over screen
      textAlign(CENTER);
      fill("Gold");
      textSize(40);
      text("Ehi, poor Gingy!", width / 2, height / 2); // game over writing
      noLoop(); // stop the program
      music.stop(); // stop the background music
      poor.play(); // start the cute game-over sound
    }
  }

  // Calling the functions
  shrek.display();
  shrek.move();
  shrek.turn();
  shrek.edges();

  // If score == 10, you win
  if (score == 10) {
    gingies.splice(gingies.lenght);

    // Turn up the volume of the background music
    music.setVolume(1.5);
    // Set the volume and remap it to a bigger value
    volume = analyzer.getLevel();
    volume = map(volume, 0, 1, 0, height);

    // Shrek's size follows the volume of the music
    shrek.size = shrek.s * volume;

    // The size of the exultation writing follows the volume of the music
    textAlign(CENTER);
    fill("Pink");
    textSize(volume / 2);
    text("Yeeeeee!", width / 2, height / 2);
  }
}

// Define functions
function backgroundMusic() {
  music.play(); // starts playing
  music.loop(); // play again when done
  music.setVolume(0.5); // change the volume of the sound file
  userStartAudio(); // enable audio
}

function backgroundImage() {
  // Start a new drawing state
  push();

  translate(width / 2, height / 2);
  imageMode(CENTER);
  // Resize the image using a scaling coefficient to make it occupy the whole canvas
  let scale = Math.max(width / bg.width, height / bg.height);
  image(bg, 0, 0, bg.width * scale, bg.height * scale);

  // Restore original state
  pop();
}

// Event functions (pre-built functions)
function keyPressed() {
  if (keyCode == RIGHT_ARROW) {
    /* The argument "6" or "-6" gets passed into the parameter "a" 
    and Shrek turns 6 degrees to the right or to the left */
    shrek.setRotation(6);
  } else if (keyCode == LEFT_ARROW) {
    shrek.setRotation(-6);
  } else if (keyCode == UP_ARROW) {
    /* The argument (the boolean value "true") gets passed 
    into the parameter "b" and Shrek is pushed */
    shrek.boosting(true);
  }
}

function keyReleased() {
  // No rotation
  shrek.setRotation(0);
  // No boost
  shrek.boosting(false);
}

// Shrek class
class Shrek {
  constructor() {
    // Create a position vector placed in the center of the canvas
    this.pos = createVector(width / 2, height / 2);

    // s: size coefficient related to the canvas
    this.s = windowWidth / 800;
    this.size = this.s * myImage.width; // (myImage is square)

    // Initially we want Shrek to be stationary (no velocity, no boost)
    this.vel = createVector(0, 0);
    this.isBoosting = false;

    // Head direction (upward)
    this.heading = -90;

    // No rotation
    this.rotation = 0;
  }

  display() {
    // Start a new drawing state: make the global reference match the local reference
    push();
    // Place the element in the center of the canvas
    translate(this.pos.x, this.pos.y);
    // Rotate Shrek relative to the head direction 
    rotate(this.heading + 90);
    image(myImage, 0, 0, this.size, this.size);

    // Restore original state
    pop();
  }

  // Define the angle of rotation (a)
  setRotation(a) {
    this.rotation = a;
  }

  // Spin Shrek
  turn() {
    this.heading += this.rotation;
  }

  // "b" will assume the values ​​of true or false (boolean variable)
  boosting(b) {
    this.isBoosting = b;
  }

  move() {
    // If "b" is true, call the function boost()
    if (this.isBoosting) {
      this.boost();
    }
    // Adds two vectors (position and velocity) to make Skrek move
    this.pos.add(this.vel);
    // Multiplies the velocity vector by a scalar < 1 to make Shrek stop after a slipping
    this.vel.mult(0.99);
  }

  boost() {
    // Create a p5.Vector (force) using the fromAngle function; it points in the direction of the heading
    let force = p5.Vector.fromAngle(radians(this.heading));
    // Multiply the vector by a scalar to change the intensity of the boost
    force.mult(0.1);
    // Add the force vector to the velocity one; Shrek is pushed
    this.vel.add(force);
  }

  edges() {
    // When Shrek leaves one side of the canvas, it reappears on the opposite side
    // "+/- this.size/2" because it better be completely out
    if (this.pos.x > width + this.size / 2) {
      this.pos.x = -this.size / 2;
    } else if (this.pos.x < -this.size / 2) {
      this.pos.x = width + this.size / 2;
    }
    if (this.pos.y > height + this.size / 2) {
      this.pos.y = -this.size / 2;
    } else if (this.pos.y < -this.size / 2) {
      this.pos.y = height + this.size / 2;
    }
  }

  eats(sweet) {
    // Consider the distance d between the centers of Shrek and the sweet
    let d = dist(this.pos.x, this.pos.y, sweet.pos.x, sweet.pos.y);

    // If d is less than the sum of the "rays", the two objects have collided
    if (d < this.size / 2 + sweet.r / 2) {
      // Use boolean variables
      return true;
    } else {
      return false;
    }
  }
}

// Candy class
class Candy {
  constructor() {
    // Randomly arrange the elements within the canvas (position vector)
    this.pos = createVector(random(width), random(height));

    // Make a new 2D unit vector from a random angle (velocity vector)
    this.vel = p5.Vector.random2D();

    // Randomly choose a range size for the candy; make it responsive
    this.r = random(windowWidth / 40, windowWidth / 20);
  }

  display() {
    // Start a new drawing state: make the global reference match the local reference
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.pos.x, this.pos.y);

    // Draw a circle (predefined variable)
    fill(colorChoice1);
    noStroke();
    circle(0, 0, this.r);

    // Draw arcs (predefined variable)
    fill(colorChoice2);
    arc(-this.r / 2, 0, this.r, this.r, 135, 225);
    arc(this.r / 2, 0, this.r, this.r, -45, 45);

    // Restore original state
    pop();
  }

  move() {
    // Adds two vectors (position and velocity) to make the candies move
    this.pos.add(this.vel);
  }

  edges() {
    // When the candy leaves one side of the canvas, it reappears on the opposite side
    // "+/- this.r" because it better be completely out
    if (this.pos.x > width + this.r) {
      this.pos.x = -this.r;
    } else if (this.pos.x < -this.r) {
      this.pos.x = width + this.r;
    }
    if (this.pos.y > height + this.r) {
      this.pos.y = -this.r;
    } else if (this.pos.y < -this.r) {
      this.pos.y = height + this.r;
    }
  }
}

// Gingy class
class Gingy {
  constructor() {
    // Randomly arrange the elements within the canvas (position vector)
    this.pos = createVector(random(width), random(height));

    // Make a new 2D unit vector from a random angle (velocity vector)
    this.vel = p5.Vector.random2D();

    // s: size coefficient related to the canvas
    let s = windowWidth / 800;
    this.r = s * myImage2.width; //myImage is square
  }

  display() {
    // Start a new drawing state: make the global reference match the local reference
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.pos.x, this.pos.y);
    image(myImage2, 0, 0, this.r, this.r);

    // Restore original state
    pop();
  }

  move() {
    // Adds two vectors (position and velocity) to make Gingy move
    this.pos.add(this.vel);
  }

  edges() {
    // When Gingy leaves one side of the canvas, it reappears on the opposite side
    if (this.pos.x > width + this.r / 2) {
      this.pos.x = -this.r / 2;
    } else if (this.pos.x < -this.r / 2) {
      this.pos.x = width + this.r / 2;
    }
    if (this.pos.y > height + this.r / 2) {
      this.pos.y = -this.r / 2;
    } else if (this.pos.y < -this.r / 2) {
      this.pos.y = height + this.r / 2;
    }
  }
}

// Called anytime the browser window gets resized
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}