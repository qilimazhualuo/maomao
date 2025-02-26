const { createCanvas } = require('canvas');
const { JSDOM } = require('jsdom');
const { performance } = require('perf_hooks');
const THREE = require('three');
const fs = require('fs');

// 初始化 Three.js 环境
const dom = new JSDOM('<!DOCTYPE html>');
global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;
global.performance = performance;

// 创建离屏画布
const canvas = createCanvas(800, 600);
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
  preserveDrawingBuffer: true // 必须开启才能保存图像
});

// 创建场景
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, 800/600, 0.1, 1000);

// 添加物体
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({ 
  color: 0x00ff00,
  map: new THREE.TextureLoader().load('path/to/your/texture.jpg') // 你的图片路径
});
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

camera.position.z = 5;

// 执行渲染
renderer.render(scene, camera);

// 保存为PNG
const buffer = canvas.toBuffer('image/png');
fs.writeFileSync('output.png', buffer);

console.log('渲染完成，图片已保存为 output.png');