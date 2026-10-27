// ===================== 住民の物語 (ver.47): 住民10人に、それぞれ3つのお話 =====================
// - なかよし度が 2 / 6 / 10 になると、その住民が「話したいことがある」（頭に！）。話しかけるとお話がはじまる
// - お話のあとに「約束」がある: 時間と場所の待ち合わせ／釣り・虫とりなどの勝負／持ってきてほしいもの／写真／みんなへの声かけ
// - 約束をはたすと、続きの場面とお礼。3つめのお話で、その人の夢や悩みにひと区切りがつく
// - 手帳の「物語」に、住民ごとの進み具合と「もう一度見る」。左の手帳には今の約束が出る
const BOND = { t: 0, emoT: 0 };
// lines: [who, text, need?]  who = villager id ('v_mio'), '' for narration, '@' for you; a line whose speaker (or `need`) has not moved in yet is skipped
BOND.EP = {
  v_mio: [
    { f: 2, title: '灯台と夕日', task: { k: 'place', lm: 'light', h: [16, 19.5], r: 26, text: '夕方（16時〜19時半）に、灯台へ' },
      intro: [['v_mio', 'ねえ{P}さん、こんど夕方、灯台に来てくれない？'], ['v_mio', 'わたしのいちばん好きな景色、{P}さんにも見てほしいんだ。']],
      outro: [['', '――夕日が、白い灯台をオレンジ色にそめていく。'], ['v_mio', '来てくれたんだ！ …ね、きれいでしょ。'], ['v_mio', 'わたしね、小さいころ、夜の船でこの島に来たの。まっくらな海がこわくて泣いてたら、この灯台の光が見えて。'], ['v_mio', '「もう大丈夫だよ」って言われてる気がしたんだ。だから、灯台が大好きなの。'], ['v_mio', '…あっ、このスケッチブックは見ちゃだめ！ まだ、へたっぴだから。']],
      reward: { money: 1000 } },
    { f: 6, title: 'とんでいったページ', task: { k: 'stat', stat: 'shoreN', n: 3, text: '浜で拾いものを3つひろって、ミオに話す' },
      intro: [['v_mio', '{P}さん、たいへん！ 浜で絵をかいてたら、風でスケッチブックのページがとんでいっちゃった…。'], ['v_mio', '浜のどこかに流れついてるかも。いっしょにさがしてくれる？']],
      outro: [['', '――貝がらや流木にまじって、しめった紙が3まい見つかった。'], ['v_mio', 'あった！ ありがとう、{P}さん！'], ['v_mio', '…見えちゃった？ これ、島のみんなの絵なんだ。ゲンじいの船、ハナさんの花、それから…これ、{P}さん。'], ['v_mio', 'わたしね、いつか島の絵本を作りたいの。島に来た子どもが、さびしくならないような絵本。'], ['v_mio', 'ナイショだよ？ {P}さんにだけ言ったんだから。']],
      reward: { money: 500, decor: { postbox: 1 } } },
    { f: 10, title: 'はじめての絵本', task: { k: 'place', lm: 'hall', h: [13, 17], r: 14, text: '昼すぎ（13時〜17時）に、集会所へ' },
      intro: [['v_mio', '{P}さん！ 絵本、できたの！ 「ほしなみ島のとうだい」っていうんだ。'], ['v_mio', '昼すぎに、集会所で読み聞かせをするの。…{P}さんも来てくれる？']],
      outro: [['', '――集会所には、子どもたちと、たくさんの大人が集まっていた。'], ['v_mio', '「むかしむかし、海のまんなかに、ひとりぼっちの灯台がありました…」'], ['v_mio', '「…灯台は、まいばん光をとどけました。帰ってくる船に、はじめて来る人に、『もう大丈夫だよ』って」'], ['v_kota', 'すげー！ 灯台、かっこいい！'], ['v_yuki', '線がやさしくて、あたたかい絵ね。ミオちゃん、ほんものの絵本作家だわ。'], ['v_mio', '{P}さん、ありがとう。…最後のページの人、だれだかわかる？ 島に来てくれた、{P}さんだよ。']],
      reward: { money: 3000, vit: 10 } },
  ],
  v_sora: [
    { f: 2, title: 'ひみつの釣り場', task: { k: 'place', lm: 'falls', h: [5, 9.5], r: 28, text: '朝（5時〜9時半）に、滝へ' },
      intro: [['v_sora', 'なあ{P}、前に言ってた「オレのひみつの釣り場」、教えてやるよ。'], ['v_sora', '朝が勝負なんだ。早起きして、滝つぼに来いよな！']],
      outro: [['', '――朝もやの中、滝の音だけがひびいている。'], ['v_sora', '来たな！ 見ろよ、この淵。アユがキラッキラ光ってるだろ？'], ['v_sora', 'ここ、親父が教えてくれた場所なんだ。親父は本土で働いてて、年に何回かしか帰ってこないけどさ。'], ['v_sora', '帰ってきたら、いつもここで並んで釣るんだ。…ナイショだぜ？ 島のやつらにも言ってないんだから。']],
      reward: { money: 1000 } },
    { f: 6, title: '港の釣り勝負', task: { k: 'stat', stat: 'fishN', n: 3, text: '魚を3匹釣って、ソラに話す' },
      intro: [['v_sora', '{P}、釣り勝負しようぜ！ 今から先に魚を3匹釣ったほうが勝ちな！'], ['v_sora', '負けたほうは…あとで考える！ よーい、スタート！']],
      outro: [['v_sora', 'えっ、もう3匹！？ …まいった、オレまだ2匹だ。'], ['v_sora', '……なあ{P}。オレさ、本土の運送会社から「うちで働かないか」って言われてるんだ。'], ['v_sora', '運転は好きだし、親父の近くにも行ける。でも、島を出るのは…なんかちがう気がしてさ。'], ['v_sora', '…わりい、急にこんな話。勝負はおまえの勝ちだ！ これ、賞金な！']],
      reward: { money: 1500 } },
    { f: 10, title: 'ハンドルの向こう', task: { k: 'stat', stat: 'busN', n: 1, text: '島めぐりバスに乗って、ソラに話す', alt: { stat: 'truckM', n: 300, text: '軽トラで300m走って、ソラに話す（バスはまだないので）', when: () => !devDone('bus') } },
      intro: [['v_sora', '{P}、決めたぜ。オレ、島めぐりバスの運転手になる！'], ['v_sora', '島を出なくても、ハンドルはにぎれる。島のみんなを乗せて走れるんだ。'], ['v_sora', '今、運転の練習中なんだ。…乗りに来てくれよな！']],
      outro: [['v_sora', '「次は〜、{I}島港前〜。お降りの方は、ボタンでお知らせくださ〜い」…どうだ、決まってたろ？'], ['v_sora', '親父に電話したらさ、「おまえらしい」って笑ってたよ。'], ['v_sora', '島に残るって決めたら、なんか景色まで変わって見えるんだ。…{P}、ありがとな。相棒！']],
      reward: { money: 3000 } },
  ],
  v_hana: [
    { f: 2, title: '夜に咲く花', task: { k: 'place', lm: 'church', h: [19, 22], r: 22, text: '夜（19時〜22時）に、神社へ' },
      intro: [['v_hana', '{P}さん、月見草って知っている？ 夜になってから咲く、うす黄色のお花なの。'], ['v_hana', '神社のそばに咲いているのよ。こんど夜、見に来てくださる？']],
      outro: [['', '――石灯籠のあかりの下で、小さな花がひらいていく。'], ['v_hana', 'ほら、今ひらいたわ。…きれいでしょう。'], ['v_hana', 'ここの椿も月見草も、夫のシゲルさんが植えたの。この島に来た年にね。'], ['v_hana', 'シゲルさんがいなくなってからも、お花の世話だけは続けているの。お花が咲くと、まだそばにいてくれる気がして。'], ['v_hana', '…ごめんなさいね、しんみりしちゃった。来てくれて、うれしかったわ。']],
      reward: { decor: { pot: 2 } } },
    { f: 6, title: '花のお茶', task: { k: 'bring', item: 'forage', n: 1, text: '山の幸を1つ、ハナにわたす（林でひろえます）' },
      intro: [['v_hana', '{P}さん、お願いがあるの。林で山の幸をひとつ、とってきてくださらない？'], ['v_hana', 'お花と山の幸で、とっておきのお茶をいれたいの。']],
      outro: [['v_hana', 'ありがとう。…はい、どうぞ。熱いから気をつけてね。'], ['v_hana', 'わたしね、むかしは大阪でお花屋さんをしていたの。毎日いそがしくて、季節を感じるひまもなかった。'], ['v_hana', 'この島に来て、はじめて「春ってこんなにゆっくり来るんだ」って知ったのよ。'], ['v_hana', '{P}さんと飲むお茶は、とびきりおいしいわ。']],
      reward: { money: 1500 } },
    { f: 10, title: 'みんなの花畑', task: { k: 'stat', stat: 'plant', n: 3, text: 'しまづくりで木を3本植えて、ハナに話す' },
      intro: [['v_hana', '{P}さん。わたし、島のみんなが歩ける花畑をつくりたいの。'], ['v_hana', 'シゲルさんの花を、わたしだけのものにしておくのは、もったいないもの。'], ['v_hana', 'しまづくりで、木を3本植えてくれる？ そのまわりに、お花の種をまくわ。']],
      outro: [['', '――植えた木のまわりに、小さな芽がいっせいに顔を出した。'], ['v_hana', '見て、{P}さん。もう芽が出てきたわ。'], ['v_hana', '子どもたちが走り回って、お年よりがベンチでひと休みして…そんな花畑になるといいわね。'], ['v_hana', 'シゲルさん、聞こえる？ 島に、新しいお花がふえたわよ。'], ['v_hana', 'これ、わたしからのお礼。お花のそばに置いてね。']],
      reward: { decor: { fountain: 1 } } },
  ],
  v_gen: [
    { f: 2, title: '朝の網', task: { k: 'place', lm: 'harbor', h: [4.5, 8], r: 30, text: '朝（4時半〜8時）に、港へ' },
      intro: [['v_gen', '{P}、明日の朝、港に来んか。網のつくろい方を教えてやる。'], ['v_gen', '漁師の朝は早いぞ。日がのぼるころじゃ。']],
      outro: [['', '――朝日が、港の水面を金色にそめている。'], ['v_gen', 'よう来た。ほれ、ここをこう通して、こう結ぶ。…ほう、筋がええのう。'], ['v_gen', 'わしのばあさんはの、網つくろいが島で一番うまかった。わしなんぞ、いつも笑われとった。'], ['v_gen', 'ばあさんが亡くなってから、この網はわしひとりでつくろうとる。…今朝は、ひさしぶりにふたりじゃな。']],
      reward: { money: 1000 } },
    { f: 6, title: '海を読む', task: { k: 'stat', stat: 'boatM', n: 300, text: '漁船で300m進んで、ゲンじいに話す' },
      intro: [['v_gen', '{P}。漁船で、少し沖まで出てみい。'], ['v_gen', '船の上から島を見るとの、島がちがって見える。それが漁師の目じゃ。']],
      outro: [['v_gen', 'どうじゃった。沖から見た島は、ちいさかったじゃろう。'], ['v_gen', 'あの船は「ほしなみ丸」いうてな。ばあさんが名前をつけたんじゃ。「星の波の上を走る船」じゃと。'], ['v_gen', 'わしは六十年、あの船で海に出た。海はこわい。じゃが、うそはつかん。'], ['v_gen', '…おまえさんの舵さばき、悪うなかったぞ。']],
      reward: { money: 2000 } },
    { f: 10, title: 'ほしなみ丸の舵', task: { k: 'stat', stat: 'shipFish', n: 3, text: '港の出荷所で魚を3匹出荷して、ゲンじいに話す' },
      intro: [['v_gen', '{P}、ひとつ頼みがある。'], ['v_gen', 'わしの代わりに、漁協に魚を3匹おさめてきてくれんか。…島の漁師としての、最初の仕事じゃ。']],
      outro: [['v_gen', 'ようやった。漁協の連中も「いい魚じゃ」と言うとったぞ。'], ['v_gen', 'わしもそろそろ、年じゃ。…ほしなみ丸の舵、おまえさんにあずけたい。'], ['v_gen', 'なに、まだ引退はせん。となりで、口だけは出させてもらうがの。わっはっは。'], ['v_gen', 'ばあさん、見とるか。ほしなみ丸に、ええ船長ができたぞ。']],
      reward: { money: 5000 } },
  ],
  v_rin: [
    { f: 2, title: '丘の上の星', task: { k: 'place', lm: 'peak', h: [20, 23.5], r: 24, text: '夜（20時〜23時半）に、見晴らしの丘のてっぺんへ' },
      intro: [['v_rin', '{P}さん、今夜ひま？ 見晴らしの丘で、いっしょに星を見ない？'], ['v_rin', '夜の丘から見ると、島の灯りがぜんぶ見えるんだ。']],
      outro: [['', '――足もとに島の灯り、頭の上には星。'], ['v_rin', 'ね、いいでしょ。ここ、おじいちゃんとよく来たの。'], ['v_rin', 'わたしが小さいころ、友だちがみんな、家族といっしょに本土に引っこしていったの。島の灯りが、ひとつずつ消えていって…。'], ['v_rin', 'だから、灯りがふえていくのを見るのが、いちばんうれしいの。…{P}さんの家の灯りも、ちゃんと見えるよ。']],
      reward: { money: 1000 } },
    { f: 6, title: 'ふたりの願いごと', task: { k: 'stat', stat: 'prayN', n: 1, text: '神社でお参りして、リンに話す' },
      intro: [['v_rin', '{P}さん、こんど神社で、お参りしてくれない？'], ['v_rin', 'わたしもね、ちょっと…願いたいことがあるんだ。']],
      outro: [['v_rin', 'お参り、してくれたんだね。ありがとう。'], ['v_rin', 'わたしね、本土の大学で「島のまちづくり」を勉強してみたいって、ずっと思ってたの。でも、島をはなれるのがこわくて。'], ['v_rin', 'でも今は、橋も船もある。行っても、すぐに帰ってこられる。'], ['v_rin', 'だから願ったの。「勉強して、もっと島の役に立てますように」って。…{P}さんは、何をお願いした？ …ナイショ？ ふふっ。']],
      reward: { money: 1500 } },
    { f: 10, title: '島だより 特別号', task: { k: 'photo', spot: 'vista', text: '高い所から集落を見おろして写真をとり、リンに話す（名所「島の全景」）' },
      intro: [['v_rin', '{P}さん、「島だより」の特別号を作るの。島を出ていった人たちにも送るんだ。'], ['v_rin', '一面にのせる「島の全景」の写真、{P}さんがとってくれない？']],
      outro: [['v_rin', 'すてきな写真！ これで一面ができたよ。'], ['', '――何週間かして、リンのもとに一通の手紙がとどいた。'], ['v_rin', 'むかし島に住んでいたおばあちゃんからだよ。「写真の島が、むかしよりにぎやかで、涙が出ました。孫をつれて、遊びに行きます」って。'], ['v_rin', '灯りって、こうやってまた、ひとつずつふえていくんだね。…{P}さん、これからもいっしょに島を作っていこうね。']],
      reward: { money: 3000, decor: { bench: 2 } } },
  ],
  v_kai: [
    { f: 2, title: 'みかんジュース計画', task: { k: 'bring', item: 'mikan', n: 3, text: 'みかんを3つ、カイにわたす' },
      intro: [['v_kai', '{P}さん、新商品を作りたいの！ 島のみかんで、みかんジュース！'], ['v_kai', 'みかんを3つ持ってきてくれないかな？ 試作品、いちばんに飲ませてあげる！']],
      outro: [['v_kai', 'しぼって、しぼって…できた！ はい、どうぞ！'], ['v_kai', '…どう？ すっぱい？ あまい？ …「ちょうどいい」！？ やったー！'], ['v_kai', '「{I}島みかんジュース」、お店の新しい名物にするね！ {P}さんのおかげだよ！']],
      reward: { money: 1000 } },
    { f: 6, title: 'はじめての仕入れ', task: { k: 'bring', item: 'dish', n: 1, text: '料理を1品、カイにわたす（家のちゃぶ台で作れます）' },
      intro: [['v_kai', '{P}さん、こんどの朝市で、島の料理を売ってみたいんだ。'], ['v_kai', '{P}さんの手料理、ひとつ分けてくれない？ 味見して、作り方を勉強したいの！']],
      outro: [['v_kai', 'おいしい…！ これ、ぜったい売れるよ！'], ['v_kai', 'ぼくね、ほんとうは、自分のお店を持つのが夢なんだ。海が見える小さなカフェ。'], ['v_kai', 'お父さんとお母さんのお店も大好きだけど、自分で考えたお店も、やってみたいの。'], ['v_kai', '…言っちゃった。{P}さん、だれにも言わないでね！']],
      reward: { money: 2000 } },
    { f: 10, title: 'カフェ・ほしなみ', task: { k: 'place', lm: 'beach', h: [10, 17], r: 34, text: '昼（10時〜17時）に、夕日の浜へ' },
      intro: [['v_kai', '{P}さん！ お父さんたちがね、「夏のあいだ、浜で屋台カフェをやってみなさい」って！'], ['v_kai', '夕日の浜で、一日だけのカフェをひらくの。お客さん第一号になってくれる？']],
      outro: [['', '――パラソルの下に、手書きの看板。「カフェ・ほしなみ」'], ['v_kai', 'いらっしゃいませ〜！ 第一号のお客さま、{P}さまで〜す！'], ['v_kai', 'メニューは、みかんジュースと、{P}さんの料理をまねしたランチと、ハナさんのお花のお茶！'], ['v_hana', 'お客さんがひっきりなしね。カイくん、立派な店長さんよ。'], ['v_kai', 'これ、カフェで使ったパラソル。{P}さんにあげる！ 島のどこかで、カフェごっこしてね！']],
      reward: { money: 2000, decor: { parasol: 1 } } },
  ],
  v_nagi: [
    { f: 2, title: '夜のイカ釣り', task: { k: 'place', lm: 'harbor', h: [20, 23.5], r: 30, text: '夜（20時〜23時半）に、港へ' },
      intro: [['v_nagi', '{P}さん、夜のイカ釣りって、したことある？'], ['v_nagi', '港の防波堤でいっしょにやろうよ！ 夜になると、イカが灯りにあつまってくるんだ。']],
      outro: [['', '――波の音と、ウキの小さな光。'], ['v_nagi', 'しーっ…来た！ …ほら、アオリイカ！'], ['v_nagi', 'わたしのおばあちゃん、この島の生まれなんだ。小さいころから、この島の話ばっかり聞いてたの。'], ['v_nagi', '「夜の港は、星が水の中にもあるのよ」って。…ほんとだね。'], ['v_nagi', 'おばあちゃんが見てた景色を、いま見てるんだなあ。']],
      reward: { money: 1000 } },
    { f: 6, title: 'おばあちゃんの写真', task: { k: 'photo', spot: 'harbor', text: '港の漁船といっしょに写真をとり、ナギに話す（名所「港と漁船」）' },
      intro: [['v_nagi', '{P}さん、これ見て。おばあちゃんが若いころの写真なの。港で、漁船の前でわらってる。'], ['v_nagi', '同じ場所で写真をとって、おばあちゃんに送りたいんだ。とってくれる？']],
      outro: [['v_nagi', 'ありがとう！ ならべてみると…ほら、灯台も船も、同じだ！'], ['v_gen', 'ん？ その写真…この娘さん、ミチコじゃないか？'], ['v_nagi', 'えっ、ゲンじい、おばあちゃんのこと知ってるの！？'], ['v_gen', '知っとるもなにも、わしの幼なじみじゃ。釣りの腕は、わしより上じゃった。…ほう、孫が島に帰ってきたか。'], ['v_nagi', 'おばあちゃんに電話しなきゃ！ {P}さん、すごいよ、ほんとにすごい！']],
      reward: { money: 1500 } },
    { f: 10, title: '滝つぼのぬし', task: { k: 'stat', stat: 'fishN', n: 5, text: '魚を5匹釣って、ナギに話す' },
      intro: [['v_nagi', '{P}さん、知ってる？ 滝つぼには「ぬし」がいるんだって。おばあちゃんも、一度だけ見たことがあるって。'], ['v_nagi', 'わたし、ぬしに会いたい。…まずは腕だめし！ 魚を5匹釣って、見せにきて！']],
      outro: [['v_nagi', 'さすが{P}さん！ …じつはね、きのうの夕方、見たんだ。滝つぼのぬし。'], ['v_nagi', '金色の、大きな大きなコイ。わたしのウキの横を、ゆうゆうと泳いでいったの。'], ['v_nagi', 'つり上げようと思えば、できたかもしれない。でも…やめた。'], ['v_nagi', 'ぬしがいるのは、この島の川がきれいなしるしなんだって、おばあちゃんが言ってたから。…{P}さんも、いつか会えるといいね。']],
      reward: { money: 3000 } },
  ],
  v_takumi: [
    { f: 2, title: '材木はこび', task: { k: 'place', lm: 'hall', h: [7, 12], r: 14, text: '午前中（7時〜12時）に、集会所へ' },
      intro: [['v_takumi', '{P}さん、午前中、ちょっと手を貸してもらえませんか？'], ['v_takumi', '集会所の修理に使う材木を運ぶんすけど、ひとりだと重くて…。']],
      outro: [['', '――ふたりで運ぶと、太い柱もずいぶん軽く感じた。'], ['v_takumi', '助かったっす！ …この柱、百年前の大工さんが使った木なんすよ。ほら、ここに名前が彫ってある。'], ['v_takumi', 'おれ、大阪の大きな会社で働いてたんす。毎日同じ部品をつけるだけで、だれの家を作ってるのかもわからなくて。'], ['v_takumi', 'この島の古い家を見て、思ったんす。「住む人の顔を思いうかべて作る大工になりたい」って。']],
      reward: { money: 1000 } },
    { f: 6, title: 'こわれたベンチ', task: { k: 'stat', stat: 'decorN', n: 1, text: 'しまづくり「かざる」で、なにか1つ置いて、タクミに話す' },
      intro: [['v_takumi', '……{P}さん。おれ、だめっすね。'], ['v_takumi', '広場に作ったベンチ、座ったとたんに足が折れちゃって。けがした人はいなかったんすけど…。'], ['v_takumi', 'もう一回作りなおすっす。どこに置いたらみんなが喜ぶか、{P}さんがしまづくりで1つ置いてみてもらえませんか？']],
      outro: [['v_takumi', 'あそこに置いたんすね。…たしかに、いい場所っす。'], ['v_takumi', '置く場所を考えたら、どう作ればいいかも見えてきたっす。座る人が、長くいたくなるベンチ。'], ['v_takumi', '失敗して、やっとわかったっす。…これ、作りなおした一つ目。{P}さんにもらってほしいっす。']],
      reward: { money: 1000, decor: { bench: 1 } } },
    { f: 10, title: '一人前の証', task: { k: 'stat', stat: 'roadM', n: 30, text: 'しまづくりで道を30m作って、タクミに話す' },
      intro: [['v_takumi', '{P}さん、おれ、神社の古い鳥居の建てなおしをまかされたんす。'], ['v_takumi', '材木を運ぶ道がせまくて…。しまづくりで、道を30mのばしてもらえませんか？']],
      outro: [['', '――あたらしい木の香りのする鳥居が、もとの場所にしっかりと立った。'], ['v_takumi', 'できたっす…！ 前の鳥居と同じ形、同じ寸法。でも、柱の一本一本に、島のみんなの顔を思いうかべたっす。'], ['v_takumi', '大阪の親方から手紙が来たんすよ。「写真を見た。いい仕事だ。一人前だな」って。'], ['v_takumi', '…{P}さんがいなかったら、おれ、とっくに道具を置いてたっす。ほんとに、ありがとうございました！']],
      reward: { money: 4000 } },
  ],
  v_yuki: [
    { f: 2, title: '夕日の色', task: { k: 'place', lm: 'beach', h: [16.5, 18.6], r: 34, text: '夕方（16時半〜18時半）に、夕日の浜へ' },
      intro: [['v_yuki', '{P}さん、夕日の浜の色って、毎日ちがうのよ。'], ['v_yuki', 'こんど、いっしょに見てくれないかしら。わたし、あの色をどうしても絵にしたいの。']],
      outro: [['', '――空が、オレンジから、うすいむらさきに変わっていく。'], ['v_yuki', '…この色。ずっとさがしていたの。'], ['v_yuki', 'わたしね、一年くらい、絵がかけなくなっていたの。何をかいても、色がにごって見えて。'], ['v_yuki', 'この島に来て、毎日空と海を見ていたら、少しずつ色がもどってきたのよ。'], ['v_yuki', '今日の空は、{P}さんといっしょに見た色。…きっと、いい絵になるわ。']],
      reward: { money: 1000 } },
    { f: 6, title: '滝の音をかく', task: { k: 'photo', spot: 'falls', text: '滝の写真をとって、ユキに話す（名所「滝」）' },
      intro: [['v_yuki', '{P}さん、こんどは滝をかきたいの。でも、水って動くから、なかなかつかまえられなくて。'], ['v_yuki', '滝の写真をとってきてくださらない？ じっくり見て、かいてみたいの。']],
      outro: [['v_yuki', 'ありがとう。…{P}さんの写真、水しぶきの音が聞こえてくるみたい。'], ['v_yuki', 'そうそう、ミオちゃんのスケッチ、見たことある？ 線にまよいがなくて、とてもすてきなの。'], ['v_yuki', 'わたし、ミオちゃんに絵を教えることになったのよ。教えるって、自分も教わることなのね。'], ['v_yuki', '島に来て、絵をかく仲間ができるなんて、思ってもみなかったわ。']],
      reward: { money: 1500 } },
    { f: 10, title: '島の展覧会', task: { k: 'talks', n: 8, text: '同じ日に、住民8人と話して（展覧会にさそう）、ユキに話す' },
      intro: [['v_yuki', '{P}さん、わたし、集会所で展覧会をひらくことにしたの。「{I}島の一年」。'], ['v_yuki', '島のみんなに来てほしいの。今日のうちに、住民のみんなに声をかけてくださる？']],
      outro: [['', '――集会所のかべいっぱいに、島の絵がならんだ。'], ['v_gen', 'ほう、こりゃほしなみ丸じゃ。…ばあさんがおったころの色じゃのう。'], ['v_kota', 'オレがいる！ 虫とりしてるとこ！'], ['v_yuki', '最後の一枚は、まだだれにも見せていないの。'], ['', '――それは、港に立つ{P}の後ろすがたと、まっすぐのびる灯台の光の絵だった。'], ['v_yuki', '題は「この島に来てくれた人」。…{P}さん、わたしにもう一度、絵をくれてありがとう。']],
      reward: { money: 4000 } },
  ],
  v_kota: [
    { f: 2, title: '虫とり名人', task: { k: 'stat', stat: 'bugN', n: 2, text: '虫を2ひきつかまえて、コタロウに話す' },
      intro: [['v_kota', '{P}！ 虫とり勝負しよーぜ！'], ['v_kota', '先に2ひきつかまえたほうが「虫とり名人」な！ よーい、どん！']],
      outro: [['v_kota', 'えーっ、もう2ひき！？ …しかたない、名人の座はゆずってやる！'], ['v_kota', 'オレさ、前の町では虫とりなんてしたことなかったんだ。公園には「虫とり禁止」って書いてあったし。'], ['v_kota', 'この島、最高だよな！ 次は負けないからな！']],
      reward: { money: 800 } },
    { f: 6, title: 'はなれ小島の探検', task: { k: 'place', lm: 'islet', h: [6, 19], r: 30, text: '昼のあいだ（6時〜19時）に、はなれ小島へ（干潮なら歩いて、満潮なら船で）' },
      intro: [['v_kota', '{P}、はなれ小島って行ったことある？ 潮が引くと、歩いて行けるんだって！'], ['v_kota', 'オレ、ひとりで行くと母ちゃんにおこられるから…いっしょに探検してくれよ！']],
      outro: [['', '――岩のかげに、小さな砂浜がかくれていた。'], ['v_kota', 'すげー！ ここ、ひみつきちにしよう！ {P}とオレだけのひみつな！'], ['v_kota', '…オレさ、島に来たばっかりのとき、ちょっとさびしかったんだ。同じくらいの子、ひとりもいなかったから。'], ['v_kota', 'でも{P}がいっぱい遊んでくれたから、平気になった。…へへっ、今のナイショな！']],
      reward: { money: 1500 } },
    { f: 10, title: 'かくれんぼ名人', task: { k: 'hide', h: [7, 18], r: 22, text: '昼のあいだ（7時〜18時）に、かくれたコタロウをさがす　ヒント：「{HINT}」' },
      intro: [['v_kota', '{P}、かくれんぼしよう！ オレがかくれるから、さがしに来てよ！'], ['v_kota', 'ヒント出してやる。「{HINT}」…じゃ、かくれた！']],
      outro: [['v_kota', 'あーっ、見つかった！ {P}、なんでわかったんだよー！'], ['v_kota', '…じつは、ちょっと待ちくたびれてた。来てくれて、よかった。'], ['v_kota', 'これ、オレのたからもの。浜で見つけた、青いシーグラス。…やっぱりお金のほうがいい？ じゃあ両方！'], ['v_kota', 'オレ、大きくなったら、{P}みたいに島をおもしろくする人になるんだ！']],
      reward: { money: 2000, vit: 10 } },
  ],
};
BOND.HIDE = { peak: '島でいちばん空に近いところ', falls: 'ザーザー音がして、水がおちてくるところ', light: '夜になると、海を照らすところ', church: '赤い門をくぐった先', mikan: 'オレンジ色の実がなる、だんだんのところ' };
BOND.ITEM = { mikan: 'みかん', fish: '魚', shore: '浜の拾いもの', forage: '山の幸', dish: '料理' };
BOND.st = function () { const p = GAME.p; p.bond = p.bond || {}; return p.bond; };
BOND.rec = function (id) { const S = BOND.st(); return S[id] || (S[id] = { ep: 0 }); };
BOND.npc = id => NPCS.find(n => n.def.id === id && !n.visitor);
BOND.resident = id => !!(GAME.p && VILLAGER_DEF.some(v => v.id === id) && BOND.npc(id));
BOND.who = w => w === '@' ? (GAME.p && GAME.p.name) || '' : w && w.startsWith('v_') ? VNAME(w) : w;
// the episode this villager wants to talk about now (or null)
BOND.avail = function (id) { const E = BOND.EP[id]; if (!E || !GAME.p || !GAME.p.talked[id] || !BOND.resident(id)) return null; const r = BOND.rec(id); if (r.ep >= E.length || r.task) return null; const e = E[r.ep]; return (GAME.p.friend[id] || 0) >= e.f ? e : null; };
BOND.text = function (id, s) { const t = BOND.rec(id).task; return t && t.hint ? s.replace('{HINT}', t.hint) : s; };
BOND.lines = function (id, L) { return L.filter(([w, , need]) => (!w || !w.startsWith('v_') || w === id || BOND.resident(w)) && (!need || BOND.resident(need))).map(([w, t]) => [BOND.who(w), BOND.text(id, t)]); };
// ---------- what you have / what is done ----------
BOND.have = function (item) { const b = GAME.bag(); if (item === 'mikan') return b.mikan || 0; if (item === 'fish') return (b.fish || []).length;
  if (item === 'shore') return typeof SHORE !== 'undefined' ? SHORE.count() : 0; if (item === 'forage' || item === 'dish') { const F = FORAGE.bag()[item]; return Object.values(F || {}).reduce((s, v) => s + v, 0); } return 0; };
