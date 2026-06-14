// Entry point for the ocean dive-journey background.
import { initScene } from './ocean/scene.js';

if (document.readyState !== 'loading') initScene();
else document.addEventListener('DOMContentLoaded', initScene);
