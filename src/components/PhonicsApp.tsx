import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import LetterDisplay from './LetterDisplay';
import WordLengthSlider from './WordLengthSlider';
import LanguageSelector from './LanguageSelector';
import { useKeyboardControls } from '../hooks/useKeyboardControls';
import { useImageAPI } from '../hooks/useImageAPI';

const PhonicsApp: React.FC = () => {
  const [wordLength, setWordLength] = useState(1);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(3);
  const [showImage, setShowImage] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [language, setLanguage] = useState('en');
  const audioRef = useRef<HTMLAudioElement>(null);
  const touchHandledRef = useRef(false);
  const touchCountRef = useRef(0);

  // Content arrays for different languages and word lengths
  const getContent = () => {
    const content: Record<string, Record<number, string[]>> = {
      en: {
        1: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
        2: ['AT', 'BE', 'GO', 'HE', 'IF', 'IN', 'IS', 'IT', 'MY', 'NO', 'OF', 'ON', 'OR', 'SO', 'TO', 'UP', 'WE'],
        3: ['AND', 'ARE', 'BUT', 'CAN', 'CAR', 'CAT', 'DOG', 'EAT', 'FOR', 'GET', 'GOT', 'HAD', 'HAS', 'HER', 'HIM', 'HIS', 'HOW', 'ITS', 'LET', 'MAY', 'NEW', 'NOT', 'NOW', 'OLD', 'ONE', 'OUR', 'OUT', 'PUT', 'RUN', 'SAY', 'SHE', 'THE', 'TOO', 'TWO', 'USE', 'WAS', 'WAY', 'WHO', 'WIN', 'YES', 'YET', 'YOU'],
        4: ['BACK', 'BEEN', 'CALL', 'CAME', 'COME', 'EACH', 'FIND', 'GIVE', 'GOOD', 'HAVE', 'HERE', 'JUST', 'KNOW', 'LAST', 'LEFT', 'LIFE', 'LIKE', 'LIVE', 'LOOK', 'MADE', 'MAKE', 'MANY', 'MORE', 'MOST', 'MOVE', 'MUCH', 'NAME', 'NEED', 'NEXT', 'ONLY', 'OVER', 'PART', 'PLAY', 'RIGHT', 'SAID', 'SAME', 'SEEM', 'SHOW', 'SOME', 'TAKE', 'TELL', 'THAN', 'THAT', 'THEM', 'THEY', 'THIS', 'TIME', 'VERY', 'WANT', 'WELL', 'WENT', 'WERE', 'WHAT', 'WHEN', 'WILL', 'WITH', 'WORD', 'WORK', 'YEAR', 'YOUR']
      },
      ar: {
        1: ['ا', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ذ', 'ر', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 'ق', 'ك', 'ل', 'م', 'ن', 'ه', 'و', 'ي'],
        2: ['أم', 'أب', 'بر', 'جد', 'دم', 'رز', 'سم', 'شم', 'طب', 'فم', 'قد', 'كل', 'لا', 'ما', 'نم', 'هو', 'يد'],
        3: ['أسد', 'بحر', 'تين', 'جمل', 'حصان', 'خبز', 'دجاج', 'ذئب', 'رمان', 'زهر', 'سمك', 'شجر', 'صقر', 'ضفدع', 'طير', 'ظبي', 'عين', 'غزال', 'فيل', 'قطة', 'كتاب', 'لحم', 'ماء', 'نار', 'هلال', 'وردة', 'يوم'],
        4: ['أرنب', 'برتقال', 'تفاح', 'جزر', 'حليب', 'خروف', 'ديك', 'ذهب', 'رقبة', 'زيتون', 'سلحفاة', 'شمس', 'صباح', 'ضوء', 'طاولة', 'ظل', 'عصفور', 'غابة', 'فراشة', 'قمر', 'كرسي', 'ليمون', 'مفتاح', 'نجمة', 'هدية', 'وجه', 'يد']
      },
      ja: {
        1: ['あ', 'い', 'う', 'え', 'お', 'か', 'き', 'く', 'け', 'こ', 'さ', 'し', 'す', 'せ', 'そ', 'た', 'ち', 'つ', 'て', 'と', 'な', 'に', 'ぬ', 'ね', 'の', 'は', 'ひ', 'ふ', 'へ', 'ほ', 'ま', 'み', 'む', 'め', 'も', 'や', 'ゆ', 'よ', 'ら', 'り', 'る', 'れ', 'ろ', 'わ', 'を', 'ん'],
        2: ['いえ', 'うみ', 'えき', 'おか', 'かお', 'きつね', 'くま', 'けむり', 'こえ', 'さる', 'しお', 'すし', 'せみ', 'そら', 'たこ', 'ちず', 'つき', 'てがみ', 'とり', 'なつ', 'にわ', 'ぬの', 'ねこ', 'のど', 'はな', 'ひつじ', 'ふね', 'へび', 'ほし', 'まど', 'みず', 'むし', 'めがね', 'もり', 'やま', 'ゆき', 'よる', 'らいおん', 'りんご', 'るす', 'れいぞうこ', 'ろうそく', 'わに'],
        3: ['あかちゃん', 'いちご', 'うさぎ', 'えんぴつ', 'おもちゃ', 'かばん', 'きりん', 'くじら', 'けしゴム', 'こうえん', 'さくら', 'しんぶん', 'すいか', 'せんせい', 'そうじき', 'たまご', 'ちょうちょ', 'つくえ', 'てれび', 'といれ', 'なまえ', 'にんじん', 'ぬいぐるみ', 'ねずみ', 'のりもの', 'はさみ', 'ひこうき', 'ふとん', 'へや', 'ほうき', 'まくら', 'みかん', 'むかで', 'めだか', 'もも', 'やきゅう', 'ゆうびん', 'よこはま', 'らっぱ', 'りす', 'るーる', 'れもん', 'ろぼっと', 'わかめ'],
        4: ['あひる', 'いす', 'うでどけい', 'えほん', 'おかし', 'かみ', 'きって', 'くつした', 'けいたい', 'こっぷ', 'さかな', 'しゃしん', 'すずめ', 'せっけん', 'そふぁ', 'たおる', 'ちゃわん', 'つみき', 'てぶくろ', 'とけい', 'なべ', 'にほん', 'ぬりえ', 'ねくたい', 'のーと', 'はぶらし', 'ひまわり', 'ふうせん', 'へるめっと', 'ほっぺ', 'まつり', 'みらい', 'むらさき', 'めがね', 'もちもち', 'やさい', 'ゆめ', 'よっと', 'らじお', 'りょこう', 'るーる', 'れっしゃ', 'ろーそく', 'わーど']
      },
      ko: {
        1: ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ', 'ㅏ', 'ㅑ', 'ㅓ', 'ㅕ', 'ㅗ', 'ㅛ', 'ㅜ', 'ㅠ', 'ㅡ', 'ㅣ'],
        2: ['가구', '나무', '다리', '라면', '마음', '바다', '사과', '아기', '자동차', '차', '카페', '타이어', '파일', '하늘'],
        3: ['가방', '나비', '다람쥐', '라디오', '마법', '바나나', '사자', '아침', '자전거', '차례', '카메라', '타월', '파티', '하마'],
        4: ['가족', '나라', '다이아몬드', '라이온', '마시멜로', '바이올린', '사진기', '아이스크림', '자석', '차량', '카드', '타조', '파인애플', '하트']
      },
      fa: {
        1: ['ا', 'ب', 'پ', 'ت', 'ث', 'ج', 'چ', 'ح', 'خ', 'د', 'ذ', 'ر', 'ز', 'ژ', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 'ق', 'ک', 'گ', 'ل', 'م', 'ن', 'و', 'ه', 'ی'],
        2: ['آب', 'باد', 'پا', 'تاج', 'ثواب', 'جام', 'چای', 'حال', 'خانه', 'دار', 'ذوق', 'راه', 'زار', 'ژاله', 'ساز', 'شاه', 'صاف', 'ضرب', 'طاق', 'ظرف', 'عاج', 'غار', 'فال', 'قاب', 'کار', 'گاو', 'لاک', 'ماه', 'نان', 'واژه', 'هوا', 'یار'],
        3: ['آسمان', 'برف', 'پرنده', 'تمساح', 'ثعلب', 'جنگل', 'چراغ', 'حیوان', 'خرگوش', 'دریا', 'ذغال', 'رنگ', 'زردآلو', 'ژیان', 'سیب', 'شیر', 'صندلی', 'ضربان', 'طوطی', 'ظهر', 'عنکبوت', 'غذا', 'فیل', 'قلم', 'کتاب', 'گربه', 'لیمو', 'موز', 'نارنج', 'ورزش', 'هدیه', 'یخ'],
        4: ['آرامش', 'برادر', 'پروانه', 'تلویزیون', 'ثروت', 'جادوگر', 'چمدان', 'حمام', 'خورشید', 'دوست', 'ذهن', 'رستوران', 'زمستان', 'ژورنال', 'سفر', 'شکلات', 'صبحانه', 'ضیافت', 'طبیعت', 'ظرافت', 'عروسک', 'غروب', 'فرش', 'قهوه', 'کامپیوتر', 'گیاه', 'لباس', 'موسیقی', 'نوشیدنی', 'ورق', 'هنرمند', 'یادگیری']
      }
    };
    
    return content[language]?.[wordLength] || content.en[wordLength];
  };

  const currentContent = getContent();

  const handleConfettiTrigger = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setShowConfetti(true);
    
    setTimeout(() => {
      setShowConfetti(false);
      setIsAnimating(false);
    }, 2000);
  };

  const { caseMode, toggleCaseMode } = useKeyboardControls(
    currentContent,
    currentIndex,
    setCurrentIndex,
    wordLength,
    () => {
      setShowImage(false);
      playNavigationAudio();
    },
    handleConfettiTrigger
  );

  const { fetchImage } = useImageAPI();
  const [currentImageData, setCurrentImageData] = useState<{ url: string; searchTerm: string } | null>(null);

  const searchImage = async (text: string) => {
    try {
      const result = await fetchImage(text, wordLength === 1);
      if (result) {
        setCurrentImageData(result);
      }
    } catch (error) {
      console.error('Error fetching image:', error);
    }
  };

  const playNavigationAudio = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.volume = 0.1;
      audioRef.current.play().catch(console.log);
    }
  };

  const getMaxZoom = () => {
    const baseMax = 8;
    const lengthFactor = wordLength === 1 ? 1 : wordLength === 2 ? 0.8 : wordLength === 3 ? 0.6 : 0.4;
    return baseMax * lengthFactor;
  };

  const currentDisplayText = caseMode === 'uppercase' 
    ? currentContent[currentIndex] 
    : currentContent[currentIndex].toLowerCase();

  useEffect(() => {
    setCurrentIndex(0);
    setShowImage(false);
    const maxZoom = getMaxZoom();
    if (zoomLevel > maxZoom) {
      setZoomLevel(maxZoom);
    }
  }, [wordLength, language, zoomLevel]);

  useEffect(() => {
    playNavigationAudio();
  }, [currentIndex]);

  const handleShowImage = async () => {
    if (!showImage) {
      await searchImage(currentContent[currentIndex]);
    }
    setShowImage(!showImage);
  };

  const handleLetterAreaClick = (side: 'left' | 'right' | 'center') => {
    if (side === 'center') {
      toggleCaseMode();
    }
  };

  const handleScreenClick = (e: React.MouseEvent | React.TouchEvent) => {
    if ('touches' in e && e.touches.length > 1) {
      return;
    }
    
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0]?.clientX || e.changedTouches[0]?.clientX : e.clientX;
    const x = clientX - rect.left;
    const width = rect.width;
    
    const clickedElement = e.target as HTMLElement;
    if (clickedElement.closest('button') || clickedElement.closest('[data-letter-display]')) {
      return;
    }
    
    setShowImage(false);
    
    if (x < width * 0.4) {
      const newIndex = (currentIndex - 1 + currentContent.length) % currentContent.length;
      setCurrentIndex(newIndex);
      playNavigationAudio();
    } else if (x > width * 0.6) {
      const newIndex = (currentIndex + 1) % currentContent.length;
      setCurrentIndex(newIndex);
      playNavigationAudio();
    }
  };

  const handleScreenTouchStart = (e: React.TouchEvent) => {
    touchCountRef.current = e.touches.length;
  };

  const handleScreenTouchEnd = (e: React.TouchEvent) => {
    if (touchCountRef.current === 1 && e.changedTouches.length === 1) {
      touchHandledRef.current = true;
      handleScreenClick(e);
      setTimeout(() => {
        touchHandledRef.current = false;
      }, 300);
    }
    touchCountRef.current = 0;
  };

  const handleScreenMouseClick = (e: React.MouseEvent) => {
    if (touchHandledRef.current) {
      return;
    }
    handleScreenClick(e);
  };

  return (
    <div className={`min-h-screen min-h-[100dvh] transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-black' 
        : 'bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50'
    } flex flex-col select-none overflow-hidden`}>
      
      {/* Improved Header */}
      <div className={`px-4 py-3 border-b transition-colors ${
        isDarkMode ? 'border-gray-700 bg-gray-800/90' : 'border-orange-200 bg-white/90'
      } backdrop-blur-sm flex-shrink-0 shadow-sm`}>
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center">
            <img 
              src="https://i.imgur.com/wgCFzsE.png" 
              alt="Simple Phonics Logo" 
              className="h-10 md:h-12 object-contain mr-4"
            />
            <div className="hidden sm:block">
              <h1 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-orange-800'}`}>
                Simple Phonics
              </h1>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-orange-600'}`}>
                Interactive Learning
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <WordLengthSlider 
              value={wordLength} 
              onChange={setWordLength} 
              isDarkMode={isDarkMode} 
            />
            
            <LanguageSelector
              value={language}
              onChange={setLanguage}
              isDarkMode={isDarkMode}
            />
            
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2.5 rounded-lg transition-colors ${
                isDarkMode 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'bg-orange-200 text-orange-800 hover:bg-orange-300'
              }`}
              aria-label={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div 
        className="flex-grow flex flex-col items-center justify-center p-4 min-h-0 relative cursor-pointer"
        style={{ 
          paddingTop: '2vh', 
          paddingBottom: '2vh',
          minHeight: 'calc(100vh - 120px)'
        }}
        onClick={handleScreenMouseClick}
        onTouchStart={handleScreenTouchStart}
        onTouchEnd={handleScreenTouchEnd}
      >
        <div className="w-full h-full flex items-center justify-center">
          <LetterDisplay 
            text={currentDisplayText} 
            isDarkMode={isDarkMode}
            showConfetti={showConfetti}
            zoomLevel={zoomLevel}
            onZoomChange={(level) => setZoomLevel(Math.min(level, getMaxZoom()))}
            showImage={showImage}
            imageData={currentImageData}
            onLetterAreaClick={handleLetterAreaClick}
            isClickable={true}
            maxZoom={getMaxZoom()}
            language={language}
          />
        </div>

        <audio ref={audioRef} src="/sounds/nav-click.mp3" />
      </div>
    </div>
  );
};

export default PhonicsApp;
