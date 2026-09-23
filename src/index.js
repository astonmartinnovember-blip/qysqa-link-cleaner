const TRACKING_PARAMS = [
  /^utm_/i,
  /^fbclid$/i,
  /^gclid$/i,
  /^dclid$/i,
  /^msclkid$/i,
  /^mc_cid$/i,
  /^mc_eid$/i,
  /^_ga$/i,
  /^_gl$/i,
  /^yclid$/i,
  /^vero_id$/i,
  /^wickedid$/i,
  /^oly_anon_id$/i,
  /^oly_enc_id$/i
];

function isTrackingParam(name) {
  return TRACKING_PARAMS.some((re) => re.test(name));
}

function cleanUrl(raw) {
  const input = String(raw || '').trim();

  if (!input) {
    throw new Error('Сілтеме енгізілмеді.');
  }

  const normalized = /^https?:\/\//i.test(input)
    ? input
    : `https://${input}`;

  const url = new URL(normalized);

  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error('Тек http және https сілтемелері қолдау табады.');
  }

  const removed = [];

  for (const key of [...url.searchParams.keys()]) {
    if (isTrackingParam(key)) {
      removed.push(key);
      url.searchParams.delete(key);
    }
  }

  return {
    clean: url.toString(),
    removed
  };
}

function slugify(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
}

function randomSlug(length = 7) {
  const alphabet = 'abcdefghjkmnpqrstuvwxyz23456789';
  const bytes = new Uint8Array(length);

  crypto.getRandomValues(bytes);

  return [...bytes]
    .map((b) => alphabet[b % alphabet.length])
    .join('');
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store'
    }
  });
}

