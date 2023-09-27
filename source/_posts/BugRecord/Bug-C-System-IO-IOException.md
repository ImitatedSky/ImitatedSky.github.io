---
title: '(Bug)C# System.IO.IOException:'
tags:
  - [C#]
  - [Bug]
cover: /img/cover/code.jpg
date: 2023-09-27 11:47:04
---

System.IO.IOException: '由於另一個處理序正在使用檔案 'C:\..\..'，所以無法存取該檔案。’

```csharp
//原先我用一個
path = @"C:\..\.."

System.Windows.Controls.Image image = new System.Windows.Controls.Image();
image.Source = path

//後面我要刪除這個檔案時
File.Delete(path)

#region 錯誤訊息
System.IO.IOException: '由於另一個處理序正在使用檔案 'C:\..\..'，所以無法存取該檔案。’
#endregion
```

## Solve

```csharp
path = @"C:\..\.."

System.Windows.Controls.Image image = new System.Windows.Controls.Image();
System.Drawing.Image img = System.Drawing.Image.FromFile(ImagePath);
image.Source = System.Windows.Interop.Imaging.CreateBitmapSourceFromHBitmap(
                                          ((Bitmap)img).GetHbitmap(),
                                            IntPtr.Zero,
                                            Int32Rect.Empty,
                                          BitmapSizeOptions.FromEmptyOptions());

img.Dispose();
```

這樣就不會綁定這圖片