---
title: .Net 上的圖像類型(Bitmap、Image、Mat、UMat)
tags:
  - [C#]
  - [OpenCV]
  - [Bitmap]
  - [Image]
  - [tips]
cover: /img/cover/code.jpg
date: 2023-10-03 11:37:38
---

1. `Bitmap:`
    - Bitmap 是一個在 C# 中常用的圖像類型，它屬於 System.Drawing 命名空間。它用於表示和處理點陣圖圖像。
    - Bitmap 是一個基於像素的圖像，每個像素都包含顏色信息。您可以輕鬆地創建、讀取、繪製和處理 Bitmap 圖像。
    - 這是一個簡單且易於使用的圖像類型，適用於大多數基本圖像處理需求，但在某些情況下可能會有性能問題。
2. `Image<TColor, TColor>:`
    - Image<TColor, TColor> 通常是指一種泛型圖像類型，通常用於 .NET Core 和 .NET 5+ 中的圖像處理庫，如 SixLabors.ImageSharp。
    - 這是一種較新的圖像類型，支援更多的圖像處理功能，例如縮放、旋轉、濾鏡等。
    - Image<TColor, TColor> 使用泛型，因此您可以指定圖像的顏色類型（例如 RGB、灰度等），這使得它更具彈性和可擴展性。
3. `Mat:`
    - Mat 是一個常見於 OpenCV（Open Source Computer Vision Library）中的圖像類型，用於 C# 中的 OpenCVSharp 或 Emgu.CV 等圖像處理庫。
    - Mat 是一種多維數組（通常是2D或3D）表示方式，可以表示圖像、視頻幀或其他數據。
    - 它具有豐富的圖像處理和計算能力，包括運算子重載，可以輕鬆進行像素級操作和高級圖像處理。
4. `UMat:`
    - UMat（Unified Memory）是一種 Mat 的變種，用於支援 OpenCV 中的 GPU 加速處理。
    - 它允許在 CPU 和 GPU 之間共享圖像數據，以實現更快的圖像處理。
    - UMat 可以使用與 Mat 類似的方式進行操作，但能夠充分利用現代圖形硬件加速計算。
    
    # 轉換
    
    ```csharp
    using System.Drawing;
    using SixLabors.ImageSharp;
    using SixLabors.ImageSharp.PixelFormats;
    using Emgu.CV;
    using Emgu.CV.CvEnum;
    
    public class ImageConverter
    {
        // Bitmap 轉換為 Image<TColor, TColor>
        public Image<Rgba32> BitmapToImage(Bitmap bitmap)
        {
            using (MemoryStream stream = new MemoryStream())
            {
                // 將 Bitmap 轉換為 byte 數組
                bitmap.Save(stream, ImageFormat.Png);
                byte[] imageBytes = stream.ToArray();
    
                // 使用 ImageSharp 加載圖像
                Image<Rgba32> image = Image.Load<Rgba32>(imageBytes);
    
                return image;
            }
        }
    
        // Image<TColor, TColor> 轉換為 Bitmap
        public Bitmap ImageToBitmap(Image<Rgba32> image)
        {
            using (MemoryStream stream = new MemoryStream())
            {
                // 將 ImageSharp 圖像保存為 Bitmap 格式
                image.Save(stream, ImageFormat.Png);
    
                // 創建並返回 Bitmap
                return new Bitmap(stream);
            }
        }
    
        // Mat 轉換為 Bitmap
        public Bitmap MatToBitmap(Mat mat)
        {
            // 使用 Emgu.CV 將 Mat 轉換為 Bitmap
            return mat.ToImage<Bgr, byte>().Bitmap;
        }
    
        // Bitmap 轉換為 Mat
        public Mat BitmapToMat(Bitmap bitmap)
        {
            // 使用 Emgu.CV 將 Bitmap 轉換為 Mat
            return new Mat(bitmap, DepthType.Cv8U, 3);
        }
    
        // Mat 轉換為 UMat
        public UMat MatToUMat(Mat mat)
        {
            // 使用 Emgu.CV 將 Mat 轉換為 UMat
            UMat umat = new UMat();
            mat.CopyTo(umat);
            return umat;
        }
    
        // UMat 轉換為 Mat
        public Mat UMatToMat(UMat umat)
        {
            // 使用 Emgu.CV 將 UMat 轉換為 Mat
            Mat mat = new Mat();
            umat.CopyTo(mat);
            return mat;
        }
    }
    ```