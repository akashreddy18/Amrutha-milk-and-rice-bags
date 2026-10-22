/**
 * AMRUTHA - INTERNATIONALIZATION & LANGUAGE SWITCHER (i18n.js)
 * 
 * Provides clean, standalone English, Telugu (తెలుగు), and Hindi (हिन्दी) translations.
 * Removes multi-language clutter and parentheses.
 * Persists user preference via localStorage ('amrutha_lang').
 */

const AmruthaI18n = (function () {
  const STORAGE_KEY = 'amrutha_lang';
  const DEFAULT_LANG = 'en';

  const TRANSLATIONS = {
    // English (Default)
    en: {
      topWelcome: "Pure Farm Fresh Dairy & Premium Aged Rice Bags",
      langLabel: "Language:",
      brandName: "AMRUTHA",
      tagline: "Pure Quality, Every Day.",
      shortDescription: "Your trusted household partner for 100% farm-fresh milk and top-grade aged rice bags.",
      btnExploreMilk: "Explore Milk",
      btnExploreRice: "Explore Rice",
      btnContactUs: "Contact Us",
      btnSubscriptions: "Subscriptions",
      btnAdmin: "Admin",
      btnCart: "Cart",
      
      // Quotes & badges
      quoteText: "Pure food is the sacred foundation of a healthy, joyful home. From the early morning dew on our green pastures to the golden harvest of aged paddy, every drop of Amrutha milk and every grain of Amrutha rice carries our uncompromised promise of farm-fresh purity, honesty, and wholesome nutrition.",
      quoteSubtitle: "Healthy Living Begins With Pure Nourishment",
      quoteAuthor: "— The Amrutha Family Promise",
      
      // Homepage Milk Section
      milkBadge: "Daily Fresh Dairy",
      milkSectionTitle: "AMRUTHA FRESH MILK",
      milkSectionSubtitle: "Farm-fresh whole cow milk, rich buffalo milk, natural set curd, desi bilona ghee, and soft fresh paneer.",
      milkSectionCta: "Order Fresh Milk / Daily Subscription",
      
      // Homepage Rice Section
      riceBadge: "Finest Aged Paddy",
      riceSectionTitle: "AMRUTHA PREMIUM RICE",
      riceSectionSubtitle: "Top quality Sona Masoori, Deluxe BPT, Royal Basmati, and Wada Kolam in standard bags.",
      riceSectionCta: "Order Rice Bags / Inquire Bulk Rates",
      
      // Contact Section
      contactHeading: "Direct Customer Assistance",
      contactSubtitle: "Reach out to us for daily milk subscriptions, doorstep rice bag delivery, or bulk orders for family functions and caterers.",
      contactPhoneLabel: "Direct Helpline:",
      contactHoursLabel: "Delivery Timings:",
      
      // Generic Actions
      orderNow: "Order Now",
      viewDetails: "View Details",
      addToCart: "Add to Cart",
      samplePriceNotice: "*Sample prices for demonstration",
      
      // Product Names & Badges
      products: {
        'cow-milk': {
          name: "Pure Cow Milk",
          badge: "Daily Fresh",
          unit: "Litre",
          shortDesc: "100% pure farm cow milk. Light, natural calcium, zero water added.",
          subName: "" // No bracketed subtitle in English!
        },
        'buffalo-milk': {
          name: "Pure Buffalo Milk",
          badge: "Thick & Creamy",
          unit: "Litre",
          shortDesc: "Thick natural milk with 7%+ fat for rich malai, tea, and thick dahi.",
          subName: ""
        },
        'fresh-paneer': {
          name: "Fresh Malai Paneer",
          badge: "Farm Fresh",
          unit: "200 g",
          shortDesc: "Soft melt-in-mouth cottage cheese crafted from 100% whole milk.",
          subName: ""
        },
        'pure-ghee': {
          name: "Pure Desi Ghee",
          badge: "Traditional Danedar",
          unit: "250 ml",
          shortDesc: "Golden granular desi ghee churned from pure farm butter.",
          subName: ""
        },
        'sona-masoori': {
          name: "Amrutha Sona Masoori Rice",
          badge: "Aged 12-18 Months",
          unit: "25kg Bag",
          shortDesc: "Medium-slender grain aged 12+ months. Fluffy, aromatic, non-sticky.",
          subName: ""
        },
        'basmati-rice': {
          name: "Amrutha Royal Basmati Rice",
          badge: "Extra Long Grain",
          unit: "25kg Bag",
          shortDesc: "Himalayan aged long grain. Regal aroma for Biryani & Pulao.",
          subName: ""
        },
        'other-varieties': {
          name: "Deluxe BPT & Wada Kolam",
          badge: "Silky & Fragrant",
          unit: "25kg Bag",
          shortDesc: "Premium silky BPT & fragrant Kolam rice for everyday comfort.",
          subName: ""
        }
      }
    },

    // Telugu (తెలుగు)
    te: {
      topWelcome: "100% స్వచ్ఛమైన పాడి ఉత్పత్తులు మరియు నాణ్యమైన పాత బియ్యం",
      langLabel: "భాష:",
      brandName: "అమృత",
      tagline: "స్వచ్ఛమైన నాణ్యత, ప్రతిరోజూ.",
      shortDescription: "ప్రతిరోజూ ఉదయం, సాయంత్రం స్వచ్ఛమైన ఆవు, గేదె పాలు మరియు సహజంగా నిల్వచేసిన బియ్యం మీ ఇంటికే.",
      btnExploreMilk: "పాల ఉత్పత్తులు",
      btnExploreRice: "బియ్యం రకాలు",
      btnContactUs: "సంప్రదించండి",
      btnSubscriptions: "సబ్‌స్క్రిప్షన్లు",
      btnAdmin: "అడ్మిన్",
      btnCart: "కార్ట్",
      
      quoteText: "ఆరోగ్యకరమైన ఆహారమే కుటుంబ సౌభాగ్యానికి మూలాధారం. మా పచ్చని పొలాల నుండి మీ ఇంటి పూజా మందిరం వరకు - ప్రతి చుక్క అమృత పాలు, ప్రతి గింజ అమృత బియ్యం స్వచ్ఛత మరియు నమ్మకానికి ప్రతీక.",
      quoteSubtitle: "ఆరోగ్యకరమైన జీవనం స్వచ్ఛమైన ఆహారంతోనే మొదలవుతుంది",
      quoteAuthor: "— అమృత కుటుంబ వాగ్దానం",
      
      milkBadge: "ప్రతిరోజూ తాజా పాడి",
      milkSectionTitle: "అమృత తాజా పాలు & డైరీ",
      milkSectionSubtitle: "రసాయనాలు కలపని స్వచ్ఛమైన ఆవు పాలు, చిక్కని గేదె పాలు, తాజా మలై పనీర్ మరియు సువాసనగల నెయ్యి.",
      milkSectionCta: "తాజా పాలు ఆర్డర్ / డైలీ సబ్‌స్క్రిప్షన్",
      
      riceBadge: "ఉత్తమ నిల్వచేసిన ధాన్యం",
      riceSectionTitle: "అమృత ప్రీమియం బియ్యం",
      riceSectionSubtitle: "12-18 నెలలు సహజంగా నిల్వచేసిన సోనా మసూరి, డీలక్స్ BPT మరియు రాయల్ బాస్మతి బియ్యం బ్యాగులు.",
      riceSectionCta: "బియ్యం బ్యాగుల ఆర్డర్ / హోల్‌సేల్ ధరలు",
      
      contactHeading: "సహాయం & ఆర్డర్లు",
      contactSubtitle: "రోజువారీ పాల సరఫరా, బియ్యం బ్యాగులు మరియు శుభకార్యాలకు హోల్‌సేల్ ఆర్డర్ల కోసం సంప్రదించండి.",
      contactPhoneLabel: "హెల్ప్‌లైన్ నంబర్:",
      contactHoursLabel: "సరఫరా వేళలు:",
      
      orderNow: "ఆర్డర్ చేయండి",
      viewDetails: "వివరాలు చూడండి",
      addToCart: "కార్ట్‌కు చేర్చండి",
      samplePriceNotice: "*నమూనా ధరలు మాత్రమే",
      
      products: {
        'cow-milk': {
          name: "స్వచ్ఛమైన ఆవు పాలు",
          badge: "ప్రతిరోజూ తాజా",
          unit: "లీటరు",
          shortDesc: "100% స్వచ్ఛమైన ఆవు పాలు. సహజ కాల్షియం, నీరు కలపని సహజ స్వచ్ఛత.",
          subName: "స్వచ్ఛమైన ఆవు పాలు"
        },
        'buffalo-milk': {
          name: "స్వచ్ఛమైన గేదె పాలు",
          badge: "చిక్కని మీగడ (7%+ ఫ్యాట్)",
          unit: "లీటరు",
          shortDesc: "చిక్కని సహజ గేదె పాలు. టీ, కాఫీ, గడ్డ పెరుగు మరియు నెయ్యికి శ్రేష్టం.",
          subName: "స్వచ్ఛమైన గేదె పాలు"
        },
        'fresh-paneer': {
          name: "తాజా మలై పనీర్",
          badge: "ఫామ్ ఫ్రెష్",
          unit: "200 గ్రా",
          shortDesc: "100% పాలతో తయారైన మృదువైన పనీర్. సున్నా ప్రిజర్వేటివ్స్.",
          subName: "తాజా మలై పనీర్"
        },
        'pure-ghee': {
          name: "స్వచ్ఛమైన దేశీ నెయ్యి",
          badge: "సాంప్రదాయ దానెదార్",
          unit: "250 మి.లీ",
          shortDesc: "సాంప్రదాయ పద్ధతిలో చిలికిన కమ్మని సువాసనగల దానెదార్ నెయ్యి.",
          subName: "స్వచ్ఛమైన దేశీ నెయ్యి"
        },
        'sona-masoori': {
          name: "సోనా మసూరి బియ్యం",
          badge: "12-18 నెలల పాతవి",
          unit: "25 కేజీల బ్యాగ్",
          shortDesc: "పొడిపొడిగా ఉడికే సన్నని బియ్యం. తేలికగా జీర్ణమయ్యే నిత్య భోజన బియ్యం.",
          subName: "సోనా మసూరి బియ్యం"
        },
        'basmati-rice': {
          name: "రాయల్ బాస్మతి బియ్యం",
          badge: "పొడవైన గింజలు",
          unit: "25 కేజీల బ్యాగ్",
          shortDesc: "హిమాలయాల సువాసనగల పొడవైన బాస్మతి బియ్యం. బిర్యానీ, పులావ్‌లకు శ్రేష్టం.",
          subName: "రాయల్ బాస్మతి బియ్యం"
        },
        'other-varieties': {
          name: "డీలక్స్ BPT & కోలం బియ్యం",
          badge: "మృదువైన గింజలు",
          unit: "25 కేజీల బ్యాగ్",
          shortDesc: "మెరిసే డీలక్స్ BPT మరియు కమ్మని వాడా కోలం రకాలు.",
          subName: "డీలక్స్ బియ్యం & కోలం"
        }
      }
    },

    // Hindi (हिन्दी)
    hi: {
      topWelcome: "100% शुद्ध फार्म ताज़ा दूध एवं बेहतरीन पुराने चावल के बैग",
      langLabel: "भाषा:",
      brandName: "अमृता",
      tagline: "शुद्ध गुणवत्ता, हर दिन।",
      shortDescription: "आपके परिवार के स्वास्थ्य के लिए 100% फार्म-ताज़ा दूध और उच्च गुणवत्ता वाले पुराने चावल।",
      btnExploreMilk: "दूध उत्पाद",
      btnExploreRice: "चावल किस्में",
      btnContactUs: "संपर्क करें",
      btnSubscriptions: "सब्सक्रिप्शन",
      btnAdmin: "एडमिन",
      btnCart: "कार्ट",
      
      quoteText: "शुद्ध और सात्विक आहार ही स्वस्थ व खुशहाल परिवार की नींव है। हमारे हरे-भरे खेतों से लेकर आपके घर तक - अमृता दूध की हर बूँद और चावल का हर दाना शुद्धता का सच्चा वादा है।",
      quoteSubtitle: "स्वस्थ जीवन की शुरुआत शुद्ध पोषण से होती है",
      quoteAuthor: "— अमृता परिवार का वादा",
      
      milkBadge: "रोज़ाना ताज़ा डेयरी",
      milkSectionTitle: "अमृता ताज़ा दूध एवं डेयरी",
      milkSectionSubtitle: "बिना पानी मिलाया शुद्ध गाय व भैंस का दूध, ताज़ा मलाई पनीर और सुगंधित दानेदार घी।",
      milkSectionCta: "ताज़ा दूध ऑर्डर / दैनिक सब्सक्रिप्शन",
      
      riceBadge: "उत्कृष्ट पुराना धान",
      riceSectionTitle: "अमृता प्रीमियम चावल",
      riceSectionSubtitle: "12 से 18 महीने प्राकृतिक रूप से पुराने सोना मसूरी, डीलक्स बीपीटी और शाही बासमती चावल बैग।",
      riceSectionCta: "चावल बैग ऑर्डर / थोक पूछताछ",
      
      contactHeading: "सीधी ग्राहक सहायता",
      contactSubtitle: "दैनिक दूध डिलीवरी, चावल के बैग या शादी-समारोह के लिए थोक ऑर्डर हेतु संपर्क करें।",
      contactPhoneLabel: "सीधी हेल्पलाइन:",
      contactHoursLabel: "डिलीवरी समय:",
      
      orderNow: "अभी ऑर्डर करें",
      viewDetails: "विवरण देखें",
      addToCart: "कार्ट में जोड़ें",
      samplePriceNotice: "*केवल नमूना कीमतें",
      
      products: {
        'cow-milk': {
          name: "शुद्ध गाय का दूध",
          badge: "रोज़ाना ताज़ा",
          unit: "लीटर",
          shortDesc: "100% प्राकृतिक गाय का दूध। सुपाच्य, प्राकृतिक कैल्शियम, बिना मिलावट।",
          subName: "शुद्ध गाय का दूध"
        },
        'buffalo-milk': {
          name: "शुद्ध भैंस का दूध",
          badge: "गाढ़ा व मलाईदार (7%+ फैट)",
          unit: "लीटर",
          shortDesc: "7%+ प्राकृतिक फैट युक्त गाढ़ा दूध। चाय, गाढ़े दही और घी के लिए उत्तम।",
          subName: "शुद्ध भैंस का दूध"
        },
        'fresh-paneer': {
          name: "ताज़ा मलाई पनीर",
          badge: "फार्म फ्रेश",
          unit: "200 ग्राम",
          shortDesc: "100% शुद्ध दूध से बना बेहद मुलायम पनीर। शून्य प्रिजर्वेटिव।",
          subName: "ताज़ा मलाई पनीर"
        },
        'pure-ghee': {
          name: "शुद्ध देसी घी",
          badge: "पारंपरिक दानेदार",
          unit: "250 मिली",
          shortDesc: "पारंपरिक बिलोना विधि से तैयार स्वर्णिम सुगंधित दानेदार देसी घी।",
          subName: "शुद्ध देसी घी"
        },
        'sona-masoori': {
          name: "सोना मसूरी चावल",
          badge: "12-18 महीने पुराना",
          unit: "25 किग्रा बैग",
          shortDesc: "हल्का, सुगंधित और बिना चिपचिपा खिला-खिला बनने वाला दैनिक भोजन चावल।",
          subName: "सोना मसूरी चावल"
        },
        'basmati-rice': {
          name: "शाही बासमती चावल",
          badge: "अतिरिक्त लंबे दाने",
          unit: "25 किग्रा बैग",
          shortDesc: "हिमालयन पुराना लंबा दाना। शाही बिरयानी और पुलाव के लिए अद्भुत खुशबू।",
          subName: "शाही बासमती चावल"
        },
        'other-varieties': {
          name: "डीलक्स बीपीटी और कोलम चावल",
          badge: "मुलायम व सुगंधित",
          unit: "25 किग्रा बैग",
          shortDesc: "बारीक डीलक्स बीपीटी और खुशबूदार वाडा कोलम की चुनिंदा किस्में।",
          subName: "डीलक्स बीपीटी और कोलम"
        }
      }
    }
  };

  function getCurrentLang() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && ['en', 'te', 'hi'].includes(stored)) {
        return stored;
      }
    } catch (e) {
      // fallback
    }
    return DEFAULT_LANG;
  }

  function getTranslation(key, lang = null) {
    const l = lang || getCurrentLang();
    const dict = TRANSLATIONS[l] || TRANSLATIONS.en;
    return dict[key] !== undefined ? dict[key] : (TRANSLATIONS.en[key] || '');
  }

  function getProductTranslation(productId, lang = null) {
    const l = lang || getCurrentLang();
    const dict = TRANSLATIONS[l] || TRANSLATIONS.en;
    if (dict.products && dict.products[productId]) {
      return dict.products[productId];
    }
    return (TRANSLATIONS.en.products && TRANSLATIONS.en.products[productId]) || null;
  }

  const HAS_CHOSEN_KEY = 'amrutha_lang_chosen';

  function ensureModalElement() {
    let modal = document.getElementById('amruthaLangModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'amruthaLangModal';
      modal.className = 'lang-modal-overlay';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.setAttribute('aria-label', 'Select Language');
      modal.innerHTML = `
        <div class="lang-modal-card">
          <button type="button" class="lang-modal-close-btn" id="btnCloseLangModal" aria-label="Close language selector">&times;</button>
          <div class="lang-modal-header">
            <div class="lang-modal-icon-badge">🌿</div>
            <h3 class="lang-modal-title">Select Your Language</h3>
            <p class="lang-modal-subtitle">మీ భాషను ఎంచుకోండి &bull; अपनी भाषा चुनें</p>
          </div>
          <div class="lang-modal-grid">
            <button type="button" class="lang-modal-option" data-choose-lang="en">
              <div class="lang-modal-option-main">
                <span class="lang-modal-option-name">English</span>
                <span class="lang-modal-option-sub">Pure Farm Fresh Quality</span>
              </div>
              <span class="lang-modal-option-arrow">&rarr;</span>
            </button>
            <button type="button" class="lang-modal-option" data-choose-lang="te">
              <div class="lang-modal-option-main">
                <span class="lang-modal-option-name">తెలుగు</span>
                <span class="lang-modal-option-sub">స్వచ్ఛమైన నాణ్యత, ప్రతిరోజూ</span>
              </div>
              <span class="lang-modal-option-arrow">&rarr;</span>
            </button>
            <button type="button" class="lang-modal-option" data-choose-lang="hi">
              <div class="lang-modal-option-main">
                <span class="lang-modal-option-name">हिन्दी</span>
                <span class="lang-modal-option-sub">शुद्ध गुणवत्ता, हर दिन</span>
              </div>
              <span class="lang-modal-option-arrow">&rarr;</span>
            </button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      // Bind close button
      const closeBtn = modal.querySelector('#btnCloseLangModal');
      if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
      }

      // Close on backdrop click (if already chosen once)
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          let chosen = false;
          try {
            chosen = localStorage.getItem(HAS_CHOSEN_KEY) === 'true';
          } catch (err) {}
          if (chosen) {
            closeModal();
          }
        }
      });

      // Bind options
      modal.querySelectorAll('[data-choose-lang]').forEach(btn => {
        btn.addEventListener('click', () => {
          const lang = btn.getAttribute('data-choose-lang');
          if (lang) {
            setLanguage(lang);
            try {
              localStorage.setItem(HAS_CHOSEN_KEY, 'true');
            } catch (err) {}
            closeModal();
          }
        });
      });
    }
    return modal;
  }

  function openModal(canClose = true) {
    const modal = ensureModalElement();
    const closeBtn = modal.querySelector('#btnCloseLangModal');
    if (closeBtn) {
      closeBtn.style.display = canClose ? 'flex' : 'none';
    }

    // Highlight current active language
    const currentLang = getCurrentLang();
    modal.querySelectorAll('.lang-modal-option').forEach(opt => {
      if (opt.getAttribute('data-choose-lang') === currentLang) {
        opt.classList.add('active');
      } else {
        opt.classList.remove('active');
      }
    });

    requestAnimationFrame(() => {
      modal.classList.add('open');
    });
  }

  function closeModal() {
    const modal = document.getElementById('amruthaLangModal');
    if (modal) {
      modal.classList.remove('open');
    }
  }

  function setLanguage(lang) {
    if (!['en', 'te', 'hi'].includes(lang)) {
      lang = DEFAULT_LANG;
    }
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {}

    document.documentElement.lang = lang;

    // 1. Update current language labels (e.g., .current-lang-code)
    const langLabels = { en: 'ENG', te: 'తెలుగు', hi: 'हिन्दी' };
    const currentLabel = langLabels[lang] || 'ENG';
    document.querySelectorAll('.current-lang-code').forEach(el => {
      el.textContent = currentLabel;
    });

    // 2. Update all language switcher buttons active states (if any exist)
    document.querySelectorAll('.lang-pill-btn').forEach(btn => {
      const btnLang = btn.getAttribute('data-lang');
      if (btnLang === lang) {
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');
      } else {
        btn.classList.remove('active');
        btn.setAttribute('aria-pressed', 'false');
      }
    });

    // 3. Translate generic data-i18n elements
    const dict = TRANSLATIONS[lang] || TRANSLATIONS.en;
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (dict[key] !== undefined) {
        el.textContent = dict[key];
      }
    });

    // 4. Translate subtitle / local name spans
    document.querySelectorAll('[data-i18n-sub]').forEach(el => {
      const pId = el.getAttribute('data-i18n-sub');
      const pTrans = getProductTranslation(pId, lang);
      if (pTrans) {
        if (lang === 'en') {
          // Clean English: Hide or clear bilingual subtitle completely!
          el.textContent = '';
          el.style.display = 'none';
        } else {
          el.textContent = pTrans.subName || pTrans.name;
          el.style.display = 'inline-block';
        }
      }
    });

    // 5. Translate product names if present with data-i18n-prod-name
    document.querySelectorAll('[data-i18n-prod-name]').forEach(el => {
      const pId = el.getAttribute('data-i18n-prod-name');
      const pTrans = getProductTranslation(pId, lang);
      if (pTrans && pTrans.name) {
        el.textContent = pTrans.name;
      }
    });

    // 6. Translate product badges if present with data-i18n-prod-badge
    document.querySelectorAll('[data-i18n-prod-badge]').forEach(el => {
      const pId = el.getAttribute('data-i18n-prod-badge');
      const pTrans = getProductTranslation(pId, lang);
      if (pTrans && pTrans.badge) {
        el.textContent = pTrans.badge;
      }
    });

    // 7. Broadcast event so other components (app.js, milk.js, rice.js) can react
    window.dispatchEvent(new CustomEvent('amrutha-language-changed', {
      detail: { lang, dict }
    }));
  }

  function init() {
    const currentLang = getCurrentLang();
    setLanguage(currentLang);

    // Bind any language switcher buttons that might exist in DOM
    document.addEventListener('click', (e) => {
      const target = e.target.closest('.lang-pill-btn');
      if (target) {
        const selectedLang = target.getAttribute('data-lang');
        if (selectedLang) {
          setLanguage(selectedLang);
          try {
            localStorage.setItem(HAS_CHOSEN_KEY, 'true');
          } catch (err) {}
        }
      }
    });

    // Check if customer is opening the website for the very first time
    let hasChosen = false;
    try {
      hasChosen = localStorage.getItem(HAS_CHOSEN_KEY) === 'true';
    } catch (e) {}

    // Only show modal when customer opens for the first time!
    // Never show every time on the home screen if already chosen.
    if (!hasChosen) {
      setTimeout(() => {
        openModal(false); // First time: prompt customer to choose language
      }, 400);
    }
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return {
    getLanguage: getCurrentLang,
    setLanguage: setLanguage,
    openModal: openModal,
    closeModal: closeModal,
    t: getTranslation,
    getProduct: getProductTranslation,
    translations: TRANSLATIONS
  };
})();

// Expose globally
window.AmruthaI18n = AmruthaI18n;
