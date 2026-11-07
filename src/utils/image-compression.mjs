export function compressionDimensions(width,height,maxEdge=1920){
 if(![width,height,maxEdge].every(n=>Number.isFinite(n)&&n>0)||maxEdge>8192)throw Error('尺寸设置不正确');
 const scale=Math.min(1,maxEdge/Math.max(width,height));
 return {width:Math.max(1,Math.round(width*scale)),height:Math.max(1,Math.round(height*scale))};
}
export function compressionSavings(before,after){return before>0?(before-after)/before*100:0;}
export async function compressImageFile(file,{format='image/webp',quality=80,maxEdge=1920}={}){
 if(!['image/webp','image/jpeg','image/png'].includes(format)||!Number.isFinite(quality)||quality<10||quality>100)throw Error('压缩参数不正确');
 if(file.size>20*1024*1024)throw Error('单张图片请控制在 20 MB 内');
 if(!['image/png','image/jpeg','image/webp','image/bmp','image/avif'].includes(file.type))throw Error('支持 PNG、JPEG、WebP、BMP、AVIF 图片');
 let image,sourceUrl;
 try{
  if(typeof createImageBitmap==='function')image=await createImageBitmap(file);
  else{sourceUrl=URL.createObjectURL(file);image=await new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(Error('图片解码失败'));img.src=sourceUrl;});}
  const originalWidth=image.width||image.naturalWidth,originalHeight=image.height||image.naturalHeight;
  if(originalWidth*originalHeight>16_000_000)throw Error('单张图片最多支持 1600 万像素');
  const size=compressionDimensions(originalWidth,originalHeight,Number(maxEdge));
  const canvas=document.createElement('canvas');canvas.width=size.width;canvas.height=size.height;
  const context=canvas.getContext('2d');if(!context)throw Error('浏览器暂未提供图片处理画布');
  if(format==='image/jpeg'){context.fillStyle='#ffffff';context.fillRect(0,0,size.width,size.height);}
  context.drawImage(image,0,0,size.width,size.height);
  const blob=await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(Error('图片编码失败')),format,quality/100));
  canvas.width=1;canvas.height=1;
  const extension=({'image/jpeg':'jpg','image/webp':'webp','image/png':'png'})[blob.type];if(!extension)throw Error('浏览器返回了未知图片格式');
  return {blob,width:size.width,height:size.height,originalWidth,originalHeight,extension,type:blob.type};
 }finally{image?.close?.();if(sourceUrl)URL.revokeObjectURL(sourceUrl);}
}
