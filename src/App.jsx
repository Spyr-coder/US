import React, { useEffect, useRef, useState } from 'react';
import { 
  Heart, Sparkles, Calendar, Lock, ShieldCheck, Flame, BookOpen, Clock, 
  ChevronDown, ChevronUp, Image as ImageIcon, Star, Gift, Smile, Award,
  X, Maximize2, Music2, Pause, ArrowRight
} from 'lucide-react';


/*
 * ============================================================
 * Cloudinary image delivery
 * ============================================================
 * The original image paths are kept in the story/gallery data.
 * When VITE_CLOUDINARY_CLOUD_NAME is present, those paths are
 * resolved to Cloudinary URLs automatically for production.
 *
 * Netlify environment variables:
 *   VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
 *   VITE_CLOUDINARY_FOLDER=optional_folder_name
 *
 * Do NOT put a Cloudinary API secret in a VITE_ variable.
 */
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "";
const CLOUDINARY_FOLDER = import.meta.env.VITE_CLOUDINARY_FOLDER || "";

const resolveImageSrc = (src) => {
  if (!src) return src;

  // If an image is already a remote URL, keep it unchanged.
  if (/^https?:\/\//i.test(src)) return src;

  // Without the Netlify/Cloudinary variable, preserve the original
  // local path so local development continues to work as before.
  if (!CLOUDINARY_CLOUD_NAME) return src;

  const cleanPath = String(src).replace(/^\/+/, "");
  const withoutImagesFolder = cleanPath.replace(/^images\//i, "");
  const publicId = withoutImagesFolder.replace(/\.(jpe?g|png|webp|avif|gif)$/i, "");

  const folder = CLOUDINARY_FOLDER
    ? `${CLOUDINARY_FOLDER.replace(/^\/+|\/+$/g, "")}/`
    : "";

  const encodedPublicId = `${folder}${publicId}`
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");

  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/f_auto,q_auto,c_limit,w_1600/${encodedPublicId}`;
};


/*
 * ============================================================
 * Romantic visual effects
 * These components add atmosphere without changing any of the
 * original story, photos, or written content.
 * ============================================================
 */

const flowerSymbols = ["🌸", "🌷", "🌺", "🌼", "💮"];

const fallingPetals = Array.from({ length: 32 }, (_, i) => ({
  id: i,
  left: `${(i * 31.7) % 100}%`,
  delay: `${(i * 0.83) % 10}s`,
  duration: `${9 + ((i * 1.37) % 8)}s`,
  size: `${11 + ((i * 7) % 11)}px`,
  symbol: flowerSymbols[i % flowerSymbols.length],
  drift: `${-45 + ((i * 19) % 90)}px`,
  rotation: `${(i * 47) % 360}deg`,
}));

const FallingPetals = () => (
  <div
    className="fixed inset-0 pointer-events-none overflow-hidden z-30"
    aria-hidden="true"
  >
    {fallingPetals.map((petal) => (
      <span
        key={petal.id}
        className="absolute top-[-40px] select-none opacity-0"
        style={{
          left: petal.left,
          fontSize: petal.size,
          animation: `petalFall ${petal.duration} linear ${petal.delay} infinite`,
          "--petal-drift": petal.drift,
          "--petal-rotation": petal.rotation,
          filter: "drop-shadow(0 2px 3px rgba(236, 72, 153, 0.12))",
        }}
      >
        {petal.symbol}
      </span>
    ))}
  </div>
);

const FloatingHearts = () => {
  const hearts = [
    { left: "7%", delay: "2s", duration: "12s", size: "15px" },
    { left: "22%", delay: "7s", duration: "14s", size: "11px" },
    { left: "76%", delay: "4s", duration: "13s", size: "14px" },
    { left: "91%", delay: "9s", duration: "15s", size: "10px" },
  ];

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden z-30"
      aria-hidden="true"
    >
      {hearts.map((heart, index) => (
        <span
          key={index}
          className="absolute bottom-[-30px] opacity-0 select-none"
          style={{
            left: heart.left,
            fontSize: heart.size,
            animation: `heartFloat ${heart.duration} ease-in-out ${heart.delay} infinite`,
          }}
        >
          {index % 2 === 0 ? "💗" : "✨"}
        </span>
      ))}
    </div>
  );
};

const DecorativeCorner = ({ position = "top-left" }) => (
  <div
    className={`absolute pointer-events-none text-pink-200/70 ${
      position === "top-left"
        ? "top-3 left-4"
        : position === "top-right"
          ? "top-3 right-4"
          : position === "bottom-left"
            ? "bottom-3 left-4"
            : "bottom-3 right-4"
    }`}
    aria-hidden="true"
  >
    {position === "top-left" ? "🌸" : position === "top-right" ? "🌷" : position === "bottom-left" ? "🌺" : "✨"}
  </div>
);

export default function App() {

  const [unlocked, setUnlocked] = useState(false);
  const [letterOpening, setLetterOpening] = useState(false);
  const [reasonIndex, setReasonIndex] = useState(0);
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  // Track expanded/collapsed state for each chapter
  const [expandedChapters, setExpandedChapters] = useState({
    0: true,  // Chapter 1 open by default
    1: false,
    2: false,
    3: false,
    4: false,
    5: false,
    6: false
  });

  const SECRET_CODE = "12312023";

  const toggleChapter = (index) => {
    setExpandedChapters(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleUnlock = (e) => {
    e.preventDefault();
    if (passcode.trim() === SECRET_CODE || passcode.toLowerCase() === "love") {
      setError(false);
      setLetterOpening(true);
      setPasscode("");

      // Give the envelope animation time to complete before revealing the letter.
      window.setTimeout(() => {
        setLetterOpening(false);
        setUnlocked(true);
      }, 3000);
    } else {
      setError(true);
    }
  };

  const toggleMusic = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (audio.paused) {
        await audio.play();
        setIsPlaying(true);
      } else {
        audio.pause();
        setIsPlaying(false);
      }
    } catch {
      // If the optional audio file is not present or playback is blocked,
      // leave the page fully functional without showing an error.
      setIsPlaying(false);
    }
  };

  // Close the photo viewer with the Escape key.
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setSelectedImage(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Generate 100 image placeholders for the preserved gallery
  const preservedGallery = Array.from({ length: 100 }, (_, i) => ({
    id: i + 1,
    src: `/images/gallery_${i + 1}.jpg`,
    label: `Preserved Memory #${i + 1}`
  }));

  // Full, detailed story chapters with image sources pointing to the public folder
  const storyChapters = [
    {
      chapter: "Chapter 01",
      date: "Standard 7, Term 3 • Hawi Group of Schools",
      title: "Where It All Began 🌸",
      subtitle: "The 'Back Off' Look & That Magical First Kiss",
      content: `I remember when I transferred to Hawi Group of Schools in Standard 7, Term 3 and saw you for the very first time. You were such a no-nonsense girl! You used to look at me like "back off, boy," hahahaha. But after KCPE, we finally met up. 

We were still just kids with no idea how to plan a proper date. You came with your sister to the school we used to go to. We walked around, and your sister gave us a little privacy. In one of those classrooms... we shared our very first kiss. 

However silly it was, it was magical to me. That was the day I went back home, sat in the corner of my bed, called you "babe" out loud for the first time, and my whole future life flashed before my eyes—and you were right there with me.`,
      photos: [
        { label: "Our Old School / Hawi Days 🏫", hint: "Add a picture of the school or childhood memory", src: "/images/chapter1_1.jpg" },
        { label: "The Classroom Spot 💋", hint: "Add a picture representing our first kiss", src: "/images/chapter1_2.jpg" },
        { label: "Young Love 🧸", hint: "Add a picture from back in the day", src: "/images/chapter1_3.jpg" }
      ]
    },
    {
      chapter: "Chapter 02",
      date: "High School Days",
      title: "The Silent Years & Your Name Carved in Wood 🕊️",
      subtitle: "Checking on you when tragedy struck",
      content: `Going into high school, we couldn't talk for a while. Then the tragedy with your dad happened. I don't even know how I knew—when I heard news about an accident involving a principal, I immediately felt terrified. 

I remember I was in my mom's shop. I called her and asked if I could leave early to visit someone. I was coming just to check up on you because I didn't want to believe that had happened to you. 

We weren't in contact for most of high school after that, but I thought about you constantly. I thought about you so much that I even carved your name onto my high school locker. You were never off my mind.`,
      photos: [
        { label: "High School Locker / Memories ✏️", hint: "Add a photo/doodle of carved initials", src: "/images/chapter2_1.jpg" },
        { label: "Mom's Shop / The Journey 🏪", hint: "Add a picture from those high school years", src: "/images/chapter2_2.jpg" },
        { label: "Thinking Of You 💌", hint: "Add a memory photo from high school", src: "/images/chapter2_3.jpg" }
      ]
    },
    {
      chapter: "Chapter 03",
      date: "December 31, 2023",
      title: "Making It Official In The Midnight Hours 🎆",
      subtitle: "Flirting until midnight & choosing each other",
      content: `We reconnected after our KCSE exams. I remember how much we used to flirt, late into the night until midnight hahahaha. We were so naughty! I can't remember every exact word we said, but I remember how playful and sweet it was. 

We made it official during one of our routine naughty midnight chats on December 31st, 2023. We talked about how we wanted our relationship to be. We were both terrified of giving our hearts away after past heartbreaks, but we saw something special in each other. 

We were scared we'd be placed in universities far apart, but we talked about how life would test us and promised to fight against the world for the two of us.`,
      photos: [
        { label: "New Year's Eve 2023 🎆", hint: "Add a screenshot or photo from Dec 31, 2023", src: "/images/chapter3_1.jpg" },
        { label: "Late Night Chats 📱", hint: "Add a cute chat screenshot or photo", src: "/images/chapter3_2.jpg" },
        { label: "Promising Each Other 🤝", hint: "Add a picture of hands holding or a cute moment", src: "/images/chapter3_3.jpg" }
      ]
    },
    {
      chapter: "Chapter 04",
      date: "First Year • Highrise, Shosho's & New Mongoose",
      title: "Taking Care of Us, Chips, Smokies & Good Beans 🍲",
      subtitle: "Highrise walks, Mwihoko searches & domestic bliss",
      content: `Luckily, our universities were close! First year was lovely. I couldn't wait to travel to see you every single weekend. I remember our naughty video calls when my roommate was out hahahahaha! 

Then came the day you decided I shouldn't wash my own clothes anymore and told me to bring them over to you. That was so sweet—thinking about it makes me realize it made me a bit lazy! First year was the absolute best. We ate so well and got fat together! I loved the chips you made, the smokies, chapatis, and your beans. You're the one who taught me how to cook good beans. I remember walking the streets of Highrise proud, holding your hand, and going to that mini-mart where everything was overpriced hahahaha. You took such good care of me.

When AMREF moved closer to KU, I heard rumors and walked all the way to Mwihoko trying to find your new campus in the Northlands area. Then I found you a house in Shosho's compound. During long holidays, I couldn't stand being away from you—I even disobeyed my parents and traveled to see you anyway! I took you every morning to board the bus for clinicals, we went for morning runs, exercised together, and shared intimate, passionate moments. 

Later, after the fracas with Shosho over our deposit, we moved to New Mongoose, where we've stayed ever since. You kept taking care of us both. I got comfortable... too comfortable, and I started slipping.`,
      photos: [
        { label: "Highrise Street Walks 👫", hint: "Add a photo holding hands or walking together", src: "/images/chapter4_1.jpg" },
        { label: "Your Cooking / Beans & Chips 🍳", hint: "Add a picture of food she cooked for you", src: "/images/chapter4_2.jpg" },
        { label: "New Mongoose Home 🏠", hint: "Add a picture of your house/room together", src: "/images/chapter4_3.jpg" }
      ]
    },
    {
      chapter: "Chapter 05",
      date: "The Rough Patches & The Turning Point",
      title: "Owning The Pain, Sincere Remorse & Becoming A Man 🛡️",
      subtitle: "Rebuilding character with strict daily principles",
      content: `First year was lovely, but during our second year, I started slipping. I flirted with ladies, got sent nudes, and slept with another lady. I did all these things that broke your heart and hurt you deeply. Every time, I said sorry and I truly was, promising never to do it again—yet I found myself falling into it until things got out of hand. 

I knew I had to sit down and find myself where I had lost myself. I did the work, and I am still doing the work today. You made me a man—a man who now lives by firm principles:

1. Always wait 10 seconds before making any decision.
2. Always ask: "If she were standing right beside me, would I say or do this thing this way?"
3. Never make any decision while my heart is racing; always decide with a clear mind.

I employ all these rules daily. I have my daily commitment notebook that I read every morning before leaving home and carry with me all day. I let God guide my life. I have cried over my poor choices, and I promised myself I will never cry again over something careless I did.`,
      photos: [
        { label: "My Daily Rules Notebook 📓", hint: "Add a photo of your commitment notebook", src: "/images/chapter5_1.jpg" },
        { label: "Growth & Reflection 🌿", hint: "Add a photo representing your journey", src: "/images/chapter5_2.jpg" },
        { label: "A New Foundation ⚓", hint: "Add a photo symbolizing strength and commitment", src: "/images/chapter5_3.jpg" }
      ]
    },
    {
      chapter: "Chapter 06",
      date: "Looking Forward",
      title: "Transparency, Healing & Replacing Pain With Joy 💖",
      subtitle: "Why our connection never lets go",
      content: `If you give me one last chance, I will be completely transparent down to every last detail. Nothing will ever be blurry or a mystery to you again. I know these might feel like words to you, but I know you see the deep work I have done. 

The pain I caused you is real and tangible. You are scared and trying to protect your heart because your fear feels bigger than my words. But we have tried this breakup thing, and it doesn't work for us. Our love is so strong that it keeps pulling us back together no matter how hard we try.

I want to show you the permanent difference in this new man who will always listen to you. It's you I will forever want, and only you I can make happy. We will go out together, make sweet new memories, and let the old pain fade away.`,
      photos: [
        { label: "New Date Nights Planned 🎟️", hint: "Add a photo of a fun place you want to take her", src: "/images/chapter6_1.jpg" },
        { label: "Laughing Together 😊", hint: "Add a favorite happy photo of you two", src: "/images/chapter6_2.jpg" },
        { label: "Our Future Together 🌅", hint: "Add a dream destination photo", src: "/images/chapter6_3.jpg" }
      ]
    },
    {
      chapter: "Chapter 07",
      date: "My Lifetime Vow",
      title: "Building Our Forever Legacy 💍",
      subtitle: "Making you the happiest woman in the world",
      content: `All I want is to marry you and make you the happiest lady in the world. It is you, and only you, that I want to build a life with, protect, and love until the end of time.`,
      photos: [
        { label: "The Ring / Promise 💍", hint: "Add a picture representing marriage & commitment", src: "/images/chapter7_1.jpg" },
        { label: "Our Dream Home 🏡", hint: "Add a picture of a cozy dream future", src: "/images/chapter7_2.jpg" },
        { label: "Forever Us ♾️", hint: "Add your absolute favorite picture together", src: "/images/chapter7_3.jpg" }
      ]
    }
  ];

  const littleThings = [
    'The way you take care of the people you love.',
    'The way you make ordinary days memorable.',
    "That look you give me when you know I'm being ridiculous 😂",
    'Your intelligence and the way you think things through.',
    'Your kindness when nobody is watching.',
    'Your strength when life gets difficult.',
    'The quiet confidence you carry.',
    'How naturally beautiful you are.',
    'How responsible and dependable you are.',
    'Your ambition and the future you are building.',
    'The way you care for the people closest to you.',
    'Your beautiful smile.',
    'Your laugh that I could listen to over and over.',
    'The way your face lights up when you are genuinely happy.',
    'Your beautiful eyes.',
    'The little expressions you make without realizing it.',
    'Your playful side when we are comfortable together.',
    'Your sense of humor.',
    'The way you tease me when I deserve it 😂.',
    'How you make me laugh at myself.',
    'How you make me feel at home.',
    'How you make me feel chosen.',
    'How you make me feel seen.',
    'How you make me feel lucky.',
    'How you make me feel safe enough to be myself.',
    'The warmth of being close to you.',
    'How you hold my hand.',
    'The comfort of sitting beside you without saying anything.',
    'The way you listen when I really need to be heard.',
    'The way you notice when something is wrong with me.',
    'How you remember details I thought you had forgotten.',
    'The way you notice little things about the people you love.',
    'How thoughtful you are with the people you love.',
    'How you show love through practical little actions.',
    'The way you care through actions, not only words.',
    'How you can turn a simple meal into a memory.',
    'Those beans you taught me to love 😂.',
    'The way you make a home feel like home.',
    'Your neatness and the way you like things to feel right.',
    'How you can be both soft and incredibly strong.',
    'Your resilience.',
    'Your courage to keep going after hard days.',
    'The way you keep learning and growing.',
    'How you stay grounded when everything around you feels noisy.',
    'How seriously you take the people and things that matter to you.',
    'The way you protect your peace.',
    'How fiercely you stand up for what you believe is right.',
    'How you challenge me to think differently.',
    'The way you make me want to become a better man.',
    'How you make me want to keep my promises.',
    'The way you remind me that love is also a choice.',
    'How you make the future feel worth fighting for.',
    'The way you make our future plans feel exciting.',
    'The way you make me believe our best memories are still ahead.',
    'How you inspire me to think about the man I want to become.',
    'The memories we have built from almost nothing.',
    'The fact that our story started when we were still so young.',
    'That first kiss and everything it meant to me.',
    'The way our story somehow kept finding its way back to us.',
    'How much history is hidden inside the smallest memories.',
    'The nights we stayed up talking.',
    'How naturally our conversations can become hours long.',
    'The silly things only the two of us understand.',
    'The way you can make me forget the rest of the world for a while.',
    'How proud I feel when I walk beside you.',
    'How you make even boring errands feel like dates.',
    'How you make a simple walk feel special.',
    'The excitement I feel when I know I am about to see you.',
    'How you make ordinary weekends feel like something to look forward to.',
    'How you make celebrations feel more meaningful.',
    'The way you remember our little traditions.',
    'How much personality you bring into every room.',
    'The way you look at me when we share a private joke.',
    'The way you make me miss you when you are not around.',
    'Your ability to make a place feel warmer just by being there.',
    'Your ability to turn chaos into something manageable.',
    'The way you care about doing things properly.',
    'Your patience with the people you love.',
    'The way you celebrate the people you care about.',
    'Your ability to forgive when your heart is ready.',
    'Your honesty, even when the truth is uncomfortable.',
    'The way you can be gentle without ever being weak.',
    'How you make love feel like friendship, laughter, care, and home.',
    'The way you make simple moments feel important.',
    'How you make me want to protect what we have.',
    'How proud I am of the woman you are becoming.',
    'The way you make a difficult day feel lighter.',
    'How you can make me smile without even trying.',
    'The way you can be stubborn about things that matter—and somehow make me smile.',
    'How you make me want to choose patience.',
    'How you make me appreciate the little things.',
    'How you make me want to build instead of destroy.',
    'How you make commitment feel meaningful.',
    'How you make memories feel worth preserving.',
    'How you make me want to create new memories instead of living only in old ones.',
    'Because after everything, my heart still knows why it chooses you.',
    'Because there is nobody else I would rather build my future with.',
    'Because every chapter with you has left me with something beautiful.',
    'Because you are the person I want beside me when life gets beautiful, messy, exciting, and ordinary.',
    'Because choosing you is still my favorite choice.',
  ];

  return (
    <div className="min-h-screen bg-pink-50/60 text-slate-800 relative overflow-hidden font-sans pb-28 selection:bg-pink-300 selection:text-pink-900">
      {/* Page-wide visual effects */}
      <style>{`
        @keyframes petalFall {
          0% { transform: translate3d(0, -40px, 0) rotate(var(--petal-rotation)); opacity: 0; }
          10% { opacity: 0.72; }
          45% { transform: translate3d(var(--petal-drift), 48vh, 0) rotate(calc(var(--petal-rotation) + 180deg)); opacity: 0.62; }
          100% { transform: translate3d(calc(var(--petal-drift) * -0.7), 112vh, 0) rotate(calc(var(--petal-rotation) + 360deg)); opacity: 0; }
        }
        @keyframes heartFloat {
          0% { transform: translate3d(0, 0, 0) scale(0.75); opacity: 0; }
          15% { opacity: 0.55; }
          50% { transform: translate3d(18px, -50vh, 0) scale(1); opacity: 0.45; }
          100% { transform: translate3d(-18px, -110vh, 0) scale(0.7); opacity: 0; }
        }
        @keyframes letterReveal {
          0% { opacity: 0; transform: translateY(12px) scale(0.98); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes flowerEnvelopeFloat { 0%, 100% { transform: translateY(0) rotate(-1deg); } 50% { transform: translateY(-7px) rotate(1deg); } }
        @keyframes envelopeFlapOpen { 0%, 35% { transform: rotateX(0deg); } 62% { transform: rotateX(155deg); } 100% { transform: rotateX(180deg); } }
        @keyframes envelopeLetterRise { 0%, 28% { transform: translateY(38px) scale(0.96); opacity: 0; } 60% { opacity: 1; } 100% { transform: translateY(-48px) scale(1); opacity: 1; } }
        @keyframes flowerBloom { 0% { transform: scale(0.35) rotate(-20deg); opacity: 0; } 45% { opacity: 1; } 100% { transform: scale(1) rotate(0deg); opacity: 1; } }
        @keyframes envelopeSparkle { 0%, 100% { transform: scale(0.7) translateY(0); opacity: 0.35; } 50% { transform: scale(1.15) translateY(-7px); opacity: 1; } }
        .animate-flowerEnvelopeFloat { animation: flowerEnvelopeFloat 2.2s ease-in-out infinite; }
        .animate-envelopeFlapOpen { transform-origin: top center; animation: envelopeFlapOpen 3s cubic-bezier(0.22, 1, 0.36, 1) forwards; backface-visibility: hidden; }
        .animate-envelopeLetterRise { animation: envelopeLetterRise 3s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
        .animate-flowerBloom { animation: flowerBloom 1.8s cubic-bezier(0.22, 1, 0.36, 1) both; }
        .animate-envelopeSparkle { animation: envelopeSparkle 1.6s ease-in-out infinite; }
        @keyframes photoIn {
          0% { opacity: 0; transform: scale(0.92); }
          100% { opacity: 1; transform: scale(1); }
        }
        .romantic-reveal { animation: letterReveal 0.65s ease-out both; }
        .photo-lightbox-image { animation: photoIn 0.3s ease-out both; }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            scroll-behavior: auto !important;
          }
        }
      `}</style>
      <FallingPetals />
      <FloatingHearts />

      
      {/* Decorative Cute Floating Elements Background */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-pink-200/40 blur-[120px] rounded-full pointer-events-none animate-pulse" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-200/40 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-[500px] h-[500px] bg-rose-200/30 blur-[140px] rounded-full pointer-events-none" />

      {/* Floating Sparkle Icons */}
      <div className="absolute top-12 left-10 text-pink-300 animate-bounce delay-100 hidden md:block">✨</div>
      <div className="absolute top-24 right-12 text-purple-300 animate-pulse delay-300 hidden md:block">🌸</div>
      <div className="absolute top-1/2 left-6 text-rose-300 animate-bounce delay-500 hidden md:block">💖</div>

      {/* Hero Header */}
      <header className="relative z-10 max-w-4xl mx-auto px-6 pt-16 pb-12 text-center">
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-pink-100/80 border border-pink-300 text-pink-600 text-xs font-bold tracking-wider uppercase mb-6 shadow-sm backdrop-blur-md">
          <Sparkles size={14} className="text-pink-500 animate-spin" />
          <span>Almost 3 Years • Our Entire Journey • 🐰 🌸 🎀</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-pink-500 via-rose-400 to-purple-600 bg-clip-text text-transparent mb-6 leading-tight">
          It’s Complicated, But Choosing You Is Easy.
        </h1>

        <p className="text-slate-600 text-base md:text-lg max-w-2xl mx-auto leading-relaxed font-normal">
          Through every storm, every lesson, and every victory—this site is a reminder of who you are to me, where we’ve been, and the future I am committed to giving us. 🎀
        </p>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-6 space-y-16">

        {/* SECTION 1: Interactive & Expandable Story Chapters */}
        <section className="space-y-8 relative">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold tracking-widest text-pink-500 uppercase bg-pink-100 px-3 py-1 rounded-full">Our Storybook</span>
            <h2 className="text-3xl font-extrabold text-slate-800 flex items-center justify-center gap-2">
              <BookOpen className="text-pink-500" size={28} /> Memory Chapters
            </h2>
            <p className="text-slate-500 text-sm">Click any chapter to expand or minimize our memories 📖✨</p>
          </div>

          <div className="relative space-y-6">
            {/* Soft scrapbook timeline running behind the chapter cards */}
            <div
              className="hidden md:block absolute left-[-18px] top-5 bottom-5 w-px bg-gradient-to-b from-transparent via-pink-300/60 to-transparent"
              aria-hidden="true"
            />
            {storyChapters.map((story, idx) => {
              const isOpen = expandedChapters[idx];
              return (
                <div 
                  key={idx} 
                  className="rounded-3xl bg-white/80 border border-pink-200/80 backdrop-blur-md shadow-lg shadow-pink-500/5 overflow-hidden transition-all duration-500 hover:border-pink-300 hover:shadow-xl hover:shadow-pink-500/10 relative group/chapter"
                >
                  <div
                    className="hidden md:flex absolute -left-[25px] top-8 w-3.5 h-3.5 rounded-full bg-white border-2 border-pink-300 shadow-sm items-center justify-center"
                    aria-hidden="true"
                  >
                    <span className="w-1 h-1 rounded-full bg-pink-400" />
                  </div>
                  <DecorativeCorner position={idx % 2 === 0 ? "top-right" : "top-left"} />

                  {/* Chapter Header Bar (Clickable) */}
                  <button 
                    onClick={() => toggleChapter(idx)}
                    className="relative z-10 w-full p-6 text-left flex items-center justify-between gap-4 bg-gradient-to-r from-pink-50/50 via-white to-purple-50/30 hover:bg-pink-100/40 transition-colors"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-extrabold text-pink-600 uppercase tracking-widest bg-pink-100 px-3 py-1 rounded-full border border-pink-200">
                          {story.chapter}
                        </span>
                        <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                          <Calendar size={12} /> {story.date}
                        </span>
                      </div>
                      <h3 className="text-xl md:text-2xl font-bold text-slate-800 pt-1">{story.title}</h3>
                      <p className="text-xs text-pink-500 italic font-medium">{story.subtitle}</p>
                    </div>

                    <div className="w-10 h-10 rounded-2xl bg-pink-100/60 border border-pink-200 flex items-center justify-center text-pink-600 shrink-0">
                      {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                  </button>

                  {/* Expandable Story Content & Photo Display / Placeholders */}
                  {isOpen && (
                    <div className="relative z-10 p-6 md:p-8 pt-2 border-t border-pink-100 space-y-6 animate-fadeIn">
                      <p className="text-slate-700 text-sm md:text-base leading-relaxed font-normal whitespace-pre-line bg-pink-50/30 p-6 rounded-2xl border border-pink-100/50">
                        {story.content}
                      </p>

                      {/* 3 Photo Placeholders per Chapter with Automatic Image Rendering */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-extrabold text-pink-500 uppercase tracking-wider flex items-center gap-1.5">
                          <ImageIcon size={14} /> Chapter Gallery (3 Memory Photos)
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {story.photos.map((photo, pIdx) => (
                            <button
                              type="button"
                              key={pIdx}
                              onClick={() => setSelectedImage(photo)}
                              className="group relative h-48 w-full rounded-2xl border-2 border-dashed border-pink-300/80 bg-pink-50/50 hover:bg-pink-100/50 transition-all flex flex-col items-center justify-center text-center overflow-hidden shadow-inner cursor-zoom-in focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2"
                              aria-label={`Open ${photo.label}`}
                            >
                              <img 
                                src={resolveImageSrc(photo.src)} 
                                alt={photo.label}
                                onError={(e) => {
                                  // Fallback to placeholder if image file is not found in public/images folder
                                  e.currentTarget.style.display = 'none';
                                  if (e.currentTarget.nextElementSibling) {
                                    e.currentTarget.nextElementSibling.style.display = 'flex';
                                  }
                                }}
                                className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-300"
                              />
                              
                              {/* Fallback UI when photo is missing */}
                              <div className="hidden p-4 flex-col items-center justify-center h-full w-full">
                                <div className="w-10 h-10 rounded-full bg-white border border-pink-200 flex items-center justify-center text-pink-400 mb-2 group-hover:scale-110 transition-transform shadow-sm">
                                  <ImageIcon size={20} />
                                </div>
                                <span className="text-xs font-bold text-slate-700">{photo.label}</span>
                                <span className="text-[10px] text-pink-400 mt-1">{photo.hint}</span>
                              </div>
                              <div className="absolute inset-0 bg-gradient-to-t from-pink-900/45 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-3 pointer-events-none">
                                <span className="text-white text-[10px] font-bold drop-shadow-md">View memory</span>
                                <Maximize2 size={15} className="text-white drop-shadow-md" />
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* SECTION 2: The 3 Rules & Character Work */}
        <section className="p-8 md:p-10 rounded-3xl bg-gradient-to-br from-white via-pink-50/80 to-purple-50/50 border border-pink-200 shadow-xl space-y-6 relative overflow-hidden group">
          <DecorativeCorner position="bottom-left" />
          <div className="absolute -right-8 -bottom-8 text-pink-100 pointer-events-none">
            <ShieldCheck size={180} />
          </div>

          <div className="flex items-center gap-3 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-pink-100 border border-pink-300 flex items-center justify-center text-pink-600 shadow-sm">
              <ShieldCheck size={26} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-800">The 3 Daily Rules That Guide Me</h3>
              <p className="text-xs text-pink-500 font-medium">How I hold myself accountable to protect you forever 🌸</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 relative z-10">
            <div className="p-5 rounded-2xl bg-white border border-pink-200 space-y-2 shadow-sm hover:shadow-md transition-shadow">
              <span className="text-2xl font-black text-pink-500">01</span>
              <h4 className="text-sm font-bold text-slate-800">The 10-Second Pause</h4>
              <p className="text-xs text-slate-600 leading-relaxed">Always wait ten full seconds before making any decision.</p>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-pink-200 space-y-2 shadow-sm hover:shadow-md transition-shadow">
              <span className="text-2xl font-black text-purple-500">02</span>
              <h4 className="text-sm font-bold text-slate-800">The Presence Test</h4>
              <p className="text-xs text-slate-600 leading-relaxed">Ask: "If she were standing right beside me, would I say or do this thing this way?"</p>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-pink-200 space-y-2 shadow-sm hover:shadow-md transition-shadow">
              <span className="text-2xl font-black text-rose-500">03</span>
              <h4 className="text-sm font-bold text-slate-800">Clear-Mind Decisiveness</h4>
              <p className="text-xs text-slate-600 leading-relaxed">Never make choices while my heart is racing—always make decisions with a calm, clear mind.</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-pink-100/60 border border-pink-200 text-xs text-pink-800 flex items-center gap-2 relative z-10">
            <Star size={16} className="text-pink-500 shrink-0" />
            <span>I read my daily commitments every morning before leaving home and carry my notebook everywhere I go.</span>
          </div>
        </section>

        {/* SECTION 3: The Neuroscience of Healing Painful Memories */}
        <section className="p-8 md:p-10 rounded-3xl bg-white border border-purple-200 shadow-xl space-y-4 text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-100 text-purple-700 text-xs font-bold">
            🧠 💕 The Science of Healing & Rebuilding
          </div>
          <h3 className="text-2xl font-bold text-slate-800">How Hearts & Minds Overcome Pain</h3>
          <p className="text-slate-600 text-sm md:text-base max-w-2xl mx-auto leading-relaxed font-normal">
            Neuroscience shows that the human brain possesses <strong>neuroplasticity</strong>—the ability to rewire emotional pathways. When a painful memory is repeatedly replaced by consistent safety, radical transparency, deep warmth, and joyful new experiences, the brain reconsolidates the memory. Over time, the old pain loses its sharp emotional charge and fades, giving way to peace, safety, and trust.
          </p>
        </section>

        {/* SECTION 4: 100 Little Things I Love About You */}
        <section className="space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold tracking-widest text-pink-500 uppercase bg-pink-100 px-3 py-1 rounded-full">Why I Choose You</span>
            <h2 className="text-3xl font-extrabold text-slate-800 flex items-center justify-center gap-2"><span>🌷</span> 100 Little Things I Love About You</h2>
            <p className="text-slate-500 text-sm">One little reason at a time, because four qualities could never be enough. 💜</p>
          </div>
          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-white via-purple-50/70 to-pink-50 border border-purple-200 shadow-xl p-6 md:p-10">
            <DecorativeCorner position="top-left" /><DecorativeCorner position="top-right" /><DecorativeCorner position="bottom-left" /><DecorativeCorner position="bottom-right" />
            <div className="relative z-10 max-w-2xl mx-auto text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-purple-100 border border-purple-200 flex items-center justify-center text-2xl shadow-sm mb-5">💜</div>
              <div key={reasonIndex} className="min-h-[190px] flex flex-col items-center justify-center romantic-reveal">
                <span className="text-sm font-black tracking-[0.25em] uppercase text-purple-500">#{reasonIndex + 1}</span>
                <div className="w-12 h-px bg-gradient-to-r from-transparent via-pink-300 to-transparent my-5" />
                <p className="text-xl md:text-2xl font-bold leading-relaxed text-slate-800">{littleThings[reasonIndex]}</p>
              </div>
              <div className="flex items-center justify-center gap-3 mt-5">
                <button type="button" onClick={() => setReasonIndex((prev) => (prev - 1 + littleThings.length) % littleThings.length)} className="px-4 py-2.5 rounded-full border border-purple-200 bg-white/80 text-purple-600 text-sm font-bold hover:bg-purple-50 transition-all focus:outline-none focus:ring-2 focus:ring-purple-400" aria-label="Show previous reason">Previous</button>
                <span className="px-4 py-2.5 rounded-full bg-purple-100/80 border border-purple-200 text-purple-600 text-xs font-extrabold">{reasonIndex + 1} / {littleThings.length}</span>
                <button type="button" onClick={() => setReasonIndex((prev) => (prev + 1) % littleThings.length)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-pink-400 to-purple-500 text-white text-sm font-bold hover:from-pink-500 hover:to-purple-600 hover:scale-[1.02] transition-all shadow-md shadow-purple-500/20 focus:outline-none focus:ring-2 focus:ring-purple-400" aria-label="Show next reason">Next <ArrowRight size={15} /></button>
              </div>
              <div className="mt-6">
                <div className="h-1.5 rounded-full bg-purple-100 overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-pink-400 to-purple-500 transition-all duration-500" style={{ width: `${((reasonIndex + 1) / littleThings.length) * 100}%` }} /></div>
                <p className="text-[11px] text-slate-400 mt-3">Keep going — there are 100 reasons waiting for you. 🌸</p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 5: Secret Lockable Love Letter */}
        <section className="p-8 md:p-12 rounded-3xl bg-gradient-to-br from-pink-100 via-white to-purple-100 border border-pink-300 shadow-2xl text-center space-y-6 relative overflow-hidden">
          <DecorativeCorner position="top-left" />
          <DecorativeCorner position="bottom-right" />
          <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
            <div
              className={`absolute inset-0 rounded-full bg-pink-200/40 blur-xl ${
                letterOpening ? "animate-pulse" : ""
              }`}
            />
            <div
              className={`relative w-16 h-16 rounded-2xl bg-white border border-pink-300 flex items-center justify-center text-pink-500 shadow-md transition-all duration-500 ${
                letterOpening ? "scale-110 shadow-pink-300/60" : ""
              }`}
            >
              {unlocked ? <Heart size={28} className="fill-pink-400" /> : <Lock size={28} />}
            </div>
          </div>

          {letterOpening ? (
            <div className="max-w-md mx-auto py-2 animate-letterReveal">
              <div className="relative mx-auto w-64 h-48 sm:w-72 sm:h-52">
                <span className="absolute -top-2 left-4 text-3xl animate-flowerBloom">🌸</span>
                <span className="absolute top-5 right-1 text-3xl animate-flowerBloom" style={{ animationDelay: "0.25s" }}>🌷</span>
                <span className="absolute bottom-1 left-0 text-2xl animate-flowerBloom" style={{ animationDelay: "0.5s" }}>🌺</span>
                <span className="absolute bottom-0 right-2 text-2xl animate-flowerBloom" style={{ animationDelay: "0.75s" }}>💜</span>
                <span className="absolute top-0 left-1/2 text-lg animate-envelopeSparkle">✨</span>
                <span className="absolute top-10 left-[-8px] text-sm animate-envelopeSparkle" style={{ animationDelay: "0.4s" }}>✦</span>
                <span className="absolute top-14 right-[-4px] text-sm animate-envelopeSparkle" style={{ animationDelay: "0.8s" }}>✦</span>
                <div className="absolute inset-x-2 bottom-3 top-14 rounded-[1.4rem] bg-gradient-to-br from-purple-300 via-fuchsia-300 to-pink-300 shadow-2xl shadow-purple-500/25 overflow-visible animate-flowerEnvelopeFloat">
                  <div className="absolute inset-0 rounded-[1.4rem] bg-gradient-to-br from-purple-300 via-fuchsia-300 to-pink-300" />
                  <div className="absolute inset-x-0 bottom-0 h-[58%] rounded-b-[1.4rem] bg-gradient-to-t from-purple-500/35 to-transparent" />
                  <div className="absolute left-8 right-8 top-[-24px] h-32 rounded-xl bg-white border border-purple-200 shadow-lg flex items-center justify-center animate-envelopeLetterRise">
                    <div className="text-center"><Sparkles size={17} className="mx-auto text-purple-400 mb-1" /><p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-purple-500">A Message For You</p></div>
                  </div>
                  <div className="absolute inset-x-0 top-0 h-[70%] bg-gradient-to-br from-purple-200 via-fuchsia-200 to-pink-200 [clip-path:polygon(0_0,100%_0,50%_100%)] animate-envelopeFlapOpen" />
                  <div className="absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-br from-pink-300/80 via-fuchsia-300/70 to-purple-400/70 [clip-path:polygon(0_100%,50%_0,100%_100%)]" />
                  <div className="absolute left-1/2 bottom-[-20px] -translate-x-1/2 w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-500 border-4 border-white/80 flex items-center justify-center shadow-lg shadow-purple-500/30 z-20 animate-pulse"><span className="text-2xl">🌷</span></div>
                  <span className="absolute -left-3 top-10 text-lg animate-envelopeSparkle">🌸</span>
                  <span className="absolute -right-3 bottom-10 text-lg animate-envelopeSparkle" style={{ animationDelay: "0.7s" }}>🌸</span>
                </div>
              </div>
              <h2 className="text-2xl font-extrabold text-slate-800 mt-4">Opening your letter... 💌</h2>
              <p className="text-sm text-purple-500 font-medium mt-1">Let the flowers open the way to my heart ✨</p>
            </div>
          ) : !unlocked ? (
            <div className="space-y-4 max-w-md mx-auto">
              <h2 className="text-2xl font-extrabold text-slate-800">A Secret Letter For You 💌</h2>
              <p className="text-slate-600 text-sm">
                Enter our special date to unlock my heart's message. <br/>
                <span className="text-xs text-pink-500 font-semibold">(Hint: Try <code className="bg-white px-2 py-0.5 rounded text-pink-600 border border-pink-200">12312023</code> or <code className="bg-white px-2 py-0.5 rounded text-pink-600 border border-pink-200">love</code>)</span>
              </p>

              <form onSubmit={handleUnlock} className="flex gap-2">
                <input 
                  type="password" 
                  placeholder="Enter secret code..." 
                  value={passcode} 
                  onChange={(e) => setPasscode(e.target.value)}
                  className="flex-1 bg-white border border-pink-300 rounded-2xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-pink-500 shadow-inner"
                />
                <button 
                  type="submit"
                  className="bg-gradient-to-r from-pink-400 to-rose-500 hover:from-pink-500 hover:to-rose-600 hover:scale-[1.02] active:scale-[0.98] text-white font-bold px-6 py-3 rounded-2xl text-sm transition-all shadow-md shadow-pink-500/20"
                >
                  Unlock 💖
                </button>
              </form>
              {error && <p className="text-xs text-rose-500 font-bold animate-bounce">Oops! Try again my love 🎀</p>}
            </div>
          ) : (
            <div className="space-y-6 text-left max-w-2xl mx-auto romantic-reveal">
              <span className="text-xs font-bold text-pink-600 uppercase tracking-widest block text-center">My Forever Vow</span>
              <h3 className="text-2xl font-extrabold text-slate-800 text-center">I Am All In For Us 💍</h3>
              <p className="text-slate-700 leading-relaxed text-sm md:text-base font-normal">
                If you give me this last chance, I will be completely transparent with you down to every last detail. Nothing will ever seem blurry or a mystery to you again. I know that to you these might feel like words, but I know you also see the deep work I have done and am doing every day.
              </p>
              <p className="text-slate-700 leading-relaxed text-sm md:text-base font-normal">
                Our love is so strong that it keeps pulling us back together. All I want is to marry you, make you happy, take you out on wonderful dates, and create beautiful new memories so that old pain fades completely. It is you and only you that I want to do this for.
              </p>
              <div className="pt-6 border-t border-pink-200 flex items-center justify-between text-xs text-pink-600 font-bold italic">
                <span>Forever Yours,</span>
                <span>Your Partner 🌹</span>
              </div>
            </div>
          )}
        </section>

        {/* SECTION 6: Preserved Memory Vault & 100 Photo Gallery */}
        <section className="space-y-8 pt-6">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <span className="text-xs font-bold tracking-widest text-pink-500 uppercase bg-pink-100 px-3 py-1 rounded-full">
              Preserved Memories Vault 🖼️
            </span>
            <p className="text-slate-700 text-base md:text-lg font-medium leading-relaxed bg-pink-100/50 p-6 rounded-3xl border border-pink-200/60 shadow-sm">
              "I know that during these times we have deleted a lot of pictures that showed our memories together but I found these. I will preserve them here"
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {preservedGallery.map((item) => (
              <button
                type="button"
                key={item.id}
                onClick={() => setSelectedImage(item)}
                className="group relative h-40 w-full rounded-2xl border-2 border-dashed border-pink-300/80 bg-pink-50/50 hover:bg-pink-100/50 hover:-translate-y-1 hover:shadow-lg hover:shadow-pink-500/10 transition-all flex flex-col items-center justify-center text-center overflow-hidden shadow-sm cursor-zoom-in focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2"
                aria-label={`Open ${item.label}`}
              >
                <img 
                  src={resolveImageSrc(item.src)} 
                  alt={item.label}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    if (e.currentTarget.nextElementSibling) {
                      e.currentTarget.nextElementSibling.style.display = 'flex';
                    }
                  }}
                  className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* Fallback placeholder card when image is missing */}
                <div className="hidden p-3 flex-col items-center justify-center h-full w-full">
                  <div className="w-8 h-8 rounded-full bg-white border border-pink-200 flex items-center justify-center text-pink-400 mb-1 group-hover:scale-110 transition-transform shadow-sm">
                    <ImageIcon size={16} />
                  </div>
                  <span className="text-[11px] font-bold text-slate-700 line-clamp-1">{item.label}</span>
                  <span className="text-[9px] text-pink-400 mt-0.5">/public{item.src}</span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-pink-900/45 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-2 pointer-events-none">
                  <span className="text-white text-[9px] font-bold drop-shadow-md">Open memory</span>
                  <Maximize2 size={13} className="text-white drop-shadow-md" />
                </div>
              </button>
            ))}
          </div>
        </section>

      </main>

      {/* Optional romantic ambience. Add /public/audio/our-song.mp3 to enable it. */}
      <audio
        ref={audioRef}
        src="/audio/our-song.mp3"
        loop
        preload="none"
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
      ></audio>

      <button
        type="button"
        onClick={toggleMusic}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-white/90 backdrop-blur-md border border-pink-200 px-4 py-3 text-xs font-bold text-pink-600 shadow-xl shadow-pink-500/10 hover:bg-pink-50 hover:-translate-y-0.5 transition-all focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2"
        aria-label={isPlaying ? "Pause our song" : "Play our song"}
        title={isPlaying ? "Pause our song" : "Play our song"}
      >
        {isPlaying ? <Pause size={15} /> : <Music2 size={15} />}
        <span className="hidden sm:inline">{isPlaying ? "Our Song" : "Play Our Song"}</span>
      </button>

      {/* Full-screen photo lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 md:p-8"
          role="dialog"
          aria-modal="true"
          aria-label={selectedImage.label}
          onClick={() => setSelectedImage(null)}
        >
          <button
            type="button"
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 md:top-6 md:right-6 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Close photo viewer"
          >
            <X size={22} />
          </button>

          <div
            className="relative w-full max-w-5xl flex flex-col items-center"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="relative max-h-[78vh] max-w-full rounded-3xl overflow-hidden border border-white/20 shadow-2xl bg-black/20">
              <img
                src={resolveImageSrc(selectedImage.src)}
                alt={selectedImage.label}
                className="photo-lightbox-image max-h-[78vh] max-w-full w-auto object-contain"
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                  const fallback = event.currentTarget.nextElementSibling;
                  if (fallback) fallback.style.display = "flex";
                }}
              />

              <div className="hidden min-h-[300px] min-w-[280px] md:min-w-[500px] p-10 flex-col items-center justify-center text-center text-white">
                <ImageIcon size={44} className="text-pink-300 mb-4" />
                <p className="font-bold">{selectedImage.label}</p>
                <p className="text-sm text-white/60 mt-2">
                  Add the image to the public/images folder to display it here.
                </p>
              </div>
            </div>

            <div className="mt-4 px-5 py-3 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md text-center max-w-xl">
              <p className="text-white font-bold text-sm">{selectedImage.label}</p>
              {selectedImage.hint && (
                <p className="text-white/60 text-xs mt-1">{selectedImage.hint}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="relative z-10 text-center pt-16 text-xs text-slate-400 flex items-center justify-center gap-2">
        <span>Made with endless love, commitment, and care for you</span>
        <Heart size={14} className="fill-pink-500 text-pink-500 animate-pulse" />
        <span>• {new Date().getFullYear()}</span>
      </footer>
    </div>
  );
}