class Player {
  constructor(){
    this.x=120; this.y=450; this.w=42; this.h=62;
    this.vx=0; this.vy=0; this.speed=5; this.sprintSpeed=8;
    this.gravity=.8; this.jumpForce=-23; this.health=100;
    this.direction=1; this.onGround=false; this.invuln=0;
    this.dashTimer=0; this.dashCooldown=0;
    this.animTime=0; this.animFrame=0; this.animState='idle';
    this.character='void';this.actionTimer=0;this.maxHealth=100;this.applyCharacterStats(false);
  }
  applyCharacterStats(preserveHealth=true){
    const oldMax=this.maxHealth||100;
    const oldHealth=this.health===undefined?oldMax:this.health;
    const stats={
      void:{maxHealth:100,speed:5,sprintSpeed:8,dashCooldown:55,fireCooldown:18,ability:'VOID DASH — balanced mobility'},
      alex:{maxHealth:100,speed:5.5,sprintSpeed:8.5,dashCooldown:55,fireCooldown:11,ability:'RAPID FIRE — faster shots'},
      mia:{maxHealth:95,speed:5,sprintSpeed:8,dashCooldown:55,fireCooldown:18,ability:'LIGHTNING OVERCHARGE — faster lightning recharge'},
      kai:{maxHealth:130,speed:4.5,sprintSpeed:7.2,dashCooldown:65,fireCooldown:18,ability:'GREEN TITAN — extra health and wider explosion'}
    };
    const cfg=stats[this.character]||stats.void;
    this.maxHealth=cfg.maxHealth;this.speed=cfg.speed;this.sprintSpeed=cfg.sprintSpeed;
    this.baseDashCooldown=cfg.dashCooldown;this.fireCooldownSetting=cfg.fireCooldown;this.ability=cfg.ability;
    this.health=preserveHealth?Math.max(1,Math.min(this.maxHealth,Math.round(oldHealth/oldMax*this.maxHealth))):this.maxHealth;
  }
  setCharacter(name){
    if(!['void','alex','mia','kai'].includes(name)||name===this.character)return false;
    this.character=name;this.applyCharacterStats(true);this.animFrame=0;this.animTime=0;
    return true;
  }
  reset(x=120,y=450){this.x=x;this.y=y;this.vx=0;this.vy=0;this.applyCharacterStats(false);this.invuln=50;this.dashTimer=0;this.dashCooldown=0;this.actionTimer=0;this.animState='idle';this.animTime=0;this.animFrame=0}
  update(){
    const left=keys['a']||keys['arrowleft'], right=keys['d']||keys['arrowright'];
    if(this.dashTimer>0){this.vx=this.direction*30;this.dashTimer--}
    else{
      let s=keys['shift']?this.sprintSpeed:this.speed;
      if(left){this.vx=-s;this.direction=-1}
      else if(right){this.vx=s;this.direction=1}
      else this.vx*=.78;
      this.vy+=this.gravity;
    }
    if((keys['w']||keys['arrowup']||keys[' ']) && this.onGround){this.vy=this.jumpForce;this.onGround=false}
    this.x+=this.vx; this.y+=this.vy;
    resolvePlayerMap(this);
    if(this.invuln>0)this.invuln--;
    if(this.dashCooldown>0)this.dashCooldown--;
    if(this.actionTimer>0)this.actionTimer--;
     this.updateAnimation(left, right);
  }
  dash(){
    if(this.dashCooldown<=0 && this.dashTimer<=0){this.dashTimer=9;this.dashCooldown=this.baseDashCooldown||55;this.invuln=15}
  }
  hurt(amount){
    if(this.invuln>0)return;
    if(this.character==='void' && typeof triggerVoidCounter==='function' && triggerVoidCounter()){this.invuln=25;return;}
    this.health-=amount;this.invuln=45;this.actionTimer=18;this.animState='hurt';this.animFrame=0;this.animTime=0;
    if(this.health<=0) playerDied();
  }
  updateAnimation(left, right){
    let state='idle';
    if(this.dashTimer>0) state='dash';
    else if(this.actionTimer>0) state=this.animState==='hurt'?'hurt':'attack';
    else if(!this.onGround && this.vy < -1) state='jump';
    else if(!this.onGround && this.vy >= -1) state='fall';
    else if(Math.abs(this.vx)>0.75) state='run';
    if(state!==this.animState){this.animState=state;this.animTime=0;this.animFrame=0;}
    // Idle stays on its first frame; running cycles through all run frames.
    if(state==='idle'){
      this.animFrame=0;
      this.animTime=0;
      return;
    }
    this.animTime++;
    const row=PLAYER_ROWS[state] || PLAYER_ROWS.idle;
    if(this.animTime >= row.speed){
      this.animTime=0;
      this.animFrame=(this.animFrame+1)%row.frames;
    }
  }
  performAttack(){this.actionTimer=24;this.animState='attack';this.animTime=0;this.animFrame=0;}
  draw(ctx){
    // Draw the sprite even while temporarily invulnerable.
    if(drawAtlasCharacter(ctx,this.character,this.animState,this.animFrame,this.x,this.y,this.w,this.h,this.direction))return;
    // Visible placeholder only if the atlas has not loaded.
    ctx.fillStyle=({void:'#a13cff',alex:'#287aff',mia:'#c45bff',kai:'#36d66b'})[this.character]||'#287aff';ctx.fillRect(this.x,this.y,this.w,this.h);
  }
}
