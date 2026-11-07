import { Sha256 } from './sha256.mjs';
self.onmessage = async event => {
  const { file } = event.data;
  try {
    const hash = new Sha256(), chunkSize = 1024 * 1024;
    let lastReport = 0;
    for (let offset = 0; offset < file.size; offset += chunkSize) {
      hash.update(new Uint8Array(await file.slice(offset, offset + chunkSize).arrayBuffer()));
      const processed = Math.min(file.size, offset + chunkSize);
      if (performance.now() - lastReport > 100 || processed === file.size) { self.postMessage({ type: 'progress', processed, total: file.size }); lastReport = performance.now(); }
    }
    self.postMessage({ type: 'done', digest: hash.digest() });
  } catch (error) { self.postMessage({ type: 'error', message: error.message || '文件读取失败' }); }
};
