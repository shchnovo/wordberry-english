import json,re,hashlib
from pathlib import Path
modules=[
 ('starter','Starter','Начинаем','👋'),('1','School days','Школа','🎒'),('2',"That’s me!",'Это я','🪁'),('3','My home, my castle','Мой дом','🏡'),('4','Family ties','Семья','💛'),('5','World animals','Животные','🦊'),('6','Round the clock','Мой день','⏰'),('7','In all weathers','Погода и одежда','🌦️'),('8','Special days','Праздники и еда','🎂'),('9','Modern living','Город и развлечения','🎟️'),('10','Holidays','Каникулы','🏖️')]
lessons=[]
def add(module,id,code,title,sub,source,rows):
 words=[]
 for row in rows.strip().split('\n'):
  if not row.strip():continue
  parts=row.split('|');assert len(parts)==5,row
  en,ru,example,exampleRu,emoji=[x.strip() for x in parts]
  wid='w-'+re.sub('[^a-z0-9]+','-',en.lower()).strip('-')
  words.append(dict(id=wid,en=en,ru=ru,example=example,exampleRu=exampleRu,emoji=emoji))
 lessons.append(dict(module=str(module),id=id,code=code,title=title,subtitle=sub,source=source,words=words))
add('starter','starter-hello','Starter · 1','Знакомимся','Приветствия и первые фразы','Учебник: с. 13, 18; рабочая тетрадь: Starter', '''
hello|привет|Hello, my name is Anna.|Привет, меня зовут Анна.|👋
good morning|доброе утро|Good morning, Mum!|Доброе утро, мама!|🌤️
good afternoon|добрый день|Good afternoon, Mr Brown!|Добрый день, мистер Браун!|☀️
good evening|добрый вечер|Good evening, Dad!|Добрый вечер, папа!|🌙
goodbye|до свидания|Goodbye, see you tomorrow!|До свидания, увидимся завтра!|👋
my name is|меня зовут|My name is Anna.|Меня зовут Анна.|🏷️
what is your name|как тебя зовут|What is your name?|Как тебя зовут?|💬
nice to meet you|приятно познакомиться|Nice to meet you, Tom!|Приятно познакомиться, Том!|🤝
''')
add('starter','starter-objects','Starter · 2','Что в рюкзаке?','Предметы в классе','Учебник: с. 23; рабочая тетрадь: с. 14, 17', '''
book|книга|This is my book.|Это моя книга.|📖
pen|ручка|I have got a blue pen.|У меня есть синяя ручка.|🖊️
pencil|карандаш|This pencil is yellow.|Этот карандаш жёлтый.|✏️
pencil case|пенал|My pencil case is green.|Мой пенал зелёный.|👝
rubber|ластик|I need a rubber.|Мне нужен ластик.|◽
ruler|линейка|My ruler is on the desk.|Моя линейка на парте.|📏
schoolbag|школьный рюкзак|My schoolbag is blue.|Мой школьный рюкзак синий.|🎒
notebook|тетрадь|Open your notebook.|Открой свою тетрадь.|📓
sharpener|точилка|I have got a sharpener.|У меня есть точилка.|🔻
desk|парта|My book is on the desk.|Моя книга на парте.|🪑
chair|стул|The chair is next to the desk.|Стул рядом с партой.|🪑
blackboard|классная доска|Look at the blackboard.|Посмотри на классную доску.|⬛
''')
add('starter','starter-colours','Starter · 3','Все цвета','Цвета вокруг тебя','Учебник: с. 22; рабочая тетрадь: с. 13', '''
red|красный|My pen is red.|Моя ручка красная.|🔴
blue|синий|My schoolbag is blue.|Мой школьный рюкзак синий.|🔵
yellow|жёлтый|The pencil is yellow.|Карандаш жёлтый.|🟡
green|зелёный|The ruler is green.|Линейка зелёная.|🟢
pink|розовый|My notebook is pink.|Моя тетрадь розовая.|🌸
purple|фиолетовый|This book is purple.|Эта книга фиолетовая.|🟣
orange|оранжевый|My hat is orange.|Моя шляпа оранжевая.|🟠
white|белый|The cat is white.|Кошка белая.|⚪
black|чёрный|The dog is black.|Собака чёрная.|⚫
brown|коричневый|My desk is brown.|Моя парта коричневая.|🟤
''')
nums=[('one','один'),('two','два'),('three','три'),('four','четыре'),('five','пять'),('six','шесть'),('seven','семь'),('eight','восемь'),('nine','девять'),('ten','десять'),('eleven','одиннадцать'),('twelve','двенадцать'),('thirteen','тринадцать'),('fourteen','четырнадцать'),('fifteen','пятнадцать'),('sixteen','шестнадцать'),('seventeen','семнадцать'),('eighteen','восемнадцать'),('nineteen','девятнадцать'),('twenty','двадцать')]
add('starter','starter-numbers','Starter · 4','Считаем до двадцати','Числа без путаницы','Учебник: с. 21; рабочая тетрадь: с. 12, 18', '\n'.join(f'{en}|{ru}|I have got {en} '+('pencil.' if n==1 else 'pencils.')+f'|У меня {n} '+('карандаш.' if n==1 else 'карандаша.' if n in [2,3,4] else 'карандашей.')+'|🔢' for n,(en,ru) in enumerate(nums,1)))
add(1,'1a-school','1a','Школьные предметы','Что у нас по расписанию?','Учебник: с. 26–27; рабочая тетрадь: с. 17, 19', '''
English|английский язык|We learn English at school.|Мы учим английский язык в школе.|🇬🇧
maths|математика|I like maths.|Мне нравится математика.|🔢
history|история|We have history on Monday.|В понедельник у нас история.|🏛️
geography|география|Geography is my favourite subject.|География — мой любимый предмет.|🌍
science|естествознание|We have science today.|Сегодня у нас естествознание.|🔬
art|изобразительное искусство|I like art.|Мне нравится изобразительное искусство.|🎨
music|музыка|We have music on Friday.|В пятницу у нас музыка.|🎵
PE|физкультура|We play games in PE.|На физкультуре мы играем в игры.|🏃
IT|информатика|We use computers in IT.|На информатике мы используем компьютеры.|💻
''')
days=[('Monday','понедельник'),('Tuesday','вторник'),('Wednesday','среда'),('Thursday','четверг'),('Friday','пятница'),('Saturday','суббота'),('Sunday','воскресенье')]
add(1,'1a-days','1a · +','Дни недели','Когда следующий урок?','Учебник: с. 26; рабочая тетрадь: с. 17', '\n'.join(f'{en}|{ru}|Today is {en}.|Сегодня {ru}.|📅' for en,ru in days))
add(1,'1b-first-day','1b','Первый день','Знакомство в школе','Учебник: с. 28–29; рабочая тетрадь: с. 18', '''
student|ученик|Tom is a student.|Том — ученик.|🧑‍🎓
teacher|учитель|Our teacher is kind.|Наш учитель добрый.|🧑‍🏫
class|класс|I am in this class.|Я учусь в этом классе.|🎒
school|школа|My school is near my house.|Моя школа рядом с моим домом.|🏫
friend|друг|Tom is my friend.|Том — мой друг.|🤝
years old|лет (о возрасте)|I am eleven years old.|Мне одиннадцать лет.|🎂
together|вместе|We go to school together.|Мы ходим в школу вместе.|👭
name|имя|What is your name?|Как тебя зовут?|🏷️
''')
add(1,'1c-subjects','1c','Про мои уроки','Расписание и любимые занятия','Учебник: с. 30; рабочая тетрадь: с. 19, 22', '''
subject|учебный предмет|English is my favourite subject.|Английский язык — мой любимый предмет.|📚
favourite|любимый|Blue is my favourite colour.|Синий — мой любимый цвет.|💜
timetable|расписание|Look at the school timetable.|Посмотри на школьное расписание.|📋
lesson|урок|The lesson starts at nine.|Урок начинается в девять.|📖
break|перемена; перерыв|We have a break at ten.|В десять у нас перемена.|⏳
classroom|классная комната|Our classroom is big.|Наша классная комната большая.|🏫
''')
add(2,'2a-countries','2a','Откуда ты?','Страны и национальности','Учебник: с. 36–37; рабочая тетрадь: с. 23', '''
Russia|Россия|I am from Russia.|Я из России.|🇷🇺
Russian|русский; российский|This is a Russian doll.|Это русская кукла.|🇷🇺
Britain|Британия|Tom is from Britain.|Том из Британии.|🇬🇧
British|британский|This is a British stamp.|Это британская марка.|🇬🇧
France|Франция|Anna is from France.|Анна из Франции.|🇫🇷
French|французский|I have got a French coin.|У меня есть французская монета.|🇫🇷
Japan|Япония|Yuki is from Japan.|Юки из Японии.|🇯🇵
Japanese|японский|This is a Japanese toy.|Это японская игрушка.|🇯🇵
Italy|Италия|Marco is from Italy.|Марко из Италии.|🇮🇹
Italian|итальянский|I like Italian food.|Мне нравится итальянская еда.|🇮🇹
Greece|Греция|My friend is from Greece.|Мой друг из Греции.|🇬🇷
Greek|греческий|This is a Greek coin.|Это греческая монета.|🇬🇷
''')
add(2,'2b-things','2b','Мои вещи','Подарки и любимые предметы','Учебник: с. 38–39; рабочая тетрадь: с. 24', '''
watch|наручные часы|This watch is a present.|Эти наручные часы — подарок.|⌚
cap|кепка|My cap is red.|Моя кепка красная.|🧢
skateboard|скейтборд|I have got a skateboard.|У меня есть скейтборд.|🛹
basketball|баскетбольный мяч|This basketball is orange.|Этот баскетбольный мяч оранжевый.|🏀
bicycle|велосипед|My bicycle is blue.|Мой велосипед синий.|🚲
guitar|гитара|I can play the guitar.|Я умею играть на гитаре.|🎸
gloves|перчатки|My gloves are warm.|Мои перчатки тёплые.|🧤
trainers|кроссовки|My trainers are white.|Мои кроссовки белые.|👟
scarf|шарф|I have got a long scarf.|У меня есть длинный шарф.|🧣
present|подарок|This is a present for you.|Это подарок для тебя.|🎁
''')
add(2,'2c-collection','2c','Моя коллекция','Собираем маленькие сокровища','Учебник: с. 40–41; рабочая тетрадь: с. 25', '''
collection|коллекция|My collection is small.|Моя коллекция небольшая.|🗃️
collect|коллекционировать|I collect stamps.|Я коллекционирую марки.|📬
stamp|почтовая марка|This stamp is from Britain.|Эта марка из Британии.|📮
coin|монета|This coin is from Japan.|Эта монета из Японии.|🪙
doll|кукла|My doll is beautiful.|Моя кукла красивая.|🪆
souvenir|сувенир|This is a souvenir from Italy.|Это сувенир из Италии.|🎁
key ring|брелок|I have got a new key ring.|У меня есть новый брелок.|🔑
beautiful|красивый|This doll is beautiful.|Эта кукла красивая.|✨
''')
add(3,'3a-home','3a','Мой дом','Комнаты и этажи','Рабочая тетрадь: с. 29', '''
house|дом|My house is small.|Мой дом небольшой.|🏡
flat|квартира|We live in a flat.|Мы живём в квартире.|🏢
kitchen|кухня|Mum is in the kitchen.|Мама на кухне.|🍳
living room|гостиная|We watch TV in the living room.|Мы смотрим телевизор в гостиной.|🛋️
bedroom|спальня|This is my bedroom.|Это моя спальня.|🛏️
bathroom|ванная комната|The bathroom is upstairs.|Ванная комната наверху.|🛁
dining room|столовая комната|We eat in the dining room.|Мы едим в столовой комнате.|🍽️
garage|гараж|The car is in the garage.|Машина в гараже.|🚗
floor|этаж|My flat is on the ground floor.|Моя квартира на первом этаже.|🏢
lift|лифт|There is a lift in our building.|В нашем здании есть лифт.|↕️
''')
add(3,'3b-furniture','3b','Обустраиваем комнату','Мебель и вещи дома','Рабочая тетрадь: с. 30', '''
bed|кровать|My bed is next to the window.|Моя кровать рядом с окном.|🛏️
wardrobe|шкаф для одежды|The wardrobe is big.|Шкаф для одежды большой.|🚪
sofa|диван|The cat is on the sofa.|Кошка на диване.|🛋️
armchair|кресло|Dad is in the armchair.|Папа в кресле.|🪑
table|стол|The book is on the table.|Книга на столе.|🍽️
lamp|лампа|There is a lamp on my desk.|На моей парте есть лампа.|💡
bookcase|книжный шкаф|My books are in the bookcase.|Мои книги в книжном шкафу.|📚
carpet|ковёр|The carpet is blue.|Ковёр синий.|🔷
fridge|холодильник|The milk is in the fridge.|Молоко в холодильнике.|🧊
cooker|кухонная плита|The cooker is in the kitchen.|Плита на кухне.|🍳
sink|кухонная раковина|The sink is clean.|Кухонная раковина чистая.|🚰
television|телевизор|There is a television in the living room.|В гостиной есть телевизор.|📺
''')
add(3,'3c-position','3c','Где лежат вещи?','Предлоги места','Рабочая тетрадь: с. 31', '''
in|в; внутри|The pencil is in the box.|Карандаш в коробке.|📦
on|на|The book is on the desk.|Книга на парте.|📖
under|под|The cat is under the bed.|Кошка под кроватью.|🐈
behind|за; позади|The ball is behind the door.|Мяч за дверью.|🚪
next to|рядом с|The chair is next to the desk.|Стул рядом с партой.|🪑
in front of|перед|The lamp is in front of the window.|Лампа перед окном.|💡
''')
add(4,'4a-family','4a','Моя семья','Близкие и характер','Рабочая тетрадь: с. 35', '''
family|семья|My family is friendly.|Моя семья дружная.|💛
mother|мама; мать|My mother is kind.|Моя мама добрая.|👩
father|папа; отец|My father is funny.|Мой папа весёлый.|👨
brother|брат|My brother is little.|Мой брат маленький.|👦
sister|сестра|My sister is clever.|Моя сестра умная.|👧
grandmother|бабушка|My grandmother can play the piano.|Моя бабушка умеет играть на пианино.|👵
grandfather|дедушка|My grandfather is kind.|Мой дедушка добрый.|👴
kind|добрый|My friend is kind.|Мой друг добрый.|💛
friendly|дружелюбный|Our dog is friendly.|Наша собака дружелюбная.|🤝
clever|умный|My sister is clever.|Моя сестра умная.|💡
funny|смешной; весёлый|This film is funny.|Этот фильм смешной.|😄
''')
add(4,'4b-appearance','4b','Кто есть кто?','Описываем внешность','Рабочая тетрадь: с. 36', '''
tall|высокий|My brother is tall.|Мой брат высокий.|📏
short|короткий; невысокий|My hair is short.|У меня короткие волосы.|✂️
young|молодой|Our teacher is young.|Наш учитель молодой.|🌱
hair|волосы|Her hair is long.|У неё длинные волосы.|💇
eyes|глаза|Her eyes are blue.|У неё голубые глаза.|👀
ears|уши|The rabbit has got long ears.|У кролика длинные уши.|🐰
curly|кудрявый|Her hair is curly.|У неё кудрявые волосы.|🌀
straight|прямой|His hair is straight.|У него прямые волосы.|💇
blonde|светлый (о волосах)|Her hair is blonde.|У неё светлые волосы.|👱
moustache|усы|My grandfather has got a moustache.|У моего дедушки есть усы.|👴
''')
add(4,'4c-hobbies','4c','Расскажи о человеке','Возраст, увлечения и умения','Рабочая тетрадь: с. 37', '''
birthday|день рождения|My birthday is in June.|Мой день рождения в июне.|🎂
hobby|увлечение|My hobby is reading.|Моё увлечение — чтение.|📚
play football|играть в футбол|I can play football.|Я умею играть в футбол.|⚽
swim|плавать|I can swim.|Я умею плавать.|🏊
ski|кататься на лыжах|My brother can ski.|Мой брат умеет кататься на лыжах.|⛷️
ride a bike|кататься на велосипеде|I can ride a bike.|Я умею кататься на велосипеде.|🚲
speak|говорить|I can speak English.|Я умею говорить по-английски.|💬
athlete|спортсмен|My sister is an athlete.|Моя сестра — спортсменка.|🏅
''')
add(5,'5a-animals','5a','Удивительные животные','Кто живёт на нашей планете?','Рабочая тетрадь: с. 41', '''
lion|лев|The lion has got a mane.|У льва есть грива.|🦁
tiger|тигр|The tiger has got stripes.|У тигра есть полосы.|🐯
elephant|слон|The elephant has got a trunk.|У слона есть хобот.|🐘
giraffe|жираф|The giraffe has got a long neck.|У жирафа длинная шея.|🦒
cheetah|гепард|A cheetah can run fast.|Гепард умеет быстро бегать.|🐆
frog|лягушка|The frog is green.|Лягушка зелёная.|🐸
hippo|бегемот|The hippo is in the water.|Бегемот в воде.|🦛
whale|кит|The whale is big.|Кит большой.|🐋
dolphin|дельфин|The dolphin can swim.|Дельфин умеет плавать.|🐬
crocodile|крокодил|The crocodile has got a long tail.|У крокодила длинный хвост.|🐊
deer|олень|The deer eats grass.|Олень ест траву.|🦌
butterfly|бабочка|This butterfly is beautiful.|Эта бабочка красивая.|🦋
''')
add(5,'5b-body','5b','В зоопарке','Лапы, перья и хвосты','Рабочая тетрадь: с. 42', '''
tail|хвост|The cat has got a long tail.|У кошки длинный хвост.|🐈
paws|лапы|The dog has got four paws.|У собаки четыре лапы.|🐾
fur|мех; шерсть|The rabbit has got soft fur.|У кролика мягкая шерсть.|🐰
feathers|перья|This bird has got green feathers.|У этой птицы зелёные перья.|🪶
wings|крылья|The bird has got two wings.|У птицы два крыла.|🪽
trunk|хобот|The elephant has got a long trunk.|У слона длинный хобот.|🐘
tusks|бивни|The elephant has got two tusks.|У слона два бивня.|🐘
mane|грива|The lion has got a mane.|У льва есть грива.|🦁
neck|шея|The giraffe has got a long neck.|У жирафа длинная шея.|🦒
legs|ноги|The dog has got four legs.|У собаки четыре ноги.|🐾
''')
add(5,'5c-pets','5c','Мой питомец','Как рассказать о любимце','Рабочая тетрадь: с. 43', '''
pet|домашний питомец|My pet is a rabbit.|Мой питомец — кролик.|🐾
dog|собака|My dog is friendly.|Моя собака дружелюбная.|🐶
cat|кошка|My cat is white.|Моя кошка белая.|🐱
rabbit|кролик|My rabbit has got long ears.|У моего кролика длинные уши.|🐰
parrot|попугай|My parrot has got green feathers.|У моего попугая зелёные перья.|🦜
cow|корова|The cow lives on a farm.|Корова живёт на ферме.|🐄
sheep|овца|The sheep has got thick wool.|У овцы густая шерсть.|🐑
owner|владелец|The dog helps its owner.|Собака помогает своему владельцу.|🤝
''')
add(6,'6a-day','6a','Мой обычный день','Дела от утра до вечера','Рабочая тетрадь: с. 47', '''
get up|вставать|I get up at seven.|Я встаю в семь.|⏰
have breakfast|завтракать|I have breakfast at eight.|Я завтракаю в восемь.|🥣
go to school|идти в школу|I go to school at nine.|Я иду в школу в девять.|🎒
have lunch|обедать|I have lunch at school.|Я обедаю в школе.|🥪
do homework|делать домашнее задание|We do homework after school.|Мы делаем домашнее задание после школы.|📚
have dinner|ужинать|We have dinner at six.|Мы ужинаем в шесть.|🍽️
go to bed|ложиться спать|I go to bed at ten.|Я ложусь спать в десять.|🛏️
always|всегда|I always have breakfast.|Я всегда завтракаю.|☀️
usually|обычно|I usually get up at seven.|Я обычно встаю в семь.|⏰
often|часто|I often read books.|Я часто читаю книги.|📖
sometimes|иногда|I sometimes watch TV.|Я иногда смотрю телевизор.|📺
never|никогда|I never go to bed late.|Я никогда не ложусь спать поздно.|🌙
''')
add(6,'6b-work','6b','Кто что делает?','Профессии и действия','Рабочая тетрадь: с. 48', '''
baker|пекарь|The baker makes bread.|Пекарь печёт хлеб.|🥖
driver|водитель|The driver is in the car.|Водитель в машине.|🚗
waiter|официант|The waiter brings our food.|Официант приносит нашу еду.|🍽️
doctor|врач|The doctor helps people.|Врач помогает людям.|🩺
work|работать|My parents work in town.|Мои родители работают в городе.|💼
paint|красить; рисовать красками|I can paint a picture.|Я могу нарисовать картину красками.|🎨
repair|чинить|They repair cars.|Они чинят машины.|🔧
serve|обслуживать; подавать|They serve food here.|Здесь подают еду.|🍽️
deliver|доставлять|They deliver food to our house.|Они доставляют еду к нам домой.|📦
wait|ждать|We wait for the bus.|Мы ждём автобус.|🚌
''')
add(6,'6c-weekend','6c','Выходные','Успеть отдохнуть и поиграть','Рабочая тетрадь: с. 49', '''
weekend|выходные|We have fun at the weekend.|На выходных мы веселимся.|🌈
write an email|писать электронное письмо|I can write an email.|Я могу написать электронное письмо.|✉️
make phone calls|звонить по телефону|I make phone calls after school.|Я звоню по телефону после школы.|📱
read a book|читать книгу|I read a book in the evening.|Вечером я читаю книгу.|📖
plant flowers|сажать цветы|We plant flowers in spring.|Весной мы сажаем цветы.|🌷
work in the garden|работать в саду|We work in the garden on Sunday.|В воскресенье мы работаем в саду.|🌿
play with a friend|играть с другом|I play with a friend after school.|После школы я играю с другом.|🤝
watch TV|смотреть телевизор|We watch TV in the evening.|Мы смотрим телевизор вечером.|📺
''')
add(7,'7a-weather','7a','Какая погода?','Времена года и погода','Рабочая тетрадь: с. 53', '''
spring|весна|I like spring.|Мне нравится весна.|🌷
summer|лето|I like summer.|Мне нравится лето.|☀️
autumn|осень|I like autumn.|Мне нравится осень.|🍂
winter|зима|I like winter.|Мне нравится зима.|❄️
weather|погода|The weather is nice today.|Сегодня хорошая погода.|🌦️
hot|жаркий; жарко|It is hot today.|Сегодня жарко.|☀️
warm|тёплый; тепло|It is warm in spring.|Весной тепло.|🌤️
cold|холодный; холодно|It is cold today.|Сегодня холодно.|❄️
sunny|солнечный; солнечно|It is sunny today.|Сегодня солнечно.|☀️
rain|дождь|I can hear the rain.|Я слышу дождь.|🌧️
snow|снег|We play in the snow.|Мы играем в снегу.|⛄
freezing|морозный; очень холодно|It is freezing today.|Сегодня очень холодно.|🥶
''')
months=[('January','январь','январе'),('February','февраль','феврале'),('March','март','марте'),('April','апрель','апреле'),('May','май','мае'),('June','июнь','июне'),('July','июль','июле'),('August','август','августе'),('September','сентябрь','сентябре'),('October','октябрь','октябре'),('November','ноябрь','ноябре'),('December','декабрь','декабре')]
add(7,'7a-months','7a · +','Двенадцать месяцев','Когда у тебя день рождения?','Рабочая тетрадь: с. 53', '\n'.join(f'{en}|{ru}|My birthday is in {en}.|Мой день рождения в {case}.|📅' for en,ru,case in months))
add(7,'7b-clothes','7b','Что надеть?','Одежда для разной погоды','Рабочая тетрадь: с. 54–55', '''
trousers|брюки|My trousers are black.|Мои брюки чёрные.|👖
shirt|рубашка|My shirt is white.|Моя рубашка белая.|👔
T-shirt|футболка|My T-shirt is blue.|Моя футболка синяя.|👕
skirt|юбка|Her skirt is red.|Её юбка красная.|👗
dress|платье|Her dress is beautiful.|Её платье красивое.|👗
jacket|куртка|My jacket is warm.|Моя куртка тёплая.|🧥
raincoat|плащ-дождевик|I wear a raincoat in the rain.|В дождь я ношу плащ-дождевик.|🌧️
jumper|джемпер|This jumper is warm.|Этот джемпер тёплый.|🧶
shoes|туфли; обувь|My shoes are brown.|Мои туфли коричневые.|👞
boots|ботинки; сапоги|My boots are black.|Мои ботинки чёрные.|🥾
wear|носить (одежду)|I wear a jacket in winter.|Зимой я ношу куртку.|🧥
clothes|одежда|My clothes are in the wardrobe.|Моя одежда в шкафу.|👕
''')
add(7,'7c-fun','7c','Развлечения на улице','Планы на любую погоду','Рабочая тетрадь: с. 55', '''
go skiing|кататься на лыжах|We go skiing in winter.|Зимой мы катаемся на лыжах.|⛷️
go camping|ходить в поход с палаткой|We go camping in summer.|Летом мы ходим в поход с палаткой.|⛺
have a picnic|устраивать пикник|We have a picnic in the park.|Мы устраиваем пикник в парке.|🧺
make a snowman|лепить снеговика|We can make a snowman.|Мы можем слепить снеговика.|⛄
play in the snow|играть в снегу|I like to play in the snow.|Я люблю играть в снегу.|❄️
go swimming|ходить плавать|We go swimming on Sunday.|В воскресенье мы ходим плавать.|🏊
''')
add(8,'8a-celebrations','8a','Празднуем!','Традиции, украшения и подарки','Рабочая тетрадь: с. 59', '''
celebrate|праздновать|We celebrate my birthday today.|Сегодня мы празднуем мой день рождения.|🎉
festival|фестиваль; праздник|The festival lasts three days.|Фестиваль длится три дня.|🎊
parade|парад; шествие|We watch the parade.|Мы смотрим парад.|🥁
fireworks|фейерверк|We watch the fireworks.|Мы смотрим фейерверк.|🎆
decorate|украшать|We decorate the house.|Мы украшаем дом.|🎈
exchange gifts|обмениваться подарками|We exchange gifts in December.|В декабре мы обмениваемся подарками.|🎁
special|особенный|Today is a special day.|Сегодня особенный день.|✨
food|еда|I like this food.|Мне нравится эта еда.|🍽️
pumpkin|тыква|This pumpkin is orange.|Эта тыква оранжевая.|🎃
pie|пирог|Mum makes a pumpkin pie.|Мама готовит тыквенный пирог.|🥧
''')
add(8,'8b-food','8b','На кухне','Еда, напитки и порции','Рабочая тетрадь: с. 59–60', '''
bread|хлеб|I eat bread for breakfast.|Я ем хлеб на завтрак.|🍞
milk|молоко|I drink milk in the morning.|Утром я пью молоко.|🥛
water|вода|I drink water every day.|Я пью воду каждый день.|💧
rice|рис|We have rice for dinner.|На ужин у нас рис.|🍚
potato|картофелина|This potato is small.|Эта картофелина маленькая.|🥔
banana|банан|I eat a banana for breakfast.|На завтрак я ем банан.|🍌
carrot|морковь|This carrot is orange.|Эта морковка оранжевая.|🥕
sandwich|сэндвич; бутерброд|I have a sandwich for lunch.|На обед у меня бутерброд.|🥪
cereal|хлопья для завтрака|I have cereal for breakfast.|На завтрак я ем хлопья.|🥣
sugar|сахар|There is sugar in the bowl.|В миске есть сахар.|🍬
bottle|бутылка|This is a bottle of water.|Это бутылка воды.|🧴
bowl|миска|This bowl is blue.|Эта миска синяя.|🥣
loaf|буханка|This is a loaf of bread.|Это буханка хлеба.|🍞
''')
add(8,'8c-birthday','8c','День рождения','Угощения и приглашения','Рабочая тетрадь: с. 61', '''
party|вечеринка; праздник|We have a birthday party today.|Сегодня у нас праздник в честь дня рождения.|🎉
cake|торт|This cake is for you.|Этот торт для тебя.|🎂
ice cream|мороженое|I like ice cream.|Мне нравится мороженое.|🍦
lemonade|лимонад|Would you like some lemonade?|Хочешь немного лимонада?|🍋
sausage|сосиска|I have a sausage for lunch.|На обед у меня сосиска.|🌭
biscuit|печенье|Would you like a biscuit?|Хочешь печенье?|🍪
good idea|хорошая идея|That is a good idea!|Это хорошая идея!|💡
that sounds great|звучит здорово|That sounds great!|Звучит здорово!|🤩
''')
add(9,'9a-shopping','9a','Идём за покупками','Городские магазины','Рабочая тетрадь: с. 65', '''
shop|магазин|This shop is small.|Этот магазин небольшой.|🛍️
toy shop|магазин игрушек|The toy shop is on the ground floor.|Магазин игрушек на нижнем этаже.|🧸
bookshop|книжный магазин|The bookshop is next to the cinema.|Книжный магазин рядом с кинотеатром.|📚
bakery|пекарня|I buy bread at the bakery.|Я покупаю хлеб в пекарне.|🥖
florist's|цветочный магазин|We buy flowers at the florist's.|Мы покупаем цветы в цветочном магазине.|💐
chemist's|аптека|The chemist's is near my house.|Аптека рядом с моим домом.|💊
newsagent's|газетный киоск; магазин прессы|Dad buys a newspaper at the newsagent's.|Папа покупает газету в магазине прессы.|📰
jeweller's|ювелирный магазин|The jeweller's sells rings.|В ювелирном магазине продают кольца.|💍
buy|покупать|I want to buy a book.|Я хочу купить книгу.|🛍️
pair|пара|I need a pair of shoes.|Мне нужна пара туфель.|👟
''')
add(9,'9b-places','9b','Куда пойдём?','Места для впечатлений','Рабочая тетрадь: с. 66', '''
cinema|кинотеатр|We go to the cinema on Sunday.|В воскресенье мы идём в кинотеатр.|🎬
theatre|театр|We see a play at the theatre.|Мы смотрим спектакль в театре.|🎭
museum|музей|The museum is interesting.|Музей интересный.|🏛️
art gallery|художественная галерея|We see paintings at the art gallery.|Мы смотрим картины в художественной галерее.|🖼️
theme park|тематический парк развлечений|We have fun at the theme park.|Мы веселимся в тематическом парке развлечений.|🎢
concert hall|концертный зал|We listen to music at the concert hall.|Мы слушаем музыку в концертном зале.|🎶
zoo|зоопарк|We see animals at the zoo.|Мы смотрим на животных в зоопарке.|🦒
quiet|тихий; тихо|Please be quiet.|Пожалуйста, веди себя тихо.|🤫
''')
add(9,'9c-films','9c','Не пропусти фильм','Фильмы и впечатления','Рабочая тетрадь: с. 67', '''
film|фильм|This film is funny.|Этот фильм смешной.|🎬
comedy|комедия|This comedy is great.|Эта комедия замечательная.|😄
cartoon|мультфильм|I like this cartoon.|Мне нравится этот мультфильм.|🍿
hero|герой|The hero saves the world.|Герой спасает мир.|🦸
spy|шпион|The film is about a spy.|Этот фильм о шпионе.|🕵️
boring|скучный|This film is boring.|Этот фильм скучный.|🥱
perfect|идеальный; превосходный|This film is perfect for children.|Этот фильм идеально подходит детям.|⭐
rescue|спасать|The toys rescue the animals.|Игрушки спасают животных.|🦸
''')
add(10,'10a-travel','10a','Путешествуем','Куда и на чём отправимся?','Рабочая тетрадь: с. 71', '''
cruise|круиз|We go on a cruise in summer.|Летом мы отправляемся в круиз.|🚢
beach holiday|пляжный отдых|I like a beach holiday.|Мне нравится пляжный отдых.|🏖️
safari|сафари|We can take photos on a safari.|На сафари мы можем фотографировать.|🦒
activity holiday|активный отдых|We want an activity holiday.|Мы хотим активного отдыха.|🚴
sightseeing tour|обзорная экскурсия|We go on a sightseeing tour.|Мы отправляемся на обзорную экскурсию.|🏙️
coach|междугородний автобус|We travel by coach.|Мы путешествуем на междугороднем автобусе.|🚌
ship|корабль|This ship is big.|Этот корабль большой.|🚢
train|поезд|We travel by train.|Мы путешествуем на поезде.|🚆
car|машина|We travel by car.|Мы путешествуем на машине.|🚗
bike|велосипед|I ride my bike in the park.|Я катаюсь на велосипеде в парке.|🚲
motorbike|мотоцикл|My uncle has got a motorbike.|У моего дяди есть мотоцикл.|🏍️
take photos|фотографировать|I like to take photos.|Мне нравится фотографировать.|📸
''')
add(10,'10b-summer','10b','Летние приключения','Занятия и впечатления','Рабочая тетрадь: с. 72', '''
hiking|пешие походы|I like hiking in the mountains.|Мне нравятся пешие походы в горы.|🥾
fishing|рыбалка|My dad likes fishing.|Моему папе нравится рыбалка.|🎣
windsurfing|виндсёрфинг|My brother likes windsurfing.|Моему брату нравится виндсёрфинг.|🏄
scuba diving|подводное плавание с аквалангом|I want to try scuba diving.|Я хочу попробовать плавание с аквалангом.|🤿
jet skiing|катание на водном мотоцикле|My uncle likes jet skiing.|Моему дяде нравится катание на водном мотоцикле.|🌊
white water rafting|сплав по бурной реке|We want to try white water rafting.|Мы хотим попробовать сплав по бурной реке.|🚣
exciting|увлекательный; захватывающий|This holiday is exciting.|Эти каникулы увлекательные.|🤩
relaxing|расслабляющий|Fishing is relaxing.|Рыбалка помогает расслабиться.|🌿
tiring|утомительный|Hiking can be tiring.|Пешие походы могут быть утомительными.|🥾
dangerous|опасный|This game is dangerous.|Эта игра опасная.|⚠️
''')
add(10,'10c-note','10c','Самочувствие и просьбы','Полезные фразы на каникулах','Рабочая тетрадь: с. 73', '''
headache|головная боль|I have got a headache.|У меня болит голова.|🤕
toothache|зубная боль|I have got a toothache.|У меня болит зуб.|🦷
stomachache|боль в животе|I have got a stomachache.|У меня болит живот.|🤒
sunburn|солнечный ожог|I have got sunburn.|У меня солнечный ожог.|☀️
airport|аэропорт|We go to the airport by car.|Мы едем в аэропорт на машине.|✈️
certainly|конечно; разумеется|Certainly, I can help you.|Конечно, я могу тебе помочь.|👍
yes, sure|да, конечно|Yes, sure, I can come.|Да, конечно, я могу прийти.|🤝
reasonable|разумный; приемлемый|That price is reasonable.|Это приемлемая цена.|🪙
''')
# Alternative common spellings accepted only where appropriate.
aliases={'rubber':['eraser'],'schoolbag':['school bag'],'maths':['math'],'trainers':['sneakers'],'autumn':['fall'],'jumper':['sweater'],'film':['movie'],'stomachache':['stomach ache'],'key ring':['keyring'],'white water rafting':['white-water rafting'],'yes, sure':['yes sure']}
for l in lessons:
 for w in l['words']:
  if w['en'].lower() in aliases:w['aliases']=aliases[w['en'].lower()]
  if w['en']=='PE':w['audio']='P E'
  if w['en']=='IT':w['audio']='I T'
