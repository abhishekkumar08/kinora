export const STREAMS = {
  bbb: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
  tos: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8',
  angel: 'https://storage.googleapis.com/shaka-demo-assets/angel-one-hls/hls.m3u8',
  bipbop: 'https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_fmp4/master.m3u8',
  'bbb-drm': { url: '/drm/bbb/master.m3u8', drm: 'bbb' },
  'tos-drm': { url: '/drm/tos/master.m3u8', drm: 'tos' },
};
const CLEAR_STREAMS = ['bbb', 'tos', 'angel', 'bipbop'];
const DRM_STREAMS = ['bbb-drm', 'tos-drm'];

const FONTS = ['Bebas Neue', 'Cinzel', 'Anton', 'Playfair Display', 'Russo One', 'Abril Fatface', 'Oswald', 'Righteous'];

const RAW = [
  ['low-orbit', 'Low Orbit', 's', 2025, 'U/A 13+', 3, ['Sci-Fi TV', 'Dramas'], ['Suspenseful', 'Cerebral'], 'Six engineers on a failing space station have ninety days to bring it home, and one of them is sabotaging every repair.'],
  ['glass-harbor', 'Glass Harbor', 'm', 2024, 'U/A 16+', 118, ['Thrillers', 'Crime Movies'], ['Dark', 'Suspenseful'], 'A harbour pilot who guides cargo ships through fog finds a vessel with no crew and a manifest that lists her own name.'],
  ['monsoon-ledger', 'The Monsoon Ledger', 's', 2026, 'U/A 16+', 2, ['Crime TV', 'Indian TV'], ['Gritty', 'Slow Burn'], 'In a flooded Mumbai, a junior auditor follows a trail of missing money into a family empire that owns half the city.'],
  ['paper-comets', 'Paper Comets', 'm', 2023, 'U', 94, ['Family Movies', 'Animation'], ['Heartfelt', 'Feel-Good'], 'Two kids build a rocket out of newspapers to reach their grandmother, who swears she lives on the moon.'],
  ['night-shift', 'Night Shift at Kestrel', 's', 2024, 'U/A 13+', 2, ['Comedies', 'Workplace TV'], ['Witty', 'Quirky'], 'The overnight staff of a 24-hour hospital in a sleepy town handle every emergency except the ones they cause.'],
  ['saltwater', 'Saltwater Kings', 'm', 2022, 'U/A 13+', 126, ['Action & Adventure', 'Dramas'], ['Exciting', 'Rousing'], 'A disgraced sailing captain enters a round-the-world race with a crew of strangers and a boat held together by luck.'],
  ['red-meridian', 'Red Meridian', 's', 2025, 'A', 1, ['Thrillers', 'Political TV'], ['Tense', 'Dark'], 'When a cabinet minister vanishes on a night train, a railway guard becomes the only witness every side wants silenced.'],
  ['quiet-hours', 'Quiet Hours', 'm', 2025, 'U/A 16+', 101, ['Horror Movies'], ['Scary', 'Atmospheric'], 'A sound engineer restoring old radio tapes hears a voice in the static calling her by a name she has never used.'],
  ['tidewater', 'Tidewater', 's', 2023, 'U/A 7+', 3, ['Kids TV', 'Animation'], ['Playful', 'Exciting'], 'A crab, a gull and a very confused lighthouse solve mysteries along a coast where the tide never behaves.'],
  ['ninth-floor', 'The Ninth Floor', 'm', 2021, 'U/A 16+', 109, ['Mysteries', 'Thrillers'], ['Mind-Bending', 'Suspenseful'], 'The elevator in an office tower stops at a floor that is not in the blueprints, and the night guard decides to get out.'],
  ['spice-route', 'Spice Route', 's', 2024, 'U', 2, ['Docuseries', 'Food & Travel TV'], ['Inspiring', 'Warm'], 'A chef retraces the old trade routes from Kochi to Venice, cooking with the families who still grow what started it all.'],
  ['ember', 'Ember & Ash', 'm', 2026, 'U/A 13+', 132, ['Fantasy Movies', 'Action & Adventure'], ['Epic', 'Imaginative'], 'The last apprentice of a dying order of fire-keepers must carry a single flame across a frozen empire.'],
  ['afterparty', 'Afterparty Protocol', 'm', 2023, 'U/A 16+', 97, ['Comedies', 'Crime Movies'], ['Absurd', 'Fast-Paced'], 'Four friends wake up after a wedding with a stolen racehorse, a ransom note, and no memory of the last ten hours.'],
  ['northline', 'Northline', 's', 2022, 'U/A 16+', 4, ['Crime TV', 'Dramas'], ['Gritty', 'Binge-Worthy'], 'A detective returns to the mining town she escaped as a teenager to investigate a death that looks exactly like her father\'s.'],
  ['kite-season', 'Kite Season', 'm', 2024, 'U', 112, ['Romantic Movies', 'Indian Movies'], ['Heartfelt', 'Romantic'], 'Rival kite makers in Ahmedabad fall for each other in the one week of the year their families are not speaking.'],
  ['deep-field', 'Deep Field', 'm', 2025, 'U/A 7+', 88, ['Documentaries', 'Science & Nature'], ['Awe-Inspiring', 'Cerebral'], 'Astronomers point a telescope at an empty patch of sky for a month and find ten thousand galaxies staring back.'],
  ['static', 'Static', 's', 2026, 'A', 1, ['Horror TV', 'Mysteries'], ['Scary', 'Creepy'], 'A late-night radio host takes a call from a listener describing, in real time, the room the host is sitting in.'],
  ['grand-prix', 'Pit Wall', 's', 2025, 'U/A 13+', 2, ['Sports TV', 'Docuseries'], ['Exciting', 'Intimate'], 'A season inside the smallest team in motor racing, where one bad pit stop can end everyone\'s career.'],
  ['honey-trap', 'Honeycomb', 'm', 2022, 'U/A 16+', 104, ['Thrillers', 'Dramas'], ['Steamy', 'Twisty'], 'A beekeeper on a remote island takes in a stranger whose story changes every time a new boat arrives.'],
  ['blue-hour', 'The Blue Hour', 'm', 2021, 'U/A 13+', 115, ['Dramas', 'Independent Movies'], ['Moving', 'Quiet'], 'A widowed photographer teaches her grandson to shoot film during the twenty minutes of light she says are the only honest ones.'],
  ['robot-chef', 'Gears & Gravy', 's', 2024, 'U', 2, ['Kids TV', 'Comedies'], ['Silly', 'Feel-Good'], 'A kitchen robot built to make one perfect dosa keeps accidentally inventing new cuisines.'],
  ['iron-tide', 'Iron Tide', 'm', 2026, 'U/A 16+', 141, ['Action & Adventure', 'War Movies'], ['Intense', 'Rousing'], 'The crew of a crippled submarine must cross a minefield with no engines and only the current to steer by.'],
  ['letters', 'Letters to Ooty', 'm', 2023, 'U', 99, ['Romantic Movies', 'Dramas'], ['Heartfelt', 'Nostalgic'], 'A postman in the hills starts answering the love letters that were never collected, and someone writes back.'],
  ['parallel', 'Parallel Lines', 's', 2025, 'U/A 13+', 2, ['Sci-Fi TV', 'Mysteries'], ['Mind-Bending', 'Twisty'], 'Commuters on the 8:14 discover their train arrives at a slightly different city every morning.'],
  ['wildside', 'The Wild Side', 's', 2023, 'U', 3, ['Docuseries', 'Science & Nature'], ['Awe-Inspiring', 'Exciting'], 'Camera crews spend a year with the animals that live in the gaps of the world\'s busiest cities.'],
  ['crown-dust', 'Crown of Dust', 's', 2024, 'U/A 16+', 3, ['Fantasy TV', 'Dramas'], ['Epic', 'Dark'], 'Three heirs to a desert throne each believe they are the prophesied ruler. The prophecy did not mention the other two.'],
  ['standup', 'Open Mic', 'm', 2025, 'A', 72, ['Stand-Up Comedy'], ['Irreverent', 'Witty'], 'A comic who has bombed in every city in India returns to the club where it started for one last hour.'],
  ['mirage', 'Mirage Club', 'm', 2022, 'U/A 16+', 108, ['Crime Movies', 'Thrillers'], ['Stylish', 'Twisty'], 'A croupier plans the perfect casino heist, then realises the casino has been planning one on her.'],
  ['skylark', 'Skylark', 'm', 2024, 'U/A 7+', 96, ['Family Movies', 'Action & Adventure'], ['Uplifting', 'Exciting'], 'A girl restores her late uncle\'s crop-duster to fly it in a race he never got to finish.'],
  ['fault', 'Fault Lines', 's', 2026, 'U/A 13+', 1, ['Dramas', 'Thrillers'], ['Tense', 'Emotional'], 'After an earthquake traps a city block, a rescue worker learns the building collapsed long before the ground shook.'],
  ['brass', 'Brass Monkeys', 'm', 2021, 'U/A 13+', 93, ['Comedies', 'Music & Musicals'], ['Feel-Good', 'Quirky'], 'A failing wedding band fakes a viral hit and has three weeks to learn how to actually play it.'],
  ['echo', 'Echo Valley', 's', 2022, 'U/A 16+', 2, ['Mysteries', 'Crime TV'], ['Atmospheric', 'Slow Burn'], 'Every ten years a hiker disappears in the valley. This time the town\'s new doctor is the one who comes back.'],
  ['sundown', 'Sundown Express', 'm', 2026, 'U/A 13+', 119, ['Action & Adventure', 'Thrillers'], ['Fast-Paced', 'Exciting'], 'A courier has until sunset to cross a city in lockdown with a package that half the police want, and half want destroyed.'],
  ['chalk', 'Chalk & Chess', 'm', 2023, 'U', 101, ['Dramas', 'Sports Movies'], ['Inspiring', 'Heartfelt'], 'A schoolteacher in a mill town turns a broken chess set into a team that ends up at the national championship.'],
  ['nocturne', 'Nocturne', 's', 2025, 'A', 2, ['Horror TV', 'Dramas'], ['Creepy', 'Dark'], 'A night-shift nurse realises that the patients who ask her to sing them to sleep are never there in the morning.'],
  ['tinkers', 'The Tinkers', 's', 2026, 'U/A 7+', 1, ['Kids TV', 'Animation'], ['Playful', 'Imaginative'], 'Siblings who fix broken toys discover each toy remembers the child who loved it and asks to go home.'],
];