BOND.take = function (item, n) { const b = GAME.bag(); if (item === 'mikan') { b.mikan -= n; return; } if (item === 'fish') { b.fish.splice(b.fish.length - n, n); return; }
  const bag = item === 'shore' ? SHORE.bag() : FORAGE.bag()[item]; for (const k of Object.keys(bag)) { while (n > 0 && bag[k] > 0) { bag[k]--; n--; } if (!bag[k]) delete bag[k]; if (!n) break; } };
BOND.talksToday = function () { const p = GAME.p, T = (p.daily && p.daily.talked) || {}; return VILLAGER_DEF.filter(v => T[v.id] && BOND.resident(v.id)).length; };
BOND.need = function (t) { if (t.k === 'talks') return Math.min(t.n, Math.max(2, VILLAGER_DEF.filter(v => BOND.resident(v.id)).length - 1)); return t.n || 1; };
BOND.prog = function (id) { const t = BOND.rec(id).task, p = GAME.p; if (!t) return 0;
  if (t.k === 'stat') return Math.max(0, (p.stats[t.stat] || 0) - t.base); if (t.k === 'bring') return BOND.have(t.item); if (t.k === 'photo') return PHOTO.done()[t.spot] ? 1 : 0; if (t.k === 'talks') return BOND.talksToday(); return 0; };
