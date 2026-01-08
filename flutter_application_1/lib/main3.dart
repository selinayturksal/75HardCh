// main3.dart
import 'package:flutter/material.dart';
import 'dart:async';
import 'main4.dart';

class GecisSayfasi extends StatefulWidget {
  const GecisSayfasi({super.key});

  @override
  State<GecisSayfasi> createState() => _GecisSayfasiState();
}

class _GecisSayfasiState extends State<GecisSayfasi>
    with TickerProviderStateMixin {
  late AnimationController _fadeController;
  Timer? _kalpTimer;
  final List<KalpModeli> _kalpler = [];
  Offset _parmakKonumu = Offset.zero;

  @override
  void initState() {
    super.initState();
    // 3 saniye basılı tutulunca işlem tamamlanır
    _fadeController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 3),
    );

    _fadeController.addStatusListener((status) {
      if (status == AnimationStatus.completed) {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (context) => const SonSayfa()),
        );
      }
    });
  }

  @override
  void dispose() {
    _fadeController.dispose();
    _kalpTimer?.cancel();
    super.dispose();
  }

  void _basiliTutmaBasladi(LongPressStartDetails details) {
    _parmakKonumu = details.globalPosition;
    _fadeController.forward();

    _kalpTimer = Timer.periodic(const Duration(milliseconds: 100), (timer) {
      if (mounted) {
        setState(() {
          _kalpler.add(
            KalpModeli(
              id: DateTime.now().millisecondsSinceEpoch,
              pozisyon:
                  _parmakKonumu +
                  Offset(
                    (DateTime.now().millisecond % 60 - 30).toDouble(),
                    (DateTime.now().millisecond % 60 - 30).toDouble(),
                  ),
            ),
          );
        });
      }
    });
  }

  void _basiliTutmaBitti() {
    if (_fadeController.status != AnimationStatus.completed) {
      _fadeController.reverse();
      _kalpTimer?.cancel();
    }
  }

  void _parmakHareketEdiyor(LongPressMoveUpdateDetails details) {
    _parmakKonumu = details.globalPosition;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFC52184), // Pembe Arkaplan
      body: GestureDetector(
        onLongPressStart: _basiliTutmaBasladi,
        onLongPressEnd: (_) => _basiliTutmaBitti(),
        onLongPressMoveUpdate: _parmakHareketEdiyor,
        behavior: HitTestBehavior.opaque,
        child: Stack(
          children: [
            // YAZI VE İKON
            Center(
              child: Padding(
                padding: const EdgeInsets.all(30.0),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: const [
                    Icon(Icons.fingerprint, color: Colors.white, size: 80),
                    SizedBox(height: 20),
                    Text(
                      "Bunların hepsini kontrol edebilirsin!\n\nDevam etmek için parmağını basılı tut.",
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
            ),

            // KALPLER (Burada beyaz renkli)
            ..._kalpler.map(
              (kalp) => GeciciKalpWidget(
                key: ValueKey(kalp.id),
                model: kalp,
                ozelRenk: Colors.white.withOpacity(0.8), // Beyaz kalpler
                onComplete: () {
                  if (mounted) {
                    setState(() {
                      _kalpler.remove(kalp);
                    });
                  }
                },
              ),
            ),

            // KARARMA EFEKTİ
            AnimatedBuilder(
              animation: _fadeController,
              builder: (context, child) {
                return Container(
                  color: const Color(
                    0xFFFEC9F1,
                  ).withOpacity(_fadeController.value),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}

// --- YARDIMCI SINIFLAR (Main3 için gerekli) ---
class KalpModeli {
  final int id;
  final Offset pozisyon;
  KalpModeli({required this.id, required this.pozisyon});
}

class GeciciKalpWidget extends StatefulWidget {
  final KalpModeli model;
  final VoidCallback onComplete;
  final Color? ozelRenk;

  const GeciciKalpWidget({
    super.key,
    required this.model,
    required this.onComplete,
    this.ozelRenk,
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
      duration: const Duration(milliseconds: 800),
    );
    _scaleAnimation = Tween<double>(
      begin: 0.0,
      end: 2.0,
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
                child: Icon(
                  Icons.favorite,
                  color: widget.ozelRenk ?? const Color(0xFFC52184),
                  size: 50 + (widget.model.id % 40).toDouble(),
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}
