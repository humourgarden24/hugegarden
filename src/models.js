import * as THREE from 'three';
const mat = (color,extra={}) => new THREE.MeshStandardMaterial({color,roughness:.72,...extra});
function mesh(group,geometry,material,x=0,y=0,z=0,hotspot){
  const part=new THREE.Mesh(geometry,material); part.position.set(x,y,z); part.castShadow=true; part.receiveShadow=true;
  if(hotspot) part.userData.hotspot=hotspot;
  group.add(part); return part;
}
function box(g,m,w,h,d,x,y,z,id){return mesh(g,new THREE.BoxGeometry(w,h,d),m,x,y,z,id);}
function cylinder(g,m,top,bottom,h,x,y,z,id,segments=32){return mesh(g,new THREE.CylinderGeometry(top,bottom,h,segments),m,x,y,z,id);}
function dome(g,m,r,x,y,z,id){
  const profile=[[0,0],[.8*r,0],[r,.35*r],[.94*r,.65*r],[.65*r,1.05*r],[.25*r,1.35*r],[0,1.55*r]].map(([a,b])=>new THREE.Vector2(a,b));
  return mesh(g,new THREE.LatheGeometry(profile,32),m,x,y,z,id);
}
function arch(g,m,width,height,x,y,z){
  const s=new THREE.Shape();s.moveTo(-width/2,0);s.lineTo(-width/2,height*.58);s.quadraticCurveTo(-width/2,height*.84,0,height);s.quadraticCurveTo(width/2,height*.84,width/2,height*.58);s.lineTo(width/2,0);s.closePath();
  return mesh(g,new THREE.ShapeGeometry(s),m,x,y,z);
}
export function makeMonument(id){
  const g=new THREE.Group();
  const marble=mat('#eee4cb'),gold=mat('#c9a45c',{metalness:.5}),stone=mat('#963e29'),dark=mat('#463d32',{side:THREE.DoubleSide}),grass=mat('#3c6546'),water=mat('#3d5560',{metalness:.4,roughness:.2});
  if(id==='taj'){
    box(g,grass,10,.15,14,0,.075,3,'garden');
    box(g,marble,9,.4,9,0,.3,0);
    box(g,marble,4.8,2.5,4.8,0,1.75,0);
    cylinder(g,marble,1.45,1.45,.45,0,3.23,0,'dome');dome(g,marble,1.5,0,3.45,0,'dome');
    cylinder(g,gold,0,.08,.65,0,6,0,'dome');
    for(const x of [-3.7,3.7])for(const z of [-3.7,3.7]){
      cylinder(g,marble,.17,.26,3.65,x,2.3,z,'minaret');
      for(const y of [1.4,2.6,4.05])cylinder(g,marble,.33,.33,.12,x,y,z,'minaret');
      dome(g,marble,.29,x,4.14,z,'minaret');
    }
    for(const x of [-1.9,1.9])for(const z of [-1.9,1.9]){
      cylinder(g,marble,.44,.44,.5,x,3.25,z);dome(g,marble,.51,x,3.5,z,'dome');
    }
    for(const x of [-1.65,0,1.65]){
      arch(g,dark,x===0?1.45:.72,x===0?2.15:1.7,x,.5,2.411);
      const side=arch(g,dark,.8,1.7,2.411,.5,x);side.rotation.y=Math.PI/2;
    }
    box(g,water,.55,.03,5,0,.17,7,'garden');box(g,marble,8,.02,.35,0,.17,7,'garden');
    for(const x of [-3.3,3.3])for(const z of [5.5,7.5,9.5]){
      cylinder(g,grass,.16,.28,1.2,x,.7,z,'garden');
    }
  }else if(id==='qutub'){
    box(g,mat('#bca88a'),6,.3,6,0,.15,0,'base');
    const heights=[2.45,1.65,1.4,1.05,.9],radii=[1,.77,.58,.43,.33,.23];let y=.3;
    heights.forEach((h,i)=>{
      const m=i<3?stone:marble;
      cylinder(g,m,radii[i+1],radii[i],h,0,y+h/2,0,'tower',48);
      y+=h;cylinder(g,m,radii[i+1]+.2,radii[i+1]+.15,.16,0,y,0,'balcony');
      if(i<3)for(let j=0;j<20;j++){
        const a=j/20*Math.PI*2,r=(radii[i]+radii[i+1])/2;
        cylinder(g,mat('#b96843'),.04,.065,h-.2,Math.sin(a)*r,y-h/2,Math.cos(a)*r,'tower',6);
      }
    });
    cylinder(g,stone,.02,.24,.35,0,y+.17,0,'tower');
  }else{
    box(g,mat('#ad9471'),11,.25,8,0,.125,0);
    box(g,stone,11,1.9,.4,0,1.2,3,'walls');box(g,stone,11,1.9,.4,0,1.2,-3,'walls');
    for(const x of [-5.3,5.3])box(g,stone,.4,1.9,6,x,1.2,0,'walls');
    box(g,stone,3.1,3.5,1.7,0,2,2.55,'gate');arch(g,dark,1.25,2.3,0,.25,3.411).userData.hotspot='gate';
    for(const x of [-5.3,-1.8,1.8,5.3]){
      cylinder(g,stone,.48,.58,2.8,x,1.65,3,'walls',16);dome(g,marble,.45,x,3.05,3,'gate');
    }
    for(let x=-5;x<=5;x+=.5)box(g,stone,.2,.3,.48,x,2.25,3,'walls');
    box(g,marble,4,.18,2,0,.35,-1,'palace');box(g,marble,4,.18,2,0,1.9,-1,'palace');
    for(const x of [-1.8,-.6,.6,1.8])for(const z of [-1.8,-.2])cylinder(g,marble,.065,.065,1.4,x,1.1,z,'palace',12);
    box(g,water,.2,.04,3,0,.4,-.5,'palace');
  }
  return g;
}

