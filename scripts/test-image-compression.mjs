import assert from 'node:assert/strict';
import {compressionDimensions as d,compressionSavings as s} from '../src/utils/image-compression.mjs';
assert.deepEqual(d(4000,2000,1920),{width:1920,height:960});
assert.deepEqual(d(800,600,1920),{width:800,height:600});
assert.deepEqual(d(1,100,50),{width:1,height:50});
assert.throws(()=>d(0,10,100));assert.throws(()=>d(10,10,9000));
assert.equal(s(100,50),50);assert.equal(s(100,120),-20);assert.equal(s(0,0),0);
console.log('COMPRESSION_TEST_OK dimensions/ratio/no-upscale/limits/savings');
