import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { Compass, Navigation, Maximize2, Feather, Heart } from 'lucide-react';
import { getCoordinatesForIata, getCityForIata } from '../data/airports.ts';

interface FlightRouteMapProps {
  originIata: string;
  destinationIata: string;
  airline?: string;
  flightNumber?: string;
  duration?: string;
}

const WORLD_CONTINENTS_GEOJSON: any = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { name: 'North America' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-168, 65], [-160, 71], [-130, 70], [-90, 70], [-60, 60], [-55, 48],
          [-70, 42], [-75, 35], [-80, 25], [-97, 26], [-90, 15], [-80, 8],
          [-85, 12], [-105, 20], [-115, 30], [-124, 38], [-125, 48], [-140, 58],
          [-168, 65]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'South America' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-80, 9], [-60, 10], [-35, -5], [-35, -22], [-55, -35], [-68, -55],
          [-75, -50], [-72, -35], [-80, -5], [-80, 9]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Europe' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-10, 36], [0, 43], [5, 44], [-4, 48], [-5, 58], [10, 58], [25, 71],
          [35, 70], [60, 68], [60, 55], [30, 45], [25, 35], [-5, 36], [-10, 36]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Africa' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-17, 32], [-5, 36], [12, 37], [32, 31], [50, 12], [42, -5], [35, -25],
          [20, -35], [12, -20], [8, 5], [-15, 12], [-17, 32]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Asia' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [35, 40], [60, 55], [60, 68], [170, 66], [140, 50], [130, 35],
          [120, 22], [105, 10], [100, 2], [80, 10], [70, 25], [50, 25],
          [40, 30], [35, 40]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Australia' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [114, -22], [128, -14], [142, -10], [153, -28], [150, -37],
          [138, -35], [115, -34], [114, -22]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Japan' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [130, 31], [131, 34], [139, 35], [141, 43], [145, 44], [140, 38], [135, 34], [130, 31]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'United Kingdom' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-5, 50], [1.5, 52], [0, 58], [-4, 58], [-5, 54], [-5, 50]
        ]]
      }
    }
  ]
};

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
  const [airplaneProgress, setAirplaneProgress] = useState<number>(0);

  const originCoords = useMemo(() => getCoordinatesForIata(originIata), [originIata]);
  const destCoords = useMemo(() => getCoordinatesForIata(destinationIata), [destinationIata]);

  const originCity = getCityForIata(originIata);
  const destCity = getCityForIata(destinationIata);

  const distance = useMemo(() => calculateDistance(originCoords, destCoords), [originCoords, destCoords]);
  const initialBearing = useMemo(() => calculateBearing(originCoords, destCoords), [originCoords, destCoords]);

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

  useEffect(() => {
    if (!svgRef.current) return;

    const width = 800;
    const height = 380;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Map container group
    const g = svg.append('g');

    const lineFeature: any = {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [originCoords, destCoords]
      }
    };

    const lon1 = originCoords[0];
    const lon2 = destCoords[0];
    let centerLon = (lon1 + lon2) / 2;
    if (Math.abs(lon1 - lon2) > 180) {
      centerLon = (centerLon + 180) % 360;
    }

    const projection = d3.geoNaturalEarth1()
      .scale(isCentered ? 165 : 130)
      .rotate([-centerLon, 0, 0])
      .translate([width / 2, height / 2]);

    const pathGenerator = d3.geoPath().projection(projection);

    // Warm parchment ocean background
    g.append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', '#F4EFE6');

    // Soft graticule
    const graticule = d3.geoGraticule10();
    g.append('path')
      .datum(graticule)
      .attr('d', pathGenerator)
      .attr('fill', 'none')
      .attr('stroke', '#E2DCD1')
      .attr('stroke-width', 0.6)
      .attr('stroke-dasharray', '2,4');

    // Continents in warm sand/linen
    g.append('g')
      .selectAll('path')
      .data(WORLD_CONTINENTS_GEOJSON.features)
      .enter()
      .append('path')
      .attr('d', pathGenerator as any)
      .attr('fill', '#E7E0D3')
      .attr('stroke', '#D8D0C2')
      .attr('stroke-width', 0.8);

    // Warm terracotta Great Circle Arc
    g.append('path')
      .datum(lineFeature)
      .attr('d', pathGenerator)
      .attr('fill', 'none')
      .attr('stroke', '#E0A996')
      .attr('stroke-width', 5)
      .attr('opacity', 0.4)
      .attr('stroke-linecap', 'round');

    g.append('path')
      .datum(lineFeature)
      .attr('d', pathGenerator)
      .attr('fill', 'none')
      .attr('stroke', '#C8766E')
      .attr('stroke-width', 2.2)
      .attr('stroke-dasharray', '5,4')
      .attr('stroke-linecap', 'round');

    const pOrigin = projection(originCoords);
    const pDest = projection(destCoords);

    if (pOrigin && pDest) {
      // Origin Point
      g.append('circle')
        .attr('cx', pOrigin[0])
        .attr('cy', pOrigin[1])
        .attr('r', 8)
        .attr('fill', '#8A9A86')
        .attr('opacity', 0.25);

      g.append('circle')
        .attr('cx', pOrigin[0])
        .attr('cy', pOrigin[1])
        .attr('r', 4.5)
        .attr('fill', '#73836F')
        .attr('stroke', '#FFFFFF')
        .attr('stroke-width', 1.5);

      // Destination Point
      g.append('circle')
        .attr('cx', pDest[0])
        .attr('cy', pDest[1])
        .attr('r', 8)
        .attr('fill', '#D98880')
        .attr('opacity', 0.25);

      g.append('circle')
        .attr('cx', pDest[0])
        .attr('cy', pDest[1])
        .attr('r', 4.5)
        .attr('fill', '#C8766E')
        .attr('stroke', '#FFFFFF')
        .attr('stroke-width', 1.5);

      // Labels
      g.append('text')
        .attr('x', pOrigin[0])
        .attr('y', pOrigin[1] - 10)
        .attr('text-anchor', 'middle')
        .attr('fill', '#3E3832')
        .attr('font-size', '11px')
        .attr('font-weight', '600')
        .attr('font-family', 'JetBrains Mono, monospace')
        .text(originIata);

      g.append('text')
        .attr('x', pDest[0])
        .attr('y', pDest[1] - 10)
        .attr('text-anchor', 'middle')
        .attr('fill', '#C8766E')
        .attr('font-size', '11px')
        .attr('font-weight', '600')
        .attr('font-family', 'JetBrains Mono, monospace')
        .text(destinationIata);

      // Plane icon
      const interpolator = d3.geoInterpolate(originCoords, destCoords);
      const curCoord = interpolator(airplaneProgress);
      const pCurrent = projection(curCoord);

      const nextCoord = interpolator(Math.min(1, airplaneProgress + 0.02));
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

        planeGroup.append('path')
          .attr('d', 'M0,-5 L7,5 L0,3 L-7,5 Z')
          .attr('fill', '#FFFFFF')
          .attr('stroke', '#C8766E')
          .attr('stroke-width', 1.2);

        planeGroup.append('circle')
          .attr('r', 9)
          .attr('fill', 'none')
          .attr('stroke', '#D98880')
          .attr('stroke-width', 1)
          .attr('opacity', 0.5);
      }
    }
  }, [originCoords, destCoords, originIata, destinationIata, isCentered, airplaneProgress]);

  return (
    <div className="bg-white border border-[#EFECE6] rounded-2xl overflow-hidden shadow-sm">
      {/* Map Header */}
      <div className="px-6 py-4 border-b border-[#EFECE6] bg-[#FDFCF9] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Feather className="w-4 h-4 text-[#73836F]" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#8C8279]">
            Gentle Spherical Flight Path Visualization
          </h3>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-4 text-xs font-mono text-[#8C8279]">
            <span>
              Distance: <strong className="text-[#3E3832] tabular-nums">{distance.km.toLocaleString()} km</strong> ({distance.nm.toLocaleString()} nm)
            </span>
            <span className="text-[#DED9D0]">·</span>
            <span>
              Initial Bearing: <strong className="text-[#C8766E] tabular-nums">{initialBearing}°</strong>
            </span>
          </div>

          <button
            onClick={() => setIsCentered(!isCentered)}
            className="px-3 py-1.5 text-xs font-medium text-[#3E3832] bg-[#F7F4EF] hover:bg-[#EFECE6] border border-[#E8E4DC] rounded-xl transition-all flex items-center gap-1.5 shadow-2xs"
            title="Toggle projection zoom view"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isCentered ? 'Standard View' : 'Centered Focus'}</span>
          </button>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative bg-[#F4EFE6] flex items-center justify-center p-2 overflow-hidden">
        <svg
          ref={svgRef}
          viewBox="0 0 800 380"
          className="w-full h-auto max-h-[340px] select-none rounded-xl"
        />

        {/* Flight Badge Floating Overlay */}
        <div className="absolute top-4 left-4 bg-white/95 border border-[#EFECE6] backdrop-blur-md rounded-xl p-3 shadow-md text-xs space-y-1 font-mono">
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

        {/* Legend */}
        <div className="absolute bottom-3 right-4 bg-white/90 border border-[#EFECE6] backdrop-blur-sm rounded-xl px-3 py-1.5 text-[10px] font-mono text-[#8C8279] flex items-center gap-3 shadow-xs">
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
