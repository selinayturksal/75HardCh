// main4.dart
import 'package:flutter/material.dart';
import 'main5.dart'; // AnaTakipEkrani'na erişmek için gerekli

class SonSayfa extends StatefulWidget {
  // 1. DEĞİŞİKLİK: Önceki sayfadan (main3) gelen ismi burada karşılıyoruz
  final String gelenKullaniciAdi;

  const SonSayfa({super.key, required this.gelenKullaniciAdi});

  @override
  State<SonSayfa> createState() => _SonSayfaState();
}

class _SonSayfaState extends State<SonSayfa> {
  // Seçilen hedefleri tutan liste
  List<String> secilenHedefler = [];

  // "Kendi Başlığım" seçildiğinde kullanıcının girdiği metin
  String? ozelHedefBasligi;

  // Seçenekler Listesi
  final List<Map<String, dynamic>> secenekler = [
    {"baslik": "Akademik Başarı", "icon": Icons.school},
    {"baslik": "Spor ve Beslenme", "icon": Icons.fitness_center},
    {"baslik": "Yeni Bir Proje/İş", "icon": Icons.rocket_launch},
    {"baslik": "Yeni Bir Dil", "icon": Icons.language},
    {"baslik": "Kitap Okuma", "icon": Icons.menu_book},
    {"baslik": "Kendi Başlığım", "icon": Icons.edit},
  ];

  // Seçim Mantığını Yöneten Fonksiyon
  void _hedefSec(String baslik) {
    setState(() {
      // 1. ÖZEL BAŞLIK SENARYOSU
      if (baslik == "Kendi Başlığım") {
        if (secilenHedefler.contains(baslik)) {
          // Zaten seçiliyse kaldır
          secilenHedefler.remove(baslik);
          ozelHedefBasligi = null;
        } else {
          // Seçili değilse ve limit dolmadıysa dialog aç
          if (secilenHedefler.length < 3) {
            _ozelBaslikDialogGoster();
          } else {
            _uyariGoster("En fazla 3 hedef seçebilirsin.");
          }
        }
      }
      // 2. NORMAL SEÇENEK SENARYOSU
      else {
        if (secilenHedefler.contains(baslik)) {
          secilenHedefler.remove(baslik);
        } else {
          if (secilenHedefler.length < 3) {
            secilenHedefler.add(baslik);
          } else {
            _uyariGoster("En fazla 3 hedef seçebilirsin.");
          }
        }
      }
    });
  }

  // Özel başlık girilmesi için açılan pencere
  void _ozelBaslikDialogGoster() {
    TextEditingController customController = TextEditingController();
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text("Hedefini İsimlendir"),
        content: TextField(
          controller: customController,
          autofocus: true,
          decoration: const InputDecoration(
            hintText: "Örn: Gitar Çalmak",
            border: OutlineInputBorder(),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text("İptal"),
          ),
          ElevatedButton(
            onPressed: () {
              if (customController.text.trim().isNotEmpty) {
                setState(() {
                  ozelHedefBasligi = customController.text.trim();
                  secilenHedefler.add("Kendi Başlığım");
                });
                Navigator.pop(context);
              }
            },
            child: const Text("Ekle"),
          ),
        ],
      ),
    );
  }

  // Uyarı Mesajı (SnackBar)
  void _uyariGoster(String mesaj) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(mesaj),
        duration: const Duration(seconds: 2),
        backgroundColor: Colors.redAccent,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[50], // Temiz bir arkaplan
      appBar: AppBar(
        title: const Text(
          "Hedefini Seç",
          style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold),
        ),
        centerTitle: true,
        backgroundColor: Colors.transparent,
        elevation: 0,
        // Geri butonu otomatik gelir
        iconTheme: const IconThemeData(color: Colors.black),
      ),
      body: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          children: [
            // Üst Bilgilendirme Metni
            const Text(
              "Kendini hangi konularda geliştirmek istiyorsun?",
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 18, color: Colors.black87),
            ),
            const SizedBox(height: 8),
            Text(
              "(En az 1, en çok 3 seçim yapabilirsin)",
              style: TextStyle(fontSize: 14, color: Colors.grey[600]),
            ),
            const SizedBox(height: 20),

            // Seçenek Kutuları (Grid)
            Expanded(
              child: GridView.builder(
                itemCount: secenekler.length,
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2, // Yan yana 2 kutu
                  crossAxisSpacing: 15,
                  mainAxisSpacing: 15,
                  childAspectRatio: 1.1, // Kutuların oranı
                ),
                itemBuilder: (context, index) {
                  final secenek = secenekler[index];
                  final String baslik = secenek["baslik"];
                  final IconData ikon = secenek["icon"];

                  final bool secili = secilenHedefler.contains(baslik);

                  // Eğer bu kutu "Kendi Başlığım" ise ve seçiliyse,
                  // kullanıcının girdiği metni göster.
                  String gorunenYazi = baslik;
                  if (baslik == "Kendi Başlığım" &&
                      secili &&
                      ozelHedefBasligi != null) {
                    gorunenYazi = ozelHedefBasligi!;
                  }

                  return GestureDetector(
                    onTap: () => _hedefSec(baslik),
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 300),
                      curve: Curves.easeInOut,
                      decoration: BoxDecoration(
                        color: secili
                            ? const Color(0xFFC52184)
                            : Colors.white, // Main3 rengine uyumlu
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                          color: secili
                              ? const Color(0xFFC52184)
                              : Colors.grey.shade300,
                          width: 2,
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.05),
                            blurRadius: 10,
                            offset: const Offset(0, 5),
                          ),
                        ],
                      ),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            ikon,
                            size: 40,
                            color: secili
                                ? Colors.white
                                : const Color(0xFFC52184),
                          ),
                          const SizedBox(height: 12),
                          Padding(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 8.0,
                            ),
                            child: Text(
                              gorunenYazi,
                              textAlign: TextAlign.center,
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                                color: secili ? Colors.white : Colors.black87,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),

            // İlerleme Butonu
            const SizedBox(height: 20),
            SizedBox(
              width: double.infinity,
              height: 60,
              child: ElevatedButton(
                onPressed: secilenHedefler.isEmpty
                    ? null
                    : () {
                        // 2. DEĞİŞİKLİK: Seçilen hedefleri ve İSMİ main5'e gönderiyoruz
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => AnaTakipEkrani(
                              secilenHedefler: secilenHedefler,
                              kullaniciIsmi: widget
                                  .gelenKullaniciAdi, // İsim burada aktarılıyor
                            ),
                          ),
                        );
                      },
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFC52184), // Ana tema rengi
                  disabledBackgroundColor: Colors.grey[300],
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(15),
                  ),
                  elevation: 5,
                ),
                child: const Text(
                  "Maceraya Başla",
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
