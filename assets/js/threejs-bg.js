        /* ── REFORMA 3D — drone en 390 Av. Reforma, mirando al oeste (1u=4m) ── */
        (function() {
            if (typeof THREE === 'undefined') return;

            const canvas = document.getElementById('threejs-bg');
            const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
            renderer.setSize(window.innerWidth, window.innerHeight);

            const scene = new THREE.Scene();
            // Fog a escala 1u=4m | distancia 50% fog ~230u=920m
            scene.fog = new THREE.FogExp2(0x080808, 0.0000022);
            function lerp(a, b, t) { return a + (b - a) * t; }

            /*
             * GPS-PRECISO | Referencia: Glorieta Diana (lat0=19.4279, lon0=-99.1784)
             * 1 unidad = 4 metros | x = este (+) | z = norte (+)
             *
             * Drone: 390 Av. Reforma → (226.1, 22, -72.5)
             *   mirando OESTE hacia las torres: lookAt(92.7, 10, -92.9)
             *
             * Torres GPS reales (Nominatim / OSM):
             *   Torre Diana     158m → (197.0, z=-86.6)  dist=32u
             *   Torre Reforma   246m → (104.3, z=-87.4)  dist=123u
             *   Torre Mayor     225m → (81.2,  z=-98.4)  dist=147u
             *   Glorieta Diana       → (0,     0      )  dist=236u
             */

            const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.5, 6000);
            camera.position.set(226.1, 22.0, -72.5);
            camera.lookAt(92.7, 10.0, -92.9);

            function mkBuilding(x, z, h, w, d, col, op) {
                const wS = Math.max(6,  Math.round(w * 0.75));
                const hS = Math.max(14, Math.round(h * 0.85));
                const dS = Math.max(4,  Math.round(d * 0.65));
                const geo  = new THREE.BoxGeometry(w, h, d, wS, hS, dS);
                const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({
                    color: col, wireframe: true, transparent: true, opacity: op
                }));
                mesh.position.set(x, h / 2, z);
                scene.add(mesh);
                return mesh;
            }

            /* ══════════════════════════════════════════════════════
               TORRES ICÓNICAS — geometrías basadas en forma real
               ══════════════════════════════════════════════════════ */

            /* ── TORRE DIANA 158m (primer plano, 32u del drone) ──
               Rectangular con corona escalonada en 3 niveles          */
            (function() {
                var x = 197.0, z = -86.6, h = 39.5;
                var mat = function(col, op) {
                    return new THREE.MeshBasicMaterial({ color: col, wireframe: true, transparent: true, opacity: op });
                };
                var addMesh = function(geo, col, op, px, py, pz) {
                    var m = new THREE.Mesh(geo, mat(col, op));
                    m.position.set(px, py, pz);
                    scene.add(m);
                    return m;
                };
                // Cuerpo principal
                addMesh(new THREE.BoxGeometry(10.0, h*0.82, 10.0, 7, 29, 7),
                    0xc4b5d4, 0.52, x, h*0.41, z);
                // Corona nivel 1
                addMesh(new THREE.BoxGeometry(8.0, h*0.10, 8.0, 5, 5, 5),
                    0xc4b5d4, 0.44, x, h*0.87, z);
                // Corona nivel 2
                addMesh(new THREE.BoxGeometry(5.5, h*0.07, 5.5, 3, 4, 3),
                    0xc4b5d4, 0.38, x, h*0.955, z);
                // Podio
                addMesh(new THREE.BoxGeometry(14.0, 4.5, 13.0, 10, 3, 9),
                    0xc4b5d4, 0.22, x, 2.25, z);
                // Edificios contiguos
                addMesh(new THREE.BoxGeometry(8.5, 18, 8.0, 6, 15, 5),
                    0xc4b5d4, 0.20, 192.0, 9, -97.0);
                addMesh(new THREE.BoxGeometry(9.0, 13, 8.5, 6, 11, 5),
                    0xc4b5d4, 0.18, 200.0, 6.5, -75.0);
            })();

            /* ── TORRE REFORMA 246m — PRISMA TRIANGULAR icónico ──
               Diseño L. Benjamin Romano: planta triangular que rota   */
            (function() {
                const x = 104.3, z = -87.4, h = 61.5, r = 7.5;
                const hS = Math.round(h * 0.9);
                // Prisma triangular principal
                const geo = new THREE.CylinderGeometry(r, r, h, 3, hS, true);
                const mesh = new THREE.Mesh(geo,
                    new THREE.MeshBasicMaterial({ color: 0xc4b5d4, wireframe: true, transparent: true, opacity: 0.34 }));
                mesh.position.set(x, h/2, z);
                mesh.rotation.y = Math.PI / 6; // cara este hacia la camara
                scene.add(mesh);
                // Antena/spire
                const aGeo = new THREE.CylinderGeometry(0.2, 1.2, 7, 3, 3, true);
                const aMesh = new THREE.Mesh(aGeo,
                    new THREE.MeshBasicMaterial({ color: 0xc4b5d4, wireframe: true, transparent: true, opacity: 0.28 }));
                aMesh.position.set(x, h + 3.5, z);
                aMesh.rotation.y = Math.PI / 6;
                scene.add(aMesh);
                // Base / podio triangular
                const bGeo = new THREE.CylinderGeometry(r*1.35, r*1.35, 5, 3, 2, true);
                const bMesh = new THREE.Mesh(bGeo,
                    new THREE.MeshBasicMaterial({ color: 0xc4b5d4, wireframe: true, transparent: true, opacity: 0.18 }));
                bMesh.position.set(x, 2.5, z);
                bMesh.rotation.y = Math.PI / 6;
                scene.add(bMesh);
            })();

            /* ── TORRE MAYOR 225m — OCTAGONAL, fachada curva de cristal ──
               Zeidler Partnership: dos cuerpos curvos + torre central   */
            (function() {
                const x = 81.2, z = -98.4, h = 56.2;
                const hS = Math.round(h * 0.9);
                // Torre central octagonal (fachada curva)
                const geo = new THREE.CylinderGeometry(8.5, 9.2, h, 8, hS, true);
                const mesh = new THREE.Mesh(geo,
                    new THREE.MeshBasicMaterial({ color: 0xc4b5d4, wireframe: true, transparent: true, opacity: 0.22 }));
                mesh.position.set(x, h/2, z);
                scene.add(mesh);
                // Cuerpo norte (ala)
                const nGeo = new THREE.BoxGeometry(18, h*0.45, 10, 8, Math.round(h*0.4), 5);
                const nMesh = new THREE.Mesh(nGeo,
                    new THREE.MeshBasicMaterial({ color: 0xc4b5d4, wireframe: true, transparent: true, opacity: 0.12 }));
                nMesh.position.set(x, h*0.225, z - 10);
                scene.add(nMesh);
                // Podio extendido
                const pGeo = new THREE.BoxGeometry(24, 6, 16, 12, 3, 8);
                const pMesh = new THREE.Mesh(pGeo,
                    new THREE.MeshBasicMaterial({ color: 0xc4b5d4, wireframe: true, transparent: true, opacity: 0.10 }));
                pMesh.position.set(x, 3, z);
                scene.add(pMesh);
            })();

            /* ── CHAPULTEPEC UNO 241m — MONOLITO AFILADO ──
               Planta cuadrada que se estrecha pronunciadamente al subir */
            (function() {
                const x = 68.0, z = -105.5, h = 60.2;
                const hS = Math.round(h * 0.9);
                // Plinto cuadrado afilado (se reduce de 10.5 a 7 unidades)
                const geo = new THREE.CylinderGeometry(7.0, 10.5, h, 4, hS, true);
                const mesh = new THREE.Mesh(geo,
                    new THREE.MeshBasicMaterial({ color: 0xc4b5d4, wireframe: true, transparent: true, opacity: 0.20 }));
                mesh.position.set(x, h/2, z);
                mesh.rotation.y = Math.PI/4; // cuadrado alineado N-S/E-O
                scene.add(mesh);
                // Corona angular
                const cGeo = new THREE.CylinderGeometry(2.5, 7.0, h*0.08, 4, 4, true);
                const cMesh = new THREE.Mesh(cGeo,
                    new THREE.MeshBasicMaterial({ color: 0xc4b5d4, wireframe: true, transparent: true, opacity: 0.16 }));
                cMesh.position.set(x, h + h*0.04, z);
                cMesh.rotation.y = Math.PI/4;
                scene.add(cMesh);
            })();

            /* ── TORRE BBVA 235m — PIRÁMIDE INVERTIDA con exoesqueleto ──
               Rogers Stirk Harbour: se ensancha de arriba hacia abajo,
               patas estructurales en V que tocan el suelo               */
            (function() {
                const x = 89.0, z = -138.8, h = 58.8;
                const hS = Math.round(h * 0.9);
                // Cuerpo principal: más estrecho arriba, ancho abajo
                const geo = new THREE.CylinderGeometry(5.5, 12.5, h, 4, hS, true);
                const mesh = new THREE.Mesh(geo,
                    new THREE.MeshBasicMaterial({ color: 0xc4b5d4, wireframe: true, transparent: true, opacity: 0.19 }));
                mesh.position.set(x, h/2, z);
                mesh.rotation.y = Math.PI/4;
                scene.add(mesh);
                // Patas del exoesqueleto (4 columnas inclinadas en V)
                [[-8,0],[8,0],[0,-8],[0,8]].forEach(([dx,dz]) => {
                    const lg = new THREE.CylinderGeometry(0.35, 1.0, h*0.30, 3, 5, true);
                    const lm = new THREE.Mesh(lg,
                        new THREE.MeshBasicMaterial({ color: 0xc4b5d4, wireframe: true, transparent: true, opacity: 0.14 }));
                    lm.position.set(x+dx, h*0.15, z+dz);
                    if (dx !== 0) lm.rotation.z = Math.sign(dx) * Math.PI/8;
                    if (dz !== 0) lm.rotation.x = -Math.sign(dz) * Math.PI/8;
                    scene.add(lm);
                });
                // Plataforma de base (amplia)
                const bGeo = new THREE.BoxGeometry(26, 3, 26, 13, 2, 13);
                const bMesh = new THREE.Mesh(bGeo,
                    new THREE.MeshBasicMaterial({ color: 0xc4b5d4, wireframe: true, transparent: true, opacity: 0.10 }));
                bMesh.position.set(x, 1.5, z);
                scene.add(bMesh);
            })();

            /* ── TORRE LIBERTAD ~128m — rectangular esbelta ── */
            (function() {
                const x = 154.4, z = -61.1, h = 28.0;
                const geo = new THREE.BoxGeometry(8.0, h, 7.5, 6, Math.round(h*0.88), 5);
                const mesh = new THREE.Mesh(geo,
                    new THREE.MeshBasicMaterial({ color: 0xc4b5d4, wireframe: true, transparent: true, opacity: 0.18 }));
                mesh.position.set(x, h/2, z);
                scene.add(mesh);
            })();


            /* ── ANGEL DE LA INDEPENDENCIA (x=123, z=-22) ──
               Columna de 36m sobre glorieta en Reforma & Río Tiber    */
            (function() {
                var x = 123.0, z = -22.2;
                // Columna delgada (9u = 36m)
                var colGeo = new THREE.CylinderGeometry(0.4, 0.7, 9.0, 8, 6, false);
                var col = new THREE.Mesh(colGeo,
                    new THREE.MeshBasicMaterial({ color: 0xc4b5d4, wireframe: true, transparent: true, opacity: 0.55 }));
                col.position.set(x, 4.5, z);
                scene.add(col);
                // Base / pedestal
                var basGeo = new THREE.CylinderGeometry(1.8, 2.2, 2.5, 8, 3, false);
                var bas = new THREE.Mesh(basGeo,
                    new THREE.MeshBasicMaterial({ color: 0xc4b5d4, wireframe: true, transparent: true, opacity: 0.45 }));
                bas.position.set(x, 1.25, z);
                scene.add(bas);
                // El Angel (esfera + alas = cono)
                var angGeo = new THREE.SphereGeometry(0.6, 6, 4);
                var ang = new THREE.Mesh(angGeo,
                    new THREE.MeshBasicMaterial({ color: 0xc4b5d4, wireframe: true, transparent: true, opacity: 0.50 }));
                ang.position.set(x, 9.6, z);
                scene.add(ang);
                // Glorieta (anillo)
                var glorGeo = new THREE.TorusGeometry(15, 0.4, 6, 60);
                var glor = new THREE.Mesh(glorGeo,
                    new THREE.MeshBasicMaterial({ color: 0xc4b5d4, wireframe: true, transparent: true, opacity: 0.28 }));
                glor.rotation.x = Math.PI / 2;
                glor.position.set(x, 0.3, z);
                scene.add(glor);
            })();

            /* ── ZONA ESTE — edificios en el camino del pull-back (x=230-480) ── */
            mkBuilding(233.0,-61.0,18.0,7.6,7.6,0xc4b5d4,0.26);
            mkBuilding(227.0,-48.0,22.0,9.9,10.0,0xc4b5d4,0.26);
            mkBuilding(228.0,-36.0,25.0,8.9,8.5,0xc4b5d4,0.26);
            mkBuilding(233.0,-22.0,8.0,9.5,8.5,0xc4b5d4,0.26);
            mkBuilding(233.0,-5.0,14.0,8.5,9.5,0xc4b5d4,0.26);
            mkBuilding(242.0,-61.0,18.0,7.4,8.7,0xc4b5d4,0.25);
            mkBuilding(243.0,-46.0,22.0,7.6,7.6,0xc4b5d4,0.25);
            mkBuilding(241.0,-31.0,14.0,9.1,9.7,0xc4b5d4,0.25);
            mkBuilding(245.0,-19.0,25.0,7.2,9.5,0xc4b5d4,0.25);
            mkBuilding(246.0,-6.0,14.0,9.2,9.5,0xc4b5d4,0.25);
            mkBuilding(255.0,-59.0,22.0,9.5,9.8,0xc4b5d4,0.25);
            mkBuilding(261.0,-46.0,10.0,7.8,8.9,0xc4b5d4,0.25);
            mkBuilding(259.0,-37.0,18.0,9.8,7.2,0xc4b5d4,0.25);
            mkBuilding(261.0,-18.0,20.0,9.3,9.8,0xc4b5d4,0.25);
            mkBuilding(259.0,-10.0,14.0,8.7,8.2,0xc4b5d4,0.25);
            mkBuilding(270.0,-57.0,20.0,7.0,10.0,0xc4b5d4,0.24);
            mkBuilding(269.0,-47.0,30.0,7.1,8.1,0xc4b5d4,0.24);
            mkBuilding(272.0,-37.0,16.0,10.0,9.7,0xc4b5d4,0.24);
            mkBuilding(274.0,-21.0,8.0,9.0,9.5,0xc4b5d4,0.24);
            mkBuilding(274.0,-11.0,12.0,7.9,7.3,0xc4b5d4,0.24);
            mkBuilding(289.0,-60.0,18.0,9.8,9.3,0xc4b5d4,0.23);
            mkBuilding(287.0,-50.0,8.0,9.4,7.4,0xc4b5d4,0.24);
            mkBuilding(289.0,-31.0,8.0,9.1,7.7,0xc4b5d4,0.23);
            mkBuilding(288.0,-21.0,10.0,9.6,9.9,0xc4b5d4,0.24);
            mkBuilding(283.0,-5.0,12.0,7.7,7.6,0xc4b5d4,0.24);
            mkBuilding(303.0,-63.0,12.0,7.5,7.1,0xc4b5d4,0.23);
            mkBuilding(303.0,-49.0,30.0,8.5,8.1,0xc4b5d4,0.23);
            mkBuilding(301.0,-32.0,28.0,8.3,8.5,0xc4b5d4,0.23);
            mkBuilding(301.0,-18.0,10.0,8.4,8.2,0xc4b5d4,0.23);
            mkBuilding(301.0,-9.0,16.0,8.4,7.6,0xc4b5d4,0.23);
            mkBuilding(315.0,-60.0,10.0,7.1,9.2,0xc4b5d4,0.22);
            mkBuilding(311.0,-50.0,30.0,9.6,8.5,0xc4b5d4,0.23);
            mkBuilding(316.0,-37.0,20.0,7.5,9.9,0xc4b5d4,0.22);
            mkBuilding(314.0,-22.0,22.0,9.6,8.6,0xc4b5d4,0.22);
            mkBuilding(317.0,-5.0,20.0,7.6,9.5,0xc4b5d4,0.22);
            mkBuilding(328.0,-57.0,16.0,7.9,9.7,0xc4b5d4,0.22);
            mkBuilding(325.0,-44.0,25.0,8.0,9.7,0xc4b5d4,0.22);
            mkBuilding(331.0,-35.0,18.0,9.3,10.0,0xc4b5d4,0.22);
            mkBuilding(328.0,-19.0,30.0,8.6,8.5,0xc4b5d4,0.22);
            mkBuilding(328.0,-5.0,16.0,8.1,9.2,0xc4b5d4,0.22);
            mkBuilding(343.0,-57.0,30.0,7.9,7.2,0xc4b5d4,0.21);
            mkBuilding(344.0,-50.0,12.0,7.4,9.8,0xc4b5d4,0.21);
            mkBuilding(344.0,-37.0,14.0,9.7,8.8,0xc4b5d4,0.21);
            mkBuilding(343.0,-20.0,30.0,8.7,8.6,0xc4b5d4,0.21);
            mkBuilding(345.0,-6.0,28.0,7.4,9.1,0xc4b5d4,0.21);
            mkBuilding(354.0,-61.0,12.0,9.0,8.0,0xc4b5d4,0.21);
            mkBuilding(358.0,-46.0,28.0,8.7,8.1,0xc4b5d4,0.21);
            mkBuilding(358.0,-35.0,10.0,8.1,8.9,0xc4b5d4,0.21);
            mkBuilding(358.0,-18.0,8.0,7.1,9.2,0xc4b5d4,0.21);
            mkBuilding(354.0,-8.0,20.0,9.4,8.6,0xc4b5d4,0.21);
            mkBuilding(373.0,-63.0,20.0,7.0,7.1,0xc4b5d4,0.2);
            mkBuilding(373.0,-49.0,8.0,9.8,8.9,0xc4b5d4,0.2);
            mkBuilding(369.0,-31.0,28.0,9.8,8.9,0xc4b5d4,0.2);
            mkBuilding(373.0,-23.0,25.0,9.7,7.3,0xc4b5d4,0.2);
            mkBuilding(367.0,-7.0,20.0,8.5,7.2,0xc4b5d4,0.2);
            mkBuilding(386.0,-60.0,14.0,8.6,9.3,0xc4b5d4,0.2);
            mkBuilding(383.0,-48.0,22.0,7.7,8.5,0xc4b5d4,0.2);
            mkBuilding(384.0,-33.0,20.0,9.2,9.6,0xc4b5d4,0.2);
            mkBuilding(387.0,-23.0,20.0,9.1,7.6,0xc4b5d4,0.2);
            mkBuilding(385.0,-6.0,30.0,7.9,9.0,0xc4b5d4,0.2);
            mkBuilding(397.0,-58.0,20.0,7.6,8.5,0xc4b5d4,0.19);
            mkBuilding(401.0,-45.0,14.0,7.8,9.4,0xc4b5d4,0.19);
            mkBuilding(396.0,-35.0,30.0,7.4,7.8,0xc4b5d4,0.19);
            mkBuilding(398.0,-22.0,16.0,8.5,9.1,0xc4b5d4,0.19);
            mkBuilding(395.0,-8.0,28.0,9.0,7.8,0xc4b5d4,0.19);
            mkBuilding(410.0,-63.0,16.0,8.7,8.3,0xc4b5d4,0.19);
            mkBuilding(413.0,-46.0,20.0,9.1,9.6,0xc4b5d4,0.19);
            mkBuilding(415.0,-37.0,30.0,8.3,9.6,0xc4b5d4,0.18);
            mkBuilding(411.0,-21.0,22.0,9.7,9.7,0xc4b5d4,0.19);
            mkBuilding(412.0,-8.0,25.0,8.3,9.3,0xc4b5d4,0.19);
            mkBuilding(423.0,-59.0,16.0,9.8,8.3,0xc4b5d4,0.18);
            mkBuilding(429.0,-47.0,30.0,8.7,8.7,0xc4b5d4,0.18);
            mkBuilding(426.0,-35.0,18.0,9.0,8.8,0xc4b5d4,0.18);
            mkBuilding(429.0,-24.0,18.0,8.1,7.4,0xc4b5d4,0.18);
            mkBuilding(428.0,-10.0,12.0,7.1,8.7,0xc4b5d4,0.18);
            mkBuilding(439.0,-61.0,10.0,9.6,9.0,0xc4b5d4,0.17);
            mkBuilding(443.0,-44.0,12.0,7.5,8.3,0xc4b5d4,0.17);
            mkBuilding(437.0,-34.0,28.0,7.3,8.9,0xc4b5d4,0.18);
            mkBuilding(438.0,-23.0,30.0,8.8,9.8,0xc4b5d4,0.18);
            mkBuilding(440.0,-11.0,28.0,10.0,9.7,0xc4b5d4,0.17);
            mkBuilding(451.0,-63.0,8.0,9.2,8.5,0xc4b5d4,0.17);
            mkBuilding(453.0,-47.0,25.0,7.2,7.6,0xc4b5d4,0.17);
            mkBuilding(453.0,-33.0,14.0,8.8,9.6,0xc4b5d4,0.17);
            mkBuilding(451.0,-19.0,30.0,9.4,9.9,0xc4b5d4,0.17);
            mkBuilding(456.0,-10.0,12.0,9.5,9.4,0xc4b5d4,0.17);
            mkBuilding(467.0,-61.0,16.0,7.2,8.6,0xc4b5d4,0.16);
            mkBuilding(465.0,-46.0,14.0,8.1,8.4,0xc4b5d4,0.16);
            mkBuilding(470.0,-34.0,14.0,7.3,8.4,0xc4b5d4,0.16);
            mkBuilding(470.0,-21.0,20.0,8.8,7.3,0xc4b5d4,0.16);
            mkBuilding(466.0,-11.0,30.0,8.5,7.9,0xc4b5d4,0.16);
            mkBuilding(485.0,-59.0,18.0,9.2,8.0,0xc4b5d4,0.16);
            mkBuilding(482.0,-48.0,18.0,7.7,9.4,0xc4b5d4,0.16);
            mkBuilding(479.0,-37.0,25.0,7.7,9.9,0xc4b5d4,0.16);
            mkBuilding(485.0,-18.0,8.0,8.3,7.3,0xc4b5d4,0.16);
            mkBuilding(480.0,-6.0,30.0,10.0,7.7,0xc4b5d4,0.16);
            mkBuilding(230.0,-168.0,14.0,7.9,7.7,0xc4b5d4,0.24);
            mkBuilding(233.0,-160.0,18.0,8.5,8.7,0xc4b5d4,0.24);
            mkBuilding(228.0,-144.0,22.0,9.8,7.5,0xc4b5d4,0.24);
            mkBuilding(227.0,-128.0,8.0,7.1,7.0,0xc4b5d4,0.24);
            mkBuilding(229.0,-115.0,22.0,7.8,8.4,0xc4b5d4,0.24);
            mkBuilding(227.0,-102.0,16.0,8.3,9.7,0xc4b5d4,0.24);
            mkBuilding(231.0,-95.0,22.0,7.1,9.8,0xc4b5d4,0.24);
            mkBuilding(243.0,-167.0,12.0,7.3,7.5,0xc4b5d4,0.23);
            mkBuilding(244.0,-158.0,16.0,9.8,7.3,0xc4b5d4,0.23);
            mkBuilding(245.0,-145.0,16.0,7.0,7.9,0xc4b5d4,0.23);
            mkBuilding(243.0,-133.0,20.0,7.8,8.0,0xc4b5d4,0.23);
            mkBuilding(245.0,-121.0,22.0,9.6,7.6,0xc4b5d4,0.23);
            mkBuilding(246.0,-103.0,8.0,9.4,7.1,0xc4b5d4,0.23);
            mkBuilding(245.0,-90.0,20.0,8.9,7.6,0xc4b5d4,0.23);
            mkBuilding(256.0,-172.0,10.0,9.8,9.4,0xc4b5d4,0.23);
            mkBuilding(259.0,-158.0,16.0,7.7,8.8,0xc4b5d4,0.23);
            mkBuilding(254.0,-143.0,16.0,9.0,7.3,0xc4b5d4,0.23);
            mkBuilding(258.0,-128.0,8.0,7.4,8.8,0xc4b5d4,0.23);
            mkBuilding(254.0,-119.0,20.0,7.3,7.8,0xc4b5d4,0.23);
            mkBuilding(254.0,-107.0,12.0,9.3,9.4,0xc4b5d4,0.23);
            mkBuilding(258.0,-93.0,14.0,9.3,8.3,0xc4b5d4,0.23);
            mkBuilding(269.0,-168.0,20.0,9.9,7.6,0xc4b5d4,0.22);
            mkBuilding(266.0,-156.0,14.0,8.2,8.3,0xc4b5d4,0.22);
            mkBuilding(266.0,-143.0,12.0,8.6,8.8,0xc4b5d4,0.22);
            mkBuilding(268.0,-130.0,12.0,7.5,7.9,0xc4b5d4,0.22);
            mkBuilding(271.0,-120.0,10.0,8.6,7.2,0xc4b5d4,0.22);
            mkBuilding(269.0,-102.0,16.0,8.2,7.4,0xc4b5d4,0.22);
            mkBuilding(270.0,-94.0,22.0,9.5,8.2,0xc4b5d4,0.22);
            mkBuilding(282.0,-170.0,20.0,7.8,9.6,0xc4b5d4,0.22);
            mkBuilding(284.0,-160.0,10.0,7.7,7.2,0xc4b5d4,0.22);
            mkBuilding(283.0,-141.0,10.0,10.0,9.5,0xc4b5d4,0.22);
            mkBuilding(279.0,-131.0,20.0,7.7,8.3,0xc4b5d4,0.22);
            mkBuilding(279.0,-121.0,16.0,8.3,9.6,0xc4b5d4,0.22);
            mkBuilding(281.0,-106.0,8.0,7.9,9.0,0xc4b5d4,0.22);
            mkBuilding(281.0,-95.0,14.0,9.8,8.9,0xc4b5d4,0.22);
            mkBuilding(292.0,-170.0,22.0,7.4,9.6,0xc4b5d4,0.21);
            mkBuilding(298.0,-157.0,8.0,9.7,8.7,0xc4b5d4,0.21);
            mkBuilding(298.0,-144.0,16.0,7.7,8.9,0xc4b5d4,0.21);
            mkBuilding(296.0,-129.0,12.0,8.7,7.0,0xc4b5d4,0.21);
            mkBuilding(295.0,-121.0,20.0,9.9,9.8,0xc4b5d4,0.21);
            mkBuilding(295.0,-106.0,16.0,7.2,10.0,0xc4b5d4,0.21);
            mkBuilding(296.0,-90.0,14.0,8.1,9.6,0xc4b5d4,0.21);
            mkBuilding(305.0,-172.0,20.0,8.1,9.0,0xc4b5d4,0.21);
            mkBuilding(311.0,-156.0,18.0,9.9,8.2,0xc4b5d4,0.21);
            mkBuilding(311.0,-141.0,8.0,8.3,9.1,0xc4b5d4,0.21);
            mkBuilding(311.0,-130.0,20.0,8.3,7.0,0xc4b5d4,0.21);
            mkBuilding(311.0,-115.0,8.0,9.8,7.3,0xc4b5d4,0.21);
            mkBuilding(308.0,-106.0,14.0,8.0,7.8,0xc4b5d4,0.21);
            mkBuilding(308.0,-91.0,12.0,8.0,7.4,0xc4b5d4,0.21);
            mkBuilding(322.0,-171.0,18.0,8.8,9.7,0xc4b5d4,0.2);
            mkBuilding(319.0,-157.0,12.0,8.3,9.4,0xc4b5d4,0.2);
            mkBuilding(319.0,-147.0,10.0,9.5,9.4,0xc4b5d4,0.2);
            mkBuilding(322.0,-130.0,20.0,7.4,9.3,0xc4b5d4,0.2);
            mkBuilding(319.0,-117.0,12.0,7.4,10.0,0xc4b5d4,0.2);
            mkBuilding(318.0,-103.0,12.0,8.5,9.1,0xc4b5d4,0.2);
            mkBuilding(319.0,-90.0,14.0,8.2,8.9,0xc4b5d4,0.2);
            mkBuilding(337.0,-168.0,22.0,9.6,8.6,0xc4b5d4,0.2);
            mkBuilding(334.0,-157.0,10.0,7.1,7.9,0xc4b5d4,0.2);
            mkBuilding(334.0,-145.0,8.0,7.2,9.2,0xc4b5d4,0.2);
            mkBuilding(337.0,-133.0,22.0,9.8,7.4,0xc4b5d4,0.2);
            mkBuilding(333.0,-121.0,20.0,9.8,8.6,0xc4b5d4,0.2);
            mkBuilding(332.0,-107.0,10.0,7.3,8.1,0xc4b5d4,0.2);
            mkBuilding(331.0,-93.0,16.0,8.3,8.5,0xc4b5d4,0.2);
            mkBuilding(346.0,-168.0,10.0,9.0,9.0,0xc4b5d4,0.19);
            mkBuilding(347.0,-157.0,10.0,7.4,7.1,0xc4b5d4,0.19);
            mkBuilding(344.0,-147.0,8.0,8.0,8.2,0xc4b5d4,0.19);
            mkBuilding(348.0,-131.0,14.0,8.7,7.7,0xc4b5d4,0.19);
            mkBuilding(349.0,-118.0,20.0,8.0,8.6,0xc4b5d4,0.19);
            mkBuilding(344.0,-103.0,12.0,7.5,9.8,0xc4b5d4,0.19);
            mkBuilding(348.0,-92.0,14.0,8.7,9.9,0xc4b5d4,0.19);
            mkBuilding(363.0,-171.0,14.0,7.5,9.7,0xc4b5d4,0.19);
            mkBuilding(359.0,-160.0,20.0,7.1,8.1,0xc4b5d4,0.19);
            mkBuilding(358.0,-147.0,14.0,9.3,8.9,0xc4b5d4,0.19);
            mkBuilding(362.0,-132.0,20.0,9.4,9.4,0xc4b5d4,0.19);
            mkBuilding(359.0,-121.0,18.0,8.0,9.0,0xc4b5d4,0.19);
            mkBuilding(357.0,-104.0,8.0,7.1,8.6,0xc4b5d4,0.19);
            mkBuilding(359.0,-95.0,8.0,9.6,7.5,0xc4b5d4,0.19);
            mkBuilding(373.0,-168.0,16.0,9.9,10.0,0xc4b5d4,0.18);
            mkBuilding(371.0,-160.0,16.0,9.2,7.2,0xc4b5d4,0.18);
            mkBuilding(372.0,-144.0,12.0,9.0,9.6,0xc4b5d4,0.18);
            mkBuilding(373.0,-130.0,10.0,9.7,8.4,0xc4b5d4,0.18);
            mkBuilding(376.0,-118.0,12.0,9.6,9.8,0xc4b5d4,0.18);
            mkBuilding(374.0,-106.0,18.0,7.4,8.3,0xc4b5d4,0.18);
            mkBuilding(373.0,-91.0,22.0,9.0,9.6,0xc4b5d4,0.18);
            mkBuilding(387.0,-169.0,12.0,8.3,8.8,0xc4b5d4,0.18);
            mkBuilding(388.0,-155.0,12.0,8.7,8.0,0xc4b5d4,0.18);
            mkBuilding(385.0,-144.0,12.0,8.5,8.6,0xc4b5d4,0.18);
            mkBuilding(387.0,-129.0,8.0,7.3,8.9,0xc4b5d4,0.18);
            mkBuilding(387.0,-118.0,14.0,8.8,9.8,0xc4b5d4,0.18);
            mkBuilding(387.0,-103.0,10.0,8.4,7.0,0xc4b5d4,0.18);
            mkBuilding(388.0,-89.0,12.0,7.1,9.4,0xc4b5d4,0.18);
            mkBuilding(398.0,-172.0,22.0,9.8,8.3,0xc4b5d4,0.17);
            mkBuilding(398.0,-159.0,18.0,9.7,9.4,0xc4b5d4,0.17);
            mkBuilding(399.0,-142.0,22.0,9.5,7.0,0xc4b5d4,0.17);
            mkBuilding(400.0,-132.0,8.0,8.7,9.8,0xc4b5d4,0.17);
            mkBuilding(401.0,-118.0,16.0,9.3,8.5,0xc4b5d4,0.17);
            mkBuilding(397.0,-105.0,20.0,9.5,7.2,0xc4b5d4,0.17);
            mkBuilding(402.0,-92.0,14.0,9.1,9.4,0xc4b5d4,0.17);
            mkBuilding(413.0,-170.0,8.0,9.7,7.4,0xc4b5d4,0.17);
            mkBuilding(411.0,-157.0,12.0,7.2,8.6,0xc4b5d4,0.17);
            mkBuilding(412.0,-147.0,12.0,9.0,9.8,0xc4b5d4,0.17);
            mkBuilding(414.0,-132.0,10.0,8.0,8.1,0xc4b5d4,0.16);
            mkBuilding(415.0,-118.0,12.0,8.8,10.0,0xc4b5d4,0.16);
            mkBuilding(414.0,-106.0,8.0,8.3,9.1,0xc4b5d4,0.16);
            mkBuilding(412.0,-95.0,16.0,9.7,7.3,0xc4b5d4,0.17);
            mkBuilding(427.0,-167.0,16.0,9.9,7.8,0xc4b5d4,0.16);
            mkBuilding(426.0,-155.0,10.0,9.8,8.0,0xc4b5d4,0.16);
            mkBuilding(422.0,-146.0,8.0,8.5,7.6,0xc4b5d4,0.16);
            mkBuilding(422.0,-129.0,22.0,8.3,8.9,0xc4b5d4,0.16);
            mkBuilding(424.0,-118.0,22.0,8.2,7.8,0xc4b5d4,0.16);
            mkBuilding(425.0,-106.0,14.0,7.9,7.8,0xc4b5d4,0.16);
            mkBuilding(427.0,-95.0,12.0,7.4,8.3,0xc4b5d4,0.16);
            mkBuilding(441.0,-171.0,20.0,10.0,9.9,0xc4b5d4,0.15);
            mkBuilding(436.0,-156.0,20.0,9.8,7.5,0xc4b5d4,0.16);
            mkBuilding(440.0,-141.0,16.0,8.8,7.3,0xc4b5d4,0.15);
            mkBuilding(437.0,-130.0,8.0,9.0,7.2,0xc4b5d4,0.16);
            mkBuilding(435.0,-120.0,22.0,7.6,9.2,0xc4b5d4,0.16);
            mkBuilding(435.0,-103.0,12.0,9.6,8.9,0xc4b5d4,0.16);
            mkBuilding(440.0,-90.0,16.0,8.0,8.3,0xc4b5d4,0.15);
            mkBuilding(450.0,-172.0,8.0,7.6,9.5,0xc4b5d4,0.15);
            mkBuilding(451.0,-158.0,14.0,8.9,9.9,0xc4b5d4,0.15);
            mkBuilding(449.0,-142.0,14.0,7.1,7.5,0xc4b5d4,0.15);
            mkBuilding(449.0,-130.0,8.0,7.8,9.0,0xc4b5d4,0.15);
            mkBuilding(454.0,-116.0,14.0,8.7,9.6,0xc4b5d4,0.15);
            mkBuilding(450.0,-103.0,10.0,9.4,8.4,0xc4b5d4,0.15);
            mkBuilding(454.0,-91.0,10.0,9.3,7.3,0xc4b5d4,0.15);
            mkBuilding(464.0,-173.0,16.0,7.6,8.1,0xc4b5d4,0.14);
            mkBuilding(467.0,-158.0,20.0,9.0,9.5,0xc4b5d4,0.14);
            mkBuilding(464.0,-147.0,8.0,9.8,9.9,0xc4b5d4,0.14);
            mkBuilding(465.0,-130.0,8.0,9.2,9.6,0xc4b5d4,0.14);
            mkBuilding(464.0,-115.0,8.0,7.1,7.3,0xc4b5d4,0.14);
            mkBuilding(462.0,-105.0,8.0,7.5,7.6,0xc4b5d4,0.15);
            mkBuilding(461.0,-94.0,8.0,7.9,7.8,0xc4b5d4,0.15);
            mkBuilding(477.0,-170.0,22.0,8.8,7.1,0xc4b5d4,0.14);
            mkBuilding(474.0,-160.0,12.0,9.3,8.0,0xc4b5d4,0.14);
            mkBuilding(476.0,-142.0,10.0,9.7,8.9,0xc4b5d4,0.14);
            mkBuilding(478.0,-129.0,8.0,7.3,7.6,0xc4b5d4,0.14);
            mkBuilding(474.0,-120.0,22.0,8.6,7.8,0xc4b5d4,0.14);
            mkBuilding(477.0,-106.0,8.0,9.5,8.8,0xc4b5d4,0.14);
            mkBuilding(479.0,-90.0,10.0,7.1,9.9,0xc4b5d4,0.14);
            mkBuilding(228.0,-89.0,28.0,10.8,9.9,0xc4b5d4,0.22);
            mkBuilding(229.0,-82.0,25.0,10.0,9.4,0xc4b5d4,0.22);
            mkBuilding(234.0,-72.0,20.0,9.2,9.2,0xc4b5d4,0.22);
            mkBuilding(226.0,-68.0,20.0,10.7,8.2,0xc4b5d4,0.22);
            mkBuilding(247.0,-86.0,18.0,9.1,9.1,0xc4b5d4,0.21);
            mkBuilding(245.0,-83.0,25.0,10.8,9.2,0xc4b5d4,0.21);
            mkBuilding(250.0,-74.0,28.0,9.3,8.2,0xc4b5d4,0.21);
            mkBuilding(246.0,-67.0,22.0,9.9,8.7,0xc4b5d4,0.21);
            mkBuilding(262.0,-86.0,22.0,8.8,8.1,0xc4b5d4,0.21);
            mkBuilding(270.0,-82.0,28.0,9.1,8.1,0xc4b5d4,0.21);
            mkBuilding(266.0,-80.0,18.0,8.8,9.5,0xc4b5d4,0.21);
            mkBuilding(266.0,-73.0,18.0,8.5,8.0,0xc4b5d4,0.21);
            mkBuilding(270.0,-66.0,12.0,8.4,9.4,0xc4b5d4,0.21);
            mkBuilding(282.0,-89.0,18.0,10.9,8.7,0xc4b5d4,0.2);
            mkBuilding(282.0,-82.0,22.0,8.4,9.4,0xc4b5d4,0.2);
            mkBuilding(285.0,-72.0,25.0,9.8,8.7,0xc4b5d4,0.2);
            mkBuilding(288.0,-67.0,12.0,10.4,9.5,0xc4b5d4,0.2);
            mkBuilding(306.0,-89.0,28.0,9.8,8.5,0xc4b5d4,0.2);
            mkBuilding(302.0,-83.0,12.0,9.4,9.3,0xc4b5d4,0.2);
            mkBuilding(299.0,-71.0,22.0,9.3,8.3,0xc4b5d4,0.2);
            mkBuilding(305.0,-67.0,12.0,9.6,8.6,0xc4b5d4,0.2);
            mkBuilding(320.0,-88.0,25.0,10.2,9.2,0xc4b5d4,0.19);
            mkBuilding(323.0,-85.0,22.0,10.5,9.4,0xc4b5d4,0.19);
            mkBuilding(321.0,-71.0,22.0,10.4,9.0,0xc4b5d4,0.19);
            mkBuilding(316.0,-69.0,25.0,10.3,8.6,0xc4b5d4,0.19);
            mkBuilding(337.0,-86.0,15.0,10.8,8.1,0xc4b5d4,0.19);
            mkBuilding(337.0,-82.0,28.0,8.7,8.4,0xc4b5d4,0.19);
            mkBuilding(339.0,-73.0,22.0,10.0,8.6,0xc4b5d4,0.19);
            mkBuilding(342.0,-67.0,18.0,8.8,9.2,0xc4b5d4,0.19);
            mkBuilding(355.0,-88.0,22.0,9.6,8.7,0xc4b5d4,0.18);
            mkBuilding(356.0,-81.0,20.0,8.5,8.0,0xc4b5d4,0.18);
            mkBuilding(359.0,-73.0,15.0,10.7,8.2,0xc4b5d4,0.18);
            mkBuilding(354.0,-67.0,12.0,9.2,8.8,0xc4b5d4,0.18);
            mkBuilding(378.0,-88.0,12.0,10.5,8.9,0xc4b5d4,0.17);
            mkBuilding(372.0,-85.0,25.0,8.7,9.7,0xc4b5d4,0.18);
            mkBuilding(375.0,-80.0,22.0,8.8,8.4,0xc4b5d4,0.18);
            mkBuilding(375.0,-72.0,28.0,9.2,8.3,0xc4b5d4,0.18);
            mkBuilding(372.0,-66.0,12.0,9.2,9.2,0xc4b5d4,0.18);
            mkBuilding(393.0,-89.0,18.0,9.3,9.4,0xc4b5d4,0.17);
            mkBuilding(389.0,-83.0,12.0,9.8,8.2,0xc4b5d4,0.17);
            mkBuilding(395.0,-72.0,18.0,8.5,9.1,0xc4b5d4,0.17);
            mkBuilding(396.0,-70.0,12.0,8.2,8.5,0xc4b5d4,0.17);
            mkBuilding(412.0,-87.0,20.0,8.2,9.7,0xc4b5d4,0.16);
            mkBuilding(409.0,-81.0,18.0,10.4,8.9,0xc4b5d4,0.17);
            mkBuilding(410.0,-74.0,15.0,10.9,9.4,0xc4b5d4,0.16);
            mkBuilding(409.0,-68.0,12.0,9.9,8.1,0xc4b5d4,0.17);
            mkBuilding(425.0,-89.0,15.0,10.6,8.4,0xc4b5d4,0.16);
            mkBuilding(426.0,-82.0,18.0,9.0,9.2,0xc4b5d4,0.16);
            mkBuilding(432.0,-73.0,15.0,10.1,8.1,0xc4b5d4,0.16);
            mkBuilding(425.0,-68.0,12.0,9.6,9.3,0xc4b5d4,0.16);
            mkBuilding(445.0,-86.0,18.0,9.2,8.5,0xc4b5d4,0.15);
            mkBuilding(444.0,-81.0,20.0,10.6,9.3,0xc4b5d4,0.15);
            mkBuilding(443.0,-73.0,15.0,9.5,8.6,0xc4b5d4,0.15);
            mkBuilding(447.0,-68.0,22.0,9.2,9.6,0xc4b5d4,0.15);
            mkBuilding(466.0,-89.0,18.0,8.9,8.2,0xc4b5d4,0.15);
            mkBuilding(465.0,-84.0,12.0,9.0,8.2,0xc4b5d4,0.15);
            mkBuilding(464.0,-80.0,12.0,9.0,9.8,0xc4b5d4,0.15);
            mkBuilding(468.0,-71.0,20.0,9.2,9.0,0xc4b5d4,0.15);
            mkBuilding(464.0,-66.0,22.0,8.3,9.7,0xc4b5d4,0.15);
            mkBuilding(486.0,-86.0,22.0,8.3,9.0,0xc4b5d4,0.14);
            mkBuilding(478.0,-85.0,20.0,10.2,8.0,0xc4b5d4,0.14);
            mkBuilding(479.0,-80.0,25.0,8.5,9.4,0xc4b5d4,0.14);
            mkBuilding(486.0,-74.0,20.0,9.7,8.9,0xc4b5d4,0.14);
            mkBuilding(481.0,-68.0,20.0,8.5,9.4,0xc4b5d4,0.14);

            /* ── 214 EDIFICIOS GENERADOS GPS (zonas norte, sur, flancos, fondo) ── */
            mkBuilding(67.0, -63.0, 8.0, 9.2, 7.7, 0xc4b5d4, 0.16);
            mkBuilding(63.0, -45.0, 10.0, 9.0, 9.7, 0xc4b5d4, 0.15);
            mkBuilding(62.0, -33.0, 20.0, 7.1, 7.3, 0xc4b5d4, 0.15);
            mkBuilding(63.0, -20.0, 28.0, 7.1, 7.6, 0xc4b5d4, 0.15);
            mkBuilding(67.0, -6.0, 25.0, 8.3, 8.3, 0xc4b5d4, 0.16);
            mkBuilding(78.0, -57.0, 8.0, 9.3, 7.5, 0xc4b5d4, 0.16);
            mkBuilding(79.0, -48.0, 16.0, 7.5, 9.9, 0xc4b5d4, 0.16);
            mkBuilding(78.0, -37.0, 10.0, 8.1, 8.1, 0xc4b5d4, 0.16);
            mkBuilding(78.0, -20.0, 16.0, 9.4, 9.2, 0xc4b5d4, 0.16);
            mkBuilding(80.0, -11.0, 20.0, 7.2, 7.9, 0xc4b5d4, 0.16);
            mkBuilding(95.0, -59.0, 18.0, 8.7, 9.1, 0xc4b5d4, 0.17);
            mkBuilding(90.0, -45.0, 14.0, 9.3, 10.0, 0xc4b5d4, 0.17);
            mkBuilding(96.0, -36.0, 10.0, 8.1, 8.4, 0xc4b5d4, 0.17);
            mkBuilding(96.0, -22.0, 12.0, 8.1, 7.6, 0xc4b5d4, 0.17);
            mkBuilding(92.0, -6.0, 10.0, 8.8, 7.5, 0xc4b5d4, 0.17);
            mkBuilding(109.0, -62.0, 12.0, 8.4, 7.8, 0xc4b5d4, 0.17);
            mkBuilding(109.0, -45.0, 25.0, 7.7, 8.0, 0xc4b5d4, 0.17);
            mkBuilding(110.0, -31.0, 8.0, 7.7, 7.1, 0xc4b5d4, 0.17);
            mkBuilding(106.0, -21.0, 16.0, 7.2, 9.7, 0xc4b5d4, 0.17);
            mkBuilding(108.0, -6.0, 18.0, 7.6, 8.5, 0xc4b5d4, 0.17);
            mkBuilding(123.0, -60.0, 12.0, 7.8, 7.7, 0xc4b5d4, 0.18);
            mkBuilding(122.0, -46.0, 16.0, 9.2, 8.3, 0xc4b5d4, 0.18);
            mkBuilding(122.0, -34.0, 18.0, 7.7, 10.0, 0xc4b5d4, 0.18);
            mkBuilding(122.0, -21.0, 10.0, 9.3, 9.6, 0xc4b5d4, 0.18);
            mkBuilding(119.0, -6.0, 12.0, 9.4, 8.3, 0xc4b5d4, 0.18);
            mkBuilding(132.0, -60.0, 20.0, 8.8, 8.4, 0xc4b5d4, 0.18);
            mkBuilding(134.0, -46.0, 8.0, 9.0, 7.3, 0xc4b5d4, 0.18);
            mkBuilding(136.0, -31.0, 16.0, 9.3, 8.0, 0xc4b5d4, 0.18);
            mkBuilding(134.0, -21.0, 12.0, 8.4, 9.9, 0xc4b5d4, 0.18);
            mkBuilding(137.0, -9.0, 25.0, 9.3, 8.5, 0xc4b5d4, 0.18);
            mkBuilding(151.0, -48.0, 25.0, 8.8, 7.5, 0xc4b5d4, 0.19);
            mkBuilding(152.0, -36.0, 25.0, 9.9, 9.8, 0xc4b5d4, 0.19);
            mkBuilding(146.0, -20.0, 18.0, 8.5, 7.3, 0xc4b5d4, 0.19);
            mkBuilding(148.0, -5.0, 16.0, 7.7, 7.7, 0xc4b5d4, 0.19);
            mkBuilding(160.0, -45.0, 22.0, 9.4, 9.9, 0xc4b5d4, 0.19);
            mkBuilding(164.0, -31.0, 12.0, 7.4, 8.4, 0xc4b5d4, 0.2);
            mkBuilding(164.0, -23.0, 16.0, 8.6, 8.8, 0xc4b5d4, 0.2);
            mkBuilding(161.0, -7.0, 14.0, 9.1, 8.2, 0xc4b5d4, 0.19);
            mkBuilding(179.0, -58.0, 18.0, 8.3, 8.6, 0xc4b5d4, 0.2);
            mkBuilding(174.0, -49.0, 14.0, 7.2, 7.1, 0xc4b5d4, 0.2);
            mkBuilding(178.0, -36.0, 28.0, 7.7, 7.2, 0xc4b5d4, 0.2);
            mkBuilding(179.0, -24.0, 14.0, 7.2, 7.1, 0xc4b5d4, 0.2);
            mkBuilding(176.0, -11.0, 25.0, 7.7, 9.0, 0xc4b5d4, 0.2);
            mkBuilding(189.0, -59.0, 12.0, 9.2, 9.6, 0xc4b5d4, 0.21);
            mkBuilding(192.0, -47.0, 14.0, 9.4, 9.4, 0xc4b5d4, 0.21);
            mkBuilding(189.0, -37.0, 10.0, 9.0, 8.1, 0xc4b5d4, 0.21);
            mkBuilding(191.0, -21.0, 8.0, 9.0, 10.0, 0xc4b5d4, 0.21);
            mkBuilding(188.0, -11.0, 20.0, 9.2, 9.4, 0xc4b5d4, 0.2);
            mkBuilding(202.0, -62.0, 14.0, 7.6, 8.3, 0xc4b5d4, 0.21);
            mkBuilding(205.0, -49.0, 16.0, 8.4, 9.6, 0xc4b5d4, 0.21);
            mkBuilding(202.0, -34.0, 25.0, 7.3, 9.0, 0xc4b5d4, 0.21);
            mkBuilding(206.0, -18.0, 8.0, 9.9, 9.8, 0xc4b5d4, 0.21);
            mkBuilding(208.0, -10.0, 12.0, 8.2, 8.4, 0xc4b5d4, 0.21);
            mkBuilding(222.0, -60.0, 8.0, 7.5, 7.0, 0xc4b5d4, 0.22);
            mkBuilding(219.0, -48.0, 22.0, 7.9, 9.1, 0xc4b5d4, 0.22);
            mkBuilding(221.0, -31.0, 25.0, 9.0, 8.5, 0xc4b5d4, 0.22);
            mkBuilding(217.0, -22.0, 14.0, 9.9, 8.7, 0xc4b5d4, 0.22);
            mkBuilding(220.0, -11.0, 18.0, 7.2, 8.8, 0xc4b5d4, 0.22);
            mkBuilding(56.0, -167.0, 24.0, 7.5, 9.9, 0xc4b5d4, 0.15);
            mkBuilding(52.0, -154.0, 12.0, 7.2, 7.2, 0xc4b5d4, 0.15);
            mkBuilding(58.0, -146.0, 20.0, 7.4, 9.7, 0xc4b5d4, 0.15);
            mkBuilding(53.0, -130.0, 26.0, 7.1, 7.2, 0xc4b5d4, 0.15);
            mkBuilding(57.0, -117.0, 26.0, 8.6, 9.8, 0xc4b5d4, 0.15);
            mkBuilding(53.0, -103.0, 18.0, 7.7, 8.2, 0xc4b5d4, 0.15);
            mkBuilding(57.0, -90.0, 16.0, 8.4, 9.8, 0xc4b5d4, 0.15);
            mkBuilding(65.0, -173.0, 22.0, 8.9, 8.7, 0xc4b5d4, 0.15);
            mkBuilding(65.0, -160.0, 24.0, 7.6, 7.8, 0xc4b5d4, 0.15);
            mkBuilding(67.0, -147.0, 14.0, 8.1, 7.5, 0xc4b5d4, 0.15);
            mkBuilding(71.0, -130.0, 16.0, 8.8, 10.0, 0xc4b5d4, 0.15);
            mkBuilding(80.0, -168.0, 10.0, 9.8, 7.4, 0xc4b5d4, 0.16);
            mkBuilding(78.0, -160.0, 24.0, 7.5, 7.8, 0xc4b5d4, 0.16);
            mkBuilding(83.0, -116.0, 16.0, 8.5, 7.8, 0xc4b5d4, 0.16);
            mkBuilding(94.0, -167.0, 16.0, 7.1, 8.0, 0xc4b5d4, 0.16);
            mkBuilding(92.0, -155.0, 16.0, 7.5, 8.3, 0xc4b5d4, 0.16);
            mkBuilding(91.0, -121.0, 12.0, 8.6, 9.5, 0xc4b5d4, 0.16);
            mkBuilding(105.0, -173.0, 16.0, 8.1, 9.8, 0xc4b5d4, 0.16);
            mkBuilding(110.0, -160.0, 18.0, 7.6, 7.7, 0xc4b5d4, 0.17);
            mkBuilding(104.0, -145.0, 24.0, 9.7, 8.2, 0xc4b5d4, 0.16);
            mkBuilding(108.0, -129.0, 12.0, 9.8, 7.7, 0xc4b5d4, 0.16);
            mkBuilding(105.0, -115.0, 12.0, 9.6, 7.1, 0xc4b5d4, 0.16);
            mkBuilding(109.0, -106.0, 20.0, 9.4, 9.6, 0xc4b5d4, 0.16);
            mkBuilding(119.0, -172.0, 10.0, 8.1, 7.1, 0xc4b5d4, 0.17);
            mkBuilding(120.0, -159.0, 14.0, 9.4, 8.4, 0xc4b5d4, 0.17);
            mkBuilding(119.0, -141.0, 14.0, 7.7, 9.0, 0xc4b5d4, 0.17);
            mkBuilding(120.0, -132.0, 16.0, 9.6, 9.9, 0xc4b5d4, 0.17);
            mkBuilding(119.0, -119.0, 24.0, 8.2, 9.9, 0xc4b5d4, 0.17);
            mkBuilding(121.0, -106.0, 8.0, 7.3, 9.9, 0xc4b5d4, 0.17);
            mkBuilding(132.0, -173.0, 10.0, 8.8, 8.0, 0xc4b5d4, 0.17);
            mkBuilding(136.0, -158.0, 20.0, 8.8, 8.5, 0xc4b5d4, 0.17);
            mkBuilding(133.0, -143.0, 14.0, 7.8, 9.1, 0xc4b5d4, 0.17);
            mkBuilding(130.0, -130.0, 24.0, 9.1, 9.8, 0xc4b5d4, 0.17);
            mkBuilding(135.0, -116.0, 14.0, 8.1, 7.2, 0xc4b5d4, 0.17);
            mkBuilding(135.0, -106.0, 26.0, 7.9, 9.5, 0xc4b5d4, 0.17);
            mkBuilding(135.0, -93.0, 24.0, 7.9, 8.2, 0xc4b5d4, 0.17);
            mkBuilding(146.0, -168.0, 16.0, 8.7, 7.6, 0xc4b5d4, 0.18);
            mkBuilding(148.0, -157.0, 12.0, 8.8, 7.9, 0xc4b5d4, 0.18);
            mkBuilding(147.0, -141.0, 8.0, 7.9, 7.6, 0xc4b5d4, 0.18);
            mkBuilding(149.0, -130.0, 26.0, 9.0, 8.4, 0xc4b5d4, 0.18);
            mkBuilding(146.0, -116.0, 14.0, 8.5, 9.4, 0xc4b5d4, 0.18);
            mkBuilding(149.0, -103.0, 12.0, 9.0, 7.9, 0xc4b5d4, 0.18);
            mkBuilding(148.0, -90.0, 26.0, 8.0, 9.5, 0xc4b5d4, 0.18);
            mkBuilding(162.0, -172.0, 16.0, 7.7, 7.6, 0xc4b5d4, 0.18);
            mkBuilding(156.0, -160.0, 14.0, 10.0, 8.8, 0xc4b5d4, 0.18);
            mkBuilding(162.0, -147.0, 22.0, 8.2, 8.9, 0xc4b5d4, 0.18);
            mkBuilding(157.0, -129.0, 20.0, 8.5, 7.7, 0xc4b5d4, 0.18);
            mkBuilding(161.0, -116.0, 8.0, 9.7, 9.6, 0xc4b5d4, 0.18);
            mkBuilding(156.0, -102.0, 20.0, 7.7, 9.4, 0xc4b5d4, 0.18);
            mkBuilding(161.0, -91.0, 22.0, 7.2, 7.7, 0xc4b5d4, 0.18);
            mkBuilding(175.0, -173.0, 22.0, 7.4, 8.4, 0xc4b5d4, 0.18);
            mkBuilding(173.0, -156.0, 26.0, 8.0, 9.3, 0xc4b5d4, 0.18);
            mkBuilding(172.0, -143.0, 24.0, 8.3, 9.7, 0xc4b5d4, 0.18);
            mkBuilding(172.0, -133.0, 22.0, 8.4, 9.3, 0xc4b5d4, 0.18);
            mkBuilding(175.0, -116.0, 16.0, 9.3, 8.6, 0xc4b5d4, 0.18);
            mkBuilding(174.0, -107.0, 16.0, 8.3, 9.1, 0xc4b5d4, 0.18);
            mkBuilding(170.0, -93.0, 18.0, 8.0, 8.6, 0xc4b5d4, 0.18);
            mkBuilding(183.0, -172.0, 14.0, 8.1, 7.5, 0xc4b5d4, 0.19);
            mkBuilding(183.0, -160.0, 20.0, 8.2, 8.6, 0xc4b5d4, 0.19);
            mkBuilding(185.0, -147.0, 14.0, 9.5, 8.2, 0xc4b5d4, 0.19);
            mkBuilding(188.0, -130.0, 8.0, 9.6, 9.3, 0xc4b5d4, 0.19);
            mkBuilding(185.0, -118.0, 8.0, 9.8, 7.9, 0xc4b5d4, 0.19);
            mkBuilding(185.0, -102.0, 20.0, 8.6, 9.2, 0xc4b5d4, 0.19);
            mkBuilding(188.0, -91.0, 14.0, 8.5, 7.8, 0xc4b5d4, 0.19);
            mkBuilding(198.0, -173.0, 20.0, 8.0, 9.0, 0xc4b5d4, 0.19);
            mkBuilding(198.0, -155.0, 12.0, 9.5, 9.8, 0xc4b5d4, 0.19);
            mkBuilding(199.0, -143.0, 8.0, 9.7, 8.8, 0xc4b5d4, 0.19);
            mkBuilding(200.0, -134.0, 10.0, 8.9, 7.4, 0xc4b5d4, 0.19);
            mkBuilding(198.0, -120.0, 8.0, 7.8, 8.0, 0xc4b5d4, 0.19);
            mkBuilding(198.0, -106.0, 18.0, 9.3, 8.1, 0xc4b5d4, 0.19);
            mkBuilding(211.0, -171.0, 10.0, 8.4, 9.2, 0xc4b5d4, 0.2);
            mkBuilding(208.0, -158.0, 14.0, 9.0, 9.3, 0xc4b5d4, 0.19);
            mkBuilding(213.0, -147.0, 8.0, 9.8, 7.6, 0xc4b5d4, 0.2);
            mkBuilding(208.0, -130.0, 12.0, 7.7, 8.4, 0xc4b5d4, 0.19);
            mkBuilding(208.0, -117.0, 14.0, 8.4, 7.8, 0xc4b5d4, 0.19);
            mkBuilding(210.0, -107.0, 26.0, 8.8, 9.2, 0xc4b5d4, 0.2);
            mkBuilding(208.0, -89.0, 12.0, 9.9, 7.3, 0xc4b5d4, 0.19);
            mkBuilding(56.0, -88.0, 22.0, 10.0, 9.9, 0xc4b5d4, 0.13);
            mkBuilding(62.0, -86.0, 12.0, 9.8, 9.7, 0xc4b5d4, 0.13);
            mkBuilding(59.0, -82.0, 25.0, 10.3, 9.7, 0xc4b5d4, 0.13);
            mkBuilding(57.0, -73.0, 12.0, 9.0, 8.9, 0xc4b5d4, 0.13);
            mkBuilding(61.0, -72.0, 22.0, 9.9, 8.0, 0xc4b5d4, 0.13);
            mkBuilding(62.0, -65.0, 12.0, 9.3, 8.7, 0xc4b5d4, 0.13);
            mkBuilding(82.0, -80.0, 22.0, 10.4, 9.1, 0xc4b5d4, 0.14);
            mkBuilding(81.0, -74.0, 20.0, 10.5, 9.2, 0xc4b5d4, 0.14);
            mkBuilding(79.0, -71.0, 12.0, 8.8, 8.9, 0xc4b5d4, 0.14);
            mkBuilding(81.0, -64.0, 22.0, 10.0, 8.7, 0xc4b5d4, 0.14);
            mkBuilding(96.0, -68.0, 25.0, 10.6, 9.1, 0xc4b5d4, 0.14);
            mkBuilding(100.0, -67.0, 12.0, 8.7, 8.8, 0xc4b5d4, 0.14);
            mkBuilding(113.0, -69.0, 25.0, 8.7, 9.3, 0xc4b5d4, 0.15);
            mkBuilding(115.0, -65.0, 22.0, 9.6, 8.9, 0xc4b5d4, 0.15);
            mkBuilding(136.0, -88.0, 18.0, 10.1, 8.5, 0xc4b5d4, 0.15);
            mkBuilding(132.0, -86.0, 12.0, 10.2, 8.6, 0xc4b5d4, 0.15);
            mkBuilding(136.0, -81.0, 15.0, 8.6, 9.0, 0xc4b5d4, 0.15);
            mkBuilding(136.0, -73.0, 18.0, 10.9, 9.7, 0xc4b5d4, 0.15);
            mkBuilding(132.0, -71.0, 18.0, 8.5, 8.0, 0xc4b5d4, 0.15);
            mkBuilding(136.0, -67.0, 18.0, 8.1, 8.1, 0xc4b5d4, 0.15);
            mkBuilding(150.0, -89.0, 25.0, 10.6, 9.0, 0xc4b5d4, 0.16);
            mkBuilding(146.0, -83.0, 18.0, 9.4, 8.9, 0xc4b5d4, 0.16);
            mkBuilding(148.0, -82.0, 18.0, 10.8, 9.0, 0xc4b5d4, 0.16);
            mkBuilding(147.0, -74.0, 20.0, 8.2, 9.3, 0xc4b5d4, 0.16);
            mkBuilding(146.0, -71.0, 15.0, 10.4, 9.9, 0xc4b5d4, 0.16);
            mkBuilding(165.0, -86.0, 20.0, 9.8, 9.6, 0xc4b5d4, 0.16);
            mkBuilding(167.0, -83.0, 20.0, 9.4, 8.9, 0xc4b5d4, 0.16);
            mkBuilding(170.0, -80.0, 22.0, 9.9, 9.2, 0xc4b5d4, 0.16);
            mkBuilding(165.0, -76.0, 25.0, 8.6, 9.3, 0xc4b5d4, 0.16);
            mkBuilding(166.0, -71.0, 15.0, 9.7, 8.3, 0xc4b5d4, 0.16);
            mkBuilding(170.0, -65.0, 25.0, 9.8, 8.6, 0xc4b5d4, 0.16);
            mkBuilding(185.0, -88.0, 25.0, 8.8, 9.7, 0xc4b5d4, 0.17);
            mkBuilding(183.0, -86.0, 18.0, 10.4, 9.3, 0xc4b5d4, 0.17);
            mkBuilding(185.0, -79.0, 12.0, 9.6, 9.3, 0xc4b5d4, 0.17);
            mkBuilding(186.0, -76.0, 12.0, 8.2, 9.6, 0xc4b5d4, 0.17);
            mkBuilding(186.0, -69.0, 12.0, 9.4, 8.6, 0xc4b5d4, 0.17);
            mkBuilding(188.0, -66.0, 22.0, 9.6, 8.9, 0xc4b5d4, 0.17);
            mkBuilding(-84.0, -138.0, 22.0, 9.0, 8.8, 0xc4b5d4, 0.06);
            mkBuilding(-83.0, -121.0, 22.0, 10.5, 9.7, 0xc4b5d4, 0.06);
            mkBuilding(-84.0, -100.0, 20.0, 8.1, 10.3, 0xc4b5d4, 0.06);
            mkBuilding(-77.0, -76.0, 22.0, 9.3, 8.8, 0xc4b5d4, 0.06);
            mkBuilding(-78.0, -57.0, 12.0, 9.4, 9.2, 0xc4b5d4, 0.06);
            mkBuilding(-79.0, -43.0, 24.0, 8.5, 9.2, 0xc4b5d4, 0.06);
            mkBuilding(-57.0, -140.0, 22.0, 10.8, 10.4, 0xc4b5d4, 0.07);
            mkBuilding(-56.0, -124.0, 18.0, 8.3, 8.8, 0xc4b5d4, 0.07);
            mkBuilding(-63.0, -98.0, 24.0, 9.5, 11.0, 0xc4b5d4, 0.07);
            mkBuilding(-56.0, -77.0, 18.0, 8.2, 9.6, 0xc4b5d4, 0.07);
            mkBuilding(-57.0, -57.0, 24.0, 8.2, 8.8, 0xc4b5d4, 0.07);
            mkBuilding(-62.0, -40.0, 18.0, 10.6, 9.5, 0xc4b5d4, 0.07);
            mkBuilding(-44.0, -141.0, 22.0, 8.5, 9.7, 0xc4b5d4, 0.07);
            mkBuilding(-36.0, -118.0, 12.0, 8.7, 10.5, 0xc4b5d4, 0.07);
            mkBuilding(-43.0, -97.0, 12.0, 9.9, 8.5, 0xc4b5d4, 0.07);
            mkBuilding(-40.0, -76.0, 22.0, 8.8, 10.5, 0xc4b5d4, 0.07);
            mkBuilding(-37.0, -61.0, 18.0, 9.7, 9.2, 0xc4b5d4, 0.07);
            mkBuilding(-36.0, -42.0, 24.0, 8.2, 10.3, 0xc4b5d4, 0.07);
            mkBuilding(-18.0, -139.0, 24.0, 9.5, 10.5, 0xc4b5d4, 0.08);
            mkBuilding(-20.0, -120.0, 24.0, 9.8, 11.0, 0xc4b5d4, 0.08);
            mkBuilding(-17.0, -102.0, 18.0, 9.6, 9.0, 0xc4b5d4, 0.08);
            mkBuilding(-16.0, -76.0, 18.0, 9.4, 9.0, 0xc4b5d4, 0.08);
            mkBuilding(-21.0, -61.0, 20.0, 9.1, 10.6, 0xc4b5d4, 0.08);
            mkBuilding(-18.0, -44.0, 16.0, 10.2, 10.1, 0xc4b5d4, 0.08);
            mkBuilding(2.0, -138.0, 22.0, 10.4, 10.0, 0xc4b5d4, 0.08);
            mkBuilding(-2.0, -117.0, 12.0, 8.4, 10.9, 0xc4b5d4, 0.08);
            mkBuilding(1.0, -103.0, 24.0, 10.5, 8.3, 0xc4b5d4, 0.08);
            mkBuilding(3.0, -84.0, 22.0, 8.4, 10.6, 0xc4b5d4, 0.08);
            mkBuilding(-2.0, -63.0, 18.0, 10.3, 8.8, 0xc4b5d4, 0.08);
            mkBuilding(2.0, -43.0, 24.0, 9.0, 10.0, 0xc4b5d4, 0.08);
            mkBuilding(24.0, -138.0, 16.0, 9.9, 10.7, 0xc4b5d4, 0.08);
            mkBuilding(23.0, -116.0, 12.0, 9.9, 8.7, 0xc4b5d4, 0.08);
            mkBuilding(20.0, -101.0, 22.0, 8.3, 10.9, 0xc4b5d4, 0.08);
            mkBuilding(17.0, -77.0, 14.0, 10.1, 10.7, 0xc4b5d4, 0.08);
            mkBuilding(16.0, -59.0, 24.0, 8.2, 9.1, 0xc4b5d4, 0.08);
            mkBuilding(22.0, -42.0, 14.0, 9.6, 9.7, 0xc4b5d4, 0.08);
            mkBuilding(38.0, -142.0, 14.0, 8.2, 10.6, 0xc4b5d4, 0.09);
            mkBuilding(39.0, -117.0, 20.0, 8.4, 9.4, 0xc4b5d4, 0.09);
            mkBuilding(40.0, -97.0, 16.0, 10.0, 10.7, 0xc4b5d4, 0.09);
            mkBuilding(43.0, -80.0, 22.0, 9.6, 8.2, 0xc4b5d4, 0.09);
            mkBuilding(41.0, -60.0, 22.0, 10.9, 10.1, 0xc4b5d4, 0.09);
            mkBuilding(43.0, -40.0, 14.0, 11.0, 10.6, 0xc4b5d4, 0.09);


            /* ── VEGETACIÓN ── */
            function mkTree(x, z, h, op) {
                // Copa (cono irregular)
                const cGeo  = new THREE.ConeGeometry(h * 0.42, h * 0.78, 5, 3);
                const cMesh = new THREE.Mesh(cGeo, new THREE.MeshBasicMaterial({
                    color: 0xc4b5d4, wireframe: true, transparent: true, opacity: op
                }));
                cMesh.position.set(x, h * 0.64, z);
                scene.add(cMesh);
                // Tronco
                const tGeo  = new THREE.CylinderGeometry(0.25, 0.45, h * 0.28, 4);
                const tMesh = new THREE.Mesh(tGeo, new THREE.MeshBasicMaterial({
                    color: 0xc4b5d4, wireframe: true, transparent: true, opacity: op * 0.55
                }));
                tMesh.position.set(x, h * 0.14, z);
                scene.add(tMesh);
            }
            mkTree(-96.8,-68.2,6.1,0.28);
            mkTree(-104.0,41.7,4.7,0.28);
            mkTree(-159.7,-35.2,7.9,0.26);
            mkTree(-110.8,-34.5,5.8,0.28);
            mkTree(-121.9,-79.8,6.2,0.28);
            mkTree(-101.4,0.7,4.8,0.28);
            mkTree(-131.0,-19.5,8.1,0.27);
            mkTree(-102.1,-60.8,7.7,0.28);
            mkTree(-92.8,43.0,6.8,0.28);
            mkTree(-124.5,33.1,7.6,0.27);
            mkTree(-134.7,28.2,5.3,0.27);
            mkTree(-169.2,-8.8,7.7,0.26);
            mkTree(-131.0,-26.2,7.6,0.27);
            mkTree(-156.7,12.5,7.1,0.26);
            mkTree(-176.7,40.2,6.4,0.25);
            mkTree(-176.9,-29.4,4.6,0.26);
            mkTree(-188.0,-55.5,7.8,0.26);
            mkTree(-208.8,8.8,5.2,0.25);
            mkTree(-133.8,-27.2,4.8,0.27);
            mkTree(-149.4,-2.6,5.8,0.27);
            mkTree(-114.6,-68.1,7.0,0.28);
            mkTree(-91.7,-32.5,5.4,0.28);
            mkTree(-159.2,17.7,8.1,0.26);
            mkTree(-173.0,53.9,8.4,0.25);
            mkTree(-171.9,-48.5,6.4,0.26);
            mkTree(-113.1,53.9,6.3,0.27);
            mkTree(-187.7,-74.0,5.0,0.26);
            mkTree(-115.1,-45.4,5.9,0.28);
            mkTree(-125.4,-21.4,6.2,0.27);
            mkTree(-104.1,-71.5,5.9,0.28);
            mkTree(-101.5,-21.5,4.5,0.28);
            mkTree(-159.7,-70.1,7.3,0.26);
            mkTree(-142.5,53.0,5.6,0.26);
            mkTree(-151.4,21.4,5.8,0.26);
            mkTree(-135.3,6.3,8.4,0.27);
            mkTree(-204.9,-23.4,7.4,0.25);
            mkTree(-178.3,-29.8,5.4,0.26);
            mkTree(-100.2,38.7,4.7,0.28);
            mkTree(-157.4,-7.4,5.1,0.26);
            mkTree(-175.3,43.6,7.6,0.25);
            mkTree(-140.6,-62.9,8.4,0.27);
            mkTree(-157.2,5.0,7.7,0.26);
            mkTree(-140.2,-71.6,5.0,0.27);
            mkTree(-176.9,-32.8,8.0,0.26);
            mkTree(-186.2,52.4,7.2,0.25);
            mkTree(-129.5,26.8,4.6,0.27);
            mkTree(-157.8,37.6,6.6,0.26);
            mkTree(-107.9,-12.5,6.7,0.28);
            mkTree(-138.0,40.6,5.9,0.27);
            mkTree(-125.3,-11.6,5.3,0.27);
            mkTree(-131.9,-26.2,8.3,0.27);
            mkTree(-100.4,-53.4,5.3,0.28);
            mkTree(-219.4,40.3,5.3,0.24);
            mkTree(-163.4,-68.5,5.8,0.26);
            mkTree(-134.3,-7.4,8.2,0.27);
            mkTree(-195.2,-7.9,7.6,0.25);
            mkTree(-152.9,18.6,7.6,0.26);
            mkTree(-123.4,32.4,6.8,0.27);
            mkTree(-153.2,-26.6,5.4,0.27);
            mkTree(-155.2,-63.0,7.0,0.27);
            mkTree(-206.8,26.7,6.9,0.25);
            mkTree(-154.3,13.9,5.0,0.26);
            mkTree(-96.8,36.3,5.9,0.28);
            mkTree(-177.0,-23.2,5.9,0.26);
            mkTree(-190.1,-33.7,7.5,0.25);
            mkTree(-196.7,-55.6,8.4,0.25);
            mkTree(-98.1,-24.0,6.5,0.28);
            mkTree(-197.8,-56.4,6.7,0.25);
            mkTree(-137.9,44.4,5.0,0.27);
            mkTree(-124.5,30.7,5.8,0.27);
            mkTree(-212.7,-73.0,6.1,0.25);
            mkTree(-104.0,-2.6,8.4,0.28);
            mkTree(-132.2,7.3,5.6,0.27);
            mkTree(-147.1,-2.8,5.5,0.27);
            mkTree(-179.8,-12.4,8.1,0.26);
            mkTree(-125.8,48.9,5.2,0.27);
            mkTree(-92.6,9.1,7.4,0.28);
            mkTree(-152.1,-74.2,8.5,0.27);
            mkTree(-108.4,37.5,8.1,0.27);
            mkTree(-118.7,36.6,6.4,0.27);
            mkTree(-206.9,39.8,7.6,0.25);
            mkTree(-127.5,-1.7,8.4,0.27);
            mkTree(-131.7,-27.8,7.3,0.27);
            mkTree(-98.1,-45.8,5.2,0.28);
            mkTree(-144.1,-22.6,6.9,0.27);
            mkTree(-154.6,-57.8,4.7,0.27);
            mkTree(-158.2,23.1,8.2,0.26);
            mkTree(-199.2,-39.1,8.0,0.25);
            mkTree(-150.8,-41.9,4.9,0.27);
            mkTree(-147.6,-6.4,5.6,0.27);
            mkTree(215,-77.9,5.4,0.28);
            mkTree(193,-78.3,5.3,0.28);
            mkTree(171,-77.3,5.0,0.28);
            mkTree(149,-78.2,4.4,0.28);
            mkTree(127,-76.2,4.1,0.28);
            mkTree(105,-77.4,4.2,0.28);
            mkTree(83,-77.9,3.5,0.28);
            mkTree(61,-77.8,3.1,0.28);
            mkTree(39,-75.8,3.2,0.27);
            mkTree(17,-75.7,3.0,0.27);
            mkTree(-5,-76.5,4.4,0.27);
            mkTree(-27,-78.4,5.4,0.26);
            mkTree(-49,-76.3,5.2,0.26);
            mkTree(-71,-77.2,3.7,0.26);
            mkTree(-93,-77.9,3.3,0.25);
            mkTree(-115,-76.5,5.1,0.25);
            mkTree(-137,-77.9,3.1,0.25);
            mkTree(-159,-77.4,3.4,0.24);
            mkTree(-181,-77.8,3.6,0.24);
            mkTree(172.9,-28.9,4.9,0.3);
            mkTree(142.9,-8.6,4.7,0.3);
            mkTree(104.7,-39.8,5.3,0.28);
            mkTree(200.4,-40.3,4.7,0.3);
            mkTree(194.8,-24.6,3.5,0.3);
            mkTree(157.3,-34.3,4.0,0.3);
            mkTree(203.0,-41.1,5.6,0.3);
            mkTree(182.8,-23.1,4.3,0.3);
            mkTree(109.1,-20.3,5.9,0.28);
            mkTree(119.8,-40.3,4.7,0.29);
            mkTree(193.6,-44.8,5.5,0.3);
            mkTree(109.5,-43.8,3.9,0.29);
            mkTree(150.3,-10.3,5.2,0.3);
            mkTree(106.6,-39.4,4.7,0.28);
            mkTree(109.9,-20.3,4.4,0.29);
            mkTree(205.2,-14.7,5.5,0.3);
            mkTree(125.9,-29.0,5.2,0.29);
            mkTree(109.8,-44.6,4.3,0.29);
            mkTree(144.1,-15.9,5.5,0.3);
            mkTree(106.4,-42.6,5.8,0.28);
            mkTree(131.7,-40.4,5.5,0.29);
            mkTree(186.3,-22.6,5.4,0.3);
            mkTree(194.6,-13.4,4.2,0.3);
            mkTree(146.3,-8.6,4.4,0.3);
            mkTree(168.9,-13.7,5.7,0.3);
            mkTree(166.3,-32.1,5.2,0.3);
            mkTree(100.4,-32.0,5.4,0.28);
            mkTree(171.1,-42.0,5.3,0.3);
            mkTree(167.1,-28.5,3.8,0.3);
            mkTree(165.6,-17.4,4.0,0.3);
            mkTree(169.8,-42.4,4.0,0.3);
            mkTree(139.4,-16.2,4.2,0.29);
            mkTree(197.9,-8.6,3.9,0.3);
            mkTree(102.9,-18.0,5.4,0.28);
            mkTree(199.1,-20.1,5.5,0.3);
            mkTree(123.9,-107.1,5.0,0.2);
            mkTree(152.6,-118.9,4.8,0.2);
            mkTree(88.8,-104.0,3.5,0.19);
            mkTree(95.6,-128.8,4.2,0.19);
            mkTree(142.3,-138.8,3.2,0.2);
            mkTree(144.2,-168.3,3.7,0.2);
            mkTree(175.9,-144.7,4.5,0.2);
            mkTree(159.0,-130.8,3.5,0.2);
            mkTree(91.2,-107.9,3.2,0.19);
            mkTree(172.1,-158.6,4.6,0.2);
            mkTree(186.2,-125.1,4.3,0.2);
            mkTree(178.4,-109.3,3.0,0.2);
            mkTree(105.2,-164.1,4.6,0.2);
            mkTree(95.6,-159.3,3.3,0.19);
            mkTree(112.0,-111.8,4.8,0.2);
            mkTree(179.4,-104.5,3.0,0.2);
            mkTree(174.9,-127.6,4.1,0.2);
            mkTree(156.6,-138.1,3.4,0.2);
            mkTree(117.2,-141.8,4.6,0.2);
            mkTree(120.6,-101.6,3.3,0.2);

            /* ── PISO URBANO ── */
            // Grid fino: celdas 5u=20m (texturas de calles)
            const gridFino = new THREE.GridHelper(3000, 600, 0xc4b5d4, 0xc4b5d4);
            gridFino.material.transparent = true;
            gridFino.material.opacity = 0.05;
            gridFino.position.set(0, 0, -85);
            scene.add(gridFino);

            // Grid grueso: celdas 50u=200m (supermanzanas)
            const gridGrueso = new THREE.GridHelper(3000, 60, 0xc4b5d4, 0xc4b5d4);
            gridGrueso.material.transparent = true;
            gridGrueso.material.opacity = 0.13;
            gridGrueso.position.set(0, 0.1, -85);
            scene.add(gridGrueso);

            /* Camellon central de Reforma — corre hacia el oeste (eje x)
               El drone vuela encima; se ve como banda ambar que se pierde al fondo */
            const camGeo = new THREE.PlaneGeometry(1800, 5, 360, 1);
            camGeo.rotateX(-Math.PI / 2);
            const camMesh = new THREE.Mesh(camGeo, new THREE.MeshBasicMaterial({
                color: 0xc4b5d4, wireframe: true, transparent: true, opacity: 0.14
            }));
            camMesh.position.set(-700, 0.4, -77); // z=-77 = centro camellon
            scene.add(camMesh);

            // Carriles de Reforma — 8 carriles E-O
            [-12, -9, -6, -3, 3, 6, 9, 12].forEach(dz => {
                const pts = [
                    new THREE.Vector3(230,  0.2, -77 + dz),
                    new THREE.Vector3(-800, 0.2, -77 + dz)
                ];
                const lg = new THREE.BufferGeometry().setFromPoints(pts);
                scene.add(new THREE.Line(lg, new THREE.LineBasicMaterial({
                    color: 0xc4b5d4, transparent: true, opacity: 0.045
                })));
            });

            /* Glorieta Diana — en (0, 0.3, 0), radio 22u = 88m, amber */
            const glorieta = new THREE.Mesh(
                new THREE.TorusGeometry(22, 0.5, 8, 80),
                new THREE.MeshBasicMaterial({ color: 0xc4b5d4, transparent: true, opacity: 0.32 })
            );
            glorieta.rotation.x = Math.PI / 2;
            glorieta.position.set(0, 0.3, 0);
            scene.add(glorieta);

            // Pedestal Diana Cazadora
            const fuenteM = new THREE.LineSegments(
                new THREE.EdgesGeometry(new THREE.CylinderGeometry(2.5, 3.5, 4.5, 10, 2, true)),
                new THREE.LineBasicMaterial({ color: 0xc4b5d4, transparent: true, opacity: 0.30 })
            );
            fuenteM.position.set(0, 2.25, 0);
            scene.add(fuenteM);

            /* Mouse parallax */
            let mx = 0, my = 0;
            let cX = 226.1, cY = 22.0;
            document.addEventListener('mousemove', e => {
                mx = (e.clientX / window.innerWidth  - 0.5) * 2;
                my = (e.clientY / window.innerHeight - 0.5) * 2;
            });

            /* Scroll parallax — la cámara se acerca suavemente al bajar la página */
            let scrollPct = 0;
            window.addEventListener('scroll', function() {
                const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
                scrollPct = maxScroll > 0 ? Math.min(1, window.scrollY / maxScroll) : 0;
            }, { passive: true });

            /* Animación: flotado suave + acercamiento por scroll (sin conflicto) */
            let time = 0;
            function animate() {
                requestAnimationFrame(animate);
                time += 0.007;

                // Flotado ambiental — movimiento sinusoidal muy sutil, sin alejarse
                const floatX = Math.sin(time * 0.6) * 4;
                const floatZ = Math.sin(time * 0.4) * 2.5;
                const floatY = Math.sin(time * 0.5) * 1.2;

                // Scroll: acercamiento hacia la ciudad (mismo sentido que el flotado)
                const sX = scrollPct * 60;
                const sY = scrollPct * 7;
                const sZ = scrollPct * 10;

                cX = lerp(cX, 226.1 + floatX + mx * 5.0 - sX, 0.022);
                cY = lerp(cY, 22.0  + floatY + my * 2.5 - sY, 0.022);

                camera.position.set(cX, cY, -72.5 + floatZ - mx * 2.0 + sZ);
                camera.lookAt(92.7 + mx * 2.5 - sX * 0.3, 10.0 - sY * 0.4, -92.9);

                renderer.render(scene, camera);
            }
            animate();

            window.addEventListener('resize', () => {
                renderer.setSize(window.innerWidth, window.innerHeight);
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
            });
        })();
