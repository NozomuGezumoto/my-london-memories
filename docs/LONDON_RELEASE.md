# My London リリース手順

ロンドン向けビルドと App Store / Google Play リリースに必要な手順とドキュメントです。

---

## 1. 事前準備

### 1.1 EAS Project ID の設定（必須）

**既に「my-london」プロジェクトを EAS で作成済みの場合**（推奨）

「A project with this slug has previously been created」と出た場合は、新規作成ではなく既存プロジェクトの **Project ID** を取得して設定します。

**方法 A: EAS CLI で一覧から取得**

```bash
eas project:list
```

一覧から **my-london** の Project ID（UUID）をコピーし、下記のとおり `app.config.js` に設定します。

**方法 B: Expo ダッシュボードで取得**

1. [expo.dev](https://expo.dev) にログイン
2. アカウント **nozomusp** → Projects → **my-london** を開く
3. プロジェクト設定または URL に表示されている **Project ID**（UUID）をコピー

**app.config.js に設定**

```javascript
// app.config.js
const CITY_EAS_PROJECT_IDS = {
  kyoto: 'be8cf4b8-2805-49b0-bf67-c791a8dfcf52',
  paris: '01360b68-1eb7-40be-b344-40a2e69a8522',
  london: 'ここに取得した Project ID（UUID）を貼り付け',
};
```

**まだ my-london を一度も作っていない場合**

```bash
CITY=london eas init
```

で新規作成し、表示された Project ID を上記のとおり `app.config.js` に設定します。

### 1.2 必要なアカウント

- **Expo / EAS**: [expo.dev](https://expo.dev) アカウント（owner: `nozomusp`）
- **Apple**: Apple Developer Program（App Store Connect）
- **Google**: Google Play Console 開発者アカウント

---

## 2. ビルド

### 2.1 ローカルで動作確認（任意）

```bash
npm run start:london
# または（macOS/Linux）
CITY=london npx expo start --tunnel
```

### 2.2 EAS でビルド

**iOS**

```bash
npm run build:london
# プラットフォーム指定する場合
eas build --profile london -p ios
```

**Android**

```bash
eas build --profile london -p android
```

**両方**

```bash
eas build --profile london -p all
```

ビルド完了後、[expo.dev](https://expo.dev) のプロジェクト「My London」から成果物を確認できます。

---

## 3. ストア申請用情報

### 3.1 アプリ識別子

| 項目 | 値 |
|------|-----|
| **アプリ名** | My London |
| **Bundle ID (iOS)** | `com.mycity.mylondon` |
| **Package name (Android)** | `com.mycity.mylondon` |
| **URL Scheme** | `mylondon` |

### 3.2 ストア用テキスト（英語）

**短い説明（サブタイトル）**

```
Pin your London memories on the map.
```

**説明文（Description）**

```
My London is a personal memory map for the city you love. Drop pins on the map to save your favourite spots—cafés, parks, museums, and hidden gems—with photos and notes. No social features, no ratings: just your own London diary on the map.

• Map centred on London with clustering
• Photo pins and text pins with emoji
• Categories and star ranking (1–3)
• Filter by category
• Offline-friendly storage on your device

Perfect for travellers and locals who want to keep a visual record of their London moments.
```

**キーワード（iOS、カンマ区切り）**

```
London, map, memories, pins, travel, diary, photo, places, UK
```

**プライバシーポリシー（URL）**

- アプリ内で位置・写真・メモを端末内に保存する旨を記載したプライバシーポリシー URL を準備し、ストアの「プライバシーポリシー」欄に設定してください。
- 例: `https://your-domain.com/privacy` または GitHub Pages など。

### 3.3 ストア用テキスト（日本語・任意）

**短い説明**

```
ロンドンの思い出を地図にピンで残そう。
```

**説明文**

```
My London は、ロンドンで過ごした場所を地図にピンで残すアプリです。カフェ、公園、博物館、お気に入りのスポットに写真やメモをつけて保存できます。SNS機能や評価はなく、あなた専用のロンドン日記です。

・ロンドン中心の地図とピンのクラスタ表示
・写真ピン・テキストピン（絵文字対応）
・カテゴリと星1〜3のランク
・カテゴリでフィルター
・データは端末内に保存

旅行者もロンドン在住の方も、思い出を地図で残したい方に。
```

---

## 4. ストア提出（Submit）

ビルドが成功したら、EAS Submit でストアに提出できます。

**iOS（App Store Connect）**

```bash
eas submit --profile london -p ios
# 最新ビルドを自動選択するか、ビルド ID を指定
```

**Android（Google Play Console）**

```bash
eas submit --profile london -p android
```

初回提出時は、各ストアの管理画面で以下を設定してください。

- **App Store Connect**: アプリ名、説明、キーワード、カテゴリ、スクリーンショット、プライバシーポリシー URL、年齢制限など
- **Google Play Console**: ストア掲載情報、コンテンツレーティング、プライバシーポリシー、データの安全性など

---

## 5. リリース前チェックリスト

- [ ] `app.config.js` の `CITY_EAS_PROJECT_IDS.london` に EAS Project ID を設定済み
- [ ] `eas build --profile london` で iOS / Android ビルドが成功
- [ ] 実機で My London として起動・動作確認
- [ ] プライバシーポリシー URL を準備済み
- [ ] App Store Connect / Google Play Console でアプリ登録・ストア情報を入力済み
- [ ] スクリーンショット（各デバイスサイズ）を準備
- [ ] `eas submit --profile london` で提出完了

---

## 6. 参考コマンド一覧

| 目的 | コマンド |
|------|----------|
| ローカル起動（London） | `npm run start:london` |
| EAS ビルド（London） | `npm run build:london` または `eas build --profile london -p ios` |
| iOS 提出 | `eas submit --profile london -p ios` |
| Android 提出 | `eas submit --profile london -p android` |
| ビルド一覧確認 | `eas build:list` |

---

## 7. トラブルシューティング

- **ビルド時に別都市の名前が出る**: `app.config.js` の `CITY_EAS_PROJECT_IDS.london` が空のままの場合、EAS が Paris 用プロジェクトにフォールバックしている可能性があります。London 用に `CITY=london eas init` を実行し、Project ID を設定してください。
- **Submit でプロジェクトを聞かれる**: `--profile london` を指定していることを確認し、`app.config.js` の `extra.eas.projectId` が London の Project ID になっているか確認してください。

以上で、My London をロンドン向けにビルド・リリースするために必要なドキュメントと手順の整備は完了です。
