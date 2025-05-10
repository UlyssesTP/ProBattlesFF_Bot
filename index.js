const { default: makeWASocket, DisconnectReason, useMultiFileAuthState } = require("@whiskeysockets/baileys");
const fs = require("fs");
const path = require("path");

const RULES_FILE = "reglas.txt";
const EVENTS_FILE = "eventos.txt";
const GROUPS_FILE = "grupos.txt";

const welcomeImageUrl = "https://i.ibb.co/6YkVfS1/welcome-image.jpg"; // Puedes cambiar esta URL por una propia

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("auth");
    const sock = makeWASocket({ auth: state });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("messages.upsert", async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message || msg.key.fromMe) return;
        const from = msg.key.remoteJid;
        const isGroup = from.endsWith("@g.us");
        const sender = msg.key.participant || msg.key.remoteJid;
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || "";

        if (text.startsWith("!reglas")) {
            const reglas = fs.existsSync(RULES_FILE) ? fs.readFileSync(RULES_FILE, "utf-8") : "No hay reglas configuradas.";
            await sock.sendMessage(from, { text: `Reglas del grupo:

${reglas}` });
        }

        if (text.startsWith("!eventos")) {
            const eventos = fs.existsSync(EVENTS_FILE) ? fs.readFileSync(EVENTS_FILE, "utf-8") : "No hay eventos disponibles.";
            await sock.sendMessage(from, { text: `Eventos programados:

${eventos}` });
        }

        if (text.startsWith("!activo")) {
            await sock.sendMessage(from, { text: `Has sido registrado como miembro activo. — ProBattlesFF` });
        }

        if (text.startsWith("!reportar")) {
            if (!text.includes("@") || text.split(" ").length < 3) {
                await sock.sendMessage(from, { text: `Uso incorrecto. Ejemplo: !reportar @usuario motivo` });
                return;
            }
            // Aquí deberías agregar lógica para enviar reporte a los admins
            await sock.sendMessage(from, { text: `Reporte enviado a los administradores. — ProBattlesFF` });
        }
    });

    sock.ev.on("group-participants.update", async ({ id, participants, action }) => {
        if (action === "add") {
            for (let user of participants) {
                await sock.sendMessage(id, {
                    image: { url: welcomeImageUrl },
                    caption: `Bienvenido al grupo!
Lee las reglas y usa !activo para registrarte. — ProBattlesFF`,
                    mentions: [user]
                });
            }
        }
    });
}

startBot();
