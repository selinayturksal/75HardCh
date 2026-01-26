// main.dart
import 'package:flutter/material.dart';
import 'main2.dart'; // Kayıt olanlar buraya (Animasyon)
import 'main5.dart'; // Giriş yapanlar direkt buraya (Dashboard)

void main() {
  runApp(const BenimUygulamam());
}

class BenimUygulamam extends StatelessWidget {
  const BenimUygulamam({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFFC52184)),
        useMaterial3: true,
      ),
      home: const GirisEkrani(),
    );
  }
}

class GirisEkrani extends StatefulWidget {
  const GirisEkrani({super.key});

  @override
  State<GirisEkrani> createState() => _GirisEkraniState();
}

class _GirisEkraniState extends State<GirisEkrani> {
  // 1. DEĞİŞKENLER
  bool girisModu = true;
  bool sifreGizli = true;

  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _sifreController = TextEditingController();
  final TextEditingController _kullaniciAdiController = TextEditingController();

  final RegExp _sifreRegex = RegExp(
    r'^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,}$',
  );

  // Simülasyon verileri
  final String _kayitliEmail = "deneme@gmail.com";
  final String _kayitliSifre = "Deneme123";

  // --- İŞLEM FONKSİYONU ---
  void _islemYap() {
    String email = _emailController.text.trim();
    String sifre = _sifreController.text;
    String kullaniciAdi = "";

    // ==========================================
    // 1. GİRİŞ YAPMA SENARYOSU (ESKİ KULLANICI)
    // ==========================================
    if (girisModu) {
      if (email.isEmpty || sifre.isEmpty) {
        _mesajGoster("Lütfen tüm alanları doldurunuz.");
        return;
      }

      // Giriş Kontrolü (Simülasyon)
      if ((email == _kayitliEmail || email == "Selinay") &&
          sifre == _kayitliSifre) {
        _mesajGoster(
          "Giriş Başarılı! Hoş geldiniz.",
          renk: const Color(0xFF9CC4B2),
        );

        // Giriş yapanın ismini belirle
        kullaniciAdi = email.contains("@") ? "Selinay" : email;

        // DİREKT MAIN 5'E GİT (INTRO YOK)
        Future.delayed(const Duration(seconds: 1), () {
          if (mounted) {
            Navigator.pushReplacement(
              context,
              MaterialPageRoute(
                builder: (context) => AnaTakipEkrani(
                  kullaniciIsmi: kullaniciAdi,
                  // NOT: Gerçek uygulamada veritabanından çekeriz.
                  // Şimdilik kayıtlı kullanıcının hedefleri bunlarmış gibi davranıyoruz:
                  secilenHedefler: const ["Spor ve Beslenme", "Kitap Okuma"],
                ),
              ),
            );
          }
        });
      } else {
        _mesajGoster(
          "Kullanıcı adı/E-posta veya şifre hatalı.",
          renk: const Color(0xFFFF4000),
        );
      }
    }
    // ==========================================
    // 2. KAYIT OLMA SENARYOSU (YENİ KULLANICI)
    // ==========================================
    else {
      if (_kullaniciAdiController.text.trim().isEmpty) {
        _mesajGoster("Lütfen bir kullanıcı adı belirleyiniz.");
        return;
      }

      if (!email.contains("@")) {
        _mesajGoster("Lütfen geçerli bir e-posta adresi giriniz.");
        return;
      }

      if (!_sifreRegex.hasMatch(sifre)) {
        _mesajGoster(
          "Şifre en az 8 karakter, büyük/küçük harf ve rakam içermelidir.",
          renk: const Color(0xFFFF4000),
        );
        return;
      }

      // Kayıt Başarılı
      kullaniciAdi = _kullaniciAdiController.text.trim();
      _mesajGoster(
        "Kayıt başarıyla oluşturuldu!",
        renk: const Color(0xFF9CC4B2),
      );

      // INTRO'YA GİT (MAIN 2)
      Future.delayed(const Duration(seconds: 1), () {
        if (mounted) {
          Navigator.pushReplacement(
            context,
            MaterialPageRoute(
              // Yeni kullanıcı olduğu için tanıtım ekranına (AnaSayfa) gidiyor
              builder: (context) => AnaSayfa(kullaniciAdi: kullaniciAdi),
            ),
          );
        }
      });
    }
  }

