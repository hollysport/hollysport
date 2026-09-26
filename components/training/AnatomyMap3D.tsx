"use client";

import { Component, ReactNode, Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import {
    ContactShadows,
    Html,
    Loader,
    OrbitControls,
    useGLTF,
} from "@react-three/drei";

import type { MuscleGroup } from "@/lib/data/exercises";
import { MUSCLE_GROUPS } from "@/lib/data/exercises";

export type Gender = "male" | "female";

type AnatomyMap3DProps = {
    gender: Gender;
    selected: MuscleGroup[];
    onToggle: (muscle: MuscleGroup) => void;
};

/*
 * "Görünmez Zırh (Hitbox)" mimarisi:
 * Kullanıcı yekpare .glb modeli görür; tıklamaları modele
 * bindirilmiş görünmez kutular (material.visible=false) yakalar.
 * Seçilen bölgeler modelin üzerinde <Html> neon etiketlerle işaretlenir;
 * model materyaline hiç dokunulmaz.
 */

type Hitbox = {
    muscle: MuscleGroup;
    position: [number, number, number];
    size: [number, number, number];
};

/*
 * Not: Hitbox boyut/pozisyonları A-Pose modeline göre kalibre edilirken
 * sabittir; modelin ölçek/hizalaması Leva panelinden canlı ayarlanır.
 */

const HITBOXES: Hitbox[] = [
    { muscle: "gogus", position: [0, 1.3, 0.1], size: [0.4, 0.25, 0.2] },
    { muscle: "karin", position: [0, 1.0, 0.1], size: [0.3, 0.3, 0.2] },
    { muscle: "sirt", position: [0, 1.25, -0.1], size: [0.45, 0.4, 0.2] },
    { muscle: "omuz", position: [-0.25, 1.4, 0], size: [0.2, 0.15, 0.2] },
    { muscle: "omuz", position: [0.25, 1.4, 0], size: [0.2, 0.15, 0.2] },
    { muscle: "on_kol", position: [-0.3, 1.15, 0], size: [0.15, 0.3, 0.15] },
    { muscle: "on_kol", position: [0.3, 1.15, 0], size: [0.15, 0.3, 0.15] },
    { muscle: "arka_kol", position: [-0.3, 1.15, -0.05], size: [0.15, 0.3, 0.15] },
    { muscle: "arka_kol", position: [0.3, 1.15, -0.05], size: [0.15, 0.3, 0.15] },
    { muscle: "kalca", position: [0, 0.85, -0.15], size: [0.4, 0.25, 0.2] },
    { muscle: "on_bacak", position: [-0.15, 0.6, 0.05], size: [0.2, 0.4, 0.2] },
    { muscle: "on_bacak", position: [0.15, 0.6, 0.05], size: [0.2, 0.4, 0.2] },
    { muscle: "arka_bacak", position: [-0.15, 0.6, -0.05], size: [0.2, 0.4, 0.2] },
    { muscle: "arka_bacak", position: [0.15, 0.6, -0.05], size: [0.2, 0.4, 0.2] },
];

/* Aktif bölge etiketlerinin (Html) tutturulacağı noktalar — bölge başına tek,
   kutuların üzerine binmemesi için hitbox üst sınırının 0.1–0.2 üzerinde */
const LABEL_ANCHORS: Partial<
    Record<MuscleGroup, [number, number, number]>
> = {
    gogus: [0, 1.6, 0.2],
    sirt: [0, 1.65, -0.2],
    omuz: [0.38, 1.6, 0],
    on_kol: [0.46, 1.4, 0.1],
    arka_kol: [0.46, 1.4, -0.1],
    karin: [0, 1.3, 0.2],
    kalca: [0, 1.0, -0.15],
    on_bacak: [0.25, 0.95, 0.15],
    arka_bacak: [0.25, 0.95, -0.15],
};

function AnatomyModel({ gender }: { gender: Gender }) {
    const { scene } = useGLTF(
        gender === "male"
            ? "/models/male_anatomy.glb"
            : "/models/female_anatomy.glb",
    );

    // Model yekpare sergilenir; materyaline dokunulmaz.
    // Ölçek/hizalama kullanıcı kalibrasyonuyla kilitlendi (Leva paneli kaldırıldı).
    return (
        <primitive
            object={scene}
            scale={0.13}
            position={[0, 0.85, 0]}
        />
    );
}

useGLTF.preload("/models/male_anatomy.glb");
useGLTF.preload("/models/female_anatomy.glb");

function HitboxMesh({
    hitbox,
    onToggle,
    onHover,
}: {
    hitbox: Hitbox;
    onToggle: (muscle: MuscleGroup) => void;
    onHover: (muscle: MuscleGroup | null) => void;
}) {
    function handleClick(event: ThreeEvent<MouseEvent>) {
        event.stopPropagation();
        onToggle(hitbox.muscle);
    }

    function handleOver(event: ThreeEvent<PointerEvent>) {
        event.stopPropagation();
        document.body.style.cursor = "pointer";
        onHover(hitbox.muscle);
    }

    function handleOut() {
        document.body.style.cursor = "";
        onHover(null);
    }

    return (
        <mesh
            position={hitbox.position}
            onClick={handleClick}
            onPointerOver={handleOver}
            onPointerOut={handleOut}
        >
            <boxGeometry args={hitbox.size} />
            {/* Sadece raycaster için var; görünmez */}
            <meshBasicMaterial visible={false} />
        </mesh>
    );
}

function ErrorFallback() {
    return (
        <Html center>
            <div className="whitespace-nowrap rounded-full border border-red-500/30 bg-[#0a0a0a]/90 px-5 py-2.5 text-sm font-medium text-red-300">
                3D model yüklenemedi.
            </div>
        </Html>
    );
}

class ModelErrorBoundary extends Component<
    { children: ReactNode },
    { hasError: boolean }
> {
    state = { hasError: false };

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    render() {
        return this.state.hasError ? (
            <ErrorFallback />
        ) : (
            this.props.children
        );
    }
}

export default function AnatomyMap3D({
    gender,
    selected,
    onToggle,
}: AnatomyMap3DProps) {
    const [hovered, setHovered] = useState<MuscleGroup | null>(null);

    const hoveredLabel = hovered
        ? (MUSCLE_GROUPS.find((group) => group.key === hovered)?.label ??
          null)
        : null;

    const activeMuscles = MUSCLE_GROUPS.filter((group) =>
        selected.includes(group.key),
    );

    return (
        <div>
            <div className="mb-4 flex items-center justify-between gap-4">
                <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#27D66B]">
                    3D Vücut Haritası
                </span>

                <span className="text-xs text-white/40">
                    Döndürmek için sürükle
                </span>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0a]">
                <Canvas
                    camera={{ position: [0, 1.05, 3.1], fov: 42 }}
                    style={{ height: "420px", touchAction: "none" }}
                    dpr={[1, 2]}
                >
                    <ambientLight intensity={0.65} />
                    <directionalLight
                        position={[3, 4, 2.5]}
                        intensity={1.1}
                    />
                    <pointLight
                        position={[-2.5, 2, -3]}
                        intensity={12}
                        color="#27D66B"
                    />

                    <ModelErrorBoundary>
                        <Suspense fallback={null}>
                            <AnatomyModel gender={gender} />
                        </Suspense>
                    </ModelErrorBoundary>

                    {/* Görünmez interaktif bölgeler */}
                    <group>
                        {HITBOXES.map((hitbox, index) => (
                            <HitboxMesh
                                key={`${hitbox.muscle}-${index}`}
                                hitbox={hitbox}
                                onToggle={onToggle}
                                onHover={setHovered}
                            />
                        ))}
                    </group>

                    {/* Aktif bölge etiketleri */}
                    {activeMuscles.map((group) => {
                        const anchor = LABEL_ANCHORS[group.key];
                        if (!anchor) return null;

                        return (
                            <Html
                                key={group.key}
                                position={anchor}
                                center
                                distanceFactor={4}
                                style={{ pointerEvents: "none" }}
                            >
                                <div className="flex items-center gap-1.5 whitespace-nowrap rounded-full border border-[#27D66B]/60 bg-[#050505]/85 px-3.5 py-1.5 shadow-[0_0_18px_rgba(39,214,107,0.35)]">
                                    <span className="h-1.5 w-1.5 rounded-full bg-[#27D66B]" />
                                    <span className="text-xs font-bold text-[#27D66B]">
                                        {group.label} Aktif
                                    </span>
                                </div>
                            </Html>
                        );
                    })}

                    <ContactShadows
                        position={[0, 0.14, 0]}
                        opacity={0.5}
                        scale={4}
                        blur={2.4}
                        color="#000000"
                    />

                    <OrbitControls
                        target={[0, 0.95, 0]}
                        enablePan={false}
                        enableZoom={false}
                        minPolarAngle={Math.PI * 0.15}
                        maxPolarAngle={Math.PI * 0.55}
                    />
                </Canvas>

                {/* Yüklenme katmanı — Canvas DIŞInda (sibling);
                    React 18'de Suspense fallback'inde <Html> kullanmak
                    removeChild/race-condition hatalarına yol açtığı için
                    drei <Loader> burada durur. */}
                <Loader
                    containerStyles={{
                        position: "absolute",
                        inset: 0,
                        background: "rgba(10, 10, 10, 0.92)",
                        borderRadius: "1rem",
                        zIndex: 5,
                    }}
                    innerStyles={{
                        background: "rgba(255, 255, 255, 0.1)",
                        width: "180px",
                        height: "3px",
                        borderRadius: "999px",
                    }}
                    barStyles={{
                        background: "#27D66B",
                        height: "3px",
                        borderRadius: "999px",
                    }}
                    dataStyles={{
                        color: "#27D66B",
                        fontSize: "12px",
                        fontWeight: 700,
                        letterSpacing: "0.2em",
                        textTransform: "uppercase",
                        marginTop: "20px",
                        whiteSpace: "nowrap",
                    }}
                    dataInterpolation={(percent: number) =>
                        `3D Model Hazırlanıyor · %${percent.toFixed(0)}`
                    }
                />

                {hoveredLabel && (
                    <div className="pointer-events-none absolute left-1/2 top-3 -translate-x-1/2 rounded-full border border-[#27D66B]/40 bg-[#050505]/80 px-4 py-1.5 text-xs font-semibold text-[#27D66B]">
                        {hoveredLabel}
                    </div>
                )}
            </div>
        </div>
    );
}
