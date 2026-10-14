// Reconstrucción multivista de v-01…v-10. Unidades visuales, sin uso metrológico.
import * as T from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';
import { Document, NodeIO } from '@gltf-transform/core';
import { KHRMaterialsClearcoat } from '@gltf-transform/extensions';
import fs from 'node:fs';
import sharp from 'sharp';
import { createResilientWedge, sampleWedge, subtractInterior, borePlanes, chamberPlanes, createChamber } from './valvula-interior.mjs';
import { writeValveStudio } from './valvula-studio.mjs';
import { roundedProfile, bevelHex, washer, castBonnet, castSpoke, wheelRim, wheelGrip, smoothFlange } from './valvula-exterior.mjs';
const doc = new Document(), buffer = doc.createBuffer(), scene = doc.createScene('DN100');
const root = doc.createNode('valvula').setTranslation([0,-1.02,0]); scene.addChild(root);
const cc=doc.createExtension(KHRMaterialsClearcoat);
const blue=doc.createMaterial('epoxi-azul').setBaseColorFactor([0,0.036,0.34,1]).setMetallicFactor(0).setRoughnessFactor(.5).setExtension('KHR_materials_clearcoat',cc.createClearcoat().setClearcoatFactor(1).setClearcoatRoughnessFactor(.035));
const steel=doc.createMaterial('acero-zincado').setBaseColorFactor([.80,.81,.83,1]).setMetallicFactor(.85).setRoughnessFactor(.4);
const brass=doc.createMaterial('laton').setBaseColorFactor([.70,.45,.13,1]).setMetallicFactor(1).setRoughnessFactor(.3);
const dark=doc.createMaterial('junta-EPDM').setBaseColorFactor([.02,.022,.03,1]).setRoughnessFactor(.85);
const wedgeMaterial=doc.createMaterial('cuna-EPDM-negro').setBaseColorFactor([.045,.046,.047,1]).setMetallicFactor(0).setRoughnessFactor(.72);
// Painted cast iron: several spatial scales, not uniform sand or fabricated wear.
// The larger waviness lives in the normal map; fillets and part shapes remain real mesh.
const n=256, paintSize=512, paintHeights=new Float32Array(paintSize*paintSize);
let seed=9173; const waves=[];
for(let i=0;i<28;i++){
 seed=(Math.imul(seed,1664525)+1013904223)>>>0;
 const frequency=i<8?3+(seed%13):18+(seed%75);
 const angle=(seed/4294967296)*Math.PI*2;
 waves.push([Math.round(Math.cos(angle)*frequency),Math.round(Math.sin(angle)*frequency),
   (seed%997)/997*Math.PI*2,i<8?.16:.06]);
}
for(let y=0;y<paintSize;y++)for(let x=0;x<paintSize;x++){
 let height=0;for(const [fx,fy,phase,amplitude]of waves)height+=amplitude*Math.sin((fx*x+fy*y)*Math.PI*2/paintSize+phase);
 paintHeights[y*paintSize+x]=height;
}
const paintH=(x,y)=>paintHeights[((y+paintSize)%paintSize)*paintSize+(x+paintSize)%paintSize];
const paintNormal=Buffer.alloc(paintSize*paintSize*3),paintOrm=Buffer.alloc(paintSize*paintSize*3);
for(let y=0;y<paintSize;y++)for(let x=0;x<paintSize;x++){
 const v=new T.Vector3((paintH(x-1,y)-paintH(x+1,y))*.42,(paintH(x,y-1)-paintH(x,y+1))*.42,1).normalize(),i=(y*paintSize+x)*3;
 paintNormal[i]=Math.round((v.x*.5+.5)*255);paintNormal[i+1]=Math.round((v.y*.5+.5)*255);paintNormal[i+2]=Math.round((v.z*.5+.5)*255);
 paintOrm[i]=255;paintOrm[i+1]=Math.round(255*(.9+.085*Math.tanh(paintH(x,y)*.7)));paintOrm[i+2]=0;
}
blue.setNormalTexture(doc.createTexture('fundicion-fina').setImage(await sharp(paintNormal,{raw:{width:paintSize,height:paintSize,channels:3}}).png({compressionLevel:9,adaptiveFiltering:true}).toBuffer()).setMimeType('image/png')).setNormalScale(.2);
blue.getExtension('KHR_materials_clearcoat').setClearcoatNormalTexture(blue.getNormalTexture()).setClearcoatNormalScale(.4);
blue.setMetallicRoughnessTexture(doc.createTexture('epoxi-rugosidad').setImage(await sharp(paintOrm,{raw:{width:paintSize,height:paintSize,channels:3}}).png({compressionLevel:9,adaptiveFiltering:true}).toBuffer()).setMimeType('image/png'));
// Procedural moulded-rubber microtexture, never a photograph or a flat fake wedge.
// The same map works on both faces; full-scale form is always mesh geometry.
let rubberSeed=36417;
const rubberHeights=new Float32Array(n*n), rubberNormal=Buffer.alloc(n*n*3), rubberOrm=Buffer.alloc(n*n*3), rubberAlbedo=Buffer.alloc(n*n*3);
for(let i=0;i<rubberHeights.length;i++){rubberSeed=(Math.imul(rubberSeed,1664525)+1013904223)>>>0;rubberHeights[i]=rubberSeed/4294967296;}
const rubberH=(x,y)=>rubberHeights[((y+n)%n)*n+(x+n)%n];
for(let y=0;y<n;y++)for(let x=0;x<n;x++){
 const i=(y*n+x)*3;
 const normal=new T.Vector3((rubberH(x-1,y)-rubberH(x+1,y))*.18,(rubberH(x,y-1)-rubberH(x,y+1))*.18,1).normalize();
 rubberNormal[i]=Math.round((normal.x*.5+.5)*255);rubberNormal[i+1]=Math.round((normal.y*.5+.5)*255);rubberNormal[i+2]=Math.round((normal.z*.5+.5)*255);
 // PNG rows run top to bottom; GLTF UV v=0 runs along the lower sealing edge.
 const surface=sampleWedge(2*x/(n-1)-1,1-y/(n-1));
 const bossCrease=4*surface.boss*(1-surface.boss), cheekCrease=4*surface.cheek*(1-surface.cheek);
 rubberOrm[i]=Math.round(255*(1-.20*bossCrease-.10*cheekCrease));
 rubberOrm[i+1]=Math.round(255*(.92+.08*rubberH(x,y)-.05*Math.exp(-Math.pow((surface.distanceToLip-.035)/.03,2))));
 rubberOrm[i+2]=0;
 // Subtle moulded-finish variation; no photographs, lettering or fabricated wear.
 const tone=.93+.05*Math.sin(x*.055)*Math.sin(y*.043)+.02*rubberH(x,y);
 for(let channel=0;channel<3;channel++)rubberAlbedo[i+channel]=Math.round(255*tone);
}
const rubberNormalImage=await sharp(rubberNormal,{raw:{width:n,height:n,channels:3}}).png().toBuffer();
const rubberAlbedoImage=await sharp(rubberAlbedo,{raw:{width:n,height:n,channels:3}}).png().toBuffer();
const rubberOrmImage=await sharp(rubberOrm,{raw:{width:n,height:n,channels:3}}).png().toBuffer();
wedgeMaterial.setNormalTexture(doc.createTexture('EPDM-microrelieve').setImage(rubberNormalImage).setMimeType('image/png')).setNormalScale(.18);
const orm=doc.createTexture('EPDM-occlusion-rugosidad').setImage(rubberOrmImage).setMimeType('image/png');
wedgeMaterial.setMetallicRoughnessTexture(orm).setOcclusionTexture(orm).setOcclusionStrength(.65);
wedgeMaterial.setBaseColorTexture(doc.createTexture('EPDM-acabado-moldeado').setImage(rubberAlbedoImage).setMimeType('image/png'));
function mesh(name,g,mat=blue,p=[0,0,0],r=[0,0,0]){
 g.rotateX(r[0]);g.rotateY(r[1]);g.rotateZ(r[2]);
 if(name!=='cuna-elastomero-EPDM'){
  const source=g;g=mergeVertices(g,1e-6);source.dispose();
 }
 const primitive=doc.createPrimitive().setMaterial(mat);
 for(const [key,attr,type] of [['POSITION','position','VEC3'],['NORMAL','normal','VEC3'],['TEXCOORD_0','uv','VEC2']]) if(g.attributes[attr])primitive.setAttribute(key,doc.createAccessor().setType(type).setArray(new Float32Array(g.attributes[attr].array)).setBuffer(buffer));
 if(g.index)primitive.setIndices(doc.createAccessor().setType('SCALAR').setArray(new (g.attributes.position.count < 65536 ? Uint16Array : Uint32Array)(g.index.array)).setBuffer(buffer));
 root.addChild(doc.createNode(name).setTranslation(p).setMesh(doc.createMesh(name).addPrimitive(primitive)));g.dispose();
}
const round=(w,h,d,r=.05)=>new RoundedBoxGeometry(w,h,d,7,r);
const lathe=(points)=>new T.LatheGeometry(points.map(([r,y])=>new T.Vector2(r,y)),96);
function roundedShape(w,d,r){const s=new T.Shape(),x=-w/2,y=-d/2;s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+d-r);s.quadraticCurveTo(x+w,y+d,x+w-r,y+d);s.lineTo(x+r,y+d);s.quadraticCurveTo(x,y+d,x,y+d-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);return s;}
function plate(name,w,d,depth,y,mat=blue){const g=new T.ExtrudeGeometry(roundedShape(w,d,.13),{depth,bevelEnabled:true,bevelSegments:5,steps:1,bevelSize:.014,bevelThickness:.014,curveSegments:12});mesh(name,g,mat,[0,y,0],[-Math.PI/2,0,0]);}
// Hollow pipe and blended sockets.
const socketProfile=roundedProfile([[.62,-.88],[.64,-.80],[.60,-.68],[.57,-.55],[.57,.55],[.60,.68],[.64,.80],[.62,.88]],5);
const waterway=new T.LatheGeometry([new T.Vector2(.50,-.88),...socketProfile,new T.Vector2(.50,.88),new T.Vector2(.50,-.88)],128);
waterway.rotateZ(Math.PI/2);
mesh('cuerpo-paso-real',subtractInterior(waterway,chamberPlanes));
for(const side of [-1,1]){
 const holes=[];
 const shape=new T.Shape();shape.absarc(0,0,1.05,0,Math.PI*2,false);
 const bore=new T.Path();bore.absarc(0,0,.50,0,Math.PI*2,true);shape.holes.push(bore);
 // EN 1092-2 DN100 PN16: eight holes, evenly spaced and straddling the centre lines (as in the photos).
 for(const angle of [22.5,67.5,112.5,157.5,202.5,247.5,292.5,337.5]){
  const a=angle*Math.PI/180, hole=new T.Path();
  hole.absarc(.86*Math.cos(a),.86*Math.sin(a),.094,0,Math.PI*2,true);shape.holes.push(hole);holes.push([.86*Math.cos(a),.86*Math.sin(a)]);
 }
 const g=new T.ExtrudeGeometry(shape,{depth:.19,bevelEnabled:true,bevelSize:.018,bevelThickness:.018,bevelSegments:5,curveSegments:32,steps:1});
 mesh('brida-taladrada-'+side,smoothFlange(g,holes,.19),blue,[side*.88,0,0],[0,side*Math.PI/2,0]);
 mesh('asiento-brida-'+side,lathe([[.5,0],[.7,0],[.72,.018],[.72,.035],[.5,.035],[.5,0]]),blue,[side*1.088,0,0],[0,0,-side*Math.PI/2]);
}
// Both flanges are open bores: no shipping label, the wedge is visible from either side.
// Rounded vertical casting, narrowing at the bottom, seamlessly sunk into pipe.
const body=round(.74,1.22,1.40,.15);const bp=body.attributes.position;
for(let i=0;i<bp.count;i++){const y=bp.getY(i);bp.setX(i,bp.getX(i)*( .64+.36*T.MathUtils.smoothstep(y,-.61,.30)));}body.computeVertexNormals();
body.translate(0,.06,0);
mesh('carcasa-fundida',subtractInterior(body,borePlanes()));
mesh('camara-interior-cuna',createChamber());
mesh('cuna-elastomero-EPDM',createResilientWedge(),wedgeMaterial);
const UP=-.45;
plate('junta-bonete',1.212,1.132,.01,1.168+UP,dark);plate('brida-inferior-bonete',1.22,1.14,.085,1.07+UP);plate('tapa-bonete',1.22,1.14,.085,1.205+UP);
// Continuous lofted cast bonnet, with broad shoulder transitions from the real photos.
mesh('bonete-redondeado',castBonnet().scale(1.04,1.32,1.12),blue,[0,1.255+UP+.32*1.32,0]);
// Six bonnet bolts: three along each side, including the middle pair.
for(const x of [-1,1])for(const z of [-1,0,1]){
 const p=[x*.47,1.29+UP,z*.43];mesh('alojamiento-perno',new T.LatheGeometry([new T.Vector2(0,0),...roundedProfile([[.13,0],[.147,.01],[.15,.035],[.15,.17],[.14,.195],[.125,.20]],3),new T.Vector2(0,.20)],80),blue,p);
 mesh('arandela',washer(.113,.060,.019),steel,[p[0],1.493+UP,p[2]]);mesh('perno-hexagonal',bevelHex(.092,.075,.008),steel,[p[0],1.533+UP,p[2]]);
}
// The photographed hood has no separate side ribs: its flats carry the shape.
const neckTop=1.255+UP+.64*1.32+.24;
mesh('cuello-prensaestopa',round(.50,.30,.44,.10),blue,[0,neckTop-.15,0]);
for(const x of [-1,1])mesh('oreja-cuello',round(.09,.22,.16,.04),blue,[x*.26,neckTop-.17,0]);
mesh('tuerca-laton',bevelHex(.19,.105,.014),brass,[0,neckTop+.05,0]);
// Three curved, rounded cast spokes and continuous filleted grip rim.
const wy=neckTop+.42;
mesh('vastago-pulido',lathe([[0,-.175],[.098,-.175],[.105,-.168],[.105,.168],[.098,.175],[0,.175]]),steel,[0,wy-.30,0]);
mesh('volante-aro-ondulado',wheelRim(),blue,[0,wy,0]);
for(let i=0;i<8;i++)mesh('volante-marco-panel',wheelGrip(),blue,[0,wy+.143,0],[-Math.PI/2,i*Math.PI/4,0]);
mesh('cubo-volante',lathe([[0,-.09],[.20,-.09],[.23,-.065],[.23,.06],[.21,.09],[0,.09]]),blue,[0,wy-.025,0]);
for(let i=0;i<3;i++)mesh('brazo-curvo-volante',castSpoke(),blue,[0,wy-.015,0],[0,i*Math.PI*2/3+.2,0]);
mesh('arandela-volante',washer(.13,.055,.017),steel,[0,wy+.079,0]);
mesh('tuerca-volante',bevelHex(.098,.065,.008),steel,[0,wy+.12,0]);
// Real painted raised foundry lettering, same material as casting.
const font=new FontLoader().parse(JSON.parse(fs.readFileSync(new URL('./helvetiker_regular.typeface.json',import.meta.url))));
function text(str,size,p,r=[0,0,0]){const g=new TextGeometry(str,{font,size,depth:.008,curveSegments:5,bevelEnabled:true,bevelSize:.002,bevelThickness:.002,bevelSegments:2});g.computeBoundingBox();g.translate(-(g.boundingBox.max.x+g.boundingBox.min.x)/2,0,0);mesh('relieve-'+str,g,blue,p,r);}
for(const [s,y] of [['DN100',.24],['PN16',.06],['GGG50',-.12]])text(s,.135,[0,y,.702]);
for(const [s,y] of [['DN100',.24],['PN16',.06],['GGG50',-.12]])text(s,.135,[0,y,-.702],[0,Math.PI,0]);
function ringText(word,center){
 const glyphs=[...word].map(char=>{
  const geometry=new TextGeometry(char,{font,size:.105,depth:.012,curveSegments:4,bevelEnabled:true,bevelSize:.0025,bevelThickness:.0025,bevelSegments:2});
  geometry.computeBoundingBox();const width=geometry.boundingBox.max.x-geometry.boundingBox.min.x;
  geometry.translate(-(geometry.boundingBox.max.x+geometry.boundingBox.min.x)/2,-.0525,0);
  return {geometry,width};
 });
 const radius=1.135,total=glyphs.reduce((sum,g)=>sum+g.width+.012,0);let offset=-total/2;
 for(const {geometry,width} of glyphs){const a=center+(offset+width/2)/radius;
  mesh('volante-relieve-'+word,geometry,blue,[radius*Math.sin(a),wy+.146,radius*Math.cos(a)],[-Math.PI/2,a,0]);offset+=width+.012;
 }
 const arrow=new T.Shape();arrow.moveTo(-.075,-.008);arrow.lineTo(.025,-.008);arrow.lineTo(.025,-.035);arrow.lineTo(.078,0);arrow.lineTo(.025,.035);arrow.lineTo(.025,.008);arrow.lineTo(-.075,.008);arrow.closePath();
 const a=center+total/(2*radius)+.13;
 mesh('flecha-'+word,new T.ExtrudeGeometry(arrow,{depth:.008,bevelEnabled:false}),blue,[radius*Math.sin(a),wy+.146,radius*Math.cos(a)],[-Math.PI/2,a,0]);
}
ringText('OPEN',-Math.PI/2);ringText('CLOSE',Math.PI/2);
fs.mkdirSync('public/models',{recursive:true});
// Dark product studio: deep blue body, crisp white enamel highlights (measured against v-01/v-02/v-04).
const studioKey={direction:[-.35,.55,.75],horizontal:.32,vertical:.30,radiance:9};
const studioStrips=[
 {direction:[.9,.35,.3],horizontal:.05,vertical:.45,radiance:40},{direction:[-.9,.35,-.3],horizontal:.05,vertical:.45,radiance:40},
 {direction:[.2,.9,.6],horizontal:.45,vertical:.05,radiance:35},{direction:[-.5,.3,.8],horizontal:.04,vertical:.35,radiance:45},
 {direction:[.6,.5,-.6],horizontal:.04,vertical:.35,radiance:30}];
