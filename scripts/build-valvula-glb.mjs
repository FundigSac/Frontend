// Reconstrucción multivista de v-01…v-10. Unidades visuales, sin uso metrológico.
import * as T from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { Document, NodeIO } from '@gltf-transform/core';
import { KHRMaterialsClearcoat } from '@gltf-transform/extensions';
import fs from 'node:fs';
import sharp from 'sharp';
const doc = new Document(), buffer = doc.createBuffer(), scene = doc.createScene('DN100');
const root = doc.createNode('valvula').setTranslation([0,-1.02,0]); scene.addChild(root);
const cc=doc.createExtension(KHRMaterialsClearcoat);
const blue=doc.createMaterial('epoxi-azul').setBaseColorFactor([0.002,0.055,0.48,1]).setMetallicFactor(0.04).setRoughnessFactor(.25).setExtension('KHR_materials_clearcoat',cc.createClearcoat().setClearcoatFactor(.65).setClearcoatRoughnessFactor(.2));
const steel=doc.createMaterial('acero').setBaseColorFactor([.68,.71,.75,1]).setMetallicFactor(1).setRoughnessFactor(.25);
const brass=doc.createMaterial('laton').setBaseColorFactor([.65,.43,.10,1]).setMetallicFactor(1).setRoughnessFactor(.28);
const dark=doc.createMaterial('junta-EPDM').setBaseColorFactor([.008,.009,.012,1]).setRoughnessFactor(.8);
const label=doc.createMaterial('etiqueta').setBaseColorFactor([1,1,1,1]).setRoughnessFactor(.6);
label.setBaseColorTexture(doc.createTexture('H-ITALY').setImage(fs.readFileSync('public/models/etiqueta-real.png')).setMimeType('image/png'));
// Deterministic, isotropic fine casting texture; never stretch a one-channel buffer as RGB.
let seed=9173; const n=256, heights=new Float32Array(n*n);
for(let i=0;i<heights.length;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0; heights[i]=seed/4294967296;}
const pixels=Buffer.alloc(n*n*3);
const h=(x,y)=>heights[((y+n)%n)*n+(x+n)%n];
for(let y=0;y<n;y++)for(let x=0;x<n;x++){const v=new T.Vector3((h(x-1,y)-h(x+1,y))*.07,(h(x,y-1)-h(x,y+1))*.07,1).normalize(); const i=(y*n+x)*3;pixels[i]=Math.round((v.x*.5+.5)*255);pixels[i+1]=Math.round((v.y*.5+.5)*255);pixels[i+2]=Math.round((v.z*.5+.5)*255);}
const normal=await sharp(pixels,{raw:{width:n,height:n,channels:3}}).png().toBuffer();
blue.setNormalTexture(doc.createTexture('fundicion-fina').setImage(normal).setMimeType('image/png')).setNormalScale(.35);
function mesh(name,g,mat=blue,p=[0,0,0],r=[0,0,0]){
 g.rotateX(r[0]);g.rotateY(r[1]);g.rotateZ(r[2]);
 const primitive=doc.createPrimitive().setMaterial(mat);
 for(const [key,attr,type] of [['POSITION','position','VEC3'],['NORMAL','normal','VEC3'],['TEXCOORD_0','uv','VEC2']]) if(g.attributes[attr])primitive.setAttribute(key,doc.createAccessor().setType(type).setArray(new Float32Array(g.attributes[attr].array)).setBuffer(buffer));
 if(g.index)primitive.setIndices(doc.createAccessor().setType('SCALAR').setArray(new (g.attributes.position.count < 65536 ? Uint16Array : Uint32Array)(g.index.array)).setBuffer(buffer));
 root.addChild(doc.createNode(name).setTranslation(p).setMesh(doc.createMesh(name).addPrimitive(primitive)));g.dispose();
}
const cyl=(radius,height,segments=80)=>new T.CylinderGeometry(radius,radius,height,segments);
const round=(w,h,d,r=.05)=>new RoundedBoxGeometry(w,h,d,3,r);
const lathe=(points)=>new T.LatheGeometry(points.map(([r,y])=>new T.Vector2(r,y)),96);
function roundedShape(w,d,r){const s=new T.Shape(),x=-w/2,y=-d/2;s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+d-r);s.quadraticCurveTo(x+w,y+d,x+w-r,y+d);s.lineTo(x+r,y+d);s.quadraticCurveTo(x,y+d,x,y+d-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);return s;}
function plate(name,w,d,depth,y,mat=blue){const g=new T.ExtrudeGeometry(roundedShape(w,d,.13),{depth,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:.014,bevelThickness:.014,curveSegments:12});mesh(name,g,mat,[0,y,0],[-Math.PI/2,0,0]);}
// Hollow pipe and blended sockets.
mesh('cuerpo-paso-real',lathe([[.50,-.88],[.64,-.88],[.68,-.78],[.66,-.65],[.62,-.53],[.62,.53],[.66,.65],[.68,.78],[.64,.88],[.50,.88],[.50,-.88]]),blue,[0,0,0],[0,0,Math.PI/2]);
for(const side of [-1,1]){
 const shape=new T.Shape();shape.absarc(0,0,1.05,0,Math.PI*2,false);
 const bore=new T.Path();bore.absarc(0,0,.50,0,Math.PI*2,true);shape.holes.push(bore);
 // Three openings on either side, two at the top and two at the bottom.
 for(const angle of [0,35,70,110,145,180,215,250,290,325]){
  const a=angle*Math.PI/180, hole=new T.Path();
  hole.absarc(.86*Math.cos(a),.86*Math.sin(a),.094,0,Math.PI*2,true);shape.holes.push(hole);
 }
 const g=new T.ExtrudeGeometry(shape,{depth:.145,bevelEnabled:true,bevelSize:.018,bevelThickness:.018,bevelSegments:3,curveSegments:16,steps:1});
 mesh('brida-taladrada-'+side,g,blue,[side*.88,0,0],[0,side*Math.PI/2,0]);
 mesh('asiento-brida-'+side,lathe([[.5,0],[.7,0],[.72,.018],[.72,.035],[.5,.035],[.5,0]]),blue,[side*1.045,0,0],[0,0,-side*Math.PI/2]);
}
// Shipping label only on one flange, opposite flange remains an open bore.
const labelGeometry=new T.CircleGeometry(.495,96); const labelUV=labelGeometry.attributes.uv; for(let i=0;i<labelUV.count;i++)labelUV.setY(i,1-labelUV.getY(i));
mesh('etiqueta',labelGeometry,label,[1.085,0,0],[0,Math.PI/2,0]);
// Rounded vertical casting, narrowing at the bottom, seamlessly sunk into pipe.
const body=round(.78,1.66,1.40,.12);const bp=body.attributes.position;
for(let i=0;i<bp.count;i++){const y=bp.getY(i);bp.setX(i,bp.getX(i)*( .64+.36*T.MathUtils.smoothstep(y,-.83,.50)));}body.computeVertexNormals();mesh('carcasa-fundida',body,blue,[0,.28,0]);
plate('junta-bonete',1.38,1.14,.028,1.16,dark);plate('brida-inferior-bonete',1.38,1.14,.085,1.07);plate('tapa-bonete',1.38,1.14,.085,1.205);
// Rounded tapered bonnet built with dense softened edge loops.
const bonnet=round(.99,.64,.84,.085), pos=bonnet.attributes.position;
for(let i=0;i<pos.count;i++){const factor=1-.35*T.MathUtils.smoothstep(pos.getY(i),-.25,.30);pos.setX(i,pos.getX(i)*factor);pos.setZ(i,pos.getZ(i)*factor);}bonnet.computeVertexNormals();mesh('bonete-redondeado',bonnet,blue,[0,1.57,0]);
// Six bonnet bolts: three along each side, including the middle pair.
for(const x of [-1,1])for(const z of [-1,0,1]){
 const p=[x*.53,1.29,z*.43];mesh('alojamiento-perno',lathe([[0,0],[.145,0],[.15,.02],[.15,.18],[.13,.20],[0,.20]]),blue,p);
 mesh('arandela',cyl(.113,.019),steel,[p[0],1.493,p[2]]);mesh('perno-hexagonal',cyl(.092,.075,6),steel,[p[0],1.533,p[2]]);
}
// Ribs align with the middle bolt of each three-bolt row (x sides, z = 0).
for(const x of [-1,1])mesh('nervio-bonete',round(.18,.32,.07,.025),blue,[x*.43,1.42,0],[0,0,-x*.32]);
mesh('cuello',lathe([[0,0],[.28,0],[.25,.035],[.25,.23],[.23,.26],[0,.26]]),blue,[0,1.86,0]);
for(let i=0;i<6;i++){const a=i*Math.PI/3;mesh('nervio-cuello',round(.055,.23,.065,.018),blue,[.24*Math.cos(a),1.98,.24*Math.sin(a)]);}
mesh('tuerca-laton',cyl(.19,.105,6),brass,[0,2.155,0]);mesh('vastago-pulido',cyl(.105,.35),steel,[0,2.36,0]);
// Continuous scalloped lower rim, no separate cylinders.
const wy=2.64;
const rim=lathe([[1.02,-.11],[1.24,-.11],[1.27,-.075],[1.27,.095],[1.25,.115],[1.03,.115],[1.01,.085],[1.01,-.075],[1.02,-.11]]);
const rp=rim.attributes.position;for(let i=0;i<rp.count;i++){const a=Math.atan2(rp.getZ(i),rp.getX(i)),y=rp.getY(i);if(y<0)rp.setY(i,y+.012*(1+Math.cos(a*18))*Math.min(1,-y/.075));}rim.computeVertexNormals();mesh('volante-aro-ondulado',rim,blue,[0,wy,0]);
mesh('cubo-volante',cyl(.23,.18),blue,[0,wy-.025,0]);
for(let i=0;i<3;i++){
 const a=i*Math.PI*2/3+.2;
 const arm=new T.Shape(); arm.moveTo(.16,-.085); arm.quadraticCurveTo(.65,-.11,1.08,.01); arm.lineTo(1.08,.25); arm.quadraticCurveTo(.67,.08,.16,.085); arm.closePath();
 const g=new T.ExtrudeGeometry(arm,{depth:.065,bevelEnabled:true,bevelSize:.022,bevelThickness:.022,bevelSegments:3,curveSegments:20,steps:1});mesh('brazo-curvo-volante',g,blue,[0,wy-.015,0],[-Math.PI/2,a,0]);
}
mesh('arandela-volante',cyl(.13,.017),steel,[0,wy+.079,0]);mesh('tuerca-volante',cyl(.098,.065,6),steel,[0,wy+.12,0]);
// Real painted raised foundry lettering, same material as casting.
const font=new FontLoader().parse(JSON.parse(fs.readFileSync(new URL('./helvetiker_regular.typeface.json',import.meta.url))));
function text(str,size,p,r=[0,0,0]){const g=new TextGeometry(str,{font,size,depth:.008,curveSegments:5,bevelEnabled:true,bevelSize:.002,bevelThickness:.002,bevelSegments:2});g.computeBoundingBox();g.translate(-(g.boundingBox.max.x+g.boundingBox.min.x)/2,0,0);mesh('relieve-'+str,g,blue,p,r);}
for(const [s,y] of [['DN100',.65],['PN16',.47],['GGG50',.29]])text(s,.135,[0,y,.702]);
text('H-ITALY',.115,[0,.56,-.702],[0,Math.PI,0]);
function ringText(word,center){
 const glyphs=[...word].map(char=>{
  const geometry=new TextGeometry(char,{font,size:.105,depth:.012,curveSegments:4,bevelEnabled:true,bevelSize:.0025,bevelThickness:.0025,bevelSegments:2});
  geometry.computeBoundingBox();const width=geometry.boundingBox.max.x-geometry.boundingBox.min.x;
  geometry.translate(-(geometry.boundingBox.max.x+geometry.boundingBox.min.x)/2,-.0525,0);
  return {geometry,width};
 });
 const radius=1.135,total=glyphs.reduce((sum,g)=>sum+g.width+.012,0);let offset=-total/2;
 for(const {geometry,width} of glyphs){const a=center+(offset+width/2)/radius;
  mesh('volante-relieve-'+word,geometry,blue,[radius*Math.sin(a),wy+.117,radius*Math.cos(a)],[-Math.PI/2,a,0]);offset+=width+.012;
 }
 const arrow=new T.Shape();arrow.moveTo(-.075,-.008);arrow.lineTo(.025,-.008);arrow.lineTo(.025,-.035);arrow.lineTo(.078,0);arrow.lineTo(.025,.035);arrow.lineTo(.025,.008);arrow.lineTo(-.075,.008);arrow.closePath();
 const a=center+total/(2*radius)+.13;
 mesh('flecha-'+word,new T.ExtrudeGeometry(arrow,{depth:.008,bevelEnabled:false}),blue,[radius*Math.sin(a),wy+.117,radius*Math.cos(a)],[-Math.PI/2,a,0]);
}
ringText('OPEN',-Math.PI/2);ringText('CLOSE',Math.PI/2);
fs.mkdirSync('public/models',{recursive:true});
await new NodeIO().registerExtensions([KHRMaterialsClearcoat]).write('public/models/valvula-compuerta.glb',doc);
// Load textures through model-viewer's scene API, which is reliable on this host.
const glbPath='public/models/valvula-compuerta.glb';
const packed=fs.readFileSync(glbPath), jsonSize=packed.readUInt32LE(12);
const manifest=JSON.parse(packed.subarray(20,20+jsonSize).toString());
const binaryStart=20+jsonSize+8, binaryChunk=packed.subarray(20+jsonSize);
for(const [i,img] of (manifest.images??[]).entries()){
 const view=manifest.bufferViews[img.bufferView];
 const filename=`valvula-textura-${i}.png`;
 fs.writeFileSync(`public/models/${filename}`,packed.subarray(binaryStart+(view.byteOffset??0),binaryStart+(view.byteOffset??0)+view.byteLength));
 delete img.bufferView;img.uri=`/models/${filename}`;
}
for(const material of manifest.materials){delete material.normalTexture;delete material.pbrMetallicRoughness.baseColorTexture;}
delete manifest.images;delete manifest.textures;delete manifest.samplers;
const rawJson=Buffer.from(JSON.stringify(manifest)), paddedJson=Buffer.alloc(Math.ceil(rawJson.length/4)*4,0x20);rawJson.copy(paddedJson);
const header=Buffer.alloc(20);header.writeUInt32LE(0x46546c67,0);header.writeUInt32LE(2,4);header.writeUInt32LE(20+paddedJson.length+binaryChunk.length,8);header.writeUInt32LE(paddedJson.length,12);header.writeUInt32LE(0x4e4f534a,16);
fs.writeFileSync(glbPath,Buffer.concat([header,paddedJson,binaryChunk]));
console.log('Modelo reconstruido:',fs.statSync('public/models/valvula-compuerta.glb').size,'bytes');




