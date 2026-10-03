import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import countriesData from 'world-atlas/countries-110m.json';
import { 
  Compass, 
  Navigation, 
  Maximize2, 
  Feather, 
  Heart, 
  Globe, 
  Map as MapIcon, 
  RotateCcw,
  Sparkles,
  Play,
  Pause
} from 'lucide-react';
import { getCoordinatesForIata, getCityForIata } from '../data/airports.ts';

interface FlightRouteMapProps {
  originIata: string;
  destinationIata: string;
  airline?: string;
  flightNumber?: string;
  duration?: string;
}

// Extract full world landmasses and borders from world-atlas
const worldLandGeoJson: any = topojson.feature(
  countriesData as any,
  (countriesData as any).objects.countries
);

const worldBordersGeoJson: any = topojson.mesh(
  countriesData as any,
  (countriesData as any).objects.countries,
  (a: any, b: any) => a !== b
);

const worldCoastGeoJson: any = topojson.mesh(
  countriesData as any,
  (countriesData as any).objects.countries,
  (a: any, b: any) => a === b
);

function calculateDistance(coord1: [number, number], coord2: [number, number]): { km: number; nm: number } {
  const [lon1, lat1] = coord1;
  const [lon2, lat2] = coord2;
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const km = Math.round(R * c);
  const nm = Math.round(km * 0.539957);
  return { km, nm };
}

function calculateBearing(coord1: [number, number], coord2: [number, number]): number {
  const [lon1, lat1] = coord1.map((deg) => (deg * Math.PI) / 180);
  const [lon2, lat2] = coord2.map((deg) => (deg * Math.PI) / 180);
  const y = Math.sin(lon2 - lon1) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1);
  const bearing = (Math.atan2(y, x) * 180) / Math.PI;
  return Math.round((bearing + 360) % 360);
}

