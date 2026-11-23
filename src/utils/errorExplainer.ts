import type { GradeLevel, TrackId } from '../types/lab';

export interface KikoErrorExplanation {
  title: string;
  explanation: string;
  tip: string;
}

/**
 * Menerjemahkan pesan error teknis dari compiler/runtime menjadi penjelasan
 * bahasa Indonesia yang ramah siswa SD–SMA dari maskot Kiko.
 */
export function explainErrorWithKiko(
  track: TrackId,
  rawError: string,
  grade: GradeLevel
): KikoErrorExplanation {
  const err = rawError || '';
  const isSd = grade === 'sd';

  if (track === 'blocks') {
    if (/kosong/i.test(err)) {
      return {
        title: 'Kanvas Blok Masih Kosong!',
        explanation:
          'Kiko belum melihat balok perintah apa pun di papan susun. Tarik balok dari menu kiri ke kanvas, ya!',
        tip: 'Mulai dengan balok biru "🚀 Saat tombol Jalankan ditekan", lalu tempelkan balok "➡️ Maju".',
      };
    }
    if (/Saat tombol Jalankan ditekan/i.test(err)) {
      return {
        title: 'Balok Mulai Belum Dipasang',
        explanation:
          'Supaya Kiko tahu harus mulai dari mana, pasang balok "🚀 Saat tombol Jalankan ditekan" tepat di paling atas tumpukan balokmu.',
        tip: 'Buka kategori "🚀 Mulai" di sebelah kiri dan sambungkan di paling atas!',
      };
    }
    return {
      title: 'Ada Sedikit Masalah di Susunan Blok',
      explanation:
        'Jumlah langkah atau pengulangan terlalu besar sehingga Kiko kecapekan menggambar.',
      tip: 'Periksa angka di dalam balok "🔁 Ulangi" agar tidak terlalu besar.',
    };
  }

  if (track === 'python' || track === 'turtle') {
    if (/EOFError/i.test(err)) {
      return {
        title: 'Input Program (stdin) Masih Kosong atau Kurang!',
        explanation:
          'Kodemu memanggil fungsi input(), tapi kotak "Input Program (stdin)" di sebelah kanan belum diisi atau jumlah barisnya kurang.',
        tip: 'Isi kotak Input Program (stdin) satu baris untuk setiap input() sebelum menekan Run Kode.',
      };
    }
    if (/IndentationError/i.test(err)) {
      return {
        title: 'Spasi / Indentasi Python Kurang Rapi',
        explanation: isSd
          ? 'Di Python, baris di dalam perulangan (for) atau if harus agak menjorok ke dalam dengan spasi yang sama rata!'
          : 'IndentationError terjadi karena spasi awal baris (biasanya 4 spasi di dalam for, if, atau def) tidak konsisten.',
        tip: 'Pastikan semua baris di dalam blok yang sama memakai 4 spasi (atau tekan tombol Tab).',
      };
    }
    if (/SyntaxError/i.test(err)) {
      return {
        title: 'Ada Salah Ketik Aturan Penulisan (SyntaxError)',
        explanation: isSd
          ? 'Kiko bingung membaca kode ini! Biasanya ada tanda titik dua (:), kurung tutup ), atau tanda kutip (") yang tertinggal.'
          : 'Python menemukan struktur sintaks yang tidak valid, misalnya lupa titik dua ":" setelah for/if/def, tanda kutip tidak berpasangan, atau kurung belum ditutup.',
        tip: 'Cek baris yang ditunjuk oleh tanda panah "^" di pesan error.',
      };
    }
    if (/NameError:\s*name\s*'([^']+)'/i.test(err)) {
      const match = err.match(/NameError:\s*name\s*'([^']+)'/i);
      const name = match?.[1] ?? 'variabel';
      return {
        title: `Kiko Belum Kenal Nama "${name}"`,
        explanation: `Kamu memakai "${name}", tapi belum pernah membuatnya atau ada salah ketik huruf besar/kecil (Python membedakan huruf besar dan kecil!).`,
        tip: `Pastikan "${name}" sudah ditulis/didefinisikan di baris sebelumnya dengan ejaan yang persis sama.`,
      };
    }
    if (/TypeError/i.test(err)) {
      return {
        title: 'Tipe Data Tidak Cocok (TypeError)',
        explanation:
          'Kamu mencoba menggabungkan atau menghitung dua tipe data yang berbeda, misalnya teks (string) langsung ditambah angka tanpa diubah dengan int() atau str().',
        tip: 'Gunakan int(...) untuk mengubah input teks menjadi angka bulat, atau f-string f"{variabel}" untuk mencetak teks.',
      };
    }
    if (/ZeroDivisionError/i.test(err)) {
      return {
        title: 'Tidak Bisa Membagi dengan Nol!',
        explanation:
          'Di matematika maupun pemrograman, membagi angka dengan 0 (nol) tidak diperbolehkan.',
        tip: 'Pastikan angka pembaginya bukan 0 atau tambahkan pengecekan if pembagi != 0.',
      };
    }
    if (/IndexError/i.test(err)) {
      return {
        title: 'Urutan List Melewati Batas (IndexError)',
        explanation:
          'Kamu mencoba mengambil elemen list pada nomor indeks yang tidak ada. Ingat, hitungan indeks di Python dimulai dari 0!',
        tip: 'Cek panjang list dengan len(nama_list) agar indeks tidak melebihi jumlah data.',
      };
    }
    if (/AttributeError/i.test(err)) {
      return {
        title: 'Perintah / Metode Tidak Ditemukan (AttributeError)',
        explanation:
          'Objek tersebut tidak memiliki perintah yang kamu panggil, misalnya salah mengetik nama fungsi pada Turtle atau string.',
        tip: 'Periksa ejaan perintah Turtle seperti forward(), right(), left(), pencolor(), atau begin_fill().',
      };
    }
  }

  if (track === 'cpp') {
    if (/expected.*;|semicolon/i.test(err)) {
      return {
        title: 'Lupa Tanda Titik Koma (;) di C++',
        explanation:
          'Setiap akhir perintah di bahasa C++ wajib ditutup dengan tanda titik koma (;).',
        tip: 'Periksa akhir baris di sekitar nomor baris yang dilaporkan, tambahkan ";" jika tertinggal.',
      };
    }
    if (/undeclared|not defined|cannot find/i.test(err)) {
      return {
        title: 'Variabel atau Fungsi Belum Dideklarasikan',
        explanation:
          'C++ mewajibkan setiap variabel ditentukan tipe datanya dulu (misalnya int, double, atau string) sebelum dipakai.',
        tip: 'Pastikan kamu sudah menulis tipe datanya, misal `int total = 0;`, dan sudah menulis `using namespace std;`.',
      };
    }
    if (/timeout|infinite/i.test(err)) {
      return {
        title: 'Program Berjalan Terlalu Lama (Time Limit)',
        explanation:
          'Kemungkinan ada perulangan while/for yang tidak pernah berhenti (infinite loop) atau menunggu cin yang kosong.',
        tip: 'Periksa kondisi berhenti perulanganmu dan pastikan Input Program (stdin) sudah terisi lengkap.',
      };
    }
    if (/EOF|cin/i.test(err)) {
      return {
        title: 'Input cin Tidak Terpenuhi',
        explanation:
          'Program mencoba membaca data dengan cin, tetapi kotak Input Program (stdin) kosong atau datanya kurang.',
        tip: 'Masukkan angka/kata ke kolom Input Program (stdin) dipisahkan dengan spasi atau baris baru.',
      };
    }
  }

  if (track === 'sql') {
    if (/no such table:\s*(\S+)/i.test(err)) {
      const m = err.match(/no such table:\s*(\S+)/i);
      return {
        title: `Tabel "${m?.[1] ?? ''}" Belum Dibuat`,
        explanation:
          'Database SQLite in-memory masih kosong setiap kali dijalankan dari awal. Jadi perintah CREATE TABLE harus ikut ada di skrip sebelum SELECT.',
        tip: 'Pastikan perintah CREATE TABLE dan INSERT INTO berada di atas perintah SELECT dan dieksekusi bersama.',
      };
    }
    if (/no such column:\s*(\S+)/i.test(err)) {
      const m = err.match(/no such column:\s*(\S+)/i);
      return {
        title: `Kolom "${m?.[1] ?? ''}" Tidak Ditemukan`,
        explanation:
          'Nama kolom yang kamu tulis di SELECT, WHERE, atau ORDER BY tidak cocok dengan kolom yang dibuat di CREATE TABLE.',
        tip: 'Cek kembali ejaan nama kolom di CREATE TABLE. Untuk teks di SQL, gunakan tanda kutip tunggal (\'teks\'), bukan kutip ganda.',
      };
    }
    if (/syntax error/i.test(err)) {
      return {
        title: 'Kesalahan Penulisan Query SQL',
        explanation:
          'Urutan kata kunci SQL atau tanda baca (koma, kurung, titik koma ";") ada yang keliru.',
        tip: 'Ingat urutan standar SQL: SELECT ... FROM ... WHERE ... GROUP BY ... ORDER BY ..., dan akhiri setiap perintah dengan ";".',
      };
    }
    if (/ambiguous column name/i.test(err)) {
      return {
        title: 'Nama Kolom Sama di Dua Tabel (Ambigu)',
        explanation:
          'Saat melakukan JOIN dua tabel yang punya nama kolom sama (misal "id" atau "nama"), SQL bingung memilih kolom dari tabel yang mana.',
        tip: 'Sebutkan nama tabel atau aliasnya, misalnya `siswa.nama` atau `s.id`.',
      };
    }
  }

  if (track === 'typescript') {
    if (/TS2322/i.test(err)) {
      return {
        title: 'Tipe Data Tidak Sesuai (Type Mismatch — TS2322)',
        explanation:
          'Kamu memasukkan nilai dengan tipe yang berbeda dari kontrak tipe yang sudah didefinisikan (misal memasukkan string ke variabel bertipe number).',
        tip: 'Samakan tipe nilainya atau perbaiki anotasi tipe / interface yang digunakan.',
      };
    }
    if (/TS2304/i.test(err)) {
      return {
        title: 'Nama Variabel / Tipe Tidak Dikenali (TS2304)',
        explanation:
          'TypeScript tidak menemukan variabel, fungsi, atau interface dengan nama tersebut.',
        tip: 'Periksa ejaan nama dan pastikan sudah dideklarasikan sebelum dipakai.',
      };
    }
    if (/TS2339/i.test(err)) {
      return {
        title: 'Properti Tidak Ada di Tipe Ini (TS2339)',
        explanation:
          'Kamu mengakses properti atau metode yang tidak terdaftar di dalam interface atau tipe data tersebut.',
        tip: 'Tambahkan properti tersebut ke interface jika memang diperlukan, atau cek typo nama propertinya.',
      };
    }
    if (/TS2345|TS2554/i.test(err)) {
      return {
        title: 'Argumen Fungsi Tidak Cocok (TS2345 / TS2554)',
        explanation:
          'Jumlah atau tipe parameter yang dikirim saat memanggil fungsi berbeda dengan definisi fungsinya.',
        tip: 'Cocokkan urutan, jumlah, dan tipe argumen saat memanggil fungsi.',
      };
    }
    if (/TS1005/i.test(err)) {
      return {
        title: 'Ada Tanda Baca Sintaks yang Kurang (TS1005)',
        explanation:
          'TypeScript mengharapkan tanda baca tertentu seperti titik dua (:), kurung tutup ), atau kurung kurawal }.',
        tip: 'Lihat nomor baris dan kolom yang ditandai, lalu lengkapi tanda bacanya.',
      };
    }
  }

  if (track === 'web') {
    if (/ReferenceError/i.test(err)) {
      return {
        title: 'Variabel atau Fungsi JavaScript Tidak Ditemukan',
        explanation:
          'JavaScript memanggil variabel/fungsi yang belum dibuat atau berbeda penulisan huruf besar-kecilnya.',
        tip: 'Pastikan variabel sudah dibuat dengan `const` atau `let`, dan cek ID elemen di `index.html`.',
      };
    }
    if (/SyntaxError/i.test(err)) {
      return {
        title: 'Ada Salah Ketik di script.js',
        explanation:
          'Biasanya ada kurung kurawal `{ }`, tanda kurung `( )`, atau tanda kutip yang belum ditutup di tab `script.js`.',
        tip: 'Periksa pasangan kurung pada baris yang muncul di panel Konsol.',
      };
    }
  }

  if (track === 'network') {
    if (/enable|privilege/i.test(err)) {
      return {
        title: 'Harus Masuk Mode Privileged (enable) Dulu!',
        explanation:
          'Di Cisco IOS, kamu harus mengetik `enable` dulu sebelum bisa menjalankan `configure terminal`.',
        tip: 'Urutan wajib Cisco IOS: `enable` -> `configure terminal` -> `interface g0/0`.',
      };
    }
    if (/config/i.test(err)) {
      return {
        title: 'Belum Masuk Global Config (configure terminal)',
        explanation:
          'Perintah seperti `hostname` atau `interface g0/0` hanya bisa dijalankan setelah mengetik `configure terminal`.',
        tip: 'Tambahkan baris `configure terminal` sebelum mengatur interface.',
      };
    }
    if (/ip|mask/i.test(err)) {
      return {
        title: 'Format IP Address atau Subnet Mask Salah',
        explanation:
          'Cisco IOS memakai format IPv4 4 bagian (contoh `192.168.1.1 255.255.255.0`), bukan format `/24`.',
        tip: 'Contoh yang benar: `ip address 192.168.1.1 255.255.255.0`.',
      };
    }
    return {
      title: 'Perintah Cisco IOS Tidak Dikenali',
      explanation:
        'Router tidak mengenali salah satu baris perintah di konfigurasi IOS kamu.',
      tip: 'Cek ejaan seperti `enable`, `configure terminal`, `interface g0/0`, `ip address ...`, `no shutdown`, dan `ping ...`.',
    };
  }

  if (track === 'iot') {
    if (/setup|loop/i.test(err)) {
      return {
        title: 'Fungsi setup() atau loop() Belum Ada',
        explanation:
          'Program mikrokontroler Arduino/ESP32 selalu membutuhkan fungsi `void setup()` dan/atau `void loop()`.',
        tip: 'Pastikan kamu menuliskan `void setup() { ... }` dan `void loop() { ... }` dengan kurung kurawal lengkap.',
      };
    }
    return {
      title: 'Ada Error di Sketch Arduino/ESP32',
      explanation:
        'Kiko menemukan kesalahan penulisan di kode IoT (seperti lupa titik koma `;`, kurung tutup `}`, atau nama pin).',
      tip: 'Pin yang tersedia: `LED_MERAH`, `LED_KUNING`, `LED_HIJAU`, `BUZZER`, `TOMBOL`, `SENSOR_SUHU`, dan `SENSOR_CAHAYA`.',
    };
  }

  if (track === 'ai_data') {
    if (/kodie_ai/i.test(err)) {
      return {
        title: 'Argumen Fungsi Grafik kodie_ai Kurang Cocok',
        explanation:
          'Pastikan panjang list X dan list Y sama panjang, dan angka yang dikirim valid.',
        tip: 'Contoh: `kodie_ai.plot_regression(jam, nilai, slope, intercept, title="Prediksi", test_x=6)`.',
      };
    }
    if (/ZeroDivisionError/i.test(err)) {
      return {
        title: 'Pembagian dengan Nol Saat Menghitung Data',
        explanation:
          'Penyebut saat menghitung rata-rata atau slope bernilai 0 (biasanya list kosong atau semua nilai X sama).',
        tip: 'Pastikan data training punya minimal 2 titik X yang berbeda.',
      };
    }
  }

  if (track === 'software_api') {
    if (/SyntaxError|ReferenceError|TypeError/i.test(err)) {
      return {
        title: 'Ada Kesalahan Kode di server.ts',
        explanation:
          'Handler endpoint REST API mengalami error sintaks atau memanggil variabel yang belum dibuat.',
        tip: 'Pastikan setiap route mengembalikan objek `{ status: 200, body: ... }` dengan tanda kurung lengkap.',
      };
    }
    return {
      title: 'Endpoint REST API Bermasalah',
      explanation:
        'Cek kembali handler `app.get(...)` / `app.post(...)` dan pastikan format JSON request valid.',
      tip: 'Gunakan `return { status: 200, body: ... };` di dalam fungsi route.',
    };
  }

  return {
    title: isSd ? 'Wah, Kiko Menemukan Pesan Error!' : 'Terjadi Kesalahan Eksekusi',
    explanation: isSd
      ? 'Tenang, error itu hal biasa saat belajar coding! Yuk baca pesan error di bawah ini pelan-pelan.'
      : 'Runtime melaporkan error saat memproses kodemu. Periksa baris dan detail pesan error teknis untuk memperbaikinya.',
    tip: 'Cek tanda baca, ejaan nama variabel, atau klik tombol "💡 Petunjuk Kiko" jika butuh bantuan.',
  };
}
