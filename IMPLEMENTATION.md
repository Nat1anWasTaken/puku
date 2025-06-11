# 編曲上傳功能實現

## 概述

已成功實現編曲創建和文件上傳功能，按照單一職責原則將邏輯分離為多個獨立的服務文件。

## 實現的服務

### 1. 編曲資料庫服務 (`src/lib/services/arrangement-service.ts`)

- **職責**: 處理編曲記錄的資料庫操作
- **功能**:
  - `createArrangement()`: 創建新的編曲記錄
  - `updateArrangementFilePath()`: 更新編曲的文件路徑

### 2. PDF文件服務 (`src/lib/services/pdf-service.ts`)

- **職責**: 處理PDF文件的合併操作
- **功能**:
  - `mergePDFFiles()`: 將多個PDF文件合併為一個
  - `createFileFromBytes()`: 從字節數組創建文件對象
- **依賴**: `pdf-lib` 庫

### 3. 儲存服務 (`src/lib/services/storage-service.ts`)

- **職責**: 處理文件上傳到Supabase儲存
- **功能**:
  - `uploadFileToStorage()`: 上傳文件到指定儲存桶
  - `getFilePublicUrl()`: 獲取文件的公開URL
  - `generateArrangementFilePath()`: 生成編曲文件路徑

### 4. 主上傳服務 (`src/lib/services/upload-service.ts`)

- **職責**: 協調整個上傳流程
- **功能**:
  - `uploadArrangement()`: 執行完整的上傳流程
  - 提供進度回調功能
  - 錯誤處理和回滾

### 5. 自定義Hook (`src/hooks/use-upload-arrangement.ts`)

- **職責**: 為React組件提供上傳狀態管理
- **功能**:
  - 管理loading、progress、error狀態
  - 提供上傳方法
  - 狀態重置功能

## 上傳流程

1. **創建編曲記錄** (20%進度)

   - 在資料庫中插入編曲元數據
   - `file_path` 初始設為 null

2. **合併PDF文件** (40%進度)

   - 使用 `pdf-lib` 按順序合併所有PDF文件
   - 生成單一的合併PDF

3. **上傳文件** (70%進度)

   - 將合併的PDF上傳到 Supabase 儲存
   - 文件路徑格式: `arrangements/{arrangement_id}.pdf`

4. **更新記錄** (90%進度)

   - 更新編曲記錄的 `file_path` 欄位

5. **完成** (100%進度)
   - 返回編曲ID和文件路徑

## 組件更新

### `UploadForm` 組件

- 整合了所有上傳服務
- 添加了進度條顯示
- 添加了錯誤處理和顯示
- 文件選擇和驗證
- 表單重置功能

## 技術特點

1. **單一職責原則**: 每個服務文件只負責一個特定功能
2. **錯誤處理**: 完善的錯誤捕獲和用戶友好的錯誤信息
3. **進度反饋**: 實時的上傳進度顯示
4. **類型安全**: 完整的TypeScript類型定義
5. **可擴展性**: 模塊化設計便於後續功能擴展

## 依賴

- `pdf-lib`: PDF文件合併
- `@supabase/ssr`: Supabase客戶端
- `@chakra-ui/react`: UI組件庫

## 文件結構

```
src/
├── lib/services/
│   ├── arrangement-service.ts    # 編曲資料庫操作
│   ├── pdf-service.ts            # PDF文件處理
│   ├── storage-service.ts        # 文件儲存
│   └── upload-service.ts         # 主上傳協調
├── hooks/
│   └── use-upload-arrangement.ts # 上傳狀態管理
└── components/
    └── upload-form.tsx           # 上傳表單組件
```

## 使用方式

```tsx
// 在組件中使用
const { upload, isLoading, progress, error } = useUploadArrangement();

// 執行上傳
const result = await upload({
  title: "編曲標題",
  composers: ["作曲家1", "作曲家2"],
  ensembleType: "concert_band",
  files: selectedFiles
});
```

## 下一步優化

1. 添加文件大小驗證
2. 實現上傳取消功能
3. 添加文件預覽功能
4. 實現批量上傳
5. 添加更詳細的錯誤分類和處理
