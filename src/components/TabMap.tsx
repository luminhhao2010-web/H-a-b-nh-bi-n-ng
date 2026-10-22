import React, { useEffect, useRef, useState } from 'react';
import { MAP_MARKERS, BIEN_DONG_CENTER } from '../data/mapData';
import { MapMarkerItem, MarkerCategory } from '../types';
import { MascotKienSang } from './MascotKienSang';
import { 
  Compass, 
  Layers, 
  MapPin, 
  Anchor, 
  Handshake, 
  Droplet, 
  Info, 
  ShieldCheck, 
  Sparkles, 
  Coins, 
  CheckCircle2, 
  X 
} from 'lucide-react';
import { playTingTingSound, playClickSound } from '../utils/audio';

// Leaflet is imported dynamically or via window.L
import L from 'leaflet';

interface TabMapProps {
  visitedMarkers: string[];
  onVisitMarker: (markerId: string) => void;
  onRewardCoins?: (amount: number, id: string) => void;
}

export const TabMap: React.FC<TabMapProps> = ({ visitedMarkers, onVisitMarker }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const overlaysLayerGroupRef = useRef<L.LayerGroup | null>(null);

  const [activeCategory, setActiveCategory] = useState<MarkerCategory | 'all'>('all');
  const [selectedMarker, setSelectedMarker] = useState<MapMarkerItem | null>(null);
  const [mapType, setMapType] = useState<'ocean' | 'satellite'>('ocean');

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Create Map với phạm vi mở rộng, zoom mượt mà
    const map = L.map(mapContainerRef.current, {
      center: [BIEN_DONG_CENTER.lat, BIEN_DONG_CENTER.lng],
      zoom: 5.5,
      minZoom: 3,
      maxZoom: 18,
      zoomControl: false,
    });

    // Custom Zoom control at top right
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Attribution
    map.attributionControl.setPrefix('Bản đồ Biển Đông • Chuyên đề Địa lí 11');

    mapInstanceRef.current = map;
    markersLayerGroupRef.current = L.layerGroup().addTo(map);
    overlaysLayerGroupRef.current = L.layerGroup().addTo(map);

    // Initial base tile layer (Đại dương)
    updateBaseTile('ocean', map);

    // Add maritime zones and agreements overlays
    addMaritimeOverlays();

    // Clean up
    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Base Tile Layer
  const updateBaseTile = (type: 'ocean' | 'satellite', mapObj?: L.Map) => {
    const map = mapObj || mapInstanceRef.current;
    if (!map) return;

    // Remove existing tile layers
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    let tileUrl = '';
    let attribution = '';

    if (type === 'satellite') {
      tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      attribution = 'Tiles &copy; Esri &mdash; Earthstar Geographics';
    } else {
      tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}';
      attribution = 'Tiles &copy; Esri World Ocean Base';
    }

    L.tileLayer(tileUrl, {
      maxZoom: 18,
      attribution,
    }).addTo(map);
  };

  // Add Special Legal & Agreement Overlays
  const addMaritimeOverlays = () => {
    const overlayGroup = overlaysLayerGroupRef.current;
    if (!overlayGroup) return;
    overlayGroup.clearLayers();

    // 1. Vùng đánh cá chung Vịnh Bắc Bộ (Hiệp định 25/12/2000)
    // Giới hạn từ đường đóng cửa vịnh đến vĩ tuyến 20°B, cách đường phân định 30.5 hải lý mỗi bên
    const tonkinFishingPolygon = L.polygon([
      [20.0, 107.0],
      [20.0, 108.6],
      [18.0, 107.8],
      [17.4, 107.3],
      [17.4, 106.8],
      [18.5, 106.5],
    ], {
      color: '#00E5FF',
      weight: 2,
      dashArray: '5, 8',
      fillColor: '#00E5FF',
      fillOpacity: 0.15,
    });
    tonkinFishingPolygon.bindTooltip('Vùng Đánh Cá Chung Vịnh Bắc Bộ (Hiệp định 25/12/2000)', {
      sticky: true,
      className: 'bg-slate-900/90 text-cyan-300 font-bold border border-cyan-400 text-xs px-2 py-1 rounded shadow-lg'
    });
    overlayGroup.addLayer(tonkinFishingPolygon);

    // 2. Tuyến vận tải hàng hải quốc tế qua Biển Đông
    const shippingRoute = L.polyline([
      [1.3, 103.8],   // Singapore
      [4.0, 105.5],
      [8.0, 109.5],
      [12.5, 112.5],
      [16.5, 116.0],
      [20.5, 119.5],  // Eo biển Đài Loan / Luzon
    ], {
      color: '#FFD700',
      weight: 2.5,
      dashArray: '6, 10',
      opacity: 0.8,
    });
    shippingRoute.bindTooltip('Tuyến Hàng Hải Quốc Tế Huyết Mạch (Thái Bình Dương - Ấn Độ Dương)', {
      sticky: true,
      className: 'bg-slate-900/90 text-yellow-300 font-bold border border-yellow-400 text-xs px-2 py-1 rounded shadow-lg'
    });
    overlayGroup.addLayer(shippingRoute);

    // 3. Vùng nước lịch sử Việt Nam - Campuchia (1982)
    const historicWaters = L.polygon([
      [10.3, 103.5],
      [10.4, 104.2],
      [9.8, 103.9],
      [9.7, 103.4],
    ], {
      color: '#A855F7',
      weight: 2,
      dashArray: '4, 6',
      fillColor: '#A855F7',
      fillOpacity: 0.18,
    });
    historicWaters.bindTooltip('Vùng Nước Lịch Sử Việt Nam - Campuchia (Hiệp định 1982)', {
      sticky: true,
      className: 'bg-slate-900/90 text-purple-300 font-bold border border-purple-400 text-xs px-2 py-1 rounded shadow-lg'
    });
    overlayGroup.addLayer(historicWaters);
  };

  // Render Markers on Map based on filter
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = markersLayerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    const filtered = activeCategory === 'all' 
      ? MAP_MARKERS 
      : MAP_MARKERS.filter(m => m.category === activeCategory);

    filtered.forEach((markerData) => {
      const isVisited = visitedMarkers.includes(markerData.id);
      
      // Determine Icon Style based on category & sovereignty
      let iconHtml = '';
      let markerColor = '#00E5FF';
      let iconSymbol = '📍';

      if (markerData.category === 'sovereignty') {
        markerColor = '#EF4444'; // Red sovereignty
        iconSymbol = '⭐';
      } else if (markerData.category === 'cooperation') {
        markerColor = '#10B981'; // Green cooperation
        iconSymbol = '🤝';
      } else if (markerData.category === 'ports') {
        markerColor = '#3B82F6'; // Blue ports
        iconSymbol = '⚓';
      } else if (markerData.category === 'resources') {
        markerColor = '#F59E0B'; // Amber resources
        iconSymbol = '🛢️';
      }

      iconHtml = `
        <div class="relative flex items-center justify-center transform transition-transform duration-300 hover:scale-125 cursor-pointer group">
          <div class="absolute -inset-1.5 rounded-full blur-sm opacity-70 animate-pulse" style="background-color: ${markerColor}"></div>
          <div class="relative w-8 h-8 rounded-full flex items-center justify-center border-2 border-white shadow-xl text-sm" style="background-color: ${markerColor}">
            ${iconSymbol}
          </div>
          ${markerData.category === 'sovereignty' ? `
            <div class="absolute -top-6 whitespace-nowrap bg-red-600 text-white font-extrabold text-[11px] px-2 py-0.5 rounded shadow-lg border border-yellow-300 pointer-events-none">
              ${markerData.name} (Việt Nam)
            </div>
          ` : ''}
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: iconHtml,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([markerData.lat, markerData.lng], { icon: customIcon });

      // Click Event
      marker.on('click', () => {
        playClickSound();
        setSelectedMarker(markerData);
        if (!visitedMarkers.includes(markerData.id)) {
          onVisitMarker(markerData.id);
          playTingTingSound();
        }
      });

      // Hover Tooltip
      marker.bindTooltip(`
        <div class="font-bold text-xs text-white">${markerData.name}</div>
        <div class="text-[10px] text-cyan-200">${markerData.subtitle}</div>
        ${markerData.sovereigntyNotice ? `<div class="text-[10px] text-red-300 font-semibold mt-0.5">${markerData.sovereigntyNotice}</div>` : ''}
      `, {
        direction: 'top',
        offset: [0, -14],
        className: 'bg-slate-900/95 border border-cyan-500/50 p-2 rounded-lg shadow-xl'
      });

      layerGroup.addLayer(marker);
    });
  }, [activeCategory, visitedMarkers, onVisitMarker]);

  // Quick Map Navigation Helper
  const flyToLocation = (lat: number, lng: number, zoom: number = 7) => {
    playClickSound();
    mapInstanceRef.current?.flyTo([lat, lng], zoom, { duration: 1.2 });
  };

  return (
    <div className="relative w-full h-[calc(100vh-140px)] min-h-[580px] flex flex-col bg-[#F0F6FA] overflow-hidden">
      {/* Map Control Bar / Quick Filters */}
      <div className="z-20 bg-white/95 border-b border-[#CBE2EE] px-3 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-2 backdrop-blur-md shadow-sm">
        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <span className="text-xs font-bold text-[#183E65] mr-1 hidden sm:inline flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-[#287BA6]" /> Lớp hiển thị:
          </span>
          {[
            { id: 'all', label: 'Tất cả', count: MAP_MARKERS.length },
            { id: 'sovereignty', label: 'Chủ quyền Hoàng Sa - Trường Sa', count: 2 },
            { id: 'cooperation', label: 'Hợp tác Hòa bình (Vịnh Bắc Bộ, v.v.)', count: 4 },
            { id: 'ports', label: 'Cảng biển & Tuyến Hàng hải', count: 4 },
            { id: 'resources', label: 'Tài nguyên & Thủy sản', count: 2 },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => { playClickSound(); setActiveCategory(cat.id as any); }}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all whitespace-nowrap shadow-xs ${
                activeCategory === cat.id
                  ? 'bg-[#287BA6] text-white border-[#287BA6] font-bold shadow-md'
                  : 'bg-[#F0F7FB] border-[#D0E4F0] text-[#183E65] hover:bg-[#E1EFF7] hover:border-[#3897C0]'
              }`}
            >
              {cat.label} ({cat.count})
            </button>
          ))}
        </div>

        {/* Quick Zoom Buttons & Map Tiles */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Tile Selector */}
          <div className="flex items-center rounded-lg bg-[#F0F7FB] p-0.5 border border-[#CBE2EE] text-xs">
            <button
              onClick={() => { playClickSound(); setMapType('ocean'); updateBaseTile('ocean'); }}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                mapType === 'ocean' ? 'bg-[#287BA6] text-white font-bold shadow-sm' : 'text-[#517696] hover:text-[#102A45]'
              }`}
            >
              Đại dương
            </button>
            <button
              onClick={() => { playClickSound(); setMapType('satellite'); updateBaseTile('satellite'); }}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                mapType === 'satellite' ? 'bg-[#287BA6] text-white font-bold shadow-sm' : 'text-[#517696] hover:text-[#102A45]'
              }`}
            >
              Vệ tinh
            </button>
          </div>

          {/* Quick Focus Landmarks */}
          <button
            onClick={() => flyToLocation(16.5, 112.0, 7)}
            className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-800 text-xs font-bold transition-all shadow-xs"
            title="Đến Quần đảo Hoàng Sa (TP. Đà Nẵng)"
          >
            Hoàng Sa
          </button>
          <button
            onClick={() => flyToLocation(9.0, 113.5, 7)}
            className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-800 text-xs font-bold transition-all shadow-xs"
            title="Đến Quần đảo Trường Sa (Tỉnh Khánh Hòa)"
          >
            Trường Sa
          </button>
          <button
            onClick={() => flyToLocation(19.5, 107.5, 6)}
            className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold transition-all hidden md:inline shadow-xs"
            title="Đến Vịnh Bắc Bộ (Hiệp định 2000)"
          >
            Vịnh Bắc Bộ
          </button>
          <button
            onClick={() => flyToLocation(BIEN_DONG_CENTER.lat, BIEN_DONG_CENTER.lng, 5)}
            className="px-2.5 py-1 rounded-lg bg-white hover:bg-[#F0F7FB] border border-[#CBE2EE] text-[#183E65] text-xs font-semibold transition-all shadow-xs"
            title="Xem toàn cảnh Biển Đông"
          >
            Toàn cảnh
          </button>
        </div>
      </div>

      {/* Map Display Frame */}
      <div className="relative flex-1 w-full h-full">
        {/* Leaflet Map DOM Element */}
        <div ref={mapContainerRef} className="w-full h-full z-10" />

        {/* Floating Guide Badge with Mascot Kiến Sáng */}
        <div className="absolute bottom-4 left-4 z-20 bg-white/95 border border-[#CBE2EE] rounded-2xl p-3 shadow-xl backdrop-blur-md max-w-xs pointer-events-auto flex items-center gap-3">
          <div className="flex-shrink-0">
            <MascotKienSang size={50} expression="waving" />
          </div>
          <div className="text-xs text-[#102A45]">
            <div className="font-bold text-[#183E65] flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Bản đồ số tương tác
            </div>
            <p className="text-[11px] text-[#517696] mt-0.5">
              Bấm vào các điểm Marker trên bản đồ để mở tư liệu Chuyên đề Địa lí 11 và nhận <span className="text-amber-600 font-bold">+5 Xu</span>!
            </p>
          </div>
        </div>

        {/* Legend Box */}
        <div className="absolute top-4 left-4 z-20 bg-white/95 border border-[#CBE2EE] rounded-xl p-3 shadow-xl backdrop-blur-md hidden sm:block text-xs">
          <div className="font-bold text-[#102A45] mb-2 flex items-center gap-1.5 border-b border-[#E1EFF7] pb-1">
            <Compass className="w-3.5 h-3.5 text-[#287BA6]" /> Chú giải Địa danh & Pháp lý
          </div>
          <div className="space-y-1.5 text-[11px]">
            <div className="flex items-center gap-2 text-rose-700">
              <span className="w-3 h-3 rounded-full bg-rose-500 border border-white shadow-xs"></span>
              <span className="font-semibold">Chủ quyền Hoàng Sa & Trường Sa (Việt Nam)</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-700">
              <span className="w-3 h-3 rounded-full bg-emerald-500 border border-white shadow-xs"></span>
              <span>Vùng Hợp tác Hòa bình (Vịnh Bắc Bộ 2000)</span>
            </div>
            <div className="flex items-center gap-2 text-[#183E65]">
              <span className="w-3 h-3 rounded-full bg-[#287BA6] border border-white shadow-xs"></span>
              <span>Hệ thống Cảng biển lớn (SGK Địa lí 11)</span>
            </div>
            <div className="flex items-center gap-2 text-amber-700">
              <span className="w-3 h-3 rounded-full bg-amber-500 border border-white shadow-xs"></span>
              <span>Tài nguyên Dầu khí & Ngư trường</span>
            </div>
            <div className="flex items-center gap-2 text-amber-600 pt-1 border-t border-[#E1EFF7]">
              <span className="w-4 h-0.5 bg-amber-400 border-dashed"></span>
              <span>Tuyến hàng hải quốc tế huyết mạch</span>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Marker Detail Modal / Drawer */}
      {selectedMarker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-white border border-[#CBE2EE] rounded-2xl shadow-2xl overflow-hidden text-[#102A45] max-h-[90vh] flex flex-col">
            {/* Top Accent bar */}
            <div className={`h-2 ${
              selectedMarker.category === 'sovereignty' 
                ? 'bg-gradient-to-r from-red-500 via-yellow-400 to-red-600' 
                : 'bg-gradient-to-r from-[#287BA6] via-[#3897C0] to-[#58B2D7]'
            }`} />

            {/* Header */}
            <div className="p-5 sm:p-6 border-b border-[#E1EFF7] flex items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    selectedMarker.category === 'sovereignty'
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : 'bg-[#E1EFF7] text-[#183E65] border border-[#BCE0F1]'
                  }`}>
                    {selectedMarker.badge}
                  </span>
                  <span className="text-xs text-[#517696]">
                    Tọa độ: {selectedMarker.lat}°B, {selectedMarker.lng}°Đ
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-[#102A45] flex items-center gap-2">
                  {selectedMarker.name}
                  {selectedMarker.category === 'sovereignty' && (
                    <span className="text-yellow-400 text-base">🇻🇳</span>
                  )}
                </h3>
                {selectedMarker.sovereigntyNotice && (
                  <p className="text-sm font-bold text-red-600 mt-0.5">
                    {selectedMarker.sovereigntyNotice}
                  </p>
                )}
                <p className="text-xs text-[#287BA6] mt-1 font-medium">
                  {selectedMarker.subtitle}
                </p>
              </div>

              <button
                onClick={() => { playClickSound(); setSelectedMarker(null); }}
                className="text-[#517696] hover:text-[#102A45] p-1.5 rounded-lg hover:bg-[#F0F7FB] transition-colors"
                title="Đóng"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Scrollable Content Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-sm no-scrollbar">
              {/* Overview Card */}
              <div className="p-4 rounded-xl bg-[#F8FBFE] border border-[#D5E6F1]">
                <p className="text-[#183E65] leading-relaxed">
                  {selectedMarker.description}
                </p>
              </div>

              {/* Grid of Details based on Textbook */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-[#F8FBFE] border border-[#D5E6F1]">
                  <div className="text-xs font-bold text-[#183E65] mb-1 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#287BA6]" /> Vị trí địa lí & Không gian
                  </div>
                  <p className="text-xs text-[#517696] leading-relaxed">
                    {selectedMarker.details.geography}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#F8FBFE] border border-[#D5E6F1]">
                  <div className="text-xs font-bold text-emerald-800 mb-1 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Cơ sở Pháp lý & UNCLOS 1982
                  </div>
                  <p className="text-xs text-[#517696] leading-relaxed">
                    {selectedMarker.details.legalStatus}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#F8FBFE] border border-[#D5E6F1]">
                  <div className="text-xs font-bold text-amber-800 mb-1 flex items-center gap-1.5">
                    <Droplet className="w-3.5 h-3.5 text-amber-600" /> Tiềm năng Kinh tế Biển
                  </div>
                  <p className="text-xs text-[#517696] leading-relaxed">
                    {selectedMarker.details.economicPotential}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#F8FBFE] border border-[#D5E6F1]">
                  <div className="text-xs font-bold text-purple-800 mb-1 flex items-center gap-1.5">
                    <Handshake className="w-3.5 h-3.5 text-purple-600" /> Ý nghĩa Hợp tác Hòa bình
                  </div>
                  <p className="text-xs text-[#517696] leading-relaxed">
                    {selectedMarker.details.peacefulCooperation}
                  </p>
                </div>
              </div>

              {/* Key Facts from Textbook */}
              {selectedMarker.details.keyFacts.length > 0 && (
                <div className="p-4 rounded-xl bg-[#EBF5FB] border border-[#BCE0F1]">
                  <div className="text-xs font-bold text-[#183E65] mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#287BA6]" /> Dữ liệu trọng tâm cần nhớ (SGK Địa lí 11):
                  </div>
                  <ul className="space-y-1.5">
                    {selectedMarker.details.keyFacts.map((fact, idx) => (
                      <li key={idx} className="text-xs text-[#183E65] flex items-start gap-2">
                        <span className="text-[#287BA6] font-bold">•</span>
                        <span>{fact}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Kiến Sáng Note */}
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-3">
                <MascotKienSang size={46} expression="thinking" />
                <div className="text-xs text-amber-900">
                  <span className="font-bold">Lời khuyên từ Kiến Sáng: </span>
                  Hãy ghi nhớ địa danh này để chuẩn bị làm tốt các câu hỏi trong Trạm Hải Đăng trắc nghiệm nhé!
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[#E1EFF7] bg-[#F8FBFE] flex items-center justify-between">
              <div className="text-xs text-emerald-700 flex items-center gap-1.5 font-semibold">
                <Coins className="w-4 h-4 text-amber-500" /> Đã ghi nhận khám phá (+5 Xu thưởng)
              </div>
              <button
                onClick={() => { playClickSound(); setSelectedMarker(null); }}
                className="px-5 py-2 rounded-xl bg-[#287BA6] hover:bg-[#1F5E86] text-white font-bold text-xs transition-colors shadow-sm"
              >
                Tiếp tục quan sát bản đồ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
