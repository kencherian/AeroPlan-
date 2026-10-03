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
  Sparkles
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
  const [airplaneProgress, setAirplaneProgress] = useState<number>(0);
  const [manualRotation, setManualRotation] = useState<[number, number] | null>(null);

  const originCoords = useMemo(() => getCoordinatesForIata(originIata), [originIata]);
  const destCoords = useMemo(() => getCoordinatesForIata(destinationIata), [destinationIata]);

  const originCity = getCityForIata(originIata);
  const destCity = getCityForIata(destinationIata);

  const distance = useMemo(() => calculateDistance(originCoords, destCoords), [originCoords, destCoords]);
  const initialBearing = useMemo(() => calculateBearing(originCoords, destCoords), [originCoords, destCoords]);

  // Compute spherical great-circle midpoint for automatic centering
  const routeMidpoint = useMemo(() => {
    const interpolator = d3.geoInterpolate(originCoords, destCoords);
    return interpolator(0.5);
  }, [originCoords, destCoords]);

  // Animated airplane along great-circle trajectory
  useEffect(() => {
    let animFrame: number;
    let start = Date.now();
    const period = 7500;

    const loop = () => {
      const now = Date.now();
      const p = ((now - start) % period) / period;
      setAirplaneProgress(p);
      animFrame = requestAnimationFrame(loop);
    };

    animFrame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animFrame);
  }, [originIata, destinationIata]);

  // D3 Globe / Map Rendering
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
      .attr('id', 'globe-shading')
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
      .attr('id', 'globe-shadow')
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

    // GeoJSON Great Circle line
    const lineFeature: any = {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [originCoords, destCoords]
      }
    };

    // Center coordinates
    const targetLon = manualRotation ? manualRotation[0] : -routeMidpoint[0];
    const targetLat = manualRotation ? manualRotation[1] : -routeMidpoint[1];

    // Projection selection
    let projection: d3.GeoProjection;
    let globeRadius = isCentered ? 165 : 138;

    if (projectionMode === 'globe') {
      projection = d3.geoOrthographic()
        .scale(globeRadius)
        .translate([cx, cy])
        .rotate([targetLon, targetLat, 0])
        .clipAngle(90);
    } else {
      projection = d3.geoNaturalEarth1()
        .scale(isCentered ? 165 : 130)
        .translate([cx, cy])
        .rotate([targetLon, 0, 0]);
    }

    const pathGenerator = d3.geoPath().projection(projection);

    // Interactive Drag to Rotate Globe
    const dragBehavior = d3.drag<SVGSVGElement, unknown>()
      .on('drag', (event) => {
        if (projectionMode !== 'globe') return;
        const currentRotate = projection.rotate();
        const sensitivity = 0.35;
        const newLon = currentRotate[0] + event.dx * sensitivity;
        const newLat = Math.max(-80, Math.min(80, currentRotate[1] - event.dy * sensitivity));
        setManualRotation([newLon, newLat]);
      });

    svg.call(dragBehavior as any);

    // Background Canvas Rectangle
    g.append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', '#F7F3EC');

    // 1. Globe Horizon Disc & Atmospheric Aura (when in Globe mode)
    if (projectionMode === 'globe') {
      // Outer Atmospheric Halo Ring
      g.append('circle')
        .attr('cx', cx)
        .attr('cy', cy)
        .attr('r', globeRadius + 6)
        .attr('fill', 'none')
        .attr('stroke', '#E7DFD2')
        .attr('stroke-width', 2.5)
        .attr('opacity', 0.85);

      // Primary Globe Sphere Body (Sea & Horizon)
      g.append('path')
        .datum({ type: 'Sphere' })
        .attr('d', pathGenerator as any)
        .attr('fill', 'url(#globe-shading)')
        .attr('stroke', '#D9D0C1')
        .attr('stroke-width', 1.2)
        .attr('filter', 'url(#globe-shadow)');
    } else {
      // Panoramic Map Ocean Fill
      g.append('path')
        .datum({ type: 'Sphere' })
        .attr('d', pathGenerator as any)
        .attr('fill', '#FAF6EE')
        .attr('stroke', '#DFD8CC')
        .attr('stroke-width', 1);
    }

    // 2. Graticules (Lat/Long spherical grid)
    const graticule = d3.geoGraticule10();
    g.append('path')
      .datum(graticule)
      .attr('d', pathGenerator as any)
      .attr('fill', 'none')
      .attr('stroke', '#E2DCD1')
      .attr('stroke-width', 0.5)
      .attr('stroke-dasharray', '2,4')
      .attr('opacity', 0.7);

    // 3. Stylized World Map Landmass Fills (Muted, minimalist, warm linen)
    g.append('path')
      .datum(worldLandGeoJson)
      .attr('d', pathGenerator as any)
      .attr('fill', '#E5DEC0')
      .attr('opacity', 0.95);

    // 4. Subtle Country Vector Borders
    g.append('path')
      .datum(worldBordersGeoJson)
      .attr('d', pathGenerator as any)
      .attr('fill', 'none')
      .attr('stroke', '#D7CFBE')
      .attr('stroke-width', 0.45)
      .attr('stroke-dasharray', '1.5,2.5')
      .attr('opacity', 0.75);

    // 5. Delicate Land Coastlines
    g.append('path')
      .datum(worldCoastGeoJson)
      .attr('d', pathGenerator as any)
      .attr('fill', 'none')
      .attr('stroke', '#CCC2B0')
      .attr('stroke-width', 0.75)
      .attr('opacity', 0.95);

    // 6. Spherical Horizon Rim Highlight (Globe mode)
    if (projectionMode === 'globe') {
      g.append('path')
        .datum({ type: 'Sphere' })
        .attr('d', pathGenerator as any)
        .attr('fill', 'none')
        .attr('stroke', '#C8BFB0')
        .attr('stroke-width', 1);
    }

    // 7. Great Circle Geodesic Flight Path
    // Soft Peach Glow Underlay
    g.append('path')
      .datum(lineFeature)
      .attr('d', pathGenerator as any)
      .attr('fill', 'none')
      .attr('stroke', '#E0A996')
      .attr('stroke-width', 6)
      .attr('opacity', 0.35)
      .attr('stroke-linecap', 'round');

    // Dashed Terracotta Flight Arc
    g.append('path')
      .datum(lineFeature)
      .attr('d', pathGenerator as any)
      .attr('fill', 'none')
      .attr('stroke', '#C8766E')
      .attr('stroke-width', 2.4)
      .attr('stroke-dasharray', '5,4')
      .attr('stroke-linecap', 'round');

    // Check visibility on the visible hemisphere for Orthographic projection
    const centerPoint: [number, number] = [-targetLon, -targetLat];
    const isVisibleOnGlobe = (coord: [number, number]) => {
      if (projectionMode !== 'globe') return true;
      const dist = d3.geoDistance(coord, centerPoint);
      return dist <= Math.PI / 2 + 0.05; // visible hemisphere
    };

    const pOrigin = projection(originCoords);
    const pDest = projection(destCoords);

    // 8. Origin Marker (SFO)
    if (pOrigin && isVisibleOnGlobe(originCoords)) {
      // Pulse animation ring
      g.append('circle')
        .attr('cx', pOrigin[0])
        .attr('cy', pOrigin[1])
        .attr('r', 8.5)
        .attr('fill', '#8A9A86')
        .attr('opacity', 0.25);

      // Core dot
      g.append('circle')
        .attr('cx', pOrigin[0])
        .attr('cy', pOrigin[1])
        .attr('r', 4.5)
        .attr('fill', '#73836F')
        .attr('stroke', '#FFFFFF')
        .attr('stroke-width', 1.5);

      // Label background pill
      const labelW = 34;
      const labelH = 17;
      const lx = pOrigin[0] - labelW / 2;
      const ly = pOrigin[1] - 22;

      g.append('rect')
        .attr('x', lx)
        .attr('y', ly)
        .attr('width', labelW)
        .attr('height', labelH)
        .attr('rx', 4)
        .attr('fill', 'rgba(255, 255, 255, 0.95)')
        .attr('stroke', '#E8E2D7')
        .attr('stroke-width', 0.8);

      g.append('text')
        .attr('x', pOrigin[0])
        .attr('y', ly + 12)
        .attr('text-anchor', 'middle')
        .attr('fill', '#3E3832')
        .attr('font-size', '10.5px')
        .attr('font-weight', '700')
        .attr('font-family', 'JetBrains Mono, monospace')
        .text(originIata);
    }

    // 9. Destination Marker (HND)
    if (pDest && isVisibleOnGlobe(destCoords)) {
      // Pulse animation ring
      g.append('circle')
        .attr('cx', pDest[0])
        .attr('cy', pDest[1])
        .attr('r', 8.5)
        .attr('fill', '#D98880')
        .attr('opacity', 0.25);

      // Core dot
      g.append('circle')
        .attr('cx', pDest[0])
        .attr('cy', pDest[1])
        .attr('r', 4.5)
        .attr('fill', '#C8766E')
        .attr('stroke', '#FFFFFF')
        .attr('stroke-width', 1.5);

      // Label background pill
      const labelW = 34;
      const labelH = 17;
      const lx = pDest[0] - labelW / 2;
      const ly = pDest[1] - 22;

      g.append('rect')
        .attr('x', lx)
        .attr('y', ly)
        .attr('width', labelW)
        .attr('height', labelH)
        .attr('rx', 4)
        .attr('fill', 'rgba(255, 255, 255, 0.95)')
        .attr('stroke', '#E8E2D7')
        .attr('stroke-width', 0.8);

      g.append('text')
        .attr('x', pDest[0])
        .attr('y', ly + 12)
        .attr('text-anchor', 'middle')
        .attr('fill', '#C8766E')
        .attr('font-size', '10.5px')
        .attr('font-weight', '700')
        .attr('font-family', 'JetBrains Mono, monospace')
        .text(destinationIata);
    }

    // 10. Animated Airplane along Great Circle Path
    const interpolator = d3.geoInterpolate(originCoords, destCoords);
    const curCoord = interpolator(airplaneProgress);

    if (isVisibleOnGlobe(curCoord)) {
      const pCurrent = projection(curCoord);
      const nextCoord = interpolator(Math.min(1, airplaneProgress + 0.015));
      const pNext = projection(nextCoord);

      let angle = 0;
      if (pCurrent && pNext) {
        const dx = pNext[0] - pCurrent[0];
        const dy = pNext[1] - pCurrent[1];
        angle = (Math.atan2(dy, dx) * 180) / Math.PI;
      }

      if (pCurrent) {
        const planeGroup = g.append('g')
          .attr('transform', `translate(${pCurrent[0]}, ${pCurrent[1]}) rotate(${angle})`);

        // Radar ping ring
        planeGroup.append('circle')
          .attr('r', 10)
          .attr('fill', 'none')
          .attr('stroke', '#D98880')
          .attr('stroke-width', 0.9)
          .attr('opacity', 0.45);

        // Airplane SVG glyph
        planeGroup.append('path')
          .attr('d', 'M0,-6 L8,6 L0,3.5 L-8,6 Z')
          .attr('fill', '#FFFFFF')
          .attr('stroke', '#C8766E')
          .attr('stroke-width', 1.3);
      }
    }
  }, [
    originCoords,
    destCoords,
    originIata,
    destinationIata,
    isCentered,
    projectionMode,
    airplaneProgress,
    manualRotation,
    routeMidpoint
  ]);

  const handleResetRotation = () => {
    setManualRotation(null);
  };

  return (
    <div className="bg-white border border-[#EFECE6] rounded-2xl overflow-hidden shadow-sm">
      {/* Map Header */}
      <div className="px-6 py-4 border-b border-[#EFECE6] bg-[#FDFCF9] flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Feather className="w-4 h-4 text-[#73836F]" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#8C8279]">
            Gentle Spherical Flight Path Visualization
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="hidden lg:flex items-center gap-4 text-xs font-mono text-[#8C8279]">
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
              title="3D Spherical Globe Perspective"
            >
              <Globe className="w-3.5 h-3.5 text-[#73836F]" />
              <span>Spherical Globe</span>
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

          {/* Reset / Center Button */}
          {manualRotation && projectionMode === 'globe' && (
            <button
              onClick={handleResetRotation}
              className="px-2.5 py-1 text-xs font-medium text-[#73836F] bg-[#F7F4EF] hover:bg-[#EFECE6] border border-[#E8E4DC] rounded-xl transition-all flex items-center gap-1 shadow-2xs"
              title="Reset Globe to SFO-HND Route Center"
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
      <div className="relative bg-[#F7F3EC] flex items-center justify-center p-2 overflow-hidden cursor-grab active:cursor-grabbing">
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
        {projectionMode === 'globe' && !manualRotation && (
          <div className="hidden sm:flex absolute bottom-3 left-4 bg-white/80 border border-[#EFECE6] backdrop-blur-xs rounded-lg px-2.5 py-1 text-[10px] font-mono text-[#8C8279] pointer-events-none items-center gap-1.5">
            <Globe className="w-3 h-3 text-[#73836F]" />
            <span>Interactive 3D Globe · Drag to gently spin</span>
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
