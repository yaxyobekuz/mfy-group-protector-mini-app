/**
 * MATNLAR — YAGONA MANBA (mini-ilova, to'rt til).
 *
 * ⚠️ MATN KOMPONENT ICHIDA YOZILMAYDI. `labels.ts` dagi qoida
 * butun ilovaga tarqaldi: bitta matn o'nlab joyda ko'rinadi va
 * har joyda qo'lda yozilsa, til almashganda bir qismi o'zbekcha
 * qolib ketardi — buni faqat o'sha tilda o'qiydigan odam sezardi.
 *
 * ⚠️ TUZILMA — TEKIS KALIT (`appeals.empty.title`), ichma-ich
 * obyekt EMAS: tekis kalitda tarjima tushib qolgani TURLAR
 * darajasida ko'rinadi (`Record<MessageKey, string>` to'ldirilmasa
 * TypeScript qurishni to'xtatadi). Ichma-ich obyektda esa yetishmagan
 * shox jimgina `undefined` berib, ekranda bo'sh joy qoldirardi.
 *
 * ⚠️ YANGI MATN QO'SHSANGIZ — TO'RTALA TILGA QO'SHING. Birini
 * tashlab ketish mumkin emas: `Record` to'liqligini talab qiladi va
 * qurish xato bilan to'xtaydi. Bu ataylab — "keyin tarjima qilamiz"
 * amalda hech qachon qilinmasdi.
 *
 * ⚠️ O'ZGARUVCHI QISM `{}` ICHIDA (`"{count} ta murojaat"`): tilga
 * qarab so'z TARTIBI o'zgaradi ("10 appeals" ↔ "10 ta murojaat")
 * va matnni bo'lakka bo'lib ulash rus tilida noto'g'ri tartib
 * berardi.
 */

import { LOCALES, type Locale } from "./locales";

