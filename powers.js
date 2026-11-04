const projectiles=[];
const powers={
  fireCooldown:0,
  lightningCooldown:0,
  explosionCooldown:0
};

let lightningEffect=null;
let explosionEffect=null;
let brokenPlatformEffect=null;
let voidPulseEffect=null;
let voidPulseCooldown=0;
let voidRobotCallCooldown=0;
const voidAllies=[];
let voidCapture=null, voidCombo=null, voidHalfStrikeEffect=null, voidCounter=null, voidArmEffect=null;
const voidAbilityCooldowns={capture:0,combo:0,half:0,counter:0};

// Temporary friendly support drones called by VOID's abilities.
function callVoidRobots(count=1){
  if(player.character!=='void')return;
  if(voidRobotCallCooldown>0)return;
  voidRobotCallCooldown=300; // 5 seconds; prevents ability-spam from flooding the arena.
  for(let i=0;i<count;i++){
    if(voidAllies.length>=3)voidAllies.shift();
    voidAllies.push({x:player.x+player.w/2+(i===0?-34:34),y:player.y+12,life:600,cooldown:20+i*12,phase:i*Math.PI,damage:1});
  }
  showMessage(count>1?'VOID SUMMONED SUPPORT DRONES':'VOID CALLED A SUPPORT DRONE');
}

function updateVoidAllies(){
  for(let i=voidAllies.length-1;i>=0;i--){
    const bot=voidAllies[i]; bot.life--; if(bot.life<=0){voidAllies.splice(i,1);continue;}
    bot.phase+=0.055;
    // Hover near VOID, then move toward the closest living enemy.
    const target=enemies.reduce((best,e)=>{if(e.dead)return best;const d=Math.hypot(e.x-bot.x,e.y-bot.y);return !best||d<best.d?{e,d}:best;},null);
    const tx=target?target.e.x+target.e.w/2:player.x+player.w/2+Math.cos(bot.phase)*48;
    const ty=target?target.e.y+target.e.h/2:player.y+player.h/2+Math.sin(bot.phase)*22;
    bot.x+=(tx-bot.x)*0.035; bot.y+=(ty-bot.y)*0.035;
    if(bot.cooldown>0)bot.cooldown--;
    if(target&&target.d<360&&bot.cooldown<=0){target.e.hit(bot.damage);bot.cooldown=42;}
  }
}

class Projectile{
  constructor(x,y,dx,dy,damage=20){
    this.x=x;this.y=y;this.dx=dx;this.dy=dy;
    this.damage=damage;this.life=38; // Shorter range prevents safe off-screen sniping.
  }

  update(){
    this.x+=this.dx;
    this.y+=this.dy;
    this.life--;
  }

  draw(ctx){
    ctx.fillStyle='#d77bff';
    ctx.shadowBlur=18;
    ctx.shadowColor='#a13cff';
    ctx.beginPath();
    ctx.arc(this.x,this.y,7,0,Math.PI*2);
    ctx.fill();
    ctx.shadowBlur=0;
  }
}


// VOID's unique special: a short-range pulse that damages and briefly
// disables nearby enemies. Press E while playing as VOID.
function useVoidPulse(){
  if(player.character!=='void'){
    showMessage('VOID PULSE IS ONLY AVAILABLE TO VOID');
    return;
  }
  if(voidPulseCooldown>0){
    showMessage('VOID PULSE RECHARGING');
    return;
  }
  voidPulseCooldown=480; // 8 seconds at 60 FPS
  callVoidRobots(2);
  player.performAttack();
  const cx=player.x+player.w/2;
  const cy=player.y+player.h/2;
  const radius=220;
  let affected=0;
  enemies.forEach(e=>{
    const ex=e.x+e.w/2, ey=e.y+e.h/2;
    if(Math.hypot(ex-cx,ey-cy)<=radius){
      e.hit(15);
      if(!e.dead)e.stunTimer=Math.max(e.stunTimer||0,90); // 1.5 seconds
      affected++;
    }
  });
  voidPulseEffect={x:cx,y:cy,radius:0,maxRadius:radius,life:24};
  showMessage(affected?`VOID PULSE — ${affected} ENEMY(IES) DISRUPTED`:'VOID PULSE — NO ENEMIES IN RANGE');
}