BOND.ready = id => { const t = BOND.rec(id).task; return !!t && t.k !== 'place' && t.k !== 'hide' && BOND.prog(id) >= BOND.need(t); };
BOND.pos = function (lm) { const L = GAME.LM || {}; if (lm === 'hall' && PLACED.hall) return PLACED.hall.entry; if (lm === 'light' && PLACED.lighthouse) return PLACED.lighthouse; return L[lm] || null; };
// ---------- scenes ----------
// the villager stays put and faces you while a scene plays (and a little after)
BOND.hold = function (n, ms) { n.bondHold = performance.now() + ms; n.asleep = false; n.mesh.visible = true; };
{ const _lv = liveVillager; liveVillager = function (n, dt) {
    if (n.bondHold && performance.now() < n.bondHold) { n.rot = angLerp(n.rot, Math.atan2(PL.x - n.x, PL.z - n.z), Math.min(1, dt * 6)); const ty = standY(n.x, n.z); n.y = ty; n.ph += dt * 1.8;
      n.mesh.visible = true; n.mesh.position.set(n.x, n.y, n.z); n.mesh.rotation.y = n.rot; n.tag.visible = true; if (n.props) for (const q of Object.values(n.props)) if (q) q.visible = false;
      if (n.emoT > 0) { n.emoT -= dt; if (n.emoT <= 0 && n.emo) n.emo.visible = false; }
      animateBody(n.parts, n.rest, n.ph, 0, dt, { nod: STORY.scene ? performance.now() / 1000 : 0 }); return; }
    if (n.bondHold) { n.bondHold = 0; n.place = null; }
    return _lv(n, dt); }; }
