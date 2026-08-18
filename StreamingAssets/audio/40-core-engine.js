/* ============================================================================
 * Biquad — RBJ cookbook, transposed direct form II. No allocation in p().
 * ==========================================================================*/
class Biquad{
  constructor(){ this.b0=1;this.b1=0;this.b2=0;this.a1=0;this.a2=0;this.z1=0;this.z2=0; }
  _set(b0,b1,b2,a0,a1,a2){
    const ia=1/a0;
    this.b0=b0*ia; this.b1=b1*ia; this.b2=b2*ia; this.a1=a1*ia; this.a2=a2*ia;
  }
  peak(fs,f,Q,dB){
    const A=Math.pow(10,dB/40), w=2*Math.PI*f/fs, cw=Math.cos(w), al=Math.sin(w)/(2*Q);
    this._set(1+al*A, -2*cw, 1-al*A, 1+al/A, -2*cw, 1-al/A);
  }
  bp(fs,f,Q){
    const w=2*Math.PI*f/fs, cw=Math.cos(w), al=Math.sin(w)/(2*Q);
    this._set(al, 0, -al, 1+al, -2*cw, 1-al);
  }
  hp(fs,f,Q){
    const w=2*Math.PI*f/fs, cw=Math.cos(w), al=Math.sin(w)/(2*Q);
    this._set((1+cw)/2, -(1+cw), (1+cw)/2, 1+al, -2*cw, 1-al);
  }
  hs(fs,f,S,dB){
    const A=Math.pow(10,dB/40), w=2*Math.PI*f/fs, cw=Math.cos(w), sw=Math.sin(w);
    const al=sw/2*Math.sqrt((A+1/A)*(1/S-1)+2), r=2*Math.sqrt(A)*al;
    this._set(A*((A+1)+(A-1)*cw+r), -2*A*((A-1)+(A+1)*cw),
              A*((A+1)+(A-1)*cw-r), (A+1)-(A-1)*cw+r,
              2*((A-1)-(A+1)*cw), (A+1)-(A-1)*cw-r);
  }
  p(x){
    const y=this.b0*x+this.z1;
    this.z1=this.b1*x-this.a1*y+this.z2;
    this.z2=this.b2*x-this.a2*y;
    return y;
  }
}

/* ============================================================================
 * 車種プリセット
 * 気筒数だけでは音は決まらない。決めるのは「点火クランク角の配列」で、
 * 同じ2気筒でも 360度クランク {0,360} と 180度クランク {0,180} では
 * スペクトルの構造が根本的に違う（前者は整数次のみ、後者はクランク1次が厳密にゼロ）。
 * なので気筒数ではなく firingDeg[] を一次パラメータとして持つ。
 * 実車名はコードに出さない（商標回避）。表示名はコール大会の実在の部門名を使う。
 * ==========================================================================*/
