import 'package:flutter/material.dart';

// =========================================================
// AKADEMİK BAŞARI İÇİN ÖZEL SAYFALAR VE WIDGETLAR
// =========================================================

class AkademikDetaySayfasi extends StatefulWidget {
  final String kullaniciIsmi;
  const AkademikDetaySayfasi({super.key, required this.kullaniciIsmi});

  @override
  State<AkademikDetaySayfasi> createState() => _AkademikDetaySayfasiState();
}

class _AkademikDetaySayfasiState extends State<AkademikDetaySayfasi> {
  // Sayaç başlangıç değeri (Veritabanından gelir)
  int _kacinciGun = 1;

  // Alt widget'tan (Yapılacaklar Listesi) tetiklenecek fonksiyon
  void _gunuTamamlaVeIlerlet() {
    setState(() {
      if (_kacinciGun < 75) {
        _kacinciGun++;
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // 1. DİNAMİK 75 SAYACI
            Center(child: Sayac75Widget(gun: _kacinciGun)),

            // Bilgilendirme Metni
            Center(
              child: Padding(
                padding: const EdgeInsets.all(8.0),
                child: Text(
                  "$_kacinciGun. Gün",
                  style: TextStyle(
                    color: Colors.grey[600],
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),

            const SizedBox(height: 20),

            // 2. SEÇENEKLER MENÜSÜ
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                _menuKarti(Icons.calendar_month, "Ders\nProgramı", () {
                  _dialogGoster(
                    context,
                    "Ders Programı",
                    const DersProgramiWidget(),
                  );
                }),
                _menuKarti(Icons.timer, "Sınav\nTakvimi", () {
                  _dialogGoster(
                    context,
                    "Sınav Takvimi",
                    const SinavTakvimiWidget(),
                  );
                }),
                _menuKarti(Icons.school, "Proje &\nSunum", () {
                  _dialogGoster(
                    context,
                    "Proje & Sunum",
                    const ProjeSunumWidget(),
                  );
                }),
              ],
            ),

            const SizedBox(height: 30),

            // 3. YAPILACAKLAR LİSTESİ
            const Text(
              "Günlük Görevler",
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: Color(0xFFC52184),
              ),
            ),
            const SizedBox(height: 10),

            // Buraya üstteki fonksiyonu (callback) gönderiyoruz
            YapilacaklarListesiWidget(onGunBitti: _gunuTamamlaVeIlerlet),
          ],
        ),
      ),
    );
  }

  Widget _menuKarti(IconData icon, String baslik, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 100,
        height: 100,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(15),
          boxShadow: [
            BoxShadow(
              color: Colors.grey.withOpacity(0.2),
              blurRadius: 10,
              offset: const Offset(0, 5),
            ),
          ],
          border: Border.all(color: const Color(0xFFC52184).withOpacity(0.3)),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 30, color: const Color(0xFFC52184)),
            const SizedBox(height: 8),
            Text(
              baslik,
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
            ),
          ],
        ),
      ),
    );
  }

  void _dialogGoster(BuildContext context, String baslik, Widget icerik) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        height: MediaQuery.of(context).size.height * 0.85,
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(25)),
        ),
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            Container(
              width: 40,
              height: 5,
              decoration: BoxDecoration(
                color: Colors.grey[300],
                borderRadius: BorderRadius.circular(10),
              ),
            ),
            const SizedBox(height: 20),
            Text(
              baslik,
              style: const TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.bold,
                color: Colors.black,
              ),
            ),
            const Divider(),
            Expanded(child: icerik),
          ],
        ),
      ),
    );
  }
}

// ---------------------------------------------------------
// 1. ÖZEL 75 SAYACI WIDGET (DÜZELTİLDİ: MATH & GAP FIX)
// ---------------------------------------------------------
class Sayac75Widget extends StatelessWidget {
  final int gun;
  const Sayac75Widget({super.key, required this.gun});

