import type { ItemBox } from '../utils/sliderMath';

export type HeroCanonGameId =
  | 'fnaf-1'
  | 'fnaf-2'
  | 'fnaf-3'
  | 'fnaf-4'
  | 'fnaf-sl'
  | 'fnaf-ffps'
  | 'fnaf-ucn'
  | 'fnaf-hw'
  | 'fnaf-sb'
  | 'fnaf-ruin'
  | 'fnaf-hw2'
  | 'fnaf-itp'
  | 'fnaf-sotm';

export interface PropPlacement {
  id: string;
  label: string;
  item: 1 | 2 | 3;
  x: number;
  y: number;
  w: number;
  rotation: number;
  mirror: boolean;
  layer: 'fruit' | 'corner';
  bobDuration: number;
  bobDelay: number;
}

export interface CenterpiecePlacement {
  x: number;
  y: number;
  w: number;
}

export interface HeroGameSlide {
  id: HeroCanonGameId;
  tabLabel: string;
  word: string;
  fullTitle: string;
  subtitle: string;
  backdrop: string;
  accent: string;
  sheetUrl: string;
  hasCenterCrosshair: boolean;
  centerpiece: CenterpiecePlacement;
  props: PropPlacement[];
  defaultBoxes: [ItemBox, ItemBox, ItemBox, ItemBox];
}

function buildOrbitProps(
  prefix: string,
  items: {
    tl: [1 | 2 | 3, string, number];
    ur: [1 | 2 | 3, string, number];
    ml: [1 | 2 | 3, string, number];
    fr: [1 | 2 | 3, string, number];
    lr: [1 | 2 | 3, string, number];
    cbl: [1 | 2 | 3, string, number];
    ctr: [1 | 2 | 3, string, number];
  }
): PropPlacement[] {
  return [
    {
      id: `${prefix}-tl`,
      label: items.tl[1],
      item: items.tl[0],
      x: 368,
      y: 168,
      w: items.tl[2],
      rotation: -14,
      mirror: false,
      layer: 'fruit',
      bobDuration: 3.7,
      bobDelay: -1.0,
    },
    {
      id: `${prefix}-ur`,
      label: items.ur[1],
      item: items.ur[0],
      x: 948,
      y: 218,
      w: items.ur[2],
      rotation: 12,
      mirror: false,
      layer: 'fruit',
      bobDuration: 4.3,
      bobDelay: -2.6,
    },
    {
      id: `${prefix}-ml`,
      label: items.ml[1],
      item: items.ml[0],
      x: 292,
      y: 458,
      w: items.ml[2],
      rotation: -9,
      mirror: false,
      layer: 'fruit',
      bobDuration: 3.8,
      bobDelay: -0.7,
    },
    {
      id: `${prefix}-fr`,
      label: items.fr[1],
      item: items.fr[0],
      x: 1228,
      y: 445,
      w: items.fr[2],
      rotation: 16,
      mirror: true,
      layer: 'fruit',
      bobDuration: 4.7,
      bobDelay: -3.2,
    },
    {
      id: `${prefix}-lr`,
      label: items.lr[1],
      item: items.lr[0],
      x: 952,
      y: 586,
      w: items.lr[2],
      rotation: 20,
      mirror: true,
      layer: 'fruit',
      bobDuration: 4.1,
      bobDelay: -1.8,
    },
    {
      id: `${prefix}-corner-bl`,
      label: items.cbl[1],
      item: items.cbl[0],
      x: -14,
      y: 568,
      w: items.cbl[2],
      rotation: 7,
      mirror: false,
      layer: 'corner',
      bobDuration: 4.9,
      bobDelay: -2.1,
    },
    {
      id: `${prefix}-corner-tr`,
      label: items.ctr[1],
      item: items.ctr[0],
      x: 1276,
      y: 34,
      w: items.ctr[2],
      rotation: -14,
      mirror: false,
      layer: 'corner',
      bobDuration: 4.6,
      bobDelay: -3.5,
    },
  ];
}

