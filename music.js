/**
 * Oyun için arka plan müziği
 * Bu dosya, arka plan müziğini sürekli olarak çalar
 */

// Sayfa yüklenirken ses bağlamını oluştur
let bgAudioContext = null;
let bgMusicSource = null;
let bgMusicVolume = 0.3; // Arka plan müziği ses seviyesi

// Sayfa yüklenirken müziği başlat
window.addEventListener('DOMContentLoaded', initBackgroundMusic);

// Arka plan müziğini başlatma fonksiyonu
async function initBackgroundMusic() {
    try {
        // Ses bağlamı mevcut değilse oluştur
        if (!bgAudioContext) {
            bgAudioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        // Müzik dosyasını yükle
        const response = await fetch('assets/sounds/TownTheme.mp3');
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await bgAudioContext.decodeAudioData(arrayBuffer);
        
        // Müziği çal
        playBackgroundMusic(audioBuffer);
        
        // Kullanıcı etkileşimi gerektiren tarayıcılarda sesi etkinleştirmek için tıklama dinleyicisi ekle
        document.addEventListener('click', function resumeAudio() {
            if (bgAudioContext.state === 'suspended') {
                bgAudioContext.resume();
            }
            document.removeEventListener('click', resumeAudio);
        }, { once: true });
        
    } catch (error) {
        console.warn('Arka plan müziği yükleme başarısız:', error);
    }
}

// Arka plan müziğini çalma fonksiyonu
function playBackgroundMusic(audioBuffer) {
    if (!bgAudioContext || !audioBuffer) return;
    
    // Mevcut kaynak varsa durdur
    if (bgMusicSource) {
        try {
            bgMusicSource.stop();
        } catch (e) {}
    }
    
    // Yeni bir ses kaynağı oluştur
    bgMusicSource = bgAudioContext.createBufferSource();
    bgMusicSource.buffer = audioBuffer;
    bgMusicSource.loop = true; // Müziği sürekli tekrarla
    
    // Ses seviyesi kontrolü ekle
    const gainNode = bgAudioContext.createGain();
    gainNode.gain.value = bgMusicVolume;
    
    // Kaynağı çıkış noktasına bağla
    bgMusicSource.connect(gainNode);
    gainNode.connect(bgAudioContext.destination);
    
    // Müziği çalmaya başla
    bgMusicSource.start();
    
    // Müzik bittiğinde tekrar çal (tekrarlama için ek önlem)
    bgMusicSource.onended = function() {
        playBackgroundMusic(audioBuffer);
    };
}