// VOID ability 1 (E): three delivery drones drop restraint robots onto one target.
// The target stays restrained until VOID lands another hit on it.
function useVoidCapture(){
  if(player.character!=='void'){showMessage('VOID ABILITIES ONLY');return;}
  if(voidAbilityCooldowns.capture>0){showMessage('ROBOT RESTRAINT RECHARGING');return;}
  const target=findNearestEnemy(620);
  if(!target){showMessage('NO ENEMY IN DELIVERY RANGE');return;}
  voidAbilityCooldowns.capture=720;
  const tx=target.x+target.w/2, ty=target.y+target.h/2;
  voidCapture={target,life:99999,robots:[-1,0,1].map((side,i)=>({x:player.x+player.w/2+side*22,y:-50-i*24,tx:tx+side*22,ty:ty+8,landed:false}))};
  target.capturedByVoid=true;target.stunTimer=999999;target.vx=0;target.vy=0;
  showMessage('RESTRAINT DRONES DEPLOYED — HIT THE TARGET TO RELEASE IT');
}
function findNearestEnemy(maxDistance=Infinity){
  let best=null, bestD=maxDistance;
  for(const e of enemies){if(e.dead)continue;const d=Math.hypot(e.x+e.w/2-(player.x+player.w/2),e.y+e.h/2-(player.y+player.h/2));if(d<bestD){best=e;bestD=d;}}
  return best;
}

// VOID ability 2 (R): rush the nearest enemy and strike 15–20 times.
// Closer targets receive 15 hits; targets farther away receive up to 20.
function useVoidCombo(){
  if(player.character!=='void'){showMessage('VOID ABILITIES ONLY');return;}
  if(voidAbilityCooldowns.combo>0){showMessage('VOID COMBO RECHARGING');return;}
  const target=findNearestEnemy(900);if(!target){showMessage('NO TARGET FOR VOID COMBO');return;}
  const distance=Math.hypot(target.x-player.x,target.y-player.y);
  const hits=Math.max(15,Math.min(20,15+Math.floor(distance/150)));
  voidAbilityCooldowns.combo=600;
  voidCombo={target,hits,done:0,timer:0,originalX:player.x,originalY:player.y};
  showMessage(`VOID COMBO — ${hits} STRIKES`);
}

// VOID ability 3 (T): a single heavy strike removes half of the target's current HP.
function useVoidHalfStrike(){
  if(player.character!=='void'){showMessage('VOID ABILITIES ONLY');return;}
  if(voidAbilityCooldowns.half>0){showMessage('VOID EXECUTION RECHARGING');return;}
  const target=findNearestEnemy(150);if(!target){showMessage('GET CLOSER TO A TARGET');return;}
  voidAbilityCooldowns.half=900;
  const damage=target.hp/2;
  target.hit(damage);
  player.performAttack();
  voidHalfStrikeEffect={x:target.x+target.w/2,y:target.y+target.h/2,life:24};
  showMessage(`VOID CRUSH — ${Number(damage.toFixed(1))} DAMAGE`);
}

