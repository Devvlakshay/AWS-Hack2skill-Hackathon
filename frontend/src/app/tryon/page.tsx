"use client";

/**
 * Virtual Try-On Page for FitView AI.
 * Phase 3: Core Virtual Try-On Engine.
 *
 * Flow: Select Model -> Select Product -> Generate Try-On -> View Result
 * Design: Luxury editorial — Playfair Display / DM Sans, cream bg, gold accent.
 */

import React, { Suspense, useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import toast from "react-hot-toast";
import { useAuthStore } from "@/lib/store/authStore";
import { useTryOnStore } from "@/lib/store/tryonStore";
import { getModels, type FashionModel } from "@/lib/api/models";
import { getProducts, type Product } from "@/lib/api/products";

const ThreeDViewer = dynamic(() => import("@/components/ThreeDViewer"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[400px] flex items-center justify-center bg-[#F0EDE6] rounded-2xl">
      <div className="w-8 h-8 border-2 border-[#B8860B] border-t-transparent rounded-full animate-spin" />
    </div>
  ),
});

type Step = "select-model" | "select-product" | "generating" | "result";

export default function TryOnPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#B8860B] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
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

  const [genderFilter, setGenderFilter] = useState("");
  const [bodyTypeFilter, setBodyTypeFilter] = useState("");
  const [skinToneFilter, setSkinToneFilter] = useState("");
  const [sizeFilter, setSizeFilter] = useState("");

  const [categoryFilter, setCategoryFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [showBeforeAfter, setShowBeforeAfter] = useState(false);
  const [show3DView, setShow3DView] = useState(false);
  const [resultTab, setResultTab] = useState<"combined" | "individual">("combined");

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { hydrate(); }, [hydrate]);

  useEffect(() => {
    if (!isAuthenticated) router.push("/login");
  }, [isAuthenticated, router]);

  useEffect(() => {
    const productId = searchParams.get("product");
    if (productId) setSelectedProduct(productId);
  }, [searchParams, setSelectedProduct]);

  useEffect(() => {
    fetchModels();
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
      const filters: Record<string, unknown> = { limit: 50 };
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
    if (step === "select-product") fetchProductsData();
  }, [step, fetchProductsData]);

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
    setStep("select-product");
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowedTypes = ["image/jpeg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload a JPEG or PNG image.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size exceeds 10MB limit.");
      return;
    }
    setUserPhoto(file);
    setStep("select-product");
  };

  const handlePhotoCardClick = () => { fileInputRef.current?.click(); };

  const handleProductSelect = (productId: string) => { toggleProductSelection(productId); };

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

  const selectedModel = models.find(
    (m) => m._id === selectedModelId || m.id === selectedModelId
  );
  const isUserPhotoMode = selectedModelId === "user_upload" && userPhoto !== null;

  if (!isAuthenticated) return null;

  // Step config for the progress indicator
  const steps = [
    { key: "select-model", num: 1, label: "Select Model" },
    { key: "select-product", num: 2, label: "Select Garment" },
    { key: "result", num: 3, label: "View Result" },
  ];

  const currentStepIndex =
    step === "select-model" ? 0
    : step === "select-product" ? 1
    : 2; // generating or result

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png"
        className="hidden"
        onChange={handlePhotoUpload}
      />

      {/* Page Header */}
      <div className="border-b border-[#E8E4DC] bg-[#FAFAF8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium tracking-[0.2em] text-[#B8860B] uppercase mb-1">
                AI-Powered
              </p>
              <h1
                className="text-3xl text-[#1a1a1a]"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Virtual Try-On
              </h1>
            </div>
            <Link
              href="/tryon/history"
              className="text-sm text-[#6B6B6B] hover:text-[#B8860B] transition-colors flex items-center gap-1.5 mt-1"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              History
            </Link>
          </div>

          {/* Step Progress Indicator */}
          <div className="flex items-center gap-0 mt-6">
            {steps.map((s, i) => {
              const isDone = currentStepIndex > i;
              const isActive = currentStepIndex === i;
              return (
                <React.Fragment key={s.key}>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all
                        ${isActive ? "bg-[#B8860B] text-white" : isDone ? "bg-[#1a1a1a] text-white" : "bg-[#E8E4DC] text-[#9A9A9A]"}`}
                    >
                      {isDone ? (
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : s.num}
                    </div>
                    <span
                      className={`text-xs font-medium transition-colors
                        ${isActive ? "text-[#B8860B]" : isDone ? "text-[#1a1a1a]" : "text-[#9A9A9A]"}`}
                    >
                      {s.label}
                    </span>
                  </div>
                  {i < steps.length - 1 && (
                    <div
                      className={`flex-1 mx-3 h-px transition-colors ${isDone ? "bg-[#1a1a1a]" : "bg-[#E8E4DC]"}`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* pb-24 on mobile clears the BottomTabBar (64px) + safe area + breathing room */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 sm:pb-8">

        {/* ── STEP 1: Model Selection ── */}
        {step === "select-model" && (
          <div>
            {/* Upload Your Photo */}
            <div className="mb-8">
              <h3
                className="text-xs font-medium tracking-[0.15em] text-[#9A9A9A] uppercase mb-3"
              >
                Use Your Own Photo
              </h3>
              <button
                onClick={handlePhotoCardClick}
                className={`group w-full sm:w-auto flex items-center gap-5 p-4 border rounded-xl transition-all
                  ${isUserPhotoMode
                    ? "border-[#B8860B] bg-[#FAF6EE]"
                    : "border-dashed border-[#D4C9B0] hover:border-[#B8860B] bg-white"
                  }`}
              >
                <div className="w-14 h-18 rounded-lg overflow-hidden bg-[#F0EDE6] flex-shrink-0 flex items-center justify-center">
                  {userPhotoPreview ? (
                    <img src={userPhotoPreview} alt="Your photo" className="w-full h-full object-cover" />
                  ) : (
                    <svg className="w-7 h-7 text-[#B8860B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  )}
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-[#1a1a1a]">
                    {userPhotoPreview ? "Photo Uploaded" : "Upload Your Photo"}
                  </p>
                  <p className="text-xs text-[#6B6B6B] mt-0.5">
                    {userPhotoPreview ? "Click to change · JPEG or PNG" : "JPEG or PNG · min 512×512 · max 10MB"}
                  </p>
                </div>
                {isUserPhotoMode && (
                  <div className="ml-auto w-5 h-5 bg-[#B8860B] rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>
              {isUserPhotoMode && (
                <div className="mt-3 flex items-center gap-4">
                  <button
                    onClick={() => setStep("select-product")}
                    className="text-sm font-medium bg-[#1a1a1a] text-white px-5 py-2 rounded-lg hover:bg-[#2d2d2d] transition-colors"
                  >
                    Continue to Select Garment
                  </button>
                  <button
                    onClick={() => {
                      clearUserPhoto();
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="text-sm text-[#9A9A9A] hover:text-[#1a1a1a] transition-colors"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4 mb-8">
              <div className="flex-1 h-px bg-[#E8E4DC]" />
              <span className="text-xs text-[#9A9A9A] uppercase tracking-widest">Or select a brand model</span>
              <div className="flex-1 h-px bg-[#E8E4DC]" />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              {[
                {
                  value: genderFilter,
                  onChange: setGenderFilter,
                  options: [["", "All Genders"], ["female", "Female"], ["male", "Male"]],
                },
                {
                  value: bodyTypeFilter,
                  onChange: setBodyTypeFilter,
                  options: [["", "All Body Types"], ["slim", "Slim"], ["average", "Average"], ["athletic", "Athletic"], ["curvy", "Curvy"], ["plus_size", "Plus Size"]],
                },
                {
                  value: skinToneFilter,
                  onChange: setSkinToneFilter,
                  options: [["", "All Skin Tones"], ["fair", "Fair"], ["medium", "Medium"], ["olive", "Olive"], ["brown", "Brown"], ["dark", "Dark"]],
                },
                {
                  value: sizeFilter,
                  onChange: setSizeFilter,
                  options: [["", "All Sizes"], ["S", "S"], ["M", "M"], ["L", "L"], ["XL", "XL"], ["XXL", "XXL"]],
                },
              ].map((filter, i) => (
                <select
                  key={i}
                  value={filter.value}
                  onChange={(e) => filter.onChange(e.target.value)}
                  className="bg-white border border-[#D4C9B0] text-[#1a1a1a] text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#B8860B] focus:ring-1 focus:ring-[#B8860B] transition-colors"
                >
                  {filter.options.map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              ))}
            </div>

            {loadingModels ? (
              <div className="flex justify-center py-20">
                <div className="w-8 h-8 border-2 border-[#B8860B] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : models.length === 0 ? (
              <div className="text-center py-20 text-[#9A9A9A]">
                No models available. Ask a retailer to upload models.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {models.map((model) => {
                  const isSelected = selectedModelId === model._id || selectedModelId === model.id;
                  return (
                    <button
                      key={model._id}
                      onClick={() => handleModelSelect(model._id)}
                      className={`group relative border rounded-xl overflow-hidden transition-all text-left
                        ${isSelected
                          ? "border-[#B8860B] shadow-[0_0_0_2px_#B8860B20]"
                          : "border-[#E8E4DC] hover:border-[#B8860B] bg-white"
                        }`}
                    >
                      <div className="aspect-[3/4] bg-[#F0EDE6]">
                        {model.image_url ? (
                          <img src={model.image_url} alt={model.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg className="w-10 h-10 text-[#C4BFB4]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="p-3 bg-white">
                        <p className="text-[#1a1a1a] text-sm font-medium truncate">{model.name}</p>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium
                            ${model.gender === "male" ? "bg-blue-50 text-blue-600" : "bg-rose-50 text-rose-600"}`}>
                            {model.gender === "male" ? "M" : "F"}
                          </span>
                          <span className="text-[10px] text-[#9A9A9A] capitalize">{model.body_type.replace("_", " ")}</span>
                          <span className="text-[#D4C9B0] text-[10px]">|</span>
                          <span className="text-[10px] text-[#9A9A9A]">{model.size}</span>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-[#B8860B] rounded-full flex items-center justify-center">
                          <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── STEP 2: Product Selection ── */}
        {step === "select-product" && (
          <div>
            {/* Selected Model Summary */}
            <div className="bg-white border border-[#E8E4DC] rounded-xl p-4 mb-6 flex items-center gap-4">
              <div className="w-14 h-[72px] rounded-lg overflow-hidden bg-[#F0EDE6] flex-shrink-0">
                {isUserPhotoMode && userPhotoPreview ? (
                  <img src={userPhotoPreview} alt="Your photo" className="w-full h-full object-cover" />
                ) : selectedModel?.image_url ? (
                  <img src={selectedModel.image_url} alt={selectedModel.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-7 h-7 text-[#C4BFB4]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium tracking-[0.15em] text-[#B8860B] uppercase mb-0.5">Model</p>
                <p className="text-sm font-medium text-[#1a1a1a] truncate">
                  {isUserPhotoMode ? "Your Photo" : selectedModel?.name}
                </p>
                {!isUserPhotoMode && selectedModel && (
                  <p className="text-xs text-[#9A9A9A] mt-0.5">
                    {selectedModel.body_type.replace("_", " ")} · {selectedModel.size} · {selectedModel.height_cm}cm
                  </p>
                )}
              </div>
              <button
                onClick={() => setStep("select-model")}
                className="text-xs text-[#B8860B] hover:text-[#9A6C00] font-medium transition-colors border border-[#B8860B] px-3 py-1.5 rounded-lg flex-shrink-0"
              >
                Change
              </button>
            </div>

            {/* Product Filters */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <div className="relative flex-1 min-w-[200px]">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9A9A9A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search garments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-[#D4C9B0] text-[#1a1a1a] text-sm rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:border-[#B8860B] focus:ring-1 focus:ring-[#B8860B] transition-colors placeholder:text-[#9A9A9A]"
                />
              </div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-white border border-[#D4C9B0] text-[#1a1a1a] text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#B8860B] focus:ring-1 focus:ring-[#B8860B] transition-colors"
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
              <div className="flex justify-center py-20">
                <div className="w-8 h-8 border-2 border-[#B8860B] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20 text-[#9A9A9A] text-sm">
                No products found. Try adjusting your filters.
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 pb-28">
                  {products.map((product) => {
                    const firstImage = product.images?.[0];
                    const isSelected =
                      selectedProductIds.includes(product._id) ||
                      selectedProductIds.includes(product.id);
                    const selIndex =
                      selectedProductIds.indexOf(product._id) !== -1
                        ? selectedProductIds.indexOf(product._id)
                        : selectedProductIds.indexOf(product.id);
                    return (
                      <button
                        key={product._id}
                        onClick={() => handleProductSelect(product._id)}
                        className={`group relative border rounded-xl overflow-hidden transition-all text-left
                          ${isSelected
                            ? "border-[#B8860B] shadow-[0_0_0_2px_#B8860B20]"
                            : "border-[#E8E4DC] hover:border-[#B8860B] bg-white"
                          }`}
                      >
                        <div className="aspect-[3/4] bg-[#F0EDE6]">
                          {firstImage ? (
                            <img src={firstImage} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <svg className="w-10 h-10 text-[#C4BFB4]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="p-3 bg-white">
                          <p className="text-[#1a1a1a] text-sm font-medium truncate">{product.name}</p>
                          <p className="text-[#B8860B] text-sm font-semibold mt-1">
                            {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(product.price)}
                          </p>
                        </div>
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-6 h-6 bg-[#B8860B] rounded-full flex items-center justify-center">
                            {selectedProductIds.length > 1 ? (
                              <span className="text-white text-[10px] font-bold">{selIndex + 1}</span>
                            ) : (
                              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Sticky Generate Bar */}
                {selectedProductIds.length > 0 && (
                  <div
                    className="fixed bottom-0 left-0 right-0 bg-[#FAFAF8] border-t border-[#E8E4DC] px-4 z-50"
                    style={{
                      paddingTop: "16px",
                      // On mobile, extra bottom padding clears the 64px BottomTabBar + safe area
                      paddingBottom: "max(16px, calc(env(safe-area-inset-bottom, 0px) + 72px))",
                    }}
                  >
                    <div
                      style={{ maxWidth: "1280px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" }}
                    >
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-sm font-medium text-[#1a1a1a] border border-[#D4C9B0] px-3 py-1.5 rounded-lg bg-white">
                          {selectedProductIds.length} garment{selectedProductIds.length > 1 ? "s" : ""} selected
                        </span>
                        {selectedProductIds.length > 1 && (
                          <span className="text-xs text-[#9A9A9A]">Individual + Combined outfit</span>
                        )}
                        <button
                          onClick={clearProductSelection}
                          className="text-xs text-[#9A9A9A] hover:text-[#1a1a1a] transition-colors underline"
                        >
                          Clear
                        </button>
                      </div>
                      <button
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="flex items-center gap-2 bg-[#1a1a1a] text-white text-sm font-medium px-6 py-3 rounded-xl hover:bg-[#2d2d2d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        {selectedProductIds.length > 1
                          ? `Generate ${selectedProductIds.length} Try-Ons`
                          : "Generate Try-On"}
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ── STEP 3: Generating ── */}
        {step === "generating" && (
          <div className="flex flex-col items-center justify-center py-28">
            <div className="bg-white border border-[#E8E4DC] rounded-2xl p-14 flex flex-col items-center max-w-sm w-full text-center">
              {/* Animated rings */}
              <div className="relative w-20 h-20 mb-8">
                <div className="absolute inset-0 rounded-full border-2 border-[#E8E4DC]" />
                <div className="absolute inset-0 rounded-full border-2 border-[#B8860B] border-t-transparent animate-spin" />
                <div className="absolute inset-[6px] rounded-full border border-[#E8E4DC]" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-8 h-8 text-[#B8860B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
              </div>
              <h2
                className="text-xl text-[#1a1a1a] mb-2"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Generating your look&hellip;
              </h2>
              <p className="text-sm text-[#6B6B6B] leading-relaxed">
                Our AI is crafting a photorealistic try-on. This typically takes 8&ndash;10 seconds.
              </p>
              <div className="mt-6 flex items-center gap-2 text-xs text-[#9A9A9A]">
                <div className="w-1.5 h-1.5 rounded-full bg-[#B8860B] animate-pulse" />
                Powered by Gemini AI
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {generateError && step !== "generating" && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-red-700">Generation Failed</p>
                <p className="text-sm text-red-600 mt-1">{generateError}</p>
              </div>
            </div>
            <button
              onClick={handleStartOver}
              className="mt-4 text-sm font-medium text-[#B8860B] hover:text-[#9A6C00] transition-colors"
            >
              Start Over
            </button>
          </div>
        )}

        {/* ── STEP 4: Result Viewer ── */}
        {step === "result" && (currentResult || batchResults) && (
          <div>
            {batchResults ? (
              <div>
                {/* Batch Tab Bar */}
                <div className="flex items-center gap-1 border border-[#E8E4DC] rounded-xl p-1 mb-6 w-fit bg-white">
                  {batchResults.combined_result && (
                    <button
                      onClick={() => setResultTab("combined")}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all
                        ${resultTab === "combined"
                          ? "bg-[#1a1a1a] text-white"
                          : "text-[#6B6B6B] hover:text-[#1a1a1a]"
                        }`}
                    >
                      Combined Outfit
                    </button>
                  )}
                  <button
                    onClick={() => setResultTab("individual")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all
                      ${resultTab === "individual"
                        ? "bg-[#1a1a1a] text-white"
                        : "text-[#6B6B6B] hover:text-[#1a1a1a]"
                      }`}
                  >
                    Individual ({batchResults.individual_results.length})
                  </button>
                </div>

                <p className="text-xs text-[#9A9A9A] mb-6">
                  Total processing time: {batchResults.total_processing_time_ms}ms
                </p>

                {/* Combined Outfit Tab */}
                {resultTab === "combined" && batchResults.combined_result && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <div className="aspect-[3/4] border border-[#E8E4DC] rounded-2xl overflow-hidden bg-[#F0EDE6]">
                      <img src={batchResults.combined_result.result_url} alt="Combined outfit" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h2
                        className="text-2xl text-[#1a1a1a] mb-1"
                        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                      >
                        Combined Outfit
                      </h2>
                      <p className="text-sm text-[#9A9A9A] mb-8">
                        {batchResults.product_count} garments · {batchResults.combined_result.processing_time_ms}ms
                      </p>
                      <div className="space-y-3">
                        <button
                          onClick={() =>
                            toggleFavorite(
                              batchResults.combined_result!._id || batchResults.combined_result!.id,
                              !batchResults.combined_result!.is_favorite
                            )
                          }
                          className={`w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl text-sm font-medium transition-all border
                            ${batchResults.combined_result.is_favorite
                              ? "bg-rose-50 text-rose-600 border-rose-200"
                              : "bg-white text-[#6B6B6B] border-[#E8E4DC] hover:border-[#B8860B] hover:text-[#B8860B]"
                            }`}
                        >
                          <svg className="w-4 h-4" fill={batchResults.combined_result.is_favorite ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          {batchResults.combined_result.is_favorite ? "Saved to Favourites" : "Save to Favourites"}
                        </button>
                        <div className="grid grid-cols-2 gap-3">
                          <button onClick={handleTryAnother} className="bg-[#1a1a1a] text-white text-sm font-medium py-3 px-6 rounded-xl hover:bg-[#2d2d2d] transition-colors text-center">
                            Try Other Garments
                          </button>
                          <button onClick={handleStartOver} className="bg-white text-[#1a1a1a] text-sm font-medium py-3 px-6 rounded-xl border border-[#D4C9B0] hover:border-[#1a1a1a] transition-colors text-center">
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
                        <div key={result._id || result.id} className="border border-[#E8E4DC] rounded-2xl overflow-hidden bg-white">
                          <div className="aspect-[3/4] bg-[#F0EDE6]">
                            <img src={result.result_url} alt={result.product_name} className="w-full h-full object-cover" />
                          </div>
                          <div className="p-4">
                            <p className="text-[#1a1a1a] text-sm font-medium truncate">{result.product_name}</p>
                            <p className="text-[#9A9A9A] text-xs mt-0.5">{result.processing_time_ms}ms</p>
                            <button
                              onClick={() => toggleFavorite(result._id || result.id, !result.is_favorite)}
                              className={`mt-3 w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-xs font-medium border transition-all
                                ${result.is_favorite
                                  ? "bg-rose-50 text-rose-600 border-rose-200"
                                  : "bg-white text-[#6B6B6B] border-[#E8E4DC] hover:border-[#B8860B] hover:text-[#B8860B]"
                                }`}
                            >
                              <svg className="w-3.5 h-3.5" fill={result.is_favorite ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                              </svg>
                              {result.is_favorite ? "Favourited" : "Favourite"}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-8 flex justify-center gap-3">
                      <button onClick={handleTryAnother} className="bg-[#1a1a1a] text-white text-sm font-medium py-3 px-8 rounded-xl hover:bg-[#2d2d2d] transition-colors">
                        Try Other Garments
                      </button>
                      <button onClick={handleStartOver} className="bg-white text-[#1a1a1a] text-sm font-medium py-3 px-8 rounded-xl border border-[#D4C9B0] hover:border-[#1a1a1a] transition-colors">
                        Start Over
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : currentResult ? (
              /* Single Result */
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Image / 3D View */}
                <div className="relative">
                  {show3DView ? (
                    <div className="aspect-[3/4] border border-[#E8E4DC] rounded-2xl overflow-hidden">
                      <ThreeDViewer imageUrl={currentResult.result_url} />
                    </div>
                  ) : (
                    <div className="aspect-[3/4] border border-[#E8E4DC] rounded-2xl overflow-hidden bg-[#F0EDE6]">
                      <img src={currentResult.result_url} alt="Try-on result" className="w-full h-full object-cover" />
                    </div>
                  )}
                  {showBeforeAfter && !show3DView && (
                    /* Before/After: side-by-side on desktop, stacked on mobile */
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-2xl overflow-hidden">
                      <div className="relative bg-[#F0EDE6] rounded-xl overflow-hidden aspect-[3/4]">
                        <img src={currentResult.model_image_url} alt="Original model" className="w-full h-full object-cover" />
                        <span className="absolute bottom-2 left-2 bg-[#1a1a1a] text-white text-[10px] px-2 py-1 rounded font-medium" style={{ opacity: 0.85 }}>
                          Before
                        </span>
                      </div>
                      <div className="relative bg-[#F0EDE6] rounded-xl overflow-hidden aspect-[3/4]">
                        <img src={currentResult.result_url} alt="Try-on result" className="w-full h-full object-cover" />
                        <span className="absolute bottom-2 right-2 text-white text-[10px] px-2 py-1 rounded font-medium" style={{ background: "#B8860B" }}>
                          After
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Result Info & Actions */}
                <div>
                  <p className="text-xs font-medium tracking-[0.15em] text-[#B8860B] uppercase mb-1">Result</p>
                  <h2
                    className="text-2xl text-[#1a1a1a] mb-1"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    Your Try-On
                  </h2>
                  <p className="text-xs text-[#9A9A9A] mb-7">Generated in {currentResult.processing_time_ms}ms</p>

                  {/* Model & Garment Info Cards */}
                  <div className="space-y-3 mb-8">
                    {[
                      { label: "Model", name: currentResult.model_name, imgUrl: currentResult.model_image_url },
                      { label: "Garment", name: currentResult.product_name, imgUrl: currentResult.product_image_url },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center gap-4 bg-white border border-[#E8E4DC] rounded-xl p-3">
                        <div className="w-12 h-[60px] rounded-lg overflow-hidden bg-[#F0EDE6] flex-shrink-0">
                          {item.imgUrl && (
                            <img src={item.imgUrl} alt={item.label} className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div>
                          <p className="text-[10px] font-medium tracking-[0.15em] text-[#9A9A9A] uppercase">{item.label}</p>
                          <p className="text-sm font-medium text-[#1a1a1a] mt-0.5">{item.name}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* View Toggles */}
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <button
                      onClick={() => { setShowBeforeAfter(!showBeforeAfter); if (!showBeforeAfter) setShow3DView(false); }}
                      className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium border transition-all
                        ${showBeforeAfter
                          ? "bg-[#1a1a1a] text-white border-[#1a1a1a]"
                          : "bg-white text-[#6B6B6B] border-[#D4C9B0] hover:border-[#1a1a1a] hover:text-[#1a1a1a]"
                        }`}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                      Before / After
                    </button>
                    <button
                      onClick={() => { setShow3DView(!show3DView); if (!show3DView) setShowBeforeAfter(false); }}
                      className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium border transition-all
                        ${show3DView
                          ? "bg-[#1a1a1a] text-white border-[#1a1a1a]"
                          : "bg-white text-[#6B6B6B] border-[#D4C9B0] hover:border-[#1a1a1a] hover:text-[#1a1a1a]"
                        }`}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                      </svg>
                      3D View
                    </button>
                  </div>

                  {/* Favourite */}
                  <button
                    onClick={() =>
                      toggleFavorite(currentResult._id || currentResult.id, !currentResult.is_favorite)
                    }
                    className={`w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl text-sm font-medium border transition-all mb-3
                      ${currentResult.is_favorite
                        ? "bg-rose-50 text-rose-600 border-rose-200"
                        : "bg-white text-[#6B6B6B] border-[#E8E4DC] hover:border-[#B8860B] hover:text-[#B8860B]"
                      }`}
                  >
                    <svg className="w-4 h-4" fill={currentResult.is_favorite ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    {currentResult.is_favorite ? "Saved to Favourites" : "Save to Favourites"}
                  </button>

                  {/* Download */}
                  <a
                    href={currentResult.result_url}
                    download="fitview-tryon.webp"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl text-sm font-medium border border-[#E8E4DC] bg-white text-[#6B6B6B] hover:border-[#1a1a1a] hover:text-[#1a1a1a] transition-all mb-3"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download Image
                  </a>

                  {/* Navigation */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={handleTryAnother}
                      className="bg-[#1a1a1a] text-white text-sm font-medium py-3 px-6 rounded-xl hover:bg-[#2d2d2d] transition-colors text-center"
                    >
                      Try Another
                    </button>
                    <button
                      onClick={handleStartOver}
                      className="bg-white text-[#1a1a1a] text-sm font-medium py-3 px-6 rounded-xl border border-[#D4C9B0] hover:border-[#1a1a1a] transition-colors text-center"
                    >
                      Start Over
                    </button>
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
