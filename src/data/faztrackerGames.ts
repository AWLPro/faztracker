export type GameCategory = 'official' | 'fangame';
export type GameStatus = 'planned' | 'playing' | 'completed' | 'dropped';

export interface GameThreat {
  name: string;
  counter: string;
}

export interface GameStep {
  id: string;
  label: string;
  done: boolean;
}

export interface TrackerGame {
  id: string;
  catalogCode: string;
  title: string;
  category: GameCategory;
  year: string;
  developer: string;
  steamAppId: string | null;
  steamOwned: boolean;
  accent: string;
  emblem: string;
  objective: string;
  story: string;
  mechanics: string[];
  threats: GameThreat[];
  status: GameStatus;
  manualProgress: number | null;
  rating: number;
  hours: number;
  jumpscares: number;
  completedDate: string;
  customCover: string;
  notes: string;
  steps: GameStep[];
}

export const LORE_TIMELINE = [
  {
    era: '1973 – 1979',
    title: 'Murray’s Costume Manor & The Mimic',
    summary:
      'Fazbear Entertainment öncesi dönemde Edwin Murray’nin atölyesinde üretilen prototip endoskeleton Mimic, taklit öğrenme döngüsüyle tüm seriye yayılan taklitçi tehdidin temelini atar.',
    refGame: 'Secret of the Mimic · Final Nights 4',
  },
  {
    era: '1983',
    title: 'Fredbear’s Family Diner',
    summary:
      'Henry Emily ve William Afton’ın ortaklığıyla kurulan ilk aile restoranında yaylı kilit kostümler sahneye çıkar; Fredbear olayı Fazbear tarihinin ilk büyük kırılmasını başlatır.',
    refGame: "Five Nights at Freddy's 4",
  },
  {
    era: '1985',
    title: 'İlk Kayıp Çocuklar & Top Havuzu',
    summary:
      'Klasik Freddy Fazbear’s Pizza lokasyonunda Gabriel, Jeremy, Susie, Fritz ve Cassidy ortadan kaybolur; ruhları ana animatroniklere bağlanır.',
    refGame: "FNaF: Into the Pit · FNaF 1",
  },
  {
    era: '1987',
    title: 'Yenilenen Pizzacı & The Bite of ’87',
    summary:
      'Yüz tanıma sistemli Toy serisi ile depodaki Withered modeller aynı çatı altında buluşur; Puppet’ın müzik kutusu güvenlik protokolünün merkezine yerleşir.',
    refGame: "Five Nights at Freddy's 2",
  },
  {
    era: '1993',
    title: 'Mike Schmidt’in Gece Vardiyası',
    summary:
      'Kısıtlı elektrik bütçesiyle çalışan eski şubede Freddy, Bonnie, Chica ve Foxy beş gece boyunca ofisi kuşatır.',
    refGame: "Five Nights at Freddy's",
  },
  {
    era: '2023',
    title: 'Fazbear’s Fright & Büyük Kapanış Yangını',
    summary:
      'Otuz yıl sonra açılan korku atraksiyonunda Springtrap ortaya çıkar; ardından Pizzeria Simulator’daki gizli tuzak tesisi tüm kalıntıları ateşe verir.',
    refGame: "FNaF 3 · Pizzeria Simulator",
  },
  {
    era: 'Pizzaplex Çağı',
    title: 'Mega Pizzaplex, Vanny & RUIN',
    summary:
      'Glamrock animatronikleriyle açılan devasa alışveriş merkezinde Gregory’nin kaçışı ve ardından harap tesiste Cassie’nin V.A.N.N.I. maskesiyle kurtarma operasyonu yaşanır.',
    refGame: "Security Breach · RUIN · Help Wanted 2",
  },
] as const;

