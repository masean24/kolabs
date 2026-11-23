import type { TrackId, WebFileKey } from '../types/lab';

export interface QuickInsertItem {
  label: string;
  snippet: string;
}

const WEB_INSERTS: Record<WebFileKey, QuickInsertItem[]> = {
  'index.html': [
    { label: '<h1>Judul</h1>', snippet: '<h1>Judul Baru</h1>\n' },
    { label: '<p>Paragraf</p>', snippet: '<p>Tulis teks di sini.</p>\n' },
    { label: '<button>', snippet: '<button id="tombol">Klik Aku!</button>\n' },
    { label: '<div class="card">', snippet: '<div class="card">\n  \n</div>\n' },
    { label: '<input />', snippet: '<input id="inputData" type="text" placeholder="Ketik..." />\n' },
  ],
  'style.css': [
    { label: 'color:', snippet: 'color: #1D4ED8;\n' },
    { label: 'background:', snippet: 'background: #F4F7FC;\n' },
    { label: 'border-radius:', snippet: 'border-radius: 16px;\n' },
    { label: 'display: flex', snippet: 'display: flex;\nalign-items: center;\ngap: 12px;\n' },
    { label: 'padding:', snippet: 'padding: 16px 24px;\n' },
  ],
  'script.js': [
    { label: 'console.log()', snippet: 'console.log("Halo Kodie!");\n' },
    { label: 'getElementById', snippet: 'const el = document.getElementById("tombol");\n' },
    { label: 'addEventListener', snippet: 'el?.addEventListener("click", () => {\n  \n});\n' },
    { label: 'function', snippet: 'function sapa(nama) {\n  return `Halo ${nama}!`;\n}\n' },
  ],
};

const TRACK_INSERTS: Record<Exclude<TrackId, 'web' | 'blocks'>, QuickInsertItem[]> = {
  python: [
    { label: 'print()', snippet: 'print("Halo Kodie!")\n' },
    { label: 'input()', snippet: 'nama = input("Nama: ")\n' },
    { label: 'for i in range', snippet: 'for i in range(5):\n    print(i)\n' },
    { label: 'if / else', snippet: 'if nilai >= 75:\n    print("Lulus")\nelse:\n    print("Belajar lagi")\n' },
    { label: 'def fungsi()', snippet: 'def hitung(x):\n    return x * 2\n' },
  ],
  turtle: [
    { label: 'forward(100)', snippet: 'kiko.forward(100)\n' },
    { label: 'right(90)', snippet: 'kiko.right(90)\n' },
    { label: 'left(90)', snippet: 'kiko.left(90)\n' },
    { label: 'pencolor()', snippet: 'kiko.pencolor("#1D4ED8")\n' },
    { label: 'begin_fill()', snippet: 'kiko.begin_fill()\n# gambar bentuk\nkiko.end_fill()\n' },
    { label: 'for loop 4x', snippet: 'for i in range(4):\n    kiko.forward(100)\n    kiko.right(90)\n' },
  ],
  cpp: [
    { label: 'cout <<', snippet: 'cout << "Hasil: " << hasil << endl;\n' },
    { label: 'cin >>', snippet: 'cin >> n;\n' },
    { label: 'for (int i = 0; ...)', snippet: 'for (int i = 0; i < n; i++) {\n    \n}\n' },
    { label: 'if / else', snippet: 'if (x > 0) {\n    \n} else {\n    \n}\n' },
    { label: 'int fungsi()', snippet: 'int tambah(int a, int b) {\n    return a + b;\n}\n' },
  ],
  sql: [
    { label: 'SELECT * FROM', snippet: 'SELECT * FROM nama_tabel;\n' },
    { label: 'WHERE', snippet: 'WHERE kondisi = "nilai"\n' },
    { label: 'GROUP BY', snippet: 'GROUP BY kolom\n' },
    { label: 'INNER JOIN', snippet: 'INNER JOIN tabel2 ON tabel1.id = tabel2.tabel1_id\n' },
    { label: 'ORDER BY DESC', snippet: 'ORDER BY skor DESC;\n' },
  ],
  typescript: [
    { label: 'interface', snippet: 'interface Siswa {\n  nama: string;\n  nilai: number;\n}\n' },
    { label: 'type Union', snippet: 'type Jenjang = "SD" | "SMP" | "SMA";\n' },
    { label: 'const fn = () =>', snippet: 'const sapa = (nama: string): string => {\n  return `Halo ${nama}`;\n};\n' },
    { label: 'console.log()', snippet: 'console.log();\n' },
    { label: '.filter()', snippet: 'const lolos = data.filter((item) => item.skor >= 80);\n' },
  ],
  software_api: [
    { label: 'app.get()', snippet: 'app.get("/api/data", () => ({\n  status: 200,\n  body: { pesan: "OK" },\n}));\n' },
    { label: 'app.post()', snippet: 'app.post("/api/data", (req) => ({\n  status: 201,\n  body: { diterima: req.body },\n}));\n' },
    { label: 'return 404', snippet: 'return { status: 404, body: { error: "Data tidak ditemukan" } };\n' },
    { label: 'req.params.id', snippet: 'const id = Number(req.params.id);\n' },
    { label: 'req.body', snippet: 'const payload = req.body;\n' },
  ],
  network: [
    { label: 'enable', snippet: 'enable\n' },
    { label: 'configure terminal', snippet: 'configure terminal\n' },
    { label: 'hostname R1-Kodie', snippet: 'hostname R1-Kodie\n' },
    { label: 'interface g0/0', snippet: 'interface g0/0\n' },
    { label: 'ip address', snippet: 'ip address 192.168.1.1 255.255.255.0\n' },
    { label: 'no shutdown', snippet: 'no shutdown\n' },
    { label: 'show ip int brief', snippet: 'show ip interface brief\n' },
    { label: 'ping 192.168.1.10', snippet: 'ping 192.168.1.10\n' },
  ],
  iot: [
    { label: 'pinMode OUTPUT', snippet: 'pinMode(LED_MERAH, OUTPUT);\n' },
    { label: 'digitalWrite HIGH', snippet: 'digitalWrite(LED_MERAH, HIGH);\n' },
    { label: 'digitalWrite LOW', snippet: 'digitalWrite(LED_MERAH, LOW);\n' },
    { label: 'analogRead(SUHU)', snippet: 'int suhu = analogRead(SENSOR_SUHU);\n' },
    { label: 'lcdPrint()', snippet: 'lcdPrint("Suhu Ruangan", "Normal");\n' },
    { label: 'delay(600)', snippet: 'delay(600);\n' },
    { label: 'Serial.println()', snippet: 'Serial.println("Status aktif");\n' },
  ],
  ai_data: [
    { label: 'import kodie_ai', snippet: 'import kodie_ai\n' },
    { label: 'plot_regression()', snippet: 'kodie_ai.plot_regression(x, y, slope, intercept, title="Grafik Prediksi", test_x=6)\n' },
    { label: 'plot_bar()', snippet: 'kodie_ai.plot_bar(["Positif", "Negatif"], [4, 2], title="Distribusi Kelas")\n' },
    { label: 'show_metrics()', snippet: 'kodie_ai.show_metrics(100, len(data), "Model AI", hasil)\n' },
    { label: 'rata-rata', snippet: 'rata = sum(x) / len(x)\n' },
  ],
};

export function getQuickInserts(
  track: TrackId,
  activeWebFile: WebFileKey = 'index.html'
): QuickInsertItem[] {
  if (track === 'blocks') return [];
  if (track === 'web') return WEB_INSERTS[activeWebFile];
  return TRACK_INSERTS[track];
}