// VOID ability 4 (U): a timed counter. If an enemy connects during the window,
// VOID catches it and a stylized mechanical blade-arm rises from the floor.
function useVoidCounter(){
  if(player.character!=='void'){showMessage('VOID ABILITIES ONLY');return;}
  if(voidAbilityCooldowns.counter>0){showMessage('COUNTER RECHARGING');return;}
  voidAbilityCooldowns.counter=540;
  voidCounter={life:150};
  showMessage('VOID COUNTER ARMED — WAIT FOR AN ENEMY ATTACK');
}
function triggerVoidCounter(){
  if(!voidCounter||voidCounter.life<=0)return false;
  const target=findNearestEnemy(100);if(!target)return false;
  target.vx=0;target.vy=0;target.stunTimer=150;target.capturedByVoid=false;
  target.hit(25);
  voidArmEffect={x:target.x+target.w/2,y:target.y+target.h,life:35};
  voidCounter=null;
  showMessage('COUNTER! VOID MECHANICAL ARM STRIKE');
  return true;
}
function updateVoidCustomAbilities(){
  for(const k of Object.keys(voidAbilityCooldowns))if(voidAbilityCooldowns[k]>0)voidAbilityCooldowns[k]--;
  if(voidCounter&&--voidCounter.life<=0){voidCounter=null;showMessage('VOID COUNTER EXPIRED');}
  if(voidCapture){
    const target=voidCapture.target;
    if(!target||target.dead||!target.capturedByVoid){voidCapture=null;}
    else{
      for(const bot of voidCapture.robots){
        if(!bot.landed){bot.y+=Math.min(13,Math.max(3,(bot.ty-bot.y)*0.18));bot.x+=(bot.tx-bot.x)*0.12;if(bot.y>=bot.ty){bot.y=bot.ty;bot.landed=true;}}
      }
      target.vx=0;target.vy=0;target.stunTimer=999999;
      target.x+=(voidCapture.robots[1].tx-target.w/2-target.x)*0.15;
    }
  }
  if(voidCombo){
    const c=voidCombo, e=c.target;
    if(!e||e.dead){voidCombo=null;}
    else{
      const ex=e.x+e.w/2;
      // Rush horizontally only. Chasing the enemy's Y center made VOID
      // sink through platforms/floors during the combo. Keep the launch
      // height and vertical physics stable for the duration of the move.
      player.x+=(ex-player.w/2-player.x)*0.24;
      player.y=c.originalY;
      player.vy=0;
      player.onGround=true;
      player.direction=ex>=player.x?1:-1;
      c.timer++;
      if(c.timer>=5){c.timer=0;player.performAttack();e.hit(3);c.done++;}
      if(c.done>=c.hits){
        player.y=c.originalY;
        player.vy=0;
        voidCombo=null;
        showMessage('VOID COMBO COMPLETE');
      }
    }
  }
  if(voidHalfStrikeEffect&&--voidHalfStrikeEffect.life<=0)voidHalfStrikeEffect=null;
  if(voidArmEffect&&--voidArmEffect.life<=0)voidArmEffect=null;
}

function useFire(){
  if(powers.fireCooldown>0)return;
  callVoidRobots(1);
  powers.fireCooldown=player.fireCooldownSetting||18;

  projectiles.push(
    new Projectile(
      player.x+player.w/2+player.direction*25,
      player.y+25,
      player.direction*13,
      0,
      15
    )
  );
}

/*
  LIGHTNING
  ----------
  The old version searched for enemies around the player, which made
  Lightning feel like a global attack.

  New behavior:
  1. Find the player's exact center X.
  2. Look upward from the player's position.
  3. If a platform is directly above the player, the bolt stops at
     the TOP of that platform.
  4. Otherwise the bolt stops at the player's current feet/position.
  5. Damage is only dealt in a very small radius around that exact
     strike point.
*/
function getLightningStrikePoint(){
  const strikeX=player.x+player.w/2;
  const playerFeet=player.y+player.h;

  let strikeY=playerFeet;

  // Find the closest platform above the player at this exact X.
  let closestPlatform=null;

  for(const b of mapBlocks){
    const xOverlaps=strikeX>=b.x && strikeX<=b.x+b.w;
    const platformAbove=b.y<=playerFeet;

    if(xOverlaps && platformAbove){
      if(
        closestPlatform===null ||
        b.y>closestPlatform.y
      ){
        closestPlatform=b;
      }
    }
  }

  if(closestPlatform){
    strikeY=closestPlatform.y;
  }

  return {x:strikeX,y:strikeY};
}

function useLightning(){
  if(powers.lightningCooldown>0)return;
  callVoidRobots(1);

  powers.lightningCooldown=player.character==='mia'?48:70;

  const point=getLightningStrikePoint();

  // Very small impact radius: lightning is now a precision strike,
  // not a screen-wide attack.
  const radius=48;

  enemies.forEach(e=>{
    const enemyCenterX=e.x+e.w/2;
    const enemyFeet=e.y+e.h;

    const distance=Math.hypot(
      enemyCenterX-point.x,
      enemyFeet-point.y
    );

    if(distance<=radius){
      e.hit(15);
    }
  });

  lightningEffect={
    x:point.x,
    y:point.y,
    top:Math.max(25,point.y-330),
    life:16
  };
}

