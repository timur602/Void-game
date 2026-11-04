class Enemy {
  constructor(x,y,type='hunter'){
    this.x=x; this.y=y; this.type=type;
    this.w=type==='boss'?76:42; this.h=type==='boss'?86:58;
    this.hp=type==='boss'?320:type==='guardian'?90:35;
    this.maxHp=this.hp;
    this.speed=type==='boss'?0.85:type==='guardian'?1.2:2.1;
    this.cool=0;
    this.vx=0;
    this.vy=0;
    this.gravity=0.8;
    this.onGround=false;
    this.direction=-1;this.animState="idle";this.animFrame=0;this.animTime=0;this.actionTimer=0;this.stunTimer=0;
  }

  update(){
    // Gravity works for enemies too.
    this.vy += this.gravity;
    if(this.stunTimer>0 && !this.capturedByVoid)this.stunTimer--;

    const dx=player.x-this.x;

    // Stop a little before the player instead of crowding into the same space.
    // Enemies notice the player across almost the entire level, so they
    // do not remain passive while the player attacks from long range.
    if(this.stunTimer>0){
      this.vx=0;
    }else if(Math.abs(dx)<1250 && Math.abs(dx)>this.w+14){
      this.vx=Math.sign(dx)*this.speed;
    }else{
      this.vx=0;
    }

    this.direction=this.vx<0?-1:this.vx>0?1:this.direction;
     this.x += this.vx;
    this.y += this.vy;

    this.resolveMapCollision();

    if(this.cool>0)this.cool--;

    if(this.stunTimer<=0 && Math.abs(dx)<55 && Math.abs(player.y-this.y)<60 && this.cool<=0){
      player.hurt(this.type==='boss'?24:this.type==='guardian'?18:10);
      this.cool=45;this.actionTimer=18;
    }

    // Remove enemies that fall far below the world.
    if(this.y>760)this.dead=true;
    if(this.actionTimer>0)this.actionTimer--;
    const state=this.actionTimer>0?'attack':!this.onGround?(this.vy<0?'jump':'fall'):Math.abs(this.vx)>.15?'run':'idle';
    if(state!==this.animState){this.animState=state;this.animFrame=0;this.animTime=0}
    const row=ENEMY_ROWS[this.animState];
    // No moving animation when stationary.
    if(this.animState==='idle'){this.animFrame=0;this.animTime=0;}
    else if(++this.animTime>=row.speed){this.animTime=0;this.animFrame=(this.animFrame+1)%row.frames}
  }

  resolveMapCollision(){
    this.onGround=false;

    for(const b of mapBlocks){
      const horizontal=this.x+this.w>b.x && this.x<b.x+b.w;

      // Landing on top of a platform.
      if(
        horizontal &&
        this.y+this.h>b.y &&
        this.y+this.h-this.vy<=b.y &&
        this.vy>=0
      ){
        this.y=b.y-this.h;
        this.vy=0;
        this.onGround=true;
      }

      // Side collision.
      if(
        horizontal &&
        this.y+this.h>b.y+8 &&
        this.y<b.y+b.h
      ){
        if(this.x+this.w/2 < b.x+b.w/2){
          this.x=b.x-this.w;
        }else{
          this.x=b.x+b.w;
        }
        this.vx=0;
      }
    }

    // World floor safety.
    if(this.y+this.h>720){
      this.y=720-this.h;
      this.vy=0;
      this.onGround=true;
    }
  }

  hit(d){
    if(this.capturedByVoid){this.capturedByVoid=false;this.stunTimer=0;if(typeof showMessage==='function')showMessage('RESTRAINT BROKEN');}
    this.hp-=d;this.actionTimer=12;
    if(this.hp<=0)this.dead=true;
  }

  draw(ctx){
    if(this.type!=='boss'&&drawAtlasCharacter(ctx,this.type,this.animState,this.animFrame,this.x,this.y,this.w,this.h,this.direction,true))return;
    ctx.fillStyle=this.type==='boss'?'#8f2e24':this.type==='guardian'?'#3267af':'#e23c44';
    ctx.fillRect(this.x,this.y,this.w,this.h);
    if(this.type==='boss'){
      ctx.fillStyle='#ff6a32';ctx.fillRect(this.x+12,this.y+16,12,9);ctx.fillRect(this.x+52,this.y+16,12,9);
      ctx.fillStyle='#ffc06a';ctx.fillRect(this.x+20,this.y+52,36,7);
      ctx.fillStyle='#1a1115';ctx.fillRect(this.x+7,this.y-12,this.w-14,5);
      ctx.fillStyle='#ff6a32';ctx.fillRect(this.x+7,this.y-12,(this.w-14)*Math.max(0,this.hp/this.maxHp),5);
    }
  }
}