writeValveStudio('public/models/valvula-estudio-esmalte.hdr',1024,512,{ambient:[.025,.035],gain:1.6,extra:[studioKey,...studioStrips]});
await new NodeIO().registerExtensions([KHRMaterialsClearcoat]).write('public/models/valvula-compuerta.glb',doc);
// External same-origin PBR maps avoid blob decoding failures in the site's bundled viewer.
// Geometry remains GLB; remove embedded image bytes to avoid downloading each texture twice.
const glbPath='public/models/valvula-compuerta.glb';
const packed=fs.readFileSync(glbPath),jsonSize=packed.readUInt32LE(12);
if(process.argv.includes('--standalone')){
 fs.mkdirSync('../output/valvula-realismo',{recursive:true});
 fs.writeFileSync('../output/valvula-realismo/valvula-DN100-realismo.glb',packed);
}
const manifest=JSON.parse(packed.subarray(20,20+jsonSize).toString());
const binaryStart=20+jsonSize+8;
const names={'fundicion-fina':'valvula-textura-1.png',
 'epoxi-rugosidad':'valvula-pintura-orm.png','EPDM-acabado-moldeado':'valvula-epdm-0.png',
 'EPDM-microrelieve':'valvula-epdm-1.png','EPDM-occlusion-rugosidad':'valvula-epdm-2.png'};