const PRESETS = {
  AC4_400: {
    id:'AC4_400', label:'4発', sub:'空冷4スト 並列4気筒 399cc ／ 4-1集合管',
    sceneLabel:'4発・集合管',
    mufLabels:['純正','集合管','直管'],
    dialMax:12000,                          // 文字盤のフルスケール。車種ごとに明示する
    cylinders:4, strokeRevs:2,
    firingDeg:[0,180,360,540],              // 180度クランク・等間隔。firing order 1-3-4-2
    idleRpm:1200, maxRpm:11000, cutOn:11300, cutOff:11000, stallRpm:500, redRpm:11000,
    J:0.020, fricC:2.2, fricK:0.0012, pumpK:0.0009, bleed:0.105,
    clutchC:55, clutchP:1.5, thrTau:0.008,
    torque:[0,14,20,24,27,29,31,32,33,33.3,32,30.6,26,18],   // 1000rpm刻み
    primLenM:[0.600,0.540,0.540,0.600],     // 不等長。外側気筒は集合部まで遠回り
    collectorLenM:0.180, tailLenM:0.480,
    mufflerLenM:[0.042,0.055,0.068,0.082],
    /* 排気バルブの時変反射。閉弁中は剛壁で管が自由に鳴り、開弁すると燃焼室側へ
       開放されて減衰する。固定係数だとこの「呼吸」が消えて作り物になる。 */
    /* 放射インピーダンス。出口半径 a に対し f=c/(2πa) を境に
       低域は管へ反射し、高域は外へ抜ける。出口が太いほど低く＝明るい */
    /* 車体レイヤ。往復慣性の不釣合いでエンジンごと揺れ、フレーム・タンク・
       フェンダーが共振する。空冷旧車が「振動でうるさい」の実体。
       この世代はバランサー非装備（普及は80年代後半以降）。 */
    bodyRes:[235,380], bodyLevel:0.175,
    radHzByMuffler:[4800,3650,2610],
    alphaClosed:0.90, alphaOpen:0.30, chokeFrac:0.069, valveOpenFrac:0.34,
    cylBiasDeg:0.85, cylAmpDb:1.10,
    revBands:[4500,6000,7800],
    /* 排気の帰還・反射 */
    collectorIn:0.55, g1:0.68, gColl:0.22, gMuf:0.16, mufSign:-1,
    g2ByMuffler:[0.48,0.48,0.48],
    mufElemsByMuffler:[4,2,0],
    gammaOutByMuffler:[0.55,0.68,0.80],
    outTrimByMuffler:[0.50,1.00,1.41],
    brightMaxByMuffler:[3500,9000,16000],
    raspDbByMuffler:[0,2.5,4.0],
    afTargetByMuffler:[0.10,0.30,0.55],
    afVolByMuffler:[0.24,0.55,0.85],
    /* パルス包絡・音色 */
    wDegBase:62, wDegThrSpan:12, pwMinSec:0.0009, pwMaxSec:0.0080,
    envA:0.18, envT1:0.060, envT2:0.300, envM:0.35,
    portBpHz:480, portBpQ:1.4, formantHz:430, raspHz:2600,
    bodyHzByMuffler:[152,196,0], bodyQByMuffler:[3.0,2.6,1], bodyDbByMuffler:[10,8,0],
    intakeGainA:0.02, intakeGainB:0.30, mechGain:0.030,
    psbBpHz:130, psbGain:1.8,
    suikomi:null                            // 4発では吸い込みはほぼ出ない
  },

  /* ------------------------------------------------------------------
   * AT2_400 ＝ 360度クランク並列2気筒。点火間隔は等間隔（360-360）。
   * 半整数次は厳密にゼロで、基音は1次 = RPM/60 ＝ 4発のちょうど1オクターブ下。
   * 「バー（開ける）／ブー（戻す）」の2音色が語源で、戻し側＝吸い込みが主役。
   * ------------------------------------------------------------------ */
  AT2_400: {
    id:'AT2_400', label:'2発', sub:'空冷4スト 並列2気筒 395cc・360度クランク ／ 2into1チャンバー',
    sceneLabel:'2発・バブ',
    mufLabels:['純正','2into1','直管'],
    dialMax:11000,
    cylinders:2, strokeRevs:2,
    firingDeg:[0,360],                      // → cylOffsets [0, 0.5]
    idleRpm:1100, maxRpm:10000, cutOn:10300, cutOff:10000, stallRpm:420, redRpm:10000,
    J:0.024,                                // 4発 0.020 → +20%。360度の大径カウンターウェイト＋2軸バランサー
    fricC:1.75, fricK:0.00095,              // 摺動摩擦比 0.772（リング周長×平均ピストン速度×気筒数）
    pumpK:0.0010, bleed:0.090,              // bleed は torque と摩擦を変えたので閉形式で再解
    clutchC:62, clutchP:1.5, thrTau:0.011,
    torque:[0,13.0,19.5,23.5,26.5,28.5,30.0,31.0,31.4,31.2,28.0,21.0],  // 3.20kgf·m@8000, 40.0PS@9400
    primLenM:[0.500,0.524],                 // 4.8%不等長。1/4波長 287 / 274 Hz
    collectorLenM:0.240, tailLenM:0.620,    // チャンバーは容積なので長い。テールは 463 Hz
    mufflerLenM:[0.062,0.079,0.098,0.120],
    /* 排気バルブの時変反射。閉弁中は剛壁で管が自由に鳴り、開弁すると燃焼室側へ
       開放されて減衰する。固定係数だとこの「呼吸」が消えて作り物になる。 */
    /* Residual frame and tank modes after the preset's balancer response. */
    bodyRes:[215,345], bodyLevel:0.085,
    radHzByMuffler:[7300,9140,2610],
    alphaClosed:0.91, alphaOpen:0.32, chokeFrac:0.069, valveOpenFrac:0.35,
    cylBiasDeg:1.20, cylAmpDb:1.50,
    revBands:[4200,5600,6900],
    collectorIn:0.72, g1:0.76, gColl:0.30, gMuf:0.30,
    mufSign:1,                              // ★4発は -1。メガホン/キャブトンは先端絞り R=+0.836 で正反射
    g2ByMuffler:[0.58,0.54,0.44],
    mufElemsByMuffler:[4,2,0],
    gammaOutByMuffler:[0.55,0.68,0.80],
    outTrimByMuffler:[0.44,0.80,1.15],   /* 2発は mufSign=+1 の正帰還と body EQ +8dB でリングが強く、
                                            同じ outTrim だと4発より 4dB 熱くなる */
    brightMaxByMuffler:[3000,7000,13000],
    raspDbByMuffler:[0,1.75,2.8],
    afTargetByMuffler:[0.10,0.34,0.26],
    afVolByMuffler:[0.24,0.55,0.60],
    wDegBase:78, wDegThrSpan:16, pwMinSec:0.0009, pwMaxSec:0.0200,   // ★上限を必ず上げる
    envA:0.18, envT1:0.085, envT2:0.420, envM:0.44,
    portBpHz:360, portBpQ:1.2, formantHz:330, raspHz:2100,
    /* ★新規素子：サイレンサ缶のヘルムホルツ共鳴。2発の「重低音」の実体。
       既存の 1/4波長素子（0.062〜0.120m）では 1.2〜2.3kHz しか作れずこの帯域が無い */
    bodyHzByMuffler:[132,150,128], bodyQByMuffler:[6.5,5.5,2.5], bodyDbByMuffler:[9,8,3],
    intakeGainA:0.025, intakeGainB:0.40, mechGain:0.022,
    psbBpHz:100, psbGain:2.6,               // ★基音が1オクターブ下なので疑似低音の帯域も下げる
    /* 吸い込み。サイレンサ撤去で排気系の広帯域減衰が消えて Q が上がり、
       長い空白の間に管とヘルムホルツの共鳴が可聴に鳴り残る。
       同時に全閉で高速噴流が消えて広帯域高域が失われるので「こもる」 */
    suikomi:{
      closeRate:7.0, closeFull:15.0,
      onThr:0.08, offThr:0.20, onRpm:4200, offRpmMargin:250, rpmSpan:3000, maxSec:0.9,
      gain:0.85, gainByMuffler:[0.00,0.45,1.00],   // 純正では鳴らない
      atkMs:6, relMs:190, nMs:45,
      burstDecMs:40, noiseBpHz:150, noiseQ:2.2, inject:0.62,
      brightHz:340, bodyBoostDb:11
    }
  },

  /* ------------------------------------------------------------------
   * AT2_180 ＝ 180度クランク並列2気筒。点火間隔が 180度→540度 の不等間隔。
   * 同形式の量産例で 180度クランクであることを確認済み。
   * バブ（360度）とはスペクトルの構造が根本的に違う：
   *   クランク1次と3次が **厳密にゼロ**、0.5次と1.5次が立つ。
   *   生存次数の最大公約数は 0.5 なので **基音は RPM/120** ＝ バブのさらに1オクターブ下。
   * 「吸い込み」の代表車。排気バルブ開期間(230〜260度)が点火間隔180度を超えるため
   * 集合部でパルスが必ず重なる。線形和は近似でしかない点に注意。
   * ------------------------------------------------------------------ */
  AT2_180: {
    id:'AT2_180', label:'吸い込み', sub:'空冷4スト 並列2気筒 398cc・180度クランク ／ 集合管',
    sceneLabel:'吸い込み・180度',
    mufLabels:['消音管','集合管','直管'],
    dialMax:11000,
    cylinders:2, strokeRevs:2,
    firingDeg:[0,180],                      // → cylOffsets [0, 0.25]。180度→540度の不等間隔
    idleRpm:1150, maxRpm:8500, cutOn:9300, cutOff:9000, stallRpm:430, redRpm:9000,
    J:0.021,                                // 180度は左右のピストンが逆位相で
                                            // 一次慣性力が相殺されるぶんウェイトが小さい（360度の0.024より軽い）
    fricC:1.70, fricK:0.00092, pumpK:0.0010, bleed:0.095,
    clutchC:60, clutchP:1.5, thrTau:0.010,
    torque:[0,13.5,20.0,24.5,27.5,29.5,30.8,31.4,30.5,28.0,23.0,16.0],  // 3.20kgf·m@7000, 36PS@8500
    primLenM:[0.520,0.560],                 // 不等間隔なので集合部で干渉する。不等長で濁りを作る
    collectorLenM:0.200, tailLenM:0.640,
    mufflerLenM:[0.058,0.074,0.092,0.112],
    /* 排気バルブの時変反射。閉弁中は剛壁で管が自由に鳴り、開弁すると燃焼室側へ
       開放されて減衰する。固定係数だとこの「呼吸」が消えて作り物になる。 */
    /* GS400 has a crank-driven vibration-cancelling balancer. The remaining
       frame/tank response is therefore kept below the unbalanced twin model. */
    bodyRes:[205,330], bodyLevel:0.110,
    radHzByMuffler:[6000,3650,2610],
    alphaClosed:0.91, alphaOpen:0.32, chokeFrac:0.069, valveOpenFrac:0.35,
    cylBiasDeg:1.30, cylAmpDb:1.60,
    master:1.6,                              // Leave headroom for the coast-pressure wave instead of flattening it
    combustionVarDb:4.5, combustionVarDbLow:0.8,
    combustionVarRpmLo:1800, combustionVarRpmHi:4500,
    revBands:[4500,5800,7000], defaultGear:1,
    /* 拍をどちら側で数えるか。吐き（4発/2発）は「開けた瞬間」＝回転の谷→上昇。
       吸い込みは「戻した瞬間」なので閉じエッジで数える。
       他2車種は beatOn 未定義＝現行の谷→上昇のまま（＝回帰ゼロ）。 */
    beatOn:'close',
    collectorIn:0.72, g1:0.74, gColl:0.28, gMuf:0.18,
    mufSign:-1,                             // 集合管はストレート貫通＝負反射（バブのメガホン絞りとは逆）
    g2ByMuffler:[0.52,0.50,0.42],
    mufElemsByMuffler:[4,2,0],
    gammaOutByMuffler:[0.55,0.70,0.82],
    outTrimByMuffler:[0.46,0.86,1.20],
    brightMaxByMuffler:[3200,7500,14000],
    raspDbByMuffler:[0,2.0,3.2],
    afTargetByMuffler:[0.10,0.28,0.22],
    afVolByMuffler:[0.24,0.50,0.58],
    wDegBase:82, wDegThrSpan:16, pwMinSec:0.0009, pwMaxSec:0.0240,
    envA:0.18, envT1:0.090, envT2:0.440, envM:0.46,
    portBpHz:340, portBpQ:1.2, formantHz:300, raspHz:1900,
    bodyHzByMuffler:[120,138,118], bodyQByMuffler:[6.0,5.0,2.2], bodyDbByMuffler:[8,7,3],
    intakeGainA:0.030, intakeGainB:0.46,
    mechGain:0.145, mechDuck:1.0, mechRpmK:0.7, mechAm:0.09, mechAmDeg:240, bodyRatHz:2200,
    psbBpHz:85, psbGain:2.9,                // 基音がさらに低いので疑似低音の帯域も下げる
    /* This preset represents a GS prepared and tuned for suction calls, not a
       claim that a stock GS produces the same effect. Exhaust choice is only
       one part of the setup; carburetion, engine condition, and rider closure
       technique remain coupled. Keep that split explicit in future fitting. */
    suikomi:{
      /* mode:'edge' がGS専用の閉じエッジ検出の目印。これを持たない AT2_400 は旧コードのまま動くので
         回帰リスクがゼロになり、必要なら車種を切り替えて A/B もできる。 */
      mode:'edge',

      /* ---- 拍の検出：すべて「開度ドメイン」。閉じ速度も回転落下率も使わない ----
         thrRaw は setThrottle の即時代入＋k-rate なのでステップ入力になり、
         閉じ速度は常に 1/0.002667 = 375 /s に飽和して測定不能（実測確認済み）。
         代わりに検出専用の速い平滑 thrE を作り、開度の2しきい値で状態を切り替える。 */
      thrEmsMs:6,                      // 検出専用平滑。thrS(10ms)はキャブスライドの機械遅れであって手ではない
      spanRelaxSec:0.30,               // 振り幅の追従。速い連打で浅くなっても打が抜けないように
      spanFloor:0.25, spanMin:0.30,    // これ未満の振り幅では発火しない（誤爆防止）
      armFrac:0.62, fireFrac:0.26,     // ステップ入力で tFall≈5.2ms
      reopenMin:0.12,                  // Prevent the adaptive floor from faking a reopen during a long coast
      depthFull:0.60, hitFloor:0.25,
      fallFullMs:45, fallMinMs:7,      // armT→fireT 所要 → 強さ。30ms戻し 0.89 / 100ms 0.50
      fallMaxMs:120,                   // これより遅い戻しは拍にしない＝「ゆっくり戻すと鳴らない」
      minGapMs:45,                     // リフラクトリ。10打/秒(打間100ms)まで通る
      onRpm:1800,                      // ★4000→1800。コールの谷が4000を割ると打が抜ける
      offRpmMargin:150, rpmSpan:3500,
      tailOnMs:190,                    // 閉じっぱなしがこれを超えたらフレーズ終端（コールを切る）

      /* ---- 包絡：「ン」→「バ」→「ー」 ----
         実車は閉じてから吸気帯(1.8〜5kHz)が 11dB 沈み、その底から「バ」が立つ。
         穴が無いと「バ」は破裂ではなく平地からの微増になり、当事者が仮名で
         書き取る「ンバ」にならない（有声破裂音には直前の閉鎖が要る）。
         旧実装は hissBase:0.45 でゲート直後から45%出しており、排気層が作っていた
         -12dB の穴を BAR 層が自分で埋めていた。 */
      /* ★48→70。旧値 48 でも nbar の検出では 83ms に出ていたが、それは
         「ン」が完全な無音だったから。床（nLevel）を入れると検出が早まって
         64ms まで縮む＝聴感上「ン」が短くなる。実測 85ms に戻すため 70 にする
         （床入りで再測 86.8ms）。オーナーが「タイミングは合格」と言った
         位置を動かさないための補正。 */
      nGapMs:0,
      /* ★22→6。実車の「バ」は検出点から 0-20ms で 4kHz が +3.8dB、20-45ms の
         ピーク +5.2dB のわずか 1.4dB 下＝ほぼ最初から鳴っている。旧値の 22ms は
         さらにオーディオレートのデジッパー（同じ atkMs）と二重に掛かって
         実効 40ms 以上になり、破裂ではなく「ふくらみ」になっていた。 */
      atkMs:18,
      /* ★80→150。実車の「ー」は 0-110ms がほぼ平坦（4kHz +5.2→+3.4dB）で、
         そこから落ちる。80ms では窓の中で 3dB 余計に痩せる。 */
      barTauMs:260,
      /* ★130→240。実測の 1/e 減衰 230ms／半値幅 360ms。tailMode は「フレーズを
         切った」ときだけなので、ここが barTauMs より短いと尾が逆に縮んでいた。 */
      barTailTauMs:190,
      barSus:0.02,                     // 尾の床。0 にすると次の打まで完全な無音になって痩せる
      relMs:12,                        // 開け直したときの切れ。周期より長い時定数はドローン化する

      /* ---- 「バ」の破裂 ----
         ★閉じた瞬間ではなく「ン」が明けた瞬間に撃つ。閉じた瞬間に撃つと穴が埋まる。
         ★90Hz→190Hz。実車は 32〜100Hz が 3.0〜3.6dB **減る**帯域で、増えるのは
           200〜250Hz だけ（+0.9/+1.4dB）。psbBpHz:85 の疑似低音は 190Hz でも通る。
         ★5.0→0.30。旧値は単独でリミッタ前ピークを 7.2dB 押し上げていた（＝音割れ本体）。
           穴を作った後は「バ」の破裂がコントラストで出るので、殴打は要らない。 */
      slamHz:190, slamDecMs:18, slamGain:0.30,
      lastBangDb:3.0,                          // 閉じ直後の点火1発だけ濃い（加速ポンプ残り）

      /* ---- 母音 ----
         /u/ は F1≈320Hz、/a/ は F1≈760Hz。F1 の位置は実測 746Hz と一致していたので動かさない。
         ★F2 は 1250→2000Hz。実車の差スペクトルの山1は 2023Hz（10名中央値）で、
           1.25〜3.15kHz の「なだらかな棚」（+1.6〜+2.2dB）。鋭いピークではない
           （中心のばらつき CV 23%）ので Q も 4.0→1.1 に落として棚にする。
         ★f1 も Q 3.2→2.0 / +9→+7dB。旧値では 630〜1000Hz が +8〜+12dB 持ち上がって
           いたが、そこは実車で唯一「有意な変化なし」と出た帯域（符号一致 6/10）。
           F1 と F2 を両方広げないと 1250Hz が二つの山の谷間になって凹む。 */
      f1Open:320, f1Close:760, f1Q:2.0, f1Db:7, f1SlewMs:18,
      f2Hz:2000, f2Q:1.1, f2Db:5,

      /* ---- 吸気管。★共鳴ではなく「谷」と「山」でできている ----
         実車で個体差を超えて再現するのは 371Hz の谷（13例中12例）と
         4.79kHz の山（10走者すべてで 4350〜5100Hz）の2つだけ。どちらも回転数に
         付いていかない（山rpm が 6309〜8347 と32%違うのに 4〜5%しか動かない）＝
         エンジン次数ではなく固定の管の性質。

         371Hz が谷である理由：L_eff 0.194〜0.265m・c_int≈350m/s の1/4波長は
         330〜450Hz で、そこではベルマウスの口が**圧力の節**になる。管の中では
         最大に鳴っているが、外へは放射されない。旧実装はここに helm と tract の
         ブーストを2本置いていた＝符号が逆だった。

         4.8kHz が山である理由：ベンチュリ〜絞り部の短い空洞（1/4波長で18mm、
         1/2波長で36mm）。キャブのボア径そのもので、車体を問わず同じ寸法なので
         回転数にも個体にも依らない。「誰が乗ってもGS」の音響的な実体。 */
      helmHz:232,  helmQ:1.5, helmMix:0.28,   // 200〜250Hz の +0.9/+1.4dB。ベルマウス外の空洞
      tractHz:371, tractQ:1.9, tractDb:-7,    // ★直列のノッチ。-3dB幅 150〜250Hz → Q=371/200
      tract3Hz:4800, tract3Q:5.0, tract3Mix:0.55,  // ★1170→4800。実車で最大の山（+3.4dB, Q≈3〜5）
      dryMix:0.62,

      /* ---- 素材・放射 ----
         ★ローパスを2極にする。実車の「バー」は 2kHz 基準で 12.5kHz が -19.2dB
           （-20dB を割るのが 12.3kHz）。旧実装は生の白色を 0.5 の重みで足していて
           ローパスを素通りしており、22kHz まで真っ白だった。
           hissLpMix は1極ぶんを少しだけ戻す量。2極だけだと 6〜10kHz が
           実車より 3〜5dB 下がりすぎる（実車は室内反射でそこが埋まっている）。 */
      hissLpHz:4200, hissLpMix:0.10, hissHpHz:300,
      /* ★点火同期AM は「デューティ 1/10 のパルス列」。旧実装は指数減衰(τ10ms)＋
         min(1.4,・) のハードクリップで、6900rpm ではイベント間隔 4.4/13.2ms より
         時定数が長く全部つながり、しかも頭がフラットトップに潰れていた。
         実車の変調次数スペクトルは h=1 から h≈10 までほぼ平坦に伸びてから落ちる＝
         幅が周期の 1/10（6900rpm で 1.7ms）のパルス。ベースラインからピークで +6dB。 */
      amDuty:0.10, amDepth:1.15,
      amRpmFadeLo:2800, amRpmFadeHi:3800,

      /* ---- ★フラッター。「バー」を「バー」たらしめている芯 ----
         全閉でスロットル隙間を抜ける高速流が、管（往復 3.6ms）の1次縦モードを
         自励させ、その 276Hz で 1〜8kHz の広帯域ノイズを刻む。実測：
           変調指数（ノイズ帰無を引いた超過）ブー 0.095 → バー 0.209（2.2倍）
         ブー→バーで2倍以上に増える成分はこれだけで、クランク次数の変調は
         ほとんど増えない（0.5次 0.104→0.132）。
         ★回転数に乗らない：回転が29%違う個体（8151rpm と 6324rpm）で
           周波数差は 0.3%（254.9Hz と 254.2Hz）。だから rpm を一切見ない。
         ★純 LFO ではなく「ノイズを Q≈8 の共振器へ通したもの」。Q が有限＝
           包絡自体が 12〜35Hz でゆらぐ。実測の Q は 3〜11（中央 8）で、
           位相ロックもしていない（打の頭で718拍を平均すると 0.0092 しか残らない）。
           ＝叩いた余韻ではなく、すでに自走している流体振動。 */
      flHz:276, flQ:8.0, flDepth:1.60,
      flAtkMs:6, flTauMs:70, flFloor:0.30, flNGap:0.22, flCeil:2.2,

      /* ---- ★「バー」の中の明るさの動き ----
         実測：4kHz は 20-45ms の +5.2dB が最も明るく、そこから 200ms かけて
         +0.7dB まで単調に暗くなる（重心 297→263Hz）。単一の減衰包絡では
         作れないので、放射シェルフだけを別の時定数で降ろす。 */
      tiltHi:1.45, tiltLo:0.85, tiltTauMs:70,

      /* ---- ★「ン」は無音ではない ----
         実測（ブー基準）：63Hz -0.5 / 250Hz -1.7 / 500Hz -0.9 / 2-8k -6.2 dB。
         高域が 6〜10dB 落ちて低域がそのまま残る「こもり」であって、穴ではない。
         しかも「ン」のレベルは直前の「ー」の尾（+2.9dB）より低いので、
         前の拍の残響ではなく本物のディップ。＝鼻音そのもの。 */
      nLevel:0.45, nLpHz:900, nAtkMs:7,
      radCornerHz:2600, radDbByIntake:[-1,1,4],   // ★[0,4,8] は濃い側で高域が +8dB 過剰になる

      /* ---- 排気側 ----
         ★ダックを「ン」の区間だけに限定し、深く・ゆっくりにする。
           実車の排気は閉じてから 75ms かけて 4.8dB 沈み、「バ」の頂点では
           開けているときの高さまで戻ってくる（+1.2dB）。旧実装は 12ms で -5dB へ
           落としてそのまま全閉中ずっと下げっぱなしだったので、
           「沈んでから戻る」という形そのものが無かった。 */
      /* ★-8.0→-4.8。実測：実車の排気は閉じてから 75ms かけて **4.8dB** 沈み、
         「バ」の頂点で開けているときの高さまで戻る。-8dB は沈ませすぎで、
         「ン」の 63Hz が -0.5dB（実車）のところ -17dB まで落ちていた。 */
      loadFloor:0.75, exDuckDb:-4.8, exDuckAtkMs:22, exDuckRelMs:45,

      /* ---- レベル ---- */
      gain:1.0,
      /* ★かつて slamGain:5.0 / outGain:1.00 まで上げたのは「拍が閉じ側に立たない」
           対策だった。だが拍が立たなかったのは音量が足りないからではなく、
           hissBase:0.45 で「ン」の穴が無く、破裂の元になるコントラストが
           作れていなかったから。穴を作れば同じ拍が 1/5 の音量で立つ。
         ★実車の「バの山での 吸気広帯域 − 排気低域」は -3.8〜-6.5dB。
           集合管・既定はここが +1.6dB で、5〜6dB 吸気が多すぎた。 */
      /* ★1.00→0.62。実車の「バー」窓の 2-8kHz はブー比 +3.8dB（頭）／+2.9dB（尾）。
         1.00 では +6.8/+4.8dB で 3dB 出過ぎており、1/3oct の 2〜6kHz が
         +7〜+8dB 過剰（実車 +2.2）の直接の原因になっていた。 */
      outGain:0.62,
      /* Closed-throttle weak and misfiring cycles leave the cylinder below
         exhaust pressure. Valve opening produces a broad negative equalization
         lobe plus a short bipolar wavefront, not a continuous wind layer. */
      vacuumPortGain:4.5, vacuumDeg:130,
      vacuumEdgeGain:16.0, vacuumEdgeDeg:10, vacuumVarMix:0.68,
      cvRiseMs:45, cvFallMs:110,
      vacuumAtkMs:16, vacuumRelMs:10, vacuumFloor:0.95,
      /* Ten independent recording chains show little change below 125 Hz,
         +2.2 dB at 250 Hz, -1.3 dB at 500 Hz, and a rising high-order edge.
         The three transfer sections therefore have independent time shapes. */
      coastBodyHz:250, coastBodyQ:1.8, coastBodyDb:11.0,
      coastBodyPeakMs:85, coastBodyFloor:0.08, coastBodyAtkMs:45, coastBodyDelayMs:5,
      coastNotchHz:500, coastNotchQ:1.0, coastNotchDb:-4.0, coastNotchAtkMs:28,
      coastPresenceHz:6500, coastPresenceQ:0.9, coastPresenceDb:15.0,
      coastPresencePeakMs:55, coastPresenceFloor:0.60, coastPresenceAtkMs:35,
      coastPresenceDelayMs:20,
      coastPresenceShelf:1,
      coastRaspHz:3200, coastRaspQ:0.7, coastRaspDb:-4.0,
      coastRaspAtkMs:65, coastRaspDelayMs:90,
      coastTemporalV2:1,
      /* V3 keeps the accepted V2 average spectrum, then restores the two
         causes that an averaged web recording removes: preparation before the
         closing edge and cycle-to-cycle mixture variation after it. */
      coastTemporalV3:1,
      chargeRiseMs:90, chargeFallMs:170, chargeFloor:0.72,
      coastCycleMemory:0.42, coastCycleColorDb:1.6,
      coastGestureBrightDb:0.6,
      coastColorBlend:1.5, coastMaxBlend:0.90, coastBrightHz:6500,
      gainByMuffler:[0.26,0.355,0.43],
      /* ★調整ツマミの効きを圧縮する。旧実装は共有の skMix[0.40,1.00,1.55] ×
         skIdle[1.45,1.00,0.55] × skOut[0.80,1.00,1.25] × gainByIntake[1.00,1.10,1.25]
         が全部同符号で掛かり、最大 3.5倍＝10.9dB 振れた。実車の録音間のばらつきは
         BRD-EXH で -3.8〜-6.5dB ＝ 2.7dB しかない。濃い側でリミッタに突っ込むのは
         この積み上げが主因。KE 専用の配列にして 6.1dB に詰める
         （skMix / skIdle 自体は AT2_400 の旧経路が使うので触らない）。 */
      gainByMix:[0.70,1.00,1.25], gainByIdle:[1.15,1.00,0.85], gainByOutlet:[0.90,1.00,1.12],
      gainByIntake:[1.00,1.10,1.25]
    },
    /* Keep the accepted V1-V5 sounds and the public research V6 inside one GS
       vehicle.  The base values above are V3; every profile overrides only the
       coast model that changed in its pass.  Chassis, controls, and telemetry
       therefore stay identical for a fair listening comparison. */
    gsSoundDefault:'v3',
    gsSoundProfiles:{
      v1:{
        vacuumPortGain:12.0, vacuumDeg:180,
        vacuumEdgeGain:30.0, vacuumEdgeDeg:24,
        coastBodyHz:250, coastBodyQ:1.8, coastBodyDb:5.0,
        coastNotchHz:500, coastNotchQ:1.0, coastNotchDb:-9.0,
        coastPresenceHz:4800, coastPresenceQ:1.2, coastPresenceDb:6.0,
        coastPresenceShelf:0, coastRaspDb:0,
        coastColorTauMs:110, coastColorFloor:0.58,
        coastTemporalV2:0, coastTemporalV3:0
      },
      v2:{coastTemporalV3:0},
      v3:{},
      /* The 0.574 m path gives a negative-reflection pressure maximum near
         250 Hz and a cancellation near 500 Hz at the hot-pipe sound speed.
         This replaces part of V3's static EQ with a causal pipe-length effect. */
      v4:{
        coastPipeV4:1, coastPipeLenM:0.574, coastPipeSign:-1,
        coastPipeFeedbackByMuffler:[0.10,0.18,0.18],
        coastPipeDelayMs:0, coastPipeAtkMs:30, coastPipeRelMs:30,
        coastPipeFloor:0.60,
        coastBodyDb:7.0, coastNotchDb:0
      },
      /* V5 keeps the V4 tuned path, then lets the outlet impedance relax as
         the high-momentum exhaust slug clears after throttle closure.  The
         open-end reflection is frequency dependent, so the low-flow state
         restores a small radiated edge without retuning the accepted body. */
      v5:{
        coastPipeV4:1, coastPipeLenM:0.574, coastPipeSign:-1,
        coastPipeFeedbackByMuffler:[0.10,0.18,0.18],
        coastPipeDelayMs:0, coastPipeAtkMs:30, coastPipeRelMs:30,
        coastPipeFloor:0.60,
        coastBodyDb:7.0, coastNotchDb:0,
        coastOutletRelaxV5:1, coastOutletRelaxTauMs:100,
        coastOutletRelaxBrightDb:1.6
      },
      /* V6 keeps the complete V5 pressure path.  A carbureted engine does not
         replace the trapped charge independently on every 720-degree cycle:
         manifold filling and fuel transport retain a short cylinder-specific
         memory.  Blend that causal memory into the existing valve-opening
         rarefaction instead of adding another oscillator or noise layer. */
      v6:{
        coastPipeV4:1, coastPipeLenM:0.574, coastPipeSign:-1,
        coastPipeFeedbackByMuffler:[0.10,0.18,0.18],
        coastPipeDelayMs:0, coastPipeAtkMs:30, coastPipeRelMs:30,
        coastPipeFloor:0.60,
        coastBodyDb:6.0, coastNotchDb:0,
        coastOutletRelaxV5:1, coastOutletRelaxTauMs:100,
        coastOutletRelaxBrightDb:1.6,
        coastCyclePressureV6:1, coastPressureMemory:0.84,
        coastPressureBlend:0.10, coastPressureGain:1.18,
        coastPressureFloor:0.55
      },
      /* V7 keeps V6 intact, then allows the gas-filled reflection path to
         lengthen during overrun as its effective gas temperature falls.  The
         metal wall is deliberately not treated as cooling on this time scale.
         A fractional delay moves only the pipe formant; firing pitch and pipe
         reflection gain stay unchanged. */
      v7:{
        coastPipeV4:1, coastPipeLenM:0.574, coastPipeSign:-1,
        coastPipeFeedbackByMuffler:[0.10,0.18,0.18],
        coastPipeDelayMs:0, coastPipeAtkMs:30, coastPipeRelMs:30,
        coastPipeFloor:0.60,
        coastBodyDb:6.0, coastNotchDb:0,
        coastOutletRelaxV5:1, coastOutletRelaxTauMs:100,
        coastOutletRelaxBrightDb:1.6,
        coastCyclePressureV6:1, coastPressureMemory:0.84,
        coastPressureBlend:0.10, coastPressureGain:1.18,
        coastPressureFloor:0.55,
        coastPipeThermalV7:1, coastPipeHotK:820,
        coastPipeOverrunK:640, coastPipeCoolTauMs:400,
        coastPipeReheatTauMs:45, coastPipeSoundCoeff:20.05
      },
      /* V8 keeps the complete V7 path and adds the second repeatable delay
         found in pitch-matched release/rise spectra.  The 1.076 m effective
         route corresponds to about 3.75 ms at the accepted hot sound speed,
         consistent with a longer collector/baffle return.  Both routes share
         the same pressure output and gas-temperature state. */
      v8:{
        coastPipeV4:1, coastPipeLenM:0.574, coastPipeSign:-1,
        coastPipeFeedbackByMuffler:[0.10,0.18,0.18],
        coastPipeDelayMs:0, coastPipeAtkMs:30, coastPipeRelMs:30,
        coastPipeFloor:0.60,
        coastBodyDb:6.0, coastNotchDb:0,
        coastOutletRelaxV5:1, coastOutletRelaxTauMs:100,
        coastOutletRelaxBrightDb:1.6,
        coastCyclePressureV6:1, coastPressureMemory:0.84,
        coastPressureBlend:0.10, coastPressureGain:1.18,
        coastPressureFloor:0.55,
        coastPipeThermalV7:1, coastPipeHotK:820,
        coastPipeOverrunK:640, coastPipeCoolTauMs:400,
        coastPipeReheatTauMs:45, coastPipeSoundCoeff:20.05,
        coastSecondaryV8:1, coastSecondaryLenM:1.076,
        coastSecondarySignV8:1,
        coastSecondaryFeedbackByMufflerV8:[0.0045,0.008,0.008],
        coastSecondaryWallHzV8:1800,
        coastFeedbackCeilingV8:0.28
      },
      /* V9 keeps V8 as its acoustic reference and exposes only parameters that
         correspond to independent GS/BS34 adjustments. No suction-strength
         macro is added: mixture, diaphragm motion, intake transfer, pipe delay,
         and outlet impedance retain separate causes and separate penalties. */
      v9:{
        coastPipeV4:1, coastPipeLenM:0.574, coastPipeSign:-1,
        coastPipeFeedbackByMuffler:[0.10,0.18,0.18],
        coastPipeDelayMs:0, coastPipeAtkMs:30, coastPipeRelMs:30,
        coastPipeFloor:0.60,
        coastBodyDb:6.0, coastNotchDb:0,
        coastOutletRelaxV5:1, coastOutletRelaxTauMs:100,
        coastOutletRelaxBrightDb:1.6,
        coastCyclePressureV6:1, coastPressureMemory:0.84,
        coastPressureBlend:0.10, coastPressureGain:1.18,
        coastPressureFloor:0.55,
        coastPipeThermalV7:1, coastPipeHotK:820,
        coastPipeOverrunK:640, coastPipeCoolTauMs:400,
        coastPipeReheatTauMs:45, coastPipeSoundCoeff:20.05,
        coastSecondaryV8:1, coastSecondaryLenM:1.076,
        coastSecondarySignV8:1,
        coastSecondaryFeedbackByMufflerV8:[0.0045,0.008,0.008],
        coastSecondaryWallHzV8:1800,
        coastFeedbackCeilingV8:0.28,
        physicalTuneV9:1
      },
      /* V10 keeps every V9 adjustment, but replaces the direct coast-vacuum
         target with a causal air/fuel path.  A filling/emptying state follows
         piston demand and butterfly area; an Aquino X-tau state retains fuel
         on the port wall and releases it after the air charge has fallen.  The
         resulting manifold pressure and combustion quality drive the existing
         valve and pipe network instead of multiplying a finished sound. */
      v10:{
        coastPipeV4:1, coastPipeLenM:0.574, coastPipeSign:-1,
        coastPipeFeedbackByMuffler:[0.10,0.18,0.18],
        coastPipeDelayMs:0, coastPipeAtkMs:30, coastPipeRelMs:30,
        coastPipeFloor:0.60,
        coastBodyDb:6.0, coastNotchDb:0,
        coastOutletRelaxV5:1, coastOutletRelaxTauMs:100,
        coastOutletRelaxBrightDb:1.6,
        coastCyclePressureV6:1, coastPressureMemory:0.84,
        coastPressureBlend:0.10, coastPressureGain:1.18,
        coastPressureFloor:0.20,
        coastPipeThermalV7:1, coastPipeHotK:820,
        coastPipeOverrunK:640, coastPipeCoolTauMs:400,
        coastPipeReheatTauMs:45, coastPipeSoundCoeff:20.05,
        coastSecondaryV8:1, coastSecondaryLenM:1.076,
        coastSecondarySignV8:1,
        coastSecondaryFeedbackByMufflerV8:[0.0045,0.008,0.008],
        coastSecondaryWallHzV8:1800,
        coastFeedbackCeilingV8:0.28,
        physicalTuneV9:1,
        transientMixtureV10:1,
        /* The paired GS runner volume is small enough to empty in roughly one
           720-degree cycle at call RPM. 48 s^-1 gives a 21 ms closed-throttle
           mass time constant; slower 18-36 s^-1 candidates measurably erased
           the 46-186 ms pressure body in the fixed recording corpus. */
        manifoldPumpRateV10:48,
        manifoldFillRateV10:55,
        fuelFilmDepositV10:0.18,
        fuelFilmTauSecV10:0.25,
        intakeRunnerLenM10:0.22,
        intakeRunnerFeedbackV10:0.72,
        intakeRunnerGainV10:0.075
      },
      /* V11 keeps the complete V10 transient network and adds engine geometry
         upstream of it. Bore changes displaced volume at the fixed 60 mm
         stroke; compression changes the fired-cylinder pressure and thermal
         efficiency. Neither value retunes the intake/exhaust pipe lengths or
         multiplies a completed sound. */
      v11:{
        coastPipeV4:1, coastPipeLenM:0.574, coastPipeSign:-1,
        coastPipeFeedbackByMuffler:[0.10,0.18,0.18],
        coastPipeDelayMs:0, coastPipeAtkMs:30, coastPipeRelMs:30,
        coastPipeFloor:0.60,
        coastBodyDb:6.0, coastNotchDb:0,
        coastOutletRelaxV5:1, coastOutletRelaxTauMs:100,
        coastOutletRelaxBrightDb:1.6,
        coastCyclePressureV6:1, coastPressureMemory:0.84,
        coastPressureBlend:0.10, coastPressureGain:1.18,
        coastPressureFloor:0.20,
        coastPipeThermalV7:1, coastPipeHotK:820,
        coastPipeOverrunK:640, coastPipeCoolTauMs:400,
        coastPipeReheatTauMs:45, coastPipeSoundCoeff:20.05,
        coastSecondaryV8:1, coastSecondaryLenM:1.076,
        coastSecondarySignV8:1,
        coastSecondaryFeedbackByMufflerV8:[0.0045,0.008,0.008],
        coastSecondaryWallHzV8:1800,
        coastFeedbackCeilingV8:0.28,
        physicalTuneV9:1,
        transientMixtureV10:1,
        manifoldPumpRateV10:48,
        manifoldFillRateV10:55,
        fuelFilmDepositV10:0.18,
        fuelFilmTauSecV10:0.25,
        intakeRunnerLenM10:0.22,
        intakeRunnerFeedbackV10:0.72,
        intakeRunnerGainV10:0.075,
        boreDisplacementV11:1,
        gsStrokeMmV11:60,
        gsBaseBoreMmV11:65,
        gsBaseCompressionV11:9.0,
        gsCompressionGammaV11:1.32
      },
      /* V12 keeps V11 geometry intact and adds only documented GS top-end
         calibration. The GS400 C/E and GS425 data identify different exhaust
         cam lobe heights and BS34SS 4F23/Y-5 versus 4F24/Y-6 metering. The
         exact GS425 valve opening/closing angles are not published in the
         available service table, so this profile deliberately does not invent
         timing or overlap. Both consequences enter before combustion and the
         primary pipe; there is no post-synthesis loudness control. */
      v12:{
        coastPipeV4:1, coastPipeLenM:0.574, coastPipeSign:-1,
        coastPipeFeedbackByMuffler:[0.10,0.18,0.18],
        coastPipeDelayMs:0, coastPipeAtkMs:30, coastPipeRelMs:30,
        coastPipeFloor:0.60,
        coastBodyDb:6.0, coastNotchDb:0,
        coastOutletRelaxV5:1, coastOutletRelaxTauMs:100,
        coastOutletRelaxBrightDb:1.6,
        coastCyclePressureV6:1, coastPressureMemory:0.84,
        coastPressureBlend:0.10, coastPressureGain:1.18,
        coastPressureFloor:0.20,
        coastPipeThermalV7:1, coastPipeHotK:820,
        coastPipeOverrunK:640, coastPipeCoolTauMs:400,
        coastPipeReheatTauMs:45, coastPipeSoundCoeff:20.05,
        coastSecondaryV8:1, coastSecondaryLenM:1.076,
        coastSecondarySignV8:1,
        coastSecondaryFeedbackByMufflerV8:[0.0045,0.008,0.008],
        coastSecondaryWallHzV8:1800,
        coastFeedbackCeilingV8:0.28,
        physicalTuneV9:1,
        transientMixtureV10:1,
        manifoldPumpRateV10:48,
        manifoldFillRateV10:55,
        fuelFilmDepositV10:0.18,
        fuelFilmTauSecV10:0.25,
        intakeRunnerLenM10:0.22,
        intakeRunnerFeedbackV10:0.72,
        intakeRunnerGainV10:0.075,
        boreDisplacementV11:1,
        gsStrokeMmV11:60,
        gsBaseBoreMmV11:65,
        gsBaseCompressionV11:9.0,
        gsCompressionGammaV11:1.32,
        factoryHeadV12:1,
        gs400ExhaustCamHeightMmV12:36.10,
        gs425ExhaustCamHeightMmV12:36.797,
        gsNeedleJetStepMmV12:0.005,
        gsNeedleMeterScaleV12:1.0091
      },
      /* V13 keeps the complete V12 engine, carburetor and temperature model,
         but replaces the old muffler-element count and V8's unidentified long
         return with a termination network made from measurable parts.  A
         removable insert has a positive pressure reflection at its area
         contraction and a delayed negative reflection at its open end.  A
         perforated packed core weakens the step and dissipates the transmitted
         mid/high-frequency energy; a straight pipe has neither internal step
         nor packing.  The 58 mm entrance and 200/300 mm insert lengths are
         bounded effective dimensions from the documented 60/70 mm tail and
         200/300 mm commercial silencer classes, not a claim about one product. */
      v13:{
        coastPipeV4:1, coastPipeLenM:0.574, coastPipeSign:-1,
        coastPipeFeedbackByMuffler:[0.10,0.18,0.18],
        coastPipeDelayMs:0, coastPipeAtkMs:30, coastPipeRelMs:30,
        coastPipeFloor:0.60,
        coastBodyDb:6.0, coastNotchDb:0,
        coastOutletRelaxV5:1, coastOutletRelaxTauMs:100,
        coastOutletRelaxBrightDb:1.6,
        coastCyclePressureV6:1, coastPressureMemory:0.84,
        coastPressureBlend:0.10, coastPressureGain:1.18,
        coastPressureFloor:0.20,
        coastPipeThermalV7:1, coastPipeHotK:820,
        coastPipeOverrunK:640, coastPipeCoolTauMs:400,
        coastPipeReheatTauMs:45, coastPipeSoundCoeff:20.05,
        coastSecondaryV8:1, coastSecondaryLenM:1.076,
        coastSecondarySignV8:1,
        coastSecondaryFeedbackByMufflerV8:[0.0045,0.008,0.008],
        coastSecondaryWallHzV8:1800,
        coastFeedbackCeilingV8:0.28,
        physicalTuneV9:1,
        transientMixtureV10:1,
        manifoldPumpRateV10:48,
        manifoldFillRateV10:55,
        fuelFilmDepositV10:0.18,
        fuelFilmTauSecV10:0.25,
        intakeRunnerLenM10:0.22,
        intakeRunnerFeedbackV10:0.72,
        intakeRunnerGainV10:0.075,
        boreDisplacementV11:1,
        gsStrokeMmV11:60,
        gsBaseBoreMmV11:65,
        gsBaseCompressionV11:9.0,
        gsCompressionGammaV11:1.32,
        factoryHeadV12:1,
        gs400ExhaustCamHeightMmV12:36.10,
        gs425ExhaustCamHeightMmV12:36.797,
        gsNeedleJetStepMmV12:0.005,
        gsNeedleMeterScaleV12:1.0091,
        exhaustHardwareV13:1,
        exhaustEntranceMmV13:58,
        exhaustBaffleLengthMV13:0.20,
        exhaustPackedLengthMV13:0.30,
        exhaustNetworkCouplingV13:0.18
      },
      /* V14 inherits every V13 pressure path, then adds the missing radiating
         structure outside the one-dimensional pipe.  The nonlinear term is a
         compact weak-shock approximation: compression slopes steepen in
         proportion to local acoustic pressure before the selected termination
         attenuates them.  The outlet, outer shell and first road reflection
         then reach the two ears through different causal paths. */
      v14:{
        extends:'v13',
        exhaustFieldV14:1,
        exhaustShockGainByMufflerV14:[0.34,0.44,0.72],
        exhaustRadiationGainByMufflerV14:[1.10,1.18,1.34],
        exhaustShellGainByMufflerV14:[0.115,0.080,0.026],
        exhaustShellModesHzV14:[430,790,1510],
        exhaustShellModesQV14:[3.4,4.2,5.4],
        exhaustGroundDelayMsV14:[1.14,1.27]
      },
      /* V15 stops treating the two primaries as numbers that can be summed at
         the collector.  Each primary and the tail carry independent incident
         and reflected pressure waves into a lossless three-port junction.  A
         pulse from either cylinder can therefore enter the other primary,
         reflect at its time-varying exhaust-valve boundary, and return later.
         The 38/58 mm diameters are generic effective junction dimensions; the
         scattering coefficients are derived from their areas, not tuned gains. */
      v15:{
        extends:'v14',
        collectorScatterV15:1,
        collectorPrimaryDiameterMmV15:38,
        collectorTailDiameterMmV15:58,
        collectorJunctionLossV15:0.965,
        collectorRadiationTrimV15:0.72
      }
    }
  },

  /* --------------------------------------------------------------------
   * A2T3_380 ＝ 空冷2ストローク 並列3気筒 380cc・120度等間隔。初の2ストローク。
   *
   * サイクルはクランク1回転（strokeRevs:1）。したがって生存次数は 3/6/9/12… のみで、
   * 半次数は「小さい」のではなく1回転サイクルでは定義されない。これが最も鋭い自動テスト。
   * 基音 = RPM/20（4発 RPM/30 の1.5倍＝完全5度上、2発の3倍、吸い込みの6倍）。
   * ただし「カン高さ」の主因は基音ではなくパルスの立ち上がり時間で、そちらは
   * 同回転で4発の約2.7倍（6,000rpm で 3.8kHz vs 1.4kHz）。envA/envA2 がその本体。
   *
   * 排気は3本独立の膨張室。バルブが無く、ポートはピストンが機械的に開閉するので
   * 開閉角は回転数にもスロットルにも一切依存しない完全固定角。
   * ★ポートは断面551mm2の窓が断面2290mm2のシリンダへ開くので、開口時の反射が
   *   R=(551-2290)/(551+2290) = -0.61 と負になる。4ストの +0.32 と符号が逆で、
   *   これが構造上の最大差。ここを正のまま流用すると2ストにならない。
   * ★電子レブリミッタは持たない世代。cutOn/cutOff は実用域のはるか上に置いて
   *   事実上無効化し、同調が外れてトルクが崖になることで自然に頭打ちにする
   *   （実測：全開で 8,980rpm 付近が釣り合い点。「レブに当たるカタカタ」ではなく
   *   「伸びが急に止まって濁る」）。
   * -------------------------------------------------------------------- */
  A2T3_380: {
    id:'A2T3_380', label:'3発',
    sub:'空冷2スト 並列3気筒 380cc・120度等間隔 ／ チャンバー',
    sceneLabel:'3発・チャンバー',
    tuneHint:'2ストはチャンバーの同調が全て。出口を細くすると管が熱くなって同調が上がる',
    /* 「出口」は4ストのバッフル加工ではなくスティンガ（テールパイプ）の径。
       文言だけ差し替える。DOM は固定のまま（30-markup.html は共有ファイル）。 */
    tuneLabels:{ outlet:['細い','標準','太い'] },
    mufLabels:['純正','チャンバー','直'],
    /* ★11,000 の共通文字盤を当てると、常用域が左下に潰れたうえ
       レッドゾーン(8,200〜)が盤面の1/4を占めて「ずっと赤」に見える。
       実車のGT380系の文字盤どおり 9,000 フルスケールにする。 */
    dialMax:9000,
    cylinders:3, strokeRevs:1, beatHys:200,   // 実測校正: 10回叩いて10打
    firingDeg:[0,120,240],                  // → off [0, 1/3, 2/3]

    /* ---- 回転物理。bleed は閉形式で解いた値、torque[1..2] の傾きは安定条件の縛り ----
       アイドル平衡: torqueWOT(1300)*sqrt(bleed) = fricC+(fricK+pumpK)*1300
                     9.450*0.32296 = 3.0520 = 1.70+0.00104*1300   （厳密に一致）
       安定条件:     slope_TQ*sqrt(bleed) < fricK+pumpK
                     0.0015*0.32296 = 4.844e-4 < 1.040e-3         （余裕 2.15倍）
       ★エンブレを弱くしたい(K を小さく)とアイドル安定(K を大きく)は直接対立する。
         逃げ道は torque[1]/torque[2] の傾きを寝かせること（9→10.5）だけで、
         2ストが「管が効かない低速では本当にトルクが平ら」なのと一致する。
         トルク配列を触るときは必ず上の2式を再検算すること。 */
    /* ★cutOn/cutOff は「電子レブリミッタ」ではなく失火の滲み量（cutRatio）の帯。
       旧値 10200/10500 は全開釣合(8,840rpm)より上にあり、cutRatio が常に 0 だった。
       ＝天井で何も起きず、針がレッドゾーン(8,200)に入ったまま無反応で居座る。
       他3台は cutOff==redRpm から失火が滲み、cutOn で完全カットに達する。
       2ストは電子リミッタを持たない世代なので、完全カット(=1.0)には
       絶対に届かない幅にする: 釣合点で (8840-8200)/(9600-8200)=0.46。
       約46%の失火＝「レブに当たるカタカタ」ではなく「伸びが止まって濁る」。
       ★cutOn を 9,200 未満にすると釣合点でカット率が1.0に達してカタカタになる。 */
    idleRpm:1300, maxRpm:7600, cutOn:9600, cutOff:8200, stallRpm:620, redRpm:8200,
    J:0.017, fricC:1.70, fricK:0.00072, pumpK:0.00032, bleed:0.10431,
    clutchC:52, clutchP:1.5, thrTau:0.006,
    /* Sigma=0（オフパイプ）基準。Sigma=1 で torqueGain 0.15 が乗る。
       実効: 5,000rpm 25.0 → 6,500rpm 36.8 N.m ＝ +47% の段差
             最大 39.10 N.m @7,000rpm ＝ 39.0 PS
             8,000→29.0 / 8,500→17.4 / 9,000→8.0 と崖。自然な頭打ち 8,980rpm。 */
    torque:[0,9,10.5,14,19,25,30,34,26,8],

    /* ---- 管系。prim はヘッダ(0.10Lt)、tail はスティンガ、膨張室本体は chamber 側 ----
       ★primLenM は +-5.8% の不等長。+-1.5% だと 48kHz の量子化（1サンプル≒5.8%）で
         3本とも同じ長さに丸められて不等長が消える。実測の丸め結果:
           48.0kHz  D = 17 / 18 / 19  → 1/4波長 1412 / 1333 / 1263 Hz
           44.1kHz  D = 15 / 16 / 17  → 1470 / 1378 / 1297 Hz
         いずれも3本が分離する。m の値ではなく丸めた D を必ず printf で確認すること。 */
    primLenM:[0.098,0.104,0.110],
    collectorLenM:0.045, tailLenM:0.232,    // 3本独立なので collector は物理的に不在→実質透過
    mufflerLenM:[0.220,0.095,0.120,0.150],
    collectorIn:0.95, g1:0.70, gColl:0.04, gMuf:0.26, mufSign:1,   // ★スティンガは急縮小＝正反射
    cSound:560,                             // 20.05*sqrt(780K)。2ストは新気の吹き抜けで4ストより低温
    wallHz:2400,                            // ディフューザは高域を反射しない（既定4200は直管の値）

    /* ---- ★ポート端反射（バルブ反射スケジュールの数値差し替えのみ。コード変更ゼロ） ---- */
    alphaClosed:0.96,                       // ピストン冠＋ライナ。ポペットバルブより硬い
    alphaOpen:-0.61,                        // ★符号反転。(551-2290)/(551+2290)
    chokeFrac:0.033,                        // 12度/360。control() で sqrt(throttle) が掛かる
    valveOpenFrac:0.444,                    // 160度/360（EPO=100度ATDC、EPC=260度ATDC）

    /* ---- 気筒ばらつき。120度等間隔は理想だと1・2・4・5次が厳密ゼロなので、
           ここだけが「旧車らしい濁り」を作る。3連キャブ＋独立ポイント＋独立チャンバー。 ---- */
    cylBiasDeg:2.60, cylAmpDb:2.80, jitterDeg:0.55,

    /* ---- パルス包絡。attack_sec = envA * pwSec の閉形式で設計した ----
       実測（wDeg = 34 - 6*thr - 6*Sigma）:
         6,000rpm オンパイプ全開  91.7us = 4.40サンプル → コーナー 3,818 Hz
         8,000rpm                 68.7us = 3.30サンプル →        5,091 Hz
         8,500rpm                 64.7us = 3.11サンプル →        5,409 Hz
         3,000rpm オフパイプ     342.2us                →        1,023 Hz
       参考 4発 6,000rpm: 250us → 1,400 Hz。同回転比 2.73倍 ＝ 1.45オクターブ。
       ★物理予測の 5.8倍(2.5oct) には届かない。48kHz の Nyquist が下限で、
         そこまで立てると立ち上がりが1サンプルに潰れる（自己申告。verify 参照）。 */
    wDegBase:34, wDegThrSpan:6, pwMinSec:0.00035, pwMaxSec:0.0050,
    envA:0.22, envT1:0.055, envT2:0.30, envM:0.42,        // オフパイプ（鈍い）

    /* ---- フィルタ・レイヤ ---- */
    portBpHz:900, portBpQ:1.1, formantHz:1400, raspHz:3600,
    bFcBase:2600, bFcThr:5200,              // 既定 1800+6500t は全開8300Hzで頭打ち＝2ストが明るくならない
    intakeGainA:0.035, intakeGainB:0.55, intakeFrac:0.40,  // クランクケース吸入 約144度/360
    mechGain:0.045,                         // 冷却フィンが振動板＋転がり軸受。全閉でも消えない
    psbBpHz:180, psbGain:1.0,               // 基音が高いので疑似低音の必要度は最小
    bodyRes:[225,330], bodyLevel:0.13, bodyOrder:3,   // ★2次ではなく3次。4,500/6,600rpm でヒット
    revBands:[4200,5900,7200],              // 低=乗らない / 中=毎打で乗り降り / 高=乗りっぱなし

    /* ---- 3択。★同調長は3択で一切変えない（2ストは管を外せない）。変わるのは出口だけ ----
       radHz は4ストと逆順（昇順）。サイレンサを外すと出口がスティンガ＝細くなるので
       radHz が上がり、より共鳴的になる。「外すと甲高く荒くなるが同調は変わらない」。 */
    radHzByMuffler:[7700,6600,8500],
    g2ByMuffler:[0.50,0.54,0.56],           // 0.58超は 1/(1-g)>2.4 で本コードベース最高。上げない
    mufElemsByMuffler:[3,1,0],
    gammaOutByMuffler:[0.55,0.68,0.80],     // ★死にキーだが無いと setMuffler で TypeError → 完全無音
    outTrimByMuffler:[0.42,0.85,1.20],      // ★暫定値。--raw + tools/balance.py で必ず実測校正
    brightMaxByMuffler:[4200,11000,17000],  // 純正は大容量サイレンサで抑える＝「シュ〜ン」（rasp 0 と組）
    raspDbByMuffler:[0,3.0,5.0],
    afTargetByMuffler:[0.10,0.22,0.34], afVolByMuffler:[0.22,0.46,0.68],
    bodyHzByMuffler:[166,215,0], bodyQByMuffler:[4.5,3.2,1], bodyDbByMuffler:[7,5,0],

    /* ★吸い込みは構造的に成立しない。3気筒×排気開角160度 = 480度 > 1サイクル360度 で、
       union が全周を覆う＝どのクランク角でも必ずどれかの排気ポートが開いている。
       全閉時に管出口が強い負圧になる「隙間」が物理的に存在しない。完全な「吐き」車種。
       beatOn / defaultGear はキーごと省略（1速・上昇で拍を数える＝AC4_400 と同じ）。 */
    suikomi:null,

    /* ================= 膨張室層。このキーの有無だけが唯一の分岐 ================= */
    chamber:{
      /* 幾何。Lt = a0*thetaEp/(12*N_t) （Blair 式6.2.4）。
         a0=560, thetaEp=160, Lt=1.037 → N_t = 7,200.3 rpm（実測確認）。
         気筒別 +-1.5%（フレームを避けた取り回しで実車も違う）。 */
      LtM:[1.021,1.037,1.052], LtRefM:1.037, thetaEp:160,
      fDiff:0.305,                          // ディフューザ分布反射の重心（同調時 EPO+48.8度）
      fBaf :0.88,                           // バッフルコーン平均反射点（同調時 EPO+140.8度）

      /* 同調窓（rho = rpm/N_t、無次元）。
         下限 0.41 … ディフューザ負圧が掃気開(EPO+20度)に間に合う限界
         上限 1.136 … バッフル正圧が排気閉(EPO+160度)を越えない限界
         実用窓はその内側に取る。N_t=7,200 なら 5,040〜8,780rpm。 */
      rOnLo:0.70, rOnHi:0.90, rOffLo:1.06, rOffHi:1.22,
      rhoHyst:0.035,                        // 乗ったら約250rpm 粘る（掃気効率の自己保持。推測）
      tauOnSec:0.022, tauOffSec:0.055,      // ★非対称。乗るのは速く、落ちるのは遅く
      onsetKick:0.18, hitTauSec:0.090,      // ★乗った瞬間の一撃。6打/秒ではシュミットが発火を抑える

      /* 2タップの結合係数。★これは幾何で決まる反射係数 beta そのものではなく、
         分布反射（0.10〜0.65Lt ＝ 約88クランク度に散る）を2タップに束ねたときの
         取りこぼし補正。低振幅では束ねきれず、高振幅では有限振幅波の先鋭化で
         束が締まる。比を1.6倍までに制限し、音量とトルクの主役は loadSigma /
         torqueGain（充填効率＝物理）側に置く。二重計上を避けるための線引き。
         実測ループ利得（時間平均|aV|=0.804）: オフ 0.469(+5.5dB) / オン 0.754(+12.2dB)。
         cDiff1+cBaf1 = 0.90 が安定予算そのもので、constructor がアサートする。 */
      cDiff0:0.36, cDiff1:0.58,
      cBaf0 :0.20, cBaf1 :0.32,
      lpDiff0:1600, lpDiff1:2400,           // 同調時は波面が立つのでHFが返る
      lpBaf0 :2600, lpBaf1 :3800,
      gOut:0.45,                            // スティンガから出る分（exSum への寄与）

      /* 管内ガス温度。2ストは1回転で管内が総入れ替えされるので秒オーダーで冷える。
         780K(a0=560) → 514K(a0=454.6) で -361 セント（-3.6半音）。管長は不変。 */
      tInitK:330, tMinK:293, tCoolK:420, tHotK:780, tTauSec:0.8,

      /* Sigma が同時に動かすもの。同時だから耳が「変わった」と認識する。 */
      torqueGain:0.15, loadSigma:0.30,
      /* 全閉でも bleed ぶんは流れるので、同調をゼロにはせず床を残す。 */
      chargeFloor:0.12, chargeP:0.8,
      wDegSigma:6, bFcSig:4200, raspSigmaDb:3.5, turbSigma:0.12, intakeSigma:0.35,
      envA2:0.150, envT1_2:0.032, envT2_2:0.20, envM2:0.34,   // オンパイプ（衝撃波的）

      /* 四循環（four-stroking）とパイプバン。本設計で最も信頼度が低いブロック。
         seThresh を 0 にすれば無効化できるので、まず二層共振だけで音を確認し、
         後段でこれを入れる順序を守ること。
         実測 se: アイドル 0.524 / 全閉5,000rpm 0.461 / 全閉8,000rpm 0.430 / 全開 0.901
         → 失火率 アイドル約25〜30% / オーバーラン55〜70% / 全開 0%。 */
      drRefRpm:2400,

      /* 失火周期は「既燃ガスがどれだけ新気に置き換わったか」で決まる緩和振動子。
         点火のたびに筒内は既燃ガスで満たされ（resid=1）、掃気のたびに (1-σ) 倍に
         薄まる。火炎が伝播できる上限 residLimit を割るまで失火し続ける。
         n = ceil(ln(residLimit)/ln(1-σ))。旧実装は閾値と乱数で毎回引き直していた
         ため n≈2.5 に固定され、イベントが 95Hz に密集してラフネス（ザラつき）に
         融合していた。全閉6,000rpm で n=10 になるよう校正してある。 */
      residLimit:0.28,
      scavBase:0.70, scavRpmP:1.90, scavThr:1.75, scavMin:0.075, scavMax:0.95,
      scavNoise:0.12,                       // ★これが無いと n が整数に張り付いて機械的になる

      /* パイプに溜まる生ガスと、その可燃限界。薄すぎても濃すぎても着火しない。
         旧実装は下限しか見ておらず、全閉では常時成立していたので、頻度は
         bangMinGapSec という非物理の不応期だけが決めていた。窓にすると
         「濃いとボコッ（大・低頻度）／薄いとパパパ（小・高頻度）」が自然に出る。 */
      fuelPerScav:9.0, fuelPurgeK:4.8,
      flamLo:0.60, flamPk:1.50, flamHi:3.20, flamP:2.2, bangResid:0.15,
      /* 不応期は置かない。バン後に pipeFuel が bangResid まで落ち、
         再び可燃下限に達するまでの n スロットが物理的な不応期になる。 */

      /* バンの音そのもの。芯（速い立上り・高域・短い減衰）と中域（遅い・長い）の
         2帯域。減衰時間が帯域で10倍違うのが実機で、単一包絡だと「パンッ…ボォン」の
         二段構造が出ない。芯は 2.5〜5kHz ＝ 胴の第1横モードより上で、連続する
         排気音が原理的に届かない帯域。 */
      bangCoreHz0:2500, bangCoreHz1:5000, bangCoreQ:1.2,
      bangAtkFast:0.00010, bangAtkSlow:0.00060,   // 強度で補間。BW ≒ 0.35/t_r
      bangCoreTau:0.0020,                          // T60 ≒ 14ms
      bangMidHz0:700, bangMidHz1:1600,
      bangMidTau:0.0060, bangMidGain:0.55,         // T60 ≒ 41ms
      bangLifeSec:0.090,
      /* 芯を 2ms 減衰にしたぶん、旧ボイス（9ms＋低域サンプ）よりエネルギーが落ちる。
         実機のパイプバンは通常パルス比 +10〜+20dB、失火パフは -12〜-18dB でその差
         30dB がこの音の本質なので、上げるのが物理的にも正しい。排気バスRMS比で
         ピーク +9dB 前後になるよう校正した。 */
      bangGain:1.8,

      /* 失火サイクルの排気。物理側の「通常パルス比 -12〜-18dB・立上り 5〜15ms・
         1.5kHz 以上ほぼ無し」に合わせる。6,000rpm の 944µs × 8 = 7.5ms。 */
      missGain:0.18, missPwMul:8.0, missEnvA:0.45,

      /* バンの胴。芯と中域はコレクタ直後に出すが、胴は膨張室そのものの中で起きた
         燃焼なので、チャンバーの遅延線へ注入して管の共鳴を被らせる。管長 Lt=1.037m の
         1/4波長が 99〜135Hz、1/2波長が 198〜270Hz。管内ガス温度 tPipe で音速が動くので
         「冷えたパイプのバンは音程が違う」が自動的に出る。 */
      bangBodyGain:1.00, bangBodyTau:0.0080, bangBodyHz:350,

      /* スティンガ径→管内温度。細いほど抜けにくく熱がこもる。物理側は「主要因」と
         言うだけで定量値を持っていないので、この 0.28 は同調回転数の総幅が
         130セント（聴こえる程度）になるよう置いた設計値。実測ではない。 */
      stingHeatK:0.28,
    }
  },

  /* --------------------------------------------------------------------
   * AC4V_400 ＝ 空冷4スト 並列4気筒 399cc・回転数応答バルブ休止。
   *
   * 点火の骨格（firingDeg・strokeRevs・基音 RPM/30）は AC4_400 と完全に同じで、
   * J も 2.0e-2 のまま動かさない。つまり「アクセル単独と半クラ併用で250〜580
   * セント」という、この企画を成立させている物理をそのまま流用している。
   * 音程では別物にならない。別物にしているのは音程ではなく **音色の段** で、
   * それが5車種の中でこの車種だけが持つ性質になる。
   *
   * 低回転では吸排の弁を1つずつ休ませてポート流速を稼ぎ、8,500rpm で全弁に戻す。
   * 回転数は連続量なのに音色だけが不連続に飛ぶので、コールでは
   *   「山をしきい値の上まで持っていく／わざと下で回す」
   * が技になる。既存4車種の revBands 上限（最大 7,800）より上にしか存在しない
   * ので、今までどおりの弾き方をする人には何も増えない（＝難しくならない）。
   *
   * ★ヒステリシスは飾りではない。コールは毎打この付近を上下するので、素の比較で
   *   書くと毎秒6回トグルして「段」ではなくビリつきになる。
   * ★torque[] は **休止側（2バルブ）の素性** を書いてある。全弁ぶんは
   *   valveStage.torqueGain が復元する。ここを実測の吐き出しトルクにすると、
   *   段が torque[] と torqueGain の二重計上になる。
   *   8,500rpm より上の値は「2バルブのまま回したら」という仮定の数字で、
   *   実際には作動の 30〜60ms しか通らない。
   * -------------------------------------------------------------------- */
  AC4V_400: {
    id:'AC4V_400', label:'4発',
    sub:'空冷4スト 並列4気筒 399cc・回転数応答バルブ休止 ／ 4-1集合管',
    sceneLabel:'4発・可変バルブ',
    tuneHint:'弁が開くのは8,500から。山をそこまで持っていくと音色が段で変わる',
    mufLabels:['純正','集合管','直管'],
    /* ★12,000 の文字盤を流用するとレッド(12,750〜)が盤の外に出る。 */
    dialMax:14000,
    cylinders:4, strokeRevs:2,
    firingDeg:[0,180,360,540],              // 180度クランク・等間隔。AC4_400 と同一
    /* 58PS/12,300rpm・3.6kgf·m/11,000rpm。レッドは資料が 12,750 と 13,300 で
       割れているので低い方を採る（高く採って外すと「回りすぎ」に聞こえるため）。 */
    idleRpm:1250, maxRpm:12300, cutOn:13050, cutOff:12750, stallRpm:500, redRpm:12750,
    J:0.020,                                // ★AC4_400 と同値。核心の物理を動かさないための固定
    /* bleed は torque を変えたので閉形式ではなく数値で再解した。
       0.090 では釣り合わずエンストし、0.100 で 1,154rpm、0.105 で 1,300rpm。
       0.103 が設計値 1,250rpm に載る。下側が崖なので、torque をいじったら必ず測り直す。 */
    fricC:2.2, fricK:0.0012, pumpK:0.0009, bleed:0.103,
    clutchC:55, clutchP:1.5, thrTau:0.008,
    /* 1000rpm刻み・0〜13,000。休止側の素性（上の★を読むこと）。
       全弁で torqueGain=0.12 を掛けると 9,000→32.6 / 11,000→35.3 / 12,300→33.1 で、
       公称の 3.6kgf·m@11,000 と 58PS@12,300 に載る。 */
    torque:[0,13.5,20.0,24.0,26.5,28.0,29.3,30.2,29.6,29.1,30.6,31.5,30.3,27.2],
    primLenM:[0.585,0.525,0.525,0.585],     // 不等長。AC4_400 より少し短い取り回し
    collectorLenM:0.175, tailLenM:0.470,
    mufflerLenM:[0.040,0.052,0.065,0.078],
    /* 車体レイヤ。同じ空冷でも角断面フレームぶん AC4_400(0.175) より締まる。 */
    bodyRes:[245,395], bodyLevel:0.160,
    radHzByMuffler:[4900,3720,2660],
    /* ★ここは全弁（4バルブ）側の値。休止側は valveStage が持つ。
       alphaClosed だけは弁の枚数と無関係（閉弁は剛壁）なので段を持たない。 */
    alphaClosed:0.90, alphaOpen:0.30, chokeFrac:0.069, valveOpenFrac:0.34,
    cylBiasDeg:0.80, cylAmpDb:1.05,
    /* 上段が切替点(8,500)の上、中段が下。跨ぐ／跨がないが選べる並びにする。
       ★上段を 9,500 より上げても意味が無い。お手本の制御ループが飽和していて、
         10,500 を狙わせても山は 9,543rpm で頭打ちになる（実測）。 */
    revBands:[5500,7500,9500],
    collectorIn:0.55, g1:0.68, gColl:0.22, gMuf:0.16, mufSign:-1,
    g2ByMuffler:[0.48,0.48,0.48],
    mufElemsByMuffler:[4,2,0],
    gammaOutByMuffler:[0.55,0.68,0.80],
    outTrimByMuffler:[0.50,1.00,1.41],
    /* AC4_400 より上を開ける。レッドが 1,750rpm 高いので同じ上限だと頭が詰まる */
    brightMaxByMuffler:[3600,9500,17000],
    raspDbByMuffler:[0,2.5,4.0],
    afTargetByMuffler:[0.10,0.30,0.55],
    afVolByMuffler:[0.24,0.55,0.85],
    /* ★pwMinSec を必ず下げる。既定 0.0009 は全開 wDeg=50 のとき
       50/(6*0.0009)=9,259rpm で床に当たり、そこから上は立ち上がりが固定されて
       いくら回しても明るくならない。0.00045 なら床は 18,518rpm でレッドに届かない。 */
    wDegBase:62, wDegThrSpan:12, pwMinSec:0.00045, pwMaxSec:0.0080,
    envA:0.18, envT1:0.060, envT2:0.300, envM:0.35,   // 1枚目＝休止側
    portBpHz:480, portBpQ:1.4, formantHz:430, raspHz:2600,
    bodyHzByMuffler:[152,196,0], bodyQByMuffler:[3.0,2.6,1], bodyDbByMuffler:[10,8,0],
    intakeGainA:0.02, intakeGainB:0.30, mechGain:0.030,
    psbBpHz:130, psbGain:1.8,
    suikomi:null,                           // 4発は吸い込みが出ない。AC4_400 と同じ

    /* ---- 弁の休止。この車種だけが持つ層 ---- */
    valveStage:{
      /* 一次資料が揃うのは 8,500rpm。戻り側を 300rpm 下げて粘らせる。 */
      onRpm:8500, offRpm:8200,
      /* 油圧なので上がりと下がりで速さが違う。同時にこれがクリック防止も兼ねる。
         ★6打/秒だと山が 8,500 を超えている時間が 20〜30ms しかなく、
           30ms の作動が終わらないので段はぼやける。段をはっきり出したければ
           2〜3打/秒で山に居座る必要がある＝「速く刻む」と「跨ぐ」が排他になる。
           これは欠陥ではなく、この車種の緊張として設計に入れている。 */
      tauOnSec:0.030, tauOffSec:0.060,
      torqueGain:0.12,                      // 全弁で+12%。torque[] の★を読むこと
      /* 休止側。弁が2枚しか動かないので実効ポート面積が半分になり、
         流れが立ち上がるまでが遅く、開放端に見える反射も浅い。
         ★このうち既存4車種の実測レンジ内なのは alphaOpen2 だけ（-0.61〜+0.32）。
           valveOpenFrac2 0.27 は既存の最小 0.34 より小さく、chokeFrac2 0.10 は
           既存の最大 0.069 より大きい＝どちらも意図的にレンジの外へ出している。
           これらが表すのはカムの開弁期間ではなく「音響的に開いているとみなせる窓」で、
           面積が半分なら窓は縮み、チョーク区間は伸びるのが正しいからだ。
           レンジ内に押し戻すと段が聞こえなくなる。 */
      valveOpenFrac2:0.27, alphaOpen2:0.13, chokeFrac2:0.10,
      /* 全弁で波面が締まり、音量が上がり、荒れが増える。段の中身はこの3つ。 */
      wDegStep:12, loadStep:0.18, raspStepDb:2.0,
      /* 2枚目の包絡＝全弁側。1枚目(envA:0.18)より立ち上がりが速い。 */
      envA2:0.11, envT1_2:0.048, envT2_2:0.250, envM2:0.30
    }
  }
};