  @override
  Widget build(BuildContext context) {
    // Mantık:
    // Toplam 75 gün.
    // İlk sayı "7", kabaca ilk 37 günü temsil etsin.
    // İkinci sayı "5", kalan 38 günü temsil etsin.

    // 7 Rakamı Doluluğu:
    // Gün 37 olduğunda tam 1.0 (full) olur.
    double yediDoluluk = (gun / 37.0).clamp(0.0, 1.0);

    // 5 Rakamı Doluluğu:
    // Gün 37'den büyükse dolmaya başlar.
    // (Gün - 37) işlemiyle 38. günde pay 1 olur. 1/38 kadar dolar.
    double besDoluluk = 0.0;
    if (gun > 37) {
      besDoluluk = ((gun - 37) / 38.0).clamp(0.0, 1.0);
    }

    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        _boyananRakam("7", yediDoluluk),
        const SizedBox(width: 5), // Rakamlar arası boşluk
        _boyananRakam("5", besDoluluk),
      ],
    );
  }

  Widget _boyananRakam(String rakam, double dolulukOrani) {
    return ShaderMask(
      shaderCallback: (bounds) {
        return LinearGradient(
          begin: Alignment.bottomCenter,
          end: Alignment.topCenter,
          colors: const [
            Color(0xFFC52184),
            Color(0xFFC52184),
            Colors.grey,
            Colors.grey,
          ],
          // Colors.transparent yerine gri yaptım ki boş hali silik görünsün (daha şık)
          // Ya da tamamen boş istiyorsan Colors.grey[300] kullanabilirsin.
          stops: [0.0, dolulukOrani, dolulukOrani, 1.0],
        ).createShader(bounds);
      },
      blendMode: BlendMode.srcATop,
      child: Text(
        rakam,
        style: TextStyle(
          fontSize: 80,
          fontWeight: FontWeight.w900,
          color: Colors.grey[300], // Bu renk ShaderMask altındaki taban renktir
        ),
      ),
    );
  }
}

// ---------------------------------------------------------
// 2. YAPILACAKLAR LİSTESİ WIDGET (GÜNCELLENDİ: SENKRONİZASYON)
// ---------------------------------------------------------
class YapilacaklarListesiWidget extends StatefulWidget {
  final VoidCallback onGunBitti; // Ana sayfayı tetikleyecek fonksiyon

  const YapilacaklarListesiWidget({super.key, required this.onGunBitti});

  @override
  State<YapilacaklarListesiWidget> createState() =>
      _YapilacaklarListesiWidgetState();
}

class _YapilacaklarListesiWidgetState extends State<YapilacaklarListesiWidget> {
  final List<Map<String, dynamic>> _gorevler = [
    {"baslik": "Algoritma Analizi çalış", "yapildi": false},
    {"baslik": "Proje raporunu yaz", "yapildi": false},
  ];

  final TextEditingController _gorevController = TextEditingController();

  void _gorevEkle() {
    if (_gorevController.text.isNotEmpty) {
      setState(() {
        _gorevler.add({"baslik": _gorevController.text, "yapildi": false});
        _gorevController.clear();
      });
    }
  }

  void _gunuBitirVeTemizle() {
    // 1. Yapılanları listeden sil
    setState(() {
      _gorevler.removeWhere((gorev) => gorev["yapildi"] == true);
    });

    // 2. Kullanıcıya bilgi ver
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text(
          "Tamamlananlar silindi, kalanlar devredildi. Sayaç ilerledi!",
        ),
      ),
    );

    // 3. ANA SAYFADAKİ SAYACI TETİKLE
    widget.onGunBitti();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(15),
      decoration: BoxDecoration(
        color: const Color(0xFFFFF9C4),
        borderRadius: BorderRadius.circular(10),
        boxShadow: [const BoxShadow(color: Colors.black12, blurRadius: 5)],
      ),
      child: Column(
        children: [
          ListView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: _gorevler.length,
            itemBuilder: (context, index) {
              return Container(
                decoration: const BoxDecoration(
                  border: Border(
                    bottom: BorderSide(color: Colors.blueAccent, width: 0.5),
                  ),
                ),
                child: CheckboxListTile(
                  activeColor: const Color(0xFFC52184),
                  title: Text(
                    _gorevler[index]["baslik"],
                    style: TextStyle(
                      decoration: _gorevler[index]["yapildi"]
                          ? TextDecoration.lineThrough
                          : null,
                      color: Colors.black87,
                      fontFamily: "Courier New",
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  value: _gorevler[index]["yapildi"],
                  onChanged: (val) {
                    setState(() {
                      _gorevler[index]["yapildi"] = val;
                    });
                  },
                ),
              );
            },
          ),

          const SizedBox(height: 10),

          Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _gorevController,
                  decoration: const InputDecoration(
                    hintText: "Bugün ne yapacaksın?",
                    hintStyle: TextStyle(fontStyle: FontStyle.italic),
                    border: InputBorder.none,
                  ),
                ),
              ),
              IconButton(
                icon: const Icon(Icons.add_circle, color: Color(0xFFC52184)),
                onPressed: _gorevEkle,
              ),
            ],
          ),

          const SizedBox(height: 10),

          // SENKRONİZE ÇALIŞAN BUTON
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: _gunuBitirVeTemizle,
              icon: const Icon(Icons.check_circle, color: Colors.white),
              label: const Text("Günü Bitir & İlerle"),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFC52184),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------
