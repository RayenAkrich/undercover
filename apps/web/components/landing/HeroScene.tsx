"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

// Port of the Stitch hero simulation: ~600 drifting session dots that ease into
// 5 glowing priority clusters joined by red evidence lines. See landing/design.md §6.
export default function HeroScene() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof window === "undefined") return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const density = window.innerWidth < 640 ? 0.35 : 1;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000);
    camera.position.z = 180;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const clusters = [
      { id: "CASE-01", color: 0xef4444, target: new THREE.Vector3(-65, 25, 0), radius: 18, count: Math.round(140 * density) },
      { id: "CASE-02", color: 0xb91c1c, target: new THREE.Vector3(-20, -30, 20), radius: 16, count: Math.round(130 * density) },
      { id: "CASE-03", color: 0x3b82f6, target: new THREE.Vector3(55, 30, -10), radius: 20, count: Math.round(120 * density) },
      { id: "CASE-04", color: 0xea580c, target: new THREE.Vector3(45, -25, 10), radius: 15, count: Math.round(110 * density) },
      { id: "CASE-05", color: 0xca8a04, target: new THREE.Vector3(0, 10, -25), radius: 14, count: Math.round(100 * density) },
    ];

    const totalDots = clusters.reduce((acc, c) => acc + c.count, 0);

    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(totalDots * 3);
    const initialPositions = new Float32Array(totalDots * 3);
    const targetPositions = new Float32Array(totalDots * 3);
    const colors = new Float32Array(totalDots * 3);

    let idx = 0;
    clusters.forEach((cluster) => {
      const cColor = new THREE.Color(cluster.color);
      for (let i = 0; i < cluster.count; i++) {
        const ix = (Math.random() - 0.5) * 260;
        const iy = (Math.random() - 0.5) * 160;
        const iz = (Math.random() - 0.5) * 120;
        initialPositions[idx * 3] = ix;
        initialPositions[idx * 3 + 1] = iy;
        initialPositions[idx * 3 + 2] = iz;
        positions[idx * 3] = ix;
        positions[idx * 3 + 1] = iy;
        positions[idx * 3 + 2] = iz;

        const r = cluster.radius * Math.pow(Math.random(), 0.6);
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);
        targetPositions[idx * 3] = cluster.target.x + r * Math.sin(phi) * Math.cos(theta);
        targetPositions[idx * 3 + 1] = cluster.target.y + r * Math.sin(phi) * Math.sin(theta);
        targetPositions[idx * 3 + 2] = cluster.target.z + r * Math.cos(phi) * 0.4;

        const cVariation = cColor.clone().offsetHSL(0, 0, (Math.random() - 0.5) * 0.2);
        colors[idx * 3] = cVariation.r;
        colors[idx * 3 + 1] = cVariation.g;
        colors[idx * 3 + 2] = cVariation.b;
        idx++;
      }
    });

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const canvasTexture = document.createElement("canvas");
    canvasTexture.width = 32;
    canvasTexture.height = 32;
    const ctx = canvasTexture.getContext("2d");
    if (ctx) {
      const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
      gradient.addColorStop(0, "rgba(255,255,255,1)");
      gradient.addColorStop(0.3, "rgba(255,255,255,0.8)");
      gradient.addColorStop(0.7, "rgba(255,255,255,0.2)");
      gradient.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(16, 16, 16, 0, Math.PI * 2);
      ctx.fill();
    }
    const dotTexture = new THREE.CanvasTexture(canvasTexture);

    const pointMaterial = new THREE.PointsMaterial({
      size: 3.2,
      vertexColors: true,
      map: dotTexture,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const particleSystem = new THREE.Points(geometry, pointMaterial);
    scene.add(particleSystem);

    const linePoints: THREE.Vector3[] = [];
    for (let i = 0; i < clusters.length; i++) {
      for (let j = i + 1; j < clusters.length; j++) {
        linePoints.push(clusters[i].target.clone());
        linePoints.push(clusters[j].target.clone());
      }
    }
    const lineGeometry = new THREE.BufferGeometry().setFromPoints(linePoints);
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0xef4444,
      transparent: true,
      opacity: 0.28,
      blending: THREE.AdditiveBlending,
    });
    scene.add(new THREE.LineSegments(lineGeometry, lineMaterial));

    const nodeGroup = new THREE.Group();
    const rings: THREE.Mesh[] = [];
    clusters.forEach((c) => {
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(1.6, 16, 16),
        new THREE.MeshBasicMaterial({ color: c.color })
      );
      mesh.position.copy(c.target);
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(2.8, 3.4, 24),
        new THREE.MeshBasicMaterial({
          color: c.color,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.45,
        })
      );
      ring.position.copy(c.target);
      rings.push(ring);
      nodeGroup.add(mesh);
      nodeGroup.add(ring);
    });
    scene.add(nodeGroup);

    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;
    const onMouseMove = (event: MouseEvent) => {
      mouseX = (event.clientX - width / 2) * 0.05;
      mouseY = (event.clientY - height / 2) * 0.05;
    };
    if (!reducedMotion) {
      window.addEventListener("mousemove", onMouseMove, { passive: true });
    }

    const clock = new THREE.Clock();
    let transition = reducedMotion ? 1 : 0;
    let raf = 0;

    const animate = () => {
      raf = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.05);
      const time = clock.getElapsedTime();

      if (transition < 1.0) {
        transition = Math.min(1.0, transition + delta * 0.45);
      }
      const easeT = 1 - Math.pow(1 - transition, 3);

      const posAttr = geometry.getAttribute("position") as THREE.BufferAttribute;
      const posArray = posAttr.array as Float32Array;
      for (let i = 0; i < totalDots; i++) {
        const i3 = i * 3;
        const noiseX = reducedMotion ? 0 : Math.sin(time * 0.8 + i * 0.2) * 0.9;
        const noiseY = reducedMotion ? 0 : Math.cos(time * 0.7 + i * 0.15) * 0.9;
        const noiseZ = reducedMotion ? 0 : Math.sin(time * 0.5 + i * 0.3) * 0.5;
        posArray[i3] = THREE.MathUtils.lerp(initialPositions[i3], targetPositions[i3] + noiseX, easeT);
        posArray[i3 + 1] = THREE.MathUtils.lerp(initialPositions[i3 + 1], targetPositions[i3 + 1] + noiseY, easeT);
        posArray[i3 + 2] = THREE.MathUtils.lerp(initialPositions[i3 + 2], targetPositions[i3 + 2] + noiseZ, easeT);
      }
      posAttr.needsUpdate = true;

      if (!reducedMotion) {
        rings.forEach((ring, index) => {
          const s = 1 + 0.18 * Math.sin(time * 2.2 + index);
          ring.scale.set(s, s, s);
        });
        targetX += (mouseX - targetX) * 0.04;
        targetY += (-mouseY - targetY) * 0.04;
        camera.position.x = targetX;
        camera.position.y = targetY;
        camera.lookAt(0, 0, 0);
      }

      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouseMove);
      geometry.dispose();
      pointMaterial.dispose();
      lineGeometry.dispose();
      lineMaterial.dispose();
      dotTexture.dispose();
      renderer.dispose();
      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={containerRef} className="h-full w-full" aria-hidden="true" />;
}