function page() {
  return `<!doctype html>
<html lang="kk">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />

<title>Qysqa — сілтемені тазарту және қысқарту</title>

<meta
  name="description"
  content="Сілтемені tracking параметрлерінен тазарт, қысқарт және QR-код жаса."
/>

<style>
:root{
  --bg:#0b0d12;
  --card:#121621;
  --line:#252b39;
  --text:#f7f8fb;
  --muted:#9aa3b5;
  --accent:#7c5cff;
  --ok:#5ee19b;
  --bad:#ff7b8a;
}

*{
  box-sizing:border-box;
}

body{
  margin:0;
  font-family:Inter,ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,sans-serif;
  background:radial-gradient(circle at top,#151a27 0,#0b0d12 45%);
  color:var(--text);
  min-height:100vh;
}

.wrap{
  max-width:860px;
  margin:0 auto;
  padding:28px 18px 60px;
}

.brand{
  display:flex;
  align-items:center;
  gap:12px;
  margin-bottom:44px;
}

.logo{
  width:42px;
  height:42px;
  border-radius:14px;
  background:linear-gradient(135deg,#9a84ff,#5a3fff);
  display:grid;
  place-items:center;
  font-weight:900;
  font-size:20px;
  box-shadow:0 14px 40px #6b4dff33;
}

.brand b{
  font-size:20px;
}

.brand span{
  color:var(--muted);
  font-size:13px;
}

.hero{
  text-align:center;
  margin-bottom:26px;
}

.hero h1{
  font-size:clamp(36px,7vw,68px);
  line-height:.98;
  margin:0 0 18px;
  letter-spacing:-.05em;
}

.hero p{
  color:var(--muted);
  font-size:17px;
  max-width:620px;
  margin:0 auto;
}

.card{
  background:#121621e6;
  border:1px solid var(--line);
  border-radius:24px;
  padding:18px;
  box-shadow:0 20px 70px #0006;
  backdrop-filter:blur(10px);
}

label{
  display:block;
  font-size:13px;
  color:#c5ccda;
  margin:0 0 8px;
}

.row{
  display:grid;
  grid-template-columns:1fr 180px;
  gap:12px;
}

.field{
  margin-bottom:14px;
}

input{
  width:100%;
  border:1px solid #2c3445;
  background:#0d111a;
  color:#fff;
  border-radius:14px;
  padding:14px 15px;
  font-size:15px;
  outline:none;
}

input:focus{
  border-color:#7c5cff;
  box-shadow:0 0 0 3px #7c5cff22;
}

.btn{
  border:0;
  border-radius:14px;
  padding:14px 18px;
  background:linear-gradient(135deg,#8b73ff,#6245f4);
  color:white;
  font-weight:800;
  font-size:15px;
  cursor:pointer;
  width:100%;
}

.btn:disabled{
  opacity:.6;
  cursor:wait;
}

.secondary{
  background:#1a2030;
  border:1px solid #30394d;
}

.status{
  margin-top:14px;
  padding:13px 14px;
  border-radius:14px;
  background:#0d111a;
  border:1px solid var(--line);
  color:var(--muted);
  display:none;
}

.status.show{
  display:block;
}

.status.ok{
  border-color:#285f47;
  color:#baf5d4;
}

.status.err{
  border-color:#6c3039;
  color:#ffd0d6;
}

.result{
  display:none;
  margin-top:18px;
}

.result.show{
  display:block;
}

.result-grid{
  display:grid;
  grid-template-columns:1fr 180px;
  gap:14px;
}

.box{
  background:#0d111a;
  border:1px solid var(--line);
  border-radius:18px;
  padding:15px;
}

.kicker{
  font-size:12px;
  text-transform:uppercase;
  letter-spacing:.08em;
  color:var(--muted);
  margin-bottom:7px;
}

.biglink{
  font-weight:800;
  font-size:18px;
  word-break:break-all;
}

.clean{
  font-size:13px;
  color:#bac2d2;
  word-break:break-all;
}

.tags{
  display:flex;
  flex-wrap:wrap;
  gap:7px;
  margin-top:10px;
}

.tag{
  font-size:12px;
  padding:6px 9px;
  border-radius:999px;
  background:#1a2030;
  color:#c9d0dd;
}

.tag.ok{
  background:#163326;
  color:#aef0ca;
}

.qr{
  display:flex;
  align-items:center;
  justify-content:center;
  min-height:180px;
}

.qr img{
  width:160px;
  height:160px;
  background:white;
  border-radius:12px;
  padding:8px;
}

.actions{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:10px;
  margin-top:12px;
}

.mini{
  color:var(--muted);
  font-size:12px;
  margin-top:8px;
}

@media(max-width:650px){

  .row,
  .result-grid{
    grid-template-columns:1fr;
  }

  .actions{
    grid-template-columns:1fr;
  }

  .brand{
    margin-bottom:34px;
  }

  .wrap{
    padding-top:20px;
  }

  .hero h1{
    font-size:44px;
  }

  .qr{
    min-height:auto;
  }
}
</style>
</head>

<body>

<div class="wrap">

  <div class="brand">
    <div class="logo">Q</div>

    <div>
      <b>Qysqa</b><br>
      <span>тазарт • қысқарт • бөліс</span>
    </div>
  </div>

  <section class="hero">

    <h1>
      Сілтемені тазарт.<br>
      Қысқарт. Бөліс.
    </h1>

    <p>
      Tracking параметрлерін алып тастаймыз,
      қысқа сілтеме жасаймыз және QR-код береміз.
    </p>

  </section>

  <section class="card">

    <div class="field">
      <label>Сілтемені енгіз</label>

      <input
        id="url"
        placeholder="https://example.com/product?utm_source=instagram..."
        autocomplete="off"
      />
    </div>

    <div class="row">

      <div class="field">

        <label>
          Қысқа атау (міндетті емес)
        </label>

        <input
          id="slug"
          placeholder="my-link"
          maxlength="40"
          autocomplete="off"
        />

      </div>

      <div class="field">

        <label>&nbsp;</label>

        <button
          class="btn"
          id="go"
        >
          Тазарту және қысқарту
        </button>

      </div>

    </div>

    <div
      class="status"
      id="status"
    ></div>

    <div
      class="result"
      id="result"
    >

      <div class="result-grid">

        <div class="box">

          <div class="kicker">
            Қысқа сілтеме
          </div>

          <div
            class="biglink"
            id="short"
          ></div>

          <div class="actions">

            <button
              class="btn secondary"
              id="copy"
            >
              Көшіру
            </button>

            <button
              class="btn secondary"
              id="open"
            >
              Ашу
            </button>

          </div>

          <hr
            style="
              border:0;
              border-top:1px solid var(--line);
              margin:16px 0
            "
          >

          <div class="kicker">
            Тазартылған сілтеме
          </div>

          <div
            class="clean"
            id="clean"
          ></div>

          <div
            class="tags"
            id="tags"
          ></div>

          <div
            class="mini"
            id="meta"
          ></div>

        </div>

        <div class="box qr">

          <img
            id="qr"
            alt="QR code"
          />

        </div>

      </div>

    </div>

  </section>

</div>

<script>

const $ = id => document.getElementById(id);

const btn = $('go');
const status = $('status');
const result = $('result');

function setStatus(msg,type=''){

  status.textContent = msg;

  status.className =
    'status show ' + type;

}

btn.onclick = async () => {

  const url =
    $('url').value.trim();

  const slug =
    $('slug').value.trim();

  if(!url){

    setStatus(
      'Алдымен сілтемені енгіз.',
      'err'
    );

    return;

  }

  btn.disabled = true;

  btn.textContent =
    'Өңделіп жатыр...';

  result.classList.remove('show');

  try{

    const r = await fetch(
      '/api/shorten',
      {
        method:'POST',

        headers:{
          'content-type':
            'application/json'
        },

        body:JSON.stringify({
          url,
          slug
        })
      }
    );

    const d =
      await r.json();

    if(!r.ok){

      throw new Error(
        d.error ||
        'Қате шықты'
      );

    }

    $('short').textContent =
      d.shortUrl;

    $('clean').textContent =
      d.cleanUrl;

    $('qr').src =
      'https://api.qrserver.com/v1/create-qr-code/?size=220x220&data='
      +
      encodeURIComponent(
        d.shortUrl
      );

    $('tags').innerHTML = '';

    const secure =
      document.createElement('span');

    secure.className =
      'tag ok';

    secure.textContent =
      d.https
      ? 'HTTPS ✓'
      : 'HTTP';

    $('tags').appendChild(
      secure
    );

    const host =
      document.createElement('span');

    host.className =
      'tag';

    host.textContent =
      d.host;

    $('tags').appendChild(
      host
    );

    if(d.removed.length){

      const removed =
        document.createElement('span');

      removed.className =
        'tag';

      removed.textContent =
        'Tracking параметрлері жойылды: '
        +
        d.removed.length;

      $('tags').appendChild(
        removed
      );

    }

    $('meta').textContent =
      d.reduction > 0
      ? `Сілтеме ${d.reduction}% ықшамдалды.`
      : 'Tracking параметрлері табылмады.';

    $('copy').onclick =
      async () => {

        await navigator.clipboard.writeText(
          d.shortUrl
        );

        $('copy').textContent =
          'Көшірілді ✓';

        setTimeout(
          () =>
            $('copy').textContent =
              'Көшіру',
          1200
        );

      };

    $('open').onclick =
      () =>
        window.open(
          d.shortUrl,
          '_blank',
          'noopener'
        );

    result.classList.add(
      'show'
    );

    setStatus(
      'Дайын. Қысқа сілтеме жұмыс істейді.',
      'ok'
    );

  }
  catch(e){

    setStatus(
      e.message ||
      'Қате шықты',
      'err'
    );

  }
  finally{

    btn.disabled =
      false;

    btn.textContent =
      'Тазарту және қысқарту';

  }

};

</script>

</body>
</html>`;
}

