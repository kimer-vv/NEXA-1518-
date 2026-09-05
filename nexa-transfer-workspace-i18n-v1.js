// NEXA TRANSFER WORKSPACE I18N V1.0 — EXACT WORKSPACE TRANSLATIONS / AUTO-APPLY
(()=>{
'use strict';

const SUPPORTED=['en','es','tr','ko','ar'];
const SB_URL='https://dfxcxboxrkfmrnsgpyin.supabase.co';
const SB_KEY='sb_publishable_HTd6T3L8WuN_owZwPUjE1Q_glB9YWM-';
const SB=window.supabase?.createClient?window.supabase.createClient(SB_URL,SB_KEY):null;
let lang='en',timer=null;

const ES={
'TRANSFER WORKSPACE':'ESPACIO DE TRANSFERENCIAS','Staff Access':'Acceso del personal','Private transfer operations':'Operaciones privadas de transferencias',
'Log In':'Iniciar sesión','First Time? Register':'¿Primera vez? Regístrate','Username or Game ID':'Nombre de usuario o ID de juego','Password':'Contraseña',
'Remember me on this device':'Recordarme en este dispositivo','Forgot username?':'¿Olvidaste tu nombre de usuario?','Forgot password?':'¿Olvidaste tu contraseña?',
'Username':'Nombre de usuario','Game Name':'Nombre en el juego','Game ID':'ID de juego','Create Password':'Crear contraseña','Confirm Password':'Confirmar contraseña','Register':'Registrarse',
'TRANSFER STAFF':'PERSONAL DE TRANSFERENCIAS','Transfer Workspace':'Espacio de Transferencias','Friendly transfer operations, one workspace.':'Operaciones de transferencia sencillas, en un solo espacio.',
'CLASSIFICATION':'CLASIFICACIÓN','APPLICATIONS':'SOLICITUDES','PUBLIC FORM':'FORMULARIO PÚBLICO','WORKSPACE':'ESPACIO','OPEN TO PUBLIC':'ABIERTO AL PÚBLICO','YES':'SÍ','NO':'NO','Form Link':'Enlace del formulario',
'Transfer Cycle':'Ciclo de Transferencia','Applicants':'Solicitantes','Integrations':'Integraciones','Access':'Acceso','History':'Historial',
'Open Transfer Cycle':'Abrir Ciclo de Transferencia','Cycle dates are saved for Transfer History only. Public applications and Discord notification timing are controlled separately.':'Las fechas del ciclo se guardan solo para el Historial de Transferencias. Las solicitudes públicas y el horario de las notificaciones de Discord se controlan por separado.',
'Destination State':'Estado de destino','State Classification':'Clasificación del estado','Ordinary':'Ordinario','Leading':'Líder','Leading — Special Invite Available':'Líder — Invitación especial disponible',
'The state applicants are applying to join.':'El estado al que los solicitantes desean unirse.','This should normally match the Workspace state.':'Normalmente debe coincidir con el estado del Workspace.',
'Capacity / Invitations':'Capacidad / Invitaciones','Ordinary capacity is calculated automatically from Classification.':'La capacidad ordinaria se calcula automáticamente según la clasificación.',
'Ordinary Power Cap is required.':'El límite de poder ordinario es obligatorio.','Cards use it for the blue/gold visual status.':'Las tarjetas lo usan para el estado visual azul/dorado.','Special Invites are configured separately.':'Las invitaciones especiales se configuran por separado.',
'Ordinary Power Cap':'Límite de poder ordinario','Special Invites Available':'Invitaciones especiales disponibles','Required • enter the full power number':'Obligatorio • introduce el número completo de poder',
'ORDINARY CAPACITY':'CAPACIDAD ORDINARIA','SPECIAL AVAILABLE':'ESPECIALES DISPONIBLES','ALLOCATED':'ASIGNADOS','INVITES SENT':'INVITACIONES ENVIADAS',
'Cycle History End — UTC':'Fin del Historial del Ciclo — UTC','Transfer History Date':'Fecha del Historial de Transferencia','Time is always UTC in 24-hour format.':'La hora siempre está en UTC en formato de 24 horas.',
'Select from 30-minute slots from 00:00 through 23:30.':'Selecciona intervalos de 30 minutos desde 00:00 hasta 23:30.','This date is recorded in Transfer History only.':'Esta fecha se registra únicamente en el Historial de Transferencias.',
'It does not open or close the public form and does not schedule Discord alerts.':'No abre ni cierra el formulario público y no programa alertas de Discord.',
'Alliance Allocation':'Asignación de alianzas','Select which active Recruiting Alliances participate in this cycle.':'Selecciona qué Alianzas de Reclutamiento activas participan en este ciclo.',
'Free Pool':'Grupo libre','Balanced':'Equilibrado','Manual':'Manual','Mode':'Modo','Recruiting Alliances':'Alianzas de Reclutamiento',
'This area only selects participation for this cycle.':'Esta área solo selecciona la participación para este ciclo.',
'Alliance activation and official Bear / Foundry / Canyon schedules are managed under':'La activación de alianzas y los horarios oficiales de Bear / Foundry / Canyon se administran en',
'Integrations → Recruiting Alliances':'Integraciones → Alianzas de Reclutamiento','Save Cycle':'Guardar ciclo','Cancel':'Cancelar',
'How to use Applicants':'Cómo usar Solicitantes','Search IGN or Game ID':'Buscar IGN o ID de juego','Search…':'Buscar…','NEW APPLICATIONS':'NUEVAS SOLICITUDES','New Applications':'Nuevas Solicitudes',
'APPLICATION FORM':'FORMULARIO DE SOLICITUD','Application Form':'Formulario de Solicitud','Management-only controls. View and edit stay inside this Workspace.':'Controles solo para administración. Ver y editar permanecen dentro de este Workspace.',
'View Application':'Ver solicitud','Edit Form':'Editar formulario','DIRECT LINK':'ENLACE DIRECTO','Direct Transfer Workspace Link':'Enlace directo al Workspace de Transferencias','The link never grants access by itself.':'El enlace por sí solo nunca concede acceso.',
'Copy Link':'Copiar enlace','OFFICIAL TRANSFER SCHEDULE SOURCE':'FUENTE OFICIAL DEL HORARIO DE TRANSFERENCIAS','These are the alliances and schedules used by the Transfer Application.':'Estas son las alianzas y los horarios utilizados por la Solicitud de Transferencia.',
'+ Add Alliance':'+ Añadir alianza','FUTURE INTEGRATION':'INTEGRACIÓN FUTURA','Discord Notifications':'Notificaciones de Discord',
'Transfer Staff':'Personal de Transferencias','Everyone remains Transfer Staff. ☆ = normal access. ★ = Access Management. Owner always stays ★.':'Todos siguen siendo Personal de Transferencias. ☆ = acceso normal. ★ = Gestión de Acceso. El Owner siempre permanece ★.',
'+ Add Transfer Staff':'+ Añadir personal de transferencias','Authorize a Game ID. It stays Pending Registration until that person registers.':'Autoriza un ID de juego. Permanecerá Pendiente de Registro hasta que esa persona se registre.',
'Add Transfer Staff':'Añadir personal de transferencias','History & Archive':'Historial y Archivo','Transfer Cycle records and recoverable applicants are kept separately.':'Los registros de ciclos de transferencia y los solicitantes recuperables se conservan por separado.',
'Transfer Cycles':'Ciclos de Transferencia','Applicant Archive':'Archivo de Solicitantes','Transfer Application':'Solicitud de Transferencia',
'Use the four folders to organize the applications selected for Transfer. New/unclassified applications appear in the default New Applications view.':'Usa las carpetas para organizar las solicitudes seleccionadas para Transferencia. Las solicitudes nuevas o sin clasificar aparecen en la vista predeterminada Nuevas Solicitudes.',
'Special':'Especial','Not Selected':'No seleccionado','Next Transfer Cycle':'Próximo Ciclo de Transferencia','Groups':'Grupos',
'applicants assigned to the Ordinary transfer route.':'solicitantes asignados a la ruta de transferencia Ordinaria.','applicants actually assigned to a Special Invite.':'solicitantes realmente asignados a una Invitación Especial.',
'applicants not selected for this Transfer cycle.':'solicitantes no seleccionados para este ciclo de Transferencia.','applicants intentionally saved for a future cycle. Dates never move applicants automatically.':'solicitantes guardados intencionalmente para un ciclo futuro. Las fechas nunca mueven solicitantes automáticamente.',
'group membership is tracked separately from Ordinary/Special placement. Open Groups to review members by Transfer Group; changing a member to Ordinary or Special does not remove them from their group.':'la pertenencia a un grupo se rastrea por separado de la clasificación Ordinario/Especial. Abre Grupos para revisar los miembros por Grupo de Transferencia; cambiar un miembro a Ordinario o Especial no lo elimina de su grupo.',
'Blue card':'Tarjeta azul','the applicant is within the Ordinary Power Cap.':'el solicitante está dentro del límite de poder ordinario.','Gold card':'Tarjeta dorada',
'Move to':'Mover a','Assign Alliance':'Asignar alianza','Invite status':'Estado de invitación','Tap the card':'Toca la tarjeta','Desktop / tablet':'Computadora / tablet',
'Close':'Cerrar','FULL APPLICATION • READ ONLY':'SOLICITUD COMPLETA • SOLO LECTURA','Applicant':'Solicitante','CONFIRM ACTION':'CONFIRMAR ACCIÓN','Confirm':'Confirmar','Delete':'Eliminar',
'RECRUITING ALLIANCES':'ALIANZAS DE RECLUTAMIENTO','Add Alliance':'Añadir alianza','DETAIL':'DETALLE','Applicant Detail':'Detalle del solicitante','ARCHIVED TRANSFER CYCLE':'CICLO DE TRANSFERENCIA ARCHIVADO',
'OWNER / ACCESS MANAGEMENT':'OWNER / GESTIÓN DE ACCESO','Clear All Eligible Applicants':'Archivar todos los solicitantes elegibles','Clear All':'Archivar todos','End Transfer Cycle':'Finalizar Ciclo de Transferencia',
'NEXA Password':'Contraseña de NEXA','Type CLEAR to continue':'Escribe CLEAR para continuar','Type END to continue':'Escribe END para continuar','Use Recovery Code':'Usar código de recuperación','Recovery Code':'Código de recuperación',
'New Password':'Nueva contraseña','Confirm New Password':'Confirmar nueva contraseña','Change Password':'Cambiar contraseña','Current Password':'Contraseña actual','Temporary Recovery Code':'Código temporal de recuperación',
'Valid for 30 minutes and one use. Generating a new code invalidates the previous one.':'Válido durante 30 minutos y para un solo uso. Generar un nuevo código invalida el anterior.','Copy Code':'Copiar código',
'Copied ✓':'Copiado ✓','Copy failed':'Falló la copia','Yes':'Sí','No':'No','Required':'Obligatorio','Preferred':'Preferido','Not necessary':'No es necesario',
'No active cycle':'Sin ciclo activo','OPEN':'ABIERTO','CLOSED':'CERRADO','ACTIVE':'ACTIVO','INACTIVE':'INACTIVO','NO ACTIVE CYCLE':'SIN CICLO ACTIVO',
'Open Cycle':'Abrir ciclo','Edit Cycle':'Editar ciclo','Edit Transfer Cycle':'Editar Ciclo de Transferencia','Open Next Transfer Cycle':'Abrir próximo Ciclo de Transferencia','Transfer Cycle Closed':'Ciclo de Transferencia cerrado','Active Transfer Cycle':'Ciclo de Transferencia activo',
'Dates are for Transfer History only. Public Access and Discord timing are separate.':'Las fechas son solo para el Historial de Transferencias. El Acceso Público y el horario de Discord son independientes.',
'No cycle is currently configured. The public form can still remain open.':'Actualmente no hay ningún ciclo configurado. El formulario público puede permanecer abierto.',
'ORDINARY POWER CAP':'LÍMITE DE PODER ORDINARIO','HISTORY END':'FIN DEL HISTORIAL','ORDINARY / SPECIAL':'ORDINARIO / ESPECIAL',
'Ending Transfer Cycle…':'Finalizando Ciclo de Transferencia…','Enter your NEXA password.':'Introduce tu contraseña de NEXA.','NEXA password is incorrect.':'La contraseña de NEXA es incorrecta.','Access Management is required.':'Se requiere Gestión de Acceso.',
'Pending Registration':'Pendiente de registro','Active':'Activo','GAME ID':'ID DE JUEGO','USERNAME':'USUARIO','PASSWORD':'CONTRASEÑA','Pending':'Pendiente','Copy Username':'Copiar usuario',
'Generate Recovery Code':'Generar código de recuperación','Remove Access':'Eliminar acceso','Bear Trap':'Bear Trap','Up to 4 • UTC 24-hour':'Hasta 4 • UTC 24 horas','Up to 2 • UTC 24-hour':'Hasta 2 • UTC 24 horas',
'Save Schedule':'Guardar horario','Set Inactive':'Desactivar','Activate':'Activar','No Recruiting Alliances configured yet. Use + Add Alliance.':'Todavía no hay Alianzas de Reclutamiento configuradas. Usa + Añadir alianza.',
'Delete Recruiting Alliance':'Eliminar Alianza de Reclutamiento','Official Transfer schedule saved ✓':'Horario oficial de Transferencia guardado ✓','Available to add to Transfer':'Disponible para añadir a Transferencias','Add':'Añadir',
'Every State alliance has already been configured for Transfer.':'Todas las alianzas del Estado ya han sido configuradas para Transferencias.','Edit Transfer Form':'Editar Formulario de Transferencia',
'Passwords do not match.':'Las contraseñas no coinciden.','Password changed ✓':'Contraseña cambiada ✓','Code is invalid or expired.':'El código no es válido o ha expirado.',
'Username/Game ID or password is incorrect.':'El nombre de usuario/ID de juego o la contraseña son incorrectos.','This Game ID has not been authorized for this Transfer Workspace.':'Este ID de juego no ha sido autorizado para este Workspace de Transferencias.',
'That username is already in use.':'Ese nombre de usuario ya está en uso.','This Game ID is already registered. Use Log In.':'Este ID de juego ya está registrado. Usa Iniciar sesión.',
'Unable to load Transfer Workspace.':'No se pudo cargar el Workspace de Transferencias.','This workspace is currently inactive.':'Este Workspace está inactivo actualmente.','Your Transfer Workspaces':'Tus Workspaces de Transferencias',
'Furnace Level':'Nivel de Horno','Current Total Power':'Poder total actual','Which best describes your account?':'¿Qué describe mejor tu cuenta?','Labyrinth Score':'Puntuación de Laberinto','Infantry':'Infantería','Lancer':'Lancero','Marksman':'Tirador',
'Transfer Passes':'Pases de Transferencia','Willing to reduce power?':'¿Dispuesto a reducir poder?','Alliance preference':'Preferencia de alianza','Any recruiting alliance / flexible':'Cualquier alianza de reclutamiento / flexible',
'Specific alliance':'Alianza específica','Preferred Alliance':'Alianza preferida','Preferred UTC time range(s)':'Rango(s) de hora UTC preferido(s)','Discord Voice':'Voz de Discord',
'Are you transferring with other players as a group?':'¿Te transfieres con otros jugadores como grupo?','Main Contact — In-game Name':'Contacto principal — Nombre en el juego','Main Contact — State':'Contacto principal — Estado',
'Main Contact — Alliance':'Contacto principal — Alianza','Main Contact — Discord':'Contacto principal — Discord','How many players are in your group?':'¿Cuántos jugadores hay en tu grupo?',
'Do you need to be placed in the same alliance?':'¿Necesitan ser colocados en la misma alianza?','Would you still transfer if some members of your group are not accepted?':'¿Aun te transferirías si algunos miembros de tu grupo no son aceptados?',
'Current city coordinates':'Coordenadas actuales de la ciudad','Anything else you want Transfer Staff to know?':'¿Algo más que quieras que el Personal de Transferencias sepa?',
'No application answers available.':'No hay respuestas de la solicitud disponibles.','GROUPS':'GRUPOS','Transfer Groups':'Grupos de Transferencia','Groups are tracked separately from each player’s classification.':'Los grupos se rastrean por separado de la clasificación de cada jugador.',
'No transfer groups yet. Use + Add Group to create one.':'Todavía no hay grupos de transferencia. Usa + Añadir grupo para crear uno.','+ Add Group':'+ Añadir grupo','GROUP':'GRUPO','Members':'Miembros','Invite Sent':'Invitación enviada',
'UNDER REVIEW — Members locked until approval':'EN REVISIÓN — Miembros bloqueados hasta la aprobación','Approve this group before adding or managing group members.':'Aprueba este grupo antes de añadir o administrar miembros.',
'NEXA Group Code':'Código de Grupo NEXA','Permanent code — changes only if regenerated by Transfer Staff.':'Código permanente — solo cambia si el Personal de Transferencias lo regenera.','Regenerate Code':'Regenerar código',
'Form Filler':'Formulario completo','Quick Group Member':'Miembro rápido del grupo','Unassigned':'Sin asignar','Not Sent':'No enviada','Not Sent — Over Power Cap':'No enviada — Sobre el límite de poder',
'Move to Applicants':'Mover a Solicitantes','Remove Member':'Eliminar miembro','Edit Group':'Editar grupo','+ Add Player':'+ Añadir jugador','Delete Group':'Eliminar grupo','Group Name':'Nombre del grupo','Status':'Estado',
'Under Review':'En revisión','Approved':'Aprobado','Main Contact — Game ID':'Contacto principal — ID de juego','Current State':'Estado actual','Group Plan':'Plan del grupo','Not decided yet':'Aún no decidido',
'Merge into existing recruiting alliance':'Integrarse a una alianza de reclutamiento existente','Start / rebuild own alliance':'Iniciar / reconstruir su propia alianza','Recruiting Alliance':'Alianza de Reclutamiento',
'Alliance Tag':'Tag de alianza','Permanent Group Code':'Código permanente del grupo','Save Group':'Guardar grupo','Create Group':'Crear grupo','Add Player':'Añadir jugador','Current Power':'Poder actual',
'Does this player have T12?':'¿Este jugador tiene T12?','Select Furnace Level':'Seleccionar nivel de Horno','Change Username':'Cambiar nombre de usuario','New Username':'Nuevo nombre de usuario','Current NEXA Password':'Contraseña actual de NEXA',
'Save':'Guardar','Create New Form':'Crear formulario nuevo','Protected official form':'Formulario oficial protegido','Custom form':'Formulario personalizado','PROTECTED':'PROTEGIDO','Edit':'Editar','Delete Custom Form?':'¿Eliminar formulario personalizado?',
'Confirm Active Form':'Confirmar formulario activo','Enter your password.':'Introduce tu contraseña.','Sign in to your NEXA account first.':'Primero inicia sesión en tu cuenta de NEXA.','Password incorrect.':'Contraseña incorrecta.',
'DELETE HISTORY':'ELIMINAR HISTORIAL','Delete Transfer Cycle?':'¿Eliminar Ciclo de Transferencia?','Permanently delete this Transfer Cycle from History?':'¿Eliminar permanentemente este Ciclo de Transferencia del Historial?',
'This also permanently deletes Ordinary and Special applicant records attached to that cycle.':'Esto también elimina permanentemente los registros de solicitantes Ordinarios y Especiales vinculados a ese ciclo.','Delete Permanently':'Eliminar permanentemente'
};

const TR={
'Staff Access':'Personel Erişimi','Log In':'Giriş Yap','First Time? Register':'İlk kez mi? Kaydol','Username or Game ID':'Kullanıcı adı veya Oyun Kimliği','Password':'Şifre','Remember me on this device':'Bu cihazda beni hatırla',
'Forgot username?':'Kullanıcı adını mı unuttun?','Forgot password?':'Şifreni mi unuttun?','Register':'Kaydol','Transfer Workspace':'Transfer Çalışma Alanı','Applicants':'Başvuranlar','Integrations':'Entegrasyonlar','Access':'Erişim','History':'Geçmiş',
'Transfer Cycle':'Transfer Döngüsü','Ordinary':'Normal','Special':'Özel','Not Selected':'Seçilmedi','Next Transfer Cycle':'Sonraki Transfer Döngüsü','Groups':'Gruplar','How to use Applicants':'Başvuranlar nasıl kullanılır',
'Search IGN or Game ID':'IGN veya Oyun Kimliği ara','New Applications':'Yeni Başvurular','Application Form':'Başvuru Formu','View Application':'Başvuruyu Görüntüle','Edit Form':'Formu Düzenle','Copy Link':'Bağlantıyı Kopyala',
'Recruiting Alliances':'Transfer Alımlı İttifaklar','Discord Notifications':'Discord Bildirimleri','Transfer Staff':'Transfer Personeli','History & Archive':'Geçmiş ve Arşiv','Transfer Cycles':'Transfer Döngüleri','Applicant Archive':'Başvuran Arşivi',
'Close':'Kapat','Confirm':'Onayla','Cancel':'İptal','Delete':'Sil','Add Alliance':'İttifak Ekle','NEXA Password':'NEXA Şifresi','Change Password':'Şifre Değiştir','Current Password':'Mevcut Şifre','New Password':'Yeni Şifre',
'Confirm New Password':'Yeni Şifreyi Onayla','Copy Code':'Kodu Kopyala','Copied ✓':'Kopyalandı ✓','Yes':'Evet','No':'Hayır','ACTIVE':'AKTİF','INACTIVE':'PASİF','OPEN':'AÇIK','CLOSED':'KAPALI',
'Unassigned':'Atanmamış','Under Review':'İncelemede','Approved':'Onaylandı','Invite Sent':'Davet Gönderildi','Not Sent':'Gönderilmedi','Move to Applicants':'Başvuranlara Taşı','Remove Member':'Üyeyi Kaldır',
'Edit Group':'Grubu Düzenle','Delete Group':'Grubu Sil','Group Name':'Grup Adı','Status':'Durum','Current State':'Mevcut Eyalet','Alliance Tag':'İttifak Etiketi','Save Group':'Grubu Kaydet','Create Group':'Grup Oluştur',
'Add Player':'Oyuncu Ekle','Current Power':'Mevcut Güç','Groups are tracked separately from each player’s classification.':'Gruplar, her oyuncunun sınıflandırmasından ayrı olarak takip edilir.','Transfer Groups':'Transfer Grupları',
'GROUPS':'GRUPLAR','GROUP':'GRUP','Members':'Üyeler','+ Add Group':'+ Grup Ekle','+ Add Player':'+ Oyuncu Ekle','Edit Transfer Form':'Transfer Formunu Düzenle','Furnace Level':'Fırın Seviyesi','Current Total Power':'Mevcut Toplam Güç',
'Transfer Passes':'Transfer Biletleri','Discord Voice':'Discord Ses','Required':'Zorunlu','Preferred':'Tercih edilir','Not necessary':'Gerekli değil','Destination State':'Hedef Eyalet','State Classification':'Eyalet Sınıflandırması',
'Ordinary Power Cap':'Normal Güç Sınırı','Special Invites Available':'Mevcut Özel Davetler','Save Cycle':'Döngüyü Kaydet','Mode':'Mod','Free Pool':'Serbest Havuz','Balanced':'Dengeli','Manual':'Manuel',
'Applicant':'Başvuran','Applicant Detail':'Başvuran Detayı','End Transfer Cycle':'Transfer Döngüsünü Bitir','Type END to continue':'Devam etmek için END yaz','Type CLEAR to continue':'Devam etmek için CLEAR yaz',
'Create New Form':'Yeni Form Oluştur','Edit':'Düzenle','Save':'Kaydet'
};

const KO={
'Staff Access':'스태프 접근','Log In':'로그인','First Time? Register':'처음이신가요? 등록','Username or Game ID':'사용자 이름 또는 게임 ID','Password':'비밀번호','Remember me on this device':'이 기기에서 기억하기',
'Forgot username?':'사용자 이름을 잊으셨나요?','Forgot password?':'비밀번호를 잊으셨나요?','Register':'등록','Transfer Workspace':'이전 워크스페이스','Applicants':'신청자','Integrations':'통합','Access':'접근','History':'기록',
'Transfer Cycle':'이전 주기','Ordinary':'일반','Special':'특별','Not Selected':'선정되지 않음','Next Transfer Cycle':'다음 이전 주기','Groups':'그룹','How to use Applicants':'신청자 사용 방법',
'Search IGN or Game ID':'IGN 또는 게임 ID 검색','New Applications':'새 신청','Application Form':'신청서','View Application':'신청서 보기','Edit Form':'양식 편집','Copy Link':'링크 복사',
'Recruiting Alliances':'모집 연맹','Discord Notifications':'Discord 알림','Transfer Staff':'이전 스태프','History & Archive':'기록 및 보관함','Transfer Cycles':'이전 주기','Applicant Archive':'신청자 보관함',
'Close':'닫기','Confirm':'확인','Cancel':'취소','Delete':'삭제','Add Alliance':'연맹 추가','NEXA Password':'NEXA 비밀번호','Change Password':'비밀번호 변경','Current Password':'현재 비밀번호','New Password':'새 비밀번호',
'Confirm New Password':'새 비밀번호 확인','Copy Code':'코드 복사','Copied ✓':'복사됨 ✓','Yes':'예','No':'아니요','ACTIVE':'활성','INACTIVE':'비활성','OPEN':'열림','CLOSED':'닫힘',
'Unassigned':'미지정','Under Review':'검토 중','Approved':'승인됨','Invite Sent':'초대 전송됨','Not Sent':'미전송','Move to Applicants':'신청자로 이동','Remove Member':'멤버 제거','Edit Group':'그룹 편집','Delete Group':'그룹 삭제',
'Group Name':'그룹 이름','Status':'상태','Current State':'현재 주','Alliance Tag':'연맹 태그','Save Group':'그룹 저장','Create Group':'그룹 생성','Add Player':'플레이어 추가','Current Power':'현재 전투력',
'Groups are tracked separately from each player’s classification.':'그룹은 각 플레이어의 분류와 별도로 추적됩니다.','Transfer Groups':'이전 그룹','GROUPS':'그룹','GROUP':'그룹','Members':'멤버','+ Add Group':'+ 그룹 추가','+ Add Player':'+ 플레이어 추가',
'Edit Transfer Form':'이전 양식 편집','Furnace Level':'용광로 레벨','Current Total Power':'현재 총 전투력','Transfer Passes':'이전 패스','Discord Voice':'Discord 음성','Required':'필수','Preferred':'선호','Not necessary':'필요 없음',
'Destination State':'대상 주','State Classification':'주 분류','Ordinary Power Cap':'일반 전투력 상한','Special Invites Available':'사용 가능한 특별 초대','Save Cycle':'주기 저장','Mode':'모드','Free Pool':'자유 풀','Balanced':'균형','Manual':'수동',
'Applicant':'신청자','Applicant Detail':'신청자 상세','End Transfer Cycle':'이전 주기 종료','Type END to continue':'계속하려면 END를 입력하세요','Type CLEAR to continue':'계속하려면 CLEAR를 입력하세요','Create New Form':'새 양식 만들기','Edit':'편집','Save':'저장'
};

const AR={
'Staff Access':'دخول الطاقم','Log In':'تسجيل الدخول','First Time? Register':'أول مرة؟ سجّل','Username or Game ID':'اسم المستخدم أو معرّف اللعبة','Password':'كلمة المرور','Remember me on this device':'تذكرني على هذا الجهاز',
'Forgot username?':'نسيت اسم المستخدم؟','Forgot password?':'نسيت كلمة المرور؟','Register':'تسجيل','Transfer Workspace':'مساحة عمل الانتقال','Applicants':'المتقدمون','Integrations':'التكاملات','Access':'الوصول','History':'السجل',
'Transfer Cycle':'دورة الانتقال','Ordinary':'عادي','Special':'خاص','Not Selected':'غير مختار','Next Transfer Cycle':'دورة الانتقال التالية','Groups':'المجموعات','How to use Applicants':'كيفية استخدام المتقدمين',
'Search IGN or Game ID':'ابحث بالاسم داخل اللعبة أو معرّف اللعبة','New Applications':'طلبات جديدة','Application Form':'نموذج الطلب','View Application':'عرض الطلب','Edit Form':'تعديل النموذج','Copy Link':'نسخ الرابط',
'Recruiting Alliances':'تحالفات التجنيد','Discord Notifications':'إشعارات Discord','Transfer Staff':'طاقم الانتقال','History & Archive':'السجل والأرشيف','Transfer Cycles':'دورات الانتقال','Applicant Archive':'أرشيف المتقدمين',
'Close':'إغلاق','Confirm':'تأكيد','Cancel':'إلغاء','Delete':'حذف','Add Alliance':'إضافة تحالف','NEXA Password':'كلمة مرور NEXA','Change Password':'تغيير كلمة المرور','Current Password':'كلمة المرور الحالية','New Password':'كلمة مرور جديدة',
'Confirm New Password':'تأكيد كلمة المرور الجديدة','Copy Code':'نسخ الرمز','Copied ✓':'تم النسخ ✓','Yes':'نعم','No':'لا','ACTIVE':'نشط','INACTIVE':'غير نشط','OPEN':'مفتوح','CLOSED':'مغلق',
'Unassigned':'غير معيّن','Under Review':'قيد المراجعة','Approved':'موافق عليه','Invite Sent':'تم إرسال الدعوة','Not Sent':'لم تُرسل','Move to Applicants':'نقل إلى المتقدمين','Remove Member':'إزالة العضو','Edit Group':'تعديل المجموعة','Delete Group':'حذف المجموعة',
'Group Name':'اسم المجموعة','Status':'الحالة','Current State':'الولاية الحالية','Alliance Tag':'وسم التحالف','Save Group':'حفظ المجموعة','Create Group':'إنشاء مجموعة','Add Player':'إضافة لاعب','Current Power':'القوة الحالية',
'Groups are tracked separately from each player’s classification.':'يتم تتبع المجموعات بشكل منفصل عن تصنيف كل لاعب.','Transfer Groups':'مجموعات الانتقال','GROUPS':'المجموعات','GROUP':'المجموعة','Members':'الأعضاء','+ Add Group':'+ إضافة مجموعة','+ Add Player':'+ إضافة لاعب',
'Edit Transfer Form':'تعديل نموذج الانتقال','Furnace Level':'مستوى الفرن','Current Total Power':'إجمالي القوة الحالية','Transfer Passes':'تصاريح الانتقال','Discord Voice':'صوت Discord','Required':'مطلوب','Preferred':'مفضّل','Not necessary':'غير ضروري',
'Destination State':'الولاية الوجهة','State Classification':'تصنيف الولاية','Ordinary Power Cap':'حد القوة العادي','Special Invites Available':'الدعوات الخاصة المتاحة','Save Cycle':'حفظ الدورة','Mode':'الوضع','Free Pool':'مجموعة حرة','Balanced':'متوازن','Manual':'يدوي',
'Applicant':'المتقدم','Applicant Detail':'تفاصيل المتقدم','End Transfer Cycle':'إنهاء دورة الانتقال','Type END to continue':'اكتب END للمتابعة','Type CLEAR to continue':'اكتب CLEAR للمتابعة','Create New Form':'إنشاء نموذج جديد','Edit':'تعديل','Save':'حفظ'
};

const DICTS={es:ES,tr:TR,ko:KO,ar:AR};

function norm(v){
 const x=String(v||'').trim().toLowerCase().replace('_','-');
 if(!x||x==='auto'){const d=String(navigator.language||'en').toLowerCase();return SUPPORTED.find(k=>d===k||d.startsWith(k+'-'))||'en'}
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
 if((m=s.match(/^State (\d+) Transfer Workspace$/)))return lang==='es'?`Workspace de Transferencias del Estado ${m[1]}`:lang==='tr'?`Eyalet ${m[1]} Transfer Çalışma Alanı`:lang==='ko'?`${m[1]}주 이전 워크스페이스`:lang==='ar'?`مساحة عمل انتقال الولاية ${m[1]}`:s;
 if((m=s.match(/^State (\d+) Transfer Cycle$/)))return lang==='es'?`Ciclo de Transferencia del Estado ${m[1]}`:lang==='tr'?`Eyalet ${m[1]} Transfer Döngüsü`:lang==='ko'?`${m[1]}주 이전 주기`:lang==='ar'?`دورة انتقال الولاية ${m[1]}`:s;
 if((m=s.match(/^(\d+) online$/)))return lang==='es'?`${m[1]} en línea`:lang==='tr'?`${m[1]} çevrimiçi`:lang==='ko'?`${m[1]}명 온라인`:lang==='ar'?`${m[1]} متصل`:s;
 if((m=s.match(/^(\d+) member(s)?$/)))return lang==='es'?`${m[1]} miembro${m[1]==='1'?'':'s'}`:lang==='tr'?`${m[1]} üye`:lang==='ko'?`${m[1]}명`:lang==='ar'?`${m[1]} عضو`:s;
 if((m=s.match(/^Custom Question (\d+)$/)))return lang==='es'?`Pregunta personalizada ${m[1]}`:lang==='tr'?`Özel Soru ${m[1]}`:lang==='ko'?`사용자 지정 질문 ${m[1]}`:lang==='ar'?`سؤال مخصص ${m[1]}`:s;
 if((m=s.match(/^(.+) • expires in 30 minutes$/)))return lang==='es'?`${m[1]} • vence en 30 minutos`:lang==='tr'?`${m[1]} • 30 dakika içinde sona erer`:lang==='ko'?`${m[1]} • 30분 후 만료`:lang==='ar'?`${m[1]} • ينتهي خلال 30 دقيقة`:s;
 return s;
}
function tr(s){
 if(lang==='en')return s;
 const clean=String(s||'').trim();if(!clean)return s;
 const d=DICTS[lang]||{},x=d[clean]||pattern(clean);if(x===clean)return s;
 const lead=String(s).match(/^\s*/)?.[0]||'',trail=String(s).match(/\s*$/)?.[0]||'';
 return lead+x+trail;
}
function apply(root=document){
 if(!root||lang==='en')return;
 const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode(n){
  const p=n.parentElement;if(!p||['SCRIPT','STYLE','NOSCRIPT','TEXTAREA'].includes(p.tagName))return NodeFilter.FILTER_REJECT;
  return n.nodeValue?.trim()?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT;
 }});
 const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
 nodes.forEach(n=>{const x=tr(n.nodeValue);if(x!==n.nodeValue)n.nodeValue=x});
 root.querySelectorAll?.('[placeholder],[title],[aria-label]').forEach(el=>['placeholder','title','aria-label'].forEach(a=>{
  if(el.hasAttribute(a)){const old=el.getAttribute(a),x=tr(old);if(x!==old)el.setAttribute(a,x)}
 }));
}
async function boot(){
 await resolve();apply(document);
 if(timer)clearInterval(timer);
 timer=setInterval(()=>apply(document),700);
}
window.NEXA_TRANSFER_WORKSPACE_I18N={apply,tr,getLang:()=>lang,resolve};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