// 3. PROJE & SUNUM WIDGET (GÜNCELLENDİ: DİNAMİK GRUP)
// ---------------------------------------------------------
class ProjeSunumWidget extends StatefulWidget {
  const ProjeSunumWidget({super.key});

  @override
  State<ProjeSunumWidget> createState() => _ProjeSunumWidgetState();
}

class _ProjeSunumWidgetState extends State<ProjeSunumWidget> {
  String _secim = "";

  // Grup Arkadaşları için Dinamik Liste
  final List<Map<String, String>> _grupArkadaslari = [];
  final TextEditingController _arkadasIsimC = TextEditingController();
  final TextEditingController _arkadasGorevC = TextEditingController();

  void _arkadasEkle() {
    if (_arkadasIsimC.text.isNotEmpty && _arkadasGorevC.text.isNotEmpty) {
      setState(() {
        _grupArkadaslari.add({
          "isim": _arkadasIsimC.text,
          "gorev": _arkadasGorevC.text,
        });
      });
      _arkadasIsimC.clear();
      _arkadasGorevC.clear();
    }
  }

  void _arkadasSil(int index) {
    setState(() {
      _grupArkadaslari.removeAt(index);
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_secim == "") {
      return Center(
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: [
            ElevatedButton(
              onPressed: () => setState(() => _secim = "Proje"),
              child: const Text("Proje Ekle"),
            ),
            ElevatedButton(
              onPressed: () => setState(() => _secim = "Sunum"),
              child: const Text("Sunum Ekle"),
            ),
          ],
        ),
      );
    }

    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              IconButton(
                icon: const Icon(Icons.arrow_back),
                onPressed: () => setState(() => _secim = ""),
              ),
              Text(
                "$_secim Bilgileri",
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          const TextField(
            decoration: InputDecoration(
              labelText: "Konu",
              border: OutlineInputBorder(),
            ),
          ),
          const SizedBox(height: 10),
          const TextField(
            decoration: InputDecoration(
              labelText: "Teslim Tarihi",
              border: OutlineInputBorder(),
            ),
          ),
          const SizedBox(height: 20),

          // --- DİNAMİK GRUP ARKADAŞI EKLEME KISMI ---
          const Text(
            "Grup Arkadaşları & Görevleri",
            style: TextStyle(fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 10),

          // Ekleme Alanı
          Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _arkadasIsimC,
                  decoration: const InputDecoration(
                    hintText: "Adı Soyadı",
                    contentPadding: EdgeInsets.symmetric(
                      horizontal: 10,
                      vertical: 5,
                    ),
                    border: OutlineInputBorder(),
                  ),
                ),
              ),
              const SizedBox(width: 5),
              Expanded(
                child: TextField(
                  controller: _arkadasGorevC,
                  decoration: const InputDecoration(
                    hintText: "Sorumluluğu",
                    contentPadding: EdgeInsets.symmetric(
                      horizontal: 10,
                      vertical: 5,
                    ),
                    border: OutlineInputBorder(),
                  ),
                ),
              ),
              IconButton(
                icon: const Icon(Icons.add_circle, color: Colors.green),
                onPressed: _arkadasEkle,
              ),
            ],
          ),

          // Eklenenlerin Listesi
          if (_grupArkadaslari.isNotEmpty)
            Container(
              margin: const EdgeInsets.symmetric(vertical: 10),
              padding: const EdgeInsets.all(5),
              decoration: BoxDecoration(
                color: Colors.grey[100],
                borderRadius: BorderRadius.circular(10),
              ),
              child: ListView.builder(
                shrinkWrap: true, // Scroll hatasını önler
                physics: const NeverScrollableScrollPhysics(),
                itemCount: _grupArkadaslari.length,
                itemBuilder: (context, index) {
                  return Card(
                    margin: const EdgeInsets.symmetric(vertical: 5),
                    child: ListTile(
                      leading: CircleAvatar(
                        child: Text("${index + 1}"),
                        backgroundColor: const Color(0xFFC52184),
                        foregroundColor: Colors.white,
                        radius: 15,
                      ),
                      title: Text(_grupArkadaslari[index]["isim"]!),
                      subtitle: Text(
                        "Görev: ${_grupArkadaslari[index]["gorev"]!}",
                      ),
                      trailing: IconButton(
                        icon: const Icon(
                          Icons.delete,
                          color: Colors.red,
                          size: 20,
                        ),
                        onPressed: () => _arkadasSil(index),
                      ),
                    ),
                  );
                },
              ),
            ),

          // ------------------------------------------
          const SizedBox(height: 20),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: () {
                ScaffoldMessenger.of(
                  context,
                ).showSnackBar(const SnackBar(content: Text("Kaydedildi!")));
                setState(() => _secim = "");
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFC52184),
                foregroundColor: Colors.white,
              ),
              child: const Text("Kaydet"),
            ),
          ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------