const FIRST = ['Ira', 'Dev', 'Mara', 'Kabir', 'Noor', 'Theo', 'Anya', 'Rohan', 'Lena', 'Arjun', 'Sana', 'Felix', 'Meera', 'Omar', 'Tara', 'Jonah'];
const LAST = ['Vale', 'Sethi', 'Okafor', 'Rao', 'Lind', 'Mehta', 'Castell', 'Iyer', 'Brandt', 'Kapoor', 'Nash', 'Bose'];
const EP_NAMES = ['Pilot', 'The Long Way Down', 'Signal', 'Undertow', 'Small Hours', 'Blind Spot', 'Crossing', 'What We Kept', 'Static', 'Homecoming', 'Fallout', 'The Last Light'];

const castFor = i => [0, 1, 2, 3].map(k => `${FIRST[(i * 3 + k * 5) % FIRST.length]} ${LAST[(i * 7 + k * 3) % LAST.length]}`);

export const img = (seed, w, h) => `https://picsum.photos/seed/kinora-${seed}/${w}/${h}`;

export const TITLES = RAW.map(([id, title, kind, year, maturity, size, genres, tags, synopsis], i) => {
  const base = {
    id, title, year, maturity, genres, tags, synopsis,
    type: kind === 's' ? 'series' : 'movie',
    cast: castFor(i),
    creators: [`${FIRST[(i + 4) % FIRST.length]} ${LAST[(i + 2) % LAST.length]}`],
    font: FONTS[i % FONTS.length],
    stream: i % 3 === 0 ? DRM_STREAMS[(i / 3) % 2] : CLEAR_STREAMS[i % CLEAR_STREAMS.length],
    drm: i % 3 === 0 ? STREAMS[DRM_STREAMS[(i / 3) % 2]].drm : undefined,
    previewAt: 20 + (i * 13) % 120,
    isNew: year >= 2026,
    original: i % 3 === 0,
  };
  if (kind === 'm') return { ...base, minutes: size };
  return {
    ...base,
    seasons: Array.from({ length: size }, (_, s) => ({
      n: s + 1,
      episodes: Array.from({ length: 6 + ((i + s) % 4) }, (_, e) => ({
        n: e + 1,
        name: EP_NAMES[(i + s * 3 + e) % EP_NAMES.length],
        minutes: 38 + ((i + e * 7) % 22),
        synopsis: `${EP_NAMES[(i + e) % EP_NAMES.length] === 'Pilot' ? 'It begins.' : 'The pressure builds.'} ${synopsis.split(',')[0]}, and nothing goes to plan.`,
      })),
    })),
  };
});

