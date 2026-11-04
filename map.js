const mapBlocks=[];
let mapStyle=0;

function buildMap(levelIndex=0){
  mapBlocks.length=0;
  mapStyle=levelIndex;

  // Each act has its own platform layout. Every act has a continuous floor.
  const floorY=610;
  for(let x=0;x<1280;x+=64) mapBlocks.push({x,y:floorY,w:64,h:110});

  if(levelIndex===0){
    [[170,520,150,24],[390,450,160,24],[630,520,150,24],[820,410,190,24],[1060,500,130,24]]
      .forEach(a=>mapBlocks.push({x:a[0],y:a[1],w:a[2],h:a[3]}));
  } else if(levelIndex===1){
    [[90,470,210,24],[470,400,180,24],[700,500,110,24],
     [850,360,190,24],[1080,460,140,24],[580,290,120,24]]
      .forEach(a=>mapBlocks.push({x:a[0],y:a[1],w:a[2],h:a[3]}));
  } else if(levelIndex===2){
    [[220,430,110,24],[370,330,120,24],[540,470,140,24],
     [720,360,110,24],[850,260,150,24],[1050,430,100,24],[1160,330,90,24]]
      .forEach(a=>mapBlocks.push({x:a[0],y:a[1],w:a[2],h:a[3]}));
  } else if(levelIndex===3){
    [[100,500,190,24],[350,420,150,24],[555,510,145,24],[740,390,180,24],
     [980,475,130,24],[1080,350,140,24],[430,285,120,24],[770,245,110,24]]
      .forEach(a=>mapBlocks.push({x:a[0],y:a[1],w:a[2],h:a[3]}));
  } else if(levelIndex===4){
    // ACT 5 — VOID CORE: raised platforms and a clear floor route to the exit.
    [[140,500,170,24],[360,420,150,24],[565,500,150,24],
     [755,360,170,24],[965,450,155,24],[430,285,130,24],[825,245,135,24]]
      .forEach(a=>mapBlocks.push({x:a[0],y:a[1],w:a[2],h:a[3]}));
  }
}

function resolvePlayerMap(p){
  p.onGround=false;
  for(const b of mapBlocks){
    if(p.x+p.w>b.x&&p.x<b.x+b.w&&p.y+p.h>b.y&&p.y+p.h-p.vy<=b.y&&p.vy>=0){
      p.y=b.y-p.h;p.vy=0;p.onGround=true;
    }
    if(p.x+p.w>b.x&&p.x<b.x+b.w&&p.y<b.y+b.h&&p.y+p.h>b.y+10){
      if(p.x+p.w/2<b.x+b.w/2)p.x=b.x-p.w;
      else p.x=b.x+b.w;
    }
  }
  p.x=Math.max(0,Math.min(1220,p.x));
}

function drawMap(ctx){
  const styles=[
    {sky:'#080b1d',building:'#11182a',glow:'#7d3cff',ground:'#151b2c'},
    {sky:'#130b14',building:'#24151d',glow:'#ff4d7d',ground:'#1b1824'},
    {sky:'#070f19',building:'#102333',glow:'#3c9cff',ground:'#121d2a'},
    {sky:'#160b0b',building:'#291819',glow:'#ff642e',ground:'#21191a'},
    {sky:'#080516',building:'#1a1230',glow:'#b04cff',ground:'#171326'}
  ];
  const s=styles[mapStyle] || styles[0];

  ctx.fillStyle=s.sky;
  ctx.fillRect(0,0,1280,720);

  // Background skyline changes by act.
  for(let i=0;i<15;i++){
    const x=i*92-20;
    const h=90+((i*37+mapStyle*71)%220);
    ctx.fillStyle=s.building;
    ctx.fillRect(x,610-h,65,h);
    ctx.fillStyle=s.glow;
    for(let y=625-h;y<595;y+=25){
      if((i+y+mapStyle)%3!==0) ctx.fillRect(x+10,y,5,8);
    }
  }

  if(mapStyle===0){
    ctx.fillStyle='#17223b';ctx.fillRect(0,575,1280,35);
    ctx.strokeStyle='#5f7cff';ctx.beginPath();ctx.moveTo(0,570);ctx.lineTo(1280,570);ctx.stroke();
  } else if(mapStyle===1){
    ctx.fillStyle='#2a1018';
    for(let x=0;x<1280;x+=160){
      ctx.fillRect(x,130,8,440);ctx.fillStyle='#ff335f';ctx.fillRect(x+2,160,4,7);ctx.fillStyle='#2a1018';
    }
  } else if(mapStyle===2){
    ctx.strokeStyle='#244f79';ctx.lineWidth=2;
    for(let x=0;x<1280;x+=100){ctx.beginPath();ctx.moveTo(x,610);ctx.lineTo(x+70,120);ctx.stroke();}
  } else if(mapStyle===3){
    ctx.fillStyle='#38272a';ctx.fillRect(0,145,1280,16);ctx.fillRect(0,155,1280,6);
    for(let x=80;x<1280;x+=240){ctx.fillRect(x,150,12,420);ctx.fillStyle='#ff642e';ctx.fillRect(x+3,180,6,10);ctx.fillStyle='#38272a';}
    ctx.fillStyle='#6b2a20';ctx.fillRect(530,90,220,70);ctx.fillStyle='#ff642e';ctx.fillRect(555,112,170,8);
  } else {
    // ACT 5 — pulsing-looking violet core chamber geometry.
    ctx.fillStyle='#26113d';ctx.fillRect(500,105,280,18);
    ctx.fillStyle='#6029a0';ctx.fillRect(620,125,40,390);
    ctx.fillStyle=s.glow;
    ctx.fillRect(610,180,60,10);ctx.fillRect(610,260,60,10);ctx.fillRect(610,340,60,10);
    ctx.fillStyle='#26113d';ctx.fillRect(0,145,1280,14);
  }

  ctx.fillStyle=s.ground;
  mapBlocks.forEach(b=>{
    ctx.fillRect(b.x,b.y,b.w,b.h);
    ctx.strokeStyle=s.glow;
    ctx.strokeRect(b.x,b.y,b.w,b.h);
  });

  // Keep the exit aligned with the exit coordinates used in level.js.
  const exitX=levels[mapStyle] ? levels[mapStyle].exit[0] : 1180;
  const exitY=levels[mapStyle] ? levels[mapStyle].exit[1] : 530;
  ctx.fillStyle=s.glow;
  ctx.fillRect(exitX,exitY,70,80);
  ctx.fillStyle='#e8dcff';
  ctx.font='12px Arial';
  ctx.fillText('EXIT',exitX+12,exitY-10);
}