// 4. DERS PROGRAMI & SINAV TAKVİMİ (DEĞİŞİKLİK YOK)
// ---------------------------------------------------------
class DersProgramiWidget extends StatefulWidget {
  const DersProgramiWidget({super.key});

  @override
  State<DersProgramiWidget> createState() => _DersProgramiWidgetState();
}

class _DersProgramiWidgetState extends State<DersProgramiWidget> {
  final List<Map<String, String>> _dersler = [
    {"gun": "Pazartesi", "saat": "09:00", "ders": "Yazılım Müh."},
  ];
  final TextEditingController _gunC = TextEditingController();
  final TextEditingController _saatC = TextEditingController();
  final TextEditingController _dersC = TextEditingController();

  void _dersEkle() {
    setState(() {
      _dersler.add({
        "gun": _gunC.text,
        "saat": _saatC.text,
        "ders": _dersC.text,
      });
    });
    _gunC.clear();
    _saatC.clear();
    _dersC.clear();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Row(
          children: [
            Expanded(
              child: TextField(
                controller: _gunC,
                decoration: const InputDecoration(hintText: "Gün"),
              ),
            ),
            const SizedBox(width: 5),
            Expanded(
              child: TextField(
                controller: _saatC,
                decoration: const InputDecoration(hintText: "Saat"),
              ),
            ),
            const SizedBox(width: 5),
            Expanded(
              child: TextField(
                controller: _dersC,
                decoration: const InputDecoration(hintText: "Ders"),
              ),
            ),
            IconButton(
              icon: const Icon(Icons.add, color: Colors.green),
              onPressed: _dersEkle,
            ),
          ],
        ),
        const SizedBox(height: 20),
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: DataTable(
            headingRowColor: MaterialStateProperty.all(Colors.grey[200]),
            columns: const [
              DataColumn(
                label: Text(
                  "Gün",
                  style: TextStyle(fontWeight: FontWeight.bold),
                ),
              ),
              DataColumn(
                label: Text(
                  "Saat",
                  style: TextStyle(fontWeight: FontWeight.bold),
                ),
              ),
              DataColumn(
                label: Text(
                  "Ders",
                  style: TextStyle(fontWeight: FontWeight.bold),
                ),
              ),
            ],
            rows: _dersler
                .map(
                  (ders) => DataRow(
                    cells: [
                      DataCell(Text(ders["gun"]!)),
                      DataCell(Text(ders["saat"]!)),
                      DataCell(Text(ders["ders"]!)),
                    ],
                  ),
                )
                .toList(),
          ),
        ),
      ],
    );
  }
}

class SinavTakvimiWidget extends StatefulWidget {
  const SinavTakvimiWidget({super.key});

  @override
  State<SinavTakvimiWidget> createState() => _SinavTakvimiWidgetState();
}

class _SinavTakvimiWidgetState extends State<SinavTakvimiWidget> {
  final List<Map<String, String>> _sinavlar = [];

  Future<void> _tarihSecVeEkle() async {
    DateTime? secilenTarih = await showDatePicker(
      context: context,
      initialDate: DateTime.now(),
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 90)),
    );
    if (secilenTarih != null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text("Sınav hatırlatıcısı kuruldu!"),
          backgroundColor: Colors.green,
        ),
      );
      setState(() {
        _sinavlar.add({
          "tarih":
              "${secilenTarih.day}/${secilenTarih.month}/${secilenTarih.year}",
          "ders": "Yeni Sınav",
        });
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        ElevatedButton.icon(
          onPressed: _tarihSecVeEkle,
          icon: const Icon(Icons.add_alert),
          label: const Text("Sınav Ekle"),
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFFC52184),
            foregroundColor: Colors.white,
          ),
        ),
        const SizedBox(height: 20),
        Expanded(
          child: ListView.builder(
            itemCount: _sinavlar.length,
            itemBuilder: (context, index) {
              return Card(
                child: ListTile(
                  leading: const Icon(Icons.event, color: Colors.orange),
                  title: Text(_sinavlar[index]["tarih"]!),
                  subtitle: Text(_sinavlar[index]["ders"]!),
                  trailing: const Icon(
                    Icons.notifications_active,
                    color: Colors.green,
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}
