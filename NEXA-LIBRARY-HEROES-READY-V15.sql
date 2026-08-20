begin;

insert into public.nexa_library_items
  (item_type,slug,name,image_url,generation,troop_type,rarity,metadata,source_urls,is_visible,is_active,sort_order,last_synced_at,updated_at)
values
('hero','ling-xue','Ling Xue','https://gom-s3-user-avatar.s3.us-west-2.amazonaws.com/wp-content/uploads/2024/12/%E5%87%8C%E9%9B%AA350.jpg',0,'lancer','Epic',
 '{"expedition_skills":[{"name":"Fearsome Aura","effect":"Enemy Troops Attack Down:","description":"Reduces enemy troops Attack by 4–20%."},{"name":"Total Control","effect":"Training Speed Up:","description":"Increases troop Training Speed by 4–20%."}]}'::jsonb,
 '["https://www.whiteoutsurvival.wiki/heroes/","https://www.whiteoutsurvival-community.com/guides/heroes/en/ling_xue.html"]'::jsonb,true,true,115,now(),now()),

('hero','eleonora','Eleonora','https://www.whiteoutsurvival-community.com/assets/heroes/thumbs/ZnP04KV.jpg',11,'infantry','Legendary',
 '{"expedition_skills":[{"name":"Scorching Sun","effect":"Health Up:","description":"Increases Health by 5–25% for all troops."},{"name":"Solaris Nexus","effect":"Infantry Protection / Marksman Damage:","description":"Reduces Infantry Damage Taken by 2–10% and increases Marksmen Damage Dealt by 2–10%."},{"name":"Soaring Flame","effect":"Damage Up / Damage Taken Down:","description":"Every 5 Infantry attacks, increases all troops Damage Dealt and reduces Damage Taken by 5–25% for 2 turns."}]}'::jsonb,
 '["https://www.whiteoutsurvival.wiki/server-timeline-server-age/","https://www.whiteoutsurvival-community.com/guides/heroes/en/eleonora.html"]'::jsonb,false,true,1101,now(),now()),
('hero','lloyd','Lloyd','https://www.whiteoutsurvival-community.com/assets/heroes/thumbs/xXWr41z.jpg',11,'lancer','Legendary',
 '{"expedition_skills":[{"name":"Bird Invasion","effect":"Enemy Lethality Down:","description":"Reduces enemy troops Lethality by 4–20%."},{"name":"Iceflare Bomb","effect":"Lancer Damage / Enemy Lethality:","description":"Every 3 turns, increases Lancer attack damage by 30–150% and reduces enemy Lethality by 6–30% for 1 turn."},{"name":"Ingenious Mastery","effect":"Lethality Up:","description":"Grants a 40% chance to increase all troops Lethality by 10–50%."}]}'::jsonb,
 '["https://www.whiteoutsurvival.wiki/server-timeline-server-age/","https://www.whiteoutsurvival-community.com/guides/heroes/en/lloyd.html"]'::jsonb,false,true,1102,now(),now()),
('hero','rufus','Rufus','https://www.whiteoutsurvival-community.com/assets/heroes/thumbs/cTnxjhw.jpg',11,'marksman','Legendary',
 '{"expedition_skills":[{"name":"Inferno Regiment","effect":"Attack Up:","description":"Increases Attack by 5–25% for all troops."},{"name":"Armor Crush","effect":"Infantry Damage / Damage Taken:","description":"Infantry deal 12–60% more damage per attack and the target takes 5–25% more damage for 1 turn."},{"name":"Wrathful Quake","effect":"Enemy Lethality Down:","description":"Grants a 20% chance to reduce enemy Lethality by 10–50% for 2 turns."}]}'::jsonb,
 '["https://www.whiteoutsurvival.wiki/server-timeline-server-age/","https://www.whiteoutsurvival-community.com/guides/heroes/en/rufus.html"]'::jsonb,false,true,1103,now(),now()),

('hero','hervor','Hervor','https://www.whiteoutsurvival-community.com/assets/heroes/thumbs/ZGueEtz.jpg',12,'infantry','Legendary',
 '{"expedition_skills":[{"name":"Call For Blood","effect":"Lethality Up:","description":"Increases Lethality by 5–25% for all troops."},{"name":"Undying","effect":"Infantry Damage Taken Down:","description":"Reduces Infantry normal-attack damage taken by 5–25% and skill damage taken by 6–30%."},{"name":"Bloodthirsty","effect":"Infantry Protection / Damage:","description":"Reduces Infantry Damage Taken by 3–15% and increases Damage Dealt by 2–10%."}]}'::jsonb,
 '["https://www.whiteoutsurvival.wiki/server-timeline-server-age/","https://www.whiteoutsurvival-community.com/guides/heroes/en/hervor.html"]'::jsonb,false,true,1201,now(),now()),