function useExplosion(){
  if(powers.explosionCooldown>0)return;
  callVoidRobots(1);

  powers.explosionCooldown=110;

  // Anchor the blast to the player's feet so it always appears on their level,
  // even when the player is jumping or standing on a raised platform.
  const blastX=player.x+player.w/2;
  const blastY=player.y+player.h;
  const blastRadius=player.character==='kai'?185:150;

  // If the player is standing on an elevated platform, destroy that exact
  // platform when the explosion is triggered. Keep the main ground intact.
  const standingPlatformIndex=mapBlocks.findIndex(b=>
    b.y<600 &&
    player.x+player.w>b.x && player.x<b.x+b.w &&
    Math.abs((player.y+player.h)-b.y)<=8
  );
  if(standingPlatformIndex!==-1){
    const brokenPlatform=mapBlocks[standingPlatformIndex];
    mapBlocks.splice(standingPlatformIndex,1);
    // Small debris burst at the platform's top edge.
    brokenPlatformEffect={x:brokenPlatform.x,y:brokenPlatform.y,w:brokenPlatform.w,h:brokenPlatform.h,life:24,maxLife:24};
  }

  explosionEffect={x:blastX,y:blastY,radius:blastRadius,life:22,maxLife:22};

  enemies.forEach(e=>{
    const enemyX=e.x+e.w/2;
    const enemyY=e.y+e.h;
    if(Math.hypot(enemyX-blastX,enemyY-blastY)<blastRadius){
      e.hit(15);
    }
  });
}

function updatePowers(){
  if(brokenPlatformEffect){
    brokenPlatformEffect.life--;
    if(brokenPlatformEffect.life<=0)brokenPlatformEffect=null;
  }
  if(explosionEffect){
    explosionEffect.life--;
    if(explosionEffect.life<=0)explosionEffect=null;
  }
  if(voidPulseCooldown>0)voidPulseCooldown--;
  if(voidRobotCallCooldown>0)voidRobotCallCooldown--;
  updateVoidAllies();
  updateVoidCustomAbilities();
  if(voidPulseEffect){
    voidPulseEffect.life--;
    voidPulseEffect.radius=voidPulseEffect.maxRadius*(1-voidPulseEffect.life/24);
    if(voidPulseEffect.life<=0)voidPulseEffect=null;
  }
  for(const k of Object.keys(powers)){
    if(powers[k]>0)powers[k]--;
  }

  for(let i=projectiles.length-1;i>=0;i--){
    projectiles[i].update();

    if(projectiles[i].life<=0){
      projectiles.splice(i,1);
    }
  }

  if(voidCapture){
    ctx.save();
    for(const bot of voidCapture.robots){
      ctx.strokeStyle='#b75cff';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(bot.x,bot.y-30);ctx.lineTo(bot.x,bot.y+10);ctx.stroke();
      ctx.fillStyle='#21162f';ctx.strokeStyle='#d8a5ff';ctx.lineWidth=2;ctx.fillRect(bot.x-10,bot.y-8,20,16);ctx.strokeRect(bot.x-10,bot.y-8,20,16);
      ctx.fillStyle='#e6c8ff';ctx.beginPath();ctx.arc(bot.x,bot.y,3,0,Math.PI*2);ctx.fill();
      if(bot.landed){ctx.strokeStyle='#d6a4ff';ctx.beginPath();ctx.arc(bot.x,bot.y+14,13,0,Math.PI*2);ctx.stroke();}
    }
    ctx.restore();
  }
  if(voidHalfStrikeEffect){ctx.save();ctx.globalAlpha=voidHalfStrikeEffect.life/24;ctx.strokeStyle='#e5c7ff';ctx.shadowColor='#a13cff';ctx.shadowBlur=20;ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(voidHalfStrikeEffect.x-25,voidHalfStrikeEffect.y-35);ctx.lineTo(voidHalfStrikeEffect.x+15,voidHalfStrikeEffect.y+15);ctx.stroke();ctx.restore();}
  if(voidCounter){ctx.save();ctx.globalAlpha=0.65+Math.sin(voidCounter.life*0.3)*0.25;ctx.strokeStyle='#c37aff';ctx.lineWidth=3;ctx.beginPath();ctx.arc(player.x+player.w/2,player.y+player.h/2,34,0,Math.PI*2);ctx.stroke();ctx.restore();}
  if(voidArmEffect){ctx.save();ctx.globalAlpha=Math.min(1,voidArmEffect.life/12);ctx.fillStyle='#292236';ctx.strokeStyle='#bd73ff';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(voidArmEffect.x-9,voidArmEffect.y+35);ctx.lineTo(voidArmEffect.x-7,voidArmEffect.y-8);ctx.lineTo(voidArmEffect.x,voidArmEffect.y-23);ctx.lineTo(voidArmEffect.x+7,voidArmEffect.y-8);ctx.lineTo(voidArmEffect.x+9,voidArmEffect.y+35);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();}

  if(lightningEffect){
    lightningEffect.life--;
    if(lightningEffect.life<=0){
      lightningEffect=null;
    }
  }
}

