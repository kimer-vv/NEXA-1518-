NEXA v31 — Transfer Application Rebuilt From Scratch

Only the PUBLIC Transfer Application engine was rebuilt.
The visual form/questions remain the same.

Verified backend before rebuild:
- Transfer Event token resolves correctly.
- ABS is saved is_recruiting=true.
- get_public_transfer_form_data(token) returns ABS and its UTC schedules.

New form engine:
1. Makes ONE load call: get_public_transfer_form_data(token).
2. Renders Recruiting Alliances directly from that response.
3. No refresh button / no layered legacy loaders.
4. No browser-global ID assumptions.
5. No dependency on Transfer Admin or View Event JavaScript.
6. Submit uses submit_transfer_application(token,payload).
7. Old versioned transfer-apply URLs are overwritten with the same v31 form.

No SQL required.