('hero','karol','Karol','https://www.whiteoutsurvival-community.com/assets/heroes/thumbs/H0S68JV.jpg',12,'lancer','Legendary',
 '{"expedition_skills":[{"name":"In the Wings","effect":"Damage Taken Down:","description":"Reduces Damage Taken by 4–20% for all troops."},{"name":"Shieldbreaker","effect":"Damage Up:","description":"Increases damage against Lancers by 6–30% and against Infantry by 5–25%."},{"name":"Standard of Ages","effect":"Attack / Defense Up:","description":"Increases Attack by 3–15% and Defense by 2–10% for all troops."}]}'::jsonb,
 '["https://www.whiteoutsurvival.wiki/server-timeline-server-age/","https://www.whiteoutsurvival-community.com/guides/heroes/en/karol.html"]'::jsonb,false,true,1202,now(),now()),
('hero','ligeia','Ligeia','https://www.whiteoutsurvival-community.com/assets/heroes/thumbs/bnlujf6.jpg',12,'marksman','Legendary',
 '{"expedition_skills":[{"name":"Nerf Poison","effect":"Enemy Defense Down:","description":"Reduces enemy troops Defense by 5–25%."},{"name":"Corrosion","effect":"Marksman Damage / Damage Taken:","description":"Every 2 Marksman attacks, deals 20–100% more damage and makes the target take 5–25% more damage for 1 turn."},{"name":"Toxic Tip","effect":"Marksman Damage / Enemy Damage:","description":"Every 2 Marksman attacks, deals 20–100% more damage and reduces target Damage Dealt by 4–20% for 1 turn."}]}'::jsonb,
 '["https://www.whiteoutsurvival.wiki/server-timeline-server-age/","https://www.whiteoutsurvival-community.com/guides/heroes/en/ligeia.html"]'::jsonb,false,true,1203,now(),now()),

('hero','gisela','Gisela','https://www.whiteoutsurvival-community.com/assets/heroes/thumbs/dMUaJJt.jpg',13,'infantry','Legendary',
 '{"expedition_skills":[{"name":"Alloyed Defense","effect":"Infantry Defense Up:","description":"Increases Infantry Defense by 6–30%."},{"name":"Scavengeworks","effect":"Defense Up:","description":"Grants a 40% chance to increase all troops Defense by 10–50% for 1 turn."},{"name":"Trial Shield","effect":"Damage Taken Down:","description":"Grants a 40% chance to reduce all troops Damage Taken by 10–50%."}]}'::jsonb,
 '["https://www.whiteoutsurvival.wiki/server-timeline-server-age/","https://www.whiteoutsurvival-community.com/guides/heroes/en/gisela.html"]'::jsonb,false,true,1301,now(),now()),
('hero','flora','Flora','https://www.whiteoutsurvival-community.com/assets/heroes/thumbs/S15c9Ec.jpg',13,'lancer','Legendary',
 '{"expedition_skills":[{"name":"Enmiring Vines","effect":"Enemy Damage Taken Up:","description":"Grants a 50% chance to increase enemy Damage Taken by 10–50%."},{"name":"Plantage","effect":"Infantry Protection / Lancer Damage:","description":"Reduces Infantry Damage Taken by 5–25% and increases Lancer joint damage by 5–25%."},{"name":"Confusion Pollen","effect":"Enemy Infantry / Marksman Debuff:","description":"Every 4 turns, increases enemy Infantry Damage Taken and reduces enemy Marksman Damage Dealt by 6–30% for 2 turns."}]}'::jsonb,
 '["https://www.whiteoutsurvival.wiki/server-timeline-server-age/","https://www.whiteoutsurvival-community.com/guides/heroes/en/flora.html"]'::jsonb,false,true,1302,now(),now()),
('hero','vulcanus','Vulcanus','https://www.whiteoutsurvival-community.com/assets/heroes/thumbs/hyr7Jnk.jpg',13,'marksman','Legendary',
 '{"expedition_skills":[{"name":"Raging Storm","effect":"Enemy Attack Down:","description":"Reduces enemy troops Attack by 4–20%."},{"name":"Breaker Steel","effect":"Damage Up / Damage Taken:","description":"Every 5 attacks deals 20–100% more damage and makes the target take 3–15% more damage on the next hit."},{"name":"True Strike","effect":"Enemy Defense / Marksman Attack:","description":"Reduces enemy Infantry and Lancer Defense by 12–60% for 3 turns and increases Marksman Attack by 12–60% for 1 turn."}]}'::jsonb,
 '["https://www.whiteoutsurvival.wiki/server-timeline-server-age/","https://www.whiteoutsurvival-community.com/guides/heroes/en/vulcanus.html"]'::jsonb,false,true,1303,now(),now()),

