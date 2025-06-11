# Supabase 設定指南

## 🎉 成功完成 Firebase 到 Supabase 的遷移！

您的專案已成功從 Firebase 遷移到 Supabase。以下是設定說明：

## 環境變數設定

1. 在專案根目錄創建 `.env.local` 檔案
2. 添加以下環境變數：

```bash
# Supabase 設定
NEXT_PUBLIC_SUPABASE_URL=您的_supabase_專案_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=您的_supabase_匿名_金鑰
```

## 取得 Supabase 憑證

1. 前往 [Supabase Dashboard](https://supabase.com/dashboard)
2. 創建新專案或選擇現有專案
3. 前往 Settings > API
4. 複製 `Project URL` 和 `anon public` 金鑰

## 認證設定

### Google OAuth 設定（可選）

如果您想使用 Google 登入功能：

1. 在 Supabase Dashboard 中前往 Authentication > Providers
2. 啟用 Google 提供者
3. 添加您的 Google OAuth 憑證
4. 設定重定向 URL：`https://您的域名.supabase.co/auth/v1/callback`

## 功能說明

遷移後的功能包括：

- ✅ 電子郵件/密碼註冊和登入
- ✅ Google OAuth 登入
- ✅ 會話管理
- ✅ 自動重定向
- ✅ 中文本地化

## 變更內容

### 已移除的檔案

- `src/lib/firebase.ts` - Firebase 設定檔案
- `src/hooks/use-auth.ts` - 自定義認證 hook

### 新增的檔案

- `src/lib/supabase.ts` - Supabase 設定檔案

### 更新的檔案

- `src/components/navbar.tsx` - 使用 Supabase 認證
- `src/components/login-form.tsx` - 使用 Supabase 登入
- `src/components/register-form.tsx` - 使用 Supabase 註冊
- `package.json` - 更新依賴

## 開始使用

```bash
# 安裝依賴
bun install

# 設定環境變數
cp .env.example .env.local
# 編輯 .env.local 添加您的 Supabase 憑證

# 啟動開發伺服器
bun dev
```

## 注意事項

- 確保在 `.env.local` 中設定正確的 Supabase 憑證
- Supabase 的使用者物件結構與 Firebase 略有不同，我們已經在程式碼中處理了這些差異
- 所有介面已本地化為繁體中文