course={'version':'2026-10-10.1','title':'Wordberry · Spotlight 5','modules':[dict(id=i,en=en,title=title,emoji=e) for i,en,title,e in modules], 'lessons':lessons,'sourceNote':'Тематическая подборка слов и фраз по загруженным материалам Spotlight 5. Учебник содержит Starter и модули 1–2; модули 3–10 составлены по рабочей тетради. Это стартовый словарь, а не полная оцифровка всех слов учебника. Примеры предложений и переводы составлены для тренажёра.','sources':[{'name':'Angliyskiy_yazyk_Elektron._uchebnik_dlya_5_klassa_po_FOOP.pdf','pdfPages':45,'scope':'Starter и модули 1–2'},{'name':'5_kl_Spotlight_Workbook.pdf','pdfPages':90,'scope':'Starter и модули 1–10'}]}
# Ensure IDs shared across lessons don't disagree about their meanings.
seen={}
for l in lessons:
 for w in l['words']:
  if w['id'] in seen and seen[w['id']]['ru']!=w['ru']:
   w['id']+='-'+hashlib.sha1(w['ru'].encode()).hexdigest()[:6]
  seen[w['id']]=w
Path('data/course.json').write_text(json.dumps(course,ensure_ascii=False,indent=2)+'\n')
print('LESSONS',len(lessons),'UNIQUE WORDS',len(seen),'ENTRIES',sum(len(l['words']) for l in lessons))