function drawPowers(ctx){
  projectiles.forEach(p=>p.draw(ctx));
  if(brokenPlatformEffect){
    const b=brokenPlatformEffect;
    const progress=1-b.life/b.maxLife;
    ctx.save();
    ctx.globalAlpha=Math.max(0,b.life/b.maxLife);
    ctx.fillStyle='#ff9b45';
    for(let i=0;i<7;i++){
      const pieceX=b.x+(b.w/7)*i;
      const pieceY=b.y+progress*progress*65+(i%2)*5;
      ctx.fillRect(pieceX,pieceY,b.w/10,5);
    }
    ctx.restore();
  }
  if(explosionEffect){
    const e=explosionEffect;
    const progress=1-e.life/e.maxLife;
    ctx.save();
    ctx.globalAlpha=Math.max(0,e.life/e.maxLife);
    ctx.lineWidth=7;
    ctx.strokeStyle='#ffb347';
    ctx.shadowColor='#ff6a22';
    ctx.shadowBlur=22;
    ctx.beginPath();
    ctx.ellipse(e.x,e.y,12+progress*e.radius,5+progress*24,0,0,Math.PI*2);
    ctx.stroke();
    ctx.lineWidth=3;
    ctx.strokeStyle='#fff0bd';
    ctx.beginPath();
    ctx.ellipse(e.x,e.y,8+progress*e.radius*0.72,3+progress*16,0,0,Math.PI*2);
    ctx.stroke();
    ctx.restore();
  }
  // Friendly VOID drones: dark metal bodies with violet cores.
  for(const bot of voidAllies){
    ctx.save(); ctx.translate(bot.x,bot.y);
    ctx.shadowColor='#b44cff';ctx.shadowBlur=14;ctx.fillStyle='#252038';ctx.strokeStyle='#bd68ff';ctx.lineWidth=2;
    ctx.beginPath();ctx.roundRect(-11,-8,22,16,5);ctx.fill();ctx.stroke();
    ctx.fillStyle='#e8c8ff';ctx.beginPath();ctx.arc(0,0,3.5,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='#8d43d6';ctx.beginPath();ctx.moveTo(-15,0);ctx.lineTo(-11,0);ctx.moveTo(11,0);ctx.lineTo(15,0);ctx.stroke();
    ctx.restore();
  }
  if(voidPulseEffect){
    const e=voidPulseEffect;
    ctx.save();
    ctx.globalAlpha=Math.max(0,e.life/24)*0.8;
    ctx.strokeStyle='#b65cff';ctx.lineWidth=7;ctx.shadowColor='#a13cff';ctx.shadowBlur=28;
    ctx.beginPath();ctx.arc(e.x,e.y,e.radius,0,Math.PI*2);ctx.stroke();
    ctx.strokeStyle='#f0dcff';ctx.lineWidth=2;ctx.beginPath();ctx.arc(e.x,e.y,e.radius*0.88,0,Math.PI*2);ctx.stroke();
    ctx.restore();
  }

  if(voidCapture){
    ctx.save();
    for(const bot of voidCapture.robots){
      ctx.strokeStyle='#b75cff';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(bot.x,bot.y-30);ctx.lineTo(bot.x,bot.y+10);ctx.stroke();
      ctx.fillStyle='#21162f';ctx.strokeStyle='#d8a5ff';ctx.lineWidth=2;ctx.fillRect(bot.x-10,bot.y-8,20,16);ctx.strokeRect(bot.x-10,bot.y-8,20,16);
      ctx.fillStyle='#e6c8ff';ctx.beginPath();ctx.arc(bot.x,bot.y,3,0,Math.PI*2);ctx.fill();
      if(bot.landed){ctx.strokeStyle='#d6a4ff';ctx.beginPath();ctx.arc(bot.x,bot.y+14,13,0,Math.PI*2);ctx.stroke();}
    }
    ctx.restore();
  }
  if(voidHalfStrikeEffect){ctx.save();ctx.globalAlpha=voidHalfStrikeEffect.life/24;ctx.strokeStyle='#e5c7ff';ctx.shadowColor='#a13cff';ctx.shadowBlur=20;ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(voidHalfStrikeEffect.x-25,voidHalfStrikeEffect.y-35);ctx.lineTo(voidHalfStrikeEffect.x+15,voidHalfStrikeEffect.y+15);ctx.stroke();ctx.restore();}
  if(voidCounter){ctx.save();ctx.globalAlpha=0.65+Math.sin(voidCounter.life*0.3)*0.25;ctx.strokeStyle='#c37aff';ctx.lineWidth=3;ctx.beginPath();ctx.arc(player.x+player.w/2,player.y+player.h/2,34,0,Math.PI*2);ctx.stroke();ctx.restore();}
  if(voidArmEffect){ctx.save();ctx.globalAlpha=Math.min(1,voidArmEffect.life/12);ctx.fillStyle='#292236';ctx.strokeStyle='#bd73ff';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(voidArmEffect.x-9,voidArmEffect.y+35);ctx.lineTo(voidArmEffect.x-7,voidArmEffect.y-8);ctx.lineTo(voidArmEffect.x,voidArmEffect.y-23);ctx.lineTo(voidArmEffect.x+7,voidArmEffect.y-8);ctx.lineTo(voidArmEffect.x+9,voidArmEffect.y+35);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();}

  if(lightningEffect){
    const a=lightningEffect.life/16;
    const x=lightningEffect.x;

    ctx.save();
    ctx.globalAlpha=a;
    ctx.strokeStyle='#e8c8ff';
    ctx.shadowColor='#a63cff';
    ctx.shadowBlur=24;
    ctx.lineWidth=7;

    // Main vertical lightning bolt.
    ctx.beginPath();
    ctx.moveTo(x,lightningEffect.top);

    let y=lightningEffect.top;
    while(y<lightningEffect.y){
      const next=Math.min(y+35,lightningEffect.y);
      const offset=(Math.random()-0.5)*28;
      ctx.lineTo(x+offset,next);
      y=next;
    }

    ctx.stroke();

    // Bright inner bolt.
    ctx.strokeStyle='#ffffff';
    ctx.shadowBlur=10;
    ctx.lineWidth=2;
    ctx.beginPath();
    ctx.moveTo(x,lightningEffect.top);
    y=lightningEffect.top;

    while(y<lightningEffect.y){
      const next=Math.min(y+30,lightningEffect.y);
      const offset=(Math.random()-0.5)*18;
      ctx.lineTo(x+offset,next);
      y=next;
    }

    ctx.stroke();

    // Impact flash exactly where the lightning lands.
    ctx.fillStyle='#e8c8ff';
    ctx.shadowBlur=30;
    ctx.beginPath();
    ctx.arc(lightningEffect.x,lightningEffect.y,18,0,Math.PI*2);
    ctx.fill();

    ctx.restore();
  }
}
