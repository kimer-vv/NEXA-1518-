// NEXA TRANSFER FORM I18N V1.0 — EXACT PUBLIC FORM TRANSLATIONS / AUTO LANGUAGE
(()=>{
'use strict';

const SUPPORTED=['en','es','tr','ko','ar'];
const SB_URL='https://dfxcxboxrkfmrnsgpyin.supabase.co';
const SB_KEY='sb_publishable_HTd6T3L8WuN_owZwPUjE1Q_glB9YWM-';
const SB=window.supabase?.createClient?window.supabase.createClient(SB_URL,SB_KEY):null;
let lang='en',timer=null;

const ES={
'TRANSFER APPLICATION':'SOLICITUD DE TRANSFERENCIA','Transfer Application':'Solicitud de Transferencia','Loading destination…':'Cargando destino…',
'Checking public access…':'Verificando acceso público…','Please wait.':'Por favor espera.','Ready to apply?':'¿Listo para solicitar?',
'Start a new application or continue one you already submitted.':'Inicia una nueva solicitud o continúa una que ya enviaste.',
'Apply':'Solicitar','Edit My Application':'Editar mi solicitud','About the Destination State':'Acerca del Estado de destino',
'How does the destination state run major events?':'¿Cómo organiza el Estado de destino los eventos principales?',
'1 • APPLICANT & REFERRAL':'1 • SOLICITANTE Y REFERIDO','Applicant & Referral':'Solicitante y Referido',
'Who is completing this form?':'¿Quién está completando este formulario?','Myself':'Yo mismo/a',
'Leadership / Transfer Staff completing for another player':'Liderazgo / Personal de Transferencias completándolo para otro jugador',
'Your in-game name':'Tu nombre en el juego','Your alliance':'Tu alianza','Were you referred by someone in this state?':'¿Alguien de este Estado te refirió?',
'Who referred you?':'¿Quién te refirió?','Yes':'Sí','No':'No',
'2 • PLAYER INFORMATION':'2 • INFORMACIÓN DEL JUGADOR','Player Information':'Información del Jugador','In-game name':'Nombre en el juego','In-game Name':'Nombre en el juego',
'Player ID':'ID de jugador','Game ID':'ID de juego','Current State':'Estado actual','Current Alliance':'Alianza actual','Discord username':'Usuario de Discord',
'3 • ACCOUNT STRENGTH':'3 • FUERZA DE LA CUENTA','Account Strength':'Fuerza de la Cuenta','Furnace Level':'Nivel de Horno','Current Total Power':'Poder total actual',
'Which best describes your account?':'¿Qué describe mejor tu cuenta?','Select':'Seleccionar','Still progressing':'Aún progresando','Well developed':'Bien desarrollada',
'Highly developed':'Muy desarrollada','Near max / Maxed':'Casi al máximo / Máxima','Labyrinth Score':'Puntuación de Laberinto','Infantry':'Infantería','Lancer':'Lancero','Marksman':'Tirador',
'Transfer Passes':'Pases de Transferencia','Not yet, but I will before transfer':'Todavía no, pero los tendré antes de la transferencia',
'If needed to meet the Ordinary Power Cap, would you be willing to reduce troop power?':'Si fuera necesario para cumplir con el límite de poder Ordinario, ¿estarías dispuesto/a a reducir el poder de tropas?',
'Not sure':'No estoy seguro/a','4 • PLACEMENT & AVAILABILITY':'4 • UBICACIÓN Y DISPONIBILIDAD','Placement & Availability':'Ubicación y Disponibilidad',
'Preferred placement':'Ubicación preferida','I want to join a specific recruiting alliance':'Quiero unirme a una alianza de reclutamiento específica',
'No specific alliance preference — choose preferred times':'Sin preferencia específica de alianza — elige horarios preferidos',
'Recruiting alliance':'Alianza de reclutamiento','SELECTED ALLIANCE EVENT SCHEDULE':'HORARIO DE EVENTOS DE LA ALIANZA SELECCIONADA',
'Select an alliance':'Selecciona una alianza','Preferred UTC time range(s)':'Rango(s) de hora UTC preferido(s)','Discord Voice':'Voz de Discord','Listen Only':'Solo escuchar',
'5 • GROUP TRANSFER':'5 • TRANSFERENCIA EN GRUPO','Group Transfer':'Transferencia en Grupo','Are you transferring with other players as a group?':'¿Te transfieres con otros jugadores como grupo?',
'Describe your group situation':'Describe la situación de tu grupo','I am the group leader and want my group to be considered':'Soy el líder del grupo y quiero que mi grupo sea considerado',
'I am the group leader and my group has already been approved':'Soy el líder del grupo y mi grupo ya fue aprobado','I am joining an existing approved group':'Me voy a unir a un grupo aprobado existente',
'Transfer Staff will review your group first.':'El Personal de Transferencias revisará tu grupo primero.',
'If your group is approved, return through':'Si tu grupo es aprobado, regresa por','using the credentials you receive at the end. Your same NEXA Group Code will then unlock the member list.':'usando las credenciales que recibirás al final. El mismo Código de Grupo NEXA desbloqueará entonces la lista de miembros.',
'Group Name':'Nombre del grupo','Main Contact — Discord':'Contacto principal — Discord','(optional)':'(opcional)','Group plan':'Plan del grupo','Not selected yet':'Aún no seleccionado',
'Merge into an existing recruiting alliance':'Integrarse a una alianza de reclutamiento existente','Start / rebuild our own alliance':'Iniciar / reconstruir nuestra propia alianza',
'Alliance Tag':'Tag de alianza','NEXA Group Code':'Código de Grupo NEXA','Verify Code':'Verificar código','Approved Group Members':'Miembros del Grupo Aprobado',
'Add members here using only the quick information needed for Transfer operations. Each player will still be tracked as an individual applicant.':'Añade miembros aquí usando solamente la información rápida necesaria para las operaciones de Transferencia. Cada jugador seguirá siendo rastreado como un solicitante individual.',
'Current Power':'Poder actual','Does this player have T12?':'¿Este jugador tiene T12?','+ Add Player':'+ Añadir jugador',
'6 • ADDITIONAL INFORMATION':'6 • INFORMACIÓN ADICIONAL','Additional Information':'Información Adicional','Current city coordinates':'Coordenadas actuales de la ciudad',
'Anything else you want Transfer Staff to know?':'¿Hay algo más que quieras que el Personal de Transferencias sepa?',
'7 • FINAL CONFIRMATION':'7 • CONFIRMACIÓN FINAL','Final Confirmation':'Confirmación Final','I confirm the information I provided is accurate.':'Confirmo que la información que proporcioné es correcta.',
'I understand submitting an application does not guarantee acceptance or placement in a specific alliance.':'Entiendo que enviar una solicitud no garantiza la aceptación ni la ubicación en una alianza específica.',
'I understand Transfer Staff may determine the appropriate transfer route for my account.':'Entiendo que el Personal de Transferencias puede determinar la ruta de transferencia apropiada para mi cuenta.',
'Please do not kill or dismiss troops before speaking with Transfer Staff.':'Por favor, no mates ni despidas tropas antes de hablar con el Personal de Transferencias.',
'If a power reduction is needed, our team will review your account first and advise you on the appropriate next step.':'Si se necesita una reducción de poder, nuestro equipo revisará primero tu cuenta y te indicará el siguiente paso apropiado.',
'Refresh Summary':'Actualizar resumen','Submit Application':'Enviar solicitud','Application ID':'ID de solicitud','NEXA Auth Code':'Código de autenticación NEXA','Edit Token':'Token de edición',
'Open My Application':'Abrir mi solicitud','Cancel':'Cancelar','Application Submitted ✓':'Solicitud enviada ✓','Save these credentials. You will need all four to edit this application later.':'Guarda estas credenciales. Necesitarás las cuatro para editar esta solicitud más adelante.',
'Copy Credentials':'Copiar credenciales','Close':'Cerrar','Select Furnace Level':'Seleccionar nivel de Horno','Advanced Troops':'Tropas avanzadas','No recruiting alliance listed':'No hay alianza de reclutamiento disponible',
'Select alliance':'Seleccionar alianza','Custom question':'Pregunta personalizada','Alliance':'Alianza','No event schedule has been added yet.':'Todavía no se ha añadido un horario de eventos.',
'Approved Group ✓':'Grupo aprobado ✓','Under Review':'En revisión','Assigned':'Asignado','Enter your NEXA Group Code.':'Introduce tu Código de Grupo NEXA.','Checking…':'Verificando…','Group Code not found.':'No se encontró el Código de Grupo.',
'This group is still Under Review.':'Este grupo todavía está En Revisión.','Approved group verified ✓':'Grupo aprobado verificado ✓','No T12':'Sin T12',
'Complete Game Name, Game ID, Furnace Level and Current Power.':'Completa Nombre en el juego, ID de juego, Nivel de Horno y Poder actual.',
'That Game ID is already in this pending list.':'Ese ID de juego ya está en esta lista pendiente.','Player added ✓':'Jugador añadido ✓','Remove':'Eliminar','Enter your full power number':'Introduce tu número completo de poder',
'IGN':'IGN','Power':'Poder','Furnace':'Horno','Flexible':'Flexible','Application Routing':'Ruta de la solicitud','New Applicants':'Nuevos solicitantes','Group':'Grupo',
'Please confirm that you understand the state’s coordinated approach to major events.':'Confirma que entiendes el enfoque coordinado del Estado para los eventos principales.',
'Please complete all required Player Information and Account Strength fields.':'Completa todos los campos obligatorios de Información del Jugador y Fuerza de la Cuenta.',
'Please describe your group situation.':'Describe la situación de tu grupo.','Please enter your Group Name.':'Introduce el Nombre de tu Grupo.',
'Please verify your approved NEXA Group Code.':'Verifica tu Código de Grupo NEXA aprobado.','Please select the alliance your group plans to merge into.':'Selecciona la alianza en la que tu grupo planea integrarse.',
'Please enter your Alliance Tag.':'Introduce el Tag de tu alianza.','Please complete all Final Confirmation items.':'Completa todos los elementos de Confirmación Final.',
'Only authorized Transfer Staff can submit for another player.':'Solo el Personal de Transferencias autorizado puede enviar una solicitud por otro jugador.',
'Saving…':'Guardando…','Submitting…':'Enviando…','Unable to update this application.':'No se pudo actualizar esta solicitud.','Application updated ✓':'Solicitud actualizada ✓',
'Unable to submit this application.':'No se pudo enviar esta solicitud.','Application submitted ✓':'Solicitud enviada ✓','Something interrupted the submission. Please try again.':'Algo interrumpió el envío. Inténtalo nuevamente.',
'Transfer Application Credentials':'Credenciales de la Solicitud de Transferencia','Save your NEXA Group Code':'Guarda tu Código de Grupo NEXA',
'Your group is Under Review. Do not add members yet. If Transfer Staff approves it, return through':'Tu grupo está En Revisión. No añadas miembros todavía. Si el Personal de Transferencias lo aprueba, regresa por',
'; this same Group Code will unlock the member list.':'; este mismo Código de Grupo desbloqueará la lista de miembros.',
'Use this same Group Code to add or edit group members later. Members joining the approved group must also use this code.':'Usa este mismo Código de Grupo para añadir o editar miembros del grupo más adelante. Los miembros que se unan al grupo aprobado también deben usar este código.',
'Copied ✓':'Copiado ✓','Enter all four credentials.':'Introduce las cuatro credenciales.','Credentials not found.':'No se encontraron las credenciales.','Save Changes':'Guardar cambios',
'Public access to this Transfer Application is currently unavailable.':'El acceso público a esta Solicitud de Transferencia no está disponible actualmente.',
'Transfer Application not found.':'No se encontró la Solicitud de Transferencia.','This Transfer Application link is incomplete.':'Este enlace de Solicitud de Transferencia está incompleto.',
'Transfer Workspace not found.':'No se encontró el Workspace de Transferencias.',
'I acknowledge that real life always comes first. By transferring to this state, I also understand that I am expected to remain active, reliable, and engaged with the state, and to participate in events whenever my real-life responsibilities allow.':'Reconozco que la vida real siempre es lo primero. Al transferirme a este Estado, también entiendo que se espera que me mantenga activo/a, confiable y comprometido/a con el Estado, y que participe en los eventos siempre que mis responsabilidades de la vida real lo permitan.',
'We’re building an active, competitive, and team-oriented state. We value players who contribute, communicate, prepare for important events, and understand that some competitions require a state-first approach.':'Estamos construyendo un Estado activo, competitivo y orientado al trabajo en equipo. Valoramos a los jugadores que contribuyen, se comunican, se preparan para eventos importantes y entienden que algunas competencias requieren priorizar al Estado.',
'Our Philosophy: Strong accounts matter, but character, teamwork, and the player behind the account matter just as much.':'Nuestra filosofía: Las cuentas fuertes importan, pero el carácter, el trabajo en equipo y la persona detrás de la cuenta importan igual.',
'FDT is a coordinated state effort built from our consolidated alliances. Around 120 selected players are divided into two Legions of roughly 60 players each, with both teams working together to secure objectives, reinforce key positions, defend when needed, and maximize the state’s chances of victory.':'FDT es un esfuerzo coordinado del Estado formado a partir de nuestras alianzas consolidadas. Aproximadamente 120 jugadores seleccionados se dividen en dos Legiones de unos 60 jugadores cada una, y ambos equipos trabajan juntos para asegurar objetivos, reforzar posiciones clave, defender cuando sea necesario y maximizar las posibilidades de victoria del Estado.',
'TAL is organized at the state level. We build our primary competitive team first, followed by another strong team for additional brackets. When possible, additional teams are created so more players across the state can participate and earn rewards.':'TAL se organiza a nivel de Estado. Primero formamos nuestro equipo competitivo principal, seguido de otro equipo fuerte para brackets adicionales. Cuando es posible, se crean equipos adicionales para que más jugadores de todo el Estado puedan participar y obtener recompensas.',
'Sunfire and Presidency follow a shared state structure, with Presidency rotating among our leading alliances. During certain competitive situations, assignments may be adjusted strategically when that gives the state a stronger advantage.':'Sunfire y la Presidencia siguen una estructura compartida del Estado, con la Presidencia rotando entre nuestras alianzas principales. En determinadas situaciones competitivas, las asignaciones pueden ajustarse estratégicamente cuando eso le brinda al Estado una ventaja mayor.',
'SvS is a state-wide effort from Prep through Battle. During Prep, we coordinate strategic resource use. During Battle, our top three alliances rotate responsibility for fighting for or defending the Castle/Star, and Presidency rotates as part of that shared structure.':'SvS es un esfuerzo de todo el Estado desde Preparación hasta Batalla. Durante Preparación, coordinamos el uso estratégico de recursos. Durante Batalla, nuestras tres alianzas principales rotan la responsabilidad de luchar por o defender el Castillo/Estrella, y la Presidencia rota como parte de esa estructura compartida.',
'In major coordinated events, we play for 1518 first. 💜':'En los eventos principales coordinados, jugamos primero por 1518. 💜',
'Fire Crystal 8 (FC8)':'Cristal de Fuego 8 (FC8)','Fire Crystal 9 (FC9)':'Cristal de Fuego 9 (FC9)','Fire Crystal 10 (FC10)':'Cristal de Fuego 10 (FC10)',
'T10 or below':'T10 o inferior','T11 Helios':'T11 Helios','T12 Exalted':'T12 Exaltado'
};

const TR={
'TRANSFER APPLICATION':'TRANSFER BAŞVURUSU','Transfer Application':'Transfer Başvurusu','Ready to apply?':'Başvurmaya hazır mısın?','Apply':'Başvur','Edit My Application':'Başvurumu Düzenle',
'Applicant & Referral':'Başvuran ve Yönlendirme','Who is completing this form?':'Bu formu kim dolduruyor?','Myself':'Kendim','Player Information':'Oyuncu Bilgileri','In-game name':'Oyun içi ad',
'Player ID':'Oyuncu Kimliği','Current State':'Mevcut Eyalet','Current Alliance':'Mevcut İttifak','Discord username':'Discord kullanıcı adı','Account Strength':'Hesap Gücü','Furnace Level':'Fırın Seviyesi',
'Current Total Power':'Mevcut Toplam Güç','Which best describes your account?':'Hesabını en iyi hangisi tanımlar?','Select':'Seç','Transfer Passes':'Transfer Biletleri','Yes':'Evet','No':'Hayır','Not sure':'Emin değilim',
'Placement & Availability':'Yerleşim ve Uygunluk','Preferred placement':'Tercih edilen yerleşim','Recruiting alliance':'Transfer Alımlı İttifak','Select an alliance':'Bir ittifak seç','Preferred UTC time range(s)':'Tercih edilen UTC saat aralığı/aralıkları',
'Discord Voice':'Discord Ses','Listen Only':'Yalnızca Dinle','Group Transfer':'Grup Transferi','Are you transferring with other players as a group?':'Diğer oyuncularla grup olarak mı transfer oluyorsun?',
'Describe your group situation':'Grup durumunu açıkla','Group Name':'Grup Adı','Group plan':'Grup planı','Alliance Tag':'İttifak Etiketi','NEXA Group Code':'NEXA Grup Kodu','Verify Code':'Kodu Doğrula',
'Approved Group Members':'Onaylı Grup Üyeleri','Current Power':'Mevcut Güç','Does this player have T12?':'Bu oyuncuda T12 var mı?','+ Add Player':'+ Oyuncu Ekle','Additional Information':'Ek Bilgiler',
'Current city coordinates':'Mevcut şehir koordinatları','Final Confirmation':'Son Onay','Refresh Summary':'Özeti Yenile','Submit Application':'Başvuruyu Gönder','Application ID':'Başvuru Kimliği','Game ID':'Oyun Kimliği',
'NEXA Auth Code':'NEXA Yetkilendirme Kodu','Edit Token':'Düzenleme Tokenı','Open My Application':'Başvurumu Aç','Cancel':'İptal','Application Submitted ✓':'Başvuru Gönderildi ✓','Copy Credentials':'Bilgileri Kopyala','Close':'Kapat',
'Select Furnace Level':'Fırın Seviyesi Seç','Approved Group ✓':'Onaylı Grup ✓','Under Review':'İncelemede','Checking…':'Kontrol ediliyor…','Group Code not found.':'Grup Kodu bulunamadı.','Approved group verified ✓':'Onaylı grup doğrulandı ✓',
'Player added ✓':'Oyuncu eklendi ✓','Remove':'Kaldır','Power':'Güç','Furnace':'Fırın','Alliance':'İttifak','Group':'Grup','Saving…':'Kaydediliyor…','Submitting…':'Gönderiliyor…','Application updated ✓':'Başvuru güncellendi ✓',
'Application submitted ✓':'Başvuru gönderildi ✓','Copied ✓':'Kopyalandı ✓','Save Changes':'Değişiklikleri Kaydet','Fire Crystal 8 (FC8)':'Ateş Kristali 8 (FC8)','Fire Crystal 9 (FC9)':'Ateş Kristali 9 (FC9)','Fire Crystal 10 (FC10)':'Ateş Kristali 10 (FC10)'
};

const KO={
'TRANSFER APPLICATION':'이전 신청서','Transfer Application':'이전 신청서','Ready to apply?':'신청할 준비가 되셨나요?','Apply':'신청','Edit My Application':'내 신청서 편집',
'Applicant & Referral':'신청자 및 추천','Who is completing this form?':'이 양식을 누가 작성하나요?','Myself':'본인','Player Information':'플레이어 정보','In-game name':'게임 내 이름',
'Player ID':'플레이어 ID','Current State':'현재 주','Current Alliance':'현재 연맹','Discord username':'Discord 사용자 이름','Account Strength':'계정 전투력','Furnace Level':'용광로 레벨',
'Current Total Power':'현재 총 전투력','Which best describes your account?':'계정을 가장 잘 설명하는 것은 무엇인가요?','Select':'선택','Transfer Passes':'이전 패스','Yes':'예','No':'아니요','Not sure':'잘 모르겠음',
'Placement & Availability':'배치 및 가능 시간','Preferred placement':'선호 배치','Recruiting alliance':'모집 연맹','Select an alliance':'연맹 선택','Preferred UTC time range(s)':'선호 UTC 시간대',
'Discord Voice':'Discord 음성','Listen Only':'듣기만','Group Transfer':'그룹 이전','Are you transferring with other players as a group?':'다른 플레이어들과 그룹으로 이전하나요?',
'Describe your group situation':'그룹 상황 설명','Group Name':'그룹 이름','Group plan':'그룹 계획','Alliance Tag':'연맹 태그','NEXA Group Code':'NEXA 그룹 코드','Verify Code':'코드 확인',
'Approved Group Members':'승인된 그룹 멤버','Current Power':'현재 전투력','Does this player have T12?':'이 플레이어는 T12가 있나요?','+ Add Player':'+ 플레이어 추가','Additional Information':'추가 정보',
'Current city coordinates':'현재 도시 좌표','Final Confirmation':'최종 확인','Refresh Summary':'요약 새로고침','Submit Application':'신청서 제출','Application ID':'신청서 ID','Game ID':'게임 ID',
'NEXA Auth Code':'NEXA 인증 코드','Edit Token':'편집 토큰','Open My Application':'내 신청서 열기','Cancel':'취소','Application Submitted ✓':'신청서 제출 완료 ✓','Copy Credentials':'자격 정보 복사','Close':'닫기',
'Select Furnace Level':'용광로 레벨 선택','Approved Group ✓':'승인된 그룹 ✓','Under Review':'검토 중','Checking…':'확인 중…','Group Code not found.':'그룹 코드를 찾을 수 없습니다.','Approved group verified ✓':'승인된 그룹 확인 완료 ✓',
'Player added ✓':'플레이어 추가됨 ✓','Remove':'제거','Power':'전투력','Furnace':'용광로','Alliance':'연맹','Group':'그룹','Saving…':'저장 중…','Submitting…':'제출 중…','Application updated ✓':'신청서 업데이트 완료 ✓',
'Application submitted ✓':'신청서 제출 완료 ✓','Copied ✓':'복사됨 ✓','Save Changes':'변경사항 저장'
};

const AR={
'TRANSFER APPLICATION':'طلب الانتقال','Transfer Application':'طلب الانتقال','Ready to apply?':'هل أنت مستعد للتقديم؟','Apply':'تقديم','Edit My Application':'تعديل طلبي',
'Applicant & Referral':'المتقدم والإحالة','Who is completing this form?':'من يقوم بتعبئة هذا النموذج؟','Myself':'أنا','Player Information':'معلومات اللاعب','In-game name':'الاسم داخل اللعبة',
'Player ID':'معرّف اللاعب','Current State':'الولاية الحالية','Current Alliance':'التحالف الحالي','Discord username':'اسم مستخدم Discord','Account Strength':'قوة الحساب','Furnace Level':'مستوى الفرن',
'Current Total Power':'إجمالي القوة الحالية','Which best describes your account?':'ما الوصف الأنسب لحسابك؟','Select':'اختر','Transfer Passes':'تصاريح الانتقال','Yes':'نعم','No':'لا','Not sure':'غير متأكد',
'Placement & Availability':'التوزيع والتوفر','Preferred placement':'التوزيع المفضل','Recruiting alliance':'تحالف التجنيد','Select an alliance':'اختر تحالفًا','Preferred UTC time range(s)':'النطاقات الزمنية المفضلة بتوقيت UTC',
'Discord Voice':'صوت Discord','Listen Only':'استماع فقط','Group Transfer':'انتقال جماعي','Are you transferring with other players as a group?':'هل تنتقل مع لاعبين آخرين كمجموعة؟',
'Describe your group situation':'صف وضع مجموعتك','Group Name':'اسم المجموعة','Group plan':'خطة المجموعة','Alliance Tag':'وسم التحالف','NEXA Group Code':'رمز مجموعة NEXA','Verify Code':'التحقق من الرمز',
'Approved Group Members':'أعضاء المجموعة الموافق عليها','Current Power':'القوة الحالية','Does this player have T12?':'هل لدى هذا اللاعب T12؟','+ Add Player':'+ إضافة لاعب','Additional Information':'معلومات إضافية',
'Current city coordinates':'إحداثيات المدينة الحالية','Final Confirmation':'التأكيد النهائي','Refresh Summary':'تحديث الملخص','Submit Application':'إرسال الطلب','Application ID':'معرّف الطلب','Game ID':'معرّف اللعبة',
'NEXA Auth Code':'رمز مصادقة NEXA','Edit Token':'رمز التعديل','Open My Application':'فتح طلبي','Cancel':'إلغاء','Application Submitted ✓':'تم إرسال الطلب ✓','Copy Credentials':'نسخ بيانات الدخول','Close':'إغلاق',
'Select Furnace Level':'اختر مستوى الفرن','Approved Group ✓':'مجموعة موافق عليها ✓','Under Review':'قيد المراجعة','Checking…':'جارٍ التحقق…','Group Code not found.':'لم يتم العثور على رمز المجموعة.','Approved group verified ✓':'تم التحقق من المجموعة الموافق عليها ✓',
'Player added ✓':'تمت إضافة اللاعب ✓','Remove':'إزالة','Power':'القوة','Furnace':'الفرن','Alliance':'التحالف','Group':'المجموعة','Saving…':'جارٍ الحفظ…','Submitting…':'جارٍ الإرسال…','Application updated ✓':'تم تحديث الطلب ✓',
'Application submitted ✓':'تم إرسال الطلب ✓','Copied ✓':'تم النسخ ✓','Save Changes':'حفظ التغييرات'
};

const DICTS={es:ES,tr:TR,ko:KO,ar:AR};

function norm(v){
 const x=String(v||'').trim().toLowerCase().replace('_','-');
 if(!x||x==='auto'){
  const d=String(navigator.language||'en').toLowerCase();
  return SUPPORTED.find(k=>d===k||d.startsWith(k+'-'))||'en';
 }
 return SUPPORTED.find(k=>x===k||x.startsWith(k+'-'))||'en';
}
async function resolve(){
 let pref='auto';
 try{
  if(SB){
   const {data:{session}}=await SB.auth.getSession();
   if(session?.user){
    const r=await SB.from('user_profiles').select('language').eq('user_id',session.user.id).maybeSingle();
    if(r.data?.language)pref=r.data.language;
   }
  }
 }catch{}
 lang=norm(pref);
 document.documentElement.lang=lang;
 document.documentElement.dir=lang==='ar'?'rtl':'ltr';
}
function pattern(s){
 let m;
 if((m=s.match(/^State (\d+) Transfer Application$/)))return lang==='es'?`Solicitud de Transferencia al Estado ${m[1]}`:lang==='tr'?`Eyalet ${m[1]} Transfer Başvurusu`:lang==='ko'?`${m[1]}주 이전 신청서`:lang==='ar'?`طلب الانتقال إلى الولاية ${m[1]}`:s;
 if((m=s.match(/^Apply to transfer to State (\d+)$/)))return lang==='es'?`Solicita transferirte al Estado ${m[1]}`:lang==='tr'?`Eyalet ${m[1]} için transfer başvurusu`:lang==='ko'?`${m[1]}주로 이전 신청`:lang==='ar'?`قدّم للانتقال إلى الولاية ${m[1]}`:s;
 if((m=s.match(/^About State (\d+)$/)))return lang==='es'?`Acerca del Estado ${m[1]}`:lang==='tr'?`Eyalet ${m[1]} Hakkında`:lang==='ko'?`${m[1]}주 소개`:lang==='ar'?`حول الولاية ${m[1]}`:s;
 if((m=s.match(/^How does State (\d+) run major events\?$/)))return lang==='es'?`¿Cómo organiza el Estado ${m[1]} los eventos principales?`:lang==='tr'?`Eyalet ${m[1]} büyük etkinlikleri nasıl yürütüyor?`:lang==='ko'?`${m[1]}주는 주요 이벤트를 어떻게 운영하나요?`:lang==='ar'?`كيف تدير الولاية ${m[1]} الفعاليات الرئيسية؟`:s;
 if((m=s.match(/^In major coordinated events, we play for (\d+) first\. 💜$/)))return lang==='es'?`En los eventos principales coordinados, jugamos primero por ${m[1]}. 💜`:s;
 if((m=s.match(/^Assigned (.+)$/)))return lang==='es'?`Asignado ${m[1]}`:lang==='tr'?`Atandı ${m[1]}`:lang==='ko'?`${m[1]} 배정`:lang==='ar'?`مُعيّن ${m[1]}`:s;
 return s;
}
function translate(s){
 if(lang==='en')return s;
 const raw=String(s||''),clean=raw.trim();if(!clean)return s;
 const d=DICTS[lang]||{},x=d[clean]||pattern(clean);
 if(x===clean)return s;
 const lead=raw.match(/^\s*/)?.[0]||'',trail=raw.match(/\s*$/)?.[0]||'';
 return lead+x+trail;
}
function apply(root=document){
 if(!root||lang==='en')return;
 const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode(n){
  const p=n.parentElement;
  if(!p||['SCRIPT','STYLE','NOSCRIPT','TEXTAREA'].includes(p.tagName))return NodeFilter.FILTER_REJECT;
  return n.nodeValue?.trim()?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT;
 }});
 const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
 nodes.forEach(n=>{const x=translate(n.nodeValue);if(x!==n.nodeValue)n.nodeValue=x});
 root.querySelectorAll?.('[placeholder],[title],[aria-label]').forEach(el=>['placeholder','title','aria-label'].forEach(a=>{
  if(el.hasAttribute(a)){const old=el.getAttribute(a),x=translate(old);if(x!==old)el.setAttribute(a,x)}
 }));
}
function cssLanguage(){
 let s=document.getElementById('nexaTransferFormLangCss');
 if(!s){s=document.createElement('style');s.id='nexaTransferFormLangCss';document.head.appendChild(s)}
 const tap=lang==='es'?'Toca para leer':lang==='tr'?'Okumak için dokun':lang==='ko'?'탭하여 읽기':lang==='ar'?'اضغط للقراءة':'Tap to read';
 const hide=lang==='es'?'Ocultar':lang==='tr'?'Gizle':lang==='ko'?'숨기기':lang==='ar'?'إخفاء':'Hide';
 s.textContent=`.events summary:after{content:"${tap}"!important}.events[open] summary:after{content:"${hide}"!important}`;
}
async function boot(){
 await resolve();cssLanguage();apply(document);
 if(timer)clearInterval(timer);
 timer=setInterval(()=>apply(document),600);
}
window.NEXA_TRANSFER_FORM_I18N={apply,translate,getLang:()=>lang,resolve};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
