import 'package:flutter/material.dart';
import 'akademik_sayfasi.dart'; // Akademik sayfayı buradan çağırıyoruz
import 'main.dart'; // Çıkış yapınca ana ekrana dönmek için

class AnaTakipEkrani extends StatefulWidget {
  final List<String> secilenHedefler;
  final String kullaniciIsmi;

  const AnaTakipEkrani({
    super.key,
    required this.secilenHedefler,
    required this.kullaniciIsmi,
  });

  @override
  State<AnaTakipEkrani> createState() => _AnaTakipEkraniState();
}

class _AnaTakipEkraniState extends State<AnaTakipEkrani> {
  int _aktifIndex = 0;

  // --- İÇERİK FABRİKASI ---
  Widget _icerikGetir() {
    if (widget.secilenHedefler.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: const [
            Icon(Icons.playlist_remove, size: 80, color: Colors.grey),
            SizedBox(height: 20),
            Text(
              "Hiçbir hedefin kalmadı.",
              style: TextStyle(color: Colors.grey),
            ),
            Text(
              "Ayarlardan yeni hedef ekleyebilirsin.",
              style: TextStyle(color: Colors.grey),
            ),
          ],
        ),
      );
    }

    // Index hatasını önlemek için güvenlik kontrolü
    if (_aktifIndex >= widget.secilenHedefler.length) {
      _aktifIndex = 0;
    }

    String aktifHedef = widget.secilenHedefler[_aktifIndex];

    // EĞER SEÇİLEN HEDEF AKADEMİK BAŞARI İSE ÖZEL SAYFAYI GETİR
    if (aktifHedef == "Akademik Başarı") {
      return AkademikDetaySayfasi(kullaniciIsmi: widget.kullaniciIsmi);
    }

    // DİĞERLERİ İÇİN STANDART GÖRÜNÜM (Şimdilik)
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.construction, size: 80, color: Colors.grey),
          const SizedBox(height: 20),
          Text(
            aktifHedef,
            textAlign: TextAlign.center,
            style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 10),
          const Text(
            "Tasarımı Yapılacak...",
            style: TextStyle(color: Colors.grey),
          ),
        ],
      ),
    );
  }

  // --- ÇIKIŞ YAP FONKSİYONU ---
  void _cikisYap() {
    Navigator.of(context).pushAndRemoveUntil(
      MaterialPageRoute(builder: (context) => const GirisEkrani()),
      (Route<dynamic> route) => false,
    );
  }

  // --- YENİ CHALLENGE EKLEME ---
  void _yeniChallengeEkle(String yeniHedef) {
    setState(() {
      if (!widget.secilenHedefler.contains(yeniHedef)) {
        widget.secilenHedefler.add(yeniHedef);
        _aktifIndex = widget.secilenHedefler.length - 1;
      }
    });
  }

  // --- CHALLENGE SİLME FONKSİYONU ---
  void _challengeSil(String hedef) {
    setState(() {
      widget.secilenHedefler.remove(hedef);
      if (_aktifIndex >= widget.secilenHedefler.length) {
        _aktifIndex = 0;
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    bool listeBos = widget.secilenHedefler.isEmpty;

    return Scaffold(
      backgroundColor: Colors.white,

      // --- ÜST BAR ---
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        automaticallyImplyLeading: false,
        centerTitle: true,
        title: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Image.asset('assets/logo.png', height: 30, fit: BoxFit.contain),
            const SizedBox(width: 10),
            const Text(
              "75 Hard Challenge",
              style: TextStyle(
                color: Color(0xFFC52184),
                fontWeight: FontWeight.bold,
                fontSize: 20,
              ),
            ),
          ],
        ),
      ),

      body: Column(
        children: [
          // KULLANICI VE CHALLENGE GEÇİŞ ALANI
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
            decoration: BoxDecoration(
              color: Colors.grey[50],
              border: Border(bottom: BorderSide(color: Colors.grey.shade200)),
            ),
            child: Row(
              children: [
                // KULLANICI MENÜSÜ
                PopupMenuButton<String>(
                  offset: const Offset(0, 40),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(15),
                  ),
                  onSelected: (value) {
                    if (value == 'ayarlar') {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => AyarlarSayfasi(
                            mevcutHedefler: widget.secilenHedefler,
                            onEkle: _yeniChallengeEkle,
                            onSil: _challengeSil,
                          ),
                        ),
                      );
                    } else if (value == 'hesap') {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => HesapBilgileriSayfasi(
                            kullaniciIsmi: widget.kullaniciIsmi,
                          ),
                        ),
                      );
                    } else if (value == 'cikis') {
                      _cikisYap();
                    }
                  },
                  itemBuilder: (BuildContext context) =>
                      <PopupMenuEntry<String>>[
                        const PopupMenuItem(
                          value: 'hesap',
                          child: Row(
                            children: [
                              Icon(Icons.person, color: Colors.grey),
                              SizedBox(width: 10),
                              Text("Hesap Bilgileri"),
                            ],
                          ),
                        ),
                        const PopupMenuItem(
                          value: 'ayarlar',
                          child: Row(
                            children: [
                              Icon(Icons.settings, color: Colors.grey),
                              SizedBox(width: 10),
                              Text("Ayarlar"),
                            ],
                          ),
                        ),
                        const PopupMenuDivider(),
                        const PopupMenuItem(
                          value: 'cikis',
                          child: Row(
                            children: [
                              Icon(Icons.logout, color: Colors.red),
                              SizedBox(width: 10),
                              Text(
                                "Çıkış Yap",
                                style: TextStyle(color: Colors.red),
                              ),
                            ],
                          ),
                        ),
                      ],
                  child: Row(
                    children: [
                      CircleAvatar(
                        backgroundColor: Colors.grey[300],
                        radius: 18,
                        child: Icon(
                          Icons.person,
                          color: Colors.grey[700],
                          size: 20,
                        ),
                      ),
                      const SizedBox(width: 10),
                      Text(
                        widget.kullaniciIsmi,
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                          color: Colors.black87,
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(width: 5),

                // CHALLENGE DEĞİŞTİRME BUTONU
                if (!listeBos && widget.secilenHedefler.length > 1)
                  PopupMenuButton<int>(
                    tooltip: "Challenge Değiştir",
                    offset: const Offset(0, 40),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(15),
                    ),
                    onSelected: (int index) {
                      setState(() {
                        _aktifIndex = index;
                      });
                    },
                    itemBuilder: (context) {
                      return List.generate(widget.secilenHedefler.length, (
                        index,
                      ) {
                        return PopupMenuItem(
                          value: index,
                          child: Row(
                            children: [
                              Icon(
                                index == _aktifIndex
                                    ? Icons.radio_button_checked
                                    : Icons.radio_button_unchecked,
                                color: index == _aktifIndex
                                    ? const Color(0xFFC52184)
                                    : Colors.grey,
                                size: 18,
                              ),
                              const SizedBox(width: 10),
                              Text(widget.secilenHedefler[index]),
                            ],
                          ),
                        );
                      });
                    },
                    child: Container(
                      margin: const EdgeInsets.only(left: 10),
                      padding: const EdgeInsets.all(4),
                      decoration: const BoxDecoration(
                        color: Colors.white,
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(color: Colors.black12, blurRadius: 4),
                        ],
                      ),
                      child: const Icon(
                        Icons.swap_horiz,
                        color: Color(0xFFC52184),
                        size: 20,
                      ),
                    ),
                  ),
              ],
            ),
          ),

          // İÇERİK ALANI
          Expanded(child: _icerikGetir()),
        ],
      ),
    );
  }
}