const imageViews=new Set();
for(const [i,img]of manifest.images.entries()){
 const id=img.bufferView,view=manifest.bufferViews[id],filename=names[img.name]??`valvula-textura-${i}.png`;
 fs.writeFileSync(`public/models/${filename}`,packed.subarray(binaryStart+(view.byteOffset??0),binaryStart+(view.byteOffset??0)+view.byteLength));
 imageViews.add(id);delete img.bufferView;img.uri=filename;
}
const viewIds=new Map(),views=[],chunks=[];let offset=0;
for(const [i,view]of manifest.bufferViews.entries()){
 if(imageViews.has(i))continue;
 const bytes=packed.subarray(binaryStart+(view.byteOffset??0),binaryStart+(view.byteOffset??0)+view.byteLength);
 viewIds.set(i,views.length);views.push({...view,byteOffset:offset});chunks.push(bytes);
 const padding=(4-bytes.length%4)%4;if(padding)chunks.push(Buffer.alloc(padding));offset+=bytes.length+padding;
}
for(const accessor of manifest.accessors){
 if(accessor.bufferView!==undefined)accessor.bufferView=viewIds.get(accessor.bufferView);
 if(accessor.sparse){accessor.sparse.indices.bufferView=viewIds.get(accessor.sparse.indices.bufferView);accessor.sparse.values.bufferView=viewIds.get(accessor.sparse.values.bufferView);}
}
manifest.bufferViews=views;manifest.buffers[0].byteLength=offset;
const rawJson=Buffer.from(JSON.stringify(manifest)),paddedJson=Buffer.alloc(Math.ceil(rawJson.length/4)*4,0x20);rawJson.copy(paddedJson);
const binary=Buffer.concat(chunks),header=Buffer.alloc(20),binaryHeader=Buffer.alloc(8);
header.writeUInt32LE(0x46546c67,0);header.writeUInt32LE(2,4);header.writeUInt32LE(28+paddedJson.length+binary.length,8);header.writeUInt32LE(paddedJson.length,12);header.writeUInt32LE(0x4e4f534a,16);
binaryHeader.writeUInt32LE(binary.length,0);binaryHeader.writeUInt32LE(0x004e4942,4);
fs.writeFileSync(glbPath,Buffer.concat([header,paddedJson,binaryHeader,binary]));
console.log('Modelo reconstruido:',fs.statSync(glbPath).size,'bytes; texturas PBR externas sin duplicación');
