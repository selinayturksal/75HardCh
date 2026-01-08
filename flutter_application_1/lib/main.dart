import 'package:flutter/material.dart';
import 'main2.dart';

void main() {
  // Uygulamanın başlangıç noktası
  runApp(const BenimUygulamam());
}

class BenimUygulamam extends StatelessWidget {
  // uygulamanın genel ayarları.statelass sabit ekran için, stateful değişen ekranlar için
  const BenimUygulamam({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      //uygulamanın ana iskeleti
      debugShowCheckedModeBanner: false, // sağ üstteki debug etiketini kaldırır
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFFC52184)),
        useMaterial3: true, // Daha modern görünüm sağlar
      ),
      home: const GirisEkrani(), //uygulama açıldığında gösterilecek ilk ekran
    );
  }
}

class GirisEkrani extends StatefulWidget {
  // statefull çünkü ekranda değişen veriler var (girilen yazı, şifre görünürlüğü vb.)
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

  final RegExp _sifreRegex = RegExp(
    // şifrenin kurallara uyup uymadığını kontrol et
    r'^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,}$',
  );

  // Simülasyon için sahte veritabanı bilgisi
  final String _kayitliEmail = "deneme@gmail.com";
  final String _kayitliSifre = "Deneme123";

  // --- İŞLEM FONKSİYONU ---
  void _islemYap() {
    String email = _emailController.text.trim(); // Boşlukları temizle
    String sifre = _sifreController.text;

    // 1. E-POSTA KONTROLÜ (Her iki durumda da geçerli)
    if (!email.contains("@")) {
      _mesajGoster("Lütfen geçerli bir e-posta adresi giriniz.");
      return;
    }

    if (girisModu) {
      // --- GİRİŞ MODU SENARYOSU ---

      // Veritabanı olmadığı için elle kontrol ediyoruz (Mocking)
      if (email == _kayitliEmail && sifre == _kayitliSifre) {
        _mesajGoster("Giriş Başarılı! Hoş geldiniz.", renk: Color(0xFF9CC4B2));
        Future.delayed(const Duration(seconds: 1), () {
          // Sayfa hala açıksa yönlendirme yap
          if (mounted) {
            Navigator.pushReplacement(
              context,
              MaterialPageRoute(builder: (context) => const AnaSayfa()),
            );
          }
        });
      } else if (email != _kayitliEmail) {
        _mesajGoster(
          "Bu e-posta ile kayıtlı kullanıcı bulunamadı.",
          renk: Color(0xFFFF4000),
        );
      } else {
        // Email doğru ama şifre yanlışsa
        _mesajGoster("Girdiğiniz şifre hatalı.", renk: Color(0xFFFF4000));
      }
    } else {
      // --- KAYIT MODU SENARYOSU ---

      // Şifre Validasyonu (Regex ile kontrol)
      if (!_sifreRegex.hasMatch(sifre)) {
        _mesajGoster(
          "Şifre en az 8 karakter olmalı, büyük harf, küçük harf ve rakam içermelidir.",
          renk: Color(0xFFFF4000),
        );
        return;
      }
      // Her şey yolundaysa
      _mesajGoster("Kayıt başarıyla oluşturuldu!", renk: Color(0xFF9CC4B2));
    }
  }

  // uyarı mesajı göstermek için fonksiyon
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
                  color: const Color(0xFFC52184),
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
                  color: const Color(0xFFFF4000),
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

              // --- E-POSTA ALANI ---
              TextField(
                controller: _emailController,
                keyboardType: TextInputType.emailAddress,
                decoration: InputDecoration(
                  labelText: "E-Posta",
                  hintText: "ornek@email.com", // Kullanıcıya ipucu
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
                  onPressed: _islemYap, // Fonksiyonu buraya bağladık
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
                        // Mod değişince inputları temizlemek iyi bir deneyim olabilir
                        _emailController.clear();
                        _sifreController.clear();
                      });
                    },
                    child: Text(
                      girisModu ? "Kayıt Ol" : "Giriş Yap",
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        color: const Color(0xFFC52184),
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