const DEFAULT_FALLBACK_BOXES: [ItemBox, ItemBox, ItemBox, ItemBox] = [
  { bx: 24, by: 20, bw: 465, bh: 475 },
  { bx: 536, by: 24, bw: 460, bh: 460 },
  { bx: 24, by: 536, bw: 460, bh: 460 },
  { bx: 536, by: 536, bw: 460, bh: 460 },
];

export const HERO_GAMES: readonly HeroGameSlide[] = [
  {
    id: 'fnaf-1',
    tabLabel: 'FNaF 1',
    word: 'FNAF 1',
    fullTitle: "Five Nights at Freddy's",
    subtitle: '2014 · Scott Cawthon · İlk Gece Vardiyası',
    backdrop: '#3B2118',
    accent: '#e59a3c',
    sheetUrl: '/src/assets/images/fnaf_freddy_sheet_1795291590415.jpg',
    hasCenterCrosshair: false,
    centerpiece: { x: 470, y: 205, w: 500 },
    defaultBoxes: [
      { bx: 20, by: 36, bw: 480, bh: 465 },
      { bx: 615, by: 85, bw: 270, bh: 375 },
      { bx: 85, by: 580, bw: 345, bh: 320 },
      { bx: 630, by: 590, bw: 265, bh: 320 },
    ],
    props: buildOrbitProps('fnaf1', {
      tl: [2, 'Cracked Top Hat', 132],
      ur: [1, 'Haunted Stage Mic', 124],
      ml: [3, 'Endoskeleton Bear Jaw', 136],
      fr: [1, 'Tangled Mic', 128],
      lr: [2, 'Tilted Top Hat', 130],
      cbl: [3, 'Blurred Endoskeleton Jaw', 248],
      ctr: [1, 'Blurred Haunted Mic', 198],
    }),
  },
  {
    id: 'fnaf-2',
    tabLabel: 'FNaF 2',
    word: 'FNAF 2',
    fullTitle: "Five Nights at Freddy's 2",
    subtitle: '2014 · Scott Cawthon · 1987 Toy Bonnie Vardiyası',
    backdrop: '#1A344D',
    accent: '#38BDF8',
    sheetUrl: '/src/assets/images/fnaf_toy_bonnie_sheet_1795293466699.jpg',
    hasCenterCrosshair: true,
    centerpiece: { x: 500, y: 145, w: 440 },
    defaultBoxes: DEFAULT_FALLBACK_BOXES,
    props: buildOrbitProps('fnaf2', {
      tl: [2, 'Empty Freddy Mask', 132],
      ur: [1, 'Red Flying-V Guitar', 152],
      ml: [3, 'Night Guard Flashlight', 134],
      fr: [1, 'Stage Guitar', 144],
      lr: [2, 'Decoy Freddy Head', 136],
      cbl: [1, 'Blurred Toy Bonnie Guitar', 250],
      ctr: [3, 'Blurred Security Flashlight', 205],
    }),
  },
  {
    id: 'fnaf-3',
    tabLabel: 'FNaF 3',
    word: 'FNAF 3',
    fullTitle: "Five Nights at Freddy's 3",
    subtitle: "2015 · Scott Cawthon · Fazbear's Fright & Springtrap",
    backdrop: '#2B361C',
    accent: '#3ba56b',
    sheetUrl: '/src/assets/images/fnaf_springtrap_sheet_1795293467114.jpg',
    hasCenterCrosshair: false,
    centerpiece: { x: 472, y: 185, w: 496 },
    defaultBoxes: DEFAULT_FALLBACK_BOXES,
    props: buildOrbitProps('fnaf3', {
      tl: [1, 'Phantom Puppet Mask', 124],
      ur: [2, 'Maintenance CRT Monitor', 142],
      ml: [3, 'Springlock Coil & Torn Ear', 132],
      fr: [1, 'Charred Puppet Shell', 124],
      lr: [2, 'Camera Feed Monitor', 138],
      cbl: [2, 'Blurred Security Monitor', 248],
      ctr: [1, 'Blurred Phantom Mask', 202],
    }),
  },
  {
    id: 'fnaf-4',
    tabLabel: 'FNaF 4',
    word: 'FNAF 4',
    fullTitle: "Five Nights at Freddy's 4",
    subtitle: '2015 · Scott Cawthon · Nightmare Fredbear Kâbusu',
    backdrop: '#3A1624',
    accent: '#e59a3c',
    sheetUrl: '/src/assets/images/fnaf_nightmare_fredbear_sheet_1795293467184.jpg',
    hasCenterCrosshair: true,
    centerpiece: { x: 482, y: 175, w: 476 },
    defaultBoxes: DEFAULT_FALLBACK_BOXES,
    props: buildOrbitProps('fnaf4', {
      tl: [1, 'Tattered Purple Top Hat', 130],
      ur: [2, 'Steel Nightmare Jaw', 144],
      ml: [3, 'Bedroom Brass Flashlight', 136],
      fr: [1, 'Fredbear Stage Hat', 132],
      lr: [2, 'Razor Endo Jaw', 138],
      cbl: [2, 'Blurred Nightmare Jaw', 252],
      ctr: [3, 'Blurred Brass Flashlight', 204],
    }),
  },
  {
    id: 'fnaf-sl',
    tabLabel: 'SL',
    word: 'SISTER',
    fullTitle: "Five Nights at Freddy's: Sister Location",
    subtitle: "2016 · Scott Cawthon · Circus Baby's Yer Altı Tesisi",
    backdrop: '#3B1726',
    accent: '#e46ca6',
    sheetUrl: '/src/assets/images/fnaf_circus_baby_sheet_1795293466441.jpg',
    hasCenterCrosshair: true,
    centerpiece: { x: 458, y: 198, w: 524 },
    defaultBoxes: DEFAULT_FALLBACK_BOXES,
    props: buildOrbitProps('fnafsl', {
      tl: [1, 'HandUnit Keypad', 132],
      ur: [2, 'Circus Auditorium Mic', 110],
      ml: [3, 'Bidybab Porcelain Mask', 134],
      fr: [1, 'Angled HandUnit', 128],
      lr: [3, 'Under-Desk Faceplate', 132],
      cbl: [1, 'Blurred HandUnit', 242],
      ctr: [2, 'Blurred Stage Microphone', 194],
    }),
  },
  {
    id: 'fnaf-ffps',
    tabLabel: 'FFPS',
    word: 'FFPS',
    fullTitle: "Freddy Fazbear's Pizzeria Simulator",
    subtitle: '2017 · Scott Cawthon · Büyük Kapanış Tesisi',
    backdrop: '#3D2514',
    accent: '#e59a3c',
    sheetUrl: '/src/assets/images/fnaf_freddy_sheet_1795291590415.jpg',
    hasCenterCrosshair: false,
    centerpiece: { x: 470, y: 205, w: 500 },
    defaultBoxes: DEFAULT_FALLBACK_BOXES,
    props: buildOrbitProps('fnafffps', {
      tl: [2, 'Fazbear Owner Hat', 132],
      ur: [1, 'Showtime Stage Mic', 124],
      ml: [3, 'Salvage Alley Jaw', 136],
      fr: [1, 'Salvaged Microphone', 128],
      lr: [2, 'Burnt Top Hat', 130],
      cbl: [3, 'Blurred Salvage Jaw', 248],
      ctr: [2, 'Blurred Top Hat', 202],
    }),
  },
  {
    id: 'fnaf-ucn',
    tabLabel: 'UCN',
    word: 'UCN',
    fullTitle: 'Ultimate Custom Night',
    subtitle: '2018 · Scott Cawthon · 50 Animatronik Ofis Cehennemi',
    backdrop: '#25132E',
    accent: '#c93b3b',
    sheetUrl: '/src/assets/images/fnaf_nightmare_fredbear_sheet_1795293467184.jpg',
    hasCenterCrosshair: true,
    centerpiece: { x: 482, y: 175, w: 476 },
    defaultBoxes: DEFAULT_FALLBACK_BOXES,
    props: buildOrbitProps('fnafucn', {
      tl: [2, '50/20 Endo Jaw', 142],
      ur: [1, 'Violet Nightmare Hat', 132],
      ml: [3, 'Office Survival Flashlight', 134],
      fr: [2, 'Shadow Trap Jaw', 138],
      lr: [1, 'Tattered Crown Hat', 132],
      cbl: [3, 'Blurred Office Flashlight', 246],
      ctr: [1, 'Blurred Violet Hat', 202],
    }),
  },
  {
    id: 'fnaf-hw',
    tabLabel: 'HW',
    word: 'HELP WANTED',
    fullTitle: "Five Nights at Freddy's: Help Wanted",
    subtitle: '2019 · Steel Wool Studios · Sanal Fazbear Deneyimi',
    backdrop: '#271B45',
    accent: '#a78bfa',
    sheetUrl: '/src/assets/images/fnaf_bonnie_sheet_1795291592373.jpg',
    hasCenterCrosshair: false,
    centerpiece: { x: 486, y: 148, w: 468 },
    defaultBoxes: [
      { bx: 45, by: 10, bw: 425, bh: 490 },
      { bx: 535, by: 25, bw: 445, bh: 470 },
      { bx: 145, by: 535, bw: 255, bh: 425 },
      { bx: 615, by: 575, bw: 270, bh: 345 },
    ],
    props: buildOrbitProps('fnafhw', {
      tl: [2, 'Parts & Service Ear', 118],
      ur: [1, 'Crimson Guitar VR', 158],
      ml: [3, 'Repair Endoskeleton', 138],
      fr: [2, 'Glitch Hinge Ear', 118],
      lr: [3, 'Diagnostic Endo Head', 132],
      cbl: [1, 'Blurred Crimson Guitar', 256],
      ctr: [3, 'Blurred Endo Head', 205],
    }),
  },
  {
    id: 'fnaf-sb',
    tabLabel: 'SB',
    word: 'BREACH',
    fullTitle: "Five Nights at Freddy's: Security Breach",
    subtitle: '2021 · Steel Wool Studios · Mega Pizzaplex Kaçışı',
    backdrop: '#18294A',
    accent: '#38bdf8',
    sheetUrl: '/src/assets/images/fnaf_glamrock_freddy_sheet_1795293467520.jpg',
    hasCenterCrosshair: true,
    centerpiece: { x: 478, y: 175, w: 484 },
    defaultBoxes: DEFAULT_FALLBACK_BOXES,
    props: buildOrbitProps('fnafsb', {
      tl: [2, 'Faz-Watch & Faz-Cam', 136],
      ur: [1, 'Neon Fazerblaster', 154],
      ml: [3, 'Pizzaplex VIP Pass', 142],
      fr: [1, 'Laser Fazerblaster', 148],
      lr: [2, 'Gregory Faz-Watch', 134],
      cbl: [1, 'Blurred Fazerblaster', 252],
      ctr: [3, 'Blurred VIP Access', 210],
    }),
  },
  {
    id: 'fnaf-ruin',
    tabLabel: 'RUIN',
    word: 'RUIN',
    fullTitle: 'Security Breach: RUIN',
    subtitle: '2023 · Steel Wool Studios · Yıkılmış Pizzaplex DLC',
    backdrop: '#21222C',
    accent: '#a78bfa',
    sheetUrl: '/src/assets/images/fnaf_glamrock_freddy_sheet_1795293467520.jpg',
    hasCenterCrosshair: true,
    centerpiece: { x: 478, y: 175, w: 484 },
    defaultBoxes: DEFAULT_FALLBACK_BOXES,
    props: buildOrbitProps('fnafruin', {
      tl: [3, 'Ruined Superstar Shades', 140],
      ur: [2, 'Damaged Faz-Watch', 136],
      ml: [1, 'Decommissioned Blaster', 150],
      fr: [2, 'Security Faz-Cam', 134],
      lr: [3, 'Ruin VIP Token', 136],
      cbl: [2, 'Blurred Faz-Cam', 248],
      ctr: [1, 'Blurred Blaster', 212],
    }),
  },
  {
    id: 'fnaf-hw2',
    tabLabel: 'HW 2',
    word: 'HW 2',
    fullTitle: "Five Nights at Freddy's: Help Wanted 2",
    subtitle: '2023 · Steel Wool Studios · Fazbear Eğlence Vardiyası',
    backdrop: '#1B2D3E',
    accent: '#66c0f4',
    sheetUrl: '/src/assets/images/fnaf_circus_baby_sheet_1795293466441.jpg',
    hasCenterCrosshair: true,
    centerpiece: { x: 458, y: 198, w: 524 },
    defaultBoxes: DEFAULT_FALLBACK_BOXES,
    props: buildOrbitProps('fnafhw2', {
      tl: [2, 'Backstage Chrome Mic', 108],
      ur: [1, 'VR Maintenance Pad', 134],
      ml: [3, 'Mini-Game Porcelain Mask', 132],
      fr: [1, 'HandUnit Terminal', 130],
      lr: [2, 'Showroom Microphone', 108],
      cbl: [3, 'Blurred Doll Mask', 244],
      ctr: [1, 'Blurred Terminal', 202],
    }),
  },
  {
    id: 'fnaf-itp',
    tabLabel: 'ITP',
    word: 'INTO PIT',
    fullTitle: "Five Nights at Freddy's: Into the Pit",
    subtitle: '2024 · Mega Cat Studios · 1985 Top Havuzu Geçidi',
    backdrop: '#422B12',
    accent: '#e59a3c',
    sheetUrl: '/src/assets/images/fnaf_springtrap_sheet_1795293467114.jpg',
    hasCenterCrosshair: false,
    centerpiece: { x: 472, y: 185, w: 496 },
    defaultBoxes: DEFAULT_FALLBACK_BOXES,
    props: buildOrbitProps('fnafitp', {
      tl: [2, '1985 Arcade Monitor', 142],
      ur: [3, 'Springlock Mechanism', 132],
      ml: [1, 'Pizzeria Haunted Mask', 124],
      fr: [2, 'Backroom TV Set', 138],
      lr: [3, 'Severed Rabbit Ear', 130],
      cbl: [3, 'Blurred Springlock Coil', 244],
      ctr: [2, 'Blurred 1985 Monitor', 204],
    }),
  },
  {
    id: 'fnaf-sotm',
    tabLabel: 'SOTM',
    word: 'MIMIC',
    fullTitle: "Five Nights at Freddy's: Secret of the Mimic",
    subtitle: "2025 · Steel Wool Studios · Murray's Costume Manor",
    backdrop: '#3F191E',
    accent: '#E36B74',
    sheetUrl: '/src/assets/images/fnaf_foxy_sheet_1795291590605.jpg',
    hasCenterCrosshair: true,
    centerpiece: { x: 474, y: 175, w: 492 },
    defaultBoxes: [
      { bx: 55, by: 25, bw: 395, bh: 470 },
      { bx: 555, by: 60, bw: 395, bh: 380 },
      { bx: 40, by: 615, bw: 425, bh: 285 },
      { bx: 525, by: 525, bw: 445, bh: 445 },
    ],
    props: buildOrbitProps('fnafsotm', {
      tl: [2, 'Costume Manor Patch', 136],
      ur: [1, 'Prototype Endo Hook', 146],
      ml: [3, '1979 Security Badge', 140],
      fr: [1, 'Workshop Steel Hook', 140],
      lr: [2, 'Stitched Suit Scrap', 138],
      cbl: [1, 'Blurred Endo Hook', 252],
      ctr: [3, 'Blurred Estate Badge', 204],
    }),
  },
];
