(() => {
'use strict';
const data = JSON.parse(document.getElementById('demo-data').textContent);
const el = id => document.getElementById(id);
const state = {caseIndex:0,input:null,processedMode:false,showRegions:true,showScenario:true,revision:0,view:'overview'};
const status = (v,lo,hi) => v < lo ? 'Low' : v > hi ? 'High' : 'Within range';
const clamp = (v,lo,hi) => Math.min(hi,Math.max(lo,v));
const fmt = v => Number(v).toLocaleString('en-US',{maximumFractionDigits:3});
const metrics = [['Area (µm²)','Area','µm²'],['Perimeter (µm)','Perimeter','µm'],['Equiv. diameter (µm)','Equivalent diameter','µm'],['Circularity','Circularity',''],['Aspect ratio','Aspect ratio',''],['Eccentricity','Eccentricity','']];
const letters = ['Norm','Hypo','Hyper','Pseudo'];
const escapeText = value => String(value).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));

function rangePosition(v,lo,hi){
 const spread=hi-lo,min=Math.max(0,lo-spread*.65),max=hi+spread*.65;
 return {min,max,point:clamp((v-min)/(max-min)*100,0,100),left:(lo-min)/(max-min)*100,right:(hi-min)/(max-min)*100};
}
function supportRows(c){return [['PLT','×10³/µL',null,null,c.PLT],...data.support.map(row=>[...row.slice(0,4),row[0]==='PCT'?c.PCT:row[4]])];}
function renderScenario(){
 const c=data.cases[state.caseIndex],index=state.caseIndex;
 const date=new Date(c.pat[4]+'T00:00:00Z').toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric',timeZone:'UTC'});
 el('case-meta').textContent=`Demo sample ${c.pat[3]} · ${c.pat[1]} years · ${c.pat[2]}`;
 el('patient').innerHTML=['PATIENT ID','AGE','SEX','SAMPLE / TEST ID','ANALYSIS DATE'].map((name,i)=>`<div><label>${name}</label><strong>${escapeText([c.pat[0],c.pat[1]+' years',c.pat[2],c.pat[3],date][i])}</strong></div>`).join('');
 el('overview-class').textContent=data.full_classes[index];el('overview-class').classList.toggle('long',index!==0);el('overview-confidence').textContent=c.prob[index];
 el('overview-indices').innerHTML=Object.entries(data.primary).map(([name,[full,unit,lo,hi]])=>{const s=status(c[name],lo,hi);return `<div class="overview-index"><div><label>${name}</label><strong>${fmt(c[name])}<small>${unit}</small></strong></div><span class="status ${s.toLowerCase()}">${s}</span></div>`;}).join('');
 el('clinical-insight').textContent=c.clin[0]+'.';
 el('cbc-snapshot').innerHTML=[['Analyzer platelet count',c.PLT,'×10³/µL','Reported CBC count · demo'],['PCT / Plateletcrit',c.PCT,'%','Supporting platelet index · demo']].map(([name,value,unit,note])=>`<div class="snapshot"><label>${name}</label><strong>${fmt(value)}</strong><small>${unit}</small><p>${note}</p></div>`).join('');
 el('indices').innerHTML=Object.entries(data.primary).map(([name,[full,unit,lo,hi]])=>{
  const s=status(c[name],lo,hi),r=rangePosition(c[name],lo,hi);
  return `<div class="indicator"><div class="indicator-name"><span>${name}</span><span class="status ${s.toLowerCase()}">${s}</span></div><div class="indicator-value">${fmt(c[name])}<small>${unit}</small></div><div class="indicator-full">${full}</div><div class="range-track" role="img" aria-label="${name} ${c[name]} ${unit}; demo interval ${lo} to ${hi}; ${s}"><i class="range-fill" style="width:${r.point}%"></i><i class="range-band" style="left:${r.left}%;width:${r.right-r.left}%"></i><i class="range-marker ${s.toLowerCase()}" style="left:${r.point}%"></i></div><div class="range-axis"><span>${fmt(r.min)}</span><span>Ref. ${lo}–${hi} ${unit}</span><span>${fmt(r.max)}</span></div></div>`;
 }).join('');
 el('cbc-body').innerHTML=supportRows(c).map(([name,unit,lo,hi,value])=>{
  const s=lo===null?'Demo value':status(value,lo,hi);
  return `<tr><td>${name}</td><td>${fmt(value)}</td><td>${unit}</td><td>${lo===null?'—':lo+'–'+hi}</td><td class="${s.toLowerCase()}">${s}</td></tr>`;
 }).join('');
 el('cbc-profile').innerHTML=supportRows(c).slice(1,10).map(([name,unit,lo,hi,value])=>{
  const s=status(value,lo,hi),x=clamp(25+(value-lo)/(hi-lo)*50,0,100);
  return `<div class="cbc-profile-row"><span>${name}</span><div class="cbc-profile-track" role="img" aria-label="${name} ${value} ${unit}; sample interval ${lo}–${hi}"><i class="${s.toLowerCase()}" style="left:${x}%"></i></div><b>${fmt(value)} ${unit}</b></div>`;
 }).join('');
 el('result-name').textContent=data.full_classes[index];el('result-name').classList.toggle('long',index!==0);
 el('confidence').textContent=c.prob[index];
 el('probabilities').innerHTML=data.classes.map((name,i)=>`<div class="prob-row ${i===index?'selected':''}"><div class="prob-label"><span>${name}</span><span>${c.prob[i]}%</span></div><div class="prob-track" role="meter" aria-label="${name} demo probability" aria-valuenow="${c.prob[i]}" aria-valuemin="0" aria-valuemax="100"><i style="width:${c.prob[i]}%"></i></div></div>`).join('');
 el('result-summary').textContent=c.description;
 el('result-clinical').textContent=`MPV ${c.MPV} fL · PDW ${c.PDW} fL · LCR ${c.LCR}% · Analyzer PLT ${c.PLT} ×10³/µL. ${c.clin.join('. ')}.`;
 el('result-image').textContent=`${c.img_f.join('. ')}. Scenario: ${c.n} platelets / field, ${c.clumps} clumps.`;
 el('size-chart').innerHTML=['Small','Medium','Large'].map((name,i)=>`<div class="size-row"><span>${name}</span><div class="prob-track" role="meter" aria-label="${name} platelets, demo proportion" aria-valuenow="${c.dist[i]}" aria-valuemin="0" aria-valuemax="100"><i style="width:${c.dist[i]}%"></i></div><b>${c.dist[i]}%</b></div>`).join('');
 el('image-findings').innerHTML=c.img_f.map(t=>`<li>${escapeText(t)}.</li>`).join('');
 el('morph-metrics').innerHTML=metrics.map(([key,name,unit])=>`<div class="metric"><label>${name}</label><strong>${fmt(c.morph[key])}</strong><small>${unit}</small></div>`).join('');
 el('morph-charts').innerHTML=metrics.map(([key,name,unit])=>{
  const max=Math.max(...data.cases.map(d=>d.morph[key]));
  return `<div class="micro-chart"><h3>${name}${unit?' / '+unit:''}</h3>${data.cases.map((d,i)=>`<div class="micro-row ${i===index?'selected':''}"><span>${letters[i]}</span><div class="micro-track" role="img" aria-label="${data.classes[i]} demo ${name}: ${d.morph[key]} ${unit}"><i style="width:${d.morph[key]/max*100}%"></i></div><b>${fmt(d.morph[key])}</b></div>`).join('')}</div>`;
 }).join('');
 const maxScore=Math.max(...Object.values(c.contrib));
 el('contributions').innerHTML=Object.entries(c.contrib).map(([name,value])=>`<div class="contrib"><label>${name}</label><div class="prob-track"><i style="width:${value/maxScore*100}%"></i></div><strong>${value}</strong></div>`).join('');
 el('clinical-findings').innerHTML=c.clin.map(t=>`<li>${escapeText(t)}.</li>`).join('');
 el('clinical-chips').innerHTML=['MPV','PDW','LCR'].map(name=>`<span>${name} ${c[name]} ${data.primary[name][1]}</span>`).join('');
 el('case-announcement').textContent=`${data.classes[index]} demonstration scenario selected. Simulated confidence ${c.prob[index]} percent.`;
}
function annotationSVG(c){
 const [w]=c.dimensions,stroke=Math.max(1,w/370),font=Math.max(6,w/70);
 return c.regions.map(r=>{const color=r.type==='clump'?'#efc189':'#79e3c9';return `<g><rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" rx="${stroke}" fill="${color}" fill-opacity=".06" stroke="${color}" stroke-width="${stroke}"/><text x="${r.x}" y="${Math.max(font,r.y-2)}" fill="${color}" font-size="${font}" stroke="#10303b" stroke-width="${stroke*.3}" paint-order="stroke">${r.id}</text></g>`;}).join('');
}
function setOverlay(id,show){
 const c=data.cases[state.caseIndex],node=el(id);node.setAttribute('viewBox',`0 0 ${c.dimensions[0]} ${c.dimensions[1]}`);node.setAttribute('preserveAspectRatio','xMidYMid meet');node.innerHTML=show?annotationSVG(c):'';node.hidden=!show;
}
function cropsMarkup(regions){return regions.map(r=>`<figure><img src="${r.crop_src}" alt="${r.id}, selected ${r.type} demonstration region"><figcaption>${r.id} / ${r.type==='clump'?'Clump region':'Platelet region'}<br>Manual demo cutout</figcaption></figure>`).join('');}
function renderImage(){
 const input=state.input;if(!input)return;const c=data.cases[state.caseIndex],uploaded=input.kind==='uploaded';
 el('fusion-image').src=input.src;
 el('fusion-image').alt=uploaded?'Uploaded smear preview in the image branch':data.classes[state.caseIndex]+' illustrative smear in the image branch';
 el('overview-result-body').hidden=uploaded;el('overview-empty').hidden=!uploaded;
 el('morph-scope').textContent=`Demo sample ${c.pat[3]} · illustrative measurements${uploaded?' · independent of the uploaded image':''}`;
 el('fusion-status').textContent=uploaded?'Architecture preview · image features unavailable for this upload':'Intended architecture · selected demo scenario';
 document.querySelectorAll('[data-case]').forEach(button=>{const selected=!uploaded&&Number(button.dataset.case)===state.caseIndex;button.classList.toggle('selected',selected);button.setAttribute('aria-pressed',String(selected));});
 el('smear-image').src=state.processedMode&&input.processed?input.processed:input.src;
 el('smear-image').alt=uploaded?'Locally uploaded smear preview':data.classes[state.caseIndex]+' illustrative reference smear';
 el('original-image').src=input.src;el('processed-image').src=input.processed||input.src;
 el('original-source').textContent=uploaded?'Uploaded image':c.image_origin==='synthetic-demo'?'Synthetic illustration':'Supplied reference';
 el('image-tag').textContent=uploaded?'UPLOADED IMAGE / PREVIEW':c.image_origin==='synthetic-demo'?'SMEAR / SYNTHETIC DEMO':'SMEAR / REFERENCE FIELD';
 el('source-label').textContent=uploaded?input.name:c.image_origin==='synthetic-demo'?'Synthetic illustration · demo':'Supplied reference image';
 el('original-button').setAttribute('aria-pressed',String(!state.processedMode));el('enhance-button').setAttribute('aria-pressed',String(state.processedMode));
 el('enhance-button').disabled=!input.processed;el('run-analysis').disabled=!input.processed;
 el('reset-image').hidden=!uploaded;el('toggle-regions').disabled=uploaded;
 el('toggle-regions').setAttribute('aria-pressed',String(state.showRegions&&!uploaded));el('toggle-regions').textContent=state.showRegions?'Hide demo regions':'Show demo regions';
 setOverlay('main-overlay',!uploaded&&state.processedMode&&state.showRegions);setOverlay('processed-overlay',!uploaded&&state.showRegions);
 el('processed-label').textContent=input.processed?(uploaded?'Contrast preprocessing only':'Contrast preprocessing + demo regions'):'Preparing contrast preview…';
 el('image-legend').hidden=uploaded;el('morph-upload-note').hidden=!uploaded;
 el('region-note').textContent=uploaded?'Uploaded image: detection and morphometric extraction are unavailable. Scenario charts below do not describe this upload.':`${c.regions.length} representative regions are marked manually. The ${c.n}-platelet and ${c.clumps}-clump counts are simulated scenario totals, not counts generated by these annotations.`;
 const stats=uploaded?[['—','Detected platelets','Model unavailable'],['—','Detected clumps','Model unavailable'],['—','Image morphometry','No calibrated extraction'],[fmt(input.width)+' × '+fmt(input.height),'Image resolution','Actual uploaded pixels']]:[[c.n,'Detected platelets','Per field · simulated'],[c.clumps,'Detected clumps','Simulated count'],[c.PLT,'Analyzer PLT','×10³/µL · demo'],[c.regions.length,'Marked regions','Manual selected examples']];
 el('image-stats').innerHTML=stats.map(([value,name,note])=>`<div class="stat"><strong>${value}</strong><span>${name}</span><span>${note}</span></div>`).join('');
 const selectedCrops=[...c.regions.filter(r=>r.type==='clump'),...c.regions.filter(r=>r.type==='platelet')].slice(0,4);
 el('platelet-crops').innerHTML=uploaded?'':cropsMarkup(selectedCrops);el('crop-unavailable').hidden=!uploaded;
 el('crop-caption').textContent=uploaded?'Uploaded image · no model-generated crops':'Cutouts from this reference field · selected manual examples';
 el('model-image-note').textContent=uploaded?'Uploaded image preview':'Manually selected reference regions · demo';
 el('model-image-findings').innerHTML=uploaded?'<li>No inference or platelet-region extraction for this upload.</li>':c.img_f.map(t=>`<li>${escapeText(t)}.</li>`).join('');
 el('model-input-source').textContent=uploaded?'Uploaded preview · features unavailable':c.pat[3]+' · demo reference';
 el('result-pending').hidden=!uploaded||state.showScenario;el('result-content').hidden=uploaded&&!state.showScenario;
 el('result-scope').hidden=!uploaded;el('result-scope').textContent=`Selected demonstration scenario ${c.pat[3]}. This simulated result and its image findings are independent of the uploaded image.`;
 renderQuality();
}
function renderQuality(){
 const q=state.input.quality;
 if(!q){el('quality-status').textContent='Checking image…';el('quality-status').classList.remove('review');el('quality-checks').innerHTML='<div class="quality-item pending">Decoding image<b>Preparing basic checks</b></div>';return;}
 el('quality-status').textContent=q.review?'Review recommended':'Basic checks complete';el('quality-status').classList.toggle('review',q.review);
 el('quality-checks').innerHTML=q.checks.map(check=>`<div class="quality-item ${check.review?'review':''}">${check.label}<b>${escapeText(check.value)}</b></div>`).join('');
}
function qualityStats(pixels,width,height){
 const n=width*height,gray=new Float32Array(n);let sum=0,squares=0;
 for(let i=0;i<n;i++){const j=i*4;gray[i]=.299*pixels[j]+.587*pixels[j+1]+.114*pixels[j+2];sum+=gray[i];squares+=gray[i]*gray[i];}
 let lapSum=0,lapSquares=0,k=0;
 for(let y=1;y<height-1;y++)for(let x=1;x<width-1;x++){const i=y*width+x,lap=gray[i-1]+gray[i+1]+gray[i-width]+gray[i+width]-4*gray[i];lapSum+=lap;lapSquares+=lap*lap;k++;}
 return {brightness:sum/n,contrast:Math.sqrt(Math.max(0,squares/n-(sum/n)**2)),focus:k?Math.max(0,lapSquares/k-(lapSum/k)**2):0};
}
function buildQuality(stats,width,height){
 const small=Math.min(width,height)<300,blur=stats.focus<45,exposure=stats.brightness<30||stats.brightness>235||stats.contrast<12;
 return {review:small||blur||exposure,checks:[{label:'Resolution',value:`${width} × ${height} px${small?' · low resolution':''}`,review:small},{label:'Focus estimate',value:`${stats.focus.toFixed(1)}${blur?' · review':' · edge variance'}`,review:blur},{label:'Brightness / contrast',value:`${stats.brightness.toFixed(0)} / ${stats.contrast.toFixed(1)}${exposure?' · review':''}`,review:exposure},{label:'Preprocessing',value:'Linear contrast · local canvas',review:false}]};
}
function loadImage(src){return new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(new Error('The image could not be decoded. Choose a valid JPG or PNG.'));img.src=src;});}
async function prepareImage(src){
 const img=await loadImage(src),width=img.naturalWidth,height=img.naturalHeight;
 if(!width||!height||width*height>16000000)throw new Error('Choose an image with at most 16 megapixels.');
 const scale=Math.min(1,1400/Math.max(width,height)),canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(width*scale));canvas.height=Math.max(1,Math.round(height*scale));const ctx=canvas.getContext('2d',{willReadFrequently:true});
 if(!ctx)throw new Error('Image preprocessing is unavailable in this browser.');
 ctx.fillStyle='#ffffff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(img,0,0,canvas.width,canvas.height);
 const probe=document.createElement('canvas'),probeScale=Math.min(1,384/Math.max(width,height));probe.width=Math.max(1,Math.round(width*probeScale));probe.height=Math.max(1,Math.round(height*probeScale));const pctx=probe.getContext('2d',{willReadFrequently:true});
 if(!pctx)throw new Error('Image quality checks are unavailable in this browser.');
 pctx.drawImage(canvas,0,0,probe.width,probe.height);const raw=pctx.getImageData(0,0,probe.width,probe.height),stats=qualityStats(raw.data,probe.width,probe.height);
 const pixels=ctx.getImageData(0,0,canvas.width,canvas.height);for(let i=0;i<pixels.data.length;i+=4)for(let ch=0;ch<3;ch++)pixels.data[i+ch]=clamp((pixels.data[i+ch]-128)*1.16+128,0,255);ctx.putImageData(pixels,0,0);
 return {width,height,processed:canvas.toDataURL('image/jpeg',.91),quality:buildQuality(stats,width,height)};
}
async function validateFile(file){
 if(!file)throw new Error('Choose a JPG or PNG image.');if(file.size>10*1024*1024)throw new Error('The file exceeds 10 MB. Choose a smaller JPG or PNG.');if(!file.size)throw new Error('The selected file is empty.');
 if(file.type&&!['image/jpeg','image/png'].includes(file.type))throw new Error('Only JPG and PNG images are supported.');
 const bytes=new Uint8Array(await file.slice(0,12).arrayBuffer()),jpeg=bytes[0]===255&&bytes[1]===216&&bytes[2]===255,png=[137,80,78,71,13,10,26,10].every((v,i)=>bytes[i]===v);
 if(!jpeg&&!png)throw new Error('This file is not a valid JPG or PNG.');if(file.type&&((file.type==='image/png'&&!png)||(file.type==='image/jpeg'&&!jpeg)))throw new Error('The file content does not match its image format.');
 return png?'image/png':'image/jpeg';
}
function readFile(file,mime){return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result).replace(/^data:[^;]*;/,'data:'+mime+';'));reader.onerror=()=>reject(new Error('The selected file could not be read.'));reader.readAsDataURL(file);});}
async function uploadFile(file){
 const revision=++state.revision;el('upload-error').hidden=true;el('upload-feedback').hidden=true;
 try{const mime=await validateFile(file);if(revision!==state.revision)return;el('upload-feedback').textContent='Checking image and preparing contrast preview…';el('upload-feedback').hidden=false;const src=await readFile(file,mime),prepared=await prepareImage(src);if(revision!==state.revision)return;state.input={kind:'uploaded',name:file.name,src,...prepared};state.processedMode=false;state.showScenario=false;renderImage();closeDialog();el('upload-feedback').textContent='Image loaded locally. Original and preprocessed previews are ready; no model prediction has been generated.';el('upload-feedback').hidden=false;}catch(error){if(revision!==state.revision)return;el('upload-feedback').hidden=true;el('upload-error').textContent=error.message;el('upload-error').hidden=false;}
}
async function selectCase(index){
 const c=data.cases[index];if(!c)return;const revision=++state.revision;state.caseIndex=index;state.processedMode=false;state.showRegions=true;state.showScenario=true;state.input={kind:'reference',name:c.img,src:c.src,width:c.dimensions[0],height:c.dimensions[1],processed:null,quality:null};
 const reference=state.input;
 el('case-select').value=String(index);el('smear-upload').value='';el('upload-error').hidden=true;el('upload-feedback').hidden=true;closeDialog();renderScenario();renderImage();el('load-fallback').hidden=true;
 try{const prepared=await prepareImage(c.src);if(state.input!==reference)return;Object.assign(reference,prepared);renderImage();}catch(error){if(state.input!==reference)return;el('quality-status').textContent='Preprocessing unavailable';el('quality-checks').innerHTML='<div class="quality-item review">Image checks<b>Unable to process this reference</b></div>';el('upload-error').textContent=error.message;el('upload-error').hidden=false;}
}
function setView(view){
 const copy={overview:['SAMPLE / OVERVIEW','The complete platelet picture.','Smear, classification and three primary indicators.'],clinical:['CLINICAL / PRIMARY INDICES','Platelet indices.','MPV, PDW and LCR in focus.'],cbc:['CLINICAL / SUPPORTING CBC','The supporting blood profile.','A compact profile, with the full table available below.'],smear:['IMAGE / WORKSPACE','Look closer at the smear.','Original, processed and localized regions.'],morph:['IMAGE / FEATURES','Platelet morphometry.','Size, shape and clumping in the selected demo scenario.'],prediction:['FUSION / OUTPUT','The classification result.','Four classes, with confidence and supporting evidence.'],model:['MODEL / ARCHITECTURE','How the features come together.','Clinical and image branches meet at the fusion layer.'],explain:['MODEL / EXPLAINABILITY','What supports the result.','Clinical scores and representative image regions.']};if(!copy[view])return;
 state.view=view;el('patient-details').open=false;
 document.querySelectorAll('[data-view]').forEach(b=>{const selected=b.dataset.view===view;b.setAttribute('aria-selected',String(selected));b.setAttribute('tabindex',selected?'0':'-1');});document.querySelectorAll('.page').forEach(p=>p.hidden=p.id!=='view-'+view);el('page-eyebrow').textContent=copy[view][0];el('page-heading').textContent=copy[view][1];
 el('page-subtitle').textContent=copy[view][2];if(document.scrollingElement)document.scrollingElement.scrollTop=0;
}
function openZoom(processed){
 const input=state.input;if(!input)return;const show=processed&&!!input.processed;el('zoom-image').src=show?input.processed:input.src;el('zoom-caption').textContent=(input.kind==='uploaded'?input.name:data.cases[state.caseIndex].pat[3])+' · '+(show?'Contrast-preprocessed':'Original')+' · '+(input.kind==='uploaded'?'uploaded preview':'illustrative reference');setOverlay('zoom-overlay',show&&input.kind==='reference'&&state.showRegions);const d=el('zoom-dialog');if(d.showModal)d.showModal();else d.setAttribute('open','');
}
function closeDialog(){const d=el('zoom-dialog');if(d.close)d.close();else d.removeAttribute('open');}
function showCBC(){setView('cbc');el('supporting-cbc').open=true;el('supporting-cbc').scrollIntoView({behavior:'smooth',block:'start'});}

