const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription('Bekijk jouw stats'),

    async execute(interaction) {

        const gebruiker = interaction.user.tag;

        const rows = db.prepare(`
            SELECT * FROM logs
            WHERE gebruiker = ?
        `).all(gebruiker);

        const witwasRows = rows.filter(r => r.type === 'witwas');
        const ammoRows = rows.filter(r => r.type === 'ammo');
        const wapensRows = rows.filter(r => r.type === 'wapens');
        const inkoopRows = rows.filter(r => r.type === 'inkoop');

        const sum = (arr) =>
            arr.reduce((t, r) => t + (Number(r.bedrag) || 0), 0);

        const witwasBedrag = sum(witwasRows);
        const ammoBedrag = sum(ammoRows);
        const wapensBedrag = sum(wapensRows);
        const inkoopBedrag = sum(inkoopRows);

        const witwasCount = witwasRows.length;
        const ammoCount = ammoRows.length;
        const wapensCount = wapensRows.length;
        const inkoopCount = inkoopRows.length;

        const totaalActies = rows.length;

        const embed = new EmbedBuilder()
            .setTitle('📊 Jouw Stats')
            .setColor('DarkRed')
            .addFields(
                { 
                    name: 'Totaal acties', 
                    value: `🔢 ${totaalActies}`, 
                    inline: false 
                },

                { 
                    name: '🧼 Witwas', 
                    value: `🔢 ${witwasCount} | 💰 €${witwasBedrag}`, 
                    inline: true 
                },

                { 
                    name: '🔫 Ammo', 
                    value: `🔢 ${ammoCount} | 💰 €${ammoBedrag}`, 
                    inline: true 
                },

                { 
                    name: '🔫 Wapens', 
                    value: `🔢 ${wapensCount} | 💰 €${wapensBedrag}`, 
                    inline: true 
                },

                { 
                    name: '📦 Inkoop', 
                    value: `🔢 ${inkoopCount} | 💰 €${inkoopBedrag}`, 
                    inline: true 
                }
            );

        await interaction.reply({ embeds: [embed] });
    }
};