BOND.play = function (n, lines, done) { BOND.hold(n, 600000); STORY.play(lines, () => { BOND.hold(n, 2500); if (done) done(); }); };
BOND.begin = function (n, e) {
  const id = n.def.id, r = BOND.rec(id), k = r.ep; GAME.ev('talk', 1, id);
  if (e.task && e.task.k === 'hide') { const ks = Object.keys(BOND.HIDE).filter(q => BOND.pos(q)); const lm = ks[Math.floor(Math.random() * ks.length)] || 'peak'; r.task = { k: 'hide', ep: k, lm, hint: BOND.HIDE[lm], h: e.task.h, r: e.task.r, text: e.task.text }; }
  LIVE.emote(n, 'heart', 2.4); GAME.banner(`💞 ${n.def.name}の物語　その${k + 1}「${e.title}」`, '');
  BOND.play(n, BOND.lines(id, e.intro), () => {
    if (!e.task) return BOND.finish(n);
    let t = e.task; if (t.alt && t.alt.when()) t = Object.assign({}, t, t.alt);
    if (t.k !== 'hide') r.task = { k: t.k, ep: k, stat: t.stat, n: t.n, item: t.item, spot: t.spot, lm: t.lm, h: t.h, r: t.r, text: t.text, base: t.stat ? (GAME.p.stats[t.stat] || 0) : 0, since: todayKey() };
    GAME.dirty = true; UI.toast(`💞 ${n.def.name}との約束：${BOND.text(id, r.task.text)}`); GAME.renderTracker(); });
};
BOND.finish = function (n) {
  const id = n.def.id, r = BOND.rec(id), E = BOND.EP[id], e = E[r.ep], t = r.task, p = GAME.p; if (!e) return;
  const pre = []; if (t && t.k === 'bring') { BOND.take(t.item, t.n); pre.push(['', `（${BOND.ITEM[t.item]}を${t.n}つ、わたした）`]); }
  r.task = null; r.ep++; r.done = r.done || []; r.done.push(todayKey()); GAME.dirty = true;
  BOND.play(n, pre.concat(BOND.lines(id, e.outro)), () => {
    const w = e.reward || {}, got = []; p.friend[id] = (p.friend[id] || 0) + 2; got.push(`${n.def.name}となかよし +2`);
    if (w.money) { GAME.addMoney ? GAME.addMoney(w.money) : (p.money += w.money); got.push(yen(w.money)); }
    if (w.vit) { GAME.addVit(w.vit); got.push(`元気度 +${w.vit}`); }
    if (w.decor) { const b = GAME.bag(); for (const [k, v] of Object.entries(w.decor)) { b.decor[k] = (b.decor[k] || 0) + v; const D = DECOR.find(q => q.id === k); got.push(`${D ? D.name : k}×${v}（かざるもの）`); } }
    try { SND.play('levelup', { vol: 0.6 }); } catch (er) { }
    GAME.banner(`💞 ${n.def.name}の物語　その${r.ep}「${e.title}」おしまい`, got.join('・')); LIVE.emote(n, 'heart', 3); GAME.dirty = true; GAME.renderTracker(); GAME.save && GAME.save();
  });
};
// talking: a new episode starts, a finished promise is reported; otherwise the usual talk, with a reminder of the promise first
{ const _st = startTalk; startTalk = function (n) {
    const p = GAME.p, id = n.def.id;
    if (p && !n.visitor && BOND.EP[id] && !GAME.modal && !STORY.scene) {
      const e = BOND.avail(id); if (e) return BOND.begin(n, e);
      if (BOND.ready(id)) { GAME.ev('talk', 1, id); return BOND.finish(n); }
    }
    _st(n);
    const t = p && BOND.EP[id] && BOND.rec(id).task;
    if (t && DIALOG.npc === n && DIALOG.pages) { const need = BOND.need(t), have = BOND.prog(id);
      const msg = t.k === 'bring' ? `（約束：${BOND.ITEM[t.item]}を${t.n}つ　いま ${have}つ）` : t.k === 'place' || t.k === 'hide' ? `（約束：${BOND.text(id, t.text)}）` : `（約束：${t.text}　${Math.min(have, need)}/${need}）`;
      DIALOG.pages.unshift(GAME.fill(t.k === 'hide' ? 'わっ！ …い、今のオレは、オレのそっくりさんだ！ ほんもののオレは、まだかくれてるぞ！' : BOND.REMIND[id] || '約束、楽しみにしてるね！') + '\n' + msg); DIALOG.i = 0; UI.dialog(n.def.name, DIALOG.pages[0]); } }; }
