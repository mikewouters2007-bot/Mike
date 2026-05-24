const {
    SlashCommandBuilder
} = require('discord.js');

const db = require('../db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mijnlog')
        .setDescription('Bekijk je eigen registraties'),

    async execute(interaction) {

        const gebruiker = interaction.user.tag;

        const rows = db.prepare(`
            SELECT * FROM logs
            WHERE gebruiker = ?
            ORDER BY id DESC
            LIMIT 10
        `).all(gebruiker);

        if (!rows.length) {
            return interaction.reply('Geen registraties.');
        }

        const tekst = rows.map(r =>
            `${r.datum} | ${r.naam} | ${r.type} | ${r.dealer}`
        ).join('\n');

        await interaction.reply({
            content: `📋 Jouw log:\n${tekst}`
        });
    }
};