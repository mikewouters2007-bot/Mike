const {
    SlashCommandBuilder,
    EmbedBuilder
} = require('discord.js');

const db = require('../db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('registreer')
        .setDescription('Nieuwe registratie maken')
        .addStringOption(option =>
            option.setName('naam')
                .setDescription('Naam')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Type')
                .setRequired(true)
                .addChoices(
                    { name: 'Ammo', value: 'ammo' },
                    { name: 'Witwas', value: 'witwas' },
                    { name: 'Inkoop', value: 'inkoop' },
                    { name: 'Wapens', value: 'wapens' }
                ))
        .addStringOption(option =>
            option.setName('dealer')
                .setDescription('Dealer')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('bedrag')
                .setDescription('Bedrag / aantal')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('notitie')
                .setDescription('Notitie')
                .setRequired(false)),

    async execute(interaction) {

        const naam = interaction.options.getString('naam');
        const type = interaction.options.getString('type');
        const dealer = interaction.options.getString('dealer');
        const bedrag = interaction.options.getString('bedrag');
        const notitie =
            interaction.options.getString('notitie') || '-';

        const gebruiker = interaction.user.tag;
        const datum = new Date().toLocaleString('nl-BE');

        db.prepare(`
            INSERT INTO logs
            (naam, type, dealer, bedrag, notitie, gebruiker, datum)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(
            naam,
            type,
            dealer,
            bedrag,
            notitie,
            gebruiker,
            datum
        );

        const embed = new EmbedBuilder()
            .setTitle('☠ Sons Of Defiance Registratie')
            .addFields(
                { name: 'Naam', value: naam, inline: true },
                { name: 'Type', value: type, inline: true },
                { name: 'Dealer', value: dealer, inline: true },
                { name: 'Bedrag', value: bedrag, inline: true },
                { name: 'Notitie', value: notitie, inline: false },
                { name: 'Geregistreerd door', value: gebruiker }
            )
            .setColor('DarkRed');

        await interaction.reply({
            embeds: [embed]
        });
    }
};