// Gallery materials and furnishings are procedural, so no external image downloads are needed.
function canvasTexture(draw,size=512){
  const canvas=document.createElement('canvas');canvas.width=size;canvas.height=size;draw(canvas.getContext('2d'),size);
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;return texture;
}
function floorTexture(){
  const texture=canvasTexture((c,size)=>{
    let seed=187;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
    c.fillStyle='#16151a';c.fillRect(0,0,size,size);
    for(let row=0;row<4;row++)for(let col=0;col<4;col++){
      const brightness=22+Math.floor(random()*10);c.fillStyle=`rgb(${brightness+4},${brightness+2},${brightness+5})`;c.fillRect(col*128+1,row*128+1,126,126);
    }
    for(let n=0;n<22000;n++){const value=random()>.5?255:55;c.fillStyle=`rgba(${value},${value},${value},.035)`;c.fillRect(random()*size,random()*size,random()*4,1);}
    c.strokeStyle='#5a4a32';c.lineWidth=1.4;for(let n=0;n<=4;n++){c.beginPath();c.moveTo(n*128,0);c.lineTo(n*128,size);c.stroke();c.beginPath();c.moveTo(0,n*128);c.lineTo(size,n*128);c.stroke();}
  });texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.repeat.set(4,6);texture.anisotropy=4;return texture;
}
function artTexture(index){return canvasTexture((c,size)=>{
  const bg=['#1a1712','#151820','#1c1410','#18161a'][index%4];c.fillStyle=bg;c.fillRect(0,0,size,size);
  c.strokeStyle=index%4===1?'#c9a86a':'#b08d57';c.fillStyle=c.strokeStyle;c.lineWidth=3;c.textAlign='center';
  c.font='22px Georgia';c.fillText(['FORM & SYMMETRY','TOWERS OF TIME','WALLS & GATEWAYS','INDIAN HERITAGE'][index%4],size/2,65);
  c.font='12px Arial';c.fillText('KAAL DARPAN  /  HERITAGE COLLECTION',size/2,95);
  if(index%4===0){
    c.strokeRect(105,310,302,125);c.beginPath();c.ellipse(256,282,80,72,0,Math.PI,0);c.lineTo(336,310);c.lineTo(176,310);c.lineTo(176,282);c.stroke();
    for(const x of [70,442]){c.strokeRect(x-10,260,20,175);c.beginPath();c.moveTo(x-15,260);c.lineTo(x,228);c.lineTo(x+15,260);c.stroke();}
    for(const x of [166,256,346]){c.beginPath();c.moveTo(x-20,434);c.lineTo(x-20,370);c.quadraticCurveTo(x,320,x+20,370);c.lineTo(x+20,434);c.stroke();}
  }else if(index%4===1){
    c.beginPath();c.moveTo(195,445);c.lineTo(235,160);c.lineTo(277,160);c.lineTo(317,445);c.closePath();c.stroke();
    for(const y of [230,300,370,440]){c.beginPath();c.moveTo(180+(440-y)*.12,y);c.lineTo(330-(440-y)*.12,y);c.stroke();}
    for(let n=0;n<7;n++){c.beginPath();c.moveTo(205+n*16,435);c.lineTo(240+n*5,168);c.stroke();}
  }else{
    c.strokeRect(75,285,360,150);c.strokeRect(205,205,100,230);for(let x=75;x<435;x+=24)c.strokeRect(x,271,14,14);
    c.beginPath();c.moveTo(235,435);c.lineTo(235,320);c.quadraticCurveTo(256,285,277,320);c.lineTo(277,435);c.stroke();
  }
  c.globalAlpha=.35;for(let i=0;i<18;i++){c.beginPath();c.moveTo(35,140+i*18);c.lineTo(477,140+i*18);c.stroke();}
});}
function framedArt(g,index,x,y,z,rotation=0){
  const frame=new THREE.Group();frame.position.set(x,y,z);frame.rotation.y=rotation;
  box(frame,mat('#6b5532',{metalness:.6,roughness:.4}),2,2.4,.10,0,0,0);
  box(frame,mat('#0d0b0a'),1.85,2.25,.035,0,0,.07);
  const picture=new THREE.Mesh(new THREE.PlaneGeometry(1.64,2.04),new THREE.MeshStandardMaterial({map:artTexture(index),roughness:.85}));picture.position.z=.095;frame.add(picture);g.add(frame);
}
function bench(g,x,z,rotation=0){
  const seat=new THREE.Group();seat.position.set(x,0,z);seat.rotation.y=rotation;
  const leather=mat('#3a281e',{roughness:.9}),legs=mat('#282a29',{metalness:.4});
  box(seat,leather,3.1,.44,1.05,0,.59,0);
  for(const x of [-1.28,1.28])box(seat,legs,.14,.38,.72,x,.23,0);
  for(const x of [-.52,.52])box(seat,mat('#382f29'),.012,.003,1.03,x,.812,0);
  g.add(seat);
}
function artifactTable(g,x,z,w=2.1){
  const white=mat('#1d1b20',{roughness:.45});box(g,white,w,.95,1.3,x,.475,z);box(g,mat('#8a6e44',{metalness:.6,roughness:.35}),w-.08,.035,1.22,x,.98,z);
  const pottery=mat('#7e7054',{roughness:.86});
  for(let i=0;i<3;i++){
    const a=x+(i-1)*.48;const profile=[[0,0],[.15,0],[.22,.15],[.15,.33],[.075,.36],[.08,.46]].map(v=>new THREE.Vector2(...v));
    mesh(g,new THREE.LatheGeometry(profile,20),pottery,a,1,z);
  }
}
export function makeHall(){
  const hall=new THREE.Group();const white=mat('#1a181d',{roughness:.85}),trim=mat('#8a6e44',{metalness:.6,roughness:.4}),frame=mat('#3a3f48',{metalness:.5}),black=mat('#0c0b0e'),light=new THREE.MeshStandardMaterial({color:'#ffd9a0',emissive:'#ffb866',emissiveIntensity:1.6});
  box(hall,mat('#18151a',{map:floorTexture(),roughness:.38,metalness:.15}),20,.16,36,0,-.08,0);
  // Darker walls, a recessed rear gallery, and a large glazed side wall.
  box(hall,mat('#1a181d',{roughness:.85}),.28,8.2,32,-10,4.1,1);
  for(const x of [-6.4,6.4])box(hall,mat('#1a181d',{roughness:.85}),7.2,8.2,.28,x,4.1,-13.5);
  box(hall,mat('#1a181d',{roughness:.85}),5.6,1.65,.28,0,7.375,-13.5);
  box(hall,mat('#1a181d',{roughness:.85}),5.6,8.2,.28,0,4.1,-17.5);
  for(const x of [-2.8,2.8])box(hall,mat('#1a181d',{roughness:.85}),.25,8.2,4,x,4.1,-15.5);
  box(hall,mat('#1a181d',{roughness:.85}),.28,1.4,32,10,.7,1);box(hall,mat('#1a181d',{roughness:.85}),.28,1.9,32,10,7.25,1);
  box(hall,trim,.10,.18,32,-9.8,.1,1);box(hall,trim,.10,.18,32,9.8,.1,1);
  const glass=new THREE.MeshPhysicalMaterial({color:'#7f93b0',transparent:true,opacity:.14,roughness:.08,metalness:.05,side:THREE.DoubleSide,depthWrite:false});
  for(let z=-11.4;z<16;z+=4){
    const panel=box(hall,glass,.025,4.8,3.82,10,3.8,z);panel.castShadow=false;
    box(hall,frame,.15,4.95,.12,9.86,3.8,z-1.97);
  }
  for(const y of [1.35,3.35,6.3])box(hall,frame,.18,.12,30,9.86,y,1);
  // Darker ceiling with darker perimeter soffits and luminous fixtures.
  box(hall,black,20,.18,32,0,8.25,1);
  for(const x of [-7.4,7.4])box(hall,mat('#14161a',{roughness:.85}),5.2,1.05,32,x,7.62,1);
  for(let z=-13;z<=16;z+=.7)box(hall,mat('#0f0e12'),9.8,.12,.15,0,8.04,z);
  for(const x of [-2.6,2.6])box(hall,black,.16,.3,27,x,7.87,1);
  for(let z=-10;z<=13;z+=4.5){
    for(const x of [-7.4,7.4])box(hall,light,.45,.035,2.1,x,7.065,z);
    for(const x of [-2.6,2.6]){
      const fixture=cylinder(hall,black,.10,.10,.27,x,7.59,z,undefined,16);
      fixture.rotation.x=.14;cylinder(hall,light,.076,.076,.02,x,7.44,z,undefined,16);
    }
  }
  framedArt(hall,0,-9.82,3.3,7,Math.PI/2);framedArt(hall,1,-9.82,3.3,.2,Math.PI/2);framedArt(hall,2,-9.82,3.3,-7,Math.PI/2);
  framedArt(hall,1,-6.4,3.4,-13.3);framedArt(hall,2,6.4,3.4,-13.3);framedArt(hall,0,0,3.6,-17.28);
  // Seating and smaller object displays leave clear aisles around the three monuments.
  bench(hall,-4.5,5.5);bench(hall,6.2,5.3,Math.PI/2);bench(hall,-4.8,-6.4);
  artifactTable(hall,-8.2,5,2.25);artifactTable(hall,7.5,-7,2.3);artifactTable(hall,0,-14.8,2.3);
  const rug=canvasTexture((c,s)=>{c.fillStyle='#2a1c16';c.fillRect(0,0,s,s);for(let row=0;row<9;row++)for(let col=0;col<8;col++){c.fillStyle=['#5a3a26','#3a2a20','#7a5a36'][(row*3+col)%3];c.fillRect(col*s/8+(row%2)*16,row*s/9,s/11,s/10);}});
  const carpet=new THREE.Mesh(new THREE.PlaneGeometry(5.6,4),mat('#ffffff',{map:rug,roughness:1}));carpet.rotation.x=-Math.PI/2;carpet.position.set(-4.2,.014,5);carpet.receiveShadow=true;hall.add(carpet);
  // Outdoor greenery is actual geometry seen through the windows.
  box(hall,mat('#141a1e'),18,.1,54,20,-.15,0);
  const leaf=mat('#1e2a2c'),trunk=mat('#2a2622');
  for(let i=0;i<10;i++){const x=14+(i%3)*3,z=-15+i*3.4;cylinder(hall,trunk,.10,.15,3,x,1.5,z);mesh(hall,new THREE.IcosahedronGeometry(1.7,1),leaf,x,4.1,z);}
  return hall;
}
export const galleryPositions = [[0,0,6],[0,0,-4.5],[-5.5,0,-1.1]];
export function makePedestal(id,index){
  const p=new THREE.Group();p.userData.monument=id;
  const white=mat('#1a181d',{roughness:.43}),edge=mat('#b08d57',{roughness:.3,metalness:.8});
  const width=id==='taj'?4.45:id==='fort'?4.2:3.2,depth=id==='taj'?5.2:id==='fort'?3.1:3.2;
  box(p,mat('#0e0d10'),width-.2,.13,depth-.2,0,.07,0);
  box(p,white,width,1.1,depth,0,.65,0);box(p,edge,width+.015,.025,depth+.015,0,1.215,0);
  const model=makeMonument(id),scale=id==='taj'?.335:id==='qutub'?.34:.335;model.scale.setScalar(scale);model.position.set(0,1.25,id==='taj'?-3*scale:0);p.add(model);
  const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=256;const c=canvas.getContext('2d');
  c.fillStyle='#0d0b0c';c.fillRect(0,0,1024,256);c.fillStyle='#b08d57';c.font='24px Arial';c.fillText('0'+(index+1)+'  /  HERITAGE COLLECTION',42,53);
  c.fillStyle='#e8dcc8';c.font='54px Georgia';c.fillText(['Taj Mahal','Qutub Minar','Red Fort'][index],42,132);
  c.fillStyle='#ede0d4e5';c.font='23px Arial';c.fillText('SELECT THE MINIATURE TO EXPLORE',42,200);
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;
  const label=new THREE.Mesh(new THREE.PlaneGeometry(Math.min(width-.45,3.6),.65),new THREE.MeshBasicMaterial({map:texture}));label.position.set(0,.73,depth/2+.008);p.add(label);
  return p;
}
