(function () {
    var STORAGE_KEY = 'az-energy-lang';
    var LANGS = ['en', 'ru', 'az'];
    var currentLangIndex = 0;

    var T = {
        en: {
            nav: { home: 'Home', calculator: 'Solar Calculator', framework: 'Framework', projects: 'Projects', news: 'News' },
            index: {
                heroTitle: 'Azerbaijan Sustainable Energies Hub',
                heroSub: 'A comprehensive digital platform connecting renewable energy stakeholders with data-driven insights, policy frameworks, and investment opportunities across Azerbaijan\'s energy landscape.',
                explore: 'Explore Our Platform',
                statsHeading: 'Azerbaijan at a Glance',
                heroBtn1: 'Solar Calculator',
                heroBtn2: 'Projects',
                heroBtn3: 'Frameworks',
                ctaBadge: 'Policy & Legal',
                ctaTitle: 'A Complete Ecosystem for Renewable Energy Transition',
                ctaDesc: 'Comprehensive policy enablers and legal instruments powering Azerbaijan\'s clean energy future — from net-metering legislation to investment incentives and sector-wide regulatory frameworks.',
                ctaBtn1: 'Explore Framework',
                ctaBtn2: 'View Projects',
                stat1: 'Economic Renewable Potential',
                stat2: 'Target Capacity by 2030',
                stat3: 'RES Share Goal',
                stat4: 'Policy Frameworks',
                solarTitle: 'Solar Panel Calculator',
                solarDesc: 'Calculate potential solar energy output and investment returns for your project',
                solarBtn: 'Calculate Now',
                frameworkTitle: 'Framework',
                frameworkDesc: 'Policy frameworks and regulations for renewable energy in Azerbaijan',
                frameworkBtn: 'Learn More',
                projectsTitle: 'Projects',
                projectsDesc: 'Solar PV and renewable energy projects — active, in progress, and completed',
                projectsBtn: 'View Projects',
                newsTitle: 'Latest News',
                newsDesc: 'Stay updated with the latest developments in Azerbaijan\'s renewable energy sector',
                newsBtn: 'Read News',
                footer: '\u00A9 2026 Azerbaijan Sustainable Energies Hub. Powering a greener future.'
            },
            calculator: {
                title: 'Solar Panel Calculator',
                sub: 'Estimate your solar panel requirements for grid-tied systems in Azerbaijan using real PVGIS data',
                netTitle: 'Azerbaijan\'s Active Consumer Support Mechanism',
                netGood: 'Good news!',
                netDesc: 'Azerbaijan implemented a net-metering system allowing you to sell excess solar energy to Azərenerji and use it later when needed.',
                keyBenefits: 'Key Benefits:',
                systemSize: 'System size:',
                systemSizeDesc: 'Install solar panels up to ~150 kW for residential/commercial use',
                surplus: 'Surplus energy:',
                surplusDesc: 'Any electricity you generate but don\'t use is fed into the national grid',
                night: 'Night usage:',
                nightDesc: 'The surplus offsets your consumption later—essentially "banking" energy for nighttime use',
                financial: 'Financial savings:',
                financialDesc: 'Reduce or eliminate your electricity bills through net-metering',
                legal: 'Legal framework:',
                legalDesc: 'Approved by Cabinet of Ministers Decree No. 346 (September 28, 2023).',
                selectLocation: 'Select Your Location',
                mapHint: 'Click on the map or drag the marker to select your location for accurate solar data',
                formTitle: 'System Calculator',
                location: 'Location',
                locationPlaceholder: 'e.g., Baku, Ganja, or coordinates: 40.4093, 49.8671',
                houseSize: 'House Size (m²)',
                people: 'How many people live in your home?',
                daytime: 'Is someone generally at home during daytime (9am-5pm)?',
                yesHome: 'Yes - someone is usually home',
                noHome: 'No - home is empty during work hours',
                appliances: 'Additional Appliances',
                electricCooking: 'Electric cooking (oven/induction)',
                heavyAc: 'Heavy AC/heating usage (2-3 units daily)',
                waterHeater: 'Electric water heater/boiler',
                advanced: 'Show Advanced Parameters',
                calcBtn: 'Calculate System Size',
                panelsNeeded: 'Solar Panels Needed',
                systemSizeKwp: 'System Size (kWp)',
                annualProd: 'Annual Production (kWh)',
                roofArea: 'Roof Area Needed (m²)',
                solarYield: 'Solar Yield (kWh/kWp/year)',
                estCost: 'Est. System Cost (AZN)',
                selectedLabel: 'Selected',
                locationHint: 'City name or latitude, longitude coordinates',
                houseSizeHint: 'Enter your total house area in square meters',
                houseSizeHintOptional: 'Leave empty to estimate from household size (typical Azerbaijan dwelling).',
                houseAreaEstimated: 'House area estimated: {area} m² from {people} people.',
                peopleHint: 'Including infants and children',
                roofLimit: 'Maximum Roof Space Available (m²)',
                roofLimitHint: 'Leave empty for unlimited, or enter max roof area to limit panel count',
                tiltAngle: 'Panel Tilt Angle (degrees)',
                tiltAngleHint: 'Optional: 35-40° optimal for Azerbaijan. Leave empty to auto-calculate',
                orientation: 'Panel Orientation (degrees)',
                orientationHint: 'Optional: 0°=North, 90°=East, 180°=South, 270°=West. Leave empty for optimal',
                notesTitle: 'Important Notes',
                notesEstimate: 'This is an estimate.',
                notesDesc: 'Actual system performance depends on:',
                note1: 'Roof orientation and tilt angle',
                note2: 'Shading from trees or buildings',
                note3: 'Panel quality and inverter efficiency',
                note4: 'Local climate variations',
                nextStepsLabel: 'Next steps:',
                nextSteps: 'Consult with a certified solar installer for detailed site assessment and accurate system design.',
                envTitle: 'Environmental Impact',
                co2Label: 'CO₂ Reduction (tons/year)',
                treeLabel: 'Equivalent Trees Planted',
                tipsTitle: 'System Optimization Recommendations',
                tipTiltTitle: 'Optimal Tilt Angle',
                tipTiltDesc: 'This angle maximizes annual solar energy capture for your latitude',
                tipOrientTitle: 'Panel Orientation',
                tipOrientValue: 'South (180°)',
                tipOrientDesc: 'Face panels directly south for maximum exposure in Northern Hemisphere',
                tipLossTitle: 'System Loss',
                tipLossDesc: 'DC energy lost before becoming usable AC electricity (cables, inverter, etc.)',
                tipShadeTitle: 'Shading Analysis',
                tipShadeValue: 'Critical!',
                tipShadeDesc: 'Ensure no shading from trees or buildings, especially 9am-3pm',
                aiTitle: 'AI Analysis',
                aiLoading: 'AI is analyzing your system…',
                aiError: 'Analysis could not be loaded. Please try again.',
                costLabel: 'Estimated System Cost (AZN)'
            },
            framework: {
                title: 'Azerbaijan\'s Regulatory Framework',
                sub: 'Comprehensive policy frameworks and regulations for renewable energy development'
            },
            projects: {
                title: 'Renewable Energy Projects',
                sub: 'Solar PV and renewable energy projects in Azerbaijan — active, in progress, and completed',
                all: 'All',
                active: 'Active',
                inProgress: 'In progress',
                finished: 'Finished'
            },
            news: {
                title: 'Latest News & Updates',
                sub: 'Stay informed about renewable energy developments in Azerbaijan'
            }
        },
        az: {
            nav: { home: 'Ana səhifə', calculator: 'Günəş Kalkulyatoru', framework: 'Çərçivə', projects: 'Layihələr', news: 'Xəbərlər' },
            index: {
                heroTitle: 'Azərbaycan Davamlı Enerji Mərkəzi',
                heroSub: 'Yenilənə bilən enerji paydaşlarını məlumat əsaslı təhlillər, siyasət çərçivələri və Azərbaycanın enerji landşaftında investisiya imkanları ilə birləşdirən rəqəmsal platforma.',
                explore: 'Platformamızı kəşf edin',
                statsHeading: 'Azərbaycan rəqəmlərlə',
                heroBtn1: 'Günəş kalkulyatoru',
                heroBtn2: 'Layihələr',
                heroBtn3: 'Çərçivə',
                ctaBadge: 'Siyasət & Hüquq',
                ctaTitle: 'Bərpa Olunan Enerji Keçidi üçün Tam Ekosistem',
                ctaDesc: 'Azərbaycanın təmiz enerji gələcəyini gücləndirən hərtərəfli siyasət mexanizmləri və hüquqi alətlər — xalis sayğac qanunvericiliyindən investisiya təşviqlərinə qədər.',
                ctaBtn1: 'Çərçivəni kəşf et',
                ctaBtn2: 'Layihələrə bax',
                stat1: 'İqtisadi yenilənə bilən potensial',
                stat2: '2030-a hədəf güc',
                stat3: 'YEE payı məqsədi',
                stat4: 'Siyasət çərçivələri',
                solarTitle: 'Günəş paneli kalkulyatoru',
                solarDesc: 'Layihəniz üçün günəş enerjisi çıxışı və investisiya gəlirlərini hesablayın',
                solarBtn: 'Hesabla',
                frameworkTitle: 'Çərçivə',
                frameworkDesc: 'Azərbaycanda yenilənə bilən enerji üçün siyasət çərçivələri və qaydalar',
                frameworkBtn: 'Ətraflı',
                projectsTitle: 'Layihələr',
                projectsDesc: 'Günəş FV və yenilənə bilən enerji layihələri — aktiv, davam edən və tamamlanmış',
                projectsBtn: 'Layihələrə bax',
                newsTitle: 'Son xəbərlər',
                newsDesc: 'Azərbaycanın yenilənə bilən enerji sektorundakı son inkişaflarla tanış olun',
                newsBtn: 'Xəbərləri oxu',
                footer: '\u00A9 2026 Azərbaycan Davamlı Enerji Mərkəzi. Daha yaşıl gələcək.'
            },
            calculator: {
                title: 'Günəş paneli kalkulyatoru',
                sub: 'PVGIS məlumatları ilə Azərbaycanda şəbəkəyə qoşulu sistemlər üçün tələb olunan günəş panellərini təxmini hesablayın',
                netTitle: 'Azərbaycanın aktiv istehlakçı dəstək mexanizmi',
                netGood: 'Yaxşı xəbər!',
                netDesc: 'Azərbaycan xalis ölçmə sistemini tətbiq etdi — artıq günəş enerjisini Azərenerjiyə satıb sonra istifadə edə bilərsiniz.',
                keyBenefits: 'Əsas üstünlüklər:',
                systemSize: 'Sistem ölçüsü:',
                systemSizeDesc: 'Tikinti/kommersiya üçün təxminən 150 kVt-a qədər günəş paneli quraşdırın',
                surplus: 'Artıq enerji:',
                surplusDesc: 'İstifadə etmədiyiniz elektrik milli şəbəkəyə verilir',
                night: 'Gecə istifadəsi:',
                nightDesc: 'Artıq enerji sonradan istehlakı kompensasiya edir — gecə üçün enerji "əmanət" kimi',
                financial: 'Maliyyə qənaəti:',
                financialDesc: 'Xalis ölçmə ilə elektrik ödənişlərini azaldın və ya aradan qaldırın',
                legal: 'Hüquqi çərçivə:',
                legalDesc: 'Nazirlər Kabineti Qərarı No 346 (28 sentyabr 2023) təsdiq edilib.',
                selectLocation: 'Yerinizi seçin',
                mapHint: 'Dəqiq günəş məlumatı üçün xəritəyə klikləyin və ya markeri sürükləyin',
                formTitle: 'Sistem kalkulyatoru',
                location: 'Yer',
                locationPlaceholder: 'məs: Bakı, Gəncə və ya koordinatlar: 40.4093, 49.8671',
                houseSize: 'Ev sahəsi (m²)',
                people: 'Evdə neçə nəfər yaşayır?',
                daytime: 'Gündüz (səhər 9–axşam 5) evdə kimsə olurmu?',
                yesHome: 'Bəli — adətən evdə biri olur',
                noHome: 'Xeyr — iş saatlarında ev boşdur',
                appliances: 'Əlavə cihazlar',
                electricCooking: 'Elektrik soba (soba/induksiya)',
                heavyAc: 'Güclü kondisioner/istilik (gündə 2–3 ədəd)',
                waterHeater: 'Elektrik su qızdırıcısı/qazan',
                advanced: 'Əlavə parametrlər',
                calcBtn: 'Sistem ölçüsünü hesabla',
                panelsNeeded: 'Tələb olunan günəş panelləri',
                systemSizeKwp: 'Sistem gücü (kVt)',
                annualProd: 'İllik istehsal (kWh)',
                roofArea: 'Tələb olunan dam sahəsi (m²)',
                solarYield: 'Günəş məhsulu (kWh/kVt/il)',
                estCost: 'Təxmini sistem dəyəri (AZN)',
                selectedLabel: 'Seçildi',
                locationHint: 'Şəhər adı və ya enlik, uzunluq koordinatları',
                houseSizeHint: 'Ümumi ev sahəsini kvadrat metrlərlə daxil edin',
                houseSizeHintOptional: 'Ev sayından təxmin etmək üçün boş buraxın (Azərbaycanda tipik məskun).',
                houseAreaEstimated: 'Ev sahəsi təxmini: {area} m² ({people} nəfərdən).',
                peopleHint: 'Körpə və uşaqlar daxil olmaqla',
                roofLimit: 'Mövcud maksimum dam sahəsi (m²)',
                roofLimitHint: 'Limitsiz üçün boş buraxın, ya da panel sayını məhdudlaşdırmaq üçün sahə daxil edin',
                tiltAngle: 'Panel meyl bucağı (dərəcə)',
                tiltAngleHint: 'İstəyə görə: Azərbaycan üçün 35-40° optimal. Avtomatik üçün boş buraxın',
                orientation: 'Panel istiqaməti (dərəcə)',
                orientationHint: 'İstəyə görə: 0°=Şimal, 90°=Şərq, 180°=Cənub, 270°=Qərb. Optimal üçün boş buraxın',
                notesTitle: 'Vacib qeydlər',
                notesEstimate: 'Bu bir təxmindir.',
                notesDesc: 'Faktiki sistem performansı aşağıdakılardan asılıdır:',
                note1: 'Damın istiqaməti və meyl bucağı',
                note2: 'Ağaclar və binaların kölgəsi',
                note3: 'Panel keyfiyyəti və inverter effektivliyi',
                note4: 'Yerli iqlim dəyişiklikləri',
                nextStepsLabel: 'Növbəti addımlar:',
                nextSteps: 'Ətraflı yerlik qiymətləndirməsi və dəqiq sistem dizaynı üçün sertifikatlı günəş quraşdırıcısı ilə məsləhətləşin.',
                envTitle: 'Ətraf mühitə təsir',
                co2Label: 'CO₂ azaldılması (ton/il)',
                treeLabel: 'Əkilmiş ağaclara ekvivalent',
                tipsTitle: 'Sistem optimallaşdırma tövsiyələri',
                tipTiltTitle: 'Optimal meyl bucağı',
                tipTiltDesc: 'Bu bucaq, enlikdə illik günəş enerjisinin tutulmasını maksimum edir',
                tipOrientTitle: 'Panel istiqaməti',
                tipOrientValue: 'Cənub (180°)',
                tipOrientDesc: 'Şimal yarımkürəsində maksimum işıqlanma üçün panelləri cənuba doğru yönəldin',
                tipLossTitle: 'Sistem itkisi',
                tipLossDesc: 'DC enerjisinin istifadəyə yararlı AC elektrikinə çevrilməsindən əvvəl itkilər (kabelllər, inverter və s.)',
                tipShadeTitle: 'Kölgə analizi',
                tipShadeValue: 'Kritik!',
                tipShadeDesc: 'Xüsusilə 9:00–15:00 arasında ağac və binaların kölgəsi olmamalıdır',
                aiTitle: 'AI Analizi',
                aiLoading: 'AI sisteminizi analiz edir…',
                aiError: 'Analiz yüklənə bilmədi. Yenidən cəhd edin.',
                costLabel: 'Təxmini sistem dəyəri (AZN)'
            },
            framework: {
                title: 'Azərbaycanın tənzimləyici çərçivəsi',
                sub: 'Yenilənə bilən enerji inkişafı üçün siyasət çərçivələri və qaydalar'
            },
            projects: {
                title: 'Yenilənə bilən enerji layihələri',
                sub: 'Azərbaycanda günəş FV və yenilənə bilən enerji layihələri — aktiv, davam edən və tamamlanmış',
                all: 'Hamısı',
                active: 'Aktiv',
                inProgress: 'Davam edir',
                finished: 'Tamamlanıb'
            },
            news: {
                title: 'Son xəbərlər',
                sub: 'Azərbaycanda yenilənə bilən enerji inkişafları haqqında məlumatlı olun'
            }
        },
        ru: {
            nav: { home: 'Главная', calculator: 'Солнечный калькулятор', framework: 'Рамки', projects: 'Проекты', news: 'Новости' },
            index: {
                heroTitle: 'Центр устойчивой энергетики Азербайджана',
                heroSub: 'Цифровая платформа, объединяющая участников рынка возобновляемой энергетики с аналитикой, нормативной базой и инвестиционными возможностями в Азербайджане.',
                explore: 'Изучите платформу',
                statsHeading: 'Азербайджан в цифрах',
                heroBtn1: 'Калькулятор',
                heroBtn2: 'Проекты',
                heroBtn3: 'Нормативы',
                ctaBadge: 'Политика & Право',
                ctaTitle: 'Полная экосистема для перехода к возобновляемой энергетике',
                ctaDesc: 'Комплексные политические инструменты и правовые механизмы, продвигающие чистую энергетику Азербайджана — от законодательства о нетто-измерении до инвестиционных стимулов.',
                ctaBtn1: 'Изучить политику',
                ctaBtn2: 'Смотреть проекты',
                stat1: 'Экономический потенциал ВИЭ',
                stat2: 'Целевая мощность к 2030 г.',
                stat3: 'Доля ВИЭ',
                stat4: 'Нормативные рамки',
                solarTitle: 'Калькулятор солнечных панелей',
                solarDesc: 'Рассчитайте выработку солнечной энергии и доходность инвестиций для вашего проекта',
                solarBtn: 'Рассчитать',
                frameworkTitle: 'Рамки',
                frameworkDesc: 'Нормативная база и регулирование ВИЭ в Азербайджане',
                frameworkBtn: 'Подробнее',
                projectsTitle: 'Проекты',
                projectsDesc: 'Солнечные и ВИЭ-проекты — действующие, в разработке и завершённые',
                projectsBtn: 'Смотреть проекты',
                newsTitle: 'Новости',
                newsDesc: 'Актуальные события в сфере возобновляемой энергетики Азербайджана',
                newsBtn: 'Читать новости',
                footer: '\u00A9 2026 Центр устойчивой энергетики Азербайджана. К более зелёному будущему.'
            },
            calculator: {
                title: 'Калькулятор солнечных панелей',
                sub: 'Оценка потребности в солнечных панелях для сетевых систем в Азербайджане по данным PVGIS',
                netTitle: 'Механизм поддержки активного потребителя в Азербайджане',
                netGood: 'Хорошие новости!',
                netDesc: 'В Азербайджане введена система нетто-учёта: излишки солнечной энергии можно передавать в Азерэнержи и использовать позже.',
                keyBenefits: 'Основные преимущества:',
                systemSize: 'Мощность системы:',
                systemSizeDesc: 'Установка солнечных панелей до ~150 кВт для бытового и коммерческого использования',
                surplus: 'Излишки энергии:',
                surplusDesc: 'Неиспользованное электричество подаётся в национальную сеть',
                night: 'Ночное потребление:',
                nightDesc: 'Излишки засчитываются позже — по сути «накопление» энергии на ночь',
                financial: 'Экономия:',
                financialDesc: 'Снижение или отмена счетов за электричество благодаря нетто-учёту',
                legal: 'Нормативная база:',
                legalDesc: 'Утверждено Постановлением Кабинета министров № 346 (28 сентября 2023 г.).',
                selectLocation: 'Выберите местоположение',
                mapHint: 'Нажмите на карту или перетащите маркер для выбора местоположения',
                formTitle: 'Калькулятор системы',
                location: 'Местоположение',
                locationPlaceholder: 'напр., Баку, Гянджа или координаты: 40.4093, 49.8671',
                houseSize: 'Площадь дома (м²)',
                people: 'Сколько человек живёт в доме?',
                daytime: 'Кто-то обычно дома днём (9–17)?',
                yesHome: 'Да — обычно кто-то есть',
                noHome: 'Нет — днём дома никого нет',
                appliances: 'Дополнительные приборы',
                electricCooking: 'Электроплита (духовка/индукция)',
                heavyAc: 'Интенсивное использование кондиционера/отопления (2–3 в день)',
                waterHeater: 'Электроводонагреватель/бойлер',
                advanced: 'Дополнительные параметры',
                calcBtn: 'Рассчитать размер системы',
                panelsNeeded: 'Нужно панелей',
                systemSizeKwp: 'Мощность системы (кВт)',
                annualProd: 'Годовая выработка (кВт·ч)',
                roofArea: 'Нужная площадь крыши (м²)',
                solarYield: 'Удельная выработка (кВт·ч/кВт/год)',
                estCost: 'Ориентировочная стоимость (AZN)',
                selectedLabel: 'Выбрано',
                locationHint: 'Название города или координаты: широта, долгота',
                houseSizeHint: 'Введите общую площадь дома в квадратных метрах',
                houseSizeHintOptional: 'Оставьте пустым для оценки по числу жильцов (типичное жильё в Азербайджане).',
                houseAreaEstimated: 'Площадь дома оценена: {area} м² по {people} чел.',
                peopleHint: 'Включая младенцев и детей',
                roofLimit: 'Максимальная доступная площадь крыши (м²)',
                roofLimitHint: 'Оставьте пустым для неограниченного, или введите площадь для ограничения количества панелей',
                tiltAngle: 'Угол наклона панелей (градусы)',
                tiltAngleHint: 'Необязательно: 35–40° оптимально для Азербайджана. Оставьте пустым для автоматического расчёта',
                orientation: 'Ориентация панелей (градусы)',
                orientationHint: 'Необязательно: 0°=Север, 90°=Восток, 180°=Юг, 270°=Запад. Оставьте пустым для оптимального',
                notesTitle: 'Важные примечания',
                notesEstimate: 'Это приблизительный расчёт.',
                notesDesc: 'Фактическая производительность системы зависит от:',
                note1: 'Ориентации и угла наклона крыши',
                note2: 'Затенения деревьями или зданиями',
                note3: 'Качества панелей и КПД инвертора',
                note4: 'Местных климатических условий',
                nextStepsLabel: 'Следующие шаги:',
                nextSteps: 'Обратитесь к сертифицированному монтажнику солнечных панелей для детальной оценки объекта и точного проектирования системы.',
                envTitle: 'Экологическое воздействие',
                co2Label: 'Снижение CO₂ (тонн/год)',
                treeLabel: 'Эквивалент посаженных деревьев',
                tipsTitle: 'Рекомендации по оптимизации системы',
                tipTiltTitle: 'Оптимальный угол наклона',
                tipTiltDesc: 'Этот угол максимизирует годовое улавливание солнечной энергии для вашей широты',
                tipOrientTitle: 'Ориентация панелей',
                tipOrientValue: 'Юг (180°)',
                tipOrientDesc: 'Направьте панели на юг для максимального освещения в Северном полушарии',
                tipLossTitle: 'Потери системы',
                tipLossDesc: 'Потери электроэнергии постоянного тока до получения переменного тока (кабели, инвертор и т.д.)',
                tipShadeTitle: 'Анализ затенения',
                tipShadeValue: 'Критично!',
                tipShadeDesc: 'Убедитесь в отсутствии тени от деревьев и зданий, особенно с 9:00 до 15:00',
                aiTitle: 'ИИ Анализ',
                aiLoading: 'ИИ анализирует вашу систему…',
                aiError: 'Анализ не загрузился. Попробуйте снова.',
                costLabel: 'Ориентировочная стоимость системы (AZN)'
            },
            framework: {
                title: 'Нормативная база Азербайджана',
                sub: 'Политические рамки и регулирование развития ВИЭ'
            },
            projects: {
                title: 'Проекты ВИЭ',
                sub: 'Солнечные и ВИЭ-проекты в Азербайджане — действующие, в разработке и завершённые',
                all: 'Все',
                active: 'Действующие',
                inProgress: 'В разработке',
                finished: 'Завершённые'
            },
            news: {
                title: 'Новости',
                sub: 'Актуальные события в сфере возобновляемой энергетики Азербайджана'
            }
        }
    };

    function getLang() {
        try {
            var s = localStorage.getItem(STORAGE_KEY);
            var idx = LANGS.indexOf(s);
            if (idx !== -1) {
                currentLangIndex = idx;
                return s;
            }
        } catch (e) {}
        currentLangIndex = 0;
        return 'en';
    }

    function setLang(lang) {
        if (LANGS.indexOf(lang) === -1) return;
        try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
        currentLangIndex = LANGS.indexOf(lang);
        applyLang(lang);
        updateLanguageDisplay();
    }

    function updateLanguageDisplay() {
        var el = document.getElementById('currentLang');
        if (el) el.textContent = LANGS[currentLangIndex].toUpperCase();
    }

    function cycleLanguage() {
        var nextIndex = (currentLangIndex + 1) % LANGS.length;
        var nextLang = LANGS[nextIndex];
        var currentLangEl = document.getElementById('currentLang');
        if (currentLangEl) {
            currentLangEl.classList.remove('slide-out-left', 'slide-in-right');
            currentLangEl.classList.add('slide-out-left');
            setTimeout(function () {
                currentLangEl.textContent = nextLang.toUpperCase();
                currentLangEl.classList.remove('slide-out-left');
                currentLangEl.classList.add('slide-in-right');
                setTimeout(function () {
                    currentLangEl.classList.remove('slide-in-right');
                }, 300);
            }, 300);
        }
        currentLangIndex = nextIndex;
        try { localStorage.setItem(STORAGE_KEY, nextLang); } catch (e) {}
        applyLang(nextLang);
    }

    function setupLangSwitcherClick() {
        var btn = document.getElementById('lang-switcher-btn');
        if (btn) btn.addEventListener('click', function (e) { e.preventDefault(); cycleLanguage(); });
    }

    function applyLang(lang) {
        var t = T[lang] || T.en;
        document.querySelectorAll('[data-i18n]').forEach(function (el) {
            if (el.hasAttribute('data-typewriter-host')) return; // handled by typewriter.js
            var key = el.getAttribute('data-i18n');
            var parts = key.split('.');
            var val = t;
            for (var i = 0; i < parts.length && val; i++) val = val[parts[i]];
            if (val != null && typeof val === 'string') {
                if (el.getAttribute('data-i18n-attr')) {
                    el.setAttribute(el.getAttribute('data-i18n-attr'), val);
                } else {
                    el.textContent = val;
                }
            }
        });
        document.documentElement.lang = lang === 'az' ? 'az' : lang === 'ru' ? 'ru' : 'en';
        window.dispatchEvent(new CustomEvent('langchange', { detail: { lang: lang } }));
    }

    window.setLanguage = function (lang) {
        setLang(lang);
    };

    window.getLanguage = function () {
        return getLang();
    };

    window.getTranslation = function (key) {
        var lang = getLang();
        var t = T[lang] || T.en;
        var parts = key.split('.');
        var val = t;
        for (var i = 0; i < parts.length && val; i++) val = val[parts[i]];
        return (val != null && typeof val === 'string') ? val : '';
    };

    window.applyI18n = function () {
        applyLang(getLang());
        updateLanguageDisplay();
    };

    function initI18n() {
        getLang();
        applyLang(getLang());
        updateLanguageDisplay();
        setupLangSwitcherClick();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initI18n);
    } else {
        initI18n();
    }
})();