('hero','elif','Elif','https://www.whiteoutsurvival-community.com/assets/heroes/thumbs/XAvNrma.png',14,'infantry','Legendary',
 '{"expedition_skills":[{"name":"Veil Entangle","effect":"Enemy Attack Down:","description":"Reduces enemy troops Attack by 5–25%."},{"name":"Exotic Formation","effect":"Attack / Defense Up:","description":"Increases troop Attack by 3–15% and Defense by 2–10%."},{"name":"Ribbon Shield","effect":"Infantry Shield:","description":"Infantry gain a shield equal to 6–30% of Attack for 1 turn when attacking."}]}'::jsonb,
 '["https://www.whiteoutsurvival.wiki/server-timeline-server-age/","https://www.whiteoutsurvival-community.com/guides/heroes/en/elif.html"]'::jsonb,false,true,1401,now(),now()),
('hero','dominic','Dominic','https://www.whiteoutsurvival-community.com/assets/heroes/thumbs/oSdq1SW.png',14,'lancer','Legendary',
 '{"expedition_skills":[{"name":"Magic Props","effect":"Damage Up:","description":"Increases Damage Dealt by 4–20% for all troops."},{"name":"Poison Spikes","effect":"Lancer Damage / Damage Taken:","description":"Increases Lancer damage by 12–60% per attack and makes poisoned targets take 5–25% more damage for 1 turn."},{"name":"Optical Mirror","effect":"Protection / Damage Up:","description":"Reduces Infantry and Marksman Damage Taken by 3–15% and increases their Damage Dealt by 3–15%."}]}'::jsonb,
 '["https://www.whiteoutsurvival.wiki/server-timeline-server-age/","https://www.whiteoutsurvival-community.com/guides/heroes/en/dominic.html"]'::jsonb,false,true,1402,now(),now()),
('hero','cara','Cara','https://www.whiteoutsurvival-community.com/assets/heroes/thumbs/iWGGymL.png',14,'marksman','Legendary',
 '{"expedition_skills":[{"name":"Smoke Grenades","effect":"Enemy Lethality Down:","description":"Reduces enemy troops Lethality by 4–20%."},{"name":"Mech Pets","effect":"Normal Attack Damage Up:","description":"Increases all troops normal-attack damage by 10–30%."},{"name":"Flying Broom","effect":"Marksman Damage Up:","description":"Every 2 attacks, Marksmen deal 8–40% more damage to Lancers and 4–20% more damage to Marksmen."}]}'::jsonb,
 '["https://www.whiteoutsurvival.wiki/server-timeline-server-age/","https://www.whiteoutsurvival-community.com/guides/heroes/en/cara.html"]'::jsonb,false,true,1403,now(),now()),

('hero','hank','Hank','https://www.whiteoutsurvival-community.com/assets/heroes/thumbs/o99v3Bh.png',15,'infantry','Legendary',
 '{"expedition_skills":[{"name":"Roaring Rage","effect":"Lethality Up:","description":"Increases Lethality by 5–25% for all troops."},{"name":"Flying Sparks","effect":"Damage Up / Damage Taken Down:","description":"Every 5 Infantry attacks, allies deal 5–25% more damage and take 5–25% less damage."},{"name":"Mirror Maze","effect":"Enemy Infantry / Marksman Debuff:","description":"Every 4 rounds, enemy Infantry take 6–30% more damage and enemy Marksmen deal 6–30% less damage for 2 rounds."}]}'::jsonb,
 '["https://www.whiteoutsurvival.wiki/server-timeline-server-age/","https://www.whiteoutsurvival-community.com/guides/heroes/en/hank.html"]'::jsonb,false,true,1501,now(),now()),
('hero','estrella','Estrella','https://www.whiteoutsurvival-community.com/assets/heroes/thumbs/3Ze7Pqv.png',15,'lancer','Legendary',
 '{"expedition_skills":[{"name":"Homeland Defense","effect":"Defender Attack Up:","description":"Increases defending troops Attack by 5–15%."},{"name":"Paint Debuffs","effect":"Enemy Debuff:","description":"Applies paint effects that amplify allied damage; values scale with skill level."},{"name":"Color Burst","effect":"Damage Taken Up:","description":"Enemies carrying two paint debuffs take increased damage; the value scales with the skill and widget level."}]}'::jsonb,
 '["https://www.whiteoutsurvival.wiki/server-timeline-server-age/","https://www.whiteoutsurvival-community.com/guides/heroes/en/estrella.html"]'::jsonb,false,true,1502,now(),now()),
