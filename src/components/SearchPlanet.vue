<template>
<svg class="search-planet-motion" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" width="136" height="32" viewBox="0 0 136 32" fill="none" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
  <defs>
    <linearGradient :id="planetId" x1="76" y1="8" x2="90" y2="24" gradientUnits="userSpaceOnUse">
      <stop stop-color="#70d9f5"/><stop offset=".5" stop-color="#8b8cf0"/><stop offset="1" stop-color="#c879db"/>
    </linearGradient>
    <linearGradient :id="ringId" x1="65" y1="21" x2="101" y2="11" gradientUnits="userSpaceOnUse">
      <stop stop-color="#f4ac66"/><stop offset=".5" stop-color="#f8d889"/><stop offset="1" stop-color="#f2a1bc"/>
    </linearGradient>
  </defs>
  <circle cx="83" cy="16" r="9" :fill="`url(#${planetId})`" stroke="#8d88dc"/>
  <path d="M78 11c2-2 5-2 7-1" stroke="#d1f5ff" opacity=".8"/>
  <ellipse class="search-planet-ring" cx="83" cy="16" rx="19" ry="4.5" transform="rotate(-22 83 16)" :stroke="`url(#${ringId})`" stroke-width="1.7"/>
  <path class="search-planet-spark" d="M40 8v8m-4-4h8" stroke="#e9b657"/>
  <path class="search-planet-spark search-planet-spark-late" d="M114 17v6m-3-3h6" stroke="#b18ae3"/>
  <path d="M57 23v4m-2-2h4" stroke="#ee9ab5"/>
  <circle cx="56" cy="7" r="1" fill="#67c9d2" stroke="#67c9d2"/>
  <circle cx="108" cy="7" r="1" fill="#e9b657" stroke="#e9b657"/>
  <path d="M14 24c7-6 16-6 23-3M20 8l8 2" stroke="#73bca3" opacity=".65"/>
</svg>
</template>
<script>
let nextId = 0;
export default {
  name: 'SearchPlanet',
  data() { const id = ++nextId; return { planetId: 'search-planet-' + id, ringId: 'search-ring-' + id }; }
};
</script>
<style>
.search-planet-motion { display: block; width: 108px; height: 28px; pointer-events: none; user-select: none; opacity: 1; transition: opacity 180ms ease, transform 180ms ease, width 180ms ease; }
.search-input:not(.has-search-illustration) .search-planet-motion { width: 0; overflow: hidden; opacity: 0; transform: translateX(8px) scale(.92); }
.search-planet-ring { transform-origin: 83px 16px; }
.search-input.has-search-illustration:focus-within .search-planet-ring { animation: search-ring-orbit 1600ms ease-in-out infinite; }
.search-input.has-search-illustration:focus-within .search-planet-spark { animation: search-star-twinkle 1200ms ease-in-out infinite; }
.search-input.has-search-illustration:focus-within .search-planet-spark-late { animation-delay: 350ms; }
@keyframes search-ring-orbit { 0%, 100% { transform: rotate(-22deg) scaleY(1); } 50% { transform: rotate(-8deg) scaleY(.72); } }
@keyframes search-star-twinkle { 0%, 100% { opacity: .35; } 50% { opacity: 1; } }
@media (max-width: 600px) { .search-planet-motion { width: 64px; height: 24px; } }
@media (prefers-reduced-motion: reduce) { .search-planet-motion { transition: none; } .search-input .search-planet-motion .search-planet-ring, .search-input .search-planet-motion .search-planet-spark { animation: none; } }
</style>