export default {

  async fetch(request, env) {

    const url =
      new URL(request.url);

    if(
      request.method === 'GET'
      &&
      url.pathname === '/'
    ){

      return new Response(
        page(),
        {
          headers:{
            'content-type':
              'text/html; charset=utf-8'
          }
        }
      );

    }

    if(
      request.method === 'POST'
      &&
      url.pathname === '/api/shorten'
    ){

      try{

        if(!env.LINKS){

          return json(
            {
              error:
                'KV storage байланыспаған.'
            },
            500
          );

        }

        const body =
          await request.json();

        const result =
          cleanUrl(body.url);

        const destination =
          new URL(result.clean);

        let slug =
          slugify(body.slug);

        if(!slug){

          slug =
            randomSlug();

        }

        if(
          ['api','favicon.ico']
          .includes(slug)
        ){

          return json(
            {
              error:
                'Бұл атауды қолдануға болмайды.'
            },
            400
          );

        }

        const existing =
          await env.LINKS.get(
            slug
          );

        if(
          existing
          &&
          existing !== result.clean
        ){

          return json(
            {
              error:
                'Бұл қысқа атау бос емес. Басқасын таңда.'
            },
            409
          );

        }

        await env.LINKS.put(
          slug,
          result.clean
        );

        const shortUrl =
          \`\${url.origin}/\${slug}\`;

        const originalLength =
          String(body.url).length;

        const reduction =
          originalLength > 0
          ? Math.max(
              0,
              Math.round(
                (
                  1 -
                  result.clean.length /
                  originalLength
                )
                *
                100
              )
            )
          : 0;

        return json({

          shortUrl,

          cleanUrl:
            result.clean,

          removed:
            result.removed,

          host:
            destination.hostname,

          https:
            destination.protocol
            ===
            'https:',

          reduction

        });

      }
      catch(e){

        return json(
          {
            error:
              e?.message ||
              'Сілтеме дұрыс емес.'
          },
          400
        );

      }

    }

    if(
      request.method === 'GET'
    ){

      const slug =
        slugify(
          url.pathname
            .replace(/^\\/+/, '')
        );

      if(slug){

        const destination =
          await env.LINKS?.get(
            slug
          );

        if(destination){

          return Response.redirect(
            destination,
            302
          );

        }

      }

    }

    return new Response(
      'Not found',
      {
        status:404
      }
    );

  }

};