('hero','viveca','Viveca','https://i.imgur.com/2odMmrh.png',15,'marksman','Legendary',
 '{"expedition_skills":[{"name":"Legion of the Night","effect":"Attack Up:","description":"Increases allied backline Attack; the value scales with skill level."},{"name":"World of Shadow","effect":"Marksman Damage Up:","description":"Grants a chance for bonus Marksman damage; the value scales with skill level."},{"name":"Children of the Mist","effect":"Infantry Protection / Marksman Damage:","description":"Reduces Infantry damage taken and increases Marksman damage; values scale with skill level."}]}'::jsonb,
 '["https://www.whiteoutsurvival.wiki/server-timeline-server-age/","https://www.whiteoutsurvival-community.com/guides/heroes/en/viveca.html"]'::jsonb,false,true,1503,now(),now()),

('hero','seigel','Seigel','https://www.whiteoutsurvival-community.com/assets/heroes/thumbs/J0g9bul.png',16,'infantry','Legendary',
 '{"expedition_skills":[{"name":"Armor of Night","effect":"Health Up:","description":"Increases Health by 5–25% for all troops."},{"name":"Night''s Defense","effect":"Attack Debuff:","description":"Reduces Infantry Attack by 4–20% while reducing enemy Marksman and Lancer Attack by 7–35%."},{"name":"Vanguard of Eternity","effect":"Infantry Damage Taken Down:","description":"Reduces damage Infantry take from normal attacks and enemy skills; values scale with skill level."}]}'::jsonb,
 '["https://www.whiteoutsurvival.wiki/server-timeline-server-age/","https://www.whiteoutsurvival-community.com/guides/heroes/en/seigel.html"]'::jsonb,false,true,1601,now(),now()),
('hero','ursar','Ursar','https://www.whiteoutsurvival-community.com/assets/heroes/thumbs/jGg2nj8.png',16,'lancer','Legendary',
 '{"expedition_skills":[{"name":"Forest Spores","effect":"Enemy Attack Down:","description":"Reduces enemy troops Attack by 5–25%."},{"name":"Horn of the Ancients","effect":"Lethality Up / Enemy Defense Down:","description":"Increases Lancer and Marksman Lethality by 6–30% for 2 turns and reduces enemy Defense by 6–30% for 1 turn."},{"name":"Poison Tips","effect":"Lancer Damage Up:","description":"Lancers deal bonus damage every 2 attacks and increase Damage Taken on the target; values scale with skill level."}]}'::jsonb,
 '["https://www.whiteoutsurvival.wiki/server-timeline-server-age/","https://www.whiteoutsurvival-community.com/guides/heroes/en/ursar.html"]'::jsonb,false,true,1602,now(),now()),
('hero','aisling','Aisling','https://www.whiteoutsurvival-community.com/assets/heroes/thumbs/m4miuda.png',16,'marksman','Legendary',
 '{"expedition_skills":[{"name":"Songs of the Ancestors","effect":"Damage Up:","description":"Increases Damage Dealt by 4–20% for all troops."},{"name":"Rock Storm","effect":"Marksman Damage / Enemy Damage:","description":"Every 3 turns, Marksmen deal 30–150% more damage and exhausted enemies deal 6–30% less damage."},{"name":"Forest Fury","effect":"Marksman Damage Up:","description":"Every 3 turns, Marksmen deal 8–40% bonus damage."}]}'::jsonb,
 '["https://www.whiteoutsurvival.wiki/server-timeline-server-age/","https://www.whiteoutsurvival-community.com/guides/heroes/en/aisling.html"]'::jsonb,false,true,1603,now(),now())
on conflict (item_type,slug) do update set
 name=excluded.name,image_url=excluded.image_url,generation=excluded.generation,
 troop_type=excluded.troop_type,rarity=excluded.rarity,metadata=excluded.metadata,
 source_urls=excluded.source_urls,is_active=true,sort_order=excluded.sort_order,
 last_synced_at=excluded.last_synced_at,updated_at=excluded.updated_at;

-- Preserve current rollout: Gen 0–10 visible; future generations preloaded Hidden.
update public.nexa_library_items
set is_visible=false, updated_at=now()
where item_type='hero' and generation between 11 and 16;

update public.nexa_library_generations
set is_visible=false, updated_at=now()
where item_type='hero' and generation between 11 and 16;

commit;

-- Verification: must return 62 total heroes, 19 preloaded Hidden.
select count(*) as total_heroes,
       count(*) filter (where is_visible) as visible_heroes,
       count(*) filter (where not is_visible) as hidden_heroes
from public.nexa_library_items where item_type='hero' and is_active=true;
