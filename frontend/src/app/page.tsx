import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[rgb(var(--bg-primary))] min-h-[90vh] flex items-center">
        {/* Gradient mesh background orbs */}
        <div className="absolute top-[-10%] left-[15%] w-[500px] h-[500px] bg-violet-600/15 rounded-full filter blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[10%] w-[400px] h-[400px] bg-amber-500/10 rounded-full filter blur-[120px] animate-pulse" />
        <div className="absolute top-[40%] right-[30%] w-[300px] h-[300px] bg-violet-500/10 rounded-full filter blur-[100px] animate-pulse" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 relative z-10 w-full">
          <div className="glass-card-lg p-10 sm:p-14 text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[rgb(var(--text-primary))] tracking-tight">
              Try Before You Buy with{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-amber-400">
                AI-Powered
              </span>{" "}
              Virtual Try-On
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-[rgb(var(--text-muted))] leading-relaxed">
              FitView AI brings the fitting room to your screen. Select a model,
              choose your outfit, and see how it looks — powered by cutting-edge
              generative AI, built for Indian retail.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="btn-primary text-lg px-8 py-3.5"
              >
                Get Started Free
              </Link>
              <Link
                href="/login"
                className="btn-secondary text-lg px-8 py-3.5"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-[rgb(var(--bg-secondary))]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-[rgb(var(--text-primary))]">
              How It Works
            </h2>
            <p className="mt-4 text-lg text-[rgb(var(--text-muted))]">
              Three simple steps to your perfect outfit
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="glass-card text-center p-8 hover:-translate-y-2 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-violet-700 text-white rounded-2xl flex items-center justify-center mx-auto text-2xl font-bold shadow-lg shadow-violet-500/20">
                1
              </div>
              <h3 className="mt-6 text-xl font-semibold text-[rgb(var(--text-primary))]">
                Choose a Model
              </h3>
              <p className="mt-3 text-[rgb(var(--text-muted))]">
                Select from brand-provided models that match your body type, size,
                and preferences.
              </p>
            </div>

            {/* Step 2 */}
            <div className="glass-card text-center p-8 hover:-translate-y-2 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-700 text-white rounded-2xl flex items-center justify-center mx-auto text-2xl font-bold shadow-lg shadow-amber-500/20">
                2
              </div>
              <h3 className="mt-6 text-xl font-semibold text-[rgb(var(--text-primary))]">
                Pick Your Outfit
              </h3>
              <p className="mt-3 text-[rgb(var(--text-muted))]">
                Browse through a curated catalog of clothing from top Indian
                retailers and brands.
              </p>
            </div>

            {/* Step 3 */}
            <div className="glass-card text-center p-8 hover:-translate-y-2 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-amber-500 text-white rounded-2xl flex items-center justify-center mx-auto text-2xl font-bold shadow-lg shadow-violet-500/20">
                3
              </div>
              <h3 className="mt-6 text-xl font-semibold text-[rgb(var(--text-primary))]">
                See the Magic
              </h3>
              <p className="mt-3 text-[rgb(var(--text-muted))]">
                Our AI generates a photorealistic try-on image in seconds. Compare,
                save, and shop with confidence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden bg-[rgb(var(--bg-primary))]">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-600/10 to-amber-600/10" />
        <div className="absolute top-0 left-[20%] w-[400px] h-[400px] bg-violet-500/10 rounded-full filter blur-[100px]" />
        <div className="absolute bottom-0 right-[20%] w-[300px] h-[300px] bg-amber-500/10 rounded-full filter blur-[100px]" />

        <div className="max-w-4xl mx-auto text-center px-4 relative z-10">
          <div className="glass-card-lg p-10 sm:p-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-[rgb(var(--text-primary))]">
              Ready to Transform Your Shopping Experience?
            </h2>
            <p className="mt-4 text-lg text-[rgb(var(--text-secondary))]">
              Join thousands of customers and retailers already using FitView AI.
            </p>
            <Link
              href="/register"
              className="btn-accent mt-8 inline-block text-lg px-8 py-3.5"
            >
              Start For Free
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 glass-card rounded-none border-x-0 border-b-0 border-t border-t-[rgba(var(--glass-border))]">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm">
          <p className="text-[rgb(var(--text-muted))]">
            FitView AI — AI for Bharat 2025 | Built for Indian Retail
          </p>
        </div>
      </footer>
    </div>
  );
}
