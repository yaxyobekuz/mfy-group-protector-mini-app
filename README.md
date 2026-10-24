# Viloyat shtabi — mobil ilova (fuqaro murojaati)

Telegram Mini App: fuqaro hududidagi muammoni surat, joy va tavsif
bilan yuboradi va javobni shu yerda ko'radi.

```
Telegram Mini App    toifa → surat → joy → tavsif → tasdiq
     ↓               (AI faqat TOIFANI taklif qiladi)
issues               source = `mobile`, citizenId to'ldirilgan
     ↓
javob → fuqaroning SHAXSIY chatiga (guruhga EMAS)
```

---

## Ishga tushirish

```bash
npm install
npm run dev        # http://localhost:3100
```

`.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

Serverda `MOBILE_DEV_AUTH=1` bo'lsa, ilovani **brauzerda** ham ochish
mumkin: Telegram imzosi bo'lmaganda u `/mobile/auth/dev` orqali sinov
hisobiga kiradi. ⚠️ Bu yo'l `NODE_ENV=production` da server tomonidan
**rad etiladi**, bayroq berilgan bo'lsa ham.

---

## Buzilmasligi kerak bo'lgan qoidalar

### Fuqaro — xodim emas

`Citizen` va `User` — **ikki alohida jadval**. Fuqaroda parol ham,
ruxsat ro'yxati ham, hududiy qamrov ham yo'q. Ikkisini bitta jadvalga
qo'shish `permissions` ustunini butun aholiga tarqatardi.

Shuning uchun tokeni ham **uchinchi alohida sir** bilan imzolanadi
(`MOBILE_JWT_SECRET`): fuqaro tokeni xodim tokeni sifatida o'tib
ketishi **strukturaviy** imkonsiz.

### AI faqat taklif qiladi

Model yo'nalishni **tanlaydi**, matn **yozmaydi** — serverdagi
`signal-ai.service.ts` bilan ayni qoida.

⚠️ Bu "signal — muammo emas" doktrinasini **buzmaydi**: u yerda AI
"bu umuman muammomi?" deb taxmin qiladi, bu yerda esa muammo borligini
fuqaroning o'zi aytyapti va taklifni **o'zi tasdiqlaydi** (5-qadam).
Odam qarori oqimdan chiqib ketmaydi — u panel xodimidan fuqaroning
o'ziga ko'chadi.

AI yiqilsa yoki sozlamada o'chirilsa — oqim **taklifsiz davom etadi**.

### Yo'nalishlar ilovaga tegishli emas

Ilovadagi ro'yxat — `issue_categories` ning **o'zi**. Ilova uchun
alohida, mayda toifalar ochilsa, AI prompt'i bilan mos kelmay qolardi
va botdan/ilovadan kelgan murojaatlar boshqa-boshqa yo'nalishlarga
tushib, hisobotda ikkita ro'yxat paydo bo'lardi.

Ilova uchun qo'shilgani — `icon`, `slaHours`, `orgName`.

### Hudud murojaatga muhrlanadi

`Issue.mahallaId` yaratishda **nusxa** sifatida yoziladi va fuqaro
profilidan jonli o'qilmaydi — ildizdagi `CLAUDE.md` qoidasi. Fuqaro
ko'chib ketsa ham o'tgan oy hisoboti o'zgarmaydi.

`lat`/`lng` ham **muhrlangan**: `mahallaId` keyin tuzatilishi mumkin,
lekin "muammo aynan shu yerda edi" degan dalil joyida qoladi.

### Ko'rinayotgan narsa = saqlanadigan qiymat

Joy tanlash xaritasida qadalgan nuqta **ekranda ko'rinadi**, shuning
uchun uning koordinatasi xarita ochilishi bilan darhol yoziladi
(`leaflet-map.tsx`). Faqat surilganda yozilsa, nuqtani to'g'ri joyda
deb topgan odam hech narsa surmay davom etardi — murojaat esa joysiz
ketardi.

### Fayl — dalil

Surat/video **append-only**: o'chirilmaydi, tahrirlanmaydi (murojaat
bilan birga `Cascade` dan tashqari). Fuqaro "chiqindi uyumi" deb surat
yuborgan, keyin surat yo'qolsa, murojaatning asosi qolmaydi.

⚠️ Fayl turi **ichidagi baytlardan** aniqlanadi, `Content-Type` dan
emas (`uploads.service.ts`) — mijoz yozgan sarlavhaga ishonib bo'lmaydi.

### Javob guruhga ketmaydi

Bot MFY guruhida kuzatuvchi va hech narsa yozmaydi (ildizdagi
`CLAUDE.md`). Fuqaroga javob uning **shaxsiy** chatiga boradi
(`citizen.telegramId`) — bu chat o'qilmaydi va tahlil qilinmaydi, ya'ni
qoida buzilmaydi.

### Fuqaro murojaatni tahrirlamaydi

Yuborilgandan keyin u rasmiy navbat yozuvi. Qo'shimcha aytish — **izoh**
orqali (`IssueComment`, append-only). Yopilgan murojaatga izoh
yozilmaydi: u hech kimning navbatiga tushmasdi.

### Chegaralar ikki joyda

`shared/config/limits.ts` — **qulaylik** (sanoqchi, tugmani o'chirish).
Haqiqiy tekshiruv **serverda** (`mobile.dto.ts`): ilovadagi raqamni
brauzer konsolidan o'zgartirish bir qatorlik ish.

Ikkisi ajralsa, ilova qabul qilgan matn serverda rad etilib, fuqaro
"yuborildi" deb o'ylab qolardi.

---

## Sana formati — ildizdagi qoida bilan AYNI

```
kun → 21-may, 2025   |   kun+vaqt → 21-may, 2025 14:30
```

Yagona manba: `src/shared/lib/date.ts` (server va paneldagi
fayllarning ko'zgusi).

⚠️ `toLocaleDateString()`, `Intl.DateTimeFormat`, qo'lda yig'ilgan
shablon — **taqiqlangan**. `getHours()` ham: Toshkent devor-soati `+5`
qo'shib, `getUTC*` bilan o'qiladi.

Imlo: **`sentabr`**, **`oktabr`**.

---

## Qatlam qoidasi (FSD)

```
app → widgets → features → entities → shared
```

Import **faqat pastga**. `shared` hech kimni import qilmaydi.

---

## Yangi kod yozganda

| Nima qilmoqchisiz | Qayerga qarang |
|---|---|
| Yangi so'rov | `features/<x>/api.ts` — kalit `shared/api/query-keys.ts` dan |
| Yangi tur | `shared/api/types.ts` (serverdagi javob bilan qo'lda sinxron) |
| Yorliq/matn | `shared/config/labels.ts` |
| Yo'nalish belgisi | `shared/config/icons.tsx` **va** paneldagi `category-icons.ts` |
| Chegara | `shared/config/limits.ts` **va** serverdagi `mobile.dto.ts` |
| Sana ko'rsatish | `shared/lib/date.ts` |
| Telegram bilan ishlash | `shared/lib/telegram.ts` (`window.Telegram` ga to'g'ridan-to'g'ri murojaat **yo'q**) |

⚠️ Yangi formatlovchi, yangi yorliq lug'ati, yangi query kaliti
**yozilmaydi** — mavjud yagona manba kengaytiriladi.

---

## Telegram'ga ulash

Bot: **@ViloyatShtabiBot**

### Ishlab chiqishda sinash (tunnel)

Telegram mini-ilovani **faqat HTTPS**'dan ochadi, mashinada esa HTTPS
yo'q. Shuning uchun tunnel kerak:

```bash
node tools/mini-app-tunnel.mjs
```

Skript tunnel ochadi va manzilni **to'rtta joyga** yozadi:
`mobile/.env.local` (`ALLOWED_DEV_ORIGINS`), `server/.env`
(`MOBILE_APP_URL`, `CORS_ORIGINS`), `bot/.env` (`MOBILE_APP_URL`) va
Telegram menyu tugmasi. Keyin server, bot va ilovani qayta ishga
tushiring.

⚠️ **Ilova `npm run dev` EMAS, qurilgan holda ishlatiladi:**

```bash
npm run build && npm run start
```

Sabab: Next ishlab chiqish rejimida o'z xizmat manzillarini boshqa
domendan kelgan so'rovga **403** bilan rad etadi va natijada React
**hidratatsiya bo'lmaydi** — sahifa yuklanadi, lekin ekranda
«Ilova ochilmoqda…» abadiy turib qoladi. Konsolda faqat HMR
websocket xatosi ko'rinadi, ya'ni sababni topish qiyin.
`ALLOWED_DEV_ORIGINS` buni yumshatadi, lekin qurilgan ilova baribir
ishonchliroq.

### Bot ikki joyda ishga tushsa (`409 Conflict`)

Telegram bitta token uchun **faqat bitta** `getUpdates` oqimiga ruxsat
beradi. Ikkinchi nusxa ulansa, ikkalasiga ham `409` keladi.

⚠️ Bot bundan **yiqilmaydi**: har 5 soniyada qayta urinadi va birinchi
to'qnashuvda logga to'liq tushuntirish chiqaradi
(`bot/src/main.ts#startPolling`). Qayta deploy paytidagi o'tkinchi
ustma-ustlik shu bilan o'zi tuzaladi.

