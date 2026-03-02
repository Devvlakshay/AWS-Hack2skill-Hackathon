import { useState, useEffect, useRef } from "react";

// ─── ICON COMPONENTS ─────────────────────────────────────────────
const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
  </svg>
);
const CartIcon = ({ count }) => (
  <div style={{ position: "relative", cursor: "pointer" }}>
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>
    </svg>
    {count > 0 && <span style={{ position:"absolute",top:-6,right:-8,background:"#E53935",color:"#fff",borderRadius:"50%",width:16,height:16,fontSize:10,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700 }}>{count}</span>}
  </div>
);
const HeartIcon = ({ filled }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? "#E53935" : "none"} stroke={filled ? "#E53935" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);
const StarIcon = ({ filled }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? "#F5A623" : "none"} stroke="#F5A623" strokeWidth="2">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);
const MenuIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);
const ArrowRight = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
  </svg>
);
const ChevronDown = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m6 9 6 6 6-6"/>
  </svg>
);
const TruckIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 3h15v13H1z"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
  </svg>
);
const ShieldIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>
  </svg>
);
const RefreshIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 4v6h6"/><path d="M23 20v-6h-6"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15"/>
  </svg>
);
const SupportIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
);

// ─── DATA ────────────────────────────────────────────────────────
const categories = [
  { name: "Coats", image: "https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?w=400&h=500&fit=crop", count: 124 },
  { name: "Jackets", image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=500&fit=crop", count: 89 },
  { name: "Dresses", image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=500&fit=crop", count: 256 },
  { name: "T-Shirts", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=500&fit=crop", count: 312 },
];

const products = [
  { id: 1, name: "Classic Wool Overcoat", price: 289, oldPrice: 350, rating: 4.8, reviews: 124, image: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=400&h=520&fit=crop", badge: "New", category: "new" },
  { id: 2, name: "Leather Biker Jacket", price: 349, rating: 4.9, reviews: 89, image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=520&fit=crop", category: "new" },
  { id: 3, name: "Silk Evening Dress", price: 199, oldPrice: 259, rating: 4.7, reviews: 201, image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=520&fit=crop", badge: "Sale", category: "new" },
  { id: 4, name: "Cashmere Turtleneck", price: 159, rating: 4.6, reviews: 67, image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=520&fit=crop", category: "new" },
  { id: 5, name: "Tailored Blazer", price: 229, rating: 4.8, reviews: 145, image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=520&fit=crop", category: "best" },
  { id: 6, name: "Pleated Midi Skirt", price: 89, oldPrice: 120, rating: 4.5, reviews: 178, image: "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=400&h=520&fit=crop", badge: "Sale", category: "best" },
  { id: 7, name: "Oversized Denim Jacket", price: 179, rating: 4.7, reviews: 92, image: "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=400&h=520&fit=crop", category: "best" },
  { id: 8, name: "Linen Summer Shirt", price: 79, rating: 4.4, reviews: 56, image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=520&fit=crop", category: "best" },
];

const brands = ["GUCCI", "PRADA", "VERSACE", "DIOR", "CHANEL", "BURBERRY"];

// ─── STYLES ──────────────────────────────────────────────────────
const fontLink = document.createElement("link");
fontLink.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=DM+Sans:wght@300;400;500;600;700&display=swap";
fontLink.rel = "stylesheet";
document.head.appendChild(fontLink);

const css = `
  * { margin:0; padding:0; box-sizing:border-box; }
  html { scroll-behavior: smooth; }
  body { font-family: 'DM Sans', sans-serif; color: #1a1a1a; background: #FAFAF8; overflow-x: hidden; }

  @keyframes fadeUp { from { opacity:0; transform:translateY(30px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
  @keyframes slideRight { from { transform:translateX(-100%); } to { transform:translateX(0); } }
  @keyframes scaleIn { from { opacity:0; transform:scale(0.95); } to { opacity:1; transform:scale(1); } }
  @keyframes marquee { 0% { transform:translateX(0); } 100% { transform:translateX(-50%); } }
  @keyframes float { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-8px); } }

  .fade-up { animation: fadeUp 0.7s ease forwards; }
  .fade-in { animation: fadeIn 0.5s ease forwards; }
  .stagger-1 { animation-delay: 0.1s; opacity: 0; }
  .stagger-2 { animation-delay: 0.2s; opacity: 0; }
  .stagger-3 { animation-delay: 0.3s; opacity: 0; }
  .stagger-4 { animation-delay: 0.4s; opacity: 0; }

  .product-card:hover .product-img { transform: scale(1.05); }
  .product-card:hover .quick-add { opacity:1; transform:translateY(0); }
  .product-card:hover .heart-btn { opacity:1; }
  .category-card:hover .cat-img { transform: scale(1.08); }
  .category-card:hover .cat-overlay { opacity: 1; }

  .nav-link { position:relative; }
  .nav-link::after { content:''; position:absolute; bottom:-2px; left:0; width:0; height:1.5px; background:#1a1a1a; transition:width 0.3s ease; }
  .nav-link:hover::after { width:100%; }

  .btn-primary { background:#1a1a1a; color:#fff; border:none; cursor:pointer; transition:all 0.3s ease; }
  .btn-primary:hover { background:#333; transform:translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
  .btn-outline { background:transparent; color:#1a1a1a; border:1.5px solid #1a1a1a; cursor:pointer; transition:all 0.3s ease; }
  .btn-outline:hover { background:#1a1a1a; color:#fff; }

  .marquee-container { overflow:hidden; white-space:nowrap; }
  .marquee-content { display:inline-block; animation: marquee 20s linear infinite; }

  .hero-img-wrapper { position:relative; overflow:hidden; }
  .hero-img-wrapper::after {
    content:'';
    position:absolute; top:0; left:0; right:0; bottom:0;
    background: linear-gradient(135deg, rgba(26,26,26,0.08) 0%, transparent 60%);
    pointer-events:none;
  }

  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #ccc; border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: #999; }

  .tab-active { color:#1a1a1a; border-bottom: 2px solid #1a1a1a; }
  .tab-inactive { color:#999; border-bottom: 2px solid transparent; }
  .tab-inactive:hover { color:#666; }
`;

// ─── MAIN COMPONENT ──────────────────────────────────────────────
export default function ClothStore() {
  const [cartCount, setCartCount] = useState(0);
  const [favorites, setFavorites] = useState(new Set());
  const [activeTab, setActiveTab] = useState("new");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [email, setEmail] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => { document.head.removeChild(style); window.removeEventListener("scroll", onScroll); };
  }, []);

  const toggleFav = (id) => {
    setFavorites(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const filteredProducts = products.filter(p => p.category === activeTab);

  // ── TOP BAR ──
  const TopBar = () => (
    <div style={{ background:"#1a1a1a", color:"#fff", fontSize:12, fontWeight:400, letterSpacing:0.5, padding:"8px 0", textAlign:"center" }}>
      <div className="marquee-container">
        <div className="marquee-content">
          <span style={{ margin:"0 40px" }}>FREE SHIPPING ON ORDERS OVER $150</span>
          <span style={{ margin:"0 40px", opacity:0.6 }}>•</span>
          <span style={{ margin:"0 40px" }}>NEW ARRIVALS EVERY WEEK</span>
          <span style={{ margin:"0 40px", opacity:0.6 }}>•</span>
          <span style={{ margin:"0 40px" }}>EASY 30-DAY RETURNS</span>
          <span style={{ margin:"0 40px", opacity:0.6 }}>•</span>
          <span style={{ margin:"0 40px" }}>FREE SHIPPING ON ORDERS OVER $150</span>
          <span style={{ margin:"0 40px", opacity:0.6 }}>•</span>
          <span style={{ margin:"0 40px" }}>NEW ARRIVALS EVERY WEEK</span>
          <span style={{ margin:"0 40px", opacity:0.6 }}>•</span>
          <span style={{ margin:"0 40px" }}>EASY 30-DAY RETURNS</span>
        </div>
      </div>
    </div>
  );

  // ── NAVBAR ──
  const Navbar = () => (
    <nav style={{
      position:"sticky", top:0, zIndex:100,
      background: scrolled ? "rgba(250,250,248,0.95)" : "#FAFAF8",
      backdropFilter: scrolled ? "blur(12px)" : "none",
      borderBottom: scrolled ? "1px solid rgba(0,0,0,0.06)" : "1px solid transparent",
      transition:"all 0.3s ease",
      padding:"0 clamp(20px, 5vw, 80px)"
    }}>
      <div style={{ maxWidth:1400, margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"space-between", height:72 }}>
        {/* Logo */}
        <div style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer" }}>
          <div style={{ width:36, height:36, background:"#1a1a1a", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <span style={{ color:"#fff", fontFamily:"'Playfair Display',serif", fontWeight:700, fontSize:18 }}>C</span>
          </div>
          <span style={{ fontFamily:"'Playfair Display',serif", fontWeight:600, fontSize:22, letterSpacing:-0.5 }}>CLOTHE</span>
        </div>

        {/* Desktop Nav */}
        <div style={{ display:"flex", gap:32, alignItems:"center" }}>
          {["Home", "Shop", "Collections", "About", "Contact"].map(item => (
            <a key={item} className="nav-link" style={{ textDecoration:"none", color:"#1a1a1a", fontSize:14, fontWeight:500, letterSpacing:0.3, cursor:"pointer" }}>
              {item}
              {item === "Shop" && <ChevronDown />}
            </a>
          ))}
        </div>

        {/* Right Icons */}
        <div style={{ display:"flex", alignItems:"center", gap:20 }}>
          <div onClick={() => setSearchOpen(!searchOpen)} style={{ cursor:"pointer", transition:"transform 0.2s" }}>
            <SearchIcon />
          </div>
          <div style={{ cursor:"pointer", position:"relative" }}>
            <HeartIcon filled={false} />
            {favorites.size > 0 && <span style={{ position:"absolute",top:-5,right:-6,background:"#E53935",color:"#fff",borderRadius:"50%",width:14,height:14,fontSize:9,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700 }}>{favorites.size}</span>}
          </div>
          <CartIcon count={cartCount} />
          <div onClick={() => setMobileMenu(!mobileMenu)} style={{ cursor:"pointer", display:"none" }}>
            <MenuIcon />
          </div>
        </div>
      </div>

      {/* Search Bar */}
      {searchOpen && (
        <div style={{ maxWidth:1400, margin:"0 auto", padding:"0 0 16px", animation:"fadeUp 0.3s ease" }} className="fade-up">
          <div style={{ display:"flex", alignItems:"center", gap:12, background:"#f0f0ec", borderRadius:12, padding:"12px 20px" }}>
            <SearchIcon />
            <input
              autoFocus
              placeholder="Search for products, brands, categories..."
              style={{ flex:1, border:"none", outline:"none", background:"transparent", fontSize:14, fontFamily:"'DM Sans',sans-serif", color:"#1a1a1a" }}
            />
            <span onClick={() => setSearchOpen(false)} style={{ cursor:"pointer", fontSize:12, color:"#999", fontWeight:500 }}>ESC</span>
          </div>
        </div>
      )}
    </nav>
  );

  // ── HERO ──
  const Hero = () => (
    <section style={{ padding:"0 clamp(20px, 5vw, 80px)", maxWidth:1400, margin:"0 auto" }}>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:0, minHeight:"85vh", alignItems:"center" }}>
        {/* Left Content */}
        <div style={{ paddingRight:60, paddingTop:40, paddingBottom:40 }}>
          <div className="fade-up stagger-1" style={{ display:"inline-block", background:"rgba(229,57,53,0.08)", color:"#E53935", fontSize:12, fontWeight:600, letterSpacing:1.5, padding:"6px 16px", borderRadius:100, marginBottom:28, textTransform:"uppercase" }}>
            Spring / Summer 2025
          </div>
          <h1 className="fade-up stagger-2" style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(42px, 5vw, 68px)", fontWeight:600, lineHeight:1.08, letterSpacing:-1.5, color:"#1a1a1a", marginBottom:24 }}>
            Discover Your<br/>
            <span style={{ fontStyle:"italic", color:"#B8860B" }}>Perfect</span> Style
          </h1>
          <p className="fade-up stagger-3" style={{ fontSize:16, lineHeight:1.7, color:"#666", maxWidth:440, marginBottom:40, fontWeight:400 }}>
            Explore our curated collection of premium fashion pieces designed to elevate your wardrobe with timeless elegance and modern sophistication.
          </p>
          <div className="fade-up stagger-4" style={{ display:"flex", gap:16, alignItems:"center", flexWrap:"wrap" }}>
            <button className="btn-primary" style={{ padding:"16px 40px", borderRadius:100, fontSize:14, fontWeight:600, letterSpacing:0.5, display:"flex", alignItems:"center", gap:10 }}>
              Shop Collection <ArrowRight />
            </button>
            <button className="btn-outline" style={{ padding:"16px 32px", borderRadius:100, fontSize:14, fontWeight:600, letterSpacing:0.5 }}>
              Explore Lookbook
            </button>
          </div>
          {/* Stats */}
          <div className="fade-up" style={{ display:"flex", gap:48, marginTop:56, animationDelay:"0.5s", opacity:0 }}>
            {[["2K+", "Products"], ["500+", "Brands"], ["50K+", "Happy Clients"]].map(([num, label]) => (
              <div key={label}>
                <div style={{ fontFamily:"'Playfair Display',serif", fontSize:28, fontWeight:700, color:"#1a1a1a" }}>{num}</div>
                <div style={{ fontSize:12, color:"#999", letterSpacing:1, textTransform:"uppercase", marginTop:4, fontWeight:500 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Image */}
        <div className="hero-img-wrapper fade-in" style={{ position:"relative", height:"85vh", borderRadius:24, overflow:"hidden" }}>
          <img
            src="https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&h=1100&fit=crop&crop=top"
            alt="Fashion model"
            style={{ width:"100%", height:"100%", objectFit:"cover" }}
          />
          {/* Floating Card */}
          <div style={{
            position:"absolute", bottom:32, left:32, right:32,
            background:"rgba(255,255,255,0.92)", backdropFilter:"blur(16px)",
            borderRadius:16, padding:"20px 24px",
            display:"flex", alignItems:"center", justifyContent:"space-between",
            animation:"float 4s ease-in-out infinite"
          }}>
            <div>
              <div style={{ fontSize:13, color:"#999", fontWeight:500, marginBottom:4 }}>Trending Now</div>
              <div style={{ fontSize:16, fontWeight:600, color:"#1a1a1a" }}>Autumn Wool Coat</div>
              <div style={{ fontSize:15, fontWeight:700, color:"#B8860B", marginTop:2 }}>$289.00</div>
            </div>
            <button className="btn-primary" style={{ padding:"12px 24px", borderRadius:100, fontSize:13, fontWeight:600 }}>
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </section>
  );

  // ── BRAND MARQUEE ──
  const BrandMarquee = () => (
    <section style={{ borderTop:"1px solid #eee", borderBottom:"1px solid #eee", padding:"32px 0", marginTop:20 }}>
      <div className="marquee-container">
        <div className="marquee-content" style={{ animation:"marquee 15s linear infinite" }}>
          {[...brands, ...brands].map((b, i) => (
            <span key={i} style={{ margin:"0 48px", fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:500, color:"#ccc", letterSpacing:4, textTransform:"uppercase" }}>
              {b}
            </span>
          ))}
        </div>
      </div>
    </section>
  );

  // ── CATEGORIES ──
  const Categories = () => (
    <section style={{ padding:"80px clamp(20px, 5vw, 80px)", maxWidth:1400, margin:"0 auto" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:48 }}>
        <div>
          <div style={{ fontSize:12, fontWeight:600, letterSpacing:2, textTransform:"uppercase", color:"#B8860B", marginBottom:12 }}>Categories</div>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:38, fontWeight:600, letterSpacing:-0.5 }}>
            Shop by Category
          </h2>
        </div>
        <a style={{ fontSize:14, fontWeight:600, color:"#1a1a1a", textDecoration:"none", cursor:"pointer", display:"flex", alignItems:"center", gap:8, borderBottom:"1.5px solid #1a1a1a", paddingBottom:2 }}>
          View All <ArrowRight />
        </a>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:20 }}>
        {categories.map((cat, i) => (
          <div key={cat.name} className="category-card" style={{ position:"relative", borderRadius:20, overflow:"hidden", cursor:"pointer", height:420, animationDelay:`${i * 0.1}s` }}>
            <img className="cat-img" src={cat.image} alt={cat.name} style={{ width:"100%", height:"100%", objectFit:"cover", transition:"transform 0.6s ease" }} />
            <div className="cat-overlay" style={{
              position:"absolute", inset:0,
              background:"linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.1) 50%, transparent 100%)",
              transition:"opacity 0.4s ease", opacity:0.8
            }} />
            <div style={{ position:"absolute", bottom:28, left:28, right:28, color:"#fff" }}>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:24, fontWeight:600, marginBottom:4 }}>{cat.name}</div>
              <div style={{ fontSize:13, opacity:0.8, fontWeight:400 }}>{cat.count} Products</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );

  // ── PRODUCT CARD ──
  const ProductCard = ({ product }) => (
    <div className="product-card" style={{ position:"relative", cursor:"pointer" }}>
      <div style={{ position:"relative", borderRadius:16, overflow:"hidden", background:"#f0f0ec", marginBottom:16 }}>
        <img className="product-img" src={product.image} alt={product.name} style={{ width:"100%", height:380, objectFit:"cover", transition:"transform 0.6s ease", display:"block" }} />
        {product.badge && (
          <span style={{
            position:"absolute", top:16, left:16,
            background: product.badge === "Sale" ? "#E53935" : "#1a1a1a",
            color:"#fff", fontSize:11, fontWeight:600, letterSpacing:0.8, padding:"5px 14px", borderRadius:100, textTransform:"uppercase"
          }}>
            {product.badge}
          </span>
        )}
        <div className="heart-btn" onClick={(e) => { e.stopPropagation(); toggleFav(product.id); }}
          style={{ position:"absolute", top:16, right:16, background:"rgba(255,255,255,0.9)", width:36, height:36, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", opacity:0, transition:"opacity 0.3s ease", backdropFilter:"blur(4px)" }}>
          <HeartIcon filled={favorites.has(product.id)} />
        </div>
        <div className="quick-add" style={{
          position:"absolute", bottom:16, left:16, right:16,
          opacity:0, transform:"translateY(8px)", transition:"all 0.3s ease"
        }}>
          <button onClick={(e) => { e.stopPropagation(); setCartCount(c => c + 1); }}
            className="btn-primary" style={{ width:"100%", padding:"14px", borderRadius:12, fontSize:13, fontWeight:600, letterSpacing:0.5 }}>
            Add to Cart
          </button>
        </div>
      </div>
      <div style={{ padding:"0 4px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:6 }}>
          <div style={{ display:"flex", gap:1 }}>
            {[1,2,3,4,5].map(s => <StarIcon key={s} filled={s <= Math.round(product.rating)} />)}
          </div>
          <span style={{ fontSize:12, color:"#999", fontWeight:500 }}>({product.reviews})</span>
        </div>
        <h3 style={{ fontSize:15, fontWeight:600, color:"#1a1a1a", marginBottom:8, lineHeight:1.3 }}>{product.name}</h3>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:17, fontWeight:700, color:"#1a1a1a" }}>${product.price}</span>
          {product.oldPrice && <span style={{ fontSize:14, color:"#ccc", textDecoration:"line-through", fontWeight:500 }}>${product.oldPrice}</span>}
        </div>
      </div>
    </div>
  );

  // ── PRODUCTS SECTION ──
  const Products = () => (
    <section style={{ padding:"40px clamp(20px, 5vw, 80px) 80px", maxWidth:1400, margin:"0 auto" }}>
      <div style={{ textAlign:"center", marginBottom:48 }}>
        <div style={{ fontSize:12, fontWeight:600, letterSpacing:2, textTransform:"uppercase", color:"#B8860B", marginBottom:12 }}>Our Products</div>
        <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:38, fontWeight:600, letterSpacing:-0.5, marginBottom:32 }}>
          Curated For You
        </h2>
        <div style={{ display:"flex", justifyContent:"center", gap:32 }}>
          {[["new", "New Arrivals"], ["best", "Best Sellers"]].map(([key, label]) => (
            <button key={key} onClick={() => setActiveTab(key)}
              className={activeTab === key ? "tab-active" : "tab-inactive"}
              style={{ background:"none", border:"none", cursor:"pointer", fontSize:15, fontWeight:600, letterSpacing:0.3, paddingBottom:10, transition:"all 0.3s ease", fontFamily:"'DM Sans',sans-serif" }}>
              {label}
            </button>
          ))}
        </div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:24 }}>
        {filteredProducts.map((p, i) => (
          <div key={p.id} className="fade-up" style={{ animationDelay:`${i * 0.1}s`, opacity:0 }}>
            <ProductCard product={p} />
          </div>
        ))}
      </div>
      <div style={{ textAlign:"center", marginTop:48 }}>
        <button className="btn-outline" style={{ padding:"16px 48px", borderRadius:100, fontSize:14, fontWeight:600, letterSpacing:0.5 }}>
          View All Products
        </button>
      </div>
    </section>
  );

  // ── PROMO BANNER ──
  const PromoBanner = () => (
    <section style={{ padding:"0 clamp(20px, 5vw, 80px)", maxWidth:1400, margin:"0 auto 80px" }}>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:24, minHeight:480 }}>
        {/* Left Card */}
        <div style={{
          position:"relative", borderRadius:24, overflow:"hidden", background:"#1a1a1a",
          display:"flex", alignItems:"center", padding:56
        }}>
          <img src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&h=600&fit=crop" alt=""
            style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", opacity:0.35 }} />
          <div style={{ position:"relative", zIndex:2, color:"#fff", maxWidth:360 }}>
            <div style={{ fontSize:12, fontWeight:600, letterSpacing:2, textTransform:"uppercase", color:"#B8860B", marginBottom:16 }}>Limited Offer</div>
            <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:36, fontWeight:600, lineHeight:1.15, marginBottom:16 }}>
              Up to 40% Off<br/>Winter Collection
            </h3>
            <p style={{ fontSize:14, lineHeight:1.7, opacity:0.75, marginBottom:28 }}>
              Premium outerwear and accessories at exclusive prices. Don't miss this seasonal sale.
            </p>
            <button style={{ background:"#fff", color:"#1a1a1a", border:"none", padding:"14px 32px", borderRadius:100, fontSize:13, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", gap:8, letterSpacing:0.5 }}>
              Shop Sale <ArrowRight />
            </button>
          </div>
        </div>

        {/* Right Card */}
        <div style={{
          position:"relative", borderRadius:24, overflow:"hidden",
          background:"linear-gradient(135deg, #f7f0e3 0%, #ebe3d5 100%)",
          display:"flex", alignItems:"center", padding:56
        }}>
          <img src="https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&h=600&fit=crop" alt=""
            style={{ position:"absolute", right:0, bottom:0, width:"55%", height:"100%", objectFit:"cover", objectPosition:"top" }} />
          <div style={{ position:"relative", zIndex:2, maxWidth:300 }}>
            <div style={{ fontSize:12, fontWeight:600, letterSpacing:2, textTransform:"uppercase", color:"#B8860B", marginBottom:16 }}>New In</div>
            <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:36, fontWeight:600, lineHeight:1.15, marginBottom:16, color:"#1a1a1a" }}>
              Spring Summer<br/>Lookbook
            </h3>
            <p style={{ fontSize:14, lineHeight:1.7, color:"#666", marginBottom:28 }}>
              Fresh silhouettes and vibrant palettes for the new season.
            </p>
            <button className="btn-primary" style={{ padding:"14px 32px", borderRadius:100, fontSize:13, fontWeight:600, display:"flex", alignItems:"center", gap:8, letterSpacing:0.5 }}>
              Explore <ArrowRight />
            </button>
          </div>
        </div>
      </div>
    </section>
  );

  // ── FEATURES ──
  const Features = () => (
    <section style={{ background:"#fff", padding:"64px clamp(20px, 5vw, 80px)", borderTop:"1px solid #eee", borderBottom:"1px solid #eee" }}>
      <div style={{ maxWidth:1400, margin:"0 auto", display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:40 }}>
        {[
          [<TruckIcon />, "Free Shipping", "On all orders over $150"],
          [<ShieldIcon />, "Secure Payment", "100% secure transactions"],
          [<RefreshIcon />, "Easy Returns", "30-day return policy"],
          [<SupportIcon />, "24/7 Support", "Dedicated customer care"],
        ].map(([icon, title, desc], i) => (
          <div key={i} style={{ display:"flex", alignItems:"center", gap:20, padding:"8px 0" }}>
            <div style={{ width:56, height:56, borderRadius:14, background:"#FAFAF8", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, color:"#1a1a1a" }}>
              {icon}
            </div>
            <div>
              <div style={{ fontSize:15, fontWeight:600, color:"#1a1a1a", marginBottom:4 }}>{title}</div>
              <div style={{ fontSize:13, color:"#999", fontWeight:400 }}>{desc}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );

  // ── TESTIMONIAL ──
  const Testimonial = () => (
    <section style={{ padding:"80px clamp(20px, 5vw, 80px)", maxWidth:1400, margin:"0 auto", textAlign:"center" }}>
      <div style={{ fontSize:12, fontWeight:600, letterSpacing:2, textTransform:"uppercase", color:"#B8860B", marginBottom:12 }}>Testimonials</div>
      <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:38, fontWeight:600, letterSpacing:-0.5, marginBottom:48 }}>
        What Our Customers Say
      </h2>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:28 }}>
        {[
          { name: "Sarah M.", role: "Verified Buyer", text: "The quality of the fabrics is exceptional. Every piece I've ordered has exceeded my expectations. Truly premium fashion at reasonable prices.", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face" },
          { name: "James K.", role: "Loyal Customer", text: "Incredible customer service and the clothes fit perfectly. The style guide recommendations helped me build a complete wardrobe effortlessly.", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face" },
          { name: "Emma L.", role: "Fashion Enthusiast", text: "CLOTHE has become my go-to for everything from casual wear to evening outfits. The curated collections always feel fresh and on-trend.", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face" },
        ].map((t, i) => (
          <div key={i} style={{
            background:"#fff", border:"1px solid #eee", borderRadius:20, padding:"36px 32px",
            textAlign:"left", transition:"all 0.3s ease",
          }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 8px 30px rgba(0,0,0,0.06)"; e.currentTarget.style.transform = "translateY(-4px)"; }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            <div style={{ display:"flex", gap:2, marginBottom:16 }}>
              {[1,2,3,4,5].map(s => <StarIcon key={s} filled={true} />)}
            </div>
            <p style={{ fontSize:14, lineHeight:1.75, color:"#555", marginBottom:24, fontStyle:"italic" }}>"{t.text}"</p>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <img src={t.avatar} alt="" style={{ width:44, height:44, borderRadius:"50%", objectFit:"cover" }} />
              <div>
                <div style={{ fontSize:14, fontWeight:600, color:"#1a1a1a" }}>{t.name}</div>
                <div style={{ fontSize:12, color:"#999", fontWeight:400 }}>{t.role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );

  // ── NEWSLETTER ──
  const Newsletter = () => (
    <section style={{ padding:"0 clamp(20px, 5vw, 80px) 80px", maxWidth:1400, margin:"0 auto" }}>
      <div style={{
        background:"#1a1a1a", borderRadius:28, padding:"64px 80px",
        display:"flex", alignItems:"center", justifyContent:"space-between",
        position:"relative", overflow:"hidden"
      }}>
        <div style={{ position:"absolute", top:"-50%", right:"-10%", width:500, height:500, borderRadius:"50%", background:"rgba(184,134,11,0.08)" }} />
        <div style={{ position:"absolute", bottom:"-40%", left:"-5%", width:350, height:350, borderRadius:"50%", background:"rgba(255,255,255,0.03)" }} />
        <div style={{ position:"relative", zIndex:2, maxWidth:440 }}>
          <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:32, fontWeight:600, color:"#fff", lineHeight:1.2, marginBottom:12 }}>
            Subscribe to Our<br/><span style={{ color:"#B8860B" }}>Newsletter</span>
          </h3>
          <p style={{ fontSize:14, color:"rgba(255,255,255,0.6)", lineHeight:1.7 }}>
            Be the first to know about new arrivals, exclusive offers, and style inspiration.
          </p>
        </div>
        <div style={{ position:"relative", zIndex:2, display:"flex", gap:12 }}>
          <input
            type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="Enter your email address"
            style={{
              width:320, padding:"16px 24px", borderRadius:100, border:"1px solid rgba(255,255,255,0.15)",
              background:"rgba(255,255,255,0.06)", color:"#fff", fontSize:14, fontFamily:"'DM Sans',sans-serif",
              outline:"none"
            }}
          />
          <button style={{
            background:"#B8860B", color:"#fff", border:"none", padding:"16px 32px", borderRadius:100,
            fontSize:14, fontWeight:600, cursor:"pointer", letterSpacing:0.5, transition:"all 0.3s ease", whiteSpace:"nowrap"
          }}
          onMouseEnter={e => e.currentTarget.style.background = "#a07409"}
          onMouseLeave={e => e.currentTarget.style.background = "#B8860B"}>
            Subscribe
          </button>
        </div>
      </div>
    </section>
  );

  // ── INSTAGRAM SECTION ──
  const Instagram = () => (
    <section style={{ padding:"0 clamp(20px, 5vw, 80px) 80px", maxWidth:1400, margin:"0 auto", textAlign:"center" }}>
      <div style={{ fontSize:12, fontWeight:600, letterSpacing:2, textTransform:"uppercase", color:"#B8860B", marginBottom:12 }}>@clothe.official</div>
      <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:32, fontWeight:600, letterSpacing:-0.5, marginBottom:36 }}>
        Follow Us on Instagram
      </h2>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(5, 1fr)", gap:12 }}>
        {[
          "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=300&h=300&fit=crop",
          "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=300&h=300&fit=crop",
          "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=300&h=300&fit=crop",
          "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=300&h=300&fit=crop",
          "https://images.unsplash.com/photo-1475180098004-ca77a66827be?w=300&h=300&fit=crop",
        ].map((img, i) => (
          <div key={i} style={{ position:"relative", borderRadius:16, overflow:"hidden", cursor:"pointer", aspectRatio:"1" }}
            onMouseEnter={e => e.currentTarget.querySelector('.ig-overlay').style.opacity = 1}
            onMouseLeave={e => e.currentTarget.querySelector('.ig-overlay').style.opacity = 0}>
            <img src={img} alt="" style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
            <div className="ig-overlay" style={{
              position:"absolute", inset:0, background:"rgba(0,0,0,0.3)", display:"flex", alignItems:"center", justifyContent:"center",
              opacity:0, transition:"opacity 0.3s ease"
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="0">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="none" stroke="white" strokeWidth="2"/>
                <circle cx="12" cy="12" r="5" fill="none" stroke="white" strokeWidth="2"/>
                <circle cx="17.5" cy="6.5" r="1.5"/>
              </svg>
            </div>
          </div>
        ))}
      </div>
    </section>
  );

  // ── FOOTER ──
  const Footer = () => (
    <footer style={{ background:"#1a1a1a", color:"#fff", padding:"64px clamp(20px, 5vw, 80px) 32px" }}>
      <div style={{ maxWidth:1400, margin:"0 auto" }}>
        <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr", gap:48, marginBottom:56 }}>
          {/* Brand */}
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:20 }}>
              <div style={{ width:36, height:36, background:"#fff", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <span style={{ color:"#1a1a1a", fontFamily:"'Playfair Display',serif", fontWeight:700, fontSize:18 }}>C</span>
              </div>
              <span style={{ fontFamily:"'Playfair Display',serif", fontWeight:600, fontSize:22, letterSpacing:-0.5 }}>CLOTHE</span>
            </div>
            <p style={{ fontSize:14, lineHeight:1.8, color:"rgba(255,255,255,0.5)", maxWidth:300, marginBottom:24 }}>
              Your destination for premium fashion. Curated collections that blend timeless elegance with contemporary style.
            </p>
            <div style={{ display:"flex", gap:12 }}>
              {["M", "f", "in", "P"].map((s, i) => (
                <div key={i} style={{ width:40, height:40, borderRadius:10, border:"1px solid rgba(255,255,255,0.12)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", fontSize:14, fontWeight:600, transition:"all 0.3s ease" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
                  {s}
                </div>
              ))}
            </div>
          </div>
          {/* Links */}
          {[
            { title: "Shop", links: ["New Arrivals", "Best Sellers", "Sale", "Collections", "Lookbook"] },
            { title: "Company", links: ["About Us", "Careers", "Press", "Sustainability", "Stores"] },
            { title: "Help", links: ["Contact Us", "FAQs", "Shipping", "Returns", "Size Guide"] },
          ].map(col => (
            <div key={col.title}>
              <h4 style={{ fontSize:14, fontWeight:600, letterSpacing:1, textTransform:"uppercase", marginBottom:24, color:"#fff" }}>{col.title}</h4>
              {col.links.map(link => (
                <a key={link} style={{ display:"block", fontSize:14, color:"rgba(255,255,255,0.5)", textDecoration:"none", marginBottom:14, cursor:"pointer", transition:"color 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.color = "#fff"}
                  onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.5)"}>
                  {link}
                </a>
              ))}
            </div>
          ))}
        </div>
        <div style={{ borderTop:"1px solid rgba(255,255,255,0.08)", paddingTop:24, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ fontSize:13, color:"rgba(255,255,255,0.35)" }}>© 2025 CLOTHE. All rights reserved.</span>
          <div style={{ display:"flex", gap:24 }}>
            {["Privacy Policy", "Terms of Service", "Cookie Settings"].map(link => (
              <a key={link} style={{ fontSize:13, color:"rgba(255,255,255,0.35)", textDecoration:"none", cursor:"pointer" }}>{link}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );

  // ── RENDER ──
  return (
    <div style={{ minHeight:"100vh", background:"#FAFAF8" }}>
      <TopBar />
      <Navbar />
      <Hero />
      <BrandMarquee />
      <Categories />
      <Products />
      <PromoBanner />
      <Features />
      <Testimonial />
      <Newsletter />
      <Instagram />
      <Footer />
    </div>
  );
}
