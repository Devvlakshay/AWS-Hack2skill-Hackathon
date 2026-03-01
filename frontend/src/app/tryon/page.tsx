"use client";

/**
 * Virtual Try-On Page for FitView AI.
 * Phase 3: Core Virtual Try-On Engine.
 *
 * Flow: Select Model -> Select Product -> Generate Try-On -> View Result
 */

import React, { Suspense, useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/lib/store/authStore";
import { useTryOnStore } from "@/lib/store/tryonStore";
import { getModels, type FashionModel } from "@/lib/api/models";
import { getProducts, type Product } from "@/lib/api/products";

type Step = "select-model" | "select-product" | "generating" | "result";

export default function TryOnPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-950 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" /></div>}>
      <TryOnPageInner />
    </Suspense>
  );
}

function TryOnPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, hydrate } = useAuthStore();
  const {
    currentResult,
    isGenerating,
    generateError,
    selectedModelId,
    selectedProductId,
    setSelectedModel,
    setSelectedProduct,
    generate,
    clearResult,
    clearError,
    toggleFavorite,
  } = useTryOnStore();

  const [step, setStep] = useState<Step>("select-model");
  const [models, setModels] = useState<FashionModel[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingModels, setLoadingModels] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Filters for models
  const [genderFilter, setGenderFilter] = useState("");
  const [bodyTypeFilter, setBodyTypeFilter] = useState("");
  const [skinToneFilter, setSkinToneFilter] = useState("");
  const [sizeFilter, setSizeFilter] = useState("");

  // Filters for products
  const [categoryFilter, setCategoryFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Result view state
  const [showBeforeAfter, setShowBeforeAfter] = useState(false);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  // Pre-select product if passed via URL
  useEffect(() => {
    const productId = searchParams.get("product");
    if (productId) {
      setSelectedProduct(productId);
    }
  }, [searchParams, setSelectedProduct]);

  // Fetch models on mount
  useEffect(() => {
    fetchModels();
  }, [genderFilter, bodyTypeFilter, skinToneFilter, sizeFilter]);

  const fetchModels = useCallback(async () => {
    setLoadingModels(true);
    try {
      const filters: Record<string, string> = {};
      if (bodyTypeFilter) filters.body_type = bodyTypeFilter;
      if (skinToneFilter) filters.skin_tone = skinToneFilter;
      if (sizeFilter) filters.size = sizeFilter;
      const data = await getModels({ ...filters, limit: 50 });
      let filteredModels = data.models;
      if (genderFilter) {
        filteredModels = filteredModels.filter((m) => m.gender === genderFilter);
      }
      setModels(filteredModels);
    } catch {
      setModels([]);
    }
    setLoadingModels(false);
  }, [genderFilter, bodyTypeFilter, skinToneFilter, sizeFilter]);

  const fetchProducts = useCallback(async () => {
    setLoadingProducts(true);
    try {
      const filters: Record<string, any> = { limit: 50 };
      if (categoryFilter) filters.category = categoryFilter;
      if (searchQuery) filters.search = searchQuery;
      const data = await getProducts(filters);
      setProducts(data.products);
    } catch {
      setProducts([]);
    }
    setLoadingProducts(false);
  }, [categoryFilter, searchQuery]);

  useEffect(() => {
    if (step === "select-product") {
      fetchProducts();
    }
  }, [step, fetchProducts]);

  // Handle generation state
  useEffect(() => {
    if (isGenerating) {
      setStep("generating");
    } else if (currentResult) {
      setStep("result");
    }
  }, [isGenerating, currentResult]);

  const handleModelSelect = (modelId: string) => {
    setSelectedModel(modelId);
    // If product was pre-selected via URL, skip to generation
    if (selectedProductId) {
      setStep("select-product");
    } else {
      setStep("select-product");
    }
  };

  const handleProductSelect = (productId: string) => {
    setSelectedProduct(productId);
  };

  const handleGenerate = async () => {
    clearError();
    await generate();
  };

  const handleStartOver = () => {
    clearResult();
    setSelectedModel(null);
    setSelectedProduct(null);
    setStep("select-model");
  };

  const handleTryAnother = () => {
    clearResult();
    setStep("select-product");
  };

  const selectedModel = models.find((m) => m._id === selectedModelId || m.id === selectedModelId);
  const selectedProductObj = products.find(
    (p) => p._id === selectedProductId || p.id === selectedProductId
  );

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Virtual Try-On</h1>
              <p className="text-gray-400 text-sm mt-1">
                Select a model and garment to see how it looks
              </p>
            </div>
            <Link
              href="/tryon/history"
              className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              View History
            </Link>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center gap-3 mt-4">
            {[
              { key: "select-model", label: "1. Select Model" },
              { key: "select-product", label: "2. Select Garment" },
              { key: "result", label: "3. View Result" },
            ].map((s, i) => {
              const isActive =
                step === s.key ||
                (step === "generating" && s.key === "result");
              const isPast =
                (s.key === "select-model" && step !== "select-model") ||
                (s.key === "select-product" &&
                  (step === "generating" || step === "result"));
              return (
                <React.Fragment key={s.key}>
                  {i > 0 && (
                    <div
                      className={`flex-1 h-0.5 ${
                        isPast || isActive ? "bg-indigo-600" : "bg-gray-700"
                      }`}
                    />
                  )}
                  <span
                    className={`text-xs font-medium px-3 py-1 rounded-full whitespace-nowrap ${
                      isActive
                        ? "bg-indigo-600 text-white"
                        : isPast
                        ? "bg-indigo-900/50 text-indigo-400"
                        : "bg-gray-800 text-gray-500"
                    }`}
                  >
                    {s.label}
                  </span>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Step 1: Model Selection */}
        {step === "select-model" && (
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <select
                value={genderFilter}
                onChange={(e) => setGenderFilter(e.target.value)}
                className="bg-gray-800 text-gray-200 border border-gray-700 rounded-lg px-3 py-2 text-sm"
              >
                <option value="">All Genders</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
              </select>
              <select
                value={bodyTypeFilter}
                onChange={(e) => setBodyTypeFilter(e.target.value)}
                className="bg-gray-800 text-gray-200 border border-gray-700 rounded-lg px-3 py-2 text-sm"
              >
                <option value="">All Body Types</option>
                <option value="slim">Slim</option>
                <option value="average">Average</option>
                <option value="athletic">Athletic</option>
                <option value="curvy">Curvy</option>
                <option value="plus_size">Plus Size</option>
              </select>
              <select
                value={skinToneFilter}
                onChange={(e) => setSkinToneFilter(e.target.value)}
                className="bg-gray-800 text-gray-200 border border-gray-700 rounded-lg px-3 py-2 text-sm"
              >
                <option value="">All Skin Tones</option>
                <option value="fair">Fair</option>
                <option value="medium">Medium</option>
                <option value="olive">Olive</option>
                <option value="brown">Brown</option>
                <option value="dark">Dark</option>
              </select>
              <select
                value={sizeFilter}
                onChange={(e) => setSizeFilter(e.target.value)}
                className="bg-gray-800 text-gray-200 border border-gray-700 rounded-lg px-3 py-2 text-sm"
              >
                <option value="">All Sizes</option>
                <option value="S">S</option>
                <option value="M">M</option>
                <option value="L">L</option>
                <option value="XL">XL</option>
                <option value="XXL">XXL</option>
              </select>
            </div>

            {loadingModels ? (
              <div className="flex justify-center py-16">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
              </div>
            ) : models.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                No models available. Ask a retailer to upload models.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {models.map((model) => (
                  <button
                    key={model._id}
                    onClick={() => handleModelSelect(model._id)}
                    className={`group relative bg-gray-900 rounded-xl border-2 overflow-hidden transition-all hover:scale-[1.02] ${
                      selectedModelId === model._id
                        ? "border-indigo-600 ring-2 ring-indigo-600/30"
                        : "border-gray-800 hover:border-gray-700"
                    }`}
                  >
                    <div className="aspect-[3/4] bg-gray-800">
                      {model.image_url ? (
                        <img
                          src={model.image_url}
                          alt={model.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-12 h-12 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-white font-medium text-sm truncate">{model.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-1.5 py-0.5 rounded ${model.gender === "male" ? "bg-blue-900/50 text-blue-400" : "bg-pink-900/50 text-pink-400"}`}>
                          {model.gender === "male" ? "M" : "F"}
                        </span>
                        <span className="text-xs text-gray-400 capitalize">{model.body_type.replace("_", " ")}</span>
                        <span className="text-gray-600">|</span>
                        <span className="text-xs text-gray-400">{model.size}</span>
                      </div>
                    </div>
                    {selectedModelId === model._id && (
                      <div className="absolute top-2 right-2 bg-indigo-600 rounded-full p-1">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Product Selection */}
        {step === "select-product" && (
          <div>
            {/* Selected Model Summary */}
            {selectedModel && (
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 mb-6 flex items-center gap-4">
                <div className="w-16 h-20 rounded-lg overflow-hidden bg-gray-800 flex-shrink-0">
                  {selectedModel.image_url ? (
                    <img src={selectedModel.image_url} alt={selectedModel.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">{selectedModel.name}</p>
                  <p className="text-gray-400 text-sm">
                    {selectedModel.body_type.replace("_", " ")} | {selectedModel.size} | {selectedModel.height_cm}cm
                  </p>
                </div>
                <button
                  onClick={() => setStep("select-model")}
                  className="text-sm text-indigo-400 hover:text-indigo-300"
                >
                  Change
                </button>
              </div>
            )}

            {/* Product filters */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <input
                type="text"
                placeholder="Search garments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-gray-800 text-gray-200 border border-gray-700 rounded-lg px-3 py-2 text-sm flex-1 min-w-[200px]"
              />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-gray-800 text-gray-200 border border-gray-700 rounded-lg px-3 py-2 text-sm"
              >
                <option value="">All Categories</option>
                <option value="Kurtas">Kurtas</option>
                <option value="Shirts">Shirts</option>
                <option value="Ethnic Wear">Ethnic Wear</option>
                <option value="Jeans">Jeans</option>
                <option value="Sarees">Sarees</option>
                <option value="T-Shirts">T-Shirts</option>
                <option value="Jackets">Jackets</option>
              </select>
            </div>

            {loadingProducts ? (
              <div className="flex justify-center py-16">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                No products found. Try adjusting your filters.
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {products.map((product) => {
                    const firstImage = product.images?.[0];
                    const isSelected =
                      selectedProductId === product._id || selectedProductId === product.id;
                    return (
                      <button
                        key={product._id}
                        onClick={() => handleProductSelect(product._id)}
                        className={`group relative bg-gray-900 rounded-xl border-2 overflow-hidden transition-all hover:scale-[1.02] text-left ${
                          isSelected
                            ? "border-indigo-600 ring-2 ring-indigo-600/30"
                            : "border-gray-800 hover:border-gray-700"
                        }`}
                      >
                        <div className="aspect-[3/4] bg-gray-800">
                          {firstImage ? (
                            <img src={firstImage} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <svg className="w-12 h-12 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="p-3">
                          <p className="text-white font-medium text-sm truncate">{product.name}</p>
                          <p className="text-indigo-400 text-sm font-semibold mt-1">
                            {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(product.price)}
                          </p>
                        </div>
                        {isSelected && (
                          <div className="absolute top-2 right-2 bg-indigo-600 rounded-full p-1">
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Generate Button */}
                {selectedProductId && (
                  <div className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur border-t border-gray-800 p-4 z-50">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                      <div className="text-sm text-gray-400">
                        {selectedModel?.name} + {selectedProductObj?.name || "Selected garment"}
                      </div>
                      <button
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Generate Try-On
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Step 3: Generating */}
        {step === "generating" && (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="relative">
              <div className="w-24 h-24 rounded-full border-4 border-gray-800 border-t-indigo-600 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-10 h-10 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
            </div>
            <h2 className="text-xl font-semibold text-white mt-8">Generating Your Try-On</h2>
            <p className="text-gray-400 mt-2 text-center max-w-md">
              Our AI is creating a photorealistic try-on image. This typically takes 8-10 seconds.
            </p>
            <div className="mt-6 flex items-center gap-2 text-sm text-gray-500">
              <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
              Processing with Nano Banana AI
            </div>
          </div>
        )}

        {/* Error State */}
        {generateError && step !== "generating" && (
          <div className="bg-red-900/20 border border-red-800 rounded-xl p-6 mb-6">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <p className="text-red-400 font-medium">Generation Failed</p>
                <p className="text-red-300/80 text-sm mt-1">{generateError}</p>
              </div>
            </div>
            <button
              onClick={handleStartOver}
              className="mt-4 text-sm text-indigo-400 hover:text-indigo-300"
            >
              Start Over
            </button>
          </div>
        )}

        {/* Step 4: Result Viewer */}
        {step === "result" && currentResult && (
          <div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Result Image */}
              <div className="relative">
                <div className="aspect-[3/4] bg-gray-900 rounded-2xl overflow-hidden border border-gray-800">
                  <img
                    src={currentResult.result_url}
                    alt="Try-on result"
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Before/After Toggle */}
                {showBeforeAfter && (
                  <div className="absolute inset-0 grid grid-cols-2 gap-1 rounded-2xl overflow-hidden">
                    <div className="relative bg-gray-900">
                      <img
                        src={currentResult.model_image_url}
                        alt="Original model"
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                        Before
                      </span>
                    </div>
                    <div className="relative bg-gray-900">
                      <img
                        src={currentResult.result_url}
                        alt="Try-on result"
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-2 right-2 bg-indigo-600/80 text-white text-xs px-2 py-1 rounded">
                        After
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Result Details */}
              <div>
                <h2 className="text-2xl font-bold text-white">Try-On Result</h2>
                <p className="text-gray-400 mt-1">
                  Generated in {currentResult.processing_time_ms}ms
                </p>

                {/* Model + Product Info */}
                <div className="mt-6 space-y-4">
                  <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 flex items-center gap-4">
                    <div className="w-14 h-18 rounded-lg overflow-hidden bg-gray-800 flex-shrink-0">
                      {currentResult.model_image_url && (
                        <img src={currentResult.model_image_url} alt="Model" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Model</p>
                      <p className="text-white font-medium">{currentResult.model_name}</p>
                    </div>
                  </div>
                  <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 flex items-center gap-4">
                    <div className="w-14 h-18 rounded-lg overflow-hidden bg-gray-800 flex-shrink-0">
                      {currentResult.product_image_url && (
                        <img src={currentResult.product_image_url} alt="Garment" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Garment</p>
                      <p className="text-white font-medium">{currentResult.product_name}</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-8 space-y-3">
                  <button
                    onClick={() => setShowBeforeAfter(!showBeforeAfter)}
                    className="w-full bg-gray-800 text-white py-3 px-6 rounded-xl font-medium hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                    {showBeforeAfter ? "Hide" : "Show"} Before / After
                  </button>

                  <button
                    onClick={() =>
                      toggleFavorite(
                        currentResult._id || currentResult.id,
                        !currentResult.is_favorite
                      )
                    }
                    className={`w-full py-3 px-6 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 ${
                      currentResult.is_favorite
                        ? "bg-pink-600/20 text-pink-400 border border-pink-800 hover:bg-pink-600/30"
                        : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                    }`}
                  >
                    <svg
                      className="w-5 h-5"
                      fill={currentResult.is_favorite ? "currentColor" : "none"}
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    {currentResult.is_favorite ? "Saved to Favorites" : "Add to Favorites"}
                  </button>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={handleTryAnother}
                      className="bg-indigo-600 text-white py-3 px-6 rounded-xl font-medium hover:bg-indigo-700 transition-colors text-center"
                    >
                      Try Another Garment
                    </button>
                    <button
                      onClick={handleStartOver}
                      className="border border-gray-700 text-gray-300 py-3 px-6 rounded-xl font-medium hover:bg-gray-800 transition-colors text-center"
                    >
                      Start Over
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