⚠️ Lekin bot **boshqa mashinada** ham ishlayotgan bo'lsa, qayta urinish
yordam bermaydi va bu holat **jiddiy**: kelgan xabarlarning bir qismini
o'sha nusxa olib ketadi, ya'ni murojaatlar tasodifiy yo'qoladi. Logdagi
ogohlantirish aynan shuning uchun qisqa emas, to'liq.

Tekshirish — bironta bot ishlamayotganda:

```bash
curl "https://api.telegram.org/bot<TOKEN>/getUpdates?timeout=1"
```

`409` qaytsa — token boshqa joyda ishlatilmoqda.

⚠️ **Mini-ilova bundan mustaqil**: menyu tugmasi Telegram tomonidagi
sozlama va bot umuman ishlamayotganda ham ochiladi. Botsiz ishlamaydigani
— `/start` va `/app` matnlari.

### Menyu tugmasi — BotFather kerak emas

Menyu tugmasi oddiy Bot API chaqiruvi bilan qo'yiladi
(`setChatMenuButton`), skript buni o'zi qiladi.

BotFather faqat **nomli** mini-ilova (`t.me/<bot>/<app>`) uchun kerak
va u ixtiyoriy:

```
@BotFather → /newapp → botni tanlang → nom, tavsif, rasm → URL
```

### Ishlab chiqarishga chiqarish

1. Ilovani HTTPS domenga joylashtiring va `API_PROXY_TARGET` ni
   serverning ichki manziliga qo'ying (`NEXT_PUBLIC_API_URL=/api`).
   Shunda bitta domen yetarli va CORS umuman kerak emas.
2. Serverda `MOBILE_BOT_TOKEN` (yoki `BOT_TOKEN`) — **o'sha botning**
   tokeni: `initData` imzosi shu bilan tekshiriladi.
3. Serverda `MOBILE_DEV_AUTH` ni **olib tashlang** va
   `NODE_ENV=production` qo'ying.
4. `bot/.env` dagi `MOBILE_APP_URL` ni o'sha domenga qo'ying.
5. Menyu tugmasini bir marta qo'ying:
   `node tools/mini-app-tunnel.mjs --url=https://sizning-domeningiz`

⚠️ `ALLOWED_DEV_ORIGINS` ishlab chiqarishda **kerak emas** — u faqat
ishlab chiqish rejimidagi tekshiruvga tegishli.
