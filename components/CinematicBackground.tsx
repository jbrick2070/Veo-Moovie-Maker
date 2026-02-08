import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const CinematicBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // --- SCENE SETUP ---
    const scene = new THREE.Scene();
    // Volumetric Fog: Deep Chocolate fading into darkness
    scene.fog = new THREE.FogExp2(0x15100E, 0.035); 
    scene.background = new THREE.Color(0x15100E);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // --- LIGHTING ---
    // Key Light (Warm Gold) - Increased intensity
    const keyLight = new THREE.PointLight(0xC6934B, 3.5, 50);
    keyLight.position.set(15, 15, 15);
    scene.add(keyLight);

    // Rim Light (Champagne)
    const rimLight = new THREE.SpotLight(0xFDF0C9, 8);
    rimLight.position.set(-15, 10, -10);
    rimLight.lookAt(0, 0, 0);
    scene.add(rimLight);

    // Fill Light (Velvet Red) - Increased for visibility
    const fillLight = new THREE.AmbientLight(0x8A1C1C, 0.8);
    scene.add(fillLight);

    // --- PROCEDURAL TEXTURE GENERATION ---
    const createFilmTexture = (widthType: '70mm' | '35mm' | '16mm') => {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 1024;
      const ctx = canvas.getContext('2d')!;

      // 1. Film Base (Dark translucent)
      ctx.fillStyle = '#000000'; 
      ctx.fillRect(0, 0, 256, 1024);

      // 2. Clear Sprockets (Erase)
      ctx.globalCompositeOperation = 'destination-out';
      
      const sprocketWidth = 12;
      const sprocketHeight = 20;
      const gap = 30; // vertical pitch

      // Draw left and right sprockets
      for (let y = 0; y < 1024; y += gap) {
        // Left
        ctx.beginPath();
        ctx.roundRect(10, y, sprocketWidth, sprocketHeight, 4);
        ctx.fill();
        
        // Right (70mm and 35mm have dual sprockets)
        if (widthType !== '16mm') {
          ctx.beginPath();
          ctx.roundRect(256 - 10 - sprocketWidth, y, sprocketWidth, sprocketHeight, 4);
          ctx.fill();
        }
      }

      // 3. Emulsion / Frame Area
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)'; // Very subtle frame guide
      
      // Create a base texture from this canvas
      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.anisotropy = 16;
      // In newer Three.js versions, color space management is important, but for generated alpha maps default is usually ok.
      
      return texture;
    };

    const tex70mm = createFilmTexture('70mm');
    const tex35mm = createFilmTexture('35mm');
    const tex16mm = createFilmTexture('16mm');

    // --- GEOMETRY: RIBBONS ---
    const films: { mesh: THREE.Mesh, speed: number, offset: number, initialY: number }[] = [];

    const createRibbon = (baseTexture: THREE.Texture, width: number, zDepth: number, speed: number, colorTint: number) => {
      // Create random curve
      const points = [];
      for (let i = 0; i < 10; i++) {
        points.push(new THREE.Vector3(
          (Math.random() - 0.5) * 35, // Wider X spread
          (Math.random() - 0.5) * 30 + (i * 2), // Taller Y spread
          zDepth + (Math.random() - 0.5) * 5 
        ));
      }
      
      const curve = new THREE.CatmullRomCurve3(points);
      curve.tension = 0.5;

      const shape = new THREE.Shape();
      const hw = width / 2;
      shape.moveTo(-hw, 0);
      shape.lineTo(hw, 0);
      shape.lineTo(hw, 0.02); 
      shape.lineTo(-hw, 0.02);
      
      const geometry = new THREE.ExtrudeGeometry(shape, {
        steps: 150, // More steps for smoother curves
        extrudePath: curve,
        curveSegments: 20
      });

      // CRITICAL FIX: Clone texture so each ribbon has its own offset state
      const instanceTexture = baseTexture.clone();
      instanceTexture.needsUpdate = true;

      const material = new THREE.MeshPhysicalMaterial({
        color: 0x15100E, 
        emissive: 0x000000,
        roughness: 0.15,
        metalness: 0.4, // Increased metalness for more reflection
        transmission: 0.0, 
        transparent: true,
        opacity: 0.95,
        alphaMap: instanceTexture, 
        alphaTest: 0.2, // Clean edges
        map: instanceTexture,      
        side: THREE.DoubleSide,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
        specularIntensity: 5.0, // High specular
        specularColor: new THREE.Color(0xC6934B) 
      });

      const mesh = new THREE.Mesh(geometry, material);
      geometry.center();
      
      mesh.position.set((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 5, zDepth);
      mesh.rotation.z = Math.random() * Math.PI;

      scene.add(mesh);
      films.push({ mesh, speed, offset: Math.random(), initialY: mesh.position.y });
    };

    // Generate Strands with varying speeds
    createRibbon(tex70mm, 4.0, -15, 0.001, 0x15100E);
    createRibbon(tex35mm, 2.0, -10, 0.003, 0x15100E);
    createRibbon(tex35mm, 2.0, -8, 0.004, 0x15100E);
    createRibbon(tex16mm, 1.0, -5, 0.008, 0x15100E);
    createRibbon(tex16mm, 1.0, -6, 0.006, 0x15100E);


    // --- ANIMATION LOOP ---
    let mouseX = 0;
    let mouseY = 0;
    let animationId: number;
    
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const animate = () => {
      animationId = requestAnimationFrame(animate);

      // Camera Parallax
      camera.position.x += (mouseX * 0.5 - camera.position.x) * 0.02;
      camera.position.y += (mouseY * 0.5 - camera.position.y) * 0.02;
      camera.lookAt(0, 0, -12); // Look slightly deeper

      const time = Date.now() * 0.0005; // Slow down global time slightly

      films.forEach((item, index) => {
        // Floating Sine Wave
        item.mesh.position.y = item.initialY + Math.sin(time + index) * 1.5; // Larger float amplitude
        
        // Gentle rotation
        item.mesh.rotation.x = Math.sin(time * 0.5 + index) * 0.1;
        item.mesh.rotation.y += 0.001; // Constant slow spin

        // Texture Offset (Film Rolling)
        const mat = item.mesh.material as THREE.MeshPhysicalMaterial;
        if (mat.map) {
           mat.map.offset.y -= item.speed;
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      // Dispose textures/materials to be clean
      tex70mm.dispose();
      tex35mm.dispose();
      tex16mm.dispose();
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="fixed inset-0 -z-10 pointer-events-none"
      style={{
        background: 'radial-gradient(circle at center, #2A1F1B 0%, #15100E 100%)' 
      }}
    />
  );
};