export const BY_ID = Object.fromEntries(TITLES.map(t => [t.id, t]));

const pick = ids => ids.map(id => BY_ID[id]);
const byGenre = g => TITLES.filter(t => t.genres.some(x => x.includes(g)));

export const TOP10_SHOWS = pick(['monsoon-ledger', 'low-orbit', 'red-meridian', 'northline', 'parallel', 'crown-dust', 'static', 'night-shift', 'echo', 'fault']);
export const TOP10_MOVIES = pick(['ember', 'glass-harbor', 'iron-tide', 'quiet-hours', 'sundown', 'kite-season', 'mirage', 'afterparty', 'saltwater', 'ninth-floor']);

export const ROWS = [
  { id: 'continue', title: 'Continue Watching', dynamic: 'continue' },
  { id: 'trending', title: 'Trending Now', items: pick(['low-orbit', 'ember', 'monsoon-ledger', 'quiet-hours', 'parallel', 'sundown', 'kite-season', 'static', 'iron-tide', 'grand-prix']) },
  { id: 'top10-shows', title: 'Top 10 Shows in India Today', ranked: true, items: TOP10_SHOWS },
  { id: 'mylist', title: 'My List', dynamic: 'mylist' },
  { id: 'new', title: 'New on Kinora', items: TITLES.filter(t => t.year >= 2025) },
  { id: 'thrillers', title: 'Edge-of-Your-Seat Thrillers', items: byGenre('Thriller') },
  { id: 'top10-movies', title: 'Top 10 Movies in India Today', ranked: true, items: TOP10_MOVIES },
  { id: 'indian', title: 'Made in India', items: TITLES.filter(t => /Indian|Mumbai|Kochi|Ahmedabad|Ooty|dosa|India/.test(t.genres.join() + t.synopsis)) },
  { id: 'comedies', title: 'Laugh Out Loud', items: byGenre('Comed') },
  { id: 'scifi', title: 'Sci-Fi & Fantasy', items: TITLES.filter(t => t.genres.some(g => /Sci-Fi|Fantasy/.test(g))) },
  { id: 'docs', title: 'Documentaries & Docuseries', items: TITLES.filter(t => t.genres.some(g => /Doc/.test(g))) },
  { id: 'family', title: 'Watch Together', items: TITLES.filter(t => ['U', 'U/A 7+'].includes(t.maturity)) },
  { id: 'horror', title: 'Late-Night Scares', items: byGenre('Horror') },
  { id: 'dramas', title: 'Award-Winning Dramas', items: byGenre('Drama') },
];

export const BILLBOARDS = { home: 'low-orbit', shows: 'monsoon-ledger', movies: 'ember', latest: 'fault' };
