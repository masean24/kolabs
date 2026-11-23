import type { GradeLevel, LabTemplate, TrackId } from '../types/lab';

function blk(
  type: string,
  fields?: Record<string, string | number>,
  inputs?: Record<string, { block: unknown }>,
  nextBlock?: unknown
): Record<string, unknown> {
  const node: Record<string, unknown> = { type };
  if (fields) node.fields = fields;
  if (inputs) node.inputs = inputs;
  if (nextBlock) node.next = { block: nextBlock };
  return node;
}

function makeBlockDoc(rootBlocks: Record<string, unknown>[]): string {
  return JSON.stringify(
    {
      blocks: {
        languageVersion: 0,
        blocks: rootBlocks.map((b, idx) => ({ ...b, x: 44, y: 34 + idx * 145 })),
      },
    },
    null,
    2
  );
}

// ---------- SD: BLOCK CODING ----------
const SD_BLOCKS_FREE_STARTER = makeBlockDoc([
  blk(
    'kiko_start',
    undefined,
    undefined,
    blk(
      'kiko_pen_color',
      { COLOR: '#1D4ED8' },
      undefined,
      blk(
        'kiko_repeat',
        { TIMES: 2 },
        {
          DO: {
            block: blk(
              'kiko_forward',
              { DIST: 110 },
              undefined,
              blk('kiko_turn_right', { ANGLE: 90 })
            ),
          },
        }
      )
    )
  ),
]);

const SD_BLOCKS_FREE_SOLUTION = makeBlockDoc([
  blk(
    'kiko_start',
    undefined,
    undefined,
    blk(
      'kiko_pen_color',
      { COLOR: '#1D4ED8' },
      undefined,
      blk(
        'kiko_repeat',
        { TIMES: 4 },
        {
          DO: {
            block: blk(
              'kiko_forward',
              { DIST: 110 },
              undefined,
              blk('kiko_turn_right', { ANGLE: 90 })
            ),
          },
        },
        blk('kiko_say', { TEXT: 'Persegi Kiko selesai!' })
      )
    )
  ),
]);

const SD_BLOCKS_ADV_STARTER = makeBlockDoc([
  blk(
    'kiko_start',
    undefined,
    undefined,
    blk(
      'kiko_set_var',
      { VAR: 'sisi', VAL: 5 },
      undefined,
      blk(
        'kiko_pen_color',
        { COLOR: '#EAB308' },
        undefined,
        blk(
          'kiko_repeat',
          { TIMES: 3 },
          {
            DO: {
              block: blk(
                'kiko_forward',
                { DIST: 120 },
                undefined,
                blk('kiko_turn_right', { ANGLE: 144 })
              ),
            },
          }
        )
      )
    )
  ),
]);

const SD_BLOCKS_ADV_SOLUTION = makeBlockDoc([
  blk(
    'kiko_start',
    undefined,
    undefined,
    blk(
      'kiko_set_var',
      { VAR: 'sisi', VAL: 5 },
      undefined,
      blk(
        'kiko_pen_color',
        { COLOR: '#EAB308' },
        undefined,
        blk('kiko_if_else', { VAR: 'sisi', OP: '==', VAL: 5 }, {
          THEN: {
            block: blk(
              'kiko_repeat',
              { TIMES: 5 },
              {
                DO: {
                  block: blk(
                    'kiko_forward',
                    { DIST: 130 },
                    undefined,
                    blk('kiko_turn_right', { ANGLE: 144 })
                  ),
                },
              },
              blk('kiko_say', { TEXT: 'Bintang Emas 5 sudut!' })
            ),
          },
          ELSE: {
            block: blk('kiko_say', { TEXT: 'Bukan bintang!' }),
          },
        })
      )
    )
  ),
]);

const SCRATCH_BLOCKS = makeBlockDoc([
  blk(
    'kiko_start',
    undefined,
    undefined,
    blk(
      'kiko_pen_color',
      { COLOR: '#65A30D' },
      undefined,
      blk('kiko_circle', { RADIUS: 60 }, undefined, blk('kiko_say', { TEXT: 'Halo dari Kiko!' }))
    )
  ),
]);

