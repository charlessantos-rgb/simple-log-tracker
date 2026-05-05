const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GATEWAY = "https://connector-gateway.lovable.dev/google_drive";
const FOLDER_NAME = "RNC-Andra-Backups";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const GOOGLE_DRIVE_API_KEY = Deno.env.get("GOOGLE_DRIVE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY não configurada");
    if (!GOOGLE_DRIVE_API_KEY) {
      return new Response(
        JSON.stringify({ ok: false, code: "NOT_CONNECTED", error: "Google Drive ainda não foi conectado. Peça ao administrador para conectar em Admin → Configurações." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { filename, base64, mimeType } = await req.json();
    if (!filename || !base64) throw new Error("filename e base64 são obrigatórios");

    const headers = {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "X-Connection-Api-Key": GOOGLE_DRIVE_API_KEY,
    };

    // 1) Procura/cria a pasta
    const q = encodeURIComponent(`name='${FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`);
    const folderRes = await fetch(`${GATEWAY}/drive/v3/files?q=${q}&fields=files(id,name)`, { headers });
    const folderJson = await folderRes.json();
    if (!folderRes.ok) throw new Error(`Drive list folder [${folderRes.status}]: ${JSON.stringify(folderJson)}`);

    let folderId = folderJson.files?.[0]?.id;
    if (!folderId) {
      const createRes = await fetch(`${GATEWAY}/drive/v3/files`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ name: FOLDER_NAME, mimeType: "application/vnd.google-apps.folder" }),
      });
      const createJson = await createRes.json();
      if (!createRes.ok) throw new Error(`Drive create folder [${createRes.status}]: ${JSON.stringify(createJson)}`);
      folderId = createJson.id;
    }

    // 2) Upload multipart
    const boundary = "----lovableBoundary" + crypto.randomUUID();
    const metadata = { name: filename, parents: [folderId] };
    const fileBytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    const ct = mimeType || "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

    const enc = new TextEncoder();
    const head = enc.encode(
      `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n` +
      `--${boundary}\r\nContent-Type: ${ct}\r\nContent-Transfer-Encoding: binary\r\n\r\n`,
    );
    const tail = enc.encode(`\r\n--${boundary}--`);
    const body = new Uint8Array(head.length + fileBytes.length + tail.length);
    body.set(head, 0); body.set(fileBytes, head.length); body.set(tail, head.length + fileBytes.length);

    const upRes = await fetch(`${GATEWAY}/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink`, {
      method: "POST",
      headers: { ...headers, "Content-Type": `multipart/related; boundary=${boundary}` },
      body,
    });
    const upJson = await upRes.json();
    if (!upRes.ok) throw new Error(`Drive upload [${upRes.status}]: ${JSON.stringify(upJson)}`);

    return new Response(JSON.stringify({ ok: true, file: upJson, folderId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("backup-drive error:", msg);
    return new Response(JSON.stringify({ ok: false, error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