/* ============================================================================
 * EngineCore
 * 直4・4ストの排気音をプロシージャル合成する。物理は制御レート(128sample)、
 * 点火位相はサンプル精度。process 相当のホットパスでは一切アロケートしない。
 *
 * 主要な設計判断は docs/dsp-spec.md に対応:
 *   f_fire = RPM * cylinders / (60 * strokeRevs)  → 直4なら RPM/30
 *   管長は「メートル」で保持し、起動時に音速とサンプルレートから遅延長へ丸める
 *   （サンプル数直書きだと 44.1k/48k 端末で共鳴が1.5半音ずれる）
 * ==========================================================================*/
class EngineCore{
  constructor(fs, preset, gsVersion){
    this.fs = fs;
    const baseP = preset || PRESETS.AC4_400;
    const profiles=baseP.gsSoundProfiles;
    const selected=profiles
      ? (profiles[gsVersion] ? gsVersion : baseP.gsSoundDefault)
      : null;
    const profile=selected && profiles[selected];
    /* Resolve the complete profile chain. Existing versions have at most one
       parent, so their merged values remain byte-for-byte identical. V15 is the
       first profile that extends a delta-only profile (V14 -> V13). */
    const resolveProfile=(name,seen=new Set())=>{
      const current=profiles&&profiles[name];
      if(!current||seen.has(name)) return {};
      seen.add(name);
      const parent=current.extends?resolveProfile(current.extends,seen):{};
      return Object.assign({},parent,current);
    };
    const inheritedProfile=profile&&profile.extends?resolveProfile(profile.extends):null;
    const P = this.P = profile
      ? Object.assign({},baseP,{suikomi:Object.assign({},baseP.suikomi,
          inheritedProfile||null,profile)})
      : baseP;
    this.gsVersion=selected;
    const N = this.N = P.cylinders;

    /* ---- 定数（プリセットから） ---- */
    this.strokeRevs   = P.strokeRevs;
    this.cyclesPerMin = 60 * P.strokeRevs;
    this.idleRpm      = P.idleRpm;
    this.nominalIdleRpm = P.idleRpm;
    this.maxRpm       = P.maxRpm;
    this.cutOn        = P.cutOn;
    this.cutOff       = P.cutOff;
    this.stallRpm     = P.stallRpm;

    this.J        = P.J;               // kg m^2 — 最重要チューニング係数
    this.fricC    = P.fricC;           // N m
    this.fricK    = P.fricK;           // N m / rpm
    this.pumpK    = P.pumpK;           // N m / rpm
    /* 仕様書の bleed=0.09 は全回転域で ΣT が負になりアイドルが成立しない
       （1100rpm で -0.13、900rpm で -0.31、600rpm で -0.94）。
       0.105 にすると 1,250rpm 付近で釣り合い、実機のアイドル域に入る。 */
    this.bleed    = P.bleed;
    this.nominalBleed = P.bleed;
    this.clutchC  = P.clutchC;         // N m
    this.clutchP  = P.clutchP;
    this.thrTau   = P.thrTau;          // キャブ車の加速ポンプ相当の即応性
    this.clTau    = 0.005;
    this.apTau    = 0.055;             // 加速ポンプ吐出持続
    this.apGain   = 0.35;

    this.TQ = Float32Array.from(P.torque);
    this.TQN = this.TQ.length - 1;   // LUT の最終インデックス

    /* ---- 入力 ---- */
    this.inThr=0; this.inCl=0; this.inBrake=1; this.gear=1;

    /* ---- 状態 ---- */
    this.rpm=0; this.thrS=0; this.clS=0; this.thrPrev=0; this.accelPump=0;
    this.cut=false; this.running=false; this.starter=0; this.stallT=0;
    /* Fuel supply is controlled by the tank/cock/float-bowl model on the main thread.
       Keep 1.0 exactly unchanged so the established sound remains bit-stable while fuel is healthy. */
    this.fuelSupply=1; this.fuelS=1;
    /* Stall is paused while the clutch UI is being redesigned. Keep the switch
       explicit so a future realism mode can restore the old behavior without
       reconstructing its conditions from git history. */
    this.allowStall=false;
    /* 実車のクラッチスイッチ。握られたままでは始動しない、を「始動を拒否する」ではなく
       「一度離すまで切った扱いにする」で実装する。ゲームで拒否すると詰むだけなので。 */
    this.clLock=0;
    this.cycPhase=0; this.cutRatio=0; this.overrun=false;

    /* ---- 気筒個体差（起動時に一度だけ確定） ---- */
    this.seed = 0x2545F491;
    /* 点火クランク角 → サイクル正規化オフセット（720度で1周） */
    /* 1サイクルは4ストで2回転(720度)、2ストで1回転(360度)。
       720 を直書きすると2ストで点火が前半に固まって後半が空になる。
       4スト(strokeRevs=2)では 360*2=720 なので既存車種は一切変わらない。 */
    this.off  = Float32Array.from(P.firingDeg, d => d/(360*P.strokeRevs));
    this.amp  = new Float32Array(N);
    this.bias = new Float32Array(N);
    this.jAmp = new Float32Array(N);
    this.jTim = new Float32Array(N);
    this.combustionVarDb = P.combustionVarDb === undefined ? 0.80 : P.combustionVarDb;
    this.combustionVarDbLow = P.combustionVarDbLow === undefined
        ? this.combustionVarDb : P.combustionVarDbLow;
    this.combustionVarRpmLo = P.combustionVarRpmLo||0;
    this.combustionVarRpmHi = P.combustionVarRpmHi||1;
    /* Preserve combustion RMS when a preset opts into wider variation. */
    if(P.combustionVarDb === undefined || this.combustionVarDb === 0){
      this.combustionVarNorm=1;
    }else{
      const x=Math.LN10*this.combustionVarDb*1.7320508/20;
      this.combustionVarNorm=Math.pow(x/Math.sinh(x),2);
    }
    this.prevU= new Float32Array(N);
    this.fireOn = new Uint8Array(N).fill(1);   // レブカット時に気筒単位で点火を落とす
    for(let k=0;k<N;k++){
      /* 仕様の σ=1.2°/1.5dB だと半次成分が -20dB まで立って「ガタつく」。
         不等長エキパイ（0.600/0.540m）自体が半次を作るので、個体差は控えめに。 */
            this.bias[k] = this.gauss()*P.cylBiasDeg/(360*P.strokeRevs);
      this.amp[k]  = Math.pow(10, this.gauss()*P.cylAmpDb/20);
      this.jAmp[k] = 1; this.jTim[k]=0; this.prevU[k]=0;
    }

    /* ---- パルス包絡テーブル（x ∈ [0,2]、2*pw で十分ゼロへ落ちる） ---- */
        this.ENV_N = 2048;
    this.env  = this.buildEnv(P.envA, P.envT1, P.envT2, P.envM);
    /* 2枚目＝オンパイプ用。掃気が効くと筒内圧が上がり波面が急峻になる。Σ で1枚目と補間。
       ★2枚目を必要とする理由は車種で違う。チャンバー車は「同調に乗った波形」、
         可変バルブ車は「休止していた弁が開いて実効ポート面積が増えた波形」で、
         出どころは別物だが「envMix で1枚目と補間する」という一点だけが共通している。
         なので分岐は素性ではなく「2枚目を持っているか」で書く。両方とも持たない
         既存4車種は env2=null のままで、ホットループ側の if(this.env2) が全部を弾く。 */
    const env2Src = P.chamber || P.valveStage || null;
    this.env2 = env2Src
      ? this.buildEnv(env2Src.envA2, env2Src.envT1_2, env2Src.envT2_2, env2Src.envM2)
      : null;
    /* ★失火したサイクルの排気。燃焼が起きないだけで、ポートは開くのでガス交換の
       流れは残る。旧実装は失火＝完全無音で、そこに 900〜1300Hz の破裂音を足すという
       物理と真逆のことをしていた。穴を空けるべき場所を、いちばんマスキングの濃い
       帯域で埋めていた。弱く遅い流れに置き換えると、バンの直前に必ず穴が空く。 */
    this.envMiss = P.chamber
      ? this.buildEnv(P.chamber.missEnvA, P.chamber.envT1_2*4, P.chamber.envT2_2*4, P.chamber.envM2)
      : null;
    this.missOn = new Uint8Array(N);

/* ↓ 元の `this.env = new Float32Array(...)` と続く { ... } ブロックは削除し、
     中身をそのままメソッドへ移す。式・定数は一字一句そのままなので env の中身は不変。 */
    this.env = new Float32Array(this.ENV_N+1);
    {
      const A=P.envA, t1=P.envT1, t2=P.envT2, m=P.envM;
      for(let i=0;i<=this.ENV_N;i++){
        const u = (i/this.ENV_N)*2;
        this.env[i] = u<A ? 0.5*(1-Math.cos(Math.PI*u/A))
                          : (1-m)*Math.exp(-(u-A)/t1) + m*Math.exp(-(u-A)/t2);
      }
    }

    /* ---- 排気系。長さは m で保持し、ここで初めてサンプルへ ---- */
        const c = P.cSound || 574.1;                         // 20.05*sqrt(820K) 暖機後（4スト）                                     // 20.05*sqrt(820K) 暖機後
    this.primL = P.primLenM;
    this.pD = new Int32Array(N); this.pBuf=[]; this.pIdx=new Int32Array(N);
    for(let k=0;k<N;k++){
      this.pD[k] = Math.max(2, Math.round(2*fs*this.primL[k]/c));
      this.pBuf.push(new Float32Array(this.pD[k]));
    }
    this.collD = Math.max(2, Math.round(2*fs*P.collectorLenM/c)); this.collBuf=new Float32Array(this.collD); this.collI=0;
    this.tailD = Math.max(2, Math.round(2*fs*P.tailLenM/c)); this.tailBuf=new Float32Array(this.tailD); this.tailI=0;
    this.mufL  = P.mufflerLenM;
    const MN=this.MN=this.mufL.length;
    this.mD=new Int32Array(MN); this.mBuf=[]; this.mI=new Int32Array(MN);
    for(let k=0;k<MN;k++){
      this.mD[k]=Math.max(2, Math.round(2*fs*this.mufL[k]/c));
      this.mBuf.push(new Float32Array(this.mD[k]));
    }
    /* 帰還量は仕様書の 0.45/0.32 では管が鳴り止むのが速すぎて、
       パルスの合間が無音になり「カチカチ」に痩せる。帰還路に壁面損失の
       1極LPF（4.2kHz）を入れて高域だけ速く殺すことで、帰還を上げても
       金属的にならず、管として鳴り続ける（Karplus-Strong と同じ構造）。 */
    /* aV（バルブ端の反射）を毎サンプル掛けるので、閉弁時に元の g1 になるよう割っておく */
    this.g1=P.g1/P.alphaClosed;
    this.g2=0.48; this.gColl=P.gColl; this.gMuf=P.gMuf;
    this.mufSign=P.mufSign; this.collectorIn=P.collectorIn;
    this.aClosed=P.alphaClosed; this.aOpen=P.alphaOpen; this.vOpen=P.valveOpenFrac;
    this.choke=P.chokeFrac;   // 開弁直後のチョーク区間（50度クランク ÷ 720度）
    /* 車体レイヤ。低Qの共振2本＋パネルのビビリ（非線形ラトル） */
    this.bodyR1=new Biquad(); this.bodyR1.bp(fs,P.bodyRes[0],3.2);
    this.bodyR2=new Biquad(); this.bodyR2.bp(fs,P.bodyRes[1],2.4);
    this.bodyLevel=P.bodyLevel; this.bodyPh=0;
    this.radLp=0; this.radA=0;   // setMuffler で確定
        this.wallA = 1-Math.exp(-2*Math.PI*(P.wallHz||4200)/fs);
    this.pLp = new Float32Array(N); this.collLp=0; this.tailLp=0; this.mLp=new Float32Array(this.mufL.length);

    /* ---- フィルタ ---- */
    this.portBp=new Biquad(); this.portBp.bp(fs,P.portBpHz,P.portBpQ);
    this.formant=new Biquad(); this.formant.peak(fs,P.formantHz,2.0,4);
    this.rasp=new Biquad();    this.rasp.peak(fs,P.raspHz,1.5,2.5);
    this.body=new Biquad();    this.body.peak(fs,140,3,0);   // 缶のヘルムホルツ。setMuffler で確定
    this.intakeBp=new Biquad();this.intakeBp.bp(fs,4000,0.7);
    this.mechBp=new Biquad();  this.mechBp.bp(fs,1500,0.9);
    this.mechAm=P.mechAm||0;
    this.mechAmW=(P.mechAmDeg||90)/(360*P.strokeRevs);
    this.mechAmN=this.mechAm>0?1/(P.firingDeg.length*(2/Math.PI)*this.mechAmW):0;
    this.mechRpmK=P.mechRpmK||0;
    this.bodyRatA=P.bodyRatHz?1-Math.exp(-2*Math.PI*P.bodyRatHz/fs):0; this.bodyRatZ=0;
    this.psbBp=new Biquad();   this.psbBp.bp(fs,P.psbBpHz,0.60);
    this.psbHp=new Biquad();   this.psbHp.hp(fs,320,0.707);
    this.psbShape=new Biquad();this.psbShape.bp(fs,620,0.55);
    this.outHp=new Biquad();   this.outHp.hp(fs,45,0.707);
    this.gsIntakeWaveHp=new Biquad(); this.gsIntakeWaveHp.hp(fs,120,0.707);

    this.turbZ=0; this.intakeZ=0; this.mechZ=0; this.brightZ=0; this.dcZ=0; this.dcAvg=0;
    this.brightA = 1-Math.exp(-2*Math.PI*5000/fs);
    this.turbA   = 1-Math.exp(-2*Math.PI*2000/fs);
    this.intkA   = 1-Math.exp(-2*Math.PI*11000/fs);
    this.mechA   = 1-Math.exp(-2*Math.PI*3000/fs);
    this.dcA     = 1-Math.exp(-2*Math.PI*12/fs);
    this.dcAvgA  = 1-Math.exp(-2*Math.PI*25/fs);
    this.flucA   = 1-Math.exp(-2*Math.PI*8/fs);
    this.flucZ   = 0;

    /* ---- アフターファイア（8ボイス、事前確保） ---- */
    this.afN=8;
    this.afOn=new Uint8Array(8); this.afT=new Float32Array(8); this.afG=new Float32Array(8);
    this.afF=new Float32Array(8); this.afTh=new Float32Array(8); this.afPh=new Float32Array(8);
    this.afLo=new Float32Array(8); this.afBa=new Float32Array(8); this.afCf=new Float32Array(8);
    this.afIdx=0; this.afBase=0.30; this.afCount=0;
    /* ★パイプバン専用のボイス（クラス1）。既存3車種はクラス0だけを通り、
       下の配列には一度も触れないので波形は1ビットも変わらない。
       Float64 なのは、アタック時間 0.0001 秒台を Float32 に丸めると
       立ち上がりが量子化されて帯域が動いてしまうため。 */
    this.afCls=new Uint8Array(8);
    this.afAtk=new Float64Array(8); this.afTauC=new Float64Array(8);
    this.afCf2=new Float64Array(8); this.afLo2=new Float64Array(8); this.afBa2=new Float64Array(8);
    /* 吸い込み */
    /* mode:'edge' を持つ車種だけ新実装（閉じエッジ＝拍）に入る。
       持たない車種は旧コードがそのまま動くので AT2_400 の回帰リスクはゼロ。 */
    this.KE = (P.suikomi && P.suikomi.mode==='edge') ? P.suikomi : null;
    const KE = this.KE;

    /* ---- 旧方式（AT2_400）用。新スキーマには noiseBpHz / burstDecMs が無いので
           必ず既定値で守る。ここを守らないと係数が NaN になり無音になる。 ---- */
    this.sk=0; this.skGate=0; this.skPeakRpm=0; this.skMuf=0;
    this.skHit=0; this.skAge=0; this.skN=0; this.thrClose=0;
    this.setTune(null);
    this.skEnv=new Float32Array(N); this.skEnvS=new Float32Array(N);
    this.skLo=0; this.skBa=0;
    this.skAtk=1-Math.exp(-1/(fs*0.0015));   // 1.5ms アタック
    {
      const nbp=(P.suikomi&&P.suikomi.noiseBpHz)||150;
      const bdec=(P.suikomi&&P.suikomi.burstDecMs)||34;
      this.skCf=2*Math.sin(Math.PI*nbp/fs);
      this.skPost=new Biquad(); this.skPost.bp(fs,nbp,1.1);
      this.skDec=Math.exp(-1/(fs*bdec*0.001));
    }

    /* ---- GS（AT2_180）：閉じエッジ検出と減速排気の状態 ---- */
    this.thrE=0; this.thrPkD=0; this.thrFlD=0; this.tFall=-1; this.sinceFire=9;
    this.phase=0; this.barHit=0; this.barAge=0; this.barBloom=0;
    this.barGateB=0; this.barTgtAmp=0; this.barAmp=0; this.barLvl=0;
    this.barPeakRpm=0; this.tailMode=0; this.beatOnClose=0; this.lastBang=0;
    this.barRun=0; this.exDuck=1;
    this.f1Cur = KE?KE.f1Open:320;
    this.hissZ=0; this.hissZ2=0; this.radZ=0; this.slamPh=0; this.slamT=9; this.slamG=0;
    this.barShape=0; this.slamArmed=0;
    this.barPk=0; this.flB=0; this.flL=0; this.flEnv=0; this.flNz=1;
    this.nZ=0; this.barTilt=1;
    this.cvSlide=0; this.coastVac=0; this.coastColor=0;
    this.preCharge=0; this.barCharge=0;
    /* V10 mean-value air/fuel states. They are updated only by V10/V11/V12,
       so allocating them here cannot change the accepted V1-V9 random stream or
       waveform. Pressure is stored as an atmospheric ratio; film is a normalized
       fuel mass whose outflow is film/tau. */
    this.gsManifoldDepression=0; this.gsManifoldPressure=1;
    this.gsFuelFilm=0; this.gsFuelDelivered=1; this.gsEquivalence=1;
    this.gsCombustionQuality=1; this.gsFuelDeposit=0;
    this.coastCycleColor=new Float32Array(N);
    this.coastCyclePressure=new Float32Array(N); this.coastCyclePressure.fill(1);
    this.coastBodyColor=0; this.coastNotchColor=0; this.coastRaspColor=0;
    this.coastOutletRelax=0; this.reopenT=0;
    /* V4+ study the field-reported pipe-length and outlet-restriction effect as
       a coherent round-trip reflection.  V1-V3 keep this path disabled, so
       filling the buffer cannot alter their output. */
    this.coastPipeD=2; this.coastPipeBuf=new Float32Array(2);
    this.coastPipeI=0; this.coastPipeLp=0; this.coastPipeFb=0; this.coastPipeGate=0;
    this.coastPipeSign=1;
    this.coastPipeMask=0; this.coastPipeThermal=0;
    this.coastPipeTempK=820; this.coastPipeDelayCur=2;
    this.coastPipeDelayTarget=2; this.coastPipeDelayStep=0;
    this.coastSecondaryBuf=new Float32Array(2); this.coastSecondaryMask=0;
    this.coastSecondaryI=0; this.coastSecondaryLp=0; this.coastSecondaryFb=0;
    this.coastSecondaryWallA=this.wallA;
    this.coastSecondaryDelayCur=2; this.coastSecondaryDelayTarget=2;
    this.coastSecondaryDelayStep=0; this.coastSecondarySign=-1;
    /* V13 termination transmission state.  The crossover splits transmitted
       pressure into the low path and the part dissipated by packing/perforates.
       It is allocated for every profile but is an exact no-op before V13. */
    this.exhaustHwLp=0; this.exhaustHwLpA=1;
    this.exhaustHwLowTx=1; this.exhaustHwHighTx=1;
    this.exhaustHwLowTxTarget=1; this.exhaustHwHighTxTarget=1;
    this.exhaustHwTxA=1-Math.exp(-1/(fs*0.020));
    this.exhaustStepR=0; this.exhaustOpenReturn=0;
    this.exhaustInsertLengthM=0; this.exhaustHwConfigured=0;
    /* V14 exhaust radiation state.  These states do not consume random input
       and are skipped completely by V1-V13, preserving the accepted renders. */
    this.exhaustShockPrev=0; this.exhaustShockLp=0;
    this.exhaustShockA=1-Math.exp(-2*Math.PI*6800/fs);
    this.exhaustShockGain=0; this.exhaustRadiationGain=1;
    this.exhaustRadiationLp=0;
    this.exhaustRadiationA=1-Math.exp(-2*Math.PI*520/fs);
    this.exhaustShell1=new Biquad(); this.exhaustShell2=new Biquad();
    this.exhaustShell3=new Biquad(); this.exhaustShellGain=0;
    const shellHz=KE&&KE.exhaustShellModesHzV14||[430,790,1510];
    const shellQ=KE&&KE.exhaustShellModesQV14||[3.4,4.2,5.4];
    this.exhaustShell1.bp(fs,shellHz[0],shellQ[0]);
    this.exhaustShell2.bp(fs,shellHz[1],shellQ[1]);
    this.exhaustShell3.bp(fs,shellHz[2],shellQ[2]);
    this.exhaustFieldBuf=new Float32Array(256);
    this.exhaustShellBuf=new Float32Array(256);
    this.exhaustFieldI=0;
    const groundMs=KE&&KE.exhaustGroundDelayMsV14||[1.14,1.27];
    this.exhaustGroundDelayL=Math.max(2,Math.min(250,Math.round(fs*groundMs[0]*0.001)));
    this.exhaustGroundDelayR=Math.max(2,Math.min(250,Math.round(fs*groundMs[1]*0.001)));
    /* V15 bidirectional collector network.  Earlier versions keep using the
       original round-trip comb buffers.  For V15, separate one-way delay lines
       preserve which cylinder a wave came from and which valve it returns to. */
    this.collectorScatterV15=!!(KE&&KE.collectorScatterV15);
    this.collectorPrimaryAreaV15=1;
    this.collectorTailAreaV15=1;
    this.collectorAreaSumV15=3;
    this.collectorJunctionLossV15=1;
    this.collectorRadiationTrimV15=1;
    this.collectorPrimaryForwardV15=[];
    this.collectorPrimaryReturnV15=[];
    this.collectorPrimaryIndexV15=new Int32Array(N);
    this.collectorPrimaryIncidentV15=new Float64Array(N);
    this.collectorPrimaryWriteV15=new Int32Array(N);
    this.collectorTailForwardV15=new Float32Array(2);
    this.collectorTailReturnV15=new Float32Array(2);
    this.collectorTailIndexV15=0;
    this.collectorTailRadiationLpV15=0;
    if(this.collectorScatterV15){
      const primaryDiameter=Math.max(18,KE.collectorPrimaryDiameterMmV15||38);
      const tailDiameter=Math.max(24,KE.collectorTailDiameterMmV15||58);
      this.collectorPrimaryAreaV15=primaryDiameter*primaryDiameter;
      this.collectorTailAreaV15=tailDiameter*tailDiameter;
      this.collectorAreaSumV15=N*this.collectorPrimaryAreaV15
          +this.collectorTailAreaV15;
      this.collectorJunctionLossV15=Math.max(0.80,Math.min(1,
          KE.collectorJunctionLossV15||1));
      this.collectorRadiationTrimV15=KE.collectorRadiationTrimV15||1;
      for(let k=0;k<N;k++){
        const d=Math.max(2,Math.round(fs*this.primL[k]/c));
        this.collectorPrimaryForwardV15.push(new Float32Array(d));
        this.collectorPrimaryReturnV15.push(new Float32Array(d));
      }
      const tailLength=P.collectorLenM+P.tailLenM;
      const tailD=Math.max(2,Math.round(fs*tailLength/c));
      this.collectorTailForwardV15=new Float32Array(tailD);
      this.collectorTailReturnV15=new Float32Array(tailD);
    }
    this.gsIntakeWaveBuf=new Float32Array(2); this.gsIntakeWaveMask=0;
    this.gsIntakeWaveI=0; this.gsIntakeWaveLp=0; this.gsIntakeWaveDc=0;
    this.gsIntakeWaveWallA=1-Math.exp(-2*Math.PI*4200/fs);
    this.gsIntakeWaveDcA=1-Math.exp(-2*Math.PI*90/fs);
    if(KE && KE.coastPipeV4){
      this.coastPipeD=Math.max(2,Math.round(2*fs*KE.coastPipeLenM/c));
      this.coastPipeBuf=new Float32Array(this.coastPipeD);
      this.coastPipeSign=KE.coastPipeSign||1;
      this.coastPipeDelay=(KE.coastPipeDelayMs||0)*0.001;
      this.coastPipeAtkA=1-Math.exp(-1/(fs*(KE.coastPipeAtkMs||2)*0.001));
      this.coastPipeRelA=1-Math.exp(-1/(fs*(KE.coastPipeRelMs||20)*0.001));
      if(KE.coastPipeThermalV7){
        const coeff=KE.coastPipeSoundCoeff||20.05;
        const hotK=KE.coastPipeHotK||820;
        const coldK=Math.max(293,KE.coastPipeOverrunK||620);
        this.coastPipeTempK=hotK;
        this.coastPipeDelayCur=2*fs*KE.coastPipeLenM/(coeff*Math.sqrt(hotK));
        this.coastPipeDelayTarget=this.coastPipeDelayCur;
        const maxPrimaryLen=KE.physicalTuneV9?0.724:KE.coastPipeLenM;
        const maxDelay=2*fs*maxPrimaryLen/(coeff*Math.sqrt(coldK));
        let capacity=8;
        while(capacity<Math.ceil(maxDelay)+8) capacity*=2;
        this.coastPipeBuf=new Float32Array(capacity);
        this.coastPipeMask=capacity-1;
      }
      if(KE.coastSecondaryV8){
        const coeff=KE.coastPipeSoundCoeff||20.05;
        const hotK=KE.coastPipeHotK||820;
        const coldK=Math.max(293,KE.coastPipeOverrunK||620);
        this.coastSecondaryDelayCur=2*fs*KE.coastSecondaryLenM
            /(coeff*Math.sqrt(hotK));
        this.coastSecondaryDelayTarget=this.coastSecondaryDelayCur;
        const maxSecondaryLen=KE.physicalTuneV9
            ? KE.coastSecondaryLenM+(0.724-KE.coastPipeLenM)
            : KE.coastSecondaryLenM;
        const maxDelay=2*fs*maxSecondaryLen/(coeff*Math.sqrt(coldK));
        let capacity=8;
        while(capacity<Math.ceil(maxDelay)+8) capacity*=2;
        this.coastSecondaryBuf=new Float32Array(capacity);
        this.coastSecondaryMask=capacity-1;
        this.coastSecondarySign=KE.coastSecondarySignV8||-1;
        this.coastSecondaryWallA=1-Math.exp(
            -2*Math.PI*(KE.coastSecondaryWallHzV8||P.wallHz||4200)/fs);
      }
    }
    if(KE && KE.transientMixtureV10){
      const intakeSoundSpeed=350;
      const delay=2*fs*(KE.intakeRunnerLenM10||0.22)/intakeSoundSpeed;
      let capacity=8;
      while(capacity<Math.ceil(delay)+8) capacity*=2;
      this.gsIntakeWaveBuf=new Float32Array(capacity);
      this.gsIntakeWaveMask=capacity-1;
      this.gsIntakeWaveDelay=delay;
    }
    this.amT=new Float32Array(N); this.amA=new Float32Array(N);
    this.prevUi=new Float32Array(N);
    this.hissHp=new Biquad(); this.helmBq=new Biquad(); this.tractBq=new Biquad();
    this.tract3Bq=new Biquad(); this.f1Bq=new Biquad(); this.f2Bq=new Biquad();
    this.coastBodyBq=new Biquad(); this.coastNotchBq=new Biquad();
    this.coastRaspBq=new Biquad(); this.coastPresenceBq=new Biquad();
    if(KE){
      this.hissHp.hp(fs,KE.hissHpHz,0.707);
      this.f2Bq.peak(fs,KE.f2Hz,KE.f2Q,KE.f2Db);   // F2 は固定なので一度だけ
      this.helmBq.bp(fs,KE.helmHz,KE.helmQ);       // ★Q で割らない（0dB正規化型）
      this.tract3Bq.bp(fs,KE.tract3Hz,KE.tract3Q);
      /* ★吸気管の1/4波長は「山」ではなく「谷」。口が圧力の節になるので外へ出ない。
         直列の負ピークで置く。開度で動く量ではないので係数は一度きり。 */
      this.tractBq.peak(fs,KE.tractHz,KE.tractQ,KE.tractDb);
      this.coastBodyBq.peak(fs,KE.coastBodyHz,KE.coastBodyQ,KE.coastBodyDb);
      this.coastNotchBq.peak(fs,KE.coastNotchHz,KE.coastNotchQ,KE.coastNotchDb);
      this.coastRaspBq.peak(fs,KE.coastRaspHz,KE.coastRaspQ,KE.coastRaspDb);
      if(KE.coastPresenceShelf) this.coastPresenceBq.hs(fs,KE.coastPresenceHz,1,KE.coastPresenceDb);
      else this.coastPresenceBq.peak(fs,KE.coastPresenceHz,KE.coastPresenceQ,KE.coastPresenceDb);
      this.hissA     = 1-Math.exp(-2*Math.PI*KE.hissLpHz/fs);
      this.radBarA   = 1-Math.exp(-2*Math.PI*KE.radCornerHz/fs);
      this.slamW     = 2*Math.PI*KE.slamHz/fs;
      this.lastBangG = Math.pow(10,KE.lastBangDb/20);
      this.exDuckG   = Math.pow(10,KE.exDuckDb/20);
      /* ---- フラッター共振器（Chamberlin SVF の帯域出力）----
         白色（分散1）を通したときの出力rms は sqrt(pi*fc*Q/fs)。
         逆数を掛けて rms=1 に正規化しておくと flDepth がそのまま変調の深さになる。 */
      this.flCf      = 2*Math.sin(Math.PI*KE.flHz/fs);
      this.flQi      = 1/KE.flQ;
      this.flNorm    = 1/Math.sqrt(Math.PI*KE.flHz*KE.flQ/fs);
      /* ---- 点火同期パルスの正規化 ----
         形 s=(4u(1-u))^2 は固定・幅もクランク角ドメインで固定なので、
         平均と二乗平均は定数で書ける。∫s du = 8/15、∫s^2 du = 256*B(5,5)。
         振幅は 0.85+0.30*rnd（平均1・分散 0.0075）。 */
      const amE1 = N*KE.amDuty*(8/15);
      const amE2 = N*KE.amDuty*0.40635*1.0075;
      this.amNorm    = 1/Math.sqrt(1+2*KE.amDepth*amE1+KE.amDepth*KE.amDepth*amE2);
      this.nLpA      = 1-Math.exp(-2*Math.PI*KE.nLpHz/fs);
    }else{
      this.hissA=0; this.radBarA=0;
      this.slamW=0; this.lastBangG=1; this.exDuckG=1;
      this.flCf=0; this.flQi=1; this.flNorm=0; this.amNorm=1; this.nLpA=0;
    }

    /* ---- 排気プリセット ---- */
    this.mufflerElems=2; this.gammaOut=0.68; this.brightMax=9000;
    this.raspDb=2.5; this.outTrim=1.0; this.afTarget=0.30; this.afVol=0.55;
    this.setMuffler(1);

    /* ---- 出力モード ---- */
    this.psbGain=P.psbGain; this.speakerMode=true; this.master=P.master||2.4;

    /* ---- 自動演奏（お手本） ---- */
    this.autoOn=false; this.autoT=0; this.autoLoop=1600; this.autoTrim=0; this.autoTrim2=0;
    this.autoOnsets=new Float32Array([0,400,600,800]); this.autoNum=4;
    this.autoPeakTarget=7800; this.autoLastPeak=7800; this.autoLastTrough=5500;
    this.autoPrevIdx=-1; this.autoCutMs=-1;

    /* ---- 計測 ---- */
    /* 拍の谷／山を判定するヒステリシス[rpm]。2ストは四循環失火で回転が細かく
       揺れるので、4スト用の70では1打を何度も数える（実測 8打→37打）。 */
    this.beatHys = P.beatHys || 70;
    this.rising=true; this.pkRpm=0; this.trRpm=0; this.lastPeak=0; this.lastTrough=0;
    this.beatN=0; this.beatPeak=0; this.beatTrough=0; this.stalledFlag=0;

        /* ---- 膨張室（チャンバー）層。P.chamber を持つ車種だけ有効。
           持たない既存3車種は CH=null で全経路がスキップされ、出力は不変。 ---- */
    const CH = this.CH = P.chamber || null;
    /* ---- 可変バルブ層。P.valveStage を持つ車種だけ有効。
           持たない既存4車種は VV=null で全経路がスキップされ、出力は不変。
       低回転で吸排の弁を1つずつ休ませ、ある回転から全弁に戻す機構。回転数が
       連続量のまま音色だけが段で飛ぶので、コールでは「跨ぐ／跨がない」が技になる。
       ★プリセット上段（valveOpenFrac / alphaOpen / chokeFrac）は全弁＝機構の
         公称値を書く。休止側は valveStage が持ち、vvS で両者を補間する。
         alphaClosed だけは触らない。631行の this.g1=P.g1/P.alphaClosed が
         起動時に焼き込んでいるうえ、閉弁は弁が何枚あろうと剛壁のままだからだ。 ---- */
    const VV = this.VV = P.valveStage || null;
    this.vvOn=0;                      // シュミットの状態。1で全弁側
    this.vvS =0;                      // 作動の進み具合 0〜1。control() が更新し render() が読む
    this.bodyOrder = P.bodyOrder || 2;
    this.sigma=0; this.onPipe=0; this.pipeHit=0; this.cD=0; this.cB=0;
    this.aLPd=0; this.aLPb=0;
    this.dr=0;                        // 供給空気（掃気）比。control() が更新し render() が読む
    /* ★3気筒は独立したチャンバーを3本持つ。既燃ガスの希釈も生ガスの溜まりも
       気筒ごとに独立していて位相同期しない。旧実装は pipeFuel を全気筒共有の
       スカラーにしていたので、1番の失火で溜めた生ガスを3番の点火が消費していた。 */
    this.resid   = new Float64Array(N).fill(1);
    this.pipeFuel= new Float64Array(N);
    this.mixFuel=1;                   // 燃調→パイプに入る生ガス量。setTune が上書きする
    if(CH){
      /* 数値ミスを「無音」ではなく「即エラー」にする。node tools/render.mjs で即座に出る */
      if(CH.LtM.length!==N)               throw new Error('chamber.LtM length != cylinders');
      if(CH.cDiff1+CH.cBaf1 > 0.90)       throw new Error('chamber loop gain budget > 0.90');
      const a0min = 20.05*Math.sqrt(CH.tMinK);          // 冷間の最長往復に合わせて確保
      this.chCap  = 4+Math.ceil(2*fs*Math.max.apply(null,CH.LtM)/a0min);   // 48kHz で 299
      this.chBuf=[]; this.chW=new Int32Array(N);
      for(let k=0;k<N;k++) this.chBuf.push(new Float32Array(this.chCap));
      /* バンの胴の励振。気筒ごとに独立（チャンバーは3本ある） */
      this.gOutS=1; this.radOutScale=1; this.tHotKEff=CH.tHotK;   // setTune 前の既定
      this.packLpHz=5600; this.packBangHf=Math.pow(10,-3/20); this.packTrim=1;
      this.bangBody=new Float64Array(N);
      this.bangBodyA=Math.exp(-1/(fs*CH.bangBodyTau));
      /* 胴は大容積の脈動なので、注入前に低域へ整形する。
         ★ただし出てくる音は低域だけにはならない。注入したエネルギーは遅延線を
           往復し、時変の弁反射 aV に掛かるたびに側帯波を作る。実測した胴のぶんの
           帯域分布は 40-300Hz -18.9dB / 1-2.5kHz -14.2dB で、むしろ中域が濃い。
           これは実機のチャンバーでも起きることだが、狙って作ったものではない。 */
      this.bangBodyLp=new Float64Array(N);
      this.bangBodyLpA=1-Math.exp(-2*Math.PI*CH.bangBodyHz/fs);
      this.setTune(this.tune);          // チャンバーが揃ったので出口の設定を確定させる
      this.chLpD=new Float32Array(N);   // ディフューザ帰還の壁面/コーン損失
      this.chLpB=new Float32Array(N);   // バッフルコーン帰還
      this.chDc =new Float32Array(N);   // スティンガによるDC抜き（DC極の発散も潰れる）
      this.dDiff=new Float32Array(N); this.dBaf=new Float32Array(N);
      this.chDcA=1-Math.exp(-2*Math.PI*25/fs);
      this.chG  =1/P.alphaClosed;       // 既存 g1 と同じ規約。閉ポート時の利得を cD/cB そのものに
      this.tPipe=CH.tInitK;
    }

    this.blockDt = 128/fs;
  }

