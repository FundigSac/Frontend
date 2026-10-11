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
const blue=doc.createMaterial('epoxi-azul').setBaseColorFactor([0.002,0.055,0.48,1]).setMetallicFactor(0).setRoughnessFactor(.27).setExtension('KHR_materials_clearcoat',cc.createClearcoat().setClearcoatFactor(.82).setClearcoatRoughnessFactor(.17));
const steel=doc.createMaterial('acero').setBaseColorFactor([.68,.71,.75,1]).setMetallicFactor(1).setRoughnessFactor(.25);
const brass=doc.createMaterial('laton').setBaseColorFactor([.65,.43,.10,1]).setMetallicFactor(1).setRoughnessFactor(.28);
const dark=doc.createMaterial('junta-EPDM').setBaseColorFactor([.008,.009,.012,1]).setRoughnessFactor(.8);
const wedgeMaterial=doc.createMaterial('cuna-EPDM-negro').setBaseColorFactor([.045,.046,.047,1]).setMetallicFactor(0).setRoughnessFactor(.72);
const label=doc.createMaterial('etiqueta').setBaseColorFactor([1,1,1,1]).setRoughnessFactor(.6);
label.setBaseColorTexture(doc.createTexture('H-ITALY').setImage(fs.readFileSync('public/models/etiqueta-real.png')).setMimeType('image/png'));
// Painted cast iron: several spatial scales, not uniform sand or fabricated wear.
// The larger waviness lives in the normal map; fillets and part shapes remain real mesh.
const n=256, paintSize=512, paintHeights=new Float32Array(paintSize*paintSize);
let seed=9173; const waves=[];
for(let i=0;i<28;i++){
 seed=(Math.imul(seed,1664525)+1013904223)>>>0;
 const frequency=i<8?3+(seed%13):18+(seed%75);
 const angle=(seed/4294967296)*Math.PI*2;
 waves.push([Math.round(Math.cos(angle)*frequency),Math.round(Math.sin(angle)*frequency),
   (seed%997)/997*Math.PI*2,i<8?.50:.05]);
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
blue.setNormalTexture(doc.createTexture('fundicion-fina').setImage(await sharp(paintNormal,{raw:{width:paintSize,height:paintSize,channels:3}}).png({compressionLevel:9,adaptiveFiltering:true}).toBuffer()).setMimeType('image/png')).setNormalScale(.48);
blue.getExtension('KHR_materials_clearcoat').setClearcoatNormalTexture(blue.getNormalTexture()).setClearcoatNormalScale(.38);
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
const socketProfile=roundedProfile([[.64,-.88],[.68,-.78],[.66,-.65],[.62,-.53],[.62,.53],[.66,.65],[.68,.78],[.64,.88]],5);
const waterway=new T.LatheGeometry([new T.Vector2(.50,-.88),...socketProfile,new T.Vector2(.50,.88),new T.Vector2(.50,-.88)],128);
waterway.rotateZ(Math.PI/2);
mesh('cuerpo-paso-real',subtractInterior(waterway,chamberPlanes));
for(const side of [-1,1]){
 const holes=[];
 const shape=new T.Shape();shape.absarc(0,0,1.05,0,Math.PI*2,false);
 const bore=new T.Path();bore.absarc(0,0,.50,0,Math.PI*2,true);shape.holes.push(bore);
 // Three openings on either side, two at the top and two at the bottom.
 for(const angle of [0,35,70,110,145,180,215,250,290,325]){
  const a=angle*Math.PI/180, hole=new T.Path();
  hole.absarc(.86*Math.cos(a),.86*Math.sin(a),.094,0,Math.PI*2,true);shape.holes.push(hole);holes.push([.86*Math.cos(a),.86*Math.sin(a)]);
 }
 const g=new T.ExtrudeGeometry(shape,{depth:.145,bevelEnabled:true,bevelSize:.018,bevelThickness:.018,bevelSegments:5,curveSegments:32,steps:1});
 mesh('brida-taladrada-'+side,smoothFlange(g,holes),blue,[side*.88,0,0],[0,side*Math.PI/2,0]);
 mesh('asiento-brida-'+side,lathe([[.5,0],[.7,0],[.72,.018],[.72,.035],[.5,.035],[.5,0]]),blue,[side*1.045,0,0],[0,0,-side*Math.PI/2]);
}
// Shipping label only on one flange, opposite flange remains an open bore.
const labelGeometry=new T.CircleGeometry(.495,96); const labelUV=labelGeometry.attributes.uv; for(let i=0;i<labelUV.count;i++)labelUV.setY(i,1-labelUV.getY(i));
mesh('etiqueta',labelGeometry,label,[1.085,0,0],[0,Math.PI/2,0]);
// Rounded vertical casting, narrowing at the bottom, seamlessly sunk into pipe.
const body=round(.78,1.66,1.40,.16);const bp=body.attributes.position;
for(let i=0;i<bp.count;i++){const y=bp.getY(i);bp.setX(i,bp.getX(i)*( .64+.36*T.MathUtils.smoothstep(y,-.83,.50)));}body.computeVertexNormals();
body.translate(0,.28,0);
mesh('carcasa-fundida',subtractInterior(body,borePlanes()));
mesh('camara-interior-cuna',createChamber());
mesh('cuna-elastomero-EPDM',createResilientWedge(),wedgeMaterial);
plate('junta-bonete',1.38,1.14,.028,1.16,dark);plate('brida-inferior-bonete',1.38,1.14,.085,1.07);plate('tapa-bonete',1.38,1.14,.085,1.205);
// Continuous lofted cast bonnet, with broad shoulder transitions from the real photos.
mesh('bonete-redondeado',castBonnet(),blue,[0,1.57,0]);
// Six bonnet bolts: three along each side, including the middle pair.
for(const x of [-1,1])for(const z of [-1,0,1]){
 const p=[x*.53,1.29,z*.43];mesh('alojamiento-perno',new T.LatheGeometry([new T.Vector2(0,0),...roundedProfile([[.13,0],[.147,.01],[.15,.035],[.15,.17],[.14,.195],[.125,.20]],3),new T.Vector2(0,.20)],80),blue,p);
 mesh('arandela',washer(.113,.060,.019),steel,[p[0],1.493,p[2]]);mesh('perno-hexagonal',bevelHex(.092,.075,.008),steel,[p[0],1.533,p[2]]);
}
// Ribs align with the middle bolt of each three-bolt row (x sides, z = 0).
for(const x of [-1,1])mesh('nervio-bonete',round(.18,.32,.07,.025),blue,[x*.43,1.42,0],[0,0,-x*.32]);
mesh('cuello',new T.LatheGeometry([new T.Vector2(0,0),...roundedProfile([[.275,0],[.268,.018],[.25,.048],[.25,.22],[.24,.248],[.225,.26]],3),new T.Vector2(0,.26)],96),blue,[0,1.86,0]);
for(let i=0;i<6;i++){const a=i*Math.PI/3;mesh('nervio-cuello',round(.055,.23,.065,.018),blue,[.24*Math.cos(a),1.98,.24*Math.sin(a)]);}
mesh('tuerca-laton',bevelHex(.19,.105,.014),brass,[0,2.155,0]);mesh('vastago-pulido',lathe([[0,-.175],[.098,-.175],[.105,-.168],[.105,.168],[.098,.175],[0,.175]]),steel,[0,2.36,0]);
// Three curved, rounded cast spokes and continuous filleted grip rim.
const wy=2.64;
mesh('volante-aro-ondulado',wheelRim(),blue,[0,wy,0]);
for(let i=0;i<6;i++)mesh('volante-apoyo-moldeado',wheelGrip(),blue,[0,wy+.119,0],[-Math.PI/2,i*Math.PI/3,0]);
mesh('cubo-volante',lathe([[0,-.09],[.20,-.09],[.23,-.065],[.23,.06],[.21,.09],[0,.09]]),blue,[0,wy-.025,0]);
for(let i=0;i<3;i++)mesh('brazo-curvo-volante',castSpoke(),blue,[0,wy-.015,0],[0,i*Math.PI*2/3+.2,0]);
mesh('arandela-volante',washer(.13,.055,.017),steel,[0,wy+.079,0]);
mesh('tuerca-volante',bevelHex(.098,.065,.008),steel,[0,wy+.12,0]);
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
writeValveStudio('public/models/valvula-estudio.hdr');
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
const names={'H-ITALY':'etiqueta-real.png','fundicion-fina':'valvula-textura-1.png',
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