export const FlightRouteMap: React.FC<FlightRouteMapProps> = ({
  originIata,
  destinationIata,
  airline,
  flightNumber,
  duration,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [isCentered, setIsCentered] = useState<boolean>(true);
  const [projectionMode, setProjectionMode] = useState<'globe' | 'panoramic'>('globe');
  const [isAutoRevolving, setIsAutoRevolving] = useState<boolean>(false);
  const [hasUserRotated, setHasUserRotated] = useState<boolean>(false);

  const originCoords = useMemo(() => getCoordinatesForIata(originIata), [originIata]);
  const destCoords = useMemo(() => getCoordinatesForIata(destinationIata), [destinationIata]);

  const originCity = getCityForIata(originIata);
  const destCity = getCityForIata(destinationIata);

  const distance = useMemo(() => calculateDistance(originCoords, destCoords), [originCoords, destCoords]);
  const initialBearing = useMemo(() => calculateBearing(originCoords, destCoords), [originCoords, destCoords]);

  // Compute spherical great-circle midpoint for automatic route centering
  const routeMidpoint = useMemo(() => {
    const interpolator = d3.geoInterpolate(originCoords, destCoords);
    return interpolator(0.5);
  }, [originCoords, destCoords]);

  // Default rotation centered on route
  const defaultRotation = useMemo<[number, number, number]>(() => {
    return [-routeMidpoint[0], -routeMidpoint[1], 0];
  }, [routeMidpoint]);

  // Mutable animation and physics refs for 60fps rendering without React re-render lag
  const rotationRef = useRef<[number, number, number]>([-routeMidpoint[0], -routeMidpoint[1], 0]);
  const velocityRef = useRef<[number, number]>([0, 0]);
  const isDraggingRef = useRef<boolean>(false);
  const dragStartPosRef = useRef<[number, number]>([0, 0]);
  const dragStartRotRef = useRef<[number, number, number]>([-routeMidpoint[0], -routeMidpoint[1], 0]);
  const animFrameRef = useRef<number | null>(null);
  const planeProgressRef = useRef<number>(0);
  const smoothResetRef = useRef<{
    startRot: [number, number, number];
    targetRot: [number, number, number];
    startTime: number;
    duration: number;
  } | null>(null);

  // Sync default rotation when airports change
  useEffect(() => {
    rotationRef.current = [-routeMidpoint[0], -routeMidpoint[1], 0];
    velocityRef.current = [0, 0];
    setHasUserRotated(false);
  }, [routeMidpoint]);

  // Master render and animation loop
  useEffect(() => {
    if (!svgRef.current) return;

    const width = 800;
    const height = 380;
    const cx = width / 2;
    const cy = height / 2;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Definitions for soft lighting & gradients
    const defs = svg.append('defs');

    // Spherical Globe Radial Gradient for subtle 3D depth
    const globeGrad = defs.append('radialGradient')
      .attr('id', 'globe-shading-interactive')
      .attr('cx', '48%')
      .attr('cy', '45%')
      .attr('r', '60%');

    globeGrad.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#FAF7F1');

    globeGrad.append('stop')
      .attr('offset', '70%')
      .attr('stop-color', '#F3ECE0');

    globeGrad.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#E8DFD0');

    // Soft drop shadow for the globe sphere
    const shadowFilter = defs.append('filter')
      .attr('id', 'globe-shadow-interactive')
      .attr('x', '-20%')
      .attr('y', '-20%')
      .attr('width', '140%')
      .attr('height', '140%');

    shadowFilter.append('feDropShadow')
      .attr('dx', '0')
      .attr('dy', '4')
      .attr('stdDeviation', '6')
      .attr('flood-color', '#3E3832')
      .attr('flood-opacity', '0.07');

    const g = svg.append('g');

    // Background Canvas Rectangle
    g.append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', '#F7F3EC');

    // Radius scale
    const globeRadius = isCentered ? 165 : 138;

    // Projection
    const projection = projectionMode === 'globe'
      ? d3.geoOrthographic()
          .scale(globeRadius)
          .translate([cx, cy])
          .clipAngle(90)
      : d3.geoNaturalEarth1()
          .scale(isCentered ? 165 : 130)
          .translate([cx, cy]);

    const pathGenerator = d3.geoPath().projection(projection);

    // 1. Globe Background / Sphere Layer
    const haloCircle = g.append('circle')
      .attr('cx', cx)
      .attr('cy', cy)
      .attr('r', globeRadius + 6)
      .attr('fill', 'none')
      .attr('stroke', '#E7DFD2')
      .attr('stroke-width', 2.5)
      .attr('opacity', projectionMode === 'globe' ? 0.85 : 0);

    const spherePath = g.append('path')
      .datum({ type: 'Sphere' })
      .attr('d', pathGenerator as any)
      .attr('fill', projectionMode === 'globe' ? 'url(#globe-shading-interactive)' : '#FAF6EE')
      .attr('stroke', '#D9D0C1')
      .attr('stroke-width', 1.2)
      .attr('filter', projectionMode === 'globe' ? 'url(#globe-shadow-interactive)' : null);

    // 2. Graticules (Lat/Long spherical grid)
    const graticule = d3.geoGraticule10();
    const graticulePath = g.append('path')
      .datum(graticule)
      .attr('fill', 'none')
      .attr('stroke', '#E2DCD1')
      .attr('stroke-width', 0.5)
      .attr('stroke-dasharray', '2,4')
      .attr('opacity', 0.7);

    // 3. Stylized World Map Landmass Fills
    const landPath = g.append('path')
      .datum(worldLandGeoJson)
      .attr('fill', '#E5DEC0')
      .attr('opacity', 0.95);

    // 4. Subtle Country Vector Borders
    const bordersPath = g.append('path')
      .datum(worldBordersGeoJson)
      .attr('fill', 'none')
      .attr('stroke', '#D7CFBE')
      .attr('stroke-width', 0.45)
      .attr('stroke-dasharray', '1.5,2.5')
      .attr('opacity', 0.75);

    // 5. Delicate Land Coastlines
    const coastPath = g.append('path')
      .datum(worldCoastGeoJson)
      .attr('fill', 'none')
      .attr('stroke', '#CCC2B0')
      .attr('stroke-width', 0.75)
      .attr('opacity', 0.95);

    // 6. Spherical Horizon Rim Highlight (Globe mode)
    const rimPath = g.append('path')
      .datum({ type: 'Sphere' })
      .attr('fill', 'none')
      .attr('stroke', '#C8BFB0')
      .attr('stroke-width', 1)
      .attr('opacity', projectionMode === 'globe' ? 1 : 0);

    // 7. Geodesic Flight Route
    const lineFeature: any = {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [originCoords, destCoords]
      }
    };

    const routeGlowPath = g.append('path')
      .datum(lineFeature)
      .attr('fill', 'none')
      .attr('stroke', '#E0A996')
      .attr('stroke-width', 6)
      .attr('opacity', 0.35)
      .attr('stroke-linecap', 'round');

    const routeArcPath = g.append('path')
      .datum(lineFeature)
      .attr('fill', 'none')
      .attr('stroke', '#C8766E')
      .attr('stroke-width', 2.4)
      .attr('stroke-dasharray', '5,4')
      .attr('stroke-linecap', 'round');

    // 8. Origin Marker Group (SFO)
    const sfoGroup = g.append('g').attr('class', 'origin-marker');
    sfoGroup.append('circle')
      .attr('r', 8.5)
      .attr('fill', '#8A9A86')
      .attr('opacity', 0.25);
    sfoGroup.append('circle')
      .attr('r', 4.5)
      .attr('fill', '#73836F')
      .attr('stroke', '#FFFFFF')
      .attr('stroke-width', 1.5);
    const sfoPill = sfoGroup.append('rect')
      .attr('x', -17)
      .attr('y', -23)
      .attr('width', 34)
      .attr('height', 17)
      .attr('rx', 4)
      .attr('fill', 'rgba(255, 255, 255, 0.95)')
      .attr('stroke', '#E8E2D7')
      .attr('stroke-width', 0.8);
    sfoGroup.append('text')
      .attr('x', 0)
      .attr('y', -11)
      .attr('text-anchor', 'middle')
      .attr('fill', '#3E3832')
      .attr('font-size', '10.5px')
      .attr('font-weight', '700')
      .attr('font-family', 'JetBrains Mono, monospace')
      .text(originIata);

    // 9. Destination Marker Group (HND)
    const hndGroup = g.append('g').attr('class', 'destination-marker');
    hndGroup.append('circle')
      .attr('r', 8.5)
      .attr('fill', '#D98880')
      .attr('opacity', 0.25);
    hndGroup.append('circle')
      .attr('r', 4.5)
      .attr('fill', '#C8766E')
      .attr('stroke', '#FFFFFF')
      .attr('stroke-width', 1.5);
    const hndPill = hndGroup.append('rect')
      .attr('x', -17)
      .attr('y', -23)
      .attr('width', 34)
      .attr('height', 17)
      .attr('rx', 4)
      .attr('fill', 'rgba(255, 255, 255, 0.95)')
      .attr('stroke', '#E8E2D7')
      .attr('stroke-width', 0.8);
    hndGroup.append('text')
      .attr('x', 0)
      .attr('y', -11)
      .attr('text-anchor', 'middle')
      .attr('fill', '#C8766E')
      .attr('font-size', '10.5px')
      .attr('font-weight', '700')
      .attr('font-family', 'JetBrains Mono, monospace')
      .text(destinationIata);

    // 10. Airplane Icon Group
    const planeGroup = g.append('g').attr('class', 'plane-marker');
    planeGroup.append('circle')
      .attr('r', 10)
      .attr('fill', 'none')
      .attr('stroke', '#D98880')
      .attr('stroke-width', 0.9)
      .attr('opacity', 0.45);
    planeGroup.append('path')
      .attr('d', 'M0,-6 L8,6 L0,3.5 L-8,6 Z')
      .attr('fill', '#FFFFFF')
      .attr('stroke', '#C8766E')
      .attr('stroke-width', 1.3);

    const interpolator = d3.geoInterpolate(originCoords, destCoords);

    // Visibility test helper for orthographic hemisphere
    const isCoordVisible = (coord: [number, number], rot: [number, number, number]) => {
      if (projectionMode !== 'globe') return true;
      const center: [number, number] = [-rot[0], -rot[1]];
      return d3.geoDistance(coord, center) <= Math.PI / 2 + 0.04;
    };

    // Fast render frame function: updates all dynamic projections
    const updateFrame = () => {
      const rot = rotationRef.current;
      projection.rotate(rot);

      // Re-project all vector paths directly
      spherePath.attr('d', pathGenerator as any);
      graticulePath.attr('d', pathGenerator as any);
      landPath.attr('d', pathGenerator as any);
      bordersPath.attr('d', pathGenerator as any);
      coastPath.attr('d', pathGenerator as any);
      if (projectionMode === 'globe') {
        rimPath.attr('d', pathGenerator as any);
      }
      routeGlowPath.attr('d', pathGenerator as any);
      routeArcPath.attr('d', pathGenerator as any);

      // Re-project SFO Origin Pin
      if (isCoordVisible(originCoords, rot)) {
        const pOrigin = projection(originCoords);
        if (pOrigin) {
          sfoGroup.style('display', 'block').attr('transform', `translate(${pOrigin[0]}, ${pOrigin[1]})`);
        } else {
          sfoGroup.style('display', 'none');
        }
      } else {
        sfoGroup.style('display', 'none');
      }

      // Re-project HND Destination Pin
      if (isCoordVisible(destCoords, rot)) {
        const pDest = projection(destCoords);
        if (pDest) {
          hndGroup.style('display', 'block').attr('transform', `translate(${pDest[0]}, ${pDest[1]})`);
        } else {
          hndGroup.style('display', 'none');
        }
      } else {
        hndGroup.style('display', 'none');
      }

      // Re-project Animated Airplane
      const p = planeProgressRef.current;
      const curCoord = interpolator(p);

      if (isCoordVisible(curCoord, rot)) {
        const pCurrent = projection(curCoord);
        const nextCoord = interpolator(Math.min(1, p + 0.015));
        const pNext = projection(nextCoord);

        let angle = 0;
        if (pCurrent && pNext) {
          const dx = pNext[0] - pCurrent[0];
          const dy = pNext[1] - pCurrent[1];
          angle = (Math.atan2(dy, dx) * 180) / Math.PI;
        }

        if (pCurrent) {
          planeGroup.style('display', 'block').attr('transform', `translate(${pCurrent[0]}, ${pCurrent[1]}) rotate(${angle})`);
        } else {
          planeGroup.style('display', 'none');
        }
      } else {
        planeGroup.style('display', 'none');
      }
    };

    // Animation & Physics Loop (Inertia + Plane Animation + Auto-revolve)
    let lastTime = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(50, now - lastTime);
      lastTime = now;

      // 1. Advance Airplane
      planeProgressRef.current = (planeProgressRef.current + dt / 8000) % 1;

      // 2. Smooth reset interpolation
      if (smoothResetRef.current) {
        const sr = smoothResetRef.current;
        const progress = Math.min(1, (now - sr.startTime) / sr.duration);
        // Ease out cubic
        const ease = 1 - Math.pow(1 - progress, 3);

        const curLon = sr.startRot[0] + (sr.targetRot[0] - sr.startRot[0]) * ease;
        const curLat = sr.startRot[1] + (sr.targetRot[1] - sr.startRot[1]) * ease;

        rotationRef.current = [curLon, curLat, 0];

        if (progress >= 1) {
          smoothResetRef.current = null;
          setHasUserRotated(false);
        }
      } else if (!isDraggingRef.current) {
        // 3. Inertia damping
        let [vx, vy] = velocityRef.current;
        if (Math.abs(vx) > 0.005 || Math.abs(vy) > 0.005) {
          rotationRef.current[0] += vx;
          rotationRef.current[1] = Math.max(-80, Math.min(80, rotationRef.current[1] + vy));

          // Damping factor
          velocityRef.current = [vx * 0.94, vy * 0.94];
        } else {
          velocityRef.current = [0, 0];

          // 4. Auto-revolve if enabled
          if (isAutoRevolving && projectionMode === 'globe') {
            rotationRef.current[0] -= 0.12; // slow peaceful spin
          }
        }
      }

      updateFrame();
      animFrameRef.current = requestAnimationFrame(tick);
    };

    // Interactive Drag to Rotate Globe (Mouse + Touch)
    const dragBehavior = d3.drag<SVGSVGElement, unknown>()
      .on('start', (event) => {
        isDraggingRef.current = true;
        smoothResetRef.current = null;
        velocityRef.current = [0, 0];
        dragStartPosRef.current = [event.x, event.y];
        dragStartRotRef.current = [...rotationRef.current];
        setHasUserRotated(true);
      })
      .on('drag', (event) => {
        if (!isDraggingRef.current) return;
        const sensitivity = 0.35;
        const dx = event.dx;
        const dy = event.dy;

        const newLon = rotationRef.current[0] + dx * sensitivity;
        const newLat = Math.max(-80, Math.min(80, rotationRef.current[1] - dy * sensitivity));

        rotationRef.current = [newLon, newLat, 0];
        velocityRef.current = [dx * sensitivity, -dy * sensitivity];
      })
      .on('end', () => {
        isDraggingRef.current = false;
      });

    svg.call(dragBehavior as any);

    // Initial draw
    updateFrame();
    animFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [
    originCoords,
    destCoords,
    originIata,
    destinationIata,
    isCentered,
    projectionMode,
    isAutoRevolving
  ]);

  // Recenter smoothly to SFO-HND midpoint
  const handleRecenter = () => {
    smoothResetRef.current = {
      startRot: [...rotationRef.current],
      targetRot: defaultRotation,
      startTime: performance.now(),
      duration: 650, // ms
    };
  };

  return (
    <div className="bg-white border border-[#EFECE6] rounded-2xl overflow-hidden shadow-sm">
      {/* Map Header */}
      <div className="px-6 py-4 border-b border-[#EFECE6] bg-[#FDFCF9] flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Feather className="w-4 h-4 text-[#73836F]" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#8C8279]">
            Interactive Spherical Flight Path Visualization
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="hidden lg:flex items-center gap-3 text-xs font-mono text-[#8C8279]">
            <span>
              Distance: <strong className="text-[#3E3832] tabular-nums">{distance.km.toLocaleString()} km</strong> ({distance.nm.toLocaleString()} nm)
            </span>
            <span className="text-[#DED9D0]">·</span>
            <span>
              Initial Bearing: <strong className="text-[#C8766E] tabular-nums">{initialBearing}°</strong>
            </span>
          </div>

          {/* Perspective Selector Pills */}
          <div className="flex items-center gap-1 bg-[#F7F4EF] p-1 rounded-xl border border-[#E8E4DC]">
            <button
              onClick={() => setProjectionMode('globe')}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 ${
                projectionMode === 'globe'
                  ? 'bg-white text-[#3E3832] shadow-xs font-semibold'
                  : 'text-[#8C8279] hover:text-[#3E3832]'
              }`}
              title="3D Interactive Spherical Globe"
            >
              <Globe className="w-3.5 h-3.5 text-[#73836F]" />
              <span>Interactive Globe</span>
            </button>

            <button
              onClick={() => setProjectionMode('panoramic')}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 ${
                projectionMode === 'panoramic'
                  ? 'bg-white text-[#3E3832] shadow-xs font-semibold'
                  : 'text-[#8C8279] hover:text-[#3E3832]'
              }`}
              title="2D Panoramic Map Perspective"
            >
              <MapIcon className="w-3.5 h-3.5 text-[#D98880]" />
              <span>Panoramic Map</span>
            </button>
          </div>

          {/* Auto Revolve Toggle (Globe mode only) */}
          {projectionMode === 'globe' && (
            <button
              onClick={() => setIsAutoRevolving(!isAutoRevolving)}
              className={`px-2.5 py-1 text-xs font-medium rounded-xl border transition-all flex items-center gap-1.5 shadow-2xs ${
                isAutoRevolving
                  ? 'bg-[#73836F] text-white border-[#73836F]'
                  : 'bg-[#F7F4EF] text-[#8C8279] hover:text-[#3E3832] border-[#E8E4DC]'
              }`}
              title={isAutoRevolving ? 'Pause Auto-Spin' : 'Peaceful Auto-Revolve'}
            >
              {isAutoRevolving ? (
                <>
                  <Pause className="w-3 h-3" />
                  <span className="hidden sm:inline">Spinning</span>
                </>
              ) : (
                <>
                  <Play className="w-3 h-3" />
                  <span className="hidden sm:inline">Auto-Spin</span>
                </>
              )}
            </button>
          )}

          {/* Recenter Button */}
          {hasUserRotated && projectionMode === 'globe' && (
            <button
              onClick={handleRecenter}
              className="px-2.5 py-1 text-xs font-medium text-[#73836F] bg-[#F7F4EF] hover:bg-[#EFECE6] border border-[#E8E4DC] rounded-xl transition-all flex items-center gap-1 shadow-2xs"
              title="Recenter Globe on SFO-HND Flight Corridor"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Recenter</span>
            </button>
          )}

          {/* Zoom Toggle */}
          <button
            onClick={() => setIsCentered(!isCentered)}
            className="px-3 py-1 text-xs font-medium text-[#3E3832] bg-[#F7F4EF] hover:bg-[#EFECE6] border border-[#E8E4DC] rounded-xl transition-all flex items-center gap-1.5 shadow-2xs"
            title="Toggle projection zoom view"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isCentered ? 'Standard View' : 'Centered Focus'}</span>
          </button>
        </div>
      </div>

      {/* SVG Canvas Container */}
      <div 
        className="relative bg-[#F7F3EC] flex items-center justify-center p-2 overflow-hidden cursor-grab active:cursor-grabbing select-none"
        style={{ touchAction: 'none' }}
      >
        <svg
          ref={svgRef}
          viewBox="0 0 800 380"
          className="w-full h-auto max-h-[350px] select-none rounded-xl"
        />

        {/* Flight Badge Floating Overlay */}
        <div className="absolute top-4 left-4 bg-white/95 border border-[#EFECE6] backdrop-blur-md rounded-xl p-3 shadow-md text-xs space-y-1 font-mono pointer-events-none">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#8A9A86] animate-pulse" />
            <span className="font-semibold text-[#3E3832]">
              {airline || 'Scheduled Carrier'} {flightNumber && `· ${flightNumber}`}
            </span>
          </div>
          <div className="text-[11px] text-[#8C8279]">
            <span>{originCity} ({originIata})</span>
            <span className="mx-1 text-[#C8766E]">→</span>
            <span>{destCity} ({destinationIata})</span>
          </div>
          {duration && (
            <div className="text-[10px] text-[#8C8279]">
              Est. Duration: {duration} (Gentle Direct Transit)
            </div>
          )}
        </div>

        {/* Drag Hint (When in globe mode) */}
        {projectionMode === 'globe' && !hasUserRotated && (
          <div className="hidden sm:flex absolute bottom-3 left-4 bg-white/85 border border-[#EFECE6] backdrop-blur-xs rounded-lg px-2.5 py-1 text-[10px] font-mono text-[#8C8279] pointer-events-none items-center gap-1.5 shadow-2xs">
            <Globe className="w-3 h-3 text-[#73836F]" />
            <span>Click & drag in any direction to revolve the 3D globe</span>
          </div>
        )}

        {/* Legend */}
        <div className="absolute bottom-3 right-4 bg-white/90 border border-[#EFECE6] backdrop-blur-sm rounded-xl px-3 py-1.5 text-[10px] font-mono text-[#8C8279] flex items-center gap-3 shadow-xs pointer-events-none">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#73836F] inline-block" />
            <span>Origin ({originIata})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#C8766E] inline-block" />
            <span>Sanctuary ({destinationIata})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-[#C8766E] inline-block border-t border-dashed" />
            <span>Spherical Geodesic</span>
          </div>
        </div>
      </div>
    </div>
  );
};
