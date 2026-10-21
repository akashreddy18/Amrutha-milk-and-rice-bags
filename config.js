/**
 * AMRUTHA - BRAND & SITE CONFIGURATION
 * 
 * Central configuration file for all brand names, taglines, contact info,
 * and editable sample prices.
 * Note: All prices are editable examples for demonstration and not claimed to be actual market prices.
 */

const SITE_CONFIG = {
  // Master Brand Settings
  brandName: "AMRUTHA",
  tagline: "Pure Quality, Every Day.",
  shortDescription: "Your trusted household partner for 100% farm-fresh milk and top-grade aged rice bags.",
  
  // Quick Contact Information
  contact: {
    phone: "+91 63044 95282",
    phoneHref: "tel:+916304495282",
    whatsapp: "+91 63044 95282",
    whatsappHref: "https://wa.me/916304495282",
    email: "contact@amruthadairyandrice.com",
    address: "Amrutha Depot, Venkatarampuram Road, Kodad Town - 508206, Telangana",
    timings: {
      milk: "Morning: 5:30 AM – 7:30 AM | Evening: 5:00 PM – 7:00 PM",
      rice: "Rice Bag Delivery: 8:00 AM – 8:00 PM Daily (Doorstep Unloading)",
      depot: "8:00 AM – 8:30 PM (All 7 Days)"
    }
  },

  // Primary Brand Divisions
  divisions: {
    milk: {
      id: "milk",
      brandName: "AMRUTHA FRESH MILK",
      badge: "100% Farm Fresh",
      tagline: "Pure, untouched cow & buffalo milk delivered daily to your home.",
      accentClass: "milk-accent",
      buttonText: "Explore Milk",
      pageUrl: "milk.html",
      image: "assets/images/brand_milk_pouch.jpg",
      imageAlt: "Amrutha Fresh Milk 500ml official pouch packaging"
    },

    rice: {
      id: "rice",
      brandName: "AMRUTHA PREMIUM RICE",
      badge: "Aged 12-18 Months",
      tagline: "Fine-grain, destoned, perfectly aged rice for soft, fluffy meals.",
      accentClass: "rice-accent",
      buttonText: "Explore Rice",
      pageUrl: "rice.html",
      image: "assets/images/brand_rice_bag.jpg",
      imageAlt: "Amrutha Premium Rice 10kg/25kg/50kg official packaging bag"
    }
  },

  // Dedicated AMRUTHA FRESH MILK Products Configuration (Milk Module)
  milkPage: {
    pageTitle: "AMRUTHA FRESH MILK",
    subTitle: "Pure Farm Fresh Dairy Products Delivered Daily to Your Doorstep",
    samplePriceNotice: "*All prices shown are sample prices for demonstration and can be updated at any time.",
    deliveryNotice: "Daily Doorstep Delivery: Morning (5:30 AM – 7:30 AM) & Evening (5:00 PM – 7:00 PM)",
    products: [
      {
        id: "cow-milk",
        name: "Pure Cow Milk",
        localName: "",
        status: "available",
        badge: "Daily Fresh",
        image: "assets/images/brand_milk_pouch.jpg",
        imageAlt: "Fresh pure cow milk in official Amrutha pouch",
        price: 60, // Sample price per litre
        unit: "Litre",
        priceFormatted: "₹60",
        sampleLabel: "Sample Price",
        defaultQty: 1,
        description: "100% natural, pure farm cow milk. Light, easy to digest, and rich in natural calcium. No water added, no chemicals.",
        benefits: ["Zero Water Addition", "Tested Fat & SNF", "Fresh Daily Milking"]
      },
      {
        id: "buffalo-milk",
        name: "Pure Buffalo Milk",
        localName: "",
        status: "available",
        badge: "Thick & Creamy",
        image: "assets/images/buffalo_milk.jpg",
        imageAlt: "Rich thick buffalo milk with cream",
        price: 75, // Sample price per litre
        unit: "Litre",
        priceFormatted: "₹75",
        sampleLabel: "Sample Price",
        defaultQty: 1,
        description: "Thick, high-fat natural buffalo milk (7%+ Fat). Produces rich malai, perfect for tea, coffee, homemade dahi, and ghee.",
        benefits: ["High Cream & Fat (7%+)", "Thick Curd & Malai", "Pure & Untouched"]
      },
      {
        id: "fresh-paneer",
        name: "Fresh Malai Paneer",
        localName: "",
        status: "available",
        badge: "Farm Fresh",
        image: "assets/images/fresh_paneer.jpg",
        imageAlt: "Fresh white malai paneer cubes on banana leaf",
        price: 90,
        unit: "200 g",
        priceFormatted: "₹90",
        sampleLabel: "Sample Price",
        defaultQty: 1,
        description: "Soft, melt-in-mouth cottage cheese crafted from 100% whole milk. High in natural protein, spongy texture, zero preservatives. Vacuum packed for freshness.",
        benefits: ["100% Whole Milk", "High Protein", "Spongy & Soft"],
        defaultSize: "200 g",
        sizes: [
          { size: "200 g", label: "200 g", examplePrice: 90, formatted: "₹90" },
          { size: "500 g", label: "500 g", examplePrice: 220, formatted: "₹220" },
          { size: "1 kg", label: "1 kg", examplePrice: 430, formatted: "₹430" }
        ]
      },
      {
        id: "pure-ghee",
        name: "Pure Desi Ghee",
        localName: "",
        status: "available",
        badge: "Traditional Danedar",
        image: "assets/images/fresh_ghee.jpg",
        imageAlt: "Pure golden traditional desi ghee in bowl",
        price: 210,
        unit: "250 ml",
        priceFormatted: "₹210",
        sampleLabel: "Sample Price",
        defaultQty: 1,
        description: "Golden, granular (danedar) desi ghee prepared by traditional churning of pure farm butter. Rich divine aroma, healthy fats, and pure goodness.",
        benefits: ["Golden Granular Aroma", "100% Pure Butterfat", "No Artificial Essence"],
        defaultSize: "250 ml",
        sizes: [
          { size: "250 ml", label: "250 ml", examplePrice: 210, formatted: "₹210" },
          { size: "500 ml", label: "500 ml", examplePrice: 410, formatted: "₹410" },
          { size: "1 litre", label: "1 Litre", examplePrice: 800, formatted: "₹800" }
        ]
      }
    ]
  },

  // Dedicated AMRUTHA PREMIUM RICE Products Configuration (Rice Module)
  // Clean white, cream & gold design. Sample prices clearly marked as examples.
  ricePage: {
    pageTitle: "AMRUTHA PREMIUM RICE",
    subTitle: "Naturally Aged Paddy &bull; Pure Quality, Every Day.",
    disclaimer: "Notice: All prices shown below are example prices for layout demonstration only and do not represent actual market prices. You can edit all example prices in config.js.",
    bulkNotice: "Wholesale & Bulk Orders Available: Free doorstep delivery for 5+ bags for caterers, restaurants, and functions.",
    products: [
      {
        id: "sona-masoori",
        name: "Amrutha Sona Masoori Rice",
        localName: "",
        badge: "Aged 12-18 Months",
        image: "assets/images/brand_rice_bag.jpg",
        imageAlt: "Amrutha Sona Masoori authentic brand rice bag",
        description: "Finest medium-slender grain rice aged naturally for 12 to 18 months. Light on the stomach, non-sticky, fluffy, and aromatic after cooking. Perfect for everyday family meals.",
        highlights: ["100% Destoned & Cleaned", "Aged 12+ Months", "Fluffy Non-Sticky Cooking"],
        defaultSize: "25kg",
        sizes: [
          { size: "50kg", label: "50 kg Bag", examplePrice: 2850, formatted: "₹2,850" },
          { size: "25kg", label: "25 kg Bag", examplePrice: 1450, formatted: "₹1,450" },
          { size: "10kg", label: "10 kg Bag", examplePrice: 600, formatted: "₹600" },
          { size: "5kg", label: "5 kg Bag", examplePrice: 310, formatted: "₹310" }
        ]
      },
      {
        id: "basmati-rice",
        name: "Amrutha Royal Basmati Rice",
        localName: "",
        badge: "Extra Long Grain",
        image: "assets/images/basmati_rice_bag.jpg",
        imageAlt: "Amrutha Royal Basmati Rice bag with long slender grains",
        description: "Exquisite Himalayan aged long-grain basmati rice. Each grain expands gracefully to more than double its length without breaking. Imparts an authentic royal aroma for Biryani, Pulao, and celebrations.",
        highlights: ["Aged for Regal Aroma", "Extra Long Slender Grains", "Ideal for Biryani & Pulao"],
        defaultSize: "25kg",
        sizes: [
          { size: "50kg", label: "50 kg Bag", examplePrice: 4700, formatted: "₹4,700" },
          { size: "25kg", label: "25 kg Bag", examplePrice: 2400, formatted: "₹2,400" },
          { size: "10kg", label: "10 kg Bag", examplePrice: 990, formatted: "₹990" },
          { size: "5kg", label: "5 kg Bag", examplePrice: 510, formatted: "₹510" }
        ]
      },
      {
        id: "other-varieties",
        name: "Other Rice Varieties (Deluxe BPT & Kolam)",
        localName: "",
        badge: "Silky & Aromatic",
        image: "assets/images/kolam_rice_bag.jpg",
        imageAlt: "Deluxe BPT and Wada Kolam rice bag",
        description: "Selected premium Indian regional varieties: Deluxe BPT / HMT (silky white fine grain with tender bite) and Wada Kolam / Jeera Rice (short fragrant grains ideal for dal chawal, khichdi, and soft daily meals).",
        highlights: ["Deluxe BPT & Wada Kolam", "100% Cleaned & Destoned", "Pristine Pearl Texture"],
        defaultSize: "25kg",
        sizes: [
          { size: "50kg", label: "50 kg Bag", examplePrice: 3100, formatted: "₹3,100" },
          { size: "25kg", label: "25 kg Bag", examplePrice: 1580, formatted: "₹1,580" },
          { size: "10kg", label: "10 kg Bag", examplePrice: 650, formatted: "₹650" },
          { size: "5kg", label: "5 kg Bag", examplePrice: 340, formatted: "₹340" }
        ]
      }
    ]
  },

  // Buttons Configuration
  buttons: {
    exploreMilk: "Explore Milk",
    exploreRice: "Explore Rice",
    contactUs: "Contact Us",
    addToCart: "Add to Cart",
    orderWhatsApp: "Order on WhatsApp",
    callToOrder: "Call to Order"
  },

  // Simple Footer Configuration
  footer: {
    copyrightYear: 2026,
    copyrightText: "© 2026 AMRUTHA. All rights reserved.",
    tagline: "Pure Quality, Every Day."
  }
};

// Export for module environments if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SITE_CONFIG;
}
