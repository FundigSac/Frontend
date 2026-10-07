import { chromium } from "@playwright/test";
import axe from "axe-core";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
const base=process.env.APP_URL??"http://localhost:3000";
const routes=["/","/productos","/productos/valvula-check-flex","/productos/codo-hdpe-termofusion-90-sdr11","/cotizar","/contacto","/libro-de-reclamos"];
const browser=await chromium.launch();
const results=[];
for(const route of routes){
  const page=await browser.newPage({viewport:{width:390,height:844}});
  await page.goto(base+route,{waitUntil:"networkidle"});
  await page.addScriptTag({content:axe.source});
  const result=await page.evaluate(async()=>await (window as typeof window & {axe:typeof axe}).axe.run(document,{runOnly:{type:"tag",values:["wcag2a","wcag2aa","wcag21a","wcag21aa","wcag22aa"]}}));
  results.push({route,violations:result.violations.map(v=>({id:v.id,impact:v.impact,description:v.description,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}))});
  await page.close();
}
await browser.close();
const dir=join(process.cwd(),"reports","a11y");
await mkdir(dir,{recursive:true});
await writeFile(join(dir,"current.json"),JSON.stringify(results,null,2));
console.log(results.map(r=>`${r.route}: ${r.violations.length} violaciones`).join("\n"));
if(results.some(r=>r.violations.length))process.exitCode=1;