const MESSAGES = {
  // ── UMUMIY ────────────────────────────────────────────────────
  "common.continue": ["Davom etish", "Давом этиш", "Продолжить", "Continue"],
  "common.save": ["Saqlash", "Сақлаш", "Сохранить", "Save"],
  "common.send": ["Yuborish", "Юбориш", "Отправить", "Send"],
  "common.cancel": ["Bekor qilish", "Бекор қилиш", "Отмена", "Cancel"],
  "common.close": ["Yopish", "Ёпиш", "Закрыть", "Close"],
  "common.select": ["Tanlang", "Танланг", "Выберите", "Select"],
  "common.notSelected": ["Tanlanmagan", "Танланмаган", "Не выбрано", "Not selected"],
  "common.optional": ["Ixtiyoriy", "Ихтиёрий", "Необязательно", "Optional"],
  "common.retry": ["Qaytadan urinish", "Қайтадан уриниш", "Повторить", "Try again"],
  "common.loading": ["Yuklanmoqda…", "Юкланмоқда…", "Загрузка…", "Loading…"],
  "common.error": ["Xatolik yuz berdi", "Хатолик юз берди", "Произошла ошибка", "Something went wrong"],
  "common.errorHint": [
    "Internetni tekshirib, qaytadan urinib ko'ring",
    "Интернетни текшириб, қайтадан уриниб кўринг",
    "Проверьте интернет и попробуйте снова",
    "Check your connection and try again",
  ],
  "common.you": ["siz", "сиз", "вы", "you"],

  // ── PASTKI MENYU ──────────────────────────────────────────────
  "nav.home": ["Bosh sahifa", "Бош саҳифа", "Главная", "Home"],
  "nav.map": ["Xarita", "Харита", "Карта", "Map"],
  "nav.news": ["Yangiliklar", "Янгиликлар", "Новости", "News"],
  "nav.profile": ["Profil", "Профил", "Профиль", "Profile"],
  "nav.newAppeal": ["Murojaat yuborish", "Мурожаат юбориш", "Отправить обращение", "Submit appeal"],

  // ── BOSH SAHIFA ───────────────────────────────────────────────
  "home.title": [
    "Toza va qulay hudud uchun birga!",
    "Тоза ва қулай ҳудуд учун бирга!",
    "Вместе за чистый и удобный район!",
    "Together for a clean neighbourhood!",
  ],
  "home.subtitle": [
    "Hududingizdagi muammolarni fotosurat bilan yuboring. Biz ularni hal qilishga yordam beramiz.",
    "Ҳудудингиздаги муаммоларни фотосурат билан юборинг. Биз уларни ҳал қилишга ёрдам берамиз.",
    "Отправляйте проблемы района с фотографией. Мы поможем их решить.",
    "Report problems in your area with a photo. We will help resolve them.",
  ],
  "home.defaultPlace": ["Andijon viloyati", "Андижон вилояти", "Андижанская область", "Andijan region"],
  "home.tile.map": ["Xarita", "Харита", "Карта", "Map"],
  "home.tile.mapHint": ["Murojaatlar xaritasi", "Мурожаатлар харитаси", "Карта обращений", "Appeals map"],
  "home.tile.appeals": ["Mening murojaatlarim", "Менинг мурожаатларим", "Мои обращения", "My appeals"],
  "home.tile.appealsHint": ["Holatini kuzating", "Ҳолатини кузатинг", "Следите за статусом", "Track the status"],
  "home.tile.news": ["Yangiliklar", "Янгиликлар", "Новости", "News"],
  "home.tile.newsHint": ["Va natijalar", "Ва натижалар", "И результаты", "And results"],
  "home.tile.rating": ["Reyting", "Рейтинг", "Рейтинг", "Rating"],
  "home.tile.ratingHint": ["Faol fuqarolar", "Фаол фуқаролар", "Активные жители", "Active citizens"],
  "home.stats.title": ["Viloyat bo'yicha", "Вилоят бўйича", "По области", "Across the region"],
  "home.stats.total": ["Jami murojaat", "Жами мурожаат", "Всего обращений", "Total appeals"],
  "home.stats.resolved": ["Hal qilindi", "Ҳал қилинди", "Решено", "Resolved"],
  "home.stats.last30": ["Oxirgi 30 kun", "Охирги 30 кун", "За 30 дней", "Last 30 days"],
  "home.mine.title": ["Sizning murojaatlaringiz", "Сизнинг мурожаатларингиз", "Ваши обращения", "Your appeals"],
  "home.mine.open": [
    "{count} ta ko'rib chiqilmoqda",
    "{count} та кўриб чиқилмоқда",
    "{count} на рассмотрении",
    "{count} in review",
  ],
  "home.mine.resolved": [
    "{count} ta hal qilindi",
    "{count} та ҳал қилинди",
    "{count} решено",
    "{count} resolved",
  ],

  // ── MUROJAATLAR RO'YXATI ──────────────────────────────────────
  "appeals.title": ["Mening murojaatlarim", "Менинг мурожаатларим", "Мои обращения", "My appeals"],
  "appeals.tab.all": ["Barchasi", "Барчаси", "Все", "All"],
  "appeals.tab.open": ["Jarayonda", "Жараёнда", "В работе", "In progress"],
  "appeals.tab.closed": ["Yopilgan", "Ёпилган", "Закрытые", "Closed"],
  "appeals.empty.all": [
    "Hali murojaat yubormagansiz",
    "Ҳали мурожаат юбормагансиз",
    "Вы ещё не отправляли обращений",
    "You haven't sent any appeals yet",
  ],
  "appeals.empty.allHint": [
    "Hududingizdagi muammoni fotosurat bilan yuboring — biz uni mas'ul tashkilotga yo'naltiramiz.",
    "Ҳудудингиздаги муаммони фотосурат билан юборинг — биз уни масъул ташкилотга йўналтирамиз.",
    "Отправьте проблему района с фотографией — мы направим её ответственной организации.",
    "Send a problem with a photo — we will route it to the responsible organisation.",
  ],
  "appeals.empty.open": [
    "Jarayondagi murojaat yo'q",
    "Жараёндаги мурожаат йўқ",
    "Нет обращений в работе",
    "No appeals in progress",
  ],
  "appeals.empty.closed": [
    "Yopilgan murojaat yo'q",
    "Ёпилган мурожаат йўқ",
    "Нет закрытых обращений",
    "No closed appeals",
  ],

  // ── MUROJAAT KARTASI ──────────────────────────────────────────
  "appeal.answer": ["Javob", "Жавоб", "Ответ", "Response"],
  "appeal.rejectReason": ["Rad etish sababi", "Рад этиш сабаби", "Причина отказа", "Rejection reason"],
  "appeal.chat": ["Yozishma", "Ёзишма", "Переписка", "Conversation"],
  "appeal.sentAt": ["Yuborilgan", "Юборилган", "Отправлено", "Submitted"],
  "appeal.dueAt": ["Javob muddati", "Жавоб муддати", "Срок ответа", "Response due"],
  "appeal.defaultOrg": ["Viloyat shtabi", "Вилоят штаби", "Областной штаб", "Regional HQ"],
  "appeal.addInfo": [
    "Qo'shimcha ma'lumot yuborish",
    "Қўшимча маълумот юбориш",
    "Отправить дополнение",
    "Send more information",
  ],
  "appeal.addInfoTitle": ["Qo'shimcha ma'lumot", "Қўшимча маълумот", "Дополнение", "More information"],
  "appeal.addInfoPlaceholder": [
    "Qo'shimcha nima aytmoqchisiz?",
    "Қўшимча нима айтмоқчисиз?",
    "Что вы хотите добавить?",
    "What would you like to add?",
  ],
  "appeal.addInfoHint": [
    "Bu matn murojaat yozishmasiga qo'shiladi",
    "Бу матн мурожаат ёзишмасига қўшилади",
    "Текст будет добавлен в переписку",
    "This text is added to the conversation",
  ],
  "appeal.flag.hazard": ["Xavfli holat", "Хавфли ҳолат", "Опасная ситуация", "Hazardous"],
  "appeal.flag.longStanding": ["Uzoq davom etmoqda", "Узоқ давом этмоқда", "Длится долго", "Long-standing"],
  "appeal.flag.repeat": ["Takroriy murojaat", "Такрорий мурожаат", "Повторное обращение", "Repeat appeal"],
  "appeal.author.admin": ["Ma'muriyat", "Маъмурият", "Администрация", "Administration"],
  "appeal.author.me": ["Siz", "Сиз", "Вы", "You"],

  // ── HOLATLAR ──────────────────────────────────────────────────
  "status.new": ["Qabul qilindi", "Қабул қилинди", "Принято", "Received"],
  "status.in_progress": ["Bajarilmoqda", "Бажарилмоқда", "Выполняется", "In progress"],
  "status.resolved": ["Hal qilindi", "Ҳал қилинди", "Решено", "Resolved"],
  "status.rejected": ["Rad etildi", "Рад этилди", "Отклонено", "Rejected"],

  // ── USTUVORLIK ────────────────────────────────────────────────
  "priority.low": ["Past", "Паст", "Низкий", "Low"],
  "priority.normal": ["O'rta", "Ўрта", "Средний", "Normal"],
  "priority.high": ["Yuqori", "Юқори", "Высокий", "High"],
  "priority.urgent": ["Shoshilinch", "Шошилинч", "Срочный", "Urgent"],

  // ── SEHRGAR ───────────────────────────────────────────────────
  "wizard.step.category": ["Muammo turini tanlang", "Муаммо турини танланг", "Выберите тип проблемы", "Choose the problem type"],
  "wizard.step.categoryHint": [
    "Eng mos turini tanlang. AI tizim uni avtomatik tasniflaydi.",
    "Энг мос турини танланг. AI тизим уни автоматик таснифлайди.",
    "Выберите подходящий тип. ИИ классифицирует его автоматически.",
    "Pick the closest type. The AI will classify it automatically.",
  ],
  "wizard.step.media": ["Foto yoki video qo'shing", "Фото ёки видео қўшинг", "Добавьте фото или видео", "Add a photo or video"],
  "wizard.step.mediaHint": [
    "Muammoni aniq ko'rsatadigan surat yoki video yuboring.",
    "Муаммони аниқ кўрсатадиган сурат ёки видео юборинг.",
    "Отправьте фото или видео, где видно проблему.",
    "Send a photo or video that clearly shows the problem.",
  ],
  "wizard.step.location": ["Manzilni belgilang", "Манзилни белгиланг", "Укажите адрес", "Mark the location"],
  "wizard.step.locationHint": [
    "Xaritada aniq joyni belgilang yoki manzilni qo'lda kiriting.",
    "Харитада аниқ жойни белгиланг ёки манзилни қўлда киритинг.",
    "Отметьте точку на карте или введите адрес вручную.",
    "Mark the exact spot on the map or type the address.",
  ],
  "wizard.step.details": ["Batafsil ma'lumot", "Батафсил маълумот", "Подробности", "Details"],
  "wizard.step.detailsHint": [
    "Muammoni qisqacha tasvirlang. Bu ijrochilarga tezroq hal qilishga yordam beradi.",
    "Муаммони қисқача тасвирланг. Бу ижрочиларга тезроқ ҳал қилишга ёрдам беради.",
    "Кратко опишите проблему. Это поможет решить её быстрее.",
    "Briefly describe the problem. This helps resolve it faster.",
  ],
  "wizard.step.review": ["AI tahlili", "AI таҳлили", "Анализ ИИ", "AI analysis"],
  "wizard.step.reviewHint": [
    "Tizim yuborgan ma'lumotlaringizni tahlil qildi. Agar hammasi to'g'ri bo'lsa, tasdiqlang.",
    "Тизим юборган маълумотларингизни таҳлил қилди. Агар ҳаммаси тўғри бўлса, тасдиқланг.",
    "Система проанализировала данные. Если всё верно — подтвердите.",
    "The system analysed your input. Confirm if everything is correct.",
  ],
  "wizard.submit": ["Murojaatni yuborish", "Мурожаатни юбориш", "Отправить обращение", "Submit appeal"],
  "wizard.exit.title": [
    "Murojaatni tashlab ketasizmi?",
    "Мурожаатни ташлаб кетасизми?",
    "Покинуть обращение?",
    "Leave this appeal?",
  ],
  "wizard.exit.body": [
    "Yozganlaringiz saqlanadi va keyingi safar shu joydan davom etishingiz mumkin.",
    "Ёзганларингиз сақланади ва кейинги сафар шу жойдан давом этишингиз мумкин.",
    "Введённое сохранится — в следующий раз продолжите с этого места.",
    "Your input is saved — you can continue from here next time.",
  ],
  "wizard.exit.leave": ["Tashlab ketish", "Ташлаб кетиш", "Покинуть", "Leave"],

  // ── 1-QADAM: YO'NALISH ────────────────────────────────────────
  "category.search": [
    "Muammo turini qidirish…",
    "Муаммо турини қидириш…",
    "Поиск типа проблемы…",
    "Search problem type…",
  ],
  "category.notFound": ["Mos yo'nalish topilmadi", "Мос йўналиш топилмади", "Ничего не найдено", "No matching type"],
  "category.sla": ["Javob: {value}", "Жавоб: {value}", "Ответ: {value}", "Reply: {value}"],

  // ── 4-QADAM: TAFSILOT ─────────────────────────────────────────
  "details.placeholder": [
    "Muammo haqida qisqacha yozing…",
    "Муаммо ҳақида қисқача ёзинг…",
    "Кратко опишите проблему…",
    "Briefly describe the problem…",
  ],
  "details.hint": [
    "Nima bo'lgani va qachondan beri davom etayotgani",
    "Нима бўлгани ва қачондан бери давом этаётгани",
    "Что случилось и как долго это длится",
    "What happened and how long it has lasted",
  ],
  "details.tooShort": [
    "Kamida {count} ta belgi yozing",
    "Камида {count} та белги ёзинг",
    "Введите минимум {count} символов",
    "Enter at least {count} characters",
  ],
  "details.extra": ["Qo'shimcha ma'lumot", "Қўшимча маълумот", "Дополнительно", "Additional info"],
  "details.hazard": ["Bu muammo xavfli", "Бу муаммо хавфли", "Это опасно", "This is hazardous"],
  "details.hazardHint": [
    "Insonlar hayoti uchun xavf mavjud",
    "Инсонлар ҳаёти учун хавф мавжуд",
    "Есть угроза жизни людей",
    "There is a risk to people's lives",
  ],
  "details.longStanding": [
    "Ko'p vaqtdan beri davom etmoqda",
    "Кўп вақтдан бери давом этмоқда",
    "Длится уже долго",
    "Has been going on for a long time",
  ],
  "details.repeat": ["Avval murojaat qilganman", "Аввал мурожаат қилганман", "Я уже обращался", "I have reported this before"],
  "details.repeatHint": [
    "Shu muammo bo'yicha javob olmaganman",
    "Шу муаммо бўйича жавоб олмаганман",
    "По этой проблеме ответа не было",
    "I received no response on this issue",
  ],
  "details.occurredAt": ["Taxminiy sana va vaqt", "Тахминий сана ва вақт", "Примерная дата и время", "Approximate date and time"],
  "details.occurredAtHint": [
    "Bo'sh qoldirsangiz — murojaat yuborilgan vaqt olinadi",
    "Бўш қолдирсангиз — мурожаат юборилган вақт олинади",
    "Если не заполнить — возьмём время отправки",
    "If left empty, the submission time is used",
  ],

  // ── 2-QADAM: SURAT ────────────────────────────────────────────
  "media.empty": [
    "Surat yoki video qo'shing",
    "Сурат ёки видео қўшинг",
    "Добавьте фото или видео",
    "Add a photo or video",
  ],
  "media.emptyHint": [
    "Surat murojaatni tezroq hal qilishga yordam beradi",
    "Сурат мурожаатни тезроқ ҳал қилишга ёрдам беради",
    "Фото поможет решить обращение быстрее",
    "A photo helps resolve the appeal faster",
  ],
  "media.addMore": ["Yana qo'shish", "Яна қўшиш", "Добавить ещё", "Add more"],
  "media.max": ["(maks. {count} ta)", "(макс. {count} та)", "(макс. {count})", "(max {count})"],
  "media.camera": ["Kameradan", "Камерадан", "С камеры", "Camera"],
  "media.gallery": ["Galereyadan", "Галереядан", "Из галереи", "Gallery"],
  "media.optional": [
    "Surat majburiy emas — usiz ham davom etishingiz mumkin",
    "Сурат мажбурий эмас — усиз ҳам давом этишингиз мумкин",
    "Фото необязательно — можно продолжить без него",
    "A photo is optional — you can continue without one",
  ],

  // ── 3-QADAM: JOY ──────────────────────────────────────────────
  "location.address": ["Manzil", "Манзил", "Адрес", "Address"],
  "location.addressPlaceholder": [
    "Masalan: Bobur ko'chasi, 12-uy",
    "Масалан: Бобур кўчаси, 12-уй",
    "Например: улица Бабура, дом 12",
    "For example: Bobur street, 12",
  ],
  "location.addressHint": [
    "Uy raqami yoki mo'ljal — ijrochiga joyni topishda yordam beradi",
    "Уй рақами ёки мўлжал — ижрочига жойни топишда ёрдам беради",
    "Номер дома или ориентир — поможет исполнителю найти место",
    "House number or landmark — helps the crew find the spot",
  ],
  "location.district": ["Tuman", "Туман", "Район", "District"],
  "location.mahalla": ["MFY", "МФЙ", "Махалля", "Neighbourhood"],
  "location.pickDistrict": ["Tumanni tanlang", "Туманни танланг", "Выберите район", "Choose a district"],
  "location.pickMahalla": ["MFY ni tanlang", "МФЙни танланг", "Выберите махаллю", "Choose a neighbourhood"],
  "location.noGeo": [
    "Qurilmangiz joylashuvni aniqlay olmaydi",
    "Қурилмангиз жойлашувни аниқлай олмайди",
    "Устройство не может определить местоположение",
    "Your device cannot determine the location",
  ],
  "location.denied": [
    "Joylashuvga ruxsat berilmagan — xaritadan qo'lda belgilang",
    "Жойлашувга рухсат берилмаган — харитадан қўлда белгиланг",
    "Доступ к геолокации запрещён — отметьте на карте вручную",
    "Location access denied — mark it on the map manually",
  ],
  "location.failed": [
    "Joylashuv aniqlanmadi — xaritadan qo'lda belgilang",
    "Жойлашув аниқланмади — харитадан қўлда белгиланг",
    "Местоположение не определено — отметьте на карте",
    "Location unavailable — mark it on the map",
  ],

  // ── 5-QADAM: AI TAHLILI ───────────────────────────────────────
  "review.result": ["Tahlil natijasi", "Таҳлил натижаси", "Результат анализа", "Analysis result"],
  "review.checking": ["Tekshirilmoqda…", "Текширилмоқда…", "Проверяется…", "Checking…"],
  "review.detected": [
    "Muammo turi avtomatik aniqlandi",
    "Муаммо тури автоматик аниқланди",
    "Тип проблемы определён автоматически",
    "The problem type was detected automatically",
  ],
  "review.yourChoice": [
    "Siz tanlagan yo'nalish qo'llanadi",
    "Сиз танлаган йўналиш қўлланади",
    "Применяется выбранная вами категория",
    "Your selected category will be used",
  ],
  "review.place": ["Joylashuv", "Жойлашув", "Местоположение", "Location"],
  "review.notSet": ["Ko'rsatilmagan", "Кўрсатилмаган", "Не указано", "Not specified"],
  "review.org": ["Mas'ul tashkilot", "Масъул ташкилот", "Ответственная организация", "Responsible organisation"],
  "review.sla": ["Taxminiy javob muddati", "Тахминий жавоб муддати", "Примерный срок ответа", "Estimated response time"],
  "review.suggestion": [
    "Tizim bu murojaat {category} yo'nalishiga ko'proq mos deb hisoblaydi ({confidence}%).",
    "Тизим бу мурожаат {category} йўналишига кўпроқ мос деб ҳисоблайди ({confidence}%).",
    "Система считает, что обращение больше подходит категории {category} ({confidence}%).",
    "The system thinks this appeal fits {category} better ({confidence}%).",
  ],
  "review.accept": [
    "Taklifni qabul qilish",
    "Таклифни қабул қилиш",
    "Принять предложение",
    "Accept suggestion",
  ],
  "review.keep": [
    "yoki o'z tanlovingizda qoling",
    "ёки ўз танловингизда қолинг",
    "или оставьте свой выбор",
    "or keep your choice",
  ],

  "location.useCurrent": [
    "Joriy joylashuvni ishlatish",
    "Жорий жойлашувни ишлатиш",
    "Использовать текущее местоположение",
    "Use current location",
  ],
  "location.unknown": ["Bilmayman", "Билмайман", "Не знаю", "I don't know"],
  "location.unknownHint": [
    "Hududni ma'muriyat o'zi aniqlaydi",
    "Ҳудудни маъмурият ўзи аниқлайди",
    "Район определит администрация",
    "The administration will determine the area",
  ],

  // ── MUVAFFAQIYAT ──────────────────────────────────────────────
  "success.title": [
    "Murojaat muvaffaqiyatli yuborildi!",
    "Мурожаат муваффақиятли юборилди!",
    "Обращение успешно отправлено!",
    "Your appeal has been submitted!",
  ],
  "success.body": [
    "Sizning murojaatingiz ro'yxatga olindi va mas'ul tashkilotga yo'naltirildi.",
    "Сизнинг мурожаатингиз рўйхатга олинди ва масъул ташкилотга йўналтирилди.",
    "Ваше обращение зарегистрировано и направлено ответственной организации.",
    "Your appeal is registered and routed to the responsible organisation.",
  ],
  "success.number": ["Murojaat raqami", "Мурожаат рақами", "Номер обращения", "Appeal number"],
  "success.copied": ["Raqam nusxalandi", "Рақам нусхаланди", "Номер скопирован", "Number copied"],
  "success.copyFailed": [
    "Nusxalab bo'lmadi — raqamni yozib oling",
    "Нусхалаб бўлмади — рақамни ёзиб олинг",
    "Не удалось скопировать — запишите номер",
    "Could not copy — please write the number down",
  ],
  "success.category": ["Muammo turi", "Муаммо тури", "Тип проблемы", "Problem type"],
  "success.place": ["Joylashuv", "Жойлашув", "Местоположение", "Location"],
  "success.sla": ["Taxminiy javob muddati", "Тахминий жавоб муддати", "Примерный срок ответа", "Estimated response time"],
  "success.track": [
    "Murojaat holatini kuzatish",
    "Мурожаат ҳолатини кузатиш",
    "Отслеживать обращение",
    "Track this appeal",
  ],
  "success.home": ["Bosh sahifaga qaytish", "Бош саҳифага қайтиш", "На главную", "Back to home"],

  // ── YANGILIKLAR ───────────────────────────────────────────────
  "news.title": ["Yangiliklar", "Янгиликлар", "Новости", "News"],
  "news.pinned": ["Muhim", "Муҳим", "Важное", "Pinned"],
  "news.empty": ["Hozircha yangilik yo'q", "Ҳозирча янгилик йўқ", "Пока новостей нет", "No news yet"],
  "news.emptyHint": [
    "Hududingizdagi e'lonlar va natijalar shu yerda ko'rinadi.",
    "Ҳудудингиздаги эълонлар ва натижалар шу ерда кўринади.",
    "Объявления и результаты по вашему району появятся здесь.",
    "Announcements and results for your area appear here.",
  ],

  // ── REYTING ───────────────────────────────────────────────────
  "rating.title": ["Faol fuqarolar", "Фаол фуқаролар", "Активные жители", "Active citizens"],
  "rating.province": ["Viloyat", "Вилоят", "Область", "Region"],
  "rating.myDistrict": ["Mening tumanim", "Менинг туманим", "Мой район", "My district"],
  "rating.empty": ["Reyting hali bo'sh", "Рейтинг ҳали бўш", "Рейтинг пока пуст", "The rating is empty"],
  "rating.emptyHint": [
    "Birinchi murojaatni yuborib, ro'yxatda birinchi bo'ling.",
    "Биринчи мурожаатни юбориб, рўйхатда биринчи бўлинг.",
    "Отправьте первое обращение и станьте первым в списке.",
    "Send the first appeal and top the list.",
  ],
  "rating.points": ["ball", "балл", "баллов", "points"],
  "rating.appeals": [
    "{count} ta murojaat",
    "{count} та мурожаат",
    "{count} обращений",
    "{count} appeals",
  ],

  // ── PROFIL ────────────────────────────────────────────────────
  "profile.title": ["Profil", "Профил", "Профиль", "Profile"],
  "profile.since": ["{date} dan beri", "{date} дан бери", "С {date}", "Since {date}"],
  "profile.stat.appeals": ["Murojaat", "Мурожаат", "Обращений", "Appeals"],
  "profile.stat.resolved": ["Hal qilindi", "Ҳал қилинди", "Решено", "Resolved"],
  "profile.stat.points": ["Ball", "Балл", "Баллы", "Points"],
  "profile.phone": ["Telefon raqami", "Телефон рақами", "Номер телефона", "Phone number"],
  "profile.phoneHint": [
    "Ixtiyoriy — ma'muriyat qayta aloqa qilishi uchun",
    "Ихтиёрий — маъмурият қайта алоқа қилиши учун",
    "Необязательно — для обратной связи",
    "Optional — so the administration can reach you",
  ],

  // ── TIL ───────────────────────────────────────────────────────
  "language.title": ["Til", "Тил", "Язык", "Language"],
  "language.pick": ["Tilni tanlang", "Тилни танланг", "Выберите язык", "Choose a language"],
  "language.changed": ["Til o'zgartirildi", "Тил ўзгартирилди", "Язык изменён", "Language changed"],

  // ── KIRISH XATOSI ─────────────────────────────────────────────
  "session.failed": [
    "Ilovaga kirib bo'lmadi",
    "Иловага кириб бўлмади",
    "Не удалось войти в приложение",
    "Could not sign in",
  ],
  "session.offline": [
    "Serverga ulanib bo'lmadi. Internetni tekshirib, ilovani qayta oching.",
    "Серверга уланиб бўлмади. Интернетни текшириб, иловани қайта очинг.",
    "Не удалось подключиться к серверу. Проверьте интернет и откройте приложение заново.",
    "Could not reach the server. Check your connection and reopen the app.",
  ],

  // ── BIRINCHI KIRISH ───────────────────────────────────────────
  "onboarding.welcome": [
    "Xush kelibsiz, {name}!",
    "Хуш келибсиз, {name}!",
    "Добро пожаловать, {name}!",
    "Welcome, {name}!",
  ],
  "onboarding.body": [
    "Murojaatlaringiz to'g'ri hududga yetib borishi uchun yashash joyingizni tanlang.",
    "Мурожаатларингиз тўғри ҳудудга етиб бориши учун яшаш жойингизни танланг.",
    "Выберите место проживания, чтобы обращения попадали в нужный район.",
    "Choose where you live so your appeals reach the right area.",
  ],
  "onboarding.pickDistrict": ["Tumanni tanlang", "Туманни танланг", "Выберите район", "Choose a district"],
  "onboarding.pickMahalla": [
    "MFY (mahalla) ni tanlang",
    "МФЙ (маҳалла) ни танланг",
    "Выберите махаллю",
    "Choose a neighbourhood",
  ],
  "onboarding.changeDistrict": [
    "← Tumanni o'zgartirish",
    "← Туманни ўзгартириш",
    "← Изменить район",
    "← Change district",
  ],
  "onboarding.noMahalla": [
    "Bu tumanda MFY ro'yxati hali kiritilmagan. Boshqa tumanni tanlang yoki ma'muriyatga murojaat qiling.",
    "Бу туманда МФЙ рўйхати ҳали киритилмаган. Бошқа туманни танланг ёки маъмуриятга мурожаат қилинг.",
    "Список махаллей этого района ещё не заполнен. Выберите другой район или обратитесь в администрацию.",
    "This district has no neighbourhoods listed yet. Pick another district or contact the administration.",
  ],
  "onboarding.loading": ["Hududlar yuklanmoqda…", "Ҳудудлар юкланмоқда…", "Загрузка районов…", "Loading districts…"],

  // ── XARITA ────────────────────────────────────────────────────
  "map.title": ["Murojaatlar xaritasi", "Мурожаатлар харитаси", "Карта обращений", "Appeals map"],
  "map.all": ["Barchasi", "Барчаси", "Все", "All"],
  "map.points": ["{count} ta nuqta", "{count} та нуқта", "{count} точек", "{count} points"],
  "map.filter": ["Filtr", "Фильтр", "Фильтр", "Filter"],
  "map.status": ["Holat", "Ҳолат", "Статус", "Status"],
  "map.category": ["Yo'nalish", "Йўналиш", "Категория", "Category"],
  "map.statusNew": ["Yangi", "Янги", "Новые", "New"],
  "map.empty": [
    "Bu hududda murojaat yo'q",
    "Бу ҳудудда мурожаат йўқ",
    "В этом районе обращений нет",
    "No appeals in this area",
  ],

  // ── VAQT ──────────────────────────────────────────────────────
  "time.now": ["hozir", "ҳозир", "только что", "just now"],
  "time.minutesAgo": ["{count} daqiqa oldin", "{count} дақиқа олдин", "{count} мин. назад", "{count} min ago"],
  "time.hoursAgo": ["{count} soat oldin", "{count} соат олдин", "{count} ч. назад", "{count} h ago"],
  "time.hours": ["{count} soat", "{count} соат", "{count} ч.", "{count} h"],
  "time.days": ["{count} kun", "{count} кун", "{count} дн.", "{count} days"],
} as const;