BOND.REMIND = { v_mio: '約束、おぼえてる？ 楽しみにしてるね！', v_sora: '約束、忘れんなよ！', v_hana: '約束、楽しみにしているわね。', v_gen: '約束、忘れとらんじゃろうな？', v_rin: '約束、楽しみにしてるね！', v_kai: '約束、たのんだよ〜！', v_nagi: '約束、楽しみにしてるね！', v_takumi: '約束、よろしくたのむっす！', v_yuki: '約束、楽しみにしているわ。', v_kota: '約束だぞ！ 忘れんなよ！' };
// a free spot near (cx,cz): on land, off trunks, walls and the other people already placed
BOND.freeSpot = function (cx, cz, a0, r0, taken) { for (const dr of [0, 0.9, 1.8, 2.7]) for (let t = 0; t < 12; t++) { const a = a0 + (t % 2 ? 1 : -1) * Math.ceil(t / 2) * 0.35, r = r0 + dr, x = cx + Math.sin(a) * r, z = cz + Math.cos(a) * r;
    if (groundH(x, z) < 0.1 || Math.abs(groundH(x, z) - groundH(cx, cz)) > 1.2) continue; if (taken.some(q => Math.hypot(q[0] - x, q[1] - z) < 1.1)) continue; if (collidersNear(x, z).some(c => !c.off && hitsCollider(c, x, z, 0.45))) continue; return [x, z]; } return null; };
