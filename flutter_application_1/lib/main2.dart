import 'package:flutter/material.dart';
import 'dart:async';
import 'main3.dart'; // GecisSayfasi'na erişim için

class AnaSayfa extends StatefulWidget {
  // 1. Gelen veriyi burada karşılıyoruz
  final String kullaniciAdi;

  const AnaSayfa({super.key, required this.kullaniciAdi});

  @override
  State<AnaSayfa> createState() => _AnaSayfaState();
}

class _AnaSayfaState extends State<AnaSayfa> {
  // Hoşgeldiniz Animasyonu
  late String _hosgeldinMetni; // Metni dinamik yapacağız
  String _ekrandakiMetin = "";
  int _harfSayaci = 0;
  bool _hosgeldinBitti = false;

  // İçerik Akışı için
  int _aktifAdim = 0;

  // Özellik Listesi
  final List<Map<String, dynamic>> _ozellikler = [
    {
      "baslik": "Günlük Sporun",
      "icon": Icons.fitness_center,
      "renk": Colors.orange,
    },
    {
      "baslik": "Tükettiğin Su Miktarı",
      "icon": Icons.water_drop,
      "renk": Colors.blue,
    },
    {
      "baslik": "Kendine Ayırdığın Zaman",
      "icon": Icons.spa,
      "renk": const Color.fromARGB(255, 194, 107, 75),
    },
    {"baslik": "Yediklerin", "icon": Icons.restaurant, "renk": Colors.green},
    {
      "baslik": "Sosyalleşme Zamanın",
      "icon": Icons.people,
      "renk": const Color.fromARGB(255, 182, 5, 5),
    },
    {
      "baslik": "Ders Çalışma Süren",
      "icon": Icons.auto_stories,
      "renk": const Color.fromARGB(255, 9, 48, 99),
    },
  ];

  // Kalp Efekti Listesi
  final List<KalpModeli> _kalpler = [];

  @override
  void initState() {
    super.initState();
    // 2. Metni kullanıcının adına göre ayarlıyoruz (Büyük harfle)
    _hosgeldinMetni = "HOŞGELDİN ${widget.kullaniciAdi.toUpperCase()}";

    _daktiloEfektiniBaslat();
  }

  void _daktiloEfektiniBaslat() {
    Timer.periodic(const Duration(milliseconds: 150), (timer) {
      if (!mounted) {
        timer.cancel();
        return;
      }

      if (_harfSayaci < _hosgeldinMetni.length) {
        setState(() {
          _ekrandakiMetin += _hosgeldinMetni[_harfSayaci];
          _harfSayaci++;
        });
      } else {
        timer.cancel();
        Future.delayed(const Duration(milliseconds: 500), () {
          if (mounted) {
            setState(() {
              _hosgeldinBitti = true;
            });
            Future.delayed(const Duration(milliseconds: 200), () {
              if (mounted) {
                setState(() {
                  _aktifAdim = 1;
                });
              }
            });
          }
        });
      }
    });
  }

