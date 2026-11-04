const canvas=document.getElementById('gameCanvas'),ctx=canvas.getContext('2d');
const keys={};let player=new Player();let enemies=[];let lives=3;let started=false;
addEventListener('keydown',e=>{
  const k=e.key.toLowerCase();keys[k]=true;
  if(['arrowup','arrowdown','arrowleft','arrowright',' '].includes(k))e.preventDefault();
  if(k==='q')player.dash();
   if(['1','2','3','4'].includes(k)){const chosen=['void','alex','mia','kai'][Number(k)-1];if(player.setCharacter(chosen))showMessage('CHARACTER: '+player.character.toUpperCase()+' — '+player.ability);}
  if(k==='j'){player.performAttack();useFire();}
  if(k==='k'){player.performAttack();useLightning();}
  if(k==='l'){player.performAttack();useExplosion();}
  if(k==='e'){useVoidCapture();}
  if(k==='r'){useVoidCombo();}
  if(k==='t'){useVoidHalfStrike();}
  if(k==='u'){useVoidCounter();}
  if(k==='escape'&&started&&screen.classList.contains('hidden'))showPause();
});
addEventListener('keyup',e=>keys[e.key.toLowerCase()]=false);
function playerDied(){
  lives--;
  if(lives<=0){showGameOver();started=false;return}
  showMessage('SYSTEM RESTART — RESPAWNING');
  loadLevel(currentLevel);
}
function drawBackground(){
  const g=ctx.createLinearGradient(0,0,0,720);g.addColorStop(0,'#080b1c');g.addColorStop(1,'#160d27');ctx.fillStyle=g;ctx.fillRect(0,0,1280,720);
}
// Separate living enemies using their gameplay hitboxes (not their sprite pixels).
// Applies only to enemies at roughly the same vertical level, so enemies on
// different platforms can pass above/below each other.
function separateEnemies(){
  const gap=12;
  for(let pass=0;pass<4;pass++){
    for(let i=0;i<enemies.length;i++){
      const a=enemies[i];if(a.dead)continue;
      for(let j=i+1;j<enemies.length;j++){
        const b=enemies[j];if(b.dead)continue;
        const overlapY=Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y);
        if(overlapY<Math.min(a.h,b.h)*0.55)continue;
        const midA=a.x+a.w/2,midB=b.x+b.w/2;
        const minDistance=(a.w+b.w)/2+gap;
        const diff=midB-midA;
        if(Math.abs(diff)>=minDistance)continue;
        const sign=diff===0?(i<j?1:-1):Math.sign(diff);
        const correction=(minDistance-Math.abs(diff))/2;
        a.x-=sign*correction;b.x+=sign*correction;
        a.x=Math.max(0,Math.min(1280-a.w,a.x));
        b.x=Math.max(0,Math.min(1280-b.w,b.x));
        // Cancel motion that would immediately recreate the overlap.
        if(Math.sign(a.vx)===sign)a.vx=0;
        if(Math.sign(b.vx)===-sign)b.vx=0;
      }
    }
  }
}
function loop(){
  requestAnimationFrame(loop);
  if(!started||!screen.classList.contains('hidden')){drawBackground();drawMap(ctx);player.draw(ctx);enemies.forEach(e=>e.draw(ctx));drawPowers(ctx);return}
  drawBackground();drawMap(ctx);
  player.update();enemies.forEach(e=>e.update());
  separateEnemies();
  updatePowers();
  for(const p of projectiles){
    for(const e of enemies){
      if(!e.dead&&Math.hypot(p.x-(e.x+e.w/2),p.y-(e.y+e.h/2))<30){e.hit(p.damage);p.life=0}
    }
  }
  enemies=enemies.filter(e=>!e.dead);
  checkExit();
  player.draw(ctx);enemies.forEach(e=>e.draw(ctx));drawPowers(ctx);
  document.getElementById('healthBar').style.width=Math.max(0,Math.min(100,player.health/player.maxHealth*100))+'%';
  document.getElementById('healthText').textContent=Math.max(0,player.health)+' / '+player.maxHealth;
}
showStart();loop();