// meeting places: arriving in time plays the scene there (the villager comes to you)
BOND.placeStep = function () {
  if (!STORY.ready() || GAME.inside || PL.veh) return; const hf = currentHour();
  for (const id of Object.keys(BOND.EP)) { const r = BOND.rec(id), t = r.task; if (!t || (t.k !== 'place' && t.k !== 'hide')) continue; const P = BOND.pos(t.lm); if (!P) continue;
    const d = Math.hypot(PL.x - P.x, PL.z - P.z); if (d > (t.r || 24)) continue; const n = BOND.npc(id); if (!n) continue;
    const inT = t.h ? (t.h[0] <= t.h[1] ? hf >= t.h[0] && hf < t.h[1] : hf >= t.h[0] || hf < t.h[1]) : true;
    if (!inT) { const key = todayKey() + Math.floor(hf); if (r.warn !== key) { r.warn = key; UI.toast(`⏰ ${n.def.name}との約束は ${fmtH(t.h[0])}〜${fmtH(t.h[1])} です`); } continue; }
    // the villager steps in beside you
    const sp = BOND.freeSpot(PL.x, PL.z, PL.rot + 0.9, 1.7, [[PL.x, PL.z]]) || [PL.x - Math.sin(PL.rot) * 1.7, PL.z - Math.cos(PL.rot) * 1.7], x = sp[0], z = sp[1];
    n.x = x; n.z = z; n.y = standY(x, z); BOND.hold(n, 600000); n.mesh.position.set(n.x, n.y, n.z); PL.rot = Math.atan2(n.x - PL.x, n.z - PL.z);
    if (t.k === 'hide') LIVE.emote(n, 'bang', 2);
    return BOND.finish(n);
  }
};
const fmtH = h => `${Math.floor(h)}時${h % 1 ? Math.round(h % 1 * 60) + '分' : ''}`;
// ---------- update: who wants to talk (!), finished promises, places ----------
{ const _u = GAME.update; GAME.update = function (dt) { const r = _u.apply(this, arguments); try { if (GAME.p && !GAME.modal) {
      BOND.t += dt || 0.016; BOND.emoT += dt || 0.016; if (BOND.t < 0.4) return r; BOND.t = 0; BOND.placeStep();
      const notify = BOND.st()._n = BOND.st()._n || {};
      for (const id of Object.keys(BOND.EP)) { const e = BOND.avail(id), n = BOND.npc(id), rr = BOND.rec(id);
        if (e && notify[id] !== rr.ep) { notify[id] = rr.ep; GAME.dirty = true; setTimeout(() => UI.toast(`💞 ${VNAME(id)}が、{P}さんに話したいことがあるみたい`.replace('{P}', GAME.p.name)), 800); }
        if (BOND.ready(id) && notify[id + '_r'] !== rr.ep) { notify[id + '_r'] = rr.ep; GAME.dirty = true; UI.toast(`💞 ${VNAME(id)}との約束をはたした！ 話しに行こう`); GAME.renderTracker(); }
        if ((e || BOND.ready(id)) && n && BOND.emoT > 2.2 && !n.asleep && Math.hypot(PL.x - n.x, PL.z - n.z) < 16) LIVE.emote(n, 'bang', 1.6); }
      if (BOND.emoT > 2.2) BOND.emoT = 0;
    } } catch (e) { if (!BOND._e) { BOND._e = 1; console.warn('bond', e); } } return r; }; }