  void _ekranaTiklandi(TapDownDetails details) {
    setState(() {
      _kalpler.add(
        KalpModeli(
          id: DateTime.now().millisecondsSinceEpoch,
          pozisyon: details.globalPosition,
        ),
      );
    });

    if (_hosgeldinBitti) {
      if (_aktifAdim < _ozellikler.length) {
        setState(() {
          _aktifAdim++;
        });
      } else {
        // 3. Diğer sayfaya geçerken ismi taşıyoruz
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => GecisSayfasi(
              gelenKullaniciAdi: widget.kullaniciAdi, // İsim burada aktarılıyor
            ),
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTapDown: _ekranaTiklandi,
        child: Stack(
          children: [
            // --- KATMAN 1: ANA İÇERİK ---
            if (_hosgeldinBitti)
              Positioned.fill(
                child: SafeArea(
                  child: Column(
                    children: [
                      const SizedBox(height: 20),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Image.asset('assets/logo.png', height: 80),
                          const SizedBox(width: 10),
                          const Text(
                            "75 Hard Challenge",
                            style: TextStyle(
                              color: Color(0xFFC52184),
                              fontWeight: FontWeight.bold,
                              fontSize: 22,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 30),
                      AnimatedContainer(
                        duration: const Duration(milliseconds: 600),
                        curve: Curves.easeInOut,
                        height: _aktifAdim == 0
                            ? MediaQuery.of(context).size.height * 0.3
                            : 60,
                        alignment: Alignment.center,
                        padding: const EdgeInsets.symmetric(horizontal: 20),
                        child: Text(
                          "Sadece 75 günde en iyi versiyonuna ulaşmak için hazır mısın?",
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontSize: _aktifAdim == 0 ? 26 : 15,
                            fontWeight: FontWeight.bold,
                            color: const Color(0xFFC52184),
                          ),
                        ),
                      ),
                      Expanded(
                        child: Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 20.0),
                          child: ListView.builder(
                            itemCount: _ozellikler.length,
                            itemBuilder: (context, index) {
                              if (index >= _aktifAdim)
                                return const SizedBox.shrink();

                              return TweenAnimationBuilder(
                                duration: const Duration(milliseconds: 500),
                                tween: Tween<double>(begin: 0, end: 1),
                                builder: (context, double val, child) {
                                  return Opacity(
                                    opacity: val,
                                    child: Transform.translate(
                                      offset: Offset(0, 30 * (1 - val)),
                                      child: child,
                                    ),
                                  );
                                },
                                child: Container(
                                  margin: const EdgeInsets.only(bottom: 15),
                                  padding: const EdgeInsets.all(20),
                                  decoration: BoxDecoration(
                                    color: Colors.grey[100],
                                    borderRadius: BorderRadius.circular(15),
                                    border: Border.all(color: Colors.black12),
                                  ),
                                  child: Row(
                                    children: [
                                      Icon(
                                        _ozellikler[index]['icon'],
                                        color: _ozellikler[index]['renk'],
                                        size: 30,
                                      ),
                                      const SizedBox(width: 15),
                                      Text(
                                        _ozellikler[index]['baslik'],
                                        style: const TextStyle(
                                          fontSize: 18,
                                          fontWeight: FontWeight.w500,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              );
                            },
                          ),
                        ),
                      ),
                      if (_aktifAdim <= _ozellikler.length)
                        Padding(
                          padding: const EdgeInsets.all(20.0),
                          child: Text(
                            _aktifAdim == _ozellikler.length
                                ? "Bitirmek için son kez dokun ✨"
                                : "Devam etmek için ekrana dokun...",
                            style: const TextStyle(
                              color: Color(0xFFFEC9F1),
                              fontSize: 14,
                            ),
                          ),
                        ),
                    ],
                  ),
                ),
              ),

            // --- KATMAN 2: HOŞGELDİNİZ YAZISI ---
            if (!_hosgeldinBitti)
              Center(
                child: Text(
                  _ekrandakiMetin,
                  textAlign: TextAlign.center, // İsim uzunsa alt satıra geçsin
                  style: const TextStyle(
                    fontSize: 34,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 2,
                    color: Color(0xFFC52184),
                  ),
                ),
              ),

            // --- KATMAN 3: KALPLER ---
            ..._kalpler.map(
              (kalp) => GeciciKalpWidget(
                key: ValueKey(kalp.id),
                model: kalp,
                onComplete: () {
                  setState(() {
                    _kalpler.remove(kalp);
                  });
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class KalpModeli {
  final int id;
  final Offset pozisyon;
  KalpModeli({required this.id, required this.pozisyon});
}

class GeciciKalpWidget extends StatefulWidget {
  final KalpModeli model;
  final VoidCallback onComplete;

  const GeciciKalpWidget({
    super.key,
    required this.model,
    required this.onComplete,
  });

  @override
  State<GeciciKalpWidget> createState() => _GeciciKalpWidgetState();
}

class _GeciciKalpWidgetState extends State<GeciciKalpWidget>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;
  late Animation<double> _opacityAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
    );

    _scaleAnimation = Tween<double>(
      begin: 0.0,
      end: 1.5,
    ).animate(CurvedAnimation(parent: _controller, curve: Curves.easeOutBack));

    _opacityAnimation = Tween<double>(begin: 1.0, end: 0.0).animate(
      CurvedAnimation(parent: _controller, curve: const Interval(0.5, 1.0)),
    );

    _controller.forward().then((value) => widget.onComplete());
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Positioned(
      left: widget.model.pozisyon.dx - 25,
      top: widget.model.pozisyon.dy - 25,
      child: IgnorePointer(
        child: AnimatedBuilder(
          animation: _controller,
          builder: (context, child) {
            return Opacity(
              opacity: _opacityAnimation.value,
              child: Transform.scale(
                scale: _scaleAnimation.value,
                child: const Icon(
                  Icons.favorite,
                  color: Color(0xFFFF4000),
                  size: 20,
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}