export const LAB_TEMPLATES: LabTemplate[] = [
  // =========================================================
  // JENJANG SD
  // =========================================================
  {
    id: 'sd-blocks-square',
    grade: 'sd',
    track: 'blocks',
    tier: 'free',
    title: 'Kotak Ajaib Kiko',
    subtitle: 'Belajar perulangan (loop) untuk menggambar persegi rapi',
    xpReward: 50,
    files: { 'blocks.json': SD_BLOCKS_FREE_STARTER },
    missionTitle: 'Misi 1: Bantu Kiko Menggambar Persegi Utuh!',
    missionGoal:
      'Ubah jumlah ulangi menjadi 4 kali agar membentuk persegi lengkap, lalu tambahkan blok "Kiko bicara".',
    criteria: [
      {
        id: 'sd-b1-c1',
        label: 'Pakai blok "Ulangi 4 kali"',
        mode: 'static',
        checkStatic: (files) => /"TIMES"\s*:\s*4\b/.test(files['blocks.json'] ?? ''),
      },
      {
        id: 'sd-b1-c2',
        label: 'Tambahkan blok "Kiko bicara"',
        mode: 'static',
        checkStatic: (files) => (files['blocks.json'] ?? '').includes('kiko_say'),
      },
      {
        id: 'sd-b1-c3',
        label: 'Jalankan blok & gambar tampil di kanvas',
        mode: 'runtime',
        checkRuntime: (res) =>
          res.ok &&
          (res.turtleCommands?.filter((c) => c.type === 'move').length ?? 0) >= 4,
      },
    ],
    hints: [
      'Klik angka "2" di balok oranye "🔁 Ulangi", lalu ubah menjadi angka 4.',
      'Buka kategori "🎨 Pena & Pesan" di kiri, tarik balok "💬 Kiko bicara", lalu tempel di paling bawah.',
      'Klik tombol hijau-lime "Jalankan Blok!" untuk mengecek gambar persegi Kiko.',
    ],
    solutionFiles: { 'blocks.json': SD_BLOCKS_FREE_SOLUTION },
  },
  {
    id: 'sd-blocks-star-logic',
    grade: 'sd',
    track: 'blocks',
    tier: 'advance',
    title: 'Bintang Emas & Keputusan',
    subtitle: 'Menggabungkan variabel, kondisi Jika-Maka, dan sudut bintang 144°',
    xpReward: 80,
    files: { 'blocks.json': SD_BLOCKS_ADV_STARTER },
    missionTitle: 'Misi Lanjutan: Bintang 5 Sudut dengan Jika-Maka',
    missionGoal:
      'Gunakan blok "Jika-Maka" untuk mengecek variabel sisi = 5, lalu ulangi 5 kali menggambar bintang.',
    criteria: [
      {
        id: 'sd-b2-c1',
        label: 'Gunakan blok kondisi "Jika ... Maka"',
        mode: 'static',
        checkStatic: (files) => (files['blocks.json'] ?? '').includes('kiko_if_else'),
      },
      {
        id: 'sd-b2-c2',
        label: 'Set perulangan bintang menjadi 5 kali',
        mode: 'static',
        checkStatic: (files) => /"TIMES"\s*:\s*5\b/.test(files['blocks.json'] ?? ''),
      },
      {
        id: 'sd-b2-c3',
        label: 'Jalankan hingga terbentuk 5 garis bintang',
        mode: 'runtime',
        checkRuntime: (res) =>
          res.ok &&
          (res.turtleCommands?.filter((c) => c.type === 'move').length ?? 0) >= 5,
      },
    ],
    hints: [
      'Ambil balok "🤔 Jika ... maka" dari kategori "🔁 Kontrol".',
      'Atur syaratnya menjadi: Jika sisi = 5 maka...',
      'Masukkan blok "🔁 Ulangi 5 kali" yang berisi Maju 130 dan Belok kanan 144 ke dalam bagian "lakukan".',
    ],
    solutionFiles: { 'blocks.json': SD_BLOCKS_ADV_SOLUTION },
  },
  {
    id: 'sd-turtle-house',
    grade: 'sd',
    track: 'turtle',
    tier: 'free',
    title: 'Rumah Mini Kiko',
    subtitle: 'Menggambar dinding persegi dan atap segitiga dengan Python Turtle',
    xpReward: 50,
    files: {
      'turtle_art.py': `import turtle

kiko = turtle.Turtle()
kiko.pensize(4)
kiko.pencolor("#1D4ED8")

# 1. Gambar dinding persegi
for i in range(4):
    kiko.forward(100)
    kiko.right(90)

# 2. Lengkapi atap segitiga di atas dinding!
kiko.pencolor("#EF4444")
# Ubah perintah di bawah ini agar menggambar segitiga (3 sisi, belok kiri 120)
kiko.forward(100)
`,
    },
    missionTitle: 'Misi: Pasang Atap Segitiga Rumah Kiko!',
    missionGoal:
      'Gunakan perulangan `for` sebanyak 3 kali dengan `left(120)` dan `begin_fill()` untuk atap rumah.',
    criteria: [
      {
        id: 'sd-t1-c1',
        label: 'Gunakan perulangan range(3) untuk atap',
        mode: 'static',
        checkStatic: (files) => /range\(\s*3\s*\)/.test(files['turtle_art.py'] ?? ''),
      },
      {
        id: 'sd-t1-c2',
        label: 'Pakai perintah begin_fill() & end_fill()',
        mode: 'static',
        checkStatic: (files) => {
          const code = files['turtle_art.py'] ?? '';
          return code.includes('begin_fill') && code.includes('end_fill');
        },
      },
      {
        id: 'sd-t1-c3',
        label: 'Jalankan kode tanpa error dengan >= 7 garis',
        mode: 'runtime',
        checkRuntime: (res) =>
          res.ok &&
          (res.turtleCommands?.filter((c) => c.type === 'move').length ?? 0) >= 7,
      },
    ],
    hints: [
      'Sebelum menggambar atap, tambahkan `kiko.fillcolor("#F97316")` dan `kiko.begin_fill()`.',
      'Buat loop `for i in range(3):` lalu di dalamnya `kiko.forward(100)` dan `kiko.left(120)`.',
      'Tutup pewarnaan dengan `kiko.end_fill()` setelah loop selesai.',
    ],
    solutionFiles: {
      'turtle_art.py': `import turtle

kiko = turtle.Turtle()
kiko.pensize(4)
kiko.pencolor("#1D4ED8")

# 1. Gambar dinding persegi
for i in range(4):
    kiko.forward(100)
    kiko.right(90)

# 2. Atap segitiga berwarna oranye
kiko.pencolor("#EF4444")
kiko.fillcolor("#F97316")
kiko.begin_fill()
for i in range(3):
    kiko.forward(100)
    kiko.left(120)
kiko.end_fill()
`,
    },
  },
  {
    id: 'sd-turtle-flower',
    grade: 'sd',
    track: 'turtle',
    tier: 'advance',
    title: 'Bunga Geometris Berputar',
    subtitle: 'Pola kelopak bunga warna-warni memakai nested loop',
    xpReward: 75,
    files: {
      'turtle_art.py': `import turtle

kiko = turtle.Turtle()
kiko.pensize(2)
warna = ["#1D4ED8", "#8B5CF6", "#EC4899", "#F97316", "#65A30D", "#06B6D4"]

# Gambar 6 kelopak bunga lingkaran
for i in range(6):
    kiko.pencolor(warna[i])
    kiko.circle(55)
    # Tambahkan kiko.right(60) di sini agar melingkar!
`,
    },
    missionTitle: 'Misi Lanjutan: Putar Kelopak Bunga 360°!',
    missionGoal:
      'Putar Kiko sebesar 60 derajat tiap selesai menggambar kelopak, atau tambah jadi 12 kelopak!',
    criteria: [
      {
        id: 'sd-t2-c1',
        label: 'Panggil kiko.right(...) atau kiko.left(...) di dalam loop',
        mode: 'static',
        checkStatic: (files) => /\.(right|rt|left|lt)\(/.test(files['turtle_art.py'] ?? ''),
      },
      {
        id: 'sd-t2-c2',
        label: 'Gunakan minimal 6 perintah circle()',
        mode: 'runtime',
        checkRuntime: (res) =>
          res.ok &&
          (res.turtleCommands?.filter((c) => c.type === 'circle').length ?? 0) >= 6,
      },
      {
        id: 'sd-t2-c3',
        label: 'Tambahkan batang bunga hijau di bawah kelopak',
        mode: 'static',
        checkStatic: (files) => /forward\(/.test(files['turtle_art.py'] ?? ''),
      },
    ],
    hints: [
      'Di dalam loop `for i in range(6):`, tambahkan `kiko.right(60)`.',
      'Setelah loop selesai, ubah warna ke hijau (`#16A34A`), arahkan ke bawah (`kiko.setheading(270)`), lalu `kiko.forward(140)` untuk batangnya.',
    ],
    solutionFiles: {
      'turtle_art.py': `import turtle

kiko = turtle.Turtle()
kiko.pensize(3)
warna = ["#1D4ED8", "#8B5CF6", "#EC4899", "#F97316", "#65A30D", "#06B6D4"]

for i in range(6):
    kiko.pencolor(warna[i])
    kiko.circle(55)
    kiko.right(60)

kiko.pencolor("#16A34A")
kiko.pensize(5)
kiko.setheading(270)
kiko.forward(140)
`,
    },
  },
  {
    id: 'sd-web-card',
    grade: 'sd',
    track: 'web',
    tier: 'free',
    title: 'Kartu Nama Ceria',
    subtitle: 'Membuat halaman web mini pertamamu dengan HTML, CSS & JS',
    xpReward: 50,
    files: {
      'index.html': `<div class="kartu">
  <div class="badge">⭐ Kelas Coding SD</div>
  <h1>Halo, Aku Kiko!</h1>
  <p>Cita-citaku menjadi pembuat game yang hebat.</p>
  <button id="btnSapa">Sapa Kiko 👋</button>
  <p id="pesan"></p>
</div>`,
      'style.css': `body {
  margin: 0;
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: #F4F7FC;
  font-family: system-ui, sans-serif;
}

.kartu {
  background: white;
  border: 3px solid #1D4ED8;
  border-radius: 20px;
  padding: 24px;
  max-width: 300px;
  text-align: center;
  box-shadow: 0 12px 24px rgba(29, 78, 216, 0.12);
}

.badge {
  display: inline-block;
  background: #C6F64D;
  color: #0F172A;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 13px;
}

button {
  background: #1D4ED8;
  color: white;
  border: none;
  padding: 10px 18px;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
}`,
      'script.js': `const tombol = document.getElementById("btnSapa");
const pesan = document.getElementById("pesan");

tombol.addEventListener("click", () => {
  pesan.textContent = "Semangat belajar coding hari ini! 🚀";
  console.log("Tombol sapa diklik!");
});`,
    },
    missionTitle: 'Misi: Ubah Kartu Nama Jadi Milikmu!',
    missionGoal:
      'Ganti teks nama di `<h1>` menjadi namamu sendiri, tambahkan tag `<p>` hobi, dan cetak log di `script.js`.',
    criteria: [
      {
        id: 'sd-w1-c1',
        label: 'Ubah judul <h1> selain "Halo, Aku Kiko!"',
        mode: 'static',
        checkStatic: (files) => {
          const html = files['index.html'] ?? '';
          return /<h1>.*<\/h1>/i.test(html) && !html.includes('Halo, Aku Kiko!');
        },
      },
      {
        id: 'sd-w1-c2',
        label: 'Atur border-radius atau warna background di CSS',
        mode: 'static',
        checkStatic: (files) => /background\s*:/.test(files['style.css'] ?? ''),
      },
      {
        id: 'sd-w1-c3',
        label: 'Jalankan & log pesan ke konsol',
        mode: 'runtime',
        checkRuntime: (res, files) =>
          res.ok && /console\.log\s*\(/.test(files['script.js'] ?? ''),
      },
    ],
    hints: [
      'Buka tab `index.html`, lalu ganti `Halo, Aku Kiko!` menjadi `Halo, Aku [Namamu]!`.',
      'Di tab `script.js`, tambahkan `console.log("Kartu webku siap!");` di baris paling atas.',
    ],
    solutionFiles: {
      'index.html': `<div class="kartu">
  <div class="badge">⭐ Kelas Coding SD</div>
  <h1>Halo, Aku Bintang!</h1>
  <p>Hobiku menggambar robot dan belajar membuat web di Kodie.</p>
  <button id="btnSapa">Sapa Aku 👋</button>
  <p id="pesan"></p>
</div>`,
      'style.css': `body {
  margin: 0;
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #DBEAFE, #ECFCCB);
  font-family: system-ui, sans-serif;
}

.kartu {
  background: white;
  border: 3px solid #1D4ED8;
  border-radius: 20px;
  padding: 24px;
  max-width: 300px;
  text-align: center;
  box-shadow: 0 12px 24px rgba(29, 78, 216, 0.14);
}

.badge {
  display: inline-block;
  background: #C6F64D;
  color: #0F172A;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 13px;
}

button {
  background: #1D4ED8;
  color: white;
  border: none;
  padding: 10px 18px;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
}`,
      'script.js': `console.log("Kartu nama berhasil dimuat!");
const tombol = document.getElementById("btnSapa");
const pesan = document.getElementById("pesan");

tombol.addEventListener("click", () => {
  pesan.textContent = "Semangat belajar coding hari ini! 🚀";
  console.log("Tombol sapa diklik!");
});`,
    },
  },
  {
    id: 'sd-web-mood',
    grade: 'sd',
    track: 'web',
    tier: 'advance',
    title: 'Tombol Mood Kiko',
    subtitle: 'Mengubah warna & teks halaman saat tombol diklik',
    xpReward: 70,
    files: {
      'index.html': `<main class="box">
  <div id="wajah" style="font-size: 56px;">🤖</div>
  <h2 id="status">Kiko Siap!</h2>
  <div class="aksi">
    <button id="btnSenang">Senang 😄</button>
    <button id="btnSemangat">Semangat 🔥</button>
  </div>
</main>`,
      'style.css': `body {
  margin: 0;
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: #F4F7FC;
  font-family: system-ui, sans-serif;
  transition: background 0.3s ease;
}
.box {
  background: white;
  padding: 28px;
  border-radius: 20px;
  text-align: center;
  box-shadow: 0 10px 25px rgba(15, 23, 42, 0.1);
}
.aksi { display: flex; gap: 10px; justify-content: center; }
button {
  background: #1D4ED8;
  color: white;
  border: none;
  border-radius: 10px;
  padding: 10px 14px;
  font-weight: 700;
  cursor: pointer;
}`,
      'script.js': `const wajah = document.getElementById("wajah");
const statusEl = document.getElementById("status");

document.getElementById("btnSenang").addEventListener("click", () => {
  wajah.textContent = "😄";
  statusEl.textContent = "Kiko senang sekali!";
  document.body.style.background = "#ECFCCB";
});`,
    },
    missionTitle: 'Misi Lanjutan: Aktifkan Tombol Semangat!',
    missionGoal:
      'Tambahkan event listener untuk `#btnSemangat` agar mengubah emoji, teks, dan warna latar halaman.',
    criteria: [
      {
        id: 'sd-w2-c1',
        label: 'Gunakan #btnSemangat di script.js',
        mode: 'static',
        checkStatic: (files) => (files['script.js'] ?? '').includes('btnSemangat'),
      },
      {
        id: 'sd-w2-c2',
        label: 'Ubah document.body.style.background minimal 2 kali',
        mode: 'static',
        checkStatic: (files) =>
          ((files['script.js'] ?? '').match(/style\.background/g)?.length ?? 0) >= 2,
      },
      {
        id: 'sd-w2-c3',
        label: 'Tambahkan console.log saat halaman berjalan',
        mode: 'runtime',
        checkRuntime: (res, files) =>
          res.ok && /console\.log/.test(files['script.js'] ?? ''),
      },
    ],
    hints: [
      'Salin blok `addEventListener` milik `btnSenang`, lalu ganti ID-nya menjadi `"btnSemangat"`.',
      'Tambahkan `console.log("Tombol Mood siap!");` di akhir `script.js`.',
    ],
    solutionFiles: {
      'index.html': `<main class="box">
  <div id="wajah" style="font-size: 56px;">🤖</div>
  <h2 id="status">Kiko Siap!</h2>
  <div class="aksi">
    <button id="btnSenang">Senang 😄</button>
    <button id="btnSemangat">Semangat 🔥</button>
  </div>
</main>`,
      'style.css': `body {
  margin: 0;
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: #F4F7FC;
  font-family: system-ui, sans-serif;
  transition: background 0.3s ease;
}
.box {
  background: white;
  padding: 28px;
  border-radius: 20px;
  text-align: center;
  box-shadow: 0 10px 25px rgba(15, 23, 42, 0.1);
}
.aksi { display: flex; gap: 10px; justify-content: center; }
button {
  background: #1D4ED8;
  color: white;
  border: none;
  border-radius: 10px;
  padding: 10px 14px;
  font-weight: 700;
  cursor: pointer;
}`,
      'script.js': `const wajah = document.getElementById("wajah");
const statusEl = document.getElementById("status");

document.getElementById("btnSenang").addEventListener("click", () => {
  wajah.textContent = "😄";
  statusEl.textContent = "Kiko senang sekali!";
  document.body.style.background = "#ECFCCB";
});

document.getElementById("btnSemangat").addEventListener("click", () => {
  wajah.textContent = "🔥";
  statusEl.textContent = "Kiko siap ngoding!";
  document.body.style.background = "#DBEAFE";
});

console.log("Tombol Mood Kiko aktif!");`,
    },
  },

  // =========================================================
  // JENJANG SMP
  // =========================================================
  {
    id: 'smp-web-profile',
    grade: 'smp',
    track: 'web',
    tier: 'free',
    title: 'Kartu Profil Pelajar Kodie',
    subtitle: 'Flexbox layout, hover button, dan interaksi DOM + Console',
    xpReward: 50,
    files: {
      'index.html': `<section class="profile-card">
  <div class="avatar">👩‍💻</div>
  <h2>Nadia Putri</h2>
  <p class="role">Siswa SMP · Calon Web Developer</p>
  <div class="skills">
    <span>HTML</span>
    <span>CSS</span>
    <span>JS</span>
  </div>
  <button id="followBtn">Ikuti Profil</button>
  <p id="counterText">Pengikut: 120</p>
</section>`,
      'style.css': `body {
  margin: 0;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #F4F7FC;
  font-family: system-ui, sans-serif;
}

.profile-card {
  width: 310px;
  background: #ffffff;
  border-radius: 20px;
  padding: 24px;
  text-align: center;
  border: 1px solid #E2E8F0;
  box-shadow: 0 16px 32px rgba(15, 23, 42, 0.08);
}

.avatar {
  width: 68px;
  height: 68px;
  margin: 0 auto 12px;
  border-radius: 50%;
  background: #DBEAFE;
  display: grid;
  place-items: center;
  font-size: 32px;
}

.role { color: #475569; font-size: 14px; }

.skills {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin: 14px 0;
}

.skills span {
  background: #EFF6FF;
  color: #1D4ED8;
  font-weight: 600;
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 999px;
}

button {
  width: 100%;
  padding: 10px;
  border: none;
  border-radius: 12px;
  background: #1D4ED8;
  color: #ffffff;
  font-weight: 700;
  cursor: pointer;
}`,
      'script.js': `let followers = 120;
const btn = document.getElementById("followBtn");
const counterText = document.getElementById("counterText");

btn.addEventListener("click", () => {
  followers += 1;
  counterText.textContent = "Pengikut: " + followers;
  console.log("Total pengikut sekarang:", followers);
});`,
    },
    missionTitle: 'Misi: Tambah Fitur Bio & Log Awal Halaman',
    missionGoal:
      'Tambahkan elemen daftar/badge skill ke-4 di HTML, ubah warna hover tombol di CSS, dan cetak log sambutan di JS.',
    criteria: [
      {
        id: 'smp-w1-c1',
        label: 'Minimal ada 4 tag <span> di bagian .skills',
        mode: 'static',
        checkStatic: (files) =>
          ((files['index.html'] ?? '').match(/<span>/gi)?.length ?? 0) >= 4,
      },
      {
        id: 'smp-w1-c2',
        label: 'Tambahkan aturan button:hover di style.css',
        mode: 'static',
        checkStatic: (files) => /button:hover/.test(files['style.css'] ?? ''),
      },
      {
        id: 'smp-w1-c3',
        label: 'Jalankan preview tanpa error JS',
        mode: 'runtime',
        checkRuntime: (res, files) =>
          res.ok && /console\.log/.test(files['script.js'] ?? ''),
      },
    ],
    hints: [
      'Di tab `index.html`, tambahkan `<span>Python</span>` di dalam `<div class="skills">`.',
      'Di tab `style.css`, tambahkan `button:hover { background: #1E40AF; }`.',
      'Tambahkan `console.log("Profil siap ditampilkan!");` di `script.js`.',
    ],
    solutionFiles: {
      'index.html': `<section class="profile-card">
  <div class="avatar">👩‍💻</div>
  <h2>Nadia Putri</h2>
  <p class="role">Siswa SMP · Calon Web Developer</p>
  <div class="skills">
    <span>HTML</span>
    <span>CSS</span>
    <span>JS</span>
    <span>Python</span>
  </div>
  <button id="followBtn">Ikuti Profil</button>
  <p id="counterText">Pengikut: 120</p>
</section>`,
      'style.css': `body {
  margin: 0;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #F4F7FC;
  font-family: system-ui, sans-serif;
}

.profile-card {
  width: 310px;
  background: #ffffff;
  border-radius: 20px;
  padding: 24px;
  text-align: center;
  border: 1px solid #E2E8F0;
  box-shadow: 0 16px 32px rgba(15, 23, 42, 0.08);
}

.avatar {
  width: 68px;
  height: 68px;
  margin: 0 auto 12px;
  border-radius: 50%;
  background: #DBEAFE;
  display: grid;
  place-items: center;
  font-size: 32px;
}

.role { color: #475569; font-size: 14px; }

.skills {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  margin: 14px 0;
}

.skills span {
  background: #EFF6FF;
  color: #1D4ED8;
  font-weight: 600;
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 999px;
}

button {
  width: 100%;
  padding: 10px;
  border: none;
  border-radius: 12px;
  background: #1D4ED8;
  color: #ffffff;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
}

button:hover {
  background: #0F172A;
}`,
      'script.js': `console.log("Profil pelajar siap!");
let followers = 120;
const btn = document.getElementById("followBtn");
const counterText = document.getElementById("counterText");

btn.addEventListener("click", () => {
  followers += 1;
  counterText.textContent = "Pengikut: " + followers;
  console.log("Total pengikut sekarang:", followers);
});`,
    },
  },
  {
    id: 'smp-web-allowance',
    grade: 'smp',
    track: 'web',
    tier: 'advance',
    title: 'Kalkulator Uang Jajan Mini',
    subtitle: 'Membaca input angka, menghitung selisih, dan update DOM real-time',
    xpReward: 75,
    files: {
      'index.html': `<div class="app">
  <h2>💰 Target Tabungan</h2>
  <label>Uang Saku (Rp): <input id="saku" type="number" value="20000" /></label>
  <label>Jajan Hari Ini (Rp): <input id="jajan" type="number" value="12000" /></label>
  <button id="hitungBtn">Hitung Sisa Tabungan</button>
  <p id="hasil">Klik tombol untuk menghitung.</p>
</div>`,
      'style.css': `body {
  font-family: system-ui, sans-serif;
  background: #F4F7FC;
  display: grid;
  place-items: center;
  min-height: 100vh;
  margin: 0;
}
.app {
  background: white;
  padding: 24px;
  border-radius: 16px;
  width: 300px;
  display: grid;
  gap: 12px;
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.08);
}
label { display: grid; gap: 4px; font-size: 13px; font-weight: 600; color: #334155; }
input { padding: 8px 10px; border: 1px solid #CBD5E1; border-radius: 8px; }
button {
  background: #1D4ED8;
  color: white;
  border: none;
  padding: 10px;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
}`,
      'script.js': `const sakuInput = document.getElementById("saku");
const jajanInput = document.getElementById("jajan");
const hasilEl = document.getElementById("hasil");

document.getElementById("hitungBtn").addEventListener("click", () => {
  const saku = Number(sakuInput.value);
  const jajan = Number(jajanInput.value);
  // TODO: Hitung sisa = saku - jajan lalu tampilkan!
  console.log("Data terbaca:", saku, jajan);
});`,
    },
    missionTitle: 'Misi Lanjutan: Hitung & Cek Sisa Tabungan',
    missionGoal:
      'Hitung `sisa = saku - jajan`, tampilkan ke `#hasil`, dan beri peringatan jika jajan melebihi uang saku.',
    criteria: [
      {
        id: 'smp-w2-c1',
        label: 'Hitung variabel sisa = saku - jajan',
        mode: 'static',
        checkStatic: (files) => /saku\s*-\s*jajan/.test(files['script.js'] ?? ''),
      },
      {
        id: 'smp-w2-c2',
        label: 'Gunakan percabangan if (sisa < 0) atau if (sisa >= 0)',
        mode: 'static',
        checkStatic: (files) => /if\s*\(/.test(files['script.js'] ?? ''),
      },
      {
        id: 'smp-w2-c3',
        label: 'Ubah hasilEl.textContent dan jalankan tanpa error',
        mode: 'runtime',
        checkRuntime: (res, files) =>
          res.ok && /hasilEl\.textContent\s*=/.test(files['script.js'] ?? ''),
      },
    ],
    hints: [
      'Di dalam klik `hitungBtn`, buat `const sisa = saku - jajan;`.',
      'Cek `if (sisa >= 0) { hasilEl.textContent = "Sisa tabungan: Rp" + sisa; } else { hasilEl.textContent = "Wah, melebihi uang saku!"; }`.',
    ],
    solutionFiles: {
      'index.html': `<div class="app">
  <h2>💰 Target Tabungan</h2>
  <label>Uang Saku (Rp): <input id="saku" type="number" value="20000" /></label>
  <label>Jajan Hari Ini (Rp): <input id="jajan" type="number" value="12000" /></label>
  <button id="hitungBtn">Hitung Sisa Tabungan</button>
  <p id="hasil">Klik tombol untuk menghitung.</p>
</div>`,
      'style.css': `body {
  font-family: system-ui, sans-serif;
  background: #F4F7FC;
  display: grid;
  place-items: center;
  min-height: 100vh;
  margin: 0;
}
.app {
  background: white;
  padding: 24px;
  border-radius: 16px;
  width: 300px;
  display: grid;
  gap: 12px;
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.08);
}
label { display: grid; gap: 4px; font-size: 13px; font-weight: 600; color: #334155; }
input { padding: 8px 10px; border: 1px solid #CBD5E1; border-radius: 8px; }
button {
  background: #1D4ED8;
  color: white;
  border: none;
  padding: 10px;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
}`,
      'script.js': `const sakuInput = document.getElementById("saku");
const jajanInput = document.getElementById("jajan");
const hasilEl = document.getElementById("hasil");

document.getElementById("hitungBtn").addEventListener("click", () => {
  const saku = Number(sakuInput.value);
  const jajan = Number(jajanInput.value);
  const sisa = saku - jajan;
  if (sisa >= 0) {
    hasilEl.textContent = "Mantap! Sisa tabunganmu Rp" + sisa;
  } else {
    hasilEl.textContent = "Hati-hati, pengeluaran melebihi uang saku!";
  }
  console.log("Sisa tabungan:", sisa);
});`,
    },
  },
  {
    id: 'smp-py-grade',
    grade: 'smp',
    track: 'python',
    tier: 'free',
    title: 'Kalkulator Nilai & Predikat',
    subtitle: 'Membaca input() dari stdin, f-string, dan percabangan if/elif/else',
    xpReward: 50,
    defaultStdin: 'Raka\n88',
    files: {
      'main.py': `nama = input("Masukkan nama siswa: ")
nilai = int(input("Masukkan nilai (0-100): "))

print(f"Halo {nama}, nilaimu adalah {nilai}.")

# Lengkapi percabangan if/else untuk predikat Lulus (>= 75) atau Remedial!
`,
    },
    missionTitle: 'Misi: Tentukan Predikat Lulus atau Remedial',
    missionGoal:
      'Gunakan `if nilai >= 75:` untuk mencetak kata `Lulus` atau `Remedial` memakai Python WebAssembly.',
    criteria: [
      {
        id: 'smp-p1-c1',
        label: 'Gunakan fungsi input() dari stdin',
        mode: 'static',
        checkStatic: (files) => /input\s*\(/.test(files['main.py'] ?? ''),
      },
      {
        id: 'smp-p1-c2',
        label: 'Buat percabangan if dan else',
        mode: 'static',
        checkStatic: (files) => {
          const c = files['main.py'] ?? '';
          return /\bif\b/.test(c) && /\belse\b/.test(c);
        },
      },
      {
        id: 'smp-p1-c3',
        label: 'Output mencetak status Lulus / Remedial',
        mode: 'runtime',
        checkRuntime: (res) =>
          res.ok && /lulus|remedial/i.test(res.stdout),
      },
    ],
    hints: [
      'Cek kotak "Input Program (stdin)" di kanan sudah terisi 2 baris (nama dan angka nilai).',
      'Tambahkan:\n`if nilai >= 75:`\n`    print("Status: Lulus!")`\n`else:`\n`    print("Status: Perlu Remedial")`',
    ],
    solutionFiles: {
      'main.py': `nama = input("Masukkan nama siswa: ")
nilai = int(input("Masukkan nilai (0-100): "))

print(f"Halo {nama}, nilaimu adalah {nilai}.")

if nilai >= 75:
    print("Status: Lulus!")
else:
    print("Status: Remedial")
`,
    },
  },
  {
    id: 'smp-py-multtable',
    grade: 'smp',
    track: 'python',
    tier: 'advance',
    title: 'Generator Tabel Perkalian',
    subtitle: 'Membuat fungsi `def` dan perulangan `for` dengan Python',
    xpReward: 75,
    defaultStdin: '7',
    files: {
      'main.py': `angka = int(input("Tampilkan tabel perkalian untuk angka: "))

# Buat fungsi def cetak_tabel(n): dan panggil untuk angka 1 sampai 10!
print("Siap membuat tabel untuk", angka)
`,
    },
    missionTitle: 'Misi Lanjutan: Cetak Tabel Perkalian 1–10',
    missionGoal:
      'Buat fungsi `def cetak_tabel(n):` memakai loop `for i in range(1, 11):` dan tampilkan 10 baris hasil.',
    criteria: [
      {
        id: 'smp-p2-c1',
        label: 'Definisikan fungsi dengan kata kunci def',
        mode: 'static',
        checkStatic: (files) => /\bdef\s+\w+\(/.test(files['main.py'] ?? ''),
      },
      {
        id: 'smp-p2-c2',
        label: 'Gunakan perulangan for i in range(...)',
        mode: 'static',
        checkStatic: (files) => /\bfor\s+\w+\s+in\s+range\(/.test(files['main.py'] ?? ''),
      },
      {
        id: 'smp-p2-c3',
        label: 'Output berisi minimal 10 baris perkalian',
        mode: 'runtime',
        checkRuntime: (res) =>
          res.ok && res.stdout.trim().split('\n').length >= 10,
      },
    ],
    hints: [
      'Tulis `def cetak_tabel(n):` lalu di dalamnya `for i in range(1, 11):`.',
      'Cetak tiap baris dengan `print(f"{n} x {i} = {n * i}")`, lalu panggil `cetak_tabel(angka)`.',
    ],
    solutionFiles: {
      'main.py': `angka = int(input("Tampilkan tabel perkalian untuk angka: "))

def cetak_tabel(n):
    print(f"=== Tabel Perkalian {n} ===")
    for i in range(1, 11):
        print(f"{n} x {i} = {n * i}")

cetak_tabel(angka)
`,
    },
  },
  {
    id: 'smp-turtle-star',
    grade: 'smp',
    track: 'turtle',
    tier: 'free',
    title: 'Bintang 5 Sudut Berwarna',
    subtitle: 'Eksplorasi geometri sudut luar bintang dan pengisian warna',
    xpReward: 50,
    files: {
      'turtle_art.py': `import turtle

t = turtle.Turtle()
t.pensize(3)
t.color("#1D4ED8", "#C6F64D")

# Untuk menggambar bintang 5 sudut, ubah range(3) menjadi range(5) dan sudut ke 144!
t.begin_fill()
for i in range(3):
    t.forward(150)
    t.right(144)
t.end_fill()
`,
    },
    missionTitle: 'Misi: Sempurnakan Bintang 5 Sudut Kodie',
    missionGoal:
      'Ubah perulangan menjadi 5 kali (`range(5)`) agar membentuk bintang sempurna berwarna Lime.',
    criteria: [
      {
        id: 'smp-t1-c1',
        label: 'Gunakan perulangan range(5)',
        mode: 'static',
        checkStatic: (files) => /range\(\s*5\s*\)/.test(files['turtle_art.py'] ?? ''),
      },
      {
        id: 'smp-t1-c2',
        label: 'Belok dengan sudut bintang 144 derajat',
        mode: 'static',
        checkStatic: (files) => /(right|left)\(\s*144\s*\)/.test(files['turtle_art.py'] ?? ''),
      },
      {
        id: 'smp-t1-c3',
        label: 'Gambar selesai dengan 5 garis & end_fill',
        mode: 'runtime',
        checkRuntime: (res) =>
          res.ok &&
          (res.turtleCommands?.filter((c) => c.type === 'move').length ?? 0) >= 5 &&
          Boolean(res.turtleCommands?.some((c) => c.type === 'end_fill')),
      },
    ],
    hints: [
      'Ganti `range(3)` menjadi `range(5)` supaya kelima sudut bintang tersambung kembali ke titik awal.',
    ],
    solutionFiles: {
      'turtle_art.py': `import turtle

t = turtle.Turtle()
t.pensize(3)
t.color("#1D4ED8", "#C6F64D")

t.begin_fill()
for i in range(5):
    t.forward(150)
    t.right(144)
t.end_fill()
`,
    },
  },
  {
    id: 'smp-turtle-spiral',
    grade: 'smp',
    track: 'turtle',
    tier: 'advance',
    title: 'Spiral Pelangi Kiko',
    subtitle: 'Memadukan list warna dan variabel panjang langkah bertumbuh',
    xpReward: 75,
    files: {
      'turtle_art.py': `import turtle

t = turtle.Turtle()
t.pensize(2)
warna = ["#1D4ED8", "#06B6D4", "#65A30D", "#EAB308", "#F97316", "#EC4899"]

# Ganti 12 menjadi 36 agar spiralnya panjang dan memukau!
for i in range(12):
    t.pencolor(warna[i % len(warna)])
    t.forward(10 + i * 5)
    t.right(59)
`,
    },
    missionTitle: 'Misi Lanjutan: Buat Spiral Pelangi 36 Sisi',
    missionGoal:
      'Ubah jumlah putaran minimal menjadi `36` dan tambahkan warna latar gelap `turtle.bgcolor("#0F172A")`.',
    criteria: [
      {
        id: 'smp-t2-c1',
        label: 'Atur latar kanvas memakai bgcolor("#0F172A")',
        mode: 'static',
        checkStatic: (files) => /bgcolor\(/.test(files['turtle_art.py'] ?? ''),
      },
      {
        id: 'smp-t2-c2',
        label: 'Gunakan >= 36 garis spiral',
        mode: 'runtime',
        checkRuntime: (res) =>
          res.ok &&
          (res.turtleCommands?.filter((c) => c.type === 'move').length ?? 0) >= 36,
      },
      {
        id: 'smp-t2-c3',
        label: 'Gunakan operator modulo (%) untuk ganti warna',
        mode: 'static',
        checkStatic: (files) => /%/.test(files['turtle_art.py'] ?? ''),
      },
    ],
    hints: [
      'Tambahkan `turtle.bgcolor("#0F172A")` setelah `import turtle`.',
      'Ubah `range(12)` menjadi `range(42)` agar pola spiral terlihat jelas!',
    ],
    solutionFiles: {
      'turtle_art.py': `import turtle

turtle.bgcolor("#0F172A")
t = turtle.Turtle()
t.pensize(2)
warna = ["#38BDF8", "#C6F64D", "#FACC15", "#FB923C", "#F472B6", "#A78BFA"]

for i in range(42):
    t.pencolor(warna[i % len(warna)])
    t.forward(10 + i * 4)
    t.right(59)
`,
    },
  },
  {
    id: 'smp-sql-library',
    grade: 'smp',
    track: 'sql',
    tier: 'free',
    title: 'Katalog Buku Perpustakaan',
    subtitle: 'Membuat tabel, mengisi data, dan menyaring dengan SELECT WHERE',
    xpReward: 50,
    files: {
      'query.sql': `CREATE TABLE buku (
  id INTEGER PRIMARY KEY,
  judul TEXT,
  kategori TEXT,
  tahun INTEGER
);

INSERT INTO buku VALUES (1, 'Logika Python Seru', 'Informatika', 2024);
INSERT INTO buku VALUES (2, 'Petualangan Sains', 'Sains', 2022);
INSERT INTO buku VALUES (3, 'Dasar HTML & CSS', 'Informatika', 2025);
INSERT INTO buku VALUES (4, 'Sejarah Nusantara', 'Sejarah', 2021);

-- Tampilkan semua buku, lalu coba tambahkan filter WHERE kategori = 'Informatika'!
SELECT * FROM buku;
`,
    },
    missionTitle: 'Misi: Saring Buku Kategori Informatika',
    missionGoal:
      'Tambahkan 1 buku baru dengan `INSERT INTO` dan filter query memakai `WHERE kategori = \'Informatika\'`.',
    criteria: [
      {
        id: 'smp-s1-c1',
        label: 'Gunakan klausa WHERE pada SELECT',
        mode: 'static',
        checkStatic: (files) => /\bWHERE\b/i.test(files['query.sql'] ?? ''),
      },
      {
        id: 'smp-s1-c2',
        label: 'Minimal ada 5 baris INSERT INTO buku',
        mode: 'static',
        checkStatic: (files) =>
          ((files['query.sql'] ?? '').match(/INSERT\s+INTO/gi)?.length ?? 0) >= 5,
      },
      {
        id: 'smp-s1-c3',
        label: 'Query berhasil menampilkan tabel hasil',
        mode: 'runtime',
        checkRuntime: (res) => res.ok && (res.sqlTables?.length ?? 0) >= 1,
      },
    ],
    hints: [
      'Tambahkan 1 baris lagi: `INSERT INTO buku VALUES (5, \'Algoritma SMP\', \'Informatika\', 2025);`.',
      'Ubah query terakhir menjadi `SELECT judul, tahun FROM buku WHERE kategori = \'Informatika\';`.',
    ],
    solutionFiles: {
      'query.sql': `CREATE TABLE buku (
  id INTEGER PRIMARY KEY,
  judul TEXT,
  kategori TEXT,
  tahun INTEGER
);

INSERT INTO buku VALUES (1, 'Logika Python Seru', 'Informatika', 2024);
INSERT INTO buku VALUES (2, 'Petualangan Sains', 'Sains', 2022);
INSERT INTO buku VALUES (3, 'Dasar HTML & CSS', 'Informatika', 2025);
INSERT INTO buku VALUES (4, 'Sejarah Nusantara', 'Sejarah', 2021);
INSERT INTO buku VALUES (5, 'Algoritma SMP', 'Informatika', 2025);

SELECT id, judul, kategori, tahun
FROM buku
WHERE kategori = 'Informatika'
ORDER BY tahun DESC;
`,
    },
  },
  {
    id: 'smp-sql-club',
    grade: 'smp',
    track: 'sql',
    tier: 'advance',
    title: 'Rekap Nilai Ekstrakurikuler',
    subtitle: 'Mengelompokkan data memakai GROUP BY, COUNT, dan AVG',
    xpReward: 75,
    files: {
      'query.sql': `CREATE TABLE ekskul (
  siswa TEXT,
  klub TEXT,
  skor INTEGER
);

INSERT INTO ekskul VALUES ('Alya', 'Robotik', 92);
INSERT INTO ekskul VALUES ('Bima', 'Coding', 88);
INSERT INTO ekskul VALUES ('Citra', 'Robotik', 85);
INSERT INTO ekskul VALUES ('Dika', 'Coding', 95);
INSERT INTO ekskul VALUES ('Eka', 'Desain', 90);

-- Lengkapi query di bawah untuk menghitung rata-rata skor tiap klub!
SELECT klub, skor FROM ekskul;
`,
    },
    missionTitle: 'Misi Lanjutan: Rata-Rata Skor per Klub (GROUP BY)',
    missionGoal:
      'Hitung `COUNT(*)` dan `AVG(skor)` yang dikelompokkan dengan `GROUP BY klub` dan diurutkan `ORDER BY`.',
    criteria: [
      {
        id: 'smp-s2-c1',
        label: 'Gunakan fungsi agregasi AVG(skor)',
        mode: 'static',
        checkStatic: (files) => /\bAVG\s*\(/i.test(files['query.sql'] ?? ''),
      },
      {
        id: 'smp-s2-c2',
        label: 'Gunakan klausa GROUP BY dan ORDER BY',
        mode: 'static',
        checkStatic: (files) => {
          const q = files['query.sql'] ?? '';
          return /\bGROUP\s+BY\b/i.test(q) && /\bORDER\s+BY\b/i.test(q);
        },
      },
      {
        id: 'smp-s2-c3',
        label: 'Hasil query mengembalikan ringkasan tiap klub',
        mode: 'runtime',
        checkRuntime: (res) =>
          res.ok &&
          (res.sqlTables?.[0]?.values.length ?? 0) >= 3 &&
          (res.sqlTables?.[0]?.columns.length ?? 0) >= 2,
      },
    ],
    hints: [
      'Ganti query terakhir menjadi:\n`SELECT klub, COUNT(*) AS jumlah_anggota, ROUND(AVG(skor), 1) AS rata_skor FROM ekskul GROUP BY klub ORDER BY rata_skor DESC;`',
    ],
    solutionFiles: {
      'query.sql': `CREATE TABLE ekskul (
  siswa TEXT,
  klub TEXT,
  skor INTEGER
);

INSERT INTO ekskul VALUES ('Alya', 'Robotik', 92);
INSERT INTO ekskul VALUES ('Bima', 'Coding', 88);
INSERT INTO ekskul VALUES ('Citra', 'Robotik', 85);
INSERT INTO ekskul VALUES ('Dika', 'Coding', 95);
INSERT INTO ekskul VALUES ('Eka', 'Desain', 90);

SELECT klub, COUNT(*) AS anggota, ROUND(AVG(skor), 1) AS rata_skor
FROM ekskul
GROUP BY klub
ORDER BY rata_skor DESC;
`,
    },
  },

  // =========================================================
  // JENJANG SMA
  // =========================================================
  {
    id: 'sma-py-stats',
    grade: 'sma',
    track: 'python',
    tier: 'free',
    title: 'Analisis Data Nilai Kelas',
    subtitle: 'List parsing dari stdin, fungsi statistik, dan formatting presisi',
    xpReward: 50,
    defaultStdin: '78 85 92 64 90 88',
    files: {
      'main.py': `data_str = input().strip().split()
nilai = [int(x) for x in data_str]

def rata_rata(angka):
    return sum(angka) / len(angka)

# Hitung juga nilai tertinggi (max) dan jumlah siswa di atas 80!
print(f"Jumlah data: {len(nilai)}")
print(f"Rata-rata  : {rata_rata(nilai):.2f}")
`,
    },
    missionTitle: 'Misi: Lengkapi Statistik Nilai Tertinggi & Lulus KKM',
    missionGoal:
      'Tambahkan perhitungan `max(nilai)` dan hitung berapa banyak nilai `>= 80` menggunakan fungsi atau list comprehension.',
    criteria: [
      {
        id: 'sma-p1-c1',
        label: 'Gunakan fungsi max(...) atau loop mencari maksimum',
        mode: 'static',
        checkStatic: (files) => /\bmax\s*\(/.test(files['main.py'] ?? ''),
      },
      {
        id: 'sma-p1-c2',
        label: 'Filter nilai yang >= 80',
        mode: 'static',
        checkStatic: (files) => />=\s*80/.test(files['main.py'] ?? ''),
      },
      {
        id: 'sma-p1-c3',
        label: 'Jalankan dengan stdin & hasilkan minimal 3 baris output',
        mode: 'runtime',
        checkRuntime: (res) =>
          res.ok && res.stdout.trim().split('\n').length >= 3,
      },
    ],
    hints: [
      'Gunakan `tertinggi = max(nilai)` untuk mencari nilai paling besar.',
      'Hitung siswa di atas KKM 80: `lulus = [x for x in nilai if x >= 80]`, lalu `print(f"Di atas 80 : {len(lulus)} siswa")`.',
    ],
    solutionFiles: {
      'main.py': `data_str = input().strip().split()
nilai = [int(x) for x in data_str]

def rata_rata(angka):
    return sum(angka) / len(angka)

tertinggi = max(nilai)
lulus = [x for x in nilai if x >= 80]

print(f"Jumlah data: {len(nilai)}")
print(f"Rata-rata  : {rata_rata(nilai):.2f}")
print(f"Tertinggi  : {tertinggi}")
print(f"Nilai >= 80: {len(lulus)} siswa")
`,
    },
  },
  {
    id: 'sma-py-osn-prime',
    grade: 'sma',
    track: 'python',
    tier: 'advance',
    title: 'Filter Bilangan Prima (Latihan OSN)',
    subtitle: 'Optimasi pengecekan bilangan prima hingga akar N (`O(sqrt(N))`)',
    xpReward: 90,
    defaultStdin: '10 40',
    files: {
      'main.py': `awal, akhir = map(int, input().split())

def is_prima(n):
    if n < 2:
        return False
    # Lengkapi loop pengecekan faktor sampai int(n**0.5) + 1!
    return True

prima = [x for x in range(awal, akhir + 1) if is_prima(x)]
print("Bilangan prima:", prima)
`,
    },
    missionTitle: 'Misi OSN: Saring Bilangan Prima Rentang [A..B]',
    missionGoal:
      'Lengkapi fungsi `is_prima(n)` dengan cek pembagi hingga akar `n` agar rentang `10 40` menghasilkan tepat 8 prima.',
    criteria: [
      {
        id: 'sma-p2-c1',
        label: 'Gunakan perulangan di dalam fungsi is_prima',
        mode: 'static',
        checkStatic: (files) => /def\s+is_prima[\s\S]*for\s+/.test(files['main.py'] ?? ''),
      },
      {
        id: 'sma-p2-c2',
        label: 'Gunakan operator modulo (%) untuk cek habis dibagi',
        mode: 'static',
        checkStatic: (files) => /n\s*%\s*\w+\s*==\s*0/.test(files['main.py'] ?? ''),
      },
      {
        id: 'sma-p2-c3',
        label: 'Output memuat 11, 13, 17 ... hingga 37 untuk input "10 40"',
        mode: 'runtime',
        checkRuntime: (res) =>
          res.ok &&
          res.stdout.includes('11') &&
          res.stdout.includes('37') &&
          !res.stdout.includes('15'),
      },
    ],
    hints: [
      'Di dalam `is_prima(n)`: `for i in range(2, int(n ** 0.5) + 1):`',
      'Jika `n % i == 0: return False`.',
    ],
    solutionFiles: {
      'main.py': `awal, akhir = map(int, input().split())

def is_prima(n):
    if n < 2:
        return False
    for i in range(2, int(n ** 0.5) + 1):
        if n % i == 0:
            return False
    return True

prima = [x for x in range(awal, akhir + 1) if is_prima(x)]
print(f"Ditemukan {len(prima)} prima:", prima)
`,
    },
  },
  {
    id: 'sma-cpp-array',
    grade: 'sma',
    track: 'cpp',
    tier: 'free',
    title: 'Penjumlahan & Rata-Rata Array',
    subtitle: 'Dasar C++ Informatika SMA: cin, array statis, loop for, dan cout',
    xpReward: 60,
    defaultStdin: '5\n10 20 30 40 50',
    files: {
      'main.cpp': `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;

    int nilai[100];
    int total = 0;

    for (int i = 0; i < n; i++) {
        cin >> nilai[i];
        total += nilai[i];
    }

    cout << "Total = " << total << endl;
    // Hitung dan cetak rata-rata (double rata = (double)total / n;)!
    return 0;
}
`,
    },
    missionTitle: 'Misi C++: Hitung Total & Rata-Rata Array',
    missionGoal:
      'Hitung rata-rata bertipe `double` dari array input `stdin` dan cetak dengan `cout`.',
    criteria: [
      {
        id: 'sma-c1-c1',
        label: 'Deklarasikan variabel bertipe double atau float',
        mode: 'static',
        checkStatic: (files) => /\b(double|float)\b/.test(files['main.cpp'] ?? ''),
      },
      {
        id: 'sma-c1-c2',
        label: 'Gunakan operasi pembagian / n',
        mode: 'static',
        checkStatic: (files) => /\/\s*n\b/.test(files['main.cpp'] ?? ''),
      },
      {
        id: 'sma-c1-c3',
        label: 'Program selesai dengan exit code 0 dan cetak Total = 150',
        mode: 'runtime',
        checkRuntime: (res) =>
          res.ok && res.exitCode === 0 && res.stdout.includes('150') && res.stdout.includes('30'),
      },
    ],
    hints: [
      'Tambahkan `double rata = (double)total / n;` sebelum `return 0;`.',
      'Lalu cetak dengan `cout << "Rata-rata = " << rata << endl;`.',
    ],
    solutionFiles: {
      'main.cpp': `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;

    int nilai[100];
    int total = 0;

    for (int i = 0; i < n; i++) {
        cin >> nilai[i];
        total += nilai[i];
    }

    double rata = (double)total / n;
    cout << "Total = " << total << endl;
    cout << "Rata-rata = " << rata << endl;
    return 0;
}
`,
    },
  },
  {
    id: 'sma-cpp-osn-max',
    grade: 'sma',
    track: 'cpp',
    tier: 'advance',
    title: 'Latihan OSN: Maksimum & FPB (GCD)',
    subtitle: 'Menulis fungsi C++ dan algoritma Euclid untuk soal seleksi OSN',
    xpReward: 100,
    defaultStdin: '48 18\n4\n12 95 43 81',
    files: {
      'main.cpp': `#include <iostream>
using namespace std;

int fpb(int a, int b) {
    // Gunakan algoritma Euclid: while (b != 0) { ... }
    return a;
}

int main() {
    int x, y;
    cin >> x >> y;

    int n;
    cin >> n;
    int arr[100];
    for (int i = 0; i < n; i++) {
        cin >> arr[i];
    }

    cout << "FPB(" << x << ", " << y << ") = " << fpb(x, y) << endl;
    return 0;
}
`,
    },
    missionTitle: 'Misi OSN C++: Hitung FPB Euclid & Nilai Maksimum',
    missionGoal:
      'Lengkapi fungsi `fpb(a, b)` dengan algoritma Euclid dan cari nilai maksimum pada `arr[]`.',
    criteria: [
      {
        id: 'sma-c2-c1',
        label: 'Implementasikan loop while di dalam fungsi fpb',
        mode: 'static',
        checkStatic: (files) => /int\s+fpb[\s\S]*while\s*\(/.test(files['main.cpp'] ?? ''),
      },
      {
        id: 'sma-c2-c2',
        label: 'Bandingkan elemen arr[i] untuk mencari nilai maksimum',
        mode: 'static',
        checkStatic: (files) => /arr\[i\]/.test(files['main.cpp'] ?? '') && />/.test(files['main.cpp'] ?? ''),
      },
      {
        id: 'sma-c2-c3',
        label: 'Output mencetak FPB = 6 dan Maksimum = 95',
        mode: 'runtime',
        checkRuntime: (res) =>
          res.ok && res.stdout.includes('6') && res.stdout.includes('95'),
      },
    ],
    hints: [
      'Di dalam `fpb(int a, int b)`: `while (b != 0) { int sisa = a % b; a = b; b = sisa; }` lalu `return a;`.',
      'Untuk maksimum: `int maks = arr[0]; for (int i = 1; i < n; i++) { if (arr[i] > maks) maks = arr[i]; }`.',
    ],
    solutionFiles: {
      'main.cpp': `#include <iostream>
using namespace std;

int fpb(int a, int b) {
    while (b != 0) {
        int sisa = a % b;
        a = b;
        b = sisa;
    }
    return a;
}

int main() {
    int x, y;
    cin >> x >> y;

    int n;
    cin >> n;
    int arr[100];
    for (int i = 0; i < n; i++) {
        cin >> arr[i];
    }

    int maks = arr[0];
    for (int i = 1; i < n; i++) {
        if (arr[i] > maks) {
            maks = arr[i];
        }
    }

    cout << "FPB(" << x << ", " << y << ") = " << fpb(x, y) << endl;
    cout << "Nilai Maksimum = " << maks << endl;
    return 0;
}
`,
    },
  },
  {
    id: 'sma-sql-join',
    grade: 'sma',
    track: 'sql',
    tier: 'free',
    title: 'Relasi Siswa & Kursus (JOIN)',
    subtitle: 'Menghubungkan dua tabel relasional dengan INNER JOIN',
    xpReward: 60,
    files: {
      'query.sql': `CREATE TABLE siswa (
  id INTEGER PRIMARY KEY,
  nama TEXT,
  kelas TEXT
);

CREATE TABLE pendaftaran (
  id INTEGER PRIMARY KEY,
  siswa_id INTEGER,
  kursus TEXT,
  nilai INTEGER
);

INSERT INTO siswa VALUES (1, 'Fajar', 'XI-A'), (2, 'Gita', 'XI-B'), (3, 'Hana', 'XII-A');
INSERT INTO pendaftaran VALUES
  (1, 1, 'Algoritma C++', 90),
  (2, 2, 'SQL Data', 86),
  (3, 3, 'TypeScript Web', 94);

-- Gabungkan tabel siswa dan pendaftaran memakai INNER JOIN!
SELECT * FROM pendaftaran;
`,
    },
    missionTitle: 'Misi SQL: Gabungkan Nama Siswa & Kursusnya (JOIN)',
    missionGoal:
      'Ganti query terakhir memakai `INNER JOIN` pada `siswa.id = pendaftaran.siswa_id` dan urutkan berdasar `nilai DESC`.',
    criteria: [
      {
        id: 'sma-s1-c1',
        label: 'Gunakan kata kunci JOIN ... ON',
        mode: 'static',
        checkStatic: (files) => /\bJOIN\b[\s\S]*\bON\b/i.test(files['query.sql'] ?? ''),
      },
      {
        id: 'sma-s1-c2',
        label: 'Urutkan hasil memakai ORDER BY ... DESC',
        mode: 'static',
        checkStatic: (files) => /\bORDER\s+BY\b[\s\S]*\bDESC\b/i.test(files['query.sql'] ?? ''),
      },
      {
        id: 'sma-s1-c3',
        label: 'Tabel hasil menampilkan kolom nama dan kursus',
        mode: 'runtime',
        checkRuntime: (res) =>
          res.ok &&
          Boolean(
            res.sqlTables?.some(
              (t) =>
                t.columns.some((c) => c.toLowerCase().includes('nama')) &&
                t.columns.some((c) => c.toLowerCase().includes('kursus'))
            )
          ),
      },
    ],
    hints: [
      'Gunakan query:\n`SELECT s.nama, s.kelas, p.kursus, p.nilai FROM siswa s INNER JOIN pendaftaran p ON s.id = p.siswa_id ORDER BY p.nilai DESC;`',
    ],
    solutionFiles: {
      'query.sql': `CREATE TABLE siswa (
  id INTEGER PRIMARY KEY,
  nama TEXT,
  kelas TEXT
);

CREATE TABLE pendaftaran (
  id INTEGER PRIMARY KEY,
  siswa_id INTEGER,
  kursus TEXT,
  nilai INTEGER
);

INSERT INTO siswa VALUES (1, 'Fajar', 'XI-A'), (2, 'Gita', 'XI-B'), (3, 'Hana', 'XII-A');
INSERT INTO pendaftaran VALUES
  (1, 1, 'Algoritma C++', 90),
  (2, 2, 'SQL Data', 86),
  (3, 3, 'TypeScript Web', 94);

SELECT s.nama, s.kelas, p.kursus, p.nilai
FROM siswa s
INNER JOIN pendaftaran p ON s.id = p.siswa_id
ORDER BY p.nilai DESC;
`,
    },
  },
  {
    id: 'sma-sql-leaderboard',
    grade: 'sma',
    track: 'sql',
    tier: 'advance',
    title: 'Leaderboard XP Kodie (HAVING)',
    subtitle: 'Agregasi JOIN + GROUP BY + HAVING untuk ranking siswa aktif',
    xpReward: 90,
    files: {
      'query.sql': `CREATE TABLE pelajar (id INTEGER PRIMARY KEY, nama TEXT, jenjang TEXT);
CREATE TABLE aktivitas (pelajar_id INTEGER, misi TEXT, xp INTEGER);

INSERT INTO pelajar VALUES (1, 'Kevin', 'SMA'), (2, 'Laras', 'SMA'), (3, 'Mira', 'SMP');
INSERT INTO aktivitas VALUES
  (1, 'OSN C++', 100), (1, 'SQL Join', 60),
  (2, 'TypeScript', 50),
  (3, 'Python Basic', 50), (3, 'Turtle Star', 75);

-- Tampilkan pelajar dengan total XP >= 100 menggunakan GROUP BY & HAVING!
SELECT nama, jenjang FROM pelajar;
`,
    },
    missionTitle: 'Misi Lanjutan: Leaderboard Total XP >= 100',
    missionGoal:
      'Jumlahkan `SUM(a.xp)` tiap pelajar dengan `JOIN`, kelompokkan `GROUP BY`, dan saring `HAVING total_xp >= 100`.',
    criteria: [
      {
        id: 'sma-s2-c1',
        label: 'Gunakan fungsi SUM(...) dan JOIN',
        mode: 'static',
        checkStatic: (files) => {
          const q = files['query.sql'] ?? '';
          return /\bSUM\s*\(/i.test(q) && /\bJOIN\b/i.test(q);
        },
      },
      {
        id: 'sma-s2-c2',
        label: 'Gunakan klausa GROUP BY dan HAVING',
        mode: 'static',
        checkStatic: (files) => {
          const q = files['query.sql'] ?? '';
          return /\bGROUP\s+BY\b/i.test(q) && /\bHAVING\b/i.test(q);
        },
      },
      {
        id: 'sma-s2-c3',
        label: 'Hasil leaderboard menampilkan Kevin & Mira (2 baris)',
        mode: 'runtime',
        checkRuntime: (res) =>
          res.ok && (res.sqlTables?.[0]?.values.length ?? 0) === 2,
      },
    ],
    hints: [
      'Gunakan query:\n`SELECT p.nama, p.jenjang, SUM(a.xp) AS total_xp FROM pelajar p INNER JOIN aktivitas a ON p.id = a.pelajar_id GROUP BY p.id, p.nama, p.jenjang HAVING SUM(a.xp) >= 100 ORDER BY total_xp DESC;`',
    ],
    solutionFiles: {
      'query.sql': `CREATE TABLE pelajar (id INTEGER PRIMARY KEY, nama TEXT, jenjang TEXT);
CREATE TABLE aktivitas (pelajar_id INTEGER, misi TEXT, xp INTEGER);

INSERT INTO pelajar VALUES (1, 'Kevin', 'SMA'), (2, 'Laras', 'SMA'), (3, 'Mira', 'SMP');
INSERT INTO aktivitas VALUES
  (1, 'OSN C++', 100), (1, 'SQL Join', 60),
  (2, 'TypeScript', 50),
  (3, 'Python Basic', 50), (3, 'Turtle Star', 75);

SELECT p.nama, p.jenjang, SUM(a.xp) AS total_xp
FROM pelajar p
INNER JOIN aktivitas a ON p.id = a.pelajar_id
GROUP BY p.id, p.nama, p.jenjang
HAVING SUM(a.xp) >= 100
ORDER BY total_xp DESC;
`,
    },
  },
  {
    id: 'sma-ts-student',
    grade: 'sma',
    track: 'typescript',
    tier: 'free',
    title: 'Kartu Pelajar Bertipe Aman',
    subtitle: 'Belajar interface, anotasi tipe fungsi, dan pengecekan strict TypeScript',
    xpReward: 60,
    files: {
      'main.ts': `interface Pelajar {
  nama: string;
  kelas: string;
  xp: number;
}

function cetakKartu(siswa: Pelajar): string {
  return \`\${siswa.nama} (\${siswa.kelas}) — \${siswa.xp} XP\`;
}

// Perbaiki atau lengkapi objek pelajar di bawah ini!
const pelajar1: Pelajar = {
  nama: "Rizky Pratama",
  kelas: "XI IPA 2",
  xp: 250,
};

console.log(cetakKartu(pelajar1));
`,
    },
    missionTitle: 'Misi TypeScript: Tambah Properti `lulus` & Fungsi Cek Rank',
    missionGoal:
      'Tambahkan field `aktif: boolean` ke `interface Pelajar`, buat fungsi bertipe return `string`, lalu jalankan dengan 0 type error.',
    criteria: [
      {
        id: 'sma-ts1-c1',
        label: 'Tambahkan properti bertipe boolean pada interface',
        mode: 'static',
        checkStatic: (files) => /:\s*boolean/.test(files['main.ts'] ?? ''),
      },
      {
        id: 'sma-ts1-c2',
        label: 'Minimal buat 2 variabel bertipe Pelajar atau array Pelajar[]',
        mode: 'static',
        checkStatic: (files) => {
          const code = files['main.ts'] ?? '';
          const varCount = code.match(/\b(const|let|var)\s+\w+\s*:\s*Pelajar\b/g)?.length ?? 0;
          return varCount >= 2 || /:\s*Pelajar\[\]/.test(code);
        },
      },
      {
        id: 'sma-ts1-c3',
        label: 'Kompilasi TypeScript valid (0 error) & cetak ke konsol',
        mode: 'runtime',
        checkRuntime: (res) =>
          res.ok && (res.tsDiagnostics?.length ?? 0) === 0 && res.stdout.length > 0,
      },
    ],
    hints: [
      'Tambahkan `aktif: boolean;` di dalam `interface Pelajar`.',
      'Tambahkan `aktif: true` pada `pelajar1`, lalu buat `const pelajar2: Pelajar = { ... };` dan cetak dengan `console.log(cetakKartu(pelajar2))`.',
    ],
    solutionFiles: {
      'main.ts': `interface Pelajar {
  nama: string;
  kelas: string;
  xp: number;
  aktif: boolean;
}

function cetakKartu(siswa: Pelajar): string {
  const status = siswa.aktif ? "Aktif" : "Nonaktif";
  return \`\${siswa.nama} (\${siswa.kelas}) — \${siswa.xp} XP [\${status}]\`;
}

const pelajar1: Pelajar = {
  nama: "Rizky Pratama",
  kelas: "XI IPA 2",
  xp: 250,
  aktif: true,
};

const pelajar2: Pelajar = {
  nama: "Sinta Dewi",
  kelas: "XII IPS 1",
  xp: 420,
  aktif: true,
};

console.log(cetakKartu(pelajar1));
console.log(cetakKartu(pelajar2));
`,
    },
  },
  {
    id: 'sma-ts-discount',
    grade: 'sma',
    track: 'typescript',
    tier: 'advance',
    title: 'Sistem Paket E-Course (Union Type)',
    subtitle: 'Memakai Union Type, Record, dan `.reduce()` secara type-safe',
    xpReward: 90,
    files: {
      'main.ts': `type Tier = "gratis" | "pro" | "osn";

interface Kursus {
  judul: string;
  tier: Tier;
  harga: number;
}

const daftarKursus: Kursus[] = [
  { judul: "HTML Dasar", tier: "gratis", harga: 0 },
  { judul: "Algoritma OSN", tier: "osn", harga: 150000 },
  { judul: "Fullstack TS", tier: "pro", harga: 200000 },
];

// Gunakan .filter() dan .reduce() untuk menghitung total harga kursus berbayar!
console.log("Jumlah kursus:", daftarKursus.length);
`,
    },
    missionTitle: 'Misi Lanjutan: Hitung Total Harga Kursus Berbayar',
    missionGoal:
      'Gunakan `.filter()` untuk menyaring kursus `tier !== "gratis"` dan `.reduce()` untuk menjumlahkan total biayanya.',
    criteria: [
      {
        id: 'sma-ts2-c1',
        label: 'Gunakan metode .filter(...) pada daftarKursus',
        mode: 'static',
        checkStatic: (files) => /\.filter\s*\(/.test(files['main.ts'] ?? ''),
      },
      {
        id: 'sma-ts2-c2',
        label: 'Gunakan metode .reduce(...) untuk menjumlahkan harga',
        mode: 'static',
        checkStatic: (files) => /\.reduce\s*\(/.test(files['main.ts'] ?? ''),
      },
      {
        id: 'sma-ts2-c3',
        label: 'Kompilasi 0 type error dan mencetak angka 350000',
        mode: 'runtime',
        checkRuntime: (res) =>
          res.ok && res.stdout.includes('350000'),
      },
    ],
    hints: [
      'Filter: `const berbayar = daftarKursus.filter((k) => k.tier !== "gratis");`',
      'Reduce: `const total = berbayar.reduce((acc, k) => acc + k.harga, 0);` lalu `console.log("Total:", total);`.',
    ],
    solutionFiles: {
      'main.ts': `type Tier = "gratis" | "pro" | "osn";

interface Kursus {
  judul: string;
  tier: Tier;
  harga: number;
}

const daftarKursus: Kursus[] = [
  { judul: "HTML Dasar", tier: "gratis", harga: 0 },
  { judul: "Algoritma OSN", tier: "osn", harga: 150000 },
  { judul: "Fullstack TS", tier: "pro", harga: 200000 },
];

const berbayar = daftarKursus.filter((k) => k.tier !== "gratis");
const totalHarga = berbayar.reduce((acc, item) => acc + item.harga, 0);

console.log("Kursus berbayar:", berbayar.length);
console.log("Total harga:", totalHarga);
`,
    },
  },
  {
    id: 'sma-web-hero',
    grade: 'sma',
    track: 'web',
    tier: 'free',
    title: 'Landing Hero E-Course Mini',
    subtitle: 'Grid modern, gradient typography, dan counter interaktif',
    xpReward: 50,
    files: {
      'index.html': `<header class="hero">
  <span class="pill">🚀 Kodie Academy SMA</span>
  <h1>Kuasai Algoritma &amp; Web Modern</h1>
  <p>Siapkan dirimu menghadapi OSN Informatika dan karier teknologi masa depan.</p>
  <button id="joinBtn">Gabung Tantangan (<span id="count">42</span> Siswa)</button>
</header>`,
      'style.css': `body {
  margin: 0;
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: #0F172A;
  color: #F8FAFC;
  font-family: system-ui, sans-serif;
}

.hero {
  max-width: 420px;
  padding: 28px;
  border-radius: 20px;
  background: linear-gradient(145deg, #1E293B, #0F172A);
  border: 1px solid #334155;
}

.pill {
  background: #C6F64D;
  color: #0F172A;
  font-weight: 800;
  font-size: 12px;
  padding: 4px 12px;
  border-radius: 999px;
}

button {
  margin-top: 12px;
  background: #1D4ED8;
  color: white;
  border: none;
  padding: 12px 18px;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
}`,
      'script.js': `let peserta = 42;
const btn = document.getElementById("joinBtn");
const countSpan = document.getElementById("count");

btn.addEventListener("click", () => {
  peserta += 1;
  countSpan.textContent = String(peserta);
  console.log("Peserta baru bergabung! Total:", peserta);
});`,
    },
    missionTitle: 'Misi Web SMA: Kustomisasi Hero & Tambah Efek Interaktif',
    missionGoal:
      'Tambahkan elemen daftar fitur `<ul>` di HTML, styling `.hero h1` di CSS, dan cetak log awal saat halaman siap.',
    criteria: [
      {
        id: 'sma-w1-c1',
        label: 'Tambahkan daftar <ul><li> di dalam hero',
        mode: 'static',
        checkStatic: (files) => /<ul>[\s\S]*<li>/i.test(files['index.html'] ?? ''),
      },
      {
        id: 'sma-w1-c2',
        label: 'Tambahkan styling CSS untuk h1 atau ul',
        mode: 'static',
        checkStatic: (files) => /\.hero\s+h1|ul\s*\{/i.test(files['style.css'] ?? ''),
      },
      {
        id: 'sma-w1-c3',
        label: 'Jalankan halaman dan kirim log ke konsol',
        mode: 'runtime',
        checkRuntime: (res, files) =>
          res.ok && /console\.log/.test(files['script.js'] ?? ''),
      },
    ],
    hints: [
      'Tambahkan `<ul><li>Latihan OSN C++</li><li>Web & SQL</li></ul>` di bawah `<p>`.',
      'Di `style.css`, tambahkan `.hero h1 { font-size: 26px; margin: 14px 0 8px; }`.',
      'Tambahkan `console.log("Landing hero aktif!");` di baris awal `script.js`.',
    ],
    solutionFiles: {
      'index.html': `<header class="hero">
  <span class="pill">🚀 Kodie Academy SMA</span>
  <h1>Kuasai Algoritma &amp; Web Modern</h1>
  <p>Siapkan dirimu menghadapi OSN Informatika dan karier teknologi masa depan.</p>
  <ul>
    <li>Latihan C++ &amp; Python OSN</li>
    <li>Database SQL &amp; TypeScript</li>
  </ul>
  <button id="joinBtn">Gabung Tantangan (<span id="count">42</span> Siswa)</button>
</header>`,
      'style.css': `body {
  margin: 0;
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: #0F172A;
  color: #F8FAFC;
  font-family: system-ui, sans-serif;
}

.hero {
  max-width: 420px;
  padding: 28px;
  border-radius: 20px;
  background: linear-gradient(145deg, #1E293B, #0F172A);
  border: 1px solid #334155;
}

.hero h1 {
  font-size: 24px;
  margin: 14px 0 8px;
  color: #FFFFFF;
}

ul {
  padding-left: 18px;
  color: #CBD5E1;
  font-size: 14px;
}

.pill {
  background: #C6F64D;
  color: #0F172A;
  font-weight: 800;
  font-size: 12px;
  padding: 4px 12px;
  border-radius: 999px;
}

button {
  margin-top: 12px;
  background: #1D4ED8;
  color: white;
  border: none;
  padding: 12px 18px;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
}`,
      'script.js': `console.log("Landing Hero SMA dimuat!");
let peserta = 42;
const btn = document.getElementById("joinBtn");
const countSpan = document.getElementById("count");

btn.addEventListener("click", () => {
  peserta += 1;
  countSpan.textContent = String(peserta);
  console.log("Peserta baru bergabung! Total:", peserta);
});`,
    },
  },
  {
    id: 'sma-web-todo',
    grade: 'sma',
    track: 'web',
    tier: 'advance',
    title: 'Daftar Target Belajar (Todo App)',
    subtitle: 'Manajemen state array, render DOM dinamis, dan event handling',
    xpReward: 90,
    files: {
      'index.html': `<div class="todo-app">
  <h2>🎯 Target Belajar Hari Ini</h2>
  <div class="row">
    <input id="todoInput" placeholder="Tambah target baru..." />
    <button id="addBtn">Tambah</button>
  </div>
  <ul id="todoList"></ul>
</div>`,
      'style.css': `body {
  font-family: system-ui, sans-serif;
  background: #F4F7FC;
  display: grid;
  place-items: center;
  min-height: 100vh;
  margin: 0;
}
.todo-app {
  background: white;
  width: 320px;
  padding: 20px;
  border-radius: 16px;
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.08);
}
.row { display: flex; gap: 8px; }
input { flex: 1; padding: 8px 10px; border: 1px solid #CBD5E1; border-radius: 8px; }
button {
  background: #1D4ED8;
  color: white;
  border: none;
  padding: 8px 14px;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
}
ul { padding-left: 18px; margin-top: 14px; }
li { margin-bottom: 6px; color: #0F172A; }`,
      'script.js': `const todos = ["Review Binary Search", "Latihan SQL JOIN"];
const listEl = document.getElementById("todoList");
const inputEl = document.getElementById("todoInput");

function renderTodos() {
  listEl.innerHTML = "";
  todos.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    listEl.appendChild(li);
  });
}

// Tambahkan event click pada #addBtn untuk push target baru ke array todos!
renderTodos();
console.log("Todo awal:", todos.length);`,
    },
    missionTitle: 'Misi Lanjutan: Aktifkan Tombol Tambah Target',
    missionGoal:
      'Hubungkan `#addBtn` untuk menambah nilai `#todoInput` ke array `todos`, lalu panggil `renderTodos()`.',
    criteria: [
      {
        id: 'sma-w2-c1',
        label: 'Daftarkan event click pada #addBtn',
        mode: 'static',
        checkStatic: (files) => /addBtn/.test(files['script.js'] ?? ''),
      },
      {
        id: 'sma-w2-c2',
        label: 'Gunakan todos.push(...) saat input tidak kosong',
        mode: 'static',
        checkStatic: (files) => /todos\.push\s*\(/.test(files['script.js'] ?? ''),
      },
      {
        id: 'sma-w2-c3',
        label: 'Jalankan aplikasi tanpa error di konsol',
        mode: 'runtime',
        checkRuntime: (res) => res.ok,
      },
    ],
    hints: [
      'Ambil `document.getElementById("addBtn")?.addEventListener("click", () => { ... })`.',
      'Di dalamnya: cek `const val = inputEl.value.trim(); if (!val) return; todos.push(val); inputEl.value = ""; renderTodos();`.',
    ],
    solutionFiles: {
      'index.html': `<div class="todo-app">
  <h2>🎯 Target Belajar Hari Ini</h2>
  <div class="row">
    <input id="todoInput" placeholder="Tambah target baru..." />
    <button id="addBtn">Tambah</button>
  </div>
  <ul id="todoList"></ul>
</div>`,
      'style.css': `body {
  font-family: system-ui, sans-serif;
  background: #F4F7FC;
  display: grid;
  place-items: center;
  min-height: 100vh;
  margin: 0;
}
.todo-app {
  background: white;
  width: 320px;
  padding: 20px;
  border-radius: 16px;
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.08);
}
.row { display: flex; gap: 8px; }
input { flex: 1; padding: 8px 10px; border: 1px solid #CBD5E1; border-radius: 8px; }
button {
  background: #1D4ED8;
  color: white;
  border: none;
  padding: 8px 14px;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
}
ul { padding-left: 18px; margin-top: 14px; }
li { margin-bottom: 6px; color: #0F172A; }`,
      'script.js': `const todos = ["Review Binary Search", "Latihan SQL JOIN"];
const listEl = document.getElementById("todoList");
const inputEl = document.getElementById("todoInput");

function renderTodos() {
  listEl.innerHTML = "";
  todos.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    listEl.appendChild(li);
  });
}

document.getElementById("addBtn").addEventListener("click", () => {
  const val = inputEl.value.trim();
  if (!val) return;
  todos.push(val);
  inputEl.value = "";
  renderTodos();
  console.log("Target ditambahkan:", val);
});

renderTodos();
console.log("Todo awal:", todos.length);`,
    },
  },

  // =========================================================
  // KANVAS BEBAS (SCRATCHPAD) PER TRACK
  // =========================================================
  {
    id: 'scratch-blocks',
    grade: 'sd',
    track: 'blocks',
    tier: 'scratchpad',
    title: 'Kanvas Bebas Block Coding',
    subtitle: 'Bebas berkreasi menyusun blok Kiko tanpa batasan misi',
    xpReward: 0,
    files: { 'blocks.json': SCRATCH_BLOCKS },
    missionTitle: 'Kanvas Bebas',
    missionGoal: 'Eksplorasi bebas menyusun blok gerak, warna, dan perulangan.',
    criteria: [],
    hints: [],
  },
  {
    id: 'scratch-turtle',
    grade: 'smp',
    track: 'turtle',
    tier: 'scratchpad',
    title: 'Kanvas Bebas Python Turtle',
    subtitle: 'Eksplorasi bebas menggambar pola geometri Python',
    xpReward: 0,
    files: {
      'turtle_art.py': `import turtle

kiko = turtle.Turtle()
kiko.pensize(3)
kiko.pencolor("#1D4ED8")

for i in range(6):
    kiko.forward(80)
    kiko.right(60)
`,
    },
    missionTitle: 'Kanvas Bebas',
    missionGoal: 'Eksplorasi bebas perintah Turtle di kanvas.',
    criteria: [],
    hints: [],
  },
  {
    id: 'scratch-web',
    grade: 'smp',
    track: 'web',
    tier: 'scratchpad',
    title: 'Kanvas Bebas Web Stack',
    subtitle: 'Sandbox HTML + CSS + JavaScript bebas',
    xpReward: 0,
    files: {
      'index.html': `<div class="box">
  <h1>Halo dari Kodie Lab!</h1>
  <p>Edit HTML, CSS, dan JavaScript di sebelah kiri untuk melihat perubahan instan.</p>
</div>`,
      'style.css': `body {
  font-family: system-ui, sans-serif;
  background: #F4F7FC;
  display: grid;
  place-items: center;
  min-height: 100vh;
  margin: 0;
}
.box {
  background: white;
  border: 2px solid #1D4ED8;
  padding: 24px;
  border-radius: 16px;
  max-width: 360px;
  text-align: center;
}`,
      'script.js': `console.log("Web Sandbox siap digunakan!");`,
    },
    missionTitle: 'Kanvas Bebas',
    missionGoal: 'Eksplorasi bebas HTML, CSS, dan JS.',
    criteria: [],
    hints: [],
  },
  {
    id: 'scratch-python',
    grade: 'smp',
    track: 'python',
    tier: 'scratchpad',
    title: 'Kanvas Bebas Python 3',
    subtitle: 'Editor Python WebAssembly bebas bereksperimen',
    xpReward: 0,
    defaultStdin: 'Kodie',
    files: {
      'main.py': `nama = input("Siapa namamu? ")
print(f"Halo {nama}! Selamat bereksperimen dengan Python 3 di Kodie Lab.")
`,
    },
    missionTitle: 'Kanvas Bebas',
    missionGoal: 'Eksplorasi bebas Python 3 di browser.',
    criteria: [],
    hints: [],
  },
  {
    id: 'scratch-cpp',
    grade: 'sma',
    track: 'cpp',
    tier: 'scratchpad',
    title: 'Kanvas Bebas C++ (OSN)',
    subtitle: 'Editor C++ bebas dengan dukungan cin dan cout',
    xpReward: 0,
    defaultStdin: '5 7',
    files: {
      'main.cpp': `#include <iostream>
using namespace std;

int main() {
    int a, b;
    cin >> a >> b;
    cout << "Jumlah = " << (a + b) << endl;
    return 0;
}
`,
    },
    missionTitle: 'Kanvas Bebas',
    missionGoal: 'Eksplorasi bebas algoritma C++.',
    criteria: [],
    hints: [],
  },
  {
    id: 'scratch-sql',
    grade: 'sma',
    track: 'sql',
    tier: 'scratchpad',
    title: 'Kanvas Bebas SQL (SQLite)',
    subtitle: 'Editor database SQLite in-memory bebas bereksperimen',
    xpReward: 0,
    files: {
      'query.sql': `CREATE TABLE catatan (id INTEGER PRIMARY KEY, topik TEXT, status TEXT);
INSERT INTO catatan VALUES (1, 'Belajar SQL', 'Selesai'), (2, 'Latihan JOIN', 'Proses');
SELECT * FROM catatan;
`,
    },
    missionTitle: 'Kanvas Bebas',
    missionGoal: 'Eksplorasi bebas query SQLite.',
    criteria: [],
    hints: [],
  },
  {
    id: 'scratch-typescript',
    grade: 'sma',
    track: 'typescript',
    tier: 'scratchpad',
    title: 'Kanvas Bebas TypeScript',
    subtitle: 'Editor TypeScript strict mode di browser',
    xpReward: 0,
    files: {
      'main.ts': `const sapa = (nama: string): string => \`Halo \${nama}, selamat ngoding TypeScript!\`;
console.log(sapa("Pelajar Kodie"));
`,
    },
    missionTitle: 'Kanvas Bebas',
    missionGoal: 'Eksplorasi bebas TypeScript.',
    criteria: [],
    hints: [],
  },

  // =========================================================
  // LAB SIMULASI JURUSAN IT (SMA & SMP PEMINATAN — LOGIN)
  // =========================================================
  {
    id: 'sma-net-router-lan',
    grade: 'sma',
    track: 'network',
    tier: 'advance',
    title: 'Aktifkan Interface LAN Router (Cisco IOS)',
    subtitle: 'Konfigurasi hostname, IP gateway g0/0, no shutdown, dan uji ping PC',
    xpReward: 90,
    files: {
      'router_config.ios': `! Topologi: PC-Siswa (192.168.1.10) <-> SW1 <-> Router g0/0
enable
configure terminal
hostname R1-Kodie
interface g0/0
! Tambahkan IP gateway 192.168.1.1 255.255.255.0 dan nyalakan port (no shutdown)!
exit
end
show ip interface brief
ping 192.168.1.10
`,
    },
    missionTitle: 'Misi Jaringan: Nyalakan Jalur LAN ke PC-Siswa',
    missionGoal:
      'Atur `ip address 192.168.1.1 255.255.255.0` dan `no shutdown` di `interface g0/0` agar ping ke `192.168.1.10` berhasil 4/4!',
    criteria: [
      {
        id: 'net1-c1',
        label: 'Konfigurasi ip address 192.168.1.1 di g0/0',
        mode: 'static',
        checkStatic: (files) =>
          /ip\s+add(?:ress)?\s+192\.168\.1\.1\s+255\.255\.255\.0/i.test(
            files['router_config.ios'] ?? ''
          ),
      },
      {
        id: 'net1-c2',
        label: 'Aktifkan port memakai perintah no shutdown',
        mode: 'static',
        checkStatic: (files) =>
          /\bno\s+sh(?:utdown)?\b/i.test(files['router_config.ios'] ?? ''),
      },
      {
        id: 'net1-c3',
        label: 'Link PC <-> Router hijau & ping 192.168.1.10 sukses',
        mode: 'runtime',
        checkRuntime: (res) =>
          res.ok &&
          Boolean(res.networkResult?.pcToRouterUp) &&
          Boolean(
            res.networkResult?.pings.some(
              (p) => p.targetIp === '192.168.1.10' && p.success
            )
          ),
      },
    ],
    hints: [
      'Tepat di bawah baris `interface g0/0`, tambahkan dua baris ini:\n`ip address 192.168.1.1 255.255.255.0`\n`no shutdown`',
      'Pastikan `ping 192.168.1.10` berada di bagian akhir untuk menguji koneksi.',
    ],
    solutionFiles: {
      'router_config.ios': `! Topologi: PC-Siswa (192.168.1.10) <-> SW1 <-> Router g0/0
enable
configure terminal
hostname R1-Kodie
interface g0/0
ip address 192.168.1.1 255.255.255.0
no shutdown
exit
end
show ip interface brief
ping 192.168.1.10
`,
    },
  },
  {
    id: 'sma-net-routing-wan',
    grade: 'sma',
    track: 'network',
    tier: 'advance',
    title: 'Routing PC ke Server Kodie (2 Interface)',
    subtitle: 'Menghubungkan subnet LAN 192.168.1.x dan Server WAN 10.0.0.x',
    xpReward: 110,
    files: {
      'router_config.ios': `enable
configure terminal
hostname Core-Kodie
interface g0/0
ip address 192.168.1.1 255.255.255.0
no shutdown
exit
! Tambahkan konfigurasi interface g0/1 dengan IP 10.0.0.1 255.255.255.0!
end
ping 10.0.0.10
`,
    },
    missionTitle: 'Misi Lanjutan: Sambungkan PC Siswa ke Server 10.0.0.10',
    missionGoal:
      'Konfigurasikan `interface g0/1` dengan IP `10.0.0.1 255.255.255.0` dan `no shutdown` agar paket ping menembus seluruh topologi.',
    criteria: [
      {
        id: 'net2-c1',
        label: 'Masuk ke interface g0/1',
        mode: 'static',
        checkStatic: (files) =>
          /\bint(?:erface)?\s+g(?:ig(?:abitethernet)?)?0\/1\b/i.test(
            files['router_config.ios'] ?? ''
          ),
      },
      {
        id: 'net2-c2',
        label: 'Atur ip address 10.0.0.1 255.255.255.0',
        mode: 'static',
        checkStatic: (files) =>
          /ip\s+add(?:ress)?\s+10\.0\.0\.1\s+255\.255\.255\.0/i.test(
            files['router_config.ios'] ?? ''
          ),
      },
      {
        id: 'net2-c3',
        label: 'Kedua link hijau & ping 10.0.0.10 sukses 4/4',
        mode: 'runtime',
        checkRuntime: (res) =>
          res.ok &&
          Boolean(res.networkResult?.pcToRouterUp) &&
          Boolean(res.networkResult?.routerToServerUp) &&
          Boolean(
            res.networkResult?.pings.some(
              (p) => p.targetIp === '10.0.0.10' && p.success
            )
          ),
      },
    ],
    hints: [
      'Setelah `exit` dari g0/0, tambahkan:\n`interface g0/1`\n`ip address 10.0.0.1 255.255.255.0`\n`no shutdown`',
    ],
    solutionFiles: {
      'router_config.ios': `enable
configure terminal
hostname Core-Kodie
interface g0/0
ip address 192.168.1.1 255.255.255.0
no shutdown
exit
interface g0/1
ip address 10.0.0.1 255.255.255.0
no shutdown
exit
end
show ip interface brief
ping 10.0.0.10
`,
    },
  },
  {
    id: 'scratch-network',
    grade: 'sma',
    track: 'network',
    tier: 'scratchpad',
    title: 'Kanvas Bebas Cisco IOS',
    subtitle: 'Eksperimen bebas perintah Cisco IOS di topologi Router',
    xpReward: 0,
    files: {
      'router_config.ios': `enable
configure terminal
hostname Lab-Bebas
interface g0/0
ip address 192.168.1.1 255.255.255.0
no shutdown
end
show ip interface brief
ping 192.168.1.10
`,
    },
    missionTitle: 'Kanvas Bebas',
    missionGoal: 'Eksplorasi bebas perintah Cisco IOS.',
    criteria: [],
    hints: [],
  },
  {
    id: 'sma-iot-traffic',
    grade: 'sma',
    track: 'iot',
    tier: 'advance',
    title: 'Lampu Lalu Lintas Pintar (ESP32)',
    subtitle: 'Mengendalikan 3 LED (Merah, Kuning, Hijau), LCD 16x2, dan delay()',
    xpReward: 90,
    files: {
      'sketch.ino': `void setup() {
  pinMode(LED_MERAH, OUTPUT);
  pinMode(LED_KUNING, OUTPUT);
  pinMode(LED_HIJAU, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  // Fase 1: Merah (Berhenti)
  digitalWrite(LED_MERAH, HIGH);
  digitalWrite(LED_KUNING, LOW);
  digitalWrite(LED_HIJAU, LOW);
  lcdPrint("LAMPU MERAH", "Harap Berhenti!");
  Serial.println("Status: MERAH");
  delay(800);

  // Fase 2: Lengkapi lampu KUNING dan HIJAU di bawah ini!
}
`,
    },
    missionTitle: 'Misi IoT: Lengkapi Siklus Merah → Kuning → Hijau',
    missionGoal:
      'Tambahkan fase menyalakan `LED_KUNING` dan `LED_HIJAU` dengan `delay()` serta tampilan `lcdPrint()` di masing-masing fase.',
    criteria: [
      {
        id: 'iot1-c1',
        label: 'Nyalakan LED_KUNING dengan digitalWrite(..., HIGH)',
        mode: 'static',
        checkStatic: (files) =>
          /digitalWrite\s*\(\s*LED_KUNING\s*,\s*HIGH\s*\)/.test(
            files['sketch.ino'] ?? ''
          ),
      },
      {
        id: 'iot1-c2',
        label: 'Nyalakan LED_HIJAU dengan digitalWrite(..., HIGH)',
        mode: 'static',
        checkStatic: (files) =>
          /digitalWrite\s*\(\s*LED_HIJAU\s*,\s*HIGH\s*\)/.test(
            files['sketch.ino'] ?? ''
          ),
      },
      {
        id: 'iot1-c3',
        label: 'Simulasi berjalan dengan minimal 3 langkah LED',
        mode: 'runtime',
        checkRuntime: (res) =>
          res.ok &&
          (res.iotResult?.frames.length ?? 0) >= 3 &&
          Boolean(res.iotResult?.frames.some((f) => f.leds.green)),
      },
    ],
    hints: [
      'Setelah `delay(800);`, matikan LED_MERAH (`LOW`), nyalakan `LED_KUNING` (`HIGH`), panggil `lcdPrint("LAMPU KUNING", "Siap-Siap...");` dan `delay(500);`.',
      'Lalu matikan `LED_KUNING`, nyalakan `LED_HIJAU` (`HIGH`), panggil `lcdPrint("LAMPU HIJAU", "Silakan Jalan!");` dan `delay(800);`.',
    ],
    solutionFiles: {
      'sketch.ino': `void setup() {
  pinMode(LED_MERAH, OUTPUT);
  pinMode(LED_KUNING, OUTPUT);
  pinMode(LED_HIJAU, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  digitalWrite(LED_MERAH, HIGH);
  digitalWrite(LED_KUNING, LOW);
  digitalWrite(LED_HIJAU, LOW);
  lcdPrint("LAMPU MERAH", "Harap Berhenti!");
  Serial.println("Status: MERAH");
  delay(800);

  digitalWrite(LED_MERAH, LOW);
  digitalWrite(LED_KUNING, HIGH);
  lcdPrint("LAMPU KUNING", "Hati-Hati...");
  Serial.println("Status: KUNING");
  delay(500);

  digitalWrite(LED_KUNING, LOW);
  digitalWrite(LED_HIJAU, HIGH);
  lcdPrint("LAMPU HIJAU", "Silakan Jalan!");
  Serial.println("Status: HIJAU");
  delay(800);
}
`,
    },
  },
  {
    id: 'sma-iot-smart-temp',
    grade: 'sma',
    track: 'iot',
    tier: 'advance',
    title: 'Smart Home: Alarm Suhu Otomatis',
    subtitle: 'Membaca sensor suhu (A0) dan memicu Buzzer + LED Bahaya secara live',
    xpReward: 110,
    files: {
      'sketch.ino': `void setup() {
  pinMode(LED_MERAH, OUTPUT);
  pinMode(LED_HIJAU, OUTPUT);
  pinMode(BUZZER, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  int suhu = analogRead(SENSOR_SUHU);
  Serial.println("Suhu terbaca: " + suhu + " C");

  // Ubah kondisi ini agar saat suhu > 30, LED_MERAH & BUZZER menyala!
  digitalWrite(LED_HIJAU, HIGH);
  digitalWrite(LED_MERAH, LOW);
  digitalWrite(BUZZER, LOW);
  lcdPrint("Suhu: " + suhu + " C", "Status: AMAN");
  delay(400);
}
`,
    },
    missionTitle: 'Misi Smart Home: Deteksi Panas > 30°C',
    missionGoal:
      'Tambahkan `if (suhu > 30)` untuk menyalakan `LED_MERAH` dan `BUZZER`, lalu coba geser slider **Suhu** ke atas 30°C di panel kanan!',
    criteria: [
      {
        id: 'iot2-c1',
        label: 'Gunakan percabangan if (suhu > 30)',
        mode: 'static',
        checkStatic: (files) =>
          /if\s*\(\s*suhu\s*>\s*30\s*\)/.test(files['sketch.ino'] ?? ''),
      },
      {
        id: 'iot2-c2',
        label: 'Nyalakan BUZZER (HIGH) di blok bahaya',
        mode: 'static',
        checkStatic: (files) =>
          /digitalWrite\s*\(\s*BUZZER\s*,\s*HIGH\s*\)/.test(
            files['sketch.ino'] ?? ''
          ),
      },
      {
        id: 'iot2-c3',
        label: 'Uji board sukses & sensor suhu terbaca di Serial',
        mode: 'runtime',
        checkRuntime: (res) =>
          res.ok &&
          (res.iotResult?.frames.length ?? 0) >= 1 &&
          /Suhu/i.test(res.stdout),
      },
    ],
    hints: [
      'Buat struktur:\n`if (suhu > 30) {`\n`  digitalWrite(LED_MERAH, HIGH); digitalWrite(BUZZER, HIGH); digitalWrite(LED_HIJAU, LOW);`\n`  lcdPrint("BAHAYA PANAS!", "Suhu: " + suhu + " C");`\n`} else { ... }`',
      'Setelah tekan Run Kode, geser slider Suhu di kanan melewati 30°C untuk melihat alarm menyala!',
    ],
    solutionFiles: {
      'sketch.ino': `void setup() {
  pinMode(LED_MERAH, OUTPUT);
  pinMode(LED_HIJAU, OUTPUT);
  pinMode(BUZZER, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  int suhu = analogRead(SENSOR_SUHU);
  Serial.println("Suhu terbaca: " + suhu + " C");

  if (suhu > 30) {
    digitalWrite(LED_MERAH, HIGH);
    digitalWrite(BUZZER, HIGH);
    digitalWrite(LED_HIJAU, LOW);
    lcdPrint("BAHAYA PANAS!", "Suhu: " + suhu + " C");
  } else {
    digitalWrite(LED_MERAH, LOW);
    digitalWrite(BUZZER, LOW);
    digitalWrite(LED_HIJAU, HIGH);
    lcdPrint("Suhu: " + suhu + " C", "Status: AMAN");
  }
  delay(400);
}
`,
    },
  },
  {
    id: 'scratch-iot',
    grade: 'sma',
    track: 'iot',
    tier: 'scratchpad',
    title: 'Kanvas Bebas IoT ESP32',
    subtitle: 'Eksplorasi bebas LED, LCD, Buzzer, dan sensor virtual',
    xpReward: 0,
    files: {
      'sketch.ino': `void setup() {
  pinMode(LED_HIJAU, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  int cahaya = analogRead(SENSOR_CAHAYA);
  digitalWrite(LED_HIJAU, HIGH);
  lcdPrint("Cahaya Ruangan", cahaya + "% Terang");
  Serial.println("Intensitas cahaya: " + cahaya + "%");
  delay(500);
}
`,
    },
    missionTitle: 'Kanvas Bebas',
    missionGoal: 'Eksplorasi bebas mikrokontroler virtual.',
    criteria: [],
    hints: [],
  },
  {
    id: 'sma-ai-regression',
    grade: 'sma',
    track: 'ai_data',
    tier: 'advance',
    title: 'Prediksi Nilai Ujian (Regresi Linear)',
    subtitle: 'Menghitung slope & intercept di Python + grafik scatter interaktif',
    xpReward: 100,
    files: {
      'model_ai.py': `import kodie_ai

# Data: Jam Belajar (X) vs Nilai Ujian (Y)
jam = [1, 2, 3, 4, 5, 7, 8]
nilai = [52, 58, 65, 71, 78, 89, 95]

mean_x = sum(jam) / len(jam)
mean_y = sum(nilai) / len(nilai)

# Hitung slope (m) dan intercept (c) dengan metode Least Squares!
pembilang = sum((x - mean_x) * (y - mean_y) for x, y in zip(jam, nilai))
penyebut = sum((x - mean_x) ** 2 for x in jam)
slope = pembilang / penyebut
intercept = mean_y - slope * mean_x

print(f"Rumus model: y = {slope:.2f}x + {intercept:.2f}")
# Panggil kodie_ai.plot_regression(jam, nilai, slope, intercept, ...) di bawah ini!
`,
    },
    missionTitle: 'Misi AI: Visualisasikan Model Regresi & Prediksi 6 Jam',
    missionGoal:
      'Panggil `kodie_ai.plot_regression(...)` dengan parameter `test_x=6` lalu coba geser slider prediksi di grafik!',
    criteria: [
      {
        id: 'ai1-c1',
        label: 'Panggil fungsi kodie_ai.plot_regression(...)',
        mode: 'static',
        checkStatic: (files) =>
          /kodie_ai\.plot_regression\s*\(/.test(files['model_ai.py'] ?? ''),
      },
      {
        id: 'ai1-c2',
        label: 'Sertakan parameter test_x=6 untuk uji prediksi',
        mode: 'static',
        checkStatic: (files) => /test_x\s*=/.test(files['model_ai.py'] ?? ''),
      },
      {
        id: 'ai1-c3',
        label: 'Grafik regresi tampil dengan akurasi R² >= 0.9',
        mode: 'runtime',
        checkRuntime: (res) =>
          res.ok &&
          Boolean(
            res.aiResult?.charts.some(
              (c) => c.kind === 'regression' && c.r2 >= 0.9
            )
          ),
      },
    ],
    hints: [
      'Tambahkan di baris akhir:\n`kodie_ai.plot_regression(jam, nilai, slope, intercept, title="Jam Belajar vs Nilai Ujian", x_label="Jam Belajar", y_label="Nilai", test_x=6)`',
    ],
    solutionFiles: {
      'model_ai.py': `import kodie_ai

# Data: Jam Belajar (X) vs Nilai Ujian (Y)
jam = [1, 2, 3, 4, 5, 7, 8]
nilai = [52, 58, 65, 71, 78, 89, 95]

mean_x = sum(jam) / len(jam)
mean_y = sum(nilai) / len(nilai)

pembilang = sum((x - mean_x) * (y - mean_y) for x, y in zip(jam, nilai))
penyebut = sum((x - mean_x) ** 2 for x in jam)
slope = pembilang / penyebut
intercept = mean_y - slope * mean_x

prediksi_6 = slope * 6 + intercept
print(f"Rumus model : y = {slope:.2f}x + {intercept:.2f}")
print(f"Prediksi 6j : {prediksi_6:.1f}")

kodie_ai.plot_regression(
    jam,
    nilai,
    slope,
    intercept,
    title="Prediksi Nilai Ujian dari Jam Belajar",
    x_label="Jam Belajar",
    y_label="Nilai",
    test_x=6,
)
`,
    },
  },
  {
    id: 'sma-ai-sentiment',
    grade: 'sma',
    track: 'ai_data',
    tier: 'advance',
    title: 'Detektor Sentimen Review (NLP Mini)',
    subtitle: 'Klasifikasi teks positif/negatif dan evaluasi akurasi model AI',
    xpReward: 110,
    files: {
      'model_ai.py': `import kodie_ai

kata_positif = {"seru", "hebat", "bagus", "mudah", "keren"}
kata_negatif = {"sulit", "bingung", "lambat", "rusak", "membosankan"}

data_uji = [
    ("Kelas coding ini seru dan mudah", "Positif"),
    ("Materinya bagus dan keren banget", "Positif"),
    ("Jaringannya lambat dan bikin bingung", "Negatif"),
    ("Soalnya terlalu sulit", "Negatif"),
]

def tebak_sentimen(teks):
    kata = set(teks.lower().split())
    skor_pos = len(kata & kata_positif)
    skor_neg = len(kata & kata_negatif)
    return "Positif" if skor_pos >= skor_neg else "Negatif"

# Lengkapi loop evaluasi akurasi lalu panggil kodie_ai.show_metrics(...) & kodie_ai.plot_bar(...)!
print("Fungsi NLP siap dievaluasi.")
`,
    },
    missionTitle: 'Misi NLP: Evaluasi Akurasi Klasifikasi Sentimen',
    missionGoal:
      'Uji semua `data_uji` memakai `tebak_sentimen()`, tampilkan akurasi lewat `kodie_ai.show_metrics()` dan grafik lewat `kodie_ai.plot_bar()`.',
    criteria: [
      {
        id: 'ai2-c1',
        label: 'Panggil kodie_ai.show_metrics(...)',
        mode: 'static',
        checkStatic: (files) =>
          /kodie_ai\.show_metrics\s*\(/.test(files['model_ai.py'] ?? ''),
      },
      {
        id: 'ai2-c2',
        label: 'Panggil kodie_ai.plot_bar(...)',
        mode: 'static',
        checkStatic: (files) =>
          /kodie_ai\.plot_bar\s*\(/.test(files['model_ai.py'] ?? ''),
      },
      {
        id: 'ai2-c3',
        label: 'Akurasi model mencapai >= 75%',
        mode: 'runtime',
        checkRuntime: (res) =>
          res.ok && (res.aiResult?.metrics?.accuracyPct ?? 0) >= 75,
      },
    ],
    hints: [
      'Gunakan loop:\n`hasil = []`\n`for teks, asli in data_uji:`\n`    pred = tebak_sentimen(teks)`\n`    hasil.append({"input": teks, "actual": asli, "predicted": pred, "correct": pred == asli})`',
      'Hitung akurasi `benar / len(data_uji) * 100`, lalu panggil `kodie_ai.show_metrics(akurasi, len(data_uji), "NLP Sentimen Kodie", hasil)` dan `kodie_ai.plot_bar(...)`.',
    ],
    solutionFiles: {
      'model_ai.py': `import kodie_ai

kata_positif = {"seru", "hebat", "bagus", "mudah", "keren"}
kata_negatif = {"sulit", "bingung", "lambat", "rusak", "membosankan"}

data_uji = [
    ("Kelas coding ini seru dan mudah", "Positif"),
    ("Materinya bagus dan keren banget", "Positif"),
    ("Jaringannya lambat dan bikin bingung", "Negatif"),
    ("Soalnya terlalu sulit", "Negatif"),
]

def tebak_sentimen(teks):
    kata = set(teks.lower().split())
    skor_pos = len(kata & kata_positif)
    skor_neg = len(kata & kata_negatif)
    return "Positif" if skor_pos >= skor_neg else "Negatif"

hasil = []
pos_count = 0
neg_count = 0

for teks, asli in data_uji:
    pred = tebak_sentimen(teks)
    if pred == "Positif":
        pos_count += 1
    else:
        neg_count += 1
    hasil.append({
        "input": teks,
        "actual": asli,
        "predicted": pred,
        "correct": pred == asli,
    })

benar = sum(1 for h in hasil if h["correct"])
akurasi = (benar / len(data_uji)) * 100
print(f"Akurasi Model NLP: {akurasi:.1f}%")

kodie_ai.plot_bar(["Sentimen Positif", "Sentimen Negatif"], [pos_count, neg_count], title="Distribusi Prediksi Sentimen")
kodie_ai.show_metrics(akurasi, len(data_uji), "Mini NLP Sentimen Kodie", hasil)
`,
    },
  },
  {
    id: 'scratch-ai',
    grade: 'sma',
    track: 'ai_data',
    tier: 'scratchpad',
    title: 'Kanvas Bebas AI & Data Python',
    subtitle: 'Eksperimen bebas Python Data Science & kodie_ai charts',
    xpReward: 0,
    files: {
      'model_ai.py': `import kodie_ai

topik = ["Python", "Web", "Jaringan", "IoT", "AI"]
minat = [85, 78, 65, 72, 92]

kodie_ai.plot_bar(topik, minat, title="Survei Minat Siswa Kodie")
print("Rata-rata skor minat:", sum(minat) / len(minat))
`,
    },
    missionTitle: 'Kanvas Bebas',
    missionGoal: 'Eksplorasi bebas analisis data & AI.',
    criteria: [],
    hints: [],
  },
  {
    id: 'sma-api-courses',
    grade: 'sma',
    track: 'software_api',
    tier: 'advance',
    title: 'REST API Katalog Kursus (GET & POST)',
    subtitle: 'Membuat endpoint backend GET & POST lalu mengujinya via Mini Postman',
    xpReward: 100,
    files: {
      'server.ts': `interface Kursus {
  id: number;
  judul: string;
  level: string;
}

const kursusList: Kursus[] = [
  { id: 1, judul: "Algoritma Python", level: "SMP" },
  { id: 2, judul: "Persiapan OSN C++", level: "SMA" },
];

app.get("/api/kursus", () => {
  return {
    status: 200,
    body: { total: kursusList.length, data: kursusList },
  };
});

// Tambahkan endpoint app.post("/api/kursus", (req) => ...) untuk menambah data baru dengan status 201!
console.log("Server Katalog Kursus siap!");
`,
    },
    missionTitle: 'Misi Software Dev: Tambah Endpoint POST /api/kursus',
    missionGoal:
      'Buat handler `app.post("/api/kursus", (req) => ...)` yang menambahkan item ke `kursusList` dan mengembalikan status `201`.',
    criteria: [
      {
        id: 'api1-c1',
        label: 'Daftarkan route app.post("/api/kursus", ...)',
        mode: 'static',
        checkStatic: (files) =>
          /app\.post\s*\(\s*["']\/api\/kursus["']/.test(files['server.ts'] ?? ''),
      },
      {
        id: 'api1-c2',
        label: 'Kembalikan status HTTP 201 (Created)',
        mode: 'static',
        checkStatic: (files) => /status\s*:\s*201\b/.test(files['server.ts'] ?? ''),
      },
      {
        id: 'api1-c3',
        label: 'Uji POST /api/kursus mengembalikan status 201',
        mode: 'runtime',
        checkRuntime: (res) =>
          res.ok &&
          Boolean(
            res.apiResult?.smokeTests.some(
              (s) => s.method === 'POST' && s.status === 201
            ) ||
              (res.apiResult?.lastResponse?.method === 'POST' &&
                res.apiResult?.lastResponse?.status === 201)
          ),
      },
    ],
    hints: [
      'Tambahkan:\n`app.post("/api/kursus", (req) => {`\n`  const payload = req.body as { judul?: string; level?: string };`\n`  const baru = { id: kursusList.length + 1, judul: payload.judul || "Baru", level: payload.level || "SMA" };`\n`  kursusList.push(baru);`\n`  return { status: 201, body: { pesan: "Berhasil ditambah", data: baru } };`\n`});`',
    ],
    solutionFiles: {
      'server.ts': `interface Kursus {
  id: number;
  judul: string;
  level: string;
}

const kursusList: Kursus[] = [
  { id: 1, judul: "Algoritma Python", level: "SMP" },
  { id: 2, judul: "Persiapan OSN C++", level: "SMA" },
];

app.get("/api/kursus", () => {
  return {
    status: 200,
    body: { total: kursusList.length, data: kursusList },
  };
});

app.post("/api/kursus", (req) => {
  const payload = req.body as { judul?: string; level?: string };
  const baru: Kursus = {
    id: kursusList.length + 1,
    judul: payload.judul ?? "Kursus Baru",
    level: payload.level ?? "SMA",
  };
  kursusList.push(baru);
  return {
    status: 201,
    body: { pesan: "Kursus berhasil dibuat!", data: baru },
  };
});

console.log("Server Katalog Kursus siap dengan GET & POST!");
`,
    },
  },
  {
    id: 'sma-api-detail',
    grade: 'sma',
    track: 'software_api',
    tier: 'advance',
    title: 'Dynamic Route & Error 404 (/api/siswa/:id)',
    subtitle: 'Menangani parameter URL `:id` dan respons HTTP 404 Not Found',
    xpReward: 110,
    files: {
      'server.ts': `const siswaDb = [
  { id: 1, nama: "Bagas", jurusan: "Software" },
  { id: 2, nama: "Clara", jurusan: "AI & Data" },
];

app.get("/api/siswa", () => ({
  status: 200,
  body: siswaDb,
}));

// Lengkapi endpoint /api/siswa/:id di bawah ini!
app.get("/api/siswa/:id", (req) => {
  const id = Number(req.params.id);
  const ditemukan = siswaDb.find((s) => s.id === id);
  // Kembalikan 404 jika tidak ditemukan, atau 200 jika ada!
  return { status: 200, body: ditemukan ?? null };
});
`,
    },
    missionTitle: 'Misi Backend: Kembalikan Status 404 Jika ID Tidak Ada',
    missionGoal:
      'Cek `if (!ditemukan)` di dalam `/api/siswa/:id` untuk mengembalikan `{ status: 404, body: { error: "Siswa tidak ditemukan" } }`.',
    criteria: [
      {
        id: 'api2-c1',
        label: 'Gunakan parameter dinamis req.params.id',
        mode: 'static',
        checkStatic: (files) =>
          /req\.params\.id/.test(files['server.ts'] ?? ''),
      },
      {
        id: 'api2-c2',
        label: 'Kembalikan status 404 saat data tidak ada',
        mode: 'static',
        checkStatic: (files) => /status\s*:\s*404\b/.test(files['server.ts'] ?? ''),
      },
      {
        id: 'api2-c3',
        label: 'ID 1 -> 200 OK & ID 999 -> 404 Not Found',
        mode: 'runtime',
        checkRuntime: (res) =>
          res.ok &&
          Boolean(
            res.apiResult?.smokeTests.some(
              (s) => s.path === '/api/siswa/1' && s.status === 200
            )
          ) &&
          Boolean(
            res.apiResult?.smokeTests.some(
              (s) => s.path === '/api/siswa/999' && s.status === 404
            )
          ),
      },
    ],
    hints: [
      'Tambahkan `if (!ditemukan) { return { status: 404, body: { error: "Siswa tidak ditemukan" } }; }` sebelum mengembalikan `200`.',
    ],
    solutionFiles: {
      'server.ts': `const siswaDb = [
  { id: 1, nama: "Bagas", jurusan: "Software" },
  { id: 2, nama: "Clara", jurusan: "AI & Data" },
];

app.get("/api/siswa", () => ({
  status: 200,
  body: siswaDb,
}));

app.get("/api/siswa/:id", (req) => {
  const id = Number(req.params.id);
  const ditemukan = siswaDb.find((s) => s.id === id);
  if (!ditemukan) {
    return {
      status: 404,
      body: { error: \`Siswa dengan ID \${id} tidak ditemukan\` },
    };
  }
  return { status: 200, body: ditemukan };
});
`,
    },
  },
  {
    id: 'scratch-api',
    grade: 'sma',
    track: 'software_api',
    tier: 'scratchpad',
    title: 'Kanvas Bebas REST API',
    subtitle: 'Eksplorasi bebas membuat endpoint API & mengujinya via Postman mini',
    xpReward: 0,
    files: {
      'server.ts': `app.get("/api/halo", () => ({
  status: 200,
  body: { pesan: "Halo dari Mini Server Kodie!", waktu: "Siap!" },
}));

app.post("/api/echo", (req) => ({
  status: 201,
  body: { diterima: req.body },
}));
`,
    },
    missionTitle: 'Kanvas Bebas',
    missionGoal: 'Eksplorasi bebas endpoint REST API.',
    criteria: [],
    hints: [],
  },
];

export function getTemplatesForGradeAndTrack(
  grade: GradeLevel,
  track: TrackId
): LabTemplate[] {
  const gradeSpecific = LAB_TEMPLATES.filter(
    (t) => t.grade === grade && t.track === track && t.tier !== 'scratchpad'
  );
  const crossGrade =
    gradeSpecific.length > 0
      ? gradeSpecific
      : LAB_TEMPLATES.filter((t) => t.track === track && t.tier !== 'scratchpad');

  const scratchpad = LAB_TEMPLATES.filter(
    (t) => t.track === track && t.tier === 'scratchpad'
  );

  return [...crossGrade, ...scratchpad];
}

export function getTemplateById(id: string): LabTemplate | undefined {
  return LAB_TEMPLATES.find((t) => t.id === id);
}
