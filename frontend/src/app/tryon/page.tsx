"use client";

/**
 * Virtual Try-On Page for FitView AI.
 * Phase 3: Core Virtual Try-On Engine.
 *
 * Flow: Select Model (or upload photo) -> Select Product -> Generate Try-On -> View Result
 */

import React, { Suspense, useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useAuthStore } from "@/lib/store/authStore";
import { useTryOnStore } from "@/lib/store/tryonStore";
import { getModels, type FashionModel } from "@/lib/api/models";
import { getProducts, type Product } from "@/lib/api/products";

// Lazy load 3D viewer to avoid SSR issues and reduce initial bundle
const ThreeDViewer = dynamic(() => import("@/components/ThreeDViewer"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[400px] flex items-center justify-center glass-card rounded-2xl">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600" />
    </div>
  ),
});

type Step = "select-model" | "select-product" | "generating" | "result";

export default function TryOnPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[rgb(var(--bg-primary))] flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600" /></div>}>
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
    selectedProductIds,
    batchResults,
    userPhoto,
    userPhotoPreview,
    setSelectedModel,
    setSelectedProduct,
    toggleProductSelection,
    clearProductSelection,
    setUserPhoto,
    clearUserPhoto,
    generate,
    generateBatch,
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
  const [show3DView, setShow3DView] = useState(false);
  const [resultTab, setResultTab] = useState<"combined" | "individual">("combined");

  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const fetchProductsData = useCallback(async () => {
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
      fetchProductsData();
    }
  }, [step, fetchProductsData]);

  // Handle generation state
  useEffect(() => {
    if (isGenerating) {
      setStep("generating");
    } else if (currentResult || batchResults) {
      setStep("result");
    }
  }, [isGenerating, currentResult, batchResults]);

  const handleModelSelect = (modelId: string) => {
    clearUserPhoto();
    setSelectedModel(modelId);
    // If product was pre-selected via URL, skip to generation
    if (selectedProductId) {
      setStep("select-product");
    } else {
      setStep("select-product");
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side validation
    const allowedTypes = ["image/jpeg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      alert("Please upload a JPEG or PNG image.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert("File size exceeds 10MB limit.");
      return;
    }

    setUserPhoto(file);
    setStep("select-product");
  };

  const handlePhotoCardClick = () => {
    fileInputRef.current?.click();
  };

  const handleProductSelect = (productId: string) => {
    toggleProductSelection(productId);
  };

  const handleGenerate = async () => {
    clearError();
    if (selectedProductIds.length > 1) {
      await generateBatch();
    } else if (selectedProductIds.length === 1) {
      setSelectedProduct(selectedProductIds[0]);
      await generate();
    } else if (selectedProductId) {
      await generate();
    }
  };

  const handleStartOver = () => {
    clearResult();
    clearUserPhoto();
    clearProductSelection();
    setSelectedModel(null);
    setSelectedProduct(null);
    setStep("select-model");
    setShow3DView(false);
    setShowBeforeAfter(false);
    setResultTab("combined");
  };

  const handleTryAnother = () => {
    clearResult();
    clearProductSelection();
    setStep("select-product");
    setShow3DView(false);
    setShowBeforeAfter(false);
    setResultTab("combined");
  };

  const selectedModel = models.find((m) => m._id === selectedModelId || m.id === selectedModelId);
  const selectedProductObj = products.find(
    (p) => p._id === selectedProductId || p.id === selectedProductId
  );

  const isUserPhotoMode = selectedModelId === "user_upload" && userPhoto !== null;

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-[rgb(var(--bg-primary))]">
      {/* Hidden file input for photo upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png"
        className="hidden"
        onChange={handlePhotoUpload}
      />

      {/* Header */}
      <div className="glass-card border-b border-[rgba(var(--glass-border))] rounded-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[rgb(var(--text-primary))]">Virtual Try-On</h1>
              <p className="text-[rgb(var(--text-muted))] text-sm mt-1">
                Select a model and garment to see how it looks
              </p>
            </div>
            <Link
              href="/tryon/history"
              className="text-sm text-violet-400 hover:text-violet-300 flex items-center gap-1"
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
                      className={`flex-1 h-0.5 transition-colors ${
                        isPast || isActive ? "bg-violet-600" : "bg-[rgba(var(--glass-border))]"
                      }`}
                    />
                  )}
                  <span
                    className={`text-xs font-medium px-3 py-1 rounded-full whitespace-nowrap transition-all backdrop-blur-sm ${
                      isActive
                        ? "bg-violet-600 text-white shadow-glow-violet"
                        : isPast
                        ? "bg-violet-500/20 text-violet-400 border border-violet-500/30"
                        : "glass-card text-[rgb(var(--text-muted))]"
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
            {/* Upload Your Photo Card */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-[rgb(var(--text-muted))] uppercase tracking-wider mb-3">
                Use Your Own Photo
              </h3>
              <button
                onClick={handlePhotoCardClick}
                className={`w-full sm:w-auto group relative glass-card rounded-xl border-2 overflow-hidden transition-all hover:scale-[1.01] ${
                  isUserPhotoMode
                    ? "!border-violet-500 shadow-glow-violet"
                    : "border-dashed !border-[rgba(var(--glass-border))] hover:!border-violet-500/50"
                }`}
              >
                <div className="flex items-center gap-4 p-4">
                  <div className="w-16 h-20 rounded-lg overflow-hidden bg-[rgb(var(--bg-secondary))] flex-shrink-0 flex items-center justify-center">
                    {userPhotoPreview ? (
                      <img
                        src={userPhotoPreview}
                        alt="Your photo"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <svg className="w-8 h-8 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    )}
                  </div>
                  <div className="text-left">
                    <p className="text-[rgb(var(--text-primary))] font-medium">
                      {userPhotoPreview ? "Photo Uploaded" : "Upload Your Photo"}
                    </p>
                    <p className="text-[rgb(var(--text-muted))] text-sm mt-0.5">
                      {userPhotoPreview
                        ? "Click to change photo, or select a garment below"
                        : "JPEG or PNG, min 512x512, max 10MB"}
                    </p>
                  </div>
                  {isUserPhotoMode && (
                    <div className="ml-auto bg-violet-600 rounded-full p-1">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
              </button>
              {isUserPhotoMode && (
                <div className="mt-2 flex items-center gap-3">
                  <button
                    onClick={() => setStep("select-product")}
                    className="btn-primary text-sm px-4 py-2 rounded-lg"
                  >
                    Continue to Select Garment
                  </button>
                  <button
                    onClick={() => {
                      clearUserPhoto();
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="text-sm text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text-secondary))]"
                  >
                    Remove Photo
                  </button>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-px bg-[rgba(var(--glass-border))]" />
              <span className="text-xs text-[rgb(var(--text-muted))] uppercase tracking-wider">Or select a model</span>
              <div className="flex-1 h-px bg-[rgba(var(--glass-border))]" />
            </div>

            <div className="flex flex-wrap items-center gap-3 mb-6">
              <select
                value={genderFilter}
                onChange={(e) => setGenderFilter(e.target.value)}
                className="glass-input rounded-lg px-3 py-2 text-sm"
              >
                <option value="">All Genders</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
              </select>
              <select
                value={bodyTypeFilter}
                onChange={(e) => setBodyTypeFilter(e.target.value)}
                className="glass-input rounded-lg px-3 py-2 text-sm"
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
                className="glass-input rounded-lg px-3 py-2 text-sm"
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
                className="glass-input rounded-lg px-3 py-2 text-sm"
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
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600" />
              </div>
            ) : models.length === 0 ? (
              <div className="text-center py-16 text-[rgb(var(--text-muted))]">
                No models available. Ask a retailer to upload models.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {models.map((model) => (
                  <button
                    key={model._id}
                    onClick={() => handleModelSelect(model._id)}
                    className={`group relative glass-card rounded-xl border-2 overflow-hidden transition-all hover:scale-[1.02] ${
                      selectedModelId === model._id
                        ? "!border-violet-500 shadow-glow-violet"
                        : "!border-transparent hover:!border-violet-500/30"
                    }`}
                  >
                    <div className="aspect-[3/4] bg-[rgb(var(--bg-secondary))]">
                      {model.image_url ? (
                        <img
                          src={model.image_url}
                          alt={model.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-12 h-12 text-[rgb(var(--text-muted))]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-[rgb(var(--text-primary))] font-medium text-sm truncate">{model.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-1.5 py-0.5 rounded backdrop-blur-sm ${model.gender === "male" ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" : "bg-pink-500/20 text-pink-400 border border-pink-500/30"}`}>
                          {model.gender === "male" ? "M" : "F"}
                        </span>
                        <span className="text-xs text-[rgb(var(--text-muted))] capitalize">{model.body_type.replace("_", " ")}</span>
                        <span className="text-[rgba(var(--glass-border))]">|</span>
                        <span className="text-xs text-[rgb(var(--text-muted))]">{model.size}</span>
                      </div>
                    </div>
                    {selectedModelId === model._id && (
                      <div className="absolute top-2 right-2 bg-violet-600 rounded-full p-1">
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
            {/* Selected Model / Photo Summary */}
            <div className="glass-card rounded-xl p-4 mb-6 flex items-center gap-4">
              <div className="w-16 h-20 rounded-lg overflow-hidden bg-[rgb(var(--bg-secondary))] flex-shrink-0">
                {isUserPhotoMode && userPhotoPreview ? (
                  <img src={userPhotoPreview} alt="Your photo" className="w-full h-full object-cover" />
                ) : selectedModel?.image_url ? (
                  <img src={selectedModel.image_url} alt={selectedModel.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-[rgb(var(--text-muted))]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className="text-[rgb(var(--text-primary))] font-medium">
                  {isUserPhotoMode ? "Your Photo" : selectedModel?.name}
                </p>
                <p className="text-[rgb(var(--text-muted))] text-sm">
                  {isUserPhotoMode
                    ? "User uploaded photo"
                    : selectedModel
                    ? `${selectedModel.body_type.replace("_", " ")} | ${selectedModel.size} | ${selectedModel.height_cm}cm`
                    : ""}
                </p>
              </div>
              <button
                onClick={() => setStep("select-model")}
                className="text-sm text-violet-400 hover:text-violet-300"
              >
                Change
              </button>
            </div>

            {/* Product filters */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <input
                type="text"
                placeholder="Search garments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="glass-input rounded-lg px-3 py-2 text-sm flex-1 min-w-[200px]"
              />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="glass-input rounded-lg px-3 py-2 text-sm"
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
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600" />
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-16 text-[rgb(var(--text-muted))]">
                No products found. Try adjusting your filters.
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {products.map((product) => {
                    const firstImage = product.images?.[0];
                    const isSelected = selectedProductIds.includes(product._id) || selectedProductIds.includes(product.id);
                    const selIndex = selectedProductIds.indexOf(product._id) !== -1
                      ? selectedProductIds.indexOf(product._id)
                      : selectedProductIds.indexOf(product.id);
                    return (
                      <button
                        key={product._id}
                        onClick={() => handleProductSelect(product._id)}
                        className={`group relative glass-card rounded-xl border-2 overflow-hidden transition-all hover:scale-[1.02] text-left ${
                          isSelected
                            ? "!border-violet-500 shadow-glow-violet"
                            : "!border-transparent hover:!border-violet-500/30"
                        }`}
                      >
                        <div className="aspect-[3/4] bg-[rgb(var(--bg-secondary))]">
                          {firstImage ? (
                            <img src={firstImage} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <svg className="w-12 h-12 text-[rgb(var(--text-muted))]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="p-3">
                          <p className="text-[rgb(var(--text-primary))] font-medium text-sm truncate">{product.name}</p>
                          <p className="text-amber-400 text-sm font-semibold mt-1">
                            {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(product.price)}
                          </p>
                        </div>
                        {isSelected && (
                          <div className="absolute top-2 right-2 bg-violet-600 rounded-full w-7 h-7 flex items-center justify-center">
                            {selectedProductIds.length > 1 ? (
                              <span className="text-white text-xs font-bold">{selIndex + 1}</span>
                            ) : (
                              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Generate Button */}
                {selectedProductIds.length > 0 && (
                  <div className="fixed bottom-0 left-0 right-0 glass-card backdrop-blur-xl border-t border-[rgba(var(--glass-border))] p-4 z-50 rounded-none">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="bg-violet-500/20 text-violet-400 text-sm font-semibold px-3 py-1 rounded-full border border-violet-500/30">
                          {selectedProductIds.length} garment{selectedProductIds.length > 1 ? "s" : ""} selected
                        </span>
                        {selectedProductIds.length > 1 && (
                          <span className="text-xs text-[rgb(var(--text-muted))]">
                            Individual + Combined outfit
                          </span>
                        )}
                        <button
                          onClick={clearProductSelection}
                          className="text-sm text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text-secondary))]"
                        >
                          Clear
                        </button>
                      </div>
                      <button
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="btn-primary px-8 py-3 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        {selectedProductIds.length > 1
                          ? `Generate ${selectedProductIds.length} Try-Ons + Outfit`
                          : "Generate Try-On"}
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
            <div className="glass-card-lg rounded-3xl p-12 flex flex-col items-center">
              <div className="relative">
                <div className="w-24 h-24 rounded-full border-4 border-[rgba(var(--glass-border))] border-t-violet-600 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-10 h-10 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
              </div>
              <h2 className="text-xl font-semibold text-[rgb(var(--text-primary))] mt-8">Generating Your Try-On</h2>
              <p className="text-[rgb(var(--text-muted))] mt-2 text-center max-w-md">
                Our AI is creating a photorealistic try-on image. This typically takes 8-10 seconds.
              </p>
              <div className="mt-6 flex items-center gap-2 text-sm text-[rgb(var(--text-muted))]">
                <div className="w-2 h-2 rounded-full bg-violet-600 animate-pulse" />
                Processing with Gemini AI
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {generateError && step !== "generating" && (
          <div className="glass-card bg-red-900/20 border border-red-500/30 rounded-xl p-6 mb-6">
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
              className="mt-4 text-sm text-violet-400 hover:text-violet-300"
            >
              Start Over
            </button>
          </div>
        )}

        {/* Step 4: Result Viewer */}
        {step === "result" && (currentResult || batchResults) && (
          <div>
            {/* Batch Results with Tabs */}
            {batchResults ? (
              <div>
                {/* Tab Bar */}
                <div className="flex items-center gap-1 glass-card rounded-xl p-1 mb-6 w-fit">
                  {batchResults.combined_result && (
                    <button
                      onClick={() => setResultTab("combined")}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        resultTab === "combined"
                          ? "bg-violet-600 text-white shadow-glow-violet"
                          : "text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text-primary))]"
                      }`}
                    >
                      Combined Outfit
                    </button>
                  )}
                  <button
                    onClick={() => setResultTab("individual")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      resultTab === "individual"
                        ? "bg-violet-600 text-white shadow-glow-violet"
                        : "text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text-primary))]"
                    }`}
                  >
                    Individual ({batchResults.individual_results.length})
                  </button>
                </div>

                <p className="text-[rgb(var(--text-muted))] text-sm mb-6">
                  Total processing time: {batchResults.total_processing_time_ms}ms
                </p>

                {/* Combined Outfit Tab */}
                {resultTab === "combined" && batchResults.combined_result && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="aspect-[3/4] glass-card rounded-2xl overflow-hidden">
                      <img
                        src={batchResults.combined_result.result_url}
                        alt="Combined outfit"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-[rgb(var(--text-primary))]">Combined Outfit</h2>
                      <p className="text-[rgb(var(--text-muted))] mt-1">
                        {batchResults.product_count} garments combined in {batchResults.combined_result.processing_time_ms}ms
                      </p>
                      <div className="mt-6 space-y-3">
                        <button
                          onClick={() =>
                            toggleFavorite(
                              batchResults.combined_result!._id || batchResults.combined_result!.id,
                              !batchResults.combined_result!.is_favorite
                            )
                          }
                          className={`w-full py-3 px-6 rounded-xl font-medium transition-all flex items-center justify-center gap-2 backdrop-blur-sm ${
                            batchResults.combined_result.is_favorite
                              ? "bg-pink-500/20 text-pink-400 border border-pink-500/30"
                              : "glass-card text-[rgb(var(--text-secondary))] hover:bg-white/10"
                          }`}
                        >
                          <svg className="w-5 h-5" fill={batchResults.combined_result.is_favorite ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          {batchResults.combined_result.is_favorite ? "Saved to Favorites" : "Add to Favorites"}
                        </button>
                        <div className="grid grid-cols-2 gap-3">
                          <button onClick={handleTryAnother} className="btn-primary py-3 px-6 rounded-xl font-medium text-center">
                            Try Other Garments
                          </button>
                          <button onClick={handleStartOver} className="btn-secondary py-3 px-6 rounded-xl font-medium text-center">
                            Start Over
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Individual Results Tab */}
                {resultTab === "individual" && (
                  <div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {batchResults.individual_results.map((result) => (
                        <div key={result._id || result.id} className="glass-card rounded-2xl overflow-hidden">
                          <div className="aspect-[3/4] bg-[rgb(var(--bg-secondary))]">
                            <img src={result.result_url} alt={result.product_name} className="w-full h-full object-cover" />
                          </div>
                          <div className="p-4">
                            <p className="text-[rgb(var(--text-primary))] font-medium truncate">{result.product_name}</p>
                            <p className="text-[rgb(var(--text-muted))] text-sm mt-1">{result.processing_time_ms}ms</p>
                            <button
                              onClick={() => toggleFavorite(result._id || result.id, !result.is_favorite)}
                              className={`mt-3 w-full py-2 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 backdrop-blur-sm ${
                                result.is_favorite
                                  ? "bg-pink-500/20 text-pink-400 border border-pink-500/30"
                                  : "glass-card text-[rgb(var(--text-secondary))] hover:bg-white/10"
                              }`}
                            >
                              <svg className="w-4 h-4" fill={result.is_favorite ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                              </svg>
                              {result.is_favorite ? "Favorited" : "Favorite"}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 flex justify-center gap-3">
                      <button onClick={handleTryAnother} className="btn-primary py-3 px-8 rounded-xl font-medium">
                        Try Other Garments
                      </button>
                      <button onClick={handleStartOver} className="btn-secondary py-3 px-8 rounded-xl font-medium">
                        Start Over
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : currentResult ? (
              /* Single Result (existing viewer) */
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Result Image / 3D View */}
                <div className="relative">
                  {show3DView ? (
                    <div className="aspect-[3/4] glass-card rounded-2xl overflow-hidden">
                      <ThreeDViewer imageUrl={currentResult.result_url} />
                    </div>
                  ) : (
                    <div className="aspect-[3/4] glass-card rounded-2xl overflow-hidden">
                      <img
                        src={currentResult.result_url}
                        alt="Try-on result"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  {showBeforeAfter && !show3DView && (
                    <div className="absolute inset-0 grid grid-cols-2 gap-1 rounded-2xl overflow-hidden">
                      <div className="relative bg-[rgb(var(--bg-secondary))]">
                        <img src={currentResult.model_image_url} alt="Original model" className="w-full h-full object-cover" />
                        <span className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded border border-white/10">Before</span>
                      </div>
                      <div className="relative bg-[rgb(var(--bg-secondary))]">
                        <img src={currentResult.result_url} alt="Try-on result" className="w-full h-full object-cover" />
                        <span className="absolute bottom-2 right-2 bg-violet-600/80 backdrop-blur-sm text-white text-xs px-2 py-1 rounded">After</span>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-[rgb(var(--text-primary))]">Try-On Result</h2>
                  <p className="text-[rgb(var(--text-muted))] mt-1">Generated in {currentResult.processing_time_ms}ms</p>

                  <div className="mt-6 space-y-4">
                    <div className="glass-card rounded-xl p-4 flex items-center gap-4">
                      <div className="w-14 h-18 rounded-lg overflow-hidden bg-[rgb(var(--bg-secondary))] flex-shrink-0">
                        {currentResult.model_image_url && (
                          <img src={currentResult.model_image_url} alt="Model" className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs text-[rgb(var(--text-muted))] uppercase tracking-wider">Model</p>
                        <p className="text-[rgb(var(--text-primary))] font-medium">{currentResult.model_name}</p>
                      </div>
                    </div>
                    <div className="glass-card rounded-xl p-4 flex items-center gap-4">
                      <div className="w-14 h-18 rounded-lg overflow-hidden bg-[rgb(var(--bg-secondary))] flex-shrink-0">
                        {currentResult.product_image_url && (
                          <img src={currentResult.product_image_url} alt="Garment" className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs text-[rgb(var(--text-muted))] uppercase tracking-wider">Garment</p>
                        <p className="text-[rgb(var(--text-primary))] font-medium">{currentResult.product_name}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => { setShowBeforeAfter(!showBeforeAfter); if (!showBeforeAfter) setShow3DView(false); }}
                        className={`py-3 px-6 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${showBeforeAfter ? "bg-violet-600 text-white shadow-glow-violet" : "glass-card text-[rgb(var(--text-primary))] hover:bg-white/10"}`}
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                        Before / After
                      </button>
                      <button
                        onClick={() => { setShow3DView(!show3DView); if (!show3DView) setShowBeforeAfter(false); }}
                        className={`py-3 px-6 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${show3DView ? "bg-violet-600 text-white shadow-glow-violet" : "glass-card text-[rgb(var(--text-primary))] hover:bg-white/10"}`}
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                        </svg>
                        3D View
                      </button>
                    </div>

                    <button
                      onClick={() => toggleFavorite(currentResult._id || currentResult.id, !currentResult.is_favorite)}
                      className={`w-full py-3 px-6 rounded-xl font-medium transition-all flex items-center justify-center gap-2 backdrop-blur-sm ${currentResult.is_favorite ? "bg-pink-500/20 text-pink-400 border border-pink-500/30 hover:bg-pink-500/30" : "glass-card text-[rgb(var(--text-secondary))] hover:bg-white/10"}`}
                    >
                      <svg className="w-5 h-5" fill={currentResult.is_favorite ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      {currentResult.is_favorite ? "Saved to Favorites" : "Add to Favorites"}
                    </button>

                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={handleTryAnother} className="btn-primary py-3 px-6 rounded-xl font-medium text-center">
                        Try Another Garment
                      </button>
                      <button onClick={handleStartOver} className="btn-secondary py-3 px-6 rounded-xl font-medium text-center">
                        Start Over
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