    /* パルス包絡テーブル（x ∈ [0,2]、2*pw で十分ゼロへ落ちる）。
     attack_sec = A * pwSec が閉形式で成り立つので、A で立ち上がり時間を直接設計できる。 */
  buildEnv(A,t1,t2,m){
    const T=new Float32Array(this.ENV_N+1);
    for(let i=0;i<=this.ENV_N;i++){
      const u=(i/this.ENV_N)*2;
      T[i] = u<A ? 0.5*(1-Math.cos(Math.PI*u/A))
                 : (1-m)*Math.exp(-(u-A)/t1) + m*Math.exp(-(u-A)/t2);
    }
    return T;
  }

  /* ---- 高速乱数 ---- */
  rnd(){ let s=this.seed; s^=s<<13; s^=s>>>17; s^=s<<5; this.seed=s>>>0; return this.seed*2.3283064365386963e-10; }
  /* 一様乱数4本の和は分散 1/3。sd=1 にするため sqrt(3) を掛ける */
  gauss(){ return (this.rnd()+this.rnd()+this.rnd()+this.rnd()-2)*1.7320508; }

  setMuffler(m){
    const P=this.P; m=Math.max(0,Math.min(2,m|0)); this.muf=m;
    this.mufflerElems=Math.min(P.mufElemsByMuffler[m], this.mufL.length);
    this.gammaOut=P.gammaOutByMuffler[m];
    this.brightMax=P.brightMaxByMuffler[m];
    this.raspDb=P.raspDbByMuffler[m];
    this.outTrim=P.outTrimByMuffler[m];
    this.afTarget=P.afTargetByMuffler[m];
    this.afVol=P.afVolByMuffler[m];
    this.g2=P.g2ByMuffler[m];
    this.bodyHz=P.bodyHzByMuffler[m]; this.bodyQ=P.bodyQByMuffler[m]; this.bodyDb=P.bodyDbByMuffler[m];
    this.skMuf=P.suikomi ? P.suikomi.gainByMuffler[m] : 0;
    const KE=this.KE;
    this.coastPipeFb=(KE && KE.coastPipeV4
      ? (KE.coastPipeFeedback===undefined
          ? KE.coastPipeFeedbackByMuffler[m]
          : KE.coastPipeFeedback)
      : 0)*(this.gsOutletFeedbackScale||1);
    this.coastSecondaryFb=(KE && KE.coastSecondaryV8
      ? (KE.coastSecondaryFeedbackV8===undefined
          ? KE.coastSecondaryFeedbackByMufflerV8[m]
          : KE.coastSecondaryFeedbackV8)
      : 0)*(this.gsOutletFeedbackScale||1);
    this.radA=1-Math.exp(-2*Math.PI*P.radHzByMuffler[m]
        *(this.radOutScale||1)*(this.gsRadOutScale||1)/this.fs);
    if(KE && KE.exhaustHardwareV13){
      /* Plane-wave characteristic impedance is rho*c/A, therefore the
         pressure reflection at a sudden contraction is
         R=(A_upstream-A_insert)/(A_upstream+A_insert).  The three public
         choices now describe different hardware topologies, not different
         counts of the same synthetic resonator. */
      const bore=Math.max(10,Math.min(KE.exhaustEntranceMmV13||58,
          Number(this.tune&&this.tune.gsDiameter)||32));
      const entrance=KE.exhaustEntranceMmV13||58;
      const areaUpstream=entrance*entrance, areaInsert=bore*bore;
      const geometricR=Math.max(0,Math.min(0.92,
          (areaUpstream-areaInsert)/(areaUpstream+areaInsert)));
      const coupling=KE.exhaustNetworkCouplingV13||0.18;
      let stepR, openLoss, lowTx, highTx, crossoverHz, insertLength;
      if(m===0){
        /* A perforated straight core shares pressure with its surrounding
           packed cavity, so only part of the geometric step remains coherent. */
        stepR=geometricR*0.30;
        openLoss=0.56;
        lowTx=0.80; highTx=0.46; crossoverHz=1350;
        insertLength=KE.exhaustPackedLengthMV13||0.30;
      }else if(m===1){
        stepR=geometricR;
        openLoss=0.82;
        lowTx=0.70; highTx=0.58; crossoverHz=1050;
        insertLength=KE.exhaustBaffleLengthMV13||0.20;
      }else{
        stepR=0;
        openLoss=0.98;
        lowTx=1; highTx=1; crossoverHz=3200;
        insertLength=0;
      }
      if(KE.exhaustFieldV14 && m===0){
        /* A complete double-wall silencer is not merely four copies of one
           resonator.  The inner passage keeps an open return while pressure
           coupled through the annulus excites the outer shell.  Keep the
           dimensions generic and documented instead of naming a product. */
        stepR=geometricR*0.22;
        openLoss=0.72;
        lowTx=0.88; highTx=0.68; crossoverHz=1550;
        insertLength=KE.exhaustPackedLengthMV13||0.30;
      }
      this.mufflerElems=0;
      this.outTrim=1;
      this.trimScale=1;
      this.brightScale=1;
      this.bodyHz=0;
      this.exhaustStepR=stepR;
      this.exhaustOpenReturn=(1-stepR*stepR)*openLoss;
      this.exhaustHwLowTxTarget=lowTx;
      this.exhaustHwHighTxTarget=highTx;
      if(!this.exhaustHwConfigured){
        this.exhaustHwLowTx=lowTx;
        this.exhaustHwHighTx=highTx;
      }
      this.exhaustHwLpA=1-Math.exp(-2*Math.PI*crossoverHz/this.fs);
      this.exhaustInsertLengthM=insertLength;
      this.coastPipeSign=-1;
      this.coastPipeFb=coupling*this.exhaustOpenReturn;
      this.coastSecondarySign=1;
      this.coastSecondaryFb=coupling*stepR;
      this.gsSecondaryLenM=Math.max(0.08,
          (this.gsPipeLenM||KE.coastPipeLenM)-insertLength);
      this.coastSecondaryWallA=1-Math.exp(-2*Math.PI*2600/this.fs);
      const coeff=KE.coastPipeSoundCoeff||20.05;
      const secondaryTarget=2*this.fs*this.gsSecondaryLenM
          /(coeff*Math.sqrt(this.coastPipeTempK||KE.coastPipeHotK||820));
      this.coastSecondaryDelayTarget=secondaryTarget;
      if(!this.exhaustHwConfigured) this.coastSecondaryDelayCur=secondaryTarget;
      this.exhaustHwConfigured=1;
    }
    if(KE && KE.exhaustFieldV14){
      this.exhaustShockGain=KE.exhaustShockGainByMufflerV14[m];
      this.exhaustRadiationGain=KE.exhaustRadiationGainByMufflerV14[m];
      this.exhaustShellGain=KE.exhaustShellGainByMufflerV14[m];
    }
    this.rasp.peak(this.fs,P.raspHz,1.5,this.raspDb);
  }
  setSpeakerMode(on){ this.speakerMode=on; this.psbGain = on?this.P.psbGain:0.0; }
  setFuelSupply(v){
    const n=Number(v);
    this.fuelSupply=Number.isFinite(n)?Math.max(0,Math.min(1,n)):1;
  }