// ---------- tracker: the promises you made ----------
{ const _rt = GAME.renderTracker; GAME.renderTracker = function () { _rt.apply(this, arguments); const p = this.p, s = this.el && this.el.side; if (!p || !s) return;
    const rows = []; for (const id of Object.keys(BOND.EP)) { const t = BOND.rec(id).task; if (!t || !BOND.resident(id)) continue; const done = BOND.ready(id), need = BOND.need(t), have = BOND.prog(id);
      rows.push(`<div class="sg ${done ? 'ok' : ''}">💞 ${esc(VNAME(id))}：${esc(done ? 'はたした！ 話しに行こう' : BOND.text(id, t.text).replace(/、?[^、]*に話す.*$/, ''))}${!done && (t.k === 'stat' || t.k === 'bring' || t.k === 'talks') ? ` <i>${Math.min(have, need)}/${need}</i>` : ''}</div>`); }
    const html = rows.length ? `<div class="story bondbox">${rows.join('')}</div>` : ''; let el = s.querySelector('.bondwrap'); if (!el) { el = document.createElement('div'); el.className = 'bondwrap'; const sb = s.querySelector('.storybox'); if (sb) sb.after(el); else s.prepend(el); }
    if (el._h !== html) { el.innerHTML = html; el._h = html; } el.onclick = e => { e.stopPropagation(); this.openJournal('story'); }; }; }
