const { Client } = require('discord.js');
const client = new Client();

// konsol log
client.once('ready', () => {
	const date = new Date();
	const Months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
	console.log(`Bot aktif | ${date.getHours()}:${date.getMinutes()}, ${date.getDate()} ${Months[date.getMonth()]}`);
});

// token buraya
client.login('xxxxx');

const countries = require("i18n-iso-countries");
const srcds_a2s = require('srcds-a2s');
const geoip = require('geoip-country');

const MapNames = {
	'ar_baggage': 'Baggage',
	'ar_dizzy': 'Dizzy',
	'ar_lunacy': 'Lunacy',
	'ar_monastery': 'Monastery',
	'ar_shoots': 'Shoots',
	'cs_agency': 'Agency',
	'cs_assault': 'Assault',
	'cs_italy': 'Italy',
	'cs_militia': 'militia',
	'cs_office': 'Office',
	'de_anubis': 'Anubis',
	'de_bank': 'Bank',
	'de_cache': 'Cache',
	'de_cbble': 'Cobblestone',
	'de_chlorine': 'Chlorine',
	'de_dust2': 'Dust II',
	'de_inferno': 'Inferno',
	'de_lake': 'Lake',
	'de_mirage': 'Mirage',
	'de_nuke': 'Nuke',
	'de_overpass': 'Overpass',
	'de_safehouse': 'Safehouse',
	'de_shortdust': 'Shortdust',
	'de_shortnuke': 'Shortnuke',
	'de_stmarc': 'St. Marc',
	'de_sugarcane': 'Sugarcane',
	'de_train': 'Train',
	'de_vertigo': 'Vertigo',
	'dz_blacksite': 'Blacksite',
	'dz_junglety': 'Junglety',
	'dz_sirocco': 'Sirocco',
	'gd_cbble': 'Cobblestone',
	'gd_rialto': 'Rialto'
}

const mapImages = {
	'cs_italy': 'https://github.com/HridayHS/csgo-bot-assets/raw/master/cs_italy.png',
	'cs_office': 'https://github.com/HridayHS/csgo-bot-assets/raw/master/cs_office.png',
	'de_dust2': 'https://github.com/HridayHS/csgo-bot-assets/raw/master/de_dust2.jpg',
	'de_dust2_dusk': 'https://github.com/HridayHS/csgo-bot-assets/raw/master/de_dust2.jpg',
	'de_inferno': 'https://github.com/HridayHS/csgo-bot-assets/raw/master/de_inferno.jpg',
	'de_mirage': 'https://github.com/HridayHS/csgo-bot-assets/raw/master/de_mirage.jpg',
	'de_mirage_ce': 'https://github.com/HridayHS/csgo-bot-assets/raw/master/de_mirage.jpg',
	'de_overpass': 'https://github.com/HridayHS/csgo-bot-assets/raw/master/de_overpass.jpg',
};

function getMessageEmbed(ip, port, serverName, country, map, numPlayers, maxPlayers, date) {
	return {
		author: {
			name: serverName,
			icon_url: 'https://raw.githubusercontent.com/HridayHS/csgo-bot-assets/master/author_icon.webp'
		},
		color: 'GREEN',
		description: `steam://connect/${ip}:${port}`,
		fields: [
			{ name: 'Harita', value: MapNames[map] || map, inline: true },
			{ name: 'Oyuncular', value: `${numPlayers}/${maxPlayers}`, inline: true },
		],
		footer: {
			text: `Son yenileme: ${date.getDate()}/${date.getMonth()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
		}
	};
}

client.on('message', async (message) => {
	const messageContent = message.content.toLowerCase();
	const commandReceived = messageContent.split(' ')[1];

	switch (true) {
		case message.channel.type !== 'dm' && !message.guild.me.permissions.has(['SEND_MESSAGES']):
		case message.author.bot:
		case message.author.id !== '575714142082564107':
			return;
	}

	if (messageContent.startsWith('.sunucu')) {
		const [ip, port] = commandReceived.split(':');
		if (!port) {
			message.reply('Port girmedin!');
			return;
		}

		const date = new Date();
		const { serverName, map, numPlayers, maxPlayers } = await srcds_a2s.info(ip, port).catch(console.error);
		const { country } = geoip.lookup(ip);

		const MessageEmbed = getMessageEmbed(ip, port, serverName, country, map, numPlayers, maxPlayers, date);

		if (mapImages[map]) {
			MessageEmbed.image = {
				url: mapImages[map]
			}
		}

		const infoMessage = message.channel.send({ embed: MessageEmbed });

		// Loop
		const messageUpdateLoop = setInterval(async () => {
			const date = new Date();
			const { serverName, map, numPlayers, maxPlayers } = await srcds_a2s.info(ip, port);
			const { country } = geoip.lookup(ip);

			const MessageEmbed = getMessageEmbed(ip, port, serverName, country, map, numPlayers, maxPlayers, date);

			if (mapImages[map]) {
				MessageEmbed.image = {
					url: mapImages[map]
				}
			}

			(await infoMessage).edit({ embed: MessageEmbed })
				.catch(() => {
					clearInterval(messageUpdateLoop);
				})
		}, 10000);
	}
});