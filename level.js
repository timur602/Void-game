const levels=[
 {
   name:'ACT 1 — THE CREATION',
   objective:'Reach the AURORA terminal.',
   spawn:[50,548],
   exit:[1180,530],
   enemies:[[260,552,'hunter'],[520,392,'hunter'],[690,452,'hunter'],[900,352,'hunter']],
   message:'2147. Humanity built a machine to solve every problem.'
 },
 {
   name:'ACT 2 — THE ESCAPE',
   objective:'Escape the factory before VOID surrounds you.',
   spawn:[50,548],
   exit:[1180,530],
   enemies:[[150,552,'hunter'],[360,552,'guardian'],[520,552,'hunter'],[720,552,'guardian'],[920,552,'hunter'],[1080,552,'hunter']],
   message:'V-01 has escaped. The machine has chosen its own path.'
 },
 {
   name:'ACT 3 — THE MACHINE AGE',
   objective:'Cross Nexus City and reach the resistance signal.',
   spawn:[50,548],
   exit:[1160,530],
   enemies:[[240,552,'hunter'],[400,272,'hunter'],[570,552,'guardian'],[760,302,'hunter'],[900,202,'guardian'],[1080,552,'hunter']],
   message:'The Machine Age has begun. Nexus City belongs to VOID.'
 },
 {
   name:'ACT 4 — THE ABANDONED FACTORY',
   objective:'Defeat the Factory Overlord and reach the exit.',
   spawn:[45,548],
   exit:[1180,530],
   enemies:[[220,552,'hunter'],[430,362,'guardian'],[650,552,'hunter'],[850,332,'guardian'],[1080,524,'boss']],
   message:'The factory has been silent for decades. Something massive is powering up inside.'
 },
 {
   name:'ACT 5 — THE VOID CORE',
   objective:'Defeat VOID and reach the final exit.',
   spawn:[45,548],
   exit:[1180,530],
   // Regular enemies stand on top of the floor/platforms. Boss feet align
   // with the floor (610), preventing it from spawning inside the floor.
   enemies:[[220,552,'hunter'],[390,362,'guardian'],[590,552,'hunter'],[790,302,'guardian'],[1030,524,'boss']],
   message:'The resistance has reached the VOID Core. End the Machine Age.'
 }
];

let currentLevel=0;

function loadLevel(i){
  if(i<0 || i>=levels.length) return;
  currentLevel=i;
  buildMap(i);
  enemies.length=0;
  projectiles.length=0;

  const l=levels[i];
  player.reset(l.spawn[0],l.spawn[1]);

  l.enemies.forEach(e=>{
    enemies.push(new Enemy(e[0],e[1],e[2]));
  });

  showMessage(l.message);
  updateHUD(l);
}

function checkExit(){
  const l=levels[currentLevel];
  if(!l) return;

  // Detect the exit with a broad trigger so the player does not need to
  // pass through the beacon's edge pixel-perfectly.
  const centerX=player.x+player.w/2;
  const feet=player.y+player.h;
  const inExitZone = centerX >= l.exit[0]-70 &&
                     centerX <= l.exit[0]+105 &&
                     feet >= l.exit[1]-45 &&
                     player.y < 660;
  if(!inExitZone) return;

  const livingEnemies=enemies.filter(e=>e && !e.dead);
  if(livingEnemies.length>0){
    if(!checkExit.lockedMessageCooldown || checkExit.lockedMessageCooldown<=0){
      showMessage('EXIT LOCKED — DEFEAT ALL ENEMIES');
      checkExit.lockedMessageCooldown=90;
    } else {
      checkExit.lockedMessageCooldown--;
    }
    player.x=Math.min(player.x,l.exit[0]-player.w-8);
    return;
  }

  if(checkExit.transitioning) return;
  checkExit.transitioning=true;

  if(currentLevel < levels.length-1){
    loadLevel(currentLevel+1);
  } else {
    showEnd();
  }

  // Avoid double-transitioning in the same animation frame.
  requestAnimationFrame(()=>{checkExit.transitioning=false;});
}
checkExit.transitioning=false;
checkExit.lockedMessageCooldown=0;
