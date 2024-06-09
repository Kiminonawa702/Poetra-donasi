process.on('uncaughtException', console.error);
const { default: KUNTUL, useMultiFileAuthState, PHONENUMBER_MCC, DisconnectReason, makeInMemoryStore, getContentType } = (await import('baileys')).default;
import { Boom } from '@hapi/boom';
import p from 'pino';
import cfonts from 'cfonts';
import cuy from './config.js';
import { connect } from './server.js';
import chalk from "chalk"
import NodeCache from 'node-cache'

const log = p({ level: 'silent' });
  
cfonts.say('auto-read-sw\nby-wily-kun', {// Ubah saja cuii ;v
	font: 'tiny',       
	align: 'center',
	colors: ['system'],
	background: 'transparent', 
	letterSpacing: 1,
	lineHeight: 1,
	space: true,
	maxLength: '0',
	gradient: false,
	independentGradient: false,
	transitionGradient: false,
	env: 'node'
});
const j = async (u, c, q) => {
	const { lastDisconnect, connection } = u
   try {
      if (connection == 'close') {
      	if (new Boom(lastDisconnect.error ).output?.statusCode === DisconnectReason.loggedOut) q() 
      	else q()
      } else if (connection == 'open') {
			console.log("Tersambung ke Koneksi whatsapp...");
      }
   } catch (e) {
   	console.log('')
   }
};
const h = async (u, c) => {
	try {
		let m = u.messages[0]
		const ftrol = { key : { remoteJid: 'status@broadcast', participant : '0@s.whatsapp.net' }, message: { orderMessage: { itemCount : 2022, status: 1, surface : 1, message: cuy.name,  orderTitle: `Helo bng`, thumbnail: '', sellerJid: '0@s.whatsapp.net' } } }
		if (!m) return
		if (m.key.remoteJid === 'status@broadcast') {
			if (!cuy.autoread) return
			setTimeout(() => {
				c.readMessages([m.key])
				let mt = getContentType(m.message)
				console.log((/protocolMessage/i.test(mt)) ? `Telah Menghapus Story Nya User : ${m.key.participant.split('@')[0]}` : 'Telah Melihat Story Nya User : '+m.key.participant.split('@')[0]);
			}, cuy.faston);
		}
	} catch (e) {
		console.log('');
	}
}
const start = async () => {
	try {
	      const store = makeInMemoryStore({ logger: p().child({ level: 'silent', stream: 'store' }) })
		const { state, saveCreds } = await useMultiFileAuthState('WilyKun');
		const msgRetryCounterCache = new NodeCache()
		const config = {
			browser: ['Linux', 'Chrome', ''],
            version: [2, 2413, 51],
            pairingCode: true, 
            markOnlineOnConnect: false,
			logger: log,
			auth: state,
			getMessage: async (key) => {
            if (store) {
                const msg = await store.loadMessage(key.remoteJid, key.id)
                return msg.message || undefined
            }
            return {
                conversation: "bot"
	   }
	},
		      msgRetryCounterCache,
		      connectTimeoutMs: 60000,
    defaultQueryTimeoutMs: 0,
    keepAliveIntervalMs: 10000,
    emitOwnEvents: true,
    fireInitQueries: true,
    generateHighQualityLinkPreview: true,
    syncFullHistory: true,
    markOnlineOnConnect: true
		}
		let client = KUNTUL(config);
		
		if (!client.authState.creds.registered) {

    let phoneNumber
        phoneNumber = cuy.pairingNumber.replace(/[^0-9]/g, '')
        if (!Object.keys(PHONENUMBER_MCC).some(v => phoneNumber.startsWith(v))) {
            console.log(chalk.bgBlack(chalk.redBright("Mulailah dengan kode WhatsApp negara Anda, Contoh : 62xxx")))
            process.exit(0)
        }
        
        setTimeout(async () => {
        let code = await client.requestPairingCode(phoneNumber)
        code = code?.match(/.{1,4}/g)?.join("-") || code
        console.log(chalk.yellow(chalk.bgRed(`Your Pairing Code : `)), chalk.black(chalk.white(code)))
}, 3000)
}
		store.bind(client.ev)
		client.ev.on('connection.update', async (up) => j(up, client, start));
		client.ev.on('messages.upsert', async (up) => h(up, client));
		client.ev.on('creds.update', saveCreds);
	} catch (e) {
		console.log(e);
	}
};
start()