export type MessageKey = keyof typeof MESSAGES;

/**
 * ⚠️ RO'YXAT TARTIBI `LOCALES` BILAN AYNI va bu bog'liqlik
 * TURLARDA qotirilgan: har qator to'rtta satrdan iborat bo'lishi
 * SHART, aks holda qurish to'xtaydi. Tartib buzilsa, ingliz matni
 * rus tilida chiqib ketardi — va buni faqat o'sha tilda
 * o'qiydigan odam sezardi.
 */
type Row = readonly [string, string, string, string];

const INDEX: Record<Locale, number> = { uz: 0, uzc: 1, ru: 2, en: 3 };

/**
 * MATNNI OLISH.
 *
 * ⚠️ KALIT TOPILMASA KALITNING O'ZI QAYTADI, bo'sh satr emas:
 * ekranda `appeals.title` ko'rinsa, tushib qolgan tarjima DARHOL
 * ko'zga tashlanadi. Bo'sh joy esa "shunday mo'ljallangan"ga
 * o'xshab, relizgacha yetib borardi.
 */
export const translate = (
  locale: Locale,
  key: MessageKey,
  params?: Record<string, string | number>,
): string => {
  const row = MESSAGES[key] as Row | undefined;
  if (!row) return key;

  const text = row[INDEX[locale]] ?? row[0];
  if (!params) return text;

  return text.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match,
  );
};

/** Qurish paytida har kalit to'rtta tilga ega ekanini tekshiradi. */
const _check: Record<MessageKey, Row> = MESSAGES;
void _check;
void LOCALES;