  void _mesajGoster(String mesaj, {Color renk = const Color(0xFFFF4000)}) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(mesaj),
        backgroundColor: renk,
        behavior: SnackBarBehavior.floating,
        margin: const EdgeInsets.all(10),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[200],
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const SizedBox(height: 20),
              Text(
                "75 Hard Challenge",
                style: const TextStyle(
                  fontSize: 34,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFFC52184),
                ),
              ),
              const SizedBox(height: 10),
              Image.asset(
                'assets/logo.png',
                height: 180,
                width: 180,
                fit: BoxFit.contain,
              ),
              const SizedBox(height: 20),
              Text(
                girisModu ? "Hoş Geldiniz" : "Hesap Oluştur",
                style: const TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFFFF4000),
                ),
              ),
              const SizedBox(height: 10),
              Text(
                girisModu
                    ? "Devam etmek için giriş yapın."
                    : "Hemen aramıza katılın!",
                style: TextStyle(color: Colors.grey[600]),
              ),
              const SizedBox(height: 40),

              // --- KULLANICI ADI ALANI (Sadece Kayıt Modunda) ---
              if (!girisModu) ...[
                TextField(
                  controller: _kullaniciAdiController,
                  decoration: InputDecoration(
                    labelText: "Kullanıcı Adı",
                    prefixIcon: const Icon(Icons.person),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    filled: true,
                    fillColor: Colors.white,
                  ),
                ),
                const SizedBox(height: 20),
              ],

              // --- E-POSTA / KULLANICI ADI GİRİŞİ ---
              TextField(
                controller: _emailController,
                keyboardType: TextInputType.emailAddress,
                decoration: InputDecoration(
                  labelText: girisModu
                      ? "E-Posta veya Kullanıcı Adı"
                      : "E-Posta",
                  hintText: girisModu
                      ? "Kullanıcı adı veya e-posta"
                      : "ornek@email.com",
                  prefixIcon: const Icon(Icons.email_outlined),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  filled: true,
                  fillColor: Colors.white,
                ),
              ),

              const SizedBox(height: 20),

              // --- ŞİFRE ALANI ---
              TextField(
                controller: _sifreController,
                obscureText: sifreGizli,
                decoration: InputDecoration(
                  labelText: "Şifre",
                  prefixIcon: const Icon(Icons.lock_outline),
                  suffixIcon: IconButton(
                    icon: Icon(
                      sifreGizli ? Icons.visibility_off : Icons.visibility,
                    ),
                    onPressed: () {
                      setState(() {
                        sifreGizli = !sifreGizli;
                      });
                    },
                  ),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  filled: true,
                  fillColor: Colors.white,
                ),
              ),

              const SizedBox(height: 30),

              // --- ANA BUTON ---
              SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton(
                  onPressed: _islemYap,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFC52184),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: Text(
                    girisModu ? "Giriş Yap" : "Kayıt Ol",
                    style: const TextStyle(fontSize: 18),
                  ),
                ),
              ),

              const SizedBox(height: 20),

              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    girisModu ? "Hesabın yok mu?" : "Zaten hesabın var mı?",
                    style: TextStyle(color: Colors.grey[700]),
                  ),
                  TextButton(
                    onPressed: () {
                      setState(() {
                        girisModu = !girisModu;
                        _emailController.clear();
                        _sifreController.clear();
                        _kullaniciAdiController.clear();
                      });
                    },
                    child: Text(
                      girisModu ? "Kayıt Ol" : "Giriş Yap",
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        color: Color(0xFFC52184),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