  /* ------------------------------------------------------------------
   * セッティング。当事者の言葉と DSP 係数を直接結びつける。
   *   燃調  薄い←→濃い  「濃くすると吸い込みが出る／回転落ちが鈍る」
   *                      「薄いと吹け上がりが鋭く、減速時のパンパンが増える」
   *   アイドル 低い←→高い 「アイドリングを極力低く落として全閉を作る」＝吸い込み度に最も効く
   *   出口   純正/ハス切り/詰め  バッフル穴径・テールパイプ長・ハス切りの加工度
   *   吸気   純正BOX/パワフィル/ファンネル  開けるほど吸気音が出るが濃くしないと薄側にズレる
   * これがそのまま将来のカスタム（部品の組み合わせ）の土台になる。
   * ------------------------------------------------------------------ */
  setTune(t){
    const T=this.tune=Object.assign({
      mix:1, idle:1, outlet:0, intake:0, pack:1,
      gsPilot:200, gsIdle:1150, gsSlide:110,
      gsAirbox:0, gsPipe:574, gsDiameter:32,
      gsBore:67, gsCompression:9.1,
      gsCamSpec:1, gsCarbSpec:1
    }, t||{});
    const KE=(this.P.suikomi && this.P.suikomi.mode==='edge')?this.P.suikomi:null;
    const physical=!!(KE&&KE.physicalTuneV9);
    this.tqScale    = [0.97,1.00,0.96][T.mix];    // 薄すぎ・濃すぎはどちらも落ちる
    this.pumpScale  = [1.06,1.00,0.88][T.mix];    // 濃いと回転落ちが鈍る
    this.afScale    = [1.70,1.00,0.55][T.mix];    // 薄いと減速時のパンパンが増える
    /* ★2ストの燃調は掃気置換率 σ を変えない。置換される「量」は差圧で決まるので、
       失火周期 n は動かない。動くのはパイプに入る生ガスの濃さ＝1発の重さと頻度。
       濃い → 平衡値が可燃上限側へ寄る → 頻度が落ちて1発が重い（ボコッ）
       薄い → 下限側 → 小さいのが高頻度（パパパ）
       実車の証言がそのまま可燃限界窓モデルから出るので、ここが検証にもなる。
       afScale は4ストのオーバーラン経路にしか効かず、チャンバー車では死んでいた。 */
    this.mixFuel    = [0.80,1.00,1.28][T.mix];
    this.skMix      = [0.40,1.00,1.55][T.mix];    // 濃いほど吸い込む
    this.bleedScale = [0.90,1.00,1.10][T.idle];
    this.skIdle     = [1.45,1.00,0.55][T.idle];   // アイドルが低いほど全閉が深く吸う
    this.skOut      = [0.55,1.00,1.35][T.outlet];
    this.brightScale= [0.85,1.00,1.20][T.outlet];
    this.trimScale  = [0.90,1.00,1.12][T.outlet];

    /* V9 maps each control to a component that can be adjusted on the real
       carburetor or exhaust. Defaults below reproduce the V8 component values;
       only the target idle bleed is solved from the torque balance equation. */
    this.gsCvRiseMs=KE?KE.cvRiseMs:45;
    this.gsCvFallMs=KE?KE.cvFallMs:110;
    this.gsPipeLenM=KE&&KE.coastPipeLenM?KE.coastPipeLenM:0.574;
    this.gsSecondaryLenM=KE&&KE.coastSecondaryLenM?KE.coastSecondaryLenM:1.076;
    this.gsOutletFeedbackScale=1;
    this.gsRadOutScale=1;
    this.gsPressureGain=KE&&KE.coastPressureGain!==undefined?KE.coastPressureGain:1;
    this.gsOutletRelaxBrightDb=KE?(KE.coastOutletRelaxBrightDb||0):0;
    this.gsIntakeOpen=0;
    this.gsJetRatio=1;
    this.gsBoreMm=65;
    this.gsCompressionRatio=9.0;
    this.gsDisplacementCc=398.20;
    this.gsDisplacementScale=1;
    this.gsCompressionPressureScale=1;
    this.gsTorqueScale=1;
    this.gsPulseSourceScale=1;
    this.gsCamSpec=0;
    this.gsCarbSpec=0;
    this.gsExhaustCamHeightMm=36.10;
    this.gsExhaustValveFlowScale=1;
    this.gsNeedleJetStepMm=0;
    this.gsNeedleMeterScale=1;
    if(physical){
      const quant=(value,min,max,step,def)=>{
        const number=Number(value), finite=Number.isFinite(number)?number:def;
        return min+Math.max(0,Math.min(Math.round((max-min)/step),
            Math.round((finite-min)/step)))*step;
      };
      T.gsPilot=quant(T.gsPilot,175,250,25,200);
      T.gsIdle=quant(T.gsIdle,850,1450,50,1150);
      T.gsSlide=quant(T.gsSlide,70,170,10,110);
      T.gsAirbox=quant(T.gsAirbox,0,100,10,0);
      T.gsPipe=quant(T.gsPipe,424,724,10,574);
      T.gsDiameter=quant(T.gsDiameter,22,42,1,32);
      if(KE.boreDisplacementV11){
        T.gsBore=quant(T.gsBore,65,69,2,65);
        T.gsCompression=quant(T.gsCompression,9.0,10.5,0.05,9.0);
        const stroke=KE.gsStrokeMmV11||60;
        const baseBore=KE.gsBaseBoreMmV11||65;
        const baseCompression=KE.gsBaseCompressionV11||9.0;
        const gamma=KE.gsCompressionGammaV11||1.32;
        this.gsBoreMm=T.gsBore;
        this.gsCompressionRatio=T.gsCompression;
        this.gsDisplacementCc=Math.PI*T.gsBore*T.gsBore*stroke*2/4000;
        this.gsDisplacementScale=Math.pow(T.gsBore/baseBore,2);
        this.gsCompressionPressureScale=Math.pow(T.gsCompression/baseCompression,gamma);
        /* Ideal-Otto efficiency is used only for the torque consequence. The
           acoustic source follows displaced mass and compression pressure,
           then still passes through the existing valve and pipe network. */
        const eta=1-Math.pow(T.gsCompression,1-gamma);
        const etaBase=1-Math.pow(baseCompression,1-gamma);
        this.gsTorqueScale=this.gsDisplacementScale*(eta/etaBase);
        this.gsPulseSourceScale=Math.sqrt(
            this.gsDisplacementScale*this.gsCompressionPressureScale);
      }
      if(KE.factoryHeadV12){
        T.gsCamSpec=quant(T.gsCamSpec,0,1,1,1);
        T.gsCarbSpec=quant(T.gsCarbSpec,0,1,1,1);
        this.gsCamSpec=T.gsCamSpec;
        this.gsCarbSpec=T.gsCarbSpec;
        const gs400Cam=KE.gs400ExhaustCamHeightMmV12||36.10;
        const gs425Cam=KE.gs425ExhaustCamHeightMmV12||36.797;
        this.gsExhaustCamHeightMm=T.gsCamSpec?gs425Cam:gs400Cam;
        /* Service data publish total lobe height, not base-circle diameter.
           Use the directly observed height ratio as a conservative valve-flow
           ratio rather than fabricating a much larger lift difference. */
        this.gsExhaustValveFlowScale=this.gsExhaustCamHeightMm/gs400Cam;
        this.gsNeedleJetStepMm=T.gsCarbSpec
            ? (KE.gsNeedleJetStepMmV12||0.005) : 0;
        /* Mikuni's Y-6 is one 0.005 mm metering step above Y-5. The OEM 4F24
           needle dimensions are not published in the current Mikuni chart, so
           the bounded 0.91% factory-calibration ratio is used only across the
           1/4-3/4-slide window; endpoints remain controlled by pilot/main. */
        this.gsNeedleMeterScale=T.gsCarbSpec
            ? (KE.gsNeedleMeterScaleV12||1.0091) : 1;
      }

      const intakeOpen=T.gsAirbox/100;
      const fuelBalance=(T.gsPilot-200)/50-0.72*intakeOpen;
      const leanExcess=Math.max(0,-fuelBalance-0.42);
      const richExcess=Math.max(0,fuelBalance-0.72);
      const mixtureQuality=Math.max(0.68,Math.min(1.18,
          1+0.16*fuelBalance-0.48*leanExcess*leanExcess
            -0.34*richExcess*richExcess));

      /* Pilot mixture changes combustion and pumping on the following coast;
         it does not directly multiply an arbitrary audio band. */
      this.tqScale=Math.max(0.90,1-0.045*Math.pow(Math.abs(fuelBalance),1.35));
      this.pumpScale=Math.max(0.82,Math.min(1.18,1-0.10*fuelBalance));
      this.afScale=Math.max(0.55,Math.min(1.70,1-0.55*fuelBalance));
      this.gsPressureGain=(KE.coastPressureGain||1)*mixtureQuality;
      /* V10 uses the same hardware controls as V9, but needs their mixture
         consequence before the X-tau film. Candidate A (#22.5 with a 60%
         opening) stays close to unity instead of becoming a hidden gain preset. */
      this.gsJetRatio=Math.max(0.72,Math.min(1.32,
          1+0.14*((T.gsPilot-200)/25)-0.24*intakeOpen));

      /* At the requested idle target p=0.5. Solve the closed-throttle torque
         balance for bleed area instead of treating the RPM label as an EQ. */
      this.idleRpm=T.gsIdle;
      const loss=this.fricC+this.fricK*this.idleRpm
          +this.pumpK*this.pumpScale*this.gsDisplacementScale*this.idleRpm;
      const available=Math.max(0.1,
          this.torqueWOT(this.idleRpm)*this.tqScale*this.gsTorqueScale);
      const targetBleed=Math.pow(loss/available,2);
      this.bleedScale=Math.max(0.55,Math.min(1.55,targetBleed/this.nominalBleed));

      /* The same diaphragm orifice affects both directions, but the spring-led
         return is the dominant user control. */
      this.gsCvFallMs=T.gsSlide;
      this.gsCvRiseMs=KE.cvRiseMs*Math.sqrt(T.gsSlide/110);
      this.gsIntakeOpen=intakeOpen;
      this.gsPipeLenM=T.gsPipe/1000;
      this.gsSecondaryLenM=KE.coastSecondaryLenM
          +(this.gsPipeLenM-KE.coastPipeLenM);
      const diameterRatio=T.gsDiameter/32;
      this.gsOutletFeedbackScale=Math.max(0.72,Math.min(1.38,
          Math.pow(1/diameterRatio,0.78)));
      this.gsRadOutScale=1/diameterRatio;
      this.gsOutletRelaxBrightDb=(KE.coastOutletRelaxBrightDb||0)
          *Math.max(0.72,Math.min(1.28,diameterRatio));
    }else{
      this.idleRpm=this.nominalIdleRpm;
    }
    /* ★2ストの「出口」はスティンガ（テールパイプ）の径。4ストのバッフルとは別物で、
       音量・低域・同調回転数を同時に動かす。細いほど排気が抜けにくく管内に熱が
       こもるので音速が上がり、同調回転数が上がる。管長は変わらないのに音程が動く。
       時定数 τ = V/(A·c) なので、細いほど直流が抜けにくくバンの尾が伸びる。 */
    /* ★chBuf の有無で「チャンバーの初期化が済んでいるか」を見る。コンストラクタは
       setTune(null) をチャンバー構築より前に呼ぶので、ここを無条件に通すと
       this.muf が undefined のまま setMuffler に渡って別のマフラーになる。
       構築の最後でもう一度 setTune を呼び直して確定させている。 */
    if(this.CH && this.chBuf){
      const CH=this.CH, a=[0.78,1.00,1.30][T.outlet];
      this.chDcA   = 1-Math.exp(-2*Math.PI*25*Math.pow(a,1.5)/this.fs);
      this.tHotKEff= CH.tHotK*(1+CH.stingHeatK*(1/a-1));
      this.gOutS   = [0.88,1.00,1.14][T.outlet];
      /* ★radA は setMuffler も書く。呼び順が保証されないので、倍率だけ持たせて
         両方から同じ式で引き直す。片方に書き込むと「マフラーを変えたら
         出口の設定が消える」が起きる。 */
      this.radOutScale = [1.13,1.00,0.88][T.outlet];
      /* 詰め物＝サイレンサーの吸音材。多孔質の吸音率は周波数が上がるほど高いので、
         減るのは常に高域で、基本周波数（rpm/20 Hz）は動かない。「音程は同じなのに
         別物」という実車の証言がそのままモデルになる。
         ★これはバンを目立たせる／埋もれさせるを手で体験できる唯一のツマミでもある。
           300〜1500Hz のマスカ濃度を直接動かすため。 */
      this.packLpHz    = [2600,5600,12000][T.pack];
      this.packBangHf  = Math.pow(10,[-9.0,-3.0,0.0][T.pack]/20);
      this.packTrim    = [0.86,1.00,1.12][T.pack];
      this.setMuffler(this.muf);
    }
    this.intakeScale= [0.60,1.35,2.20][T.intake];
    /* ---- 新方式（mode:'edge'）専用のスケーラ ----
       既存の skOut[0.55,1.00,1.35] は AT2_400 の旧経路が使うのでそのまま残す。
       既定は muffler:1 / outlet:0 なので skMuf 0.90 × skOut 0.55 = 0.495 と
       二重に半減し、ユーザーが最初に聴く状態で吸い込みが痩せる。
       新方式だけ 0.80 に圧縮してこれを回避する（「出口」は音色を変えるツマミであって
       ゲートではない）。 */
    {
      this.skOutE   = physical ? KE.gainByOutlet[0]
                    : KE ? KE.gainByOutlet[T.outlet] : [0.80,1.00,1.25][T.outlet];
      this.skMixE   = physical ? 1 : KE ? KE.gainByMix[T.mix] : this.skMix;
      this.skIdleE  = physical ? 1 : KE ? KE.gainByIdle[T.idle] : this.skIdle;
      this.skIntake = physical ? 1+0.18*this.gsIntakeOpen
                    : KE ? KE.gainByIntake[T.intake] : 1;
      this.radShelf = physical ? Math.pow(10,(-1+5*this.gsIntakeOpen)/20)
                    : KE ? Math.pow(10, KE.radDbByIntake[T.intake]/20) : 1;
    }
    /* ファンネルは薄側にズレるので、濃くしていないとパンパンが増える */
    if(T.intake>T.mix) this.afScale *= 1+(T.intake-T.mix)*0.45;
    if(physical && Number.isInteger(this.muf)) this.setMuffler(this.muf);
  }

  setPattern(onsets, loopMs){
    this.autoOnsets=Float32Array.from(onsets); this.autoNum=onsets.length;
    this.autoLoop=loopMs; this.autoT=0; this.autoTrim=0; this.autoTrim2=0; this.autoPrevIdx=-1;
  }

  ignite(){ this.running=true; this.starter=1.4; if(this.rpm<80) this.rpm=80; this.stallT=0; this.clLock=1; }
  kill(){ this.running=false; this.starter=0; }

  torqueWOT(n){
    if(n<=0) return 0;
    const top=this.TQN*1000;
    if(n>=top) return Math.max(0, this.TQ[this.TQN]*(1-(n-top)/2000));
    const i=Math.min(this.TQN-1,(n/1000)|0), f=(n-i*1000)/1000;
    return this.TQ[i]+(this.TQ[i+1]-this.TQ[i])*f;
  }

