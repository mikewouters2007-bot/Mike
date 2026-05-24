const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('weekstats')
        .setDescription('Overzicht per persoon (laatste 7 dagen)'),

    async execute(interaction) {

        try {

            const rows = db.prepare(`
                SELECT * FROM logs
            `).all();

            // helper: parse bedrag veilig
            const parseBedrag = (b) => {
                const num = parseFloat(String(b).replace('€', '').replace(',', '.'));
                return isNaN(num) ? 0 : num;
            };

            // datum check (7 dagen terug)
            const now = Date.now();
            const zevenDagenMs = 7 * 24 * 60 * 60 * 1000;

            const recentRows = rows.filter(r => {
                if (!r.datum) return false;

                const d = new Date(r.datum);
                if (isNaN(d.getTime())) return false;

                return now - d.getTime() <= zevenDagenMs;
            });

            if (!recentRows.length) {
                return interaction.reply({
                    content: 'Geen data in de laatste 7 dagen.',
                    flags: 64
                });
            }

            const stats = {};

            for (const r of recentRows) {

                const user = r.gebruiker;
                const type = r.type;

                if (!stats[user]) {
                    stats[user] = {
                        witwas: { count: 0, totaal: 0 },
                        ammo: { count: 0, totaal: 0 },
                        wapens: { count: 0, totaal: 0 },
                        inkoop: { count: 0, totaal: 0 }
                    };
                }

                if (stats[user][type]) {
                    stats[user][type].count++;
                    stats[user][type].totaal += parseBedrag(r.bedrag);
                }
            }

            const embed = new EmbedBuilder()
                .setTitle('📊 Weekstats (laatste 7 dagen)')
                .setColor('DarkRed');

            for (const [user, d] of Object.entries(stats)) {

                const totaal =
                    d.witwas.totaal +
                    d.ammo.totaal +
                    d.wapens.totaal +
                    d.inkoop.totaal;

                embed.addFields({
                    name: user,
                    value:
                        `🧼 Witwas: ${d.witwas.count}x | €${d.witwas.totaal}\n` +
                        `🔫 Ammo: ${d.ammo.count}x | €${d.ammo.totaal}\n` +
                        `🔫 Wapens: ${d.wapens.count}x | €${d.wapens.totaal}\n` +
                        `📦 Inkoop: ${d.inkoop.count}x | €${d.inkoop.totaal}\n\n` +
                        `💰 **Totaal: €${totaal}**`,
                    inline: false
                });
            }

            return interaction.reply({ embeds: [embed] });

        } catch (err) {
            console.error('weekstats error:', err);

            if (!interaction.replied) {
                return interaction.reply({
                    content: 'Er ging iets mis bij weekstats.',
                    flags: 64
                });
            }
        }
    }
};