const {
    SlashCommandBuilder
} = require('discord.js');

const db = require('../db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('alles')
        .setDescription('Council overzicht'),

    async execute(interaction) {

        const roleName =
            process.env.COUNCIL_ROLE;

        const hasRole =
            interaction.member.roles.cache
                .some(r => r.name === roleName);

        if (!hasRole) {
            return interaction.reply({
                content: 'Geen permissie.',
                ephemeral: true
            });
        }

        const rows = db.prepare(`
            SELECT * FROM logs
            ORDER BY id DESC
            LIMIT 20
        `).all();

        if (!rows.length) {
            return interaction.reply('Geen registraties.');
        }

        const tekst = rows.map(r =>
            `${r.naam} | ${r.type} | ${r.dealer} | ${r.gebruiker} | ${r.bedrag} euro`
        ).join('\n');

        await interaction.reply({
            content: `📋 Alle registraties:\n${tekst}`
        });
    }
};