  /* ---------------------------------------------------------------
   * 制御レート（128サンプルに1回）で物理を1ステップ進める
   * -------------------------------------------------------------*/
  control(dt){
    /* --- お手本の自動演奏。トラフのアクセル開度を積分制御で追い込み、
           狙った回転域に居座らせる（実機の音職人が全閉にしないのと同じ） --- */
    let thrRaw=this.inThr, clRaw=this.inCl;
    /* 握られたままのクラッチで始動させない。starter は n>idleRpm で切れるので、
       アイドルに届いた瞬間に同じ負荷（0.72 なら 33.6N·m）が復活して即エンストする。
       アイドルの余力は 0.24N·m しかないため、キーを何度押しても同じ長さで死ぬ＝詰む。
       一度離すまで切った扱いにすれば詰みだけが消え、意図した半クラでのエンストは残る。
       ★autoOn より前に置くこと。後ろに置くとお手本の機械が出すクラッチまで殺す。 */
    if(this.clLock){ if(clRaw<0.06) this.clLock=0; else clRaw=0; }
    if(this.autoOn){
      this.autoT += dt*1000;
      if(this.autoT>=this.autoLoop) this.autoT-=this.autoLoop;
      let i=0;
      for(let k=this.autoNum-1;k>=0;k--){ if(this.autoT>=this.autoOnsets[k]){ i=k; break; } }
      const t0=this.autoOnsets[i];
      const t1=(i+1<this.autoNum)?this.autoOnsets[i+1]:this.autoLoop;
      const u=(this.autoT-t0)/Math.max(1,(t1-t0));
      if(i!==this.autoPrevIdx){
        if(this.autoPrevIdx>=0){
          /* 制御するのは「クラッチを当てる深さ」。山が目標より高ければ深く当て、
             低ければ浅くする。単調な負帰還で、しかも山の絶対値を錨にしているので
             発散しない。谷の開度を制御対象にすると、速い譜面で山が届かない
             →谷の目標も下がる、の正帰還になって回転が落ち続けエンストする。 */
          const eP=(this.autoLastPeak-this.autoPeakTarget)/4000;
          this.autoTrim=Math.max(-0.40,Math.min(0.40,this.autoTrim+Math.max(-0.055,Math.min(0.055,eP))));
        }
        this.autoPrevIdx=i; this.autoCutMs=-1;
      }
      /* 半クラは「谷の間ずっと当てる」のではなく 30〜70ms の短い一撃。
         当てっぱなしにすると 1打あたり 1,400rpm 以上ドリフトして必ずエンストする
         （実機の音職人がスロットルを全閉にせず短くクラッチを切るのはこのため）。 */
      const gap=Math.max(60,t1-t0);
      const riseMs=gap*0.40;
      const biteMs=Math.max(30,Math.min(70,gap*0.25));
      const ms=this.autoT-t0;
      const bite=Math.max(0.15,Math.min(0.95,0.55+this.autoTrim));
      /* 谷の開度は回転域で決まる固定値（制御しない）。7,800rpm では摩擦もポンピング
         ロスも大きいぶんトルクも出るため、4,500rpm と同じ開度では回転が落ちない。
         ここを2本目の制御ループにすると山側のループと綱引きになって両方が
         下限に張り付くので、素直に回転域の関数にする。全閉にはしない。
         ★下限 0.16 を車種ごとに開こうとして失敗した記録（2026-08-02）。
           0.72-rpm*0.000068 は 8,235rpm で床と交差するので、目標がそれより上の
           車種では床が常時効く。「だから床を下げれば谷が深くなる」と考えて
           0.08 を与えたが、実測は逆だった。autoTrim はこの領域で既に下限
           -0.40 に張り付いていて制御ループが飽和しているため、床を下げたぶんが
           そのまま運転域の低下になる。目標9,500で「タタタンタン」を流すと
           山が 8,885→8,250rpm に落ち、可変バルブの切替点 8,500 に届かなくなった
           （谷は55セント深くなるだけ）。床は回転域ではなく「エンストしない開度」で
           決まっているので、高回転車でも 0.16 のままが正しい。 */
      /* ★谷は全車種とも本当の全閉にする。元の式は「狙う回転が高いほど谷の開度を低く」
         する向きだが物理と逆で、高い回転を保つほど摩擦もポンピングも大きい。
         5車種×回転域3×譜面4＝60通りの実測で、全閉が全指標で最良だった:
           拍が立たない組み合わせ 2→0 ／ 音程差の中央値 234c→287c ／ 山の誤差 28→20rpm
         3発の「速い刻み」が低・中回転で死んでいたのはこれが原因（利用者報告5）。 */
      const trough=0;
      /* 狙った回転に達したら時間を待たずに切る。実際の乗り手と同じ挙動で、
         これが無いと開ける時間が固定になり遅い譜面ほど吹け上がりすぎる */
      if(this.autoCutMs<0 && (ms>=riseMs || this.rpm>=this.autoPeakTarget)) this.autoCutMs=ms;
      if(this.autoCutMs<0)              { thrRaw=1.0;    clRaw=0.0;  }
      else if(ms<this.autoCutMs+biteMs) { thrRaw=trough; clRaw=bite; }
      else                              { thrRaw=trough; clRaw=0.0;  }
      /* お手本が絶対にエンストしないための保険 */
      if(this.rpm<2200){ thrRaw=1.0; clRaw=0.0; }
    }

    /* --- 入力平滑化（キャブ車 8ms） --- */
    const aT=1-Math.exp(-dt/this.thrTau), aC=1-Math.exp(-dt/this.clTau);
    this.thrS += (thrRaw-this.thrS)*aT;
    this.clS  += (clRaw -this.clS )*aC;
    /* A carburetor does not switch from perfect mixture to silence in one sample.
       The short lag lets the final bowlful produce irregular catches before starvation. */
    this.fuelS += (this.fuelSupply-this.fuelS)*(1-Math.exp(-dt/0.12));

    /* --- 加速ポンプ：開けた瞬間だけ濃くなる。コールの「キレ」の正体 --- */
    const dThRaw=(thrRaw-this.thrPrev)/dt;
    const dTh=Math.max(0,dThRaw);
    this.thrClose=Math.max(0,-dThRaw);   // 閉じ速度 [1/s]。吸い込みの拍はここで立つ
    this.thrPrev=thrRaw;
    this.accelPump=Math.max(this.accelPump*Math.exp(-dt/this.apTau), Math.min(1,dTh/12));

    const n=this.rpm;

    if(!this.running && this.rpm<=0){ this.rpm=0; }

    /* --- トルク項 --- */
    const bleed=this.bleed*this.bleedScale;
    const tEff=bleed+(1-bleed)*this.thrS;
    const p=0.5+1.5*Math.max(0,Math.min(1,(n-this.idleRpm)/(this.maxRpm-this.idleRpm)));
    let tEng=0;
        if(this.running && !this.cut){
          tEng=this.torqueWOT(n)*this.tqScale*Math.pow(tEff,p)
              *(1+this.apGain*this.accelPump);
          if(this.gsTorqueScale!==1) tEng*=this.gsTorqueScale;
        }
    /* 同調（パイプに乗る）ぶんの充填効率。Σ はアイドル(ρ=0.18)で厳密に0なので、
       閉形式で解いたアイドル平衡・安定条件には一切干渉しない。 */
    if(this.CH) tEng *= (1 + this.CH.torqueGain*this.sigma);
    /* 全弁になると充填効率が上がる。sigma と同じくここは1ブロック(2.67ms)前の値を
       読むが、作動そのものが数十msかかる機構なので、その遅れは埋もれる。 */
    if(this.VV) tEng *= (1 + this.VV.torqueGain*this.vvS);
    /* Average torque falls with mixture supply; individual combustion misses are applied below
       at firing events so the run-down sounds lumpy instead of becoming a smooth fade. */
    if(this.fuelS<0.999999){
      const fp=Math.max(0,Math.min(1,(this.fuelS-0.02)/0.98));
      tEng*=Math.pow(fp,1.15);
    }
    if(this.starter>0){ tEng+=13; this.starter-=dt; if(n>this.idleRpm) this.starter=0; }

    const tFric=this.fricC+this.fricK*n;
    let tPump=this.pumpK*this.pumpScale*(1-this.thrS)*n;
    if(this.gsDisplacementScale!==1) tPump*=this.gsDisplacementScale;

    /* --- クラッチ負荷。engage^1.5 が「浅く当てて撫でる／深く当てて切る」の両立点 --- */
    let tCl=0;
    /* 始動中はクラッチを切った扱いにする。実車では1速のままセルは回せないが、
       ゲームでは「始動ボタンが無反応」に見えて詰むだけなので自動で切る */
    if(this.gear!==0 && this.starter<=0){
      const engage=this.clS;
      if(engage>0.001 && n>10){
        tCl=this.clutchC*Math.pow(engage,this.clutchP);
        if(this.inBrake<0.25) tCl*=0.15;   // 車体が前に出てしまいクラッチ容量を使い切れない
      }
    }

    let sum=tEng-tFric-tPump-tCl;
    if(!this.running) sum=-tFric-tCl;

    /* ★パイプバンは回転に結線しない。旧実装は clamp の後で nn に直接足していて
       積分を迂回し、全閉で回転が落ちず（-213rpm/1.8秒）、アイドルを下げるほど
       回転が上がる（低い1709 / 標準1626 / 高い1533rpm）という逆流を作っていた。
       トルク収支に移せば積分は通るが、それでも誤り。バンは排気ポートより下流の
       チャンバー内の燃焼で、ピストンを押さないからだ。実際に結線すると
       回転↑→失火↑→生ガス↑→バン↑→回転↑ の正帰還でアイドルが 8,800rpm まで
       暴走することを実測した。
       「1回転で+500〜700rpm」という実測が指しているのは、何度も失火したあとに
       筒内でようやく着火した1発のほう。そちらは fire=true の通常燃焼が担当する。 */

    let dn=(sum/this.J)*9.5493*dt;
    dn=Math.max(-160,Math.min(160,dn));
    let nn=n+dn;
    if(nn<0) nn=0;

    /* --- レブリミッター：ヒステリシス無しだとブザーになる --- */
    if(!this.cut && nn>=this.cutOn) this.cut=true;
    if(this.cut && nn<=this.cutOff) this.cut=false;
    this.cutRatio=this.cut?1:Math.max(0,Math.min(1,(nn-this.cutOff)/(this.cutOn-this.cutOff)));

    /* --- Stall / temporary anti-stall --- */
    /* The fixed 72% tap clutch can cross the stall threshold in roughly 130ms,
       which made ordinary attempts look like input failures. Until stall is
       reintroduced as an optional, clearly taught mechanic, automatically
       disengage the clutch and give the engine a short starter assist. */
    if(this.running && nn<this.stallRpm && this.starter<=0 && sum<0){
      /* The teaching-oriented anti-stall remains active for clutch mistakes, but fuel
         starvation must still end in a real stall after the final irregular catches. */
      if(this.allowStall || this.fuelS<0.03){
        this.stallT+=dt;
        if(this.stallT>0.08){ this.running=false; this.stalledFlag=1; }
      }else{
        this.stallT=0;
        this.clLock=1;
        this.starter=0.15;
      }
    } else this.stallT=0;

    /* --- アフターファイア判定 --- */
    const dnDt=dn/dt;
        this.overrun = (this.thrS<0.10 && nn>3500 && dnDt<-1500);

    /* ============================================================
     * 膨張室（チャンバー）層の制御。P.chamber を持つ車種だけ。
     *   Σ = 同調度。ρ = rpm/N_t、N_t = a0*θep/(12*Lt)。
     *   往復遅れ[crank deg] = f*θep*ρ という恒等式から、バンドの上下限が
     *   ρ という無次元1本で書ける：
     *     下限 ρ>0.41 … ディフューザ負圧が掃気開(EPO+20度)に間に合う
     *     上限 ρ<1.14 … バッフル正圧が排気閉(EPO+160度)を越えない
     * ============================================================ */
    if(this.CH){
      const CH=this.CH;
      /* 管内ガス温度。2ストは1回転で管内が総入れ替えされるので、戻すと秒オーダーで
         冷える（肉厚の4スト集合管では起きない）。管長は不変のまま N_t が下がり、
         全共鳴が -361 セント（-3.6半音）下がる＝「戻すと音がドロッと重くなる」。 */
      const tTgt = CH.tCoolK + (this.tHotKEff-CH.tCoolK)
                 * (0.32+0.68*Math.pow(this.thrS,0.7)) * (0.88+0.12*this.sigma);
      this.tPipe += (tTgt-this.tPipe)*(1-Math.exp(-dt/CH.tTauSec));
      const a0 = 20.05*Math.sqrt(this.tPipe);

      /* 窓関数＋シュミット（乗ったら ρ で 0.035＝約250rpm 粘る）＋非対称スルー */
      const rho = nn/(a0*CH.thetaEp/(12*CH.LtRefM));
      const sh  = this.onPipe ? -CH.rhoHyst : 0;
      const s01 = x=>{ x=x<0?0:(x>1?1:x); return 0.5*(1-Math.cos(Math.PI*x)); };
      /* ★同調は回転数だけでは決まらない。混合気が入っていなければ排気の圧力波が
         立たないので、パイプには乗らない。ここに吸気量を掛けないと、アクセルを
         閉じても sigma=1.0 のまま torqueGain が効き続け、全閉でトルクが正になって
         回転が落ちなくなる（実測: 6000rpm 全閉で +6.33Nm）。
         全閉でも bleed ぶんは流れるので 0 にはせず、床を残す。 */
      const chg = CH.chargeFloor + (1-CH.chargeFloor)*Math.pow(this.thrS, CH.chargeP);
      const sg  = s01((rho-(CH.rOnLo +sh))/(CH.rOnHi -CH.rOnLo ))
                * (1-s01((rho-(CH.rOffLo+sh))/(CH.rOffHi-CH.rOffLo)))
                * chg;
      if(!this.onPipe && sg>0.55){ this.onPipe=1; this.pipeHit=1; }   /* ★乗った瞬間 */
      if( this.onPipe && sg<0.30)  this.onPipe=0;
      this.sigma += (sg-this.sigma)
                  * (1-Math.exp(-dt/((sg>this.sigma)?CH.tauOnSec:CH.tauOffSec)));
      this.pipeHit *= Math.exp(-dt/CH.hitTauSec);

      /* タップ位置[sample]。管長は不変で、a0 が動くと全ディレイが伸びる */
      const lim=this.chCap-3;
      for(let k=0;k<this.N;k++){
        let dF=2*this.fs*CH.LtM[k]/a0; if(dF>lim) dF=lim;
        this.dDiff[k]=CH.fDiff*dF; this.dBaf[k]=CH.fBaf*dF;
      }

      /* Σ→係数。★cD/cB は β そのものではなく「分布反射(0.10〜0.65Lt≒88クランク度)を
         2タップに束ねたときの取りこぼし」の補正。低振幅では束ねきれず、高振幅では
         有限振幅波の先鋭化で束が締まる。比は1.6倍までに留め、音量とトルクの主役は
         loadGain / torqueGain（充填効率＝物理）側に置く（二重計上を避ける）。 */
      const s=this.sigma;
      this.cD = -(CH.cDiff0+(CH.cDiff1-CH.cDiff0)*s);
      this.cB = +(CH.cBaf0 +(CH.cBaf1 -CH.cBaf0 )*s);
      this.aLPd = 1-Math.exp(-2*Math.PI*(CH.lpDiff0+(CH.lpDiff1-CH.lpDiff0)*s)/this.fs);
      this.aLPb = 1-Math.exp(-2*Math.PI*(CH.lpBaf0 +(CH.lpBaf1 -CH.lpBaf0 )*s)/this.fs);

      /* チョーク窓はスロットル依存。全閉モータリングでは筒内圧が臨界圧力比 1.83 に
         届かないのでチョークせず、ポートは開いた瞬間から開放になる。 */
      this.choke = this.P.chokeFrac*Math.sqrt(Math.max(0.06,this.thrS));

      /* 掃気効率 SE。四循環(four-stroking)の素。
         ★分子は thrS ではなく bleed 込みの供給空気。thrS だけだとアイドルで必ず
           閾値を割り、常時失火になる。全閉では1サイクルあたりの掃気空気が
           回転数に反比例して減るので、bleed 側にだけ 1/rpm を掛ける。 */
      this.dr = bleed*Math.min(1, CH.drRefRpm/Math.max(600,nn)) + (1-bleed)*this.thrS;

    }

    if(this.VV){
      const VV=this.VV, P=this.P;
      /* しきい値を素で跨がせない。コールは毎打この付近を上下するので、単純な
         比較にすると毎秒6回トグルして「段」ではなくビリつきになる。実機の機構も
         一度上がると油圧が抜けるまで粘るので、ヒステリシスは物理そのもの。 */
      const on = this.vvOn ? (nn > VV.offRpm) : (nn > VV.onRpm);
      this.vvOn = on ? 1 : 0;
      /* 上がりと下がりで速さが違う（油圧の立ち上がりと抜けは非対称）。ここを
         対称にすると「開けたときは段が出るのに戻すと出ない」という実機と逆の
         挙動になる。同時に、この時定数がクリック防止も兼ねている。 */
      const tau = on ? VV.tauOnSec : VV.tauOffSec;
      this.vvS += ((on?1:0)-this.vvS)*(1-Math.exp(-dt/tau));

      /* 弁が2枚休んでいる間は実効ポート面積が半分になる。カムの開弁期間は
         機構として不変だが、ここで動かしている vOpen / choke は
         「音響的に開いているとみなせる窓」であって、それは面積で決まる。
         面積が半分なら窓は縮み、チョーク区間は伸びる。全弁側（プリセット上段）
         へ vvS で寄せる。 */
      const s=this.vvS;
      this.vOpen = VV.valveOpenFrac2 + (P.valveOpenFrac - VV.valveOpenFrac2)*s;
      this.aOpen = VV.alphaOpen2     + (P.alphaOpen     - VV.alphaOpen2    )*s;
      this.choke = VV.chokeFrac2     + (P.chokeFrac     - VV.chokeFrac2    )*s;
    }

    /* 吸い込み */
    const K=this.P.suikomi, KE=this.KE;

    if(KE){
      /* ============================================================
       * 閉じエッジは減速排気状態の開始点だけを決める。
       * 音そのものは render() で実回転の180°/540°排気パルスから作る。
       *
       * 回転落下量でゲートするのが原理的に不可能である根拠：
       *   J=0.021, fricC=1.70, fricK=0.00092, pumpK=0.0010 から
       *   ニュートラル惰行は 5000rpm で約 -5,100rpm/s。
       *   6打/秒の全閉窓 90ms では 460〜580rpm（≒1.7半音）しか落ちない。
       * ============================================================ */
      this.sinceFire += dt;        /* ★これを忘れると minGapMs の条件が永久に偽になり
                                       拍が1発しか出ない。実装時に最も脱落しやすい1行。 */

      /* 検出専用の速い平滑。thrS(τ=10ms) はキャブスライドの機械遅れであって
         乗り手の手ではないので、検出には使わない。 */
      this.thrE += (thrRaw-this.thrE)*(1-Math.exp(-dt/(KE.thrEmsMs*0.001)));

      /* しきい値は実際に使われている振り幅に追従させる。
         固定値だと速い連打で振りが浅くなったときに打が抜ける。 */
      const relax=dt/KE.spanRelaxSec;
      this.thrPkD=Math.max(this.thrE, this.thrPkD-relax);
      this.thrFlD=Math.min(this.thrE, this.thrFlD+relax);
      /* ★床が「開けっ放しの値」まで登り切ると span が spanFloor(0.25) まで潰れ、
         そこから全閉にしても spanMin(0.30) を超えられず、一発も鳴らない。
         実測：全開を 0.45 秒以上保ってから戻すと吸い込みが完全に無音になる。
         soundcheck の overrun ケース（「全開→全閉。吸い込みが出る」）が
         減速排気の色変化へ一度も入っていなかったのはこれが理由。
         床は「山から spanMin だけ下」までしか上がれないようにする。 */
      this.thrFlD=Math.min(this.thrFlD, this.thrPkD-KE.spanMin);
      const span =Math.max(KE.spanFloor, this.thrPkD-this.thrFlD);
      const armT =this.thrFlD+span*KE.armFrac;
      const fireT=this.thrFlD+span*KE.fireFrac;

      if(this.phase===0){
        if(this.thrE>armT)     this.tFall=-1;   // 開いている＝落ちていない
        else if(this.tFall<0)  this.tFall=0;    // armT を割った瞬間＝落ち始め
        else                   this.tFall+=dt;

        if(this.thrE<fireT && this.tFall>=0
           && this.tFall<KE.fallMaxMs*0.001     // ゆっくり戻したら鳴らない
           && span>KE.spanMin
           && nn>KE.onRpm                       // 回転はここでしか見ない＝「エンストしていない」
           && this.sinceFire>KE.minGapMs*0.001){
          /* ---------------- 減速排気状態の開始 ---------------- */
          const fall=Math.max(0.001,this.tFall);
          const spd=Math.max(0,Math.min(1,
              (KE.fallFullMs*0.001-fall)/((KE.fallFullMs-KE.fallMinMs)*0.001)));
          const dep=Math.max(0,Math.min(1, span/KE.depthFull));
          this.barHit=Math.max(KE.hitFloor, spd*0.65+dep*0.35);
          this.barCharge=KE.coastTemporalV3
              ? Math.max(0,Math.min(1,this.preCharge))
              : 1;
          this.phase=1; this.barAge=0; this.sinceFire=0; this.tFall=-1;
          this.reopenT=Math.max(KE.reopenMin,armT);
          this.barPeakRpm=nn; this.tailMode=0;
          /* 状態は必ず0から立て直す＝「1閉じ＝1発」の保証。
             旧実装は sk>0.02 の間じゅう毎点火で再トリガしていたので対応が崩れていた。
             ★ただし撃つのは「ン」が明けてから。閉じた瞬間に撃つと穴が埋まる。 */
          this.slamT=9; this.slamPh=0; this.slamG=this.barHit; this.slamArmed=1;
          this.barPk=1;
          this.lastBang=1;      // 次の点火1発だけ濃くする（加速ポンプ残り）
          this.beatOnClose=1;   // 拍カウンタへ通知
        }
      }else{
        this.barAge+=dt;
        if(nn>this.barPeakRpm) this.barPeakRpm=nn;
        /* 復帰は「開け直し」だけ。再発火するには必ず一度 phase=0 に戻る必要があるので
           多重発火が構造的に起きない。 */
        /* armT adapts downward while the throttle remains shut, so using it here
           eventually looks like a reopen even at zero input. Keep the threshold
           captured at the closing edge until the rider actually opens again. */
        if(this.thrE>this.reopenT){ this.phase=0; this.tFall=-1; }
        if(this.barAge>KE.tailOnMs*0.001) this.tailMode=1;   // フレーズ終端
        if(nn<this.idleRpm+KE.offRpmMargin) this.phase=0;    // エンスト保険
      }

      /* The gas column follows load much faster than the steel wall.  This
         state therefore represents only effective gas replacement/cooling.
         Pressure is intentionally absent: ideal-gas sound speed depends on
         temperature, while back pressure belongs in impedance and flow. */
      if(KE.coastPipeThermalV7){
        const target=this.phase?1:0;
        const tau=(target>this.coastPipeThermal
            ? KE.coastPipeCoolTauMs : KE.coastPipeReheatTauMs)*0.001;
        this.coastPipeThermal+=(target-this.coastPipeThermal)
            *(1-Math.exp(-dt/tau));
        const hotK=KE.coastPipeHotK;
        this.coastPipeTempK=hotK+(KE.coastPipeOverrunK-hotK)*this.coastPipeThermal;
        this.coastPipeDelayTarget=2*this.fs*this.gsPipeLenM
            /((KE.coastPipeSoundCoeff||20.05)*Math.sqrt(this.coastPipeTempK));
        if(KE.coastSecondaryV8){
          this.coastSecondaryDelayTarget=2*this.fs*this.gsSecondaryLenM
              /((KE.coastPipeSoundCoeff||20.05)*Math.sqrt(this.coastPipeTempK));
        }
      }

      /* The BS34 is a constant-depression carburetor: the rider closes the
         downstream butterfly immediately, while the diaphragm piston returns
         through its spring/orifice dynamics. Model those as two separate states.
         Their temporary mismatch controls manifold depression; it is not an
         invented phoneme envelope. */
      const slideTarget=Math.sqrt(Math.max(0,this.thrS))*Math.min(1,nn/3600);
      const slideTau=(slideTarget>this.cvSlide?this.gsCvRiseMs:this.gsCvFallMs)*0.001;
      this.cvSlide+=(slideTarget-this.cvSlide)*(1-Math.exp(-dt/slideTau));

      const rpmLife=Math.max(0,Math.min(1,
          (nn-(this.idleRpm+KE.offRpmMargin))/KE.rpmSpan));
      /* A useful suction call needs energy prepared before the hand closes.
         Integrate the open-throttle charge instead of treating a shallow tap
         and a held 7,000 rpm pull as the same event.  Capture it at the edge so
         the following coast is causal and cannot grow after the throttle is
         already shut. */
      if(KE.coastTemporalV3){
        const chargeTarget=Math.pow(Math.max(0,this.thrS),0.65)*rpmLife;
        const chargeTau=(chargeTarget>this.preCharge?KE.chargeRiseMs:KE.chargeFallMs)*0.001;
        this.preCharge+=(chargeTarget-this.preCharge)*(1-Math.exp(-dt/chargeTau));
      }
      if(KE.transientMixtureV10){
        /* Mean-value filling/emptying. Piston demand removes the fraction of
           atmospheric mass still present in the runner; the butterfly refills
           the missing fraction. This is the normalized mass balance
             dD/dt = pump*(1-area)*(1-D) - fill*area*D,
           where D=1-p_manifold/p_atmosphere. It gives a finite pressure build
           and recovery without a hand-authored "suction" envelope. */
        const throttleArea=Math.max(0.012,Math.min(1,
            bleed+(1-bleed)*Math.pow(Math.max(0,this.thrS),0.72)));
        const slideFlow=0.35+0.65*Math.sqrt(Math.max(0,this.cvSlide));
        const pumpRate=(KE.manifoldPumpRateV10||18)
            *(0.42+0.58*rpmLife)*(0.68+0.32*this.cvSlide);
        const fillRate=(KE.manifoldFillRateV10||55)*slideFlow;
        let depression=this.gsManifoldDepression;
        const pistonDemand=KE.boreDisplacementV11
            ? pumpRate*this.gsDisplacementScale : pumpRate;
        depression+=dt*(pistonDemand*(1-throttleArea)*(1-depression)
            -fillRate*throttleArea*depression);
        depression=Math.max(0,Math.min(0.965,depression));
        this.gsManifoldDepression=depression;
        this.gsManifoldPressure=1-depression;

        /* Aquino X-tau fuel transport. A fraction X of the carbureted fuel
           wets the port; film/tau returns later. Air charge responds with the
           manifold, so a fast closure naturally produces a temporary rich
           excursion instead of an arbitrary one-shot "last bang" gain. */
        const airCharge=Math.max(0.035,
            this.gsManifoldPressure*slideFlow*(0.30+0.70*rpmLife));
        const deposit=Math.max(0.10,Math.min(0.50,
            (KE.fuelFilmDepositV10||0.28)+0.12*depression-0.08*rpmLife));
        /* Reduced absolute pressure promotes evaporation; the short separate
           GS carb-to-port paths also justify a lower deposited fraction than a
           long central manifold. Keep X inside the experimentally used
           0.1-0.5 range and shorten, never lengthen, tau as pressure falls. */
        const filmTau=Math.max(0.10,(KE.fuelFilmTauSecV10||0.25)
            *(1-0.35*depression)*(1-0.18*rpmLife));
        /* Needle and needle-jet area govern roughly the middle half of slide
           travel. Fade the verified GS425 calibration to zero at both ends so
           it cannot replace the independent pilot or main circuits. The CV
           slide lags the rider's hand, therefore this prepared fuel reaches the
           X-tau film before and just after closure by the same causal path. */
        const needlePhase=Math.max(0,Math.min(1,(this.cvSlide-0.18)/0.64));
        const needleWindow=Math.sin(Math.PI*needlePhase);
        const needleMeter=1+(this.gsNeedleMeterScale-1)*needleWindow;
        const fuelCommand=airCharge*this.gsJetRatio*needleMeter;
        const evaporation=this.gsFuelFilm/filmTau;
        this.gsFuelFilm+=dt*(deposit*fuelCommand-evaporation);
        this.gsFuelFilm=Math.max(0,Math.min(1.2,this.gsFuelFilm));
        this.gsFuelDelivered=(1-deposit)*fuelCommand+evaporation;
        this.gsFuelDeposit=deposit;
        const equivalenceTarget=Math.max(0.55,Math.min(1.75,
            this.gsFuelDelivered/airCharge));
        this.gsEquivalence+=(equivalenceTarget-this.gsEquivalence)
            *(1-Math.exp(-dt/0.010));
        const mixtureError=(this.gsEquivalence-1.03)/0.42;
        this.gsCombustionQuality=Math.max(0.10,
            Math.exp(-mixtureError*mixtureError));

        const vacTarget=this.phase ? depression*rpmLife : 0;
        const vacTau=(vacTarget>this.coastVac?0.008:KE.vacuumRelMs*0.001);
        this.coastVac+=(vacTarget-this.coastVac)*(1-Math.exp(-dt/vacTau));
      }else{
        const vacTarget=this.phase
            ? (KE.vacuumFloor+(1-KE.vacuumFloor)*this.cvSlide)
              * (1-this.thrS)*rpmLife
            : 0;
        const vacTau=(vacTarget>this.coastVac?KE.vacuumAtkMs:KE.vacuumRelMs)*0.001;
        this.coastVac+=(vacTarget-this.coastVac)*(1-Math.exp(-dt/vacTau));
      }
      /* Source medians have different time courses: presence peaks near 90 ms,
         the 250 Hz body near 145 ms, while the 500 Hz notch persists.  A
         squared gamma pulse gives zero at closure, one at its measured peak,
         and a controlled tail without adding a phoneme oscillator. */
      if(KE.coastTemporalV2 && this.phase){
        const pAge=Math.max(0,this.barAge-KE.coastPresenceDelayMs*0.001);
        const pX=pAge/(KE.coastPresencePeakMs*0.001);
        const pBurst=pX>0 ? pX*pX*Math.exp(2*(1-pX)) : 0;
        const pFloor=1-Math.exp(-pAge/(KE.coastPresenceAtkMs*0.001));
        this.coastColor=KE.coastPresenceFloor*pFloor
                       +(1-KE.coastPresenceFloor)*pBurst;
        const bAge=Math.max(0,this.barAge-KE.coastBodyDelayMs*0.001);
        const bX=bAge/(KE.coastBodyPeakMs*0.001);
        const bBurst=bX>0 ? bX*bX*Math.exp(2*(1-bX)) : 0;
        const bFloor=1-Math.exp(-bAge/(KE.coastBodyAtkMs*0.001));
        this.coastBodyColor=KE.coastBodyFloor*bFloor
                           +(1-KE.coastBodyFloor)*bBurst;
        this.coastNotchColor=1-Math.exp(-this.barAge/(KE.coastNotchAtkMs*0.001));
        const rAge=Math.max(0,this.barAge-KE.coastRaspDelayMs*0.001);
        this.coastRaspColor=1-Math.exp(-rAge/(KE.coastRaspAtkMs*0.001));
      }else if(KE.coastTemporalV2){
        this.coastColor=0; this.coastBodyColor=0; this.coastNotchColor=0; this.coastRaspColor=0;
      }else{
        this.coastColor=this.phase
            ? KE.coastColorFloor+(1-KE.coastColorFloor)
              * Math.exp(-this.barAge/(KE.coastColorTauMs*0.001))
            : 0;
        this.coastBodyColor=this.phase?1:0;
        this.coastNotchColor=this.phase?1:0;
        this.coastRaspColor=0;
      }
      this.barShape=this.coastVac;
      this.barGateB=this.coastVac;
      this.barLvl = KE.gain*this.skMuf*this.skMixE*this.skIdleE*this.skOutE*this.skIntake
                  * (0.35+0.65*rpmLife);
      const prepared=KE.coastTemporalV3
          ? KE.chargeFloor+(1-KE.chargeFloor)*this.barCharge
          : 1;
      this.barTgtAmp = this.barHit*prepared*this.coastVac;
      /* 「バ」の破裂は穴が明けた瞬間に1回だけ。
         ★明るさの山も同じ瞬間から始める。閉じた瞬間から始めると「ン」の 70ms で
           先に減衰してしまい、破裂の頭がいちばん暗いという逆の形になる。
           実車の「バ」の頭（0-20ms）は 4kHz が +3.8dB で、20-45ms のピーク +5.2dB の
           わずか 1.4dB 下＝ほぼ最初から明るい。無声破裂音は高域が先行する。 */
      if(this.slamArmed && this.coastVac>0.02){
        this.slamArmed=0; this.slamT=0; this.slamPh=0; this.barTilt=KE.tiltHi;
      }

      /* ---- F1 のスルー（フィルタ係数はブロックレート更新で十分） ---- */
      const f1T=KE.f1Open+(KE.f1Close-KE.f1Open)*this.barGateB;
      this.f1Cur += (f1T-this.f1Cur)*(1-Math.exp(-dt/(KE.f1SlewMs*0.001)));

      /* ---- 排気ダック。loadGain は thrS 追従の連続関数なのでエッジが立たない。
              閉じエッジ専用の速いダックを別に持つ。 ---- */
      const dTgt=1.0;
      const dTau=(dTgt<this.exDuck?KE.exDuckAtkMs:KE.exDuckRelMs)*0.001;
      this.exDuck += (dTgt-this.exDuck)*(1-Math.exp(-dt/dTau));

      /* 未燃ガスは有限。吸い込みが強いときは吐き（アフターファイア）を抑える */
      if(this.barGateB>0.02) this.afBase*=(1-0.5*this.barGateB);
    }

    /* 旧方式（AT2_400）。ここから下は一切変更しない */
    if(K && !KE){
      /* 拍は「アクセルを戻した瞬間」に立つ。回転の落下率で待つと大きく回転を
         落とさないと鳴らず、拍にならない（＝以前の実装の誤り）。
         「急激に戻すと鳴る／ゆっくり戻すと鳴らない」の証言どおり、
         閉じ速度そのものを引き金にし、強さも閉じ速度に比例させる。 */
      if(this.thrClose>K.closeRate && nn>K.onRpm && !this.skGate){
        this.skGate=1;
        this.skPeakRpm=Math.max(nn,this.rpmPrev||nn);
        this.skHit=Math.min(1, this.thrClose/K.closeFull);
        this.skAge=0;
      }
      if(this.skGate){
        this.skAge+=dt;
        /* 終了条件に**平滑後の開度を使ってはいけない**。戻し始めた瞬間に拍が立つのに
           そのとき thrS はまだ高く、次のステップで即座に閉じてしまう。
           結果「速く戻すほど鳴らない」という証言と真逆の挙動になる（実測で確認）。
           終わるのは「開け直した」＝スロットルが再び上昇に転じたとき。 */
        if(dThRaw>1.0 || nn<this.idleRpm+K.offRpmMargin || this.skAge>K.maxSec) this.skGate=0;
      }
      const tgt = this.skGate
        ? Math.min(1, K.gain*this.skMuf*this.skMix*this.skIdle*this.skOut*this.skHit
                      /* 閾値ぎりぎりでも 45% は出す。0 から立ち上げると
                         4,200rpm で 6% にしかならず、実機のタップでは無音に聞こえる。
                         当事者証言も「4千回転から吸い込む」＝そこで既に鳴る、である */
                      *Math.min(1, 0.45+0.55*(this.skPeakRpm-K.onRpm)/K.rpmSpan)) : 0;
      /* 吐きは「点」、吸いは「線」。擬音が タン/パン に対して ンーバー と
         長音符を伴うのはこのため。立ち上がりは速く、減衰は長い */
      const tau = (tgt>this.sk) ? K.atkMs*0.001 : K.relMs*0.001;
      this.sk += (tgt-this.sk)*(1-Math.exp(-dt/tau));
      /* 「ン」＝全閉直後に管内が負圧化して排気の抜けが止まる区間。
         無音ではなく、こもった低い音。バーの手前に短く置く */
      this.skN = this.skGate ? Math.max(0, 1-this.skAge/(K.nMs*0.001)) : 0;
      /* 未燃ガスは有限。吸い込みが強いときは吐き（アフターファイア）を抑える */
      if(this.sk>0.02) this.afBase*=(1-0.5*this.sk);
    }
    this.afBase += (this.afTarget*this.afScale-this.afBase)*0.25*Math.min(1,dt/0.0027);

    /* --- 拍検出 ---
       吐き（4発／2発）は「開けた瞬間」＝回転の谷→立ち上がりが拍。
       吸い込み（180度）は「戻した瞬間」が拍なので control 側の閉じエッジで数える。
       山谷は表示用に追い続け、1打ごとにリセットする。
       autoLastPeak / autoLastTrough も必ず更新すること。ここを落とすと
       お手本自動演奏のクラッチ深さ制御（autoTrim の積分）が eP=0 固定で開ループ化する。 */
    if(this.P.beatOn==='close'){
      if(this.trRpm<=0) this.trRpm=nn;
      if(nn>this.pkRpm) this.pkRpm=nn;
      if(nn<this.trRpm) this.trRpm=nn;
      if(this.beatOnClose){
        this.beatOnClose=0;
        this.beatN++;
        this.beatPeak=this.pkRpm;      this.beatTrough=this.trRpm;
        this.autoLastPeak=this.pkRpm;  this.autoLastTrough=this.trRpm;
        this.pkRpm=nn; this.trRpm=nn;  // 次の打のために窓をリセット
      }
    }else if(this.rising){
      if(nn>this.pkRpm) this.pkRpm=nn;
      if(nn<this.pkRpm-this.beatHys){ this.rising=false; this.trRpm=nn; this.lastPeak=this.pkRpm; }
    }else{
      if(nn<this.trRpm) this.trRpm=nn;
      if(nn>this.trRpm+this.beatHys){
        this.rising=true; this.pkRpm=nn;
        this.beatN++; this.beatPeak=this.lastPeak; this.beatTrough=this.trRpm;
        this.autoLastPeak=this.lastPeak; this.autoLastTrough=this.trRpm;
      }
    }

    this.rpmPrev=n; this.rpm=nn;
    return nn;
  }