el('detection-grid').innerHTML=data.detection.map(([name,src])=>`<figure><img src="${src}" alt="${name}, separate reference field"><figcaption>${name}</figcaption></figure>`).join('');
el('case-select').addEventListener('change',e=>selectCase(Number(e.target.value)));
el('fusion-classes').addEventListener('click',e=>{const button=e.target.closest('[data-case]');if(button)selectCase(Number(button.dataset.case));});
el('smear-upload').addEventListener('change',e=>{const file=e.target.files[0];if(file)uploadFile(file);e.target.value='';});
el('reset-image').addEventListener('click',()=>selectCase(state.caseIndex));
document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>setView(b.dataset.view)));
document.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',()=>setView(b.dataset.go)));
el('original-button').addEventListener('click',()=>{state.processedMode=false;renderImage();});
el('enhance-button').addEventListener('click',()=>{if(state.input.processed){state.processedMode=true;renderImage();}});
el('toggle-regions').addEventListener('click',()=>{if(state.input.kind==='reference'){state.showRegions=!state.showRegions;renderImage();}});
['smear-frame','zoom-button'].forEach(id=>el(id).addEventListener('click',()=>openZoom(state.processedMode)));
el('original-frame').addEventListener('click',()=>openZoom(false));el('processed-frame').addEventListener('click',()=>openZoom(true));
['smear-frame','original-frame','processed-frame'].forEach(id=>el(id).addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openZoom(id==='processed-frame'||id==='smear-frame'&&state.processedMode);}}));
['review-morphology','model-morphology'].forEach(id=>el(id).addEventListener('click',()=>setView('smear')));
['full-cbc','model-cbc'].forEach(id=>el(id).addEventListener('click',showCBC));
el('show-scenario').addEventListener('click',()=>{state.showScenario=true;renderImage();});
el('run-analysis').addEventListener('click',()=>{state.processedMode=true;if(state.input.kind==='reference')state.showScenario=true;renderImage();el('upload-feedback').textContent=state.input.kind==='uploaded'?'Preprocessing completed. Inference is unavailable for the uploaded image. Use “View selected demo result” to inspect the separate scenario.':'Demo scenario ready: contrast preview, selected manual regions and simulated four-class output. Quality flags remain visible for review.';el('upload-feedback').hidden=false;});
const stage=el('smear-frame');
['dragenter','dragover'].forEach(name=>stage.addEventListener(name,e=>{e.preventDefault();stage.classList.add('drop-active');}));stage.addEventListener('dragleave',()=>stage.classList.remove('drop-active'));
stage.addEventListener('drop',e=>{e.preventDefault();stage.classList.remove('drop-active');setView('smear');const files=e.dataTransfer.files;if(files.length!==1){el('upload-error').textContent='Drop one JPG or PNG at a time.';el('upload-error').hidden=false;}else uploadFile(files[0]);});
document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',closeDialog));
el('zoom-dialog').addEventListener('click',e=>{if(e.target!==el('zoom-dialog'))return;const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeDialog();});
document.querySelector('.nav').addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(e.key))return;const tabs=[...document.querySelectorAll('[data-view]')];let i=tabs.indexOf(document.activeElement);if(i<0)return;e.preventDefault();i=e.key==='Home'?0:e.key==='End'?tabs.length-1:(i+(['ArrowRight','ArrowDown'].includes(e.key)?1:-1)+tabs.length)%tabs.length;tabs[i].focus();setView(tabs[i].dataset.view);});
setView('overview');selectCase(0).catch(error=>{el('load-fallback').hidden=false;el('load-fallback').className='load-fallback error';el('load-fallback').textContent='The demo could not initialize. Reopen dashboard.html in a current browser.';console.error(error);});
})();