// --- AYARLAR SAYFASI ---
class AyarlarSayfasi extends StatefulWidget {
  final List<String> mevcutHedefler;
  final Function(String) onEkle;
  final Function(String) onSil;

  const AyarlarSayfasi({
    super.key,
    required this.mevcutHedefler,
    required this.onEkle,
    required this.onSil,
  });

  @override
  _AyarlarSayfasiState createState() => _AyarlarSayfasiState();
}

class _AyarlarSayfasiState extends State<AyarlarSayfasi> {
  bool _karanlikMod = false;
  String _secilenDil = "Türkçe";

  final List<String> _standartSecenekler = [
    "Akademik Başarı",
    "Spor ve Beslenme",
    "Yeni Bir Proje/İş",
    "Yeni Bir Dil",
    "Kitap Okuma",
  ];

  void _eklemePenceresiAc() {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text("Yeni Challenge Ekle"),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                ..._standartSecenekler.map((secenek) {
                  if (widget.mevcutHedefler.contains(secenek))
                    return const SizedBox();

                  return ListTile(
                    leading: const Icon(Icons.add, color: Color(0xFFC52184)),
                    title: Text(secenek),
                    onTap: () {
                      widget.onEkle(secenek);
                      Navigator.pop(context);
                      setState(() {});
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text("$secenek eklendi!")),
                      );
                    },
                  );
                }).toList(),
                const Divider(),
                ListTile(
                  leading: const Icon(Icons.edit, color: Colors.blue),
                  title: const Text("Kendi Başlığım..."),
                  onTap: () {
                    Navigator.pop(context);
                    _ozelIsimGirDialog();
                  },
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text("İptal"),
            ),
          ],
        );
      },
    );
  }

  void _ozelIsimGirDialog() {
    TextEditingController controller = TextEditingController();
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text("Başlık Giriniz"),
        content: TextField(
          controller: controller,
          decoration: const InputDecoration(hintText: "Örn: Gitar Çalmak"),
          autofocus: true,
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text("İptal"),
          ),
          ElevatedButton(
            onPressed: () {
              if (controller.text.isNotEmpty) {
                widget.onEkle(controller.text.trim());
                Navigator.pop(context);
                setState(() {});
              }
            },
            child: const Text("Ekle"),
          ),
        ],
      ),
    );
  }

  void _silmeOnayiGoster(String hedef) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text("Emin misin?"),
        content: Text("'$hedef' listenizden silinecek."),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text("Vazgeç"),
          ),
          TextButton(
            onPressed: () {
              widget.onSil(hedef);
              Navigator.pop(context);
              setState(() {});
            },
            child: const Text("Sil", style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Ayarlar", style: TextStyle(color: Colors.black)),
        backgroundColor: Colors.white,
        iconTheme: const IconThemeData(color: Colors.black),
        elevation: 1,
      ),
      body: ListView(
        children: [
          ListTile(
            leading: const Icon(Icons.dark_mode),
            title: const Text("Karanlık Tema"),
            trailing: Switch(
              value: _karanlikMod,
              activeColor: const Color(0xFFC52184),
              onChanged: (val) => setState(() => _karanlikMod = val),
            ),
          ),
          ListTile(
            leading: const Icon(Icons.language),
            title: const Text("Dil Seçeneği"),
            trailing: DropdownButton<String>(
              value: _secilenDil,
              underline: const SizedBox(),
              items: ["Türkçe", "English", "Deutsch"].map((String val) {
                return DropdownMenuItem(value: val, child: Text(val));
              }).toList(),
              onChanged: (val) => setState(() => _secilenDil = val!),
            ),
          ),
          const Divider(),

          ListTile(
            leading: const Icon(Icons.add_circle, color: Colors.green),
            title: const Text("Yeni Challenge Ekle"),
            onTap: _eklemePenceresiAc,
          ),

          const Divider(),

          Padding(
            padding: const EdgeInsets.only(left: 16, top: 10, bottom: 5),
            child: Text(
              "Aktif Hedeflerin",
              style: TextStyle(
                color: Colors.grey[600],
                fontWeight: FontWeight.bold,
                fontSize: 14,
              ),
            ),
          ),

          if (widget.mevcutHedefler.isEmpty)
            const Padding(
              padding: EdgeInsets.all(16.0),
              child: Text("Hiç hedefin yok."),
            )
          else
            ...widget.mevcutHedefler.map((hedef) {
              return ListTile(
                leading: const Icon(
                  Icons.check_circle_outline,
                  color: Color(0xFFC52184),
                ),
                title: Text(hedef),
                trailing: IconButton(
                  icon: const Icon(Icons.delete_outline, color: Colors.red),
                  onPressed: () {
                    _silmeOnayiGoster(hedef);
                  },
                ),
              );
            }).toList(),

          const SizedBox(height: 20),
        ],
      ),
    );
  }
}

