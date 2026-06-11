// Hugmyndabanki fyrir Los Dolses / Orihuela Costa / Torrevieja
// Hver hugmynd: { emoji, title, desc, noWind?: true } — noWind = sleppa ef mjög hvasst

const SUGGESTIONS = {
  beach: [
    {
      emoji: "🏖️",
      title: "La Zenia ströndin (Cala Bosque)",
      desc: "Vinsælasta ströndin í hverfinu — gullinn sandur, rólegur sjór og góð aðstaða. Aðeins ~5 mín akstur frá Los Dolses.",
    },
    {
      emoji: "🌊",
      title: "Cala Capitán við Cabo Roig",
      desc: "Falleg vík með klettum og fínu snorkli. Strandstígurinn meðfram klettunum er einn sá fallegasti á svæðinu.",
    },
    {
      emoji: "🏝️",
      title: "Punta Prima ströndin",
      desc: "Bláfánaströnd með strandveitingastöðum og góðri aðstöðu. Tilvalin í heilan strandadag.",
    },
    {
      emoji: "⛱️",
      title: "Playa Flamenca víkin",
      desc: "Lítil og kósý vík rétt hjá ykkur — frábær fyrir rólegt morgunsund áður en hitinn skellur á.",
    },
    {
      emoji: "🏜️",
      title: "Guardamar — sandöldurnar",
      desc: "Endalaus náttúruströnd við sandöldur og furuskóg, ~15 mín norður. Allt önnur stemning en bæjarstrandirnar.",
    },
  ],

  food: [
    {
      emoji: "🍷",
      title: "Kvöldstund á Villamartín Plaza",
      desc: "Torgið ykkar megin er stútfullt af veitingastöðum — tapas, grill og kokteilar. Oft lifandi tónlist á kvöldin.",
    },
    {
      emoji: "🥘",
      title: "Paella við höfnina í Torrevieja",
      desc: "Alvöru spænsk paella við sjávarsíðuna og svo kvöldrölt eftir Paseo Vista Alegre strandgötunni.",
    },
    {
      emoji: "🍤",
      title: "Tapas-rölt í miðbæ Torrevieja",
      desc: "Hoppið á milli tapas-staða í miðbænum — deilið litlum réttum og prófið eitthvað nýtt á hverjum stað.",
    },
    {
      emoji: "🦐",
      title: "Kvöldverður við Cabo Roig smábátahöfnina",
      desc: "Ferskur fiskur og útsýni yfir höfnina í sólsetrinu. Pantið borð úti.",
    },
    {
      emoji: "🍦",
      title: "Ís og kvöldrölt á La Zenia Boulevard",
      desc: "Stærsta verslunarmiðstöð svæðisins — opin fram á kvöld á sumrin, ís, kaffihús og notaleg kvöldstemning.",
    },
  ],

  trip: [
    {
      emoji: "🌸",
      title: "Bleika lónið — Laguna Rosa",
      desc: "Fræga bleika saltvatnslónið í Torrevieja. Liturinn er sterkastur síðdegis í sól — munið myndavélina! Flamingóar sjást stundum.",
    },
    {
      emoji: "🚤",
      title: "Tabarca eyjan",
      desc: "Bátsferð frá höfninni í Torrevieja út í litlu eyjuna — snorkl í friðlandi, sjávarréttir og sjarmerandi þorp. Heilsdagsferð.",
      noWind: true,
    },
    {
      emoji: "🏰",
      title: "Alicante — kastalinn og gamli bærinn",
      desc: "Santa Bárbara kastalinn með útsýni yfir alla ströndina, litríki gamli bærinn og Explanada-strandgatan. ~50 mín akstur.",
    },
    {
      emoji: "🏛️",
      title: "Cartagena — rómverska leikhúsið",
      desc: "Stórglæsilegt rómverskt leikhús, hafnarborg full af sögu og fín söfn. ~45 mín akstur — gott þegar er skýjað eða of heitt.",
    },
    {
      emoji: "🌴",
      title: "Elche — pálmaskógurinn",
      desc: "Stærsti pálmalundur Evrópu, á heimsminjaskrá UNESCO. Skuggsælt og fallegt — hentar vel þó sólin sé sterk.",
    },
    {
      emoji: "🧂",
      title: "Saltlónin og náttúrustígarnir",
      desc: "Lónin í Torrevieja eru friðland — göngustígar, saltvinnslusaga og oft flamingóar. Best snemma morguns eða undir kvöld.",
    },
  ],

  relax: [
    {
      emoji: "🏊",
      title: "Sundlaugardagur heima",
      desc: "Rólegur dagur við laugina — bók, kaldur drykkur og engin dagskrá. Stundum er það besta fríið.",
    },
    {
      emoji: "🚶",
      title: "Strandstígurinn Cabo Roig → La Zenia",
      desc: "Fallegasta kvöldgangan á svæðinu, meðfram klettunum með sjóinn við hliðina. Endið á ís eða drykk.",
    },
    {
      emoji: "🌅",
      title: "Sólarupprás á ströndinni",
      desc: "Sólin kemur upp úr Miðjarðarhafinu — þess virði að vakna snemma einu sinni í fríinu. Kaffi með í brúsa!",
    },
    {
      emoji: "💧",
      title: "Aquopolis vatnsgarðurinn",
      desc: "Vatnsrennibrautagarðurinn í Torrevieja — frábær fjölskyldudagur þegar þarf að kæla sig niður.",
    },
    {
      emoji: "🎳",
      title: "Keila eða mínígolf við Zenia Boulevard",
      desc: "Létt keppni í fjölskyldunni — og loftkæling þegar hádegishitinn er sem mestur.",
    },
  ],

  indoor: [
    {
      emoji: "🛍️",
      title: "La Zenia Boulevard",
      desc: "Yfir 150 verslanir, veitingastaðir og leiksvæði — loftkælt skjól þegar veðrið er ekki upp á sitt besta.",
    },
    {
      emoji: "🏛️",
      title: "Söfnin í Cartagena",
      desc: "Rómverska leikhúsið, sjóminjasafn og kafbátasafn — frábær innidagur með sögu. ~45 mín akstur.",
    },
    {
      emoji: "🎬",
      title: "Bíó og matur á Zenia Boulevard",
      desc: "Bíósalur í verslunarmiðstöðinni og nóg af veitingastöðum — klassískur plan B dagur.",
    },
  ],
};

// Markaðir bundnir við vikudaga (0 = sunnudagur ... 6 = laugardagur)
const MARKETS = {
  5: {
    emoji: "🧺",
    title: "Föstudagsmarkaðurinn í Torrevieja",
    desc: "Einn stærsti útimarkaður Spánar — ávextir, leðurvörur, föt og allskonar. Farið snemma morguns áður en hitinn og mannfjöldinn skella á.",
  },
  6: {
    emoji: "🧺",
    title: "Laugardagsmarkaðurinn í Playa Flamenca",
    desc: "Hverfismarkaðurinn ykkar — rölt á milli bása, smá prútt og churros með súkkulaði á eftir.",
  },
};

// Dæmigert veður seint í júní / byrjun júlí, notað þegar spá nær ekki svo langt
const TYPICAL = {
  tempMax: 30,
  tempMin: 21,
  uv: 9,
  sea: 24,
  code: 0,
  precip: 5,
  wind: 18,
};
