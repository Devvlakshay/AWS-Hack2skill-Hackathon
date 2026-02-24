import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-accent-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight">
              Try Before You Buy with{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-accent-600">
                AI-Powered
              </span>{" "}
              Virtual Try-On
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-gray-600 leading-relaxed">
              FitView AI brings the fitting room to your screen. Select a model,
              choose your outfit, and see how it looks — powered by cutting-edge
              generative AI, built for Indian retail.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="bg-primary-600 hover:bg-primary-700 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors duration-200 text-lg shadow-lg shadow-primary-200"
              >
                Get Started Free
              </Link>
              <Link
                href="/login"
                className="border-2 border-gray-300 hover:border-primary-400 text-gray-700 hover:text-primary-600 font-semibold px-8 py-3.5 rounded-xl transition-all duration-200 text-lg"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative gradient orbs */}
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-accent-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              How It Works
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Three simple steps to your perfect outfit
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center p-8 rounded-2xl bg-gray-50 hover:bg-primary-50 transition-colors duration-300">
              <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-2xl flex items-center justify-center mx-auto text-2xl font-bold">
                1
              </div>
              <h3 className="mt-6 text-xl font-semibold text-gray-900">
                Choose a Model
              </h3>
              <p className="mt-3 text-gray-600">
                Select from brand-provided models that match your body type, size,
                and preferences.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center p-8 rounded-2xl bg-gray-50 hover:bg-primary-50 transition-colors duration-300">
              <div className="w-16 h-16 bg-accent-100 text-accent-600 rounded-2xl flex items-center justify-center mx-auto text-2xl font-bold">
                2
              </div>
              <h3 className="mt-6 text-xl font-semibold text-gray-900">
                Pick Your Outfit
              </h3>
              <p className="mt-3 text-gray-600">
                Browse through a curated catalog of clothing from top Indian
                retailers and brands.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center p-8 rounded-2xl bg-gray-50 hover:bg-primary-50 transition-colors duration-300">
              <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-2xl flex items-center justify-center mx-auto text-2xl font-bold">
                3
              </div>
              <h3 className="mt-6 text-xl font-semibold text-gray-900">
                See the Magic
              </h3>
              <p className="mt-3 text-gray-600">
                Our AI generates a photorealistic try-on image in seconds. Compare,
                save, and shop with confidence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-accent-600">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Ready to Transform Your Shopping Experience?
          </h2>
          <p className="mt-4 text-lg text-primary-100">
            Join thousands of customers and retailers already using FitView AI.
          </p>
          <Link
            href="/register"
            className="mt-8 inline-block bg-white hover:bg-gray-100 text-primary-600 font-semibold px-8 py-3.5 rounded-xl transition-colors duration-200 text-lg"
          >
            Start For Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-gray-900 text-gray-400">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm">
          <p>
            FitView AI — AI for Bharat 2025 | Built for Indian Retail
          </p>
        </div>
      </footer>
    </div>
  );
}
