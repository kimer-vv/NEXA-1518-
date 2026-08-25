/* NEXA V44.3 — RESET + CHARMS + MINISTRY + HERO POLISH — 2026-08-24
   CLEAN REPLACEMENT. Not cumulative.
   Owns only:
   - Home menu outside-tap close
   - Legendary/Mythic Exclusive Gear / Widget presentation
   - Pets skill/buff/cooldown presentation
   - Charm images inside + outside
   - Compact Ministry Appointments launcher next to profile name
   - Main/Alternate account labels + Alliance helper
   - Owner Operational Roles / Module Access helper
   - Compact Transfer Center heading
   Does NOT rewrite Heroes, Experts, Troops, Library data, or Chief Gear assets.
   No MutationObserver. No polling. No manual scrollLeft. No touchmove preventDefault.
*/
(()=>{
'use strict';
if(window.__NEXA_V443_CLEAN__) return;
window.__NEXA_V443_CLEAN__=true;

const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const clamp=(n,a,b)=>Math.max(a,Math.min(b,Number(n)||0));
const pad=n=>String(Math.max(0,Number(n)||0)).padStart(2,'0');
const sb=()=>window.supabaseClient?.from?window.supabaseClient:(window.sb?.from?window.sb:null);
const norm=s=>String(s||'').trim().toLowerCase().replace(/[’']/g,"'").replace(/\s+/g,' ');

const PETS={
 'Cave Hyena':['Builder’s Aide','🐕',['Construction Speed +5%','Construction Speed +7%','Construction Speed +9%','Construction Speed +12%','Construction Speed +15%'],['23h','23h','23h','23h','23h'],'Skilled hyenas deliver tools to architects, increasing Construction Speed.','#67dfff','#17384a'],
 'Arctic Wolf':['Arctic Embrace','🐺',['Stamina +35','Stamina +40','Stamina +45','Stamina +50','Stamina +55','Stamina +60'],['23h','23h','23h','23h','23h','23h'],'The wolf restores Stamina when the skill is activated.','#8be8ff','#1b3c65'],
 'Musk Ox':['Burden Bearer','🐂',Array(6).fill('Instantly completes gathering at the next wilderness resource tile'),['35h','31h','27h','23h','19h','15h'],"Harnessing the Musk Ox's strength and endurance instantly completes gathering upon reaching the next wilderness resource tile. Secured Alliance Gathering Nodes are excluded.",'#d0a46b','#51351f'],
 'Giant Tapir':['Natural Intuition','🐗',['Pet Food +200','Pet Food +250','Pet Food +300','Pet Food +350','Pet Food +400','Pet Food +450','Pet Food +500'],Array(7).fill('23h'),'Natural intuition helps discover extra Pet Food.','#b59b7c','#3f3227'],
 'Titan Roc':['Razorbeak','🦅',['Enemy HP -1.5%','Enemy HP -2%','Enemy HP -2.5%','Enemy HP -3%','Enemy HP -3.5%','Enemy HP -4%','Enemy HP -5%'],Array(7).fill('20h'),'Razorbeak weakens enemy troop Health.','#c3a4ff','#32265b'],
 'Giant Elk':['Mystical Finding','🦌',Array(8).fill('Unearths an item lost on the Tundra'),['51h','47h','43h','39h','35h','31h','27h','23h'],'Guided by mystical intuition, the Giant Elk unearths an item lost on the Tundra.','#7bd9c7','#21473f'],
 'Snow Leopard':['Lightning Raid','🐆',['March Speed +15% • Enemy Lethality -1.5%','March Speed +17% • Enemy Lethality -2%','March Speed +19% • Enemy Lethality -2.5%','March Speed +21% • Enemy Lethality -3%','March Speed +23% • Enemy Lethality -3.5%','March Speed +25% • Enemy Lethality -4%','March Speed +27% • Enemy Lethality -4.5%','March Speed +30% • Enemy Lethality -5%'],Array(8).fill('20h'),'A rapid assault boosts March Speed while lowering enemy Lethality.','#aeeeff','#24446f'],
 'Cave Lion':['Feral Anthem','🦁',['Troop Attack +2.5%','Troop Attack +3%','Troop Attack +3.5%','Troop Attack +4%','Troop Attack +5%','Troop Attack +6%','Troop Attack +7%','Troop Attack +8%','Troop Attack +9%','Troop Attack +10%'],null,'A battle anthem increases Troop Attack.','#ffb24e','#5d3416'],
 'Snow Ape':['Tumbling Power','🦍',['Squad Capacity +1,500','Squad Capacity +3,000','Squad Capacity +4,500','Squad Capacity +6,000','Squad Capacity +7,500','Squad Capacity +9,000','Squad Capacity +10,500','Squad Capacity +12,000','Squad Capacity +13,500','Squad Capacity +15,000'],null,'Tumbling Power increases Squad Capacity.','#f2fbff','#486175'],
 'Iron Rhino':['Rallying Beasts','🦏',['Rally Capacity +60,000','Rally Capacity +70,000','Rally Capacity +80,000','Rally Capacity +90,000','Rally Capacity +100,000','Rally Capacity +110,000','Rally Capacity +120,000','Rally Capacity +130,000','Rally Capacity +140,000','Rally Capacity +150,000'],null,'Rallying Beasts increases Rally Capacity.','#aeb7c2','#3d444c'],
 'Saber-tooth Tiger':['Apex Assault','🐅',['Troop Lethality +2.5%','Troop Lethality +3%','Troop Lethality +3.5%','Troop Lethality +4%','Troop Lethality +5%','Troop Lethality +6%','Troop Lethality +7%','Troop Lethality +8%','Troop Lethality +9%','Troop Lethality +10%'],null,'Apex Assault increases Troop Lethality.','#ff8438','#612910'],
 'Mammoth':['Hardened Skin','🐘',['Troop Defense +2.5%','Troop Defense +3%','Troop Defense +3.5%','Troop Defense +4%','Troop Defense +5%','Troop Defense +6%','Troop Defense +7%','Troop Defense +8%','Troop Defense +9%','Troop Defense +10%'],null,'Hardened Skin increases Troop Defense.','#d7bd93','#533f2d'],
 'Frost Gorilla':['Earthbound Vigor','🦍',['Troop Health +2.5%','Troop Health +3%','Troop Health +3.5%','Troop Health +4%','Troop Health +5%','Troop Health +6%','Troop Health +7%','Troop Health +8%','Troop Health +9%','Troop Health +10%'],null,'Earthbound Vigor increases Troop Health.','#508bff','#192c63'],
 'Frostscale Chameleon':['Icy Shroud','🦎',['Enemy Defense -2.5%','Enemy Defense -3%','Enemy Defense -3.5%','Enemy Defense -4%','Enemy Defense -5%','Enemy Defense -6%','Enemy Defense -7%','Enemy Defense -8%','Enemy Defense -9%','Enemy Defense -10%'],null,'Icy Shroud lowers Enemy Defense.','#5de9c0','#174f45']
};
const PET_ALIAS={'Frost Chameleon':'Frostscale Chameleon','Sabertooth Tiger':'Saber-tooth Tiger','Saber Tooth Tiger':'Saber-tooth Tiger'};

const V4310_STD5 = ['5%','7.5%','10%','12.5%','15%'];
const V4310_WIDGETS = {
  natalia:{gear:'Gale Force',
    a:{name:'Unity',desc:'Natalia and her Polar Bear fight in perfect synchrony, increasing damage dealt.',v:['Damage Dealt +10%','Damage Dealt +15%','Damage Dealt +20%','Damage Dealt +25%','Damage Dealt +30%']},
    b:{name:'Invincibles',desc:'Natalia summons a herd of beasts to join the rally, increasing Rally Troops’ Lethality.',v:V4310_STD5.map(x=>'Rally Troop Lethality +'+x)}},
  jeronimo:{gear:'Dawnbreak',
    a:{name:'Shield of Swords',desc:'When attacking, Jeronimo forms a sword-energy shield that reduces damage received.',v:['Damage Taken -10%','Damage Taken -15%','Damage Taken -20%','Damage Taken -25%','Damage Taken -30%']},
    b:{name:'Discernment',desc:'Jeronimo attacks with a sword formation, increasing Rally Troops’ Attack.',v:V4310_STD5.map(x=>'Rally Troop Attack +'+x)}},
  molly:{gear:'Yeti Spirit',
    a:{name:'Modified Launcher',desc:'Molly wields a modified launcher that increases her damage dealt.',v:['Damage Dealt +10%','Damage Dealt +15%','Damage Dealt +20%','Damage Dealt +25%','Damage Dealt +30%']},
    b:{name:'Snowy Blessing',desc:'The blessing of the snow increases Defender Troops’ Lethality.',v:V4310_STD5.map(x=>'Defender Troop Lethality +'+x)}},
  zinman:{gear:'Woodpecker',
    a:{name:'Overclocked Nail Gun',desc:'Zinman’s Nail Gun enters Overcharged Mode, increasing his Attack.',v:['Attack +8%','Attack +12%','Attack +16%','Attack +20%','Attack +24%']},
    b:{name:'Defend to Attack',desc:'Zinman constructs an archer tower, increasing Defender Troops’ Attack.',v:V4310_STD5.map(x=>'Defender Troop Attack +'+x)}},

  flint:{gear:'Dragonbane',
    a:{name:'Vengeful Task',desc:'After Incinerator is triggered, Flint’s vengeance boosts his Attack until the end of battle.',v:['Attack +8%','Attack +12%','Attack +16%','Attack +20%','Attack +24%']},
    b:{name:'Dragonbreath',desc:'Flint fortifies his flamethrower for city defense, increasing Defender Troops’ Attack.',v:V4310_STD5.map(x=>'Defender Troop Attack +'+x)}},
  philly:{gear:'Pharmacologica',
    a:{name:'Extraction',desc:'Philly strengthens her herbal techniques, increasing their healing effects.',v:['Healing Effect +30%','Healing Effect +40%','Healing Effect +50%','Healing Effect +60%','Healing Effect +70%']},
    b:{name:'First Aid Training',desc:'Philly teaches first-aid and care techniques, increasing Defender Troops’ Health.',v:V4310_STD5.map(x=>'Defender Troop Health +'+x)}},

  logan:{gear:'Fists of Steel',
    a:{name:'Enhanced Fists of Steel',desc:'Logan modifies and upgrades Fists of Steel, increasing its damage.',v:['Damage +10%','Damage +15%','Damage +20%','Damage +25%','Damage +30%']},
    b:{name:'Strong Protection',desc:'Logan defends the city with his mighty fists, increasing Defender Troops’ Defense.',v:V4310_STD5.map(x=>'Defender Troop Defense +'+x)}},
  mia:{gear:'Fate Crystal',
    a:{name:'Vision of Truth',desc:'Mia reads the secret of fate, increasing the upper and lower limits of her fluctuating skills.',v:['Fluctuation +30','Fluctuation +60','Fluctuation +90','Fluctuation +120','Fluctuation +150']},
    b:{name:'Rally of Fate',desc:'Mia divines the best moment for an assault, increasing Rally Troops’ Attack.',v:V4310_STD5.map(x=>'Rally Troop Attack +'+x)}},
  greg:{gear:'State Edict',
    a:{name:'Courtroom Order',desc:'Greg silences the target, preventing skill use, and deals a heavy strike.',v:['Silence 3s • Damage 220%','Silence 3.5s • Damage 240%','Silence 4s • Damage 260%','Silence 4.5s • Damage 280%','Silence 5s • Damage 300%']},
    b:{name:'Trumpet of Justice',desc:'Greg rallies the army under the banner of justice, increasing Rally Troops’ Health.',v:V4310_STD5.map(x=>'Rally Troop Health +'+x)}},

  ahmose:{gear:'Guardian’s Relic',
    a:{name:'Unyielding Determination',desc:'Friendly troops under Cthugha’s Protection gain increased Attack for 2.5s.',v:['Attack +30%','Attack +33%','Attack +36%','Attack +39%','Attack +42%']},
    b:{name:'Oath of Guardian',desc:'Ahmose fortifies the city with a guardian’s resolve, increasing Defender Troops’ Health.',v:V4310_STD5.map(x=>'Defender Troop Health +'+x)}},
  reina:{gear:'Ninjaken – Raikiri',
    a:{name:'Silhouette Strike',desc:'Reina can throw an extra kunai with her Normal Attack.',v:['Extra Kunai Damage 25%','Extra Kunai Damage 30%','Extra Kunai Damage 35%','Extra Kunai Damage 40%','Extra Kunai Damage 45%']},
    b:{name:'Fiery Invasion',desc:'Reina’s precision increases Rally Troops’ Lethality.',v:V4310_STD5.map(x=>'Rally Troop Lethality +'+x)}},
  lynn:{gear:'Ella’s Tear',
    a:{name:'Aira’s Elegy',desc:'After casting Hymn of Sidrak, Lynn increases Attack until the end of battle.',v:['Attack +7%','Attack +9%','Attack +11%','Attack +13%','Attack +15%']},
    b:{name:'Iranon’s Determination',desc:'Lynn stirs defenders with a nostalgic poem, increasing Defender Troops’ Lethality.',v:V4310_STD5.map(x=>'Defender Troop Lethality +'+x)}},

  hector:{gear:'Steel Fangs',
    a:{name:'Reaper’s Embrace',desc:'Extends Sword Whirlwind and restores Hector’s Health from damage dealt.',v:['Heal 7% of Damage Dealt','Heal 9% of Damage Dealt','Heal 11% of Damage Dealt','Heal 13% of Damage Dealt','Heal 15% of Damage Dealt']},
    b:{name:'Goliath',desc:'Hector uses terrain against attackers, increasing Defender Troops’ Attack.',v:V4310_STD5.map(x=>'Defender Troop Attack +'+x)}},
  norah:{gear:'Snow Cruiser',
    a:{name:'Disruptor',desc:'Norah improves her Barrage grenades, gaining a chance to stun the target.',v:['Stun 25% • 0.6s','Stun 27.5% • 0.7s','Stun 30% • 0.8s','Stun 32.5% • 0.9s','Stun 35% • 1s']},
    b:{name:'True Grit',desc:'Norah inspires defenders with courage under fire, increasing Defender Troops’ Defense.',v:V4310_STD5.map(x=>'Defender Troop Defense +'+x)}},
  gwen:{gear:'Wings of Hope',
    a:{name:'Fire Support Unit',desc:'Gwen’s automated secondary weapon attacks a random target on skill cast.',v:['Damage 50%','Damage 55%','Damage 60%','Damage 65%','Damage 70%']},
    b:{name:'Marauder',desc:'Gwen’s offensive expertise increases Rally Troops’ Lethality.',v:V4310_STD5.map(x=>'Rally Troop Lethality +'+x)}},

  'wu ming':{gear:'Dragonslayer',
    a:{name:'Martial Zenith',desc:'Wu Ming reaches the zenith of martial arts, increasing damage dealt.',v:['Damage Dealt +10%','Damage Dealt +15%','Damage Dealt +20%','Damage Dealt +25%','Damage Dealt +30%']},
    b:{name:'Steel Discipline',desc:'Wu Ming puts defender troops under stern tutelage, increasing Defender Troops’ Defense.',v:V4310_STD5.map(x=>'Defender Troop Defense +'+x)}},
  renee:{gear:'Illusion Magiball',
    a:{name:'Dream Illusion',desc:'Renee’s attacks can confuse the target for 1 second.',v:['Confusion Chance 2%','Confusion Chance 3.5%','Confusion Chance 5%','Confusion Chance 6.5%','Confusion Chance 8%']},
    b:{name:'Wistful Enchantment',desc:'Renee’s extraordinary talents increase Rally Troops’ Lethality.',v:V4310_STD5.map(x=>'Rally Troop Lethality +'+x)}},
  wayne:{gear:'Power Boomerang',
    a:{name:'Gunslinger',desc:'Wayne unleashes a rapid five-shot barrage; Escorts can be instantly knocked down.',v:['Damage 40% • Knockdown 40%','Damage 44% • Knockdown 55%','Damage 48% • Knockdown 70%','Damage 52% • Knockdown 85%','Damage 56% • Knockdown 100%']},
    b:{name:'Offensive Defense',desc:'Wayne’s strategy increases Defender Troops’ Lethality.',v:V4310_STD5.map(x=>'Defender Troop Lethality +'+x)}},

  edith:{gear:'Charm Toolkit',
    a:{name:'Pocket Engineer',desc:'When Mr. Tin first drops below 50% Health, Edith restores Health and increases Defense until battle end.',v:['Heal 15% • Defense +10%','Heal 20% • Defense +15%','Heal 25% • Defense +20%','Heal 30% • Defense +25%','Heal 35% • Defense +30%']},
    b:{name:'Fortworks',desc:'Edith and Mr. Tin increase Defender Troops’ Health.',v:V4310_STD5.map(x=>'Defender Troop Health +'+x)}},
  gordon:{gear:'Bonecrux Venom',
    a:{name:'Potion #1325',desc:'Gordon’s chemical arsenal increases Damage Dealt and weakens poisoned targets.',v:['Damage +5%','Damage +10%','Damage +15%','Damage +20%','Damage +25%']},
    b:{name:'Bio Assault',desc:'Gordon equips allies with envenomed weaponry, increasing Rally Troops’ Lethality.',v:V4310_STD5.map(x=>'Rally Troop Lethality +'+x)}},
  bradley:{gear:'Thunder Cannon',
    a:{name:'Onslaught',desc:'Destructor further increases Attack Speed for Heroes and Escorts for 5 seconds.',v:['Attack Speed +6%','Attack Speed +8%','Attack Speed +10%','Attack Speed +12%','Attack Speed +14%']},
    b:{name:'Siege Insight',desc:'Bradley’s siege expertise increases Defender Troops’ Attack.',v:V4310_STD5.map(x=>'Defender Troop Attack +'+x)}},

  gatot:{gear:'Golden Fang',
    a:{name:'King’s Punishment',desc:'King’s Resolve gains extra shield protection and reflects damage while the shield is active.',v:['Shield 55% • Reflect 10%','Shield 65% • Reflect 15%','Shield 75% • Reflect 20%','Shield 85% • Reflect 25%','Shield 95% • Reflect 30%']},
    b:{name:'Indestructible City',desc:'Gatot increases Defender Troops’ Defense.',v:V4310_STD5.map(x=>'Defender Troop Defense +'+x)}},
  sonya:{gear:'Mangrove Frog',
    a:{name:'Chilled to the Bone',desc:'Sonya improves her cryogen formula; Extreme Cold shatters for extra damage when freezing ends.',v:['Attack +8% • Shatter 50%','Attack +12% • Shatter 55%','Attack +16% • Shatter 60%','Attack +20% • Shatter 65%','Attack +24% • Shatter 70%']},
    b:{name:'Vortex Turret',desc:'Sonya’s water turrets increase Defender Troops’ Lethality.',v:V4310_STD5.map(x=>'Defender Troop Lethality +'+x)}},
  hendrik:{gear:'Abyss Diver',
    a:{name:'Hydra’s Dance',desc:'After Song of R’lyeh ends, moving tentacles remain to draw enemy attacks.',v:['Tentacle Health 10%','Tentacle Health 15%','Tentacle Health 20%','Tentacle Health 25%','Tentacle Health 30%']},
    b:{name:'Abyssal Blessing',desc:'The abyssal spirit’s blessing increases Rally Troops’ Attack.',v:V4310_STD5.map(x=>'Rally Troop Attack +'+x)}},

  magnus:{gear:'Storm Axe',
    a:{name:'Heroic Stock',desc:'Magnus reduces incoming damage and increases Frozen Fury’s Defense bonus.',v:['Damage Taken -5% • Defense +25%','Damage Taken -7.5% • Defense +37.5%','Damage Taken -10% • Defense +50%','Damage Taken -12.5% • Defense +62.5%','Damage Taken -15% • Defense +75%']},
    b:{name:'Valoric Inspiration',desc:'Magnus inspires Defender Troops with tales of ancient heroes, increasing Health.',v:V4310_STD5.map(x=>'Defender Troop Health +'+x)}},
  fred:{gear:'Blazebearer',
    a:{name:'Idealism',desc:'Fred’s idealism increases Attack and grants Defense for each bonus dispelled, up to 5 stacks.',v:['Attack +8% • Defense/stack +2%','Attack +12% • Defense/stack +4%','Attack +16% • Defense/stack +6%','Attack +20% • Defense/stack +8%','Attack +24% • Defense/stack +10%']},
    b:{name:'Call of the Firefighter',desc:'Fred’s heroics increase Rally Troops’ Attack.',v:V4310_STD5.map(x=>'Rally Troop Attack +'+x)}},
  xura:{gear:'Witch Mask',
    a:{name:'War Cry',desc:'Xura boosts the highest-Attack ally’s damage dealt for 4 seconds.',v:['Damage +20%','Damage +30%','Damage +40%','Damage +50%','Damage +60%']},
    b:{name:'Gaiac Hymn',desc:'Xura’s ancient hymn increases Defender Troops’ Attack.',v:V4310_STD5.map(x=>'Defender Troop Attack +'+x)}},

  gregory:{gear:'Solarsword',
    a:{name:'Indomitable Armor',desc:'Gregory’s armor increases Defense and protects him from interrupting control effects.',v:['Defense +10%','Defense +20%','Defense +30%','Defense +40%','Defense +50%']},
    b:{name:'Day of the Guard',desc:'Gregory’s leadership increases Defender Troops’ Lethality.',v:V4310_STD5.map(x=>'Defender Troop Lethality +'+x)}},
  freya:{gear:'Blood Moon Scythe',
    a:{name:'Night Raid',desc:'Freya increases her Damage and instantly strikes enemy summoned units.',v:['Damage +10% • Summon Strike 100%','Damage +15% • Summon Strike 150%','Damage +20% • Summon Strike 200%','Damage +25% • Summon Strike 250%','Damage +30% • Summon Strike 300%']},
    b:{name:'Defender of the Watch',desc:'Freya’s sacred watch increases Defender Troops’ Defense.',v:V4310_STD5.map(x=>'Defender Troop Defense +'+x)}},
  blanchette:{gear:'Wolf Hunter',
    a:{name:'Hunter’s Rage',desc:'Blanchette increases Attack Speed and extends Triple Blunderbuss healing block.',v:['Attack Speed +10%','Attack Speed +15%','Attack Speed +20%','Attack Speed +25%','Attack Speed +30%']},
    b:{name:'Lightning Strike',desc:'Blanchette’s rapid rally increases Rally Troops’ Lethality.',v:V4310_STD5.map(x=>'Rally Troop Lethality +'+x)}},

  eleonora:{gear:'Scepter of Solaris',
    a:{name:'Hammer & Shield',desc:'Eleonora gains Attack above 50% Health and Defense below 50% Health.',v:['Attack +8% • Defense +25%','Attack +12% • Defense +37.5%','Attack +16% • Defense +50%','Attack +20% • Defense +62.5%','Attack +24% • Defense +75%']},
    b:{name:'Last Fortress',desc:'Eleonora inspires Defender Troops, increasing their Health.',v:V4310_STD5.map(x=>'Defender Troop Health +'+x)}},
  lloyd:{gear:'Mastercraft Treasure',
    a:{name:'Frosty Whisper',desc:'Lloyd’s mechanical cuckoos add damage to normal attacks and reduce target Attack Speed for 2 seconds.',v:['Damage +3% • Attack Speed -3%','Damage +6% • Attack Speed -6%','Damage +9% • Attack Speed -9%','Damage +12% • Attack Speed -12%','Damage +15% • Attack Speed -15%']},
    b:{name:'Steel Maze',desc:'Lloyd installs barricade traps, increasing Defender Troops’ Attack.',v:V4310_STD5.map(x=>'Defender Troop Attack +'+x)}},
  rufus:{gear:'Meteor Blaster',
    a:{name:'Ember of Conflict',desc:'Rufus’ normal attacks ignite targets for damage each second for 2 seconds.',v:['Burn Damage 6%/s','Burn Damage 12%/s','Burn Damage 18%/s','Burn Damage 24%/s','Burn Damage 30%/s']},
    b:{name:'Blazing Legion',desc:'Rufus rallies troops under a phoenix banner, increasing Rally Troops’ Attack.',v:V4310_STD5.map(x=>'Rally Troop Attack +'+x)}},

  hervor:{gear:'Hammer of Sathla',
    a:{name:'Mark of the Chieftain',desc:'Hervor’s hammer increases Attack Speed and the chance of Intimidation from normal attacks.',v:['Attack Speed +10% • Intimidation +5%','Attack Speed +15% • Intimidation +10%','Attack Speed +20% • Intimidation +15%','Attack Speed +25% • Intimidation +20%','Attack Speed +30% • Intimidation +25%']},
    b:{name:'Fort of Rock',desc:'Hervor reforges defenders in her image, increasing Defender Troops’ Defense.',v:V4310_STD5.map(x=>'Defender Troop Defense +'+x)}},
  karol:{gear:'Spirit of Winterwind',
    a:{name:'Eagle Flutter',desc:'Dawn Charge spurs friendly squads, increasing Attack Speed and Movement Speed for 5 seconds.',v:['Attack Speed +6% • Move +20%','Attack Speed +8% • Move +40%','Attack Speed +10% • Move +60%','Attack Speed +12% • Move +80%','Attack Speed +14% • Move +100%']},
    b:{name:'Triumphant March',desc:'Karol’s Eagle Brigade increases Rally Squad Attack.',v:V4310_STD5.map(x=>'Rally Squad Attack +'+x)}},
  ligeia:{gear:'Fateweaver',
    a:{name:'Spider Queen',desc:'Ligeia begins battle with Guard Spiders and increases Spider Madam’s chance to strike an extra target.',v:['Extra Target Chance 25%','Extra Target Chance 50%','Extra Target Chance 75%','2 Starting Guard Spiders • 75%','2 Starting Guard Spiders • 100%']},
    b:{name:'Trap Nest',desc:'Ligeia prepares traps for city defense, increasing Defender Troops’ Lethality.',v:V4310_STD5.map(x=>'Defender Troop Lethality +'+x)}},

  gisela:{gear:'Helacore',
    a:{name:'Energy Efficiency',desc:'Gisela gains extra Energy per Normal Attack and strengthens her shield at 100 Energy.',v:['Energy +3 • Shield 70%','Energy +6 • Shield 100%','Energy +9 • Shield 130%','Energy +12 • Shield 160%','Energy +15 • Shield 190%']},
    b:{name:'Auto-Target',desc:'Gisela’s auto-turret expertise increases Defender Troops’ Attack.',v:V4310_STD5.map(x=>'Defender Troop Attack +'+x)}},
  flora:{gear:'Kernel of Plenty',
    a:{name:'Venom’s Heart',desc:'Flora makes Adoria Roses and vines more toxic, dealing repeated damage for 2 seconds.',v:['Damage 5% per 0.5s','Damage 10% per 0.5s','Damage 15% per 0.5s','Damage 20% per 0.5s','Damage 25% per 0.5s']},
    b:{name:'Fruit of Life',desc:'Flora’s rejuvenating fruit increases Defender Troops’ Health.',v:V4310_STD5.map(x=>'Defender Troop Health +'+x)}},
  vulcanus:{gear:'Doom Sigil',
    a:{name:'Laceration',desc:'Vulcanus’ reforged arrowheads cause enhanced Bleed every 0.5 seconds for 3 seconds.',v:['Bleed 4%','Bleed 8%','Bleed 12%','Bleed 16%','Bleed 20%']},
    b:{name:'Born King',desc:'Vulcanus’ momentum increases Rally Troops’ Attack.',v:V4310_STD5.map(x=>'Rally Troop Attack +'+x)}},

  elif:{gear:'Moonscar',
    a:{name:'Blazing Edge',desc:'Elif increases her Attack Speed and the confusion chance of Ethereal Steps.',v:['Attack Speed +7% • Confusion +7%','Attack Speed +10% • Confusion +10%','Attack Speed +13% • Confusion +13%','Attack Speed +16% • Confusion +16%','Attack Speed +20% • Confusion +20%']},
    b:{name:'Guardian’s Grace',desc:'Elif inspires Defender Troops, increasing their Defense.',v:V4310_STD5.map(x=>'Defender Troop Defense +'+x)}},
  dominic:{gear:'Exobox',
    a:{name:'Illusion Mastery',desc:'Dominic perfects his magical skills, increasing Damage Dealt.',v:['Damage Dealt +5%','Damage Dealt +10%','Damage Dealt +15%','Damage Dealt +20%','Damage Dealt +25%']},
    b:{name:'Grand Fantasy',desc:'Dominic turns the battlefield into his stage, increasing Rally Troops’ Lethality.',v:V4310_STD5.map(x=>'Rally Troop Lethality +'+x)}},
  cara:{gear:'Velocomet',
    a:{name:'Techno Power',desc:'Oestermore crafters extend Gloomy Mist and increase Cara’s Normal Attack damage.',v:['Normal Attack Damage +5%','Normal Attack Damage +10%','Normal Attack Damage +15%','Normal Attack Damage +20%','Normal Attack Damage +25%']},
    b:{name:'Shrouded Haven',desc:'Cara defends the city like her hometown, increasing Defender Troops’ Lethality.',v:V4310_STD5.map(x=>'Defender Troop Lethality +'+x)}},

  hank:{gear:'Roaring Rage',
    a:{name:'Steel Barricade',desc:'When Hank uses Frenzied Slashes he gains a shield for 3 seconds.',v:['Shield 100% Attack','Shield 130% Attack','Shield 160% Attack','Shield 190% Attack','Shield 220% Attack']},
    b:{name:'Wall of Despair',desc:'Hank’s courage increases Defender Troops’ Health.',v:V4310_STD5.map(x=>'Defender Troop Health +'+x)}},
  estrella:{gear:'Dreamscape Painting',
    a:{name:'Color Burst',desc:'Enemies stained with two colors at the same time take increased damage.',v:['Enemy Damage Taken +10%','Enemy Damage Taken +15%','Enemy Damage Taken +20%','Enemy Damage Taken +25%','Enemy Damage Taken +30%']},
    b:{name:'Homeland Defense',desc:'Estrella’s painting inspires Defender Troops, increasing their Attack.',v:V4310_STD5.map(x=>'Defender Troop Attack +'+x)}},
  viveca:{gear:'Dark Star',
    a:{name:'Blood Hunt',desc:'Viveca refines her weapon from battle experience, increasing Damage Dealt.',v:['Damage Dealt +5%','Damage Dealt +10%','Damage Dealt +15%','Damage Dealt +20%','Damage Dealt +25%']},
    b:{name:'Song of Dawn',desc:'The dawn-heralding horn increases Rally Troops’ Lethality.',v:V4310_STD5.map(x=>'Rally Troop Lethality +'+x)}},

  seigel:{gear:'Blacklight Halberd',
    a:{name:'Inhuman Cast',desc:'The Blood Moon plague extends Spike Guard and restores Health from damage dealt.',v:['Heal 5% of Damage Dealt','Heal 10% of Damage Dealt','Heal 15% of Damage Dealt','Heal 20% of Damage Dealt','Heal 25% of Damage Dealt']},
    b:{name:'Hell’s Vow',desc:'Seigel’s determination increases Defender Troops’ Lethality.',v:V4310_STD5.map(x=>'Defender Troop Lethality +'+x)}},
  ursar:{gear:'Progenitor Spear',
    a:{name:'Venomous Edge',desc:'Normal attacks and Wind Tip poison targets every 0.5 seconds for 3 seconds, stacking up to three times.',v:['Poison Damage 10%','Poison Damage 15%','Poison Damage 20%','Poison Damage 25%','Poison Damage 30%']},
    b:{name:'Typhoon Drums',desc:'The drums of the ancients increase Rally Troops’ Attack.',v:V4310_STD5.map(x=>'Rally Troop Attack +'+x)}},
  aisling:{gear:'Cord of Destiny',
    a:{name:'Woodland Harmony',desc:'Aisling’s vines and Fruits of Plenty reduce target Attack Speed for 3 seconds.',v:['Attack Speed -10%','Attack Speed -15%','Attack Speed -20%','Attack Speed -25%','Attack Speed -30%']},
    b:{name:'Forest Guardian',desc:'Aisling’s defensive experience increases Defender Troops’ Defense.',v:V4310_STD5.map(x=>'Defender Troop Defense +'+x)}
  },
  alonso:{gear:'Captain Ahab',
    a:{name:"Ocean's Bounty",desc:"Alonso shares fresh fish meals with the weakest hero, restoring Health with each basic attack.",v:['Healing 3%','Healing 6%','Healing 9%','Healing 12%','Healing 15%']},
    b:{name:'Harpoon Enhancement',desc:"Alonso improves the troops’ weapons, increasing Rally Troops’ Lethality.",v:['Rally Troop Lethality +5%','Rally Troop Lethality +7.5%','Rally Troop Lethality +10%','Rally Troop Lethality +12.5%','Rally Troop Lethality +15%']}
  }
};


const OPS=[['battle_strategist','Battle Strategist'],['event_operator','Event Operator'],['scheduler','Scheduler'],['transfer_coordinator','Transfer Coordinator']];
const MODULES=[['svs_access','SvS'],['transfer_access','Transfer'],['sbs_access','SBS'],['team_builder_access','Team Builder'],['forms_access','Forms'],['events_access','Events'],['library_access','Library'],['administration_access','Administration']];

function injectCSS(){
  if($('#nexa-v44-css')) return;
  const st=document.createElement('style');
  st.id='nexa-v44-css';
  st.textContent=`
  /* Exclusive Gear / Widgets: ALWAYS horizontal rows */
  #nexa-v33-detail .v44-widget-section .v33-skills{
    display:grid!important;grid-template-columns:1fr!important;gap:8px!important;
  }
  #nexa-v33-detail .v44-widget-section .v44-widget-row{
    display:grid!important;
    grid-template-columns:minmax(118px,.8fr) minmax(0,1.7fr) minmax(104px,.72fr)!important;
    gap:10px!important;align-items:center!important;padding:11px 12px!important;
    border:1px solid rgba(145,102,255,.22)!important;border-radius:14px!important;
    background:rgba(10,14,34,.58)!important;
  }
  .v44-widget-name b{display:block;color:#fff;font-size:12px;line-height:1.2}
  .v44-widget-name span{display:block;margin-top:3px;color:#74e9ff;font-size:8px;font-weight:950;letter-spacing:.12em}
  .v44-widget-desc{color:#c8d0e4;font-size:9px;line-height:1.4}
  .v44-widget-buff{padding:8px 9px;border:1px solid rgba(143,90,255,.42);border-radius:10px;background:rgba(65,37,121,.30);color:#fff;font-size:10px;font-weight:900;text-align:center}
  .v44-natalia-bear{
    width:30px;height:30px;display:inline-grid;place-items:center;margin-right:7px;border-radius:50%;
    border:1px solid rgba(118,226,255,.6);background:radial-gradient(circle,rgba(213,248,255,.28),rgba(12,31,60,.88));
    box-shadow:0 0 10px rgba(112,224,255,.6),0 0 22px rgba(87,158,255,.25);
    filter:drop-shadow(0 0 4px #bff6ff);font-size:18px;vertical-align:middle
  }
  @media(max-width:520px){
    #nexa-v33-detail .v44-widget-section .v44-widget-row{
      grid-template-columns:minmax(95px,.72fr) minmax(0,1.45fr) minmax(90px,.7fr)!important;gap:7px!important
    }
    .v44-widget-desc{font-size:8.5px}
  }


  /* V44.3 hero signature trait cards */
  .v443-trait-card{
    display:grid!important;grid-template-columns:46px minmax(0,1fr)!important;gap:10px!important;align-items:center!important;
  }
  .v443-trait-icon{
    width:42px;height:42px;border-radius:50%;display:grid;place-items:center;font-size:22px;
    border:1px solid rgba(255,194,75,.68);background:radial-gradient(circle,rgba(255,197,83,.13),rgba(17,13,24,.94));
    box-shadow:0 0 12px rgba(255,184,62,.28)
  }
  .v443-trait-copy b{display:block;color:#fff;font-size:14px;line-height:1.12}
  .v443-trait-copy span{display:block;margin-top:4px;color:#e6e8f2;font-size:11px;line-height:1.3}
  .v44-natalia-bear{font-size:20px!important;filter:drop-shadow(0 0 6px #bff6ff)!important}

  /* Pets */
  .v44-pet{--pet:#70eaff;--petbg:#17384a;padding:12px;border:1px solid color-mix(in srgb,var(--pet) 40%,transparent);border-radius:17px;background:linear-gradient(145deg,color-mix(in srgb,var(--petbg) 42%,#071128),#071020)}
  .v44-pet-head{display:grid;grid-template-columns:52px minmax(0,1fr);gap:10px;align-items:center;width:100%;padding:0;border:0;background:transparent;color:#fff;text-align:left}
  .v44-pet-orb{width:50px;height:50px;border-radius:50%;display:grid;place-items:center;font-size:28px;border:1px solid color-mix(in srgb,var(--pet) 75%,white 10%);background:radial-gradient(circle,color-mix(in srgb,var(--pet) 16%,var(--petbg)),#071225 70%);box-shadow:0 0 12px color-mix(in srgb,var(--pet) 70%,transparent),0 0 30px color-mix(in srgb,var(--pet) 28%,transparent);filter:drop-shadow(0 0 5px var(--pet))}
  .v44-pet-copy b{display:block;font-size:13px}.v44-pet-copy small{display:block;margin-top:3px;color:var(--pet);font-size:8px;font-weight:950;letter-spacing:.09em}
  .v44-pet-desc{margin:9px 0 0;padding:9px 10px;border-radius:11px;background:rgba(4,10,27,.55);color:#cbd3e7;font-size:10px;line-height:1.45}
  .v44-pet select{width:100%;margin-top:9px;padding:9px 10px;border:1px solid rgba(115,139,199,.26);border-radius:11px;background:#071027;color:#fff;font-size:16px}
  .v44-pet-result{display:grid;gap:3px;margin-top:9px;padding:10px;border-radius:12px;border:1px solid color-mix(in srgb,var(--pet) 35%,transparent);background:color-mix(in srgb,var(--pet) 8%,#081027)}
  .v44-pet-result small{color:#8d99b9;font-size:8px;font-weight:950;letter-spacing:.12em}.v44-pet-result strong{color:var(--pet);font-size:12px}.v44-pet-result span{color:#b0bad2;font-size:9px}

  /* Ministry beside profile name */
  #nexa-v44-ministry{
    width:34px!important;height:34px!important;flex:0 0 34px!important;display:inline-grid!important;place-items:center!important;
    padding:0!important;border-radius:50%!important;border:1px solid rgba(255,205,82,.82)!important;
    background:linear-gradient(135deg,#3b2a08,#171006)!important;color:#ffd45e!important;
    box-shadow:0 0 12px rgba(255,190,54,.34),inset 0 0 12px rgba(255,216,103,.08)!important;font-size:17px!important
  }
  #nexa-v44-ministry:hover,#nexa-v44-ministry:active{box-shadow:0 0 21px rgba(255,190,54,.56)!important}
  #nexa-v425-ministry{display:none!important}

  /* Main + Alliance */
  .v44-main-badge{display:inline-flex;width:max-content;max-width:100%;margin:8px 0 0;padding:5px 9px;border:1px solid rgba(255,211,96,.35);border-radius:999px;background:rgba(72,51,13,.22);color:#ffd879;font-size:8px;font-weight:950;letter-spacing:.08em;white-space:nowrap}
  .v44-alliance-note{display:grid;gap:2px;margin:3px 0 7px}.v44-alliance-note b{color:#75e7ff;font-size:9px}.v44-alliance-note small{color:#8e99b9;font-size:8px}

  /* Charms */
  .v33-charm-img,.v33-charm-mini-row img{opacity:1!important;visibility:visible!important;display:block!important;background:transparent!important;object-fit:contain!important}

  /* Compact Transfer Center */
  #home-transfers-section h2,#home-transfers-section h3,#nexa-v430-transfer-card h3,#nexa-transfer-card h3,[data-nexa-transfer] h3{
    font-size:16px!important;line-height:1.15!important;margin:3px 0 4px!important
  }

  /* Owner access */
  .v44-owner-manager{display:grid;gap:12px;margin:12px 0 16px;padding:14px;border:1px solid rgba(78,213,255,.32);border-radius:18px;background:linear-gradient(145deg,rgba(7,29,50,.92),rgba(7,10,31,.97))}
  .v44-owner-manager select{width:100%;padding:10px;border:1px solid rgba(112,136,201,.28);border-radius:11px;background:#071027;color:#fff;font-size:16px}
  .v44-check-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px}
  .v44-check-grid label{display:flex;align-items:center;gap:7px;padding:8px;border:1px solid rgba(255,255,255,.10);border-radius:11px;background:rgba(5,11,29,.52);font-size:9px;color:#cbd3e7}
  .v44-check-grid input{width:18px;height:18px}
  .v44-badges{display:flex;gap:6px;flex-wrap:wrap}.v44-badge{border:1px solid rgba(72,209,255,.36);border-radius:999px;padding:6px 9px;background:rgba(13,51,72,.62);color:#d4f8ff;font-size:8px;font-weight:900}
  `;
  document.head.appendChild(st);
}


function v443CurrentHero(){
  return norm($('.v33-title h3','#nexa-v33-detail')?.textContent||'');
}
function repairHeroSignatureTrait(){
  const root=$('#nexa-v33-detail');
  if(!root?.classList.contains('open'))return;
  const hero=v443CurrentHero();
  const cfg=hero==='natalia'
    ? {needle:'Ursus Strength',icon:'🐻‍❄️',title:'Ursus Strength',labels:['Attack','Defense']}
    : hero==='jeronimo'
      ? {needle:'Natural Leader',icon:'⚔️',title:'Natural Leader',labels:['Lethality','Health']}
      : null;
  if(!cfg)return;

  const candidates=$$('*',root).filter(el=>{
    if(!String(el.textContent||'').includes(cfg.needle))return false;
    return !Array.from(el.children).some(c=>String(c.textContent||'').includes(cfg.needle));
  });
  const leaf=candidates[0]; if(!leaf)return;
  const card=leaf.closest('.v33-result,.v33-hero-stat,.v33-bonus,.v33-section div')||leaf.parentElement;
  if(!card||card.dataset.v443Trait==='1')return;

  const raw=String(card.textContent||'').replace(/\s+/g,' ');
  const vals=cfg.labels.map(label=>{
    const m=raw.match(new RegExp(label+'\\s*\\+?(-?[\\d.]+)%','i'));
    return m?`${label} +${m[1]}%`:`${label} +0%`;
  });
  card.dataset.v443Trait='1';
  card.classList.add('v443-trait-card');
  card.innerHTML=`<span class="v443-trait-icon">${cfg.icon}</span><span class="v443-trait-copy"><b>${cfg.title}</b><span>${vals.join(' • ')}</span></span>`;
}

function widgetSkillLevel(widgetLv, first){
  return first ? clamp(Math.ceil(widgetLv/2),0,5) : clamp(Math.floor(widgetLv/2),0,5);
}
function repairWidget(){
  const root=$('#nexa-v33-detail');
  if(!root?.classList.contains('open')) return;
  const hero=norm($('.v33-title h3',root)?.textContent||'');
  const d=V4310_WIDGETS[hero];
  if(!d) return;
  const sec=$$('.v33-section',root).find(x=>/EXCLUSIVE GEAR|WIDGET/i.test($('.v33-kicker span',x)?.textContent||''));
  if(!sec) return;
  const lv=clamp(Number($('[data-v33-widget].active',sec)?.dataset.v33Widget || root.dataset.widgetLevel || 0),0,10);
  const aLv=widgetSkillLevel(lv,true), bLv=widgetSkillLevel(lv,false);
  const title=$('.v33-kicker strong',sec); if(title) title.textContent=`${d.gear} • LV ${lv}`;
  let skills=$('.v33-skills',sec); if(!skills){skills=document.createElement('div');skills.className='v33-skills';sec.appendChild(skills)}
  sec.classList.add('v44-widget-section');
  const bear=hero==='natalia'?'<span class="v44-natalia-bear" aria-label="Kasia the polar bear">🐻‍❄️</span>':'';
  const av=aLv?d.a.v[aLv-1]:'Unlocks at Widget Lv 1';
  const bv=bLv?d.b.v[bLv-1]:'Unlocks at Widget Lv 2';
  skills.innerHTML=`
    <article class="v44-widget-row">
      <div class="v44-widget-name">${bear}<b>${esc(d.a.name)}</b><span>EXPLORATION</span></div>
      <div class="v44-widget-desc">${esc(d.a.desc)}</div>
      <div class="v44-widget-buff">${esc(av)}</div>
    </article>
    <article class="v44-widget-row">
      <div class="v44-widget-name"><b>${esc(d.b.name)}</b><span>EXPEDITION</span></div>
      <div class="v44-widget-desc">${esc(d.b.desc)}</div>
      <div class="v44-widget-buff">${esc(bv)}</div>
    </article>`;
}

function petName(){
  const root=$('#nexa-v33-detail');
  const raw=($('.v33-title h3',root)?.textContent||'').trim();
  return PET_ALIAS[raw]||raw;
}
function repairPet(){
  const root=$('#nexa-v33-detail');
  if(!root?.classList.contains('open')) return;
  const name=petName(), d=PETS[name];
  if(!d) return;
  const sheet=$('.v33-sheet',root), head=$('.v33-detail-head',root);
  if(!sheet||!head) return;

  $$('.v33-section',sheet).forEach(sec=>{
    if(sec.classList.contains('v44-pet')) return;
    const txt=(sec.textContent||'').replace(/\s+/g,' ').toUpperCase();
    if(txt.includes('PET LEVEL') || txt.includes('PET SKILL')) sec.style.setProperty('display','none','important');
  });

  let host=$('.v44-pet',sheet);
  if(!host){
    host=document.createElement('section');
    host.className='v33-section v44-pet';
    head.insertAdjacentElement('afterend',host);
  }else if(host.previousElementSibling!==head){
    head.insertAdjacentElement('afterend',host);
  }

  const nativeSkill=$('[data-v33-pet-skill]',root);
  const savedLv=clamp(Number(nativeSkill?.value||root.dataset.petSkill||1),1,d[2].length);
  const current=clamp(Number($('[data-v44-pet-level]',host)?.value||savedLv),1,d[2].length);
  host.style.setProperty('--pet',d[5]);
  host.style.setProperty('--petbg',d[6]);
  const cooldown=d[3]?.[current-1]||'—';

  host.innerHTML=`
    <button type="button" class="v44-pet-head" data-v44-pet-details>
      <span class="v44-pet-orb">${d[1]}</span>
      <span class="v44-pet-copy"><b>${esc(d[0])}</b><small>TAP TO VIEW PET SKILL DETAILS</small></span>
    </button>
    <div class="v44-pet-desc" hidden>${esc(d[4])}</div>
    <label style="display:block;margin-top:8px;color:#92a0c3;font-size:8px;font-weight:900">PET SKILL LEVEL
      <select data-v44-pet-level>${d[2].map((_,i)=>`<option value="${i+1}" ${i+1===current?'selected':''}>Lv ${i+1}</option>`).join('')}</select>
    </label>
    <div class="v44-pet-result"><small>PET BUFF</small><strong>${esc(d[2][current-1])}</strong><span>Cooldown: ${esc(cooldown)}</span></div>`;
}

function charmTypeFromText(s){
  s=String(s||'').toLowerCase();
  if(/helmet|watch|lancer/.test(s)) return 'lancer';
  if(/coat|pants|infantry/.test(s)) return 'infantry';
  return 'marksman';
}
function charmSrc(type,lv){ return lv?`/lv${pad(lv)}-${type}.png`:''; }
function repairCharms(){
  const root=$('#nexa-profile-modal'); if(!root) return;
  const detail=$('#nexa-v33-detail');
  if(detail?.classList.contains('open')){
    const type=charmTypeFromText(($('.v33-title h3',detail)?.textContent||'')+' '+($('.v33-charm-gear-head',detail)?.textContent||''));
    $$('.v33-charm-row',detail).forEach(row=>{
      const sel=$('[data-v33-charm-level]',row); if(!sel) return;
      const lv=clamp(Number(sel.value||0),0,18);
      const body=$('.v33-charm-body',row); if(!body) return;
      let img=$('.v33-charm-img',row), ph=$('.v33-charm-placeholder',row);
      if(!lv){img?.remove();return}
      if(!img){img=document.createElement('img');img.className='v33-charm-img';if(ph)ph.replaceWith(img);else body.prepend(img)}
      img.onerror=null;img.src=charmSrc(type,lv);img.alt=`${type} Charm Lv ${lv}`;
    });
  }
  refreshCharmGridFromSaved();
}

let v443CharmBusy=false, v443CharmLast=0;
async function v443AccountId(){
  if(window.NEXA_ACTIVE_ACCOUNT_ID)return String(window.NEXA_ACTIVE_ACCOUNT_ID);
  const c=sb();if(!c)return null;
  try{
    const {data:{user}}=await c.auth.getUser();if(!user)return null;
    const playerId=String($('#nexa-profile-player-id')?.textContent||'').trim();
    let q=null;
    if(playerId&&playerId!=='—')q=await c.from('player_accounts').select('id').eq('user_id',user.id).eq('player_id',playerId).maybeSingle();
    if(!q?.data?.id)q=await c.from('player_accounts').select('id').eq('user_id',user.id).order('is_main',{ascending:false}).limit(1).maybeSingle();
    if(q?.data?.id){window.NEXA_ACTIVE_ACCOUNT_ID=String(q.data.id);return String(q.data.id)}
  }catch{}
  return null;
}
async function refreshCharmGridFromSaved(force=false){
  const root=$('#nexa-profile-modal'); if(!root) return;
  const rows=$$('.v33-charm-mini-row',root); if(!rows.length) return;
  const now=Date.now(); if(v443CharmBusy || (!force && now-v443CharmLast<220)) return;
  const c=sb(), accountId=await v443AccountId(); if(!c||!accountId) return;
  v443CharmBusy=true;v443CharmLast=now;
  try{
    const {data,error}=await c.from('player_library_inventory')
      .select('library_item_id,progress')
      .eq('player_account_id',accountId);
    if(error)return;
    const map=new Map((data||[]).map(x=>[String(x.library_item_id),x.progress||{}]));
    $$('.v33-item[data-v33-item]',root).forEach(card=>{
      const row=$('.v33-charm-mini-row',card); if(!row)return;
      const p=map.get(String(card.dataset.v33Item))||{};
      const levels=Array.isArray(p.charm_levels)?p.charm_levels:[p.charm_1||0,p.charm_2||0,p.charm_3||0];
      const type=charmTypeFromText(card.textContent||'');
      row.innerHTML=levels.slice(0,3).map(raw=>{
        const lv=clamp(Number(raw||0),0,18);
        return lv
          ? `<img src="${charmSrc(type,lv)}" alt="${type} Charm Lv ${lv}" style="opacity:1!important">`
          : '<i>◇</i>';
      }).join('');
    });
  }finally{v443CharmBusy=false}
}

function installMinistry(){
  const old=$('#nexa-v425-ministry');
  const line=$('.nexa-profile-name-line'); if(!line) return;
  if(old){
    old.style.setProperty('display','none','important');
    old.setAttribute('aria-hidden','true');
    let legacyRow=old.parentElement;
    if(legacyRow && legacyRow!==line && !legacyRow.querySelector('#nexa-profile-edit-btn')){
      legacyRow.style.setProperty('display','none','important');
      legacyRow.setAttribute('aria-hidden','true');
    }
    const scheduleBox=$$('*','#nexa-profile-modal').find(el=>{
      const txt=String(el.textContent||'').replace(/\s+/g,' ').trim();
      return /Ministry Schedule/i.test(txt) && !Array.from(el.children).some(c=>/Ministry Schedule/i.test(String(c.textContent||'')));
    });
    if(scheduleBox){
      let box=scheduleBox;
      for(let i=0;i<4 && box?.parentElement && box.parentElement!==line;i++){
        if(box.querySelector?.('#nexa-profile-edit-btn'))break;
        if(box.querySelector?.('button,select,input') || box.children.length<=6){box.style.setProperty('display','none','important');break}
        box=box.parentElement;
      }
    }
  }
  let btn=$('#nexa-v44-ministry');
  if(!btn){
    btn=document.createElement('button');btn.id='nexa-v44-ministry';btn.type='button';
    btn.title='Ministry Appointments';btn.setAttribute('aria-label','Ministry Appointments');
    btn.innerHTML=`<svg viewBox="0 0 24 24" width="19" height="19" aria-hidden="true">
      <rect x="4" y="5.5" width="16" height="14" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.8"/>
      <path d="M8 3.5v4M16 3.5v4M4.5 9.5h15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M8 13h3M13.5 13h2.5M8 16h3M13.5 16h2.5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
    </svg>`;
    line.appendChild(btn);
    btn.addEventListener('click',()=>{
      const legacy=$('#nexa-v425-ministry');if(!legacy)return;
      const row=legacy.parentElement;if(row)row.style.removeProperty('display');
      legacy.style.removeProperty('display');legacy.click();
      legacy.style.setProperty('display','none','important');
      if(row&&row!==line)row.style.setProperty('display','none','important');
    });
  }
}

function repairProfileIdentity(){
  const root=$('#nexa-profile-modal'); if(!root) return;

  // Remove the legacy lower Alliance/Main-account card as one whole unit.
  const all=$$('div,section,article,label',root);
  const legacyCandidates=all.filter(el=>{
    const txt=String(el.textContent||'').replace(/\s+/g,' ').trim();
    return /This is your\s+Main\s+account/i.test(txt) && !!el.querySelector('select');
  }).sort((a,b)=>(a.textContent||'').length-(b.textContent||'').length);
  const legacy=legacyCandidates[0];
  if(legacy && !legacy.closest('#nexa-profile-editor')){
    legacy.remove();
  }else{
    $$('*',root).forEach(el=>{
      if(el.children.length)return;
      if(/This is your\s+Main\s+account/i.test(String(el.textContent||'')))el.remove();
    });
  }

  // Remove the long duplicated Alliance helper.
  $$('*',root).forEach(el=>{
    if(el.children.length)return;
    const txt=String(el.textContent||'').replace(/\s+/g,' ').trim();
    if(/Select your new alliance below, then use the existing Save Profile button/i.test(txt)){
      const wrap=el.closest('.nexa-v437-alliance-note,p,small,div');
      if(wrap&&wrap!==root)wrap.remove();else el.remove();
    }
  });

  const editor=$('#nexa-profile-editor',root); if(!editor) return;
  const allianceSel=$$('select',editor).find(sel=>/alliance/i.test(sel.closest('label,.form-group,.profile-field,.nexa-profile-field,div')?.textContent||''));
  if(allianceSel){
    const host=allianceSel.closest('label,.form-group,.profile-field,.nexa-profile-field,div')||allianceSel.parentElement;
    $$('.v44-alliance-note,.nexa-v437-alliance-note,.v44-main-badge,.nexa-v437-main',host).forEach(x=>x.remove());
    const note=document.createElement('div');note.className='v44-alliance-note';
    note.innerHTML='<b>Change Alliance</b><small>Select the alliance, then Save Profile.</small>';
    allianceSel.before(note);
    const badge=document.createElement('span');badge.className='v44-main-badge';badge.textContent='★ MAIN ACCOUNT';host.appendChild(badge);
  }
}

async function ownerAccess(){
  const c=sb(); if(!c) return;
  let user,role='';
  try{({data:{user}}=await c.auth.getUser()); if(!user)return; role=String((await c.rpc('current_nexa_role')).data||'').toLowerCase();}catch{return}
  if(role!=='owner') return;
  let accounts=[],roles=[],access={};
  try{
    const [a,r,m]=await Promise.all([
      c.from('player_accounts').select('id,in_game_name,player_id,is_main').eq('user_id',user.id).order('is_main',{ascending:false}),
      c.from('nexa_operational_roles').select('role').eq('user_id',user.id),
      c.from('staff_module_access').select('*').eq('user_id',user.id).maybeSingle()
    ]);
    accounts=a.data||[];roles=(r.data||[]).map(x=>x.role);access=m.data||{};
  }catch{}
  const host=$('#admin-roles .nexa-v25-host')||$('#admin-roles'); if(!host) return;
  let box=$('.v44-owner-manager',host); if(!box){box=document.createElement('section');box.className='v44-owner-manager';host.prepend(box)}
  const main=accounts.find(a=>a.is_main)||accounts[0], linked=accounts.filter(a=>a!==main).map(a=>a.in_game_name).filter(Boolean);
  box.innerHTML=`
    <div><b style="color:#82eaff;font-size:9px;letter-spacing:.12em">NEXA USER ACCESS</b>
    <strong style="display:block;margin-top:5px">Main Account: ${esc(main?.in_game_name||'—')}</strong>
    <small style="display:block;color:#93a2c4">${linked.length?'Linked accounts: '+esc(linked.join(', ')):'No linked alternate accounts'}</small></div>
    <label style="font-size:8px;color:#9ba7c5">OPERATIONAL ROLE<select data-v44-role><option value="">Add operational role…</option>${OPS.filter(([k])=>!roles.includes(k)).map(([k,n])=>`<option value="${k}">${n}</option>`).join('')}</select></label>
    <div class="v44-badges">${roles.map(k=>`<button type="button" class="v44-badge" data-v44-remove-role="${k}">${esc(OPS.find(x=>x[0]===k)?.[1]||k)} ×</button>`).join('')}</div>
    <div class="v44-check-grid">${MODULES.map(([k,n])=>`<label><input type="checkbox" data-v44-module="${k}" ${access[k]?'checked':''}>${n}</label>`).join('')}</div>
    <small data-v44-msg style="color:#8debc7"></small>`;
  const msg=$('[data-v44-msg]',box);
  $('[data-v44-role]',box).onchange=async e=>{if(!e.target.value)return;msg.textContent='Saving…';const q=await c.rpc('nexa_owner_add_my_operational_role',{new_role:e.target.value});msg.textContent=q.error?q.error.message:'Role added ✓';if(!q.error)schedule()};
  $$('[data-v44-remove-role]',box).forEach(b=>b.onclick=async()=>{msg.textContent='Saving…';const q=await c.rpc('nexa_owner_remove_my_operational_role',{old_role:b.dataset.v44RemoveRole});msg.textContent=q.error?q.error.message:'Role removed ✓';if(!q.error)schedule()});
  $$('[data-v44-module]',box).forEach(ch=>ch.onchange=async()=>{
    const state=Object.fromEntries(MODULES.map(([k])=>[k,!!$(`[data-v44-module="${k}"]`,box)?.checked]));
    msg.textContent='Saving module access…';
    const q=await c.rpc('nexa_owner_set_my_module_access',{new_svs:state.svs_access,new_transfer:state.transfer_access,new_sbs:state.sbs_access,new_team_builder:state.team_builder_access,new_forms:state.forms_access,new_events:state.events_access,new_library:state.library_access,new_administration:state.administration_access});
    msg.textContent=q.error?q.error.message:'Module access updated ✓';
  });
}

function closeMenuOutside(e){
  const menu=$('#nexa-home-menu'), toggle=$('#nexa-home-menu-toggle');
  if(!menu?.classList.contains('open')) return;
  if(e.target.closest?.('#nexa-home-menu-card,#nexa-home-menu-toggle')) return;
  menu.classList.remove('open');toggle?.classList.remove('open');menu.setAttribute('aria-hidden','true');toggle?.setAttribute('aria-expanded','false');
}

function repairMyProfileGuide(){
  const overlays=$$('div,section').filter(el=>{
    const txt=String(el.textContent||'').replace(/\s+/g,' ');
    return /\bGUIDE\b/i.test(txt)&&/\bMy Profile\b/i.test(txt);
  }).sort((a,b)=>(a.textContent||'').length-(b.textContent||'').length);
  const box=overlays[0];if(!box)return;
  const paras=$$('p',box);
  const p=paras.find(x=>/Swipe categories|Library card|Troop tier|Fire Crystal/i.test(x.textContent||''))||paras[0];
  if(p)p.innerHTML='My Profile stores this account’s <b>Heroes, Experts, Troops, Pets, Chief Gear and Charms</b>. Choose a category, open an item, set its levels or options, then tap <b>Save</b>. <b>Reset</b> clears only that item’s saved profile data. Generation filters only change what you are viewing. Use the <b>gold calendar beside your name</b> for Ministry Appointments.';
}

function apply(){
  injectCSS();
  installMinistry();
  repairWidget();
  repairHeroSignatureTrait();
  repairPet();
  repairCharms();
  repairProfileIdentity();
  repairMyProfileGuide();
  ownerAccess();
}
function schedule(){
  requestAnimationFrame(apply);
  [30,90,180,360,700,1200].forEach(ms=>setTimeout(apply,ms));
}

document.addEventListener('pointerdown',closeMenuOutside,true);
document.addEventListener('click',e=>{
  if(e.target.closest?.('[data-v33-widget],[data-v33-item],[data-v33-cat],[data-v33-gen],[data-v33-reset],#nexa-profile-edit-btn,#admin-roles,#admin-permissions,[data-v33-save],.nexa-info')) schedule();
  if(e.target.closest?.('[data-v33-reset]')){
    [1400,1900,2600,3400].forEach(ms=>setTimeout(apply,ms));
  }
  if(e.target.closest?.('[data-v33-cat]'))setTimeout(()=>refreshCharmGridFromSaved(true),120);
  if(e.target.closest?.('[data-v33-save]'))[180,500,950].forEach(ms=>setTimeout(()=>refreshCharmGridFromSaved(true),ms));
  if(e.target.closest?.('[data-v44-pet-details]')){
    const d=e.target.closest('.v44-pet')?.querySelector('.v44-pet-desc'); if(d)d.hidden=!d.hidden;
  }
},true);
document.addEventListener('change',e=>{
  if(e.target.matches?.('[data-v44-pet-level]')){
    const name=petName(),d=PETS[name],lv=clamp(Number(e.target.value),1,d?.[2]?.length||1),host=e.target.closest('.v44-pet');
    if(d&&host){host.querySelector('.v44-pet-result strong').textContent=d[2][lv-1];host.querySelector('.v44-pet-result span').textContent='Cooldown: '+(d[3]?.[lv-1]||'—')}
  }
  if(e.target.matches?.('[data-v33-widget],[data-v33-charm-level],#account-purpose')) schedule();
  if(e.target.matches?.('[data-v33-charm-level]'))setTimeout(()=>refreshCharmGridFromSaved(true),180);
},true);
window.addEventListener('nexa:profile-open',schedule);
window.addEventListener('nexa:profile-updated',schedule);
window.addEventListener('pageshow',schedule);
window.addEventListener('load',schedule);
schedule();

})();