  /* ---------------------------------------------------------------
   * サンプルループ
   * -------------------------------------------------------------*/
  render(out, n, outR){
    const fs=this.fs;
    let i=0;
    while(i<n){
      const blk=Math.min(128, n-i);
      const r0=this.rpm;
      const r1=this.control(blk/fs);
      const dR=(r1-r0)/blk;

      const P=this.P;
      const t=this.thrS;
      const KE=this.KE;
      /* 排気の負荷ゲイン。旧実装は全閉で 0.25（-12.04dB）まで落ち、しかも thrS 追従の
         連続関数なのでエッジにトランジェントが立たない（実測でも閉じた瞬間は
         「立ち上がる」どころか下がっていた）。
         床を 0.45 に上げ、代わりに 12ms のエッジを持つ exDuck を掛ける。
         定常全閉は 0.45*10^(-5/20) = 0.2530（-11.93dB）＝現行と 0.1dB 差なので、
         全体の音量バランスは変えずにエッジだけを手に入れる。 */
      const lf=KE?KE.loadFloor:0.25;
      let loadGain=(lf+(1-lf)*Math.pow(t,0.7))*(KE?this.exDuck:1);
      let intakeGain=(P.intakeGainA+P.intakeGainB*Math.pow(t,1.5))*this.intakeScale;
      let mechGain=(0.90+0.10*t)*P.mechGain*(this.mechRpmK?Math.pow(r1/6000,this.mechRpmK):1);
      /* 「ン」を埋めないための同じエッジダック。排気に使っている exDuck をそのまま流用する。
         定常全閉（オーバーラン）では exDuck=1 に戻るので広帯域の床はそのまま残る。 */
      if(KE && P.mechDuck) mechGain*=1-P.mechDuck*(1-this.exDuck);
      let turbAmt=0.10+0.35*t;
            let wDeg=P.wDegBase - P.wDegThrSpan*t;
      const inF=P.intakeFrac||0.25;          // 項目6が使う。4ストの既定は 180度/720度
      let envMix=0;
      /* ※ 直前の3行も const → let にする：
         let loadGain=(lf+(1-lf)*Math.pow(t,0.7))*(KE?this.exDuck:1);
         let intakeGain=(P.intakeGainA+P.intakeGainB*Math.pow(t,1.5))*this.intakeScale;
         let turbAmt=0.10+0.35*t; */
      if(this.CH){
        const CH=this.CH, s=this.sigma;
        wDeg      -= CH.wDegSigma*s;                       // 波面が締まる
        turbAmt   += CH.turbSigma*s;
        intakeGain*= 1+CH.intakeSigma*s;
        /* 音量の主役はここ。充填効率（delivery ratio）が上がるのが物理の実体で、
           反射係数を振って稼ぐのではない。pipeHit は「乗った瞬間」の一撃。 */
        loadGain  *= (1+CH.loadSigma*s)*(1+CH.onsetKick*this.pipeHit);
        this.rasp.peak(fs,P.raspHz,1.5,this.raspDb+CH.raspSigmaDb*s);
        envMix=s;
        /* ★立ち上がりの下限を3サンプルにクランプする。これ未満だとレイズドコサインが
           1サンプルに潰れ、サブサンプル位相ジッタで超高域が回転数依存に暴れる。
           48kHz/8,500rpm で aMin=0.145 に対し envA2=0.150 ＝ ほぼ不発、
           44.1kHz では aMin=0.158 で軽く効く（＝レート間の保険として正しく働く）。 */
        const pwB=Math.max(P.pwMinSec,Math.min(P.pwMaxSec, wDeg/(6*Math.max(300,r1))));
        const aMin=3/(fs*pwB);
        const aEff=P.envA+(CH.envA2-P.envA)*envMix;
        if(aEff<aMin) envMix=Math.max(0,(aMin-P.envA)/(CH.envA2-P.envA));
      }
      if(this.VV){
        const VV=this.VV, s=this.vvS;
        /* 全弁になると実効ポート面積が倍になり、ブローダウンが速く終わる。
           圧力波が立ち上がる区間が短くなる＝波面が締まる。
           これが「段」の中身で、点火の間隔は変わらないので音程は1セントも動かない。 */
        wDeg      -= VV.wDegStep*s;
        loadGain  *= 1+VV.loadStep*s;
        this.rasp.peak(fs,P.raspHz,1.5,this.raspDb+VV.raspStepDb*s);
        envMix=s;
        /* 立ち上がりの下限を3サンプルにクランプする。理由は上の CH 側と同じだが、
           こちらはレッドが 12,750rpm あるぶん先に当たる。ここを書かないと
           高回転側でだけ超高域がサブサンプル位相ジッタで暴れる。 */
        const pwB=Math.max(P.pwMinSec,Math.min(P.pwMaxSec, wDeg/(6*Math.max(300,r1))));
        const aMin=3/(fs*pwB);
        const aEff=P.envA+(VV.envA2-P.envA)*envMix;
        if(aEff<aMin) envMix=Math.max(0,(aMin-P.envA)/(VV.envA2-P.envA));
      }
      const satDrive=1.0+2.5*t;
      /* 吸い込み中は高域が失われて「こもる」。ブライトネスを引き下げ、管のQを上げる */
      const sk=this.sk, K=P.suikomi;
      let bFc=Math.min(this.CH ? Math.min(this.brightMax,this.packLpHz)*this.brightScale : this.brightMax*this.brightScale,
                       (P.bFcBase||1800) + (P.bFcThr||6500)*t
                       + (this.CH ? this.CH.bFcSig*this.sigma : 0));
      if(KE && this.barAmp>8e-4){
        const coastOpen=Math.min(1,this.barAmp*this.barLvl*2.8)*this.coastColor;
        bFc+=(KE.coastBrightHz-bFc)*coastOpen;
      }
      let g1=this.g1, g2=this.g2, bodyDb=this.bodyDb;
      /* ★新方式では brightness / bodyDb に一切触らない。
         旧実装は bFc を brightHz(300Hz) へ引き下げ、さらに skN で ×(1-0.45) と
         二重に暗くしていた＝/a/ ではなく /u/ を強めており、閉じても「ブー」のまま。
         これが「拍ではなく余韻に聞こえる」最大の原因だった。
         「バー」は F1 を 320→760Hz へ上げることで作る（BAR層側）。 */
      if(K && !KE && sk>0.001){
        /* 管の帰還を一律に上げると 2発の管共鳴（274/463Hz）が持ち上がって
           「こもる」はずが逆に明るくなる（実測 400Hz で +28.8dB）。
           帰還は触らず、缶のヘルムホルツを持ち上げてブライトネスを深く落とす。 */
        bFc = bFc + (K.brightHz - bFc)*Math.min(1,sk*1.6);
        bFc = bFc*(1 - 0.45*this.skN);      // 「ン」の区間はさらに深くこもらせる
        bodyDb = bodyDb + K.bodyBoostDb*sk*1.6;
      }
      if(this.bodyHz>0) this.body.peak(fs,this.bodyHz,this.bodyQ,bodyDb);
      /* ---- BAR層（吸い込み）のブロックレート更新 ---- */
      let barAtkA=0, barRelA=0;
      if(KE){
        this.f1Bq.peak(fs,this.f1Cur,KE.f1Q,KE.f1Db);   // 320 → 760Hz を 18ms でスルー中
        if(KE.coastTemporalV2){
          /* Once the trapped high-momentum slug has cleared, the termination
             approaches its low-flow reflection state.  Drive the transition
             from closure age so it cannot anticipate the rider or continue
             after reopening. */
          this.coastOutletRelax=KE.coastOutletRelaxV5 && this.phase
              ? 1-Math.exp(-this.barAge/(KE.coastOutletRelaxTauMs*0.001))
              : 0;
          const relax=this.coastOutletRelax;
          this.coastBodyBq.peak(fs,KE.coastBodyHz,KE.coastBodyQ,
                                KE.coastBodyDb*this.coastBodyColor);
          this.coastNotchBq.peak(fs,KE.coastNotchHz,KE.coastNotchQ,
                                 KE.coastNotchDb*this.coastNotchColor);
          this.coastRaspBq.peak(fs,KE.coastRaspHz,KE.coastRaspQ,
                                KE.coastRaspDb*this.coastRaspColor);
          if(KE.coastPresenceShelf){
            this.coastPresenceBq.hs(fs,KE.coastPresenceHz,1,
                                    KE.coastPresenceDb*this.coastColor
                                    +this.gsOutletRelaxBrightDb*relax);
          }else{
            this.coastPresenceBq.peak(fs,KE.coastPresenceHz,KE.coastPresenceQ,
                                      KE.coastPresenceDb*this.coastColor
                                      +this.gsOutletRelaxBrightDb*relax);
          }
        }
        /* ★このファイルの Biquad.bp() は b0=α / a0=1+α の 0dB ピーク正規化型。
           Q で割ってはいけない（割ると -17dB 沈んで「シャー」になる）。
           tractBq は開度で動かないのでコンストラクタで一度きり（371Hz の谷）。 */
        /* ★これは音楽的な立ち上がりではなく、制御レート(2.667ms)の段差を消すための
           デジッパーである。ここに atkMs を入れると barShape の立ち上がりと二重に
           掛かって実効2倍鈍る。実車の「バ」は検出点から 20ms 以内にほぼ full まで
           来る（4kHz が 0-20ms で +3.8dB、20-45ms のピーク +5.2dB の 1.4dB 下）。 */
        barAtkA=1-Math.exp(-1/(fs*0.0025));
        barRelA=1-Math.exp(-1/(fs*KE.relMs*0.001));
      }
      this.brightA=1-Math.exp(-2*Math.PI*bFc/fs);
      this.formant.peak(fs,P.formantHz,2.0,2+4*t);
      const alive=(this.running||r1>60)?1:0;
      const mechAmN=this.mechAmN, mechAmW=this.mechAmW, mechAm1=1-this.mechAm, mechAmD=this.mechAm*this.mechAmN;
      this.coastPipeDelayStep=KE && KE.coastPipeThermalV7
          ? (this.coastPipeDelayTarget-this.coastPipeDelayCur)/blk : 0;
      this.coastSecondaryDelayStep=KE && KE.coastSecondaryV8
          ? (this.coastSecondaryDelayTarget-this.coastSecondaryDelayCur)/blk : 0;

      for(let s=0;s<blk;s++){
        const rpm=r0+dR*s;
        const cycInc=rpm/(this.cyclesPerMin*fs);
        this.cycPhase+=cycInc; if(this.cycPhase>=1) this.cycPhase-=1;

        /* 回転ムラ：低回転ほど大きい。「エンジンが息づいている」帯域 */
        this.flucZ += this.flucA*((this.rnd()*2-1)-this.flucZ);
        const fluc=this.flucZ*(0.0040/(1+rpm/2500));

        /* パルス幅はクランク角ドメイン。時間固定だと高回転で duty が破綻する */
        let pwSec=wDeg/(6*Math.max(300,rpm));
        if(pwSec<P.pwMinSec) pwSec=P.pwMinSec; else if(pwSec>P.pwMaxSec) pwSec=P.pwMaxSec;
        const pw=pwSec*rpm/this.cyclesPerMin;      // サイクル比

        /* 乱流ノイズは1サンプルに1回だけ更新する。気筒ごとに回すと
           実効ローパスが4倍速で回ってしまい、狙いより明るくなる */
        this.turbZ+=this.turbA*((this.rnd()*2-1)-this.turbZ);
        const turb=this.turbZ;

        let mechG=0;
        let exSum=0, intakeGate=0;
        for(let k=0;k<this.N;k++){
          let u=this.cycPhase+fluc-this.off[k]-this.bias[k]-this.jTim[k];
          u-=Math.floor(u);

          /* 点火イベント検出（位相が0を跨いだ瞬間） */
          if(u<this.prevU[k]){
            let varDb=this.combustionVarDb, varNorm=this.combustionVarNorm;
            if(this.combustionVarDbLow!==varDb){
              let vr=(rpm-this.combustionVarRpmLo)
                    /(this.combustionVarRpmHi-this.combustionVarRpmLo);
              vr=Math.max(0,Math.min(1,vr)); vr=vr*vr*(3-2*vr);
              varDb=this.combustionVarDbLow+(varDb-this.combustionVarDbLow)*vr;
              const vx=Math.LN10*varDb*1.7320508/20;
              varNorm=vx===0?1:Math.pow(vx/Math.sinh(vx),2);
            }
            this.jAmp[k]=Math.pow(10,this.gauss()*varDb/20)*varNorm;
            /* 「最後の1発」。閉じる直前に吸入済みの混合気は次の点火で通常強度
               （加速ポンプ残りでやや濃い）で燃え、その次から急落する。
               これが無いと「バー」ではなく「アー」になる。 */
            if(this.lastBang){ this.jAmp[k]*=this.lastBangG; this.lastBang=0; }
            /* The BS34 slide responds to pressure rather than directly to the
               rider's hand, and carbureted mixture delivery has a measurable
               cycle-to-cycle lag during a fast throttle transient.  Preserve a
               bounded per-cylinder charge-pressure state at the crank event.
               It consumes no random numbers, is silent before coast gating, and
               therefore leaves V1-V5 sample-identical. */
            if(KE && KE.coastCyclePressureV6){
              const floor=KE.coastPressureFloor;
              /* V10 carries the actual manifold filling and X-tau combustion
                 result into the cylinder event. Earlier versions intentionally
                 retain their accepted stochastic pressure target. */
              const target=KE.transientMixtureV10
                  ? Math.max(floor,Math.min(1.5,
                      this.gsManifoldPressure
                      *(0.22+0.78*this.gsCombustionQuality)
                      *(0.92+0.08*this.jAmp[k])))
                  : Math.max(floor,Math.min(1.5,this.jAmp[k]));
              const memory=KE.coastPressureMemory;
              this.coastCyclePressure[k]=memory*this.coastCyclePressure[k]
                  +(1-memory)*target;
            }
            /* Mixture delivery on a closed-throttle carbureted engine does not
               redraw an unrelated spectrum every 720 degrees.  Keep a short
               memory across cycles, then use it only to trade the broad
               equalization lobe against the valve-opening edge.  Loudness is
               still carried by jAmp; this state restores color variation. */
            if(KE && KE.coastTemporalV3){
              if(this.phase){
                const memory=KE.coastCycleMemory;
                this.coastCycleColor[k]=memory*this.coastCycleColor[k]
                    +Math.sqrt(1-memory*memory)*this.gauss();
              }else{
                this.coastCycleColor[k]*=0.82;
              }
            }
                        this.jTim[k]=this.gauss()*(P.jitterDeg||0.35)/(360*P.strokeRevs);
            /* レブカットは決定論的な間引きだと周期的なうねりになるので確率的に */
                        let fire=!(this.cutRatio>0 && this.rnd()<this.cutRatio);
            let fuelMiss=0;
            /* Do not consume an extra random number at full supply: normal operation must keep
               the established deterministic waveform. A starving bowl instead drops whole firings. */
            if(fire && this.fuelS<0.999999){
              const chance=Math.max(0,Math.min(1,(this.fuelS-0.03)/0.82));
              if(this.rnd()>chance){ fire=false; fuelMiss=1; }
            }
            let miss4=0;                    /* 四循環による失火。レブカット失火とは別経路 */
            if(fire && this.CH){
              const CH=this.CH;
              /* 四循環（four-stroking）。既燃ガスが新気で薄まりきるまで失火し続ける。
                 ★失火そのものは音を出さない。燃焼が起きないだけで、ポートは開くので
                   ガス交換の流れは残る。旧実装はここで 900〜1300Hz の破裂音を
                   毎秒66発足していて、物理と符号が真逆だった。しかもそれは排気の
                   縦モード高調波が最も濃い帯域なので、パイプバンを自分で覆い隠していた。 */
              const sig=Math.max(CH.scavMin, Math.min(CH.scavMax,
                          CH.scavBase*Math.pow(Math.min(1, CH.drRefRpm/Math.max(600,this.rpm)), CH.scavRpmP)
                        + CH.scavThr*this.thrS)) * (1+CH.scavNoise*(2*this.rnd()-1));
              this.resid[k] *= (1-sig);
              if(this.resid[k] >= CH.residLimit){
                fire=false; miss4=1;
                this.pipeFuel[k] += CH.fuelPerScav*this.dr*this.mixFuel;   // 短絡した新気がパイプへ
              }else{
                this.resid[k] = 1;                                          // 燃えた＝筒内は既燃ガスで満ちる
                /* 可燃限界窓。中心 flamPk で最も強く燃え、上下限の外では着火しない。
                   flamP が振幅分布の裾の重さを決める＝「たまに大きいのが来る」の正体。 */
                const pf=this.pipeFuel[k];
                const u2 = pf<=CH.flamPk ? (pf-CH.flamLo)/(CH.flamPk-CH.flamLo)
                                         : (CH.flamHi-pf)/(CH.flamHi-CH.flamPk);
                if(u2>0){
                  const g=Math.pow(Math.min(1,u2), CH.flamP);
                  this.afTrigger(g);
                  this.bangBody[k]+=g*CH.bangBodyGain;   // 胴はチャンバーの中へ
                  this.pipeFuel[k]=pf*CH.bangResid;
                }
              }
              this.pipeFuel[k] *= Math.max(0.05, 1-CH.fuelPurgeK*this.dr);  // 排気流が掃き出す
            }
            this.fireOn[k]=fire?1:0;
            if(this.CH) this.missOn[k]=fire?0:1;
            /* レブ帯の失火。★2ストのチャンバー車ではこれも四循環と同じ現象（プリセットの
               コメント自身が「電子レブリミッタではなく失火の滲み量」と宣言している）ので、
               破裂音を出さず生ガスとして溜める。ここが実プレイ回転域で毎秒129発の
               破裂音を出していた。既存3車種は this.CH===null なので else 側を通り、
               乱数の引き方も現行と完全に同一。 */
            if(!fire && !miss4){
              /* Fuel starvation is air without usable fuel, so it must not create the raw-fuel
                 afterfire used by a limiter miss. The audible event is the next successful catch. */
              if(fuelMiss){ /* Deliberately leave a hole in the exhaust pulse train. */ }
              else if(this.CH){ this.pipeFuel[k] += this.CH.fuelPerScav*this.dr*this.mixFuel; }
              else if(this.rnd()<0.85) this.afTrigger(0.8+0.2*this.rnd());
            }
            /* ★4スト由来の経路。減速ポップに外部酸素が要るのは4ストだけで、
               2ストは短絡した新気が自己完結でパイプに入る（上の経路が担当）。 */
            else if(fire && !this.CH && this.overrun && this.rnd()<this.afBase*(rpm/8000)){
              this.afTrigger(0.55+0.45*this.rnd()); this.afBase*=0.55;
            }

            /* 吸い込みは点火位相に同期した減衰バースト。非同期にすると
               後ノリのトレモロに聴こえて別物になる */
            if(sk>0.02) this.skEnv[k]=0.85+0.30*this.rnd();
          }
          this.prevU[k]=u;

          let e=0;
          if(u<pw*2 && this.fireOn[k]){
            const x=(u/(pw*2))*this.ENV_N;
            const i0=x|0, f=x-i0;
                        e=this.env[i0]+(this.env[i0+1]-this.env[i0])*f;
            if(this.env2){
              const e2=this.env2[i0]+(this.env2[i0+1]-this.env2[i0])*f;
              e+=(e2-e)*envMix;
            }
          }else if(this.missOn[k] && this.envMiss){
            /* 失火。燃焼は無いがポートは開く。幅は通常の missPwMul 倍、
               振幅は missGain（-15dB）。既存3車種は envMiss が null なので通らない。 */
            const CHm=this.CH, pwM=Math.min(0.95, pw*2*CHm.missPwMul);
            if(u<pwM){
              const x=(u/pwM)*this.ENV_N;
              const i0=x|0, f=x-i0;
              e=(this.envMiss[i0]+(this.envMiss[i0+1]-this.envMiss[i0])*f)*CHm.missGain;
            }
          }
                    // 定数はブロック頭で1回だけ取る（ホットパスにプロパティ参照を増やさない）:
          //   render() のブロック頭に  const inF = P.intakeFrac || 0.25;  を追加（項目11に同梱）
          if(u<inF) intakeGate+=Math.sin(Math.PI*u/inF);
          if(mechAmN>0 && u<mechAmW) mechG+=Math.sin(Math.PI*u/mechAmW);

          let pulse=(e>0 && alive) ? (e+turb*e*turbAmt)*this.amp[k]*this.jAmp[k]*loadGain : 0;
          if(KE && KE.boreDisplacementV11 && pulse!==0)
            pulse*=this.gsPulseSourceScale*this.gsExhaustValveFlowScale;
          /* On closed-throttle weak/misfiring cycles, cylinder pressure can remain
             below exhaust pressure until the exhaust valve opens. Model both the
             slower pressure equalization and its fast opening front, then inject
             them before the primary so the 180/540-degree spacing and both pipe
             paths remain intact. */
          if(KE && this.barAmp>8e-4 && alive){
            const vacW=KE.vacuumDeg/(360*P.strokeRevs);
            const edgeW=KE.vacuumEdgeDeg/(360*P.strokeRevs);
            if(u<vacW || u<edgeW){
              let rare=0;
              let bodyScale=1, edgeScale=1;
              if(KE.coastTemporalV3){
                const colorDb=KE.coastCycleColorDb*this.coastCycleColor[k];
                bodyScale=Math.pow(10,-0.35*colorDb/20)
                         *(0.90+0.10*this.barCharge);
                /* The 300-event gesture study found only about +0.3 dB at the
                   bright head for fast versus slow releases.  Keep that small
                   measured effect instead of turning closure speed into a
                   synthetic volume knob. */
                const gestureDb=KE.coastGestureBrightDb*(this.barHit-0.5);
                edgeScale=Math.pow(10,(colorDb+gestureDb)/20);
              }
              if(u<vacW) rare-=bodyScale*KE.vacuumPortGain*Math.sin(Math.PI*u/vacW);
              /* The valve-opening front and the pressure recovery form a
                 near-zero-area bipolar edge. This adds the measured presence
                 band without inventing a second low-frequency pressure pulse. */
              if(u<edgeW) rare-=edgeScale*this.coastColor*KE.vacuumEdgeGain
                  *Math.sin(2*Math.PI*u/edgeW);
              /* Closed-throttle pressure is cycle-dependent: some cycles still
                 burn while others misfire. Retain that irregularity instead of
                 creating an unrealistically perfect oscillator. */
              let cyl=(1-KE.vacuumVarMix)+KE.vacuumVarMix*this.jAmp[k];
              if(KE.coastCyclePressureV6){
                if(KE.transientMixtureV10){
                  /* A weakly filled or rich-misfiring cylinder has the larger
                     pressure deficit when the valve opens. Convert stored
                     pressure to that deficit; do not turn pressure itself into
                     an audio gain as V6-V9 did for their empirical memory. */
                  const deficit=Math.max(0.72,Math.min(1.42,
                      1.34-0.52*this.coastCyclePressure[k]));
                  cyl=deficit*this.gsPressureGain*(0.94+0.06*this.jAmp[k]);
                }else{
                  const coherent=(1-KE.vacuumVarMix)
                      +KE.vacuumVarMix*this.coastCyclePressure[k];
                  cyl+=(coherent-cyl)*KE.coastPressureBlend;
                  cyl*=this.gsPressureGain;
                }
              }
              pulse+=rare*this.barAmp*this.barLvl*this.amp[k]*cyl
                  *this.gsExhaustValveFlowScale;
            }
          }

          this.skEnvS[k]+=this.skAtk*(this.skEnv[k]-this.skEnvS[k]);
          if(!KE && this.skEnvS[k]>1e-4){
            const nz=this.rnd()*2-1, q=1/K.noiseQ;
            const hi=nz-this.skLo-q*this.skBa;
            this.skBa+=this.skCf*hi; this.skLo+=this.skCf*this.skBa;
            pulse += this.skPost.p(this.skBa)*this.skEnvS[k]*sk*K.inject*2.2;
            this.skEnv[k]*=this.skDec;
          }

          /* 1次管。**バルブ端の反射係数を毎サンプル動かす**のがここの肝。
             u=0 が排気バルブの開くタイミング（＝ブローダウンでパルスが出る瞬間）。
             そこから 240度クランク（サイクルの約1/3）開いていて、その間は
             燃焼室側へ開放されるので反射がほぼ消える（0.06）。
             残りの 2/3 は剛壁（0.91）で管が自由に鳴る。
             固定係数だと開と閉の平均でしか鳴らず、「管が呼吸する」感じが消える。 */
          /* バルブ端の反射スケジュール。u=0 が排気弁の開くタイミング。
             ★開いた瞬間から反射が落ちる、は誤り。開弁直後の約50度クランクは
               筒内圧が排気圧の1.87倍を超えていてチョーク（音速流れ）になり、
               チョークしたノズルの上流は音響的に「剛壁」として振る舞う（R→1）。
               つまりパルスのエネルギーが出る間、管はまだ閉じている。
             チョークが切れてから開放され、閉弁でまた剛壁に戻る。
             この結果、1発のパルスの中でコムが c/4L（閉開）→ c/2L（開開）へ
             切り替わり、頭は硬く尻は開放的、という音色変化が出る。 */
          let aV;
          if(u < this.choke){
            aV = this.aClosed;                                   // チョーク中＝剛壁
          } else if(u < this.vOpen){
            const w=(u-this.choke)/(this.vOpen-this.choke);      // 開放へ移行
            const e=w<0.15 ? 0.5*(1-Math.cos(Math.PI*w/0.15))    // 遷移をなましてクリックを防ぐ
                  : (w>0.85 ? 0.5*(1+Math.cos(Math.PI*(w-0.85)/0.15)) : 1);
            aV = this.aClosed-(this.aClosed-this.aOpen)*e;
          } else {
            aV = this.aClosed;                                   // 閉弁＝剛壁
          }
          if(this.collectorScatterV15){
            const f=this.collectorPrimaryForwardV15[k];
            const r=this.collectorPrimaryReturnV15[k];
            const ix=this.collectorPrimaryIndexV15[k];
            const incident=f[ix], returned=r[ix];
            this.pLp[k]+=this.wallA*(returned-this.pLp[k]);
            const y=pulse-g1*aV*this.pLp[k];
            f[ix]=y;
            this.collectorPrimaryIncidentV15[k]=incident;
            this.collectorPrimaryWriteV15[k]=ix;
            this.collectorPrimaryIndexV15[k]=(ix+1===f.length)?0:ix+1;
          }else{
            const D=this.pD[k], b=this.pBuf[k], ix=this.pIdx[k];
            this.pLp[k]+=this.wallA*(b[ix]-this.pLp[k]);
            const y=pulse-g1*aV*this.pLp[k];
            b[ix]=y; this.pIdx[k]=(ix+1===D)?0:ix+1;
            exSum+=y;
          }

          /* ---- 膨張室（チャンバー）。2タップ導波管 ----
             ディフューザ（負反射・分布反射の重心 0.305Lt、同調時 EPO+48.8度＝掃気の
             真っ最中に負圧が来る）と、バッフルコーン（正反射・平均反射点 0.88Lt、
             同調時 EPO+140.8度＝排気閉の19度手前でプラグ到達）の2本。
             タップはサンプル固定なので、戻り波の到達クランク角は回転数に比例する。
             ポートが開いている区間（aV が -0.61 に反転する区間）と重なったときだけ
             強く結合する＝同調。ここに rpm 依存の分岐は一切書かない。
             ★ポートは自分の4.2倍断面のシリンダへ開くので反射が負。
               R=(551-2290)/(551+2290) = -0.61。4ストの +0.32 と符号が逆。 */
          if(this.CH){
            const cbuf=this.chBuf[k], cap=this.chCap, w=this.chW[k];
            let r=w-this.dDiff[k]; if(r<0) r+=cap;
            let j0=r|0, fr=r-j0, j1=(j0+1===cap)?0:j0+1;
            const xd=cbuf[j0]+(cbuf[j1]-cbuf[j0])*fr;
            this.chLpD[k]+=this.aLPd*(xd-this.chLpD[k]);
            r=w-this.dBaf[k]; if(r<0) r+=cap;
            j0=r|0; fr=r-j0; j1=(j0+1===cap)?0:j0+1;
            const xb=cbuf[j0]+(cbuf[j1]-cbuf[j0])*fr;
            this.chLpB[k]+=this.aLPb*(xb-this.chLpB[k]);
            let ret=this.cD*this.chLpD[k]+this.cB*this.chLpB[k];
            /* スティンガが直流を逃がす。物理的に正しく、DC極による発散も原理的に潰れる */
            this.chDc[k]+=this.chDcA*(ret-this.chDc[k]); ret-=this.chDc[k];
            /* バンの胴。管の中で起きた燃焼なので、ここで注入して往復させる。
               白色で励振するのは、どのモードが立つかを管の側に決めさせるため。 */
            let bx=0;
            if(this.bangBody[k]>1e-6){
              this.bangBodyLp[k]+=this.bangBodyLpA*((this.rnd()*2-1)*this.bangBody[k]-this.bangBodyLp[k]);
              bx=this.bangBodyLp[k];
              this.bangBody[k]*=this.bangBodyA;
            }
            const cy=pulse+bx+this.chG*aV*ret;
            cbuf[w]=cy; this.chW[k]=(w+1===cap)?0:w+1;
            exSum+=cy*this.CH.gOut*this.gOutS;
          }
        }

        /* コレクタ。V15だけは圧力連続・体積速度保存で三つの枝を
           同時に散乱させる。V1-V14は受理済みの単一帰還をそのまま使う。 */
        if(this.collectorScatterV15){
          /* アフターファイアはコレクタ直後に注入（1次管を通すと遅すぎる） */
          const collectorAfterfire=this.afRender()*this.afVol;
          const tf=this.collectorTailForwardV15;
          const tr=this.collectorTailReturnV15;
          const tix=this.collectorTailIndexV15;
          const atOutlet=tf[tix], fromOutlet=tr[tix];

          /* The low-frequency pressure reflection of an open end is negative.
             Its complement is volume velocity radiated into the exterior. */
          this.collectorTailRadiationLpV15+=this.radA
              *(atOutlet-this.collectorTailRadiationLpV15);
          const outletReturn=-g2*this.collectorTailRadiationLpV15;
          tr[tix]=outletReturn;

          let weighted=this.collectorTailAreaV15*fromOutlet;
          for(let k=0;k<this.N;k++) weighted+=this.collectorPrimaryAreaV15
              *this.collectorPrimaryIncidentV15[k];
          const junctionPressure=2*weighted/this.collectorAreaSumV15;
          const loss=this.collectorJunctionLossV15;
          for(let k=0;k<this.N;k++){
            const returned=(junctionPressure-this.collectorPrimaryIncidentV15[k])*loss;
            this.collectorPrimaryReturnV15[k][this.collectorPrimaryWriteV15[k]]=returned;
          }
          tf[tix]=(junctionPressure-fromOutlet)*loss+collectorAfterfire;
          this.collectorTailIndexV15=(tix+1===tf.length)?0:tix+1;

          const areaScale=Math.sqrt(
              this.collectorTailAreaV15/this.collectorPrimaryAreaV15);
          exSum=(atOutlet-outletReturn)*areaScale*this.collectorRadiationTrimV15;
        }else{
          this.collLp+=this.wallA*(this.collBuf[this.collI]-this.collLp);
          const y=exSum*this.collectorIn+this.gColl*this.collLp;
          this.collBuf[this.collI]=y; this.collI=(this.collI+1===this.collD)?0:this.collI+1;
          exSum=y;
          /* アフターファイアはコレクタ直後に注入（1次管を通すと遅すぎる） */
          exSum += this.afRender()*this.afVol;
        }

        /* テールパイプ：開-開の正帰還コム → 全整数倍音。
           V15's bidirectional tail is already part of the three-port network. */
        if(!this.collectorScatterV15){
          this.tailLp+=this.wallA*(this.tailBuf[this.tailI]-this.tailLp);
          /* 放射インピーダンス：出口で反射して戻るのは低域だけ。
             高域は外へ抜けるので帰還に乗らない。この1極が「太い管ほど明るく、
             絞るほど籠もる」を物理として作る（従来は全周波数で同じ反射だった） */
          this.radLp+=this.radA*(this.tailLp-this.radLp);
          const y=exSum+g2*this.radLp;
          this.tailBuf[this.tailI]=y; this.tailI=(this.tailI+1===this.tailD)?0:this.tailI+1;
          exSum=y;
        }

        /* サイレンサ：βを弱めて伸ばすと発散するので、素子の「本数」で消音量を作る */
        if(this.mufflerElems>0){
          let acc=0;
          const inp=exSum/this.mufflerElems;
          for(let k=0;k<this.mufflerElems;k++){
            const D=this.mD[k], b=this.mBuf[k], ix=this.mI[k];
            this.mLp[k]+=this.wallA*(b[ix]-this.mLp[k]);
            /* mufSign: 4発のストレート貫通は負反射(-1)、
               2発のメガホン/キャブトンは先端絞りで R=+0.836 の正反射(+1) */
            const y=inp+this.mufSign*this.gMuf*this.mLp[k];
            b[ix]=y; this.mI[k]=(ix+1===D)?0:ix+1;
            acc+=y;
          }
          exSum=acc;
        }

        /* A suction-spec outlet is tuned by pipe length and restriction, not by
           a free-running tone.  The open-end pressure reflection is negative:
           with a 0.574 m effective path its first pressure maximum is near
           250 Hz and the following cancellation near 500 Hz.  The feedback is
           opened only by the measured coast-pressure state; outside V4 it is
           exactly zero and the legacy samples remain bit-identical. */
        if(KE && KE.coastPipeV4){
          const b=this.coastPipeBuf, ix=this.coastPipeI;
          let reflected;
          if(KE.coastPipeThermalV7){
            this.coastPipeDelayCur+=this.coastPipeDelayStep;
            const delay=this.coastPipeDelayCur;
            const integer=Math.floor(delay)-1;
            const fraction=delay-integer;
            const mask=this.coastPipeMask;
            const i0=(ix-integer)&mask;
            const i1=(ix-integer-1)&mask;
            const i2=(ix-integer-2)&mask;
            const i3=(ix-integer-3)&mask;
            const d1=fraction-1, d2=fraction-2, d3=fraction-3;
            const h0=-d1*d2*d3/6;
            const h1=fraction*d2*d3/2;
            const h2=-fraction*d1*d3/2;
            const h3=fraction*d1*d2/6;
            reflected=h0*b[i0]+h1*b[i1]+h2*b[i2]+h3*b[i3];
          }else{
            reflected=b[ix];
          }
          this.coastPipeLp+=this.wallA*(reflected-this.coastPipeLp);
          const pipeFloor=KE.coastPipeFloor||0;
          const gateTarget=this.phase && this.barAge>=this.coastPipeDelay
              ? pipeFloor+(1-pipeFloor)*Math.min(1,this.barAmp) : 0;
          const gateA=gateTarget>this.coastPipeGate
              ? this.coastPipeAtkA : this.coastPipeRelA;
          this.coastPipeGate+=gateA*(gateTarget-this.coastPipeGate);
          const fb=this.coastPipeFb*this.coastPipeGate;
          if(KE.coastSecondaryV8){
            const sb=this.coastSecondaryBuf, six=this.coastSecondaryI;
            this.coastSecondaryDelayCur+=this.coastSecondaryDelayStep;
            const secondaryDelay=this.coastSecondaryDelayCur;
            const secondaryInteger=Math.floor(secondaryDelay)-1;
            const secondaryFraction=secondaryDelay-secondaryInteger;
            const secondaryMask=this.coastSecondaryMask;
            const s0=(six-secondaryInteger)&secondaryMask;
            const s1=(six-secondaryInteger-1)&secondaryMask;
            const s2=(six-secondaryInteger-2)&secondaryMask;
            const s3=(six-secondaryInteger-3)&secondaryMask;
            const sd1=secondaryFraction-1, sd2=secondaryFraction-2;
            const sd3=secondaryFraction-3;
            const sh0=-sd1*sd2*sd3/6;
            const sh1=secondaryFraction*sd2*sd3/2;
            const sh2=-secondaryFraction*sd1*sd3/2;
            const sh3=secondaryFraction*sd1*sd2/6;
            const secondaryReflected=sh0*sb[s0]+sh1*sb[s1]+sh2*sb[s2]+sh3*sb[s3];
            this.coastSecondaryLp+=this.coastSecondaryWallA
                *(secondaryReflected-this.coastSecondaryLp);
            const secondaryFb=Math.min(this.coastSecondaryFb,
                Math.max(0,KE.coastFeedbackCeilingV8-this.coastPipeFb))
                *this.coastPipeGate;
            const y=exSum+this.coastPipeSign*fb*this.coastPipeLp
                +this.coastSecondarySign*secondaryFb*this.coastSecondaryLp;
            b[ix]=y; sb[six]=y;
            this.coastPipeI=(ix+1)&this.coastPipeMask;
            this.coastSecondaryI=(six+1)&secondaryMask;
            exSum=y;
          }else{
            const y=exSum+this.coastPipeSign*fb*this.coastPipeLp;
            b[ix]=y;
            this.coastPipeI=KE.coastPipeThermalV7
                ? (ix+1)&this.coastPipeMask
                : (ix+1===this.coastPipeD)?0:ix+1;
            exSum=y;
          }
        }

        /* V14 weak-shock propagation.  Finite-amplitude compression waves
           travel slightly faster than their low-pressure tails and steepen as
           they move down a hot pipe.  The pressure-weighted positive slope is
           band-limited before it reaches the termination; expansion slopes
           retain only a small part of the effect. */
        if(KE && KE.exhaustFieldV14){
          const slope=exSum-this.exhaustShockPrev;
          this.exhaustShockPrev=exSum;
          const pressure=Math.min(1.5,Math.abs(exSum)*0.55);
          const steep=slope*(slope>=0?1:0.32)*pressure;
          this.exhaustShockLp+=this.exhaustShockA*(steep-this.exhaustShockLp);
          exSum+=this.exhaustShockGain*this.exhaustShockLp;
        }

        /* V13 radiates the pressure that actually passes through the selected
           termination.  Packed perforates dissipate mostly mid/high acoustic
           energy, a removable baffle has broad transmission loss, and an open
           straight pipe is unity.  The coherent positive/negative returns were
           already sent through the two physical delay paths above, so this is
           transmission loss at the outlet rather than a post-synthesis tone. */
        if(KE && KE.exhaustHardwareV13){
          this.exhaustHwLowTx+=this.exhaustHwTxA
              *(this.exhaustHwLowTxTarget-this.exhaustHwLowTx);
          this.exhaustHwHighTx+=this.exhaustHwTxA
              *(this.exhaustHwHighTxTarget-this.exhaustHwHighTx);
          this.exhaustHwLp+=this.exhaustHwLpA*(exSum-this.exhaustHwLp);
          exSum=this.exhaustHwLowTx*this.exhaustHwLp
              +this.exhaustHwHighTx*(exSum-this.exhaustHwLp);
        }

        let exhaustShell=0;
        if(KE && KE.exhaustFieldV14){
          /* A pipe outlet radiates volume-velocity changes more efficiently
             above ka~1.  This two-band approximation stays causal and lets
             the termination remove the shock edge before it reaches air. */
          this.exhaustRadiationLp+=this.exhaustRadiationA
              *(exSum-this.exhaustRadiationLp);
          exSum=this.exhaustRadiationLp+this.exhaustRadiationGain
              *(exSum-this.exhaustRadiationLp);
          /* Structural shell modes are driven by internal pressure, not by a
             free-running oscillator.  Three low-Q modes stand in for the
             unmeasured wall thickness and mounting boundary of the generic
             300 mm outer can. */
          exhaustShell=(this.exhaustShell1.p(exSum)*0.52
              +this.exhaustShell2.p(exSum)*0.31
              +this.exhaustShell3.p(exSum)*0.17)*this.exhaustShellGain;
        }

        /* 出口段 */
        this.dcZ+=this.dcA*(exSum-this.dcZ);
        let ex=exSum-this.dcZ;
        ex=this.portBp.p(ex)*0.7+ex*0.5;
        this.brightZ+=this.brightA*(ex-this.brightZ);
        ex=this.brightZ;
        ex=this.formant.p(ex);
        if(this.bodyHz>0) ex=this.body.p(ex);
        ex=this.rasp.p(ex);
        const d=ex*satDrive;
        ex=d/(1+Math.abs(d))*1.3;
        ex*=this.outTrim*this.trimScale*0.55*(this.CH?this.packTrim:1);

        /* 吸気層：オフスロットルでは絞りで塞がれる */
        const inz=this.rnd()*2-1;
        this.intakeZ+=this.intkA*(inz-this.intakeZ);
        let intake=this.intakeBp.p(this.intakeZ)*intakeGate*intakeGain*alive;
        if(KE && KE.transientMixtureV10){
          /* The early piston/valve depression excites the runner; the delayed
             open-end reflection then returns to the source. This compact 1-D
             waveguide is driven by valve volume flow and manifold depression,
             so it changes pitch with runner length but never free-runs as a
             phoneme oscillator. */
          const wb=this.gsIntakeWaveBuf, wix=this.gsIntakeWaveI;
          const delay=this.gsIntakeWaveDelay;
          const integer=Math.floor(delay), fraction=delay-integer;
          const wi0=(wix-integer)&this.gsIntakeWaveMask;
          const wi1=(wi0-1)&this.gsIntakeWaveMask;
          const reflected=wb[wi0]+(wb[wi1]-wb[wi0])*fraction;
          this.gsIntakeWaveLp+=this.gsIntakeWaveWallA
              *(reflected-this.gsIntakeWaveLp);
          const valveFlow=(intakeGate/this.N)*this.gsManifoldDepression
              *(0.35+0.65*this.cvSlide)*(this.phase?1:0)
              *(KE.boreDisplacementV11?this.gsDisplacementScale:1);
          const wave=valveFlow-(KE.intakeRunnerFeedbackV10||0.72)
              *this.gsIntakeWaveLp;
          wb[wix]=wave;
          this.gsIntakeWaveI=(wix+1)&this.gsIntakeWaveMask;
          const radiation=wave-reflected;
          this.gsIntakeWaveDc+=this.gsIntakeWaveDcA
              *(radiation-this.gsIntakeWaveDc);
          const runner=this.gsIntakeWaveHp.p(radiation-this.gsIntakeWaveDc);
          intake+=runner*(KE.intakeRunnerGainV10||0.075)
              *(0.65+0.35*this.gsIntakeOpen)*alive;
        }

        /* メカノイズ：負荷でほとんど変わらない。ここを絞るとアクセルオフで無音になる */
        const mnz=this.rnd()*2-1;
        this.mechZ+=this.mechA*(mnz-this.mechZ);
        const mech=(this.mechBp.p(this.mechZ)*0.6+this.mechZ*0.4)*mechGain*alive*Math.min(1,rpm/1500)*(mechAmN>0?mechAm1+mechAmD*mechG:1);

        /* 車体レイヤ。2次の正弦で加振（往復慣性は正弦的、振幅 ∝ ω²）し、
           低Qの共振2本を通してから、閾値を超えた分だけラトル（パネルのビビり）を足す。
           特定回転数で共振がヒットして「ビビる」挙動が出る。 */
        let body=0;
        if(alive && this.bodyLevel>0){
                    const ord2=rpm*this.bodyOrder/60;        // 直4は2次=rpm/30、120度3気筒は3次=rpm/20
          // ※ this.bodyOrder は constructor で P.bodyOrder||2（項目8）                       // 2次 = rpm/30 Hz
          this.bodyPh+=2*Math.PI*ord2/fs; if(this.bodyPh>6.283185307) this.bodyPh-=6.283185307;
          const drive=Math.sin(this.bodyPh)*Math.pow(rpm/6000,2)*0.30;
          const r=this.bodyR1.p(drive)+this.bodyR2.p(drive)*0.7;
          const over=Math.abs(r)-0.06;             // 閾値を超えるとパネルがビビる
          let rattle=over>0 ? Math.sign(r)*over*1.8*(this.rnd()*0.6+0.7) : 0;
          if(this.bodyRatA>0){ this.bodyRatZ+=this.bodyRatA*(rattle-this.bodyRatZ); rattle=this.bodyRatZ; }
          body=(r+rattle)*this.bodyLevel;
        }

        /* The measured coast color is a broad transfer-function change applied to
           the already-routed pressure wave. Keep every filter running so reopening
           the throttle cannot reveal stale filter state. */
        if(KE){
          /* Smooth the control-rate state at audio rate to avoid zipper noise. */
          this.barAmp += ((this.barTgtAmp>this.barAmp)?barAtkA:barRelA)
                       * (this.barTgtAmp-this.barAmp);
          if(this.barAmp>8e-4) this.barRun=(fs*0.06)|0;
          else if(this.barRun>0) this.barRun--;

          const base=ex;
          const coast=this.coastPresenceBq.p(this.coastRaspBq.p(
              this.coastNotchBq.p(this.coastBodyBq.p(base))));
          if(this.barRun>0){
            /* The pipe transfer function belongs to the throttle state, not the
               output level. Multiplying it by barLvl made the 500 Hz notch vanish
               as RPM fell, even while the butterfly remained closed. */
            const blend=Math.min(KE.coastMaxBlend,
                this.barAmp*KE.coastColorBlend);
            ex=base+(coast-base)*blend;
          }
        }

        let mix=ex+exhaustShell+intake*0.6+mech+body;

        /* 疑似低音：スマホ内蔵スピーカーは 500Hz 以下がほぼ出ないため、
           整流で作った倍音を再生できる帯域へ寄せて基音を知覚させる */
        if(this.psbGain>0){
          const lb=this.psbBp.p(mix);
          const rect=Math.abs(lb);
          this.dcAvg+=this.dcAvgA*(rect-this.dcAvg);
          let h=rect-this.dcAvg;
          h=this.psbShape.p(this.psbHp.p(h));
          mix+=h*this.psbGain;
        }

        mix=this.outHp.p(mix)*this.master;
        /* ソフトリミッタ。±0.8 から上を圧縮し ±1.0 に漸近させる */
        if(mix>0.8)       mix= 0.8+0.2*(1-1/(1+(mix-0.8)*5));
        else if(mix<-0.8) mix=-0.8-0.2*(1-1/(1+(-mix-0.8)*5));
        if(KE && KE.exhaustFieldV14){
          /* Preserve the exact mono sum while giving outlet, shell and hard
             road reflection different arrival times at each ear.  This avoids
             chorus/reverb and remains stable on a single phone speaker. */
          const wi=this.exhaustFieldI, mask=255;
          this.exhaustFieldBuf[wi]=mix;
          this.exhaustShellBuf[wi]=exhaustShell*this.master;
          const gL=this.exhaustFieldBuf[(wi-this.exhaustGroundDelayL)&mask];
          const gR=this.exhaustFieldBuf[(wi-this.exhaustGroundDelayR)&mask];
          const shellNear=this.exhaustShellBuf[(wi-4)&mask];
          const shellFar=this.exhaustShellBuf[(wi-13)&mask];
          this.exhaustFieldI=(wi+1)&mask;
          let mid=0.90*mix+0.055*(gL+gR);
          let side=0.105*(gR-gL)+0.42*(shellNear-shellFar)+0.018*mid;
          let left=mid-side, right=mid+side;
          if(left>0.8) left=0.8+0.2*(1-1/(1+(left-0.8)*5));
          else if(left<-0.8) left=-0.8-0.2*(1-1/(1+(-left-0.8)*5));
          if(right>0.8) right=0.8+0.2*(1-1/(1+(right-0.8)*5));
          else if(right<-0.8) right=-0.8-0.2*(1-1/(1+(-right-0.8)*5));
          out[i+s]=outR?left:mid;
          if(outR) outR[i+s]=right;
        }else{
          out[i+s]=mix;
          if(outR) outR[i+s]=mix;
        }
      }
      i+=blk;
    }
  }