export const DEFAULT_GAMES: TrackerGame[] = [
  {
    id: 'fnaf-1',
    catalogCode: 'FNAF-01',
    title: "Five Nights at Freddy's",
    category: 'official',
    year: '2014',
    developer: 'Scott Cawthon',
    steamAppId: '319510',
    steamOwned: false,
    accent: '#e59a3c',
    emblem: 'bear',
    objective:
      'Gece 12:00 ile sabah 06:00 arasında sınırlı elektrik gücünü idare ederek güvenlik kameralarından animatronikleri izlemek; kapı ve ışıkları doğru anda kullanıp 5 gece hayatta kalmak.',
    story:
      'Freddy Fazbear’s Pizza’da gece bekçisi Mike Schmidt olarak işe başlarsın. Geceleri serbest dolaşım moduna geçen dört ana maskotun ofise girmesini engellemen gerekir.',
    mechanics: ['Kamera Takibi', 'Enerji Yönetimi', 'Kapı Kontrolü'],
    threats: [
      {
        name: 'Freddy Fazbear',
        counter:
          'Karanlıkta sağ koridordan ilerler; kamerada ona sık sık bakarak hareketini dondur ve sağ kapıyı kontrol et.',
      },
      {
        name: 'Bonnie',
        counter:
          'Sol koridordan gelir; kapı ışığını yakıp kapıda gördüğünde sol kapıyı hemen kapat.',
      },
      {
        name: 'Chica',
        counter:
          'Sağ koridordan ve mutfaktan gelir; kapı ışığında göründüğünde sağ kapıyı kapat.',
      },
      {
        name: 'Foxy',
        counter:
          'Pirate Cove (CAM 1C) kamerasını düzenli kontrol et; perdeden çıkıp koşmaya başlarsa sol kapıyı anında kapat.',
      },
      {
        name: 'Golden Freddy',
        counter:
          'Ofiste belirdiğinde halüsinasyondan kurtulmak için kamerayı hemen açıp kapat.',
      },
    ],
    status: 'planned',
    manualProgress: null,
    rating: 0,
    hours: 0,
    jumpscares: 0,
    completedDate: '',
    customCover: '',
    notes: '',
    steps: [
      { id: 's1', label: 'Night 1', done: false },
      { id: 's2', label: 'Night 2', done: false },
      { id: 's3', label: 'Night 3', done: false },
      { id: 's4', label: 'Night 4', done: false },
      { id: 's5', label: 'Night 5 (Ana Son)', done: false },
      { id: 's6', label: 'Night 6', done: false },
      { id: 's7', label: '4/20 Mode (Custom Night)', done: false },
    ],
  },
  {
    id: 'fnaf-2',
    catalogCode: 'FNAF-02',
    title: "Five Nights at Freddy's 2",
    category: 'official',
    year: '2014',
    developer: 'Scott Cawthon',
    steamAppId: '332800',
    steamOwned: false,
    accent: '#c93b3b',
    emblem: 'mask',
    objective:
      'Ofis kapıları olmadan; Freddy maskesini zamanında takarak, koridora el feneri tutarak ve Puppet’ın müzik kutusunu sürekli kurulu tutarak 11 animatroniği sabah 6’ya kadar durdurmak.',
    story:
      '1987 yılında yenilenen pizzacıda Toy ve eski Withered animatroniklere karşı çok daha yüksek tempolu bir gece vardiyası yürütürsün.',
    mechanics: ['Freddy Maskesi', 'Müzik Kutusu', 'El Feneri'],
    threats: [
      {
        name: 'Withered Animatronics',
        counter: 'Kamerayı indirdiğin an ofis içinde belirirler; saliseler içinde Freddy maskesini tak.',
      },
      {
        name: 'Toy Animatronics',
        counter: 'Havalandırma çıkışlarında ve koridorda belirdiklerinde Freddy maskesini takarak onları kandır.',
      },
      {
        name: 'The Puppet',
        counter: 'Prize Corner (CAM 11) kamerasındaki müzik kutusunu asla tamamen boşaltmadan sürekli sar.',
      },
      {
        name: 'Withered Foxy',
        counter: 'Maskeye kanmaz; ana koridorda göründüğünde el fenerini aralıklarla yüzüne tut.',
      },
      {
        name: 'Balloon Boy',
        counter: 'Sol havalandırma çıkışında göründüğünde maskeyi tak; içeri girerse fener pillerini devre dışı bırakır.',
      },
    ],
    status: 'planned',
    manualProgress: null,
    rating: 0,
    hours: 0,
    jumpscares: 0,
    completedDate: '',
    customCover: '',
    notes: '',
    steps: [
      { id: 's1', label: 'Night 1–3', done: false },
      { id: 's2', label: 'Night 4–5', done: false },
      { id: 's3', label: 'Night 6', done: false },
      { id: 's4', label: '10/20 Mode (Golden Freddy)', done: false },
    ],
  },
  {
    id: 'fnaf-3',
    catalogCode: 'FNAF-03',
    title: "Five Nights at Freddy's 3",
    category: 'official',
    year: '2015',
    developer: 'Scott Cawthon',
    steamAppId: '354140',
    steamOwned: false,
    accent: '#3ba56b',
    emblem: 'spring',
    objective:
      'Ses sistemini kullanarak Springtrap’i ofisten uzak odalara çekmek, havalandırma kanallarını mühürlemek ve bozulan sistemleri yeniden başlatıp Good Ending’e ulaşmak.',
    story:
      'Olaylardan 30 yıl sonra açılan korku evi Fazbear’s Fright’ta tek gerçek animatronik olan Springtrap ile karşı karşıya kalırsın.',
    mechanics: ['Ses Yönlendirme', 'Sistem Onarımı', 'Havalandırma Mühürleme'],
    threats: [
      {
        name: 'Springtrap',
        counter: 'Bulunduğu odaya komşu kameradan ses çalarak uzaklaştır; havalandırmaya girerse ilgili kanala çift tıklayıp mühürle.',
      },
      {
        name: 'Phantom Freddy & Chica',
        counter: 'Pencere önünde yürürken veya arcade ekranında göründüklerinde bakışını kaçırıp monitörü aç.',
      },
      {
        name: 'Phantom Balloon Boy & Foxy',
        counter: 'Kamera ekranında BB belirirse hemen kamera değiştir; ofis solunda Foxy varsa monitöre dön.',
      },
      {
        name: 'Havalandırma & Ses Sistemleri',
        counter: 'Arıza verdiğinde sol panelden yeniden başlat; havalandırma hatası görüşünü karartır.',
      },
    ],
    status: 'planned',
    manualProgress: null,
    rating: 0,
    hours: 0,
    jumpscares: 0,
    completedDate: '',
    customCover: '',
    notes: '',
    steps: [
      { id: 's1', label: 'Night 1–5', done: false },
      { id: 's2', label: 'Bad Ending', done: false },
      { id: 's3', label: 'Good Ending (Mini Oyunlar)', done: false },
      { id: 's4', label: 'Nightmare Mode', done: false },
    ],
  },
  {
    id: 'fnaf-4',
    catalogCode: 'FNAF-04',
    title: "Five Nights at Freddy's 4",
    category: 'official',
    year: '2015',
    developer: 'Scott Cawthon',
    steamAppId: '388090',
    steamOwned: false,
    accent: '#c93b3b',
    emblem: 'fangs',
    objective:
      'Kamera olmadan tamamen kulaklıkla nefes seslerini dinleyerek yatak odasının iki kapısını, dolabı ve yatağı el feneriyle kontrol edip Nightmare animatroniklerden korunmak.',
    story:
      'Bir çocuğun yatak odasında kâbus boyutundaki animatroniklere karşı sadece ses ipuçları ve el feneriyle hayatta kalmaya çalışırsın.',
    mechanics: ['Ses Dinleme', 'El Feneri', 'Refleks Kontrolü'],
    threats: [
      {
        name: 'Nightmare Bonnie & Chica',
        counter: 'Kapıya koşup 2 saniye dinle; nefes sesi duyarsan kapıyı kapalı tut, duymuyorsan fener yak.',
      },
      {
        name: 'Nightmare Foxy',
        counter: 'Odaya sızıp dolaba girerse dolap kapısını kapatarak peluşa dönüşene kadar bekle.',
      },
      {
        name: 'Nightmare Fredbear / Nightmare',
        counter: 'Gülme ve ayak seslerini takip et; kapıdaysa fener yakıp kapat, yatakta veya dolaptaysa fenerle uzaklaştır.',
      },
      {
        name: 'Plushtrap',
        counter: 'Geceler arası mini oyunda ayak seslerini dinleyip tam X işaretinin üzerindeyken fenerle yakala.',
      },
    ],
    status: 'planned',
    manualProgress: null,
    rating: 0,
    hours: 0,
    jumpscares: 0,
    completedDate: '',
    customCover: '',
    notes: '',
    steps: [
      { id: 's1', label: 'Night 1–5', done: false },
      { id: 's2', label: 'Night 6', done: false },
      { id: 's3', label: 'Nightmare', done: false },
      { id: 's4', label: '20/20/20/20 Mode', done: false },
    ],
  },
  {
    id: 'fnaf-world',
    catalogCode: 'FNAF-W',
    title: 'FNaF World',
    category: 'official',
    year: '2016',
    developer: 'Scott Cawthon',
    steamAppId: '427920',
    steamOwned: false,
    accent: '#66c0f4',
    emblem: 'orbit',
    objective:
      'Serideki karakterlerden oluşan 8 kişilik RPG takımını kurup Animatronica dünyasındaki bozulmaların kaynağını bulmak, bossları yenmek ve Clock Ending dahil tüm sonları açmak.',
    story:
      'Klasik korku formülünden ayrılan bu yan oyunda FNaF karakterleriyle sıra tabanlı RPG savaşlarına girersin.',
    mechanics: ['Sıra Tabanlı RPG', 'Karakter Açma', 'Boss Savaşları'],
    threats: [
      {
        name: 'Security / Chipper’s Revenge',
        counter: 'Tek vuruşta öldüren saldırılara karşı Neon Wall ve Gift Boxes yeteneklerini aktif tut.',
      },
      {
        name: 'Animdude',
        counter: 'Hard Mode finalinde yüksek alan hasarına karşı Mimic Ball ve Unscrew2/Cosmic Song kombinasyonu kullan.',
      },
      {
        name: 'Chica’s Magic Rainbow',
        counter: 'Update 2 finalinde 3 dakikalık sayaç dolmadan Slasher ve yüksek seviye karakterlerle saldır.',
      },
    ],
    status: 'planned',
    manualProgress: null,
    rating: 0,
    hours: 0,
    jumpscares: 0,
    completedDate: '',
    customCover: '',
    notes: '',
    steps: [
      { id: 's1', label: 'Normal Ending', done: false },
      { id: 's2', label: 'Hard Mode', done: false },
      { id: 's3', label: 'Clock Ending', done: false },
      { id: 's4', label: 'Update 2 Bosses', done: false },
    ],
  },
  {
    id: 'fnaf-sl',
    catalogCode: 'FNAF-SL',
    title: "Five Nights at Freddy's: Sister Location",
    category: 'official',
    year: '2016',
    developer: 'Scott Cawthon',
    steamAppId: '506610',
    steamOwned: false,
    accent: '#a78bfa',
    emblem: 'circus',
    objective:
      'Yer altındaki Circus Baby’s Entertainment and Rental tesisinde HandUnit’in talimatlarını yerine getirerek her gece farklı odalardaki bakım ve kaçış görevlerini tamamlamak.',
    story:
      'Sabit bir ofiste oturmak yerine havalandırmalardan sürünerek ilerlediğin, hikâye odaklı ve sinematik bir yer altı tesisi deneyimi sunar.',
    mechanics: ['Görev Odaklı İlerleyiş', 'Ses & Gizlilik', 'Private Room'],
    threats: [
      {
        name: 'Ballora',
        counter: 'Ballora Gallery’de müzik kutusu sesi yaklaştığında yürümeyi tamamen durdur ve uzaklaşmasını bekle.',
      },
      {
        name: 'Funtime Freddy & Bon-Bon',
        counter: 'Breaker Room’da panelleri doldururken Freddy yaklaşırsa sesli uyarıyı çal.',
      },
      {
        name: 'Funtime Foxy',
        counter: 'Karanlık odada feneri kısa aralıklarla yakıp önün boşken hızlıca karşı kapıya ilerle.',
      },
      {
        name: 'Bidybabs & Minireenas',
        counter: 'Masa altında metal kapağı sıkı tut; yaylı kostüm içinde kenarlardaki kilitleri sürekli sık.',
      },
      {
        name: 'Ennard',
        counter: 'Private Room’da kameraları ve kapıları enerji bitmeden yönetip sabah 6’ya ulaş.',
      },
    ],
    status: 'planned',
    manualProgress: null,
    rating: 0,
    hours: 0,
    jumpscares: 0,
    completedDate: '',
    customCover: '',
    notes: '',
    steps: [
      { id: 's1', label: 'Night 1–5 (Real Ending)', done: false },
      { id: 's2', label: 'Private Room (Fake Ending)', done: false },
      { id: 's3', label: 'Golden Freddy 10/20', done: false },
    ],
  },
  {
    id: 'fnaf-ffps',
    catalogCode: 'FFPS-06',
    title: "Freddy Fazbear's Pizzeria Simulator",
    category: 'official',
    year: '2017',
    developer: 'Scott Cawthon',
    steamAppId: '738060',
    steamOwned: false,
    accent: '#e59a3c',
    emblem: 'triangle',
    objective:
      'Gündüzleri kendi pizzacını tasarlayıp yönetirken, geceleri havalandırma kanallarından yaklaşan kurtarılmış animatroniklere karşı bilgisayar görevlerini tamamlamak.',
    story:
      'İlk bakışta restoran işletme simülasyonu gibi görünse de arka planda Afton ailesi hikâyesini büyük bir finalle birleştirir.',
    mechanics: ['Restoran Yönetimi', 'Havalandırma Savunması', 'Çoklu Son'],
    threats: [
      {
        name: 'Scrap Baby',
        counter: 'Havalandırmada ses duyduğunda fanı kapat, ses tuzağını yakındaki odaya kur ve havalandırma ağzına bak.',
      },
      {
        name: 'Molten Freddy',
        counter: 'Gülme sesi duyduğunda yaklaştığı yöndeki havalandırma ızgarasına fener tutarak geri püskürt.',
      },
      {
        name: 'Scraptrap',
        counter: 'Havalandırmada metalik hareket sesi duyduğunda görevi duraklatıp ızgaraya dön ve sesle uzaklaştır.',
      },
      {
        name: 'Lefty',
        counter: 'Gürültü seviyesini düşük tut (sessiz fan ve reklamları atlama); yaklaşırsa ses tuzağı kullan.',
      },
    ],
    status: 'planned',
    manualProgress: null,
    rating: 0,
    hours: 0,
    jumpscares: 0,
    completedDate: '',
    customCover: '',
    notes: '',
    steps: [
      { id: 's1', label: 'Monday–Saturday', done: false },
      { id: 's2', label: 'Completionist Ending', done: false },
      { id: 's3', label: 'Insanity Ending', done: false },
      { id: 's4', label: 'Lorekeeper Certificate', done: false },
    ],
  },
  {
    id: 'fnaf-ucn',
    catalogCode: 'FNAF-UCN',
    title: 'Ultimate Custom Night',
    category: 'official',
    year: '2018',
    developer: 'Scott Cawthon',
    steamAppId: '871720',
    steamOwned: false,
    accent: '#c93b3b',
    emblem: 'grid50',
    objective:
      'Serinin farklı oyunlarından seçilen 50 animatroniğin yapay zekâ seviyelerini (0–20) ayarlayarak yüksek puan rekorları kırmak ve 50/20 modunu tamamlamak.',
    story:
      'Tüm FNaF evrenini tek bir ofiste buluşturan, tamamen refleks, ezber ve hız üzerine kurulu nihai meydan okuma oyunudur.',
    mechanics: ['50 Animatronik', 'Skor Mücadelesi', 'Yüksek Tempo'],
    threats: [
      {
        name: 'Nightmare Fredbear & Nightmare',
        counter: 'Sol veya sağ kapıda kırmızı gözleri belirdiğinde ilgili kapıyı anında kapat.',
      },
      {
        name: 'Toy Freddy',
        counter: 'CAM 08’deki oyun ekranından Mr. Hugs’ın bulunduğu kapıyı kapatarak oyundan düşmesini önle.',
      },
      {
        name: 'The Puppet & Chica',
        counter: 'Global Music Box’ı aralıklarla açıp kapatarak hem müzik kutusunu hem mutfağı kontrol et.',
      },
      {
        name: 'Dee Dee / XOR',
        counter: 'Rastgele ekstra karakter ekler; 50/20 modunda gelen yeni tehdide göre Death Coin kullan.',
      },
      {
        name: 'Old Man Consequences',
        counter: 'Ekranda belirdiğinde balık gölgesi tam ortadayken C tuşuna basıp ekran kilitlenmesini önle.',
      },
    ],
    status: 'planned',
    manualProgress: null,
    rating: 0,
    hours: 0,
    jumpscares: 0,
    completedDate: '',
    customCover: '',
    notes: '',
    steps: [
      { id: 's1', label: '2,000 Puan', done: false },
      { id: 's2', label: '5,000 Puan', done: false },
      { id: 's3', label: '8,000 Puan', done: false },
      { id: 's4', label: '10,000 Puan (50/20 Mode)', done: false },
    ],
  },
  {
    id: 'fnaf-hw',
    catalogCode: 'FNAF-HW1',
    title: "Five Nights at Freddy's: Help Wanted",
    category: 'official',
    year: '2019',
    developer: 'Steel Wool Studios',
    steamAppId: '732690',
    steamOwned: false,
    accent: '#a78bfa',
    emblem: 'visor',
    objective:
      'Klasik FNaF bölümlerini, animatronik tamir görevlerini ve karanlık oda mini oyunlarını tamamlayarak gizli kasetleri toplamak ve Glitchtrap’in sırrını çözmek.',
    story:
      'Hem VR hem de standart ekranda oynanabilen, serinin ikonik sahnelerini 3 boyutlu ve etkileşimli hâle getiren koleksiyon oyunudur.',
    mechanics: ['Mini Oyun Koleksiyonu', 'Animatronik Tamiri', 'Kaset Avı'],
    threats: [
      {
        name: 'Glitchtrap',
        counter: 'Kasetleri topladıkça lobi arkasında belirir; son kasetle birleşmeye çalışırken kaset oynatıcıdaki düğmeye bas.',
      },
      {
        name: 'PlushBabies',
        counter: 'Dark Rooms bölümünde el feneri pilini idareli kullanıp saklanan bebekleri tek tek yakala.',
      },
      {
        name: 'Nightmarionne',
        counter: 'Night Terrors bölümünde kapıları ve dolabı kontrol ederken dokunaçları fenerle uzaklaştır.',
      },
      {
        name: 'Ennard Vent Repair',
        counter: 'Buhar vanalarını ve dişlileri sırayla tamir ederken havalandırmadan gelen Ennard’a kapak kapat.',
      },
    ],
    status: 'planned',
    manualProgress: null,
    rating: 0,
    hours: 0,
    jumpscares: 0,
    completedDate: '',
    customCover: '',
    notes: '',
    steps: [
      { id: 's1', label: 'Ana Bölümler', done: false },
      { id: 's2', label: 'Pizza Party Ending', done: false },
      { id: 's3', label: 'Tüm Kaset & Paralar', done: false },
      { id: 's4', label: 'Curse of Dreadbear DLC', done: false },
    ],
  },
  {
    id: 'fnaf-sb',
    catalogCode: 'FNAF-SB',
    title: "Five Nights at Freddy's: Security Breach",
    category: 'official',
    year: '2021',
    developer: 'Steel Wool Studios',
    steamAppId: '747660',
    steamOwned: false,
    accent: '#e59a3c',
    emblem: 'star',
    objective:
      'Devasa Mega Pizzaplex alışveriş merkezinde mahsur kalan Gregory olarak Glamrock Freddy’nin yardımıyla diğer animatroniklerden gizlenmek ve sabah 6’ya kadar çıkış bulmak.',
    story:
      'Seriyi ilk kez serbest dolaşım yapısına taşıyan oyunda güvenlik görevlisi Vanessa ve Vanny’den kaçarak tesisi keşfedersin.',
    mechanics: ['Serbest Dolaşım', 'Gizlilik & Kaçış', 'Çoklu Son'],
    threats: [
      {
        name: 'Glamrock Chica',
        counter: 'Seslere duyarlıdır; Faz-Cam veya Fazerblaster ile sersemletip gizlenerek yanından geç.',
      },
      {
        name: 'Montgomery Gator',
        counter: 'Güneş gözlüğü nedeniyle Faz-Cam’den etkilenmez; saklanma noktalarını kullan ve Fazblaster ile göğsüne nişan al.',
      },
      {
        name: 'Roxanne Wolf',
        counter: 'Duvar arkasını görebilir; koşmak yerine çömelerek sessiz ilerle ve Chica’nın ses kutusuyla dikkatini dağıt.',
      },
      {
        name: 'Daycare Attendant (Moon)',
        counter: 'Saat başı ışıklar söndüğünde güvenlik istasyonuna ulaş veya Glamrock Freddy’nin içine gir.',
      },
      {
        name: 'Vanny & Burntrap',
        counter: 'Vanny yaklaşınca ekran bozulur, hemen saklan; Burntrap savaşında havalandırma kapaklarını yak.',
      },
    ],
    status: 'planned',
    manualProgress: null,
    rating: 0,
    hours: 0,
    jumpscares: 0,
    completedDate: '',
    customCover: '',
    notes: '',
    steps: [
      { id: 's1', label: '00:00–06:00 Ana Hikâye', done: false },
      { id: 's2', label: 'Burntrap Ending', done: false },
      { id: 's3', label: 'Princess Quest (True Ending)', done: false },
      { id: 's4', label: 'Tüm Koleksiyon & Geliştirmeler', done: false },
    ],
  },
  {
    id: 'fnaf-ruin',
    catalogCode: 'SB-RUIN',
    title: 'Security Breach: RUIN',
    category: 'official',
    year: '2023',
    developer: 'Steel Wool Studios',
    steamAppId: '1924720',
    steamOwned: false,
    accent: '#a78bfa',
    emblem: 'shard',
    objective:
      'Yıkılmış Mega Pizzaplex’e arkadaşı Gregory’yi kurtarmak için giren Cassie olarak V.A.N.N.I. maskesiyle sanal ve gerçek dünya arasında geçiş yapıp güvenlik düğümlerini kapatmak.',
    story:
      'Security Breach olaylarının ardından harabeye dönen tesiste daha karanlık ve gerilim odaklı bir kurtarma hikâyesi sunar.',
    mechanics: ['V.A.N.N.I. AR Maskesi', 'Bulmaca & Keşif', 'Hikâye DLC'],
    threats: [
      {
        name: 'The Mimic',
        counter: 'Final kovalamacasında Faz-Wrench ile kapıları aç ve telsiz yönlendirmelerini takip ederek durmadan koş.',
      },
      {
        name: 'M.X.E.S. Entity',
        counter: 'Maskeyi uzun süre takılı tutarsan belirip animatronikleri çağırır; tehlike artınca maskeyi çıkar.',
      },
      {
        name: 'Ruined Monty & Roxy',
        counter: 'Kamera hoparlörleriyle dikkatlerini başka yöne çek; kör olan Roxy’nin yanından ses çıkarmadan geç.',
      },
      {
        name: 'Mini Music Men',
        counter: 'Dar tünellerde maskeyi çıkarıp gerçek dünyadaki engelleri aşarak arkana bakmadan ilerle.',
      },
    ],
    status: 'planned',
    manualProgress: null,
    rating: 0,
    hours: 0,
    jumpscares: 0,
    completedDate: '',
    customCover: '',
    notes: '',
    steps: [
      { id: 's1', label: 'Chapter 1–5', done: false },
      { id: 's2', label: 'Elevator Ending', done: false },
      { id: 's3', label: 'Brazil Ending', done: false },
      { id: 's4', label: 'Scooper Ending', done: false },
    ],
  },
  {
    id: 'fnaf-hw2',
    catalogCode: 'FNAF-HW2',
    title: "Five Nights at Freddy's: Help Wanted 2",
    category: 'official',
    year: '2023',
    developer: 'Steel Wool Studios',
    steamAppId: '2287520',
    steamOwned: false,
    accent: '#66c0f4',
    emblem: 'dual',
    objective:
      'Fazbear Entertainment çalışanı olarak Pizzaplex sahne arkası, Sister Location ve Fizzy Faz gibi 6 farklı kategorideki mini oyunları tamamlayıp Princess Quest IV sonuna ulaşmak.',
    story:
      'Help Wanted’ın devamı olan bu yapımda hızlı tempolu beceri görevleriyle RUIN öncesindeki olaylara ışık tutarsın.',
    mechanics: ['Beceri Mini Oyunları', 'Sister Location VR', 'Gizli Son'],
    threats: [
      {
        name: 'Fazerblast & Carousel Düşmanları',
        counter: 'Hedefleri vururken arkadan yaklaşan robotlara karşı çevreni sürekli kontrol et.',
      },
      {
        name: 'Ballora Gallery VR',
        counter: 'Müziğin ritmi ve yönünü dinleyerek sadece sessiz anlarda ileri hareket et.',
      },
      {
        name: 'Scrap Baby & Mimic',
        counter: 'Tamir ve ofis bölümlerinde yönergeleri hatasız uygulayıp el feneriyle yaklaşmaları durdur.',
      },
    ],
    status: 'planned',
    manualProgress: null,
    rating: 0,
    hours: 0,
    jumpscares: 0,
    completedDate: '',
    customCover: '',
    notes: '',
    steps: [
      { id: 's1', label: 'Tüm Mini Oyun Kategorileri', done: false },
      { id: 's2', label: 'Faz-Force Ending', done: false },
      { id: 's3', label: 'Princess Quest IV Ending', done: false },
    ],
  },
  {
    id: 'fnaf-itp',
    catalogCode: 'FNAF-ITP',
    title: "Five Nights at Freddy's: Into the Pit",
    category: 'official',
    year: '2024',
    developer: 'Mega Cat Studios',
    steamAppId: '2638370',
    steamOwned: false,
    accent: '#e59a3c',
    emblem: 'pit',
    objective:
      'Eski bir pizzacıdaki top havuzu aracılığıyla 1985 yılına gidip gelen Oswald olarak farklı zaman dilimlerinde ipuçları toplamak, babasını kurtarmak ve 3 yıldızlı gerçek sona ulaşmak.',
    story:
      'Fazbear Frights kitap serisinin ilk hikâyesinden uyarlanan, piksel sanat tarzında 2D macera ve hayatta kalma oyunudur.',
    mechanics: ['2D Macera & Gizlilik', 'Zaman Yolculuğu', 'Bulmaca'],
    threats: [
      {
        name: 'Pit Spring Bonnie',
        counter: 'Ayak seslerini duyduğunda dolap veya masa altına gir ve nefes tutma mini oyununda ritmi tuttur.',
      },
      {
        name: 'Ses Göstergesi & Saklanma Noktaları',
        counter: 'Koşmak yerine yürüyerek gürültü halkasını küçük tut; aynı saklanma yerini üst üste kullanma.',
      },
      {
        name: 'Zaman Yolculuğu Bulmacaları',
        counter: '1985 ve günümüz arasında eşya taşıyarak gizli çocukları kurtar ve 3 yıldızlı sonu aç.',
      },
    ],
    status: 'planned',
    manualProgress: null,
    rating: 0,
    hours: 0,
    jumpscares: 0,
    completedDate: '',
    customCover: '',
    notes: '',
    steps: [
      { id: 's1', label: 'Night 1–5', done: false },
      { id: 's2', label: '1-Star & 2-Star Ending', done: false },
      { id: 's3', label: '3-Star True Ending', done: false },
    ],
  },
  {
    id: 'fnaf-sotm',
    catalogCode: 'FNAF-SOTM',
    title: "Five Nights at Freddy's: Secret of the Mimic",
    category: 'official',
    year: '2025',
    developer: 'Steel Wool Studios',
    steamAppId: '2966820',
    steamOwned: false,
    accent: '#c93b3b',
    emblem: 'mimic',
    objective:
      '1970’lerin sonundaki Murray’s Costume Manor atölyesinde her kostüme girebilen prototip endoskeleton Mimic’ten kaçarak Fazbear Entertainment’ın aradığı gizli teknolojiyi ele geçirmek.',
    story:
      'Serinin zaman çizelgesinde en erken dönemlerden birine giderek Mimic karakterinin kökenini ve eski kostüm atölyesini keşfedersin.',
    mechanics: ['Birinci Şahıs Korku', 'Takipçi Yapay Zekâ', 'Keşif'],
    threats: [
      {
        name: 'The Mimic Kostüm Değişimleri',
        counter: 'Atölyedeki boş kostümlerin içine gizlenebilir; hareket eden veya nefes alan kostümlere yaklaşma.',
      },
      {
        name: 'Jackie',
        counter: 'Müzik kutusu mekanizması aktifleştiğinde engellerin arasından hızla uzaklaşıp görüş hattını kır.',
      },
      {
        name: 'Murray’s Costume Manor Tuzakları',
        counter: 'Karanlık koridorlarda mekanik kapı kilitlerini ve ses tuzaklarını kullanarak takipçiyi atlat.',
      },
    ],
    status: 'planned',
    manualProgress: null,
    rating: 0,
    hours: 0,
    jumpscares: 0,
    completedDate: '',
    customCover: '',
    notes: '',
    steps: [
      { id: 's1', label: 'Ana Hikâye', done: false },
      { id: 's2', label: 'Gizli Sonlar', done: false },
      { id: 's3', label: '%100 Tamamlama', done: false },
    ],
  },
  {
    id: 'fan-fnac1',
    catalogCode: 'FNAC-01',
    title: "Five Nights at Candy's",
    category: 'fangame',
    year: '2015',
    developer: 'Emil Macko',
    steamAppId: null,
    steamOwned: false,
    accent: '#66c0f4',
    emblem: 'cat',
    objective:
      'Candy’s Burgers & Fries restoranında gece görüşlü kameralardan Candy, Cindy ve Chester’ı izleyip üç farklı ofis kapısını kontrol ederek sabah 6’ya kadar hayatta kalmak.',
    story:
      'FNaF topluluğunun en köklü ve resmi Fazbear Fanverse girişimine seçilen klasik fangame serisinin ilk oyunudur.',
    mechanics: ['Gece Görüşü Kamera', '3 Kapı Kontrolü', 'Enerji Yönetimi'],
    threats: [
      {
        name: 'Candy & Cindy',
        counter: 'Karanlıkta parlayan gözlerini kameradan takip et; sol veya sağ kapı camında belirdiklerinde kapıyı kapat.',
      },
      {
        name: 'Chester',
        counter: 'Perde arkasından çıktığında sol koridordan gelir; kapı ışığına gerek kalmadan gözlerinden fark edip kapıyı indir.',
      },
      {
        name: 'The Penguin',
        counter: 'Ofise girerse kapı kontrollerini bozar; orta camdan yaklaştığını görünce orta kapıyı kapat.',
      },
      {
        name: 'Blank',
        counter: 'CAM 11’deki çizim odasından çıkıp orta pencereyi kırmaya çalışır; hareket ettiğinde orta kepengi indir.',
      },
      {
        name: 'Old Candy',
        counter: 'Gözleri parlamaz; sadece gece görüşü kamerasıyla yerini tespit edip sol kapıyı kapat.',
      },
    ],
    status: 'planned',
    manualProgress: null,
    rating: 0,
    hours: 0,
    jumpscares: 0,
    completedDate: '',
    customCover: '',
    notes: '',
    steps: [
      { id: 's1', label: 'Night 1–5', done: false },
      { id: 's2', label: 'Night 6', done: false },
      { id: 's3', label: '7/20 Mode', done: false },
    ],
  },
  {
    id: 'fan-fnac2',
    catalogCode: 'FNAC-02',
    title: "Five Nights at Candy's 2",
    category: 'fangame',
    year: '2016',
    developer: 'Emil Macko',
    steamAppId: null,
    steamOwned: false,
    accent: '#66c0f4',
    emblem: 'phone',
    objective:
      'Kapanmış robot fabrikasında kameralardaki telefonları çaldırarak hasarlı animatronikleri ofisten uzaklaştırmak ve telefon hatlarının bozulmasını önlemek.',
    story:
      'Kapıların bulunmadığı terk edilmiş bir fabrikada, sesli yönlendirme ve kamera takibine dayalı gerilimli bir devam oyunudur.',
    mechanics: ['Telefon Sesi Çekme', 'Kamera Takibi', 'Fabrika Ortamı'],
    threats: [
      {
        name: 'New Candy & Cindy',
        counter: 'Yaklaştıkları odaya komşu kameradaki telefonu çaldırarak dikkatlerini geri çek.',
      },
      {
        name: 'Chester',
        counter: 'Havalandırma ve koridor geçişlerinde telefon sesine duyarlıdır; ofis önündeki odalara sokma.',
      },
      {
        name: 'Withered Blank',
        counter: 'Kırık gövdesiyle hızlı ilerler; koridora girdiğinde en uzak odadaki telefonu çaldır.',
      },
      {
        name: 'RAT & CAT',
        counter: 'İleri gecelerde aktifleşirler; telefon hatlarını bozmalarına izin vermeden sürekli izle.',
      },
    ],
    status: 'planned',
    manualProgress: null,
    rating: 0,
    hours: 0,
    jumpscares: 0,
    completedDate: '',
    customCover: '',
    notes: '',
    steps: [
      { id: 's1', label: 'Night 1–5', done: false },
      { id: 's2', label: 'Night 6', done: false },
      { id: 's3', label: '8/20 Mode', done: false },
    ],
  },
  {
    id: 'fan-fnac3',
    catalogCode: 'FNAC-03',
    title: "Five Nights at Candy's 3",
    category: 'fangame',
    year: '2017',
    developer: 'Emil Macko',
    steamAppId: null,
    steamOwned: false,
    accent: '#a78bfa',
    emblem: 'beam',
    objective:
      'Mary Schmidt’in çocukluk kâbuslarında yatak altını ve dolabı el feneriyle kontrol ederek Monster Rat ve Monster Cat’i uzak tutmak; gündüz mini oyunlarıyla sırrı çözmek.',
    story:
      'FNaF 4 atmosferini derin bir psikolojik hikâye ve gündüz/gece döngüsüyle birleştiren üçlemenin final oyunudur.',
    mechanics: ['El Feneri Savunması', 'Gündüz Mini Oyunları', 'Hikâye Odaklı'],
    threats: [
      {
        name: 'Monster Rat',
        counter: 'Odaya girdiğinde el fenerini yüzüne tutarak geri çekilmesini sağla; yatak altına girerse eğilip fener yak.',
      },
      {
        name: 'Monster Cat',
        counter: 'Dolap ve yatak kenarından sessizce yaklaşır; ses ipuçlarını dinleyip fenerle uzaklaştır.',
      },
      {
        name: 'Monster Vinnie',
        counter: 'Final gecesinde kaset çaları kullanarak zihnini sakinleştir ve saldırı yönüne fener tut.',
      },
      {
        name: 'Shadow Rat',
        counter: 'Deep Sleep modunda çok daha hızlı hareket eder; fener açısını anlık değiştirerek takip et.',
      },
    ],
    status: 'planned',
    manualProgress: null,
    rating: 0,
    hours: 0,
    jumpscares: 0,
    completedDate: '',
    customCover: '',
    notes: '',
    steps: [
      { id: 's1', label: 'Night 1–5', done: false },
      { id: 's2', label: 'Forgotten Ending', done: false },
      { id: 's3', label: 'Deep Sleep / Shadow Rat', done: false },
    ],
  },
  {
    id: 'fan-tjoc',
    catalogCode: 'TJOC-SM',
    title: 'The Joy of Creation: Story Mode',
    category: 'fangame',
    year: '2017',
    developer: 'Nikson',
    steamAppId: null,
    steamOwned: false,
    accent: '#c93b3b',
    emblem: 'window',
    objective:
      'Scott Cawthon’ın evindeki 5 farklı odada (Bedroom, Living Room, Office, Basement, Attic) tamamen farklı kurallara sahip Ignited animatroniklere karşı hayatta kalmak.',
    story:
      'Unreal Engine ile geliştirilen, her bölümde mekanikleri tamamen değişen en ünlü ve yüksek gerilimli FNaF hayran oyunudur.',
    mechanics: ['5 Farklı Mekanik', 'Unreal Engine', 'Yüksek Gerilim'],
    threats: [
      {
        name: 'Ignited Freddy',
        counter: 'Pencere veya kapı önünde belirdiğinde fenerle kör et ya da perdeleri zamanında kapat.',
      },
      {
        name: 'Ignited Bonnie',
        counter: 'Kamera veya pencere kontrolünde bakışını kaçır; ofiste monitöre baktığında saldırır.',
      },
      {
        name: 'Ignited Chica',
        counter: 'Etrafındaki nesneleri ve kapıları kontrol ederek odaya sızmasını engelle.',
      },
      {
        name: 'Ignited Foxy',
        counter: 'Bodrum ve çatı katında görüş hattından kaçın; sadece arkasını döndüğünde hareket et.',
      },
      {
        name: 'Creation',
        counter: 'Attic bölümünde tüm kameraları ve yangın söndürücü mekaniklerini senkronize yönet.',
      },
    ],
    status: 'planned',
    manualProgress: null,
    rating: 0,
    hours: 0,
    jumpscares: 0,
    completedDate: '',
    customCover: '',
    notes: '',
    steps: [
      { id: 's1', label: 'Bedroom', done: false },
      { id: 's2', label: 'Living Room', done: false },
      { id: 's3', label: 'Office', done: false },
      { id: 's4', label: 'Basement', done: false },
      { id: 's5', label: 'Attic (Final)', done: false },
    ],
  },
  {
    id: 'fan-popgoes',
    catalogCode: 'POP-ARC',
    title: 'POPGOES Arcade',
    category: 'fangame',
    year: '2022',
    developer: 'Kane Carter',
    steamAppId: '1986840',
    steamOwned: false,
    accent: '#3ba56b',
    emblem: 'hex',
    objective:
      'Bozuk bir atari makinesinin içindeki ormanda dolaşıp düşmanları yenmek, yeteneklerini geliştirmek ve makineyi ele geçiren karanlık virüsü temizlemek.',
    story:
      'Fazbear Fanverse kapsamında Steam’de yayınlanan, klasik el konsolu estetiğine sahip RPG macera oyunudur.',
    mechanics: ['Retro RPG', 'Keşif & Savaş', 'Bestiary Koleksiyonu'],
    threats: [
      {
        name: 'Corrupted Animatronics',
        counter: 'Savaşlarda doğru element ve yetenek zamanlamasıyla zayıf noktalarına saldır.',
      },
      {
        name: 'Blackrabbit',
        counter: 'Haritadaki karanlık geçitlerde tuzaklardan kaçın ve savunma güçlendirmelerini kuşan.',
      },
      {
        name: 'Machinist & Boss Savaşları',
        counter: 'İksir ve parça geliştirmelerini tamamlayıp saldırı desenlerini ezberleyerek karşı saldırı yap.',
      },
    ],
    status: 'planned',
    manualProgress: null,
    rating: 0,
    hours: 0,
    jumpscares: 0,
    completedDate: '',
    customCover: '',
    notes: '',
    steps: [
      { id: 's1', label: 'The Dead Forest', done: false },
      { id: 's2', label: 'The Machinist', done: false },
      { id: 's3', label: '%100 Bestiary', done: false },
    ],
  },
  {
    id: 'fan-onaf1',
    catalogCode: 'ONAF-01',
    title: "One Night at Flumpty's",
    category: 'fangame',
    year: '2015',
    developer: 'Jonochrome',
    steamAppId: null,
    steamOwned: false,
    accent: '#e59a3c',
    emblem: 'egg',
    objective:
      'Zaman ve mekân kurallarını bükebilen dev yumurta Flumpty Bumpty ve tuhaf arkadaşlarının kaçırma oyununda tek bir gece boyunca sabah 6’ya kadar hayatta kalmak.',
    story:
      'El çizimi karikatürize görselleriyle hem mizahi hem de keskin refleks mekanikleri sunan efsanevi serinin ilk oyunudur.',
    mechanics: ['Tek Gece Mücadelesi', 'Hard Boiled Modu', 'Enerji Kontrolü'],
    threats: [
      {
        name: 'Flumpty Bumpty',
        counter: 'Koridor kapılarından herhangi birinden yaklaşabilir; kapı ışığında göründüğünde kapıyı kapat.',
      },
      {
        name: 'Birthday Boy Blam',
        counter: 'Sol koridordan ilerler; kapıya ulaştığında ışığı yakıp sol kapıyı indir.',
      },
      {
        name: 'Grunkfuss the Clown',
        counter: 'Duvar deliğinden yavaşça dışarı çıkar; sabır sayacı dolmadan monitörü açıp kapat.',
      },
      {
        name: 'The Beaver',
        counter: 'Tuvalet kağıdı bittiğinde koridordan hızla koşar; sağ kapıyı zamanında kapat.',
      },
      {
        name: 'Redman',
        counter: 'Bilgisayar ekranında virüs uyarısı çıkardığında yükleme çubuğu dolmadan pencereyi kapat.',
      },
    ],
    status: 'planned',
    manualProgress: null,
    rating: 0,
    hours: 0,
    jumpscares: 0,
    completedDate: '',
    customCover: '',
    notes: '',
    steps: [
      { id: 's1', label: 'Normal Night (00:00–06:00)', done: false },
      { id: 's2', label: 'Hard Boiled Mode', done: false },
    ],
  },
  {
    id: 'fan-onaf2',
    catalogCode: 'ONAF-02',
    title: "One Night at Flumpty's 2",
    category: 'fangame',
    year: '2015',
    developer: 'Jonochrome',
    steamAppId: null,
    steamOwned: false,
    accent: '#e59a3c',
    emblem: 'eye',
    objective:
      'Kapıların olmadığı ofiste ışıkları söndürerek Exposure (görünürlük) metresini sıfırda tutmak ve havalandırma kapağını kontrol ederek sabah 6’ya ulaşmak.',
    story:
      'İlk oyunun formülünü ışık kapatma, görünürlük barı ve havalandırma savunmasıyla çok daha tempolu bir hâle getirir.',
    mechanics: ['Işık & Exposure Barı', 'Havalandırma Kapağı', 'Hızlı Refleks'],
    threats: [
      {
        name: 'Eyesaur',
        counter: 'Koridordan yaklaşırken ofis ışığını hemen kapat ve Exposure barının yükselmesini engelle.',
      },
      {
        name: 'The Owl',
        counter: 'Sağ veya sol havalandırmadan uçar; hangi taraftaysa o havalandırma kapağını kapat.',
      },
      {
        name: 'Golden Flumpty',
        counter: 'Ofiste aniden belirdiğinde monitörü açıp kapatarak yok et.',
      },
      {
        name: 'Flumpty & Blam',
        counter: 'Ofis girişinde belirdiklerinde ışığı kapatıp tamamen uzaklaşana kadar karanlıkta bekle.',
      },
    ],
    status: 'planned',
    manualProgress: null,
    rating: 0,
    hours: 0,
    jumpscares: 0,
    completedDate: '',
    customCover: '',
    notes: '',
    steps: [
      { id: 's1', label: 'Normal Night (00:00–06:00)', done: false },
      { id: 's2', label: 'Hard Boiled Mode', done: false },
    ],
  },
  {
    id: 'fan-onaf3',
    catalogCode: 'ONAF-03',
    title: "One Night at Flumpty's 3",
    category: 'fangame',
    year: '2021',
    developer: 'Jonochrome',
    steamAppId: null,
    steamOwned: false,
    accent: '#c93b3b',
    emblem: 'flame',
    objective:
      'Donmuş bir tesiste şömine ateşini yakarak donmayı önlemek, kameralardaki flaşla düşmanları dondurmak ve finaldeki Flumpty Night modunu tamamlamak.',
    story:
      'Fazbear Fanverse kapsamında yayınlanan üçlemenin final oyunudur; şömine ısısı ve kamera flaşı üzerine kuruludur.',
    mechanics: ['Şömine Isı Kontrolü', 'Kamera Flaşı', 'Flumpty Night'],
    threats: [
      {
        name: 'Flumpty & Flumpty Gece Modu',
        counter: 'Final modunda tüm düşmanlar Flumpty klonlarına dönüşür; her odadaki klon mekaniğini flaş ve şömineyle durdur.',
      },
      {
        name: 'Shadow Flumpty',
        counter: 'Karanlıkta belirdiğinde kamera flaşını patlatarak görüş alanından uzaklaştır.',
      },
      {
        name: 'Beavowl',
        counter: 'Tavandan ve havalandırmadan saldırır; şömineyi söndürüp ısısını düşürerek tuzağı boz.',
      },
    ],
    status: 'planned',
    manualProgress: null,
    rating: 0,
    hours: 0,
    jumpscares: 0,
    completedDate: '',
    customCover: '',
    notes: '',
    steps: [
      { id: 's1', label: 'Normal Night', done: false },
      { id: 's2', label: 'Flumpty Night (Final)', done: false },
    ],
  },
  {
    id: 'fan-dsaf',
    catalogCode: 'DSAF-01',
    title: "Dayshift at Freddy's",
    category: 'fangame',
    year: '2016',
    developer: 'DirectDogman',
    steamAppId: null,
    steamOwned: false,
    accent: '#e59a3c',
    emblem: 'badge',
    objective:
      'Gündüz vardiyası çalışanı Jack Kennedy olarak yapacağın seçimlerle pizzacıyı kurtarmak ya da Dave Miller ile iş birliği yapıp tüm hikâye sonlarını açmak.',
    story:
      'FNaF evrenini kara mizah, absürt diyaloglar ve onlarca farklı son içeren seçim tabanlı bir RPG deneyimine dönüştürür.',
    mechanics: ['Seçim Odaklı Hikâye', 'Kara Mizah', 'Çoklu Son'],
    threats: [
      {
        name: 'Dave Miller Kararları',
        counter: 'Tekliflerini kabul etmek veya reddetmek hikâye rotasını ve ulaşacağın sonu tamamen değiştirir.',
      },
      {
        name: 'Phone Guy Denetimleri',
        counter: 'Gündüz vardiyası görevlerini ve mini oyunları eksiksiz tamamlayarak kovulmayı önle.',
      },
      {
        name: 'Fazbender Vardiya Tuzakları',
        counter: 'Animatronik bakım ve sahne şovlarında riskli seçeneklerden kaçınarak güvenli rotayı izle.',
      },
    ],
    status: 'planned',
    manualProgress: null,
    rating: 0,
    hours: 0,
    jumpscares: 0,
    completedDate: '',
    customCover: '',
    notes: '',
    steps: [
      { id: 's1', label: 'Ana Vardiya Sonu', done: false },
      { id: 's2', label: 'Dave Miller Rotası', done: false },
      { id: 's3', label: 'Gizli & Alternatif Sonlar', done: false },
    ],
  },
  {
    id: 'fan-jrs',
    catalogCode: 'JRS-22',
    title: "JR's",
    category: 'fangame',
    year: '2022',
    developer: 'Ramenov & Ekip',
    steamAppId: null,
    steamOwned: false,
    accent: '#a78bfa',
    emblem: 'ghost',
    objective:
      'Dedektif olarak kameralardaki ipuçlarını ve animatroniklerin anormal davranışlarını analiz edip her gece aralarına sızan hayalet (Haunted) animatroniği tespit etmek.',
    story:
      'Klasik hayatta kalma gerilimini dedektiflik ve gözlem bulmacasıyla birleştiren, görsel kalitesiyle öne çıkan modern bir fan oyunudur.',
    mechanics: ['Dedektiflik & Analiz', 'Hayalet Tespiti', 'Atmosferik Korku'],
    threats: [
      {
        name: 'Haunted Animatronic Tespiti',
        counter: 'Kameralardaki doğaüstü belirtileri (ışık titremesi, anormal poz) inceleyip gerçek hayaleti işaretle.',
      },
      {
        name: 'Ghost Mangle',
        counter: 'Final gecesinde odalar arası hareketini ses ve kamera bozulmalarından takip et.',
      },
      {
        name: 'Paulbear',
        counter: 'Ofis girişine yaklaştığında uyarı işaretlerini takip edip kapı ve ışık protokolünü uygula.',
      },
    ],
    status: 'planned',
    manualProgress: null,
    rating: 0,
    hours: 0,
    jumpscares: 0,
    completedDate: '',
    customCover: '',
    notes: '',
    steps: [
      { id: 's1', label: 'Night 1–5', done: false },
      { id: 's2', label: 'Night 6 (True Ending)', done: false },
    ],
  },
  {
    id: 'fan-tnar',
    catalogCode: 'TNAR-16',
    title: "Those Nights at Rachel's",
    category: 'fangame',
    year: '2016',
    developer: 'Nikson',
    steamAppId: null,
    steamOwned: false,
    accent: '#e59a3c',
    emblem: 'closet',
    objective:
      'Doug’s & Rachel’s restoranında ofis içinde serbestçe hareket ederek kapıları tutmak, dolaba saklanmak ve kameraları kontrol edip 6 geceyi tamamlamak.',
    story:
      'Klasik FNaF atmosferini ofis içi hareket özgürlüğü ve kaliteli 3D modellerle birleştiren sevilen bir fan yapımıdır.',
    mechanics: ['Ofis İçi Hareket', 'Saklanma & Kapı Tutma', 'Kamera Takibi'],
    threats: [
      {
        name: 'Rachel',
        counter: 'Sol koridordan yaklaşır; kapıya koşup ayak sesleri uzaklaşana kadar kapıyı kapalı tut.',
      },
      {
        name: 'Doug',
        counter: 'Sağ koridordan ilerler; sağ kapıya gidip kapıyı tutarak ofise girmesini engelle.',
      },
      {
        name: 'Pete & Bane',
        counter: 'Ofis içine sızdıklarında arkandaki dolaba girip nefeslerini tutarak geçmelerini bekle.',
      },
      {
        name: 'The Thing',
        counter: 'Kamera sistemini ve ofis köşelerini kontrol ederek görüş alanına girdiğinde monitörü kapat.',
      },
    ],
    status: 'planned',
    manualProgress: null,
    rating: 0,
    hours: 0,
    jumpscares: 0,
    completedDate: '',
    customCover: '',
    notes: '',
    steps: [
      { id: 's1', label: 'Night 1–5', done: false },
      { id: 's2', label: 'Night 6', done: false },
      { id: 's3', label: 'Custom Night', done: false },
    ],
  },
  {
    id: 'fan-fn4',
    catalogCode: 'FN4-FE',
    title: 'Final Nights 4: Fates Entwined',
    category: 'fangame',
    year: '2018',
    developer: 'JeliLiam',
    steamAppId: null,
    steamOwned: false,
    accent: '#c93b3b',
    emblem: 'clock',
    objective:
      'Hem 1973’teki eski Fredbear’s Family Diner’da hem de 2017’deki paranormal araştırmalarda farklı bölümleri tamamlayarak serinin lanetini çözmek.',
    story:
      'Sinematik ara sahneleri, zaman atlamalı hikâye anlatımı ve yüksek zorluk seviyesiyle bilinen Final Nights serisinin finalidir.',
    mechanics: ['Çift Zaman Dilimi', 'Sinematik Hikâye', 'Paranormal Araştırma'],
    threats: [
      {
        name: 'Reaper Animatronics',
        counter: 'El feneri ve ortam seslerini kullanarak karanlık köşelerden yaklaşan Reaper modellerini durdur.',
      },
      {
        name: 'Burned Spring Bonnie',
        counter: '1973 ve 2017 bölümlerinde ses yönlendirmelerini ve kapı kilitlerini zamanında kullan.',
      },
      {
        name: '1973 & 2017 Zaman Çizgisi',
        counter: 'Her zaman diliminin kendine özgü mekanik ve bulmaca kurallarına göre savunma stratejini değiştir.',
      },
    ],
    status: 'planned',
    manualProgress: null,
    rating: 0,
    hours: 0,
    jumpscares: 0,
    completedDate: '',
    customCover: '',
    notes: '',
    steps: [
      { id: 's1', label: '1973 & 2017 Bölümleri', done: false },
      { id: 's2', label: 'Tüm Hikâye Sonları', done: false },
    ],
  },
];
