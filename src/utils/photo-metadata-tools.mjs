export async function readPhotoMetadata(file) {
  if(file.size>25*1024*1024)throw Error('请选择小于 25 MiB 的图片');
  const module=await import('exifr');const exifr=module.parse?module:module.default;
  return await exifr.parse(file,{tiff:true,xmp:true,iptc:true,icc:false,makerNote:false,userComment:false,ifd1:false})||{};
}
export function photoMetadataRows(metadata) {
  return Object.entries(metadata).slice(0,300).map(([tag,value])=>{
    let text;
    if(value instanceof Date)text=Number.isNaN(value.getTime())?'无效日期':value.toISOString()+'（解析器时间表示）';
    else if(ArrayBuffer.isView(value))text='二进制 / 数组：'+value.byteLength+' 字节';
    else if(typeof value==='object'&&value!==null){try{text=JSON.stringify(value);}catch{text='复杂对象';}}
    else text=String(value);
    return {tag,value:text.length>1000?text.slice(0,1000)+'…（已截断）':text};
  });
}
export async function reencodePhoto(file,{format='image/png',quality=0.92}={}) {
  if(file.size>25*1024*1024)throw Error('请选择小于 25 MiB 的图片');
  if(!['image/jpeg','image/png','image/webp','image/avif'].includes(file.type))throw Error('清理支持 JPEG、PNG、WebP、AVIF 静态图');
  if(!['image/jpeg','image/png','image/webp'].includes(format))throw Error('导出格式不受支持');
  const bitmap=await createImageBitmap(file);
  try {
    if(bitmap.width*bitmap.height>24000000)throw Error('图片超过 2400 万像素，请先缩小');
    const canvas=document.createElement('canvas');canvas.width=bitmap.width;canvas.height=bitmap.height;
    const ctx=canvas.getContext('2d');if(!ctx)throw Error('浏览器未提供画布');
    if(format==='image/jpeg'){ctx.fillStyle='#ffffff';ctx.fillRect(0,0,canvas.width,canvas.height);}
    ctx.drawImage(bitmap,0,0);
    const blob=await new Promise(resolve=>canvas.toBlob(resolve,format,quality));
    if(!blob)throw Error('图像编码失败');
    const metadata=await readPhotoMetadata(blob);
    if(Object.keys(metadata).some(key=>/gps|latitude|longitude|altitude/i.test(key)))throw Error('输出仍检测到定位字段，请换一种格式重试');
    return {blob,width:canvas.width,height:canvas.height,metadata};
  } finally {bitmap.close();}
}