  afTrigger(strength){
    const v=this.afIdx=(this.afIdx+1)&7;
    this.afOn[v]=1; this.afT[v]=0; this.afG[v]=strength;
    const CH=this.CH;
    if(CH){
      /* ---- クラス1: パイプバン ----
         ★立ち上がり時間がスペクトルを決める（BW ≒ 0.35/t_r）。旧実装は全ボイス
           固定の 0.6ms で、10-90% 立上りが 0.354ms ＝ 帯域 990Hz。つまり励振が
           1kHz で帯域制限されていたので、BPF をどこへ動かしても高域は出なかった。
           「パンッ」が原理的に合成できていなかったのはこれ。
         ★芯を 2.5〜5kHz に置くのは、そこがチャンバー胴の第1横モード(3.0〜5.1kHz)
           より上で、連続する排気音が原理的に届かない帯域だから。音量を上げずに
           マスキングの空き地を使う。 */
      this.afCls[v]=1;
      this.afF[v]=CH.bangCoreHz0+(CH.bangCoreHz1-CH.bangCoreHz0)*this.rnd();
      this.afAtk[v]=CH.bangAtkSlow+(CH.bangAtkFast-CH.bangAtkSlow)*strength;  // 強いほど速い＝明るい
      this.afTauC[v]=CH.bangCoreTau;
      const fm=CH.bangMidHz0+(CH.bangMidHz1-CH.bangMidHz0)*this.rnd();
      this.afCf2[v]=2*Math.sin(Math.PI*fm/this.fs);
      this.afLo2[v]=0; this.afBa2[v]=0;
    }else{
      this.afCls[v]=0;
      this.afF[v]=900+400*this.rnd();
      this.afTh[v]=78+24*this.rnd(); this.afPh[v]=0;
    }
    this.afLo[v]=0; this.afBa[v]=0;
    this.afCf[v]=2*Math.sin(Math.PI*this.afF[v]/this.fs);
    this.afCount++;
  }
  afRender(){
    let acc=0; const dt=1/this.fs;
    const CH=this.CH;
    for(let v=0;v<8;v++){
      if(!this.afOn[v]) continue;
      const t=this.afT[v];
      if(this.afCls[v]){
        /* ---- クラス1: パイプバン（2帯域） ---- */
        if(t>CH.bangLifeSec){ this.afOn[v]=0; continue; }
        const atk=this.afAtk[v], g=this.afG[v]*CH.bangGain;
        const ec = t<atk ? 0.5*(1-Math.cos(Math.PI*t/atk)) : Math.exp(-(t-atk)/this.afTauC[v]);
        const em = t<atk ? 0.5*(1-Math.cos(Math.PI*t/atk)) : Math.exp(-(t-atk)/CH.bangMidTau);
        const nz=this.rnd()*2-1, q=1/CH.bangCoreQ;
        /* 芯と中域は同じ破裂ノイズを2つの帯域で見ている。別々の乱数にすると
           1発の出来事が2つに聞こえる。 */
        const hi=nz-this.afLo[v]-q*this.afBa[v];
        this.afBa[v]+=this.afCf[v]*hi; this.afLo[v]+=this.afCf[v]*this.afBa[v];
        acc+=this.afBa[v]*ec*g*this.packBangHf;
        const hi2=nz-this.afLo2[v]-q*this.afBa2[v];
        this.afBa2[v]+=this.afCf2[v]*hi2; this.afLo2[v]+=this.afCf2[v]*this.afBa2[v];
        acc+=this.afBa2[v]*em*g*CH.bangMidGain;
        this.afT[v]=t+dt;
        continue;
      }
      if(t>0.045){ this.afOn[v]=0; continue; }
      /* 破裂ノイズ：attack 0.6ms より速いとクリック、遅いと「ポフ」になる */
      let e;
      if(t<0.0006) e=0.5*(1-Math.cos(Math.PI*t/0.0006));
      else e=Math.exp(-(t-0.0006)/0.009);
      if(t>0.028) e*=Math.max(0,1-(t-0.028)/0.008);
      const nz=this.rnd()*2-1;
      const f=this.afCf[v], q=1/0.8;
      const hi=nz-this.afLo[v]-q*this.afBa[v];
      this.afBa[v]+=f*hi; this.afLo[v]+=f*this.afBa[v];
      acc+=this.afBa[v]*e*this.afG[v];
      /* 低域サンプ：スマホでは聞こえないが疑似低音と触覚に効く */
      this.afPh[v]+=2*Math.PI*this.afTh[v]*dt;
      acc+=Math.sin(this.afPh[v])*Math.exp(-t/0.014)*0.40*this.afG[v];
      this.afT[v]=t+dt;
    }
    return acc;
  }
}

/* ============================================================================
 * ワークレット本体のソース。CSP で blob: が塞がれている環境では
 * ScriptProcessorNode にフォールバックするので、EngineCore は
 * ページ側にも実体として存在させておく。
 * ==========================================================================*/
const WORKLET_TAIL = `
class EngineProcessor extends AudioWorkletProcessor{
  static get parameterDescriptors(){ return [
    {name:'throttle',defaultValue:0,minValue:0,maxValue:1,automationRate:'k-rate'},
    {name:'clutch',  defaultValue:0,minValue:0,maxValue:1,automationRate:'k-rate'},
    {name:'brake',   defaultValue:1,minValue:0,maxValue:1,automationRate:'k-rate'},
    {name:'gear',    defaultValue:1,minValue:0,maxValue:1,automationRate:'k-rate'}
  ]; }
  constructor(){
    super();
    const options=(arguments[0]&&arguments[0].processorOptions)||{};
    this.core=new EngineCore(sampleRate, PRESETS[options.preset||'AC4_400'], options.gsVersion);
    this.tick=0;
    this.port.onmessage=(e)=>{
      const d=e.data, c=this.core;
      if(d.cmd==='ignite') c.ignite();
      else if(d.cmd==='kill') c.kill();
      else if(d.cmd==='muffler'){ this.mufIdx=d.v; c.setMuffler(d.v); }
      else if(d.cmd==='speaker') c.setSpeakerMode(d.v);
      else if(d.cmd==='fuel') c.setFuelSupply(d.v);
      else if(d.cmd==='pattern'){ c.setPattern(d.onsets,d.loop); c.autoOn=true; }
      else if(d.cmd==='autoOff') c.autoOn=false;
      else if(d.cmd==='revband') c.autoPeakTarget=d.v;
      else if(d.cmd==='tune'){ this.tune=d.t; c.setTune(d.t); }
      else if(d.cmd==='preset'){
        /* 気筒数で全バッファ長が変わるのでコアを作り直す。
           process() の外（メッセージハンドラ）なので確保してよい */
        const run=c.running, mf=this.mufIdx||1, sp=(c.psbGain>0);
        const nc=new EngineCore(sampleRate, PRESETS[d.id], d.gsVersion);
        nc.setMuffler(mf); nc.setSpeakerMode(sp); nc.setFuelSupply(c.fuelSupply); if(this.tune) nc.setTune(this.tune);
        if(run) nc.ignite();
        this.core=nc;
        this.port.postMessage({presetReady:d.id});
      }
    };
  }
  process(inputs,outputs,params){
    const out=outputs[0], ch=out[0], n=ch.length, c=this.core;
    c.inThr=params.throttle[0]; c.inCl=params.clutch[0];
    c.inBrake=params.brake[0];  c.gear=params.gear[0]>0.5?1:0;
    c.render(ch,n,out[1]);
    for(let k=2;k<out.length;k++) out[k].set(ch);
    this.tick+=n;
    if(this.tick>=1536){
      this.tick=0;
      this.port.postMessage({rpm:c.rpm,thr:c.thrS,cl:c.clS,beatN:c.beatN,
        peak:c.beatPeak,trough:c.beatTrough,af:c.afCount,run:c.running?1:0,cut:c.cut?1:0});
      c.afCount=0;
    }
    return true;
  }
}
registerProcessor('engine-core',EngineProcessor);
`;
