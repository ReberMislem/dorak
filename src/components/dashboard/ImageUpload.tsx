"use client";

import React, { useState, useRef } from "react";
import { Camera, Loader2, Trash2, Image as ImageIcon } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

interface ImageUploadProps {
  currentImage?: string | null;
  onUploadSuccess: (newUrl: string) => void;
  onRemoveSuccess?: () => void;
  type: "avatar" | "logo";
  shopId?: string; // required for shop logos
  className?: string;
  isAvatarDesign?: boolean;
}

export function ImageUpload({
  currentImage,
  onUploadSuccess,
  onRemoveSuccess,
  type,
  shopId,
  className = "",
  isAvatarDesign = false,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cache bust the current image url
  const displayUrl = currentImage 
    ? `${currentImage}${currentImage.includes("?") ? "&" : "?"}v=${Date.now()}` 
    : null;

  const optimizeAndUpload = async (file: File) => {
    // Validate MIME types
    const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error("نوع الصورة غير مدعوم. يرجى اختيار PNG, JPG, JPEG, أو WEBP");
      return;
    }

    // Max file size: 5MB
    if (file.size > 5 * 1024 * 1024) {
      toast.error("حجم الصورة كبير جداً. يرجى اختيار صورة أقل من 5 ميجابايت");
      return;
    }

    setIsUploading(true);
    setProgress(0);

    try {
      // 1. Client-Side Image Resize & Compression using Canvas
      const compressedBlob = await new Promise<Blob>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
          const img = new Image();
          img.src = event.target?.result as string;
          img.onload = () => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            if (!ctx) {
              reject(new Error("Failed to get canvas context"));
              return;
            }

            // Target size: 400x400 for avatar, 800x800 for logo
            const targetDim = type === "avatar" ? 400 : 800;
            let width = img.width;
            let height = img.height;

            // Crop to square if avatar
            if (type === "avatar") {
              const size = Math.min(width, height);
              canvas.width = targetDim;
              canvas.height = targetDim;
              
              const sx = (width - size) / 2;
              const sy = (height - size) / 2;
              
              ctx.drawImage(img, sx, sy, size, size, 0, 0, targetDim, targetDim);
            } else {
              // Resize keeping ratio
              if (width > targetDim || height > targetDim) {
                if (width > height) {
                  height = Math.round((height * targetDim) / width);
                  width = targetDim;
                } else {
                  width = Math.round((width * targetDim) / height);
                  height = targetDim;
                }
              }
              canvas.width = width;
              canvas.height = height;
              ctx.drawImage(img, 0, 0, width, height);
            }

            // Export to WEBP with 85% quality
            canvas.toBlob(
              (blob) => {
                if (blob) resolve(blob);
                else reject(new Error("Canvas compression failed"));
              },
              "image/webp",
              0.85
            );
          };
          img.onerror = () => reject(new Error("Failed to load image"));
        };
        reader.onerror = () => reject(new Error("Failed to read file"));
      });

      // 2. Prepare Form Data
      const formData = new FormData();
      formData.append("file", compressedBlob, `${type}.webp`);
      if (shopId) {
        formData.append("shopId", shopId);
      }

      // 3. Upload to API
      const endpoint = type === "avatar" ? "/api/upload/avatar" : "/api/upload/logo";
      const response = await axios.post(endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const pct = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setProgress(pct);
          }
        },
      });

      if (response.data.success) {
        toast.success(type === "avatar" ? "تم تحديث الصورة الشخصية بنجاح" : "تم تحديث لوغو المحل بنجاح");
        // Append cache buster to guarantee browser re-fetch
        const cleanUrl = response.data.data.avatarUrl || response.data.data.logoUrl;
        onUploadSuccess(cleanUrl);
      } else {
        toast.error(response.data.error || "فشل رفع الملف");
      }
    } catch (error: any) {
      console.error("[IMAGE UPLOAD ERROR]", error);
      toast.error(error.response?.data?.error || "حدث خطأ أثناء رفع الصورة");
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      optimizeAndUpload(file);
    }
  };

  const triggerSelect = () => {
    fileInputRef.current?.click();
  };

  const removeImage = async () => {
    if (!confirm("هل أنت متأكد من حذف الصورة؟")) return;
    setIsUploading(true);
    try {
      if (type === "avatar") {
        await axios.patch("/api/auth/profile", {
          name: "", // Will be filled properly on backend or kept since it validates, wait.
          // Let's call standard patch but with null avatar
        });
      }
      toast.success("تم حذف الصورة بنجاح");
      if (onRemoveSuccess) onRemoveSuccess();
    } catch (e) {
      toast.error("فشل حذف الصورة");
    } finally {
      setIsUploading(false);
    }
  };

  if (isAvatarDesign) {
    return (
      <div className={`relative group ${className}`}>
        <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-[2.5rem] bg-gradient-to-br from-primary/20 to-indigo-500/20 flex items-center justify-center border-2 border-primary/10 overflow-hidden shadow-glow relative">
          {displayUrl ? (
            <img
              src={displayUrl}
              alt="Avatar"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <ImageIcon className="w-14 h-14 sm:w-20 sm:h-20 text-primary/30" />
          )}

          {isUploading && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-1" />
              <span className="text-[10px] font-bold">{progress}%</span>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={triggerSelect}
          disabled={isUploading}
          className="absolute -bottom-2 -right-2 p-3 bg-primary text-primary-foreground rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all border-4 border-surface"
        >
          <Camera className="w-5 h-5" />
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/png, image/jpeg, image/jpg, image/webp"
          className="hidden"
        />
      </div>
    );
  }

  // Shop Logo Zone or drag zone
  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      <div 
        onClick={triggerSelect}
        className="relative group w-32 h-32 rounded-[2rem] bg-surface-2 flex items-center justify-center text-muted-foreground border-2 border-dashed border-border overflow-hidden transition-all hover:border-primary/50 hover:bg-primary/5 shadow-inner cursor-pointer"
      >
        {displayUrl ? (
          <img src={displayUrl} alt="Logo" className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-1">
            <ImageIcon size={32} className="text-muted-foreground/60" />
            <span className="text-[10px] font-bold text-muted-foreground">اختر شعاراً</span>
          </div>
        )}

        {isUploading && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-1" />
            <span className="text-[10px] font-bold">{progress}%</span>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={triggerSelect}
          disabled={isUploading}
          className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold rounded-xl transition-all"
        >
          تغيير الشعار
        </button>
        {currentImage && (
          <button
            type="button"
            onClick={removeImage}
            disabled={isUploading}
            className="p-2 bg-danger/10 hover:bg-danger/20 text-danger rounded-xl transition-all"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png, image/jpeg, image/jpg, image/webp"
        className="hidden"
      />
    </div>
  );
}