// ---------- journal: 物語 tab gets 住民の物語 ----------
{ const _oj = GAME.openJournal; GAME.openJournal = function (tab) { _oj.apply(this, arguments); if (tab !== 'story' || !this.p) return; const mb = this.el.modal.querySelector('.mb'); if (!mb) return;
    const ppl = VILLAGER_DEF.filter(v => BOND.EP[v.id]);
    const html = `<h3 class="bh" style="margin-top:14px">💞 住民の物語　${ppl.reduce((s, v) => s + BOND.rec(v.id).ep, 0)} / ${ppl.length * 3}</h3><p class="small" style="margin:0 0 6px">なかよし度が上がると、住民が自分のことを話してくれます（頭に「！」）。</p><ul class="list bondlist">${ppl.map(v => { const r = BOND.rec(v.id), E = BOND.EP[v.id], f = this.p.friend[v.id] || 0, t = r.task;
      return `<li><span class="ck">${r.ep >= E.length ? '💞' : '・'}</span><div><b>${esc(v.name)}</b>　<span class="small">${r.ep} / ${E.length}</span><div class="sub">${E.map((e, i) => i < r.ep ? `✓ ${esc(e.title)} <button class="mini" data-bre="${v.id}:${i}">もう一度見る</button>` : i === r.ep ? (t ? `▶ ${esc(e.title)}：約束「${esc(BOND.text(v.id, t.text))}」` : f >= e.f ? `！ ${esc(e.title)}：${esc(v.name)}に話しかけよう` : `🔒 なかよし度 ${e.f} で（いま ${Math.min(f, e.f)}）`) : '🔒 ？？？').join('<br>')}</div></div></li>`; }).join('')}</ul>`;
    mb.insertAdjacentHTML('beforeend', html); const ul = mb.querySelector('.bondlist');
    if (ul) ul.addEventListener('click', ev => { const b = ev.target.closest('[data-bre]'); if (!b) return; ev.stopPropagation(); const [id, i] = b.dataset.bre.split(':'), e = BOND.EP[id][+i]; this.closeModal(); STORY.play(BOND.lines(id, e.intro.concat(e.outro))); }); }; }
// the folded notebook shows the promises too (one line)
if (typeof HUD2 !== 'undefined') { const _sd = HUD2.side; HUD2.side = function () { const r = _sd.apply(this, arguments); try { const s = GAME.el && GAME.el.side, sm = s && s.querySelector('.sum'); if (!sm || sm.hidden || !GAME.p) return r;
    const ids = Object.keys(BOND.EP).filter(id => BOND.rec(id).task && BOND.resident(id)), ok = ids.filter(BOND.ready).length, av = Object.keys(BOND.EP).filter(id => BOND.avail(id)).length;
    const parts = []; if (ids.length) parts.push(`💞 約束 ${ids.length}${ok ? `（はたした ${ok}）` : ''}`); if (av) parts.push(`💬 話したそうな人 ${av}`); const html = parts.map(esc).join('<br>');
    let b = sm.querySelector('.bsum'); if (!html) { if (b) b.remove(); return r; } if (!b) { b = document.createElement('div'); b.className = 'bsum'; sm.appendChild(b); } if (b._h !== html) { b.innerHTML = html; b._h = html; } } catch (e) { } return r; }; }