// --- HESAP BİLGİLERİ SAYFASI ---
class HesapBilgileriSayfasi extends StatelessWidget {
  final String kullaniciIsmi;
  const HesapBilgileriSayfasi({super.key, required this.kullaniciIsmi});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          "Hesap Bilgileri",
          style: TextStyle(color: Colors.black),
        ),
        backgroundColor: Colors.white,
        iconTheme: const IconThemeData(color: Colors.black),
        elevation: 1,
      ),
      body: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          children: [
            TextField(
              decoration: const InputDecoration(
                labelText: "Kullanıcı Adı",
                border: OutlineInputBorder(),
              ),
              controller: TextEditingController(text: kullaniciIsmi),
              readOnly: true,
            ),
            const SizedBox(height: 15),
            TextField(
              decoration: const InputDecoration(
                labelText: "E-Posta",
                border: OutlineInputBorder(),
              ),
              controller: TextEditingController(text: "ornek@email.com"),
              readOnly: true,
            ),
            const SizedBox(height: 15),
            TextField(
              decoration: InputDecoration(
                labelText: "Şifre",
                border: const OutlineInputBorder(),
                suffixIcon: TextButton(
                  onPressed: () {},
                  child: const Text("Değiştir"),
                ),
              ),
              controller: TextEditingController(text: "123456"),
              obscureText: true,
              readOnly: true,
            ),
          ],
        ),
      ),
    );
  }
}
